import type en from "./en";

const ptBR: typeof en = {
  title: "Leilão",
  intro:
    "Leilão de lances selados do TTTI-T devolvido. Os lances são firmes e ficam ocultos para todos, exceto para o autor. Cada licitante paga o próprio lance. Vencem os maiores lances, em ordem de preço, até que o lote seja vendido.",
  loading: "Carregando o leilão…",
  loadError: "Não foi possível carregar o leilão.",
  retryButton: "Tentar novamente",
  summaryTitle: "Leilão aberto",
  lotSize: "Tamanho do lote",
  closesAt: "Horário de encerramento",
  timeLeft: "Tempo restante",
  closingReached: "O horário de encerramento foi atingido.",
  reserveHeading: "Preço de reserva",
  reserveUsd: "Preço de reserva atual por TTTI-T",
  reserveEquivalents:
    "Equivalente por TTTI-T em cada token de pagamento à taxa atual",
  reserveRule:
    "O preço de reserva é o maior entre 10.000 USD por TTTI-T, a média de 24 horas do preço consolidado do TTTI-T e o preço consolidado atual do TTTI-T. Nenhum lance abaixo dele passa e nada é reemitido abaixo de 10.000 USD: o lote permanece no contrato.",
  componentsHeading: "Valores comparados",
  floorLabel: "Piso fixo por TTTI-T",
  dailyAverageLabel: "Média de 24 horas do preço consolidado",
  currentLabel: "Preço consolidado atual",
  appliedBadge: "Aplicado",
  bindingFloor: "O piso fixo é o valor mais alto e define o preço de reserva.",
  bindingDailyAverage:
    "A média de 24 horas é o valor mais alto e define o preço de reserva.",
  bindingConsolidated:
    "O preço consolidado atual é o valor mais alto e define o preço de reserva.",
  unavailableNote: "Um valor que não está disponível fica fora da comparação.",
  reserveSettlementNote:
    "A parte de mercado do preço de reserva ignora as variações de preço causadas pelo agrupamento dos vencedores em pool na liquidação.",
  rateUnavailable: "Sem taxa no momento",
  consolidatedLabel: "Preço consolidado do TTTI-T",
  consolidatedUnavailable: "Indisponível",
  reserveBadge: "Reserva comum",
  reserveSentence:
    "10.000 USD × q do depósito de cada vencedor vão para a reserva comum.",
  emptyTitle: "Nenhum leilão está aberto",
  emptyBody:
    "Um leilão dura 24 horas. Ele pode ser aberto quando há TTTI-T devolvido aguardando em um lote.",
  nextLot: "Próximo lote",
  nextLotNone: "Não há TTTI-T devolvido aguardando em um lote.",
  openButton: "Abrir o leilão",
  openingButton: "Abrindo…",
  openErrorAlreadyOpen: "Já há um leilão aberto.",
  openErrorEmptyLot: "Não há TTTI-T devolvido para colocar em um lote.",
  openErrorPaused: "O leilão está em pausa.",
  openErrorUnexpected: "Não foi possível abrir o leilão. Tente novamente.",
  formTitle: "Fazer um lance",
  formIntro:
    "Um lance é firme: não pode ser retirado nem modificado. O depósito completo é cobrado quando o lance é feito.",
  tokenLegend: "Token de pagamento",
  quantityLabel: "Quantidade (TTTI-T)",
  quantityHint: (minimum: string) =>
    `Mínimo de ${minimum} TTTI-T, até 8 casas decimais.`,
  priceLabel: (symbol: string) => `Preço por TTTI-T (${symbol})`,
  priceHint: "Preço no token escolhido, por um TTTI-T inteiro.",
  depositLabel: (symbol: string) => `Depósito (${symbol}, opcional)`,
  depositHint:
    "Deixe em branco para depositar o valor exigido. Um depósito maior que o exigido oculta o tamanho do orçamento.",
  requiredDepositLabel: "Depósito exigido",
  requiredDepositFormula:
    "(preço + 10.000 USD) × quantidade ÷ 0,99, arredondado para cima",
  splitHeading:
    "Divisão do depósito de um vencedor ao preço B para q TTTI-T, com a parte bloqueada m e a escolha do restante A ou B",
  splitReserve: "Reserva comum (10.000 USD × q)",
  splitPosition: "Posição do vencedor ao preço B (zap)",
  splitCreator: "Criador (1 % do valor pago)",
  splitShare: "Parte bloqueada m",
  splitLocked: "Parte bloqueada (3 meses)",
  splitHand: "TTTI-T entregues à carteira",
  splitChoicePayment: (choice: string) =>
    `Pagamento para a escolha ${choice} com o m atual`,
  splitShareNote:
    "m é tomado na liquidação: se mudar após esta cotação, vale o valor da liquidação.",
  reserveKeptNote: "A parte da reserva é mantida como está no token pago.",
  depositSentLabel: "Depósito enviado",
  requiredDepositPending: "Informe uma quantidade e um preço.",
  errQuantity: "Informe uma quantidade com no máximo 8 casas decimais.",
  errQuantityMin: (minimum: string) =>
    `A quantidade mínima é ${minimum} TTTI-T.`,
  errPrice: (decimals: string) =>
    `Informe um preço maior que zero com no máximo ${decimals} casas decimais.`,
  errDeposit: (decimals: string) =>
    `Informe um depósito com no máximo ${decimals} casas decimais.`,
  errDepositBelow: (required: string) =>
    `O depósito não pode ser menor que o depósito exigido (${required}).`,
  submitButton: "Fazer o lance",
  approvingButton: "Aguardando a assinatura…",
  sendingButton: "Enviando o lance…",
  successMessage: "Lance registrado.",
  approvalFailed: (detail: string) => `A aprovação não foi assinada: ${detail}`,
  unexpectedError: "Não foi possível enviar o lance. Tente novamente.",
  signInPrompt: "Entre para fazer um lance.",
  blockSaleLabel: "Tipo de venda",
  blockSaleValue: "Venda em bloco",
  blockSaleBadge: "Venda em bloco",
  blockSaleRule:
    "Este lote é uma venda em bloco: o melhor preço por TTTI-T vence o lote inteiro. Aplica-se o mesmo preço de reserva; um lance abaixo dele não passa.",
  blockQuantityLabel: "Quantidade (lote inteiro, TTTI-T)",
  blockQuantityHint: (lot: string) =>
    `A quantidade é o lote inteiro: ${lot} TTTI-T. É fixa.`,
  blockPriceHint:
    "Um único preço por TTTI-T, para o lote inteiro. O melhor preço vence o lote inteiro.",
  bidErrWholeLot: (lot: string) =>
    `Este lote é uma venda em bloco. O lance deve ser pelo lote inteiro: ${lot} TTTI-T.`,
  lotRemainderLabel: "Resto da cunhagem no lote",
  lotRemainderNote:
    "O resto da cunhagem faz parte do lote. Só é cunhado na liquidação, para o vencedor.",
  settleMinted: "TTTI-T cunhados na liquidação",
  outcomeMinted: (amount: string) => `Cunhados na liquidação: ${amount} TTTI-T`,
  mintEndedBadge: "Cunhagem encerrada",
  mintEndedTitle: "A cunhagem foi encerrada",
  mintEndedBody: (remainder: string) =>
    `O resto de ${remainder} TTTI-T passa para o primeiro lote do leilão. Só é cunhado na liquidação, para o vencedor.`,
  mintErrEnded:
    "A cunhagem foi encerrada. O resto passa para o primeiro lote do leilão e só é cunhado na liquidação, para o vencedor.",
  bidErrTooMany: (maximum: string) =>
    `O máximo de ${maximum} lances por pessoa foi atingido.`,
  bidErrInsufficientFunds: (balance: string, required: string) =>
    `Saldo insuficiente: saldo ${balance}, exigido ${required}.`,
  bidErrQuantityBelow: (minimum: string) =>
    `A quantidade está abaixo do mínimo de ${minimum} TTTI-T.`,
  bidErrInvalidPrice: "O preço deve ser maior que zero.",
  bidErrAnonymous: "Entre para fazer um lance.",
  bidErrLedger: (detail: string) => `Erro do ledger: ${detail}`,
  bidErrAllowance: (required: string, allowance: string) =>
    `A aprovação é insuficiente: exigido ${required}, aprovado ${allowance}.`,
  bidErrRateUnavailable: (symbol: string) =>
    `Nenhuma taxa ${symbol}/USD válida está disponível no momento. O lance não foi feito. Tente novamente mais tarde.`,
  bidErrNoOpen: "Nenhum leilão está aberto.",
  bidErrInProgress: "Outro lance seu está sendo processado.",
  bidErrDepositBelow: (deposited: string, required: string) =>
    `O depósito (${deposited}) é menor que o depósito exigido (${required}).`,
  bidErrPaused: "Os lances estão em pausa.",
  bidErrPriceBelowMinimum: (minimum: string) =>
    `O preço está abaixo do mínimo de ${minimum} por TTTI-T à taxa atual.`,
  bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
    `O preço oferecido (${bid} por TTTI-T) está abaixo do mínimo de ${minimum} por TTTI-T à taxa atual.`,
  bidErrDepositBelowFee: (fee: string, deposited: string) =>
    `O depósito (${deposited}) deve cobrir pelo menos a taxa do ledger (${fee}).`,
  priceMinimumHint: (minimum: string) =>
    `Preço mínimo: ${minimum} por TTTI-T à taxa atual.`,
  myOffersTitle: "Meus lances",
  privacyNote: "Os lances só são visíveis para o seu autor.",
  firmNote: "Os lances são firmes: esta lista é somente leitura.",
  offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
  myOffersEmpty: "Você não tem nenhum lance neste leilão.",
  colQuantity: "Quantidade (TTTI-T)",
  colPrice: "Preço por TTTI-T",
  colToken: "Token",
  colDeposit: "Depósito",
  colDate: "Data",
  closingPendingNotice:
    "O horário de encerramento passou. O encerramento aguarda uma taxa válida. Os lances de outras pessoas permanecem ocultos até o encerramento.",
  closedTitle: "Leilões encerrados",
  closedIntro:
    "Os mais recentes primeiro. Após o encerramento, o resultado e todos os lances são publicados.",
  closedEmpty: "Nenhum leilão foi encerrado ainda.",
  closedItemLabel: (id: string, date: string) =>
    `Leilão ${id} · encerrado em ${date}`,
  resultNotPublished: "O resultado ainda não foi publicado.",
  resultStatusLabel: "Situação",
  statusFullySold: "Vendido por completo",
  statusPartiallySold: "Vendido em parte",
  statusUnsold: "Não vendido",
  resultServedLabel: "Quantidade atendida",
  resultCarriedLabel: "Transferida para o próximo lote",
  resultOffersLabel: "Lances recebidos",
  resultClosedAtLabel: "Encerrado em",
  resultReserveHeading: "Reserva aplicada",
  resultReserveLabel: "Reserva aplicada por TTTI-T",
  resultRatesHeading: "Taxas usadas no encerramento",
  offersHeading: "Lances publicados",
  offersEmpty: "Nenhum lance foi feito neste leilão.",
  colBidder: "Autor do lance",
  colOutcome: "Resultado",
  colServed: "Quantidade atendida",
  colReturned: "Valor devolvido",
  colAuction: "Leilão",
  youBadge: "Você",
  outcomeServed: "Atendido",
  outcomePartiallyServed: "Atendido em parte",
  outcomeNotServed: "Não atendido",
  outcomeDiscarded: "Descartado abaixo da reserva",
  outcomePending: "Aguardando encerramento",
  outcomeDetail: (served: string, returned: string) =>
    `Atendido ${served} TTTI-T · devolvido ${returned}`,
  outcomeReturnedOnly: (returned: string) => `Devolvido ${returned}`,
  balanceTitle: "Meu saldo",
  balanceNote:
    "Os depósitos das quantidades atendidas aguardam liquidação. Os lances não atendidos, as partes não atendidas, o excesso dos depósitos e os depósitos das liquidações malsucedidas são devolvidos ao seu saldo DEX.",
  balanceEmpty: "Nenhum valor está registrado para a sua conta.",
  colAwaiting: "Aguardando liquidação",
  colReturnedBalance: "Devolvido ao saldo",
  balanceRecoverNote:
    "Os valores devolvidos estão no seu saldo DEX. Use ali o botão Recuperar para retirá-los. A parte de reserva de um vencedor permanece na reserva comum.",
  balanceRecoverLink: "Abrir o saldo DEX",
  balanceFailedNote: (count: string) =>
    `A liquidação de ${count} dos seus lances vencedores falhou: o depósito inteiro foi devolvido ao seu saldo DEX e a quantidade passou para o lote seguinte.`,
  colSettlement: "Liquidação",
  settlementPending: "Pendente",
  settlementSettled: "Liquidada",
  settlementFailed: "Malsucedida",
  settlementNotRequired: "Não necessária",
  settlementFailedCarried: (carried: string) =>
    `${carried} TTTI-T passam para o lote seguinte`,
  settlementSummaryLabel: "Liquidação dos vencedores",
  settlementSummary: (settled: string, pending: string, failed: string) =>
    `${settled} liquidadas · ${pending} pendentes · ${failed} malsucedidas`,
  settlementFailedCarriedLabel:
    "Passa para o lote seguinte após liquidações malsucedidas",
  settlementHeading: "Liquidação dos vencedores",
  settlementRule:
    "Para uma quantidade atendida q ao preço B, o vencedor paga (B + 10.000 USD) × q ÷ 0,99, retirados do depósito. 10.000 USD × q vão para a reserva comum, B × q e os q TTTI-T vão para a posição do vencedor (zap), e 1 % do valor pago vai para o criador. A parte da reserva é calculada em USD e mantida no token pago (ICP, ckBTC, ckUSDC ou ckUSDT), sem conversão. O restante do depósito é devolvido ao saldo DEX. Se a liquidação de um vencedor falhar, nenhuma posição é criada e nada é aportado à reserva comum, o depósito inteiro é devolvido ao saldo DEX e a quantidade passa para o lote seguinte. Os demais vencedores não são afetados.",
  settleTaken: "Valor retirado do depósito",
  settleCreator: "Parte do criador (1 %)",
  settlePosition: "Posição",
  settlePositionValue: (amount: string, quantity: string) =>
    `${amount} com ${quantity} TTTI-T`,
  settleReserve: "Reserva comum",
  settleSurplus: "Excesso do depósito devolvido ao saldo DEX",
  settleNoPosition: "Posição e parte da reserva",
  settleNone: "Nenhuma",
  settleDepositReturned: "Depósito inteiro devolvido ao saldo DEX",
  settleCarried: "Quantidade que passa para o lote seguinte",
  settleFailureReason: "Motivo",
};

export default ptBR;
