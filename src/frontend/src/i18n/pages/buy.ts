import { defineDict } from "../core/dict";

/**
 * Buy page (pages/ExchangePage.tsx) and its components (components/exchange,
 * components/btc). English is authoritative and kept word for word. Token
 * symbols, amounts, rates, fees and percentages are passed in unchanged.
 */

/** pages/ExchangePage.tsx */
export const BUY_PAGE_TEXT = defineDict({
  en: {
    title: (symbol: string) => `Mint ${symbol}`,
    noExtraTaken:
      "No amount of the paid token beyond the cost of what is delivered is taken.",
    shownAs: (symbol: string) => `Shown as ${symbol} in wallets.`,
    // Acknowledgements (legal text)
    ackReadFirst:
      'I have read the "Read this first" section of the whitepaper.',
    ackNoRights:
      "I understand that TTTI has no use and no intrinsic value. The only right I hold is the personal guarantee: I can recover my own stake by returning TTTI under the redemption rules, with no common reserve and no promise of value.",
    ackPriceZero:
      "I understand that its price can fall to zero and that nothing promises it any value. Only the personal guarantee applies: each minter can recover their own stake by returning TTTI-T to the contract under the redemption rules. There is no common reserve.",
    ackIcpCreator:
      "Of the ICP, ckBTC, ckUSDC or ckUSDT I pay, 100/101 stays in the contract in the paid token, managed by the admin, and 1/101 is the mint fee, which feeds permanent liquidity: a mechanical, public depth management, never conditioned on price.",
    ackNoProfit:
      "I am not relying on any promise of profit, from the creator or from anyone.",
    ackAffordLoss: "I am spending only what I can afford to lose entirely.",
    ackLegend:
      "Required before your first purchase and again whenever these terms change.",
    ackWhitePaperLink: 'Open the "Read this first" section',
    ackStatusUnavailable: "Acknowledgement status unavailable",
    ackTickAll: "Tick all six statements to enable Mint.",
    retry: "Retry",
    // Validation
    invalidAmountTitle: "Invalid amount",
    invalidAmountMessage: (symbol: string, decimals: number) =>
      `Enter a ${symbol} amount greater than 0 with up to ${decimals} decimals.`,
    belowMinimumTitle: "Below the minimum purchase",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      about: string | null,
    ) =>
      `Minimum ${minimum} ${display} (${minimumUsd} in ${symbol})${about !== null ? `, about ${about}` : ""}.`,
    aboveRemainingTitle: "Above the remaining amount",
    aboveRemainingMessage: (remaining: string, display: string, max: string) =>
      `Only ${remaining} ${display} remain (${max}).`,
    insufficientTitle: (symbol: string, fee: string) =>
      `Insufficient ${symbol} (amount + ${fee} fees)`,
    insufficientMessage: (required: string) =>
      `You need ${required} including fees.`,
    useMaximum: "Use maximum",
    // Purchase errors raised on the page
    approvalFailed: (symbol: string) => `${symbol} approval failed`,
    purchaseNotCompleted: "Purchase not completed",
    purchaseNotSubmitted:
      "The purchase could not be submitted. Please try again.",
    // Mint button states
    recordingAcks: "Recording acknowledgements…",
    approving: (symbol: string) => `Approving ${symbol}…`,
    buying: "Minting…",
    saleComplete: "Sale complete",
    salesPaused: "Sales are paused",
    tokenUnavailable: (symbol: string) => `${symbol} unavailable`,
    buyWith: (symbol: string) => `Mint with ${symbol}`,
    // Success
    received: (amount: string, display: string) =>
      `You received ${amount} ${display}`,
    // Form card
    buyTtti: "Mint TTTI-T",
    buyHeading: "Mint",
    // Buy-to-mint explanation (also rendered in the white paper)
    mintInfoToggle: "What is buy-to-mint?",
    mintInfoBody1:
      "A TTTI-T is created only when someone pays in ICP, ckBTC, ckUSDC or ckUSDT at the displayed rate. There is no pre-made reserve. No one, admin included, can create TTTI-T any other way.",
    mintInfoBody2:
      "A bitcoin comes into existence only when a miner spends a real resource: energy and hardware. A TTTI-T comes into existence only when someone brings a real token. On both sides, that is the skin in the game.",
    walletPlug: "Plug",
    walletBuiltIn: "Built-in wallet",
    balanceLabel: (symbol: string) => `${symbol} balance`,
    unavailable: "Unavailable",
    noTreasury: (symbol: string) =>
      `Minting with ${symbol} is not available at the moment.`,
    youPayIn: (symbol: string) => `You pay in ${symbol}`,
    youReceive: "You receive",
    withFees: (amount: string) => ` · ${amount} with fees`,
    totalDebited: "Total debited with network fees:",
    noRateTitle: (symbol: string) =>
      `No valid ${symbol}/USD rate for this hour`,
    noRateBody: (symbol: string) =>
      `Purchases in ${symbol} are unavailable until a rate is set.`,
  },
  fr: {
    title: (symbol: string) => `Frapper du ${symbol}`,
    noExtraTaken:
      "Aucun montant du jeton payé n'est prélevé au-delà du coût de ce qui est livré.",
    shownAs: (symbol: string) => `Affiché comme ${symbol} dans les wallets.`,
    ackReadFirst: "J'ai lu la section « À lire en premier » du livre blanc.",
    ackNoRights:
      "Je comprends que TTTI n'a aucun usage et aucune valeur intrinsèque. Le seul droit dont je dispose est la garantie personnelle : je peux récupérer ma propre mise en rendant des TTTI selon les règles de rachat, sans réserve commune et sans promesse de valeur.",
    ackPriceZero:
      "Je comprends que son prix peut tomber à zéro et que rien ne lui promet une valeur. Seule s'applique la garantie personnelle : chaque minteur peut récupérer sa propre mise en rendant du TTTI-T au contrat selon les règles de rachat. Il n'y a pas de réserve commune.",
    ackIcpCreator:
      "De l'ICP, du ckBTC, du ckUSDC ou du ckUSDT que je paie, 100/101 restent dans le contrat dans le jeton payé, gérés par l'administrateur, et 1/101 constitue les frais de mint, qui alimentent la liquidité permanente : une gestion de la profondeur mécanique et publique, jamais conditionnée au prix.",
    ackNoProfit:
      "Je ne me fie à aucune promesse de profit, ni du créateur ni de quiconque.",
    ackAffordLoss:
      "Je ne dépense que ce que je peux me permettre de perdre entièrement.",
    ackLegend:
      "Requis avant votre premier achat, puis de nouveau chaque fois que ces conditions changent.",
    ackWhitePaperLink: "Ouvrir la section « À lire en premier »",
    ackStatusUnavailable: "Statut des confirmations d'achat indisponible",
    ackTickAll: "Cochez les six déclarations pour activer la frappe.",
    retry: "Réessayer",
    invalidAmountTitle: "Montant invalide",
    invalidAmountMessage: (symbol: string, decimals: number) =>
      `Saisissez un montant en ${symbol} supérieur à 0 avec au plus ${decimals} décimales.`,
    belowMinimumTitle: "Inférieur à l'achat minimum",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      about: string | null,
    ) =>
      `Minimum ${minimum} ${display} (${minimumUsd} en ${symbol})${about !== null ? `, soit environ ${about}` : ""}.`,
    aboveRemainingTitle: "Supérieur au montant restant",
    aboveRemainingMessage: (remaining: string, display: string, max: string) =>
      `Il ne reste que ${remaining} ${display} (${max}).`,
    insufficientTitle: (symbol: string, fee: string) =>
      `${symbol} insuffisant (montant + ${fee} de frais)`,
    insufficientMessage: (required: string) =>
      `Il vous faut ${required}, frais compris.`,
    useMaximum: "Utiliser le maximum",
    approvalFailed: (symbol: string) => `Échec de l'approbation ${symbol}`,
    purchaseNotCompleted: "Achat non effectué",
    purchaseNotSubmitted: "L'achat n'a pas pu être soumis. Veuillez réessayer.",
    recordingAcks: "Enregistrement des confirmations d'achat…",
    approving: (symbol: string) => `Approbation ${symbol} en cours…`,
    buying: "Frappe en cours…",
    saleComplete: "Vente terminée",
    salesPaused: "Les ventes sont suspendues",
    tokenUnavailable: (symbol: string) => `${symbol} indisponible`,
    buyWith: (symbol: string) => `Frapper avec ${symbol}`,
    received: (amount: string, display: string) =>
      `Vous avez reçu ${amount} ${display}`,
    buyTtti: "Frapper du TTTI-T",
    buyHeading: "Frapper",
    mintInfoToggle: "Qu'est-ce que le buy-to-mint ?",
    mintInfoBody1:
      "Un TTTI-T n'est créé que lorsque quelqu'un paie en ICP, ckBTC, ckUSDC ou ckUSDT au taux affiché. Il n'existe aucune réserve préétablie. Personne, administrateur compris, ne peut créer de TTTI-T d'une autre manière.",
    mintInfoBody2:
      "Un bitcoin ne vient au monde que lorsqu'un mineur dépense une ressource réelle : de l'énergie et du matériel. Un TTTI-T ne vient au monde que lorsque quelqu'un apporte un jeton réel. Des deux côtés, c'est l'engagement réel (skin in the game).",
    walletPlug: "Plug",
    walletBuiltIn: "Wallet intégré",
    balanceLabel: (symbol: string) => `Solde ${symbol}`,
    unavailable: "Indisponible",
    noTreasury: (symbol: string) =>
      `La frappe avec ${symbol} n'est pas disponible pour le moment.`,
    youPayIn: (symbol: string) => `Vous payez en ${symbol}`,
    youReceive: "Vous recevez",
    withFees: (amount: string) => ` · ${amount} frais compris`,
    totalDebited: "Total débité avec les frais de réseau :",
    noRateTitle: (symbol: string) =>
      `Aucun taux ${symbol}/USD valide pour cette heure`,
    noRateBody: (symbol: string) =>
      `Les achats en ${symbol} sont indisponibles tant qu'aucun taux n'est fixé.`,
  },
  es: {
    title: (symbol: string) => `Acuñar ${symbol}`,
    noExtraTaken:
      "No se toma ninguna cantidad del token pagado más allá del coste de lo que se entrega.",
    shownAs: (symbol: string) => `Se muestra como ${symbol} en los wallets.`,
    ackReadFirst: "He leído la sección «Lea esto primero» del libro blanco.",
    ackNoRights:
      "Entiendo que TTTI no tiene ningún uso ni valor intrínseco. El único derecho que tengo es la garantía personal: puedo recuperar mi propia aportación devolviendo TTTI según las reglas de reembolso, sin reserva común y sin promesa de valor.",
    ackPriceZero:
      "Entiendo que su precio puede caer a cero y que nada le promete un valor. Solo se aplica la garantía personal: cada minter puede recuperar su propia aportación devolviendo TTTI-T al contrato según las reglas de canje. No hay reserva común.",
    ackIcpCreator:
      "Del ICP, ckBTC, ckUSDC o ckUSDT que pago, 100/101 permanecen en el contrato en el token pagado, gestionados por el administrador, y 1/101 es la comisión de mint, que alimenta la liquidez permanente: una gestión de la profundidad mecánica y pública, nunca condicionada al precio.",
    ackNoProfit:
      "No me baso en ninguna promesa de beneficio, ni del creador ni de nadie.",
    ackAffordLoss: "Solo gasto lo que puedo permitirme perder por completo.",
    ackLegend:
      "Se requiere antes de su primera compra y de nuevo cada vez que cambien estas condiciones.",
    ackWhitePaperLink: "Abrir la sección «Lea esto primero»",
    ackStatusUnavailable:
      "Estado de las confirmaciones de compra no disponible",
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
      "Un TTTI-T solo se crea cuando alguien paga en ICP, ckBTC, ckUSDC o ckUSDT al tipo mostrado. No existe ninguna reserva creada de antemano. Nadie, ni siquiera el administrador, puede crear TTTI-T de ninguna otra forma.",
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
  },
  "zh-Hans": {
    title: (symbol: string) => `铸造 ${symbol}`,
    noExtraTaken: "除所交付内容的成本外，不会收取任何额外的支付代币。",
    shownAs: (symbol: string) => `在钱包中显示为 ${symbol}。`,
    ackReadFirst: "我已阅读白皮书中的“请先阅读”部分。",
    ackNoRights:
      "我理解 TTTI 没有任何用途，也没有内在价值。我唯一享有的权利是个人担保：我可以按照赎回规则退还 TTTI，取回我自己的投入，没有共同储备，也不承诺任何价值。",
    ackPriceZero:
      "我理解其价格可能跌至零，且没有任何东西承诺其价值。仅适用个人保障：每位铸造者都可以按赎回规则将 TTTI-T 退还给合约，从而收回自己的本金。不存在共同储备。",
    ackIcpCreator:
      "我支付的 ICP、ckBTC、ckUSDC 或 ckUSDT 中，100/101 以所支付的代币留在合约中，由管理员管理，1/101 为铸造费用，用于永久流动性：一种机械、公开的深度管理，从不以价格为条件。",
    ackNoProfit: "我不依赖任何来自创建者或任何其他人的盈利承诺。",
    ackAffordLoss: "我只花费我能够承受全部损失的金额。",
    ackLegend: "首次购买前需确认，此后每当这些条款变更时需再次确认。",
    ackWhitePaperLink: "打开“请先阅读”部分",
    ackStatusUnavailable: "无法获取购买确认状态",
    ackTickAll: "勾选全部六项声明以启用铸造。",
    retry: "重试",
    invalidAmountTitle: "金额无效",
    invalidAmountMessage: (symbol: string, decimals: number) =>
      `请输入大于 0 的 ${symbol} 金额，最多 ${decimals} 位小数。`,
    belowMinimumTitle: "低于最低购买量",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      about: string | null,
    ) =>
      `最低 ${minimum} ${display}（以 ${symbol} 计 ${minimumUsd}）${about !== null ? `，约 ${about}` : ""}。`,
    aboveRemainingTitle: "超过剩余数量",
    aboveRemainingMessage: (remaining: string, display: string, max: string) =>
      `仅剩 ${remaining} ${display}（${max}）。`,
    insufficientTitle: (symbol: string, fee: string) =>
      `${symbol} 不足（金额 + ${fee} 手续费）`,
    insufficientMessage: (required: string) =>
      `您需要 ${required}（含手续费）。`,
    useMaximum: "使用最大值",
    approvalFailed: (symbol: string) => `${symbol} 授权失败`,
    purchaseNotCompleted: "购买未完成",
    purchaseNotSubmitted: "无法提交购买。请重试。",
    recordingAcks: "正在记录购买确认…",
    approving: (symbol: string) => `正在授权 ${symbol}…`,
    buying: "正在铸造…",
    saleComplete: "销售已结束",
    salesPaused: "销售已暂停",
    tokenUnavailable: (symbol: string) => `${symbol} 不可用`,
    buyWith: (symbol: string) => `使用 ${symbol} 铸造`,
    received: (amount: string, display: string) =>
      `您已收到 ${amount} ${display}`,
    buyTtti: "铸造 TTTI-T",
    buyHeading: "铸造",
    mintInfoToggle: "什么是 buy-to-mint（买即铸造）？",
    mintInfoBody1:
      "只有当有人按显示的汇率以 ICP、ckBTC、ckUSDC 或 ckUSDT 付款时，才会创建 TTTI-T。不存在预先创建的储备。任何人，包括管理员，都无法以其他方式创建 TTTI-T。",
    mintInfoBody2:
      "只有当矿工投入真实资源（能源和硬件）时，比特币才会产生。只有当有人带来真实的代币时，TTTI-T 才会产生。双方都以此承担真实的投入（skin in the game）。",
    walletPlug: "Plug",
    walletBuiltIn: "内置钱包",
    balanceLabel: (symbol: string) => `${symbol} 余额`,
    unavailable: "不可用",
    noTreasury: (symbol: string) => `目前无法使用 ${symbol} 铸造。`,
    youPayIn: (symbol: string) => `您以 ${symbol} 支付`,
    youReceive: "您将收到",
    withFees: (amount: string) => ` · 含手续费 ${amount}`,
    totalDebited: "含网络手续费的扣款总额：",
    noRateTitle: (symbol: string) => `本小时没有有效的 ${symbol}/USD 汇率`,
    noRateBody: (symbol: string) => `在设定汇率之前，无法使用 ${symbol} 购买。`,
  },
  "pt-BR": {
    title: (symbol: string) => `Cunhar ${symbol}`,
    noExtraTaken:
      "Nenhum valor do token pago é cobrado além do custo do que é entregue.",
    shownAs: (symbol: string) => `Exibido como ${symbol} nas carteiras.`,
    ackReadFirst: "Li a seção “Leia isto primeiro” do whitepaper.",
    ackNoRights:
      "Entendo que o TTTI não tem nenhum uso nem valor intrínseco. O único direito que tenho é a garantia pessoal: posso recuperar a minha própria participação devolvendo TTTI segundo as regras de resgate, sem reserva comum e sem promessa de valor.",
    ackPriceZero:
      "Entendo que seu preço pode cair a zero e que nada lhe promete um valor. Aplica-se apenas a garantia pessoal: cada minter pode recuperar o próprio aporte devolvendo TTTI-T ao contrato conforme as regras de resgate. Não há reserva comum.",
    ackIcpCreator:
      "Do ICP, ckBTC, ckUSDC ou ckUSDT que eu pago, 100/101 permanecem no contrato no token pago, gerenciados pelo administrador, e 1/101 é a taxa de mint, que alimenta a liquidez permanente: uma gestão de profundidade mecânica e pública, nunca condicionada ao preço.",
    ackNoProfit:
      "Não estou me baseando em nenhuma promessa de lucro, nem do criador nem de qualquer outra pessoa.",
    ackAffordLoss:
      "Estou gastando apenas o que posso me permitir perder por completo.",
    ackLegend:
      "Exigido antes da sua primeira compra e novamente sempre que estes termos mudarem.",
    ackWhitePaperLink: "Abrir a seção “Leia isto primeiro”",
    ackStatusUnavailable: "Status das confirmações de compra indisponível",
    ackTickAll: "Marque as seis declarações para habilitar a cunhagem.",
    retry: "Tentar novamente",
    invalidAmountTitle: "Valor inválido",
    invalidAmountMessage: (symbol: string, decimals: number) =>
      `Insira um valor em ${symbol} maior que 0 com até ${decimals} casas decimais.`,
    belowMinimumTitle: "Abaixo da compra mínima",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      about: string | null,
    ) =>
      `Mínimo de ${minimum} ${display} (${minimumUsd} em ${symbol})${about !== null ? `, cerca de ${about}` : ""}.`,
    aboveRemainingTitle: "Acima do valor restante",
    aboveRemainingMessage: (remaining: string, display: string, max: string) =>
      `Restam apenas ${remaining} ${display} (${max}).`,
    insufficientTitle: (symbol: string, fee: string) =>
      `${symbol} insuficiente (valor + ${fee} de taxas)`,
    insufficientMessage: (required: string) =>
      `Você precisa de ${required}, taxas incluídas.`,
    useMaximum: "Usar o máximo",
    approvalFailed: (symbol: string) => `Falha na aprovação de ${symbol}`,
    purchaseNotCompleted: "Compra não concluída",
    purchaseNotSubmitted: "Não foi possível enviar a compra. Tente novamente.",
    recordingAcks: "Registrando as confirmações de compra…",
    approving: (symbol: string) => `Aprovando ${symbol}…`,
    buying: "Cunhando…",
    saleComplete: "Venda encerrada",
    salesPaused: "As vendas estão pausadas",
    tokenUnavailable: (symbol: string) => `${symbol} indisponível`,
    buyWith: (symbol: string) => `Cunhar com ${symbol}`,
    received: (amount: string, display: string) =>
      `Você recebeu ${amount} ${display}`,
    buyTtti: "Cunhar TTTI-T",
    buyHeading: "Cunhar",
    mintInfoToggle: "O que é buy-to-mint?",
    mintInfoBody1:
      "Um TTTI-T só é criado quando alguém paga em ICP, ckBTC, ckUSDC ou ckUSDT pela cotação exibida. Não existe nenhuma reserva criada previamente. Ninguém, nem mesmo o administrador, pode criar TTTI-T de outra forma.",
    mintInfoBody2:
      "Um bitcoin só passa a existir quando um minerador gasta um recurso real: energia e hardware. Um TTTI-T só passa a existir quando alguém traz um token real. Dos dois lados, esse é o compromisso real (skin in the game).",
    walletPlug: "Plug",
    walletBuiltIn: "Carteira integrada",
    balanceLabel: (symbol: string) => `Saldo de ${symbol}`,
    unavailable: "Indisponível",
    noTreasury: (symbol: string) =>
      `A cunhagem com ${symbol} não está disponível no momento.`,
    youPayIn: (symbol: string) => `Você paga em ${symbol}`,
    youReceive: "Você recebe",
    withFees: (amount: string) => ` · ${amount} com taxas`,
    totalDebited: "Total debitado com as taxas de rede:",
    noRateTitle: (symbol: string) =>
      `Nenhuma cotação ${symbol}/USD válida para esta hora`,
    noRateBody: (symbol: string) =>
      `As compras em ${symbol} ficam indisponíveis até que uma cotação seja definida.`,
  },
  ko: {
    title: (symbol: string) => `${symbol} 발행`,
    noExtraTaken:
      "전달되는 항목의 비용을 초과하는 지불 토큰은 일절 가져가지 않습니다.",
    shownAs: (symbol: string) => `지갑에서는 ${symbol}(으)로 표시됩니다.`,
    ackReadFirst: "백서의 ‘먼저 읽어 주세요’ 섹션을 읽었습니다.",
    ackNoRights:
      "TTTI는 아무런 용도도 내재 가치도 없다는 것을 이해합니다. 제가 가진 유일한 권리는 개인 보증입니다. 상환 규칙에 따라 TTTI를 반환하여 제 지분을 되찾을 수 있으며, 공동 준비금은 없고 가치에 대한 약속도 없습니다.",
    ackPriceZero:
      "그 가격이 0까지 떨어질 수 있으며, 어떤 것도 그 가치를 약속하지 않는다는 것을 이해합니다. 개인 보장만 적용됩니다. 각 민터는 상환 규칙에 따라 TTTI-T를 컨트랙트에 반환하여 자신의 지분을 회수할 수 있습니다. 공동 준비금은 없습니다.",
    ackIcpCreator:
      "제가 지불하는 ICP, ckBTC, ckUSDC 또는 ckUSDT 중 100/101은 지불한 토큰으로 컨트랙트에 남아 관리자가 관리하며, 1/101은 민트 수수료이며, 영구 유동성에 쓰입니다. 이는 기계적이고 공개적인 깊이 관리이며 가격을 조건으로 하지 않습니다.",
    ackNoProfit:
      "저는 제작자로부터든 다른 누구로부터든 어떠한 수익 약속에도 의존하지 않습니다.",
    ackAffordLoss: "저는 전부 잃어도 감당할 수 있는 금액만 사용합니다.",
    ackLegend:
      "첫 구매 전에 필요하며, 이 약관이 변경될 때마다 다시 필요합니다.",
    ackWhitePaperLink: "‘먼저 읽어 주세요’ 섹션 열기",
    ackStatusUnavailable: "구매 확인 상태를 확인할 수 없습니다",
    ackTickAll: "발행을 활성화하려면 여섯 가지 진술을 모두 체크하세요.",
    retry: "다시 시도",
    invalidAmountTitle: "잘못된 금액",
    invalidAmountMessage: (symbol: string, decimals: number) =>
      `0보다 크고 소수점 이하 최대 ${decimals}자리인 ${symbol} 금액을 입력하세요.`,
    belowMinimumTitle: "최소 구매량 미만",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      about: string | null,
    ) =>
      `최소 ${minimum} ${display} (${symbol} 기준 ${minimumUsd})${about !== null ? `, 약 ${about}` : ""}.`,
    aboveRemainingTitle: "남은 수량 초과",
    aboveRemainingMessage: (remaining: string, display: string, max: string) =>
      `${remaining} ${display}만 남아 있습니다 (${max}).`,
    insufficientTitle: (symbol: string, fee: string) =>
      `${symbol} 부족 (금액 + 수수료 ${fee})`,
    insufficientMessage: (required: string) =>
      `수수료를 포함하여 ${required}이(가) 필요합니다.`,
    useMaximum: "최대값 사용",
    approvalFailed: (symbol: string) => `${symbol} 승인 실패`,
    purchaseNotCompleted: "구매가 완료되지 않았습니다",
    purchaseNotSubmitted: "구매를 제출할 수 없습니다. 다시 시도해 주세요.",
    recordingAcks: "구매 확인을 기록하는 중…",
    approving: (symbol: string) => `${symbol} 승인 중…`,
    buying: "발행 중…",
    saleComplete: "판매 종료",
    salesPaused: "판매가 일시 중지되었습니다",
    tokenUnavailable: (symbol: string) => `${symbol} 사용 불가`,
    buyWith: (symbol: string) => `${symbol}(으)로 발행`,
    received: (amount: string, display: string) =>
      `${amount} ${display}을(를) 받았습니다`,
    buyTtti: "TTTI-T 발행",
    buyHeading: "발행",
    mintInfoToggle: "buy-to-mint란 무엇인가요?",
    mintInfoBody1:
      "TTTI-T는 누군가가 표시된 환율로 ICP, ckBTC, ckUSDC 또는 ckUSDT를 지불할 때만 생성됩니다. 미리 만들어 둔 보유분은 없습니다. 관리자를 포함해 누구도 다른 방법으로 TTTI-T를 생성할 수 없습니다.",
    mintInfoBody2:
      "비트코인은 채굴자가 에너지와 하드웨어라는 실제 자원을 쓸 때만 생겨납니다. TTTI-T는 누군가가 실제 토큰을 가져올 때만 생겨납니다. 양쪽 모두 이것이 실제로 감수하는 몫(skin in the game)입니다.",
    walletPlug: "Plug",
    walletBuiltIn: "내장 지갑",
    balanceLabel: (symbol: string) => `${symbol} 잔액`,
    unavailable: "사용 불가",
    noTreasury: (symbol: string) => `현재 ${symbol}(으)로 발행할 수 없습니다.`,
    youPayIn: (symbol: string) => `${symbol}(으)로 지불`,
    youReceive: "받는 수량",
    withFees: (amount: string) => ` · 수수료 포함 ${amount}`,
    totalDebited: "네트워크 수수료를 포함한 총 차감액:",
    noRateTitle: (symbol: string) =>
      `이번 시간에 유효한 ${symbol}/USD 환율이 없습니다`,
    noRateBody: (symbol: string) =>
      `환율이 설정될 때까지 ${symbol}(으)로 구매할 수 없습니다.`,
  },
  "pa-Guru": {
    title: (symbol: string) => `${symbol} ਮਿੰਟ ਕਰੋ`,
    noExtraTaken:
      "ਜੋ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ ਉਸਦੀ ਲਾਗਤ ਤੋਂ ਵੱਧ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ ਕੋਈ ਵੀ ਰਕਮ ਨਹੀਂ ਲਈ ਜਾਂਦੀ।",
    shownAs: (symbol: string) => `ਵਾਲਿਟਾਂ ਵਿੱਚ ${symbol} ਵਜੋਂ ਦਿਖਾਇਆ ਜਾਂਦਾ ਹੈ।`,
    ackReadFirst: "ਮੈਂ ਵ੍ਹਾਈਟਪੇਪਰ ਦਾ “ਪਹਿਲਾਂ ਇਹ ਪੜ੍ਹੋ” ਭਾਗ ਪੜ੍ਹ ਲਿਆ ਹੈ।",
    ackNoRights:
      "ਮੈਨੂੰ ਸਮਝ ਹੈ ਕਿ TTTI ਦੀ ਕੋਈ ਵਰਤੋਂ ਨਹੀਂ ਅਤੇ ਕੋਈ ਅੰਦਰੂਨੀ ਮੁੱਲ ਨਹੀਂ। ਮੇਰਾ ਇੱਕੋ-ਇੱਕ ਅਧਿਕਾਰ ਨਿੱਜੀ ਗਾਰੰਟੀ ਹੈ: ਮੈਂ ਵਾਪਸੀ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ TTTI ਮੋੜ ਕੇ ਆਪਣੀ ਹੀ ਲਗਾਈ ਰਕਮ ਵਾਪਸ ਲੈ ਸਕਦਾ ਹਾਂ, ਕੋਈ ਸਾਂਝਾ ਰਿਜ਼ਰਵ ਨਹੀਂ ਹੈ ਅਤੇ ਮੁੱਲ ਦਾ ਕੋਈ ਵਾਅਦਾ ਨਹੀਂ।",
    ackPriceZero:
      "ਮੈਨੂੰ ਸਮਝ ਹੈ ਕਿ ਇਸਦੀ ਕੀਮਤ ਸਿਫ਼ਰ ਤੱਕ ਡਿੱਗ ਸਕਦੀ ਹੈ ਅਤੇ ਕੋਈ ਵੀ ਚੀਜ਼ ਇਸਦੇ ਮੁੱਲ ਦਾ ਵਾਅਦਾ ਨਹੀਂ ਕਰਦੀ। ਸਿਰਫ਼ ਨਿੱਜੀ ਗਾਰੰਟੀ ਲਾਗੂ ਹੁੰਦੀ ਹੈ: ਹਰ ਮਿੰਟਰ ਰਿਡੈਂਪਸ਼ਨ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ TTTI-T ਕੰਟਰੈਕਟ ਨੂੰ ਮੋੜ ਕੇ ਆਪਣੀ ਹੀ ਰਕਮ ਵਾਪਸ ਲੈ ਸਕਦਾ ਹੈ। ਕੋਈ ਸਾਂਝਾ ਰਿਜ਼ਰਵ ਨਹੀਂ ਹੈ।",
    ackIcpCreator:
      "ਮੇਰੇ ਵੱਲੋਂ ਭੁਗਤਾਨ ਕੀਤੇ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚੋਂ, 100/101 ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਕੰਟਰੈਕਟ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਐਡਮਿਨ ਵੱਲੋਂ ਸੰਭਾਲਿਆ ਜਾਂਦਾ ਹੈ, ਅਤੇ 1/101 ਮਿੰਟ ਫੀਸ ਹੈ, ਜੋ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਨੂੰ ਭਰਦੀ ਹੈ: ਡੂੰਘਾਈ ਦਾ ਮਸ਼ੀਨੀ ਅਤੇ ਜਨਤਕ ਪ੍ਰਬੰਧ, ਜੋ ਕਦੇ ਕੀਮਤ ਉੱਤੇ ਨਿਰਭਰ ਨਹੀਂ ਹੁੰਦਾ।",
    ackNoProfit: "ਮੈਂ ਨਿਰਮਾਤਾ ਜਾਂ ਕਿਸੇ ਹੋਰ ਵੱਲੋਂ ਮੁਨਾਫ਼ੇ ਦੇ ਕਿਸੇ ਵੀ ਵਾਅਦੇ 'ਤੇ ਨਿਰਭਰ ਨਹੀਂ ਹਾਂ।",
    ackAffordLoss:
      "ਮੇਰੇ ਵੱਲੋਂ ਖਰਚੀ ਜਾ ਰਹੀ ਰਕਮ ਸਿਰਫ਼ ਉਹੀ ਹੈ ਜਿਸਦਾ ਪੂਰਾ ਨੁਕਸਾਨ ਮੇਰੇ ਲਈ ਸਹਿਣਯੋਗ ਹੈ।",
    ackLegend:
      "ਤੁਹਾਡੀ ਪਹਿਲੀ ਖਰੀਦ ਤੋਂ ਪਹਿਲਾਂ ਲੋੜੀਂਦਾ, ਅਤੇ ਜਦੋਂ ਵੀ ਇਹ ਸ਼ਰਤਾਂ ਬਦਲਦੀਆਂ ਹਨ ਤਾਂ ਦੁਬਾਰਾ।",
    ackWhitePaperLink: "“ਪਹਿਲਾਂ ਇਹ ਪੜ੍ਹੋ” ਭਾਗ ਖੋਲ੍ਹੋ",
    ackStatusUnavailable: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਦੀ ਸਥਿਤੀ ਉਪਲਬਧ ਨਹੀਂ",
    ackTickAll: "ਮਿੰਟਿੰਗ ਨੂੰ ਚਾਲੂ ਕਰਨ ਲਈ ਸਾਰੇ ਛੇ ਕਥਨਾਂ 'ਤੇ ਨਿਸ਼ਾਨ ਲਗਾਓ।",
    retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    invalidAmountTitle: "ਅਵੈਧ ਰਕਮ",
    invalidAmountMessage: (symbol: string, decimals: number) =>
      `0 ਤੋਂ ਵੱਧ ਅਤੇ ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕਾਂ ਵਾਲੀ ${symbol} ਰਕਮ ਦਰਜ ਕਰੋ।`,
    belowMinimumTitle: "ਘੱਟੋ-ਘੱਟ ਖਰੀਦ ਤੋਂ ਘੱਟ",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      about: string | null,
    ) =>
      `ਘੱਟੋ-ਘੱਟ ${minimum} ${display} (${symbol} ਵਿੱਚ ${minimumUsd})${about !== null ? `, ਲਗਭਗ ${about}` : ""}।`,
    aboveRemainingTitle: "ਬਾਕੀ ਰਕਮ ਤੋਂ ਵੱਧ",
    aboveRemainingMessage: (remaining: string, display: string, max: string) =>
      `ਸਿਰਫ਼ ${remaining} ${display} ਬਾਕੀ ਹਨ (${max})।`,
    insufficientTitle: (symbol: string, fee: string) =>
      `${symbol} ਨਾਕਾਫ਼ੀ (ਰਕਮ + ${fee} ਫੀਸਾਂ)`,
    insufficientMessage: (required: string) =>
      `ਤੁਹਾਨੂੰ ਫੀਸਾਂ ਸਮੇਤ ${required} ਦੀ ਲੋੜ ਹੈ।`,
    useMaximum: "ਵੱਧ ਤੋਂ ਵੱਧ ਵਰਤੋ",
    approvalFailed: (symbol: string) => `${symbol} ਮਨਜ਼ੂਰੀ ਅਸਫਲ ਰਹੀ`,
    purchaseNotCompleted: "ਖਰੀਦ ਪੂਰੀ ਨਹੀਂ ਹੋਈ",
    purchaseNotSubmitted: "ਖਰੀਦ ਜਮ੍ਹਾਂ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    recordingAcks: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਦਰਜ ਕੀਤੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ…",
    approving: (symbol: string) => `${symbol} ਦੀ ਮਨਜ਼ੂਰੀ ਦਿੱਤੀ ਜਾ ਰਹੀ ਹੈ…`,
    buying: "ਮਿੰਟਿੰਗ ਜਾਰੀ ਹੈ…",
    saleComplete: "ਵਿਕਰੀ ਪੂਰੀ ਹੋਈ",
    salesPaused: "ਵਿਕਰੀ ਰੋਕੀ ਗਈ ਹੈ",
    tokenUnavailable: (symbol: string) => `${symbol} ਉਪਲਬਧ ਨਹੀਂ`,
    buyWith: (symbol: string) => `${symbol} ਨਾਲ ਮਿੰਟ ਕਰੋ`,
    received: (amount: string, display: string) =>
      `ਤੁਹਾਨੂੰ ${amount} ${display} ਪ੍ਰਾਪਤ ਹੋਏ`,
    buyTtti: "TTTI-T ਮਿੰਟ ਕਰੋ",
    buyHeading: "ਮਿੰਟ ਕਰੋ",
    mintInfoToggle: "buy-to-mint ਕੀ ਹੈ?",
    mintInfoBody1:
      "TTTI-T ਸਿਰਫ਼ ਉਦੋਂ ਬਣਦਾ ਹੈ ਜਦੋਂ ਕੋਈ ਦਿਖਾਈ ਗਈ ਦਰ 'ਤੇ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਭੁਗਤਾਨ ਕਰਦਾ ਹੈ। ਪਹਿਲਾਂ ਤੋਂ ਬਣਾਇਆ ਕੋਈ ਭੰਡਾਰ ਨਹੀਂ ਹੈ। ਕੋਈ ਵੀ, ਐਡਮਿਨ ਸਮੇਤ, ਕਿਸੇ ਹੋਰ ਤਰੀਕੇ ਨਾਲ TTTI-T ਨਹੀਂ ਬਣਾ ਸਕਦਾ।",
    mintInfoBody2:
      "ਇੱਕ ਬਿਟਕੋਇਨ ਸਿਰਫ਼ ਉਦੋਂ ਹੋਂਦ ਵਿੱਚ ਆਉਂਦਾ ਹੈ ਜਦੋਂ ਕੋਈ ਮਾਈਨਰ ਅਸਲ ਸਰੋਤ ਖਰਚਦਾ ਹੈ: ਊਰਜਾ ਅਤੇ ਹਾਰਡਵੇਅਰ। ਇੱਕ TTTI-T ਸਿਰਫ਼ ਉਦੋਂ ਹੋਂਦ ਵਿੱਚ ਆਉਂਦਾ ਹੈ ਜਦੋਂ ਕੋਈ ਅਸਲ ਟੋਕਨ ਲਿਆਉਂਦਾ ਹੈ। ਦੋਵੇਂ ਪਾਸੇ, ਇਹੀ ਅਸਲ ਦਾਅ (skin in the game) ਹੈ।",
    walletPlug: "Plug",
    walletBuiltIn: "ਬਿਲਟ-ਇਨ ਵਾਲਿਟ",
    balanceLabel: (symbol: string) => `${symbol} ਬਕਾਇਆ`,
    unavailable: "ਉਪਲਬਧ ਨਹੀਂ",
    noTreasury: (symbol: string) => `ਇਸ ਸਮੇਂ ${symbol} ਨਾਲ ਮਿੰਟ ਕਰਨਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।`,
    youPayIn: (symbol: string) => `ਤੁਸੀਂ ${symbol} ਵਿੱਚ ਭੁਗਤਾਨ ਕਰਦੇ ਹੋ`,
    youReceive: "ਤੁਹਾਨੂੰ ਮਿਲਦਾ ਹੈ",
    withFees: (amount: string) => ` · ਫੀਸਾਂ ਸਮੇਤ ${amount}`,
    totalDebited: "ਨੈੱਟਵਰਕ ਫੀਸਾਂ ਸਮੇਤ ਕੁੱਲ ਕੱਟੀ ਗਈ ਰਕਮ:",
    noRateTitle: (symbol: string) => `ਇਸ ਘੰਟੇ ਲਈ ਕੋਈ ਵੈਧ ${symbol}/USD ਦਰ ਨਹੀਂ`,
    noRateBody: (symbol: string) =>
      `ਦਰ ਨਿਰਧਾਰਤ ਹੋਣ ਤੱਕ ${symbol} ਵਿੱਚ ਖਰੀਦਾਂ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।`,
  },
});

