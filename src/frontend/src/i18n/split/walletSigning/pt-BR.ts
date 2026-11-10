import type en from "./en";

const ptBR: typeof en = {
  refused: "A solicitação foi recusada na wallet. Nada foi alterado.",
  closed: "A janela da wallet foi fechada ou não respondeu. Nada foi alterado.",
  wrongAccount: "A wallet está conectada com outra conta. Nada foi alterado.",
  failed: "A wallet não conseguiu assinar a solicitação. Nada foi alterado.",
  noSigner:
    "Nenhuma wallet que detém esta conta está disponível neste dispositivo.",
  fundingHelp:
    "A conta de financiamento pode ser mantida com Internet Identity, OISY, NFID Wallet ou Plug. Cada aprovação é assinada com a wallet que detém a conta registrada (mesmo principal, subconta padrão).",
  fundingSignedWith: (wallet: string) =>
    `As aprovações são assinadas com ${wallet}, que detém a conta registrada.`,
  fundingNoMatch:
    "Nenhuma wallet conhecida detém a conta registrada neste dispositivo. Conecte a wallet que a detém.",
  fundingSubaccount:
    "Aqui só é possível assinar aprovações para uma conta com a subconta padrão.",
  fundingExpected: "Conta esperada",
  fundingConnected: "Conta conectada",
  fundingNone: "Nenhuma",
  fundingConnect: (wallet: string) => `Conectar ${wallet}`,
  fundingMismatch:
    "A conta conectada não é a conta de financiamento registrada.",
};

export default ptBR;
