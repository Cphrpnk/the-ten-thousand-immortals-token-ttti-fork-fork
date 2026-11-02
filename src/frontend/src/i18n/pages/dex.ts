import { defineDict } from "../core/dict";

/**
 * Public Pools page (DEX lot 1): pair registry and pair requests.
 * English is authoritative. Amounts, symbols, ledger IDs, dates and limits
 * are passed in already formatted for the active language.
 */
/**
 * Admin-facing strings of the DEX-2 batch (pair removal, LQ payouts, depth
 * columns). The admin screens are in English, so every language carries the
 * same English text.
 */
const DEX_ADMIN_EN = {
  adminRemovalTitle: "Pair removal",
  adminRemovalIntro: (days: string) =>
    `Announces the removal for ${days} days from now. Swaps and additions are suspended during the notice; withdrawals stay open, subject to position locks. At the effective date all positions are liquidated.`,
  adminRemoveButton: "Remove pair…",
  adminReasonLabel: "Reason (public)",
  adminReasonPlaceholder: "Reason for the removal",
  adminReasonCount: (count: string, max: string) =>
    `${count} / ${max} characters`,
  adminAnnounceButton: "Announce removal",
  adminAnnouncing: "Announcing…",
  adminAnnounceDone: (date: string) => `Removal announced. Effective ${date}.`,
  adminCancelRemovalButton: "Cancel removal",
  adminCancelling: "Cancelling…",
  adminCancelDone: "Removal cancelled.",
  adminErrNotAuthorized: "Only the admin can do this.",
  adminErrPoolNotFound: "This pool does not exist.",
  adminErrAlreadyAnnounced: (date: string) =>
    `A removal is already announced. Effective ${date}.`,
  adminErrAlreadyRemoved: "This pair is already removed.",
  adminErrReasonEmpty: "Enter a reason.",
  adminErrReasonTooLong: (max: string) =>
    `The reason is longer than ${max} characters.`,
  adminErrNoAnnouncement: "No removal is announced for this pair.",
  adminErrAlreadyCancelled: "The removal is already cancelled.",
  adminErrAlreadyExecuting: "The removal is already in progress.",
  adminErrAlreadyCompleted: "The removal is already completed.",
  adminLqLabel: "LQ — liquidation payout",
  adminLqHint:
    "Payout of a position at the removal of a pair. Check the ledger, then mark Arrived or Not arrived.",
  adminDepthColumn: "Depth (USD)",
  adminSwapStateColumn: "Swap state",
  adminRemovalColumn: "Removal",
  adminRemovalNone: "None",
  adminConfigThreshold: "Swap threshold",
  adminConfigSlippage: "Default slippage",
  adminConfigTolerance: "Reference tolerance",
  adminConfigNotice: "Removal notice",
  // PTM-4: creator payouts, cycles fee settlements and the fixed transfer fee.
  adminTransferFeeFixed:
    "Transfer fee: fixed at 100 e8s (0.000001 TTTI-T), paid to the creator. It cannot be changed.",
  adminCreatorTitle: "Creator holdings and payouts",
  adminCreatorIntro:
    "Amounts held by the contract for the creator, per token. A payout sends the held amount, minus the ledger fee, to the wallet configured for that token.",
  adminCreatorColToken: "Token",
  adminCreatorColHeld: "Held",
  adminCreatorColInFlight: "In transit",
  adminCreatorColPaidOut: "Paid out",
  adminCreatorColSources: "Sources",
  adminCreatorPayButton: (symbol: string) => `Pay out ${symbol}`,
  adminCreatorPaying: "Paying…",
  adminCreatorPayDone: (amount: string) => `Payout sent: ${amount}.`,
  adminCreatorErrNothing: "There is nothing to pay out for this token.",
  adminCreatorErrInProgress: "A payout is already in progress for this token.",
  adminCreatorErrNoWallet: "No wallet is configured for this token.",
  adminCreatorErrBelowFee: (fee: string, held: string) =>
    `The held amount ${held} does not cover the ledger fee ${fee}.`,
  adminCreatorErrPaused: "Payouts are paused.",
  adminCreatorPayoutsTitle: "Creator payouts",
  adminCreatorPayoutsEmpty: "No creator payout yet.",
  adminCreatorColNumber: "No.",
  adminCreatorColGross: "Gross",
  adminCreatorColNet: "Net",
  adminCreatorColStatus: "Status",
  adminCreatorColDate: "Date",
  adminCreatorColMemo: "Memo",
  adminCreatorReviewTitle: "Creator payouts to review",
  adminCreatorReviewEmpty: "No creator payout to review.",
  adminReviewArrived: "Arrived",
  adminReviewNotArrived: "Not arrived",
  adminReviewBlockLabel: "Block index",
  adminReviewBlockInvalid: "Enter a valid block index.",
  adminReviewDone: "Marked.",
  adminTransferStatusCompleted: (block: string) => `Completed · block ${block}`,
  adminTransferStatusNeedsReview: "Needs review",
  adminTransferStatusInProgress: "In progress",
  adminTransferStatusFailed: (detail: string) => `Failed: ${detail}`,
  adminCyclesFeesTitle: "Cycles fee settlements",
  adminCyclesFeesIntro:
    "Part of the 1 % mint and buyback fees sent to the cycles reserve before the creator receives the remainder.",
  adminCyclesFeesEmpty: "No cycles fee settlement yet.",
  adminCyclesFeesReviewTitle: "Cycles fee settlements to review",
  adminCyclesFeesReviewEmpty: "No cycles fee settlement to review.",
  adminCyclesColGross: "Gross",
  adminCyclesColNet: "Net to reserve",
  adminCyclesSplitsTitle: "Fee splits",
  adminCyclesSplitsEmpty: "No fee split yet.",
  adminSplitSourceLabel: "Source",
  adminSplitSourceMint: "Mint",
  adminSplitSourceBuyback: "Buyback",
  adminSplitColCycles: "To cycles reserve",
  adminSplitColCreator: "To creator",
  adminCyclesPendingShare: (amount: string) =>
    `Fee share pending for the cycles reserve: ${amount}`,
  adminCyclesCoverage: (months: string, pct: string) =>
    `Reserve coverage: ${months} months, ${pct} % of the one-year target`,
  adminCyclesCoverageUnknown: "Reserve coverage: not available yet.",
  adminPageOlder: "Older",
  adminPageNewer: "Newer",
};

/**
 * PTM-4 texts: remaining-time rule of the lock extension, split of the
 * protocol share, fixed transfer fee, and the public board (cycles reserve,
 * permanent liquidity, creator holdings). One block per language, spread
 * into the matching dictionary. Amounts, dates and durations are passed
 * already formatted.
 */
const PTM4_EN = {
  extendRemainingRule: (min: string, max: string) =>
    `After the extension, the remaining time must be between ${min} and ${max}.`,
  extendMaxDate: (date: string) => `Latest possible unlock: ${date}`,
  extendCurrentRemaining: (remaining: string) =>
    `Current remaining time: ${remaining}`,
  extendNewRemaining: (remaining: string) =>
    `Remaining time after the extension: ${remaining}`,
  extendFreeNote:
    "This position has no active lock. Extending it commits a new lock counted from now.",
  extendRemainingTooShort: (min: string) =>
    `The remaining time after the extension must be at least ${min}.`,
  extendRemainingTooLong: (max: string) =>
    `The remaining time after the extension cannot exceed ${max}.`,
  errExtendLockTooShort: (min: string) =>
    `The remaining time after the extension is below the minimum of ${min}.`,
  errExtendLockTooLong: (date: string) =>
    `The lock cannot end later than ${date}.`,
  extendRelayNote:
    "One third of the weight of the added duration shortens the other committed positions of the pool. The extended position is not shortened by its own extension.",
  feeSplitProtocolTitle: "Split of swap fees",
  feeSplitProtocolRule:
    "A swap fee is split into 70 % for liquidity providers and a 30 % protocol share.",
  feeSplitLpLine: "70 % of the fee goes to liquidity providers.",
  feeSplitCreatorLine:
    "Two thirds of the protocol share (20 % of the fee) go to the creator.",
  feeSplitPermanentLine:
    "One third of the protocol share (10 % of the fee) goes to permanent liquidity, which nobody can withdraw.",
  feeSplitRouterNote: "The 0.1 % ICPSwap router fee follows the same split.",
  feeSplitMintNote:
    "The 1 % fees on mint and buyback fill the cycles reserve first, up to one year of measured consumption. The remainder goes to the creator.",
  transferFeeFixedTitle: "TTTI-T transfer fee",
  transferFeeFixed:
    "The TTTI-T transfer fee is fixed at 0.000001 TTTI-T and is paid to the creator.",
  boardTitle: "Public board",
  boardIntro:
    "Figures read from the contract: cycles reserve, permanent liquidity and creator holdings.",
  boardLoading: "Loading the public board…",
  boardLoadError: "The public board could not be loaded.",
  boardCyclesTitle: "Cycles reserve",
  boardCyclesMonths: (months: string) =>
    `${months} months of measured consumption`,
  boardCyclesTarget: "Target: one year of consumption",
  boardCyclesFill: (pct: string) => `${pct} % of the one-year target`,
  boardCyclesFillAria: "Cycles reserve filling toward the one-year target",
  boardCyclesReserve: (amount: string) => `Reserve: ${amount}`,
  boardCyclesBalance: (cycles: string) => `Canister cycles: ${cycles}`,
  boardCyclesPending: (amount: string) =>
    `Fee share not yet settled to the reserve: ${amount}`,
  boardCyclesUnknown:
    "Consumption is not measured yet or a rate is unavailable; the coverage cannot be computed.",
  boardTopUpHint: "Anyone can top up the cycles of the canister.",
  boardTopUpButton: "Top up cycles",
  boardTopUpRunning: "Topping up…",
  boardTopUpDone: (cycles: string) =>
    `Top-up done. Canister cycles: ${cycles}.`,
  boardTopUpNotNeeded: (threshold: string) =>
    `No top-up needed: the cycles are above the threshold of ${threshold}.`,
  boardTopUpBusy: "A top-up is already in progress.",
  boardTopUpError: (detail: string) => `The top-up failed: ${detail}`,
  boardPermanentTitle: "Permanent liquidity",
  boardPermanentIntro:
    "Locked pool shares that nobody can withdraw. They are added to the least liquid TTTI-T pool and recorded in a public journal.",
  boardPermanentNone: "No permanent liquidity yet.",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `${shares} permanent shares (${pct} % of the pool)`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `Held by the permanent shares: ${amount0} and ${amount1}`,
  boardPermanentValue: (usd: string) => `Value: ${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `Set aside, waiting for the next injection: ${amounts}`,
  boardPermanentNextPool: (pair: string) => `Next pool: ${pair}`,
  boardPermanentThreshold: (amount: string) => `Injection threshold: ${amount}`,
  boardJournalTitle: "Latest journal entries",
  boardJournalEmpty: "No journal entry yet.",
  boardJournalTotal: (count: string) => `${count} entries`,
  boardJournalColDate: "Date",
  boardJournalColKind: "Kind",
  boardJournalColAmount: "Amount",
  boardJournalColShares: "Shares",
  boardJournalColDetail: "Detail",
  boardJournalRouteNative: "Native pool",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "Previous",
  boardJournalNext: "Next",
  boardJournalRange: (from: string, to: string, total: string) =>
    `${from}–${to} of ${total}`,
  permKindAccrued: "Accrued",
  permKindRebalanced: "Rebalanced",
  permKindInjected: "Injected",
  permKindWaiting: "Waiting",
  permKindFailed: "Failed",
  permKindAccruedHint: "Protocol share set aside for permanent liquidity.",
  permKindRebalancedHint: "Set-aside amounts swapped toward the pair ratio.",
  permKindInjectedHint: "Added to a pool as locked shares.",
  permKindWaitingHint: "Waiting for a rate or for the threshold.",
  permKindFailedHint: "The step failed and stays in the journal.",
  boardCreatorTitle: "Creator holdings",
  boardCreatorIntro:
    "Amounts held by the contract for the creator, per token, with the fees received in TTTI-T.",
  boardCreatorNone: "No creator holding yet.",
  boardCreatorHeld: "Held",
  boardCreatorPaid: "Paid out",
  boardCreatorInFlight: "In transit",
  boardCreatorMintFee: "Mint fees",
  boardCreatorBuybackFee: "Buyback fees",
  boardCreatorSwapFee: "Swap fee share",
  boardCreatorRouterShare: "Router fee share",
  boardCreatorTransferFee: "Transfer fees",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `Transfer fees received in TTTI-T: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `Fee account balance in TTTI-T: ${amount}`,
  boardCreatorLastCredit: (date: string) => `Last credit: ${date}`,
};

const PTM4_FR = {
  extendRemainingRule: (min: string, max: string) =>
    `Après la prolongation, le temps restant doit être compris entre ${min} et ${max}.`,
  extendMaxDate: (date: string) =>
    `Déblocage le plus tardif possible : ${date}`,
  extendCurrentRemaining: (remaining: string) =>
    `Temps restant actuel : ${remaining}`,
  extendNewRemaining: (remaining: string) =>
    `Temps restant après la prolongation : ${remaining}`,
  extendFreeNote:
    "Cette position n'a pas de verrou actif. La prolonger engage un nouveau verrou compté à partir de maintenant.",
  extendRemainingTooShort: (min: string) =>
    `Le temps restant après la prolongation doit être d'au moins ${min}.`,
  extendRemainingTooLong: (max: string) =>
    `Le temps restant après la prolongation ne peut pas dépasser ${max}.`,
  errExtendLockTooShort: (min: string) =>
    `Le temps restant après la prolongation est inférieur au minimum de ${min}.`,
  errExtendLockTooLong: (date: string) =>
    `Le verrou ne peut pas se terminer après le ${date}.`,
  extendRelayNote:
    "Un tiers du poids de la durée ajoutée raccourcit les autres positions engagées du pool. La position prolongée n'est pas raccourcie par sa propre prolongation.",
  feeSplitProtocolTitle: "Répartition des frais d'échange",
  feeSplitProtocolRule:
    "Un frais d'échange se répartit en 70 % pour les fournisseurs de liquidité et une part du protocole de 30 %.",
  feeSplitLpLine: "70 % du frais vont aux fournisseurs de liquidité.",
  feeSplitCreatorLine:
    "Deux tiers de la part du protocole (20 % du frais) vont au créateur.",
  feeSplitPermanentLine:
    "Un tiers de la part du protocole (10 % du frais) va à la liquidité permanente, que personne ne peut retirer.",
  feeSplitRouterNote:
    "Le frais de 0,1 % du routeur ICPSwap suit la même répartition.",
  feeSplitMintNote:
    "Les frais de 1 % du mint et du rachat alimentent d'abord la réserve de cycles, jusqu'à un an de consommation mesurée. Le reste va au créateur.",
  transferFeeFixedTitle: "Frais de transfert du TTTI-T",
  transferFeeFixed:
    "Les frais de transfert du TTTI-T sont fixés à 0,000001 TTTI-T et versés au créateur.",
  boardTitle: "Tableau public",
  boardIntro:
    "Chiffres lus dans le contrat : réserve de cycles, liquidité permanente et avoirs du créateur.",
  boardLoading: "Chargement du tableau public…",
  boardLoadError: "Le tableau public n'a pas pu être chargé.",
  boardCyclesTitle: "Réserve de cycles",
  boardCyclesMonths: (months: string) =>
    `${months} mois de consommation mesurée`,
  boardCyclesTarget: "Cible : un an de consommation",
  boardCyclesFill: (pct: string) => `${pct} % de la cible d'un an`,
  boardCyclesFillAria:
    "Remplissage de la réserve de cycles vers la cible d'un an",
  boardCyclesReserve: (amount: string) => `Réserve : ${amount}`,
  boardCyclesBalance: (cycles: string) => `Cycles du canister : ${cycles}`,
  boardCyclesPending: (amount: string) =>
    `Part de frais pas encore versée à la réserve : ${amount}`,
  boardCyclesUnknown:
    "La consommation n'est pas encore mesurée ou un taux est indisponible ; la couverture ne peut pas être calculée.",
  boardTopUpHint: "N'importe qui peut recharger les cycles du canister.",
  boardTopUpButton: "Recharger les cycles",
  boardTopUpRunning: "Recharge en cours…",
  boardTopUpDone: (cycles: string) =>
    `Recharge effectuée. Cycles du canister : ${cycles}.`,
  boardTopUpNotNeeded: (threshold: string) =>
    `Aucune recharge nécessaire : les cycles dépassent le seuil de ${threshold}.`,
  boardTopUpBusy: "Une recharge est déjà en cours.",
  boardTopUpError: (detail: string) => `La recharge a échoué : ${detail}`,
  boardPermanentTitle: "Liquidité permanente",
  boardPermanentIntro:
    "Parts de pool verrouillées que personne ne peut retirer. Elles sont ajoutées au pool TTTI-T le moins liquide et inscrites dans un journal public.",
  boardPermanentNone: "Aucune liquidité permanente pour l'instant.",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `${shares} parts permanentes (${pct} % du pool)`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `Détenu par les parts permanentes : ${amount0} et ${amount1}`,
  boardPermanentValue: (usd: string) => `Valeur : ${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `Mis de côté, en attente de la prochaine injection : ${amounts}`,
  boardPermanentNextPool: (pair: string) => `Prochain pool : ${pair}`,
  boardPermanentThreshold: (amount: string) => `Seuil d'injection : ${amount}`,
  boardJournalTitle: "Dernières entrées du journal",
  boardJournalEmpty: "Aucune entrée dans le journal.",
  boardJournalTotal: (count: string) => `${count} entrées`,
  boardJournalColDate: "Date",
  boardJournalColKind: "Type",
  boardJournalColAmount: "Montant",
  boardJournalColShares: "Parts",
  boardJournalColDetail: "Détail",
  boardJournalRouteNative: "Pool natif",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "Précédent",
  boardJournalNext: "Suivant",
  boardJournalRange: (from: string, to: string, total: string) =>
    `${from}–${to} sur ${total}`,
  permKindAccrued: "Accumulé",
  permKindRebalanced: "Rééquilibré",
  permKindInjected: "Injecté",
  permKindWaiting: "En attente",
  permKindFailed: "Échoué",
  permKindAccruedHint:
    "Part du protocole mise de côté pour la liquidité permanente.",
  permKindRebalancedHint:
    "Montants mis de côté échangés vers le ratio de la paire.",
  permKindInjectedHint: "Ajouté à un pool sous forme de parts verrouillées.",
  permKindWaitingHint: "En attente d'un taux ou du seuil.",
  permKindFailedHint: "L'étape a échoué et reste dans le journal.",
  boardCreatorTitle: "Avoirs du créateur",
  boardCreatorIntro:
    "Montants détenus par le contrat pour le créateur, par jeton, avec les frais reçus en TTTI-T.",
  boardCreatorNone: "Aucun avoir du créateur pour l'instant.",
  boardCreatorHeld: "Détenu",
  boardCreatorPaid: "Versé",
  boardCreatorInFlight: "En transit",
  boardCreatorMintFee: "Frais de mint",
  boardCreatorBuybackFee: "Frais de rachat",
  boardCreatorSwapFee: "Part des frais d'échange",
  boardCreatorRouterShare: "Part des frais du routeur",
  boardCreatorTransferFee: "Frais de transfert",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `Frais de transfert reçus en TTTI-T : ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `Solde du compte de frais en TTTI-T : ${amount}`,
  boardCreatorLastCredit: (date: string) => `Dernier crédit : ${date}`,
};

const PTM4_ES = {
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
    "Las comisiones del 1 % del mint y de la recompra llenan primero la reserva de ciclos, hasta un año de consumo medido. El resto va al creador.",
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
  boardCreatorBuybackFee: "Comisiones de recompra",
  boardCreatorSwapFee: "Parte de las comisiones de swap",
  boardCreatorRouterShare: "Parte de las comisiones del enrutador",
  boardCreatorTransferFee: "Comisiones de transferencia",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `Comisiones de transferencia recibidas en TTTI-T: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `Saldo de la cuenta de comisiones en TTTI-T: ${amount}`,
  boardCreatorLastCredit: (date: string) => `Último abono: ${date}`,
};

const PTM4_ZH = {
  extendRemainingRule: (min: string, max: string) =>
    `延长后，剩余时间必须介于 ${min} 与 ${max} 之间。`,
  extendMaxDate: (date: string) => `最晚可解锁时间：${date}`,
  extendCurrentRemaining: (remaining: string) => `当前剩余时间：${remaining}`,
  extendNewRemaining: (remaining: string) => `延长后的剩余时间：${remaining}`,
  extendFreeNote: "此头寸没有生效中的锁定。延长将从现在起承诺一个新的锁定。",
  extendRemainingTooShort: (min: string) =>
    `延长后的剩余时间必须至少为 ${min}。`,
  extendRemainingTooLong: (max: string) => `延长后的剩余时间不能超过 ${max}。`,
  errExtendLockTooShort: (min: string) =>
    `延长后的剩余时间低于最低要求 ${min}。`,
  errExtendLockTooLong: (date: string) => `锁定不能晚于 ${date} 结束。`,
  extendRelayNote:
    "新增时长权重的三分之一会缩短该池中其他已承诺的头寸。被延长的头寸不会因自身的延长而缩短。",
  feeSplitProtocolTitle: "兑换手续费的分配",
  feeSplitProtocolRule:
    "每笔兑换手续费分为两部分：70% 归流动性提供者，30% 为协议份额。",
  feeSplitLpLine: "手续费的 70% 归流动性提供者。",
  feeSplitCreatorLine: "协议份额的三分之二（占手续费的 20%）归创建者。",
  feeSplitPermanentLine:
    "协议份额的三分之一（占手续费的 10%）归永久流动性，任何人都无法提取。",
  feeSplitRouterNote: "ICPSwap 路由器 0.1% 的费用遵循相同的分配。",
  feeSplitMintNote:
    "铸造和回购的 1% 费用首先用于补充 Cycles 储备，最高相当于一年的实测消耗量，其余归创建者。",
  transferFeeFixedTitle: "TTTI-T 转账手续费",
  transferFeeFixed: "TTTI-T 的转账手续费固定为 0.000001 TTTI-T，支付给创建者。",
  boardTitle: "公开看板",
  boardIntro: "从合约读取的数据：Cycles 储备、永久流动性和创建者持有量。",
  boardLoading: "正在加载公开看板…",
  boardLoadError: "无法加载公开看板。",
  boardCyclesTitle: "Cycles 储备",
  boardCyclesMonths: (months: string) => `相当于 ${months} 个月的实测消耗量`,
  boardCyclesTarget: "目标：一年的消耗量",
  boardCyclesFill: (pct: string) => `已达一年目标的 ${pct}%`,
  boardCyclesFillAria: "Cycles 储备向一年目标的填充进度",
  boardCyclesReserve: (amount: string) => `储备：${amount}`,
  boardCyclesBalance: (cycles: string) => `Canister 的 Cycles：${cycles}`,
  boardCyclesPending: (amount: string) => `尚未结算到储备的费用份额：${amount}`,
  boardCyclesUnknown: "消耗量尚未测得，或缺少汇率；无法计算覆盖率。",
  boardTopUpHint: "任何人都可以为 canister 充值 Cycles。",
  boardTopUpButton: "充值 Cycles",
  boardTopUpRunning: "正在充值…",
  boardTopUpDone: (cycles: string) =>
    `充值完成。Canister 的 Cycles：${cycles}。`,
  boardTopUpNotNeeded: (threshold: string) =>
    `无需充值：Cycles 高于阈值 ${threshold}。`,
  boardTopUpBusy: "已有一笔充值正在进行。",
  boardTopUpError: (detail: string) => `充值失败：${detail}`,
  boardPermanentTitle: "永久流动性",
  boardPermanentIntro:
    "已锁定且任何人都无法提取的池份额。它们被添加到流动性最低的 TTTI-T 池，并记录在公开日志中。",
  boardPermanentNone: "暂无永久流动性。",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `${shares} 份永久份额（占池的 ${pct}%）`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `永久份额所持有：${amount0} 和 ${amount1}`,
  boardPermanentValue: (usd: string) => `价值：${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `已预留，等待下一次注入：${amounts}`,
  boardPermanentNextPool: (pair: string) => `下一个池：${pair}`,
  boardPermanentThreshold: (amount: string) => `注入阈值：${amount}`,
  boardJournalTitle: "最新日志条目",
  boardJournalEmpty: "暂无日志条目。",
  boardJournalTotal: (count: string) => `${count} 条`,
  boardJournalColDate: "日期",
  boardJournalColKind: "类型",
  boardJournalColAmount: "金额",
  boardJournalColShares: "份额",
  boardJournalColDetail: "详情",
  boardJournalRouteNative: "原生池",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "上一页",
  boardJournalNext: "下一页",
  boardJournalRange: (from: string, to: string, total: string) =>
    `第 ${from}–${to} 条，共 ${total} 条`,
  permKindAccrued: "已累积",
  permKindRebalanced: "已再平衡",
  permKindInjected: "已注入",
  permKindWaiting: "等待中",
  permKindFailed: "失败",
  permKindAccruedHint: "为永久流动性预留的协议份额。",
  permKindRebalancedHint: "预留金额已兑换至交易对比例。",
  permKindInjectedHint: "以锁定份额的形式添加到池中。",
  permKindWaitingHint: "等待汇率或阈值。",
  permKindFailedHint: "该步骤失败，并保留在日志中。",
  boardCreatorTitle: "创建者持有量",
  boardCreatorIntro: "合约为创建者按代币持有的金额，包括以 TTTI-T 收到的费用。",
  boardCreatorNone: "暂无创建者持有量。",
  boardCreatorHeld: "持有",
  boardCreatorPaid: "已支付",
  boardCreatorInFlight: "转账中",
  boardCreatorMintFee: "铸造费用",
  boardCreatorBuybackFee: "回购费用",
  boardCreatorSwapFee: "兑换费用份额",
  boardCreatorRouterShare: "路由器费用份额",
  boardCreatorTransferFee: "转账手续费",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `以 TTTI-T 收到的转账手续费：${amount}`,
  boardCreatorCollector: (amount: string) =>
    `费用账户的 TTTI-T 余额：${amount}`,
  boardCreatorLastCredit: (date: string) => `最近入账：${date}`,
};

const PTM4_PT = {
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
    "As taxas de 1 % do mint e da recompra enchem primeiro a reserva de ciclos, até um ano de consumo medido. O restante vai para o criador.",
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
  boardCreatorBuybackFee: "Taxas de recompra",
  boardCreatorSwapFee: "Parte das taxas de swap",
  boardCreatorRouterShare: "Parte das taxas do roteador",
  boardCreatorTransferFee: "Taxas de transferência",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `Taxas de transferência recebidas em TTTI-T: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `Saldo da conta de taxas em TTTI-T: ${amount}`,
  boardCreatorLastCredit: (date: string) => `Último crédito: ${date}`,
};

const PTM4_KO = {
  extendRemainingRule: (min: string, max: string) =>
    `연장 후 남은 기간은 ${min}에서 ${max} 사이여야 합니다.`,
  extendMaxDate: (date: string) => `가능한 가장 늦은 잠금 해제: ${date}`,
  extendCurrentRemaining: (remaining: string) => `현재 남은 기간: ${remaining}`,
  extendNewRemaining: (remaining: string) => `연장 후 남은 기간: ${remaining}`,
  extendFreeNote:
    "이 포지션에는 활성 잠금이 없습니다. 연장하면 지금부터 계산되는 새 잠금이 설정됩니다.",
  extendRemainingTooShort: (min: string) =>
    `연장 후 남은 기간은 최소 ${min} 이상이어야 합니다.`,
  extendRemainingTooLong: (max: string) =>
    `연장 후 남은 기간은 ${max}를 초과할 수 없습니다.`,
  errExtendLockTooShort: (min: string) =>
    `연장 후 남은 기간이 최소 ${min}보다 짧습니다.`,
  errExtendLockTooLong: (date: string) =>
    `잠금은 ${date} 이후에 끝날 수 없습니다.`,
  extendRelayNote:
    "추가된 기간 가중치의 3분의 1이 풀의 다른 잠금 포지션을 단축합니다. 연장한 포지션 자체는 그 연장으로 단축되지 않습니다.",
  feeSplitProtocolTitle: "스왑 수수료 배분",
  feeSplitProtocolRule:
    "스왑 수수료는 유동성 공급자 70 %와 프로토콜 몫 30 %로 나뉩니다.",
  feeSplitLpLine: "수수료의 70 %는 유동성 공급자에게 돌아갑니다.",
  feeSplitCreatorLine:
    "프로토콜 몫의 3분의 2(수수료의 20 %)는 생성자에게 돌아갑니다.",
  feeSplitPermanentLine:
    "프로토콜 몫의 3분의 1(수수료의 10 %)은 아무도 인출할 수 없는 영구 유동성으로 들어갑니다.",
  feeSplitRouterNote: "ICPSwap 라우터의 0.1 % 수수료도 같은 배분을 따릅니다.",
  feeSplitMintNote:
    "민트와 환매의 1 % 수수료는 먼저 측정된 소비량 1년분까지 Cycles 준비금을 채우고, 나머지는 생성자에게 돌아갑니다.",
  transferFeeFixedTitle: "TTTI-T 전송 수수료",
  transferFeeFixed:
    "TTTI-T 전송 수수료는 0.000001 TTTI-T로 고정되어 있으며 생성자에게 지급됩니다.",
  boardTitle: "공개 현황판",
  boardIntro:
    "컨트랙트에서 읽은 수치: Cycles 준비금, 영구 유동성, 생성자 보유분.",
  boardLoading: "공개 현황판을 불러오는 중…",
  boardLoadError: "공개 현황판을 불러올 수 없습니다.",
  boardCyclesTitle: "Cycles 준비금",
  boardCyclesMonths: (months: string) => `측정된 소비량 ${months}개월분`,
  boardCyclesTarget: "목표: 소비량 1년분",
  boardCyclesFill: (pct: string) => `1년 목표의 ${pct} %`,
  boardCyclesFillAria: "1년 목표를 향한 Cycles 준비금 충전률",
  boardCyclesReserve: (amount: string) => `준비금: ${amount}`,
  boardCyclesBalance: (cycles: string) => `캐니스터 Cycles: ${cycles}`,
  boardCyclesPending: (amount: string) =>
    `아직 준비금에 정산되지 않은 수수료 몫: ${amount}`,
  boardCyclesUnknown:
    "소비량이 아직 측정되지 않았거나 환율을 사용할 수 없어 커버리지를 계산할 수 없습니다.",
  boardTopUpHint: "누구나 캐니스터의 Cycles를 충전할 수 있습니다.",
  boardTopUpButton: "Cycles 충전",
  boardTopUpRunning: "충전 중…",
  boardTopUpDone: (cycles: string) =>
    `충전이 완료되었습니다. 캐니스터 Cycles: ${cycles}.`,
  boardTopUpNotNeeded: (threshold: string) =>
    `충전이 필요하지 않습니다. Cycles가 기준값 ${threshold}보다 많습니다.`,
  boardTopUpBusy: "이미 충전이 진행 중입니다.",
  boardTopUpError: (detail: string) => `충전에 실패했습니다: ${detail}`,
  boardPermanentTitle: "영구 유동성",
  boardPermanentIntro:
    "아무도 인출할 수 없는 잠긴 풀 지분입니다. 유동성이 가장 적은 TTTI-T 풀에 추가되며 공개 기록에 남습니다.",
  boardPermanentNone: "아직 영구 유동성이 없습니다.",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `영구 지분 ${shares} (풀의 ${pct} %)`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `영구 지분이 보유한 자산: ${amount0} 및 ${amount1}`,
  boardPermanentValue: (usd: string) => `가치: ${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `따로 보관 중, 다음 투입 대기: ${amounts}`,
  boardPermanentNextPool: (pair: string) => `다음 풀: ${pair}`,
  boardPermanentThreshold: (amount: string) => `투입 기준값: ${amount}`,
  boardJournalTitle: "최근 기록",
  boardJournalEmpty: "아직 기록이 없습니다.",
  boardJournalTotal: (count: string) => `${count}건`,
  boardJournalColDate: "날짜",
  boardJournalColKind: "유형",
  boardJournalColAmount: "금액",
  boardJournalColShares: "지분",
  boardJournalColDetail: "상세",
  boardJournalRouteNative: "네이티브 풀",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "이전",
  boardJournalNext: "다음",
  boardJournalRange: (from: string, to: string, total: string) =>
    `${from}–${to} / ${total}`,
  permKindAccrued: "적립됨",
  permKindRebalanced: "재조정됨",
  permKindInjected: "투입됨",
  permKindWaiting: "대기 중",
  permKindFailed: "실패",
  permKindAccruedHint: "영구 유동성을 위해 따로 보관한 프로토콜 몫입니다.",
  permKindRebalancedHint: "따로 보관한 금액을 페어 비율에 맞게 교환했습니다.",
  permKindInjectedHint: "잠긴 지분으로 풀에 추가되었습니다.",
  permKindWaitingHint: "환율 또는 기준값을 기다리는 중입니다.",
  permKindFailedHint: "단계가 실패했으며 기록에 남습니다.",
  boardCreatorTitle: "생성자 보유분",
  boardCreatorIntro:
    "컨트랙트가 토큰별로 생성자를 위해 보유한 금액과 TTTI-T로 받은 수수료입니다.",
  boardCreatorNone: "아직 생성자 보유분이 없습니다.",
  boardCreatorHeld: "보유",
  boardCreatorPaid: "지급됨",
  boardCreatorInFlight: "전송 중",
  boardCreatorMintFee: "민트 수수료",
  boardCreatorBuybackFee: "환매 수수료",
  boardCreatorSwapFee: "스왑 수수료 몫",
  boardCreatorRouterShare: "라우터 수수료 몫",
  boardCreatorTransferFee: "전송 수수료",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `TTTI-T로 받은 전송 수수료: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `수수료 계정의 TTTI-T 잔액: ${amount}`,
  boardCreatorLastCredit: (date: string) => `마지막 입금: ${date}`,
};

