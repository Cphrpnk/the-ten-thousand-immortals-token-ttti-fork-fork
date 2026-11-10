import type en from "./en";

const ptBR: typeof en = {
  title: "Resgate",
  ruleSummary: "1 TTTI-T é resgatado por no máximo 10.000 USD, sem taxa.",
  rulePayout:
    "O valor pago é o menor entre 10.000 USD × x e a reserva dividida pelos TTTI-T em circulação fora do contrato × x, em que x são os TTTI-T resgatados.",
  rulePayment:
    "É pago em ICP, ckBTC, ckUSDC e ckUSDT, na proporção da composição da reserva. Um resgate não pode exceder os TTTI-T em circulação fora do contrato.",
  ruleAnyHolder:
    "A reserva é comum a todos os detentores. Qualquer detentor pode resgatar, inclusive quem nunca fez mint.",
  ruleMintLock:
    "No mint, uma parte variável m dos TTTI-T é colocada no pool e bloqueada em nome de quem faz o mint. O revezamento a libera após 3 meses, no máximo.",
  ruleMintChoice:
    "Antes de pagar, quem faz o mint escolhe colocar o restante (1 − m) no pool (opção A) ou mantê-lo na carteira (opção B).",
  ruleMintReserve:
    "A reserva comum recebe 10.000 USD por TTTI-T mintado, qualquer que seja a escolha. É calculada em USD e mantida no token pago (ICP, ckBTC, ckUSDC ou ckUSDT), sem conversão.",
  redeemHeldNote:
    "Qualquer TTTI-T mantido pode ser resgatado por até 10.000 USD da reserva comum, inclusive o TTTI-T mantido na carteira na opção B.",
  signInPrompt: "Entre para resgatar TTTI-T.",
  loadError: "Não foi possível carregar seus resgates.",
  retryButton: "Tentar novamente",
  reserveTitle: "Reserva",
  reserveLoading: "Carregando a reserva…",
  reserveLoadError: "Não foi possível carregar a reserva.",
  reserveTotalLabel: "Reserva (USD)",
  reserveTokenLabel: (symbol: string) => `Reserva em ${symbol}`,
  circulationLabel: "TTTI-T em circulação fora do contrato",
  reservePerTtiLabel: "Reserva por TTTI-T",
  reservePerTtttiNone: "Nenhum TTTI-T em circulação",
  requiredLabel: "Exigido (10.000 USD × circulação)",
  invariantLabel: "Invariante",
  invariantHolds: "Reserva pelo menos igual ao valor exigido",
  invariantBroken: "Reserva abaixo do valor exigido",
  shortfallLabel: "Déficit",
  shortfallNone: "Nenhum",
  reserveRateMissing: (symbol: string) => `sem taxa para ${symbol}`,
  redeemTitle: "Resgatar",
  redeemIntro:
    "Devolva TTTI-T contra a reserva comum. A prévia mostra o valor exato recebido antes de qualquer assinatura.",
  amountLabel: "TTTI-T a resgatar",
  amountPlaceholder: "0,0",
  maxButton: "Máx.",
  amountInvalid: "Informe um valor maior que zero.",
  redeemButton: "Resgatar",
  redeemingButton: "Resgatando…",
  previewTitle: "Prévia",
  previewLoading: "Calculando…",
  previewCap: "10.000 USD × x",
  previewReserveShare: "Reserva ÷ circulação fora do contrato × x",
  previewPaidIn: (symbol: string) => `Pago em ${symbol}`,
  previewCirculation: "TTTI-T em circulação fora do contrato",
  previewNet: "Você recebe (o menor dos dois)",
  previewUsdNote: "Os valores em USD usam as taxas desta prévia.",
  previewLedgerFeeNote:
    "As taxas de ledger do pagamento não são deduzidas do valor recebido.",
  returnedTttiNote:
    "Os TTTI-T devolvidos ficam com o contrato e saem da circulação fora do contrato. Nada é queimado.",
  allowanceTitle: "Aprovação de TTTI-T",
  allowanceExplain: (amount: string, fee: string, required: string) =>
    `Devolver TTTI-T exige uma aprovação ICRC-2 pelo valor devolvido mais a taxa de ledger do TTTI-T: ${amount} + ${fee} = ${required}.`,
  allowanceCurrent: (allowance: string) => `Aprovação atual: ${allowance}`,
  allowanceOk: "A aprovação atual cobre este resgate.",
  allowanceMissing:
    "A aprovação atual não é suficiente. Ela é solicitada antes do resgate.",
  approvingButton: "Aprovando…",
  allowanceExpiryNote:
    "Uma aprovação sempre tem validade. Confira o valor e a data na sua carteira antes de confirmar.",
  historyTitle: "Meus resgates",
  historyEmpty: "Nenhum resgate ainda.",
  statusCompleted: "Concluído",
  statusInProgress: "Em andamento",
  statusNeedsReview: "A verificar",
  statusFailed: "Falhou",
  historyReturned: "TTTI-T devolvidos",
  historyNet: "Recebido",
  historyPullBlock: "Bloco TTTI-T",
  historyPayoutBlock: "Bloco do pagamento",
  resultCompleted: (net: string) => `Concluído. Você recebeu ${net}.`,
  resultInProgress:
    "O pagamento está em andamento. Ele aparece na lista abaixo quando concluído.",
  resultNeedsReview:
    "O pagamento precisa ser verificado. Ele permanece na lista abaixo com seu status.",
  resultFailed: "O pagamento não foi concluído.",
  errAnonymous: "Entre para resgatar.",
  errSalesPaused: "Os resgates estão pausados.",
  errAmountTooSmall:
    "O valor é pequeno demais para ser pago. O resgate não é possível.",
  errAmountExceedsCirculation: (requested: string, circulation: string) =>
    `O valor ${requested} excede os TTTI-T em circulação fora do contrato: ${circulation}.`,
  errReserveEmpty: "A reserva está vazia. O resgate não é possível.",
  errRateUnavailable: (symbol: string) =>
    `Nenhuma taxa disponível para ${symbol} no momento. Tente novamente mais tarde.`,
  errLedgerFeeNotCovered: (symbol: string, fee: string) =>
    `O valor não cobre a taxa de ledger de ${symbol} do pagamento (${fee}). O resgate não é possível.`,
  errTttiBalance: (balance: string, required: string) =>
    `O saldo de TTTI-T é ${balance}; são necessários ${required}.`,
  errAllowance: (allowance: string, required: string) =>
    `A aprovação de TTTI-T é ${allowance}; são necessários ${required}.`,
  errSlippage: (payout: string, expected: string) =>
    `O valor recebido seria ${payout}, inferior aos ${expected} mostrados na prévia. Atualize a prévia e tente novamente.`,
  errRedemptionInProgress: "Já há um resgate em andamento.",
  errNothingToConvert: "Não há nada a converter para esta operação.",
  errConversionFailed: (detail: string) => `A conversão falhou: ${detail}`,
  errPullFailed: (detail: string) =>
    `Não foi possível coletar os TTTI-T: ${detail}`,
  errCallFailed: (detail: string) => `A solicitação falhou: ${detail}`,
  errInvalidAmount: "Informe um valor válido.",
  errAcknowledgementRequired:
    "Os termos da carteira precisam ser aceitos antes de resgatar. Abra a etapa de aceite, aceite os termos e resgate novamente.",
  acceptanceChecking: "Verificando os termos da carteira…",
  acceptanceMissing:
    "Os termos da carteira não foram aceitos para esta conta. Eles precisam ser aceitos antes de resgatar.",
  openAcceptanceButton: "Revisar e aceitar os termos da carteira",
  percentShare: "Parte do valor resgatável",
  percentComputedOn:
    "Calculado sobre o valor resgatável: o menor entre os TTTI-T mantidos e os TTTI-T em circulação fora do contrato.",
  balanceNone: "Esta carteira não tem TTTI-T resgatáveis.",
  heldLabel: "TTTI-T mantidos",
  limitedByBalance: (held: string, max: string) =>
    `Os TTTI-T mantidos (${held}) limitam o valor a ${max}.`,
  limitedByCirculation: (circulation: string, max: string) =>
    `Os TTTI-T em circulação fora do contrato (${circulation}) limitam o valor a ${max}.`,
  confirmTitle: "Confirmar resgate",
  confirmIntro:
    "Você assina uma aprovação ICRC-2 de TTTI-T para o contrato. Em seguida, o contrato coleta os TTTI-T e paga o valor mostrado, nos tokens da reserva (ICP, ckBTC, ckUSDC e ckUSDT).",
  confirmExpiry: "A aprovação expira em 15 minutos.",
  closeButton: "Fechar",
  cancelButton: "Cancelar",
  resultTitle: "Resultado",
};

export default ptBR;
