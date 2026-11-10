import type en from "./en";

const ptBR: typeof en = {
  priceStatement:
    "Preço: 10.000 USD por TTTI-T, resgatável por 10.000 USD a qualquer momento. Para q TTTI-T, o valor a pagar é (10.000 USD + a liquidez que você aporta) × q ÷ 0,99, em ICP, ckBTC, ckUSDC ou ckUSDT. Mínimo: 0,0001 TTTI-T.",
  modeLegend: "Entrada do valor",
  modeTtti: "Valor em TTTI-T",
  modeUsd: "Valor em dólares",
  tttiLabel: "TTTI-T a cunhar",
  tttiHint: "Mínimo de 0,0001 TTTI-T, até 8 casas decimais.",
  usdLabel: "Valor a pagar, em dólares",
  usdHint:
    "Valor em dólares do pagamento. A quantidade de TTTI-T é arredondada para baixo, com 8 casas decimais.",
  invalidTtti:
    "Informe um valor em TTTI-T com até 8 casas decimais. Ponto ou vírgula são aceitos.",
  invalidUsd:
    "Informe um valor em dólares maior que 0, com até 8 casas decimais. Ponto ou vírgula são aceitos.",
  previewHeading: "Prévia",
  previewIdle: "Informe um valor para ver a prévia.",
  previewLoading: "Calculando a prévia…",
  rowMinted: "TTTI-T cunhados",
  rowPay: "Você paga",
  splitHeading: "Divisão do pagamento",
  rowPosition: "Posição de liquidez",
  rowGuarantee: "Reserva comum",
  rowFee: "Taxa: 1 %",
  rowPrice: "Preço",
  priceValue:
    "10.000 USD por TTTI-T, resgatável por 10.000 USD a qualquer momento",
  rowLiquidity: "Liquidez que você aporta",
  liquidityNote: "continua sendo sua, na sua posição",
  holdingsHeading: "Você possui após o mint",
  rowLocked: "Parte bloqueada",
  rowHand: "TTTI-T em mãos",
  lockedShareLabel: "Parte bloqueada m",
  lockedShareNote:
    "m é a parte da posição bloqueada por 3 meses. Ela é tomada no momento do pagamento: se mudar após esta prévia, vale o valor do momento do pagamento.",
  choiceLegend: "Escolha do restante (1 − m)",
  choicePoolTitle: "A · Colocar o restante no pool",
  choicePoolText: "O restante é colocado no pool na sua posição, sem bloqueio.",
  choiceWalletTitle: "B · Manter na carteira",
  choiceWalletText:
    "O restante fica na sua carteira como TTTI-T; a liquidez correspondente não é paga.",
  paymentRule:
    "Pagamento: (10.000 USD + a liquidez que você aporta) × q ÷ 0,99, arredondado para cima. 10.000 USD × q vão para a reserva comum e 1 % do valor pago vai para o criador. O restante é a liquidez que você aporta, que continua sendo sua na sua posição.",
  lockedRule:
    "Uma parte m da posição fica bloqueada por 3 meses. O restante (1 − m) segue a sua escolha: A coloca-o no pool sem bloqueio; B mantém os TTTI-T correspondentes na sua carteira.",
  rowDust: "Resto de arredondamento",
  poolPriceHeading: "Preço do pool visado, antes e depois do zap",
  priceBefore: "Antes",
  priceAfter: "Depois",
  emptyPool: "Pool vazio",
  consolidatedPriceHeading: "Preço consolidado (referência)",
  consolidatedPriceNote:
    "USD por TTTI-T: preço dos outros pools abertos, sem o pool alvo, ponderado pela profundidade deles.",
  poolPriceNote: "USD por TTTI-T no pool TTTI-T do token pago.",
  gapHeading: "Diferença entre o preço do pool e o preço de referência",
  gapUnavailable: "Diferença indisponível",
  noIndependentReference: "Sem referência independente",
  firstDepositNote:
    "Pool vazio: o primeiro depósito é feito 1 para 1, a 10.000 USD por TTTI-T.",
  zapLabel: "Troca de equilíbrio",
  noZap: "Não é necessária uma troca de equilíbrio.",
  maxPayLabel: "Pagamento máximo nesta tolerância",
  expiryNote: "A cunhagem é recusada se não for executada em 5 minutos.",
  previewFailedTitle: "Prévia indisponível",
  mintFailedTitle: "Cunhagem não concluída",
  successTitle: (amount: string) => `${amount} cunhados`,
  successPaid: (pay: string, id: string) => `Pago ${pay} · cunhagem n.º ${id}`,
  successPosition: (id: string) => `Posição de liquidez n.º ${id}`,
  successHoldings: (token: string, ttti: string) =>
    `A posição contém ${token} e ${ttti}.`,
  successGuarantee: (amount: string) => `Reserva comum: ${amount}.`,
  successLink: "Ver minhas posições de liquidez",
  errAnonymous: "Entre ou conecte uma carteira para cunhar.",
  errRateUnavailable: (symbol: string) =>
    `Não há uma taxa ${symbol}/USD válida no momento. Nada foi cobrado. Tente novamente mais tarde.`,
  errBelowMinimum: (minimum: string, minimumUsd?: string) =>
    `O mínimo é ${minimum}${minimumUsd ? ` (${minimumUsd})` : ""}.`,
  errTooManyDecimals: (max: string, step: string) =>
    `Um valor em TTTI-T tem no máximo ${max} casas decimais (menor passo ${step}).`,
  errInvalidAmount: "Informe um valor maior que 0.",
  errAboveCap: (cap: string, remaining: string) =>
    `O limite total de ${cap} foi atingido ou seria ultrapassado. Restante: ${remaining}.`,
  errInsufficientBalance: (symbol: string, required: string, balance: string) =>
    `Saldo de ${symbol} insuficiente: ${required} necessários com as taxas do ledger, ${balance} disponíveis.`,
  errInsufficientAllowance: (
    symbol: string,
    required: string,
    allowance: string,
  ) =>
    `A aprovação de ${symbol} é baixa demais: ${required} exigidos, ${allowance} aprovados. Aprove novamente e tente de novo.`,
  errSlippageExceeded: (percent: string) =>
    `O preço do pool passou da tolerância de ${percent} %. Nada foi cunhado. Tente de novo ou aumente a tolerância.`,
  errInvalidSlippage: (percent: string) =>
    `A tolerância não pode passar de ${percent} %.`,
  errMaxPayExceeded: (pay: string, max: string) =>
    `O valor a pagar agora é ${pay}, acima do máximo de ${max} definido pela prévia. Atualize a prévia e tente de novo.`,
  errDeadlineExpired:
    "O prazo de 5 minutos passou antes da execução da cunhagem. Tente de novo.",
  errInProgress: "Já há uma cunhagem em andamento desta conta.",
  errAcknowledgements: "Aceite as declarações para cunhar.",
  errSalesPaused: "A cunhagem está pausada.",
  rateSourceMissing: "indisponível",
  errRateSourcesDiverge: (
    symbol: string,
    coinbase: string,
    coingecko: string,
    maxPercent: string,
  ) =>
    `A cunhagem foi recusada: as taxas da Coinbase e da CoinGecko para ${symbol} diferem em mais de ${maxPercent}% ou uma delas está ausente. Coinbase: ${coinbase}. CoinGecko: ${coingecko}. Nada foi cobrado.`,
  errDexPaused: "Os pools estão pausados. A cunhagem está indisponível.",
  errPoolRemoved: (symbol: string) => `O pool TTTI-T/${symbol} foi removido.`,
  errRemovalAnnounced: (symbol: string, date: string) =>
    `A remoção do pool TTTI-T/${symbol} foi anunciada para ${date}. A cunhagem nele está suspensa.`,
  errPoolNotFound: (symbol: string) => `Não existe um pool TTTI-T/${symbol}.`,
  errMinimumsNotSet: "Os mínimos do pool ainda não foram definidos.",
  errLedger: (symbol: string, message: string) =>
    `Erro do ledger de ${symbol}: ${message}`,
  errDepositRefunded: (id: string) =>
    `O depósito no pool falhou. O pagamento foi reembolsado, menos as taxas do ledger (cunhagem n.º ${id}).`,
  refundingTitle: "Pagamento em devolução",
  errDepositRefunding: (id: string) =>
    `O depósito no pool falhou. O pagamento está sendo devolvido e, enquanto isso, permanece no saldo da sua carteira (cunhagem n.º ${id}).`,
  errDepositRefundFailed: (id: string) =>
    `O depósito no pool falhou e o reembolso não foi concluído (cunhagem n.º ${id}). Guarde esta referência.`,
  errGeneric: "A cunhagem foi recusada.",
};

export default ptBR;
