import { defineDict } from "../core/dict";

/**
 * Home page text (pages/LandingPage.tsx, components/landing/*,
 * components/TokenInfo.tsx). English is authoritative and word for word the
 * original copy. Numbers, fees, symbols, IDs and URLs are identical in every
 * language. Text that contains a link is split into before / link / after.
 */

/** Cap and no-burn statements, shared by Token details, Test release and FAQ. */
export const CAP_TEXT = defineDict({
  en: {
    ttti: "There are never more than 10,000 TTTI. Tokens cannot be burned. Once the cap is reached, minting stops for good; transfer fees collected by the contract are issued again against ICP, ckBTC, ckUSDC or ckUSDT, only after fresh minting reaches the cap: when one falls, another takes his place.",
    tttiT:
      "There are never more than 1 TTTI-T. Tokens cannot be burned. Once the cap is reached, minting stops for good; transfer fees collected by the contract are issued again against ICP, ckBTC, ckUSDC or ckUSDT, only after fresh minting reaches the cap: when one falls, another takes his place.",
  },
  fr: {
    ttti: "Il n'existe jamais plus de 10,000 TTTI. Les jetons ne peuvent pas être brûlés. Une fois le plafond atteint, la frappe s'arrête définitivement ; les frais de transfert perçus par le contrat sont réémis contre de l'ICP, du ckBTC, du ckUSDC ou du ckUSDT, uniquement après que la frappe nouvelle a atteint le plafond : quand l'un tombe, un autre prend sa place.",
    tttiT:
      "Il n'existe jamais plus de 1 TTTI-T. Les jetons ne peuvent pas être brûlés. Une fois le plafond atteint, la frappe s'arrête définitivement ; les frais de transfert perçus par le contrat sont réémis contre de l'ICP, du ckBTC, du ckUSDC ou du ckUSDT, uniquement après que la frappe nouvelle a atteint le plafond : quand l'un tombe, un autre prend sa place.",
  },
  es: {
    ttti: "Nunca existen más de 10,000 TTTI. Los tokens no se pueden quemar. Una vez alcanzado el límite, la acuñación se detiene definitivamente; las comisiones de transferencia cobradas por el contrato se vuelven a emitir a cambio de ICP, ckBTC, ckUSDC o ckUSDT, solo después de que la acuñación nueva haya alcanzado el límite: cuando uno cae, otro ocupa su lugar.",
    tttiT:
      "Nunca existe más de 1 TTTI-T. Los tokens no se pueden quemar. Una vez alcanzado el límite, la acuñación se detiene definitivamente; las comisiones de transferencia cobradas por el contrato se vuelven a emitir a cambio de ICP, ckBTC, ckUSDC o ckUSDT, solo después de que la acuñación nueva haya alcanzado el límite: cuando uno cae, otro ocupa su lugar.",
  },
  "zh-Hans": {
    ttti: "TTTI 的数量永远不会超过 10,000 枚。代币无法销毁。一旦达到上限，铸造即永久停止；合约收取的转账手续费仅在新铸造达到上限之后，才会以 ICP、ckBTC、ckUSDC 或 ckUSDT 为对价重新发行：一个倒下，另一个便接替他的位置。",
    tttiT:
      "TTTI-T 的数量永远不会超过 1 枚。代币无法销毁。一旦达到上限，铸造即永久停止；合约收取的转账手续费仅在新铸造达到上限之后，才会以 ICP、ckBTC、ckUSDC 或 ckUSDT 为对价重新发行：一个倒下，另一个便接替他的位置。",
  },
  "pt-BR": {
    ttti: "Nunca existem mais de 10.000 TTTI. Os tokens não podem ser queimados. Quando o limite é atingido, a cunhagem para definitivamente; as taxas de transferência cobradas pelo contrato são emitidas novamente em troca de ICP, ckBTC, ckUSDC ou ckUSDT, somente depois que a cunhagem nova atinge o limite: quando um cai, outro toma o seu lugar.",
    tttiT:
      "Nunca existe mais de 1 TTTI-T. Os tokens não podem ser queimados. Quando o limite é atingido, a cunhagem para definitivamente; as taxas de transferência cobradas pelo contrato são emitidas novamente em troca de ICP, ckBTC, ckUSDC ou ckUSDT, somente depois que a cunhagem nova atinge o limite: quando um cai, outro toma o seu lugar.",
  },
  ko: {
    ttti: "TTTI는 결코 10,000개를 넘지 않습니다. 토큰은 소각할 수 없습니다. 상한에 도달하면 발행은 영구히 중단됩니다. 컨트랙트가 징수한 전송 수수료는 신규 발행이 상한에 도달한 후에만 ICP, ckBTC, ckUSDC 또는 ckUSDT를 대가로 다시 발행됩니다. 한 명이 쓰러지면 다른 한 명이 그 자리를 대신합니다.",
    tttiT:
      "TTTI-T는 결코 1개를 넘지 않습니다. 토큰은 소각할 수 없습니다. 상한에 도달하면 발행은 영구히 중단됩니다. 컨트랙트가 징수한 전송 수수료는 신규 발행이 상한에 도달한 후에만 ICP, ckBTC, ckUSDC 또는 ckUSDT를 대가로 다시 발행됩니다. 한 명이 쓰러지면 다른 한 명이 그 자리를 대신합니다.",
  },
  "pa-Guru": {
    ttti: "TTTI ਕਦੇ ਵੀ 10,000 ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੁੰਦੇ। ਟੋਕਨ ਬਰਨ ਨਹੀਂ ਕੀਤੇ ਜਾ ਸਕਦੇ। ਸੀਮਾ ਪੂਰੀ ਹੋਣ 'ਤੇ ਮਿੰਟਿੰਗ ਹਮੇਸ਼ਾ ਲਈ ਬੰਦ ਹੋ ਜਾਂਦੀ ਹੈ; ਕੰਟਰੈਕਟ ਵੱਲੋਂ ਇਕੱਠੀਆਂ ਕੀਤੀਆਂ ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਦੇ ਬਦਲੇ ਦੁਬਾਰਾ ਜਾਰੀ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ, ਸਿਰਫ਼ ਉਦੋਂ ਜਦੋਂ ਨਵੀਂ ਮਿੰਟਿੰਗ ਸੀਮਾ ਤੱਕ ਪਹੁੰਚ ਜਾਂਦੀ ਹੈ: ਜਦੋਂ ਇੱਕ ਡਿੱਗਦਾ ਹੈ, ਦੂਜਾ ਉਸ ਦੀ ਥਾਂ ਲੈ ਲੈਂਦਾ ਹੈ।",
    tttiT:
      "TTTI-T ਕਦੇ ਵੀ 1 ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੁੰਦਾ। ਟੋਕਨ ਬਰਨ ਨਹੀਂ ਕੀਤੇ ਜਾ ਸਕਦੇ। ਸੀਮਾ ਪੂਰੀ ਹੋਣ 'ਤੇ ਮਿੰਟਿੰਗ ਹਮੇਸ਼ਾ ਲਈ ਬੰਦ ਹੋ ਜਾਂਦੀ ਹੈ; ਕੰਟਰੈਕਟ ਵੱਲੋਂ ਇਕੱਠੀਆਂ ਕੀਤੀਆਂ ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਦੇ ਬਦਲੇ ਦੁਬਾਰਾ ਜਾਰੀ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ, ਸਿਰਫ਼ ਉਦੋਂ ਜਦੋਂ ਨਵੀਂ ਮਿੰਟਿੰਗ ਸੀਮਾ ਤੱਕ ਪਹੁੰਚ ਜਾਂਦੀ ਹੈ: ਜਦੋਂ ਇੱਕ ਡਿੱਗਦਾ ਹੈ, ਦੂਜਾ ਉਸ ਦੀ ਥਾਂ ਲੈ ਲੈਂਦਾ ਹੈ।",
  },
});

export const HERO_TEXT = defineDict({
  en: {
    statusComplete: "Test allocation complete",
    statusPaused: "Test purchases paused",
    statusOpen: "TTTI-T is open",
    crestAlt:
      "The Ten Thousand Immortals emblem: a gold winged helmet above the TTTI wordmark",
    titleLead: "Ten Thousand ",
    titleAccent: "Immortals.",
    tagline: "Fast. Secure. Unbreakable in formation.",
    description:
      "TTTI is exchange money in its purest form. It takes what the Internet Computer does best: transfers in seconds, secured on-chain, nearly free. It has all the qualities of ICP, plus a fixed maximum supply of 10,000 units. And it never gets in the way.",
    startBefore: "Start with ",
    startLink: "the whitepaper",
    startAfter: ".",
    onchainAlt: "100% on-chain, on ICP",
    icrc1Alt: "ICRC-1 token standard badge",
    icrc2Alt: "ICRC-2 token standard badge",
    icrc3Alt: "ICRC-3 token standard badge",
  },
  fr: {
    statusComplete: "Allocation de test terminée",
    statusPaused: "Achats de test suspendus",
    statusOpen: "TTTI-T est ouvert",
    crestAlt:
      "Emblème des Dix Mille Immortels : un casque ailé doré au-dessus du logotype TTTI",
    titleLead: "Dix Mille ",
    titleAccent: "Immortels.",
    tagline: "Rapide. Sûr. Inébranlable en formation.",
    description:
      "TTTI est une monnaie d'échange dans sa forme la plus pure. Il reprend ce que l'Internet Computer fait de mieux : des transferts en quelques secondes, sécurisés on-chain, presque gratuits. Il a toutes les qualités de l'ICP, avec en plus une offre maximale fixe de 10,000 unités. Et il ne se met jamais en travers du chemin.",
    startBefore: "Commencez par ",
    startLink: "le livre blanc",
    startAfter: ".",
    onchainAlt: "100% on-chain, sur ICP",
    icrc1Alt: "Badge du standard de jeton ICRC-1",
    icrc2Alt: "Badge du standard de jeton ICRC-2",
    icrc3Alt: "Badge du standard de jeton ICRC-3",
  },
  es: {
    statusComplete: "Asignación de prueba completada",
    statusPaused: "Compras de prueba en pausa",
    statusOpen: "TTTI-T está abierto",
    crestAlt:
      "Emblema de los Diez Mil Inmortales: un casco alado dorado sobre el logotipo de TTTI",
    titleLead: "Diez Mil ",
    titleAccent: "Inmortales.",
    tagline: "Rápido. Seguro. Inquebrantable en formación.",
    description:
      "TTTI es dinero de intercambio en su forma más pura. Toma lo que el Internet Computer hace mejor: transferencias en segundos, aseguradas on-chain, casi gratuitas. Tiene todas las cualidades de ICP y, además, un suministro máximo fijo de 10,000 unidades. Y nunca se interpone en el camino.",
    startBefore: "Empiece por ",
    startLink: "el libro blanco",
    startAfter: ".",
    onchainAlt: "100% on-chain, en ICP",
    icrc1Alt: "Insignia del estándar de token ICRC-1",
    icrc2Alt: "Insignia del estándar de token ICRC-2",
    icrc3Alt: "Insignia del estándar de token ICRC-3",
  },
  "zh-Hans": {
    statusComplete: "测试分配已完成",
    statusPaused: "测试购买已暂停",
    statusOpen: "TTTI-T 已开放",
    crestAlt: "一万不死军徽章：TTTI 字标上方的金色带翼头盔",
    titleLead: "一万",
    titleAccent: "不死军。",
    tagline: "迅捷。安全。阵列坚不可摧。",
    description:
      "TTTI 是最纯粹形态的交换货币。它汲取了 Internet Computer 最擅长的一切：数秒完成转账，链上安全保障，几乎零成本。它具备 ICP 的全部特质，另有固定的最大供应量 10,000 单位。而且它从不成为阻碍。",
    startBefore: "从",
    startLink: "白皮书",
    startAfter: "开始。",
    onchainAlt: "100% 链上运行，基于 ICP",
    icrc1Alt: "ICRC-1 代币标准徽章",
    icrc2Alt: "ICRC-2 代币标准徽章",
    icrc3Alt: "ICRC-3 代币标准徽章",
  },
  "pt-BR": {
    statusComplete: "Alocação de teste concluída",
    statusPaused: "Compras de teste pausadas",
    statusOpen: "TTTI-T está aberto",
    crestAlt:
      "Emblema dos Dez Mil Imortais: um elmo alado dourado acima do logotipo TTTI",
    titleLead: "Dez Mil ",
    titleAccent: "Imortais.",
    tagline: "Rápido. Seguro. Inquebrável em formação.",
    description:
      "TTTI é dinheiro de troca em sua forma mais pura. Ele aproveita o que o Internet Computer faz de melhor: transferências em segundos, protegidas on-chain, quase sem custo. Tem todas as qualidades do ICP e, além disso, uma oferta máxima fixa de 10.000 unidades. E nunca atrapalha.",
    startBefore: "Comece pelo ",
    startLink: "whitepaper",
    startAfter: ".",
    onchainAlt: "100% on-chain, no ICP",
    icrc1Alt: "Selo do padrão de token ICRC-1",
    icrc2Alt: "Selo do padrão de token ICRC-2",
    icrc3Alt: "Selo do padrão de token ICRC-3",
  },
  ko: {
    statusComplete: "테스트 할당 완료",
    statusPaused: "테스트 구매 일시 중지",
    statusOpen: "TTTI-T 발행 가능",
    crestAlt: "만 명의 불사대 엠블럼: TTTI 워드마크 위의 금색 날개 투구",
    titleLead: "만 명의 ",
    titleAccent: "불사대.",
    tagline: "빠르다. 안전하다. 대열 속에서 무너지지 않는다.",
    description:
      "TTTI는 가장 순수한 형태의 교환 화폐입니다. Internet Computer가 가장 잘하는 것을 그대로 가져옵니다: 몇 초 만에 끝나는 전송, 온체인 보안, 거의 들지 않는 비용. ICP의 모든 장점을 갖추었고, 여기에 10,000단위의 고정된 최대 공급량이 더해집니다. 그리고 결코 방해가 되지 않습니다.",
    startBefore: "",
    startLink: "백서",
    startAfter: "부터 읽어 보세요.",
    onchainAlt: "100% 온체인, ICP 기반",
    icrc1Alt: "ICRC-1 토큰 표준 배지",
    icrc2Alt: "ICRC-2 토큰 표준 배지",
    icrc3Alt: "ICRC-3 토큰 표준 배지",
  },
  "pa-Guru": {
    statusComplete: "ਟੈਸਟ ਵੰਡ ਪੂਰੀ ਹੋਈ",
    statusPaused: "ਟੈਸਟ ਖਰੀਦਾਂ ਰੋਕੀਆਂ ਗਈਆਂ",
    statusOpen: "TTTI-T ਖੁੱਲ੍ਹਾ ਹੈ",
    crestAlt: "ਦਸ ਹਜ਼ਾਰ ਅਮਰਾਂ ਦਾ ਚਿੰਨ੍ਹ: TTTI ਸ਼ਬਦ-ਚਿੰਨ੍ਹ ਦੇ ਉੱਪਰ ਸੁਨਹਿਰੀ ਖੰਭਾਂ ਵਾਲਾ ਟੋਪ",
    titleLead: "ਦਸ ਹਜ਼ਾਰ ",
    titleAccent: "ਅਮਰ।",
    tagline: "ਤੇਜ਼। ਸੁਰੱਖਿਅਤ। ਕਤਾਰ ਵਿੱਚ ਅਟੁੱਟ।",
    description:
      "TTTI ਆਪਣੇ ਸਭ ਤੋਂ ਸ਼ੁੱਧ ਰੂਪ ਵਿੱਚ ਲੈਣ-ਦੇਣ ਦਾ ਪੈਸਾ ਹੈ। ਇਹ ਉਹ ਲੈਂਦਾ ਹੈ ਜੋ Internet Computer ਸਭ ਤੋਂ ਵਧੀਆ ਕਰਦਾ ਹੈ: ਸਕਿੰਟਾਂ ਵਿੱਚ ਟ੍ਰਾਂਸਫਰ, ਆਨ-ਚੇਨ ਸੁਰੱਖਿਅਤ, ਲਗਭਗ ਮੁਫ਼ਤ। ਇਸ ਵਿੱਚ ICP ਦੇ ਸਾਰੇ ਗੁਣ ਹਨ, ਨਾਲ ਹੀ 10,000 ਇਕਾਈਆਂ ਦੀ ਨਿਸ਼ਚਿਤ ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ। ਅਤੇ ਇਹ ਕਦੇ ਰਾਹ ਵਿੱਚ ਨਹੀਂ ਆਉਂਦਾ।",
    startBefore: "",
    startLink: "ਵ੍ਹਾਈਟਪੇਪਰ",
    startAfter: " ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ।",
    onchainAlt: "100% ਆਨ-ਚੇਨ, ICP 'ਤੇ",
    icrc1Alt: "ICRC-1 ਟੋਕਨ ਮਿਆਰ ਬੈਜ",
    icrc2Alt: "ICRC-2 ਟੋਕਨ ਮਿਆਰ ਬੈਜ",
    icrc3Alt: "ICRC-3 ਟੋਕਨ ਮਿਆਰ ਬੈਜ",
  },
});

