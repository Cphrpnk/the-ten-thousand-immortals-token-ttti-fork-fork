import type en from "./en";

const es: typeof en = {
  oracleCoinbase:
    "Precio spot de Coinbase para ICP-USD, BTC-USD, USDC-USD y USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
  oracleCoingecko:
    "Precio simple de CoinGecko para internet-computer, bitcoin, usd-coin y tether, si Coinbase no está disponible (https://api.coingecko.com/api/v3/simple/price)",
  refreshPolicy:
    "El tipo de cambio en USD de ICP, BTC, USDC y USDT se obtiene una vez por hora (primero Coinbase, después CoinGecko) y es válido durante una hora. Una compra se rechaza cuando el tipo de cambio del token pagado ha caducado.",
  roundingRule:
    "Los importes de TTTI-T se redondean a la baja a 1 unidad base (0.00000001 TTTI-T). El coste de un importe entregado se redondea al alza a 1 unidad base del token pagado (ICP y ckBTC: 8 decimales; ckUSDC y ckUSDT: 6 decimales).",
  excessPaymentHandling:
    "No se toma ninguna cantidad del token pagado por encima del coste de lo que se entrega.",
  deliveryOrder:
    "Primero la acuñación nueva, hasta el suministro máximo de 1 TTTI-T (100_000_000 unidades base); lo que aún puede acuñarse es el suministro máximo menos el suministro total. Los tokens no se pueden quemar. Las comisiones de transferencia cobradas en la cuenta de comisiones se entregan a los compradores a cambio de ICP, ckBTC, ckUSDC o ckUSDT solo una vez que la acuñación nueva ha alcanzado el límite.",
};

export default es;
