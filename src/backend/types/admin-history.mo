import Result "mo:core/Result";
import Common "common";
import Retry "retry";

// Unified admin history (newest first, paginated) built from existing records:
// conversions, BTC deposits, owner sends and settlement sends, refunds,
// buybacks, routed and native swaps, liquidity adds/removes/injections and
// receiving wallet changes. Also the To review filter.
module {
  public type Account = Common.Account;

  public type HistoryKind = {
    #mintDeposit; // conversions (mints) and BTC deposits
    #revenueSent; // 100/101 owner sends (mint and settlement)
    #refund; // purchase and BTC refunds
    #buyback;
    #swap; // routed ICPSwap swaps and native pool swaps
    #liquidity; // liquidity adds, removes and injections
    #destination; // receiving wallet changes
  };

  public type HistoryFilter = {
    #all;
    #mintDeposit;
    #revenueSent;
    #refund;
    #buyback;
    #swap;
    #liquidity;
    #destination;
  };

  public type HistoryToken = { #icp; #ckbtc; #ckusdc; #ckusdt; #tttiT };

  // One uniform row. `id` is unique across kinds ("<source>-<id>").
  public type HistoryRow = {
    id : Text;
    kind : HistoryKind;
    token : ?HistoryToken;
    amount : ?Nat; // base units of `token`
    counterparty : ?Text; // principal / ICRC account text or destination
    status : Text;
    memo : ?Text;
    block : ?Nat;
    timestamp : Int; // ns
    detail : Text; // short detail text
  };

  public type HistoryPage = {
    items : [HistoryRow]; // newest first
    total : Nat; // rows matching the filter
    offset : Nat;
    limit : Nat;
  };

  public type HistoryError = { #notAdmin };

  public type HistoryResult = Result.Result<HistoryPage, HistoryError>;

  // To review filter: empty `kinds` = every kind; null `token` = every token.
  public type ReviewFilter = {
    kinds : [Retry.TransferKind];
    token : ?Retry.DexToken;
  };
};