/**
 * English buy-to-mint explanation, rendered as-is in the white paper so the
 * mint page and the white paper share one text.
 */
export const MINT_INFO_EN = {
  toggle: BUY_PAGE_TEXT.en.mintInfoToggle,
  paragraphs: [
    BUY_PAGE_TEXT.en.mintInfoBody1,
    BUY_PAGE_TEXT.en.mintInfoBody2,
  ] as const,
};

/**
 * components/exchange/purchaseOutcome.ts. Read with pickDict(BUY_OUTCOME_TEXT, lang).
 * Entries taking `server` show the backend's message in English; the other
 * languages use their own sentence for the same error code.
 */
export const BUY_OUTCOME_TEXT = defineDict({
  en: {
    fallbackMessage:
      "The purchase could not be completed for this destination. Check the recipient and try again.",
    server: (server: string) => server,
    reference: (id: string) => ` Reference: purchase #${id}.`,
    contactTeam: " Contact the team with this reference.",
    refundedTitle: (symbol: string, fee: string) =>
      `Delivery failed — your ${symbol} was refunded minus the ${fee} fee`,
    refundFailed: "Delivery failed and the automatic refund also failed",
    refundedMessage: (server: string) => server,
    refundFailedMessage: (server: string) => server,
    salesPausedTitle: "Sales are paused",
    salesPausedMessage: (server: string) => server,
    saleCompleteTitle: "Sale complete",
    saleCompleteMessage: (server: string) => server,
    belowMinimumTitle: "Below the minimum purchase",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      requested: string,
    ) =>
      `The minimum is ${minimum} ${display} (${minimumUsd} in ${symbol}); you requested ${requested} ${display}.`,
    aboveRemainingTitle: "Above the remaining amount",
    aboveRemainingMessage: (
      maximum: string,
      display: string,
      maximumPay: string,
      requested: string,
    ) =>
      `The maximum available is ${maximum} ${display} (${maximumPay}); you requested ${requested} ${display}.`,
    priceUnavailableTitle: (symbol: string) =>
      `Purchase refused: no valid ${symbol}/USD rate is set`,
    priceUnavailableMessage: (symbol: string) =>
      `No ${symbol} was taken. Purchases in ${symbol} are unavailable until a rate is set.`,
    notConfiguredTitle: (symbol: string) => `${symbol} is not configured`,
    notConfiguredMessage: (symbol: string) =>
      `The sale is not configured yet. No ${symbol} was taken.`,
    ledgerMismatchTitle: (symbol: string) => `${symbol} ledger mismatch`,
    ledgerMismatchMessage: (
      symbol: string,
      actualDecimals: string,
      actualFee: string,
      expectedDecimals: string,
      expectedFee: string,
    ) =>
      `The ${symbol} ledger reports ${actualDecimals} decimals and a fee of ${actualFee}; expected ${expectedDecimals} decimals and ${expectedFee}. No ${symbol} was taken.`,
    ackRequiredTitle: "Acknowledgements required",
    ackRequiredMessage: (symbol: string) =>
      `This account has not accepted the six purchase acknowledgements. No ${symbol} was taken.`,
    invalidAmountTitle: "Invalid amount",
    invalidAmountMessage: (server: string) => server,
    insufficientTitle: (symbol: string) => `Insufficient ${symbol} balance`,
    insufficientMessage: (server: string, balance: string) =>
      `${server} Balance: ${balance}.`,
    approvalMissingTitle: (symbol: string) => `${symbol} approval missing`,
    approvalMissingMessage: (server: string, allowance: string) =>
      `${server} Current allowance: ${allowance}.`,
    inProgressTitle: "Purchase already in progress",
    inProgressMessage: (symbol: string) =>
      `A purchase is already in progress for this account. Wait for it to finish, then try again. No ${symbol} was taken for this request.`,
    ledgerErrorTitle: (symbol: string) => `${symbol} ledger error`,
    ledgerErrorMessage: (server: string) => server,
    signInTitle: "Sign in to mint",
    signInMessage: (_server: string) => "Please sign in to mint TTTI-T.",
    notCompletedTitle: "Purchase not completed",
    failedTitle: "Purchase failed",
  },
  fr: {
    fallbackMessage:
      "L'achat n'a pas pu être effectué pour cette destination. Vérifiez le destinataire et réessayez.",
    server: (server: string) => server,
    reference: (id: string) => ` Référence : achat #${id}.`,
    contactTeam: " Contactez l'équipe en indiquant cette référence.",
    refundedTitle: (symbol: string, fee: string) =>
      `Échec de la livraison — votre ${symbol} a été remboursé, moins les frais de ${fee}`,
    refundFailed:
      "La livraison a échoué et le remboursement automatique a également échoué",
    refundedMessage: () =>
      "La livraison du TTTI-T a échoué ; le paiement a été remboursé, moins les frais du ledger.",
    refundFailedMessage: () =>
      "La livraison du TTTI-T a échoué et le remboursement a également échoué ; cet achat nécessite un suivi manuel.",
    salesPausedTitle: "Les ventes sont suspendues",
    salesPausedMessage: () => "Les achats sont temporairement désactivés.",
    saleCompleteTitle: "Vente terminée",
    saleCompleteMessage: () =>
      "Vente de TTTI-T terminée : il ne reste plus de TTTI-T à vendre.",
    belowMinimumTitle: "Inférieur à l'achat minimum",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      requested: string,
    ) =>
      `Le minimum est de ${minimum} ${display} (${minimumUsd} en ${symbol}) ; vous avez demandé ${requested} ${display}.`,
    aboveRemainingTitle: "Supérieur au montant restant",
    aboveRemainingMessage: (
      maximum: string,
      display: string,
      maximumPay: string,
      requested: string,
    ) =>
      `Le maximum disponible est de ${maximum} ${display} (${maximumPay}) ; vous avez demandé ${requested} ${display}.`,
    priceUnavailableTitle: (symbol: string) =>
      `Achat refusé : aucun taux ${symbol}/USD valide n'est fixé`,
    priceUnavailableMessage: (symbol: string) =>
      `Aucun ${symbol} n'a été prélevé. Les achats en ${symbol} sont indisponibles tant qu'aucun taux n'est fixé.`,
    notConfiguredTitle: (symbol: string) => `${symbol} n'est pas configuré`,
    notConfiguredMessage: (symbol: string) =>
      `La vente n'est pas encore configurée. Aucun ${symbol} n'a été prélevé.`,
    ledgerMismatchTitle: (symbol: string) => `Incohérence du ledger ${symbol}`,
    ledgerMismatchMessage: (
      symbol: string,
      actualDecimals: string,
      actualFee: string,
      expectedDecimals: string,
      expectedFee: string,
    ) =>
      `Le ledger ${symbol} indique ${actualDecimals} décimales et des frais de ${actualFee} ; attendu : ${expectedDecimals} décimales et ${expectedFee}. Aucun ${symbol} n'a été prélevé.`,
    ackRequiredTitle: "Confirmations d'achat requises",
    ackRequiredMessage: (symbol: string) =>
      `Ce compte n'a pas accepté les six confirmations d'achat. Aucun ${symbol} n'a été prélevé.`,
    invalidAmountTitle: "Montant invalide",
    invalidAmountMessage: () =>
      "Ce montant ou ce compte de livraison ne peut pas être accepté. Rien n'a été prélevé.",
    insufficientTitle: (symbol: string) => `Solde ${symbol} insuffisant`,
    insufficientMessage: (_server: string, balance: string) =>
      `Le solde ne couvre pas cet achat. Solde : ${balance}.`,
    approvalMissingTitle: (symbol: string) => `Approbation ${symbol} manquante`,
    approvalMissingMessage: (_server: string, allowance: string) =>
      `L'autorisation ne couvre pas cet achat. Autorisation actuelle : ${allowance}.`,
    inProgressTitle: "Achat déjà en cours",
    inProgressMessage: (symbol: string) =>
      `Un achat est déjà en cours pour ce compte. Attendez qu'il se termine, puis réessayez. Aucun ${symbol} n'a été prélevé pour cette demande.`,
    ledgerErrorTitle: (symbol: string) => `Erreur du ledger ${symbol}`,
    ledgerErrorMessage: () =>
      "Le ledger n'a pas pu être joint ou l'opération a échoué. Réessayez.",
    signInTitle: "Connectez-vous pour frapper",
    signInMessage: () => "Veuillez vous connecter pour frapper du TTTI-T.",
    notCompletedTitle: "Achat non effectué",
    failedTitle: "Échec de l'achat",
  },
  es: {
    fallbackMessage:
      "No se pudo completar la compra para este destino. Compruebe el destinatario e inténtelo de nuevo.",
    server: (server: string) => server,
    reference: (id: string) => ` Referencia: compra n.º ${id}.`,
    contactTeam:
      " Póngase en contacto con el equipo indicando esta referencia.",
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
    ledgerMismatchTitle: (symbol: string) =>
      `Discrepancia del ledger ${symbol}`,
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
    approvalMissingTitle: (symbol: string) =>
      `Falta la aprobación de ${symbol}`,
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
  },
  "zh-Hans": {
    fallbackMessage: "无法为此目标完成购买。请检查收款方后重试。",
    server: (server: string) => server,
    reference: (id: string) => ` 参考编号：购买 #${id}。`,
    contactTeam: " 请凭此参考编号联系团队。",
    refundedTitle: (symbol: string, fee: string) =>
      `交付失败 — 您的 ${symbol} 已退还，扣除 ${fee} 手续费`,
    refundFailed: "交付失败，自动退款也失败了",
    refundedMessage: () => "TTTI-T 交付失败；付款已退还，扣除账本手续费。",
    refundFailedMessage: () =>
      "TTTI-T 交付失败，退款也失败了；此购买需要人工跟进。",
    salesPausedTitle: "销售已暂停",
    salesPausedMessage: () => "购买功能暂时停用。",
    saleCompleteTitle: "销售已结束",
    saleCompleteMessage: () =>
      "TTTI-T 销售已结束：已没有剩余的 TTTI-T 可供出售。",
    belowMinimumTitle: "低于最低购买量",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      requested: string,
    ) =>
      `最低为 ${minimum} ${display}（以 ${symbol} 计 ${minimumUsd}）；您请求了 ${requested} ${display}。`,
    aboveRemainingTitle: "超过剩余数量",
    aboveRemainingMessage: (
      maximum: string,
      display: string,
      maximumPay: string,
      requested: string,
    ) =>
      `最多可购买 ${maximum} ${display}（${maximumPay}）；您请求了 ${requested} ${display}。`,
    priceUnavailableTitle: (symbol: string) =>
      `购买被拒绝：未设定有效的 ${symbol}/USD 汇率`,
    priceUnavailableMessage: (symbol: string) =>
      `未扣取任何 ${symbol}。在设定汇率之前，无法使用 ${symbol} 购买。`,
    notConfiguredTitle: (symbol: string) => `${symbol} 未配置`,
    notConfiguredMessage: (symbol: string) =>
      `销售尚未配置。未扣取任何 ${symbol}。`,
    ledgerMismatchTitle: (symbol: string) => `${symbol} 账本不一致`,
    ledgerMismatchMessage: (
      symbol: string,
      actualDecimals: string,
      actualFee: string,
      expectedDecimals: string,
      expectedFee: string,
    ) =>
      `${symbol} 账本报告 ${actualDecimals} 位小数、手续费 ${actualFee}；预期为 ${expectedDecimals} 位小数和 ${expectedFee}。未扣取任何 ${symbol}。`,
    ackRequiredTitle: "需要购买确认",
    ackRequiredMessage: (symbol: string) =>
      `此账户尚未接受六项购买确认。未扣取任何 ${symbol}。`,
    invalidAmountTitle: "金额无效",
    invalidAmountMessage: () => "无法接受此金额或此交付账户。未扣取任何款项。",
    insufficientTitle: (symbol: string) => `${symbol} 余额不足`,
    insufficientMessage: (_server: string, balance: string) =>
      `余额不足以支付此次购买。余额：${balance}。`,
    approvalMissingTitle: (symbol: string) => `缺少 ${symbol} 授权`,
    approvalMissingMessage: (_server: string, allowance: string) =>
      `授权额度不足以支付此次购买。当前授权额度：${allowance}。`,
    inProgressTitle: "购买已在进行中",
    inProgressMessage: (symbol: string) =>
      `此账户已有一笔购买正在进行。请等待其完成后重试。此请求未扣取任何 ${symbol}。`,
    ledgerErrorTitle: (symbol: string) => `${symbol} 账本错误`,
    ledgerErrorMessage: () => "无法连接账本或操作失败。请重试。",
    signInTitle: "登录以铸造",
    signInMessage: () => "请登录以铸造 TTTI-T。",
    notCompletedTitle: "购买未完成",
    failedTitle: "购买失败",
  },
  "pt-BR": {
    fallbackMessage:
      "Não foi possível concluir a compra para este destino. Verifique o destinatário e tente novamente.",
    server: (server: string) => server,
    reference: (id: string) => ` Referência: compra nº ${id}.`,
    contactTeam: " Entre em contato com a equipe informando esta referência.",
    refundedTitle: (symbol: string, fee: string) =>
      `A entrega falhou — seu ${symbol} foi reembolsado, descontada a taxa de ${fee}`,
    refundFailed: "A entrega falhou e o reembolso automático também falhou",
    refundedMessage: () =>
      "A entrega do TTTI-T falhou; o pagamento foi reembolsado, descontada a taxa do ledger.",
    refundFailedMessage: () =>
      "A entrega do TTTI-T falhou e o reembolso também falhou; esta compra exige acompanhamento manual.",
    salesPausedTitle: "As vendas estão pausadas",
    salesPausedMessage: () => "As compras estão temporariamente desativadas.",
    saleCompleteTitle: "Venda encerrada",
    saleCompleteMessage: () =>
      "Venda de TTTI-T encerrada: não resta TTTI-T para vender.",
    belowMinimumTitle: "Abaixo da compra mínima",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      requested: string,
    ) =>
      `O mínimo é ${minimum} ${display} (${minimumUsd} em ${symbol}); você solicitou ${requested} ${display}.`,
    aboveRemainingTitle: "Acima do valor restante",
    aboveRemainingMessage: (
      maximum: string,
      display: string,
      maximumPay: string,
      requested: string,
    ) =>
      `O máximo disponível é ${maximum} ${display} (${maximumPay}); você solicitou ${requested} ${display}.`,
    priceUnavailableTitle: (symbol: string) =>
      `Compra recusada: nenhuma cotação ${symbol}/USD válida está definida`,
    priceUnavailableMessage: (symbol: string) =>
      `Nenhum ${symbol} foi cobrado. As compras em ${symbol} ficam indisponíveis até que uma cotação seja definida.`,
    notConfiguredTitle: (symbol: string) => `${symbol} não está configurado`,
    notConfiguredMessage: (symbol: string) =>
      `A venda ainda não está configurada. Nenhum ${symbol} foi cobrado.`,
    ledgerMismatchTitle: (symbol: string) =>
      `Inconsistência no ledger de ${symbol}`,
    ledgerMismatchMessage: (
      symbol: string,
      actualDecimals: string,
      actualFee: string,
      expectedDecimals: string,
      expectedFee: string,
    ) =>
      `O ledger de ${symbol} informa ${actualDecimals} casas decimais e uma taxa de ${actualFee}; esperado: ${expectedDecimals} casas decimais e ${expectedFee}. Nenhum ${symbol} foi cobrado.`,
    ackRequiredTitle: "Confirmações de compra exigidas",
    ackRequiredMessage: (symbol: string) =>
      `Esta conta não aceitou as seis confirmações de compra. Nenhum ${symbol} foi cobrado.`,
    invalidAmountTitle: "Valor inválido",
    invalidAmountMessage: () =>
      "Este valor ou esta conta de entrega não pode ser aceito. Nada foi cobrado.",
    insufficientTitle: (symbol: string) => `Saldo de ${symbol} insuficiente`,
    insufficientMessage: (_server: string, balance: string) =>
      `O saldo não cobre esta compra. Saldo: ${balance}.`,
    approvalMissingTitle: (symbol: string) => `Aprovação de ${symbol} ausente`,
    approvalMissingMessage: (_server: string, allowance: string) =>
      `A autorização não cobre esta compra. Autorização atual: ${allowance}.`,
    inProgressTitle: "Compra já em andamento",
    inProgressMessage: (symbol: string) =>
      `Já há uma compra em andamento para esta conta. Aguarde a conclusão e tente novamente. Nenhum ${symbol} foi cobrado por esta solicitação.`,
    ledgerErrorTitle: (symbol: string) => `Erro no ledger de ${symbol}`,
    ledgerErrorMessage: () =>
      "Não foi possível acessar o ledger ou a operação falhou. Tente novamente.",
    signInTitle: "Entre para cunhar",
    signInMessage: () => "Entre na sua conta para cunhar TTTI-T.",
    notCompletedTitle: "Compra não concluída",
    failedTitle: "A compra falhou",
  },
  ko: {
    fallbackMessage:
      "이 대상에 대한 구매를 완료할 수 없습니다. 수령인을 확인한 후 다시 시도하세요.",
    server: (server: string) => server,
    reference: (id: string) => ` 참조: 구매 #${id}.`,
    contactTeam: " 이 참조 번호로 팀에 문의하세요.",
    refundedTitle: (symbol: string, fee: string) =>
      `전달 실패 — ${fee} 수수료를 제외한 ${symbol}이(가) 환불되었습니다`,
    refundFailed: "전달에 실패했으며 자동 환불도 실패했습니다",
    refundedMessage: () =>
      "TTTI-T 전달에 실패했습니다. 원장 수수료를 제외한 결제 금액이 환불되었습니다.",
    refundFailedMessage: () =>
      "TTTI-T 전달에 실패했으며 환불도 실패했습니다. 이 구매는 수동 후속 조치가 필요합니다.",
    salesPausedTitle: "판매가 일시 중지되었습니다",
    salesPausedMessage: () => "구매가 일시적으로 비활성화되었습니다.",
    saleCompleteTitle: "판매 종료",
    saleCompleteMessage: () =>
      "TTTI-T 판매가 종료되었습니다. 판매할 TTTI-T가 남아 있지 않습니다.",
    belowMinimumTitle: "최소 구매량 미만",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      requested: string,
    ) =>
      `최소량은 ${minimum} ${display} (${symbol} 기준 ${minimumUsd})이며, 요청하신 수량은 ${requested} ${display}입니다.`,
    aboveRemainingTitle: "남은 수량 초과",
    aboveRemainingMessage: (
      maximum: string,
      display: string,
      maximumPay: string,
      requested: string,
    ) =>
      `구매 가능한 최대량은 ${maximum} ${display} (${maximumPay})이며, 요청하신 수량은 ${requested} ${display}입니다.`,
    priceUnavailableTitle: (symbol: string) =>
      `구매 거부: 유효한 ${symbol}/USD 환율이 설정되어 있지 않습니다`,
    priceUnavailableMessage: (symbol: string) =>
      `${symbol}은(는) 전혀 차감되지 않았습니다. 환율이 설정될 때까지 ${symbol}(으)로 구매할 수 없습니다.`,
    notConfiguredTitle: (symbol: string) =>
      `${symbol}이(가) 구성되어 있지 않습니다`,
    notConfiguredMessage: (symbol: string) =>
      `판매가 아직 구성되지 않았습니다. ${symbol}은(는) 전혀 차감되지 않았습니다.`,
    ledgerMismatchTitle: (symbol: string) => `${symbol} 원장 불일치`,
    ledgerMismatchMessage: (
      symbol: string,
      actualDecimals: string,
      actualFee: string,
      expectedDecimals: string,
      expectedFee: string,
    ) =>
      `${symbol} 원장이 소수점 ${actualDecimals}자리와 수수료 ${actualFee}을(를) 보고했습니다. 예상 값은 소수점 ${expectedDecimals}자리와 ${expectedFee}입니다. ${symbol}은(는) 전혀 차감되지 않았습니다.`,
    ackRequiredTitle: "구매 확인 필요",
    ackRequiredMessage: (symbol: string) =>
      `이 계정은 여섯 가지 구매 확인을 수락하지 않았습니다. ${symbol}은(는) 전혀 차감되지 않았습니다.`,
    invalidAmountTitle: "잘못된 금액",
    invalidAmountMessage: () =>
      "이 금액 또는 이 전달 계정은 허용될 수 없습니다. 아무것도 차감되지 않았습니다.",
    insufficientTitle: (symbol: string) => `${symbol} 잔액 부족`,
    insufficientMessage: (_server: string, balance: string) =>
      `잔액이 이 구매 금액에 미치지 못합니다. 잔액: ${balance}.`,
    approvalMissingTitle: (symbol: string) => `${symbol} 승인 없음`,
    approvalMissingMessage: (_server: string, allowance: string) =>
      `승인 한도가 이 구매 금액에 미치지 못합니다. 현재 승인 한도: ${allowance}.`,
    inProgressTitle: "이미 진행 중인 구매",
    inProgressMessage: (symbol: string) =>
      `이 계정에 대해 이미 진행 중인 구매가 있습니다. 완료될 때까지 기다린 후 다시 시도하세요. 이 요청에 대해 ${symbol}은(는) 전혀 차감되지 않았습니다.`,
    ledgerErrorTitle: (symbol: string) => `${symbol} 원장 오류`,
    ledgerErrorMessage: () =>
      "원장에 연결할 수 없거나 작업이 실패했습니다. 다시 시도하세요.",
    signInTitle: "발행하려면 로그인하세요",
    signInMessage: () => "TTTI-T를 발행하려면 로그인하세요.",
    notCompletedTitle: "구매가 완료되지 않았습니다",
    failedTitle: "구매 실패",
  },
  "pa-Guru": {
    fallbackMessage:
      "ਇਸ ਮੰਜ਼ਿਲ ਲਈ ਖਰੀਦ ਪੂਰੀ ਨਹੀਂ ਹੋ ਸਕੀ। ਪ੍ਰਾਪਤਕਰਤਾ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    server: (server: string) => server,
    reference: (id: string) => ` ਹਵਾਲਾ: ਖਰੀਦ #${id}।`,
    contactTeam: " ਇਸ ਹਵਾਲੇ ਨਾਲ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
    refundedTitle: (symbol: string, fee: string) =>
      `ਡਿਲੀਵਰੀ ਅਸਫਲ ਰਹੀ — ਤੁਹਾਡਾ ${symbol} ${fee} ਫੀਸ ਘਟਾ ਕੇ ਵਾਪਸ ਕਰ ਦਿੱਤਾ ਗਿਆ`,
    refundFailed: "ਡਿਲੀਵਰੀ ਅਸਫਲ ਰਹੀ ਅਤੇ ਆਟੋਮੈਟਿਕ ਰਿਫੰਡ ਵੀ ਅਸਫਲ ਰਿਹਾ",
    refundedMessage: () =>
      "TTTI-T ਦੀ ਡਿਲੀਵਰੀ ਅਸਫਲ ਰਹੀ; ਭੁਗਤਾਨ ledger ਫੀਸ ਘਟਾ ਕੇ ਵਾਪਸ ਕਰ ਦਿੱਤਾ ਗਿਆ।",
    refundFailedMessage: () =>
      "TTTI-T ਦੀ ਡਿਲੀਵਰੀ ਅਸਫਲ ਰਹੀ ਅਤੇ ਰਿਫੰਡ ਵੀ ਅਸਫਲ ਰਿਹਾ; ਇਸ ਖਰੀਦ ਲਈ ਹੱਥੀਂ ਪੈਰਵੀ ਦੀ ਲੋੜ ਹੈ।",
    salesPausedTitle: "ਵਿਕਰੀ ਰੋਕੀ ਗਈ ਹੈ",
    salesPausedMessage: () => "ਖਰੀਦਾਂ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਬੰਦ ਹਨ।",
    saleCompleteTitle: "ਵਿਕਰੀ ਪੂਰੀ ਹੋਈ",
    saleCompleteMessage: () =>
      "TTTI-T ਦੀ ਵਿਕਰੀ ਪੂਰੀ ਹੋਈ: ਵੇਚਣ ਲਈ ਕੋਈ TTTI-T ਬਾਕੀ ਨਹੀਂ ਹੈ।",
    belowMinimumTitle: "ਘੱਟੋ-ਘੱਟ ਖਰੀਦ ਤੋਂ ਘੱਟ",
    belowMinimumMessage: (
      minimum: string,
      display: string,
      minimumUsd: string,
      symbol: string,
      requested: string,
    ) =>
      `ਘੱਟੋ-ਘੱਟ ${minimum} ${display} (${symbol} ਵਿੱਚ ${minimumUsd}) ਹੈ; ਤੁਸੀਂ ${requested} ${display} ਦੀ ਬੇਨਤੀ ਕੀਤੀ।`,
    aboveRemainingTitle: "ਬਾਕੀ ਰਕਮ ਤੋਂ ਵੱਧ",
    aboveRemainingMessage: (
      maximum: string,
      display: string,
      maximumPay: string,
      requested: string,
    ) =>
      `ਵੱਧ ਤੋਂ ਵੱਧ ਉਪਲਬਧ ${maximum} ${display} (${maximumPay}) ਹੈ; ਤੁਸੀਂ ${requested} ${display} ਦੀ ਬੇਨਤੀ ਕੀਤੀ।`,
    priceUnavailableTitle: (symbol: string) =>
      `ਖਰੀਦ ਅਸਵੀਕਾਰ: ਕੋਈ ਵੈਧ ${symbol}/USD ਦਰ ਨਿਰਧਾਰਤ ਨਹੀਂ ਹੈ`,
    priceUnavailableMessage: (symbol: string) =>
      `ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ। ਦਰ ਨਿਰਧਾਰਤ ਹੋਣ ਤੱਕ ${symbol} ਵਿੱਚ ਖਰੀਦਾਂ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।`,
    notConfiguredTitle: (symbol: string) => `${symbol} ਸੰਰਚਿਤ ਨਹੀਂ ਹੈ`,
    notConfiguredMessage: (symbol: string) =>
      `ਵਿਕਰੀ ਅਜੇ ਸੰਰਚਿਤ ਨਹੀਂ ਹੈ। ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ।`,
    ledgerMismatchTitle: (symbol: string) => `${symbol} ledger ਬੇਮੇਲ`,
    ledgerMismatchMessage: (
      symbol: string,
      actualDecimals: string,
      actualFee: string,
      expectedDecimals: string,
      expectedFee: string,
    ) =>
      `${symbol} ledger ${actualDecimals} ਦਸ਼ਮਲਵ ਅੰਕ ਅਤੇ ${actualFee} ਦੀ ਫੀਸ ਦੱਸਦਾ ਹੈ; ਉਮੀਦ ${expectedDecimals} ਦਸ਼ਮਲਵ ਅੰਕ ਅਤੇ ${expectedFee} ਸੀ। ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ।`,
    ackRequiredTitle: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਲੋੜੀਂਦੀਆਂ ਹਨ",
    ackRequiredMessage: (symbol: string) =>
      `ਇਸ ਖਾਤੇ ਨੇ ਛੇ ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਸਵੀਕਾਰ ਨਹੀਂ ਕੀਤੀਆਂ। ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ।`,
    invalidAmountTitle: "ਅਵੈਧ ਰਕਮ",
    invalidAmountMessage: () =>
      "ਇਹ ਰਕਮ ਜਾਂ ਇਹ ਡਿਲੀਵਰੀ ਖਾਤਾ ਸਵੀਕਾਰ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ। ਕੁਝ ਵੀ ਨਹੀਂ ਲਿਆ ਗਿਆ।",
    insufficientTitle: (symbol: string) => `${symbol} ਬਕਾਇਆ ਨਾਕਾਫ਼ੀ`,
    insufficientMessage: (_server: string, balance: string) =>
      `ਬਕਾਇਆ ਇਸ ਖਰੀਦ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ। ਬਕਾਇਆ: ${balance}।`,
    approvalMissingTitle: (symbol: string) => `${symbol} ਮਨਜ਼ੂਰੀ ਮੌਜੂਦ ਨਹੀਂ`,
    approvalMissingMessage: (_server: string, allowance: string) =>
      `ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਸੀਮਾ ਇਸ ਖਰੀਦ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦੀ। ਮੌਜੂਦਾ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਸੀਮਾ: ${allowance}।`,
    inProgressTitle: "ਖਰੀਦ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ",
    inProgressMessage: (symbol: string) =>
      `ਇਸ ਖਾਤੇ ਲਈ ਇੱਕ ਖਰੀਦ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ। ਇਸਦੇ ਪੂਰਾ ਹੋਣ ਦੀ ਉਡੀਕ ਕਰੋ, ਫਿਰ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ। ਇਸ ਬੇਨਤੀ ਲਈ ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ।`,
    ledgerErrorTitle: (symbol: string) => `${symbol} ledger ਗੜਬੜ`,
    ledgerErrorMessage: () =>
      "ledger ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਹੋ ਸਕੀ ਜਾਂ ਕਾਰਵਾਈ ਅਸਫਲ ਰਹੀ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    signInTitle: "ਮਿੰਟ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ",
    signInMessage: () => "TTTI-T ਮਿੰਟ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਸਾਈਨ ਇਨ ਕਰੋ।",
    notCompletedTitle: "ਖਰੀਦ ਪੂਰੀ ਨਹੀਂ ਹੋਈ",
    failedTitle: "ਖਰੀਦ ਅਸਫਲ ਰਹੀ",
  },
});

