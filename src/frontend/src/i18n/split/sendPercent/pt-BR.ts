import type en from "./en";

const ptBR: typeof en = {
  percentConnect: "Conecte uma carteira para usar a barra.",
  percentLoading: "Carregando o saldo…",
  percentBalanceUnavailable: "Saldo indisponível.",
  percentNotCover: (fee: string) =>
    `O saldo não cobre a taxa de rede de ${fee}.`,
  percentShare: (symbol: string) => `Parte do saldo de ${symbol} da carteira`,
  percentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  percentComputedOn: (fee: string) =>
    `Calculado sobre o saldo menos ${fee} de taxa de rede.`,
};

export default ptBR;
