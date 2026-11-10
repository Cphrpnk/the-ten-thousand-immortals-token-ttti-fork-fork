import type en from "./en";

const fr: typeof en = {
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
  deposit: (amount: string) => `Dépôt : ${amount}`,
  depositApproval: (amount: string, margin: string) =>
    `Avant la demande, vous autorisez jusqu'à ${amount} au contrat : le dépôt, une marge de ${margin} pour les variations de taux et les frais du ledger. Seul le dépôt exact est prélevé. L'autorisation expire au bout de 15 minutes.`,
  depositRule: (usd: string, ttti: string) =>
    `Le dépôt est d'environ ${usd}, l'équivalent de ${ttti} TTTI-T au prix de mint, aux taux horaires en vigueur. Si la demande est approuvée, il est rendu dans le jeton payé. Si elle est refusée, il est conservé et rejoint la réserve de liquidité permanente.`,
  payToken: "Jeton du dépôt",
  depositRateUnavailable: (symbol: string) =>
    `Le taux de ${symbol} est indisponible : le dépôt ne peut pas être calculé.`,
  depositApprovedNote: "Le dépôt est rendu dans le jeton payé.",
  depositRefusedNote:
    "Le dépôt est conservé et rejoint la réserve de liquidité permanente.",
  errPayTokenNotAccepted: (symbol: string) =>
    `${symbol} n'est pas accepté pour le dépôt.`,
  errDepositRateUnavailable: (symbol: string) =>
    `Le taux de ${symbol} est indisponible ou a expiré. Réessayez plus tard ou choisissez un autre jeton.`,
  errRequestInProgress:
    "Une demande de votre compte est déjà en cours. Réessayez dans un instant.",
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
    `L'autorisation couvre ${allowance} ; ${required} sont requis.`,
  errInsufficientFunds: (balance: string) =>
    `Votre solde (${balance}) ne couvre pas le dépôt et les frais.`,
  errDepositFailed: (detail: string) =>
    `Le dépôt n'a pas pu être prélevé : ${detail}`,
  errApprovalFailed: (detail: string) => `L'autorisation a échoué : ${detail}`,
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
  gaugeOpen: (current: string, target: string) => `${current} / ${target} USD`,
  gaugeUnavailable: "Valeur momentanément indisponible",
  reserves: "Réserves",
  totalShares: "Total des parts",
  addLiquidityButton: "Ajouter de la liquidité",
  swapButton: "Échanger",
  positionsButton: "Positions",
  signInForActions: "Connectez-vous pour ajouter de la liquidité ou échanger.",
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
  errLockTooShort: (min: string) => `Le gel est trop court. Minimum : ${min}.`,
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
  thresholdProgressTtti: (measured: string, threshold: string) =>
    `${measured} USD de TTTI-T / ${threshold} USD de TTTI-T dans le pool`,
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
    `Montant de TTTI-T du pool ${pair} par rapport au seuil d'échange`,
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
  recoverDone: (amounts: string) => `Récupéré vers votre wallet : ${amounts}.`,
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
  spreadLabel: "Écart avec les autres pools ouverts",
  spreadNoIndependentReference: "Aucune référence indépendante",
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
    `Pool ${pool} : le prix du pool est comparé au prix des autres pools ouverts. L'écart est de ${spread}, au-dessus du seuil de ${threshold} %. Vous détenez une position dans ce pool.`,
  spreadAlertPrices: (poolPrice: string, consolidated: string) =>
    `Prix du pool ${poolPrice} USD · prix des autres pools ouverts ${consolidated} USD`,
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
    "Les frais de mint de 1 % alimentent d'abord la réserve de cycles, jusqu'à un an de consommation mesurée. Le reste va au créateur.",
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
  boardCreatorSwapFee: "Part des frais d'échange",
  boardCreatorRouterShare: "Part des frais du routeur",
  boardCreatorTransferFee: "Frais de transfert",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `Frais de transfert reçus en TTTI-T : ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `Solde du compte de frais en TTTI-T : ${amount}`,
  boardCreatorLastCredit: (date: string) => `Dernier crédit : ${date}`,
};
export default fr;