/** components/exchange/DeliveryAddressCard.tsx */
export const BUY_DELIVERY_TEXT = defineDict({
  en: {
    saved: "Delivery address saved.",
    saveFailed: "Saving the address failed. Try again.",
    removed: "Delivery address removed.",
    removeFailed: "Removing the address failed. Try again.",
    title: "Delivery wallet address",
    optional: "Optional",
    recommended: "Recommended",
    descPlug: (symbol: string) =>
      `Auto-filled with your connected Plug principal. Your ${symbol} is credited here.`,
    descIi: (symbol: string) =>
      `Auto-filled with your principal. Your ${symbol} is credited here.`,
    descNone: (symbol: string) =>
      `Not required to mint. Add the Principal ID of a wallet you control so your ${symbol} reaches it automatically at launch.`,
    principalId: "Principal ID",
    placeholder: "e.g. abcde-fghij-…-cai",
    save: "Save address",
    clear: "Clear",
    savedAddress: "Saved address",
    loadFailed:
      "Couldn't load your saved address. You can still enter one above.",
    retry: "Retry",
    noneSaved:
      "None saved — purchases are credited to the principal you buy with.",
  },
  fr: {
    saved: "Adresse de livraison enregistrée.",
    saveFailed: "L'enregistrement de l'adresse a échoué. Réessayez.",
    removed: "Adresse de livraison supprimée.",
    removeFailed: "La suppression de l'adresse a échoué. Réessayez.",
    title: "Adresse du wallet de livraison",
    optional: "Facultatif",
    recommended: "Recommandé",
    descPlug: (symbol: string) =>
      `Prérempli avec le principal de votre wallet Plug connecté. Votre ${symbol} est crédité ici.`,
    descIi: (symbol: string) =>
      `Prérempli avec votre principal. Votre ${symbol} est crédité ici.`,
    descNone: (symbol: string) =>
      `Non requis pour frapper. Ajoutez le Principal ID d'un wallet que vous contrôlez pour que votre ${symbol} y parvienne automatiquement au lancement.`,
    principalId: "Principal ID",
    placeholder: "ex. abcde-fghij-…-cai",
    save: "Enregistrer l'adresse",
    clear: "Effacer",
    savedAddress: "Adresse enregistrée",
    loadFailed:
      "Impossible de charger votre adresse enregistrée. Vous pouvez toujours en saisir une ci-dessus.",
    retry: "Réessayer",
    noneSaved:
      "Aucune adresse enregistrée — les achats sont crédités au principal avec lequel vous achetez.",
  },
  es: {
    saved: "Dirección de entrega guardada.",
    saveFailed: "No se pudo guardar la dirección. Inténtelo de nuevo.",
    removed: "Dirección de entrega eliminada.",
    removeFailed: "No se pudo eliminar la dirección. Inténtelo de nuevo.",
    title: "Dirección del wallet de entrega",
    optional: "Opcional",
    recommended: "Recomendado",
    descPlug: (symbol: string) =>
      `Rellenada automáticamente con el principal de su Plug conectado. Su ${symbol} se acredita aquí.`,
    descIi: (symbol: string) =>
      `Rellenada automáticamente con su principal. Su ${symbol} se acredita aquí.`,
    descNone: (symbol: string) =>
      `No es necesaria para acuñar. Añada el Principal ID de un wallet que controle para que su ${symbol} llegue a él automáticamente en el lanzamiento.`,
    principalId: "Principal ID",
    placeholder: "p. ej. abcde-fghij-…-cai",
    save: "Guardar dirección",
    clear: "Borrar",
    savedAddress: "Dirección guardada",
    loadFailed:
      "No se pudo cargar su dirección guardada. Aun así puede introducir una arriba.",
    retry: "Reintentar",
    noneSaved:
      "Ninguna guardada: las compras se acreditan al principal con el que compra.",
  },
  "zh-Hans": {
    saved: "交付地址已保存。",
    saveFailed: "地址保存失败。请重试。",
    removed: "交付地址已删除。",
    removeFailed: "地址删除失败。请重试。",
    title: "交付钱包地址",
    optional: "可选",
    recommended: "推荐",
    descPlug: (symbol: string) =>
      `已自动填入您所连接 Plug 的 principal。您的 ${symbol} 将存入此处。`,
    descIi: (symbol: string) =>
      `已自动填入您的 principal。您的 ${symbol} 将存入此处。`,
    descNone: (symbol: string) =>
      `铸造时无需填写。添加您所控制钱包的 Principal ID，您的 ${symbol} 将在上线时自动转入该钱包。`,
    principalId: "Principal ID",
    placeholder: "例如 abcde-fghij-…-cai",
    save: "保存地址",
    clear: "清除",
    savedAddress: "已保存的地址",
    loadFailed: "无法加载您已保存的地址。您仍可在上方输入地址。",
    retry: "重试",
    noneSaved: "未保存地址 — 购买将存入您用于购买的 principal。",
  },
  "pt-BR": {
    saved: "Endereço de entrega salvo.",
    saveFailed: "Não foi possível salvar o endereço. Tente novamente.",
    removed: "Endereço de entrega removido.",
    removeFailed: "Não foi possível remover o endereço. Tente novamente.",
    title: "Endereço da carteira de entrega",
    optional: "Opcional",
    recommended: "Recomendado",
    descPlug: (symbol: string) =>
      `Preenchido automaticamente com o principal do seu Plug conectado. Seu ${symbol} é creditado aqui.`,
    descIi: (symbol: string) =>
      `Preenchido automaticamente com o seu principal. Seu ${symbol} é creditado aqui.`,
    descNone: (symbol: string) =>
      `Não é necessário para cunhar. Adicione o Principal ID de uma carteira que você controla para que seu ${symbol} chegue a ela automaticamente no lançamento.`,
    principalId: "Principal ID",
    placeholder: "ex.: abcde-fghij-…-cai",
    save: "Salvar endereço",
    clear: "Limpar",
    savedAddress: "Endereço salvo",
    loadFailed:
      "Não foi possível carregar seu endereço salvo. Você ainda pode inserir um acima.",
    retry: "Tentar novamente",
    noneSaved:
      "Nenhum salvo — as compras são creditadas ao principal com o qual você compra.",
  },
  ko: {
    saved: "전달 주소가 저장되었습니다.",
    saveFailed: "주소를 저장하지 못했습니다. 다시 시도하세요.",
    removed: "전달 주소가 삭제되었습니다.",
    removeFailed: "주소를 삭제하지 못했습니다. 다시 시도하세요.",
    title: "전달 지갑 주소",
    optional: "선택 사항",
    recommended: "권장",
    descPlug: (symbol: string) =>
      `연결된 Plug의 principal로 자동 입력되었습니다. ${symbol}은(는) 여기에 입금됩니다.`,
    descIi: (symbol: string) =>
      `회원님의 principal로 자동 입력되었습니다. ${symbol}은(는) 여기에 입금됩니다.`,
    descNone: (symbol: string) =>
      `발행에 필수는 아닙니다. 직접 관리하는 지갑의 Principal ID를 추가하면 출시 시 ${symbol}이(가) 해당 지갑으로 자동 전달됩니다.`,
    principalId: "Principal ID",
    placeholder: "예: abcde-fghij-…-cai",
    save: "주소 저장",
    clear: "지우기",
    savedAddress: "저장된 주소",
    loadFailed:
      "저장된 주소를 불러올 수 없습니다. 위에 주소를 직접 입력할 수 있습니다.",
    retry: "다시 시도",
    noneSaved:
      "저장된 주소 없음 — 구매한 토큰은 구매에 사용한 principal로 입금됩니다.",
  },
  "pa-Guru": {
    saved: "ਡਿਲੀਵਰੀ ਪਤਾ ਸੰਭਾਲਿਆ ਗਿਆ।",
    saveFailed: "ਪਤਾ ਸੰਭਾਲਣਾ ਅਸਫਲ ਰਿਹਾ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    removed: "ਡਿਲੀਵਰੀ ਪਤਾ ਹਟਾਇਆ ਗਿਆ।",
    removeFailed: "ਪਤਾ ਹਟਾਉਣਾ ਅਸਫਲ ਰਿਹਾ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    title: "ਡਿਲੀਵਰੀ ਵਾਲਿਟ ਪਤਾ",
    optional: "ਵਿਕਲਪਿਕ",
    recommended: "ਸਿਫ਼ਾਰਸ਼ੀ",
    descPlug: (symbol: string) =>
      `ਤੁਹਾਡੇ ਜੁੜੇ ਹੋਏ Plug ਦੇ principal ਨਾਲ ਆਪਣੇ-ਆਪ ਭਰਿਆ ਗਿਆ। ਤੁਹਾਡਾ ${symbol} ਇੱਥੇ ਜਮ੍ਹਾਂ ਹੁੰਦਾ ਹੈ।`,
    descIi: (symbol: string) =>
      `ਤੁਹਾਡੇ principal ਨਾਲ ਆਪਣੇ-ਆਪ ਭਰਿਆ ਗਿਆ। ਤੁਹਾਡਾ ${symbol} ਇੱਥੇ ਜਮ੍ਹਾਂ ਹੁੰਦਾ ਹੈ।`,
    descNone: (symbol: string) =>
      `ਮਿੰਟ ਕਰਨ ਲਈ ਲੋੜੀਂਦਾ ਨਹੀਂ। ਆਪਣੇ ਕੰਟਰੋਲ ਵਾਲੇ ਵਾਲਿਟ ਦਾ Principal ID ਸ਼ਾਮਲ ਕਰੋ ਤਾਂ ਜੋ ਲਾਂਚ ਵੇਲੇ ਤੁਹਾਡਾ ${symbol} ਆਪਣੇ-ਆਪ ਉਸ ਤੱਕ ਪਹੁੰਚ ਜਾਵੇ।`,
    principalId: "Principal ID",
    placeholder: "ਜਿਵੇਂ abcde-fghij-…-cai",
    save: "ਪਤਾ ਸੰਭਾਲੋ",
    clear: "ਸਾਫ਼ ਕਰੋ",
    savedAddress: "ਸੰਭਾਲਿਆ ਪਤਾ",
    loadFailed:
      "ਤੁਹਾਡਾ ਸੰਭਾਲਿਆ ਪਤਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਤੁਸੀਂ ਫਿਰ ਵੀ ਉੱਪਰ ਇੱਕ ਪਤਾ ਦਰਜ ਕਰ ਸਕਦੇ ਹੋ।",
    retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    noneSaved:
      "ਕੋਈ ਪਤਾ ਸੰਭਾਲਿਆ ਨਹੀਂ — ਖਰੀਦਾਂ ਉਸ principal ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀਆਂ ਹਨ ਜਿਸ ਨਾਲ ਤੁਸੀਂ ਖਰੀਦਦੇ ਹੋ।",
  },
});

/**
 * GetIcpFirstPanel, MigrationNotice, OrderModeToggle, PayTokenSelector,
 * PresaleProgress, TokenRateCard and WalletPercentBar.
 */
