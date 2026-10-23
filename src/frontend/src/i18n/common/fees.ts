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
      "Purchases in ICP, ckBTC, ckUSDC or ckUSDT carry a fixed 1% fee. For each delivered ICP purchase, the fee share floor(cost × 100 / 10,100) stays in the published CYCLES_RESERVE subaccount and pays for the canister's cycles; the treasury receives the rest of the cost minus the ICP ledger fee. ckBTC, ckUSDC and ckUSDT payments are forwarded whole, fee included, to that token's own treasury account; these fees do not become cycles. A failed forward is retried. Every 6 hours, when the canister holds less than 3 T cycles, it converts reserve ICP into cycles through the Cycles Minting Canister; this top-up may use reserve funds below the 2 ICP floor. Only an administrator can transfer reserve ICP above the floor, only to the treasury and at most the reserve minus the floor minus the ICP ledger fee; this transfer is blocked while the canister holds less than 3 T cycles or a top-up is running or awaiting confirmation. Past conversions keep the fee recorded at the time.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Minimum deposit ${minDeposit}. ckBTC is created after ${confirmations} Bitcoin confirmations (about 1 hour). Fee 1%. Refunds are made in ckBTC.`,
    btcPayment:
      "Paying in BTC goes through ckBTC. The app shows a personal Bitcoin deposit address that stays the same for this flow and is reused for every transfer. Each transfer is recorded by its transaction ID (txid) and tracked; the progress is kept when you leave the page. After the Bitcoin confirmations required by the ckBTC minter (about 6), the minter creates the equivalent ckBTC, which buys TTTI-T at the hourly rate with the 1% fee. Several transfers sent back-to-back are each converted as their confirmations arrive, oldest first. The ckBTC is sent to the ckBTC treasury. Refunds are made in ckBTC.",
    btcWalletConversion:
      "The wallet can also convert BTC to ckBTC alone, through a separate personal deposit address that also stays the same and is tracked in the same way; the ckBTC stays in your wallet. The app takes no fee on this conversion; the ckBTC minter's own fees apply.",
  },
  fr: {
    price:
      "Prix : 10\u202f000 USD par TTTI-T plus des frais de 1%, payés en ICP, ckBTC, ckUSDC ou ckUSDT. Achat minimum : 0,0001 TTTI-T, soit 1,01 USD frais compris.",
    cyclesFee:
      "Les achats en ICP, ckBTC, ckUSDC ou ckUSDT comportent des frais fixes de 1%. Pour chaque achat en ICP livré, la part des frais floor(cost × 100 / 10\u202f100) reste sur le sous-compte publié CYCLES_RESERVE et paie les cycles du canister ; la trésorerie reçoit le reste du coût moins les frais du ledger ICP. Les paiements en ckBTC, ckUSDC et ckUSDT sont transférés en totalité, frais compris, au compte de trésorerie propre au jeton concerné ; ces frais ne sont pas convertis en cycles. Un transfert échoué est relancé. Toutes les 6 heures, lorsque le canister détient moins de 3 T cycles, il convertit de l'ICP de la réserve en cycles via le Cycles Minting Canister ; cette recharge peut utiliser des fonds de la réserve en dessous du plancher de 2 ICP. Seul un administrateur peut transférer l'ICP de la réserve au-delà du plancher, uniquement vers la trésorerie et au plus la réserve moins le plancher moins les frais du ledger ICP ; ce transfert est bloqué tant que le canister détient moins de 3 T cycles ou qu'une recharge est en cours ou en attente de confirmation. Les conversions passées conservent les frais enregistrés au moment de leur exécution.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Dépôt minimum ${minDeposit}. Le ckBTC est créé après ${confirmations} confirmations Bitcoin (environ 1 heure). Frais 1%. Les remboursements sont effectués en ckBTC.`,
    btcPayment:
      "Le paiement en BTC passe par le ckBTC. L'app affiche une adresse de dépôt Bitcoin personnelle, qui reste la même pour ce parcours et sert à chaque transfert. Chaque transfert est enregistré par son identifiant de transaction (txid) et suivi ; la progression est conservée lorsque vous quittez la page. Après les confirmations Bitcoin exigées par le minter ckBTC (environ 6), le minter crée l'équivalent en ckBTC, qui achète du TTTI-T au taux horaire avec les frais de 1%. Plusieurs transferts envoyés coup sur coup sont chacun convertis à mesure que leurs confirmations arrivent, du plus ancien au plus récent. Le ckBTC est envoyé à la trésorerie ckBTC. Les remboursements sont effectués en ckBTC.",
    btcWalletConversion:
      "Le wallet peut aussi convertir uniquement du BTC en ckBTC, via une adresse de dépôt personnelle distincte qui reste elle aussi la même et est suivie de la même façon ; le ckBTC reste dans votre wallet. L'app ne prélève aucun frais sur cette conversion ; les frais propres du minter ckBTC s'appliquent.",
  },
  es: {
    price:
      "Precio: 10.000 USD por TTTI-T más una comisión del 1%, pagado en ICP, ckBTC, ckUSDC o ckUSDT. Compra mínima: 0,0001 TTTI-T, es decir, 1,01 USD con la comisión incluida.",
    cyclesFee:
      "Las compras en ICP, ckBTC, ckUSDC o ckUSDT conllevan una comisión fija del 1%. Por cada compra en ICP entregada, la parte de la comisión floor(cost × 100 / 10.100) permanece en la subcuenta publicada CYCLES_RESERVE y paga los cycles del canister; la tesorería recibe el resto del coste menos la comisión del ledger de ICP. Los pagos en ckBTC, ckUSDC y ckUSDT se transfieren íntegros, comisión incluida, a la cuenta de tesorería propia de ese token; estas comisiones no se convierten en cycles. Una transferencia fallida se reintenta. Cada 6 horas, cuando el canister tiene menos de 3 T cycles, convierte ICP de la reserva en cycles a través del Cycles Minting Canister; esta recarga puede usar fondos de la reserva por debajo del mínimo de 2 ICP. Solo un administrador puede transferir el ICP de la reserva por encima del mínimo, únicamente a la tesorería y como máximo la reserva menos el mínimo menos la comisión del ledger de ICP; esta transferencia está bloqueada mientras el canister tenga menos de 3 T cycles o haya una recarga en curso o pendiente de confirmación. Las conversiones pasadas conservan la comisión registrada en su momento.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Depósito mínimo ${minDeposit}. El ckBTC se crea tras ${confirmations} confirmaciones de Bitcoin (aproximadamente 1 hora). Comisión 1%. Los reembolsos se realizan en ckBTC.`,
    btcPayment:
      "El pago en BTC pasa por ckBTC. La app muestra una dirección de depósito de Bitcoin personal, que se mantiene igual para este recorrido y se reutiliza en cada transferencia. Cada transferencia se registra por su identificador de transacción (txid) y se sigue; el progreso se conserva al salir de la página. Tras las confirmaciones de Bitcoin exigidas por el minter de ckBTC (aproximadamente 6), el minter crea el ckBTC equivalente, que compra TTTI-T al tipo horario con la comisión del 1%. Varias transferencias enviadas una tras otra se convierten cada una a medida que llegan sus confirmaciones, de la más antigua a la más reciente. El ckBTC se envía a la tesorería de ckBTC. Los reembolsos se realizan en ckBTC.",
    btcWalletConversion:
      "El wallet también puede convertir solo BTC en ckBTC, mediante una dirección de depósito personal distinta que también se mantiene igual y se sigue del mismo modo; el ckBTC permanece en su wallet. La app no cobra ninguna comisión por esta conversión; se aplican las comisiones propias del minter de ckBTC.",
  },
  "zh-Hans": {
    price:
      "价格：每个 TTTI-T 10,000 USD，另加 1% 费用，以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付。最低购买量：0.0001 TTTI-T，即含费用 1.01 USD。",
    cyclesFee:
      "以 ICP、ckBTC、ckUSDC 或 ckUSDT 购买均收取固定 1% 的费用。每笔已交付的 ICP 购买中，费用份额 floor(cost × 100 / 10,100) 留在公开的 CYCLES_RESERVE 子账户中，用于支付 canister 的 cycles；金库收到其余成本减去 ICP 账本手续费后的金额。ckBTC、ckUSDC 和 ckUSDT 付款连同费用全额转入该代币自己的金库账户；这些费用不转换为 cycles。转账失败时会重试。每 6 小时，当 canister 持有的 cycles 少于 3 T 时，它会通过 Cycles Minting Canister 将储备中的 ICP 转换为 cycles；此充值可以使用低于 2 ICP 下限的储备资金。只有管理员可以转出储备中超出下限的 ICP，且只能转入金库，最多为储备减去下限再减去 ICP 账本手续费；当 canister 持有的 cycles 少于 3 T，或充值正在进行或等待确认时，此转账被阻止。过往兑换保留当时记录的费用。",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `最低存款 ${minDeposit}。ckBTC 在 ${confirmations} 次 Bitcoin 确认后创建（约 1 小时）。费用 1%。退款以 ckBTC 进行。`,
    btcPayment:
      "以 BTC 支付需经由 ckBTC。应用会显示一个个人 Bitcoin 存款地址，该地址在此流程中保持不变，并用于每一笔转账。每笔转账按其交易 ID（txid）记录并跟踪；离开页面后进度仍会保留。在达到 ckBTC minter 要求的 Bitcoin 确认数（约 6 次）后，minter 创建等额的 ckBTC，并以每小时汇率扣除 1% 费用后购买 TTTI-T。连续发送的多笔转账会在各自的确认到达后分别兑换，按从早到晚的顺序进行。ckBTC 发送至 ckBTC 金库。退款以 ckBTC 进行。",
    btcWalletConversion:
      "钱包也可以通过另一个同样保持不变、并以相同方式跟踪的个人存款地址，仅将 BTC 转换为 ckBTC；ckBTC 保留在您的钱包中。应用对此转换不收取任何费用；ckBTC minter 自身的费用适用。",
  },
  "pt-BR": {
    price:
      "Preço: 10.000 USD por TTTI-T mais uma taxa de 1%, pago em ICP, ckBTC, ckUSDC ou ckUSDT. Compra mínima: 0,0001 TTTI-T, ou seja, 1,01 USD com a taxa incluída.",
    cyclesFee:
      "As compras em ICP, ckBTC, ckUSDC ou ckUSDT têm uma taxa fixa de 1%. Para cada compra em ICP entregue, a parte da taxa floor(cost × 100 / 10.100) permanece na subconta publicada CYCLES_RESERVE e paga os cycles do canister; a tesouraria recebe o restante do custo menos a taxa do ledger do ICP. Os pagamentos em ckBTC, ckUSDC e ckUSDT são repassados integralmente, taxa incluída, à conta de tesouraria própria desse token; essas taxas não se tornam cycles. Um repasse que falha é tentado novamente. A cada 6 horas, quando o canister tem menos de 3 T cycles, ele converte ICP da reserva em cycles por meio do Cycles Minting Canister; essa recarga pode usar fundos da reserva abaixo do mínimo de 2 ICP. Somente um administrador pode transferir o ICP da reserva acima do mínimo, apenas para a tesouraria e no máximo a reserva menos o mínimo menos a taxa do ledger do ICP; essa transferência fica bloqueada enquanto o canister tiver menos de 3 T cycles ou uma recarga estiver em andamento ou aguardando confirmação. Conversões anteriores mantêm a taxa registrada na época.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Depósito mínimo ${minDeposit}. O ckBTC é criado após ${confirmations} confirmações de Bitcoin (cerca de 1 hora). Taxa de 1%. Os reembolsos são feitos em ckBTC.`,
    btcPayment:
      "O pagamento em BTC passa pelo ckBTC. O app mostra um endereço de depósito de Bitcoin pessoal, que permanece o mesmo para este fluxo e é reutilizado em cada transferência. Cada transferência é registrada pelo seu identificador de transação (txid) e acompanhada; o progresso é mantido quando você sai da página. Após as confirmações de Bitcoin exigidas pelo minter de ckBTC (cerca de 6), o minter cria o ckBTC equivalente, que compra TTTI-T à taxa horária com a taxa de 1%. Várias transferências enviadas em sequência são convertidas, cada uma, à medida que suas confirmações chegam, da mais antiga para a mais recente. O ckBTC é enviado à tesouraria de ckBTC. Os reembolsos são feitos em ckBTC.",
    btcWalletConversion:
      "O wallet também pode converter apenas BTC em ckBTC, por meio de um endereço de depósito pessoal separado, que também permanece o mesmo e é acompanhado da mesma forma; o ckBTC permanece no seu wallet. O app não cobra taxa nessa conversão; aplicam-se as taxas próprias do minter de ckBTC.",
  },
  ko: {
    price:
      "가격: TTTI-T당 10,000 USD에 1% 수수료가 추가되며, ICP, ckBTC, ckUSDC 또는 ckUSDT로 지불합니다. 최소 구매량: 0.0001 TTTI-T, 즉 수수료 포함 1.01 USD.",
    cyclesFee:
      "ICP, ckBTC, ckUSDC 또는 ckUSDT로 구매할 때 1%의 고정 수수료가 부과됩니다. 전달이 완료된 각 ICP 구매에 대해 수수료 몫 floor(cost × 100 / 10,100)은 공개된 CYCLES_RESERVE 하위 계정에 남아 canister의 cycles 비용을 지불하며, 트레저리는 나머지 비용에서 ICP 원장 수수료를 뺀 금액을 받습니다. ckBTC, ckUSDC 및 ckUSDT 결제는 수수료를 포함한 전액이 해당 토큰 자체의 트레저리 계정으로 전달되며, 이 수수료는 cycles로 전환되지 않습니다. 실패한 전달은 재시도됩니다. 6시간마다 canister가 보유한 cycles가 3 T 미만이면 canister는 Cycles Minting Canister를 통해 준비금의 ICP를 cycles로 전환하며, 이 충전에는 2 ICP 하한 아래의 준비금이 사용될 수 있습니다. 하한을 초과하는 준비금의 ICP는 관리자만, 트레저리로만, 최대 준비금에서 하한과 ICP 원장 수수료를 뺀 금액까지 이체할 수 있으며, canister가 보유한 cycles가 3 T 미만이거나 충전이 진행 중이거나 확인 대기 중인 동안에는 이 이체가 차단됩니다. 과거 전환에는 당시 기록된 수수료가 유지됩니다.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `최소 입금액 ${minDeposit}. ckBTC는 Bitcoin 확인 ${confirmations}회 후 생성됩니다(약 1시간). 수수료 1%. 환불은 ckBTC로 이루어집니다.`,
    btcPayment:
      "BTC 결제는 ckBTC를 거칩니다. 앱에 개인 Bitcoin 입금 주소가 표시되며, 이 주소는 이 흐름에서 동일하게 유지되고 모든 전송에 다시 사용됩니다. 각 전송은 거래 ID(txid)로 기록되고 추적되며, 페이지를 떠나도 진행 상황이 유지됩니다. ckBTC minter가 요구하는 Bitcoin 확인(약 6회) 후 minter가 동일한 양의 ckBTC를 생성하며, 이 ckBTC로 1% 수수료와 함께 시간별 환율에 따라 TTTI-T를 구매합니다. 연이어 보낸 여러 전송은 각각 확인이 도착하는 대로 오래된 것부터 전환됩니다. ckBTC는 ckBTC 트레저리로 전송됩니다. 환불은 ckBTC로 이루어집니다.",
    btcWalletConversion:
      "지갑에서는 마찬가지로 동일하게 유지되고 같은 방식으로 추적되는 별도의 개인 입금 주소를 통해 BTC를 ckBTC로만 전환할 수도 있으며, ckBTC는 지갑에 남습니다. 앱은 이 전환에 수수료를 부과하지 않으며, ckBTC minter 자체 수수료가 적용됩니다.",
  },
  "pa-Guru": {
    price:
      "ਕੀਮਤ: ਪ੍ਰਤੀ TTTI-T 10,000 USD ਅਤੇ ਨਾਲ 1% ਫੀਸ, ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਭੁਗਤਾਨ। ਘੱਟੋ-ਘੱਟ ਖਰੀਦ: 0.0001 TTTI-T, ਯਾਨੀ ਫੀਸ ਸਮੇਤ 1.01 USD।",
    cyclesFee:
      "ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਖਰੀਦਾਂ 'ਤੇ 1% ਦੀ ਨਿਸ਼ਚਿਤ ਫੀਸ ਲੱਗਦੀ ਹੈ। ਹਰ ਡਿਲੀਵਰ ਕੀਤੀ ICP ਖਰੀਦ ਲਈ, ਫੀਸ ਦਾ ਹਿੱਸਾ floor(cost × 100 / 10,100) ਪ੍ਰਕਾਸ਼ਿਤ CYCLES_RESERVE ਸਬ-ਖਾਤੇ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ ਅਤੇ canister ਦੇ cycles ਦਾ ਭੁਗਤਾਨ ਕਰਦਾ ਹੈ; ਖਜ਼ਾਨੇ ਨੂੰ ਬਾਕੀ ਲਾਗਤ ਵਿੱਚੋਂ ICP ਲੈਜਰ ਫੀਸ ਘਟਾ ਕੇ ਮਿਲਦਾ ਹੈ। ckBTC, ckUSDC ਅਤੇ ckUSDT ਭੁਗਤਾਨ ਫੀਸ ਸਮੇਤ ਪੂਰੇ ਦੇ ਪੂਰੇ ਉਸ ਟੋਕਨ ਦੇ ਆਪਣੇ ਖਜ਼ਾਨਾ ਖਾਤੇ ਨੂੰ ਭੇਜੇ ਜਾਂਦੇ ਹਨ; ਇਹ ਫੀਸਾਂ cycles ਵਿੱਚ ਨਹੀਂ ਬਦਲਦੀਆਂ। ਅਸਫਲ ਭੇਜਣ ਦੀ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਹਰ 6 ਘੰਟਿਆਂ ਬਾਅਦ, ਜਦੋਂ canister ਕੋਲ 3 T cycles ਤੋਂ ਘੱਟ ਹੁੰਦੇ ਹਨ, ਇਹ Cycles Minting Canister ਰਾਹੀਂ ਰਿਜ਼ਰਵ ਦੇ ICP ਨੂੰ cycles ਵਿੱਚ ਬਦਲਦਾ ਹੈ; ਇਹ ਟਾਪ-ਅੱਪ 2 ICP ਦੀ ਹੇਠਲੀ ਸੀਮਾ ਤੋਂ ਹੇਠਾਂ ਦੇ ਰਿਜ਼ਰਵ ਫੰਡ ਵਰਤ ਸਕਦਾ ਹੈ। ਹੇਠਲੀ ਸੀਮਾ ਤੋਂ ਉੱਪਰ ਦਾ ਰਿਜ਼ਰਵ ICP ਸਿਰਫ਼ ਪ੍ਰਸ਼ਾਸਕ ਹੀ, ਸਿਰਫ਼ ਖਜ਼ਾਨੇ ਨੂੰ, ਅਤੇ ਵੱਧ ਤੋਂ ਵੱਧ ਰਿਜ਼ਰਵ ਘਟਾ ਹੇਠਲੀ ਸੀਮਾ ਘਟਾ ICP ਲੈਜਰ ਫੀਸ ਤੱਕ ਟ੍ਰਾਂਸਫਰ ਕਰ ਸਕਦਾ ਹੈ; ਜਦੋਂ ਤੱਕ canister ਕੋਲ 3 T cycles ਤੋਂ ਘੱਟ ਹਨ ਜਾਂ ਟਾਪ-ਅੱਪ ਚੱਲ ਰਿਹਾ ਹੈ ਜਾਂ ਪੁਸ਼ਟੀ ਦੀ ਉਡੀਕ ਵਿੱਚ ਹੈ, ਇਹ ਟ੍ਰਾਂਸਫਰ ਬਲੌਕ ਰਹਿੰਦਾ ਹੈ। ਪਿਛਲੇ ਪਰਿਵਰਤਨ ਉਸ ਸਮੇਂ ਦਰਜ ਕੀਤੀ ਫੀਸ ਨੂੰ ਬਰਕਰਾਰ ਰੱਖਦੇ ਹਨ।",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `ਘੱਟੋ-ਘੱਟ ਜਮ੍ਹਾਂ ${minDeposit}। ckBTC, ${confirmations} Bitcoin ਪੁਸ਼ਟੀਆਂ ਤੋਂ ਬਾਅਦ ਬਣਦਾ ਹੈ (ਲਗਭਗ 1 ਘੰਟਾ)। ਫੀਸ 1%। ਰਿਫੰਡ ckBTC ਵਿੱਚ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।`,
    btcPayment:
      "BTC ਵਿੱਚ ਭੁਗਤਾਨ ckBTC ਰਾਹੀਂ ਹੁੰਦਾ ਹੈ। ਐਪ ਇੱਕ ਨਿੱਜੀ Bitcoin ਜਮ੍ਹਾਂ ਪਤਾ ਦਿਖਾਉਂਦੀ ਹੈ, ਜੋ ਇਸ ਪ੍ਰਕਿਰਿਆ ਲਈ ਇੱਕੋ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਹਰ ਟ੍ਰਾਂਸਫਰ ਲਈ ਦੁਬਾਰਾ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ। ਹਰ ਟ੍ਰਾਂਸਫਰ ਉਸਦੀ ਲੈਣ-ਦੇਣ ID (txid) ਨਾਲ ਦਰਜ ਅਤੇ ਟ੍ਰੈਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ; ਪੰਨਾ ਛੱਡਣ 'ਤੇ ਵੀ ਪ੍ਰਗਤੀ ਬਰਕਰਾਰ ਰਹਿੰਦੀ ਹੈ। ckBTC minter ਦੁਆਰਾ ਲੋੜੀਂਦੀਆਂ Bitcoin ਪੁਸ਼ਟੀਆਂ (ਲਗਭਗ 6) ਤੋਂ ਬਾਅਦ, minter ਬਰਾਬਰ ckBTC ਬਣਾਉਂਦਾ ਹੈ, ਜੋ 1% ਫੀਸ ਨਾਲ ਘੰਟੇਵਾਰ ਦਰ 'ਤੇ TTTI-T ਖਰੀਦਦਾ ਹੈ। ਲਗਾਤਾਰ ਭੇਜੇ ਗਏ ਕਈ ਟ੍ਰਾਂਸਫਰ ਹਰ ਇੱਕ ਆਪਣੀਆਂ ਪੁਸ਼ਟੀਆਂ ਆਉਣ 'ਤੇ, ਸਭ ਤੋਂ ਪੁਰਾਣੇ ਤੋਂ ਸ਼ੁਰੂ ਕਰਕੇ, ਬਦਲੇ ਜਾਂਦੇ ਹਨ। ckBTC, ckBTC ਖਜ਼ਾਨੇ ਨੂੰ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ। ਰਿਫੰਡ ckBTC ਵਿੱਚ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।",
    btcWalletConversion:
      "ਵਾਲਿਟ ਇੱਕ ਵੱਖਰੇ ਨਿੱਜੀ ਜਮ੍ਹਾਂ ਪਤੇ ਰਾਹੀਂ, ਜੋ ਵੀ ਇੱਕੋ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਇਸੇ ਤਰ੍ਹਾਂ ਟ੍ਰੈਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਸਿਰਫ਼ BTC ਨੂੰ ckBTC ਵਿੱਚ ਵੀ ਬਦਲ ਸਕਦਾ ਹੈ; ckBTC ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ। ਐਪ ਇਸ ਪਰਿਵਰਤਨ 'ਤੇ ਕੋਈ ਫੀਸ ਨਹੀਂ ਲੈਂਦੀ; ckBTC minter ਦੀਆਂ ਆਪਣੀਆਂ ਫੀਸਾਂ ਲਾਗੂ ਹੁੰਦੀਆਂ ਹਨ।",
  },
});
