import type en from "./en";

const es: typeof en = {
  title: "Pools",
  intro:
    "Pools de producto constante en poder de este contrato. Cada par tiene un nivel de comisión y su propia subcuenta de pool.",
  statusFilling: "En llenado",
  statusActive: "Activo",
  statusRemoved: "Retirado",
  newPairBadge: "Par nuevo",
  approvalNotRecommendation: "La aprobación de un par no es una recomendación.",
  tttiPair: "Par TTTI-T",
  utilityPair: "Par utilitario",
  feeTier: "Nivel de comisión",
  feeTierBps5: "0,05 %",
  feeTierBps30: "0,3 %",
  feeTierBps100: "1 %",
  poolSubaccount: "Subcuenta del pool",
  minimumLocked: "Liquidez mínima bloqueada",
  minimumTttiSide: (amount: string) => `${amount} TTTI-T del lado TTTI-T`,
  minimumPerToken: "Mínimo por token, fijado por el admin",
  minimumNotSet: "Aún no fijado",
  firstDepositRule: "El primer depósito en un pool vacío no tiene mínimo.",
  launchDepthRule: (amount: string) =>
    `Los intercambios se abren cuando un par TTTI-T tiene ${amount} USD de TTTI-T en el pool (su lado TTTI-T al precio del pool, igual a su otro lado a la tasa del oráculo), o cuando un par utilitario alcanza ${amount} USD de profundidad (ambos lados sumados a las tasas de la hora). Por debajo de este umbral el pool sigue en llenado: la creación del pool, el depósito, la adición de liquidez, la compra y el mint siguen abiertos; solo los intercambios están cerrados.`,
  lockedSharesRule:
    "Las participaciones mínimas bloqueadas, calculadas como √(A×B) en el primer depósito, pertenecen al contrato para siempre.",
  removedNotice:
    "Este par ha sido retirado. Todas las posiciones se liquidaron. Los intercambios y las adiciones están cerrados.",
  protocolStatement:
    "El protocolo nunca coloca una orden vinculada al precio y no crea ningún TTTI-T para los pools. La liquidez permanente es una gestión de la profundidad: un reequilibrio mecánico y público de la parte del protocolo, nunca condicionado al precio. La parte del protocolo en las comisiones de swap va en dos tercios al creador y en un tercio a la liquidez permanente, que nadie puede retirar.",
  loading: "Cargando los pools…",
  loadError: "No se pudieron cargar los pools.",
  requestTitle: "Solicitar un par",
  ledgerId: "ID del ledger",
  ledgerIdPlaceholder: "ID del canister ledger",
  ledgerIdInvalid: "Introduzca un ID de canister ledger válido.",
  counterToken: "Token contraparte",
  counterTokenPlaceholder: "Elija un token",
  message: "Mensaje",
  messageMax: (max: string) => `${max} caracteres como máximo.`,
  deposit: (amount: string) => `Depósito: ${amount}`,
  depositApproval: (amount: string, margin: string) =>
    `Antes de la solicitud, usted autoriza hasta ${amount} al contrato: el depósito, un margen del ${margin} por variaciones de tasa y la comisión del ledger. Solo se cobra el depósito exacto. La autorización vence a los 15 minutos.`,
  depositRule: (usd: string, ttti: string) =>
    `El depósito es de unos ${usd}, el equivalente de ${ttti} TTTI-T al precio de mint, con las tasas horarias vigentes. Si la solicitud se aprueba, se devuelve en el token pagado. Si se rechaza, se conserva y pasa a la reserva de liquidez permanente.`,
  payToken: "Token del depósito",
  depositRateUnavailable: (symbol: string) =>
    `La tasa de ${symbol} no está disponible, por lo que no se puede calcular el depósito.`,
  depositApprovedNote: "El depósito se devuelve en el token pagado.",
  depositRefusedNote:
    "El depósito se conserva y pasa a la reserva de liquidez permanente.",
  errPayTokenNotAccepted: (symbol: string) =>
    `${symbol} no se acepta para el depósito.`,
  errDepositRateUnavailable: (symbol: string) =>
    `La tasa de ${symbol} no está disponible o ha vencido. Inténtelo más tarde o elija otro token.`,
  errRequestInProgress:
    "Ya hay una solicitud de su cuenta en curso. Inténtelo de nuevo en un momento.",
  approving: "Autorizando…",
  submit: "Enviar la solicitud",
  submitting: "Enviando…",
  submitted: "Solicitud enviada.",
  signInNeeded: "Inicie sesión para solicitar un par.",
  requestsTitle: "Solicitudes",
  myRequestsTitle: "Mis solicitudes",
  noRequests: "No hay solicitudes de par.",
  requestStatusPending: "Pendiente",
  requestStatusApproved: "Aprobada",
  requestStatusRefused: "Rechazada",
  refusedReason: (reason: string) => `Motivo: ${reason}`,
  copiedSymbol: "Símbolo copiado",
  copiedSymbolOf: (symbol: string) => `Símbolo ya usado por ${symbol}`,
  errAnonymous: "Inicie sesión para solicitar un par.",
  errMessageTooLong: (max: string) =>
    `El mensaje supera los ${max} caracteres.`,
  errInvalidToken: (detail: string) =>
    `Este ledger no se puede usar: ${detail}`,
  errUnknownCounterToken: "El token contraparte no está disponible.",
  errLedgerUnreachable: (detail: string) =>
    `No se pudo contactar con el ledger: ${detail}`,
  errMissingStandards: (standards: string) =>
    `El ledger no admite ${standards}.`,
  errMetadataUnavailable: (detail: string) =>
    `No se pudieron leer los metadatos del ledger: ${detail}`,
  errPairExists: "Este par ya existe o ya fue solicitado.",
  errTooManyPending: (max: string) => `Ya tiene ${max} solicitudes pendientes.`,
  errCooldown: (date: string) =>
    `Tras un rechazo, una nueva solicitud es posible a partir del ${date}.`,
  errInsufficientAllowance: (allowance: string, required: string) =>
    `La autorización cubre ${allowance}; se requieren ${required}.`,
  errInsufficientFunds: (balance: string) =>
    `Su saldo (${balance}) no cubre el depósito y la comisión.`,
  errDepositFailed: (detail: string) =>
    `No se pudo cobrar el depósito: ${detail}`,
  errApprovalFailed: (detail: string) => `La autorización falló: ${detail}`,
  balancesTitle: "Mis saldos DEX",
  balancesSignIn: "Inicie sesión para ver sus saldos DEX.",
  balancesLoading: "Cargando saldos…",
  balancesLoadError: "No se pudieron cargar los saldos.",
  balancesEmpty: "Ningún saldo DEX.",
  colToken: "Token",
  colAvailable: "Disponible",
  colReserved: "Reservado",
  depositButton: "Depositar",
  withdrawButton: "Retirar",
  depositTitle: (symbol: string) => `Depositar ${symbol}`,
  withdrawTitle: (symbol: string) => `Retirar ${symbol}`,
  amountLabel: "Importe",
  amountPlaceholder: "0,00",
  amountInvalid: "Introduzca un importe válido.",
  availableAmount: (amount: string) => `Disponible: ${amount}`,
  minimumDeposit: (amount: string) => `Depósito mínimo: ${amount}`,
  minimumWithdrawal: (amount: string) => `Retiro mínimo: ${amount}`,
  depositFeeNote: (fee: string) =>
    `Usted autoriza al contrato el importe más la comisión del ledger (${fee}). La autorización caduca a los 15 minutos.`,
  withdrawFeeNote: (fee: string) =>
    `La comisión del ledger (${fee}) se descuenta del importe retirado.`,
  withdrawReceive: (amount: string) => `Usted recibe: ${amount}`,
  confirmDeposit: "Confirmar el depósito",
  confirmWithdraw: "Confirmar el retiro",
  cancel: "Cancelar",
  depositing: "Depositando…",
  withdrawing: "Retirando…",
  depositDone: "Depósito completado.",
  withdrawDone: "Retiro completado.",
  transfersTitle: "Transferencias DEX",
  noTransfers: "Ninguna transferencia DEX.",
  directionDeposit: "Depósito",
  directionWithdrawal: "Retiro",
  transferStatusInProgress: "En curso",
  transferStatusCompleted: "Completado",
  transferStatusFailed: "Fallido",
  transferStatusNeedsReview: "Por verificar",
  transferBlock: (block: string) => `Bloque ${block}`,
  transferError: (detail: string) => `Error: ${detail}`,
  memo: "Memo",
  errDexAnonymous: "Inicie sesión para depositar o retirar.",
  errAmountTooSmall: (minimum: string) => `El mínimo es ${minimum}.`,
  errTransferInProgress:
    "Ya hay una transferencia de este token en curso. Inténtelo más tarde.",
  errDexInsufficientAllowance: (allowance: string, required: string) =>
    `La autorización cubre ${allowance}; se requieren ${required}.`,
  errDexInsufficientFunds: (balance: string) =>
    `Su saldo (${balance}) no cubre el importe y la comisión.`,
  errDexInsufficientBalance: (available: string) =>
    `Su saldo DEX disponible es ${available}.`,
  errLedger: (detail: string) => `El ledger devolvió un error: ${detail}`,
  errDexApprovalFailed: (detail: string) => `La autorización falló: ${detail}`,
  lookupTitle: "Saldos DEX por identificador",
  lookupLabel: "Principal",
  lookupPlaceholder: "ID del principal",
  lookupButton: "Consultar",
  lookupInvalid: "Introduzca un principal válido.",
  lookupEmpty: "Ningún saldo DEX para este principal.",
  depositSubaccount: "Subcuenta de depósito",
  copyDepositSubaccount: "Copiar la subcuenta de depósito",
  copied: "Copiado",
  refundLabel: "Reembolso del depósito",
  refundNone: "Sin reembolso",
  refundInProgress: "Reembolso en curso",
  refundNeedsReview: "Reembolso por verificar",
  refundRefunded: (block: string) => `Reembolsado (bloque ${block})`,
  privacyPositions:
    "Las posiciones de liquidez son públicas y están vinculadas a su identificador en TTTI.",
  privacyDeposit: "Su depósito sigue siendo visible en la cadena.",
  gaugeLabel: "Indicador de llenado",
  gaugeFilling: (current: string, target: string, remaining: string) =>
    `${current} / ${target} USD — faltan ${remaining} USD para alcanzar el umbral de intercambio`,
  gaugeOpen: (current: string, target: string) => `${current} / ${target} USD`,
  gaugeUnavailable: "Valor momentáneamente no disponible",
  reserves: "Reservas",
  totalShares: "Total de participaciones",
  addLiquidityButton: "Añadir liquidez",
  swapButton: "Intercambiar",
  positionsButton: "Posiciones",
  signInForActions: "Inicie sesión para añadir liquidez o intercambiar.",
  pairTokensUnsupported:
    "La liquidez y los intercambios no están disponibles para los tokens de este par.",
  swapsClosedFilling: (gauge: string) =>
    `Los intercambios están cerrados mientras el pool está en llenado: ${gauge}`,
  addTitle: (pair: string) => `Añadir liquidez · ${pair}`,
  addIntro:
    "Los importes se toman de sus saldos DEX disponibles. Las posiciones de liquidez son públicas y están vinculadas a su identificador en TTTI. Su depósito sigue siendo visible en la cadena.",
  sideLabel: "Token introducido",
  tokenAmountLabel: (symbol: string) => `Importe en ${symbol}`,
  firstDepositNote:
    "Primer aporte: introduzca ambos importes. Su proporción fija la proporción del pool.",
  counterComputed: (amount: string) =>
    `Importe del otro lado según la proporción del pool: ${amount}`,
  sharesToReceive: (shares: string) => `Participaciones a recibir: ${shares}`,
  sharesLockedForever: (shares: string) =>
    `Participaciones bloqueadas en el contrato para siempre: ${shares}`,
  gaugeAfter: (gauge: string) => `Indicador tras el aporte: ${gauge}`,
  opensPool: "Este aporte abre el pool a los intercambios.",
  staysFilling: "El pool sigue en llenado tras este aporte.",
  quoting: "Calculando la cotización…",
  lockLabel: "Duración del bloqueo",
  lockHint: (min: string, max: string) =>
    `Opcional: sin bloqueo por defecto. Un bloqueo dura de ${min} a ${max}. Su titular puede prolongarlo, nunca acortarlo.`,
  lockPreset1d: "1 día",
  lockPreset7d: "7 días",
  lockPreset30d: "30 días",
  lockPreset90d: "90 días",
  lockPreset3m: "3 meses",
  lockPreset2y: "2 años",
  lockPreset3y: "3 años",
  lockPreset4y: "4 años",
  lockPreset1y: "1 año",
  lockPreset5y: "5 años",
  lockCustom: "Personalizado",
  lockCustomDays: "Número de días",
  lockInvalid: (min: string, max: string) =>
    `Introduzca una duración de ${min} a ${max}.`,
  durationDays: (days: string) => `${days} días`,
  durationOneDay: "1 día",
  unlockOn: (date: string) => `Desbloqueo: ${date}`,
  confirmAdd: "Añadir la liquidez",
  adding: "Añadiendo liquidez…",
  addDone: (id: string, shares: string) =>
    `Posición n.º ${id} creada con ${shares} participaciones.`,
  refTitle: "Precio de referencia de ICPSwap",
  refQuote: (input: string, output: string) =>
    `Cotización de ICPSwap: ${input} → ${output} (comisión de ICPSwap incluida). Solo como referencia.`,
  refDeviation: (pct: string) =>
    `La proporción de su aporte difiere de esta referencia en un ${pct} %.`,
  refDeviationWarning: (pct: string) =>
    `Atención: la proporción de su aporte difiere de la referencia de ICPSwap en un ${pct} %, más del 2 %.`,
  refUnavailable:
    "No existe ningún pool de ICPSwap para este par; el precio de referencia no está disponible.",
  refError: "No se pudo leer el precio de referencia de ICPSwap.",
  refLoading: "Leyendo el precio de ICPSwap…",
  positionsTitle: (pair: string) => `Posiciones · ${pair}`,
  positionsEmpty: "No hay posiciones en este pool.",
  positionsLoading: "Cargando las posiciones…",
  positionsLoadError: "No se pudieron cargar las posiciones.",
  colOwner: "Titular",
  colPair: "Par",
  colShares: "Participaciones",
  colAmounts: "Importes",
  colLock: "Bloqueo",
  colUnlock: "Desbloqueo",
  creatorBadge: "Creador",
  copyPrincipal: "Copiar el principal",
  unlockedLabel: "Desbloqueada",
  positionLabel: (id: string) => `Posición n.º ${id}`,
  myPositionsTitle: "Mis posiciones",
  myPositionsEmpty: "No tiene ninguna posición de liquidez.",
  myPositionsNote:
    "Retirar una posición acredita sus saldos DEX. Use Retirar en Mis saldos DEX para enviar los tokens a su wallet.",
  withdrawPosition: "Retirar",
  withdrawingPosition: "Retirando…",
  positionWithdrawn: (amount0: string, amount1: string) =>
    `Retirado: ${amount0} y ${amount1} acreditados en sus saldos DEX.`,
  lockedUntil: (date: string) => `Bloqueada hasta el ${date}.`,
  removedWithdrawOpen:
    "El retiro sigue la fecha de desbloqueo en todos los estados del pool.",
  extendLockButton: "Prolongar el bloqueo",
  extendTitle: (id: string) => `Prolongar el bloqueo · posición n.º ${id}`,
  extendCurrent: (date: string) => `Desbloqueo actual: ${date}`,
  extendModeDate: "Fecha",
  extendModeDays: "Días",
  extendDateLabel: "Nueva fecha de desbloqueo",
  extendDaysLabel: "Días añadidos al desbloqueo actual",
  extendNewUnlock: (date: string) => `Nuevo desbloqueo: ${date}`,
  extendTooEarly:
    "El nuevo desbloqueo debe ser posterior al desbloqueo actual.",
  extendTooLate: (date: string) =>
    `El nuevo desbloqueo no puede ser posterior al ${date}.`,
  confirmExtend: "Confirmar la prolongación",
  extending: "Prolongando…",
  extendDone: (date: string) => `Bloqueo prolongado hasta el ${date}.`,
  swapTitle: (pair: string) => `Intercambiar · ${pair}`,
  swapIntro:
    "El intercambio usa sus saldos DEX disponibles; el importe obtenido se acredita en ellos.",
  swapFrom: "Token vendido",
  swapAmountOut: "Recibe (estimación)",
  swapFee: (pct: string) => `Comisión (${pct})`,
  swapPriceImpact: "Impacto en el precio",
  swapMinimum: "Mínimo recibido",
  slippageLabel: "Tolerancia de deslizamiento (%)",
  slippageInvalid: "Introduzca una tolerancia de 0 a 50 %.",
  swapDeadlineNote:
    "El plazo límite se fija en 5 minutos tras la confirmación.",
  confirmSwap: "Confirmar el intercambio",
  swapping: "Intercambiando…",
  swapDone: (input: string, output: string) =>
    `${input} intercambiados por ${output}.`,
  errLiqAnonymous: "Inicie sesión para usar los pools.",
  errPoolNotFound: "Este pool no existe.",
  errPoolRemoved:
    "Este par ha sido retirado. Los depósitos y los intercambios están bloqueados.",
  errMinimumsNotSet: "Los mínimos de este par aún no están fijados.",
  errUnsupportedToken: "Este token no es compatible con el DEX.",
  errZeroAmount: "Introduzca un importe superior a cero.",
  errCounterAmountRequired: "Primer aporte: introduzca ambos importes.",
  errLiqInsufficientBalance: (available: string, required: string) =>
    `Su saldo DEX disponible es ${available}; se necesita ${required}.`,
  errBelowMinimum: (minimums: string) =>
    `El aporte es inferior al mínimo: ${minimums}.`,
  errRatioMismatch: (required: string) =>
    `Según la proporción del pool, el importe del otro lado debe ser ${required}.`,
  errLockTooShort: (min: string) =>
    `El bloqueo es demasiado corto. Mínimo: ${min}.`,
  errLockTooLong: (max: string) =>
    `El bloqueo es demasiado largo. Máximo: ${max}.`,
  errZeroShares:
    "Este aporte es demasiado pequeño para recibir participaciones.",
  errOperationInProgress:
    "Hay otra operación en curso en esta cuenta. Inténtelo de nuevo en un momento.",
  errPositionNotFound: "Esta posición no existe.",
  errNotPositionOwner: "Esta posición pertenece a otro principal.",
  errPositionLocked: (date: string) =>
    `Esta posición está bloqueada hasta el ${date}.`,
  errCannotShortenLock: (date: string) =>
    `Un bloqueo no puede acortarse. Desbloqueo actual: ${date}.`,
  errUnlockTooLate: (date: string) =>
    `La fecha de desbloqueo no puede ser posterior al ${date}.`,
  errPoolFilling: (gauge: string) => `El pool sigue en llenado: ${gauge}`,
  errPoolNotOpen: "Este pool no está abierto a los intercambios.",
  errRateUnavailable:
    "Un tipo USD no está disponible momentáneamente; no se puede comprobar el valor del pool.",
  errTokenNotInPool: "Este token no forma parte del par.",
  errInvalidSlippage: (max: string) =>
    `La tolerancia de deslizamiento debe ser como máximo del ${max} %.`,
  errSwapInsufficientBalance: (available: string) =>
    `Su saldo DEX disponible es ${available}.`,
  errInsufficientLiquidity:
    "El pool no tiene liquidez suficiente para este intercambio.",
  errSlippageExceeded: (out: string, min: string) =>
    `Deslizamiento superado: el intercambio daría ${out}, por debajo del mínimo de ${min}. Pida una nueva cotización.`,
  errDeadlineExceeded: (date: string) =>
    `El plazo límite (${date}) ha pasado. Confirme de nuevo.`,
  errDeadlineTooFar: (date: string) =>
    `El plazo límite es demasiado lejano; el más tardío aceptado es ${date}.`,
  errCall: (detail: string) => `La llamada falló: ${detail}`,
  bonusTitle: "Bono en ICP de las posiciones bloqueadas",
  bonusScope:
    "Los bonos en ICP ya ganados por las posiciones bloqueadas de los pares TTTI-T siguen siendo reclamables. Las comisiones de intercambio no añaden ningún bono nuevo.",
  bonusWeightRule:
    "Peso de una posición = valor en ICP × tiempo de bloqueo restante ÷ 5 años.",
  bonusObservedNote:
    "El bono muestra solo importes observados. No se estima ni se promete ningún importe futuro.",
  bonusSignIn: "Inicia sesión para ver tu bono en ICP.",
  bonusLoading: "Cargando el bono…",
  bonusLoadError: "No se pudo cargar el bono.",
  bonusClaimable: (amount: string) => `Reclamable: ${amount}`,
  bonusClaimedTotal: (amount: string) => `Reclamado en total: ${amount}`,
  bonusNoPositions: "Ninguna posición bloqueada en un par TTTI-T.",
  bonusColPosition: "Posición",
  bonusColValueIcp: "Valor en ICP",
  bonusColRemainingLock: "Bloqueo restante",
  bonusColWeight: "Peso",
  bonusClaimsTitle: "Reclamaciones",
  bonusClaimsEmpty: "Aún no hay reclamaciones.",
  claimButton: "Reclamar el bono en ICP",
  claiming: "Reclamando…",
  claimDone: (amount: string) =>
    `Reclamación de ${amount} registrada. El ICP se envía a tu billetera.`,
  errClaimAnonymous: "Inicia sesión para reclamar el bono.",
  errClaimNothing: "No hay nada que reclamar.",
  errClaimBelowMinimum: (minimum: string) =>
    `El importe reclamable es inferior al mínimo de ${minimum}.`,
  errClaimInProgress:
    "Ya hay una reclamación en curso. Inténtalo de nuevo en un momento.",
  protocolLiquidityTitle: "Liquidez del protocolo",
  protocolLiquidityLocked: "Bloqueada para siempre. No tiene forma de retiro.",
  protocolLiquidityHeld: (amount0: string, amount1: string) =>
    `En posesión: ${amount0} y ${amount1}`,
  protocolLiquidityFromFees: (amount0: string, amount1: string) =>
    `De las comisiones: ${amount0} y ${amount1}`,
  protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
    `De la tesorería: ${amount0} y ${amount1}`,
  protocolLiquidityShare: (pct: string) =>
    `${pct} % de las participaciones del pool`,
  protocolLiquidityLastAdded: (date: string) => `Último aporte: ${date}`,
  protocolLiquidityNone: "No hay liquidez del protocolo en este pool.",
  dexPausedTitle: "DEX en pausa",
  dexPausedNotice: (token: string) =>
    `El DEX está en pausa: una verificación de reservas detectó un déficit de ${token}. Los intercambios, los depósitos y las adiciones de liquidez no están disponibles. Los retiros y la retirada de liquidez siguen disponibles.`,
  dexPausedTooltip: "No disponible mientras el DEX está en pausa.",
  errDexPaused:
    "El DEX está en pausa tras una verificación de reservas. Los intercambios, los depósitos y las adiciones de liquidez no están disponibles. Los retiros y la retirada de liquidez siguen disponibles.",
  navLabel: "Secciones de la página de pools",
  navPools: "Pools",
  navIndicators: "Indicadores",
  navMyLiquidity: "Mi liquidez",
  navProtocol: "Protocolo",
  navRequests: "Solicitudes",
  introShort: "Pools de producto constante en poder de este contrato.",
  statusWaiting: "En espera de liquidez",
  statusOpen: "Abierto",
  detailsLabel: "Detalles",
  addShort: "Añadir",
  howPoolsWorkTitle: "Cómo funcionan los pools",
  permanentLiquidity: "Liquidez permanente",
  permanentLiquidityValue: (shares: string, pct: string) =>
    `${shares} participaciones (${pct} % del pool)`,
  myLiquiditySignIn:
    "Inicie sesión para ver sus saldos DEX, sus posiciones de liquidez y las comisiones recibidas.",
  rewardsTitle: "Comisiones recibidas",
  activityTitle: "Mi actividad",
  activityFilterLabel: "Tipo de actividad",
  filterAll: "Todo",
  filterTransfers: "Depósitos y retiros",
  filterMintFees: "Comisiones de mint",
  filterLpBonus: "Bono LP",
  tokenFilterLabel: "Token",
  allTokens: "Todos los tokens",
  activityEmpty: "No hay actividad para estos filtros.",
  activityLoadError: "No se pudo cargar su actividad.",
  entryMintFee: "Cobro de comisiones de mint",
  entryLpBonus: "Cobro del bono LP",
  requestsFilterLabel: "Filtro de solicitudes",
  filterRejected: "Rechazadas",
  requestsEmptyFiltered: "No hay solicitudes para este filtro.",
  poolsEmpty: "Todavía no hay pools.",
  depthLabel: "Profundidad",
  depthValue: (usd: string) => `${usd} USD`,
  depthBasisTwice:
    "El doble del valor en USD del lado distinto de TTTI-T, al precio del pool.",
  depthBasisSum:
    "Suma de ambos lados en USD, al precio del pool y a las tasas de la hora.",
  depthUnavailable:
    "Profundidad momentáneamente no disponible: falta una tasa USD.",
  depthMissingRate: (tokens: string) => `Tasa ausente: ${tokens}.`,
  thresholdLabel: "Umbral de intercambio",
  thresholdValueTtti: (usd: string) => `${usd} USD de TTTI-T en el pool`,
  thresholdProgressTtti: (measured: string, threshold: string) =>
    `${measured} USD de TTTI-T / ${threshold} USD de TTTI-T en el pool`,
  thresholdValueDepth: (usd: string) => `${usd} USD de profundidad`,
  thresholdRule: (usd: string) =>
    `Los intercambios están abiertos mientras la profundidad sea de al menos ${usd} USD y las tasas USD estén disponibles. El umbral solo afecta a los intercambios y se comprueba en cada llamada.`,
  swapStateLabel: "Intercambios",
  swapStateOpen: "Abiertos",
  swapStateClosed: "Cerrados",
  swapClosedBelowThreshold: (measured: string, threshold: string) =>
    `Los intercambios están cerrados: el pool está en ${measured} USD, por debajo del umbral de intercambio de ${threshold}. Se abren en cuanto se alcanza ese umbral. Los depósitos, las adiciones de liquidez y el mint no se ven afectados.`,
  swapClosedRateUnavailable:
    "Los intercambios están cerrados: una tasa USD no está disponible momentáneamente.",
  swapClosedRemovalAnnounced: (date: string) =>
    `Los intercambios están suspendidos: la retirada de este par está anunciada para el ${date}.`,
  swapClosedRemovalExecuting:
    "Los intercambios están cerrados: la retirada de este par está en curso.",
  swapClosedRemoved:
    "Los intercambios están cerrados: este par ha sido retirado.",
  errDepthBelowThreshold: (measured: string, threshold: string) =>
    `Intercambio rechazado: el pool está en ${measured} USD, por debajo del umbral de intercambio de ${threshold} USD.`,
  errSwapRateUnavailable:
    "Intercambio rechazado: una tasa USD no está disponible momentáneamente.",
  errRemovalInProgress: (date: string) =>
    `Intercambio rechazado: la retirada de este par está anunciada para el ${date}.`,
  errSwapPoolRemoved: "Intercambio rechazado: este par ha sido retirado.",
  fixedSideLabel: "Lado fijo",
  fixedSideHint: "Usted introduce este importe. No cambia.",
  counterSideLabel: "Lado contrario (calculado)",
  counterSideNote:
    "Se calcula con la proporción del pool al hacer el depósito, dentro de la tolerancia de deslizamiento.",
  counterSideRange: (min: string, max: string) =>
    `Importe contrario aceptado: de ${min} a ${max}`,
  addSlippageLabel: "Tolerancia de deslizamiento (%)",
  addSlippageHint:
    "Variación máxima del importe contrario entre la cotización y la ejecución.",
  addSlippageDefault: "Por defecto: 0,5 %",
  addSlippageInvalid: (max: string) =>
    `Introduzca una tolerancia de 0 a ${max} %.`,
  depthAfter: (depth: string) =>
    `Profundidad después del depósito: ${depth} USD`,
  surplusKept: (amount: string) =>
    `No utilizado: ${amount}. Permanece en su saldo DEX interno.`,
  addDoneSurplus: (id: string, shares: string, surplus: string) =>
    `Posición n.º ${id} creada con ${shares} participaciones. No utilizado: ${surplus}, conservado en su saldo DEX interno.`,
  errAddInvalidSlippage: (max: string) =>
    `La tolerancia de deslizamiento debe ser como máximo ${max} %.`,
  errAddSlippageExceeded: (
    tolerance: string,
    expected: string,
    actual: string,
  ) =>
    `El importe contrario varió más allá de la tolerancia de ${tolerance} %: esperado ${expected}, ahora ${actual}. No se debitó nada; los fondos permanecen en su saldo interno. Solicite una nueva cotización.`,
  errAddReferenceOutOfBand: (
    expected: string,
    deviation: string,
    tolerance: string,
  ) =>
    `La proporción del primer depósito difiere del precio de referencia en ${deviation} %, más allá de la banda de ${tolerance} %. Esperado: ${expected}. No se debitó nada; los fondos permanecen en su saldo interno.`,
  errAddReferenceUnavailable:
    "El precio de referencia no está disponible, por lo que no se puede comprobar el primer depósito. No se debitó nada; los fondos permanecen en su saldo interno.",
  errAddRemovalAnnounced: (date: string) =>
    `Las adiciones de liquidez están suspendidas: la retirada de este par está anunciada para el ${date}. Los retiros siguen abiertos, sujetos a los bloqueos de posición.`,
  referenceTitle: "Precio de referencia",
  referenceIntro: (tolerance: string) =>
    `El primer depósito de un pool vacío debe estar dentro del ${tolerance} % del precio de referencia.`,
  referenceTttiPrice: (price: string) =>
    `Precio de referencia de TTTI-T: ${price} USD`,
  referenceExpected: (expected: string) => `Proporción esperada: ${expected}`,
  referenceSourcesTitle: "Fuentes",
  referenceColSource: "Fuente",
  referenceColPrice: "Precio (USD)",
  referenceColDepth: "Profundidad (USD)",
  referenceColWeight: "Peso",
  referenceSourceNative: "Pool nativo",
  referenceSourceIcpswap: "ICPSwap",
  referenceReadAt: (date: string) => `Leído el ${date}`,
  referenceTolerance: (pct: string) => `Tolerancia: ${pct} %`,
  referenceUtilityBasis: "Los pares de utilidad usan las tasas USD de la hora.",
  referenceUnavailableNoSource:
    "Precio de referencia no disponible: no se puede leer ninguna fuente.",
  referenceUnavailableRate: (tokens: string) =>
    `Precio de referencia no disponible: falta la tasa USD de ${tokens}.`,
  referenceRatesInvalid:
    "Las tasas USD de la hora no son válidas; la comprobación de los pares de utilidad no está disponible.",
  referenceWithin: (deviation: string) =>
    `Dentro de la banda: desviación de ${deviation} %.`,
  referenceOutside: (deviation: string, tolerance: string) =>
    `Fuera de la banda: desviación de ${deviation} %, tolerancia de ${tolerance} %.`,
  referenceNotApplicable:
    "Sin comprobación de referencia: el pool ya contiene liquidez.",
  referenceRefresh: "Volver a leer las fuentes",
  referenceRefreshing: "Leyendo las fuentes…",
  referenceRefreshed: (count: string) => `${count} fuente(s) leída(s).`,
  referenceLoading: "Cargando el precio de referencia…",
  referenceLoadError: "No se pudo cargar el precio de referencia.",
  lockNone: "Sin bloqueo",
  lockNoneHint:
    "Sin bloqueo: la posición se puede retirar en cualquier momento.",
  lockPickerLabel: "Bloqueo (opcional)",
  lockUpTo: (max: string) =>
    `Un bloqueo dura de 3 meses a ${max}. Su titular puede prolongarlo, nunca acortarlo.`,
  lockEnforced:
    "La fecha de desbloqueo se aplica en todos los estados del pool, incluido un par retirado. Nadie puede cancelar un bloqueo; solo el relevo de nuevos compromisos del pool puede acortarlo.",
  positionLiquidated: "Posición liquidada en la retirada del par.",
  removalTitle: "Retirada del par",
  removalBadge: "Retirada anunciada",
  removalAnnouncedTitle: "Retirada anunciada",
  removalReasonLabel: "Motivo",
  removalAnnouncedAt: (date: string) => `Anunciada: ${date}`,
  removalEffectiveAt: (date: string) => `Efectiva: ${date}`,
  removalRemaining: (remaining: string) => `Tiempo restante: ${remaining}`,
  removalSuspendedNotice:
    "Los intercambios y las adiciones de liquidez están suspendidos. Los retiros siguen abiertos, sujetos a los bloqueos de posición.",
  removalLiquidationNotice:
    "En la fecha efectiva se liquidan todas las posiciones, incluidas las bloqueadas, y el pool se marca como retirado.",
  removalCancelledTitle: "Retirada cancelada",
  removalCancelledNotice: (date: string) =>
    `La retirada anunciada se canceló el ${date}. Los intercambios y las adiciones vuelven a seguir la profundidad del pool.`,
  removalExecutingTitle: "Retirada en curso",
  removalExecutingNotice:
    "Las posiciones se están liquidando. Los intercambios y las adiciones están cerrados.",
  removalCompletedTitle: "Par retirado",
  removalCompletedNotice: (date: string) =>
    `Retirado el ${date}. Todas las posiciones se liquidaron.`,
  removalReviewNotice:
    "Un pago cuyo resultado no se pudo confirmar figura en la lista de revisión del admin.",
  poolDepthShort: (usd: string) => `Profundidad ${usd} USD`,
  swapsOpenBadge: "Intercambios abiertos",
  swapsClosedBadge: "Intercambios cerrados",
  dexPercentConnect: "Conecte un wallet para usar la barra.",
  dexPercentLoading: "Cargando saldos…",
  dexPercentUnavailable: "Saldo no disponible.",
  dexPercentNotCover: (fees: string) =>
    `El saldo del wallet y del DEX no cubre las comisiones de red de ${fees}.`,
  dexPercentShare: (symbol: string) => `Parte de ${symbol} (wallet + DEX)`,
  dexPercentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  dexPercentBase: (wallet: string, dex: string, total: string) =>
    `Base: wallet ${wallet} + DEX ${dex} = ${total}`,
  dexPercentComputedOn: (fees: string) =>
    `Calculado sobre el saldo del wallet más el saldo DEX disponible, menos ${fees} de comisiones del ledger sobre la parte tomada del wallet.`,
  slippageFieldHint:
    "Diferencia máxima entre el importe de la cotización y el importe ejecutado.",
  emptyPoolTitle: "Primer aporte de un pool vacío",
  emptyPoolNote:
    "Este pool aún no tiene liquidez. Introduzca un importe; el otro lado se calcula al precio de referencia y se comprueba con la tolerancia al añadir.",
  expectedOtherAmountLabel: (symbol: string) =>
    `Importe esperado de ${symbol} al precio de referencia`,
  expectedOtherAmountUnavailable: "No hay precio de referencia disponible.",
  addReferenceBlockTitle: "Precio de referencia del primer aporte",
  poolSwapStateLabel: "Estado de los intercambios",
  depthBarOpen: "Abiertos: se ha alcanzado el umbral de intercambio",
  depthBarClosed: "Cerrados: por debajo del umbral de intercambio",
  depthBarAriaLabel: (pair: string) =>
    `Cantidad de TTTI-T del pool ${pair} respecto al umbral de intercambio`,
  countdownLabel: "Tiempo restante",
  countdownDays: (count: string) => `${count} d`,
  countdownHours: (count: string) => `${count} h`,
  countdownMinutes: (count: string) => `${count} min`,
  countdownSeconds: (count: string) => `${count} s`,
  countdownReached: "Se ha alcanzado la fecha de efecto.",
  recoverHeading: "Su saldo DEX",
  recoverButton: "Recuperar",
  recoverExplain:
    "El saldo vuelve a su wallet. Las comisiones del ledger se deducen de cada importe.",
  recovering: "Recuperando…",
  recoverDone: (amounts: string) => `Recuperado en su wallet: ${amounts}.`,
  recoverNothing: "No hay saldo DEX que recuperar.",
  recoverError: (detail: string) => `No se pudo recuperar el saldo: ${detail}`,
  durationOneYear: "1 año",
  durationYears: (count: string) => `${count} años`,
  durationOneMonth: "1 mes",
  durationMonths: (count: string) => `${count} meses`,
  positionLockCommitted: "Bloqueo comprometido",
  positionLockStart: "Inicio del bloqueo",
  positionTimeRemaining: "Tiempo restante",
  positionRelayReceived: "Relevo recibido",
  relayReceivedNone: "Ninguno",
  positionFeesCollected: "Comisiones cobradas",
  pendingPotLabel: "Bolsa pendiente",
  pendingPotNext: (date: string) => `Próximo reparto: ${date}`,
  pendingPotRunning: "Reparto en curso",
  pendingPotNote:
    "La bolsa contiene la mitad bloqueada de las comisiones de LP pagadas desde el último reparto. Se reparte una vez al día entre las posiciones bloqueadas durante el día.",
  estimatedShareLabel: "Parte estimada de hoy",
  estimatedShareDetail: (fraction: string, date: string) =>
    `${fraction} del día bloqueada · próximo reparto ${date}`,
  estimatedShareNote:
    "Estimación para el día en curso: proporcional al peso de la posición y a la fracción del día en que está bloqueada. El importe pagado depende de la bolsa en el próximo reparto.",
  estimatedShareNone: "Sin tiempo bloqueado hoy",
  positionStatus: "Estado",
  positionStatusLocked: "Bloqueada",
  positionStatusFree: "Libre",
  positionStatusFreeNoLock: "Libre · sin bloqueo",
  positionFreeAfter: "Libre tras relevo o vencimiento",
  guaranteedDepthLabel: "Profundidad garantizada",
  guaranteedDepthHint: "Posiciones bloqueadas más liquidez permanente.",
  consolidatedTitle: "Precio consolidado de TTTI-T",
  consolidatedUsd: (price: string) => `${price} USD`,
  consolidatedCurrent: "Precio",
  consolidatedHourly: "Media por hora",
  consolidatedDaily: "Media de 24 h",
  consolidatedSamples: (count: string) => `${count} muestras`,
  consolidatedNotAvailable: "No disponible",
  consolidatedComputedLabel: "Calculado",
  consolidatedSource: (symbol: string, price: string, weight: string) =>
    `TTTI-T/${symbol}: ${price} USD · peso ${weight}`,
  consolidatedNote:
    "Ponderado por la profundidad de los pools y convertido a USD con las tasas horarias actuales.",
  consolidatedUnavailableNoRate:
    "El precio consolidado no está disponible: no hay una tasa horaria válida.",
  consolidatedUnavailableNoPool:
    "El precio consolidado no está disponible: ningún pool de TTTI-T está abierto a intercambios.",
  consolidatedLoadError: "No se pudo cargar el precio consolidado.",
  spreadLabel: "Diferencia con los otros pools abiertos",
  spreadNoIndependentReference: "Sin referencia independiente",
  spreadAboveThreshold: (threshold: string) =>
    `Diferencia superior al ${threshold} %`,
  spreadReasonEmpty: "No hay liquidez en este pool.",
  spreadReasonNotOpen: "Los intercambios no están abiertos.",
  spreadReasonNoRate: "No hay una tasa horaria válida para este par.",
  spreadReasonNoConsolidated: "No hay precio consolidado.",
  spreadReasonLoadError: "No se pudieron cargar las diferencias.",
  poolPriceLabel: "Precio del pool",
  spreadAlertTitle: "Diferencia por encima del umbral",
  spreadAlert: (pool: string, spread: string, threshold: string) =>
    `Pool ${pool}: el precio del pool se compara con el precio de los otros pools abiertos. La diferencia es ${spread}, por encima del umbral del ${threshold} %. Tienes una posición en este pool.`,
  spreadAlertPrices: (poolPrice: string, consolidated: string) =>
    `Precio del pool ${poolPrice} USD · precio de los otros pools abiertos ${consolidated} USD`,
  referenceConsolidatedPrice: (price: string) =>
    `Precio consolidado de TTTI-T: ${price} USD`,
  guaranteedDepthReserves: (amount0: string, amount1: string) =>
    `Reservas garantizadas: ${amount0} y ${amount1}`,
  relayTitle: "Relevo de compromisos",
  relayExplain:
    "El bloqueo relevo es opcional y dura de 3 meses a 5 años. Un tercio del peso de cada nuevo compromiso alivia a las demás posiciones bloqueadas del pool. Un propietario puede prolongar. Una posición aliviada o vencida se desbloquea sin expulsión: permanece en el pool como liquidez libre.",
  relayResult: (shortened: string, freed: string) =>
    `Relevo: ${shortened} posición(es) acortada(s), ${freed} liberada(s).`,
  relayResultNone: "Relevo: no se acortó ninguna otra posición.",
  feeSplitTitle: "Reparto de comisiones con las posiciones bloqueadas",
  feeSplitExplain:
    "La mitad de la comisión de los proveedores de liquidez permanece en las reservas, en proporción a las participaciones. La otra mitad se aparta y se reparte entre las posiciones bloqueadas según el capital × la raíz cuadrada de (tiempo restante ÷ 5 años). Solo se reparten las comisiones efectivamente pagadas.",
  errExtendRemovalAnnounced: (date: string) =>
    `El bloqueo no puede prolongarse: la retirada de este par está anunciada para el ${date}.`,
  extendRemainingRule: (min: string, max: string) =>
    `Tras la prórroga, el tiempo restante debe estar entre ${min} y ${max}.`,
  extendMaxDate: (date: string) => `Desbloqueo más tardío posible: ${date}`,
  extendCurrentRemaining: (remaining: string) =>
    `Tiempo restante actual: ${remaining}`,
  extendNewRemaining: (remaining: string) =>
    `Tiempo restante tras la prórroga: ${remaining}`,
  extendFreeNote:
    "Esta posición no tiene un bloqueo activo. Prorrogarla compromete un nuevo bloqueo contado desde ahora.",
  extendRemainingTooShort: (min: string) =>
    `El tiempo restante tras la prórroga debe ser de al menos ${min}.`,
  extendRemainingTooLong: (max: string) =>
    `El tiempo restante tras la prórroga no puede superar ${max}.`,
  errExtendLockTooShort: (min: string) =>
    `El tiempo restante tras la prórroga es inferior al mínimo de ${min}.`,
  errExtendLockTooLong: (date: string) =>
    `El bloqueo no puede terminar después del ${date}.`,
  extendRelayNote:
    "Un tercio del peso de la duración añadida acorta las demás posiciones comprometidas del pool. La posición prorrogada no se acorta con su propia prórroga.",
  feeSplitProtocolTitle: "Reparto de las comisiones de swap",
  feeSplitProtocolRule:
    "Una comisión de swap se reparte en un 70 % para los proveedores de liquidez y una parte del protocolo del 30 %.",
  feeSplitLpLine: "El 70 % de la comisión va a los proveedores de liquidez.",
  feeSplitCreatorLine:
    "Dos tercios de la parte del protocolo (20 % de la comisión) van al creador.",
  feeSplitPermanentLine:
    "Un tercio de la parte del protocolo (10 % de la comisión) va a la liquidez permanente, que nadie puede retirar.",
  feeSplitRouterNote:
    "La comisión del 0,1 % del enrutador de ICPSwap sigue el mismo reparto.",
  feeSplitMintNote:
    "La comisión del 1 % del mint llena primero la reserva de ciclos, hasta un año de consumo medido. El resto va al creador.",
  transferFeeFixedTitle: "Comisión de transferencia de TTTI-T",
  transferFeeFixed:
    "La comisión de transferencia de TTTI-T es fija, de 0,000001 TTTI-T, y se paga al creador.",
  boardTitle: "Panel público",
  boardIntro:
    "Cifras leídas del contrato: reserva de ciclos, liquidez permanente y fondos del creador.",
  boardLoading: "Cargando el panel público…",
  boardLoadError: "No se pudo cargar el panel público.",
  boardCyclesTitle: "Reserva de ciclos",
  boardCyclesMonths: (months: string) => `${months} meses de consumo medido`,
  boardCyclesTarget: "Objetivo: un año de consumo",
  boardCyclesFill: (pct: string) => `${pct} % del objetivo de un año`,
  boardCyclesFillAria:
    "Llenado de la reserva de ciclos hacia el objetivo de un año",
  boardCyclesReserve: (amount: string) => `Reserva: ${amount}`,
  boardCyclesBalance: (cycles: string) => `Ciclos del canister: ${cycles}`,
  boardCyclesPending: (amount: string) =>
    `Parte de comisiones aún no abonada a la reserva: ${amount}`,
  boardCyclesUnknown:
    "El consumo aún no está medido o falta una tasa; no se puede calcular la cobertura.",
  boardTopUpHint: "Cualquiera puede recargar los ciclos del canister.",
  boardTopUpButton: "Recargar ciclos",
  boardTopUpRunning: "Recargando…",
  boardTopUpDone: (cycles: string) =>
    `Recarga realizada. Ciclos del canister: ${cycles}.`,
  boardTopUpNotNeeded: (threshold: string) =>
    `No hace falta recargar: los ciclos superan el umbral de ${threshold}.`,
  boardTopUpBusy: "Ya hay una recarga en curso.",
  boardTopUpError: (detail: string) => `La recarga falló: ${detail}`,
  boardPermanentTitle: "Liquidez permanente",
  boardPermanentIntro:
    "Participaciones de pool bloqueadas que nadie puede retirar. Se añaden al pool TTTI-T con menos liquidez y se registran en un diario público.",
  boardPermanentNone: "Aún no hay liquidez permanente.",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `${shares} participaciones permanentes (${pct} % del pool)`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `En poder de las participaciones permanentes: ${amount0} y ${amount1}`,
  boardPermanentValue: (usd: string) => `Valor: ${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `Reservado, en espera de la próxima inyección: ${amounts}`,
  boardPermanentNextPool: (pair: string) => `Próximo pool: ${pair}`,
  boardPermanentThreshold: (amount: string) => `Umbral de inyección: ${amount}`,
  boardJournalTitle: "Últimas entradas del diario",
  boardJournalEmpty: "Aún no hay entradas en el diario.",
  boardJournalTotal: (count: string) => `${count} entradas`,
  boardJournalColDate: "Fecha",
  boardJournalColKind: "Tipo",
  boardJournalColAmount: "Importe",
  boardJournalColShares: "Participaciones",
  boardJournalColDetail: "Detalle",
  boardJournalRouteNative: "Pool nativo",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "Anterior",
  boardJournalNext: "Siguiente",
  boardJournalRange: (from: string, to: string, total: string) =>
    `${from}–${to} de ${total}`,
  permKindAccrued: "Acumulado",
  permKindRebalanced: "Reequilibrado",
  permKindInjected: "Inyectado",
  permKindWaiting: "En espera",
  permKindFailed: "Fallido",
  permKindAccruedHint:
    "Parte del protocolo reservada para la liquidez permanente.",
  permKindRebalancedHint:
    "Importes reservados intercambiados hacia la proporción del par.",
  permKindInjectedHint: "Añadido a un pool como participaciones bloqueadas.",
  permKindWaitingHint: "En espera de una tasa o del umbral.",
  permKindFailedHint: "El paso falló y queda en el diario.",
  boardCreatorTitle: "Fondos del creador",
  boardCreatorIntro:
    "Importes que el contrato mantiene para el creador, por token, con las comisiones recibidas en TTTI-T.",
  boardCreatorNone: "Aún no hay fondos del creador.",
  boardCreatorHeld: "En custodia",
  boardCreatorPaid: "Pagado",
  boardCreatorInFlight: "En tránsito",
  boardCreatorMintFee: "Comisiones de mint",
  boardCreatorSwapFee: "Parte de las comisiones de swap",
  boardCreatorRouterShare: "Parte de las comisiones del enrutador",
  boardCreatorTransferFee: "Comisiones de transferencia",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `Comisiones de transferencia recibidas en TTTI-T: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `Saldo de la cuenta de comisiones en TTTI-T: ${amount}`,
  boardCreatorLastCredit: (date: string) => `Último abono: ${date}`,
};
export default es;
