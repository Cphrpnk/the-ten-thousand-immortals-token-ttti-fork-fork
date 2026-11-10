import { defineDict } from "../core/dict";

/**
 * Mint revenue: mint price (10,000 USD per TTTI-T), the creator share (1% of
 * the amount paid, after the cycles reserve), the router fee following the
 * swap fee split (70% to liquidity providers, the 30% protocol share two thirds
 * to the creator and one third to permanent liquidity), cycles top-up,
 * set-aside amounts, liquidity injections and the "Legacy" label for mint fee
 * payouts already paid. Shared by the mint page, the Pools page and the
 * corrected white paper. English is authoritative.
 * Numbers, fees and symbols keep identical values in every language; amounts,
 * dates and symbols are passed in already formatted.
 */
export const MINT_REVENUE_TEXT = defineDict({
  en: {
    // Fee rule (mint page, white paper, landing)
    feeHeading: "Mint fee",
    priceRule:
      "Mint cost: (10,000 USD + the liquidity contributed) × q ÷ 0.99 for q TTTI-T.",
    ownerShare:
      "1% of the amount paid goes to the creator, after the cycles reserve, in the paid token (BTC mints in ckBTC).",
    ownerAccumulates:
      "The paid token's ledger fee is deducted from that share; every send is recorded with its status.",
    feeShare:
      "The 1% is taken from the amount paid. It tops up the cycles reserve first; the remainder is sent to the creator, in the paid token.",
    noTttiCreated: "No TTTI-T is created for pools.",
    cyclesRule:
      "When the canister holds less than 20 T cycles, reserve ICP is converted into cycles. The reserve is kept at 2 ICP.",
    // Mint page breakdown
    routerFeeRule:
      "The 0.1% router fee follows the swap fee split: 70% to liquidity providers; the 30% protocol share goes two thirds to the creator and one third to permanent liquidity. When the native pool has no liquidity provider, the 70% goes to the liquidity providers of the TTTI-T pool with the least liquidity.",
    // Pools page: swap fees and bonuses
    swapFeeSplit:
      "Swap fees: 70% goes to liquidity providers. The 30% protocol share goes two thirds to the creator and one third to permanent liquidity.",
    bonusEarnedNote:
      "ICP bonuses already earned remain claimable. Swap fees add no new bonus.",
    // Pools page: mint fee payouts already paid (history only)
    legacyLabel: "Legacy",
    colToken: "Token",
    statusPending: "Pending",
    statusSent: "Sent",
    statusReview: "Under review",
    statusFailed: "Failed",
    // Pools page: set-aside amounts
    setAsideTitle: "Set-aside amounts",
    setAsideScope:
      "Amounts waiting to be added as permanent liquidity: deposits of refused pair requests, in the token paid, and the one-third protocol share of the router fee.",
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
  },
  fr: {
    feeHeading: "Frais de mint",
    priceRule:
      "Coût du mint : (10 000 USD + la liquidité apportée) × q ÷ 0,99 pour q TTTI-T.",
    ownerShare:
      "1 % du montant payé va au créateur, après la réserve de cycles, dans le jeton payé (les mints en BTC, en ckBTC).",
    ownerAccumulates:
      "Les frais du ledger du jeton payé sont déduits de cette part ; chaque envoi est enregistré avec son statut.",
    feeShare:
      "Le 1 % est prélevé sur le montant payé. Il complète d'abord la réserve de cycles ; le reste est envoyé au créateur, dans le jeton payé.",
    noTttiCreated: "Aucun TTTI-T n'est créé pour les pools.",
    cyclesRule:
      "Quand le canister détient moins de 20 T cycles, de l'ICP de la réserve est converti en cycles. La réserve est maintenue à 2 ICP.",
    routerFeeRule:
      "Les frais de routeur de 0,1 % suivent la répartition des frais d'échange : 70 % aux fournisseurs de liquidité ; la part de 30 % du protocole va pour deux tiers au créateur et pour un tiers à la liquidité permanente. Quand le pool natif n'a aucun fournisseur de liquidité, les 70 % vont aux fournisseurs de liquidité du pool TTTI-T le moins liquide.",
    swapFeeSplit:
      "Frais d'échange : 70 % vont aux fournisseurs de liquidité. La part de 30 % du protocole va pour deux tiers au créateur et pour un tiers à la liquidité permanente.",
    bonusEarnedNote:
      "Les bonus en ICP déjà gagnés restent réclamables. Les frais d'échange n'ajoutent aucun nouveau bonus.",
    legacyLabel: "Ancien",
    colToken: "Jeton",
    statusPending: "En attente",
    statusSent: "Envoyé",
    statusReview: "À vérifier",
    statusFailed: "Échec",
    setAsideTitle: "Montants mis de côté",
    setAsideScope:
      "Montants en attente d'ajout en liquidité permanente : dépôts des demandes de paire refusées, dans le token payé, et part protocole d'un tiers des frais du routeur.",
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
  },
  es: {
    feeHeading: "Comisión de mint",
    priceRule:
      "Coste del mint: (10 000 USD + la liquidez aportada) × q ÷ 0,99 por q TTTI-T.",
    ownerShare:
      "El 1 % del importe pagado va al creador, después de la reserva de ciclos, en el token pagado (los mints en BTC, en ckBTC).",
    ownerAccumulates:
      "La comisión del ledger del token pagado se descuenta de esta parte; cada envío se registra con su estado.",
    feeShare:
      "El 1 % se toma del importe pagado. Completa primero la reserva de ciclos; el resto se envía al creador, en el token pagado.",
    noTttiCreated: "No se crea ningún TTTI-T para los pools.",
    cyclesRule:
      "Cuando el canister tiene menos de 20 T cycles, ICP de la reserva se convierte en cycles. La reserva se mantiene en 2 ICP.",
    routerFeeRule:
      "La comisión del enrutador del 0,1 % sigue el reparto de las comisiones de intercambio: 70 % para los proveedores de liquidez; la parte del 30 % del protocolo va en dos tercios al creador y en un tercio a la liquidez permanente. Cuando el pool nativo no tiene ningún proveedor de liquidez, el 70 % va a los proveedores de liquidez del pool TTTI-T con menos liquidez.",
    swapFeeSplit:
      "Comisiones de intercambio: el 70 % va a los proveedores de liquidez. La parte del 30 % del protocolo va en dos tercios al creador y en un tercio a la liquidez permanente.",
    bonusEarnedNote:
      "Los bonos en ICP ya ganados siguen siendo reclamables. Las comisiones de intercambio no añaden ningún bono nuevo.",
    legacyLabel: "Antiguo",
    colToken: "Token",
    statusPending: "Pendiente",
    statusSent: "Enviado",
    statusReview: "Por revisar",
    statusFailed: "Fallido",
    setAsideTitle: "Importes apartados",
    setAsideScope:
      "Importes pendientes de añadirse como liquidez permanente: depósitos de solicitudes de par rechazadas, en el token pagado, y la parte de protocolo de un tercio de la comisión del enrutador.",
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
  },
  "zh-Hans": {
    feeHeading: "铸造费用",
    priceRule:
      "铸造成本：铸造 q 个 TTTI-T 为（10,000 USD + 所投入的流动性）× q ÷ 0.99。",
    ownerShare:
      "所付金额的 1% 归创建者，在 cycles 储备之后，以所支付的代币计（以 BTC 铸造时为 ckBTC）。",
    ownerAccumulates:
      "所支付代币的账本手续费从该部分中扣除；每次发送均连同其状态一并记录。",
    feeShare:
      "1% 从所付金额中扣取。它首先补充 cycles 储备；其余部分以所支付的代币发送给创建者。",
    noTttiCreated: "不会为资金池创建任何 TTTI-T。",
    cyclesRule:
      "当 canister 持有的 cycles 少于 20 T 时，储备中的 ICP 会转换为 cycles。储备保持在 2 ICP。",
    routerFeeRule:
      "0.1% 的路由费用遵循兑换费用的分配：70% 归流动性提供者；协议的 30% 份额中，三分之二归创建者，三分之一归永久流动性。原生池没有流动性提供者时，70% 归流动性最低的 TTTI-T 池的流动性提供者。",
    swapFeeSplit:
      "兑换费用：70% 归流动性提供者。协议的 30% 份额中，三分之二归创建者，三分之一归永久流动性。",
    bonusEarnedNote: "已获得的 ICP 加成仍可领取。兑换费用不再产生新的加成。",
    legacyLabel: "旧版",
    colToken: "代币",
    statusPending: "待处理",
    statusSent: "已发送",
    statusReview: "待核查",
    statusFailed: "失败",
    setAsideTitle: "留存金额",
    setAsideScope:
      "等待作为永久流动性加入的金额：被拒绝的交易对申请的押金（以已支付的代币计），以及路由器费用中协议份额的三分之一。",
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
  },
  "pt-BR": {
    feeHeading: "Taxa de mint",
    priceRule:
      "Custo do mint: (10.000 USD + a liquidez aportada) × q ÷ 0,99 por q TTTI-T.",
    ownerShare:
      "1 % do valor pago vai para o criador, após a reserva de ciclos, no token pago (mints em BTC, em ckBTC).",
    ownerAccumulates:
      "A taxa do ledger do token pago é deduzida dessa parte; cada envio é registrado com o seu status.",
    feeShare:
      "O 1 % é retirado do valor pago. Ele completa primeiro a reserva de ciclos; o restante é enviado ao criador, no token pago.",
    noTttiCreated: "Nenhum TTTI-T é criado para os pools.",
    cyclesRule:
      "Quando o canister tem menos de 20 T cycles, ICP da reserva é convertido em cycles. A reserva é mantida em 2 ICP.",
    routerFeeRule:
      "A taxa do roteador de 0,1 % segue a divisão das taxas de troca: 70 % para os provedores de liquidez; a parte de 30 % do protocolo vai, em dois terços, para o criador e, em um terço, para a liquidez permanente. Quando o pool nativo não tem nenhum provedor de liquidez, os 70 % vão para os provedores de liquidez do pool TTTI-T com menor liquidez.",
    swapFeeSplit:
      "Taxas de troca: 70 % vão para os provedores de liquidez. A parte de 30 % do protocolo vai, em dois terços, para o criador e, em um terço, para a liquidez permanente.",
    bonusEarnedNote:
      "Os bônus em ICP já ganhos continuam resgatáveis. As taxas de troca não adicionam nenhum bônus novo.",
    legacyLabel: "Legado",
    colToken: "Token",
    statusPending: "Pendente",
    statusSent: "Enviado",
    statusReview: "A verificar",
    statusFailed: "Falhou",
    setAsideTitle: "Valores reservados",
    setAsideScope:
      "Valores aguardando ser adicionados como liquidez permanente: depósitos de solicitações de par recusadas, no token pago, e a parte de protocolo de um terço da taxa do roteador.",
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
  },
  ko: {
    feeHeading: "민트 수수료",
    priceRule: "민트 비용: q TTTI-T당 (10,000 USD + 제공한 유동성) × q ÷ 0.99.",
    ownerShare:
      "지불 금액의 1%는 사이클 준비금을 제외하고 지불한 토큰으로 창작자에게 돌아갑니다(BTC 민트는 ckBTC로).",
    ownerAccumulates:
      "지불한 토큰의 원장 수수료는 이 몫에서 차감되며, 모든 전송은 상태와 함께 기록됩니다.",
    feeShare:
      "1%는 지불 금액에서 차감됩니다. 먼저 사이클 준비금을 채우고, 나머지는 지불한 토큰으로 창작자에게 전송됩니다.",
    noTttiCreated: "풀을 위해 TTTI-T가 생성되지 않습니다.",
    cyclesRule:
      "canister가 보유한 cycles가 20 T 미만이면 준비금의 ICP가 cycles로 전환됩니다. 준비금은 2 ICP로 유지됩니다.",
    routerFeeRule:
      "0.1%의 라우터 수수료는 스왑 수수료 배분을 따릅니다. 70%는 유동성 공급자에게 갑니다. 프로토콜 몫인 30% 중 3분의 2는 창작자에게, 3분의 1은 영구 유동성에 배정됩니다. 네이티브 풀에 유동성 공급자가 없으면 70%는 유동성이 가장 낮은 TTTI-T 풀의 유동성 공급자에게 갑니다.",
    swapFeeSplit:
      "스왑 수수료: 70%는 유동성 공급자에게 돌아갑니다. 프로토콜 몫인 30% 중 3분의 2는 창작자에게, 3분의 1은 영구 유동성에 배정됩니다.",
    bonusEarnedNote:
      "이미 획득한 ICP 보너스는 계속 청구할 수 있습니다. 스왑 수수료는 새 보너스를 추가하지 않습니다.",
    legacyLabel: "이전 방식",
    colToken: "토큰",
    statusPending: "대기 중",
    statusSent: "전송됨",
    statusReview: "확인 필요",
    statusFailed: "실패",
    setAsideTitle: "따로 보관된 금액",
    setAsideScope:
      "영구 유동성으로 추가되기를 기다리는 금액입니다: 거절된 페어 요청의 예치금(지불한 토큰 기준)과 라우터 수수료 중 프로토콜 몫의 3분의 1.",
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
  },
  "pa-Guru": {
    feeHeading: "ਮਿੰਟ ਫੀਸ",
    priceRule:
      "ਮਿੰਟ ਦੀ ਲਾਗਤ: q TTTI-T ਲਈ (10,000 USD + ਦਿੱਤੀ ਲਿਕਵਿਡਿਟੀ) × q ÷ 0.99।",
    ownerShare:
      "ਅਦਾ ਕੀਤੀ ਰਕਮ ਦਾ 1% ਸਾਈਕਲ ਰਿਜ਼ਰਵ ਤੋਂ ਬਾਅਦ, ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਨਿਰਮਾਤਾ ਨੂੰ ਜਾਂਦਾ ਹੈ (BTC ਮਿੰਟ ckBTC ਵਿੱਚ)।",
    ownerAccumulates:
      "ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ ਲੈਜਰ ਫੀਸ ਇਸ ਹਿੱਸੇ ਵਿੱਚੋਂ ਕੱਟੀ ਜਾਂਦੀ ਹੈ; ਹਰ ਭੇਜਣਾ ਆਪਣੀ ਸਥਿਤੀ ਸਮੇਤ ਦਰਜ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    feeShare:
      "1% ਅਦਾ ਕੀਤੀ ਰਕਮ ਵਿੱਚੋਂ ਲਿਆ ਜਾਂਦਾ ਹੈ। ਇਹ ਪਹਿਲਾਂ ਸਾਈਕਲ ਰਿਜ਼ਰਵ ਨੂੰ ਪੂਰਾ ਕਰਦਾ ਹੈ; ਬਾਕੀ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਨਿਰਮਾਤਾ ਨੂੰ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ।",
    noTttiCreated: "ਪੂਲਾਂ ਲਈ ਕੋਈ TTTI-T ਨਹੀਂ ਬਣਾਇਆ ਜਾਂਦਾ।",
    cyclesRule:
      "ਜਦੋਂ canister ਕੋਲ 20 T cycles ਤੋਂ ਘੱਟ ਹੁੰਦੇ ਹਨ, ਰਿਜ਼ਰਵ ਦਾ ICP cycles ਵਿੱਚ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ। ਰਿਜ਼ਰਵ 2 ICP 'ਤੇ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।",
    routerFeeRule:
      "0.1% ਰਾਊਟਰ ਫੀਸ ਸਵੈਪ ਫੀਸਾਂ ਦੀ ਵੰਡ ਦੀ ਪਾਲਣਾ ਕਰਦੀ ਹੈ: 70% ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ; ਪ੍ਰੋਟੋਕੋਲ ਦੇ 30% ਹਿੱਸੇ ਦਾ ਦੋ ਤਿਹਾਈ ਨਿਰਮਾਤਾ ਨੂੰ ਅਤੇ ਇੱਕ ਤਿਹਾਈ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਨੂੰ ਜਾਂਦਾ ਹੈ। ਜਦੋਂ ਨੇਟਿਵ ਪੂਲ ਵਿੱਚ ਕੋਈ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾ ਨਹੀਂ ਹੁੰਦਾ, 70% ਸਭ ਤੋਂ ਘੱਟ ਲਿਕਵਿਡਿਟੀ ਵਾਲੇ TTTI-T ਪੂਲ ਦੇ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ ਜਾਂਦਾ ਹੈ।",
    swapFeeSplit:
      "ਸਵੈਪ ਫੀਸਾਂ: 70% ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ ਜਾਂਦਾ ਹੈ। ਪ੍ਰੋਟੋਕੋਲ ਦੇ 30% ਹਿੱਸੇ ਦਾ ਦੋ ਤਿਹਾਈ ਨਿਰਮਾਤਾ ਨੂੰ ਅਤੇ ਇੱਕ ਤਿਹਾਈ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਨੂੰ ਜਾਂਦਾ ਹੈ।",
    bonusEarnedNote:
      "ਪਹਿਲਾਂ ਕਮਾਏ ICP ਬੋਨਸ ਕਲੇਮ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ। ਸਵੈਪ ਫੀਸਾਂ ਕੋਈ ਨਵਾਂ ਬੋਨਸ ਨਹੀਂ ਜੋੜਦੀਆਂ।",
    legacyLabel: "ਪੁਰਾਣਾ",
    colToken: "ਟੋਕਨ",
    statusPending: "ਬਕਾਇਆ",
    statusSent: "ਭੇਜਿਆ ਗਿਆ",
    statusReview: "ਜਾਂਚ ਅਧੀਨ",
    statusFailed: "ਅਸਫਲ",
    setAsideTitle: "ਵੱਖ ਰੱਖੀਆਂ ਰਕਮਾਂ",
    setAsideScope:
      "ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਵਜੋਂ ਜੋੜੇ ਜਾਣ ਦੀ ਉਡੀਕ ਕਰ ਰਹੀਆਂ ਰਕਮਾਂ: ਰੱਦ ਕੀਤੀਆਂ ਜੋੜੀ ਬੇਨਤੀਆਂ ਦੇ ਡਿਪਾਜ਼ਿਟ (ਅਦਾ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ), ਅਤੇ ਰਾਊਟਰ ਫੀਸ ਦੇ ਪ੍ਰੋਟੋਕੋਲ ਹਿੱਸੇ ਦਾ ਇੱਕ ਤਿਹਾਈ।",
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
  },
});
