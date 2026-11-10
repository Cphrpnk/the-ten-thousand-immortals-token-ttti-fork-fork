import Map "mo:core/Map";

// PTM-11b: no remnant of the personal guarantee. Removes the stable field
// `guaranteeMasses` (personal masses, no longer read) and the `fees` map of
// `redemptions` (1 % redemption fees of redemptions made before PTM-11), and
// projects each stored redemption to the new record: id, owner, account,
// token, tttiAmount, tttiPullBlock, rateUsdE8, thirdPartyFee, netAmount,
// createdAt, payout and status are kept as stored; kind, phase, rule,
// depositedGuarantee, returnedAmount, excessKept and redemptionFee are dropped.
// Every other field is carried forward untouched: sale.reserved, balances,
// blocks, the ledger, guaranteeAccount (the reserve balance), liquidityMints
// (including the read-only guarantees history), refusedDepositFeeds,
// requestPayments, the wallet-terms acceptances (stored version numbers are
// kept, so a version-2 record no longer counts as accepted under version 3),
// secondRates and the cycles reserve state.
module {
  type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  type AttemptOutcome = {
    #pending;
    #unknown;
    #failed : Text;
    #succeeded : Nat;
  };

  type DexTransferRequest = {
    token : DexToken;
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
  };

  type DexTransferAttempt = {
    n : Nat;
    attempt : Nat;
    memo : Blob;
    created_at_time : Nat64;
    request : DexTransferRequest;
    sends : Nat;
    lastError : ?Text;
    outcome : AttemptOutcome;
  };

  type DexTransferStatus = {
    #inProgress;
    #needsReview;
    #completed : Nat;
    #failed : Text;
  };

  // --- Old shapes (as stored by 20261127_000000) -----------------------------

  type GuaranteeMass = {
    token : PayToken;
    totalTtti : Nat;
    totalGuarantee : Nat;
    remainingTtti : Nat;
    remainingGuarantee : Nat;
    excess : Nat;
  };

  type RedeemPhase = { #duringMint; #afterMint };

  type RedeemRule = { #depositedGuarantee; #dayRate; #proRata };

  type RedemptionKind = { #redeem; #excessWithdrawal };

  type OldRedemption = {
    id : Nat;
    owner : Principal;
    account : Account;
    kind : RedemptionKind;
    token : PayToken;
    phase : RedeemPhase;
    rule : RedeemRule;
    tttiAmount : Nat;
    tttiPullBlock : ?Nat;
    depositedGuarantee : Nat;
    rateUsdE8 : ?Nat;
    returnedAmount : Nat;
    excessKept : Nat;
    redemptionFee : Nat;
    thirdPartyFee : Nat;
    netAmount : Nat;
    createdAt : Int;
    payout : DexTransferAttempt;
    status : DexTransferStatus;
  };

  type RedemptionFee = {
    redemptionId : Nat;
    token : PayToken;
    amount : Nat;
    createdAt : Int;
  };

  type OldRedemptionStore = {
    redemptions : Map.Map<Nat, OldRedemption>;
    fees : Map.Map<Nat, RedemptionFee>;
  };

  // --- New shape -------------------------------------------------------------

  type NewRedemption = {
    id : Nat;
    owner : Principal;
    account : Account;
    token : PayToken;
    tttiAmount : Nat;
    tttiPullBlock : ?Nat;
    rateUsdE8 : ?Nat;
    thirdPartyFee : Nat;
    netAmount : Nat;
    createdAt : Int;
    payout : DexTransferAttempt;
    status : DexTransferStatus;
  };

  type NewRedemptionStore = {
    redemptions : Map.Map<Nat, NewRedemption>;
  };

  type OldActor = {
    guaranteeMasses : Map.Map<Principal, Map.Map<Text, GuaranteeMass>>;
    redemptions : OldRedemptionStore;
  };

  type NewActor = {
    redemptions : NewRedemptionStore;
  };

  public func migration(old : OldActor) : NewActor {
    let redemptions = old.redemptions.redemptions.map<Nat, OldRedemption, NewRedemption>(
      func(_, r) {
        {
          id = r.id;
          owner = r.owner;
          account = r.account;
          token = r.token;
          tttiAmount = r.tttiAmount;
          tttiPullBlock = r.tttiPullBlock;
          rateUsdE8 = r.rateUsdE8;
          thirdPartyFee = r.thirdPartyFee;
          netAmount = r.netAmount;
          createdAt = r.createdAt;
          payout = r.payout;
          status = r.status;
        };
      }
    );
    { redemptions = { redemptions } };
  };
};
