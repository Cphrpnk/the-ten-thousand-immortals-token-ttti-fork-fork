import type en from "./en";

const fr: typeof en = {
  title: "Rachat",
  ruleSummary: "1 TTTI-T se rachète au plus 10 000 USD, sans frais.",
  rulePayout:
    "Le montant payé est le plus bas de 10 000 USD × x et de la réserve divisée par les TTTI-T en circulation hors du contrat × x, où x est le nombre de TTTI-T rachetés.",
  rulePayment:
    "Il est payé en ICP, ckBTC, ckUSDC et ckUSDT, en proportion de la composition de la réserve. Un rachat ne peut pas dépasser les TTTI-T en circulation hors du contrat.",
  ruleAnyHolder:
    "La réserve est commune à tous les détenteurs. N'importe quel détenteur peut racheter, y compris celui qui n'a jamais minté.",
  ruleMintLock:
    "Au mint, une part variable m des TTTI-T est mise en pool et verrouillée au nom du minteur. Le relais la libère au plus tard après 3 mois.",
  ruleMintChoice:
    "Avant de payer, le minteur choisit de mettre le reste (1 − m) en pool (choix A) ou de le garder dans le portefeuille (choix B).",
  ruleMintReserve:
    "La réserve commune reçoit 10 000 USD par TTTI-T minté, quel que soit le choix. Elle est calculée en USD et détenue dans le jeton payé (ICP, ckBTC, ckUSDC ou ckUSDT), sans conversion.",
  redeemHeldNote:
    "Tout TTTI-T détenu peut être racheté jusqu'à 10 000 USD depuis la réserve commune, y compris le TTTI-T gardé dans le portefeuille au choix B.",
  signInPrompt: "Connectez-vous pour racheter du TTTI-T.",
  loadError: "Vos rachats n'ont pas pu être chargés.",
  retryButton: "Réessayer",
  reserveTitle: "Réserve",
  reserveLoading: "Chargement de la réserve…",
  reserveLoadError: "La réserve n'a pas pu être chargée.",
  reserveTotalLabel: "Réserve (USD)",
  reserveTokenLabel: (symbol: string) => `Réserve en ${symbol}`,
  circulationLabel: "TTTI-T en circulation hors du contrat",
  reservePerTtiLabel: "Réserve par TTTI-T",
  reservePerTtttiNone: "Aucun TTTI-T en circulation",
  requiredLabel: "Requis (10 000 USD × circulation)",
  invariantLabel: "Invariant",
  invariantHolds: "Réserve au moins égale au montant requis",
  invariantBroken: "Réserve inférieure au montant requis",
  shortfallLabel: "Manque",
  shortfallNone: "Aucun",
  reserveRateMissing: (symbol: string) => `aucun taux pour ${symbol}`,
  redeemTitle: "Racheter",
  redeemIntro:
    "Rendez du TTTI-T contre la réserve commune. L'aperçu indique le montant exact reçu avant toute signature.",
  amountLabel: "TTTI-T à racheter",
  amountPlaceholder: "0,0",
  maxButton: "Max",
  amountInvalid: "Saisissez un montant supérieur à zéro.",
  redeemButton: "Racheter",
  redeemingButton: "Rachat en cours…",
  previewTitle: "Aperçu",
  previewLoading: "Calcul en cours…",
  previewCap: "10 000 USD × x",
  previewReserveShare: "Réserve ÷ circulation hors du contrat × x",
  previewPaidIn: (symbol: string) => `Payé en ${symbol}`,
  previewCirculation: "TTTI-T en circulation hors du contrat",
  previewNet: "Vous recevez (le plus bas des deux)",
  previewUsdNote: "Les valeurs en USD utilisent les taux de cet aperçu.",
  previewLedgerFeeNote:
    "Les frais de ledger du paiement ne sont pas déduits du montant reçu.",
  returnedTttiNote:
    "Les TTTI-T rendus sont gardés par le contrat et sortent de la circulation hors du contrat. Rien n'est brûlé.",
  allowanceTitle: "Autorisation TTTI-T",
  allowanceExplain: (amount: string, fee: string, required: string) =>
    `Rendre du TTTI-T demande une autorisation ICRC-2 couvrant le montant rendu plus les frais de ledger du TTTI-T : ${amount} + ${fee} = ${required}.`,
  allowanceCurrent: (allowance: string) =>
    `Autorisation actuelle : ${allowance}`,
  allowanceOk: "L'autorisation actuelle couvre ce rachat.",
  allowanceMissing:
    "L'autorisation actuelle ne suffit pas. Elle est demandée avant le rachat.",
  approvingButton: "Autorisation en cours…",
  allowanceExpiryNote:
    "Une autorisation a toujours une expiration. Vérifiez le montant et la date dans votre wallet avant de confirmer.",
  historyTitle: "Mes rachats",
  historyEmpty: "Aucun rachat pour l'instant.",
  statusCompleted: "Terminé",
  statusInProgress: "En cours",
  statusNeedsReview: "À vérifier",
  statusFailed: "Échoué",
  historyReturned: "TTTI-T rendus",
  historyNet: "Reçu",
  historyPullBlock: "Bloc TTTI-T",
  historyPayoutBlock: "Bloc du paiement",
  resultCompleted: (net: string) => `Terminé. Vous avez reçu ${net}.`,
  resultInProgress:
    "Le paiement est en cours. Il apparaît dans la liste ci-dessous une fois terminé.",
  resultNeedsReview:
    "Le paiement doit être vérifié. Il reste dans la liste ci-dessous avec son statut.",
  resultFailed: "Le paiement n'a pas abouti.",
  errAnonymous: "Connectez-vous pour racheter.",
  errSalesPaused: "Les rachats sont suspendus.",
  errAmountTooSmall:
    "Le montant est trop petit pour être payé. Le rachat est impossible.",
  errAmountExceedsCirculation: (requested: string, circulation: string) =>
    `Le montant ${requested} dépasse les TTTI-T en circulation hors du contrat : ${circulation}.`,
  errReserveEmpty: "La réserve est vide. Le rachat est impossible.",
  errRateUnavailable: (symbol: string) =>
    `Aucun taux n'est disponible pour ${symbol} pour le moment. Réessayez plus tard.`,
  errLedgerFeeNotCovered: (symbol: string, fee: string) =>
    `Le montant ne couvre pas les frais de ledger ${symbol} du paiement (${fee}). Le rachat est impossible.`,
  errTttiBalance: (balance: string, required: string) =>
    `Le solde de TTTI-T est ${balance} ; ${required} sont nécessaires.`,
  errAllowance: (allowance: string, required: string) =>
    `L'autorisation TTTI-T est de ${allowance} ; ${required} sont nécessaires.`,
  errSlippage: (payout: string, expected: string) =>
    `Le montant reçu serait de ${payout}, inférieur aux ${expected} affichés dans l'aperçu. Actualisez l'aperçu et réessayez.`,
  errRedemptionInProgress: "Un rachat est déjà en cours.",
  errNothingToConvert: "Il n'y a rien à convertir pour cette opération.",
  errConversionFailed: (detail: string) => `La conversion a échoué : ${detail}`,
  errPullFailed: (detail: string) =>
    `Les TTTI-T n'ont pas pu être prélevés : ${detail}`,
  errCallFailed: (detail: string) => `La requête a échoué : ${detail}`,
  errInvalidAmount: "Saisissez un montant valide.",
  errAcknowledgementRequired:
    "Les conditions du portefeuille doivent être acceptées avant de racheter. Ouvrez l'étape d'acceptation, acceptez les conditions, puis rachetez à nouveau.",
  acceptanceChecking: "Vérification des conditions du portefeuille…",
  acceptanceMissing:
    "Les conditions du portefeuille n'ont pas été acceptées pour ce compte. Elles doivent l'être avant de racheter.",
  openAcceptanceButton: "Lire et accepter les conditions du portefeuille",
  percentShare: "Part du montant rachetable",
  percentComputedOn:
    "Calculé sur le montant rachetable : le plus bas des TTTI-T détenus et des TTTI-T en circulation hors du contrat.",
  balanceNone: "Ce wallet ne détient aucun TTTI-T rachetable.",
  heldLabel: "TTTI-T détenus",
  limitedByBalance: (held: string, max: string) =>
    `Les TTTI-T détenus (${held}) limitent le montant à ${max}.`,
  limitedByCirculation: (circulation: string, max: string) =>
    `Les TTTI-T en circulation hors du contrat (${circulation}) limitent le montant à ${max}.`,
  confirmTitle: "Confirmer le rachat",
  confirmIntro:
    "Vous signez une autorisation ICRC-2 de TTTI-T pour le contrat. Le contrat prélève ensuite les TTTI-T et paie le montant affiché, dans les jetons de la réserve (ICP, ckBTC, ckUSDC et ckUSDT).",
  confirmExpiry: "L'autorisation expire après 15 minutes.",
  closeButton: "Fermer",
  cancelButton: "Annuler",
  resultTitle: "Résultat",
};

export default fr;
