import type en from "./en";

const es: typeof en = {
  loadMore: "Cargar más",
  loading: "Cargando…",
  loadingMore: "Cargando más…",
  noMoreResults: "No hay más resultados",
  empty: "Todavía no hay nada que mostrar.",
  loadError: "No se pudo cargar la lista.",
  loadMoreError: "No se pudieron cargar más resultados.",
  retry: "Reintentar",
  showing: (count: string) => `Mostrando ${count}`,
};

export default es;
