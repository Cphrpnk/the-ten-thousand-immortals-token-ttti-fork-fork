import { defineDict } from "../core/dict";

/**
 * Automatic wallet signing: errors shown after a wallet signature attempt and
 * the admin buyback funding card's signer texts. English is authoritative.
 * Wallet names and principals are passed in unchanged.
 */
export const WALLET_SIGNING_TEXT = defineDict({
  en: {
    refused: "The request was refused in the wallet. Nothing was changed.",
    closed:
      "The wallet window was closed or did not respond. Nothing was changed.",
    wrongAccount:
      "The wallet is signed in with another account. Nothing was changed.",
    failed: "The wallet could not sign the request. Nothing was changed.",
    noSigner: "No wallet holding this account is available on this device.",
    fundingHelp:
      "The funding account can be held with Internet Identity, OISY, NFID Wallet or Plug. Each approval is signed with the wallet that holds the registered account (same principal, default subaccount).",
    fundingSignedWith: (wallet: string) =>
      `Approvals are signed with ${wallet}, which holds the registered account.`,
    fundingNoMatch:
      "No known wallet holds the registered account on this device. Connect the wallet that holds it.",
    fundingSubaccount:
      "Approvals can be signed here only for an account with the default subaccount.",
    fundingExpected: "Expected account",
    fundingConnected: "Connected account",
    fundingNone: "None",
    fundingConnect: (wallet: string) => `Connect ${wallet}`,
    fundingMismatch:
      "The connected account is not the registered funding account.",
  },
  fr: {
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
  },
  es: {
    refused: "La solicitud fue rechazada en el wallet. No se modificó nada.",
    closed:
      "La ventana del wallet se cerró o no respondió. No se modificó nada.",
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
  },
  "zh-Hans": {
    refused: "请求已在钱包中被拒绝。未做任何更改。",
    closed: "钱包窗口已关闭或未响应。未做任何更改。",
    wrongAccount: "钱包登录的是另一个账户。未做任何更改。",
    failed: "钱包无法签署该请求。未做任何更改。",
    noSigner: "此设备上没有持有该账户的可用钱包。",
    fundingHelp:
      "资金账户可由 Internet Identity、OISY、NFID Wallet 或 Plug 持有。每项授权由持有已登记账户（相同 principal、默认子账户）的钱包签名。",
    fundingSignedWith: (wallet: string) =>
      `授权由持有已登记账户的 ${wallet} 签名。`,
    fundingNoMatch:
      "此设备上没有已知钱包持有已登记账户。请连接持有该账户的钱包。",
    fundingSubaccount: "此处仅能为使用默认子账户的账户签署授权。",
    fundingExpected: "预期账户",
    fundingConnected: "已连接账户",
    fundingNone: "无",
    fundingConnect: (wallet: string) => `连接 ${wallet}`,
    fundingMismatch: "已连接账户不是已登记的资金账户。",
  },
  "pt-BR": {
    refused: "A solicitação foi recusada na wallet. Nada foi alterado.",
    closed:
      "A janela da wallet foi fechada ou não respondeu. Nada foi alterado.",
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
  },
  ko: {
    refused: "지갑에서 요청이 거부되었습니다. 변경된 내용은 없습니다.",
    closed: "지갑 창이 닫혔거나 응답하지 않았습니다. 변경된 내용은 없습니다.",
    wrongAccount:
      "지갑이 다른 계정으로 로그인되어 있습니다. 변경된 내용은 없습니다.",
    failed: "지갑이 요청에 서명하지 못했습니다. 변경된 내용은 없습니다.",
    noSigner: "이 기기에서 이 계정을 보유한 지갑을 사용할 수 없습니다.",
    fundingHelp:
      "자금 계정은 Internet Identity, OISY, NFID Wallet 또는 Plug로 보유할 수 있습니다. 각 승인은 등록된 계정(같은 principal, 기본 하위 계정)을 보유한 지갑으로 서명합니다.",
    fundingSignedWith: (wallet: string) =>
      `승인은 등록된 계정을 보유한 ${wallet}(으)로 서명합니다.`,
    fundingNoMatch:
      "이 기기에서 등록된 계정을 보유한 알려진 지갑이 없습니다. 이 계정을 보유한 지갑을 연결하세요.",
    fundingSubaccount:
      "여기서는 기본 하위 계정을 사용하는 계정에 대해서만 승인에 서명할 수 있습니다.",
    fundingExpected: "예상 계정",
    fundingConnected: "연결된 계정",
    fundingNone: "없음",
    fundingConnect: (wallet: string) => `${wallet} 연결`,
    fundingMismatch: "연결된 계정이 등록된 자금 계정이 아닙니다.",
  },
  "pa-Guru": {
    refused: "ਵਾਲਿਟ ਵਿੱਚ ਬੇਨਤੀ ਰੱਦ ਕੀਤੀ ਗਈ। ਕੁਝ ਨਹੀਂ ਬਦਲਿਆ।",
    closed: "ਵਾਲਿਟ ਦੀ ਵਿੰਡੋ ਬੰਦ ਹੋ ਗਈ ਜਾਂ ਜਵਾਬ ਨਹੀਂ ਦਿੱਤਾ। ਕੁਝ ਨਹੀਂ ਬਦਲਿਆ।",
    wrongAccount: "ਵਾਲਿਟ ਕਿਸੇ ਹੋਰ ਖਾਤੇ ਨਾਲ ਸਾਈਨ ਇਨ ਹੈ। ਕੁਝ ਨਹੀਂ ਬਦਲਿਆ।",
    failed: "ਵਾਲਿਟ ਬੇਨਤੀ 'ਤੇ ਦਸਤਖਤ ਨਹੀਂ ਕਰ ਸਕਿਆ। ਕੁਝ ਨਹੀਂ ਬਦਲਿਆ।",
    noSigner: "ਇਸ ਡਿਵਾਈਸ 'ਤੇ ਇਹ ਖਾਤਾ ਰੱਖਣ ਵਾਲਾ ਕੋਈ ਵਾਲਿਟ ਉਪਲਬਧ ਨਹੀਂ।",
    fundingHelp:
      "ਫੰਡਿੰਗ ਖਾਤਾ Internet Identity, OISY, NFID Wallet ਜਾਂ Plug ਨਾਲ ਰੱਖਿਆ ਜਾ ਸਕਦਾ ਹੈ। ਹਰ ਮਨਜ਼ੂਰੀ ਉਸ ਵਾਲਿਟ ਨਾਲ ਦਸਤਖਤ ਹੁੰਦੀ ਹੈ ਜਿਸ ਵਿੱਚ ਰਜਿਸਟਰ ਕੀਤਾ ਖਾਤਾ ਹੈ (ਉਹੀ principal, ਡਿਫਾਲਟ ਸਬ-ਖਾਤਾ)।",
    fundingSignedWith: (wallet: string) =>
      `ਮਨਜ਼ੂਰੀਆਂ ${wallet} ਨਾਲ ਦਸਤਖਤ ਹੁੰਦੀਆਂ ਹਨ, ਜਿਸ ਵਿੱਚ ਰਜਿਸਟਰ ਕੀਤਾ ਖਾਤਾ ਹੈ।`,
    fundingNoMatch:
      "ਇਸ ਡਿਵਾਈਸ 'ਤੇ ਕੋਈ ਜਾਣਿਆ ਵਾਲਿਟ ਰਜਿਸਟਰ ਕੀਤਾ ਖਾਤਾ ਨਹੀਂ ਰੱਖਦਾ। ਉਹ ਵਾਲਿਟ ਜੋੜੋ ਜਿਸ ਵਿੱਚ ਇਹ ਖਾਤਾ ਹੈ।",
    fundingSubaccount:
      "ਇੱਥੇ ਮਨਜ਼ੂਰੀਆਂ ਸਿਰਫ਼ ਡਿਫਾਲਟ ਸਬ-ਖਾਤੇ ਵਾਲੇ ਖਾਤੇ ਲਈ ਦਸਤਖਤ ਹੋ ਸਕਦੀਆਂ ਹਨ।",
    fundingExpected: "ਉਮੀਦ ਕੀਤਾ ਖਾਤਾ",
    fundingConnected: "ਜੁੜਿਆ ਖਾਤਾ",
    fundingNone: "ਕੋਈ ਨਹੀਂ",
    fundingConnect: (wallet: string) => `${wallet} ਜੋੜੋ`,
    fundingMismatch: "ਜੁੜਿਆ ਖਾਤਾ ਰਜਿਸਟਰ ਕੀਤਾ ਫੰਡਿੰਗ ਖਾਤਾ ਨਹੀਂ ਹੈ।",
  },
});
