import mintRule from "../mintRule/pt-BR";
import type en from "./en";

const ptBR: typeof en = {
  label: "Versão de teste",
  intro:
    "Esta é uma versão de teste: um token, TTTI-T, 10.000 USD no total, a partir de 1 USD. Mesmo preço de qualquer TTTI futuro: sem desconto, sem bônus, sem vantagem. Se algum dia houver uma versão completa, TTTI-T será convertido 1:1 em TTTI. Pode ser que nunca haja uma versão completa.",
  errorText:
    "Os números da alocação ao vivo estão temporariamente indisponíveis.",
  retry: "Tentar novamente",
  statusComplete: "Alocação concluída",
  statusPaused: "Compras pausadas",
  statusCurrent: "Alocação atual",
  pricePerToken: "Preço por TTTI-T (antes da taxa)",
  totalSupply: "Oferta total",
  remaining: "Restante",
  progressAria: (percent: string) =>
    `Oferta total: ${percent}% da oferta máxima`,
  totalSupplyLine: (
    total: string,
    max: string,
    symbol: string,
    percent: string,
  ) => `Oferta total: ${total} / ${max} ${symbol} (${percent}%)`,
  disclosuresTitle: "Declarações do criador",
  disclosure1: `${mintRule.all} O depósito de uma solicitação de par recusada, em qualquer token (inclusive TTTI-T), vai para a liquidez permanente reservada. As posições do criador são declaradas e públicas: os valores mantidos para o criador, por token, constam na página Pools. O criador não defende nenhum preço nem negocia para gerar volume. Qualquer pessoa, inclusive o criador, pode fornecer liquidez a seu critério e retirá-la conforme as regras de bloqueio. Confie apenas no que você puder verificar.`,
  disclosure2:
    "TTTI e THAT têm o mesmo criador. TTTI não tem nenhum vínculo com THAT: não pode ser trocado por THAT, nem usado dentro de THAT, nem convertido em qualquer outra coisa.",
};

export default ptBR;
