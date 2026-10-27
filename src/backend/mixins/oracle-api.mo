import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import AccessControl "mo:caffeineai-authorization/access-control";
import Oracle "../types/oracle";
import OracleLib "../lib/oracle";

// `transform` is the actor-level query declared in main.mo.
mixin (
  oracle : OracleLib.OracleStore,
  accessControlState : AccessControl.AccessControlState,
  transform : OutCall.Transform,
  tokenRates : OracleLib.TokenRateStore,
) {
  // Returns the stored ICP/USD rate. Callable by anyone, including anonymous.
  // Never performs an outcall.
  public query func getIcpPrice() : async Oracle.IcpPrice {
    OracleLib.getPrice(oracle, Time.now());
  };

  // Every pay token's stored USD rate (ICP, BTC, USDC, USDT). Public; never
  // performs an outcall.
  public query func getTokenPrices() : async [Oracle.TokenPrice] {
    OracleLib.allPrices(oracle, tokenRates, Time.now());
  };

  // The stored hourly BTC/USD rate, null while none has been fetched. Public,
  // display-only; never performs an outcall.
  public query func getBtcUsdRate() : async ?Oracle.BtcUsdRate {
    OracleLib.getBtcUsdRate(tokenRates);
  };

  // Admin-only. Allowed only when the current rate is absent or past
  // validUntil; otherwise refused with #Err and no outcall.
  public shared ({ caller }) func refreshIcpPrice() : async Oracle.PriceResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can refresh the ICP price");
    };
    await OracleLib.adminRefresh(oracle, transform);
  };

  // Admin-only refresh of one pay token's rate; same rule as refreshIcpPrice.
  public shared ({ caller }) func refreshTokenPrice(token : Oracle.PayToken) : async Oracle.TokenPriceResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can refresh token prices");
    };
    await OracleLib.adminRefreshToken(oracle, tokenRates, token, transform);
  };
};
