import mintRule from "../mintRule/pt-BR";
import type en from "./en";

const ptBR: typeof en = {
  eyebrow: "Documentos / White paper",
  title: "Os Dez Mil Imortais",
  subtitle: "A edição corrigida, alinhada ao código-fonte atual do aplicativo.",
  identityHeading: "Identidade desta edição",
  identityBefore: "O nome e o símbolo do ledger são ambos ",
  identityAfter:
    ", o teste em operação. TTTI é a versão futura. Transações mais antigas podem usar uma codificação decimal anterior.",
  contentsAria: "Sumário da edição corrigida",
  contentsHeading: "Sumário",
  contentsReading: "Leia isto primeiro",
  contentsLedger: "Token e oferta",
  contentsMechanics: "Mecânica de compra",
  mintInfoHeading: "Buy-to-mint",
  contentsControls: "Controles e riscos",
  contentsDisclosures: "Declarações do criador",
  contentsPrivacy: "Privacidade",
  contentsVerification: "Verificação",
  readingEyebrow: "Edição corrigida / alinhada ao código-fonte",
  readingTitle: "01 / Leia isto primeiro",
  readingP1: `TTTI é um token meme especulativo, e não um direito sobre uma empresa nem uma promessa de lucro. Ele não tem valor intrínseco, direitos sobre receitas nem mercado garantido. ${mintRule.all} O depósito de uma solicitação de par recusada, em qualquer token (inclusive TTTI-T), vai para a liquidez permanente reservada; o roteador o reequilibra e o injeta na proporção do pool. Não há promessa de valor. Seu preço de mercado, se houver, pode cair a zero. Não compre com dinheiro que você não possa se dar ao luxo de perder por completo.`,
  readingP2:
    "Esta edição explica o que o código-fonte atual do aplicativo implementa. Ela não é prova de uma implantação específica, nem uma auditoria independente, nem um saldo de conta em tempo real, nem uma garantia de que uma compra possa ser concluída agora.",
  englishOnlyNotice:
    "As seções 02 a 07 abaixo estão disponíveis somente em inglês.",
};

export default ptBR;
