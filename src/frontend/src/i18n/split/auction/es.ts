import type en from "./en";

const es: typeof en = {
  title: "Subasta",
  intro:
    "Subasta con ofertas selladas del TTTI-T devuelto. Las ofertas son firmes y permanecen ocultas para todos, salvo para su autor. Cada postor paga su propia oferta. Ganan las ofertas más altas, por orden de precio, hasta que se venda el lote.",
  loading: "Cargando la subasta…",
  loadError: "No se pudo cargar la subasta.",
  retryButton: "Reintentar",
  summaryTitle: "Subasta abierta",
  lotSize: "Tamaño del lote",
  closesAt: "Hora de cierre",
  timeLeft: "Tiempo restante",
  closingReached: "Se alcanzó la hora de cierre.",
  reserveHeading: "Precio de reserva",
  reserveUsd: "Precio de reserva actual por TTTI-T",
  reserveEquivalents:
    "Equivalente por TTTI-T en cada token de pago a la tasa actual",
  reserveRule:
    "El precio de reserva es el más alto entre 10 000 USD por TTTI-T, el promedio de 24 horas del precio consolidado del TTTI-T y el precio consolidado actual del TTTI-T. Ninguna oferta inferior pasa y no se reemite nada por debajo de 10 000 USD: el lote permanece en el contrato.",
  componentsHeading: "Valores comparados",
  floorLabel: "Piso fijo por TTTI-T",
  dailyAverageLabel: "Promedio de 24 horas del precio consolidado",
  currentLabel: "Precio consolidado actual",
  appliedBadge: "Aplicado",
  bindingFloor:
    "El piso fijo es el valor más alto y determina el precio de reserva.",
  bindingDailyAverage:
    "El promedio de 24 horas es el valor más alto y determina el precio de reserva.",
  bindingConsolidated:
    "El precio consolidado actual es el valor más alto y determina el precio de reserva.",
  unavailableNote:
    "Un valor que no está disponible se excluye de la comparación.",
  reserveSettlementNote:
    "La parte de mercado del precio de reserva ignora las variaciones de precio causadas por la agrupación de los ganadores en el pool en la liquidación.",
  rateUnavailable: "Sin tasa por el momento",
  consolidatedLabel: "Precio consolidado del TTTI-T",
  consolidatedUnavailable: "No disponible",
  reserveBadge: "Reserva común",
  reserveSentence:
    "10.000 USD × q del depósito de cada ganador van a la reserva común.",
  emptyTitle: "No hay ninguna subasta abierta",
  emptyBody:
    "Una subasta dura 24 horas. Puede abrirse cuando hay TTTI-T devuelto esperando en un lote.",
  nextLot: "Próximo lote",
  nextLotNone: "No hay TTTI-T devuelto esperando en un lote.",
  openButton: "Abrir la subasta",
  openingButton: "Abriendo…",
  openErrorAlreadyOpen: "Ya hay una subasta abierta.",
  openErrorEmptyLot: "No hay TTTI-T devuelto para poner en un lote.",
  openErrorPaused: "La subasta está en pausa.",
  openErrorUnexpected: "No se pudo abrir la subasta. Inténtelo de nuevo.",
  formTitle: "Hacer una oferta",
  formIntro:
    "Una oferta es firme: no se puede retirar ni modificar. El depósito completo se cobra al hacer la oferta.",
  tokenLegend: "Token de pago",
  quantityLabel: "Cantidad (TTTI-T)",
  quantityHint: (minimum: string) =>
    `Mínimo ${minimum} TTTI-T, hasta 8 decimales.`,
  priceLabel: (symbol: string) => `Precio por TTTI-T (${symbol})`,
  priceHint: "Precio en el token elegido, por un TTTI-T entero.",
  depositLabel: (symbol: string) => `Depósito (${symbol}, opcional)`,
  depositHint:
    "Déjelo vacío para depositar el importe requerido. Un depósito mayor que el requerido oculta el tamaño del presupuesto.",
  requiredDepositLabel: "Depósito requerido",
  requiredDepositFormula:
    "(precio + 10.000 USD) × cantidad ÷ 0,99, redondeado hacia arriba",
  splitHeading:
    "Reparto del depósito de un ganador al precio B para q TTTI-T, con la parte bloqueada m y la elección del resto A o B",
  splitReserve: "Reserva común (10.000 USD × q)",
  splitPosition: "Posición del ganador al precio B (zap)",
  splitCreator: "Creador (1 % del importe pagado)",
  splitShare: "Parte bloqueada m",
  splitLocked: "Parte bloqueada (3 meses)",
  splitHand: "TTTI-T entregados a la cartera",
  splitChoicePayment: (choice: string) =>
    `Pago para la elección ${choice} con el m actual`,
  splitShareNote:
    "m se toma en la liquidación: si cambia después de este presupuesto, se aplica el valor de la liquidación.",
  reserveKeptNote:
    "La parte de reserva se conserva tal cual en el token pagado.",
  depositSentLabel: "Depósito enviado",
  requiredDepositPending: "Introduzca una cantidad y un precio.",
  errQuantity: "Introduzca una cantidad con 8 decimales como máximo.",
  errQuantityMin: (minimum: string) =>
    `La cantidad mínima es ${minimum} TTTI-T.`,
  errPrice: (decimals: string) =>
    `Introduzca un precio mayor que cero con ${decimals} decimales como máximo.`,
  errDeposit: (decimals: string) =>
    `Introduzca un depósito con ${decimals} decimales como máximo.`,
  errDepositBelow: (required: string) =>
    `El depósito no puede ser inferior al depósito requerido (${required}).`,
  submitButton: "Hacer la oferta",
  approvingButton: "Esperando la firma…",
  sendingButton: "Enviando la oferta…",
  successMessage: "Oferta registrada.",
  approvalFailed: (detail: string) => `La aprobación no se firmó: ${detail}`,
  unexpectedError: "No se pudo enviar la oferta. Inténtelo de nuevo.",
  signInPrompt: "Inicie sesión para hacer una oferta.",
  blockSaleLabel: "Tipo de venta",
  blockSaleValue: "Venta en bloque",
  blockSaleBadge: "Venta en bloque",
  blockSaleRule:
    "Este lote es una venta en bloque: el mejor precio por TTTI-T gana el lote completo. Se aplica el mismo precio de reserva; una oferta inferior no pasa.",
  blockQuantityLabel: "Cantidad (lote completo, TTTI-T)",
  blockQuantityHint: (lot: string) =>
    `La cantidad es el lote completo: ${lot} TTTI-T. Es fija.`,
  blockPriceHint:
    "Un solo precio por TTTI-T, para el lote completo. El mejor precio gana el lote completo.",
  bidErrWholeLot: (lot: string) =>
    `Este lote es una venta en bloque. La oferta debe ser por el lote completo: ${lot} TTTI-T.`,
  lotRemainderLabel: "Resto del mint en el lote",
  lotRemainderNote:
    "El resto del mint forma parte del lote. Solo se acuña en la liquidación, para el ganador.",
  settleMinted: "TTTI-T acuñados en la liquidación",
  outcomeMinted: (amount: string) =>
    `Acuñados en la liquidación: ${amount} TTTI-T`,
  mintEndedBadge: "Mint finalizado",
  mintEndedTitle: "El mint ha finalizado",
  mintEndedBody: (remainder: string) =>
    `El resto de ${remainder} TTTI-T se une al primer lote de la subasta. Solo se acuña en la liquidación, para el ganador.`,
  mintErrEnded:
    "El mint ha finalizado. El resto se une al primer lote de la subasta y solo se acuña en la liquidación, para el ganador.",
  bidErrTooMany: (maximum: string) =>
    `Se alcanzó el máximo de ${maximum} ofertas por persona.`,
  bidErrInsufficientFunds: (balance: string, required: string) =>
    `Fondos insuficientes: saldo ${balance}, requerido ${required}.`,
  bidErrQuantityBelow: (minimum: string) =>
    `La cantidad es inferior al mínimo de ${minimum} TTTI-T.`,
  bidErrInvalidPrice: "El precio debe ser mayor que cero.",
  bidErrAnonymous: "Inicie sesión para hacer una oferta.",
  bidErrLedger: (detail: string) => `Error del ledger: ${detail}`,
  bidErrAllowance: (required: string, allowance: string) =>
    `La aprobación es demasiado baja: requerido ${required}, aprobado ${allowance}.`,
  bidErrRateUnavailable: (symbol: string) =>
    `No hay ninguna tasa ${symbol}/USD válida en este momento. La oferta no se realizó. Inténtelo de nuevo más tarde.`,
  bidErrNoOpen: "No hay ninguna subasta abierta.",
  bidErrInProgress: "Otra oferta suya se está procesando.",
  bidErrDepositBelow: (deposited: string, required: string) =>
    `El depósito (${deposited}) es inferior al depósito requerido (${required}).`,
  bidErrPaused: "Las ofertas están en pausa.",
  bidErrPriceBelowMinimum: (minimum: string) =>
    `El precio es inferior al mínimo de ${minimum} por TTTI-T al tipo actual.`,
  bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
    `El precio ofrecido (${bid} por TTTI-T) es inferior al mínimo de ${minimum} por TTTI-T al tipo actual.`,
  bidErrDepositBelowFee: (fee: string, deposited: string) =>
    `El depósito (${deposited}) debe cubrir al menos la comisión del ledger (${fee}).`,
  priceMinimumHint: (minimum: string) =>
    `Precio mínimo: ${minimum} por TTTI-T al tipo actual.`,
  myOffersTitle: "Mis ofertas",
  privacyNote: "Las ofertas solo las ve su autor.",
  firmNote: "Las ofertas son firmes: esta lista es de solo lectura.",
  offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
  myOffersEmpty: "No tiene ninguna oferta en esta subasta.",
  colQuantity: "Cantidad (TTTI-T)",
  colPrice: "Precio por TTTI-T",
  colToken: "Token",
  colDeposit: "Depósito",
  colDate: "Fecha",
  closingPendingNotice:
    "Ha pasado la hora de cierre. El cierre espera una tasa válida. Las ofertas de otras personas permanecen ocultas hasta el cierre.",
  closedTitle: "Subastas cerradas",
  closedIntro:
    "Las más recientes primero. Tras el cierre se publican el resultado y todas las ofertas.",
  closedEmpty: "Todavía no se ha cerrado ninguna subasta.",
  closedItemLabel: (id: string, date: string) =>
    `Subasta ${id} · cerrada el ${date}`,
  resultNotPublished: "El resultado todavía no está publicado.",
  resultStatusLabel: "Estado",
  statusFullySold: "Vendido por completo",
  statusPartiallySold: "Vendido en parte",
  statusUnsold: "No vendido",
  resultServedLabel: "Cantidad atendida",
  resultCarriedLabel: "Trasladada al lote siguiente",
  resultOffersLabel: "Ofertas recibidas",
  resultClosedAtLabel: "Cerrada el",
  resultReserveHeading: "Reserva aplicada",
  resultReserveLabel: "Reserva aplicada por TTTI-T",
  resultRatesHeading: "Tasas usadas en el cierre",
  offersHeading: "Ofertas publicadas",
  offersEmpty: "No se hizo ninguna oferta en esta subasta.",
  colBidder: "Ofertante",
  colOutcome: "Resultado",
  colServed: "Cantidad atendida",
  colReturned: "Importe devuelto",
  colAuction: "Subasta",
  youBadge: "Usted",
  outcomeServed: "Atendida",
  outcomePartiallyServed: "Atendida en parte",
  outcomeNotServed: "No atendida",
  outcomeDiscarded: "Descartada por debajo de la reserva",
  outcomePending: "Pendiente de cierre",
  outcomeDetail: (served: string, returned: string) =>
    `Atendido ${served} TTTI-T · devuelto ${returned}`,
  outcomeReturnedOnly: (returned: string) => `Devuelto ${returned}`,
  balanceTitle: "Mi saldo",
  balanceNote:
    "Los depósitos de las cantidades atendidas esperan su liquidación. Las ofertas no atendidas, las partes no atendidas, el exceso de los depósitos y los depósitos de las liquidaciones fallidas se devuelven a su saldo DEX.",
  balanceEmpty: "No hay ningún importe registrado para su cuenta.",
  colAwaiting: "Pendiente de liquidación",
  colReturnedBalance: "Devuelto al saldo",
  balanceRecoverNote:
    "Los importes devueltos están en su saldo DEX. Use allí el botón Recuperar para retirarlos. La parte de reserva de un ganador permanece en la reserva común.",
  balanceRecoverLink: "Abrir el saldo DEX",
  balanceFailedNote: (count: string) =>
    `La liquidación de ${count} de sus ofertas ganadoras falló: el depósito completo se devolvió a su saldo DEX y la cantidad pasó al lote siguiente.`,
  colSettlement: "Liquidación",
  settlementPending: "Pendiente",
  settlementSettled: "Liquidada",
  settlementFailed: "Fallida",
  settlementNotRequired: "No requerida",
  settlementFailedCarried: (carried: string) =>
    `${carried} TTTI-T pasan al lote siguiente`,
  settlementSummaryLabel: "Liquidación de los ganadores",
  settlementSummary: (settled: string, pending: string, failed: string) =>
    `${settled} liquidadas · ${pending} pendientes · ${failed} fallidas`,
  settlementFailedCarriedLabel:
    "Pasa al lote siguiente tras liquidaciones fallidas",
  settlementHeading: "Liquidación de los ganadores",
  settlementRule:
    "Para una cantidad atendida q al precio B, el ganador paga (B + 10.000 USD) × q ÷ 0,99, tomados del depósito. 10.000 USD × q van a la reserva común, B × q y los q TTTI-T van a la posición del ganador (zap), y el 1 % del importe pagado va al creador. La parte de reserva se calcula en USD y se mantiene en el token pagado (ICP, ckBTC, ckUSDC o ckUSDT), sin conversión. El resto del depósito se devuelve al saldo DEX. Si la liquidación de un ganador falla, no se crea ninguna posición y no se aporta nada a la reserva común, el depósito completo se devuelve al saldo DEX y la cantidad pasa al lote siguiente. Los demás ganadores no se ven afectados.",
  settleTaken: "Importe tomado del depósito",
  settleCreator: "Parte del creador (1 %)",
  settlePosition: "Posición",
  settlePositionValue: (amount: string, quantity: string) =>
    `${amount} con ${quantity} TTTI-T`,
  settleReserve: "Reserva común",
  settleSurplus: "Exceso del depósito devuelto al saldo DEX",
  settleNoPosition: "Posición y parte de reserva",
  settleNone: "Ninguna",
  settleDepositReturned: "Depósito completo devuelto al saldo DEX",
  settleCarried: "Cantidad que pasa al lote siguiente",
  settleFailureReason: "Motivo",
};

export default es;
