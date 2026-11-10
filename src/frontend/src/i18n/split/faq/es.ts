import type en from "./en";

const es: typeof en = {
  label: "Preguntas",
  title: "Antes de acuñar",
  intro:
    "Respuestas claras sobre el token, los wallets y cómo funciona la acuñación.",
  whatQ: "¿Qué es TTTI-T?",
  whatA:
    "TTTI-T es la versión de prueba de TTTI, una moneda de intercambio en el Internet Computer. El ledger usa 8 decimales, y esta versión de prueba contiene un token. El pago se realiza en ICP, ckBTC, ckUSDC o ckUSDT, según la regla del mint explicada en la pregunta siguiente.",
  mintRuleQ: "¿Cómo se calcula el pago de un mint?",
  noReturns: "No existe ninguna promesa de rendimiento de ningún tipo.",
  icpQ: "¿Cómo consigo ICP?",
  icpBefore: "TTTI-T se acuña con ICP. Si todavía no tiene, visite primero ",
  icpLink: "Conseguir ICP",
  icpAfter:
    " para conocer formas fiables de comprar ICP y enviarlo a su wallet; después vuelva para acuñar.",
  btcQ: "¿Puedo pagar en BTC?",
  rateQ: "¿Cómo se fija el tipo de cambio en USD?",
  walletsQ: "¿Qué wallets son compatibles?",
  walletsA:
    "Puede iniciar sesión con Internet Identity o con el wallet Plug. Ambos le dejan el control: la app lee sus saldos y usted mismo firma cada transferencia.",
  whereQ: "¿Dónde aparecen los tokens acuñados?",
  whereBefore:
    "El TTTI-T acuñado se entrega en la cuenta con la que inició sesión. Aparece en TTTI-T en la ",
  whereLink: "página Billetera",
  whereAfter:
    ". Si lo prefiere, puede añadir una dirección de entrega opcional (un Principal ID) antes de acuñar; nunca es obligatoria.",
  supplyQ: "¿Cuántos tokens pueden existir?",
  supplyIntro: "TTTI es la versión futura; TTTI-T es la prueba en curso.",
  liquidityQ: "¿Cómo funcionan los pools de liquidez?",
  liquidityA:
    "Cualquier persona puede aportar liquidez y retirarla. Las posiciones de liquidez son públicas y están vinculadas al identificador en TTTI. El protocolo nunca coloca una orden vinculada al precio y no crea ningún TTTI-T. La liquidez permanente es una gestión de la profundidad: un reequilibrio mecánico y público de la parte del protocolo, nunca condicionado al precio. Solo se muestra el rendimiento observado, es decir, las comisiones realmente pagadas durante los últimos 30 días. No existe ninguna promesa de rendimiento.",
  privacyQ: "¿Qué es público y qué conserva la app?",
  privacyA:
    "Cada compra y cada transferencia se registra de forma pública y permanente en el ledger del token utilizado: ICP, ckBTC, ckUSDC, ckUSDT o TTTI-T. Cualquiera puede ver los importes, las cuentas y las horas. Las transferencias de Bitcoin son públicas en la cadena de Bitcoin: cualquiera puede ver sus identificadores de transacción (txids), sus direcciones y sus importes. Aparte de eso, la app solo conserva sus registros de compra con sus importes y números de bloque, su dirección de entrega, la fecha en que aceptó las condiciones de compra y sus seguimientos de depósitos BTC (dirección de depósito, txids y estado de cada depósito).",
};

export default es;