export const BUY_PANELS_TEXT = defineDict({
  en: {
    // GetIcpFirstPanel
    getIcpAria: "Add ICP",
    getIcpAdd: "Add",
    getIcpAddToBuy: "Add ICP to mint",
    getIcpBuyAria:
      "Buy ICP on Onramper (copies your address, opens in a new tab)",
    getIcpBuy: "Buy ICP",
    getIcpCopyAria: "Copy wallet address",
    getIcpCopied: "Address copied",
    getIcpCopyFailed: "Copy failed — click the address",
    getIcpBalance: (amount: string) => `Balance: ${amount} ICP`,
    // MigrationNotice
    migrationTitle: (symbol: string) =>
      `Your ${symbol} will need to be migrated at launch`,
    migrationBody:
      "Add a wallet address to receive them automatically. You can still buy now without one.",
    migrationStep1Title: "Create a wallet",
    migrationStep1Body: "Open Plug, NNS or OISY and create a wallet.",
    migrationStep2Title: "Copy the correct Principal ID",
    migrationStep2Body:
      "Copy the Principal ID — not the 64-character account ID.",
    migrationStep3Title: "Paste it here",
    migrationStep3Body:
      "Paste it into the delivery address field below and save.",
    opensNewTab: "(opens in a new tab)",
    migrationAdd: "Add address",
    migrationLater: "Later",
    // OrderModeToggle
    orderLegend: "Order amount",
    orderAmountIn: (symbol: string) => `Amount in ${symbol}`,
    orderAmountTtti: "Amount in TTTI-T",
    // PayTokenSelector
    payWith: "Pay with",
    feeShort: (fee: string) => `Fee ${fee}`,
    unavailable: "Unavailable",
    // PresaleProgress
    maxSupply: "Maximum supply",
    totalSupply: "Total supply",
    remaining: "Remaining",
    complete: "Complete",
    paused: "Paused",
    live: "Live",
    maxReached: "Maximum supply reached",
    maxReachedBody: (max: string, symbol: string) =>
      `Total supply has reached the maximum supply of ${max} ${symbol}. Purchases are closed.`,
    salesPaused: "Sales are paused",
    pausedBody: "Purchases are temporarily disabled. Please check back soon.",
    totalSupplyPercent: (percent: string) => `Total supply ${percent}%`,
    progressAria: (percent: string) =>
      `Total supply: ${percent}% of the maximum supply`,
    reserved: (amount: string, symbol: string) =>
      `${amount} ${symbol} is reserved by purchases in progress.`,
    // TokenRateCard
    never: "Never",
    noRate: (symbol: string) => `No valid ${symbol}/USD rate for this hour`,
    unavailableUntilRate: (symbol: string) =>
      `Purchases in ${symbol} are unavailable until a rate is set.`,
    oneBuys: (symbol: string) => `1 ${symbol} buys`,
    source: "Source",
    fetched: "Fetched",
    feeFixed: "Fee (fixed)",
    inToken: (value: string, symbol: string) => `${value} in ${symbol}`,
    minimum: "Minimum",
    feeRule: "Fee rule",
    treasury: "Treasury",
    notConfigured: "Not configured",
    treasuryCopied: (symbol: string) => `Treasury ${symbol} account copied`,
    treasuryCopy: (symbol: string) => `Copy treasury ${symbol} account`,
    // WalletPercentBar
    percentConnect: "Connect a wallet to use the bar.",
    percentBalanceUnavailable: "Balance unavailable.",
    percentNotCover: (fees: string) =>
      `Balance does not cover the ${fees} network fees.`,
    percentShare: (symbol: string) => `Share of wallet ${symbol}`,
    percentSummary: (percent: string, amount: string, ttti: string) =>
      `${percent}% = ${amount} · you receive ${ttti} TTTI-T`,
    percentComputedOn: (fees: string) =>
      `Computed on balance minus ${fees} network fees.`,
  },
  fr: {
    getIcpAria: "Ajouter de l'ICP",
    getIcpAdd: "Ajoutez",
    getIcpAddToBuy: "Ajoutez de l'ICP pour frapper",
    getIcpBuyAria:
      "Acheter de l'ICP sur Onramper (copie votre adresse, s'ouvre dans un nouvel onglet)",
    getIcpBuy: "Acheter de l'ICP",
    getIcpCopyAria: "Copier l'adresse du wallet",
    getIcpCopied: "Adresse copiée",
    getIcpCopyFailed: "Échec de la copie — cliquez sur l'adresse",
    getIcpBalance: (amount: string) => `Solde : ${amount} ICP`,
    migrationTitle: (symbol: string) =>
      `Votre ${symbol} devra être migré au lancement`,
    migrationBody:
      "Ajoutez une adresse de wallet pour les recevoir automatiquement. Vous pouvez acheter dès maintenant sans adresse.",
    migrationStep1Title: "Créer un wallet",
    migrationStep1Body: "Ouvrez Plug, NNS ou OISY et créez un wallet.",
    migrationStep2Title: "Copier le bon Principal ID",
    migrationStep2Body:
      "Copiez le Principal ID — pas l'account ID de 64 caractères.",
    migrationStep3Title: "Le coller ici",
    migrationStep3Body:
      "Collez-le dans le champ d'adresse de livraison ci-dessous et enregistrez.",
    opensNewTab: "(s'ouvre dans un nouvel onglet)",
    migrationAdd: "Ajouter l'adresse",
    migrationLater: "Plus tard",
    orderLegend: "Montant de l'ordre",
    orderAmountIn: (symbol: string) => `Montant en ${symbol}`,
    orderAmountTtti: "Montant en TTTI-T",
    payWith: "Payer avec",
    feeShort: (fee: string) => `Frais ${fee}`,
    unavailable: "Indisponible",
    maxSupply: "Offre maximale",
    totalSupply: "Offre totale",
    remaining: "Restant",
    complete: "Terminée",
    paused: "Suspendue",
    live: "En cours",
    maxReached: "Offre maximale atteinte",
    maxReachedBody: (max: string, symbol: string) =>
      `L'offre totale a atteint l'offre maximale de ${max} ${symbol}. Les achats sont fermés.`,
    salesPaused: "Les ventes sont suspendues",
    pausedBody:
      "Les achats sont temporairement désactivés. Revenez un peu plus tard.",
    totalSupplyPercent: (percent: string) => `Offre totale ${percent}%`,
    progressAria: (percent: string) =>
      `Offre totale : ${percent}% de l'offre maximale`,
    reserved: (amount: string, symbol: string) =>
      `${amount} ${symbol} sont réservés par des achats en cours.`,
    never: "Jamais",
    noRate: (symbol: string) =>
      `Aucun taux ${symbol}/USD valide pour cette heure`,
    unavailableUntilRate: (symbol: string) =>
      `Les achats en ${symbol} sont indisponibles tant qu'aucun taux n'est fixé.`,
    oneBuys: (symbol: string) => `1 ${symbol} achète`,
    source: "Source",
    fetched: "Récupéré",
    feeFixed: "Frais (fixes)",
    inToken: (value: string, symbol: string) => `${value} en ${symbol}`,
    minimum: "Minimum",
    feeRule: "Règle des frais",
    treasury: "Trésorerie",
    notConfigured: "Non configuré",
    treasuryCopied: (symbol: string) =>
      `Compte ${symbol} de la trésorerie copié`,
    treasuryCopy: (symbol: string) =>
      `Copier le compte ${symbol} de la trésorerie`,
    percentConnect: "Connectez un wallet pour utiliser la barre.",
    percentBalanceUnavailable: "Solde indisponible.",
    percentNotCover: (fees: string) =>
      `Le solde ne couvre pas les frais de réseau de ${fees}.`,
    percentShare: (symbol: string) => `Part du solde ${symbol} du wallet`,
    percentSummary: (percent: string, amount: string, ttti: string) =>
      `${percent}% = ${amount} · vous recevez ${ttti} TTTI-T`,
    percentComputedOn: (fees: string) =>
      `Calculé sur le solde moins ${fees} de frais de réseau.`,
  },
  es: {
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
    feeShort: (fee: string) => `Comisión ${fee}`,
    unavailable: "No disponible",
    maxSupply: "Suministro máximo",
    totalSupply: "Suministro total",
    remaining: "Restante",
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
    feeFixed: "Comisión (fija)",
    inToken: (value: string, symbol: string) => `${value} en ${symbol}`,
    minimum: "Mínimo",
    feeRule: "Regla de la comisión",
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
  },
  "zh-Hans": {
    getIcpAria: "添加 ICP",
    getIcpAdd: "请添加",
    getIcpAddToBuy: "添加 ICP 以铸造",
    getIcpBuyAria: "在 Onramper 购买 ICP（复制您的地址，在新标签页中打开）",
    getIcpBuy: "购买 ICP",
    getIcpCopyAria: "复制钱包地址",
    getIcpCopied: "地址已复制",
    getIcpCopyFailed: "复制失败 — 请点击地址",
    getIcpBalance: (amount: string) => `余额：${amount} ICP`,
    migrationTitle: (symbol: string) => `您的 ${symbol} 需要在上线时迁移`,
    migrationBody: "添加钱包地址即可自动接收。您现在也可以不填地址直接购买。",
    migrationStep1Title: "创建钱包",
    migrationStep1Body: "打开 Plug、NNS 或 OISY 并创建钱包。",
    migrationStep2Title: "复制正确的 Principal ID",
    migrationStep2Body: "复制 Principal ID，而不是 64 个字符的 account ID。",
    migrationStep3Title: "粘贴到此处",
    migrationStep3Body: "将其粘贴到下方的交付地址栏中并保存。",
    opensNewTab: "（在新标签页中打开）",
    migrationAdd: "添加地址",
    migrationLater: "稍后",
    orderLegend: "订单金额",
    orderAmountIn: (symbol: string) => `以 ${symbol} 计的金额`,
    orderAmountTtti: "以 TTTI-T 计的数量",
    payWith: "支付方式",
    feeShort: (fee: string) => `手续费 ${fee}`,
    unavailable: "不可用",
    maxSupply: "最大供应量",
    totalSupply: "总供应量",
    remaining: "剩余",
    complete: "已结束",
    paused: "已暂停",
    live: "进行中",
    maxReached: "已达到最大供应量",
    maxReachedBody: (max: string, symbol: string) =>
      `总供应量已达到 ${max} ${symbol} 的最大供应量。购买已关闭。`,
    salesPaused: "销售已暂停",
    pausedBody: "购买功能暂时停用。请稍后再来查看。",
    totalSupplyPercent: (percent: string) => `总供应量 ${percent}%`,
    progressAria: (percent: string) => `总供应量：最大供应量的 ${percent}%`,
    reserved: (amount: string, symbol: string) =>
      `${amount} ${symbol} 已被进行中的购买预留。`,
    never: "从未",
    noRate: (symbol: string) => `本小时没有有效的 ${symbol}/USD 汇率`,
    unavailableUntilRate: (symbol: string) =>
      `在设定汇率之前，无法使用 ${symbol} 购买。`,
    oneBuys: (symbol: string) => `1 ${symbol} 可购买`,
    source: "来源",
    fetched: "获取时间",
    feeFixed: "手续费（固定）",
    inToken: (value: string, symbol: string) => `以 ${symbol} 计 ${value}`,
    minimum: "最低",
    feeRule: "手续费规则",
    treasury: "金库",
    notConfigured: "未配置",
    treasuryCopied: (symbol: string) => `已复制金库 ${symbol} 账户`,
    treasuryCopy: (symbol: string) => `复制金库 ${symbol} 账户`,
    percentConnect: "连接钱包以使用此滑块。",
    percentBalanceUnavailable: "余额不可用。",
    percentNotCover: (fees: string) => `余额不足以支付 ${fees} 的网络手续费。`,
    percentShare: (symbol: string) => `钱包 ${symbol} 余额占比`,
    percentSummary: (percent: string, amount: string, ttti: string) =>
      `${percent}% = ${amount} · 您将收到 ${ttti} TTTI-T`,
    percentComputedOn: (fees: string) => `按余额减去 ${fees} 网络手续费计算。`,
  },
  "pt-BR": {
    getIcpAria: "Adicionar ICP",
    getIcpAdd: "Adicione",
    getIcpAddToBuy: "Adicione ICP para cunhar",
    getIcpBuyAria:
      "Comprar ICP na Onramper (copia seu endereço, abre em uma nova aba)",
    getIcpBuy: "Comprar ICP",
    getIcpCopyAria: "Copiar o endereço da carteira",
    getIcpCopied: "Endereço copiado",
    getIcpCopyFailed: "Falha ao copiar — clique no endereço",
    getIcpBalance: (amount: string) => `Saldo: ${amount} ICP`,
    migrationTitle: (symbol: string) =>
      `Seu ${symbol} precisará ser migrado no lançamento`,
    migrationBody:
      "Adicione um endereço de carteira para recebê-los automaticamente. Você ainda pode comprar agora sem ele.",
    migrationStep1Title: "Criar uma carteira",
    migrationStep1Body: "Abra o Plug, o NNS ou o OISY e crie uma carteira.",
    migrationStep2Title: "Copiar o Principal ID correto",
    migrationStep2Body:
      "Copie o Principal ID — não o account ID de 64 caracteres.",
    migrationStep3Title: "Colar aqui",
    migrationStep3Body:
      "Cole-o no campo de endereço de entrega abaixo e salve.",
    opensNewTab: "(abre em uma nova aba)",
    migrationAdd: "Adicionar endereço",
    migrationLater: "Mais tarde",
    orderLegend: "Valor da ordem",
    orderAmountIn: (symbol: string) => `Valor em ${symbol}`,
    orderAmountTtti: "Quantidade em TTTI-T",
    payWith: "Pagar com",
    feeShort: (fee: string) => `Taxa ${fee}`,
    unavailable: "Indisponível",
    maxSupply: "Oferta máxima",
    totalSupply: "Oferta total",
    remaining: "Restante",
    complete: "Encerrada",
    paused: "Pausada",
    live: "Em andamento",
    maxReached: "Oferta máxima atingida",
    maxReachedBody: (max: string, symbol: string) =>
      `A oferta total atingiu a oferta máxima de ${max} ${symbol}. As compras estão encerradas.`,
    salesPaused: "As vendas estão pausadas",
    pausedBody:
      "As compras estão temporariamente desativadas. Volte a consultar em breve.",
    totalSupplyPercent: (percent: string) => `Oferta total ${percent}%`,
    progressAria: (percent: string) =>
      `Oferta total: ${percent}% da oferta máxima`,
    reserved: (amount: string, symbol: string) =>
      `${amount} ${symbol} estão reservados por compras em andamento.`,
    never: "Nunca",
    noRate: (symbol: string) =>
      `Nenhuma cotação ${symbol}/USD válida para esta hora`,
    unavailableUntilRate: (symbol: string) =>
      `As compras em ${symbol} ficam indisponíveis até que uma cotação seja definida.`,
    oneBuys: (symbol: string) => `1 ${symbol} compra`,
    source: "Fonte",
    fetched: "Obtido em",
    feeFixed: "Taxa (fixa)",
    inToken: (value: string, symbol: string) => `${value} em ${symbol}`,
    minimum: "Mínimo",
    feeRule: "Regra da taxa",
    treasury: "Tesouraria",
    notConfigured: "Não configurada",
    treasuryCopied: (symbol: string) => `Conta ${symbol} da tesouraria copiada`,
    treasuryCopy: (symbol: string) => `Copiar a conta ${symbol} da tesouraria`,
    percentConnect: "Conecte uma carteira para usar a barra.",
    percentBalanceUnavailable: "Saldo indisponível.",
    percentNotCover: (fees: string) =>
      `O saldo não cobre as taxas de rede de ${fees}.`,
    percentShare: (symbol: string) => `Parte do saldo de ${symbol} da carteira`,
    percentSummary: (percent: string, amount: string, ttti: string) =>
      `${percent}% = ${amount} · você recebe ${ttti} TTTI-T`,
    percentComputedOn: (fees: string) =>
      `Calculado sobre o saldo menos ${fees} de taxas de rede.`,
  },
  ko: {
    getIcpAria: "ICP 추가",
    getIcpAdd: "추가하세요",
    getIcpAddToBuy: "발행하려면 ICP를 추가하세요",
    getIcpBuyAria: "Onramper에서 ICP 구매 (주소를 복사하고 새 탭에서 열림)",
    getIcpBuy: "ICP 구매",
    getIcpCopyAria: "지갑 주소 복사",
    getIcpCopied: "주소가 복사되었습니다",
    getIcpCopyFailed: "복사 실패 — 주소를 클릭하세요",
    getIcpBalance: (amount: string) => `잔액: ${amount} ICP`,
    migrationTitle: (symbol: string) =>
      `출시 시 ${symbol}을(를) 마이그레이션해야 합니다`,
    migrationBody:
      "지갑 주소를 추가하면 자동으로 받을 수 있습니다. 주소 없이도 지금 구매할 수 있습니다.",
    migrationStep1Title: "지갑 만들기",
    migrationStep1Body: "Plug, NNS 또는 OISY를 열고 지갑을 만드세요.",
    migrationStep2Title: "올바른 Principal ID 복사",
    migrationStep2Body: "64자 account ID가 아닌 Principal ID를 복사하세요.",
    migrationStep3Title: "여기에 붙여넣기",
    migrationStep3Body: "아래 전달 주소 입력란에 붙여넣고 저장하세요.",
    opensNewTab: "(새 탭에서 열림)",
    migrationAdd: "주소 추가",
    migrationLater: "나중에",
    orderLegend: "주문 금액",
    orderAmountIn: (symbol: string) => `${symbol} 금액`,
    orderAmountTtti: "TTTI-T 수량",
    payWith: "결제 수단",
    feeShort: (fee: string) => `수수료 ${fee}`,
    unavailable: "사용 불가",
    maxSupply: "최대 공급량",
    totalSupply: "총 공급량",
    remaining: "남은 수량",
    complete: "종료",
    paused: "일시 중지",
    live: "진행 중",
    maxReached: "최대 공급량 도달",
    maxReachedBody: (max: string, symbol: string) =>
      `총 공급량이 최대 공급량인 ${max} ${symbol}에 도달했습니다. 구매가 마감되었습니다.`,
    salesPaused: "판매가 일시 중지되었습니다",
    pausedBody:
      "구매가 일시적으로 비활성화되었습니다. 잠시 후 다시 확인해 주세요.",
    totalSupplyPercent: (percent: string) => `총 공급량 ${percent}%`,
    progressAria: (percent: string) => `총 공급량: 최대 공급량의 ${percent}%`,
    reserved: (amount: string, symbol: string) =>
      `${amount} ${symbol}이(가) 진행 중인 구매로 예약되어 있습니다.`,
    never: "없음",
    noRate: (symbol: string) =>
      `이번 시간에 유효한 ${symbol}/USD 환율이 없습니다`,
    unavailableUntilRate: (symbol: string) =>
      `환율이 설정될 때까지 ${symbol}(으)로 구매할 수 없습니다.`,
    oneBuys: (symbol: string) => `1 ${symbol}(으)로 구매 가능`,
    source: "출처",
    fetched: "조회 시각",
    feeFixed: "수수료 (고정)",
    inToken: (value: string, symbol: string) => `${symbol} 기준 ${value}`,
    minimum: "최소",
    feeRule: "수수료 규칙",
    treasury: "재무 계정",
    notConfigured: "구성되지 않음",
    treasuryCopied: (symbol: string) => `재무 ${symbol} 계정이 복사되었습니다`,
    treasuryCopy: (symbol: string) => `재무 ${symbol} 계정 복사`,
    percentConnect: "바를 사용하려면 지갑을 연결하세요.",
    percentBalanceUnavailable: "잔액을 확인할 수 없습니다.",
    percentNotCover: (fees: string) =>
      `잔액이 ${fees}의 네트워크 수수료에 미치지 못합니다.`,
    percentShare: (symbol: string) => `지갑 ${symbol} 잔액 비율`,
    percentSummary: (percent: string, amount: string, ttti: string) =>
      `${percent}% = ${amount} · ${ttti} TTTI-T 수령`,
    percentComputedOn: (fees: string) =>
      `잔액에서 네트워크 수수료 ${fees}을(를) 뺀 금액 기준으로 계산됩니다.`,
  },
  "pa-Guru": {
    getIcpAria: "ICP ਸ਼ਾਮਲ ਕਰੋ",
    getIcpAdd: "ਸ਼ਾਮਲ ਕਰੋ",
    getIcpAddToBuy: "ਮਿੰਟ ਕਰਨ ਲਈ ICP ਸ਼ਾਮਲ ਕਰੋ",
    getIcpBuyAria:
      "Onramper 'ਤੇ ICP ਖਰੀਦੋ (ਤੁਹਾਡਾ ਪਤਾ ਕਾਪੀ ਕਰਦਾ ਹੈ, ਨਵੀਂ ਟੈਬ ਵਿੱਚ ਖੁੱਲ੍ਹਦਾ ਹੈ)",
    getIcpBuy: "ICP ਖਰੀਦੋ",
    getIcpCopyAria: "ਵਾਲਿਟ ਪਤਾ ਕਾਪੀ ਕਰੋ",
    getIcpCopied: "ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ",
    getIcpCopyFailed: "ਕਾਪੀ ਅਸਫਲ — ਪਤੇ 'ਤੇ ਕਲਿੱਕ ਕਰੋ",
    getIcpBalance: (amount: string) => `ਬਕਾਇਆ: ${amount} ICP`,
    migrationTitle: (symbol: string) =>
      `ਲਾਂਚ ਵੇਲੇ ਤੁਹਾਡੇ ${symbol} ਨੂੰ ਮਾਈਗ੍ਰੇਟ ਕਰਨ ਦੀ ਲੋੜ ਪਵੇਗੀ`,
    migrationBody:
      "ਇਹਨਾਂ ਨੂੰ ਆਪਣੇ-ਆਪ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਇੱਕ ਵਾਲਿਟ ਪਤਾ ਸ਼ਾਮਲ ਕਰੋ। ਤੁਸੀਂ ਪਤੇ ਤੋਂ ਬਿਨਾਂ ਵੀ ਹੁਣੇ ਖਰੀਦ ਸਕਦੇ ਹੋ।",
    migrationStep1Title: "ਇੱਕ ਵਾਲਿਟ ਬਣਾਓ",
    migrationStep1Body: "Plug, NNS ਜਾਂ OISY ਖੋਲ੍ਹੋ ਅਤੇ ਇੱਕ ਵਾਲਿਟ ਬਣਾਓ।",
    migrationStep2Title: "ਸਹੀ Principal ID ਕਾਪੀ ਕਰੋ",
    migrationStep2Body: "Principal ID ਕਾਪੀ ਕਰੋ — 64 ਅੱਖਰਾਂ ਵਾਲਾ account ID ਨਹੀਂ।",
    migrationStep3Title: "ਇਸਨੂੰ ਇੱਥੇ ਪੇਸਟ ਕਰੋ",
    migrationStep3Body: "ਇਸਨੂੰ ਹੇਠਾਂ ਦਿੱਤੇ ਡਿਲੀਵਰੀ ਪਤੇ ਵਾਲੇ ਖੇਤਰ ਵਿੱਚ ਪੇਸਟ ਕਰੋ ਅਤੇ ਸੰਭਾਲੋ।",
    opensNewTab: "(ਨਵੀਂ ਟੈਬ ਵਿੱਚ ਖੁੱਲ੍ਹਦਾ ਹੈ)",
    migrationAdd: "ਪਤਾ ਸ਼ਾਮਲ ਕਰੋ",
    migrationLater: "ਬਾਅਦ ਵਿੱਚ",
    orderLegend: "ਆਰਡਰ ਰਕਮ",
    orderAmountIn: (symbol: string) => `${symbol} ਵਿੱਚ ਰਕਮ`,
    orderAmountTtti: "TTTI-T ਵਿੱਚ ਮਾਤਰਾ",
    payWith: "ਇਸ ਨਾਲ ਭੁਗਤਾਨ ਕਰੋ",
    feeShort: (fee: string) => `ਫੀਸ ${fee}`,
    unavailable: "ਉਪਲਬਧ ਨਹੀਂ",
    maxSupply: "ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ",
    totalSupply: "ਕੁੱਲ ਸਪਲਾਈ",
    remaining: "ਬਾਕੀ",
    complete: "ਪੂਰੀ",
    paused: "ਰੋਕੀ ਗਈ",
    live: "ਜਾਰੀ",
    maxReached: "ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਪੂਰੀ ਹੋਈ",
    maxReachedBody: (max: string, symbol: string) =>
      `ਕੁੱਲ ਸਪਲਾਈ ${max} ${symbol} ਦੀ ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਤੱਕ ਪਹੁੰਚ ਗਈ ਹੈ। ਖਰੀਦਾਂ ਬੰਦ ਹਨ।`,
    salesPaused: "ਵਿਕਰੀ ਰੋਕੀ ਗਈ ਹੈ",
    pausedBody: "ਖਰੀਦਾਂ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਬੰਦ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਜਲਦੀ ਮੁੜ ਦੇਖੋ।",
    totalSupplyPercent: (percent: string) => `ਕੁੱਲ ਸਪਲਾਈ ${percent}%`,
    progressAria: (percent: string) => `ਕੁੱਲ ਸਪਲਾਈ: ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਦਾ ${percent}%`,
    reserved: (amount: string, symbol: string) =>
      `${amount} ${symbol} ਜਾਰੀ ਖਰੀਦਾਂ ਵੱਲੋਂ ਰਾਖਵੇਂ ਹਨ।`,
    never: "ਕਦੇ ਨਹੀਂ",
    noRate: (symbol: string) => `ਇਸ ਘੰਟੇ ਲਈ ਕੋਈ ਵੈਧ ${symbol}/USD ਦਰ ਨਹੀਂ`,
    unavailableUntilRate: (symbol: string) =>
      `ਦਰ ਨਿਰਧਾਰਤ ਹੋਣ ਤੱਕ ${symbol} ਵਿੱਚ ਖਰੀਦਾਂ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।`,
    oneBuys: (symbol: string) => `1 ${symbol} ਨਾਲ ਮਿਲਦਾ ਹੈ`,
    source: "ਸਰੋਤ",
    fetched: "ਪ੍ਰਾਪਤ ਕੀਤਾ",
    feeFixed: "ਫੀਸ (ਨਿਸ਼ਚਿਤ)",
    inToken: (value: string, symbol: string) => `${symbol} ਵਿੱਚ ${value}`,
    minimum: "ਘੱਟੋ-ਘੱਟ",
    feeRule: "ਫੀਸ ਨਿਯਮ",
    treasury: "ਖ਼ਜ਼ਾਨਾ",
    notConfigured: "ਸੰਰਚਿਤ ਨਹੀਂ",
    treasuryCopied: (symbol: string) => `ਖ਼ਜ਼ਾਨਾ ${symbol} ਖਾਤਾ ਕਾਪੀ ਹੋ ਗਿਆ`,
    treasuryCopy: (symbol: string) => `ਖ਼ਜ਼ਾਨਾ ${symbol} ਖਾਤਾ ਕਾਪੀ ਕਰੋ`,
    percentConnect: "ਬਾਰ ਵਰਤਣ ਲਈ ਇੱਕ ਵਾਲਿਟ ਜੋੜੋ।",
    percentBalanceUnavailable: "ਬਕਾਇਆ ਉਪਲਬਧ ਨਹੀਂ।",
    percentNotCover: (fees: string) =>
      `ਬਕਾਇਆ ${fees} ਨੈੱਟਵਰਕ ਫੀਸਾਂ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ।`,
    percentShare: (symbol: string) => `ਵਾਲਿਟ ${symbol} ਦਾ ਹਿੱਸਾ`,
    percentSummary: (percent: string, amount: string, ttti: string) =>
      `${percent}% = ${amount} · ਤੁਹਾਨੂੰ ${ttti} TTTI-T ਮਿਲਦਾ ਹੈ`,
    percentComputedOn: (fees: string) =>
      `ਬਕਾਏ ਵਿੱਚੋਂ ${fees} ਨੈੱਟਵਰਕ ਫੀਸਾਂ ਘਟਾ ਕੇ ਗਿਣਿਆ ਗਿਆ।`,
  },
});

