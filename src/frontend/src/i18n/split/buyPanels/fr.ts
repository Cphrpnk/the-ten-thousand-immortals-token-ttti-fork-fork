import type en from "./en";

const fr: typeof en = {
  getIcpAria: "Ajouter de l'ICP",
  getIcpAdd: "Ajoutez",
  getIcpAddToBuy: "Ajoutez de l'ICP pour frapper",
  getIcpBuyAria:
    "Acheter de l'ICP sur Onramper (copie votre adresse, s'ouvre dans un nouvel onglet)",
  getIcpBuy: "Acheter de l'ICP",
  getIcpCopyAria: "Copier l'adresse du wallet",
  getIcpCopied: "Adresse copiée",
  getIcpCopyFailed: "Échec de la copie — cliquez sur l'adresse",
  getIcpBalance: (amount: string) => `Solde : ${amount} ICP`,
  migrationTitle: (symbol: string) =>
    `Votre ${symbol} devra être migré au lancement`,
  migrationBody:
    "Ajoutez une adresse de wallet pour les recevoir automatiquement. Vous pouvez acheter dès maintenant sans adresse.",
  migrationStep1Title: "Créer un wallet",
  migrationStep1Body: "Ouvrez Plug, NNS ou OISY et créez un wallet.",
  migrationStep2Title: "Copier le bon Principal ID",
  migrationStep2Body:
    "Copiez le Principal ID — pas l'account ID de 64 caractères.",
  migrationStep3Title: "Le coller ici",
  migrationStep3Body:
    "Collez-le dans le champ d'adresse de livraison ci-dessous et enregistrez.",
  opensNewTab: "(s'ouvre dans un nouvel onglet)",
  migrationAdd: "Ajouter l'adresse",
  migrationLater: "Plus tard",
  orderLegend: "Montant de l'ordre",
  orderAmountIn: (symbol: string) => `Montant en ${symbol}`,
  orderAmountTtti: "Montant en TTTI-T",
  payWith: "Payer avec",
  unavailable: "Indisponible",
  maxSupply: "Offre maximale",
  totalSupply: "Offre totale",
  remaining: "Restant",
  supplyValueNote:
    "Les équivalents en USD utilisent le prix consolidé du TTTI-T (moyenne de l'heure).",
  complete: "Terminée",
  paused: "Suspendue",
  live: "En cours",
  maxReached: "Offre maximale atteinte",
  maxReachedBody: (max: string, symbol: string) =>
    `L'offre totale a atteint l'offre maximale de ${max} ${symbol}. Les achats sont fermés.`,
  salesPaused: "Les ventes sont suspendues",
  pausedBody:
    "Les achats sont temporairement désactivés. Revenez un peu plus tard.",
  totalSupplyPercent: (percent: string) => `Offre totale ${percent}%`,
  progressAria: (percent: string) =>
    `Offre totale : ${percent}% de l'offre maximale`,
  reserved: (amount: string, symbol: string) =>
    `${amount} ${symbol} sont réservés par des achats en cours.`,
  never: "Jamais",
  noRate: (symbol: string) =>
    `Aucun taux ${symbol}/USD valide pour cette heure`,
  unavailableUntilRate: (symbol: string) =>
    `Les achats en ${symbol} sont indisponibles tant qu'aucun taux n'est fixé.`,
  oneBuys: (symbol: string) => `1 ${symbol} achète`,
  source: "Source",
  fetched: "Récupéré",
  minimum: "Minimum",
  treasury: "Trésorerie",
  notConfigured: "Non configuré",
  treasuryCopied: (symbol: string) => `Compte ${symbol} de la trésorerie copié`,
  treasuryCopy: (symbol: string) =>
    `Copier le compte ${symbol} de la trésorerie`,
  percentConnect: "Connectez un wallet pour utiliser la barre.",
  percentBalanceUnavailable: "Solde indisponible.",
  percentNotCover: (fees: string) =>
    `Le solde ne couvre pas les frais de réseau de ${fees}.`,
  percentShare: (symbol: string) => `Part du solde ${symbol} du wallet`,
  percentSummary: (percent: string, amount: string, ttti: string) =>
    `${percent}% = ${amount} · vous recevez ${ttti} TTTI-T`,
  percentComputedOn: (fees: string) =>
    `Calculé sur le solde moins ${fees} de frais de réseau.`,
};

export default fr;
