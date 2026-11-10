import type en from "./en";

const es: typeof en = {
  description:
    "Intercambie ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT y los tokens listados en ICPSwap que añada, a través de un pool de ICPSwap, desde su propio wallet.",
  from: "De",
  to: "A",
  switchTokens: "Invertir los dos tokens",
  amount: "Importe",
  balance: (amount: string, symbol: string) => `Saldo: ${amount} ${symbol}`,
  sameToken: "Elija dos tokens distintos.",
  poolLoading: "Buscando el pool de ICPSwap…",
  poolError: "No se pudo leer el pool de ICPSwap.",
  noPool: (a: string, b: string) =>
    `ICPSwap no tiene un pool directo para ${a} y ${b}. Este par no se puede intercambiar aquí.`,
  quoteLoading: "Leyendo la cotización de ICPSwap…",
  quoteError: "El pool de ICPSwap no devolvió una cotización.",
  livePriceUnavailable:
    "El precio de ICPSwap en tiempo real no está disponible, por lo que no se inició el intercambio. Inténtalo de nuevo en un momento.",
  quoteExpired: "La cotización ha caducado. Actualícela antes de intercambiar.",
  refreshQuote: "Actualizar cotización",
  estimated: "Importe estimado recibido",
  poolFee: "Comisión del pool",
  ledgerFees: "Comisiones de los ledgers",
  ledgerFeesValue: (inFees: string, outFee: string) =>
    `${inFees} (autorización y depósito) + ${outFee} (retirada)`,
  minimumReceived: "Mínimo garantizado recibido",
  slippage: "Tolerancia de deslizamiento",
  slippageHint:
    "ICPSwap rechaza el intercambio si el importe obtenido es inferior al mínimo garantizado.",
  slippageInvalid: "Introduzca una tolerancia entre 0,01 % y 50 %.",
  amountInvalid: (symbol: string) =>
    `Introduzca un importe de ${symbol} válido.`,
  insufficient: (max: string, symbol: string) =>
    `Importe superior al saldo utilizable. Máximo: ${max} ${symbol} (saldo menos las comisiones de autorización y depósito).`,
  tooSmall: "El importe estimado no cubre la comisión de retirada.",
  connectHint: "Conecte un wallet para intercambiar.",
  review: "Revisar el intercambio",
  confirmTitle: "Lo que firma",
  confirmApproval: (amount: string, symbol: string, pool: string) =>
    `Una autorización ICRC-2 que permite al pool de ICPSwap ${pool} tomar exactamente ${amount} ${symbol} (importe intercambiado más una comisión de ledger) de su cuenta.`,
  confirmExpiry: (time: string) =>
    `La autorización caduca 15 minutos después de la firma (hacia las ${time}).`,
  confirmSteps: (symbolIn: string, symbolOut: string) =>
    `Después, el pool toma los ${symbolIn} (depósito), los intercambia y envía los ${symbolOut} a su wallet (retirada). Su wallet puede pedirle que confirme cada paso.`,
  confirmMinimum: (amount: string, symbol: string) =>
    `Mínimo recibido: ${amount} ${symbol}. Por debajo, el intercambio se rechaza.`,
  confirmSigner: (wallet: string) =>
    `Firmado por ${wallet}, que contiene esta cuenta.`,
  warning:
    "ICPSwap es una plataforma de intercambio de terceros. Los intercambios son definitivos y las comisiones de los ledgers no se reembolsan. Si un paso falla, el importe depositado queda en el pool hasta que lo retire.",
  confirmCheck: "He leído lo que firmo y confirmo este intercambio.",
  confirm: "Confirmar y firmar",
  back: "Volver",
  stepApprove: "Autorización en el wallet…",
  stepDeposit: "Depósito en el pool…",
  stepSwap: "Intercambio…",
  stepWithdraw: "Retirada a su wallet…",
  refused: "La firma fue rechazada. No se intercambió nada.",
  slippageError:
    "El pool rechazó el intercambio: el importe obtenido sería inferior al mínimo garantizado. Actualice la cotización o aumente la tolerancia.",
  failed: (detail: string) => `El intercambio no se completó: ${detail}`,
  success: (amount: string, symbol: string) =>
    `Intercambio completado. ${amount} ${symbol} recibidos en su wallet.`,
  newSwap: "Nuevo intercambio",
  unusedTitle: "Saldo restante en el pool de ICPSwap",
  unusedText:
    "El pool conserva este importe para su cuenta tras un intercambio incompleto.",
  dexBalanceTitle: "Saldo restante en el DEX",
  dexBalanceText:
    "El DEX conserva este importe para su cuenta tras un intercambio incompleto.",
  withdrawUnused: "Retirar a mi wallet",
  withdrawing: "Retirando…",
  withdrawDone: "Saldo retirado a su wallet.",
  withdrawFailed: (detail: string) => `La retirada falló: ${detail}`,
  feeError:
    "No se pudo leer la comisión del ledger del token. Inténtelo de nuevo.",
  addToken: "Añadir un token",
  addTokenLabel: "Símbolo o ID del ledger",
  addTokenHint:
    "Busque un token listado en ICPSwap por su símbolo o pegue el ID de su ledger. Los tokens añadidos se guardan en este navegador y solo aparecen en este selector.",
  addTokenSubmit: "Añadir",
  addTokenReading: "Leyendo el ledger del token…",
  addTokenListLoading: "Leyendo la lista de tokens de ICPSwap…",
  addTokenListError:
    "No se pudo leer la lista de tokens de ICPSwap. Pegue el ID del ledger.",
  addTokenNoMatch:
    "Ningún token listado en ICPSwap coincide con este símbolo. Pegue el ID del ledger.",
  addTokenInvalidId: "ID de ledger no válido.",
  addTokenNotIcrc:
    "Este canister no devolvió metadatos de token ICRC-1. No se puede añadir.",
  addTokenAlready: (symbol: string) => `${symbol} ya está en la lista.`,
  addTokenDone: (symbol: string) => `${symbol} añadido.`,
  addedTokens: "Tokens añadidos",
  removeToken: (symbol: string) => `Quitar ${symbol}`,
  closeAddToken: "Cerrar",
  unifiedDescription:
    "Intercambie ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT y los tokens listados en ICPSwap que añada, a través de los pools nativos o de ICPSwap, desde su propio wallet.",
  routesTitle: "Rutas",
  routeBestPrice: "Mejor precio",
  routeSelected: "Seleccionada",
  routeEnterAmount:
    "Introduzca un importe para ver la cotización de esta ruta.",
  routeQuoteLoading: "Leyendo la cotización…",
  routeNativeNoPool: (a: string, b: string) =>
    `No existe ningún pool nativo para ${a} y ${b}.`,
  routeIcpswapNoPool: (a: string, b: string) =>
    `ICPSwap no tiene un pool directo para ${a} y ${b}.`,
  routeNativeAccount:
    "La ruta por el pool nativo solo está disponible para la cuenta conectada en este sitio.",
  routeNativeError: "El pool nativo no devolvió una cotización.",
  routeOnlyIcpswap: "Solo se ofrece ICPSwap para este par.",
  routeOnlyNative: "Solo se ofrece el pool nativo para este par.",
  bestPriceNote:
    "Mejor precio: la ruta que devuelve más tokens, comisiones incluidas. Se ejecuta la ruta que usted selecciona.",
  routeUsed: "Ruta utilizada",
  amountGiven: "Importe entregado",
  confirmNativeApproval: (amount: string, symbol: string) =>
    `Una aprobación ICRC-2 que permite al DEX tomar hasta ${amount} ${symbol} (importe del intercambio más una comisión del ledger) de su cuenta.`,
  confirmNativeSteps: (symbolIn: string, symbolOut: string) =>
    `El DEX toma después los ${symbolIn} (depósito), los intercambia en el pool nativo y envía los ${symbolOut} a su wallet (retiro).`,
  warningNative:
    "Los intercambios son definitivos y las comisiones del ledger no se reembolsan. Si el retiro falla, el importe intercambiado permanece en su saldo del DEX.",
  nativeWithdrawFailed: (amount: string, symbol: string, detail: string) =>
    `El intercambio se completó, pero falló el retiro de ${amount} ${symbol} a su wallet: ${detail}. El importe permanece en su saldo del DEX.`,
};

export default es;
