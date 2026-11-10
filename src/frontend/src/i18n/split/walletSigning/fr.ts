import type en from "./en";

const fr: typeof en = {
  refused: "La demande a été refusée dans le wallet. Rien n'a été modifié.",
  closed:
    "La fenêtre du wallet a été fermée ou n'a pas répondu. Rien n'a été modifié.",
  wrongAccount:
    "Le wallet est connecté avec un autre compte. Rien n'a été modifié.",
  failed: "Le wallet n'a pas pu signer la demande. Rien n'a été modifié.",
  noSigner:
    "Aucun wallet détenant ce compte n'est disponible sur cet appareil.",
  fundingHelp:
    "Le compte de financement peut être détenu avec Internet Identity, OISY, NFID Wallet ou Plug. Chaque approval est signée avec le wallet qui détient le compte enregistré (même principal, sous-compte par défaut).",
  fundingSignedWith: (wallet: string) =>
    `Les approvals sont signées avec ${wallet}, qui détient le compte enregistré.`,
  fundingNoMatch:
    "Aucun wallet connu ne détient le compte enregistré sur cet appareil. Connectez le wallet qui le détient.",
  fundingSubaccount:
    "Les approvals ne peuvent être signées ici que pour un compte avec le sous-compte par défaut.",
  fundingExpected: "Compte attendu",
  fundingConnected: "Compte connecté",
  fundingNone: "Aucun",
  fundingConnect: (wallet: string) => `Connecter ${wallet}`,
  fundingMismatch:
    "Le compte connecté n'est pas le compte de financement enregistré.",
};

export default fr;
