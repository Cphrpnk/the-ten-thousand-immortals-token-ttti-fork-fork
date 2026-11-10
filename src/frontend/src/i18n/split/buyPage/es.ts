import type en from "./en";

const es: typeof en = {
  title: (symbol: string) => `Acuñar ${symbol}`,
  noExtraTaken:
    "No se toma ninguna cantidad del token pagado más allá del coste de lo que se entrega.",
  shownAs: (symbol: string) => `Se muestra como ${symbol} en los wallets.`,
  ackReadFirst: "He leído la sección «Lea esto primero» del libro blanco.",
  ackNoRights:
    "Entiendo que TTTI no tiene ningún uso ni valor intrínseco. El único derecho que tengo es el derecho de canje: puedo devolver TTTI-T al contrato y recibir el menor entre 10 000 USD por TTTI-T y la parte proporcional de la reserva común, sin promesa de valor.",
  ackPriceZero:
    "Entiendo que su precio puede caer a cero y que nada le promete un valor. 10 000 USD por cada TTTI-T acuñado se calculan en USD y se mantienen en el token pagado (ICP, ckBTC, ckUSDC o ckUSDT) en una reserva común, sin conversión, y cualquier titular puede devolver TTTI-T al contrato según las reglas de canje. 1 TTTI-T siempre se puede canjear por 10 000 USD, por cualquier titular.",
  ackIcpCreator:
    "La acuñación cuesta (10.000 USD + la liquidez que aporto) × q dividido por 0,99, en ICP, ckBTC, ckUSDC o ckUSDT. 10.000 USD × q van a la reserva común, el 1 % del importe que pago va al creador, y el resto es la liquidez que aporto, que sigue siendo mía en mi posición.",
  ackNoProfit:
    "No me baso en ninguna promesa de beneficio, ni del creador ni de nadie.",
  ackAffordLoss: "Solo gasto lo que puedo permitirme perder por completo.",
  ackLegend: "Se requiere antes de su primera compra.",
  wtTitle: "Condiciones del wallet",
  wtDescription:
    "Lea los seis puntos siguientes, marque la casilla y acepte. Se solicita una sola vez y es necesario para hacer un mint o un canje.",
  wtAcceptLabel: "He leído y acepto estas condiciones",
  wtAcceptButton: "Aceptar las condiciones",
  wtBannerText: "Las condiciones del wallet aún no se han aceptado.",
  wtBannerButton: "Leer las condiciones",
  wtOpenRefusal: "Revisar y aceptar las condiciones del wallet",
  wtPoint1Title: "Libro blanco",
  wtPoint2Title: "Derechos",
  wtPoint3Title: "Precio",
  wtPoint4Title: "Coste del mint",
  wtPoint5Title: "Sin promesa de beneficio",
  wtPoint6Title: "Riesgo de pérdida",
  ackWhitePaperLink: "Abrir la sección «Lea esto primero»",
  ackStatusUnavailable: "Estado de las confirmaciones de compra no disponible",
  ackTickAll: "Marque las seis declaraciones para habilitar la acuñación.",
  retry: "Reintentar",
  invalidAmountTitle: "Importe no válido",
  invalidAmountMessage: (symbol: string, decimals: number) =>
    `Introduzca un importe en ${symbol} mayor que 0 con un máximo de ${decimals} decimales.`,
  belowMinimumTitle: "Inferior a la compra mínima",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    about: string | null,
  ) =>
    `Mínimo ${minimum} ${display} (${minimumUsd} en ${symbol})${about !== null ? `, unos ${about}` : ""}.`,
  aboveRemainingTitle: "Superior al importe restante",
  aboveRemainingMessage: (remaining: string, display: string, max: string) =>
    `Solo quedan ${remaining} ${display} (${max}).`,
  insufficientTitle: (symbol: string, fee: string) =>
    `${symbol} insuficiente (importe + ${fee} de comisiones)`,
  insufficientMessage: (required: string) =>
    `Necesita ${required}, comisiones incluidas.`,
  useMaximum: "Usar el máximo",
  approvalFailed: (symbol: string) => `Error en la aprobación de ${symbol}`,
  purchaseNotCompleted: "Compra no completada",
  purchaseNotSubmitted: "No se pudo enviar la compra. Inténtelo de nuevo.",
  recordingAcks: "Registrando las confirmaciones de compra…",
  approving: (symbol: string) => `Aprobando ${symbol}…`,
  buying: "Acuñando…",
  saleComplete: "Venta finalizada",
  salesPaused: "Las ventas están en pausa",
  tokenUnavailable: (symbol: string) => `${symbol} no disponible`,
  buyWith: (symbol: string) => `Acuñar con ${symbol}`,
  received: (amount: string, display: string) =>
    `Ha recibido ${amount} ${display}`,
  buyTtti: "Acuñar TTTI-T",
  buyHeading: "Acuñar",
  mintInfoToggle: "¿Qué es buy-to-mint?",
  mintInfoBody1:
    "Un TTTI-T solo se crea cuando alguien paga en ICP, ckBTC, ckUSDC o ckUSDT al tipo mostrado. La liquidez que aporta quien acuña sigue siendo suya, en su propia posición del pool. Nadie, ni siquiera el administrador, puede crear TTTI-T de ninguna otra forma.",
  mintInfoBody2:
    "Un bitcoin solo llega a existir cuando un minero gasta un recurso real: energía y hardware. Un TTTI-T solo llega a existir cuando alguien aporta un token real. En ambos lados, ese es el compromiso real (skin in the game).",
  walletPlug: "Plug",
  walletBuiltIn: "Wallet integrado",
  balanceLabel: (symbol: string) => `Saldo de ${symbol}`,
  unavailable: "No disponible",
  noTreasury: (symbol: string) =>
    `La acuñación con ${symbol} no está disponible por el momento.`,
  youPayIn: (symbol: string) => `Paga en ${symbol}`,
  youReceive: "Recibe",
  withFees: (amount: string) => ` · ${amount} con comisiones`,
  totalDebited: "Total cargado con las comisiones de red:",
  noRateTitle: (symbol: string) =>
    `No hay un tipo ${symbol}/USD válido para esta hora`,
  noRateBody: (symbol: string) =>
    `Las compras en ${symbol} no están disponibles hasta que se fije un tipo.`,
  finalMint: (symbol: string) => `Mint ${symbol}`,
  finalMinting: "Acuñando…",
  finalConverting: "Convirtiendo el ckBTC retenido…",
  finalMoving: "Moviendo el saldo del DEX a la wallet…",
  finalChecking: "Comprobando saldos…",
  finalSourceLabel: "Saldo utilizado",
  finalSourceWallet: (amount: string) => `Wallet: ${amount}`,
  finalSourceDex: (amount: string) => `Saldo interno del DEX: ${amount}`,
  finalSourceContract: (amount: string) => `En poder del contrato: ${amount}`,
  finalPreview: (ttti: string, pay: string) => `${ttti} por ${pay}`,
  finalFundFirst: (symbol: string) =>
    `No hay ${symbol} en su wallet, en el DEX ni en poder del contrato. Primero recargue la cuenta.`,
  finalEnterAmount:
    "Introduzca un importe en el formulario de arriba y pulse Mint.",
  finalDexMoved: (amount: string) =>
    `Retirada de ${amount} del saldo del DEX a su wallet completada. Introduzca un importe y pulse Mint.`,
  finalDexFailed: (detail: string) =>
    detail
      ? `La retirada del DEX falló. ${detail}`
      : "La retirada del DEX falló.",
  finalDexWithdrawing: "Paso 1 de 2: retirando del DEX…",
  finalDexMinting: "Paso 2 de 2: haciendo el mint…",
  finalDexTooLow: (available: string, required: string) =>
    `El saldo del DEX tras la comisión del ledger (${available}) es inferior a los ${required} necesarios para este mint. No se retiró nada.`,
  finalDexShort: (balance: string, required: string) =>
    `La retirada se completó. El saldo de la wallet (${balance}) es inferior a los ${required} necesarios para este mint. Los fondos siguen en su wallet.`,
  finalDexMintKept: (amount: string) =>
    `El mint no se completó. ${amount} sigue en su wallet. Pulse Mint para reintentarlo desde la wallet.`,
  finalUseTokenForm:
    "Este saldo se acuña desde el formulario de pago en ckBTC, que se abre al pulsar Mint.",
};

export default es;
