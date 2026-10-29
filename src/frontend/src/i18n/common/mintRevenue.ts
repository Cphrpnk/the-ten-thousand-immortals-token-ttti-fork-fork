import { defineDict } from "../core/dict";

/**
 * Mint revenue: mint price split (101 paid for 100 received), 100/101 sent
 * directly to the admin's wallet, 1/101 in the fee account, mint fee halves, set-aside amounts, liquidity
 * injections, swap fee split and cycles top-up. Shared by the mint page, the
 * Pools page and the corrected white paper. English is authoritative.
 * Numbers, fees and symbols keep identical values in every language; amounts,
 * dates and symbols are passed in already formatted.
 */
export const MINT_REVENUE_TEXT = defineDict({
  en: {
    // Fee rule (mint page, white paper, landing)
    feeHeading: "Mint fee",
    priceRule: "Mint price: 101 paid for 100 received.",
    ownerShare:
      "100/101 is sent directly to the admin's wallet, in the paid token (BTC mints in ckBTC).",
    ownerAccumulates:
      "The paid token's ledger fee is deducted from that share; every send is recorded with its status.",
    feeShare:
      "1/101 stays in a dedicated contract fee account that cannot be withdrawn. It is split in two halves, in the paid token, for the TTTI-T pair of that token with the lowest liquidity.",
    halfLp:
      "Half goes to that pair's liquidity providers, or is set aside when it has none.",
    halfPermanent:
      "Half is added as permanent liquidity once worth 0.001 TTTI-T, with 50% swapped into TTTI-T at bounded slippage, without any price condition.",
    noTttiCreated: "No TTTI-T is created for pools.",
    cyclesRule:
      "When the canister holds less than 20 T cycles, reserve ICP is converted into cycles. The reserve is kept at 2 ICP.",
    // Mint page breakdown
    mintFeeToggle: "How is the payment used?",
    ownerAmount: (amount: string) =>
      `Sent to the admin's wallet (paid token): ${amount}`,
    routerFeeRule:
      "The 0.1% router fee follows the swap fee rule: 70% to liquidity providers and 30% as permanent liquidity. When the native pool has no liquidity provider, the 70% goes to the liquidity providers of the TTTI-T pool with the least liquidity.",
    feeAmount: (amount: string) => `Mint fee (1/101): ${amount}`,
    // Pools page: swap fees and bonuses
    swapFeeSplit:
      "Swap fees: 70% stays in the pool for liquidity providers, 30% is added as permanent liquidity in the same pool.",
    bonusEarnedNote:
      "ICP bonuses already earned remain claimable. Swap fees add no new bonus.",
    // Pools page: mint fee shares of liquidity providers
    mintFeesTitle: "Mint fee shares",
    mintFeesScope:
      "Liquidity providers of the lowest-liquidity TTTI-T pair of each paid token receive half of the mint fee in that token, pro rata. The amounts shown are those actually recorded.",
    mintFeesSignIn: "Sign in to see your mint fee shares.",
    mintFeesLoading: "Loading mint fee shares…",
    mintFeesLoadError: "The mint fee shares could not be loaded.",
    mintFeesEmpty: "No mint fee share yet.",
    colToken: "Token",
    colClaimable: "Claimable",
    colClaimed: "Claimed",
    claimButton: (symbol: string) => `Claim ${symbol}`,
    claiming: "Claiming…",
    claimDone: (amount: string) =>
      `Claim of ${amount} recorded. It is sent to your wallet.`,
    claimsTitle: "Claims",
    claimsEmpty: "No claim yet.",
    statusPending: "Pending",
    statusSent: "Sent",
    statusReview: "Under review",
    statusFailed: "Failed",
    errClaimAnonymous: "Sign in to claim.",
    errClaimNothing: "There is nothing to claim.",
    errClaimBelowFee: (fee: string) =>
      `The claimable amount is below the ledger fee of ${fee}.`,
    errClaimInProgress: "A claim is already in progress. Try again shortly.",
    // Pools page: set-aside amounts
    setAsideTitle: "Set-aside amounts",
    setAsideScope:
      "Mint fee halves waiting to be added as permanent liquidity, and halves set aside for pairs with no liquidity provider.",
    setAsideThreshold: (usd: string) =>
      `Added once worth ${usd} USD (0.001 TTTI-T).`,
    setAsideLoading: "Loading set-aside amounts…",
    setAsideLoadError: "The set-aside amounts could not be loaded.",
    setAsideEmpty: "Nothing set aside.",
    colAmount: "Amount",
    colValue: "Value",
    colReceived: "Received in total",
    colInjected: "Added in total",
    colLastInjection: "Last addition",
    colTargetPool: "Target pool",
    valueUnavailable: "Value momentarily unavailable",
    waitingBelowThreshold: (value: string, threshold: string) =>
      `Waiting: ${value} of ${threshold} USD.`,
    // Pools page: liquidity injections
    injectionsTitle: "Liquidity injections",
    injectionsLoading: "Loading injections…",
    injectionsLoadError: "The injections could not be loaded.",
    injectionsEmpty: "No injection yet.",
    colDate: "Date",
    colPool: "Pool",
    colVenue: "Swap venue",
    colSwapped: "Swapped",
    colTttiReceived: "TTTI-T received",
    colShares: "Shares added",
    colStatus: "Status",
    venueIcpswap: "ICPSwap",
    venueNative: "Native pool",
    injSwapping: "Swapping",
    injAdding: "Adding liquidity",
    injCompleted: "Completed",
    previous: "Previous",
    next: "Next",
    pageOf: (page: string, total: string) => `Page ${page} of ${total}`,
    // Corrected white paper
    wpContentsRevenue: "Mint revenue & fees",
    wpRevenueHeading: "Mint revenue & fees",
    wpReadingP3:
      "For each mint, 101 is paid for 100 received. 100/101 is sent directly to the admin's wallet, in the paid token (BTC mints in ckBTC). 1/101 is the mint fee and stays in a dedicated contract fee account that cannot be withdrawn: half to the liquidity providers of the lowest-liquidity TTTI-T pair of the paid token, or set aside when it has none; half added as permanent liquidity once worth 0.001 TTTI-T. No TTTI-T is created for pools.",
  },
  fr: {
    feeHeading: "Frais de mint",
    priceRule: "Prix du mint : 101 payés pour 100 reçus.",
    ownerShare:
      "100/101 sont envoyés directement au wallet de l'administrateur, dans le jeton payé (les mints en BTC, en ckBTC).",
    ownerAccumulates:
      "Les frais du ledger du jeton payé sont déduits de cette part ; chaque envoi est enregistré avec son statut.",
    feeShare:
      "1/101 reste dans un compte de frais dédié du contrat, sans retrait possible. Il est réparti en deux moitiés, dans le jeton payé, pour la paire TTTI-T de ce jeton dont la liquidité est la plus faible.",
    halfLp:
      "Une moitié va aux fournisseurs de liquidité de cette paire, ou est mise de côté quand elle n'en a aucun.",
    halfPermanent:
      "L'autre moitié est ajoutée en liquidité permanente dès qu'elle vaut 0,001 TTTI-T, dont 50 % échangés en TTTI-T avec un slippage borné, sans aucune condition de prix.",
    noTttiCreated: "Aucun TTTI-T n'est créé pour les pools.",
    cyclesRule:
      "Quand le canister détient moins de 20 T cycles, de l'ICP de la réserve est converti en cycles. La réserve est maintenue à 2 ICP.",
    mintFeeToggle: "Comment le paiement est-il utilisé ?",
    ownerAmount: (amount: string) =>
      `Envoyé au wallet de l'administrateur (jeton payé) : ${amount}`,
    routerFeeRule:
      "Les frais de routeur de 0,1 % suivent la règle des frais d'échange : 70 % aux fournisseurs de liquidité et 30 % en liquidité permanente. Quand le pool natif n'a aucun fournisseur de liquidité, les 70 % vont aux fournisseurs de liquidité du pool TTTI-T le moins liquide.",
    feeAmount: (amount: string) => `Frais de mint (1/101) : ${amount}`,
    swapFeeSplit:
      "Frais d'échange : 70 % restent dans le pool pour les fournisseurs de liquidité, 30 % sont ajoutés en liquidité permanente dans le même pool.",
    bonusEarnedNote:
      "Les bonus en ICP déjà gagnés restent réclamables. Les frais d'échange n'ajoutent aucun nouveau bonus.",
    mintFeesTitle: "Parts des frais de mint",
    mintFeesScope:
      "Les fournisseurs de liquidité de la paire TTTI-T la moins liquide de chaque jeton payé reçoivent la moitié des frais de mint dans ce jeton, au prorata. Les montants affichés sont ceux effectivement enregistrés.",
    mintFeesSignIn: "Connectez-vous pour voir vos parts des frais de mint.",
    mintFeesLoading: "Chargement des parts des frais de mint…",
    mintFeesLoadError:
      "Les parts des frais de mint n'ont pas pu être chargées.",
    mintFeesEmpty: "Aucune part des frais de mint pour l'instant.",
    colToken: "Jeton",
    colClaimable: "Réclamable",
    colClaimed: "Réclamé",
    claimButton: (symbol: string) => `Réclamer ${symbol}`,
    claiming: "Réclamation…",
    claimDone: (amount: string) =>
      `Réclamation de ${amount} enregistrée. Le montant est envoyé à votre wallet.`,
    claimsTitle: "Réclamations",
    claimsEmpty: "Aucune réclamation pour l'instant.",
    statusPending: "En attente",
    statusSent: "Envoyé",
    statusReview: "À vérifier",
    statusFailed: "Échec",
    errClaimAnonymous: "Connectez-vous pour réclamer.",
    errClaimNothing: "Il n'y a rien à réclamer.",
    errClaimBelowFee: (fee: string) =>
      `Le montant réclamable est inférieur aux frais du ledger de ${fee}.`,
    errClaimInProgress:
      "Une réclamation est déjà en cours. Réessayez dans un instant.",
    setAsideTitle: "Montants mis de côté",
    setAsideScope:
      "Moitiés des frais de mint en attente d'ajout en liquidité permanente, et moitiés mises de côté pour les paires sans fournisseur de liquidité.",
    setAsideThreshold: (usd: string) =>
      `Ajouté dès qu'il vaut ${usd} USD (0,001 TTTI-T).`,
    setAsideLoading: "Chargement des montants mis de côté…",
    setAsideLoadError: "Les montants mis de côté n'ont pas pu être chargés.",
    setAsideEmpty: "Rien n'est mis de côté.",
    colAmount: "Montant",
    colValue: "Valeur",
    colReceived: "Reçu au total",
    colInjected: "Ajouté au total",
    colLastInjection: "Dernier ajout",
    colTargetPool: "Pool cible",
    valueUnavailable: "Valeur momentanément indisponible",
    waitingBelowThreshold: (value: string, threshold: string) =>
      `En attente : ${value} sur ${threshold} USD.`,
    injectionsTitle: "Injections de liquidité",
    injectionsLoading: "Chargement des injections…",
    injectionsLoadError: "Les injections n'ont pas pu être chargées.",
    injectionsEmpty: "Aucune injection pour l'instant.",
    colDate: "Date",
    colPool: "Pool",
    colVenue: "Lieu d'échange",
    colSwapped: "Échangé",
    colTttiReceived: "TTTI-T reçus",
    colShares: "Parts ajoutées",
    colStatus: "Statut",
    venueIcpswap: "ICPSwap",
    venueNative: "Pool natif",
    injSwapping: "Échange en cours",
    injAdding: "Ajout de liquidité",
    injCompleted: "Terminé",
    previous: "Précédent",
    next: "Suivant",
    pageOf: (page: string, total: string) => `Page ${page} sur ${total}`,
    wpContentsRevenue: "Revenus du mint et frais",
    wpRevenueHeading: "Revenus du mint et frais",
    wpReadingP3:
      "Pour chaque mint, 101 sont payés pour 100 reçus. 100/101 sont envoyés directement au wallet de l'administrateur, dans le jeton payé (les mints en BTC, en ckBTC). 1/101 constitue les frais de mint et reste dans un compte de frais dédié du contrat, sans retrait possible : une moitié aux fournisseurs de liquidité de la paire TTTI-T la moins liquide du jeton payé, ou mise de côté quand elle n'en a aucun ; l'autre moitié ajoutée en liquidité permanente dès qu'elle vaut 0,001 TTTI-T. Aucun TTTI-T n'est créé pour les pools.",
  },
  es: {
    feeHeading: "Comisión de mint",
    priceRule: "Precio del mint: se pagan 101 por 100 recibidos.",
    ownerShare:
      "100/101 se envían directamente al wallet del administrador, en el token pagado (los mints en BTC, en ckBTC).",
    ownerAccumulates:
      "La comisión del ledger del token pagado se descuenta de esta parte; cada envío se registra con su estado.",
    feeShare:
      "1/101 permanece en una cuenta de comisiones dedicada del contrato, sin posibilidad de retiro. Se divide en dos mitades, en el token pagado, para el par TTTI-T de ese token con la menor liquidez.",
    halfLp:
      "Una mitad va a los proveedores de liquidez de ese par, o se aparta cuando no tiene ninguno.",
    halfPermanent:
      "La otra mitad se añade como liquidez permanente cuando vale 0,001 TTTI-T, con el 50 % intercambiado por TTTI-T con un slippage acotado, sin ninguna condición de precio.",
    noTttiCreated: "No se crea ningún TTTI-T para los pools.",
    cyclesRule:
      "Cuando el canister tiene menos de 20 T cycles, ICP de la reserva se convierte en cycles. La reserva se mantiene en 2 ICP.",
    mintFeeToggle: "¿Cómo se usa el pago?",
    ownerAmount: (amount: string) =>
      `Enviado al wallet del administrador (token pagado): ${amount}`,
    routerFeeRule:
      "La comisión del enrutador del 0,1 % sigue la regla de las comisiones de intercambio: 70 % para los proveedores de liquidez y 30 % como liquidez permanente. Cuando el pool nativo no tiene ningún proveedor de liquidez, el 70 % va a los proveedores de liquidez del pool TTTI-T con menos liquidez.",
    feeAmount: (amount: string) => `Comisión de mint (1/101): ${amount}`,
    swapFeeSplit:
      "Comisiones de intercambio: el 70 % queda en el pool para los proveedores de liquidez, el 30 % se añade como liquidez permanente en el mismo pool.",
    bonusEarnedNote:
      "Los bonos en ICP ya ganados siguen siendo reclamables. Las comisiones de intercambio no añaden ningún bono nuevo.",
    mintFeesTitle: "Partes de la comisión de mint",
    mintFeesScope:
      "Los proveedores de liquidez del par TTTI-T menos líquido de cada token pagado reciben la mitad de la comisión de mint en ese token, a prorrata. Los importes mostrados son los efectivamente registrados.",
    mintFeesSignIn: "Inicie sesión para ver sus partes de la comisión de mint.",
    mintFeesLoading: "Cargando las partes de la comisión de mint…",
    mintFeesLoadError:
      "No se pudieron cargar las partes de la comisión de mint.",
    mintFeesEmpty: "Todavía no hay ninguna parte de la comisión de mint.",
    colToken: "Token",
    colClaimable: "Reclamable",
    colClaimed: "Reclamado",
    claimButton: (symbol: string) => `Reclamar ${symbol}`,
    claiming: "Reclamando…",
    claimDone: (amount: string) =>
      `Reclamación de ${amount} registrada. Se envía a su wallet.`,
    claimsTitle: "Reclamaciones",
    claimsEmpty: "Todavía no hay reclamaciones.",
    statusPending: "Pendiente",
    statusSent: "Enviado",
    statusReview: "Por revisar",
    statusFailed: "Fallido",
    errClaimAnonymous: "Inicie sesión para reclamar.",
    errClaimNothing: "No hay nada que reclamar.",
    errClaimBelowFee: (fee: string) =>
      `El importe reclamable es inferior a la comisión del ledger de ${fee}.`,
    errClaimInProgress:
      "Ya hay una reclamación en curso. Inténtelo de nuevo en un momento.",
    setAsideTitle: "Importes apartados",
    setAsideScope:
      "Mitades de la comisión de mint pendientes de añadirse como liquidez permanente, y mitades apartadas para pares sin proveedor de liquidez.",
    setAsideThreshold: (usd: string) =>
      `Se añade cuando vale ${usd} USD (0,001 TTTI-T).`,
    setAsideLoading: "Cargando los importes apartados…",
    setAsideLoadError: "No se pudieron cargar los importes apartados.",
    setAsideEmpty: "No hay nada apartado.",
    colAmount: "Importe",
    colValue: "Valor",
    colReceived: "Recibido en total",
    colInjected: "Añadido en total",
    colLastInjection: "Última adición",
    colTargetPool: "Pool de destino",
    valueUnavailable: "Valor momentáneamente no disponible",
    waitingBelowThreshold: (value: string, threshold: string) =>
      `En espera: ${value} de ${threshold} USD.`,
    injectionsTitle: "Inyecciones de liquidez",
    injectionsLoading: "Cargando las inyecciones…",
    injectionsLoadError: "No se pudieron cargar las inyecciones.",
    injectionsEmpty: "Todavía no hay inyecciones.",
    colDate: "Fecha",
    colPool: "Pool",
    colVenue: "Lugar de intercambio",
    colSwapped: "Intercambiado",
    colTttiReceived: "TTTI-T recibidos",
    colShares: "Participaciones añadidas",
    colStatus: "Estado",
    venueIcpswap: "ICPSwap",
    venueNative: "Pool nativo",
    injSwapping: "Intercambiando",
    injAdding: "Añadiendo liquidez",
    injCompleted: "Completada",
    previous: "Anterior",
    next: "Siguiente",
    pageOf: (page: string, total: string) => `Página ${page} de ${total}`,
    wpContentsRevenue: "Ingresos del mint y comisiones",
    wpRevenueHeading: "Ingresos del mint y comisiones",
    wpReadingP3:
      "En cada mint se pagan 101 por 100 recibidos. 100/101 se envían directamente al wallet del administrador, en el token pagado (los mints en BTC, en ckBTC). 1/101 es la comisión de mint y permanece en una cuenta de comisiones dedicada del contrato, sin posibilidad de retiro: una mitad para los proveedores de liquidez del par TTTI-T menos líquido del token pagado, o apartada cuando no tiene ninguno; la otra mitad se añade como liquidez permanente cuando vale 0,001 TTTI-T. No se crea ningún TTTI-T para los pools.",
  },
  "zh-Hans": {
    feeHeading: "铸造费用",
    priceRule: "铸造价格：支付 101，获得 100。",
    ownerShare:
      "100/101 以所支付的代币直接发送至管理员的钱包（以 BTC 铸造时为 ckBTC）。",
    ownerAccumulates:
      "所支付代币的账本手续费从该部分中扣除；每次发送均连同其状态一并记录。",
    feeShare:
      "1/101 留在合约专用的费用账户中，该账户不可提取。它以所支付的代币分为两半，用于该代币流动性最低的 TTTI-T 交易对。",
    halfLp:
      "一半归该交易对的流动性提供者；如该交易对没有流动性提供者，则留存。",
    halfPermanent:
      "另一半在价值达到 0.001 TTTI-T 后作为永久流动性加入，其中 50% 以有界滑点兑换为 TTTI-T，且不附带任何价格条件。",
    noTttiCreated: "不会为资金池创建任何 TTTI-T。",
    cyclesRule:
      "当 canister 持有的 cycles 少于 20 T 时，储备中的 ICP 会转换为 cycles。储备保持在 2 ICP。",
    mintFeeToggle: "付款如何使用？",
    ownerAmount: (amount: string) =>
      `发送至管理员的钱包（所支付的代币）：${amount}`,
    routerFeeRule:
      "0.1% 的路由费用遵循兑换费用规则：70% 归流动性提供者，30% 作为永久流动性。原生池没有流动性提供者时，70% 归流动性最低的 TTTI-T 池的流动性提供者。",
    feeAmount: (amount: string) => `铸造费用（1/101）：${amount}`,
    swapFeeSplit:
      "兑换费用：70% 留在资金池中归流动性提供者，30% 作为永久流动性加入同一资金池。",
    bonusEarnedNote: "已获得的 ICP 奖励仍可领取。兑换费用不再产生新的奖励。",
    mintFeesTitle: "铸造费用份额",
    mintFeesScope:
      "每种支付代币中流动性最低的 TTTI-T 交易对的流动性提供者，按比例获得该代币的一半铸造费用。显示的金额为实际记录的金额。",
    mintFeesSignIn: "登录以查看您的铸造费用份额。",
    mintFeesLoading: "正在加载铸造费用份额…",
    mintFeesLoadError: "无法加载铸造费用份额。",
    mintFeesEmpty: "暂无铸造费用份额。",
    colToken: "代币",
    colClaimable: "可领取",
    colClaimed: "已领取",
    claimButton: (symbol: string) => `领取 ${symbol}`,
    claiming: "正在领取…",
    claimDone: (amount: string) =>
      `已记录 ${amount} 的领取，将发送至您的钱包。`,
    claimsTitle: "领取记录",
    claimsEmpty: "暂无领取记录。",
    statusPending: "待处理",
    statusSent: "已发送",
    statusReview: "待核查",
    statusFailed: "失败",
    errClaimAnonymous: "请登录后领取。",
    errClaimNothing: "没有可领取的金额。",
    errClaimBelowFee: (fee: string) => `可领取金额低于账本手续费 ${fee}。`,
    errClaimInProgress: "已有领取正在进行，请稍后再试。",
    setAsideTitle: "留存金额",
    setAsideScope:
      "等待作为永久流动性加入的铸造费用一半，以及为没有流动性提供者的交易对留存的一半。",
    setAsideThreshold: (usd: string) =>
      `价值达到 ${usd} USD（0.001 TTTI-T）后加入。`,
    setAsideLoading: "正在加载留存金额…",
    setAsideLoadError: "无法加载留存金额。",
    setAsideEmpty: "暂无留存。",
    colAmount: "金额",
    colValue: "价值",
    colReceived: "累计收到",
    colInjected: "累计加入",
    colLastInjection: "最近一次加入",
    colTargetPool: "目标资金池",
    valueUnavailable: "价值暂时不可用",
    waitingBelowThreshold: (value: string, threshold: string) =>
      `等待中：${value} / ${threshold} USD。`,
    injectionsTitle: "流动性注入",
    injectionsLoading: "正在加载注入记录…",
    injectionsLoadError: "无法加载注入记录。",
    injectionsEmpty: "暂无注入。",
    colDate: "日期",
    colPool: "资金池",
    colVenue: "兑换场所",
    colSwapped: "已兑换",
    colTttiReceived: "收到的 TTTI-T",
    colShares: "加入的份额",
    colStatus: "状态",
    venueIcpswap: "ICPSwap",
    venueNative: "原生资金池",
    injSwapping: "兑换中",
    injAdding: "正在加入流动性",
    injCompleted: "已完成",
    previous: "上一页",
    next: "下一页",
    pageOf: (page: string, total: string) => `第 ${page} 页，共 ${total} 页`,
    wpContentsRevenue: "铸造收入与费用",
    wpRevenueHeading: "铸造收入与费用",
    wpReadingP3:
      "每次铸造支付 101，获得 100。100/101 以所支付的代币直接发送至管理员的钱包（以 BTC 铸造时为 ckBTC）。1/101 为铸造费用，留在合约专用的费用账户中，该账户不可提取：一半归所支付代币流动性最低的 TTTI-T 交易对的流动性提供者，如没有则留存；另一半在价值达到 0.001 TTTI-T 后作为永久流动性加入。不会为资金池创建任何 TTTI-T。",
  },
  "pt-BR": {
    feeHeading: "Taxa de mint",
    priceRule: "Preço do mint: 101 pagos por 100 recebidos.",
    ownerShare:
      "100/101 são enviados diretamente ao wallet do administrador, no token pago (mints em BTC, em ckBTC).",
    ownerAccumulates:
      "A taxa do ledger do token pago é deduzida dessa parte; cada envio é registrado com o seu status.",
    feeShare:
      "1/101 permanece em uma conta de taxas dedicada do contrato, sem possibilidade de saque. É dividido em duas metades, no token pago, para o par TTTI-T desse token com a menor liquidez.",
    halfLp:
      "Uma metade vai para os provedores de liquidez desse par, ou é reservada quando ele não tem nenhum.",
    halfPermanent:
      "A outra metade é adicionada como liquidez permanente quando vale 0,001 TTTI-T, com 50 % trocados por TTTI-T com slippage limitado, sem nenhuma condição de preço.",
    noTttiCreated: "Nenhum TTTI-T é criado para os pools.",
    cyclesRule:
      "Quando o canister tem menos de 20 T cycles, ICP da reserva é convertido em cycles. A reserva é mantida em 2 ICP.",
    mintFeeToggle: "Como o pagamento é usado?",
    ownerAmount: (amount: string) =>
      `Enviado ao wallet do administrador (token pago): ${amount}`,
    routerFeeRule:
      "A taxa do roteador de 0,1 % segue a regra das taxas de troca: 70 % para os provedores de liquidez e 30 % como liquidez permanente. Quando o pool nativo não tem nenhum provedor de liquidez, os 70 % vão para os provedores de liquidez do pool TTTI-T com menor liquidez.",
    feeAmount: (amount: string) => `Taxa de mint (1/101): ${amount}`,
    swapFeeSplit:
      "Taxas de troca: 70 % ficam no pool para os provedores de liquidez, 30 % são adicionados como liquidez permanente no mesmo pool.",
    bonusEarnedNote:
      "Os bônus em ICP já ganhos continuam resgatáveis. As taxas de troca não adicionam nenhum bônus novo.",
    mintFeesTitle: "Partes da taxa de mint",
    mintFeesScope:
      "Os provedores de liquidez do par TTTI-T menos líquido de cada token pago recebem metade da taxa de mint nesse token, proporcionalmente. Os valores exibidos são os efetivamente registrados.",
    mintFeesSignIn: "Entre para ver suas partes da taxa de mint.",
    mintFeesLoading: "Carregando as partes da taxa de mint…",
    mintFeesLoadError: "Não foi possível carregar as partes da taxa de mint.",
    mintFeesEmpty: "Ainda não há nenhuma parte da taxa de mint.",
    colToken: "Token",
    colClaimable: "Resgatável",
    colClaimed: "Resgatado",
    claimButton: (symbol: string) => `Resgatar ${symbol}`,
    claiming: "Resgatando…",
    claimDone: (amount: string) =>
      `Resgate de ${amount} registrado. O valor é enviado ao seu wallet.`,
    claimsTitle: "Resgates",
    claimsEmpty: "Ainda não há resgates.",
    statusPending: "Pendente",
    statusSent: "Enviado",
    statusReview: "A verificar",
    statusFailed: "Falhou",
    errClaimAnonymous: "Entre para resgatar.",
    errClaimNothing: "Não há nada para resgatar.",
    errClaimBelowFee: (fee: string) =>
      `O valor resgatável é inferior à taxa do ledger de ${fee}.`,
    errClaimInProgress:
      "Já há um resgate em andamento. Tente novamente em instantes.",
    setAsideTitle: "Valores reservados",
    setAsideScope:
      "Metades da taxa de mint aguardando ser adicionadas como liquidez permanente, e metades reservadas para pares sem provedor de liquidez.",
    setAsideThreshold: (usd: string) =>
      `Adicionado quando vale ${usd} USD (0,001 TTTI-T).`,
    setAsideLoading: "Carregando os valores reservados…",
    setAsideLoadError: "Não foi possível carregar os valores reservados.",
    setAsideEmpty: "Nada reservado.",
    colAmount: "Valor",
    colValue: "Valor em USD",
    colReceived: "Recebido no total",
    colInjected: "Adicionado no total",
    colLastInjection: "Última adição",
    colTargetPool: "Pool de destino",
    valueUnavailable: "Valor momentaneamente indisponível",
    waitingBelowThreshold: (value: string, threshold: string) =>
      `Aguardando: ${value} de ${threshold} USD.`,
    injectionsTitle: "Injeções de liquidez",
    injectionsLoading: "Carregando as injeções…",
    injectionsLoadError: "Não foi possível carregar as injeções.",
    injectionsEmpty: "Ainda não há injeções.",
    colDate: "Data",
    colPool: "Pool",
    colVenue: "Local da troca",
    colSwapped: "Trocado",
    colTttiReceived: "TTTI-T recebidos",
    colShares: "Cotas adicionadas",
    colStatus: "Status",
    venueIcpswap: "ICPSwap",
    venueNative: "Pool nativo",
    injSwapping: "Trocando",
    injAdding: "Adicionando liquidez",
    injCompleted: "Concluída",
    previous: "Anterior",
    next: "Próxima",
    pageOf: (page: string, total: string) => `Página ${page} de ${total}`,
    wpContentsRevenue: "Receita do mint e taxas",
    wpRevenueHeading: "Receita do mint e taxas",
    wpReadingP3:
      "Em cada mint, 101 são pagos por 100 recebidos. 100/101 são enviados diretamente ao wallet do administrador, no token pago (mints em BTC, em ckBTC). 1/101 é a taxa de mint e permanece em uma conta de taxas dedicada do contrato, sem possibilidade de saque: metade para os provedores de liquidez do par TTTI-T menos líquido do token pago, ou reservada quando ele não tem nenhum; metade adicionada como liquidez permanente quando vale 0,001 TTTI-T. Nenhum TTTI-T é criado para os pools.",
  },
  ko: {
    feeHeading: "민트 수수료",
    priceRule: "민트 가격: 101을 지불하고 100을 받습니다.",
    ownerShare:
      "100/101은 지불한 토큰으로 관리자의 지갑에 직접 전송됩니다(BTC 민트는 ckBTC로).",
    ownerAccumulates:
      "지불한 토큰의 원장 수수료는 이 몫에서 차감되며, 모든 전송은 상태와 함께 기록됩니다.",
    feeShare:
      "1/101은 인출할 수 없는 컨트랙트 전용 수수료 계정에 남습니다. 이 금액은 지불한 토큰으로 두 절반으로 나뉘며, 해당 토큰의 유동성이 가장 낮은 TTTI-T 페어에 쓰입니다.",
    halfLp:
      "절반은 해당 페어의 유동성 공급자에게 가며, 공급자가 없으면 따로 보관됩니다.",
    halfPermanent:
      "나머지 절반은 0.001 TTTI-T의 가치에 도달하면 영구 유동성으로 추가되며, 그중 50%는 제한된 슬리피지로, 어떠한 가격 조건도 없이 TTTI-T로 교환됩니다.",
    noTttiCreated: "풀을 위해 TTTI-T가 생성되지 않습니다.",
    cyclesRule:
      "canister가 보유한 cycles가 20 T 미만이면 준비금의 ICP가 cycles로 전환됩니다. 준비금은 2 ICP로 유지됩니다.",
    mintFeeToggle: "결제 금액은 어떻게 사용되나요?",
    ownerAmount: (amount: string) =>
      `관리자의 지갑으로 전송(지불한 토큰): ${amount}`,
    routerFeeRule:
      "0.1%의 라우터 수수료는 스왑 수수료 규칙을 따릅니다. 70%는 유동성 공급자에게, 30%는 영구 유동성으로 갑니다. 네이티브 풀에 유동성 공급자가 없으면 70%는 유동성이 가장 낮은 TTTI-T 풀의 유동성 공급자에게 갑니다.",
    feeAmount: (amount: string) => `민트 수수료(1/101): ${amount}`,
    swapFeeSplit:
      "스왑 수수료: 70%는 유동성 공급자를 위해 풀에 남고, 30%는 같은 풀에 영구 유동성으로 추가됩니다.",
    bonusEarnedNote:
      "이미 획득한 ICP 보너스는 계속 청구할 수 있습니다. 스왑 수수료는 새 보너스를 추가하지 않습니다.",
    mintFeesTitle: "민트 수수료 몫",
    mintFeesScope:
      "각 결제 토큰에서 유동성이 가장 낮은 TTTI-T 페어의 유동성 공급자는 해당 토큰으로 민트 수수료의 절반을 비례 배분으로 받습니다. 표시되는 금액은 실제로 기록된 금액입니다.",
    mintFeesSignIn: "민트 수수료 몫을 보려면 로그인하세요.",
    mintFeesLoading: "민트 수수료 몫을 불러오는 중…",
    mintFeesLoadError: "민트 수수료 몫을 불러올 수 없습니다.",
    mintFeesEmpty: "아직 민트 수수료 몫이 없습니다.",
    colToken: "토큰",
    colClaimable: "청구 가능",
    colClaimed: "청구됨",
    claimButton: (symbol: string) => `${symbol} 청구`,
    claiming: "청구 중…",
    claimDone: (amount: string) =>
      `${amount} 청구가 기록되었습니다. 지갑으로 전송됩니다.`,
    claimsTitle: "청구 내역",
    claimsEmpty: "아직 청구 내역이 없습니다.",
    statusPending: "대기 중",
    statusSent: "전송됨",
    statusReview: "확인 필요",
    statusFailed: "실패",
    errClaimAnonymous: "청구하려면 로그인하세요.",
    errClaimNothing: "청구할 금액이 없습니다.",
    errClaimBelowFee: (fee: string) =>
      `청구 가능 금액이 원장 수수료 ${fee}보다 적습니다.`,
    errClaimInProgress: "이미 청구가 진행 중입니다. 잠시 후 다시 시도하세요.",
    setAsideTitle: "따로 보관된 금액",
    setAsideScope:
      "영구 유동성으로 추가되기를 기다리는 민트 수수료 절반과, 유동성 공급자가 없는 페어를 위해 따로 보관된 절반입니다.",
    setAsideThreshold: (usd: string) =>
      `${usd} USD(0.001 TTTI-T)의 가치에 도달하면 추가됩니다.`,
    setAsideLoading: "따로 보관된 금액을 불러오는 중…",
    setAsideLoadError: "따로 보관된 금액을 불러올 수 없습니다.",
    setAsideEmpty: "따로 보관된 금액이 없습니다.",
    colAmount: "금액",
    colValue: "가치",
    colReceived: "총 수령액",
    colInjected: "총 추가액",
    colLastInjection: "마지막 추가",
    colTargetPool: "대상 풀",
    valueUnavailable: "가치를 일시적으로 확인할 수 없음",
    waitingBelowThreshold: (value: string, threshold: string) =>
      `대기 중: ${threshold} USD 중 ${value}.`,
    injectionsTitle: "유동성 주입",
    injectionsLoading: "주입 내역을 불러오는 중…",
    injectionsLoadError: "주입 내역을 불러올 수 없습니다.",
    injectionsEmpty: "아직 주입 내역이 없습니다.",
    colDate: "날짜",
    colPool: "풀",
    colVenue: "스왑 장소",
    colSwapped: "교환됨",
    colTttiReceived: "받은 TTTI-T",
    colShares: "추가된 지분",
    colStatus: "상태",
    venueIcpswap: "ICPSwap",
    venueNative: "기본 풀",
    injSwapping: "교환 중",
    injAdding: "유동성 추가 중",
    injCompleted: "완료",
    previous: "이전",
    next: "다음",
    pageOf: (page: string, total: string) => `${total}페이지 중 ${page}페이지`,
    wpContentsRevenue: "민트 수익 및 수수료",
    wpRevenueHeading: "민트 수익 및 수수료",
    wpReadingP3:
      "민트할 때마다 101을 지불하고 100을 받습니다. 100/101은 지불한 토큰으로 관리자의 지갑에 직접 전송됩니다(BTC 민트는 ckBTC로). 1/101은 민트 수수료이며 인출할 수 없는 컨트랙트 전용 수수료 계정에 남습니다. 절반은 지불한 토큰의 유동성이 가장 낮은 TTTI-T 페어의 유동성 공급자에게 가며, 공급자가 없으면 따로 보관됩니다. 나머지 절반은 0.001 TTTI-T의 가치에 도달하면 영구 유동성으로 추가됩니다. 풀을 위해 TTTI-T가 생성되지 않습니다.",
  },
  "pa-Guru": {
    feeHeading: "ਮਿੰਟ ਫੀਸ",
    priceRule: "ਮਿੰਟ ਕੀਮਤ: 100 ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ 101 ਦਾ ਭੁਗਤਾਨ।",
    ownerShare:
      "100/101 ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਸਿੱਧਾ ਐਡਮਿਨ ਦੇ ਵਾਲਿਟ ਨੂੰ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ (BTC ਮਿੰਟ ckBTC ਵਿੱਚ)।",
    ownerAccumulates:
      "ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ ਲੈਜਰ ਫੀਸ ਇਸ ਹਿੱਸੇ ਵਿੱਚੋਂ ਕੱਟੀ ਜਾਂਦੀ ਹੈ; ਹਰ ਭੇਜਣਾ ਆਪਣੀ ਸਥਿਤੀ ਸਮੇਤ ਦਰਜ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    feeShare:
      "1/101 ਕੰਟਰੈਕਟ ਦੇ ਇੱਕ ਸਮਰਪਿਤ ਫੀਸ ਖਾਤੇ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ, ਜਿਸ ਵਿੱਚੋਂ ਕਢਵਾਇਆ ਨਹੀਂ ਜਾ ਸਕਦਾ। ਇਹ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਦੋ ਅੱਧਿਆਂ ਵਿੱਚ ਵੰਡਿਆ ਜਾਂਦਾ ਹੈ, ਉਸ ਟੋਕਨ ਦੇ ਸਭ ਤੋਂ ਘੱਟ ਲਿਕਵਿਡਿਟੀ ਵਾਲੇ TTTI-T ਜੋੜੇ ਲਈ।",
    halfLp:
      "ਅੱਧਾ ਉਸ ਜੋੜੇ ਦੇ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ ਜਾਂਦਾ ਹੈ, ਜਾਂ ਜਦੋਂ ਕੋਈ ਪ੍ਰਦਾਤਾ ਨਹੀਂ ਹੁੰਦਾ ਤਾਂ ਵੱਖ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।",
    halfPermanent:
      "ਬਾਕੀ ਅੱਧਾ 0.001 TTTI-T ਦੇ ਮੁੱਲ ਤੱਕ ਪਹੁੰਚਣ 'ਤੇ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਵਜੋਂ ਜੋੜਿਆ ਜਾਂਦਾ ਹੈ, ਜਿਸ ਵਿੱਚੋਂ 50% ਸੀਮਤ ਸਲਿੱਪੇਜ ਨਾਲ, ਬਿਨਾਂ ਕਿਸੇ ਕੀਮਤ ਸ਼ਰਤ ਦੇ, TTTI-T ਵਿੱਚ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ।",
    noTttiCreated: "ਪੂਲਾਂ ਲਈ ਕੋਈ TTTI-T ਨਹੀਂ ਬਣਾਇਆ ਜਾਂਦਾ।",
    cyclesRule:
      "ਜਦੋਂ canister ਕੋਲ 20 T cycles ਤੋਂ ਘੱਟ ਹੁੰਦੇ ਹਨ, ਰਿਜ਼ਰਵ ਦਾ ICP cycles ਵਿੱਚ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ। ਰਿਜ਼ਰਵ 2 ICP 'ਤੇ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।",
    mintFeeToggle: "ਭੁਗਤਾਨ ਕਿਵੇਂ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ?",
    ownerAmount: (amount: string) =>
      `ਐਡਮਿਨ ਦੇ ਵਾਲਿਟ ਨੂੰ ਭੇਜਿਆ ਗਿਆ (ਭੁਗਤਾਨ ਕੀਤਾ ਟੋਕਨ): ${amount}`,
    routerFeeRule:
      "0.1% ਰਾਊਟਰ ਫੀਸ ਸਵੈਪ ਫੀਸ ਦੇ ਨਿਯਮ ਦੀ ਪਾਲਣਾ ਕਰਦੀ ਹੈ: 70% ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ ਅਤੇ 30% ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਵਜੋਂ। ਜਦੋਂ ਨੇਟਿਵ ਪੂਲ ਵਿੱਚ ਕੋਈ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾ ਨਹੀਂ ਹੁੰਦਾ, 70% ਸਭ ਤੋਂ ਘੱਟ ਲਿਕਵਿਡਿਟੀ ਵਾਲੇ TTTI-T ਪੂਲ ਦੇ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ ਜਾਂਦਾ ਹੈ।",
    feeAmount: (amount: string) => `ਮਿੰਟ ਫੀਸ (1/101): ${amount}`,
    swapFeeSplit:
      "ਸਵੈਪ ਫੀਸਾਂ: 70% ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਲਈ ਪੂਲ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ, 30% ਉਸੇ ਪੂਲ ਵਿੱਚ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਵਜੋਂ ਜੋੜਿਆ ਜਾਂਦਾ ਹੈ।",
    bonusEarnedNote:
      "ਪਹਿਲਾਂ ਕਮਾਏ ICP ਬੋਨਸ ਕਲੇਮ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ। ਸਵੈਪ ਫੀਸਾਂ ਕੋਈ ਨਵਾਂ ਬੋਨਸ ਨਹੀਂ ਜੋੜਦੀਆਂ।",
    mintFeesTitle: "ਮਿੰਟ ਫੀਸ ਦੇ ਹਿੱਸੇ",
    mintFeesScope:
      "ਹਰ ਭੁਗਤਾਨ ਟੋਕਨ ਦੇ ਸਭ ਤੋਂ ਘੱਟ ਲਿਕਵਿਡਿਟੀ ਵਾਲੇ TTTI-T ਜੋੜੇ ਦੇ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾ ਉਸ ਟੋਕਨ ਵਿੱਚ ਮਿੰਟ ਫੀਸ ਦਾ ਅੱਧਾ ਹਿੱਸਾ ਅਨੁਪਾਤ ਅਨੁਸਾਰ ਪ੍ਰਾਪਤ ਕਰਦੇ ਹਨ। ਦਿਖਾਈਆਂ ਗਈਆਂ ਰਕਮਾਂ ਉਹੀ ਹਨ ਜੋ ਅਸਲ ਵਿੱਚ ਦਰਜ ਕੀਤੀਆਂ ਗਈਆਂ ਹਨ।",
    mintFeesSignIn: "ਆਪਣੇ ਮਿੰਟ ਫੀਸ ਦੇ ਹਿੱਸੇ ਦੇਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    mintFeesLoading: "ਮਿੰਟ ਫੀਸ ਦੇ ਹਿੱਸੇ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…",
    mintFeesLoadError: "ਮਿੰਟ ਫੀਸ ਦੇ ਹਿੱਸੇ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    mintFeesEmpty: "ਹਾਲੇ ਕੋਈ ਮਿੰਟ ਫੀਸ ਹਿੱਸਾ ਨਹੀਂ।",
    colToken: "ਟੋਕਨ",
    colClaimable: "ਕਲੇਮ ਯੋਗ",
    colClaimed: "ਕਲੇਮ ਕੀਤਾ",
    claimButton: (symbol: string) => `${symbol} ਕਲੇਮ ਕਰੋ`,
    claiming: "ਕਲੇਮ ਹੋ ਰਿਹਾ ਹੈ…",
    claimDone: (amount: string) =>
      `${amount} ਦਾ ਕਲੇਮ ਦਰਜ ਹੋ ਗਿਆ। ਇਹ ਤੁਹਾਡੇ ਵਾਲਿਟ ਨੂੰ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ।`,
    claimsTitle: "ਕਲੇਮ",
    claimsEmpty: "ਹਾਲੇ ਕੋਈ ਕਲੇਮ ਨਹੀਂ।",
    statusPending: "ਬਕਾਇਆ",
    statusSent: "ਭੇਜਿਆ ਗਿਆ",
    statusReview: "ਜਾਂਚ ਅਧੀਨ",
    statusFailed: "ਅਸਫਲ",
    errClaimAnonymous: "ਕਲੇਮ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    errClaimNothing: "ਕਲੇਮ ਕਰਨ ਲਈ ਕੁਝ ਨਹੀਂ ਹੈ।",
    errClaimBelowFee: (fee: string) => `ਕਲੇਮ ਯੋਗ ਰਕਮ ${fee} ਦੀ ਲੈਜਰ ਫੀਸ ਤੋਂ ਘੱਟ ਹੈ।`,
    errClaimInProgress:
      "ਇੱਕ ਕਲੇਮ ਪਹਿਲਾਂ ਹੀ ਚੱਲ ਰਿਹਾ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    setAsideTitle: "ਵੱਖ ਰੱਖੀਆਂ ਰਕਮਾਂ",
    setAsideScope:
      "ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਵਜੋਂ ਜੋੜੇ ਜਾਣ ਦੀ ਉਡੀਕ ਕਰ ਰਹੇ ਮਿੰਟ ਫੀਸ ਦੇ ਅੱਧੇ ਹਿੱਸੇ, ਅਤੇ ਬਿਨਾਂ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾ ਵਾਲੇ ਜੋੜਿਆਂ ਲਈ ਵੱਖ ਰੱਖੇ ਅੱਧੇ ਹਿੱਸੇ।",
    setAsideThreshold: (usd: string) =>
      `${usd} USD (0.001 TTTI-T) ਦੇ ਮੁੱਲ ਤੱਕ ਪਹੁੰਚਣ 'ਤੇ ਜੋੜਿਆ ਜਾਂਦਾ ਹੈ।`,
    setAsideLoading: "ਵੱਖ ਰੱਖੀਆਂ ਰਕਮਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ…",
    setAsideLoadError: "ਵੱਖ ਰੱਖੀਆਂ ਰਕਮਾਂ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀਆਂ।",
    setAsideEmpty: "ਕੁਝ ਵੀ ਵੱਖ ਨਹੀਂ ਰੱਖਿਆ ਗਿਆ।",
    colAmount: "ਰਕਮ",
    colValue: "ਮੁੱਲ",
    colReceived: "ਕੁੱਲ ਪ੍ਰਾਪਤ",
    colInjected: "ਕੁੱਲ ਜੋੜਿਆ",
    colLastInjection: "ਆਖਰੀ ਜੋੜ",
    colTargetPool: "ਟੀਚਾ ਪੂਲ",
    valueUnavailable: "ਮੁੱਲ ਫਿਲਹਾਲ ਉਪਲਬਧ ਨਹੀਂ",
    waitingBelowThreshold: (value: string, threshold: string) =>
      `ਉਡੀਕ ਵਿੱਚ: ${threshold} USD ਵਿੱਚੋਂ ${value}।`,
    injectionsTitle: "ਲਿਕਵਿਡਿਟੀ ਇੰਜੈਕਸ਼ਨ",
    injectionsLoading: "ਇੰਜੈਕਸ਼ਨ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…",
    injectionsLoadError: "ਇੰਜੈਕਸ਼ਨ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    injectionsEmpty: "ਹਾਲੇ ਕੋਈ ਇੰਜੈਕਸ਼ਨ ਨਹੀਂ।",
    colDate: "ਮਿਤੀ",
    colPool: "ਪੂਲ",
    colVenue: "ਸਵੈਪ ਸਥਾਨ",
    colSwapped: "ਬਦਲਿਆ ਗਿਆ",
    colTttiReceived: "ਪ੍ਰਾਪਤ TTTI-T",
    colShares: "ਜੋੜੇ ਗਏ ਸ਼ੇਅਰ",
    colStatus: "ਸਥਿਤੀ",
    venueIcpswap: "ICPSwap",
    venueNative: "ਮੂਲ ਪੂਲ",
    injSwapping: "ਬਦਲਿਆ ਜਾ ਰਿਹਾ ਹੈ",
    injAdding: "ਲਿਕਵਿਡਿਟੀ ਜੋੜੀ ਜਾ ਰਹੀ ਹੈ",
    injCompleted: "ਪੂਰਾ ਹੋਇਆ",
    previous: "ਪਿਛਲਾ",
    next: "ਅਗਲਾ",
    pageOf: (page: string, total: string) => `ਪੰਨਾ ${page} / ${total}`,
    wpContentsRevenue: "ਮਿੰਟ ਆਮਦਨ ਅਤੇ ਫੀਸਾਂ",
    wpRevenueHeading: "ਮਿੰਟ ਆਮਦਨ ਅਤੇ ਫੀਸਾਂ",
    wpReadingP3:
      "ਹਰ ਮਿੰਟ ਲਈ, 100 ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ 101 ਦਾ ਭੁਗਤਾਨ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। 100/101 ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਸਿੱਧਾ ਐਡਮਿਨ ਦੇ ਵਾਲਿਟ ਨੂੰ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ (BTC ਮਿੰਟ ckBTC ਵਿੱਚ)। 1/101 ਮਿੰਟ ਫੀਸ ਹੈ ਅਤੇ ਕੰਟਰੈਕਟ ਦੇ ਇੱਕ ਸਮਰਪਿਤ ਫੀਸ ਖਾਤੇ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ, ਜਿਸ ਵਿੱਚੋਂ ਕਢਵਾਇਆ ਨਹੀਂ ਜਾ ਸਕਦਾ: ਅੱਧਾ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੇ ਸਭ ਤੋਂ ਘੱਟ ਲਿਕਵਿਡਿਟੀ ਵਾਲੇ TTTI-T ਜੋੜੇ ਦੇ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ, ਜਾਂ ਕੋਈ ਪ੍ਰਦਾਤਾ ਨਾ ਹੋਣ 'ਤੇ ਵੱਖ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ; ਅੱਧਾ 0.001 TTTI-T ਦੇ ਮੁੱਲ ਤੱਕ ਪਹੁੰਚਣ 'ਤੇ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਵਜੋਂ ਜੋੜਿਆ ਜਾਂਦਾ ਹੈ। ਪੂਲਾਂ ਲਈ ਕੋਈ TTTI-T ਨਹੀਂ ਬਣਾਇਆ ਜਾਂਦਾ।",
  },
});
