import type en from "./en";

const ptBR: typeof en = {
  requestFailed: "Não foi possível concluir a solicitação. Tente novamente.",
  errorTitle: "Compra com Bitcoin",
  intro:
    "Envie BTC para o seu próprio endereço Bitcoin. Ele se torna ckBTC e depois TTTI-T à cotação horária. 1 % do valor vai para o criador.",
  recordingAcks: "Registrando as confirmações de compra…",
  creatingAddress: "Criando o endereço…",
  getAddress: "Obter meu endereço Bitcoin",
  tickAll: "Marque as seis declarações para obter seu endereço.",
  purchaseAddressLabel: "Seu endereço Bitcoin de compra",
  sentToDelivery: "O TTTI-T é enviado ao seu endereço de entrega abaixo.",
  keepPageOpen:
    "Mantenha esta página aberta até que seu depósito seja detectado. Se você sair, sua compra será concluída quando você voltar a esta página, à taxa de câmbio daquele momento. Se a venda já tiver terminado até lá, você será reembolsado em ckBTC.",
  delivered: (amount: string) => `${amount} TTTI-T entregues`,
  deliveredDetail: "À cotação horária do ckBTC",
  refunded: (amount: string) => `${amount} devolvidos à sua carteira`,
  refundedDetail:
    "A conversão não pôde ser concluída, então o ckBTC foi devolvido automaticamente.",
  addressDefaultLabel: "Endereço de depósito Bitcoin",
  addressCopiedToast: "Endereço Bitcoin copiado",
  addressCopyFailedToast: "Não foi possível copiar o endereço",
  qrTitle: (address: string) => `QR code do endereço Bitcoin ${address}`,
  copyAddressAria: (address: string) => `Copiar o endereço Bitcoin ${address}`,
  copied: "Copiado",
  clickToCopy: "Clique no endereço para copiá-lo.",
  errValueTooSmall: (minimum: string) =>
    `Depósito pequeno demais: abaixo do mínimo de ${minimum}. Ele não foi convertido.`,
  errTainted: "Depósito recusado pelo minter do ckBTC.",
  errMinterUnavailable:
    "O minter do ckBTC está indisponível. Verifique novamente mais tarde.",
  errOther: (server: string | undefined) =>
    server
      ? `Não foi possível processar o depósito. ${server}`
      : "Não foi possível processar o depósito.",
  notYet: "Ainda não",
  finalWallet: "ckBTC na sua carteira",
  finalRefunded: "Reembolsado em ckBTC",
  finalDelivered: "TTTI-T entregue",
  stepAddress: "Endereço exibido",
  stepDetected: "Depósito detectado",
  stepConfirmations: (count: string) => `Confirmações ${count}`,
  stepMinted: "ckBTC criado",
  amountBtcDetected: "BTC detectado",
  amountCkbtcCreated: "ckBTC criado",
  amountCkbtcPending: "ckBTC pendente",
  amountRefunded: "Reembolsado",
  amountTttiDelivered: "TTTI-T entregue",
  progressAria: "Progresso do depósito Bitcoin",
  pendingRate:
    "Cotação indisponível. O ckBTC fica retido até a próxima cotação horária.",
  lastChecked: (time: string) => `Última verificação: ${time}`,
  checking: "Verificando…",
  check: "Verificar",
  flowWallet: "BTC → ckBTC (carteira)",
  flowPurchase: "BTC → TTTI-T (compra)",
  noDepositYet: "Nenhum depósito recebido neste endereço ainda.",
  earlierDeposits: "Depósitos anteriores neste endereço",
  depositNumber: (n: string) => `Depósito ${n}`,
  detectedOn: (time: string) => `Detectado em ${time}`,
  stagePendingRate: "Aguardando a cotação horária",
  conversionCauseLine: (cause: string) => `Status da conversão: ${cause}`,
  pendingDepositStatus: "Depósito Bitcoin em andamento.",
  pendingDepositLink: "Ver o depósito Bitcoin",
  errUnrecoverable: (server: string | undefined) =>
    server
      ? `Este depósito não pode ser processado. ${server}`
      : "Este depósito não pode ser processado.",
  refundFailed: (amount: string) =>
    `O reembolso do excedente falhou. ${amount} ainda retidos; o reembolso é tentado novamente de forma automática.`,
  waitingNewTransfer: "Aguardando uma nova transferência para este endereço.",
  depositFinished: (n: string, status: string) => `Depósito ${n}: ${status}.`,
  waitForNew: "Aguardar uma nova transferência",
  otherDeposits: "Outros depósitos neste endereço",
  reuseWallet:
    "Envie BTC para este endereço a partir de qualquer carteira Bitcoin. Cada nova transferência é convertida em ckBTC automaticamente. O mesmo endereço pode ser reutilizado.",
  reusePurchase:
    "Envie BTC para este endereço a partir de qualquer carteira Bitcoin. Cada nova transferência é convertida e entregue como TTTI-T automaticamente. O mesmo endereço pode ser reutilizado.",
  waitingDepositStatus: "Endereço Bitcoin aguardando uma nova transferência.",
  waitingDepositLink: "Ver o endereço Bitcoin",
  refundCause: (cause: string) => `Causa: ${cause}`,
  refundPurposeFull: "Valor devolvido integralmente",
  refundPurposeExcess: "Excedente devolvido",
  refundPurposeDeliveryFailed: "Entrega falhou, valor devolvido",
  refundSending: "O reembolso está sendo enviado.",
  refundRetrying: "O reembolso é tentado novamente de forma automática.",
  refundTxLabel: "Transação de reembolso",
  heldNote: (amount: string) =>
    `${amount} mantidos pelo contrato. Use o botão Mint abaixo para convertê-los agora. Se a conversão não puder ser concluída, um reembolso para a sua carteira é aberto automaticamente.`,
  convertDelivered: (amount: string) => `${amount} TTTI-T entregues`,
  convertRefunded: (amount: string) => `${amount} devolvidos à sua carteira`,
  convertStillHeld: (amount: string) =>
    `${amount} ainda mantidos pelo contrato. A conversão é tentada novamente de forma automática.`,
  convertNothing: "Nenhum ckBTC aguardava conversão.",
  convertFailedTitle: "Conversão não concluída",
  convertNothingTaken:
    "Nada foi cobrado: seus fundos permanecem com você ou são devolvidos à sua carteira. Você pode clicar em Mint novamente.",
  depositAlertDeliveredTitle: "Depósito de Bitcoin entregue",
  depositAlertDeliveredText: (amount: string) =>
    `${amount} recebidos pelo seu depósito de Bitcoin.`,
  depositAlertRefundedTitle: "Depósito de Bitcoin reembolsado",
  depositAlertRefundedText: (amount: string) =>
    `${amount} devolvidos à sua carteira. A conversão não pôde ser concluída.`,
  depositAlertViewDeposit: "Ver o depósito",
  depositAlertViewHistory: "Ver o histórico",
};

export default ptBR;
