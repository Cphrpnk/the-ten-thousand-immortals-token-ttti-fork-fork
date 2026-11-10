import type en from "./en";

const ptBR: typeof en = {
  // Page
  title: "Carteira",
  intro: "Conecte sua carteira, consulte seus saldos e envie ou receba tokens.",
  activeIdentity: "Identidade ativa",
  connectedWith: (source: string) => `Conectado com ${source}`,
  noWalletYet: "Nenhuma carteira conectada ainda",
  account: "Conta",
  notConnected: "Não conectado",
  copy: "Copiar",
  signOutIi: "Sair do II",
  connectIi: "Conectar Internet Identity",
  disconnectPlug: "Desconectar Plug",
  connectPlug: "Conectar Plug",
  plugNotDetected:
    "Extensão Plug não detectada. Instale o Plug para conectar uma carteira de navegador.",
  balances: "Saldos",
  tokensUnavailable:
    "Lista de tokens indisponível. Os ledgers não responderam.",
  retry: "Tentar novamente",
  noTokens: "Ainda não há tokens disponíveis para esta carteira.",
  toastAccountCopiedClipboard: "Conta copiada para a área de transferência",
  toastCopyFailed: "Não foi possível copiar a conta",
  toastPlugConnected: "Carteira Plug conectada",
  toastPlugConnectFailed: "Não foi possível conectar o Plug",
  toastPlugDisconnected: "Carteira Plug desconectada",
  disconnectWallet: (name: string) => `Desconectar ${name}`,
  toastWalletDisconnected: (name: string) => `${name} desconectado`,
  toastIiSignedOut: "Sessão do Internet Identity encerrada",
  // Token balance card
  refreshBalance: (symbol: string) => `Atualizar saldo de ${symbol}`,
  connectToViewBalance: "Conecte uma carteira para ver este saldo.",
  balanceUnavailable: "Saldo indisponível. O ledger não respondeu.",
  // Send panel
  send: "Enviar",
  sending: "Enviando…",
  sendDescription: "Envie tokens da sua carteira conectada.",
  token: "Token",
  selectToken: "Selecione um token",
  recipientPrincipal: "Principal do destinatário",
  amount: "Valor",
  fee: "Taxa:",
  balanceSuffix: (amount: string, symbol: string) =>
    ` · Saldo: ${amount} ${symbol}`,
  sendConnectHint:
    "Entre com Internet Identity ou conecte OISY, NFID Wallet ou Plug para enviar tokens.",
  errConnectWallet: "Conecte uma carteira antes de enviar.",
  errSelectToken: "Selecione um token para enviar.",
  errRecipient: "Informe um principal de destinatário válido.",
  errAmount: (symbol: string) => `Informe um valor de ${symbol} válido.`,
  errInsufficient: (symbol: string, have: string, need: string) =>
    `Saldo de ${symbol} insuficiente. Você tem ${have} ${symbol}, mas precisa de ${need} ${symbol}, incluindo a taxa.`,
  errTransferFailed: "Não foi possível concluir a transferência.",
  errBadFee: "O ledger recusou a taxa. Atualize e tente novamente.",
  errInsufficientFunds: "Saldo insuficiente para esta transferência.",
  errTooOld: "A transferência expirou. Tente novamente.",
  errCreatedInFuture:
    "O registro de data e hora da transferência é inválido. Tente novamente.",
  errDuplicate: "Esta transferência já foi enviada.",
  errTemporarilyUnavailable:
    "O ledger está temporariamente indisponível. Tente novamente em breve.",
  errGeneric: "O ledger recusou a transferência.",
  sentSuccess: (amount: string, symbol: string, to: string) =>
    `${amount} ${symbol} enviados para ${to}.`,
  toastSent: (symbol: string) => `${symbol} enviados`,
  // Receive panel
  receive: "Receber",
  receiveDescription: "Compartilhe sua conta para receber tokens.",
  receiveConnectHint: "Conecte uma carteira para ver sua conta.",
  copied: "Copiado",
  copyAccount: "Copiar conta",
  receivingTo: (symbol: string) => `Recebendo ${symbol} nesta conta.`,
  toastAccountCopied: "Conta copiada",
  // BTC → ckBTC panel
  btcFact: (minDeposit: string, confirmations: string) =>
    `Depósito mínimo ${minDeposit} · ${confirmations} confirmações de Bitcoin · os ckBTC chegam à sua carteira, sem taxa do app, sem criação de TTTI-T.`,
  btcCreditedTo: (wallet: string) =>
    `Os ckBTC deste endereço são creditados em ${wallet}.`,
  btcWalletBalance: (wallet: string) => `Saldo de ckBTC de ${wallet}`,
  btcSignatureEachCheck: (wallet: string) =>
    `${wallet} pede uma assinatura a cada verificação.`,
  btcBalanceUnavailable: "Indisponível",
  btcAddressLabel: "Seu endereço Bitcoin",
  btcGetAddress: "Obter meu endereço Bitcoin",
  // Delivery address reminder
  deliveryTitle: "Nenhum endereço de entrega salvo",
  deliveryBody: (symbol: string) =>
    `Se quiser, adicione o Principal ID que receberá mais tarde seus tokens ${symbol}. Você pode alterá-lo a qualquer momento.`,
  deliveryAdd: "Adicionar endereço de entrega",
  // Purchase history
  historyTitle: "Histórico de compras",
  historyDate: "Data",
  historyStatus: "Status",
  historyPaidToken: "Token pago",
  historyPaid: "Quantidade paga (taxa incluída)",
  historyFee: "Taxa",
  historyNet: "Valor líquido trocado (sem a taxa)",
  historyReceived: "TTTI-T recebidos",
  historyRatioTttiPerPaid: "TTTI-T por 1 token pago",
  historyRatioPaidPerTtti: "Token pago por 1 TTTI-T",
  historyStatusCompleted: "Concluída",
  historyStatusFailed: "Falhou",
  historyStatusRefunded: "Reembolsada",
  historyStatusRefundFailed: "Falha no reembolso",
  historyStatusRefundReview: "Reembolso em verificação",
  historyShowDetails: "Mostrar detalhes",
  historyHideDetails: "Ocultar detalhes",
  historyRecipient: "Endereço do destinatário",
  historyPaymentBlock: "Bloco de pagamento",
  historyMintBlock: "Bloco de criação",
  historyUnavailable: "Indisponível",
  historyEmpty: "Nenhuma compra ainda.",
  historyLoading: "Carregando o histórico de compras…",
  historyError: "Histórico de compras indisponível. O canister não respondeu.",
  // Summary, token list and history (OISY-like layout)
  totalValue: "Valor total",
  swap: "Trocar",
  tokens: "Tokens",
  priceHourlyAverage: "preço consolidado",
  refreshPrice: "Atualizar o preço consolidado do TTTI-T",
  totalNote:
    "O TTTI-T é avaliado ao preço consolidado (média da hora), relido quando você o atualiza. Tokens sem cotação em USD não são contabilizados.",
  reserveLink: "Resgatar TTTI-T da reserva comum",
  tttiUnvalued:
    "O preço consolidado está indisponível, portanto o TTTI-T não é avaliado.",
  historyButton: "Histórico",
  buy: "Comprar",
  advancedTransfer: "Transferência avançada",
  toastBuyCopied: "Endereço copiado — cole no Onramper",
  tokenActions: (symbol: string) => `Ações de ${symbol}`,
  tokenHistoryTitle: (symbol: string) => `Histórico de ${symbol}`,
  walletHistoryTitle: "Histórico",
  movementsTitle: "Movimentações de TTTI-T",
  movementSent: "Enviado",
  movementReceived: "Recebido",
  movementMinted: "Criado",
  movementApproval: "Autorização",
  movementFrom: "De",
  movementTo: "Para",
  movementsEmpty: "Nenhuma movimentação de TTTI-T ainda.",
  movementsLoading: "Carregando as movimentações de TTTI-T…",
  movementsError:
    "Movimentações de TTTI-T indisponíveis. O ledger não respondeu.",
  movementsConnect: "Conecte uma carteira para ver as movimentações de TTTI-T.",
  pagePrevious: "Anterior",
  pageNext: "Próxima",
  pageNumber: (page: string) => `Página ${page}`,
  purchasesNeedIi:
    "O histórico de compras está disponível com o Internet Identity.",
  purchasesPaidWith: (symbol: string) => `Compras pagas com ${symbol}`,
  accountOnDashboard: (symbol: string) =>
    `Sua conta ${symbol} no ICP Dashboard`,
};

export default ptBR;
