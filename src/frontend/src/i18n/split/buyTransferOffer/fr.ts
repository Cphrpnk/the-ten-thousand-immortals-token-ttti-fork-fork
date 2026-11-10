import type en from "./en";

const fr: typeof en = {
  aria: (symbol: string) => `Transférer du ${symbol} vers ce wallet`,
  zeroBalance: (symbol: string) => `Votre solde ${symbol} est de 0.`,
  transferTo: (symbol: string) =>
    `Transférez du ${symbol} vers cette adresse de wallet pour frapper.`,
  transferOrBuy: (symbol: string) =>
    `Transférez du ${symbol} vers l'adresse de wallet ci-dessous, ou achetez du ${symbol}.`,
  copyAria: "Copier l'adresse du wallet",
  copied: "Adresse copiée",
  copyFailed: "Échec de la copie. Sélectionnez l'adresse et copiez-la.",
};

export default fr;
