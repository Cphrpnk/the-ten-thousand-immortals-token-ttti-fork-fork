import Pay "pay-token";

module {
  // USD rate domain types. Rates are set once an hour by a canister timer
  // (Coinbase first, then CoinGecko) and apply to every purchase in that
  // hour. No price is fetched during a purchase.

  public type PayToken = Pay.PayToken;

  // Nanoseconds since the Unix epoch (Time.now()). 0 = never.
  public type Timestamp = Int;

  // Which feed produced the stored rate. #none while no rate exists.
  public type PriceSource = {
    #none;
    #coinbase;
    #coingecko;
  };

  // The last failed fetch: the exact error text and when it happened.
  public type PriceError = {
    message : Text;
    at : Timestamp;
  };

  // The stored ICP/USD rate.
  // `usdE8` = USD price of 1 whole ICP * 10^8 (0 while no rate exists).
  // `fetchedAt` = when the rate was fetched (0 = never).
  // `validUntil` = fetchedAt + 1 hour (0 = never).
  // `usable` = a rate exists and now <= validUntil + 5 minutes; purchases are
  // refused with #priceUnavailable otherwise.
  // `lastError` = last failed fetch (exact text, date); `lastSuccessAt` = date
  // of the last successful fetch.
  public type IcpPrice = {
    usdE8 : Nat;
    source : PriceSource;
    fetchedAt : Timestamp;
    validUntil : Timestamp;
    usable : Bool;
    lastError : ?PriceError;
    lastSuccessAt : ?Timestamp;
  };

  // Result of refreshIcpPrice: the new rate, or an error text (including the
  // refusal "rate still valid until <time>" when no fetch was made).
  public type PriceResult = {
    #Ok : IcpPrice;
    #Err : Text;
  };

  // One pay token's stored USD rate (ICP-USD, BTC-USD, USDC-USD, USDT-USD),
  // same fields and rules as IcpPrice.
  public type TokenPrice = {
    token : PayToken;
    pair : Text; // e.g. "BTC-USD"
    usdE8 : Nat; // USD per whole token * 10^8, 0 = no rate
    source : PriceSource;
    fetchedAt : Timestamp;
    validUntil : Timestamp; // fetchedAt + 1 h
    usable : Bool; // rate exists and now <= validUntil + 5 minutes
    lastError : ?PriceError;
    lastSuccessAt : ?Timestamp;
  };

  // Result of refreshTokenPrice (refused with #Err while the rate is valid).
  public type TokenPriceResult = {
    #Ok : TokenPrice;
    #Err : Text;
  };
};
