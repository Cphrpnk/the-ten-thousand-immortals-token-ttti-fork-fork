import type en from "./en";

const es: typeof en = {
  fallbackMessage:
    "No se pudo completar la compra para este destino. Compruebe el destinatario e inténtelo de nuevo.",
  server: (server: string) => server,
  reference: (id: string) => ` Referencia: compra n.º ${id}.`,
  contactTeam: " Póngase en contacto con el equipo indicando esta referencia.",
  refundedTitle: (symbol: string, fee: string) =>
    `La entrega falló: su ${symbol} se ha reembolsado, menos la comisión de ${fee}`,
  refundFailed: "La entrega falló y el reembolso automático también falló",
  refundedMessage: () =>
    "La entrega de TTTI-T falló; el pago se ha reembolsado, menos la comisión del ledger.",
  refundFailedMessage: () =>
    "La entrega de TTTI-T falló y el reembolso también falló; esta compra requiere un seguimiento manual.",
  salesPausedTitle: "Las ventas están en pausa",
  salesPausedMessage: () => "Las compras están desactivadas temporalmente.",
  saleCompleteTitle: "Venta finalizada",
  saleCompleteMessage: () =>
    "Venta de TTTI-T finalizada: no queda TTTI-T por vender.",
  belowMinimumTitle: "Inferior a la compra mínima",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    requested: string,
  ) =>
    `El mínimo es ${minimum} ${display} (${minimumUsd} en ${symbol}); ha solicitado ${requested} ${display}.`,
  aboveRemainingTitle: "Superior al importe restante",
  aboveRemainingMessage: (
    maximum: string,
    display: string,
    maximumPay: string,
    requested: string,
  ) =>
    `El máximo disponible es ${maximum} ${display} (${maximumPay}); ha solicitado ${requested} ${display}.`,
  priceUnavailableTitle: (symbol: string) =>
    `Compra rechazada: no hay ningún tipo ${symbol}/USD válido fijado`,
  priceUnavailableMessage: (symbol: string) =>
    `No se ha tomado ningún ${symbol}. Las compras en ${symbol} no están disponibles hasta que se fije un tipo.`,
  notConfiguredTitle: (symbol: string) => `${symbol} no está configurado`,
  notConfiguredMessage: (symbol: string) =>
    `La venta aún no está configurada. No se ha tomado ningún ${symbol}.`,
  ledgerMismatchTitle: (symbol: string) => `Discrepancia del ledger ${symbol}`,
  ledgerMismatchMessage: (
    symbol: string,
    actualDecimals: string,
    actualFee: string,
    expectedDecimals: string,
    expectedFee: string,
  ) =>
    `El ledger ${symbol} indica ${actualDecimals} decimales y una comisión de ${actualFee}; se esperaban ${expectedDecimals} decimales y ${expectedFee}. No se ha tomado ningún ${symbol}.`,
  ackRequiredTitle: "Confirmaciones de compra requeridas",
  ackRequiredMessage: (symbol: string) =>
    `Esta cuenta no ha aceptado las seis confirmaciones de compra. No se ha tomado ningún ${symbol}.`,
  invalidAmountTitle: "Importe no válido",
  invalidAmountMessage: () =>
    "No se puede aceptar este importe o esta cuenta de entrega. No se ha tomado nada.",
  insufficientTitle: (symbol: string) => `Saldo de ${symbol} insuficiente`,
  insufficientMessage: (_server: string, balance: string) =>
    `El saldo no cubre esta compra. Saldo: ${balance}.`,
  approvalMissingTitle: (symbol: string) => `Falta la aprobación de ${symbol}`,
  approvalMissingMessage: (_server: string, allowance: string) =>
    `La autorización no cubre esta compra. Autorización actual: ${allowance}.`,
  inProgressTitle: "Compra ya en curso",
  inProgressMessage: (symbol: string) =>
    `Ya hay una compra en curso para esta cuenta. Espere a que termine y vuelva a intentarlo. No se ha tomado ningún ${symbol} para esta solicitud.`,
  ledgerErrorTitle: (symbol: string) => `Error del ledger ${symbol}`,
  ledgerErrorMessage: () =>
    "No se pudo contactar con el ledger o la operación falló. Inténtelo de nuevo.",
  signInTitle: "Inicie sesión para acuñar",
  signInMessage: () => "Inicie sesión para acuñar TTTI-T.",
  notCompletedTitle: "Compra no completada",
  failedTitle: "La compra falló",
};

export default es;
