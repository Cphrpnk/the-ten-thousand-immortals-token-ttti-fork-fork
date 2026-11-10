import type en from "./en";

const es: typeof en = {
  priceStatement:
    "Precio: 10.000 USD por TTTI-T, reembolsable por 10.000 USD en todo momento. Para q TTTI-T, el importe a pagar es (10.000 USD + la liquidez que aporta) × q ÷ 0,99, en ICP, ckBTC, ckUSDC o ckUSDT. Mínimo: 0,0001 TTTI-T.",
  modeLegend: "Introducción del importe",
  modeTtti: "Importe en TTTI-T",
  modeUsd: "Importe en dólares",
  tttiLabel: "TTTI-T a acuñar",
  tttiHint: "Mínimo 0,0001 TTTI-T, hasta 8 decimales.",
  usdLabel: "Importe a pagar, en dólares",
  usdHint:
    "Valor en dólares del pago. La cantidad de TTTI-T se redondea a la baja a 8 decimales.",
  invalidTtti:
    "Introduzca un importe en TTTI-T con 8 decimales como máximo. Se admite punto o coma.",
  invalidUsd:
    "Introduzca un importe en dólares mayor que 0 con 8 decimales como máximo. Se admite punto o coma.",
  previewHeading: "Vista previa",
  previewIdle: "Introduzca un importe para ver la vista previa.",
  previewLoading: "Calculando la vista previa…",
  rowMinted: "TTTI-T acuñados",
  rowPay: "Usted paga",
  splitHeading: "Reparto del pago",
  rowPosition: "Posición de liquidez",
  rowGuarantee: "Reserva común",
  rowFee: "Comisión: 1 %",
  rowPrice: "Precio",
  priceValue:
    "10.000 USD por TTTI-T, reembolsable por 10.000 USD en todo momento",
  rowLiquidity: "Liquidez que aporta",
  liquidityNote: "sigue siendo suya, en su posición",
  holdingsHeading: "Tras el mint tiene",
  rowLocked: "Parte bloqueada",
  rowHand: "TTTI-T en mano",
  lockedShareLabel: "Parte bloqueada m",
  lockedShareNote:
    "m es la parte de la posición bloqueada durante 3 meses. Se toma en el momento del pago: si cambia después de esta vista previa, se aplica el valor del momento del pago.",
  choiceLegend: "Elección del resto (1 − m)",
  choicePoolTitle: "A · Poner el resto en el pool",
  choicePoolText: "El resto se pone en el pool en su posición, sin bloqueo.",
  choiceWalletTitle: "B · Mantener en la cartera",
  choiceWalletText:
    "El resto permanece en su cartera como TTTI-T; la liquidez correspondiente no se paga.",
  paymentRule:
    "Pago: (10.000 USD + la liquidez que aporta) × q ÷ 0,99, redondeado hacia arriba. 10.000 USD × q van a la reserva común y el 1 % del importe pagado va al creador. El resto es la liquidez que aporta, que sigue siendo suya en su posición.",
  lockedRule:
    "Una parte m de la posición se bloquea durante 3 meses. El resto (1 − m) sigue su elección: A lo pone en el pool sin bloqueo; B mantiene los TTTI-T correspondientes en su cartera.",
  rowDust: "Resto de redondeo",
  poolPriceHeading: "Precio del pool objetivo, antes y después del zap",
  priceBefore: "Antes",
  priceAfter: "Después",
  emptyPool: "Pool vacío",
  consolidatedPriceHeading: "Precio consolidado (referencia)",
  consolidatedPriceNote:
    "USD por TTTI-T: precio de los otros pools abiertos, sin el pool objetivo, ponderado por su profundidad.",
  poolPriceNote: "USD por TTTI-T en el pool TTTI-T del token pagado.",
  gapHeading: "Diferencia entre el precio del pool y el precio de referencia",
  gapUnavailable: "Diferencia no disponible",
  noIndependentReference: "Sin referencia independiente",
  firstDepositNote:
    "Pool vacío: el primer depósito se hace 1 a 1, a 10.000 USD por TTTI-T.",
  zapLabel: "Intercambio de equilibrio",
  noZap: "No hace falta un intercambio de equilibrio.",
  maxPayLabel: "Pago máximo con esta tolerancia",
  expiryNote: "La acuñación se rechaza si no se ejecuta en 5 minutos.",
  previewFailedTitle: "Vista previa no disponible",
  mintFailedTitle: "Acuñación no completada",
  successTitle: (amount: string) => `${amount} acuñados`,
  successPaid: (pay: string, id: string) =>
    `Pagado ${pay} · acuñación n.º ${id}`,
  successPosition: (id: string) => `Posición de liquidez n.º ${id}`,
  successHoldings: (token: string, ttti: string) =>
    `La posición contiene ${token} y ${ttti}.`,
  successGuarantee: (amount: string) => `Reserva común: ${amount}.`,
  successLink: "Ver mis posiciones de liquidez",
  errAnonymous: "Inicie sesión o conecte un wallet para acuñar.",
  errRateUnavailable: (symbol: string) =>
    `No hay una tasa ${symbol}/USD válida en este momento. No se ha cobrado nada. Inténtelo más tarde.`,
  errBelowMinimum: (minimum: string, minimumUsd?: string) =>
    `El mínimo es ${minimum}${minimumUsd ? ` (${minimumUsd})` : ""}.`,
  errTooManyDecimals: (max: string, step: string) =>
    `Un importe en TTTI-T tiene ${max} decimales como máximo (paso mínimo ${step}).`,
  errInvalidAmount: "Introduzca un importe mayor que 0.",
  errAboveCap: (cap: string, remaining: string) =>
    `Se ha alcanzado o se superaría el tope total de ${cap}. Restante: ${remaining}.`,
  errInsufficientBalance: (symbol: string, required: string, balance: string) =>
    `Saldo de ${symbol} insuficiente: se necesitan ${required} con las comisiones del ledger, hay ${balance} disponibles.`,
  errInsufficientAllowance: (
    symbol: string,
    required: string,
    allowance: string,
  ) =>
    `La aprobación de ${symbol} es demasiado baja: se requieren ${required}, aprobados ${allowance}. Apruebe de nuevo e inténtelo otra vez.`,
  errSlippageExceeded: (percent: string) =>
    `El precio del pool superó la tolerancia del ${percent} %. No se acuñó nada. Reintente o aumente la tolerancia.`,
  errInvalidSlippage: (percent: string) =>
    `La tolerancia no puede superar el ${percent} %.`,
  errMaxPayExceeded: (pay: string, max: string) =>
    `El importe a pagar es ahora ${pay}, por encima del máximo de ${max} fijado con la vista previa. Actualice la vista previa e inténtelo de nuevo.`,
  errDeadlineExpired:
    "Pasó el plazo de 5 minutos antes de ejecutar la acuñación. Inténtelo de nuevo.",
  errInProgress: "Ya hay una acuñación en curso de esta cuenta.",
  errAcknowledgements: "Acepte las declaraciones para acuñar.",
  errSalesPaused: "La acuñación está en pausa.",
  rateSourceMissing: "no disponible",
  errRateSourcesDiverge: (
    symbol: string,
    coinbase: string,
    coingecko: string,
    maxPercent: string,
  ) =>
    `La acuñación fue rechazada: las tasas de Coinbase y CoinGecko para ${symbol} difieren en más de ${maxPercent} % o falta una de ellas. Coinbase: ${coinbase}. CoinGecko: ${coingecko}. No se ha cobrado nada.`,
  errDexPaused: "Los pools están en pausa. La acuñación no está disponible.",
  errPoolRemoved: (symbol: string) =>
    `El pool TTTI-T/${symbol} ha sido retirado.`,
  errRemovalAnnounced: (symbol: string, date: string) =>
    `Se ha anunciado la retirada del pool TTTI-T/${symbol} para el ${date}. La acuñación en él está suspendida.`,
  errPoolNotFound: (symbol: string) => `No existe un pool TTTI-T/${symbol}.`,
  errMinimumsNotSet: "Los mínimos del pool aún no están fijados.",
  errLedger: (symbol: string, message: string) =>
    `Error del ledger de ${symbol}: ${message}`,
  errDepositRefunded: (id: string) =>
    `El depósito en el pool falló. El pago se reembolsó, menos las comisiones del ledger (acuñación n.º ${id}).`,
  refundingTitle: "Pago en proceso de devolución",
  errDepositRefunding: (id: string) =>
    `El depósito en el pool falló. El pago se está devolviendo y mientras tanto permanece en el saldo de su billetera (acuñación n.º ${id}).`,
  errDepositRefundFailed: (id: string) =>
    `El depósito en el pool falló y el reembolso no se completó (acuñación n.º ${id}). Conserve esta referencia.`,
  errGeneric: "La acuñación fue rechazada.",
};

export default es;