/** components/exchange/BtcPurchasePanel.tsx and components/btc/*. */
export const BUY_BTC_TEXT = defineDict({
  en: {
    // BtcPurchasePanel
    requestFailed: "The request could not be completed. Try again.",
    errorTitle: "Bitcoin purchase",
    intro: (fee: string) =>
      `Send BTC to your own Bitcoin address. It becomes ckBTC, then TTTI-T at the hourly rate, fee ${fee}.`,
    recordingAcks: "Recording acknowledgements…",
    creatingAddress: "Creating address…",
    getAddress: "Get my Bitcoin address",
    tickAll: "Tick all six statements to get your address.",
    purchaseAddressLabel: "Your Bitcoin purchase address",
    sentToDelivery: "TTTI-T is sent to your delivery address below.",
    keepPageOpen:
      "Keep this page open until your deposit is detected. If you leave, your purchase will be completed when you come back to this page, at the exchange rate of that moment. If the sale has ended by then, you will be refunded in ckBTC.",
    delivered: (amount: string) => `${amount} TTTI-T delivered`,
    deliveredDetail: (fee: string) =>
      `At the hourly ckBTC rate, ${fee} fee included`,
    refunded: (amount: string) => `${amount} refunded`,
    refundedDetail: "The ckBTC was returned to your account.",
    // BtcDepositAddressCard
    addressDefaultLabel: "Bitcoin deposit address",
    addressCopiedToast: "Bitcoin address copied",
    addressCopyFailedToast: "Unable to copy the address",
    qrTitle: (address: string) => `QR code of the Bitcoin address ${address}`,
    copyAddressAria: (address: string) => `Copy Bitcoin address ${address}`,
    copied: "Copied",
    clickToCopy: "Click the address to copy it.",
    // BtcDepositProgress
    errValueTooSmall: (minimum: string) =>
      `Deposit too small: below the ${minimum} minimum. It was not converted.`,
    errTainted: "Deposit refused by the ckBTC minter.",
    errMinterUnavailable: "The ckBTC minter is unavailable. Check again later.",
    errOther: (server: string | undefined) =>
      server
        ? `The deposit could not be processed. ${server}`
        : "The deposit could not be processed.",
    notYet: "Not yet",
    finalWallet: "ckBTC in your wallet",
    finalRefunded: "Refunded in ckBTC",
    finalDelivered: "TTTI-T delivered",
    stepAddress: "Address shown",
    stepDetected: "Deposit detected",
    stepConfirmations: (count: string) => `Confirmations ${count}`,
    stepMinted: "ckBTC created",
    amountBtcDetected: "BTC detected",
    amountCkbtcCreated: "ckBTC created",
    amountCkbtcPending: "ckBTC pending",
    amountRefunded: "Refunded",
    amountTttiDelivered: "TTTI-T delivered",
    progressAria: "Bitcoin deposit progress",
    pendingRate:
      "Rate unavailable. The ckBTC is held until the next hourly rate.",
    lastChecked: (time: string) => `Last checked: ${time}`,
    checking: "Checking…",
    check: "Check",
    // Per-deposit tracking
    flowWallet: "BTC → ckBTC (wallet)",
    flowPurchase: "BTC → TTTI-T (purchase)",
    noDepositYet: "No deposit received on this address yet.",
    earlierDeposits: "Earlier deposits on this address",
    depositNumber: (n: string) => `Deposit ${n}`,
    detectedOn: (time: string) => `Detected ${time}`,
    stagePendingRate: "Waiting for the hourly rate",
    pendingDepositStatus: "Bitcoin deposit in progress.",
    pendingDepositLink: "View Bitcoin deposit",
    // Waiting state, completion summary and per-deposit errors
    errUnrecoverable: (server: string | undefined) =>
      server
        ? `This deposit cannot be processed. ${server}`
        : "This deposit cannot be processed.",
    refundFailed: (amount: string) =>
      `The refund of the excess failed. ${amount} still held; the refund is retried automatically.`,
    waitingNewTransfer: "Waiting for a new transfer to this address.",
    depositFinished: (n: string, status: string) => `Deposit ${n}: ${status}.`,
    waitForNew: "Wait for a new transfer",
    otherDeposits: "Other deposits on this address",
    reuseWallet:
      "Send BTC to this address from any Bitcoin wallet. Each new transfer is converted to ckBTC automatically. The same address can be reused.",
    reusePurchase:
      "Send BTC to this address from any Bitcoin wallet. Each new transfer is converted and delivered as TTTI-T automatically. The same address can be reused.",
    waitingDepositStatus: "Bitcoin address waiting for a new transfer.",
    waitingDepositLink: "View Bitcoin address",
  },
  fr: {
    requestFailed: "La requête n'a pas pu aboutir. Réessayez.",
    errorTitle: "Achat en Bitcoin",
    intro: (fee: string) =>
      `Envoyez des BTC à votre propre adresse Bitcoin. Ils deviennent du ckBTC, puis du TTTI-T au taux horaire, frais ${fee}.`,
    recordingAcks: "Enregistrement des confirmations d'achat…",
    creatingAddress: "Création de l'adresse…",
    getAddress: "Obtenir mon adresse Bitcoin",
    tickAll: "Cochez les six déclarations pour obtenir votre adresse.",
    purchaseAddressLabel: "Votre adresse Bitcoin d'achat",
    sentToDelivery:
      "Le TTTI-T est envoyé à votre adresse de livraison ci-dessous.",
    keepPageOpen:
      "Gardez cette page ouverte jusqu'à ce que votre dépôt soit détecté. Si vous la quittez, votre achat sera finalisé à votre retour sur cette page, au taux de change de ce moment-là. Si la vente est terminée d'ici là, vous serez remboursé en ckBTC.",
    delivered: (amount: string) => `${amount} TTTI-T livrés`,
    deliveredDetail: (fee: string) =>
      `Au taux horaire ckBTC, frais de ${fee} inclus`,
    refunded: (amount: string) => `${amount} remboursés`,
    refundedDetail: "Le ckBTC a été renvoyé sur votre compte.",
    addressDefaultLabel: "Adresse de dépôt Bitcoin",
    addressCopiedToast: "Adresse Bitcoin copiée",
    addressCopyFailedToast: "Impossible de copier l'adresse",
    qrTitle: (address: string) => `QR code de l'adresse Bitcoin ${address}`,
    copyAddressAria: (address: string) => `Copier l'adresse Bitcoin ${address}`,
    copied: "Copiée",
    clickToCopy: "Cliquez sur l'adresse pour la copier.",
    errValueTooSmall: (minimum: string) =>
      `Dépôt trop faible : inférieur au minimum de ${minimum}. Il n'a pas été converti.`,
    errTainted: "Dépôt refusé par le minter ckBTC.",
    errMinterUnavailable:
      "Le minter ckBTC est indisponible. Vérifiez à nouveau plus tard.",
    errOther: (server: string | undefined) =>
      server
        ? `Le dépôt n'a pas pu être traité. ${server}`
        : "Le dépôt n'a pas pu être traité.",
    notYet: "Pas encore",
    finalWallet: "ckBTC dans votre wallet",
    finalRefunded: "Remboursé en ckBTC",
    finalDelivered: "TTTI-T livré",
    stepAddress: "Adresse affichée",
    stepDetected: "Dépôt détecté",
    stepConfirmations: (count: string) => `Confirmations ${count}`,
    stepMinted: "ckBTC créé",
    amountBtcDetected: "BTC détecté",
    amountCkbtcCreated: "ckBTC créé",
    amountCkbtcPending: "ckBTC en attente",
    amountRefunded: "Remboursé",
    amountTttiDelivered: "TTTI-T livré",
    progressAria: "Progression du dépôt Bitcoin",
    pendingRate:
      "Taux indisponible. Le ckBTC est conservé jusqu'au prochain taux horaire.",
    lastChecked: (time: string) => `Dernière vérification : ${time}`,
    checking: "Vérification…",
    check: "Vérifier",
    flowWallet: "BTC → ckBTC (portefeuille)",
    flowPurchase: "BTC → TTTI-T (achat)",
    noDepositYet: "Aucun dépôt reçu sur cette adresse pour l'instant.",
    earlierDeposits: "Dépôts précédents sur cette adresse",
    depositNumber: (n: string) => `Dépôt ${n}`,
    detectedOn: (time: string) => `Détecté le ${time}`,
    stagePendingRate: "En attente du taux horaire",
    pendingDepositStatus: "Dépôt Bitcoin en cours.",
    pendingDepositLink: "Voir le dépôt Bitcoin",
    errUnrecoverable: (server: string | undefined) =>
      server
        ? `Ce dépôt ne peut pas être traité. ${server}`
        : "Ce dépôt ne peut pas être traité.",
    refundFailed: (amount: string) =>
      `Le remboursement de l'excédent a échoué. ${amount} toujours détenus ; le remboursement est relancé automatiquement.`,
    waitingNewTransfer: "En attente d'un nouveau transfert vers cette adresse.",
    depositFinished: (n: string, status: string) => `Dépôt ${n} : ${status}.`,
    waitForNew: "Attendre un nouveau transfert",
    otherDeposits: "Autres dépôts sur cette adresse",
    reuseWallet:
      "Envoyez des BTC à cette adresse depuis n'importe quel wallet Bitcoin. Chaque nouveau transfert est converti automatiquement en ckBTC. La même adresse peut être réutilisée.",
    reusePurchase:
      "Envoyez des BTC à cette adresse depuis n'importe quel wallet Bitcoin. Chaque nouveau transfert est converti et livré automatiquement en TTTI-T. La même adresse peut être réutilisée.",
    waitingDepositStatus: "Adresse Bitcoin en attente d'un nouveau transfert.",
    waitingDepositLink: "Voir l'adresse Bitcoin",
  },
  es: {
    requestFailed: "No se pudo completar la solicitud. Inténtelo de nuevo.",
    errorTitle: "Compra con Bitcoin",
    intro: (fee: string) =>
      `Envíe BTC a su propia dirección Bitcoin. Se convierte en ckBTC y luego en TTTI-T al tipo horario, comisión ${fee}.`,
    recordingAcks: "Registrando las confirmaciones de compra…",
    creatingAddress: "Creando la dirección…",
    getAddress: "Obtener mi dirección Bitcoin",
    tickAll: "Marque las seis declaraciones para obtener su dirección.",
    purchaseAddressLabel: "Su dirección Bitcoin de compra",
    sentToDelivery: "El TTTI-T se envía a su dirección de entrega de abajo.",
    keepPageOpen:
      "Mantenga esta página abierta hasta que se detecte su depósito. Si sale de ella, su compra se completará cuando vuelva a esta página, al tipo de cambio de ese momento. Si para entonces la venta ha terminado, se le reembolsará en ckBTC.",
    delivered: (amount: string) => `${amount} TTTI-T entregados`,
    deliveredDetail: (fee: string) =>
      `Al tipo horario de ckBTC, comisión de ${fee} incluida`,
    refunded: (amount: string) => `${amount} reembolsados`,
    refundedDetail: "El ckBTC se ha devuelto a su cuenta.",
    addressDefaultLabel: "Dirección de depósito Bitcoin",
    addressCopiedToast: "Dirección Bitcoin copiada",
    addressCopyFailedToast: "No se pudo copiar la dirección",
    qrTitle: (address: string) =>
      `Código QR de la dirección Bitcoin ${address}`,
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
    noDepositYet:
      "Todavía no se ha recibido ningún depósito en esta dirección.",
    earlierDeposits: "Depósitos anteriores en esta dirección",
    depositNumber: (n: string) => `Depósito ${n}`,
    detectedOn: (time: string) => `Detectado el ${time}`,
    stagePendingRate: "En espera del tipo horario",
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
  },
  "zh-Hans": {
    requestFailed: "无法完成请求。请重试。",
    errorTitle: "比特币购买",
    intro: (fee: string) =>
      `将 BTC 发送到您自己的比特币地址。它会先转为 ckBTC，再按每小时汇率转为 TTTI-T，手续费 ${fee}。`,
    recordingAcks: "正在记录购买确认…",
    creatingAddress: "正在创建地址…",
    getAddress: "获取我的比特币地址",
    tickAll: "勾选全部六项声明以获取您的地址。",
    purchaseAddressLabel: "您的比特币购买地址",
    sentToDelivery: "TTTI-T 将发送到您下方的交付地址。",
    keepPageOpen:
      "请保持此页面打开，直到检测到您的充值。如果您离开，您的购买将在您返回此页面时完成，按届时的汇率计算。如果届时销售已结束，您将获得 ckBTC 退款。",
    delivered: (amount: string) => `已交付 ${amount} TTTI-T`,
    deliveredDetail: (fee: string) =>
      `按每小时 ckBTC 汇率计算，含 ${fee} 手续费`,
    refunded: (amount: string) => `已退还 ${amount}`,
    refundedDetail: "ckBTC 已退回您的账户。",
    addressDefaultLabel: "比特币充值地址",
    addressCopiedToast: "比特币地址已复制",
    addressCopyFailedToast: "无法复制地址",
    qrTitle: (address: string) => `比特币地址 ${address} 的二维码`,
    copyAddressAria: (address: string) => `复制比特币地址 ${address}`,
    copied: "已复制",
    clickToCopy: "点击地址即可复制。",
    errValueTooSmall: (minimum: string) =>
      `充值金额过小：低于 ${minimum} 的最低限额。未进行转换。`,
    errTainted: "充值被 ckBTC minter 拒绝。",
    errMinterUnavailable: "ckBTC minter 不可用。请稍后再查看。",
    errOther: (server: string | undefined) =>
      server ? `无法处理此充值。${server}` : "无法处理此充值。",
    notYet: "尚未",
    finalWallet: "ckBTC 已在您的钱包中",
    finalRefunded: "已以 ckBTC 退还",
    finalDelivered: "TTTI-T 已交付",
    stepAddress: "地址已显示",
    stepDetected: "已检测到充值",
    stepConfirmations: (count: string) => `确认数 ${count}`,
    stepMinted: "ckBTC 已创建",
    amountBtcDetected: "检测到的 BTC",
    amountCkbtcCreated: "已创建的 ckBTC",
    amountCkbtcPending: "待处理的 ckBTC",
    amountRefunded: "已退还",
    amountTttiDelivered: "已交付的 TTTI-T",
    progressAria: "比特币充值进度",
    pendingRate: "汇率不可用。ckBTC 将保留至下一个每小时汇率。",
    lastChecked: (time: string) => `上次检查：${time}`,
    checking: "正在检查…",
    check: "检查",
    flowWallet: "BTC → ckBTC（钱包）",
    flowPurchase: "BTC → TTTI-T（购买）",
    noDepositYet: "此地址尚未收到充值。",
    earlierDeposits: "此地址上的先前充值",
    depositNumber: (n: string) => `充值 ${n}`,
    detectedOn: (time: string) => `检测时间：${time}`,
    stagePendingRate: "等待每小时汇率",
    pendingDepositStatus: "比特币充值进行中。",
    pendingDepositLink: "查看比特币充值",
    errUnrecoverable: (server: string | undefined) =>
      server ? `此充值无法处理。${server}` : "此充值无法处理。",
    refundFailed: (amount: string) =>
      `超额部分退款失败。仍持有 ${amount}；退款将自动重试。`,
    waitingNewTransfer: "正在等待向此地址的新转账。",
    depositFinished: (n: string, status: string) => `充值 ${n}：${status}。`,
    waitForNew: "等待新的转账",
    otherDeposits: "此地址上的其他充值",
    reuseWallet:
      "从任意比特币钱包向此地址发送 BTC。每笔新转账都会自动转换为 ckBTC。同一地址可以重复使用。",
    reusePurchase:
      "从任意比特币钱包向此地址发送 BTC。每笔新转账都会自动转换并以 TTTI-T 交付。同一地址可以重复使用。",
    waitingDepositStatus: "比特币地址正在等待新的转账。",
    waitingDepositLink: "查看比特币地址",
  },
  "pt-BR": {
    requestFailed: "Não foi possível concluir a solicitação. Tente novamente.",
    errorTitle: "Compra com Bitcoin",
    intro: (fee: string) =>
      `Envie BTC para o seu próprio endereço Bitcoin. Ele se torna ckBTC e depois TTTI-T à cotação horária, taxa de ${fee}.`,
    recordingAcks: "Registrando as confirmações de compra…",
    creatingAddress: "Criando o endereço…",
    getAddress: "Obter meu endereço Bitcoin",
    tickAll: "Marque as seis declarações para obter seu endereço.",
    purchaseAddressLabel: "Seu endereço Bitcoin de compra",
    sentToDelivery: "O TTTI-T é enviado ao seu endereço de entrega abaixo.",
    keepPageOpen:
      "Mantenha esta página aberta até que seu depósito seja detectado. Se você sair, sua compra será concluída quando você voltar a esta página, à taxa de câmbio daquele momento. Se a venda já tiver terminado até lá, você será reembolsado em ckBTC.",
    delivered: (amount: string) => `${amount} TTTI-T entregues`,
    deliveredDetail: (fee: string) =>
      `À cotação horária do ckBTC, taxa de ${fee} incluída`,
    refunded: (amount: string) => `${amount} reembolsados`,
    refundedDetail: "O ckBTC foi devolvido à sua conta.",
    addressDefaultLabel: "Endereço de depósito Bitcoin",
    addressCopiedToast: "Endereço Bitcoin copiado",
    addressCopyFailedToast: "Não foi possível copiar o endereço",
    qrTitle: (address: string) => `QR code do endereço Bitcoin ${address}`,
    copyAddressAria: (address: string) =>
      `Copiar o endereço Bitcoin ${address}`,
    copied: "Copiado",
    clickToCopy: "Clique no endereço para copiá-lo.",
    errValueTooSmall: (minimum: string) =>
      `Depósito pequeno demais: abaixo do mínimo de ${minimum}. Ele não foi convertido.`,
    errTainted: "Depósito recusado pelo minter do ckBTC.",
    errMinterUnavailable:
      "O minter do ckBTC está indisponível. Verifique novamente mais tarde.",
    errOther: (server: string | undefined) =>
      server
        ? `Não foi possível processar o depósito. ${server}`
        : "Não foi possível processar o depósito.",
    notYet: "Ainda não",
    finalWallet: "ckBTC na sua carteira",
    finalRefunded: "Reembolsado em ckBTC",
    finalDelivered: "TTTI-T entregue",
    stepAddress: "Endereço exibido",
    stepDetected: "Depósito detectado",
    stepConfirmations: (count: string) => `Confirmações ${count}`,
    stepMinted: "ckBTC criado",
    amountBtcDetected: "BTC detectado",
    amountCkbtcCreated: "ckBTC criado",
    amountCkbtcPending: "ckBTC pendente",
    amountRefunded: "Reembolsado",
    amountTttiDelivered: "TTTI-T entregue",
    progressAria: "Progresso do depósito Bitcoin",
    pendingRate:
      "Cotação indisponível. O ckBTC fica retido até a próxima cotação horária.",
    lastChecked: (time: string) => `Última verificação: ${time}`,
    checking: "Verificando…",
    check: "Verificar",
    flowWallet: "BTC → ckBTC (carteira)",
    flowPurchase: "BTC → TTTI-T (compra)",
    noDepositYet: "Nenhum depósito recebido neste endereço ainda.",
    earlierDeposits: "Depósitos anteriores neste endereço",
    depositNumber: (n: string) => `Depósito ${n}`,
    detectedOn: (time: string) => `Detectado em ${time}`,
    stagePendingRate: "Aguardando a cotação horária",
    pendingDepositStatus: "Depósito Bitcoin em andamento.",
    pendingDepositLink: "Ver o depósito Bitcoin",
    errUnrecoverable: (server: string | undefined) =>
      server
        ? `Este depósito não pode ser processado. ${server}`
        : "Este depósito não pode ser processado.",
    refundFailed: (amount: string) =>
      `O reembolso do excedente falhou. ${amount} ainda retidos; o reembolso é tentado novamente de forma automática.`,
    waitingNewTransfer: "Aguardando uma nova transferência para este endereço.",
    depositFinished: (n: string, status: string) => `Depósito ${n}: ${status}.`,
    waitForNew: "Aguardar uma nova transferência",
    otherDeposits: "Outros depósitos neste endereço",
    reuseWallet:
      "Envie BTC para este endereço a partir de qualquer carteira Bitcoin. Cada nova transferência é convertida em ckBTC automaticamente. O mesmo endereço pode ser reutilizado.",
    reusePurchase:
      "Envie BTC para este endereço a partir de qualquer carteira Bitcoin. Cada nova transferência é convertida e entregue como TTTI-T automaticamente. O mesmo endereço pode ser reutilizado.",
    waitingDepositStatus: "Endereço Bitcoin aguardando uma nova transferência.",
    waitingDepositLink: "Ver o endereço Bitcoin",
  },
  ko: {
    requestFailed: "요청을 완료할 수 없습니다. 다시 시도하세요.",
    errorTitle: "비트코인 구매",
    intro: (fee: string) =>
      `본인의 비트코인 주소로 BTC를 보내세요. BTC는 ckBTC로 전환된 후 시간별 환율에 따라 TTTI-T로 전환되며, 수수료는 ${fee}입니다.`,
    recordingAcks: "구매 확인을 기록하는 중…",
    creatingAddress: "주소 생성 중…",
    getAddress: "내 비트코인 주소 받기",
    tickAll: "주소를 받으려면 여섯 가지 진술을 모두 체크하세요.",
    purchaseAddressLabel: "내 비트코인 구매 주소",
    sentToDelivery: "TTTI-T는 아래의 전달 주소로 전송됩니다.",
    keepPageOpen:
      "입금이 감지될 때까지 이 페이지를 열어 두세요. 페이지를 떠나면, 이 페이지로 돌아왔을 때 그 시점의 환율로 구매가 완료됩니다. 그때 판매가 이미 종료되었다면 ckBTC로 환불됩니다.",
    delivered: (amount: string) => `${amount} TTTI-T 전달됨`,
    deliveredDetail: (fee: string) =>
      `시간별 ckBTC 환율 적용, ${fee} 수수료 포함`,
    refunded: (amount: string) => `${amount} 환불됨`,
    refundedDetail: "ckBTC가 회원님의 계정으로 반환되었습니다.",
    addressDefaultLabel: "비트코인 입금 주소",
    addressCopiedToast: "비트코인 주소가 복사되었습니다",
    addressCopyFailedToast: "주소를 복사할 수 없습니다",
    qrTitle: (address: string) => `비트코인 주소 ${address}의 QR 코드`,
    copyAddressAria: (address: string) => `비트코인 주소 ${address} 복사`,
    copied: "복사됨",
    clickToCopy: "주소를 클릭하면 복사됩니다.",
    errValueTooSmall: (minimum: string) =>
      `입금액이 너무 적습니다: 최소 금액 ${minimum} 미만입니다. 전환되지 않았습니다.`,
    errTainted: "ckBTC minter가 입금을 거부했습니다.",
    errMinterUnavailable:
      "ckBTC minter를 사용할 수 없습니다. 나중에 다시 확인하세요.",
    errOther: (server: string | undefined) =>
      server
        ? `입금을 처리할 수 없습니다. ${server}`
        : "입금을 처리할 수 없습니다.",
    notYet: "아직 아님",
    finalWallet: "지갑에 ckBTC 입금됨",
    finalRefunded: "ckBTC로 환불됨",
    finalDelivered: "TTTI-T 전달됨",
    stepAddress: "주소 표시됨",
    stepDetected: "입금 감지됨",
    stepConfirmations: (count: string) => `컨펌 ${count}`,
    stepMinted: "ckBTC 생성됨",
    amountBtcDetected: "감지된 BTC",
    amountCkbtcCreated: "생성된 ckBTC",
    amountCkbtcPending: "대기 중인 ckBTC",
    amountRefunded: "환불됨",
    amountTttiDelivered: "전달된 TTTI-T",
    progressAria: "비트코인 입금 진행 상황",
    pendingRate:
      "환율을 사용할 수 없습니다. ckBTC는 다음 시간별 환율까지 보관됩니다.",
    lastChecked: (time: string) => `마지막 확인: ${time}`,
    checking: "확인 중…",
    check: "확인",
    flowWallet: "BTC → ckBTC (지갑)",
    flowPurchase: "BTC → TTTI-T (구매)",
    noDepositYet: "이 주소로 아직 입금되지 않았습니다.",
    earlierDeposits: "이 주소의 이전 입금",
    depositNumber: (n: string) => `입금 ${n}`,
    detectedOn: (time: string) => `감지: ${time}`,
    stagePendingRate: "시간별 환율 대기 중",
    pendingDepositStatus: "비트코인 입금 진행 중.",
    pendingDepositLink: "비트코인 입금 보기",
    errUnrecoverable: (server: string | undefined) =>
      server
        ? `이 입금은 처리할 수 없습니다. ${server}`
        : "이 입금은 처리할 수 없습니다.",
    refundFailed: (amount: string) =>
      `초과분 환불에 실패했습니다. ${amount}이(가) 아직 보관되어 있으며, 환불은 자동으로 다시 시도됩니다.`,
    waitingNewTransfer: "이 주소로의 새 전송을 기다리는 중입니다.",
    depositFinished: (n: string, status: string) => `입금 ${n}: ${status}.`,
    waitForNew: "새 전송 기다리기",
    otherDeposits: "이 주소의 다른 입금",
    reuseWallet:
      "어떤 비트코인 지갑에서든 이 주소로 BTC를 보내십시오. 새 전송은 각각 자동으로 ckBTC로 변환됩니다. 같은 주소를 다시 사용할 수 있습니다.",
    reusePurchase:
      "어떤 비트코인 지갑에서든 이 주소로 BTC를 보내십시오. 새 전송은 각각 자동으로 변환되어 TTTI-T로 전달됩니다. 같은 주소를 다시 사용할 수 있습니다.",
    waitingDepositStatus: "비트코인 주소가 새 전송을 기다리는 중입니다.",
    waitingDepositLink: "비트코인 주소 보기",
  },
  "pa-Guru": {
    requestFailed: "ਬੇਨਤੀ ਪੂਰੀ ਨਹੀਂ ਹੋ ਸਕੀ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    errorTitle: "Bitcoin ਖਰੀਦ",
    intro: (fee: string) =>
      `ਆਪਣੇ ਖੁਦ ਦੇ Bitcoin ਪਤੇ 'ਤੇ BTC ਭੇਜੋ। ਇਹ ckBTC ਬਣ ਜਾਂਦਾ ਹੈ, ਫਿਰ ਘੰਟਾਵਾਰ ਦਰ 'ਤੇ TTTI-T, ਫੀਸ ${fee}।`,
    recordingAcks: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਦਰਜ ਕੀਤੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ…",
    creatingAddress: "ਪਤਾ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
    getAddress: "ਮੇਰਾ Bitcoin ਪਤਾ ਪ੍ਰਾਪਤ ਕਰੋ",
    tickAll: "ਆਪਣਾ ਪਤਾ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸਾਰੇ ਛੇ ਕਥਨਾਂ 'ਤੇ ਨਿਸ਼ਾਨ ਲਗਾਓ।",
    purchaseAddressLabel: "ਤੁਹਾਡਾ Bitcoin ਖਰੀਦ ਪਤਾ",
    sentToDelivery: "TTTI-T ਹੇਠਾਂ ਦਿੱਤੇ ਤੁਹਾਡੇ ਡਿਲੀਵਰੀ ਪਤੇ 'ਤੇ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ।",
    keepPageOpen:
      "ਜਦੋਂ ਤੱਕ ਤੁਹਾਡੀ ਜਮ੍ਹਾਂ ਰਕਮ ਦਾ ਪਤਾ ਨਹੀਂ ਲੱਗ ਜਾਂਦਾ, ਇਸ ਪੰਨੇ ਨੂੰ ਖੁੱਲ੍ਹਾ ਰੱਖੋ। ਜੇਕਰ ਤੁਸੀਂ ਚਲੇ ਜਾਂਦੇ ਹੋ, ਤਾਂ ਤੁਹਾਡੀ ਖਰੀਦ ਉਦੋਂ ਪੂਰੀ ਹੋਵੇਗੀ ਜਦੋਂ ਤੁਸੀਂ ਇਸ ਪੰਨੇ 'ਤੇ ਵਾਪਸ ਆਓਗੇ, ਉਸ ਸਮੇਂ ਦੀ ਵਟਾਂਦਰਾ ਦਰ 'ਤੇ। ਜੇਕਰ ਉਦੋਂ ਤੱਕ ਵਿਕਰੀ ਖਤਮ ਹੋ ਚੁੱਕੀ ਹੈ, ਤਾਂ ਤੁਹਾਨੂੰ ckBTC ਵਿੱਚ ਰਕਮ ਵਾਪਸ ਕੀਤੀ ਜਾਵੇਗੀ।",
    delivered: (amount: string) => `${amount} TTTI-T ਡਿਲੀਵਰ ਕੀਤੇ ਗਏ`,
    deliveredDetail: (fee: string) => `ਘੰਟਾਵਾਰ ckBTC ਦਰ 'ਤੇ, ${fee} ਫੀਸ ਸਮੇਤ`,
    refunded: (amount: string) => `${amount} ਵਾਪਸ ਕੀਤੇ ਗਏ`,
    refundedDetail: "ckBTC ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਵਾਪਸ ਭੇਜ ਦਿੱਤਾ ਗਿਆ।",
    addressDefaultLabel: "Bitcoin ਜਮ੍ਹਾਂ ਪਤਾ",
    addressCopiedToast: "Bitcoin ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ",
    addressCopyFailedToast: "ਪਤਾ ਕਾਪੀ ਨਹੀਂ ਹੋ ਸਕਿਆ",
    qrTitle: (address: string) => `Bitcoin ਪਤੇ ${address} ਦਾ QR ਕੋਡ`,
    copyAddressAria: (address: string) => `Bitcoin ਪਤਾ ${address} ਕਾਪੀ ਕਰੋ`,
    copied: "ਕਾਪੀ ਹੋ ਗਿਆ",
    clickToCopy: "ਪਤਾ ਕਾਪੀ ਕਰਨ ਲਈ ਇਸ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।",
    errValueTooSmall: (minimum: string) =>
      `ਜਮ੍ਹਾਂ ਰਕਮ ਬਹੁਤ ਘੱਟ ਹੈ: ${minimum} ਦੀ ਘੱਟੋ-ਘੱਟ ਸੀਮਾ ਤੋਂ ਘੱਟ। ਇਸਨੂੰ ਬਦਲਿਆ ਨਹੀਂ ਗਿਆ।`,
    errTainted: "ckBTC minter ਨੇ ਜਮ੍ਹਾਂ ਰਕਮ ਅਸਵੀਕਾਰ ਕਰ ਦਿੱਤੀ।",
    errMinterUnavailable: "ckBTC minter ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਬਾਅਦ ਵਿੱਚ ਮੁੜ ਜਾਂਚ ਕਰੋ।",
    errOther: (server: string | undefined) =>
      server
        ? `ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਹੋ ਸਕੀ। ${server}`
        : "ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਹੋ ਸਕੀ।",
    notYet: "ਅਜੇ ਨਹੀਂ",
    finalWallet: "ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ckBTC",
    finalRefunded: "ckBTC ਵਿੱਚ ਵਾਪਸ ਕੀਤਾ ਗਿਆ",
    finalDelivered: "TTTI-T ਡਿਲੀਵਰ ਕੀਤਾ ਗਿਆ",
    stepAddress: "ਪਤਾ ਦਿਖਾਇਆ ਗਿਆ",
    stepDetected: "ਜਮ੍ਹਾਂ ਰਕਮ ਮਿਲੀ",
    stepConfirmations: (count: string) => `ਪੁਸ਼ਟੀਆਂ ${count}`,
    stepMinted: "ckBTC ਬਣਾਇਆ ਗਿਆ",
    amountBtcDetected: "ਮਿਲਿਆ BTC",
    amountCkbtcCreated: "ਬਣਾਇਆ ਗਿਆ ckBTC",
    amountCkbtcPending: "ਲੰਬਿਤ ckBTC",
    amountRefunded: "ਵਾਪਸ ਕੀਤਾ ਗਿਆ",
    amountTttiDelivered: "ਡਿਲੀਵਰ ਕੀਤਾ TTTI-T",
    progressAria: "Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਗਤੀ",
    pendingRate: "ਦਰ ਉਪਲਬਧ ਨਹੀਂ। ckBTC ਅਗਲੀ ਘੰਟਾਵਾਰ ਦਰ ਤੱਕ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।",
    lastChecked: (time: string) => `ਆਖਰੀ ਜਾਂਚ: ${time}`,
    checking: "ਜਾਂਚ ਜਾਰੀ ਹੈ…",
    check: "ਜਾਂਚ ਕਰੋ",
    flowWallet: "BTC → ckBTC (ਵਾਲਿਟ)",
    flowPurchase: "BTC → TTTI-T (ਖਰੀਦ)",
    noDepositYet: "ਇਸ ਪਤੇ 'ਤੇ ਅਜੇ ਕੋਈ ਜਮ੍ਹਾਂ ਰਕਮ ਪ੍ਰਾਪਤ ਨਹੀਂ ਹੋਈ।",
    earlierDeposits: "ਇਸ ਪਤੇ 'ਤੇ ਪਿਛਲੀਆਂ ਜਮ੍ਹਾਂ ਰਕਮਾਂ",
    depositNumber: (n: string) => `ਜਮ੍ਹਾਂ ਰਕਮ ${n}`,
    detectedOn: (time: string) => `ਮਿਲੀ: ${time}`,
    stagePendingRate: "ਘੰਟਾਵਾਰ ਦਰ ਦੀ ਉਡੀਕ",
    pendingDepositStatus: "Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਜਾਰੀ ਹੈ।",
    pendingDepositLink: "Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਵੇਖੋ",
    errUnrecoverable: (server: string | undefined) =>
      server
        ? `ਇਸ ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ। ${server}`
        : "ਇਸ ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ।",
    refundFailed: (amount: string) =>
      `ਵਾਧੂ ਰਕਮ ਦੀ ਵਾਪਸੀ ਅਸਫਲ ਰਹੀ। ${amount} ਅਜੇ ਵੀ ਰੱਖੇ ਹੋਏ ਹਨ; ਵਾਪਸੀ ਦੀ ਆਪਣੇ ਆਪ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।`,
    waitingNewTransfer: "ਇਸ ਪਤੇ 'ਤੇ ਨਵੇਂ ਟ੍ਰਾਂਸਫਰ ਦੀ ਉਡੀਕ ਹੋ ਰਹੀ ਹੈ।",
    depositFinished: (n: string, status: string) => `ਜਮ੍ਹਾਂ ਰਕਮ ${n}: ${status}।`,
    waitForNew: "ਨਵੇਂ ਟ੍ਰਾਂਸਫਰ ਦੀ ਉਡੀਕ ਕਰੋ",
    otherDeposits: "ਇਸ ਪਤੇ 'ਤੇ ਹੋਰ ਜਮ੍ਹਾਂ ਰਕਮਾਂ",
    reuseWallet:
      "ਕਿਸੇ ਵੀ Bitcoin ਵਾਲਿਟ ਤੋਂ ਇਸ ਪਤੇ 'ਤੇ BTC ਭੇਜੋ। ਹਰ ਨਵਾਂ ਟ੍ਰਾਂਸਫਰ ਆਪਣੇ ਆਪ ckBTC ਵਿੱਚ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ। ਇਹੀ ਪਤਾ ਦੁਬਾਰਾ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।",
    reusePurchase:
      "ਕਿਸੇ ਵੀ Bitcoin ਵਾਲਿਟ ਤੋਂ ਇਸ ਪਤੇ 'ਤੇ BTC ਭੇਜੋ। ਹਰ ਨਵਾਂ ਟ੍ਰਾਂਸਫਰ ਆਪਣੇ ਆਪ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ TTTI-T ਵਜੋਂ ਪਹੁੰਚਾਇਆ ਜਾਂਦਾ ਹੈ। ਇਹੀ ਪਤਾ ਦੁਬਾਰਾ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।",
    waitingDepositStatus: "Bitcoin ਪਤਾ ਨਵੇਂ ਟ੍ਰਾਂਸਫਰ ਦੀ ਉਡੀਕ ਕਰ ਰਿਹਾ ਹੈ।",
    waitingDepositLink: "Bitcoin ਪਤਾ ਵੇਖੋ",
  },
});

