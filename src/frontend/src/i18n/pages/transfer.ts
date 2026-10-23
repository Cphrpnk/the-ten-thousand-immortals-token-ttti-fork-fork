import { defineDict } from "../core/dict";

/**
 * Transfer page (pages/TransferPage.tsx). English is authoritative.
 * Amounts, fees, principals and token symbols are passed in unchanged.
 */
export const TRANSFER_TEXT = defineDict({
  en: {
    // Shared ledger errors
    contractAddressRefused:
      "Tokens cannot be burned; transfers to the contract address are refused.",
    badFee: "The transfer fee changed. Refresh and try again.",
    insufficientFundsBalance: (balance: string, symbol: string) =>
      `Insufficient funds. Your balance is ${balance} ${symbol}.`,
    insufficientFunds: "Insufficient funds for this transfer.",
    insufficientAllowanceAmount: (allowance: string, symbol: string) =>
      `The allowance is too low. Current allowance: ${allowance} ${symbol}.`,
    insufficientAllowance: "The allowance is too low for this transfer.",
    duplicateTransfer: "This transaction was already processed.",
    temporarilyUnavailable:
      "The ledger is temporarily unavailable. Try again shortly.",
    createdInFuture:
      "The ledger rejected this as created in the future. Try again.",
    tooOldTransfer: "This transaction is too old to process. Try again.",
    genericRejected:
      "The ledger rejected this request. Check the destination and try again.",
    rejected: "The ledger rejected this request.",
    allowanceChangedAmount: (current: string, symbol: string) =>
      `The allowance changed. Current allowance: ${current} ${symbol}.`,
    allowanceChanged: "The allowance changed. Refresh and try again.",
    approveExpired: "This approval expired before it was processed.",
    approveExpiredFrom: "The approval window expired. Try again.",
    approveInsufficientFunds: "Insufficient funds to cover the approval fee.",
    approveBadFee: "The approval fee changed. Refresh and try again.",
    approveDuplicate: "This approval was already processed.",
    approveTooOld: "This approval is too old to process. Try again.",
    approveRejected: "The ledger rejected this approval.",
    destinationUnavailable:
      "Destination validation is unavailable. Please try again shortly.",
    invalidAmount: (decimals: number) =>
      `Enter an amount greater than 0 with up to ${decimals} decimals.`,
    transferFailed: "Transfer failed. Check the destination and try again.",
    amountLabel: (symbol: string) => `Amount (${symbol})`,

    // Signed out / balance
    signedOutTitle: "Sign in to manage your tokens",
    signedOutBody:
      "Transfers and approvals are tied to your Internet Identity principal. Sign in from the header to continue.",
    balanceLabel: "Your balance",

    // Transfer
    invalidRecipient: "Enter a valid recipient principal ID.",
    transferSent: (amount: string, symbol: string, to: string) =>
      `Sent ${amount} ${symbol} to ${to}.`,
    toastTransfer: "Transfer complete",
    transferTitle: (symbol: string) => `Transfer ${symbol}`,
    transferDescription: (fee: string, symbol: string) =>
      `Send tokens from your principal to another account. The transfer fee of ${fee} ${symbol} is deducted from your balance and credited to the fee collector.`,
    recipientLabel: "Recipient Principal",
    transferHint: (
      decimals: number,
      fee: string,
      symbol: string,
      from: string,
    ) =>
      `Up to ${decimals} decimals. Fee: ${fee} ${symbol}. Sending from ${from}.`,
    sending: "Sending...",
    sendTokens: "Send Tokens",

    // Approve
    invalidSpender: "Enter a valid spender principal ID.",
    invalidAllowance: (decimals: number) =>
      `Enter an allowance greater than 0 with up to ${decimals} decimals.`,
    approved: (amount: string, symbol: string, spender: string) =>
      `Approved ${amount} ${symbol} for ${spender}.`,
    toastApproved: "Allowance approved",
    approvalFailed: "Approval failed. Please try again.",
    approveTitle: "Approve a Spender",
    approveDescription:
      "Allow another principal to transfer tokens on your behalf.",
    spenderLabel: "Spender Principal",
    allowanceLabel: (symbol: string) => `Allowance (${symbol})`,
    approveHint: (decimals: number, symbol: string) =>
      `Up to ${decimals} decimals. Approving charges the ${symbol} transfer fee.`,
    approving: "Approving...",
    approveAllowance: "Approve Allowance",
    currentAllowance: "Current allowance",
    currentAllowanceFor: (spender: string) =>
      `Current allowance for ${spender}`,
    enterSpenderToView: "Enter a spender to view",
    loading: "Loading…",

    // Transfer from
    invalidFrom: "Enter a valid 'from' principal ID.",
    invalidTo: "Enter a valid 'to' principal ID.",
    transferredFrom: (
      amount: string,
      symbol: string,
      from: string,
      to: string,
    ) => `Transferred ${amount} ${symbol} from ${from} to ${to}.`,
    toastTransferFrom: "Transfer from complete",
    transferFromTitle: "Transfer From an Allowance",
    transferFromDescription:
      "Spend an allowance you were granted to move tokens from another principal's account.",
    fromLabel: "From Principal",
    toLabel: "To Principal",
    transferring: "Transferring...",
    transferFromButton: "Transfer From",

    // Page header and tabs
    pageTitle: "Manage Tokens",
    pageSubtitle: (symbol: string) =>
      `Transfer, approve and spend ${symbol} allowances.`,
    feeBadge: (fee: string, symbol: string) => `Fee ${fee} ${symbol}`,
    tabTransfer: "Transfer",
    tabApprove: "Approve",
    tabTransferFrom: "Transfer From",
  },
  fr: {
    contractAddressRefused:
      "Les jetons ne peuvent pas être brûlés ; les transferts vers l'adresse du contrat sont refusés.",
    badFee: "Les frais de transfert ont changé. Actualisez et réessayez.",
    insufficientFundsBalance: (balance: string, symbol: string) =>
      `Fonds insuffisants. Votre solde est de ${balance} ${symbol}.`,
    insufficientFunds: "Fonds insuffisants pour ce transfert.",
    insufficientAllowanceAmount: (allowance: string, symbol: string) =>
      `L'autorisation est insuffisante. Autorisation actuelle : ${allowance} ${symbol}.`,
    insufficientAllowance: "L'autorisation est insuffisante pour ce transfert.",
    duplicateTransfer: "Cette transaction a déjà été traitée.",
    temporarilyUnavailable:
      "Le ledger est temporairement indisponible. Réessayez dans un instant.",
    createdInFuture:
      "Le ledger a refusé cette opération comme créée dans le futur. Réessayez.",
    tooOldTransfer:
      "Cette transaction est trop ancienne pour être traitée. Réessayez.",
    genericRejected:
      "Le ledger a refusé cette demande. Vérifiez la destination et réessayez.",
    rejected: "Le ledger a refusé cette demande.",
    allowanceChangedAmount: (current: string, symbol: string) =>
      `L'autorisation a changé. Autorisation actuelle : ${current} ${symbol}.`,
    allowanceChanged: "L'autorisation a changé. Actualisez et réessayez.",
    approveExpired: "Cette approbation a expiré avant d'être traitée.",
    approveExpiredFrom: "Le délai d'approbation a expiré. Réessayez.",
    approveInsufficientFunds:
      "Fonds insuffisants pour couvrir les frais d'approbation.",
    approveBadFee:
      "Les frais d'approbation ont changé. Actualisez et réessayez.",
    approveDuplicate: "Cette approbation a déjà été traitée.",
    approveTooOld:
      "Cette approbation est trop ancienne pour être traitée. Réessayez.",
    approveRejected: "Le ledger a refusé cette approbation.",
    destinationUnavailable:
      "La vérification de la destination est indisponible. Réessayez dans un instant.",
    invalidAmount: (decimals: number) =>
      `Saisissez un montant supérieur à 0 avec au plus ${decimals} décimales.`,
    transferFailed:
      "Le transfert a échoué. Vérifiez la destination et réessayez.",
    amountLabel: (symbol: string) => `Montant (${symbol})`,

    signedOutTitle: "Connectez-vous pour gérer vos jetons",
    signedOutBody:
      "Les transferts et les approbations sont liés à votre principal Internet Identity. Connectez-vous depuis l'en-tête pour continuer.",
    balanceLabel: "Votre solde",

    invalidRecipient: "Saisissez un Principal ID de destinataire valide.",
    transferSent: (amount: string, symbol: string, to: string) =>
      `${amount} ${symbol} envoyés à ${to}.`,
    toastTransfer: "Transfert effectué",
    transferTitle: (symbol: string) => `Transférer des ${symbol}`,
    transferDescription: (fee: string, symbol: string) =>
      `Envoyez des jetons depuis votre principal vers un autre compte. Les frais de transfert de ${fee} ${symbol} sont déduits de votre solde et crédités au compte collecteur des frais.`,
    recipientLabel: "Principal du destinataire",
    transferHint: (
      decimals: number,
      fee: string,
      symbol: string,
      from: string,
    ) =>
      `Au plus ${decimals} décimales. Frais : ${fee} ${symbol}. Envoi depuis ${from}.`,
    sending: "Envoi...",
    sendTokens: "Envoyer les jetons",

    invalidSpender: "Saisissez un Principal ID de tiers autorisé valide.",
    invalidAllowance: (decimals: number) =>
      `Saisissez une autorisation supérieure à 0 avec au plus ${decimals} décimales.`,
    approved: (amount: string, symbol: string, spender: string) =>
      `${amount} ${symbol} autorisés pour ${spender}.`,
    toastApproved: "Autorisation approuvée",
    approvalFailed: "L'approbation a échoué. Réessayez.",
    approveTitle: "Autoriser un tiers",
    approveDescription:
      "Autorisez un autre principal à transférer des jetons en votre nom.",
    spenderLabel: "Principal du tiers autorisé",
    allowanceLabel: (symbol: string) => `Autorisation (${symbol})`,
    approveHint: (decimals: number, symbol: string) =>
      `Au plus ${decimals} décimales. L'approbation prélève les frais de transfert ${symbol}.`,
    approving: "Approbation...",
    approveAllowance: "Approuver l'autorisation",
    currentAllowance: "Autorisation actuelle",
    currentAllowanceFor: (spender: string) =>
      `Autorisation actuelle pour ${spender}`,
    enterSpenderToView: "Saisissez un tiers autorisé pour l'afficher",
    loading: "Chargement…",

    invalidFrom: "Saisissez un Principal ID « depuis » valide.",
    invalidTo: "Saisissez un Principal ID « vers » valide.",
    transferredFrom: (
      amount: string,
      symbol: string,
      from: string,
      to: string,
    ) => `${amount} ${symbol} transférés de ${from} vers ${to}.`,
    toastTransferFrom: "Transfert depuis l'autorisation effectué",
    transferFromTitle: "Transférer depuis une autorisation",
    transferFromDescription:
      "Utilisez une autorisation qui vous a été accordée pour déplacer des jetons depuis le compte d'un autre principal.",
    fromLabel: "Principal source",
    toLabel: "Principal destinataire",
    transferring: "Transfert...",
    transferFromButton: "Transférer depuis",

    pageTitle: "Gérer les jetons",
    pageSubtitle: (symbol: string) =>
      `Transférer, approuver et dépenser des autorisations ${symbol}.`,
    feeBadge: (fee: string, symbol: string) => `Frais ${fee} ${symbol}`,
    tabTransfer: "Transférer",
    tabApprove: "Approuver",
    tabTransferFrom: "Transférer depuis",
  },
  es: {
    contractAddressRefused:
      "Los tokens no se pueden quemar; las transferencias a la dirección del contrato se rechazan.",
    badFee:
      "La comisión de transferencia ha cambiado. Actualice e inténtelo de nuevo.",
    insufficientFundsBalance: (balance: string, symbol: string) =>
      `Fondos insuficientes. Su saldo es de ${balance} ${symbol}.`,
    insufficientFunds: "Fondos insuficientes para esta transferencia.",
    insufficientAllowanceAmount: (allowance: string, symbol: string) =>
      `La autorización es insuficiente. Autorización actual: ${allowance} ${symbol}.`,
    insufficientAllowance:
      "La autorización es insuficiente para esta transferencia.",
    duplicateTransfer: "Esta transacción ya se procesó.",
    temporarilyUnavailable:
      "El ledger no está disponible temporalmente. Inténtelo de nuevo en breve.",
    createdInFuture:
      "El ledger rechazó esta operación por estar creada en el futuro. Inténtelo de nuevo.",
    tooOldTransfer:
      "Esta transacción es demasiado antigua para procesarse. Inténtelo de nuevo.",
    genericRejected:
      "El ledger rechazó esta solicitud. Compruebe el destino e inténtelo de nuevo.",
    rejected: "El ledger rechazó esta solicitud.",
    allowanceChangedAmount: (current: string, symbol: string) =>
      `La autorización ha cambiado. Autorización actual: ${current} ${symbol}.`,
    allowanceChanged:
      "La autorización ha cambiado. Actualice e inténtelo de nuevo.",
    approveExpired: "Esta aprobación caducó antes de procesarse.",
    approveExpiredFrom:
      "El plazo de aprobación ha caducado. Inténtelo de nuevo.",
    approveInsufficientFunds:
      "Fondos insuficientes para cubrir la comisión de aprobación.",
    approveBadFee:
      "La comisión de aprobación ha cambiado. Actualice e inténtelo de nuevo.",
    approveDuplicate: "Esta aprobación ya se procesó.",
    approveTooOld:
      "Esta aprobación es demasiado antigua para procesarse. Inténtelo de nuevo.",
    approveRejected: "El ledger rechazó esta aprobación.",
    destinationUnavailable:
      "La verificación del destino no está disponible. Inténtelo de nuevo en breve.",
    invalidAmount: (decimals: number) =>
      `Introduzca un importe mayor que 0 con un máximo de ${decimals} decimales.`,
    transferFailed:
      "La transferencia falló. Compruebe el destino e inténtelo de nuevo.",
    amountLabel: (symbol: string) => `Importe (${symbol})`,

    signedOutTitle: "Inicie sesión para gestionar sus tokens",
    signedOutBody:
      "Las transferencias y aprobaciones están vinculadas a su principal de Internet Identity. Inicie sesión desde el encabezado para continuar.",
    balanceLabel: "Su saldo",

    invalidRecipient: "Introduzca un Principal ID de destinatario válido.",
    transferSent: (amount: string, symbol: string, to: string) =>
      `Se enviaron ${amount} ${symbol} a ${to}.`,
    toastTransfer: "Transferencia completada",
    transferTitle: (symbol: string) => `Transferir ${symbol}`,
    transferDescription: (fee: string, symbol: string) =>
      `Envíe tokens desde su principal a otra cuenta. La comisión de transferencia de ${fee} ${symbol} se descuenta de su saldo y se abona al recaudador de comisiones.`,
    recipientLabel: "Principal del destinatario",
    transferHint: (
      decimals: number,
      fee: string,
      symbol: string,
      from: string,
    ) =>
      `Máximo ${decimals} decimales. Comisión: ${fee} ${symbol}. Envío desde ${from}.`,
    sending: "Enviando...",
    sendTokens: "Enviar tokens",

    invalidSpender: "Introduzca un Principal ID de gastador válido.",
    invalidAllowance: (decimals: number) =>
      `Introduzca una autorización mayor que 0 con un máximo de ${decimals} decimales.`,
    approved: (amount: string, symbol: string, spender: string) =>
      `Se autorizaron ${amount} ${symbol} para ${spender}.`,
    toastApproved: "Autorización aprobada",
    approvalFailed: "La aprobación falló. Inténtelo de nuevo.",
    approveTitle: "Aprobar un gastador",
    approveDescription:
      "Permita que otro principal transfiera tokens en su nombre.",
    spenderLabel: "Principal del gastador",
    allowanceLabel: (symbol: string) => `Autorización (${symbol})`,
    approveHint: (decimals: number, symbol: string) =>
      `Máximo ${decimals} decimales. La aprobación cobra la comisión de transferencia de ${symbol}.`,
    approving: "Aprobando...",
    approveAllowance: "Aprobar autorización",
    currentAllowance: "Autorización actual",
    currentAllowanceFor: (spender: string) =>
      `Autorización actual para ${spender}`,
    enterSpenderToView: "Introduzca un gastador para verla",
    loading: "Cargando…",

    invalidFrom: "Introduzca un Principal ID de origen válido.",
    invalidTo: "Introduzca un Principal ID de destino válido.",
    transferredFrom: (
      amount: string,
      symbol: string,
      from: string,
      to: string,
    ) => `Se transfirieron ${amount} ${symbol} de ${from} a ${to}.`,
    toastTransferFrom: "Transferencia desde autorización completada",
    transferFromTitle: "Transferir desde una autorización",
    transferFromDescription:
      "Use una autorización que se le haya concedido para mover tokens desde la cuenta de otro principal.",
    fromLabel: "Principal de origen",
    toLabel: "Principal de destino",
    transferring: "Transfiriendo...",
    transferFromButton: "Transferir desde",

    pageTitle: "Gestionar tokens",
    pageSubtitle: (symbol: string) =>
      `Transfiera, apruebe y gaste autorizaciones de ${symbol}.`,
    feeBadge: (fee: string, symbol: string) => `Comisión ${fee} ${symbol}`,
    tabTransfer: "Transferir",
    tabApprove: "Aprobar",
    tabTransferFrom: "Transferir desde",
  },
  "zh-Hans": {
    contractAddressRefused: "代币无法销毁；向合约地址的转账将被拒绝。",
    badFee: "转账手续费已变更。请刷新后重试。",
    insufficientFundsBalance: (balance: string, symbol: string) =>
      `资金不足。您的余额为 ${balance} ${symbol}。`,
    insufficientFunds: "资金不足，无法完成此转账。",
    insufficientAllowanceAmount: (allowance: string, symbol: string) =>
      `授权额度不足。当前授权额度：${allowance} ${symbol}。`,
    insufficientAllowance: "授权额度不足，无法完成此转账。",
    duplicateTransfer: "此交易已处理。",
    temporarilyUnavailable: "账本暂时不可用。请稍后重试。",
    createdInFuture: "账本以创建时间在未来为由拒绝了此操作。请重试。",
    tooOldTransfer: "此交易过旧，无法处理。请重试。",
    genericRejected: "账本拒绝了此请求。请检查目标地址后重试。",
    rejected: "账本拒绝了此请求。",
    allowanceChangedAmount: (current: string, symbol: string) =>
      `授权额度已变更。当前授权额度：${current} ${symbol}。`,
    allowanceChanged: "授权额度已变更。请刷新后重试。",
    approveExpired: "此授权在处理前已过期。",
    approveExpiredFrom: "授权有效期已过。请重试。",
    approveInsufficientFunds: "资金不足，无法支付授权手续费。",
    approveBadFee: "授权手续费已变更。请刷新后重试。",
    approveDuplicate: "此授权已处理。",
    approveTooOld: "此授权过旧，无法处理。请重试。",
    approveRejected: "账本拒绝了此授权。",
    destinationUnavailable: "目标地址验证暂不可用。请稍后重试。",
    invalidAmount: (decimals: number) =>
      `请输入大于 0 的数量，最多 ${decimals} 位小数。`,
    transferFailed: "转账失败。请检查目标地址后重试。",
    amountLabel: (symbol: string) => `数量（${symbol}）`,

    signedOutTitle: "登录以管理您的代币",
    signedOutBody:
      "转账和授权与您的 Internet Identity principal 绑定。请从页眉登录以继续。",
    balanceLabel: "您的余额",

    invalidRecipient: "请输入有效的收款方 Principal ID。",
    transferSent: (amount: string, symbol: string, to: string) =>
      `已向 ${to} 发送 ${amount} ${symbol}。`,
    toastTransfer: "转账完成",
    transferTitle: (symbol: string) => `转账 ${symbol}`,
    transferDescription: (fee: string, symbol: string) =>
      `从您的 principal 向另一账户发送代币。${fee} ${symbol} 的转账手续费将从您的余额中扣除，并记入手续费收取账户。`,
    recipientLabel: "收款方 Principal",
    transferHint: (
      decimals: number,
      fee: string,
      symbol: string,
      from: string,
    ) => `最多 ${decimals} 位小数。手续费：${fee} ${symbol}。发送方：${from}。`,
    sending: "发送中...",
    sendTokens: "发送代币",

    invalidSpender: "请输入有效的被授权方 Principal ID。",
    invalidAllowance: (decimals: number) =>
      `请输入大于 0 的授权额度，最多 ${decimals} 位小数。`,
    approved: (amount: string, symbol: string, spender: string) =>
      `已授权 ${spender} 使用 ${amount} ${symbol}。`,
    toastApproved: "授权已批准",
    approvalFailed: "授权失败。请重试。",
    approveTitle: "授权被授权方",
    approveDescription: "允许另一个 principal 代表您转账代币。",
    spenderLabel: "被授权方 Principal",
    allowanceLabel: (symbol: string) => `授权额度（${symbol}）`,
    approveHint: (decimals: number, symbol: string) =>
      `最多 ${decimals} 位小数。授权将收取 ${symbol} 转账手续费。`,
    approving: "授权中...",
    approveAllowance: "批准授权额度",
    currentAllowance: "当前授权额度",
    currentAllowanceFor: (spender: string) => `${spender} 的当前授权额度`,
    enterSpenderToView: "输入被授权方以查看",
    loading: "加载中…",

    invalidFrom: "请输入有效的转出方 Principal ID。",
    invalidTo: "请输入有效的转入方 Principal ID。",
    transferredFrom: (
      amount: string,
      symbol: string,
      from: string,
      to: string,
    ) => `已从 ${from} 向 ${to} 转账 ${amount} ${symbol}。`,
    toastTransferFrom: "授权转账完成",
    transferFromTitle: "从授权额度转账",
    transferFromDescription:
      "使用他人授予您的额度，从另一个 principal 的账户转移代币。",
    fromLabel: "转出方 Principal",
    toLabel: "转入方 Principal",
    transferring: "转账中...",
    transferFromButton: "授权转账",

    pageTitle: "管理代币",
    pageSubtitle: (symbol: string) => `转账、授权及使用 ${symbol} 授权额度。`,
    feeBadge: (fee: string, symbol: string) => `手续费 ${fee} ${symbol}`,
    tabTransfer: "转账",
    tabApprove: "授权",
    tabTransferFrom: "授权转账",
  },
  "pt-BR": {
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
    transferHint: (
      decimals: number,
      fee: string,
      symbol: string,
      from: string,
    ) =>
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
    currentAllowanceFor: (spender: string) =>
      `Autorização atual para ${spender}`,
    enterSpenderToView: "Insira um gastador para visualizar",
    loading: "Carregando…",

    invalidFrom: "Insira um Principal ID de origem válido.",
    invalidTo: "Insira um Principal ID de destino válido.",
    transferredFrom: (
      amount: string,
      symbol: string,
      from: string,
      to: string,
    ) => `${amount} ${symbol} transferidos de ${from} para ${to}.`,
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
  },
  ko: {
    contractAddressRefused:
      "토큰은 소각할 수 없으며, 컨트랙트 주소로의 전송은 거부됩니다.",
    badFee: "전송 수수료가 변경되었습니다. 새로 고친 후 다시 시도하세요.",
    insufficientFundsBalance: (balance: string, symbol: string) =>
      `잔액이 부족합니다. 현재 잔액은 ${balance} ${symbol}입니다.`,
    insufficientFunds: "이 전송을 위한 잔액이 부족합니다.",
    insufficientAllowanceAmount: (allowance: string, symbol: string) =>
      `허용 한도가 부족합니다. 현재 허용 한도: ${allowance} ${symbol}.`,
    insufficientAllowance: "이 전송을 위한 허용 한도가 부족합니다.",
    duplicateTransfer: "이미 처리된 거래입니다.",
    temporarilyUnavailable:
      "원장을 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요.",
    createdInFuture:
      "생성 시각이 미래로 되어 있어 원장이 거부했습니다. 다시 시도하세요.",
    tooOldTransfer: "너무 오래된 거래라 처리할 수 없습니다. 다시 시도하세요.",
    genericRejected:
      "원장이 이 요청을 거부했습니다. 대상을 확인한 후 다시 시도하세요.",
    rejected: "원장이 이 요청을 거부했습니다.",
    allowanceChangedAmount: (current: string, symbol: string) =>
      `허용 한도가 변경되었습니다. 현재 허용 한도: ${current} ${symbol}.`,
    allowanceChanged:
      "허용 한도가 변경되었습니다. 새로 고친 후 다시 시도하세요.",
    approveExpired: "이 승인은 처리되기 전에 만료되었습니다.",
    approveExpiredFrom: "승인 기간이 만료되었습니다. 다시 시도하세요.",
    approveInsufficientFunds: "승인 수수료를 낼 잔액이 부족합니다.",
    approveBadFee:
      "승인 수수료가 변경되었습니다. 새로 고친 후 다시 시도하세요.",
    approveDuplicate: "이미 처리된 승인입니다.",
    approveTooOld: "너무 오래된 승인이라 처리할 수 없습니다. 다시 시도하세요.",
    approveRejected: "원장이 이 승인을 거부했습니다.",
    destinationUnavailable:
      "대상 확인을 사용할 수 없습니다. 잠시 후 다시 시도하세요.",
    invalidAmount: (decimals: number) =>
      `0보다 큰 수량을 소수점 이하 최대 ${decimals}자리까지 입력하세요.`,
    transferFailed: "전송에 실패했습니다. 대상을 확인한 후 다시 시도하세요.",
    amountLabel: (symbol: string) => `수량 (${symbol})`,

    signedOutTitle: "토큰을 관리하려면 로그인하세요",
    signedOutBody:
      "전송과 승인은 Internet Identity principal에 연결됩니다. 계속하려면 헤더에서 로그인하세요.",
    balanceLabel: "내 잔액",

    invalidRecipient: "유효한 수신자 Principal ID를 입력하세요.",
    transferSent: (amount: string, symbol: string, to: string) =>
      `${to}에게 ${amount} ${symbol}을(를) 보냈습니다.`,
    toastTransfer: "전송 완료",
    transferTitle: (symbol: string) => `${symbol} 전송`,
    transferDescription: (fee: string, symbol: string) =>
      `내 principal에서 다른 계정으로 토큰을 보냅니다. 전송 수수료 ${fee} ${symbol}은(는) 잔액에서 차감되어 수수료 수취 계정에 입금됩니다.`,
    recipientLabel: "수신자 Principal",
    transferHint: (
      decimals: number,
      fee: string,
      symbol: string,
      from: string,
    ) =>
      `소수점 이하 최대 ${decimals}자리. 수수료: ${fee} ${symbol}. 보내는 계정: ${from}.`,
    sending: "보내는 중...",
    sendTokens: "토큰 보내기",

    invalidSpender: "유효한 사용자(spender) Principal ID를 입력하세요.",
    invalidAllowance: (decimals: number) =>
      `0보다 큰 허용 한도를 소수점 이하 최대 ${decimals}자리까지 입력하세요.`,
    approved: (amount: string, symbol: string, spender: string) =>
      `${spender}에게 ${amount} ${symbol}을(를) 승인했습니다.`,
    toastApproved: "허용 한도 승인됨",
    approvalFailed: "승인에 실패했습니다. 다시 시도하세요.",
    approveTitle: "사용자(spender) 승인",
    approveDescription:
      "다른 principal이 나를 대신해 토큰을 전송하도록 허용합니다.",
    spenderLabel: "사용자(spender) Principal",
    allowanceLabel: (symbol: string) => `허용 한도 (${symbol})`,
    approveHint: (decimals: number, symbol: string) =>
      `소수점 이하 최대 ${decimals}자리. 승인 시 ${symbol} 전송 수수료가 부과됩니다.`,
    approving: "승인 중...",
    approveAllowance: "허용 한도 승인",
    currentAllowance: "현재 허용 한도",
    currentAllowanceFor: (spender: string) => `${spender}의 현재 허용 한도`,
    enterSpenderToView: "확인하려면 사용자(spender)를 입력하세요",
    loading: "불러오는 중…",

    invalidFrom: "유효한 보내는 쪽 Principal ID를 입력하세요.",
    invalidTo: "유효한 받는 쪽 Principal ID를 입력하세요.",
    transferredFrom: (
      amount: string,
      symbol: string,
      from: string,
      to: string,
    ) => `${from}에서 ${to}(으)로 ${amount} ${symbol}을(를) 전송했습니다.`,
    toastTransferFrom: "허용 한도 전송 완료",
    transferFromTitle: "허용 한도에서 전송",
    transferFromDescription:
      "부여받은 허용 한도를 사용해 다른 principal의 계정에서 토큰을 옮깁니다.",
    fromLabel: "보내는 쪽 Principal",
    toLabel: "받는 쪽 Principal",
    transferring: "전송 중...",
    transferFromButton: "허용 한도 전송",

    pageTitle: "토큰 관리",
    pageSubtitle: (symbol: string) => `${symbol} 전송, 승인 및 허용 한도 사용.`,
    feeBadge: (fee: string, symbol: string) => `수수료 ${fee} ${symbol}`,
    tabTransfer: "전송",
    tabApprove: "승인",
    tabTransferFrom: "허용 한도 전송",
  },
  "pa-Guru": {
    contractAddressRefused:
      "ਟੋਕਨ ਸਾੜੇ ਨਹੀਂ ਜਾ ਸਕਦੇ; ਕੰਟਰੈਕਟ ਪਤੇ ਵੱਲ ਟ੍ਰਾਂਸਫਰ ਰੱਦ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।",
    badFee: "ਟ੍ਰਾਂਸਫਰ ਫੀਸ ਬਦਲ ਗਈ ਹੈ। ਰੀਫ੍ਰੈਸ਼ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    insufficientFundsBalance: (balance: string, symbol: string) =>
      `ਨਾਕਾਫ਼ੀ ਫੰਡ। ਤੁਹਾਡਾ ਬਕਾਇਆ ${balance} ${symbol} ਹੈ।`,
    insufficientFunds: "ਇਸ ਟ੍ਰਾਂਸਫਰ ਲਈ ਨਾਕਾਫ਼ੀ ਫੰਡ।",
    insufficientAllowanceAmount: (allowance: string, symbol: string) =>
      `ਮਨਜ਼ੂਰ ਰਕਮ ਬਹੁਤ ਘੱਟ ਹੈ। ਮੌਜੂਦਾ ਮਨਜ਼ੂਰ ਰਕਮ: ${allowance} ${symbol}।`,
    insufficientAllowance: "ਇਸ ਟ੍ਰਾਂਸਫਰ ਲਈ ਮਨਜ਼ੂਰ ਰਕਮ ਬਹੁਤ ਘੱਟ ਹੈ।",
    duplicateTransfer: "ਇਹ ਲੈਣ-ਦੇਣ ਪਹਿਲਾਂ ਹੀ ਪ੍ਰੋਸੈਸ ਹੋ ਚੁੱਕਾ ਹੈ।",
    temporarilyUnavailable:
      "ਲੈਜਰ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    createdInFuture: "ਲੈਜਰ ਨੇ ਇਸਨੂੰ ਭਵਿੱਖ ਵਿੱਚ ਬਣਾਇਆ ਮੰਨ ਕੇ ਰੱਦ ਕਰ ਦਿੱਤਾ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    tooOldTransfer: "ਇਹ ਲੈਣ-ਦੇਣ ਪ੍ਰੋਸੈਸ ਕਰਨ ਲਈ ਬਹੁਤ ਪੁਰਾਣਾ ਹੈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    genericRejected:
      "ਲੈਜਰ ਨੇ ਇਹ ਬੇਨਤੀ ਰੱਦ ਕਰ ਦਿੱਤੀ। ਮੰਜ਼ਿਲ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    rejected: "ਲੈਜਰ ਨੇ ਇਹ ਬੇਨਤੀ ਰੱਦ ਕਰ ਦਿੱਤੀ।",
    allowanceChangedAmount: (current: string, symbol: string) =>
      `ਮਨਜ਼ੂਰ ਰਕਮ ਬਦਲ ਗਈ ਹੈ। ਮੌਜੂਦਾ ਮਨਜ਼ੂਰ ਰਕਮ: ${current} ${symbol}।`,
    allowanceChanged: "ਮਨਜ਼ੂਰ ਰਕਮ ਬਦਲ ਗਈ ਹੈ। ਰੀਫ੍ਰੈਸ਼ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    approveExpired: "ਇਹ ਮਨਜ਼ੂਰੀ ਪ੍ਰੋਸੈਸ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਮਿਆਦ ਪੁੱਗ ਗਈ।",
    approveExpiredFrom: "ਮਨਜ਼ੂਰੀ ਦੀ ਮਿਆਦ ਪੁੱਗ ਗਈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    approveInsufficientFunds: "ਮਨਜ਼ੂਰੀ ਫੀਸ ਭਰਨ ਲਈ ਨਾਕਾਫ਼ੀ ਫੰਡ।",
    approveBadFee: "ਮਨਜ਼ੂਰੀ ਫੀਸ ਬਦਲ ਗਈ ਹੈ। ਰੀਫ੍ਰੈਸ਼ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    approveDuplicate: "ਇਹ ਮਨਜ਼ੂਰੀ ਪਹਿਲਾਂ ਹੀ ਪ੍ਰੋਸੈਸ ਹੋ ਚੁੱਕੀ ਹੈ।",
    approveTooOld: "ਇਹ ਮਨਜ਼ੂਰੀ ਪ੍ਰੋਸੈਸ ਕਰਨ ਲਈ ਬਹੁਤ ਪੁਰਾਣੀ ਹੈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    approveRejected: "ਲੈਜਰ ਨੇ ਇਹ ਮਨਜ਼ੂਰੀ ਰੱਦ ਕਰ ਦਿੱਤੀ।",
    destinationUnavailable:
      "ਮੰਜ਼ਿਲ ਦੀ ਪੁਸ਼ਟੀ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    invalidAmount: (decimals: number) =>
      `0 ਤੋਂ ਵੱਧ ਰਕਮ ਦਰਜ ਕਰੋ, ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕਾਂ ਨਾਲ।`,
    transferFailed: "ਟ੍ਰਾਂਸਫਰ ਅਸਫਲ ਰਿਹਾ। ਮੰਜ਼ਿਲ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    amountLabel: (symbol: string) => `ਰਕਮ (${symbol})`,

    signedOutTitle: "ਆਪਣੇ ਟੋਕਨਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ",
    signedOutBody:
      "ਟ੍ਰਾਂਸਫਰ ਅਤੇ ਮਨਜ਼ੂਰੀਆਂ ਤੁਹਾਡੇ Internet Identity principal ਨਾਲ ਜੁੜੀਆਂ ਹਨ। ਜਾਰੀ ਰੱਖਣ ਲਈ ਹੈਡਰ ਤੋਂ ਸਾਈਨ ਇਨ ਕਰੋ।",
    balanceLabel: "ਤੁਹਾਡਾ ਬਕਾਇਆ",

    invalidRecipient: "ਇੱਕ ਵੈਧ ਪ੍ਰਾਪਤਕਰਤਾ Principal ID ਦਰਜ ਕਰੋ।",
    transferSent: (amount: string, symbol: string, to: string) =>
      `${amount} ${symbol} ${to} ਨੂੰ ਭੇਜੇ ਗਏ।`,
    toastTransfer: "ਟ੍ਰਾਂਸਫਰ ਪੂਰਾ ਹੋਇਆ",
    transferTitle: (symbol: string) => `${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ`,
    transferDescription: (fee: string, symbol: string) =>
      `ਆਪਣੇ principal ਤੋਂ ਕਿਸੇ ਹੋਰ ਖਾਤੇ ਵਿੱਚ ਟੋਕਨ ਭੇਜੋ। ${fee} ${symbol} ਦੀ ਟ੍ਰਾਂਸਫਰ ਫੀਸ ਤੁਹਾਡੇ ਬਕਾਏ ਵਿੱਚੋਂ ਕੱਟੀ ਜਾਂਦੀ ਹੈ ਅਤੇ ਫੀਸ ਕਲੈਕਟਰ ਦੇ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ।`,
    recipientLabel: "ਪ੍ਰਾਪਤਕਰਤਾ Principal",
    transferHint: (
      decimals: number,
      fee: string,
      symbol: string,
      from: string,
    ) =>
      `ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕ। ਫੀਸ: ${fee} ${symbol}। ${from} ਤੋਂ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ।`,
    sending: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    sendTokens: "ਟੋਕਨ ਭੇਜੋ",

    invalidSpender: "ਇੱਕ ਵੈਧ ਖਰਚਕਰਤਾ Principal ID ਦਰਜ ਕਰੋ।",
    invalidAllowance: (decimals: number) =>
      `0 ਤੋਂ ਵੱਧ ਮਨਜ਼ੂਰ ਰਕਮ ਦਰਜ ਕਰੋ, ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕਾਂ ਨਾਲ।`,
    approved: (amount: string, symbol: string, spender: string) =>
      `${spender} ਲਈ ${amount} ${symbol} ਮਨਜ਼ੂਰ ਕੀਤੇ ਗਏ।`,
    toastApproved: "ਮਨਜ਼ੂਰ ਰਕਮ ਪ੍ਰਵਾਨ ਹੋਈ",
    approvalFailed: "ਮਨਜ਼ੂਰੀ ਅਸਫਲ ਰਹੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    approveTitle: "ਖਰਚਕਰਤਾ ਨੂੰ ਮਨਜ਼ੂਰੀ ਦਿਓ",
    approveDescription:
      "ਕਿਸੇ ਹੋਰ principal ਨੂੰ ਤੁਹਾਡੀ ਤਰਫ਼ੋਂ ਟੋਕਨ ਟ੍ਰਾਂਸਫਰ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।",
    spenderLabel: "ਖਰਚਕਰਤਾ Principal",
    allowanceLabel: (symbol: string) => `ਮਨਜ਼ੂਰ ਰਕਮ (${symbol})`,
    approveHint: (decimals: number, symbol: string) =>
      `ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕ। ਮਨਜ਼ੂਰੀ 'ਤੇ ${symbol} ਟ੍ਰਾਂਸਫਰ ਫੀਸ ਲੱਗਦੀ ਹੈ।`,
    approving: "ਮਨਜ਼ੂਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    approveAllowance: "ਮਨਜ਼ੂਰ ਰਕਮ ਪ੍ਰਵਾਨ ਕਰੋ",
    currentAllowance: "ਮੌਜੂਦਾ ਮਨਜ਼ੂਰ ਰਕਮ",
    currentAllowanceFor: (spender: string) => `${spender} ਲਈ ਮੌਜੂਦਾ ਮਨਜ਼ੂਰ ਰਕਮ`,
    enterSpenderToView: "ਵੇਖਣ ਲਈ ਖਰਚਕਰਤਾ ਦਰਜ ਕਰੋ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",

    invalidFrom: "ਇੱਕ ਵੈਧ 'ਤੋਂ' Principal ID ਦਰਜ ਕਰੋ।",
    invalidTo: "ਇੱਕ ਵੈਧ 'ਨੂੰ' Principal ID ਦਰਜ ਕਰੋ।",
    transferredFrom: (
      amount: string,
      symbol: string,
      from: string,
      to: string,
    ) => `${amount} ${symbol} ${from} ਤੋਂ ${to} ਨੂੰ ਟ੍ਰਾਂਸਫਰ ਕੀਤੇ ਗਏ।`,
    toastTransferFrom: "ਮਨਜ਼ੂਰ ਰਕਮ ਤੋਂ ਟ੍ਰਾਂਸਫਰ ਪੂਰਾ ਹੋਇਆ",
    transferFromTitle: "ਮਨਜ਼ੂਰ ਰਕਮ ਤੋਂ ਟ੍ਰਾਂਸਫਰ ਕਰੋ",
    transferFromDescription:
      "ਤੁਹਾਨੂੰ ਦਿੱਤੀ ਗਈ ਮਨਜ਼ੂਰ ਰਕਮ ਵਰਤ ਕੇ ਕਿਸੇ ਹੋਰ principal ਦੇ ਖਾਤੇ ਤੋਂ ਟੋਕਨ ਭੇਜੋ।",
    fromLabel: "ਭੇਜਣ ਵਾਲਾ Principal",
    toLabel: "ਪ੍ਰਾਪਤ ਕਰਨ ਵਾਲਾ Principal",
    transferring: "ਟ੍ਰਾਂਸਫਰ ਹੋ ਰਿਹਾ ਹੈ...",
    transferFromButton: "ਇਸ ਤੋਂ ਟ੍ਰਾਂਸਫਰ ਕਰੋ",

    pageTitle: "ਟੋਕਨਾਂ ਦਾ ਪ੍ਰਬੰਧ",
    pageSubtitle: (symbol: string) =>
      `${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ, ਮਨਜ਼ੂਰ ਕਰੋ ਅਤੇ ਮਨਜ਼ੂਰ ਰਕਮਾਂ ਖਰਚੋ।`,
    feeBadge: (fee: string, symbol: string) => `ਫੀਸ ${fee} ${symbol}`,
    tabTransfer: "ਟ੍ਰਾਂਸਫਰ",
    tabApprove: "ਮਨਜ਼ੂਰ ਕਰੋ",
    tabTransferFrom: "ਇਸ ਤੋਂ ਟ੍ਰਾਂਸਫਰ",
  },
});

