import type en from "./en";

const es: typeof en = {
  percentConnect: "Conecte un wallet para usar la barra.",
  percentLoading: "Cargando el saldo…",
  percentBalanceUnavailable: "Saldo no disponible.",
  percentNotCover: (fee: string) =>
    `El saldo no cubre la comisión de red de ${fee}.`,
  percentShare: (symbol: string) => `Parte del saldo ${symbol} del wallet`,
  percentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  percentComputedOn: (fee: string) =>
    `Calculado sobre el saldo menos ${fee} de comisión de red.`,
};

export default es;
