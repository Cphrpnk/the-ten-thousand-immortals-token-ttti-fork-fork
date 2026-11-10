import type en from "./en";

const paGuru: typeof en = {
  oracleCoinbase:
    "ICP-USD, BTC-USD, USDC-USD ਅਤੇ USDT-USD ਲਈ Coinbase ਸਪਾਟ ਕੀਮਤ (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
  oracleCoingecko:
    "ਜੇ Coinbase ਉਪਲਬਧ ਨਾ ਹੋਵੇ, ਤਾਂ internet-computer, bitcoin, usd-coin ਅਤੇ tether ਲਈ CoinGecko ਸਧਾਰਨ ਕੀਮਤ (https://api.coingecko.com/api/v3/simple/price)",
  refreshPolicy:
    "ICP, BTC, USDC ਅਤੇ USDT ਦੀ USD ਦਰ ਘੰਟੇ ਵਿੱਚ ਇੱਕ ਵਾਰ ਲਈ ਜਾਂਦੀ ਹੈ (ਪਹਿਲਾਂ Coinbase, ਫਿਰ CoinGecko) ਅਤੇ ਇੱਕ ਘੰਟੇ ਲਈ ਵੈਧ ਰਹਿੰਦੀ ਹੈ। ਜਦੋਂ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ ਦਰ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਜਾਂਦੀ ਹੈ, ਤਾਂ ਖਰੀਦ ਰੱਦ ਕਰ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।",
  roundingRule:
    "TTTI-T ਰਕਮਾਂ ਨੂੰ 1 ਮੂਲ ਇਕਾਈ (0.00000001 TTTI-T) ਤੱਕ ਹੇਠਾਂ ਵੱਲ ਪੂਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਡਿਲੀਵਰ ਕੀਤੀ ਰਕਮ ਦੀ ਲਾਗਤ ਨੂੰ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ 1 ਮੂਲ ਇਕਾਈ ਤੱਕ ਉੱਪਰ ਵੱਲ ਪੂਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ (ICP ਅਤੇ ckBTC: 8 ਦਸ਼ਮਲਵ ਅੰਕ; ckUSDC ਅਤੇ ckUSDT: 6 ਦਸ਼ਮਲਵ ਅੰਕ)।",
  excessPaymentHandling:
    "ਡਿਲੀਵਰ ਕੀਤੀ ਚੀਜ਼ ਦੀ ਲਾਗਤ ਤੋਂ ਵੱਧ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ ਕੋਈ ਵੀ ਰਕਮ ਨਹੀਂ ਲਈ ਜਾਂਦੀ।",
  deliveryOrder:
    "ਪਹਿਲਾਂ ਨਵੀਂ ਮਿੰਟਿੰਗ, 1 TTTI-T ਦੀ ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ (100_000_000 ਮੂਲ ਇਕਾਈਆਂ) ਤੱਕ; ਜੋ ਹਾਲੇ ਮਿੰਟ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ ਉਹ ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਘਟਾ ਕੁੱਲ ਸਪਲਾਈ ਹੈ। ਟੋਕਨ ਬਰਨ ਨਹੀਂ ਕੀਤੇ ਜਾ ਸਕਦੇ। ਫੀਸ ਖਾਤੇ ਵਿੱਚ ਇਕੱਠੀਆਂ ਕੀਤੀਆਂ ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਦੇ ਬਦਲੇ ਖਰੀਦਦਾਰਾਂ ਨੂੰ ਸਿਰਫ਼ ਉਦੋਂ ਡਿਲੀਵਰ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ ਜਦੋਂ ਨਵੀਂ ਮਿੰਟਿੰਗ ਸੀਮਾ ਤੱਕ ਪਹੁੰਚ ਜਾਂਦੀ ਹੈ।",
};

export default paGuru;
