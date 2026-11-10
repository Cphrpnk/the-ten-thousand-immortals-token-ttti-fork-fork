import type en from "./en";

const ptBR: typeof en = {
  title: "Valor dos pools e capitalização",
  loading: "Carregando…",
  loadError: "Não foi possível carregar os valores.",
  retry: "Tentar novamente",
  notAvailable: "Indisponível",
  poolsValue: "Valor dos pools",
  capitalisation: "Capitalização",
  currentRatio: "Razão atual",
  averageRatio: "Razão média de 24 horas",
  targetRatio: "Razão-alvo",
  lockedShare: "Parcela bloqueada m",
  samples: (count: string) => `${count} amostras`,
  computedAt: (date: string) => `Calculado em ${date}`,
  noteNoPoolsValue:
    "Sem valor dos pools: nenhum pool TTTI-T aberto ou nenhuma taxa válida.",
  noteNoCapitalisation: "Nenhuma capitalização disponível.",
  referencePrice: "Preço de referência da capitalização por TTTI-T (alvo)",
  referencePriceNote:
    "A capitalização e o valor dos pools são medidos com o alvo de 10.000 USD por TTTI-T.",
  consolidatedInfo: "Preço consolidado por TTTI-T (apenas informativo)",
  noteNoRatio: "Exige o valor dos pools e a capitalização.",
  noteNoAverage: "Nenhuma amostra da razão registrada ainda.",
  noteLockedDefault:
    "Ainda sem razão retida: a parcela bloqueada é o máximo, 50 %.",
  definitionsToggle: "Definições",
  defPoolsValue:
    "Valor dos pools: 2 vezes a reserva da contraparte de cada pool TTTI-T, às taxas do oráculo. O valor dos pools é medido com o alvo de 10.000 USD por TTTI-T.",
  defCapitalisation:
    "Capitalização: TTTI-T em circulação multiplicado pelo alvo de 10.000 USD por TTTI-T, medido no mesmo momento que o valor dos pools. O preço consolidado é exibido apenas a título informativo.",
  defRatio: "Razão: valor dos pools dividido pela capitalização.",
  defLockedShare:
    "Parcela bloqueada m: derivada da razão retida, a menor entre a razão atual e a média de 24 horas.",
};

export default ptBR;
