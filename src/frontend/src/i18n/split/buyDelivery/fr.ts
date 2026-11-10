import type en from "./en";

const fr: typeof en = {
  saved: "Adresse de livraison enregistrée.",
  saveFailed: "L'enregistrement de l'adresse a échoué. Réessayez.",
  removed: "Adresse de livraison supprimée.",
  removeFailed: "La suppression de l'adresse a échoué. Réessayez.",
  title: "Adresse du wallet de livraison",
  optional: "Facultatif",
  recommended: "Recommandé",
  descPlug: (symbol: string) =>
    `Prérempli avec le principal de votre wallet Plug connecté. Votre ${symbol} est crédité ici.`,
  descIi: (symbol: string) =>
    `Prérempli avec votre principal. Votre ${symbol} est crédité ici.`,
  descNone: (symbol: string) =>
    `Non requis pour frapper. Ajoutez le Principal ID d'un wallet que vous contrôlez pour que votre ${symbol} y parvienne automatiquement au lancement.`,
  principalId: "Principal ID",
  placeholder: "ex. abcde-fghij-…-cai",
  save: "Enregistrer l'adresse",
  clear: "Effacer",
  savedAddress: "Adresse enregistrée",
  loadFailed:
    "Impossible de charger votre adresse enregistrée. Vous pouvez toujours en saisir une ci-dessus.",
  retry: "Réessayer",
  noneSaved:
    "Aucune adresse enregistrée — les achats sont crédités au principal avec lequel vous achetez.",
};

export default fr;
