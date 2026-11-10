import type en from "./en";

const fr: typeof en = {
  percentConnect: "Connectez un wallet pour utiliser la barre.",
  percentLoading: "Chargement du solde…",
  percentBalanceUnavailable: "Solde indisponible.",
  percentNotCover: (fee: string) =>
    `Le solde ne couvre pas les frais de réseau de ${fee}.`,
  percentShare: (symbol: string) => `Part du solde ${symbol} du wallet`,
  percentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  percentComputedOn: (fee: string) =>
    `Calculé sur le solde moins ${fee} de frais de réseau.`,
};

export default fr;
