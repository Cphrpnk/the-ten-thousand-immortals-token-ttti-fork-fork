import { defineDict } from "../core/dict";

/**
 * Personal guarantee screen ("Ma garantie"): masses, public unclaimed total,
 * redemption with preview, excess withdrawal, allowance explanation,
 * redemption history and every GuaranteeError. English is authoritative; the
 * sentence "In case of conflict, the English version prevails." comes from
 * SITE_TEXT. Amounts, fees, USD values, rates, block indexes and token
 * symbols are passed in already formatted; never translated.
 */
export const GUARANTEE_TEXT = defineDict({
  en: {
    // Page
    title: "My guarantee",
    intro:
      "Each mint creates a personal mass: the TTTI-T minted and the guarantee deposited with it, in the token paid. The mass belongs to the person who minted. Any TTTI-T held can be returned against it.",
    signInPrompt: "Sign in to see your guarantee.",
    loading: "Loading your guarantee…",
    loadError: "Your guarantee could not be loaded.",
    retryButton: "Retry",
    emptyTitle: "No guarantee yet",
    emptyBody:
      "A guarantee appears here after a mint. It is kept in the token paid.",
    // Mass
    massHeading: (symbol: string) => `${symbol} mass`,
    remainingTtti: "TTTI-T remaining",
    totalTtti: "TTTI-T minted",
    remainingGuarantee: "Guarantee remaining",
    totalGuarantee: "Guarantee deposited",
    excessLabel: "Excess in the guarantee",
    valueLabel: "Guarantee value",
    valueUnavailable: "Not available: no rate at the moment.",
    // Public unclaimed total
    unclaimedTitle: "Unclaimed mass",
    unclaimedIntro:
      "Public total of the masses that have not been redeemed. Individual masses are private.",
    unclaimedCount: (count: string) => `Masses with TTTI-T remaining: ${count}`,
    unclaimedTtti: "TTTI-T remaining",
    unclaimedGuarantee: "Guarantee remaining",
    unclaimedMintOngoing: "The mint is ongoing.",
    unclaimedMintEnded: "The mint has ended.",
    // Public guarantee accounts
    accountsTitle: "Guarantee accounts",
    accountsIntro:
      "For each token, the sum of all masses is compared with the balance of the dedicated guarantee account in the common custody.",
    accountsLoadError: "The guarantee accounts could not be loaded.",
    accountsMassTotal: "Sum of all masses",
    accountsBalance: "Balance of the guarantee account",
    accountsEqual: "Equal",
    accountsMismatch: "Mismatch",
    accountsBalanceBelow: (difference: string) =>
      `The account holds ${difference} less than the sum of the masses.`,
    accountsBalanceAbove: (difference: string) =>
      `The account holds ${difference} more than the sum of the masses.`,
    // Redeem
    redeemTitle: "Redeem",
    redeemIntro:
      "Return TTTI-T against the mass of one token. The preview shows the amount returned before anything is signed.",
    amountLabel: "TTTI-T to return",
    amountPlaceholder: "0.0",
    maxButton: "Max",
    amountInvalid: "Enter an amount greater than zero.",
    redeemButton: "Redeem",
    redeemingButton: "Redeeming…",
    // Preview
    previewTitle: "Preview",
    previewLoading: "Calculating…",
    previewDeposited: "Guarantee deposited for this amount",
    previewDayRate: "Quantity worth 10,000 USD per TTTI-T",
    previewReturned: "Amount returned",
    previewExcessKept: "Kept in the guarantee as excess",
    previewFee: "Redemption fee",
    previewThirdPartyFee: "Third-party ledger fee",
    previewNet: "You receive",
    previewRule: "Rule applied",
    previewUsdNote: "USD values use the rate of this preview.",
    previewFeeNote: (percent: string) =>
      `A fee of ${percent} of the amount returned is deducted, then the ledger fee of the token paid.`,
    returnedTttiNote:
      "Returned TTTI-T are held by the contract. Nothing is burned.",
    // Rules
    ruleDeposited: "Guarantee deposited",
    ruleDayRate: "Quantity worth 10,000 USD per TTTI-T",
    ruleProRata: "Pro rata of the mass",
    explainTitle: "How the amount returned is set",
    explainLowerOfTwo:
      "During the mint, returning x TTTI-T returns the lower of two quantities: the guarantee deposited for x, and the quantity worth 10,000 USD × x at the current rate. The difference stays in the guarantee as excess and can be withdrawn by its owner when the mint has ended.",
    explainLowerOfTwoDetail: (
      deposited: string,
      depositedUsd: string,
      dayRate: string,
      dayRateUsd: string,
      returned: string,
    ) =>
      `Guarantee deposited: ${deposited} (${depositedUsd}). Quantity worth 10,000 USD per TTTI-T: ${dayRate} (${dayRateUsd}). Amount returned, the lower of the two: ${returned}.`,
    explainProRata:
      "After the mint, the amount returned is the pro rata share of the mass, in kind. The mass is divided in proportion to the TTTI-T returned.",
    explainProRataExample:
      "Example: a mass of 1 TTTI-T holds 0.001 ckBTC. Returning 0.5 TTTI-T returns 0.0005 ckBTC, before the fee and the ledger fee.",
    explainAccount:
      "Each token has one dedicated internal account in the common custody. The mint and the auctions credit it. A buyback debits only that account.",
    // Allowance
    allowanceTitle: "TTTI-T approval",
    allowanceExplain: (amount: string, fee: string, required: string) =>
      `Returning TTTI-T needs an ICRC-2 approval for the amount returned plus the TTTI-T ledger fee: ${amount} + ${fee} = ${required}.`,
    allowanceCurrent: (allowance: string) => `Current approval: ${allowance}`,
    allowanceOk: "The current approval covers this redemption.",
    allowanceMissing:
      "The current approval is not enough. Approve the amount before redeeming.",
    approveButton: "Approve",
    approvingButton: "Approving…",
    allowanceExpiryNote:
      "An approval always has an expiration. Check the amount and the date in the wallet before confirming.",
    // Excess
    excessTitle: "Excess withdrawal",
    excessExplain:
      "The excess is the part of the guarantee kept when the lower-of-two rule applied. Its owner can withdraw it once the mint has ended.",
    excessBeforeEnd: "Available when the mint has ended.",
    excessNone: "No excess to withdraw.",
    withdrawButton: "Withdraw excess",
    withdrawingButton: "Withdrawing…",
    // History
    historyTitle: "My redemptions",
    historyEmpty: "No redemption yet.",
    kindRedeem: "Redemption",
    kindExcessWithdrawal: "Excess withdrawal",
    statusCompleted: "Completed",
    statusInProgress: "In progress",
    statusNeedsReview: "To review",
    statusFailed: "Failed",
    historyReturned: "TTTI-T returned",
    historyNet: "Received",
    historyPullBlock: "TTTI-T block",
    historyPayoutBlock: "Payout block",
    // Results
    resultCompleted: (net: string) => `Completed. You received ${net}.`,
    resultInProgress:
      "The payout is in progress. It appears in the list below when it completes.",
    resultNeedsReview:
      "The payout needs a check. It stays in the list below with its status.",
    resultFailed: "The payout did not complete.",
    // Errors
    errAnonymous: "Sign in to use your guarantee.",
    errSalesPaused: "Redemptions are paused.",
    errMassNotFound: "No mass exists for this token.",
    errNothingRemaining: "Nothing remains to redeem in this mass.",
    errAmountTooSmall:
      "The amount returned would not cover the fees. No redemption is possible.",
    errAmountExceedsMass: (requested: string, remaining: string) =>
      `The amount ${requested} is above what remains in the mass: ${remaining}.`,
    errRateUnavailable: (symbol: string) =>
      `No rate is available for ${symbol} at the moment. Try again later.`,
    errTttiBalance: (balance: string, required: string) =>
      `The TTTI-T balance is ${balance}; ${required} is required.`,
    errAllowance: (allowance: string, required: string) =>
      `The TTTI-T approval is ${allowance}; ${required} is required.`,
    errSlippage:
      "The amount received would be lower than the preview. Refresh the preview and try again.",
    errRedemptionInProgress: "A redemption is already in progress.",
    errMintNotEnded: "The excess can be withdrawn when the mint has ended.",
    errNoExcess: "There is no excess to withdraw.",
    errPullFailed: (detail: string) =>
      `The TTTI-T could not be collected: ${detail}`,
    errCallFailed: (detail: string) => `The request failed: ${detail}`,
    errInvalidAmount: "Enter a valid amount.",
    percentShare: "Share of the redeemable amount",
    percentComputedOn:
      "Computed on the redeemable amount: the lower of the mass remaining and the TTTI-T held.",
    balanceNone: "No TTTI-T is available to return from this wallet.",
    heldLabel: "TTTI-T held",
    limitedByBalance: (held: string, max: string) =>
      `The TTTI-T held (${held}) limits the amount to ${max}.`,
    confirmTitle: "Confirm the redemption",
    confirmIntro:
      "You sign an ICRC-2 approval of TTTI-T for the contract, then the contract collects the TTTI-T and pays the net amount.",
    confirmExpiry: "The approval expires in 15 minutes.",
    closeButton: "Close",
    cancelButton: "Cancel",
    resultTitle: "Result",
  },
  fr: {
    title: "Ma garantie",
    intro:
      "Chaque mint crée une masse personnelle : les TTTI-T frappés et la garantie déposée avec eux, dans le jeton payé. La masse appartient à la personne qui a minté. Tout TTTI-T détenu peut être rendu contre elle.",
    signInPrompt: "Connectez-vous pour voir votre garantie.",
    loading: "Chargement de votre garantie…",
    loadError: "Votre garantie n'a pas pu être chargée.",
    retryButton: "Réessayer",
    emptyTitle: "Aucune garantie pour l'instant",
    emptyBody:
      "Une garantie apparaît ici après un mint. Elle est conservée dans le jeton payé.",
    massHeading: (symbol: string) => `Masse ${symbol}`,
    remainingTtti: "TTTI-T restants",
    totalTtti: "TTTI-T frappés",
    remainingGuarantee: "Garantie restante",
    totalGuarantee: "Garantie déposée",
    excessLabel: "Excédent de la garantie",
    valueLabel: "Valeur de la garantie",
    valueUnavailable: "Indisponible : aucun taux pour le moment.",
    unclaimedTitle: "Masse non réclamée",
    unclaimedIntro:
      "Total public des masses qui n'ont pas été rachetées. Les masses individuelles sont privées.",
    unclaimedCount: (count: string) =>
      `Masses avec des TTTI-T restants : ${count}`,
    unclaimedTtti: "TTTI-T restants",
    unclaimedGuarantee: "Garantie restante",
    unclaimedMintOngoing: "Le mint est en cours.",
    unclaimedMintEnded: "Le mint est terminé.",
    // Public guarantee accounts
    accountsTitle: "Comptes de garantie",
    accountsIntro:
      "Pour chaque token, la somme de toutes les masses est comparée au solde du compte de garantie dédié dans la garde commune.",
    accountsLoadError: "Les comptes de garantie n'ont pas pu être chargés.",
    accountsMassTotal: "Somme de toutes les masses",
    accountsBalance: "Solde du compte de garantie",
    accountsEqual: "Égal",
    accountsMismatch: "Écart",
    accountsBalanceBelow: (difference: string) =>
      `Le compte contient ${difference} de moins que la somme des masses.`,
    accountsBalanceAbove: (difference: string) =>
      `Le compte contient ${difference} de plus que la somme des masses.`,
    redeemTitle: "Racheter",
    redeemIntro:
      "Rendez des TTTI-T contre la masse d'un jeton. L'aperçu montre le montant rendu avant toute signature.",
    amountLabel: "TTTI-T à rendre",
    amountPlaceholder: "0,0",
    maxButton: "Max",
    amountInvalid: "Saisissez un montant supérieur à zéro.",
    redeemButton: "Racheter",
    redeemingButton: "Rachat en cours…",
    previewTitle: "Aperçu",
    previewLoading: "Calcul en cours…",
    previewDeposited: "Garantie déposée pour ce montant",
    previewDayRate: "Quantité valant 10 000 USD par TTTI-T",
    previewReturned: "Montant rendu",
    previewExcessKept: "Conservé dans la garantie comme excédent",
    previewFee: "Frais de rachat",
    previewThirdPartyFee: "Frais du ledger (tiers)",
    previewNet: "Vous recevez",
    previewRule: "Règle appliquée",
    previewUsdNote: "Les valeurs en USD utilisent le taux de cet aperçu.",
    previewFeeNote: (percent: string) =>
      `Des frais de ${percent} du montant rendu sont déduits, puis les frais du ledger du jeton payé.`,
    returnedTttiNote:
      "Les TTTI-T rendus sont conservés par le contrat. Rien n'est brûlé.",
    ruleDeposited: "Garantie déposée",
    ruleDayRate: "Quantité valant 10 000 USD par TTTI-T",
    ruleProRata: "Au prorata de la masse",
    explainTitle: "Comment le montant rendu est fixé",
    explainLowerOfTwo:
      "Pendant le mint, rendre x TTTI-T rend le plus bas de deux montants : la garantie déposée pour x, et la quantité valant 10 000 USD × x au taux du moment. La différence reste dans la garantie comme excédent et son propriétaire peut la retirer à la fin du mint.",
    explainLowerOfTwoDetail: (
      deposited: string,
      depositedUsd: string,
      dayRate: string,
      dayRateUsd: string,
      returned: string,
    ) =>
      `Garantie déposée : ${deposited} (${depositedUsd}). Quantité valant 10 000 USD par TTTI-T : ${dayRate} (${dayRateUsd}). Montant rendu, le plus bas des deux : ${returned}.`,
    explainProRata:
      "Après le mint, le montant rendu est la part de la masse au prorata, en nature. La masse est divisée en proportion des TTTI-T rendus.",
    explainProRataExample:
      "Exemple : une masse de 1 TTTI-T contient 0,001 ckBTC. Rendre 0,5 TTTI-T rend 0,0005 ckBTC, avant les frais de rachat et ceux du ledger.",
    explainAccount:
      "Chaque token a un compte interne dédié dans la garde commune. Le mint et les enchères le créditent. Un rachat débite uniquement ce compte.",
    allowanceTitle: "Approbation TTTI-T",
    allowanceExplain: (amount: string, fee: string, required: string) =>
      `Rendre des TTTI-T demande une approbation ICRC-2 pour le montant rendu plus les frais du ledger TTTI-T : ${amount} + ${fee} = ${required}.`,
    allowanceCurrent: (allowance: string) =>
      `Approbation actuelle : ${allowance}`,
    allowanceOk: "L'approbation actuelle couvre ce rachat.",
    allowanceMissing:
      "L'approbation actuelle ne suffit pas. Approuvez le montant avant de racheter.",
    approveButton: "Approuver",
    approvingButton: "Approbation en cours…",
    allowanceExpiryNote:
      "Une approbation a toujours une date d'expiration. Vérifiez le montant et la date dans le wallet avant de confirmer.",
    excessTitle: "Retrait de l'excédent",
    excessExplain:
      "L'excédent est la part de la garantie conservée quand la règle du plus bas des deux s'est appliquée. Son propriétaire peut le retirer une fois le mint terminé.",
    excessBeforeEnd: "Disponible à la fin du mint.",
    excessNone: "Aucun excédent à retirer.",
    withdrawButton: "Retirer l'excédent",
    withdrawingButton: "Retrait en cours…",
    historyTitle: "Mes rachats",
    historyEmpty: "Aucun rachat pour l'instant.",
    kindRedeem: "Rachat",
    kindExcessWithdrawal: "Retrait d'excédent",
    statusCompleted: "Terminé",
    statusInProgress: "En cours",
    statusNeedsReview: "À vérifier",
    statusFailed: "Échoué",
    historyReturned: "TTTI-T rendus",
    historyNet: "Reçu",
    historyPullBlock: "Bloc TTTI-T",
    historyPayoutBlock: "Bloc du versement",
    resultCompleted: (net: string) => `Terminé. Vous avez reçu ${net}.`,
    resultInProgress:
      "Le versement est en cours. Il apparaît dans la liste ci-dessous une fois terminé.",
    resultNeedsReview:
      "Le versement demande une vérification. Il reste dans la liste ci-dessous avec son statut.",
    resultFailed: "Le versement n'a pas abouti.",
    errAnonymous: "Connectez-vous pour utiliser votre garantie.",
    errSalesPaused: "Les rachats sont en pause.",
    errMassNotFound: "Aucune masse n'existe pour ce jeton.",
    errNothingRemaining: "Il ne reste rien à racheter dans cette masse.",
    errAmountTooSmall:
      "Le montant rendu ne couvrirait pas les frais. Aucun rachat n'est possible.",
    errAmountExceedsMass: (requested: string, remaining: string) =>
      `Le montant ${requested} dépasse ce qui reste dans la masse : ${remaining}.`,
    errRateUnavailable: (symbol: string) =>
      `Aucun taux n'est disponible pour ${symbol} pour le moment. Réessayez plus tard.`,
    errTttiBalance: (balance: string, required: string) =>
      `Le solde TTTI-T est de ${balance} ; ${required} sont nécessaires.`,
    errAllowance: (allowance: string, required: string) =>
      `L'approbation TTTI-T est de ${allowance} ; ${required} sont nécessaires.`,
    errSlippage:
      "Le montant reçu serait inférieur à l'aperçu. Actualisez l'aperçu et réessayez.",
    errRedemptionInProgress: "Un rachat est déjà en cours.",
    errMintNotEnded: "L'excédent peut être retiré à la fin du mint.",
    errNoExcess: "Il n'y a aucun excédent à retirer.",
    errPullFailed: (detail: string) =>
      `Les TTTI-T n'ont pas pu être prélevés : ${detail}`,
    errCallFailed: (detail: string) => `La demande a échoué : ${detail}`,
    errInvalidAmount: "Saisissez un montant valide.",
    percentShare: "Part du montant rachetable",
    percentComputedOn:
      "Calculé sur le montant rachetable : le plus bas entre la masse restante et les TTTI-T détenus.",
    balanceNone: "Aucun TTTI-T n'est disponible à rendre dans ce wallet.",
    heldLabel: "TTTI-T détenus",
    limitedByBalance: (held: string, max: string) =>
      `Les TTTI-T détenus (${held}) limitent le montant à ${max}.`,
    confirmTitle: "Confirmer le rachat",
    confirmIntro:
      "Vous signez une approbation ICRC-2 de TTTI-T pour le contrat, puis le contrat prélève les TTTI-T et verse le montant net.",
    confirmExpiry: "L'approbation expire dans 15 minutes.",
    closeButton: "Fermer",
    cancelButton: "Annuler",
    resultTitle: "Résultat",
  },
  es: {
    title: "Mi garantía",
    intro:
      "Cada mint crea una masa personal: los TTTI-T acuñados y la garantía depositada con ellos, en el token pagado. La masa pertenece a la persona que hizo el mint. Cualquier TTTI-T que se tenga puede devolverse contra ella.",
    signInPrompt: "Inicia sesión para ver tu garantía.",
    loading: "Cargando tu garantía…",
    loadError: "No se pudo cargar tu garantía.",
    retryButton: "Reintentar",
    emptyTitle: "Aún no hay garantía",
    emptyBody:
      "Una garantía aparece aquí después de un mint. Se conserva en el token pagado.",
    massHeading: (symbol: string) => `Masa ${symbol}`,
    remainingTtti: "TTTI-T restantes",
    totalTtti: "TTTI-T acuñados",
    remainingGuarantee: "Garantía restante",
    totalGuarantee: "Garantía depositada",
    excessLabel: "Excedente de la garantía",
    valueLabel: "Valor de la garantía",
    valueUnavailable: "No disponible: no hay tasa en este momento.",
    unclaimedTitle: "Masa no reclamada",
    unclaimedIntro:
      "Total público de las masas que no se han canjeado. Las masas individuales son privadas.",
    unclaimedCount: (count: string) => `Masas con TTTI-T restantes: ${count}`,
    unclaimedTtti: "TTTI-T restantes",
    unclaimedGuarantee: "Garantía restante",
    unclaimedMintOngoing: "El mint está en curso.",
    unclaimedMintEnded: "El mint ha terminado.",
    // Public guarantee accounts
    accountsTitle: "Cuentas de garantía",
    accountsIntro:
      "Para cada token, la suma de todas las masas se compara con el saldo de la cuenta de garantía dedicada en la custodia común.",
    accountsLoadError: "No se pudieron cargar las cuentas de garantía.",
    accountsMassTotal: "Suma de todas las masas",
    accountsBalance: "Saldo de la cuenta de garantía",
    accountsEqual: "Igual",
    accountsMismatch: "Diferencia",
    accountsBalanceBelow: (difference: string) =>
      `La cuenta contiene ${difference} menos que la suma de las masas.`,
    accountsBalanceAbove: (difference: string) =>
      `La cuenta contiene ${difference} más que la suma de las masas.`,
    redeemTitle: "Canjear",
    redeemIntro:
      "Devuelve TTTI-T contra la masa de un token. La vista previa muestra el importe devuelto antes de firmar nada.",
    amountLabel: "TTTI-T a devolver",
    amountPlaceholder: "0,0",
    maxButton: "Máx.",
    amountInvalid: "Introduce un importe mayor que cero.",
    redeemButton: "Canjear",
    redeemingButton: "Canjeando…",
    previewTitle: "Vista previa",
    previewLoading: "Calculando…",
    previewDeposited: "Garantía depositada para este importe",
    previewDayRate: "Cantidad que vale 10 000 USD por TTTI-T",
    previewReturned: "Importe devuelto",
    previewExcessKept: "Se conserva en la garantía como excedente",
    previewFee: "Comisión de canje",
    previewThirdPartyFee: "Comisión del ledger (terceros)",
    previewNet: "Recibes",
    previewRule: "Regla aplicada",
    previewUsdNote: "Los valores en USD usan la tasa de esta vista previa.",
    previewFeeNote: (percent: string) =>
      `Se deduce una comisión del ${percent} del importe devuelto y después la comisión del ledger del token pagado.`,
    returnedTttiNote:
      "Los TTTI-T devueltos quedan en poder del contrato. No se quema nada.",
    ruleDeposited: "Garantía depositada",
    ruleDayRate: "Cantidad que vale 10 000 USD por TTTI-T",
    ruleProRata: "Prorrata de la masa",
    explainTitle: "Cómo se fija el importe devuelto",
    explainLowerOfTwo:
      "Durante el mint, devolver x TTTI-T devuelve la menor de dos cantidades: la garantía depositada para x y la cantidad que vale 10 000 USD × x a la tasa del momento. La diferencia queda en la garantía como excedente y su propietario puede retirarla cuando termine el mint.",
    explainLowerOfTwoDetail: (
      deposited: string,
      depositedUsd: string,
      dayRate: string,
      dayRateUsd: string,
      returned: string,
    ) =>
      `Garantía depositada: ${deposited} (${depositedUsd}). Cantidad que vale 10 000 USD por TTTI-T: ${dayRate} (${dayRateUsd}). Importe devuelto, el menor de los dos: ${returned}.`,
    explainProRata:
      "Después del mint, el importe devuelto es la parte proporcional de la masa, en especie. La masa se divide en proporción a los TTTI-T devueltos.",
    explainProRataExample:
      "Ejemplo: una masa de 1 TTTI-T contiene 0,001 ckBTC. Devolver 0,5 TTTI-T devuelve 0,0005 ckBTC, antes de la comisión de canje y la del ledger.",
    explainAccount:
      "Cada token tiene una cuenta interna dedicada en la custodia común. El mint y las subastas la acreditan. Una recompra debita únicamente esa cuenta.",
    allowanceTitle: "Aprobación de TTTI-T",
    allowanceExplain: (amount: string, fee: string, required: string) =>
      `Devolver TTTI-T requiere una aprobación ICRC-2 por el importe devuelto más la comisión del ledger de TTTI-T: ${amount} + ${fee} = ${required}.`,
    allowanceCurrent: (allowance: string) => `Aprobación actual: ${allowance}`,
    allowanceOk: "La aprobación actual cubre este canje.",
    allowanceMissing:
      "La aprobación actual no basta. Aprueba el importe antes de canjear.",
    approveButton: "Aprobar",
    approvingButton: "Aprobando…",
    allowanceExpiryNote:
      "Una aprobación siempre tiene fecha de vencimiento. Comprueba el importe y la fecha en la wallet antes de confirmar.",
    excessTitle: "Retirada del excedente",
    excessExplain:
      "El excedente es la parte de la garantía que se conserva cuando se aplicó la regla de la menor de dos cantidades. Su propietario puede retirarlo cuando termine el mint.",
    excessBeforeEnd: "Disponible cuando termine el mint.",
    excessNone: "No hay excedente que retirar.",
    withdrawButton: "Retirar excedente",
    withdrawingButton: "Retirando…",
    historyTitle: "Mis canjes",
    historyEmpty: "Aún no hay canjes.",
    kindRedeem: "Canje",
    kindExcessWithdrawal: "Retirada de excedente",
    statusCompleted: "Completado",
    statusInProgress: "En curso",
    statusNeedsReview: "Por revisar",
    statusFailed: "Fallido",
    historyReturned: "TTTI-T devueltos",
    historyNet: "Recibido",
    historyPullBlock: "Bloque TTTI-T",
    historyPayoutBlock: "Bloque del pago",
    resultCompleted: (net: string) => `Completado. Has recibido ${net}.`,
    resultInProgress:
      "El pago está en curso. Aparece en la lista de abajo cuando se complete.",
    resultNeedsReview:
      "El pago necesita una revisión. Permanece en la lista de abajo con su estado.",
    resultFailed: "El pago no se completó.",
    errAnonymous: "Inicia sesión para usar tu garantía.",
    errSalesPaused: "Los canjes están en pausa.",
    errMassNotFound: "No existe ninguna masa para este token.",
    errNothingRemaining: "No queda nada por canjear en esta masa.",
    errAmountTooSmall:
      "El importe devuelto no cubriría las comisiones. No es posible el canje.",
    errAmountExceedsMass: (requested: string, remaining: string) =>
      `El importe ${requested} supera lo que queda en la masa: ${remaining}.`,
    errRateUnavailable: (symbol: string) =>
      `No hay tasa disponible para ${symbol} en este momento. Inténtalo más tarde.`,
    errTttiBalance: (balance: string, required: string) =>
      `El saldo de TTTI-T es ${balance}; se necesitan ${required}.`,
    errAllowance: (allowance: string, required: string) =>
      `La aprobación de TTTI-T es ${allowance}; se necesitan ${required}.`,
    errSlippage:
      "El importe recibido sería menor que el de la vista previa. Actualiza la vista previa e inténtalo de nuevo.",
    errRedemptionInProgress: "Ya hay un canje en curso.",
    errMintNotEnded: "El excedente puede retirarse cuando termine el mint.",
    errNoExcess: "No hay excedente que retirar.",
    errPullFailed: (detail: string) =>
      `No se pudieron cobrar los TTTI-T: ${detail}`,
    errCallFailed: (detail: string) => `La solicitud falló: ${detail}`,
    errInvalidAmount: "Introduce un importe válido.",
    percentShare: "Parte del importe canjeable",
    percentComputedOn:
      "Calculado sobre el importe canjeable: el menor entre la masa restante y los TTTI-T en poder.",
    balanceNone: "No hay TTTI-T disponibles para devolver en este wallet.",
    heldLabel: "TTTI-T en poder",
    limitedByBalance: (held: string, max: string) =>
      `Los TTTI-T en poder (${held}) limitan el importe a ${max}.`,
    confirmTitle: "Confirmar el canje",
    confirmIntro:
      "Firmas una aprobación ICRC-2 de TTTI-T para el contrato; después el contrato cobra los TTTI-T y paga el importe neto.",
    confirmExpiry: "La aprobación caduca en 15 minutos.",
    closeButton: "Cerrar",
    cancelButton: "Cancelar",
    resultTitle: "Resultado",
  },
  "zh-Hans": {
    title: "我的担保",
    intro:
      "每次铸造都会生成一个个人池：已铸造的 TTTI-T 以及随之存入的担保，以所付代币计。该池属于铸造者本人。持有的任何 TTTI-T 都可以对照该池退还。",
    signInPrompt: "请登录以查看您的担保。",
    loading: "正在加载您的担保…",
    loadError: "无法加载您的担保。",
    retryButton: "重试",
    emptyTitle: "暂无担保",
    emptyBody: "铸造后，担保会显示在此处，并以所付代币保存。",
    massHeading: (symbol: string) => `${symbol} 个人池`,
    remainingTtti: "剩余 TTTI-T",
    totalTtti: "已铸造 TTTI-T",
    remainingGuarantee: "剩余担保",
    totalGuarantee: "已存入担保",
    excessLabel: "担保中的超额部分",
    valueLabel: "担保价值",
    valueUnavailable: "不可用：当前没有汇率。",
    unclaimedTitle: "未领取的池",
    unclaimedIntro: "尚未赎回的池的公开总数。各个池的明细为私有。",
    unclaimedCount: (count: string) => `仍有剩余 TTTI-T 的池：${count}`,
    unclaimedTtti: "剩余 TTTI-T",
    unclaimedGuarantee: "剩余担保",
    unclaimedMintOngoing: "铸造进行中。",
    unclaimedMintEnded: "铸造已结束。",
    // Public guarantee accounts
    accountsTitle: "担保账户",
    accountsIntro:
      "对每种代币，将所有池的总和与共同托管中专用担保账户的余额进行比较。",
    accountsLoadError: "无法加载担保账户。",
    accountsMassTotal: "所有池的总和",
    accountsBalance: "担保账户余额",
    accountsEqual: "相等",
    accountsMismatch: "不一致",
    accountsBalanceBelow: (difference: string) =>
      `账户余额比各池总和少 ${difference}。`,
    accountsBalanceAbove: (difference: string) =>
      `账户余额比各池总和多 ${difference}。`,
    redeemTitle: "赎回",
    redeemIntro: "对照某一代币的池退还 TTTI-T。签名前，预览会显示退还金额。",
    amountLabel: "退还的 TTTI-T",
    amountPlaceholder: "0.0",
    maxButton: "最大",
    amountInvalid: "请输入大于零的金额。",
    redeemButton: "赎回",
    redeemingButton: "正在赎回…",
    previewTitle: "预览",
    previewLoading: "正在计算…",
    previewDeposited: "该金额对应的已存入担保",
    previewDayRate: "每个 TTTI-T 价值 10,000 USD 的数量",
    previewReturned: "退还金额",
    previewExcessKept: "作为超额部分保留在担保中",
    previewFee: "赎回费用",
    previewThirdPartyFee: "账本费用（第三方）",
    previewNet: "您将收到",
    previewRule: "适用规则",
    previewUsdNote: "USD 数值采用本次预览的汇率。",
    previewFeeNote: (percent: string) =>
      `先扣除退还金额的 ${percent} 作为费用，再扣除所付代币的账本费用。`,
    returnedTttiNote: "退还的 TTTI-T 由合约持有，不会被销毁。",
    ruleDeposited: "已存入担保",
    ruleDayRate: "每个 TTTI-T 价值 10,000 USD 的数量",
    ruleProRata: "按池的比例",
    explainTitle: "退还金额如何确定",
    explainLowerOfTwo:
      "铸造期间，退还 x 个 TTTI-T 时，退还以下两个数量中较低者：为 x 存入的担保，以及按当前汇率价值 10,000 USD × x 的数量。差额作为超额部分留在担保中，铸造结束后其所有者可以提取。",
    explainLowerOfTwoDetail: (
      deposited: string,
      depositedUsd: string,
      dayRate: string,
      dayRateUsd: string,
      returned: string,
    ) =>
      `已存入担保：${deposited}（${depositedUsd}）。每个 TTTI-T 价值 10,000 USD 的数量：${dayRate}（${dayRateUsd}）。退还金额，取两者较低者：${returned}。`,
    explainProRata:
      "铸造结束后，退还金额为该池按比例的份额，以实物形式退还。池按所退还的 TTTI-T 比例分配。",
    explainProRataExample:
      "示例：1 TTTI-T 的池持有 0.001 ckBTC。退还 0.5 TTTI-T 将退还 0.0005 ckBTC，未计赎回费用和账本费用。",
    explainAccount:
      "每种代币在共同托管中有一个专用的内部账户。铸造和拍卖会向该账户记入。回购只从该账户扣除。",
    allowanceTitle: "TTTI-T 授权",
    allowanceExplain: (amount: string, fee: string, required: string) =>
      `退还 TTTI-T 需要一次 ICRC-2 授权，金额为退还数量加上 TTTI-T 账本费用：${amount} + ${fee} = ${required}。`,
    allowanceCurrent: (allowance: string) => `当前授权：${allowance}`,
    allowanceOk: "当前授权足以覆盖本次赎回。",
    allowanceMissing: "当前授权不足。赎回前请先授权相应金额。",
    approveButton: "授权",
    approvingButton: "正在授权…",
    allowanceExpiryNote:
      "授权始终有到期时间。确认前，请在钱包中核对金额和日期。",
    excessTitle: "提取超额部分",
    excessExplain:
      "超额部分是适用“两者取低”规则时保留在担保中的部分。铸造结束后，其所有者可以提取。",
    excessBeforeEnd: "铸造结束后可用。",
    excessNone: "没有可提取的超额部分。",
    withdrawButton: "提取超额部分",
    withdrawingButton: "正在提取…",
    historyTitle: "我的赎回",
    historyEmpty: "暂无赎回记录。",
    kindRedeem: "赎回",
    kindExcessWithdrawal: "提取超额部分",
    statusCompleted: "已完成",
    statusInProgress: "进行中",
    statusNeedsReview: "待核查",
    statusFailed: "失败",
    historyReturned: "已退还 TTTI-T",
    historyNet: "已收到",
    historyPullBlock: "TTTI-T 区块",
    historyPayoutBlock: "支付区块",
    resultCompleted: (net: string) => `已完成。您收到了 ${net}。`,
    resultInProgress: "支付进行中。完成后会显示在下方列表中。",
    resultNeedsReview: "该支付需要核查。它会连同状态一起保留在下方列表中。",
    resultFailed: "支付未完成。",
    errAnonymous: "请登录以使用您的担保。",
    errSalesPaused: "赎回已暂停。",
    errMassNotFound: "该代币没有对应的池。",
    errNothingRemaining: "该池没有可赎回的剩余部分。",
    errAmountTooSmall: "退还金额不足以支付费用，无法赎回。",
    errAmountExceedsMass: (requested: string, remaining: string) =>
      `金额 ${requested} 超过池中剩余部分：${remaining}。`,
    errRateUnavailable: (symbol: string) =>
      `当前没有 ${symbol} 的汇率。请稍后再试。`,
    errTttiBalance: (balance: string, required: string) =>
      `TTTI-T 余额为 ${balance}；需要 ${required}。`,
    errAllowance: (allowance: string, required: string) =>
      `TTTI-T 授权为 ${allowance}；需要 ${required}。`,
    errSlippage: "实际收到的金额将低于预览。请刷新预览后重试。",
    errRedemptionInProgress: "已有一笔赎回正在进行。",
    errMintNotEnded: "铸造结束后才能提取超额部分。",
    errNoExcess: "没有可提取的超额部分。",
    errPullFailed: (detail: string) => `无法收取 TTTI-T：${detail}`,
    errCallFailed: (detail: string) => `请求失败：${detail}`,
    errInvalidAmount: "请输入有效金额。",
    percentShare: "可赎回金额的比例",
    percentComputedOn: "按可赎回金额计算：剩余质量与持有的 TTTI-T 中较小者。",
    balanceNone: "此钱包没有可退还的 TTTI-T。",
    heldLabel: "持有的 TTTI-T",
    limitedByBalance: (held: string, max: string) =>
      `持有的 TTTI-T（${held}）将金额限制为 ${max}。`,
    confirmTitle: "确认赎回",
    confirmIntro:
      "您为合约签署 TTTI-T 的 ICRC-2 授权，随后合约收取 TTTI-T 并支付净额。",
    confirmExpiry: "该授权将在 15 分钟后到期。",
    closeButton: "关闭",
    cancelButton: "取消",
    resultTitle: "结果",
  },
  "pt-BR": {
    title: "Minha garantia",
    intro:
      "Cada mint cria uma massa pessoal: os TTTI-T cunhados e a garantia depositada com eles, no token pago. A massa pertence a quem fez o mint. Qualquer TTTI-T mantido pode ser devolvido contra ela.",
    signInPrompt: "Entre para ver sua garantia.",
    loading: "Carregando sua garantia…",
    loadError: "Não foi possível carregar sua garantia.",
    retryButton: "Tentar novamente",
    emptyTitle: "Ainda não há garantia",
    emptyBody:
      "Uma garantia aparece aqui após um mint. Ela é mantida no token pago.",
    massHeading: (symbol: string) => `Massa ${symbol}`,
    remainingTtti: "TTTI-T restantes",
    totalTtti: "TTTI-T cunhados",
    remainingGuarantee: "Garantia restante",
    totalGuarantee: "Garantia depositada",
    excessLabel: "Excedente da garantia",
    valueLabel: "Valor da garantia",
    valueUnavailable: "Indisponível: não há taxa no momento.",
    unclaimedTitle: "Massa não reclamada",
    unclaimedIntro:
      "Total público das massas que não foram resgatadas. As massas individuais são privadas.",
    unclaimedCount: (count: string) => `Massas com TTTI-T restantes: ${count}`,
    unclaimedTtti: "TTTI-T restantes",
    unclaimedGuarantee: "Garantia restante",
    unclaimedMintOngoing: "O mint está em andamento.",
    unclaimedMintEnded: "O mint terminou.",
    // Public guarantee accounts
    accountsTitle: "Contas de garantia",
    accountsIntro:
      "Para cada token, a soma de todas as massas é comparada com o saldo da conta de garantia dedicada na custódia comum.",
    accountsLoadError: "Não foi possível carregar as contas de garantia.",
    accountsMassTotal: "Soma de todas as massas",
    accountsBalance: "Saldo da conta de garantia",
    accountsEqual: "Igual",
    accountsMismatch: "Divergência",
    accountsBalanceBelow: (difference: string) =>
      `A conta contém ${difference} a menos do que a soma das massas.`,
    accountsBalanceAbove: (difference: string) =>
      `A conta contém ${difference} a mais do que a soma das massas.`,
    redeemTitle: "Resgatar",
    redeemIntro:
      "Devolva TTTI-T contra a massa de um token. A prévia mostra o valor devolvido antes de qualquer assinatura.",
    amountLabel: "TTTI-T a devolver",
    amountPlaceholder: "0,0",
    maxButton: "Máx.",
    amountInvalid: "Informe um valor maior que zero.",
    redeemButton: "Resgatar",
    redeemingButton: "Resgatando…",
    previewTitle: "Prévia",
    previewLoading: "Calculando…",
    previewDeposited: "Garantia depositada para este valor",
    previewDayRate: "Quantidade equivalente a 10.000 USD por TTTI-T",
    previewReturned: "Valor devolvido",
    previewExcessKept: "Mantido na garantia como excedente",
    previewFee: "Taxa de resgate",
    previewThirdPartyFee: "Taxa do ledger (terceiros)",
    previewNet: "Você recebe",
    previewRule: "Regra aplicada",
    previewUsdNote: "Os valores em USD usam a taxa desta prévia.",
    previewFeeNote: (percent: string) =>
      `Uma taxa de ${percent} do valor devolvido é deduzida, depois a taxa do ledger do token pago.`,
    returnedTttiNote:
      "Os TTTI-T devolvidos ficam com o contrato. Nada é queimado.",
    ruleDeposited: "Garantia depositada",
    ruleDayRate: "Quantidade equivalente a 10.000 USD por TTTI-T",
    ruleProRata: "Proporcional à massa",
    explainTitle: "Como o valor devolvido é definido",
    explainLowerOfTwo:
      "Durante o mint, devolver x TTTI-T devolve a menor de duas quantidades: a garantia depositada para x e a quantidade equivalente a 10.000 USD × x na taxa do momento. A diferença permanece na garantia como excedente, e seu proprietário pode retirá-la quando o mint terminar.",
    explainLowerOfTwoDetail: (
      deposited: string,
      depositedUsd: string,
      dayRate: string,
      dayRateUsd: string,
      returned: string,
    ) =>
      `Garantia depositada: ${deposited} (${depositedUsd}). Quantidade equivalente a 10.000 USD por TTTI-T: ${dayRate} (${dayRateUsd}). Valor devolvido, o menor dos dois: ${returned}.`,
    explainProRata:
      "Após o mint, o valor devolvido é a parcela proporcional da massa, em espécie. A massa é dividida em proporção aos TTTI-T devolvidos.",
    explainProRataExample:
      "Exemplo: uma massa de 1 TTTI-T contém 0,001 ckBTC. Devolver 0,5 TTTI-T devolve 0,0005 ckBTC, antes da taxa de resgate e da taxa do ledger.",
    explainAccount:
      "Cada token tem uma conta interna dedicada na custódia comum. O mint e os leilões a creditam. Uma recompra debita apenas essa conta.",
    allowanceTitle: "Aprovação de TTTI-T",
    allowanceExplain: (amount: string, fee: string, required: string) =>
      `Devolver TTTI-T exige uma aprovação ICRC-2 do valor devolvido mais a taxa do ledger de TTTI-T: ${amount} + ${fee} = ${required}.`,
    allowanceCurrent: (allowance: string) => `Aprovação atual: ${allowance}`,
    allowanceOk: "A aprovação atual cobre este resgate.",
    allowanceMissing:
      "A aprovação atual não é suficiente. Aprove o valor antes de resgatar.",
    approveButton: "Aprovar",
    approvingButton: "Aprovando…",
    allowanceExpiryNote:
      "Uma aprovação sempre tem data de expiração. Confira o valor e a data na carteira antes de confirmar.",
    excessTitle: "Retirada do excedente",
    excessExplain:
      "O excedente é a parte da garantia mantida quando a regra do menor dos dois valores foi aplicada. Seu proprietário pode retirá-lo quando o mint terminar.",
    excessBeforeEnd: "Disponível quando o mint terminar.",
    excessNone: "Não há excedente para retirar.",
    withdrawButton: "Retirar excedente",
    withdrawingButton: "Retirando…",
    historyTitle: "Meus resgates",
    historyEmpty: "Ainda não há resgates.",
    kindRedeem: "Resgate",
    kindExcessWithdrawal: "Retirada de excedente",
    statusCompleted: "Concluído",
    statusInProgress: "Em andamento",
    statusNeedsReview: "A verificar",
    statusFailed: "Falhou",
    historyReturned: "TTTI-T devolvidos",
    historyNet: "Recebido",
    historyPullBlock: "Bloco TTTI-T",
    historyPayoutBlock: "Bloco do pagamento",
    resultCompleted: (net: string) => `Concluído. Você recebeu ${net}.`,
    resultInProgress:
      "O pagamento está em andamento. Ele aparece na lista abaixo quando for concluído.",
    resultNeedsReview:
      "O pagamento precisa de verificação. Ele permanece na lista abaixo com seu status.",
    resultFailed: "O pagamento não foi concluído.",
    errAnonymous: "Entre para usar sua garantia.",
    errSalesPaused: "Os resgates estão em pausa.",
    errMassNotFound: "Não existe massa para este token.",
    errNothingRemaining: "Não resta nada a resgatar nesta massa.",
    errAmountTooSmall:
      "O valor devolvido não cobriria as taxas. Nenhum resgate é possível.",
    errAmountExceedsMass: (requested: string, remaining: string) =>
      `O valor ${requested} excede o que resta na massa: ${remaining}.`,
    errRateUnavailable: (symbol: string) =>
      `Não há taxa disponível para ${symbol} no momento. Tente novamente mais tarde.`,
    errTttiBalance: (balance: string, required: string) =>
      `O saldo de TTTI-T é ${balance}; são necessários ${required}.`,
    errAllowance: (allowance: string, required: string) =>
      `A aprovação de TTTI-T é ${allowance}; são necessários ${required}.`,
    errSlippage:
      "O valor recebido seria menor que o da prévia. Atualize a prévia e tente novamente.",
    errRedemptionInProgress: "Já há um resgate em andamento.",
    errMintNotEnded: "O excedente pode ser retirado quando o mint terminar.",
    errNoExcess: "Não há excedente para retirar.",
    errPullFailed: (detail: string) =>
      `Não foi possível cobrar os TTTI-T: ${detail}`,
    errCallFailed: (detail: string) => `A solicitação falhou: ${detail}`,
    errInvalidAmount: "Informe um valor válido.",
    percentShare: "Parte do valor resgatável",
    percentComputedOn:
      "Calculado sobre o valor resgatável: o menor entre a massa restante e os TTTI-T mantidos.",
    balanceNone: "Não há TTTI-T disponíveis para devolver nesta carteira.",
    heldLabel: "TTTI-T mantidos",
    limitedByBalance: (held: string, max: string) =>
      `Os TTTI-T mantidos (${held}) limitam o valor a ${max}.`,
    confirmTitle: "Confirmar o resgate",
    confirmIntro:
      "Você assina uma aprovação ICRC-2 de TTTI-T para o contrato; depois o contrato recolhe os TTTI-T e paga o valor líquido.",
    confirmExpiry: "A aprovação expira em 15 minutos.",
    closeButton: "Fechar",
    cancelButton: "Cancelar",
    resultTitle: "Resultado",
  },
  ko: {
    title: "내 보증금",
    intro:
      "민트할 때마다 개인 풀이 만들어집니다. 발행된 TTTI-T와 함께 예치된 보증금이 지불한 토큰으로 기록됩니다. 이 풀은 민트한 사람의 것입니다. 보유한 모든 TTTI-T는 이 풀을 상대로 반환할 수 있습니다.",
    signInPrompt: "보증금을 보려면 로그인하세요.",
    loading: "보증금을 불러오는 중…",
    loadError: "보증금을 불러오지 못했습니다.",
    retryButton: "다시 시도",
    emptyTitle: "아직 보증금이 없습니다",
    emptyBody:
      "민트 후 보증금이 여기에 표시됩니다. 보증금은 지불한 토큰으로 보관됩니다.",
    massHeading: (symbol: string) => `${symbol} 개인 풀`,
    remainingTtti: "잔여 TTTI-T",
    totalTtti: "발행된 TTTI-T",
    remainingGuarantee: "잔여 보증금",
    totalGuarantee: "예치된 보증금",
    excessLabel: "보증금의 초과분",
    valueLabel: "보증금 가치",
    valueUnavailable: "사용할 수 없음: 현재 환율이 없습니다.",
    unclaimedTitle: "미청구 풀",
    unclaimedIntro:
      "상환되지 않은 풀의 공개 합계입니다. 개별 풀은 비공개입니다.",
    unclaimedCount: (count: string) => `TTTI-T가 남아 있는 풀: ${count}`,
    unclaimedTtti: "잔여 TTTI-T",
    unclaimedGuarantee: "잔여 보증금",
    unclaimedMintOngoing: "민트가 진행 중입니다.",
    unclaimedMintEnded: "민트가 종료되었습니다.",
    // Public guarantee accounts
    accountsTitle: "보증 계정",
    accountsIntro:
      "각 토큰에 대해 모든 풀의 합계를 공동 보관소의 전용 보증 계정 잔액과 비교합니다.",
    accountsLoadError: "보증 계정을 불러올 수 없습니다.",
    accountsMassTotal: "모든 풀의 합계",
    accountsBalance: "보증 계정 잔액",
    accountsEqual: "일치",
    accountsMismatch: "불일치",
    accountsBalanceBelow: (difference: string) =>
      `계정 잔액이 풀 합계보다 ${difference} 적습니다.`,
    accountsBalanceAbove: (difference: string) =>
      `계정 잔액이 풀 합계보다 ${difference} 많습니다.`,
    redeemTitle: "상환",
    redeemIntro:
      "한 토큰의 풀을 상대로 TTTI-T를 반환합니다. 서명하기 전에 미리보기에서 반환 금액을 확인할 수 있습니다.",
    amountLabel: "반환할 TTTI-T",
    amountPlaceholder: "0.0",
    maxButton: "최대",
    amountInvalid: "0보다 큰 금액을 입력하세요.",
    redeemButton: "상환",
    redeemingButton: "상환 중…",
    previewTitle: "미리보기",
    previewLoading: "계산 중…",
    previewDeposited: "이 금액에 해당하는 예치 보증금",
    previewDayRate: "TTTI-T당 10,000 USD에 해당하는 수량",
    previewReturned: "반환 금액",
    previewExcessKept: "초과분으로 보증금에 남는 금액",
    previewFee: "상환 수수료",
    previewThirdPartyFee: "원장 수수료(제3자)",
    previewNet: "수령액",
    previewRule: "적용된 규칙",
    previewUsdNote: "USD 값은 이 미리보기의 환율을 사용합니다.",
    previewFeeNote: (percent: string) =>
      `반환 금액의 ${percent} 수수료가 차감되고, 이어서 지불한 토큰의 원장 수수료가 차감됩니다.`,
    returnedTttiNote:
      "반환된 TTTI-T는 컨트랙트가 보관합니다. 소각되지 않습니다.",
    ruleDeposited: "예치된 보증금",
    ruleDayRate: "TTTI-T당 10,000 USD에 해당하는 수량",
    ruleProRata: "풀 기준 비례",
    explainTitle: "반환 금액이 정해지는 방식",
    explainLowerOfTwo:
      "민트 기간 중 x개의 TTTI-T를 반환하면 두 수량 중 낮은 쪽이 반환됩니다. x에 대해 예치된 보증금과, 현재 환율로 10,000 USD × x에 해당하는 수량입니다. 차이는 초과분으로 보증금에 남으며, 민트가 종료되면 소유자가 인출할 수 있습니다.",
    explainLowerOfTwoDetail: (
      deposited: string,
      depositedUsd: string,
      dayRate: string,
      dayRateUsd: string,
      returned: string,
    ) =>
      `예치된 보증금: ${deposited} (${depositedUsd}). TTTI-T당 10,000 USD에 해당하는 수량: ${dayRate} (${dayRateUsd}). 반환 금액(둘 중 낮은 쪽): ${returned}.`,
    explainProRata:
      "민트가 종료된 후 반환 금액은 풀의 비례 지분이며 현물로 지급됩니다. 풀은 반환된 TTTI-T 비율에 따라 나뉩니다.",
    explainProRataExample:
      "예: 1 TTTI-T 풀에 0.001 ckBTC가 있습니다. 0.5 TTTI-T를 반환하면 상환 수수료와 원장 수수료를 제외하기 전 0.0005 ckBTC가 반환됩니다.",
    explainAccount:
      "각 토큰은 공동 보관소에 전용 내부 계정을 하나씩 가지고 있습니다. 민트와 경매가 이 계정에 입금합니다. 바이백은 이 계정에서만 차감합니다.",
    allowanceTitle: "TTTI-T 승인",
    allowanceExplain: (amount: string, fee: string, required: string) =>
      `TTTI-T를 반환하려면 반환 수량에 TTTI-T 원장 수수료를 더한 금액에 대한 ICRC-2 승인이 필요합니다: ${amount} + ${fee} = ${required}.`,
    allowanceCurrent: (allowance: string) => `현재 승인: ${allowance}`,
    allowanceOk: "현재 승인으로 이 상환을 처리할 수 있습니다.",
    allowanceMissing:
      "현재 승인이 부족합니다. 상환하기 전에 금액을 승인하세요.",
    approveButton: "승인",
    approvingButton: "승인 중…",
    allowanceExpiryNote:
      "승인에는 항상 만료 시점이 있습니다. 확인하기 전에 지갑에서 금액과 날짜를 확인하세요.",
    excessTitle: "초과분 인출",
    excessExplain:
      "초과분은 두 값 중 낮은 쪽 규칙이 적용될 때 보증금에 남는 부분입니다. 민트가 종료되면 소유자가 인출할 수 있습니다.",
    excessBeforeEnd: "민트가 종료되면 사용할 수 있습니다.",
    excessNone: "인출할 초과분이 없습니다.",
    withdrawButton: "초과분 인출",
    withdrawingButton: "인출 중…",
    historyTitle: "내 상환 내역",
    historyEmpty: "아직 상환 내역이 없습니다.",
    kindRedeem: "상환",
    kindExcessWithdrawal: "초과분 인출",
    statusCompleted: "완료",
    statusInProgress: "진행 중",
    statusNeedsReview: "확인 필요",
    statusFailed: "실패",
    historyReturned: "반환된 TTTI-T",
    historyNet: "수령액",
    historyPullBlock: "TTTI-T 블록",
    historyPayoutBlock: "지급 블록",
    resultCompleted: (net: string) =>
      `완료되었습니다. ${net}을(를) 받았습니다.`,
    resultInProgress: "지급이 진행 중입니다. 완료되면 아래 목록에 표시됩니다.",
    resultNeedsReview:
      "지급 확인이 필요합니다. 상태와 함께 아래 목록에 남아 있습니다.",
    resultFailed: "지급이 완료되지 않았습니다.",
    errAnonymous: "보증금을 사용하려면 로그인하세요.",
    errSalesPaused: "상환이 일시 중지되었습니다.",
    errMassNotFound: "이 토큰의 풀이 없습니다.",
    errNothingRemaining: "이 풀에는 상환할 잔여분이 없습니다.",
    errAmountTooSmall:
      "반환 금액이 수수료를 충당하지 못합니다. 상환할 수 없습니다.",
    errAmountExceedsMass: (requested: string, remaining: string) =>
      `금액 ${requested}이(가) 풀의 잔여분 ${remaining}을(를) 초과합니다.`,
    errRateUnavailable: (symbol: string) =>
      `현재 ${symbol}의 환율을 사용할 수 없습니다. 나중에 다시 시도하세요.`,
    errTttiBalance: (balance: string, required: string) =>
      `TTTI-T 잔액은 ${balance}이며 ${required}이(가) 필요합니다.`,
    errAllowance: (allowance: string, required: string) =>
      `TTTI-T 승인은 ${allowance}이며 ${required}이(가) 필요합니다.`,
    errSlippage:
      "수령액이 미리보기보다 낮아집니다. 미리보기를 새로 고친 후 다시 시도하세요.",
    errRedemptionInProgress: "이미 진행 중인 상환이 있습니다.",
    errMintNotEnded: "초과분은 민트가 종료되면 인출할 수 있습니다.",
    errNoExcess: "인출할 초과분이 없습니다.",
    errPullFailed: (detail: string) =>
      `TTTI-T를 수령하지 못했습니다: ${detail}`,
    errCallFailed: (detail: string) => `요청에 실패했습니다: ${detail}`,
    errInvalidAmount: "올바른 금액을 입력하세요.",
    percentShare: "상환 가능 금액의 비율",
    percentComputedOn:
      "상환 가능 금액 기준: 남은 질량과 보유한 TTTI-T 중 더 작은 값.",
    balanceNone: "이 지갑에는 반환할 수 있는 TTTI-T가 없습니다.",
    heldLabel: "보유한 TTTI-T",
    limitedByBalance: (held: string, max: string) =>
      `보유한 TTTI-T(${held})로 인해 금액이 ${max}(으)로 제한됩니다.`,
    confirmTitle: "상환 확인",
    confirmIntro:
      "컨트랙트에 대한 TTTI-T ICRC-2 승인에 서명하면, 컨트랙트가 TTTI-T를 가져가고 순액을 지급합니다.",
    confirmExpiry: "승인은 15분 후에 만료됩니다.",
    closeButton: "닫기",
    cancelButton: "취소",
    resultTitle: "결과",
  },
  "pa-Guru": {
    title: "ਮੇਰੀ ਗਾਰੰਟੀ",
    intro:
      "ਹਰ ਮਿੰਟ ਇੱਕ ਨਿੱਜੀ ਸਮੂਹ ਬਣਾਉਂਦਾ ਹੈ: ਮਿੰਟ ਕੀਤੇ TTTI-T ਅਤੇ ਉਨ੍ਹਾਂ ਨਾਲ ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਾਰੰਟੀ, ਅਦਾ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ। ਇਹ ਸਮੂਹ ਮਿੰਟ ਕਰਨ ਵਾਲੇ ਦਾ ਹੈ। ਰੱਖੇ ਹੋਏ ਕਿਸੇ ਵੀ TTTI-T ਨੂੰ ਇਸ ਦੇ ਵਿਰੁੱਧ ਵਾਪਸ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ।",
    signInPrompt: "ਆਪਣੀ ਗਾਰੰਟੀ ਵੇਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    loading: "ਤੁਹਾਡੀ ਗਾਰੰਟੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ…",
    loadError: "ਤੁਹਾਡੀ ਗਾਰੰਟੀ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ।",
    retryButton: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    emptyTitle: "ਅਜੇ ਕੋਈ ਗਾਰੰਟੀ ਨਹੀਂ",
    emptyBody:
      "ਮਿੰਟ ਤੋਂ ਬਾਅਦ ਗਾਰੰਟੀ ਇੱਥੇ ਦਿਖਾਈ ਦਿੰਦੀ ਹੈ। ਇਹ ਅਦਾ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਰੱਖੀ ਜਾਂਦੀ ਹੈ।",
    massHeading: (symbol: string) => `${symbol} ਸਮੂਹ`,
    remainingTtti: "ਬਾਕੀ TTTI-T",
    totalTtti: "ਮਿੰਟ ਕੀਤੇ TTTI-T",
    remainingGuarantee: "ਬਾਕੀ ਗਾਰੰਟੀ",
    totalGuarantee: "ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਾਰੰਟੀ",
    excessLabel: "ਗਾਰੰਟੀ ਵਿੱਚ ਵਾਧੂ",
    valueLabel: "ਗਾਰੰਟੀ ਦਾ ਮੁੱਲ",
    valueUnavailable: "ਉਪਲਬਧ ਨਹੀਂ: ਇਸ ਸਮੇਂ ਕੋਈ ਦਰ ਨਹੀਂ।",
    unclaimedTitle: "ਬਿਨਾਂ ਦਾਅਵੇ ਵਾਲਾ ਸਮੂਹ",
    unclaimedIntro:
      "ਉਨ੍ਹਾਂ ਸਮੂਹਾਂ ਦਾ ਜਨਤਕ ਕੁੱਲ ਜੋ ਰਿਡੀਮ ਨਹੀਂ ਕੀਤੇ ਗਏ। ਵਿਅਕਤੀਗਤ ਸਮੂਹ ਨਿੱਜੀ ਹਨ।",
    unclaimedCount: (count: string) => `TTTI-T ਬਾਕੀ ਵਾਲੇ ਸਮੂਹ: ${count}`,
    unclaimedTtti: "ਬਾਕੀ TTTI-T",
    unclaimedGuarantee: "ਬਾਕੀ ਗਾਰੰਟੀ",
    unclaimedMintOngoing: "ਮਿੰਟ ਜਾਰੀ ਹੈ।",
    unclaimedMintEnded: "ਮਿੰਟ ਖ਼ਤਮ ਹੋ ਗਿਆ ਹੈ।",
    // Public guarantee accounts
    accountsTitle: "ਗਾਰੰਟੀ ਖਾਤੇ",
    accountsIntro:
      "ਹਰ ਟੋਕਨ ਲਈ, ਸਾਰੇ ਸਮੂਹਾਂ ਦੇ ਜੋੜ ਦੀ ਤੁਲਨਾ ਸਾਂਝੀ ਸੰਭਾਲ ਵਿੱਚ ਸਮਰਪਿਤ ਗਾਰੰਟੀ ਖਾਤੇ ਦੇ ਬਕਾਏ ਨਾਲ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",
    accountsLoadError: "ਗਾਰੰਟੀ ਖਾਤੇ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
    accountsMassTotal: "ਸਾਰੇ ਸਮੂਹਾਂ ਦਾ ਜੋੜ",
    accountsBalance: "ਗਾਰੰਟੀ ਖਾਤੇ ਦਾ ਬਕਾਇਆ",
    accountsEqual: "ਬਰਾਬਰ",
    accountsMismatch: "ਫ਼ਰਕ",
    accountsBalanceBelow: (difference: string) =>
      `ਖਾਤੇ ਵਿੱਚ ਸਮੂਹਾਂ ਦੇ ਜੋੜ ਨਾਲੋਂ ${difference} ਘੱਟ ਹੈ।`,
    accountsBalanceAbove: (difference: string) =>
      `ਖਾਤੇ ਵਿੱਚ ਸਮੂਹਾਂ ਦੇ ਜੋੜ ਨਾਲੋਂ ${difference} ਵੱਧ ਹੈ।`,
    redeemTitle: "ਰਿਡੀਮ ਕਰੋ",
    redeemIntro:
      "ਇੱਕ ਟੋਕਨ ਦੇ ਸਮੂਹ ਦੇ ਵਿਰੁੱਧ TTTI-T ਵਾਪਸ ਕਰੋ। ਪੂਰਵ-ਦਰਸ਼ਨ ਕੋਈ ਵੀ ਦਸਤਖਤ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਵਾਪਸ ਕੀਤੀ ਜਾਣ ਵਾਲੀ ਰਕਮ ਦਿਖਾਉਂਦਾ ਹੈ।",
    amountLabel: "ਵਾਪਸ ਕਰਨ ਲਈ TTTI-T",
    amountPlaceholder: "0.0",
    maxButton: "ਵੱਧ ਤੋਂ ਵੱਧ",
    amountInvalid: "ਸਿਫ਼ਰ ਤੋਂ ਵੱਡੀ ਰਕਮ ਦਰਜ ਕਰੋ।",
    redeemButton: "ਰਿਡੀਮ ਕਰੋ",
    redeemingButton: "ਰਿਡੀਮ ਹੋ ਰਿਹਾ ਹੈ…",
    previewTitle: "ਪੂਰਵ-ਦਰਸ਼ਨ",
    previewLoading: "ਗਣਨਾ ਹੋ ਰਹੀ ਹੈ…",
    previewDeposited: "ਇਸ ਰਕਮ ਲਈ ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਾਰੰਟੀ",
    previewDayRate: "ਪ੍ਰਤੀ TTTI-T 10,000 USD ਦੇ ਬਰਾਬਰ ਮਾਤਰਾ",
    previewReturned: "ਵਾਪਸ ਕੀਤੀ ਰਕਮ",
    previewExcessKept: "ਵਾਧੂ ਵਜੋਂ ਗਾਰੰਟੀ ਵਿੱਚ ਰੱਖਿਆ",
    previewFee: "ਰਿਡੈਂਪਸ਼ਨ ਫੀਸ",
    previewThirdPartyFee: "ਲੈਜਰ ਫੀਸ (ਤੀਜੀ ਧਿਰ)",
    previewNet: "ਤੁਹਾਨੂੰ ਮਿਲੇਗਾ",
    previewRule: "ਲਾਗੂ ਕੀਤਾ ਨਿਯਮ",
    previewUsdNote: "USD ਮੁੱਲ ਇਸ ਪੂਰਵ-ਦਰਸ਼ਨ ਦੀ ਦਰ ਵਰਤਦੇ ਹਨ।",
    previewFeeNote: (percent: string) =>
      `ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਦੀ ${percent} ਫੀਸ ਕੱਟੀ ਜਾਂਦੀ ਹੈ, ਫਿਰ ਅਦਾ ਕੀਤੇ ਟੋਕਨ ਦੀ ਲੈਜਰ ਫੀਸ।`,
    returnedTttiNote: "ਵਾਪਸ ਕੀਤੇ TTTI-T ਕੰਟਰੈਕਟ ਕੋਲ ਰਹਿੰਦੇ ਹਨ। ਕੁਝ ਵੀ ਸਾੜਿਆ ਨਹੀਂ ਜਾਂਦਾ।",
    ruleDeposited: "ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਾਰੰਟੀ",
    ruleDayRate: "ਪ੍ਰਤੀ TTTI-T 10,000 USD ਦੇ ਬਰਾਬਰ ਮਾਤਰਾ",
    ruleProRata: "ਸਮੂਹ ਦੇ ਅਨੁਪਾਤ ਵਿੱਚ",
    explainTitle: "ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਕਿਵੇਂ ਤੈਅ ਹੁੰਦੀ ਹੈ",
    explainLowerOfTwo:
      "ਮਿੰਟ ਦੌਰਾਨ, x TTTI-T ਵਾਪਸ ਕਰਨ 'ਤੇ ਦੋ ਮਾਤਰਾਵਾਂ ਵਿੱਚੋਂ ਘੱਟ ਵਾਲੀ ਵਾਪਸ ਮਿਲਦੀ ਹੈ: x ਲਈ ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਾਰੰਟੀ, ਅਤੇ ਮੌਜੂਦਾ ਦਰ 'ਤੇ 10,000 USD × x ਦੇ ਬਰਾਬਰ ਮਾਤਰਾ। ਫ਼ਰਕ ਵਾਧੂ ਵਜੋਂ ਗਾਰੰਟੀ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਮਿੰਟ ਖ਼ਤਮ ਹੋਣ 'ਤੇ ਇਸ ਦਾ ਮਾਲਕ ਇਸਨੂੰ ਕਢਵਾ ਸਕਦਾ ਹੈ।",
    explainLowerOfTwoDetail: (
      deposited: string,
      depositedUsd: string,
      dayRate: string,
      dayRateUsd: string,
      returned: string,
    ) =>
      `ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਾਰੰਟੀ: ${deposited} (${depositedUsd}). ਪ੍ਰਤੀ TTTI-T 10,000 USD ਦੇ ਬਰਾਬਰ ਮਾਤਰਾ: ${dayRate} (${dayRateUsd}). ਵਾਪਸ ਕੀਤੀ ਰਕਮ, ਦੋਵਾਂ ਵਿੱਚੋਂ ਘੱਟ: ${returned}.`,
    explainProRata:
      "ਮਿੰਟ ਤੋਂ ਬਾਅਦ, ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਸਮੂਹ ਦਾ ਅਨੁਪਾਤੀ ਹਿੱਸਾ ਹੁੰਦੀ ਹੈ, ਉਸੇ ਰੂਪ ਵਿੱਚ। ਸਮੂਹ ਵਾਪਸ ਕੀਤੇ TTTI-T ਦੇ ਅਨੁਪਾਤ ਵਿੱਚ ਵੰਡਿਆ ਜਾਂਦਾ ਹੈ।",
    explainProRataExample:
      "ਉਦਾਹਰਨ: 1 TTTI-T ਦੇ ਸਮੂਹ ਵਿੱਚ 0.001 ckBTC ਹੈ। 0.5 TTTI-T ਵਾਪਸ ਕਰਨ 'ਤੇ ਰਿਡੈਂਪਸ਼ਨ ਫੀਸ ਅਤੇ ਲੈਜਰ ਫੀਸ ਤੋਂ ਪਹਿਲਾਂ 0.0005 ckBTC ਵਾਪਸ ਮਿਲਦਾ ਹੈ।",
    explainAccount:
      "ਹਰ ਟੋਕਨ ਦਾ ਸਾਂਝੀ ਸੰਭਾਲ ਵਿੱਚ ਇੱਕ ਸਮਰਪਿਤ ਅੰਦਰੂਨੀ ਖਾਤਾ ਹੈ। ਮਿੰਟ ਅਤੇ ਨਿਲਾਮੀਆਂ ਇਸ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਕਰਦੀਆਂ ਹਨ। ਬਾਇਬੈਕ ਸਿਰਫ਼ ਇਸੇ ਖਾਤੇ ਵਿੱਚੋਂ ਕੱਟਦਾ ਹੈ।",
    allowanceTitle: "TTTI-T ਮਨਜ਼ੂਰੀ",
    allowanceExplain: (amount: string, fee: string, required: string) =>
      `TTTI-T ਵਾਪਸ ਕਰਨ ਲਈ ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਅਤੇ TTTI-T ਲੈਜਰ ਫੀਸ ਜੋੜ ਕੇ ਇੱਕ ICRC-2 ਮਨਜ਼ੂਰੀ ਲੋੜੀਂਦੀ ਹੈ: ${amount} + ${fee} = ${required}.`,
    allowanceCurrent: (allowance: string) => `ਮੌਜੂਦਾ ਮਨਜ਼ੂਰੀ: ${allowance}`,
    allowanceOk: "ਮੌਜੂਦਾ ਮਨਜ਼ੂਰੀ ਇਸ ਰਿਡੈਂਪਸ਼ਨ ਨੂੰ ਕਵਰ ਕਰਦੀ ਹੈ।",
    allowanceMissing: "ਮੌਜੂਦਾ ਮਨਜ਼ੂਰੀ ਕਾਫ਼ੀ ਨਹੀਂ ਹੈ। ਰਿਡੀਮ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਰਕਮ ਨੂੰ ਮਨਜ਼ੂਰ ਕਰੋ।",
    approveButton: "ਮਨਜ਼ੂਰ ਕਰੋ",
    approvingButton: "ਮਨਜ਼ੂਰ ਹੋ ਰਿਹਾ ਹੈ…",
    allowanceExpiryNote:
      "ਮਨਜ਼ੂਰੀ ਦੀ ਹਮੇਸ਼ਾ ਮਿਆਦ ਹੁੰਦੀ ਹੈ। ਪੁਸ਼ਟੀ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਵਾਲੇਟ ਵਿੱਚ ਰਕਮ ਅਤੇ ਤਾਰੀਖ਼ ਦੀ ਜਾਂਚ ਕਰੋ।",
    excessTitle: "ਵਾਧੂ ਕਢਵਾਉਣਾ",
    excessExplain:
      "ਵਾਧੂ ਗਾਰੰਟੀ ਦਾ ਉਹ ਹਿੱਸਾ ਹੈ ਜੋ ਦੋਵਾਂ ਵਿੱਚੋਂ ਘੱਟ ਵਾਲਾ ਨਿਯਮ ਲਾਗੂ ਹੋਣ 'ਤੇ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ। ਮਿੰਟ ਖ਼ਤਮ ਹੋਣ 'ਤੇ ਇਸ ਦਾ ਮਾਲਕ ਇਸਨੂੰ ਕਢਵਾ ਸਕਦਾ ਹੈ।",
    excessBeforeEnd: "ਮਿੰਟ ਖ਼ਤਮ ਹੋਣ 'ਤੇ ਉਪਲਬਧ।",
    excessNone: "ਕਢਵਾਉਣ ਲਈ ਕੋਈ ਵਾਧੂ ਨਹੀਂ।",
    withdrawButton: "ਵਾਧੂ ਕਢਵਾਓ",
    withdrawingButton: "ਕਢਵਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
    historyTitle: "ਮੇਰੇ ਰਿਡੈਂਪਸ਼ਨ",
    historyEmpty: "ਅਜੇ ਕੋਈ ਰਿਡੈਂਪਸ਼ਨ ਨਹੀਂ।",
    kindRedeem: "ਰਿਡੈਂਪਸ਼ਨ",
    kindExcessWithdrawal: "ਵਾਧੂ ਕਢਵਾਉਣਾ",
    statusCompleted: "ਪੂਰਾ ਹੋਇਆ",
    statusInProgress: "ਜਾਰੀ ਹੈ",
    statusNeedsReview: "ਜਾਂਚ ਲਈ",
    statusFailed: "ਅਸਫਲ",
    historyReturned: "ਵਾਪਸ ਕੀਤੇ TTTI-T",
    historyNet: "ਪ੍ਰਾਪਤ",
    historyPullBlock: "TTTI-T ਬਲਾਕ",
    historyPayoutBlock: "ਭੁਗਤਾਨ ਬਲਾਕ",
    resultCompleted: (net: string) => `ਪੂਰਾ ਹੋਇਆ। ਤੁਹਾਨੂੰ ${net} ਮਿਲਿਆ।`,
    resultInProgress: "ਭੁਗਤਾਨ ਜਾਰੀ ਹੈ। ਪੂਰਾ ਹੋਣ 'ਤੇ ਇਹ ਹੇਠਾਂ ਸੂਚੀ ਵਿੱਚ ਦਿਖਾਈ ਦੇਵੇਗਾ।",
    resultNeedsReview:
      "ਭੁਗਤਾਨ ਦੀ ਜਾਂਚ ਲੋੜੀਂਦੀ ਹੈ। ਇਹ ਆਪਣੀ ਸਥਿਤੀ ਸਮੇਤ ਹੇਠਾਂ ਸੂਚੀ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ।",
    resultFailed: "ਭੁਗਤਾਨ ਪੂਰਾ ਨਹੀਂ ਹੋਇਆ।",
    errAnonymous: "ਆਪਣੀ ਗਾਰੰਟੀ ਵਰਤਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
    errSalesPaused: "ਰਿਡੈਂਪਸ਼ਨ ਰੋਕੇ ਗਏ ਹਨ।",
    errMassNotFound: "ਇਸ ਟੋਕਨ ਲਈ ਕੋਈ ਸਮੂਹ ਨਹੀਂ ਹੈ।",
    errNothingRemaining: "ਇਸ ਸਮੂਹ ਵਿੱਚ ਰਿਡੀਮ ਕਰਨ ਲਈ ਕੁਝ ਬਾਕੀ ਨਹੀਂ ਹੈ।",
    errAmountTooSmall: "ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਫੀਸਾਂ ਪੂਰੀਆਂ ਨਹੀਂ ਕਰੇਗੀ। ਰਿਡੈਂਪਸ਼ਨ ਸੰਭਵ ਨਹੀਂ।",
    errAmountExceedsMass: (requested: string, remaining: string) =>
      `ਰਕਮ ${requested} ਸਮੂਹ ਵਿੱਚ ਬਾਕੀ ${remaining} ਤੋਂ ਵੱਧ ਹੈ।`,
    errRateUnavailable: (symbol: string) =>
      `ਇਸ ਸਮੇਂ ${symbol} ਲਈ ਕੋਈ ਦਰ ਉਪਲਬਧ ਨਹੀਂ। ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
    errTttiBalance: (balance: string, required: string) =>
      `TTTI-T ਬਕਾਇਆ ${balance} ਹੈ; ${required} ਲੋੜੀਂਦਾ ਹੈ।`,
    errAllowance: (allowance: string, required: string) =>
      `TTTI-T ਮਨਜ਼ੂਰੀ ${allowance} ਹੈ; ${required} ਲੋੜੀਂਦੀ ਹੈ।`,
    errSlippage:
      "ਪ੍ਰਾਪਤ ਰਕਮ ਪੂਰਵ-ਦਰਸ਼ਨ ਤੋਂ ਘੱਟ ਹੋਵੇਗੀ। ਪੂਰਵ-ਦਰਸ਼ਨ ਤਾਜ਼ਾ ਕਰੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    errRedemptionInProgress: "ਇੱਕ ਰਿਡੈਂਪਸ਼ਨ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ।",
    errMintNotEnded: "ਵਾਧੂ ਮਿੰਟ ਖ਼ਤਮ ਹੋਣ 'ਤੇ ਕਢਵਾਇਆ ਜਾ ਸਕਦਾ ਹੈ।",
    errNoExcess: "ਕਢਵਾਉਣ ਲਈ ਕੋਈ ਵਾਧੂ ਨਹੀਂ ਹੈ।",
    errPullFailed: (detail: string) => `TTTI-T ਲਏ ਨਹੀਂ ਜਾ ਸਕੇ: ${detail}`,
    errCallFailed: (detail: string) => `ਬੇਨਤੀ ਅਸਫਲ ਰਹੀ: ${detail}`,
    errInvalidAmount: "ਵੈਧ ਰਕਮ ਦਰਜ ਕਰੋ।",
    percentShare: "ਛੁਡਾਉਣਯੋਗ ਰਕਮ ਦਾ ਹਿੱਸਾ",
    percentComputedOn: "ਛੁਡਾਉਣਯੋਗ ਰਕਮ ਉੱਤੇ ਗਿਣਿਆ: ਬਾਕੀ ਪੁੰਜ ਅਤੇ ਰੱਖੇ TTTI-T ਵਿੱਚੋਂ ਘੱਟ।",
    balanceNone: "ਇਸ ਵਾਲਿਟ ਵਿੱਚ ਵਾਪਸ ਕਰਨ ਲਈ ਕੋਈ TTTI-T ਨਹੀਂ ਹੈ।",
    heldLabel: "ਰੱਖੇ TTTI-T",
    limitedByBalance: (held: string, max: string) =>
      `ਰੱਖੇ TTTI-T (${held}) ਰਕਮ ਨੂੰ ${max} ਤੱਕ ਸੀਮਤ ਕਰਦੇ ਹਨ।`,
    confirmTitle: "ਛੁਡਾਉਣ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    confirmIntro:
      "ਤੁਸੀਂ ਕੰਟਰੈਕਟ ਲਈ TTTI-T ਦੀ ICRC-2 ਮਨਜ਼ੂਰੀ ਉੱਤੇ ਦਸਤਖ਼ਤ ਕਰਦੇ ਹੋ; ਫਿਰ ਕੰਟਰੈਕਟ TTTI-T ਲੈਂਦਾ ਹੈ ਅਤੇ ਸ਼ੁੱਧ ਰਕਮ ਅਦਾ ਕਰਦਾ ਹੈ।",
    confirmExpiry: "ਮਨਜ਼ੂਰੀ 15 ਮਿੰਟ ਵਿੱਚ ਖ਼ਤਮ ਹੋ ਜਾਂਦੀ ਹੈ।",
    closeButton: "ਬੰਦ ਕਰੋ",
    cancelButton: "ਰੱਦ ਕਰੋ",
    resultTitle: "ਨਤੀਜਾ",
  },
});
