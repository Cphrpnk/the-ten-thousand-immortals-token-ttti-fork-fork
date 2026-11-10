import type en from "./en";

const es: typeof en = {
  // Page
  title: "Billetera",
  intro: "Conecte su wallet, consulte sus saldos y envíe o reciba tokens.",
  activeIdentity: "Identidad activa",
  connectedWith: (source: string) => `Conectado con ${source}`,
  noWalletYet: "Todavía no hay ningún wallet conectado",
  account: "Cuenta",
  notConnected: "No conectado",
  copy: "Copiar",
  signOutIi: "Cerrar sesión de II",
  connectIi: "Conectar Internet Identity",
  disconnectPlug: "Desconectar Plug",
  connectPlug: "Conectar Plug",
  plugNotDetected:
    "No se detectó la extensión Plug. Instale Plug para conectar un wallet de navegador.",
  balances: "Saldos",
  tokensUnavailable:
    "Lista de tokens no disponible. Los ledgers no respondieron.",
  retry: "Reintentar",
  noTokens: "Todavía no hay tokens disponibles para este wallet.",
  toastAccountCopiedClipboard: "Cuenta copiada al portapapeles",
  toastCopyFailed: "No se pudo copiar la cuenta",
  toastPlugConnected: "Wallet Plug conectado",
  toastPlugConnectFailed: "No se pudo conectar Plug",
  toastPlugDisconnected: "Wallet Plug desconectado",
  disconnectWallet: (name: string) => `Desconectar ${name}`,
  toastWalletDisconnected: (name: string) => `${name} desconectado`,
  toastIiSignedOut: "Sesión de Internet Identity cerrada",
  // Token balance card
  refreshBalance: (symbol: string) => `Actualizar el saldo de ${symbol}`,
  connectToViewBalance: "Conecte un wallet para ver este saldo.",
  balanceUnavailable: "Saldo no disponible. El ledger no respondió.",
  // Send panel
  send: "Enviar",
  sending: "Enviando…",
  sendDescription: "Envíe tokens desde su wallet conectado.",
  token: "Token",
  selectToken: "Seleccione un token",
  recipientPrincipal: "Principal del destinatario",
  amount: "Importe",
  fee: "Comisión:",
  balanceSuffix: (amount: string, symbol: string) =>
    ` · Saldo: ${amount} ${symbol}`,
  sendConnectHint:
    "Inicie sesión con Internet Identity o conecte OISY, NFID Wallet o Plug para enviar tokens.",
  errConnectWallet: "Conecte un wallet antes de enviar.",
  errSelectToken: "Seleccione un token para enviar.",
  errRecipient: "Introduzca un principal de destinatario válido.",
  errAmount: (symbol: string) => `Introduzca un importe de ${symbol} válido.`,
  errInsufficient: (symbol: string, have: string, need: string) =>
    `Saldo de ${symbol} insuficiente. Tiene ${have} ${symbol}, pero necesita ${need} ${symbol}, comisión incluida.`,
  errTransferFailed: "No se pudo completar la transferencia.",
  errBadFee: "El ledger rechazó la comisión. Actualice e inténtelo de nuevo.",
  errInsufficientFunds: "Saldo insuficiente para esta transferencia.",
  errTooOld: "La transferencia ha caducado. Inténtelo de nuevo.",
  errCreatedInFuture:
    "La marca de tiempo de la transferencia no es válida. Inténtelo de nuevo.",
  errDuplicate: "Esta transferencia ya se envió.",
  errTemporarilyUnavailable:
    "El ledger no está disponible temporalmente. Inténtelo de nuevo en breve.",
  errGeneric: "El ledger rechazó la transferencia.",
  sentSuccess: (amount: string, symbol: string, to: string) =>
    `Se enviaron ${amount} ${symbol} a ${to}.`,
  toastSent: (symbol: string) => `${symbol} enviados`,
  // Receive panel
  receive: "Recibir",
  receiveDescription: "Comparta su cuenta para recibir tokens.",
  receiveConnectHint: "Conecte un wallet para ver su cuenta.",
  copied: "Copiado",
  copyAccount: "Copiar cuenta",
  receivingTo: (symbol: string) => `Recepción de ${symbol} en esta cuenta.`,
  toastAccountCopied: "Cuenta copiada",
  // BTC → ckBTC panel
  btcFact: (minDeposit: string, confirmations: string) =>
    `Depósito mínimo ${minDeposit} · ${confirmations} confirmaciones de Bitcoin · los ckBTC llegan a su wallet, sin comisión de la app, sin creación de TTTI-T.`,
  btcCreditedTo: (wallet: string) =>
    `Los ckBTC de esta dirección se abonan en ${wallet}.`,
  btcWalletBalance: (wallet: string) => `Saldo de ckBTC de ${wallet}`,
  btcSignatureEachCheck: (wallet: string) =>
    `${wallet} pide una firma en cada verificación.`,
  btcBalanceUnavailable: "No disponible",
  btcAddressLabel: "Su dirección Bitcoin",
  btcGetAddress: "Obtener mi dirección Bitcoin",
  // Delivery address reminder
  deliveryTitle: "No hay ninguna dirección de entrega guardada",
  deliveryBody: (symbol: string) =>
    `Si lo desea, añada el Principal ID que recibirá más adelante sus tokens ${symbol}. Puede cambiarlo en cualquier momento.`,
  deliveryAdd: "Añadir dirección de entrega",
  // Purchase history
  historyTitle: "Historial de compras",
  historyDate: "Fecha",
  historyStatus: "Estado",
  historyPaidToken: "Token pagado",
  historyPaid: "Cantidad pagada (comisión incluida)",
  historyFee: "Comisión",
  historyNet: "Importe neto intercambiado (sin comisión)",
  historyReceived: "TTTI-T recibidos",
  historyRatioTttiPerPaid: "TTTI-T por 1 token pagado",
  historyRatioPaidPerTtti: "Token pagado por 1 TTTI-T",
  historyStatusCompleted: "Completada",
  historyStatusFailed: "Fallida",
  historyStatusRefunded: "Reembolsada",
  historyStatusRefundFailed: "Reembolso fallido",
  historyStatusRefundReview: "Reembolso en revisión",
  historyShowDetails: "Mostrar detalles",
  historyHideDetails: "Ocultar detalles",
  historyRecipient: "Dirección del destinatario",
  historyPaymentBlock: "Bloque de pago",
  historyMintBlock: "Bloque de creación",
  historyUnavailable: "No disponible",
  historyEmpty: "Todavía no hay compras.",
  historyLoading: "Cargando el historial de compras…",
  historyError: "Historial de compras no disponible. El canister no respondió.",
  // Summary, token list and history (OISY-like layout)
  totalValue: "Valor total",
  swap: "Intercambiar",
  tokens: "Tokens",
  priceHourlyAverage: "precio consolidado",
  refreshPrice: "Actualizar el precio consolidado del TTTI-T",
  totalNote:
    "El TTTI-T se valora al precio consolidado (promedio de la hora), que se vuelve a leer cuando lo actualizas. Los tokens sin cotización en USD no se contabilizan.",
  reserveLink: "Canjear TTTI-T con la reserva común",
  tttiUnvalued:
    "El precio consolidado no está disponible, por lo que el TTTI-T no se valora.",
  historyButton: "Historial",
  buy: "Comprar",
  advancedTransfer: "Transferencia avanzada",
  toastBuyCopied: "Dirección copiada: pégala en Onramper",
  tokenActions: (symbol: string) => `Acciones de ${symbol}`,
  tokenHistoryTitle: (symbol: string) => `Historial de ${symbol}`,
  walletHistoryTitle: "Historial",
  movementsTitle: "Movimientos de TTTI-T",
  movementSent: "Enviado",
  movementReceived: "Recibido",
  movementMinted: "Creado",
  movementApproval: "Autorización",
  movementFrom: "De",
  movementTo: "A",
  movementsEmpty: "Todavía no hay movimientos de TTTI-T.",
  movementsLoading: "Cargando los movimientos de TTTI-T…",
  movementsError:
    "Movimientos de TTTI-T no disponibles. El ledger no respondió.",
  movementsConnect: "Conecte un wallet para ver los movimientos de TTTI-T.",
  pagePrevious: "Anterior",
  pageNext: "Siguiente",
  pageNumber: (page: string) => `Página ${page}`,
  purchasesNeedIi:
    "El historial de compras está disponible con Internet Identity.",
  purchasesPaidWith: (symbol: string) => `Compras pagadas con ${symbol}`,
  accountOnDashboard: (symbol: string) =>
    `Su cuenta ${symbol} en el ICP Dashboard`,
};

export default es;
