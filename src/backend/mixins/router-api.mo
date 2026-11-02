import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import OracleLib "../lib/oracle";
import DexLib "../lib/dex";
import RetryLib "../lib/retry";
import RouterLib "../lib/router";
import DexTypes "../types/dex";
import Types "../types/router";
import PageTypes "../types/page";

// DEX lot 5: ICPSwap router public API.
mixin (
  router : RouterLib.RouterContext,
  accessControlState : AccessControl.AccessControlState,
  oracle : OracleLib.OracleStore,
  tokenRates : OracleLib.TokenRateStore,
) {
  // Same USD rates as mixins/dex-api.mo (oracle hourly rates; TTTI-T has no
  // USD rate, it is never valued at a fixed price).
  func routerUsdRateOf(token : DexTypes.PoolToken) : ?Nat {
    switch (DexLib.poolDexToken(token)) {
      case (?#tttiT) null;
      case (?t) {
        switch (RetryLib.dexPayToken(t)) {
          case (?pay) OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, pay), Time.now());
          case null null;
        };
      };
      case null null;
    };
  };

  // Routed quote for a registry pair: compares the native pool and the
  // ICPSwap pool net of all fees and returns exactly one route. Update call
  // (it queries the ICPSwap pool on another subnet); changes no state.
  public shared ({ caller }) func quoteRoutedSwap(args : Types.RoutedQuoteArgs) : async { #ok : Types.RoutedQuote; #err : Types.RouteError } {
    if (caller.isAnonymous()) return #err(#anonymous);
    await RouterLib.routedQuote(router, routerUsdRateOf, args);
  };

  // Executes on exactly the chosen route from the caller's internal DEX
  // balances and credits the output to them.
  public shared ({ caller }) func routedSwap(args : Types.RoutedSwapArgs) : async { #ok : Types.RoutedSwapResult; #err : Types.RouteError } {
    if (router.dex.pause.paused) {
      Runtime.trap(DexLib.PAUSED_MESSAGE);
    };
    await RouterLib.routedSwap(router, routerUsdRateOf, caller, args);
  };

  // PTM-9e: caller's own routed swaps, newest first, one page. `cursor` = swap
  // id: the page holds the swaps with a smaller id (null = newest). `limit` 0 =
  // default page size; capped at PageTypes.MAX_PAGE_SIZE. `nextCursor` is null
  // on the last page.
  public query ({ caller }) func getMyRoutedSwaps(cursor : ?Nat, limit : Nat) : async PageTypes.Page<Types.RoutedSwap> {
    RouterLib.listByOwner(router, caller, cursor, limit);
  };

  // PTM-9e: admin only: ICPSwap routed swaps with their status, newest first,
  // one page (same cursor rules as getMyRoutedSwaps).
  public query ({ caller }) func adminListRoutedSwaps(cursor : ?Nat, limit : Nat) : async { #ok : PageTypes.Page<Types.RoutedSwap>; #err : Types.RouterAdminError } {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#notAuthorized);
    #ok(RouterLib.listIcpswapSwaps(router, cursor, limit));
  };

  // Admin only: total 0.1 % collected per native pool (LP share paid, LP
  // share set aside, permanent-liquidity share) and the current set-aside.
  public query ({ caller }) func adminGetRouterFees() : async { #ok : [Types.RouterFeeView]; #err : Types.RouterAdminError } {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#notAuthorized);
    #ok(RouterLib.feeViews(router));
  };
};
