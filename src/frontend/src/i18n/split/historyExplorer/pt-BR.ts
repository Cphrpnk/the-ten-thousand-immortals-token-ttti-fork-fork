import type en from "./en";

const ptBR: typeof en = {
  block: "Bloco",
  blockLabel: (block: string) => `Bloco #${block}`,
  linkedBlock: "Bloco vinculado",
  linkedBlockNotOnPage: "O bloco vinculado não está nesta página.",
  showLinkedBlock: "Mostrar o bloco vinculado",
};

export default ptBR;
