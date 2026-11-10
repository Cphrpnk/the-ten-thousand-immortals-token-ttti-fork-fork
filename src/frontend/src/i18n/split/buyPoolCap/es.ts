import type en from "./en";

const es: typeof en = {
  title: "Valor de los pools y capitalización",
  loading: "Cargando…",
  loadError: "No se pudieron cargar las cifras.",
  retry: "Reintentar",
  notAvailable: "No disponible",
  poolsValue: "Valor de los pools",
  capitalisation: "Capitalización",
  currentRatio: "Ratio actual",
  averageRatio: "Ratio medio de 24 horas",
  targetRatio: "Ratio objetivo",
  lockedShare: "Parte bloqueada m",
  samples: (count: string) => `${count} muestras`,
  computedAt: (date: string) => `Calculado el ${date}`,
  noteNoPoolsValue:
    "Sin valor de los pools: ningún pool TTTI-T abierto o ninguna tasa válida.",
  noteNoCapitalisation: "No hay capitalización disponible.",
  referencePrice:
    "Precio de referencia de la capitalización por TTTI-T (objetivo)",
  referencePriceNote:
    "La capitalización y el valor de los pools se miden con el objetivo de 10.000 USD por TTTI-T.",
  consolidatedInfo: "Precio consolidado por TTTI-T (solo informativo)",
  noteNoRatio: "Requiere el valor de los pools y la capitalización.",
  noteNoAverage: "Todavía no hay muestras del ratio.",
  noteLockedDefault:
    "Aún no hay ratio retenido: la parte bloqueada es el máximo, 50 %.",
  definitionsToggle: "Definiciones",
  defPoolsValue:
    "Valor de los pools: 2 veces la reserva de contrapartida de cada pool TTTI-T, a las tasas del oráculo. El valor de los pools se mide con el objetivo de 10.000 USD por TTTI-T.",
  defCapitalisation:
    "Capitalización: TTTI-T en circulación multiplicado por el objetivo de 10.000 USD por TTTI-T, medido en el mismo momento que el valor de los pools. El precio consolidado se muestra solo a título informativo.",
  defRatio: "Ratio: valor de los pools dividido por la capitalización.",
  defLockedShare:
    "Parte bloqueada m: derivada del ratio retenido, el menor entre el ratio actual y la media de 24 horas.",
};

export default es;
