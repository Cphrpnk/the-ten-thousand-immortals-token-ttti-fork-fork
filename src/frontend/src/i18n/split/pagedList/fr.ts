import type en from "./en";

const fr: typeof en = {
  loadMore: "Charger plus",
  loading: "Chargement…",
  loadingMore: "Chargement de la suite…",
  noMoreResults: "Plus aucun résultat",
  empty: "Rien à afficher pour le moment.",
  loadError: "La liste n’a pas pu être chargée.",
  loadMoreError: "La suite n’a pas pu être chargée.",
  retry: "Réessayer",
  showing: (count: string) => `${count} affichés`,
};

export default fr;
