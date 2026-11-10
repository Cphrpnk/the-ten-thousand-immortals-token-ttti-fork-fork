import type en from "./en";

const es: typeof en = {
  noReward:
    "No se crea ninguna recompensa. Todo lo que se paga fue pagado antes por alguien (minters, traders, transferencias), y cualquiera puede verificarlo.",
  observedYield:
    "TTTI-T no genera nada por sí mismo. Las comisiones de swap remuneran la liquidez aportada. Solo se muestran las comisiones realmente pagadas durante los últimos 30 días, por ejemplo: este pool pagó X en comisiones durante los últimos 30 días.",
  permanentDepth:
    "La liquidez permanente es una gestión de la profundidad: un reequilibrio mecánico y público de la parte del protocolo, nunca condicionado al precio.",
  ilTitle: "Pérdida impermanente",
  il: "Una posición de liquidez posee una parte del pool, no una cantidad fija de cada token. Cuando el precio del pool se mueve, la posición puede valer menos que los mismos tokens conservados fuera del pool, sean cuales sean las comisiones cobradas.",
  exposureTitle: "Exposición a BTC e ICP",
  exposure:
    "A través de sus pools, TTTI-T está expuesto a BTC e ICP: el lado TTTI-T de una posición se empareja con ICP, ckBTC, ckUSDC o ckUSDT, de modo que su valor en esos tokens sigue al del pool.",
  zapTitle: "Zap del mint",
  zap: "El zap es un intercambio automático hecho con el dinero del minter en el momento del mint, para que el resto pueda depositarse a la proporción del pool.",
  guaranteeTitle: "Reserva común y canje",
  guarantee:
    "Canje contra la reserva común: 1 TTTI-T se canjea por 10 000 USD como máximo, sin comisión. Por x TTTI-T devueltos al contrato, el pago es el menor entre 10 000 USD × x y (la reserva ÷ el TTTI-T en circulación fuera del contrato) × x, pagado a prorrata de la composición de la reserva, en ICP, ckBTC, ckUSDC y ckUSDT. Acuñar q TTTI-T cuesta (10 000 USD + la liquidez aportada) × q ÷ 0,99, de los cuales 10 000 USD × q van a la reserva común y el 1 % del importe pagado va al creador; el resto es la liquidez aportada, que permanece en la posición del minter.",
  refusedDeposits:
    "El depósito de una solicitud de par rechazada, en cualquier token (TTTI-T incluido), pasa a la liquidez permanente reservada; el router lo reequilibra y lo inyecta a la proporción del pool.",
  chance:
    "En el mint, cada minter tiene la misma probabilidad. En las subastas ganan las ofertas más altas, por orden de precio, hasta que se venda el lote.",
  auctionRules:
    "Las subastas son de oferta sellada: cada postor paga su propia oferta. El precio de reserva es el más alto entre 10 000 USD por TTTI-T, el promedio de 24 horas del precio consolidado y el precio consolidado actual. No se reemite nada por debajo de 10 000 USD.",
};

export default es;
