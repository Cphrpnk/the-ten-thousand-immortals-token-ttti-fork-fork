import type en from "./en";

const ptBR: typeof en = {
  aria: (symbol: string) => `Transferir ${symbol} para esta carteira`,
  zeroBalance: (symbol: string) => `Seu saldo de ${symbol} é 0.`,
  transferTo: (symbol: string) =>
    `Transfira ${symbol} para este endereço de carteira para cunhar.`,
  transferOrBuy: (symbol: string) =>
    `Transfira ${symbol} para o endereço de carteira abaixo, ou compre ${symbol}.`,
  copyAria: "Copiar o endereço da carteira",
  copied: "Endereço copiado",
  copyFailed: "Falha ao copiar. Selecione o endereço e copie-o.",
};

export default ptBR;
