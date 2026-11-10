import type en from "./en";

const ptBR: typeof en = {
  oracleCoinbase:
    "Preço spot da Coinbase para ICP-USD, BTC-USD, USDC-USD e USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
  oracleCoingecko:
    "Preço simples da CoinGecko para internet-computer, bitcoin, usd-coin e tether, se a Coinbase estiver indisponível (https://api.coingecko.com/api/v3/simple/price)",
  refreshPolicy:
    "A cotação em USD de ICP, BTC, USDC e USDT é obtida uma vez por hora (primeiro Coinbase, depois CoinGecko) e é válida por uma hora. Uma compra é recusada quando a cotação do token pago expirou.",
  roundingRule:
    "Os valores em TTTI-T são arredondados para baixo a 1 unidade base (0,00000001 TTTI-T). O custo de um valor entregue é arredondado para cima a 1 unidade base do token pago (ICP e ckBTC: 8 casas decimais; ckUSDC e ckUSDT: 6 casas decimais).",
  excessPaymentHandling:
    "Nenhum valor do token pago além do custo do que é entregue é retirado.",
  deliveryOrder:
    "Primeiro a cunhagem nova, até a oferta máxima de 1 TTTI-T (100_000_000 unidades base); o que ainda pode ser cunhado é a oferta máxima menos a oferta total. Os tokens não podem ser queimados. As taxas de transferência cobradas na conta de taxas são entregues aos compradores em troca de ICP, ckBTC, ckUSDC ou ckUSDT somente depois que a cunhagem nova atinge o limite.",
};

export default ptBR;
