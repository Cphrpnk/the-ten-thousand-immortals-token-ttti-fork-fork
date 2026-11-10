import type en from "./en";

const fr: typeof en = {
  // Page
  title: "Portefeuille",
  intro:
    "Connectez votre wallet, consultez vos soldes et envoyez ou recevez des jetons.",
  activeIdentity: "Identité active",
  connectedWith: (source: string) => `Connecté avec ${source}`,
  noWalletYet: "Aucun wallet connecté pour l'instant",
  account: "Compte",
  notConnected: "Non connecté",
  copy: "Copier",
  signOutIi: "Se déconnecter d'II",
  connectIi: "Connecter Internet Identity",
  disconnectPlug: "Déconnecter Plug",
  disconnectWallet: (name: string) => `Déconnecter ${name}`,
  toastWalletDisconnected: (name: string) => `${name} déconnecté`,
  connectPlug: "Connecter Plug",
  plugNotDetected:
    "Extension Plug non détectée. Installez Plug pour connecter un wallet de navigateur.",
  balances: "Soldes",
  tokensUnavailable:
    "Liste des jetons indisponible. Les ledgers n'ont pas répondu.",
  retry: "Réessayer",
  noTokens: "Aucun jeton n'est encore disponible pour ce wallet.",
  toastAccountCopiedClipboard: "Compte copié dans le presse-papiers",
  toastCopyFailed: "Impossible de copier le compte",
  toastPlugConnected: "Wallet Plug connecté",
  toastPlugConnectFailed: "Impossible de connecter Plug",
  toastPlugDisconnected: "Wallet Plug déconnecté",
  toastIiSignedOut: "Déconnecté d'Internet Identity",
  // Token balance card
  refreshBalance: (symbol: string) => `Actualiser le solde ${symbol}`,
  connectToViewBalance: "Connectez un wallet pour voir ce solde.",
  balanceUnavailable: "Solde indisponible. Le ledger n'a pas répondu.",
  // Send panel
  send: "Envoyer",
  sending: "Envoi…",
  sendDescription: "Envoyez des jetons depuis votre wallet connecté.",
  token: "Jeton",
  selectToken: "Sélectionnez un jeton",
  recipientPrincipal: "Principal du destinataire",
  amount: "Montant",
  fee: "Frais :",
  balanceSuffix: (amount: string, symbol: string) =>
    ` · Solde : ${amount} ${symbol}`,
  sendConnectHint:
    "Connectez-vous avec Internet Identity ou connectez OISY, NFID Wallet ou Plug pour envoyer des jetons.",
  errConnectWallet: "Connectez un wallet avant d'envoyer.",
  errSelectToken: "Sélectionnez un jeton à envoyer.",
  errRecipient: "Saisissez un principal de destinataire valide.",
  errAmount: (symbol: string) => `Saisissez un montant ${symbol} valide.`,
  errInsufficient: (symbol: string, have: string, need: string) =>
    `Solde ${symbol} insuffisant. Vous avez ${have} ${symbol} mais il faut ${need} ${symbol}, frais compris.`,
  errTransferFailed: "Le transfert n'a pas pu être effectué.",
  errBadFee: "Le ledger a refusé les frais. Actualisez et réessayez.",
  errInsufficientFunds: "Solde insuffisant pour ce transfert.",
  errTooOld: "Le transfert a expiré. Veuillez réessayer.",
  errCreatedInFuture:
    "L'horodatage du transfert n'est pas valide. Veuillez réessayer.",
  errDuplicate: "Ce transfert a déjà été soumis.",
  errTemporarilyUnavailable:
    "Le ledger est temporairement indisponible. Réessayez dans un instant.",
  errGeneric: "Le ledger a refusé le transfert.",
  sentSuccess: (amount: string, symbol: string, to: string) =>
    `${amount} ${symbol} envoyés à ${to}.`,
  toastSent: (symbol: string) => `${symbol} envoyés`,
  // Receive panel
  receive: "Recevoir",
  receiveDescription: "Partagez votre compte pour recevoir des jetons.",
  receiveConnectHint: "Connectez un wallet pour voir votre compte.",
  copied: "Copié",
  copyAccount: "Copier le compte",
  receivingTo: (symbol: string) => `Réception de ${symbol} sur ce compte.`,
  toastAccountCopied: "Compte copié",
  // BTC → ckBTC panel
  btcFact: (minDeposit: string, confirmations: string) =>
    `Dépôt minimum ${minDeposit} · ${confirmations} confirmations Bitcoin · les ckBTC arrivent dans votre wallet, sans frais de l'app, sans création de TTTI-T.`,
  btcCreditedTo: (wallet: string) =>
    `Les ckBTC de cette adresse sont crédités sur ${wallet}.`,
  btcWalletBalance: (wallet: string) => `Solde ckBTC de ${wallet}`,
  btcSignatureEachCheck: (wallet: string) =>
    `${wallet} demande une signature à chaque vérification.`,
  btcBalanceUnavailable: "Indisponible",
  btcAddressLabel: "Votre adresse Bitcoin",
  btcGetAddress: "Obtenir mon adresse Bitcoin",
  // Delivery address reminder
  deliveryTitle: "Aucune adresse de livraison enregistrée",
  deliveryBody: (symbol: string) =>
    `Ajoutez si vous le souhaitez le Principal ID qui recevra plus tard vos jetons ${symbol}. Vous pouvez le modifier à tout moment.`,
  deliveryAdd: "Ajouter une adresse de livraison",
  // Purchase history
  historyTitle: "Historique des achats",
  historyDate: "Date",
  historyStatus: "Statut",
  historyPaidToken: "Jeton payé",
  historyPaid: "Quantité payée (frais compris)",
  historyFee: "Frais",
  historyNet: "Montant net échangé (hors frais)",
  historyReceived: "TTTI-T reçus",
  historyRatioTttiPerPaid: "TTTI-T pour 1 jeton payé",
  historyRatioPaidPerTtti: "Jeton payé pour 1 TTTI-T",
  historyStatusCompleted: "Effectué",
  historyStatusFailed: "Échoué",
  historyStatusRefunded: "Remboursé",
  historyStatusRefundFailed: "Échec du remboursement",
  historyStatusRefundReview: "Remboursement en cours de vérification",
  historyShowDetails: "Afficher les détails",
  historyHideDetails: "Masquer les détails",
  historyRecipient: "Adresse du destinataire",
  historyPaymentBlock: "Bloc de paiement",
  historyMintBlock: "Bloc de création",
  historyUnavailable: "Indisponible",
  historyEmpty: "Aucun achat pour l'instant.",
  historyLoading: "Chargement de l'historique des achats…",
  historyError:
    "Historique des achats indisponible. Le canister n'a pas répondu.",
  // Summary, token list and history (OISY-like layout)
  totalValue: "Valeur totale",
  swap: "Échanger",
  tokens: "Jetons",
  priceHourlyAverage: "prix consolidé",
  refreshPrice: "Actualiser le prix consolidé du TTTI-T",
  totalNote:
    "Le TTTI-T est valorisé au prix consolidé (moyenne de l'heure), relu quand vous l'actualisez. Les jetons sans cours en USD ne sont pas comptés.",
  reserveLink: "Racheter du TTTI-T auprès de la réserve commune",
  tttiUnvalued:
    "Le prix consolidé est indisponible : le TTTI-T n'est pas valorisé.",
  historyButton: "Historique",
  buy: "Acheter",
  advancedTransfer: "Transfert avancé",
  toastBuyCopied: "Adresse copiée — collez-la dans Onramper",
  tokenActions: (symbol: string) => `Actions ${symbol}`,
  tokenHistoryTitle: (symbol: string) => `Historique ${symbol}`,
  walletHistoryTitle: "Historique",
  movementsTitle: "Mouvements TTTI-T",
  movementSent: "Envoyé",
  movementReceived: "Reçu",
  movementMinted: "Créé",
  movementApproval: "Autorisation",
  movementFrom: "De",
  movementTo: "À",
  movementsEmpty: "Aucun mouvement TTTI-T pour l'instant.",
  movementsLoading: "Chargement des mouvements TTTI-T…",
  movementsError: "Mouvements TTTI-T indisponibles. Le ledger n'a pas répondu.",
  movementsConnect: "Connectez un wallet pour voir les mouvements TTTI-T.",
  pagePrevious: "Précédent",
  pageNext: "Suivant",
  pageNumber: (page: string) => `Page ${page}`,
  purchasesNeedIi:
    "L'historique des achats est disponible avec Internet Identity.",
  purchasesPaidWith: (symbol: string) => `Achats payés en ${symbol}`,
  accountOnDashboard: (symbol: string) =>
    `Votre compte ${symbol} sur l'ICP Dashboard`,
};

export default fr;
