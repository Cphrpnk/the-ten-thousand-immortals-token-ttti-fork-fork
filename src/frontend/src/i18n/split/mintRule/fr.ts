import type en from "./en";

const share =
  "À chaque mint, une part verrouillée m des TTTI-T frappés est poolée avec ses dollars de contrepartie et verrouillée au nom du minteur. m est calculée au moment du paiement à partir du ratio entre la valeur des pools et la capitalisation, entre 0 % et 50 %, et elle est enregistrée avec la position. Le relais libère ce verrou au plus tard après 3 mois.";
const remainder =
  "Le reste (1 − m) est choisi par le minteur avant de payer. Choix A : il est poolé lui aussi, sans verrou ; la position peut être retirée à tout moment ou verrouillée volontairement de 3 mois à 5 ans. Choix B : le minteur garde ces TTTI-T dans son wallet et ne paie pas la liquidité correspondante.";
const payment =
  "Le paiement est (10 000 USD + la liquidité apportée par TTTI-T) × q ÷ 0,99, où la liquidité apportée par TTTI-T est de 10 000 USD au choix A et de m × 10 000 USD au choix B. 10 000 USD × q vont toujours à la réserve commune ; 1 % du montant payé va au créateur, après la réserve de cycles. Le TTTI-T n'entre jamais dans un pool sans ses dollars de contrepartie. Au règlement d'une enchère, la même règle s'applique, avec le prix B du gagnant à la place de 10 000 USD pour la part de position.";
const redemption =
  "Rachat auprès de la réserve commune : 1 TTTI-T se rachète au maximum 10 000 USD, sans frais. Pour x TTTI-T rendus au contrat, le paiement est le plus faible de 10 000 USD × x et de (la réserve ÷ le TTTI-T en circulation hors du contrat) × x, versé au prorata de la composition de la réserve, en ICP, ckBTC, ckUSDC et ckUSDT.";

const fr: typeof en = {
  share,
  remainder,
  payment,
  redemption,
  all: `${share} ${remainder} ${payment} ${redemption}`,
};

export default fr;
