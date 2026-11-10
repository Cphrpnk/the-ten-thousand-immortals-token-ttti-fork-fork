import type en from "./en";

const ptBR: typeof en = {
  getIcpAria: "Adicionar ICP",
  getIcpAdd: "Adicione",
  getIcpAddToBuy: "Adicione ICP para cunhar",
  getIcpBuyAria:
    "Comprar ICP na Onramper (copia seu endereço, abre em uma nova aba)",
  getIcpBuy: "Comprar ICP",
  getIcpCopyAria: "Copiar o endereço da carteira",
  getIcpCopied: "Endereço copiado",
  getIcpCopyFailed: "Falha ao copiar — clique no endereço",
  getIcpBalance: (amount: string) => `Saldo: ${amount} ICP`,
  migrationTitle: (symbol: string) =>
    `Seu ${symbol} precisará ser migrado no lançamento`,
  migrationBody:
    "Adicione um endereço de carteira para recebê-los automaticamente. Você ainda pode comprar agora sem ele.",
  migrationStep1Title: "Criar uma carteira",
  migrationStep1Body: "Abra o Plug, o NNS ou o OISY e crie uma carteira.",
  migrationStep2Title: "Copiar o Principal ID correto",
  migrationStep2Body:
    "Copie o Principal ID — não o account ID de 64 caracteres.",
  migrationStep3Title: "Colar aqui",
  migrationStep3Body: "Cole-o no campo de endereço de entrega abaixo e salve.",
  opensNewTab: "(abre em uma nova aba)",
  migrationAdd: "Adicionar endereço",
  migrationLater: "Mais tarde",
  orderLegend: "Valor da ordem",
  orderAmountIn: (symbol: string) => `Valor em ${symbol}`,
  orderAmountTtti: "Quantidade em TTTI-T",
  payWith: "Pagar com",
  unavailable: "Indisponível",
  maxSupply: "Oferta máxima",
  totalSupply: "Oferta total",
  remaining: "Restante",
  supplyValueNote:
    "Os equivalentes em USD usam o preço consolidado do TTTI-T (média da hora).",
  complete: "Encerrada",
  paused: "Pausada",
  live: "Em andamento",
  maxReached: "Oferta máxima atingida",
  maxReachedBody: (max: string, symbol: string) =>
    `A oferta total atingiu a oferta máxima de ${max} ${symbol}. As compras estão encerradas.`,
  salesPaused: "As vendas estão pausadas",
  pausedBody:
    "As compras estão temporariamente desativadas. Volte a consultar em breve.",
  totalSupplyPercent: (percent: string) => `Oferta total ${percent}%`,
  progressAria: (percent: string) =>
    `Oferta total: ${percent}% da oferta máxima`,
  reserved: (amount: string, symbol: string) =>
    `${amount} ${symbol} estão reservados por compras em andamento.`,
  never: "Nunca",
  noRate: (symbol: string) =>
    `Nenhuma cotação ${symbol}/USD válida para esta hora`,
  unavailableUntilRate: (symbol: string) =>
    `As compras em ${symbol} ficam indisponíveis até que uma cotação seja definida.`,
  oneBuys: (symbol: string) => `1 ${symbol} compra`,
  source: "Fonte",
  fetched: "Obtido em",
  minimum: "Mínimo",
  treasury: "Tesouraria",
  notConfigured: "Não configurada",
  treasuryCopied: (symbol: string) => `Conta ${symbol} da tesouraria copiada`,
  treasuryCopy: (symbol: string) => `Copiar a conta ${symbol} da tesouraria`,
  percentConnect: "Conecte uma carteira para usar a barra.",
  percentBalanceUnavailable: "Saldo indisponível.",
  percentNotCover: (fees: string) =>
    `O saldo não cobre as taxas de rede de ${fees}.`,
  percentShare: (symbol: string) => `Parte do saldo de ${symbol} da carteira`,
  percentSummary: (percent: string, amount: string, ttti: string) =>
    `${percent}% = ${amount} · você recebe ${ttti} TTTI-T`,
  percentComputedOn: (fees: string) =>
    `Calculado sobre o saldo menos ${fees} de taxas de rede.`,
};

export default ptBR;
