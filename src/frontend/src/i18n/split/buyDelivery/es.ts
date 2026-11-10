import type en from "./en";

const es: typeof en = {
  saved: "Dirección de entrega guardada.",
  saveFailed: "No se pudo guardar la dirección. Inténtelo de nuevo.",
  removed: "Dirección de entrega eliminada.",
  removeFailed: "No se pudo eliminar la dirección. Inténtelo de nuevo.",
  title: "Dirección del wallet de entrega",
  optional: "Opcional",
  recommended: "Recomendado",
  descPlug: (symbol: string) =>
    `Rellenada automáticamente con el principal de su Plug conectado. Su ${symbol} se acredita aquí.`,
  descIi: (symbol: string) =>
    `Rellenada automáticamente con su principal. Su ${symbol} se acredita aquí.`,
  descNone: (symbol: string) =>
    `No es necesaria para acuñar. Añada el Principal ID de un wallet que controle para que su ${symbol} llegue a él automáticamente en el lanzamiento.`,
  principalId: "Principal ID",
  placeholder: "p. ej. abcde-fghij-…-cai",
  save: "Guardar dirección",
  clear: "Borrar",
  savedAddress: "Dirección guardada",
  loadFailed:
    "No se pudo cargar su dirección guardada. Aun así puede introducir una arriba.",
  retry: "Reintentar",
  noneSaved:
    "Ninguna guardada: las compras se acreditan al principal con el que compra.",
};

export default es;
