import type en from "./en";

const es: typeof en = {
  contractAddressRefused:
    "Los tokens no se pueden quemar; las transferencias a la dirección del contrato se rechazan.",
  badFee:
    "La comisión de transferencia ha cambiado. Actualice e inténtelo de nuevo.",
  insufficientFundsBalance: (balance: string, symbol: string) =>
    `Fondos insuficientes. Su saldo es de ${balance} ${symbol}.`,
  insufficientFunds: "Fondos insuficientes para esta transferencia.",
  insufficientAllowanceAmount: (allowance: string, symbol: string) =>
    `La autorización es insuficiente. Autorización actual: ${allowance} ${symbol}.`,
  insufficientAllowance:
    "La autorización es insuficiente para esta transferencia.",
  duplicateTransfer: "Esta transacción ya se procesó.",
  temporarilyUnavailable:
    "El ledger no está disponible temporalmente. Inténtelo de nuevo en breve.",
  createdInFuture:
    "El ledger rechazó esta operación por estar creada en el futuro. Inténtelo de nuevo.",
  tooOldTransfer:
    "Esta transacción es demasiado antigua para procesarse. Inténtelo de nuevo.",
  genericRejected:
    "El ledger rechazó esta solicitud. Compruebe el destino e inténtelo de nuevo.",
  rejected: "El ledger rechazó esta solicitud.",
  allowanceChangedAmount: (current: string, symbol: string) =>
    `La autorización ha cambiado. Autorización actual: ${current} ${symbol}.`,
  allowanceChanged:
    "La autorización ha cambiado. Actualice e inténtelo de nuevo.",
  approveExpired: "Esta aprobación caducó antes de procesarse.",
  approveExpiredFrom: "El plazo de aprobación ha caducado. Inténtelo de nuevo.",
  approveInsufficientFunds:
    "Fondos insuficientes para cubrir la comisión de aprobación.",
  approveBadFee:
    "La comisión de aprobación ha cambiado. Actualice e inténtelo de nuevo.",
  approveDuplicate: "Esta aprobación ya se procesó.",
  approveTooOld:
    "Esta aprobación es demasiado antigua para procesarse. Inténtelo de nuevo.",
  approveRejected: "El ledger rechazó esta aprobación.",
  destinationUnavailable:
    "La verificación del destino no está disponible. Inténtelo de nuevo en breve.",
  invalidAmount: (decimals: number) =>
    `Introduzca un importe mayor que 0 con un máximo de ${decimals} decimales.`,
  transferFailed:
    "La transferencia falló. Compruebe el destino e inténtelo de nuevo.",
  amountLabel: (symbol: string) => `Importe (${symbol})`,

  signedOutTitle: "Inicie sesión para gestionar sus tokens",
  signedOutBody:
    "Las transferencias y aprobaciones están vinculadas a su principal de Internet Identity. Inicie sesión desde el encabezado para continuar.",
  balanceLabel: "Su saldo",

  invalidRecipient: "Introduzca un Principal ID de destinatario válido.",
  transferSent: (amount: string, symbol: string, to: string) =>
    `Se enviaron ${amount} ${symbol} a ${to}.`,
  toastTransfer: "Transferencia completada",
  transferTitle: (symbol: string) => `Transferir ${symbol}`,
  transferDescription: (fee: string, symbol: string) =>
    `Envíe tokens desde su principal a otra cuenta. La comisión de transferencia de ${fee} ${symbol} se descuenta de su saldo y se abona al recaudador de comisiones.`,
  recipientLabel: "Principal del destinatario",
  transferHint: (decimals: number, fee: string, symbol: string, from: string) =>
    `Máximo ${decimals} decimales. Comisión: ${fee} ${symbol}. Envío desde ${from}.`,
  sending: "Enviando...",
  sendTokens: "Enviar tokens",

  invalidSpender: "Introduzca un Principal ID de gastador válido.",
  invalidAllowance: (decimals: number) =>
    `Introduzca una autorización mayor que 0 con un máximo de ${decimals} decimales.`,
  approved: (amount: string, symbol: string, spender: string) =>
    `Se autorizaron ${amount} ${symbol} para ${spender}.`,
  toastApproved: "Autorización aprobada",
  approvalFailed: "La aprobación falló. Inténtelo de nuevo.",
  approveTitle: "Aprobar un gastador",
  approveDescription:
    "Permita que otro principal transfiera tokens en su nombre.",
  spenderLabel: "Principal del gastador",
  allowanceLabel: (symbol: string) => `Autorización (${symbol})`,
  approveHint: (decimals: number, symbol: string) =>
    `Máximo ${decimals} decimales. La aprobación cobra la comisión de transferencia de ${symbol}.`,
  approving: "Aprobando...",
  approveAllowance: "Aprobar autorización",
  currentAllowance: "Autorización actual",
  currentAllowanceFor: (spender: string) =>
    `Autorización actual para ${spender}`,
  enterSpenderToView: "Introduzca un gastador para verla",
  loading: "Cargando…",

  invalidFrom: "Introduzca un Principal ID de origen válido.",
  invalidTo: "Introduzca un Principal ID de destino válido.",
  transferredFrom: (amount: string, symbol: string, from: string, to: string) =>
    `Se transfirieron ${amount} ${symbol} de ${from} a ${to}.`,
  toastTransferFrom: "Transferencia desde autorización completada",
  transferFromTitle: "Transferir desde una autorización",
  transferFromDescription:
    "Use una autorización que se le haya concedido para mover tokens desde la cuenta de otro principal.",
  fromLabel: "Principal de origen",
  toLabel: "Principal de destino",
  transferring: "Transfiriendo...",
  transferFromButton: "Transferir desde",

  pageTitle: "Gestionar tokens",
  pageSubtitle: (symbol: string) =>
    `Transfiera, apruebe y gaste autorizaciones de ${symbol}.`,
  feeBadge: (fee: string, symbol: string) => `Comisión ${fee} ${symbol}`,
  tabTransfer: "Transferir",
  tabApprove: "Aprobar",
  tabTransferFrom: "Transferir desde",
};

export default es;
