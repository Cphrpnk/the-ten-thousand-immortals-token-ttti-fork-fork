import type en from "./en";

const ptBR: typeof en = {
  title: "Pools",
  intro:
    "Pools de produto constante mantidos por este contrato. Cada par tem um nível de taxa e sua própria subconta de pool.",
  statusFilling: "Em preenchimento",
  statusActive: "Ativo",
  statusRemoved: "Removido",
  newPairBadge: "Par novo",
  approvalNotRecommendation: "A aprovação de um par não é uma recomendação.",
  tttiPair: "Par TTTI-T",
  utilityPair: "Par utilitário",
  feeTier: "Nível de taxa",
  feeTierBps5: "0,05%",
  feeTierBps30: "0,3%",
  feeTierBps100: "1%",
  poolSubaccount: "Subconta do pool",
  minimumLocked: "Liquidez mínima bloqueada",
  minimumTttiSide: (amount: string) => `${amount} TTTI-T do lado TTTI-T`,
  minimumPerToken: "Mínimo por token, definido pelo admin",
  minimumNotSet: "Ainda não definido",
  firstDepositRule: "O primeiro depósito em um pool vazio não tem mínimo.",
  launchDepthRule: (amount: string) =>
    `As trocas são abertas quando um par TTTI-T tem ${amount} USD de TTTI-T no pool (seu lado TTTI-T ao preço do pool, igual ao seu outro lado à taxa do oráculo), ou quando um par utilitário atinge ${amount} USD de profundidade (os dois lados somados às taxas da hora). Abaixo desse limite, o pool continua em preenchimento: a criação do pool, o depósito, a adição de liquidez, a compra e o mint continuam abertos; apenas as trocas ficam fechadas.`,
  lockedSharesRule:
    "As cotas mínimas bloqueadas, calculadas como √(A×B) no primeiro depósito, pertencem ao contrato para sempre.",
  removedNotice:
    "Este par foi removido. Todas as posições foram liquidadas. As trocas e as adições estão fechadas.",
  protocolStatement:
    "O protocolo nunca coloca uma ordem vinculada ao preço e não cria nenhum TTTI-T para os pools. A liquidez permanente é uma gestão de profundidade: um reequilíbrio mecânico e público da parte do protocolo, nunca condicionado ao preço. A parte do protocolo nas taxas de swap vai em dois terços para o criador e em um terço para a liquidez permanente, que ninguém pode retirar.",
  loading: "Carregando os pools…",
  loadError: "Não foi possível carregar os pools.",
  requestTitle: "Solicitar um par",
  ledgerId: "ID do ledger",
  ledgerIdPlaceholder: "ID do canister ledger",
  ledgerIdInvalid: "Insira um ID de canister ledger válido.",
  counterToken: "Token contraparte",
  counterTokenPlaceholder: "Escolha um token",
  message: "Mensagem",
  messageMax: (max: string) => `No máximo ${max} caracteres.`,
  deposit: (amount: string) => `Depósito: ${amount}`,
  depositApproval: (amount: string, margin: string) =>
    `Antes da solicitação, você autoriza até ${amount} ao contrato: o depósito, uma margem de ${margin} para variações de taxa e a taxa do ledger. Apenas o depósito exato é cobrado. A autorização expira após 15 minutos.`,
  depositRule: (usd: string, ttti: string) =>
    `O depósito é de cerca de ${usd}, o equivalente a ${ttti} TTTI-T ao preço de mint, nas taxas horárias atuais. Se a solicitação for aprovada, ele é devolvido no token pago. Se for recusada, ele é retido e passa para a reserva de liquidez permanente.`,
  payToken: "Token do depósito",
  depositRateUnavailable: (symbol: string) =>
    `A taxa de ${symbol} está indisponível, então o depósito não pode ser calculado.`,
  depositApprovedNote: "O depósito é devolvido no token pago.",
  depositRefusedNote:
    "O depósito é retido e passa para a reserva de liquidez permanente.",
  errPayTokenNotAccepted: (symbol: string) =>
    `${symbol} não é aceito para o depósito.`,
  errDepositRateUnavailable: (symbol: string) =>
    `A taxa de ${symbol} está indisponível ou expirou. Tente novamente mais tarde ou escolha outro token.`,
  errRequestInProgress:
    "Já há uma solicitação da sua conta em andamento. Tente novamente em instantes.",
  approving: "Autorizando…",
  submit: "Enviar solicitação",
  submitting: "Enviando…",
  submitted: "Solicitação enviada.",
  signInNeeded: "Entre para solicitar um par.",
  requestsTitle: "Solicitações",
  myRequestsTitle: "Minhas solicitações",
  noRequests: "Nenhuma solicitação de par.",
  requestStatusPending: "Pendente",
  requestStatusApproved: "Aprovada",
  requestStatusRefused: "Recusada",
  refusedReason: (reason: string) => `Motivo: ${reason}`,
  copiedSymbol: "Símbolo copiado",
  copiedSymbolOf: (symbol: string) => `Símbolo já usado por ${symbol}`,
  errAnonymous: "Entre para solicitar um par.",
  errMessageTooLong: (max: string) =>
    `A mensagem ultrapassa ${max} caracteres.`,
  errInvalidToken: (detail: string) =>
    `Este ledger não pode ser usado: ${detail}`,
  errUnknownCounterToken: "O token contraparte não está disponível.",
  errLedgerUnreachable: (detail: string) =>
    `Não foi possível contatar o ledger: ${detail}`,
  errMissingStandards: (standards: string) =>
    `O ledger não oferece suporte a ${standards}.`,
  errMetadataUnavailable: (detail: string) =>
    `Não foi possível ler os metadados do ledger: ${detail}`,
  errPairExists: "Este par já existe ou já foi solicitado.",
  errTooManyPending: (max: string) =>
    `Você já tem ${max} solicitações pendentes.`,
  errCooldown: (date: string) =>
    `Após uma recusa, uma nova solicitação é possível a partir de ${date}.`,
  errInsufficientAllowance: (allowance: string, required: string) =>
    `A autorização cobre ${allowance}; são necessários ${required}.`,
  errInsufficientFunds: (balance: string) =>
    `Seu saldo (${balance}) não cobre o depósito e a taxa.`,
  errDepositFailed: (detail: string) =>
    `Não foi possível cobrar o depósito: ${detail}`,
  errApprovalFailed: (detail: string) => `A autorização falhou: ${detail}`,
  balancesTitle: "Meus saldos DEX",
  balancesSignIn: "Entre para ver seus saldos DEX.",
  balancesLoading: "Carregando saldos…",
  balancesLoadError: "Não foi possível carregar os saldos.",
  balancesEmpty: "Nenhum saldo DEX.",
  colToken: "Token",
  colAvailable: "Disponível",
  colReserved: "Reservado",
  depositButton: "Depositar",
  withdrawButton: "Sacar",
  depositTitle: (symbol: string) => `Depositar ${symbol}`,
  withdrawTitle: (symbol: string) => `Sacar ${symbol}`,
  amountLabel: "Valor",
  amountPlaceholder: "0,00",
  amountInvalid: "Insira um valor válido.",
  availableAmount: (amount: string) => `Disponível: ${amount}`,
  minimumDeposit: (amount: string) => `Depósito mínimo: ${amount}`,
  minimumWithdrawal: (amount: string) => `Saque mínimo: ${amount}`,
  depositFeeNote: (fee: string) =>
    `Você autoriza ao contrato o valor mais a taxa do ledger (${fee}). A autorização expira após 15 minutos.`,
  withdrawFeeNote: (fee: string) =>
    `A taxa do ledger (${fee}) é descontada do valor sacado.`,
  withdrawReceive: (amount: string) => `Você recebe: ${amount}`,
  confirmDeposit: "Confirmar depósito",
  confirmWithdraw: "Confirmar saque",
  cancel: "Cancelar",
  depositing: "Depositando…",
  withdrawing: "Sacando…",
  depositDone: "Depósito concluído.",
  withdrawDone: "Saque concluído.",
  transfersTitle: "Transferências DEX",
  noTransfers: "Nenhuma transferência DEX.",
  directionDeposit: "Depósito",
  directionWithdrawal: "Saque",
  transferStatusInProgress: "Em andamento",
  transferStatusCompleted: "Concluído",
  transferStatusFailed: "Falhou",
  transferStatusNeedsReview: "A verificar",
  transferBlock: (block: string) => `Bloco ${block}`,
  transferError: (detail: string) => `Erro: ${detail}`,
  memo: "Memo",
  errDexAnonymous: "Entre para depositar ou sacar.",
  errAmountTooSmall: (minimum: string) => `O mínimo é ${minimum}.`,
  errTransferInProgress:
    "Já há uma transferência deste token em andamento. Tente novamente mais tarde.",
  errDexInsufficientAllowance: (allowance: string, required: string) =>
    `A autorização cobre ${allowance}; são necessários ${required}.`,
  errDexInsufficientFunds: (balance: string) =>
    `Seu saldo (${balance}) não cobre o valor e a taxa.`,
  errDexInsufficientBalance: (available: string) =>
    `Seu saldo DEX disponível é ${available}.`,
  errLedger: (detail: string) => `O ledger retornou um erro: ${detail}`,
  errDexApprovalFailed: (detail: string) => `A autorização falhou: ${detail}`,
  lookupTitle: "Saldos DEX por identificador",
  lookupLabel: "Principal",
  lookupPlaceholder: "ID do principal",
  lookupButton: "Consultar",
  lookupInvalid: "Insira um principal válido.",
  lookupEmpty: "Nenhum saldo DEX para este principal.",
  depositSubaccount: "Subconta de depósito",
  copyDepositSubaccount: "Copiar a subconta de depósito",
  copied: "Copiado",
  refundLabel: "Reembolso do depósito",
  refundNone: "Sem reembolso",
  refundInProgress: "Reembolso em andamento",
  refundNeedsReview: "Reembolso a verificar",
  refundRefunded: (block: string) => `Reembolsado (bloco ${block})`,
  privacyPositions:
    "As posições de liquidez são públicas e vinculadas ao seu identificador no TTTI.",
  privacyDeposit: "Seu depósito continua visível na cadeia.",
  gaugeLabel: "Medidor de preenchimento",
  gaugeFilling: (current: string, target: string, remaining: string) =>
    `${current} / ${target} USD — faltam ${remaining} USD para atingir o limite de troca`,
  gaugeOpen: (current: string, target: string) => `${current} / ${target} USD`,
  gaugeUnavailable: "Valor momentaneamente indisponível",
  reserves: "Reservas",
  totalShares: "Total de cotas",
  addLiquidityButton: "Adicionar liquidez",
  swapButton: "Trocar",
  positionsButton: "Posições",
  signInForActions: "Entre para adicionar liquidez ou trocar.",
  pairTokensUnsupported:
    "Liquidez e trocas não estão disponíveis para os tokens deste par.",
  swapsClosedFilling: (gauge: string) =>
    `As trocas ficam fechadas enquanto o pool está em preenchimento: ${gauge}`,
  addTitle: (pair: string) => `Adicionar liquidez · ${pair}`,
  addIntro:
    "Os valores são retirados dos seus saldos DEX disponíveis. As posições de liquidez são públicas e vinculadas ao seu identificador no TTTI. Seu depósito continua visível na cadeia.",
  sideLabel: "Token informado",
  tokenAmountLabel: (symbol: string) => `Valor em ${symbol}`,
  firstDepositNote:
    "Primeiro aporte: informe os dois valores. A proporção entre eles define a proporção do pool.",
  counterComputed: (amount: string) =>
    `Valor do outro lado na proporção do pool: ${amount}`,
  sharesToReceive: (shares: string) => `Cotas a receber: ${shares}`,
  sharesLockedForever: (shares: string) =>
    `Cotas bloqueadas no contrato para sempre: ${shares}`,
  gaugeAfter: (gauge: string) => `Medidor após o aporte: ${gauge}`,
  opensPool: "Este aporte abre o pool para trocas.",
  staysFilling: "O pool continua em preenchimento após este aporte.",
  quoting: "Calculando a cotação…",
  lockLabel: "Duração do bloqueio",
  lockHint: (min: string, max: string) =>
    `Opcional: sem bloqueio por padrão. Um bloqueio dura de ${min} a ${max}. O titular pode prorrogá-lo, nunca encurtá-lo.`,
  lockPreset1d: "1 dia",
  lockPreset7d: "7 dias",
  lockPreset30d: "30 dias",
  lockPreset90d: "90 dias",
  lockPreset3m: "3 meses",
  lockPreset2y: "2 anos",
  lockPreset3y: "3 anos",
  lockPreset4y: "4 anos",
  lockPreset1y: "1 ano",
  lockPreset5y: "5 anos",
  lockCustom: "Personalizado",
  lockCustomDays: "Número de dias",
  lockInvalid: (min: string, max: string) =>
    `Informe uma duração de ${min} a ${max}.`,
  durationDays: (days: string) => `${days} dias`,
  durationOneDay: "1 dia",
  unlockOn: (date: string) => `Desbloqueio: ${date}`,
  confirmAdd: "Adicionar a liquidez",
  adding: "Adicionando liquidez…",
  addDone: (id: string, shares: string) =>
    `Posição nº ${id} criada com ${shares} cotas.`,
  refTitle: "Preço de referência da ICPSwap",
  refQuote: (input: string, output: string) =>
    `Cotação da ICPSwap: ${input} → ${output} (taxa da ICPSwap incluída). Apenas referência.`,
  refDeviation: (pct: string) =>
    `A proporção do seu aporte difere desta referência em ${pct} %.`,
  refDeviationWarning: (pct: string) =>
    `Atenção: a proporção do seu aporte difere da referência da ICPSwap em ${pct} %, mais de 2 %.`,
  refUnavailable:
    "Não existe pool da ICPSwap para este par; o preço de referência está indisponível.",
  refError: "Não foi possível ler o preço de referência da ICPSwap.",
  refLoading: "Lendo o preço da ICPSwap…",
  positionsTitle: (pair: string) => `Posições · ${pair}`,
  positionsEmpty: "Nenhuma posição neste pool.",
  positionsLoading: "Carregando as posições…",
  positionsLoadError: "Não foi possível carregar as posições.",
  colOwner: "Titular",
  colPair: "Par",
  colShares: "Cotas",
  colAmounts: "Valores",
  colLock: "Bloqueio",
  colUnlock: "Desbloqueio",
  creatorBadge: "Criador",
  copyPrincipal: "Copiar o principal",
  unlockedLabel: "Desbloqueada",
  positionLabel: (id: string) => `Posição nº ${id}`,
  myPositionsTitle: "Minhas posições",
  myPositionsEmpty: "Você não tem posição de liquidez.",
  myPositionsNote:
    "Retirar uma posição credita seus saldos DEX. Use Sacar em Meus saldos DEX para enviar os tokens à sua carteira.",
  withdrawPosition: "Retirar",
  withdrawingPosition: "Retirando…",
  positionWithdrawn: (amount0: string, amount1: string) =>
    `Retirado: ${amount0} e ${amount1} creditados nos seus saldos DEX.`,
  lockedUntil: (date: string) => `Bloqueada até ${date}.`,
  removedWithdrawOpen:
    "O saque segue a data de desbloqueio em todos os estados do pool.",
  extendLockButton: "Prorrogar bloqueio",
  extendTitle: (id: string) => `Prorrogar bloqueio · posição nº ${id}`,
  extendCurrent: (date: string) => `Desbloqueio atual: ${date}`,
  extendModeDate: "Data",
  extendModeDays: "Dias",
  extendDateLabel: "Nova data de desbloqueio",
  extendDaysLabel: "Dias somados ao desbloqueio atual",
  extendNewUnlock: (date: string) => `Novo desbloqueio: ${date}`,
  extendTooEarly: "O novo desbloqueio deve ser posterior ao desbloqueio atual.",
  extendTooLate: (date: string) =>
    `O novo desbloqueio não pode ser posterior a ${date}.`,
  confirmExtend: "Confirmar a prorrogação",
  extending: "Prorrogando…",
  extendDone: (date: string) => `Bloqueio prorrogado até ${date}.`,
  swapTitle: (pair: string) => `Trocar · ${pair}`,
  swapIntro:
    "A troca usa seus saldos DEX disponíveis; o valor obtido é creditado neles.",
  swapFrom: "Token vendido",
  swapAmountOut: "Você recebe (estimativa)",
  swapFee: (pct: string) => `Taxa (${pct})`,
  swapPriceImpact: "Impacto no preço",
  swapMinimum: "Mínimo recebido",
  slippageLabel: "Tolerância de slippage (%)",
  slippageInvalid: "Informe uma tolerância de 0 a 50 %.",
  swapDeadlineNote: "O prazo é definido para 5 minutos após a confirmação.",
  confirmSwap: "Confirmar a troca",
  swapping: "Trocando…",
  swapDone: (input: string, output: string) =>
    `${input} trocados por ${output}.`,
  errLiqAnonymous: "Entre para usar os pools.",
  errPoolNotFound: "Este pool não existe.",
  errPoolRemoved: "Este par foi removido. Depósitos e trocas estão bloqueados.",
  errMinimumsNotSet: "Os mínimos deste par ainda não foram definidos.",
  errUnsupportedToken: "Este token não é compatível com o DEX.",
  errZeroAmount: "Informe um valor maior que zero.",
  errCounterAmountRequired: "Primeiro aporte: informe os dois valores.",
  errLiqInsufficientBalance: (available: string, required: string) =>
    `Seu saldo DEX disponível é ${available}; são necessários ${required}.`,
  errBelowMinimum: (minimums: string) =>
    `O aporte está abaixo do mínimo: ${minimums}.`,
  errRatioMismatch: (required: string) =>
    `Na proporção do pool, o valor do outro lado deve ser ${required}.`,
  errLockTooShort: (min: string) =>
    `O bloqueio é curto demais. Mínimo: ${min}.`,
  errLockTooLong: (max: string) => `O bloqueio é longo demais. Máximo: ${max}.`,
  errZeroShares: "Este aporte é pequeno demais para receber cotas.",
  errOperationInProgress:
    "Outra operação está em andamento nesta conta. Tente novamente em instantes.",
  errPositionNotFound: "Esta posição não existe.",
  errNotPositionOwner: "Esta posição pertence a outro principal.",
  errPositionLocked: (date: string) =>
    `Esta posição está bloqueada até ${date}.`,
  errCannotShortenLock: (date: string) =>
    `Um bloqueio não pode ser encurtado. Desbloqueio atual: ${date}.`,
  errUnlockTooLate: (date: string) =>
    `A data de desbloqueio não pode ser posterior a ${date}.`,
  errPoolFilling: (gauge: string) =>
    `O pool ainda está em preenchimento: ${gauge}`,
  errPoolNotOpen: "Este pool não está aberto para trocas.",
  errRateUnavailable:
    "Uma taxa em USD está momentaneamente indisponível; o valor do pool não pode ser verificado.",
  errTokenNotInPool: "Este token não faz parte do par.",
  errInvalidSlippage: (max: string) =>
    `A tolerância de slippage deve ser de no máximo ${max} %.`,
  errSwapInsufficientBalance: (available: string) =>
    `Seu saldo DEX disponível é ${available}.`,
  errInsufficientLiquidity:
    "O pool não tem liquidez suficiente para esta troca.",
  errSlippageExceeded: (out: string, min: string) =>
    `Slippage excedido: a troca daria ${out}, abaixo do mínimo de ${min}. Peça uma nova cotação.`,
  errDeadlineExceeded: (date: string) =>
    `O prazo (${date}) já passou. Confirme novamente.`,
  errDeadlineTooFar: (date: string) =>
    `O prazo está distante demais; o mais tardio aceito é ${date}.`,
  errCall: (detail: string) => `A chamada falhou: ${detail}`,
  bonusTitle: "Bônus em ICP das posições bloqueadas",
  bonusScope:
    "Os bônus em ICP já ganhos pelas posições bloqueadas dos pares TTTI-T continuam resgatáveis. As taxas de troca não adicionam nenhum bônus novo.",
  bonusWeightRule:
    "Peso de uma posição = valor em ICP × tempo de bloqueio restante ÷ 5 anos.",
  bonusObservedNote:
    "O bônus mostra apenas valores observados. Nenhum valor futuro é estimado ou prometido.",
  bonusSignIn: "Entre para ver seu bônus em ICP.",
  bonusLoading: "Carregando o bônus…",
  bonusLoadError: "Não foi possível carregar o bônus.",
  bonusClaimable: (amount: string) => `Disponível para resgate: ${amount}`,
  bonusClaimedTotal: (amount: string) => `Resgatado no total: ${amount}`,
  bonusNoPositions: "Nenhuma posição bloqueada em um par TTTI-T.",
  bonusColPosition: "Posição",
  bonusColValueIcp: "Valor em ICP",
  bonusColRemainingLock: "Bloqueio restante",
  bonusColWeight: "Peso",
  bonusClaimsTitle: "Resgates",
  bonusClaimsEmpty: "Nenhum resgate ainda.",
  claimButton: "Resgatar o bônus em ICP",
  claiming: "Resgatando…",
  claimDone: (amount: string) =>
    `Resgate de ${amount} registrado. O ICP é enviado para sua carteira.`,
  errClaimAnonymous: "Entre para resgatar o bônus.",
  errClaimNothing: "Não há nada para resgatar.",
  errClaimBelowMinimum: (minimum: string) =>
    `O valor disponível está abaixo do mínimo de ${minimum}.`,
  errClaimInProgress:
    "Já há um resgate em andamento. Tente novamente em instantes.",
  protocolLiquidityTitle: "Liquidez do protocolo",
  protocolLiquidityLocked: "Bloqueada para sempre. Não tem meio de saque.",
  protocolLiquidityHeld: (amount0: string, amount1: string) =>
    `Mantido: ${amount0} e ${amount1}`,
  protocolLiquidityFromFees: (amount0: string, amount1: string) =>
    `Das taxas: ${amount0} e ${amount1}`,
  protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
    `Da tesouraria: ${amount0} e ${amount1}`,
  protocolLiquidityShare: (pct: string) => `${pct} % das cotas do pool`,
  protocolLiquidityLastAdded: (date: string) => `Última adição: ${date}`,
  protocolLiquidityNone: "Nenhuma liquidez do protocolo neste pool.",
  dexPausedTitle: "DEX pausada",
  dexPausedNotice: (token: string) =>
    `A DEX está pausada: uma verificação de reservas encontrou um déficit em ${token}. Trocas, depósitos e adições de liquidez estão indisponíveis. Saques e remoções de liquidez continuam disponíveis.`,
  dexPausedTooltip: "Indisponível enquanto a DEX estiver pausada.",
  errDexPaused:
    "A DEX está pausada após uma verificação de reservas. Trocas, depósitos e adições de liquidez estão indisponíveis. Saques e remoções de liquidez continuam disponíveis.",
  navLabel: "Seções da página de pools",
  navPools: "Pools",
  navIndicators: "Indicadores",
  navMyLiquidity: "Minha liquidez",
  navProtocol: "Protocolo",
  navRequests: "Solicitações",
  introShort: "Pools de produto constante mantidos por este contrato.",
  statusWaiting: "Aguardando liquidez",
  statusOpen: "Aberto",
  detailsLabel: "Detalhes",
  addShort: "Adicionar",
  howPoolsWorkTitle: "Como os pools funcionam",
  permanentLiquidity: "Liquidez permanente",
  permanentLiquidityValue: (shares: string, pct: string) =>
    `${shares} cotas (${pct} % do pool)`,
  myLiquiditySignIn:
    "Entre para ver seus saldos na DEX, suas posições de liquidez e as taxas recebidas.",
  rewardsTitle: "Taxas recebidas",
  activityTitle: "Minha atividade",
  activityFilterLabel: "Tipo de atividade",
  filterAll: "Tudo",
  filterTransfers: "Depósitos e saques",
  filterMintFees: "Taxas de mint",
  filterLpBonus: "Bônus LP",
  tokenFilterLabel: "Token",
  allTokens: "Todos os tokens",
  activityEmpty: "Nenhuma atividade para estes filtros.",
  activityLoadError: "Não foi possível carregar sua atividade.",
  entryMintFee: "Resgate de taxas de mint",
  entryLpBonus: "Resgate do bônus LP",
  requestsFilterLabel: "Filtro de solicitações",
  filterRejected: "Recusadas",
  requestsEmptyFiltered: "Nenhuma solicitação para este filtro.",
  poolsEmpty: "Ainda não há pools.",
  depthLabel: "Profundidade",
  depthValue: (usd: string) => `${usd} USD`,
  depthBasisTwice:
    "O dobro do valor em USD do lado diferente de TTTI-T, ao preço do pool.",
  depthBasisSum:
    "Soma dos dois lados em USD, ao preço do pool e às taxas da hora.",
  depthUnavailable:
    "Profundidade momentaneamente indisponível: falta uma taxa USD.",
  depthMissingRate: (tokens: string) => `Taxa ausente: ${tokens}.`,
  thresholdLabel: "Limite de troca",
  thresholdValueTtti: (usd: string) => `${usd} USD de TTTI-T no pool`,
  thresholdProgressTtti: (measured: string, threshold: string) =>
    `${measured} USD de TTTI-T / ${threshold} USD de TTTI-T no pool`,
  thresholdValueDepth: (usd: string) => `${usd} USD de profundidade`,
  thresholdRule: (usd: string) =>
    `As trocas ficam abertas enquanto a profundidade for de pelo menos ${usd} USD e as taxas USD estiverem disponíveis. O limite vale apenas para as trocas e é verificado a cada chamada.`,
  swapStateLabel: "Trocas",
  swapStateOpen: "Abertas",
  swapStateClosed: "Fechadas",
  swapClosedBelowThreshold: (measured: string, threshold: string) =>
    `As trocas estão fechadas: o pool está em ${measured} USD, abaixo do limite de troca de ${threshold}. Elas são abertas assim que esse limite é atingido. Os depósitos, as adições de liquidez e o mint não são afetados.`,
  swapClosedRateUnavailable:
    "As trocas estão fechadas: uma taxa USD está momentaneamente indisponível.",
  swapClosedRemovalAnnounced: (date: string) =>
    `As trocas estão suspensas: a remoção deste par está anunciada para ${date}.`,
  swapClosedRemovalExecuting:
    "As trocas estão fechadas: a remoção deste par está em andamento.",
  swapClosedRemoved: "As trocas estão fechadas: este par foi removido.",
  errDepthBelowThreshold: (measured: string, threshold: string) =>
    `Troca recusada: o pool está em ${measured} USD, abaixo do limite de troca de ${threshold} USD.`,
  errSwapRateUnavailable:
    "Troca recusada: uma taxa USD está momentaneamente indisponível.",
  errRemovalInProgress: (date: string) =>
    `Troca recusada: a remoção deste par está anunciada para ${date}.`,
  errSwapPoolRemoved: "Troca recusada: este par foi removido.",
  fixedSideLabel: "Lado fixo",
  fixedSideHint: "Você informa este valor. Ele não muda.",
  counterSideLabel: "Lado oposto (calculado)",
  counterSideNote:
    "Calculado na proporção do pool no momento do depósito, dentro da tolerância de slippage.",
  counterSideRange: (min: string, max: string) =>
    `Valor oposto aceito: de ${min} a ${max}`,
  addSlippageLabel: "Tolerância de slippage (%)",
  addSlippageHint:
    "Variação máxima do valor oposto entre a cotação e a execução.",
  addSlippageDefault: "Padrão: 0,5 %",
  addSlippageInvalid: (max: string) =>
    `Informe uma tolerância de 0 a ${max} %.`,
  depthAfter: (depth: string) => `Profundidade após o depósito: ${depth} USD`,
  surplusKept: (amount: string) =>
    `Não utilizado: ${amount}. Permanece no seu saldo DEX interno.`,
  addDoneSurplus: (id: string, shares: string, surplus: string) =>
    `Posição nº ${id} criada com ${shares} cotas. Não utilizado: ${surplus}, mantido no seu saldo DEX interno.`,
  errAddInvalidSlippage: (max: string) =>
    `A tolerância de slippage deve ser de no máximo ${max} %.`,
  errAddSlippageExceeded: (
    tolerance: string,
    expected: string,
    actual: string,
  ) =>
    `O valor oposto variou além da tolerância de ${tolerance} %: esperado ${expected}, agora ${actual}. Nada foi debitado; os fundos permanecem no seu saldo interno. Peça uma nova cotação.`,
  errAddReferenceOutOfBand: (
    expected: string,
    deviation: string,
    tolerance: string,
  ) =>
    `A proporção do primeiro depósito difere do preço de referência em ${deviation} %, além da faixa de ${tolerance} %. Esperado: ${expected}. Nada foi debitado; os fundos permanecem no seu saldo interno.`,
  errAddReferenceUnavailable:
    "O preço de referência está indisponível, então o primeiro depósito não pode ser verificado. Nada foi debitado; os fundos permanecem no seu saldo interno.",
  errAddRemovalAnnounced: (date: string) =>
    `As adições de liquidez estão suspensas: a remoção deste par está anunciada para ${date}. Os saques continuam abertos, sujeitos aos bloqueios das posições.`,
  referenceTitle: "Preço de referência",
  referenceIntro: (tolerance: string) =>
    `O primeiro depósito de um pool vazio deve ficar a até ${tolerance} % do preço de referência.`,
  referenceTttiPrice: (price: string) =>
    `Preço de referência do TTTI-T: ${price} USD`,
  referenceExpected: (expected: string) => `Proporção esperada: ${expected}`,
  referenceSourcesTitle: "Fontes",
  referenceColSource: "Fonte",
  referenceColPrice: "Preço (USD)",
  referenceColDepth: "Profundidade (USD)",
  referenceColWeight: "Peso",
  referenceSourceNative: "Pool nativo",
  referenceSourceIcpswap: "ICPSwap",
  referenceReadAt: (date: string) => `Lido em ${date}`,
  referenceTolerance: (pct: string) => `Tolerância: ${pct} %`,
  referenceUtilityBasis: "Os pares utilitários usam as taxas USD da hora.",
  referenceUnavailableNoSource:
    "Preço de referência indisponível: nenhuma fonte pode ser lida.",
  referenceUnavailableRate: (tokens: string) =>
    `Preço de referência indisponível: falta a taxa USD de ${tokens}.`,
  referenceRatesInvalid:
    "As taxas USD da hora não são válidas; a verificação dos pares utilitários está indisponível.",
  referenceWithin: (deviation: string) =>
    `Dentro da faixa: desvio de ${deviation} %.`,
  referenceOutside: (deviation: string, tolerance: string) =>
    `Fora da faixa: desvio de ${deviation} %, tolerância de ${tolerance} %.`,
  referenceNotApplicable:
    "Sem verificação de referência: o pool já contém liquidez.",
  referenceRefresh: "Ler as fontes novamente",
  referenceRefreshing: "Lendo as fontes…",
  referenceRefreshed: (count: string) => `${count} fonte(s) lida(s).`,
  referenceLoading: "Carregando o preço de referência…",
  referenceLoadError: "Não foi possível carregar o preço de referência.",
  lockNone: "Sem bloqueio",
  lockNoneHint: "Sem bloqueio: a posição pode ser sacada a qualquer momento.",
  lockPickerLabel: "Bloqueio (opcional)",
  lockUpTo: (max: string) =>
    `Um bloqueio dura de 3 meses a ${max}. O titular pode prorrogá-lo, nunca encurtá-lo.`,
  lockEnforced:
    "A data de desbloqueio vale em todos os estados do pool, inclusive para um par removido. Ninguém pode cancelar um bloqueio; apenas o revezamento de novos compromissos do pool pode encurtá-lo.",
  positionLiquidated: "Posição liquidada na remoção do par.",
  removalTitle: "Remoção do par",
  removalBadge: "Remoção anunciada",
  removalAnnouncedTitle: "Remoção anunciada",
  removalReasonLabel: "Motivo",
  removalAnnouncedAt: (date: string) => `Anunciada em: ${date}`,
  removalEffectiveAt: (date: string) => `Efetiva em: ${date}`,
  removalRemaining: (remaining: string) => `Tempo restante: ${remaining}`,
  removalSuspendedNotice:
    "As trocas e as adições de liquidez estão suspensas. Os saques continuam abertos, sujeitos aos bloqueios das posições.",
  removalLiquidationNotice:
    "Na data de efeito, todas as posições são liquidadas, inclusive as bloqueadas, e o pool é marcado como removido.",
  removalCancelledTitle: "Remoção cancelada",
  removalCancelledNotice: (date: string) =>
    `A remoção anunciada foi cancelada em ${date}. As trocas e as adições voltam a seguir a profundidade do pool.`,
  removalExecutingTitle: "Remoção em andamento",
  removalExecutingNotice:
    "As posições estão sendo liquidadas. As trocas e as adições estão fechadas.",
  removalCompletedTitle: "Par removido",
  removalCompletedNotice: (date: string) =>
    `Removido em ${date}. Todas as posições foram liquidadas.`,
  removalReviewNotice:
    "Um pagamento cujo resultado não pôde ser confirmado fica na lista de revisão do admin.",
  poolDepthShort: (usd: string) => `Profundidade ${usd} USD`,
  swapsOpenBadge: "Trocas abertas",
  swapsClosedBadge: "Trocas fechadas",
  dexPercentConnect: "Conecte uma carteira para usar a barra.",
  dexPercentLoading: "Carregando saldos…",
  dexPercentUnavailable: "Saldo indisponível.",
  dexPercentNotCover: (fees: string) =>
    `O saldo da carteira e da DEX não cobre as taxas de rede de ${fees}.`,
  dexPercentShare: (symbol: string) => `Parte de ${symbol} (carteira + DEX)`,
  dexPercentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  dexPercentBase: (wallet: string, dex: string, total: string) =>
    `Base: carteira ${wallet} + DEX ${dex} = ${total}`,
  dexPercentComputedOn: (fees: string) =>
    `Calculado sobre o saldo da carteira mais o saldo DEX disponível, menos ${fees} de taxas do ledger sobre a parte retirada da carteira.`,
  slippageFieldHint:
    "Diferença máxima entre o valor da cotação e o valor executado.",
  emptyPoolTitle: "Primeiro depósito de um pool vazio",
  emptyPoolNote:
    "Este pool ainda não tem liquidez. Informe um valor; o outro lado é calculado ao preço de referência e verificado pela tolerância ao adicionar.",
  expectedOtherAmountLabel: (symbol: string) =>
    `Valor esperado de ${symbol} ao preço de referência`,
  expectedOtherAmountUnavailable: "Nenhum preço de referência disponível.",
  addReferenceBlockTitle: "Preço de referência do primeiro depósito",
  poolSwapStateLabel: "Estado das trocas",
  depthBarOpen: "Abertas: o limite de troca foi atingido",
  depthBarClosed: "Fechadas: abaixo do limite de troca",
  depthBarAriaLabel: (pair: string) =>
    `Quantidade de TTTI-T do pool ${pair} em relação ao limite de troca`,
  countdownLabel: "Tempo restante",
  countdownDays: (count: string) => `${count} d`,
  countdownHours: (count: string) => `${count} h`,
  countdownMinutes: (count: string) => `${count} min`,
  countdownSeconds: (count: string) => `${count} s`,
  countdownReached: "A data de vigência foi atingida.",
  recoverHeading: "Seu saldo DEX",
  recoverButton: "Recuperar",
  recoverExplain:
    "O saldo volta para a sua carteira. As taxas do ledger são deduzidas de cada valor.",
  recovering: "Recuperando…",
  recoverDone: (amounts: string) =>
    `Recuperado para a sua carteira: ${amounts}.`,
  recoverNothing: "Não há saldo DEX para recuperar.",
  recoverError: (detail: string) =>
    `Não foi possível recuperar o saldo: ${detail}`,
  durationOneYear: "1 ano",
  durationYears: (count: string) => `${count} anos`,
  durationOneMonth: "1 mês",
  durationMonths: (count: string) => `${count} meses`,
  positionLockCommitted: "Bloqueio comprometido",
  positionLockStart: "Início do bloqueio",
  positionTimeRemaining: "Tempo restante",
  positionRelayReceived: "Revezamento recebido",
  relayReceivedNone: "Nenhum",
  positionFeesCollected: "Taxas arrecadadas",
  pendingPotLabel: "Pote pendente",
  pendingPotNext: (date: string) => `Próxima distribuição: ${date}`,
  pendingPotRunning: "Distribuição em andamento",
  pendingPotNote:
    "O pote contém a metade bloqueada das taxas de LP pagas desde a última distribuição. Ele é distribuído uma vez por dia entre as posições bloqueadas durante o dia.",
  estimatedShareLabel: "Parte estimada de hoje",
  estimatedShareDetail: (fraction: string, date: string) =>
    `${fraction} do dia bloqueada · próxima distribuição ${date}`,
  estimatedShareNote:
    "Estimativa para o dia atual: proporcional ao peso da posição e à fração do dia em que ela está bloqueada. O valor pago depende do pote na próxima distribuição.",
  estimatedShareNone: "Sem tempo bloqueado hoje",
  positionStatus: "Status",
  positionStatusLocked: "Bloqueada",
  positionStatusFree: "Livre",
  positionStatusFreeNoLock: "Livre · sem bloqueio",
  positionFreeAfter: "Livre após revezamento ou vencimento",
  guaranteedDepthLabel: "Profundidade garantida",
  guaranteedDepthHint: "Posições bloqueadas mais liquidez permanente.",
  consolidatedTitle: "Preço consolidado do TTTI-T",
  consolidatedUsd: (price: string) => `${price} USD`,
  consolidatedCurrent: "Preço",
  consolidatedHourly: "Média por hora",
  consolidatedDaily: "Média de 24 h",
  consolidatedSamples: (count: string) => `${count} amostras`,
  consolidatedNotAvailable: "Indisponível",
  consolidatedComputedLabel: "Calculado",
  consolidatedSource: (symbol: string, price: string, weight: string) =>
    `TTTI-T/${symbol}: ${price} USD · peso ${weight}`,
  consolidatedNote:
    "Ponderado pela profundidade dos pools e convertido em USD às taxas horárias atuais.",
  consolidatedUnavailableNoRate:
    "O preço consolidado está indisponível: não há taxa horária válida.",
  consolidatedUnavailableNoPool:
    "O preço consolidado está indisponível: nenhum pool TTTI-T está aberto para trocas.",
  consolidatedLoadError: "Não foi possível carregar o preço consolidado.",
  spreadLabel: "Diferença em relação aos outros pools abertos",
  spreadNoIndependentReference: "Sem referência independente",
  spreadAboveThreshold: (threshold: string) =>
    `Diferença acima de ${threshold} %`,
  spreadReasonEmpty: "Não há liquidez neste pool.",
  spreadReasonNotOpen: "As trocas não estão abertas.",
  spreadReasonNoRate: "Não há taxa horária válida para este par.",
  spreadReasonNoConsolidated: "Não há preço consolidado.",
  spreadReasonLoadError: "Não foi possível carregar as diferenças.",
  poolPriceLabel: "Preço do pool",
  spreadAlertTitle: "Diferença acima do limite",
  spreadAlert: (pool: string, spread: string, threshold: string) =>
    `Pool ${pool}: o preço do pool é comparado ao preço dos outros pools abertos. A diferença é ${spread}, acima do limite de ${threshold} %. Você tem uma posição neste pool.`,
  spreadAlertPrices: (poolPrice: string, consolidated: string) =>
    `Preço do pool ${poolPrice} USD · preço dos outros pools abertos ${consolidated} USD`,
  referenceConsolidatedPrice: (price: string) =>
    `Preço consolidado do TTTI-T: ${price} USD`,
  guaranteedDepthReserves: (amount0: string, amount1: string) =>
    `Reservas garantidas: ${amount0} e ${amount1}`,
  relayTitle: "Revezamento dos compromissos",
  relayExplain:
    "O bloqueio de revezamento é opcional e dura de 3 meses a 5 anos. Um terço do peso de cada novo compromisso alivia as outras posições bloqueadas do pool. Um proprietário pode prorrogar. Uma posição aliviada ou vencida é desbloqueada sem expulsão: permanece no pool como liquidez livre.",
  relayResult: (shortened: string, freed: string) =>
    `Revezamento: ${shortened} posição(ões) encurtada(s), ${freed} liberada(s).`,
  relayResultNone: "Revezamento: nenhuma outra posição foi encurtada.",
  feeSplitTitle: "Divisão das taxas com as posições bloqueadas",
  feeSplitExplain:
    "Metade da taxa dos provedores de liquidez permanece nas reservas, proporcional às cotas. A outra metade é separada e dividida entre as posições bloqueadas segundo o capital × a raiz quadrada de (tempo restante ÷ 5 anos). Apenas as taxas efetivamente pagas são divididas.",
  errExtendRemovalAnnounced: (date: string) =>
    `O bloqueio não pode ser prorrogado: a remoção deste par está anunciada para ${date}.`,
  extendRemainingRule: (min: string, max: string) =>
    `Após a prorrogação, o tempo restante deve estar entre ${min} e ${max}.`,
  extendMaxDate: (date: string) => `Desbloqueio mais tardio possível: ${date}`,
  extendCurrentRemaining: (remaining: string) =>
    `Tempo restante atual: ${remaining}`,
  extendNewRemaining: (remaining: string) =>
    `Tempo restante após a prorrogação: ${remaining}`,
  extendFreeNote:
    "Esta posição não tem bloqueio ativo. Prorrogá-la compromete um novo bloqueio contado a partir de agora.",
  extendRemainingTooShort: (min: string) =>
    `O tempo restante após a prorrogação deve ser de pelo menos ${min}.`,
  extendRemainingTooLong: (max: string) =>
    `O tempo restante após a prorrogação não pode exceder ${max}.`,
  errExtendLockTooShort: (min: string) =>
    `O tempo restante após a prorrogação é inferior ao mínimo de ${min}.`,
  errExtendLockTooLong: (date: string) =>
    `O bloqueio não pode terminar depois de ${date}.`,
  extendRelayNote:
    "Um terço do peso da duração adicionada encurta as outras posições comprometidas do pool. A posição prorrogada não é encurtada pela própria prorrogação.",
  feeSplitProtocolTitle: "Divisão das taxas de swap",
  feeSplitProtocolRule:
    "Uma taxa de swap é dividida em 70 % para os provedores de liquidez e uma parte do protocolo de 30 %.",
  feeSplitLpLine: "70 % da taxa vão para os provedores de liquidez.",
  feeSplitCreatorLine:
    "Dois terços da parte do protocolo (20 % da taxa) vão para o criador.",
  feeSplitPermanentLine:
    "Um terço da parte do protocolo (10 % da taxa) vai para a liquidez permanente, que ninguém pode retirar.",
  feeSplitRouterNote:
    "A taxa de 0,1 % do roteador da ICPSwap segue a mesma divisão.",
  feeSplitMintNote:
    "A taxa de mint de 1 % enche primeiro a reserva de ciclos, até um ano de consumo medido. O restante vai para o criador.",
  transferFeeFixedTitle: "Taxa de transferência do TTTI-T",
  transferFeeFixed:
    "A taxa de transferência do TTTI-T é fixa em 0,000001 TTTI-T e é paga ao criador.",
  boardTitle: "Painel público",
  boardIntro:
    "Números lidos do contrato: reserva de ciclos, liquidez permanente e saldos do criador.",
  boardLoading: "Carregando o painel público…",
  boardLoadError: "Não foi possível carregar o painel público.",
  boardCyclesTitle: "Reserva de ciclos",
  boardCyclesMonths: (months: string) => `${months} meses de consumo medido`,
  boardCyclesTarget: "Meta: um ano de consumo",
  boardCyclesFill: (pct: string) => `${pct} % da meta de um ano`,
  boardCyclesFillAria:
    "Preenchimento da reserva de ciclos rumo à meta de um ano",
  boardCyclesReserve: (amount: string) => `Reserva: ${amount}`,
  boardCyclesBalance: (cycles: string) => `Ciclos do canister: ${cycles}`,
  boardCyclesPending: (amount: string) =>
    `Parte das taxas ainda não repassada à reserva: ${amount}`,
  boardCyclesUnknown:
    "O consumo ainda não foi medido ou falta uma cotação; a cobertura não pode ser calculada.",
  boardTopUpHint: "Qualquer pessoa pode recarregar os ciclos do canister.",
  boardTopUpButton: "Recarregar ciclos",
  boardTopUpRunning: "Recarregando…",
  boardTopUpDone: (cycles: string) =>
    `Recarga concluída. Ciclos do canister: ${cycles}.`,
  boardTopUpNotNeeded: (threshold: string) =>
    `Recarga desnecessária: os ciclos estão acima do limite de ${threshold}.`,
  boardTopUpBusy: "Já há uma recarga em andamento.",
  boardTopUpError: (detail: string) => `A recarga falhou: ${detail}`,
  boardPermanentTitle: "Liquidez permanente",
  boardPermanentIntro:
    "Cotas de pool bloqueadas que ninguém pode retirar. São adicionadas ao pool TTTI-T com menos liquidez e registradas em um diário público.",
  boardPermanentNone: "Ainda não há liquidez permanente.",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `${shares} cotas permanentes (${pct} % do pool)`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `Mantido pelas cotas permanentes: ${amount0} e ${amount1}`,
  boardPermanentValue: (usd: string) => `Valor: ${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `Reservado, aguardando a próxima injeção: ${amounts}`,
  boardPermanentNextPool: (pair: string) => `Próximo pool: ${pair}`,
  boardPermanentThreshold: (amount: string) => `Limite de injeção: ${amount}`,
  boardJournalTitle: "Últimas entradas do diário",
  boardJournalEmpty: "Ainda não há entradas no diário.",
  boardJournalTotal: (count: string) => `${count} entradas`,
  boardJournalColDate: "Data",
  boardJournalColKind: "Tipo",
  boardJournalColAmount: "Valor",
  boardJournalColShares: "Cotas",
  boardJournalColDetail: "Detalhe",
  boardJournalRouteNative: "Pool nativo",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "Anterior",
  boardJournalNext: "Próximo",
  boardJournalRange: (from: string, to: string, total: string) =>
    `${from}–${to} de ${total}`,
  permKindAccrued: "Acumulado",
  permKindRebalanced: "Reequilibrado",
  permKindInjected: "Injetado",
  permKindWaiting: "Em espera",
  permKindFailed: "Falhou",
  permKindAccruedHint:
    "Parte do protocolo reservada para a liquidez permanente.",
  permKindRebalancedHint:
    "Valores reservados trocados rumo à proporção do par.",
  permKindInjectedHint: "Adicionado a um pool como cotas bloqueadas.",
  permKindWaitingHint: "Aguardando uma cotação ou o limite.",
  permKindFailedHint: "A etapa falhou e permanece no diário.",
  boardCreatorTitle: "Saldos do criador",
  boardCreatorIntro:
    "Valores mantidos pelo contrato para o criador, por token, com as taxas recebidas em TTTI-T.",
  boardCreatorNone: "Ainda não há saldos do criador.",
  boardCreatorHeld: "Mantido",
  boardCreatorPaid: "Pago",
  boardCreatorInFlight: "Em trânsito",
  boardCreatorMintFee: "Taxas de mint",
  boardCreatorSwapFee: "Parte das taxas de swap",
  boardCreatorRouterShare: "Parte das taxas do roteador",
  boardCreatorTransferFee: "Taxas de transferência",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `Taxas de transferência recebidas em TTTI-T: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `Saldo da conta de taxas em TTTI-T: ${amount}`,
  boardCreatorLastCredit: (date: string) => `Último crédito: ${date}`,
};
export default ptBR;
