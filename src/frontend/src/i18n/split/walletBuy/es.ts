import type en from "./en";

const es: typeof en = {
  mint: "Acuñar TTTI-T",
  btcCopied: "Dirección BTC copiada: pégala en Onramper",
  btcPending:
    "Su dirección BTC se está creando en el panel BTC → ckBTC. Cópiela desde allí en Onramper.",
  stableNote: (symbol: string) =>
    `Onramper vende ICP a esta dirección. Cuando el ICP haya llegado, intercámbielo por ${symbol}.`,
  stableNoteLink: (symbol: string) => `Intercambiar ICP → ${symbol}`,
  close: "Cerrar",
};

export default es;
