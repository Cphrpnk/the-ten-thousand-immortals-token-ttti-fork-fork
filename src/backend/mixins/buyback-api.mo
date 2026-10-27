import Set "mo:core/Set";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/buyback";
import RetryTypes "../types/retry";
import TreasuryLib "../lib/treasury";
import OracleLib "../lib/oracle";
import IcrcLib "../lib/icrc";
import PayTokenLib "../lib/pay-token";
import BuybackLib "../lib/buyback";

// TTTI-T buyback from the caller's aggregated mass in one payment token, by
// percentage of the remainder, requested by the buyer and executed
// automatically. TTTI-T go to the admin account; the returned token comes
// from the admin's capped, expiring ICRC-2 approval. One buyback at a time per
// (buyer, mass token), locked before any await.
mixin (
  buybacks : Types.BuybackStore,
  buybacksInFlight : Set.Set<Text>,
  treasury : TreasuryLib.TreasuryStore,
  ledger : IcrcLib.Ledger,
  oracle : OracleLib.OracleStore,
  tokenRates : OracleLib.TokenRateStore,
  accessControlState : AccessControl.AccessControlState,
  canister : Principal,
  retry : RetryTypes.RetryStore,
  // sale.salesPaused blocks requestBuyback, retryBuybackPayout and cancelBuyback.
  sale : { var salesPaused : Bool },
) {
  func requireBuybackAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
  };

  func contractAccount() : Types.Account = { owner = canister; subaccount = null };

  func payoutContext() : BuybackLib.PayoutContext = {
    store = buybacks;
    inFlight = buybacksInFlight;
    ledger;
    canister;
    retry;
  };

  // The caller's masses (ICP, ckBTC, ckUSDC, ckUSDT) with at least one
  // eligible purchase, including fully bought back ones (remainingTtti = 0).
  public shared query ({ caller }) func listMyBuybackMasses() : async Result.Result<[Types.BuybackMass], Types.BuybackError> {
    if (caller.isAnonymous()) return #err(#anonymous);
    #ok(BuybackLib.massesOf(buybacks, buybacksInFlight, treasury, caller));
  };

  // Every buyer's masses. Admin only.
  public shared query ({ caller }) func listAllBuybackMasses() : async [Types.BuybackMass] {
    requireBuybackAdmin(caller);
    BuybackLib.allMasses(buybacks, buybacksInFlight, treasury);
  };

  public shared query ({ caller }) func quoteBuyback(massToken : Types.PayToken, percent : Nat, receiveToken : Types.PayToken) : async Result.Result<Types.BuybackQuote, Types.BuybackError> {
    BuybackLib.computeQuote(buybacks, buybacksInFlight, treasury, oracle, tokenRates, IcrcLib.fee(ledger), caller, massToken, percent, receiveToken, Time.now());
  };

  public shared ({ caller }) func requestBuyback(massToken : Types.PayToken, percent : Nat, receiveToken : Types.PayToken, fromSubaccount : ?Blob) : async Result.Result<Types.Buyback, Types.BuybackError> {
    if (sale.salesPaused) return #err(#salesPaused);
    let now = Time.now();
    let q = switch (BuybackLib.computeQuote(buybacks, buybacksInFlight, treasury, oracle, tokenRates, IcrcLib.fee(ledger), caller, massToken, percent, receiveToken, now)) {
      case (#ok(q)) q;
      case (#err(e)) return #err(e);
    };
    let admin = switch (buybacks.adminAccount) {
      case (?a) a;
      case null return #err(#adminAccountNotSet);
    };
    // Lock the mass before any await; the finally releases it on every exit.
    let key = BuybackLib.lockKey(caller, massToken);
    buybacksInFlight.add(key);
    try {
      let funding = try {
        await BuybackLib.checkFunding(massToken, admin, q.amountReturned + q.thirdPartyFees, canister);
      } catch (e) {
        ?#callFailed(e.message());
      };
      switch (funding) {
        case (?e) return #err(e);
        case null {};
      };
      let buyerAccount = { owner = caller; subaccount = fromSubaccount };
      let buyerAllowance = IcrcLib.allowance(ledger, { account = buyerAccount; spender = contractAccount() }).allowance;
      if (buyerAllowance < q.tttiAllowanceRequired) {
        return #err(#buyerAllowanceInsufficient({ allowance = buyerAllowance; required = q.tttiAllowanceRequired }));
      };
      let id = buybacks.nextId;
      buybacks.nextId += 1;
      let record = BuybackLib.newRecord(q, id, caller, buyerAccount, now);
      buybacks.records.add(id, record);
      // TTTI-T + the second fee go to the escrow account (buyer debited
      // tttiAmount + two fees); nothing is burned.
      let pulled = switch (
        IcrcLib.transferFrom(
          ledger,
          canister,
          canister,
          {
            spender_subaccount = null;
            from = buyerAccount;
            to = IcrcLib.buybackEscrowAccount(canister);
            amount = q.tttiAmount + q.tttiEscrowFee;
            fee = ?q.tttiTransferFee;
            memo = null;
            created_at_time = null;
          },
        )
      ) {
        case (#Ok(block)) { { record with pullBlock = ?block } };
        case (#Err(err)) {
          buybacks.records.remove(id);
          buybacks.nextId := id;
          return #err(#pullFailed(BuybackLib.tttiErrorText(err)));
        };
      };
      buybacks.records.add(id, pulled);
      await BuybackLib.runPayout(payoutContext(), pulled, admin);
    } finally {
      buybacksInFlight.remove(key);
    };
  };

  // Retries the payout of the caller's own #payoutFailed record (TTTI-T are
  // not pulled again): the same attempt resent within 23 h of an unknown
  // outcome, or a new attempt (new memo and created_at_time) when every
  // attempt got a ledger Err. Same buyback lock.
  public shared ({ caller }) func retryBuybackPayout(buybackId : Types.BuybackId) : async Result.Result<Types.Buyback, Types.BuybackError> {
    if (sale.salesPaused) return #err(#salesPaused);
    if (caller.isAnonymous()) return #err(#anonymous);
    let record = switch (buybacks.records.get(buybackId)) {
      case (?r) r;
      case null return #err(#buybackNotFound);
    };
    if (record.buyer != caller) return #err(#notBuyer);
    await BuybackLib.retryPayout(payoutContext(), buybackId);
  };

  // Cancels a #payoutFailed buyback whose attempts all got a ledger Err, for
  // the buyer or an admin, under the mass lock: the escrow returns tttiAmount
  // to the buyer (second fee paid by the escrow), status #cancelled,
  // cancelBlock set. Legacy records -> #notCancellable (markBuybackCancelled).
  public shared ({ caller }) func cancelBuyback(id : Types.BuybackId) : async Result.Result<Types.Buyback, Types.BuybackError> {
    if (sale.salesPaused) return #err(#salesPaused);
    if (caller.isAnonymous()) return #err(#anonymous);
    let record = switch (buybacks.records.get(id)) {
      case (?r) r;
      case null return #err(#buybackNotFound);
    };
    if (record.buyer != caller and not AccessControl.isAdmin(accessControlState, caller)) return #err(#notAuthorized);
    let key = BuybackLib.lockKey(record.buyer, record.originalToken);
    if (buybacksInFlight.contains(key)) return #err(#buybackInProgress);
    buybacksInFlight.add(key);
    try {
      if (BuybackLib.anyAttemptArrived(record)) return #err(#attemptArrived);
      if (record.legacy or record.status != #payoutFailed or record.payoutAttempts.size() == 0) return #err(#notCancellable);
      if (not BuybackLib.allAttemptsFailed(record)) return #err(#attemptUnknown);
      switch (BuybackLib.refundEscrow(ledger, canister, record)) {
        case (#ok(block)) {
          let cancelled = { record with status = #cancelled; cancelBlock = ?block; message = null };
          buybacks.records.add(id, cancelled);
          #ok(cancelled);
        };
        case (#err(text)) #err(#cancelFailed(text));
      };
    } finally {
      buybacksInFlight.remove(key);
    };
  };

  // Admin only, legacy records only (#notLegacy otherwise), #payoutFailed and
  // no attempt arrived: records the admin's own TTTI-T return `block` as
  // cancelBlock and sets #cancelled. No ledger call.
  public shared ({ caller }) func markBuybackCancelled(id : Types.BuybackId, block : Nat) : async Result.Result<Types.Buyback, Types.BuybackError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#notAuthorized);
    let record = switch (buybacks.records.get(id)) {
      case (?r) r;
      case null return #err(#buybackNotFound);
    };
    if (not record.legacy) return #err(#notLegacy);
    if (BuybackLib.anyAttemptArrived(record)) return #err(#attemptArrived);
    if (record.status != #payoutFailed) return #err(#notCancellable);
    let key = BuybackLib.lockKey(record.buyer, record.originalToken);
    if (buybacksInFlight.contains(key)) return #err(#buybackInProgress);
    let cancelled = { record with status = #cancelled; cancelBlock = ?block; message = ?"TTTI-T returned by the admin (legacy buyback)" };
    buybacks.records.add(id, cancelled);
    #ok(cancelled);
  };

  public shared query ({ caller }) func listMyBuybacks() : async Result.Result<[Types.Buyback], Types.BuybackError> {
    if (caller.isAnonymous()) return #err(#anonymous);
    #ok(BuybackLib.forBuyer(buybacks, caller));
  };

  public shared query ({ caller }) func listAllBuybacks() : async [Types.Buyback] {
    requireBuybackAdmin(caller);
    buybacks.records.values().toArray();
  };

  public shared ({ caller }) func setBuybackAdminAccount(account : Types.Account) : async () {
    requireBuybackAdmin(caller);
    if (account.owner == canister) {
      Runtime.trap("The admin account cannot be owned by this canister");
    };
    if (account.owner.isAnonymous()) {
      Runtime.trap("The admin account cannot be anonymous");
    };
    buybacks.adminAccount := ?account;
  };

  public shared query ({ caller }) func getBuybackAdminAccount() : async ?Types.Account {
    requireBuybackAdmin(caller);
    buybacks.adminAccount;
  };

  public shared ({ caller }) func getBuybackFunding() : async [Types.BuybackFunding] {
    requireBuybackAdmin(caller);
    let admin = switch (buybacks.adminAccount) {
      case (?a) a;
      case null {
        return PayTokenLib.ALL.map<Types.PayToken, Types.BuybackFunding>(func token = { token; allowance = 0; expiresAt = null; balance = 0; error = ?"Admin account not set" });
      };
    };
    var out : [Types.BuybackFunding] = [];
    for (token in PayTokenLib.ALL.values()) {
      let entry : Types.BuybackFunding = try {
        let approval = await BuybackLib.allowanceLedger(token).icrc2_allowance({ account = admin; spender = contractAccount() });
        let balance = await PayTokenLib.ledger(token).icrc1_balance_of(admin);
        { token; allowance = approval.allowance; expiresAt = approval.expires_at; balance; error = null };
      } catch (e) {
        { token; allowance = 0; expiresAt = null; balance = 0; error = ?e.message() };
      };
      out := out.concat([entry]);
    };
    out;
  };
};
