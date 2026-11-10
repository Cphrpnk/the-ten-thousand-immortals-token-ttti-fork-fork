import type en from "./en";

const ptBR: typeof en = {
  fallbackMessage:
    "Não foi possível concluir a compra para este destino. Verifique o destinatário e tente novamente.",
  server: (server: string) => server,
  reference: (id: string) => ` Referência: compra nº ${id}.`,
  contactTeam: " Entre em contato com a equipe informando esta referência.",
  refundedTitle: (symbol: string, fee: string) =>
    `A entrega falhou — seu ${symbol} foi reembolsado, descontada a taxa de ${fee}`,
  refundFailed: "A entrega falhou e o reembolso automático também falhou",
  refundedMessage: () =>
    "A entrega do TTTI-T falhou; o pagamento foi reembolsado, descontada a taxa do ledger.",
  refundFailedMessage: () =>
    "A entrega do TTTI-T falhou e o reembolso também falhou; esta compra exige acompanhamento manual.",
  salesPausedTitle: "As vendas estão pausadas",
  salesPausedMessage: () => "As compras estão temporariamente desativadas.",
  saleCompleteTitle: "Venda encerrada",
  saleCompleteMessage: () =>
    "Venda de TTTI-T encerrada: não resta TTTI-T para vender.",
  belowMinimumTitle: "Abaixo da compra mínima",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    requested: string,
  ) =>
    `O mínimo é ${minimum} ${display} (${minimumUsd} em ${symbol}); você solicitou ${requested} ${display}.`,
  aboveRemainingTitle: "Acima do valor restante",
  aboveRemainingMessage: (
    maximum: string,
    display: string,
    maximumPay: string,
    requested: string,
  ) =>
    `O máximo disponível é ${maximum} ${display} (${maximumPay}); você solicitou ${requested} ${display}.`,
  priceUnavailableTitle: (symbol: string) =>
    `Compra recusada: nenhuma cotação ${symbol}/USD válida está definida`,
  priceUnavailableMessage: (symbol: string) =>
    `Nenhum ${symbol} foi cobrado. As compras em ${symbol} ficam indisponíveis até que uma cotação seja definida.`,
  notConfiguredTitle: (symbol: string) => `${symbol} não está configurado`,
  notConfiguredMessage: (symbol: string) =>
    `A venda ainda não está configurada. Nenhum ${symbol} foi cobrado.`,
  ledgerMismatchTitle: (symbol: string) =>
    `Inconsistência no ledger de ${symbol}`,
  ledgerMismatchMessage: (
    symbol: string,
    actualDecimals: string,
    actualFee: string,
    expectedDecimals: string,
    expectedFee: string,
  ) =>
    `O ledger de ${symbol} informa ${actualDecimals} casas decimais e uma taxa de ${actualFee}; esperado: ${expectedDecimals} casas decimais e ${expectedFee}. Nenhum ${symbol} foi cobrado.`,
  ackRequiredTitle: "Confirmações de compra exigidas",
  ackRequiredMessage: (symbol: string) =>
    `Esta conta não aceitou as seis confirmações de compra. Nenhum ${symbol} foi cobrado.`,
  invalidAmountTitle: "Valor inválido",
  invalidAmountMessage: () =>
    "Este valor ou esta conta de entrega não pode ser aceito. Nada foi cobrado.",
  insufficientTitle: (symbol: string) => `Saldo de ${symbol} insuficiente`,
  insufficientMessage: (_server: string, balance: string) =>
    `O saldo não cobre esta compra. Saldo: ${balance}.`,
  approvalMissingTitle: (symbol: string) => `Aprovação de ${symbol} ausente`,
  approvalMissingMessage: (_server: string, allowance: string) =>
    `A autorização não cobre esta compra. Autorização atual: ${allowance}.`,
  inProgressTitle: "Compra já em andamento",
  inProgressMessage: (symbol: string) =>
    `Já há uma compra em andamento para esta conta. Aguarde a conclusão e tente novamente. Nenhum ${symbol} foi cobrado por esta solicitação.`,
  ledgerErrorTitle: (symbol: string) => `Erro no ledger de ${symbol}`,
  ledgerErrorMessage: () =>
    "Não foi possível acessar o ledger ou a operação falhou. Tente novamente.",
  signInTitle: "Entre para cunhar",
  signInMessage: () => "Entre na sua conta para cunhar TTTI-T.",
  notCompletedTitle: "Compra não concluída",
  failedTitle: "A compra falhou",
};

export default ptBR;
