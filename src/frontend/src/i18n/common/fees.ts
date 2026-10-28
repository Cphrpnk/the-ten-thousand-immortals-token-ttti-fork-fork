import { defineDict } from "../core/dict";

/**
 * Fee, price and BTC payment sentences. English is the single source used by
 * PRICE_TEXT / CYCLES_FEE_TEXT (lib/token.ts) and BTC_PAYMENT_TEXT /
 * BTC_WALLET_CONVERSION_TEXT (components/btcPaymentText.ts). Numbers, fees and
 * symbols have identical values in every language; embedded numbers use each
 * language's local notation (en 10,000 · fr 10 000 · es/pt-BR 10.000 ·
 * zh-Hans/ko/pa-Guru 10,000; decimals 1.01 or 1,01 accordingly).
 */
export const FEE_TEXT = defineDict({
  en: {
    price:
      "Price: 10,000 USD per TTTI-T plus a 1% fee, paid in ICP, ckBTC, ckUSDC or ckUSDT. Minimum purchase: 0.0001 TTTI-T, that is 1.01 USD fee included.",
    cyclesFee:
      "Mints in ICP, ckBTC, ckUSDC or ckUSDT carry a fixed 1% fee: 101 is paid for 100 received. 100/101 of the payment goes, in the paid token, to the owner's destination account set for that token; while no destination is set, it accumulates and is sent once one is set. A failed send is retried. 1/101 is split in two halves, in the paid token, for the TTTI-T pair of that token with the lowest liquidity: half goes to that pair's liquidity providers, or is set aside when it has none; half is added as permanent liquidity once worth 0.001 TTTI-T, with 50% swapped into TTTI-T at bounded slippage. No TTTI-T is created for pools. When the canister holds less than 20 T cycles, it converts ICP from the published CYCLES_RESERVE subaccount into cycles through the Cycles Minting Canister; the reserve is kept at 2 ICP and has no withdrawal path. Past purchases keep the fee recorded at the time.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Minimum deposit ${minDeposit}. ckBTC is created after ${confirmations} Bitcoin confirmations (about 1 hour). Fee 1%. Refunds are made in ckBTC.`,
    btcPayment:
      "Paying in BTC goes through ckBTC. The app shows a personal Bitcoin deposit address that stays the same for this flow and is reused for every transfer. Each transfer is recorded by its transaction ID (txid) and tracked; the progress is kept when you leave the page. After the Bitcoin confirmations required by the ckBTC minter (about 6), the minter creates the equivalent ckBTC, which buys TTTI-T at the hourly rate with the 1% fee. Several transfers sent back-to-back are each converted as their confirmations arrive, oldest first. 100/101 of the ckBTC goes to the owner's destination account for ckBTC; 1/101 is the mint fee. Refunds are made in ckBTC.",
    btcWalletConversion:
      "The wallet can also convert BTC to ckBTC alone, through a separate personal deposit address that also stays the same and is tracked in the same way; the ckBTC stays in your wallet. The app takes no fee on this conversion; the ckBTC minter's own fees apply.",
  },
  fr: {
    price:
      "Prix : 10\u202f000 USD par TTTI-T plus des frais de 1%, payés en ICP, ckBTC, ckUSDC ou ckUSDT. Achat minimum : 0,0001 TTTI-T, soit 1,01 USD frais compris.",
    cyclesFee:
      "Les mints en ICP, ckBTC, ckUSDC ou ckUSDT comportent des frais fixes de 1% : 101 sont payés pour 100 reçus. 100/101 du paiement vont, dans le jeton payé, au compte de destination du propriétaire fixé pour ce jeton ; tant qu'aucune destination n'est fixée, ils s'accumulent et sont envoyés dès qu'une destination est fixée. Un envoi échoué est relancé. 1/101 est réparti en deux moitiés, dans le jeton payé, pour la paire TTTI-T de ce jeton dont la liquidité est la plus faible : une moitié va aux fournisseurs de liquidité de cette paire, ou est mise de côté quand elle n'en a aucun ; l'autre moitié est ajoutée en liquidité permanente dès qu'elle vaut 0,001 TTTI-T, dont 50% échangés en TTTI-T avec un slippage borné. Aucun TTTI-T n'est créé pour les pools. Quand le canister détient moins de 20 T cycles, il convertit de l'ICP du sous-compte publié CYCLES_RESERVE en cycles via le Cycles Minting Canister ; la réserve est maintenue à 2 ICP et n'a aucune possibilité de retrait. Les achats passés conservent les frais enregistrés à leur date.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Dépôt minimum ${minDeposit}. Le ckBTC est créé après ${confirmations} confirmations Bitcoin (environ 1 heure). Frais 1%. Les remboursements sont effectués en ckBTC.`,
    btcPayment:
      "Le paiement en BTC passe par le ckBTC. L'app affiche une adresse de dépôt Bitcoin personnelle, qui reste la même pour ce parcours et sert à chaque transfert. Chaque transfert est enregistré par son identifiant de transaction (txid) et suivi ; la progression est conservée lorsque vous quittez la page. Après les confirmations Bitcoin exigées par le minter ckBTC (environ 6), le minter crée l'équivalent en ckBTC, qui achète du TTTI-T au taux horaire avec les frais de 1%. Plusieurs transferts envoyés coup sur coup sont chacun convertis à mesure que leurs confirmations arrivent, du plus ancien au plus récent. 100/101 du ckBTC vont au compte de destination du propriétaire pour le ckBTC ; 1/101 constitue les frais de mint. Les remboursements sont effectués en ckBTC.",
    btcWalletConversion:
      "Le wallet peut aussi convertir uniquement du BTC en ckBTC, via une adresse de dépôt personnelle distincte qui reste elle aussi la même et est suivie de la même façon ; le ckBTC reste dans votre wallet. L'app ne prélève aucun frais sur cette conversion ; les frais propres du minter ckBTC s'appliquent.",
  },
  es: {
    price:
      "Precio: 10.000 USD por TTTI-T más una comisión del 1%, pagado en ICP, ckBTC, ckUSDC o ckUSDT. Compra mínima: 0,0001 TTTI-T, es decir, 1,01 USD con la comisión incluida.",
    cyclesFee:
      "Los mints en ICP, ckBTC, ckUSDC o ckUSDT conllevan una comisión fija del 1%: se pagan 101 por 100 recibidos. 100/101 del pago van, en el token pagado, a la cuenta de destino del propietario fijada para ese token; mientras no haya destino fijado, se acumulan y se envían en cuanto se fija uno. Un envío fallido se reintenta. 1/101 se divide en dos mitades, en el token pagado, para el par TTTI-T de ese token con la menor liquidez: una mitad va a los proveedores de liquidez de ese par, o se aparta cuando no tiene ninguno; la otra mitad se añade como liquidez permanente cuando vale 0,001 TTTI-T, con el 50% intercambiado por TTTI-T con un slippage acotado. No se crea ningún TTTI-T para los pools. Cuando el canister tiene menos de 20 T cycles, convierte ICP de la subcuenta publicada CYCLES_RESERVE en cycles a través del Cycles Minting Canister; la reserva se mantiene en 2 ICP y no tiene ninguna vía de retiro. Las compras pasadas conservan la comisión registrada en su momento.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Depósito mínimo ${minDeposit}. El ckBTC se crea tras ${confirmations} confirmaciones de Bitcoin (aproximadamente 1 hora). Comisión 1%. Los reembolsos se realizan en ckBTC.`,
    btcPayment:
      "El pago en BTC pasa por ckBTC. La app muestra una dirección de depósito de Bitcoin personal, que se mantiene igual para este recorrido y se reutiliza en cada transferencia. Cada transferencia se registra por su identificador de transacción (txid) y se sigue; el progreso se conserva al salir de la página. Tras las confirmaciones de Bitcoin exigidas por el minter de ckBTC (aproximadamente 6), el minter crea el ckBTC equivalente, que compra TTTI-T al tipo horario con la comisión del 1%. Varias transferencias enviadas una tras otra se convierten cada una a medida que llegan sus confirmaciones, de la más antigua a la más reciente. 100/101 del ckBTC van a la cuenta de destino del propietario para ckBTC; 1/101 es la comisión de mint. Los reembolsos se realizan en ckBTC.",
    btcWalletConversion:
      "El wallet también puede convertir solo BTC en ckBTC, mediante una dirección de depósito personal distinta que también se mantiene igual y se sigue del mismo modo; el ckBTC permanece en su wallet. La app no cobra ninguna comisión por esta conversión; se aplican las comisiones propias del minter de ckBTC.",
  },
  "zh-Hans": {
    price:
      "价格：每个 TTTI-T 10,000 USD，另加 1% 费用，以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付。最低购买量：0.0001 TTTI-T，即含费用 1.01 USD。",
    cyclesFee:
      "以 ICP、ckBTC、ckUSDC 或 ckUSDT 铸造均收取固定 1% 的费用：支付 101，获得 100。付款的 100/101 以所支付的代币转入为该代币设置的所有者目标账户；尚未设置目标账户时，该金额会累积，并在设置后发送。发送失败时会重试。1/101 以所支付的代币分为两半，用于该代币流动性最低的 TTTI-T 交易对：一半归该交易对的流动性提供者，如没有流动性提供者则留存；另一半在价值达到 0.001 TTTI-T 后作为永久流动性加入，其中 50% 以有界滑点兑换为 TTTI-T。不会为资金池创建任何 TTTI-T。当 canister 持有的 cycles 少于 20 T 时，它会通过 Cycles Minting Canister 将公开的 CYCLES_RESERVE 子账户中的 ICP 转换为 cycles；储备保持在 2 ICP，且没有任何提取途径。过往购买保留当时记录的费用。",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `最低存款 ${minDeposit}。ckBTC 在 ${confirmations} 次 Bitcoin 确认后创建（约 1 小时）。费用 1%。退款以 ckBTC 进行。`,
    btcPayment:
      "以 BTC 支付需经由 ckBTC。应用会显示一个个人 Bitcoin 存款地址，该地址在此流程中保持不变，并用于每一笔转账。每笔转账按其交易 ID（txid）记录并跟踪；离开页面后进度仍会保留。在达到 ckBTC minter 要求的 Bitcoin 确认数（约 6 次）后，minter 创建等额的 ckBTC，并以每小时汇率扣除 1% 费用后购买 TTTI-T。连续发送的多笔转账会在各自的确认到达后分别兑换，按从早到晚的顺序进行。ckBTC 的 100/101 转入所有者的 ckBTC 目标账户；1/101 为铸造费用。退款以 ckBTC 进行。",
    btcWalletConversion:
      "钱包也可以通过另一个同样保持不变、并以相同方式跟踪的个人存款地址，仅将 BTC 转换为 ckBTC；ckBTC 保留在您的钱包中。应用对此转换不收取任何费用；ckBTC minter 自身的费用适用。",
  },
  "pt-BR": {
    price:
      "Preço: 10.000 USD por TTTI-T mais uma taxa de 1%, pago em ICP, ckBTC, ckUSDC ou ckUSDT. Compra mínima: 0,0001 TTTI-T, ou seja, 1,01 USD com a taxa incluída.",
    cyclesFee:
      "Os mints em ICP, ckBTC, ckUSDC ou ckUSDT têm uma taxa fixa de 1%: 101 são pagos por 100 recebidos. 100/101 do pagamento vão, no token pago, para a conta de destino do proprietário definida para esse token; enquanto nenhum destino estiver definido, eles se acumulam e são enviados assim que um for definido. Um envio que falha é tentado novamente. 1/101 é dividido em duas metades, no token pago, para o par TTTI-T desse token com a menor liquidez: uma metade vai para os provedores de liquidez desse par, ou é reservada quando ele não tem nenhum; a outra metade é adicionada como liquidez permanente quando vale 0,001 TTTI-T, com 50% trocados por TTTI-T com slippage limitado. Nenhum TTTI-T é criado para os pools. Quando o canister tem menos de 20 T cycles, ele converte ICP da subconta publicada CYCLES_RESERVE em cycles por meio do Cycles Minting Canister; a reserva é mantida em 2 ICP e não tem nenhuma via de saque. Compras anteriores mantêm a taxa registrada na época.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Depósito mínimo ${minDeposit}. O ckBTC é criado após ${confirmations} confirmações de Bitcoin (cerca de 1 hora). Taxa de 1%. Os reembolsos são feitos em ckBTC.`,
    btcPayment:
      "O pagamento em BTC passa pelo ckBTC. O app mostra um endereço de depósito de Bitcoin pessoal, que permanece o mesmo para este fluxo e é reutilizado em cada transferência. Cada transferência é registrada pelo seu identificador de transação (txid) e acompanhada; o progresso é mantido quando você sai da página. Após as confirmações de Bitcoin exigidas pelo minter de ckBTC (cerca de 6), o minter cria o ckBTC equivalente, que compra TTTI-T à taxa horária com a taxa de 1%. Várias transferências enviadas em sequência são convertidas, cada uma, à medida que suas confirmações chegam, da mais antiga para a mais recente. 100/101 do ckBTC vão para a conta de destino do proprietário para ckBTC; 1/101 é a taxa de mint. Os reembolsos são feitos em ckBTC.",
    btcWalletConversion:
      "O wallet também pode converter apenas BTC em ckBTC, por meio de um endereço de depósito pessoal separado, que também permanece o mesmo e é acompanhado da mesma forma; o ckBTC permanece no seu wallet. O app não cobra taxa nessa conversão; aplicam-se as taxas próprias do minter de ckBTC.",
  },
  ko: {
    price:
      "가격: TTTI-T당 10,000 USD에 1% 수수료가 추가되며, ICP, ckBTC, ckUSDC 또는 ckUSDT로 지불합니다. 최소 구매량: 0.0001 TTTI-T, 즉 수수료 포함 1.01 USD.",
    cyclesFee:
      "ICP, ckBTC, ckUSDC 또는 ckUSDT로 민트할 때 1%의 고정 수수료가 부과됩니다. 101을 지불하고 100을 받습니다. 결제 금액의 100/101은 지불한 토큰으로, 해당 토큰에 설정된 소유자의 목적지 계정으로 갑니다. 목적지가 설정되지 않은 동안에는 누적되며, 목적지가 설정되면 전송됩니다. 실패한 전송은 재시도됩니다. 1/101은 지불한 토큰으로 두 절반으로 나뉘어, 해당 토큰의 유동성이 가장 낮은 TTTI-T 페어에 쓰입니다. 절반은 해당 페어의 유동성 공급자에게 가며, 공급자가 없으면 따로 보관됩니다. 나머지 절반은 0.001 TTTI-T의 가치에 도달하면 영구 유동성으로 추가되며, 그중 50%는 제한된 슬리피지로 TTTI-T로 교환됩니다. 풀을 위해 TTTI-T가 생성되지 않습니다. canister가 보유한 cycles가 20 T 미만이면 canister는 Cycles Minting Canister를 통해 공개된 CYCLES_RESERVE 하위 계정의 ICP를 cycles로 전환합니다. 준비금은 2 ICP로 유지되며 인출 경로가 없습니다. 과거 구매에는 당시 기록된 수수료가 유지됩니다.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `최소 입금액 ${minDeposit}. ckBTC는 Bitcoin 확인 ${confirmations}회 후 생성됩니다(약 1시간). 수수료 1%. 환불은 ckBTC로 이루어집니다.`,
    btcPayment:
      "BTC 결제는 ckBTC를 거칩니다. 앱에 개인 Bitcoin 입금 주소가 표시되며, 이 주소는 이 흐름에서 동일하게 유지되고 모든 전송에 다시 사용됩니다. 각 전송은 거래 ID(txid)로 기록되고 추적되며, 페이지를 떠나도 진행 상황이 유지됩니다. ckBTC minter가 요구하는 Bitcoin 확인(약 6회) 후 minter가 동일한 양의 ckBTC를 생성하며, 이 ckBTC로 1% 수수료와 함께 시간별 환율에 따라 TTTI-T를 구매합니다. 연이어 보낸 여러 전송은 각각 확인이 도착하는 대로 오래된 것부터 전환됩니다. ckBTC의 100/101은 소유자의 ckBTC 목적지 계정으로 가며, 1/101은 민트 수수료입니다. 환불은 ckBTC로 이루어집니다.",
    btcWalletConversion:
      "지갑에서는 마찬가지로 동일하게 유지되고 같은 방식으로 추적되는 별도의 개인 입금 주소를 통해 BTC를 ckBTC로만 전환할 수도 있으며, ckBTC는 지갑에 남습니다. 앱은 이 전환에 수수료를 부과하지 않으며, ckBTC minter 자체 수수료가 적용됩니다.",
  },
  "pa-Guru": {
    price:
      "ਕੀਮਤ: ਪ੍ਰਤੀ TTTI-T 10,000 USD ਅਤੇ ਨਾਲ 1% ਫੀਸ, ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਭੁਗਤਾਨ। ਘੱਟੋ-ਘੱਟ ਖਰੀਦ: 0.0001 TTTI-T, ਯਾਨੀ ਫੀਸ ਸਮੇਤ 1.01 USD।",
    cyclesFee:
      "ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਮਿੰਟਾਂ 'ਤੇ 1% ਦੀ ਨਿਸ਼ਚਿਤ ਫੀਸ ਲੱਗਦੀ ਹੈ: 100 ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ 101 ਦਾ ਭੁਗਤਾਨ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਭੁਗਤਾਨ ਦਾ 100/101 ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ, ਉਸ ਟੋਕਨ ਲਈ ਨਿਰਧਾਰਤ ਮਾਲਕ ਦੇ ਮੰਜ਼ਿਲ ਖਾਤੇ ਨੂੰ ਜਾਂਦਾ ਹੈ; ਜਦੋਂ ਤੱਕ ਕੋਈ ਮੰਜ਼ਿਲ ਨਿਰਧਾਰਤ ਨਹੀਂ ਹੁੰਦੀ, ਇਹ ਇਕੱਠਾ ਹੁੰਦਾ ਹੈ ਅਤੇ ਮੰਜ਼ਿਲ ਨਿਰਧਾਰਤ ਹੁੰਦੇ ਹੀ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ। ਅਸਫਲ ਭੇਜਣ ਦੀ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। 1/101 ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਦੋ ਅੱਧਿਆਂ ਵਿੱਚ ਵੰਡਿਆ ਜਾਂਦਾ ਹੈ, ਉਸ ਟੋਕਨ ਦੇ ਸਭ ਤੋਂ ਘੱਟ ਲਿਕਵਿਡਿਟੀ ਵਾਲੇ TTTI-T ਜੋੜੇ ਲਈ: ਅੱਧਾ ਉਸ ਜੋੜੇ ਦੇ ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਦਾਤਾਵਾਂ ਨੂੰ ਜਾਂਦਾ ਹੈ, ਜਾਂ ਕੋਈ ਪ੍ਰਦਾਤਾ ਨਾ ਹੋਣ 'ਤੇ ਵੱਖ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ; ਬਾਕੀ ਅੱਧਾ 0.001 TTTI-T ਦੇ ਮੁੱਲ ਤੱਕ ਪਹੁੰਚਣ 'ਤੇ ਸਥਾਈ ਲਿਕਵਿਡਿਟੀ ਵਜੋਂ ਜੋੜਿਆ ਜਾਂਦਾ ਹੈ, ਜਿਸ ਵਿੱਚੋਂ 50% ਸੀਮਤ ਸਲਿੱਪੇਜ ਨਾਲ TTTI-T ਵਿੱਚ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ। ਪੂਲਾਂ ਲਈ ਕੋਈ TTTI-T ਨਹੀਂ ਬਣਾਇਆ ਜਾਂਦਾ। ਜਦੋਂ canister ਕੋਲ 20 T cycles ਤੋਂ ਘੱਟ ਹੁੰਦੇ ਹਨ, ਇਹ Cycles Minting Canister ਰਾਹੀਂ ਪ੍ਰਕਾਸ਼ਿਤ CYCLES_RESERVE ਸਬ-ਖਾਤੇ ਦੇ ICP ਨੂੰ cycles ਵਿੱਚ ਬਦਲਦਾ ਹੈ; ਰਿਜ਼ਰਵ 2 ICP 'ਤੇ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਇਸਨੂੰ ਕਢਵਾਉਣ ਦਾ ਕੋਈ ਰਸਤਾ ਨਹੀਂ ਹੈ। ਪਿਛਲੀਆਂ ਖਰੀਦਾਂ ਉਸ ਸਮੇਂ ਦਰਜ ਕੀਤੀ ਫੀਸ ਨੂੰ ਬਰਕਰਾਰ ਰੱਖਦੀਆਂ ਹਨ।",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `ਘੱਟੋ-ਘੱਟ ਜਮ੍ਹਾਂ ${minDeposit}। ckBTC, ${confirmations} Bitcoin ਪੁਸ਼ਟੀਆਂ ਤੋਂ ਬਾਅਦ ਬਣਦਾ ਹੈ (ਲਗਭਗ 1 ਘੰਟਾ)। ਫੀਸ 1%। ਰਿਫੰਡ ckBTC ਵਿੱਚ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।`,
    btcPayment:
      "BTC ਵਿੱਚ ਭੁਗਤਾਨ ckBTC ਰਾਹੀਂ ਹੁੰਦਾ ਹੈ। ਐਪ ਇੱਕ ਨਿੱਜੀ Bitcoin ਜਮ੍ਹਾਂ ਪਤਾ ਦਿਖਾਉਂਦੀ ਹੈ, ਜੋ ਇਸ ਪ੍ਰਕਿਰਿਆ ਲਈ ਇੱਕੋ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਹਰ ਟ੍ਰਾਂਸਫਰ ਲਈ ਦੁਬਾਰਾ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ। ਹਰ ਟ੍ਰਾਂਸਫਰ ਉਸਦੀ ਲੈਣ-ਦੇਣ ID (txid) ਨਾਲ ਦਰਜ ਅਤੇ ਟ੍ਰੈਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ; ਪੰਨਾ ਛੱਡਣ 'ਤੇ ਵੀ ਪ੍ਰਗਤੀ ਬਰਕਰਾਰ ਰਹਿੰਦੀ ਹੈ। ckBTC minter ਦੁਆਰਾ ਲੋੜੀਂਦੀਆਂ Bitcoin ਪੁਸ਼ਟੀਆਂ (ਲਗਭਗ 6) ਤੋਂ ਬਾਅਦ, minter ਬਰਾਬਰ ckBTC ਬਣਾਉਂਦਾ ਹੈ, ਜੋ 1% ਫੀਸ ਨਾਲ ਘੰਟੇਵਾਰ ਦਰ 'ਤੇ TTTI-T ਖਰੀਦਦਾ ਹੈ। ਲਗਾਤਾਰ ਭੇਜੇ ਗਏ ਕਈ ਟ੍ਰਾਂਸਫਰ ਹਰ ਇੱਕ ਆਪਣੀਆਂ ਪੁਸ਼ਟੀਆਂ ਆਉਣ 'ਤੇ, ਸਭ ਤੋਂ ਪੁਰਾਣੇ ਤੋਂ ਸ਼ੁਰੂ ਕਰਕੇ, ਬਦਲੇ ਜਾਂਦੇ ਹਨ। ckBTC ਦਾ 100/101 ਮਾਲਕ ਦੇ ckBTC ਮੰਜ਼ਿਲ ਖਾਤੇ ਨੂੰ ਜਾਂਦਾ ਹੈ; 1/101 ਮਿੰਟ ਫੀਸ ਹੈ। ਰਿਫੰਡ ckBTC ਵਿੱਚ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।",
    btcWalletConversion:
      "ਵਾਲਿਟ ਇੱਕ ਵੱਖਰੇ ਨਿੱਜੀ ਜਮ੍ਹਾਂ ਪਤੇ ਰਾਹੀਂ, ਜੋ ਵੀ ਇੱਕੋ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਇਸੇ ਤਰ੍ਹਾਂ ਟ੍ਰੈਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਸਿਰਫ਼ BTC ਨੂੰ ckBTC ਵਿੱਚ ਵੀ ਬਦਲ ਸਕਦਾ ਹੈ; ckBTC ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ। ਐਪ ਇਸ ਪਰਿਵਰਤਨ 'ਤੇ ਕੋਈ ਫੀਸ ਨਹੀਂ ਲੈਂਦੀ; ckBTC minter ਦੀਆਂ ਆਪਣੀਆਂ ਫੀਸਾਂ ਲਾਗੂ ਹੁੰਦੀਆਂ ਹਨ।",
  },
});
