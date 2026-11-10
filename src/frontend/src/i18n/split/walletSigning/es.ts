import type en from "./en";

const es: typeof en = {
  refused: "La solicitud fue rechazada en el wallet. No se modificó nada.",
  closed: "La ventana del wallet se cerró o no respondió. No se modificó nada.",
  wrongAccount:
    "El wallet está conectado con otra cuenta. No se modificó nada.",
  failed: "El wallet no pudo firmar la solicitud. No se modificó nada.",
  noSigner:
    "Ningún wallet que contenga esta cuenta está disponible en este dispositivo.",
  fundingHelp:
    "La cuenta de financiación puede estar en Internet Identity, OISY, NFID Wallet o Plug. Cada aprobación se firma con el wallet que contiene la cuenta registrada (mismo principal, subcuenta por defecto).",
  fundingSignedWith: (wallet: string) =>
    `Las aprobaciones se firman con ${wallet}, que contiene la cuenta registrada.`,
  fundingNoMatch:
    "Ningún wallet conocido contiene la cuenta registrada en este dispositivo. Conecta el wallet que la contiene.",
  fundingSubaccount:
    "Aquí solo se pueden firmar aprobaciones para una cuenta con la subcuenta por defecto.",
  fundingExpected: "Cuenta esperada",
  fundingConnected: "Cuenta conectada",
  fundingNone: "Ninguna",
  fundingConnect: (wallet: string) => `Conectar ${wallet}`,
  fundingMismatch:
    "La cuenta conectada no es la cuenta de financiación registrada.",
};

export default es;
