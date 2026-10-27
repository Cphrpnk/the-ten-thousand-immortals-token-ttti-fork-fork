import { defineDict } from "../core/dict";

/**
 * Buyback: shared flow, Exchange section, TTTI-T wallet card entry, purchase
 * history status and the explanation message. English is authoritative.
 * Amounts, fees, prices, dates, block indexes and token symbols are passed in
 * already formatted in the reader's number and date format; never translated.
 * Generic approval expiry labels come from ADDRESS_BOOK_TEXT.
 */
export const BUYBACK_TEXT = defineDict({
  en: {
    // Exchange section and wallet entry
    sectionTitle: "Buyback",
    sectionIntro:
      "Buybacks are optional and limited. Each one depends on the funds available at that moment and on the willingness of whoever funds it. Bought-back TTTI-T go to the funder, who pays for them with their own money; they are never pre-mined or pre-allocated. For now, only the creator funds buybacks.",
    explainFunding:
      "The token returned is paid from the buyback funding account registered by the admin, within capped ICRC-2 approvals with an expiration. The TTTI-T bought back go to that account once the payout has succeeded. The admin chooses the wallet that holds it: Internet Identity, OISY, NFID Wallet or Plug.",
    walletEntry: "Buyback",
    walletEntryHint: "Return TTTI-T from a payment token's mass",
    // Purchase history
    historyLabel: "Buyback",
    historyNotEligible: "Not eligible for buyback",
    historyInMass: (symbol: string) => `Counted in the ${symbol} mass`,
    historyMassRemaining: (amount: string) =>
      `Remaining in the mass: ${amount}`,
    historyMassInProgress: "A buyback of this mass is in progress.",
    historyMassDone: "The mass is fully bought back.",
    historyMassTitle: "Buybacks by mass",
    historyMassRecord: (percent: string, symbol: string) =>
      `${percent} of the ${symbol} mass`,
    historyBoughtBack: (amount: string) => `TTTI-T bought back: ${amount}`,
    historyReturned: (amount: string) => `Returned: ${amount}`,
    historyDate: (date: string) => `Buyback on ${date}`,
    statusCompleted: "Bought back",
    statusInProgress: "Buyback in progress",
    statusPayoutFailed: "Payout failed",
    // Explanation message
    explainTitle: "How the buyback works",
    explainMass:
      "Each payment token has one average mass: ICP, ckBTC, ckUSDC and ckUSDT. BTC purchases count in the ckBTC mass. Masses of different tokens are never combined.",
    explainRatio:
      "The average ratio of a mass is the total net paid divided by the total TTTI-T received. Buybacks already made are deducted from the mass.",
    explainPercent:
      "You choose a percentage of the mass remainder, from 1% to 100%. 100% buys back the whole remainder. One buyback per mass at a time.",
    explainRule: (price: string) =>
      `The amount returned is the smaller of two quantities of the paid token: the pro-rata net quantity at the mass's average ratio, or the quantity worth the TTTI-T bought back at ${price} per TTTI-T at the day's rate.`,
    explainFees: (fee: string) =>
      `A ${fee} buyback fee and all third-party transfer fees are deducted from the amount returned.`,
    explainPurchaseFee: (fee: string) =>
      `The original ${fee} purchase fee is not refunded.`,
    explainBtc:
      "BTC purchases are refunded in ckBTC, which you convert to BTC yourself.",
    explainEligibility:
      "Only purchases from Version 26 onward are in a mass. TTTI-T received by transfer are not in any mass.",
    // Selection
    signInRequired: "Sign in with Internet Identity to request a buyback.",
    loading: "Loading masses…",
    loadError: "Masses could not be loaded.",
    retry: "Retry",
    massLabel: "Mass",
    massPlaceholder: "Choose a mass",
    massOption: (symbol: string, ttti: string, net: string) =>
      `${symbol} · ${ttti} · ${net}`,
    massPurchasesLabel: "Purchases in the mass",
    massRemainingTttiLabel: "Remaining TTTI-T",
    massRemainingNetLabel: "Remaining net paid",
    massRatioLabel: "Average ratio (net paid / TTTI-T received)",
    massInProgress:
      "A buyback of this mass is in progress. A new one can be requested once it ends.",
    percentLabel: "Percentage of the remainder",
    percentShare: (symbol: string) =>
      `Share of the remaining ${symbol} in the mass`,
    percentSummary: (percent: string, amount: string) =>
      `${percent} of the remainder: ${amount}`,
    percentRequired: "Choose a percentage to see the quote.",
    percentShareCapped: (symbol: string) =>
      `Share of your buyback maximum (${symbol})`,
    capNotice: (usable: string, remaining: string) =>
      `Maximum limited by your usable balance: ${usable} (wallet balance minus ledger fees), below the ${remaining} remaining in the mass.`,
    capTooLow: (usable: string, one: string, minimum: string) =>
      `Buyback unavailable: your usable balance (${usable}, wallet balance minus ledger fees) is below ${one} of the mass (${minimum}).`,
    noEligible: "No mass has TTTI-T left to buy back.",
    // Quote
    quoteTitle: "Quote",
    quoteLoading: "Calculating the quote…",
    quoteNote:
      "The quote follows the day's rate and is calculated again at the request.",
    tttiReturnedLabel: "TTTI-T bought back",
    originalNetLabel: "Pro-rata net quantity",
    baseLabel: "Base quantity",
    ruleLabel: "Rule applied",
    ruleOriginalNet: "Pro-rata net quantity at the average ratio (smaller)",
    ruleDayRate: "Value of the TTTI-T at the day's rate (smaller)",
    feeLabel: (fee: string) => `Buyback fee (${fee})`,
    thirdPartyLabel: "Third-party transfer fees",
    tttiFeeLabel: "TTTI-T transfer fee",
    amountReturnedLabel: "Amount returned",
    notRecorded: "Not recorded",
    // Quote breakdown
    breakdownTitle: "Calculation step by step",
    bdMassLabel: (symbol: string) =>
      `${symbol} mass: net paid / TTTI-T received`,
    bdPriorLabel: "Previous buybacks deducted",
    bdRatioLabel: "Average ratio (net paid / remaining TTTI-T)",
    bdTttiLabel: (price: string) => `TTTI-T bought back at ${price} per TTTI-T`,
    bdRateLabel: "Day's rate in the quote",
    bdALabel: "A · Pro-rata net quantity at the average ratio",
    bdBLabel: "B · Quantity worth the TTTI-T bought back at the day's rate",
    bdUsesA: (a: string, b: string) =>
      `Value used: A, the lower of the two (${a} against ${b} for B).`,
    bdUsesB: (a: string, b: string) =>
      `Value used: B, the lower of the two (${b} against ${a} for A).`,
    bdReturnedFeeLabel: (symbol: string) => `${symbol} transfer fee`,
    bdTttiFeeLabel: "TTTI-T transfer fee, taken from your TTTI-T balance",
    summarySend: (
      ttti: string,
      tttiUsd: string,
      amount: string,
      amountUsd: string,
    ) =>
      `You send ${ttti} (about ${tttiUsd}) and receive ${amount} (about ${amountUsd}).`,
    // Step 1: approval
    step1Title: "Step 1 of 2 · Approve TTTI-T",
    approvalIntro: (amount: string) =>
      `Allow the contract to take at most ${amount} from your TTTI-T balance for this buyback. Choose an expiration, read the warnings, then confirm.`,
    approvalInPlace: (amount: string, date: string) =>
      `An approval of ${amount} for the contract is in place until ${date}.`,
    approvalAmountLabel: "Maximum amount",
    spenderLabel: "Contract (spender)",
    approvalFeeLine: (fee: string) => `Ledger fee for the approval: ${fee}`,
    balanceLine: (amount: string) => `Balance: ${amount}`,
    warnCapped:
      "The approval is capped at the amount this buyback requires and ends at the chosen expiration.",
    warnFee:
      "The approval costs a TTTI-T ledger fee, even if the buyback is not requested.",
    warnUnused: "An unused approval stays valid until it expires.",
    warnIrreversible:
      "A buyback cannot be undone once the payout has succeeded.",
    warnOverBalance:
      "The amount exceeds your current TTTI-T balance. The buyback fails until the balance covers it.",
    warnLongLived: "This approval stays valid for more than 24 hours.",
    approveConfirm:
      "I approve the contract to take this TTTI-T amount for this buyback.",
    approveButton: "Approve TTTI-T",
    approving: "Signing…",
    approveDone: "TTTI-T approval recorded.",
    approveError: "The approval was not recorded.",
    // Step 2: request
    step2Title: "Step 2 of 2 · Confirm the buyback",
    requestIntro: (ttti: string, amount: string) =>
      `${ttti} stay in the contract's holding account until the payout succeeds, then go to the funder, and you receive ${amount}, as calculated at the request. If every payout attempt is refused by the ledger, you can cancel and get them back. Otherwise, cancelling waits until the admin has checked the payout.`,
    requestConfirm:
      "I confirm this buyback. It cannot be undone once the payout has succeeded.",
    requestButton: "Request buyback",
    requesting: "Processing the buyback…",
    cancel: "Cancel",
    back: "Back",
    // Result
    resultCompleted: "Buyback completed.",
    resultInProgress: "Buyback in progress.",
    resultPayoutFailed:
      "Your TTTI-T are with the funder and the payout failed. Retry the payout, or contact the admin to have them returned.",
    resultEscrowPayoutFailed:
      "Your TTTI-T are held in the contract's holding account and the payout failed. Retry the payout, or cancel if the ledger refused every attempt.",
    resultMessage: (message: string) => `Details: ${message}`,
    pullBlockLabel: "TTTI-T block",
    payoutBlockLabel: (symbol: string) => `${symbol} payout block`,
    retryPayout: "Retry payout",
    retrying: "Retrying…",
    newBuyback: "New buyback",
    // Errors
    errAnonymous: "Sign in to request a buyback.",
    errNotBuyer: "Only the buyer can request or retry this buyback.",
    errInProgress: "A buyback is already in progress.",
    errInvalidPercent: "Choose a percentage from 1% to 100%.",
    errNothingRemaining: "Nothing remains to buy back in this mass.",
    errMassInProgress: "A buyback of this mass is already in progress.",
    errBuybackNotFound: "This buyback was not found.",
    errRateUnavailable: (symbol: string) =>
      `No valid ${symbol} rate is available. Try again later.`,
    errAdminAccountNotSet:
      "Buybacks are not available yet: the funding account is not set.",
    errAdminAllowanceInsufficient: (symbol: string) =>
      `The ${symbol} funds approved for buybacks do not cover this amount. Try again later.`,
    errAdminAllowanceExpired: (symbol: string) =>
      `The ${symbol} funding approval for buybacks has expired. Try again later.`,
    errAdminBalanceInsufficient: (symbol: string) =>
      `The ${symbol} buyback funds do not cover this amount. Try again later.`,
    errReceiveTokenMismatch:
      "The buyback is paid only in the token you paid with.",
    errBuyerAllowance: (required: string, allowance: string) =>
      `Your TTTI-T approval for the contract is ${allowance}; ${required} is required. Approve again.`,
    errAmountTooSmall:
      "The amount returned would not cover the fees. No buyback is possible.",
    errNotRetryable: "This buyback has no failed payout to retry.",
    errPullFailed: (detail: string) =>
      `The TTTI-T could not be taken: ${detail}`,
    errPayoutFailed: (detail: string) => `The payout failed: ${detail}`,
    errCallFailed: (detail: string) => `The request failed: ${detail}`,
    // Escrow, payment attempts and cancellation
    statusCancelled: "Cancelled",
    tttiEscrowFeeLabel: "Second TTTI-T transfer fee (escrow)",
    bdTttiEscrowFeeLabel:
      "Second TTTI-T transfer fee, for the release or return of the escrowed TTTI-T, taken from your TTTI-T balance",
    approvalTwoFees:
      "This amount is the TTTI-T bought back plus two TTTI-T transfer fees: one to hold the TTTI-T in escrow, one to release or return them.",
    attemptFailed: (reason: string) =>
      `Latest payment attempt failed: ${reason}`,
    attemptUnknown: "Latest payment attempt: outcome unknown.",
    attemptToReview:
      "Latest payment attempt: outcome unknown, to be checked by the admin.",
    cancelBlockLabel: "TTTI-T return block",
    cancelButton: "Cancel buyback",
    cancelTitle: "Cancel this buyback?",
    cancelDescription: (amount: string) =>
      `No payment is made. The ${amount} held in escrow return to your account. The two TTTI-T transfer fees are not refunded.`,
    cancelConfirm: "Cancel the buyback",
    cancelKeep: "Keep the buyback",
    cancelling: "Cancelling…",
    cancelDone: "Buyback cancelled. The TTTI-T were returned to your account.",
    resultCancelled:
      "Buyback cancelled. The TTTI-T held in escrow were returned to your account.",
    errSalesPaused: "Buybacks are paused.",
    errNotCancellable:
      "This buyback cannot be cancelled. Only a failed payout whose every attempt was refused can be cancelled.",
    errAttemptUnknown:
      "A payment attempt has an unknown outcome. The buyback cannot be cancelled until it is known.",
    errAttemptArrived:
      "A payment attempt arrived. The buyback cannot be cancelled.",
    errNotLegacy:
      "This action applies only to buybacks recorded before the escrow.",
    errNotAuthorized: "Only the buyer or the admin can cancel this buyback.",
    errCancelFailed: (detail: string) =>
      `The TTTI-T could not be returned: ${detail}`,
    errReleaseFailed: (detail: string) =>
      `The TTTI-T could not be released to the funding account: ${detail}`,
  },
  fr: {
    sectionTitle: "Rachat",
    sectionIntro:
      "Les rachats sont facultatifs et limités. Chacun dépend des fonds disponibles à ce moment-là et de la volonté de celui qui le finance. Les TTTI-T rachetés vont au financeur, qui les paie avec son propre argent ; ils ne sont jamais pré-minés ni pré-alloués. Pour l'instant, seul le créateur finance les rachats.",
    explainFunding:
      "Le jeton rendu est payé depuis le compte de financement du rachat enregistré par l'admin, dans la limite d'approvals ICRC-2 plafonnées avec expiration. Les TTTI-T rachetés vont sur ce compte une fois le versement réussi. L'admin choisit le wallet qui le détient : Internet Identity, OISY, NFID Wallet ou Plug.",
    walletEntry: "Rachat",
    walletEntryHint: "Rendre des TTTI-T de la masse d'un jeton de paiement",
    historyLabel: "Rachat",
    historyNotEligible: "Non éligible au rachat",
    historyInMass: (symbol: string) => `Compté dans la masse ${symbol}`,
    historyMassRemaining: (amount: string) => `Reste dans la masse : ${amount}`,
    historyMassInProgress: "Un rachat de cette masse est en cours.",
    historyMassDone: "La masse est entièrement rachetée.",
    historyMassTitle: "Rachats par masse",
    historyMassRecord: (percent: string, symbol: string) =>
      `${percent} de la masse ${symbol}`,
    historyBoughtBack: (amount: string) => `TTTI-T rachetés : ${amount}`,
    historyReturned: (amount: string) => `Rendu : ${amount}`,
    historyDate: (date: string) => `Rachat le ${date}`,
    statusCompleted: "Racheté",
    statusInProgress: "Rachat en cours",
    statusPayoutFailed: "Versement échoué",
    explainTitle: "Comment fonctionne le rachat",
    explainMass:
      "Chaque jeton de paiement a une masse moyenne : ICP, ckBTC, ckUSDC et ckUSDT. Les achats en BTC comptent dans la masse ckBTC. Les masses de jetons différents ne sont jamais regroupées.",
    explainRatio:
      "Le ratio moyen d'une masse est le total net payé divisé par le total des TTTI-T reçus. Les rachats déjà faits sont déduits de la masse.",
    explainPercent:
      "Vous choisissez un pourcentage du reste de la masse, de 1 % à 100 %. 100 % rachète tout le reste. Un seul rachat par masse à la fois.",
    explainRule: (price: string) =>
      `Le montant rendu est la plus petite de deux quantités du jeton payé : la quantité nette au prorata au ratio moyen de la masse, ou la quantité valant les TTTI-T rachetés à ${price} par TTTI-T au taux du jour.`,
    explainFees: (fee: string) =>
      `Des frais de rachat de ${fee} et tous les frais de transfert des tiers sont déduits du montant rendu.`,
    explainPurchaseFee: (fee: string) =>
      `Les frais d'achat d'origine de ${fee} ne sont pas remboursés.`,
    explainBtc:
      "Les achats en BTC sont remboursés en ckBTC, que vous convertissez vous-même en BTC.",
    explainEligibility:
      "Seuls les achats faits à partir de la Version 26 sont dans une masse. Les TTTI-T reçus par transfert ne sont dans aucune masse.",
    signInRequired:
      "Connectez-vous avec Internet Identity pour demander un rachat.",
    loading: "Chargement des masses…",
    loadError: "Les masses n'ont pas pu être chargées.",
    retry: "Réessayer",
    massLabel: "Masse",
    massPlaceholder: "Choisissez une masse",
    massOption: (symbol: string, ttti: string, net: string) =>
      `${symbol} · ${ttti} · ${net}`,
    massPurchasesLabel: "Achats dans la masse",
    massRemainingTttiLabel: "TTTI-T restants",
    massRemainingNetLabel: "Net payé restant",
    massRatioLabel: "Ratio moyen (net payé / TTTI-T reçus)",
    massInProgress:
      "Un rachat de cette masse est en cours. Un nouveau rachat pourra être demandé une fois celui-ci terminé.",
    percentLabel: "Pourcentage du reste",
    percentShare: (symbol: string) =>
      `Part des ${symbol} restants dans la masse`,
    percentSummary: (percent: string, amount: string) =>
      `${percent} du reste : ${amount}`,
    percentRequired: "Choisissez un pourcentage pour voir le devis.",
    percentShareCapped: (symbol: string) =>
      `Part de votre maximum de rachat (${symbol})`,
    capNotice: (usable: string, remaining: string) =>
      `Maximum limité par votre solde utilisable : ${usable} (solde du wallet moins les frais du ledger), inférieur aux ${remaining} restants dans la masse.`,
    capTooLow: (usable: string, one: string, minimum: string) =>
      `Rachat impossible : votre solde utilisable (${usable}, solde du wallet moins les frais du ledger) est inférieur à ${one} de la masse (${minimum}).`,
    noEligible: "Aucune masse n'a de TTTI-T à racheter.",
    quoteTitle: "Devis",
    quoteLoading: "Calcul du devis…",
    quoteNote:
      "Le devis suit le taux du jour et est recalculé au moment de la demande.",
    tttiReturnedLabel: "TTTI-T rachetés",
    originalNetLabel: "Quantité nette au prorata",
    baseLabel: "Quantité de base",
    ruleLabel: "Règle appliquée",
    ruleOriginalNet:
      "Quantité nette au prorata au ratio moyen (la plus petite)",
    ruleDayRate: "Valeur des TTTI-T au taux du jour (la plus petite)",
    feeLabel: (fee: string) => `Frais de rachat (${fee})`,
    thirdPartyLabel: "Frais de transfert des tiers",
    tttiFeeLabel: "Frais de transfert TTTI-T",
    amountReturnedLabel: "Montant rendu",
    notRecorded: "Non enregistré",
    breakdownTitle: "Calcul étape par étape",
    bdMassLabel: (symbol: string) =>
      `Masse ${symbol} : net payé / TTTI-T reçus`,
    bdPriorLabel: "Rachats précédents déduits",
    bdRatioLabel: "Ratio moyen (net payé / TTTI-T restants)",
    bdTttiLabel: (price: string) => `TTTI-T rachetés à ${price} par TTTI-T`,
    bdRateLabel: "Taux du jour dans le devis",
    bdALabel: "A · Quantité nette au prorata au ratio moyen",
    bdBLabel: "B · Quantité valant les TTTI-T rachetés au taux du jour",
    bdUsesA: (a: string, b: string) =>
      `Valeur retenue : A, la plus basse des deux (${a} contre ${b} pour B).`,
    bdUsesB: (a: string, b: string) =>
      `Valeur retenue : B, la plus basse des deux (${b} contre ${a} pour A).`,
    bdReturnedFeeLabel: (symbol: string) => `Frais de transfert ${symbol}`,
    bdTttiFeeLabel: "Frais de transfert TTTI-T, pris sur votre solde TTTI-T",
    summarySend: (
      ttti: string,
      tttiUsd: string,
      amount: string,
      amountUsd: string,
    ) =>
      `Vous envoyez ${ttti} (environ ${tttiUsd}) et recevez ${amount} (environ ${amountUsd}).`,
    step1Title: "Étape 1 sur 2 · Approuver les TTTI-T",
    approvalIntro: (amount: string) =>
      `Autorisez le contrat à prendre au plus ${amount} de votre solde TTTI-T pour ce rachat. Choisissez une expiration, lisez les avertissements, puis confirmez.`,
    approvalInPlace: (amount: string, date: string) =>
      `Une approval de ${amount} pour le contrat est en place jusqu'au ${date}.`,
    approvalAmountLabel: "Montant maximal",
    spenderLabel: "Contrat (spender)",
    approvalFeeLine: (fee: string) =>
      `Frais du ledger pour l'approval : ${fee}`,
    balanceLine: (amount: string) => `Solde : ${amount}`,
    warnCapped:
      "L'approval est plafonnée au montant requis par ce rachat et prend fin à l'expiration choisie.",
    warnFee:
      "L'approval coûte des frais de ledger TTTI-T, même si le rachat n'est pas demandé.",
    warnUnused: "Une approval inutilisée reste valable jusqu'à son expiration.",
    warnIrreversible:
      "Un rachat ne peut plus être annulé une fois le versement réussi.",
    warnOverBalance:
      "Le montant dépasse votre solde TTTI-T actuel. Le rachat échoue tant que le solde ne le couvre pas.",
    warnLongLived: "Cette approval reste valable plus de 24 heures.",
    approveConfirm:
      "J'autorise le contrat à prendre ce montant de TTTI-T pour ce rachat.",
    approveButton: "Approuver les TTTI-T",
    approving: "Signature…",
    approveDone: "Approval TTTI-T enregistrée.",
    approveError: "L'approval n'a pas été enregistrée.",
    step2Title: "Étape 2 sur 2 · Confirmer le rachat",
    requestIntro: (ttti: string, amount: string) =>
      `${ttti} restent sur le compte de séquestre du contrat jusqu'à la réussite du versement, puis vont au financeur, et vous recevez ${amount}, selon le calcul fait au moment de la demande. Si chaque tentative de versement est refusée par le ledger, vous pouvez annuler et les récupérer. Sinon, l'annulation attend que l'admin ait vérifié le versement.`,
    requestConfirm:
      "Je confirme ce rachat. Il ne peut plus être annulé une fois le versement réussi.",
    requestButton: "Demander le rachat",
    requesting: "Rachat en cours de traitement…",
    cancel: "Annuler",
    back: "Retour",
    resultCompleted: "Rachat terminé.",
    resultInProgress: "Rachat en cours.",
    resultPayoutFailed:
      "Vos TTTI-T sont chez le financeur et le versement a échoué. Relancez le versement, ou contactez l'admin pour qu'ils vous soient rendus.",
    resultEscrowPayoutFailed:
      "Vos TTTI-T sont sur le compte de séquestre du contrat et le versement a échoué. Relancez le versement, ou annulez si le ledger a refusé chaque tentative.",
    resultMessage: (message: string) => `Détails : ${message}`,
    pullBlockLabel: "Bloc TTTI-T",
    payoutBlockLabel: (symbol: string) => `Bloc du versement ${symbol}`,
    retryPayout: "Relancer le versement",
    retrying: "Nouvelle tentative…",
    newBuyback: "Nouveau rachat",
    errAnonymous: "Connectez-vous pour demander un rachat.",
    errNotBuyer: "Seul l'acheteur peut demander ou relancer ce rachat.",
    errInProgress: "Un rachat est déjà en cours.",
    errInvalidPercent: "Choisissez un pourcentage de 1 % à 100 %.",
    errNothingRemaining: "Il ne reste rien à racheter dans cette masse.",
    errMassInProgress: "Un rachat de cette masse est déjà en cours.",
    errBuybackNotFound: "Ce rachat est introuvable.",
    errRateUnavailable: (symbol: string) =>
      `Aucun taux ${symbol} valide n'est disponible. Réessayez plus tard.`,
    errAdminAccountNotSet:
      "Les rachats ne sont pas encore disponibles : le compte de financement n'est pas défini.",
    errAdminAllowanceInsufficient: (symbol: string) =>
      `Les fonds ${symbol} approuvés pour les rachats ne couvrent pas ce montant. Réessayez plus tard.`,
    errAdminAllowanceExpired: (symbol: string) =>
      `L'approval de financement ${symbol} des rachats a expiré. Réessayez plus tard.`,
    errAdminBalanceInsufficient: (symbol: string) =>
      `Les fonds de rachat en ${symbol} ne couvrent pas ce montant. Réessayez plus tard.`,
    errReceiveTokenMismatch:
      "Le rachat se paie uniquement dans le jeton utilisé pour l'achat.",
    errBuyerAllowance: (required: string, allowance: string) =>
      `Votre approval TTTI-T pour le contrat est de ${allowance} ; ${required} sont requis. Approuvez à nouveau.`,
    errAmountTooSmall:
      "Le montant rendu ne couvrirait pas les frais. Aucun rachat n'est possible.",
    errNotRetryable: "Ce rachat n'a aucun versement échoué à relancer.",
    errPullFailed: (detail: string) =>
      `Les TTTI-T n'ont pas pu être pris : ${detail}`,
    errPayoutFailed: (detail: string) => `Le versement a échoué : ${detail}`,
    errCallFailed: (detail: string) => `La demande a échoué : ${detail}`,
    statusCancelled: "Annulé",
    tttiEscrowFeeLabel: "Second frais de transfert TTTI-T (séquestre)",
    bdTttiEscrowFeeLabel:
      "Second frais de transfert TTTI-T, pour la libération ou le retour des TTTI-T en séquestre, pris sur votre solde TTTI-T",
    approvalTwoFees:
      "Ce montant correspond aux TTTI-T rachetés plus deux frais de transfert TTTI-T : l'un pour placer les TTTI-T en séquestre, l'autre pour les libérer ou les rendre.",
    attemptFailed: (reason: string) =>
      `Dernière tentative de paiement échouée : ${reason}`,
    attemptUnknown: "Dernière tentative de paiement : issue inconnue.",
    attemptToReview:
      "Dernière tentative de paiement : issue inconnue, à vérifier par l'admin.",
    cancelBlockLabel: "Bloc de retour TTTI-T",
    cancelButton: "Annuler le rachat",
    cancelTitle: "Annuler ce rachat ?",
    cancelDescription: (amount: string) =>
      `Aucun paiement n'est effectué. Les ${amount} en séquestre reviennent sur votre compte. Les deux frais de transfert TTTI-T ne sont pas remboursés.`,
    cancelConfirm: "Annuler le rachat",
    cancelKeep: "Garder le rachat",
    cancelling: "Annulation…",
    cancelDone: "Rachat annulé. Les TTTI-T ont été rendus sur votre compte.",
    resultCancelled:
      "Rachat annulé. Les TTTI-T en séquestre ont été rendus sur votre compte.",
    errSalesPaused: "Les rachats sont en pause.",
    errNotCancellable:
      "Ce rachat ne peut pas être annulé. Seul un versement échoué dont toutes les tentatives ont été refusées peut être annulé.",
    errAttemptUnknown:
      "Une tentative de paiement a une issue inconnue. Le rachat ne peut pas être annulé tant qu'elle n'est pas connue.",
    errAttemptArrived:
      "Une tentative de paiement est arrivée. Le rachat ne peut pas être annulé.",
    errNotLegacy:
      "Cette action ne s'applique qu'aux rachats enregistrés avant le séquestre.",
    errNotAuthorized: "Seuls l'acheteur ou l'admin peuvent annuler ce rachat.",
    errCancelFailed: (detail: string) =>
      `Les TTTI-T n'ont pas pu être rendus : ${detail}`,
    errReleaseFailed: (detail: string) =>
      `Les TTTI-T n'ont pas pu être libérés vers le compte de financement : ${detail}`,
  },
  es: {
    sectionTitle: "Recompra",
    sectionIntro:
      "Las recompras son opcionales y limitadas. Cada una depende de los fondos disponibles en ese momento y de la voluntad de quien la financia. Los TTTI-T recomprados van al financiador, que los paga con su propio dinero; nunca se preminan ni se preasignan. Por ahora, solo el creador financia las recompras.",
    explainFunding:
      "El token devuelto se paga desde la cuenta de financiación de recompras registrada por el administrador, dentro de aprobaciones ICRC-2 limitadas y con vencimiento. Los TTTI-T recomprados van a esa cuenta una vez que el pago se ha realizado con éxito. El administrador elige el wallet que la contiene: Internet Identity, OISY, NFID Wallet o Plug.",
    walletEntry: "Recompra",
    walletEntryHint: "Devolver TTTI-T de la masa de un token de pago",
    historyLabel: "Recompra",
    historyNotEligible: "No apta para recompra",
    historyInMass: (symbol: string) => `Incluida en la masa ${symbol}`,
    historyMassRemaining: (amount: string) => `Resto en la masa: ${amount}`,
    historyMassInProgress: "Hay una recompra de esta masa en curso.",
    historyMassDone: "La masa está recomprada por completo.",
    historyMassTitle: "Recompras por masa",
    historyMassRecord: (percent: string, symbol: string) =>
      `${percent} de la masa ${symbol}`,
    historyBoughtBack: (amount: string) => `TTTI-T recomprados: ${amount}`,
    historyReturned: (amount: string) => `Devuelto: ${amount}`,
    historyDate: (date: string) => `Recompra el ${date}`,
    statusCompleted: "Recomprada",
    statusInProgress: "Recompra en curso",
    statusPayoutFailed: "Pago fallido",
    explainTitle: "Cómo funciona la recompra",
    explainMass:
      "Cada token de pago tiene una masa media: ICP, ckBTC, ckUSDC y ckUSDT. Las compras en BTC cuentan en la masa ckBTC. Las masas de tokens distintos nunca se combinan.",
    explainRatio:
      "El ratio medio de una masa es el total neto pagado dividido entre el total de TTTI-T recibidos. Las recompras ya hechas se descuentan de la masa.",
    explainPercent:
      "Eliges un porcentaje del resto de la masa, del 1 % al 100 %. El 100 % recompra todo el resto. Una sola recompra por masa a la vez.",
    explainRule: (price: string) =>
      `El importe devuelto es la menor de dos cantidades del token pagado: la cantidad neta proporcional al ratio medio de la masa, o la cantidad que valen los TTTI-T recomprados a ${price} por TTTI-T al tipo del día.`,
    explainFees: (fee: string) =>
      `Se descuentan del importe devuelto una comisión de recompra del ${fee} y todas las comisiones de transferencia de terceros.`,
    explainPurchaseFee: (fee: string) =>
      `La comisión de compra original del ${fee} no se reembolsa.`,
    explainBtc:
      "Las compras en BTC se reembolsan en ckBTC, que tú mismo conviertes a BTC.",
    explainEligibility:
      "Solo las compras desde la Versión 26 están en una masa. Los TTTI-T recibidos por transferencia no están en ninguna masa.",
    signInRequired:
      "Inicia sesión con Internet Identity para pedir una recompra.",
    loading: "Cargando masas…",
    loadError: "No se pudieron cargar las masas.",
    retry: "Reintentar",
    massLabel: "Masa",
    massPlaceholder: "Elige una masa",
    massOption: (symbol: string, ttti: string, net: string) =>
      `${symbol} · ${ttti} · ${net}`,
    massPurchasesLabel: "Compras en la masa",
    massRemainingTttiLabel: "TTTI-T restantes",
    massRemainingNetLabel: "Neto pagado restante",
    massRatioLabel: "Ratio medio (neto pagado / TTTI-T recibidos)",
    massInProgress:
      "Hay una recompra de esta masa en curso. Se podrá pedir otra cuando termine.",
    percentLabel: "Porcentaje del resto",
    percentShare: (symbol: string) =>
      `Parte de los ${symbol} restantes en la masa`,
    percentSummary: (percent: string, amount: string) =>
      `${percent} del resto: ${amount}`,
    percentRequired: "Elige un porcentaje para ver el presupuesto.",
    percentShareCapped: (symbol: string) =>
      `Parte de tu máximo de recompra (${symbol})`,
    capNotice: (usable: string, remaining: string) =>
      `Máximo limitado por tu saldo utilizable: ${usable} (saldo del wallet menos las comisiones del ledger), inferior a los ${remaining} restantes en la masa.`,
    capTooLow: (usable: string, one: string, minimum: string) =>
      `Recompra no disponible: tu saldo utilizable (${usable}, saldo del wallet menos las comisiones del ledger) es inferior al ${one} de la masa (${minimum}).`,
    noEligible: "Ninguna masa tiene TTTI-T por recomprar.",
    quoteTitle: "Presupuesto",
    quoteLoading: "Calculando el presupuesto…",
    quoteNote:
      "El presupuesto sigue el tipo del día y se vuelve a calcular en la solicitud.",
    tttiReturnedLabel: "TTTI-T recomprados",
    originalNetLabel: "Cantidad neta proporcional",
    baseLabel: "Cantidad base",
    ruleLabel: "Regla aplicada",
    ruleOriginalNet: "Cantidad neta proporcional al ratio medio (la menor)",
    ruleDayRate: "Valor de los TTTI-T al tipo del día (la menor)",
    feeLabel: (fee: string) => `Comisión de recompra (${fee})`,
    thirdPartyLabel: "Comisiones de transferencia de terceros",
    tttiFeeLabel: "Comisión de transferencia TTTI-T",
    amountReturnedLabel: "Importe devuelto",
    notRecorded: "No registrado",
    breakdownTitle: "Cálculo paso a paso",
    bdMassLabel: (symbol: string) =>
      `Masa ${symbol}: neto pagado / TTTI-T recibidos`,
    bdPriorLabel: "Recompras anteriores descontadas",
    bdRatioLabel: "Ratio medio (neto pagado / TTTI-T restantes)",
    bdTttiLabel: (price: string) => `TTTI-T recomprados a ${price} por TTTI-T`,
    bdRateLabel: "Tipo del día en el presupuesto",
    bdALabel: "A · Cantidad neta proporcional al ratio medio",
    bdBLabel: "B · Cantidad que valen los TTTI-T recomprados al tipo del día",
    bdUsesA: (a: string, b: string) =>
      `Valor aplicado: A, el menor de los dos (${a} frente a ${b} de B).`,
    bdUsesB: (a: string, b: string) =>
      `Valor aplicado: B, el menor de los dos (${b} frente a ${a} de A).`,
    bdReturnedFeeLabel: (symbol: string) =>
      `Comisión de transferencia de ${symbol}`,
    bdTttiFeeLabel:
      "Comisión de transferencia TTTI-T, tomada de tu saldo de TTTI-T",
    summarySend: (
      ttti: string,
      tttiUsd: string,
      amount: string,
      amountUsd: string,
    ) =>
      `Envías ${ttti} (unos ${tttiUsd}) y recibes ${amount} (unos ${amountUsd}).`,
    step1Title: "Paso 1 de 2 · Aprobar TTTI-T",
    approvalIntro: (amount: string) =>
      `Permite al contrato tomar como máximo ${amount} de tu saldo de TTTI-T para esta recompra. Elige una expiración, lee las advertencias y confirma.`,
    approvalInPlace: (amount: string, date: string) =>
      `Hay una aprobación de ${amount} para el contrato vigente hasta el ${date}.`,
    approvalAmountLabel: "Importe máximo",
    spenderLabel: "Contrato (spender)",
    approvalFeeLine: (fee: string) =>
      `Comisión del ledger por la aprobación: ${fee}`,
    balanceLine: (amount: string) => `Saldo: ${amount}`,
    warnCapped:
      "La aprobación está limitada al importe que requiere esta recompra y termina en la expiración elegida.",
    warnFee:
      "La aprobación cuesta una comisión del ledger TTTI-T, aunque no se pida la recompra.",
    warnUnused: "Una aprobación sin usar sigue vigente hasta que expire.",
    warnIrreversible:
      "Una recompra no se puede deshacer una vez que el pago se ha realizado con éxito.",
    warnOverBalance:
      "El importe supera tu saldo actual de TTTI-T. La recompra falla mientras el saldo no lo cubra.",
    warnLongLived: "Esta aprobación sigue vigente más de 24 horas.",
    approveConfirm:
      "Autorizo al contrato a tomar este importe de TTTI-T para esta recompra.",
    approveButton: "Aprobar TTTI-T",
    approving: "Firmando…",
    approveDone: "Aprobación de TTTI-T registrada.",
    approveError: "La aprobación no se registró.",
    step2Title: "Paso 2 de 2 · Confirmar la recompra",
    requestIntro: (ttti: string, amount: string) =>
      `${ttti} permanecen en la cuenta de custodia del contrato hasta que el pago se realiza con éxito, luego van al financiador, y recibes ${amount}, según el cálculo hecho en la solicitud. Si el ledger rechaza todos los intentos de pago, puedes cancelar y recuperarlos. De lo contrario, la cancelación espera a que el administrador haya verificado el pago.`,
    requestConfirm:
      "Confirmo esta recompra. No se puede deshacer una vez que el pago se ha realizado con éxito.",
    requestButton: "Pedir la recompra",
    requesting: "Procesando la recompra…",
    cancel: "Cancelar",
    back: "Volver",
    resultCompleted: "Recompra completada.",
    resultInProgress: "Recompra en curso.",
    resultPayoutFailed:
      "Tus TTTI-T están con el financiador y el pago falló. Reintenta el pago o contacta al administrador para que te los devuelvan.",
    resultEscrowPayoutFailed:
      "Tus TTTI-T están en la cuenta de custodia del contrato y el pago falló. Reintenta el pago o cancela si el ledger rechazó todos los intentos.",
    resultMessage: (message: string) => `Detalles: ${message}`,
    pullBlockLabel: "Bloque TTTI-T",
    payoutBlockLabel: (symbol: string) => `Bloque del pago en ${symbol}`,
    retryPayout: "Reintentar el pago",
    retrying: "Reintentando…",
    newBuyback: "Nueva recompra",
    errAnonymous: "Inicia sesión para pedir una recompra.",
    errNotBuyer: "Solo el comprador puede pedir o reintentar esta recompra.",
    errInProgress: "Ya hay una recompra en curso.",
    errInvalidPercent: "Elige un porcentaje del 1 % al 100 %.",
    errNothingRemaining: "No queda nada por recomprar en esta masa.",
    errMassInProgress: "Ya hay una recompra de esta masa en curso.",
    errBuybackNotFound: "No se encontró esta recompra.",
    errRateUnavailable: (symbol: string) =>
      `No hay un tipo ${symbol} válido. Inténtalo más tarde.`,
    errAdminAccountNotSet:
      "Las recompras aún no están disponibles: la cuenta de financiación no está definida.",
    errAdminAllowanceInsufficient: (symbol: string) =>
      `Los fondos en ${symbol} aprobados para recompras no cubren este importe. Inténtalo más tarde.`,
    errAdminAllowanceExpired: (symbol: string) =>
      `La aprobación de financiación en ${symbol} para recompras ha expirado. Inténtalo más tarde.`,
    errAdminBalanceInsufficient: (symbol: string) =>
      `Los fondos de recompra en ${symbol} no cubren este importe. Inténtalo más tarde.`,
    errReceiveTokenMismatch:
      "La recompra se paga únicamente en el token con el que pagaste.",
    errBuyerAllowance: (required: string, allowance: string) =>
      `Tu aprobación de TTTI-T para el contrato es de ${allowance}; se requieren ${required}. Aprueba de nuevo.`,
    errAmountTooSmall:
      "El importe devuelto no cubriría las comisiones. No es posible la recompra.",
    errNotRetryable:
      "Esta recompra no tiene ningún pago fallido que reintentar.",
    errPullFailed: (detail: string) =>
      `No se pudieron tomar los TTTI-T: ${detail}`,
    errPayoutFailed: (detail: string) => `El pago falló: ${detail}`,
    errCallFailed: (detail: string) => `La solicitud falló: ${detail}`,
    statusCancelled: "Cancelada",
    tttiEscrowFeeLabel: "Segunda comisión de transferencia TTTI-T (custodia)",
    bdTttiEscrowFeeLabel:
      "Segunda comisión de transferencia TTTI-T, para la liberación o devolución de los TTTI-T en custodia, tomada de su saldo TTTI-T",
    approvalTwoFees:
      "Este importe corresponde a los TTTI-T recomprados más dos comisiones de transferencia TTTI-T: una para mantener los TTTI-T en custodia y otra para liberarlos o devolverlos.",
    attemptFailed: (reason: string) =>
      `El último intento de pago falló: ${reason}`,
    attemptUnknown: "Último intento de pago: resultado desconocido.",
    attemptToReview:
      "Último intento de pago: resultado desconocido, pendiente de verificación por el administrador.",
    cancelBlockLabel: "Bloque de devolución TTTI-T",
    cancelButton: "Cancelar la recompra",
    cancelTitle: "¿Cancelar esta recompra?",
    cancelDescription: (amount: string) =>
      `No se realiza ningún pago. Los ${amount} en custodia vuelven a su cuenta. Las dos comisiones de transferencia TTTI-T no se reembolsan.`,
    cancelConfirm: "Cancelar la recompra",
    cancelKeep: "Mantener la recompra",
    cancelling: "Cancelando…",
    cancelDone: "Recompra cancelada. Los TTTI-T se devolvieron a su cuenta.",
    resultCancelled:
      "Recompra cancelada. Los TTTI-T en custodia se devolvieron a su cuenta.",
    errSalesPaused: "Las recompras están en pausa.",
    errNotCancellable:
      "Esta recompra no se puede cancelar. Solo se puede cancelar un pago fallido cuyos intentos fueron todos rechazados.",
    errAttemptUnknown:
      "Un intento de pago tiene un resultado desconocido. La recompra no se puede cancelar hasta que se conozca.",
    errAttemptArrived:
      "Un intento de pago llegó. La recompra no se puede cancelar.",
    errNotLegacy:
      "Esta acción solo se aplica a las recompras registradas antes de la custodia.",
    errNotAuthorized:
      "Solo el comprador o el administrador pueden cancelar esta recompra.",
    errCancelFailed: (detail: string) =>
      `No se pudieron devolver los TTTI-T: ${detail}`,
    errReleaseFailed: (detail: string) =>
      `No se pudieron liberar los TTTI-T a la cuenta de financiación: ${detail}`,
  },
  "zh-Hans": {
    sectionTitle: "回购",
    sectionIntro:
      "回购是可选且有限的。每次回购都取决于当时可用的资金以及出资方的意愿。回购的 TTTI-T 转给出资方，出资方用自己的资金支付；这些 TTTI-T 从不预挖或预分配。目前，仅由创建者出资进行回购。",
    explainFunding:
      "退还的代币从管理员登记的回购资金账户支付，额度受设有上限和到期时间的 ICRC-2 授权限制。回购的 TTTI-T 在付款成功后转至该账户。管理员自行选择持有该账户的钱包：Internet Identity、OISY、NFID Wallet 或 Plug。",
    walletEntry: "回购",
    walletEntryHint: "退还某一支付代币平均池中的 TTTI-T",
    historyLabel: "回购",
    historyNotEligible: "不可回购",
    historyInMass: (symbol: string) => `计入 ${symbol} 平均池`,
    historyMassRemaining: (amount: string) => `平均池剩余：${amount}`,
    historyMassInProgress: "该平均池的回购正在进行中。",
    historyMassDone: "该平均池已全部回购。",
    historyMassTitle: "按平均池的回购",
    historyMassRecord: (percent: string, symbol: string) =>
      `${symbol} 平均池的 ${percent}`,
    historyBoughtBack: (amount: string) => `回购的 TTTI-T：${amount}`,
    historyReturned: (amount: string) => `已退还：${amount}`,
    historyDate: (date: string) => `回购时间：${date}`,
    statusCompleted: "已回购",
    statusInProgress: "回购进行中",
    statusPayoutFailed: "付款失败",
    explainTitle: "回购如何运作",
    explainMass:
      "每种支付代币有一个平均池：ICP、ckBTC、ckUSDC 和 ckUSDT。BTC 购买计入 ckBTC 平均池。不同代币的平均池从不合并。",
    explainRatio:
      "平均池的平均比率为已付净总额除以收到的 TTTI-T 总量。已完成的回购从平均池中扣除。",
    explainPercent:
      "您选择平均池剩余部分的百分比，从 1% 至 100%。100% 回购全部剩余部分。同一平均池一次只能进行一笔回购。",
    explainRule: (price: string) =>
      `退还金额取所支付代币的两个数量中较小者：按平均池平均比率计算的按比例净数量，或按当日汇率、以每个 TTTI-T ${price} 计算的被回购 TTTI-T 所值的数量。`,
    explainFees: (fee: string) =>
      `退还金额中扣除 ${fee} 的回购手续费及所有第三方转账手续费。`,
    explainPurchaseFee: (fee: string) => `原始 ${fee} 的购买手续费不予退还。`,
    explainBtc: "以 BTC 进行的购买以 ckBTC 退还，由您自行将其转换为 BTC。",
    explainEligibility:
      "只有第 26 版起的购买计入平均池。通过转账收到的 TTTI-T 不计入任何平均池。",
    signInRequired: "请使用 Internet Identity 登录以申请回购。",
    loading: "正在加载平均池…",
    loadError: "无法加载平均池。",
    retry: "重试",
    massLabel: "平均池",
    massPlaceholder: "选择平均池",
    massOption: (symbol: string, ttti: string, net: string) =>
      `${symbol} · ${ttti} · ${net}`,
    massPurchasesLabel: "平均池中的购买",
    massRemainingTttiLabel: "剩余 TTTI-T",
    massRemainingNetLabel: "剩余已付净额",
    massRatioLabel: "平均比率（已付净额 / 收到的 TTTI-T）",
    massInProgress: "该平均池的回购正在进行中。结束后可申请新的回购。",
    percentLabel: "剩余部分的百分比",
    percentShare: (symbol: string) => `平均池中剩余 ${symbol} 的比例`,
    percentSummary: (percent: string, amount: string) =>
      `剩余部分的 ${percent}：${amount}`,
    percentRequired: "选择百分比以查看报价。",
    percentShareCapped: (symbol: string) => `您的回购上限中 ${symbol} 的比例`,
    capNotice: (usable: string, remaining: string) =>
      `上限受您的可用余额限制：${usable}（钱包余额减去账本手续费），低于平均池剩余的 ${remaining}。`,
    capTooLow: (usable: string, one: string, minimum: string) =>
      `无法回购：您的可用余额（${usable}，钱包余额减去账本手续费）低于平均池的 ${one}（${minimum}）。`,
    noEligible: "没有可回购 TTTI-T 的平均池。",
    quoteTitle: "报价",
    quoteLoading: "正在计算报价…",
    quoteNote: "报价随当日汇率变化，并在申请时重新计算。",
    tttiReturnedLabel: "回购的 TTTI-T",
    originalNetLabel: "按比例净数量",
    baseLabel: "基础数量",
    ruleLabel: "适用规则",
    ruleOriginalNet: "按平均比率计算的按比例净数量（较小者）",
    ruleDayRate: "按当日汇率计算的 TTTI-T 价值（较小者）",
    feeLabel: (fee: string) => `回购手续费（${fee}）`,
    thirdPartyLabel: "第三方转账手续费",
    tttiFeeLabel: "TTTI-T 转账手续费",
    amountReturnedLabel: "退还金额",
    notRecorded: "未记录",
    breakdownTitle: "逐步计算",
    bdMassLabel: (symbol: string) =>
      `${symbol} 平均池：已付净额 / 收到的 TTTI-T`,
    bdPriorLabel: "已扣除的此前回购",
    bdRatioLabel: "平均比率（已付净额 / 剩余 TTTI-T）",
    bdTttiLabel: (price: string) => `回购的 TTTI-T，每个 TTTI-T ${price}`,
    bdRateLabel: "报价中的当日汇率",
    bdALabel: "A · 按平均比率计算的按比例净数量",
    bdBLabel: "B · 按当日汇率计算的被回购 TTTI-T 所值的数量",
    bdUsesA: (a: string, b: string) =>
      `采用的数值：A，两者中较小者（${a}，B 为 ${b}）。`,
    bdUsesB: (a: string, b: string) =>
      `采用的数值：B，两者中较小者（${b}，A 为 ${a}）。`,
    bdReturnedFeeLabel: (symbol: string) => `${symbol} 转账手续费`,
    bdTttiFeeLabel: "TTTI-T 转账手续费，从您的 TTTI-T 余额中扣除",
    summarySend: (
      ttti: string,
      tttiUsd: string,
      amount: string,
      amountUsd: string,
    ) => `您发送 ${ttti}（约 ${tttiUsd}），收到 ${amount}（约 ${amountUsd}）。`,
    step1Title: "第 1 步，共 2 步 · 授权 TTTI-T",
    approvalIntro: (amount: string) =>
      `允许合约为本次回购从您的 TTTI-T 余额中最多提取 ${amount}。请选择到期时间，阅读警告，然后确认。`,
    approvalInPlace: (amount: string, date: string) =>
      `合约已有 ${amount} 的授权，有效期至 ${date}。`,
    approvalAmountLabel: "最高金额",
    spenderLabel: "合约（spender）",
    approvalFeeLine: (fee: string) => `授权的账本手续费：${fee}`,
    balanceLine: (amount: string) => `余额：${amount}`,
    warnCapped: "授权上限为本次回购所需金额，并在所选到期时间结束。",
    warnFee: "即使未申请回购，授权也会收取 TTTI-T 账本手续费。",
    warnUnused: "未使用的授权在到期前一直有效。",
    warnIrreversible: "付款成功后，回购无法撤销。",
    warnOverBalance:
      "该金额超过您当前的 TTTI-T 余额。在余额足够之前，回购将失败。",
    warnLongLived: "此授权的有效期超过 24 小时。",
    approveConfirm: "我授权合约为本次回购提取该数量的 TTTI-T。",
    approveButton: "授权 TTTI-T",
    approving: "正在签名…",
    approveDone: "TTTI-T 授权已记录。",
    approveError: "授权未被记录。",
    step2Title: "第 2 步，共 2 步 · 确认回购",
    requestIntro: (ttti: string, amount: string) =>
      `${ttti} 在付款成功前保留在合约的托管账户中，之后转给出资方，您将收到 ${amount}，以申请时的计算为准。如果每次付款尝试都被账本拒绝，您可以取消并取回这些 TTTI-T。否则，取消需等待管理员核实付款。`,
    requestConfirm: "我确认此次回购。付款成功后，此操作无法撤销。",
    requestButton: "申请回购",
    requesting: "正在处理回购…",
    cancel: "取消",
    back: "返回",
    resultCompleted: "回购已完成。",
    resultInProgress: "回购进行中。",
    resultPayoutFailed:
      "您的 TTTI-T 在出资方处，且付款失败。请重试付款，或联系管理员将其退回。",
    resultEscrowPayoutFailed:
      "您的 TTTI-T 保留在合约的托管账户中，且付款失败。请重试付款，或在账本拒绝了每次尝试时取消。",
    resultMessage: (message: string) => `详情：${message}`,
    pullBlockLabel: "TTTI-T 区块",
    payoutBlockLabel: (symbol: string) => `${symbol} 付款区块`,
    retryPayout: "重试付款",
    retrying: "正在重试…",
    newBuyback: "新的回购",
    errAnonymous: "请登录以申请回购。",
    errNotBuyer: "只有买家可以申请或重试此回购。",
    errInProgress: "已有一笔回购在进行中。",
    errInvalidPercent: "请选择 1% 至 100% 的百分比。",
    errNothingRemaining: "该平均池没有可回购的剩余部分。",
    errMassInProgress: "该平均池的回购已在进行中。",
    errBuybackNotFound: "未找到此回购。",
    errRateUnavailable: (symbol: string) =>
      `没有有效的 ${symbol} 汇率。请稍后重试。`,
    errAdminAccountNotSet: "回购暂不可用：尚未设置资金账户。",
    errAdminAllowanceInsufficient: (symbol: string) =>
      `为回购授权的 ${symbol} 资金不足以支付该金额。请稍后重试。`,
    errAdminAllowanceExpired: (symbol: string) =>
      `回购的 ${symbol} 资金授权已过期。请稍后重试。`,
    errAdminBalanceInsufficient: (symbol: string) =>
      `${symbol} 回购资金不足以支付该金额。请稍后重试。`,
    errReceiveTokenMismatch: "回购仅以您购买时所支付的代币支付。",
    errBuyerAllowance: (required: string, allowance: string) =>
      `您对合约的 TTTI-T 授权为 ${allowance}；需要 ${required}。请重新授权。`,
    errAmountTooSmall: "退还金额不足以支付手续费，无法回购。",
    errNotRetryable: "此回购没有可重试的失败付款。",
    errPullFailed: (detail: string) => `无法提取 TTTI-T：${detail}`,
    errPayoutFailed: (detail: string) => `付款失败：${detail}`,
    errCallFailed: (detail: string) => `请求失败：${detail}`,
    statusCancelled: "已取消",
    tttiEscrowFeeLabel: "第二笔 TTTI-T 转账手续费（托管）",
    bdTttiEscrowFeeLabel:
      "第二笔 TTTI-T 转账手续费，用于释放或退回托管中的 TTTI-T，从您的 TTTI-T 余额中扣除",
    approvalTwoFees:
      "此金额为回购的 TTTI-T 加上两笔 TTTI-T 转账手续费：一笔用于将 TTTI-T 存入托管，一笔用于释放或退回。",
    attemptFailed: (reason: string) => `最近一次付款尝试失败：${reason}`,
    attemptUnknown: "最近一次付款尝试：结果未知。",
    attemptToReview: "最近一次付款尝试：结果未知，待管理员核查。",
    cancelBlockLabel: "TTTI-T 退回区块",
    cancelButton: "取消回购",
    cancelTitle: "取消此回购？",
    cancelDescription: (amount: string) =>
      `不会进行任何付款。托管中的 ${amount} 将退回您的账户。两笔 TTTI-T 转账手续费不予退还。`,
    cancelConfirm: "取消回购",
    cancelKeep: "保留回购",
    cancelling: "正在取消…",
    cancelDone: "回购已取消。TTTI-T 已退回您的账户。",
    resultCancelled: "回购已取消。托管中的 TTTI-T 已退回您的账户。",
    errSalesPaused: "回购已暂停。",
    errNotCancellable:
      "此回购无法取消。只有所有尝试均被拒绝的失败付款才能取消。",
    errAttemptUnknown: "有一次付款尝试结果未知。在结果明确之前，回购无法取消。",
    errAttemptArrived: "有一次付款尝试已到账。回购无法取消。",
    errNotLegacy: "此操作仅适用于托管之前记录的回购。",
    errNotAuthorized: "只有买方或管理员可以取消此回购。",
    errCancelFailed: (detail: string) => `无法退回 TTTI-T：${detail}`,
    errReleaseFailed: (detail: string) =>
      `无法将 TTTI-T 释放到资金账户：${detail}`,
  },
  "pt-BR": {
    sectionTitle: "Recompra",
    sectionIntro:
      "As recompras são opcionais e limitadas. Cada uma depende dos fundos disponíveis naquele momento e da disposição de quem a financia. Os TTTI-T recomprados vão para o financiador, que os paga com o próprio dinheiro; eles nunca são pré-minerados nem pré-alocados. Por enquanto, apenas o criador financia as recompras.",
    explainFunding:
      "O token devolvido é pago a partir da conta de financiamento de recompras registrada pelo administrador, dentro de aprovações ICRC-2 limitadas e com expiração. Os TTTI-T recomprados vão para essa conta assim que o pagamento é bem-sucedido. O administrador escolhe a wallet que a detém: Internet Identity, OISY, NFID Wallet ou Plug.",
    walletEntry: "Recompra",
    walletEntryHint: "Devolver TTTI-T da massa de um token de pagamento",
    historyLabel: "Recompra",
    historyNotEligible: "Não elegível para recompra",
    historyInMass: (symbol: string) => `Contada na massa ${symbol}`,
    historyMassRemaining: (amount: string) => `Restante na massa: ${amount}`,
    historyMassInProgress: "Há uma recompra desta massa em andamento.",
    historyMassDone: "A massa foi totalmente recomprada.",
    historyMassTitle: "Recompras por massa",
    historyMassRecord: (percent: string, symbol: string) =>
      `${percent} da massa ${symbol}`,
    historyBoughtBack: (amount: string) => `TTTI-T recomprados: ${amount}`,
    historyReturned: (amount: string) => `Devolvido: ${amount}`,
    historyDate: (date: string) => `Recompra em ${date}`,
    statusCompleted: "Recomprada",
    statusInProgress: "Recompra em andamento",
    statusPayoutFailed: "Pagamento falhou",
    explainTitle: "Como a recompra funciona",
    explainMass:
      "Cada token de pagamento tem uma massa média: ICP, ckBTC, ckUSDC e ckUSDT. Compras em BTC contam na massa ckBTC. Massas de tokens diferentes nunca são combinadas.",
    explainRatio:
      "A razão média de uma massa é o total líquido pago dividido pelo total de TTTI-T recebidos. As recompras já feitas são deduzidas da massa.",
    explainPercent:
      "Você escolhe uma porcentagem do restante da massa, de 1% a 100%. 100% recompra todo o restante. Uma recompra por massa de cada vez.",
    explainRule: (price: string) =>
      `O valor devolvido é a menor de duas quantidades do token pago: a quantidade líquida proporcional na razão média da massa, ou a quantidade que valem os TTTI-T recomprados a ${price} por TTTI-T na cotação do dia.`,
    explainFees: (fee: string) =>
      `Uma taxa de recompra de ${fee} e todas as taxas de transferência de terceiros são descontadas do valor devolvido.`,
    explainPurchaseFee: (fee: string) =>
      `A taxa de compra original de ${fee} não é reembolsada.`,
    explainBtc:
      "Compras em BTC são reembolsadas em ckBTC, que você mesmo converte em BTC.",
    explainEligibility:
      "Somente compras a partir da Versão 26 estão em uma massa. TTTI-T recebidos por transferência não estão em nenhuma massa.",
    signInRequired:
      "Entre com a Internet Identity para solicitar uma recompra.",
    loading: "Carregando massas…",
    loadError: "Não foi possível carregar as massas.",
    retry: "Tentar novamente",
    massLabel: "Massa",
    massPlaceholder: "Escolha uma massa",
    massOption: (symbol: string, ttti: string, net: string) =>
      `${symbol} · ${ttti} · ${net}`,
    massPurchasesLabel: "Compras na massa",
    massRemainingTttiLabel: "TTTI-T restantes",
    massRemainingNetLabel: "Líquido pago restante",
    massRatioLabel: "Razão média (líquido pago / TTTI-T recebidos)",
    massInProgress:
      "Há uma recompra desta massa em andamento. Uma nova poderá ser solicitada quando ela terminar.",
    percentLabel: "Porcentagem do restante",
    percentShare: (symbol: string) => `Parte dos ${symbol} restantes na massa`,
    percentSummary: (percent: string, amount: string) =>
      `${percent} do restante: ${amount}`,
    percentRequired: "Escolha uma porcentagem para ver a cotação.",
    percentShareCapped: (symbol: string) =>
      `Parte do seu máximo de recompra (${symbol})`,
    capNotice: (usable: string, remaining: string) =>
      `Máximo limitado pelo seu saldo utilizável: ${usable} (saldo da carteira menos as taxas do ledger), abaixo dos ${remaining} restantes na massa.`,
    capTooLow: (usable: string, one: string, minimum: string) =>
      `Recompra indisponível: seu saldo utilizável (${usable}, saldo da carteira menos as taxas do ledger) é inferior a ${one} da massa (${minimum}).`,
    noEligible: "Nenhuma massa tem TTTI-T a recomprar.",
    quoteTitle: "Cotação",
    quoteLoading: "Calculando a cotação…",
    quoteNote:
      "A cotação segue a cotação do dia e é recalculada na solicitação.",
    tttiReturnedLabel: "TTTI-T recomprados",
    originalNetLabel: "Quantidade líquida proporcional",
    baseLabel: "Quantidade base",
    ruleLabel: "Regra aplicada",
    ruleOriginalNet: "Quantidade líquida proporcional na razão média (a menor)",
    ruleDayRate: "Valor dos TTTI-T na cotação do dia (a menor)",
    feeLabel: (fee: string) => `Taxa de recompra (${fee})`,
    thirdPartyLabel: "Taxas de transferência de terceiros",
    tttiFeeLabel: "Taxa de transferência TTTI-T",
    amountReturnedLabel: "Valor devolvido",
    notRecorded: "Não registrado",
    breakdownTitle: "Cálculo passo a passo",
    bdMassLabel: (symbol: string) =>
      `Massa ${symbol}: líquido pago / TTTI-T recebidos`,
    bdPriorLabel: "Recompras anteriores deduzidas",
    bdRatioLabel: "Razão média (líquido pago / TTTI-T restantes)",
    bdTttiLabel: (price: string) => `TTTI-T recomprados a ${price} por TTTI-T`,
    bdRateLabel: "Cotação do dia usada",
    bdALabel: "A · Quantidade líquida proporcional na razão média",
    bdBLabel:
      "B · Quantidade que valem os TTTI-T recomprados na cotação do dia",
    bdUsesA: (a: string, b: string) =>
      `Valor aplicado: A, o menor dos dois (${a} contra ${b} de B).`,
    bdUsesB: (a: string, b: string) =>
      `Valor aplicado: B, o menor dos dois (${b} contra ${a} de A).`,
    bdReturnedFeeLabel: (symbol: string) =>
      `Taxa de transferência de ${symbol}`,
    bdTttiFeeLabel:
      "Taxa de transferência TTTI-T, retirada do seu saldo de TTTI-T",
    summarySend: (
      ttti: string,
      tttiUsd: string,
      amount: string,
      amountUsd: string,
    ) =>
      `Você envia ${ttti} (cerca de ${tttiUsd}) e recebe ${amount} (cerca de ${amountUsd}).`,
    step1Title: "Etapa 1 de 2 · Aprovar TTTI-T",
    approvalIntro: (amount: string) =>
      `Permita que o contrato retire no máximo ${amount} do seu saldo de TTTI-T para esta recompra. Escolha uma expiração, leia os avisos e confirme.`,
    approvalInPlace: (amount: string, date: string) =>
      `Há uma aprovação de ${amount} para o contrato válida até ${date}.`,
    approvalAmountLabel: "Valor máximo",
    spenderLabel: "Contrato (spender)",
    approvalFeeLine: (fee: string) => `Taxa do ledger para a aprovação: ${fee}`,
    balanceLine: (amount: string) => `Saldo: ${amount}`,
    warnCapped:
      "A aprovação é limitada ao valor que esta recompra exige e termina na expiração escolhida.",
    warnFee:
      "A aprovação custa uma taxa do ledger TTTI-T, mesmo que a recompra não seja solicitada.",
    warnUnused: "Uma aprovação não usada permanece válida até expirar.",
    warnIrreversible:
      "Uma recompra não pode ser desfeita depois que o pagamento é bem-sucedido.",
    warnOverBalance:
      "O valor excede seu saldo atual de TTTI-T. A recompra falha enquanto o saldo não o cobrir.",
    warnLongLived: "Esta aprovação permanece válida por mais de 24 horas.",
    approveConfirm:
      "Autorizo o contrato a retirar este valor de TTTI-T para esta recompra.",
    approveButton: "Aprovar TTTI-T",
    approving: "Assinando…",
    approveDone: "Aprovação de TTTI-T registrada.",
    approveError: "A aprovação não foi registrada.",
    step2Title: "Etapa 2 de 2 · Confirmar a recompra",
    requestIntro: (ttti: string, amount: string) =>
      `${ttti} ficam na conta de custódia do contrato até que o pagamento seja bem-sucedido, depois vão para o financiador, e você recebe ${amount}, conforme o cálculo feito na solicitação. Se todas as tentativas de pagamento forem recusadas pelo ledger, você pode cancelar e recuperá-los. Caso contrário, o cancelamento aguarda até que o administrador tenha verificado o pagamento.`,
    requestConfirm:
      "Confirmo esta recompra. Ela não pode ser desfeita depois que o pagamento é bem-sucedido.",
    requestButton: "Solicitar a recompra",
    requesting: "Processando a recompra…",
    cancel: "Cancelar",
    back: "Voltar",
    resultCompleted: "Recompra concluída.",
    resultInProgress: "Recompra em andamento.",
    resultPayoutFailed:
      "Seus TTTI-T estão com o financiador e o pagamento falhou. Tente o pagamento novamente ou entre em contato com o administrador para que eles sejam devolvidos.",
    resultEscrowPayoutFailed:
      "Seus TTTI-T estão na conta de custódia do contrato e o pagamento falhou. Tente o pagamento novamente ou cancele se o ledger recusou todas as tentativas.",
    resultMessage: (message: string) => `Detalhes: ${message}`,
    pullBlockLabel: "Bloco TTTI-T",
    payoutBlockLabel: (symbol: string) => `Bloco do pagamento em ${symbol}`,
    retryPayout: "Tentar o pagamento novamente",
    retrying: "Tentando novamente…",
    newBuyback: "Nova recompra",
    errAnonymous: "Entre para solicitar uma recompra.",
    errNotBuyer: "Somente o comprador pode solicitar ou repetir esta recompra.",
    errInProgress: "Já há uma recompra em andamento.",
    errInvalidPercent: "Escolha uma porcentagem de 1% a 100%.",
    errNothingRemaining: "Não resta nada a recomprar nesta massa.",
    errMassInProgress: "Já há uma recompra desta massa em andamento.",
    errBuybackNotFound: "Esta recompra não foi encontrada.",
    errRateUnavailable: (symbol: string) =>
      `Não há cotação ${symbol} válida. Tente mais tarde.`,
    errAdminAccountNotSet:
      "As recompras ainda não estão disponíveis: a conta de financiamento não está definida.",
    errAdminAllowanceInsufficient: (symbol: string) =>
      `Os fundos em ${symbol} aprovados para recompras não cobrem este valor. Tente mais tarde.`,
    errAdminAllowanceExpired: (symbol: string) =>
      `A aprovação de financiamento em ${symbol} para recompras expirou. Tente mais tarde.`,
    errAdminBalanceInsufficient: (symbol: string) =>
      `Os fundos de recompra em ${symbol} não cobrem este valor. Tente mais tarde.`,
    errReceiveTokenMismatch:
      "A recompra é paga somente no token usado na compra.",
    errBuyerAllowance: (required: string, allowance: string) =>
      `Sua aprovação de TTTI-T para o contrato é de ${allowance}; são necessários ${required}. Aprove novamente.`,
    errAmountTooSmall:
      "O valor devolvido não cobriria as taxas. Nenhuma recompra é possível.",
    errNotRetryable:
      "Esta recompra não tem nenhum pagamento falho para tentar novamente.",
    errPullFailed: (detail: string) =>
      `Não foi possível retirar os TTTI-T: ${detail}`,
    errPayoutFailed: (detail: string) => `O pagamento falhou: ${detail}`,
    errCallFailed: (detail: string) => `A solicitação falhou: ${detail}`,
    statusCancelled: "Cancelada",
    tttiEscrowFeeLabel: "Segunda taxa de transferência TTTI-T (custódia)",
    bdTttiEscrowFeeLabel:
      "Segunda taxa de transferência TTTI-T, para a liberação ou devolução dos TTTI-T em custódia, descontada do seu saldo TTTI-T",
    approvalTwoFees:
      "Este valor corresponde aos TTTI-T recomprados mais duas taxas de transferência TTTI-T: uma para manter os TTTI-T em custódia e outra para liberá-los ou devolvê-los.",
    attemptFailed: (reason: string) =>
      `A última tentativa de pagamento falhou: ${reason}`,
    attemptUnknown: "Última tentativa de pagamento: resultado desconhecido.",
    attemptToReview:
      "Última tentativa de pagamento: resultado desconhecido, a ser verificado pelo administrador.",
    cancelBlockLabel: "Bloco de devolução TTTI-T",
    cancelButton: "Cancelar a recompra",
    cancelTitle: "Cancelar esta recompra?",
    cancelDescription: (amount: string) =>
      `Nenhum pagamento é feito. Os ${amount} em custódia voltam para sua conta. As duas taxas de transferência TTTI-T não são reembolsadas.`,
    cancelConfirm: "Cancelar a recompra",
    cancelKeep: "Manter a recompra",
    cancelling: "Cancelando…",
    cancelDone: "Recompra cancelada. Os TTTI-T foram devolvidos à sua conta.",
    resultCancelled:
      "Recompra cancelada. Os TTTI-T em custódia foram devolvidos à sua conta.",
    errSalesPaused: "As recompras estão pausadas.",
    errNotCancellable:
      "Esta recompra não pode ser cancelada. Só é possível cancelar um pagamento falho cujas tentativas foram todas recusadas.",
    errAttemptUnknown:
      "Uma tentativa de pagamento tem resultado desconhecido. A recompra não pode ser cancelada até que ele seja conhecido.",
    errAttemptArrived:
      "Uma tentativa de pagamento chegou. A recompra não pode ser cancelada.",
    errNotLegacy:
      "Esta ação se aplica apenas às recompras registradas antes da custódia.",
    errNotAuthorized:
      "Somente o comprador ou o administrador podem cancelar esta recompra.",
    errCancelFailed: (detail: string) =>
      `Não foi possível devolver os TTTI-T: ${detail}`,
    errReleaseFailed: (detail: string) =>
      `Não foi possível liberar os TTTI-T para a conta de financiamento: ${detail}`,
  },
  ko: {
    sectionTitle: "환매",
    sectionIntro:
      "환매는 선택 사항이며 제한적입니다. 각 환매는 그 시점에 사용할 수 있는 자금과 자금을 제공하는 사람의 의사에 따라 달라집니다. 환매된 TTTI-T는 자금 제공자에게 가며, 자금 제공자는 자신의 돈으로 그 대가를 지불합니다. 이 TTTI-T는 사전 채굴되거나 사전 할당되지 않습니다. 현재는 창작자만 환매 자금을 제공합니다.",
    explainFunding:
      "반환되는 토큰은 관리자가 등록한 환매 자금 계정에서, 한도와 만료가 있는 ICRC-2 승인 범위 안에서 지급됩니다. 환매된 TTTI-T는 지급이 성공하면 이 계정으로 이동합니다. 관리자는 이 계정을 보유할 지갑을 Internet Identity, OISY, NFID Wallet, Plug 중에서 선택합니다.",
    walletEntry: "환매",
    walletEntryHint: "결제 토큰 평균 풀의 TTTI-T 반환",
    historyLabel: "환매",
    historyNotEligible: "환매 불가",
    historyInMass: (symbol: string) => `${symbol} 평균 풀에 포함`,
    historyMassRemaining: (amount: string) => `평균 풀 잔여: ${amount}`,
    historyMassInProgress: "이 평균 풀의 환매가 진행 중입니다.",
    historyMassDone: "평균 풀이 전부 환매되었습니다.",
    historyMassTitle: "평균 풀별 환매",
    historyMassRecord: (percent: string, symbol: string) =>
      `${symbol} 평균 풀의 ${percent}`,
    historyBoughtBack: (amount: string) => `환매된 TTTI-T: ${amount}`,
    historyReturned: (amount: string) => `반환됨: ${amount}`,
    historyDate: (date: string) => `환매 일시: ${date}`,
    statusCompleted: "환매 완료",
    statusInProgress: "환매 진행 중",
    statusPayoutFailed: "지급 실패",
    explainTitle: "환매 방식",
    explainMass:
      "결제 토큰마다 평균 풀이 하나 있습니다: ICP, ckBTC, ckUSDC, ckUSDT. BTC 구매는 ckBTC 평균 풀에 포함됩니다. 서로 다른 토큰의 평균 풀은 합쳐지지 않습니다.",
    explainRatio:
      "평균 풀의 평균 비율은 지불한 순 총액을 받은 TTTI-T 총량으로 나눈 값입니다. 이미 이루어진 환매는 평균 풀에서 차감됩니다.",
    explainPercent:
      "평균 풀 잔여분의 비율을 1%에서 100%까지 선택합니다. 100%는 잔여분 전체를 환매합니다. 한 평균 풀은 한 번에 하나의 환매만 가능합니다.",
    explainRule: (price: string) =>
      `반환 금액은 지불한 토큰의 두 수량 중 더 작은 쪽입니다: 평균 풀의 평균 비율에 따른 비례 순수량, 또는 환매되는 TTTI-T를 당일 환율로 TTTI-T당 ${price}에 환산한 수량.`,
    explainFees: (fee: string) =>
      `${fee}의 환매 수수료와 모든 제3자 전송 수수료가 반환 금액에서 차감됩니다.`,
    explainPurchaseFee: (fee: string) =>
      `원래의 ${fee} 구매 수수료는 환불되지 않습니다.`,
    explainBtc:
      "BTC 구매는 ckBTC로 환불되며, BTC로의 전환은 사용자가 직접 합니다.",
    explainEligibility:
      "버전 26 이후의 구매만 평균 풀에 포함됩니다. 전송으로 받은 TTTI-T는 어떤 평균 풀에도 포함되지 않습니다.",
    signInRequired: "환매를 요청하려면 Internet Identity로 로그인하세요.",
    loading: "평균 풀을 불러오는 중…",
    loadError: "평균 풀을 불러오지 못했습니다.",
    retry: "다시 시도",
    massLabel: "평균 풀",
    massPlaceholder: "평균 풀을 선택하세요",
    massOption: (symbol: string, ttti: string, net: string) =>
      `${symbol} · ${ttti} · ${net}`,
    massPurchasesLabel: "평균 풀의 구매 수",
    massRemainingTttiLabel: "잔여 TTTI-T",
    massRemainingNetLabel: "잔여 순 지불액",
    massRatioLabel: "평균 비율 (순 지불액 / 받은 TTTI-T)",
    massInProgress:
      "이 평균 풀의 환매가 진행 중입니다. 완료된 후 새 환매를 요청할 수 있습니다.",
    percentLabel: "잔여분 대비 비율",
    percentShare: (symbol: string) => `평균 풀에 남은 ${symbol}의 비율`,
    percentSummary: (percent: string, amount: string) =>
      `잔여분의 ${percent}: ${amount}`,
    percentRequired: "견적을 보려면 비율을 선택하세요.",
    percentShareCapped: (symbol: string) => `환매 최대치 중 ${symbol}의 비율`,
    capNotice: (usable: string, remaining: string) =>
      `최대치가 사용 가능 잔액으로 제한됩니다: ${usable}(지갑 잔액에서 원장 수수료 차감), 평균 풀 잔여분 ${remaining}보다 적습니다.`,
    capTooLow: (usable: string, one: string, minimum: string) =>
      `환매 불가: 사용 가능 잔액(${usable}, 지갑 잔액에서 원장 수수료 차감)이 평균 풀의 ${one}(${minimum})보다 적습니다.`,
    noEligible: "환매할 TTTI-T가 남은 평균 풀이 없습니다.",
    quoteTitle: "견적",
    quoteLoading: "견적 계산 중…",
    quoteNote: "견적은 당일 환율을 따르며 요청 시 다시 계산됩니다.",
    tttiReturnedLabel: "환매되는 TTTI-T",
    originalNetLabel: "비례 순수량",
    baseLabel: "기준 수량",
    ruleLabel: "적용된 규칙",
    ruleOriginalNet: "평균 비율에 따른 비례 순수량 (더 작은 쪽)",
    ruleDayRate: "당일 환율 기준 TTTI-T 가치 (더 작은 쪽)",
    feeLabel: (fee: string) => `환매 수수료 (${fee})`,
    thirdPartyLabel: "제3자 전송 수수료",
    tttiFeeLabel: "TTTI-T 전송 수수료",
    amountReturnedLabel: "반환 금액",
    notRecorded: "기록 없음",
    breakdownTitle: "단계별 계산",
    bdMassLabel: (symbol: string) =>
      `${symbol} 평균 풀: 순 지불액 / 받은 TTTI-T`,
    bdPriorLabel: "차감된 이전 환매",
    bdRatioLabel: "평균 비율 (순 지불액 / 잔여 TTTI-T)",
    bdTttiLabel: (price: string) => `TTTI-T당 ${price} 기준 환매되는 TTTI-T`,
    bdRateLabel: "견적에 적용된 당일 환율",
    bdALabel: "A · 평균 비율에 따른 비례 순수량",
    bdBLabel: "B · 환매되는 TTTI-T를 당일 환율로 환산한 수량",
    bdUsesA: (a: string, b: string) =>
      `적용 값: A, 둘 중 더 작은 쪽 (${a}, B는 ${b}).`,
    bdUsesB: (a: string, b: string) =>
      `적용 값: B, 둘 중 더 작은 쪽 (${b}, A는 ${a}).`,
    bdReturnedFeeLabel: (symbol: string) => `${symbol} 전송 수수료`,
    bdTttiFeeLabel: "TTTI-T 전송 수수료, TTTI-T 잔액에서 차감",
    summarySend: (
      ttti: string,
      tttiUsd: string,
      amount: string,
      amountUsd: string,
    ) =>
      `${ttti}(약 ${tttiUsd})를 보내고 ${amount}(약 ${amountUsd})를 받습니다.`,
    step1Title: "2단계 중 1단계 · TTTI-T 승인",
    approvalIntro: (amount: string) =>
      `이 환매를 위해 컨트랙트가 회원님의 TTTI-T 잔액에서 최대 ${amount}까지 가져갈 수 있도록 허용합니다. 만료 시점을 선택하고 경고를 읽은 뒤 확인하세요.`,
    approvalInPlace: (amount: string, date: string) =>
      `컨트랙트에 대한 ${amount} 승인이 ${date}까지 유효합니다.`,
    approvalAmountLabel: "최대 금액",
    spenderLabel: "컨트랙트 (spender)",
    approvalFeeLine: (fee: string) => `승인에 대한 원장 수수료: ${fee}`,
    balanceLine: (amount: string) => `잔액: ${amount}`,
    warnCapped:
      "승인은 이 환매에 필요한 금액으로 제한되며 선택한 만료 시점에 끝납니다.",
    warnFee: "환매를 요청하지 않아도 승인에는 TTTI-T 원장 수수료가 듭니다.",
    warnUnused: "사용하지 않은 승인은 만료될 때까지 유효합니다.",
    warnIrreversible: "지급이 성공한 후에는 환매를 취소할 수 없습니다.",
    warnOverBalance:
      "금액이 현재 TTTI-T 잔액을 초과합니다. 잔액이 충분해질 때까지 환매는 실패합니다.",
    warnLongLived: "이 승인은 24시간 넘게 유효합니다.",
    approveConfirm:
      "이 환매를 위해 컨트랙트가 이 TTTI-T 금액을 가져가는 것을 승인합니다.",
    approveButton: "TTTI-T 승인",
    approving: "서명 중…",
    approveDone: "TTTI-T 승인이 기록되었습니다.",
    approveError: "승인이 기록되지 않았습니다.",
    step2Title: "2단계 중 2단계 · 환매 확인",
    requestIntro: (ttti: string, amount: string) =>
      `${ttti}는 지급이 성공할 때까지 컨트랙트의 에스크로 계정에 남아 있다가 자금 제공자에게 가며, 요청 시 계산된 대로 ${amount}를 받습니다. 모든 지급 시도가 원장에서 거부되면 취소하고 돌려받을 수 있습니다. 그렇지 않으면 관리자가 지급을 확인할 때까지 취소가 대기합니다.`,
    requestConfirm:
      "이 환매를 확인합니다. 지급이 성공한 후에는 취소할 수 없습니다.",
    requestButton: "환매 요청",
    requesting: "환매 처리 중…",
    cancel: "취소",
    back: "뒤로",
    resultCompleted: "환매가 완료되었습니다.",
    resultInProgress: "환매가 진행 중입니다.",
    resultPayoutFailed:
      "귀하의 TTTI-T는 자금 제공자에게 있으며 지급에 실패했습니다. 지급을 다시 시도하거나, 관리자에게 연락하여 반환받으세요.",
    resultEscrowPayoutFailed:
      "귀하의 TTTI-T는 컨트랙트의 에스크로 계정에 보관되어 있으며 지급에 실패했습니다. 지급을 다시 시도하거나, 원장이 모든 시도를 거부한 경우 취소하세요.",
    resultMessage: (message: string) => `세부 정보: ${message}`,
    pullBlockLabel: "TTTI-T 블록",
    payoutBlockLabel: (symbol: string) => `${symbol} 지급 블록`,
    retryPayout: "지급 다시 시도",
    retrying: "다시 시도 중…",
    newBuyback: "새 환매",
    errAnonymous: "환매를 요청하려면 로그인하세요.",
    errNotBuyer: "구매자만 이 환매를 요청하거나 다시 시도할 수 있습니다.",
    errInProgress: "이미 진행 중인 환매가 있습니다.",
    errInvalidPercent: "1%에서 100% 사이의 비율을 선택하세요.",
    errNothingRemaining: "이 평균 풀에는 환매할 잔여분이 없습니다.",
    errMassInProgress: "이 평균 풀의 환매가 이미 진행 중입니다.",
    errBuybackNotFound: "이 환매를 찾을 수 없습니다.",
    errRateUnavailable: (symbol: string) =>
      `유효한 ${symbol} 환율이 없습니다. 나중에 다시 시도하세요.`,
    errAdminAccountNotSet:
      "아직 환매를 이용할 수 없습니다: 자금 계정이 설정되지 않았습니다.",
    errAdminAllowanceInsufficient: (symbol: string) =>
      `환매용으로 승인된 ${symbol} 자금이 이 금액에 부족합니다. 나중에 다시 시도하세요.`,
    errAdminAllowanceExpired: (symbol: string) =>
      `환매용 ${symbol} 자금 승인이 만료되었습니다. 나중에 다시 시도하세요.`,
    errAdminBalanceInsufficient: (symbol: string) =>
      `${symbol} 환매 자금이 이 금액에 부족합니다. 나중에 다시 시도하세요.`,
    errReceiveTokenMismatch: "환매는 구매 시 지불한 토큰으로만 지급됩니다.",
    errBuyerAllowance: (required: string, allowance: string) =>
      `컨트랙트에 대한 TTTI-T 승인은 ${allowance}이며, ${required}가 필요합니다. 다시 승인하세요.`,
    errAmountTooSmall:
      "반환 금액이 수수료를 충당하지 못합니다. 환매할 수 없습니다.",
    errNotRetryable: "이 환매에는 다시 시도할 실패한 지급이 없습니다.",
    errPullFailed: (detail: string) => `TTTI-T를 가져올 수 없습니다: ${detail}`,
    errPayoutFailed: (detail: string) => `지급에 실패했습니다: ${detail}`,
    errCallFailed: (detail: string) => `요청에 실패했습니다: ${detail}`,
    statusCancelled: "취소됨",
    tttiEscrowFeeLabel: "두 번째 TTTI-T 전송 수수료 (에스크로)",
    bdTttiEscrowFeeLabel:
      "두 번째 TTTI-T 전송 수수료, 에스크로에 보관된 TTTI-T의 해제 또는 반환용, TTTI-T 잔액에서 차감",
    approvalTwoFees:
      "이 금액은 환매되는 TTTI-T에 두 번의 TTTI-T 전송 수수료를 더한 것입니다. 하나는 TTTI-T를 에스크로에 보관하기 위한 것이고, 다른 하나는 이를 해제하거나 반환하기 위한 것입니다.",
    attemptFailed: (reason: string) => `최근 지급 시도 실패: ${reason}`,
    attemptUnknown: "최근 지급 시도: 결과 알 수 없음.",
    attemptToReview: "최근 지급 시도: 결과 알 수 없음, 관리자 확인 필요.",
    cancelBlockLabel: "TTTI-T 반환 블록",
    cancelButton: "환매 취소",
    cancelTitle: "이 환매를 취소하시겠습니까?",
    cancelDescription: (amount: string) =>
      `지급은 이루어지지 않습니다. 에스크로에 보관된 ${amount}는 귀하의 계정으로 반환됩니다. 두 번의 TTTI-T 전송 수수료는 환불되지 않습니다.`,
    cancelConfirm: "환매 취소",
    cancelKeep: "환매 유지",
    cancelling: "취소 중…",
    cancelDone:
      "환매가 취소되었습니다. TTTI-T가 귀하의 계정으로 반환되었습니다.",
    resultCancelled:
      "환매가 취소되었습니다. 에스크로에 보관된 TTTI-T가 귀하의 계정으로 반환되었습니다.",
    errSalesPaused: "환매가 일시 중지되었습니다.",
    errNotCancellable:
      "이 환매는 취소할 수 없습니다. 모든 시도가 거부된 실패한 지급만 취소할 수 있습니다.",
    errAttemptUnknown:
      "결과를 알 수 없는 지급 시도가 있습니다. 결과가 확인될 때까지 환매를 취소할 수 없습니다.",
    errAttemptArrived: "지급 시도가 도착했습니다. 환매를 취소할 수 없습니다.",
    errNotLegacy: "이 작업은 에스크로 이전에 기록된 환매에만 적용됩니다.",
    errNotAuthorized: "구매자 또는 관리자만 이 환매를 취소할 수 있습니다.",
    errCancelFailed: (detail: string) =>
      `TTTI-T를 반환할 수 없습니다: ${detail}`,
    errReleaseFailed: (detail: string) =>
      `TTTI-T를 자금 계정으로 해제할 수 없습니다: ${detail}`,
  },
  "pa-Guru": {
    sectionTitle: "ਵਾਪਸ ਖਰੀਦ",
    sectionIntro:
      "ਵਾਪਸ ਖਰੀਦ ਵਿਕਲਪਿਕ ਅਤੇ ਸੀਮਤ ਹੈ। ਹਰ ਵਾਪਸ ਖਰੀਦ ਉਸ ਸਮੇਂ ਉਪਲਬਧ ਫੰਡਾਂ ਅਤੇ ਇਸ ਨੂੰ ਫੰਡ ਦੇਣ ਵਾਲੇ ਦੀ ਇੱਛਾ 'ਤੇ ਨਿਰਭਰ ਕਰਦੀ ਹੈ। ਵਾਪਸ ਖਰੀਦੇ TTTI-T ਫੰਡ ਦੇਣ ਵਾਲੇ ਕੋਲ ਜਾਂਦੇ ਹਨ, ਜੋ ਆਪਣੇ ਪੈਸੇ ਨਾਲ ਉਨ੍ਹਾਂ ਦਾ ਭੁਗਤਾਨ ਕਰਦਾ ਹੈ; ਉਹ ਕਦੇ ਵੀ ਪਹਿਲਾਂ ਤੋਂ ਮਾਈਨ ਜਾਂ ਪਹਿਲਾਂ ਤੋਂ ਵੰਡੇ ਨਹੀਂ ਜਾਂਦੇ। ਫਿਲਹਾਲ, ਸਿਰਫ਼ ਨਿਰਮਾਤਾ ਹੀ ਵਾਪਸ ਖਰੀਦ ਲਈ ਫੰਡ ਦਿੰਦਾ ਹੈ।",
    explainFunding:
      "ਵਾਪਸ ਕੀਤਾ ਟੋਕਨ ਐਡਮਿਨ ਵੱਲੋਂ ਰਜਿਸਟਰ ਕੀਤੇ ਵਾਪਸ ਖਰੀਦ ਫੰਡਿੰਗ ਖਾਤੇ ਤੋਂ, ਸੀਮਾ ਅਤੇ ਮਿਆਦ ਵਾਲੀਆਂ ICRC-2 ਮਨਜ਼ੂਰੀਆਂ ਦੇ ਅੰਦਰ ਅਦਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਵਾਪਸ ਖਰੀਦੇ TTTI-T ਭੁਗਤਾਨ ਸਫਲ ਹੋਣ ਤੋਂ ਬਾਅਦ ਉਸੇ ਖਾਤੇ ਵਿੱਚ ਜਾਂਦੇ ਹਨ। ਐਡਮਿਨ ਇਸ ਖਾਤੇ ਨੂੰ ਰੱਖਣ ਵਾਲਾ ਵਾਲੇਟ ਚੁਣਦਾ ਹੈ: Internet Identity, OISY, NFID Wallet ਜਾਂ Plug।",
    walletEntry: "ਵਾਪਸ ਖਰੀਦ",
    walletEntryHint: "ਕਿਸੇ ਭੁਗਤਾਨ ਟੋਕਨ ਦੇ ਸਮੂਹ ਵਿੱਚੋਂ TTTI-T ਵਾਪਸ ਕਰੋ",
    historyLabel: "ਵਾਪਸ ਖਰੀਦ",
    historyNotEligible: "ਵਾਪਸ ਖਰੀਦ ਲਈ ਯੋਗ ਨਹੀਂ",
    historyInMass: (symbol: string) => `${symbol} ਸਮੂਹ ਵਿੱਚ ਗਿਣੀ ਗਈ`,
    historyMassRemaining: (amount: string) => `ਸਮੂਹ ਵਿੱਚ ਬਾਕੀ: ${amount}`,
    historyMassInProgress: "ਇਸ ਸਮੂਹ ਦੀ ਵਾਪਸ ਖਰੀਦ ਜਾਰੀ ਹੈ।",
    historyMassDone: "ਸਮੂਹ ਪੂਰੀ ਤਰ੍ਹਾਂ ਵਾਪਸ ਖਰੀਦਿਆ ਜਾ ਚੁੱਕਾ ਹੈ।",
    historyMassTitle: "ਸਮੂਹ ਅਨੁਸਾਰ ਵਾਪਸ ਖਰੀਦਾਂ",
    historyMassRecord: (percent: string, symbol: string) =>
      `${symbol} ਸਮੂਹ ਦਾ ${percent}`,
    historyBoughtBack: (amount: string) => `ਵਾਪਸ ਖਰੀਦੇ TTTI-T: ${amount}`,
    historyReturned: (amount: string) => `ਵਾਪਸ ਕੀਤਾ: ${amount}`,
    historyDate: (date: string) => `ਵਾਪਸ ਖਰੀਦ ਦੀ ਮਿਤੀ: ${date}`,
    statusCompleted: "ਵਾਪਸ ਖਰੀਦਿਆ",
    statusInProgress: "ਵਾਪਸ ਖਰੀਦ ਜਾਰੀ ਹੈ",
    statusPayoutFailed: "ਭੁਗਤਾਨ ਅਸਫਲ",
    explainTitle: "ਵਾਪਸ ਖਰੀਦ ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ",
    explainMass:
      "ਹਰ ਭੁਗਤਾਨ ਟੋਕਨ ਦਾ ਇੱਕ ਔਸਤ ਸਮੂਹ ਹੈ: ICP, ckBTC, ckUSDC ਅਤੇ ckUSDT। BTC ਖਰੀਦਾਂ ckBTC ਸਮੂਹ ਵਿੱਚ ਗਿਣੀਆਂ ਜਾਂਦੀਆਂ ਹਨ। ਵੱਖ-ਵੱਖ ਟੋਕਨਾਂ ਦੇ ਸਮੂਹ ਕਦੇ ਇਕੱਠੇ ਨਹੀਂ ਕੀਤੇ ਜਾਂਦੇ।",
    explainRatio:
      "ਸਮੂਹ ਦਾ ਔਸਤ ਅਨੁਪਾਤ ਕੁੱਲ ਸ਼ੁੱਧ ਭੁਗਤਾਨ ਨੂੰ ਪ੍ਰਾਪਤ ਕੁੱਲ TTTI-T ਨਾਲ ਭਾਗ ਦੇ ਕੇ ਮਿਲਦਾ ਹੈ। ਪਹਿਲਾਂ ਹੋਈਆਂ ਵਾਪਸ ਖਰੀਦਾਂ ਸਮੂਹ ਵਿੱਚੋਂ ਘਟਾਈਆਂ ਜਾਂਦੀਆਂ ਹਨ।",
    explainPercent:
      "ਤੁਸੀਂ ਸਮੂਹ ਦੇ ਬਾਕੀ ਹਿੱਸੇ ਦਾ ਪ੍ਰਤੀਸ਼ਤ ਚੁਣਦੇ ਹੋ, 1% ਤੋਂ 100% ਤੱਕ। 100% ਪੂਰਾ ਬਾਕੀ ਹਿੱਸਾ ਵਾਪਸ ਖਰੀਦਦਾ ਹੈ। ਇੱਕ ਸਮੂਹ ਦੀ ਇੱਕ ਸਮੇਂ ਇੱਕ ਹੀ ਵਾਪਸ ਖਰੀਦ।",
    explainRule: (price: string) =>
      `ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀਆਂ ਦੋ ਮਾਤਰਾਵਾਂ ਵਿੱਚੋਂ ਛੋਟੀ ਹੁੰਦੀ ਹੈ: ਸਮੂਹ ਦੇ ਔਸਤ ਅਨੁਪਾਤ 'ਤੇ ਅਨੁਪਾਤਕ ਸ਼ੁੱਧ ਮਾਤਰਾ, ਜਾਂ ਦਿਨ ਦੀ ਦਰ 'ਤੇ ${price} ਪ੍ਰਤੀ TTTI-T ਦੇ ਹਿਸਾਬ ਨਾਲ ਵਾਪਸ ਖਰੀਦੇ ਗਏ TTTI-T ਦੀ ਕੀਮਤ ਜਿੰਨੀ ਮਾਤਰਾ।`,
    explainFees: (fee: string) =>
      `${fee} ਵਾਪਸ ਖਰੀਦ ਫੀਸ ਅਤੇ ਤੀਜੀਆਂ ਧਿਰਾਂ ਦੀਆਂ ਸਾਰੀਆਂ ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਵਿੱਚੋਂ ਕੱਟੀਆਂ ਜਾਂਦੀਆਂ ਹਨ।`,
    explainPurchaseFee: (fee: string) =>
      `ਮੂਲ ${fee} ਖਰੀਦ ਫੀਸ ਵਾਪਸ ਨਹੀਂ ਕੀਤੀ ਜਾਂਦੀ।`,
    explainBtc:
      "BTC ਖਰੀਦਾਂ ਦੀ ਵਾਪਸੀ ckBTC ਵਿੱਚ ਹੁੰਦੀ ਹੈ, ਜਿਸ ਨੂੰ ਤੁਸੀਂ ਖੁਦ BTC ਵਿੱਚ ਬਦਲਦੇ ਹੋ।",
    explainEligibility:
      "ਸਿਰਫ਼ ਵਰਜ਼ਨ 26 ਤੋਂ ਬਾਅਦ ਦੀਆਂ ਖਰੀਦਾਂ ਕਿਸੇ ਸਮੂਹ ਵਿੱਚ ਹਨ। ਟ੍ਰਾਂਸਫਰ ਰਾਹੀਂ ਪ੍ਰਾਪਤ TTTI-T ਕਿਸੇ ਵੀ ਸਮੂਹ ਵਿੱਚ ਨਹੀਂ ਹਨ।",
    signInRequired:
      "ਵਾਪਸ ਖਰੀਦ ਦੀ ਬੇਨਤੀ ਕਰਨ ਲਈ Internet Identity ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ।",
    loading: "ਸਮੂਹ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…",
    loadError: "ਸਮੂਹ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    retry: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    massLabel: "ਸਮੂਹ",
    massPlaceholder: "ਇੱਕ ਸਮੂਹ ਚੁਣੋ",
    massOption: (symbol: string, ttti: string, net: string) =>
      `${symbol} · ${ttti} · ${net}`,
    massPurchasesLabel: "ਸਮੂਹ ਵਿੱਚ ਖਰੀਦਾਂ",
    massRemainingTttiLabel: "ਬਾਕੀ TTTI-T",
    massRemainingNetLabel: "ਬਾਕੀ ਸ਼ੁੱਧ ਭੁਗਤਾਨ",
    massRatioLabel: "ਔਸਤ ਅਨੁਪਾਤ (ਸ਼ੁੱਧ ਭੁਗਤਾਨ / ਪ੍ਰਾਪਤ TTTI-T)",
    massInProgress:
      "ਇਸ ਸਮੂਹ ਦੀ ਵਾਪਸ ਖਰੀਦ ਜਾਰੀ ਹੈ। ਇਸ ਦੇ ਖਤਮ ਹੋਣ ਤੋਂ ਬਾਅਦ ਨਵੀਂ ਬੇਨਤੀ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ।",
    percentLabel: "ਬਾਕੀ ਦਾ ਪ੍ਰਤੀਸ਼ਤ",
    percentShare: (symbol: string) => `ਸਮੂਹ ਵਿੱਚ ਬਾਕੀ ${symbol} ਦਾ ਹਿੱਸਾ`,
    percentSummary: (percent: string, amount: string) =>
      `ਬਾਕੀ ਦਾ ${percent}: ${amount}`,
    percentRequired: "ਅਨੁਮਾਨ ਦੇਖਣ ਲਈ ਪ੍ਰਤੀਸ਼ਤ ਚੁਣੋ।",
    percentShareCapped: (symbol: string) =>
      `ਤੁਹਾਡੀ ਵੱਧ ਤੋਂ ਵੱਧ ਵਾਪਸ ਖਰੀਦ ਦਾ ਹਿੱਸਾ (${symbol})`,
    capNotice: (usable: string, remaining: string) =>
      `ਵੱਧ ਤੋਂ ਵੱਧ ਸੀਮਾ ਤੁਹਾਡੇ ਵਰਤੋਂਯੋਗ ਬਕਾਏ ਨਾਲ ਸੀਮਿਤ ਹੈ: ${usable} (ਵਾਲਿਟ ਬਕਾਇਆ ਘਟਾ ਲੇਜਰ ਫੀਸਾਂ), ਸਮੂਹ ਵਿੱਚ ਬਾਕੀ ${remaining} ਤੋਂ ਘੱਟ।`,
    capTooLow: (usable: string, one: string, minimum: string) =>
      `ਵਾਪਸ ਖਰੀਦ ਉਪਲਬਧ ਨਹੀਂ: ਤੁਹਾਡਾ ਵਰਤੋਂਯੋਗ ਬਕਾਇਆ (${usable}, ਵਾਲਿਟ ਬਕਾਇਆ ਘਟਾ ਲੇਜਰ ਫੀਸਾਂ) ਸਮੂਹ ਦੇ ${one} (${minimum}) ਤੋਂ ਘੱਟ ਹੈ।`,
    noEligible: "ਕਿਸੇ ਵੀ ਸਮੂਹ ਵਿੱਚ ਵਾਪਸ ਖਰੀਦਣ ਲਈ TTTI-T ਬਾਕੀ ਨਹੀਂ ਹਨ।",
    quoteTitle: "ਅਨੁਮਾਨ",
    quoteLoading: "ਅਨੁਮਾਨ ਦੀ ਗਣਨਾ ਹੋ ਰਹੀ ਹੈ…",
    quoteNote: "ਅਨੁਮਾਨ ਦਿਨ ਦੀ ਦਰ ਅਨੁਸਾਰ ਹੁੰਦਾ ਹੈ ਅਤੇ ਬੇਨਤੀ ਸਮੇਂ ਦੁਬਾਰਾ ਗਿਣਿਆ ਜਾਂਦਾ ਹੈ।",
    tttiReturnedLabel: "ਵਾਪਸ ਖਰੀਦੇ TTTI-T",
    originalNetLabel: "ਅਨੁਪਾਤਕ ਸ਼ੁੱਧ ਮਾਤਰਾ",
    baseLabel: "ਆਧਾਰ ਮਾਤਰਾ",
    ruleLabel: "ਲਾਗੂ ਨਿਯਮ",
    ruleOriginalNet: "ਔਸਤ ਅਨੁਪਾਤ 'ਤੇ ਅਨੁਪਾਤਕ ਸ਼ੁੱਧ ਮਾਤਰਾ (ਛੋਟੀ)",
    ruleDayRate: "ਦਿਨ ਦੀ ਦਰ 'ਤੇ TTTI-T ਦੀ ਕੀਮਤ (ਛੋਟੀ)",
    feeLabel: (fee: string) => `ਵਾਪਸ ਖਰੀਦ ਫੀਸ (${fee})`,
    thirdPartyLabel: "ਤੀਜੀਆਂ ਧਿਰਾਂ ਦੀਆਂ ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ",
    tttiFeeLabel: "TTTI-T ਟ੍ਰਾਂਸਫਰ ਫੀਸ",
    amountReturnedLabel: "ਵਾਪਸ ਕੀਤੀ ਰਕਮ",
    notRecorded: "ਦਰਜ ਨਹੀਂ",
    breakdownTitle: "ਕਦਮ-ਦਰ-ਕਦਮ ਗਣਨਾ",
    bdMassLabel: (symbol: string) => `${symbol} ਸਮੂਹ: ਸ਼ੁੱਧ ਭੁਗਤਾਨ / ਪ੍ਰਾਪਤ TTTI-T`,
    bdPriorLabel: "ਪਿਛਲੀਆਂ ਵਾਪਸ ਖਰੀਦਾਂ ਘਟਾਈਆਂ",
    bdRatioLabel: "ਔਸਤ ਅਨੁਪਾਤ (ਸ਼ੁੱਧ ਭੁਗਤਾਨ / ਬਾਕੀ TTTI-T)",
    bdTttiLabel: (price: string) => `${price} ਪ੍ਰਤੀ TTTI-T 'ਤੇ ਵਾਪਸ ਖਰੀਦੇ TTTI-T`,
    bdRateLabel: "ਅਨੁਮਾਨ ਵਿੱਚ ਦਿਨ ਦੀ ਦਰ",
    bdALabel: "A · ਔਸਤ ਅਨੁਪਾਤ 'ਤੇ ਅਨੁਪਾਤਕ ਸ਼ੁੱਧ ਮਾਤਰਾ",
    bdBLabel: "B · ਦਿਨ ਦੀ ਦਰ 'ਤੇ ਵਾਪਸ ਖਰੀਦੇ TTTI-T ਦੀ ਕੀਮਤ ਜਿੰਨੀ ਮਾਤਰਾ",
    bdUsesA: (a: string, b: string) =>
      `ਵਰਤਿਆ ਮੁੱਲ: A, ਦੋਵਾਂ ਵਿੱਚੋਂ ਛੋਟਾ (${a}, B ਹੈ ${b})।`,
    bdUsesB: (a: string, b: string) =>
      `ਵਰਤਿਆ ਮੁੱਲ: B, ਦੋਵਾਂ ਵਿੱਚੋਂ ਛੋਟਾ (${b}, A ਹੈ ${a})।`,
    bdReturnedFeeLabel: (symbol: string) => `${symbol} ਟ੍ਰਾਂਸਫਰ ਫੀਸ`,
    bdTttiFeeLabel: "TTTI-T ਟ੍ਰਾਂਸਫਰ ਫੀਸ, ਤੁਹਾਡੇ TTTI-T ਬਕਾਏ ਵਿੱਚੋਂ ਲਈ ਜਾਂਦੀ ਹੈ",
    summarySend: (
      ttti: string,
      tttiUsd: string,
      amount: string,
      amountUsd: string,
    ) =>
      `ਤੁਸੀਂ ${ttti} (ਲਗਭਗ ${tttiUsd}) ਭੇਜਦੇ ਹੋ ਅਤੇ ${amount} (ਲਗਭਗ ${amountUsd}) ਪ੍ਰਾਪਤ ਕਰਦੇ ਹੋ।`,
    step1Title: "2 ਵਿੱਚੋਂ ਕਦਮ 1 · TTTI-T ਮਨਜ਼ੂਰ ਕਰੋ",
    approvalIntro: (amount: string) =>
      `ਇਸ ਵਾਪਸ ਖਰੀਦ ਲਈ ਕੰਟਰੈਕਟ ਨੂੰ ਤੁਹਾਡੇ TTTI-T ਬਕਾਏ ਵਿੱਚੋਂ ਵੱਧ ਤੋਂ ਵੱਧ ${amount} ਲੈਣ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ। ਮਿਆਦ ਚੁਣੋ, ਚੇਤਾਵਨੀਆਂ ਪੜ੍ਹੋ, ਫਿਰ ਪੁਸ਼ਟੀ ਕਰੋ।`,
    approvalInPlace: (amount: string, date: string) =>
      `ਕੰਟਰੈਕਟ ਲਈ ${amount} ਦੀ ਮਨਜ਼ੂਰੀ ${date} ਤੱਕ ਲਾਗੂ ਹੈ।`,
    approvalAmountLabel: "ਵੱਧ ਤੋਂ ਵੱਧ ਰਕਮ",
    spenderLabel: "ਕੰਟਰੈਕਟ (spender)",
    approvalFeeLine: (fee: string) => `ਮਨਜ਼ੂਰੀ ਲਈ ਲੈਜਰ ਫੀਸ: ${fee}`,
    balanceLine: (amount: string) => `ਬਕਾਇਆ: ${amount}`,
    warnCapped:
      "ਮਨਜ਼ੂਰੀ ਇਸ ਵਾਪਸ ਖਰੀਦ ਲਈ ਲੋੜੀਂਦੀ ਰਕਮ ਤੱਕ ਸੀਮਤ ਹੈ ਅਤੇ ਚੁਣੀ ਮਿਆਦ 'ਤੇ ਖਤਮ ਹੁੰਦੀ ਹੈ।",
    warnFee:
      "ਮਨਜ਼ੂਰੀ 'ਤੇ TTTI-T ਲੈਜਰ ਫੀਸ ਲੱਗਦੀ ਹੈ, ਭਾਵੇਂ ਵਾਪਸ ਖਰੀਦ ਦੀ ਬੇਨਤੀ ਨਾ ਕੀਤੀ ਜਾਵੇ।",
    warnUnused: "ਨਾ ਵਰਤੀ ਗਈ ਮਨਜ਼ੂਰੀ ਮਿਆਦ ਖਤਮ ਹੋਣ ਤੱਕ ਵੈਧ ਰਹਿੰਦੀ ਹੈ।",
    warnIrreversible: "ਭੁਗਤਾਨ ਸਫਲ ਹੋਣ ਤੋਂ ਬਾਅਦ ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ।",
    warnOverBalance:
      "ਰਕਮ ਤੁਹਾਡੇ ਮੌਜੂਦਾ TTTI-T ਬਕਾਏ ਤੋਂ ਵੱਧ ਹੈ। ਬਕਾਇਆ ਪੂਰਾ ਹੋਣ ਤੱਕ ਵਾਪਸ ਖਰੀਦ ਅਸਫਲ ਰਹੇਗੀ।",
    warnLongLived: "ਇਹ ਮਨਜ਼ੂਰੀ 24 ਘੰਟਿਆਂ ਤੋਂ ਵੱਧ ਸਮੇਂ ਲਈ ਵੈਧ ਰਹਿੰਦੀ ਹੈ।",
    approveConfirm:
      "ਮੈਂ ਇਸ ਵਾਪਸ ਖਰੀਦ ਲਈ ਕੰਟਰੈਕਟ ਨੂੰ ਇਹ TTTI-T ਰਕਮ ਲੈਣ ਦੀ ਮਨਜ਼ੂਰੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ।",
    approveButton: "TTTI-T ਮਨਜ਼ੂਰ ਕਰੋ",
    approving: "ਦਸਤਖਤ ਹੋ ਰਹੇ ਹਨ…",
    approveDone: "TTTI-T ਮਨਜ਼ੂਰੀ ਦਰਜ ਹੋ ਗਈ।",
    approveError: "ਮਨਜ਼ੂਰੀ ਦਰਜ ਨਹੀਂ ਹੋਈ।",
    step2Title: "2 ਵਿੱਚੋਂ ਕਦਮ 2 · ਵਾਪਸ ਖਰੀਦ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    requestIntro: (ttti: string, amount: string) =>
      `${ttti} ਭੁਗਤਾਨ ਸਫਲ ਹੋਣ ਤੱਕ ਕੰਟਰੈਕਟ ਦੇ ਐਸਕ੍ਰੋ ਖਾਤੇ ਵਿੱਚ ਰਹਿੰਦੇ ਹਨ, ਫਿਰ ਫੰਡ ਦੇਣ ਵਾਲੇ ਕੋਲ ਜਾਂਦੇ ਹਨ, ਅਤੇ ਤੁਹਾਨੂੰ ${amount} ਮਿਲਦੇ ਹਨ, ਜਿਵੇਂ ਬੇਨਤੀ ਸਮੇਂ ਗਿਣਿਆ ਗਿਆ। ਜੇ ਲੈਜਰ ਭੁਗਤਾਨ ਦੀ ਹਰ ਕੋਸ਼ਿਸ਼ ਅਸਵੀਕਾਰ ਕਰ ਦਿੰਦਾ ਹੈ, ਤਾਂ ਤੁਸੀਂ ਰੱਦ ਕਰਕੇ ਉਨ੍ਹਾਂ ਨੂੰ ਵਾਪਸ ਲੈ ਸਕਦੇ ਹੋ। ਨਹੀਂ ਤਾਂ, ਰੱਦ ਕਰਨਾ ਉਦੋਂ ਤੱਕ ਉਡੀਕ ਕਰਦਾ ਹੈ ਜਦੋਂ ਤੱਕ ਐਡਮਿਨ ਭੁਗਤਾਨ ਦੀ ਜਾਂਚ ਨਹੀਂ ਕਰ ਲੈਂਦਾ।`,
    requestConfirm:
      "ਮੈਂ ਇਸ ਵਾਪਸ ਖਰੀਦ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦਾ/ਕਰਦੀ ਹਾਂ। ਭੁਗਤਾਨ ਸਫਲ ਹੋਣ ਤੋਂ ਬਾਅਦ ਇਹ ਰੱਦ ਨਹੀਂ ਹੋ ਸਕਦੀ।",
    requestButton: "ਵਾਪਸ ਖਰੀਦ ਦੀ ਬੇਨਤੀ ਕਰੋ",
    requesting: "ਵਾਪਸ ਖਰੀਦ 'ਤੇ ਕਾਰਵਾਈ ਹੋ ਰਹੀ ਹੈ…",
    cancel: "ਰੱਦ ਕਰੋ",
    back: "ਪਿੱਛੇ",
    resultCompleted: "ਵਾਪਸ ਖਰੀਦ ਪੂਰੀ ਹੋਈ।",
    resultInProgress: "ਵਾਪਸ ਖਰੀਦ ਜਾਰੀ ਹੈ।",
    resultPayoutFailed:
      "ਤੁਹਾਡੇ TTTI-T ਫੰਡ ਦੇਣ ਵਾਲੇ ਕੋਲ ਹਨ ਅਤੇ ਭੁਗਤਾਨ ਅਸਫਲ ਰਿਹਾ। ਭੁਗਤਾਨ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ, ਜਾਂ ਉਨ੍ਹਾਂ ਨੂੰ ਵਾਪਸ ਕਰਵਾਉਣ ਲਈ ਐਡਮਿਨ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
    resultEscrowPayoutFailed:
      "ਤੁਹਾਡੇ TTTI-T ਕੰਟਰੈਕਟ ਦੇ ਐਸਕ੍ਰੋ ਖਾਤੇ ਵਿੱਚ ਰੱਖੇ ਹੋਏ ਹਨ ਅਤੇ ਭੁਗਤਾਨ ਅਸਫਲ ਰਿਹਾ। ਭੁਗਤਾਨ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ, ਜਾਂ ਜੇ ਲੈਜਰ ਨੇ ਹਰ ਕੋਸ਼ਿਸ਼ ਅਸਵੀਕਾਰ ਕੀਤੀ ਹੈ ਤਾਂ ਰੱਦ ਕਰੋ।",
    resultMessage: (message: string) => `ਵੇਰਵੇ: ${message}`,
    pullBlockLabel: "TTTI-T ਬਲਾਕ",
    payoutBlockLabel: (symbol: string) => `${symbol} ਭੁਗਤਾਨ ਬਲਾਕ`,
    retryPayout: "ਭੁਗਤਾਨ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    retrying: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਹੋ ਰਹੀ ਹੈ…",
    newBuyback: "ਨਵੀਂ ਵਾਪਸ ਖਰੀਦ",
    errAnonymous: "ਵਾਪਸ ਖਰੀਦ ਦੀ ਬੇਨਤੀ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    errNotBuyer:
      "ਸਿਰਫ਼ ਖਰੀਦਦਾਰ ਹੀ ਇਸ ਵਾਪਸ ਖਰੀਦ ਦੀ ਬੇਨਤੀ ਜਾਂ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰ ਸਕਦਾ ਹੈ।",
    errInProgress: "ਇੱਕ ਵਾਪਸ ਖਰੀਦ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ।",
    errInvalidPercent: "1% ਤੋਂ 100% ਤੱਕ ਦਾ ਪ੍ਰਤੀਸ਼ਤ ਚੁਣੋ।",
    errNothingRemaining: "ਇਸ ਸਮੂਹ ਵਿੱਚ ਵਾਪਸ ਖਰੀਦਣ ਲਈ ਕੁਝ ਬਾਕੀ ਨਹੀਂ ਹੈ।",
    errMassInProgress: "ਇਸ ਸਮੂਹ ਦੀ ਵਾਪਸ ਖਰੀਦ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ।",
    errBuybackNotFound: "ਇਹ ਵਾਪਸ ਖਰੀਦ ਨਹੀਂ ਮਿਲੀ।",
    errRateUnavailable: (symbol: string) =>
      `ਕੋਈ ਵੈਧ ${symbol} ਦਰ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    errAdminAccountNotSet: "ਵਾਪਸ ਖਰੀਦ ਅਜੇ ਉਪਲਬਧ ਨਹੀਂ: ਫੰਡਿੰਗ ਖਾਤਾ ਸੈੱਟ ਨਹੀਂ ਹੈ।",
    errAdminAllowanceInsufficient: (symbol: string) =>
      `ਵਾਪਸ ਖਰੀਦ ਲਈ ਮਨਜ਼ੂਰ ${symbol} ਫੰਡ ਇਸ ਰਕਮ ਲਈ ਕਾਫ਼ੀ ਨਹੀਂ ਹਨ। ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    errAdminAllowanceExpired: (symbol: string) =>
      `ਵਾਪਸ ਖਰੀਦ ਲਈ ${symbol} ਫੰਡਿੰਗ ਮਨਜ਼ੂਰੀ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਗਈ ਹੈ। ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    errAdminBalanceInsufficient: (symbol: string) =>
      `${symbol} ਵਾਪਸ ਖਰੀਦ ਫੰਡ ਇਸ ਰਕਮ ਲਈ ਕਾਫ਼ੀ ਨਹੀਂ ਹਨ। ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    errReceiveTokenMismatch:
      "ਵਾਪਸ ਖਰੀਦ ਦਾ ਭੁਗਤਾਨ ਸਿਰਫ਼ ਉਸੇ ਟੋਕਨ ਵਿੱਚ ਹੁੰਦਾ ਹੈ ਜਿਸ ਨਾਲ ਤੁਸੀਂ ਭੁਗਤਾਨ ਕੀਤਾ ਸੀ।",
    errBuyerAllowance: (required: string, allowance: string) =>
      `ਕੰਟਰੈਕਟ ਲਈ ਤੁਹਾਡੀ TTTI-T ਮਨਜ਼ੂਰੀ ${allowance} ਹੈ; ${required} ਦੀ ਲੋੜ ਹੈ। ਦੁਬਾਰਾ ਮਨਜ਼ੂਰ ਕਰੋ।`,
    errAmountTooSmall: "ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਫੀਸਾਂ ਪੂਰੀਆਂ ਨਹੀਂ ਕਰੇਗੀ। ਵਾਪਸ ਖਰੀਦ ਸੰਭਵ ਨਹੀਂ।",
    errNotRetryable: "ਇਸ ਵਾਪਸ ਖਰੀਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਲਈ ਕੋਈ ਅਸਫਲ ਭੁਗਤਾਨ ਨਹੀਂ ਹੈ।",
    errPullFailed: (detail: string) => `TTTI-T ਲਏ ਨਹੀਂ ਜਾ ਸਕੇ: ${detail}`,
    errPayoutFailed: (detail: string) => `ਭੁਗਤਾਨ ਅਸਫਲ ਰਿਹਾ: ${detail}`,
    errCallFailed: (detail: string) => `ਬੇਨਤੀ ਅਸਫਲ ਰਹੀ: ${detail}`,
    statusCancelled: "ਰੱਦ ਕੀਤੀ ਗਈ",
    tttiEscrowFeeLabel: "ਦੂਜੀ TTTI-T ਟ੍ਰਾਂਸਫਰ ਫੀਸ (ਐਸਕ੍ਰੋ)",
    bdTttiEscrowFeeLabel:
      "ਦੂਜੀ TTTI-T ਟ੍ਰਾਂਸਫਰ ਫੀਸ, ਐਸਕ੍ਰੋ ਵਿੱਚ ਰੱਖੇ TTTI-T ਨੂੰ ਜਾਰੀ ਕਰਨ ਜਾਂ ਵਾਪਸ ਕਰਨ ਲਈ, ਤੁਹਾਡੇ TTTI-T ਬਕਾਏ ਵਿੱਚੋਂ ਲਈ ਜਾਂਦੀ ਹੈ",
    approvalTwoFees:
      "ਇਹ ਰਕਮ ਵਾਪਸ ਖਰੀਦੇ ਜਾਣ ਵਾਲੇ TTTI-T ਅਤੇ ਦੋ TTTI-T ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ ਹੈ: ਇੱਕ TTTI-T ਨੂੰ ਐਸਕ੍ਰੋ ਵਿੱਚ ਰੱਖਣ ਲਈ, ਇੱਕ ਉਨ੍ਹਾਂ ਨੂੰ ਜਾਰੀ ਕਰਨ ਜਾਂ ਵਾਪਸ ਕਰਨ ਲਈ।",
    attemptFailed: (reason: string) => `ਭੁਗਤਾਨ ਦੀ ਆਖਰੀ ਕੋਸ਼ਿਸ਼ ਅਸਫਲ: ${reason}`,
    attemptUnknown: "ਭੁਗਤਾਨ ਦੀ ਆਖਰੀ ਕੋਸ਼ਿਸ਼: ਨਤੀਜਾ ਅਣਜਾਣ।",
    attemptToReview: "ਭੁਗਤਾਨ ਦੀ ਆਖਰੀ ਕੋਸ਼ਿਸ਼: ਨਤੀਜਾ ਅਣਜਾਣ, ਐਡਮਿਨ ਵੱਲੋਂ ਜਾਂਚ ਬਾਕੀ।",
    cancelBlockLabel: "TTTI-T ਵਾਪਸੀ ਬਲਾਕ",
    cancelButton: "ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਕਰੋ",
    cancelTitle: "ਕੀ ਇਹ ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਕਰਨੀ ਹੈ?",
    cancelDescription: (amount: string) =>
      `ਕੋਈ ਭੁਗਤਾਨ ਨਹੀਂ ਕੀਤਾ ਜਾਂਦਾ। ਐਸਕ੍ਰੋ ਵਿੱਚ ਰੱਖੇ ${amount} ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਵਾਪਸ ਆਉਂਦੇ ਹਨ। ਦੋ TTTI-T ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ ਵਾਪਸ ਨਹੀਂ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ।`,
    cancelConfirm: "ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਕਰੋ",
    cancelKeep: "ਵਾਪਸ ਖਰੀਦ ਰੱਖੋ",
    cancelling: "ਰੱਦ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ…",
    cancelDone: "ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਕੀਤੀ ਗਈ। TTTI-T ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਵਾਪਸ ਕੀਤੇ ਗਏ।",
    resultCancelled:
      "ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਕੀਤੀ ਗਈ। ਐਸਕ੍ਰੋ ਵਿੱਚ ਰੱਖੇ TTTI-T ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਵਾਪਸ ਕੀਤੇ ਗਏ।",
    errSalesPaused: "ਵਾਪਸ ਖਰੀਦ ਰੋਕੀ ਹੋਈ ਹੈ।",
    errNotCancellable:
      "ਇਹ ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ। ਸਿਰਫ਼ ਉਹ ਅਸਫਲ ਭੁਗਤਾਨ ਰੱਦ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ ਜਿਸ ਦੀਆਂ ਸਾਰੀਆਂ ਕੋਸ਼ਿਸ਼ਾਂ ਅਸਵੀਕਾਰ ਹੋਈਆਂ ਹੋਣ।",
    errAttemptUnknown:
      "ਇੱਕ ਭੁਗਤਾਨ ਕੋਸ਼ਿਸ਼ ਦਾ ਨਤੀਜਾ ਅਣਜਾਣ ਹੈ। ਨਤੀਜਾ ਪਤਾ ਲੱਗਣ ਤੱਕ ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ।",
    errAttemptArrived: "ਇੱਕ ਭੁਗਤਾਨ ਕੋਸ਼ਿਸ਼ ਪਹੁੰਚ ਗਈ। ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ।",
    errNotLegacy: "ਇਹ ਕਾਰਵਾਈ ਸਿਰਫ਼ ਐਸਕ੍ਰੋ ਤੋਂ ਪਹਿਲਾਂ ਦਰਜ ਵਾਪਸ ਖਰੀਦਾਂ 'ਤੇ ਲਾਗੂ ਹੁੰਦੀ ਹੈ।",
    errNotAuthorized: "ਸਿਰਫ਼ ਖਰੀਦਦਾਰ ਜਾਂ ਐਡਮਿਨ ਇਹ ਵਾਪਸ ਖਰੀਦ ਰੱਦ ਕਰ ਸਕਦੇ ਹਨ।",
    errCancelFailed: (detail: string) => `TTTI-T ਵਾਪਸ ਨਹੀਂ ਕੀਤੇ ਜਾ ਸਕੇ: ${detail}`,
    errReleaseFailed: (detail: string) =>
      `TTTI-T ਫੰਡਿੰਗ ਖਾਤੇ ਵਿੱਚ ਜਾਰੀ ਨਹੀਂ ਕੀਤੇ ਜਾ ਸਕੇ: ${detail}`,
  },
});