/** Narrative and Thermopylae epilogue. Keys double as stable React keys. */
export const STORY_TEXT = defineDict({
  en: {
    label: "The legend",
    title: "The Ten Thousand Immortals",
    p1: "They were called the Immortals. Ten thousand, always ten thousand. Organized. Trained. Feared across an empire.",
    p2: "When one fell, another stepped into his place, and no one noticed the difference. They had no names, only a number to maintain.",
    p3: "They did not fight for anything. They fought because they were ordered to.",
    e1: "480 BC. Thermopylae.",
    e2: "Three hundred Spartans stood in a narrow pass against the largest army the world had ever seen.",
    e3: "The Immortals came with arrogance. Ten thousand, flawless, replaceable. For two days they threw themselves against the three hundred, and for two days they broke. Discipline was not enough. Skill was not enough. Numbers were not enough.",
    e4: "They took the pass only through a traitor's path. The three hundred did not retreat. They fell where they stood.",
    e5: "But the three hundred had not come to win a pass. They had come for something worth more than their lives: a freedom that was theirs, a cause they shared. And by dying for it, they made a scattered people believe in it.",
    e6: "A year later, those people stood together. At Salamis and at Plataea, the empire broke.",
    e7: "The Immortals were never defeated by a stronger army. They were defeated by three hundred who knew why they were fighting.",
    e8: "An army that serves can win a battle. Only people who share a cause can win a war.",
  },
  fr: {
    label: "La légende",
    title: "Les Dix Mille Immortels",
    p1: "On les appelait les Immortels. Dix mille, toujours dix mille. Organisés. Entraînés. Redoutés dans tout un empire.",
    p2: "Quand l'un tombait, un autre prenait sa place, et personne ne voyait la différence. Ils n'avaient pas de nom, seulement un nombre à maintenir.",
    p3: "Ils ne se battaient pour rien. Ils se battaient parce qu'on le leur ordonnait.",
    e1: "480 av. J.-C. Les Thermopyles.",
    e2: "Trois cents Spartiates se dressèrent dans un étroit défilé face à la plus grande armée que le monde ait jamais connue.",
    e3: "Les Immortels arrivèrent pleins d'arrogance. Dix mille, sans faille, remplaçables. Deux jours durant, ils se jetèrent contre les trois cents, et deux jours durant, ils se brisèrent. La discipline ne suffit pas. L'habileté ne suffit pas. Le nombre ne suffit pas.",
    e4: "Ils ne prirent le défilé que par le sentier d'un traître. Les trois cents ne reculèrent pas. Ils tombèrent là où ils se tenaient.",
    e5: "Mais les trois cents n'étaient pas venus gagner un défilé. Ils étaient venus pour une chose qui valait plus que leur vie : une liberté qui était la leur, une cause qu'ils partageaient. Et en mourant pour elle, ils y firent croire un peuple dispersé.",
    e6: "Un an plus tard, ce peuple se tenait uni. À Salamine et à Platées, l'empire se brisa.",
    e7: "Les Immortels ne furent jamais vaincus par une armée plus forte. Ils furent vaincus par trois cents hommes qui savaient pourquoi ils se battaient.",
    e8: "Une armée qui sert peut gagner une bataille. Seuls ceux qui partagent une cause peuvent gagner une guerre.",
  },
  es: {
    label: "La leyenda",
    title: "Los Diez Mil Inmortales",
    p1: "Los llamaban los Inmortales. Diez mil, siempre diez mil. Organizados. Entrenados. Temidos en todo un imperio.",
    p2: "Cuando uno caía, otro ocupaba su lugar, y nadie notaba la diferencia. No tenían nombre, solo un número que mantener.",
    p3: "No luchaban por nada. Luchaban porque se lo ordenaban.",
    e1: "480 a. C. Las Termópilas.",
    e2: "Trescientos espartanos se plantaron en un estrecho desfiladero frente al mayor ejército que el mundo había visto jamás.",
    e3: "Los Inmortales llegaron con arrogancia. Diez mil, impecables, reemplazables. Durante dos días se lanzaron contra los trescientos, y durante dos días se quebraron. La disciplina no bastó. La destreza no bastó. El número no bastó.",
    e4: "Solo tomaron el paso por el sendero de un traidor. Los trescientos no retrocedieron. Cayeron donde estaban.",
    e5: "Pero los trescientos no habían venido a ganar un paso. Habían venido por algo que valía más que sus vidas: una libertad que era suya, una causa que compartían. Y al morir por ella, hicieron que un pueblo disperso creyera en ella.",
    e6: "Un año después, ese pueblo se mantuvo unido. En Salamina y en Platea, el imperio se quebró.",
    e7: "A los Inmortales nunca los venció un ejército más fuerte. Los vencieron trescientos que sabían por qué luchaban.",
    e8: "Un ejército que sirve puede ganar una batalla. Solo quienes comparten una causa pueden ganar una guerra.",
  },
  "zh-Hans": {
    label: "传说",
    title: "一万不死军",
    p1: "人们称他们为不死军。一万人，永远是一万人。纪律严明，训练有素，令整个帝国闻之生畏。",
    p2: "一人倒下，便有另一人补上，无人察觉有何不同。他们没有名字，只有一个必须维持的数字。",
    p3: "他们并非为了什么而战。他们作战，只因奉命。",
    e1: "公元前 480 年，温泉关。",
    e2: "三百名斯巴达人扼守狭窄的山口，迎战世上前所未见的最庞大军队。",
    e3: "不死军傲慢而来。一万人，完美无瑕，随时可替。整整两天，他们扑向那三百人；整整两天，他们一再溃败。纪律不够，技艺不够，人数也不够。",
    e4: "他们最终攻下山口，靠的只是一个叛徒指出的小路。三百人没有后退。他们倒在了自己坚守的地方。",
    e5: "但那三百人并非为一处山口而来。他们为比生命更珍贵的东西而来：属于他们自己的自由，他们共同的事业。他们为之而死，也让一个四分五裂的民族开始相信它。",
    e6: "一年之后，这个民族团结在一起。在萨拉米斯，在普拉提亚，帝国崩溃了。",
    e7: "不死军从未败给更强大的军队。他们败给了三百个知道自己为何而战的人。",
    e8: "效命的军队可以赢得一场战役。唯有共享同一事业的人，才能赢得一场战争。",
  },
  "pt-BR": {
    label: "A lenda",
    title: "Os Dez Mil Imortais",
    p1: "Eram chamados de Imortais. Dez mil, sempre dez mil. Organizados. Treinados. Temidos em todo um império.",
    p2: "Quando um caía, outro assumia o seu lugar, e ninguém notava a diferença. Não tinham nome, apenas um número a manter.",
    p3: "Não lutavam por nada. Lutavam porque recebiam ordens.",
    e1: "480 a.C. Termópilas.",
    e2: "Trezentos espartanos se postaram num desfiladeiro estreito diante do maior exército que o mundo já tinha visto.",
    e3: "Os Imortais chegaram cheios de arrogância. Dez mil, impecáveis, substituíveis. Durante dois dias se lançaram contra os trezentos, e durante dois dias se despedaçaram. A disciplina não bastou. A habilidade não bastou. O número não bastou.",
    e4: "Só tomaram a passagem por uma trilha revelada por um traidor. Os trezentos não recuaram. Caíram onde estavam.",
    e5: "Mas os trezentos não tinham vindo para ganhar uma passagem. Tinham vindo por algo que valia mais do que a própria vida: uma liberdade que era deles, uma causa que compartilhavam. E, ao morrer por ela, fizeram um povo disperso acreditar nela.",
    e6: "Um ano depois, esse povo se uniu. Em Salamina e em Plateia, o império ruiu.",
    e7: "Os Imortais nunca foram derrotados por um exército mais forte. Foram derrotados por trezentos que sabiam por que lutavam.",
    e8: "Um exército que serve pode vencer uma batalha. Só quem compartilha uma causa pode vencer uma guerra.",
  },
  ko: {
    label: "전설",
    title: "만 명의 불사대",
    p1: "사람들은 그들을 불사대라 불렀다. 만 명, 언제나 만 명. 조직되고, 훈련되고, 제국 전역에서 두려움의 대상이었다.",
    p2: "한 명이 쓰러지면 다른 한 명이 그 자리를 채웠고, 아무도 차이를 알아채지 못했다. 그들에게는 이름이 없었다. 지켜야 할 숫자만 있을 뿐이었다.",
    p3: "그들은 무언가를 위해 싸우지 않았다. 명령을 받았기에 싸웠을 뿐이다.",
    e1: "기원전 480년. 테르모필레.",
    e2: "스파르타인 삼백 명이 좁은 협로에 서서, 세상이 일찍이 본 적 없는 가장 거대한 군대와 맞섰다.",
    e3: "불사대는 오만하게 몰려왔다. 만 명, 흠잡을 데 없고, 언제든 대체할 수 있는 이들. 이틀 동안 그들은 삼백 명에게 몸을 던졌고, 이틀 동안 부서졌다. 규율로는 부족했다. 기술로도 부족했다. 숫자로도 부족했다.",
    e4: "그들이 협로를 차지한 것은 오직 배신자가 알려 준 샛길 덕분이었다. 삼백 명은 물러서지 않았다. 그들은 서 있던 자리에서 쓰러졌다.",
    e5: "그러나 삼백 명은 협로 하나를 얻으려고 온 것이 아니었다. 그들은 목숨보다 값진 것을 위해 왔다. 자신들의 것인 자유, 함께 품은 대의. 그리고 그것을 위해 죽음으로써, 흩어져 있던 사람들이 그것을 믿게 만들었다.",
    e6: "1년 뒤, 그 사람들은 하나로 뭉쳤다. 살라미스와 플라타이아에서 제국은 무너졌다.",
    e7: "불사대는 더 강한 군대에 패한 적이 없다. 그들을 무너뜨린 것은 자신이 왜 싸우는지 아는 삼백 명이었다.",
    e8: "복종하는 군대는 전투에서 이길 수 있다. 대의를 함께하는 사람들만이 전쟁에서 이길 수 있다.",
  },
  "pa-Guru": {
    label: "ਦੰਤਕਥਾ",
    title: "ਦਸ ਹਜ਼ਾਰ ਅਮਰ",
    p1: "ਉਨ੍ਹਾਂ ਨੂੰ ਅਮਰ ਕਿਹਾ ਜਾਂਦਾ ਸੀ। ਦਸ ਹਜ਼ਾਰ, ਹਮੇਸ਼ਾ ਦਸ ਹਜ਼ਾਰ। ਸੰਗਠਿਤ। ਸਿਖਲਾਈ ਪ੍ਰਾਪਤ। ਪੂਰੇ ਸਾਮਰਾਜ ਵਿੱਚ ਉਨ੍ਹਾਂ ਦਾ ਡਰ ਸੀ।",
    p2: "ਜਦੋਂ ਇੱਕ ਡਿੱਗਦਾ, ਦੂਜਾ ਉਸ ਦੀ ਥਾਂ ਆ ਖੜ੍ਹਦਾ, ਅਤੇ ਕਿਸੇ ਨੂੰ ਫ਼ਰਕ ਨਜ਼ਰ ਨਾ ਆਉਂਦਾ। ਉਨ੍ਹਾਂ ਦੇ ਕੋਈ ਨਾਂ ਨਹੀਂ ਸਨ, ਸਿਰਫ਼ ਇੱਕ ਗਿਣਤੀ ਸੀ ਜਿਸ ਨੂੰ ਪੂਰਾ ਰੱਖਣਾ ਸੀ।",
    p3: "ਉਹ ਕਿਸੇ ਮਕਸਦ ਲਈ ਨਹੀਂ ਲੜਦੇ ਸਨ। ਉਹ ਇਸ ਲਈ ਲੜਦੇ ਸਨ ਕਿਉਂਕਿ ਉਨ੍ਹਾਂ ਨੂੰ ਹੁਕਮ ਮਿਲਦਾ ਸੀ।",
    e1: "480 ਈਸਾ ਪੂਰਵ। ਥਰਮੋਪਲੀ।",
    e2: "ਤਿੰਨ ਸੌ ਸਪਾਰਟਨ ਇੱਕ ਤੰਗ ਦੱਰੇ ਵਿੱਚ ਉਸ ਸਭ ਤੋਂ ਵੱਡੀ ਫ਼ੌਜ ਦੇ ਸਾਹਮਣੇ ਡਟ ਗਏ ਜੋ ਦੁਨੀਆ ਨੇ ਕਦੇ ਦੇਖੀ ਸੀ।",
    e3: "ਅਮਰ ਹੰਕਾਰ ਨਾਲ ਆਏ। ਦਸ ਹਜ਼ਾਰ, ਬੇਦਾਗ਼, ਬਦਲਣਯੋਗ। ਦੋ ਦਿਨ ਉਹ ਤਿੰਨ ਸੌ ਉੱਤੇ ਟੁੱਟ ਕੇ ਪਏ, ਅਤੇ ਦੋ ਦਿਨ ਉਹ ਆਪ ਟੁੱਟਦੇ ਰਹੇ। ਅਨੁਸ਼ਾਸਨ ਕਾਫ਼ੀ ਨਹੀਂ ਸੀ। ਹੁਨਰ ਕਾਫ਼ੀ ਨਹੀਂ ਸੀ। ਗਿਣਤੀ ਕਾਫ਼ੀ ਨਹੀਂ ਸੀ।",
    e4: "ਉਨ੍ਹਾਂ ਨੇ ਦੱਰਾ ਸਿਰਫ਼ ਇੱਕ ਗੱਦਾਰ ਦੇ ਦੱਸੇ ਰਾਹ ਰਾਹੀਂ ਹੀ ਲਿਆ। ਤਿੰਨ ਸੌ ਪਿੱਛੇ ਨਹੀਂ ਹਟੇ। ਉਹ ਜਿੱਥੇ ਖੜ੍ਹੇ ਸਨ, ਉੱਥੇ ਹੀ ਡਿੱਗੇ।",
    e5: "ਪਰ ਤਿੰਨ ਸੌ ਕੋਈ ਦੱਰਾ ਜਿੱਤਣ ਨਹੀਂ ਆਏ ਸਨ। ਉਹ ਆਪਣੀਆਂ ਜਾਨਾਂ ਤੋਂ ਵੀ ਕੀਮਤੀ ਚੀਜ਼ ਲਈ ਆਏ ਸਨ: ਇੱਕ ਆਜ਼ਾਦੀ ਜੋ ਉਨ੍ਹਾਂ ਦੀ ਆਪਣੀ ਸੀ, ਇੱਕ ਮਕਸਦ ਜੋ ਉਹ ਸਾਂਝਾ ਕਰਦੇ ਸਨ। ਅਤੇ ਉਸ ਲਈ ਜਾਨ ਦੇ ਕੇ, ਉਨ੍ਹਾਂ ਨੇ ਖਿੰਡੇ ਹੋਏ ਲੋਕਾਂ ਨੂੰ ਉਸ ਵਿੱਚ ਵਿਸ਼ਵਾਸ ਕਰਨ ਲਾ ਦਿੱਤਾ।",
    e6: "ਇੱਕ ਸਾਲ ਬਾਅਦ, ਉਹ ਲੋਕ ਇਕੱਠੇ ਖੜ੍ਹੇ ਸਨ। ਸਲਾਮਿਸ ਅਤੇ ਪਲਾਟੀਆ ਵਿੱਚ, ਸਾਮਰਾਜ ਟੁੱਟ ਗਿਆ।",
    e7: "ਅਮਰਾਂ ਨੂੰ ਕਦੇ ਕਿਸੇ ਵਧੇਰੇ ਤਾਕਤਵਰ ਫ਼ੌਜ ਨੇ ਨਹੀਂ ਹਰਾਇਆ। ਉਨ੍ਹਾਂ ਨੂੰ ਉਨ੍ਹਾਂ ਤਿੰਨ ਸੌ ਨੇ ਹਰਾਇਆ ਜੋ ਜਾਣਦੇ ਸਨ ਕਿ ਉਹ ਕਿਉਂ ਲੜ ਰਹੇ ਹਨ।",
    e8: "ਹੁਕਮ ਮੰਨਣ ਵਾਲੀ ਫ਼ੌਜ ਇੱਕ ਲੜਾਈ ਜਿੱਤ ਸਕਦੀ ਹੈ। ਸਿਰਫ਼ ਸਾਂਝੇ ਮਕਸਦ ਵਾਲੇ ਲੋਕ ਹੀ ਜੰਗ ਜਿੱਤ ਸਕਦੇ ਹਨ।",
  },
});

