import type en from "./en";

const fr: typeof en = {
  oracleCoinbase:
    "Prix spot Coinbase pour ICP-USD, BTC-USD, USDC-USD et USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
  oracleCoingecko:
    "Prix simple CoinGecko pour internet-computer, bitcoin, usd-coin et tether, si Coinbase est indisponible (https://api.coingecko.com/api/v3/simple/price)",
  refreshPolicy:
    "Le taux USD de l'ICP, du BTC, de l'USDC et de l'USDT est récupéré une fois par heure (Coinbase d'abord, puis CoinGecko) et est valable une heure. Un achat est refusé lorsque le taux du jeton payé a expiré.",
  roundingRule:
    "Les montants en TTTI-T sont arrondis à l'inférieur à 1 unité de base (0.00000001 TTTI-T). Le coût d'un montant livré est arrondi au supérieur à 1 unité de base du jeton payé (ICP et ckBTC : 8 décimales ; ckUSDC et ckUSDT : 6 décimales).",
  excessPaymentHandling:
    "Aucun montant du jeton payé au-delà du coût de ce qui est livré n'est prélevé.",
  deliveryOrder:
    "Frappe nouvelle d'abord, jusqu'à l'offre maximale de 1 TTTI-T (100_000_000 unités de base) ; ce qui peut encore être frappé est l'offre maximale moins l'offre totale. Les jetons ne peuvent pas être brûlés. Les frais de transfert perçus sur le compte de frais ne sont livrés aux acheteurs contre de l'ICP, du ckBTC, du ckUSDC ou du ckUSDT qu'une fois que la frappe nouvelle a atteint le plafond.",
};

export default fr;
