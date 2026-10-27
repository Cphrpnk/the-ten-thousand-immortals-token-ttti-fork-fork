import { A as HolderKind, C as BtcRefundPurpose, D as ConversionStatus, E as CollectState, F as TransferKind, I as UserRole, L as Principal, M as PriceSource, N as ReconcileError, O as DepositErrorKind, P as ReviewError, S as BtcDepositErrorCode, T as BuybackStatus, _ as TTTI_SYMBOL, a as CKBTC_MINTER_CANISTER_ID, b as tttiFromToken, c as CYCLES_FEE_TEXT, d as PAY_TOKENS, f as PAY_TOKEN_ORDER, g as TTTI_DIVISOR, h as TOKEN_PRICE_USD, i as BUYER_PRICE_USD, j as PayToken, k as DepositKind, l as ICP_DIVISOR, m as TOKEN_NAME, n as BTC_DEFAULT_DEPOSIT_MIN_SATS, o as CK_FEE_BPS, p as RESERVE_FLOOR_E8S, r as BTC_DEFAULT_MIN_CONFIRMATIONS, s as CYCLES_FEE_BPS, t as BTC_DEFAULT_CHECK_FEE_SATS, u as MIN_PURCHASE, v as icpForTtti, w as BuybackRule, x as validateDeliveryAddress, y as tttiFromIcp } from "./index-BKgqexlL.js";
//#region src/mocks/backend.ts
var FEE = 100n;
var FEE_BOUNDS = {
	min: 0n,
	max: 10000n
};
var MAX_SUPPLY = TTTI_DIVISOR;
var ICP_LEDGER_FEE = 10000n;
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
var TOP_UP_THRESHOLD = 3000000000000n;
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
	cyclesBalance: 4820000000000n,
	reserveBalanceE8s: 345670000n,
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
		lastReconciliation: state.lastReconciliation
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
/** Reserve minus the floor minus the ICP ledger fee, never negative. */
var withdrawableExcess = () => {
	const excess = state.reserveBalanceE8s - RESERVE_FLOOR_E8S - ICP_LEDGER_FEE;
	return excess > 0n ? excess : 0n;
};
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
		token: PayToken.icp,
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
		token: PayToken.ckbtc,
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
		token: PayToken.ckbtc,
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
		token: PayToken.ckbtc,
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
		err: (kind === TransferKind.FW || kind === TransferKind.RF) && state.conversions.some((c) => c.id === purchaseId) || kind === TransferKind.SH && state.conversions.some((c) => c.id === purchaseId && c.payToken === PayToken.icp) || kind === TransferKind.BB && mockBuybacks.some((b) => b.id === purchaseId) ? ReviewError.notUnderReview : ReviewError.notFound
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
	const attempt = mockPendingAttempts.filter((a) => a.kind === kind && a.purchaseId === purchaseId).length + 2;
	mockPendingAttempts.push({
		kind,
		purchaseId,
		memoText: `TTTI-${kind}-${purchaseId}-${attempt}`,
		createdAtTimeNs: nowNs()
	});
	if (kind === TransferKind.FW) setForward(purchaseId, {
		__kind__: "pending",
		pending: null
	});
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
	"## Review (admin only)",
	"- listTransfersToReview() : query -> [TransferReview] — FW, SH and RF under review, every PC payment to refund, BR BTC refunds to verify (id = BR attempt number), BC BTC cost sends to the treasury to verify (id = trace number), BM delivery-failure costs to refund by hand (id = conversion id) and BB buyback payments to verify plus legacy #payoutFailed buybacks (id = buyback id); kind, purchaseId, token, memoText, memoHex, createdAtTimeNs, amount, fee, destination (the buyer for PC), sends, lastError, block (when known), collect (PC: #confirmed or #unknown), buyer, depositIndex, conversionId, refundPurpose (BR: #excess, #fullRefund or #deliveryFailedExcess), outcome (BR/BC).",
	"- markTransferArrived(kind, purchaseId, block) -> ReviewResult — records the ledger block for FW, SH, RF, BR, BC or BB (RF sets the purchase #refunded; BB sets the payout block, releases the escrow and completes the buyback); PC and BM return #notApplicable.",
	"- markTransferNotArrived(kind, purchaseId) -> ReviewResult — FW, SH, RF or BR: opens a new attempt sent by the timer; BC: removes the cost send and its payment to refund, and the deposit is converted again later by the timer; PC: removes a payment that never happened; BB: the latest payment attempt becomes a known failure, so the buyer can retry or cancel; BM returns #notApplicable.",
	"- markRefundedManually(kind, purchaseId, block) -> ReviewResult — RF, PC or BM only: records the item as refunded with the block and removes it from the list; FW, SH, BR and BC return #notApplicable.",
	"- ReviewError: #notAdmin, #notFound, #notUnderReview, #notApplicable.",
	"- ConversionStatus adds #refundReview: refund outcome unknown after 23 h."
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
	return {
		__kind__: "Ok",
		Ok: conversion
	};
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
		token: b.tokenReturned,
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
var mockBackend = {
	_initialize_access_control: async () => void 0,
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
	convertDepositWith: async (token, recipient, payAmount, _tttiTarget) => token === PayToken.icp ? mockPurchase(recipient, payAmount) : purchaseError({
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
	setPayTokenAccount: async (token, account) => ({
		__kind__: "Ok",
		Ok: {
			token,
			account
		}
	}),
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
		withdrawableExcessE8s: withdrawableExcess(),
		withdrawalAllowed: true,
		withdrawalBlockedReason: void 0,
		lastTopUp: state.lastTopUp,
		withdrawals: state.withdrawals
	}),
	withdrawReserveExcess: async (amount) => {
		const withdrawableE8s = withdrawableExcess();
		if (withdrawableE8s === 0n) return {
			__kind__: "noExcess",
			noExcess: null
		};
		if (amount === 0n || amount > withdrawableE8s) return {
			__kind__: "amountExceedsExcess",
			amountExceedsExcess: { withdrawableE8s }
		};
		const blockIndex = 18300000n + BigInt(state.withdrawals.length);
		state.reserveBalanceE8s -= amount + ICP_LEDGER_FEE;
		state.withdrawals = [...state.withdrawals, {
			timestamp: nowNs(),
			amountE8s: amount,
			blockIndex
		}];
		return {
			__kind__: "ok",
			ok: blockIndex
		};
	},
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
	icrc2_approve: async () => ({
		__kind__: "Ok",
		Ok: 9n
	}),
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
	setTreasuryConfig: async (config) => {
		state.treasuryConfig = { ...config };
		return {
			__kind__: "Ok",
			Ok: state.treasuryConfig
		};
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
