import type en from "./en";

const fr: typeof en = {
  fallbackMessage:
    "L'achat n'a pas pu être effectué pour cette destination. Vérifiez le destinataire et réessayez.",
  server: (server: string) => server,
  reference: (id: string) => ` Référence : achat #${id}.`,
  contactTeam: " Contactez l'équipe en indiquant cette référence.",
  refundedTitle: (symbol: string, fee: string) =>
    `Échec de la livraison — votre ${symbol} a été remboursé, moins les frais de ${fee}`,
  refundFailed:
    "La livraison a échoué et le remboursement automatique a également échoué",
  refundedMessage: () =>
    "La livraison du TTTI-T a échoué ; le paiement a été remboursé, moins les frais du ledger.",
  refundFailedMessage: () =>
    "La livraison du TTTI-T a échoué et le remboursement a également échoué ; cet achat nécessite un suivi manuel.",
  salesPausedTitle: "Les ventes sont suspendues",
  salesPausedMessage: () => "Les achats sont temporairement désactivés.",
  saleCompleteTitle: "Vente terminée",
  saleCompleteMessage: () =>
    "Vente de TTTI-T terminée : il ne reste plus de TTTI-T à vendre.",
  belowMinimumTitle: "Inférieur à l'achat minimum",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    requested: string,
  ) =>
    `Le minimum est de ${minimum} ${display} (${minimumUsd} en ${symbol}) ; vous avez demandé ${requested} ${display}.`,
  aboveRemainingTitle: "Supérieur au montant restant",
  aboveRemainingMessage: (
    maximum: string,
    display: string,
    maximumPay: string,
    requested: string,
  ) =>
    `Le maximum disponible est de ${maximum} ${display} (${maximumPay}) ; vous avez demandé ${requested} ${display}.`,
  priceUnavailableTitle: (symbol: string) =>
    `Achat refusé : aucun taux ${symbol}/USD valide n'est fixé`,
  priceUnavailableMessage: (symbol: string) =>
    `Aucun ${symbol} n'a été prélevé. Les achats en ${symbol} sont indisponibles tant qu'aucun taux n'est fixé.`,
  notConfiguredTitle: (symbol: string) => `${symbol} n'est pas configuré`,
  notConfiguredMessage: (symbol: string) =>
    `La vente n'est pas encore configurée. Aucun ${symbol} n'a été prélevé.`,
  ledgerMismatchTitle: (symbol: string) => `Incohérence du ledger ${symbol}`,
  ledgerMismatchMessage: (
    symbol: string,
    actualDecimals: string,
    actualFee: string,
    expectedDecimals: string,
    expectedFee: string,
  ) =>
    `Le ledger ${symbol} indique ${actualDecimals} décimales et des frais de ${actualFee} ; attendu : ${expectedDecimals} décimales et ${expectedFee}. Aucun ${symbol} n'a été prélevé.`,
  ackRequiredTitle: "Confirmations d'achat requises",
  ackRequiredMessage: (symbol: string) =>
    `Ce compte n'a pas accepté les six confirmations d'achat. Aucun ${symbol} n'a été prélevé.`,
  invalidAmountTitle: "Montant invalide",
  invalidAmountMessage: () =>
    "Ce montant ou ce compte de livraison ne peut pas être accepté. Rien n'a été prélevé.",
  insufficientTitle: (symbol: string) => `Solde ${symbol} insuffisant`,
  insufficientMessage: (_server: string, balance: string) =>
    `Le solde ne couvre pas cet achat. Solde : ${balance}.`,
  approvalMissingTitle: (symbol: string) => `Approbation ${symbol} manquante`,
  approvalMissingMessage: (_server: string, allowance: string) =>
    `L'autorisation ne couvre pas cet achat. Autorisation actuelle : ${allowance}.`,
  inProgressTitle: "Achat déjà en cours",
  inProgressMessage: (symbol: string) =>
    `Un achat est déjà en cours pour ce compte. Attendez qu'il se termine, puis réessayez. Aucun ${symbol} n'a été prélevé pour cette demande.`,
  ledgerErrorTitle: (symbol: string) => `Erreur du ledger ${symbol}`,
  ledgerErrorMessage: () =>
    "Le ledger n'a pas pu être joint ou l'opération a échoué. Réessayez.",
  signInTitle: "Connectez-vous pour frapper",
  signInMessage: () => "Veuillez vous connecter pour frapper du TTTI-T.",
  notCompletedTitle: "Achat non effectué",
  failedTitle: "Échec de l'achat",
};

export default fr;
