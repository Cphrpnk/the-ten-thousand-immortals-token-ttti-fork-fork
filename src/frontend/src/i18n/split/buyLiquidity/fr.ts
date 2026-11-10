import type en from "./en";

const fr: typeof en = {
  priceStatement:
    "Prix : 10 000 USD par TTTI-T, rachetable 10 000 USD en tout temps. Pour q TTTI-T, le montant à payer est (10 000 USD + la liquidité que vous apportez) × q ÷ 0,99, en ICP, ckBTC, ckUSDC ou ckUSDT. Minimum : 0,0001 TTTI-T.",
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
  rowGuarantee: "Réserve commune",
  rowFee: "Frais : 1 %",
  rowPrice: "Prix",
  priceValue:
    "10\u202f000 $ par TTTI-T, rachetable 10\u202f000 $ en tout temps",
  rowLiquidity: "Liquidité que vous apportez",
  liquidityNote: "reste à vous, dans votre position",
  holdingsHeading: "Vous détenez après le mint",
  rowLocked: "Part bloquée",
  rowHand: "TTTI-T en main",
  lockedShareLabel: "Part bloquée m",
  lockedShareNote:
    "m est la part de la position bloquée pendant 3 mois. Elle est prise au moment du paiement : si elle change après cet aperçu, la valeur au moment du paiement s’applique.",
  choiceLegend: "Choix du reste (1 − m)",
  choicePoolTitle: "A · Mettre le reste en pool",
  choicePoolText: "Le reste est mis en pool dans votre position, sans blocage.",
  choiceWalletTitle: "B · Garder dans le portefeuille",
  choiceWalletText:
    "Le reste demeure dans votre portefeuille en TTTI-T ; la liquidité correspondante n’est pas payée.",
  paymentRule:
    "Paiement : (10\u202f000 USD + la liquidité que vous apportez) × q ÷ 0,99, arrondi au supérieur. 10\u202f000 USD × q vont à la réserve commune et 1 % du montant payé revient au créateur. Le reste est la liquidité que vous apportez, qui reste à vous dans votre position.",
  lockedRule:
    "Une part m de la position est bloquée pendant 3 mois. Le reste (1 − m) suit votre choix : A le met en pool sans blocage ; B garde les TTTI-T correspondants dans votre portefeuille.",
  rowDust: "Reste d'arrondi",
  poolPriceHeading: "Prix du pool visé, avant et après le zap",
  priceBefore: "Avant",
  priceAfter: "Après",
  emptyPool: "Pool vide",
  consolidatedPriceHeading: "Prix consolidé (référence)",
  consolidatedPriceNote:
    "USD par TTTI-T : prix des autres pools ouverts, sans le pool ciblé, pondéré par leur profondeur.",
  poolPriceNote: "USD par TTTI-T dans le pool TTTI-T du jeton payé.",
  gapHeading: "Écart entre le prix du pool et le prix de référence",
  gapUnavailable: "Écart non disponible",
  noIndependentReference: "Aucune référence indépendante",
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
  successGuarantee: (amount: string) => `Réserve commune : ${amount}.`,
  successLink: "Voir mes positions de liquidité",
  errAnonymous: "Connectez-vous ou connectez un wallet pour frapper.",
  errRateUnavailable: (symbol: string) =>
    `Aucun taux ${symbol}/USD valide n'est disponible pour le moment. Rien n'a été prélevé. Réessayez plus tard.`,
  errBelowMinimum: (minimum: string, minimumUsd?: string) =>
    `Le minimum est de ${minimum}${minimumUsd ? ` (${minimumUsd})` : ""}.`,
  errTooManyDecimals: (max: string, step: string) =>
    `Un montant en TTTI-T a ${max} décimales au plus (plus petit pas : ${step}).`,
  errInvalidAmount: "Saisissez un montant supérieur à 0.",
  errAboveCap: (cap: string, remaining: string) =>
    `Le plafond total de ${cap} est atteint ou serait dépassé. Reste : ${remaining}.`,
  errInsufficientBalance: (symbol: string, required: string, balance: string) =>
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
  rateSourceMissing: "indisponible",
  errRateSourcesDiverge: (
    symbol: string,
    coinbase: string,
    coingecko: string,
    maxPercent: string,
  ) =>
    `La frappe a été refusée : les taux Coinbase et CoinGecko pour ${symbol} diffèrent de plus de ${maxPercent} % ou l'un d'eux est manquant. Coinbase : ${coinbase}. CoinGecko : ${coingecko}. Rien n'a été prélevé.`,
  errDexPaused: "Les pools sont en pause. La frappe est indisponible.",
  errPoolRemoved: (symbol: string) => `Le pool TTTI-T/${symbol} a été retiré.`,
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
};

export default fr;
