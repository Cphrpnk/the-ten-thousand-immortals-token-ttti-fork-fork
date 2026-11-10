import type en from "./en";

const ptBR: typeof en = {
  heading: "Pool",
  legend: "Pool que recebe a liquidez",
  recommended: "Recomendado",
  feeTier: "Faixa de taxa",
  depth: "Profundidade",
  price: "Preço",
  gap: "Diferença em relação ao preço consolidado",
  selectedPool: "Pool escolhido",
  poolLabel: (id: string) => `Pool n.º ${id}`,
  single: (fee: string) => `Pool único, faixa de taxa ${fee}`,
  selectPrompt: "Escolha um pool para continuar.",
  noPool:
    "Nenhum pool está disponível para este token. A cunhagem está indisponível.",
  loading: "Carregando os pools…",
  loadError: "Não foi possível carregar os pools.",
  retry: "Tentar novamente",
  fallbackNotice:
    "O pool que você escolheu não está mais disponível. O pool recomendado foi selecionado.",
  errUnknownPool: "O pool escolhido não existe. Escolha um pool novamente.",
  errOtherPair:
    "O pool escolhido não é um pool deste token. Escolha um pool novamente.",
  errPoolRemoved: "O pool escolhido foi removido. Escolha um pool novamente.",
  errPoolRemovalAnnounced: (date: string) =>
    `A remoção do pool escolhido está anunciada para ${date}. Escolha um pool novamente.`,
};

export default ptBR;