export const TOKEN_DETAILS_TEXT = defineDict({
  en: {
    label: "What TTTI is",
    title: "TTTI is the ten thousand.",
    p1: "Organized. Reliable. Interchangeable by design: every unit is identical, every transfer settles the same way.",
    p2: "TTTI does one thing, and does it without fail: it moves value.",
    p3: "An instrument is only as good as the hand that holds it.",
    factsTitle: "The facts",
    factMaxSupply: "Maximum supply: 10,000 TTTI",
    factDecimals: "8 decimals",
    factSmallestUnit: "Smallest unit: 0.00000001 TTTI",
    factLedger:
      "Ledger continued from earlier test versions (see Technical details)",
    ledgerStandards: "Ledger standards",
  },
  fr: {
    label: "Ce qu'est TTTI",
    title: "TTTI, ce sont les dix mille.",
    p1: "Organisé. Fiable. Interchangeable par conception : chaque unité est identique, chaque transfert se règle de la même manière.",
    p2: "TTTI fait une seule chose, et la fait sans faillir : il fait circuler la valeur.",
    p3: "Un instrument ne vaut que par la main qui le tient.",
    factsTitle: "Les faits",
    factMaxSupply: "Offre maximale : 10,000 TTTI",
    factDecimals: "8 décimales",
    factSmallestUnit: "Plus petite unité : 0.00000001 TTTI",
    factLedger:
      "Ledger repris des versions de test antérieures (voir Détails techniques)",
    ledgerStandards: "Standards du ledger",
  },
  es: {
    label: "Qué es TTTI",
    title: "TTTI son los diez mil.",
    p1: "Organizado. Fiable. Intercambiable por diseño: cada unidad es idéntica, cada transferencia se liquida de la misma manera.",
    p2: "TTTI hace una sola cosa, y la hace sin fallar: mueve valor.",
    p3: "Un instrumento solo vale lo que la mano que lo sostiene.",
    factsTitle: "Los hechos",
    factMaxSupply: "Suministro máximo: 10,000 TTTI",
    factDecimals: "8 decimales",
    factSmallestUnit: "Unidad más pequeña: 0.00000001 TTTI",
    factLedger:
      "Ledger continuado desde versiones de prueba anteriores (ver Detalles técnicos)",
    ledgerStandards: "Estándares del ledger",
  },
  "zh-Hans": {
    label: "TTTI 是什么",
    title: "TTTI 就是那一万。",
    p1: "组织严密。可靠。设计上可互换：每个单位完全相同，每笔转账都以同样的方式结算。",
    p2: "TTTI 只做一件事，并且从不失手：转移价值。",
    p3: "工具的价值，取决于握着它的那只手。",
    factsTitle: "事实",
    factMaxSupply: "最大供应量：10,000 TTTI",
    factDecimals: "8 位小数",
    factSmallestUnit: "最小单位：0.00000001 TTTI",
    factLedger: "账本延续自早期测试版本（见技术详情）",
    ledgerStandards: "账本标准",
  },
  "pt-BR": {
    label: "O que é TTTI",
    title: "TTTI são os dez mil.",
    p1: "Organizado. Confiável. Intercambiável por design: cada unidade é idêntica, cada transferência é liquidada da mesma forma.",
    p2: "TTTI faz uma única coisa, e a faz sem falhar: movimenta valor.",
    p3: "Um instrumento vale tanto quanto a mão que o segura.",
    factsTitle: "Os fatos",
    factMaxSupply: "Oferta máxima: 10.000 TTTI",
    factDecimals: "8 casas decimais",
    factSmallestUnit: "Menor unidade: 0,00000001 TTTI",
    factLedger:
      "Ledger continuado a partir de versões de teste anteriores (veja Detalhes técnicos)",
    ledgerStandards: "Padrões do ledger",
  },
  ko: {
    label: "TTTI란",
    title: "TTTI가 바로 그 만 명입니다.",
    p1: "조직적입니다. 신뢰할 수 있습니다. 설계상 서로 대체 가능합니다: 모든 단위는 동일하고, 모든 전송은 같은 방식으로 정산됩니다.",
    p2: "TTTI는 한 가지 일만 하며, 그 일을 어김없이 해냅니다: 가치를 옮깁니다.",
    p3: "도구의 가치는 그것을 쥔 손에 달려 있습니다.",
    factsTitle: "사실",
    factMaxSupply: "최대 공급량: 10,000 TTTI",
    factDecimals: "소수점 8자리",
    factSmallestUnit: "최소 단위: 0.00000001 TTTI",
    factLedger: "이전 테스트 버전에서 이어진 원장 (기술 세부 정보 참조)",
    ledgerStandards: "원장 표준",
  },
  "pa-Guru": {
    label: "TTTI ਕੀ ਹੈ",
    title: "TTTI ਹੀ ਉਹ ਦਸ ਹਜ਼ਾਰ ਹੈ।",
    p1: "ਸੰਗਠਿਤ। ਭਰੋਸੇਯੋਗ। ਡਿਜ਼ਾਈਨ ਪੱਖੋਂ ਇੱਕ-ਦੂਜੇ ਨਾਲ ਬਦਲਣਯੋਗ: ਹਰ ਇਕਾਈ ਇੱਕੋ ਜਿਹੀ ਹੈ, ਹਰ ਟ੍ਰਾਂਸਫਰ ਇੱਕੋ ਤਰੀਕੇ ਨਾਲ ਨਿਪਟਦਾ ਹੈ।",
    p2: "TTTI ਇੱਕ ਹੀ ਕੰਮ ਕਰਦਾ ਹੈ, ਅਤੇ ਬਿਨਾਂ ਚੂਕੇ ਕਰਦਾ ਹੈ: ਇਹ ਮੁੱਲ ਨੂੰ ਅੱਗੇ ਪਹੁੰਚਾਉਂਦਾ ਹੈ।",
    p3: "ਕੋਈ ਸੰਦ ਓਨਾ ਹੀ ਚੰਗਾ ਹੁੰਦਾ ਹੈ ਜਿੰਨਾ ਉਸ ਨੂੰ ਫੜਨ ਵਾਲਾ ਹੱਥ।",
    factsTitle: "ਤੱਥ",
    factMaxSupply: "ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ: 10,000 TTTI",
    factDecimals: "8 ਦਸ਼ਮਲਵ ਅੰਕ",
    factSmallestUnit: "ਸਭ ਤੋਂ ਛੋਟੀ ਇਕਾਈ: 0.00000001 TTTI",
    factLedger: "ਪਹਿਲਾਂ ਦੇ ਟੈਸਟ ਸੰਸਕਰਣਾਂ ਤੋਂ ਜਾਰੀ ਲੈਜਰ (ਤਕਨੀਕੀ ਵੇਰਵੇ ਦੇਖੋ)",
    ledgerStandards: "ਲੈਜਰ ਮਿਆਰ",
  },
});

