const en = {
  oracleCoinbase:
    "Coinbase spot price for ICP-USD, BTC-USD, USDC-USD and USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
  oracleCoingecko:
    "CoinGecko simple price for internet-computer, bitcoin, usd-coin and tether, if Coinbase is unavailable (https://api.coingecko.com/api/v3/simple/price)",
  refreshPolicy:
    "The USD rate of ICP, BTC, USDC and USDT is fetched once an hour (Coinbase first, then CoinGecko) and is valid for one hour. A purchase is refused when the rate of the paid token has expired.",
  roundingRule:
    "TTTI-T amounts are rounded down to 1 base unit (0.00000001 TTTI-T). The cost of a delivered amount is rounded up to 1 base unit of the paid token (ICP and ckBTC: 8 decimals; ckUSDC and ckUSDT: 6 decimals).",
  excessPaymentHandling:
    "No amount of the paid token beyond the cost of what is delivered is taken.",
  deliveryOrder:
    "Fresh minting first, up to the 1 TTTI-T max supply (100_000_000 base units); what can still be minted is the max supply minus the total supply. Tokens cannot be burned. Transfer fees collected in the fee account are delivered to buyers against ICP, ckBTC, ckUSDC or ckUSDT only once fresh minting has reached the cap.",
};

export default en;