/** Transfer page explorer labels: block number shown after a transfer. */
export const TRANSFER_EXPLORER_TEXT = defineDict({
  en: {
    block: "Block",
    recordedInBlock: "Recorded in block",
    viewBlockInHistory: "View block in History",
  },
  fr: {
    block: "Bloc",
    recordedInBlock: "Enregistré dans le bloc",
    viewBlockInHistory: "Voir le bloc dans l'historique",
  },
  es: {
    block: "Bloque",
    recordedInBlock: "Registrado en el bloque",
    viewBlockInHistory: "Ver el bloque en el historial",
  },
  "zh-Hans": {
    block: "区块",
    recordedInBlock: "记录于区块",
    viewBlockInHistory: "在历史记录中查看区块",
  },
  "pt-BR": {
    block: "Bloco",
    recordedInBlock: "Registrado no bloco",
    viewBlockInHistory: "Ver o bloco no histórico",
  },
  ko: {
    block: "블록",
    recordedInBlock: "기록된 블록",
    viewBlockInHistory: "기록에서 블록 보기",
  },
  "pa-Guru": {
    block: "ਬਲਾਕ",
    recordedInBlock: "ਬਲਾਕ ਵਿੱਚ ਦਰਜ",
    viewBlockInHistory: "ਇਤਿਹਾਸ ਵਿੱਚ ਬਲਾਕ ਵੇਖੋ",
  },
});

export type TransferText = (typeof TRANSFER_TEXT)["en"];