export const TOKEN_INFO_TEXT = defineDict({
  en: {
    errorTitle: "Token details are unavailable",
    errorText:
      "The ledger could not be reached just now. Please try again in a moment.",
    eyebrow: "The ledger",
    liveFigures: "Live figures from the TTTI-T ledger.",
    maximumSupply: "Maximum supply",
    totalSupply: "Total supply",
    referencePrice: "Reference price",
    transferFee: "Transfer fee",
    ledgerStandardsLine: "Ledger standards: ICRC-1 · ICRC-2 · ICRC-3",
    technicalDetails: "Technical details",
    technicalError:
      "Technical details are unavailable right now. Please try again in a moment.",
    tokenName: "Token name",
    symbol: "Symbol",
    decimals: "Decimals",
    smallestUnit: "Smallest unit",
    smallestUnitValue: (units: string, amount: string, symbol: string) =>
      `${units} base unit = ${amount} ${symbol}`,
    transferFeeValue: (amount: string, symbol: string, units: string) =>
      `${amount} ${symbol} (${units} base units)`,
    pricePerToken: "Price per token",
    buyerPrice: "Buyer price incl. fee (ICP)",
    icpFee: "ICP fee",
    minPurchase: "Minimum purchase (ICP)",
    minPurchaseValue: (amount: string, usd: string) =>
      `${amount} (${usd} incl. fee)`,
    ledgerCanister: "TTTI-T ledger canister ID",
    indexCanister: "Index canister",
    icpLedgerCanister: "ICP ledger canister ID",
    ckbtcMinter: "ckBTC minter canister ID",
    payingInBtc: "Paying in BTC",
    standards: "Standards",
    priceSources: "Price sources",
    maxRateAge: "Maximum rate age",
    seconds: (count: string) => `${count} seconds`,
    refreshPolicy: "Rate refresh policy",
    roundingRule: "Rounding rule",
    excessPayment: "Excess payment handling",
    deliveryOrder: "Delivery order",
    controllers: "Controllers",
    none: "None",
    buildHash: "Build hash",
    legacyBoundary: "Legacy block boundary",
    sourceCode: "Source code",
    conversion: "TTTI-T to TTTI conversion",
    noConversion: "No conversion function exists yet",
    notPublished: "Not yet published",
    notRead: "Not yet read",
    unavailable: "Unavailable",
    feeAccount: "Fee account",
    feeAccountBalance: "Fee account balance:",
    acceptedPayTokens: "Accepted pay tokens",
    payTokenLine: (
      decimals: string,
      fee: string,
      symbol: string,
      units: string,
      rate: string,
    ) =>
      `Decimals: ${decimals} · Ledger fee: ${fee} ${symbol} (${units} base units) · Fee rate: ${rate}`,
    cyclesReserve: "Cycles reserve",
    cyclesReserveAccount: "Cycles reserve account",
    floor: "Floor:",
    reserveBalance: "Reserve balance:",
    lastTopUp: "Last top-up:",
    loading: "Loading…",
    noneYet: "None yet",
    accountAria: (name: string, account: string) => `${name}: ${account}`,
    copiedAria: (name: string) => `${name} copied`,
    copyAria: (name: string) => `Copy ${name.toLowerCase()}`,
  },
  fr: {
    errorTitle: "Les détails du jeton sont indisponibles",
    errorText:
      "Le ledger n'a pas pu être joint pour le moment. Veuillez réessayer dans un instant.",
    eyebrow: "Le ledger",
    liveFigures: "Chiffres en direct du ledger TTTI-T.",
    maximumSupply: "Offre maximale",
    totalSupply: "Offre totale",
    referencePrice: "Prix de référence",
    transferFee: "Frais de transfert",
    ledgerStandardsLine: "Standards du ledger : ICRC-1 · ICRC-2 · ICRC-3",
    technicalDetails: "Détails techniques",
    technicalError:
      "Les détails techniques sont indisponibles pour le moment. Veuillez réessayer dans un instant.",
    tokenName: "Nom du jeton",
    symbol: "Symbole",
    decimals: "Décimales",
    smallestUnit: "Plus petite unité",
    smallestUnitValue: (units: string, amount: string, symbol: string) =>
      `${units} unité de base = ${amount} ${symbol}`,
    transferFeeValue: (amount: string, symbol: string, units: string) =>
      `${amount} ${symbol} (${units} unités de base)`,
    pricePerToken: "Prix par jeton",
    buyerPrice: "Prix acheteur frais inclus (ICP)",
    icpFee: "Frais ICP",
    minPurchase: "Achat minimum (ICP)",
    minPurchaseValue: (amount: string, usd: string) =>
      `${amount} (${usd} frais inclus)`,
    ledgerCanister: "ID du canister ledger TTTI-T",
    indexCanister: "Canister d'index",
    icpLedgerCanister: "ID du canister ledger ICP",
    ckbtcMinter: "ID du canister minter ckBTC",
    payingInBtc: "Payer en BTC",
    standards: "Standards",
    priceSources: "Sources de prix",
    maxRateAge: "Âge maximal du taux",
    seconds: (count: string) => `${count} secondes`,
    refreshPolicy: "Politique d'actualisation du taux",
    roundingRule: "Règle d'arrondi",
    excessPayment: "Traitement des paiements excédentaires",
    deliveryOrder: "Ordre de livraison",
    controllers: "Contrôleurs",
    none: "Aucun",
    buildHash: "Hash du build",
    legacyBoundary: "Limite des anciens blocs",
    sourceCode: "Code source",
    conversion: "Conversion de TTTI-T en TTTI",
    noConversion: "Aucune fonction de conversion n'existe encore",
    notPublished: "Pas encore publié",
    notRead: "Pas encore lu",
    unavailable: "Indisponible",
    feeAccount: "Compte de frais",
    feeAccountBalance: "Solde du compte de frais :",
    acceptedPayTokens: "Jetons de paiement acceptés",
    payTokenLine: (
      decimals: string,
      fee: string,
      symbol: string,
      units: string,
      rate: string,
    ) =>
      `Décimales : ${decimals} · Frais du ledger : ${fee} ${symbol} (${units} unités de base) · Taux de frais : ${rate}`,
    cyclesReserve: "Réserve de cycles",
    cyclesReserveAccount: "Compte de la réserve de cycles",
    floor: "Plancher :",
    reserveBalance: "Solde de la réserve :",
    lastTopUp: "Dernière recharge :",
    loading: "Chargement…",
    noneYet: "Aucune pour l'instant",
    accountAria: (name: string, account: string) => `${name} : ${account}`,
    copiedAria: (name: string) => `${name} copié`,
    copyAria: (name: string) => `Copier le ${name.toLowerCase()}`,
  },
  es: {
    errorTitle: "Los detalles del token no están disponibles",
    errorText:
      "No se ha podido contactar con el ledger en este momento. Inténtelo de nuevo en un instante.",
    eyebrow: "El ledger",
    liveFigures: "Cifras en directo del ledger TTTI-T.",
    maximumSupply: "Suministro máximo",
    totalSupply: "Suministro total",
    referencePrice: "Precio de referencia",
    transferFee: "Comisión de transferencia",
    ledgerStandardsLine: "Estándares del ledger: ICRC-1 · ICRC-2 · ICRC-3",
    technicalDetails: "Detalles técnicos",
    technicalError:
      "Los detalles técnicos no están disponibles en este momento. Inténtelo de nuevo en un instante.",
    tokenName: "Nombre del token",
    symbol: "Símbolo",
    decimals: "Decimales",
    smallestUnit: "Unidad más pequeña",
    smallestUnitValue: (units: string, amount: string, symbol: string) =>
      `${units} unidad base = ${amount} ${symbol}`,
    transferFeeValue: (amount: string, symbol: string, units: string) =>
      `${amount} ${symbol} (${units} unidades base)`,
    pricePerToken: "Precio por token",
    buyerPrice: "Precio para el comprador con comisión incluida (ICP)",
    icpFee: "Comisión en ICP",
    minPurchase: "Compra mínima (ICP)",
    minPurchaseValue: (amount: string, usd: string) =>
      `${amount} (${usd} con comisión incluida)`,
    ledgerCanister: "ID del canister ledger de TTTI-T",
    indexCanister: "Canister de índice",
    icpLedgerCanister: "ID del canister ledger de ICP",
    ckbtcMinter: "ID del canister minter de ckBTC",
    payingInBtc: "Pagar en BTC",
    standards: "Estándares",
    priceSources: "Fuentes de precio",
    maxRateAge: "Antigüedad máxima del tipo de cambio",
    seconds: (count: string) => `${count} segundos`,
    refreshPolicy: "Política de actualización del tipo de cambio",
    roundingRule: "Regla de redondeo",
    excessPayment: "Tratamiento de los pagos excedentes",
    deliveryOrder: "Orden de entrega",
    controllers: "Controladores",
    none: "Ninguno",
    buildHash: "Hash de la compilación",
    legacyBoundary: "Límite de los bloques antiguos",
    sourceCode: "Código fuente",
    conversion: "Conversión de TTTI-T en TTTI",
    noConversion: "Todavía no existe ninguna función de conversión",
    notPublished: "Aún no publicado",
    notRead: "Aún no leído",
    unavailable: "No disponible",
    feeAccount: "Cuenta de comisiones",
    feeAccountBalance: "Saldo de la cuenta de comisiones:",
    acceptedPayTokens: "Tokens de pago aceptados",
    payTokenLine: (
      decimals: string,
      fee: string,
      symbol: string,
      units: string,
      rate: string,
    ) =>
      `Decimales: ${decimals} · Comisión del ledger: ${fee} ${symbol} (${units} unidades base) · Tasa de comisión: ${rate}`,
    cyclesReserve: "Reserva de ciclos",
    cyclesReserveAccount: "Cuenta de la reserva de ciclos",
    floor: "Mínimo:",
    reserveBalance: "Saldo de la reserva:",
    lastTopUp: "Última recarga:",
    loading: "Cargando…",
    noneYet: "Ninguna por ahora",
    accountAria: (name: string, account: string) => `${name}: ${account}`,
    copiedAria: (name: string) => `${name} copiado`,
    copyAria: (name: string) => `Copiar ${name.toLowerCase()}`,
  },
  "zh-Hans": {
    errorTitle: "代币详情暂不可用",
    errorText: "暂时无法连接账本，请稍后重试。",
    eyebrow: "账本",
    liveFigures: "来自 TTTI-T 账本的实时数据。",
    maximumSupply: "最大供应量",
    totalSupply: "总供应量",
    referencePrice: "参考价格",
    transferFee: "转账手续费",
    ledgerStandardsLine: "账本标准：ICRC-1 · ICRC-2 · ICRC-3",
    technicalDetails: "技术详情",
    technicalError: "技术详情暂不可用，请稍后重试。",
    tokenName: "代币名称",
    symbol: "符号",
    decimals: "小数位数",
    smallestUnit: "最小单位",
    smallestUnitValue: (units: string, amount: string, symbol: string) =>
      `${units} 个基本单位 = ${amount} ${symbol}`,
    transferFeeValue: (amount: string, symbol: string, units: string) =>
      `${amount} ${symbol}（${units} 个基本单位）`,
    pricePerToken: "每枚代币价格",
    buyerPrice: "买方含手续费价格（ICP）",
    icpFee: "ICP 手续费",
    minPurchase: "最低购买额（ICP）",
    minPurchaseValue: (amount: string, usd: string) =>
      `${amount}（含手续费 ${usd}）`,
    ledgerCanister: "TTTI-T 账本 canister ID",
    indexCanister: "索引 canister",
    icpLedgerCanister: "ICP 账本 canister ID",
    ckbtcMinter: "ckBTC minter canister ID",
    payingInBtc: "使用 BTC 支付",
    standards: "标准",
    priceSources: "价格来源",
    maxRateAge: "汇率最长有效时间",
    seconds: (count: string) => `${count} 秒`,
    refreshPolicy: "汇率更新规则",
    roundingRule: "取整规则",
    excessPayment: "超额付款处理",
    deliveryOrder: "交付顺序",
    controllers: "控制者",
    none: "无",
    buildHash: "构建哈希",
    legacyBoundary: "旧区块边界",
    sourceCode: "源代码",
    conversion: "TTTI-T 转换为 TTTI",
    noConversion: "目前尚无转换功能",
    notPublished: "尚未发布",
    notRead: "尚未读取",
    unavailable: "不可用",
    feeAccount: "手续费账户",
    feeAccountBalance: "手续费账户余额：",
    acceptedPayTokens: "接受的支付代币",
    payTokenLine: (
      decimals: string,
      fee: string,
      symbol: string,
      units: string,
      rate: string,
    ) =>
      `小数位数：${decimals} · 账本手续费：${fee} ${symbol}（${units} 个基本单位）· 手续费率：${rate}`,
    cyclesReserve: "Cycles 储备",
    cyclesReserveAccount: "Cycles 储备账户",
    floor: "下限：",
    reserveBalance: "储备余额：",
    lastTopUp: "最近一次充值：",
    loading: "加载中…",
    noneYet: "暂无",
    accountAria: (name: string, account: string) => `${name}：${account}`,
    copiedAria: (name: string) => `已复制${name}`,
    copyAria: (name: string) => `复制${name}`,
  },
  "pt-BR": {
    errorTitle: "Os detalhes do token não estão disponíveis",
    errorText:
      "Não foi possível acessar o ledger agora. Tente novamente em instantes.",
    eyebrow: "O ledger",
    liveFigures: "Números ao vivo do ledger TTTI-T.",
    maximumSupply: "Oferta máxima",
    totalSupply: "Oferta total",
    referencePrice: "Preço de referência",
    transferFee: "Taxa de transferência",
    ledgerStandardsLine: "Padrões do ledger: ICRC-1 · ICRC-2 · ICRC-3",
    technicalDetails: "Detalhes técnicos",
    technicalError:
      "Os detalhes técnicos não estão disponíveis no momento. Tente novamente em instantes.",
    tokenName: "Nome do token",
    symbol: "Símbolo",
    decimals: "Casas decimais",
    smallestUnit: "Menor unidade",
    smallestUnitValue: (units: string, amount: string, symbol: string) =>
      `${units} unidade base = ${amount} ${symbol}`,
    transferFeeValue: (amount: string, symbol: string, units: string) =>
      `${amount} ${symbol} (${units} unidades base)`,
    pricePerToken: "Preço por token",
    buyerPrice: "Preço para o comprador com taxa incluída (ICP)",
    icpFee: "Taxa em ICP",
    minPurchase: "Compra mínima (ICP)",
    minPurchaseValue: (amount: string, usd: string) =>
      `${amount} (${usd} com taxa incluída)`,
    ledgerCanister: "ID do canister ledger do TTTI-T",
    indexCanister: "Canister de índice",
    icpLedgerCanister: "ID do canister ledger do ICP",
    ckbtcMinter: "ID do canister minter do ckBTC",
    payingInBtc: "Pagar em BTC",
    standards: "Padrões",
    priceSources: "Fontes de preço",
    maxRateAge: "Idade máxima da cotação",
    seconds: (count: string) => `${count} segundos`,
    refreshPolicy: "Política de atualização da cotação",
    roundingRule: "Regra de arredondamento",
    excessPayment: "Tratamento de pagamentos excedentes",
    deliveryOrder: "Ordem de entrega",
    controllers: "Controladores",
    none: "Nenhum",
    buildHash: "Hash do build",
    legacyBoundary: "Limite dos blocos antigos",
    sourceCode: "Código-fonte",
    conversion: "Conversão de TTTI-T em TTTI",
    noConversion: "Ainda não existe nenhuma função de conversão",
    notPublished: "Ainda não publicado",
    notRead: "Ainda não lido",
    unavailable: "Indisponível",
    feeAccount: "Conta de taxas",
    feeAccountBalance: "Saldo da conta de taxas:",
    acceptedPayTokens: "Tokens de pagamento aceitos",
    payTokenLine: (
      decimals: string,
      fee: string,
      symbol: string,
      units: string,
      rate: string,
    ) =>
      `Casas decimais: ${decimals} · Taxa do ledger: ${fee} ${symbol} (${units} unidades base) · Alíquota da taxa: ${rate}`,
    cyclesReserve: "Reserva de cycles",
    cyclesReserveAccount: "Conta da reserva de cycles",
    floor: "Piso:",
    reserveBalance: "Saldo da reserva:",
    lastTopUp: "Última recarga:",
    loading: "Carregando…",
    noneYet: "Nenhuma até agora",
    accountAria: (name: string, account: string) => `${name}: ${account}`,
    copiedAria: (name: string) => `${name} copiado`,
    copyAria: (name: string) => `Copiar ${name.toLowerCase()}`,
  },
  ko: {
    errorTitle: "토큰 세부 정보를 사용할 수 없습니다",
    errorText: "지금은 원장에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    eyebrow: "원장",
    liveFigures: "TTTI-T 원장의 실시간 수치입니다.",
    maximumSupply: "최대 공급량",
    totalSupply: "총 공급량",
    referencePrice: "기준 가격",
    transferFee: "전송 수수료",
    ledgerStandardsLine: "원장 표준: ICRC-1 · ICRC-2 · ICRC-3",
    technicalDetails: "기술 세부 정보",
    technicalError:
      "지금은 기술 세부 정보를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    tokenName: "토큰 이름",
    symbol: "심볼",
    decimals: "소수 자릿수",
    smallestUnit: "최소 단위",
    smallestUnitValue: (units: string, amount: string, symbol: string) =>
      `기본 단위 ${units}개 = ${amount} ${symbol}`,
    transferFeeValue: (amount: string, symbol: string, units: string) =>
      `${amount} ${symbol} (기본 단위 ${units}개)`,
    pricePerToken: "토큰당 가격",
    buyerPrice: "수수료 포함 구매자 가격 (ICP)",
    icpFee: "ICP 수수료",
    minPurchase: "최소 구매액 (ICP)",
    minPurchaseValue: (amount: string, usd: string) =>
      `${amount} (수수료 포함 ${usd})`,
    ledgerCanister: "TTTI-T 원장 canister ID",
    indexCanister: "인덱스 canister",
    icpLedgerCanister: "ICP 원장 canister ID",
    ckbtcMinter: "ckBTC minter canister ID",
    payingInBtc: "BTC로 결제하기",
    standards: "표준",
    priceSources: "가격 출처",
    maxRateAge: "환율 최대 유효 시간",
    seconds: (count: string) => `${count}초`,
    refreshPolicy: "환율 갱신 정책",
    roundingRule: "반올림 규칙",
    excessPayment: "초과 결제 처리",
    deliveryOrder: "지급 순서",
    controllers: "컨트롤러",
    none: "없음",
    buildHash: "빌드 해시",
    legacyBoundary: "이전 블록 경계",
    sourceCode: "소스 코드",
    conversion: "TTTI-T에서 TTTI로의 전환",
    noConversion: "아직 전환 기능이 없습니다",
    notPublished: "아직 공개되지 않음",
    notRead: "아직 읽지 않음",
    unavailable: "사용할 수 없음",
    feeAccount: "수수료 계정",
    feeAccountBalance: "수수료 계정 잔액:",
    acceptedPayTokens: "허용되는 결제 토큰",
    payTokenLine: (
      decimals: string,
      fee: string,
      symbol: string,
      units: string,
      rate: string,
    ) =>
      `소수 자릿수: ${decimals} · 원장 수수료: ${fee} ${symbol} (기본 단위 ${units}개) · 수수료율: ${rate}`,
    cyclesReserve: "Cycles 준비금",
    cyclesReserveAccount: "Cycles 준비금 계정",
    floor: "하한:",
    reserveBalance: "준비금 잔액:",
    lastTopUp: "마지막 충전:",
    loading: "불러오는 중…",
    noneYet: "아직 없음",
    accountAria: (name: string, account: string) => `${name}: ${account}`,
    copiedAria: (name: string) => `${name} 복사됨`,
    copyAria: (name: string) => `${name} 복사`,
  },
  "pa-Guru": {
    errorTitle: "ਟੋਕਨ ਦੇ ਵੇਰਵੇ ਉਪਲਬਧ ਨਹੀਂ ਹਨ",
    errorText:
      "ਇਸ ਵੇਲੇ ਲੈਜਰ ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    eyebrow: "ਲੈਜਰ",
    liveFigures: "TTTI-T ਲੈਜਰ ਤੋਂ ਲਾਈਵ ਅੰਕੜੇ।",
    maximumSupply: "ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ",
    totalSupply: "ਕੁੱਲ ਸਪਲਾਈ",
    referencePrice: "ਹਵਾਲਾ ਕੀਮਤ",
    transferFee: "ਟ੍ਰਾਂਸਫਰ ਫੀਸ",
    ledgerStandardsLine: "ਲੈਜਰ ਮਿਆਰ: ICRC-1 · ICRC-2 · ICRC-3",
    technicalDetails: "ਤਕਨੀਕੀ ਵੇਰਵੇ",
    technicalError:
      "ਤਕਨੀਕੀ ਵੇਰਵੇ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    tokenName: "ਟੋਕਨ ਦਾ ਨਾਂ",
    symbol: "ਚਿੰਨ੍ਹ",
    decimals: "ਦਸ਼ਮਲਵ ਅੰਕ",
    smallestUnit: "ਸਭ ਤੋਂ ਛੋਟੀ ਇਕਾਈ",
    smallestUnitValue: (units: string, amount: string, symbol: string) =>
      `${units} ਮੂਲ ਇਕਾਈ = ${amount} ${symbol}`,
    transferFeeValue: (amount: string, symbol: string, units: string) =>
      `${amount} ${symbol} (${units} ਮੂਲ ਇਕਾਈਆਂ)`,
    pricePerToken: "ਪ੍ਰਤੀ ਟੋਕਨ ਕੀਮਤ",
    buyerPrice: "ਫੀਸ ਸਮੇਤ ਖਰੀਦਦਾਰ ਕੀਮਤ (ICP)",
    icpFee: "ICP ਫੀਸ",
    minPurchase: "ਘੱਟੋ-ਘੱਟ ਖਰੀਦ (ICP)",
    minPurchaseValue: (amount: string, usd: string) =>
      `${amount} (ਫੀਸ ਸਮੇਤ ${usd})`,
    ledgerCanister: "TTTI-T ਲੈਜਰ canister ID",
    indexCanister: "ਇੰਡੈਕਸ canister",
    icpLedgerCanister: "ICP ਲੈਜਰ canister ID",
    ckbtcMinter: "ckBTC minter canister ID",
    payingInBtc: "BTC ਵਿੱਚ ਭੁਗਤਾਨ",
    standards: "ਮਿਆਰ",
    priceSources: "ਕੀਮਤ ਦੇ ਸਰੋਤ",
    maxRateAge: "ਦਰ ਦੀ ਵੱਧ ਤੋਂ ਵੱਧ ਉਮਰ",
    seconds: (count: string) => `${count} ਸਕਿੰਟ`,
    refreshPolicy: "ਦਰ ਨਵਿਆਉਣ ਦੀ ਨੀਤੀ",
    roundingRule: "ਪੂਰਨ ਅੰਕ ਬਣਾਉਣ ਦਾ ਨਿਯਮ",
    excessPayment: "ਵਾਧੂ ਭੁਗਤਾਨ ਦਾ ਪ੍ਰਬੰਧ",
    deliveryOrder: "ਡਿਲੀਵਰੀ ਦਾ ਕ੍ਰਮ",
    controllers: "ਕੰਟਰੋਲਰ",
    none: "ਕੋਈ ਨਹੀਂ",
    buildHash: "ਬਿਲਡ ਹੈਸ਼",
    legacyBoundary: "ਪੁਰਾਣੇ ਬਲਾਕਾਂ ਦੀ ਹੱਦ",
    sourceCode: "ਸਰੋਤ ਕੋਡ",
    conversion: "TTTI-T ਤੋਂ TTTI ਵਿੱਚ ਬਦਲਾਅ",
    noConversion: "ਹਾਲੇ ਕੋਈ ਬਦਲਾਅ ਫੰਕਸ਼ਨ ਮੌਜੂਦ ਨਹੀਂ ਹੈ",
    notPublished: "ਹਾਲੇ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ",
    notRead: "ਹਾਲੇ ਪੜ੍ਹਿਆ ਨਹੀਂ ਗਿਆ",
    unavailable: "ਉਪਲਬਧ ਨਹੀਂ",
    feeAccount: "ਫੀਸ ਖਾਤਾ",
    feeAccountBalance: "ਫੀਸ ਖਾਤੇ ਦਾ ਬਕਾਇਆ:",
    acceptedPayTokens: "ਸਵੀਕਾਰ ਕੀਤੇ ਭੁਗਤਾਨ ਟੋਕਨ",
    payTokenLine: (
      decimals: string,
      fee: string,
      symbol: string,
      units: string,
      rate: string,
    ) =>
      `ਦਸ਼ਮਲਵ ਅੰਕ: ${decimals} · ਲੈਜਰ ਫੀਸ: ${fee} ${symbol} (${units} ਮੂਲ ਇਕਾਈਆਂ) · ਫੀਸ ਦਰ: ${rate}`,
    cyclesReserve: "Cycles ਰਿਜ਼ਰਵ",
    cyclesReserveAccount: "Cycles ਰਿਜ਼ਰਵ ਖਾਤਾ",
    floor: "ਹੇਠਲੀ ਸੀਮਾ:",
    reserveBalance: "ਰਿਜ਼ਰਵ ਬਕਾਇਆ:",
    lastTopUp: "ਆਖਰੀ ਟਾਪ-ਅੱਪ:",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
    noneYet: "ਹਾਲੇ ਕੋਈ ਨਹੀਂ",
    accountAria: (name: string, account: string) => `${name}: ${account}`,
    copiedAria: (name: string) => `${name} ਕਾਪੀ ਹੋ ਗਿਆ`,
    copyAria: (name: string) => `${name} ਕਾਪੀ ਕਰੋ`,
  },
});

