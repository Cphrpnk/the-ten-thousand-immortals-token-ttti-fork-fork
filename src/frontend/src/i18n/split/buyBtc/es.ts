import type en from "./en";

const es: typeof en = {
  requestFailed: "No se pudo completar la solicitud. Inténtelo de nuevo.",
  errorTitle: "Compra con Bitcoin",
  intro:
    "Envíe BTC a su propia dirección Bitcoin. Se convierte en ckBTC y luego en TTTI-T al tipo horario. El 1 % del importe va al creador.",
  recordingAcks: "Registrando las confirmaciones de compra…",
  creatingAddress: "Creando la dirección…",
  getAddress: "Obtener mi dirección Bitcoin",
  tickAll: "Marque las seis declaraciones para obtener su dirección.",
  purchaseAddressLabel: "Su dirección Bitcoin de compra",
  sentToDelivery: "El TTTI-T se envía a su dirección de entrega de abajo.",
  keepPageOpen:
    "Mantenga esta página abierta hasta que se detecte su depósito. Si sale de ella, su compra se completará cuando vuelva a esta página, al tipo de cambio de ese momento. Si para entonces la venta ha terminado, se le reembolsará en ckBTC.",
  delivered: (amount: string) => `${amount} TTTI-T entregados`,
  deliveredDetail: "Al tipo horario de ckBTC",
  refunded: (amount: string) => `${amount} devueltos a su wallet`,
  refundedDetail:
    "La conversión no pudo completarse, por lo que el ckBTC se devolvió automáticamente.",
  addressDefaultLabel: "Dirección de depósito Bitcoin",
  addressCopiedToast: "Dirección Bitcoin copiada",
  addressCopyFailedToast: "No se pudo copiar la dirección",
  qrTitle: (address: string) => `Código QR de la dirección Bitcoin ${address}`,
  copyAddressAria: (address: string) =>
    `Copiar la dirección Bitcoin ${address}`,
  copied: "Copiada",
  clickToCopy: "Haga clic en la dirección para copiarla.",
  errValueTooSmall: (minimum: string) =>
    `Depósito demasiado pequeño: inferior al mínimo de ${minimum}. No se ha convertido.`,
  errTainted: "Depósito rechazado por el minter de ckBTC.",
  errMinterUnavailable:
    "El minter de ckBTC no está disponible. Vuelva a comprobarlo más tarde.",
  errOther: (server: string | undefined) =>
    server
      ? `No se pudo procesar el depósito. ${server}`
      : "No se pudo procesar el depósito.",
  notYet: "Todavía no",
  finalWallet: "ckBTC en su wallet",
  finalRefunded: "Reembolsado en ckBTC",
  finalDelivered: "TTTI-T entregado",
  stepAddress: "Dirección mostrada",
  stepDetected: "Depósito detectado",
  stepConfirmations: (count: string) => `Confirmaciones ${count}`,
  stepMinted: "ckBTC creado",
  amountBtcDetected: "BTC detectado",
  amountCkbtcCreated: "ckBTC creado",
  amountCkbtcPending: "ckBTC pendiente",
  amountRefunded: "Reembolsado",
  amountTttiDelivered: "TTTI-T entregado",
  progressAria: "Progreso del depósito Bitcoin",
  pendingRate:
    "Tipo no disponible. El ckBTC se conserva hasta el próximo tipo horario.",
  lastChecked: (time: string) => `Última comprobación: ${time}`,
  checking: "Comprobando…",
  check: "Comprobar",
  flowWallet: "BTC → ckBTC (wallet)",
  flowPurchase: "BTC → TTTI-T (compra)",
  noDepositYet: "Todavía no se ha recibido ningún depósito en esta dirección.",
  earlierDeposits: "Depósitos anteriores en esta dirección",
  depositNumber: (n: string) => `Depósito ${n}`,
  detectedOn: (time: string) => `Detectado el ${time}`,
  stagePendingRate: "En espera del tipo horario",
  conversionCauseLine: (cause: string) => `Estado de la conversión: ${cause}`,
  pendingDepositStatus: "Depósito Bitcoin en curso.",
  pendingDepositLink: "Ver el depósito Bitcoin",
  errUnrecoverable: (server: string | undefined) =>
    server
      ? `Este depósito no se puede procesar. ${server}`
      : "Este depósito no se puede procesar.",
  refundFailed: (amount: string) =>
    `El reembolso del excedente ha fallado. ${amount} siguen retenidos; el reembolso se reintenta automáticamente.`,
  waitingNewTransfer: "Esperando una nueva transferencia a esta dirección.",
  depositFinished: (n: string, status: string) => `Depósito ${n}: ${status}.`,
  waitForNew: "Esperar una nueva transferencia",
  otherDeposits: "Otros depósitos en esta dirección",
  reuseWallet:
    "Envíe BTC a esta dirección desde cualquier wallet Bitcoin. Cada nueva transferencia se convierte en ckBTC automáticamente. La misma dirección se puede reutilizar.",
  reusePurchase:
    "Envíe BTC a esta dirección desde cualquier wallet Bitcoin. Cada nueva transferencia se convierte y se entrega como TTTI-T automáticamente. La misma dirección se puede reutilizar.",
  waitingDepositStatus:
    "Dirección Bitcoin en espera de una nueva transferencia.",
  waitingDepositLink: "Ver la dirección Bitcoin",
  refundCause: (cause: string) => `Causa: ${cause}`,
  refundPurposeFull: "Importe devuelto íntegramente",
  refundPurposeExcess: "Excedente devuelto",
  refundPurposeDeliveryFailed: "Entrega fallida, importe devuelto",
  refundSending: "El reembolso se está enviando.",
  refundRetrying: "El reembolso se reintenta automáticamente.",
  refundTxLabel: "Transacción de reembolso",
  heldNote: (amount: string) =>
    `${amount} en poder del contrato. Use el botón Mint de abajo para convertirlos ahora. Si la conversión no puede completarse, se abre automáticamente un reembolso a su wallet.`,
  convertDelivered: (amount: string) => `${amount} TTTI-T entregados`,
  convertRefunded: (amount: string) => `${amount} devueltos a su wallet`,
  convertStillHeld: (amount: string) =>
    `${amount} siguen en poder del contrato. La conversión se reintenta automáticamente.`,
  convertNothing: "No había ckBTC pendiente de conversión.",
  convertFailedTitle: "Conversión no completada",
  convertNothingTaken:
    "No se ha cobrado nada: sus fondos permanecen con usted o se devuelven a su monedero. Puede volver a pulsar Mint.",
  depositAlertDeliveredTitle: "Depósito de Bitcoin entregado",
  depositAlertDeliveredText: (amount: string) =>
    `${amount} recibidos por su depósito de Bitcoin.`,
  depositAlertRefundedTitle: "Depósito de Bitcoin reembolsado",
  depositAlertRefundedText: (amount: string) =>
    `${amount} devueltos a su wallet. La conversión no pudo completarse.`,
  depositAlertViewDeposit: "Ver el depósito",
  depositAlertViewHistory: "Ver el historial",
};

export default es;
