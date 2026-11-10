import type en from "./en";

const es: typeof en = {
  heading: "Pool",
  legend: "Pool que recibe la liquidez",
  recommended: "Recomendado",
  feeTier: "Nivel de comisión",
  depth: "Profundidad",
  price: "Precio",
  gap: "Diferencia con el precio consolidado",
  selectedPool: "Pool elegido",
  poolLabel: (id: string) => `Pool n.º ${id}`,
  single: (fee: string) => `Pool único, nivel de comisión ${fee}`,
  selectPrompt: "Elija un pool para continuar.",
  noPool:
    "No hay ningún pool disponible para este token. La acuñación no está disponible.",
  loading: "Cargando los pools…",
  loadError: "No se pudieron cargar los pools.",
  retry: "Reintentar",
  fallbackNotice:
    "El pool que eligió ya no está disponible. Se ha seleccionado el pool recomendado.",
  errUnknownPool: "El pool elegido no existe. Elija un pool de nuevo.",
  errOtherPair:
    "El pool elegido no es un pool de este token. Elija un pool de nuevo.",
  errPoolRemoved: "El pool elegido ha sido retirado. Elija un pool de nuevo.",
  errPoolRemovalAnnounced: (date: string) =>
    `La retirada del pool elegido está anunciada para el ${date}. Elija un pool de nuevo.`,
};

export default es;
