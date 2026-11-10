import IndexTypes "../types/index";
import IcrcLib "../lib/icrc";
import IndexLib "../lib/index";

// ICRC index-ng interface served by the ledger itself. icrc1_balance_of is
// provided by mixins/icrc-api.mo and is not redeclared here.
// ixCache is the transient per-account index over the append-only ledger
// blocks, created and extended by a timer in main.mo (the timer needs the
// `system` capability). Queries decode only the blocks it has not covered yet,
// so results never depend on it.
mixin (ledger : IcrcLib.Ledger, canisterPrincipal : Principal, ixCache : IndexLib.IndexCache) {

  public query func get_account_transactions(args : IndexTypes.GetAccountTransactionsArgs) : async IndexTypes.GetTransactionsResult {
    IndexLib.getAccountTransactions(ledger, ixCache, args);
  };

  public query func ledger_id() : async Principal {
    canisterPrincipal;
  };

  public query func status() : async IndexTypes.IndexStatus {
    IndexLib.status(ledger);
  };

  public query func list_subaccounts(args : IndexTypes.ListSubaccountsArgs) : async [IndexTypes.Subaccount] {
    IndexLib.listSubaccounts(ledger, ixCache, args);
  };
};
