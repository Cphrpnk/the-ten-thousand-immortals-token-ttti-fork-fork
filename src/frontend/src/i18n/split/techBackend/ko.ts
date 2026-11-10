import type en from "./en";

const ko: typeof en = {
  oracleCoinbase:
    "ICP-USD, BTC-USD, USDC-USD 및 USDT-USD에 대한 Coinbase 현물 가격 (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
  oracleCoingecko:
    "Coinbase를 사용할 수 없는 경우, internet-computer, bitcoin, usd-coin 및 tether에 대한 CoinGecko 단순 가격 (https://api.coingecko.com/api/v3/simple/price)",
  refreshPolicy:
    "ICP, BTC, USDC 및 USDT의 USD 환율은 한 시간에 한 번 조회되며(Coinbase 우선, 그다음 CoinGecko) 한 시간 동안 유효합니다. 결제 토큰의 환율이 만료되면 구매가 거부됩니다.",
  roundingRule:
    "TTTI-T 금액은 기본 단위 1개(0.00000001 TTTI-T) 단위로 내림합니다. 지급되는 금액의 비용은 결제 토큰의 기본 단위 1개 단위로 올림합니다(ICP 및 ckBTC: 소수점 8자리, ckUSDC 및 ckUSDT: 소수점 6자리).",
  excessPaymentHandling:
    "지급되는 것의 비용을 초과하는 결제 토큰은 전혀 가져가지 않습니다.",
  deliveryOrder:
    "먼저 신규 발행이 이루어지며, 최대 공급량 1 TTTI-T(기본 단위 100_000_000개)까지입니다. 아직 발행 가능한 수량은 최대 공급량에서 총 공급량을 뺀 값입니다. 토큰은 소각할 수 없습니다. 수수료 계정에 징수된 전송 수수료는 신규 발행이 상한에 도달한 후에만 ICP, ckBTC, ckUSDC 또는 ckUSDT를 대가로 구매자에게 지급됩니다.",
};

export default ko;
