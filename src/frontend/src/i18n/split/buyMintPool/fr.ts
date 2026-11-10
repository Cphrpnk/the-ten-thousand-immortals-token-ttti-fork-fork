import type en from "./en";

const fr: typeof en = {
  heading: "Pool",
  legend: "Pool recevant la liquidité",
  recommended: "Recommandé",
  feeTier: "Palier de frais",
  depth: "Profondeur",
  price: "Prix",
  gap: "Écart avec le prix consolidé",
  selectedPool: "Pool choisi",
  poolLabel: (id: string) => `Pool n° ${id}`,
  single: (fee: string) => `Pool unique, palier de frais ${fee}`,
  selectPrompt: "Choisissez un pool pour continuer.",
  noPool:
    "Aucun pool n'est disponible pour ce jeton. La frappe est indisponible.",
  loading: "Chargement des pools…",
  loadError: "Les pools n'ont pas pu être chargés.",
  retry: "Réessayer",
  fallbackNotice:
    "Le pool que vous avez choisi n'est plus disponible. Le pool recommandé est sélectionné à la place.",
  errUnknownPool: "Le pool choisi n'existe pas. Choisissez à nouveau un pool.",
  errOtherPair:
    "Le pool choisi n'est pas un pool de ce jeton. Choisissez à nouveau un pool.",
  errPoolRemoved: "Le pool choisi a été retiré. Choisissez à nouveau un pool.",
  errPoolRemovalAnnounced: (date: string) =>
    `Le retrait du pool choisi est annoncé pour le ${date}. Choisissez à nouveau un pool.`,
};

export default fr;