/**
 * Fixed sentences returned in English by getTechnicalDetails. The English
 * entries are the exact backend strings; a value that matches one is shown in
 * the active language, any other value is shown as returned.
 */
export const TECH_BACKEND_TEXT = defineDict({
  en: {
    oracleCoinbase:
      "Coinbase spot price for ICP-USD, BTC-USD, USDC-USD and USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
    oracleCoingecko:
      "CoinGecko simple price for internet-computer, bitcoin, usd-coin and tether, if Coinbase is unavailable (https://api.coingecko.com/api/v3/simple/price)",
    refreshPolicy:
      "The USD rate of ICP, BTC, USDC and USDT is fetched once an hour (Coinbase first, then CoinGecko) and is valid for one hour. A purchase is refused when the rate of the paid token has expired.",
    roundingRule:
      "TTTI-T amounts are rounded down to 1 base unit (0.00000001 TTTI-T). The cost of a delivered amount is rounded up to 1 base unit of the paid token (ICP and ckBTC: 8 decimals; ckUSDC and ckUSDT: 6 decimals).",
    excessPaymentHandling:
      "No amount of the paid token beyond the cost of what is delivered is taken.",
    deliveryOrder:
      "Fresh minting first, up to the 1 TTTI-T max supply (100_000_000 base units); what can still be minted is the max supply minus the total supply. Tokens cannot be burned. Transfer fees collected in the fee account are delivered to buyers against ICP, ckBTC, ckUSDC or ckUSDT only once fresh minting has reached the cap.",
  },
  fr: {
    oracleCoinbase:
      "Prix spot Coinbase pour ICP-USD, BTC-USD, USDC-USD et USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
    oracleCoingecko:
      "Prix simple CoinGecko pour internet-computer, bitcoin, usd-coin et tether, si Coinbase est indisponible (https://api.coingecko.com/api/v3/simple/price)",
    refreshPolicy:
      "Le taux USD de l'ICP, du BTC, de l'USDC et de l'USDT est récupéré une fois par heure (Coinbase d'abord, puis CoinGecko) et est valable une heure. Un achat est refusé lorsque le taux du jeton payé a expiré.",
    roundingRule:
      "Les montants en TTTI-T sont arrondis à l'inférieur à 1 unité de base (0.00000001 TTTI-T). Le coût d'un montant livré est arrondi au supérieur à 1 unité de base du jeton payé (ICP et ckBTC : 8 décimales ; ckUSDC et ckUSDT : 6 décimales).",
    excessPaymentHandling:
      "Aucun montant du jeton payé au-delà du coût de ce qui est livré n'est prélevé.",
    deliveryOrder:
      "Frappe nouvelle d'abord, jusqu'à l'offre maximale de 1 TTTI-T (100_000_000 unités de base) ; ce qui peut encore être frappé est l'offre maximale moins l'offre totale. Les jetons ne peuvent pas être brûlés. Les frais de transfert perçus sur le compte de frais ne sont livrés aux acheteurs contre de l'ICP, du ckBTC, du ckUSDC ou du ckUSDT qu'une fois que la frappe nouvelle a atteint le plafond.",
  },
  es: {
    oracleCoinbase:
      "Precio spot de Coinbase para ICP-USD, BTC-USD, USDC-USD y USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
    oracleCoingecko:
      "Precio simple de CoinGecko para internet-computer, bitcoin, usd-coin y tether, si Coinbase no está disponible (https://api.coingecko.com/api/v3/simple/price)",
    refreshPolicy:
      "El tipo de cambio en USD de ICP, BTC, USDC y USDT se obtiene una vez por hora (primero Coinbase, después CoinGecko) y es válido durante una hora. Una compra se rechaza cuando el tipo de cambio del token pagado ha caducado.",
    roundingRule:
      "Los importes de TTTI-T se redondean a la baja a 1 unidad base (0.00000001 TTTI-T). El coste de un importe entregado se redondea al alza a 1 unidad base del token pagado (ICP y ckBTC: 8 decimales; ckUSDC y ckUSDT: 6 decimales).",
    excessPaymentHandling:
      "No se toma ninguna cantidad del token pagado por encima del coste de lo que se entrega.",
    deliveryOrder:
      "Primero la acuñación nueva, hasta el suministro máximo de 1 TTTI-T (100_000_000 unidades base); lo que aún puede acuñarse es el suministro máximo menos el suministro total. Los tokens no se pueden quemar. Las comisiones de transferencia cobradas en la cuenta de comisiones se entregan a los compradores a cambio de ICP, ckBTC, ckUSDC o ckUSDT solo una vez que la acuñación nueva ha alcanzado el límite.",
  },
  "zh-Hans": {
    oracleCoinbase:
      "Coinbase 的 ICP-USD、BTC-USD、USDC-USD 和 USDT-USD 现货价格（https://api.coinbase.com/v2/prices/<PAIR>/spot）",
    oracleCoingecko:
      "Coinbase 不可用时，使用 CoinGecko 的 internet-computer、bitcoin、usd-coin 和 tether 简单价格（https://api.coingecko.com/api/v3/simple/price）",
    refreshPolicy:
      "ICP、BTC、USDC 和 USDT 的美元汇率每小时获取一次（先 Coinbase，后 CoinGecko），有效期为一小时。所支付代币的汇率过期时，购买将被拒绝。",
    roundingRule:
      "TTTI-T 金额向下取整至 1 个基本单位（0.00000001 TTTI-T）。所交付金额的费用向上取整至所支付代币的 1 个基本单位（ICP 和 ckBTC：8 位小数；ckUSDC 和 ckUSDT：6 位小数）。",
    excessPaymentHandling: "所支付代币中超出所交付内容费用的部分一概不收取。",
    deliveryOrder:
      "先进行新铸造，直至 1 TTTI-T 的最大供应量（100_000_000 个基本单位）；仍可铸造的数量为最大供应量减去总供应量。代币无法销毁。手续费账户中收取的转账手续费，仅在新铸造达到上限之后，才会以 ICP、ckBTC、ckUSDC 或 ckUSDT 为对价交付给买方。",
  },
  "pt-BR": {
    oracleCoinbase:
      "Preço spot da Coinbase para ICP-USD, BTC-USD, USDC-USD e USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
    oracleCoingecko:
      "Preço simples da CoinGecko para internet-computer, bitcoin, usd-coin e tether, se a Coinbase estiver indisponível (https://api.coingecko.com/api/v3/simple/price)",
    refreshPolicy:
      "A cotação em USD de ICP, BTC, USDC e USDT é obtida uma vez por hora (primeiro Coinbase, depois CoinGecko) e é válida por uma hora. Uma compra é recusada quando a cotação do token pago expirou.",
    roundingRule:
      "Os valores em TTTI-T são arredondados para baixo a 1 unidade base (0,00000001 TTTI-T). O custo de um valor entregue é arredondado para cima a 1 unidade base do token pago (ICP e ckBTC: 8 casas decimais; ckUSDC e ckUSDT: 6 casas decimais).",
    excessPaymentHandling:
      "Nenhum valor do token pago além do custo do que é entregue é retirado.",
    deliveryOrder:
      "Primeiro a cunhagem nova, até a oferta máxima de 1 TTTI-T (100_000_000 unidades base); o que ainda pode ser cunhado é a oferta máxima menos a oferta total. Os tokens não podem ser queimados. As taxas de transferência cobradas na conta de taxas são entregues aos compradores em troca de ICP, ckBTC, ckUSDC ou ckUSDT somente depois que a cunhagem nova atinge o limite.",
  },
  ko: {
    oracleCoinbase:
      "ICP-USD, BTC-USD, USDC-USD 및 USDT-USD에 대한 Coinbase 현물 가격 (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
    oracleCoingecko:
      "Coinbase를 사용할 수 없는 경우, internet-computer, bitcoin, usd-coin 및 tether에 대한 CoinGecko 단순 가격 (https://api.coingecko.com/api/v3/simple/price)",
    refreshPolicy:
      "ICP, BTC, USDC 및 USDT의 USD 환율은 한 시간에 한 번 조회되며(Coinbase 우선, 그다음 CoinGecko) 한 시간 동안 유효합니다. 결제 토큰의 환율이 만료되면 구매가 거부됩니다.",
    roundingRule:
      "TTTI-T 금액은 기본 단위 1개(0.00000001 TTTI-T) 단위로 내림합니다. 지급되는 금액의 비용은 결제 토큰의 기본 단위 1개 단위로 올림합니다(ICP 및 ckBTC: 소수점 8자리, ckUSDC 및 ckUSDT: 소수점 6자리).",
    excessPaymentHandling:
      "지급되는 것의 비용을 초과하는 결제 토큰은 전혀 가져가지 않습니다.",
    deliveryOrder:
      "먼저 신규 발행이 이루어지며, 최대 공급량 1 TTTI-T(기본 단위 100_000_000개)까지입니다. 아직 발행 가능한 수량은 최대 공급량에서 총 공급량을 뺀 값입니다. 토큰은 소각할 수 없습니다. 수수료 계정에 징수된 전송 수수료는 신규 발행이 상한에 도달한 후에만 ICP, ckBTC, ckUSDC 또는 ckUSDT를 대가로 구매자에게 지급됩니다.",
  },
  "pa-Guru": {
    oracleCoinbase:
      "ICP-USD, BTC-USD, USDC-USD ਅਤੇ USDT-USD ਲਈ Coinbase ਸਪਾਟ ਕੀਮਤ (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
    oracleCoingecko:
      "ਜੇ Coinbase ਉਪਲਬਧ ਨਾ ਹੋਵੇ, ਤਾਂ internet-computer, bitcoin, usd-coin ਅਤੇ tether ਲਈ CoinGecko ਸਧਾਰਨ ਕੀਮਤ (https://api.coingecko.com/api/v3/simple/price)",
    refreshPolicy:
      "ICP, BTC, USDC ਅਤੇ USDT ਦੀ USD ਦਰ ਘੰਟੇ ਵਿੱਚ ਇੱਕ ਵਾਰ ਲਈ ਜਾਂਦੀ ਹੈ (ਪਹਿਲਾਂ Coinbase, ਫਿਰ CoinGecko) ਅਤੇ ਇੱਕ ਘੰਟੇ ਲਈ ਵੈਧ ਰਹਿੰਦੀ ਹੈ। ਜਦੋਂ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ ਦਰ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਜਾਂਦੀ ਹੈ, ਤਾਂ ਖਰੀਦ ਰੱਦ ਕਰ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।",
    roundingRule:
      "TTTI-T ਰਕਮਾਂ ਨੂੰ 1 ਮੂਲ ਇਕਾਈ (0.00000001 TTTI-T) ਤੱਕ ਹੇਠਾਂ ਵੱਲ ਪੂਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਡਿਲੀਵਰ ਕੀਤੀ ਰਕਮ ਦੀ ਲਾਗਤ ਨੂੰ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ 1 ਮੂਲ ਇਕਾਈ ਤੱਕ ਉੱਪਰ ਵੱਲ ਪੂਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ (ICP ਅਤੇ ckBTC: 8 ਦਸ਼ਮਲਵ ਅੰਕ; ckUSDC ਅਤੇ ckUSDT: 6 ਦਸ਼ਮਲਵ ਅੰਕ)।",
    excessPaymentHandling:
      "ਡਿਲੀਵਰ ਕੀਤੀ ਚੀਜ਼ ਦੀ ਲਾਗਤ ਤੋਂ ਵੱਧ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ ਕੋਈ ਵੀ ਰਕਮ ਨਹੀਂ ਲਈ ਜਾਂਦੀ।",
    deliveryOrder:
      "ਪਹਿਲਾਂ ਨਵੀਂ ਮਿੰਟਿੰਗ, 1 TTTI-T ਦੀ ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ (100_000_000 ਮੂਲ ਇਕਾਈਆਂ) ਤੱਕ; ਜੋ ਹਾਲੇ ਮਿੰਟ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ ਉਹ ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਘਟਾ ਕੁੱਲ ਸਪਲਾਈ ਹੈ। ਟੋਕਨ ਬਰਨ ਨਹੀਂ ਕੀਤੇ ਜਾ ਸਕਦੇ। ਫੀਸ ਖਾਤੇ ਵਿੱਚ ਇਕੱਠੀਆਂ ਕੀਤੀਆਂ ਟ੍ਰਾਂਸਫਰ ਫੀਸਾਂ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਦੇ ਬਦਲੇ ਖਰੀਦਦਾਰਾਂ ਨੂੰ ਸਿਰਫ਼ ਉਦੋਂ ਡਿਲੀਵਰ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ ਜਦੋਂ ਨਵੀਂ ਮਿੰਟਿੰਗ ਸੀਮਾ ਤੱਕ ਪਹੁੰਚ ਜਾਂਦੀ ਹੈ।",
  },
});

