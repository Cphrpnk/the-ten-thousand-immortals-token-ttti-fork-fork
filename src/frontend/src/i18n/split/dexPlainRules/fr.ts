import type en from "./en";

const fr: typeof en = {
  noReward:
    "Aucune récompense n'est créée. Tout ce qui est versé a d'abord été payé par quelqu'un (minteurs, traders, transferts), et chacun peut le vérifier.",
  observedYield:
    "Le TTTI-T ne génère rien par lui-même. Les frais de swap rémunèrent la liquidité fournie. Seuls les frais réellement versés au cours des 30 derniers jours sont affichés, par exemple : ce pool a versé X en frais au cours des 30 derniers jours.",
  permanentDepth:
    "La liquidité permanente est une gestion de la profondeur : un rééquilibrage mécanique et public de la part du protocole, jamais conditionné au prix.",
  ilTitle: "Perte impermanente",
  il: "Une position de liquidité détient une part du pool, et non un montant fixe de chaque jeton. Lorsque le prix du pool varie, la position peut valoir moins que les mêmes jetons conservés hors du pool, quels que soient les frais perçus.",
  exposureTitle: "Exposition au BTC et à l'ICP",
  exposure:
    "Par ses pools, le TTTI-T est exposé au BTC et à l'ICP : le côté TTTI-T d'une position est associé à l'ICP, au ckBTC, au ckUSDC ou au ckUSDT, de sorte que sa valeur en ces jetons suit celle du pool.",
  zapTitle: "Zap du mint",
  zap: "Le zap est un échange automatique réalisé avec l'argent du minteur au moment du mint, afin que le reste puisse être déposé au ratio du pool.",
  guaranteeTitle: "Réserve commune et rachat",
  guarantee:
    "Rachat auprès de la réserve commune : 1 TTTI-T se rachète au maximum 10 000 USD, sans frais. Pour x TTTI-T rendus au contrat, le paiement est le plus faible de 10 000 USD × x et de (la réserve ÷ le TTTI-T en circulation hors du contrat) × x, versé au prorata de la composition de la réserve, en ICP, ckBTC, ckUSDC et ckUSDT. Minter q TTTI-T coûte (10 000 USD + la liquidité apportée) × q ÷ 0,99, dont 10 000 USD × q vont à la réserve commune et 1 % du montant payé va au créateur ; le reste est la liquidité apportée, qui reste dans la position du minteur.",
  refusedDeposits:
    "Un dépôt de demande de paire refusée, dans n'importe quel jeton (TTTI-T compris), rejoint la liquidité permanente mise de côté ; le routeur le rééquilibre et l'injecte au ratio du pool.",
  chance:
    "Au mint, chaque minteur a la même chance. Aux enchères, les offres les plus élevées l'emportent, par ordre de prix, jusqu'à ce que le lot soit vendu.",
  auctionRules:
    "Les enchères sont à offres scellées : chaque enchérisseur paie sa propre offre. Le prix de réserve est le plus élevé entre 10 000 USD par TTTI-T, la moyenne sur 24 heures du prix consolidé et le prix consolidé actuel. Rien n'est réémis en dessous de 10 000 USD.",
};

export default fr;