const PTM4_PA = {
  extendRemainingRule: (min: string, max: string) =>
    `ਵਧਾਉਣ ਤੋਂ ਬਾਅਦ, ਬਾਕੀ ਸਮਾਂ ${min} ਅਤੇ ${max} ਦੇ ਵਿਚਕਾਰ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।`,
  extendMaxDate: (date: string) => `ਸਭ ਤੋਂ ਦੇਰ ਦੀ ਸੰਭਵ ਅਨਲੌਕ ਮਿਤੀ: ${date}`,
  extendCurrentRemaining: (remaining: string) => `ਮੌਜੂਦਾ ਬਾਕੀ ਸਮਾਂ: ${remaining}`,
  extendNewRemaining: (remaining: string) =>
    `ਵਧਾਉਣ ਤੋਂ ਬਾਅਦ ਬਾਕੀ ਸਮਾਂ: ${remaining}`,
  extendFreeNote:
    "ਇਸ ਪੋਜ਼ੀਸ਼ਨ ਉੱਤੇ ਕੋਈ ਸਰਗਰਮ ਲੌਕ ਨਹੀਂ ਹੈ। ਇਸਨੂੰ ਵਧਾਉਣ ਨਾਲ ਹੁਣ ਤੋਂ ਗਿਣਿਆ ਜਾਣ ਵਾਲਾ ਨਵਾਂ ਲੌਕ ਲੱਗਦਾ ਹੈ।",
  extendRemainingTooShort: (min: string) =>
    `ਵਧਾਉਣ ਤੋਂ ਬਾਅਦ ਬਾਕੀ ਸਮਾਂ ਘੱਟੋ-ਘੱਟ ${min} ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।`,
  extendRemainingTooLong: (max: string) =>
    `ਵਧਾਉਣ ਤੋਂ ਬਾਅਦ ਬਾਕੀ ਸਮਾਂ ${max} ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋ ਸਕਦਾ।`,
  errExtendLockTooShort: (min: string) =>
    `ਵਧਾਉਣ ਤੋਂ ਬਾਅਦ ਬਾਕੀ ਸਮਾਂ ਘੱਟੋ-ਘੱਟ ${min} ਤੋਂ ਘੱਟ ਹੈ।`,
  errExtendLockTooLong: (date: string) => `ਲੌਕ ${date} ਤੋਂ ਬਾਅਦ ਖ਼ਤਮ ਨਹੀਂ ਹੋ ਸਕਦਾ।`,
  extendRelayNote:
    "ਜੋੜੇ ਗਏ ਸਮੇਂ ਦੇ ਭਾਰ ਦਾ ਇੱਕ ਤਿਹਾਈ ਹਿੱਸਾ ਪੂਲ ਦੀਆਂ ਹੋਰ ਵਚਨਬੱਧ ਪੋਜ਼ੀਸ਼ਨਾਂ ਨੂੰ ਛੋਟਾ ਕਰਦਾ ਹੈ। ਵਧਾਈ ਗਈ ਪੋਜ਼ੀਸ਼ਨ ਆਪਣੇ ਵਧਾਉਣ ਨਾਲ ਛੋਟੀ ਨਹੀਂ ਹੁੰਦੀ।",
  feeSplitProtocolTitle: "ਸਵੈਪ ਫੀਸ ਦੀ ਵੰਡ",
  feeSplitProtocolRule:
    "ਸਵੈਪ ਫੀਸ 70 % ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਲਈ ਅਤੇ 30 % ਪ੍ਰੋਟੋਕੋਲ ਹਿੱਸੇ ਵਿੱਚ ਵੰਡੀ ਜਾਂਦੀ ਹੈ।",
  feeSplitLpLine: "ਫੀਸ ਦਾ 70 % ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ ਜਾਂਦਾ ਹੈ।",
  feeSplitCreatorLine: "ਪ੍ਰੋਟੋਕੋਲ ਹਿੱਸੇ ਦਾ ਦੋ ਤਿਹਾਈ (ਫੀਸ ਦਾ 20 %) ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ।",
  feeSplitPermanentLine:
    "ਪ੍ਰੋਟੋਕੋਲ ਹਿੱਸੇ ਦਾ ਇੱਕ ਤਿਹਾਈ (ਫੀਸ ਦਾ 10 %) ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਨੂੰ ਜਾਂਦਾ ਹੈ, ਜਿਸਨੂੰ ਕੋਈ ਵੀ ਕਢਵਾ ਨਹੀਂ ਸਕਦਾ।",
  feeSplitRouterNote: "ICPSwap ਰਾਊਟਰ ਦੀ 0.1 % ਫੀਸ ਵੀ ਇਹੀ ਵੰਡ ਮੰਨਦੀ ਹੈ।",
  feeSplitMintNote:
    "ਮਿੰਟ ਅਤੇ ਬਾਇਬੈਕ ਦੀਆਂ 1 % ਫੀਸਾਂ ਪਹਿਲਾਂ ਮਾਪੀ ਗਈ ਖਪਤ ਦੇ ਇੱਕ ਸਾਲ ਤੱਕ Cycles ਰਿਜ਼ਰਵ ਭਰਦੀਆਂ ਹਨ। ਬਾਕੀ ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ।",
  transferFeeFixedTitle: "TTTI-T ਟ੍ਰਾਂਸਫਰ ਫੀਸ",
  transferFeeFixed:
    "TTTI-T ਦੀ ਟ੍ਰਾਂਸਫਰ ਫੀਸ 0.000001 TTTI-T ਉੱਤੇ ਨਿਸ਼ਚਿਤ ਹੈ ਅਤੇ ਸਿਰਜਣਹਾਰ ਨੂੰ ਅਦਾ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",
  boardTitle: "ਜਨਤਕ ਬੋਰਡ",
  boardIntro:
    "ਕੰਟਰੈਕਟ ਤੋਂ ਪੜ੍ਹੇ ਅੰਕੜੇ: Cycles ਰਿਜ਼ਰਵ, ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਅਤੇ ਸਿਰਜਣਹਾਰ ਕੋਲ ਰਕਮਾਂ।",
  boardLoading: "ਜਨਤਕ ਬੋਰਡ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
  boardLoadError: "ਜਨਤਕ ਬੋਰਡ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ।",
  boardCyclesTitle: "Cycles ਰਿਜ਼ਰਵ",
  boardCyclesMonths: (months: string) => `ਮਾਪੀ ਗਈ ਖਪਤ ਦੇ ${months} ਮਹੀਨੇ`,
  boardCyclesTarget: "ਟੀਚਾ: ਖਪਤ ਦਾ ਇੱਕ ਸਾਲ",
  boardCyclesFill: (pct: string) => `ਇੱਕ ਸਾਲ ਦੇ ਟੀਚੇ ਦਾ ${pct} %`,
  boardCyclesFillAria: "ਇੱਕ ਸਾਲ ਦੇ ਟੀਚੇ ਵੱਲ Cycles ਰਿਜ਼ਰਵ ਦਾ ਭਰਨਾ",
  boardCyclesReserve: (amount: string) => `ਰਿਜ਼ਰਵ: ${amount}`,
  boardCyclesBalance: (cycles: string) => `ਕੈਨਿਸਟਰ ਦੇ Cycles: ${cycles}`,
  boardCyclesPending: (amount: string) =>
    `ਰਿਜ਼ਰਵ ਵਿੱਚ ਹਾਲੇ ਨਾ ਪਹੁੰਚਿਆ ਫੀਸ ਹਿੱਸਾ: ${amount}`,
  boardCyclesUnknown:
    "ਖਪਤ ਹਾਲੇ ਮਾਪੀ ਨਹੀਂ ਗਈ ਜਾਂ ਕੋਈ ਦਰ ਉਪਲਬਧ ਨਹੀਂ; ਕਵਰੇਜ ਦੀ ਗਣਨਾ ਨਹੀਂ ਹੋ ਸਕਦੀ।",
  boardTopUpHint: "ਕੋਈ ਵੀ ਕੈਨਿਸਟਰ ਦੇ Cycles ਭਰ ਸਕਦਾ ਹੈ।",
  boardTopUpButton: "Cycles ਭਰੋ",
  boardTopUpRunning: "ਭਰਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  boardTopUpDone: (cycles: string) =>
    `ਭਰਨਾ ਪੂਰਾ ਹੋਇਆ। ਕੈਨਿਸਟਰ ਦੇ Cycles: ${cycles}।`,
  boardTopUpNotNeeded: (threshold: string) =>
    `ਭਰਨ ਦੀ ਲੋੜ ਨਹੀਂ: Cycles ${threshold} ਦੀ ਹੱਦ ਤੋਂ ਉੱਪਰ ਹਨ।`,
  boardTopUpBusy: "ਇੱਕ ਭਰਨਾ ਪਹਿਲਾਂ ਹੀ ਚੱਲ ਰਿਹਾ ਹੈ।",
  boardTopUpError: (detail: string) => `ਭਰਨਾ ਅਸਫਲ ਰਿਹਾ: ${detail}`,
  boardPermanentTitle: "ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ",
  boardPermanentIntro:
    "ਲੌਕ ਕੀਤੇ ਪੂਲ ਹਿੱਸੇ ਜਿਨ੍ਹਾਂ ਨੂੰ ਕੋਈ ਵੀ ਕਢਵਾ ਨਹੀਂ ਸਕਦਾ। ਇਹ ਸਭ ਤੋਂ ਘੱਟ ਲਿਕਵਿਡ TTTI-T ਪੂਲ ਵਿੱਚ ਜੋੜੇ ਜਾਂਦੇ ਹਨ ਅਤੇ ਜਨਤਕ ਜਰਨਲ ਵਿੱਚ ਦਰਜ ਹੁੰਦੇ ਹਨ।",
  boardPermanentNone: "ਹਾਲੇ ਕੋਈ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਨਹੀਂ।",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `${shares} ਸਥਾਈ ਹਿੱਸੇ (ਪੂਲ ਦਾ ${pct} %)`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `ਸਥਾਈ ਹਿੱਸਿਆਂ ਕੋਲ: ${amount0} ਅਤੇ ${amount1}`,
  boardPermanentValue: (usd: string) => `ਮੁੱਲ: ${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `ਵੱਖ ਰੱਖਿਆ, ਅਗਲੇ ਟੀਕੇ ਦੀ ਉਡੀਕ ਵਿੱਚ: ${amounts}`,
  boardPermanentNextPool: (pair: string) => `ਅਗਲਾ ਪੂਲ: ${pair}`,
  boardPermanentThreshold: (amount: string) => `ਟੀਕੇ ਦੀ ਹੱਦ: ${amount}`,
  boardJournalTitle: "ਜਰਨਲ ਦੀਆਂ ਤਾਜ਼ਾ ਐਂਟਰੀਆਂ",
  boardJournalEmpty: "ਹਾਲੇ ਕੋਈ ਜਰਨਲ ਐਂਟਰੀ ਨਹੀਂ।",
  boardJournalTotal: (count: string) => `${count} ਐਂਟਰੀਆਂ`,
  boardJournalColDate: "ਮਿਤੀ",
  boardJournalColKind: "ਕਿਸਮ",
  boardJournalColAmount: "ਰਕਮ",
  boardJournalColShares: "ਹਿੱਸੇ",
  boardJournalColDetail: "ਵੇਰਵਾ",
  boardJournalRouteNative: "ਨੇਟਿਵ ਪੂਲ",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "ਪਿਛਲਾ",
  boardJournalNext: "ਅਗਲਾ",
  boardJournalRange: (from: string, to: string, total: string) =>
    `${total} ਵਿੱਚੋਂ ${from}–${to}`,
  permKindAccrued: "ਜਮ੍ਹਾਂ",
  permKindRebalanced: "ਮੁੜ ਸੰਤੁਲਿਤ",
  permKindInjected: "ਪਾਇਆ ਗਿਆ",
  permKindWaiting: "ਉਡੀਕ ਵਿੱਚ",
  permKindFailed: "ਅਸਫਲ",
  permKindAccruedHint: "ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਲਈ ਵੱਖ ਰੱਖਿਆ ਪ੍ਰੋਟੋਕੋਲ ਹਿੱਸਾ।",
  permKindRebalancedHint: "ਵੱਖ ਰੱਖੀਆਂ ਰਕਮਾਂ ਜੋੜੇ ਦੇ ਅਨੁਪਾਤ ਵੱਲ ਬਦਲੀਆਂ ਗਈਆਂ।",
  permKindInjectedHint: "ਲੌਕ ਕੀਤੇ ਹਿੱਸਿਆਂ ਵਜੋਂ ਪੂਲ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ।",
  permKindWaitingHint: "ਦਰ ਜਾਂ ਹੱਦ ਦੀ ਉਡੀਕ ਵਿੱਚ।",
  permKindFailedHint: "ਇਹ ਕਦਮ ਅਸਫਲ ਰਿਹਾ ਅਤੇ ਜਰਨਲ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ।",
  boardCreatorTitle: "ਸਿਰਜਣਹਾਰ ਕੋਲ ਰਕਮਾਂ",
  boardCreatorIntro:
    "ਕੰਟਰੈਕਟ ਵੱਲੋਂ ਸਿਰਜਣਹਾਰ ਲਈ ਹਰ ਟੋਕਨ ਅਨੁਸਾਰ ਰੱਖੀਆਂ ਰਕਮਾਂ, TTTI-T ਵਿੱਚ ਮਿਲੀਆਂ ਫੀਸਾਂ ਸਮੇਤ।",
  boardCreatorNone: "ਹਾਲੇ ਸਿਰਜਣਹਾਰ ਕੋਲ ਕੋਈ ਰਕਮ ਨਹੀਂ।",
  boardCreatorHeld: "ਰੱਖੀ ਹੋਈ",
  boardCreatorPaid: "ਅਦਾ ਕੀਤੀ",
  boardCreatorInFlight: "ਰਾਹ ਵਿੱਚ",
  boardCreatorMintFee: "ਮਿੰਟ ਫੀਸਾਂ",
  boardCreatorBuybackFee: "ਬਾਇਬੈਕ ਫੀਸਾਂ",
  boardCreatorSwapFee: "ਸਵੈਪ ਫੀਸ ਹਿੱਸਾ",
  boardCreatorRouterShare: "ਰਾਊਟਰ ਫੀਸ ਹਿੱਸਾ",
  boardCreatorTransferFee: "ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `TTTI-T ਵਿੱਚ ਮਿਲੀਆਂ ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `TTTI-T ਵਿੱਚ ਫੀਸ ਖਾਤੇ ਦਾ ਬਕਾਇਆ: ${amount}`,
  boardCreatorLastCredit: (date: string) => `ਆਖਰੀ ਜਮ੍ਹਾਂ: ${date}`,
};

