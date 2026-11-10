import type en from "./en";

const fr: typeof en = {
  requestFailed: "La requête n'a pas pu aboutir. Réessayez.",
  errorTitle: "Achat en Bitcoin",
  intro:
    "Envoyez des BTC à votre propre adresse Bitcoin. Ils deviennent du ckBTC, puis du TTTI-T au taux horaire. 1 % du montant revient au créateur.",
  recordingAcks: "Enregistrement des confirmations d'achat…",
  creatingAddress: "Création de l'adresse…",
  getAddress: "Obtenir mon adresse Bitcoin",
  tickAll: "Cochez les six déclarations pour obtenir votre adresse.",
  purchaseAddressLabel: "Votre adresse Bitcoin d'achat",
  sentToDelivery:
    "Le TTTI-T est envoyé à votre adresse de livraison ci-dessous.",
  keepPageOpen:
    "Gardez cette page ouverte jusqu'à ce que votre dépôt soit détecté. Si vous la quittez, votre achat sera finalisé à votre retour sur cette page, au taux de change de ce moment-là. Si la vente est terminée d'ici là, vous serez remboursé en ckBTC.",
  delivered: (amount: string) => `${amount} TTTI-T livrés`,
  deliveredDetail: "Au taux horaire ckBTC",
  refunded: (amount: string) => `${amount} renvoyés sur votre wallet`,
  refundedDetail:
    "La conversion n'a pas pu aboutir ; le ckBTC a donc été renvoyé automatiquement.",
  addressDefaultLabel: "Adresse de dépôt Bitcoin",
  addressCopiedToast: "Adresse Bitcoin copiée",
  addressCopyFailedToast: "Impossible de copier l'adresse",
  qrTitle: (address: string) => `QR code de l'adresse Bitcoin ${address}`,
  copyAddressAria: (address: string) => `Copier l'adresse Bitcoin ${address}`,
  copied: "Copiée",
  clickToCopy: "Cliquez sur l'adresse pour la copier.",
  errValueTooSmall: (minimum: string) =>
    `Dépôt trop faible : inférieur au minimum de ${minimum}. Il n'a pas été converti.`,
  errTainted: "Dépôt refusé par le minter ckBTC.",
  errMinterUnavailable:
    "Le minter ckBTC est indisponible. Vérifiez à nouveau plus tard.",
  errOther: (server: string | undefined) =>
    server
      ? `Le dépôt n'a pas pu être traité. ${server}`
      : "Le dépôt n'a pas pu être traité.",
  notYet: "Pas encore",
  finalWallet: "ckBTC dans votre wallet",
  finalRefunded: "Remboursé en ckBTC",
  finalDelivered: "TTTI-T livré",
  stepAddress: "Adresse affichée",
  stepDetected: "Dépôt détecté",
  stepConfirmations: (count: string) => `Confirmations ${count}`,
  stepMinted: "ckBTC créé",
  amountBtcDetected: "BTC détecté",
  amountCkbtcCreated: "ckBTC créé",
  amountCkbtcPending: "ckBTC en attente",
  amountRefunded: "Remboursé",
  amountTttiDelivered: "TTTI-T livré",
  progressAria: "Progression du dépôt Bitcoin",
  pendingRate:
    "Taux indisponible. Le ckBTC est conservé jusqu'au prochain taux horaire.",
  lastChecked: (time: string) => `Dernière vérification : ${time}`,
  checking: "Vérification…",
  check: "Vérifier",
  flowWallet: "BTC → ckBTC (portefeuille)",
  flowPurchase: "BTC → TTTI-T (achat)",
  noDepositYet: "Aucun dépôt reçu sur cette adresse pour l'instant.",
  earlierDeposits: "Dépôts précédents sur cette adresse",
  depositNumber: (n: string) => `Dépôt ${n}`,
  detectedOn: (time: string) => `Détecté le ${time}`,
  stagePendingRate: "En attente du taux horaire",
  conversionCauseLine: (cause: string) => `État de la conversion : ${cause}`,
  pendingDepositStatus: "Dépôt Bitcoin en cours.",
  pendingDepositLink: "Voir le dépôt Bitcoin",
  errUnrecoverable: (server: string | undefined) =>
    server
      ? `Ce dépôt ne peut pas être traité. ${server}`
      : "Ce dépôt ne peut pas être traité.",
  refundFailed: (amount: string) =>
    `Le remboursement de l'excédent a échoué. ${amount} toujours détenus ; le remboursement est relancé automatiquement.`,
  waitingNewTransfer: "En attente d'un nouveau transfert vers cette adresse.",
  depositFinished: (n: string, status: string) => `Dépôt ${n} : ${status}.`,
  waitForNew: "Attendre un nouveau transfert",
  otherDeposits: "Autres dépôts sur cette adresse",
  reuseWallet:
    "Envoyez des BTC à cette adresse depuis n'importe quel wallet Bitcoin. Chaque nouveau transfert est converti automatiquement en ckBTC. La même adresse peut être réutilisée.",
  reusePurchase:
    "Envoyez des BTC à cette adresse depuis n'importe quel wallet Bitcoin. Chaque nouveau transfert est converti et livré automatiquement en TTTI-T. La même adresse peut être réutilisée.",
  waitingDepositStatus: "Adresse Bitcoin en attente d'un nouveau transfert.",
  waitingDepositLink: "Voir l'adresse Bitcoin",
  refundCause: (cause: string) => `Cause : ${cause}`,
  refundPurposeFull: "Montant renvoyé en totalité",
  refundPurposeExcess: "Excédent renvoyé",
  refundPurposeDeliveryFailed: "Livraison échouée, montant renvoyé",
  refundSending: "Le remboursement est en cours d'envoi.",
  refundRetrying: "Le remboursement est retenté automatiquement.",
  refundTxLabel: "Transaction de remboursement",
  heldNote: (amount: string) =>
    `${amount} détenus par le contrat. Utilisez le bouton Mint ci-dessous pour les convertir maintenant. Si la conversion ne peut pas aboutir, un remboursement vers votre wallet s'ouvre automatiquement.`,
  convertDelivered: (amount: string) => `${amount} TTTI-T livrés`,
  convertRefunded: (amount: string) => `${amount} renvoyés sur votre wallet`,
  convertStillHeld: (amount: string) =>
    `${amount} toujours détenus par le contrat. La conversion est retentée automatiquement.`,
  convertNothing: "Aucun ckBTC n'attendait d'être converti.",
  convertFailedTitle: "Conversion non terminée",
  convertNothingTaken:
    "Rien n'a été prélevé : vos fonds restent chez vous ou sont retournés dans votre portefeuille. Vous pouvez cliquer de nouveau sur Mint.",
  depositAlertDeliveredTitle: "Dépôt Bitcoin livré",
  depositAlertDeliveredText: (amount: string) =>
    `${amount} reçus pour votre dépôt Bitcoin.`,
  depositAlertRefundedTitle: "Dépôt Bitcoin remboursé",
  depositAlertRefundedText: (amount: string) =>
    `${amount} renvoyés sur votre wallet. La conversion n'a pas pu aboutir.`,
  depositAlertViewDeposit: "Voir le dépôt",
  depositAlertViewHistory: "Voir l'historique",
};

export default fr;