/** Explorer labels of the buy result and the BTC tracking widget. */
export const BUY_EXPLORER_TEXT = defineDict({
  en: {
    paymentBlock: "Payment block",
    mintBlock: "Mint block",
    btcTransaction: "Bitcoin transaction",
    btcTransactions: "Bitcoin transactions",
    ckbtcMintBlock: "ckBTC mint block",
    tttiMintBlock: "TTTI-T mint block",
    viewOnIcpDashboard: "View on the ICP Dashboard",
    viewBlockInHistory: "View block in History",
    trackOnMempool: "Track live on mempool.space",
    addressOnMempool: "Deposit address on mempool.space",
  },
  fr: {
    paymentBlock: "Bloc de paiement",
    mintBlock: "Bloc de mint",
    btcTransaction: "Transaction Bitcoin",
    btcTransactions: "Transactions Bitcoin",
    ckbtcMintBlock: "Bloc de mint ckBTC",
    tttiMintBlock: "Bloc de mint TTTI-T",
    viewOnIcpDashboard: "Voir sur l'ICP Dashboard",
    viewBlockInHistory: "Voir le bloc dans l'historique",
    trackOnMempool: "Suivre en direct sur mempool.space",
    addressOnMempool: "Adresse de dépôt sur mempool.space",
  },
  es: {
    paymentBlock: "Bloque de pago",
    mintBlock: "Bloque de mint",
    btcTransaction: "Transacción de Bitcoin",
    btcTransactions: "Transacciones de Bitcoin",
    ckbtcMintBlock: "Bloque de mint de ckBTC",
    tttiMintBlock: "Bloque de mint de TTTI-T",
    viewOnIcpDashboard: "Ver en el ICP Dashboard",
    viewBlockInHistory: "Ver el bloque en el historial",
    trackOnMempool: "Seguir en directo en mempool.space",
    addressOnMempool: "Dirección de depósito en mempool.space",
  },
  "zh-Hans": {
    paymentBlock: "支付区块",
    mintBlock: "铸造区块",
    btcTransaction: "比特币交易",
    btcTransactions: "比特币交易",
    ckbtcMintBlock: "ckBTC 铸造区块",
    tttiMintBlock: "TTTI-T 铸造区块",
    viewOnIcpDashboard: "在 ICP Dashboard 上查看",
    viewBlockInHistory: "在历史记录中查看区块",
    trackOnMempool: "在 mempool.space 上实时跟踪",
    addressOnMempool: "mempool.space 上的存款地址",
  },
  "pt-BR": {
    paymentBlock: "Bloco de pagamento",
    mintBlock: "Bloco de mint",
    btcTransaction: "Transação Bitcoin",
    btcTransactions: "Transações Bitcoin",
    ckbtcMintBlock: "Bloco de mint do ckBTC",
    tttiMintBlock: "Bloco de mint do TTTI-T",
    viewOnIcpDashboard: "Ver no ICP Dashboard",
    viewBlockInHistory: "Ver o bloco no histórico",
    trackOnMempool: "Acompanhar ao vivo no mempool.space",
    addressOnMempool: "Endereço de depósito no mempool.space",
  },
  ko: {
    paymentBlock: "결제 블록",
    mintBlock: "Mint 블록",
    btcTransaction: "비트코인 거래",
    btcTransactions: "비트코인 거래",
    ckbtcMintBlock: "ckBTC mint 블록",
    tttiMintBlock: "TTTI-T mint 블록",
    viewOnIcpDashboard: "ICP Dashboard에서 보기",
    viewBlockInHistory: "기록에서 블록 보기",
    trackOnMempool: "mempool.space에서 실시간 추적",
    addressOnMempool: "mempool.space의 입금 주소",
  },
  "pa-Guru": {
    paymentBlock: "ਭੁਗਤਾਨ ਬਲਾਕ",
    mintBlock: "Mint ਬਲਾਕ",
    btcTransaction: "ਬਿਟਕੋਇਨ ਲੈਣ-ਦੇਣ",
    btcTransactions: "ਬਿਟਕੋਇਨ ਲੈਣ-ਦੇਣ",
    ckbtcMintBlock: "ckBTC mint ਬਲਾਕ",
    tttiMintBlock: "TTTI-T mint ਬਲਾਕ",
    viewOnIcpDashboard: "ICP Dashboard 'ਤੇ ਵੇਖੋ",
    viewBlockInHistory: "ਇਤਿਹਾਸ ਵਿੱਚ ਬਲਾਕ ਵੇਖੋ",
    trackOnMempool: "mempool.space 'ਤੇ ਲਾਈਵ ਟ੍ਰੈਕ ਕਰੋ",
    addressOnMempool: "mempool.space 'ਤੇ ਜਮ੍ਹਾਂ ਪਤਾ",
  },
});

/** components/exchange/ZeroBalanceTransferOffer.tsx */
export const BUY_TRANSFER_OFFER_TEXT = defineDict({
  en: {
    aria: (symbol: string) => `Transfer ${symbol} to this wallet`,
    zeroBalance: (symbol: string) => `Your ${symbol} balance is 0.`,
    transferTo: (symbol: string) =>
      `Transfer ${symbol} to this wallet address to mint.`,
    transferOrBuy: (symbol: string) =>
      `Transfer ${symbol} to the wallet address below, or buy ${symbol}.`,
    copyAria: "Copy wallet address",
    copied: "Address copied",
    copyFailed: "Copy failed. Select the address and copy it.",
  },
  fr: {
    aria: (symbol: string) => `Transférer du ${symbol} vers ce wallet`,
    zeroBalance: (symbol: string) => `Votre solde ${symbol} est de 0.`,
    transferTo: (symbol: string) =>
      `Transférez du ${symbol} vers cette adresse de wallet pour frapper.`,
    transferOrBuy: (symbol: string) =>
      `Transférez du ${symbol} vers l'adresse de wallet ci-dessous, ou achetez du ${symbol}.`,
    copyAria: "Copier l'adresse du wallet",
    copied: "Adresse copiée",
    copyFailed: "Échec de la copie. Sélectionnez l'adresse et copiez-la.",
  },
  es: {
    aria: (symbol: string) => `Transferir ${symbol} a este wallet`,
    zeroBalance: (symbol: string) => `Su saldo de ${symbol} es 0.`,
    transferTo: (symbol: string) =>
      `Transfiera ${symbol} a esta dirección de wallet para acuñar.`,
    transferOrBuy: (symbol: string) =>
      `Transfiera ${symbol} a la dirección de wallet de abajo, o compre ${symbol}.`,
    copyAria: "Copiar la dirección del wallet",
    copied: "Dirección copiada",
    copyFailed: "Error al copiar. Seleccione la dirección y cópiela.",
  },
  "zh-Hans": {
    aria: (symbol: string) => `将 ${symbol} 转入此钱包`,
    zeroBalance: (symbol: string) => `您的 ${symbol} 余额为 0。`,
    transferTo: (symbol: string) => `将 ${symbol} 转入此钱包地址即可铸造。`,
    transferOrBuy: (symbol: string) =>
      `将 ${symbol} 转入下方的钱包地址，或购买 ${symbol}。`,
    copyAria: "复制钱包地址",
    copied: "地址已复制",
    copyFailed: "复制失败。请选中地址并复制。",
  },
  "pt-BR": {
    aria: (symbol: string) => `Transferir ${symbol} para esta carteira`,
    zeroBalance: (symbol: string) => `Seu saldo de ${symbol} é 0.`,
    transferTo: (symbol: string) =>
      `Transfira ${symbol} para este endereço de carteira para cunhar.`,
    transferOrBuy: (symbol: string) =>
      `Transfira ${symbol} para o endereço de carteira abaixo, ou compre ${symbol}.`,
    copyAria: "Copiar o endereço da carteira",
    copied: "Endereço copiado",
    copyFailed: "Falha ao copiar. Selecione o endereço e copie-o.",
  },
  ko: {
    aria: (symbol: string) => `이 지갑으로 ${symbol} 전송`,
    zeroBalance: (symbol: string) => `${symbol} 잔액이 0입니다.`,
    transferTo: (symbol: string) =>
      `발행하려면 이 지갑 주소로 ${symbol}을(를) 전송하세요.`,
    transferOrBuy: (symbol: string) =>
      `아래 지갑 주소로 ${symbol}을(를) 전송하거나 ${symbol}을(를) 구매하세요.`,
    copyAria: "지갑 주소 복사",
    copied: "주소가 복사되었습니다",
    copyFailed: "복사에 실패했습니다. 주소를 선택해 복사하세요.",
  },
  "pa-Guru": {
    aria: (symbol: string) => `ਇਸ ਵਾਲਿਟ ਵਿੱਚ ${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ`,
    zeroBalance: (symbol: string) => `ਤੁਹਾਡਾ ${symbol} ਬਕਾਇਆ 0 ਹੈ।`,
    transferTo: (symbol: string) =>
      `ਮਿੰਟ ਕਰਨ ਲਈ ਇਸ ਵਾਲਿਟ ਪਤੇ 'ਤੇ ${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ।`,
    transferOrBuy: (symbol: string) =>
      `ਹੇਠਾਂ ਦਿੱਤੇ ਵਾਲਿਟ ਪਤੇ 'ਤੇ ${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ, ਜਾਂ ${symbol} ਖਰੀਦੋ।`,
    copyAria: "ਵਾਲਿਟ ਪਤਾ ਕਾਪੀ ਕਰੋ",
    copied: "ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ",
    copyFailed: "ਕਾਪੀ ਅਸਫਲ ਰਹੀ। ਪਤਾ ਚੁਣੋ ਅਤੇ ਇਸਨੂੰ ਕਾਪੀ ਕਰੋ।",
  },
});

