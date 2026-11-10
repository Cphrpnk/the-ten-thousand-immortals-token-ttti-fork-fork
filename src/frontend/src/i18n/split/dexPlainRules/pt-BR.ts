import type en from "./en";

const ptBR: typeof en = {
  noReward:
    "Nenhuma recompensa é criada. Tudo o que é pago foi antes pago por alguém (minters, traders, transferências), e qualquer pessoa pode verificar.",
  observedYield:
    "O TTTI-T não gera nada por si só. As taxas de swap remuneram a liquidez fornecida. Apenas as taxas efetivamente pagas nos últimos 30 dias são exibidas, por exemplo: este pool pagou X em taxas nos últimos 30 dias.",
  permanentDepth:
    "A liquidez permanente é uma gestão de profundidade: um reequilíbrio mecânico e público da parte do protocolo, nunca condicionado ao preço.",
  ilTitle: "Perda impermanente",
  il: "Uma posição de liquidez detém uma parte do pool, e não uma quantidade fixa de cada token. Quando o preço do pool se move, a posição pode valer menos do que os mesmos tokens mantidos fora do pool, quaisquer que tenham sido as taxas recebidas.",
  exposureTitle: "Exposição a BTC e ICP",
  exposure:
    "Por meio de seus pools, o TTTI-T está exposto a BTC e ICP: o lado TTTI-T de uma posição é pareado com ICP, ckBTC, ckUSDC ou ckUSDT, de modo que seu valor nesses tokens acompanha o do pool.",
  zapTitle: "Zap do mint",
  zap: "O zap é uma troca automática feita com o dinheiro do minter no momento do mint, para que o restante possa ser depositado na proporção do pool.",
  guaranteeTitle: "Reserva comum e resgate",
  guarantee:
    "Resgate na reserva comum: 1 TTTI-T é resgatado por no máximo 10.000 USD, sem taxa. Para x TTTI-T devolvidos ao contrato, o pagamento é o menor valor entre 10.000 USD × x e (a reserva ÷ o TTTI-T em circulação fora do contrato) × x, pago proporcionalmente à composição da reserva, em ICP, ckBTC, ckUSDC e ckUSDT. Mintar q TTTI-T custa (10.000 USD + a liquidez aportada) × q ÷ 0,99, dos quais 10.000 USD × q vão para a reserva comum e 1% do valor pago vai para o criador; o restante é a liquidez aportada, que permanece na posição do minter.",
  refusedDeposits:
    "O depósito de uma solicitação de par recusada, em qualquer token (inclusive TTTI-T), vai para a liquidez permanente reservada; o roteador o reequilibra e o injeta na proporção do pool.",
  chance:
    "No mint, cada minter tem a mesma chance. Nos leilões, vencem os maiores lances, em ordem de preço, até que o lote seja vendido.",
  auctionRules:
    "Os leilões são de lance selado: cada licitante paga o próprio lance. O preço de reserva é o maior entre 10.000 USD por TTTI-T, a média de 24 horas do preço consolidado e o preço consolidado atual. Nada é reemitido abaixo de 10.000 USD.",
};

export default ptBR;
