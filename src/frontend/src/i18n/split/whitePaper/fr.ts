import mintRule from "../mintRule/fr";
import type en from "./en";

const fr: typeof en = {
  eyebrow: "Documents / Livre blanc",
  title: "Les Dix Mille Immortels",
  subtitle:
    "L'édition corrigée, alignée sur le code source actuel de l'application.",
  identityHeading: "Identité de cette édition",
  identityBefore: "Le nom et le symbole du ledger sont tous deux ",
  identityAfter:
    ", le test en cours. TTTI est la version future. Les transactions plus anciennes peuvent utiliser un ancien encodage des décimales.",
  contentsAria: "Sommaire de l'édition corrigée",
  contentsHeading: "Sommaire",
  contentsReading: "À lire en premier",
  contentsLedger: "Jeton et offre",
  contentsMechanics: "Mécanique d'achat",
  mintInfoHeading: "Buy-to-mint",
  contentsControls: "Contrôles et risques",
  contentsDisclosures: "Déclarations du créateur",
  contentsPrivacy: "Vie privée",
  contentsVerification: "Vérification",
  readingEyebrow: "Édition corrigée / alignée sur le code source",
  readingTitle: "01 / À lire en premier",
  readingP1: `TTTI est un jeton mème spéculatif, et non un droit sur une entreprise ni une promesse de profit. Il n'a aucune valeur intrinsèque, aucun droit à des revenus ni aucun marché garanti. ${mintRule.all} Un dépôt de demande de paire refusée, dans n'importe quel jeton (TTTI-T compris), rejoint la liquidité permanente mise de côté ; le routeur le rééquilibre et l'injecte au ratio du pool. Il n'y a aucune promesse de valeur. Son prix de marché, s'il en a un, peut tomber à zéro. N'achetez pas avec de l'argent que vous ne pouvez pas vous permettre de perdre entièrement.`,
  readingP2:
    "Cette édition explique ce que met en œuvre le code source actuel de l'application. Elle ne constitue ni la preuve d'un déploiement particulier, ni un audit indépendant, ni un solde de compte en temps réel, ni la garantie qu'un achat puisse être effectué maintenant.",
  englishOnlyNotice:
    "Les sections 02 à 07 ci-dessous ne sont disponibles qu'en anglais.",
};

export default fr;
