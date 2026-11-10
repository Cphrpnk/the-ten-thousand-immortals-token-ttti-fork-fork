import type en from "./en";

const ptBR: typeof en = {
  contractAddressRefused:
    "Os tokens não podem ser queimados; transferências para o endereço do contrato são recusadas.",
  badFee: "A taxa de transferência mudou. Atualize e tente novamente.",
  insufficientFundsBalance: (balance: string, symbol: string) =>
    `Fundos insuficientes. Seu saldo é de ${balance} ${symbol}.`,
  insufficientFunds: "Fundos insuficientes para esta transferência.",
  insufficientAllowanceAmount: (allowance: string, symbol: string) =>
    `A autorização é insuficiente. Autorização atual: ${allowance} ${symbol}.`,
  insufficientAllowance:
    "A autorização é insuficiente para esta transferência.",
  duplicateTransfer: "Esta transação já foi processada.",
  temporarilyUnavailable:
    "O ledger está temporariamente indisponível. Tente novamente em instantes.",
  createdInFuture:
    "O ledger recusou esta operação por ter sido criada no futuro. Tente novamente.",
  tooOldTransfer:
    "Esta transação é antiga demais para ser processada. Tente novamente.",
  genericRejected:
    "O ledger recusou esta solicitação. Verifique o destino e tente novamente.",
  rejected: "O ledger recusou esta solicitação.",
  allowanceChangedAmount: (current: string, symbol: string) =>
    `A autorização mudou. Autorização atual: ${current} ${symbol}.`,
  allowanceChanged: "A autorização mudou. Atualize e tente novamente.",
  approveExpired: "Esta aprovação expirou antes de ser processada.",
  approveExpiredFrom: "O prazo de aprovação expirou. Tente novamente.",
  approveInsufficientFunds:
    "Fundos insuficientes para cobrir a taxa de aprovação.",
  approveBadFee: "A taxa de aprovação mudou. Atualize e tente novamente.",
  approveDuplicate: "Esta aprovação já foi processada.",
  approveTooOld:
    "Esta aprovação é antiga demais para ser processada. Tente novamente.",
  approveRejected: "O ledger recusou esta aprovação.",
  destinationUnavailable:
    "A verificação do destino está indisponível. Tente novamente em instantes.",
  invalidAmount: (decimals: number) =>
    `Insira um valor maior que 0 com até ${decimals} casas decimais.`,
  transferFailed:
    "A transferência falhou. Verifique o destino e tente novamente.",
  amountLabel: (symbol: string) => `Valor (${symbol})`,

  signedOutTitle: "Entre para gerenciar seus tokens",
  signedOutBody:
    "Transferências e aprovações estão vinculadas ao seu principal do Internet Identity. Entre pelo cabeçalho para continuar.",
  balanceLabel: "Seu saldo",

  invalidRecipient: "Insira um Principal ID de destinatário válido.",
  transferSent: (amount: string, symbol: string, to: string) =>
    `${amount} ${symbol} enviados para ${to}.`,
  toastTransfer: "Transferência concluída",
  transferTitle: (symbol: string) => `Transferir ${symbol}`,
  transferDescription: (fee: string, symbol: string) =>
    `Envie tokens do seu principal para outra conta. A taxa de transferência de ${fee} ${symbol} é descontada do seu saldo e creditada ao coletor de taxas.`,
  recipientLabel: "Principal do destinatário",
  transferHint: (decimals: number, fee: string, symbol: string, from: string) =>
    `Até ${decimals} casas decimais. Taxa: ${fee} ${symbol}. Enviando de ${from}.`,
  sending: "Enviando...",
  sendTokens: "Enviar tokens",

  invalidSpender: "Insira um Principal ID de gastador válido.",
  invalidAllowance: (decimals: number) =>
    `Insira uma autorização maior que 0 com até ${decimals} casas decimais.`,
  approved: (amount: string, symbol: string, spender: string) =>
    `${amount} ${symbol} autorizados para ${spender}.`,
  toastApproved: "Autorização aprovada",
  approvalFailed: "A aprovação falhou. Tente novamente.",
  approveTitle: "Aprovar um gastador",
  approveDescription:
    "Permita que outro principal transfira tokens em seu nome.",
  spenderLabel: "Principal do gastador",
  allowanceLabel: (symbol: string) => `Autorização (${symbol})`,
  approveHint: (decimals: number, symbol: string) =>
    `Até ${decimals} casas decimais. A aprovação cobra a taxa de transferência de ${symbol}.`,
  approving: "Aprovando...",
  approveAllowance: "Aprovar autorização",
  currentAllowance: "Autorização atual",
  currentAllowanceFor: (spender: string) => `Autorização atual para ${spender}`,
  enterSpenderToView: "Insira um gastador para visualizar",
  loading: "Carregando…",

  invalidFrom: "Insira um Principal ID de origem válido.",
  invalidTo: "Insira um Principal ID de destino válido.",
  transferredFrom: (amount: string, symbol: string, from: string, to: string) =>
    `${amount} ${symbol} transferidos de ${from} para ${to}.`,
  toastTransferFrom: "Transferência a partir da autorização concluída",
  transferFromTitle: "Transferir a partir de uma autorização",
  transferFromDescription:
    "Use uma autorização concedida a você para mover tokens da conta de outro principal.",
  fromLabel: "Principal de origem",
  toLabel: "Principal de destino",
  transferring: "Transferindo...",
  transferFromButton: "Transferir de",

  pageTitle: "Gerenciar tokens",
  pageSubtitle: (symbol: string) =>
    `Transfira, aprove e gaste autorizações de ${symbol}.`,
  feeBadge: (fee: string, symbol: string) => `Taxa ${fee} ${symbol}`,
  tabTransfer: "Transferir",
  tabApprove: "Aprovar",
  tabTransferFrom: "Transferir de",
};

export default ptBR;
