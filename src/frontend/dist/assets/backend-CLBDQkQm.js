import { $ as RemovePairError, A as BtcDepositErrorCode, B as DexToken, C as TTTI_SYMBOL, D as tttiFromIcp, E as parseUnits, F as ComputationResult, G as HistoryToken, H as FeeTier, I as ConversionStatus, J as PoolKind, K as HolderKind, L as DcTrigger, M as BuybackRule, N as BuybackStatus, O as tttiFromToken, P as CollectState, Q as ReconcileError, R as DepositErrorKind, S as TTTI_DIVISOR, T as icpForTtti, U as HistoryFilter, V as DexTransferDirection, W as HistoryKind, X as PoolStatus, Y as PoolSide, Z as PriceSource, _ as RESERVE_FLOOR_E8S, a as CKBTC_LEDGER_CANISTER_ID, at as SettlementLegPurpose, b as TOKEN_NAME, c as CKUSDT_LEDGER_CANISTER_ID, ct as TreasurySource, d as CYCLES_FEE_TEXT, et as ReserveStatus, f as CYCLES_TOP_UP_THRESHOLD, g as PAY_TOKEN_ORDER, h as PAY_TOKENS, i as BUYER_PRICE_USD, it as SetMinimumsError, j as BtcRefundPurpose, k as validateDeliveryAddress, l as CK_FEE_BPS, lt as UserRole, m as MIN_PURCHASE, n as BTC_DEFAULT_DEPOSIT_MIN_SATS, nt as RouteReason, o as CKBTC_MINTER_CANISTER_ID, ot as SweepStatus, p as ICP_DIVISOR, q as PayToken, r as BTC_DEFAULT_MIN_CONFIRMATIONS, rt as RoutedSwapStage, s as CKUSDC_LEDGER_CANISTER_ID, st as TransferKind, t as BTC_DEFAULT_CHECK_FEE_SATS, tt as ReviewError, u as CYCLES_FEE_BPS, ut as Principal, v as SWAP_FEE_LP_PERCENT, w as encodeAccountText, x as TOKEN_PRICE_USD, y as SWAP_FEE_PERMANENT_PERCENT, z as DepositKind } from "./index-lcHXo8KU.js";
//#region src/mocks/backend.ts
var FEE = 100n;
var FEE_BOUNDS = {
	min: 0n,
	max: 10000n
};
var MAX_SUPPLY = TTTI_DIVISOR;
var ICP_LEDGER_FEE = 10000n;
/** TransferReview.token is a DexToken; payment tokens map onto it. */
var DEX_OF_PAY = {
	[PayToken.icp]: DexToken.icp,
	[PayToken.ckbtc]: DexToken.ckbtc,
	[PayToken.ckusdc]: DexToken.ckusdc,
	[PayToken.ckusdt]: DexToken.ckusdt
};
var MOCK_USD_E8 = 1250000000n;
/** TTTI-T base units per whole ICP at the mock price, fee included. */
var MOCK_LIVE_RATE = tttiFromIcp(ICP_DIVISOR, MOCK_USD_E8);
/** validUntil + 5-minute grace, as in the backend. */
var MAX_RATE_AGE_SECONDS = 3900n;
var HOURLY_RATE_TEXT = "The ICP/USD rate is set once an hour from Coinbase, or from CoinGecko if Coinbase is unavailable, and applies to every purchase in that hour. If no valid rate exists, the purchase is refused and no ICP is taken.";
var nowNs = () => BigInt(Date.now()) * 1000000n;
var HOUR_NS = 3600n * 1000000000n;
/** Start of the current hour, in nanoseconds. */
var hourStartNs = () => nowNs() / HOUR_NS * HOUR_NS;
var principalFrom = (seed) => Principal.fromUint8Array(new Uint8Array(Array.from({ length: 29 }, (_, i) => seed * 31 + i & 255)));
var ICP_CANISTER = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
var TTTI_CANISTER = Principal.fromUint8Array(new Uint8Array([
	0,
	0,
	0,
	0,
	0,
	48,
	0,
	18,
	1,
	1
]));
var CALLER = principalFrom(1);
var HOLDER_2 = principalFrom(2);
var HOLDER_3 = principalFrom(3);
var CALLER_ACCOUNT = { owner: CALLER };
/** Canister principal + 'FEE-COLLECTOR-TTTI-T-00000000001' (32 bytes). */
var FEE_COLLECTOR = {
	owner: TTTI_CANISTER,
	subaccount: new TextEncoder().encode("FEE-COLLECTOR-TTTI-T-00000000001")
};
/** Minting account: canister principal with a null subaccount. */
var MINTING_ACCOUNT = { owner: TTTI_CANISTER };
/** Transfers to the minting account are refused without any debit. */
var isMintingAccount = (account) => account.owner.toText() === TTTI_CANISTER.toText() && (!account.subaccount || account.subaccount.every((byte) => byte === 0));
var MINTING_REFUSAL = {
	__kind__: "GenericError",
	GenericError: {
		error_code: 8n,
		message: "Tokens cannot be burned; transfers to the contract address are refused."
	}
};
var MOCK_CONTROLLERS = [principalFrom(9)];
var MOCK_MODULE_HASH = "3f1c9a7e52b04d8e6a1f0c2b7d9e4a5f8c3b1e0d6a2f9c7b4e8d1a0f5c3b2e9a";
/** Canister principal + 'CYCLES-RESERVE-TTTI-T-0000000001' (32 bytes), on the ICP ledger. */
var CYCLES_RESERVE_ACCOUNT = {
	owner: TTTI_CANISTER,
	subaccount: new TextEncoder().encode("CYCLES-RESERVE-TTTI-T-0000000001")
};
var TOP_UP_THRESHOLD = CYCLES_TOP_UP_THRESHOLD;
/** The backend publishes the same rule text as CYCLES_FEE_TEXT. */
var RESERVE_RULE = CYCLES_FEE_TEXT;
var TREASURY_ACCOUNT = {
	owner: HOLDER_3,
	subaccount: new Uint8Array(Array.from({ length: 32 }, (_, i) => i === 31 ? 7 : 0))
};
var STANDARDS = [
	{
		name: "ICRC-1",
		url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1"
	},
	{
		name: "ICRC-2",
		url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2"
	},
	{
		name: "ICRC-3",
		url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3"
	},
	{
		name: "ICRC-10",
		url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-10/ICRC-10.md"
	}
];
var state = {
	salesPaused: false,
	sold: 1250000n,
	fee: FEE,
	feeCollectorBalance: 300n,
	deliveryAddress: null,
	conversions: [],
	/** Last mock ledger block index used by makeConversion. */
	nextBlock: 1200n,
	/** Stored acceptance { acceptedAt; version }; a version-1 record no longer counts. */
	acknowledgement: {
		acceptedAt: nowNs() - 30n * 24n * HOUR_NS,
		version: 1n
	},
	treasuryConfig: { icpAccount: TREASURY_ACCOUNT },
	cyclesBalance: 24820000000000n,
	reserveBalanceE8s: 200000000n,
	lastTopUp: {
		timestamp: nowNs() - 3n * 24n * HOUR_NS,
		icpE8s: 50000000n,
		blockIndex: 18204311n,
		status: {
			__kind__: "notified",
			notified: { cycles: 1910000000000n }
		}
	},
	withdrawals: [],
	btcPurchase: void 0,
	btcWallet: void 0,
	/** sale.reserved: a stale 0.00004 TTTI-T left by an interrupted purchase. */
	reserved: 4000n,
	lastReconciliation: void 0
};
var MOCK_TRACE_MEMO = "TTTI-PC-14";
var MOCK_TOP_UP_MEMO = "TTTI-TPUP-6";
function mockOpenTraces() {
	if (state.salesPaused) return [];
	return [{
		n: 14n,
		token: PayToken.icp,
		memo: new TextEncoder().encode(MOCK_TRACE_MEMO),
		reserved: 2000n,
		buyer: HOLDER_2,
		created_at_time: nowNs() - 40n * 1000000000n,
		amount: ICP_DIVISOR / 4n
	}];
}
function mockPendingTopUp() {
	const createdAt = nowNs() - 2n * HOUR_NS;
	return {
		request: {
			to: { owner: Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai") },
			fee: ICP_LEDGER_FEE,
			from_subaccount: CYCLES_RESERVE_ACCOUNT.subaccount,
			amount: 50000000n
		},
		memo: new TextEncoder().encode(MOCK_TOP_UP_MEMO),
		createdAt,
		created_at_time: createdAt,
		sends: 2n,
		blockIndex: void 0,
		needsReview: false,
		lastError: "The ICP ledger could not be reached (mock)",
		amount: 50000000n,
		outcome: {
			__kind__: "unknown",
			unknown: null
		}
	};
}
function mockUpgradeReadiness() {
	const traces = mockOpenTraces();
	const inFlight = state.salesPaused ? [] : [HOLDER_2];
	return {
		salesPaused: state.salesPaused,
		purchasesInFlightCount: BigInt(inFlight.length),
		purchasesInFlight: inFlight,
		btcLockHeld: false,
		buybacksInFlightCount: 0n,
		buybacksInFlight: [],
		reserveLockBusy: false,
		pendingTopUp: mockPendingTopUp(),
		openTraceCount: BigInt(traces.length),
		openTraces: traces,
		reserved: state.reserved,
		lastReconciliation: state.lastReconciliation,
		bonusClaimsInFlight: [],
		protocolFeeLocks: [],
		dcSendsInFlight: [],
		ownerSendsInFlight: [],
		sweepStatus: mockSweep.status,
		mintFeeClaimsInFlight: [],
		injectionsInFlight: [],
		revenueSendsInFlight: mockOwnerSends.filter((s) => s.source.__kind__ === "mint" && s.status.__kind__ === "pending").map((s) => s.id),
		settlementsInFlight: mockSettlements.filter((s) => s.status.__kind__ === "sending").map((s) => PAY_TOKENS[s.token].symbol),
		dexPaused: mockDexReserve.pause.paused,
		dexPauseReason: mockDexReserve.pause.paused ? mockDexReserve.pause.reason : void 0,
		lastReserveCheckAt: mockDexReserve.lastCheck?.checkedAt,
		lastReserveCheckStatus: mockLastReserveStatus(),
		unresolvedShortfallCount: dexReserveUnresolved(),
		dexOperationsInFlight: [],
		dexReady: !mockDexReserve.pause.paused && dexReserveUnresolved() === 0n
	};
}
/** Same refusal order as the backend: paused, no purchase in flight, no open trace. */
function mockReconcileReserved() {
	const readiness = mockUpgradeReadiness();
	if (!readiness.salesPaused) return {
		__kind__: "err",
		err: ReconcileError.notPaused
	};
	if (readiness.purchasesInFlightCount > 0n) return {
		__kind__: "err",
		err: ReconcileError.purchaseInFlight
	};
	if (readiness.openTraceCount > 0n) return {
		__kind__: "err",
		err: ReconcileError.openTraces
	};
	const reconciliation = {
		previousReserved: state.reserved,
		reconciledAt: nowNs(),
		by: CALLER
	};
	state.reserved = 0n;
	state.lastReconciliation = reconciliation;
	return {
		__kind__: "ok",
		ok: reconciliation
	};
}
var CKBTC_MINTER = Principal.fromText(CKBTC_MINTER_CANISTER_ID);
var MOCK_BTC_DEPOSIT_SATS = 50000n;
var MOCK_REFUND_HELD_SATS = 1200n;
var MOCK_BTC_ADDRESSES = {
	[DepositKind.purchase]: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
	[DepositKind.wallet]: "bc1q9h7garjz4l6dnf0kwz0rmd8gk2lwzkxv5f4u3e"
};
function newTracking(kind) {
	return {
		kind,
		btcAddress: MOCK_BTC_ADDRESSES[kind],
		stage: {
			__kind__: "addressShown",
			addressShown: null
		},
		deposits: [],
		createdAt: nowNs(),
		lastCheckedAt: void 0,
		errorKind: void 0,
		errorMessage: void 0
	};
}
function newEntry(index) {
	return {
		index: BigInt(index),
		stage: {
			__kind__: "depositDetected",
			depositDetected: null
		},
		btcDetectedSats: MOCK_BTC_DEPOSIT_SATS,
		ckbtcMintedSats: 0n,
		ckbtcPendingSats: MOCK_BTC_DEPOSIT_SATS - BTC_DEFAULT_CHECK_FEE_SATS,
		tttiDelivered: 0n,
		refundedSats: 0n,
		conversionId: void 0,
		btcTxids: [`${index.toString(16).padStart(2, "0")}c4f1a9e07b3d52c8e6f19a0b7d4c3e2f1a5b8c9d0e7f6a3b2c1d4e5f6a7b8c9d`],
		ckbtcMintBlockIndex: void 0,
		detectedAt: nowNs(),
		updatedAt: nowNs(),
		errorKind: void 0,
		errorMessage: void 0
	};
}
/** A wallet entry fully minted earlier, for the two-deposit wallet mock. */
function mintedWalletEntry(index, ageNs) {
	const minted = MOCK_BTC_DEPOSIT_SATS - BTC_DEFAULT_CHECK_FEE_SATS;
	return {
		...newEntry(index),
		stage: {
			__kind__: "minted",
			minted: null
		},
		ckbtcMintedSats: minted,
		ckbtcPendingSats: 0n,
		ckbtcMintBlockIndex: 2741093n + BigInt(index),
		detectedAt: nowNs() - ageNs,
		updatedAt: nowNs() - ageNs
	};
}
function closedEntry(kind, entry) {
	switch (entry.stage.__kind__) {
		case "delivered":
		case "refunded": return true;
		case "minted": return kind === DepositKind.wallet;
		case "error": return entry.errorKind === DepositErrorKind.unrecoverable;
		default: return false;
	}
}
function advanceEntry(kind, entry) {
	const next = {
		...entry,
		updatedAt: nowNs()
	};
	const required = BTC_DEFAULT_MIN_CONFIRMATIONS;
	const minted = MOCK_BTC_DEPOSIT_SATS - BTC_DEFAULT_CHECK_FEE_SATS;
	switch (entry.stage.__kind__) {
		case "depositDetected": return {
			...next,
			stage: {
				__kind__: "confirming",
				confirming: {
					current: 2n,
					required
				}
			}
		};
		case "confirming": {
			const current = entry.stage.confirming.current + 2n;
			if (current < required) return {
				...next,
				stage: {
					__kind__: "confirming",
					confirming: {
						current,
						required
					}
				}
			};
			state.nextBlock += 1n;
			return {
				...next,
				stage: {
					__kind__: "minted",
					minted: null
				},
				ckbtcMintedSats: minted,
				ckbtcPendingSats: kind === DepositKind.purchase ? minted : 0n,
				ckbtcMintBlockIndex: 2741000n + state.nextBlock
			};
		}
		case "minted":
		case "pendingRate":
			if (kind === DepositKind.wallet) return next;
			if (entry.index % 2n === 1n) return {
				...next,
				stage: {
					__kind__: "delivered",
					delivered: null
				},
				ckbtcPendingSats: MOCK_REFUND_HELD_SATS,
				tttiDelivered: tttiFromToken(minted - MOCK_REFUND_HELD_SATS, PayToken.ckbtc, MOCK_PAY_USD_E8[PayToken.ckbtc]),
				conversionId: BigInt(state.conversions.length + 1),
				errorKind: DepositErrorKind.refundFailed,
				errorMessage: "ckBTC ledger transfer failed: TemporarilyUnavailable"
			};
			return {
				...next,
				stage: {
					__kind__: "delivered",
					delivered: null
				},
				ckbtcPendingSats: 0n,
				tttiDelivered: tttiFromToken(minted, PayToken.ckbtc, MOCK_PAY_USD_E8[PayToken.ckbtc]),
				conversionId: BigInt(state.conversions.length + 1)
			};
		default: return next;
	}
}
/** Checks with every deposit final before the mock sees a new transfer. */
var MOCK_IDLE_CHECKS_PER_TRANSFER = 3;
var mockIdleChecks = {
	[DepositKind.purchase]: 0,
	[DepositKind.wallet]: 0
};
/**
* Each check advances every open deposit one stage; once all are final, a new
* transfer appears after a few idle checks.
*/
function advanceTracking(tracking) {
	const open = tracking.deposits.some((entry) => !closedEntry(tracking.kind, entry));
	let deposits = tracking.deposits.map((entry) => closedEntry(tracking.kind, entry) ? entry : advanceEntry(tracking.kind, entry));
	if (!open) {
		mockIdleChecks[tracking.kind] += 1;
		if (tracking.deposits.length === 0 || mockIdleChecks[tracking.kind] >= MOCK_IDLE_CHECKS_PER_TRANSFER) {
			mockIdleChecks[tracking.kind] = 0;
			deposits = [newEntry(tracking.deposits.length), ...deposits];
		}
	}
	return {
		...tracking,
		stage: deposits[0]?.stage ?? tracking.stage,
		deposits,
		lastCheckedAt: nowNs(),
		errorKind: deposits[0]?.errorKind,
		errorMessage: deposits[0]?.errorMessage
	};
}
{
	const wallet = newTracking(DepositKind.wallet);
	const current = {
		...newEntry(2),
		stage: {
			__kind__: "confirming",
			confirming: {
				current: 2n,
				required: BTC_DEFAULT_MIN_CONFIRMATIONS
			}
		}
	};
	const unrecoverable = {
		...newEntry(0),
		stage: {
			__kind__: "error",
			error: null
		},
		ckbtcPendingSats: 0n,
		detectedAt: nowNs() - 4n * 24n * HOUR_NS,
		updatedAt: nowNs() - 4n * 24n * HOUR_NS,
		errorKind: DepositErrorKind.unrecoverable,
		errorMessage: "The minter cannot mint ckBTC for this UTXO."
	};
	state.btcWallet = {
		...wallet,
		createdAt: nowNs() - 5n * 24n * HOUR_NS,
		lastCheckedAt: nowNs() - 60000000000n,
		stage: current.stage,
		deposits: [
			current,
			mintedWalletEntry(1, 2n * 24n * HOUR_NS),
			unrecoverable
		]
	};
}
/** Checks without a stored tracking before the mock detects a first deposit. */
var mockUnsavedChecks = {
	[DepositKind.purchase]: 0,
	[DepositKind.wallet]: 0
};
var storedBtcTracking = (kind) => kind === DepositKind.purchase ? state.btcPurchase : state.btcWallet;
/** Address call: the stored tracking, or an unsaved #addressShown one; stores nothing. */
var btcAddressResult = (kind) => ({
	__kind__: "Ok",
	Ok: storedBtcTracking(kind) ?? newTracking(kind)
});
/**
* Check: advances a stored tracking; without one, returns an unsaved tracking
* (deposits = [], lastCheckedAt set) and creates the tracking only once a
* deposit is detected.
*/
function checkBtcResult(kind) {
	const stored = storedBtcTracking(kind);
	if (!stored) {
		mockUnsavedChecks[kind] += 1;
		if (mockUnsavedChecks[kind] < MOCK_IDLE_CHECKS_PER_TRANSFER) return {
			__kind__: "Ok",
			Ok: {
				...newTracking(kind),
				lastCheckedAt: nowNs()
			}
		};
		mockUnsavedChecks[kind] = 0;
	}
	const next = advanceTracking(stored ?? newTracking(kind));
	if (kind === DepositKind.purchase) state.btcPurchase = next;
	else state.btcWallet = next;
	return {
		__kind__: "Ok",
		Ok: next
	};
}
/** Acknowledgement version in force, as in the backend. */
var ACK_VERSION = 2n;
/** Only a record of the version in force counts as accepted. */
function ackAccepted() {
	return state.acknowledgement !== null && state.acknowledgement.version === ACK_VERSION;
}
function ackView() {
	return ackAccepted() && state.acknowledgement !== null ? {
		accepted: true,
		acceptedAt: state.acknowledgement.acceptedAt
	} : { accepted: false };
}
var btcAckRequired = () => ({
	__kind__: "Err",
	Err: {
		code: BtcDepositErrorCode.acknowledgementRequired,
		message: "Accept the purchase acknowledgements before your first purchase."
	}
});
/** Live conversion at the buyer price (1% cycles fee included), floored. */
function liveTtti(icpAmount) {
	return tttiFromIcp(icpAmount, MOCK_USD_E8);
}
/** Fresh minting plus the collected fee account, as in getSaleStatus. */
var mockTotalSupply = () => state.sold + state.feeCollectorBalance;
/** What can still be minted: max(0, cap - totalSupply). */
var mintableRemaining = () => {
	const supply = mockTotalSupply();
	return MAX_SUPPLY > supply ? MAX_SUPPLY - supply : 0n;
};
function saleAvailable() {
	return mintableRemaining() + state.feeCollectorBalance;
}
function makeConversion(icpAmount, recipient) {
	const tttiAmount = liveTtti(icpAmount);
	const mintable = mintableRemaining();
	const minted = tttiAmount < mintable ? tttiAmount : mintable;
	const feeBps = PAY_TOKENS[PayToken.icp].feeBps;
	const feeAmount = icpAmount * feeBps / (10000n + feeBps);
	state.nextBlock += 2n;
	return {
		id: BigInt(state.conversions.length + 1),
		status: ConversionStatus.completed,
		depositor: CALLER,
		feeBps,
		feeAmount,
		netAmount: icpAmount - feeAmount,
		paymentBlock: state.nextBlock - 1n,
		mintBlock: state.nextBlock,
		payToken: PayToken.icp,
		payAmount: icpAmount,
		usedFallback: false,
		priceUsdE8: MOCK_USD_E8,
		minted,
		fromCollector: tttiAmount - minted,
		recipient,
		timestamp: nowNs(),
		tttiAmount,
		icpAmount,
		forward: {
			__kind__: "forwarded",
			forwarded: icpAmount - ICP_LEDGER_FEE
		}
	};
}
{
	const { feeAmount: _fee, netAmount: _net, paymentBlock: _payment, mintBlock: _mint, ...legacy } = makeConversion(ICP_DIVISOR / 4n, CALLER_ACCOUNT);
	state.conversions.push({
		...legacy,
		payAmount: 0n,
		timestamp: nowNs() - 30n * 24n * HOUR_NS
	});
}
state.conversions.unshift(makeConversion(ICP_DIVISOR, CALLER_ACCOUNT));
{
	const feeBps = PAY_TOKENS[PayToken.ckusdt].feeBps;
	const payAmount = 101n * 10n ** BigInt(PAY_TOKENS[PayToken.ckusdt].decimals);
	const feeAmount = payAmount * feeBps / (10000n + feeBps);
	const tttiAmount = TTTI_DIVISOR / 100n;
	state.conversions.unshift({
		...makeConversion(ICP_DIVISOR, CALLER_ACCOUNT),
		payToken: PayToken.ckusdt,
		payAmount,
		feeBps,
		feeAmount,
		netAmount: payAmount - feeAmount,
		priceUsdE8: 100000000n,
		tttiAmount,
		minted: tttiAmount,
		fromCollector: 0n,
		icpAmount: 0n,
		forward: {
			__kind__: "forwarded",
			forwarded: feeAmount - PAY_TOKENS[PayToken.ckusdt].fee
		},
		timestamp: nowNs() - 2n * 24n * HOUR_NS
	});
}
state.conversions.unshift({
	...makeConversion(ICP_DIVISOR / 2n, { owner: HOLDER_2 }),
	depositor: HOLDER_2,
	forward: {
		__kind__: "failed",
		failed: "ICP ledger transfer failed: TemporarilyUnavailable"
	}
});
var reviewPurchase = makeConversion(ICP_DIVISOR / 5n, { owner: HOLDER_3 });
state.conversions.unshift({
	...reviewPurchase,
	depositor: HOLDER_3,
	forward: {
		__kind__: "needsReview",
		needsReview: null
	},
	timestamp: nowNs() - 26n * HOUR_NS
});
var refundPurchase = {
	...makeConversion(ICP_DIVISOR / 10n, { owner: HOLDER_2 }),
	depositor: HOLDER_2,
	status: ConversionStatus.refundReview,
	timestamp: nowNs() - 27n * HOUR_NS
};
state.conversions.unshift(refundPurchase);
var memoHexOf = (text) => Array.from(new TextEncoder().encode(text)).map((b) => b.toString(16).padStart(2, "0")).join("");
function reviewEntry(kind, purchaseId, memoText, amount, destination, sends, lastError) {
	return {
		kind,
		purchaseId,
		token: DexToken.icp,
		memoText,
		memoHex: memoHexOf(memoText),
		createdAtTimeNs: nowNs() - 24n * HOUR_NS,
		amount,
		fee: ICP_LEDGER_FEE,
		destination,
		sends,
		lastError
	};
}
var mockReviews = [
	reviewEntry(TransferKind.FW, reviewPurchase.id, `TTTI-FW-${reviewPurchase.id}`, (reviewPurchase.netAmount ?? reviewPurchase.payAmount) - ICP_LEDGER_FEE, TREASURY_ACCOUNT, 4n, "Call rejected: canister ryjl3-tyaaa-aaaaa-aaaba-cai is stopping (outcome unknown)"),
	reviewEntry(TransferKind.SH, 2n, "TTTI-SH-2", (state.conversions.find((c) => c.id === 2n)?.feeAmount ?? 0n) - ICP_LEDGER_FEE, CYCLES_RESERVE_ACCOUNT, 2n, "Call timed out (outcome unknown)"),
	reviewEntry(TransferKind.RF, refundPurchase.id, `TTTI-RF-${refundPurchase.id}`, refundPurchase.payAmount - ICP_LEDGER_FEE, { owner: HOLDER_2 }, 3n, "Call rejected: canister ryjl3-tyaaa-aaaaa-aaaba-cai is stopping (outcome unknown)"),
	{
		...reviewEntry(TransferKind.PC, 7n, "TTTI-PC-7", ICP_DIVISOR / 4n, { owner: HOLDER_3 }, 0n, ""),
		fee: void 0,
		lastError: void 0,
		block: 18204311n,
		collect: CollectState.confirmed
	},
	{
		...reviewEntry(TransferKind.PC, 8n, "TTTI-PC-8", ICP_DIVISOR / 20n, { owner: HOLDER_2 }, 0n, ""),
		fee: void 0,
		lastError: void 0,
		collect: CollectState.unknown
	},
	{
		kind: TransferKind.BR,
		purchaseId: 12n,
		token: DexToken.ckbtc,
		memoText: "TTTI-BR-12-1",
		memoHex: memoHexOf("TTTI-BR-12-1"),
		createdAtTimeNs: nowNs() - 24n * HOUR_NS,
		amount: MOCK_REFUND_HELD_SATS - PAY_TOKENS[PayToken.ckbtc].fee,
		fee: PAY_TOKENS[PayToken.ckbtc].fee,
		destination: { owner: HOLDER_2 },
		sends: 3n,
		lastError: "Call timed out (outcome unknown)",
		depositIndex: 1n,
		buyer: HOLDER_2,
		refundPurpose: BtcRefundPurpose.excess,
		outcome: {
			__kind__: "unknown",
			unknown: null
		}
	},
	{
		kind: TransferKind.BC,
		purchaseId: 9n,
		token: DexToken.ckbtc,
		memoText: "TTTI-PC-9",
		memoHex: memoHexOf("TTTI-PC-9"),
		createdAtTimeNs: nowNs() - 25n * HOUR_NS,
		amount: 450n,
		fee: PAY_TOKENS[PayToken.ckbtc].fee,
		destination: TREASURY_ACCOUNT,
		sends: 2n,
		lastError: "Call rejected: canister mxzaz-hqaaa-aaaar-qaada-cai is stopping (outcome unknown)",
		depositIndex: 0n,
		buyer: HOLDER_3,
		outcome: {
			__kind__: "unknown",
			unknown: null
		}
	},
	{
		kind: TransferKind.BM,
		purchaseId: 3n,
		token: DexToken.ckbtc,
		amount: 600n,
		sends: 0n,
		depositIndex: 2n,
		buyer: HOLDER_3,
		conversionId: 3n
	}
];
/** Transfers confirmed by the admin, with the ledger block entered. */
var mockArrivedTransfers = [];
/** New attempts opened by Not arrived; the 10-minute timer would send them. */
var mockPendingAttempts = [];
function takeReview(kind, purchaseId) {
	const index = mockReviews.findIndex((r) => r.kind === kind && r.purchaseId === purchaseId);
	if (index >= 0) return mockReviews.splice(index, 1)[0];
	return {
		__kind__: "err",
		err: (kind === TransferKind.FW || kind === TransferKind.RF) && state.conversions.some((c) => c.id === purchaseId) || kind === TransferKind.SH && state.conversions.some((c) => c.id === purchaseId && c.payToken === PayToken.icp) || kind === TransferKind.BB && mockBuybacks.some((b) => b.id === purchaseId) || (kind === TransferKind.DD || kind === TransferKind.DW) && mockDexTransfers.some((t) => t.n === purchaseId) || kind === TransferKind.DQ && mockPairRequests.some((r) => r.id === purchaseId && r.status.__kind__ === "approved") || kind === TransferKind.DC && mockDcSends.some((d) => d.n === purchaseId) || kind === TransferKind.DL && mockBonusClaims.some((c) => c.n === purchaseId) || (kind === TransferKind.OW || kind === TransferKind.SR) && mockOwnerSends.some((s) => s.id === purchaseId) || kind === TransferKind.MF && mockMintFeeClaims.some((c) => c.n === purchaseId) || kind === TransferKind.IR && mockRoutedSwaps.some((s) => s.id === purchaseId) ? ReviewError.notUnderReview : ReviewError.notFound
	};
}
function setForward(purchaseId, forward) {
	state.conversions = state.conversions.map((c) => c.id === purchaseId ? {
		...c,
		forward
	} : c);
}
function setStatus(purchaseId, status) {
	state.conversions = state.conversions.map((c) => c.id === purchaseId ? {
		...c,
		status
	} : c);
}
function mockMarkArrived(kind, purchaseId, block) {
	if (kind === TransferKind.PC || kind === TransferKind.BM) return {
		__kind__: "err",
		err: ReviewError.notApplicable
	};
	const taken = takeReview(kind, purchaseId);
	if ("__kind__" in taken) return taken;
	mockArrivedTransfers.push({
		kind,
		purchaseId,
		block
	});
	if (kind === TransferKind.FW) setForward(purchaseId, {
		__kind__: "forwarded",
		forwarded: block
	});
	if (kind === TransferKind.RF) setStatus(purchaseId, ConversionStatus.refunded);
	if (kind === TransferKind.BB) mockBuybackArrived(purchaseId, block);
	if (kind === TransferKind.DD || kind === TransferKind.DW || kind === TransferKind.DQ) dexMarkArrived(kind, purchaseId, block);
	if (kind === TransferKind.DC || kind === TransferKind.DL) protocolFeeArrived(kind, purchaseId, block);
	if (kind === TransferKind.OW || kind === TransferKind.SR) ownerSendReviewed(purchaseId, block);
	if (kind === TransferKind.MF) mintFeeReviewed(purchaseId, block);
	if (kind === TransferKind.IR) routerSetStatus(purchaseId, {
		__kind__: "reviewedArrived",
		reviewedArrived: block
	});
	return {
		__kind__: "ok",
		ok: null
	};
}
/** Payments that never happened, removed by Not arrived on a PC item. */
var mockRemovedPayments = [];
function mockMarkNotArrived(kind, purchaseId) {
	if (kind === TransferKind.BM) return {
		__kind__: "err",
		err: ReviewError.notApplicable
	};
	const taken = takeReview(kind, purchaseId);
	if ("__kind__" in taken) return taken;
	if (kind === TransferKind.PC) {
		mockRemovedPayments.push(purchaseId);
		return {
			__kind__: "ok",
			ok: null
		};
	}
	if (kind === TransferKind.BC) {
		const paymentIndex = mockReviews.findIndex((r) => r.kind === TransferKind.PC && r.purchaseId === purchaseId);
		if (paymentIndex >= 0) mockReviews.splice(paymentIndex, 1);
		mockRemovedPayments.push(purchaseId);
		return {
			__kind__: "ok",
			ok: null
		};
	}
	if (kind === TransferKind.BB) {
		mockBuybackNotArrived(purchaseId);
		return {
			__kind__: "ok",
			ok: null
		};
	}
	if (kind === TransferKind.IR) {
		routerSetStatus(purchaseId, {
			__kind__: "reviewedNotArrived",
			reviewedNotArrived: null
		});
		return {
			__kind__: "ok",
			ok: null
		};
	}
	if (kind === TransferKind.DD || kind === TransferKind.DW) {
		dexMarkNotArrived(kind, purchaseId);
		return {
			__kind__: "ok",
			ok: null
		};
	}
	const attempt = mockPendingAttempts.filter((a) => a.kind === kind && a.purchaseId === purchaseId).length + 2;
	mockPendingAttempts.push({
		kind,
		purchaseId,
		memoText: kind === TransferKind.DQ ? dexDqMemo(purchaseId, attempt) : `TTTI-${kind}-${purchaseId}-${attempt}`,
		createdAtTimeNs: nowNs()
	});
	if (kind === TransferKind.FW) setForward(purchaseId, {
		__kind__: "pending",
		pending: null
	});
	if (kind === TransferKind.DQ) dexMarkNotArrived(kind, purchaseId);
	if (kind === TransferKind.DC || kind === TransferKind.DL) protocolFeeNotArrived(kind, purchaseId);
	if (kind === TransferKind.OW || kind === TransferKind.SR) ownerSendReviewed(purchaseId, null);
	if (kind === TransferKind.MF) mintFeeReviewed(purchaseId, null);
	return {
		__kind__: "ok",
		ok: null
	};
}
/** Refunds done by hand by the admin (RF, PC and BM), with the ledger block. */
var mockManualRefunds = [];
function mockMarkRefundedManually(kind, purchaseId, block) {
	if (kind !== TransferKind.RF && kind !== TransferKind.PC && kind !== TransferKind.BM) return {
		__kind__: "err",
		err: ReviewError.notApplicable
	};
	const taken = takeReview(kind, purchaseId);
	if ("__kind__" in taken) return taken;
	mockManualRefunds.push({
		kind,
		purchaseId,
		block
	});
	if (kind === TransferKind.RF) setStatus(purchaseId, ConversionStatus.refunded);
	return {
		__kind__: "ok",
		ok: null
	};
}
var MOCK_API_DOC = [
	"# TTTI-T backend API (simulated contract)",
	"",
	"## Purchase acknowledgements",
	"- Acceptances are stored as { acceptedAt; version }; the version in force is 2 and records from before the change are version 1.",
	"- getMyPurchaseAcknowledgement() : query -> PurchaseAcknowledgement { accepted; acceptedAt } — accepted only for a version-2 record.",
	"- acceptPurchaseAcknowledgements() -> records version 2 (an existing version-2 record is kept unchanged).",
	"- A missing or version-1 record is refused with #acknowledgementRequired by the purchase, getBtcPurchaseAddress() and checkBtcPurchaseDeposit() until accepted again.",
	"",
	"## Transfer retries (lib/retry.mo)",
	"Every outgoing transfer is an attempt recorded before the first await: number, memo, created_at_time and the full request.",
	"Memos are TTTI-<prefix>-<n> or TTTI-<prefix>-<n>-<m> (32 bytes at most, no principal, n global); prefixes PC, RF, FW, SH, BB, BR.",
	"Ok or #Duplicate means sent; Err is a known failure; a reject or trap leaves the outcome unknown until an Ok, a #Duplicate or the admin's check.",
	"The same request is resent unchanged for 23 h, then the transfer becomes #needsReview. Only a new attempt changes destination, amount or fee, with a new memo and a new created_at_time.",
	"Treasury forwards (FW) and reserve shares (SH) are sent by a 10-minute timer, re-armed on every install and upgrade. A zero-amount forward is #notRequired.",
	"Purchase refunds (RF, memo TTTI-RF-<n>) are retried only when the balance covers the amount; success sets the purchase #refunded, an unknown outcome after 23 h sets it #refundReview.",
	"A purchase trace (memo TTTI-PC-<n>) is written before the collect await; an unknown collect outcome or a trap after the debit moves it to the payments to refund.",
	"",
	"## Buyback escrow (lib/buyback.mo)",
	"- Buybacks are optional and limited; they depend on available funds and on the funder's willingness. For now only the creator funds buybacks.",
	"- Bought-back TTTI-T go to the funder, who pays with their own money; they are never pre-mined or pre-allocated.",
	"- New buybacks keep the TTTI-T in the contract's holding account until the payout succeeds, then release them to the funder. Cancel is possible when every payout attempt is refused by the ledger; otherwise cancelling waits for the admin's check. A buyback cannot be undone once the payout has succeeded. Legacy buybacks sent the TTTI-T to the funder directly.",
	"- quoteBuyback(massToken, percent, receiveToken) -> Result<BuybackQuote, BuybackError> — tttiTransferFee is the pull fee, tttiEscrowFee the second TTTI-T fee paid by the escrow on release or cancel; tttiAllowanceRequired = tttiAmount + 2 TTTI-T fees. The mass-token ledger fee stays deducted from the amount returned.",
	"- requestBuyback(massToken, percent, receiveToken, fromSubaccount) -> Result<Buyback, BuybackError> — the TTTI-T go from the buyer to the escrow subaccount; the payout attempt (memo TTTI-BB-<n>-<attempt>, created_at_time) is recorded before it is sent in the mass token. Success: TTTI-T released to the funder (releaseBlock), #completed; otherwise #payoutFailed with the attempt outcome.",
	"- retryBuybackPayout(id) -> Result<Buyback, BuybackError> — resends the latest attempt unchanged within 23 h when its outcome is unknown; after a known Err opens the next attempt.",
	"- cancelBuyback(id) -> Result<Buyback, BuybackError> — buyer or admin, under the buyback lock, only on a non-legacy #payoutFailed buyback whose every attempt got an Err: returns tttiAmount from the escrow to the buyer (cancelBlock), #cancelled. Errors: #notCancellable, #attemptUnknown, #attemptArrived, #notAuthorized, #cancelFailed.",
	"- markBuybackCancelled(id, block) -> Result<Buyback, BuybackError> — admin only, legacy buybacks only (#notLegacy otherwise), refused with #attemptArrived when an attempt arrived: records the admin's TTTI-T block as cancelBlock, #cancelled.",
	"- Buyback adds tttiEscrowFee, payoutAttempts ({ from; attempt }), releaseBlock, cancelBlock and legacy; BuybackStatus adds #cancelled; BuybackError adds #releaseFailed.",
	"",
	"## Bitcoin deposits",
	"- getBtcPurchaseAddress(), getBtcWalletAddress() and getBtcWalletAddressFor(owner) (unsigned) -> BtcDepositResult — #Ok with the stored tracking, or an unsaved #addressShown tracking (deposits = []); they store nothing. Errors: #anonymousCaller, #acknowledgementRequired (purchase only), #minterUnavailable.",
	"- checkBtcPurchaseDeposit(), checkBtcWalletDeposit() and checkBtcWalletDepositFor(owner) -> BtcDepositResult — no deposit yet: #Ok with an unsaved tracking (#addressShown, deposits = [], lastCheckedAt set). A tracking is created only when a check detects a deposit; it then drives the progress. Purchase errors add #purchaseInProgress.",
	"- getMyBtcDeposits() : { purchase; wallet } and getBtcWalletDepositsFor(owner) : ?DepositTracking — null until a check detected a deposit.",
	"- The 600 s task watches only the stored trackings: purchases first, then recently active ones.",
	"",
	"## Upgrade readiness (admin only)",
	"- getUpgradeReadiness() : query -> UpgradeReadiness — sales pause, purchases in flight, BTC lock, buybacks in flight, reserve lock, pending cycles top-up attempt, open purchase traces, reserved and the last reconciliation. Non-admin callers trap.",
	"- reconcileReserved() -> Result<ReservedReconciliation, ReconcileError> — sets sale.reserved to 0 and keeps the previous value, date and caller; refused with #notAdmin, #notPaused, #purchaseInFlight or #openTraces.",
	"- requestBuyback, retryBuybackPayout and cancelBuyback return #salesPaused while sales are paused.",
	"",
	"## DEX reserve check and pause (lot 6)",
	"- runDexReserveCheck() -> Result<ReserveCheck, DexReserveError> — admin update: compares, per DEX token, the internal total (user balances available + reserved, pool reserves) with the ledger total. ReserveCheck { checkedAt; results [{ token; internalTotal; ledgerTotal; difference = ledgerTotal - internalTotal; status #ok | #surplus | #shortfall }]; lastSuccessAt; error { message; at } }. Nothing is corrected automatically. A #shortfall pauses the DEX and records a Mismatch { id; at; token; internalTotal; ledgerTotal }.",
	"- resumeDex() -> Result<DexPauseView, DexReserveError> — admin update: refused with #notPaused when the DEX is not paused and with #checkFailed(text) while a shortfall remains in the last check. DexPauseView { paused; reason { token; internalTotal; ledgerTotal; at }; resumed { by; at } }.",
	"- getDexReserveStatus() : query -> Result<DexReserveStatus, DexReserveError> — admin: { lastCheck; unresolvedShortfallCount; checkInProgress; pause; history [Mismatch] }.",
	"- getDexPauseStatus() : query -> PublicDexPause { paused; reasonToken } — public.",
	"- DexReserveError: #unauthorized, #checkInProgress, #notPaused, #checkFailed(text).",
	"- While the DEX is paused, swap, routedSwap, depositToDex and addLiquidity are refused with a paused error; withdrawFromDex and removeLiquidity still work. Sales and minting are not paused.",
	"- UpgradeReadiness adds dexPaused, dexPauseReason, lastReserveCheckAt, lastReserveCheckStatus, unresolvedShortfallCount, dexOperationsInFlight and dexReady.",
	"- The simulated contract finds a shortfall on ICP at every second check, seen by two consecutive checks and then repaired, so the pause and resume paths can be exercised.",
	"",
	"## Review (admin only)",
	"- listTransfersToReview() : query -> [TransferReview] — FW, SH and RF under review, every PC payment to refund, BR BTC refunds to verify (id = BR attempt number), BC BTC cost sends to the treasury to verify (id = trace number), BM delivery-failure costs to refund by hand (id = conversion id) and BB buyback payments to verify plus legacy #payoutFailed buybacks (id = buyback id); kind, purchaseId, token, memoText, memoHex, createdAtTimeNs, amount, fee, destination (the buyer for PC), sends, lastError, block (when known), collect (PC: #confirmed or #unknown), buyer, depositIndex, conversionId, refundPurpose (BR: #excess, #fullRefund or #deliveryFailedExcess), outcome (BR/BC).",
	"- markTransferArrived(kind, purchaseId, block) -> ReviewResult — records the ledger block for FW, SH, RF, BR, BC or BB (RF sets the purchase #refunded; BB sets the payout block, releases the escrow and completes the buyback); PC and BM return #notApplicable.",
	"- markTransferNotArrived(kind, purchaseId) -> ReviewResult — FW, SH, RF or BR: opens a new attempt sent by the timer; BC: removes the cost send and its payment to refund, and the deposit is converted again later by the timer; PC: removes a payment that never happened; BB: the latest payment attempt becomes a known failure, so the buyer can retry or cancel; BM returns #notApplicable.",
	"- markRefundedManually(kind, purchaseId, block) -> ReviewResult — RF, PC or BM only: records the item as refunded with the block and removes it from the list; FW, SH, BR and BC return #notApplicable.",
	"- ReviewError: #notAdmin, #notFound, #notUnderReview, #notApplicable.",
	"- ConversionStatus adds #refundReview: refund outcome unknown after 23 h.",
	"",
	"## DEX balances (lot 2)",
	"- Per-user deposit subaccount: [0xDD, principal length, principal bytes, zero padding] (32 bytes), recomputable by anyone, no secret.",
	"- getDexTokens() : [DexTokenInfo] — TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT with ledger, decimals, fee, minimumDeposit and minimumWithdrawal.",
	"- getDexDepositAccount(owner) : DexAccount; getDexPoolAccount(poolId) : ?DexAccount.",
	"- getDexBalances(owner) : [DexBalanceView] — public, one row per token with available and reserved; getDexTransfers(owner) : [DexTransferView] — public.",
	"- depositToDex({ token; amount }) — DD: icrc2_transfer_from of amount (the user approves amount plus the ledger fee), memo TTTI-DD-<n> with created_at_time; credits available. Errors: #anonymous, #amountTooSmall, #transferInProgress, #insufficientAllowance, #insufficientFunds, #ledgerError.",
	"- withdrawFromDex({ token; amount }) — DW: available -> reserved, transfer of amount minus the ledger fee to the owner, memo TTTI-DW-<n>; Ok: final debit, Err: given back. Errors: #anonymous, #amountTooSmall, #insufficientBalance, #transferInProgress, #ledgerError.",
	"- PairRequestView.refundStatus: #none, #inProgress, #needsReview or #refunded(block); the DQ refund of an approved request uses memo TTTI-DQ-<pair request id> (the request number, not a transfer counter); renewed attempts append -<m>. The deposit of a refused request is counted once as TTTI-T feeding the protocol liquidity (mockRefusedPairDeposits, a per-request flag plus a running total); pending or approved requests add nothing and no TTTI-T is created.",
	"- To review adds DD, DW (id = transfer n) and DQ (id = request id). Arrived: DD credits, DW final debit, DQ #refunded. Not arrived: DD nothing credited, DW given back, DQ new attempt.",
	"",
	"## DEX liquidity and swaps (lot 3)",
	"- PoolStatus: #filling, #active or #removed. An approved pool starts #filling with zero reserves and shares; several users add liquidity while it fills. Swaps stay closed until the reserves total 100 USD, both sides combined; the pool opens (#active) as soon as that value is reached. Liquidity positions are public and linked to the identifier on TTTI: principal, shares, amounts, lock and unlock date are public.",
	"- USD value: TTTI-T at a fixed 10,000 USD; ICP, ckBTC, ckUSDC and ckUSDT at the hourly stored rate, valid 1 h plus 5 minutes. Missing or expired rate: no opening, gauge valueAvailable = false (value momentarily unavailable).",
	"- PoolView adds reserve0, reserve1, totalShares, lockedShares, protocolFee0, protocolFee1 and gauge : UsdGauge { currentUsdE8; targetUsdE8; remainingUsdE8; valueAvailable; missingRate }.",
	"- quoteAddLiquidity({ poolId; side; amount; counterAmount }) -> AddLiquidityQuote — first deposit: counterAmount required, fixes the ratio, at least 10 times the minimum locked liquidity; shares = floor(sqrt(A x B)) minus the minimum shares locked to the contract forever. Later deposits follow the reserve ratio (counter amount rounded up); counterAmount, when given, is the maximum accepted.",
	"- addLiquidity({ poolId; side; amount; counterAmount; lockDurationNs }) -> AddLiquidityResult — from internal balances; one position per add, locked 24 h minimum, 5 years maximum. Errors: #anonymous, #poolNotFound, #poolRemoved, #minimumsNotSet, #unsupportedToken, #zeroAmount, #counterAmountRequired, #insufficientBalance, #belowMinimum, #ratioMismatch, #lockTooShort, #lockTooLong, #zeroShares, #operationInProgress.",
	"- removeLiquidity(positionId) -> RemoveLiquidityResult — owner only, after unlockAt, or at any time on a removed pair; pro rata amounts (rounded down) credited to internal balances.",
	"- extendLock(positionId, newUnlockAt) -> PositionView — owner only; never shorter, at most creation date + 5 years (lockTooLong carries that maximumUnlockAt).",
	"- getDexPosition(positionId) : ?PositionView; listPoolPositions(poolId) and listDexPositionsOf(owner) : [PositionView] — public, linked to the identifier on TTTI (principal, shares, amounts, lock, unlockAt, isCreator). Creator/admin positions follow the same rules; no admin function acts on other positions.",
	"- quoteSwap(poolId, tokenIn, amountIn, slippageBps) -> SwapQuote and swap(poolId, tokenIn, amountIn, minAmountOut, deadline) -> SwapResult — constant product on an open pool, from internal balances; fee 0.3 % for the 7 starting pairs (0.05 / 0.3 / 1 % tiers for added pairs), rounded up; 70 % stays in the reserves for LPs, 30 % becomes permanent liquidity in the same pool (counted in protocolFee0/1). The only yield mentioned is the observed yield, meaning the fees actually earned, recorded as a fact. Deadline at most 5 minutes after the call. Errors: #poolFilling (with the gauge), #poolRemoved, #slippageExceeded, #deadlineExceeded, #deadlineTooFar, #invalidSlippage, #insufficientBalance, #insufficientLiquidity, #tokenNotInPool, #zeroAmount.",
	"",
	"## Cycles autonomy and protocol liquidity (lot 4)",
	"- The cycles reserve has no withdrawal path. CyclesStatus has no excess or withdrawal fields. setTreasuryConfig and setPayTokenAccount are removed.",
	"- getCyclesStatus() : CyclesStatus (public) — topUpThreshold is 20 T cycles: below it, reserve ICP is converted into cycles through the Cycles Minting Canister; the reserve is kept at 2 ICP.",
	"- getCyclesAutonomy() : AutonomyView (admin) — cycles balance, reserve ICP and its cycles estimate at the CMC rate, 7- and 30-day average consumption per day, autonomy in days (target 90), sample count and oldest sample.",
	"- Read-only history: getCyclesShare(), getCyclesShareHistory(), getLastWeeklyAllocation(), listWeeklyAllocations() and listDcBatches() keep past records; no new share change, weekly allocation or DC batch is created.",
	"- getMintTreasuryAccounts() : [MintTreasuryAccount] (admin) — the former internal MINT-TREASURY-<token> subaccounts, read-only; their owner share was settled once to the receiving wallets; legacyExternalAccount is the old admin-set account.",
	"- Native swap fees: 70 % stays in the reserves for liquidity providers, 30 % is added as permanent liquidity in the same pool; nothing goes to cycles and nothing is converted to ICP.",
	"- getProtocolLiquidity() : [ProtocolLiquidityView] (public) — protocol-owned shares per pool, counted in totalShares with no position and locked forever: current amounts, the parts from fees and from the treasury, last addition.",
	"- getMyLpBonus() : LpBonusView (caller) and claimLpBonus() -> ClaimBonusResult — bonuses already earned stay claimable (memo TTTI-DL-<n>); swap fees credit no new bonus. Errors: #anonymous, #nothingToClaim, #belowMinimum { minimumE8s }, #claimInProgress.",
	"",
	"## Mint revenue: direct sends (OW), fee account and settlement (ST)",
	"- A mint is paid 101 for 100. At each mint the 100/101 share is sent directly, in the paid token, to the receiving wallet the admin configured for that token, ledger fee deducted (memo TTTI-OW-<n>, lib/retry.mo rules; an unknown outcome goes to To review). BTC mints follow ckBTC. Nothing accumulates in the contract and there is no withdraw endpoint.",
	"- A mint with a token that has no receiving wallet is refused with #receivingWalletNotConfigured { token } before any funds are taken.",
	"- setReceivingWallet(token, account) -> ReceivingWalletResult (admin) — owner principal plus optional 32-byte subaccount. Errors: #notAdmin, #anonymousOwner, #invalidSubaccount, #contractAccount. getReceivingWallets() -> ReceivingWalletsResult (admin) — per token: wallet, accountText, setAt, setBy.",
	"- The 1/101 mint fee stays in a dedicated contract fee account that cannot be withdrawn. getMintFeeAccount() -> FeeAccountResult (admin) — owner, subaccountHex, accountText, readAt and per token: balance, received, redistributedToLps, setAside, injected.",
	"- getSettlementStatus() -> SettlementStatusResult (admin) — one-time settlement per token: the accumulated revenue and the legacy mint-treasury owner share (minus past withdrawals) are sent to the receiving wallet; legacy and pending fees are moved once to the fee account; LP credits are unchanged. Status #pendingWallet, #sending, #sent([block]), #toReview or #failed(text); legs with purpose #ownerAccumulated, #ownerMintTreasury, #feePending or #feeLegacy, amount, destination, memoText (TTTI-ST-<n>), status and block.",
	"- listAdminHistory(filter, token, offset, limit) -> HistoryResult (admin) — one history, newest first, with total for pagination. filter: #all, #revenueSent, #destination, #swap, #liquidity, #mintDeposit, #buyback, #refund; token: optional ICP, TTTI-T, ckBTC, ckUSDC or ckUSDT. Row: id, kind, token, amount, status, detail, counterparty, memo, block, timestamp. Errors: #notAdmin.",
	"- getOwnerAccumulated() : [OwnerAccumulated] (admin); listOwnerSends(offset, limit) : OwnerSendPage and listTreasuryWithdrawals(offset, limit) (admin) — read-only history of past sends (source #mint(id), #accumulated, #treasurySweep, #withdrawal { by, from }, #settlement { from }).",
	"",
	"## Mint fee halves (MF, set-aside amounts, injections)",
	"- The 1/101 mint fee is split in two halves in the paid token, for the lowest-liquidity TTTI-T pair of that token.",
	"- Half A goes to that pair's liquidity providers pro rata; when the pair has none, it is set aside. getMyMintFees() : MintFeeLpView (caller) — balances { token; claimable; claimed } and claims.",
	"- claimMintFee(token) -> ClaimMintFeeResult — sends the whole claimable amount of that token (memo TTTI-MF-<n>). Errors: #anonymous, #nothingToClaim, #belowLedgerFee { fee }, #claimInProgress.",
	"- Half B is set aside until worth 0.001 TTTI-T (10 USD), then 50 % is swapped into TTTI-T (ICPSwap, then native pools) at bounded slippage and added with the other 50 % as permanent liquidity. A missing or expired rate waits. No TTTI-T is created for pools.",
	"- getSetAsideAmounts() : [SetAsideView] (public) — token, amount, valueUsdE8, thresholdUsdE8, totalReceived, totalInjected, lastInjectionAt, targetPoolId.",
	"- listLiquidityInjections(offset, limit) : InjectionPage (public) — newest first; token, poolId, venue (#native(poolId) or #icpswap(principal)), amountIn, swapAmountIn, pairAmountIn, minTttiOut, tttiReceived, used0, used1, liquidityShares, status (#swapping, #addingLiquidity, #completed, #needsReview, #failed).",
	"",
	"## To review",
	"- To review adds OW (id = owner send id), SR (id = past sweep send id), ST (id = settlement leg n) and MF (id = claim n), next to the past DC and DL items. Arrived records the block; Not arrived opens a new attempt sent by the timer; markRefundedManually returns #notApplicable.",
	"- listTransfersToReviewFiltered({ kinds; token }) : [TransferReview] (admin) — the same list restricted to the given kinds (empty = all) and optional token."
].join("\n");
function purchaseError(code, message) {
	return {
		__kind__: "Err",
		Err: {
			code,
			message
		}
	};
}
function mockPurchase(recipient, icpAmount) {
	if (!ackAccepted()) return purchaseError({
		__kind__: "acknowledgementRequired",
		acknowledgementRequired: null
	}, "Accept the purchase acknowledgements before your first purchase.");
	if (icpAmount <= 0n) return purchaseError({
		__kind__: "invalidAmount",
		invalidAmount: null
	}, "Enter an amount greater than 0.");
	if (state.salesPaused) return purchaseError({
		__kind__: "salesPaused",
		salesPaused: null
	}, "Sales are paused.");
	const noWallet = walletNotConfigured(PayToken.icp);
	if (noWallet) return noWallet;
	const remaining = saleAvailable();
	if (remaining <= 0n) return purchaseError({
		__kind__: "saleComplete",
		saleComplete: null
	}, "Sale complete.");
	const requested = liveTtti(icpAmount);
	if (requested < 10000n) return purchaseError({
		__kind__: "belowMinimum",
		belowMinimum: {
			minimumTtti: MIN_PURCHASE,
			requestedTtti: requested
		}
	}, "The minimum purchase is 0.0001 TTTI-T (1.01 USD).");
	if (requested > remaining) return purchaseError({
		__kind__: "aboveRemaining",
		aboveRemaining: {
			token: PayToken.icp,
			maximumPayAmount: icpForTtti(remaining, MOCK_USD_E8),
			maximumTtti: remaining,
			requestedTtti: requested
		}
	}, "Only the remaining TTTI-T can be purchased.");
	const conversion = makeConversion(icpAmount, recipient ?? state.deliveryAddress ?? CALLER_ACCOUNT);
	state.feeCollectorBalance -= conversion.fromCollector;
	state.sold += conversion.tttiAmount;
	state.conversions.unshift(conversion);
	recordMintRevenue(PayToken.icp, conversion.id, conversion.netAmount ?? icpAmount - (conversion.feeAmount ?? 0n), conversion.feeAmount ?? 0n);
	return {
		__kind__: "Ok",
		Ok: conversion
	};
}
/** Same refusal as the backend: no receiving wallet for the paid token, before any funds are taken. */
function walletNotConfigured(token) {
	if (mockReceivingWallets[token].wallet) return null;
	return purchaseError({
		__kind__: "receivingWalletNotConfigured",
		receivingWalletNotConfigured: { token }
	}, `Minting with ${PAY_TOKENS[token].symbol} is not available yet: no receiving wallet is configured for this token.`);
}
/** Hourly rate fetched at the start of the current hour, valid one hour. */
var mockPrice = () => {
	const fetchedAt = hourStartNs();
	return {
		usdE8: MOCK_USD_E8,
		source: PriceSource.coinbase,
		fetchedAt,
		validUntil: fetchedAt + HOUR_NS,
		usable: true,
		lastSuccessAt: fetchedAt,
		lastError: {
			message: "coinbase: HTTP 503 Service Unavailable",
			at: fetchedAt - 2n * HOUR_NS
		}
	};
};
var LEGACY_BOUNDARY = 3n;
var MAX_BLOCKS_PER_CALL = 100n;
var vNat = (Nat) => ({
	__kind__: "Nat",
	Nat
});
var vText = (Text) => ({
	__kind__: "Text",
	Text
});
var vBlob = (Blob) => ({
	__kind__: "Blob",
	Blob
});
var vMap = (Map) => ({
	__kind__: "Map",
	Map
});
var vAccount = (account) => ({
	__kind__: "Array",
	Array: account.subaccount ? [vBlob(account.owner.toUint8Array()), vBlob(account.subaccount)] : [vBlob(account.owner.toUint8Array())]
});
function encodeLeb128(value) {
	const out = [];
	let rest = value;
	do {
		const byte = Number(rest & 127n);
		rest >>= 7n;
		out.push(rest > 0n ? byte | 128 : byte);
	} while (rest > 0n);
	return out;
}
function encodeSleb128(value) {
	const out = [];
	let rest = value;
	for (;;) {
		const byte = Number(rest & 127n);
		rest >>= 7n;
		const done = rest === 0n && (byte & 64) === 0 || rest === -1n && (byte & 64) !== 0;
		out.push(done ? byte : byte | 128);
		if (done) return out;
	}
}
async function sha256(bytes) {
	const copy = new Uint8Array(bytes);
	return new Uint8Array(await crypto.subtle.digest("SHA-256", copy));
}
function concat(parts) {
	const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
	let offset = 0;
	for (const part of parts) {
		out.set(part, offset);
		offset += part.length;
	}
	return out;
}
function compareBytes(a, b) {
	const len = Math.min(a.length, b.length);
	for (let i = 0; i < len; i++) if (a[i] !== b[i]) return a[i] - b[i];
	return a.length - b.length;
}
/** ICRC-3 representation-independent hash of a Value. */
async function hashValue(value) {
	switch (value.__kind__) {
		case "Nat": return sha256(new Uint8Array(encodeLeb128(value.Nat)));
		case "Int": return sha256(new Uint8Array(encodeSleb128(value.Int)));
		case "Text": return sha256(new TextEncoder().encode(value.Text));
		case "Blob": return sha256(value.Blob);
		case "Array": return sha256(concat(await Promise.all(value.Array.map(hashValue))));
		case "Map": {
			const pairs = await Promise.all(value.Map.map(async ([key, inner]) => concat([await sha256(new TextEncoder().encode(key)), await hashValue(inner)])));
			pairs.sort(compareBytes);
			return sha256(concat(pairs));
		}
	}
}
/** Builds each block value given the parent hash (legacy Text builders ignore it). */
var BLOCK_BUILDERS = [
	(ts) => vText(`3:${CALLER.toText()}:2500:${ts}`),
	(ts) => vText(`1:${CALLER.toText()}:${HOLDER_2.toText()}:1000:1:${ts}`),
	(ts) => vText(`4:${HOLDER_2.toText()}:50:${ts}`),
	(ts) => vText(`3:${CALLER.toText()}:500000:${ts}`),
	(ts) => vText(`1:${CALLER.toText()}:${HOLDER_2.toText()}:150000:${FEE}:${ts}`),
	(ts, phash) => vMap([
		["btype", vText("1mint")],
		["ts", vNat(ts)],
		["phash", vBlob(phash ?? /* @__PURE__ */ new Uint8Array(32))],
		["tx", vMap([["to", vAccount(CALLER_ACCOUNT)], ["amt", vNat(250000n)]])]
	]),
	(ts, phash) => vMap([
		["btype", vText("1xfer")],
		["ts", vNat(ts)],
		["fee", vNat(FEE)],
		["fee_col", vAccount(FEE_COLLECTOR)],
		["phash", vBlob(phash ?? /* @__PURE__ */ new Uint8Array(32))],
		["tx", vMap([
			["from", vAccount(CALLER_ACCOUNT)],
			["to", vAccount({ owner: HOLDER_2 })],
			["amt", vNat(100000n)]
		])]
	]),
	(ts, phash) => vMap([
		["btype", vText("2approve")],
		["ts", vNat(ts)],
		["fee", vNat(FEE)],
		["fee_col", vAccount(FEE_COLLECTOR)],
		["phash", vBlob(phash ?? /* @__PURE__ */ new Uint8Array(32))],
		["tx", vMap([
			["from", vAccount(CALLER_ACCOUNT)],
			["spender", vAccount({ owner: HOLDER_3 })],
			["amt", vNat(50000n)],
			["expected_allowance", vNat(0n)],
			["expires_at", vNat(ts + 7n * 24n * 3600n * 1000000000n)]
		])]
	]),
	(ts, phash) => vMap([
		["btype", vText("1burn")],
		["ts", vNat(ts)],
		["phash", vBlob(phash ?? /* @__PURE__ */ new Uint8Array(32))],
		["tx", vMap([["from", vAccount({ owner: HOLDER_2 })], ["amt", vNat(20000n)]])]
	]),
	(ts, phash) => vMap([
		["btype", vText("1xfer")],
		["ts", vNat(ts)],
		["fee", vNat(0n)],
		["phash", vBlob(phash ?? /* @__PURE__ */ new Uint8Array(32))],
		["tx", vMap([
			["from", vAccount(FEE_COLLECTOR)],
			["to", vAccount(CALLER_ACCOUNT)],
			["amt", vNat(300n)]
		])]
	]),
	(ts, phash) => vMap([
		["btype", vText("1xfer")],
		["ts", vNat(ts)],
		["fee_col", vAccount(FEE_COLLECTOR)],
		["phash", vBlob(phash ?? /* @__PURE__ */ new Uint8Array(32))],
		["tx", vMap([
			["from", vAccount({ owner: HOLDER_2 })],
			["to", vAccount({ owner: HOLDER_3 })],
			["amt", vNat(12345n)],
			["fee", vNat(FEE)],
			["memo", vBlob(new TextEncoder().encode("Immortal #42"))],
			["created_at_time", vNat(ts - 1000000000n)]
		])]
	])
];
var blockLogPromise = null;
/** Lazily builds the sample log so phash values are real SHA-256 hashes. */
function sampleBlockLog() {
	blockLogPromise ??= (async () => {
		const base = nowNs() - 3n * 24n * 3600n * 1000000000n;
		const blocks = [];
		let previous = null;
		for (const [index, build] of BLOCK_BUILDERS.entries()) {
			const id = BigInt(index);
			const block = build(base + id * 3600n * 1000000000n, id >= LEGACY_BOUNDARY ? previous : null);
			blocks.push({
				id,
				block
			});
			previous = await hashValue(block);
		}
		return {
			blocks,
			tipHash: previous ?? /* @__PURE__ */ new Uint8Array(32)
		};
	})();
	return blockLogPromise;
}
/** Serves every requested range in order, capped at 100 blocks per call. */
async function mockGetBlocks(ranges) {
	const { blocks } = await sampleBlockLog();
	const logLength = BigInt(blocks.length);
	const out = [];
	for (const { start, length } of ranges) {
		const end = start + length < logLength ? start + length : logLength;
		for (let i = start; i < end && BigInt(out.length) < MAX_BLOCKS_PER_CALL; i++) out.push(blocks[Number(i)]);
	}
	return {
		log_length: logLength,
		blocks: out,
		archived_blocks: []
	};
}
var MOCK_CERTIFICATE = new Uint8Array(Array.from({ length: 64 }, (_, i) => i * 7 + 3 & 255));
function cborBytes(data) {
	const body = Array.from(data);
	return body.length < 24 ? [64 + body.length, ...body] : [
		88,
		body.length,
		...body
	];
}
function labeledLeaf(label, value) {
	return [
		131,
		2,
		...cborBytes(new TextEncoder().encode(label)),
		130,
		3,
		...cborBytes(value)
	];
}
function buildMockHashTree(tipIndex, tipHash) {
	return new Uint8Array([
		217,
		217,
		247,
		131,
		1,
		...labeledLeaf("last_block_hash", tipHash),
		...labeledLeaf("last_block_index", encodeLeb128(tipIndex))
	]);
}
/** Mock USD price per whole pay token (usdE8). */
var MOCK_PAY_USD_E8 = {
	[PayToken.icp]: MOCK_USD_E8,
	[PayToken.ckbtc]: 6500000000000n,
	[PayToken.ckusdc]: 100000000n,
	[PayToken.ckusdt]: 100000000n
};
function mockTokenPrice(token) {
	const price = mockPrice();
	return {
		token,
		pair: `${PAY_TOKENS[token].symbol}/USD`,
		usdE8: MOCK_PAY_USD_E8[token],
		source: price.source,
		fetchedAt: price.fetchedAt,
		validUntil: price.validUntil,
		usable: price.usable,
		lastSuccessAt: price.lastSuccessAt
	};
}
function mockPayTokens() {
	const price = mockPrice();
	return PAY_TOKEN_ORDER.map((token) => {
		const descriptor = PAY_TOKENS[token];
		return {
			token,
			symbol: descriptor.symbol,
			decimals: descriptor.decimals,
			ledgerCanisterId: Principal.fromText(descriptor.ledgerCanisterId),
			ledgerFee: descriptor.fee,
			feeBps: descriptor.feeBps,
			fundsCycles: descriptor.fundsCycles,
			buyerPriceUsd: BigInt(TOKEN_PRICE_USD) * (10000n + descriptor.feeBps) / 10000n,
			minimumUsdE8: BigInt(Math.round(descriptor.minimumUsd * 100)) * 1000000n,
			priceUsdE8: MOCK_PAY_USD_E8[token],
			priceSource: price.source,
			priceUsable: price.usable,
			priceFetchedAt: price.fetchedAt,
			priceValidUntil: price.validUntil,
			treasuryConfigured: true,
			liveRate: token === PayToken.icp ? MOCK_LIVE_RATE : void 0
		};
	});
}
var mockContacts = [];
var nextContactId = 1n;
function hasDuplicateNickname(nickname, exceptId) {
	const wanted = nickname.trim().toLowerCase();
	return mockContacts.some((c) => c.id !== exceptId && c.nickname.trim().toLowerCase() === wanted);
}
var mockBuybacks = [];
var mockBuybackAdmin = { owner: HOLDER_3 };
var buybackErr = (err) => ({
	__kind__: "err",
	err
});
var nextBuybackId = 1n;
/**
* Average mass of one buyer for one payment token: completed purchases with a
* recorded net amount (Version 26 onward; BTC purchases are already ckBTC),
* minus every buyback already made on that token.
*/
function mockMassFor(buyer, token) {
	let purchaseCount = 0n;
	let totalNet = 0n;
	let totalTtti = 0n;
	for (const c of state.conversions) {
		if (c.depositor.toText() !== buyer.toText() || c.payToken !== token) continue;
		if (c.status !== ConversionStatus.completed || c.netAmount === void 0) continue;
		purchaseCount += 1n;
		totalNet += c.netAmount;
		totalTtti += c.tttiAmount;
	}
	let boughtBackNet = 0n;
	let boughtBackTtti = 0n;
	let inProgress = false;
	for (const b of mockBuybacks) {
		if (b.buyer.toText() !== buyer.toText() || b.originalToken !== token) continue;
		boughtBackNet += b.originalNetAmount;
		boughtBackTtti += b.tttiAmount;
		if (b.status === BuybackStatus.inProgress) inProgress = true;
	}
	const remainingNet = totalNet > boughtBackNet ? totalNet - boughtBackNet : 0n;
	const remainingTtti = totalTtti > boughtBackTtti ? totalTtti - boughtBackTtti : 0n;
	return {
		buyer,
		token,
		purchaseCount,
		totalNet,
		totalTtti,
		boughtBackNet,
		boughtBackTtti,
		remainingNet,
		remainingTtti,
		inProgress
	};
}
function mockMassesOf(buyer) {
	return PAY_TOKEN_ORDER.map((token) => mockMassFor(buyer, token)).filter((m) => m.purchaseCount > 0n);
}
function mockAllMasses() {
	const buyers = /* @__PURE__ */ new Map();
	for (const c of state.conversions) buyers.set(c.depositor.toText(), c.depositor);
	return [...buyers.values()].flatMap((buyer) => mockMassesOf(buyer));
}
function mockBuybackQuote(massToken, percent, receiveToken) {
	if (percent < 1n || percent > 100n) return buybackErr({
		__kind__: "invalidPercent",
		invalidPercent: null
	});
	if (receiveToken !== massToken) return buybackErr({
		__kind__: "receiveTokenMismatch",
		receiveTokenMismatch: null
	});
	const mass = mockMassFor(CALLER, massToken);
	if (mass.inProgress) return buybackErr({
		__kind__: "massBuybackInProgress",
		massBuybackInProgress: null
	});
	if (mass.remainingTtti === 0n || mass.totalTtti === 0n) return buybackErr({
		__kind__: "nothingRemaining",
		nothingRemaining: null
	});
	if (!mockBuybackAdmin) return buybackErr({
		__kind__: "adminAccountNotSet",
		adminAccountNotSet: null
	});
	const originalToken = massToken;
	const full = percent === 100n;
	const tttiAmount = full ? mass.remainingTtti : mass.remainingTtti * percent / 100n;
	const originalNetAmount = full ? mass.remainingNet : mass.remainingNet * tttiAmount / mass.remainingTtti;
	if (tttiAmount === 0n) return buybackErr({
		__kind__: "amountTooSmall",
		amountTooSmall: null
	});
	const decimals = 10n ** BigInt(PAY_TOKENS[originalToken].decimals);
	const dayQuantity = tttiAmount * BigInt(TOKEN_PRICE_USD) * 100000000n / TTTI_DIVISOR * decimals / MOCK_PAY_USD_E8[originalToken];
	const useNet = originalNetAmount <= dayQuantity;
	const baseAmount = useNet ? originalNetAmount : dayQuantity;
	const baseAmountReturned = baseAmount;
	const buybackFee = baseAmountReturned / 100n;
	const thirdPartyFees = PAY_TOKENS[originalToken].fee;
	if (baseAmountReturned <= buybackFee + thirdPartyFees) return buybackErr({
		__kind__: "amountTooSmall",
		amountTooSmall: null
	});
	return {
		__kind__: "ok",
		ok: {
			originalToken,
			tokenReturned: originalToken,
			percent,
			massTotalNet: mass.totalNet,
			massTotalTtti: mass.totalTtti,
			massRemainingNet: mass.remainingNet,
			massRemainingTtti: mass.remainingTtti,
			rule: useNet ? BuybackRule.originalNet : BuybackRule.dayRate,
			originalRateUsdE8: MOCK_PAY_USD_E8[originalToken],
			returnedRateUsdE8: MOCK_PAY_USD_E8[originalToken],
			originalNetAmount,
			baseAmount,
			baseAmountReturned,
			buybackFee,
			thirdPartyFees,
			tttiTransferFee: state.fee,
			amountReturned: baseAmountReturned - buybackFee - thirdPartyFees,
			tttiAmount,
			tttiEscrowFee: state.fee,
			tttiAllowanceRequired: tttiAmount + 2n * state.fee
		}
	};
}
/** Funder account the payout attempts are drawn from. */
function mockFunder() {
	return mockBuybackAdmin ?? { owner: HOLDER_3 };
}
/** Payout attempt `attempt` of buyback `n` (memo TTTI-BB-<n>-<attempt>). */
function mockPayoutAttempt(b, attempt, outcome, createdAt, lastError) {
	const memo = attempt === 0n ? "" : `TTTI-BB-${b.id}-${attempt}`;
	return {
		from: mockFunder(),
		attempt: {
			n: b.id,
			attempt,
			memo: new TextEncoder().encode(memo),
			created_at_time: createdAt,
			request: {
				to: b.buyerAccount,
				token: b.tokenReturned,
				amount: b.amountReturned,
				fee: PAY_TOKENS[b.tokenReturned].fee
			},
			sends: 1n,
			lastError,
			outcome
		}
	};
}
function mockRequestBuyback(massToken, percent, receiveToken, fromSubaccount) {
	const quote = mockBuybackQuote(massToken, percent, receiveToken);
	if (quote.__kind__ === "err") return quote;
	const { tttiAllowanceRequired: _required, ...figures } = quote.ok;
	state.nextBlock += 1n;
	const pullBlock = state.nextBlock;
	const fails = massToken === PayToken.ckusdt;
	const base = {
		...figures,
		id: nextBuybackId,
		buyerAccount: fromSubaccount ? {
			owner: CALLER,
			subaccount: fromSubaccount
		} : CALLER_ACCOUNT
	};
	const payoutBlock = 4200000n + state.nextBlock;
	const attempt = mockPayoutAttempt(base, 1n, fails ? {
		__kind__: "failed",
		failed: "InsufficientAllowance (mock)"
	} : {
		__kind__: "succeeded",
		succeeded: payoutBlock
	}, nowNs(), fails ? "InsufficientAllowance (mock)" : void 0);
	if (!fails) state.nextBlock += 1n;
	const buyback = {
		...base,
		buyer: CALLER,
		timestamp: nowNs(),
		pullBlock,
		payoutBlock: fails ? void 0 : payoutBlock,
		payoutAttempts: [attempt],
		releaseBlock: fails ? void 0 : state.nextBlock,
		legacy: false,
		status: fails ? BuybackStatus.payoutFailed : BuybackStatus.completed,
		message: fails ? "InsufficientAllowance (mock)" : void 0
	};
	mockBuybacks.unshift(buyback);
	nextBuybackId += 1n;
	return {
		__kind__: "ok",
		ok: buyback
	};
}
function mockRetryBuyback(buybackId) {
	const index = mockBuybacks.findIndex((b) => b.id === buybackId);
	if (index < 0) return buybackErr({
		__kind__: "buybackNotFound",
		buybackNotFound: null
	});
	const record = mockBuybacks[index];
	if (record.buyer.toText() !== CALLER.toText()) return buybackErr({
		__kind__: "notBuyer",
		notBuyer: null
	});
	if (record.status !== BuybackStatus.payoutFailed) return buybackErr({
		__kind__: "notRetryable",
		notRetryable: null
	});
	const payoutBlock = 4200000n + state.nextBlock;
	const next = mockPayoutAttempt(record, BigInt(record.payoutAttempts.length + 1), {
		__kind__: "succeeded",
		succeeded: payoutBlock
	}, nowNs());
	state.nextBlock += 1n;
	const done = {
		...record,
		status: BuybackStatus.completed,
		payoutBlock,
		payoutAttempts: [...record.payoutAttempts, next],
		releaseBlock: record.legacy ? void 0 : state.nextBlock,
		message: void 0
	};
	mockBuybacks[index] = done;
	return {
		__kind__: "ok",
		ok: done
	};
}
/** Buyer or admin: return the escrowed TTTI-T when every attempt got an Err. */
function mockCancelBuyback(buybackId) {
	const index = mockBuybacks.findIndex((b) => b.id === buybackId);
	if (index < 0) return buybackErr({
		__kind__: "buybackNotFound",
		buybackNotFound: null
	});
	const record = mockBuybacks[index];
	if (record.legacy || record.status !== BuybackStatus.payoutFailed) return buybackErr({
		__kind__: "notCancellable",
		notCancellable: null
	});
	const outcomes = record.payoutAttempts.map((p) => p.attempt.outcome.__kind__);
	if (outcomes.includes("succeeded")) return buybackErr({
		__kind__: "attemptArrived",
		attemptArrived: null
	});
	if (outcomes.some((o) => o !== "failed")) return buybackErr({
		__kind__: "attemptUnknown",
		attemptUnknown: null
	});
	state.nextBlock += 1n;
	const cancelled = {
		...record,
		status: BuybackStatus.cancelled,
		cancelBlock: state.nextBlock,
		message: void 0
	};
	mockBuybacks[index] = cancelled;
	return {
		__kind__: "ok",
		ok: cancelled
	};
}
/** Admin, legacy buybacks only: record the block of the TTTI-T returned by hand. */
function mockMarkBuybackCancelled(buybackId, block) {
	const index = mockBuybacks.findIndex((b) => b.id === buybackId);
	if (index < 0) return buybackErr({
		__kind__: "buybackNotFound",
		buybackNotFound: null
	});
	const record = mockBuybacks[index];
	if (!record.legacy) return buybackErr({
		__kind__: "notLegacy",
		notLegacy: null
	});
	if (record.payoutAttempts.some((p) => p.attempt.outcome.__kind__ === "succeeded")) return buybackErr({
		__kind__: "attemptArrived",
		attemptArrived: null
	});
	if (record.status !== BuybackStatus.payoutFailed) return buybackErr({
		__kind__: "notCancellable",
		notCancellable: null
	});
	const cancelled = {
		...record,
		status: BuybackStatus.cancelled,
		cancelBlock: block,
		message: void 0
	};
	mockBuybacks[index] = cancelled;
	const reviewIndex = mockReviews.findIndex((r) => r.kind === TransferKind.BB && r.purchaseId === buybackId);
	if (reviewIndex >= 0) mockReviews.splice(reviewIndex, 1);
	return {
		__kind__: "ok",
		ok: cancelled
	};
}
/** Replace the outcome of the latest payout attempt of a buyback. */
function setLatestOutcome(record, outcome) {
	return record.payoutAttempts.map((p, i) => i === record.payoutAttempts.length - 1 ? {
		...p,
		attempt: {
			...p.attempt,
			outcome
		}
	} : p);
}
/** Admin Arrived on a BB row: payout block set, escrow released, #completed. */
function mockBuybackArrived(buybackId, block) {
	const index = mockBuybacks.findIndex((b) => b.id === buybackId);
	if (index < 0) return;
	const record = mockBuybacks[index];
	if (!record.legacy) state.nextBlock += 1n;
	mockBuybacks[index] = {
		...record,
		status: BuybackStatus.completed,
		payoutBlock: block,
		payoutAttempts: setLatestOutcome(record, {
			__kind__: "succeeded",
			succeeded: block
		}),
		releaseBlock: record.legacy ? void 0 : state.nextBlock,
		message: void 0
	};
}
/** Admin Not arrived on a BB row: the latest attempt becomes a known failure. */
function mockBuybackNotArrived(buybackId) {
	const index = mockBuybacks.findIndex((b) => b.id === buybackId);
	if (index < 0) return;
	const record = mockBuybacks[index];
	mockBuybacks[index] = {
		...record,
		status: BuybackStatus.payoutFailed,
		payoutAttempts: setLatestOutcome(record, {
			__kind__: "failed",
			failed: "Not arrived (admin check)"
		})
	};
}
/** Seeded buyback of another buyer, already recorded. */
function seedBuyback(buyer, legacy, ageHours) {
	const token = PayToken.icp;
	const tttiAmount = TTTI_DIVISOR / 1000n;
	const net = ICP_DIVISOR / 2n;
	const buybackFee = net / 100n;
	const thirdPartyFees = ICP_LEDGER_FEE;
	const base = {
		id: nextBuybackId,
		buyerAccount: { owner: buyer },
		tokenReturned: token,
		amountReturned: net - buybackFee - thirdPartyFees
	};
	const createdAt = nowNs() - ageHours * HOUR_NS;
	nextBuybackId += 1n;
	return {
		...base,
		buyer,
		timestamp: createdAt,
		originalToken: token,
		percent: 100n,
		massTotalNet: net,
		massTotalTtti: tttiAmount,
		massRemainingNet: net,
		massRemainingTtti: tttiAmount,
		originalRateUsdE8: MOCK_PAY_USD_E8[token],
		returnedRateUsdE8: MOCK_PAY_USD_E8[token],
		rule: BuybackRule.originalNet,
		originalNetAmount: net,
		baseAmount: net,
		baseAmountReturned: net,
		buybackFee,
		thirdPartyFees,
		tttiTransferFee: state.fee,
		tttiEscrowFee: legacy ? 0n : state.fee,
		tttiAmount,
		pullBlock: 1100n + nextBuybackId,
		payoutAttempts: [mockPayoutAttempt(base, legacy ? 0n : 1n, {
			__kind__: "unknown",
			unknown: null
		}, legacy ? 0n : createdAt, "Call timed out (outcome unknown)")],
		legacy,
		status: BuybackStatus.payoutFailed,
		message: "Call timed out (outcome unknown)"
	};
}
/** #BB review row of a seeded buyback (id = buyback id). */
function buybackReviewRow(b) {
	const latest = b.payoutAttempts[b.payoutAttempts.length - 1].attempt;
	const memoText = new TextDecoder().decode(latest.memo);
	return {
		kind: TransferKind.BB,
		purchaseId: b.id,
		token: DEX_OF_PAY[b.tokenReturned],
		memoText: memoText === "" ? void 0 : memoText,
		memoHex: memoText === "" ? void 0 : memoHexOf(memoText),
		createdAtTimeNs: latest.created_at_time === 0n ? void 0 : latest.created_at_time,
		amount: latest.request.amount,
		fee: latest.request.fee,
		destination: b.buyerAccount,
		sends: latest.sends,
		lastError: latest.lastError,
		buyer: b.buyer,
		outcome: latest.outcome
	};
}
var reviewBuyback = seedBuyback(HOLDER_3, false, 25n);
var legacyBuyback = seedBuyback(HOLDER_2, true, 30n * 24n);
mockBuybacks.push(reviewBuyback, legacyBuyback);
mockReviews.push(buybackReviewRow(reviewBuyback), buybackReviewRow(legacyBuyback));
function mockBuybackFunding() {
	return PAY_TOKEN_ORDER.map((token) => ({
		token,
		allowance: token === PayToken.ckbtc ? 0n : 50n * 10n ** BigInt(PAY_TOKENS[token].decimals),
		expiresAt: token === PayToken.ckbtc ? void 0 : nowNs() + 7n * 24n * HOUR_NS,
		balance: 80n * 10n ** BigInt(PAY_TOKENS[token].decimals)
	}));
}
var DEX_TTTI_MIN_LOCKED = 10000n;
var DEX_REQUEST_DEPOSIT = 50000n;
var DEX_FIRST_DEPOSIT_MULTIPLIER = 10n;
var DEX_BADGE_NS = 30n * 24n * HOUR_NS;
var DEX_COOLDOWN_NS = 7n * 24n * HOUR_NS;
var DEX_MAX_PENDING = 2n;
var DEX_MESSAGE_MAX = 500n;
var DEX_REASON_MAX = 300n;
var DEX_PROTOCOL_STATEMENT = "The protocol places no price-linked order and creates no TTTI-T; the mint fee (1/101) buys TTTI-T without any price condition to feed pool liquidity.";
var DEX_LOCKED_SHARES_STATEMENT = "The minimum locked shares √(A×B) belong to the contract forever.";
var DEX_APPROVAL_STATEMENT = "Approval of a pair is not a recommendation.";
var DEX_USD_RATE_SCALE = 100000000n;
var DEX_LAUNCH_MIN_TOTAL_USD_E8 = 100n * DEX_USD_RATE_SCALE;
var DEX_TTTI_T_USD_E8 = 10000n * DEX_USD_RATE_SCALE;
var DEX_LAUNCH_DEPTH_STATEMENT = "The first deposit that launches a pool must be worth at least 100 USD in total, both sides combined.";
var DEX_FEE_BPS = {
	[FeeTier.bps5]: 5n,
	[FeeTier.bps30]: 30n,
	[FeeTier.bps100]: 100n
};
var DEX_MIN_LOCK_NS = 24n * HOUR_NS;
var DEX_MAX_LOCK_NS = 1826n * 24n * HOUR_NS;
var DEX_SWAP_DEADLINE_MAX_NS = 5n * 60n * 1000000000n;
var DEX_LP_FEE_SHARE_PERCENT = SWAP_FEE_LP_PERCENT;
/** 30 % of each swap fee becomes permanent liquidity in the same pool. */
var DEX_PROTOCOL_FEE_SHARE_PERCENT = SWAP_FEE_PERMANENT_PERCENT;
var DEX_MAX_SLIPPAGE_BPS = 5000n;
var DEX_BPS = 10000n;
var dexLabelBytes = (label, tail) => {
	const bytes = /* @__PURE__ */ new Uint8Array(32);
	bytes.set(new TextEncoder().encode(label).slice(0, 24));
	let value = tail;
	for (let i = 31; i >= 24; i--) {
		bytes[i] = Number(value & 255n);
		value >>= 8n;
	}
	return bytes;
};
var dexHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
var DEX_DEPOSIT_ACCOUNT = {
	owner: TTTI_CANISTER,
	subaccount: dexLabelBytes("DEX-PAIR-REQUEST-DEPOSIT", 0n)
};
var dexToken = (ledgerId, symbol, decimals, isTttiT = false) => ({
	ledgerId,
	symbol,
	decimals,
	isTttiT
});
var DEX_TTTI = dexToken(TTTI_CANISTER, TTTI_SYMBOL, 8, true);
var DEX_ICP = dexToken(ICP_CANISTER, "ICP", 8);
var DEX_CKBTC = dexToken(Principal.fromText(CKBTC_LEDGER_CANISTER_ID), "ckBTC", 8);
var DEX_CKUSDC = dexToken(Principal.fromText(CKUSDC_LEDGER_CANISTER_ID), "ckUSDC", 6);
var DEX_CKUSDT = dexToken(Principal.fromText(CKUSDT_LEDGER_CANISTER_ID), "ckUSDT", 6);
var mockPools = [];
var nextPoolId = 0n;
var mockPairRequests = [];
var nextPairRequestId = 1n;
var nextDexBlock = 4200n;
/** Refused pair-request deposits fed once to the protocol liquidity as TTTI-T (no TTTI-T is created). */
var mockRefusedPairDeposits = {
	fed: /* @__PURE__ */ new Set(),
	totalTttiT: 0n
};
function dexFeedRefusedDeposit(request) {
	if (request.status.__kind__ !== "refused" || mockRefusedPairDeposits.fed.has(request.id)) return;
	mockRefusedPairDeposits.fed.add(request.id);
	mockRefusedPairDeposits.totalTttiT += request.depositAmount;
}
var dexSameLedger = (a, b) => a.ledgerId.toText() === b.ledgerId.toText();
var dexSamePair = (a0, a1, b0, b1) => dexSameLedger(a0, b0) && dexSameLedger(a1, b1) || dexSameLedger(a0, b1) && dexSameLedger(a1, b0);
function dexMinimums(token0, token1, minimums) {
	if (token0.isTttiT || token1.isTttiT) return token0.isTttiT ? { token0: DEX_TTTI_MIN_LOCKED } : { token1: DEX_TTTI_MIN_LOCKED };
	return minimums ? {
		token0: minimums.token0,
		token1: minimums.token1
	} : {};
}
var dexFirstDeposit = (m) => ({
	...m.token0 !== void 0 ? { token0: m.token0 * DEX_FIRST_DEPOSIT_MULTIPLIER } : {},
	...m.token1 !== void 0 ? { token1: m.token1 * DEX_FIRST_DEPOSIT_MULTIPLIER } : {}
});
function dexCreatePool(token0, token1, feeTier, createdAt, request) {
	const id = nextPoolId++;
	const subaccount = dexLabelBytes("DEX-POOL", id);
	const kind = token0.isTttiT || token1.isTttiT ? PoolKind.tttiPair : PoolKind.utilityPair;
	const minimumLocked = dexMinimums(token0, token1, request?.minimums ?? null);
	const pool = {
		id,
		token0,
		token1,
		feeTier,
		feeBps: DEX_FEE_BPS[feeTier],
		kind,
		status: PoolStatus.filling,
		createdAt,
		reserve0: 0n,
		reserve1: 0n,
		totalShares: 0n,
		lockedShares: 0n,
		protocolFee0: 0n,
		protocolFee1: 0n,
		gauge: {
			currentUsdE8: 0n,
			targetUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
			remainingUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
			valueAvailable: true,
			missingRate: {
				token0: false,
				token1: false
			}
		},
		subaccount,
		subaccountText: dexHex(subaccount),
		poolAccount: {
			owner: TTTI_CANISTER,
			subaccount
		},
		minimumLocked,
		firstDepositMinimum: dexFirstDeposit(minimumLocked),
		minimumsSet: kind === PoolKind.tttiPair || !!request?.minimums,
		lockedSharesStatement: DEX_LOCKED_SHARES_STATEMENT,
		launchMinimumTotalUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
		newPairBadgeActive: false,
		acceptsSwaps: false,
		acceptsDeposits: true,
		acceptsWithdrawals: true,
		...request ? {
			requestId: request.id,
			approvalStatement: DEX_APPROVAL_STATEMENT,
			newPairBadgeUntil: createdAt + DEX_BADGE_NS
		} : {}
	};
	mockPools.push(pool);
	return pool;
}
/** Persists #filling -> #active (lot 3), then returns the view with a fresh gauge. */
var dexPoolOut = (pool) => {
	dexRefreshOpening(pool);
	return {
		...pool,
		gauge: dexGauge(pool),
		acceptsSwaps: pool.status === PoolStatus.active,
		newPairBadgeActive: pool.newPairBadgeUntil !== void 0 && pool.newPairBadgeUntil > nowNs()
	};
};
var dexStartedAt = nowNs() - 2n * 24n * HOUR_NS;
for (const [a, b] of [
	[DEX_TTTI, DEX_ICP],
	[DEX_TTTI, DEX_CKBTC],
	[DEX_TTTI, DEX_CKUSDC],
	[DEX_TTTI, DEX_CKUSDT],
	[DEX_CKBTC, DEX_ICP],
	[DEX_CKUSDC, DEX_ICP],
	[DEX_CKUSDT, DEX_ICP]
]) dexCreatePool(a, b, FeeTier.bps30, dexStartedAt);
/** Simulated ledgers: one lacks ICRC-2, one reuses the ICP symbol, one is unreachable. */
var DEX_NO_ICRC2_LEDGER = principalFrom(21);
var DEX_COPYCAT_LEDGER = principalFrom(20);
var DEX_UNREACHABLE_LEDGER = principalFrom(23);
var DEX_SIM_METADATA = {
	[DEX_COPYCAT_LEDGER.toText()]: {
		name: "Internet Computer",
		symbol: "ICP",
		decimals: 8,
		fee: 10000n
	},
	[principalFrom(22).toText()]: {
		name: "Lumen",
		symbol: "LUMEN",
		decimals: 8,
		fee: 10000n
	}
};
function dexReadToken(ledgerId) {
	const known = [
		DEX_TTTI,
		DEX_ICP,
		DEX_CKBTC,
		DEX_CKUSDC,
		DEX_CKUSDT
	].find((token) => token.ledgerId.toText() === ledgerId.toText());
	if (known) return {
		ledgerId,
		name: known.symbol,
		symbol: known.symbol,
		decimals: known.decimals,
		fee: 10000n
	};
	const meta = DEX_SIM_METADATA[ledgerId.toText()];
	if (meta) return {
		ledgerId,
		...meta
	};
	const symbol = `T${ledgerId.toText().slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
	return {
		ledgerId,
		name: `${symbol} token`,
		symbol,
		decimals: 8,
		fee: 10000n
	};
}
var dexCopiedSymbolOf = (token) => {
	const symbol = token.symbol.toLowerCase();
	for (const pool of mockPools) for (const side of [pool.token0, pool.token1]) if (side.symbol.toLowerCase() === symbol && side.ledgerId.toText() !== token.ledgerId.toText()) return side.symbol;
};
function dexCounterToken(counter) {
	switch (counter.__kind__) {
		case "icp": return DEX_ICP;
		case "ckbtc": return DEX_CKBTC;
		case "ckusdc": return DEX_CKUSDC;
		case "ckusdt": return DEX_CKUSDT;
		case "tttiT": return DEX_TTTI;
		case "poolToken": {
			const ledger = counter.poolToken.toText();
			for (const pool of mockPools) {
				if (pool.status === PoolStatus.removed) continue;
				if (pool.token0.ledgerId.toText() === ledger) return pool.token0;
				if (pool.token1.ledgerId.toText() === ledger) return pool.token1;
			}
			return null;
		}
	}
}
var dexActivePool = (a, b, feeTier) => mockPools.find((pool) => pool.status !== PoolStatus.removed && pool.feeTier === feeTier && dexSamePair(pool.token0, pool.token1, a, b));
var dexRequestToken = (request) => dexToken(request.token.ledgerId, request.token.symbol, request.token.decimals);
function dexNewRequest(requester, token, counter, feeTier, message, createdAt) {
	const copiedSymbolOf = dexCopiedSymbolOf(token);
	const request = {
		id: nextPairRequestId++,
		requester,
		token,
		counter,
		feeTier,
		feeBps: DEX_FEE_BPS[feeTier],
		kind: counter.isTttiT ? PoolKind.tttiPair : PoolKind.utilityPair,
		message,
		createdAt,
		checks: {
			icrc1: true,
			icrc2: true,
			metadataRead: true,
			pairUnique: true,
			...copiedSymbolOf ? { copiedSymbolOf } : {}
		},
		copiedSymbol: copiedSymbolOf !== void 0,
		depositAmount: DEX_REQUEST_DEPOSIT,
		depositBlock: nextDexBlock++,
		status: {
			__kind__: "pending",
			pending: null
		},
		refundStatus: {
			__kind__: "none",
			none: null
		}
	};
	mockPairRequests.push(request);
	return request;
}
dexNewRequest(HOLDER_2, dexReadToken(principalFrom(22)), DEX_TTTI, FeeTier.bps30, "Ledger with ICRC-1 and ICRC-2, metadata published.", nowNs() - 5n * HOUR_NS);
var dexRefusedSeed = dexNewRequest(HOLDER_3, dexReadToken(DEX_COPYCAT_LEDGER), DEX_CKUSDC, FeeTier.bps100, "", nowNs() - 3n * 24n * HOUR_NS);
dexRefusedSeed.status = {
	__kind__: "refused",
	refused: {
		reason: "The symbol copies ICP.",
		at: nowNs() - 2n * 24n * HOUR_NS
	}
};
dexFeedRefusedDeposit(dexRefusedSeed);
function mockRequestPair(args) {
	const err = (e) => ({
		__kind__: "err",
		err: e
	});
	if (BigInt(args.message.length) > DEX_MESSAGE_MAX) return err({
		__kind__: "messageTooLong",
		messageTooLong: { max: DEX_MESSAGE_MAX }
	});
	if (args.ledgerId.isAnonymous()) return err({
		__kind__: "invalidToken",
		invalidToken: "The anonymous principal is not a ledger."
	});
	const counter = dexCounterToken(args.counter);
	if (!counter) return err({
		__kind__: "unknownCounterToken",
		unknownCounterToken: null
	});
	if (counter.ledgerId.toText() === args.ledgerId.toText()) return err({
		__kind__: "invalidToken",
		invalidToken: "The token and the counter token are the same ledger."
	});
	if (args.ledgerId.toText() === DEX_UNREACHABLE_LEDGER.toText()) return err({
		__kind__: "ledgerUnreachable",
		ledgerUnreachable: "Canister has no wasm module."
	});
	if (args.ledgerId.toText() === DEX_NO_ICRC2_LEDGER.toText()) return err({
		__kind__: "missingStandards",
		missingStandards: {
			icrc1: true,
			icrc2: false
		}
	});
	const token = dexReadToken(args.ledgerId);
	const tokenView = dexToken(token.ledgerId, token.symbol, token.decimals, token.ledgerId.toText() === TTTI_CANISTER.toText());
	const pool = dexActivePool(tokenView, counter, args.feeTier);
	const pending = mockPairRequests.find((r) => r.status.__kind__ === "pending" && r.feeTier === args.feeTier && dexSamePair(dexRequestToken(r), r.counter, tokenView, counter));
	if (pool || pending) return err({
		__kind__: "pairExists",
		pairExists: {
			...pool ? { poolId: pool.id } : {},
			...pending ? { requestId: pending.id } : {}
		}
	});
	const mine = mockPairRequests.filter((r) => r.requester.toText() === CALLER.toText());
	if (BigInt(mine.filter((r) => r.status.__kind__ === "pending").length) >= DEX_MAX_PENDING) return err({
		__kind__: "tooManyPending",
		tooManyPending: { max: DEX_MAX_PENDING }
	});
	for (const r of mine) if (r.status.__kind__ === "refused" && r.status.refused.at + DEX_COOLDOWN_NS > nowNs()) return err({
		__kind__: "cooldown",
		cooldown: { until: r.status.refused.at + DEX_COOLDOWN_NS }
	});
	return {
		__kind__: "ok",
		ok: dexNewRequest(CALLER, token, counter, args.feeTier, args.message, nowNs())
	};
}
/** DQ memo: the pair request id, with -<m> appended on a renewed attempt. */
var dexDqMemo = (requestId, attempt) => attempt === void 0 ? `TTTI-DQ-${requestId}` : `TTTI-DQ-${requestId}-${attempt}`;
function mockApprovePair(requestId, minimums) {
	const err = (e) => ({
		__kind__: "err",
		err: e
	});
	const request = mockPairRequests.find((r) => r.id === requestId);
	if (!request) return err({
		__kind__: "requestNotFound",
		requestNotFound: null
	});
	if (request.status.__kind__ !== "pending") return err({
		__kind__: "notPending",
		notPending: null
	});
	if (request.kind === PoolKind.tttiPair && minimums) return err({
		__kind__: "minimumsNotAllowed",
		minimumsNotAllowed: null
	});
	if (minimums && (minimums.token0 === 0n || minimums.token1 === 0n)) return err({
		__kind__: "invalidMinimums",
		invalidMinimums: null
	});
	const token = dexRequestToken(request);
	const existing = dexActivePool(token, request.counter, request.feeTier);
	if (existing) return err({
		__kind__: "pairExists",
		pairExists: { poolId: existing.id }
	});
	const [token0, token1] = request.counter.isTttiT ? [request.counter, token] : [token, request.counter];
	const at = nowNs();
	const pool = dexCreatePool(token0, token1, request.feeTier, at, {
		id: request.id,
		minimums
	});
	request.status = {
		__kind__: "approved",
		approved: {
			poolId: pool.id,
			at
		}
	};
	request.refundBlock = nextDexBlock++;
	request.refundStatus = {
		__kind__: "refunded",
		refunded: request.refundBlock
	};
	return {
		__kind__: "ok",
		ok: dexPoolOut(pool)
	};
}
function mockRefusePair(requestId, reason) {
	const err = (e) => ({
		__kind__: "err",
		err: e
	});
	const request = mockPairRequests.find((r) => r.id === requestId);
	if (!request) return err({
		__kind__: "requestNotFound",
		requestNotFound: null
	});
	if (request.status.__kind__ !== "pending") return err({
		__kind__: "notPending",
		notPending: null
	});
	const trimmed = reason.trim();
	if (trimmed === "") return err({
		__kind__: "reasonRequired",
		reasonRequired: null
	});
	if (BigInt(trimmed.length) > DEX_REASON_MAX) return err({
		__kind__: "reasonTooLong",
		reasonTooLong: { max: DEX_REASON_MAX }
	});
	request.status = {
		__kind__: "refused",
		refused: {
			reason: trimmed,
			at: nowNs()
		}
	};
	dexFeedRefusedDeposit(request);
	return {
		__kind__: "ok",
		ok: request
	};
}
function mockRemovePair(poolId) {
	const pool = mockPools.find((p) => p.id === poolId);
	if (!pool) return {
		__kind__: "err",
		err: RemovePairError.poolNotFound
	};
	if (pool.status === PoolStatus.removed) return {
		__kind__: "err",
		err: RemovePairError.alreadyRemoved
	};
	pool.status = PoolStatus.removed;
	pool.removedAt = nowNs();
	pool.acceptsSwaps = false;
	pool.acceptsDeposits = false;
	pool.acceptsWithdrawals = true;
	return {
		__kind__: "ok",
		ok: dexPoolOut(pool)
	};
}
function mockSetUtilityPairMinimums(poolId, minimums) {
	const pool = mockPools.find((p) => p.id === poolId);
	if (!pool) return {
		__kind__: "err",
		err: SetMinimumsError.poolNotFound
	};
	if (pool.status === PoolStatus.removed) return {
		__kind__: "err",
		err: SetMinimumsError.poolRemoved
	};
	if (pool.kind !== PoolKind.utilityPair) return {
		__kind__: "err",
		err: SetMinimumsError.notUtilityPair
	};
	if (pool.totalShares > 0n) return {
		__kind__: "err",
		err: SetMinimumsError.liquidityAlreadyAdded
	};
	if (minimums.token0 === 0n || minimums.token1 === 0n) return {
		__kind__: "err",
		err: SetMinimumsError.invalidMinimums
	};
	pool.minimumLocked = {
		token0: minimums.token0,
		token1: minimums.token1
	};
	pool.firstDepositMinimum = dexFirstDeposit(pool.minimumLocked);
	pool.minimumsSet = true;
	return {
		__kind__: "ok",
		ok: dexPoolOut(pool)
	};
}
function mockDexConfig() {
	return {
		requestDeposit: DEX_REQUEST_DEPOSIT,
		depositAccount: DEX_DEPOSIT_ACCOUNT,
		maxPendingPerUser: DEX_MAX_PENDING,
		refusalCooldownNs: DEX_COOLDOWN_NS,
		messageMaxChars: DEX_MESSAGE_MAX,
		reasonMaxChars: DEX_REASON_MAX,
		newPairBadgeNs: DEX_BADGE_NS,
		tttiMinimumLocked: DEX_TTTI_MIN_LOCKED,
		firstDepositMultiplier: DEX_FIRST_DEPOSIT_MULTIPLIER,
		feeTiers: [
			FeeTier.bps5,
			FeeTier.bps30,
			FeeTier.bps100
		],
		protocolStatement: DEX_PROTOCOL_STATEMENT,
		lockedSharesStatement: DEX_LOCKED_SHARES_STATEMENT,
		approvalStatement: DEX_APPROVAL_STATEMENT,
		launchMinimumTotalUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
		usdRateScale: DEX_USD_RATE_SCALE,
		tttiTUsdE8: DEX_TTTI_T_USD_E8,
		rateValidForNs: HOUR_NS,
		rateGraceNs: 5n * 60n * 1000000000n,
		launchDepthStatement: DEX_LAUNCH_DEPTH_STATEMENT,
		minLockNs: DEX_MIN_LOCK_NS,
		maxLockNs: DEX_MAX_LOCK_NS,
		swapDeadlineMaxNs: DEX_SWAP_DEADLINE_MAX_NS,
		lpFeeSharePercent: DEX_LP_FEE_SHARE_PERCENT,
		protocolFeeSharePercent: DEX_PROTOCOL_FEE_SHARE_PERCENT
	};
}
var DEX_TOKEN_ORDER = [
	DexToken.tttiT,
	DexToken.icp,
	DexToken.ckbtc,
	DexToken.ckusdc,
	DexToken.ckusdt
];
var DEX_TOKEN_VIEW = {
	[DexToken.tttiT]: DEX_TTTI,
	[DexToken.icp]: DEX_ICP,
	[DexToken.ckbtc]: DEX_CKBTC,
	[DexToken.ckusdc]: DEX_CKUSDC,
	[DexToken.ckusdt]: DEX_CKUSDT
};
var PAY_OF_DEX = {
	[DexToken.icp]: PayToken.icp,
	[DexToken.ckbtc]: PayToken.ckbtc,
	[DexToken.ckusdc]: PayToken.ckusdc,
	[DexToken.ckusdt]: PayToken.ckusdt
};
var dexTokenFee = (token) => token === DexToken.tttiT ? state.fee : PAY_TOKENS[PAY_OF_DEX[token]].fee;
function dexTokenInfo(token) {
	const view = DEX_TOKEN_VIEW[token];
	const fee = dexTokenFee(token);
	return {
		token,
		symbol: view.symbol,
		ledgerId: view.ledgerId,
		decimals: view.decimals,
		fee,
		minimumDeposit: 10n * fee,
		minimumWithdrawal: 10n * fee
	};
}
/** [0xDD, principal length, principal bytes, zero padding]: 32 bytes, no secret. */
function dexUserSubaccount(owner) {
	const bytes = owner.toUint8Array();
	const out = /* @__PURE__ */ new Uint8Array(32);
	out[0] = 221;
	out[1] = bytes.length;
	out.set(bytes.slice(0, 30), 2);
	return out;
}
var dexDepositAccountOf = (owner) => ({
	owner: TTTI_CANISTER,
	subaccount: dexUserSubaccount(owner)
});
var mockDexBalances = /* @__PURE__ */ new Map();
var mockDexTransfers = [];
var nextDexTransferN = 1n;
/** Last TTTI-T allowance granted to the contract through icrc2_approve. */
var mockTttiAllowance = 0n;
function dexBalanceOf(owner, token) {
	let byToken = mockDexBalances.get(owner.toText());
	if (!byToken) {
		byToken = /* @__PURE__ */ new Map();
		mockDexBalances.set(owner.toText(), byToken);
	}
	let balance = byToken.get(token);
	if (!balance) {
		balance = {
			available: 0n,
			reserved: 0n
		};
		byToken.set(token, balance);
	}
	return balance;
}
function dexBalancesView(owner) {
	return DEX_TOKEN_ORDER.map((token) => {
		const balance = dexBalanceOf(owner, token);
		const view = DEX_TOKEN_VIEW[token];
		return {
			token,
			symbol: view.symbol,
			ledgerId: view.ledgerId,
			available: balance.available,
			reserved: balance.reserved
		};
	});
}
/**
* Every second check finds a simulated shortfall on ICP (internal credits above
* the ledger balance). It is seen by two consecutive checks, so the resume
* refusal can be exercised, and is repaired before the next one.
*/
var RESERVE_SHORTFALL_TOKEN = DexToken.icp;
var RESERVE_SHORTFALL_E8S = 50000000n;
var mockDexReserve = {
	runs: 0,
	deficit: 0n,
	deficitSeen: 0,
	lastCheck: void 0,
	lastSuccessAt: void 0,
	history: [],
	openTokens: /* @__PURE__ */ new Set(),
	nextMismatchId: 1n,
	pause: { paused: false }
};
/** Sum of the internal DEX balances (available and reserved) and the pool reserves of one token. */
function dexInternalTotal(token) {
	const ledgerId = DEX_TOKEN_VIEW[token].ledgerId.toText();
	let total = 0n;
	for (const byToken of mockDexBalances.values()) {
		const balance = byToken.get(token);
		if (balance) total += balance.available + balance.reserved;
	}
	for (const pool of mockPools) {
		if (pool.token0.ledgerId.toText() === ledgerId) total += pool.reserve0;
		if (pool.token1.ledgerId.toText() === ledgerId) total += pool.reserve1;
	}
	return total;
}
var dexReserveUnresolved = () => BigInt(mockDexReserve.lastCheck?.results.filter((r) => r.status === ReserveStatus.shortfall).length ?? 0);
function dexReserveErr(err) {
	return {
		__kind__: "err",
		err
	};
}
function mockRunDexReserveCheck() {
	const reserve = mockDexReserve;
	reserve.runs += 1;
	if (reserve.deficit > 0n) {
		reserve.deficitSeen += 1;
		if (reserve.deficitSeen > 2) {
			reserve.deficit = 0n;
			reserve.deficitSeen = 0;
		}
	} else if (reserve.runs % 2 === 0) {
		reserve.deficit = RESERVE_SHORTFALL_E8S;
		reserve.deficitSeen = 1;
	}
	const now = nowNs();
	const results = DEX_TOKEN_ORDER.map((token) => {
		const ledgerTotal = dexInternalTotal(token);
		const internalTotal = token === RESERVE_SHORTFALL_TOKEN ? ledgerTotal + reserve.deficit : ledgerTotal;
		const difference = ledgerTotal - internalTotal;
		return {
			token,
			internalTotal,
			ledgerTotal,
			difference,
			status: difference < 0n ? ReserveStatus.shortfall : difference > 0n ? ReserveStatus.surplus : ReserveStatus.ok
		};
	});
	for (const result of results) {
		if (result.status !== ReserveStatus.shortfall) {
			reserve.openTokens.delete(result.token);
			continue;
		}
		if (!reserve.openTokens.has(result.token)) {
			reserve.openTokens.add(result.token);
			reserve.history.push({
				id: reserve.nextMismatchId,
				at: now,
				token: result.token,
				internalTotal: result.internalTotal,
				ledgerTotal: result.ledgerTotal
			});
			reserve.nextMismatchId += 1n;
		}
		if (!reserve.pause.paused) reserve.pause = {
			paused: true,
			reason: {
				token: result.token,
				internalTotal: result.internalTotal,
				ledgerTotal: result.ledgerTotal,
				at: now
			}
		};
	}
	reserve.lastSuccessAt = now;
	const check = {
		checkedAt: now,
		results,
		lastSuccessAt: now,
		error: void 0
	};
	reserve.lastCheck = check;
	return {
		__kind__: "ok",
		ok: check
	};
}
function mockResumeDex() {
	const reserve = mockDexReserve;
	if (!reserve.pause.paused) return dexReserveErr({
		__kind__: "notPaused",
		notPaused: null
	});
	if (dexReserveUnresolved() > 0n) return dexReserveErr({
		__kind__: "checkFailed",
		checkFailed: `A shortfall remains for ${reserve.pause.reason ? DEX_TOKEN_VIEW[reserve.pause.reason.token].symbol : "a token"}. Run a new reserve check once the ledger balance matches the internal total.`
	});
	reserve.pause = {
		paused: false,
		reason: reserve.pause.reason,
		resumed: {
			by: CALLER,
			at: nowNs()
		}
	};
	return {
		__kind__: "ok",
		ok: reserve.pause
	};
}
function mockDexReserveStatus() {
	const reserve = mockDexReserve;
	return {
		lastCheck: reserve.lastCheck,
		unresolvedShortfallCount: dexReserveUnresolved(),
		checkInProgress: false,
		pause: reserve.pause,
		history: [...reserve.history].reverse()
	};
}
function mockPublicDexPause() {
	const { pause } = mockDexReserve;
	return {
		paused: pause.paused,
		reasonToken: pause.paused ? pause.reason?.token : void 0
	};
}
/** Worst status of the last check, for the readiness checklist. */
function mockLastReserveStatus() {
	const results = mockDexReserve.lastCheck?.results;
	if (!results) return void 0;
	if (results.some((r) => r.status === ReserveStatus.shortfall)) return ReserveStatus.shortfall;
	if (results.some((r) => r.status === ReserveStatus.surplus)) return ReserveStatus.surplus;
	return ReserveStatus.ok;
}
/** Swaps, deposits and liquidity additions refuse while paused; withdrawals and liquidity removal do not. */
function assertDexNotPaused() {
	const { pause } = mockDexReserve;
	if (!pause.paused) return;
	const symbol = pause.reason ? DEX_TOKEN_VIEW[pause.reason.token].symbol : "a token";
	throw new Error(`The DEX is paused after a reserve check found a shortfall for ${symbol}. Swaps, deposits and liquidity additions are unavailable. Withdrawals and liquidity removal remain available.`);
}
function dexNewTransfer(direction, owner, token, amount, createdAt) {
	const n = nextDexTransferN++;
	const fee = dexTokenFee(token);
	const deposit = direction === DexTransferDirection.deposit;
	const transfer = {
		n,
		direction,
		owner,
		token,
		amount,
		ledgerAmount: deposit ? amount : amount - fee,
		fee,
		from: deposit ? { owner } : dexDepositAccountOf(owner),
		to: deposit ? dexDepositAccountOf(owner) : { owner },
		memoText: `TTTI-${deposit ? "DD" : "DW"}-${n}`,
		createdAtTimeNs: createdAt,
		attempt: 1n,
		sends: 1n,
		status: {
			__kind__: "inProgress",
			inProgress: null
		}
	};
	mockDexTransfers.push(transfer);
	return transfer;
}
function dexTransferReview(t, lastError) {
	return {
		kind: t.direction === DexTransferDirection.deposit ? TransferKind.DD : TransferKind.DW,
		purchaseId: t.n,
		token: t.token,
		memoText: t.memoText,
		memoHex: memoHexOf(t.memoText),
		createdAtTimeNs: t.createdAtTimeNs,
		amount: t.ledgerAmount,
		fee: t.fee,
		destination: t.to,
		sends: t.sends,
		lastError,
		buyer: t.owner
	};
}
function mockDepositToDex(token, amount) {
	const err = (e) => ({
		__kind__: "err",
		err: e
	});
	const info = dexTokenInfo(token);
	if (amount < info.minimumDeposit) return err({
		__kind__: "amountTooSmall",
		amountTooSmall: { minimum: info.minimumDeposit }
	});
	if (token === DexToken.tttiT) {
		const required = amount + info.fee;
		if (mockTttiAllowance < required) return err({
			__kind__: "insufficientAllowance",
			insufficientAllowance: {
				allowance: mockTttiAllowance,
				required
			}
		});
		if (required > 250000n) return err({
			__kind__: "insufficientFunds",
			insufficientFunds: { balance: 250000n }
		});
		mockTttiAllowance = 0n;
	}
	const transfer = dexNewTransfer(DexTransferDirection.deposit, CALLER, token, amount, nowNs());
	transfer.status = {
		__kind__: "completed",
		completed: nextDexBlock++
	};
	dexBalanceOf(CALLER, token).available += amount;
	return {
		__kind__: "ok",
		ok: transfer
	};
}
function mockWithdrawFromDex(token, amount) {
	const err = (e) => ({
		__kind__: "err",
		err: e
	});
	const info = dexTokenInfo(token);
	if (amount < info.minimumWithdrawal) return err({
		__kind__: "amountTooSmall",
		amountTooSmall: { minimum: info.minimumWithdrawal }
	});
	const balance = dexBalanceOf(CALLER, token);
	if (balance.available < amount) return err({
		__kind__: "insufficientBalance",
		insufficientBalance: { available: balance.available }
	});
	balance.available -= amount;
	const transfer = dexNewTransfer(DexTransferDirection.withdrawal, CALLER, token, amount, nowNs());
	transfer.status = {
		__kind__: "completed",
		completed: nextDexBlock++
	};
	return {
		__kind__: "ok",
		ok: transfer
	};
}
/** Arrived: DD credits, DW final debit of the reserved amount, DQ refunded. */
function dexMarkArrived(kind, id, block) {
	if (kind === TransferKind.DQ) {
		const request = mockPairRequests.find((r) => r.id === id);
		if (request) {
			request.refundBlock = block;
			request.refundStatus = {
				__kind__: "refunded",
				refunded: block
			};
		}
		return;
	}
	const transfer = mockDexTransfers.find((t) => t.n === id);
	if (!transfer) return;
	transfer.status = {
		__kind__: "completed",
		completed: block
	};
	const balance = dexBalanceOf(transfer.owner, transfer.token);
	if (kind === TransferKind.DD) balance.available += transfer.amount;
	else balance.reserved -= transfer.amount;
}
/** Not arrived: DD nothing credited, DW given back, DQ new attempt sent by the timer. */
function dexMarkNotArrived(kind, id) {
	if (kind === TransferKind.DQ) {
		const request = mockPairRequests.find((r) => r.id === id);
		if (request) request.refundStatus = {
			__kind__: "inProgress",
			inProgress: null
		};
		return;
	}
	const transfer = mockDexTransfers.find((t) => t.n === id);
	if (!transfer) return;
	transfer.status = {
		__kind__: "failed",
		failed: "Not arrived (admin check)"
	};
	if (kind === TransferKind.DW) {
		const balance = dexBalanceOf(transfer.owner, transfer.token);
		balance.reserved -= transfer.amount;
		balance.available += transfer.amount;
	}
}
{
	const ago = (hours) => nowNs() - hours * HOUR_NS;
	const seedDone = (direction, owner, token, amount, hours) => {
		const t = dexNewTransfer(direction, owner, token, amount, ago(hours));
		t.status = {
			__kind__: "completed",
			completed: nextDexBlock++
		};
		return t;
	};
	seedDone(DexTransferDirection.deposit, CALLER, DexToken.tttiT, 120000n, 72n);
	seedDone(DexTransferDirection.deposit, CALLER, DexToken.icp, ICP_DIVISOR * 6n / 10n, 48n);
	dexBalanceOf(CALLER, DexToken.tttiT).available = 120000n;
	dexBalanceOf(CALLER, DexToken.icp).available = ICP_DIVISOR / 2n;
	seedDone(DexTransferDirection.deposit, HOLDER_2, DexToken.ckbtc, 25000n, 40n);
	dexBalanceOf(HOLDER_2, DexToken.ckbtc).available = 25000n;
	const unknown = "Call timed out (outcome unknown)";
	const dw = dexNewTransfer(DexTransferDirection.withdrawal, CALLER, DexToken.icp, ICP_DIVISOR / 10n, ago(25n));
	dw.status = {
		__kind__: "needsReview",
		needsReview: null
	};
	dw.sends = 4n;
	dw.lastError = unknown;
	dexBalanceOf(CALLER, DexToken.icp).reserved = ICP_DIVISOR / 10n;
	mockReviews.push(dexTransferReview(dw, unknown));
	const dd = dexNewTransfer(DexTransferDirection.deposit, HOLDER_2, DexToken.ckusdc, 5000000n, ago(26n));
	dd.status = {
		__kind__: "needsReview",
		needsReview: null
	};
	dd.sends = 3n;
	dd.lastError = unknown;
	mockReviews.push(dexTransferReview(dd, unknown));
	const approved = dexNewRequest(HOLDER_3, dexReadToken(principalFrom(24)), DEX_ICP, FeeTier.bps30, "", ago(30n));
	approved.status = {
		__kind__: "approved",
		approved: {
			poolId: dexCreatePool(dexRequestToken(approved), DEX_ICP, approved.feeTier, ago(27n), {
				id: approved.id,
				minimums: {
					token0: 100000n,
					token1: 100000n
				}
			}).id,
			at: ago(27n)
		}
	};
	approved.refundStatus = {
		__kind__: "needsReview",
		needsReview: null
	};
	const memoText = dexDqMemo(approved.id);
	mockReviews.push({
		kind: TransferKind.DQ,
		purchaseId: approved.id,
		token: DexToken.tttiT,
		memoText,
		memoHex: memoHexOf(memoText),
		createdAtTimeNs: ago(26n),
		amount: DEX_REQUEST_DEPOSIT - state.fee,
		fee: state.fee,
		destination: { owner: HOLDER_3 },
		sends: 3n,
		lastError: unknown,
		buyer: HOLDER_3
	});
}
var mockPositions = [];
var nextPositionId = 1n;
/** The mock caller is the admin/creator; its positions follow the same rules. */
var DEX_CREATOR = CALLER;
var dexCeilDiv = (a, b) => (a + b - 1n) / b;
var dexMin = (a, b) => a < b ? a : b;
/** Integer square root, rounded down. */
function dexIsqrt(n) {
	if (n < 2n) return n;
	let x = n;
	let y = (x + 1n) / 2n;
	while (y < x) {
		x = y;
		y = (x + n / x) / 2n;
	}
	return x;
}
function dexTokenOfView(view) {
	return DEX_TOKEN_ORDER.find((token) => dexSameLedger(DEX_TOKEN_VIEW[token], view));
}
/** TTTI-T fixed at 10,000 USD; other tokens at the mock hourly rate while usable. */
function dexUsdRate(view) {
	const token = dexTokenOfView(view);
	if (token === void 0) return void 0;
	if (token === DexToken.tttiT) return DEX_TTTI_T_USD_E8;
	return mockPrice().usable ? MOCK_PAY_USD_E8[PAY_OF_DEX[token]] : void 0;
}
function dexGauge(pool, reserve0 = pool.reserve0, reserve1 = pool.reserve1) {
	const rate0 = dexUsdRate(pool.token0);
	const rate1 = dexUsdRate(pool.token1);
	const targetUsdE8 = DEX_LAUNCH_MIN_TOTAL_USD_E8;
	if (rate0 === void 0 || rate1 === void 0) return {
		targetUsdE8,
		valueAvailable: false,
		missingRate: {
			token0: rate0 === void 0,
			token1: rate1 === void 0
		}
	};
	const currentUsdE8 = reserve0 * rate0 / 10n ** BigInt(pool.token0.decimals) + reserve1 * rate1 / 10n ** BigInt(pool.token1.decimals);
	return {
		currentUsdE8,
		targetUsdE8,
		remainingUsdE8: currentUsdE8 >= targetUsdE8 ? 0n : targetUsdE8 - currentUsdE8,
		valueAvailable: true,
		missingRate: {
			token0: false,
			token1: false
		}
	};
}
var dexGaugeOpens = (gauge) => gauge.valueAvailable && (gauge.currentUsdE8 ?? 0n) >= gauge.targetUsdE8;
function dexRefreshOpening(pool) {
	if (pool.status === PoolStatus.filling && dexGaugeOpens(dexGauge(pool))) {
		pool.status = PoolStatus.active;
		pool.acceptsSwaps = true;
	}
}
/** Persists #filling -> #active for every pool whose gauge reaches the target with a usable rate. */
function dexRefreshAllOpenings() {
	for (const pool of mockPools) dexRefreshOpening(pool);
}
function dexPositionView(position) {
	const pool = mockPools.find((p) => p.id === position.poolId);
	const total = pool?.totalShares ?? 0n;
	const unlocked = nowNs() >= position.unlockAt;
	return {
		id: position.id,
		poolId: position.poolId,
		owner: position.owner,
		shares: position.shares,
		amount0: pool && total > 0n ? position.shares * pool.reserve0 / total : 0n,
		amount1: pool && total > 0n ? position.shares * pool.reserve1 / total : 0n,
		token0Symbol: pool?.token0.symbol ?? "",
		token1Symbol: pool?.token1.symbol ?? "",
		createdAt: position.createdAt,
		lockDurationNs: position.unlockAt - position.createdAt,
		unlockAt: position.unlockAt,
		isCreator: position.isCreator,
		unlocked,
		withdrawable: unlocked || pool?.status === PoolStatus.removed
	};
}
function dexPlanAdd(args) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	const pool = mockPools.find((p) => p.id === args.poolId);
	if (!pool) return fail({
		__kind__: "poolNotFound",
		poolNotFound: null
	});
	if (pool.status === PoolStatus.removed) return fail({
		__kind__: "poolRemoved",
		poolRemoved: null
	});
	const token0 = dexTokenOfView(pool.token0);
	const token1 = dexTokenOfView(pool.token1);
	if (token0 === void 0 || token1 === void 0) return fail({
		__kind__: "unsupportedToken",
		unsupportedToken: null
	});
	if (args.amount === 0n) return fail({
		__kind__: "zeroAmount",
		zeroAmount: null
	});
	const onToken0 = args.side === PoolSide.token0;
	const isFirstDeposit = pool.totalShares === 0n;
	let amount0;
	let amount1;
	let shares;
	let lockedShares = 0n;
	if (isFirstDeposit) {
		if (!pool.minimumsSet) return fail({
			__kind__: "minimumsNotSet",
			minimumsNotSet: null
		});
		if (args.counterAmount === void 0) return fail({
			__kind__: "counterAmountRequired",
			counterAmountRequired: null
		});
		if (args.counterAmount === 0n) return fail({
			__kind__: "zeroAmount",
			zeroAmount: null
		});
		amount0 = onToken0 ? args.amount : args.counterAmount;
		amount1 = onToken0 ? args.counterAmount : args.amount;
		const first = pool.firstDepositMinimum;
		if (first.token0 !== void 0 && amount0 < first.token0 || first.token1 !== void 0 && amount1 < first.token1) return fail({
			__kind__: "belowMinimum",
			belowMinimum: {
				...first.token0 !== void 0 ? { token0Minimum: first.token0 } : {},
				...first.token1 !== void 0 ? { token1Minimum: first.token1 } : {}
			}
		});
		const m0 = pool.minimumLocked.token0;
		const m1 = pool.minimumLocked.token1;
		lockedShares = dexIsqrt((m0 ?? (m1 !== void 0 ? dexCeilDiv(m1 * amount0, amount1) : 0n)) * (m1 ?? (m0 !== void 0 ? dexCeilDiv(m0 * amount1, amount0) : 0n)));
		const total = dexIsqrt(amount0 * amount1);
		shares = total > lockedShares ? total - lockedShares : 0n;
	} else {
		if (pool.reserve0 === 0n || pool.reserve1 === 0n) return fail({
			__kind__: "zeroShares",
			zeroShares: null
		});
		amount0 = onToken0 ? args.amount : dexCeilDiv(args.amount * pool.reserve0, pool.reserve1);
		amount1 = onToken0 ? dexCeilDiv(args.amount * pool.reserve1, pool.reserve0) : args.amount;
		const counter = onToken0 ? amount1 : amount0;
		if (args.counterAmount !== void 0 && counter > args.counterAmount) return fail({
			__kind__: "ratioMismatch",
			ratioMismatch: { requiredCounterAmount: counter }
		});
		shares = dexMin(amount0 * pool.totalShares / pool.reserve0, amount1 * pool.totalShares / pool.reserve1);
	}
	if (shares === 0n) return fail({
		__kind__: "zeroShares",
		zeroShares: null
	});
	const gaugeAfter = dexGauge(pool, pool.reserve0 + amount0, pool.reserve1 + amount1);
	return {
		__kind__: "ok",
		ok: {
			pool,
			token0,
			token1,
			quote: {
				poolId: pool.id,
				isFirstDeposit,
				amount0,
				amount1,
				shares,
				lockedShares,
				totalSharesAfter: pool.totalShares + shares + lockedShares,
				gaugeAfter,
				opensPool: pool.status === PoolStatus.filling && dexGaugeOpens(gaugeAfter)
			}
		}
	};
}
function mockQuoteAddLiquidity(args) {
	const plan = dexPlanAdd(args);
	return plan.__kind__ === "err" ? plan : {
		__kind__: "ok",
		ok: plan.ok.quote
	};
}
function mockAddLiquidity(owner, args) {
	if (args.lockDurationNs < DEX_MIN_LOCK_NS) return {
		__kind__: "err",
		err: {
			__kind__: "lockTooShort",
			lockTooShort: { minimumNs: DEX_MIN_LOCK_NS }
		}
	};
	if (args.lockDurationNs > DEX_MAX_LOCK_NS) return {
		__kind__: "err",
		err: {
			__kind__: "lockTooLong",
			lockTooLong: { maximumNs: DEX_MAX_LOCK_NS }
		}
	};
	const plan = dexPlanAdd(args);
	if (plan.__kind__ === "err") return plan;
	const { pool, token0, token1, quote } = plan.ok;
	const balance0 = dexBalanceOf(owner, token0);
	const balance1 = dexBalanceOf(owner, token1);
	for (const [token, balance, required] of [[
		token0,
		balance0,
		quote.amount0
	], [
		token1,
		balance1,
		quote.amount1
	]]) if (balance.available < required) return {
		__kind__: "err",
		err: {
			__kind__: "insufficientBalance",
			insufficientBalance: {
				token,
				available: balance.available,
				required
			}
		}
	};
	balance0.available -= quote.amount0;
	balance1.available -= quote.amount1;
	pool.reserve0 += quote.amount0;
	pool.reserve1 += quote.amount1;
	pool.totalShares = quote.totalSharesAfter;
	pool.lockedShares += quote.lockedShares;
	const now = nowNs();
	const position = {
		id: nextPositionId++,
		poolId: pool.id,
		owner,
		shares: quote.shares,
		createdAt: now,
		unlockAt: now + args.lockDurationNs,
		isCreator: owner.toText() === DEX_CREATOR.toText()
	};
	mockPositions.push(position);
	return {
		__kind__: "ok",
		ok: {
			position: dexPositionView(position),
			amount0: quote.amount0,
			amount1: quote.amount1,
			shares: quote.shares,
			lockedShares: quote.lockedShares,
			pool: dexPoolOut(pool)
		}
	};
}
function mockRemoveLiquidity(positionId) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	const index = mockPositions.findIndex((p) => p.id === positionId);
	if (index < 0) return fail({
		__kind__: "positionNotFound",
		positionNotFound: null
	});
	const position = mockPositions[index];
	if (position.owner.toText() !== CALLER.toText()) return fail({
		__kind__: "notPositionOwner",
		notPositionOwner: null
	});
	const pool = mockPools.find((p) => p.id === position.poolId);
	if (!pool) return fail({
		__kind__: "poolNotFound",
		poolNotFound: null
	});
	if (pool.status !== PoolStatus.removed && nowNs() < position.unlockAt) return fail({
		__kind__: "positionLocked",
		positionLocked: { unlockAt: position.unlockAt }
	});
	const amount0 = position.shares * pool.reserve0 / pool.totalShares;
	const amount1 = position.shares * pool.reserve1 / pool.totalShares;
	pool.reserve0 -= amount0;
	pool.reserve1 -= amount1;
	pool.totalShares -= position.shares;
	const token0 = dexTokenOfView(pool.token0);
	const token1 = dexTokenOfView(pool.token1);
	if (token0 !== void 0) dexBalanceOf(position.owner, token0).available += amount0;
	if (token1 !== void 0) dexBalanceOf(position.owner, token1).available += amount1;
	mockPositions.splice(index, 1);
	return {
		__kind__: "ok",
		ok: {
			positionId,
			poolId: pool.id,
			shares: position.shares,
			amount0,
			amount1,
			pool: dexPoolOut(pool)
		}
	};
}
function mockExtendLock(positionId, newUnlockAt) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	const position = mockPositions.find((p) => p.id === positionId);
	if (!position) return fail({
		__kind__: "positionNotFound",
		positionNotFound: null
	});
	if (position.owner.toText() !== CALLER.toText()) return fail({
		__kind__: "notPositionOwner",
		notPositionOwner: null
	});
	if (newUnlockAt < position.unlockAt) return fail({
		__kind__: "cannotShortenLock",
		cannotShortenLock: { unlockAt: position.unlockAt }
	});
	const maximumUnlockAt = position.createdAt + DEX_MAX_LOCK_NS;
	if (newUnlockAt > maximumUnlockAt) return fail({
		__kind__: "lockTooLong",
		lockTooLong: { maximumUnlockAt }
	});
	position.unlockAt = newUnlockAt;
	return {
		__kind__: "ok",
		ok: dexPositionView(position)
	};
}
function dexPlanSwap(poolId, tokenIn, amountIn, slippageBps) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	const pool = mockPools.find((p) => p.id === poolId);
	if (!pool) return fail({
		__kind__: "poolNotFound",
		poolNotFound: null
	});
	if (pool.status === PoolStatus.removed) return fail({
		__kind__: "poolRemoved",
		poolRemoved: null
	});
	const token0 = dexTokenOfView(pool.token0);
	const token1 = dexTokenOfView(pool.token1);
	if (token0 === void 0 || token1 === void 0) return fail({
		__kind__: "unsupportedToken",
		unsupportedToken: null
	});
	if (tokenIn !== token0 && tokenIn !== token1) return fail({
		__kind__: "tokenNotInPool",
		tokenNotInPool: null
	});
	dexRefreshOpening(pool);
	if (pool.status === PoolStatus.filling) return fail({
		__kind__: "poolFilling",
		poolFilling: { gauge: dexGauge(pool) }
	});
	if (amountIn === 0n) return fail({
		__kind__: "zeroAmount",
		zeroAmount: null
	});
	if (slippageBps > DEX_MAX_SLIPPAGE_BPS) return fail({
		__kind__: "invalidSlippage",
		invalidSlippage: { maximumBps: DEX_MAX_SLIPPAGE_BPS }
	});
	const inIsToken0 = tokenIn === token0;
	const reserveIn = inIsToken0 ? pool.reserve0 : pool.reserve1;
	const reserveOut = inIsToken0 ? pool.reserve1 : pool.reserve0;
	const fee = dexCeilDiv(amountIn * pool.feeBps, DEX_BPS);
	const net = amountIn - fee;
	const amountOut = reserveIn + net === 0n ? 0n : reserveOut * net / (reserveIn + net);
	if (amountOut === 0n || amountOut >= reserveOut) return fail({
		__kind__: "insufficientLiquidity",
		insufficientLiquidity: null
	});
	const protocolFee = fee * DEX_PROTOCOL_FEE_SHARE_PERCENT / 100n;
	const ideal = reserveIn === 0n ? 0n : net * reserveOut / reserveIn;
	const priceImpactBps = ideal > amountOut ? dexCeilDiv((ideal - amountOut) * DEX_BPS, ideal) : 0n;
	return {
		__kind__: "ok",
		ok: {
			pool,
			tokenOut: inIsToken0 ? token1 : token0,
			inIsToken0,
			quote: {
				poolId: pool.id,
				tokenIn,
				tokenOut: inIsToken0 ? token1 : token0,
				amountIn,
				amountOut,
				fee,
				lpFee: fee - protocolFee,
				protocolFee,
				feeBps: pool.feeBps,
				priceImpactBps,
				slippageBps,
				minimumReceived: amountOut * (DEX_BPS - slippageBps) / DEX_BPS,
				maxDeadlineNs: nowNs() + DEX_SWAP_DEADLINE_MAX_NS
			}
		}
	};
}
function mockQuoteSwap(poolId, tokenIn, amountIn, slippageBps) {
	dexRefreshAllOpenings();
	const plan = dexPlanSwap(poolId, tokenIn, amountIn, slippageBps);
	return plan.__kind__ === "err" ? plan : {
		__kind__: "ok",
		ok: plan.ok.quote
	};
}
function mockSwap(poolId, tokenIn, amountIn, minAmountOut, deadline) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	dexRefreshAllOpenings();
	const plan = dexPlanSwap(poolId, tokenIn, amountIn, 0n);
	if (plan.__kind__ === "err") return plan;
	const { pool, tokenOut, inIsToken0, quote } = plan.ok;
	const now = nowNs();
	if (now > deadline) return fail({
		__kind__: "deadlineExceeded",
		deadlineExceeded: {
			deadline,
			now
		}
	});
	const maximum = now + DEX_SWAP_DEADLINE_MAX_NS;
	if (deadline > maximum) return fail({
		__kind__: "deadlineTooFar",
		deadlineTooFar: { maximum }
	});
	if (quote.amountOut < minAmountOut) return fail({
		__kind__: "slippageExceeded",
		slippageExceeded: {
			amountOut: quote.amountOut,
			minAmountOut
		}
	});
	const balanceIn = dexBalanceOf(CALLER, tokenIn);
	if (balanceIn.available < amountIn) return fail({
		__kind__: "insufficientBalance",
		insufficientBalance: { available: balanceIn.available }
	});
	balanceIn.available -= amountIn;
	dexBalanceOf(CALLER, tokenOut).available += quote.amountOut;
	const toReserve = amountIn - quote.protocolFee;
	if (inIsToken0) {
		pool.reserve0 += toReserve;
		pool.protocolFee0 += quote.protocolFee;
		pool.reserve1 -= quote.amountOut;
	} else {
		pool.reserve1 += toReserve;
		pool.protocolFee1 += quote.protocolFee;
		pool.reserve0 -= quote.amountOut;
	}
	return {
		__kind__: "ok",
		ok: {
			poolId: pool.id,
			tokenIn,
			tokenOut,
			amountIn,
			amountOut: quote.amountOut,
			fee: quote.fee,
			lpFee: quote.lpFee,
			protocolFee: quote.protocolFee,
			pool: dexPoolOut(pool)
		}
	};
}
{
	const pool = mockPools.find((p) => dexSameLedger(p.token0, DEX_TTTI) && dexSameLedger(p.token1, DEX_CKUSDT));
	if (pool) {
		dexBalanceOf(HOLDER_2, DexToken.tttiT).available += 180000n;
		dexBalanceOf(HOLDER_2, DexToken.ckusdt).available += 19000000n;
		mockAddLiquidity(HOLDER_2, {
			poolId: pool.id,
			side: PoolSide.token0,
			amount: 180000n,
			counterAmount: 19000000n,
			lockDurationNs: 30n * 24n * HOUR_NS
		});
	}
}
var LOT4_FIVE_YEARS_NS = 157680000000000000n;
var LOT4_DAY_NS = 24n * HOUR_NS;
/** Simulated CMC rate: cycles per ICP. */
var LOT4_CYCLES_PER_ICP = 9200000000000n;
var LOT4_AVG7D = 212000000000n;
var LOT4_AVG30D = 196000000000n;
/** Simulated minimum DL claim: 0.001 ICP. */
var LOT4_MIN_CLAIM_E8S = 100000n;
var lot4Pool = (a, b) => mockPools.find((p) => dexSameLedger(p.token0, a) && dexSameLedger(p.token1, b));
/** 32-byte subaccount holding an ASCII label, zero padded. */
function lot4Subaccount(label) {
	const out = /* @__PURE__ */ new Uint8Array(32);
	out.set(new TextEncoder().encode(label).slice(0, 32));
	return out;
}
function mockAutonomy() {
	const reserveCyclesEstimate = state.reserveBalanceE8s * LOT4_CYCLES_PER_ICP / ICP_DIVISOR;
	const totalCycles = state.cyclesBalance + reserveCyclesEstimate;
	const perDay = LOT4_AVG7D > LOT4_AVG30D ? LOT4_AVG7D : LOT4_AVG30D;
	return {
		cyclesBalance: state.cyclesBalance,
		reserveBalanceE8s: state.reserveBalanceE8s,
		reserveCyclesEstimate,
		totalCycles,
		avg7dCyclesPerDay: LOT4_AVG7D,
		avg30dCyclesPerDay: LOT4_AVG30D,
		autonomyDays: totalCycles / perDay,
		targetDays: 90n,
		sampleCount: 31n * 24n,
		oldestSampleAt: nowNs() - 31n * LOT4_DAY_NS,
		computedAt: nowNs() - HOUR_NS / 4n
	};
}
var mockShareHistory = [
	{
		at: nowNs() - 9n * LOT4_DAY_NS,
		oldShareBps: 4000n,
		newShareBps: 3000n,
		autonomyDays: 132n
	},
	{
		at: nowNs() - 5n * LOT4_DAY_NS,
		oldShareBps: 3000n,
		newShareBps: 2000n,
		autonomyDays: 158n
	},
	{
		at: nowNs() - 2n * LOT4_DAY_NS,
		oldShareBps: 2000n,
		newShareBps: 1000n,
		autonomyDays: 171n
	}
];
function mockCyclesShare() {
	const autonomyDays = mockAutonomy().autonomyDays;
	const last = mockShareHistory[mockShareHistory.length - 1];
	const days = autonomyDays ?? 0n;
	const target = days <= 45n ? 4000n : days >= 180n ? 500n : 4000n - (days - 45n) * 3500n / 135n;
	return {
		shareBps: last.newShareBps,
		targetShareBps: target,
		minShareBps: 500n,
		maxShareBps: 4000n,
		lowAutonomyDays: 45n,
		highAutonomyDays: 180n,
		maxStepBps: 1000n,
		minAdjustIntervalNs: LOT4_DAY_NS,
		lastAdjustAt: last.at,
		nextAdjustAfter: last.at + LOT4_DAY_NS,
		autonomyDays
	};
}
var LOT4_TREASURY_BALANCES = {
	icp: 1240000000n,
	ckbtc: 21000n,
	ckusdc: 85000000n,
	ckusdt: 64000000n
};
function mockMintTreasuryAccounts() {
	const balanceOf = {
		[PayToken.icp]: LOT4_TREASURY_BALANCES.icp,
		[PayToken.ckbtc]: LOT4_TREASURY_BALANCES.ckbtc,
		[PayToken.ckusdc]: LOT4_TREASURY_BALANCES.ckusdc,
		[PayToken.ckusdt]: LOT4_TREASURY_BALANCES.ckusdt
	};
	return PAY_TOKEN_ORDER.map((token) => ({
		token,
		account: {
			owner: TTTI_CANISTER,
			subaccount: lot4Subaccount(`MINT-TREASURY-${PAY_TOKENS[token].symbol.toUpperCase()}`)
		},
		balance: balanceOf[token],
		legacyExternalAccount: state.treasuryConfig.icpAccount ?? void 0
	}));
}
var mockProtocolLiquidity = [];
/** Adds protocol-owned liquidity at the pool ratio: shares with no position. */
function lot4AddProtocolLiquidity(pool, amount0, amount1, source, at) {
	const shares = pool.reserve0 > 0n ? amount0 * pool.totalShares / pool.reserve0 : 0n;
	pool.reserve0 += amount0;
	pool.reserve1 += amount1;
	pool.totalShares += shares;
	let entry = mockProtocolLiquidity.find((e) => e.poolId === pool.id);
	if (!entry) {
		entry = {
			poolId: pool.id,
			shares: 0n,
			fromFees0: 0n,
			fromFees1: 0n,
			fromTreasury0: 0n,
			fromTreasury1: 0n
		};
		mockProtocolLiquidity.push(entry);
	}
	entry.shares += shares;
	if (source === "fees") {
		entry.fromFees0 += amount0;
		entry.fromFees1 += amount1;
	} else {
		entry.fromTreasury0 += amount0;
		entry.fromTreasury1 += amount1;
	}
	entry.lastAddedAt = at;
	return shares;
}
function mockProtocolLiquidityViews() {
	return mockProtocolLiquidity.flatMap((entry) => {
		const pool = mockPools.find((p) => p.id === entry.poolId);
		if (!pool) return [];
		const total = pool.totalShares;
		return [{
			poolId: entry.poolId,
			token0Symbol: pool.token0.symbol,
			token1Symbol: pool.token1.symbol,
			shares: entry.shares,
			totalShares: total,
			amount0: total > 0n ? entry.shares * pool.reserve0 / total : 0n,
			amount1: total > 0n ? entry.shares * pool.reserve1 / total : 0n,
			fromFees0: entry.fromFees0,
			fromFees1: entry.fromFees1,
			fromTreasury0: entry.fromTreasury0,
			fromTreasury1: entry.fromTreasury1,
			lastAddedAt: entry.lastAddedAt
		}];
	});
}
var mockWeeklyAllocations = [];
var lot4UsdcIcpPoolId = 0n;
{
	const pool = lot4Pool(DEX_CKUSDC, DEX_ICP);
	if (pool) {
		lot4UsdcIcpPoolId = pool.id;
		mockSetUtilityPairMinimums(pool.id, {
			token0: 1000000n,
			token1: 10000000n
		});
		dexBalanceOf(HOLDER_3, DexToken.ckusdc).available += 60000000n;
		dexBalanceOf(HOLDER_3, DexToken.icp).available += 480000000n;
		mockAddLiquidity(HOLDER_3, {
			poolId: pool.id,
			side: PoolSide.token0,
			amount: 60000000n,
			counterAmount: 480000000n,
			lockDurationNs: 90n * LOT4_DAY_NS
		});
		lot4AddProtocolLiquidity(pool, 1250000n, 10000000n, "fees", nowNs() - 30n * HOUR_NS);
		const allocationAt = nowNs() - 20n * HOUR_NS;
		const shares = lot4AddProtocolLiquidity(pool, 2500000n, 20000000n, "treasury", allocationAt);
		dexRefreshOpening(pool);
		const ttti = (counter) => lot4Pool(DEX_TTTI, counter)?.id ?? 0n;
		mockWeeklyAllocations.push({
			id: 1n,
			at: allocationAt,
			autonomyDays: mockAutonomy().autonomyDays,
			treasuryBalances: LOT4_TREASURY_BALANCES,
			stockPayoutCap: {
				icp: LOT4_TREASURY_BALANCES.icp / 12n,
				ckbtc: LOT4_TREASURY_BALANCES.ckbtc / 12n,
				ckusdc: LOT4_TREASURY_BALANCES.ckusdc / 12n,
				ckusdt: LOT4_TREASURY_BALANCES.ckusdt / 12n
			},
			toCyclesReserveE8s: 0n,
			surplusE8s: 40000000n,
			toBonusE8s: 20000000n,
			toLiquidity: {
				icp: 20000000n,
				ckbtc: 0n,
				ckusdc: 2500000n,
				ckusdt: 0n
			},
			poolAdds: [{
				poolId: pool.id,
				amount0: 2500000n,
				amount1: 20000000n,
				shares
			}],
			skipped: [
				{
					poolId: ttti(DEX_ICP),
					reason: "No eligible TTTI-T"
				},
				{
					poolId: ttti(DEX_CKUSDT),
					reason: "Pool not yet open"
				},
				{
					poolId: lot4Pool(DEX_CKBTC, DEX_ICP)?.id ?? 0n,
					reason: "Empty pool"
				}
			],
			waiting: {
				icp: 0n,
				ckbtc: 0n,
				ckusdc: 0n,
				ckusdt: 1000000n
			},
			note: "Autonomy above 100 days: surplus split 50 % DL bonus, 50 % protocol liquidity."
		});
	}
}
var mockDcBatches = [];
var mockDcSends = [];
{
	const tttiIcp = lot4Pool(DEX_TTTI, DEX_ICP)?.id ?? 0n;
	const tttiUsdt = lot4Pool(DEX_TTTI, DEX_CKUSDT)?.id ?? 0n;
	const usdcIcp = lot4UsdcIcpPoolId;
	mockDcBatches.push({
		id: 1n,
		at: nowNs() - 3n * LOT4_DAY_NS,
		trigger: DcTrigger.daily,
		legs: [{
			poolId: usdcIcp,
			tokenSymbol: "ckUSDC",
			amountIn: 2400000n,
			referenceIcpOutE8s: 19200000n,
			executionIcpOutE8s: 19050000n,
			deviationBps: 78n,
			converted: true
		}],
		toCyclesE8s: 1905000n,
		toBonusE8s: 17145000n,
		status: {
			__kind__: "sent",
			sent: 18402117n
		}
	}, {
		id: 2n,
		at: nowNs() - 2n * LOT4_DAY_NS,
		trigger: DcTrigger.daily,
		legs: [{
			poolId: usdcIcp,
			tokenSymbol: "ckUSDC",
			amountIn: 1600000n,
			referenceIcpOutE8s: 12800000n,
			executionIcpOutE8s: 12710000n,
			deviationBps: 70n,
			converted: true
		}],
		toCyclesE8s: 1271000n,
		toBonusE8s: 11439000n,
		status: {
			__kind__: "needsReview",
			needsReview: null
		}
	}, {
		id: 3n,
		at: nowNs() - 26n * HOUR_NS,
		trigger: DcTrigger.threshold,
		legs: [{
			poolId: tttiIcp,
			tokenSymbol: "TTTI-T",
			amountIn: 1200n,
			referenceIcpOutE8s: 96000000n,
			executionIcpOutE8s: 92700000n,
			deviationBps: 344n,
			converted: false
		}, {
			poolId: tttiUsdt,
			tokenSymbol: "ckUSDT",
			amountIn: 900000n,
			referenceIcpOutE8s: 7200000n,
			executionIcpOutE8s: 7130000n,
			deviationBps: 97n,
			converted: false
		}],
		toCyclesE8s: 0n,
		toBonusE8s: 0n,
		status: {
			__kind__: "waitingPriceDeviation",
			waitingPriceDeviation: null
		}
	}, {
		id: 4n,
		at: nowNs() - 2n * HOUR_NS,
		trigger: DcTrigger.daily,
		legs: [],
		toCyclesE8s: 0n,
		toBonusE8s: 0n,
		status: {
			__kind__: "nothingToConvert",
			nothingToConvert: null
		}
	});
	mockDcSends.push({
		n: 1n,
		batchId: 1n
	}, {
		n: 2n,
		batchId: 2n
	});
	mockReviews.push(reviewEntry(TransferKind.DC, 2n, "TTTI-DC-2", 1271000n - ICP_LEDGER_FEE, CYCLES_RESERVE_ACCOUNT, 3n, "Call timed out (outcome unknown)"));
}
var mockBonus = {
	claimableE8s: 3750000n,
	claimInProgress: false
};
var mockBonusClaims = [{
	n: 1n,
	amountE8s: 1820000n,
	createdAt: nowNs() - 6n * LOT4_DAY_NS,
	memoText: "TTTI-DL-1",
	status: {
		__kind__: "completed",
		completed: 18390552n
	}
}, {
	n: 2n,
	amountE8s: 940000n,
	createdAt: nowNs() - 30n * HOUR_NS,
	memoText: "TTTI-DL-2",
	status: {
		__kind__: "needsReview",
		needsReview: null
	}
}];
mockReviews.push(reviewEntry(TransferKind.DL, 2n, "TTTI-DL-2", 940000n - ICP_LEDGER_FEE, { owner: CALLER }, 2n, "Call rejected: canister ryjl3-tyaaa-aaaaa-aaaba-cai is stopping (outcome unknown)"));
{
	const pool = lot4Pool(DEX_TTTI, DEX_CKUSDT);
	if (pool) {
		dexBalanceOf(CALLER, DexToken.tttiT).available += 20000n;
		dexBalanceOf(CALLER, DexToken.ckusdt).available += 2200000n;
		const result = mockAddLiquidity(CALLER, {
			poolId: pool.id,
			side: PoolSide.token0,
			amount: 20000n,
			counterAmount: 2200000n,
			lockDurationNs: 365n * LOT4_DAY_NS
		});
		if (result.__kind__ === "ok") {
			dexBalanceOf(CALLER, DexToken.tttiT).available -= 20000n - result.ok.amount0;
			dexBalanceOf(CALLER, DexToken.ckusdt).available -= 2200000n - result.ok.amount1;
		}
	}
}
/** Value of a position in ICP (e8s) at the mock rates; 0 when a rate is missing. */
function lot4PositionValueIcp(position, pool) {
	const rate0 = dexUsdRate(pool.token0);
	const rate1 = dexUsdRate(pool.token1);
	const icpUsd = MOCK_PAY_USD_E8[PayToken.icp];
	if (rate0 === void 0 || rate1 === void 0 || icpUsd === 0n) return 0n;
	return (position.amount0 * rate0 / 10n ** BigInt(pool.token0.decimals) + position.amount1 * rate1 / 10n ** BigInt(pool.token1.decimals)) * ICP_DIVISOR / icpUsd;
}
function mockLpBonusView() {
	const now = nowNs();
	const positions = mockPositions.flatMap((position) => {
		if (position.owner.toText() !== CALLER.toText() || position.unlockAt <= now) return [];
		const pool = mockPools.find((p) => p.id === position.poolId);
		if (!pool || pool.kind !== PoolKind.tttiPair || pool.status === PoolStatus.removed) return [];
		const valueIcpE8s = lot4PositionValueIcp(dexPositionView(position), pool);
		const remainingLockNs = position.unlockAt - now;
		return [{
			positionId: position.id,
			poolId: position.poolId,
			valueIcpE8s,
			remainingLockNs,
			weight: valueIcpE8s * remainingLockNs / LOT4_FIVE_YEARS_NS
		}];
	});
	return {
		claimableE8s: mockBonus.claimableE8s,
		claimedE8s: mockBonusClaims.reduce((sum, c) => sum + c.amountE8s, 0n),
		positions,
		claims: [...mockBonusClaims].reverse()
	};
}
function mockClaimLpBonus() {
	if (CALLER.isAnonymous()) return {
		__kind__: "err",
		err: {
			__kind__: "anonymous",
			anonymous: null
		}
	};
	if (mockBonus.claimInProgress) return {
		__kind__: "err",
		err: {
			__kind__: "claimInProgress",
			claimInProgress: null
		}
	};
	const amountE8s = mockBonus.claimableE8s;
	if (amountE8s === 0n) return {
		__kind__: "err",
		err: {
			__kind__: "nothingToClaim",
			nothingToClaim: null
		}
	};
	if (amountE8s < LOT4_MIN_CLAIM_E8S) return {
		__kind__: "err",
		err: {
			__kind__: "belowMinimum",
			belowMinimum: { minimumE8s: LOT4_MIN_CLAIM_E8S }
		}
	};
	const n = BigInt(mockBonusClaims.length + 1);
	const claim = {
		n,
		amountE8s,
		createdAt: nowNs(),
		memoText: `TTTI-DL-${n}`,
		status: {
			__kind__: "completed",
			completed: 18410000n + n
		}
	};
	mockBonusClaims.push(claim);
	mockBonus.claimableE8s = 0n;
	return {
		__kind__: "ok",
		ok: claim
	};
}
/** Arrived on a DC or DL review: records the block. */
function protocolFeeArrived(kind, n, block) {
	if (kind === TransferKind.DC) {
		const send = mockDcSends.find((d) => d.n === n);
		const batch = send ? mockDcBatches.find((b) => b.id === send.batchId) : void 0;
		if (batch) batch.status = {
			__kind__: "sent",
			sent: block
		};
		return;
	}
	const claim = mockBonusClaims.find((c) => c.n === n);
	if (claim) claim.status = {
		__kind__: "completed",
		completed: block
	};
}
/** Not arrived on a DC or DL review: a new attempt is open, sent by the timer. */
function protocolFeeNotArrived(kind, n) {
	if (kind === TransferKind.DC) {
		const send = mockDcSends.find((d) => d.n === n);
		const batch = send ? mockDcBatches.find((b) => b.id === send.batchId) : void 0;
		if (batch) batch.status = {
			__kind__: "sending",
			sending: null
		};
		return;
	}
	const claim = mockBonusClaims.find((c) => c.n === n);
	if (claim) claim.status = {
		__kind__: "inProgress",
		inProgress: null
	};
}
/** Past automatic owner sends keep their destination; ckUSDT keeps an accumulated amount not yet withdrawn. */
var OWNER_WALLET = principalFrom(21);
var mockOwnerDestinations = {
	[PayToken.icp]: {
		account: { owner: OWNER_WALLET },
		accumulated: 0n
	},
	[PayToken.ckbtc]: {
		account: { owner: OWNER_WALLET },
		accumulated: 0n
	},
	[PayToken.ckusdc]: {
		account: {
			owner: OWNER_WALLET,
			subaccount: lot4Subaccount("OWNER-CKUSDC")
		},
		accumulated: 0n
	},
	[PayToken.ckusdt]: { accumulated: 49504950n }
};
var mockOwnerSends = [];
function pushOwnerSend(token, amount, source, status, ageNs, lastError) {
	const id = BigInt(mockOwnerSends.length + 1);
	const at = nowNs() - ageNs;
	const prefix = source.__kind__ === "treasurySweep" ? "SR" : "OW";
	const send = {
		id,
		token,
		amount,
		fee: PAY_TOKENS[token].fee,
		destination: mockOwnerDestinations[token].account ?? { owner: OWNER_WALLET },
		source,
		status,
		block: status.__kind__ === "sent" ? status.sent : void 0,
		memoText: `TTTI-${prefix}-${id}`,
		createdAtTimeNs: at,
		attempt: 1n,
		sends: status.__kind__ === "pending" ? 0n : 1n,
		lastError,
		createdAt: at,
		updatedAt: at
	};
	mockOwnerSends.push(send);
	return send;
}
var SWEEP_RESERVE_TOP_UP_E8S = 54330000n;
var mockSweepTokens = [];
{
	const icp = pushOwnerSend(PayToken.icp, LOT4_TREASURY_BALANCES.icp - SWEEP_RESERVE_TOP_UP_E8S - 2n * ICP_LEDGER_FEE, {
		__kind__: "treasurySweep",
		treasurySweep: null
	}, {
		__kind__: "sent",
		sent: 18420001n
	}, 4n * LOT4_DAY_NS);
	const ckbtc = pushOwnerSend(PayToken.ckbtc, LOT4_TREASURY_BALANCES.ckbtc - PAY_TOKENS[PayToken.ckbtc].fee, {
		__kind__: "treasurySweep",
		treasurySweep: null
	}, {
		__kind__: "sent",
		sent: 2310455n
	}, 4n * LOT4_DAY_NS);
	const ckusdc = pushOwnerSend(PayToken.ckusdc, LOT4_TREASURY_BALANCES.ckusdc - PAY_TOKENS[PayToken.ckusdc].fee, {
		__kind__: "treasurySweep",
		treasurySweep: null
	}, {
		__kind__: "needsReview",
		needsReview: null
	}, 4n * LOT4_DAY_NS, "Call timed out (outcome unknown)");
	mockSweepTokens.push({
		token: PayToken.icp,
		balance: LOT4_TREASURY_BALANCES.icp,
		status: {
			__kind__: "sent",
			sent: icp.id
		}
	}, {
		token: PayToken.ckbtc,
		balance: LOT4_TREASURY_BALANCES.ckbtc,
		status: {
			__kind__: "sent",
			sent: ckbtc.id
		}
	}, {
		token: PayToken.ckusdc,
		balance: LOT4_TREASURY_BALANCES.ckusdc,
		status: {
			__kind__: "sending",
			sending: ckusdc.id
		}
	}, {
		token: PayToken.ckusdt,
		balance: LOT4_TREASURY_BALANCES.ckusdt,
		status: {
			__kind__: "waitingDestination",
			waitingDestination: null
		}
	});
	pushOwnerSend(PayToken.icp, 99009900n, {
		__kind__: "mint",
		mint: 41n
	}, {
		__kind__: "sent",
		sent: 18431220n
	}, 30n * HOUR_NS);
	pushOwnerSend(PayToken.ckbtc, 15346n, {
		__kind__: "mint",
		mint: 42n
	}, {
		__kind__: "failed",
		failed: "InsufficientFunds (mock)"
	}, 20n * HOUR_NS, "InsufficientFunds (mock)");
	const owReview = pushOwnerSend(PayToken.ckusdc, 4950495n, {
		__kind__: "mint",
		mint: 43n
	}, {
		__kind__: "needsReview",
		needsReview: null
	}, 25n * HOUR_NS, "Call rejected (outcome unknown)");
	pushOwnerSend(PayToken.icp, 19801980n, {
		__kind__: "mint",
		mint: 44n
	}, {
		__kind__: "pending",
		pending: null
	}, HOUR_NS / 6n);
	mockReviews.push({
		...reviewEntry(TransferKind.OW, owReview.id, owReview.memoText, owReview.amount, owReview.destination, 2n, "Call rejected (outcome unknown)"),
		token: DexToken.ckusdc,
		fee: owReview.fee
	}, {
		...reviewEntry(TransferKind.SR, ckusdc.id, ckusdc.memoText, ckusdc.amount, ckusdc.destination, 3n, "Call timed out (outcome unknown)"),
		token: DexToken.ckusdc,
		fee: ckusdc.fee
	});
}
var mockSweep = {
	status: SweepStatus.sending,
	startedAt: nowNs() - 4n * LOT4_DAY_NS,
	completedAt: void 0,
	reserveTopUpE8s: SWEEP_RESERVE_TOP_UP_E8S,
	reserveTopUpBlock: 18419998n,
	reserveTopUpMemo: "TTTI-SR-0"
};
function mockSweepView() {
	return {
		...mockSweep,
		tokens: mockSweepTokens.map((t) => ({ ...t }))
	};
}
var mockWithdrawals = [];
function pushWithdrawal(token, source, amount, destination, status, ageNs) {
	const id = BigInt(mockWithdrawals.length + 1);
	const at = nowNs() - ageNs;
	const view = {
		id,
		token,
		source,
		amount,
		fee: PAY_TOKENS[token].fee,
		destination,
		status,
		block: status.__kind__ === "sent" ? status.sent : void 0,
		memoText: `TTTI-OW-${id}`,
		createdAtTimeNs: at,
		attempt: 1n,
		sends: status.__kind__ === "pending" ? 0n : 1n,
		createdAt: at,
		updatedAt: at,
		requestedBy: CALLER
	};
	mockWithdrawals.push(view);
	return view;
}
pushWithdrawal(PayToken.icp, TreasurySource.mintTreasury, 150000000n, { owner: OWNER_WALLET }, {
	__kind__: "sent",
	sent: 18460120n
}, 3n * LOT4_DAY_NS);
pushWithdrawal(PayToken.ckusdc, TreasurySource.accumulated, 20000000n, {
	owner: OWNER_WALLET,
	subaccount: lot4Subaccount("OWNER-CKUSDC")
}, {
	__kind__: "sent",
	sent: 2330871n
}, 2n * LOT4_DAY_NS);
pushWithdrawal(PayToken.ckbtc, TreasurySource.mintTreasury, 50000n, { owner: OWNER_WALLET }, {
	__kind__: "needsReview",
	needsReview: null
}, LOT4_DAY_NS);
var HISTORY_TOKEN = {
	[PayToken.icp]: HistoryToken.icp,
	[PayToken.ckbtc]: HistoryToken.ckbtc,
	[PayToken.ckusdc]: HistoryToken.ckusdc,
	[PayToken.ckusdt]: HistoryToken.ckusdt
};
function receivingWallet(token, wallet, ageNs) {
	return wallet ? {
		token,
		wallet,
		accountText: encodeAccountText(wallet),
		setAt: nowNs() - ageNs,
		setBy: CALLER
	} : { token };
}
/** ckUSDT has no receiving wallet yet: a ckUSDT mint is refused and its settlement waits. */
var mockReceivingWallets = {
	[PayToken.icp]: receivingWallet(PayToken.icp, { owner: OWNER_WALLET }, 2n * LOT4_DAY_NS),
	[PayToken.ckbtc]: receivingWallet(PayToken.ckbtc, { owner: OWNER_WALLET }, 2n * LOT4_DAY_NS),
	[PayToken.ckusdc]: receivingWallet(PayToken.ckusdc, {
		owner: OWNER_WALLET,
		subaccount: lot4Subaccount("OWNER-CKUSDC")
	}, 2n * LOT4_DAY_NS),
	[PayToken.ckusdt]: receivingWallet(PayToken.ckusdt, void 0, 0n)
};
var mockHistory = [];
function pushHistory(row) {
	const entry = {
		id: `H-${mockHistory.length + 1}`,
		...row
	};
	mockHistory.push(entry);
	return entry;
}
var sendStatusText = (status) => status.__kind__ === "sent" ? "Sent" : status.__kind__ === "needsReview" ? "To review" : status.__kind__ === "failed" ? "Failed" : "Pending";
for (const send of mockOwnerSends) {
	if (send.source.__kind__ !== "mint") continue;
	pushHistory({
		kind: HistoryKind.revenueSent,
		token: HISTORY_TOKEN[send.token],
		amount: send.amount,
		status: sendStatusText(send.status),
		detail: `Mint #${send.source.mint}: 100/101 share sent to the receiving wallet`,
		counterparty: encodeAccountText(send.destination),
		memo: send.memoText,
		block: send.block,
		timestamp: send.createdAt
	});
}
for (const token of PAY_TOKEN_ORDER) {
	const view = mockReceivingWallets[token];
	if (!view.wallet || view.setAt === void 0) continue;
	pushHistory({
		kind: HistoryKind.destination,
		token: HISTORY_TOKEN[token],
		status: "Set",
		detail: `Receiving wallet set for ${PAY_TOKENS[token].symbol}`,
		counterparty: view.accountText,
		timestamp: view.setAt
	});
}
pushHistory({
	kind: HistoryKind.mintDeposit,
	token: HistoryToken.icp,
	amount: 101000000n,
	status: "Completed",
	detail: "Mint #41: 1.01 ICP paid, 0.0001 TTTI-T minted",
	counterparty: HOLDER_2.toText(),
	memo: "TTTI-PC-41",
	block: 18431219n,
	timestamp: nowNs() - 30n * HOUR_NS
});
pushHistory({
	kind: HistoryKind.swap,
	token: HistoryToken.ckusdt,
	amount: 25000000n,
	status: "Completed",
	detail: "Routed swap ckUSDT -> TTTI-T through ICPSwap",
	counterparty: HOLDER_2.toText(),
	timestamp: nowNs() - 3n * HOUR_NS
});
pushHistory({
	kind: HistoryKind.liquidity,
	token: HistoryToken.icp,
	amount: 150000000n,
	status: "Completed",
	detail: "Mint fee set-aside added as permanent liquidity to the TTTI-T/ICP pool",
	timestamp: nowNs() - 2n * LOT4_DAY_NS
});
pushHistory({
	kind: HistoryKind.buyback,
	token: HistoryToken.tttiT,
	amount: 5000n,
	status: "Completed",
	detail: "Buyback of 0.00005 TTTI-T paid in ICP",
	counterparty: HOLDER_3.toText(),
	memo: "TTTI-BB-1-1",
	block: 18401552n,
	timestamp: nowNs() - 6n * LOT4_DAY_NS
});
pushHistory({
	kind: HistoryKind.refund,
	token: HistoryToken.icp,
	amount: ICP_DIVISOR / 10n,
	status: "To review",
	detail: "Purchase refund with no confirmed outcome after 23 h",
	counterparty: HOLDER_2.toText(),
	memo: "TTTI-RF-1",
	timestamp: nowNs() - 27n * HOUR_NS
});
function mockListAdminHistory(filter, token, offset, limit) {
	const rows = mockHistory.filter((row) => filter === HistoryFilter.all || row.kind === filter).filter((row) => token === null || row.token === token).sort((a, b) => a.timestamp === b.timestamp ? 0 : a.timestamp > b.timestamp ? -1 : 1);
	return {
		__kind__: "ok",
		ok: {
			total: BigInt(rows.length),
			offset,
			limit,
			items: rows.slice(Number(offset), Number(offset + limit))
		}
	};
}
var MINT_FEE_SUBACCOUNT = lot4Subaccount("MINT-FEE-ACCOUNT");
/** Fees received by mints made in this session, on top of the seeded totals. */
var mockFeeReceived = {
	[PayToken.icp]: 0n,
	[PayToken.ckbtc]: 0n,
	[PayToken.ckusdc]: 0n,
	[PayToken.ckusdt]: 0n
};
function mockFeeAccount() {
	return {
		owner: TTTI_CANISTER,
		subaccountHex: Array.from(MINT_FEE_SUBACCOUNT).map((b) => b.toString(16).padStart(2, "0")).join(""),
		accountText: encodeAccountText({
			owner: TTTI_CANISTER,
			subaccount: MINT_FEE_SUBACCOUNT
		}),
		readAt: nowNs(),
		tokens: PAY_TOKEN_ORDER.map((token) => {
			const lp = mockMintFeeBalances[token];
			const setAside = mockSetAside[token];
			const redistributedToLps = lp.claimable + lp.claimed;
			const extra = mockFeeReceived[token];
			return {
				token,
				received: redistributedToLps + setAside.totalReceived + extra,
				redistributedToLps,
				setAside: setAside.amount,
				injected: setAside.totalInjected,
				balance: lp.claimable + setAside.amount + extra
			};
		})
	};
}
/** Sends the 100/101 share of a mint to the receiving wallet and records a Revenue sent row. */
function recordMintRevenue(token, mintId, ownerShare, feeAmount) {
	const wallet = mockReceivingWallets[token].wallet;
	if (!wallet) return;
	mockFeeReceived[token] += feeAmount;
	const amount = ownerShare - PAY_TOKENS[token].fee;
	const block = 18480000n + BigInt(mockOwnerSends.length);
	const send = pushOwnerSend(token, amount, {
		__kind__: "mint",
		mint: mintId
	}, {
		__kind__: "sent",
		sent: block
	}, 0n);
	send.destination = wallet;
	pushHistory({
		kind: HistoryKind.mintDeposit,
		token: HISTORY_TOKEN[token],
		amount: ownerShare + feeAmount,
		status: "Completed",
		detail: `Mint #${mintId}: payment received`,
		counterparty: CALLER.toText(),
		timestamp: send.createdAt
	});
	pushHistory({
		kind: HistoryKind.revenueSent,
		token: HISTORY_TOKEN[token],
		amount,
		status: sendStatusText(send.status),
		detail: `Mint #${mintId}: 100/101 share sent to the receiving wallet`,
		counterparty: encodeAccountText(wallet),
		memo: send.memoText,
		block,
		timestamp: send.createdAt
	});
}
function settlementLeg(n, purpose, amount, destination, status) {
	return {
		purpose,
		amount,
		destination,
		memoText: `TTTI-ST-${n}`,
		status,
		block: status.__kind__ === "sent" ? status.sent : void 0
	};
}
var FEE_ACCOUNT = {
	owner: TTTI_CANISTER,
	subaccount: MINT_FEE_SUBACCOUNT
};
var SETTLED_AT = nowNs() - LOT4_DAY_NS;
var mockSettlements = [
	{
		token: PayToken.icp,
		ownerAmount: 162450000n,
		feeAmount: 1240000n,
		destination: { owner: OWNER_WALLET },
		status: {
			__kind__: "sent",
			sent: [18470101n, 18470102n]
		},
		startedAt: SETTLED_AT,
		completedAt: SETTLED_AT + 60000000000n,
		legs: [settlementLeg(1, SettlementLegPurpose.ownerMintTreasury, 162450000n, { owner: OWNER_WALLET }, {
			__kind__: "sent",
			sent: 18470101n
		}), settlementLeg(2, SettlementLegPurpose.feeLegacy, 1240000n, FEE_ACCOUNT, {
			__kind__: "sent",
			sent: 18470102n
		})]
	},
	{
		token: PayToken.ckbtc,
		ownerAmount: 134200n,
		feeAmount: 0n,
		destination: { owner: OWNER_WALLET },
		status: {
			__kind__: "sent",
			sent: [2340010n]
		},
		startedAt: SETTLED_AT,
		completedAt: SETTLED_AT + 60000000000n,
		legs: [settlementLeg(3, SettlementLegPurpose.ownerMintTreasury, 134200n, { owner: OWNER_WALLET }, {
			__kind__: "sent",
			sent: 2340010n
		})]
	},
	{
		token: PayToken.ckusdc,
		ownerAmount: 76400000n,
		feeAmount: 260000n,
		destination: mockReceivingWallets[PayToken.ckusdc].wallet,
		status: {
			__kind__: "toReview",
			toReview: null
		},
		startedAt: SETTLED_AT,
		lastError: "Call timed out (outcome unknown)",
		legs: [settlementLeg(4, SettlementLegPurpose.ownerMintTreasury, 76400000n, mockReceivingWallets[PayToken.ckusdc].wallet ?? { owner: OWNER_WALLET }, {
			__kind__: "needsReview",
			needsReview: null
		}), settlementLeg(5, SettlementLegPurpose.feePending, 260000n, FEE_ACCOUNT, {
			__kind__: "sent",
			sent: 2340011n
		})]
	},
	{
		token: PayToken.ckusdt,
		ownerAmount: mockOwnerDestinations[PayToken.ckusdt].accumulated + 41250000n,
		feeAmount: 8000n,
		status: {
			__kind__: "pendingWallet",
			pendingWallet: null
		},
		legs: []
	}
];
{
	const leg = mockSettlements[2].legs[0];
	mockReviews.push({
		...reviewEntry(TransferKind.ST, 4n, leg.memoText, leg.amount, leg.destination, 3n, "Call timed out (outcome unknown)"),
		token: DexToken.ckusdc,
		fee: PAY_TOKENS[PayToken.ckusdc].fee
	});
	for (const settlement of mockSettlements) for (const l of settlement.legs) pushHistory({
		kind: HistoryKind.revenueSent,
		token: HISTORY_TOKEN[settlement.token],
		amount: l.amount,
		status: sendStatusText(l.status),
		detail: `One-time settlement (${l.purpose})`,
		counterparty: encodeAccountText(l.destination),
		memo: l.memoText,
		block: l.block,
		timestamp: SETTLED_AT
	});
}
function mockSetReceivingWallet(token, account) {
	if (account.owner.isAnonymous()) return {
		__kind__: "err",
		err: {
			__kind__: "anonymousOwner",
			anonymousOwner: null
		}
	};
	if (account.owner.toText() === TTTI_CANISTER.toText()) return {
		__kind__: "err",
		err: {
			__kind__: "contractAccount",
			contractAccount: null
		}
	};
	if (account.subaccount !== void 0 && account.subaccount.length !== 32) return {
		__kind__: "err",
		err: {
			__kind__: "invalidSubaccount",
			invalidSubaccount: null
		}
	};
	const view = receivingWallet(token, account, 0n);
	mockReceivingWallets[token] = view;
	pushHistory({
		kind: HistoryKind.destination,
		token: HISTORY_TOKEN[token],
		status: "Set",
		detail: `Receiving wallet set for ${PAY_TOKENS[token].symbol}`,
		counterparty: view.accountText,
		timestamp: view.setAt ?? nowNs()
	});
	const settlement = mockSettlements.find((s) => s.token === token);
	if (settlement && settlement.status.__kind__ === "pendingWallet") {
		const n = mockSettlements.reduce((sum, s) => sum + s.legs.length, 0) + 1;
		const ownerBlock = 18490000n + BigInt(n);
		settlement.destination = account;
		settlement.startedAt = nowNs();
		settlement.legs = [settlementLeg(n, SettlementLegPurpose.ownerAccumulated, settlement.ownerAmount, account, {
			__kind__: "sent",
			sent: ownerBlock
		}), settlementLeg(n + 1, SettlementLegPurpose.feePending, settlement.feeAmount, FEE_ACCOUNT, {
			__kind__: "sent",
			sent: ownerBlock + 1n
		})];
		settlement.status = {
			__kind__: "sent",
			sent: [ownerBlock, ownerBlock + 1n]
		};
		settlement.completedAt = nowNs();
		for (const l of settlement.legs) pushHistory({
			kind: HistoryKind.revenueSent,
			token: HISTORY_TOKEN[token],
			amount: l.amount,
			status: "Sent",
			detail: `One-time settlement (${l.purpose})`,
			counterparty: encodeAccountText(l.destination),
			memo: l.memoText,
			block: l.block,
			timestamp: nowNs()
		});
	}
	return {
		__kind__: "ok",
		ok: { ...view }
	};
}
function mockReviewsFiltered(filter) {
	return mockReviews.filter((r) => (filter.kinds.length === 0 || filter.kinds.includes(r.kind)) && (filter.token === void 0 || r.token === filter.token));
}
/** Arrived / Not arrived on an OW or SR review. */
function ownerSendReviewed(id, block) {
	const send = mockOwnerSends.find((s) => s.id === id);
	if (!send) return;
	send.status = block === null ? {
		__kind__: "pending",
		pending: null
	} : {
		__kind__: "sent",
		sent: block
	};
	send.block = block ?? void 0;
	send.updatedAt = nowNs();
	const sweep = mockSweepTokens.find((t) => t.status.__kind__ === "sending" && t.status.sending === id);
	if (sweep && block !== null) {
		sweep.status = {
			__kind__: "sent",
			sent: id
		};
		if (mockSweepTokens.every((t) => t.status.__kind__ !== "sending")) {
			mockSweep.status = SweepStatus.completed;
			mockSweep.completedAt = nowNs();
		}
	}
}
var mockMintFeeBalances = {
	[PayToken.icp]: {
		claimable: 1240000n,
		claimed: 0n
	},
	[PayToken.ckbtc]: {
		claimable: 0n,
		claimed: 0n
	},
	[PayToken.ckusdc]: {
		claimable: 260000n,
		claimed: 140000n
	},
	[PayToken.ckusdt]: {
		claimable: 8000n,
		claimed: 0n
	}
};
var mockMintFeeClaims = [{
	n: 1n,
	token: PayToken.ckusdc,
	amount: 140000n,
	createdAt: nowNs() - 5n * LOT4_DAY_NS,
	memoText: "TTTI-MF-1",
	status: {
		__kind__: "completed",
		completed: 1904221n
	}
}, {
	n: 2n,
	token: PayToken.icp,
	amount: 600000n,
	createdAt: nowNs() - 28n * HOUR_NS,
	memoText: "TTTI-MF-2",
	status: {
		__kind__: "needsReview",
		needsReview: null
	}
}];
mockReviews.push(reviewEntry(TransferKind.MF, 2n, "TTTI-MF-2", 600000n - ICP_LEDGER_FEE, { owner: CALLER }, 2n, "Call timed out (outcome unknown)"));
var mockMintFeeClaimsInProgress = /* @__PURE__ */ new Set();
function mockMyMintFees() {
	return {
		balances: PAY_TOKEN_ORDER.map((token) => ({
			token,
			...mockMintFeeBalances[token]
		})),
		claims: [...mockMintFeeClaims].reverse()
	};
}
function mockClaimMintFee(token) {
	if (CALLER.isAnonymous()) return {
		__kind__: "err",
		err: {
			__kind__: "anonymous",
			anonymous: null
		}
	};
	if (mockMintFeeClaimsInProgress.has(token)) return {
		__kind__: "err",
		err: {
			__kind__: "claimInProgress",
			claimInProgress: null
		}
	};
	const balance = mockMintFeeBalances[token];
	if (balance.claimable === 0n) return {
		__kind__: "err",
		err: {
			__kind__: "nothingToClaim",
			nothingToClaim: null
		}
	};
	const fee = PAY_TOKENS[token].fee;
	if (balance.claimable <= fee) return {
		__kind__: "err",
		err: {
			__kind__: "belowLedgerFee",
			belowLedgerFee: { fee }
		}
	};
	const n = BigInt(mockMintFeeClaims.length + 1);
	const claim = {
		n,
		token,
		amount: balance.claimable,
		createdAt: nowNs(),
		memoText: `TTTI-MF-${n}`,
		status: {
			__kind__: "completed",
			completed: 1905000n + n
		}
	};
	mockMintFeeClaims.push(claim);
	balance.claimed += balance.claimable;
	balance.claimable = 0n;
	return {
		__kind__: "ok",
		ok: claim
	};
}
function mintFeeReviewed(n, block) {
	const claim = mockMintFeeClaims.find((c) => c.n === n);
	if (claim) claim.status = block === null ? {
		__kind__: "inProgress",
		inProgress: null
	} : {
		__kind__: "completed",
		completed: block
	};
}
var SET_ASIDE_THRESHOLD_USD_E8 = 1000000000n;
var ICPSWAP_POOL = principalFrom(31);
var mockSetAside = {
	[PayToken.icp]: {
		amount: 310000n,
		totalReceived: 150310000n,
		totalInjected: 150000000n,
		lastInjectionAt: nowNs() - 2n * LOT4_DAY_NS
	},
	[PayToken.ckbtc]: {
		amount: 0n,
		totalReceived: 0n,
		totalInjected: 0n
	},
	[PayToken.ckusdc]: {
		amount: 0n,
		totalReceived: 0n,
		totalInjected: 0n
	},
	[PayToken.ckusdt]: {
		amount: 4200000n,
		totalReceived: 4200000n,
		totalInjected: 0n
	}
};
var SET_ASIDE_POOL = {
	[PayToken.icp]: DEX_ICP,
	[PayToken.ckbtc]: DEX_CKBTC,
	[PayToken.ckusdc]: DEX_CKUSDC,
	[PayToken.ckusdt]: DEX_CKUSDT
};
function mockSetAsideViews() {
	return PAY_TOKEN_ORDER.map((token) => {
		const entry = mockSetAside[token];
		const rate = MOCK_PAY_USD_E8[token];
		return {
			token,
			...entry,
			valueUsdE8: rate > 0n ? entry.amount * rate / 10n ** BigInt(PAY_TOKENS[token].decimals) : void 0,
			thresholdUsdE8: SET_ASIDE_THRESHOLD_USD_E8,
			targetPoolId: lot4Pool(DEX_TTTI, SET_ASIDE_POOL[token])?.id
		};
	});
}
var mockInjections = [{
	id: 1n,
	token: PayToken.icp,
	poolId: lot4Pool(DEX_TTTI, DEX_ICP)?.id ?? 1n,
	venue: {
		__kind__: "icpswap",
		icpswap: ICPSWAP_POOL
	},
	amountIn: 150000000n,
	swapAmountIn: 75000000n,
	pairAmountIn: 75000000n,
	minTttiOut: 49500n,
	tttiReceived: 50120n,
	used0: 50120n,
	used1: 75000000n,
	liquidityShares: 1936018n,
	status: {
		__kind__: "completed",
		completed: null
	},
	startedAt: nowNs() - 2n * LOT4_DAY_NS,
	updatedAt: nowNs() - 2n * LOT4_DAY_NS + 60000000000n
}];
var ROUTER_PROTOCOL_FEE_BPS = 10n;
var ROUTER_ICPSWAP_FEE_BPS = 30n;
var ROUTER_LP_PERCENT = 70n;
/** Simulated ICPSwap depth: 2,000 USD on each side of every registry pair. */
var ROUTER_ICPSWAP_DEPTH_USD_E8 = 2000n * DEX_USD_RATE_SCALE;
var mockIcpswapPools = /* @__PURE__ */ new Map();
var mockRoutedSwaps = [];
var mockRouterFees = /* @__PURE__ */ new Map();
var nextRoutedSwapId = 1n;
var routerPairKey = (a, b) => [a, b].sort().join("/");
function routerUsdE8(token) {
	return token === DexToken.tttiT ? DEX_TTTI_T_USD_E8 : MOCK_PAY_USD_E8[PAY_OF_DEX[token]];
}
function routerIcpswapPool(a, b) {
	const key = routerPairKey(a, b);
	let pool = mockIcpswapPools.get(key);
	if (!pool) {
		const reserves = /* @__PURE__ */ new Map();
		for (const token of [a, b]) {
			const scale = 10n ** BigInt(DEX_TOKEN_VIEW[token].decimals);
			reserves.set(token, ROUTER_ICPSWAP_DEPTH_USD_E8 * scale / routerUsdE8(token));
		}
		pool = {
			canisterId: principalFrom(40 + mockIcpswapPools.size),
			reserves
		};
		mockIcpswapPools.set(key, pool);
	}
	return pool;
}
function routerIcpswapLeg(tokenIn, tokenOut, amountIn) {
	const pool = routerIcpswapPool(tokenIn, tokenOut);
	const reserveIn = pool.reserves.get(tokenIn) ?? 0n;
	const reserveOut = pool.reserves.get(tokenOut) ?? 0n;
	const protocolFee = dexCeilDiv(amountIn * ROUTER_PROTOCOL_FEE_BPS, DEX_BPS);
	const sent = amountIn - protocolFee;
	const icpswapFee = dexCeilDiv(sent * ROUTER_ICPSWAP_FEE_BPS, DEX_BPS);
	const net = sent - icpswapFee;
	const amountOut = net <= 0n ? 0n : reserveOut * net / (reserveIn + net);
	if (amountOut === 0n || amountOut >= reserveOut) return null;
	const protocolLpShare = protocolFee * ROUTER_LP_PERCENT / 100n;
	return {
		route: {
			__kind__: "icpswap",
			icpswap: { poolCanisterId: pool.canisterId }
		},
		amountOut,
		fees: {
			__kind__: "icpswap",
			icpswap: {
				icpswapFeeBps: ROUTER_ICPSWAP_FEE_BPS,
				icpswapFee,
				protocolFeeBps: ROUTER_PROTOCOL_FEE_BPS,
				protocolFee,
				protocolLpShare,
				protocolPermanentShare: protocolFee - protocolLpShare
			}
		}
	};
}
function routerNativeLeg(pool, tokenIn, amountIn) {
	const plan = dexPlanSwap(pool.id, tokenIn, amountIn, 0n);
	if (plan.__kind__ === "err") return null;
	return {
		route: {
			__kind__: "native",
			native: { poolId: pool.id }
		},
		amountOut: plan.ok.quote.amountOut,
		fees: {
			__kind__: "native",
			native: {
				feeBps: plan.ok.quote.feeBps,
				fee: plan.ok.quote.fee
			}
		}
	};
}
function routerNativePool(tokenIn, tokenOut) {
	const pools = mockPools.filter((p) => {
		const t0 = dexTokenOfView(p.token0);
		const t1 = dexTokenOfView(p.token1);
		return t0 === tokenIn && t1 === tokenOut || t0 === tokenOut && t1 === tokenIn;
	});
	return pools.find((p) => p.status !== PoolStatus.removed) ?? pools[0];
}
var sameRoute = (a, b) => a.__kind__ === "native" ? b.__kind__ === "native" && a.native.poolId === b.native.poolId : b.__kind__ === "icpswap" && a.icpswap.poolCanisterId.toText() === b.icpswap.poolCanisterId.toText();
function mockQuoteRoutedSwap(args) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	const { tokenIn, tokenOut, amountIn, slippageBps } = args;
	if (amountIn === 0n) return fail({
		__kind__: "zeroAmount",
		zeroAmount: null
	});
	if (tokenIn === tokenOut) return fail({
		__kind__: "sameToken",
		sameToken: null
	});
	if (slippageBps > DEX_MAX_SLIPPAGE_BPS) return fail({
		__kind__: "invalidSlippage",
		invalidSlippage: { maximumBps: DEX_MAX_SLIPPAGE_BPS }
	});
	dexRefreshAllOpenings();
	const pool = routerNativePool(tokenIn, tokenOut);
	if (!pool) return fail({
		__kind__: "pairNotFound",
		pairNotFound: null
	});
	if (pool.status === PoolStatus.removed) return fail({
		__kind__: "pairRemoved",
		pairRemoved: null
	});
	const native = routerNativeLeg(pool, tokenIn, amountIn);
	const icpswap = routerIcpswapLeg(tokenIn, tokenOut, amountIn);
	let chosen;
	let alternative;
	let reason;
	if (native && icpswap) {
		const nativeWins = native.amountOut >= icpswap.amountOut;
		chosen = nativeWins ? native : icpswap;
		alternative = nativeWins ? icpswap : native;
		reason = RouteReason.bestAmount;
	} else if (icpswap) [chosen, alternative, reason] = [
		icpswap,
		null,
		RouteReason.nativeUnavailable
	];
	else if (native) [chosen, alternative, reason] = [
		native,
		null,
		RouteReason.icpswapUnavailable
	];
	else return fail({
		__kind__: "noRouteAvailable",
		noRouteAvailable: null
	});
	const now = nowNs();
	return {
		__kind__: "ok",
		ok: {
			tokenIn,
			tokenOut,
			amountIn,
			slippageBps,
			route: chosen.route,
			reason,
			nativePoolId: pool.id,
			amountOut: chosen.amountOut,
			fees: chosen.fees,
			minimumReceived: chosen.amountOut * (DEX_BPS - slippageBps) / DEX_BPS,
			...alternative ? { alternative } : {},
			maxDeadline: now + DEX_SWAP_DEADLINE_MAX_NS,
			quotedAt: now
		}
	};
}
function routerFeeView(poolId) {
	const key = poolId.toString();
	let view = mockRouterFees.get(key);
	if (!view) {
		view = {
			totals: {
				poolId,
				collected0: 0n,
				collected1: 0n,
				lpPaid0: 0n,
				lpPaid1: 0n,
				lpSetAside0: 0n,
				lpSetAside1: 0n,
				permanent0: 0n,
				permanent1: 0n
			},
			setAside: {
				amount0: 0n,
				amount1: 0n
			}
		};
		mockRouterFees.set(key, view);
	}
	return view;
}
/** Splits the 0.1 %: 70 % to the native pool LPs (set aside with no LP), 30 % permanent. */
function routerRecordFee(pool, tokenIn, fees) {
	if (fees.__kind__ !== "icpswap") return;
	const f = fees.icpswap;
	const view = routerFeeView(pool.id);
	const side = dexTokenOfView(pool.token0) === tokenIn ? 0 : 1;
	const hasLp = mockPositions.some((p) => p.poolId === pool.id && p.shares > 0n);
	const t = view.totals;
	if (side === 0) {
		t.collected0 += f.protocolFee;
		t.permanent0 += f.protocolPermanentShare;
		if (hasLp) t.lpPaid0 += f.protocolLpShare;
		else {
			t.lpSetAside0 += f.protocolLpShare;
			view.setAside.amount0 += f.protocolLpShare;
		}
	} else {
		t.collected1 += f.protocolFee;
		t.permanent1 += f.protocolPermanentShare;
		if (hasLp) t.lpPaid1 += f.protocolLpShare;
		else {
			t.lpSetAside1 += f.protocolLpShare;
			view.setAside.amount1 += f.protocolLpShare;
		}
	}
}
function routerRecord(owner, pool, args, leg, status, stage, createdAt, lastError) {
	const swap = {
		id: nextRoutedSwapId++,
		status,
		stage,
		owner,
		tokenIn: args.tokenIn,
		tokenOut: args.tokenOut,
		amountIn: args.amountIn,
		amountOut: leg.amountOut,
		minAmountOut: args.minAmountOut,
		deadline: args.deadline,
		fees: leg.fees,
		route: leg.route,
		nativePoolId: pool.id,
		zeroForOne: dexTokenOfView(pool.token0) === args.tokenIn,
		createdAt,
		updatedAt: createdAt,
		...lastError ? { lastError } : {}
	};
	mockRoutedSwaps.push(swap);
	return swap;
}
function mockRoutedSwap(args) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	const now = nowNs();
	if (now > args.deadline) return fail({
		__kind__: "deadlineExceeded",
		deadlineExceeded: {
			deadline: args.deadline,
			now
		}
	});
	const maximum = now + DEX_SWAP_DEADLINE_MAX_NS;
	if (args.deadline > maximum) return fail({
		__kind__: "deadlineTooFar",
		deadlineTooFar: { maximum }
	});
	const quoted = mockQuoteRoutedSwap({
		...args,
		slippageBps: 0n
	});
	if (quoted.__kind__ === "err") return quoted;
	const quote = quoted.ok;
	if (!sameRoute(quote.route, args.route)) return fail({
		__kind__: "routeMismatch",
		routeMismatch: { expected: quote.route }
	});
	if (quote.amountOut < args.minAmountOut) return fail({
		__kind__: "slippageExceeded",
		slippageExceeded: {
			amountOut: quote.amountOut,
			minAmountOut: args.minAmountOut
		}
	});
	const balanceIn = dexBalanceOf(CALLER, args.tokenIn);
	if (balanceIn.available < args.amountIn) return fail({
		__kind__: "insufficientBalance",
		insufficientBalance: {
			token: args.tokenIn,
			available: balanceIn.available,
			required: args.amountIn
		}
	});
	const pool = mockPools.find((p) => p.id === quote.nativePoolId);
	if (!pool) return fail({
		__kind__: "pairNotFound",
		pairNotFound: null
	});
	let amountOut = quote.amountOut;
	if (quote.route.__kind__ === "native") {
		const done = mockSwap(pool.id, args.tokenIn, args.amountIn, args.minAmountOut, args.deadline);
		if (done.__kind__ === "err") return fail({
			__kind__: "noRouteAvailable",
			noRouteAvailable: null
		});
		amountOut = done.ok.amountOut;
	} else {
		const icp = routerIcpswapPool(args.tokenIn, args.tokenOut);
		const fees = quote.fees.__kind__ === "icpswap" ? quote.fees.icpswap : null;
		const sent = args.amountIn - (fees?.protocolFee ?? 0n);
		icp.reserves.set(args.tokenIn, (icp.reserves.get(args.tokenIn) ?? 0n) + sent);
		icp.reserves.set(args.tokenOut, (icp.reserves.get(args.tokenOut) ?? 0n) - amountOut);
		balanceIn.available -= args.amountIn;
		dexBalanceOf(CALLER, args.tokenOut).available += amountOut;
		routerRecordFee(pool, args.tokenIn, quote.fees);
	}
	return {
		__kind__: "ok",
		ok: {
			id: routerRecord(CALLER, pool, args, {
				route: quote.route,
				amountOut,
				fees: quote.fees
			}, {
				__kind__: "completed",
				completed: null
			}, RoutedSwapStage.done, now).id,
			tokenIn: args.tokenIn,
			tokenOut: args.tokenOut,
			amountIn: args.amountIn,
			amountOut,
			fees: quote.fees,
			route: quote.route
		}
	};
}
function routerSetStatus(id, status) {
	const swap = mockRoutedSwaps.find((s) => s.id === id);
	if (!swap) return;
	swap.status = status;
	swap.stage = RoutedSwapStage.done;
	swap.updatedAt = nowNs();
	if (status.__kind__ === "reviewedNotArrived") dexBalanceOf(swap.owner, swap.tokenIn).available += swap.amountIn;
}
{
	const seed = (owner, tokenIn, tokenOut, amountIn, ageNs) => {
		const pool = routerNativePool(tokenIn, tokenOut);
		const leg = routerIcpswapLeg(tokenIn, tokenOut, amountIn);
		if (!pool || !leg) return null;
		const createdAt = nowNs() - ageNs;
		return {
			pool,
			leg,
			args: {
				tokenIn,
				tokenOut,
				amountIn,
				minAmountOut: leg.amountOut * 9950n / DEX_BPS,
				deadline: createdAt + DEX_SWAP_DEADLINE_MAX_NS
			},
			createdAt
		};
	};
	const filling = seed(HOLDER_2, DexToken.ckusdt, DexToken.tttiT, 25000000n, 3n * HOUR_NS);
	if (filling) {
		routerRecord(HOLDER_2, filling.pool, filling.args, filling.leg, {
			__kind__: "completed",
			completed: null
		}, RoutedSwapStage.done, filling.createdAt);
		routerRecordFee(filling.pool, DexToken.ckusdt, filling.leg.fees);
	}
	const unknown = seed(HOLDER_3, DexToken.icp, DexToken.tttiT, 200000000n, 25n * HOUR_NS);
	if (unknown && unknown.leg.route.__kind__ === "icpswap") {
		const lastError = "Call timed out (outcome unknown)";
		const swap = routerRecord(HOLDER_3, unknown.pool, unknown.args, unknown.leg, {
			__kind__: "needsReview",
			needsReview: null
		}, RoutedSwapStage.movingIn, unknown.createdAt, lastError);
		const fees = unknown.leg.fees.__kind__ === "icpswap" ? unknown.leg.fees.icpswap.protocolFee : 0n;
		mockReviews.push({
			...reviewEntry(TransferKind.IR, swap.id, `TTTI-IR-${swap.id}`, unknown.args.amountIn - fees - ICP_LEDGER_FEE, {
				owner: unknown.leg.route.icpswap.poolCanisterId,
				subaccount: dexUserSubaccount(TTTI_CANISTER)
			}, 6n, lastError),
			buyer: HOLDER_3,
			createdAtTimeNs: unknown.createdAt
		});
	}
}
var INDICATORS_MINUTE_NS = 60n * 1000000000n;
var INDICATORS_COMPUTED_AT = nowNs() - 25n * INDICATORS_MINUTE_NS;
/** Plausible reserves and activity per starter pool (index = pool id); pool 3 stays empty. */
var INDICATORS_SEEDS = [
	{
		reserve0: "5",
		reserve1: "4000",
		firmBps: 8200n,
		positions: 14n,
		largestBps: 3100n,
		topFiveBps: 7600n,
		swaps24h: 18n,
		swaps7d: 96n,
		turnover24hBps: 140n,
		turnover7dBps: 820n
	},
	{
		reserve0: "3",
		reserve1: "0.46",
		firmBps: 7400n,
		positions: 9n,
		largestBps: 4200n,
		topFiveBps: 8900n,
		swaps24h: 7n,
		swaps7d: 41n,
		turnover24hBps: 90n,
		turnover7dBps: 510n
	},
	{
		reserve0: "2",
		reserve1: "20000",
		firmBps: 9000n,
		positions: 6n,
		largestBps: 5200n,
		topFiveBps: 9700n,
		swaps24h: 4n,
		swaps7d: 23n,
		turnover24hBps: 60n,
		turnover7dBps: 330n
	},
	{
		reserve0: "0",
		reserve1: "0",
		firmBps: 0n,
		positions: 0n,
		largestBps: 0n,
		topFiveBps: 0n,
		swaps24h: 0n,
		swaps7d: 0n,
		turnover24hBps: 0n,
		turnover7dBps: 0n
	},
	{
		reserve0: "0.2",
		reserve1: "1040",
		firmBps: 6300n,
		positions: 11n,
		largestBps: 2600n,
		topFiveBps: 6800n,
		swaps24h: 12n,
		swaps7d: 67n,
		turnover24hBps: 210n,
		turnover7dBps: 1150n
	},
	{
		reserve0: "9000",
		reserve1: "720",
		firmBps: 5800n,
		positions: 8n,
		largestBps: 3400n,
		topFiveBps: 7900n,
		swaps24h: 9n,
		swaps7d: 52n,
		turnover24hBps: 170n,
		turnover7dBps: 940n
	},
	{
		reserve0: "6500",
		reserve1: "520",
		firmBps: 6100n,
		positions: 5n,
		largestBps: 4700n,
		topFiveBps: 9500n,
		swaps24h: 3n,
		swaps7d: 19n,
		turnover24hBps: 80n,
		turnover7dBps: 450n
	}
];
/** Share of the firm liquidity per unlock bucket, in basis points (sums to 10,000). */
var INDICATORS_UNLOCK_BPS = {
	thisWeek: 500n,
	days30: 1500n,
	days90: 2000n,
	year1: 1000n,
	overYear1: 1000n,
	permanent: 4000n
};
var bpsOfAmount = (value, bps) => value * bps / 10000n;
function indicatorsDepth(reserve0, reserve1, bps) {
	const side = (reserveIn, reserveOut) => {
		if (reserveIn === 0n || reserveOut === 0n) return {
			amountIn: 0n,
			amountOut: 0n
		};
		const factor = 1 / Math.sqrt(1 - bps / 1e4) - 1;
		const amountIn = BigInt(Math.floor(Number(reserveIn) * factor));
		return {
			amountIn,
			amountOut: reserveOut - reserveIn * reserveOut / (reserveIn + amountIn)
		};
	};
	return {
		token0In: side(reserve0, reserve1),
		token1In: side(reserve1, reserve0)
	};
}
function indicatorsFees(volume0, volume1, feeBps) {
	const collected0 = bpsOfAmount(volume0, feeBps);
	const collected1 = bpsOfAmount(volume1, feeBps);
	const lp0 = collected0 * BigInt(SWAP_FEE_LP_PERCENT) / 100n;
	const lp1 = collected1 * BigInt(SWAP_FEE_LP_PERCENT) / 100n;
	return {
		collected0,
		collected1,
		lp0,
		lp1,
		permanent0: collected0 - lp0,
		permanent1: collected1 - lp1
	};
}
function mockPoolIndicators(pool) {
	const seed = INDICATORS_SEEDS[Number(pool.id)] ?? INDICATORS_SEEDS[3];
	const reserve0 = wholeUnitsOrZero(seed.reserve0, pool.token0.decimals);
	const reserve1 = wholeUnitsOrZero(seed.reserve1, pool.token1.decimals);
	const isOpen = reserve0 > 0n && reserve1 > 0n;
	const valueUsdE8 = isOpen ? dexGauge(pool, reserve0, reserve1).currentUsdE8 : void 0;
	const totalShares = BigInt(Math.floor(Math.sqrt(Number(reserve0) * Number(reserve1))));
	const firm0 = bpsOfAmount(reserve0, seed.firmBps);
	const firm1 = bpsOfAmount(reserve1, seed.firmBps);
	const firmShares = bpsOfAmount(totalShares, seed.firmBps);
	const bucket = (bps) => ({
		shares: bpsOfAmount(firmShares, bps),
		amount0: bpsOfAmount(firm0, bps),
		amount1: bpsOfAmount(firm1, bps)
	});
	const window = (swapCount, turnoverBps) => ({
		swapCount,
		volume0: bpsOfAmount(reserve0, turnoverBps),
		volume1: bpsOfAmount(reserve1, turnoverBps),
		volumeUsdE8: valueUsdE8 === void 0 ? void 0 : bpsOfAmount(valueUsdE8, turnoverBps)
	});
	const last7d = window(seed.swaps7d, seed.turnover7dBps);
	const fees7d = indicatorsFees(last7d.volume0, last7d.volume1, pool.feeBps);
	const feesUsdE8 = valueUsdE8 === void 0 ? void 0 : bpsOfAmount(last7d.volumeUsdE8 ?? 0n, pool.feeBps);
	return {
		poolId: pool.id,
		token0Symbol: pool.token0.symbol,
		token1Symbol: pool.token1.symbol,
		isOpen,
		reserve0,
		reserve1,
		valueUsdE8,
		depth: {
			onePercent: indicatorsDepth(reserve0, reserve1, 100),
			twoPercent: indicatorsDepth(reserve0, reserve1, 200),
			fivePercent: indicatorsDepth(reserve0, reserve1, 500)
		},
		liquidity: {
			firmAmount0: firm0,
			firmAmount1: firm1,
			freeAmount0: reserve0 - firm0,
			freeAmount1: reserve1 - firm1,
			firmShares,
			freeShares: totalShares - firmShares,
			totalShares,
			firmBps: isOpen ? seed.firmBps : 0n,
			freeBps: isOpen ? 10000n - seed.firmBps : 0n
		},
		unlock: {
			thisWeek: bucket(INDICATORS_UNLOCK_BPS.thisWeek),
			days30: bucket(INDICATORS_UNLOCK_BPS.days30),
			days90: bucket(INDICATORS_UNLOCK_BPS.days90),
			year1: bucket(INDICATORS_UNLOCK_BPS.year1),
			overYear1: bucket(INDICATORS_UNLOCK_BPS.overYear1),
			permanent: bucket(INDICATORS_UNLOCK_BPS.permanent)
		},
		concentration: {
			positionCount: seed.positions,
			largestPositionBps: seed.largestBps,
			topFiveBps: seed.topFiveBps,
			permanentProtocolBps: isOpen ? INDICATORS_UNLOCK_BPS.permanent : 0n
		},
		activity: {
			last24h: window(seed.swaps24h, seed.turnover24hBps),
			last7d
		},
		fees: {
			last7d: fees7d,
			cumulative: indicatorsFees(last7d.volume0 * 6n, last7d.volume1 * 6n, pool.feeBps),
			cumulativeSince: isOpen ? dexStartedAt : void 0,
			observed: {
				periodDays: 7n,
				feesUsdE8,
				liquidityUsdE8: valueUsdE8,
				feeToLiquidityBps: feesUsdE8 === void 0 || valueUsdE8 === void 0 || valueUsdE8 === 0n ? void 0 : feesUsdE8 * 10000n / valueUsdE8
			}
		}
	};
}
function wholeUnitsOrZero(whole, decimals) {
	return parseUnits(whole, decimals) ?? 0n;
}
function mockDexIndicators() {
	const lastCheck = mockDexReserve.lastCheck;
	const proofs = DEX_TOKEN_ORDER.map((token) => {
		const checked = lastCheck?.results.find((r) => r.token === token);
		if (checked) return {
			token,
			internalTotal: checked.internalTotal,
			ledgerTotal: checked.ledgerTotal,
			difference: checked.difference,
			status: checked.status
		};
		const total = dexInternalTotal(token);
		return {
			token,
			internalTotal: total,
			ledgerTotal: total,
			difference: 0n,
			status: ReserveStatus.ok
		};
	});
	return {
		computedAt: INDICATORS_COMPUTED_AT,
		reserveCheckedAt: lastCheck?.checkedAt ?? INDICATORS_COMPUTED_AT - 10n * INDICATORS_MINUTE_NS,
		proofs,
		pools: mockPools.map(mockPoolIndicators)
	};
}
var mockDexIndicatorsStatus = () => ({
	snapshotAt: INDICATORS_COMPUTED_AT,
	lastComputedAt: INDICATORS_COMPUTED_AT,
	lastResult: ComputationResult.ok,
	lastSuccessAt: INDICATORS_COMPUTED_AT,
	lastError: void 0
});
var mockBackend = {
	_initialize_access_control: async () => void 0,
	setReceivingWallet: async (token, account) => mockSetReceivingWallet(token, account),
	getReceivingWallets: async () => ({
		__kind__: "ok",
		ok: PAY_TOKEN_ORDER.map((token) => ({ ...mockReceivingWallets[token] }))
	}),
	getSettlementStatus: async () => ({
		__kind__: "ok",
		ok: mockSettlements.map((s) => ({
			...s,
			legs: s.legs.map((l) => ({ ...l }))
		}))
	}),
	getMintFeeAccount: async () => ({
		__kind__: "ok",
		ok: mockFeeAccount()
	}),
	listAdminHistory: async (filter, token, offset, limit) => mockListAdminHistory(filter, token, offset, limit),
	listTransfersToReviewFiltered: async (filter) => mockReviewsFiltered(filter),
	listTreasuryWithdrawals: async (offset, limit) => {
		const all = [...mockWithdrawals].reverse();
		return {
			__kind__: "ok",
			ok: {
				items: all.slice(Number(offset), Number(offset + limit)),
				total: BigInt(all.length),
				offset
			}
		};
	},
	listOwnerSends: async (offset, limit) => {
		const all = [...mockOwnerSends].reverse();
		return {
			items: all.slice(Number(offset), Number(offset + limit)),
			total: BigInt(all.length),
			offset
		};
	},
	getOwnerAccumulated: async () => PAY_TOKEN_ORDER.map((token) => ({
		token,
		amount: mockOwnerDestinations[token].accumulated
	})),
	getTreasurySweepStatus: async () => mockSweepView(),
	getMyMintFees: async () => mockMyMintFees(),
	claimMintFee: async (token) => mockClaimMintFee(token),
	getSetAsideAmounts: async () => mockSetAsideViews(),
	listLiquidityInjections: async (offset, limit) => {
		const all = [...mockInjections].reverse();
		return {
			items: all.slice(Number(offset), Number(offset + limit)),
			total: BigInt(all.length),
			offset
		};
	},
	getCyclesAutonomy: async () => mockAutonomy(),
	getCyclesShare: async () => mockCyclesShare(),
	getCyclesShareHistory: async () => [...mockShareHistory].reverse(),
	getMintTreasuryAccounts: async () => mockMintTreasuryAccounts(),
	getLastWeeklyAllocation: async () => mockWeeklyAllocations[mockWeeklyAllocations.length - 1] ?? null,
	listWeeklyAllocations: async () => [...mockWeeklyAllocations].reverse(),
	listDcBatches: async () => [...mockDcBatches].reverse(),
	getProtocolLiquidity: async () => mockProtocolLiquidityViews(),
	getMyLpBonus: async () => mockLpBonusView(),
	claimLpBonus: async () => mockClaimLpBonus(),
	quoteAddLiquidity: async (args) => mockQuoteAddLiquidity(args),
	addLiquidity: async (args) => {
		assertDexNotPaused();
		return mockAddLiquidity(CALLER, args);
	},
	removeLiquidity: async (positionId) => mockRemoveLiquidity(positionId),
	extendLock: async (positionId, newUnlockAt) => mockExtendLock(positionId, newUnlockAt),
	getDexPosition: async (positionId) => {
		const position = mockPositions.find((p) => p.id === positionId);
		return position ? dexPositionView(position) : null;
	},
	listPoolPositions: async (poolId) => mockPositions.filter((p) => p.poolId === poolId).map(dexPositionView),
	listDexPositionsOf: async (owner) => mockPositions.filter((p) => p.owner.toText() === owner.toText()).map(dexPositionView),
	quoteRoutedSwap: async (args) => mockQuoteRoutedSwap(args),
	routedSwap: async (args) => {
		assertDexNotPaused();
		return mockRoutedSwap(args);
	},
	runDexReserveCheck: async () => mockRunDexReserveCheck(),
	resumeDex: async () => mockResumeDex(),
	getDexReserveStatus: async () => ({
		__kind__: "ok",
		ok: mockDexReserveStatus()
	}),
	getDexPauseStatus: async () => mockPublicDexPause(),
	getDexIndicators: async () => mockDexIndicators(),
	getDexIndicatorsStatus: async () => ({
		__kind__: "ok",
		ok: mockDexIndicatorsStatus()
	}),
	getMyRoutedSwaps: async () => mockRoutedSwaps.filter((s) => s.owner.toText() === CALLER.toText()).reverse(),
	adminListRoutedSwaps: async () => ({
		__kind__: "ok",
		ok: [...mockRoutedSwaps].reverse()
	}),
	adminGetRouterFees: async () => ({
		__kind__: "ok",
		ok: [...mockRouterFees.values()]
	}),
	quoteSwap: async (poolId, tokenIn, amountIn, slippageBps) => mockQuoteSwap(poolId, tokenIn, amountIn, slippageBps),
	swap: async (poolId, tokenIn, amountIn, minAmountOut, deadline) => {
		assertDexNotPaused();
		return mockSwap(poolId, tokenIn, amountIn, minAmountOut, deadline);
	},
	listDexPools: async () => {
		dexRefreshAllOpenings();
		return mockPools.map(dexPoolOut);
	},
	getDexPool: async (poolId) => {
		dexRefreshAllOpenings();
		const pool = mockPools.find((p) => p.id === poolId);
		return pool ? dexPoolOut(pool) : null;
	},
	getDexConfig: async () => mockDexConfig(),
	listPairRequests: async () => [...mockPairRequests].reverse(),
	getMyPairRequests: async () => mockPairRequests.filter((r) => r.requester.toText() === CALLER.toText()).reverse(),
	requestPair: async (args) => mockRequestPair(args),
	approvePair: async (requestId, minimums) => mockApprovePair(requestId, minimums),
	refusePair: async (requestId, reason) => mockRefusePair(requestId, reason),
	removePair: async (poolId) => mockRemovePair(poolId),
	setUtilityPairMinimums: async (poolId, minimums) => mockSetUtilityPairMinimums(poolId, minimums),
	getDexTokens: async () => DEX_TOKEN_ORDER.map(dexTokenInfo),
	getDexDepositAccount: async (owner) => dexDepositAccountOf(owner),
	getDexPoolAccount: async (poolId) => mockPools.find((p) => p.id === poolId)?.poolAccount ?? null,
	getDexBalances: async (owner) => dexBalancesView(owner),
	getDexTransfers: async (owner) => mockDexTransfers.filter((t) => t.owner.toText() === owner.toText()).reverse(),
	depositToDex: async ({ token, amount }) => {
		assertDexNotPaused();
		return mockDepositToDex(token, amount);
	},
	withdrawFromDex: async ({ token, amount }) => mockWithdrawFromDex(token, amount),
	quoteBuyback: async (massToken, percent, receiveToken) => mockBuybackQuote(massToken, percent, receiveToken),
	requestBuyback: async (massToken, percent, receiveToken, fromSubaccount) => state.salesPaused ? buybackErr({
		__kind__: "salesPaused",
		salesPaused: null
	}) : mockRequestBuyback(massToken, percent, receiveToken, fromSubaccount),
	retryBuybackPayout: async (buybackId) => state.salesPaused ? buybackErr({
		__kind__: "salesPaused",
		salesPaused: null
	}) : mockRetryBuyback(buybackId),
	cancelBuyback: async (buybackId) => state.salesPaused ? buybackErr({
		__kind__: "salesPaused",
		salesPaused: null
	}) : mockCancelBuyback(buybackId),
	getUpgradeReadiness: async () => mockUpgradeReadiness(),
	reconcileReserved: async () => mockReconcileReserved(),
	markBuybackCancelled: async (buybackId, block) => mockMarkBuybackCancelled(buybackId, block),
	listMyBuybackMasses: async () => ({
		__kind__: "ok",
		ok: mockMassesOf(CALLER)
	}),
	listAllBuybackMasses: async () => mockAllMasses(),
	listMyBuybacks: async () => ({
		__kind__: "ok",
		ok: mockBuybacks.filter((b) => b.buyer.toText() === CALLER.toText())
	}),
	listAllBuybacks: async () => [...mockBuybacks],
	setBuybackAdminAccount: async (account) => {
		mockBuybackAdmin = account;
	},
	getBuybackAdminAccount: async () => mockBuybackAdmin,
	getBuybackFunding: async () => mockBuybackFunding(),
	addContact: async (input) => {
		if (hasDuplicateNickname(input.nickname)) return {
			__kind__: "err",
			err: {
				__kind__: "duplicateNickname",
				duplicateNickname: null
			}
		};
		const now = nowNs();
		const contact = {
			id: nextContactId,
			principal: input.principal,
			nickname: input.nickname.trim(),
			memo: input.memo,
			createdAt: now,
			updatedAt: now
		};
		nextContactId += 1n;
		mockContacts.push(contact);
		return {
			__kind__: "ok",
			ok: contact
		};
	},
	updateContact: async (id, input) => {
		const index = mockContacts.findIndex((c) => c.id === id);
		if (index < 0) return {
			__kind__: "err",
			err: {
				__kind__: "notFound",
				notFound: null
			}
		};
		if (hasDuplicateNickname(input.nickname, id)) return {
			__kind__: "err",
			err: {
				__kind__: "duplicateNickname",
				duplicateNickname: null
			}
		};
		const updated = {
			...mockContacts[index],
			principal: input.principal,
			nickname: input.nickname.trim(),
			memo: input.memo,
			updatedAt: nowNs()
		};
		mockContacts[index] = updated;
		return {
			__kind__: "ok",
			ok: updated
		};
	},
	deleteContact: async (id) => {
		const index = mockContacts.findIndex((c) => c.id === id);
		if (index < 0) return {
			__kind__: "err",
			err: {
				__kind__: "notFound",
				notFound: null
			}
		};
		mockContacts.splice(index, 1);
		return {
			__kind__: "ok",
			ok: null
		};
	},
	listMyContacts: async () => ({
		__kind__: "ok",
		ok: [...mockContacts]
	}),
	_internet_identity_sign_in_finish: async () => ({
		__kind__: "ok",
		ok: null
	}),
	_internet_identity_sign_in_start: async () => /* @__PURE__ */ new Uint8Array(),
	acceptPurchaseAcknowledgements: async () => {
		if (!ackAccepted()) state.acknowledgement = {
			acceptedAt: nowNs(),
			version: ACK_VERSION
		};
		return {
			__kind__: "ok",
			ok: ackView()
		};
	},
	assignCallerUserRole: async () => void 0,
	getBtcDepositInfo: async () => ({
		minterCanisterId: CKBTC_MINTER,
		ckbtcLedgerId: Principal.fromText(PAY_TOKENS[PayToken.ckbtc].ledgerCanisterId),
		minConfirmations: BTC_DEFAULT_MIN_CONFIRMATIONS,
		depositMinSats: BTC_DEFAULT_DEPOSIT_MIN_SATS,
		checkFeeSats: BTC_DEFAULT_CHECK_FEE_SATS,
		purchaseFeeBps: CK_FEE_BPS,
		suggestedPollSeconds: 30n,
		infoFetchedAt: hourStartNs()
	}),
	getMyBtcDeposits: async () => ({
		purchase: state.btcPurchase,
		wallet: state.btcWallet
	}),
	getBtcPurchaseAddress: async () => ackAccepted() ? btcAddressResult(DepositKind.purchase) : btcAckRequired(),
	checkBtcPurchaseDeposit: async () => ackAccepted() ? checkBtcResult(DepositKind.purchase) : btcAckRequired(),
	getBtcWalletAddress: async () => btcAddressResult(DepositKind.wallet),
	checkBtcWalletDeposit: async () => checkBtcResult(DepositKind.wallet),
	getBtcWalletAddressFor: async (_owner) => btcAddressResult(DepositKind.wallet),
	checkBtcWalletDepositFor: async (_owner) => checkBtcResult(DepositKind.wallet),
	getBtcWalletDepositsFor: async (_owner) => state.btcWallet ?? null,
	clearDeliveryAddress: async () => {
		const had = state.deliveryAddress !== null;
		state.deliveryAddress = null;
		return had;
	},
	convertDeposit: async (recipient, icpAmount) => mockPurchase(recipient, icpAmount),
	convertDepositWith: async (token, recipient, payAmount, _tttiTarget) => token === PayToken.icp ? mockPurchase(recipient, payAmount) : walletNotConfigured(token) ?? purchaseError({
		__kind__: "tokenNotConfigured",
		tokenNotConfigured: { token }
	}, `${PAY_TOKENS[token].symbol} purchases are not available in the mock backend.`),
	getTokenPrices: async () => PAY_TOKEN_ORDER.map((token) => mockTokenPrice(token)),
	refreshTokenPrice: async (token) => {
		const price = mockTokenPrice(token);
		return price.usable ? {
			__kind__: "Err",
			Err: "The current rate is still valid; refresh is allowed only when the rate is expired or absent."
		} : {
			__kind__: "Ok",
			Ok: price
		};
	},
	execute: async () => ({
		hasMore: false,
		rows: []
	}),
	exportBalanceSnapshot: async () => ({
		exportedAt: nowNs(),
		totalSupply: state.sold + state.feeCollectorBalance,
		decimals: 8,
		holders: [
			{
				account: CALLER_ACCOUNT,
				balance: 250000n,
				deliveryAddress: state.deliveryAddress ?? void 0,
				needsMigration: state.deliveryAddress === null,
				kind: HolderKind.holder
			},
			{
				account: { owner: HOLDER_2 },
				balance: 900000n,
				deliveryAddress: { owner: HOLDER_3 },
				needsMigration: false,
				kind: HolderKind.holder
			},
			{
				account: { owner: HOLDER_3 },
				balance: state.sold - 1150000n,
				needsMigration: true,
				kind: HolderKind.holder
			},
			{
				account: FEE_COLLECTOR,
				balance: state.feeCollectorBalance,
				needsMigration: false,
				kind: HolderKind.feeCollector
			}
		]
	}),
	getApiDoc: async () => MOCK_API_DOC,
	listTransfersToReview: async () => [...mockReviews],
	markTransferArrived: async (kind, purchaseId, block) => mockMarkArrived(kind, purchaseId, block),
	markTransferNotArrived: async (kind, purchaseId) => mockMarkNotArrived(kind, purchaseId),
	markRefundedManually: async (kind, purchaseId, block) => mockMarkRefundedManually(kind, purchaseId, block),
	getBurnAccount: async () => MINTING_ACCOUNT,
	getCallerUserRole: async () => UserRole.admin,
	getCanisterPrincipal: async () => TTTI_CANISTER,
	getConversions: async () => state.conversions,
	getMyConversions: async () => state.conversions.filter((c) => c.depositor.toText() === CALLER.toText() || c.recipient.owner.toText() === CALLER.toText()),
	getDeliveryAddress: async () => state.deliveryAddress,
	getFeeCollector: async () => ({
		account: FEE_COLLECTOR,
		balance: state.feeCollectorBalance
	}),
	getIcpPrice: async () => mockPrice(),
	getBtcUsdRate: async () => {
		const price = mockPrice();
		return {
			usdE8: 6500000000000n,
			source: price.source,
			fetchedAt: price.fetchedAt,
			validUntil: price.validUntil
		};
	},
	getLegacyBlockInfo: async () => ({
		boundaryIndex: LEGACY_BOUNDARY,
		legacyDecimals: 4,
		currentDecimals: 8
	}),
	getMyPurchaseAcknowledgement: async () => ackView(),
	getSaleStatus: async () => {
		const totalSupply = mockTotalSupply();
		const available = saleAvailable();
		const price = mockPrice();
		return {
			maxSupply: MAX_SUPPLY,
			totalSupply,
			mintableRemaining: mintableRemaining(),
			feeAccountBalance: state.feeCollectorBalance,
			sold: state.sold,
			reserved: state.reserved,
			available,
			complete: available === 0n,
			minPurchase: MIN_PURCHASE,
			tokenPriceUsd: BigInt(TOKEN_PRICE_USD),
			cyclesFeeBps: CYCLES_FEE_BPS,
			buyerPriceUsd: BigInt(BUYER_PRICE_USD),
			salesPaused: state.salesPaused,
			priceUsdE8: price.usdE8,
			priceSource: price.source,
			priceFetchedAt: price.fetchedAt,
			priceValidUntil: price.validUntil,
			priceUsable: price.usable,
			liveRate: MOCK_LIVE_RATE,
			payTokens: mockPayTokens()
		};
	},
	getTechnicalDetails: async () => ({
		ledgerCanisterId: TTTI_CANISTER,
		tokenName: TOKEN_NAME,
		tokenSymbol: TTTI_SYMBOL,
		decimals: 8,
		standards: STANDARDS.map((standard) => standard.name),
		icpLedgerCanisterId: ICP_CANISTER,
		ckbtcMinterId: CKBTC_MINTER,
		oracleSources: [HOURLY_RATE_TEXT],
		refreshPolicy: HOURLY_RATE_TEXT,
		maxRateAgeSeconds: MAX_RATE_AGE_SECONDS,
		tokenPriceUsd: BigInt(TOKEN_PRICE_USD),
		cyclesFeeBps: CYCLES_FEE_BPS,
		buyerPriceUsd: BigInt(BUYER_PRICE_USD),
		minPurchase: MIN_PURCHASE,
		smallestUnit: 1n,
		roundingRule: "TTTI-T amounts rounded down to 1 base unit; ICP costs rounded up to 1 e8s",
		excessPaymentHandling: "Only the ICP cost of the delivered TTTI-T is collected; any excess is never pulled",
		deliveryOrder: "Fresh minting first; collected transfer fees are delivered only after minting reaches the maximum supply",
		transferFee: state.fee,
		maxSupply: MAX_SUPPLY,
		totalSupply: mockTotalSupply(),
		feeAccount: FEE_COLLECTOR,
		feeAccountBalance: state.feeCollectorBalance,
		cyclesReserveAccount: CYCLES_RESERVE_ACCOUNT,
		reserveFloorE8s: RESERVE_FLOOR_E8S,
		reserveRule: RESERVE_RULE,
		controllers: MOCK_CONTROLLERS,
		moduleHash: MOCK_MODULE_HASH,
		canisterInfoFetchedAt: hourStartNs(),
		legacyBlockBoundary: LEGACY_BOUNDARY,
		payTokens: mockPayTokens()
	}),
	getCyclesStatus: async () => ({
		cyclesBalance: state.cyclesBalance,
		topUpThreshold: TOP_UP_THRESHOLD,
		reserveAccount: CYCLES_RESERVE_ACCOUNT,
		reserveBalanceE8s: state.reserveBalanceE8s,
		reserveFloorE8s: RESERVE_FLOOR_E8S,
		lastTopUp: state.lastTopUp,
		withdrawals: state.withdrawals
	}),
	getPublicTreasuryInfo: async () => ({
		icpAccount: state.treasuryConfig.icpAccount,
		tokenAccounts: PAY_TOKEN_ORDER.map((token) => ({
			token,
			account: state.treasuryConfig.icpAccount
		}))
	}),
	getTreasuryConfig: async () => state.treasuryConfig,
	get_account_transactions: async () => ({
		__kind__: "Ok",
		Ok: {
			balance: 0n,
			transactions: [],
			oldest_tx_id: void 0
		}
	}),
	get_fee: async () => state.fee,
	get_fee_bounds: async () => FEE_BOUNDS,
	get_max_supply: async () => MAX_SUPPLY,
	icrc10_supported_standards: async () => STANDARDS,
	icrc1_balance_of: async () => 250000n,
	icrc1_decimals: async () => 8,
	icrc1_fee: async () => state.fee,
	icrc1_metadata: async () => [
		["icrc1:name", {
			__kind__: "Text",
			Text: TOKEN_NAME
		}],
		["icrc1:symbol", {
			__kind__: "Text",
			Text: TTTI_SYMBOL
		}],
		["icrc1:decimals", {
			__kind__: "Nat",
			Nat: BigInt(8)
		}],
		["icrc1:fee", {
			__kind__: "Nat",
			Nat: state.fee
		}],
		["icrc1:max_memo_length", {
			__kind__: "Nat",
			Nat: 32n
		}],
		["icrc1:max_supply", {
			__kind__: "Nat",
			Nat: MAX_SUPPLY
		}]
	],
	icrc1_minting_account: async () => MINTING_ACCOUNT,
	icrc1_name: async () => TOKEN_NAME,
	icrc1_supported_standards: async () => STANDARDS,
	icrc1_symbol: async () => TTTI_SYMBOL,
	icrc1_total_supply: async () => mockTotalSupply(),
	icrc1_transfer: async (args) => isMintingAccount(args.to) ? {
		__kind__: "Err",
		Err: MINTING_REFUSAL
	} : {
		__kind__: "Ok",
		Ok: 9n
	},
	icrc2_allowance: async () => ({ allowance: 0n }),
	icrc2_approve: async (args) => {
		if (args.spender.owner.toText() === TTTI_CANISTER.toText()) mockTttiAllowance = args.amount;
		return {
			__kind__: "Ok",
			Ok: 9n
		};
	},
	icrc2_transfer_from: async (args) => isMintingAccount(args.to) ? {
		__kind__: "Err",
		Err: MINTING_REFUSAL
	} : {
		__kind__: "Ok",
		Ok: 9n
	},
	icrc3_get_archives: async () => [],
	icrc3_get_blocks: async (ranges) => mockGetBlocks(ranges),
	icrc3_get_tip_certificate: async () => {
		const { blocks, tipHash } = await sampleBlockLog();
		return {
			certificate: MOCK_CERTIFICATE,
			hash_tree: buildMockHashTree(BigInt(blocks.length - 1), tipHash)
		};
	},
	icrc3_supported_block_types: async () => [
		{
			block_type: "1xfer",
			url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1"
		},
		{
			block_type: "1mint",
			url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1"
		},
		{
			block_type: "1burn",
			url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1"
		},
		{
			block_type: "2approve",
			url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2"
		}
	],
	isCallerAdmin: async () => true,
	ledger_id: async () => TTTI_CANISTER,
	list_subaccounts: async () => [],
	refreshIcpPrice: async () => {
		dexRefreshAllOpenings();
		const price = mockPrice();
		if (price.usable) return {
			__kind__: "Err",
			Err: "The current ICP/USD rate is still valid; refresh is allowed only when the rate is expired or absent."
		};
		return {
			__kind__: "Ok",
			Ok: price
		};
	},
	schema: async () => JSON.stringify({ tables: [] }),
	setDeliveryAddress: async (principalText) => {
		const result = validateDeliveryAddress(principalText);
		if (!result.ok) return {
			__kind__: "Err",
			Err: {
				code: result.code,
				message: result.message
			}
		};
		state.deliveryAddress = { owner: result.principal };
		return {
			__kind__: "Ok",
			Ok: state.deliveryAddress
		};
	},
	setSalesPaused: async (paused) => {
		state.salesPaused = paused;
	},
	set_fee: async (newFee) => {
		if (newFee < FEE_BOUNDS.min || newFee > FEE_BOUNDS.max) return {
			__kind__: "err",
			err: `Fee must be between ${FEE_BOUNDS.min} and ${FEE_BOUNDS.max} base units`
		};
		state.fee = newFee;
		return {
			__kind__: "ok",
			ok: null
		};
	},
	status: async () => ({ num_blocks_synced: 0n }),
	transform: async () => ({
		status: 200n,
		body: /* @__PURE__ */ new Uint8Array(),
		headers: []
	})
};
//#endregion
export { mockBackend };
