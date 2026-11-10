import type en from "./en";

const ptBR: typeof en = {
  description:
    "Troque ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT e os tokens listados na ICPSwap que você adicionar, por meio de um pool da ICPSwap, a partir da sua própria carteira.",
  from: "De",
  to: "Para",
  switchTokens: "Inverter os dois tokens",
  amount: "Valor",
  balance: (amount: string, symbol: string) => `Saldo: ${amount} ${symbol}`,
  sameToken: "Escolha dois tokens diferentes.",
  poolLoading: "Procurando o pool da ICPSwap…",
  poolError: "Não foi possível ler o pool da ICPSwap.",
  noPool: (a: string, b: string) =>
    `A ICPSwap não tem pool direto para ${a} e ${b}. Este par não pode ser trocado aqui.`,
  quoteLoading: "Lendo a cotação da ICPSwap…",
  quoteError: "O pool da ICPSwap não retornou uma cotação.",
  livePriceUnavailable:
    "O preço da ICPSwap em tempo real está indisponível, portanto a troca não foi iniciada. Tente novamente em instantes.",
  quoteExpired: "A cotação expirou. Atualize-a antes de trocar.",
  refreshQuote: "Atualizar cotação",
  estimated: "Valor estimado recebido",
  poolFee: "Taxa do pool",
  ledgerFees: "Taxas dos ledgers",
  ledgerFeesValue: (inFees: string, outFee: string) =>
    `${inFees} (autorização e depósito) + ${outFee} (saque)`,
  minimumReceived: "Mínimo garantido recebido",
  slippage: "Tolerância de slippage",
  slippageHint:
    "A ICPSwap recusa a troca se o valor obtido for inferior ao mínimo garantido.",
  slippageInvalid: "Informe uma tolerância entre 0,01 % e 50 %.",
  amountInvalid: (symbol: string) => `Informe um valor de ${symbol} válido.`,
  insufficient: (max: string, symbol: string) =>
    `Valor acima do saldo utilizável. Máximo: ${max} ${symbol} (saldo menos as taxas de autorização e depósito).`,
  tooSmall: "O valor estimado não cobre a taxa de saque.",
  connectHint: "Conecte uma carteira para trocar.",
  review: "Revisar a troca",
  confirmTitle: "O que você assina",
  confirmApproval: (amount: string, symbol: string, pool: string) =>
    `Uma autorização ICRC-2 que permite ao pool da ICPSwap ${pool} retirar exatamente ${amount} ${symbol} (valor trocado mais uma taxa de ledger) da sua conta.`,
  confirmExpiry: (time: string) =>
    `A autorização expira 15 minutos após a assinatura (por volta de ${time}).`,
  confirmSteps: (symbolIn: string, symbolOut: string) =>
    `Em seguida, o pool retira os ${symbolIn} (depósito), faz a troca e envia os ${symbolOut} para a sua carteira (saque). Sua carteira pode pedir a confirmação de cada etapa.`,
  confirmMinimum: (amount: string, symbol: string) =>
    `Mínimo recebido: ${amount} ${symbol}. Abaixo disso, a troca é recusada.`,
  confirmSigner: (wallet: string) =>
    `Assinado por ${wallet}, que detém esta conta.`,
  warning:
    "A ICPSwap é uma plataforma de troca de terceiros. As trocas são definitivas e as taxas dos ledgers não são reembolsadas. Se uma etapa falhar, o valor depositado fica no pool até que você o retire.",
  confirmCheck: "Li o que assino e confirmo esta troca.",
  confirm: "Confirmar e assinar",
  back: "Voltar",
  stepApprove: "Autorização na carteira…",
  stepDeposit: "Depósito no pool…",
  stepSwap: "Troca…",
  stepWithdraw: "Saque para a sua carteira…",
  refused: "A assinatura foi recusada. Nada foi trocado.",
  slippageError:
    "O pool recusou a troca: o valor obtido seria inferior ao mínimo garantido. Atualize a cotação ou aumente a tolerância.",
  failed: (detail: string) => `A troca não foi concluída: ${detail}`,
  success: (amount: string, symbol: string) =>
    `Troca concluída. ${amount} ${symbol} recebidos na sua carteira.`,
  newSwap: "Nova troca",
  unusedTitle: "Saldo restante no pool da ICPSwap",
  unusedText:
    "O pool mantém este valor para a sua conta após uma troca incompleta.",
  dexBalanceTitle: "Saldo restante na DEX",
  dexBalanceText:
    "A DEX mantém este valor para a sua conta após uma troca incompleta.",
  withdrawUnused: "Sacar para minha carteira",
  withdrawing: "Sacando…",
  withdrawDone: "Saldo sacado para a sua carteira.",
  withdrawFailed: (detail: string) => `O saque falhou: ${detail}`,
  feeError: "Não foi possível ler a taxa do ledger do token. Tente novamente.",
  addToken: "Adicionar um token",
  addTokenLabel: "Símbolo ou ID do ledger",
  addTokenHint:
    "Pesquise um token listado na ICPSwap pelo símbolo ou cole o ID do ledger. Os tokens adicionados ficam salvos neste navegador e aparecem apenas neste seletor.",
  addTokenSubmit: "Adicionar",
  addTokenReading: "Lendo o ledger do token…",
  addTokenListLoading: "Lendo a lista de tokens da ICPSwap…",
  addTokenListError:
    "Não foi possível ler a lista de tokens da ICPSwap. Cole o ID do ledger.",
  addTokenNoMatch:
    "Nenhum token listado na ICPSwap corresponde a este símbolo. Cole o ID do ledger.",
  addTokenInvalidId: "ID de ledger inválido.",
  addTokenNotIcrc:
    "Este canister não retornou metadados de token ICRC-1. Ele não pode ser adicionado.",
  addTokenAlready: (symbol: string) => `${symbol} já está na lista.`,
  addTokenDone: (symbol: string) => `${symbol} adicionado.`,
  addedTokens: "Tokens adicionados",
  removeToken: (symbol: string) => `Remover ${symbol}`,
  closeAddToken: "Fechar",
  unifiedDescription:
    "Troque ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT e os tokens listados na ICPSwap que você adicionar, pelos pools nativos ou pela ICPSwap, a partir da sua própria carteira.",
  routesTitle: "Rotas",
  routeBestPrice: "Melhor preço",
  routeSelected: "Selecionada",
  routeEnterAmount: "Informe um valor para ver a cotação desta rota.",
  routeQuoteLoading: "Lendo a cotação…",
  routeNativeNoPool: (a: string, b: string) =>
    `Não existe pool nativo para ${a} e ${b}.`,
  routeIcpswapNoPool: (a: string, b: string) =>
    `A ICPSwap não tem pool direto para ${a} e ${b}.`,
  routeNativeAccount:
    "A rota pelo pool nativo só está disponível para a conta conectada neste site.",
  routeNativeError: "O pool nativo não retornou uma cotação.",
  routeOnlyIcpswap: "Apenas a ICPSwap é oferecida para este par.",
  routeOnlyNative: "Apenas o pool nativo é oferecido para este par.",
  bestPriceNote:
    "Melhor preço: a rota que devolve mais tokens, taxas incluídas. A rota que você seleciona é a executada.",
  routeUsed: "Rota utilizada",
  amountGiven: "Valor entregue",
  confirmNativeApproval: (amount: string, symbol: string) =>
    `Uma aprovação ICRC-2 que permite à DEX retirar até ${amount} ${symbol} (valor da troca mais uma taxa do ledger) da sua conta.`,
  confirmNativeSteps: (symbolIn: string, symbolOut: string) =>
    `A DEX então retira os ${symbolIn} (depósito), troca no pool nativo e envia os ${symbolOut} para a sua carteira (saque).`,
  warningNative:
    "As trocas são definitivas e as taxas do ledger não são reembolsadas. Se o saque falhar, o valor trocado permanece no seu saldo da DEX.",
  nativeWithdrawFailed: (amount: string, symbol: string, detail: string) =>
    `A troca foi concluída, mas o saque de ${amount} ${symbol} para a sua carteira falhou: ${detail}. O valor permanece no seu saldo da DEX.`,
};

export default ptBR;
