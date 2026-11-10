import type en from "./en";

const fr: typeof en = {
  block: "Bloc",
  blockLabel: (block: string) => `Bloc #${block}`,
  linkedBlock: "Bloc lié",
  linkedBlockNotOnPage: "Le bloc lié n'est pas sur cette page.",
  showLinkedBlock: "Afficher le bloc lié",
};

export default fr;