export const PRESALE_TEXT = defineDict({
  en: {
    label: "Test release",
    intro:
      "This is a test release: one token, TTTI-T, 10,000 USD in total, from 1 USD. Same price as any future TTTI: no discount, no bonus, no advantage. If a full release ever happens, TTTI-T converts 1:1 into TTTI. There may never be a full release.",
    errorText: "Live allocation figures are temporarily unavailable.",
    retry: "Try again",
    statusComplete: "Allocation complete",
    statusPaused: "Purchases paused",
    statusCurrent: "Current allocation",
    pricePerToken: "Price per TTTI-T (before the fee)",
    totalSupply: "Total supply",
    remaining: "Remaining",
    progressAria: (percent: string) =>
      `Total supply: ${percent}% of the maximum supply`,
    totalSupplyLine: (
      total: string,
      max: string,
      symbol: string,
      percent: string,
    ) => `Total supply: ${total} / ${max} ${symbol} (${percent}%)`,
    disclosuresTitle: "Creator disclosures",
    disclosure1:
      "For each mint, 100/101 of the ICP, ckBTC, ckUSDC or ckUSDT paid goes, in the paid token, to the owner's destination account set for that token; 1/101 is the mint fee. The creator may fund buybacks with personal funds. Buybacks are optional and limited, and nobody is obligated to buy back. The creator does not defend a price or trade to create volume. He will not open a liquidity pool or list TTTI on any other exchange. Any market is created by holders.",
    disclosure2:
      "TTTI and THAT have the same creator. TTTI has no link to THAT: it cannot be exchanged for THAT, used inside THAT, or converted into anything else.",
  },
  fr: {
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
    disclosure1:
      "Pour chaque mint, 100/101 de l'ICP, du ckBTC, du ckUSDC ou du ckUSDT payé vont, dans le jeton payé, au compte de destination du propriétaire fixé pour ce jeton ; 1/101 constitue les frais de mint. Le créateur peut financer des rachats avec ses fonds personnels. Les rachats sont facultatifs et limités, et personne n'est obligé de racheter. Le créateur ne défend aucun prix et n'effectue pas de transactions pour créer du volume. Il n'ouvrira pas de pool de liquidité et ne listera TTTI sur aucune autre plateforme d'échange. Tout marché est créé par les détenteurs.",
    disclosure2:
      "TTTI et THAT ont le même créateur. TTTI n'a aucun lien avec THAT : il ne peut pas être échangé contre THAT, ni utilisé au sein de THAT, ni converti en quoi que ce soit d'autre.",
  },
  es: {
    label: "Versión de prueba",
    intro:
      "Esta es una versión de prueba: un token, TTTI-T, 10.000 USD en total, desde 1 USD. Mismo precio que cualquier TTTI futuro: sin descuento, sin bonificación, sin ventaja. Si alguna vez hay una versión completa, TTTI-T se convierte 1:1 en TTTI. Es posible que nunca haya una versión completa.",
    errorText:
      "Las cifras de la asignación en directo no están disponibles temporalmente.",
    retry: "Reintentar",
    statusComplete: "Asignación completada",
    statusPaused: "Compras en pausa",
    statusCurrent: "Asignación en curso",
    pricePerToken: "Precio por TTTI-T (antes de la comisión)",
    totalSupply: "Suministro total",
    remaining: "Restante",
    progressAria: (percent: string) =>
      `Suministro total: ${percent}% del suministro máximo`,
    totalSupplyLine: (
      total: string,
      max: string,
      symbol: string,
      percent: string,
    ) => `Suministro total: ${total} / ${max} ${symbol} (${percent}%)`,
    disclosuresTitle: "Declaraciones del creador",
    disclosure1:
      "En cada mint, 100/101 del ICP, ckBTC, ckUSDC o ckUSDT pagado van, en el token pagado, a la cuenta de destino del propietario fijada para ese token; 1/101 es la comisión de mint. El creador puede financiar recompras con fondos personales. Las recompras son opcionales y limitadas, y nadie está obligado a recomprar. El creador no defiende ningún precio ni opera para generar volumen. No abrirá ningún pool de liquidez ni listará TTTI en ninguna otra plataforma de intercambio. Cualquier mercado lo crean los poseedores.",
    disclosure2:
      "TTTI y THAT tienen el mismo creador. TTTI no tiene ningún vínculo con THAT: no puede intercambiarse por THAT, ni usarse dentro de THAT, ni convertirse en ninguna otra cosa.",
  },
  "zh-Hans": {
    label: "测试版",
    intro:
      "这是一个测试版：一枚代币 TTTI-T，总计 10,000 USD，1 USD 起购。与未来任何 TTTI 价格相同：无折扣、无奖励、无优势。如果将来推出完整版，TTTI-T 将按 1:1 转换为 TTTI。完整版也可能永远不会推出。",
    errorText: "实时分配数据暂时不可用。",
    retry: "重试",
    statusComplete: "分配已完成",
    statusPaused: "购买已暂停",
    statusCurrent: "当前分配",
    pricePerToken: "每枚 TTTI-T 价格（不含手续费）",
    totalSupply: "总供应量",
    remaining: "剩余",
    progressAria: (percent: string) => `总供应量：最大供应量的 ${percent}%`,
    totalSupplyLine: (
      total: string,
      max: string,
      symbol: string,
      percent: string,
    ) => `总供应量：${total} / ${max} ${symbol}（${percent}%）`,
    disclosuresTitle: "创建者声明",
    disclosure1:
      "每次铸造时，所支付的 ICP、ckBTC、ckUSDC 或 ckUSDT 的 100/101 以所支付的代币转入为该代币设置的所有者目标账户；1/101 为铸造费用。创建者可以用个人资金为回购提供资金。回购是可选且有限的，任何人都没有回购的义务。创建者不维护任何价格，也不为制造交易量而交易。他不会开设流动性池，也不会在任何其他交易所上架 TTTI。任何市场均由持有者创建。",
    disclosure2:
      "TTTI 与 THAT 出自同一创建者。TTTI 与 THAT 没有任何关联：它不能兑换为 THAT，不能在 THAT 中使用，也不能转换为任何其他东西。",
  },
  "pt-BR": {
    label: "Versão de teste",
    intro:
      "Esta é uma versão de teste: um token, TTTI-T, 10.000 USD no total, a partir de 1 USD. Mesmo preço de qualquer TTTI futuro: sem desconto, sem bônus, sem vantagem. Se algum dia houver uma versão completa, TTTI-T será convertido 1:1 em TTTI. Pode ser que nunca haja uma versão completa.",
    errorText:
      "Os números da alocação ao vivo estão temporariamente indisponíveis.",
    retry: "Tentar novamente",
    statusComplete: "Alocação concluída",
    statusPaused: "Compras pausadas",
    statusCurrent: "Alocação atual",
    pricePerToken: "Preço por TTTI-T (antes da taxa)",
    totalSupply: "Oferta total",
    remaining: "Restante",
    progressAria: (percent: string) =>
      `Oferta total: ${percent}% da oferta máxima`,
    totalSupplyLine: (
      total: string,
      max: string,
      symbol: string,
      percent: string,
    ) => `Oferta total: ${total} / ${max} ${symbol} (${percent}%)`,
    disclosuresTitle: "Declarações do criador",
    disclosure1:
      "Em cada mint, 100/101 do ICP, ckBTC, ckUSDC ou ckUSDT pago vão, no token pago, para a conta de destino do proprietário definida para esse token; 1/101 é a taxa de mint. O criador pode financiar recompras com fundos pessoais. As recompras são opcionais e limitadas, e ninguém é obrigado a recomprar. O criador não defende nenhum preço nem negocia para gerar volume. Ele não abrirá nenhum pool de liquidez nem listará TTTI em nenhuma outra plataforma de negociação. Qualquer mercado é criado pelos detentores.",
    disclosure2:
      "TTTI e THAT têm o mesmo criador. TTTI não tem nenhum vínculo com THAT: não pode ser trocado por THAT, nem usado dentro de THAT, nem convertido em qualquer outra coisa.",
  },
  ko: {
    label: "테스트 출시",
    intro:
      "이것은 테스트 출시입니다: 토큰 하나, TTTI-T, 총 10,000 USD, 1 USD부터. 향후 모든 TTTI와 같은 가격입니다: 할인 없음, 보너스 없음, 혜택 없음. 정식 출시가 이루어지면 TTTI-T는 1:1로 TTTI로 전환됩니다. 정식 출시는 끝내 이루어지지 않을 수도 있습니다.",
    errorText: "실시간 할당 수치를 일시적으로 사용할 수 없습니다.",
    retry: "다시 시도",
    statusComplete: "할당 완료",
    statusPaused: "구매 일시 중지",
    statusCurrent: "현재 할당",
    pricePerToken: "TTTI-T당 가격 (수수료 제외)",
    totalSupply: "총 공급량",
    remaining: "남은 수량",
    progressAria: (percent: string) => `총 공급량: 최대 공급량의 ${percent}%`,
    totalSupplyLine: (
      total: string,
      max: string,
      symbol: string,
      percent: string,
    ) => `총 공급량: ${total} / ${max} ${symbol} (${percent}%)`,
    disclosuresTitle: "창작자 고지",
    disclosure1:
      "민트할 때마다 지불한 ICP, ckBTC, ckUSDC 또는 ckUSDT의 100/101은 지불한 토큰으로, 해당 토큰에 설정된 소유자의 목적지 계정으로 갑니다. 1/101은 민트 수수료입니다. 창작자는 개인 자금으로 환매 자금을 댈 수 있습니다. 환매는 선택적이고 제한적이며, 누구도 환매할 의무가 없습니다. 창작자는 가격을 방어하지 않으며, 거래량을 만들기 위해 거래하지 않습니다. 창작자는 유동성 풀을 열지 않으며 다른 어떤 거래소에도 TTTI를 상장하지 않습니다. 모든 시장은 보유자가 만듭니다.",
    disclosure2:
      "TTTI와 THAT은 창작자가 같습니다. TTTI는 THAT과 아무 관련이 없습니다: THAT으로 교환할 수 없고, THAT 안에서 사용할 수 없으며, 다른 어떤 것으로도 전환할 수 없습니다.",
  },
  "pa-Guru": {
    label: "ਟੈਸਟ ਰਿਲੀਜ਼",
    intro:
      "ਇਹ ਇੱਕ ਟੈਸਟ ਰਿਲੀਜ਼ ਹੈ: ਇੱਕ ਟੋਕਨ, TTTI-T, ਕੁੱਲ 10,000 USD, 1 USD ਤੋਂ। ਕਿਸੇ ਵੀ ਭਵਿੱਖੀ TTTI ਜਿੰਨੀ ਹੀ ਕੀਮਤ: ਕੋਈ ਛੋਟ ਨਹੀਂ, ਕੋਈ ਬੋਨਸ ਨਹੀਂ, ਕੋਈ ਲਾਭ ਨਹੀਂ। ਜੇ ਕਦੇ ਪੂਰੀ ਰਿਲੀਜ਼ ਹੁੰਦੀ ਹੈ, ਤਾਂ TTTI-T 1:1 ਦੇ ਅਨੁਪਾਤ ਨਾਲ TTTI ਵਿੱਚ ਬਦਲ ਜਾਵੇਗਾ। ਹੋ ਸਕਦਾ ਹੈ ਕਿ ਪੂਰੀ ਰਿਲੀਜ਼ ਕਦੇ ਨਾ ਹੋਵੇ।",
    errorText: "ਲਾਈਵ ਵੰਡ ਦੇ ਅੰਕੜੇ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।",
    retry: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    statusComplete: "ਵੰਡ ਪੂਰੀ ਹੋਈ",
    statusPaused: "ਖਰੀਦਾਂ ਰੋਕੀਆਂ ਗਈਆਂ",
    statusCurrent: "ਮੌਜੂਦਾ ਵੰਡ",
    pricePerToken: "ਪ੍ਰਤੀ TTTI-T ਕੀਮਤ (ਫੀਸ ਤੋਂ ਪਹਿਲਾਂ)",
    totalSupply: "ਕੁੱਲ ਸਪਲਾਈ",
    remaining: "ਬਾਕੀ",
    progressAria: (percent: string) => `ਕੁੱਲ ਸਪਲਾਈ: ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਦਾ ${percent}%`,
    totalSupplyLine: (
      total: string,
      max: string,
      symbol: string,
      percent: string,
    ) => `ਕੁੱਲ ਸਪਲਾਈ: ${total} / ${max} ${symbol} (${percent}%)`,
    disclosuresTitle: "ਨਿਰਮਾਤਾ ਦੇ ਖੁਲਾਸੇ",
    disclosure1:
      "ਹਰ ਮਿੰਟ ਲਈ, ਅਦਾ ਕੀਤੇ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਦਾ 100/101 ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ, ਉਸ ਟੋਕਨ ਲਈ ਨਿਰਧਾਰਤ ਮਾਲਕ ਦੇ ਮੰਜ਼ਿਲ ਖਾਤੇ ਨੂੰ ਜਾਂਦਾ ਹੈ; 1/101 ਮਿੰਟ ਫੀਸ ਹੈ। ਨਿਰਮਾਤਾ ਨਿੱਜੀ ਫੰਡਾਂ ਨਾਲ ਵਾਪਸ ਖਰੀਦਾਂ ਲਈ ਫੰਡ ਦੇ ਸਕਦਾ ਹੈ। ਵਾਪਸ ਖਰੀਦਾਂ ਵਿਕਲਪਿਕ ਅਤੇ ਸੀਮਤ ਹਨ, ਅਤੇ ਕੋਈ ਵੀ ਵਾਪਸ ਖਰੀਦਣ ਲਈ ਮਜਬੂਰ ਨਹੀਂ ਹੈ। ਨਿਰਮਾਤਾ ਕਿਸੇ ਕੀਮਤ ਦਾ ਬਚਾਅ ਨਹੀਂ ਕਰਦਾ ਅਤੇ ਵਾਲੀਅਮ ਬਣਾਉਣ ਲਈ ਵਪਾਰ ਨਹੀਂ ਕਰਦਾ। ਉਹ ਕੋਈ ਲਿਕਵਿਡਿਟੀ ਪੂਲ ਨਹੀਂ ਖੋਲ੍ਹੇਗਾ ਅਤੇ TTTI ਨੂੰ ਕਿਸੇ ਹੋਰ ਐਕਸਚੇਂਜ 'ਤੇ ਸੂਚੀਬੱਧ ਨਹੀਂ ਕਰੇਗਾ। ਕੋਈ ਵੀ ਬਾਜ਼ਾਰ ਧਾਰਕਾਂ ਵੱਲੋਂ ਬਣਾਇਆ ਜਾਂਦਾ ਹੈ।",
    disclosure2:
      "TTTI ਅਤੇ THAT ਦਾ ਨਿਰਮਾਤਾ ਇੱਕੋ ਹੈ। TTTI ਦਾ THAT ਨਾਲ ਕੋਈ ਸਬੰਧ ਨਹੀਂ ਹੈ: ਇਸ ਨੂੰ THAT ਨਾਲ ਬਦਲਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ, THAT ਦੇ ਅੰਦਰ ਵਰਤਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ, ਜਾਂ ਕਿਸੇ ਹੋਰ ਚੀਜ਼ ਵਿੱਚ ਬਦਲਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।",
  },
});

