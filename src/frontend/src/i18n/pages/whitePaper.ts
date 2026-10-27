import { defineDict } from "../core/dict";

/**
 * White paper page interface and corrected-edition section 01 "Read this first".
 * Sections 02 to 07 and the archival original stay in English in every language.
 */
export const WHITE_PAPER_TEXT = defineDict({
  en: {
    eyebrow: "Documents / White Paper",
    title: "The Ten Thousand Immortals",
    subtitle:
      "The supplied original, preserved alongside a separate edition aligned with the current application source.",
    editionsHeading: "White Paper Editions",
    editionsAria: "White paper edition",
    correctedTab: "Corrected edition · current source",
    originalTab: "Original · archival",
    download: "Download exact original DOCX",
    identityHeading: "Identity of this edition",
    identityBefore: "The ledger name and symbol are both ",
    identityAfter:
      ", the live test. TTTI is the future version. Older transactions may use an earlier decimal encoding.",
    contentsAria: "Corrected edition contents",
    contentsHeading: "Contents",
    contentsReading: "Read this first",
    contentsLedger: "Token & supply",
    contentsMechanics: "Purchase mechanics",
    mintInfoHeading: "Buy-to-mint",
    contentsControls: "Controls & risk",
    contentsDisclosures: "Creator disclosures",
    contentsPrivacy: "Privacy",
    contentsVerification: "Verification",
    readingEyebrow: "Corrected edition / source-aligned",
    readingTitle: "01 / Read this first",
    readingP1:
      "TTTI is a speculative meme token, not a claim on a business or a promise of profit. It has no intrinsic value, backing, revenue rights or guaranteed market. Its market price, if any, can fall to zero. Do not buy with money you cannot afford to lose entirely.",
    readingP2:
      "This edition explains what the current application source implements. It is not proof of a particular deployment, an independent audit, a live account balance or a guarantee that a purchase can be completed now.",
    englishOnlyNotice: "",
    archiveNotice:
      "Archived original. Some statements no longer match the code; the current edition is authoritative.",
    archiveDescription:
      "Archival transcription of the supplied document, in full and in its original order. Its claims have not been silently updated. The supplied DOCX is available above for exact formatting and source comparison. For current-code corrections, select the corrected edition.",
    openOriginal: "Open original DOCX",
  },
  fr: {
    eyebrow: "Documents / Livre blanc",
    title: "Les Dix Mille Immortels",
    subtitle:
      "L'original fourni, conservé à côté d'une édition distincte alignée sur le code source actuel de l'application.",
    editionsHeading: "Éditions du livre blanc",
    editionsAria: "Édition du livre blanc",
    correctedTab: "Édition corrigée · code source actuel",
    originalTab: "Original · archive",
    download: "Télécharger le DOCX original exact",
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
    readingP1:
      "TTTI est un jeton mème spéculatif, et non un droit sur une entreprise ni une promesse de profit. Il n'a aucune valeur intrinsèque, aucun adossement, aucun droit à des revenus ni aucun marché garanti. Son prix de marché, s'il en a un, peut tomber à zéro. N'achetez pas avec de l'argent que vous ne pouvez pas vous permettre de perdre entièrement.",
    readingP2:
      "Cette édition explique ce que met en œuvre le code source actuel de l'application. Elle ne constitue ni la preuve d'un déploiement particulier, ni un audit indépendant, ni un solde de compte en temps réel, ni la garantie qu'un achat puisse être effectué maintenant.",
    englishOnlyNotice:
      "Les sections 02 à 07 ci-dessous ne sont disponibles qu'en anglais.",
    archiveNotice:
      "Original archivé. Certaines affirmations ne correspondent plus au code ; l'édition actuelle fait foi.",
    archiveDescription:
      "Transcription d'archive du document fourni, intégrale et dans son ordre d'origine. Ses affirmations n'ont pas été mises à jour discrètement. Le DOCX fourni est disponible ci-dessus pour la mise en forme exacte et la comparaison avec la source. Pour les corrections relatives au code actuel, sélectionnez l'édition corrigée.",
    openOriginal: "Ouvrir le DOCX original",
  },
  es: {
    eyebrow: "Documentos / Libro blanco",
    title: "Los Diez Mil Inmortales",
    subtitle:
      "El original proporcionado, conservado junto a una edición independiente alineada con el código fuente actual de la aplicación.",
    editionsHeading: "Ediciones del libro blanco",
    editionsAria: "Edición del libro blanco",
    correctedTab: "Edición corregida · código fuente actual",
    originalTab: "Original · archivo",
    download: "Descargar el DOCX original exacto",
    identityHeading: "Identidad de esta edición",
    identityBefore: "El nombre y el símbolo del ledger son ambos ",
    identityAfter:
      ", la prueba en curso. TTTI es la versión futura. Las transacciones más antiguas pueden usar una codificación decimal anterior.",
    contentsAria: "Índice de la edición corregida",
    contentsHeading: "Índice",
    contentsReading: "Lea esto primero",
    contentsLedger: "Token y suministro",
    contentsMechanics: "Mecánica de compra",
    mintInfoHeading: "Buy-to-mint",
    contentsControls: "Controles y riesgos",
    contentsDisclosures: "Declaraciones del creador",
    contentsPrivacy: "Privacidad",
    contentsVerification: "Verificación",
    readingEyebrow: "Edición corregida / alineada con el código fuente",
    readingTitle: "01 / Lea esto primero",
    readingP1:
      "TTTI es un token meme especulativo, no un derecho sobre un negocio ni una promesa de beneficios. No tiene valor intrínseco, respaldo, derechos sobre ingresos ni un mercado garantizado. Su precio de mercado, si lo tiene, puede caer a cero. No compre con dinero que no pueda permitirse perder por completo.",
    readingP2:
      "Esta edición explica lo que implementa el código fuente actual de la aplicación. No constituye prueba de un despliegue concreto, ni una auditoría independiente, ni un saldo de cuenta en tiempo real, ni una garantía de que una compra pueda completarse ahora.",
    englishOnlyNotice:
      "Las secciones 02 a 07 que siguen solo están disponibles en inglés.",
    archiveNotice:
      "Original archivado. Algunas afirmaciones ya no coinciden con el código; la edición actual es la que prevalece.",
    archiveDescription:
      "Transcripción de archivo del documento proporcionado, íntegra y en su orden original. Sus afirmaciones no se han actualizado de forma silenciosa. El DOCX proporcionado está disponible arriba para consultar el formato exacto y compararlo con la fuente. Para las correcciones relativas al código actual, seleccione la edición corregida.",
    openOriginal: "Abrir el DOCX original",
  },
  "zh-Hans": {
    eyebrow: "文档 / 白皮书",
    title: "万名不朽者",
    subtitle:
      "保留所提供的原始版本，并另附一份与当前应用源代码保持一致的独立版本。",
    editionsHeading: "白皮书版本",
    editionsAria: "白皮书版本",
    correctedTab: "修订版 · 当前源代码",
    originalTab: "原版 · 存档",
    download: "下载原始 DOCX 文件",
    identityHeading: "本版本的标识",
    identityBefore: "ledger 的名称和代码均为 ",
    identityAfter:
      "，即当前的测试版本。TTTI 是未来版本。较早的交易可能使用旧的小数位编码。",
    contentsAria: "修订版目录",
    contentsHeading: "目录",
    contentsReading: "请先阅读",
    contentsLedger: "代币与供应量",
    contentsMechanics: "购买机制",
    mintInfoHeading: "Buy-to-mint（买即铸造）",
    contentsControls: "控制与风险",
    contentsDisclosures: "创建者披露",
    contentsPrivacy: "隐私",
    contentsVerification: "验证",
    readingEyebrow: "修订版 / 与源代码一致",
    readingTitle: "01 / 请先阅读",
    readingP1:
      "TTTI 是一种投机性的 meme 代币，不代表对任何企业的权利，也不构成任何盈利承诺。它没有内在价值、没有资产支持、没有收益权，也没有保证的市场。其市场价格（如有）可能跌至零。请勿使用您无法承受全部损失的资金购买。",
    readingP2:
      "本版本说明当前应用源代码所实现的内容。它不能证明任何特定部署，不是独立审计，不代表实时账户余额，也不保证现在能够完成购买。",
    englishOnlyNotice: "以下第 02 至 07 节仅提供英文版本。",
    archiveNotice: "存档原版。部分表述已与代码不符；以当前版本为准。",
    archiveDescription:
      "所提供文档的存档转录，内容完整并保持原始顺序。其中的表述未经任何悄然修改。如需查看确切格式或与原文对照，可在上方获取所提供的 DOCX 文件。如需了解针对当前代码的修订，请选择修订版。",
    openOriginal: "打开原始 DOCX",
  },
  "pt-BR": {
    eyebrow: "Documentos / White paper",
    title: "Os Dez Mil Imortais",
    subtitle:
      "O original fornecido, preservado ao lado de uma edição separada alinhada ao código-fonte atual do aplicativo.",
    editionsHeading: "Edições do white paper",
    editionsAria: "Edição do white paper",
    correctedTab: "Edição corrigida · código-fonte atual",
    originalTab: "Original · arquivo",
    download: "Baixar o DOCX original exato",
    identityHeading: "Identidade desta edição",
    identityBefore: "O nome e o símbolo do ledger são ambos ",
    identityAfter:
      ", o teste em operação. TTTI é a versão futura. Transações mais antigas podem usar uma codificação decimal anterior.",
    contentsAria: "Sumário da edição corrigida",
    contentsHeading: "Sumário",
    contentsReading: "Leia isto primeiro",
    contentsLedger: "Token e oferta",
    contentsMechanics: "Mecânica de compra",
    mintInfoHeading: "Buy-to-mint",
    contentsControls: "Controles e riscos",
    contentsDisclosures: "Declarações do criador",
    contentsPrivacy: "Privacidade",
    contentsVerification: "Verificação",
    readingEyebrow: "Edição corrigida / alinhada ao código-fonte",
    readingTitle: "01 / Leia isto primeiro",
    readingP1:
      "TTTI é um token meme especulativo, e não um direito sobre uma empresa nem uma promessa de lucro. Ele não tem valor intrínseco, lastro, direitos sobre receitas nem mercado garantido. Seu preço de mercado, se houver, pode cair a zero. Não compre com dinheiro que você não possa se dar ao luxo de perder por completo.",
    readingP2:
      "Esta edição explica o que o código-fonte atual do aplicativo implementa. Ela não é prova de uma implantação específica, nem uma auditoria independente, nem um saldo de conta em tempo real, nem uma garantia de que uma compra possa ser concluída agora.",
    englishOnlyNotice:
      "As seções 02 a 07 abaixo estão disponíveis somente em inglês.",
    archiveNotice:
      "Original arquivado. Algumas afirmações não correspondem mais ao código; a edição atual é a que prevalece.",
    archiveDescription:
      "Transcrição de arquivo do documento fornecido, na íntegra e em sua ordem original. Suas afirmações não foram atualizadas silenciosamente. O DOCX fornecido está disponível acima para consulta da formatação exata e comparação com a fonte. Para as correções relativas ao código atual, selecione a edição corrigida.",
    openOriginal: "Abrir o DOCX original",
  },
  ko: {
    eyebrow: "문서 / 백서",
    title: "만 명의 불사신",
    subtitle:
      "제공된 원본을 보존하고, 현재 애플리케이션 소스 코드에 맞춘 별도의 판을 함께 제공합니다.",
    editionsHeading: "백서 판",
    editionsAria: "백서 판",
    correctedTab: "수정판 · 현재 소스 코드",
    originalTab: "원본 · 보관본",
    download: "원본 DOCX 그대로 다운로드",
    identityHeading: "이 판의 식별 정보",
    identityBefore: "ledger의 이름과 심볼은 모두 ",
    identityAfter:
      "이며, 현재 운영 중인 테스트입니다. TTTI는 향후 버전입니다. 이전 거래는 예전 소수점 인코딩을 사용할 수 있습니다.",
    contentsAria: "수정판 목차",
    contentsHeading: "목차",
    contentsReading: "먼저 읽어 주세요",
    contentsLedger: "토큰 및 공급량",
    contentsMechanics: "구매 방식",
    mintInfoHeading: "Buy-to-mint",
    contentsControls: "통제 및 위험",
    contentsDisclosures: "창작자 고지",
    contentsPrivacy: "개인정보",
    contentsVerification: "검증",
    readingEyebrow: "수정판 / 소스 코드 기준",
    readingTitle: "01 / 먼저 읽어 주세요",
    readingP1:
      "TTTI는 투기적인 밈 토큰이며, 어떤 사업에 대한 권리나 수익의 약속이 아닙니다. TTTI에는 내재 가치, 담보, 수익에 대한 권리, 보장된 시장이 없습니다. 시장 가격이 있더라도 0으로 떨어질 수 있습니다. 전부 잃을 경우 감당할 수 없는 돈으로는 구매하지 마십시오.",
    readingP2:
      "이 판은 현재 애플리케이션 소스 코드가 구현하는 내용을 설명합니다. 이는 특정 배포에 대한 증명, 독립적인 감사, 실시간 계정 잔액, 또는 지금 구매를 완료할 수 있다는 보장이 아닙니다.",
    englishOnlyNotice: "아래 02~07절은 영어로만 제공됩니다.",
    archiveNotice:
      "보관된 원본입니다. 일부 내용은 더 이상 코드와 일치하지 않으며, 현재 판이 우선합니다.",
    archiveDescription:
      "제공된 문서를 원래 순서대로 전부 옮긴 보관용 전사본입니다. 그 내용은 별도 표시 없이 수정되지 않았습니다. 정확한 서식 확인과 원문 대조를 위해 위에서 제공된 DOCX를 이용할 수 있습니다. 현재 코드 기준의 수정 사항은 수정판을 선택하십시오.",
    openOriginal: "원본 DOCX 열기",
  },
  "pa-Guru": {
    eyebrow: "ਦਸਤਾਵੇਜ਼ / ਵ੍ਹਾਈਟ ਪੇਪਰ",
    title: "ਦਸ ਹਜ਼ਾਰ ਅਮਰ",
    subtitle:
      "ਦਿੱਤਾ ਗਿਆ ਮੂਲ ਦਸਤਾਵੇਜ਼, ਐਪਲੀਕੇਸ਼ਨ ਦੇ ਮੌਜੂਦਾ ਸਰੋਤ ਕੋਡ ਨਾਲ ਮੇਲ ਖਾਂਦੇ ਇੱਕ ਵੱਖਰੇ ਸੰਸਕਰਣ ਦੇ ਨਾਲ ਸੁਰੱਖਿਅਤ ਰੱਖਿਆ ਗਿਆ ਹੈ।",
    editionsHeading: "ਵ੍ਹਾਈਟ ਪੇਪਰ ਦੇ ਸੰਸਕਰਣ",
    editionsAria: "ਵ੍ਹਾਈਟ ਪੇਪਰ ਸੰਸਕਰਣ",
    correctedTab: "ਸੋਧਿਆ ਸੰਸਕਰਣ · ਮੌਜੂਦਾ ਸਰੋਤ ਕੋਡ",
    originalTab: "ਮੂਲ · ਪੁਰਾਲੇਖ",
    download: "ਬਿਲਕੁਲ ਮੂਲ DOCX ਡਾਊਨਲੋਡ ਕਰੋ",
    identityHeading: "ਇਸ ਸੰਸਕਰਣ ਦੀ ਪਛਾਣ",
    identityBefore: "ledger ਦਾ ਨਾਮ ਅਤੇ ਚਿੰਨ੍ਹ ਦੋਵੇਂ ",
    identityAfter:
      " ਹਨ, ਜੋ ਮੌਜੂਦਾ ਲਾਈਵ ਟੈਸਟ ਹੈ। TTTI ਭਵਿੱਖੀ ਸੰਸਕਰਣ ਹੈ। ਪੁਰਾਣੇ ਲੈਣ-ਦੇਣ ਦਸ਼ਮਲਵ ਦੀ ਪਹਿਲਾਂ ਵਾਲੀ ਐਨਕੋਡਿੰਗ ਵਰਤ ਸਕਦੇ ਹਨ।",
    contentsAria: "ਸੋਧੇ ਸੰਸਕਰਣ ਦੀ ਸਮੱਗਰੀ",
    contentsHeading: "ਸਮੱਗਰੀ",
    contentsReading: "ਪਹਿਲਾਂ ਇਹ ਪੜ੍ਹੋ",
    contentsLedger: "ਟੋਕਨ ਅਤੇ ਸਪਲਾਈ",
    contentsMechanics: "ਖਰੀਦ ਦੀ ਵਿਧੀ",
    mintInfoHeading: "Buy-to-mint",
    contentsControls: "ਨਿਯੰਤਰਣ ਅਤੇ ਜੋਖਮ",
    contentsDisclosures: "ਸਿਰਜਣਹਾਰ ਦੇ ਖੁਲਾਸੇ",
    contentsPrivacy: "ਨਿੱਜਤਾ",
    contentsVerification: "ਪੁਸ਼ਟੀ",
    readingEyebrow: "ਸੋਧਿਆ ਸੰਸਕਰਣ / ਸਰੋਤ ਕੋਡ ਨਾਲ ਮੇਲ ਖਾਂਦਾ",
    readingTitle: "01 / ਪਹਿਲਾਂ ਇਹ ਪੜ੍ਹੋ",
    readingP1:
      "TTTI ਇੱਕ ਸੱਟੇਬਾਜ਼ੀ ਵਾਲਾ ਮੀਮ ਟੋਕਨ ਹੈ, ਨਾ ਕਿ ਕਿਸੇ ਕਾਰੋਬਾਰ ਉੱਤੇ ਦਾਅਵਾ ਜਾਂ ਮੁਨਾਫ਼ੇ ਦਾ ਵਾਅਦਾ। ਇਸਦਾ ਕੋਈ ਅੰਦਰੂਨੀ ਮੁੱਲ, ਸਮਰਥਨ, ਆਮਦਨ ਦੇ ਅਧਿਕਾਰ ਜਾਂ ਗਾਰੰਟੀਸ਼ੁਦਾ ਬਾਜ਼ਾਰ ਨਹੀਂ ਹੈ। ਇਸਦੀ ਬਾਜ਼ਾਰ ਕੀਮਤ, ਜੇ ਕੋਈ ਹੋਵੇ, ਜ਼ੀਰੋ ਤੱਕ ਡਿੱਗ ਸਕਦੀ ਹੈ। ਉਸ ਪੈਸੇ ਨਾਲ ਨਾ ਖਰੀਦੋ ਜਿਸਨੂੰ ਪੂਰੀ ਤਰ੍ਹਾਂ ਗੁਆਉਣਾ ਤੁਸੀਂ ਬਰਦਾਸ਼ਤ ਨਹੀਂ ਕਰ ਸਕਦੇ।",
    readingP2:
      "ਇਹ ਸੰਸਕਰਣ ਦੱਸਦਾ ਹੈ ਕਿ ਐਪਲੀਕੇਸ਼ਨ ਦਾ ਮੌਜੂਦਾ ਸਰੋਤ ਕੋਡ ਕੀ ਲਾਗੂ ਕਰਦਾ ਹੈ। ਇਹ ਕਿਸੇ ਖਾਸ ਤੈਨਾਤੀ ਦਾ ਸਬੂਤ, ਸੁਤੰਤਰ ਆਡਿਟ, ਲਾਈਵ ਖਾਤਾ ਬਕਾਇਆ ਜਾਂ ਇਸ ਗੱਲ ਦੀ ਗਾਰੰਟੀ ਨਹੀਂ ਹੈ ਕਿ ਹੁਣੇ ਖਰੀਦ ਪੂਰੀ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ।",
    englishOnlyNotice: "ਹੇਠਾਂ ਦਿੱਤੇ ਭਾਗ 02 ਤੋਂ 07 ਸਿਰਫ਼ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਉਪਲਬਧ ਹਨ।",
    archiveNotice:
      "ਪੁਰਾਲੇਖ ਕੀਤਾ ਮੂਲ। ਕੁਝ ਕਥਨ ਹੁਣ ਕੋਡ ਨਾਲ ਮੇਲ ਨਹੀਂ ਖਾਂਦੇ; ਮੌਜੂਦਾ ਸੰਸਕਰਣ ਹੀ ਪ੍ਰਮਾਣਿਕ ਹੈ।",
    archiveDescription:
      "ਦਿੱਤੇ ਗਏ ਦਸਤਾਵੇਜ਼ ਦੀ ਪੁਰਾਲੇਖੀ ਨਕਲ, ਪੂਰੀ ਅਤੇ ਇਸਦੇ ਮੂਲ ਕ੍ਰਮ ਵਿੱਚ। ਇਸਦੇ ਦਾਅਵਿਆਂ ਨੂੰ ਚੁੱਪਚਾਪ ਅੱਪਡੇਟ ਨਹੀਂ ਕੀਤਾ ਗਿਆ। ਸਹੀ ਫਾਰਮੈਟਿੰਗ ਅਤੇ ਸਰੋਤ ਨਾਲ ਤੁਲਨਾ ਲਈ ਦਿੱਤਾ ਗਿਆ DOCX ਉੱਪਰ ਉਪਲਬਧ ਹੈ। ਮੌਜੂਦਾ ਕੋਡ ਨਾਲ ਸਬੰਧਤ ਸੋਧਾਂ ਲਈ, ਸੋਧਿਆ ਸੰਸਕਰਣ ਚੁਣੋ।",
    openOriginal: "ਮੂਲ DOCX ਖੋਲ੍ਹੋ",
  },
});
