import mintRule from "../mintRule/fr";
import type en from "./en";

const fr: typeof en = {
  label: "Version de test",
  intro:
    "Ceci est une version de test : un jeton, TTTI-T, 10 000 USD au total, à partir de 1 USD. Même prix que tout futur TTTI : aucune remise, aucun bonus, aucun avantage. Si une version complète voit le jour, TTTI-T se convertit 1:1 en TTTI. Il se peut qu'il n'y ait jamais de version complète.",
  errorText:
    "Les chiffres de l'allocation en direct sont temporairement indisponibles.",
  retry: "Réessayer",
  statusComplete: "Allocation terminée",
  statusPaused: "Achats suspendus",
  statusCurrent: "Allocation en cours",
  pricePerToken: "Prix par TTTI-T (avant frais)",
  totalSupply: "Offre totale",
  remaining: "Restant",
  progressAria: (percent: string) =>
    `Offre totale : ${percent}% de l'offre maximale`,
  totalSupplyLine: (
    total: string,
    max: string,
    symbol: string,
    percent: string,
  ) => `Offre totale : ${total} / ${max} ${symbol} (${percent}%)`,
  disclosuresTitle: "Déclarations du créateur",
  disclosure1: `${mintRule.all} Un dépôt de demande de paire refusée, dans n'importe quel jeton (TTTI-T compris), rejoint la liquidité permanente mise de côté. Les avoirs du créateur sont déclarés et publics : les montants détenus pour le créateur, par jeton, figurent sur la page Pools. Le créateur ne défend aucun prix et n'effectue pas de transactions pour créer du volume. Toute personne, y compris le créateur, peut apporter de la liquidité à sa discrétion et la retirer selon les règles de verrouillage. Ne vous fiez qu'à ce que vous pouvez vérifier.`,
  disclosure2:
    "TTTI et THAT ont le même créateur. TTTI n'a aucun lien avec THAT : il ne peut pas être échangé contre THAT, ni utilisé au sein de THAT, ni converti en quoi que ce soit d'autre.",
};

export default fr;
