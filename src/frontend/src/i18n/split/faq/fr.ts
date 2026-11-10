import type en from "./en";

const fr: typeof en = {
  label: "Questions",
  title: "Avant de frapper",
  intro:
    "Des réponses claires sur le jeton, les wallets et le déroulement de la frappe.",
  whatQ: "Qu'est-ce que TTTI-T ?",
  whatA:
    "TTTI-T est la version de test de TTTI, une monnaie d'échange sur l'Internet Computer. Le ledger utilise 8 décimales, et cette version de test contient un jeton. Le paiement se fait en ICP, ckBTC, ckUSDC ou ckUSDT, selon la règle du mint expliquée à la question suivante.",
  mintRuleQ: "Comment le paiement d'un mint est-il calculé ?",
  noReturns: "Il n'existe aucune promesse de rendement d'aucune sorte.",
  icpQ: "Comment obtenir de l'ICP ?",
  icpBefore:
    "TTTI-T se frappe avec de l'ICP. Si vous n'en détenez pas encore, consultez d'abord ",
  icpLink: "Obtenir de l'ICP",
  icpAfter:
    " pour des moyens fiables d'acheter de l'ICP et de l'envoyer dans votre wallet, puis revenez frapper.",
  btcQ: "Puis-je payer en BTC ?",
  rateQ: "Comment le taux USD est-il fixé ?",
  walletsQ: "Quels wallets sont pris en charge ?",
  walletsA:
    "Vous pouvez vous connecter avec Internet Identity ou avec le wallet Plug. Les deux vous laissent le contrôle : l'app lit vos soldes et vous signez vous-même chaque transfert.",
  whereQ: "Où apparaissent les jetons frappés ?",
  whereBefore:
    "Le TTTI-T frappé est livré sur le compte avec lequel vous vous êtes connecté. Il apparaît sous TTTI-T sur la ",
  whereLink: "page Portefeuille",
  whereAfter:
    ". Si vous le souhaitez, vous pouvez ajouter une adresse de livraison facultative (un Principal ID) avant de frapper — elle n'est jamais obligatoire.",
  supplyQ: "Combien de jetons peuvent exister ?",
  supplyIntro: "TTTI est la version future ; TTTI-T est le test en cours.",
  liquidityQ: "Comment fonctionnent les pools de liquidité ?",
  liquidityA:
    "Toute personne peut apporter de la liquidité et la retirer. Les positions de liquidité sont publiques et liées à l'identifiant sur TTTI. Le protocole ne passe jamais d'ordre lié au prix et ne crée aucun TTTI-T. La liquidité permanente est une gestion de la profondeur : un rééquilibrage mécanique et public de la part du protocole, jamais conditionné au prix. Seul le rendement constaté, c'est-à-dire les frais réellement versés au cours des 30 derniers jours, est affiché. Il n'existe aucune promesse de rendement.",
  privacyQ: "Qu'est-ce qui est public, et que conserve l'app ?",
  privacyA:
    "Chaque achat et chaque transfert est enregistré publiquement et de façon permanente sur le ledger du jeton utilisé : ICP, ckBTC, ckUSDC, ckUSDT ou TTTI-T. Tout le monde peut voir les montants, les comptes et les horaires. Les transferts Bitcoin sont publics sur la chaîne Bitcoin : tout le monde peut voir leurs identifiants de transaction (txids), leurs adresses et leurs montants. Au-delà, l'app ne conserve que vos enregistrements d'achat avec leurs montants et leurs numéros de bloc, votre adresse de livraison, la date à laquelle vous avez accepté les conditions d'achat et vos suivis de dépôt BTC (adresse de dépôt, txids et statut de chaque dépôt).",
};

export default fr;
