import type en from "./en";

const fr: typeof en = {
  title: "Enchère",
  intro:
    "Enchère scellée du TTTI-T rendu. Les offres sont fermes et restent cachées à tous, sauf à leur auteur. Chaque enchérisseur paie sa propre offre. Les offres les plus élevées l'emportent, par ordre de prix, jusqu'à ce que le lot soit vendu.",
  loading: "Chargement de l'enchère…",
  loadError: "L'enchère n'a pas pu être chargée.",
  retryButton: "Réessayer",
  summaryTitle: "Enchère ouverte",
  lotSize: "Taille du lot",
  closesAt: "Heure de clôture",
  timeLeft: "Temps restant",
  closingReached: "L'heure de clôture est atteinte.",
  reserveHeading: "Prix de réserve",
  reserveUsd: "Prix de réserve actuel par TTTI-T",
  reserveEquivalents:
    "Équivalent par TTTI-T dans chaque jeton de paiement au taux actuel",
  reserveRule:
    "Le prix de réserve est le plus élevé entre 10 000 USD par TTTI-T, la moyenne sur 24 heures du prix consolidé du TTTI-T et le prix consolidé actuel du TTTI-T. Aucune offre inférieure ne passe et rien n'est réémis en dessous de 10 000 USD : le lot reste dans le contrat.",
  componentsHeading: "Valeurs comparées",
  floorLabel: "Plancher fixe par TTTI-T",
  dailyAverageLabel: "Moyenne sur 24 heures du prix consolidé",
  currentLabel: "Prix consolidé actuel",
  appliedBadge: "Appliquée",
  bindingFloor:
    "Le plancher fixe est la valeur la plus haute et détermine le prix de réserve.",
  bindingDailyAverage:
    "La moyenne sur 24 heures est la valeur la plus haute et détermine le prix de réserve.",
  bindingConsolidated:
    "Le prix consolidé actuel est la valeur la plus haute et détermine le prix de réserve.",
  unavailableNote: "Une valeur non disponible est écartée de la comparaison.",
  reserveSettlementNote:
    "La part de marché du prix de réserve ne tient pas compte des variations de prix causées par la mise en pool des gagnants au règlement.",
  rateUnavailable: "Aucun taux pour le moment",
  consolidatedLabel: "Prix consolidé du TTTI-T",
  consolidatedUnavailable: "Non disponible",
  reserveBadge: "Réserve commune",
  reserveSentence:
    "10\u202f000 USD × q du dépôt de chaque gagnant vont à la réserve commune.",
  emptyTitle: "Aucune enchère n'est ouverte",
  emptyBody:
    "Une enchère dure 24 heures. Elle peut être ouverte lorsque du TTTI-T rendu attend dans un lot.",
  nextLot: "Prochain lot",
  nextLotNone: "Aucun TTTI-T rendu n'attend dans un lot.",
  openButton: "Ouvrir l'enchère",
  openingButton: "Ouverture…",
  openErrorAlreadyOpen: "Une enchère est déjà ouverte.",
  openErrorEmptyLot: "Il n'y a pas de TTTI-T rendu à mettre dans un lot.",
  openErrorPaused: "L'enchère est en pause.",
  openErrorUnexpected: "L'enchère n'a pas pu être ouverte. Réessayez.",
  formTitle: "Placer une offre",
  formIntro:
    "Une offre est ferme : elle ne peut être ni retirée ni modifiée. Le dépôt complet est prélevé au moment de l'offre.",
  tokenLegend: "Jeton de paiement",
  quantityLabel: "Quantité (TTTI-T)",
  quantityHint: (minimum: string) =>
    `Minimum ${minimum} TTTI-T, jusqu'à 8 décimales.`,
  priceLabel: (symbol: string) => `Prix par TTTI-T (${symbol})`,
  priceHint: "Prix dans le jeton choisi, pour un TTTI-T entier.",
  depositLabel: (symbol: string) => `Dépôt (${symbol}, facultatif)`,
  depositHint:
    "Laissez vide pour déposer le montant requis. Un dépôt supérieur au dépôt requis cache la taille du budget.",
  requiredDepositLabel: "Dépôt requis",
  requiredDepositFormula:
    "(prix + 10\u202f000 USD) × quantité ÷ 0,99, arrondi au supérieur",
  splitHeading:
    "Répartition du dépôt d'un gagnant au prix B pour q TTTI-T, avec la part bloquée m et le choix du reste A ou B",
  splitReserve: "Réserve commune (10\u202f000 USD × q)",
  splitPosition: "Position du gagnant au prix B (zap)",
  splitCreator: "Créateur (1 % du montant payé)",
  splitShare: "Part bloquée m",
  splitLocked: "Part bloquée (3 mois)",
  splitHand: "TTTI-T livrés au portefeuille",
  splitChoicePayment: (choice: string) =>
    `Paiement pour le choix ${choice} au m actuel`,
  splitShareNote:
    "m est pris au règlement : s'il change après ce devis, la valeur au règlement s'applique.",
  reserveKeptNote:
    "La part de réserve est conservée telle quelle dans le jeton payé.",
  depositSentLabel: "Dépôt envoyé",
  requiredDepositPending: "Saisissez une quantité et un prix.",
  errQuantity: "Saisissez une quantité avec 8 décimales au plus.",
  errQuantityMin: (minimum: string) =>
    `La quantité minimale est de ${minimum} TTTI-T.`,
  errPrice: (decimals: string) =>
    `Saisissez un prix supérieur à zéro avec ${decimals} décimales au plus.`,
  errDeposit: (decimals: string) =>
    `Saisissez un dépôt avec ${decimals} décimales au plus.`,
  errDepositBelow: (required: string) =>
    `Le dépôt ne peut pas être inférieur au dépôt requis (${required}).`,
  submitButton: "Placer l'offre",
  approvingButton: "En attente de la signature…",
  sendingButton: "Envoi de l'offre…",
  successMessage: "Offre enregistrée.",
  approvalFailed: (detail: string) =>
    `L'approbation n'a pas été signée : ${detail}`,
  unexpectedError: "L'offre n'a pas pu être envoyée. Réessayez.",
  signInPrompt: "Connectez-vous pour placer une offre.",
  blockSaleLabel: "Type de vente",
  blockSaleValue: "Vente en bloc",
  blockSaleBadge: "Vente en bloc",
  blockSaleRule:
    "Ce lot est une vente en bloc : le meilleur prix par TTTI-T l'emporte pour le lot entier. Le même prix de réserve s'applique ; une offre inférieure ne passe pas.",
  blockQuantityLabel: "Quantité (lot entier, TTTI-T)",
  blockQuantityHint: (lot: string) =>
    `La quantité est le lot entier : ${lot} TTTI-T. Elle est fixe.`,
  blockPriceHint:
    "Un seul prix par TTTI-T, pour le lot entier. Le meilleur prix l'emporte pour le lot entier.",
  bidErrWholeLot: (lot: string) =>
    `Ce lot est une vente en bloc. L'offre doit porter sur le lot entier : ${lot} TTTI-T.`,
  lotRemainderLabel: "Reste du mint dans le lot",
  lotRemainderNote:
    "Le reste du mint fait partie du lot. Il n'est frappé qu'au règlement, pour le gagnant.",
  settleMinted: "TTTI-T frappés au règlement",
  outcomeMinted: (amount: string) => `Frappés au règlement : ${amount} TTTI-T`,
  mintEndedBadge: "Mint terminé",
  mintEndedTitle: "Le mint est terminé",
  mintEndedBody: (remainder: string) =>
    `Le reste de ${remainder} TTTI-T rejoint le premier lot d'enchère. Il n'est frappé qu'au règlement, pour le gagnant.`,
  mintErrEnded:
    "Le mint est terminé. Le reste rejoint le premier lot d'enchère et n'est frappé qu'au règlement, pour le gagnant.",
  bidErrTooMany: (maximum: string) =>
    `Le maximum de ${maximum} offres par personne est atteint.`,
  bidErrInsufficientFunds: (balance: string, required: string) =>
    `Fonds insuffisants : solde ${balance}, requis ${required}.`,
  bidErrQuantityBelow: (minimum: string) =>
    `La quantité est inférieure au minimum de ${minimum} TTTI-T.`,
  bidErrInvalidPrice: "Le prix doit être supérieur à zéro.",
  bidErrAnonymous: "Connectez-vous pour placer une offre.",
  bidErrLedger: (detail: string) => `Erreur du ledger : ${detail}`,
  bidErrAllowance: (required: string, allowance: string) =>
    `L'approbation est trop basse : requis ${required}, approuvé ${allowance}.`,
  bidErrRateUnavailable: (symbol: string) =>
    `Aucun taux ${symbol}/USD valide n'est disponible pour le moment. L'offre n'a pas été placée. Réessayez plus tard.`,
  bidErrNoOpen: "Aucune enchère n'est ouverte.",
  bidErrInProgress: "Une autre de vos offres est en cours de traitement.",
  bidErrDepositBelow: (deposited: string, required: string) =>
    `Le dépôt (${deposited}) est inférieur au dépôt requis (${required}).`,
  bidErrPaused: "Les offres sont en pause.",
  bidErrPriceBelowMinimum: (minimum: string) =>
    `Le prix est inférieur au minimum de ${minimum} par TTTI-T au taux actuel.`,
  bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
    `Le prix proposé (${bid} par TTTI-T) est inférieur au minimum de ${minimum} par TTTI-T au taux actuel.`,
  bidErrDepositBelowFee: (fee: string, deposited: string) =>
    `Le dépôt (${deposited}) doit couvrir au moins les frais du ledger (${fee}).`,
  priceMinimumHint: (minimum: string) =>
    `Prix minimum : ${minimum} par TTTI-T au taux actuel.`,
  myOffersTitle: "Mes offres",
  privacyNote: "Les offres ne sont visibles que par leur auteur.",
  firmNote: "Les offres sont fermes : cette liste est en lecture seule.",
  offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
  myOffersEmpty: "Vous n'avez aucune offre dans cette enchère.",
  colQuantity: "Quantité (TTTI-T)",
  colPrice: "Prix par TTTI-T",
  colToken: "Jeton",
  colDeposit: "Dépôt",
  colDate: "Date",
  closingPendingNotice:
    "L'heure de clôture est passée. La clôture attend un taux valide. Les offres des autres personnes restent cachées jusqu'à la clôture.",
  closedTitle: "Enchères clôturées",
  closedIntro:
    "Les plus récentes d'abord. Après la clôture, le résultat et toutes les offres sont publiés.",
  closedEmpty: "Aucune enchère n'a encore été clôturée.",
  closedItemLabel: (id: string, date: string) =>
    `Enchère ${id} · clôturée le ${date}`,
  resultNotPublished: "Le résultat n'est pas encore publié.",
  resultStatusLabel: "Statut",
  statusFullySold: "Entièrement vendu",
  statusPartiallySold: "Partiellement vendu",
  statusUnsold: "Invendu",
  resultServedLabel: "Quantité servie",
  resultCarriedLabel: "Reportée au lot suivant",
  resultOffersLabel: "Offres reçues",
  resultClosedAtLabel: "Clôturée le",
  resultReserveHeading: "Réserve appliquée",
  resultReserveLabel: "Réserve appliquée par TTTI-T",
  resultRatesHeading: "Taux utilisés à la clôture",
  offersHeading: "Offres publiées",
  offersEmpty: "Aucune offre n'a été placée dans cette enchère.",
  colBidder: "Enchérisseur",
  colOutcome: "Issue",
  colServed: "Quantité servie",
  colReturned: "Montant rendu",
  colAuction: "Enchère",
  youBadge: "Vous",
  outcomeServed: "Servie",
  outcomePartiallyServed: "Servie en partie",
  outcomeNotServed: "Non servie",
  outcomeDiscarded: "Écartée sous la réserve",
  outcomePending: "En attente de clôture",
  outcomeDetail: (served: string, returned: string) =>
    `Servi ${served} TTTI-T · rendu ${returned}`,
  outcomeReturnedOnly: (returned: string) => `Rendu ${returned}`,
  balanceTitle: "Mon solde",
  balanceNote:
    "Les dépôts des quantités servies attendent leur règlement. Les offres non servies, les parties non servies, l'excédent des dépôts et les dépôts des règlements échoués sont rendus à votre solde DEX.",
  balanceEmpty: "Aucun montant n'est enregistré pour votre compte.",
  colAwaiting: "En attente de règlement",
  colReturnedBalance: "Rendu au solde",
  balanceRecoverNote:
    "Les montants rendus sont dans votre solde DEX. Utilisez-y le bouton Récupérer pour les retirer. La part de réserve d'un gagnant reste dans la réserve commune.",
  balanceRecoverLink: "Ouvrir le solde DEX",
  balanceFailedNote: (count: string) =>
    `Le règlement de ${count} de vos offres gagnantes a échoué : le dépôt entier a été rendu à votre solde DEX et la quantité a été reportée au lot suivant.`,
  colSettlement: "Règlement",
  settlementPending: "En attente",
  settlementSettled: "Réglé",
  settlementFailed: "Échoué",
  settlementNotRequired: "Non requis",
  settlementFailedCarried: (carried: string) =>
    `${carried} TTTI-T reportés au lot suivant`,
  settlementSummaryLabel: "Règlement des gagnants",
  settlementSummary: (settled: string, pending: string, failed: string) =>
    `${settled} réglés · ${pending} en attente · ${failed} échoués`,
  settlementFailedCarriedLabel:
    "Reporté au lot suivant après des règlements échoués",
  settlementHeading: "Règlement des gagnants",
  settlementRule:
    "Pour une quantité servie q au prix B, le gagnant paie (B + 10\u202f000 USD) × q ÷ 0,99, prélevé sur le dépôt. 10\u202f000 USD × q vont à la réserve commune, B × q et les q TTTI-T vont à la position du gagnant (zap), et 1 % du montant payé va au créateur. La part de réserve est calculée en USD et détenue dans le jeton payé (ICP, ckBTC, ckUSDC ou ckUSDT), sans conversion. Le reste du dépôt est rendu au solde DEX. Si le règlement d'un gagnant échoue, aucune position n'est créée et rien n'est versé à la réserve commune, le dépôt entier est rendu au solde DEX et la quantité est reportée au lot suivant. Les autres gagnants ne sont pas touchés.",
  settleTaken: "Montant prélevé sur le dépôt",
  settleCreator: "Part du créateur (1 %)",
  settlePosition: "Position",
  settlePositionValue: (amount: string, quantity: string) =>
    `${amount} avec ${quantity} TTTI-T`,
  settleReserve: "Réserve commune",
  settleSurplus: "Excédent du dépôt rendu au solde DEX",
  settleNoPosition: "Position et part de réserve",
  settleNone: "Aucune",
  settleDepositReturned: "Dépôt entier rendu au solde DEX",
  settleCarried: "Quantité reportée au lot suivant",
  settleFailureReason: "Motif",
};

export default fr;
