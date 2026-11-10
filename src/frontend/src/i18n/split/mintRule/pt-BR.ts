import type en from "./en";

const share =
  "A cada mint, uma parte bloqueada m dos TTTI-T mintados é colocada no pool junto com seus dólares de contrapartida e bloqueada em nome do minter. m é calculada no momento do pagamento a partir da razão entre o valor dos pools e a capitalização, entre 0 % e 50 %, e é registrada com a posição. O revezamento libera esse bloqueio, no máximo, após 3 meses.";
const remainder =
  "O restante (1 − m) é escolhido pelo minter antes de pagar. Escolha A: também é colocado no pool, sem bloqueio; a posição pode ser retirada a qualquer momento ou bloqueada voluntariamente de 3 meses a 5 anos. Escolha B: o minter mantém esses TTTI-T na carteira e não paga a liquidez correspondente.";
const payment =
  "O pagamento é (10.000 USD + a liquidez aportada por TTTI-T) × q ÷ 0,99, em que a liquidez aportada por TTTI-T é de 10.000 USD na escolha A e de m × 10.000 USD na escolha B. 10.000 USD × q vão sempre para a reserva comum; 1 % do valor pago vai para o criador, após a reserva de ciclos. O TTTI-T nunca entra em um pool sem seus dólares de contrapartida. Na liquidação de um leilão, aplica-se a mesma regra, com o preço B do vencedor no lugar de 10.000 USD para a parte da posição.";
const redemption =
  "Resgate na reserva comum: 1 TTTI-T é resgatado por no máximo 10.000 USD, sem taxa. Para x TTTI-T devolvidos ao contrato, o pagamento é o menor valor entre 10.000 USD × x e (a reserva ÷ o TTTI-T em circulação fora do contrato) × x, pago proporcionalmente à composição da reserva, em ICP, ckBTC, ckUSDC e ckUSDT.";

const ptBR: typeof en = {
  share,
  remainder,
  payment,
  redemption,
  all: `${share} ${remainder} ${payment} ${redemption}`,
};

export default ptBR;
