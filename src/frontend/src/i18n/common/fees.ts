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
      "Price: 10,000 USD per TTTI-T, paid in ICP, ckBTC, ckUSDC or ckUSDT. Minimum purchase: 0.0001 TTTI-T.",
    cyclesFee:
      "1% of the amount paid in ICP, ckBTC, ckUSDC or ckUSDT goes to the creator, after the cycles reserve: the 1% tops up the cycles reserve first, and the remainder is sent to the creator in the paid token, with the ledger fee deducted. The rest of the payment forms the minter's position and the common reserve (10,000 USD per TTTI-T minted, held in the paid token (ICP, ckBTC, ckUSDC or ckUSDT), with no conversion). No TTTI-T is created for pools. When the canister holds less than 20 T cycles, it converts ICP from the published CYCLES_RESERVE subaccount into cycles through the Cycles Minting Canister; the reserve is kept at 2 ICP and has no withdrawal path. Past purchases keep the terms recorded at the time.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Minimum deposit ${minDeposit}. ckBTC is created after ${confirmations} Bitcoin confirmations (about 1 hour). 1% goes to the creator after the cycles reserve. Refunds are made in ckBTC.`,
    btcPayment:
      "Paying in BTC goes through ckBTC. The app shows a personal Bitcoin deposit address that stays the same for this flow and is reused for every transfer. Each transfer is recorded by its transaction ID (txid) and tracked; the progress is kept when you leave the page. After the Bitcoin confirmations required by the ckBTC minter (about 6), the minter creates the equivalent ckBTC, which buys TTTI-T at the hourly rate. 1% of the ckBTC goes to the creator, after the cycles reserve; the rest forms the minter's position and the common reserve (10,000 USD per TTTI-T minted, held in ckBTC, with no conversion). Several transfers sent back-to-back are each converted as their confirmations arrive, oldest first. Refunds are made in ckBTC.",
    btcWalletConversion:
      "The wallet can also convert BTC to ckBTC alone, through a separate personal deposit address that also stays the same and is tracked in the same way; the ckBTC stays in your wallet. The app takes no fee on this conversion; the ckBTC minter's own fees apply.",
  },
  fr: {
    price:
      "Prix : 10\u202f000 USD par TTTI-T, payé en ICP, ckBTC, ckUSDC ou ckUSDT. Achat minimum : 0,0001 TTTI-T.",
    cyclesFee:
      "1% du montant payé en ICP, ckBTC, ckUSDC ou ckUSDT revient au créateur, après la réserve de cycles : le 1% alimente d'abord la réserve de cycles, et le reste est envoyé au créateur dans le jeton payé, frais du ledger déduits. Le reste du paiement constitue la position du minter et la réserve commune (10 000 USD par TTTI-T minté, détenus dans le jeton payé (ICP, ckBTC, ckUSDC ou ckUSDT), sans conversion). Aucun TTTI-T n'est créé pour les pools. Quand le canister détient moins de 20 T cycles, il convertit de l'ICP du sous-compte publié CYCLES_RESERVE en cycles via le Cycles Minting Canister ; la réserve est maintenue à 2 ICP et n'a aucune possibilité de retrait. Les achats passés conservent les conditions enregistrées à leur date.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Dépôt minimum ${minDeposit}. Le ckBTC est créé après ${confirmations} confirmations Bitcoin (environ 1 heure). 1% revient au créateur après la réserve de cycles. Les remboursements sont effectués en ckBTC.`,
    btcPayment:
      "Le paiement en BTC passe par le ckBTC. L'app affiche une adresse de dépôt Bitcoin personnelle, qui reste la même pour ce parcours et sert à chaque transfert. Chaque transfert est enregistré par son identifiant de transaction (txid) et suivi ; la progression est conservée lorsque vous quittez la page. Après les confirmations Bitcoin exigées par le minter ckBTC (environ 6), le minter crée l'équivalent en ckBTC, qui achète du TTTI-T au taux horaire. 1% du ckBTC revient au créateur, après la réserve de cycles ; le reste constitue la position du minter et la réserve commune (10 000 USD par TTTI-T minté, détenus en ckBTC, sans conversion). Plusieurs transferts envoyés coup sur coup sont chacun convertis à mesure que leurs confirmations arrivent, du plus ancien au plus récent. Les remboursements sont effectués en ckBTC.",
    btcWalletConversion:
      "Le wallet peut aussi convertir uniquement du BTC en ckBTC, via une adresse de dépôt personnelle distincte qui reste elle aussi la même et est suivie de la même façon ; le ckBTC reste dans votre wallet. L'app ne prélève aucun frais sur cette conversion ; les frais propres du minter ckBTC s'appliquent.",
  },
  es: {
    price:
      "Precio: 10.000 USD por TTTI-T, pagado en ICP, ckBTC, ckUSDC o ckUSDT. Compra mínima: 0,0001 TTTI-T.",
    cyclesFee:
      "El 1% del importe pagado en ICP, ckBTC, ckUSDC o ckUSDT corresponde al creador, después de la reserva de cycles: el 1% alimenta primero la reserva de cycles y el resto se envía al creador en el token pagado, con la comisión del ledger descontada. El resto del pago forma la posición del minter y la reserva común (10 000 USD por cada TTTI-T acuñado, mantenidos en el token pagado (ICP, ckBTC, ckUSDC o ckUSDT), sin conversión). No se crea ningún TTTI-T para los pools. Cuando el canister tiene menos de 20 T cycles, convierte ICP de la subcuenta publicada CYCLES_RESERVE en cycles a través del Cycles Minting Canister; la reserva se mantiene en 2 ICP y no tiene ninguna vía de retiro. Las compras pasadas conservan las condiciones registradas en su momento.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Depósito mínimo ${minDeposit}. El ckBTC se crea tras ${confirmations} confirmaciones de Bitcoin (aproximadamente 1 hora). El 1% corresponde al creador después de la reserva de cycles. Los reembolsos se realizan en ckBTC.`,
    btcPayment:
      "El pago en BTC pasa por ckBTC. La app muestra una dirección de depósito de Bitcoin personal, que se mantiene igual para este recorrido y se reutiliza en cada transferencia. Cada transferencia se registra por su identificador de transacción (txid) y se sigue; el progreso se conserva al salir de la página. Tras las confirmaciones de Bitcoin exigidas por el minter de ckBTC (aproximadamente 6), el minter crea el ckBTC equivalente, que compra TTTI-T al tipo horario. El 1% del ckBTC corresponde al creador, después de la reserva de cycles; el resto forma la posición del minter y la reserva común (10 000 USD por cada TTTI-T acuñado, mantenidos en ckBTC, sin conversión). Varias transferencias enviadas una tras otra se convierten cada una a medida que llegan sus confirmaciones, de la más antigua a la más reciente. Los reembolsos se realizan en ckBTC.",
    btcWalletConversion:
      "El wallet también puede convertir solo BTC en ckBTC, mediante una dirección de depósito personal distinta que también se mantiene igual y se sigue del mismo modo; el ckBTC permanece en su wallet. La app no cobra ninguna comisión por esta conversión; se aplican las comisiones propias del minter de ckBTC.",
  },
  "zh-Hans": {
    price:
      "价格：每个 TTTI-T 10,000 USD，以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付。最低购买量：0.0001 TTTI-T。",
    cyclesFee:
      "以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付金额的 1% 归创建者所有，在 cycles 储备之后：这 1% 先补充 cycles 储备，余额以所支付的代币发送给创建者，并扣除账本手续费。付款的其余部分构成铸造者的头寸和共同储备（每铸造 1 个 TTTI-T，有 10,000 USD 以所支付的代币（ICP、ckBTC、ckUSDC 或 ckUSDT）持有，不进行兑换）。不会为资金池创建任何 TTTI-T。当 canister 持有的 cycles 少于 20 T 时，它会通过 Cycles Minting Canister 将公开的 CYCLES_RESERVE 子账户中的 ICP 转换为 cycles；储备保持在 2 ICP，且没有任何提取途径。过往购买保留当时记录的条件。",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `最低存款 ${minDeposit}。ckBTC 在 ${confirmations} 次 Bitcoin 确认后创建（约 1 小时）。其中 1% 在 cycles 储备之后归创建者所有。退款以 ckBTC 进行。`,
    btcPayment:
      "以 BTC 支付需经由 ckBTC。应用会显示一个个人 Bitcoin 存款地址，该地址在此流程中保持不变，并用于每一笔转账。每笔转账按其交易 ID（txid）记录并跟踪；离开页面后进度仍会保留。在达到 ckBTC minter 要求的 Bitcoin 确认数（约 6 次）后，minter 创建等额的 ckBTC，并以每小时汇率购买 TTTI-T。ckBTC 的 1% 在 cycles 储备之后归创建者所有，其余部分构成铸造者的头寸和共同储备（每铸造 1 个 TTTI-T，有 10,000 USD 以 ckBTC 持有，不进行兑换）。连续发送的多笔转账会在各自的确认到达后分别兑换，按从早到晚的顺序进行。退款以 ckBTC 进行。",
    btcWalletConversion:
      "钱包也可以通过另一个同样保持不变、并以相同方式跟踪的个人存款地址，仅将 BTC 转换为 ckBTC；ckBTC 保留在您的钱包中。应用对此转换不收取任何费用；ckBTC minter 自身的费用适用。",
  },
  "pt-BR": {
    price:
      "Preço: 10.000 USD por TTTI-T, pago em ICP, ckBTC, ckUSDC ou ckUSDT. Compra mínima: 0,0001 TTTI-T.",
    cyclesFee:
      "1% do valor pago em ICP, ckBTC, ckUSDC ou ckUSDT vai para o criador, depois da reserva de cycles: o 1% abastece primeiro a reserva de cycles, e o restante é enviado ao criador no token pago, com a taxa do ledger deduzida. O restante do pagamento forma a posição do minter e a reserva comum (10.000 USD por TTTI-T mintado, mantidos no token pago (ICP, ckBTC, ckUSDC ou ckUSDT), sem conversão). Nenhum TTTI-T é criado para os pools. Quando o canister tem menos de 20 T cycles, ele converte ICP da subconta publicada CYCLES_RESERVE em cycles por meio do Cycles Minting Canister; a reserva é mantida em 2 ICP e não tem nenhuma via de saque. Compras anteriores mantêm as condições registradas na época.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `Depósito mínimo ${minDeposit}. O ckBTC é criado após ${confirmations} confirmações de Bitcoin (cerca de 1 hora). 1% vai para o criador depois da reserva de cycles. Os reembolsos são feitos em ckBTC.`,
    btcPayment:
      "O pagamento em BTC passa pelo ckBTC. O app mostra um endereço de depósito de Bitcoin pessoal, que permanece o mesmo para este fluxo e é reutilizado em cada transferência. Cada transferência é registrada pelo seu identificador de transação (txid) e acompanhada; o progresso é mantido quando você sai da página. Após as confirmações de Bitcoin exigidas pelo minter de ckBTC (cerca de 6), o minter cria o ckBTC equivalente, que compra TTTI-T à taxa horária. 1% do ckBTC vai para o criador, depois da reserva de cycles; o restante forma a posição do minter e a reserva comum (10.000 USD por TTTI-T mintado, mantidos em ckBTC, sem conversão). Várias transferências enviadas em sequência são convertidas, cada uma, à medida que suas confirmações chegam, da mais antiga para a mais recente. Os reembolsos são feitos em ckBTC.",
    btcWalletConversion:
      "O wallet também pode converter apenas BTC em ckBTC, por meio de um endereço de depósito pessoal separado, que também permanece o mesmo e é acompanhado da mesma forma; o ckBTC permanece no seu wallet. O app não cobra taxa nessa conversão; aplicam-se as taxas próprias do minter de ckBTC.",
  },
  ko: {
    price:
      "가격: TTTI-T당 10,000 USD이며, ICP, ckBTC, ckUSDC 또는 ckUSDT로 지불합니다. 최소 구매량: 0.0001 TTTI-T.",
    cyclesFee:
      "ICP, ckBTC, ckUSDC 또는 ckUSDT로 지불한 금액의 1%는 cycles 준비금 이후 제작자에게 돌아갑니다. 이 1%는 먼저 cycles 준비금을 채우고, 나머지는 원장 수수료를 차감한 뒤 지불한 토큰으로 제작자에게 전송됩니다. 결제의 나머지는 민터의 포지션과 공동 준비금(민트된 TTTI-T 1개당 10,000 USD, 지불한 토큰(ICP, ckBTC, ckUSDC 또는 ckUSDT)으로 보관하며 전환 없음)을 구성합니다. 풀을 위해 TTTI-T가 생성되지 않습니다. canister가 보유한 cycles가 20 T 미만이면 canister는 Cycles Minting Canister를 통해 공개된 CYCLES_RESERVE 하위 계정의 ICP를 cycles로 전환합니다. 준비금은 2 ICP로 유지되며 인출 경로가 없습니다. 과거 구매에는 당시 기록된 조건이 유지됩니다.",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `최소 입금액 ${minDeposit}. ckBTC는 Bitcoin 확인 ${confirmations}회 후 생성됩니다(약 1시간). 1%는 cycles 준비금 이후 제작자에게 돌아갑니다. 환불은 ckBTC로 이루어집니다.`,
    btcPayment:
      "BTC 결제는 ckBTC를 거칩니다. 앱에 개인 Bitcoin 입금 주소가 표시되며, 이 주소는 이 흐름에서 동일하게 유지되고 모든 전송에 다시 사용됩니다. 각 전송은 거래 ID(txid)로 기록되고 추적되며, 페이지를 떠나도 진행 상황이 유지됩니다. ckBTC minter가 요구하는 Bitcoin 확인(약 6회) 후 minter가 동일한 양의 ckBTC를 생성하며, 이 ckBTC로 시간별 환율에 따라 TTTI-T를 구매합니다. ckBTC의 1%는 cycles 준비금 이후 제작자에게 돌아가고, 나머지는 민터의 포지션과 공동 준비금(민트된 TTTI-T 1개당 10,000 USD, ckBTC로 보관하며 전환 없음)을 구성합니다. 연이어 보낸 여러 전송은 각각 확인이 도착하는 대로 오래된 것부터 전환됩니다. 환불은 ckBTC로 이루어집니다.",
    btcWalletConversion:
      "지갑에서는 마찬가지로 동일하게 유지되고 같은 방식으로 추적되는 별도의 개인 입금 주소를 통해 BTC를 ckBTC로만 전환할 수도 있으며, ckBTC는 지갑에 남습니다. 앱은 이 전환에 수수료를 부과하지 않으며, ckBTC minter 자체 수수료가 적용됩니다.",
  },
  "pa-Guru": {
    price:
      "ਕੀਮਤ: ਪ੍ਰਤੀ TTTI-T 10,000 USD, ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਭੁਗਤਾਨ। ਘੱਟੋ-ਘੱਟ ਖਰੀਦ: 0.0001 TTTI-T।",
    cyclesFee:
      "ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਅਦਾ ਕੀਤੀ ਰਕਮ ਦਾ 1% ਸਾਈਕਲ ਰਿਜ਼ਰਵ ਤੋਂ ਬਾਅਦ ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ: ਇਹ 1% ਪਹਿਲਾਂ cycles ਰਿਜ਼ਰਵ ਨੂੰ ਭਰਦਾ ਹੈ ਅਤੇ ਬਾਕੀ ਲੈਜਰ ਫੀਸ ਕੱਟ ਕੇ ਅਦਾ ਕੀਤੇ ਟੋਕਨ ਵਿੱਚ ਸਿਰਜਣਹਾਰ ਨੂੰ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ। ਭੁਗਤਾਨ ਦਾ ਬਾਕੀ ਹਿੱਸਾ ਮਿੰਟਰ ਦੀ ਪੁਜ਼ੀਸ਼ਨ ਅਤੇ ਸਾਂਝਾ ਰਿਜ਼ਰਵ (ਮਿੰਟ ਕੀਤੇ ਹਰ TTTI-T ਪਿੱਛੇ 10,000 USD, ਅਦਾ ਕੀਤੇ ਟੋਕਨ (ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT) ਵਿੱਚ, ਬਿਨਾਂ ਤਬਦੀਲੀ ਦੇ) ਬਣਾਉਂਦਾ ਹੈ। ਪੂਲਾਂ ਲਈ ਕੋਈ TTTI-T ਨਹੀਂ ਬਣਾਇਆ ਜਾਂਦਾ। ਜਦੋਂ canister ਕੋਲ 20 T cycles ਤੋਂ ਘੱਟ ਹੁੰਦੇ ਹਨ, ਇਹ Cycles Minting Canister ਰਾਹੀਂ ਪ੍ਰਕਾਸ਼ਿਤ CYCLES_RESERVE ਸਬ-ਖਾਤੇ ਦੇ ICP ਨੂੰ cycles ਵਿੱਚ ਬਦਲਦਾ ਹੈ; ਰਿਜ਼ਰਵ 2 ICP 'ਤੇ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਇਸਨੂੰ ਕਢਵਾਉਣ ਦਾ ਕੋਈ ਰਸਤਾ ਨਹੀਂ ਹੈ। ਪਿਛਲੀਆਂ ਖਰੀਦਾਂ ਉਸ ਸਮੇਂ ਦਰਜ ਕੀਤੀਆਂ ਸ਼ਰਤਾਂ ਨੂੰ ਬਰਕਰਾਰ ਰੱਖਦੀਆਂ ਹਨ।",
    btcDeposit: (minDeposit: string, confirmations: string) =>
      `ਘੱਟੋ-ਘੱਟ ਜਮ੍ਹਾਂ ${minDeposit}। ckBTC, ${confirmations} Bitcoin ਪੁਸ਼ਟੀਆਂ ਤੋਂ ਬਾਅਦ ਬਣਦਾ ਹੈ (ਲਗਭਗ 1 ਘੰਟਾ)। 1% cycles ਰਿਜ਼ਰਵ ਤੋਂ ਬਾਅਦ ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ। ਰਿਫੰਡ ckBTC ਵਿੱਚ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।`,
    btcPayment:
      "BTC ਵਿੱਚ ਭੁਗਤਾਨ ckBTC ਰਾਹੀਂ ਹੁੰਦਾ ਹੈ। ਐਪ ਇੱਕ ਨਿੱਜੀ Bitcoin ਜਮ੍ਹਾਂ ਪਤਾ ਦਿਖਾਉਂਦੀ ਹੈ, ਜੋ ਇਸ ਪ੍ਰਕਿਰਿਆ ਲਈ ਇੱਕੋ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਹਰ ਟ੍ਰਾਂਸਫਰ ਲਈ ਦੁਬਾਰਾ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ। ਹਰ ਟ੍ਰਾਂਸਫਰ ਉਸਦੀ ਲੈਣ-ਦੇਣ ID (txid) ਨਾਲ ਦਰਜ ਅਤੇ ਟ੍ਰੈਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ; ਪੰਨਾ ਛੱਡਣ 'ਤੇ ਵੀ ਪ੍ਰਗਤੀ ਬਰਕਰਾਰ ਰਹਿੰਦੀ ਹੈ। ckBTC minter ਦੁਆਰਾ ਲੋੜੀਂਦੀਆਂ Bitcoin ਪੁਸ਼ਟੀਆਂ (ਲਗਭਗ 6) ਤੋਂ ਬਾਅਦ, minter ਬਰਾਬਰ ckBTC ਬਣਾਉਂਦਾ ਹੈ, ਜੋ ਘੰਟੇਵਾਰ ਦਰ 'ਤੇ TTTI-T ਖਰੀਦਦਾ ਹੈ। ckBTC ਦਾ 1% cycles ਰਿਜ਼ਰਵ ਤੋਂ ਬਾਅਦ ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ; ਬਾਕੀ ਮਿੰਟਰ ਦੀ ਪੁਜ਼ੀਸ਼ਨ ਅਤੇ ਸਾਂਝਾ ਰਿਜ਼ਰਵ (ਮਿੰਟ ਕੀਤੇ ਹਰ TTTI-T ਪਿੱਛੇ 10,000 USD, ckBTC ਵਿੱਚ, ਬਿਨਾਂ ਤਬਦੀਲੀ ਦੇ) ਬਣਾਉਂਦਾ ਹੈ। ਲਗਾਤਾਰ ਭੇਜੇ ਗਏ ਕਈ ਟ੍ਰਾਂਸਫਰ ਹਰ ਇੱਕ ਆਪਣੀਆਂ ਪੁਸ਼ਟੀਆਂ ਆਉਣ 'ਤੇ, ਸਭ ਤੋਂ ਪੁਰਾਣੇ ਤੋਂ ਸ਼ੁਰੂ ਕਰਕੇ, ਬਦਲੇ ਜਾਂਦੇ ਹਨ। ਰਿਫੰਡ ckBTC ਵਿੱਚ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।",
    btcWalletConversion:
      "ਵਾਲਿਟ ਇੱਕ ਵੱਖਰੇ ਨਿੱਜੀ ਜਮ੍ਹਾਂ ਪਤੇ ਰਾਹੀਂ, ਜੋ ਵੀ ਇੱਕੋ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਇਸੇ ਤਰ੍ਹਾਂ ਟ੍ਰੈਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਸਿਰਫ਼ BTC ਨੂੰ ckBTC ਵਿੱਚ ਵੀ ਬਦਲ ਸਕਦਾ ਹੈ; ckBTC ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ। ਐਪ ਇਸ ਪਰਿਵਰਤਨ 'ਤੇ ਕੋਈ ਫੀਸ ਨਹੀਂ ਲੈਂਦੀ; ckBTC minter ਦੀਆਂ ਆਪਣੀਆਂ ਫੀਸਾਂ ਲਾਗੂ ਹੁੰਦੀਆਂ ਹਨ।",
  },
});