export const DEX_TEXT = defineDict({
  en: {
    title: "Pools",
    intro:
      "Constant-product pools held by this contract. Each pair has a fee tier and its own pool subaccount.",
    statusFilling: "Filling",
    statusActive: "Active",
    statusRemoved: "Removed",
    newPairBadge: "New pair",
    approvalNotRecommendation: "Approval of a pair is not a recommendation.",
    tttiPair: "TTTI-T pair",
    utilityPair: "Utility pair",
    feeTier: "Fee tier",
    feeTierBps5: "0.05 %",
    feeTierBps30: "0.3 %",
    feeTierBps100: "1 %",
    poolSubaccount: "Pool subaccount",
    minimumLocked: "Minimum locked liquidity",
    minimumTttiSide: (amount: string) => `${amount} TTTI-T on the TTTI-T side`,
    minimumPerToken: "Minimum per token, set by the admin",
    minimumNotSet: "Not set yet",
    firstDepositRule: "The first deposit of an empty pool has no minimum.",
    launchDepthRule: (amount: string) =>
      `Swaps open when a TTTI-T pair holds ${amount} USD of TTTI-T in the pool (its TTTI-T side at the pool price, equal to its other side at the oracle rate), or when a utility pair reaches ${amount} USD of depth (both sides added at the hourly rates). Below this threshold the pool stays filling: creating the pool, depositing, adding liquidity, buying and minting remain open; only swaps are closed.`,
    lockedSharesRule:
      "The minimum locked shares, computed as √(A×B) at the first deposit, belong to the contract forever.",
    removedNotice:
      "This pair has been removed. All positions were liquidated. Swaps and additions are closed.",
    protocolStatement:
      "The protocol never places a price-linked order and creates no TTTI-T for pools. Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price. The protocol share of swap fees goes two thirds to the creator and one third to permanent liquidity, which nobody can withdraw.",
    loading: "Loading pools…",
    loadError: "The pools could not be loaded.",
    requestTitle: "Request a pair",
    ledgerId: "Ledger ID",
    ledgerIdPlaceholder: "Ledger canister ID",
    ledgerIdInvalid: "Enter a valid ledger canister ID.",
    counterToken: "Counter token",
    counterTokenPlaceholder: "Choose a token",
    message: "Message",
    messageMax: (max: string) => `${max} characters max.`,
    deposit: (amount: string) => `Deposit: ${amount} TTTI-T`,
    depositApproval: (amount: string) =>
      `Before the request, you approve ${amount} TTTI-T (deposit plus ledger fee) to the contract. The approval expires after 15 minutes.`,
    depositRule: "The deposit is returned on approval and kept on refusal.",
    approving: "Approving…",
    submit: "Submit request",
    submitting: "Submitting…",
    submitted: "Request submitted.",
    signInNeeded: "Sign in to request a pair.",
    requestsTitle: "Requests",
    myRequestsTitle: "My requests",
    noRequests: "No pair requests.",
    requestStatusPending: "Pending",
    requestStatusApproved: "Approved",
    requestStatusRefused: "Refused",
    refusedReason: (reason: string) => `Reason: ${reason}`,
    copiedSymbol: "Copied symbol",
    copiedSymbolOf: (symbol: string) => `Symbol also used by ${symbol}`,
    errAnonymous: "Sign in to request a pair.",
    errMessageTooLong: (max: string) =>
      `The message is longer than ${max} characters.`,
    errInvalidToken: (detail: string) =>
      `This ledger cannot be used: ${detail}`,
    errUnknownCounterToken: "The counter token is not available.",
    errLedgerUnreachable: (detail: string) =>
      `The ledger could not be reached: ${detail}`,
    errMissingStandards: (standards: string) =>
      `The ledger does not support ${standards}.`,
    errMetadataUnavailable: (detail: string) =>
      `The ledger metadata could not be read: ${detail}`,
    errPairExists: "This pair already exists or is already requested.",
    errTooManyPending: (max: string) =>
      `You already have ${max} pending requests.`,
    errCooldown: (date: string) =>
      `After a refusal, a new request is possible from ${date}.`,
    errInsufficientAllowance: (allowance: string, required: string) =>
      `The approval covers ${allowance} TTTI-T; ${required} TTTI-T is required.`,
    errInsufficientFunds: (balance: string) =>
      `Your TTTI-T balance (${balance} TTTI-T) does not cover the deposit and the fee.`,
    errDepositFailed: (detail: string) =>
      `The deposit could not be taken: ${detail}`,
    errApprovalFailed: (detail: string) =>
      `The TTTI-T approval failed: ${detail}`,
    // DEX lot 2: balances, DD deposits, DW withdrawals, DQ refunds.
    // Amounts are passed formatted with their symbol.
    balancesTitle: "My DEX balances",
    balancesSignIn: "Sign in to see your DEX balances.",
    balancesLoading: "Loading balances…",
    balancesLoadError: "The balances could not be loaded.",
    balancesEmpty: "No DEX balance.",
    colToken: "Token",
    colAvailable: "Available",
    colReserved: "Reserved",
    depositButton: "Deposit",
    withdrawButton: "Withdraw",
    depositTitle: (symbol: string) => `Deposit ${symbol}`,
    withdrawTitle: (symbol: string) => `Withdraw ${symbol}`,
    amountLabel: "Amount",
    amountPlaceholder: "0.00",
    amountInvalid: "Enter a valid amount.",
    availableAmount: (amount: string) => `Available: ${amount}`,
    minimumDeposit: (amount: string) => `Minimum deposit: ${amount}`,
    minimumWithdrawal: (amount: string) => `Minimum withdrawal: ${amount}`,
    depositFeeNote: (fee: string) =>
      `You approve the amount plus the ledger fee (${fee}) to the contract. The approval expires after 15 minutes.`,
    withdrawFeeNote: (fee: string) =>
      `The ledger fee (${fee}) is deducted from the amount withdrawn.`,
    withdrawReceive: (amount: string) => `You receive: ${amount}`,
    confirmDeposit: "Confirm deposit",
    confirmWithdraw: "Confirm withdrawal",
    cancel: "Cancel",
    depositing: "Depositing…",
    withdrawing: "Withdrawing…",
    depositDone: "Deposit completed.",
    withdrawDone: "Withdrawal completed.",
    transfersTitle: "DEX transfers",
    noTransfers: "No DEX transfers.",
    directionDeposit: "Deposit",
    directionWithdrawal: "Withdrawal",
    transferStatusInProgress: "In progress",
    transferStatusCompleted: "Completed",
    transferStatusFailed: "Failed",
    transferStatusNeedsReview: "To review",
    transferBlock: (block: string) => `Block ${block}`,
    transferError: (detail: string) => `Error: ${detail}`,
    memo: "Memo",
    errDexAnonymous: "Sign in to deposit or withdraw.",
    errAmountTooSmall: (minimum: string) => `The minimum is ${minimum}.`,
    errTransferInProgress:
      "A transfer of this token is already in progress. Try again later.",
    errDexInsufficientAllowance: (allowance: string, required: string) =>
      `The approval covers ${allowance}; ${required} is required.`,
    errDexInsufficientFunds: (balance: string) =>
      `Your balance (${balance}) does not cover the amount and the fee.`,
    errDexInsufficientBalance: (available: string) =>
      `Your available DEX balance is ${available}.`,
    errLedger: (detail: string) => `The ledger returned an error: ${detail}`,
    errDexApprovalFailed: (detail: string) => `The approval failed: ${detail}`,
    lookupTitle: "DEX balances by identifier",
    lookupLabel: "Principal",
    lookupPlaceholder: "Principal ID",
    lookupButton: "Look up",
    lookupInvalid: "Enter a valid principal.",
    lookupEmpty: "No DEX balance for this principal.",
    depositSubaccount: "Deposit subaccount",
    copyDepositSubaccount: "Copy deposit subaccount",
    copied: "Copied",
    refundLabel: "Deposit refund",
    refundNone: "No refund",
    refundInProgress: "Refund in progress",
    refundNeedsReview: "Refund to review",
    refundRefunded: (block: string) => `Refunded (block ${block})`,
    privacyPositions:
      "Liquidity positions are public and linked to your identifier on TTTI.",
    privacyDeposit: "Your deposit stays visible on the chain.",
    // DEX lot 3: filling gauge, liquidity positions, swaps.
    // Amounts, USD values, percentages and dates are passed formatted.
    gaugeLabel: "Filling gauge",
    gaugeFilling: (current: string, target: string, remaining: string) =>
      `${current} / ${target} USD — ${remaining} USD remaining to reach the swap threshold`,
    gaugeOpen: (current: string, target: string) =>
      `${current} / ${target} USD`,
    gaugeUnavailable: "Value momentarily unavailable",
    reserves: "Reserves",
    totalShares: "Total shares",
    addLiquidityButton: "Add liquidity",
    swapButton: "Swap",
    positionsButton: "Positions",
    signInForActions: "Sign in to add liquidity or swap.",
    pairTokensUnsupported:
      "Liquidity and swaps are not available for the tokens of this pair.",
    swapsClosedFilling: (gauge: string) =>
      `Swaps are closed while the pool is filling: ${gauge}`,
    addTitle: (pair: string) => `Add liquidity · ${pair}`,
    addIntro:
      "The amounts are taken from your available DEX balances. Liquidity positions are public and linked to your identifier on TTTI. Your deposit stays visible on the chain.",
    sideLabel: "Token entered",
    tokenAmountLabel: (symbol: string) => `${symbol} amount`,
    firstDepositNote:
      "First deposit: enter both amounts. Their ratio sets the pool ratio.",
    counterComputed: (amount: string) =>
      `Counter amount at the pool ratio: ${amount}`,
    sharesToReceive: (shares: string) => `Shares to receive: ${shares}`,
    sharesLockedForever: (shares: string) =>
      `Shares locked to the contract forever: ${shares}`,
    gaugeAfter: (gauge: string) => `Gauge after the deposit: ${gauge}`,
    opensPool: "This deposit opens the pool to swaps.",
    staysFilling: "The pool stays in filling after this deposit.",
    quoting: "Computing the quote…",
    lockLabel: "Lock duration",
    lockHint: (min: string, max: string) =>
      `Optional: no lock by default. A lock lasts from ${min} to ${max}. Its owner can extend it, never shorten it.`,
    lockPreset1d: "1 day",
    lockPreset7d: "7 days",
    lockPreset30d: "30 days",
    lockPreset90d: "90 days",
    lockPreset3m: "3 months",
    lockPreset2y: "2 years",
    lockPreset3y: "3 years",
    lockPreset4y: "4 years",
    lockPreset1y: "1 year",
    lockPreset5y: "5 years",
    lockCustom: "Custom",
    lockCustomDays: "Number of days",
    lockInvalid: (min: string, max: string) =>
      `Enter a duration from ${min} to ${max}.`,
    durationDays: (days: string) => `${days} days`,
    durationOneDay: "1 day",
    unlockOn: (date: string) => `Unlock: ${date}`,
    confirmAdd: "Add liquidity",
    adding: "Adding liquidity…",
    addDone: (id: string, shares: string) =>
      `Position #${id} created with ${shares} shares.`,
    refTitle: "ICPSwap reference price",
    refQuote: (input: string, output: string) =>
      `ICPSwap quote: ${input} → ${output} (ICPSwap fee included). Reference only.`,
    refDeviation: (pct: string) =>
      `Your deposit ratio differs from this reference by ${pct} %.`,
    refDeviationWarning: (pct: string) =>
      `Warning: your deposit ratio differs from the ICPSwap reference by ${pct} %, more than 2 %.`,
    refUnavailable:
      "No ICPSwap pool exists for this pair; the reference price is unavailable.",
    refError: "The ICPSwap reference price could not be read.",
    refLoading: "Reading the ICPSwap price…",
    positionsTitle: (pair: string) => `Positions · ${pair}`,
    positionsEmpty: "No position in this pool.",
    positionsLoading: "Loading positions…",
    positionsLoadError: "The positions could not be loaded.",
    colOwner: "Owner",
    colPair: "Pair",
    colShares: "Shares",
    colAmounts: "Amounts",
    colLock: "Lock",
    colUnlock: "Unlock",
    creatorBadge: "Creator",
    copyPrincipal: "Copy principal",
    unlockedLabel: "Unlocked",
    positionLabel: (id: string) => `Position #${id}`,
    myPositionsTitle: "My positions",
    myPositionsEmpty: "You have no liquidity position.",
    myPositionsNote:
      "Withdrawing a position credits your DEX balances. Use Withdraw in My DEX balances to send the tokens to your wallet.",
    withdrawPosition: "Withdraw",
    withdrawingPosition: "Withdrawing…",
    positionWithdrawn: (amount0: string, amount1: string) =>
      `Withdrawn: ${amount0} and ${amount1} credited to your DEX balances.`,
    lockedUntil: (date: string) => `Locked until ${date}.`,
    removedWithdrawOpen:
      "Withdrawal follows the unlock date in every pool state.",
    extendLockButton: "Extend lock",
    extendTitle: (id: string) => `Extend lock · position #${id}`,
    extendCurrent: (date: string) => `Current unlock: ${date}`,
    extendModeDate: "Date",
    extendModeDays: "Days",
    extendDateLabel: "New unlock date",
    extendDaysLabel: "Days added to the current unlock",
    extendNewUnlock: (date: string) => `New unlock: ${date}`,
    extendTooEarly: "The new unlock must be later than the current unlock.",
    extendTooLate: (date: string) =>
      `The new unlock cannot be later than ${date}.`,
    confirmExtend: "Confirm extension",
    extending: "Extending…",
    extendDone: (date: string) => `Lock extended until ${date}.`,
    swapTitle: (pair: string) => `Swap · ${pair}`,
    swapIntro:
      "The swap uses your available DEX balances; the output is credited to them.",
    swapFrom: "Token sold",
    swapAmountOut: "You receive (estimate)",
    swapFee: (pct: string) => `Fee (${pct})`,
    swapPriceImpact: "Price impact",
    swapMinimum: "Minimum received",
    slippageLabel: "Slippage tolerance (%)",
    slippageInvalid: "Enter a tolerance from 0 to 50 %.",
    swapDeadlineNote: "The deadline is set to 5 minutes after confirmation.",
    confirmSwap: "Confirm swap",
    swapping: "Swapping…",
    swapDone: (input: string, output: string) =>
      `Swapped ${input} for ${output}.`,
    errLiqAnonymous: "Sign in to use the pools.",
    errPoolNotFound: "This pool does not exist.",
    errPoolRemoved:
      "This pair has been removed. Deposits and swaps are blocked.",
    errMinimumsNotSet: "The minimums of this pair are not set yet.",
    errUnsupportedToken: "This token is not supported by the DEX.",
    errZeroAmount: "Enter an amount above zero.",
    errCounterAmountRequired: "First deposit: enter both amounts.",
    errLiqInsufficientBalance: (available: string, required: string) =>
      `Your available DEX balance is ${available}; ${required} is required.`,
    errBelowMinimum: (minimums: string) =>
      `The deposit is below the minimum: ${minimums}.`,
    errRatioMismatch: (required: string) =>
      `At the pool ratio, the counter amount must be ${required}.`,
    errLockTooShort: (min: string) => `The lock is too short. Minimum: ${min}.`,
    errLockTooLong: (max: string) => `The lock is too long. Maximum: ${max}.`,
    errZeroShares: "This deposit is too small to receive shares.",
    errOperationInProgress:
      "Another operation on this account is in progress. Try again shortly.",
    errPositionNotFound: "This position does not exist.",
    errNotPositionOwner: "This position belongs to another principal.",
    errPositionLocked: (date: string) =>
      `This position is locked until ${date}.`,
    errCannotShortenLock: (date: string) =>
      `A lock cannot be shortened. Current unlock: ${date}.`,
    errUnlockTooLate: (date: string) =>
      `The unlock date cannot be later than ${date}.`,
    errPoolFilling: (gauge: string) => `The pool is still filling: ${gauge}`,
    errPoolNotOpen: "This pool is not open to swaps.",
    errRateUnavailable:
      "A USD rate is momentarily unavailable; the pool value cannot be checked.",
    errTokenNotInPool: "This token is not part of the pair.",
    errInvalidSlippage: (max: string) =>
      `The slippage tolerance must be at most ${max} %.`,
    errSwapInsufficientBalance: (available: string) =>
      `Your available DEX balance is ${available}.`,
    errInsufficientLiquidity:
      "The pool does not have enough liquidity for this swap.",
    errSlippageExceeded: (out: string, min: string) =>
      `Slippage exceeded: the swap would give ${out}, below the minimum ${min}. Get a new quote.`,
    errDeadlineExceeded: (date: string) =>
      `The deadline (${date}) has passed. Confirm again.`,
    errDeadlineTooFar: (date: string) =>
      `The deadline is too far; the latest accepted is ${date}.`,
    errCall: (detail: string) => `The call failed: ${detail}`,
    // DEX lot 4: ICP bonus (DL) of locked TTTI-T-pair positions, protocol liquidity.
    // Amounts, percentages and dates are passed formatted. Observed amounts only.
    bonusTitle: "ICP bonus for locked positions",
    bonusScope:
      "ICP bonuses already earned by locked positions in TTTI-T pairs remain claimable. Swap fees add no new bonus.",
    bonusWeightRule:
      "Weight of a position = value in ICP × remaining lock time ÷ 5 years.",
    bonusObservedNote:
      "The bonus shows observed amounts only. No future amount is estimated or promised.",
    bonusSignIn: "Sign in to see your ICP bonus.",
    bonusLoading: "Loading the bonus…",
    bonusLoadError: "The bonus could not be loaded.",
    bonusClaimable: (amount: string) => `Claimable: ${amount}`,
    bonusClaimedTotal: (amount: string) => `Claimed in total: ${amount}`,
    bonusNoPositions: "No locked position in a TTTI-T pair.",
    bonusColPosition: "Position",
    bonusColValueIcp: "Value in ICP",
    bonusColRemainingLock: "Remaining lock",
    bonusColWeight: "Weight",
    bonusClaimsTitle: "Claims",
    bonusClaimsEmpty: "No claim yet.",
    claimButton: "Claim ICP bonus",
    claiming: "Claiming…",
    claimDone: (amount: string) =>
      `Claim of ${amount} recorded. The ICP is sent to your wallet.`,
    errClaimAnonymous: "Sign in to claim the bonus.",
    errClaimNothing: "There is nothing to claim.",
    errClaimBelowMinimum: (minimum: string) =>
      `The claimable amount is below the minimum of ${minimum}.`,
    errClaimInProgress: "A claim is already in progress. Try again shortly.",
    protocolLiquidityTitle: "Protocol liquidity",
    protocolLiquidityLocked: "Locked forever. It has no withdrawal path.",
    protocolLiquidityHeld: (amount0: string, amount1: string) =>
      `Held: ${amount0} and ${amount1}`,
    protocolLiquidityFromFees: (amount0: string, amount1: string) =>
      `From fees: ${amount0} and ${amount1}`,
    protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
      `From the treasury: ${amount0} and ${amount1}`,
    protocolLiquidityShare: (pct: string) => `${pct} % of the pool shares`,
    protocolLiquidityLastAdded: (date: string) => `Last added: ${date}`,
    protocolLiquidityNone: "No protocol liquidity in this pool.",
    dexPausedTitle: "DEX paused",
    dexPausedNotice: (token: string) =>
      `The DEX is paused after a reserve check found a shortfall for ${token}. Swaps, deposits and liquidity additions are unavailable. Withdrawals and liquidity removal remain available.`,
    dexPausedTooltip: "Unavailable while the DEX is paused.",
    errDexPaused:
      "The DEX is paused after a reserve check. Swaps, deposits and liquidity additions are unavailable. Withdrawals and liquidity removal remain available.",
    // Pools page layout: section nav, rows, accordions, filters.
    navLabel: "Pools page sections",
    navPools: "Pools",
    navIndicators: "Indicators",
    navMyLiquidity: "My liquidity",
    navProtocol: "Protocol",
    navRequests: "Requests",
    introShort: "Constant-product pools held by this contract.",
    statusWaiting: "Waiting for liquidity",
    statusOpen: "Open",
    detailsLabel: "Details",
    addShort: "Add",
    howPoolsWorkTitle: "How pools work",
    permanentLiquidity: "Permanent liquidity",
    permanentLiquidityValue: (shares: string, pct: string) =>
      `${shares} shares (${pct} % of the pool)`,
    myLiquiditySignIn:
      "Sign in to see your DEX balances, liquidity positions and fees received.",
    rewardsTitle: "Fees received",
    activityTitle: "My activity",
    activityFilterLabel: "Activity type",
    filterAll: "All",
    filterTransfers: "Deposits & withdrawals",
    filterMintFees: "Mint fees",
    filterLpBonus: "LP bonus",
    tokenFilterLabel: "Token",
    allTokens: "All tokens",
    activityEmpty: "No activity for these filters.",
    activityLoadError: "Your activity could not be loaded.",
    entryMintFee: "Mint fee claim",
    entryLpBonus: "LP bonus claim",
    requestsFilterLabel: "Request filter",
    filterRejected: "Rejected",
    requestsEmptyFiltered: "No requests for this filter.",
    poolsEmpty: "No pools yet.",
    // DEX-2: depth, swap threshold, swap state, slippage, reference price,
    // optional locks and pair removal. Values are passed already formatted.
    ...DEX_ADMIN_EN,
    depthLabel: "Depth",
    depthValue: (usd: string) => `${usd} USD`,
    depthBasisTwice:
      "Twice the USD value of the non-TTTI-T side, at the pool price.",
    depthBasisSum:
      "Sum of both sides in USD, at the pool price and the hourly rates.",
    depthUnavailable: "Depth momentarily unavailable: a USD rate is missing.",
    depthMissingRate: (tokens: string) => `Missing rate: ${tokens}.`,
    thresholdLabel: "Swap threshold",
    thresholdValueTtti: (usd: string) => `${usd} USD of TTTI-T in the pool`,
    thresholdValueDepth: (usd: string) => `${usd} USD of depth`,
    thresholdRule: (usd: string) =>
      `Swaps are open while the depth is at or above ${usd} USD and the USD rates are available. The threshold applies only to swaps and is checked at every call.`,
    swapStateLabel: "Swaps",
    swapStateOpen: "Open",
    swapStateClosed: "Closed",
    swapClosedBelowThreshold: (measured: string, threshold: string) =>
      `Swaps are closed: the pool is at ${measured} USD, below the swap threshold of ${threshold}. They open once that threshold is reached. Deposits, liquidity additions and minting are not affected.`,
    swapClosedRateUnavailable:
      "Swaps are closed: a USD rate is momentarily unavailable.",
    swapClosedRemovalAnnounced: (date: string) =>
      `Swaps are suspended: the removal of this pair is announced for ${date}.`,
    swapClosedRemovalExecuting:
      "Swaps are closed: the removal of this pair is in progress.",
    swapClosedRemoved: "Swaps are closed: this pair has been removed.",
    errDepthBelowThreshold: (measured: string, threshold: string) =>
      `Swap refused: the pool is at ${measured} USD, below the ${threshold} USD swap threshold.`,
    errSwapRateUnavailable:
      "Swap refused: a USD rate is momentarily unavailable.",
    errRemovalInProgress: (date: string) =>
      `Swap refused: the removal of this pair is announced for ${date}.`,
    errSwapPoolRemoved: "Swap refused: this pair has been removed.",
    fixedSideLabel: "Fixed side",
    fixedSideHint: "You enter this amount. It does not change.",
    counterSideLabel: "Counter side (computed)",
    counterSideNote:
      "Computed at the pool ratio when the deposit is made, within the slippage tolerance.",
    counterSideRange: (min: string, max: string) =>
      `Accepted counter amount: ${min} to ${max}`,
    addSlippageLabel: "Slippage tolerance (%)",
    addSlippageHint:
      "Maximum change of the counter amount between the quote and the execution.",
    addSlippageDefault: "Default: 0.5 %",
    addSlippageInvalid: (max: string) =>
      `Enter a tolerance from 0 to ${max} %.`,
    depthAfter: (depth: string) => `Depth after the deposit: ${depth} USD`,
    surplusKept: (amount: string) =>
      `Not used: ${amount}. It stays in your internal DEX balance.`,
    addDoneSurplus: (id: string, shares: string, surplus: string) =>
      `Position #${id} created with ${shares} shares. Not used: ${surplus}, kept in your internal DEX balance.`,
    errAddInvalidSlippage: (max: string) =>
      `The slippage tolerance must be at most ${max} %.`,
    errAddSlippageExceeded: (
      tolerance: string,
      expected: string,
      actual: string,
    ) =>
      `The counter amount moved beyond the ${tolerance} % tolerance: expected ${expected}, now ${actual}. Nothing was debited; the funds stay in your internal balance. Get a new quote.`,
    errAddReferenceOutOfBand: (
      expected: string,
      deviation: string,
      tolerance: string,
    ) =>
      `The first deposit ratio differs from the reference price by ${deviation} %, beyond the ${tolerance} % band. Expected: ${expected}. Nothing was debited; the funds stay in your internal balance.`,
    errAddReferenceUnavailable:
      "The reference price is unavailable, so the first deposit cannot be checked. Nothing was debited; the funds stay in your internal balance.",
    errAddRemovalAnnounced: (date: string) =>
      `Liquidity additions are suspended: the removal of this pair is announced for ${date}. Withdrawals stay open, subject to position locks.`,
    referenceTitle: "Reference price",
    referenceIntro: (tolerance: string) =>
      `The first deposit of an empty pool must be within ${tolerance} % of the reference price.`,
    referenceTttiPrice: (price: string) =>
      `TTTI-T reference price: ${price} USD`,
    referenceExpected: (expected: string) => `Expected ratio: ${expected}`,
    referenceSourcesTitle: "Sources",
    referenceColSource: "Source",
    referenceColPrice: "Price (USD)",
    referenceColDepth: "Depth (USD)",
    referenceColWeight: "Weight",
    referenceSourceNative: "Native pool",
    referenceSourceIcpswap: "ICPSwap",
    referenceReadAt: (date: string) => `Read ${date}`,
    referenceTolerance: (pct: string) => `Tolerance: ${pct} %`,
    referenceUtilityBasis: "Utility pairs use the hourly USD rates.",
    referenceUnavailableNoSource:
      "Reference price unavailable: no source can be read.",
    referenceUnavailableRate: (tokens: string) =>
      `Reference price unavailable: USD rate missing for ${tokens}.`,
    referenceRatesInvalid:
      "The hourly USD rates are not valid; the check of utility pairs is unavailable.",
    referenceWithin: (deviation: string) =>
      `Within the band: deviation ${deviation} %.`,
    referenceOutside: (deviation: string, tolerance: string) =>
      `Outside the band: deviation ${deviation} %, tolerance ${tolerance} %.`,
    referenceNotApplicable:
      "No reference check: the pool already holds liquidity.",
    referenceRefresh: "Read the sources again",
    referenceRefreshing: "Reading the sources…",
    referenceRefreshed: (count: string) => `${count} source(s) read.`,
    referenceLoading: "Loading the reference price…",
    referenceLoadError: "The reference price could not be loaded.",
    lockNone: "No lock",
    lockNoneHint: "No lock: the position can be withdrawn at any time.",
    lockPickerLabel: "Lock (optional)",
    lockUpTo: (max: string) =>
      `A lock lasts from 3 months to ${max}. Its owner can extend it, never shorten it.`,
    lockEnforced:
      "The unlock date applies in every pool state, including a removed pair. Nobody can cancel a lock; only the relay of new commitments in the pool can shorten it.",
    positionLiquidated: "Position liquidated at the removal of the pair.",
    removalTitle: "Pair removal",
    removalBadge: "Removal announced",
    removalAnnouncedTitle: "Removal announced",
    removalReasonLabel: "Reason",
    removalAnnouncedAt: (date: string) => `Announced: ${date}`,
    removalEffectiveAt: (date: string) => `Effective: ${date}`,
    removalRemaining: (remaining: string) => `Remaining: ${remaining}`,
    removalSuspendedNotice:
      "Swaps and liquidity additions are suspended. Withdrawals stay open, subject to position locks.",
    removalLiquidationNotice:
      "At the effective date, all positions are liquidated, locked positions included, and the pool is marked removed.",
    removalCancelledTitle: "Removal cancelled",
    removalCancelledNotice: (date: string) =>
      `The announced removal was cancelled on ${date}. Swaps and additions follow the pool depth again.`,
    removalExecutingTitle: "Removal in progress",
    removalExecutingNotice:
      "Positions are being liquidated. Swaps and additions are closed.",
    removalCompletedTitle: "Pair removed",
    removalCompletedNotice: (date: string) =>
      `Removed on ${date}. All positions were liquidated.`,
    removalReviewNotice:
      "A payout whose outcome could not be confirmed is listed for review by the admin.",
    poolDepthShort: (usd: string) => `Depth ${usd} USD`,
    swapsOpenBadge: "Swaps open",
    swapsClosedBadge: "Swaps closed",
    // DEX lot 8: percent bar, shared tolerance field, first deposit of an
    // empty pool, depth bar, withdrawal countdown and balance recovery.
    dexPercentConnect: "Connect a wallet to use the bar.",
    dexPercentLoading: "Loading balances…",
    dexPercentUnavailable: "Balance unavailable.",
    dexPercentNotCover: (fees: string) =>
      `The wallet and DEX balance do not cover the ${fees} network fees.`,
    dexPercentShare: (symbol: string) => `Share of ${symbol} (wallet + DEX)`,
    dexPercentSummary: (percent: string, amount: string) =>
      `${percent}% = ${amount}`,
    dexPercentBase: (wallet: string, dex: string, total: string) =>
      `Base: wallet ${wallet} + DEX ${dex} = ${total}`,
    dexPercentComputedOn: (fees: string) =>
      `Computed on the wallet balance plus the available DEX balance, minus ${fees} in ledger fees on the part taken from the wallet.`,
    slippageFieldHint:
      "Maximum difference between the quoted amount and the executed amount.",
    emptyPoolTitle: "First deposit of an empty pool",
    emptyPoolNote:
      "This pool holds no liquidity yet. Enter one amount; the other side is computed at the reference price and checked against the tolerance when you add.",
    expectedOtherAmountLabel: (symbol: string) =>
      `Expected ${symbol} amount at the reference price`,
    expectedOtherAmountUnavailable: "No reference price is available.",
    addReferenceBlockTitle: "Reference price for the first deposit",
    poolSwapStateLabel: "Swap state",
    depthBarOpen: "Open: the swap threshold is reached",
    depthBarClosed: "Closed: below the swap threshold",
    depthBarAriaLabel: (pair: string) =>
      `Depth of the ${pair} pool toward the swap threshold`,
    countdownLabel: "Time remaining",
    countdownDays: (count: string) => `${count} d`,
    countdownHours: (count: string) => `${count} h`,
    countdownMinutes: (count: string) => `${count} min`,
    countdownSeconds: (count: string) => `${count} s`,
    countdownReached: "The effective date has been reached.",
    recoverHeading: "Your DEX balance",
    recoverButton: "Recover",
    recoverExplain:
      "The balance returns to your wallet. The ledger fee is deducted from each amount.",
    recovering: "Recovering…",
    recoverDone: (amounts: string) => `Recovered to your wallet: ${amounts}.`,
    recoverNothing: "There is no DEX balance to recover.",
    recoverError: (detail: string) =>
      `The balance could not be recovered: ${detail}`,
    durationOneYear: "1 year",
    durationYears: (count: string) => `${count} years`,
    durationOneMonth: "1 month",
    durationMonths: (count: string) => `${count} months`,
    positionLockCommitted: "Lock committed",
    positionLockStart: "Lock start",
    positionTimeRemaining: "Time remaining",
    positionRelayReceived: "Relay received",
    relayReceivedNone: "None",
    positionFeesCollected: "Fees collected",
    pendingPotLabel: "Pending pot",
    pendingPotNext: (date: string) => `Next sharing: ${date}`,
    pendingPotRunning: "Sharing in progress",
    pendingPotNote:
      "The pot holds the locked half of the LP fees paid since the last sharing. It is shared once a day between the positions locked during the day.",
    estimatedShareLabel: "Estimated share today",
    estimatedShareDetail: (fraction: string, date: string) =>
      `${fraction} of the day locked · next sharing ${date}`,
    estimatedShareNote:
      "Estimate for the current day: proportional to the weight of the position and to the fraction of the day it is locked. The amount paid depends on the pot at the next sharing.",
    estimatedShareNone: "No locked time today",
    positionStatus: "Status",
    positionStatusLocked: "Locked",
    positionStatusFree: "Free",
    positionStatusFreeNoLock: "Free · no lock",
    positionFreeAfter: "Free after relay or term",
    guaranteedDepthLabel: "Guaranteed depth",
    guaranteedDepthHint: "Locked positions plus permanent liquidity.",
    consolidatedTitle: "Consolidated TTTI-T price",
    consolidatedUsd: (price: string) => `${price} USD`,
    consolidatedCurrent: "Price",
    consolidatedHourly: "Hourly average",
    consolidatedDaily: "24 h average",
    consolidatedSamples: (count: string) => `${count} samples`,
    consolidatedNotAvailable: "Not available",
    consolidatedComputedLabel: "Computed",
    consolidatedSource: (symbol: string, price: string, weight: string) =>
      `TTTI-T/${symbol}: ${price} USD · weight ${weight}`,
    consolidatedNote:
      "Weighted by pool depth and converted to USD at the current hourly rates.",
    consolidatedUnavailableNoRate:
      "The consolidated price is unavailable: no valid hourly rate.",
    consolidatedUnavailableNoPool:
      "The consolidated price is unavailable: no TTTI-T pool is open for swaps.",
    consolidatedLoadError: "The consolidated price could not be loaded.",
    spreadLabel: "Spread vs consolidated price",
    spreadAboveThreshold: (threshold: string) => `Spread above ${threshold} %`,
    spreadReasonEmpty: "No liquidity in this pool.",
    spreadReasonNotOpen: "Swaps are not open.",
    spreadReasonNoRate: "No valid hourly rate for this pair.",
    spreadReasonNoConsolidated: "No consolidated price.",
    spreadReasonLoadError: "Spreads could not be loaded.",
    poolPriceLabel: "Pool price",
    spreadAlertTitle: "Spread above threshold",
    spreadAlert: (pool: string, spread: string, threshold: string) =>
      `Pool ${pool}: the spread versus the consolidated TTTI-T price is ${spread}, above the ${threshold} % threshold. You hold a position in this pool.`,
    spreadAlertPrices: (poolPrice: string, consolidated: string) =>
      `Pool price ${poolPrice} USD · consolidated price ${consolidated} USD`,
    referenceConsolidatedPrice: (price: string) =>
      `TTTI-T consolidated price: ${price} USD`,
    guaranteedDepthReserves: (amount0: string, amount1: string) =>
      `Guaranteed reserves: ${amount0} and ${amount1}`,
    relayTitle: "Relay of commitments",
    relayExplain:
      "The relay lock is optional and lasts from 3 months to 5 years. A third of the weight of each new commitment relieves the other locked positions of the pool. An owner can extend. A relieved or expired position is unlocked without eviction: it stays in the pool as free liquidity.",
    relayResult: (shortened: string, freed: string) =>
      `Relay: ${shortened} position(s) shortened, ${freed} freed.`,
    relayResultNone: "Relay: no other position was shortened.",
    feeSplitTitle: "Fee split with locked positions",
    feeSplitExplain:
      "Half of the LP fee stays in the reserves, pro rata to shares. The other half is set aside and shared among the locked positions by capital × the square root of (remaining time ÷ 5 years). Only fees actually paid are shared.",
    errExtendRemovalAnnounced: (date: string) =>
      `The lock cannot be extended: the removal of this pair is announced for ${date}.`,
    ...PTM4_EN,
  },
  fr: {
    title: "Pools",
    intro:
      "Pools à produit constant détenus par ce contrat. Chaque paire a un palier de frais et son propre sous-compte de pool.",
    statusFilling: "En remplissage",
    statusActive: "Active",
    statusRemoved: "Retirée",
    newPairBadge: "Nouvelle paire",
    approvalNotRecommendation:
      "L'approbation d'une paire n'est pas une recommandation.",
    tttiPair: "Paire TTTI-T",
    utilityPair: "Paire utilitaire",
    feeTier: "Palier de frais",
    feeTierBps5: "0,05 %",
    feeTierBps30: "0,3 %",
    feeTierBps100: "1 %",
    poolSubaccount: "Sous-compte du pool",
    minimumLocked: "Liquidité minimale bloquée",
    minimumTttiSide: (amount: string) => `${amount} TTTI-T côté TTTI-T`,
    minimumPerToken: "Minimum par jeton, fixé par l'admin",
    minimumNotSet: "Pas encore fixé",
    firstDepositRule: "Le premier dépôt dans un pool vide n'a pas de minimum.",
    launchDepthRule: (amount: string) =>
      `Les échanges s'ouvrent quand une paire TTTI-T détient ${amount} USD de TTTI-T dans le pool (son côté TTTI-T au prix du pool, égal à son autre côté au taux de l'oracle), ou quand une paire utilitaire atteint ${amount} USD de profondeur (les deux côtés additionnés aux taux de l'heure). Sous ce seuil, le pool reste en remplissage : la création du pool, le dépôt, l'ajout de liquidité, l'achat et le mint restent ouverts ; seuls les échanges sont fermés.`,
    lockedSharesRule:
      "Les parts minimales bloquées, calculées comme √(A×B) au premier dépôt, appartiennent au contrat pour toujours.",
    removedNotice:
      "Cette paire a été retirée. Toutes les positions ont été liquidées. Les échanges et les ajouts sont fermés.",
    protocolStatement:
      "Le protocole ne passe jamais d'ordre lié au prix et ne crée aucun TTTI-T pour les pools. La liquidité permanente est une gestion de la profondeur : un rééquilibrage mécanique et public de la part du protocole, jamais conditionné au prix. La part du protocole sur les frais d'échange revient pour deux tiers au créateur et pour un tiers à la liquidité permanente, que personne ne peut retirer.",
    loading: "Chargement des pools…",
    loadError: "Les pools n'ont pas pu être chargés.",
    requestTitle: "Demander une paire",
    ledgerId: "ID du ledger",
    ledgerIdPlaceholder: "ID du canister ledger",
    ledgerIdInvalid: "Saisissez un ID de canister ledger valide.",
    counterToken: "Jeton en face",
    counterTokenPlaceholder: "Choisissez un jeton",
    message: "Message",
    messageMax: (max: string) => `${max} caractères au maximum.`,
    deposit: (amount: string) => `Dépôt : ${amount} TTTI-T`,
    depositApproval: (amount: string) =>
      `Avant la demande, vous autorisez ${amount} TTTI-T (dépôt plus frais du ledger) au contrat. L'autorisation expire au bout de 15 minutes.`,
    depositRule:
      "Le dépôt est rendu en cas d'approbation et gardé en cas de refus.",
    approving: "Autorisation…",
    submit: "Envoyer la demande",
    submitting: "Envoi…",
    submitted: "Demande envoyée.",
    signInNeeded: "Connectez-vous pour demander une paire.",
    requestsTitle: "Demandes",
    myRequestsTitle: "Mes demandes",
    noRequests: "Aucune demande de paire.",
    requestStatusPending: "En attente",
    requestStatusApproved: "Approuvée",
    requestStatusRefused: "Refusée",
    refusedReason: (reason: string) => `Motif : ${reason}`,
    copiedSymbol: "Symbole copié",
    copiedSymbolOf: (symbol: string) => `Symbole déjà utilisé par ${symbol}`,
    errAnonymous: "Connectez-vous pour demander une paire.",
    errMessageTooLong: (max: string) => `Le message dépasse ${max} caractères.`,
    errInvalidToken: (detail: string) =>
      `Ce ledger ne peut pas être utilisé : ${detail}`,
    errUnknownCounterToken: "Le jeton en face n'est pas disponible.",
    errLedgerUnreachable: (detail: string) =>
      `Le ledger n'a pas pu être joint : ${detail}`,
    errMissingStandards: (standards: string) =>
      `Le ledger ne prend pas en charge ${standards}.`,
    errMetadataUnavailable: (detail: string) =>
      `Les métadonnées du ledger n'ont pas pu être lues : ${detail}`,
    errPairExists: "Cette paire existe déjà ou est déjà demandée.",
    errTooManyPending: (max: string) =>
      `Vous avez déjà ${max} demandes en attente.`,
    errCooldown: (date: string) =>
      `Après un refus, une nouvelle demande est possible à partir du ${date}.`,
    errInsufficientAllowance: (allowance: string, required: string) =>
      `L'autorisation couvre ${allowance} TTTI-T ; ${required} TTTI-T sont requis.`,
    errInsufficientFunds: (balance: string) =>
      `Votre solde TTTI-T (${balance} TTTI-T) ne couvre pas le dépôt et les frais.`,
    errDepositFailed: (detail: string) =>
      `Le dépôt n'a pas pu être prélevé : ${detail}`,
    errApprovalFailed: (detail: string) =>
      `L'autorisation TTTI-T a échoué : ${detail}`,
    balancesTitle: "Mes soldes DEX",
    balancesSignIn: "Connectez-vous pour voir vos soldes DEX.",
    balancesLoading: "Chargement des soldes…",
    balancesLoadError: "Les soldes n'ont pas pu être chargés.",
    balancesEmpty: "Aucun solde DEX.",
    colToken: "Jeton",
    colAvailable: "Disponible",
    colReserved: "Réservé",
    depositButton: "Déposer",
    withdrawButton: "Retirer",
    depositTitle: (symbol: string) => `Déposer des ${symbol}`,
    withdrawTitle: (symbol: string) => `Retirer des ${symbol}`,
    amountLabel: "Montant",
    amountPlaceholder: "0,00",
    amountInvalid: "Saisissez un montant valide.",
    availableAmount: (amount: string) => `Disponible : ${amount}`,
    minimumDeposit: (amount: string) => `Dépôt minimum : ${amount}`,
    minimumWithdrawal: (amount: string) => `Retrait minimum : ${amount}`,
    depositFeeNote: (fee: string) =>
      `Vous autorisez le montant plus les frais du ledger (${fee}) au contrat. L'autorisation expire au bout de 15 minutes.`,
    withdrawFeeNote: (fee: string) =>
      `Les frais du ledger (${fee}) sont déduits du montant retiré.`,
    withdrawReceive: (amount: string) => `Vous recevez : ${amount}`,
    confirmDeposit: "Confirmer le dépôt",
    confirmWithdraw: "Confirmer le retrait",
    cancel: "Annuler",
    depositing: "Dépôt…",
    withdrawing: "Retrait…",
    depositDone: "Dépôt effectué.",
    withdrawDone: "Retrait effectué.",
    transfersTitle: "Transferts DEX",
    noTransfers: "Aucun transfert DEX.",
    directionDeposit: "Dépôt",
    directionWithdrawal: "Retrait",
    transferStatusInProgress: "En cours",
    transferStatusCompleted: "Effectué",
    transferStatusFailed: "Échoué",
    transferStatusNeedsReview: "À vérifier",
    transferBlock: (block: string) => `Bloc ${block}`,
    transferError: (detail: string) => `Erreur : ${detail}`,
    memo: "Memo",
    errDexAnonymous: "Connectez-vous pour déposer ou retirer.",
    errAmountTooSmall: (minimum: string) => `Le minimum est de ${minimum}.`,
    errTransferInProgress:
      "Un transfert de ce jeton est déjà en cours. Réessayez plus tard.",
    errDexInsufficientAllowance: (allowance: string, required: string) =>
      `L'autorisation couvre ${allowance} ; ${required} sont requis.`,
    errDexInsufficientFunds: (balance: string) =>
      `Votre solde (${balance}) ne couvre pas le montant et les frais.`,
    errDexInsufficientBalance: (available: string) =>
      `Votre solde DEX disponible est de ${available}.`,
    errLedger: (detail: string) => `Le ledger a renvoyé une erreur : ${detail}`,
    errDexApprovalFailed: (detail: string) =>
      `L'autorisation a échoué : ${detail}`,
    lookupTitle: "Soldes DEX par identifiant",
    lookupLabel: "Principal",
    lookupPlaceholder: "ID du principal",
    lookupButton: "Consulter",
    lookupInvalid: "Saisissez un principal valide.",
    lookupEmpty: "Aucun solde DEX pour ce principal.",
    depositSubaccount: "Sous-compte de dépôt",
    copyDepositSubaccount: "Copier le sous-compte de dépôt",
    copied: "Copié",
    refundLabel: "Remboursement du dépôt",
    refundNone: "Aucun remboursement",
    refundInProgress: "Remboursement en cours",
    refundNeedsReview: "Remboursement à vérifier",
    refundRefunded: (block: string) => `Remboursé (bloc ${block})`,
    privacyPositions:
      "Les positions de liquidité sont publiques et liées à ton identifiant sur TTTI.",
    privacyDeposit: "Ton dépôt reste visible sur la chaîne.",
    gaugeLabel: "Jauge de remplissage",
    gaugeFilling: (current: string, target: string, remaining: string) =>
      `${current} / ${target} USD — encore ${remaining} USD pour atteindre le seuil d'échange`,
    gaugeOpen: (current: string, target: string) =>
      `${current} / ${target} USD`,
    gaugeUnavailable: "Valeur momentanément indisponible",
    reserves: "Réserves",
    totalShares: "Total des parts",
    addLiquidityButton: "Ajouter de la liquidité",
    swapButton: "Échanger",
    positionsButton: "Positions",
    signInForActions:
      "Connectez-vous pour ajouter de la liquidité ou échanger.",
    pairTokensUnsupported:
      "La liquidité et les échanges ne sont pas disponibles pour les jetons de cette paire.",
    swapsClosedFilling: (gauge: string) =>
      `Les échanges sont fermés tant que le pool est en remplissage : ${gauge}`,
    addTitle: (pair: string) => `Ajouter de la liquidité · ${pair}`,
    addIntro:
      "Les montants sont pris sur vos soldes DEX disponibles. Les positions de liquidité sont publiques et liées à ton identifiant sur TTTI. Ton dépôt reste visible sur la chaîne.",
    sideLabel: "Jeton saisi",
    tokenAmountLabel: (symbol: string) => `Montant en ${symbol}`,
    firstDepositNote:
      "Premier apport : saisissez les deux montants. Leur rapport fixe le rapport du pool.",
    counterComputed: (amount: string) =>
      `Montant en face au rapport du pool : ${amount}`,
    sharesToReceive: (shares: string) => `Parts à recevoir : ${shares}`,
    sharesLockedForever: (shares: string) =>
      `Parts bloquées au contrat pour toujours : ${shares}`,
    gaugeAfter: (gauge: string) => `Jauge après l'apport : ${gauge}`,
    opensPool: "Cet apport ouvre le pool aux échanges.",
    staysFilling: "Le pool reste en remplissage après cet apport.",
    quoting: "Calcul du devis…",
    lockLabel: "Durée du gel",
    lockHint: (min: string, max: string) =>
      `Facultatif : pas de gel par défaut. Un gel dure de ${min} à ${max}. Son propriétaire peut le prolonger, jamais le raccourcir.`,
    lockPreset1d: "1 jour",
    lockPreset7d: "7 jours",
    lockPreset30d: "30 jours",
    lockPreset90d: "90 jours",
    lockPreset3m: "3 mois",
    lockPreset2y: "2 ans",
    lockPreset3y: "3 ans",
    lockPreset4y: "4 ans",
    lockPreset1y: "1 an",
    lockPreset5y: "5 ans",
    lockCustom: "Personnalisé",
    lockCustomDays: "Nombre de jours",
    lockInvalid: (min: string, max: string) =>
      `Saisissez une durée de ${min} à ${max}.`,
    durationDays: (days: string) => `${days} jours`,
    durationOneDay: "1 jour",
    unlockOn: (date: string) => `Déblocage : ${date}`,
    confirmAdd: "Ajouter la liquidité",
    adding: "Ajout de la liquidité…",
    addDone: (id: string, shares: string) =>
      `Position n° ${id} créée avec ${shares} parts.`,
    refTitle: "Prix de référence ICPSwap",
    refQuote: (input: string, output: string) =>
      `Devis ICPSwap : ${input} → ${output} (frais ICPSwap inclus). Simple repère.`,
    refDeviation: (pct: string) =>
      `Le rapport de votre apport s'écarte de ce repère de ${pct} %.`,
    refDeviationWarning: (pct: string) =>
      `Attention : le rapport de votre apport s'écarte du repère ICPSwap de ${pct} %, soit plus de 2 %.`,
    refUnavailable:
      "Aucun pool ICPSwap n'existe pour cette paire ; le prix de référence est indisponible.",
    refError: "Le prix de référence ICPSwap n'a pas pu être lu.",
    refLoading: "Lecture du prix ICPSwap…",
    positionsTitle: (pair: string) => `Positions · ${pair}`,
    positionsEmpty: "Aucune position dans ce pool.",
    positionsLoading: "Chargement des positions…",
    positionsLoadError: "Les positions n'ont pas pu être chargées.",
    colOwner: "Titulaire",
    colPair: "Paire",
    colShares: "Parts",
    colAmounts: "Montants",
    colLock: "Gel",
    colUnlock: "Déblocage",
    creatorBadge: "Créateur",
    copyPrincipal: "Copier le principal",
    unlockedLabel: "Débloquée",
    positionLabel: (id: string) => `Position n° ${id}`,
    myPositionsTitle: "Mes positions",
    myPositionsEmpty: "Vous n'avez aucune position de liquidité.",
    myPositionsNote:
      "Retirer une position crédite vos soldes DEX. Utilisez Retirer dans Mes soldes DEX pour envoyer les jetons vers votre wallet.",
    withdrawPosition: "Retirer",
    withdrawingPosition: "Retrait…",
    positionWithdrawn: (amount0: string, amount1: string) =>
      `Retiré : ${amount0} et ${amount1} crédités sur vos soldes DEX.`,
    lockedUntil: (date: string) => `Gelée jusqu'au ${date}.`,
    removedWithdrawOpen:
      "Le retrait suit la date de déblocage dans tous les états du pool.",
    extendLockButton: "Prolonger le gel",
    extendTitle: (id: string) => `Prolonger le gel · position n° ${id}`,
    extendCurrent: (date: string) => `Déblocage actuel : ${date}`,
    extendModeDate: "Date",
    extendModeDays: "Jours",
    extendDateLabel: "Nouvelle date de déblocage",
    extendDaysLabel: "Jours ajoutés au déblocage actuel",
    extendNewUnlock: (date: string) => `Nouveau déblocage : ${date}`,
    extendTooEarly:
      "Le nouveau déblocage doit être postérieur au déblocage actuel.",
    extendTooLate: (date: string) =>
      `Le nouveau déblocage ne peut pas dépasser le ${date}.`,
    confirmExtend: "Confirmer la prolongation",
    extending: "Prolongation…",
    extendDone: (date: string) => `Gel prolongé jusqu'au ${date}.`,
    swapTitle: (pair: string) => `Échanger · ${pair}`,
    swapIntro:
      "L'échange utilise vos soldes DEX disponibles ; le montant obtenu y est crédité.",
    swapFrom: "Jeton cédé",
    swapAmountOut: "Vous recevez (estimation)",
    swapFee: (pct: string) => `Frais (${pct})`,
    swapPriceImpact: "Impact sur le prix",
    swapMinimum: "Minimum reçu",
    slippageLabel: "Tolérance de slippage (%)",
    slippageInvalid: "Saisissez une tolérance de 0 à 50 %.",
    swapDeadlineNote:
      "La date limite est fixée à 5 minutes après la confirmation.",
    confirmSwap: "Confirmer l'échange",
    swapping: "Échange…",
    swapDone: (input: string, output: string) =>
      `${input} échangés contre ${output}.`,
    errLiqAnonymous: "Connectez-vous pour utiliser les pools.",
    errPoolNotFound: "Ce pool n'existe pas.",
    errPoolRemoved:
      "Cette paire a été retirée. Les dépôts et les échanges sont bloqués.",
    errMinimumsNotSet: "Les minimums de cette paire ne sont pas encore fixés.",
    errUnsupportedToken: "Ce jeton n'est pas pris en charge par le DEX.",
    errZeroAmount: "Saisissez un montant supérieur à zéro.",
    errCounterAmountRequired: "Premier apport : saisissez les deux montants.",
    errLiqInsufficientBalance: (available: string, required: string) =>
      `Votre solde DEX disponible est de ${available} ; ${required} est nécessaire.`,
    errBelowMinimum: (minimums: string) =>
      `L'apport est inférieur au minimum : ${minimums}.`,
    errRatioMismatch: (required: string) =>
      `Au rapport du pool, le montant en face doit être de ${required}.`,
    errLockTooShort: (min: string) =>
      `Le gel est trop court. Minimum : ${min}.`,
    errLockTooLong: (max: string) => `Le gel est trop long. Maximum : ${max}.`,
    errZeroShares: "Cet apport est trop petit pour recevoir des parts.",
    errOperationInProgress:
      "Une autre opération est en cours sur ce compte. Réessayez dans un instant.",
    errPositionNotFound: "Cette position n'existe pas.",
    errNotPositionOwner: "Cette position appartient à un autre principal.",
    errPositionLocked: (date: string) =>
      `Cette position est gelée jusqu'au ${date}.`,
    errCannotShortenLock: (date: string) =>
      `Un gel ne peut pas être raccourci. Déblocage actuel : ${date}.`,
    errUnlockTooLate: (date: string) =>
      `La date de déblocage ne peut pas dépasser le ${date}.`,
    errPoolFilling: (gauge: string) =>
      `Le pool est encore en remplissage : ${gauge}`,
    errPoolNotOpen: "Ce pool n'est pas ouvert aux échanges.",
    errRateUnavailable:
      "Un taux USD est momentanément indisponible ; la valeur du pool ne peut pas être vérifiée.",
    errTokenNotInPool: "Ce jeton ne fait pas partie de la paire.",
    errInvalidSlippage: (max: string) =>
      `La tolérance de slippage doit être d'au plus ${max} %.`,
    errSwapInsufficientBalance: (available: string) =>
      `Votre solde DEX disponible est de ${available}.`,
    errInsufficientLiquidity:
      "Le pool n'a pas assez de liquidité pour cet échange.",
    errSlippageExceeded: (out: string, min: string) =>
      `Slippage dépassé : l'échange donnerait ${out}, sous le minimum de ${min}. Demandez un nouveau devis.`,
    errDeadlineExceeded: (date: string) =>
      `La date limite (${date}) est passée. Confirmez à nouveau.`,
    errDeadlineTooFar: (date: string) =>
      `La date limite est trop lointaine ; la plus tardive acceptée est ${date}.`,
    errCall: (detail: string) => `L'appel a échoué : ${detail}`,
    bonusTitle: "Bonus en ICP des positions gelées",
    bonusScope:
      "Les bonus en ICP déjà gagnés par les positions gelées des paires TTTI-T restent réclamables. Les frais d'échange n'ajoutent aucun nouveau bonus.",
    bonusWeightRule:
      "Poids d'une position = valeur en ICP × durée de gel restante ÷ 5 ans.",
    bonusObservedNote:
      "Le bonus indique uniquement des montants constatés. Aucun montant futur n'est estimé ni promis.",
    bonusSignIn: "Connectez-vous pour voir votre bonus en ICP.",
    bonusLoading: "Chargement du bonus…",
    bonusLoadError: "Le bonus n'a pas pu être chargé.",
    bonusClaimable: (amount: string) => `À réclamer : ${amount}`,
    bonusClaimedTotal: (amount: string) => `Réclamé au total : ${amount}`,
    bonusNoPositions: "Aucune position gelée dans une paire TTTI-T.",
    bonusColPosition: "Position",
    bonusColValueIcp: "Valeur en ICP",
    bonusColRemainingLock: "Gel restant",
    bonusColWeight: "Poids",
    bonusClaimsTitle: "Réclamations",
    bonusClaimsEmpty: "Aucune réclamation pour l'instant.",
    claimButton: "Réclamer le bonus en ICP",
    claiming: "Réclamation…",
    claimDone: (amount: string) =>
      `Réclamation de ${amount} enregistrée. L'ICP est envoyé à votre portefeuille.`,
    errClaimAnonymous: "Connectez-vous pour réclamer le bonus.",
    errClaimNothing: "Il n'y a rien à réclamer.",
    errClaimBelowMinimum: (minimum: string) =>
      `Le montant à réclamer est inférieur au minimum de ${minimum}.`,
    errClaimInProgress:
      "Une réclamation est déjà en cours. Réessayez dans un instant.",
    protocolLiquidityTitle: "Liquidité du protocole",
    protocolLiquidityLocked:
      "Bloquée pour toujours. Elle n'a aucun moyen de retrait.",
    protocolLiquidityHeld: (amount0: string, amount1: string) =>
      `Détenu : ${amount0} et ${amount1}`,
    protocolLiquidityFromFees: (amount0: string, amount1: string) =>
      `Issu des frais : ${amount0} et ${amount1}`,
    protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
      `Issu de la trésorerie : ${amount0} et ${amount1}`,
    protocolLiquidityShare: (pct: string) => `${pct} % des parts du pool`,
    protocolLiquidityLastAdded: (date: string) => `Dernier ajout : ${date}`,
    protocolLiquidityNone: "Aucune liquidité du protocole dans ce pool.",
    dexPausedTitle: "DEX en pause",
    dexPausedNotice: (token: string) =>
      `Le DEX est en pause : un contrôle des réserves a constaté un déficit pour ${token}. Les échanges, les dépôts et les ajouts de liquidité sont indisponibles. Les retraits et les retraits de liquidité restent disponibles.`,
    dexPausedTooltip: "Indisponible tant que le DEX est en pause.",
    errDexPaused:
      "Le DEX est en pause après un contrôle des réserves. Les échanges, les dépôts et les ajouts de liquidité sont indisponibles. Les retraits et les retraits de liquidité restent disponibles.",
    navLabel: "Sections de la page des pools",
    navPools: "Pools",
    navIndicators: "Indicateurs",
    navMyLiquidity: "Ma liquidité",
    navProtocol: "Protocole",
    navRequests: "Demandes",
    introShort: "Pools à produit constant détenus par ce contrat.",
    statusWaiting: "En attente de liquidité",
    statusOpen: "Ouvert",
    detailsLabel: "Détails",
    addShort: "Ajouter",
    howPoolsWorkTitle: "Comment fonctionnent les pools",
    permanentLiquidity: "Liquidité permanente",
    permanentLiquidityValue: (shares: string, pct: string) =>
      `${shares} parts (${pct} % du pool)`,
    myLiquiditySignIn:
      "Connectez-vous pour voir vos soldes DEX, vos positions de liquidité et les frais reçus.",
    rewardsTitle: "Frais reçus",
    activityTitle: "Mon activité",
    activityFilterLabel: "Type d'activité",
    filterAll: "Tout",
    filterTransfers: "Dépôts et retraits",
    filterMintFees: "Frais de mint",
    filterLpBonus: "Bonus LP",
    tokenFilterLabel: "Jeton",
    allTokens: "Tous les jetons",
    activityEmpty: "Aucune activité pour ces filtres.",
    activityLoadError: "Votre activité n'a pas pu être chargée.",
    entryMintFee: "Récupération de frais de mint",
    entryLpBonus: "Récupération du bonus LP",
    requestsFilterLabel: "Filtre des demandes",
    filterRejected: "Refusées",
    requestsEmptyFiltered: "Aucune demande pour ce filtre.",
    poolsEmpty: "Aucun pool pour l'instant.",
    ...DEX_ADMIN_EN,
    depthLabel: "Profondeur",
    depthValue: (usd: string) => `${usd} USD`,
    depthBasisTwice:
      "Deux fois la valeur en USD du côté autre que TTTI-T, au prix du pool.",
    depthBasisSum:
      "Somme des deux côtés en USD, au prix du pool et aux taux de l'heure.",
    depthUnavailable:
      "Profondeur momentanément indisponible : un taux USD est manquant.",
    depthMissingRate: (tokens: string) => `Taux manquant : ${tokens}.`,
    thresholdLabel: "Seuil d'échange",
    thresholdValueTtti: (usd: string) => `${usd} USD de TTTI-T dans le pool`,
    thresholdValueDepth: (usd: string) => `${usd} USD de profondeur`,
    thresholdRule: (usd: string) =>
      `Les échanges sont ouverts tant que la profondeur est d'au moins ${usd} USD et que les taux USD sont disponibles. Le seuil ne porte que sur les échanges et est vérifié à chaque appel.`,
    swapStateLabel: "Échanges",
    swapStateOpen: "Ouverts",
    swapStateClosed: "Fermés",
    swapClosedBelowThreshold: (measured: string, threshold: string) =>
      `Les échanges sont fermés : le pool est à ${measured} USD, sous le seuil d'échange de ${threshold}. Ils s'ouvrent dès que ce seuil est atteint. Les dépôts, les ajouts de liquidité et le mint ne sont pas concernés.`,
    swapClosedRateUnavailable:
      "Les échanges sont fermés : un taux USD est momentanément indisponible.",
    swapClosedRemovalAnnounced: (date: string) =>
      `Les échanges sont suspendus : le retrait de cette paire est annoncé pour le ${date}.`,
    swapClosedRemovalExecuting:
      "Les échanges sont fermés : le retrait de cette paire est en cours.",
    swapClosedRemoved: "Les échanges sont fermés : cette paire a été retirée.",
    errDepthBelowThreshold: (measured: string, threshold: string) =>
      `Échange refusé : le pool est à ${measured} USD, sous le seuil d'échange de ${threshold} USD.`,
    errSwapRateUnavailable:
      "Échange refusé : un taux USD est momentanément indisponible.",
    errRemovalInProgress: (date: string) =>
      `Échange refusé : le retrait de cette paire est annoncé pour le ${date}.`,
    errSwapPoolRemoved: "Échange refusé : cette paire a été retirée.",
    fixedSideLabel: "Côté fixé",
    fixedSideHint: "Vous saisissez ce montant. Il ne change pas.",
    counterSideLabel: "Côté opposé (calculé)",
    counterSideNote:
      "Calculé au ratio du pool au moment du dépôt, dans la tolérance de glissement.",
    counterSideRange: (min: string, max: string) =>
      `Montant opposé accepté : de ${min} à ${max}`,
    addSlippageLabel: "Tolérance de glissement (%)",
    addSlippageHint:
      "Variation maximale du montant opposé entre le devis et l'exécution.",
    addSlippageDefault: "Par défaut : 0,5 %",
    addSlippageInvalid: (max: string) =>
      `Saisissez une tolérance de 0 à ${max} %.`,
    depthAfter: (depth: string) => `Profondeur après le dépôt : ${depth} USD`,
    surplusKept: (amount: string) =>
      `Non utilisé : ${amount}. Ce montant reste dans votre solde DEX interne.`,
    addDoneSurplus: (id: string, shares: string, surplus: string) =>
      `Position n° ${id} créée avec ${shares} parts. Non utilisé : ${surplus}, conservé dans votre solde DEX interne.`,
    errAddInvalidSlippage: (max: string) =>
      `La tolérance de glissement doit être d'au plus ${max} %.`,
    errAddSlippageExceeded: (
      tolerance: string,
      expected: string,
      actual: string,
    ) =>
      `Le montant opposé a varié au-delà de la tolérance de ${tolerance} % : attendu ${expected}, maintenant ${actual}. Rien n'a été débité ; les fonds restent dans votre solde interne. Demandez un nouveau devis.`,
    errAddReferenceOutOfBand: (
      expected: string,
      deviation: string,
      tolerance: string,
    ) =>
      `Le ratio du premier dépôt s'écarte du prix de référence de ${deviation} %, au-delà de la bande de ${tolerance} %. Attendu : ${expected}. Rien n'a été débité ; les fonds restent dans votre solde interne.`,
    errAddReferenceUnavailable:
      "Le prix de référence est indisponible : le premier dépôt ne peut pas être vérifié. Rien n'a été débité ; les fonds restent dans votre solde interne.",
    errAddRemovalAnnounced: (date: string) =>
      `Les ajouts de liquidité sont suspendus : le retrait de cette paire est annoncé pour le ${date}. Les retraits restent ouverts, sous réserve des gels de position.`,
    referenceTitle: "Prix de référence",
    referenceIntro: (tolerance: string) =>
      `Le premier dépôt d'un pool vide doit être à ${tolerance} % près du prix de référence.`,
    referenceTttiPrice: (price: string) =>
      `Prix de référence du TTTI-T : ${price} USD`,
    referenceExpected: (expected: string) => `Ratio attendu : ${expected}`,
    referenceSourcesTitle: "Sources",
    referenceColSource: "Source",
    referenceColPrice: "Prix (USD)",
    referenceColDepth: "Profondeur (USD)",
    referenceColWeight: "Poids",
    referenceSourceNative: "Pool natif",
    referenceSourceIcpswap: "ICPSwap",
    referenceReadAt: (date: string) => `Lu le ${date}`,
    referenceTolerance: (pct: string) => `Tolérance : ${pct} %`,
    referenceUtilityBasis:
      "Les paires utilitaires utilisent les taux USD de l'heure.",
    referenceUnavailableNoSource:
      "Prix de référence indisponible : aucune source ne peut être lue.",
    referenceUnavailableRate: (tokens: string) =>
      `Prix de référence indisponible : taux USD manquant pour ${tokens}.`,
    referenceRatesInvalid:
      "Les taux USD de l'heure ne sont pas valides ; le contrôle des paires utilitaires est indisponible.",
    referenceWithin: (deviation: string) =>
      `Dans la bande : écart de ${deviation} %.`,
    referenceOutside: (deviation: string, tolerance: string) =>
      `Hors de la bande : écart de ${deviation} %, tolérance de ${tolerance} %.`,
    referenceNotApplicable:
      "Pas de contrôle de référence : le pool contient déjà de la liquidité.",
    referenceRefresh: "Relire les sources",
    referenceRefreshing: "Lecture des sources…",
    referenceRefreshed: (count: string) => `${count} source(s) lue(s).`,
    referenceLoading: "Chargement du prix de référence…",
    referenceLoadError: "Le prix de référence n'a pas pu être chargé.",
    lockNone: "Aucun gel",
    lockNoneHint: "Aucun gel : la position peut être retirée à tout moment.",
    lockPickerLabel: "Gel (facultatif)",
    lockUpTo: (max: string) =>
      `Un gel dure de 3 mois à ${max}. Son propriétaire peut le prolonger, jamais le raccourcir.`,
    lockEnforced:
      "La date de déblocage s'applique dans tous les états du pool, y compris pour une paire retirée. Personne ne peut annuler un gel ; seul le relais des nouveaux engagements du pool peut le raccourcir.",
    positionLiquidated: "Position liquidée lors du retrait de la paire.",
    removalTitle: "Retrait de la paire",
    removalBadge: "Retrait annoncé",
    removalAnnouncedTitle: "Retrait annoncé",
    removalReasonLabel: "Motif",
    removalAnnouncedAt: (date: string) => `Annoncé le : ${date}`,
    removalEffectiveAt: (date: string) => `Effectif le : ${date}`,
    removalRemaining: (remaining: string) => `Temps restant : ${remaining}`,
    removalSuspendedNotice:
      "Les échanges et les ajouts de liquidité sont suspendus. Les retraits restent ouverts, sous réserve des gels de position.",
    removalLiquidationNotice:
      "À la date d'effet, toutes les positions sont liquidées, y compris les positions gelées, et le pool est marqué comme retiré.",
    removalCancelledTitle: "Retrait annulé",
    removalCancelledNotice: (date: string) =>
      `Le retrait annoncé a été annulé le ${date}. Les échanges et les ajouts suivent de nouveau la profondeur du pool.`,
    removalExecutingTitle: "Retrait en cours",
    removalExecutingNotice:
      "Les positions sont en cours de liquidation. Les échanges et les ajouts sont fermés.",
    removalCompletedTitle: "Paire retirée",
    removalCompletedNotice: (date: string) =>
      `Retirée le ${date}. Toutes les positions ont été liquidées.`,
    removalReviewNotice:
      "Un paiement dont l'issue n'a pas pu être confirmée est listé pour vérification par l'admin.",
    poolDepthShort: (usd: string) => `Profondeur ${usd} USD`,
    swapsOpenBadge: "Échanges ouverts",
    swapsClosedBadge: "Échanges fermés",
    dexPercentConnect: "Connectez un wallet pour utiliser la barre.",
    dexPercentLoading: "Chargement des soldes…",
    dexPercentUnavailable: "Solde indisponible.",
    dexPercentNotCover: (fees: string) =>
      `Le solde du wallet et du DEX ne couvre pas les frais de réseau de ${fees}.`,
    dexPercentShare: (symbol: string) => `Part de ${symbol} (wallet + DEX)`,
    dexPercentSummary: (percent: string, amount: string) =>
      `${percent}% = ${amount}`,
    dexPercentBase: (wallet: string, dex: string, total: string) =>
      `Base : wallet ${wallet} + DEX ${dex} = ${total}`,
    dexPercentComputedOn: (fees: string) =>
      `Calculé sur le solde du wallet plus le solde DEX disponible, moins ${fees} de frais du ledger sur la part prélevée du wallet.`,
    slippageFieldHint:
      "Écart maximal entre le montant du devis et le montant exécuté.",
    emptyPoolTitle: "Premier dépôt d'un pool vide",
    emptyPoolNote:
      "Ce pool ne contient pas encore de liquidité. Saisissez un montant ; l'autre côté est calculé au prix de référence et contrôlé selon la tolérance à l'ajout.",
    expectedOtherAmountLabel: (symbol: string) =>
      `Montant attendu de ${symbol} au prix de référence`,
    expectedOtherAmountUnavailable: "Aucun prix de référence disponible.",
    addReferenceBlockTitle: "Prix de référence du premier dépôt",
    poolSwapStateLabel: "État des échanges",
    depthBarOpen: "Ouverts : le seuil d'échange est atteint",
    depthBarClosed: "Fermés : sous le seuil d'échange",
    depthBarAriaLabel: (pair: string) =>
      `Profondeur du pool ${pair} par rapport au seuil d'échange`,
    countdownLabel: "Temps restant",
    countdownDays: (count: string) => `${count} j`,
    countdownHours: (count: string) => `${count} h`,
    countdownMinutes: (count: string) => `${count} min`,
    countdownSeconds: (count: string) => `${count} s`,
    countdownReached: "La date d'effet est atteinte.",
    recoverHeading: "Votre solde DEX",
    recoverButton: "Récupérer",
    recoverExplain:
      "Le solde est renvoyé vers votre wallet. Les frais du ledger sont déduits de chaque montant.",
    recovering: "Récupération…",
    recoverDone: (amounts: string) =>
      `Récupéré vers votre wallet : ${amounts}.`,
    recoverNothing: "Aucun solde DEX à récupérer.",
    recoverError: (detail: string) =>
      `Le solde n'a pas pu être récupéré : ${detail}`,
    durationOneYear: "1 an",
    durationYears: (count: string) => `${count} ans`,
    durationOneMonth: "1 mois",
    durationMonths: (count: string) => `${count} mois`,
    positionLockCommitted: "Gel engagé",
    positionLockStart: "Début du gel",
    positionTimeRemaining: "Temps restant",
    positionRelayReceived: "Relais reçu",
    relayReceivedNone: "Aucun",
    positionFeesCollected: "Frais perçus",
    pendingPotLabel: "Cagnotte en attente",
    pendingPotNext: (date: string) => `Prochain partage : ${date}`,
    pendingPotRunning: "Partage en cours",
    pendingPotNote:
      "La cagnotte contient la moitié verrouillée des frais LP payés depuis le dernier partage. Elle est partagée une fois par jour entre les positions verrouillées pendant la journée.",
    estimatedShareLabel: "Part estimée du jour",
    estimatedShareDetail: (fraction: string, date: string) =>
      `${fraction} de la journée verrouillée · prochain partage ${date}`,
    estimatedShareNote:
      "Estimation pour la journée en cours : proportionnelle au poids de la position et à la fraction de la journée pendant laquelle elle est verrouillée. Le montant versé dépend de la cagnotte au prochain partage.",
    estimatedShareNone: "Aucun temps verrouillé aujourd'hui",
    positionStatus: "Statut",
    positionStatusLocked: "Gelée",
    positionStatusFree: "Libre",
    positionStatusFreeNoLock: "Libre · sans gel",
    positionFreeAfter: "Libre après relais ou échéance",
    guaranteedDepthLabel: "Profondeur garantie",
    guaranteedDepthHint: "Positions gelées plus liquidité permanente.",
    consolidatedTitle: "Prix consolidé du TTTI-T",
    consolidatedUsd: (price: string) => `${price} USD`,
    consolidatedCurrent: "Prix",
    consolidatedHourly: "Moyenne horaire",
    consolidatedDaily: "Moyenne sur 24 h",
    consolidatedSamples: (count: string) => `${count} échantillons`,
    consolidatedNotAvailable: "Non disponible",
    consolidatedComputedLabel: "Calculé",
    consolidatedSource: (symbol: string, price: string, weight: string) =>
      `TTTI-T/${symbol} : ${price} USD · poids ${weight}`,
    consolidatedNote:
      "Pondéré par la profondeur des pools et converti en USD aux taux horaires actuels.",
    consolidatedUnavailableNoRate:
      "Le prix consolidé est indisponible : aucun taux horaire valide.",
    consolidatedUnavailableNoPool:
      "Le prix consolidé est indisponible : aucun pool TTTI-T n'est ouvert aux échanges.",
    consolidatedLoadError: "Le prix consolidé n'a pas pu être chargé.",
    spreadLabel: "Écart avec le prix consolidé",
    spreadAboveThreshold: (threshold: string) =>
      `Écart supérieur à ${threshold} %`,
    spreadReasonEmpty: "Aucune liquidité dans ce pool.",
    spreadReasonNotOpen: "Les échanges ne sont pas ouverts.",
    spreadReasonNoRate: "Aucun taux horaire valide pour cette paire.",
    spreadReasonNoConsolidated: "Aucun prix consolidé.",
    spreadReasonLoadError: "Les écarts n'ont pas pu être chargés.",
    poolPriceLabel: "Prix du pool",
    spreadAlertTitle: "Écart au-dessus du seuil",
    spreadAlert: (pool: string, spread: string, threshold: string) =>
      `Pool ${pool} : l'écart avec le prix consolidé du TTTI-T est de ${spread}, au-dessus du seuil de ${threshold} %. Vous détenez une position dans ce pool.`,
    spreadAlertPrices: (poolPrice: string, consolidated: string) =>
      `Prix du pool ${poolPrice} USD · prix consolidé ${consolidated} USD`,
    referenceConsolidatedPrice: (price: string) =>
      `Prix consolidé du TTTI-T : ${price} USD`,
    guaranteedDepthReserves: (amount0: string, amount1: string) =>
      `Réserves garanties : ${amount0} et ${amount1}`,
    relayTitle: "Relais des engagements",
    relayExplain:
      "Le verrou relais est facultatif et dure de 3 mois à 5 ans. Un tiers du poids de chaque nouvel engagement allège les autres positions verrouillées du pool. Un propriétaire peut prolonger. Une position allégée ou arrivée à échéance est déverrouillée sans éviction : elle reste dans le pool comme liquidité libre.",
    relayResult: (shortened: string, freed: string) =>
      `Relais : ${shortened} position(s) raccourcie(s), ${freed} libérée(s).`,
    relayResultNone: "Relais : aucune autre position n'a été raccourcie.",
    feeSplitTitle: "Partage des frais avec les positions gelées",
    feeSplitExplain:
      "La moitié des frais revenant aux fournisseurs de liquidité reste dans les réserves, au prorata des parts. L'autre moitié est mise de côté et partagée entre les positions gelées selon le capital × la racine carrée de (temps restant ÷ 5 ans). Seuls les frais effectivement payés sont partagés.",
    errExtendRemovalAnnounced: (date: string) =>
      `Le gel ne peut pas être prolongé : le retrait de cette paire est annoncé pour le ${date}.`,
    ...PTM4_FR,
  },
  es: {
    title: "Pools",
    intro:
      "Pools de producto constante en poder de este contrato. Cada par tiene un nivel de comisión y su propia subcuenta de pool.",
    statusFilling: "En llenado",
    statusActive: "Activo",
    statusRemoved: "Retirado",
    newPairBadge: "Par nuevo",
    approvalNotRecommendation:
      "La aprobación de un par no es una recomendación.",
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
    deposit: (amount: string) => `Depósito: ${amount} TTTI-T`,
    depositApproval: (amount: string) =>
      `Antes de la solicitud, usted autoriza ${amount} TTTI-T (depósito más comisión del ledger) al contrato. La autorización vence a los 15 minutos.`,
    depositRule:
      "El depósito se devuelve si se aprueba y se conserva si se rechaza.",
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
    errTooManyPending: (max: string) =>
      `Ya tiene ${max} solicitudes pendientes.`,
    errCooldown: (date: string) =>
      `Tras un rechazo, una nueva solicitud es posible a partir del ${date}.`,
    errInsufficientAllowance: (allowance: string, required: string) =>
      `La autorización cubre ${allowance} TTTI-T; se requieren ${required} TTTI-T.`,
    errInsufficientFunds: (balance: string) =>
      `Su saldo de TTTI-T (${balance} TTTI-T) no cubre el depósito y la comisión.`,
    errDepositFailed: (detail: string) =>
      `No se pudo cobrar el depósito: ${detail}`,
    errApprovalFailed: (detail: string) =>
      `La autorización de TTTI-T falló: ${detail}`,
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
    errDexApprovalFailed: (detail: string) =>
      `La autorización falló: ${detail}`,
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
    gaugeOpen: (current: string, target: string) =>
      `${current} / ${target} USD`,
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
    protocolLiquidityLocked:
      "Bloqueada para siempre. No tiene forma de retiro.",
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
    ...DEX_ADMIN_EN,
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
    referenceUtilityBasis:
      "Los pares de utilidad usan las tasas USD de la hora.",
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
      `Profundidad del pool ${pair} respecto al umbral de intercambio`,
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
    recoverError: (detail: string) =>
      `No se pudo recuperar el saldo: ${detail}`,
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
    spreadLabel: "Diferencia con el precio consolidado",
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
      `Pool ${pool}: la diferencia con el precio consolidado de TTTI-T es ${spread}, por encima del umbral del ${threshold} %. Tienes una posición en este pool.`,
    spreadAlertPrices: (poolPrice: string, consolidated: string) =>
      `Precio del pool ${poolPrice} USD · precio consolidado ${consolidated} USD`,
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
    ...PTM4_ES,
  },
  "zh-Hans": {
    title: "流动性池",
    intro:
      "由本合约持有的恒定乘积流动性池。每个交易对都有一个费率档位和独立的池子账户。",
    statusFilling: "注入中",
    statusActive: "活跃",
    statusRemoved: "已移除",
    newPairBadge: "新交易对",
    approvalNotRecommendation: "批准某个交易对并不构成推荐。",
    tttiPair: "TTTI-T 交易对",
    utilityPair: "实用交易对",
    feeTier: "费率档位",
    feeTierBps5: "0.05%",
    feeTierBps30: "0.3%",
    feeTierBps100: "1%",
    poolSubaccount: "池子账户",
    minimumLocked: "最低锁定流动性",
    minimumTttiSide: (amount: string) => `TTTI-T 一侧 ${amount} TTTI-T`,
    minimumPerToken: "每种代币的最低值，由管理员设定",
    minimumNotSet: "尚未设定",
    firstDepositRule: "空池的首笔存入没有最低限额。",
    launchDepthRule: (amount: string) =>
      `当 TTTI-T 交易对的池中有 ${amount} USD 的 TTTI-T（其 TTTI-T 一侧按池价格计算，等于其另一侧按预言机汇率计算的价值），或实用交易对达到 ${amount} USD 深度（两侧按每小时汇率相加）时，兑换开放。低于该阈值时，池保持注入中：创建池、存入、添加流动性、购买和铸造仍然开放；仅兑换关闭。`,
    lockedSharesRule:
      "最低锁定份额在首次存入时按 √(A×B) 计算，永久归合约所有。",
    removedNotice: "该交易对已被移除。所有仓位均已清算。兑换和添加已关闭。",
    protocolStatement:
      "协议从不下达任何与价格挂钩的订单，也不会为流动性池创建任何 TTTI-T。永久流动性是深度管理：对协议份额进行机械、公开的再平衡，从不以价格为条件。兑换费用中的协议份额，三分之二归创建者，三分之一归永久流动性，任何人都无法提取。",
    loading: "正在加载流动性池…",
    loadError: "无法加载流动性池。",
    requestTitle: "申请交易对",
    ledgerId: "账本 ID",
    ledgerIdPlaceholder: "账本 canister ID",
    ledgerIdInvalid: "请输入有效的账本 canister ID。",
    counterToken: "对手代币",
    counterTokenPlaceholder: "选择代币",
    message: "留言",
    messageMax: (max: string) => `最多 ${max} 个字符。`,
    deposit: (amount: string) => `押金：${amount} TTTI-T`,
    depositApproval: (amount: string) =>
      `提交申请前，您需向合约授权 ${amount} TTTI-T（押金加账本手续费）。该授权在 15 分钟后过期。`,
    depositRule: "申请获批时押金退还，被拒绝时押金保留。",
    approving: "正在授权…",
    submit: "提交申请",
    submitting: "正在提交…",
    submitted: "申请已提交。",
    signInNeeded: "请登录以申请交易对。",
    requestsTitle: "申请",
    myRequestsTitle: "我的申请",
    noRequests: "暂无交易对申请。",
    requestStatusPending: "待处理",
    requestStatusApproved: "已批准",
    requestStatusRefused: "已拒绝",
    refusedReason: (reason: string) => `原因：${reason}`,
    copiedSymbol: "符号重复",
    copiedSymbolOf: (symbol: string) => `该符号已被 ${symbol} 使用`,
    errAnonymous: "请登录以申请交易对。",
    errMessageTooLong: (max: string) => `留言超过 ${max} 个字符。`,
    errInvalidToken: (detail: string) => `无法使用该账本：${detail}`,
    errUnknownCounterToken: "该对手代币不可用。",
    errLedgerUnreachable: (detail: string) => `无法连接该账本：${detail}`,
    errMissingStandards: (standards: string) => `该账本不支持 ${standards}。`,
    errMetadataUnavailable: (detail: string) =>
      `无法读取该账本的元数据：${detail}`,
    errPairExists: "该交易对已存在或已被申请。",
    errTooManyPending: (max: string) => `您已有 ${max} 个待处理的申请。`,
    errCooldown: (date: string) => `申请被拒绝后，自 ${date} 起可再次申请。`,
    errInsufficientAllowance: (allowance: string, required: string) =>
      `授权额度为 ${allowance} TTTI-T；需要 ${required} TTTI-T。`,
    errInsufficientFunds: (balance: string) =>
      `您的 TTTI-T 余额（${balance} TTTI-T）不足以支付押金和手续费。`,
    errDepositFailed: (detail: string) => `无法收取押金：${detail}`,
    errApprovalFailed: (detail: string) => `TTTI-T 授权失败：${detail}`,
    balancesTitle: "我的 DEX 余额",
    balancesSignIn: "登录后查看您的 DEX 余额。",
    balancesLoading: "正在加载余额…",
    balancesLoadError: "无法加载余额。",
    balancesEmpty: "没有 DEX 余额。",
    colToken: "代币",
    colAvailable: "可用",
    colReserved: "已预留",
    depositButton: "存入",
    withdrawButton: "提取",
    depositTitle: (symbol: string) => `存入 ${symbol}`,
    withdrawTitle: (symbol: string) => `提取 ${symbol}`,
    amountLabel: "金额",
    amountPlaceholder: "0.00",
    amountInvalid: "请输入有效金额。",
    availableAmount: (amount: string) => `可用：${amount}`,
    minimumDeposit: (amount: string) => `最低存入：${amount}`,
    minimumWithdrawal: (amount: string) => `最低提取：${amount}`,
    depositFeeNote: (fee: string) =>
      `您向合约授权该金额加上账本手续费（${fee}）。授权在 15 分钟后过期。`,
    withdrawFeeNote: (fee: string) => `账本手续费（${fee}）从提取金额中扣除。`,
    withdrawReceive: (amount: string) => `您将收到：${amount}`,
    confirmDeposit: "确认存入",
    confirmWithdraw: "确认提取",
    cancel: "取消",
    depositing: "正在存入…",
    withdrawing: "正在提取…",
    depositDone: "存入已完成。",
    withdrawDone: "提取已完成。",
    transfersTitle: "DEX 转账",
    noTransfers: "没有 DEX 转账。",
    directionDeposit: "存入",
    directionWithdrawal: "提取",
    transferStatusInProgress: "进行中",
    transferStatusCompleted: "已完成",
    transferStatusFailed: "失败",
    transferStatusNeedsReview: "待核查",
    transferBlock: (block: string) => `区块 ${block}`,
    transferError: (detail: string) => `错误：${detail}`,
    memo: "Memo",
    errDexAnonymous: "请登录后存入或提取。",
    errAmountTooSmall: (minimum: string) => `最低为 ${minimum}。`,
    errTransferInProgress: "该代币已有一笔转账正在进行。请稍后再试。",
    errDexInsufficientAllowance: (allowance: string, required: string) =>
      `授权额度为 ${allowance}；需要 ${required}。`,
    errDexInsufficientFunds: (balance: string) =>
      `您的余额（${balance}）不足以支付该金额和手续费。`,
    errDexInsufficientBalance: (available: string) =>
      `您的可用 DEX 余额为 ${available}。`,
    errLedger: (detail: string) => `账本返回错误：${detail}`,
    errDexApprovalFailed: (detail: string) => `授权失败：${detail}`,
    lookupTitle: "按标识符查询 DEX 余额",
    lookupLabel: "Principal",
    lookupPlaceholder: "Principal ID",
    lookupButton: "查询",
    lookupInvalid: "请输入有效的 principal。",
    lookupEmpty: "该 principal 没有 DEX 余额。",
    depositSubaccount: "存入子账户",
    copyDepositSubaccount: "复制存入子账户",
    copied: "已复制",
    refundLabel: "押金退还",
    refundNone: "无退还",
    refundInProgress: "退还进行中",
    refundNeedsReview: "退还待核查",
    refundRefunded: (block: string) => `已退还（区块 ${block}）`,
    privacyPositions: "流动性头寸是公开的，并与您在 TTTI 上的标识符相关联。",
    privacyDeposit: "您的存入在链上仍然可见。",
    gaugeLabel: "注入进度",
    gaugeFilling: (current: string, target: string, remaining: string) =>
      `${current} / ${target} USD — 还差 ${remaining} USD 达到兑换阈值`,
    gaugeOpen: (current: string, target: string) =>
      `${current} / ${target} USD`,
    gaugeUnavailable: "价值暂时无法获取",
    reserves: "储备",
    totalShares: "份额总数",
    addLiquidityButton: "添加流动性",
    swapButton: "兑换",
    positionsButton: "头寸",
    signInForActions: "请登录以添加流动性或进行兑换。",
    pairTokensUnsupported: "该交易对的代币不支持流动性和兑换。",
    swapsClosedFilling: (gauge: string) => `池在注入中期间兑换关闭：${gauge}`,
    addTitle: (pair: string) => `添加流动性 · ${pair}`,
    addIntro:
      "金额从您可用的 DEX 余额中扣除。流动性头寸是公开的，并与您在 TTTI 上的标识符相关联。您的存入在链上仍然可见。",
    sideLabel: "输入的代币",
    tokenAmountLabel: (symbol: string) => `${symbol} 金额`,
    firstDepositNote: "首笔存入：请输入两个金额。其比例确定池的比例。",
    counterComputed: (amount: string) => `按池比例计算的另一侧金额：${amount}`,
    sharesToReceive: (shares: string) => `将获得的份额：${shares}`,
    sharesLockedForever: (shares: string) =>
      `永久锁定在合约中的份额：${shares}`,
    gaugeAfter: (gauge: string) => `存入后的进度：${gauge}`,
    opensPool: "此次存入将使池开放兑换。",
    staysFilling: "此次存入后池仍处于注入中。",
    quoting: "正在计算报价…",
    lockLabel: "锁定期限",
    lockHint: (min: string, max: string) =>
      `可选：默认不锁定。锁定期为 ${min} 至 ${max}。所有者可以延长锁定，不能缩短。`,
    lockPreset1d: "1 天",
    lockPreset7d: "7 天",
    lockPreset30d: "30 天",
    lockPreset90d: "90 天",
    lockPreset3m: "3 个月",
    lockPreset2y: "2 年",
    lockPreset3y: "3 年",
    lockPreset4y: "4 年",
    lockPreset1y: "1 年",
    lockPreset5y: "5 年",
    lockCustom: "自定义",
    lockCustomDays: "天数",
    lockInvalid: (min: string, max: string) =>
      `请输入 ${min} 到 ${max} 之间的期限。`,
    durationDays: (days: string) => `${days} 天`,
    durationOneDay: "1 天",
    unlockOn: (date: string) => `解锁：${date}`,
    confirmAdd: "添加流动性",
    adding: "正在添加流动性…",
    addDone: (id: string, shares: string) =>
      `已创建头寸 #${id}，份额 ${shares}。`,
    refTitle: "ICPSwap 参考价格",
    refQuote: (input: string, output: string) =>
      `ICPSwap 报价：${input} → ${output}（含 ICPSwap 手续费）。仅供参考。`,
    refDeviation: (pct: string) => `您的存入比例与该参考相差 ${pct} %。`,
    refDeviationWarning: (pct: string) =>
      `注意：您的存入比例与 ICPSwap 参考相差 ${pct} %，超过 2 %。`,
    refUnavailable: "该交易对没有 ICPSwap 池；参考价格不可用。",
    refError: "无法读取 ICPSwap 参考价格。",
    refLoading: "正在读取 ICPSwap 价格…",
    positionsTitle: (pair: string) => `头寸 · ${pair}`,
    positionsEmpty: "该池中没有头寸。",
    positionsLoading: "正在加载头寸…",
    positionsLoadError: "无法加载头寸。",
    colOwner: "持有者",
    colPair: "交易对",
    colShares: "份额",
    colAmounts: "金额",
    colLock: "锁定",
    colUnlock: "解锁",
    creatorBadge: "创建者",
    copyPrincipal: "复制 principal",
    unlockedLabel: "已解锁",
    positionLabel: (id: string) => `头寸 #${id}`,
    myPositionsTitle: "我的头寸",
    myPositionsEmpty: "您没有流动性头寸。",
    myPositionsNote:
      "提取头寸会记入您的 DEX 余额。请使用“我的 DEX 余额”中的“提取”将代币发送到您的钱包。",
    withdrawPosition: "提取",
    withdrawingPosition: "正在提取…",
    positionWithdrawn: (amount0: string, amount1: string) =>
      `已提取：${amount0} 和 ${amount1} 已记入您的 DEX 余额。`,
    lockedUntil: (date: string) => `锁定至 ${date}。`,
    removedWithdrawOpen: "在任何池状态下，提取都遵循解锁日期。",
    extendLockButton: "延长锁定",
    extendTitle: (id: string) => `延长锁定 · 头寸 #${id}`,
    extendCurrent: (date: string) => `当前解锁：${date}`,
    extendModeDate: "日期",
    extendModeDays: "天数",
    extendDateLabel: "新的解锁日期",
    extendDaysLabel: "在当前解锁基础上增加的天数",
    extendNewUnlock: (date: string) => `新的解锁：${date}`,
    extendTooEarly: "新的解锁时间必须晚于当前解锁时间。",
    extendTooLate: (date: string) => `新的解锁时间不能晚于 ${date}。`,
    confirmExtend: "确认延长",
    extending: "正在延长…",
    extendDone: (date: string) => `锁定已延长至 ${date}。`,
    swapTitle: (pair: string) => `兑换 · ${pair}`,
    swapIntro: "兑换使用您可用的 DEX 余额；所得金额记入其中。",
    swapFrom: "卖出的代币",
    swapAmountOut: "您将收到（估算）",
    swapFee: (pct: string) => `手续费（${pct}）`,
    swapPriceImpact: "价格影响",
    swapMinimum: "最少收到",
    slippageLabel: "滑点容差（%）",
    slippageInvalid: "请输入 0 到 50 % 之间的容差。",
    swapDeadlineNote: "截止时间设为确认后 5 分钟。",
    confirmSwap: "确认兑换",
    swapping: "正在兑换…",
    swapDone: (input: string, output: string) =>
      `已用 ${input} 兑换 ${output}。`,
    errLiqAnonymous: "请登录以使用资金池。",
    errPoolNotFound: "该池不存在。",
    errPoolRemoved: "该交易对已被移除。存入和兑换已被阻止。",
    errMinimumsNotSet: "该交易对的最低值尚未设定。",
    errUnsupportedToken: "DEX 不支持该代币。",
    errZeroAmount: "请输入大于零的金额。",
    errCounterAmountRequired: "首笔存入：请输入两个金额。",
    errLiqInsufficientBalance: (available: string, required: string) =>
      `您可用的 DEX 余额为 ${available}；需要 ${required}。`,
    errBelowMinimum: (minimums: string) => `存入低于最低值：${minimums}。`,
    errRatioMismatch: (required: string) =>
      `按池比例，另一侧金额必须为 ${required}。`,
    errLockTooShort: (min: string) => `锁定期太短。最短：${min}。`,
    errLockTooLong: (max: string) => `锁定期太长。最长：${max}。`,
    errZeroShares: "此次存入太少，无法获得份额。",
    errOperationInProgress: "该账户有另一项操作正在进行。请稍后再试。",
    errPositionNotFound: "该头寸不存在。",
    errNotPositionOwner: "该头寸属于另一个 principal。",
    errPositionLocked: (date: string) => `该头寸锁定至 ${date}。`,
    errCannotShortenLock: (date: string) => `锁定不能缩短。当前解锁：${date}。`,
    errUnlockTooLate: (date: string) => `解锁日期不能晚于 ${date}。`,
    errPoolFilling: (gauge: string) => `该池仍在注入中：${gauge}`,
    errPoolNotOpen: "该池未开放兑换。",
    errRateUnavailable: "某个 USD 汇率暂时不可用；无法核对池的价值。",
    errTokenNotInPool: "该代币不属于此交易对。",
    errInvalidSlippage: (max: string) => `滑点容差最多为 ${max} %。`,
    errSwapInsufficientBalance: (available: string) =>
      `您可用的 DEX 余额为 ${available}。`,
    errInsufficientLiquidity: "该池的流动性不足以完成此次兑换。",
    errSlippageExceeded: (out: string, min: string) =>
      `超出滑点：兑换将得到 ${out}，低于最低值 ${min}。请重新获取报价。`,
    errDeadlineExceeded: (date: string) =>
      `截止时间（${date}）已过。请重新确认。`,
    errDeadlineTooFar: (date: string) =>
      `截止时间太远；可接受的最晚时间为 ${date}。`,
    errCall: (detail: string) => `调用失败：${detail}`,
    bonusTitle: "锁定头寸的 ICP 加成",
    bonusScope:
      "TTTI-T 交易对中的锁定头寸已获得的 ICP 加成仍可领取。兑换费用不再产生新的加成。",
    bonusWeightRule: "头寸权重 = ICP 价值 × 剩余锁定时间 ÷ 5 年。",
    bonusObservedNote: "加成仅显示已观察到的金额。不估算也不承诺任何未来金额。",
    bonusSignIn: "登录以查看您的 ICP 加成。",
    bonusLoading: "正在加载加成…",
    bonusLoadError: "无法加载加成。",
    bonusClaimable: (amount: string) => `可领取：${amount}`,
    bonusClaimedTotal: (amount: string) => `累计已领取：${amount}`,
    bonusNoPositions: "没有 TTTI-T 交易对中的锁定头寸。",
    bonusColPosition: "头寸",
    bonusColValueIcp: "ICP 价值",
    bonusColRemainingLock: "剩余锁定",
    bonusColWeight: "权重",
    bonusClaimsTitle: "领取记录",
    bonusClaimsEmpty: "尚无领取记录。",
    claimButton: "领取 ICP 加成",
    claiming: "正在领取…",
    claimDone: (amount: string) =>
      `已记录领取 ${amount}。ICP 将发送到您的钱包。`,
    errClaimAnonymous: "请登录以领取加成。",
    errClaimNothing: "没有可领取的金额。",
    errClaimBelowMinimum: (minimum: string) =>
      `可领取金额低于最低额 ${minimum}。`,
    errClaimInProgress: "已有一笔领取正在进行。请稍后重试。",
    protocolLiquidityTitle: "协议流动性",
    protocolLiquidityLocked: "永久锁定，没有任何提取途径。",
    protocolLiquidityHeld: (amount0: string, amount1: string) =>
      `持有：${amount0} 和 ${amount1}`,
    protocolLiquidityFromFees: (amount0: string, amount1: string) =>
      `来自费用：${amount0} 和 ${amount1}`,
    protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
      `来自金库：${amount0} 和 ${amount1}`,
    protocolLiquidityShare: (pct: string) => `占池份额的 ${pct} %`,
    protocolLiquidityLastAdded: (date: string) => `最近一次添加：${date}`,
    protocolLiquidityNone: "此池中没有协议流动性。",
    dexPausedTitle: "DEX 已暂停",
    dexPausedNotice: (token: string) =>
      `DEX 已暂停：储备核对发现 ${token} 出现缺口。兑换、存入和添加流动性暂不可用。提取和移除流动性仍然可用。`,
    dexPausedTooltip: "DEX 暂停期间不可用。",
    errDexPaused:
      "储备核对后 DEX 已暂停。兑换、存入和添加流动性暂不可用。提取和移除流动性仍然可用。",
    navLabel: "流动性池页面分区",
    navPools: "流动性池",
    navIndicators: "指标",
    navMyLiquidity: "我的流动性",
    navProtocol: "协议",
    navRequests: "申请",
    introShort: "由本合约持有的恒定乘积流动性池。",
    statusWaiting: "等待流动性",
    statusOpen: "已开放",
    detailsLabel: "详情",
    addShort: "添加",
    howPoolsWorkTitle: "流动性池如何运作",
    permanentLiquidity: "永久流动性",
    permanentLiquidityValue: (shares: string, pct: string) =>
      `${shares} 份额（占池子的 ${pct}%）`,
    myLiquiditySignIn: "登录后可查看您的 DEX 余额、流动性头寸和已收到的费用。",
    rewardsTitle: "已收到的费用",
    activityTitle: "我的活动",
    activityFilterLabel: "活动类型",
    filterAll: "全部",
    filterTransfers: "存入和提取",
    filterMintFees: "铸造手续费",
    filterLpBonus: "LP 加成",
    tokenFilterLabel: "代币",
    allTokens: "全部代币",
    activityEmpty: "这些筛选条件下没有活动。",
    activityLoadError: "无法加载您的活动。",
    entryMintFee: "领取铸造手续费",
    entryLpBonus: "领取 LP 加成",
    requestsFilterLabel: "申请筛选",
    filterRejected: "已拒绝",
    requestsEmptyFiltered: "此筛选条件下没有申请。",
    poolsEmpty: "暂无池。",
    ...DEX_ADMIN_EN,
    depthLabel: "深度",
    depthValue: (usd: string) => `${usd} USD`,
    depthBasisTwice: "按池价格计算，非 TTTI-T 一侧 USD 价值的两倍。",
    depthBasisSum: "按池价格和每小时汇率计算的两侧 USD 价值之和。",
    depthUnavailable: "深度暂时不可用：缺少 USD 汇率。",
    depthMissingRate: (tokens: string) => `缺少汇率：${tokens}。`,
    thresholdLabel: "兑换阈值",
    thresholdValueTtti: (usd: string) => `池中 ${usd} USD 的 TTTI-T`,
    thresholdValueDepth: (usd: string) => `${usd} USD 深度`,
    thresholdRule: (usd: string) =>
      `当深度不低于 ${usd} USD 且 USD 汇率可用时，兑换开放。该阈值仅适用于兑换，每次调用都会检查。`,
    swapStateLabel: "兑换",
    swapStateOpen: "开放",
    swapStateClosed: "关闭",
    swapClosedBelowThreshold: (measured: string, threshold: string) =>
      `兑换已关闭：池当前为 ${measured} USD，低于兑换阈值（${threshold}）。达到该阈值后兑换即开放。存入、添加流动性和铸造不受影响。`,
    swapClosedRateUnavailable: "兑换已关闭：USD 汇率暂时不可用。",
    swapClosedRemovalAnnounced: (date: string) =>
      `兑换已暂停：该交易对已公告将于 ${date} 移除。`,
    swapClosedRemovalExecuting: "兑换已关闭：该交易对正在移除。",
    swapClosedRemoved: "兑换已关闭：该交易对已被移除。",
    errDepthBelowThreshold: (measured: string, threshold: string) =>
      `兑换被拒绝：池当前为 ${measured} USD，低于 ${threshold} USD 的兑换阈值。`,
    errSwapRateUnavailable: "兑换被拒绝：USD 汇率暂时不可用。",
    errRemovalInProgress: (date: string) =>
      `兑换被拒绝：该交易对已公告将于 ${date} 移除。`,
    errSwapPoolRemoved: "兑换被拒绝：该交易对已被移除。",
    fixedSideLabel: "固定一侧",
    fixedSideHint: "您输入此数额，它不会改变。",
    counterSideLabel: "对应一侧（计算得出）",
    counterSideNote: "存入时按池比例计算，在滑点容差范围内。",
    counterSideRange: (min: string, max: string) =>
      `可接受的对应数额：${min} 至 ${max}`,
    addSlippageLabel: "滑点容差 (%)",
    addSlippageHint: "报价与执行之间对应数额允许的最大变化。",
    addSlippageDefault: "默认：0.5 %",
    addSlippageInvalid: (max: string) => `请输入 0 到 ${max} % 之间的容差。`,
    depthAfter: (depth: string) => `存入后的深度：${depth} USD`,
    surplusKept: (amount: string) =>
      `未使用：${amount}。保留在您的内部 DEX 余额中。`,
    addDoneSurplus: (id: string, shares: string, surplus: string) =>
      `已创建仓位 #${id}，份额 ${shares}。未使用：${surplus}，保留在您的内部 DEX 余额中。`,
    errAddInvalidSlippage: (max: string) => `滑点容差最多为 ${max} %。`,
    errAddSlippageExceeded: (
      tolerance: string,
      expected: string,
      actual: string,
    ) =>
      `对应数额的变化超出 ${tolerance} % 的容差：预期 ${expected}，现为 ${actual}。未扣除任何款项；资金保留在您的内部余额中。请重新获取报价。`,
    errAddReferenceOutOfBand: (
      expected: string,
      deviation: string,
      tolerance: string,
    ) =>
      `首次存入的比例与参考价格相差 ${deviation} %，超出 ${tolerance} % 的区间。预期：${expected}。未扣除任何款项；资金保留在您的内部余额中。`,
    errAddReferenceUnavailable:
      "参考价格不可用，无法检查首次存入。未扣除任何款项；资金保留在您的内部余额中。",
    errAddRemovalAnnounced: (date: string) =>
      `添加流动性已暂停：该交易对已公告将于 ${date} 移除。提取仍然开放，但受仓位锁定限制。`,
    referenceTitle: "参考价格",
    referenceIntro: (tolerance: string) =>
      `空池的首次存入必须在参考价格的 ${tolerance} % 范围内。`,
    referenceTttiPrice: (price: string) => `TTTI-T 参考价格：${price} USD`,
    referenceExpected: (expected: string) => `预期比例：${expected}`,
    referenceSourcesTitle: "来源",
    referenceColSource: "来源",
    referenceColPrice: "价格 (USD)",
    referenceColDepth: "深度 (USD)",
    referenceColWeight: "权重",
    referenceSourceNative: "原生池",
    referenceSourceIcpswap: "ICPSwap",
    referenceReadAt: (date: string) => `读取于 ${date}`,
    referenceTolerance: (pct: string) => `容差：${pct} %`,
    referenceUtilityBasis: "功能型交易对使用每小时 USD 汇率。",
    referenceUnavailableNoSource: "参考价格不可用：无法读取任何来源。",
    referenceUnavailableRate: (tokens: string) =>
      `参考价格不可用：缺少 ${tokens} 的 USD 汇率。`,
    referenceRatesInvalid: "每小时 USD 汇率无效；无法检查功能型交易对。",
    referenceWithin: (deviation: string) => `在区间内：偏差 ${deviation} %。`,
    referenceOutside: (deviation: string, tolerance: string) =>
      `超出区间：偏差 ${deviation} %，容差 ${tolerance} %。`,
    referenceNotApplicable: "无参考检查：该池已有流动性。",
    referenceRefresh: "重新读取来源",
    referenceRefreshing: "正在读取来源…",
    referenceRefreshed: (count: string) => `已读取 ${count} 个来源。`,
    referenceLoading: "正在加载参考价格…",
    referenceLoadError: "无法加载参考价格。",
    lockNone: "不锁定",
    lockNoneHint: "不锁定：仓位可随时提取。",
    lockPickerLabel: "锁定（可选）",
    lockUpTo: (max: string) =>
      `锁定期为 3 个月至 ${max}。所有者可以延长锁定，不能缩短。`,
    lockEnforced:
      "在任何池状态下（包括已移除的交易对），解锁日期均适用。任何人都不能取消锁定；只有池中新承诺的接力可以缩短锁定。",
    positionLiquidated: "仓位已在交易对移除时清算。",
    removalTitle: "交易对移除",
    removalBadge: "已公告移除",
    removalAnnouncedTitle: "已公告移除",
    removalReasonLabel: "原因",
    removalAnnouncedAt: (date: string) => `公告时间：${date}`,
    removalEffectiveAt: (date: string) => `生效时间：${date}`,
    removalRemaining: (remaining: string) => `剩余：${remaining}`,
    removalSuspendedNotice:
      "兑换和添加流动性已暂停。提取仍然开放，但受仓位锁定限制。",
    removalLiquidationNotice:
      "在生效日期，所有仓位（包括已锁定的仓位）都将被清算，该池将标记为已移除。",
    removalCancelledTitle: "移除已取消",
    removalCancelledNotice: (date: string) =>
      `已公告的移除于 ${date} 取消。兑换和添加重新依据池深度。`,
    removalExecutingTitle: "正在移除",
    removalExecutingNotice: "正在清算仓位。兑换和添加已关闭。",
    removalCompletedTitle: "交易对已移除",
    removalCompletedNotice: (date: string) =>
      `已于 ${date} 移除。所有仓位均已清算。`,
    removalReviewNotice: "结果无法确认的支付会列入管理员的待审核清单。",
    poolDepthShort: (usd: string) => `深度 ${usd} USD`,
    swapsOpenBadge: "兑换开放",
    swapsClosedBadge: "兑换关闭",
    dexPercentConnect: "连接钱包以使用此滑块。",
    dexPercentLoading: "正在加载余额…",
    dexPercentUnavailable: "余额不可用。",
    dexPercentNotCover: (fees: string) =>
      `钱包与 DEX 余额不足以支付 ${fees} 的网络手续费。`,
    dexPercentShare: (symbol: string) => `${symbol} 占比（钱包 + DEX）`,
    dexPercentSummary: (percent: string, amount: string) =>
      `${percent}% = ${amount}`,
    dexPercentBase: (wallet: string, dex: string, total: string) =>
      `基数：钱包 ${wallet} + DEX ${dex} = ${total}`,
    dexPercentComputedOn: (fees: string) =>
      `按钱包余额加可用 DEX 余额计算，并扣除从钱包划出部分的 ${fees} 账本手续费。`,
    slippageFieldHint: "报价金额与执行金额之间的最大差异。",
    emptyPoolTitle: "空池的首次存入",
    emptyPoolNote:
      "此池尚无流动性。输入一个金额；另一侧按参考价格计算，并在添加时按容差检查。",
    expectedOtherAmountLabel: (symbol: string) =>
      `按参考价格预计的 ${symbol} 数量`,
    expectedOtherAmountUnavailable: "无可用的参考价格。",
    addReferenceBlockTitle: "首次存入的参考价格",
    poolSwapStateLabel: "兑换状态",
    depthBarOpen: "开放：已达到兑换阈值",
    depthBarClosed: "关闭：低于兑换阈值",
    depthBarAriaLabel: (pair: string) => `${pair} 池相对于兑换阈值的深度`,
    countdownLabel: "剩余时间",
    countdownDays: (count: string) => `${count} 天`,
    countdownHours: (count: string) => `${count} 小时`,
    countdownMinutes: (count: string) => `${count} 分钟`,
    countdownSeconds: (count: string) => `${count} 秒`,
    countdownReached: "已到达生效日期。",
    recoverHeading: "您的 DEX 余额",
    recoverButton: "取回",
    recoverExplain: "余额将返回您的钱包。每笔金额将扣除账本手续费。",
    recovering: "正在取回…",
    recoverDone: (amounts: string) => `已取回至您的钱包：${amounts}。`,
    recoverNothing: "没有可取回的 DEX 余额。",
    recoverError: (detail: string) => `无法取回余额：${detail}`,
    durationOneYear: "1 年",
    durationYears: (count: string) => `${count} 年`,
    durationOneMonth: "1 个月",
    durationMonths: (count: string) => `${count} 个月`,
    positionLockCommitted: "已承诺锁定",
    positionLockStart: "锁定开始",
    positionTimeRemaining: "剩余时间",
    positionRelayReceived: "已接收接力",
    relayReceivedNone: "无",
    positionFeesCollected: "已收取费用",
    pendingPotLabel: "待分配资金池",
    pendingPotNext: (date: string) => `下次分配：${date}`,
    pendingPotRunning: "正在分配",
    pendingPotNote:
      "该资金池包含自上次分配以来已支付的 LP 手续费中被锁定的一半。每天一次在当天处于锁定状态的头寸之间分配。",
    estimatedShareLabel: "今日预计份额",
    estimatedShareDetail: (fraction: string, date: string) =>
      `当天锁定时间占比 ${fraction} · 下次分配 ${date}`,
    estimatedShareNote:
      "当天的估算值：与头寸的权重及其当天处于锁定状态的时间占比成正比。实际支付金额取决于下次分配时的资金池。",
    estimatedShareNone: "今日没有锁定时间",
    positionStatus: "状态",
    positionStatusLocked: "已锁定",
    positionStatusFree: "自由",
    positionStatusFreeNoLock: "自由 · 未锁定",
    positionFreeAfter: "接力或到期后自由",
    guaranteedDepthLabel: "保证深度",
    guaranteedDepthHint: "锁定头寸加永久流动性。",
    consolidatedTitle: "TTTI-T 综合价格",
    consolidatedUsd: (price: string) => `${price} USD`,
    consolidatedCurrent: "价格",
    consolidatedHourly: "每小时平均",
    consolidatedDaily: "24 小时平均",
    consolidatedSamples: (count: string) => `${count} 个样本`,
    consolidatedNotAvailable: "不可用",
    consolidatedComputedLabel: "计算时间",
    consolidatedSource: (symbol: string, price: string, weight: string) =>
      `TTTI-T/${symbol}：${price} USD · 权重 ${weight}`,
    consolidatedNote: "按流动性池深度加权，并按当前每小时汇率换算为 USD。",
    consolidatedUnavailableNoRate: "综合价格不可用：没有有效的每小时汇率。",
    consolidatedUnavailableNoPool:
      "综合价格不可用：没有向兑换开放的 TTTI-T 流动性池。",
    consolidatedLoadError: "无法加载综合价格。",
    spreadLabel: "与综合价格的价差",
    spreadAboveThreshold: (threshold: string) => `价差超过 ${threshold} %`,
    spreadReasonEmpty: "该流动性池没有流动性。",
    spreadReasonNotOpen: "兑换未开放。",
    spreadReasonNoRate: "该交易对没有有效的每小时汇率。",
    spreadReasonNoConsolidated: "没有综合价格。",
    spreadReasonLoadError: "无法加载价差。",
    poolPriceLabel: "流动性池价格",
    spreadAlertTitle: "价差超过阈值",
    spreadAlert: (pool: string, spread: string, threshold: string) =>
      `流动性池 ${pool}：与 TTTI-T 综合价格的价差为 ${spread}，超过 ${threshold} % 的阈值。你在该流动性池中持有头寸。`,
    spreadAlertPrices: (poolPrice: string, consolidated: string) =>
      `流动性池价格 ${poolPrice} USD · 综合价格 ${consolidated} USD`,
    referenceConsolidatedPrice: (price: string) =>
      `TTTI-T 综合价格：${price} USD`,
    guaranteedDepthReserves: (amount0: string, amount1: string) =>
      `保证储备：${amount0} 和 ${amount1}`,
    relayTitle: "承诺接力",
    relayExplain:
      "接力锁定是可选的，期限为 3 个月至 5 年。每笔新承诺权重的三分之一，会减轻池中其他已锁定头寸的锁定。所有者可以延长。被减轻或已到期的头寸会被解锁，且不会被驱逐：它作为自由流动性留在池中。",
    relayResult: (shortened: string, freed: string) =>
      `接力：${shortened} 个头寸被缩短，${freed} 个已释放。`,
    relayResultNone: "接力：没有其他头寸被缩短。",
    feeSplitTitle: "向锁定头寸分配费用",
    feeSplitExplain:
      "流动性提供者费用的一半留在储备中，按份额比例分配。另一半被单独留出，按 资本 ×（剩余时间 ÷ 5 年）的平方根，在锁定头寸之间分配。仅分配实际已支付的费用。",
    errExtendRemovalAnnounced: (date: string) =>
      `无法延长锁定：该交易对已公告将于 ${date} 移除。`,
    ...PTM4_ZH,
  },
  "pt-BR": {
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
    deposit: (amount: string) => `Depósito: ${amount} TTTI-T`,
    depositApproval: (amount: string) =>
      `Antes da solicitação, você autoriza ${amount} TTTI-T (depósito mais taxa do ledger) ao contrato. A autorização expira após 15 minutos.`,
    depositRule: "O depósito é devolvido na aprovação e retido na recusa.",
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
      `A autorização cobre ${allowance} TTTI-T; são necessários ${required} TTTI-T.`,
    errInsufficientFunds: (balance: string) =>
      `Seu saldo de TTTI-T (${balance} TTTI-T) não cobre o depósito e a taxa.`,
    errDepositFailed: (detail: string) =>
      `Não foi possível cobrar o depósito: ${detail}`,
    errApprovalFailed: (detail: string) =>
      `A autorização de TTTI-T falhou: ${detail}`,
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
    gaugeOpen: (current: string, target: string) =>
      `${current} / ${target} USD`,
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
    extendTooEarly:
      "O novo desbloqueio deve ser posterior ao desbloqueio atual.",
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
    errPoolRemoved:
      "Este par foi removido. Depósitos e trocas estão bloqueados.",
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
    errLockTooLong: (max: string) =>
      `O bloqueio é longo demais. Máximo: ${max}.`,
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
    ...DEX_ADMIN_EN,
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
      `Profundidade do pool ${pair} em relação ao limite de troca`,
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
    spreadLabel: "Diferença em relação ao preço consolidado",
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
      `Pool ${pool}: a diferença em relação ao preço consolidado do TTTI-T é ${spread}, acima do limite de ${threshold} %. Você tem uma posição neste pool.`,
    spreadAlertPrices: (poolPrice: string, consolidated: string) =>
      `Preço do pool ${poolPrice} USD · preço consolidado ${consolidated} USD`,
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
    ...PTM4_PT,
  },
  ko: {
    title: "풀",
    intro:
      "이 컨트랙트가 보유한 상수곱 풀입니다. 각 페어에는 수수료 등급과 고유한 풀 하위 계정이 있습니다.",
    statusFilling: "채우는 중",
    statusActive: "활성",
    statusRemoved: "제거됨",
    newPairBadge: "새 페어",
    approvalNotRecommendation: "페어 승인은 추천이 아닙니다.",
    tttiPair: "TTTI-T 페어",
    utilityPair: "유틸리티 페어",
    feeTier: "수수료 등급",
    feeTierBps5: "0.05%",
    feeTierBps30: "0.3%",
    feeTierBps100: "1%",
    poolSubaccount: "풀 하위 계정",
    minimumLocked: "최소 잠금 유동성",
    minimumTttiSide: (amount: string) => `TTTI-T 쪽 ${amount} TTTI-T`,
    minimumPerToken: "토큰별 최소값, 관리자가 설정",
    minimumNotSet: "아직 설정되지 않음",
    firstDepositRule: "빈 풀의 첫 예치에는 최소값이 없습니다.",
    launchDepthRule: (amount: string) =>
      `TTTI-T 페어는 풀 내 TTTI-T가 ${amount} USD(풀 가격 기준 TTTI-T 쪽 가치로, 오라클 환율 기준 다른 쪽 가치와 같음)에 도달하면, 유틸리티 페어는 깊이가 ${amount} USD(시간별 환율로 양쪽 합산)에 도달하면 스왑이 열립니다. 이 임계값 미만에서는 풀이 채우는 중 상태로 유지되며, 풀 생성, 예치, 유동성 추가, 구매, 민트는 계속 가능하고 스왑만 닫힙니다.`,
    lockedSharesRule:
      "최소 잠금 지분은 첫 예치 시 √(A×B)로 계산되며 영구적으로 컨트랙트에 귀속됩니다.",
    removedNotice:
      "이 페어는 제거되었습니다. 모든 포지션이 청산되었습니다. 스왑과 추가는 닫혀 있습니다.",
    protocolStatement:
      "프로토콜은 가격과 연동된 주문을 절대 하지 않으며 풀을 위해 TTTI-T를 생성하지 않습니다. 영구 유동성은 깊이 관리입니다. 프로토콜 몫을 기계적이고 공개적으로 재조정하며, 가격을 조건으로 하지 않습니다. 스왑 수수료 중 프로토콜 몫은 3분의 2가 생성자에게, 3분의 1이 아무도 인출할 수 없는 영구 유동성에 배분됩니다.",
    loading: "풀을 불러오는 중…",
    loadError: "풀을 불러올 수 없습니다.",
    requestTitle: "페어 요청",
    ledgerId: "원장 ID",
    ledgerIdPlaceholder: "원장 캐니스터 ID",
    ledgerIdInvalid: "올바른 원장 캐니스터 ID를 입력하십시오.",
    counterToken: "상대 토큰",
    counterTokenPlaceholder: "토큰 선택",
    message: "메시지",
    messageMax: (max: string) => `최대 ${max}자.`,
    deposit: (amount: string) => `보증금: ${amount} TTTI-T`,
    depositApproval: (amount: string) =>
      `요청 전에 컨트랙트에 ${amount} TTTI-T(보증금과 원장 수수료)를 승인합니다. 승인은 15분 후 만료됩니다.`,
    depositRule: "보증금은 승인 시 반환되고 거절 시 보관됩니다.",
    approving: "승인 중…",
    submit: "요청 제출",
    submitting: "제출 중…",
    submitted: "요청이 제출되었습니다.",
    signInNeeded: "페어를 요청하려면 로그인하십시오.",
    requestsTitle: "요청",
    myRequestsTitle: "내 요청",
    noRequests: "페어 요청이 없습니다.",
    requestStatusPending: "대기 중",
    requestStatusApproved: "승인됨",
    requestStatusRefused: "거절됨",
    refusedReason: (reason: string) => `사유: ${reason}`,
    copiedSymbol: "복제된 심볼",
    copiedSymbolOf: (symbol: string) => `${symbol}이(가) 이미 사용하는 심볼`,
    errAnonymous: "페어를 요청하려면 로그인하십시오.",
    errMessageTooLong: (max: string) => `메시지가 ${max}자를 초과합니다.`,
    errInvalidToken: (detail: string) =>
      `이 원장은 사용할 수 없습니다: ${detail}`,
    errUnknownCounterToken: "상대 토큰을 사용할 수 없습니다.",
    errLedgerUnreachable: (detail: string) =>
      `원장에 연결할 수 없습니다: ${detail}`,
    errMissingStandards: (standards: string) =>
      `원장이 ${standards}을(를) 지원하지 않습니다.`,
    errMetadataUnavailable: (detail: string) =>
      `원장 메타데이터를 읽을 수 없습니다: ${detail}`,
    errPairExists: "이 페어는 이미 존재하거나 이미 요청되었습니다.",
    errTooManyPending: (max: string) =>
      `이미 대기 중인 요청이 ${max}개 있습니다.`,
    errCooldown: (date: string) =>
      `거절 후에는 ${date}부터 새 요청이 가능합니다.`,
    errInsufficientAllowance: (allowance: string, required: string) =>
      `승인 금액은 ${allowance} TTTI-T이며, ${required} TTTI-T가 필요합니다.`,
    errInsufficientFunds: (balance: string) =>
      `TTTI-T 잔액(${balance} TTTI-T)으로 보증금과 수수료를 충당할 수 없습니다.`,
    errDepositFailed: (detail: string) =>
      `보증금을 받을 수 없습니다: ${detail}`,
    errApprovalFailed: (detail: string) =>
      `TTTI-T 승인에 실패했습니다: ${detail}`,
    balancesTitle: "내 DEX 잔액",
    balancesSignIn: "DEX 잔액을 보려면 로그인하세요.",
    balancesLoading: "잔액을 불러오는 중…",
    balancesLoadError: "잔액을 불러올 수 없습니다.",
    balancesEmpty: "DEX 잔액이 없습니다.",
    colToken: "토큰",
    colAvailable: "사용 가능",
    colReserved: "예약됨",
    depositButton: "예치",
    withdrawButton: "출금",
    depositTitle: (symbol: string) => `${symbol} 예치`,
    withdrawTitle: (symbol: string) => `${symbol} 출금`,
    amountLabel: "금액",
    amountPlaceholder: "0.00",
    amountInvalid: "올바른 금액을 입력하세요.",
    availableAmount: (amount: string) => `사용 가능: ${amount}`,
    minimumDeposit: (amount: string) => `최소 예치: ${amount}`,
    minimumWithdrawal: (amount: string) => `최소 출금: ${amount}`,
    depositFeeNote: (fee: string) =>
      `금액에 원장 수수료(${fee})를 더한 만큼 컨트랙트에 승인합니다. 승인은 15분 후 만료됩니다.`,
    withdrawFeeNote: (fee: string) =>
      `원장 수수료(${fee})는 출금 금액에서 차감됩니다.`,
    withdrawReceive: (amount: string) => `받는 금액: ${amount}`,
    confirmDeposit: "예치 확인",
    confirmWithdraw: "출금 확인",
    cancel: "취소",
    depositing: "예치 중…",
    withdrawing: "출금 중…",
    depositDone: "예치가 완료되었습니다.",
    withdrawDone: "출금이 완료되었습니다.",
    transfersTitle: "DEX 이체",
    noTransfers: "DEX 이체가 없습니다.",
    directionDeposit: "예치",
    directionWithdrawal: "출금",
    transferStatusInProgress: "진행 중",
    transferStatusCompleted: "완료",
    transferStatusFailed: "실패",
    transferStatusNeedsReview: "확인 필요",
    transferBlock: (block: string) => `블록 ${block}`,
    transferError: (detail: string) => `오류: ${detail}`,
    memo: "Memo",
    errDexAnonymous: "예치하거나 출금하려면 로그인하세요.",
    errAmountTooSmall: (minimum: string) => `최소 금액은 ${minimum}입니다.`,
    errTransferInProgress:
      "이 토큰의 이체가 이미 진행 중입니다. 나중에 다시 시도하세요.",
    errDexInsufficientAllowance: (allowance: string, required: string) =>
      `승인 금액은 ${allowance}이며, ${required}이(가) 필요합니다.`,
    errDexInsufficientFunds: (balance: string) =>
      `잔액(${balance})이 금액과 수수료를 충당하지 못합니다.`,
    errDexInsufficientBalance: (available: string) =>
      `사용 가능한 DEX 잔액은 ${available}입니다.`,
    errLedger: (detail: string) => `원장이 오류를 반환했습니다: ${detail}`,
    errDexApprovalFailed: (detail: string) => `승인에 실패했습니다: ${detail}`,
    lookupTitle: "식별자별 DEX 잔액",
    lookupLabel: "Principal",
    lookupPlaceholder: "Principal ID",
    lookupButton: "조회",
    lookupInvalid: "올바른 principal을 입력하세요.",
    lookupEmpty: "이 principal의 DEX 잔액이 없습니다.",
    depositSubaccount: "예치 하위 계정",
    copyDepositSubaccount: "예치 하위 계정 복사",
    copied: "복사됨",
    refundLabel: "보증금 환불",
    refundNone: "환불 없음",
    refundInProgress: "환불 진행 중",
    refundNeedsReview: "환불 확인 필요",
    refundRefunded: (block: string) => `환불됨 (블록 ${block})`,
    privacyPositions:
      "유동성 포지션은 공개되며 TTTI에서의 귀하의 식별자에 연결됩니다.",
    privacyDeposit: "귀하의 예치금은 체인에서 계속 확인할 수 있습니다.",
    gaugeLabel: "채우기 게이지",
    gaugeFilling: (current: string, target: string, remaining: string) =>
      `${current} / ${target} USD — 스왑 임계값까지 ${remaining} USD 남음`,
    gaugeOpen: (current: string, target: string) =>
      `${current} / ${target} USD`,
    gaugeUnavailable: "가치를 일시적으로 확인할 수 없음",
    reserves: "준비금",
    totalShares: "총 지분",
    addLiquidityButton: "유동성 추가",
    swapButton: "스왑",
    positionsButton: "포지션",
    signInForActions: "유동성을 추가하거나 스왑하려면 로그인하세요.",
    pairTokensUnsupported:
      "이 페어의 토큰에는 유동성과 스왑을 사용할 수 없습니다.",
    swapsClosedFilling: (gauge: string) =>
      `풀이 채우는 중인 동안 스왑은 닫혀 있습니다: ${gauge}`,
    addTitle: (pair: string) => `유동성 추가 · ${pair}`,
    addIntro:
      "금액은 사용 가능한 DEX 잔액에서 차감됩니다. 유동성 포지션은 공개되며 TTTI에서의 귀하의 식별자에 연결됩니다. 귀하의 예치금은 체인에서 계속 확인할 수 있습니다.",
    sideLabel: "입력한 토큰",
    tokenAmountLabel: (symbol: string) => `${symbol} 금액`,
    firstDepositNote:
      "첫 공급: 두 금액을 모두 입력하세요. 두 금액의 비율이 풀의 비율이 됩니다.",
    counterComputed: (amount: string) => `풀 비율에 따른 상대 금액: ${amount}`,
    sharesToReceive: (shares: string) => `받을 지분: ${shares}`,
    sharesLockedForever: (shares: string) =>
      `컨트랙트에 영구히 잠기는 지분: ${shares}`,
    gaugeAfter: (gauge: string) => `공급 후 게이지: ${gauge}`,
    opensPool: "이 공급으로 풀이 스왑에 열립니다.",
    staysFilling: "이 공급 후에도 풀은 채우는 중 상태입니다.",
    quoting: "견적 계산 중…",
    lockLabel: "잠금 기간",
    lockHint: (min: string, max: string) =>
      `선택 사항: 기본값은 잠금 없음입니다. 잠금 기간은 ${min}부터 ${max}까지입니다. 소유자는 잠금을 연장할 수 있으며 단축할 수 없습니다.`,
    lockPreset1d: "1일",
    lockPreset7d: "7일",
    lockPreset30d: "30일",
    lockPreset90d: "90일",
    lockPreset3m: "3개월",
    lockPreset2y: "2년",
    lockPreset3y: "3년",
    lockPreset4y: "4년",
    lockPreset1y: "1년",
    lockPreset5y: "5년",
    lockCustom: "직접 입력",
    lockCustomDays: "일수",
    lockInvalid: (min: string, max: string) =>
      `${min}부터 ${max}까지의 기간을 입력하세요.`,
    durationDays: (days: string) => `${days}일`,
    durationOneDay: "1일",
    unlockOn: (date: string) => `잠금 해제: ${date}`,
    confirmAdd: "유동성 추가",
    adding: "유동성 추가 중…",
    addDone: (id: string, shares: string) =>
      `포지션 #${id}이(가) 지분 ${shares}로 생성되었습니다.`,
    refTitle: "ICPSwap 참고 가격",
    refQuote: (input: string, output: string) =>
      `ICPSwap 견적: ${input} → ${output} (ICPSwap 수수료 포함). 참고용입니다.`,
    refDeviation: (pct: string) =>
      `공급 비율이 이 참고 가격과 ${pct} % 차이가 납니다.`,
    refDeviationWarning: (pct: string) =>
      `주의: 공급 비율이 ICPSwap 참고 가격과 ${pct} % 차이가 나며, 2 %를 넘습니다.`,
    refUnavailable:
      "이 페어의 ICPSwap 풀이 없어 참고 가격을 사용할 수 없습니다.",
    refError: "ICPSwap 참고 가격을 읽을 수 없습니다.",
    refLoading: "ICPSwap 가격을 읽는 중…",
    positionsTitle: (pair: string) => `포지션 · ${pair}`,
    positionsEmpty: "이 풀에는 포지션이 없습니다.",
    positionsLoading: "포지션을 불러오는 중…",
    positionsLoadError: "포지션을 불러올 수 없습니다.",
    colOwner: "소유자",
    colPair: "페어",
    colShares: "지분",
    colAmounts: "금액",
    colLock: "잠금",
    colUnlock: "잠금 해제",
    creatorBadge: "생성자",
    copyPrincipal: "Principal 복사",
    unlockedLabel: "잠금 해제됨",
    positionLabel: (id: string) => `포지션 #${id}`,
    myPositionsTitle: "내 포지션",
    myPositionsEmpty: "유동성 포지션이 없습니다.",
    myPositionsNote:
      "포지션을 출금하면 DEX 잔액에 적립됩니다. 토큰을 지갑으로 보내려면 내 DEX 잔액의 출금을 사용하세요.",
    withdrawPosition: "출금",
    withdrawingPosition: "출금 중…",
    positionWithdrawn: (amount0: string, amount1: string) =>
      `출금 완료: ${amount0} 및 ${amount1}이(가) DEX 잔액에 적립되었습니다.`,
    lockedUntil: (date: string) => `${date}까지 잠김.`,
    removedWithdrawOpen: "출금은 모든 풀 상태에서 잠금 해제일을 따릅니다.",
    extendLockButton: "잠금 연장",
    extendTitle: (id: string) => `잠금 연장 · 포지션 #${id}`,
    extendCurrent: (date: string) => `현재 잠금 해제: ${date}`,
    extendModeDate: "날짜",
    extendModeDays: "일수",
    extendDateLabel: "새 잠금 해제 날짜",
    extendDaysLabel: "현재 잠금 해제에 더할 일수",
    extendNewUnlock: (date: string) => `새 잠금 해제: ${date}`,
    extendTooEarly: "새 잠금 해제는 현재 잠금 해제보다 늦어야 합니다.",
    extendTooLate: (date: string) =>
      `새 잠금 해제는 ${date}보다 늦을 수 없습니다.`,
    confirmExtend: "연장 확인",
    extending: "연장 중…",
    extendDone: (date: string) => `잠금이 ${date}까지 연장되었습니다.`,
    swapTitle: (pair: string) => `스왑 · ${pair}`,
    swapIntro:
      "스왑은 사용 가능한 DEX 잔액을 사용하며, 받은 금액은 DEX 잔액에 적립됩니다.",
    swapFrom: "판매할 토큰",
    swapAmountOut: "받을 금액(추정)",
    swapFee: (pct: string) => `수수료(${pct})`,
    swapPriceImpact: "가격 영향",
    swapMinimum: "최소 수령액",
    slippageLabel: "슬리피지 허용치(%)",
    slippageInvalid: "0부터 50 %까지의 허용치를 입력하세요.",
    swapDeadlineNote: "마감 시간은 확인 후 5분으로 설정됩니다.",
    confirmSwap: "스왑 확인",
    swapping: "스왑 중…",
    swapDone: (input: string, output: string) =>
      `${input}을(를) ${output}(으)로 스왑했습니다.`,
    errLiqAnonymous: "풀을 사용하려면 로그인하세요.",
    errPoolNotFound: "이 풀은 존재하지 않습니다.",
    errPoolRemoved: "이 페어는 제거되었습니다. 예치와 스왑이 차단됩니다.",
    errMinimumsNotSet: "이 페어의 최소값이 아직 설정되지 않았습니다.",
    errUnsupportedToken: "이 토큰은 DEX에서 지원되지 않습니다.",
    errZeroAmount: "0보다 큰 금액을 입력하세요.",
    errCounterAmountRequired: "첫 공급: 두 금액을 모두 입력하세요.",
    errLiqInsufficientBalance: (available: string, required: string) =>
      `사용 가능한 DEX 잔액은 ${available}이며, ${required}이(가) 필요합니다.`,
    errBelowMinimum: (minimums: string) =>
      `공급액이 최소값보다 적습니다: ${minimums}.`,
    errRatioMismatch: (required: string) =>
      `풀 비율에 따라 상대 금액은 ${required}이어야 합니다.`,
    errLockTooShort: (min: string) =>
      `잠금 기간이 너무 짧습니다. 최소: ${min}.`,
    errLockTooLong: (max: string) => `잠금 기간이 너무 깁니다. 최대: ${max}.`,
    errZeroShares: "이 공급액은 너무 적어 지분을 받을 수 없습니다.",
    errOperationInProgress:
      "이 계정에서 다른 작업이 진행 중입니다. 잠시 후 다시 시도하세요.",
    errPositionNotFound: "이 포지션은 존재하지 않습니다.",
    errNotPositionOwner: "이 포지션은 다른 principal의 것입니다.",
    errPositionLocked: (date: string) =>
      `이 포지션은 ${date}까지 잠겨 있습니다.`,
    errCannotShortenLock: (date: string) =>
      `잠금은 단축할 수 없습니다. 현재 잠금 해제: ${date}.`,
    errUnlockTooLate: (date: string) =>
      `잠금 해제 날짜는 ${date}보다 늦을 수 없습니다.`,
    errPoolFilling: (gauge: string) => `풀이 아직 채우는 중입니다: ${gauge}`,
    errPoolNotOpen: "이 풀은 스왑에 열려 있지 않습니다.",
    errRateUnavailable:
      "USD 환율 하나를 일시적으로 사용할 수 없어 풀 가치를 확인할 수 없습니다.",
    errTokenNotInPool: "이 토큰은 이 페어에 속하지 않습니다.",
    errInvalidSlippage: (max: string) =>
      `슬리피지 허용치는 최대 ${max} %입니다.`,
    errSwapInsufficientBalance: (available: string) =>
      `사용 가능한 DEX 잔액은 ${available}입니다.`,
    errInsufficientLiquidity: "이 스왑에 필요한 풀 유동성이 부족합니다.",
    errSlippageExceeded: (out: string, min: string) =>
      `슬리피지 초과: 스왑 결과가 ${out}(으)로 최소값 ${min}보다 적습니다. 새 견적을 받으세요.`,
    errDeadlineExceeded: (date: string) =>
      `마감 시간(${date})이 지났습니다. 다시 확인하세요.`,
    errDeadlineTooFar: (date: string) =>
      `마감 시간이 너무 멉니다. 허용되는 가장 늦은 시간은 ${date}입니다.`,
    errCall: (detail: string) => `호출 실패: ${detail}`,
    bonusTitle: "잠긴 포지션의 ICP 보너스",
    bonusScope:
      "TTTI-T 페어의 잠긴 포지션이 이미 획득한 ICP 보너스는 계속 청구할 수 있습니다. 스왑 수수료는 새 보너스를 추가하지 않습니다.",
    bonusWeightRule: "포지션 가중치 = ICP 가치 × 남은 잠금 기간 ÷ 5년.",
    bonusObservedNote:
      "보너스는 관측된 금액만 표시합니다. 향후 금액은 추정하거나 약속하지 않습니다.",
    bonusSignIn: "ICP 보너스를 보려면 로그인하세요.",
    bonusLoading: "보너스를 불러오는 중…",
    bonusLoadError: "보너스를 불러올 수 없습니다.",
    bonusClaimable: (amount: string) => `청구 가능: ${amount}`,
    bonusClaimedTotal: (amount: string) => `총 청구액: ${amount}`,
    bonusNoPositions: "TTTI-T 페어에 잠긴 포지션이 없습니다.",
    bonusColPosition: "포지션",
    bonusColValueIcp: "ICP 가치",
    bonusColRemainingLock: "남은 잠금",
    bonusColWeight: "가중치",
    bonusClaimsTitle: "청구 내역",
    bonusClaimsEmpty: "아직 청구 내역이 없습니다.",
    claimButton: "ICP 보너스 청구",
    claiming: "청구 중…",
    claimDone: (amount: string) =>
      `${amount} 청구가 기록되었습니다. ICP는 지갑으로 전송됩니다.`,
    errClaimAnonymous: "보너스를 청구하려면 로그인하세요.",
    errClaimNothing: "청구할 금액이 없습니다.",
    errClaimBelowMinimum: (minimum: string) =>
      `청구 가능 금액이 최소 금액 ${minimum}보다 적습니다.`,
    errClaimInProgress: "이미 청구가 진행 중입니다. 잠시 후 다시 시도하세요.",
    protocolLiquidityTitle: "프로토콜 유동성",
    protocolLiquidityLocked: "영구적으로 잠겨 있으며 인출 경로가 없습니다.",
    protocolLiquidityHeld: (amount0: string, amount1: string) =>
      `보유: ${amount0} 및 ${amount1}`,
    protocolLiquidityFromFees: (amount0: string, amount1: string) =>
      `수수료에서: ${amount0} 및 ${amount1}`,
    protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
      `트레저리에서: ${amount0} 및 ${amount1}`,
    protocolLiquidityShare: (pct: string) => `풀 지분의 ${pct} %`,
    protocolLiquidityLastAdded: (date: string) => `마지막 추가: ${date}`,
    protocolLiquidityNone: "이 풀에는 프로토콜 유동성이 없습니다.",
    dexPausedTitle: "DEX 일시 중지됨",
    dexPausedNotice: (token: string) =>
      `준비금 점검에서 ${token}의 부족분이 확인되어 DEX가 일시 중지되었습니다. 스왑, 입금, 유동성 추가는 사용할 수 없습니다. 출금과 유동성 제거는 계속 사용할 수 있습니다.`,
    dexPausedTooltip: "DEX가 일시 중지된 동안에는 사용할 수 없습니다.",
    errDexPaused:
      "준비금 점검 후 DEX가 일시 중지되었습니다. 스왑, 입금, 유동성 추가는 사용할 수 없습니다. 출금과 유동성 제거는 계속 사용할 수 있습니다.",
    navLabel: "풀 페이지 섹션",
    navPools: "풀",
    navIndicators: "지표",
    navMyLiquidity: "내 유동성",
    navProtocol: "프로토콜",
    navRequests: "요청",
    introShort: "이 컨트랙트가 보유한 상수곱 풀입니다.",
    statusWaiting: "유동성 대기 중",
    statusOpen: "열림",
    detailsLabel: "세부 정보",
    addShort: "추가",
    howPoolsWorkTitle: "풀 작동 방식",
    permanentLiquidity: "영구 유동성",
    permanentLiquidityValue: (shares: string, pct: string) =>
      `${shares} 지분 (풀의 ${pct}%)`,
    myLiquiditySignIn:
      "로그인하면 DEX 잔액, 유동성 포지션 및 받은 수수료를 볼 수 있습니다.",
    rewardsTitle: "받은 수수료",
    activityTitle: "내 활동",
    activityFilterLabel: "활동 유형",
    filterAll: "전체",
    filterTransfers: "입금 및 출금",
    filterMintFees: "민트 수수료",
    filterLpBonus: "LP 보너스",
    tokenFilterLabel: "토큰",
    allTokens: "모든 토큰",
    activityEmpty: "이 필터에 해당하는 활동이 없습니다.",
    activityLoadError: "활동을 불러올 수 없습니다.",
    entryMintFee: "민트 수수료 수령",
    entryLpBonus: "LP 보너스 수령",
    requestsFilterLabel: "요청 필터",
    filterRejected: "거절됨",
    requestsEmptyFiltered: "이 필터에 해당하는 요청이 없습니다.",
    poolsEmpty: "아직 풀이 없습니다.",
    ...DEX_ADMIN_EN,
    depthLabel: "깊이",
    depthValue: (usd: string) => `${usd} USD`,
    depthBasisTwice: "풀 가격 기준, TTTI-T가 아닌 쪽 USD 가치의 두 배입니다.",
    depthBasisSum: "풀 가격과 시간별 환율 기준, 양쪽 USD 가치의 합계입니다.",
    depthUnavailable:
      "깊이를 일시적으로 확인할 수 없습니다: USD 환율이 없습니다.",
    depthMissingRate: (tokens: string) => `없는 환율: ${tokens}.`,
    thresholdLabel: "스왑 임계값",
    thresholdValueTtti: (usd: string) => `풀 내 TTTI-T ${usd} USD`,
    thresholdValueDepth: (usd: string) => `깊이 ${usd} USD`,
    thresholdRule: (usd: string) =>
      `깊이가 ${usd} USD 이상이고 USD 환율을 사용할 수 있는 동안 스왑이 열려 있습니다. 임계값은 스왑에만 적용되며 호출할 때마다 확인합니다.`,
    swapStateLabel: "스왑",
    swapStateOpen: "열림",
    swapStateClosed: "닫힘",
    swapClosedBelowThreshold: (measured: string, threshold: string) =>
      `스왑이 닫혀 있습니다: 풀은 현재 ${measured} USD로 스왑 임계값(${threshold})보다 낮습니다. 이 임계값에 도달하면 스왑이 열립니다. 예치, 유동성 추가, 민트에는 영향이 없습니다.`,
    swapClosedRateUnavailable:
      "스왑이 닫혀 있습니다: USD 환율을 일시적으로 사용할 수 없습니다.",
    swapClosedRemovalAnnounced: (date: string) =>
      `스왑이 중단되었습니다: 이 페어의 제거가 ${date}에 예정되어 공지되었습니다.`,
    swapClosedRemovalExecuting:
      "스왑이 닫혀 있습니다: 이 페어의 제거가 진행 중입니다.",
    swapClosedRemoved: "스왑이 닫혀 있습니다: 이 페어는 제거되었습니다.",
    errDepthBelowThreshold: (measured: string, threshold: string) =>
      `스왑이 거부되었습니다: 풀은 현재 ${measured} USD로 ${threshold} USD 스왑 임계값보다 낮습니다.`,
    errSwapRateUnavailable:
      "스왑이 거부되었습니다: USD 환율을 일시적으로 사용할 수 없습니다.",
    errRemovalInProgress: (date: string) =>
      `스왑이 거부되었습니다: 이 페어의 제거가 ${date}에 예정되어 공지되었습니다.`,
    errSwapPoolRemoved: "스왑이 거부되었습니다: 이 페어는 제거되었습니다.",
    fixedSideLabel: "고정 쪽",
    fixedSideHint: "이 금액을 직접 입력합니다. 변경되지 않습니다.",
    counterSideLabel: "상대 쪽(계산됨)",
    counterSideNote:
      "예치 시점의 풀 비율로 계산되며 슬리피지 허용치 안에서 적용됩니다.",
    counterSideRange: (min: string, max: string) =>
      `허용되는 상대 금액: ${min} ~ ${max}`,
    addSlippageLabel: "슬리피지 허용치 (%)",
    addSlippageHint:
      "견적과 실행 사이에 상대 금액이 변할 수 있는 최대 폭입니다.",
    addSlippageDefault: "기본값: 0.5 %",
    addSlippageInvalid: (max: string) =>
      `0부터 ${max} %까지의 허용치를 입력하세요.`,
    depthAfter: (depth: string) => `예치 후 깊이: ${depth} USD`,
    surplusKept: (amount: string) =>
      `사용되지 않음: ${amount}. 내부 DEX 잔액에 남습니다.`,
    addDoneSurplus: (id: string, shares: string, surplus: string) =>
      `포지션 #${id}이(가) 지분 ${shares}(으)로 생성되었습니다. 사용되지 않음: ${surplus}, 내부 DEX 잔액에 남아 있습니다.`,
    errAddInvalidSlippage: (max: string) =>
      `슬리피지 허용치는 최대 ${max} %여야 합니다.`,
    errAddSlippageExceeded: (
      tolerance: string,
      expected: string,
      actual: string,
    ) =>
      `상대 금액이 ${tolerance} % 허용치를 넘어 변했습니다: 예상 ${expected}, 현재 ${actual}. 차감된 금액은 없으며 자금은 내부 잔액에 남아 있습니다. 새 견적을 받으세요.`,
    errAddReferenceOutOfBand: (
      expected: string,
      deviation: string,
      tolerance: string,
    ) =>
      `첫 예치 비율이 기준 가격과 ${deviation} % 차이 나며 ${tolerance} % 범위를 벗어납니다. 예상: ${expected}. 차감된 금액은 없으며 자금은 내부 잔액에 남아 있습니다.`,
    errAddReferenceUnavailable:
      "기준 가격을 사용할 수 없어 첫 예치를 확인할 수 없습니다. 차감된 금액은 없으며 자금은 내부 잔액에 남아 있습니다.",
    errAddRemovalAnnounced: (date: string) =>
      `유동성 추가가 중단되었습니다: 이 페어의 제거가 ${date}에 예정되어 공지되었습니다. 인출은 포지션 잠금에 따라 계속 가능합니다.`,
    referenceTitle: "기준 가격",
    referenceIntro: (tolerance: string) =>
      `빈 풀의 첫 예치는 기준 가격의 ${tolerance} % 이내여야 합니다.`,
    referenceTttiPrice: (price: string) => `TTTI-T 기준 가격: ${price} USD`,
    referenceExpected: (expected: string) => `예상 비율: ${expected}`,
    referenceSourcesTitle: "출처",
    referenceColSource: "출처",
    referenceColPrice: "가격 (USD)",
    referenceColDepth: "깊이 (USD)",
    referenceColWeight: "가중치",
    referenceSourceNative: "네이티브 풀",
    referenceSourceIcpswap: "ICPSwap",
    referenceReadAt: (date: string) => `${date}에 읽음`,
    referenceTolerance: (pct: string) => `허용치: ${pct} %`,
    referenceUtilityBasis: "유틸리티 페어는 시간별 USD 환율을 사용합니다.",
    referenceUnavailableNoSource:
      "기준 가격을 사용할 수 없습니다: 읽을 수 있는 출처가 없습니다.",
    referenceUnavailableRate: (tokens: string) =>
      `기준 가격을 사용할 수 없습니다: ${tokens}의 USD 환율이 없습니다.`,
    referenceRatesInvalid:
      "시간별 USD 환율이 유효하지 않아 유틸리티 페어 확인을 사용할 수 없습니다.",
    referenceWithin: (deviation: string) => `범위 이내: 편차 ${deviation} %.`,
    referenceOutside: (deviation: string, tolerance: string) =>
      `범위 밖: 편차 ${deviation} %, 허용치 ${tolerance} %.`,
    referenceNotApplicable: "기준 확인 없음: 풀에 이미 유동성이 있습니다.",
    referenceRefresh: "출처 다시 읽기",
    referenceRefreshing: "출처를 읽는 중…",
    referenceRefreshed: (count: string) => `출처 ${count}개를 읽었습니다.`,
    referenceLoading: "기준 가격을 불러오는 중…",
    referenceLoadError: "기준 가격을 불러올 수 없습니다.",
    lockNone: "잠금 없음",
    lockNoneHint: "잠금 없음: 포지션을 언제든지 인출할 수 있습니다.",
    lockPickerLabel: "잠금(선택)",
    lockUpTo: (max: string) =>
      `잠금 기간은 3개월부터 ${max}까지입니다. 소유자는 잠금을 연장할 수 있으며 단축할 수 없습니다.`,
    lockEnforced:
      "잠금 해제일은 제거된 페어를 포함한 모든 풀 상태에서 적용됩니다. 누구도 잠금을 취소할 수 없으며, 풀의 새 약정에 따른 릴레이만 잠금을 단축할 수 있습니다.",
    positionLiquidated: "페어 제거 시 청산된 포지션입니다.",
    removalTitle: "페어 제거",
    removalBadge: "제거 예정 공지됨",
    removalAnnouncedTitle: "제거 예정 공지됨",
    removalReasonLabel: "사유",
    removalAnnouncedAt: (date: string) => `공지일: ${date}`,
    removalEffectiveAt: (date: string) => `시행일: ${date}`,
    removalRemaining: (remaining: string) => `남은 시간: ${remaining}`,
    removalSuspendedNotice:
      "스왑과 유동성 추가가 중단되었습니다. 인출은 포지션 잠금에 따라 계속 가능합니다.",
    removalLiquidationNotice:
      "시행일에 잠긴 포지션을 포함한 모든 포지션이 청산되고 풀은 제거됨으로 표시됩니다.",
    removalCancelledTitle: "제거 취소됨",
    removalCancelledNotice: (date: string) =>
      `공지된 제거가 ${date}에 취소되었습니다. 스왑과 추가는 다시 풀 깊이를 따릅니다.`,
    removalExecutingTitle: "제거 진행 중",
    removalExecutingNotice:
      "포지션을 청산하는 중입니다. 스왑과 추가는 닫혀 있습니다.",
    removalCompletedTitle: "페어 제거됨",
    removalCompletedNotice: (date: string) =>
      `${date}에 제거되었습니다. 모든 포지션이 청산되었습니다.`,
    removalReviewNotice:
      "결과를 확인할 수 없는 지급은 관리자의 검토 목록에 표시됩니다.",
    poolDepthShort: (usd: string) => `깊이 ${usd} USD`,
    swapsOpenBadge: "스왑 열림",
    swapsClosedBadge: "스왑 닫힘",
    dexPercentConnect: "바를 사용하려면 지갑을 연결하세요.",
    dexPercentLoading: "잔액을 불러오는 중…",
    dexPercentUnavailable: "잔액을 확인할 수 없습니다.",
    dexPercentNotCover: (fees: string) =>
      `지갑과 DEX 잔액이 ${fees}의 네트워크 수수료에 미치지 못합니다.`,
    dexPercentShare: (symbol: string) => `${symbol} 비율 (지갑 + DEX)`,
    dexPercentSummary: (percent: string, amount: string) =>
      `${percent}% = ${amount}`,
    dexPercentBase: (wallet: string, dex: string, total: string) =>
      `기준: 지갑 ${wallet} + DEX ${dex} = ${total}`,
    dexPercentComputedOn: (fees: string) =>
      `지갑 잔액과 사용 가능한 DEX 잔액의 합계를 기준으로 계산하며, 지갑에서 가져오는 부분의 원장 수수료 ${fees}을(를) 뺍니다.`,
    slippageFieldHint: "견적 금액과 실행 금액 사이의 최대 차이입니다.",
    emptyPoolTitle: "빈 풀의 첫 예치",
    emptyPoolNote:
      "이 풀에는 아직 유동성이 없습니다. 금액을 하나 입력하세요. 다른 쪽은 기준 가격으로 계산되며 추가 시 허용치에 따라 확인됩니다.",
    expectedOtherAmountLabel: (symbol: string) =>
      `기준 가격 기준 예상 ${symbol} 수량`,
    expectedOtherAmountUnavailable: "사용할 수 있는 기준 가격이 없습니다.",
    addReferenceBlockTitle: "첫 예치의 기준 가격",
    poolSwapStateLabel: "스왑 상태",
    depthBarOpen: "열림: 스왑 임계값에 도달했습니다",
    depthBarClosed: "닫힘: 스왑 임계값 미만입니다",
    depthBarAriaLabel: (pair: string) => `스왑 임계값 대비 ${pair} 풀의 깊이`,
    countdownLabel: "남은 시간",
    countdownDays: (count: string) => `${count}일`,
    countdownHours: (count: string) => `${count}시간`,
    countdownMinutes: (count: string) => `${count}분`,
    countdownSeconds: (count: string) => `${count}초`,
    countdownReached: "적용일에 도달했습니다.",
    recoverHeading: "내 DEX 잔액",
    recoverButton: "되찾기",
    recoverExplain:
      "잔액이 지갑으로 돌아갑니다. 원장 수수료는 각 금액에서 차감됩니다.",
    recovering: "되찾는 중…",
    recoverDone: (amounts: string) => `지갑으로 되찾음: ${amounts}.`,
    recoverNothing: "되찾을 DEX 잔액이 없습니다.",
    recoverError: (detail: string) => `잔액을 되찾지 못했습니다: ${detail}`,
    durationOneYear: "1년",
    durationYears: (count: string) => `${count}년`,
    durationOneMonth: "1개월",
    durationMonths: (count: string) => `${count}개월`,
    positionLockCommitted: "약정한 잠금",
    positionLockStart: "잠금 시작",
    positionTimeRemaining: "남은 시간",
    positionRelayReceived: "받은 릴레이",
    relayReceivedNone: "없음",
    positionFeesCollected: "수취한 수수료",
    pendingPotLabel: "대기 중인 풀",
    pendingPotNext: (date: string) => `다음 분배: ${date}`,
    pendingPotRunning: "분배 진행 중",
    pendingPotNote:
      "이 풀에는 마지막 분배 이후 지급된 LP 수수료 중 잠금 몫의 절반이 들어 있습니다. 하루에 한 번, 그날 잠겨 있던 포지션끼리 분배됩니다.",
    estimatedShareLabel: "오늘의 예상 몫",
    estimatedShareDetail: (fraction: string, date: string) =>
      `하루 중 잠긴 비율 ${fraction} · 다음 분배 ${date}`,
    estimatedShareNote:
      "당일 추정치입니다. 포지션의 가중치와 하루 중 잠겨 있던 시간의 비율에 비례합니다. 실제 지급액은 다음 분배 시점의 풀에 따라 달라집니다.",
    estimatedShareNone: "오늘 잠긴 시간 없음",
    positionStatus: "상태",
    positionStatusLocked: "잠김",
    positionStatusFree: "자유",
    positionStatusFreeNoLock: "자유 · 잠금 없음",
    positionFreeAfter: "릴레이 또는 만기 후 자유",
    guaranteedDepthLabel: "보장 깊이",
    guaranteedDepthHint: "잠긴 포지션과 영구 유동성의 합계입니다.",
    consolidatedTitle: "TTTI-T 통합 가격",
    consolidatedUsd: (price: string) => `${price} USD`,
    consolidatedCurrent: "가격",
    consolidatedHourly: "1시간 평균",
    consolidatedDaily: "24시간 평균",
    consolidatedSamples: (count: string) => `샘플 ${count}개`,
    consolidatedNotAvailable: "사용 불가",
    consolidatedComputedLabel: "계산 시각",
    consolidatedSource: (symbol: string, price: string, weight: string) =>
      `TTTI-T/${symbol}: ${price} USD · 가중치 ${weight}`,
    consolidatedNote:
      "풀 깊이로 가중하고 현재 시간별 환율로 USD로 환산한 값입니다.",
    consolidatedUnavailableNoRate:
      "통합 가격을 사용할 수 없습니다: 유효한 시간별 환율이 없습니다.",
    consolidatedUnavailableNoPool:
      "통합 가격을 사용할 수 없습니다: 스왑이 열려 있는 TTTI-T 풀이 없습니다.",
    consolidatedLoadError: "통합 가격을 불러올 수 없습니다.",
    spreadLabel: "통합 가격 대비 스프레드",
    spreadAboveThreshold: (threshold: string) => `스프레드 ${threshold} % 초과`,
    spreadReasonEmpty: "이 풀에 유동성이 없습니다.",
    spreadReasonNotOpen: "스왑이 열려 있지 않습니다.",
    spreadReasonNoRate: "이 쌍에 유효한 시간별 환율이 없습니다.",
    spreadReasonNoConsolidated: "통합 가격이 없습니다.",
    spreadReasonLoadError: "스프레드를 불러올 수 없습니다.",
    poolPriceLabel: "풀 가격",
    spreadAlertTitle: "임계값 초과 스프레드",
    spreadAlert: (pool: string, spread: string, threshold: string) =>
      `풀 ${pool}: TTTI-T 통합 가격 대비 스프레드가 ${spread}로 ${threshold} % 임계값을 초과합니다. 이 풀에 포지션을 보유하고 있습니다.`,
    spreadAlertPrices: (poolPrice: string, consolidated: string) =>
      `풀 가격 ${poolPrice} USD · 통합 가격 ${consolidated} USD`,
    referenceConsolidatedPrice: (price: string) =>
      `TTTI-T 통합 가격: ${price} USD`,
    guaranteedDepthReserves: (amount0: string, amount1: string) =>
      `보장 준비금: ${amount0} 및 ${amount1}`,
    relayTitle: "약정 릴레이",
    relayExplain:
      "릴레이 잠금은 선택 사항이며 3개월에서 5년 동안 지속됩니다. 새 약정마다 가중치의 3분의 1이 풀의 다른 잠금 포지션의 부담을 덜어 줍니다. 소유자는 기간을 연장할 수 있습니다. 부담이 덜어졌거나 만료된 포지션은 퇴출 없이 잠금이 해제되며 자유 유동성으로 풀에 남습니다.",
    relayResult: (shortened: string, freed: string) =>
      `릴레이: 포지션 ${shortened}개 단축, ${freed}개 해제.`,
    relayResultNone: "릴레이: 단축된 다른 포지션이 없습니다.",
    feeSplitTitle: "잠긴 포지션과의 수수료 분배",
    feeSplitExplain:
      "유동성 공급자 수수료의 절반은 지분에 비례하여 준비금에 남습니다. 나머지 절반은 따로 적립되어 자본 × (남은 시간 ÷ 5년)의 제곱근에 따라 잠긴 포지션끼리 나눕니다. 실제로 지불된 수수료만 분배됩니다.",
    errExtendRemovalAnnounced: (date: string) =>
      `잠금을 연장할 수 없습니다: 이 페어의 제거가 ${date}에 예정되어 공지되었습니다.`,
    ...PTM4_KO,
  },
  "pa-Guru": {
    title: "ਪੂਲ",
    intro:
      "ਇਸ ਕੰਟਰੈਕਟ ਵੱਲੋਂ ਰੱਖੇ ਗਏ ਸਥਿਰ-ਗੁਣਨਫਲ ਪੂਲ। ਹਰ ਜੋੜੇ ਦਾ ਇੱਕ ਫੀਸ ਪੱਧਰ ਅਤੇ ਆਪਣਾ ਪੂਲ ਸਬ-ਖਾਤਾ ਹੈ।",
    statusFilling: "ਭਰਿਆ ਜਾ ਰਿਹਾ ਹੈ",
    statusActive: "ਸਰਗਰਮ",
    statusRemoved: "ਹਟਾਇਆ ਗਿਆ",
    newPairBadge: "ਨਵਾਂ ਜੋੜਾ",
    approvalNotRecommendation: "ਕਿਸੇ ਜੋੜੇ ਦੀ ਮਨਜ਼ੂਰੀ ਕੋਈ ਸਿਫ਼ਾਰਸ਼ ਨਹੀਂ ਹੈ।",
    tttiPair: "TTTI-T ਜੋੜਾ",
    utilityPair: "ਉਪਯੋਗੀ ਜੋੜਾ",
    feeTier: "ਫੀਸ ਪੱਧਰ",
    feeTierBps5: "0.05%",
    feeTierBps30: "0.3%",
    feeTierBps100: "1%",
    poolSubaccount: "ਪੂਲ ਸਬ-ਖਾਤਾ",
    minimumLocked: "ਘੱਟੋ-ਘੱਟ ਲਾਕ ਕੀਤੀ ਤਰਲਤਾ",
    minimumTttiSide: (amount: string) => `TTTI-T ਪਾਸੇ ${amount} TTTI-T`,
    minimumPerToken: "ਹਰ ਟੋਕਨ ਲਈ ਘੱਟੋ-ਘੱਟ, ਐਡਮਿਨ ਵੱਲੋਂ ਤੈਅ",
    minimumNotSet: "ਅਜੇ ਤੈਅ ਨਹੀਂ",
    firstDepositRule: "ਖਾਲੀ ਪੂਲ ਵਿੱਚ ਪਹਿਲੀ ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਕੋਈ ਘੱਟੋ-ਘੱਟ ਹੱਦ ਨਹੀਂ ਹੈ।",
    launchDepthRule: (amount: string) =>
      `ਸਵੈਪ ਉਦੋਂ ਖੁੱਲ੍ਹਦੇ ਹਨ ਜਦੋਂ TTTI-T ਜੋੜੇ ਦੇ ਪੂਲ ਵਿੱਚ ${amount} USD ਦਾ TTTI-T ਹੋਵੇ (ਪੂਲ ਦੀ ਕੀਮਤ ਉੱਤੇ ਇਸ ਦਾ TTTI-T ਪਾਸਾ, ਜੋ ਓਰੇਕਲ ਦਰ ਉੱਤੇ ਇਸ ਦੇ ਦੂਜੇ ਪਾਸੇ ਦੇ ਬਰਾਬਰ ਹੈ), ਜਾਂ ਜਦੋਂ ਉਪਯੋਗੀ ਜੋੜਾ ${amount} USD ਦੀ ਡੂੰਘਾਈ ਤੱਕ ਪਹੁੰਚੇ (ਦੋਵੇਂ ਪਾਸੇ ਘੰਟਾਵਾਰ ਦਰਾਂ ਨਾਲ ਜੋੜ ਕੇ)। ਇਸ ਹੱਦ ਤੋਂ ਹੇਠਾਂ ਪੂਲ ਭਰਿਆ ਜਾ ਰਿਹਾ ਰਹਿੰਦਾ ਹੈ: ਪੂਲ ਬਣਾਉਣਾ, ਜਮ੍ਹਾਂ, ਲਿਕਵਿਡਿਟੀ ਜੋੜਨਾ, ਖਰੀਦ ਅਤੇ ਮਿੰਟ ਖੁੱਲ੍ਹੇ ਰਹਿੰਦੇ ਹਨ; ਸਿਰਫ਼ ਸਵੈਪ ਬੰਦ ਹੁੰਦੇ ਹਨ।`,
    lockedSharesRule:
      "ਘੱਟੋ-ਘੱਟ ਲਾਕ ਕੀਤੇ ਹਿੱਸੇ, ਜੋ ਪਹਿਲੀ ਜਮ੍ਹਾਂ ਰਕਮ ਸਮੇਂ √(A×B) ਵਜੋਂ ਗਿਣੇ ਜਾਂਦੇ ਹਨ, ਹਮੇਸ਼ਾ ਲਈ ਕੰਟਰੈਕਟ ਦੇ ਹਨ।",
    removedNotice:
      "ਇਹ ਜੋੜਾ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਸਾਰੀਆਂ ਪੁਜ਼ੀਸ਼ਨਾਂ ਦਾ ਨਿਪਟਾਰਾ ਹੋ ਚੁੱਕਾ ਹੈ। ਸਵੈਪ ਅਤੇ ਜੋੜਨਾ ਬੰਦ ਹਨ।",
    protocolStatement:
      "ਪ੍ਰੋਟੋਕੋਲ ਕਦੇ ਵੀ ਕੀਮਤ ਨਾਲ ਜੁੜਿਆ ਕੋਈ ਆਰਡਰ ਨਹੀਂ ਦਿੰਦਾ ਅਤੇ ਪੂਲਾਂ ਲਈ ਕੋਈ TTTI-T ਨਹੀਂ ਬਣਾਉਂਦਾ। ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਡੂੰਘਾਈ ਦਾ ਪ੍ਰਬੰਧ ਹੈ: ਪ੍ਰੋਟੋਕੋਲ ਹਿੱਸੇ ਦਾ ਮਸ਼ੀਨੀ ਅਤੇ ਜਨਤਕ ਮੁੜ-ਸੰਤੁਲਨ, ਜੋ ਕਦੇ ਕੀਮਤ ਉੱਤੇ ਨਿਰਭਰ ਨਹੀਂ ਹੁੰਦਾ। ਸਵੈਪ ਫੀਸ ਦਾ ਪ੍ਰੋਟੋਕੋਲ ਹਿੱਸਾ ਦੋ ਤਿਹਾਈ ਸਿਰਜਣਹਾਰ ਨੂੰ ਅਤੇ ਇੱਕ ਤਿਹਾਈ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਨੂੰ ਜਾਂਦਾ ਹੈ, ਜਿਸਨੂੰ ਕੋਈ ਵੀ ਕਢਵਾ ਨਹੀਂ ਸਕਦਾ।",
    loading: "ਪੂਲ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…",
    loadError: "ਪੂਲ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    requestTitle: "ਜੋੜੇ ਦੀ ਬੇਨਤੀ ਕਰੋ",
    ledgerId: "ਲੈਜਰ ID",
    ledgerIdPlaceholder: "ਲੈਜਰ ਕੈਨਿਸਟਰ ID",
    ledgerIdInvalid: "ਇੱਕ ਵੈਧ ਲੈਜਰ ਕੈਨਿਸਟਰ ID ਦਰਜ ਕਰੋ।",
    counterToken: "ਸਾਹਮਣੇ ਵਾਲਾ ਟੋਕਨ",
    counterTokenPlaceholder: "ਟੋਕਨ ਚੁਣੋ",
    message: "ਸੁਨੇਹਾ",
    messageMax: (max: string) => `ਵੱਧ ਤੋਂ ਵੱਧ ${max} ਅੱਖਰ।`,
    deposit: (amount: string) => `ਜਮ੍ਹਾਂ ਰਕਮ: ${amount} TTTI-T`,
    depositApproval: (amount: string) =>
      `ਬੇਨਤੀ ਤੋਂ ਪਹਿਲਾਂ, ਤੁਸੀਂ ਕੰਟਰੈਕਟ ਨੂੰ ${amount} TTTI-T (ਜਮ੍ਹਾਂ ਰਕਮ ਅਤੇ ਲੈਜਰ ਫੀਸ) ਦੀ ਮਨਜ਼ੂਰੀ ਦਿੰਦੇ ਹੋ। ਮਨਜ਼ੂਰੀ 15 ਮਿੰਟਾਂ ਬਾਅਦ ਖਤਮ ਹੋ ਜਾਂਦੀ ਹੈ।`,
    depositRule: "ਮਨਜ਼ੂਰੀ 'ਤੇ ਜਮ੍ਹਾਂ ਰਕਮ ਵਾਪਸ ਕੀਤੀ ਜਾਂਦੀ ਹੈ ਅਤੇ ਇਨਕਾਰ 'ਤੇ ਰੱਖ ਲਈ ਜਾਂਦੀ ਹੈ।",
    approving: "ਮਨਜ਼ੂਰੀ ਦਿੱਤੀ ਜਾ ਰਹੀ ਹੈ…",
    submit: "ਬੇਨਤੀ ਭੇਜੋ",
    submitting: "ਭੇਜੀ ਜਾ ਰਹੀ ਹੈ…",
    submitted: "ਬੇਨਤੀ ਭੇਜ ਦਿੱਤੀ ਗਈ।",
    signInNeeded: "ਜੋੜੇ ਦੀ ਬੇਨਤੀ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    requestsTitle: "ਬੇਨਤੀਆਂ",
    myRequestsTitle: "ਮੇਰੀਆਂ ਬੇਨਤੀਆਂ",
    noRequests: "ਜੋੜੇ ਦੀ ਕੋਈ ਬੇਨਤੀ ਨਹੀਂ।",
    requestStatusPending: "ਬਕਾਇਆ",
    requestStatusApproved: "ਮਨਜ਼ੂਰ",
    requestStatusRefused: "ਇਨਕਾਰ",
    refusedReason: (reason: string) => `ਕਾਰਨ: ${reason}`,
    copiedSymbol: "ਨਕਲ ਕੀਤਾ ਚਿੰਨ੍ਹ",
    copiedSymbolOf: (symbol: string) =>
      `ਇਹ ਚਿੰਨ੍ਹ ਪਹਿਲਾਂ ਹੀ ${symbol} ਵੱਲੋਂ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ`,
    errAnonymous: "ਜੋੜੇ ਦੀ ਬੇਨਤੀ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    errMessageTooLong: (max: string) => `ਸੁਨੇਹਾ ${max} ਅੱਖਰਾਂ ਤੋਂ ਲੰਮਾ ਹੈ।`,
    errInvalidToken: (detail: string) => `ਇਹ ਲੈਜਰ ਵਰਤਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ: ${detail}`,
    errUnknownCounterToken: "ਸਾਹਮਣੇ ਵਾਲਾ ਟੋਕਨ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    errLedgerUnreachable: (detail: string) => `ਲੈਜਰ ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਹੋ ਸਕੀ: ${detail}`,
    errMissingStandards: (standards: string) =>
      `ਲੈਜਰ ${standards} ਦਾ ਸਮਰਥਨ ਨਹੀਂ ਕਰਦਾ।`,
    errMetadataUnavailable: (detail: string) =>
      `ਲੈਜਰ ਮੈਟਾਡੇਟਾ ਪੜ੍ਹਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ: ${detail}`,
    errPairExists: "ਇਹ ਜੋੜਾ ਪਹਿਲਾਂ ਹੀ ਮੌਜੂਦ ਹੈ ਜਾਂ ਇਸ ਦੀ ਬੇਨਤੀ ਹੋ ਚੁੱਕੀ ਹੈ।",
    errTooManyPending: (max: string) =>
      `ਤੁਹਾਡੀਆਂ ਪਹਿਲਾਂ ਹੀ ${max} ਬਕਾਇਆ ਬੇਨਤੀਆਂ ਹਨ।`,
    errCooldown: (date: string) => `ਇਨਕਾਰ ਤੋਂ ਬਾਅਦ, ਨਵੀਂ ਬੇਨਤੀ ${date} ਤੋਂ ਸੰਭਵ ਹੈ।`,
    errInsufficientAllowance: (allowance: string, required: string) =>
      `ਮਨਜ਼ੂਰੀ ${allowance} TTTI-T ਦੀ ਹੈ; ${required} TTTI-T ਲੋੜੀਂਦੇ ਹਨ।`,
    errInsufficientFunds: (balance: string) =>
      `ਤੁਹਾਡਾ TTTI-T ਬਕਾਇਆ (${balance} TTTI-T) ਜਮ੍ਹਾਂ ਰਕਮ ਅਤੇ ਫੀਸ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ।`,
    errDepositFailed: (detail: string) => `ਜਮ੍ਹਾਂ ਰਕਮ ਲਈ ਨਹੀਂ ਜਾ ਸਕੀ: ${detail}`,
    errApprovalFailed: (detail: string) => `TTTI-T ਮਨਜ਼ੂਰੀ ਅਸਫਲ ਰਹੀ: ${detail}`,
    balancesTitle: "ਮੇਰੇ DEX ਬਕਾਏ",
    balancesSignIn: "ਆਪਣੇ DEX ਬਕਾਏ ਦੇਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    balancesLoading: "ਬਕਾਏ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…",
    balancesLoadError: "ਬਕਾਏ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    balancesEmpty: "ਕੋਈ DEX ਬਕਾਇਆ ਨਹੀਂ।",
    colToken: "ਟੋਕਨ",
    colAvailable: "ਉਪਲਬਧ",
    colReserved: "ਰਾਖਵਾਂ",
    depositButton: "ਜਮ੍ਹਾਂ ਕਰੋ",
    withdrawButton: "ਕਢਵਾਓ",
    depositTitle: (symbol: string) => `${symbol} ਜਮ੍ਹਾਂ ਕਰੋ`,
    withdrawTitle: (symbol: string) => `${symbol} ਕਢਵਾਓ`,
    amountLabel: "ਰਕਮ",
    amountPlaceholder: "0.00",
    amountInvalid: "ਇੱਕ ਸਹੀ ਰਕਮ ਦਰਜ ਕਰੋ।",
    availableAmount: (amount: string) => `ਉਪਲਬਧ: ${amount}`,
    minimumDeposit: (amount: string) => `ਘੱਟੋ-ਘੱਟ ਜਮ੍ਹਾਂ: ${amount}`,
    minimumWithdrawal: (amount: string) => `ਘੱਟੋ-ਘੱਟ ਕਢਵਾਈ: ${amount}`,
    depositFeeNote: (fee: string) =>
      `ਤੁਸੀਂ ਕੰਟਰੈਕਟ ਨੂੰ ਰਕਮ ਅਤੇ ਲੈਜਰ ਫੀਸ (${fee}) ਦੀ ਮਨਜ਼ੂਰੀ ਦਿੰਦੇ ਹੋ। ਮਨਜ਼ੂਰੀ 15 ਮਿੰਟਾਂ ਬਾਅਦ ਖਤਮ ਹੋ ਜਾਂਦੀ ਹੈ।`,
    withdrawFeeNote: (fee: string) =>
      `ਲੈਜਰ ਫੀਸ (${fee}) ਕਢਵਾਈ ਰਕਮ ਵਿੱਚੋਂ ਕੱਟੀ ਜਾਂਦੀ ਹੈ।`,
    withdrawReceive: (amount: string) => `ਤੁਹਾਨੂੰ ਮਿਲੇਗਾ: ${amount}`,
    confirmDeposit: "ਜਮ੍ਹਾਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    confirmWithdraw: "ਕਢਵਾਈ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    depositing: "ਜਮ੍ਹਾਂ ਹੋ ਰਿਹਾ ਹੈ…",
    withdrawing: "ਕਢਵਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
    depositDone: "ਜਮ੍ਹਾਂ ਪੂਰਾ ਹੋਇਆ।",
    withdrawDone: "ਕਢਵਾਈ ਪੂਰੀ ਹੋਈ।",
    transfersTitle: "DEX ਟ੍ਰਾਂਸਫਰ",
    noTransfers: "ਕੋਈ DEX ਟ੍ਰਾਂਸਫਰ ਨਹੀਂ।",
    directionDeposit: "ਜਮ੍ਹਾਂ",
    directionWithdrawal: "ਕਢਵਾਈ",
    transferStatusInProgress: "ਜਾਰੀ ਹੈ",
    transferStatusCompleted: "ਪੂਰਾ ਹੋਇਆ",
    transferStatusFailed: "ਅਸਫਲ",
    transferStatusNeedsReview: "ਜਾਂਚ ਲਈ",
    transferBlock: (block: string) => `ਬਲਾਕ ${block}`,
    transferError: (detail: string) => `ਗਲਤੀ: ${detail}`,
    memo: "Memo",
    errDexAnonymous: "ਜਮ੍ਹਾਂ ਕਰਨ ਜਾਂ ਕਢਵਾਉਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    errAmountTooSmall: (minimum: string) => `ਘੱਟੋ-ਘੱਟ ${minimum} ਹੈ।`,
    errTransferInProgress:
      "ਇਸ ਟੋਕਨ ਦਾ ਇੱਕ ਟ੍ਰਾਂਸਫਰ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ। ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    errDexInsufficientAllowance: (allowance: string, required: string) =>
      `ਮਨਜ਼ੂਰੀ ${allowance} ਨੂੰ ਕਵਰ ਕਰਦੀ ਹੈ; ${required} ਲੋੜੀਂਦਾ ਹੈ।`,
    errDexInsufficientFunds: (balance: string) =>
      `ਤੁਹਾਡਾ ਬਕਾਇਆ (${balance}) ਰਕਮ ਅਤੇ ਫੀਸ ਨੂੰ ਕਵਰ ਨਹੀਂ ਕਰਦਾ।`,
    errDexInsufficientBalance: (available: string) =>
      `ਤੁਹਾਡਾ ਉਪਲਬਧ DEX ਬਕਾਇਆ ${available} ਹੈ।`,
    errLedger: (detail: string) => `ਲੈਜਰ ਨੇ ਇੱਕ ਗਲਤੀ ਵਾਪਸ ਕੀਤੀ: ${detail}`,
    errDexApprovalFailed: (detail: string) => `ਮਨਜ਼ੂਰੀ ਅਸਫਲ ਰਹੀ: ${detail}`,
    lookupTitle: "ਪਛਾਣਕਰਤਾ ਅਨੁਸਾਰ DEX ਬਕਾਏ",
    lookupLabel: "Principal",
    lookupPlaceholder: "Principal ID",
    lookupButton: "ਦੇਖੋ",
    lookupInvalid: "ਇੱਕ ਸਹੀ principal ਦਰਜ ਕਰੋ।",
    lookupEmpty: "ਇਸ principal ਲਈ ਕੋਈ DEX ਬਕਾਇਆ ਨਹੀਂ।",
    depositSubaccount: "ਜਮ੍ਹਾਂ ਸਬ-ਖਾਤਾ",
    copyDepositSubaccount: "ਜਮ੍ਹਾਂ ਸਬ-ਖਾਤਾ ਕਾਪੀ ਕਰੋ",
    copied: "ਕਾਪੀ ਕੀਤਾ",
    refundLabel: "ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਵਾਪਸੀ",
    refundNone: "ਕੋਈ ਵਾਪਸੀ ਨਹੀਂ",
    refundInProgress: "ਵਾਪਸੀ ਜਾਰੀ ਹੈ",
    refundNeedsReview: "ਵਾਪਸੀ ਜਾਂਚ ਲਈ",
    refundRefunded: (block: string) => `ਵਾਪਸ ਕੀਤਾ (ਬਲਾਕ ${block})`,
    privacyPositions:
      "ਤਰਲਤਾ ਪੁਜ਼ੀਸ਼ਨਾਂ ਜਨਤਕ ਹਨ ਅਤੇ TTTI 'ਤੇ ਤੁਹਾਡੇ ਪਛਾਣਕਰਤਾ ਨਾਲ ਜੁੜੀਆਂ ਹਨ।",
    privacyDeposit: "ਤੁਹਾਡੀ ਜਮ੍ਹਾਂ ਰਕਮ ਚੇਨ 'ਤੇ ਦਿਖਾਈ ਦਿੰਦੀ ਰਹਿੰਦੀ ਹੈ।",
    gaugeLabel: "ਭਰਨ ਦਾ ਗੇਜ",
    gaugeFilling: (current: string, target: string, remaining: string) =>
      `${current} / ${target} USD — ਸਵੈਪ ਦੀ ਹੱਦ ਤੱਕ ਪਹੁੰਚਣ ਲਈ ${remaining} USD ਬਾਕੀ`,
    gaugeOpen: (current: string, target: string) =>
      `${current} / ${target} USD`,
    gaugeUnavailable: "ਮੁੱਲ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ",
    reserves: "ਰਿਜ਼ਰਵ",
    totalShares: "ਕੁੱਲ ਸ਼ੇਅਰ",
    addLiquidityButton: "ਤਰਲਤਾ ਜੋੜੋ",
    swapButton: "ਸਵੈਪ",
    positionsButton: "ਪੋਜ਼ੀਸ਼ਨਾਂ",
    signInForActions: "ਤਰਲਤਾ ਜੋੜਨ ਜਾਂ ਸਵੈਪ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    pairTokensUnsupported: "ਇਸ ਜੋੜੀ ਦੇ ਟੋਕਨਾਂ ਲਈ ਤਰਲਤਾ ਅਤੇ ਸਵੈਪ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।",
    swapsClosedFilling: (gauge: string) => `ਪੂਲ ਭਰੇ ਜਾਣ ਦੌਰਾਨ ਸਵੈਪ ਬੰਦ ਹਨ: ${gauge}`,
    addTitle: (pair: string) => `ਤਰਲਤਾ ਜੋੜੋ · ${pair}`,
    addIntro:
      "ਰਕਮਾਂ ਤੁਹਾਡੇ ਉਪਲਬਧ DEX ਬਕਾਇਆਂ ਵਿੱਚੋਂ ਲਈਆਂ ਜਾਂਦੀਆਂ ਹਨ। ਤਰਲਤਾ ਪੁਜ਼ੀਸ਼ਨਾਂ ਜਨਤਕ ਹਨ ਅਤੇ TTTI 'ਤੇ ਤੁਹਾਡੇ ਪਛਾਣਕਰਤਾ ਨਾਲ ਜੁੜੀਆਂ ਹਨ। ਤੁਹਾਡੀ ਜਮ੍ਹਾਂ ਰਕਮ ਚੇਨ 'ਤੇ ਦਿਖਾਈ ਦਿੰਦੀ ਰਹਿੰਦੀ ਹੈ।",
    sideLabel: "ਦਰਜ ਕੀਤਾ ਟੋਕਨ",
    tokenAmountLabel: (symbol: string) => `${symbol} ਰਕਮ`,
    firstDepositNote:
      "ਪਹਿਲੀ ਜਮ੍ਹਾਂ: ਦੋਵੇਂ ਰਕਮਾਂ ਦਰਜ ਕਰੋ। ਇਹਨਾਂ ਦਾ ਅਨੁਪਾਤ ਪੂਲ ਦਾ ਅਨੁਪਾਤ ਤੈਅ ਕਰਦਾ ਹੈ।",
    counterComputed: (amount: string) => `ਪੂਲ ਅਨੁਪਾਤ 'ਤੇ ਦੂਜੇ ਪਾਸੇ ਦੀ ਰਕਮ: ${amount}`,
    sharesToReceive: (shares: string) => `ਮਿਲਣ ਵਾਲੇ ਸ਼ੇਅਰ: ${shares}`,
    sharesLockedForever: (shares: string) =>
      `ਕੰਟਰੈਕਟ ਕੋਲ ਹਮੇਸ਼ਾ ਲਈ ਲੌਕ ਸ਼ੇਅਰ: ${shares}`,
    gaugeAfter: (gauge: string) => `ਜਮ੍ਹਾਂ ਤੋਂ ਬਾਅਦ ਗੇਜ: ${gauge}`,
    opensPool: "ਇਹ ਜਮ੍ਹਾਂ ਪੂਲ ਨੂੰ ਸਵੈਪ ਲਈ ਖੋਲ੍ਹਦੀ ਹੈ।",
    staysFilling: "ਇਸ ਜਮ੍ਹਾਂ ਤੋਂ ਬਾਅਦ ਵੀ ਪੂਲ ਭਰਿਆ ਜਾ ਰਿਹਾ ਰਹਿੰਦਾ ਹੈ।",
    quoting: "ਕੋਟ ਦੀ ਗਣਨਾ ਹੋ ਰਹੀ ਹੈ…",
    lockLabel: "ਲੌਕ ਦੀ ਮਿਆਦ",
    lockHint: (min: string, max: string) =>
      `ਵਿਕਲਪਿਕ: ਮੂਲ ਰੂਪ ਵਿੱਚ ਕੋਈ ਲੌਕ ਨਹੀਂ। ਲੌਕ ${min} ਤੋਂ ${max} ਤੱਕ ਹੁੰਦਾ ਹੈ। ਮਾਲਕ ਇਸਨੂੰ ਵਧਾ ਸਕਦਾ ਹੈ, ਘਟਾ ਨਹੀਂ ਸਕਦਾ।`,
    lockPreset1d: "1 ਦਿਨ",
    lockPreset7d: "7 ਦਿਨ",
    lockPreset30d: "30 ਦਿਨ",
    lockPreset90d: "90 ਦਿਨ",
    lockPreset3m: "3 ਮਹੀਨੇ",
    lockPreset2y: "2 ਸਾਲ",
    lockPreset3y: "3 ਸਾਲ",
    lockPreset4y: "4 ਸਾਲ",
    lockPreset1y: "1 ਸਾਲ",
    lockPreset5y: "5 ਸਾਲ",
    lockCustom: "ਆਪਣੀ ਮਰਜ਼ੀ",
    lockCustomDays: "ਦਿਨਾਂ ਦੀ ਗਿਣਤੀ",
    lockInvalid: (min: string, max: string) =>
      `${min} ਤੋਂ ${max} ਤੱਕ ਦੀ ਮਿਆਦ ਦਰਜ ਕਰੋ।`,
    durationDays: (days: string) => `${days} ਦਿਨ`,
    durationOneDay: "1 ਦਿਨ",
    unlockOn: (date: string) => `ਅਨਲੌਕ: ${date}`,
    confirmAdd: "ਤਰਲਤਾ ਜੋੜੋ",
    adding: "ਤਰਲਤਾ ਜੋੜੀ ਜਾ ਰਹੀ ਹੈ…",
    addDone: (id: string, shares: string) =>
      `ਪੋਜ਼ੀਸ਼ਨ #${id} ${shares} ਸ਼ੇਅਰਾਂ ਨਾਲ ਬਣਾਈ ਗਈ।`,
    refTitle: "ICPSwap ਹਵਾਲਾ ਕੀਮਤ",
    refQuote: (input: string, output: string) =>
      `ICPSwap ਕੋਟ: ${input} → ${output} (ICPSwap ਫੀਸ ਸਮੇਤ)। ਸਿਰਫ਼ ਹਵਾਲੇ ਲਈ।`,
    refDeviation: (pct: string) =>
      `ਤੁਹਾਡੀ ਜਮ੍ਹਾਂ ਦਾ ਅਨੁਪਾਤ ਇਸ ਹਵਾਲੇ ਤੋਂ ${pct} % ਵੱਖਰਾ ਹੈ।`,
    refDeviationWarning: (pct: string) =>
      `ਧਿਆਨ ਦਿਓ: ਤੁਹਾਡੀ ਜਮ੍ਹਾਂ ਦਾ ਅਨੁਪਾਤ ICPSwap ਹਵਾਲੇ ਤੋਂ ${pct} % ਵੱਖਰਾ ਹੈ, ਜੋ 2 % ਤੋਂ ਵੱਧ ਹੈ।`,
    refUnavailable: "ਇਸ ਜੋੜੀ ਲਈ ਕੋਈ ICPSwap ਪੂਲ ਨਹੀਂ ਹੈ; ਹਵਾਲਾ ਕੀਮਤ ਉਪਲਬਧ ਨਹੀਂ।",
    refError: "ICPSwap ਹਵਾਲਾ ਕੀਮਤ ਪੜ੍ਹੀ ਨਹੀਂ ਜਾ ਸਕੀ।",
    refLoading: "ICPSwap ਕੀਮਤ ਪੜ੍ਹੀ ਜਾ ਰਹੀ ਹੈ…",
    positionsTitle: (pair: string) => `ਪੋਜ਼ੀਸ਼ਨਾਂ · ${pair}`,
    positionsEmpty: "ਇਸ ਪੂਲ ਵਿੱਚ ਕੋਈ ਪੋਜ਼ੀਸ਼ਨ ਨਹੀਂ।",
    positionsLoading: "ਪੋਜ਼ੀਸ਼ਨਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ…",
    positionsLoadError: "ਪੋਜ਼ੀਸ਼ਨਾਂ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀਆਂ।",
    colOwner: "ਮਾਲਕ",
    colPair: "ਜੋੜੀ",
    colShares: "ਸ਼ੇਅਰ",
    colAmounts: "ਰਕਮਾਂ",
    colLock: "ਲੌਕ",
    colUnlock: "ਅਨਲੌਕ",
    creatorBadge: "ਸਿਰਜਣਹਾਰ",
    copyPrincipal: "Principal ਕਾਪੀ ਕਰੋ",
    unlockedLabel: "ਅਨਲੌਕ",
    positionLabel: (id: string) => `ਪੋਜ਼ੀਸ਼ਨ #${id}`,
    myPositionsTitle: "ਮੇਰੀਆਂ ਪੋਜ਼ੀਸ਼ਨਾਂ",
    myPositionsEmpty: "ਤੁਹਾਡੀ ਕੋਈ ਤਰਲਤਾ ਪੋਜ਼ੀਸ਼ਨ ਨਹੀਂ ਹੈ।",
    myPositionsNote:
      "ਪੋਜ਼ੀਸ਼ਨ ਕਢਵਾਉਣ ਨਾਲ ਰਕਮ ਤੁਹਾਡੇ DEX ਬਕਾਇਆਂ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ। ਟੋਕਨ ਆਪਣੇ ਵਾਲਿਟ ਵਿੱਚ ਭੇਜਣ ਲਈ ਮੇਰੇ DEX ਬਕਾਏ ਵਿੱਚ ਕਢਵਾਓ ਵਰਤੋ।",
    withdrawPosition: "ਕਢਵਾਓ",
    withdrawingPosition: "ਕਢਵਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
    positionWithdrawn: (amount0: string, amount1: string) =>
      `ਕਢਵਾਇਆ ਗਿਆ: ${amount0} ਅਤੇ ${amount1} ਤੁਹਾਡੇ DEX ਬਕਾਇਆਂ ਵਿੱਚ ਜਮ੍ਹਾਂ।`,
    lockedUntil: (date: string) => `${date} ਤੱਕ ਲੌਕ।`,
    removedWithdrawOpen: "ਕਢਵਾਉਣਾ ਪੂਲ ਦੀ ਹਰ ਸਥਿਤੀ ਵਿੱਚ ਅਨਲੌਕ ਮਿਤੀ ਦੇ ਅਨੁਸਾਰ ਹੁੰਦਾ ਹੈ।",
    extendLockButton: "ਲੌਕ ਵਧਾਓ",
    extendTitle: (id: string) => `ਲੌਕ ਵਧਾਓ · ਪੋਜ਼ੀਸ਼ਨ #${id}`,
    extendCurrent: (date: string) => `ਮੌਜੂਦਾ ਅਨਲੌਕ: ${date}`,
    extendModeDate: "ਤਾਰੀਖ",
    extendModeDays: "ਦਿਨ",
    extendDateLabel: "ਨਵੀਂ ਅਨਲੌਕ ਤਾਰੀਖ",
    extendDaysLabel: "ਮੌਜੂਦਾ ਅਨਲੌਕ ਵਿੱਚ ਜੋੜੇ ਦਿਨ",
    extendNewUnlock: (date: string) => `ਨਵਾਂ ਅਨਲੌਕ: ${date}`,
    extendTooEarly: "ਨਵਾਂ ਅਨਲੌਕ ਮੌਜੂਦਾ ਅਨਲੌਕ ਤੋਂ ਬਾਅਦ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।",
    extendTooLate: (date: string) => `ਨਵਾਂ ਅਨਲੌਕ ${date} ਤੋਂ ਬਾਅਦ ਨਹੀਂ ਹੋ ਸਕਦਾ।`,
    confirmExtend: "ਵਾਧੇ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    extending: "ਵਧਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
    extendDone: (date: string) => `ਲੌਕ ${date} ਤੱਕ ਵਧਾਇਆ ਗਿਆ।`,
    swapTitle: (pair: string) => `ਸਵੈਪ · ${pair}`,
    swapIntro: "ਸਵੈਪ ਤੁਹਾਡੇ ਉਪਲਬਧ DEX ਬਕਾਏ ਵਰਤਦਾ ਹੈ; ਮਿਲੀ ਰਕਮ ਉਹਨਾਂ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ।",
    swapFrom: "ਵੇਚਿਆ ਜਾਣ ਵਾਲਾ ਟੋਕਨ",
    swapAmountOut: "ਤੁਹਾਨੂੰ ਮਿਲੇਗਾ (ਅੰਦਾਜ਼ਾ)",
    swapFee: (pct: string) => `ਫੀਸ (${pct})`,
    swapPriceImpact: "ਕੀਮਤ 'ਤੇ ਅਸਰ",
    swapMinimum: "ਘੱਟੋ-ਘੱਟ ਪ੍ਰਾਪਤੀ",
    slippageLabel: "ਸਲਿਪੇਜ ਸਹਿਣਸ਼ੀਲਤਾ (%)",
    slippageInvalid: "0 ਤੋਂ 50 % ਤੱਕ ਦੀ ਸਹਿਣਸ਼ੀਲਤਾ ਦਰਜ ਕਰੋ।",
    swapDeadlineNote: "ਸਮਾਂ-ਸੀਮਾ ਪੁਸ਼ਟੀ ਤੋਂ 5 ਮਿੰਟ ਬਾਅਦ ਤੈਅ ਹੁੰਦੀ ਹੈ।",
    confirmSwap: "ਸਵੈਪ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    swapping: "ਸਵੈਪ ਹੋ ਰਿਹਾ ਹੈ…",
    swapDone: (input: string, output: string) =>
      `${input} ਨੂੰ ${output} ਨਾਲ ਸਵੈਪ ਕੀਤਾ ਗਿਆ।`,
    errLiqAnonymous: "ਪੂਲ ਵਰਤਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    errPoolNotFound: "ਇਹ ਪੂਲ ਮੌਜੂਦ ਨਹੀਂ ਹੈ।",
    errPoolRemoved: "ਇਹ ਜੋੜੀ ਹਟਾ ਦਿੱਤੀ ਗਈ ਹੈ। ਜਮ੍ਹਾਂ ਅਤੇ ਸਵੈਪ ਬੰਦ ਹਨ।",
    errMinimumsNotSet: "ਇਸ ਜੋੜੀ ਦੀਆਂ ਘੱਟੋ-ਘੱਟ ਰਕਮਾਂ ਅਜੇ ਤੈਅ ਨਹੀਂ ਹਨ।",
    errUnsupportedToken: "ਇਹ ਟੋਕਨ DEX ਵੱਲੋਂ ਸਮਰਥਿਤ ਨਹੀਂ ਹੈ।",
    errZeroAmount: "ਸਿਫ਼ਰ ਤੋਂ ਵੱਧ ਰਕਮ ਦਰਜ ਕਰੋ।",
    errCounterAmountRequired: "ਪਹਿਲੀ ਜਮ੍ਹਾਂ: ਦੋਵੇਂ ਰਕਮਾਂ ਦਰਜ ਕਰੋ।",
    errLiqInsufficientBalance: (available: string, required: string) =>
      `ਤੁਹਾਡਾ ਉਪਲਬਧ DEX ਬਕਾਇਆ ${available} ਹੈ; ${required} ਲੋੜੀਂਦਾ ਹੈ।`,
    errBelowMinimum: (minimums: string) => `ਜਮ੍ਹਾਂ ਘੱਟੋ-ਘੱਟ ਤੋਂ ਘੱਟ ਹੈ: ${minimums}।`,
    errRatioMismatch: (required: string) =>
      `ਪੂਲ ਅਨੁਪਾਤ 'ਤੇ ਦੂਜੇ ਪਾਸੇ ਦੀ ਰਕਮ ${required} ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।`,
    errLockTooShort: (min: string) => `ਲੌਕ ਬਹੁਤ ਛੋਟਾ ਹੈ। ਘੱਟੋ-ਘੱਟ: ${min}।`,
    errLockTooLong: (max: string) => `ਲੌਕ ਬਹੁਤ ਲੰਮਾ ਹੈ। ਵੱਧ ਤੋਂ ਵੱਧ: ${max}।`,
    errZeroShares: "ਇਹ ਜਮ੍ਹਾਂ ਸ਼ੇਅਰ ਮਿਲਣ ਲਈ ਬਹੁਤ ਛੋਟੀ ਹੈ।",
    errOperationInProgress:
      "ਇਸ ਖਾਤੇ 'ਤੇ ਕੋਈ ਹੋਰ ਕਾਰਵਾਈ ਚੱਲ ਰਹੀ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    errPositionNotFound: "ਇਹ ਪੋਜ਼ੀਸ਼ਨ ਮੌਜੂਦ ਨਹੀਂ ਹੈ।",
    errNotPositionOwner: "ਇਹ ਪੋਜ਼ੀਸ਼ਨ ਕਿਸੇ ਹੋਰ principal ਦੀ ਹੈ।",
    errPositionLocked: (date: string) => `ਇਹ ਪੋਜ਼ੀਸ਼ਨ ${date} ਤੱਕ ਲੌਕ ਹੈ।`,
    errCannotShortenLock: (date: string) =>
      `ਲੌਕ ਘਟਾਇਆ ਨਹੀਂ ਜਾ ਸਕਦਾ। ਮੌਜੂਦਾ ਅਨਲੌਕ: ${date}।`,
    errUnlockTooLate: (date: string) => `ਅਨਲੌਕ ਤਾਰੀਖ ${date} ਤੋਂ ਬਾਅਦ ਨਹੀਂ ਹੋ ਸਕਦੀ।`,
    errPoolFilling: (gauge: string) => `ਪੂਲ ਅਜੇ ਭਰਿਆ ਜਾ ਰਿਹਾ ਹੈ: ${gauge}`,
    errPoolNotOpen: "ਇਹ ਪੂਲ ਸਵੈਪ ਲਈ ਖੁੱਲ੍ਹਾ ਨਹੀਂ ਹੈ।",
    errRateUnavailable:
      "ਇੱਕ USD ਦਰ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ; ਪੂਲ ਦਾ ਮੁੱਲ ਜਾਂਚਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।",
    errTokenNotInPool: "ਇਹ ਟੋਕਨ ਇਸ ਜੋੜੀ ਦਾ ਹਿੱਸਾ ਨਹੀਂ ਹੈ।",
    errInvalidSlippage: (max: string) =>
      `ਸਲਿਪੇਜ ਸਹਿਣਸ਼ੀਲਤਾ ਵੱਧ ਤੋਂ ਵੱਧ ${max} % ਹੋ ਸਕਦੀ ਹੈ।`,
    errSwapInsufficientBalance: (available: string) =>
      `ਤੁਹਾਡਾ ਉਪਲਬਧ DEX ਬਕਾਇਆ ${available} ਹੈ।`,
    errInsufficientLiquidity: "ਇਸ ਸਵੈਪ ਲਈ ਪੂਲ ਵਿੱਚ ਕਾਫ਼ੀ ਤਰਲਤਾ ਨਹੀਂ ਹੈ।",
    errSlippageExceeded: (out: string, min: string) =>
      `ਸਲਿਪੇਜ ਪਾਰ: ਸਵੈਪ ${out} ਦੇਵੇਗਾ, ਜੋ ਘੱਟੋ-ਘੱਟ ${min} ਤੋਂ ਘੱਟ ਹੈ। ਨਵਾਂ ਕੋਟ ਲਓ।`,
    errDeadlineExceeded: (date: string) =>
      `ਸਮਾਂ-ਸੀਮਾ (${date}) ਲੰਘ ਗਈ ਹੈ। ਦੁਬਾਰਾ ਪੁਸ਼ਟੀ ਕਰੋ।`,
    errDeadlineTooFar: (date: string) =>
      `ਸਮਾਂ-ਸੀਮਾ ਬਹੁਤ ਦੂਰ ਹੈ; ਸਭ ਤੋਂ ਦੇਰ ਵਾਲੀ ਮਨਜ਼ੂਰ ਸੀਮਾ ${date} ਹੈ।`,
    errCall: (detail: string) => `ਕਾਲ ਅਸਫਲ ਰਹੀ: ${detail}`,
    bonusTitle: "ਲਾਕ ਕੀਤੀਆਂ ਪੁਜ਼ੀਸ਼ਨਾਂ ਲਈ ICP ਬੋਨਸ",
    bonusScope:
      "TTTI-T ਜੋੜਿਆਂ ਦੀਆਂ ਲਾਕ ਕੀਤੀਆਂ ਪੁਜ਼ੀਸ਼ਨਾਂ ਵੱਲੋਂ ਪਹਿਲਾਂ ਕਮਾਏ ICP ਬੋਨਸ ਕਲੇਮ ਕੀਤੇ ਜਾ ਸਕਦੇ ਹਨ। ਸਵੈਪ ਫੀਸਾਂ ਕੋਈ ਨਵਾਂ ਬੋਨਸ ਨਹੀਂ ਜੋੜਦੀਆਂ।",
    bonusWeightRule: "ਪੁਜ਼ੀਸ਼ਨ ਦਾ ਭਾਰ = ICP ਵਿੱਚ ਮੁੱਲ × ਬਾਕੀ ਲਾਕ ਸਮਾਂ ÷ 5 ਸਾਲ।",
    bonusObservedNote:
      "ਬੋਨਸ ਸਿਰਫ਼ ਦੇਖੀਆਂ ਗਈਆਂ ਰਕਮਾਂ ਦਿਖਾਉਂਦਾ ਹੈ। ਕਿਸੇ ਭਵਿੱਖੀ ਰਕਮ ਦਾ ਨਾ ਅੰਦਾਜ਼ਾ ਲਾਇਆ ਜਾਂਦਾ ਹੈ ਨਾ ਵਾਅਦਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    bonusSignIn: "ਆਪਣਾ ICP ਬੋਨਸ ਦੇਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    bonusLoading: "ਬੋਨਸ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
    bonusLoadError: "ਬੋਨਸ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ।",
    bonusClaimable: (amount: string) => `ਦਾਅਵੇਯੋਗ: ${amount}`,
    bonusClaimedTotal: (amount: string) => `ਕੁੱਲ ਦਾਅਵਾ ਕੀਤਾ: ${amount}`,
    bonusNoPositions: "ਕਿਸੇ TTTI-T ਜੋੜੇ ਵਿੱਚ ਕੋਈ ਲਾਕ ਕੀਤੀ ਪੁਜ਼ੀਸ਼ਨ ਨਹੀਂ।",
    bonusColPosition: "ਪੁਜ਼ੀਸ਼ਨ",
    bonusColValueIcp: "ICP ਵਿੱਚ ਮੁੱਲ",
    bonusColRemainingLock: "ਬਾਕੀ ਲਾਕ",
    bonusColWeight: "ਭਾਰ",
    bonusClaimsTitle: "ਦਾਅਵੇ",
    bonusClaimsEmpty: "ਅਜੇ ਕੋਈ ਦਾਅਵਾ ਨਹੀਂ।",
    claimButton: "ICP ਬੋਨਸ ਦਾ ਦਾਅਵਾ ਕਰੋ",
    claiming: "ਦਾਅਵਾ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ…",
    claimDone: (amount: string) =>
      `${amount} ਦਾ ਦਾਅਵਾ ਦਰਜ ਹੋ ਗਿਆ। ICP ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ।`,
    errClaimAnonymous: "ਬੋਨਸ ਦਾ ਦਾਅਵਾ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    errClaimNothing: "ਦਾਅਵਾ ਕਰਨ ਲਈ ਕੁਝ ਨਹੀਂ ਹੈ।",
    errClaimBelowMinimum: (minimum: string) =>
      `ਦਾਅਵੇਯੋਗ ਰਕਮ ${minimum} ਦੀ ਘੱਟੋ-ਘੱਟ ਰਕਮ ਤੋਂ ਘੱਟ ਹੈ।`,
    errClaimInProgress: "ਇੱਕ ਦਾਅਵਾ ਪਹਿਲਾਂ ਹੀ ਚੱਲ ਰਿਹਾ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    protocolLiquidityTitle: "ਪ੍ਰੋਟੋਕੋਲ ਤਰਲਤਾ",
    protocolLiquidityLocked: "ਹਮੇਸ਼ਾ ਲਈ ਲਾਕ। ਇਸਨੂੰ ਕਢਵਾਉਣ ਦਾ ਕੋਈ ਰਾਹ ਨਹੀਂ।",
    protocolLiquidityHeld: (amount0: string, amount1: string) =>
      `ਰੱਖਿਆ ਹੋਇਆ: ${amount0} ਅਤੇ ${amount1}`,
    protocolLiquidityFromFees: (amount0: string, amount1: string) =>
      `ਫੀਸਾਂ ਤੋਂ: ${amount0} ਅਤੇ ${amount1}`,
    protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
      `ਖਜ਼ਾਨੇ ਤੋਂ: ${amount0} ਅਤੇ ${amount1}`,
    protocolLiquidityShare: (pct: string) => `ਪੂਲ ਦੇ ਸ਼ੇਅਰਾਂ ਦਾ ${pct} %`,
    protocolLiquidityLastAdded: (date: string) => `ਆਖਰੀ ਵਾਰ ਜੋੜਿਆ: ${date}`,
    protocolLiquidityNone: "ਇਸ ਪੂਲ ਵਿੱਚ ਕੋਈ ਪ੍ਰੋਟੋਕੋਲ ਤਰਲਤਾ ਨਹੀਂ।",
    dexPausedTitle: "DEX ਰੋਕਿਆ ਗਿਆ",
    dexPausedNotice: (token: string) =>
      `ਰਿਜ਼ਰਵ ਜਾਂਚ ਵਿੱਚ ${token} ਦੀ ਕਮੀ ਮਿਲਣ ਤੋਂ ਬਾਅਦ DEX ਰੋਕਿਆ ਗਿਆ ਹੈ। ਸਵੈਪ, ਜਮ੍ਹਾਂ ਅਤੇ ਤਰਲਤਾ ਜੋੜਨਾ ਉਪਲਬਧ ਨਹੀਂ ਹਨ। ਕਢਵਾਉਣਾ ਅਤੇ ਤਰਲਤਾ ਹਟਾਉਣਾ ਉਪਲਬਧ ਰਹਿੰਦੇ ਹਨ।`,
    dexPausedTooltip: "DEX ਰੋਕੇ ਜਾਣ ਦੌਰਾਨ ਉਪਲਬਧ ਨਹੀਂ।",
    errDexPaused:
      "ਰਿਜ਼ਰਵ ਜਾਂਚ ਤੋਂ ਬਾਅਦ DEX ਰੋਕਿਆ ਗਿਆ ਹੈ। ਸਵੈਪ, ਜਮ੍ਹਾਂ ਅਤੇ ਤਰਲਤਾ ਜੋੜਨਾ ਉਪਲਬਧ ਨਹੀਂ ਹਨ। ਕਢਵਾਉਣਾ ਅਤੇ ਤਰਲਤਾ ਹਟਾਉਣਾ ਉਪਲਬਧ ਰਹਿੰਦੇ ਹਨ।",
    navLabel: "ਪੂਲ ਪੰਨੇ ਦੇ ਭਾਗ",
    navPools: "ਪੂਲ",
    navIndicators: "ਸੂਚਕ",
    navMyLiquidity: "ਮੇਰੀ ਤਰਲਤਾ",
    navProtocol: "ਪ੍ਰੋਟੋਕੋਲ",
    navRequests: "ਬੇਨਤੀਆਂ",
    introShort: "ਇਸ ਕੰਟਰੈਕਟ ਵੱਲੋਂ ਰੱਖੇ ਗਏ ਸਥਿਰ-ਗੁਣਨਫਲ ਪੂਲ।",
    statusWaiting: "ਤਰਲਤਾ ਦੀ ਉਡੀਕ",
    statusOpen: "ਖੁੱਲ੍ਹਾ",
    detailsLabel: "ਵੇਰਵੇ",
    addShort: "ਜੋੜੋ",
    howPoolsWorkTitle: "ਪੂਲ ਕਿਵੇਂ ਕੰਮ ਕਰਦੇ ਹਨ",
    permanentLiquidity: "ਸਥਾਈ ਤਰਲਤਾ",
    permanentLiquidityValue: (shares: string, pct: string) =>
      `${shares} ਹਿੱਸੇ (ਪੂਲ ਦਾ ${pct}%)`,
    myLiquiditySignIn:
      "ਆਪਣੇ DEX ਬਕਾਏ, ਤਰਲਤਾ ਪੁਜ਼ੀਸ਼ਨਾਂ ਅਤੇ ਪ੍ਰਾਪਤ ਫੀਸਾਂ ਦੇਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    rewardsTitle: "ਪ੍ਰਾਪਤ ਫੀਸਾਂ",
    activityTitle: "ਮੇਰੀ ਗਤੀਵਿਧੀ",
    activityFilterLabel: "ਗਤੀਵਿਧੀ ਦੀ ਕਿਸਮ",
    filterAll: "ਸਾਰੇ",
    filterTransfers: "ਜਮ੍ਹਾਂ ਅਤੇ ਕਢਵਾਉਣਾ",
    filterMintFees: "ਮਿੰਟ ਫ਼ੀਸਾਂ",
    filterLpBonus: "LP ਬੋਨਸ",
    tokenFilterLabel: "ਟੋਕਨ",
    allTokens: "ਸਾਰੇ ਟੋਕਨ",
    activityEmpty: "ਇਹਨਾਂ ਫਿਲਟਰਾਂ ਲਈ ਕੋਈ ਗਤੀਵਿਧੀ ਨਹੀਂ।",
    activityLoadError: "ਤੁਹਾਡੀ ਗਤੀਵਿਧੀ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ।",
    entryMintFee: "ਮਿੰਟ ਫ਼ੀਸ ਦਾ ਦਾਅਵਾ",
    entryLpBonus: "LP ਬੋਨਸ ਦਾ ਦਾਅਵਾ",
    requestsFilterLabel: "ਬੇਨਤੀ ਫਿਲਟਰ",
    filterRejected: "ਰੱਦ ਕੀਤੀਆਂ",
    requestsEmptyFiltered: "ਇਸ ਫਿਲਟਰ ਲਈ ਕੋਈ ਬੇਨਤੀ ਨਹੀਂ।",
    poolsEmpty: "ਅਜੇ ਕੋਈ ਪੂਲ ਨਹੀਂ।",
    ...DEX_ADMIN_EN,
    depthLabel: "ਡੂੰਘਾਈ",
    depthValue: (usd: string) => `${usd} USD`,
    depthBasisTwice: "ਪੂਲ ਦੀ ਕੀਮਤ ਉੱਤੇ, ਗ਼ੈਰ-TTTI-T ਪਾਸੇ ਦੇ USD ਮੁੱਲ ਤੋਂ ਦੁੱਗਣਾ।",
    depthBasisSum: "ਪੂਲ ਦੀ ਕੀਮਤ ਅਤੇ ਘੰਟਾਵਾਰ ਦਰਾਂ ਉੱਤੇ, ਦੋਵਾਂ ਪਾਸਿਆਂ ਦੇ USD ਮੁੱਲ ਦਾ ਜੋੜ।",
    depthUnavailable: "ਡੂੰਘਾਈ ਫ਼ਿਲਹਾਲ ਉਪਲਬਧ ਨਹੀਂ: ਇੱਕ USD ਦਰ ਗੁੰਮ ਹੈ।",
    depthMissingRate: (tokens: string) => `ਗੁੰਮ ਦਰ: ${tokens}।`,
    thresholdLabel: "ਸਵੈਪ ਦੀ ਹੱਦ",
    thresholdValueTtti: (usd: string) => `ਪੂਲ ਵਿੱਚ ${usd} USD ਦਾ TTTI-T`,
    thresholdValueDepth: (usd: string) => `${usd} USD ਦੀ ਡੂੰਘਾਈ`,
    thresholdRule: (usd: string) =>
      `ਜਦੋਂ ਤੱਕ ਡੂੰਘਾਈ ਘੱਟੋ-ਘੱਟ ${usd} USD ਹੈ ਅਤੇ USD ਦਰਾਂ ਉਪਲਬਧ ਹਨ, ਸਵੈਪ ਖੁੱਲ੍ਹੇ ਹਨ। ਹੱਦ ਸਿਰਫ਼ ਸਵੈਪਾਂ ਲਈ ਹੈ ਅਤੇ ਹਰ ਕਾਲ ਉੱਤੇ ਜਾਂਚੀ ਜਾਂਦੀ ਹੈ।`,
    swapStateLabel: "ਸਵੈਪ",
    swapStateOpen: "ਖੁੱਲ੍ਹੇ",
    swapStateClosed: "ਬੰਦ",
    swapClosedBelowThreshold: (measured: string, threshold: string) =>
      `ਸਵੈਪ ਬੰਦ ਹਨ: ਪੂਲ ${measured} USD 'ਤੇ ਹੈ, ਜੋ ਸਵੈਪ ਦੀ ਹੱਦ (${threshold}) ਤੋਂ ਘੱਟ ਹੈ। ਇਹ ਹੱਦ ਪੂਰੀ ਹੋਣ 'ਤੇ ਸਵੈਪ ਖੁੱਲ੍ਹਦੇ ਹਨ। ਜਮ੍ਹਾਂ, ਲਿਕਵਿਡਿਟੀ ਜੋੜਨ ਅਤੇ ਮਿੰਟ ਉੱਤੇ ਕੋਈ ਅਸਰ ਨਹੀਂ।`,
    swapClosedRateUnavailable: "ਸਵੈਪ ਬੰਦ ਹਨ: ਇੱਕ USD ਦਰ ਫ਼ਿਲਹਾਲ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    swapClosedRemovalAnnounced: (date: string) =>
      `ਸਵੈਪ ਮੁਅੱਤਲ ਹਨ: ਇਸ ਜੋੜੀ ਨੂੰ ਹਟਾਉਣ ਦਾ ਐਲਾਨ ${date} ਲਈ ਕੀਤਾ ਗਿਆ ਹੈ।`,
    swapClosedRemovalExecuting: "ਸਵੈਪ ਬੰਦ ਹਨ: ਇਸ ਜੋੜੀ ਨੂੰ ਹਟਾਉਣ ਦੀ ਕਾਰਵਾਈ ਜਾਰੀ ਹੈ।",
    swapClosedRemoved: "ਸਵੈਪ ਬੰਦ ਹਨ: ਇਹ ਜੋੜੀ ਹਟਾ ਦਿੱਤੀ ਗਈ ਹੈ।",
    errDepthBelowThreshold: (measured: string, threshold: string) =>
      `ਸਵੈਪ ਰੱਦ ਕੀਤਾ ਗਿਆ: ਪੂਲ ${measured} USD 'ਤੇ ਹੈ, ਜੋ ${threshold} USD ਦੀ ਸਵੈਪ ਹੱਦ ਤੋਂ ਘੱਟ ਹੈ।`,
    errSwapRateUnavailable: "ਸਵੈਪ ਰੱਦ ਕੀਤਾ ਗਿਆ: ਇੱਕ USD ਦਰ ਫ਼ਿਲਹਾਲ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    errRemovalInProgress: (date: string) =>
      `ਸਵੈਪ ਰੱਦ ਕੀਤਾ ਗਿਆ: ਇਸ ਜੋੜੀ ਨੂੰ ਹਟਾਉਣ ਦਾ ਐਲਾਨ ${date} ਲਈ ਕੀਤਾ ਗਿਆ ਹੈ।`,
    errSwapPoolRemoved: "ਸਵੈਪ ਰੱਦ ਕੀਤਾ ਗਿਆ: ਇਹ ਜੋੜੀ ਹਟਾ ਦਿੱਤੀ ਗਈ ਹੈ।",
    fixedSideLabel: "ਨਿਸ਼ਚਿਤ ਪਾਸਾ",
    fixedSideHint: "ਤੁਸੀਂ ਇਹ ਰਕਮ ਦਰਜ ਕਰਦੇ ਹੋ। ਇਹ ਬਦਲਦੀ ਨਹੀਂ।",
    counterSideLabel: "ਸਾਹਮਣੇ ਵਾਲਾ ਪਾਸਾ (ਗਣਨਾ ਕੀਤਾ)",
    counterSideNote:
      "ਜਮ੍ਹਾਂ ਕਰਨ ਵੇਲੇ ਪੂਲ ਦੇ ਅਨੁਪਾਤ ਨਾਲ, ਸਲਿੱਪੇਜ ਸਹਿਣਸ਼ੀਲਤਾ ਦੇ ਅੰਦਰ ਗਿਣਿਆ ਜਾਂਦਾ ਹੈ।",
    counterSideRange: (min: string, max: string) =>
      `ਮਨਜ਼ੂਰ ਸਾਹਮਣੇ ਵਾਲੀ ਰਕਮ: ${min} ਤੋਂ ${max}`,
    addSlippageLabel: "ਸਲਿੱਪੇਜ ਸਹਿਣਸ਼ੀਲਤਾ (%)",
    addSlippageHint: "ਕੋਟ ਅਤੇ ਅਮਲ ਵਿਚਕਾਰ ਸਾਹਮਣੇ ਵਾਲੀ ਰਕਮ ਵਿੱਚ ਵੱਧ ਤੋਂ ਵੱਧ ਤਬਦੀਲੀ।",
    addSlippageDefault: "ਮੂਲ ਮੁੱਲ: 0.5 %",
    addSlippageInvalid: (max: string) => `0 ਤੋਂ ${max} % ਤੱਕ ਦੀ ਸਹਿਣਸ਼ੀਲਤਾ ਦਰਜ ਕਰੋ।`,
    depthAfter: (depth: string) => `ਜਮ੍ਹਾਂ ਤੋਂ ਬਾਅਦ ਡੂੰਘਾਈ: ${depth} USD`,
    surplusKept: (amount: string) =>
      `ਵਰਤੀ ਨਹੀਂ ਗਈ: ${amount}। ਇਹ ਤੁਹਾਡੇ ਅੰਦਰੂਨੀ DEX ਬਕਾਏ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ।`,
    addDoneSurplus: (id: string, shares: string, surplus: string) =>
      `ਪੁਜ਼ੀਸ਼ਨ #${id} ${shares} ਹਿੱਸਿਆਂ ਨਾਲ ਬਣਾਈ ਗਈ। ਵਰਤੀ ਨਹੀਂ ਗਈ: ${surplus}, ਤੁਹਾਡੇ ਅੰਦਰੂਨੀ DEX ਬਕਾਏ ਵਿੱਚ ਰੱਖੀ ਗਈ।`,
    errAddInvalidSlippage: (max: string) =>
      `ਸਲਿੱਪੇਜ ਸਹਿਣਸ਼ੀਲਤਾ ਵੱਧ ਤੋਂ ਵੱਧ ${max} % ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।`,
    errAddSlippageExceeded: (
      tolerance: string,
      expected: string,
      actual: string,
    ) =>
      `ਸਾਹਮਣੇ ਵਾਲੀ ਰਕਮ ${tolerance} % ਸਹਿਣਸ਼ੀਲਤਾ ਤੋਂ ਵੱਧ ਬਦਲ ਗਈ: ਉਮੀਦ ${expected}, ਹੁਣ ${actual}। ਕੁਝ ਵੀ ਕੱਟਿਆ ਨਹੀਂ ਗਿਆ; ਫ਼ੰਡ ਤੁਹਾਡੇ ਅੰਦਰੂਨੀ ਬਕਾਏ ਵਿੱਚ ਰਹਿੰਦੇ ਹਨ। ਨਵਾਂ ਕੋਟ ਲਓ।`,
    errAddReferenceOutOfBand: (
      expected: string,
      deviation: string,
      tolerance: string,
    ) =>
      `ਪਹਿਲੀ ਜਮ੍ਹਾਂ ਦਾ ਅਨੁਪਾਤ ਹਵਾਲਾ ਕੀਮਤ ਤੋਂ ${deviation} % ਵੱਖਰਾ ਹੈ, ਜੋ ${tolerance} % ਦੀ ਪੱਟੀ ਤੋਂ ਬਾਹਰ ਹੈ। ਉਮੀਦ: ${expected}। ਕੁਝ ਵੀ ਕੱਟਿਆ ਨਹੀਂ ਗਿਆ; ਫ਼ੰਡ ਤੁਹਾਡੇ ਅੰਦਰੂਨੀ ਬਕਾਏ ਵਿੱਚ ਰਹਿੰਦੇ ਹਨ।`,
    errAddReferenceUnavailable:
      "ਹਵਾਲਾ ਕੀਮਤ ਉਪਲਬਧ ਨਹੀਂ ਹੈ, ਇਸ ਲਈ ਪਹਿਲੀ ਜਮ੍ਹਾਂ ਦੀ ਜਾਂਚ ਨਹੀਂ ਹੋ ਸਕਦੀ। ਕੁਝ ਵੀ ਕੱਟਿਆ ਨਹੀਂ ਗਿਆ; ਫ਼ੰਡ ਤੁਹਾਡੇ ਅੰਦਰੂਨੀ ਬਕਾਏ ਵਿੱਚ ਰਹਿੰਦੇ ਹਨ।",
    errAddRemovalAnnounced: (date: string) =>
      `ਤਰਲਤਾ ਜੋੜਨਾ ਮੁਅੱਤਲ ਹੈ: ਇਸ ਜੋੜੀ ਨੂੰ ਹਟਾਉਣ ਦਾ ਐਲਾਨ ${date} ਲਈ ਕੀਤਾ ਗਿਆ ਹੈ। ਕਢਵਾਉਣਾ ਪੁਜ਼ੀਸ਼ਨ ਲੌਕਾਂ ਦੇ ਅਧੀਨ ਖੁੱਲ੍ਹਾ ਰਹਿੰਦਾ ਹੈ।`,
    referenceTitle: "ਹਵਾਲਾ ਕੀਮਤ",
    referenceIntro: (tolerance: string) =>
      `ਖਾਲੀ ਪੂਲ ਦੀ ਪਹਿਲੀ ਜਮ੍ਹਾਂ ਹਵਾਲਾ ਕੀਮਤ ਦੇ ${tolerance} % ਦੇ ਅੰਦਰ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।`,
    referenceTttiPrice: (price: string) => `TTTI-T ਦੀ ਹਵਾਲਾ ਕੀਮਤ: ${price} USD`,
    referenceExpected: (expected: string) => `ਉਮੀਦ ਕੀਤਾ ਅਨੁਪਾਤ: ${expected}`,
    referenceSourcesTitle: "ਸਰੋਤ",
    referenceColSource: "ਸਰੋਤ",
    referenceColPrice: "ਕੀਮਤ (USD)",
    referenceColDepth: "ਡੂੰਘਾਈ (USD)",
    referenceColWeight: "ਭਾਰ",
    referenceSourceNative: "ਮੂਲ ਪੂਲ",
    referenceSourceIcpswap: "ICPSwap",
    referenceReadAt: (date: string) => `ਪੜ੍ਹਿਆ ਗਿਆ: ${date}`,
    referenceTolerance: (pct: string) => `ਸਹਿਣਸ਼ੀਲਤਾ: ${pct} %`,
    referenceUtilityBasis: "ਯੂਟਿਲਿਟੀ ਜੋੜੀਆਂ ਘੰਟਾਵਾਰ USD ਦਰਾਂ ਵਰਤਦੀਆਂ ਹਨ।",
    referenceUnavailableNoSource:
      "ਹਵਾਲਾ ਕੀਮਤ ਉਪਲਬਧ ਨਹੀਂ: ਕੋਈ ਸਰੋਤ ਪੜ੍ਹਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।",
    referenceUnavailableRate: (tokens: string) =>
      `ਹਵਾਲਾ ਕੀਮਤ ਉਪਲਬਧ ਨਹੀਂ: ${tokens} ਲਈ USD ਦਰ ਗੁੰਮ ਹੈ।`,
    referenceRatesInvalid:
      "ਘੰਟਾਵਾਰ USD ਦਰਾਂ ਵੈਧ ਨਹੀਂ ਹਨ; ਯੂਟਿਲਿਟੀ ਜੋੜੀਆਂ ਦੀ ਜਾਂਚ ਉਪਲਬਧ ਨਹੀਂ।",
    referenceWithin: (deviation: string) => `ਪੱਟੀ ਦੇ ਅੰਦਰ: ਫ਼ਰਕ ${deviation} %।`,
    referenceOutside: (deviation: string, tolerance: string) =>
      `ਪੱਟੀ ਤੋਂ ਬਾਹਰ: ਫ਼ਰਕ ${deviation} %, ਸਹਿਣਸ਼ੀਲਤਾ ${tolerance} %।`,
    referenceNotApplicable: "ਕੋਈ ਹਵਾਲਾ ਜਾਂਚ ਨਹੀਂ: ਪੂਲ ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ ਤਰਲਤਾ ਹੈ।",
    referenceRefresh: "ਸਰੋਤ ਦੁਬਾਰਾ ਪੜ੍ਹੋ",
    referenceRefreshing: "ਸਰੋਤ ਪੜ੍ਹੇ ਜਾ ਰਹੇ ਹਨ…",
    referenceRefreshed: (count: string) => `${count} ਸਰੋਤ ਪੜ੍ਹੇ ਗਏ।`,
    referenceLoading: "ਹਵਾਲਾ ਕੀਮਤ ਲੋਡ ਹੋ ਰਹੀ ਹੈ…",
    referenceLoadError: "ਹਵਾਲਾ ਕੀਮਤ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ।",
    lockNone: "ਕੋਈ ਲੌਕ ਨਹੀਂ",
    lockNoneHint: "ਕੋਈ ਲੌਕ ਨਹੀਂ: ਪੁਜ਼ੀਸ਼ਨ ਕਿਸੇ ਵੀ ਸਮੇਂ ਕਢਵਾਈ ਜਾ ਸਕਦੀ ਹੈ।",
    lockPickerLabel: "ਲੌਕ (ਵਿਕਲਪਿਕ)",
    lockUpTo: (max: string) =>
      `ਲੌਕ 3 ਮਹੀਨਿਆਂ ਤੋਂ ${max} ਤੱਕ ਹੁੰਦਾ ਹੈ। ਮਾਲਕ ਇਸਨੂੰ ਵਧਾ ਸਕਦਾ ਹੈ, ਘਟਾ ਨਹੀਂ ਸਕਦਾ।`,
    lockEnforced:
      "ਅਨਲੌਕ ਮਿਤੀ ਪੂਲ ਦੀ ਹਰ ਸਥਿਤੀ ਵਿੱਚ ਲਾਗੂ ਹੁੰਦੀ ਹੈ, ਹਟਾਈ ਗਈ ਜੋੜੀ ਸਮੇਤ। ਕੋਈ ਵੀ ਲੌਕ ਨੂੰ ਰੱਦ ਨਹੀਂ ਕਰ ਸਕਦਾ; ਸਿਰਫ਼ ਪੂਲ ਦੀਆਂ ਨਵੀਆਂ ਵਚਨਬੱਧਤਾਵਾਂ ਦਾ ਰੀਲੇਅ ਇਸਨੂੰ ਛੋਟਾ ਕਰ ਸਕਦਾ ਹੈ।",
    positionLiquidated: "ਜੋੜੀ ਹਟਾਏ ਜਾਣ ਉੱਤੇ ਪੁਜ਼ੀਸ਼ਨ ਦਾ ਨਿਪਟਾਰਾ ਕੀਤਾ ਗਿਆ।",
    removalTitle: "ਜੋੜੀ ਹਟਾਉਣਾ",
    removalBadge: "ਹਟਾਉਣ ਦਾ ਐਲਾਨ",
    removalAnnouncedTitle: "ਹਟਾਉਣ ਦਾ ਐਲਾਨ",
    removalReasonLabel: "ਕਾਰਨ",
    removalAnnouncedAt: (date: string) => `ਐਲਾਨ ਦੀ ਮਿਤੀ: ${date}`,
    removalEffectiveAt: (date: string) => `ਲਾਗੂ ਹੋਣ ਦੀ ਮਿਤੀ: ${date}`,
    removalRemaining: (remaining: string) => `ਬਾਕੀ ਸਮਾਂ: ${remaining}`,
    removalSuspendedNotice:
      "ਸਵੈਪ ਅਤੇ ਤਰਲਤਾ ਜੋੜਨਾ ਮੁਅੱਤਲ ਹਨ। ਕਢਵਾਉਣਾ ਪੁਜ਼ੀਸ਼ਨ ਲੌਕਾਂ ਦੇ ਅਧੀਨ ਖੁੱਲ੍ਹਾ ਰਹਿੰਦਾ ਹੈ।",
    removalLiquidationNotice:
      "ਲਾਗੂ ਹੋਣ ਦੀ ਮਿਤੀ ਉੱਤੇ ਲੌਕ ਵਾਲੀਆਂ ਪੁਜ਼ੀਸ਼ਨਾਂ ਸਮੇਤ ਸਾਰੀਆਂ ਪੁਜ਼ੀਸ਼ਨਾਂ ਦਾ ਨਿਪਟਾਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਅਤੇ ਪੂਲ ਨੂੰ ਹਟਾਇਆ ਹੋਇਆ ਚਿੰਨ੍ਹਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    removalCancelledTitle: "ਹਟਾਉਣਾ ਰੱਦ ਕੀਤਾ ਗਿਆ",
    removalCancelledNotice: (date: string) =>
      `ਐਲਾਨਿਆ ਗਿਆ ਹਟਾਉਣਾ ${date} ਨੂੰ ਰੱਦ ਕੀਤਾ ਗਿਆ। ਸਵੈਪ ਅਤੇ ਜੋੜਨਾ ਮੁੜ ਪੂਲ ਦੀ ਡੂੰਘਾਈ ਦੇ ਅਨੁਸਾਰ ਚੱਲਦੇ ਹਨ।`,
    removalExecutingTitle: "ਹਟਾਉਣ ਦੀ ਕਾਰਵਾਈ ਜਾਰੀ",
    removalExecutingNotice:
      "ਪੁਜ਼ੀਸ਼ਨਾਂ ਦਾ ਨਿਪਟਾਰਾ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ। ਸਵੈਪ ਅਤੇ ਜੋੜਨਾ ਬੰਦ ਹਨ।",
    removalCompletedTitle: "ਜੋੜੀ ਹਟਾਈ ਗਈ",
    removalCompletedNotice: (date: string) =>
      `${date} ਨੂੰ ਹਟਾਈ ਗਈ। ਸਾਰੀਆਂ ਪੁਜ਼ੀਸ਼ਨਾਂ ਦਾ ਨਿਪਟਾਰਾ ਹੋ ਗਿਆ।`,
    removalReviewNotice:
      "ਜਿਸ ਭੁਗਤਾਨ ਦਾ ਨਤੀਜਾ ਪੁਸ਼ਟ ਨਹੀਂ ਹੋ ਸਕਿਆ, ਉਹ ਐਡਮਿਨ ਦੀ ਸਮੀਖਿਆ ਸੂਚੀ ਵਿੱਚ ਦਰਜ ਹੁੰਦਾ ਹੈ।",
    poolDepthShort: (usd: string) => `ਡੂੰਘਾਈ ${usd} USD`,
    swapsOpenBadge: "ਸਵੈਪ ਖੁੱਲ੍ਹੇ",
    swapsClosedBadge: "ਸਵੈਪ ਬੰਦ",
    dexPercentConnect: "ਬਾਰ ਵਰਤਣ ਲਈ ਇੱਕ ਵਾਲਿਟ ਜੋੜੋ।",
    dexPercentLoading: "ਬਕਾਏ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…",
    dexPercentUnavailable: "ਬਕਾਇਆ ਉਪਲਬਧ ਨਹੀਂ।",
    dexPercentNotCover: (fees: string) =>
      `ਵਾਲਿਟ ਅਤੇ DEX ਦਾ ਬਕਾਇਆ ${fees} ਨੈੱਟਵਰਕ ਫੀਸਾਂ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ।`,
    dexPercentShare: (symbol: string) => `${symbol} ਦਾ ਹਿੱਸਾ (ਵਾਲਿਟ + DEX)`,
    dexPercentSummary: (percent: string, amount: string) =>
      `${percent}% = ${amount}`,
    dexPercentBase: (wallet: string, dex: string, total: string) =>
      `ਆਧਾਰ: ਵਾਲਿਟ ${wallet} + DEX ${dex} = ${total}`,
    dexPercentComputedOn: (fees: string) =>
      `ਵਾਲਿਟ ਦੇ ਬਕਾਏ ਅਤੇ ਉਪਲਬਧ DEX ਬਕਾਏ ਦੇ ਜੋੜ ਤੋਂ, ਵਾਲਿਟ ਤੋਂ ਲਏ ਹਿੱਸੇ ਦੀਆਂ ${fees} ਲੈਜਰ ਫੀਸਾਂ ਘਟਾ ਕੇ ਗਿਣਿਆ ਗਿਆ।`,
    slippageFieldHint: "ਕੋਟ ਕੀਤੀ ਰਕਮ ਅਤੇ ਲਾਗੂ ਹੋਈ ਰਕਮ ਵਿਚਕਾਰ ਵੱਧ ਤੋਂ ਵੱਧ ਫ਼ਰਕ।",
    emptyPoolTitle: "ਖਾਲੀ ਪੂਲ ਦੀ ਪਹਿਲੀ ਜਮ੍ਹਾਂ",
    emptyPoolNote:
      "ਇਸ ਪੂਲ ਵਿੱਚ ਅਜੇ ਤਰਲਤਾ ਨਹੀਂ ਹੈ। ਇੱਕ ਰਕਮ ਦਰਜ ਕਰੋ; ਦੂਜਾ ਪਾਸਾ ਹਵਾਲਾ ਕੀਮਤ 'ਤੇ ਗਿਣਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਜੋੜਨ ਵੇਲੇ ਸਹਿਣਸ਼ੀਲਤਾ ਅਨੁਸਾਰ ਜਾਂਚਿਆ ਜਾਂਦਾ ਹੈ।",
    expectedOtherAmountLabel: (symbol: string) =>
      `ਹਵਾਲਾ ਕੀਮਤ 'ਤੇ ${symbol} ਦੀ ਅਨੁਮਾਨਿਤ ਰਕਮ`,
    expectedOtherAmountUnavailable: "ਕੋਈ ਹਵਾਲਾ ਕੀਮਤ ਉਪਲਬਧ ਨਹੀਂ।",
    addReferenceBlockTitle: "ਪਹਿਲੀ ਜਮ੍ਹਾਂ ਲਈ ਹਵਾਲਾ ਕੀਮਤ",
    poolSwapStateLabel: "ਸਵੈਪ ਦੀ ਸਥਿਤੀ",
    depthBarOpen: "ਖੁੱਲ੍ਹੇ: ਸਵੈਪ ਦੀ ਹੱਦ ਪੂਰੀ ਹੋ ਗਈ ਹੈ",
    depthBarClosed: "ਬੰਦ: ਸਵੈਪ ਦੀ ਹੱਦ ਤੋਂ ਘੱਟ",
    depthBarAriaLabel: (pair: string) => `ਸਵੈਪ ਦੀ ਹੱਦ ਦੇ ਮੁਕਾਬਲੇ ${pair} ਪੂਲ ਦੀ ਡੂੰਘਾਈ`,
    countdownLabel: "ਬਾਕੀ ਸਮਾਂ",
    countdownDays: (count: string) => `${count} ਦਿਨ`,
    countdownHours: (count: string) => `${count} ਘੰਟੇ`,
    countdownMinutes: (count: string) => `${count} ਮਿੰਟ`,
    countdownSeconds: (count: string) => `${count} ਸਕਿੰਟ`,
    countdownReached: "ਲਾਗੂ ਹੋਣ ਦੀ ਤਾਰੀਖ਼ ਆ ਗਈ ਹੈ।",
    recoverHeading: "ਤੁਹਾਡਾ DEX ਬਕਾਇਆ",
    recoverButton: "ਵਾਪਸ ਲਓ",
    recoverExplain:
      "ਬਕਾਇਆ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਵਾਪਸ ਆ ਜਾਂਦਾ ਹੈ। ਹਰ ਰਕਮ ਵਿੱਚੋਂ ਲੈਜਰ ਫੀਸ ਕੱਟੀ ਜਾਂਦੀ ਹੈ।",
    recovering: "ਵਾਪਸ ਲਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
    recoverDone: (amounts: string) => `ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਵਾਪਸ ਆਇਆ: ${amounts}।`,
    recoverNothing: "ਵਾਪਸ ਲੈਣ ਲਈ ਕੋਈ DEX ਬਕਾਇਆ ਨਹੀਂ।",
    recoverError: (detail: string) => `ਬਕਾਇਆ ਵਾਪਸ ਨਹੀਂ ਲਿਆ ਜਾ ਸਕਿਆ: ${detail}`,
    durationOneYear: "1 ਸਾਲ",
    durationYears: (count: string) => `${count} ਸਾਲ`,
    durationOneMonth: "1 ਮਹੀਨਾ",
    durationMonths: (count: string) => `${count} ਮਹੀਨੇ`,
    positionLockCommitted: "ਵਚਨਬੱਧ ਲੌਕ",
    positionLockStart: "ਲੌਕ ਦੀ ਸ਼ੁਰੂਆਤ",
    positionTimeRemaining: "ਬਾਕੀ ਸਮਾਂ",
    positionRelayReceived: "ਮਿਲਿਆ ਰੀਲੇਅ",
    relayReceivedNone: "ਕੋਈ ਨਹੀਂ",
    positionFeesCollected: "ਇਕੱਠੀਆਂ ਕੀਤੀਆਂ ਫੀਸਾਂ",
    pendingPotLabel: "ਬਕਾਇਆ ਪੋਟ",
    pendingPotNext: (date: string) => `ਅਗਲੀ ਵੰਡ: ${date}`,
    pendingPotRunning: "ਵੰਡ ਜਾਰੀ ਹੈ",
    pendingPotNote:
      "ਪੋਟ ਵਿੱਚ ਪਿਛਲੀ ਵੰਡ ਤੋਂ ਬਾਅਦ ਅਦਾ ਕੀਤੀਆਂ LP ਫੀਸਾਂ ਦਾ ਲਾਕ ਕੀਤਾ ਅੱਧਾ ਹਿੱਸਾ ਹੈ। ਇਹ ਦਿਨ ਵਿੱਚ ਇੱਕ ਵਾਰ ਉਸ ਦਿਨ ਲਾਕ ਰਹੀਆਂ ਪੁਜ਼ੀਸ਼ਨਾਂ ਵਿੱਚ ਵੰਡਿਆ ਜਾਂਦਾ ਹੈ।",
    estimatedShareLabel: "ਅੱਜ ਦਾ ਅਨੁਮਾਨਿਤ ਹਿੱਸਾ",
    estimatedShareDetail: (fraction: string, date: string) =>
      `ਦਿਨ ਦਾ ${fraction} ਲਾਕ · ਅਗਲੀ ਵੰਡ ${date}`,
    estimatedShareNote:
      "ਮੌਜੂਦਾ ਦਿਨ ਲਈ ਅਨੁਮਾਨ: ਪੁਜ਼ੀਸ਼ਨ ਦੇ ਵਜ਼ਨ ਅਤੇ ਦਿਨ ਦੇ ਜਿੰਨੇ ਹਿੱਸੇ ਲਈ ਇਹ ਲਾਕ ਹੈ ਉਸਦੇ ਅਨੁਪਾਤ ਵਿੱਚ। ਅਦਾ ਕੀਤੀ ਰਕਮ ਅਗਲੀ ਵੰਡ ਸਮੇਂ ਪੋਟ ਉੱਤੇ ਨਿਰਭਰ ਕਰਦੀ ਹੈ।",
    estimatedShareNone: "ਅੱਜ ਕੋਈ ਲਾਕ ਸਮਾਂ ਨਹੀਂ",
    positionStatus: "ਸਥਿਤੀ",
    positionStatusLocked: "ਲੌਕ",
    positionStatusFree: "ਮੁਕਤ",
    positionStatusFreeNoLock: "ਮੁਕਤ · ਕੋਈ ਲੌਕ ਨਹੀਂ",
    positionFreeAfter: "ਰੀਲੇਅ ਜਾਂ ਮਿਆਦ ਤੋਂ ਬਾਅਦ ਮੁਕਤ",
    guaranteedDepthLabel: "ਗਾਰੰਟੀਸ਼ੁਦਾ ਡੂੰਘਾਈ",
    guaranteedDepthHint: "ਲੌਕ ਪੁਜ਼ੀਸ਼ਨਾਂ ਅਤੇ ਸਥਾਈ ਤਰਲਤਾ ਦਾ ਜੋੜ।",
    consolidatedTitle: "TTTI-T ਦੀ ਇਕਸਾਰ ਕੀਮਤ",
    consolidatedUsd: (price: string) => `${price} USD`,
    consolidatedCurrent: "ਕੀਮਤ",
    consolidatedHourly: "ਘੰਟੇਵਾਰ ਔਸਤ",
    consolidatedDaily: "24 ਘੰਟੇ ਦੀ ਔਸਤ",
    consolidatedSamples: (count: string) => `${count} ਨਮੂਨੇ`,
    consolidatedNotAvailable: "ਉਪਲਬਧ ਨਹੀਂ",
    consolidatedComputedLabel: "ਗਣਨਾ ਦਾ ਸਮਾਂ",
    consolidatedSource: (symbol: string, price: string, weight: string) =>
      `TTTI-T/${symbol}: ${price} USD · ਭਾਰ ${weight}`,
    consolidatedNote:
      "ਪੂਲ ਦੀ ਡੂੰਘਾਈ ਅਨੁਸਾਰ ਭਾਰਿਤ ਅਤੇ ਮੌਜੂਦਾ ਘੰਟੇਵਾਰ ਦਰਾਂ ਨਾਲ USD ਵਿੱਚ ਬਦਲੀ ਗਈ।",
    consolidatedUnavailableNoRate: "ਇਕਸਾਰ ਕੀਮਤ ਉਪਲਬਧ ਨਹੀਂ: ਕੋਈ ਵੈਧ ਘੰਟੇਵਾਰ ਦਰ ਨਹੀਂ।",
    consolidatedUnavailableNoPool:
      "ਇਕਸਾਰ ਕੀਮਤ ਉਪਲਬਧ ਨਹੀਂ: ਕੋਈ TTTI-T ਪੂਲ ਸਵੈਪ ਲਈ ਖੁੱਲ੍ਹਾ ਨਹੀਂ।",
    consolidatedLoadError: "ਇਕਸਾਰ ਕੀਮਤ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ।",
    spreadLabel: "ਇਕਸਾਰ ਕੀਮਤ ਤੋਂ ਫ਼ਰਕ",
    spreadAboveThreshold: (threshold: string) => `ਫ਼ਰਕ ${threshold} % ਤੋਂ ਵੱਧ`,
    spreadReasonEmpty: "ਇਸ ਪੂਲ ਵਿੱਚ ਕੋਈ ਤਰਲਤਾ ਨਹੀਂ।",
    spreadReasonNotOpen: "ਸਵੈਪ ਖੁੱਲ੍ਹੇ ਨਹੀਂ ਹਨ।",
    spreadReasonNoRate: "ਇਸ ਜੋੜੀ ਲਈ ਕੋਈ ਵੈਧ ਘੰਟੇਵਾਰ ਦਰ ਨਹੀਂ।",
    spreadReasonNoConsolidated: "ਕੋਈ ਇਕਸਾਰ ਕੀਮਤ ਨਹੀਂ।",
    spreadReasonLoadError: "ਫ਼ਰਕ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    poolPriceLabel: "ਪੂਲ ਦੀ ਕੀਮਤ",
    spreadAlertTitle: "ਸੀਮਾ ਤੋਂ ਵੱਧ ਫ਼ਰਕ",
    spreadAlert: (pool: string, spread: string, threshold: string) =>
      `ਪੂਲ ${pool}: TTTI-T ਦੀ ਇਕਸਾਰ ਕੀਮਤ ਤੋਂ ਫ਼ਰਕ ${spread} ਹੈ, ਜੋ ${threshold} % ਦੀ ਸੀਮਾ ਤੋਂ ਵੱਧ ਹੈ। ਤੁਹਾਡੀ ਇਸ ਪੂਲ ਵਿੱਚ ਪੁਜ਼ੀਸ਼ਨ ਹੈ।`,
    spreadAlertPrices: (poolPrice: string, consolidated: string) =>
      `ਪੂਲ ਦੀ ਕੀਮਤ ${poolPrice} USD · ਇਕਸਾਰ ਕੀਮਤ ${consolidated} USD`,
    referenceConsolidatedPrice: (price: string) =>
      `TTTI-T ਦੀ ਇਕਸਾਰ ਕੀਮਤ: ${price} USD`,
    guaranteedDepthReserves: (amount0: string, amount1: string) =>
      `ਗਾਰੰਟੀਸ਼ੁਦਾ ਰਿਜ਼ਰਵ: ${amount0} ਅਤੇ ${amount1}`,
    relayTitle: "ਵਚਨਬੱਧਤਾਵਾਂ ਦਾ ਰੀਲੇਅ",
    relayExplain:
      "ਰਿਲੇ ਲੌਕ ਵਿਕਲਪਿਕ ਹੈ ਅਤੇ 3 ਮਹੀਨਿਆਂ ਤੋਂ 5 ਸਾਲਾਂ ਤੱਕ ਚੱਲਦਾ ਹੈ। ਹਰ ਨਵੀਂ ਵਚਨਬੱਧਤਾ ਦੇ ਭਾਰ ਦਾ ਇੱਕ ਤਿਹਾਈ ਹਿੱਸਾ ਪੂਲ ਦੀਆਂ ਹੋਰ ਲੌਕ ਕੀਤੀਆਂ ਪੁਜ਼ੀਸ਼ਨਾਂ ਨੂੰ ਰਾਹਤ ਦਿੰਦਾ ਹੈ। ਮਾਲਕ ਮਿਆਦ ਵਧਾ ਸਕਦਾ ਹੈ। ਰਾਹਤ ਪ੍ਰਾਪਤ ਜਾਂ ਮਿਆਦ ਪੁੱਗੀ ਪੁਜ਼ੀਸ਼ਨ ਬਿਨਾਂ ਕੱਢੇ ਅਨਲੌਕ ਹੋ ਜਾਂਦੀ ਹੈ: ਉਹ ਮੁਕਤ ਤਰਲਤਾ ਵਜੋਂ ਪੂਲ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ।",
    relayResult: (shortened: string, freed: string) =>
      `ਰੀਲੇਅ: ${shortened} ਪੁਜ਼ੀਸ਼ਨਾਂ ਛੋਟੀਆਂ ਹੋਈਆਂ, ${freed} ਮੁਕਤ ਹੋਈਆਂ।`,
    relayResultNone: "ਰੀਲੇਅ: ਕੋਈ ਹੋਰ ਪੁਜ਼ੀਸ਼ਨ ਛੋਟੀ ਨਹੀਂ ਹੋਈ।",
    feeSplitTitle: "ਲੌਕ ਪੁਜ਼ੀਸ਼ਨਾਂ ਨਾਲ ਫੀਸਾਂ ਦੀ ਵੰਡ",
    feeSplitExplain:
      "ਤਰਲਤਾ ਪ੍ਰਦਾਤਾਵਾਂ ਦੀ ਫੀਸ ਦਾ ਅੱਧਾ ਹਿੱਸਾ ਹਿੱਸਿਆਂ ਦੇ ਅਨੁਪਾਤ ਵਿੱਚ ਰਿਜ਼ਰਵ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ। ਬਾਕੀ ਅੱਧਾ ਵੱਖ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਲੌਕ ਪੁਜ਼ੀਸ਼ਨਾਂ ਵਿੱਚ ਪੂੰਜੀ × (ਬਾਕੀ ਸਮਾਂ ÷ 5 ਸਾਲ) ਦੇ ਵਰਗਮੂਲ ਅਨੁਸਾਰ ਵੰਡਿਆ ਜਾਂਦਾ ਹੈ। ਸਿਰਫ਼ ਅਸਲ ਵਿੱਚ ਅਦਾ ਕੀਤੀਆਂ ਫੀਸਾਂ ਹੀ ਵੰਡੀਆਂ ਜਾਂਦੀਆਂ ਹਨ।",
    errExtendRemovalAnnounced: (date: string) =>
      `ਲੌਕ ਵਧਾਇਆ ਨਹੀਂ ਜਾ ਸਕਦਾ: ਇਸ ਜੋੜੀ ਨੂੰ ਹਟਾਉਣ ਦਾ ਐਲਾਨ ${date} ਲਈ ਕੀਤਾ ਗਿਆ ਹੈ।`,
    ...PTM4_PA,
  },
});