/** Liquidity-forming mint: components/exchange (order, preview, outcome). */
export const BUY_LIQUIDITY_TEXT = defineDict({
  en: {
    priceStatement:
      "Price: 10,000 USD per TTTI-T. For q TTTI-T, the amount payable is 20,000 USD × q ÷ 0.99, in ICP, ckBTC, ckUSDC or ckUSDT. Minimum: 0.0001 TTTI-T.",
    modeLegend: "Amount entry",
    modeTtti: "Amount in TTTI-T",
    modeUsd: "Amount in dollars",
    tttiLabel: "TTTI-T to mint",
    tttiHint: "Minimum 0.0001 TTTI-T, up to 8 decimals.",
    usdLabel: "Amount to pay, in dollars",
    usdHint:
      "Dollar value of the payment. The TTTI-T quantity is rounded down to 8 decimals.",
    invalidTtti:
      "Enter a TTTI-T amount with up to 8 decimals. A dot or a comma may be used.",
    invalidUsd:
      "Enter a dollar amount greater than 0 with up to 8 decimals. A dot or a comma may be used.",
    previewHeading: "Preview",
    previewIdle: "Enter an amount to see the preview.",
    previewLoading: "Calculating the preview…",
    rowMinted: "TTTI-T minted",
    rowPay: "You pay",
    splitHeading: "Split of the payment",
    rowPosition: "Liquidity position",
    rowGuarantee: "Personal guarantee",
    rowFee: "Fee",
    rowDust: "Rounding remainder",
    poolPriceHeading: "Targeted pool price, before and after the zap",
    priceBefore: "Before",
    priceAfter: "After",
    emptyPool: "Empty pool",
    consolidatedPriceHeading: "Consolidated price (reference)",
    consolidatedPriceNote:
      "USD per TTTI-T, weighted by the depth of the open pools.",
    poolPriceNote: "USD per TTTI-T in the TTTI-T pool of the paid token.",
    gapHeading: "Gap between the pool price and the consolidated price",
    gapUnavailable: "Gap not available",
    firstDepositNote:
      "Empty pool: the first deposit is made 1 to 1, at 10,000 USD per TTTI-T.",
    zapLabel: "Balancing swap",
    noZap: "No balancing swap is needed.",
    maxPayLabel: "Maximum payment at this tolerance",
    expiryNote: "The mint is refused if it is not executed within 5 minutes.",
    previewFailedTitle: "Preview unavailable",
    mintFailedTitle: "Mint not completed",
    successTitle: (amount: string) => `${amount} minted`,
    successPaid: (pay: string, id: string) => `Paid ${pay} · mint #${id}`,
    successPosition: (id: string) => `Liquidity position #${id}`,
    successHoldings: (token: string, ttti: string) =>
      `The position holds ${token} and ${ttti}.`,
    successGuarantee: (amount: string) => `Personal guarantee: ${amount}.`,
    successLink: "View my liquidity positions",
    errAnonymous: "Sign in or connect a wallet to mint.",
    errRateUnavailable: (symbol: string) =>
      `No valid ${symbol}/USD rate is available at the moment. Nothing was taken. Try again later.`,
    errBelowMinimum: (minimum: string) => `The minimum is ${minimum}.`,
    errTooManyDecimals: (max: string, step: string) =>
      `A TTTI-T amount has at most ${max} decimals (smallest step ${step}).`,
    errInvalidAmount: "Enter an amount greater than 0.",
    errAboveCap: (cap: string, remaining: string) =>
      `The total cap of ${cap} is reached or would be exceeded. Remaining: ${remaining}.`,
    errInsufficientBalance: (
      symbol: string,
      required: string,
      balance: string,
    ) =>
      `Insufficient ${symbol} balance: ${required} needed including ledger fees, ${balance} available.`,
    errInsufficientAllowance: (
      symbol: string,
      required: string,
      allowance: string,
    ) =>
      `The ${symbol} approval is too low: ${required} required, ${allowance} approved. Approve again and retry.`,
    errSlippageExceeded: (percent: string) =>
      `The pool price moved beyond the tolerance of ${percent} %. Nothing was minted. Retry or raise the tolerance.`,
    errInvalidSlippage: (percent: string) =>
      `The tolerance cannot exceed ${percent} %.`,
    errMaxPayExceeded: (pay: string, max: string) =>
      `The amount payable is now ${pay}, above the maximum of ${max} set from the preview. Refresh the preview and retry.`,
    errDeadlineExpired:
      "The 5-minute deadline passed before the mint was executed. Retry.",
    errInProgress: "A mint from this account is already in progress.",
    errAcknowledgements: "Accept the acknowledgements to mint.",
    errSalesPaused: "Minting is paused.",
    errDexPaused: "Pools are paused. Minting is unavailable.",
    errPoolRemoved: (symbol: string) =>
      `The TTTI-T/${symbol} pool has been removed.`,
    errRemovalAnnounced: (symbol: string, date: string) =>
      `A removal of the TTTI-T/${symbol} pool is announced for ${date}. Minting into it is suspended.`,
    errPoolNotFound: (symbol: string) => `There is no TTTI-T/${symbol} pool.`,
    errMinimumsNotSet: "The pool minimums are not set yet.",
    errLedger: (symbol: string, message: string) =>
      `${symbol} ledger error: ${message}`,
    errDepositRefunded: (id: string) =>
      `The deposit into the pool failed. The payment was refunded, minus ledger fees (mint #${id}).`,
    refundingTitle: "Payment being returned",
    errDepositRefunding: (id: string) =>
      `The deposit into the pool failed. The payment is being returned and remains in your wallet balance in the meantime (mint #${id}).`,
    errDepositRefundFailed: (id: string) =>
      `The deposit into the pool failed and the refund did not complete (mint #${id}). Keep this reference.`,
    errGeneric: "The mint was refused.",
  },
  fr: {
    priceStatement:
      "Prix : 10 000 USD par TTTI-T. Pour q TTTI-T, le montant à payer est 20 000 USD × q ÷ 0,99, en ICP, ckBTC, ckUSDC ou ckUSDT. Minimum : 0,0001 TTTI-T.",
    modeLegend: "Saisie du montant",
    modeTtti: "Montant en TTTI-T",
    modeUsd: "Montant en dollars",
    tttiLabel: "TTTI-T à frapper",
    tttiHint: "Minimum 0,0001 TTTI-T, jusqu'à 8 décimales.",
    usdLabel: "Montant à payer, en dollars",
    usdHint:
      "Valeur en dollars du paiement. La quantité de TTTI-T est arrondie à la baisse à 8 décimales.",
    invalidTtti:
      "Saisissez un montant en TTTI-T avec 8 décimales au plus. Le point et la virgule sont acceptés.",
    invalidUsd:
      "Saisissez un montant en dollars supérieur à 0 avec 8 décimales au plus. Le point et la virgule sont acceptés.",
    previewHeading: "Aperçu",
    previewIdle: "Saisissez un montant pour voir l'aperçu.",
    previewLoading: "Calcul de l'aperçu…",
    rowMinted: "TTTI-T frappés",
    rowPay: "Vous payez",
    splitHeading: "Répartition du paiement",
    rowPosition: "Position de liquidité",
    rowGuarantee: "Garantie personnelle",
    rowFee: "Frais",
    rowDust: "Reste d'arrondi",
    poolPriceHeading: "Prix du pool visé, avant et après le zap",
    priceBefore: "Avant",
    priceAfter: "Après",
    emptyPool: "Pool vide",
    consolidatedPriceHeading: "Prix consolidé (référence)",
    consolidatedPriceNote:
      "USD par TTTI-T, pondéré par la profondeur des pools ouverts.",
    poolPriceNote: "USD par TTTI-T dans le pool TTTI-T du jeton payé.",
    gapHeading: "Écart entre le prix du pool et le prix consolidé",
    gapUnavailable: "Écart non disponible",
    firstDepositNote:
      "Pool vide : le premier dépôt se fait 1 pour 1, à 10 000 USD par TTTI-T.",
    zapLabel: "Échange d'équilibrage",
    noZap: "Aucun échange d'équilibrage n'est nécessaire.",
    maxPayLabel: "Paiement maximal à cette tolérance",
    expiryNote:
      "La frappe est refusée si elle n'est pas exécutée dans les 5 minutes.",
    previewFailedTitle: "Aperçu indisponible",
    mintFailedTitle: "Frappe non effectuée",
    successTitle: (amount: string) => `${amount} frappés`,
    successPaid: (pay: string, id: string) => `Payé ${pay} · frappe n° ${id}`,
    successPosition: (id: string) => `Position de liquidité n° ${id}`,
    successHoldings: (token: string, ttti: string) =>
      `La position contient ${token} et ${ttti}.`,
    successGuarantee: (amount: string) => `Garantie personnelle : ${amount}.`,
    successLink: "Voir mes positions de liquidité",
    errAnonymous: "Connectez-vous ou connectez un wallet pour frapper.",
    errRateUnavailable: (symbol: string) =>
      `Aucun taux ${symbol}/USD valide n'est disponible pour le moment. Rien n'a été prélevé. Réessayez plus tard.`,
    errBelowMinimum: (minimum: string) => `Le minimum est de ${minimum}.`,
    errTooManyDecimals: (max: string, step: string) =>
      `Un montant en TTTI-T a ${max} décimales au plus (plus petit pas : ${step}).`,
    errInvalidAmount: "Saisissez un montant supérieur à 0.",
    errAboveCap: (cap: string, remaining: string) =>
      `Le plafond total de ${cap} est atteint ou serait dépassé. Reste : ${remaining}.`,
    errInsufficientBalance: (
      symbol: string,
      required: string,
      balance: string,
    ) =>
      `Solde ${symbol} insuffisant : ${required} nécessaires frais du ledger compris, ${balance} disponibles.`,
    errInsufficientAllowance: (
      symbol: string,
      required: string,
      allowance: string,
    ) =>
      `L'approbation ${symbol} est trop basse : ${required} requis, ${allowance} approuvés. Approuvez à nouveau et réessayez.`,
    errSlippageExceeded: (percent: string) =>
      `Le prix du pool a dépassé la tolérance de ${percent} %. Rien n'a été frappé. Réessayez ou augmentez la tolérance.`,
    errInvalidSlippage: (percent: string) =>
      `La tolérance ne peut pas dépasser ${percent} %.`,
    errMaxPayExceeded: (pay: string, max: string) =>
      `Le montant à payer est maintenant de ${pay}, au-dessus du maximum de ${max} fixé d'après l'aperçu. Actualisez l'aperçu et réessayez.`,
    errDeadlineExpired:
      "Le délai de 5 minutes est écoulé avant l'exécution de la frappe. Réessayez.",
    errInProgress: "Une frappe de ce compte est déjà en cours.",
    errAcknowledgements: "Acceptez les reconnaissances pour frapper.",
    errSalesPaused: "La frappe est en pause.",
    errDexPaused: "Les pools sont en pause. La frappe est indisponible.",
    errPoolRemoved: (symbol: string) =>
      `Le pool TTTI-T/${symbol} a été retiré.`,
    errRemovalAnnounced: (symbol: string, date: string) =>
      `Le retrait du pool TTTI-T/${symbol} est annoncé pour le ${date}. La frappe dans ce pool est suspendue.`,
    errPoolNotFound: (symbol: string) =>
      `Il n'existe pas de pool TTTI-T/${symbol}.`,
    errMinimumsNotSet: "Les minimums du pool ne sont pas encore fixés.",
    errLedger: (symbol: string, message: string) =>
      `Erreur du ledger ${symbol} : ${message}`,
    errDepositRefunded: (id: string) =>
      `Le dépôt dans le pool a échoué. Le paiement a été remboursé, frais du ledger déduits (frappe n° ${id}).`,
    refundingTitle: "Paiement en cours de retour",
    errDepositRefunding: (id: string) =>
      `Le dépôt dans le pool a échoué. Le paiement est en cours de retour et reste dans le solde de votre portefeuille en attendant (frappe n° ${id}).`,
    errDepositRefundFailed: (id: string) =>
      `Le dépôt dans le pool a échoué et le remboursement n'est pas terminé (frappe n° ${id}). Conservez cette référence.`,
    errGeneric: "La frappe a été refusée.",
  },
  es: {
    priceStatement:
      "Precio: 10.000 USD por TTTI-T. Para q TTTI-T, el importe a pagar es 20.000 USD × q ÷ 0,99, en ICP, ckBTC, ckUSDC o ckUSDT. Mínimo: 0,0001 TTTI-T.",
    modeLegend: "Introducción del importe",
    modeTtti: "Importe en TTTI-T",
    modeUsd: "Importe en dólares",
    tttiLabel: "TTTI-T a acuñar",
    tttiHint: "Mínimo 0,0001 TTTI-T, hasta 8 decimales.",
    usdLabel: "Importe a pagar, en dólares",
    usdHint:
      "Valor en dólares del pago. La cantidad de TTTI-T se redondea a la baja a 8 decimales.",
    invalidTtti:
      "Introduzca un importe en TTTI-T con 8 decimales como máximo. Se admite punto o coma.",
    invalidUsd:
      "Introduzca un importe en dólares mayor que 0 con 8 decimales como máximo. Se admite punto o coma.",
    previewHeading: "Vista previa",
    previewIdle: "Introduzca un importe para ver la vista previa.",
    previewLoading: "Calculando la vista previa…",
    rowMinted: "TTTI-T acuñados",
    rowPay: "Usted paga",
    splitHeading: "Reparto del pago",
    rowPosition: "Posición de liquidez",
    rowGuarantee: "Garantía personal",
    rowFee: "Comisión",
    rowDust: "Resto de redondeo",
    poolPriceHeading: "Precio del pool objetivo, antes y después del zap",
    priceBefore: "Antes",
    priceAfter: "Después",
    emptyPool: "Pool vacío",
    consolidatedPriceHeading: "Precio consolidado (referencia)",
    consolidatedPriceNote:
      "USD por TTTI-T, ponderado por la profundidad de los pools abiertos.",
    poolPriceNote: "USD por TTTI-T en el pool TTTI-T del token pagado.",
    gapHeading: "Diferencia entre el precio del pool y el precio consolidado",
    gapUnavailable: "Diferencia no disponible",
    firstDepositNote:
      "Pool vacío: el primer depósito se hace 1 a 1, a 10.000 USD por TTTI-T.",
    zapLabel: "Intercambio de equilibrio",
    noZap: "No hace falta un intercambio de equilibrio.",
    maxPayLabel: "Pago máximo con esta tolerancia",
    expiryNote: "La acuñación se rechaza si no se ejecuta en 5 minutos.",
    previewFailedTitle: "Vista previa no disponible",
    mintFailedTitle: "Acuñación no completada",
    successTitle: (amount: string) => `${amount} acuñados`,
    successPaid: (pay: string, id: string) =>
      `Pagado ${pay} · acuñación n.º ${id}`,
    successPosition: (id: string) => `Posición de liquidez n.º ${id}`,
    successHoldings: (token: string, ttti: string) =>
      `La posición contiene ${token} y ${ttti}.`,
    successGuarantee: (amount: string) => `Garantía personal: ${amount}.`,
    successLink: "Ver mis posiciones de liquidez",
    errAnonymous: "Inicie sesión o conecte un wallet para acuñar.",
    errRateUnavailable: (symbol: string) =>
      `No hay una tasa ${symbol}/USD válida en este momento. No se ha cobrado nada. Inténtelo más tarde.`,
    errBelowMinimum: (minimum: string) => `El mínimo es ${minimum}.`,
    errTooManyDecimals: (max: string, step: string) =>
      `Un importe en TTTI-T tiene ${max} decimales como máximo (paso mínimo ${step}).`,
    errInvalidAmount: "Introduzca un importe mayor que 0.",
    errAboveCap: (cap: string, remaining: string) =>
      `Se ha alcanzado o se superaría el tope total de ${cap}. Restante: ${remaining}.`,
    errInsufficientBalance: (
      symbol: string,
      required: string,
      balance: string,
    ) =>
      `Saldo de ${symbol} insuficiente: se necesitan ${required} con las comisiones del ledger, hay ${balance} disponibles.`,
    errInsufficientAllowance: (
      symbol: string,
      required: string,
      allowance: string,
    ) =>
      `La aprobación de ${symbol} es demasiado baja: se requieren ${required}, aprobados ${allowance}. Apruebe de nuevo e inténtelo otra vez.`,
    errSlippageExceeded: (percent: string) =>
      `El precio del pool superó la tolerancia del ${percent} %. No se acuñó nada. Reintente o aumente la tolerancia.`,
    errInvalidSlippage: (percent: string) =>
      `La tolerancia no puede superar el ${percent} %.`,
    errMaxPayExceeded: (pay: string, max: string) =>
      `El importe a pagar es ahora ${pay}, por encima del máximo de ${max} fijado con la vista previa. Actualice la vista previa e inténtelo de nuevo.`,
    errDeadlineExpired:
      "Pasó el plazo de 5 minutos antes de ejecutar la acuñación. Inténtelo de nuevo.",
    errInProgress: "Ya hay una acuñación en curso de esta cuenta.",
    errAcknowledgements: "Acepte las declaraciones para acuñar.",
    errSalesPaused: "La acuñación está en pausa.",
    errDexPaused: "Los pools están en pausa. La acuñación no está disponible.",
    errPoolRemoved: (symbol: string) =>
      `El pool TTTI-T/${symbol} ha sido retirado.`,
    errRemovalAnnounced: (symbol: string, date: string) =>
      `Se ha anunciado la retirada del pool TTTI-T/${symbol} para el ${date}. La acuñación en él está suspendida.`,
    errPoolNotFound: (symbol: string) => `No existe un pool TTTI-T/${symbol}.`,
    errMinimumsNotSet: "Los mínimos del pool aún no están fijados.",
    errLedger: (symbol: string, message: string) =>
      `Error del ledger de ${symbol}: ${message}`,
    errDepositRefunded: (id: string) =>
      `El depósito en el pool falló. El pago se reembolsó, menos las comisiones del ledger (acuñación n.º ${id}).`,
    refundingTitle: "Pago en proceso de devolución",
    errDepositRefunding: (id: string) =>
      `El depósito en el pool falló. El pago se está devolviendo y mientras tanto permanece en el saldo de su billetera (acuñación n.º ${id}).`,
    errDepositRefundFailed: (id: string) =>
      `El depósito en el pool falló y el reembolso no se completó (acuñación n.º ${id}). Conserve esta referencia.`,
    errGeneric: "La acuñación fue rechazada.",
  },
  "zh-Hans": {
    priceStatement:
      "价格：每 TTTI-T 10,000 美元。对于 q 个 TTTI-T，应付金额为 20,000 美元 × q ÷ 0.99，以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付。最少：0.0001 TTTI-T。",
    modeLegend: "金额输入方式",
    modeTtti: "以 TTTI-T 输入",
    modeUsd: "以美元输入",
    tttiLabel: "铸造的 TTTI-T",
    tttiHint: "最少 0.0001 TTTI-T，最多 8 位小数。",
    usdLabel: "支付金额（美元）",
    usdHint: "支付的美元价值。TTTI-T 数量向下取整到 8 位小数。",
    invalidTtti: "请输入最多 8 位小数的 TTTI-T 数量。可使用句点或逗号。",
    invalidUsd: "请输入大于 0 且最多 8 位小数的美元金额。可使用句点或逗号。",
    previewHeading: "预览",
    previewIdle: "输入金额以查看预览。",
    previewLoading: "正在计算预览…",
    rowMinted: "铸造的 TTTI-T",
    rowPay: "您支付",
    splitHeading: "付款分配",
    rowPosition: "流动性头寸",
    rowGuarantee: "个人保证金",
    rowFee: "费用",
    rowDust: "舍入余额",
    poolPriceHeading: "目标池价格，zap 前后",
    priceBefore: "之前",
    priceAfter: "之后",
    emptyPool: "空池",
    consolidatedPriceHeading: "综合价格（参考）",
    consolidatedPriceNote: "每 TTTI-T 的美元，按已开放池的深度加权。",
    poolPriceNote: "所付代币的 TTTI-T 池中每 TTTI-T 的美元。",
    gapHeading: "池价格与综合价格之间的价差",
    gapUnavailable: "价差不可用",
    firstDepositNote:
      "空池：首笔存入按 1 比 1 进行，价格为每 TTTI-T 10,000 美元。",
    zapLabel: "平衡兑换",
    noZap: "无需平衡兑换。",
    maxPayLabel: "此容差下的最高支付额",
    expiryNote: "若 5 分钟内未执行，铸造将被拒绝。",
    previewFailedTitle: "预览不可用",
    mintFailedTitle: "铸造未完成",
    successTitle: (amount: string) => `已铸造 ${amount}`,
    successPaid: (pay: string, id: string) => `已支付 ${pay} · 铸造 #${id}`,
    successPosition: (id: string) => `流动性头寸 #${id}`,
    successHoldings: (token: string, ttti: string) =>
      `该头寸包含 ${token} 和 ${ttti}。`,
    successGuarantee: (amount: string) => `个人保证金：${amount}。`,
    successLink: "查看我的流动性头寸",
    errAnonymous: "请登录或连接钱包后再铸造。",
    errRateUnavailable: (symbol: string) =>
      `目前没有有效的 ${symbol}/USD 汇率。未扣除任何款项。请稍后重试。`,
    errBelowMinimum: (minimum: string) => `最低为 ${minimum}。`,
    errTooManyDecimals: (max: string, step: string) =>
      `TTTI-T 数量最多 ${max} 位小数（最小单位 ${step}）。`,
    errInvalidAmount: "请输入大于 0 的金额。",
    errAboveCap: (cap: string, remaining: string) =>
      `已达到或将超过总上限 ${cap}。剩余：${remaining}。`,
    errInsufficientBalance: (
      symbol: string,
      required: string,
      balance: string,
    ) => `${symbol} 余额不足：含账本手续费需要 ${required}，可用 ${balance}。`,
    errInsufficientAllowance: (
      symbol: string,
      required: string,
      allowance: string,
    ) =>
      `${symbol} 授权额度过低：需要 ${required}，已授权 ${allowance}。请重新授权后重试。`,
    errSlippageExceeded: (percent: string) =>
      `池价格变动超出 ${percent} % 的容差。未铸造任何内容。请重试或提高容差。`,
    errInvalidSlippage: (percent: string) => `容差不能超过 ${percent} %。`,
    errMaxPayExceeded: (pay: string, max: string) =>
      `应付金额现为 ${pay}，高于根据预览设定的上限 ${max}。请刷新预览后重试。`,
    errDeadlineExpired: "在铸造执行前已超过 5 分钟期限。请重试。",
    errInProgress: "此账户已有一笔铸造正在进行。",
    errAcknowledgements: "请先接受确认声明再铸造。",
    errSalesPaused: "铸造已暂停。",
    errDexPaused: "资金池已暂停，无法铸造。",
    errPoolRemoved: (symbol: string) => `TTTI-T/${symbol} 池已被移除。`,
    errRemovalAnnounced: (symbol: string, date: string) =>
      `已公告 TTTI-T/${symbol} 池将于 ${date} 移除。向该池的铸造已暂停。`,
    errPoolNotFound: (symbol: string) => `不存在 TTTI-T/${symbol} 池。`,
    errMinimumsNotSet: "池的最低限额尚未设置。",
    errLedger: (symbol: string, message: string) =>
      `${symbol} 账本错误：${message}`,
    errDepositRefunded: (id: string) =>
      `向池存入失败。款项已退还（扣除账本手续费）（铸造 #${id}）。`,
    refundingTitle: "款项退还中",
    errDepositRefunding: (id: string) =>
      `向池存入失败。款项正在退还，在此期间仍保留在您的钱包余额中（铸造 #${id}）。`,
    errDepositRefundFailed: (id: string) =>
      `向池存入失败，且退款未完成（铸造 #${id}）。请保留此编号。`,
    errGeneric: "铸造被拒绝。",
  },
  "pt-BR": {
    priceStatement:
      "Preço: 10.000 USD por TTTI-T. Para q TTTI-T, o valor a pagar é 20.000 USD × q ÷ 0,99, em ICP, ckBTC, ckUSDC ou ckUSDT. Mínimo: 0,0001 TTTI-T.",
    modeLegend: "Entrada do valor",
    modeTtti: "Valor em TTTI-T",
    modeUsd: "Valor em dólares",
    tttiLabel: "TTTI-T a cunhar",
    tttiHint: "Mínimo de 0,0001 TTTI-T, até 8 casas decimais.",
    usdLabel: "Valor a pagar, em dólares",
    usdHint:
      "Valor em dólares do pagamento. A quantidade de TTTI-T é arredondada para baixo, com 8 casas decimais.",
    invalidTtti:
      "Informe um valor em TTTI-T com até 8 casas decimais. Ponto ou vírgula são aceitos.",
    invalidUsd:
      "Informe um valor em dólares maior que 0, com até 8 casas decimais. Ponto ou vírgula são aceitos.",
    previewHeading: "Prévia",
    previewIdle: "Informe um valor para ver a prévia.",
    previewLoading: "Calculando a prévia…",
    rowMinted: "TTTI-T cunhados",
    rowPay: "Você paga",
    splitHeading: "Divisão do pagamento",
    rowPosition: "Posição de liquidez",
    rowGuarantee: "Garantia pessoal",
    rowFee: "Taxa",
    rowDust: "Resto de arredondamento",
    poolPriceHeading: "Preço do pool visado, antes e depois do zap",
    priceBefore: "Antes",
    priceAfter: "Depois",
    emptyPool: "Pool vazio",
    consolidatedPriceHeading: "Preço consolidado (referência)",
    consolidatedPriceNote:
      "USD por TTTI-T, ponderado pela profundidade dos pools abertos.",
    poolPriceNote: "USD por TTTI-T no pool TTTI-T do token pago.",
    gapHeading: "Diferença entre o preço do pool e o preço consolidado",
    gapUnavailable: "Diferença indisponível",
    firstDepositNote:
      "Pool vazio: o primeiro depósito é feito 1 para 1, a 10.000 USD por TTTI-T.",
    zapLabel: "Troca de equilíbrio",
    noZap: "Não é necessária uma troca de equilíbrio.",
    maxPayLabel: "Pagamento máximo nesta tolerância",
    expiryNote: "A cunhagem é recusada se não for executada em 5 minutos.",
    previewFailedTitle: "Prévia indisponível",
    mintFailedTitle: "Cunhagem não concluída",
    successTitle: (amount: string) => `${amount} cunhados`,
    successPaid: (pay: string, id: string) =>
      `Pago ${pay} · cunhagem n.º ${id}`,
    successPosition: (id: string) => `Posição de liquidez n.º ${id}`,
    successHoldings: (token: string, ttti: string) =>
      `A posição contém ${token} e ${ttti}.`,
    successGuarantee: (amount: string) => `Garantia pessoal: ${amount}.`,
    successLink: "Ver minhas posições de liquidez",
    errAnonymous: "Entre ou conecte uma carteira para cunhar.",
    errRateUnavailable: (symbol: string) =>
      `Não há uma taxa ${symbol}/USD válida no momento. Nada foi cobrado. Tente novamente mais tarde.`,
    errBelowMinimum: (minimum: string) => `O mínimo é ${minimum}.`,
    errTooManyDecimals: (max: string, step: string) =>
      `Um valor em TTTI-T tem no máximo ${max} casas decimais (menor passo ${step}).`,
    errInvalidAmount: "Informe um valor maior que 0.",
    errAboveCap: (cap: string, remaining: string) =>
      `O limite total de ${cap} foi atingido ou seria ultrapassado. Restante: ${remaining}.`,
    errInsufficientBalance: (
      symbol: string,
      required: string,
      balance: string,
    ) =>
      `Saldo de ${symbol} insuficiente: ${required} necessários com as taxas do ledger, ${balance} disponíveis.`,
    errInsufficientAllowance: (
      symbol: string,
      required: string,
      allowance: string,
    ) =>
      `A aprovação de ${symbol} é baixa demais: ${required} exigidos, ${allowance} aprovados. Aprove novamente e tente de novo.`,
    errSlippageExceeded: (percent: string) =>
      `O preço do pool passou da tolerância de ${percent} %. Nada foi cunhado. Tente de novo ou aumente a tolerância.`,
    errInvalidSlippage: (percent: string) =>
      `A tolerância não pode passar de ${percent} %.`,
    errMaxPayExceeded: (pay: string, max: string) =>
      `O valor a pagar agora é ${pay}, acima do máximo de ${max} definido pela prévia. Atualize a prévia e tente de novo.`,
    errDeadlineExpired:
      "O prazo de 5 minutos passou antes da execução da cunhagem. Tente de novo.",
    errInProgress: "Já há uma cunhagem em andamento desta conta.",
    errAcknowledgements: "Aceite as declarações para cunhar.",
    errSalesPaused: "A cunhagem está pausada.",
    errDexPaused: "Os pools estão pausados. A cunhagem está indisponível.",
    errPoolRemoved: (symbol: string) => `O pool TTTI-T/${symbol} foi removido.`,
    errRemovalAnnounced: (symbol: string, date: string) =>
      `A remoção do pool TTTI-T/${symbol} foi anunciada para ${date}. A cunhagem nele está suspensa.`,
    errPoolNotFound: (symbol: string) => `Não existe um pool TTTI-T/${symbol}.`,
    errMinimumsNotSet: "Os mínimos do pool ainda não foram definidos.",
    errLedger: (symbol: string, message: string) =>
      `Erro do ledger de ${symbol}: ${message}`,
    errDepositRefunded: (id: string) =>
      `O depósito no pool falhou. O pagamento foi reembolsado, menos as taxas do ledger (cunhagem n.º ${id}).`,
    refundingTitle: "Pagamento em devolução",
    errDepositRefunding: (id: string) =>
      `O depósito no pool falhou. O pagamento está sendo devolvido e, enquanto isso, permanece no saldo da sua carteira (cunhagem n.º ${id}).`,
    errDepositRefundFailed: (id: string) =>
      `O depósito no pool falhou e o reembolso não foi concluído (cunhagem n.º ${id}). Guarde esta referência.`,
    errGeneric: "A cunhagem foi recusada.",
  },
  ko: {
    priceStatement:
      "가격: TTTI-T당 10,000 USD. q TTTI-T의 지불 금액은 20,000 USD × q ÷ 0.99이며 ICP, ckBTC, ckUSDC 또는 ckUSDT로 지불합니다. 최소: 0.0001 TTTI-T.",
    modeLegend: "금액 입력",
    modeTtti: "TTTI-T 수량으로 입력",
    modeUsd: "달러 금액으로 입력",
    tttiLabel: "발행할 TTTI-T",
    tttiHint: "최소 0.0001 TTTI-T, 소수점 8자리까지.",
    usdLabel: "지불할 금액(달러)",
    usdHint: "지불의 달러 가치입니다. TTTI-T 수량은 소수점 8자리로 내림됩니다.",
    invalidTtti:
      "소수점 8자리 이하의 TTTI-T 수량을 입력하세요. 점 또는 쉼표를 사용할 수 있습니다.",
    invalidUsd:
      "0보다 크고 소수점 8자리 이하인 달러 금액을 입력하세요. 점 또는 쉼표를 사용할 수 있습니다.",
    previewHeading: "미리보기",
    previewIdle: "금액을 입력하면 미리보기가 표시됩니다.",
    previewLoading: "미리보기 계산 중…",
    rowMinted: "발행되는 TTTI-T",
    rowPay: "지불 금액",
    splitHeading: "결제 분배",
    rowPosition: "유동성 포지션",
    rowGuarantee: "개인 보증금",
    rowFee: "수수료",
    rowDust: "반올림 잔액",
    poolPriceHeading: "대상 풀 가격, zap 전과 후",
    priceBefore: "이전",
    priceAfter: "이후",
    emptyPool: "빈 풀",
    consolidatedPriceHeading: "통합 가격 (참고)",
    consolidatedPriceNote: "TTTI-T당 USD, 열린 풀의 깊이로 가중.",
    poolPriceNote: "지불 토큰의 TTTI-T 풀에서 TTTI-T당 USD.",
    gapHeading: "풀 가격과 통합 가격의 차이",
    gapUnavailable: "차이를 사용할 수 없음",
    firstDepositNote:
      "빈 풀: 첫 예치는 1 대 1, TTTI-T당 10,000 USD로 이루어집니다.",
    zapLabel: "균형 스왑",
    noZap: "균형 스왑이 필요하지 않습니다.",
    maxPayLabel: "이 허용 범위의 최대 지불액",
    expiryNote: "5분 안에 실행되지 않으면 발행이 거부됩니다.",
    previewFailedTitle: "미리보기를 사용할 수 없음",
    mintFailedTitle: "발행이 완료되지 않았습니다",
    successTitle: (amount: string) => `${amount} 발행됨`,
    successPaid: (pay: string, id: string) => `지불 ${pay} · 발행 #${id}`,
    successPosition: (id: string) => `유동성 포지션 #${id}`,
    successHoldings: (token: string, ttti: string) =>
      `포지션에는 ${token}와(과) ${ttti}이(가) 들어 있습니다.`,
    successGuarantee: (amount: string) => `개인 보증금: ${amount}.`,
    successLink: "내 유동성 포지션 보기",
    errAnonymous: "발행하려면 로그인하거나 지갑을 연결하세요.",
    errRateUnavailable: (symbol: string) =>
      `현재 유효한 ${symbol}/USD 환율이 없습니다. 아무것도 차감되지 않았습니다. 나중에 다시 시도하세요.`,
    errBelowMinimum: (minimum: string) => `최소 수량은 ${minimum}입니다.`,
    errTooManyDecimals: (max: string, step: string) =>
      `TTTI-T 수량은 소수점 ${max}자리까지입니다(최소 단위 ${step}).`,
    errInvalidAmount: "0보다 큰 금액을 입력하세요.",
    errAboveCap: (cap: string, remaining: string) =>
      `총 한도 ${cap}에 도달했거나 초과하게 됩니다. 남은 수량: ${remaining}.`,
    errInsufficientBalance: (
      symbol: string,
      required: string,
      balance: string,
    ) =>
      `${symbol} 잔액 부족: 원장 수수료 포함 ${required} 필요, 사용 가능 ${balance}.`,
    errInsufficientAllowance: (
      symbol: string,
      required: string,
      allowance: string,
    ) =>
      `${symbol} 승인 한도가 부족합니다: ${required} 필요, ${allowance} 승인됨. 다시 승인한 후 재시도하세요.`,
    errSlippageExceeded: (percent: string) =>
      `풀 가격이 허용 범위 ${percent} %를 벗어났습니다. 발행되지 않았습니다. 다시 시도하거나 허용 범위를 높이세요.`,
    errInvalidSlippage: (percent: string) =>
      `허용 범위는 ${percent} %를 넘을 수 없습니다.`,
    errMaxPayExceeded: (pay: string, max: string) =>
      `지불액이 현재 ${pay}로, 미리보기를 기준으로 정한 최대 ${max}를 넘었습니다. 미리보기를 새로고침한 후 재시도하세요.`,
    errDeadlineExpired:
      "발행이 실행되기 전에 5분 기한이 지났습니다. 다시 시도하세요.",
    errInProgress: "이 계정의 발행이 이미 진행 중입니다.",
    errAcknowledgements: "발행하려면 확인 사항에 동의하세요.",
    errSalesPaused: "발행이 일시 중지되었습니다.",
    errDexPaused: "풀이 일시 중지되어 발행할 수 없습니다.",
    errPoolRemoved: (symbol: string) => `TTTI-T/${symbol} 풀이 제거되었습니다.`,
    errRemovalAnnounced: (symbol: string, date: string) =>
      `TTTI-T/${symbol} 풀의 제거가 ${date}에 예정되어 있습니다. 이 풀로의 발행은 중단되었습니다.`,
    errPoolNotFound: (symbol: string) => `TTTI-T/${symbol} 풀이 없습니다.`,
    errMinimumsNotSet: "풀 최소 한도가 아직 설정되지 않았습니다.",
    errLedger: (symbol: string, message: string) =>
      `${symbol} 원장 오류: ${message}`,
    errDepositRefunded: (id: string) =>
      `풀 예치에 실패했습니다. 결제금이 원장 수수료를 제외하고 환불되었습니다(발행 #${id}).`,
    refundingTitle: "결제금 반환 중",
    errDepositRefunding: (id: string) =>
      `풀 예치에 실패했습니다. 결제금이 반환되는 중이며, 그동안 지갑 잔액에 남아 있습니다(발행 #${id}).`,
    errDepositRefundFailed: (id: string) =>
      `풀 예치에 실패했고 환불이 완료되지 않았습니다(발행 #${id}). 이 번호를 보관하세요.`,
    errGeneric: "발행이 거부되었습니다.",
  },
  "pa-Guru": {
    priceStatement:
      "ਕੀਮਤ: ਪ੍ਰਤੀ TTTI-T 10,000 USD। q TTTI-T ਲਈ ਅਦਾ ਕਰਨ ਵਾਲੀ ਰਕਮ 20,000 USD × q ÷ 0.99 ਹੈ, ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ। ਘੱਟੋ-ਘੱਟ: 0.0001 TTTI-T।",
    modeLegend: "ਰਕਮ ਦਰਜ ਕਰਨਾ",
    modeTtti: "TTTI-T ਵਿੱਚ ਰਕਮ",
    modeUsd: "ਡਾਲਰਾਂ ਵਿੱਚ ਰਕਮ",
    tttiLabel: "ਮਿੰਟ ਕਰਨ ਲਈ TTTI-T",
    tttiHint: "ਘੱਟੋ-ਘੱਟ 0.0001 TTTI-T, 8 ਦਸ਼ਮਲਵ ਤੱਕ।",
    usdLabel: "ਅਦਾ ਕਰਨ ਵਾਲੀ ਰਕਮ, ਡਾਲਰਾਂ ਵਿੱਚ",
    usdHint:
      "ਅਦਾਇਗੀ ਦਾ ਡਾਲਰ ਮੁੱਲ। TTTI-T ਦੀ ਮਾਤਰਾ 8 ਦਸ਼ਮਲਵ ਤੱਕ ਹੇਠਾਂ ਵੱਲ ਗੋਲ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",
    invalidTtti:
      "8 ਦਸ਼ਮਲਵ ਤੱਕ TTTI-T ਦੀ ਰਕਮ ਦਰਜ ਕਰੋ। ਬਿੰਦੂ ਜਾਂ ਕਾਮਾ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।",
    invalidUsd:
      "0 ਤੋਂ ਵੱਡੀ ਅਤੇ 8 ਦਸ਼ਮਲਵ ਤੱਕ ਡਾਲਰ ਰਕਮ ਦਰਜ ਕਰੋ। ਬਿੰਦੂ ਜਾਂ ਕਾਮਾ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।",
    previewHeading: "ਝਲਕ",
    previewIdle: "ਝਲਕ ਦੇਖਣ ਲਈ ਰਕਮ ਦਰਜ ਕਰੋ।",
    previewLoading: "ਝਲਕ ਦੀ ਗਣਨਾ ਹੋ ਰਹੀ ਹੈ…",
    rowMinted: "ਮਿੰਟ ਹੋਏ TTTI-T",
    rowPay: "ਤੁਸੀਂ ਅਦਾ ਕਰਦੇ ਹੋ",
    splitHeading: "ਅਦਾਇਗੀ ਦੀ ਵੰਡ",
    rowPosition: "ਲਿਕਵਿਡਿਟੀ ਪੋਜ਼ੀਸ਼ਨ",
    rowGuarantee: "ਨਿੱਜੀ ਗਾਰੰਟੀ",
    rowFee: "ਫੀਸ",
    rowDust: "ਗੋਲ ਕਰਨ ਤੋਂ ਬਚੀ ਰਕਮ",
    poolPriceHeading: "ਨਿਸ਼ਾਨਾ ਪੂਲ ਦੀ ਕੀਮਤ, zap ਤੋਂ ਪਹਿਲਾਂ ਅਤੇ ਬਾਅਦ",
    priceBefore: "ਪਹਿਲਾਂ",
    priceAfter: "ਬਾਅਦ",
    emptyPool: "ਖਾਲੀ ਪੂਲ",
    consolidatedPriceHeading: "ਇਕਸਾਰ ਕੀਮਤ (ਹਵਾਲਾ)",
    consolidatedPriceNote: "ਪ੍ਰਤੀ TTTI-T USD, ਖੁੱਲ੍ਹੇ ਪੂਲਾਂ ਦੀ ਡੂੰਘਾਈ ਅਨੁਸਾਰ ਭਾਰਿਤ।",
    poolPriceNote: "ਅਦਾ ਕੀਤੇ ਟੋਕਨ ਦੇ TTTI-T ਪੂਲ ਵਿੱਚ ਪ੍ਰਤੀ TTTI-T USD।",
    gapHeading: "ਪੂਲ ਕੀਮਤ ਅਤੇ ਇਕਸਾਰ ਕੀਮਤ ਵਿਚਕਾਰ ਅੰਤਰ",
    gapUnavailable: "ਅੰਤਰ ਉਪਲਬਧ ਨਹੀਂ",
    firstDepositNote:
      "ਖਾਲੀ ਪੂਲ: ਪਹਿਲੀ ਜਮ੍ਹਾਂ ਰਕਮ 1 ਤੋਂ 1 ਦੇ ਅਨੁਪਾਤ ਨਾਲ, ਪ੍ਰਤੀ TTTI-T 10,000 USD 'ਤੇ ਹੁੰਦੀ ਹੈ।",
    zapLabel: "ਸੰਤੁਲਨ ਸਵੈਪ",
    noZap: "ਸੰਤੁਲਨ ਸਵੈਪ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।",
    maxPayLabel: "ਇਸ ਸਹਿਣਸ਼ੀਲਤਾ 'ਤੇ ਵੱਧ ਤੋਂ ਵੱਧ ਅਦਾਇਗੀ",
    expiryNote: "ਜੇ ਮਿੰਟ 5 ਮਿੰਟਾਂ ਵਿੱਚ ਪੂਰਾ ਨਾ ਹੋਵੇ ਤਾਂ ਇਹ ਰੱਦ ਕਰ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ।",
    previewFailedTitle: "ਝਲਕ ਉਪਲਬਧ ਨਹੀਂ",
    mintFailedTitle: "ਮਿੰਟ ਪੂਰਾ ਨਹੀਂ ਹੋਇਆ",
    successTitle: (amount: string) => `${amount} ਮਿੰਟ ਹੋਏ`,
    successPaid: (pay: string, id: string) => `ਅਦਾ ਕੀਤਾ ${pay} · ਮਿੰਟ #${id}`,
    successPosition: (id: string) => `ਲਿਕਵਿਡਿਟੀ ਪੋਜ਼ੀਸ਼ਨ #${id}`,
    successHoldings: (token: string, ttti: string) =>
      `ਪੋਜ਼ੀਸ਼ਨ ਵਿੱਚ ${token} ਅਤੇ ${ttti} ਹਨ।`,
    successGuarantee: (amount: string) => `ਨਿੱਜੀ ਗਾਰੰਟੀ: ${amount}।`,
    successLink: "ਮੇਰੀਆਂ ਲਿਕਵਿਡਿਟੀ ਪੋਜ਼ੀਸ਼ਨਾਂ ਵੇਖੋ",
    errAnonymous: "ਮਿੰਟ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ ਜਾਂ ਵਾਲਿਟ ਜੋੜੋ।",
    errRateUnavailable: (symbol: string) =>
      `ਇਸ ਵੇਲੇ ਕੋਈ ਵੈਧ ${symbol}/USD ਦਰ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕੁਝ ਵੀ ਨਹੀਂ ਲਿਆ ਗਿਆ। ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    errBelowMinimum: (minimum: string) => `ਘੱਟੋ-ਘੱਟ ਮਾਤਰਾ ${minimum} ਹੈ।`,
    errTooManyDecimals: (max: string, step: string) =>
      `TTTI-T ਦੀ ਰਕਮ ਵਿੱਚ ਵੱਧ ਤੋਂ ਵੱਧ ${max} ਦਸ਼ਮਲਵ ਹੋ ਸਕਦੇ ਹਨ (ਸਭ ਤੋਂ ਛੋਟਾ ਕਦਮ ${step})।`,
    errInvalidAmount: "0 ਤੋਂ ਵੱਡੀ ਰਕਮ ਦਰਜ ਕਰੋ।",
    errAboveCap: (cap: string, remaining: string) =>
      `ਕੁੱਲ ਸੀਮਾ ${cap} ਪੂਰੀ ਹੋ ਚੁੱਕੀ ਹੈ ਜਾਂ ਟੱਪ ਜਾਵੇਗੀ। ਬਾਕੀ: ${remaining}।`,
    errInsufficientBalance: (
      symbol: string,
      required: string,
      balance: string,
    ) =>
      `${symbol} ਬਕਾਇਆ ਨਾਕਾਫ਼ੀ: ਲੈਜਰ ਫੀਸਾਂ ਸਮੇਤ ${required} ਲੋੜੀਂਦੇ, ${balance} ਉਪਲਬਧ।`,
    errInsufficientAllowance: (
      symbol: string,
      required: string,
      allowance: string,
    ) =>
      `${symbol} ਮਨਜ਼ੂਰੀ ਬਹੁਤ ਘੱਟ ਹੈ: ${required} ਲੋੜੀਂਦੇ, ${allowance} ਮਨਜ਼ੂਰ। ਦੁਬਾਰਾ ਮਨਜ਼ੂਰੀ ਦਿਓ ਅਤੇ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    errSlippageExceeded: (percent: string) =>
      `ਪੂਲ ਕੀਮਤ ${percent} % ਦੀ ਸਹਿਣਸ਼ੀਲਤਾ ਤੋਂ ਬਾਹਰ ਚਲੀ ਗਈ। ਕੁਝ ਵੀ ਮਿੰਟ ਨਹੀਂ ਹੋਇਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਸਹਿਣਸ਼ੀਲਤਾ ਵਧਾਓ।`,
    errInvalidSlippage: (percent: string) =>
      `ਸਹਿਣਸ਼ੀਲਤਾ ${percent} % ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋ ਸਕਦੀ।`,
    errMaxPayExceeded: (pay: string, max: string) =>
      `ਹੁਣ ਅਦਾ ਕਰਨ ਵਾਲੀ ਰਕਮ ${pay} ਹੈ, ਜੋ ਝਲਕ ਤੋਂ ਤੈਅ ਕੀਤੀ ਵੱਧ ਤੋਂ ਵੱਧ ${max} ਤੋਂ ਉੱਪਰ ਹੈ। ਝਲਕ ਤਾਜ਼ਾ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    errDeadlineExpired:
      "ਮਿੰਟ ਪੂਰਾ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ 5 ਮਿੰਟ ਦੀ ਸਮਾਂ-ਸੀਮਾ ਲੰਘ ਗਈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    errInProgress: "ਇਸ ਖਾਤੇ ਤੋਂ ਇੱਕ ਮਿੰਟ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ।",
    errAcknowledgements: "ਮਿੰਟ ਕਰਨ ਲਈ ਪੁਸ਼ਟੀਆਂ ਸਵੀਕਾਰ ਕਰੋ।",
    errSalesPaused: "ਮਿੰਟਿੰਗ ਰੁਕੀ ਹੋਈ ਹੈ।",
    errDexPaused: "ਪੂਲ ਰੁਕੇ ਹੋਏ ਹਨ। ਮਿੰਟਿੰਗ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    errPoolRemoved: (symbol: string) => `TTTI-T/${symbol} ਪੂਲ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ।`,
    errRemovalAnnounced: (symbol: string, date: string) =>
      `TTTI-T/${symbol} ਪੂਲ ਨੂੰ ${date} ਨੂੰ ਹਟਾਉਣ ਦਾ ਐਲਾਨ ਕੀਤਾ ਗਿਆ ਹੈ। ਇਸ ਵਿੱਚ ਮਿੰਟਿੰਗ ਮੁਅੱਤਲ ਹੈ।`,
    errPoolNotFound: (symbol: string) => `TTTI-T/${symbol} ਪੂਲ ਮੌਜੂਦ ਨਹੀਂ ਹੈ।`,
    errMinimumsNotSet: "ਪੂਲ ਦੇ ਘੱਟੋ-ਘੱਟ ਮੁੱਲ ਅਜੇ ਤੈਅ ਨਹੀਂ ਹੋਏ।",
    errLedger: (symbol: string, message: string) =>
      `${symbol} ਲੈਜਰ ਗਲਤੀ: ${message}`,
    errDepositRefunded: (id: string) =>
      `ਪੂਲ ਵਿੱਚ ਜਮ੍ਹਾਂ ਅਸਫਲ ਰਹੀ। ਅਦਾਇਗੀ ਲੈਜਰ ਫੀਸਾਂ ਘਟਾ ਕੇ ਵਾਪਸ ਕਰ ਦਿੱਤੀ ਗਈ (ਮਿੰਟ #${id})।`,
    refundingTitle: "ਅਦਾਇਗੀ ਵਾਪਸ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ",
    errDepositRefunding: (id: string) =>
      `ਪੂਲ ਵਿੱਚ ਜਮ੍ਹਾਂ ਅਸਫਲ ਰਹੀ। ਅਦਾਇਗੀ ਵਾਪਸ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ ਅਤੇ ਇਸ ਦੌਰਾਨ ਤੁਹਾਡੇ ਵਾਲਿਟ ਬਕਾਏ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ (ਮਿੰਟ #${id})।`,
    errDepositRefundFailed: (id: string) =>
      `ਪੂਲ ਵਿੱਚ ਜਮ੍ਹਾਂ ਅਸਫਲ ਰਹੀ ਅਤੇ ਵਾਪਸੀ ਪੂਰੀ ਨਹੀਂ ਹੋਈ (ਮਿੰਟ #${id})। ਇਹ ਹਵਾਲਾ ਸੰਭਾਲ ਕੇ ਰੱਖੋ।`,
    errGeneric: "ਮਿੰਟ ਰੱਦ ਕਰ ਦਿੱਤਾ ਗਿਆ।",
  },
});

/** Pools value versus capitalisation block of the mint screen. */
export const BUY_POOL_CAP_TEXT = defineDict({
  en: {
    title: "Pools value and capitalisation",
    loading: "Loading…",
    loadError: "The figures could not be loaded.",
    retry: "Retry",
    notAvailable: "Not available",
    poolsValue: "Pools value",
    capitalisation: "Capitalisation",
    currentRatio: "Current ratio",
    averageRatio: "24-hour average ratio",
    targetRatio: "Target ratio",
    lockedShare: "Locked share m",
    samples: (count: string) => `${count} samples`,
    computedAt: (date: string) => `Computed ${date}`,
    noteNoPoolsValue: "No pool value: no open TTTI-T pool or no valid rate.",
    noteNoCapitalisation:
      "No capitalisation: no consolidated price or no valid rate.",
    noteNoRatio: "Needs both the pools value and the capitalisation.",
    noteNoAverage: "No ratio sample recorded yet.",
    noteLockedDefault:
      "No retained ratio yet: the locked share is the maximum, 50 %.",
    definitionsToggle: "Definitions",
    defPoolsValue:
      "Pools value: 2 times the counterpart reserve of each TTTI-T pool, at oracle rates.",
    defCapitalisation:
      "Capitalisation: circulating TTTI-T times the instantaneous consolidated price, measured at the same moment as the pools value.",
    defRatio: "Ratio: pools value divided by capitalisation.",
    defLockedShare:
      "Locked share m: derived from the retained ratio, the lower of the current ratio and the 24-hour average.",
  },
  fr: {
    title: "Valeur des pools et capitalisation",
    loading: "Chargement…",
    loadError: "Les chiffres n'ont pas pu être chargés.",
    retry: "Réessayer",
    notAvailable: "Non disponible",
    poolsValue: "Valeur des pools",
    capitalisation: "Capitalisation",
    currentRatio: "Ratio actuel",
    averageRatio: "Ratio moyen sur 24 h",
    targetRatio: "Ratio cible",
    lockedShare: "Part verrouillée m",
    samples: (count: string) => `${count} échantillons`,
    computedAt: (date: string) => `Calculé le ${date}`,
    noteNoPoolsValue:
      "Pas de valeur des pools : aucun pool TTTI-T ouvert ou aucun taux valide.",
    noteNoCapitalisation:
      "Pas de capitalisation : aucun prix consolidé ou aucun taux valide.",
    noteNoRatio: "Nécessite la valeur des pools et la capitalisation.",
    noteNoAverage: "Aucun échantillon de ratio enregistré pour l'instant.",
    noteLockedDefault:
      "Pas encore de ratio retenu : la part verrouillée est au maximum, 50 %.",
    definitionsToggle: "Définitions",
    defPoolsValue:
      "Valeur des pools : 2 fois la réserve de contrepartie de chaque pool TTTI-T, aux taux de l'oracle.",
    defCapitalisation:
      "Capitalisation : TTTI-T en circulation multiplié par le prix consolidé instantané, mesuré au même moment que la valeur des pools.",
    defRatio: "Ratio : valeur des pools divisée par la capitalisation.",
    defLockedShare:
      "Part verrouillée m : déduite du ratio retenu, le plus bas entre le ratio actuel et la moyenne sur 24 h.",
  },
  es: {
    title: "Valor de los pools y capitalización",
    loading: "Cargando…",
    loadError: "No se pudieron cargar las cifras.",
    retry: "Reintentar",
    notAvailable: "No disponible",
    poolsValue: "Valor de los pools",
    capitalisation: "Capitalización",
    currentRatio: "Ratio actual",
    averageRatio: "Ratio medio de 24 horas",
    targetRatio: "Ratio objetivo",
    lockedShare: "Parte bloqueada m",
    samples: (count: string) => `${count} muestras`,
    computedAt: (date: string) => `Calculado el ${date}`,
    noteNoPoolsValue:
      "Sin valor de los pools: ningún pool TTTI-T abierto o ninguna tasa válida.",
    noteNoCapitalisation:
      "Sin capitalización: ningún precio consolidado o ninguna tasa válida.",
    noteNoRatio: "Requiere el valor de los pools y la capitalización.",
    noteNoAverage: "Todavía no hay muestras del ratio.",
    noteLockedDefault:
      "Aún no hay ratio retenido: la parte bloqueada es el máximo, 50 %.",
    definitionsToggle: "Definiciones",
    defPoolsValue:
      "Valor de los pools: 2 veces la reserva de contrapartida de cada pool TTTI-T, a las tasas del oráculo.",
    defCapitalisation:
      "Capitalización: TTTI-T en circulación multiplicado por el precio consolidado instantáneo, medido en el mismo momento que el valor de los pools.",
    defRatio: "Ratio: valor de los pools dividido por la capitalización.",
    defLockedShare:
      "Parte bloqueada m: derivada del ratio retenido, el menor entre el ratio actual y la media de 24 horas.",
  },
  "zh-Hans": {
    title: "资金池价值与市值",
    loading: "加载中…",
    loadError: "无法加载这些数据。",
    retry: "重试",
    notAvailable: "不可用",
    poolsValue: "资金池价值",
    capitalisation: "市值",
    currentRatio: "当前比率",
    averageRatio: "24 小时平均比率",
    targetRatio: "目标比率",
    lockedShare: "锁定份额 m",
    samples: (count: string) => `${count} 个样本`,
    computedAt: (date: string) => `计算时间：${date}`,
    noteNoPoolsValue: "无资金池价值：没有开放的 TTTI-T 资金池或没有有效汇率。",
    noteNoCapitalisation: "无市值：没有综合价格或没有有效汇率。",
    noteNoRatio: "需要资金池价值和市值。",
    noteNoAverage: "尚未记录比率样本。",
    noteLockedDefault: "尚无采用的比率：锁定份额为最大值 50%。",
    definitionsToggle: "定义",
    defPoolsValue:
      "资金池价值：每个 TTTI-T 资金池的对手方储备的 2 倍，按预言机汇率计算。",
    defCapitalisation:
      "市值：流通中的 TTTI-T 乘以即时综合价格，该价格与资金池价值在同一时刻测得。",
    defRatio: "比率：资金池价值除以市值。",
    defLockedShare:
      "锁定份额 m：由采用的比率得出，即当前比率与 24 小时平均值中较低者。",
  },
  "pt-BR": {
    title: "Valor dos pools e capitalização",
    loading: "Carregando…",
    loadError: "Não foi possível carregar os valores.",
    retry: "Tentar novamente",
    notAvailable: "Indisponível",
    poolsValue: "Valor dos pools",
    capitalisation: "Capitalização",
    currentRatio: "Razão atual",
    averageRatio: "Razão média de 24 horas",
    targetRatio: "Razão-alvo",
    lockedShare: "Parcela bloqueada m",
    samples: (count: string) => `${count} amostras`,
    computedAt: (date: string) => `Calculado em ${date}`,
    noteNoPoolsValue:
      "Sem valor dos pools: nenhum pool TTTI-T aberto ou nenhuma taxa válida.",
    noteNoCapitalisation:
      "Sem capitalização: nenhum preço consolidado ou nenhuma taxa válida.",
    noteNoRatio: "Exige o valor dos pools e a capitalização.",
    noteNoAverage: "Nenhuma amostra da razão registrada ainda.",
    noteLockedDefault:
      "Ainda sem razão retida: a parcela bloqueada é o máximo, 50 %.",
    definitionsToggle: "Definições",
    defPoolsValue:
      "Valor dos pools: 2 vezes a reserva da contraparte de cada pool TTTI-T, às taxas do oráculo.",
    defCapitalisation:
      "Capitalização: TTTI-T em circulação multiplicado pelo preço consolidado instantâneo, medido no mesmo momento que o valor dos pools.",
    defRatio: "Razão: valor dos pools dividido pela capitalização.",
    defLockedShare:
      "Parcela bloqueada m: derivada da razão retida, a menor entre a razão atual e a média de 24 horas.",
  },
  ko: {
    title: "풀 가치와 시가총액",
    loading: "불러오는 중…",
    loadError: "수치를 불러오지 못했습니다.",
    retry: "다시 시도",
    notAvailable: "사용할 수 없음",
    poolsValue: "풀 가치",
    capitalisation: "시가총액",
    currentRatio: "현재 비율",
    averageRatio: "24시간 평균 비율",
    targetRatio: "목표 비율",
    lockedShare: "잠금 비중 m",
    samples: (count: string) => `샘플 ${count}개`,
    computedAt: (date: string) => `계산 시각: ${date}`,
    noteNoPoolsValue:
      "풀 가치 없음: 열린 TTTI-T 풀이 없거나 유효한 환율이 없습니다.",
    noteNoCapitalisation:
      "시가총액 없음: 통합 가격이 없거나 유효한 환율이 없습니다.",
    noteNoRatio: "풀 가치와 시가총액이 모두 필요합니다.",
    noteNoAverage: "기록된 비율 샘플이 아직 없습니다.",
    noteLockedDefault: "적용된 비율이 아직 없어 잠금 비중은 최대값 50%입니다.",
    definitionsToggle: "정의",
    defPoolsValue:
      "풀 가치: 각 TTTI-T 풀의 상대 자산 준비금의 2배, 오라클 환율 기준.",
    defCapitalisation:
      "시가총액: 유통 중인 TTTI-T에 즉시 통합 가격을 곱한 값으로, 이 가격은 풀 가치와 같은 시점에 측정됩니다.",
    defRatio: "비율: 풀 가치를 시가총액으로 나눈 값.",
    defLockedShare:
      "잠금 비중 m: 적용된 비율에서 도출되며, 현재 비율과 24시간 평균 중 낮은 값입니다.",
  },
  "pa-Guru": {
    title: "ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਅਤੇ ਪੂੰਜੀਕਰਨ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
    loadError: "ਅੰਕੜੇ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    notAvailable: "ਉਪਲਬਧ ਨਹੀਂ",
    poolsValue: "ਪੂਲਾਂ ਦਾ ਮੁੱਲ",
    capitalisation: "ਪੂੰਜੀਕਰਨ",
    currentRatio: "ਮੌਜੂਦਾ ਅਨੁਪਾਤ",
    averageRatio: "24 ਘੰਟਿਆਂ ਦਾ ਔਸਤ ਅਨੁਪਾਤ",
    targetRatio: "ਟੀਚਾ ਅਨੁਪਾਤ",
    lockedShare: "ਲਾਕ ਕੀਤਾ ਹਿੱਸਾ m",
    samples: (count: string) => `${count} ਨਮੂਨੇ`,
    computedAt: (date: string) => `ਗਣਨਾ ਦਾ ਸਮਾਂ: ${date}`,
    noteNoPoolsValue: "ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਨਹੀਂ: ਕੋਈ ਖੁੱਲ੍ਹਾ TTTI-T ਪੂਲ ਨਹੀਂ ਜਾਂ ਕੋਈ ਵੈਧ ਦਰ ਨਹੀਂ।",
    noteNoCapitalisation: "ਪੂੰਜੀਕਰਨ ਨਹੀਂ: ਕੋਈ ਇਕੱਠੀ ਕੀਮਤ ਨਹੀਂ ਜਾਂ ਕੋਈ ਵੈਧ ਦਰ ਨਹੀਂ।",
    noteNoRatio: "ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਅਤੇ ਪੂੰਜੀਕਰਨ ਦੋਵੇਂ ਲੋੜੀਂਦੇ ਹਨ।",
    noteNoAverage: "ਅਜੇ ਤੱਕ ਕੋਈ ਅਨੁਪਾਤ ਨਮੂਨਾ ਦਰਜ ਨਹੀਂ ਹੋਇਆ।",
    noteLockedDefault: "ਅਜੇ ਕੋਈ ਰੱਖਿਆ ਅਨੁਪਾਤ ਨਹੀਂ: ਲਾਕ ਕੀਤਾ ਹਿੱਸਾ ਵੱਧ ਤੋਂ ਵੱਧ, 50 %, ਹੈ।",
    definitionsToggle: "ਪਰਿਭਾਸ਼ਾਵਾਂ",
    defPoolsValue:
      "ਪੂਲਾਂ ਦਾ ਮੁੱਲ: ਹਰ TTTI-T ਪੂਲ ਦੇ ਸਾਹਮਣੇ ਵਾਲੇ ਰਿਜ਼ਰਵ ਦਾ 2 ਗੁਣਾ, ਔਰੇਕਲ ਦਰਾਂ ਉੱਤੇ।",
    defCapitalisation:
      "ਪੂੰਜੀਕਰਨ: ਚਲਨ ਵਿੱਚ TTTI-T ਗੁਣਾ ਤੁਰੰਤ ਇਕੱਠੀ ਕੀਮਤ, ਜੋ ਪੂਲਾਂ ਦੇ ਮੁੱਲ ਵਾਲੇ ਹੀ ਸਮੇਂ ਮਾਪੀ ਜਾਂਦੀ ਹੈ।",
    defRatio: "ਅਨੁਪਾਤ: ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਭਾਗ ਪੂੰਜੀਕਰਨ।",
    defLockedShare:
      "ਲਾਕ ਕੀਤਾ ਹਿੱਸਾ m: ਰੱਖੇ ਗਏ ਅਨੁਪਾਤ ਤੋਂ ਨਿਕਲਦਾ ਹੈ, ਜੋ ਮੌਜੂਦਾ ਅਨੁਪਾਤ ਅਤੇ 24 ਘੰਟਿਆਂ ਦੀ ਔਸਤ ਵਿੱਚੋਂ ਘੱਟ ਹੈ।",
  },
});
