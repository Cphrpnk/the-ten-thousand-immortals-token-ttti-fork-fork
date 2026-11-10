import type en from "./en";

const es: typeof en = {
  title: "Canje",
  ruleSummary: "1 TTTI-T se canjea por un máximo de 10 000 USD, sin comisión.",
  rulePayout:
    "El importe pagado es el menor entre 10 000 USD × x y la reserva dividida entre los TTTI-T en circulación fuera del contrato × x, donde x son los TTTI-T canjeados.",
  rulePayment:
    "Se paga en ICP, ckBTC, ckUSDC y ckUSDT, en proporción a la composición de la reserva. Un canje no puede superar los TTTI-T en circulación fuera del contrato.",
  ruleAnyHolder:
    "La reserva es común a todos los titulares. Cualquier titular puede canjear, incluido quien nunca hizo mint.",
  ruleMintLock:
    "En un mint, una parte variable m de los TTTI-T se aporta al pool y se bloquea a nombre de quien hace el mint. El relevo la libera como máximo a los 3 meses.",
  ruleMintChoice:
    "Antes de pagar, quien hace el mint elige aportar el resto (1 − m) al pool (opción A) o conservarlo en el wallet (opción B).",
  ruleMintReserve:
    "La reserva común recibe 10 000 USD por cada TTTI-T del que se hace mint, sea cual sea la opción. Se calcula en USD y se mantiene en el token pagado (ICP, ckBTC, ckUSDC o ckUSDT), sin conversión.",
  redeemHeldNote:
    "Cualquier TTTI-T en posesión puede canjearse por hasta 10 000 USD de la reserva común, incluido el TTTI-T conservado en el wallet con la opción B.",
  signInPrompt: "Inicia sesión para canjear TTTI-T.",
  loadError: "No se pudieron cargar tus canjes.",
  retryButton: "Reintentar",
  reserveTitle: "Reserva",
  reserveLoading: "Cargando la reserva…",
  reserveLoadError: "No se pudo cargar la reserva.",
  reserveTotalLabel: "Reserva (USD)",
  reserveTokenLabel: (symbol: string) => `Reserva en ${symbol}`,
  circulationLabel: "TTTI-T en circulación fuera del contrato",
  reservePerTtiLabel: "Reserva por TTTI-T",
  reservePerTtttiNone: "Ningún TTTI-T en circulación",
  requiredLabel: "Requerido (10 000 USD × circulación)",
  invariantLabel: "Invariante",
  invariantHolds: "Reserva al menos igual al importe requerido",
  invariantBroken: "Reserva inferior al importe requerido",
  shortfallLabel: "Déficit",
  shortfallNone: "Ninguno",
  reserveRateMissing: (symbol: string) => `sin tasa para ${symbol}`,
  redeemTitle: "Canjear",
  redeemIntro:
    "Devuelve TTTI-T contra la reserva común. La vista previa muestra el importe exacto recibido antes de firmar nada.",
  amountLabel: "TTTI-T a canjear",
  amountPlaceholder: "0,0",
  maxButton: "Máx.",
  amountInvalid: "Introduce un importe mayor que cero.",
  redeemButton: "Canjear",
  redeemingButton: "Canjeando…",
  previewTitle: "Vista previa",
  previewLoading: "Calculando…",
  previewCap: "10 000 USD × x",
  previewReserveShare: "Reserva ÷ circulación fuera del contrato × x",
  previewPaidIn: (symbol: string) => `Pagado en ${symbol}`,
  previewCirculation: "TTTI-T en circulación fuera del contrato",
  previewNet: "Recibes (el menor de los dos)",
  previewUsdNote: "Los valores en USD usan las tasas de esta vista previa.",
  previewLedgerFeeNote:
    "Las comisiones del ledger del pago no se deducen del importe recibido.",
  returnedTttiNote:
    "Los TTTI-T devueltos quedan en poder del contrato y salen de la circulación fuera del contrato. No se quema nada.",
  allowanceTitle: "Aprobación de TTTI-T",
  allowanceExplain: (amount: string, fee: string, required: string) =>
    `Devolver TTTI-T requiere una aprobación ICRC-2 por el importe devuelto más la comisión del ledger de TTTI-T: ${amount} + ${fee} = ${required}.`,
  allowanceCurrent: (allowance: string) => `Aprobación actual: ${allowance}`,
  allowanceOk: "La aprobación actual cubre este canje.",
  allowanceMissing:
    "La aprobación actual no basta. Se solicita antes del canje.",
  approvingButton: "Aprobando…",
  allowanceExpiryNote:
    "Una aprobación siempre tiene caducidad. Comprueba el importe y la fecha en tu wallet antes de confirmar.",
  historyTitle: "Mis canjes",
  historyEmpty: "Aún no hay canjes.",
  statusCompleted: "Completado",
  statusInProgress: "En curso",
  statusNeedsReview: "Por revisar",
  statusFailed: "Fallido",
  historyReturned: "TTTI-T devueltos",
  historyNet: "Recibido",
  historyPullBlock: "Bloque TTTI-T",
  historyPayoutBlock: "Bloque del pago",
  resultCompleted: (net: string) => `Completado. Recibiste ${net}.`,
  resultInProgress:
    "El pago está en curso. Aparece en la lista de abajo cuando se complete.",
  resultNeedsReview:
    "El pago debe verificarse. Permanece en la lista de abajo con su estado.",
  resultFailed: "El pago no se completó.",
  errAnonymous: "Inicia sesión para canjear.",
  errSalesPaused: "Los canjes están en pausa.",
  errAmountTooSmall:
    "El importe es demasiado pequeño para pagarse. El canje no es posible.",
  errAmountExceedsCirculation: (requested: string, circulation: string) =>
    `El importe ${requested} supera los TTTI-T en circulación fuera del contrato: ${circulation}.`,
  errReserveEmpty: "La reserva está vacía. El canje no es posible.",
  errRateUnavailable: (symbol: string) =>
    `No hay tasa disponible para ${symbol} en este momento. Inténtalo más tarde.`,
  errLedgerFeeNotCovered: (symbol: string, fee: string) =>
    `El importe no cubre la comisión del ledger de ${symbol} del pago (${fee}). El canje no es posible.`,
  errTttiBalance: (balance: string, required: string) =>
    `El saldo de TTTI-T es ${balance}; se necesitan ${required}.`,
  errAllowance: (allowance: string, required: string) =>
    `La aprobación de TTTI-T es ${allowance}; se necesitan ${required}.`,
  errSlippage: (payout: string, expected: string) =>
    `El importe recibido sería ${payout}, inferior a los ${expected} mostrados en la vista previa. Actualiza la vista previa e inténtalo de nuevo.`,
  errRedemptionInProgress: "Ya hay un canje en curso.",
  errNothingToConvert: "No hay nada que convertir para esta operación.",
  errConversionFailed: (detail: string) => `La conversión falló: ${detail}`,
  errPullFailed: (detail: string) =>
    `No se pudieron cobrar los TTTI-T: ${detail}`,
  errCallFailed: (detail: string) => `La solicitud falló: ${detail}`,
  errInvalidAmount: "Introduce un importe válido.",
  errAcknowledgementRequired:
    "Hay que aceptar las condiciones del wallet antes de canjear. Abre el paso de aceptación, acepta las condiciones y vuelve a canjear.",
  acceptanceChecking: "Comprobando las condiciones del wallet…",
  acceptanceMissing:
    "Las condiciones del wallet no se han aceptado para esta cuenta. Deben aceptarse antes de canjear.",
  openAcceptanceButton: "Revisar y aceptar las condiciones del wallet",
  percentShare: "Parte del importe canjeable",
  percentComputedOn:
    "Calculado sobre el importe canjeable: el menor entre los TTTI-T en posesión y los TTTI-T en circulación fuera del contrato.",
  balanceNone: "Este wallet no tiene TTTI-T canjeables.",
  heldLabel: "TTTI-T en posesión",
  limitedByBalance: (held: string, max: string) =>
    `Los TTTI-T en posesión (${held}) limitan el importe a ${max}.`,
  limitedByCirculation: (circulation: string, max: string) =>
    `Los TTTI-T en circulación fuera del contrato (${circulation}) limitan el importe a ${max}.`,
  confirmTitle: "Confirmar el canje",
  confirmIntro:
    "Firmas una aprobación ICRC-2 de TTTI-T para el contrato. Después el contrato cobra los TTTI-T y paga el importe mostrado, en los tokens de la reserva (ICP, ckBTC, ckUSDC y ckUSDT).",
  confirmExpiry: "La aprobación caduca a los 15 minutos.",
  closeButton: "Cerrar",
  cancelButton: "Cancelar",
  resultTitle: "Resultado",
};

export default es;
