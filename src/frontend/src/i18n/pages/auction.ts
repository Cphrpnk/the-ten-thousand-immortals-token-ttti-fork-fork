import { defineDict } from "../core/dict";

/**
 * Auction page (sealed-bid auction of the returned TTTI-T): summary, empty
 * state, offer form and the caller's own offers. English is authoritative;
 * the sentence "In case of conflict, the English version prevails." comes
 * from SITE_TEXT. Amounts, prices, times and token symbols are passed in
 * already formatted and never translated.
 */
export const AUCTION_TEXT = defineDict({
  en: {
    title: "Auction",
    intro:
      "Sealed-bid auction of the returned TTTI-T. Offers are firm and stay hidden from everyone except their author. Each bidder pays their own bid. The highest bids win, in price order, until the lot is sold.",
    loading: "Loading the auction…",
    loadError: "The auction could not be loaded.",
    retryButton: "Retry",
    // Summary
    summaryTitle: "Open auction",
    lotSize: "Lot size",
    closesAt: "Closing time",
    timeLeft: "Time left",
    closingReached: "The closing time has been reached.",
    reserveHeading: "Reserve price",
    reserveUsd: "Current reserve price per TTTI-T",
    reserveEquivalents:
      "Equivalent per TTTI-T in each payment token at the current rate",
    reserveRule:
      "The reserve price is the highest of 10,000 USD per TTTI-T, the 24-hour average of the consolidated TTTI-T price and the current consolidated TTTI-T price. No offer below it passes and nothing is reissued below 10,000 USD: the lot stays in the contract.",
    componentsHeading: "Values compared",
    floorLabel: "Fixed floor per TTTI-T",
    dailyAverageLabel: "24-hour average of the consolidated price",
    currentLabel: "Current consolidated price",
    appliedBadge: "Applied",
    bindingFloor:
      "The fixed floor is the highest value and sets the reserve price.",
    bindingDailyAverage:
      "The 24-hour average is the highest value and sets the reserve price.",
    bindingConsolidated:
      "The current consolidated price is the highest value and sets the reserve price.",
    unavailableNote:
      "A value that is not available is left out of the comparison.",
    rateUnavailable: "No rate at the moment",
    consolidatedLabel: "Consolidated TTTI-T price",
    consolidatedUnavailable: "Not available",
    recoverableBadge: "Recoverable guarantee",
    recoverableSentence: "The deposit is a recoverable guarantee.",
    // Empty state
    emptyTitle: "No auction is open",
    emptyBody:
      "An auction lasts 24 hours. It can be opened when returned TTTI-T is waiting in a lot.",
    nextLot: "Next lot",
    nextLotNone: "No returned TTTI-T is waiting for a lot.",
    openButton: "Open the auction",
    openingButton: "Opening…",
    openErrorAlreadyOpen: "An auction is already open.",
    openErrorEmptyLot: "There is no returned TTTI-T to put in a lot.",
    openErrorPaused: "The auction is paused.",
    openErrorUnexpected: "The auction could not be opened. Try again.",
    // Offer form
    formTitle: "Place an offer",
    formIntro:
      "An offer is firm: it cannot be withdrawn or modified. The full deposit is taken when the offer is placed.",
    tokenLegend: "Payment token",
    quantityLabel: "Quantity (TTTI-T)",
    quantityHint: (minimum: string) =>
      `Minimum ${minimum} TTTI-T, up to 8 decimals.`,
    priceLabel: (symbol: string) => `Price per TTTI-T (${symbol})`,
    priceHint: "Price in the token chosen, for one whole TTTI-T.",
    depositLabel: (symbol: string) => `Deposit (${symbol}, optional)`,
    depositHint:
      "Leave empty to deposit the required amount. A deposit larger than the required one hides the size of the budget.",
    requiredDepositLabel: "Required deposit",
    requiredDepositFormula: "2 × price × quantity ÷ 0.99, rounded up",
    depositSentLabel: "Deposit sent",
    requiredDepositPending: "Enter a quantity and a price.",
    errQuantity: "Enter a quantity with at most 8 decimals.",
    errQuantityMin: (minimum: string) =>
      `The minimum quantity is ${minimum} TTTI-T.`,
    errPrice: (decimals: string) =>
      `Enter a price greater than zero with at most ${decimals} decimals.`,
    errDeposit: (decimals: string) =>
      `Enter a deposit with at most ${decimals} decimals.`,
    errDepositBelow: (required: string) =>
      `The deposit cannot be below the required deposit (${required}).`,
    submitButton: "Place the offer",
    approvingButton: "Waiting for the signature…",
    sendingButton: "Sending the offer…",
    successMessage: "Offer recorded.",
    approvalFailed: (detail: string) =>
      `The approval was not signed: ${detail}`,
    unexpectedError: "The offer could not be sent. Try again.",
    signInPrompt: "Sign in to place an offer.",
    // Block sale
    blockSaleLabel: "Sale type",
    blockSaleValue: "Block sale",
    blockSaleBadge: "Block sale",
    blockSaleRule:
      "This lot is a block sale: the best price per TTTI-T wins the whole lot. The same reserve price applies; an offer below it does not pass.",
    blockQuantityLabel: "Quantity (whole lot, TTTI-T)",
    blockQuantityHint: (lot: string) =>
      `The quantity is the entire lot: ${lot} TTTI-T. It is fixed.`,
    blockPriceHint:
      "One price per TTTI-T, for the whole lot. The best price wins the whole lot.",
    bidErrWholeLot: (lot: string) =>
      `This lot is a block sale. An offer must be for the whole lot: ${lot} TTTI-T.`,
    lotRemainderLabel: "Mint remainder in the lot",
    lotRemainderNote:
      "The mint remainder is part of the lot. It is minted only at settlement, for the winner.",
    settleMinted: "TTTI-T minted at settlement",
    outcomeMinted: (amount: string) => `Minted at settlement: ${amount} TTTI-T`,
    // End of mint
    mintEndedBadge: "Mint over",
    mintEndedTitle: "The mint is over",
    mintEndedBody: (remainder: string) =>
      `The remainder of ${remainder} TTTI-T joins the first auction lot. It is minted only at settlement, for the winner.`,
    mintErrEnded:
      "The mint is over. The remainder joins the first auction lot and is minted only at settlement, for the winner.",
    // Bid errors
    bidErrTooMany: (maximum: string) =>
      `The maximum of ${maximum} offers per person is reached.`,
    bidErrInsufficientFunds: (balance: string, required: string) =>
      `Insufficient funds: balance ${balance}, required ${required}.`,
    bidErrQuantityBelow: (minimum: string) =>
      `The quantity is below the minimum of ${minimum} TTTI-T.`,
    bidErrInvalidPrice: "The price must be greater than zero.",
    bidErrAnonymous: "Sign in to place an offer.",
    bidErrLedger: (detail: string) => `Ledger error: ${detail}`,
    bidErrAllowance: (required: string, allowance: string) =>
      `The approval is too low: required ${required}, approved ${allowance}.`,
    bidErrNoOpen: "No auction is open.",
    bidErrInProgress: "Another offer of yours is being processed.",
    bidErrDepositBelow: (deposited: string, required: string) =>
      `The deposit (${deposited}) is below the required deposit (${required}).`,
    bidErrPaused: "Offers are paused.",
    bidErrPriceBelowMinimum: (minimum: string) =>
      `The price is below the minimum of ${minimum} per TTTI-T at the current rate.`,
    bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
      `The offered price (${bid} per TTTI-T) is below the minimum of ${minimum} per TTTI-T at the current rate.`,
    bidErrDepositBelowFee: (fee: string, deposited: string) =>
      `The deposit (${deposited}) must cover at least the ledger fee (${fee}).`,
    priceMinimumHint: (minimum: string) =>
      `Minimum price: ${minimum} per TTTI-T at the current rate.`,
    // Own offers
    myOffersTitle: "My offers",
    privacyNote: "Offers are visible only to their author.",
    firmNote: "Offers are firm: this list is read-only.",
    offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
    myOffersEmpty: "You have no offer in this auction.",
    colQuantity: "Quantity (TTTI-T)",
    colPrice: "Price per TTTI-T",
    colToken: "Token",
    colDeposit: "Deposit",
    colDate: "Date",
    // Closing (PTM-6b)
    closingPendingNotice:
      "The closing time has passed. Closing waits for a valid rate. Offers of other people stay hidden until closing.",
    closedTitle: "Closed auctions",
    closedIntro:
      "Newest first. After closing, the result and all offers are published.",
    closedEmpty: "No auction has been closed yet.",
    closedItemLabel: (id: string, date: string) =>
      `Auction ${id} · closed ${date}`,
    resultNotPublished: "The result is not published yet.",
    resultStatusLabel: "Status",
    statusFullySold: "Fully sold",
    statusPartiallySold: "Partially sold",
    statusUnsold: "Unsold",
    resultServedLabel: "Quantity served",
    resultCarriedLabel: "Carried over to the next lot",
    resultOffersLabel: "Offers received",
    resultClosedAtLabel: "Closed at",
    resultReserveHeading: "Reserve applied",
    resultReserveLabel: "Reserve applied per TTTI-T",
    resultRatesHeading: "Rates used at closing",
    offersHeading: "Published offers",
    offersEmpty: "No offer was placed in this auction.",
    colBidder: "Bidder",
    colOutcome: "Outcome",
    colServed: "Served quantity",
    colReturned: "Amount returned",
    colAuction: "Auction",
    youBadge: "You",
    outcomeServed: "Served",
    outcomePartiallyServed: "Partially served",
    outcomeNotServed: "Not served",
    outcomeDiscarded: "Discarded below reserve",
    outcomePending: "Awaiting closing",
    outcomeDetail: (served: string, returned: string) =>
      `Served ${served} TTTI-T · returned ${returned}`,
    outcomeReturnedOnly: (returned: string) => `Returned ${returned}`,
    balanceTitle: "My balance",
    balanceNote:
      "Deposits of served quantities are awaiting settlement. Unserved offers, unserved parts, deposit excess and deposits of failed settlements are returned to your DEX balance.",
    balanceEmpty: "No amount is recorded for your account.",
    colAwaiting: "Awaiting settlement",
    colReturnedBalance: "Returned to the balance",
    balanceRecoverNote:
      "Returned amounts are in your DEX balance. Use the Recover button there to withdraw them.",
    balanceRecoverLink: "Open the DEX balance",
    balanceFailedNote: (count: string) =>
      `The settlement of ${count} of your winning offers failed: the whole deposit was returned to your DEX balance and the quantity was carried to the next lot.`,
    // Settlement of winners (PTM-6c)
    colSettlement: "Settlement",
    settlementPending: "Pending",
    settlementSettled: "Settled",
    settlementFailed: "Failed",
    settlementNotRequired: "Not required",
    settlementFailedCarried: (carried: string) =>
      `${carried} TTTI-T carried to the next lot`,
    settlementSummaryLabel: "Settlement of winners",
    settlementSummary: (settled: string, pending: string, failed: string) =>
      `${settled} settled · ${pending} pending · ${failed} failed`,
    settlementFailedCarriedLabel:
      "Carried to the next lot after failed settlements",
    settlementHeading: "Settlement of winners",
    settlementRule:
      "For a served quantity q at price B, 2 × B × q ÷ 0.99 is taken from the deposit and 1 % of it goes to the creator. A position of B × q holds q TTTI-T, and a guarantee of B per TTTI-T is set in the paid token. The rest of the deposit is returned to the DEX balance. If the settlement of a winner fails, no position or guarantee is created, the whole deposit is returned to the DEX balance and the quantity is carried to the next lot. Other winners are not affected.",
    settleTaken: "Amount taken from the deposit",
    settleCreator: "Creator share (1 %)",
    settlePosition: "Position",
    settlePositionValue: (amount: string, quantity: string) =>
      `${amount} with ${quantity} TTTI-T`,
    settleGuarantee: "Guarantee",
    settleSurplus: "Deposit surplus returned to the DEX balance",
    settleNoPosition: "Position and guarantee",
    settleNone: "None",
    settleDepositReturned: "Whole deposit returned to the DEX balance",
    settleCarried: "Quantity carried to the next lot",
    settleFailureReason: "Reason",
  },
  fr: {
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
    rateUnavailable: "Aucun taux pour le moment",
    consolidatedLabel: "Prix consolidé du TTTI-T",
    consolidatedUnavailable: "Non disponible",
    recoverableBadge: "Garantie récupérable",
    recoverableSentence: "Le dépôt est une garantie récupérable.",
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
    requiredDepositFormula: "2 × prix × quantité ÷ 0,99, arrondi au supérieur",
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
    outcomeMinted: (amount: string) =>
      `Frappés au règlement : ${amount} TTTI-T`,
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
      "Les montants rendus sont dans votre solde DEX. Utilisez-y le bouton Récupérer pour les retirer.",
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
      "Pour une quantité servie q au prix B, 2 × B × q ÷ 0,99 est prélevé sur le dépôt et 1 % de ce montant va au créateur. Une position de B × q contient q TTTI-T, et une garantie de B par TTTI-T est constituée dans le jeton payé. Le reste du dépôt est rendu au solde DEX. Si le règlement d'un gagnant échoue, aucune position ni garantie n'est créée, le dépôt entier est rendu au solde DEX et la quantité est reportée au lot suivant. Les autres gagnants ne sont pas touchés.",
    settleTaken: "Montant prélevé sur le dépôt",
    settleCreator: "Part du créateur (1 %)",
    settlePosition: "Position",
    settlePositionValue: (amount: string, quantity: string) =>
      `${amount} avec ${quantity} TTTI-T`,
    settleGuarantee: "Garantie",
    settleSurplus: "Excédent du dépôt rendu au solde DEX",
    settleNoPosition: "Position et garantie",
    settleNone: "Aucune",
    settleDepositReturned: "Dépôt entier rendu au solde DEX",
    settleCarried: "Quantité reportée au lot suivant",
    settleFailureReason: "Motif",
  },
  es: {
    title: "Subasta",
    intro:
      "Subasta con ofertas selladas del TTTI-T devuelto. Las ofertas son firmes y permanecen ocultas para todos, salvo para su autor. Cada postor paga su propia oferta. Ganan las ofertas más altas, por orden de precio, hasta que se venda el lote.",
    loading: "Cargando la subasta…",
    loadError: "No se pudo cargar la subasta.",
    retryButton: "Reintentar",
    summaryTitle: "Subasta abierta",
    lotSize: "Tamaño del lote",
    closesAt: "Hora de cierre",
    timeLeft: "Tiempo restante",
    closingReached: "Se alcanzó la hora de cierre.",
    reserveHeading: "Precio de reserva",
    reserveUsd: "Precio de reserva actual por TTTI-T",
    reserveEquivalents:
      "Equivalente por TTTI-T en cada token de pago a la tasa actual",
    reserveRule:
      "El precio de reserva es el más alto entre 10 000 USD por TTTI-T, el promedio de 24 horas del precio consolidado del TTTI-T y el precio consolidado actual del TTTI-T. Ninguna oferta inferior pasa y no se reemite nada por debajo de 10 000 USD: el lote permanece en el contrato.",
    componentsHeading: "Valores comparados",
    floorLabel: "Piso fijo por TTTI-T",
    dailyAverageLabel: "Promedio de 24 horas del precio consolidado",
    currentLabel: "Precio consolidado actual",
    appliedBadge: "Aplicado",
    bindingFloor:
      "El piso fijo es el valor más alto y determina el precio de reserva.",
    bindingDailyAverage:
      "El promedio de 24 horas es el valor más alto y determina el precio de reserva.",
    bindingConsolidated:
      "El precio consolidado actual es el valor más alto y determina el precio de reserva.",
    unavailableNote:
      "Un valor que no está disponible se excluye de la comparación.",
    rateUnavailable: "Sin tasa por el momento",
    consolidatedLabel: "Precio consolidado del TTTI-T",
    consolidatedUnavailable: "No disponible",
    recoverableBadge: "Garantía recuperable",
    recoverableSentence: "El depósito es una garantía recuperable.",
    emptyTitle: "No hay ninguna subasta abierta",
    emptyBody:
      "Una subasta dura 24 horas. Puede abrirse cuando hay TTTI-T devuelto esperando en un lote.",
    nextLot: "Próximo lote",
    nextLotNone: "No hay TTTI-T devuelto esperando en un lote.",
    openButton: "Abrir la subasta",
    openingButton: "Abriendo…",
    openErrorAlreadyOpen: "Ya hay una subasta abierta.",
    openErrorEmptyLot: "No hay TTTI-T devuelto para poner en un lote.",
    openErrorPaused: "La subasta está en pausa.",
    openErrorUnexpected: "No se pudo abrir la subasta. Inténtelo de nuevo.",
    formTitle: "Hacer una oferta",
    formIntro:
      "Una oferta es firme: no se puede retirar ni modificar. El depósito completo se cobra al hacer la oferta.",
    tokenLegend: "Token de pago",
    quantityLabel: "Cantidad (TTTI-T)",
    quantityHint: (minimum: string) =>
      `Mínimo ${minimum} TTTI-T, hasta 8 decimales.`,
    priceLabel: (symbol: string) => `Precio por TTTI-T (${symbol})`,
    priceHint: "Precio en el token elegido, por un TTTI-T entero.",
    depositLabel: (symbol: string) => `Depósito (${symbol}, opcional)`,
    depositHint:
      "Déjelo vacío para depositar el importe requerido. Un depósito mayor que el requerido oculta el tamaño del presupuesto.",
    requiredDepositLabel: "Depósito requerido",
    requiredDepositFormula:
      "2 × precio × cantidad ÷ 0,99, redondeado hacia arriba",
    depositSentLabel: "Depósito enviado",
    requiredDepositPending: "Introduzca una cantidad y un precio.",
    errQuantity: "Introduzca una cantidad con 8 decimales como máximo.",
    errQuantityMin: (minimum: string) =>
      `La cantidad mínima es ${minimum} TTTI-T.`,
    errPrice: (decimals: string) =>
      `Introduzca un precio mayor que cero con ${decimals} decimales como máximo.`,
    errDeposit: (decimals: string) =>
      `Introduzca un depósito con ${decimals} decimales como máximo.`,
    errDepositBelow: (required: string) =>
      `El depósito no puede ser inferior al depósito requerido (${required}).`,
    submitButton: "Hacer la oferta",
    approvingButton: "Esperando la firma…",
    sendingButton: "Enviando la oferta…",
    successMessage: "Oferta registrada.",
    approvalFailed: (detail: string) => `La aprobación no se firmó: ${detail}`,
    unexpectedError: "No se pudo enviar la oferta. Inténtelo de nuevo.",
    signInPrompt: "Inicie sesión para hacer una oferta.",
    blockSaleLabel: "Tipo de venta",
    blockSaleValue: "Venta en bloque",
    blockSaleBadge: "Venta en bloque",
    blockSaleRule:
      "Este lote es una venta en bloque: el mejor precio por TTTI-T gana el lote completo. Se aplica el mismo precio de reserva; una oferta inferior no pasa.",
    blockQuantityLabel: "Cantidad (lote completo, TTTI-T)",
    blockQuantityHint: (lot: string) =>
      `La cantidad es el lote completo: ${lot} TTTI-T. Es fija.`,
    blockPriceHint:
      "Un solo precio por TTTI-T, para el lote completo. El mejor precio gana el lote completo.",
    bidErrWholeLot: (lot: string) =>
      `Este lote es una venta en bloque. La oferta debe ser por el lote completo: ${lot} TTTI-T.`,
    lotRemainderLabel: "Resto del mint en el lote",
    lotRemainderNote:
      "El resto del mint forma parte del lote. Solo se acuña en la liquidación, para el ganador.",
    settleMinted: "TTTI-T acuñados en la liquidación",
    outcomeMinted: (amount: string) =>
      `Acuñados en la liquidación: ${amount} TTTI-T`,
    mintEndedBadge: "Mint finalizado",
    mintEndedTitle: "El mint ha finalizado",
    mintEndedBody: (remainder: string) =>
      `El resto de ${remainder} TTTI-T se une al primer lote de la subasta. Solo se acuña en la liquidación, para el ganador.`,
    mintErrEnded:
      "El mint ha finalizado. El resto se une al primer lote de la subasta y solo se acuña en la liquidación, para el ganador.",
    bidErrTooMany: (maximum: string) =>
      `Se alcanzó el máximo de ${maximum} ofertas por persona.`,
    bidErrInsufficientFunds: (balance: string, required: string) =>
      `Fondos insuficientes: saldo ${balance}, requerido ${required}.`,
    bidErrQuantityBelow: (minimum: string) =>
      `La cantidad es inferior al mínimo de ${minimum} TTTI-T.`,
    bidErrInvalidPrice: "El precio debe ser mayor que cero.",
    bidErrAnonymous: "Inicie sesión para hacer una oferta.",
    bidErrLedger: (detail: string) => `Error del ledger: ${detail}`,
    bidErrAllowance: (required: string, allowance: string) =>
      `La aprobación es demasiado baja: requerido ${required}, aprobado ${allowance}.`,
    bidErrNoOpen: "No hay ninguna subasta abierta.",
    bidErrInProgress: "Otra oferta suya se está procesando.",
    bidErrDepositBelow: (deposited: string, required: string) =>
      `El depósito (${deposited}) es inferior al depósito requerido (${required}).`,
    bidErrPaused: "Las ofertas están en pausa.",
    bidErrPriceBelowMinimum: (minimum: string) =>
      `El precio es inferior al mínimo de ${minimum} por TTTI-T al tipo actual.`,
    bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
      `El precio ofrecido (${bid} por TTTI-T) es inferior al mínimo de ${minimum} por TTTI-T al tipo actual.`,
    bidErrDepositBelowFee: (fee: string, deposited: string) =>
      `El depósito (${deposited}) debe cubrir al menos la comisión del ledger (${fee}).`,
    priceMinimumHint: (minimum: string) =>
      `Precio mínimo: ${minimum} por TTTI-T al tipo actual.`,
    myOffersTitle: "Mis ofertas",
    privacyNote: "Las ofertas solo las ve su autor.",
    firmNote: "Las ofertas son firmes: esta lista es de solo lectura.",
    offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
    myOffersEmpty: "No tiene ninguna oferta en esta subasta.",
    colQuantity: "Cantidad (TTTI-T)",
    colPrice: "Precio por TTTI-T",
    colToken: "Token",
    colDeposit: "Depósito",
    colDate: "Fecha",
    closingPendingNotice:
      "Ha pasado la hora de cierre. El cierre espera una tasa válida. Las ofertas de otras personas permanecen ocultas hasta el cierre.",
    closedTitle: "Subastas cerradas",
    closedIntro:
      "Las más recientes primero. Tras el cierre se publican el resultado y todas las ofertas.",
    closedEmpty: "Todavía no se ha cerrado ninguna subasta.",
    closedItemLabel: (id: string, date: string) =>
      `Subasta ${id} · cerrada el ${date}`,
    resultNotPublished: "El resultado todavía no está publicado.",
    resultStatusLabel: "Estado",
    statusFullySold: "Vendido por completo",
    statusPartiallySold: "Vendido en parte",
    statusUnsold: "No vendido",
    resultServedLabel: "Cantidad atendida",
    resultCarriedLabel: "Trasladada al lote siguiente",
    resultOffersLabel: "Ofertas recibidas",
    resultClosedAtLabel: "Cerrada el",
    resultReserveHeading: "Reserva aplicada",
    resultReserveLabel: "Reserva aplicada por TTTI-T",
    resultRatesHeading: "Tasas usadas en el cierre",
    offersHeading: "Ofertas publicadas",
    offersEmpty: "No se hizo ninguna oferta en esta subasta.",
    colBidder: "Ofertante",
    colOutcome: "Resultado",
    colServed: "Cantidad atendida",
    colReturned: "Importe devuelto",
    colAuction: "Subasta",
    youBadge: "Usted",
    outcomeServed: "Atendida",
    outcomePartiallyServed: "Atendida en parte",
    outcomeNotServed: "No atendida",
    outcomeDiscarded: "Descartada por debajo de la reserva",
    outcomePending: "Pendiente de cierre",
    outcomeDetail: (served: string, returned: string) =>
      `Atendido ${served} TTTI-T · devuelto ${returned}`,
    outcomeReturnedOnly: (returned: string) => `Devuelto ${returned}`,
    balanceTitle: "Mi saldo",
    balanceNote:
      "Los depósitos de las cantidades atendidas esperan su liquidación. Las ofertas no atendidas, las partes no atendidas, el exceso de los depósitos y los depósitos de las liquidaciones fallidas se devuelven a su saldo DEX.",
    balanceEmpty: "No hay ningún importe registrado para su cuenta.",
    colAwaiting: "Pendiente de liquidación",
    colReturnedBalance: "Devuelto al saldo",
    balanceRecoverNote:
      "Los importes devueltos están en su saldo DEX. Use allí el botón Recuperar para retirarlos.",
    balanceRecoverLink: "Abrir el saldo DEX",
    balanceFailedNote: (count: string) =>
      `La liquidación de ${count} de sus ofertas ganadoras falló: el depósito completo se devolvió a su saldo DEX y la cantidad pasó al lote siguiente.`,
    colSettlement: "Liquidación",
    settlementPending: "Pendiente",
    settlementSettled: "Liquidada",
    settlementFailed: "Fallida",
    settlementNotRequired: "No requerida",
    settlementFailedCarried: (carried: string) =>
      `${carried} TTTI-T pasan al lote siguiente`,
    settlementSummaryLabel: "Liquidación de los ganadores",
    settlementSummary: (settled: string, pending: string, failed: string) =>
      `${settled} liquidadas · ${pending} pendientes · ${failed} fallidas`,
    settlementFailedCarriedLabel:
      "Pasa al lote siguiente tras liquidaciones fallidas",
    settlementHeading: "Liquidación de los ganadores",
    settlementRule:
      "Para una cantidad atendida q al precio B, se toman del depósito 2 × B × q ÷ 0,99 y el 1 % de ese importe va al creador. Una posición de B × q contiene q TTTI-T, y se constituye una garantía de B por TTTI-T en el token pagado. El resto del depósito se devuelve al saldo DEX. Si la liquidación de un ganador falla, no se crea ninguna posición ni garantía, el depósito completo se devuelve al saldo DEX y la cantidad pasa al lote siguiente. Los demás ganadores no se ven afectados.",
    settleTaken: "Importe tomado del depósito",
    settleCreator: "Parte del creador (1 %)",
    settlePosition: "Posición",
    settlePositionValue: (amount: string, quantity: string) =>
      `${amount} con ${quantity} TTTI-T`,
    settleGuarantee: "Garantía",
    settleSurplus: "Exceso del depósito devuelto al saldo DEX",
    settleNoPosition: "Posición y garantía",
    settleNone: "Ninguna",
    settleDepositReturned: "Depósito completo devuelto al saldo DEX",
    settleCarried: "Cantidad que pasa al lote siguiente",
    settleFailureReason: "Motivo",
  },
  "zh-Hans": {
    title: "拍卖",
    intro:
      "对已退回 TTTI-T 的密封出价拍卖。出价为最终出价，除出价人本人外，其他人均不可见。每位竞拍者支付自己的出价。出价最高的报价按价格顺序获胜，直至批次售出。",
    loading: "正在加载拍卖…",
    loadError: "无法加载拍卖。",
    retryButton: "重试",
    summaryTitle: "进行中的拍卖",
    lotSize: "标的数量",
    closesAt: "截止时间",
    timeLeft: "剩余时间",
    closingReached: "已到截止时间。",
    reserveHeading: "底价",
    reserveUsd: "每个 TTTI-T 的当前底价",
    reserveEquivalents: "按当前汇率，每个 TTTI-T 折合各支付代币的数额",
    reserveRule:
      "底价取以下三者中的最高值：每个 TTTI-T 10,000 USD、TTTI-T 综合价格的 24 小时平均值和 TTTI-T 当前综合价格。低于底价的出价不会通过，低于 10,000 USD 不会重新发行：该批次留在合约中。",
    componentsHeading: "参与比较的数值",
    floorLabel: "每个 TTTI-T 的固定下限",
    dailyAverageLabel: "综合价格的 24 小时平均值",
    currentLabel: "当前综合价格",
    appliedBadge: "已采用",
    bindingFloor: "固定下限为最高值，决定底价。",
    bindingDailyAverage: "24 小时平均值为最高值，决定底价。",
    bindingConsolidated: "当前综合价格为最高值，决定底价。",
    unavailableNote: "无法获得的数值不参与比较。",
    rateUnavailable: "暂无汇率",
    consolidatedLabel: "TTTI-T 综合价格",
    consolidatedUnavailable: "暂无",
    recoverableBadge: "可取回的担保金",
    recoverableSentence: "保证金是可取回的担保金。",
    emptyTitle: "目前没有进行中的拍卖",
    emptyBody:
      "拍卖持续 24 小时。当已退回的 TTTI-T 在一个标的中等待时，可以开启拍卖。",
    nextLot: "下一个标的",
    nextLotNone: "没有等待成为标的的已退回 TTTI-T。",
    openButton: "开启拍卖",
    openingButton: "正在开启…",
    openErrorAlreadyOpen: "已有一场拍卖正在进行。",
    openErrorEmptyLot: "没有可作为标的的已退回 TTTI-T。",
    openErrorPaused: "拍卖已暂停。",
    openErrorUnexpected: "无法开启拍卖。请重试。",
    formTitle: "提交出价",
    formIntro: "出价为最终出价：不能撤回或修改。提交出价时将收取全部保证金。",
    tokenLegend: "支付代币",
    quantityLabel: "数量（TTTI-T）",
    quantityHint: (minimum: string) =>
      `最少 ${minimum} TTTI-T，最多 8 位小数。`,
    priceLabel: (symbol: string) => `每个 TTTI-T 的价格（${symbol}）`,
    priceHint: "以所选代币计价，对应一个完整的 TTTI-T。",
    depositLabel: (symbol: string) => `保证金（${symbol}，可选）`,
    depositHint: "留空则存入所需金额。高于所需金额的保证金可隐藏预算的大小。",
    requiredDepositLabel: "所需保证金",
    requiredDepositFormula: "2 × 价格 × 数量 ÷ 0.99，向上取整",
    depositSentLabel: "已存入的保证金",
    requiredDepositPending: "请输入数量和价格。",
    errQuantity: "请输入最多 8 位小数的数量。",
    errQuantityMin: (minimum: string) => `最小数量为 ${minimum} TTTI-T。`,
    errPrice: (decimals: string) =>
      `请输入大于零且最多 ${decimals} 位小数的价格。`,
    errDeposit: (decimals: string) => `请输入最多 ${decimals} 位小数的保证金。`,
    errDepositBelow: (required: string) =>
      `保证金不能低于所需保证金（${required}）。`,
    submitButton: "提交出价",
    approvingButton: "等待签名…",
    sendingButton: "正在发送出价…",
    successMessage: "出价已记录。",
    approvalFailed: (detail: string) => `授权未签名：${detail}`,
    unexpectedError: "无法发送出价。请重试。",
    signInPrompt: "请登录后提交出价。",
    blockSaleLabel: "出售方式",
    blockSaleValue: "整批出售",
    blockSaleBadge: "整批出售",
    blockSaleRule:
      "该批次整批出售：每个 TTTI-T 的最高价格获得整个批次。适用相同的底价；低于底价的出价不会通过。",
    blockQuantityLabel: "数量（整个批次，TTTI-T）",
    blockQuantityHint: (lot: string) =>
      `数量为整个批次：${lot} TTTI-T，不可更改。`,
    blockPriceHint: "整个批次只有一个每 TTTI-T 的价格。最高价格获得整个批次。",
    bidErrWholeLot: (lot: string) =>
      `该批次为整批出售。出价必须针对整个批次：${lot} TTTI-T。`,
    lotRemainderLabel: "批次中的铸造余量",
    lotRemainderNote: "铸造余量属于该批次，仅在结算时为获胜者铸造。",
    settleMinted: "结算时铸造的 TTTI-T",
    outcomeMinted: (amount: string) => `结算时铸造：${amount} TTTI-T`,
    mintEndedBadge: "铸造已结束",
    mintEndedTitle: "铸造已结束",
    mintEndedBody: (remainder: string) =>
      `${remainder} TTTI-T 的余量并入第一个拍卖批次，仅在结算时为获胜者铸造。`,
    mintErrEnded:
      "铸造已结束。余量并入第一个拍卖批次，仅在结算时为获胜者铸造。",
    bidErrTooMany: (maximum: string) =>
      `已达到每人最多 ${maximum} 个出价的上限。`,
    bidErrInsufficientFunds: (balance: string, required: string) =>
      `资金不足：余额 ${balance}，需要 ${required}。`,
    bidErrQuantityBelow: (minimum: string) =>
      `数量低于最小值 ${minimum} TTTI-T。`,
    bidErrInvalidPrice: "价格必须大于零。",
    bidErrAnonymous: "请登录后提交出价。",
    bidErrLedger: (detail: string) => `账本错误：${detail}`,
    bidErrAllowance: (required: string, allowance: string) =>
      `授权额度过低：需要 ${required}，已授权 ${allowance}。`,
    bidErrNoOpen: "目前没有进行中的拍卖。",
    bidErrInProgress: "您的另一个出价正在处理中。",
    bidErrDepositBelow: (deposited: string, required: string) =>
      `保证金（${deposited}）低于所需保证金（${required}）。`,
    bidErrPaused: "出价已暂停。",
    bidErrPriceBelowMinimum: (minimum: string) =>
      `价格低于当前汇率下每个 TTTI-T 的最低价 ${minimum}。`,
    bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
      `出价（每个 TTTI-T ${bid}）低于当前汇率下每个 TTTI-T 的最低价 ${minimum}。`,
    bidErrDepositBelowFee: (fee: string, deposited: string) =>
      `保证金（${deposited}）必须至少覆盖账本手续费（${fee}）。`,
    priceMinimumHint: (minimum: string) =>
      `最低价格：当前汇率下每个 TTTI-T ${minimum}。`,
    myOffersTitle: "我的出价",
    privacyNote: "出价仅对其出价人可见。",
    firmNote: "出价为最终出价：此列表为只读。",
    offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
    myOffersEmpty: "您在本场拍卖中没有出价。",
    colQuantity: "数量（TTTI-T）",
    colPrice: "每个 TTTI-T 的价格",
    colToken: "代币",
    colDeposit: "保证金",
    colDate: "日期",
    closingPendingNotice:
      "截止时间已过。结算等待有效汇率。在结算前，其他人的出价保持隐藏。",
    closedTitle: "已结束的拍卖",
    closedIntro: "最新的在前。拍卖结束后，将公布结果和全部出价。",
    closedEmpty: "尚无已结束的拍卖。",
    closedItemLabel: (id: string, date: string) =>
      `拍卖 ${id} · 结束于 ${date}`,
    resultNotPublished: "结果尚未公布。",
    resultStatusLabel: "状态",
    statusFullySold: "全部售出",
    statusPartiallySold: "部分售出",
    statusUnsold: "未售出",
    resultServedLabel: "已成交数量",
    resultCarriedLabel: "转入下一个标的的数量",
    resultOffersLabel: "收到的出价",
    resultClosedAtLabel: "结束时间",
    resultReserveHeading: "采用的底价",
    resultReserveLabel: "每个 TTTI-T 采用的底价",
    resultRatesHeading: "结算时使用的汇率",
    offersHeading: "已公布的出价",
    offersEmpty: "本场拍卖没有出价。",
    colBidder: "出价人",
    colOutcome: "结果",
    colServed: "成交数量",
    colReturned: "退回金额",
    colAuction: "拍卖",
    youBadge: "您",
    outcomeServed: "已成交",
    outcomePartiallyServed: "部分成交",
    outcomeNotServed: "未成交",
    outcomeDiscarded: "低于底价，已剔除",
    outcomePending: "等待结算",
    outcomeDetail: (served: string, returned: string) =>
      `成交 ${served} TTTI-T · 退回 ${returned}`,
    outcomeReturnedOnly: (returned: string) => `退回 ${returned}`,
    balanceTitle: "我的余额",
    balanceNote:
      "已成交数量的保证金等待结算。未成交的出价、未成交的部分、超出的保证金以及结算失败的保证金将退回您的 DEX 余额。",
    balanceEmpty: "您的账户没有记录任何金额。",
    colAwaiting: "等待结算",
    colReturnedBalance: "退回余额",
    balanceRecoverNote:
      "退回的金额在您的 DEX 余额中。请使用该处的“取回”按钮提取。",
    balanceRecoverLink: "打开 DEX 余额",
    balanceFailedNote: (count: string) =>
      `您的 ${count} 个中标出价结算失败：全部保证金已退回您的 DEX 余额，相应数量已转入下一批次。`,
    colSettlement: "结算",
    settlementPending: "待处理",
    settlementSettled: "已结算",
    settlementFailed: "失败",
    settlementNotRequired: "无需结算",
    settlementFailedCarried: (carried: string) =>
      `${carried} TTTI-T 已转入下一批次`,
    settlementSummaryLabel: "中标者结算",
    settlementSummary: (settled: string, pending: string, failed: string) =>
      `已结算 ${settled} · 待处理 ${pending} · 失败 ${failed}`,
    settlementFailedCarriedLabel: "结算失败后转入下一批次的数量",
    settlementHeading: "中标者结算",
    settlementRule:
      "对于以价格 B 成交的数量 q，从保证金中扣取 2 × B × q ÷ 0.99，其中 1 % 归创建者。一个 B × q 的头寸持有 q 个 TTTI-T，并以所付代币设立每个 TTTI-T 为 B 的担保金。保证金的其余部分退回 DEX 余额。若某位中标者的结算失败，则不创建头寸或担保金，全部保证金退回 DEX 余额，相应数量转入下一批次。其他中标者不受影响。",
    settleTaken: "从保证金扣取的金额",
    settleCreator: "创建者份额（1 %）",
    settlePosition: "头寸",
    settlePositionValue: (amount: string, quantity: string) =>
      `${amount}，含 ${quantity} TTTI-T`,
    settleGuarantee: "担保金",
    settleSurplus: "退回 DEX 余额的保证金余额",
    settleNoPosition: "头寸与担保金",
    settleNone: "无",
    settleDepositReturned: "全部保证金已退回 DEX 余额",
    settleCarried: "转入下一批次的数量",
    settleFailureReason: "原因",
  },
  "pt-BR": {
    title: "Leilão",
    intro:
      "Leilão de lances selados do TTTI-T devolvido. Os lances são firmes e ficam ocultos para todos, exceto para o autor. Cada licitante paga o próprio lance. Vencem os maiores lances, em ordem de preço, até que o lote seja vendido.",
    loading: "Carregando o leilão…",
    loadError: "Não foi possível carregar o leilão.",
    retryButton: "Tentar novamente",
    summaryTitle: "Leilão aberto",
    lotSize: "Tamanho do lote",
    closesAt: "Horário de encerramento",
    timeLeft: "Tempo restante",
    closingReached: "O horário de encerramento foi atingido.",
    reserveHeading: "Preço de reserva",
    reserveUsd: "Preço de reserva atual por TTTI-T",
    reserveEquivalents:
      "Equivalente por TTTI-T em cada token de pagamento à taxa atual",
    reserveRule:
      "O preço de reserva é o maior entre 10.000 USD por TTTI-T, a média de 24 horas do preço consolidado do TTTI-T e o preço consolidado atual do TTTI-T. Nenhum lance abaixo dele passa e nada é reemitido abaixo de 10.000 USD: o lote permanece no contrato.",
    componentsHeading: "Valores comparados",
    floorLabel: "Piso fixo por TTTI-T",
    dailyAverageLabel: "Média de 24 horas do preço consolidado",
    currentLabel: "Preço consolidado atual",
    appliedBadge: "Aplicado",
    bindingFloor:
      "O piso fixo é o valor mais alto e define o preço de reserva.",
    bindingDailyAverage:
      "A média de 24 horas é o valor mais alto e define o preço de reserva.",
    bindingConsolidated:
      "O preço consolidado atual é o valor mais alto e define o preço de reserva.",
    unavailableNote:
      "Um valor que não está disponível fica fora da comparação.",
    rateUnavailable: "Sem taxa no momento",
    consolidatedLabel: "Preço consolidado do TTTI-T",
    consolidatedUnavailable: "Indisponível",
    recoverableBadge: "Garantia recuperável",
    recoverableSentence: "O depósito é uma garantia recuperável.",
    emptyTitle: "Nenhum leilão está aberto",
    emptyBody:
      "Um leilão dura 24 horas. Ele pode ser aberto quando há TTTI-T devolvido aguardando em um lote.",
    nextLot: "Próximo lote",
    nextLotNone: "Não há TTTI-T devolvido aguardando em um lote.",
    openButton: "Abrir o leilão",
    openingButton: "Abrindo…",
    openErrorAlreadyOpen: "Já há um leilão aberto.",
    openErrorEmptyLot: "Não há TTTI-T devolvido para colocar em um lote.",
    openErrorPaused: "O leilão está em pausa.",
    openErrorUnexpected: "Não foi possível abrir o leilão. Tente novamente.",
    formTitle: "Fazer um lance",
    formIntro:
      "Um lance é firme: não pode ser retirado nem modificado. O depósito completo é cobrado quando o lance é feito.",
    tokenLegend: "Token de pagamento",
    quantityLabel: "Quantidade (TTTI-T)",
    quantityHint: (minimum: string) =>
      `Mínimo de ${minimum} TTTI-T, até 8 casas decimais.`,
    priceLabel: (symbol: string) => `Preço por TTTI-T (${symbol})`,
    priceHint: "Preço no token escolhido, por um TTTI-T inteiro.",
    depositLabel: (symbol: string) => `Depósito (${symbol}, opcional)`,
    depositHint:
      "Deixe em branco para depositar o valor exigido. Um depósito maior que o exigido oculta o tamanho do orçamento.",
    requiredDepositLabel: "Depósito exigido",
    requiredDepositFormula:
      "2 × preço × quantidade ÷ 0,99, arredondado para cima",
    depositSentLabel: "Depósito enviado",
    requiredDepositPending: "Informe uma quantidade e um preço.",
    errQuantity: "Informe uma quantidade com no máximo 8 casas decimais.",
    errQuantityMin: (minimum: string) =>
      `A quantidade mínima é ${minimum} TTTI-T.`,
    errPrice: (decimals: string) =>
      `Informe um preço maior que zero com no máximo ${decimals} casas decimais.`,
    errDeposit: (decimals: string) =>
      `Informe um depósito com no máximo ${decimals} casas decimais.`,
    errDepositBelow: (required: string) =>
      `O depósito não pode ser menor que o depósito exigido (${required}).`,
    submitButton: "Fazer o lance",
    approvingButton: "Aguardando a assinatura…",
    sendingButton: "Enviando o lance…",
    successMessage: "Lance registrado.",
    approvalFailed: (detail: string) =>
      `A aprovação não foi assinada: ${detail}`,
    unexpectedError: "Não foi possível enviar o lance. Tente novamente.",
    signInPrompt: "Entre para fazer um lance.",
    blockSaleLabel: "Tipo de venda",
    blockSaleValue: "Venda em bloco",
    blockSaleBadge: "Venda em bloco",
    blockSaleRule:
      "Este lote é uma venda em bloco: o melhor preço por TTTI-T vence o lote inteiro. Aplica-se o mesmo preço de reserva; um lance abaixo dele não passa.",
    blockQuantityLabel: "Quantidade (lote inteiro, TTTI-T)",
    blockQuantityHint: (lot: string) =>
      `A quantidade é o lote inteiro: ${lot} TTTI-T. É fixa.`,
    blockPriceHint:
      "Um único preço por TTTI-T, para o lote inteiro. O melhor preço vence o lote inteiro.",
    bidErrWholeLot: (lot: string) =>
      `Este lote é uma venda em bloco. O lance deve ser pelo lote inteiro: ${lot} TTTI-T.`,
    lotRemainderLabel: "Resto da cunhagem no lote",
    lotRemainderNote:
      "O resto da cunhagem faz parte do lote. Só é cunhado na liquidação, para o vencedor.",
    settleMinted: "TTTI-T cunhados na liquidação",
    outcomeMinted: (amount: string) =>
      `Cunhados na liquidação: ${amount} TTTI-T`,
    mintEndedBadge: "Cunhagem encerrada",
    mintEndedTitle: "A cunhagem foi encerrada",
    mintEndedBody: (remainder: string) =>
      `O resto de ${remainder} TTTI-T passa para o primeiro lote do leilão. Só é cunhado na liquidação, para o vencedor.`,
    mintErrEnded:
      "A cunhagem foi encerrada. O resto passa para o primeiro lote do leilão e só é cunhado na liquidação, para o vencedor.",
    bidErrTooMany: (maximum: string) =>
      `O máximo de ${maximum} lances por pessoa foi atingido.`,
    bidErrInsufficientFunds: (balance: string, required: string) =>
      `Saldo insuficiente: saldo ${balance}, exigido ${required}.`,
    bidErrQuantityBelow: (minimum: string) =>
      `A quantidade está abaixo do mínimo de ${minimum} TTTI-T.`,
    bidErrInvalidPrice: "O preço deve ser maior que zero.",
    bidErrAnonymous: "Entre para fazer um lance.",
    bidErrLedger: (detail: string) => `Erro do ledger: ${detail}`,
    bidErrAllowance: (required: string, allowance: string) =>
      `A aprovação é insuficiente: exigido ${required}, aprovado ${allowance}.`,
    bidErrNoOpen: "Nenhum leilão está aberto.",
    bidErrInProgress: "Outro lance seu está sendo processado.",
    bidErrDepositBelow: (deposited: string, required: string) =>
      `O depósito (${deposited}) é menor que o depósito exigido (${required}).`,
    bidErrPaused: "Os lances estão em pausa.",
    bidErrPriceBelowMinimum: (minimum: string) =>
      `O preço está abaixo do mínimo de ${minimum} por TTTI-T à taxa atual.`,
    bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
      `O preço oferecido (${bid} por TTTI-T) está abaixo do mínimo de ${minimum} por TTTI-T à taxa atual.`,
    bidErrDepositBelowFee: (fee: string, deposited: string) =>
      `O depósito (${deposited}) deve cobrir pelo menos a taxa do ledger (${fee}).`,
    priceMinimumHint: (minimum: string) =>
      `Preço mínimo: ${minimum} por TTTI-T à taxa atual.`,
    myOffersTitle: "Meus lances",
    privacyNote: "Os lances só são visíveis para o seu autor.",
    firmNote: "Os lances são firmes: esta lista é somente leitura.",
    offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
    myOffersEmpty: "Você não tem nenhum lance neste leilão.",
    colQuantity: "Quantidade (TTTI-T)",
    colPrice: "Preço por TTTI-T",
    colToken: "Token",
    colDeposit: "Depósito",
    colDate: "Data",
    closingPendingNotice:
      "O horário de encerramento passou. O encerramento aguarda uma taxa válida. Os lances de outras pessoas permanecem ocultos até o encerramento.",
    closedTitle: "Leilões encerrados",
    closedIntro:
      "Os mais recentes primeiro. Após o encerramento, o resultado e todos os lances são publicados.",
    closedEmpty: "Nenhum leilão foi encerrado ainda.",
    closedItemLabel: (id: string, date: string) =>
      `Leilão ${id} · encerrado em ${date}`,
    resultNotPublished: "O resultado ainda não foi publicado.",
    resultStatusLabel: "Situação",
    statusFullySold: "Vendido por completo",
    statusPartiallySold: "Vendido em parte",
    statusUnsold: "Não vendido",
    resultServedLabel: "Quantidade atendida",
    resultCarriedLabel: "Transferida para o próximo lote",
    resultOffersLabel: "Lances recebidos",
    resultClosedAtLabel: "Encerrado em",
    resultReserveHeading: "Reserva aplicada",
    resultReserveLabel: "Reserva aplicada por TTTI-T",
    resultRatesHeading: "Taxas usadas no encerramento",
    offersHeading: "Lances publicados",
    offersEmpty: "Nenhum lance foi feito neste leilão.",
    colBidder: "Autor do lance",
    colOutcome: "Resultado",
    colServed: "Quantidade atendida",
    colReturned: "Valor devolvido",
    colAuction: "Leilão",
    youBadge: "Você",
    outcomeServed: "Atendido",
    outcomePartiallyServed: "Atendido em parte",
    outcomeNotServed: "Não atendido",
    outcomeDiscarded: "Descartado abaixo da reserva",
    outcomePending: "Aguardando encerramento",
    outcomeDetail: (served: string, returned: string) =>
      `Atendido ${served} TTTI-T · devolvido ${returned}`,
    outcomeReturnedOnly: (returned: string) => `Devolvido ${returned}`,
    balanceTitle: "Meu saldo",
    balanceNote:
      "Os depósitos das quantidades atendidas aguardam liquidação. Os lances não atendidos, as partes não atendidas, o excesso dos depósitos e os depósitos das liquidações malsucedidas são devolvidos ao seu saldo DEX.",
    balanceEmpty: "Nenhum valor está registrado para a sua conta.",
    colAwaiting: "Aguardando liquidação",
    colReturnedBalance: "Devolvido ao saldo",
    balanceRecoverNote:
      "Os valores devolvidos estão no seu saldo DEX. Use ali o botão Recuperar para retirá-los.",
    balanceRecoverLink: "Abrir o saldo DEX",
    balanceFailedNote: (count: string) =>
      `A liquidação de ${count} dos seus lances vencedores falhou: o depósito inteiro foi devolvido ao seu saldo DEX e a quantidade passou para o lote seguinte.`,
    colSettlement: "Liquidação",
    settlementPending: "Pendente",
    settlementSettled: "Liquidada",
    settlementFailed: "Malsucedida",
    settlementNotRequired: "Não necessária",
    settlementFailedCarried: (carried: string) =>
      `${carried} TTTI-T passam para o lote seguinte`,
    settlementSummaryLabel: "Liquidação dos vencedores",
    settlementSummary: (settled: string, pending: string, failed: string) =>
      `${settled} liquidadas · ${pending} pendentes · ${failed} malsucedidas`,
    settlementFailedCarriedLabel:
      "Passa para o lote seguinte após liquidações malsucedidas",
    settlementHeading: "Liquidação dos vencedores",
    settlementRule:
      "Para uma quantidade atendida q ao preço B, 2 × B × q ÷ 0,99 é retirado do depósito e 1 % desse valor vai para o criador. Uma posição de B × q contém q TTTI-T, e uma garantia de B por TTTI-T é constituída no token pago. O restante do depósito é devolvido ao saldo DEX. Se a liquidação de um vencedor falhar, nenhuma posição nem garantia é criada, o depósito inteiro é devolvido ao saldo DEX e a quantidade passa para o lote seguinte. Os demais vencedores não são afetados.",
    settleTaken: "Valor retirado do depósito",
    settleCreator: "Parte do criador (1 %)",
    settlePosition: "Posição",
    settlePositionValue: (amount: string, quantity: string) =>
      `${amount} com ${quantity} TTTI-T`,
    settleGuarantee: "Garantia",
    settleSurplus: "Excesso do depósito devolvido ao saldo DEX",
    settleNoPosition: "Posição e garantia",
    settleNone: "Nenhuma",
    settleDepositReturned: "Depósito inteiro devolvido ao saldo DEX",
    settleCarried: "Quantidade que passa para o lote seguinte",
    settleFailureReason: "Motivo",
  },
  ko: {
    title: "경매",
    intro:
      "반환된 TTTI-T의 밀봉 입찰 경매입니다. 입찰은 확정적이며 작성자 외에는 누구에게도 공개되지 않습니다. 각 입찰자는 자신의 입찰가를 지불합니다. 가장 높은 입찰가부터 가격순으로 낙찰되며, 로트가 모두 판매될 때까지 이어집니다.",
    loading: "경매를 불러오는 중…",
    loadError: "경매를 불러오지 못했습니다.",
    retryButton: "다시 시도",
    summaryTitle: "진행 중인 경매",
    lotSize: "로트 크기",
    closesAt: "마감 시각",
    timeLeft: "남은 시간",
    closingReached: "마감 시각이 되었습니다.",
    reserveHeading: "최저 가격",
    reserveUsd: "TTTI-T당 현재 최저 가격",
    reserveEquivalents: "현재 환율 기준 각 결제 토큰으로 환산한 TTTI-T당 금액",
    reserveRule:
      "최저 가격은 TTTI-T당 10,000 USD, TTTI-T 통합 가격의 24시간 평균, TTTI-T의 현재 통합 가격 중 가장 높은 값입니다. 그 아래의 입찰은 통과하지 못하며 10,000 USD 미만으로는 아무것도 재발행되지 않습니다. 해당 물량은 컨트랙트에 남습니다.",
    componentsHeading: "비교하는 값",
    floorLabel: "TTTI-T당 고정 하한",
    dailyAverageLabel: "통합 가격의 24시간 평균",
    currentLabel: "현재 통합 가격",
    appliedBadge: "적용됨",
    bindingFloor: "고정 하한이 가장 높은 값이며 최저 가격을 정합니다.",
    bindingDailyAverage: "24시간 평균이 가장 높은 값이며 최저 가격을 정합니다.",
    bindingConsolidated:
      "현재 통합 가격이 가장 높은 값이며 최저 가격을 정합니다.",
    unavailableNote: "사용할 수 없는 값은 비교에서 제외됩니다.",
    rateUnavailable: "현재 환율 없음",
    consolidatedLabel: "TTTI-T 통합 가격",
    consolidatedUnavailable: "사용할 수 없음",
    recoverableBadge: "회수 가능한 보증금",
    recoverableSentence: "예치금은 회수 가능한 보증금입니다.",
    emptyTitle: "진행 중인 경매가 없습니다",
    emptyBody:
      "경매는 24시간 동안 진행됩니다. 반환된 TTTI-T가 로트에서 대기 중일 때 경매를 열 수 있습니다.",
    nextLot: "다음 로트",
    nextLotNone: "로트에서 대기 중인 반환된 TTTI-T가 없습니다.",
    openButton: "경매 열기",
    openingButton: "여는 중…",
    openErrorAlreadyOpen: "이미 경매가 열려 있습니다.",
    openErrorEmptyLot: "로트로 만들 반환된 TTTI-T가 없습니다.",
    openErrorPaused: "경매가 일시 중지되었습니다.",
    openErrorUnexpected: "경매를 열지 못했습니다. 다시 시도하십시오.",
    formTitle: "입찰하기",
    formIntro:
      "입찰은 확정적이어서 철회하거나 수정할 수 없습니다. 입찰 시 예치금 전액이 인출됩니다.",
    tokenLegend: "결제 토큰",
    quantityLabel: "수량 (TTTI-T)",
    quantityHint: (minimum: string) =>
      `최소 ${minimum} TTTI-T, 소수점 8자리까지.`,
    priceLabel: (symbol: string) => `TTTI-T당 가격 (${symbol})`,
    priceHint: "선택한 토큰으로 표시한 TTTI-T 1개의 가격입니다.",
    depositLabel: (symbol: string) => `예치금 (${symbol}, 선택)`,
    depositHint:
      "비워 두면 필요한 금액을 예치합니다. 필요한 금액보다 많이 예치하면 예산 규모가 드러나지 않습니다.",
    requiredDepositLabel: "필요 예치금",
    requiredDepositFormula: "2 × 가격 × 수량 ÷ 0.99, 올림",
    depositSentLabel: "전송된 예치금",
    requiredDepositPending: "수량과 가격을 입력하십시오.",
    errQuantity: "소수점 8자리 이하의 수량을 입력하십시오.",
    errQuantityMin: (minimum: string) => `최소 수량은 ${minimum} TTTI-T입니다.`,
    errPrice: (decimals: string) =>
      `0보다 크고 소수점 ${decimals}자리 이하인 가격을 입력하십시오.`,
    errDeposit: (decimals: string) =>
      `소수점 ${decimals}자리 이하의 예치금을 입력하십시오.`,
    errDepositBelow: (required: string) =>
      `예치금은 필요 예치금(${required})보다 적을 수 없습니다.`,
    submitButton: "입찰하기",
    approvingButton: "서명 대기 중…",
    sendingButton: "입찰 전송 중…",
    successMessage: "입찰이 기록되었습니다.",
    approvalFailed: (detail: string) => `승인에 서명하지 않았습니다: ${detail}`,
    unexpectedError: "입찰을 전송하지 못했습니다. 다시 시도하십시오.",
    signInPrompt: "입찰하려면 로그인하십시오.",
    blockSaleLabel: "판매 방식",
    blockSaleValue: "일괄 판매",
    blockSaleBadge: "일괄 판매",
    blockSaleRule:
      "이 로트는 일괄 판매입니다. TTTI-T당 가장 높은 가격이 로트 전체를 가져갑니다. 동일한 최저 가격이 적용되며, 그보다 낮은 입찰은 통과하지 않습니다.",
    blockQuantityLabel: "수량(로트 전체, TTTI-T)",
    blockQuantityHint: (lot: string) =>
      `수량은 로트 전체인 ${lot} TTTI-T입니다. 변경할 수 없습니다.`,
    blockPriceHint:
      "로트 전체에 대해 TTTI-T당 하나의 가격을 입력합니다. 가장 높은 가격이 로트 전체를 가져갑니다.",
    bidErrWholeLot: (lot: string) =>
      `이 로트는 일괄 판매입니다. 입찰은 로트 전체(${lot} TTTI-T)에 대해서만 가능합니다.`,
    lotRemainderLabel: "로트에 포함된 발행 잔량",
    lotRemainderNote:
      "발행 잔량은 로트에 포함됩니다. 정산 시에만 낙찰자를 위해 발행됩니다.",
    settleMinted: "정산 시 발행된 TTTI-T",
    outcomeMinted: (amount: string) => `정산 시 발행: ${amount} TTTI-T`,
    mintEndedBadge: "발행 종료",
    mintEndedTitle: "발행이 종료되었습니다",
    mintEndedBody: (remainder: string) =>
      `잔량 ${remainder} TTTI-T는 첫 번째 경매 로트에 합류합니다. 정산 시에만 낙찰자를 위해 발행됩니다.`,
    mintErrEnded:
      "발행이 종료되었습니다. 잔량은 첫 번째 경매 로트에 합류하며 정산 시에만 낙찰자를 위해 발행됩니다.",
    bidErrTooMany: (maximum: string) =>
      `1인당 최대 ${maximum}건의 입찰 한도에 도달했습니다.`,
    bidErrInsufficientFunds: (balance: string, required: string) =>
      `잔액 부족: 잔액 ${balance}, 필요 ${required}.`,
    bidErrQuantityBelow: (minimum: string) =>
      `수량이 최소 ${minimum} TTTI-T보다 적습니다.`,
    bidErrInvalidPrice: "가격은 0보다 커야 합니다.",
    bidErrAnonymous: "입찰하려면 로그인하십시오.",
    bidErrLedger: (detail: string) => `원장 오류: ${detail}`,
    bidErrAllowance: (required: string, allowance: string) =>
      `승인 금액이 부족합니다: 필요 ${required}, 승인 ${allowance}.`,
    bidErrNoOpen: "진행 중인 경매가 없습니다.",
    bidErrInProgress: "다른 입찰이 처리 중입니다.",
    bidErrDepositBelow: (deposited: string, required: string) =>
      `예치금(${deposited})이 필요 예치금(${required})보다 적습니다.`,
    bidErrPaused: "입찰이 일시 중지되었습니다.",
    bidErrPriceBelowMinimum: (minimum: string) =>
      `가격이 현재 환율 기준 TTTI-T당 최소 ${minimum}보다 낮습니다.`,
    bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
      `제시한 가격(TTTI-T당 ${bid})이 현재 환율 기준 TTTI-T당 최소 ${minimum}보다 낮습니다.`,
    bidErrDepositBelowFee: (fee: string, deposited: string) =>
      `예치금(${deposited})은 최소한 원장 수수료(${fee})를 충당해야 합니다.`,
    priceMinimumHint: (minimum: string) =>
      `최소 가격: 현재 환율 기준 TTTI-T당 ${minimum}.`,
    myOffersTitle: "내 입찰",
    privacyNote: "입찰은 작성자에게만 보입니다.",
    firmNote: "입찰은 확정적입니다. 이 목록은 읽기 전용입니다.",
    offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
    myOffersEmpty: "이 경매에 입찰한 내역이 없습니다.",
    colQuantity: "수량 (TTTI-T)",
    colPrice: "TTTI-T당 가격",
    colToken: "토큰",
    colDeposit: "예치금",
    colDate: "날짜",
    closingPendingNotice:
      "마감 시각이 지났습니다. 마감은 유효한 환율을 기다리고 있습니다. 다른 사람의 입찰은 마감 때까지 공개되지 않습니다.",
    closedTitle: "마감된 경매",
    closedIntro: "최신 순입니다. 마감 후 결과와 모든 입찰이 공개됩니다.",
    closedEmpty: "아직 마감된 경매가 없습니다.",
    closedItemLabel: (id: string, date: string) => `경매 ${id} · ${date} 마감`,
    resultNotPublished: "결과가 아직 공개되지 않았습니다.",
    resultStatusLabel: "상태",
    statusFullySold: "전량 판매",
    statusPartiallySold: "일부 판매",
    statusUnsold: "미판매",
    resultServedLabel: "체결 수량",
    resultCarriedLabel: "다음 로트로 이월된 수량",
    resultOffersLabel: "접수된 입찰",
    resultClosedAtLabel: "마감 시각",
    resultReserveHeading: "적용된 최저 가격",
    resultReserveLabel: "TTTI-T당 적용된 최저 가격",
    resultRatesHeading: "마감 시 사용한 환율",
    offersHeading: "공개된 입찰",
    offersEmpty: "이 경매에는 입찰이 없었습니다.",
    colBidder: "입찰자",
    colOutcome: "결과",
    colServed: "체결 수량",
    colReturned: "반환 금액",
    colAuction: "경매",
    youBadge: "본인",
    outcomeServed: "체결",
    outcomePartiallyServed: "일부 체결",
    outcomeNotServed: "미체결",
    outcomeDiscarded: "최저 가격 미만으로 제외",
    outcomePending: "마감 대기 중",
    outcomeDetail: (served: string, returned: string) =>
      `체결 ${served} TTTI-T · 반환 ${returned}`,
    outcomeReturnedOnly: (returned: string) => `반환 ${returned}`,
    balanceTitle: "내 잔액",
    balanceNote:
      "체결된 수량의 예치금은 정산 대기 중입니다. 체결되지 않은 입찰, 체결되지 않은 부분, 초과 예치금, 정산에 실패한 예치금은 DEX 잔액으로 반환됩니다.",
    balanceEmpty: "내 계정에 기록된 금액이 없습니다.",
    colAwaiting: "정산 대기",
    colReturnedBalance: "잔액으로 반환",
    balanceRecoverNote:
      "반환된 금액은 DEX 잔액에 있습니다. 그곳의 되찾기 버튼으로 인출하세요.",
    balanceRecoverLink: "DEX 잔액 열기",
    balanceFailedNote: (count: string) =>
      `낙찰된 입찰 ${count}건의 정산이 실패했습니다. 예치금 전액이 DEX 잔액으로 반환되었고 해당 수량은 다음 로트로 이월되었습니다.`,
    colSettlement: "정산",
    settlementPending: "대기",
    settlementSettled: "정산 완료",
    settlementFailed: "실패",
    settlementNotRequired: "해당 없음",
    settlementFailedCarried: (carried: string) =>
      `${carried} TTTI-T 다음 로트로 이월`,
    settlementSummaryLabel: "낙찰자 정산",
    settlementSummary: (settled: string, pending: string, failed: string) =>
      `정산 완료 ${settled} · 대기 ${pending} · 실패 ${failed}`,
    settlementFailedCarriedLabel: "정산 실패 후 다음 로트로 이월된 수량",
    settlementHeading: "낙찰자 정산",
    settlementRule:
      "가격 B로 체결된 수량 q에 대해 예치금에서 2 × B × q ÷ 0.99가 차감되며 그중 1 %는 제작자에게 지급됩니다. B × q 규모의 포지션에 q TTTI-T가 담기고, 지불한 토큰으로 TTTI-T당 B의 보증금이 설정됩니다. 예치금의 나머지는 DEX 잔액으로 반환됩니다. 낙찰자의 정산이 실패하면 포지션과 보증금은 생성되지 않고, 예치금 전액이 DEX 잔액으로 반환되며, 해당 수량은 다음 로트로 이월됩니다. 다른 낙찰자는 영향을 받지 않습니다.",
    settleTaken: "예치금에서 차감된 금액",
    settleCreator: "제작자 몫 (1 %)",
    settlePosition: "포지션",
    settlePositionValue: (amount: string, quantity: string) =>
      `${amount}, ${quantity} TTTI-T 포함`,
    settleGuarantee: "보증금",
    settleSurplus: "DEX 잔액으로 반환된 예치금 잔여분",
    settleNoPosition: "포지션 및 보증금",
    settleNone: "없음",
    settleDepositReturned: "예치금 전액 DEX 잔액으로 반환",
    settleCarried: "다음 로트로 이월된 수량",
    settleFailureReason: "사유",
  },
  "pa-Guru": {
    title: "ਨਿਲਾਮੀ",
    intro:
      "ਵਾਪਸ ਕੀਤੇ TTTI-T ਦੀ ਸੀਲਬੰਦ ਬੋਲੀ ਵਾਲੀ ਨਿਲਾਮੀ। ਬੋਲੀਆਂ ਪੱਕੀਆਂ ਹਨ ਅਤੇ ਲਿਖਣ ਵਾਲੇ ਤੋਂ ਇਲਾਵਾ ਹਰ ਕਿਸੇ ਤੋਂ ਛੁਪੀਆਂ ਰਹਿੰਦੀਆਂ ਹਨ। ਹਰ ਬੋਲੀਕਾਰ ਆਪਣੀ ਹੀ ਬੋਲੀ ਅਦਾ ਕਰਦਾ ਹੈ। ਸਭ ਤੋਂ ਉੱਚੀਆਂ ਬੋਲੀਆਂ ਕੀਮਤ ਦੇ ਕ੍ਰਮ ਵਿੱਚ ਜਿੱਤਦੀਆਂ ਹਨ, ਜਦੋਂ ਤੱਕ ਲਾਟ ਵਿਕ ਨਹੀਂ ਜਾਂਦਾ।",
    loading: "ਨਿਲਾਮੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ…",
    loadError: "ਨਿਲਾਮੀ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ।",
    retryButton: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    summaryTitle: "ਖੁੱਲ੍ਹੀ ਨਿਲਾਮੀ",
    lotSize: "ਲਾਟ ਦਾ ਆਕਾਰ",
    closesAt: "ਬੰਦ ਹੋਣ ਦਾ ਸਮਾਂ",
    timeLeft: "ਬਾਕੀ ਸਮਾਂ",
    closingReached: "ਬੰਦ ਹੋਣ ਦਾ ਸਮਾਂ ਹੋ ਗਿਆ ਹੈ।",
    reserveHeading: "ਰਿਜ਼ਰਵ ਕੀਮਤ",
    reserveUsd: "ਪ੍ਰਤੀ TTTI-T ਮੌਜੂਦਾ ਰਿਜ਼ਰਵ ਕੀਮਤ",
    reserveEquivalents: "ਮੌਜੂਦਾ ਦਰ ਅਨੁਸਾਰ ਹਰ ਭੁਗਤਾਨ ਟੋਕਨ ਵਿੱਚ ਪ੍ਰਤੀ TTTI-T ਬਰਾਬਰ ਰਕਮ",
    reserveRule:
      "ਰਿਜ਼ਰਵ ਕੀਮਤ ਪ੍ਰਤੀ TTTI-T 10,000 USD, TTTI-T ਦੀ ਏਕੀਕ੍ਰਿਤ ਕੀਮਤ ਦੀ 24 ਘੰਟਿਆਂ ਦੀ ਔਸਤ ਅਤੇ TTTI-T ਦੀ ਮੌਜੂਦਾ ਏਕੀਕ੍ਰਿਤ ਕੀਮਤ ਵਿੱਚੋਂ ਸਭ ਤੋਂ ਉੱਚੀ ਹੈ। ਇਸ ਤੋਂ ਹੇਠਾਂ ਕੋਈ ਬੋਲੀ ਪਾਸ ਨਹੀਂ ਹੁੰਦੀ ਅਤੇ 10,000 USD ਤੋਂ ਹੇਠਾਂ ਕੁਝ ਵੀ ਦੁਬਾਰਾ ਜਾਰੀ ਨਹੀਂ ਕੀਤਾ ਜਾਂਦਾ: ਲਾਟ ਕੰਟਰੈਕਟ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ।",
    componentsHeading: "ਤੁਲਨਾ ਕੀਤੇ ਮੁੱਲ",
    floorLabel: "ਪ੍ਰਤੀ TTTI-T ਨਿਸ਼ਚਿਤ ਹੇਠਲੀ ਹੱਦ",
    dailyAverageLabel: "ਏਕੀਕ੍ਰਿਤ ਕੀਮਤ ਦੀ 24 ਘੰਟਿਆਂ ਦੀ ਔਸਤ",
    currentLabel: "ਮੌਜੂਦਾ ਏਕੀਕ੍ਰਿਤ ਕੀਮਤ",
    appliedBadge: "ਲਾਗੂ",
    bindingFloor: "ਨਿਸ਼ਚਿਤ ਹੇਠਲੀ ਹੱਦ ਸਭ ਤੋਂ ਉੱਚਾ ਮੁੱਲ ਹੈ ਅਤੇ ਰਿਜ਼ਰਵ ਕੀਮਤ ਤੈਅ ਕਰਦੀ ਹੈ।",
    bindingDailyAverage:
      "24 ਘੰਟਿਆਂ ਦੀ ਔਸਤ ਸਭ ਤੋਂ ਉੱਚਾ ਮੁੱਲ ਹੈ ਅਤੇ ਰਿਜ਼ਰਵ ਕੀਮਤ ਤੈਅ ਕਰਦੀ ਹੈ।",
    bindingConsolidated:
      "ਮੌਜੂਦਾ ਏਕੀਕ੍ਰਿਤ ਕੀਮਤ ਸਭ ਤੋਂ ਉੱਚਾ ਮੁੱਲ ਹੈ ਅਤੇ ਰਿਜ਼ਰਵ ਕੀਮਤ ਤੈਅ ਕਰਦੀ ਹੈ।",
    unavailableNote: "ਜੋ ਮੁੱਲ ਉਪਲਬਧ ਨਹੀਂ, ਉਹ ਤੁਲਨਾ ਤੋਂ ਬਾਹਰ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।",
    rateUnavailable: "ਇਸ ਵੇਲੇ ਕੋਈ ਦਰ ਨਹੀਂ",
    consolidatedLabel: "TTTI-T ਦੀ ਏਕੀਕ੍ਰਿਤ ਕੀਮਤ",
    consolidatedUnavailable: "ਉਪਲਬਧ ਨਹੀਂ",
    recoverableBadge: "ਵਾਪਸ ਮਿਲਣ ਯੋਗ ਗਾਰੰਟੀ",
    recoverableSentence: "ਜਮ੍ਹਾਂ ਰਕਮ ਵਾਪਸ ਮਿਲਣ ਯੋਗ ਗਾਰੰਟੀ ਹੈ।",
    emptyTitle: "ਕੋਈ ਨਿਲਾਮੀ ਖੁੱਲ੍ਹੀ ਨਹੀਂ ਹੈ",
    emptyBody:
      "ਨਿਲਾਮੀ 24 ਘੰਟੇ ਚੱਲਦੀ ਹੈ। ਜਦੋਂ ਵਾਪਸ ਕੀਤਾ TTTI-T ਕਿਸੇ ਲਾਟ ਵਿੱਚ ਉਡੀਕ ਕਰ ਰਿਹਾ ਹੋਵੇ ਤਾਂ ਇਸਨੂੰ ਖੋਲ੍ਹਿਆ ਜਾ ਸਕਦਾ ਹੈ।",
    nextLot: "ਅਗਲਾ ਲਾਟ",
    nextLotNone: "ਕਿਸੇ ਲਾਟ ਵਿੱਚ ਵਾਪਸ ਕੀਤਾ ਕੋਈ TTTI-T ਉਡੀਕ ਨਹੀਂ ਕਰ ਰਿਹਾ।",
    openButton: "ਨਿਲਾਮੀ ਖੋਲ੍ਹੋ",
    openingButton: "ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ…",
    openErrorAlreadyOpen: "ਨਿਲਾਮੀ ਪਹਿਲਾਂ ਹੀ ਖੁੱਲ੍ਹੀ ਹੈ।",
    openErrorEmptyLot: "ਲਾਟ ਵਿੱਚ ਪਾਉਣ ਲਈ ਵਾਪਸ ਕੀਤਾ ਕੋਈ TTTI-T ਨਹੀਂ ਹੈ।",
    openErrorPaused: "ਨਿਲਾਮੀ ਰੁਕੀ ਹੋਈ ਹੈ।",
    openErrorUnexpected: "ਨਿਲਾਮੀ ਖੋਲ੍ਹੀ ਨਹੀਂ ਜਾ ਸਕੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    formTitle: "ਬੋਲੀ ਲਗਾਓ",
    formIntro:
      "ਬੋਲੀ ਪੱਕੀ ਹੈ: ਇਸਨੂੰ ਵਾਪਸ ਨਹੀਂ ਲਿਆ ਜਾ ਸਕਦਾ ਅਤੇ ਨਾ ਹੀ ਬਦਲਿਆ ਜਾ ਸਕਦਾ ਹੈ। ਬੋਲੀ ਲਗਾਉਣ ਵੇਲੇ ਪੂਰੀ ਜਮ੍ਹਾਂ ਰਕਮ ਲਈ ਜਾਂਦੀ ਹੈ।",
    tokenLegend: "ਭੁਗਤਾਨ ਟੋਕਨ",
    quantityLabel: "ਮਾਤਰਾ (TTTI-T)",
    quantityHint: (minimum: string) => `ਘੱਟੋ-ਘੱਟ ${minimum} TTTI-T, 8 ਦਸ਼ਮਲਵ ਤੱਕ।`,
    priceLabel: (symbol: string) => `ਪ੍ਰਤੀ TTTI-T ਕੀਮਤ (${symbol})`,
    priceHint: "ਚੁਣੇ ਹੋਏ ਟੋਕਨ ਵਿੱਚ ਇੱਕ ਪੂਰੇ TTTI-T ਦੀ ਕੀਮਤ।",
    depositLabel: (symbol: string) => `ਜਮ੍ਹਾਂ ਰਕਮ (${symbol}, ਵਿਕਲਪਿਕ)`,
    depositHint:
      "ਲੋੜੀਂਦੀ ਰਕਮ ਜਮ੍ਹਾਂ ਕਰਨ ਲਈ ਖਾਲੀ ਛੱਡੋ। ਲੋੜੀਂਦੀ ਰਕਮ ਤੋਂ ਵੱਡੀ ਜਮ੍ਹਾਂ ਰਕਮ ਬਜਟ ਦਾ ਆਕਾਰ ਛੁਪਾਉਂਦੀ ਹੈ।",
    requiredDepositLabel: "ਲੋੜੀਂਦੀ ਜਮ੍ਹਾਂ ਰਕਮ",
    requiredDepositFormula: "2 × ਕੀਮਤ × ਮਾਤਰਾ ÷ 0.99, ਉੱਪਰ ਵੱਲ ਗੋਲ",
    depositSentLabel: "ਭੇਜੀ ਗਈ ਜਮ੍ਹਾਂ ਰਕਮ",
    requiredDepositPending: "ਮਾਤਰਾ ਅਤੇ ਕੀਮਤ ਦਰਜ ਕਰੋ।",
    errQuantity: "ਵੱਧ ਤੋਂ ਵੱਧ 8 ਦਸ਼ਮਲਵ ਵਾਲੀ ਮਾਤਰਾ ਦਰਜ ਕਰੋ।",
    errQuantityMin: (minimum: string) => `ਘੱਟੋ-ਘੱਟ ਮਾਤਰਾ ${minimum} TTTI-T ਹੈ।`,
    errPrice: (decimals: string) =>
      `ਸਿਫ਼ਰ ਤੋਂ ਵੱਡੀ ਅਤੇ ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਵਾਲੀ ਕੀਮਤ ਦਰਜ ਕਰੋ।`,
    errDeposit: (decimals: string) =>
      `ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਵਾਲੀ ਜਮ੍ਹਾਂ ਰਕਮ ਦਰਜ ਕਰੋ।`,
    errDepositBelow: (required: string) =>
      `ਜਮ੍ਹਾਂ ਰਕਮ ਲੋੜੀਂਦੀ ਜਮ੍ਹਾਂ ਰਕਮ (${required}) ਤੋਂ ਘੱਟ ਨਹੀਂ ਹੋ ਸਕਦੀ।`,
    submitButton: "ਬੋਲੀ ਲਗਾਓ",
    approvingButton: "ਦਸਤਖਤ ਦੀ ਉਡੀਕ…",
    sendingButton: "ਬੋਲੀ ਭੇਜੀ ਜਾ ਰਹੀ ਹੈ…",
    successMessage: "ਬੋਲੀ ਦਰਜ ਹੋ ਗਈ।",
    approvalFailed: (detail: string) => `ਮਨਜ਼ੂਰੀ ਉੱਤੇ ਦਸਤਖਤ ਨਹੀਂ ਹੋਏ: ${detail}`,
    unexpectedError: "ਬੋਲੀ ਭੇਜੀ ਨਹੀਂ ਜਾ ਸਕੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    signInPrompt: "ਬੋਲੀ ਲਗਾਉਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    blockSaleLabel: "ਵਿਕਰੀ ਦੀ ਕਿਸਮ",
    blockSaleValue: "ਬਲਾਕ ਵਿਕਰੀ",
    blockSaleBadge: "ਬਲਾਕ ਵਿਕਰੀ",
    blockSaleRule:
      "ਇਹ ਲਾਟ ਬਲਾਕ ਵਿਕਰੀ ਹੈ: ਪ੍ਰਤੀ TTTI-T ਸਭ ਤੋਂ ਵਧੀਆ ਕੀਮਤ ਪੂਰਾ ਲਾਟ ਜਿੱਤਦੀ ਹੈ। ਉਹੀ ਰਿਜ਼ਰਵ ਕੀਮਤ ਲਾਗੂ ਹੁੰਦੀ ਹੈ; ਉਸ ਤੋਂ ਘੱਟ ਬੋਲੀ ਪਾਸ ਨਹੀਂ ਹੁੰਦੀ।",
    blockQuantityLabel: "ਮਾਤਰਾ (ਪੂਰਾ ਲਾਟ, TTTI-T)",
    blockQuantityHint: (lot: string) =>
      `ਮਾਤਰਾ ਪੂਰਾ ਲਾਟ ਹੈ: ${lot} TTTI-T। ਇਹ ਨਿਸ਼ਚਿਤ ਹੈ।`,
    blockPriceHint:
      "ਪੂਰੇ ਲਾਟ ਲਈ ਪ੍ਰਤੀ TTTI-T ਇੱਕ ਕੀਮਤ। ਸਭ ਤੋਂ ਵਧੀਆ ਕੀਮਤ ਪੂਰਾ ਲਾਟ ਜਿੱਤਦੀ ਹੈ।",
    bidErrWholeLot: (lot: string) =>
      `ਇਹ ਲਾਟ ਬਲਾਕ ਵਿਕਰੀ ਹੈ। ਬੋਲੀ ਪੂਰੇ ਲਾਟ ਲਈ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ: ${lot} TTTI-T।`,
    lotRemainderLabel: "ਲਾਟ ਵਿੱਚ ਮਿੰਟ ਦਾ ਬਾਕੀ",
    lotRemainderNote:
      "ਮਿੰਟ ਦਾ ਬਾਕੀ ਲਾਟ ਦਾ ਹਿੱਸਾ ਹੈ। ਇਹ ਸਿਰਫ਼ ਨਿਪਟਾਰੇ ਸਮੇਂ ਜੇਤੂ ਲਈ ਮਿੰਟ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    settleMinted: "ਨਿਪਟਾਰੇ ਸਮੇਂ ਮਿੰਟ ਕੀਤੇ TTTI-T",
    outcomeMinted: (amount: string) => `ਨਿਪਟਾਰੇ ਸਮੇਂ ਮਿੰਟ ਕੀਤੇ: ${amount} TTTI-T`,
    mintEndedBadge: "ਮਿੰਟ ਸਮਾਪਤ",
    mintEndedTitle: "ਮਿੰਟ ਸਮਾਪਤ ਹੋ ਗਿਆ ਹੈ",
    mintEndedBody: (remainder: string) =>
      `${remainder} TTTI-T ਦਾ ਬਾਕੀ ਪਹਿਲੇ ਨਿਲਾਮੀ ਲਾਟ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋ ਜਾਂਦਾ ਹੈ। ਇਹ ਸਿਰਫ਼ ਨਿਪਟਾਰੇ ਸਮੇਂ ਜੇਤੂ ਲਈ ਮਿੰਟ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।`,
    mintErrEnded:
      "ਮਿੰਟ ਸਮਾਪਤ ਹੋ ਗਿਆ ਹੈ। ਬਾਕੀ ਪਹਿਲੇ ਨਿਲਾਮੀ ਲਾਟ ਵਿੱਚ ਸ਼ਾਮਲ ਹੁੰਦਾ ਹੈ ਅਤੇ ਸਿਰਫ਼ ਨਿਪਟਾਰੇ ਸਮੇਂ ਜੇਤੂ ਲਈ ਮਿੰਟ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
    bidErrTooMany: (maximum: string) =>
      `ਪ੍ਰਤੀ ਵਿਅਕਤੀ ਵੱਧ ਤੋਂ ਵੱਧ ${maximum} ਬੋਲੀਆਂ ਦੀ ਸੀਮਾ ਪੂਰੀ ਹੋ ਗਈ ਹੈ।`,
    bidErrInsufficientFunds: (balance: string, required: string) =>
      `ਫੰਡ ਨਾਕਾਫ਼ੀ: ਬਕਾਇਆ ${balance}, ਲੋੜੀਂਦਾ ${required}।`,
    bidErrQuantityBelow: (minimum: string) =>
      `ਮਾਤਰਾ ਘੱਟੋ-ਘੱਟ ${minimum} TTTI-T ਤੋਂ ਘੱਟ ਹੈ।`,
    bidErrInvalidPrice: "ਕੀਮਤ ਸਿਫ਼ਰ ਤੋਂ ਵੱਡੀ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।",
    bidErrAnonymous: "ਬੋਲੀ ਲਗਾਉਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    bidErrLedger: (detail: string) => `ਲੈਜਰ ਗਲਤੀ: ${detail}`,
    bidErrAllowance: (required: string, allowance: string) =>
      `ਮਨਜ਼ੂਰੀ ਬਹੁਤ ਘੱਟ ਹੈ: ਲੋੜੀਂਦਾ ${required}, ਮਨਜ਼ੂਰ ${allowance}।`,
    bidErrNoOpen: "ਕੋਈ ਨਿਲਾਮੀ ਖੁੱਲ੍ਹੀ ਨਹੀਂ ਹੈ।",
    bidErrInProgress: "ਤੁਹਾਡੀ ਇੱਕ ਹੋਰ ਬੋਲੀ ਉੱਤੇ ਕਾਰਵਾਈ ਹੋ ਰਹੀ ਹੈ।",
    bidErrDepositBelow: (deposited: string, required: string) =>
      `ਜਮ੍ਹਾਂ ਰਕਮ (${deposited}) ਲੋੜੀਂਦੀ ਜਮ੍ਹਾਂ ਰਕਮ (${required}) ਤੋਂ ਘੱਟ ਹੈ।`,
    bidErrPaused: "ਬੋਲੀਆਂ ਰੁਕੀਆਂ ਹੋਈਆਂ ਹਨ।",
    bidErrPriceBelowMinimum: (minimum: string) =>
      `ਕੀਮਤ ਮੌਜੂਦਾ ਦਰ ਤੇ ਪ੍ਰਤੀ TTTI-T ਘੱਟੋ-ਘੱਟ ${minimum} ਤੋਂ ਘੱਟ ਹੈ।`,
    bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
      `ਪੇਸ਼ ਕੀਤੀ ਕੀਮਤ (ਪ੍ਰਤੀ TTTI-T ${bid}) ਮੌਜੂਦਾ ਦਰ ਤੇ ਪ੍ਰਤੀ TTTI-T ਘੱਟੋ-ਘੱਟ ${minimum} ਤੋਂ ਘੱਟ ਹੈ।`,
    bidErrDepositBelowFee: (fee: string, deposited: string) =>
      `ਜਮ੍ਹਾਂ ਰਕਮ (${deposited}) ਘੱਟੋ-ਘੱਟ ਲੈਜਰ ਫੀਸ (${fee}) ਨੂੰ ਪੂਰਾ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ।`,
    priceMinimumHint: (minimum: string) =>
      `ਘੱਟੋ-ਘੱਟ ਕੀਮਤ: ਮੌਜੂਦਾ ਦਰ ਤੇ ਪ੍ਰਤੀ TTTI-T ${minimum}।`,
    myOffersTitle: "ਮੇਰੀਆਂ ਬੋਲੀਆਂ",
    privacyNote: "ਬੋਲੀਆਂ ਸਿਰਫ਼ ਆਪਣੇ ਲਿਖਣ ਵਾਲੇ ਨੂੰ ਦਿਸਦੀਆਂ ਹਨ।",
    firmNote: "ਬੋਲੀਆਂ ਪੱਕੀਆਂ ਹਨ: ਇਹ ਸੂਚੀ ਸਿਰਫ਼ ਪੜ੍ਹਨ ਲਈ ਹੈ।",
    offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
    myOffersEmpty: "ਇਸ ਨਿਲਾਮੀ ਵਿੱਚ ਤੁਹਾਡੀ ਕੋਈ ਬੋਲੀ ਨਹੀਂ ਹੈ।",
    colQuantity: "ਮਾਤਰਾ (TTTI-T)",
    colPrice: "ਪ੍ਰਤੀ TTTI-T ਕੀਮਤ",
    colToken: "ਟੋਕਨ",
    colDeposit: "ਜਮ੍ਹਾਂ ਰਕਮ",
    colDate: "ਮਿਤੀ",
    closingPendingNotice:
      "ਬੰਦ ਹੋਣ ਦਾ ਸਮਾਂ ਲੰਘ ਗਿਆ ਹੈ। ਬੰਦ ਹੋਣਾ ਇੱਕ ਜਾਇਜ਼ ਦਰ ਦੀ ਉਡੀਕ ਕਰ ਰਿਹਾ ਹੈ। ਬੰਦ ਹੋਣ ਤੱਕ ਹੋਰ ਲੋਕਾਂ ਦੀਆਂ ਬੋਲੀਆਂ ਛੁਪੀਆਂ ਰਹਿੰਦੀਆਂ ਹਨ।",
    closedTitle: "ਬੰਦ ਹੋਈਆਂ ਨਿਲਾਮੀਆਂ",
    closedIntro:
      "ਸਭ ਤੋਂ ਨਵੀਂ ਪਹਿਲਾਂ। ਬੰਦ ਹੋਣ ਤੋਂ ਬਾਅਦ ਨਤੀਜਾ ਅਤੇ ਸਾਰੀਆਂ ਬੋਲੀਆਂ ਪ੍ਰਕਾਸ਼ਿਤ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ।",
    closedEmpty: "ਹੁਣ ਤੱਕ ਕੋਈ ਨਿਲਾਮੀ ਬੰਦ ਨਹੀਂ ਹੋਈ।",
    closedItemLabel: (id: string, date: string) =>
      `ਨਿਲਾਮੀ ${id} · ${date} ਨੂੰ ਬੰਦ ਹੋਈ`,
    resultNotPublished: "ਨਤੀਜਾ ਅਜੇ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਹੋਇਆ।",
    resultStatusLabel: "ਸਥਿਤੀ",
    statusFullySold: "ਪੂਰੀ ਤਰ੍ਹਾਂ ਵਿਕਿਆ",
    statusPartiallySold: "ਅੰਸ਼ਕ ਤੌਰ ਤੇ ਵਿਕਿਆ",
    statusUnsold: "ਨਹੀਂ ਵਿਕਿਆ",
    resultServedLabel: "ਪੂਰੀ ਕੀਤੀ ਮਾਤਰਾ",
    resultCarriedLabel: "ਅਗਲੇ ਲਾਟ ਵਿੱਚ ਅੱਗੇ ਲਿਜਾਈ ਗਈ",
    resultOffersLabel: "ਪ੍ਰਾਪਤ ਹੋਈਆਂ ਬੋਲੀਆਂ",
    resultClosedAtLabel: "ਬੰਦ ਹੋਣ ਦਾ ਸਮਾਂ",
    resultReserveHeading: "ਲਾਗੂ ਕੀਤੀ ਰਿਜ਼ਰਵ",
    resultReserveLabel: "ਪ੍ਰਤੀ TTTI-T ਲਾਗੂ ਕੀਤੀ ਰਿਜ਼ਰਵ ਕੀਮਤ",
    resultRatesHeading: "ਬੰਦ ਹੋਣ ਵੇਲੇ ਵਰਤੀਆਂ ਦਰਾਂ",
    offersHeading: "ਪ੍ਰਕਾਸ਼ਿਤ ਬੋਲੀਆਂ",
    offersEmpty: "ਇਸ ਨਿਲਾਮੀ ਵਿੱਚ ਕੋਈ ਬੋਲੀ ਨਹੀਂ ਲੱਗੀ।",
    colBidder: "ਬੋਲੀਕਾਰ",
    colOutcome: "ਨਤੀਜਾ",
    colServed: "ਪੂਰੀ ਕੀਤੀ ਮਾਤਰਾ",
    colReturned: "ਵਾਪਸ ਕੀਤੀ ਰਕਮ",
    colAuction: "ਨਿਲਾਮੀ",
    youBadge: "ਤੁਸੀਂ",
    outcomeServed: "ਪੂਰੀ ਕੀਤੀ",
    outcomePartiallyServed: "ਅੰਸ਼ਕ ਤੌਰ ਤੇ ਪੂਰੀ ਕੀਤੀ",
    outcomeNotServed: "ਪੂਰੀ ਨਹੀਂ ਕੀਤੀ",
    outcomeDiscarded: "ਰਿਜ਼ਰਵ ਤੋਂ ਹੇਠਾਂ ਹੋਣ ਕਰਕੇ ਰੱਦ",
    outcomePending: "ਬੰਦ ਹੋਣ ਦੀ ਉਡੀਕ",
    outcomeDetail: (served: string, returned: string) =>
      `ਪੂਰੀ ਕੀਤੀ ${served} TTTI-T · ਵਾਪਸ ਕੀਤੀ ${returned}`,
    outcomeReturnedOnly: (returned: string) => `ਵਾਪਸ ਕੀਤੀ ${returned}`,
    balanceTitle: "ਮੇਰਾ ਬਕਾਇਆ",
    balanceNote:
      "ਪੂਰੀ ਕੀਤੀ ਮਾਤਰਾ ਦੀਆਂ ਜਮ੍ਹਾਂ ਰਕਮਾਂ ਨਿਪਟਾਰੇ ਦੀ ਉਡੀਕ ਵਿੱਚ ਹਨ। ਪੂਰੀਆਂ ਨਾ ਹੋਈਆਂ ਬੋਲੀਆਂ, ਪੂਰੇ ਨਾ ਹੋਏ ਹਿੱਸੇ, ਜਮ੍ਹਾਂ ਰਕਮ ਦਾ ਵਾਧੂ ਹਿੱਸਾ ਅਤੇ ਅਸਫਲ ਨਿਪਟਾਰਿਆਂ ਦੀਆਂ ਜਮ੍ਹਾਂ ਰਕਮਾਂ ਤੁਹਾਡੇ DEX ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ।",
    balanceEmpty: "ਤੁਹਾਡੇ ਖਾਤੇ ਲਈ ਕੋਈ ਰਕਮ ਦਰਜ ਨਹੀਂ ਹੈ।",
    colAwaiting: "ਨਿਪਟਾਰੇ ਦੀ ਉਡੀਕ ਵਿੱਚ",
    colReturnedBalance: "ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਕੀਤੀ",
    balanceRecoverNote:
      "ਵਾਪਸ ਕੀਤੀਆਂ ਰਕਮਾਂ ਤੁਹਾਡੇ DEX ਬਕਾਏ ਵਿੱਚ ਹਨ। ਉਹਨਾਂ ਨੂੰ ਕੱਢਣ ਲਈ ਉੱਥੇ ਵਾਪਸ ਲਓ ਬਟਨ ਵਰਤੋ।",
    balanceRecoverLink: "DEX ਬਕਾਇਆ ਖੋਲ੍ਹੋ",
    balanceFailedNote: (count: string) =>
      `ਤੁਹਾਡੀਆਂ ${count} ਜੇਤੂ ਬੋਲੀਆਂ ਦਾ ਨਿਪਟਾਰਾ ਅਸਫਲ ਰਿਹਾ: ਪੂਰੀ ਜਮ੍ਹਾਂ ਰਕਮ ਤੁਹਾਡੇ DEX ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਕੀਤੀ ਗਈ ਅਤੇ ਮਾਤਰਾ ਅਗਲੇ ਲਾਟ ਵਿੱਚ ਲਿਜਾਈ ਗਈ।`,
    colSettlement: "ਨਿਪਟਾਰਾ",
    settlementPending: "ਉਡੀਕ ਵਿੱਚ",
    settlementSettled: "ਨਿਪਟਾਇਆ ਗਿਆ",
    settlementFailed: "ਅਸਫਲ",
    settlementNotRequired: "ਲੋੜੀਂਦਾ ਨਹੀਂ",
    settlementFailedCarried: (carried: string) =>
      `${carried} TTTI-T ਅਗਲੇ ਲਾਟ ਵਿੱਚ ਲਿਜਾਏ ਗਏ`,
    settlementSummaryLabel: "ਜੇਤੂਆਂ ਦਾ ਨਿਪਟਾਰਾ",
    settlementSummary: (settled: string, pending: string, failed: string) =>
      `${settled} ਨਿਪਟਾਏ · ${pending} ਉਡੀਕ ਵਿੱਚ · ${failed} ਅਸਫਲ`,
    settlementFailedCarriedLabel: "ਅਸਫਲ ਨਿਪਟਾਰਿਆਂ ਤੋਂ ਬਾਅਦ ਅਗਲੇ ਲਾਟ ਵਿੱਚ ਲਿਜਾਈ ਗਈ",
    settlementHeading: "ਜੇਤੂਆਂ ਦਾ ਨਿਪਟਾਰਾ",
    settlementRule:
      "ਕੀਮਤ B 'ਤੇ ਪੂਰੀ ਕੀਤੀ ਮਾਤਰਾ q ਲਈ, ਜਮ੍ਹਾਂ ਰਕਮ ਵਿੱਚੋਂ 2 × B × q ÷ 0.99 ਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਉਸ ਦਾ 1 % ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ। B × q ਦੀ ਇੱਕ ਪੁਜ਼ੀਸ਼ਨ ਵਿੱਚ q TTTI-T ਹੁੰਦੇ ਹਨ, ਅਤੇ ਅਦਾ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਪ੍ਰਤੀ TTTI-T B ਦੀ ਗਾਰੰਟੀ ਬਣਾਈ ਜਾਂਦੀ ਹੈ। ਜਮ੍ਹਾਂ ਰਕਮ ਦਾ ਬਾਕੀ ਹਿੱਸਾ DEX ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਜੇ ਕਿਸੇ ਜੇਤੂ ਦਾ ਨਿਪਟਾਰਾ ਅਸਫਲ ਹੋ ਜਾਵੇ, ਤਾਂ ਕੋਈ ਪੁਜ਼ੀਸ਼ਨ ਜਾਂ ਗਾਰੰਟੀ ਨਹੀਂ ਬਣਦੀ, ਪੂਰੀ ਜਮ੍ਹਾਂ ਰਕਮ DEX ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਕੀਤੀ ਜਾਂਦੀ ਹੈ ਅਤੇ ਮਾਤਰਾ ਅਗਲੇ ਲਾਟ ਵਿੱਚ ਲਿਜਾਈ ਜਾਂਦੀ ਹੈ। ਬਾਕੀ ਜੇਤੂਆਂ 'ਤੇ ਕੋਈ ਅਸਰ ਨਹੀਂ ਪੈਂਦਾ।",
    settleTaken: "ਜਮ੍ਹਾਂ ਰਕਮ ਵਿੱਚੋਂ ਲਈ ਗਈ ਰਕਮ",
    settleCreator: "ਸਿਰਜਣਹਾਰ ਦਾ ਹਿੱਸਾ (1 %)",
    settlePosition: "ਪੁਜ਼ੀਸ਼ਨ",
    settlePositionValue: (amount: string, quantity: string) =>
      `${amount}, ${quantity} TTTI-T ਸਮੇਤ`,
    settleGuarantee: "ਗਾਰੰਟੀ",
    settleSurplus: "DEX ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਕੀਤਾ ਜਮ੍ਹਾਂ ਰਕਮ ਦਾ ਵਾਧੂ ਹਿੱਸਾ",
    settleNoPosition: "ਪੁਜ਼ੀਸ਼ਨ ਅਤੇ ਗਾਰੰਟੀ",
    settleNone: "ਕੋਈ ਨਹੀਂ",
    settleDepositReturned: "ਪੂਰੀ ਜਮ੍ਹਾਂ ਰਕਮ DEX ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਕੀਤੀ",
    settleCarried: "ਅਗਲੇ ਲਾਟ ਵਿੱਚ ਲਿਜਾਈ ਗਈ ਮਾਤਰਾ",
    settleFailureReason: "ਕਾਰਨ",
  },
});