export const HOW_TEXT = defineDict({
  en: {
    label: "Three steps",
    title: "How it works",
    walletTitle: "Pick a wallet",
    walletText: "Use the built-in wallet in one tap, or bring your own.",
    icpTitle: "Add a payment token",
    icpText:
      "Pay in ICP, ckBTC, ckUSDC or ckUSDT, or send BTC to your personal deposit address (converted to ckBTC). Buy ICP by card, or transfer what you already hold.",
    buyTitle: "Mint TTTI-T",
    buyText: "One button. Your tokens land in your wallet.",
  },
  fr: {
    label: "Trois étapes",
    title: "Comment ça marche",
    walletTitle: "Choisir un wallet",
    walletText: "Utilisez le wallet intégré en un clic, ou apportez le vôtre.",
    icpTitle: "Ajouter un jeton de paiement",
    icpText:
      "Payez en ICP, ckBTC, ckUSDC ou ckUSDT, ou envoyez du BTC à votre adresse de dépôt personnelle (converti en ckBTC). Achetez de l'ICP par carte, ou transférez ce que vous détenez déjà.",
    buyTitle: "Frapper du TTTI-T",
    buyText: "Un seul bouton. Vos jetons arrivent dans votre wallet.",
  },
  es: {
    label: "Tres pasos",
    title: "Cómo funciona",
    walletTitle: "Elegir un wallet",
    walletText: "Use el wallet integrado con un toque, o traiga el suyo.",
    icpTitle: "Añadir un token de pago",
    icpText:
      "Pague en ICP, ckBTC, ckUSDC o ckUSDT, o envíe BTC a su dirección de depósito personal (convertido en ckBTC). Compre ICP con tarjeta, o transfiera lo que ya tiene.",
    buyTitle: "Acuñar TTTI-T",
    buyText: "Un solo botón. Sus tokens llegan a su wallet.",
  },
  "zh-Hans": {
    label: "三个步骤",
    title: "如何运作",
    walletTitle: "选择钱包",
    walletText: "一键使用内置钱包，或使用您自己的钱包。",
    icpTitle: "添加支付代币",
    icpText:
      "以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付，或将 BTC 发送至您的个人存款地址（转换为 ckBTC）。用银行卡购买 ICP，或转入您已持有的代币。",
    buyTitle: "铸造 TTTI-T",
    buyText: "只需一个按钮。代币直接到达您的钱包。",
  },
  "pt-BR": {
    label: "Três passos",
    title: "Como funciona",
    walletTitle: "Escolha uma carteira",
    walletText: "Use a carteira integrada com um toque, ou traga a sua.",
    icpTitle: "Adicione um token de pagamento",
    icpText:
      "Pague em ICP, ckBTC, ckUSDC ou ckUSDT, ou envie BTC para o seu endereço de depósito pessoal (convertido em ckBTC). Compre ICP com cartão, ou transfira o que você já tem.",
    buyTitle: "Cunhe TTTI-T",
    buyText: "Um botão. Seus tokens chegam à sua carteira.",
  },
  ko: {
    label: "세 단계",
    title: "이용 방법",
    walletTitle: "지갑 선택",
    walletText:
      "한 번의 탭으로 내장 지갑을 사용하거나, 직접 가진 지갑을 사용하세요.",
    icpTitle: "결제 토큰 추가",
    icpText:
      "ICP, ckBTC, ckUSDC 또는 ckUSDT로 결제하거나, 개인 입금 주소로 BTC를 보내세요(ckBTC로 전환됨). 카드로 ICP를 구매하거나, 이미 보유한 토큰을 전송하세요.",
    buyTitle: "TTTI-T 발행",
    buyText: "버튼 하나면 됩니다. 토큰이 지갑으로 들어옵니다.",
  },
  "pa-Guru": {
    label: "ਤਿੰਨ ਕਦਮ",
    title: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    walletTitle: "ਇੱਕ ਵਾਲਿਟ ਚੁਣੋ",
    walletText: "ਇੱਕ ਟੈਪ ਨਾਲ ਬਿਲਟ-ਇਨ ਵਾਲਿਟ ਵਰਤੋ, ਜਾਂ ਆਪਣਾ ਲਿਆਓ।",
    icpTitle: "ਭੁਗਤਾਨ ਟੋਕਨ ਜੋੜੋ",
    icpText:
      "ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਭੁਗਤਾਨ ਕਰੋ, ਜਾਂ ਆਪਣੇ ਨਿੱਜੀ ਜਮ੍ਹਾਂ ਪਤੇ 'ਤੇ BTC ਭੇਜੋ (ckBTC ਵਿੱਚ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ)। ਕਾਰਡ ਨਾਲ ICP ਖਰੀਦੋ, ਜਾਂ ਜੋ ਤੁਹਾਡੇ ਕੋਲ ਪਹਿਲਾਂ ਹੈ ਉਹ ਟ੍ਰਾਂਸਫਰ ਕਰੋ।",
    buyTitle: "TTTI-T ਮਿੰਟ ਕਰੋ",
    buyText: "ਇੱਕ ਬਟਨ। ਤੁਹਾਡੇ ਟੋਕਨ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਪਹੁੰਚ ਜਾਂਦੇ ਹਨ।",
  },
});

