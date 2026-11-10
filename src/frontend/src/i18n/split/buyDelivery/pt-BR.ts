import type en from "./en";

const ptBR: typeof en = {
  saved: "Endereço de entrega salvo.",
  saveFailed: "Não foi possível salvar o endereço. Tente novamente.",
  removed: "Endereço de entrega removido.",
  removeFailed: "Não foi possível remover o endereço. Tente novamente.",
  title: "Endereço da carteira de entrega",
  optional: "Opcional",
  recommended: "Recomendado",
  descPlug: (symbol: string) =>
    `Preenchido automaticamente com o principal do seu Plug conectado. Seu ${symbol} é creditado aqui.`,
  descIi: (symbol: string) =>
    `Preenchido automaticamente com o seu principal. Seu ${symbol} é creditado aqui.`,
  descNone: (symbol: string) =>
    `Não é necessário para cunhar. Adicione o Principal ID de uma carteira que você controla para que seu ${symbol} chegue a ela automaticamente no lançamento.`,
  principalId: "Principal ID",
  placeholder: "ex.: abcde-fghij-…-cai",
  save: "Salvar endereço",
  clear: "Limpar",
  savedAddress: "Endereço salvo",
  loadFailed:
    "Não foi possível carregar seu endereço salvo. Você ainda pode inserir um acima.",
  retry: "Tentar novamente",
  noneSaved:
    "Nenhum salvo — as compras são creditadas ao principal com o qual você compra.",
};

export default ptBR;
