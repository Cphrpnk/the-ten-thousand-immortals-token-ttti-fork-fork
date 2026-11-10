import type en from "./en";

const es: typeof en = {
  aria: (symbol: string) => `Transferir ${symbol} a este wallet`,
  zeroBalance: (symbol: string) => `Su saldo de ${symbol} es 0.`,
  transferTo: (symbol: string) =>
    `Transfiera ${symbol} a esta dirección de wallet para acuñar.`,
  transferOrBuy: (symbol: string) =>
    `Transfiera ${symbol} a la dirección de wallet de abajo, o compre ${symbol}.`,
  copyAria: "Copiar la dirección del wallet",
  copied: "Dirección copiada",
  copyFailed: "Error al copiar. Seleccione la dirección y cópiela.",
};

export default es;
