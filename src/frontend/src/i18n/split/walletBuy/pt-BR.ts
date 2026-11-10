import type en from "./en";

const ptBR: typeof en = {
  mint: "Cunhar TTTI-T",
  btcCopied: "Endereço BTC copiado — cole no Onramper",
  btcPending:
    "Seu endereço BTC está sendo criado no painel BTC → ckBTC. Copie-o de lá para o Onramper.",
  stableNote: (symbol: string) =>
    `O Onramper vende ICP para este endereço. Quando o ICP chegar, troque-o por ${symbol}.`,
  stableNoteLink: (symbol: string) => `Trocar ICP → ${symbol}`,
  close: "Fechar",
};

export default ptBR;
