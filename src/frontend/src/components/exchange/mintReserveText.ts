import { defineDict } from "../../i18n/core/dict";

/**
 * Mint preview and result wording for the common reserve share, the total to
 * pay and the creator fee. The reserve share is held in the token paid, without
 * conversion. English is authoritative.
 * Amounts, percentages and token symbols are passed in already formatted.
 */
export const MINT_RESERVE_TEXT = defineDict({
  en: {
    ruleTitle: "Common reserve",
    rule: "10,000 USD × q of each mint goes to the common reserve. It is calculated in USD and held in the token paid (ICP, ckBTC, ckUSDC or ckUSDT), without conversion.",
    rowTotal: "Total to pay",
    rowReserve: "Common reserve (10,000 USD × q)",
    reserveNoteKept:
      "The common reserve share is kept as is in the paid token.",
    feeNote:
      "The mint costs (10,000 USD + the liquidity contributed) × q ÷ 0.99. 10,000 USD × q goes to the common reserve and 1 % of the amount paid goes to the creator; the rest is the liquidity contributed, which stays in the minter's position.",
    successReserve: (amount: string) => `Common reserve: ${amount}.`,
  },
  fr: {
    ruleTitle: "Réserve commune",
    rule: "10\u202f000 USD × q de chaque frappe vont à la réserve commune. Cette part est calculée en USD et détenue dans le jeton payé (ICP, ckBTC, ckUSDC ou ckUSDT), sans conversion.",
    rowTotal: "Total à payer",
    rowReserve: "Réserve commune (10\u202f000 USD × q)",
    reserveNoteKept:
      "La part de réserve commune est conservée telle quelle dans le jeton payé.",
    feeNote:
      "La frappe coûte (10\u202f000 USD + la liquidité apportée) × q ÷ 0,99. 10\u202f000 USD × q vont à la réserve commune et 1 % du montant payé revient au créateur ; le reste est la liquidité apportée, qui reste dans la position de la personne qui frappe.",
    successReserve: (amount: string) => `Réserve commune : ${amount}.`,
  },
  es: {
    ruleTitle: "Reserva común",
    rule: "10.000 USD × q de cada acuñación van a la reserva común. Esta parte se calcula en USD y se mantiene en el token pagado (ICP, ckBTC, ckUSDC o ckUSDT), sin conversión.",
    rowTotal: "Total a pagar",
    rowReserve: "Reserva común (10.000 USD × q)",
    reserveNoteKept:
      "La parte de reserva común se conserva tal cual en el token pagado.",
    feeNote:
      "La acuñación cuesta (10.000 USD + la liquidez aportada) × q ÷ 0,99. 10.000 USD × q van a la reserva común y el 1 % del importe pagado va al creador; el resto es la liquidez aportada, que permanece en la posición de quien acuña.",
    successReserve: (amount: string) => `Reserva común: ${amount}.`,
  },
  "zh-Hans": {
    ruleTitle: "共同储备",
    rule: "每次铸造的 10,000 USD × q 进入共同储备。该部分按美元计算，以所付代币（ICP、ckBTC、ckUSDC 或 ckUSDT）原样保存，不作兑换。",
    rowTotal: "应付总额",
    rowReserve: "共同储备（10,000 USD × q）",
    reserveNoteKept: "共同储备部分以所付代币原样保留。",
    feeNote:
      "铸造成本为（10,000 USD + 所投入的流动性）× q ÷ 0.99。10,000 USD × q 进入共同储备，所付金额的 1 % 归创建者；其余部分是所投入的流动性，保留在铸造者的头寸中。",
    successReserve: (amount: string) => `共同储备：${amount}。`,
  },
  "pt-BR": {
    ruleTitle: "Reserva comum",
    rule: "10.000 USD × q de cada cunhagem vão para a reserva comum. Essa parte é calculada em USD e mantida no token pago (ICP, ckBTC, ckUSDC ou ckUSDT), sem conversão.",
    rowTotal: "Total a pagar",
    rowReserve: "Reserva comum (10.000 USD × q)",
    reserveNoteKept:
      "A parte da reserva comum é mantida como está no token pago.",
    feeNote:
      "A cunhagem custa (10.000 USD + a liquidez aportada) × q ÷ 0,99. 10.000 USD × q vão para a reserva comum e 1 % do valor pago vai para o criador; o restante é a liquidez aportada, que permanece na posição de quem cunha.",
    successReserve: (amount: string) => `Reserva comum: ${amount}.`,
  },
  ko: {
    ruleTitle: "공동 준비금",
    rule: "발행마다 10,000 USD × q가 공동 준비금으로 들어갑니다. 이 금액은 USD로 산정되며 지불한 토큰(ICP, ckBTC, ckUSDC 또는 ckUSDT) 그대로 환전 없이 보관됩니다.",
    rowTotal: "총 지불 금액",
    rowReserve: "공동 준비금 (10,000 USD × q)",
    reserveNoteKept: "공동 준비금 몫은 지불한 토큰 그대로 보관됩니다.",
    feeNote:
      "발행 비용은 (10,000 USD + 제공한 유동성) × q ÷ 0.99입니다. 10,000 USD × q는 공동 준비금으로 가고 지불 금액의 1 %는 제작자에게 가며, 나머지는 제공한 유동성으로 발행한 사람의 포지션에 남습니다.",
    successReserve: (amount: string) => `공동 준비금: ${amount}.`,
  },
  "pa-Guru": {
    ruleTitle: "ਸਾਂਝਾ ਰਿਜ਼ਰਵ",
    rule: "ਹਰ ਮਿੰਟ ਦੇ 10,000 USD × q ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਵਿੱਚ ਜਾਂਦੇ ਹਨ। ਇਹ ਹਿੱਸਾ USD ਵਿੱਚ ਗਿਣਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਅਦਾ ਕੀਤੇ ਟੋਕਨ (ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT) ਵਿੱਚ ਬਿਨਾਂ ਤਬਦੀਲੀ ਦੇ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।",
    rowTotal: "ਕੁੱਲ ਅਦਾਇਗੀ",
    rowReserve: "ਸਾਂਝਾ ਰਿਜ਼ਰਵ (10,000 USD × q)",
    reserveNoteKept: "ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਦਾ ਹਿੱਸਾ ਅਦਾ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਜਿਵੇਂ ਹੈ ਤਿਵੇਂ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।",
    feeNote:
      "ਮਿੰਟ ਦੀ ਲਾਗਤ (10,000 USD + ਦਿੱਤੀ ਲਿਕਵਿਡਿਟੀ) × q ÷ 0.99 ਹੈ। 10,000 USD × q ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਵਿੱਚ ਜਾਂਦੇ ਹਨ ਅਤੇ ਅਦਾ ਕੀਤੀ ਰਕਮ ਦਾ 1 % ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ; ਬਾਕੀ ਦਿੱਤੀ ਲਿਕਵਿਡਿਟੀ ਹੈ, ਜੋ ਮਿੰਟ ਕਰਨ ਵਾਲੇ ਦੀ ਪੋਜ਼ੀਸ਼ਨ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ।",
    successReserve: (amount: string) => `ਸਾਂਝਾ ਰਿਜ਼ਰਵ: ${amount}।`,
  },
});
