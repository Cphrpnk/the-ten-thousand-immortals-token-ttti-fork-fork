import type en from "./en";

const es: typeof en = {
  getIcpAria: "Añadir ICP",
  getIcpAdd: "Añada",
  getIcpAddToBuy: "Añada ICP para acuñar",
  getIcpBuyAria:
    "Comprar ICP en Onramper (copia su dirección, se abre en una pestaña nueva)",
  getIcpBuy: "Comprar ICP",
  getIcpCopyAria: "Copiar la dirección del wallet",
  getIcpCopied: "Dirección copiada",
  getIcpCopyFailed: "No se pudo copiar: haga clic en la dirección",
  getIcpBalance: (amount: string) => `Saldo: ${amount} ICP`,
  migrationTitle: (symbol: string) =>
    `Su ${symbol} deberá migrarse en el lanzamiento`,
  migrationBody:
    "Añada una dirección de wallet para recibirlos automáticamente. Puede comprar ahora sin ella.",
  migrationStep1Title: "Crear un wallet",
  migrationStep1Body: "Abra Plug, NNS u OISY y cree un wallet.",
  migrationStep2Title: "Copiar el Principal ID correcto",
  migrationStep2Body:
    "Copie el Principal ID, no el account ID de 64 caracteres.",
  migrationStep3Title: "Pegarlo aquí",
  migrationStep3Body:
    "Péguelo en el campo de dirección de entrega de abajo y guarde.",
  opensNewTab: "(se abre en una pestaña nueva)",
  migrationAdd: "Añadir dirección",
  migrationLater: "Más tarde",
  orderLegend: "Importe de la orden",
  orderAmountIn: (symbol: string) => `Importe en ${symbol}`,
  orderAmountTtti: "Importe en TTTI-T",
  payWith: "Pagar con",
  unavailable: "No disponible",
  maxSupply: "Suministro máximo",
  totalSupply: "Suministro total",
  remaining: "Restante",
  supplyValueNote:
    "Los equivalentes en USD usan el precio consolidado del TTTI-T (promedio de la hora).",
  complete: "Finalizada",
  paused: "En pausa",
  live: "En curso",
  maxReached: "Suministro máximo alcanzado",
  maxReachedBody: (max: string, symbol: string) =>
    `El suministro total ha alcanzado el suministro máximo de ${max} ${symbol}. Las compras están cerradas.`,
  salesPaused: "Las ventas están en pausa",
  pausedBody:
    "Las compras están desactivadas temporalmente. Vuelva a consultar pronto.",
  totalSupplyPercent: (percent: string) => `Suministro total ${percent}%`,
  progressAria: (percent: string) =>
    `Suministro total: ${percent}% del suministro máximo`,
  reserved: (amount: string, symbol: string) =>
    `${amount} ${symbol} están reservados por compras en curso.`,
  never: "Nunca",
  noRate: (symbol: string) =>
    `No hay un tipo ${symbol}/USD válido para esta hora`,
  unavailableUntilRate: (symbol: string) =>
    `Las compras en ${symbol} no están disponibles hasta que se fije un tipo.`,
  oneBuys: (symbol: string) => `1 ${symbol} compra`,
  source: "Fuente",
  fetched: "Obtenido",
  minimum: "Mínimo",
  treasury: "Tesorería",
  notConfigured: "No configurada",
  treasuryCopied: (symbol: string) =>
    `Cuenta ${symbol} de la tesorería copiada`,
  treasuryCopy: (symbol: string) =>
    `Copiar la cuenta ${symbol} de la tesorería`,
  percentConnect: "Conecte un wallet para usar la barra.",
  percentBalanceUnavailable: "Saldo no disponible.",
  percentNotCover: (fees: string) =>
    `El saldo no cubre las comisiones de red de ${fees}.`,
  percentShare: (symbol: string) => `Parte del saldo ${symbol} del wallet`,
  percentSummary: (percent: string, amount: string, ttti: string) =>
    `${percent}% = ${amount} · recibe ${ttti} TTTI-T`,
  percentComputedOn: (fees: string) =>
    `Calculado sobre el saldo menos ${fees} de comisiones de red.`,
};

export default es;
