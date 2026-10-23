import Error "mo:core/Error";
import Btc "../types/btc-deposit";

// ckBTC minter facts and typed calls (never trap; rejected calls are caught).
module {
  public let MINTER_ID : Text = "mqygn-kiaaa-aaaar-qaadq-cai";

  // Defaults shown until get_minter_info has been read.
  public let DEFAULT_MIN_CONFIRMATIONS : Nat = 6;
  public let DEFAULT_DEPOSIT_MIN_SATS : Nat = 10_000;
  public let DEFAULT_CHECK_FEE_SATS : Nat = 100;

  public type Minter = actor {
    get_btc_address : shared Btc.MinterAccountArg -> async Text;
    update_balance : shared Btc.MinterAccountArg -> async Btc.UpdateBalanceResult;
    get_minter_info : shared query () -> async Btc.MinterInfo;
  };

  public type UpdateOutcome = {
    #ok : [Btc.UtxoStatus];
    #err : Btc.UpdateBalanceError;
    #callFailed : Text;
  };

  public func minter() : Minter = actor (MINTER_ID);

  public func getBtcAddress(owner : Principal, subaccount : ?Blob) : async { #ok : Text; #err : Text } {
    try {
      #ok(await minter().get_btc_address({ owner = ?owner; subaccount }));
    } catch (e) {
      #err(e.message());
    };
  };

  public func updateBalance(owner : Principal, subaccount : ?Blob) : async UpdateOutcome {
    try {
      switch (await minter().update_balance({ owner = ?owner; subaccount })) {
        case (#Ok(statuses)) { #ok(statuses) };
        case (#Err(err)) { #err(err) };
      };
    } catch (e) {
      #callFailed(e.message());
    };
  };

  public func getMinterInfo() : async { #ok : Btc.MinterInfo; #err : Text } {
    try {
      #ok(await minter().get_minter_info());
    } catch (e) {
      #err(e.message());
    };
  };
};