export const FAQ_TEXT = defineDict({
  en: {
    label: "Questions",
    title: "Before you mint",
    intro: "Clear answers on the token, the wallets and how minting works.",
    whatQ: "What is TTTI-T?",
    whatA:
      "TTTI-T is the test release of TTTI, an exchange currency on the Internet Computer. The ledger uses 8 decimals, and this test release contains one token. The price is 10,000 USD per token plus a fee, paid in ICP, ckBTC, ckUSDC or ckUSDT.",
    noReturns: "There is no promise of returns of any kind.",
    icpQ: "How do I get ICP?",
    icpBefore: "TTTI-T is minted with ICP. If you do not hold any yet, visit ",
    icpLink: "Get ICP first",
    icpAfter:
      " for trusted ways to buy ICP and send it to your wallet, then come back to mint.",
    btcQ: "Can I pay in BTC?",
    rateQ: "How is the USD rate set?",
    walletsQ: "Which wallets are supported?",
    walletsA:
      "You can sign in with Internet Identity or with the Plug wallet. Both keep you in control: the app reads your balances and you sign every transfer yourself.",
    whereQ: "Where do my minted tokens appear?",
    whereBefore:
      "Your minted TTTI-T is delivered to the account you signed in with. It appears under TTTI-T on the ",
    whereLink: "Wallet page",
    whereAfter:
      ". If you prefer, you can add an optional delivery address (a Principal ID) before minting — it is never required.",
    supplyQ: "How many tokens can exist?",
    supplyIntro: "TTTI is the future version; TTTI-T is the live test.",
    privacyQ: "What is public, and what does the app keep?",
    privacyA:
      "Every purchase and transfer is recorded publicly and permanently on the ledger of the token used: ICP, ckBTC, ckUSDC, ckUSDT or TTTI-T. Anyone can see the amounts, the accounts and the times. Bitcoin transfers are public on the Bitcoin chain: anyone can see their transaction IDs (txids), addresses and amounts. Beyond that, the app keeps only your purchase records with their amounts and block numbers, your delivery address, the date you accepted the purchase terms and your BTC deposit trackings (deposit address, txids and the status of each deposit).",
  },
  fr: {
    label: "Questions",
    title: "Avant de frapper",
    intro:
      "Des réponses claires sur le jeton, les wallets et le déroulement de la frappe.",
    whatQ: "Qu'est-ce que TTTI-T ?",
    whatA:
      "TTTI-T est la version de test de TTTI, une monnaie d'échange sur l'Internet Computer. Le ledger utilise 8 décimales, et cette version de test contient un jeton. Le prix est de 10,000 USD par jeton plus des frais, payés en ICP, ckBTC, ckUSDC ou ckUSDT.",
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
    privacyQ: "Qu'est-ce qui est public, et que conserve l'app ?",
    privacyA:
      "Chaque achat et chaque transfert est enregistré publiquement et de façon permanente sur le ledger du jeton utilisé : ICP, ckBTC, ckUSDC, ckUSDT ou TTTI-T. Tout le monde peut voir les montants, les comptes et les horaires. Les transferts Bitcoin sont publics sur la chaîne Bitcoin : tout le monde peut voir leurs identifiants de transaction (txids), leurs adresses et leurs montants. Au-delà, l'app ne conserve que vos enregistrements d'achat avec leurs montants et leurs numéros de bloc, votre adresse de livraison, la date à laquelle vous avez accepté les conditions d'achat et vos suivis de dépôt BTC (adresse de dépôt, txids et statut de chaque dépôt).",
  },
  es: {
    label: "Preguntas",
    title: "Antes de acuñar",
    intro:
      "Respuestas claras sobre el token, los wallets y cómo funciona la acuñación.",
    whatQ: "¿Qué es TTTI-T?",
    whatA:
      "TTTI-T es la versión de prueba de TTTI, una moneda de intercambio en el Internet Computer. El ledger usa 8 decimales, y esta versión de prueba contiene un token. El precio es de 10,000 USD por token más una comisión, pagado en ICP, ckBTC, ckUSDC o ckUSDT.",
    noReturns: "No existe ninguna promesa de rendimiento de ningún tipo.",
    icpQ: "¿Cómo consigo ICP?",
    icpBefore: "TTTI-T se acuña con ICP. Si todavía no tiene, visite primero ",
    icpLink: "Conseguir ICP",
    icpAfter:
      " para conocer formas fiables de comprar ICP y enviarlo a su wallet; después vuelva para acuñar.",
    btcQ: "¿Puedo pagar en BTC?",
    rateQ: "¿Cómo se fija el tipo de cambio en USD?",
    walletsQ: "¿Qué wallets son compatibles?",
    walletsA:
      "Puede iniciar sesión con Internet Identity o con el wallet Plug. Ambos le dejan el control: la app lee sus saldos y usted mismo firma cada transferencia.",
    whereQ: "¿Dónde aparecen los tokens acuñados?",
    whereBefore:
      "El TTTI-T acuñado se entrega en la cuenta con la que inició sesión. Aparece en TTTI-T en la ",
    whereLink: "página Billetera",
    whereAfter:
      ". Si lo prefiere, puede añadir una dirección de entrega opcional (un Principal ID) antes de acuñar; nunca es obligatoria.",
    supplyQ: "¿Cuántos tokens pueden existir?",
    supplyIntro: "TTTI es la versión futura; TTTI-T es la prueba en curso.",
    privacyQ: "¿Qué es público y qué conserva la app?",
    privacyA:
      "Cada compra y cada transferencia se registra de forma pública y permanente en el ledger del token utilizado: ICP, ckBTC, ckUSDC, ckUSDT o TTTI-T. Cualquiera puede ver los importes, las cuentas y las horas. Las transferencias de Bitcoin son públicas en la cadena de Bitcoin: cualquiera puede ver sus identificadores de transacción (txids), sus direcciones y sus importes. Aparte de eso, la app solo conserva sus registros de compra con sus importes y números de bloque, su dirección de entrega, la fecha en que aceptó las condiciones de compra y sus seguimientos de depósitos BTC (dirección de depósito, txids y estado de cada depósito).",
  },
  "zh-Hans": {
    label: "常见问题",
    title: "铸造之前",
    intro: "关于代币、钱包以及铸造流程的清晰解答。",
    whatQ: "TTTI-T 是什么？",
    whatA:
      "TTTI-T 是 TTTI 的测试版，TTTI 是 Internet Computer 上的一种交换货币。账本使用 8 位小数，本测试版包含一枚代币。价格为每枚 10,000 USD 另加手续费，以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付。",
    noReturns: "不存在任何形式的收益承诺。",
    icpQ: "如何获得 ICP？",
    icpBefore: "TTTI-T 需用 ICP 铸造。如果您还没有 ICP，请先访问",
    icpLink: "获取 ICP",
    icpAfter: "，了解购买 ICP 并将其发送到您钱包的可靠方式，然后返回进行铸造。",
    btcQ: "可以用 BTC 支付吗？",
    rateQ: "美元汇率如何确定？",
    walletsQ: "支持哪些钱包？",
    walletsA:
      "您可以使用 Internet Identity 或 Plug 钱包登录。两者都让您保有控制权：应用读取您的余额，每笔转账都由您亲自签名。",
    whereQ: "铸造的代币显示在哪里？",
    whereBefore: "您铸造的 TTTI-T 会交付到您登录所用的账户，显示在",
    whereLink: "钱包页面",
    whereAfter:
      "的 TTTI-T 下。如果您愿意，可以在铸造前添加一个可选的交付地址（Principal ID），但这从来不是必需的。",
    supplyQ: "最多可以存在多少枚代币？",
    supplyIntro: "TTTI 是未来版本；TTTI-T 是正在进行的测试。",
    privacyQ: "哪些信息是公开的？应用会保留什么？",
    privacyA:
      "每一笔购买和转账都会公开、永久地记录在所用代币的账本上：ICP、ckBTC、ckUSDC、ckUSDT 或 TTTI-T。任何人都可以看到金额、账户和时间。Bitcoin 转账在 Bitcoin 链上公开：任何人都可以看到其交易 ID（txid）、地址和金额。除此之外，应用只保留您的购买记录（含金额和区块编号）、您的交付地址、您接受购买条款的日期以及您的 BTC 存款跟踪记录（存款地址、txid 及每笔存款的状态）。",
  },
  "pt-BR": {
    label: "Perguntas",
    title: "Antes de cunhar",
    intro:
      "Respostas claras sobre o token, as carteiras e como funciona a cunhagem.",
    whatQ: "O que é TTTI-T?",
    whatA:
      "TTTI-T é a versão de teste do TTTI, uma moeda de troca no Internet Computer. O ledger usa 8 casas decimais, e esta versão de teste contém um token. O preço é de 10.000 USD por token mais uma taxa, pago em ICP, ckBTC, ckUSDC ou ckUSDT.",
    noReturns: "Não há promessa de retorno de qualquer tipo.",
    icpQ: "Como consigo ICP?",
    icpBefore:
      "TTTI-T é cunhado com ICP. Se você ainda não tem, acesse primeiro ",
    icpLink: "Obter ICP",
    icpAfter:
      " para conhecer formas confiáveis de comprar ICP e enviá-lo à sua carteira; depois volte para cunhar.",
    btcQ: "Posso pagar em BTC?",
    rateQ: "Como a cotação em USD é definida?",
    walletsQ: "Quais carteiras são compatíveis?",
    walletsA:
      "Você pode entrar com Internet Identity ou com a carteira Plug. As duas mantêm o controle com você: o app lê seus saldos e você mesmo assina cada transferência.",
    whereQ: "Onde aparecem os tokens cunhados?",
    whereBefore:
      "O TTTI-T cunhado é entregue na conta com a qual você entrou. Ele aparece em TTTI-T na ",
    whereLink: "página Carteira",
    whereAfter:
      ". Se preferir, você pode adicionar um endereço de entrega opcional (um Principal ID) antes de cunhar — ele nunca é obrigatório.",
    supplyQ: "Quantos tokens podem existir?",
    supplyIntro: "TTTI é a versão futura; TTTI-T é o teste em andamento.",
    privacyQ: "O que é público e o que o app guarda?",
    privacyA:
      "Cada compra e cada transferência é registrada de forma pública e permanente no ledger do token utilizado: ICP, ckBTC, ckUSDC, ckUSDT ou TTTI-T. Qualquer pessoa pode ver os valores, as contas e os horários. As transferências de Bitcoin são públicas na blockchain do Bitcoin: qualquer pessoa pode ver seus identificadores de transação (txids), seus endereços e seus valores. Além disso, o app guarda apenas seus registros de compra com seus valores e números de bloco, seu endereço de entrega, a data em que você aceitou os termos de compra e seus acompanhamentos de depósitos BTC (endereço de depósito, txids e status de cada depósito).",
  },
  ko: {
    label: "질문",
    title: "발행하기 전에",
    intro: "토큰, 지갑, 발행 절차에 대한 명확한 답변입니다.",
    whatQ: "TTTI-T란 무엇인가요?",
    whatA:
      "TTTI-T는 Internet Computer 기반 교환 화폐인 TTTI의 테스트 출시 버전입니다. 원장은 소수점 8자리를 사용하며, 이 테스트 출시에는 토큰 하나가 포함됩니다. 가격은 토큰당 10,000 USD에 수수료가 더해지며, ICP, ckBTC, ckUSDC 또는 ckUSDT로 지불합니다.",
    noReturns: "어떠한 종류의 수익도 약속하지 않습니다.",
    icpQ: "ICP는 어떻게 구하나요?",
    icpBefore: "TTTI-T는 ICP로 발행합니다. 아직 ICP가 없다면 먼저 ",
    icpLink: "ICP 구하기",
    icpAfter:
      " 페이지에서 ICP를 구매해 지갑으로 보내는 믿을 수 있는 방법을 확인한 뒤, 돌아와서 발행하세요.",
    btcQ: "BTC로 결제할 수 있나요?",
    rateQ: "USD 환율은 어떻게 정해지나요?",
    walletsQ: "어떤 지갑을 지원하나요?",
    walletsA:
      "Internet Identity 또는 Plug 지갑으로 로그인할 수 있습니다. 두 방법 모두 통제권은 귀하에게 있습니다: 앱은 잔액을 읽기만 하고, 모든 전송은 귀하가 직접 서명합니다.",
    whereQ: "발행한 토큰은 어디에 표시되나요?",
    whereBefore: "발행한 TTTI-T는 로그인한 계정으로 지급됩니다. ",
    whereLink: "지갑 페이지",
    whereAfter:
      "의 TTTI-T 항목에 표시됩니다. 원하시면 발행 전에 선택 사항인 지급 주소(Principal ID)를 추가할 수 있습니다. 필수는 아닙니다.",
    supplyQ: "토큰은 최대 몇 개까지 존재할 수 있나요?",
    supplyIntro: "TTTI는 향후 버전이고, TTTI-T는 현재 진행 중인 테스트입니다.",
    privacyQ: "무엇이 공개되며, 앱은 무엇을 보관하나요?",
    privacyA:
      "모든 구매와 전송은 사용된 토큰의 원장(ICP, ckBTC, ckUSDC, ckUSDT 또는 TTTI-T)에 공개적이고 영구적으로 기록됩니다. 누구나 금액, 계정, 시간을 볼 수 있습니다. Bitcoin 전송은 Bitcoin 체인에 공개되며, 누구나 그 거래 ID(txid), 주소, 금액을 볼 수 있습니다. 그 밖에 앱이 보관하는 것은 금액과 블록 번호가 포함된 귀하의 구매 기록, 지급 주소, 구매 약관에 동의한 날짜, 그리고 BTC 입금 추적 기록(입금 주소, txid 및 각 입금의 상태)뿐입니다.",
  },
  "pa-Guru": {
    label: "ਸਵਾਲ",
    title: "ਮਿੰਟ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ",
    intro: "ਟੋਕਨ, ਵਾਲਿਟਾਂ ਅਤੇ ਮਿੰਟਿੰਗ ਕਿਵੇਂ ਹੁੰਦੀ ਹੈ, ਇਸ ਬਾਰੇ ਸਾਫ਼ ਜਵਾਬ।",
    whatQ: "TTTI-T ਕੀ ਹੈ?",
    whatA:
      "TTTI-T, TTTI ਦੀ ਟੈਸਟ ਰਿਲੀਜ਼ ਹੈ, ਜੋ Internet Computer 'ਤੇ ਇੱਕ ਲੈਣ-ਦੇਣ ਦੀ ਮੁਦਰਾ ਹੈ। ਲੈਜਰ 8 ਦਸ਼ਮਲਵ ਅੰਕ ਵਰਤਦਾ ਹੈ, ਅਤੇ ਇਸ ਟੈਸਟ ਰਿਲੀਜ਼ ਵਿੱਚ ਇੱਕ ਟੋਕਨ ਹੈ। ਕੀਮਤ ਪ੍ਰਤੀ ਟੋਕਨ 10,000 USD ਅਤੇ ਫੀਸ ਹੈ, ਜੋ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਅਦਾ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।",
    noReturns: "ਕਿਸੇ ਵੀ ਕਿਸਮ ਦੇ ਮੁਨਾਫ਼ੇ ਦਾ ਕੋਈ ਵਾਅਦਾ ਨਹੀਂ ਹੈ।",
    icpQ: "ਮੈਂ ICP ਕਿਵੇਂ ਪ੍ਰਾਪਤ ਕਰਾਂ?",
    icpBefore:
      "TTTI-T, ICP ਨਾਲ ਮਿੰਟ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਜੇ ਤੁਹਾਡੇ ਕੋਲ ਹਾਲੇ ICP ਨਹੀਂ ਹੈ, ਤਾਂ ਪਹਿਲਾਂ ",
    icpLink: "ICP ਪ੍ਰਾਪਤ ਕਰੋ",
    icpAfter:
      " 'ਤੇ ਜਾਓ, ਜਿੱਥੇ ICP ਖਰੀਦਣ ਅਤੇ ਇਸ ਨੂੰ ਆਪਣੇ ਵਾਲਿਟ ਵਿੱਚ ਭੇਜਣ ਦੇ ਭਰੋਸੇਯੋਗ ਤਰੀਕੇ ਹਨ, ਫਿਰ ਮਿੰਟ ਕਰਨ ਲਈ ਵਾਪਸ ਆਓ।",
    btcQ: "ਕੀ ਮੈਂ BTC ਵਿੱਚ ਭੁਗਤਾਨ ਕਰ ਸਕਦਾ ਹਾਂ?",
    rateQ: "USD ਦਰ ਕਿਵੇਂ ਤੈਅ ਹੁੰਦੀ ਹੈ?",
    walletsQ: "ਕਿਹੜੇ ਵਾਲਿਟ ਸਮਰਥਿਤ ਹਨ?",
    walletsA:
      "ਤੁਸੀਂ Internet Identity ਜਾਂ Plug ਵਾਲਿਟ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰ ਸਕਦੇ ਹੋ। ਦੋਵਾਂ ਵਿੱਚ ਕੰਟਰੋਲ ਤੁਹਾਡੇ ਕੋਲ ਰਹਿੰਦਾ ਹੈ: ਐਪ ਤੁਹਾਡੇ ਬਕਾਏ ਪੜ੍ਹਦੀ ਹੈ ਅਤੇ ਹਰ ਟ੍ਰਾਂਸਫਰ 'ਤੇ ਤੁਸੀਂ ਖੁਦ ਦਸਤਖਤ ਕਰਦੇ ਹੋ।",
    whereQ: "ਮੇਰੇ ਮਿੰਟ ਕੀਤੇ ਟੋਕਨ ਕਿੱਥੇ ਦਿਖਾਈ ਦਿੰਦੇ ਹਨ?",
    whereBefore:
      "ਤੁਹਾਡਾ ਮਿੰਟ ਕੀਤਾ TTTI-T ਉਸ ਖਾਤੇ ਵਿੱਚ ਡਿਲੀਵਰ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਜਿਸ ਨਾਲ ਤੁਸੀਂ ਸਾਈਨ ਇਨ ਕੀਤਾ ਸੀ। ਇਹ ",
    whereLink: "ਵਾਲਿਟ ਪੰਨੇ",
    whereAfter:
      " 'ਤੇ TTTI-T ਹੇਠ ਦਿਖਾਈ ਦਿੰਦਾ ਹੈ। ਜੇ ਤੁਸੀਂ ਚਾਹੋ, ਤਾਂ ਮਿੰਟ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਇੱਕ ਵਿਕਲਪਿਕ ਡਿਲੀਵਰੀ ਪਤਾ (Principal ID) ਜੋੜ ਸਕਦੇ ਹੋ — ਇਹ ਕਦੇ ਲਾਜ਼ਮੀ ਨਹੀਂ ਹੁੰਦਾ।",
    supplyQ: "ਕਿੰਨੇ ਟੋਕਨ ਮੌਜੂਦ ਹੋ ਸਕਦੇ ਹਨ?",
    supplyIntro: "TTTI ਭਵਿੱਖੀ ਸੰਸਕਰਣ ਹੈ; TTTI-T ਚੱਲ ਰਿਹਾ ਟੈਸਟ ਹੈ।",
    privacyQ: "ਕੀ ਜਨਤਕ ਹੈ, ਅਤੇ ਐਪ ਕੀ ਰੱਖਦੀ ਹੈ?",
    privacyA:
      "ਹਰ ਖਰੀਦ ਅਤੇ ਟ੍ਰਾਂਸਫਰ ਵਰਤੇ ਗਏ ਟੋਕਨ ਦੇ ਲੈਜਰ 'ਤੇ ਜਨਤਕ ਅਤੇ ਸਥਾਈ ਤੌਰ 'ਤੇ ਦਰਜ ਹੁੰਦਾ ਹੈ: ICP, ckBTC, ckUSDC, ckUSDT ਜਾਂ TTTI-T। ਕੋਈ ਵੀ ਰਕਮਾਂ, ਖਾਤੇ ਅਤੇ ਸਮੇਂ ਦੇਖ ਸਕਦਾ ਹੈ। Bitcoin ਟ੍ਰਾਂਸਫਰ Bitcoin ਚੇਨ 'ਤੇ ਜਨਤਕ ਹੁੰਦੇ ਹਨ: ਕੋਈ ਵੀ ਉਹਨਾਂ ਦੀਆਂ ਲੈਣ-ਦੇਣ ID (txid), ਪਤੇ ਅਤੇ ਰਕਮਾਂ ਦੇਖ ਸਕਦਾ ਹੈ। ਇਸ ਤੋਂ ਇਲਾਵਾ, ਐਪ ਸਿਰਫ਼ ਰਕਮਾਂ ਅਤੇ ਬਲਾਕ ਨੰਬਰਾਂ ਸਮੇਤ ਤੁਹਾਡੇ ਖਰੀਦ ਰਿਕਾਰਡ, ਤੁਹਾਡਾ ਡਿਲੀਵਰੀ ਪਤਾ, ਉਹ ਤਾਰੀਖ ਜਦੋਂ ਤੁਸੀਂ ਖਰੀਦ ਦੀਆਂ ਸ਼ਰਤਾਂ ਸਵੀਕਾਰ ਕੀਤੀਆਂ ਸਨ, ਅਤੇ ਤੁਹਾਡੇ BTC ਜਮ੍ਹਾਂ ਟ੍ਰੈਕਿੰਗ ਰਿਕਾਰਡ (ਜਮ੍ਹਾਂ ਪਤਾ, txid ਅਤੇ ਹਰ ਜਮ੍ਹਾਂ ਦੀ ਸਥਿਤੀ) ਰੱਖਦੀ ਹੈ।",
  },
});

export const CLOSING_TEXT = defineDict({
  en: {
    titleLead: "The formation ",
    titleAccent: "is ready.",
    readBefore: "Read the ",
    readLink: "whitepaper",
    readAfter:
      ". Tick the six boxes. Spend only what you can afford to lose entirely.",
  },
  fr: {
    titleLead: "La formation ",
    titleAccent: "est prête.",
    readBefore: "Lisez le ",
    readLink: "livre blanc",
    readAfter:
      ". Cochez les six cases. Ne dépensez que ce que vous pouvez vous permettre de perdre entièrement.",
  },
  es: {
    titleLead: "La formación ",
    titleAccent: "está lista.",
    readBefore: "Lea el ",
    readLink: "libro blanco",
    readAfter:
      ". Marque las seis casillas. Gaste solo lo que pueda permitirse perder por completo.",
  },
  "zh-Hans": {
    titleLead: "阵列",
    titleAccent: "已就绪。",
    readBefore: "阅读",
    readLink: "白皮书",
    readAfter: "。勾选六个复选框。只花费您能够承受全部损失的金额。",
  },
  "pt-BR": {
    titleLead: "A formação ",
    titleAccent: "está pronta.",
    readBefore: "Leia o ",
    readLink: "whitepaper",
    readAfter:
      ". Marque as seis caixas. Gaste apenas o que você pode se dar ao luxo de perder por completo.",
  },
  ko: {
    titleLead: "대열이 ",
    titleAccent: "갖춰졌습니다.",
    readBefore: "",
    readLink: "백서",
    readAfter:
      "를 읽으세요. 여섯 개의 확인란에 체크하세요. 전부 잃어도 감당할 수 있는 금액만 사용하세요.",
  },
  "pa-Guru": {
    titleLead: "ਕਤਾਰ ",
    titleAccent: "ਤਿਆਰ ਹੈ।",
    readBefore: "",
    readLink: "ਵ੍ਹਾਈਟਪੇਪਰ",
    readAfter:
      " ਪੜ੍ਹੋ। ਛੇ ਖਾਨਿਆਂ 'ਤੇ ਨਿਸ਼ਾਨ ਲਗਾਓ। ਸਿਰਫ਼ ਓਨਾ ਹੀ ਖਰਚ ਕਰੋ ਜਿੰਨਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਗੁਆਉਣਾ ਤੁਸੀਂ ਸਹਿ ਸਕਦੇ ਹੋ।",
  },
});

/** Technical details explorer labels (TokenInfo, TechnicalBackend). */
export const TECH_EXPLORER_TEXT = defineDict({
  en: {
    viewCanisterOnIcpDashboard: "View canister on the ICP Dashboard",
    viewTttiBlocksInHistory: "View TTTI-T blocks in History",
  },
  fr: {
    viewCanisterOnIcpDashboard: "Voir le canister sur l'ICP Dashboard",
    viewTttiBlocksInHistory: "Voir les blocs TTTI-T dans l'historique",
  },
  es: {
    viewCanisterOnIcpDashboard: "Ver el canister en el ICP Dashboard",
    viewTttiBlocksInHistory: "Ver los bloques de TTTI-T en el historial",
  },
  "zh-Hans": {
    viewCanisterOnIcpDashboard: "在 ICP Dashboard 上查看 canister",
    viewTttiBlocksInHistory: "在历史记录中查看 TTTI-T 区块",
  },
  "pt-BR": {
    viewCanisterOnIcpDashboard: "Ver o canister no ICP Dashboard",
    viewTttiBlocksInHistory: "Ver os blocos do TTTI-T no histórico",
  },
  ko: {
    viewCanisterOnIcpDashboard: "ICP Dashboard에서 canister 보기",
    viewTttiBlocksInHistory: "기록에서 TTTI-T 블록 보기",
  },
  "pa-Guru": {
    viewCanisterOnIcpDashboard: "ICP Dashboard 'ਤੇ canister ਵੇਖੋ",
    viewTttiBlocksInHistory: "ਇਤਿਹਾਸ ਵਿੱਚ TTTI-T ਬਲਾਕ ਵੇਖੋ",
  },
});
