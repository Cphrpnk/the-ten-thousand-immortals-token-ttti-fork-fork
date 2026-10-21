mixin () {
  public query func getApiDoc() : async Text {
    "# TTTI-T (Test) Backend API\n\n" #
    "## Purpose\n\n" #
    "This canister is the TTTI-T (test version) token ledger and its buy-to-mint\n" #
    "sale. TTTI-T is an ICRC-1 / ICRC-2 / ICRC-3 / ICRC-10 token with 8 decimals\n" #
    "and a maximum supply of 10 000 TTTI-T (1_000_000_000_000 base units). Base\n" #
    "price: 1 TTTI-T = 10 000 USD, plus a fixed 1% fee for the canister's running\n" #
    "costs (cycles), so a buyer pays 10 100 USD worth of ICP per TTTI-T. New\n" #
    "TTTI-T is created only by the purchase logic. The backend keeps only the core\n" #
    "contract: buying, balances, transfers, history and the token standards, plus\n" #
    "a few admin controls (pause sales, refresh the rate, the test transfer fee,\n" #
    "the receiving ICP account, the balance snapshot export).\n\n" #
    "Nobody, admin included, can mint outside the purchase logic, freeze\n" #
    "transfers, burn or move other holders' tokens, or withdraw or move ICP or the\n" #
    "collected fees outside the automatic rules described below.\n\n" #

    "## Authentication and identity\n\n" #
    "- Users sign in through the app frontend with Internet Identity or the Plug\n" #
    "  wallet. Every call is identified only by its caller principal. An Internet\n" #
    "  Identity principal and a Plug principal are different principals: balances,\n" #
    "  delivery addresses, acknowledgements, profiles and roles never carry over.\n" #
    "- The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "  `/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
    "  the user's Internet Identity authorization derives the correct per-app\n" #
    "  principal against that origin (for example\n" #
    "  `icp identity link web <name> --app <host>`). Warning: such a delegation acts\n" #
    "  with the user's full authority in this app (it can spend the user's TTTI-T\n" #
    "  and buy with their ICP approval) until it expires.\n" #
    "- Signed (non-anonymous) caller required: `icrc1_transfer`, `icrc2_approve`,\n" #
    "  `icrc2_transfer_from` (they act on the caller's own accounts), `burn` (own\n" #
    "  accounts only), `convertDeposit` (anonymous -> `#Err` code\n" #
    "  `#anonymousCaller`), `acceptPurchaseAcknowledgements` (anonymous ->\n" #
    "  `#err(#anonymousCaller)`), `setDeliveryAddress` (anonymous -> `#Err` code\n" #
    "  `#anonymousCaller`), `setMySetupStatus` (anonymous ->\n" #
    "  `#err(#anonymousCaller)`), `saveCallerUserProfile` (anonymous traps with\n" #
    "  `Unauthorized: please sign in to save a profile`).\n" #
    "- None of these need registration. A role matters only for admin endpoints.\n\n" #

    "### Registration and roles\n\n" #
    "- Roles are `#admin` or `#user`. Registration happens only when a caller signs\n" #
    "  in through this app's own frontend (the frontend calls the authorization\n" #
    "  library's sign-in hooks). A principal that never did so is unregistered even\n" #
    "  when it belongs to the app's owner, and a caller derived against a different\n" #
    "  origin is a different principal than the one the frontend registered.\n" #
    "- A direct API caller registers by calling `_initialize_access_control` once\n" #
    "  as a signed-in caller. It grants `#admin` only while no admin has been\n" #
    "  assigned yet; every later caller becomes `#user`. Anonymous calls register\n" #
    "  nothing.\n" #
    "- `getCallerUserRole`, `isCallerAdmin`, `assignCallerUserRole` come from the\n" #
    "  authorization library. `getCallerUserRole` and `isCallerAdmin` trap with\n" #
    "  `User is not registered` for an unregistered signed-in caller.\n" #
    "- Admin-only endpoints trap for any other caller. A registered non-admin gets\n" #
    "  `Unauthorized: only admins ...` (the exact message is listed per endpoint).\n" #
    "  An unregistered caller may get the library trap `User is not registered`\n" #
    "  instead. Treat any trap from an admin endpoint as \"not authorized\".\n\n" #

    "### Public vs caller-scoped vs admin\n\n" #
    "- Public (anyone, including anonymous): all ICRC-1/2/3/10 queries, the\n" #
    "  index-ng queries (`get_account_transactions`, `list_subaccounts`,\n" #
    "  `status`, `ledger_id`),\n" #
    "  `getFeeCollector`, `getBurnAccount`, `getLegacyBlockInfo`, `get_fee`,\n" #
    "  `get_fee_bounds`, `get_max_supply`, `getSaleStatus`, `getTechnicalDetails`,\n" #
    "  `getIcpPrice`, `getPublicTreasuryInfo`, `getCanisterPrincipal`, the wallet\n" #
    "  endpoints, `getOriginalWhitePaper` and `getApiDoc`.\n" #
    "- Caller-scoped: `getMyPurchaseAcknowledgement`,\n" #
    "  `acceptPurchaseAcknowledgements`, `getDeliveryAddress`,\n" #
    "  `setDeliveryAddress`, `clearDeliveryAddress`, `getCallerIcpBalance`,\n" #
    "  `getCallerUserProfile`, `saveCallerUserProfile`, `getMySetupStatus`,\n" #
    "  `setMySetupStatus`, `convertDeposit`, `burn`.\n" #
    "- Admin-only reads: `getTreasuryConfig`, `getConversions`,\n" #
    "  `exportBalanceSnapshot`.\n" #
    "- Admin-only writes: `setSalesPaused`, `refreshIcpPrice`, `set_fee` (test\n" #
    "  version only), `setTreasuryConfig` (receiving ICP account),\n" #
    "  `publishOriginalWhitePaper`. There is no admin mint, no admin burn of other\n" #
    "  accounts, no transfer freeze and no ICP or fee withdrawal endpoint.\n\n" #

    "## Units and encodings\n\n" #
    "- TTTI-T amounts are base units, 8 decimals (1 TTTI-T = 100_000_000; the\n" #
    "  minimum purchase 0.0001 TTTI-T = 10_000). Amounts are rounded down to\n" #
    "  1 base unit. Exception: legacy blocks below the legacy boundary (see\n" #
    "  ICRC-3) use 4 decimals.\n" #
    "- ICP amounts are e8s (1 ICP = 100_000_000). ICP ledger fee: 10_000 e8s.\n" #
    "- Prices: `usdE8` / `priceUsdE8` = USD per whole ICP * 10^8;\n" #
    "  `usdMicro` = USD * 10^6. `liveRate` is TTTI-T base units per whole ICP at\n" #
    "  the cached price (1% fee included). `cyclesFeeBps` is basis points\n" #
    "  (100 = 1%).\n" #
    "- Timestamps: nanoseconds since the Unix epoch. Conversion, oracle, snapshot\n" #
    "  and price timestamps are Candid `nat64`; acknowledgement `acceptedAt` and\n" #
    "  setup `updatedAt` are Candid `int`; ICRC-3 block `ts` is `Nat`. 0 means\n" #
    "  never.\n" #
    "- Accounts: ICRC-1 `{ owner : Principal; subaccount : ?Blob }` (32-byte\n" #
    "  subaccount). An all-zero subaccount is treated as `null`. Textual form\n" #
    "  (OQL) is the standard ICRC-1 account text.\n" #
    "- Optional values are Candid `opt`; variants are Candid variants.\n\n" #

    "## Special accounts\n\n" #
    "- Fee collector: `{ owner = <this canister>; subaccount = <fixed 32-byte\n" #
    "  ASCII identifier> }`, unchanged since launch; read it from\n" #
    "  `getFeeCollector() : { account; balance }`. Every charged transfer /\n" #
    "  transfer_from / approve fee is credited here. No caller, admin included,\n" #
    "  can transfer, approve from or burn it; its tokens go to buyers only once\n" #
    "  fresh minting reached the cap.\n" #
    "- Minting account = burn account: `{ owner = <this canister>; subaccount =\n" #
    "  null }`, returned by `icrc1_minting_account()` and `getBurnAccount()`. A\n" #
    "  transfer to it is a fee-less burn that reduces total supply. Transfers and\n" #
    "  approvals from it are refused.\n\n" #

    "## ICRC-1 / ICRC-2\n\n" #
    "- Metadata: `icrc1_name` = \"TTTI-T\", `icrc1_symbol` = \"TTTI-T\",\n" #
    "  `icrc1_decimals` = 8, `icrc1_fee`, `icrc1_total_supply`,\n" #
    "  `icrc1_balance_of`, `icrc1_metadata` (`icrc1:name`, `icrc1:symbol`,\n" #
    "  `icrc1:decimals`, `icrc1:fee`, `icrc1:max_memo_length` = 32,\n" #
    "  `icrc1:max_supply`).\n" #
    "- `icrc1_supported_standards` and `icrc10_supported_standards` both return\n" #
    "  ICRC-1, ICRC-2, ICRC-3 and ICRC-10 as `{ name; url }`.\n" #
    "- `icrc1_transfer`, `icrc2_approve`, `icrc2_allowance`, `icrc2_transfer_from`.\n\n" #
    "Rules (checked in this order: memo, created_at_time, then the rest):\n\n" #
    "- `memo` is at most 32 bytes, else `#GenericError { error_code = 4 }`.\n" #
    "- Transfer and transfer_from with `amount = 0` return\n" #
    "  `#GenericError { error_code = 5 }`. `icrc2_approve` with `amount = 0` is\n" #
    "  accepted: it charges the fee, writes a block and removes the allowance.\n" #
    "- `fee`: pass `null` or exactly the current fee, else\n" #
    "  `#BadFee { expected_fee }`. Burns (to the minting account) are fee-less:\n" #
    "  pass `null` or `?0`.\n" #
    "- Burns need `amount >= 100` base units, else `#BadBurn { min_burn_amount =\n" #
    "  100 }`.\n" #
    "- From the minting account -> `#GenericError { error_code = 6 }`. Approving\n" #
    "  a spender with the same owner principal -> `#GenericError { error_code = 7 }`.\n" #
    "  From the fee collector -> `#GenericError { error_code = 2 }`.\n" #
    "- Insufficient balance -> `#InsufficientFunds { balance }` (amount + fee for\n" #
    "  transfers; only the fee for approve).\n\n" #
    "Deduplication (only when `created_at_time` is set):\n\n" #
    "- Window 24 h, permitted drift 2 min. Too old -> `#TooOld`; more than 2 min\n" #
    "  ahead -> `#CreatedInFuture { ledger_time }`.\n" #
    "- An identical request inside the window returns\n" #
    "  `#Duplicate { duplicate_of = <original block index> }` and changes nothing.\n" #
    "  Set `created_at_time` to make retries of a transfer/approve safe. Without it\n" #
    "  every call is a new transaction.\n\n" #
    "Approvals (ICRC-2):\n\n" #
    "- `expires_at <= now` -> `#Expired { ledger_time }`. A mismatching\n" #
    "  `expected_allowance` -> `#AllowanceChanged { current_allowance }`. A new\n" #
    "  approve replaces the amount and the expiry.\n" #
    "- `icrc2_allowance` reports `{ allowance = 0; expires_at = null }` for a\n" #
    "  missing or expired approval.\n" #
    "- `icrc2_transfer_from` needs allowance >= amount + fee (else\n" #
    "  `#InsufficientAllowance { allowance }`). The remaining allowance keeps its\n" #
    "  original `expires_at` and is removed when it reaches 0.\n\n" #

    "## ICRC-3 block log\n\n" #
    "- `icrc3_get_blocks(vec { record { start; length } })` ->\n" #
    "  `{ log_length; blocks = vec { record { id; block } }; archived_blocks }`.\n" #
    "  Ranges are served in request order, each ascending and clipped to\n" #
    "  `log_length`, with at most 100 blocks in total per call. Blocks beyond the\n" #
    "  cap are omitted, so request again from the last returned `id + 1`.\n" #
    "- No archives: `archived_blocks = []`, `icrc3_get_archives` returns `[]`. The\n" #
    "  log is append-only and stays in this canister.\n" #
    "- `icrc3_supported_block_types` -> `1xfer`, `2approve`, `1mint`, `1burn`.\n" #
    "- Standard blocks are ICRC-3 `Value` maps: `btype`, `ts` (ns), optional `fee`\n" #
    "  (present only when the caller omitted `tx.fee`), optional `fee_col`,\n" #
    "  `phash`, and `tx` (`from`, `to`, `spender` as `Array [Blob owner, Blob\n" #
    "  subaccount?]`, `amt`, optional `fee`, `memo`, `created_at_time`,\n" #
    "  `expires_at`, `expected_allowance`).\n" #
    "- Sale deliveries are `1mint` blocks while fresh minting is below the cap;\n" #
    "  after the cap, deliveries from the fee collector are `1xfer` blocks with\n" #
    "  top-level `fee = 0` and no `fee_col`.\n" #
    "- Legacy history written before the ICRC-3 upgrade is preserved at the same\n" #
    "  indexes as colon-separated `Text` values. `getLegacyBlockInfo() : {\n" #
    "  boundaryIndex; legacyDecimals = 4; currentDecimals = 8 }`: blocks with\n" #
    "  index < `boundaryIndex` use 4 decimals. Decode by index, not by shape.\n" #
    "- Hashes use the ICRC-3 representation-independent hash. The first standard\n" #
    "  block chains to the SHA-256 of the last legacy text block.\n" #
    "- `icrc3_get_tip_certificate()` -> `opt { certificate; hash_tree }` with\n" #
    "  `last_block_hash` and `last_block_index`; `null` for an empty log or when\n" #
    "  called as an update. Verify it against the IC root key.\n\n" #

    "## ICRC index-ng\n\n" #
    "This canister is also its own ICRC index (index-ng interface, official\n" #
    "Candid shapes). The index is derived on the fly from the full ICRC-3 block\n" #
    "log, so it is always in sync and stores nothing extra. All are public\n" #
    "queries (anonymous allowed) and never change state.\n\n" #
    "- `ledger_id() : principal` returns this canister's own principal (the\n" #
    "  ledger and the index are the same canister).\n" #
    "- `status() : { num_blocks_synced : nat }` equals the ledger block count\n" #
    "  (`icrc3_get_blocks` `log_length`).\n" #
    "- `icrc1_balance_of(account)` is the ledger's own balance query.\n" #
    "- `get_account_transactions({ account; start : opt nat; max_results : nat })`\n" #
    "  -> `variant { Ok : { balance; transactions : vec { id; transaction };\n" #
    "  oldest_tx_id : opt nat }; Err : { message } }`. Transactions involving the\n" #
    "  account (as from, to or spender) are returned newest first. `start` is an\n" #
    "  exclusive upper bound: only ids strictly below it are returned. Page with\n" #
    "  `start = <last returned id>` until the last id equals `oldest_tx_id` or a\n" #
    "  page is empty. `max_results` is capped at 500. `balance` equals\n" #
    "  `icrc1_balance_of`. `Err` is not produced today.\n" #
    "- `Transaction` = `{ kind (\"transfer\" | \"approve\" | \"mint\" | \"burn\");\n" #
    "  timestamp : nat64 (ns); transfer; approve; mint; burn; fee_collector;\n" #
    "  authorized_mint; authorized_burn }` with exactly one of the first four set;\n" #
    "  the last three are always null. Transfer `{ from; to; spender; amount; fee;\n" #
    "  memo; created_at_time }`, Approve adds `expected_allowance` and\n" #
    "  `expires_at`, Burn has optional `spender`. `fee` is the caller's `tx.fee`,\n" #
    "  else the block's top-level fee.\n" #
    "- `list_subaccounts({ owner; start : opt blob })` -> subaccounts the owner\n" #
    "  used in any block, ascending, strictly after `start`, at most 500 per call.\n" #
    "  The default account is reported as 32 zero bytes.\n" #
    "- Legacy text blocks are included. Amounts and fees of legacy blocks below\n" #
    "  `boundaryIndex` (4 decimals) are converted to current 8-decimal units\n" #
    "  (multiplied by 10_000). Legacy `legacy:index:amount` records carry no\n" #
    "  account and therefore appear in no account's history.\n" #
    "- An all-zero subaccount is the same account as `null`.\n" #
    "- Not provided: `get_blocks`, `get_fee_collectors_ranges` (use\n" #
    "  `icrc3_get_blocks` and `getFeeCollector`).\n\n" #

    "## Supply and fee\n\n" #
    "- There is no mint endpoint. Every purchase mint is capped so total minted\n" #
    "  supply never exceeds 10 000 TTTI-T.\n" #
    "- `burn(from, amount) : BurnResult`: only the owner principal of `from` (others\n" #
    "  trap with `Unauthorized: only the account owner can burn its tokens`). The\n" #
    "  fee account is always refused (`#GenericError { error_code = 2 }`). Also\n" #
    "  refused for 0 (5), below 100 (`#BadBurn`), from the minting account (6), or\n" #
    "  with insufficient balance. Writes a `1burn` block.\n" #
    "- `set_fee(newFee) : { #ok; #err : Text }` (admin, TTTI-T test version only;\n" #
    "  trap `Unauthorized: only admins can set the fee`). Range:\n" #
    "  `get_fee_bounds() = { min; max }`, otherwise `#err`. `get_fee()`,\n" #
    "  `get_max_supply()`.\n\n" #

    "## ICP/USD price\n\n" #
    "- `getIcpPrice() : IcpPrice` (query, never an outcall): `{ usdE8; usdMicro;\n" #
    "  updatedAt; status (#ok/#stale/#unavailable); source\n" #
    "  (#none/#coinbase/#coingecko); stale }`. `stale` is true when the cached\n" #
    "  price is older than 5 minutes or was never fetched. Display only.\n" #
    "- `refreshIcpPrice() : PriceResult` (admin; trap `Unauthorized: only admins\n" #
    "  can refresh the ICP price`) tries Coinbase spot first, then CoinGecko. If\n" #
    "  both fail it returns `#Err(Text)` and keeps the last price.\n" #
    "- Every purchase refreshes the price itself before any ICP is taken. There is\n" #
    "  no fallback rate: if the refresh fails the purchase is refused with\n" #
    "  `#priceUnavailable` and nothing is taken.\n" #
    "- `transform` is the outcall transform callback and is not for clients.\n\n" #

    "## Sale status and details\n\n" #
    "- `getSaleStatus() : SaleStatus` returns `{ maxSupply; totalSupply;\n" #
    "  mintableRemaining; feeAccountBalance; sold; reserved; available\n" #
    "  (mintableRemaining + feeAccountBalance - reserved); complete; minPurchase\n" #
    "  (10_000); tokenPriceUsd (10_000); cyclesFeeBps (100); buyerPriceUsd\n" #
    "  (10_100); salesPaused; priceUsdE8; priceUpdatedAt; priceSource;\n" #
    "  priceAgeSeconds (null = never fetched); maxPriceAgeSeconds (300);\n" #
    "  liveRate }`.\n" #
    "- `getTechnicalDetails() : TechnicalDetails` (public) returns the ledger\n" #
    "  canister ID, token name and symbol, decimals, standards, the ICP ledger\n" #
    "  canister ID, oracle sources, refresh policy, max rate age, price, fee,\n" #
    "  minimum purchase, smallest unit, rounding rule, excess payment handling,\n" #
    "  delivery order, current transfer fee, max and total supply, the fee account\n" #
    "  and its balance.\n" #
    "- `setSalesPaused(Bool)` (admin; trap `Unauthorized: only admins can manage\n" #
    "  the TTTI-T sale`). Idempotent.\n" #
    "- The price and the 1% fee are code constants; nobody can change them.\n\n" #

    "## Purchase acknowledgement (once per principal)\n\n" #
    "- `acceptPurchaseAcknowledgements() : { #ok : PurchaseAcknowledgement; #err :\n" #
    "  #anonymousCaller }` records once that the caller accepted the six purchase\n" #
    "  acknowledgements. Idempotent: a repeat call keeps the first `acceptedAt`.\n" #
    "- `getMyPurchaseAcknowledgement() : { accepted : Bool; acceptedAt : ?Int }`\n" #
    "  (query, never traps; anonymous -> not accepted).\n" #
    "- A purchase by a caller without an acknowledgement is refused with\n" #
    "  `#acknowledgementRequired` before any ICP is taken.\n\n" #

    "## Purchase: `convertDeposit(recipient : ?Account, icpAmount : Nat)`\n\n" #
    "1. On the ICP ledger call `icrc2_approve` with spender\n" #
    "   `{ owner = getCanisterPrincipal(); subaccount = null }` for at least\n" #
    "   `icpAmount` + 10_000 e8s.\n" #
    "2. Call `convertDeposit` as the signed-in buyer. ICP is pulled from the\n" #
    "   caller's default ICP account.\n" #
    "3. Refusals before any ICP is taken (`conversion = null`), in order:\n" #
    "   `#anonymousCaller`, `#acknowledgementRequired`, `#notConfigured`,\n" #
    "   `#invalidAmount` (0), `#salesPaused`, `#saleComplete`; then the rate is\n" #
    "   refreshed (`#priceUnavailable` on failure) and the same checks run again;\n" #
    "   then `#belowMinimum { minimumTtti; requestedTtti }` and `#aboveRemaining {\n" #
    "   maximumTtti = 0; ... }` (everything left is reserved by in-flight\n" #
    "   purchases). A delivery account equal to the fee account or the minting\n" #
    "   account is refused with `#invalidAmount`.\n" #
    "4. TTTI-T = floor(icpE8s * usdE8 * 10^8 / (10_100 * 10^16)) base units,\n" #
    "   capped at `available`. A buyer may take the whole remainder when it is\n" #
    "   below the minimum. Only the ICP cost of the delivered TTTI-T (rounded up)\n" #
    "   is collected; any excess is never pulled.\n" #
    "5. The amount is reserved before the first ledger await (no overselling) and\n" #
    "   released on every failure. ICP is collected with `icrc2_transfer_from` into\n" #
    "   the canister's own account. Ledger refusals return `#approvalMissing {\n" #
    "   allowance }`, `#insufficientIcp { balance }` or `#icpLedgerError`, and\n" #
    "   nothing is taken.\n" #
    "6. Delivery goes to `recipient`, else the stored delivery address, else\n" #
    "   `{ owner = caller; subaccount = null }`: freshly minted first, from the fee\n" #
    "   account only once minting reached the cap. No TTTI-T fee is charged.\n" #
    "7. If delivery fails the ICP is refunded minus 10_000 e8s: `#Err` code\n" #
    "   `#deliveryFailedRefunded` (record `#refunded`) or, if the refund also fails,\n" #
    "   `#deliveryFailedRefundFailed` (record `#refundFailed`, needs manual\n" #
    "   follow-up), both with `conversion = ?<record>`.\n" #
    "8. Success records a `#completed` conversion and returns `#Ok(Conversion)`.\n" #
    "   The collected ICP is then forwarded automatically (see Receiving ICP).\n\n" #
    "`PurchaseResult` is `#Ok(Conversion)` or `#Err({ code; message; conversion })`.\n" #
    "`Conversion` is `{ id; depositor; recipient; icpAmount (e8s collected);\n" #
    "tttiAmount; status; timestamp; priceUsdE8; usedFallback (true only on\n" #
    "historical records); minted; fromCollector; forward; message }`. Purchases\n" #
    "never trap; `message` is user-facing English text.\n\n" #
    "### Purchase retry safety\n\n" #
    "Purchases are NOT idempotent: every successful call is a new purchase, up to\n" #
    "the remaining ICP approval. After a timeout or lost response do not blindly\n" #
    "retry; first check `icrc1_balance_of` of the delivery account or recent\n" #
    "`icrc3_get_blocks` entries crediting it. Refusals with `conversion = null`\n" #
    "(including `#acknowledgementRequired` and `#priceUnavailable`) took nothing\n" #
    "and are safe to retry once the cause is fixed.\n\n" #

    "## Delivery address (optional)\n\n" #
    "- `setDeliveryAddress(principalText) : DeliveryAddressResult` stores\n" #
    "  `{ owner; subaccount = null }` for the caller, replacing any previous one.\n" #
    "  Error codes: `#anonymousCaller`, `#empty`, `#accountIdentifier` (a 64-hex\n" #
    "  account ID was pasted), `#invalidPrincipal`, `#anonymousPrincipal`.\n" #
    "- `getDeliveryAddress() : ?Account`. `clearDeliveryAddress() : Bool` returns\n" #
    "  true when an address was removed. All three are safe to repeat.\n\n" #

    "## Receiving ICP account\n\n" #
    "- `setTreasuryConfig({ icpAccount }) : { #Ok : TreasuryConfig; #Err : Text }`\n" #
    "  (admin; trap `Unauthorized: only admins can manage the treasury`) sets the\n" #
    "  account that receives the ICP of future purchases. It does not move ICP.\n" #
    "  `getTreasuryConfig() : ?TreasuryConfig` (admin). Purchases are refused with\n" #
    "  `#notConfigured` until it is set.\n" #
    "- `getPublicTreasuryInfo() : ?{ icpAccount }` (public, null until set).\n" #
    "- Automatic forwarding: after each successful purchase `icpAmount - 10_000`\n" #
    "  e8s are sent to `icpAccount` (`#notRequired` when it is the canister's own\n" #
    "  account). `forward` is `#notRequired`, `#pending`,\n" #
    "  `#forwarded(icpBlockIndex)` or `#failed(reason)`. A failed forward never\n" #
    "  undoes the buyer's credit; failed forwards are retried automatically after\n" #
    "  the next successful purchase (each marked `#pending` before its ledger\n" #
    "  call). There is no manual forward or withdrawal endpoint.\n" #
    "- `getConversions() : [Conversion]` (admin): the purchase history.\n" #
    "- `getCanisterPrincipal()` (public): the ICRC-2 spender to approve.\n" #
    "  `getCallerIcpBalance()` (update) returns the caller's ICP e8s, 0 on failure.\n\n" #

    "## Other endpoints\n\n" #
    "- `exportBalanceSnapshot() : { exportedAt; totalSupply; decimals; holders }`\n" #
    "  (admin query; trap `Unauthorized: only admins can manage the TTTI-T sale`).\n" #
    "  Each holder is `{ account; balance; deliveryAddress; needsMigration; kind\n" #
    "  (#holder/#feeCollector) }`; zero balances are excluded.\n" #
    "- Wallet setup flow: `getMySetupStatus() : { status : #notStarted |\n" #
    "  #completed | #skipped; updatedAt : ?Int }` (anonymous or unknown ->\n" #
    "  `#notStarted`, null). `setMySetupStatus(#completed | #skipped)` overwrites the\n" #
    "  caller's status (last write wins; safe to repeat).\n" #
    "- Profiles: `getCallerUserProfile() : ?UserProfile`,\n" #
    "  `saveCallerUserProfile({ name })` (overwrite; safe to repeat).\n" #
    "- White paper: `getOriginalWhitePaper() : ?{ blob : ExternalBlob; filename;\n" #
    "  mimeType }` (public; null until published; the blob is an object-storage\n" #
    "  reference). `publishOriginalWhitePaper(document)` (admin; trap\n" #
    "  `Unauthorized: only admins can publish the original white paper`) replaces\n" #
    "  the reference.\n" #
    "- Wallet helper (non-custodial update calls over the fixed registry ICP,\n" #
    "  TTTI-T, ckBTC, ckUSDC): `listTokens`, `getTokenMetadata`, `getBalance`,\n" #
    "  `prepareTransfer` (prepares arguments only; it never submits). Unknown\n" #
    "  ledgers -> `#Err(#UnknownToken)`, unreachable -> `#Err(#LedgerUnavailable)`.\n" #
    "- Data intelligence (OQL): `schema()` and `execute(qJson)`. Controller-only\n" #
    "  entities: `conversion`, `profile`, `icpPrice`, `deliveryAddress`,\n" #
    "  `saleStatus`, `treasuryConfig`, `tttiBalance`, `ledgerBlock`, `allowance`,\n" #
    "  `ledgerState`, `originalWhitePaper`. `setupStatus` is readable by\n" #
    "  controllers and admins. `purchaseAcknowledgement` (pk `user`, `acceptedAt`\n" #
    "  ns) is readable by controllers and admins, and each signed-in user sees\n" #
    "  only their own row. Other callers get no rows.\n\n" #

    "## Polling guidance\n\n" #
    "- Purchases, transfers and approvals are synchronous: the reply is final.\n" #
    "  There is no background job to poll.\n" #
    "- Poll cheap queries (`getSaleStatus`, `getIcpPrice`, `icrc1_balance_of`)\n" #
    "  every 10-30 s at most. The cached price changes only when a purchase or an\n" #
    "  admin refresh runs.\n" #
    "- Follow the block log by calling `icrc3_get_blocks` from the last known\n" #
    "  `log_length`, in pages of up to 100.\n" #
    "- Avoid tight polling of update calls (`getCallerIcpBalance`, wallet\n" #
    "  `getBalance`); they make inter-canister calls.\n\n" #

    "## Gotchas\n\n" #
    "- The charged rate is the one fetched during the purchase, not the cached\n" #
    "  `getIcpPrice` value shown before.\n" #
    "- `getSaleStatus().available` already subtracts in-flight reservations.\n" #
    "- Legacy blocks are text and use 4 decimals below `boundaryIndex`.\n" #
    "- An all-zero subaccount is the same account as `null`.\n" #
    "- Admin endpoints trap (reject) instead of returning `#Err`; ICRC, purchase,\n" #
    "  acknowledgement and delivery-address endpoints return typed errors.\n";
  };
};
