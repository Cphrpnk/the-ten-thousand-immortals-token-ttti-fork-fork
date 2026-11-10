import type en from "./en";

const es: typeof en = {
  block: "Bloque",
  blockLabel: (block: string) => `Bloque #${block}`,
  linkedBlock: "Bloque enlazado",
  linkedBlockNotOnPage: "El bloque enlazado no está en esta página.",
  showLinkedBlock: "Mostrar el bloque enlazado",
};

export default es;