/**
 * Lot PTM-7: plain-language explanations of the pool-to-mint rules, shared by
 * the Pools, mint, guarantee and white paper areas. Rules only, no comment on
 * any expected effect. English is authoritative.
 */
export const PLAIN_RULES_TEXT = defineDict({
  en: {
    noReward:
      "No reward is created. Everything paid out was first paid by someone (minters, traders, transfers), and anyone can verify it.",
    observedYield:
      "TTTI-T generates nothing by itself. Swap fees pay the liquidity provided. Only the fees actually paid over the last 30 days are shown, for example: this pool paid X in fees over the last 30 days.",
    permanentDepth:
      "Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price.",
    ilTitle: "Impermanent loss",
    il: "A liquidity position holds a share of the pool, not a fixed amount of each token. When the pool price moves, the position can be worth less than the same tokens held outside the pool, whatever fees were collected.",
    exposureTitle: "Exposure to BTC and ICP",
    exposure:
      "Through its pools, TTTI-T is exposed to BTC and ICP: the TTTI-T side of a position is paired with ICP, ckBTC, ckUSDC or ckUSDT, so its value in those tokens follows the pool.",
    zapTitle: "Mint zap",
    zap: "The zap is an automatic swap made with the minter's own money at the moment of the mint, so that the rest can be deposited at the pool ratio.",
    guaranteeTitle: "Recoverable guarantee",
    guarantee:
      "Each minter can recover their own stake by returning TTTI-T to the contract under the redemption rules. The guarantee is personal: there is no common reserve and no promise of value.",
    chance:
      "At the mint every minter has an equal chance. At auctions the highest bids win, in price order, until the lot is sold.",
    auctionRules:
      "Auctions are sealed-bid: each bidder pays their own bid. The reserve price is the highest of 10,000 USD per TTTI-T, the 24-hour average of the consolidated price and the current consolidated price. Nothing is reissued below 10,000 USD.",
  },
  fr: {
    noReward:
      "Aucune récompense n'est créée. Tout ce qui est versé a d'abord été payé par quelqu'un (minteurs, traders, transferts), et chacun peut le vérifier.",
    observedYield:
      "Le TTTI-T ne génère rien par lui-même. Les frais de swap rémunèrent la liquidité fournie. Seuls les frais réellement versés au cours des 30 derniers jours sont affichés, par exemple : ce pool a versé X en frais au cours des 30 derniers jours.",
    permanentDepth:
      "La liquidité permanente est une gestion de la profondeur : un rééquilibrage mécanique et public de la part du protocole, jamais conditionné au prix.",
    ilTitle: "Perte impermanente",
    il: "Une position de liquidité détient une part du pool, et non un montant fixe de chaque jeton. Lorsque le prix du pool varie, la position peut valoir moins que les mêmes jetons conservés hors du pool, quels que soient les frais perçus.",
    exposureTitle: "Exposition au BTC et à l'ICP",
    exposure:
      "Par ses pools, le TTTI-T est exposé au BTC et à l'ICP : le côté TTTI-T d'une position est associé à l'ICP, au ckBTC, au ckUSDC ou au ckUSDT, de sorte que sa valeur en ces jetons suit celle du pool.",
    zapTitle: "Zap du mint",
    zap: "Le zap est un échange automatique réalisé avec l'argent du minteur au moment du mint, afin que le reste puisse être déposé au ratio du pool.",
    guaranteeTitle: "Garantie récupérable",
    guarantee:
      "Chaque minteur peut récupérer sa propre mise en rendant du TTTI-T au contrat selon les règles de rachat. La garantie est personnelle : il n'y a ni réserve commune ni promesse de valeur.",
    chance:
      "Au mint, chaque minteur a la même chance. Aux enchères, les offres les plus élevées l'emportent, par ordre de prix, jusqu'à ce que le lot soit vendu.",
    auctionRules:
      "Les enchères sont à offres scellées : chaque enchérisseur paie sa propre offre. Le prix de réserve est le plus élevé entre 10 000 USD par TTTI-T, la moyenne sur 24 heures du prix consolidé et le prix consolidé actuel. Rien n'est réémis en dessous de 10 000 USD.",
  },
  es: {
    noReward:
      "No se crea ninguna recompensa. Todo lo que se paga fue pagado antes por alguien (minters, traders, transferencias), y cualquiera puede verificarlo.",
    observedYield:
      "TTTI-T no genera nada por sí mismo. Las comisiones de swap remuneran la liquidez aportada. Solo se muestran las comisiones realmente pagadas durante los últimos 30 días, por ejemplo: este pool pagó X en comisiones durante los últimos 30 días.",
    permanentDepth:
      "La liquidez permanente es una gestión de la profundidad: un reequilibrio mecánico y público de la parte del protocolo, nunca condicionado al precio.",
    ilTitle: "Pérdida impermanente",
    il: "Una posición de liquidez posee una parte del pool, no una cantidad fija de cada token. Cuando el precio del pool se mueve, la posición puede valer menos que los mismos tokens conservados fuera del pool, sean cuales sean las comisiones cobradas.",
    exposureTitle: "Exposición a BTC e ICP",
    exposure:
      "A través de sus pools, TTTI-T está expuesto a BTC e ICP: el lado TTTI-T de una posición se empareja con ICP, ckBTC, ckUSDC o ckUSDT, de modo que su valor en esos tokens sigue al del pool.",
    zapTitle: "Zap del mint",
    zap: "El zap es un intercambio automático hecho con el dinero del minter en el momento del mint, para que el resto pueda depositarse a la proporción del pool.",
    guaranteeTitle: "Garantía recuperable",
    guarantee:
      "Cada minter puede recuperar su propia aportación devolviendo TTTI-T al contrato según las reglas de canje. La garantía es personal: no hay reserva común ni promesa de valor.",
    chance:
      "En el mint, cada minter tiene la misma probabilidad. En las subastas ganan las ofertas más altas, por orden de precio, hasta que se venda el lote.",
    auctionRules:
      "Las subastas son de oferta sellada: cada postor paga su propia oferta. El precio de reserva es el más alto entre 10 000 USD por TTTI-T, el promedio de 24 horas del precio consolidado y el precio consolidado actual. No se reemite nada por debajo de 10 000 USD.",
  },
  "zh-Hans": {
    noReward:
      "不会创建任何奖励。所有支付出去的款项都是先由某人付入的（铸造者、交易者、转账），任何人都可以验证。",
    observedYield:
      "TTTI-T 本身不产生任何收益。兑换手续费用于回报所提供的流动性。仅显示过去 30 天内实际支付的手续费，例如：该池在过去 30 天内支付了 X 的手续费。",
    permanentDepth:
      "永久流动性是深度管理：对协议份额进行机械、公开的再平衡，从不以价格为条件。",
    ilTitle: "无常损失",
    il: "流动性头寸持有的是池的一份份额，而不是每种代币的固定数量。当池价格变动时，无论收取了多少费用，该头寸的价值都可能低于把相同代币持有在池外的价值。",
    exposureTitle: "对 BTC 和 ICP 的敞口",
    exposure:
      "通过其流动性池，TTTI-T 对 BTC 和 ICP 有敞口：头寸的 TTTI-T 一侧与 ICP、ckBTC、ckUSDC 或 ckUSDT 配对，因此它以这些代币计的价值随池而变动。",
    zapTitle: "铸造 Zap",
    zap: "Zap 是在铸造时用铸造者自己的资金自动进行的一次兑换，以便其余部分可以按池的比例存入。",
    guaranteeTitle: "可收回的保障",
    guarantee:
      "每位铸造者都可以按赎回规则将 TTTI-T 退还给合约，从而收回自己的本金。该保障是个人性的：没有共同储备，也不承诺任何价值。",
    chance:
      "在铸造时，每位铸造者的机会均等。在拍卖中，出价最高的报价按价格顺序获胜，直至批次售出。",
    auctionRules:
      "拍卖采用密封出价：每位竞拍者支付自己的出价。底价取以下三者中的最高值：每个 TTTI-T 10,000 USD、综合价格的 24 小时平均值以及当前综合价格。低于 10,000 USD 不会重新发行。",
  },
  "pt-BR": {
    noReward:
      "Nenhuma recompensa é criada. Tudo o que é pago foi antes pago por alguém (minters, traders, transferências), e qualquer pessoa pode verificar.",
    observedYield:
      "O TTTI-T não gera nada por si só. As taxas de swap remuneram a liquidez fornecida. Apenas as taxas efetivamente pagas nos últimos 30 dias são exibidas, por exemplo: este pool pagou X em taxas nos últimos 30 dias.",
    permanentDepth:
      "A liquidez permanente é uma gestão de profundidade: um reequilíbrio mecânico e público da parte do protocolo, nunca condicionado ao preço.",
    ilTitle: "Perda impermanente",
    il: "Uma posição de liquidez detém uma parte do pool, e não uma quantidade fixa de cada token. Quando o preço do pool se move, a posição pode valer menos do que os mesmos tokens mantidos fora do pool, quaisquer que tenham sido as taxas recebidas.",
    exposureTitle: "Exposição a BTC e ICP",
    exposure:
      "Por meio de seus pools, o TTTI-T está exposto a BTC e ICP: o lado TTTI-T de uma posição é pareado com ICP, ckBTC, ckUSDC ou ckUSDT, de modo que seu valor nesses tokens acompanha o do pool.",
    zapTitle: "Zap do mint",
    zap: "O zap é uma troca automática feita com o dinheiro do minter no momento do mint, para que o restante possa ser depositado na proporção do pool.",
    guaranteeTitle: "Garantia recuperável",
    guarantee:
      "Cada minter pode recuperar o próprio aporte devolvendo TTTI-T ao contrato conforme as regras de resgate. A garantia é pessoal: não há reserva comum nem promessa de valor.",
    chance:
      "No mint, cada minter tem a mesma chance. Nos leilões, vencem os maiores lances, em ordem de preço, até que o lote seja vendido.",
    auctionRules:
      "Os leilões são de lance selado: cada licitante paga o próprio lance. O preço de reserva é o maior entre 10.000 USD por TTTI-T, a média de 24 horas do preço consolidado e o preço consolidado atual. Nada é reemitido abaixo de 10.000 USD.",
  },
  ko: {
    noReward:
      "보상은 만들어지지 않습니다. 지급되는 모든 것은 먼저 누군가(민터, 트레이더, 전송)가 지불한 것이며, 누구나 이를 확인할 수 있습니다.",
    observedYield:
      "TTTI-T는 그 자체로 아무것도 생성하지 않습니다. 스왑 수수료는 공급된 유동성에 대한 보상입니다. 최근 30일 동안 실제로 지급된 수수료만 표시됩니다. 예: 이 풀은 최근 30일 동안 X의 수수료를 지급했습니다.",
    permanentDepth:
      "영구 유동성은 깊이 관리입니다. 프로토콜 몫을 기계적이고 공개적으로 재조정하며, 가격을 조건으로 하지 않습니다.",
    ilTitle: "비영구적 손실",
    il: "유동성 포지션은 각 토큰의 고정 수량이 아니라 풀의 지분을 보유합니다. 풀 가격이 움직이면, 수수료를 얼마나 받았든 같은 토큰을 풀 밖에 보유했을 때보다 포지션의 가치가 낮아질 수 있습니다.",
    exposureTitle: "BTC 및 ICP에 대한 노출",
    exposure:
      "TTTI-T는 풀을 통해 BTC와 ICP에 노출됩니다. 포지션의 TTTI-T 쪽은 ICP, ckBTC, ckUSDC 또는 ckUSDT와 짝을 이루므로, 해당 토큰 기준 가치는 풀을 따릅니다.",
    zapTitle: "민트 잽",
    zap: "잽은 민트 시점에 민터 본인의 자금으로 이루어지는 자동 스왑이며, 나머지를 풀 비율에 맞춰 예치할 수 있게 해 줍니다.",
    guaranteeTitle: "회수 가능한 보장",
    guarantee:
      "각 민터는 상환 규칙에 따라 TTTI-T를 컨트랙트에 반환하여 자신의 지분을 회수할 수 있습니다. 이 보장은 개인별이며, 공동 준비금도 가치에 대한 약속도 없습니다.",
    chance:
      "민트에서는 모든 민터에게 동등한 기회가 있습니다. 경매에서는 가장 높은 입찰가부터 가격순으로 낙찰되며, 로트가 모두 판매될 때까지 이어집니다.",
    auctionRules:
      "경매는 비공개 입찰 방식이며 각 입찰자는 자신의 입찰가를 지불합니다. 최저 낙찰가는 TTTI-T당 10,000 USD, 통합 가격의 24시간 평균, 현재 통합 가격 중 가장 높은 값입니다. 10,000 USD 미만으로는 아무것도 재발행되지 않습니다.",
  },
  "pa-Guru": {
    noReward:
      "ਕੋਈ ਇਨਾਮ ਨਹੀਂ ਬਣਾਇਆ ਜਾਂਦਾ। ਜੋ ਕੁਝ ਵੀ ਅਦਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਉਹ ਪਹਿਲਾਂ ਕਿਸੇ ਨੇ ਭਰਿਆ ਹੁੰਦਾ ਹੈ (ਮਿੰਟਰ, ਵਪਾਰੀ, ਟ੍ਰਾਂਸਫਰ), ਅਤੇ ਕੋਈ ਵੀ ਇਸਦੀ ਜਾਂਚ ਕਰ ਸਕਦਾ ਹੈ।",
    observedYield:
      "TTTI-T ਆਪਣੇ ਆਪ ਕੁਝ ਪੈਦਾ ਨਹੀਂ ਕਰਦਾ। ਸਵੈਪ ਫੀਸਾਂ ਮੁਹੱਈਆ ਕਰਵਾਈ ਗਈ ਲਿਕਵਿਡਿਟੀ ਨੂੰ ਇਵਜ਼ ਦਿੰਦੀਆਂ ਹਨ। ਸਿਰਫ਼ ਪਿਛਲੇ 30 ਦਿਨਾਂ ਵਿੱਚ ਅਸਲ ਵਿੱਚ ਅਦਾ ਕੀਤੀਆਂ ਫੀਸਾਂ ਹੀ ਦਿਖਾਈਆਂ ਜਾਂਦੀਆਂ ਹਨ, ਉਦਾਹਰਨ ਵਜੋਂ: ਇਸ ਪੂਲ ਨੇ ਪਿਛਲੇ 30 ਦਿਨਾਂ ਵਿੱਚ X ਫੀਸ ਅਦਾ ਕੀਤੀ।",
    permanentDepth:
      "ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਡੂੰਘਾਈ ਦਾ ਪ੍ਰਬੰਧ ਹੈ: ਪ੍ਰੋਟੋਕੋਲ ਹਿੱਸੇ ਦਾ ਮਸ਼ੀਨੀ ਅਤੇ ਜਨਤਕ ਮੁੜ-ਸੰਤੁਲਨ, ਜੋ ਕਦੇ ਕੀਮਤ ਉੱਤੇ ਨਿਰਭਰ ਨਹੀਂ ਹੁੰਦਾ।",
    ilTitle: "ਅਸਥਾਈ ਘਾਟਾ",
    il: "ਤਰਲਤਾ ਪੁਜ਼ੀਸ਼ਨ ਪੂਲ ਦਾ ਇੱਕ ਹਿੱਸਾ ਰੱਖਦੀ ਹੈ, ਹਰ ਟੋਕਨ ਦੀ ਨਿਸ਼ਚਿਤ ਮਾਤਰਾ ਨਹੀਂ। ਜਦੋਂ ਪੂਲ ਦੀ ਕੀਮਤ ਹਿਲਦੀ ਹੈ, ਤਾਂ ਭਾਵੇਂ ਕਿੰਨੀਆਂ ਵੀ ਫੀਸਾਂ ਇਕੱਠੀਆਂ ਹੋਈਆਂ ਹੋਣ, ਪੁਜ਼ੀਸ਼ਨ ਦੀ ਕੀਮਤ ਪੂਲ ਤੋਂ ਬਾਹਰ ਰੱਖੇ ਉਹੀ ਟੋਕਨਾਂ ਨਾਲੋਂ ਘੱਟ ਹੋ ਸਕਦੀ ਹੈ।",
    exposureTitle: "BTC ਅਤੇ ICP ਨਾਲ ਜੋਖਮ",
    exposure:
      "ਆਪਣੇ ਪੂਲਾਂ ਰਾਹੀਂ TTTI-T ਦਾ BTC ਅਤੇ ICP ਨਾਲ ਜੋਖਮ ਹੈ: ਪੁਜ਼ੀਸ਼ਨ ਦਾ TTTI-T ਪਾਸਾ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਨਾਲ ਜੋੜਿਆ ਜਾਂਦਾ ਹੈ, ਇਸ ਲਈ ਉਨ੍ਹਾਂ ਟੋਕਨਾਂ ਵਿੱਚ ਇਸਦੀ ਕੀਮਤ ਪੂਲ ਦੇ ਨਾਲ ਚੱਲਦੀ ਹੈ।",
    zapTitle: "ਮਿੰਟ ਜ਼ੈਪ",
    zap: "ਜ਼ੈਪ ਮਿੰਟ ਦੇ ਸਮੇਂ ਮਿੰਟਰ ਦੇ ਆਪਣੇ ਪੈਸੇ ਨਾਲ ਕੀਤਾ ਗਿਆ ਆਪਣੇ-ਆਪ ਹੋਣ ਵਾਲਾ ਸਵੈਪ ਹੈ, ਤਾਂ ਜੋ ਬਾਕੀ ਹਿੱਸਾ ਪੂਲ ਦੇ ਅਨੁਪਾਤ ਵਿੱਚ ਜਮ੍ਹਾਂ ਕੀਤਾ ਜਾ ਸਕੇ।",
    guaranteeTitle: "ਮੁੜ-ਪ੍ਰਾਪਤੀ ਯੋਗ ਗਾਰੰਟੀ",
    guarantee:
      "ਹਰ ਮਿੰਟਰ ਰਿਡੈਂਪਸ਼ਨ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ TTTI-T ਕੰਟਰੈਕਟ ਨੂੰ ਮੋੜ ਕੇ ਆਪਣੀ ਹੀ ਰਕਮ ਵਾਪਸ ਲੈ ਸਕਦਾ ਹੈ। ਗਾਰੰਟੀ ਨਿੱਜੀ ਹੈ: ਕੋਈ ਸਾਂਝਾ ਰਿਜ਼ਰਵ ਨਹੀਂ ਅਤੇ ਮੁੱਲ ਦਾ ਕੋਈ ਵਾਅਦਾ ਨਹੀਂ।",
    chance:
      "ਮਿੰਟ ਵਿੱਚ ਹਰ ਮਿੰਟਰ ਦਾ ਮੌਕਾ ਬਰਾਬਰ ਹੈ। ਨਿਲਾਮੀਆਂ ਵਿੱਚ ਸਭ ਤੋਂ ਉੱਚੀਆਂ ਬੋਲੀਆਂ ਕੀਮਤ ਦੇ ਕ੍ਰਮ ਵਿੱਚ ਜਿੱਤਦੀਆਂ ਹਨ, ਜਦੋਂ ਤੱਕ ਲਾਟ ਵਿਕ ਨਹੀਂ ਜਾਂਦਾ।",
    auctionRules:
      "ਨਿਲਾਮੀਆਂ ਸੀਲਬੰਦ ਬੋਲੀ ਵਾਲੀਆਂ ਹਨ: ਹਰ ਬੋਲੀਕਾਰ ਆਪਣੀ ਹੀ ਬੋਲੀ ਅਦਾ ਕਰਦਾ ਹੈ। ਰਾਖਵੀਂ ਕੀਮਤ ਪ੍ਰਤੀ TTTI-T 10,000 USD, ਇਕਜੁੱਟ ਕੀਮਤ ਦੀ 24 ਘੰਟਿਆਂ ਦੀ ਔਸਤ ਅਤੇ ਮੌਜੂਦਾ ਇਕਜੁੱਟ ਕੀਮਤ ਵਿੱਚੋਂ ਸਭ ਤੋਂ ਉੱਚੀ ਹੈ। 10,000 USD ਤੋਂ ਹੇਠਾਂ ਕੁਝ ਵੀ ਦੁਬਾਰਾ ਜਾਰੀ ਨਹੀਂ ਕੀਤਾ ਜਾਂਦਾ।",
  },
});