/**
 * Admin buyback texts. English only, like the other admin cards; numbers on
 * /admin use en-US (defaultNumberLang).
 */
export const BUYBACK_ADMIN_TEXT = {
  title: "Buybacks",
  intro:
    "Buybacks are paid from the buyback funding account registered below through capped ICRC-2 approvals with an expiration, one per token. The TTTI-T bought back go to the same account.",
  accountLabel: "Buyback admin account",
  accountNotSet: "No admin account set. Buybacks are refused until one is set.",
  accountPlaceholder: "Principal ID",
  subaccountPlaceholder: "Subaccount (64 hex characters, optional)",
  saveAccount: "Save account",
  savingAccount: "Saving…",
  accountSaved: "Buyback admin account saved",
  accountError: "The account could not be saved.",
  fundingTitle: "Funding per token",
  fundingToken: "Token",
  fundingAllowance: "Allowance to the contract",
  fundingExpires: "Expires",
  fundingBalance: "Balance",
  fundingNoExpiry: "No expiration",
  fundingExpired: "Expired",
  fundingError: (message: string) => `Read error: ${message}`,
  fundingLoadError: "Funding could not be read.",
  refresh: "Refresh",
  listTitle: "All buybacks",
  listIntro:
    "Buybacks by mass, with the percentage of the mass remainder bought back. Records made per purchase are listed separately.",
  listEmpty: "No buyback yet.",
  listLoadError: "Buybacks could not be loaded.",
  massGroupTitle: (symbol: string) => `${symbol} mass`,
  legacyTitle: "Per-purchase buybacks",
  legacyPurchase: (id: string) => `Purchase #${id}`,
  massTitle: "Masses per payment token",
  massIntro:
    "Each buyer has one average mass per payment token. BTC purchases count in the ckBTC mass.",
  massLoadError: "Masses could not be loaded.",
  massEmpty: "No mass yet.",
  stateInProgress: "Buyback in progress",
  stateOpen: "Open",
  stateDone: "Fully bought back",
  colDate: "Date",
  colPurchase: "Purchase",
  colBuyer: "Buyer",
  colToken: "Token",
  colMass: "Mass",
  colPercent: "Percent",
  colPurchases: "Purchases",
  colTotalNet: "Total net paid",
  colTotalTtti: "Total TTTI-T",
  colRatio: "Average ratio",
  colBoughtBackTtti: "TTTI-T bought back",
  colRemainingTtti: "Remaining TTTI-T",
  colRemainingNet: "Remaining net",
  colState: "State",
  colPayoutBlock: "Payout block",
  colTtti: "TTTI-T",
  colReturned: "Returned",
  colRule: "Rule",
  colStatus: "Status",
} as const;
