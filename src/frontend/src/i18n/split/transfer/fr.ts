import type en from "./en";

const fr: typeof en = {
  contractAddressRefused:
    "Les jetons ne peuvent pas être brûlés ; les transferts vers l'adresse du contrat sont refusés.",
  badFee: "Les frais de transfert ont changé. Actualisez et réessayez.",
  insufficientFundsBalance: (balance: string, symbol: string) =>
    `Fonds insuffisants. Votre solde est de ${balance} ${symbol}.`,
  insufficientFunds: "Fonds insuffisants pour ce transfert.",
  insufficientAllowanceAmount: (allowance: string, symbol: string) =>
    `L'autorisation est insuffisante. Autorisation actuelle : ${allowance} ${symbol}.`,
  insufficientAllowance: "L'autorisation est insuffisante pour ce transfert.",
  duplicateTransfer: "Cette transaction a déjà été traitée.",
  temporarilyUnavailable:
    "Le ledger est temporairement indisponible. Réessayez dans un instant.",
  createdInFuture:
    "Le ledger a refusé cette opération comme créée dans le futur. Réessayez.",
  tooOldTransfer:
    "Cette transaction est trop ancienne pour être traitée. Réessayez.",
  genericRejected:
    "Le ledger a refusé cette demande. Vérifiez la destination et réessayez.",
  rejected: "Le ledger a refusé cette demande.",
  allowanceChangedAmount: (current: string, symbol: string) =>
    `L'autorisation a changé. Autorisation actuelle : ${current} ${symbol}.`,
  allowanceChanged: "L'autorisation a changé. Actualisez et réessayez.",
  approveExpired: "Cette approbation a expiré avant d'être traitée.",
  approveExpiredFrom: "Le délai d'approbation a expiré. Réessayez.",
  approveInsufficientFunds:
    "Fonds insuffisants pour couvrir les frais d'approbation.",
  approveBadFee: "Les frais d'approbation ont changé. Actualisez et réessayez.",
  approveDuplicate: "Cette approbation a déjà été traitée.",
  approveTooOld:
    "Cette approbation est trop ancienne pour être traitée. Réessayez.",
  approveRejected: "Le ledger a refusé cette approbation.",
  destinationUnavailable:
    "La vérification de la destination est indisponible. Réessayez dans un instant.",
  invalidAmount: (decimals: number) =>
    `Saisissez un montant supérieur à 0 avec au plus ${decimals} décimales.`,
  transferFailed:
    "Le transfert a échoué. Vérifiez la destination et réessayez.",
  amountLabel: (symbol: string) => `Montant (${symbol})`,

  signedOutTitle: "Connectez-vous pour gérer vos jetons",
  signedOutBody:
    "Les transferts et les approbations sont liés à votre principal Internet Identity. Connectez-vous depuis l'en-tête pour continuer.",
  balanceLabel: "Votre solde",

  invalidRecipient: "Saisissez un Principal ID de destinataire valide.",
  transferSent: (amount: string, symbol: string, to: string) =>
    `${amount} ${symbol} envoyés à ${to}.`,
  toastTransfer: "Transfert effectué",
  transferTitle: (symbol: string) => `Transférer des ${symbol}`,
  transferDescription: (fee: string, symbol: string) =>
    `Envoyez des jetons depuis votre principal vers un autre compte. Les frais de transfert de ${fee} ${symbol} sont déduits de votre solde et crédités au compte collecteur des frais.`,
  recipientLabel: "Principal du destinataire",
  transferHint: (decimals: number, fee: string, symbol: string, from: string) =>
    `Au plus ${decimals} décimales. Frais : ${fee} ${symbol}. Envoi depuis ${from}.`,
  sending: "Envoi...",
  sendTokens: "Envoyer les jetons",

  invalidSpender: "Saisissez un Principal ID de tiers autorisé valide.",
  invalidAllowance: (decimals: number) =>
    `Saisissez une autorisation supérieure à 0 avec au plus ${decimals} décimales.`,
  approved: (amount: string, symbol: string, spender: string) =>
    `${amount} ${symbol} autorisés pour ${spender}.`,
  toastApproved: "Autorisation approuvée",
  approvalFailed: "L'approbation a échoué. Réessayez.",
  approveTitle: "Autoriser un tiers",
  approveDescription:
    "Autorisez un autre principal à transférer des jetons en votre nom.",
  spenderLabel: "Principal du tiers autorisé",
  allowanceLabel: (symbol: string) => `Autorisation (${symbol})`,
  approveHint: (decimals: number, symbol: string) =>
    `Au plus ${decimals} décimales. L'approbation prélève les frais de transfert ${symbol}.`,
  approving: "Approbation...",
  approveAllowance: "Approuver l'autorisation",
  currentAllowance: "Autorisation actuelle",
  currentAllowanceFor: (spender: string) =>
    `Autorisation actuelle pour ${spender}`,
  enterSpenderToView: "Saisissez un tiers autorisé pour l'afficher",
  loading: "Chargement…",

  invalidFrom: "Saisissez un Principal ID « depuis » valide.",
  invalidTo: "Saisissez un Principal ID « vers » valide.",
  transferredFrom: (amount: string, symbol: string, from: string, to: string) =>
    `${amount} ${symbol} transférés de ${from} vers ${to}.`,
  toastTransferFrom: "Transfert depuis l'autorisation effectué",
  transferFromTitle: "Transférer depuis une autorisation",
  transferFromDescription:
    "Utilisez une autorisation qui vous a été accordée pour déplacer des jetons depuis le compte d'un autre principal.",
  fromLabel: "Principal source",
  toLabel: "Principal destinataire",
  transferring: "Transfert...",
  transferFromButton: "Transférer depuis",

  pageTitle: "Gérer les jetons",
  pageSubtitle: (symbol: string) =>
    `Transférer, approuver et dépenser des autorisations ${symbol}.`,
  feeBadge: (fee: string, symbol: string) => `Frais ${fee} ${symbol}`,
  tabTransfer: "Transférer",
  tabApprove: "Approuver",
  tabTransferFrom: "Transférer depuis",
};

export default fr;
