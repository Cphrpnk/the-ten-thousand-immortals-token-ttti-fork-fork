import type en from "./en";

const fr: typeof en = {
  mint: "Frapper du TTTI-T",
  btcCopied: "Adresse BTC copiée — collez-la dans Onramper",
  btcPending:
    "Votre adresse BTC est en cours de création dans le panneau BTC → ckBTC. Copiez-la depuis ce panneau dans Onramper.",
  stableNote: (symbol: string) =>
    `Onramper vend de l'ICP vers cette adresse. Une fois l'ICP arrivé, échangez-le contre du ${symbol}.`,
  stableNoteLink: (symbol: string) => `Échanger ICP → ${symbol}`,
  close: "Fermer",
};

export default fr;
