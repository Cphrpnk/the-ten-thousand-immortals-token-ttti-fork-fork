import type en from "./en";

const ptBR: typeof en = {
  label: "Perguntas",
  title: "Antes de cunhar",
  intro:
    "Respostas claras sobre o token, as carteiras e como funciona a cunhagem.",
  whatQ: "O que é TTTI-T?",
  whatA:
    "TTTI-T é a versão de teste do TTTI, uma moeda de troca no Internet Computer. O ledger usa 8 casas decimais, e esta versão de teste contém um token. O pagamento é feito em ICP, ckBTC, ckUSDC ou ckUSDT, conforme a regra do mint explicada na pergunta seguinte.",
  mintRuleQ: "Como é calculado o pagamento de um mint?",
  noReturns: "Não há promessa de retorno de qualquer tipo.",
  icpQ: "Como consigo ICP?",
  icpBefore:
    "TTTI-T é cunhado com ICP. Se você ainda não tem, acesse primeiro ",
  icpLink: "Obter ICP",
  icpAfter:
    " para conhecer formas confiáveis de comprar ICP e enviá-lo à sua carteira; depois volte para cunhar.",
  btcQ: "Posso pagar em BTC?",
  rateQ: "Como a cotação em USD é definida?",
  walletsQ: "Quais carteiras são compatíveis?",
  walletsA:
    "Você pode entrar com Internet Identity ou com a carteira Plug. As duas mantêm o controle com você: o app lê seus saldos e você mesmo assina cada transferência.",
  whereQ: "Onde aparecem os tokens cunhados?",
  whereBefore:
    "O TTTI-T cunhado é entregue na conta com a qual você entrou. Ele aparece em TTTI-T na ",
  whereLink: "página Carteira",
  whereAfter:
    ". Se preferir, você pode adicionar um endereço de entrega opcional (um Principal ID) antes de cunhar — ele nunca é obrigatório.",
  supplyQ: "Quantos tokens podem existir?",
  supplyIntro: "TTTI é a versão futura; TTTI-T é o teste em andamento.",
  liquidityQ: "Como funcionam os pools de liquidez?",
  liquidityA:
    "Qualquer pessoa pode fornecer liquidez e retirá-la. As posições de liquidez são públicas e vinculadas ao identificador no TTTI. O protocolo nunca coloca uma ordem vinculada ao preço e não cria nenhum TTTI-T. A liquidez permanente é uma gestão de profundidade: um reequilíbrio mecânico e público da parte do protocolo, nunca condicionado ao preço. Apenas o rendimento observado, ou seja, as taxas efetivamente pagas nos últimos 30 dias, é exibido. Não há promessa de retorno.",
  privacyQ: "O que é público e o que o app guarda?",
  privacyA:
    "Cada compra e cada transferência é registrada de forma pública e permanente no ledger do token utilizado: ICP, ckBTC, ckUSDC, ckUSDT ou TTTI-T. Qualquer pessoa pode ver os valores, as contas e os horários. As transferências de Bitcoin são públicas na blockchain do Bitcoin: qualquer pessoa pode ver seus identificadores de transação (txids), seus endereços e seus valores. Além disso, o app guarda apenas seus registros de compra com seus valores e números de bloco, seu endereço de entrega, a data em que você aceitou os termos de compra e seus acompanhamentos de depósitos BTC (endereço de depósito, txids e status de cada depósito).",
};

export default ptBR;
