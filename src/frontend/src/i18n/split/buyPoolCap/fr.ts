import type en from "./en";

const fr: typeof en = {
  title: "Valeur des pools et capitalisation",
  loading: "Chargement…",
  loadError: "Les chiffres n'ont pas pu être chargés.",
  retry: "Réessayer",
  notAvailable: "Non disponible",
  poolsValue: "Valeur des pools",
  capitalisation: "Capitalisation",
  currentRatio: "Ratio actuel",
  averageRatio: "Ratio moyen sur 24 h",
  targetRatio: "Ratio cible",
  lockedShare: "Part verrouillée m",
  samples: (count: string) => `${count} échantillons`,
  computedAt: (date: string) => `Calculé le ${date}`,
  noteNoPoolsValue:
    "Pas de valeur des pools : aucun pool TTTI-T ouvert ou aucun taux valide.",
  noteNoCapitalisation: "Aucune capitalisation disponible.",
  referencePrice: "Prix de référence de la capitalisation par TTTI-T (cible)",
  referencePriceNote:
    "La capitalisation et la valeur des pools sont mesurées avec la cible de 10 000 USD par TTTI-T.",
  consolidatedInfo: "Prix consolidé par TTTI-T (à titre indicatif)",
  noteNoRatio: "Nécessite la valeur des pools et la capitalisation.",
  noteNoAverage: "Aucun échantillon de ratio enregistré pour l'instant.",
  noteLockedDefault:
    "Pas encore de ratio retenu : la part verrouillée est au maximum, 50 %.",
  definitionsToggle: "Définitions",
  defPoolsValue:
    "Valeur des pools : 2 fois la réserve de contrepartie de chaque pool TTTI-T, aux taux de l'oracle. La valeur des pools est mesurée avec la cible de 10 000 USD par TTTI-T.",
  defCapitalisation:
    "Capitalisation : TTTI-T en circulation multiplié par la cible de 10 000 USD par TTTI-T, mesurée au même moment que la valeur des pools. Le prix consolidé est affiché à titre indicatif uniquement.",
  defRatio: "Ratio : valeur des pools divisée par la capitalisation.",
  defLockedShare:
    "Part verrouillée m : déduite du ratio retenu, le plus bas entre le ratio actuel et la moyenne sur 24 h.",
};

export default fr;
