import { $ as PayToken, A as BidOutcome, B as DepositErrorKind, C as TTTI_SYMBOL, Ct as ThresholdBasis, D as tttiFromToken, Dt as Variant_surplus_shortfall_balanced, E as tttiFromIcp, Et as UserRole, F as CollectState, G as FeeSplitSource, H as DepthBasis, I as ComputationResult, J as HistoryKind, K as FeeTier, L as ConsolidatedUnavailable, M as BtcRefundPurpose, N as CancelRemovalError, O as validateDeliveryAddress, Ot as Principal, P as ClosedStatus, Q as OpenAuctionError, R as ConversionStatus, S as TTTI_DIVISOR, St as SweepStatus, T as parseUnits, Tt as TreasurySource, U as DexToken, V as DepositKind, W as DexTransferDirection, X as HolderKind, Y as HistoryToken, Z as MintStatus, _ as RESERVE_FLOOR_E8S, _t as SettleError, a as CKBTC_LEDGER_CANISTER_ID, at as ReconcileError, b as TOKEN_NAME, bt as SharingPhase, c as CKUSDT_LEDGER_CANISTER_ID, ct as RedemptionKind, d as CYCLES_FEE_TEXT, dt as ReservePhase, et as PermanentKind, f as CYCLES_TOP_UP_THRESHOLD, ft as ReserveStatus, g as PAY_TOKEN_ORDER, gt as SetMinimumsError, h as PAY_TOKENS, ht as RoutedSwapStage, i as BUYER_PRICE_USD, it as PriceSource, j as BtcDepositErrorCode, k as AccountKind, l as CK_FEE_BPS, lt as ReferenceSourceKind, m as MIN_PURCHASE, mt as RouteReason, n as BTC_DEFAULT_DEPOSIT_MIN_SATS, nt as PoolSide, o as CKBTC_MINTER_CANISTER_ID, ot as RedeemPhase, p as ICP_DIVISOR, pt as ReviewError, q as HistoryFilter, r as BTC_DEFAULT_MIN_CONFIRMATIONS, rt as PoolStatus, s as CKUSDC_LEDGER_CANISTER_ID, st as RedeemRule, t as BTC_DEFAULT_CHECK_FEE_SATS, tt as PoolKind, u as CYCLES_FEE_BPS, ut as ReserveBinding, v as SWAP_FEE_LP_PERCENT, vt as SettlementLegPurpose, w as encodeAccountText, wt as TransferKind, x as TOKEN_PRICE_USD, xt as SpreadStatus, y as SWAP_FEE_PERMANENT_PERCENT, yt as SettlementStatus__1, z as DcTrigger } from "./index-BOVywBMr.js";
//#region src/mocks/backend.ts
/** The transfer fee is fixed in the code: 100 base units (0.000001 TTTI-T), paid to the creator. */
var FEE = 100n;
var FEE_BOUNDS = {
	min: FEE,
	max: FEE
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
	feeCollectorBalance: 2000000n,
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
		redemptionsInFlightCount: 0n,
		redemptionsInFlight: [],
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
/**
* PTM-9b: simulated end of the mint (`?guarantee=ended`) leaves a remainder below the
* minimum of one mint; it is minted at settlement for the auction winner.
*/
var MOCK_ENDED_REMAINDER_E8S = 6500n;
/** TTTI-T minted at auction settlement from the end-of-mint remainder. */
var mockRemainderMinted = 0n;
/** What can still be minted; the simulated end of the mint pins it to the remainder. */
var saleMintable = () => {
	if (guaranteeScenario() === "ended") return MOCK_ENDED_REMAINDER_E8S > mockRemainderMinted ? MOCK_ENDED_REMAINDER_E8S - mockRemainderMinted : 0n;
	return mintableRemaining();
};
/** The mint is over when what remains to mint is below the minimum of one mint. */
var saleMintEnded = () => saleMintable() < MIN_PURCHASE;
/** The remainder carried to the first auction lot (0 while the mint is running). */
var saleRemainder = () => saleMintEnded() ? saleMintable() : 0n;
/** Transfer fees belong to the creator (source transferFee); they are never part of what is available at mint. */
function saleAvailable() {
	return saleMintable();
}
function makeConversion(icpAmount, recipient) {
	const tttiAmount = liveTtti(icpAmount);
	const mintable = saleMintable();
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
		fromCollector: 0n,
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
		err: (kind === TransferKind.FW || kind === TransferKind.RF) && state.conversions.some((c) => c.id === purchaseId) || kind === TransferKind.SH && state.conversions.some((c) => c.id === purchaseId && c.payToken === PayToken.icp) || kind === TransferKind.GR && mockRedemptions.some((r) => r.id === purchaseId) || (kind === TransferKind.DD || kind === TransferKind.DW) && mockDexTransfers.some((t) => t.n === purchaseId) || kind === TransferKind.DQ && mockPairRequests.some((r) => r.id === purchaseId && r.status.__kind__ === "approved") || kind === TransferKind.DC && mockDcSends.some((d) => d.n === purchaseId) || kind === TransferKind.DL && mockBonusClaims.some((c) => c.n === purchaseId) || (kind === TransferKind.OW || kind === TransferKind.SR) && mockOwnerSends.some((s) => s.id === purchaseId) || kind === TransferKind.MF && mockMintFeeClaims.some((c) => c.n === purchaseId) || kind === TransferKind.LQ && mockLqPayouts.some((p) => p.n === purchaseId) || kind === TransferKind.IR && mockRoutedSwaps.some((s) => s.id === purchaseId) || kind === TransferKind.SW && mockSweepTransfers.some((t) => t.n === purchaseId) ? ReviewError.notUnderReview : ReviewError.notFound
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
	if (kind === TransferKind.PC || kind === TransferKind.BM || kind === TransferKind.CS) return {
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
	if (kind === TransferKind.GR) redemptionArrived(purchaseId, block);
	if (kind === TransferKind.DD || kind === TransferKind.DW || kind === TransferKind.DQ) dexMarkArrived(kind, purchaseId, block);
	if (kind === TransferKind.LQ) dexLqArrived(purchaseId);
	if (kind === TransferKind.DC || kind === TransferKind.DL) protocolFeeArrived(kind, purchaseId, block);
	if (kind === TransferKind.OW || kind === TransferKind.SR) ownerSendReviewed(purchaseId, block);
	if (kind === TransferKind.MF) mintFeeReviewed(purchaseId, block);
	if (kind === TransferKind.IR) routerSetStatus(purchaseId, {
		__kind__: "reviewedArrived",
		reviewedArrived: block
	});
	if (kind === TransferKind.SW) sweepReviewed(purchaseId, block);
	return {
		__kind__: "ok",
		ok: null
	};
}
/** Payments that never happened, removed by Not arrived on a PC item. */
var mockRemovedPayments = [];
function mockMarkNotArrived(kind, purchaseId) {
	if (kind === TransferKind.BM || kind === TransferKind.CS) return {
		__kind__: "err",
		err: ReviewError.notApplicable
	};
	const taken = takeReview(kind, purchaseId);
	if ("__kind__" in taken) return taken;
	if (kind === TransferKind.SW) {
		sweepReviewed(purchaseId, null);
		return {
			__kind__: "ok",
			ok: null
		};
	}
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
	if (kind === TransferKind.GR) {
		redemptionNotArrived(purchaseId);
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
var AUCTION_MIN_QUANTITY_E8S = 100000n;
var AUCTION_MAX_BIDS = 10n;
var AUCTION_DURATION_NS = 24n * HOUR_NS;
var AUCTION_RESERVE_USD_E8 = 10000n * 100000000n;
function auctionScenario() {
	if (typeof window === "undefined") return "";
	try {
		return new URLSearchParams(window.location.search).get("auction") ?? "";
	} catch {
		return "";
	}
}
var mockAuctionInitialClosesAt = () => {
	const scenario = auctionScenario();
	if (scenario === "closing") return nowNs() + 20000000000n;
	if (scenario === "pending") return nowNs() - 5n * 60n * 1000000000n;
	return nowNs() - HOUR_NS + AUCTION_DURATION_NS;
};
/**
* PTM-9b first lot: `?auction=blocksale` opens a lot below the minimum of one bid (sold in
* block); with `?guarantee=ended` that lot is the end-of-mint remainder, minted at settlement.
*/
var mockInitialLot = () => {
	if (auctionScenario() !== "blocksale") return {
		lotSizeE8s: 42000000n,
		remainderE8s: 0n
	};
	if (guaranteeScenario() === "ended") return {
		lotSizeE8s: MOCK_ENDED_REMAINDER_E8S,
		remainderE8s: MOCK_ENDED_REMAINDER_E8S
	};
	return {
		lotSizeE8s: 60000n,
		remainderE8s: 0n
	};
};
var mockFirstLot = mockInitialLot();
var mockAuctionState = {
	current: {
		id: 3n,
		lotSizeE8s: mockFirstLot.lotSizeE8s,
		blockSale: mockFirstLot.lotSizeE8s < AUCTION_MIN_QUANTITY_E8S,
		remainderE8s: mockFirstLot.remainderE8s,
		openedAt: nowNs() - HOUR_NS,
		closesAt: mockAuctionInitialClosesAt()
	},
	pendingLotE8s: 0n,
	pendingRemainderE8s: 0n,
	remainderAbsorbed: mockFirstLot.remainderE8s > 0n,
	nextAuctionId: 4n,
	nextBidId: 10n,
	bids: []
};
/** PTM-9b: once the mint is over, its remainder joins the first lot to open (never minted before settlement). */
var mockAbsorbMintRemainder = () => {
	if (mockAuctionState.remainderAbsorbed) return;
	const remainder = saleRemainder();
	if (remainder === 0n) return;
	mockAuctionState.remainderAbsorbed = true;
	mockAuctionState.pendingLotE8s += remainder;
	mockAuctionState.pendingRemainderE8s += remainder;
};
var mockClosedAuctions = [];
/**
* Auction amounts per principal text and token. `withdrawable` is what the
* auction credited to the DEX internal balance and has not left it yet;
* `pending` is the deposit of served bids awaiting settlement.
*/
var mockAuctionBalances = /* @__PURE__ */ new Map();
/** Moves amounts between pending and the DEX balance; `withdrawable` is credited to the DEX available balance. */
var mockAuctionCredit = (who, token, withdrawable, pending) => {
	const perToken = mockAuctionBalances.get(who.toText()) ?? /* @__PURE__ */ new Map();
	const entry = perToken.get(token) ?? {
		withdrawable: 0n,
		pending: 0n
	};
	perToken.set(token, {
		withdrawable: entry.withdrawable + withdrawable,
		pending: entry.pending + pending
	});
	mockAuctionBalances.set(who.toText(), perToken);
	if (withdrawable > 0n) dexBalanceOf(who, DEX_OF_PAY[token]).available += withdrawable;
};
/** A withdrawal from the DEX balance also reduces what the auction reports as withdrawable. */
var mockAuctionWithdrawn = (who, dexToken, amount) => {
	const perToken = mockAuctionBalances.get(who.toText());
	if (!perToken) return;
	for (const [token, entry] of perToken) {
		if (DEX_OF_PAY[token] !== dexToken) continue;
		perToken.set(token, {
			...entry,
			withdrawable: entry.withdrawable > amount ? entry.withdrawable - amount : 0n
		});
	}
};
var mockCompare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
/**
* Closing: USD conversion at the closing rates, discard below the reserve,
* sort by price then volume then age, serve each offer at its own price up to
* the lot. The last offer may be served in part when at least the minimum
* quantity remains; a remainder below the minimum is carried over.
*/
var mockRunClosing = (input) => {
	const rateOf = (token) => input.rates.find((r) => r.token === token)?.usdE8 ?? 0n;
	const usdOf = (bid) => bid.priceB * rateOf(bid.token) / 10n ** BigInt(PAY_TOKENS[bid.token].decimals);
	const reserveUsd = input.reserve.reserveUsdE8;
	const valid = input.bids.filter((b) => usdOf(b) >= reserveUsd);
	const discarded = input.bids.filter((b) => usdOf(b) < reserveUsd);
	valid.sort((a, b) => mockCompare(usdOf(b), usdOf(a)) || mockCompare(b.quantityE8s * usdOf(b), a.quantityE8s * usdOf(a)) || mockCompare(a.createdAt, b.createdAt) || mockCompare(a.id, b.id));
	const remainderE8s = input.remainderE8s ?? 0n;
	const mintPlan = /* @__PURE__ */ new Map();
	let remaining = input.lotSizeE8s;
	let servedTotal = 0n;
	/** The remainder is the last part of the lot: a winner mints the overlap of its served range with it. */
	const planMint = (bidId, from, to) => {
		const start = input.lotSizeE8s - remainderE8s;
		const lo = from > start ? from : start;
		const hi = to < input.lotSizeE8s ? to : input.lotSizeE8s;
		if (hi > lo) mintPlan.set(bidId, hi - lo);
	};
	const toClosed = (bid, outcome, served) => {
		const servedDeposit = served > 0n ? mockAuctionRequired(bid.priceB, served) : 0n;
		const returned = bid.deposited - servedDeposit;
		if (served > 0n) mockAuctionCredit(bid.bidder, bid.token, 0n, bid.deposited);
		else mockAuctionCredit(bid.bidder, bid.token, bid.deposited, 0n);
		return {
			id: bid.id,
			auctionId: input.id,
			bidder: bid.bidder,
			token: bid.token,
			quantityE8s: bid.quantityE8s,
			priceB: bid.priceB,
			requiredDeposit: bid.requiredDeposit,
			deposited: bid.deposited,
			createdAt: bid.createdAt,
			outcome,
			servedE8s: served,
			pricePaidB: served > 0n ? bid.priceB : 0n,
			servedDeposit,
			returned: served > 0n ? returned : bid.deposited,
			settlement: {
				auctionId: input.id,
				bidId: bid.id,
				bidder: bid.bidder,
				token: bid.token,
				status: served > 0n ? SettlementStatus__1.pending : SettlementStatus__1.notRequired,
				settledE8s: 0n,
				takenAmount: 0n,
				creatorShare: 0n,
				positionAmount: 0n,
				guaranteeAmount: 0n,
				surplusReturned: 0n,
				carriedE8s: 0n,
				mintedE8s: 0n
			}
		};
	};
	const closedBids = [];
	for (const bid of valid) if (bid.quantityE8s <= remaining) {
		planMint(bid.id, servedTotal, servedTotal + bid.quantityE8s);
		remaining -= bid.quantityE8s;
		servedTotal += bid.quantityE8s;
		closedBids.push(toClosed(bid, BidOutcome.served, bid.quantityE8s));
	} else if (remaining >= AUCTION_MIN_QUANTITY_E8S) {
		planMint(bid.id, servedTotal, servedTotal + remaining);
		servedTotal += remaining;
		closedBids.push(toClosed(bid, BidOutcome.partiallyServed, remaining));
		remaining = 0n;
	} else closedBids.push(toClosed(bid, BidOutcome.notServed, 0n));
	for (const bid of discarded) closedBids.push(toClosed(bid, BidOutcome.discardedBelowReserve, 0n));
	const status = servedTotal === 0n ? ClosedStatus.unsold : servedTotal === input.lotSizeE8s ? ClosedStatus.fullySold : ClosedStatus.partiallySold;
	return {
		auction: {
			id: input.id,
			openedAt: input.openedAt,
			closesAt: input.closesAt,
			closedAt: input.closedAt,
			lotSizeE8s: input.lotSizeE8s,
			blockSale: input.blockSale ?? false,
			remainderE8s,
			reserve: input.reserve,
			rates: input.rates,
			bidCount: BigInt(input.bids.length),
			servedE8s: servedTotal,
			carriedOverE8s: input.lotSizeE8s - servedTotal,
			status,
			settlement: mockSettlementSummary(closedBids)
		},
		bids: closedBids,
		failBidIds: /* @__PURE__ */ new Set(),
		carryFailed: true,
		mintPlan
	};
};
var mockSettlementSummary = (bids) => {
	const summary = {
		pendingCount: 0n,
		settledCount: 0n,
		failedCount: 0n,
		settledE8s: 0n,
		failedCarriedE8s: 0n
	};
	for (const { settlement } of bids) if (settlement.status === SettlementStatus__1.pending) summary.pendingCount += 1n;
	else if (settlement.status === SettlementStatus__1.settled) {
		summary.settledCount += 1n;
		summary.settledE8s += settlement.settledE8s;
	} else if (settlement.status === SettlementStatus__1.failed) {
		summary.failedCount += 1n;
		summary.failedCarriedE8s += settlement.carriedE8s;
	}
	return summary;
};
var MOCK_SETTLE_DELAY_NS = 30000000000n;
/**
* Settles every pending winner of one auction. Served quantity q at price B:
* 2 x B x q / 0.99 is taken from the deposit, the creator share is 1 % of the amount paid
* after the cycles reserve, a position of B x q holds q TTTI-T, a guarantee of B per TTTI-T is set, and
* the rest of the deposit is credited to the DEX balance. A failed winner has
* no position or guarantee: the whole deposit is credited to its DEX balance
* and the quantity is carried to the next lot. Other winners are unaffected.
*/
var mockSettleRecord = (record) => {
	const now = nowNs();
	const report = {
		auctionId: record.auction.id,
		attempted: 0n,
		settled: 0n,
		failed: 0n,
		settledE8s: 0n,
		carriedE8s: 0n,
		remaining: 0n
	};
	for (const bid of record.bids) {
		if (bid.settlement.status !== SettlementStatus__1.pending) continue;
		report.attempted += 1n;
		mockAuctionCredit(bid.bidder, bid.token, 0n, -bid.deposited);
		if (record.failBidIds.has(bid.id)) {
			bid.servedDeposit = 0n;
			bid.returned = bid.deposited;
			mockAuctionCredit(bid.bidder, bid.token, bid.deposited, 0n);
			bid.settlement = {
				...bid.settlement,
				status: SettlementStatus__1.failed,
				carriedE8s: bid.servedE8s,
				surplusReturned: bid.deposited,
				failureReason: "Position creation refused: pool temporarily unavailable",
				attemptedAt: now
			};
			if (record.carryFailed) {
				mockAuctionState.pendingLotE8s += bid.servedE8s;
				mockAuctionState.pendingRemainderE8s += record.mintPlan.get(bid.id) ?? 0n;
			}
			report.failed += 1n;
			report.carriedE8s += bid.servedE8s;
			continue;
		}
		const taken = bid.servedDeposit;
		const amountB = bid.priceB * bid.servedE8s / 10n ** 8n;
		const surplus = bid.deposited - taken;
		mockAuctionCredit(bid.bidder, bid.token, surplus, 0n);
		bid.returned = surplus;
		const minted = record.mintPlan.get(bid.id) ?? 0n;
		if (minted > 0n) {
			state.sold += minted;
			mockRemainderMinted += minted;
		}
		mockAuctionGuaranteeCredit(bid.token, bid.servedE8s, amountB);
		bid.settlement = {
			...bid.settlement,
			status: SettlementStatus__1.settled,
			mintedE8s: minted,
			settledE8s: bid.servedE8s,
			takenAmount: taken,
			creatorShare: taken - 2n * amountB,
			positionAmount: amountB,
			guaranteeAmount: amountB,
			surplusReturned: surplus,
			positionId: nextPositionId++,
			attemptedAt: now,
			settledAt: now
		};
		report.settled += 1n;
		report.settledE8s += bid.servedE8s;
	}
	record.auction.settlement = mockSettlementSummary(record.bids);
	return report;
};
/** Pending settlements run 30 s after closing (switch ?auction=settlepending keeps them pending). */
var mockSettleDue = () => {
	if (auctionScenario() === "settlepending") return;
	const now = nowNs();
	for (const record of mockClosedAuctions) if (record.auction.settlement.pendingCount > 0n && now - record.auction.closedAt >= MOCK_SETTLE_DELAY_NS) mockSettleRecord(record);
};
/** Closing rates; absent when no valid rate exists (closing then waits). */
var mockAuctionRates = () => dexRatesValid() && auctionScenario() !== "pending" ? PAY_TOKEN_ORDER.map((token) => ({
	token,
	usdE8: MOCK_PAY_USD_E8[token]
})) : void 0;
var mockClosedSeeded = false;
/** Two closed auctions: one partly sold, one fully sold with every outcome. */
var mockSeedClosed = () => {
	if (mockClosedSeeded) return;
	mockClosedSeeded = true;
	const now = nowNs();
	const usd = (n) => BigInt(n) * 100000000n;
	const priceIn = (token, usdWhole) => usd(usdWhole) * 10n ** BigInt(PAY_TOKENS[token].decimals) / MOCK_PAY_USD_E8[token];
	const rates = PAY_TOKEN_ORDER.map((token) => ({
		token,
		usdE8: MOCK_PAY_USD_E8[token]
	}));
	const bid = (id, auctionId, bidder, token, quantityE8s, usdWhole, createdAt, extraDeposit = 0n) => {
		const priceB = priceIn(token, usdWhole);
		const required = mockAuctionRequired(priceB, quantityE8s);
		return {
			id,
			auctionId,
			bidder,
			token,
			quantityE8s,
			priceB,
			requiredDeposit: required,
			deposited: required + extraDeposit,
			memo: new TextEncoder().encode(`TTTI-AB-${id}`),
			block: 1000n + id,
			createdAt
		};
	};
	const firstOpened = now - 74n * HOUR_NS;
	const first = mockRunClosing({
		id: 1n,
		openedAt: firstOpened,
		closesAt: firstOpened + AUCTION_DURATION_NS,
		closedAt: firstOpened + AUCTION_DURATION_NS + 120000000000n,
		lotSizeE8s: 25000000n,
		reserve: {
			floorUsdE8: usd(1e4),
			dailyAverageUsdE8: usd(9870),
			consolidatedUsdE8: usd(9940),
			reserveUsdE8: usd(1e4),
			binding: ReserveBinding.floor
		},
		rates,
		bids: [
			bid(1n, 1n, HOLDER_2, PayToken.ckusdc, 10000000n, 10200, firstOpened + HOUR_NS),
			bid(2n, 1n, CALLER, PayToken.ckusdt, 5000000n, 10100, firstOpened + 2n * HOUR_NS),
			bid(3n, 1n, HOLDER_3, PayToken.ckusdc, 2000000n, 9800, firstOpened + 3n * HOUR_NS)
		]
	});
	const secondOpened = now - 50n * HOUR_NS;
	const second = mockRunClosing({
		id: 2n,
		openedAt: secondOpened,
		closesAt: secondOpened + AUCTION_DURATION_NS,
		closedAt: secondOpened + AUCTION_DURATION_NS + 120000000000n,
		lotSizeE8s: 50000000n,
		reserve: {
			floorUsdE8: usd(1e4),
			dailyAverageUsdE8: usd(10150),
			consolidatedUsdE8: usd(10420),
			reserveUsdE8: usd(10420),
			binding: ReserveBinding.consolidated
		},
		rates,
		bids: [
			bid(4n, 2n, HOLDER_2, PayToken.ckusdc, 20000000n, 11e3, secondOpened + HOUR_NS),
			bid(5n, 2n, CALLER, PayToken.icp, 20000000n, 10800, secondOpened + 2n * HOUR_NS),
			bid(6n, 2n, HOLDER_3, PayToken.ckusdt, 20000000n, 10600, secondOpened + 3n * HOUR_NS),
			bid(7n, 2n, CALLER, PayToken.ckusdc, 15000000n, 10500, secondOpened + 4n * HOUR_NS),
			bid(8n, 2n, HOLDER_2, PayToken.ckusdc, 10000000n, 1e4, secondOpened + 5n * HOUR_NS),
			bid(9n, 2n, CALLER, PayToken.ckusdt, 5000000n, 9900, secondOpened + 6n * HOUR_NS, 25000000n)
		]
	});
	first.failBidIds.add(2n);
	first.carryFailed = false;
	second.carryFailed = false;
	mockClosedAuctions.push(first, second);
	mockSettleDue();
};
/** Closes the current auction when a valid rate exists; false while closing is pending. */
var mockCloseCurrent = (current) => {
	const rates = mockAuctionRates();
	if (!rates) return false;
	const { reserve, binding, current: consolidatedNow, dailyAverage } = mockAuctionReserve();
	const record = mockRunClosing({
		id: current.id,
		openedAt: current.openedAt,
		closesAt: current.closesAt,
		closedAt: nowNs(),
		lotSizeE8s: current.lotSizeE8s,
		blockSale: current.blockSale,
		remainderE8s: current.remainderE8s,
		bids: mockAuctionState.bids,
		reserve: {
			floorUsdE8: AUCTION_RESERVE_USD_E8,
			dailyAverageUsdE8: dailyAverage,
			consolidatedUsdE8: consolidatedNow,
			reserveUsdE8: reserve,
			binding
		},
		rates
	});
	if (auctionScenario() === "settlefail") {
		const firstWinner = record.bids.find((b) => b.servedE8s > 0n);
		if (firstWinner) record.failBidIds.add(firstWinner.id);
	}
	mockClosedAuctions.push(record);
	mockAuctionState.pendingLotE8s += record.auction.carriedOverE8s;
	let mintedPlanned = 0n;
	for (const planned of record.mintPlan.values()) mintedPlanned += planned;
	mockAuctionState.pendingRemainderE8s += current.remainderE8s - mintedPlanned;
	mockAuctionState.current = null;
	mockAuctionState.bids = [];
	return true;
};
/** The auction still accepting a closing (open, or past its time with closing pending). */
var mockAuctionOpen = () => {
	mockSeedClosed();
	const current = mockAuctionState.current;
	if (!current || current.closesAt > nowNs()) return current;
	return mockCloseCurrent(current) ? null : current;
};
/** Reads that must see the settlement state after any due settlement ran. */
var mockAuctionSettled = () => {
	const current = mockAuctionOpen();
	mockSettleDue();
	return current;
};
var mockAuctionRequired = (priceB, quantityE8s) => (2n * priceB * quantityE8s * 100n + 10n ** 8n * 99n - 1n) / (10n ** 8n * 99n);
/** USD (e8) per whole TTTI-T of a price expressed in base units of the pay token per whole TTTI-T. */
var mockBidUsdE8 = (token, priceB) => priceB * MOCK_PAY_USD_E8[token] / 10n ** BigInt(PAY_TOKENS[token].decimals);
var mockAuctionCheck = (priceB, quantityE8s, token) => {
	if (priceB === 0n) return {
		__kind__: "invalidPrice",
		invalidPrice: null
	};
	const bidUsdE8 = mockBidUsdE8(token, priceB);
	if (bidUsdE8 < AUCTION_RESERVE_USD_E8) return {
		__kind__: "priceBelowMinimum",
		priceBelowMinimum: {
			minimumUsdE8: AUCTION_RESERVE_USD_E8,
			bidUsdE8
		}
	};
	const open = mockAuctionState.current;
	if (open?.blockSale && quantityE8s !== open.lotSizeE8s) return {
		__kind__: "wholeLotRequired",
		wholeLotRequired: { lotSizeE8s: open.lotSizeE8s }
	};
	if (quantityE8s < AUCTION_MIN_QUANTITY_E8S) return {
		__kind__: "quantityBelowMinimum",
		quantityBelowMinimum: { minimum: AUCTION_MIN_QUANTITY_E8S }
	};
	return null;
};
/**
* Reserve per TTTI-T: the highest of the fixed floor, the 24 h average of the
* consolidated price and the current consolidated price. A component that is
* unavailable is left out, so the reserve never falls below the floor.
*/
var mockAuctionReserve = () => {
	const consolidated = dexConsolidatedPrice();
	const current = consolidated.price.__kind__ === "available" ? consolidated.price.available : void 0;
	const dailyAverage = current === void 0 ? void 0 : consolidated.dailyAverageUsdE8;
	let reserve = AUCTION_RESERVE_USD_E8;
	let binding = ReserveBinding.floor;
	if (dailyAverage !== void 0 && dailyAverage > reserve) {
		reserve = dailyAverage;
		binding = ReserveBinding.dailyAverage;
	}
	if (current !== void 0 && current > reserve) {
		reserve = current;
		binding = ReserveBinding.consolidated;
	}
	return {
		reserve,
		binding,
		current,
		dailyAverage
	};
};
var mockAuctionView = () => {
	const current = mockAuctionOpen();
	mockAbsorbMintRemainder();
	const price = mockPrice();
	const { reserve, binding, current: consolidatedNow, dailyAverage } = mockAuctionReserve();
	return {
		open: current !== null,
		auctionId: current?.id,
		lotSizeE8s: current?.lotSizeE8s ?? 0n,
		pendingLotE8s: mockAuctionState.pendingLotE8s,
		lotRemainderE8s: current?.remainderE8s ?? 0n,
		pendingRemainderE8s: mockAuctionState.pendingRemainderE8s,
		blockSale: current?.blockSale ?? false,
		openedAt: current?.openedAt,
		closesAt: current?.closesAt,
		reservePriceUsdE8: reserve,
		reserveFloorUsdE8: AUCTION_RESERVE_USD_E8,
		consolidatedPriceUsdE8: consolidatedNow,
		dailyAverageUsdE8: dailyAverage,
		reserveBinding: binding,
		reservePrices: PAY_TOKEN_ORDER.map((token) => ({
			token,
			price: token === PayToken.icp && !price.usable ? void 0 : reserve * 10n ** BigInt(PAY_TOKENS[token].decimals) / MOCK_PAY_USD_E8[token]
		})),
		minQuantityE8s: AUCTION_MIN_QUANTITY_E8S,
		maxBidsPerPerson: AUCTION_MAX_BIDS,
		guaranteeRecoverable: true,
		closingPending: current !== null && current.closesAt <= nowNs()
	};
};
var mockPlaceAuctionBid = (token, quantityE8s, priceB, depositAmount) => {
	const current = mockAuctionOpen();
	if (!current || current.closesAt <= nowNs()) return {
		__kind__: "err",
		err: {
			__kind__: "noOpenAuction",
			noOpenAuction: null
		}
	};
	const invalid = mockAuctionCheck(priceB, quantityE8s, token);
	if (invalid) return {
		__kind__: "err",
		err: invalid
	};
	const mine = mockAuctionState.bids.filter((b) => b.bidder.toText() === CALLER.toText());
	if (BigInt(mine.length) >= AUCTION_MAX_BIDS) return {
		__kind__: "err",
		err: {
			__kind__: "tooManyBids",
			tooManyBids: { maximum: AUCTION_MAX_BIDS }
		}
	};
	const required = mockAuctionRequired(priceB, quantityE8s);
	const ledgerFee = PAY_TOKENS[token].fee;
	if (depositAmount < ledgerFee) return {
		__kind__: "err",
		err: {
			__kind__: "depositBelowLedgerFee",
			depositBelowLedgerFee: {
				fee: ledgerFee,
				deposited: depositAmount
			}
		}
	};
	if (depositAmount < required) return {
		__kind__: "err",
		err: {
			__kind__: "depositBelowRequired",
			depositBelowRequired: {
				deposited: depositAmount,
				required
			}
		}
	};
	const id = mockAuctionState.nextBidId;
	mockAuctionState.nextBidId += 1n;
	const bid = {
		id,
		auctionId: current.id,
		bidder: CALLER,
		token,
		quantityE8s,
		priceB,
		requiredDeposit: required,
		deposited: depositAmount,
		memo: new TextEncoder().encode(`TTTI-AB-${id}`),
		block: 1000n + id,
		createdAt: nowNs()
	};
	mockAuctionState.bids.push(bid);
	return {
		__kind__: "ok",
		ok: bid
	};
};
var mockOpenAuction = () => {
	if (mockAuctionOpen()) return {
		__kind__: "err",
		err: OpenAuctionError.alreadyOpen
	};
	mockAbsorbMintRemainder();
	if (mockAuctionState.pendingLotE8s === 0n) return {
		__kind__: "err",
		err: OpenAuctionError.emptyLot
	};
	const openedAt = nowNs();
	const auction = {
		id: mockAuctionState.nextAuctionId,
		lotSizeE8s: mockAuctionState.pendingLotE8s,
		blockSale: mockAuctionState.pendingLotE8s < AUCTION_MIN_QUANTITY_E8S,
		remainderE8s: mockAuctionState.pendingRemainderE8s,
		openedAt,
		closesAt: openedAt + AUCTION_DURATION_NS
	};
	mockAuctionState.nextAuctionId += 1n;
	mockAuctionState.pendingLotE8s = 0n;
	mockAuctionState.pendingRemainderE8s = 0n;
	mockAuctionState.current = auction;
	return {
		__kind__: "ok",
		ok: auction
	};
};
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
	"Memos are TTTI-<prefix>-<n> or TTTI-<prefix>-<n>-<m> (32 bytes at most, no principal, n global); prefixes PC, RF, FW, SH, GR, BR.",
	"Ok or #Duplicate means sent; Err is a known failure; a reject or trap leaves the outcome unknown until an Ok, a #Duplicate or the admin's check.",
	"The same request is resent unchanged for 23 h, then the transfer becomes #needsReview. Only a new attempt changes destination, amount or fee, with a new memo and a new created_at_time.",
	"Treasury forwards (FW) and reserve shares (SH) are sent by a 10-minute timer, re-armed on every install and upgrade. A zero-amount forward is #notRequired.",
	"Purchase refunds (RF, memo TTTI-RF-<n>) are retried only when the balance covers the amount; success sets the purchase #refunded, an unknown outcome after 23 h sets it #refundReview.",
	"A purchase trace (memo TTTI-PC-<n>) is written before the collect await; an unknown collect outcome or a trap after the debit moves it to the payments to refund.",
	"",
	"## Pools and rules in plain words (lot PTM-7)",
	"Rules only; no text describes an expected price or effect.",
	"- The protocol never places a price-linked order. Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price (journal: listLiquidityInjections).",
	"- No reward is created: everything paid out was first paid by someone (minters, traders, transfers), and anyone can verify it on the ledgers and in the public records.",
	"- TTTI-T generates nothing by itself. Swap fees pay the liquidity provided, and only the fees actually paid over the past 30 days are shown, stated as a recorded fact.",
	"- Impermanent loss: a liquidity position holds a share of the pool, not a fixed amount of each token. When the pool price moves, the position can be worth less than the same tokens held outside the pool, whatever the fees collected.",
	"- Exposure: through its pools (TTTI-T/ICP, TTTI-T/ckBTC, TTTI-T/ckUSDC, TTTI-T/ckUSDT) the TTTI-T side of a position is exposed to the value of BTC and ICP.",
	"- Mint zap: an automatic swap in the target pool, made with the minter's own money at the moment of the mint, at the pool's market price and fee, so that the rest can be deposited at the pool ratio.",
	"- Personal guarantee: each minter can recover their own stake by returning TTTI-T under the redemption rules; there is no common reserve and no promise of value.",
	"- Chance: at the mint every minter has an equal chance (same price, no bid, no priority). At auctions the highest bids win, in price order, until the lot is sold.",
	"- Lock (relay): optional, from 3 months to 5 years of remaining time, at opening and after an extension. A third of the weight of each new commitment relieves the other locked positions of the pool (relief of a third party); an owner can extend. A relieved or expired position is unlocked without eviction: it stays in the pool as free liquidity.",
	"- LP fees: half stays in the reserves pro rata to shares; half is set aside and shared among locked positions by capital x sqrt(remaining time / 5 years), only fees actually paid.",
	"- Auctions: sealed bids; each bidder pays their own bid; the reserve is the highest of 10_000 USD, the 24 h average of the consolidated price and the current consolidated price; nothing is reissued below 10_000 USD.",
	"- The creator's holdings are declared and public (getCreatorHoldings); the creator is not named.",
	"",
	"## Liquidity-forming mint (isolated)",
	"- quoteLiquidityMint(args) : query -> Result<LiquidityMintQuote, LiquidityMintError> and mintLiquidity(args) -> Result<LiquidityMintResult, LiquidityMintError> — the creator share is 1 % of the amount paid after the cycles reserve; the rest forms the minter's position and guarantee.",
	"- The mint is isolated: the swap, the pool deposit and the guarantee form one unit. If swap is refused, the deposit is refused or the balance cannot cover the guarantee, the whole mint fails: no TTTI-T is minted (total supply and mintable remaining unchanged), pool reserves and positions are unchanged, the mass and the guarantee are unchanged, and the payment sits in the payer's internal balance, where it is withdrawable.",
	"- The contract then withdraws the payment to the payer's wallet (memo TTTI-DW-<n>). LiquidityMint { id; status; refundWithdrawalN?; refusalCause?; paymentBlock?; positionId?; ... } records the withdrawal number and the cause of the refusal.",
	"- MintStatus: #inProgress, #completed, #refunding (withdrawal in progress), #refunded, #refundFailed (the payment stays in the internal balance and can be withdrawn with withdrawFromDex). Only #completed mints count as sold and in the mass.",
	"- LiquidityMintError for a failed isolated mint: #depositFailedRefunded { mintId } (payment returned, ledger fee deducted), #depositFailedRefunding { mintId } (payment being returned, it remains in the internal wallet balance until the withdrawal ends) and #depositFailedRefundFailed { mintId } (withdrawal failed, the payment remains in the internal balance).",
	"- liquidityMintCore(args) is the isolated core of the mint, reserved to the canister itself (self-call): any other caller is rejected with \"Unauthorized: reserved to the canister itself\". A refusal inside it rolls the whole message back.",
	"- The mint lock releases itself: a mint that fails, traps or stops on a refusal frees the caller's lock without any manual action, so a new mint can follow at once (#purchaseInProgress only while a call is running).",
	"- Simulation switch ?mint=: rate, cap, balance, allowance, slippage (refused before payment); swap, deposit, guarantee (isolated failure, payment returned); refunding (withdrawal in progress, then succeeded on the next getMyLiquidityMints); refundfailed (withdrawal failed). A built-in self-check throws if a failed isolated mint minted TTTI-T, moved the pool, changed the mass or guarantee, or did not leave the payment in the payer's balance.",
	"",
	"## Personal guarantee and redemption (PTM-2)",
	"- Each minter has one personal mass per payment token: the TTTI-T minted and the guarantee deposited with the mint. No mass is shared between owners.",
	"- Each minter can recover their own stake by returning TTTI-T under the redemption rules; the guarantee is personal, with no common reserve and no promise of value.",
	"- The right to redeem belongs to the person: any TTTI-T the person holds can be returned, up to the remaining mass. Returned TTTI-T go to a contract-held account and stay out of circulation; nothing is burned.",
	"- getMyGuaranteeMasses() : query -> [GuaranteeMassView] — token, totalTtti, totalGuarantee, remainingTtti, remainingGuarantee, excess, withdrawableExcess (excess once the mint has ended), guaranteeValue (remainingGuarantee + excess), rateUsdE8, guaranteeValueUsdE8, mintEnded.",
	"- quoteGuaranteeRedeem(token, tttiAmount) : query -> Result<RedeemQuote, GuaranteeError> — during the mint the returned amount is the lower of the guarantee deposited for the amount and the quantity worth 10,000 USD x amount at the stored rate (rule #depositedGuarantee or #dayRate); the difference stays in the guarantee as excessKept. After the mint it is the pro rata share of the mass, in kind (rule #proRata). redemptionFee is 1 % of returnedAmount; netAmount = returnedAmount - redemptionFee - thirdPartyFee; tttiAllowanceRequired = tttiAmount + tttiTransferFee.",
	"- redeemGuarantee(token, tttiAmount, expectedNetAmount) -> Result<Redemption, GuaranteeError> — pulls tttiAmount with ICRC-2 transfer_from, updates the mass and records the payout (memo TTTI-GR-<n>, created_at_time) before the first await. Refused with #slippage when the net amount is lower than expectedNetAmount, and with #salesPaused while sales are paused.",
	"- withdrawGuaranteeExcess(token) -> Result<Redemption, GuaranteeError> — pays the caller's excess once the mint has ended (#mintNotEnded before, #noExcess when none); kind #excessWithdrawal, tttiAmount 0.",
	"- listMyRedemptions() : query -> [Redemption] — status, amounts, TTTI-T pull block, payout attempt.",
	"- getUnclaimedMassTotal() : query -> UnclaimedMassTotal — public: remainingTtti, massCount, mintEnded and, per token, remainingTtti, remainingGuarantee and excess.",
	"- getGuaranteeAccounts() : query -> [GuaranteeAccountView] — public, one entry per token (TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT): { token; massTotal (sum of every guarantee mass, remaining guarantee + excess, all owners); accountBalance (balance of the dedicated internal guarantee account); equal (massTotal == accountBalance) }. The mint and the auction settlement credit the account with each guarantee; a redemption (and an excess withdrawal) is the only debit. The funds stay in the common custody.",
	"- listRedemptionFees(offset, limit) : query -> [RedemptionFee] — admin: the 1 % redemption fees set aside for the creator.",
	"- GuaranteeError: #anonymous, #salesPaused, #massNotFound, #nothingRemaining, #amountTooSmall, #amountExceedsMass, #rateUnavailable, #tttiBalanceInsufficient, #allowanceInsufficient, #slippage, #redemptionInProgress, #mintNotEnded, #noExcess, #pullFailed, #callFailed.",
	"",
	"## Bitcoin deposits",
	"- getBtcPurchaseAddress(), getBtcWalletAddress() and getBtcWalletAddressFor(owner) (unsigned) -> BtcDepositResult — #Ok with the stored tracking, or an unsaved #addressShown tracking (deposits = []); they store nothing. Errors: #anonymousCaller, #acknowledgementRequired (purchase only), #minterUnavailable.",
	"- checkBtcPurchaseDeposit(), checkBtcWalletDeposit() and checkBtcWalletDepositFor(owner) -> BtcDepositResult — no deposit yet: #Ok with an unsaved tracking (#addressShown, deposits = [], lastCheckedAt set). A tracking is created only when a check detects a deposit; it then drives the progress. Purchase errors add #purchaseInProgress.",
	"- getMyBtcDeposits() : { purchase; wallet } and getBtcWalletDepositsFor(owner) : ?DepositTracking — null until a check detected a deposit.",
	"- The 600 s task watches only the stored trackings: purchases first, then recently active ones.",
	"",
	"## Upgrade readiness (admin only)",
	"- getUpgradeReadiness() : query -> UpgradeReadiness — sales pause, purchases in flight, BTC lock, redemptions in flight, reserve lock, pending cycles top-up attempt, open purchase traces, reserved and the last reconciliation. Non-admin callers trap.",
	"- reconcileReserved() -> Result<ReservedReconciliation, ReconcileError> — sets sale.reserved to 0 and keeps the previous value, date and caller; refused with #notAdmin, #notPaused, #purchaseInFlight or #openTraces.",
	"- redeemGuarantee returns #salesPaused while sales are paused.",
	"",
	"## DEX reserve check and pause (lot 6)",
	"- runDexReserveCheck() -> Result<ReserveCheck, DexReserveError> — admin update: compares, per DEX token, the internal total (user balances available + reserved, pool reserves) with the ledger total. ReserveCheck { checkedAt; results [{ token; internalTotal; ledgerTotal; difference = ledgerTotal - internalTotal; status #ok | #surplus | #shortfall }]; lastSuccessAt; error { message; at } }. Nothing is corrected automatically. A #shortfall pauses the DEX and records a Mismatch { id; at; token; internalTotal; ledgerTotal }.",
	"- resumeDex() -> Result<DexPauseView, DexReserveError> — admin update: refused with #notPaused when the DEX is not paused and with #checkFailed(text) while a shortfall remains in the last check. DexPauseView { paused; reason { token; internalTotal; ledgerTotal; at }; resumed { by; at } }.",
	"- getDexReserveStatus() : query -> Result<DexReserveStatus, DexReserveError> — admin: { lastCheck; unresolvedShortfallCount; checkInProgress; pause; history [Mismatch] }.",
	"- getDexPauseStatus() : query -> PublicDexPause { paused; reasonToken } — public.",
	"- DexReserveError: #unauthorized, #checkInProgress, #notPaused, #checkFailed(text).",
	"- While the DEX is paused, swap, routedSwap, depositToDex and addLiquidity are refused with a paused error; withdrawFromDex and removeLiquidity still work. Sales and minting are not paused.",
	"- runDexReserveCheck() now returns ReserveCheckView (ReserveCheck plus accounts [AccountResult { kind #dexHoldings | #requestDeposits | #mintFee | #protocolFees; token; accountLabel; ledgerBalance; owed; difference; status; checkedAt }]). getDexReserveStatus() adds accounts and accountHistory [AccountMismatch { id; at; token; kind; accountLabel; owed; ledgerBalance }]. DexPauseView adds account (AccountRef { token; kind; accountLabel }) naming the account that caused the pause.",
	"- DEX custody sweep (admin): runDexSweep() and resendDexSweepTransfers() -> Result<[TokenState], ...>; getDexSweepState() -> [TokenState]; getDexCustodyComparison() -> [{ token; comparison }]; listDexSweepTransfers(cursor, limit) -> Page { items [SweepTransferView]; nextCursor ?Nat } (limit capped at 100, default 50); getDexSweepProgress() -> SweepProgress { runId; active; batches; tokens [SweepTokenProgressView] }; getDexCustodyAccounts() (public) -> [{ token; account }]. Review kinds #SW (sweep transfer, Arrived and Not arrived) and #CS (custody surplus, credited to no one, #notApplicable for both buttons).",
	"- Reserve check in batches (PTM-9e, PTM-9f): ReserveProgress adds phase (#idle, #inProgress or #finished), batch, totalBatches and alertDecided. The zero-compared alert is decided only once the complete run has ended (alertDecided true), never after the first batch. DexReserveStatus adds excludedReread { active; runId; startedAt; excludedCount; read; reincluded; unreadable; batchSize; lastBatchAt; lastFinishedAt; nextRunAt }: once a day the accounts excluded after a sweep to zero are read again in batches; a non-zero balance re-includes the account at once, in the check and in the sweep, and a new DEX operation of the account includes it again. There is no 30-day delay.",
	"- UpgradeReadiness adds dexPaused, dexPauseReason, lastReserveCheckAt, lastReserveCheckStatus, unresolvedShortfallCount, dexOperationsInFlight and dexReady.",
	"- The simulated contract finds a shortfall on ICP at every second check, seen by two consecutive checks and then repaired, so the pause and resume paths can be exercised.",
	"",
	"## Review (admin only)",
	"- listTransfersToReview() : query -> [TransferReview] — FW, SH and RF under review, every PC payment to refund, BR BTC refunds to verify (id = BR attempt number), BC BTC cost sends to the treasury to verify (id = trace number), BM delivery-failure costs to refund by hand (id = conversion id) and GR redemption payouts to verify (id = redemption id); kind, purchaseId, token, memoText, memoHex, createdAtTimeNs, amount, fee, destination (the buyer for PC), sends, lastError, block (when known), collect (PC: #confirmed or #unknown), buyer, depositIndex, conversionId, refundPurpose (BR: #excess, #fullRefund or #deliveryFailedExcess), outcome (BR/BC).",
	"- markTransferArrived(kind, purchaseId, block) -> ReviewResult — records the ledger block for FW, SH, RF, BR, BC or GR (RF sets the purchase #refunded; GR sets the payout block and completes the redemption); PC and BM return #notApplicable.",
	"- markTransferNotArrived(kind, purchaseId) -> ReviewResult — FW, SH, RF or BR: opens a new attempt sent by the timer; BC: removes the cost send and its payment to refund, and the deposit is converted again later by the timer; PC: removes a payment that never happened; GR: the payout is closed as not sent; BM returns #notApplicable.",
	"- markRefundedManually(kind, purchaseId, block) -> ReviewResult — RF, PC or BM only: records the item as refunded with the block and removes it from the list; FW, SH, BR and BC return #notApplicable.",
	"- ReviewError: #notAdmin, #notFound, #notUnderReview, #notApplicable.",
	"- ConversionStatus adds #refundReview: refund outcome unknown after 23 h.",
	"",
	"## DEX balances (lot 2)",
	"- Per-user deposit subaccount: [0xDD, principal length, principal bytes, zero padding] (32 bytes), recomputable by anyone, no secret.",
	"- getDexTokens() : [DexTokenInfo] — TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT with ledger, decimals, fee, minimumDeposit and minimumWithdrawal.",
	"- getDexDepositAccount(owner) : DexAccount; getDexPoolAccount(poolId) : ?DexAccount.",
	"- getDexBalances(owner) : [DexBalanceView] — public, one row per token with available and reserved; getDexTransfers(owner) : [DexTransferView] — public, unpaged; getDexTransfersPage(owner, cursor : ?Nat, limit : Nat) : Page { items [DexTransferView]; nextCursor ?Nat } — public, newest first, cursor = transfer number n (global across deposits and withdrawals): null returns the newest items, ?c the transfers with n strictly below c; limit 0 means 50, capped at 100; nextCursor = n of the last returned transfer while older ones may remain, null on the last page.",
	"- depositToDex({ token; amount }) — DD: icrc2_transfer_from of amount (the user approves amount plus the ledger fee), memo TTTI-DD-<n> with created_at_time; credits available. Errors: #anonymous, #amountTooSmall, #transferInProgress, #insufficientAllowance, #insufficientFunds, #ledgerError.",
	"- withdrawFromDex({ token; amount }) — DW: available -> reserved, transfer of amount minus the ledger fee to the owner, memo TTTI-DW-<n>; Ok: final debit, Err: given back. Errors: #anonymous, #amountTooSmall, #insufficientBalance, #transferInProgress, #ledgerError.",
	"- PairRequestView.refundStatus: #none, #inProgress, #needsReview or #refunded(block); the DQ refund of an approved request uses memo TTTI-DQ-<pair request id> (the request number, not a transfer counter); renewed attempts append -<m>. The deposit of a refused request is counted once as TTTI-T feeding the protocol liquidity (mockRefusedPairDeposits, a per-request flag plus a running total); pending or approved requests add nothing and no TTTI-T is created.",
	"- To review adds DD, DW (id = transfer n) and DQ (id = request id). Arrived: DD credits, DW final debit, DQ #refunded. Not arrived: DD nothing credited, DW given back, DQ new attempt.",
	"",
	"## DEX liquidity and swaps (lot 3)",
	"- PoolStatus: #filling, #active or #removed. An approved pool starts #filling with zero reserves and shares; several users add liquidity. #active follows the depth: it is derived from the current depth and rate, so a pool can go back to #filling. Liquidity positions are public and linked to the identifier on TTTI: principal, shares, amounts, lock and unlock date are public.",
	"- Pool depth (PoolView.depth : PoolDepth { usdE8 optional; basis; missingRate }) is the USD value of the reserves at the pool price. basis #twiceNonTttiSide: a TTTI-T pair counts twice the USD value of its non-TTTI-T side (no fixed value for TTTI-T). basis #sumOfSides: other pairs count both sides at the hourly stored rate, valid 1 h plus 5 minutes. Missing or expired rate: usdE8 absent and missingRate names the tokens.",
	"- Swap threshold: PoolView.swapThresholdUsdE8 = 10 USD, measured on PoolView.thresholdMeasuredUsdE8 with PoolView.thresholdBasis (#tttiSideAtPoolPrice: 10 USD of TTTI-T in the pool for TTTI-T pairs; #sumOfSides: 10 USD of depth for utility pairs), evaluated dynamically at each call. It applies only to swaps, never to pool creation, deposits, liquidity, buying or minting. Swaps are refused below it and reopen as soon as the measure is back at or above it. The mint minimum is 1 USD (about 0.0001 TTTI-T). PoolView.swapState : SwapState { open; reason } with reason #open, #belowThreshold, #rateUnavailable, #removalAnnounced(effectiveAt), #removalExecuting or #removed. The first deposit has no minimum; shares = floor(sqrt(A x B)) minus the minimum shares locked to the contract forever. PoolView also carries reserve0, reserve1, totalShares, lockedShares, guaranteedDepth : GuaranteedDepth { lockedPositionShares; permanentShares; amount0; amount1; depth } (locked positions plus permanent liquidity), protocolFee0, protocolFee1, gauge : UsdGauge (same threshold) and removal : RemovalView.",
	"- getReferencePrice(poolId) : query ?ReferencePrice { poolId; kind; computedAt; available; unavailable; tttiPriceUsdE8; expected; toleranceBps; sources; ratesValid } — public. TTTI-T pools: the price of TTTI-T in USD is the weighted mean (weightBps, total 10000) of the readable sources, ICPSwap pairs and native open TTTI-T pools (ReferenceSource { kind; sourceLabel; poolId; counter; tttiPriceUsdE8; depthUsdE8; weightBps; readAt }); utility pairs use the hourly rates. Unavailable: #noReadableSource or #rateUnavailable { token0; token1 }. refreshReferenceSources() -> Nat reads the ICPSwap pairs again and returns the number of readable pairs.",
	"- getConsolidatedTttiPrice() : query ConsolidatedPrice { price : #available(usdE8) | #unavailable(#noValidRate | #noOpenPool); hourlyAverageUsdE8; hourlySamples; dailyAverageUsdE8; dailySamples; sources : [ConsolidatedSource { poolId; counterSymbol; priceUsdE8; depthUsdE8; weightBps }]; computedAt } — public. Price of one TTTI-T in USD: mean of the open TTTI-T pool prices weighted by depth; the averages come from the stored hourly and 24 h samples.",
	"- getPoolSpreads() : query PoolSpreadReport { consolidatedPriceUsdE8; computedAt; thresholdBps (200 = 2 %); pools : [PoolSpread { poolId; counterSymbol; status : #ok | #empty | #noRate | #notOpen | #noConsolidatedPrice; priceUsdE8; spreadBps (signed, pool price versus consolidated price); exceedsThreshold }] } — public.",
	"- getPoolCapRatio() : query PoolCapRatioView { computedAt; poolsValueUsdE8 (optional); poolCount; circulatingTttiT; consolidatedPriceUsdE8 (optional); capitalisationUsdE8 (optional); currentRatio (optional); averageRatio24h (optional); samples; retainedRatio (optional); targetRatio; lockedShare; ratioScale; lockedShareScale } — public, no argument. USD amounts are USD x 1e8. Ratios are fixed-point with scale ratioScale (10^12 is 100 %; the target 5e11 is 50 %). lockedShare uses scale lockedShareScale (10^6 is 100 %; 500000 is 50 %). Pools value = 2 x the counterpart reserve of each TTTI-T pool at oracle rates; capitalisation = circulating TTTI-T x the instantaneous consolidated price measured at the same moment as the pools value; ratio = pools value / capitalisation; the locked share m is derived from the retained ratio, the lower of the current ratio and the 24 h average (50 % when the ratio is missing).",
	"- getMyPoolSpreadAlerts() : query [PoolSpreadAlert { poolId; counterSymbol; spreadBps; thresholdBps; poolPriceUsdE8; consolidatedPriceUsdE8; computedAt; positionIds }] — caller only: the pools whose spread exceeds the threshold and where the caller holds a position; anonymous callers get an empty list.",
	"- DexConfig adds swapThresholdUsdE8 (10 USD, swaps only), defaultSlippageBps (50), referenceToleranceBps (200) and removalNoticeNs (5 days); tttiTUsdE8 is 0 (no fixed TTTI-T value); minLockNs is 91 days (3 months, 7862400000000000 ns) and maxLockNs 5 years (157766400000000000 ns); relayDivisor is 3 and lockedFeeSharePercent 50.",
	"- quoteAddLiquidity({ poolId; side; amount; counterAmount; slippageBps }) -> AddLiquidityQuote — side and amount are the fixed side. On an open or filling pool the counter side is computed from the pool ratio at the call (counterSide, counterAmount, rounded up) and counterAmount, when given, is the expected value the slippage is measured against. First deposit of an empty pool: counterAmount required, fixes the ratio, no minimum. The quote also returns slippageBps (default 0.5 %, maximum 10000), shares, lockedShares, gaugeAfter, depthAfterUsdE8, referenceCheck : ReferenceCheck { applicable; withinBand; expected; deviationBps; toleranceBps; unavailable }, opensPool and isFirstDeposit.",
	"- addLiquidity({ poolId; side; amount; counterAmount; slippageBps; lockDurationNs }) -> AddLiquidityResult — from internal balances; one position per add. The lock is optional: lockDurationNs absent or 0 = no lock; a lock lasts from 3 months (91 days) to 5 years of remaining time. Each commitment relays one third of its weight (capital x time) to the committed positions of the pool: they are shortened in proportion to capital x time served, none is lengthened, and a relieved position stays in the pool as free liquidity (AddLiquidityResult.relay : RelayOutcome { weight; relayWeight; shortenedWeight; positionsShortened; positionsFreed }). If the counter amount moved beyond the slippage tolerance the call is refused with #slippageExceeded { toleranceBps; expectedCounterAmount; actualCounterAmount } and nothing is debited: the funds stay in the internal balance. Unused amount (surplus0, surplus1) is never debited and stays in the internal balance. First deposit of an empty pool: refused with #referenceOutOfBand { expected; deviationBps; toleranceBps } outside the 2 % band around the reference price, or #referenceUnavailable. Errors: #anonymous, #poolNotFound, #poolRemoved, #removalAnnounced { effectiveAt }, #minimumsNotSet, #unsupportedToken, #zeroAmount, #counterAmountRequired, #insufficientBalance, #belowMinimum, #ratioMismatch, #invalidSlippage { maximumBps }, #slippageExceeded, #referenceOutOfBand, #referenceUnavailable, #lockTooShort { minimumNs }, #lockTooLong { maximumNs }, #zeroShares, #operationInProgress.",
	"- removeLiquidity(positionId) -> RemoveLiquidityResult — owner only, after unlockAt, in every pool state including #removed; pro rata amounts (rounded down) credited to internal balances. No function lets the admin shorten or cancel a lock.",
	"- extendLock(positionId, newUnlockAt) -> ExtendLockResult { position; relay; pool } — owner only; never shorter; the only rule is the remaining time after the extension: at least 3 months (lockTooShort { minimumNs }) and at most 5 years (lockTooLong { maximumUnlockAt = now + 5 years }); there is no cap from the lock start. The added time relays one third of its weight to the other committed positions of the pool. Errors: #anonymous, #positionNotFound, #notPositionOwner, #poolNotFound, #poolRemoved, #removalAnnounced { effectiveAt }, #cannotShortenLock, #lockTooLong, #lockTooShort, #operationInProgress.",
	"- removePair(poolId, reason) -> Result<PoolView, RemovePairError> (PoolView.removal = #announced) — admin only. Announces the removal of a pair with a public reason (1 to 280 characters), effective after 5 days (removalNoticeNs). RemovalView: #none, #announced { reason; announcedAt; effectiveAt }, #cancelled { reason; announcedAt; effectiveAt; cancelledAt }, #executing { ...; startedAt }, #completed { ...; completedAt }. While announced, swaps and additions are suspended (swapState #removalAnnounced, addLiquidity #removalAnnounced) and removeLiquidity stays permitted, subject to each position's unlockAt. Errors: #notAuthorized, #poolNotFound, #alreadyAnnounced { effectiveAt }, #alreadyRemoved, #reasonEmpty, #reasonTooLong { maximumChars }.",
	"- cancelPairRemoval(poolId) -> Result<PoolView, CancelRemovalError> (PoolView.removal = #cancelled) — admin only, before the effective date. Errors: #notAuthorized, #poolNotFound, #noAnnouncement, #alreadyCancelled, #alreadyExecuting, #alreadyCompleted. Swaps and additions reopen according to the depth.",
	"- At the effective date every position is liquidated (all positions, locked ones included; the locks end with the pair) and the pool becomes #removed; the amounts are paid out to the owners as liquidation payouts (memo TTTI-LQ-<n>, lib/retry.mo rules). A payout whose outcome is unknown or that fails appears in To review with kind LQ (id = transfer n); Arrived records the block, Not arrived opens a new attempt. Swaps and additions on a #removed pool return #poolRemoved.",
	"- Pair removal (finishRemoval) of a TTTI-T pair: what the contract itself holds in the pool (minimum locked shares and permanent liquidity) is not paid to any wallet. It is reinjected into the least liquid TTTI-T pool as locked shares (the counter token valued at the rates of the hour), and a line of kind #injected is added to the public permanent liquidity log (listPermanentLiquidityLog).",
	"- getDexPosition(positionId) : ?PositionView; listPoolPositions(poolId) and listDexPositionsOf(owner) : [PositionView] — public, linked to the identifier on TTTI (principal, shares, amounts, lock, lockStartedAt, unlockAt, remainingNs, locked, relayReceivedNs, feesCollected0, feesCollected1, isCreator). Creator/admin positions follow the same rules; no admin function acts on other positions.",
	"- startDexDayRoll() : DayRollReport and runDexPotSlice(poolId) : PotSliceReport — timer entries, callable by anyone: the day roll runs once the day is over (freezes each pool's pot and starts its sliced sharing; a pool with no locked position moves its pot to the reserves); one slice shares the frozen pot in two passes (#summing, then #paying). Both do nothing when there is nothing to do.",
	"- getDexPendingPots() : [PendingPotView] and getDexPendingPot(poolId) : ?PendingPotView — public; the pending pot of each pool { poolId; pending0; pending1; dayStart; nextSharingAt; sharingRunning }. The pot is fed by the locked half of the LP fees and shared once a day (nextSharingAt) among the positions locked during the day; without a locked position it carries over.",
	"- getDexEstimatedShare(positionId) : ?EstimatedShareView (public) and getMyDexEstimatedShares() : [EstimatedShareView] (caller) — estimate for the current day { positionId; poolId; owner; weight; lockedNs; dayFractionBps; estimated0; estimated1; nextSharingAt }: proportional to the weight (shares x sqrt(remaining time / 5 years)) and to the fraction of the day the position is locked, over the pot at the time of the call. The amount paid depends on the pot at the next sharing.",
	"- quoteSwap(poolId, tokenIn, amountIn, slippageBps) -> SwapQuote and swap(poolId, tokenIn, amountIn, minAmountOut, deadline) -> SwapResult — constant product, from internal balances, only while swapState is open; fee 0.3 % for the 7 starting pairs (0.05 / 0.3 / 1 % tiers for added pairs), rounded up; 70 % is the LP fee; the 30 % protocol share goes two thirds to the creator and one third to permanent liquidity in the same pool (counted in protocolFee0/1). Of the LP fee, half stays in the reserves pro rata to shares and half (the locked half) feeds the pending pot of the pool; once a day the pot is shared among the positions locked during the day by capital x sqrt(remaining time / 5 years) x fraction of the day locked, credited to feesCollected0/1 and to the owners' DEX balances; only fees actually paid are shared. Only the fees actually paid over the past 30 days are shown, recorded as a fact. Deadline at most 5 minutes after the call. Errors: #poolFilling (with the gauge), #depthBelowThreshold { depthUsdE8; thresholdUsdE8 }, #rateUnavailable, #removalInProgress { effectiveAt }, #poolRemoved, #slippageExceeded, #deadlineExceeded, #deadlineTooFar, #invalidSlippage, #insufficientBalance, #insufficientLiquidity, #tokenNotInPool, #zeroAmount.",
	"",
	"## Cycles autonomy and protocol liquidity (lot 4)",
	"- The cycles reserve has no withdrawal path. CyclesStatus has no excess or withdrawal fields. setTreasuryConfig and setPayTokenAccount are removed.",
	"- getCyclesStatus() : CyclesStatus (public) — topUpThreshold is 20 T cycles: below it, reserve ICP is converted into cycles through the Cycles Minting Canister; the reserve is kept at 2 ICP.",
	"- getCyclesAutonomy() : AutonomyView (admin) — cycles balance, reserve ICP and its cycles estimate at the CMC rate, 7- and 30-day average consumption per day, autonomy in days (target 90), sample count and oldest sample.",
	"- Read-only history: getCyclesShare(), getCyclesShareHistory(), getLastWeeklyAllocation(), listWeeklyAllocations() and listDcBatches() keep past records; no new share change, weekly allocation or DC batch is created.",
	"- getMintTreasuryAccounts() : [MintTreasuryAccount] (admin) — the former internal MINT-TREASURY-<token> subaccounts, read-only; their owner share was settled once to the receiving wallets; legacyExternalAccount is the old admin-set account.",
	"- Native swap fees: 70 % goes to the liquidity providers; the 30 % protocol share goes two thirds to the creator and one third to permanent liquidity in the same pool; nothing goes to cycles and nothing is converted to ICP.",
	"- getProtocolLiquidity() : [ProtocolLiquidityView] (public) — protocol-owned shares per pool, counted in totalShares with no position and locked forever: current amounts, the parts from fees and from the treasury, last addition.",
	"- getMyLpBonus() : LpBonusView (caller) and claimLpBonus() -> ClaimBonusResult — bonuses already earned stay claimable (memo TTTI-DL-<n>); swap fees credit no new bonus. Errors: #anonymous, #nothingToClaim, #belowMinimum { minimumE8s }, #claimInProgress.",
	"",
	"## Mint revenue: direct sends (OW), fee account and settlement (ST)",
	"- A mint is paid 101 for 100. At each mint the 100/101 share is sent directly, in the paid token, to the receiving wallet the admin configured for that token, ledger fee deducted (memo TTTI-OW-<n>, lib/retry.mo rules; an unknown outcome goes to To review). BTC mints follow ckBTC. Nothing accumulates in the contract and there is no withdraw endpoint.",
	"- A mint with a token that has no receiving wallet is refused with #receivingWalletNotConfigured { token } before any funds are taken.",
	"- setReceivingWallet(token, account) -> ReceivingWalletResult (admin) — owner principal plus optional 32-byte subaccount. Errors: #notAdmin, #anonymousOwner, #invalidSubaccount, #contractAccount. getReceivingWallets() -> ReceivingWalletsResult (admin) — per token: wallet, accountText, setAt, setBy.",
	"- The 1/101 mint fee stays in a dedicated contract fee account that cannot be withdrawn. getMintFeeAccount() -> FeeAccountResult (admin) — owner, subaccountHex, accountText, readAt and per token: balance, received, redistributedToLps, setAside, injected.",
	"- getSettlementStatus() -> SettlementStatusResult (admin) — one-time settlement per token: the accumulated revenue and the legacy mint-treasury owner share (minus past withdrawals) are sent to the receiving wallet; legacy and pending fees are moved once to the fee account; LP credits are unchanged. Status #pendingWallet, #sending, #sent([block]), #toReview or #failed(text); legs with purpose #ownerAccumulated, #ownerMintTreasury, #feePending or #feeLegacy, amount, destination, memoText (TTTI-ST-<n>), status and block.",
	"- listAdminHistory(filter, token, offset, limit) -> HistoryResult (admin) — one history, newest first, with total for pagination. filter: #all, #revenueSent, #destination, #swap, #liquidity, #mintDeposit, #redemption, #refund; token: optional ICP, TTTI-T, ckBTC, ckUSDC or ckUSDT. Row: id, kind, token, amount, status, detail, counterparty, memo, block, timestamp. Errors: #notAdmin.",
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
	"- listTransfersToReviewFiltered({ kinds; token }) : [TransferReview] (admin) — the same list restricted to the given kinds (empty = all) and optional token.",
	"",
	"## Auction (sealed bids, PTM-6a)",
	"- getAuctionView() : AuctionView (public) — open, auctionId, lotSizeE8s, pendingLotE8s, openedAt, closesAt, reservePriceUsdE8 (effective reserve per TTTI-T: the highest of reserveFloorUsdE8 = 10 000 USD, dailyAverageUsdE8 = 24 h average of the consolidated TTTI-T price and consolidatedPriceUsdE8 = current consolidated TTTI-T price; a component that is unavailable is absent and left out, so the reserve is never below 10 000 USD; the reserve stays at 10 000 USD, no offer below it passes and nothing is reissued below 10 000 USD, the lot stays in the contract), reserveBinding (#floor | #dailyAverage | #consolidated: the component that sets the reserve), reservePrices per pay token (reserve at the current rate; price absent when the rate is absent or expired), minQuantityE8s (100 000 = 0.001 TTTI-T), maxBidsPerPerson (10), guaranteeRecoverable. PTM-9b adds blockSale (the open lot is below minQuantityE8s and is sold in block), lotRemainderE8s (part of the open lot that is the end-of-mint remainder) and pendingRemainderE8s (remainder not yet committed to a lot, included in pendingLotE8s).",
	"- getMyAuctionBids() : [Bid] — only the caller's own offers; offers of other principals are never returned.",
	"- quoteAuctionDeposit(token, priceB, quantityE8s) : Result<Nat, BidError> — required deposit = ceil(2 x priceB x quantityE8s / (10^8 x 0.99)) in the token's base units; #invalidPrice for a zero price, #priceBelowMinimum { minimumUsdE8; bidUsdE8 } under the minimum price of 10 000 USD per TTTI-T at the current rate, #quantityBelowMinimum under the minimum, #wholeLotRequired { lotSizeE8s } on a block sale when the quantity is not the whole lot.",
	"- placeAuctionBid(token, quantityE8s, priceB, depositAmount) : Result<Bid, BidError> — pulls the deposit with icrc2_transfer_from (ICRC-2 approval first); errors #noOpenAuction, #quantityBelowMinimum, #wholeLotRequired { lotSizeE8s } (block sale: a partial bid is refused), #invalidPrice, #priceBelowMinimum { minimumUsdE8; bidUsdE8 } (price under 10 000 USD per TTTI-T at the current rate), #tooManyBids (10), #depositBelowLedgerFee { fee; deposited } (the deposit must cover at least the ledger fee), #depositBelowRequired. Offers are firm: no withdrawal or change.",
	"- openAuction() : Result<Auction, OpenAuctionError> — opens a 24 hour auction on the pending lot; #alreadyOpen, #emptyLot, #paused.",
	"",
	"## End of the mint, block sale and transfer fees (PTM-9b)",
	"- Transfer fees are paid to the creator (CreatorTokenView.transferFee, source #transferFee). They are never counted in the TTTI-T available at mint: mintableRemaining is fresh minting up to the cap only, and available = mintableRemaining (collected fees are never delivered by a purchase).",
	"- getSaleStatus() : SaleStatus adds mintEnded (true when mintableRemaining is below minPurchase, the minimum of one mint) and remainderE8s (mintableRemaining while mintEnded, else 0). Once the mint is over, mintLiquidity and quoteLiquidityMint return #mintEnded.",
	"- The end-of-mint remainder joins the first auction lot (AuctionView.pendingRemainderE8s, then lotRemainderE8s and Auction.remainderE8s) and is minted only at the settlement of the winner for the part it is served (BidSettlement.mintedE8s, SettleCoreResult.mintedE8s), pooled with the winner's mass. A part nobody is served for, or a failed settlement, goes back to the remainder of the next lot.",
	"- Block sale: a lot below the minimum of one bid (minQuantityE8s) is sold whole (AuctionView.blockSale, Auction.blockSale, ClosedAuctionView.blockSale). Each bid is a price per TTTI-T for the whole lot (quantityE8s = lotSizeE8s); a partial bid returns #wholeLotRequired { lotSizeE8s }. The best price at or above the reserve wins the entire lot at its own price; below the reserve there is no sale and the lot goes to the next lot. The winner is pooled as in any other settlement.",
	"- ClosedAuctionView adds blockSale and remainderE8s.",
	"",
	"## Auction closing (PTM-6b)",
	"- getAuctionView() also returns closingPending (true when the closing time has passed and closing waits for a valid rate).",
	"- Closing: the reserve is taken at closing as the highest of 10 000 USD, the 24 h average of the consolidated TTTI-T price and the current consolidated TTTI-T price. Without a valid oracle rate closing waits (closingPending). Offers are converted to USD at the closing rates and offers below the reserve are discarded (#discardedBelowReserve). The others are sorted by price, then volume (quantity x price), then age, and served at their own price until the lot is used up. The last offer may be served in part (#partiallyServed) when at least the minimum quantity remains; a remainder below the minimum quantity is carried over. Offers that are not reached are #notServed. The unsold lot goes to the next lot (status #fullySold | #partiallySold | #unsold).",
	"- Returns: unserved offers and unserved parts are credited to the bidder's DEX internal balance; the deposits of the served quantities stay pending settlement until the winners are settled.",
	"- getClosedAuctions() : [ClosedAuctionView] (public query, newest first) — id, openedAt, closesAt, closedAt, lotSizeE8s, reserve (floorUsdE8, dailyAverageUsdE8, consolidatedUsdE8, reserveUsdE8, binding), rates [{ token; usdE8 }], bidCount, servedE8s, carriedOverE8s, status.",
	"- getAuctionResult(auctionId) : ?AuctionResultView (public query) — { auction; bids : [ClosedBidView] }; null while the auction is open. After closing every offer is published: bidder, token, quantityE8s, priceB, requiredDeposit, deposited, createdAt, outcome, servedE8s, pricePaidB, servedDeposit, returned. Before closing offers of other principals stay hidden.",
	"- getMyWithdrawable() : [MyBalance] — the caller's balance per token: withdrawable (returned to the balance) and pendingSettlement (awaiting settlement).",
	"",
	"## Auction settlement of winners (PTM-6c)",
	"- Unserved offers, unserved parts and deposits of discarded offers are credited to the bidder's DEX internal balance at closing and can be taken out with withdrawFromDex (the Recover button). The deposit of each served offer stays pending settlement (pendingSettlement in getMyWithdrawable) until its settlement.",
	"- settleAuctionWinners(auctionId) : Result<SettleReport, SettleError> — settles every pending winner of a closed auction, one by one; a failure of one winner never affects the others. SettleReport { auctionId; attempted; settled; failed; settledE8s; carriedE8s; remaining }. Errors #unknownAuction, #nothingToSettle, #inProgress, #paused.",
	"- For a served quantity q at price B: 2 x B x q / 0.99 is taken from the deposit (takenAmount); the creator share is 1 % of the amount paid after the cycles reserve (creatorShare), and the rest forms the minter's position and guarantee: a position of B x q holding q TTTI-T is created (positionAmount, positionId) and a guarantee of B per TTTI-T is set in the paid token (guaranteeAmount); the deposit surplus is credited to the DEX internal balance (surplusReturned).",
	"- Failed settlement for one winner: no position and no guarantee, the whole deposit is credited to that winner's DEX balance (withdrawable with withdrawFromDex), and the quantity q is carried to the next lot (carriedE8s, failureReason). Other winners are unaffected.",
	"- auctionSettleCore(args : SettleCoreArgs) : SettleCoreResult — isolated core of one settlement (reserved to the canister itself): { takenAmount; creatorShare; positionAmount; guaranteeAmount; positionId; shares }. A refusal rolls the whole message back.",
	"- SettlementStatus of a bid: #notRequired (not served), #pending, #settled, #failed. BidSettlement { auctionId; bidId; bidder; token; status; settledE8s; takenAmount; creatorShare; positionAmount; guaranteeAmount; surplusReturned; carriedE8s; positionId?; failureReason?; attemptedAt?; settledAt? }.",
	"- getClosedAuctions() returns [ClosedAuctionView] (ClosedAuction plus settlement : AuctionSettlementSummary { pendingCount; settledCount; failedCount; settledE8s; failedCarriedE8s }); getAuctionResult(auctionId) returns ?AuctionResultView { auction : ClosedAuctionView; bids : [ClosedBidView] } where each ClosedBidView is a ClosedBid plus settlement : BidSettlement.",
	"- Mock-only URL switches: ?auction=closing closes the open auction after 20 s; ?auction=pending leaves it past its closing time without a valid rate; ?auction=settlefail fails the settlement of the first winner of the next closing; ?auction=settlepending keeps settlements pending. Otherwise settlement runs 30 s after closing."
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
var DEX_TTTI_MIN_LOCKED = 10000n;
var DEX_REQUEST_DEPOSIT = 50000n;
/** No first-deposit minimum: the multiplier is 0 and firstDepositMinimum is empty. */
var DEX_FIRST_DEPOSIT_MULTIPLIER = 0n;
var DEX_BADGE_NS = 30n * 24n * HOUR_NS;
var DEX_COOLDOWN_NS = 7n * 24n * HOUR_NS;
var DEX_MAX_PENDING = 2n;
var DEX_MESSAGE_MAX = 500n;
var DEX_REASON_MAX = 300n;
var DEX_PROTOCOL_STATEMENT = "The protocol never places a price-linked order. Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price. No reward is created: everything paid out was first paid by someone (minters, traders, transfers), and anyone can verify it. TTTI-T generates nothing by itself; swap fees pay the liquidity provided, and only the fees actually paid over the past 30 days are shown. No text here promises or aims at a price rise.";
var DEX_LOCKED_SHARES_STATEMENT = "The minimum locked shares √(A×B) belong to the contract forever.";
var DEX_APPROVAL_STATEMENT = "Approval of a pair is not a recommendation.";
var DEX_USD_RATE_SCALE = 100000000n;
/** Swap opening threshold: 10 USD of TTTI-T at the pool price (TTTI-T pairs) or 10 USD of depth (utility pairs); swaps only. */
var DEX_SWAP_THRESHOLD_USD_E8 = 10n * DEX_USD_RATE_SCALE;
/** Gauge target and legacy launch field: the same 10 USD swap threshold (no first-deposit minimum). */
var DEX_LAUNCH_MIN_TOTAL_USD_E8 = DEX_SWAP_THRESHOLD_USD_E8;
/** Market price of one TTTI-T used only by the simulated ICPSwap sources; pool depth never uses it. */
var DEX_TTTI_T_USD_E8 = 10000n * DEX_USD_RATE_SCALE;
var DEX_LAUNCH_DEPTH_STATEMENT = "Swaps open when a TTTI-T pair holds 10 USD of TTTI-T at the pool price (the USD value of its counterpart side at the hourly rate), or when a utility pair reaches 10 USD of depth (both sides at the hourly rates), and stay open while that measure remains at or above 10 USD. This threshold applies only to swaps, never to pool creation, deposits, liquidity, buying or minting; the mint minimum is 1 USD (about 0.0001 TTTI-T). The first deposit of an empty pool has no minimum. Adding liquidity is suspended while a pair removal is announced; voluntary withdrawals stay allowed, subject to position locks.";
var DEX_DEFAULT_SLIPPAGE_BPS = 50n;
var DEX_REFERENCE_TOLERANCE_BPS = 200n;
var DEX_REMOVAL_NOTICE_NS = 5n * 24n * HOUR_NS;
var DEX_FEE_BPS = {
	[FeeTier.bps5]: 5n,
	[FeeTier.bps30]: 30n,
	[FeeTier.bps100]: 100n
};
var DEX_MIN_LOCK_NS = 91n * 24n * HOUR_NS;
var DEX_MAX_LOCK_NS = 157766400000000000n;
/** One third of the weight of each new commitment is relayed to the committed positions of the pool. */
var DEX_RELAY_DIVISOR = 3n;
/** Half of the LP fee of each swap is set aside for the locked positions. */
var DEX_LOCKED_FEE_SHARE_PERCENT = 50n;
var DEX_SWAP_DEADLINE_MAX_NS = 5n * 60n * 1000000000n;
var DEX_LP_FEE_SHARE_PERCENT = SWAP_FEE_LP_PERCENT;
/** 30 % of each swap fee becomes permanent liquidity in the same pool. */
var DEX_PROTOCOL_FEE_SHARE_PERCENT = SWAP_FEE_PERMANENT_PERCENT;
var DEX_MAX_SLIPPAGE_BPS = 10000n;
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
/** The first deposit of an empty pool has no minimum: both sides are null. */
var DEX_NO_FIRST_DEPOSIT_MINIMUM = {};
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
		firstDepositMinimum: { ...DEX_NO_FIRST_DEPOSIT_MINIMUM },
		thresholdBasis: kind === PoolKind.tttiPair ? ThresholdBasis.tttiSideAtPoolPrice : ThresholdBasis.sumOfSides,
		thresholdMeasuredUsdE8: 0n,
		minimumsSet: kind === PoolKind.tttiPair || !!request?.minimums,
		lockedSharesStatement: DEX_LOCKED_SHARES_STATEMENT,
		launchMinimumTotalUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
		swapThresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8,
		guaranteedDepth: {
			lockedPositionShares: 0n,
			permanentShares: 0n,
			amount0: 0n,
			amount1: 0n,
			depth: {
				usdE8: 0n,
				basis: kind === PoolKind.tttiPair ? DepthBasis.twiceNonTttiSide : DepthBasis.sumOfSides,
				missingRate: {
					token0: false,
					token1: false
				}
			}
		},
		depth: {
			usdE8: 0n,
			basis: kind === PoolKind.tttiPair ? DepthBasis.twiceNonTttiSide : DepthBasis.sumOfSides,
			missingRate: {
				token0: false,
				token1: false
			}
		},
		removal: {
			__kind__: "none",
			none: null
		},
		swapState: {
			open: false,
			reason: {
				__kind__: "belowThreshold",
				belowThreshold: {
					depthUsdE8: 0n,
					thresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8
				}
			}
		},
		newPairBadgeActive: false,
		acceptsSwaps: false,
		acceptsDeposits: kind === PoolKind.tttiPair || !!request?.minimums,
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
/** Persists the opening state, then returns the view with fresh depth, gauge and swap state. */
var dexPoolOut = (pool) => {
	dexProcessRemovals();
	dexRefreshOpening(pool);
	const swapState = dexSwapState(pool);
	const removal = pool.removal.__kind__;
	const spread = dexSpreadOf(pool);
	return {
		...pool,
		...spread ? { spread } : {},
		gauge: dexGauge(pool),
		depth: dexDepthAt(pool),
		thresholdBasis: pool.kind === PoolKind.tttiPair ? ThresholdBasis.tttiSideAtPoolPrice : ThresholdBasis.sumOfSides,
		thresholdMeasuredUsdE8: dexThresholdMeasure(pool),
		guaranteedDepth: dexGuaranteedDepth(pool),
		swapThresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8,
		swapState,
		acceptsSwaps: swapState.open,
		acceptsDeposits: pool.status !== PoolStatus.removed && pool.minimumsSet && removal !== "announced" && removal !== "executing",
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
var DEX_REMOVAL_REASON_MAX = 280n;
/** Announces the removal of a pair: effective after 5 days, swaps and additions suspended. */
function mockRemovePair(poolId, reason) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	const pool = mockPools.find((p) => p.id === poolId);
	if (!pool) return fail({
		__kind__: "poolNotFound",
		poolNotFound: null
	});
	dexProcessRemovals();
	if (pool.status === PoolStatus.removed || pool.removal.__kind__ === "completed") return fail({
		__kind__: "alreadyRemoved",
		alreadyRemoved: null
	});
	if (pool.removal.__kind__ === "announced") return fail({
		__kind__: "alreadyAnnounced",
		alreadyAnnounced: { effectiveAt: pool.removal.announced.effectiveAt }
	});
	if (pool.removal.__kind__ === "executing") return fail({
		__kind__: "alreadyAnnounced",
		alreadyAnnounced: { effectiveAt: pool.removal.executing.effectiveAt }
	});
	const trimmed = reason.trim();
	if (trimmed.length === 0) return fail({
		__kind__: "reasonEmpty",
		reasonEmpty: null
	});
	if (BigInt(trimmed.length) > DEX_REMOVAL_REASON_MAX) return fail({
		__kind__: "reasonTooLong",
		reasonTooLong: { maximumChars: DEX_REMOVAL_REASON_MAX }
	});
	const announcedAt = nowNs();
	pool.removal = {
		__kind__: "announced",
		announced: {
			reason: trimmed,
			announcedAt,
			effectiveAt: announcedAt + DEX_REMOVAL_NOTICE_NS
		}
	};
	return {
		__kind__: "ok",
		ok: dexPoolOut(pool)
	};
}
/** Admin only: cancels an announced removal before its effective date. */
function mockCancelPairRemoval(poolId) {
	const pool = mockPools.find((p) => p.id === poolId);
	if (!pool) return {
		__kind__: "err",
		err: CancelRemovalError.poolNotFound
	};
	dexProcessRemovals();
	const removal = pool.removal;
	if (removal.__kind__ === "none") return {
		__kind__: "err",
		err: CancelRemovalError.noAnnouncement
	};
	if (removal.__kind__ === "cancelled") return {
		__kind__: "err",
		err: CancelRemovalError.alreadyCancelled
	};
	if (removal.__kind__ === "executing") return {
		__kind__: "err",
		err: CancelRemovalError.alreadyExecuting
	};
	if (removal.__kind__ === "completed") return {
		__kind__: "err",
		err: CancelRemovalError.alreadyCompleted
	};
	pool.removal = {
		__kind__: "cancelled",
		cancelled: {
			...removal.announced,
			cancelledAt: nowNs()
		}
	};
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
	pool.firstDepositMinimum = { ...DEX_NO_FIRST_DEPOSIT_MINIMUM };
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
		tttiTUsdE8: 0n,
		rateValidForNs: HOUR_NS,
		rateGraceNs: 5n * 60n * 1000000000n,
		launchDepthStatement: DEX_LAUNCH_DEPTH_STATEMENT,
		minLockNs: DEX_MIN_LOCK_NS,
		maxLockNs: DEX_MAX_LOCK_NS,
		swapDeadlineMaxNs: DEX_SWAP_DEADLINE_MAX_NS,
		lpFeeSharePercent: DEX_LP_FEE_SHARE_PERCENT,
		protocolFeeSharePercent: DEX_PROTOCOL_FEE_SHARE_PERCENT,
		swapThresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8,
		defaultSlippageBps: DEX_DEFAULT_SLIPPAGE_BPS,
		referenceToleranceBps: DEX_REFERENCE_TOLERANCE_BPS,
		removalNoticeNs: DEX_REMOVAL_NOTICE_NS,
		relayDivisor: DEX_RELAY_DIVISOR,
		lockedFeeSharePercent: DEX_LOCKED_FEE_SHARE_PERCENT
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
	accountHistory: [],
	lastAccounts: [],
	openTokens: /* @__PURE__ */ new Set(),
	nextMismatchId: 1n,
	pause: { paused: false },
	alert: void 0,
	nextAlertId: 1n,
	progress: void 0,
	/** Batches read so far by a multi-batch run in progress. */
	active: void 0
};
/** Every fifth simulated reserve check compares no account and raises the visible alert. */
var RESERVE_ALERT_EVERY = 5;
var RESERVE_BATCH_SIZE = 50n;
function reserveProgress(runId, compared, toCompare, at, phase = ReservePhase.finished, batch = 1n, totalBatches = 1n) {
	return {
		runId,
		phase,
		batch,
		totalBatches,
		alertDecided: phase === ReservePhase.finished,
		active: phase === ReservePhase.inProgress,
		startedAt: at,
		lastBatchAt: at,
		batchSize: RESERVE_BATCH_SIZE,
		targetCount: toCompare,
		targetIndex: toCompare,
		accountIndex: toCompare,
		accountsToCompare: toCompare,
		accountsCompared: compared,
		excludedZero: 0n,
		unreadable: 0n
	};
}
/** Every third simulated check (not an alert run) takes several batches before it finishes. */
var RESERVE_MULTI_BATCH_EVERY = 3;
var RESERVE_TOTAL_BATCHES = 3n;
/**
* Daily re-read of the accounts excluded after a sweep to zero. A non-zero
* balance re-includes an account at once, in the check and in the sweep: any new
* DEX operation of a user does the same, and the re-read run of a finished
* reserve check finds one more account to re-include every second run.
*/
var mockExcludedReread = {
	excludedCount: 4n,
	runId: 0n,
	read: 0n,
	reincluded: 0n,
	startedAt: void 0,
	lastBatchAt: void 0,
	lastFinishedAt: void 0
};
var EXCLUDED_REREAD_INTERVAL_NS = 86400000000000n;
/** A new DEX operation of an excluded account includes it again. */
function mockReincludeExcluded() {
	if (mockExcludedReread.excludedCount === 0n) return;
	mockExcludedReread.excludedCount -= 1n;
	mockExcludedReread.reincluded += 1n;
}
/** One daily re-read run, reading every excluded account; one non-zero balance is re-included every second run. */
function mockRunExcludedReread(now) {
	const reread = mockExcludedReread;
	reread.runId += 1n;
	reread.startedAt = now;
	reread.lastBatchAt = now;
	reread.read = reread.excludedCount;
	reread.reincluded = 0n;
	if (reread.runId % 2n === 0n) mockReincludeExcluded();
	reread.lastFinishedAt = now;
}
function mockExcludedRereadProgress() {
	const reread = mockExcludedReread;
	return {
		active: false,
		runId: reread.runId,
		startedAt: reread.startedAt,
		lastBatchAt: reread.lastBatchAt,
		lastFinishedAt: reread.lastFinishedAt,
		nextRunAt: reread.lastFinishedAt === void 0 ? void 0 : reread.lastFinishedAt + EXCLUDED_REREAD_INTERVAL_NS,
		excludedCount: reread.excludedCount,
		read: reread.read,
		reincluded: reread.reincluded,
		unreadable: 0n,
		batchSize: RESERVE_BATCH_SIZE
	};
}
/** Sum of the internal DEX balances (available and reserved) of one token. */
function dexUserBalanceTotal(token) {
	let total = 0n;
	for (const byToken of mockDexBalances.values()) {
		const balance = byToken.get(token);
		if (balance) total += balance.available + balance.reserved;
	}
	return total;
}
/** Sum of the pool reserves of one token. */
function dexPoolReserveTotal(token) {
	const ledgerId = DEX_TOKEN_VIEW[token].ledgerId.toText();
	let total = 0n;
	for (const pool of mockPools) {
		if (pool.token0.ledgerId.toText() === ledgerId) total += pool.reserve0;
		if (pool.token1.ledgerId.toText() === ledgerId) total += pool.reserve1;
	}
	return total;
}
/** Sum of the internal DEX balances (available and reserved) and the pool reserves of one token. */
function dexInternalTotal(token) {
	return dexUserBalanceTotal(token) + dexPoolReserveTotal(token);
}
/**
* Accounts checked besides the DEX holdings, with a simulated balance equal to
* the amount owed: pair-request deposits, the MINT_FEE account and PROTOCOL_FEES.
*/
var RESERVE_EXTRA_ACCOUNTS = [
	{
		kind: AccountKind.requestDeposits,
		token: DexToken.tttiT,
		owed: 5000000n
	},
	{
		kind: AccountKind.requestDeposits,
		token: DexToken.icp,
		owed: 20000000n
	},
	{
		kind: AccountKind.mintFee,
		token: DexToken.icp,
		owed: 3400000n
	},
	{
		kind: AccountKind.protocolFees,
		token: DexToken.icp,
		owed: 1250000n
	}
];
var ACCOUNT_LABELS = {
	[AccountKind.dexHoldings]: "DEX holdings",
	[AccountKind.requestDeposits]: "Pair-request deposits",
	[AccountKind.auctionDeposits]: "Auction deposits",
	[AccountKind.mintFee]: "MINT_FEE",
	[AccountKind.protocolFees]: "PROTOCOL_FEES"
};
var accountLabelOf = (kind, token) => `${ACCOUNT_LABELS[kind]} ${DEX_TOKEN_VIEW[token].symbol}`;
var dexReserveUnresolved = () => BigInt(mockDexReserve.lastCheck?.results.filter((r) => r.status === ReserveStatus.shortfall).length ?? 0);
function dexReserveErr(err) {
	return {
		__kind__: "err",
		err
	};
}
function mockInProgressView(runId, batch) {
	const reserve = mockDexReserve;
	const toCompare = BigInt(DEX_TOKEN_ORDER.length + RESERVE_EXTRA_ACCOUNTS.length);
	const progress = reserveProgress(runId, toCompare * batch / RESERVE_TOTAL_BATCHES, toCompare, nowNs(), ReservePhase.inProgress, batch, RESERVE_TOTAL_BATCHES);
	return {
		checkedAt: nowNs(),
		results: reserve.lastCheck?.results ?? [],
		accounts: reserve.lastAccounts,
		progress,
		lastSuccessAt: reserve.lastSuccessAt,
		error: void 0
	};
}
function mockRunDexReserveCheck() {
	const reserve = mockDexReserve;
	if (reserve.active) {
		reserve.active.batch += 1n;
		if (reserve.active.batch < RESERVE_TOTAL_BATCHES) return {
			__kind__: "ok",
			ok: mockInProgressView(reserve.active.runId, reserve.active.batch)
		};
		reserve.active = void 0;
		return finishDexReserveCheck();
	}
	reserve.runs += 1;
	if (reserve.runs % RESERVE_ALERT_EVERY === 0) {
		const at = nowNs();
		const runId = BigInt(reserve.runs);
		const toCompare = BigInt(DEX_TOKEN_ORDER.length + RESERVE_EXTRA_ACCOUNTS.length);
		const progress = reserveProgress(runId, 0n, toCompare, at);
		reserve.progress = progress;
		reserve.alert = {
			id: reserve.nextAlertId,
			at,
			runId,
			accountsToCompare: toCompare,
			accountsCompared: 0n,
			message: "The reserve check compared 0 accounts. Run it again; this alert does not pause the DEX."
		};
		reserve.nextAlertId += 1n;
		return {
			__kind__: "ok",
			ok: {
				checkedAt: at,
				results: [],
				accounts: [],
				progress,
				lastSuccessAt: reserve.lastSuccessAt,
				error: void 0
			}
		};
	}
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
	if (reserve.runs % RESERVE_MULTI_BATCH_EVERY === 0) {
		reserve.active = {
			runId: BigInt(reserve.runs),
			batch: 1n
		};
		return {
			__kind__: "ok",
			ok: mockInProgressView(reserve.active.runId, 1n)
		};
	}
	return finishDexReserveCheck();
}
/** Compares every account and records the result: the end of a run, whether it took one batch or several. */
function finishDexReserveCheck() {
	const reserve = mockDexReserve;
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
	const accounts = [...results.map((r) => ({
		kind: AccountKind.dexHoldings,
		token: r.token,
		accountLabel: accountLabelOf(AccountKind.dexHoldings, r.token),
		ledgerBalance: r.ledgerTotal,
		owed: r.internalTotal,
		difference: r.difference,
		status: r.status,
		checkedAt: now
	})), ...RESERVE_EXTRA_ACCOUNTS.map((a) => ({
		kind: a.kind,
		token: a.token,
		accountLabel: accountLabelOf(a.kind, a.token),
		ledgerBalance: a.owed,
		owed: a.owed,
		difference: 0n,
		status: ReserveStatus.ok,
		checkedAt: now
	}))];
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
			reserve.accountHistory.push({
				id: reserve.nextMismatchId,
				at: now,
				token: result.token,
				kind: AccountKind.dexHoldings,
				accountLabel: accountLabelOf(AccountKind.dexHoldings, result.token),
				owed: result.internalTotal,
				ledgerBalance: result.ledgerTotal
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
			},
			account: {
				token: result.token,
				kind: AccountKind.dexHoldings,
				accountLabel: accountLabelOf(AccountKind.dexHoldings, result.token)
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
	reserve.lastAccounts = accounts;
	const progress = reserveProgress(BigInt(reserve.runs), BigInt(accounts.length), BigInt(accounts.length), now);
	reserve.progress = progress;
	reserve.alert = void 0;
	mockRunExcludedReread(now);
	return {
		__kind__: "ok",
		ok: {
			...check,
			accounts,
			progress
		}
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
		account: reserve.pause.account,
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
		alert: reserve.alert,
		excludedReread: mockExcludedRereadProgress(),
		progress: reserve.active ? mockInProgressView(reserve.active.runId, reserve.active.batch).progress : reserve.progress ?? reserveProgress(0n, 0n, BigInt(DEX_TOKEN_ORDER.length + RESERVE_EXTRA_ACCOUNTS.length), 0n, ReservePhase.idle, 0n, 0n),
		pause: reserve.pause,
		history: [...reserve.history].reverse(),
		accounts: reserve.lastAccounts,
		accountHistory: [...reserve.accountHistory].reverse()
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
var DEX_CUSTODY_OWNER = principalFrom(7);
function dexCustodyAccount(token) {
	const subaccount = /* @__PURE__ */ new Uint8Array(32);
	subaccount[0] = DEX_TOKEN_ORDER.indexOf(token) + 1;
	return {
		owner: DEX_CUSTODY_OWNER,
		subaccount
	};
}
/** Amount of a token in tenths of a whole unit. */
var tenthsOf = (token, tenths) => tenths * 10n ** BigInt(DEX_TOKEN_VIEW[token].decimals) / 10n;
/** The simulated custody account of ICP holds this much more than the total owed. */
var CUSTODY_SURPLUS_TOKEN = DexToken.icp;
var CUSTODY_SURPLUS_E8S = 30000n;
var mockSweepTransfers = [];
var mockSweepRun = {
	lastRunAt: /* @__PURE__ */ new Map(),
	checkedAt: nowNs() - 2n * HOUR_NS
};
function sweepTransfer(n, token, source, tenths, status) {
	const fee = dexTokenFee(token);
	const ledgerBalance = tenthsOf(token, tenths);
	const recordedAt = nowNs() - (30n - n) * HOUR_NS;
	return {
		n,
		token,
		source,
		from: { owner: HOLDER_2 },
		to: dexCustodyAccount(token),
		ledgerBalance,
		amount: ledgerBalance - fee,
		fee,
		status,
		attempt: 1n,
		sends: 1n,
		memoText: `TTTI-SW-${n}`,
		createdAtTimeNs: recordedAt,
		recordedAt,
		lastError: status.__kind__ === "needsReview" ? "Call rejected: the ledger did not answer (outcome unknown)" : void 0
	};
}
mockSweepTransfers.push(sweepTransfer(1n, DexToken.icp, {
	__kind__: "userDeposit",
	userDeposit: HOLDER_2
}, 12n, {
	__kind__: "completed",
	completed: 9120441n
}), sweepTransfer(2n, DexToken.ckusdc, {
	__kind__: "pool",
	pool: 1n
}, 25n, {
	__kind__: "completed",
	completed: 482113n
}), sweepTransfer(3n, DexToken.ckusdt, {
	__kind__: "userDeposit",
	userDeposit: HOLDER_3
}, 8n, {
	__kind__: "needsReview",
	needsReview: null
}), sweepTransfer(4n, DexToken.ckbtc, {
	__kind__: "userDeposit",
	userDeposit: HOLDER_2
}, 3n, {
	__kind__: "inProgress",
	inProgress: null
}));
for (const token of DEX_TOKEN_ORDER) mockSweepRun.lastRunAt.set(token, nowNs() - 2n * HOUR_NS);
function sweepReviewRow(t) {
	return {
		...reviewEntry(TransferKind.SW, t.n, t.memoText, t.amount, t.to, t.sends, t.lastError ?? ""),
		token: t.token,
		fee: t.fee,
		buyer: t.source.__kind__ === "userDeposit" ? t.source.userDeposit : void 0
	};
}
mockReviews.push(...mockSweepTransfers.filter((t) => t.status.__kind__ === "needsReview").map(sweepReviewRow));
/** Custody ledger balance against the total owed, per token. */
function sweepComparison(token) {
	const userBalances = dexUserBalanceTotal(token);
	const poolReserves = dexPoolReserveTotal(token);
	const poolProtocolFees = token === DexToken.icp ? 120000n : 0n;
	const routerSetAside = 0n;
	const owed = userBalances + poolReserves + poolProtocolFees + routerSetAside;
	const surplus = token === CUSTODY_SURPLUS_TOKEN ? CUSTODY_SURPLUS_E8S : 0n;
	return {
		checkedAt: mockSweepRun.checkedAt,
		custodyLedger: owed + surplus,
		userBalances,
		poolReserves,
		poolProtocolFees,
		routerSetAside,
		owed,
		surplus,
		shortfall: 0n,
		status: surplus > 0n ? Variant_surplus_shortfall_balanced.surplus : Variant_surplus_shortfall_balanced.balanced
	};
}
function mockSweepState() {
	return DEX_TOKEN_ORDER.map((token) => {
		const own = mockSweepTransfers.filter((t) => t.token === token);
		const completed = own.filter((t) => t.status.__kind__ === "completed");
		const pending = BigInt(own.filter((t) => t.status.__kind__ === "inProgress").length);
		const unknownOutcome = BigInt(own.filter((t) => t.status.__kind__ === "needsReview").length);
		return {
			token,
			custodyAccount: dexCustodyAccount(token),
			lastRunAt: mockSweepRun.lastRunAt.get(token),
			legacyAccountsFound: BigInt(own.length),
			accountsWithBalance: BigInt(own.length),
			accountsSkipped: 0n,
			transfersRecorded: BigInt(own.length),
			ledgerSwept: completed.reduce((sum, t) => sum + t.amount, 0n),
			feesPaid: completed.reduce((sum, t) => sum + t.fee, 0n),
			pending,
			unknownOutcome,
			failed: BigInt(own.filter((t) => t.status.__kind__ === "failed").length),
			notes: own.length === 0 ? ["No legacy account holds a balance above the fee."] : [],
			comparison: sweepComparison(token),
			comparisonPending: pending + unknownOutcome > 0n
		};
	});
}
function mockSweepProgress() {
	return {
		runId: BigInt(mockSweepTransfers.length),
		active: false,
		startedAt: mockSweepRun.lastRunAt.get(DexToken.icp),
		lastBatchAt: mockSweepRun.lastRunAt.get(DexToken.icp),
		batchSize: 50n,
		batches: mockSweepTransfers.length === 0 ? 0n : 1n,
		tokenIndex: BigInt(DEX_TOKEN_ORDER.length),
		accountIndex: BigInt(mockSweepTransfers.length),
		tokens: DEX_TOKEN_ORDER.map((token) => {
			const own = mockSweepTransfers.filter((t) => t.token === token);
			return {
				token,
				done: true,
				accountsListed: BigInt(own.length),
				accountsRead: BigInt(own.length),
				withBalance: BigInt(own.length),
				excludedZero: 0n,
				skipped: 0n,
				unreadable: 0n,
				inFlight: BigInt(own.filter((t) => t.status.__kind__ === "inProgress").length)
			};
		})
	};
}
/** Newest-first page; the cursor is the offset of the next item. Size defaults to 50 and is capped at 100. */
function mockPage(newestFirst, cursor, limit) {
	const size = limit <= 0n ? 50 : Number(limit > 100n ? 100n : limit);
	const start = cursor === null || cursor === void 0 ? 0 : Number(cursor);
	const end = start + size;
	return {
		items: newestFirst.slice(start, end),
		...end < newestFirst.length ? { nextCursor: BigInt(end) } : {}
	};
}
/**
* Newest-first page of the transfers of `owner`. The cursor is the transfer
* number `n` (global across deposits and withdrawals): the page holds the
* transfers with n strictly below the cursor, and nextCursor is the n of its
* last transfer while older ones remain.
*/
function mockDexTransfersPage(owner, cursor, limit) {
	const page = mockPage(mockDexTransfers.filter((t) => t.owner.toText() === owner.toText() && (cursor === null || cursor === void 0 || t.n < cursor)).sort((a, b) => a.n === b.n ? 0 : a.n > b.n ? -1 : 1), null, limit);
	const last = page.items[page.items.length - 1];
	return {
		items: page.items,
		...page.nextCursor !== void 0 && last ? { nextCursor: last.n } : {}
	};
}
function mockRunDexSweep() {
	const now = nowNs();
	const n = BigInt(mockSweepTransfers.length + 1);
	mockSweepTransfers.push(sweepTransfer(n, DexToken.icp, {
		__kind__: "userDeposit",
		userDeposit: HOLDER_3
	}, 5n, {
		__kind__: "completed",
		completed: 9200000n + n
	}));
	mockSweepTransfers[mockSweepTransfers.length - 1].recordedAt = now;
	for (const token of DEX_TOKEN_ORDER) mockSweepRun.lastRunAt.set(token, now);
	mockSweepRun.checkedAt = now;
	return {
		__kind__: "ok",
		ok: mockSweepState()
	};
}
function mockResendDexSweepTransfers() {
	for (const t of mockSweepTransfers) if (t.status.__kind__ === "inProgress") {
		t.status = {
			__kind__: "completed",
			completed: 9300000n + t.n
		};
		t.sends += 1n;
	}
	return {
		__kind__: "ok",
		ok: mockSweepState()
	};
}
/** Arrived / Not arrived on an SW review. */
function sweepReviewed(n, block) {
	const transfer = mockSweepTransfers.find((t) => t.n === n);
	if (!transfer) return;
	transfer.status = block === null ? {
		__kind__: "failed",
		failed: "Not arrived (admin verification)"
	} : {
		__kind__: "completed",
		completed: block
	};
}
/** One CS row per token whose last comparison shows a custody surplus; credited to no one. */
function custodySurplusReviews() {
	return mockSweepState().flatMap((state) => {
		const surplus = state.comparison?.surplus ?? 0n;
		if (!state.comparison || surplus === 0n) return [];
		const symbol = DEX_TOKEN_VIEW[state.token].symbol;
		return [{
			kind: TransferKind.CS,
			purchaseId: BigInt(DEX_TOKEN_ORDER.indexOf(state.token)),
			token: state.token,
			createdAtTimeNs: state.comparison.checkedAt,
			amount: surplus,
			destination: {
				owner: state.custodyAccount.owner,
				subaccount: state.custodyAccount.subaccount
			},
			sends: 0n,
			lastError: `Custody surplus: the ${symbol} custody account holds ${surplus.toString()} base units more than the total owed. Credited to no one; no automatic action.`
		}];
	});
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
	mockReincludeExcluded();
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
	mockAuctionWithdrawn(CALLER, token, amount);
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
/** Protocol-owned (permanent) shares per pool id; counted in the guaranteed depth. */
var dexProtocolShares = /* @__PURE__ */ new Map();
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
/** Mock-only simulation switch: `?dexRef=rate`, `?dexRef=nosource` or `?dexRef=drift` in the page URL. */
function dexScenario() {
	if (typeof window === "undefined") return "";
	try {
		return new URLSearchParams(window.location.search).get("dexRef") ?? "";
	} catch {
		return "";
	}
}
var dexRatesValid = () => mockPrice().usable && dexScenario() !== "rate";
/**
* Hourly USD rate of a pay token while usable. TTTI-T has no fixed value: its
* price is the pool price (depth) or the reference price (first deposit).
*/
function dexUsdRate(view) {
	const token = dexTokenOfView(view);
	if (token === void 0 || token === DexToken.tttiT) return void 0;
	return dexRatesValid() ? MOCK_PAY_USD_E8[PAY_OF_DEX[token]] : void 0;
}
/** Pool depth at the pool price: twice the non-TTTI-T side for TTTI-T pairs, both sides otherwise. */
function dexDepthAt(pool, reserve0 = pool.reserve0, reserve1 = pool.reserve1) {
	const usdOf = (view, amount, rate) => amount * rate / 10n ** BigInt(view.decimals);
	if (pool.kind === PoolKind.tttiPair) {
		const nonTttiIs0 = !pool.token0.isTttiT;
		const view = nonTttiIs0 ? pool.token0 : pool.token1;
		const reserve = nonTttiIs0 ? reserve0 : reserve1;
		const rate = dexUsdRate(view);
		return {
			basis: DepthBasis.twiceNonTttiSide,
			missingRate: {
				token0: nonTttiIs0 && rate === void 0,
				token1: !nonTttiIs0 && rate === void 0
			},
			...rate !== void 0 ? { usdE8: 2n * usdOf(view, reserve, rate) } : {}
		};
	}
	const rate0 = dexUsdRate(pool.token0);
	const rate1 = dexUsdRate(pool.token1);
	return {
		basis: DepthBasis.sumOfSides,
		missingRate: {
			token0: rate0 === void 0,
			token1: rate1 === void 0
		},
		...rate0 !== void 0 && rate1 !== void 0 ? { usdE8: usdOf(pool.token0, reserve0, rate0) + usdOf(pool.token1, reserve1, rate1) } : {}
	};
}
/**
* Swap-threshold measure: for a TTTI-T pair the counterpart USD at the hourly rate
* (equal to the TTTI-T side at the pool price); for a utility pair the sum of both sides.
*/
function dexThresholdMeasure(pool, reserve0 = pool.reserve0, reserve1 = pool.reserve1) {
	const depth = dexDepthAt(pool, reserve0, reserve1).usdE8;
	if (depth === void 0) return void 0;
	return pool.kind === PoolKind.tttiPair ? depth / 2n : depth;
}
function dexGauge(pool, reserve0 = pool.reserve0, reserve1 = pool.reserve1) {
	const depth = dexDepthAt(pool, reserve0, reserve1);
	const measured = dexThresholdMeasure(pool, reserve0, reserve1);
	const targetUsdE8 = DEX_SWAP_THRESHOLD_USD_E8;
	if (measured === void 0) return {
		targetUsdE8,
		valueAvailable: false,
		missingRate: depth.missingRate
	};
	return {
		currentUsdE8: measured,
		targetUsdE8,
		remainingUsdE8: measured >= targetUsdE8 ? 0n : targetUsdE8 - measured,
		valueAvailable: true,
		missingRate: {
			token0: false,
			token1: false
		}
	};
}
var dexGaugeOpens = (gauge) => gauge.valueAvailable && (gauge.currentUsdE8 ?? 0n) >= gauge.targetUsdE8;
/** Swap state: removal first, then the hourly rates, then the 10 USD depth threshold (dynamic). */
function dexSwapState(pool) {
	const closed = (reason) => ({
		open: false,
		reason
	});
	if (pool.status === PoolStatus.removed || pool.removal.__kind__ === "completed") return closed({
		__kind__: "removed",
		removed: null
	});
	if (pool.removal.__kind__ === "executing") return closed({
		__kind__: "removalExecuting",
		removalExecuting: null
	});
	if (pool.removal.__kind__ === "announced") return closed({
		__kind__: "removalAnnounced",
		removalAnnounced: { effectiveAt: pool.removal.announced.effectiveAt }
	});
	const measured = dexThresholdMeasure(pool);
	if (measured === void 0) return closed({
		__kind__: "rateUnavailable",
		rateUnavailable: null
	});
	if (measured < DEX_SWAP_THRESHOLD_USD_E8) return closed({
		__kind__: "belowThreshold",
		belowThreshold: {
			depthUsdE8: measured,
			thresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8
		}
	});
	return {
		open: true,
		reason: {
			__kind__: "open",
			open: null
		}
	};
}
/** Status follows the depth: #active while the swap threshold is met, #filling below it. */
function dexRefreshOpening(pool) {
	if (pool.status === PoolStatus.removed) return;
	pool.status = dexGaugeOpens(dexGauge(pool)) ? PoolStatus.active : PoolStatus.filling;
	pool.acceptsSwaps = dexSwapState(pool).open;
}
/** Executes due removals, then refreshes the opening state of every pool. */
function dexRefreshAllOpenings() {
	dexProcessRemovals();
	for (const pool of mockPools) dexRefreshOpening(pool);
}
var DEX_SPREAD_THRESHOLD_BPS = 200n;
var DEX_TTTI_UNIT = 10n ** BigInt(8);
/** Pool price of one TTTI-T in USD (usdE8) from the reserves, when both the rate and the reserves exist. */
function dexTttiPoolPriceUsdE8(pool, reserve0 = pool.reserve0, reserve1 = pool.reserve1) {
	if (pool.kind !== PoolKind.tttiPair || pool.status === PoolStatus.removed) return void 0;
	const tttiReserve = pool.token0.isTttiT ? reserve0 : reserve1;
	const depth = dexDepthAt(pool, reserve0, reserve1).usdE8;
	if (tttiReserve === 0n || depth === void 0) return void 0;
	return depth / 2n * DEX_TTTI_UNIT / tttiReserve;
}
var dexCounterSymbol = (pool) => pool.token0.isTttiT ? pool.token1.symbol : pool.token0.symbol;
/** Consolidated price: mean of the open TTTI-T pool prices weighted by their depth. */
function dexConsolidatedPrice(override) {
	const computedAt = nowNs();
	const base = {
		computedAt,
		hourlySamples: 0n,
		dailySamples: 0n,
		sources: []
	};
	if (!dexRatesValid()) return {
		...base,
		price: {
			__kind__: "unavailable",
			unavailable: ConsolidatedUnavailable.noValidRate
		}
	};
	const open = dexScenario() === "nosource" ? [] : mockPools.flatMap((pool) => {
		const replaced = override?.pool === pool ? override : void 0;
		const reserve0 = replaced?.reserve0 ?? pool.reserve0;
		const reserve1 = replaced?.reserve1 ?? pool.reserve1;
		const price = dexTttiPoolPriceUsdE8(pool, reserve0, reserve1);
		const depth = dexDepthAt(pool, reserve0, reserve1).usdE8;
		if (price === void 0 || depth === void 0) return [];
		return (replaced ? (pool.removal.__kind__ === "none" || pool.removal.__kind__ === "cancelled") && (dexThresholdMeasure(pool, reserve0, reserve1) ?? 0n) >= DEX_SWAP_THRESHOLD_USD_E8 : dexSwapState(pool).open) ? [{
			pool,
			price,
			depth
		}] : [];
	});
	const total = open.reduce((sum, o) => sum + o.depth, 0n);
	if (open.length === 0 || total === 0n) return {
		...base,
		price: {
			__kind__: "unavailable",
			unavailable: ConsolidatedUnavailable.noOpenPool
		}
	};
	let assigned = 0n;
	const sources = open.map((o, i) => {
		const weightBps = i === open.length - 1 ? DEX_BPS - assigned : o.depth * DEX_BPS / total;
		assigned += weightBps;
		return {
			poolId: o.pool.id,
			counterSymbol: dexCounterSymbol(o.pool),
			priceUsdE8: o.price,
			depthUsdE8: o.depth,
			weightBps
		};
	});
	const price = open.reduce((sum, o) => sum + o.price * o.depth, 0n) / total;
	return {
		computedAt,
		price: {
			__kind__: "available",
			available: price
		},
		hourlyAverageUsdE8: price * 9990n / DEX_BPS,
		hourlySamples: 12n,
		dailyAverageUsdE8: price * 10015n / DEX_BPS,
		dailySamples: 288n,
		sources
	};
}
/** Consolidated price as carried by a mint quote, with the pool reserves replaced when given. */
function dexConsolidatedMintPrice(override) {
	const { price } = dexConsolidatedPrice(override);
	return price.__kind__ === "available" ? {
		__kind__: "available",
		available: price.available
	} : {
		__kind__: "unavailable",
		unavailable: price.unavailable
	};
}
/** Spread of a TTTI-T pool versus the consolidated price, as carried by the pool view. */
function dexSpreadOf(pool) {
	return dexPoolSpreads().pools.find((spread) => spread.poolId === pool.id);
}
function dexConsolidatedUsdE8() {
	const consolidated = dexConsolidatedPrice();
	return consolidated.price.__kind__ === "available" ? consolidated.price.available : void 0;
}
/** Ratio scale: 10^12 is 100 %. The 50 % target is 5 x 10^11. */
var POOL_CAP_RATIO_SCALE = 1000000000000n;
var POOL_CAP_TARGET_RATIO = 500000000000n;
/** Locked share scale: 10^6 is 100 %; the maximum m is 50 %. */
var POOL_CAP_LOCKED_SCALE = 1000000n;
var POOL_CAP_LOCKED_MAX = 500000n;
/**
* Pools value versus capitalisation: 2 x the counterpart reserve of each TTTI-T pool at the
* simulated oracle rates, over circulating TTTI-T x the instantaneous consolidated price.
*/
function dexPoolCapRatio() {
	const tttiPools = mockPools.filter((pool) => pool.kind === PoolKind.tttiPair && pool.status !== PoolStatus.removed);
	const depths = tttiPools.map((pool) => dexDepthAt(pool).usdE8);
	const poolsValueUsdE8 = tttiPools.length > 0 && depths.every((d) => d !== void 0) ? depths.reduce((sum, d) => sum + (d ?? 0n), 0n) : void 0;
	const consolidated = dexConsolidatedPrice();
	const consolidatedPriceUsdE8 = consolidated.price.__kind__ === "available" ? consolidated.price.available : void 0;
	const circulatingTttiT = mockTotalSupply();
	const capitalisationUsdE8 = consolidatedPriceUsdE8 === void 0 ? void 0 : circulatingTttiT * consolidatedPriceUsdE8 / 100000000n;
	const currentRatio = poolsValueUsdE8 !== void 0 && capitalisationUsdE8 !== void 0 && capitalisationUsdE8 > 0n ? poolsValueUsdE8 * POOL_CAP_RATIO_SCALE / capitalisationUsdE8 : void 0;
	const averageRatio24h = currentRatio === void 0 ? void 0 : currentRatio * 97n / 100n;
	const retainedRatio = currentRatio === void 0 || averageRatio24h === void 0 ? void 0 : currentRatio < averageRatio24h ? currentRatio : averageRatio24h;
	let lockedShare = POOL_CAP_LOCKED_MAX;
	if (retainedRatio !== void 0 && retainedRatio < POOL_CAP_TARGET_RATIO) lockedShare = (POOL_CAP_LOCKED_MAX * (POOL_CAP_TARGET_RATIO - retainedRatio) + POOL_CAP_TARGET_RATIO - 1n) / POOL_CAP_TARGET_RATIO;
	else if (retainedRatio !== void 0) lockedShare = 0n;
	return {
		computedAt: nowNs(),
		poolsValueUsdE8,
		poolCount: BigInt(tttiPools.length),
		circulatingTttiT,
		consolidatedPriceUsdE8,
		capitalisationUsdE8,
		currentRatio,
		averageRatio24h,
		samples: averageRatio24h === void 0 ? 0n : 288n,
		retainedRatio,
		targetRatio: POOL_CAP_TARGET_RATIO,
		lockedShare,
		ratioScale: POOL_CAP_RATIO_SCALE,
		lockedShareScale: POOL_CAP_LOCKED_SCALE
	};
}
function dexPoolSpreads() {
	const consolidated = dexConsolidatedUsdE8();
	const pools = mockPools.filter((pool) => pool.kind === PoolKind.tttiPair && pool.status !== PoolStatus.removed).map((pool) => {
		const base = {
			poolId: pool.id,
			counterSymbol: dexCounterSymbol(pool),
			exceedsThreshold: false
		};
		const price = dexTttiPoolPriceUsdE8(pool);
		if ((pool.token0.isTttiT ? pool.reserve0 : pool.reserve1) === 0n) return {
			...base,
			status: SpreadStatus.empty
		};
		if (price === void 0) return {
			...base,
			status: SpreadStatus.noRate
		};
		if (!dexSwapState(pool).open) return {
			...base,
			status: SpreadStatus.notOpen,
			priceUsdE8: price
		};
		if (consolidated === void 0) return {
			...base,
			status: SpreadStatus.noConsolidatedPrice,
			priceUsdE8: price
		};
		const spreadBps = (price - consolidated) * DEX_BPS / consolidated;
		const exceedsThreshold = (spreadBps < 0n ? -spreadBps : spreadBps) > DEX_SPREAD_THRESHOLD_BPS;
		return {
			...base,
			status: SpreadStatus.ok,
			priceUsdE8: price,
			spreadBps,
			exceedsThreshold
		};
	});
	return {
		...consolidated !== void 0 ? { consolidatedPriceUsdE8: consolidated } : {},
		computedAt: nowNs(),
		thresholdBps: DEX_SPREAD_THRESHOLD_BPS,
		pools
	};
}
/** Pools above the threshold where the caller holds a position. */
function dexMySpreadAlerts() {
	const report = dexPoolSpreads();
	const consolidatedPriceUsdE8 = report.consolidatedPriceUsdE8;
	if (consolidatedPriceUsdE8 === void 0) return [];
	return report.pools.flatMap((spread) => {
		if (!spread.exceedsThreshold || spread.spreadBps === void 0 || spread.priceUsdE8 === void 0) return [];
		const positionIds = mockPositions.filter((p) => p.poolId === spread.poolId && p.shares > 0n && p.owner.toText() === CALLER.toText()).map((p) => p.id);
		if (positionIds.length === 0) return [];
		return [{
			poolId: spread.poolId,
			counterSymbol: spread.counterSymbol,
			spreadBps: spread.spreadBps,
			thresholdBps: report.thresholdBps,
			poolPriceUsdE8: spread.priceUsdE8,
			consolidatedPriceUsdE8,
			computedAt: report.computedAt,
			positionIds
		}];
	});
}
/**
* Demo state: the ckUSDC pool at 10 000 USD and the ckBTC pool at 10 350 USD per TTTI-T (about
* 3 % above the consolidated price), each with a position of the demo user. The other TTTI-T
* pools stay empty and so have no spread.
*/
function dexSeedSpreadDemo() {
	const seeds = [{
		counter: DexToken.ckusdc,
		counterAmount: 5000000000n,
		priceUsdE8: 10000n * DEX_USD_RATE_SCALE
	}, {
		counter: DexToken.ckbtc,
		counterAmount: 1000000n,
		priceUsdE8: 10350n * DEX_USD_RATE_SCALE
	}];
	for (const seed of seeds) {
		const pool = mockPools.find((p) => p.kind === PoolKind.tttiPair && dexTokenOfView(p.token0.isTttiT ? p.token1 : p.token0) === seed.counter);
		if (!pool) continue;
		const view = pool.token0.isTttiT ? pool.token1 : pool.token0;
		const rate = MOCK_PAY_USD_E8[PAY_OF_DEX[seed.counter]];
		const tttiAmount = seed.counterAmount * rate / 10n ** BigInt(view.decimals) * DEX_TTTI_UNIT / seed.priceUsdE8;
		pool.reserve0 = pool.token0.isTttiT ? tttiAmount : seed.counterAmount;
		pool.reserve1 = pool.token0.isTttiT ? seed.counterAmount : tttiAmount;
		const shares = dexIsqrt(pool.reserve0 * pool.reserve1);
		pool.totalShares = shares;
		const now = nowNs() - 24n * HOUR_NS;
		mockPositions.push({
			id: nextPositionId++,
			poolId: pool.id,
			owner: CALLER,
			shares,
			createdAt: now,
			lockStartedAt: now,
			unlockAt: now,
			isCreator: true,
			relayReceivedNs: 0n,
			feesCollected0: 0n,
			feesCollected1: 0n
		});
		dexRefreshOpening(pool);
	}
}
dexSeedSpreadDemo();
var DEX_REF_ICPSWAP_DEPTH_USD_E8 = 4000n * DEX_USD_RATE_SCALE;
/** Simulated ICPSwap TTTI-T pairs: counter token and price offset from the market price, in bps. */
var DEX_REF_ICPSWAP_PAIRS = [
	{
		counter: DexToken.icp,
		offsetBps: 40n,
		label: "ICPSwap TTTI-T/ICP"
	},
	{
		counter: DexToken.ckbtc,
		offsetBps: -30n,
		label: "ICPSwap TTTI-T/ckBTC"
	},
	{
		counter: DexToken.ckusdc,
		offsetBps: 10n,
		label: "ICPSwap TTTI-T/ckUSDC"
	},
	{
		counter: DexToken.ckusdt,
		offsetBps: 0n,
		label: "ICPSwap TTTI-T/ckUSDT"
	}
];
var dexReferenceReadAt = nowNs() - 12n * 60n * 1000000000n;
/** Simulates reading the ICPSwap pairs again; returns the number of readable pairs. */
function dexRefreshReferenceSources() {
	if (dexScenario() === "nosource") return 0;
	dexReferenceReadAt = nowNs();
	return DEX_REF_ICPSWAP_PAIRS.length;
}
function dexReferenceSources(pool) {
	if (dexScenario() === "nosource") return [];
	const raw = DEX_REF_ICPSWAP_PAIRS.map((pair) => ({
		kind: ReferenceSourceKind.icpswap,
		sourceLabel: pair.label,
		counter: pair.counter,
		tttiPriceUsdE8: DEX_TTTI_T_USD_E8 * (DEX_BPS + pair.offsetBps) / DEX_BPS,
		depthUsdE8: DEX_REF_ICPSWAP_DEPTH_USD_E8,
		readAt: dexReferenceReadAt
	}));
	for (const other of mockPools) {
		if (other.id === pool.id || other.kind !== PoolKind.tttiPair || !dexSwapState(other).open) continue;
		const tttiIs0 = other.token0.isTttiT;
		const counter = dexTokenOfView(tttiIs0 ? other.token1 : other.token0);
		const depth = dexDepthAt(other).usdE8;
		const tttiReserve = tttiIs0 ? other.reserve0 : other.reserve1;
		if (counter === void 0 || depth === void 0 || tttiReserve === 0n) continue;
		raw.push({
			kind: ReferenceSourceKind.native,
			sourceLabel: `TTTI pool ${other.token0.symbol}/${other.token1.symbol}`,
			poolId: other.id,
			counter,
			tttiPriceUsdE8: depth / 2n * 10n ** BigInt(8) / tttiReserve,
			depthUsdE8: depth,
			readAt: nowNs()
		});
	}
	const total = raw.reduce((sum, source) => sum + source.depthUsdE8, 0n);
	let assigned = 0n;
	return raw.map((source, index) => {
		const weightBps = index === raw.length - 1 ? DEX_BPS - assigned : source.depthUsdE8 * DEX_BPS / total;
		assigned += weightBps;
		return {
			...source,
			weightBps
		};
	});
}
/** Reference ratio (amount1 per amount0, base units) of a pool with its sources and weights. */
function dexReference(pool) {
	const ratesValid = dexRatesValid();
	const base = {
		poolId: pool.id,
		kind: pool.kind,
		computedAt: nowNs(),
		toleranceBps: DEX_REFERENCE_TOLERANCE_BPS
	};
	const rate0 = dexUsdRate(pool.token0);
	const rate1 = dexUsdRate(pool.token1);
	const d0 = 10n ** BigInt(pool.token0.decimals);
	const d1 = 10n ** BigInt(pool.token1.decimals);
	if (pool.kind !== PoolKind.tttiPair) {
		if (rate0 === void 0 || rate1 === void 0) return {
			...base,
			available: false,
			ratesValid,
			sources: [],
			unavailable: {
				__kind__: "rateUnavailable",
				rateUnavailable: {
					token0: rate0 === void 0,
					token1: rate1 === void 0
				}
			}
		};
		return {
			...base,
			available: true,
			ratesValid,
			sources: [],
			expected: {
				numerator: rate0 * d1,
				denominator: rate1 * d0
			}
		};
	}
	const tttiIs0 = pool.token0.isTttiT;
	const counterRate = tttiIs0 ? rate1 : rate0;
	const sources = dexReferenceSources(pool);
	if (counterRate === void 0) return {
		...base,
		available: false,
		ratesValid,
		sources,
		unavailable: {
			__kind__: "rateUnavailable",
			rateUnavailable: {
				token0: !tttiIs0,
				token1: tttiIs0
			}
		}
	};
	if (sources.length === 0) return {
		...base,
		available: false,
		ratesValid,
		sources,
		unavailable: {
			__kind__: "noReadableSource",
			noReadableSource: null
		}
	};
	const price = sources.reduce((sum, s) => sum + s.tttiPriceUsdE8 * s.weightBps, 0n) / DEX_BPS;
	const tttiUnit = 10n ** BigInt(8);
	const counterUnit = tttiIs0 ? d1 : d0;
	const expected = tttiIs0 ? {
		numerator: price * counterUnit,
		denominator: counterRate * tttiUnit
	} : {
		numerator: counterRate * tttiUnit,
		denominator: price * counterUnit
	};
	return {
		...base,
		available: true,
		ratesValid,
		sources,
		tttiPriceUsdE8: price,
		expected
	};
}
/** First-deposit check of the amounts against the reference ratio. */
function dexReferenceCheck(pool, isFirstDeposit, amount0, amount1) {
	const toleranceBps = DEX_REFERENCE_TOLERANCE_BPS;
	if (!isFirstDeposit) return {
		applicable: false,
		withinBand: true,
		toleranceBps
	};
	const reference = dexReference(pool);
	if (!reference.available || !reference.expected) return {
		applicable: true,
		withinBand: false,
		toleranceBps,
		unavailable: reference.unavailable
	};
	const { numerator, denominator } = reference.expected;
	const expectedAmount1 = numerator * amount0;
	const actualScaled = amount1 * denominator;
	const gap = actualScaled > expectedAmount1 ? actualScaled - expectedAmount1 : expectedAmount1 - actualScaled;
	const deviationBps = expectedAmount1 === 0n ? 0n : gap * DEX_BPS / expectedAmount1;
	return {
		applicable: true,
		withinBand: deviationBps <= toleranceBps,
		expected: reference.expected,
		deviationBps,
		toleranceBps
	};
}
var mockLqPayouts = [];
var nextLqPayoutN = 1n;
/** One simulated payout fails (outcome unknown) in the first executed removal. */
var dexLqFailureUsed = false;
/** Liquidates every position of a pool: pool debited, owner credited, payout sent to the owner wallet. */
function dexLiquidatePool(pool, at) {
	const token0 = dexTokenOfView(pool.token0);
	const token1 = dexTokenOfView(pool.token1);
	const positions = mockPositions.filter((p) => p.poolId === pool.id);
	const payouts = [];
	for (const position of positions) {
		const total = pool.totalShares;
		const amount0 = total > 0n ? position.shares * pool.reserve0 / total : 0n;
		const amount1 = total > 0n ? position.shares * pool.reserve1 / total : 0n;
		pool.reserve0 -= amount0;
		pool.reserve1 -= amount1;
		pool.totalShares -= position.shares;
		for (const [token, amount] of [[token0, amount0], [token1, amount1]]) {
			if (token === void 0 || amount === 0n) continue;
			const balance = dexBalanceOf(position.owner, token);
			balance.available += amount;
			if (amount <= dexTokenFee(token)) continue;
			const n = nextLqPayoutN++;
			payouts.push({
				n,
				poolId: pool.id,
				positionId: position.id,
				owner: position.owner,
				token,
				amount,
				memoText: `TTTI-LQ-${n}`,
				createdAtTimeNs: at,
				review: false
			});
		}
		mockPositions.splice(mockPositions.indexOf(position), 1);
	}
	if (!dexLqFailureUsed && payouts.length > 0) {
		dexLqFailureUsed = true;
		payouts[payouts.length - 1].review = true;
	}
	for (const payout of payouts) {
		const balance = dexBalanceOf(payout.owner, payout.token);
		balance.available -= payout.amount;
		if (payout.review) {
			balance.reserved += payout.amount;
			mockLqPayouts.push(payout);
			mockReviews.push(dexLqReview(payout));
		}
	}
}
function dexLqReview(payout) {
	return {
		kind: TransferKind.LQ,
		purchaseId: payout.n,
		token: payout.token,
		memoText: payout.memoText,
		memoHex: memoHexOf(payout.memoText),
		createdAtTimeNs: payout.createdAtTimeNs,
		amount: payout.amount - dexTokenFee(payout.token),
		fee: dexTokenFee(payout.token),
		destination: { owner: payout.owner },
		sends: 4n,
		lastError: "Call timed out (outcome unknown)",
		buyer: payout.owner
	};
}
/** Arrived: the reserved amount is debited for good. Not arrived: a new attempt is sent later. */
function dexLqArrived(n) {
	const index = mockLqPayouts.findIndex((p) => p.n === n);
	if (index < 0) return;
	const payout = mockLqPayouts[index];
	dexBalanceOf(payout.owner, payout.token).reserved -= payout.amount;
	mockLqPayouts.splice(index, 1);
}
/**
* PTM-9b, finishRemoval of a TTTI-T pair: what the contract still holds in the pool (its locked and
* permanent shares) is reinjected into the least liquid TTTI-T pool as locked shares, with a line in
* the public permanent liquidity log (kind injected). No wallet receives it.
*/
function dexReinjectRemovedReserves(pool, at) {
	if (pool.kind !== PoolKind.tttiPair) return;
	const tttiAmount = pool.token0.isTttiT ? pool.reserve0 : pool.reserve1;
	const counterAmount = pool.token0.isTttiT ? pool.reserve1 : pool.reserve0;
	if (tttiAmount === 0n && counterAmount === 0n) return;
	const targets = mockPools.filter((p) => p.id !== pool.id && p.kind === PoolKind.tttiPair && p.status !== PoolStatus.removed && p.removal.__kind__ !== "announced" && p.removal.__kind__ !== "executing");
	if (targets.length === 0) return;
	const depthOf = (p) => dexDepthAt(p).usdE8 ?? 0n;
	const target = targets.reduce((least, p) => depthOf(p) < depthOf(least) ? p : least);
	const fromView = pool.token0.isTttiT ? pool.token1 : pool.token0;
	const toView = target.token0.isTttiT ? target.token1 : target.token0;
	const fromRate = dexUsdRate(fromView);
	const toRate = dexUsdRate(toView);
	const counterInTarget = fromRate !== void 0 && toRate !== void 0 ? counterAmount * fromRate / 10n ** BigInt(fromView.decimals) * 10n ** BigInt(toView.decimals) / toRate : 0n;
	pool.reserve0 = 0n;
	pool.reserve1 = 0n;
	pool.totalShares = 0n;
	pool.lockedShares = 0n;
	dexProtocolShares.delete(pool.id);
	const heldIndex = mockProtocolLiquidity.findIndex((e) => e.poolId === pool.id);
	if (heldIndex >= 0) mockProtocolLiquidity.splice(heldIndex, 1);
	const shares = target.token0.isTttiT ? lot4AddProtocolLiquidity(target, tttiAmount, counterInTarget, "fees", at) : lot4AddProtocolLiquidity(target, counterInTarget, tttiAmount, "fees", at);
	dexRefreshOpening(target);
	const toToken = dexTokenOfView(toView);
	if (toToken === void 0) return;
	mockPermanentLog.push({
		id: mockPermanentLog.reduce((max, e) => e.id > max ? e.id : max, 0n) + 1n,
		at,
		kind: PermanentKind.injected,
		token: toToken,
		amount: counterInTarget,
		otherToken: DexToken.tttiT,
		otherAmount: tttiAmount,
		route: {
			__kind__: "native",
			native: target.id
		},
		poolId: target.id,
		shares,
		reason: `Reserves held by the contract after the removal of the ${pool.token0.symbol}/${pool.token1.symbol} pair.`
	});
}
/** At the effective date: liquidates every position and sets the pool to removed. */
function dexProcessRemovals() {
	const now = nowNs();
	for (const pool of mockPools) {
		const removal = pool.removal;
		if (removal.__kind__ !== "announced" || removal.announced.effectiveAt > now) continue;
		const info = removal.announced;
		pool.removal = {
			__kind__: "executing",
			executing: {
				...info,
				startedAt: info.effectiveAt
			}
		};
		dexLiquidatePool(pool, info.effectiveAt);
		dexReinjectRemovedReserves(pool, info.effectiveAt);
		const completedAt = dexMin(now, info.effectiveAt + 120000000000n);
		pool.status = PoolStatus.removed;
		pool.removedAt = completedAt;
		pool.acceptsSwaps = false;
		pool.removal = {
			__kind__: "completed",
			completed: {
				...info,
				completedAt
			}
		};
	}
	dexSharingTimer();
}
function dexPositionView(position) {
	const pool = mockPools.find((p) => p.id === position.poolId);
	const total = pool?.totalShares ?? 0n;
	const now = nowNs();
	const remainingNs = position.unlockAt > now ? position.unlockAt - now : 0n;
	const unlocked = remainingNs === 0n;
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
		lockDurationNs: position.unlockAt > position.lockStartedAt ? position.unlockAt - position.lockStartedAt : 0n,
		lockStartedAt: position.lockStartedAt,
		unlockAt: position.unlockAt,
		remainingNs,
		locked: !unlocked,
		relayReceivedNs: position.relayReceivedNs,
		feesCollected0: position.feesCollected0,
		feesCollected1: position.feesCollected1,
		isCreator: position.isCreator,
		unlocked,
		withdrawable: unlocked
	};
}
/** Locked positions plus permanent liquidity: the depth that cannot leave the pool before its term. */
function dexGuaranteedDepth(pool) {
	const now = nowNs();
	const lockedPositionShares = mockPositions.filter((p) => p.poolId === pool.id && p.unlockAt > now).reduce((sum, p) => sum + p.shares, 0n);
	const permanentShares = pool.lockedShares + (dexProtocolShares.get(pool.id) ?? 0n);
	const guaranteed = lockedPositionShares + permanentShares;
	const total = pool.totalShares;
	const amount0 = total > 0n ? guaranteed * pool.reserve0 / total : 0n;
	const amount1 = total > 0n ? guaranteed * pool.reserve1 / total : 0n;
	return {
		lockedPositionShares,
		permanentShares,
		amount0,
		amount1,
		depth: dexDepthAt(pool, amount0, amount1)
	};
}
/**
* Relay of a commitment: one third of its weight (capital x time) shortens the committed
* positions of the pool in proportion to capital x time served. No lock is lengthened;
* a position whose remaining time reaches zero stays in the pool as free liquidity.
*/
function dexRelay(pool, source, weight, now) {
	const relayWeight = weight / DEX_RELAY_DIVISOR;
	const none = {
		weight,
		relayWeight,
		shortenedWeight: 0n,
		positionsShortened: 0n,
		positionsFreed: 0n
	};
	if (relayWeight === 0n) return none;
	const served = mockPositions.filter((p) => p.poolId === pool.id && p !== source && p.unlockAt > now && p.shares > 0n).map((p) => ({
		p,
		basis: p.shares * (now > p.lockStartedAt ? now - p.lockStartedAt : 0n)
	}));
	const totalBasis = served.reduce((sum, x) => sum + x.basis, 0n);
	if (totalBasis === 0n) return none;
	let shortenedWeight = 0n;
	let positionsShortened = 0n;
	let positionsFreed = 0n;
	for (const { p, basis } of served) {
		if (basis === 0n) continue;
		const cut = dexMin(relayWeight * basis / totalBasis / p.shares, p.unlockAt - now);
		if (cut === 0n) continue;
		p.unlockAt -= cut;
		p.relayReceivedNs += cut;
		shortenedWeight += cut * p.shares;
		positionsShortened += 1n;
		if (p.unlockAt <= now) positionsFreed += 1n;
	}
	return {
		weight,
		relayWeight,
		shortenedWeight,
		positionsShortened,
		positionsFreed
	};
}
var DEX_SHARING_DAY_NS = 86400000000000n;
var dexPots = /* @__PURE__ */ new Map();
var dexDayStartOf = (t) => t - t % DEX_SHARING_DAY_NS;
/** Start of the current sharing day; nextSharingAt is one day later. */
var dexSharing = { dayStart: dexDayStartOf(nowNs()) };
function dexPotOf(poolId) {
	let pot = dexPots.get(poolId);
	if (!pot) {
		pot = {
			pending0: 0n,
			pending1: 0n,
			phase: SharingPhase.idle,
			frozen0: 0n,
			frozen1: 0n,
			sharedDayStart: 0n,
			totalProduct: 0n,
			paid0: 0n,
			paid1: 0n
		};
		dexPots.set(poolId, pot);
	}
	return pot;
}
/** Positions locked during a day: capital x sqrt(remaining time / 5 years) taken at max(day start, lock start). */
function dexShareLines(pool, dayStart) {
	const dayEnd = dayStart + DEX_SHARING_DAY_NS;
	const lines = [];
	for (const p of mockPositions) {
		if (p.poolId !== pool.id || p.shares === 0n) continue;
		const from = p.lockStartedAt > dayStart ? p.lockStartedAt : dayStart;
		const to = p.unlockAt < dayEnd ? p.unlockAt : dayEnd;
		if (to <= from) continue;
		const lockedNs = to - from;
		const dayFractionBps = lockedNs * 10000n / DEX_SHARING_DAY_NS;
		const weight = p.shares * dexIsqrt(dexMin(p.unlockAt - from, DEX_MAX_LOCK_NS) * 10n ** 18n / DEX_MAX_LOCK_NS);
		lines.push({
			p,
			weight,
			lockedNs,
			dayFractionBps,
			basis: weight * lockedNs
		});
	}
	return lines;
}
/** Estimated shares of every position locked during the current day of a pool, as if the pot were shared now. */
function dexPoolEstimates(pool) {
	const pot = dexPotOf(pool.id);
	const lines = dexShareLines(pool, dexSharing.dayStart);
	const total = lines.reduce((sum, l) => sum + l.basis, 0n);
	return lines.map((line) => ({
		positionId: line.p.id,
		poolId: pool.id,
		owner: line.p.owner,
		weight: line.weight,
		lockedNs: line.lockedNs,
		dayFractionBps: line.dayFractionBps,
		estimated0: total > 0n ? pot.pending0 * line.basis / total : 0n,
		estimated1: total > 0n ? pot.pending1 * line.basis / total : 0n,
		nextSharingAt: dexSharing.dayStart + DEX_SHARING_DAY_NS
	}));
}
function dexPendingPotView(pool) {
	const pot = dexPotOf(pool.id);
	return {
		poolId: pool.id,
		pending0: pot.pending0,
		pending1: pot.pending1,
		dayStart: dexSharing.dayStart,
		nextSharingAt: dexSharing.dayStart + DEX_SHARING_DAY_NS,
		sharingRunning: pot.phase !== SharingPhase.idle
	};
}
/** One sharing slice of a pool (all its positions fit in one slice): summing pass, then paying pass. */
function dexRunPotSlice(pool) {
	const pot = dexPotOf(pool.id);
	const idle = {
		poolId: pool.id,
		phase: SharingPhase.idle,
		processed: 0n,
		more: false,
		paid0: 0n,
		paid1: 0n
	};
	if (pot.phase === SharingPhase.idle) return idle;
	const lines = dexShareLines(pool, pot.sharedDayStart);
	if (pot.phase === SharingPhase.summing) {
		pot.totalProduct = lines.reduce((sum, l) => sum + l.basis, 0n);
		pot.phase = SharingPhase.paying;
		return {
			...idle,
			phase: SharingPhase.summing,
			processed: BigInt(lines.length),
			more: true
		};
	}
	const token0 = dexTokenOfView(pool.token0);
	const token1 = dexTokenOfView(pool.token1);
	if (pot.totalProduct > 0n && token0 !== void 0 && token1 !== void 0) for (const line of lines) {
		const part0 = pot.frozen0 * line.basis / pot.totalProduct;
		const part1 = pot.frozen1 * line.basis / pot.totalProduct;
		line.p.feesCollected0 += part0;
		line.p.feesCollected1 += part1;
		dexBalanceOf(line.p.owner, token0).available += part0;
		dexBalanceOf(line.p.owner, token1).available += part1;
		pot.paid0 += part0;
		pot.paid1 += part1;
	}
	const report = {
		poolId: pool.id,
		phase: SharingPhase.paying,
		processed: BigInt(lines.length),
		more: false,
		paid0: pot.paid0,
		paid1: pot.paid1
	};
	pot.pending0 += pot.frozen0 - pot.paid0;
	pot.pending1 += pot.frozen1 - pot.paid1;
	pot.frozen0 = 0n;
	pot.frozen1 = 0n;
	pot.paid0 = 0n;
	pot.paid1 = 0n;
	pot.totalProduct = 0n;
	pot.phase = SharingPhase.idle;
	return report;
}
/**
* Day roll, once the day is over: freezes each pool's pending pot and starts its sliced sharing.
* A pool with no position locked during the day moves its pot to the pool reserves.
*/
function dexStartDayRoll() {
	const now = nowNs();
	const nextSharingAt = dexSharing.dayStart + DEX_SHARING_DAY_NS;
	if (now < nextSharingAt) return {
		rolled: false,
		dayStart: dexSharing.dayStart,
		nextSharingAt,
		poolsStarted: 0n
	};
	let poolsStarted = 0n;
	for (const pool of mockPools) {
		const pot = dexPotOf(pool.id);
		while (pot.phase !== SharingPhase.idle) dexRunPotSlice(pool);
		if (pot.pending0 === 0n && pot.pending1 === 0n) continue;
		if (dexShareLines(pool, dexSharing.dayStart).length === 0) {
			pool.reserve0 += pot.pending0;
			pool.reserve1 += pot.pending1;
		} else {
			pot.frozen0 = pot.pending0;
			pot.frozen1 = pot.pending1;
			pot.sharedDayStart = dexSharing.dayStart;
			pot.phase = SharingPhase.summing;
			poolsStarted += 1n;
		}
		pot.pending0 = 0n;
		pot.pending1 = 0n;
	}
	dexSharing.dayStart = dexDayStartOf(now);
	return {
		rolled: true,
		dayStart: dexSharing.dayStart,
		nextSharingAt: dexSharing.dayStart + DEX_SHARING_DAY_NS,
		poolsStarted
	};
}
/** The recurring timer: rolls the day when it is over and runs the pending slices. */
function dexSharingTimer() {
	dexStartDayRoll();
	for (const pool of mockPools) {
		const pot = dexPotOf(pool.id);
		while (pot.phase !== SharingPhase.idle) dexRunPotSlice(pool);
	}
}
/**
* Sets aside the locked half of an LP fee into the pool's pending pot. Returns the amount set
* aside; nothing is set aside without a locked position, and the rest of the fee stays in the reserves.
*/
function dexCreditLockedFees(pool, _tokenIn, inIsToken0, lpFee) {
	const now = nowNs();
	const setAside = lpFee * DEX_LOCKED_FEE_SHARE_PERCENT / 100n;
	const anyLocked = mockPositions.some((p) => p.poolId === pool.id && p.unlockAt > now && p.shares > 0n);
	if (setAside === 0n || !anyLocked) return 0n;
	const pot = dexPotOf(pool.id);
	if (inIsToken0) pot.pending0 += setAside;
	else pot.pending1 += setAside;
	return setAside;
}
function dexPlanAdd(args) {
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	dexProcessRemovals();
	const pool = mockPools.find((p) => p.id === args.poolId);
	if (!pool) return fail({
		__kind__: "poolNotFound",
		poolNotFound: null
	});
	if (pool.status === PoolStatus.removed || pool.removal.__kind__ === "completed") return fail({
		__kind__: "poolRemoved",
		poolRemoved: null
	});
	if (pool.removal.__kind__ === "announced" || pool.removal.__kind__ === "executing") return fail({
		__kind__: "removalAnnounced",
		removalAnnounced: { effectiveAt: pool.removal.__kind__ === "announced" ? pool.removal.announced.effectiveAt : pool.removal.executing.effectiveAt }
	});
	const token0 = dexTokenOfView(pool.token0);
	const token1 = dexTokenOfView(pool.token1);
	if (token0 === void 0 || token1 === void 0) return fail({
		__kind__: "unsupportedToken",
		unsupportedToken: null
	});
	const slippageBps = args.slippageBps ?? DEX_DEFAULT_SLIPPAGE_BPS;
	if (slippageBps > DEX_MAX_SLIPPAGE_BPS) return fail({
		__kind__: "invalidSlippage",
		invalidSlippage: { maximumBps: DEX_MAX_SLIPPAGE_BPS }
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
		const m0 = pool.minimumLocked.token0;
		const m1 = pool.minimumLocked.token1;
		const locked0 = m0 ?? (m1 !== void 0 ? dexCeilDiv(m1 * amount0, amount1) : 0n);
		const locked1 = m1 ?? (m0 !== void 0 ? dexCeilDiv(m0 * amount1, amount0) : 0n);
		const total = dexIsqrt(amount0 * amount1);
		lockedShares = dexMin(dexIsqrt(locked0 * locked1), total / 2n);
		shares = total > lockedShares ? total - lockedShares : 0n;
	} else {
		if (pool.reserve0 === 0n || pool.reserve1 === 0n) return fail({
			__kind__: "zeroShares",
			zeroShares: null
		});
		amount0 = onToken0 ? args.amount : dexCeilDiv(args.amount * pool.reserve0, pool.reserve1);
		amount1 = onToken0 ? dexCeilDiv(args.amount * pool.reserve1, pool.reserve0) : args.amount;
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
				opensPool: pool.status === PoolStatus.filling && dexGaugeOpens(gaugeAfter),
				slippageBps,
				counterSide: onToken0 ? PoolSide.token1 : PoolSide.token0,
				counterAmount: onToken0 ? amount1 : amount0,
				...gaugeAfter.currentUsdE8 !== void 0 ? { depthAfterUsdE8: gaugeAfter.currentUsdE8 } : {},
				referenceCheck: dexReferenceCheck(pool, isFirstDeposit, amount0, amount1)
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
	const fail = (err) => ({
		__kind__: "err",
		err
	});
	const lockDurationNs = args.lockDurationNs ?? 0n;
	if (lockDurationNs > 0n && lockDurationNs < DEX_MIN_LOCK_NS) return fail({
		__kind__: "lockTooShort",
		lockTooShort: { minimumNs: DEX_MIN_LOCK_NS }
	});
	if (lockDurationNs > DEX_MAX_LOCK_NS) return fail({
		__kind__: "lockTooLong",
		lockTooLong: { maximumNs: DEX_MAX_LOCK_NS }
	});
	const drifting = dexScenario() === "drift";
	const target = mockPools.find((p) => p.id === args.poolId);
	if (drifting && target && target.totalShares > 0n && target.reserve1 > 0n) target.reserve1 += target.reserve1 / 50n;
	const plan = dexPlanAdd(args);
	if (plan.__kind__ === "err") return plan;
	const { pool, token0, token1, quote } = plan.ok;
	const onToken0 = args.side === PoolSide.token0;
	const check = quote.referenceCheck;
	if (check.applicable && !check.withinBand) {
		if (check.unavailable) return fail({
			__kind__: "referenceUnavailable",
			referenceUnavailable: check.unavailable
		});
		if (check.expected && check.deviationBps !== void 0) return fail({
			__kind__: "referenceOutOfBand",
			referenceOutOfBand: {
				expected: check.expected,
				deviationBps: check.deviationBps,
				toleranceBps: check.toleranceBps
			}
		});
	}
	if (!quote.isFirstDeposit && args.counterAmount !== void 0) {
		const limit = args.counterAmount * (DEX_BPS + quote.slippageBps) / DEX_BPS;
		if (quote.counterAmount > limit) return fail({
			__kind__: "slippageExceeded",
			slippageExceeded: {
				toleranceBps: quote.slippageBps,
				expectedCounterAmount: args.counterAmount,
				actualCounterAmount: quote.counterAmount
			}
		});
	}
	const total = pool.totalShares;
	const used0 = quote.isFirstDeposit ? quote.amount0 : dexMin(quote.amount0, dexCeilDiv(quote.shares * pool.reserve0, total));
	const used1 = quote.isFirstDeposit ? quote.amount1 : dexMin(quote.amount1, dexCeilDiv(quote.shares * pool.reserve1, total));
	const offered0 = onToken0 || args.counterAmount === void 0 ? quote.amount0 : args.counterAmount;
	const offered1 = !onToken0 || args.counterAmount === void 0 ? quote.amount1 : args.counterAmount;
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
	]]) if (balance.available < required) return fail({
		__kind__: "insufficientBalance",
		insufficientBalance: {
			token,
			available: balance.available,
			required
		}
	});
	balance0.available -= used0;
	balance1.available -= used1;
	pool.reserve0 += used0;
	pool.reserve1 += used1;
	pool.totalShares = quote.totalSharesAfter;
	pool.lockedShares += quote.lockedShares;
	const now = nowNs();
	const position = {
		id: nextPositionId++,
		poolId: pool.id,
		owner,
		shares: quote.shares,
		createdAt: now,
		lockStartedAt: now,
		unlockAt: now + lockDurationNs,
		isCreator: owner.toText() === DEX_CREATOR.toText(),
		relayReceivedNs: 0n,
		feesCollected0: 0n,
		feesCollected1: 0n
	};
	mockPositions.push(position);
	const relay = dexRelay(pool, position, quote.shares * lockDurationNs, now);
	dexRefreshOpening(pool);
	return {
		__kind__: "ok",
		ok: {
			position: dexPositionView(position),
			amount0: used0,
			amount1: used1,
			shares: quote.shares,
			lockedShares: quote.lockedShares,
			surplus0: offered0 > used0 ? offered0 - used0 : 0n,
			surplus1: offered1 > used1 ? offered1 - used1 : 0n,
			pool: dexPoolOut(pool),
			relay
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
	if (nowNs() < position.unlockAt) return fail({
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
	dexRefreshOpening(pool);
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
	dexProcessRemovals();
	const position = mockPositions.find((p) => p.id === positionId);
	if (!position) return fail({
		__kind__: "positionNotFound",
		positionNotFound: null
	});
	if (position.owner.toText() !== CALLER.toText()) return fail({
		__kind__: "notPositionOwner",
		notPositionOwner: null
	});
	const pool = mockPools.find((p) => p.id === position.poolId);
	if (!pool) return fail({
		__kind__: "poolNotFound",
		poolNotFound: null
	});
	const removal = pool.removal;
	if (pool.status === PoolStatus.removed || removal.__kind__ === "completed") return fail({
		__kind__: "poolRemoved",
		poolRemoved: null
	});
	if (removal.__kind__ === "announced" || removal.__kind__ === "executing") return fail({
		__kind__: "removalAnnounced",
		removalAnnounced: { effectiveAt: removal.__kind__ === "announced" ? removal.announced.effectiveAt : removal.executing.effectiveAt }
	});
	const now = nowNs();
	const tooShort = () => fail({
		__kind__: "lockTooShort",
		lockTooShort: { minimumNs: DEX_MIN_LOCK_NS }
	});
	const tooLong = (maximumUnlockAt) => fail({
		__kind__: "lockTooLong",
		lockTooLong: { maximumUnlockAt }
	});
	let added;
	if (position.unlockAt > now) {
		if (newUnlockAt < position.unlockAt) return fail({
			__kind__: "cannotShortenLock",
			cannotShortenLock: { unlockAt: position.unlockAt }
		});
		if (newUnlockAt <= now) return tooShort();
		const remaining = newUnlockAt - now;
		if (remaining < DEX_MIN_LOCK_NS) return tooShort();
		if (remaining > DEX_MAX_LOCK_NS) return tooLong(now + DEX_MAX_LOCK_NS);
		added = newUnlockAt - position.unlockAt;
		position.unlockAt = newUnlockAt;
	} else {
		if (newUnlockAt <= now) return tooShort();
		const duration = newUnlockAt - now;
		if (duration < DEX_MIN_LOCK_NS) return tooShort();
		if (duration > DEX_MAX_LOCK_NS) return tooLong(now + DEX_MAX_LOCK_NS);
		added = duration;
		position.lockStartedAt = now;
		position.relayReceivedNs = 0n;
		position.unlockAt = newUnlockAt;
	}
	const relay = added === 0n ? {
		weight: 0n,
		relayWeight: 0n,
		shortenedWeight: 0n,
		positionsShortened: 0n,
		positionsFreed: 0n
	} : dexRelay(pool, position, position.shares * added, now);
	return {
		__kind__: "ok",
		ok: {
			position: dexPositionView(position),
			relay,
			pool: dexPoolOut(pool)
		}
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
	dexProcessRemovals();
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
	const reason = dexSwapState(pool).reason;
	if (reason.__kind__ === "removed") return fail({
		__kind__: "poolRemoved",
		poolRemoved: null
	});
	if (reason.__kind__ === "removalAnnounced") return fail({
		__kind__: "removalInProgress",
		removalInProgress: { effectiveAt: reason.removalAnnounced.effectiveAt }
	});
	if (reason.__kind__ === "removalExecuting") {
		const removal = pool.removal;
		return fail({
			__kind__: "removalInProgress",
			removalInProgress: { effectiveAt: removal.__kind__ === "executing" ? removal.executing.effectiveAt : nowNs() }
		});
	}
	if (reason.__kind__ === "rateUnavailable") return fail({
		__kind__: "rateUnavailable",
		rateUnavailable: null
	});
	if (reason.__kind__ === "belowThreshold") return fail({
		__kind__: "depthBelowThreshold",
		depthBelowThreshold: reason.belowThreshold
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
	const creditedToLocked = dexCreditLockedFees(pool, tokenIn, inIsToken0, quote.lpFee);
	const toReserve = amountIn - quote.protocolFee - creditedToLocked;
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
		dexBalanceOf(HOLDER_2, DexToken.ckusdt).available += 18000000n;
		mockAddLiquidity(HOLDER_2, {
			poolId: pool.id,
			side: PoolSide.token0,
			amount: 180000n,
			counterAmount: 18000000n,
			lockDurationNs: 730n * 24n * HOUR_NS
		});
	}
}
var LOT4_FIVE_YEARS_NS = DEX_MAX_LOCK_NS;
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
	dexProtocolShares.set(pool.id, (dexProtocolShares.get(pool.id) ?? 0n) + shares);
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
			lockDurationNs: 182n * LOT4_DAY_NS
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
			lockDurationNs: 1095n * LOT4_DAY_NS
		});
		if (result.__kind__ === "ok") {
			dexBalanceOf(CALLER, DexToken.tttiT).available -= 20000n - result.ok.amount0;
			dexBalanceOf(CALLER, DexToken.ckusdt).available -= 2200000n - result.ok.amount1;
		}
	}
}
{
	const pool = lot4Pool(DEX_TTTI, DEX_CKUSDT);
	const tokenOffer0 = 12000n;
	const tokenOffer1 = 3000000n;
	if (pool) for (const lockDurationNs of [DEX_MIN_LOCK_NS, 0n]) {
		dexBalanceOf(CALLER, DexToken.tttiT).available += tokenOffer0;
		dexBalanceOf(CALLER, DexToken.ckusdt).available += tokenOffer1;
		const result = mockAddLiquidity(CALLER, {
			poolId: pool.id,
			side: PoolSide.token0,
			amount: tokenOffer0,
			lockDurationNs
		});
		if (result.__kind__ !== "ok") continue;
		dexBalanceOf(CALLER, DexToken.tttiT).available -= tokenOffer0 - result.ok.amount0;
		dexBalanceOf(CALLER, DexToken.ckusdt).available -= tokenOffer1 - result.ok.amount1;
		const position = mockPositions.find((p) => p.id === result.ok.position.id);
		if (position && lockDurationNs > 0n) {
			const freedAt = nowNs() - 2n * HOUR_NS;
			position.lockStartedAt = freedAt - 200n * LOT4_DAY_NS;
			position.createdAt = position.lockStartedAt;
			position.unlockAt = freedAt;
			position.relayReceivedNs = lockDurationNs - 200n * LOT4_DAY_NS;
		}
	}
}
/** Opens a utility pair at the reference ratio with the given positions (amount0 in base units, lock in days). */
function dexSeedPair(token0, token1, minimums, createdAt, deposits) {
	const pool = dexCreatePool(token0, token1, FeeTier.bps30, createdAt);
	mockSetUtilityPairMinimums(pool.id, minimums);
	const expected = dexReference(pool).expected;
	const view0 = dexTokenOfView(token0);
	const view1 = dexTokenOfView(token1);
	if (!expected || view0 === void 0 || view1 === void 0) return pool;
	for (const deposit of deposits) {
		const amount1 = deposit.amount0 * expected.numerator / expected.denominator;
		dexBalanceOf(deposit.owner, view0).available += deposit.amount0;
		dexBalanceOf(deposit.owner, view1).available += amount1;
		const result = mockAddLiquidity(deposit.owner, {
			poolId: pool.id,
			side: PoolSide.token0,
			amount: deposit.amount0,
			counterAmount: amount1,
			lockDurationNs: deposit.lockDays * LOT4_DAY_NS
		});
		if (result.__kind__ === "ok") {
			const position = mockPositions.find((p) => p.id === result.ok.position.id);
			if (position) {
				position.createdAt = createdAt;
				position.lockStartedAt = createdAt;
				position.unlockAt = createdAt + deposit.lockDays * LOT4_DAY_NS;
			}
		}
	}
	return pool;
}
{
	const now = nowNs();
	const removed = dexSeedPair(DEX_CKBTC, DEX_CKUSDC, {
		token0: 10000n,
		token1: 1000000n
	}, now - 20n * LOT4_DAY_NS, [{
		owner: HOLDER_2,
		amount0: 1000000n,
		lockDays: 0n
	}, {
		owner: HOLDER_3,
		amount0: 500000n,
		lockDays: 730n
	}]);
	removed.removal = {
		__kind__: "announced",
		announced: {
			reason: "No trading activity on this pair for 60 days",
			announcedAt: now - 6n * LOT4_DAY_NS,
			effectiveAt: now - 1n * LOT4_DAY_NS
		}
	};
	dexProcessRemovals();
	const announced = dexSeedPair(DEX_CKBTC, DEX_CKUSDT, {
		token0: 10000n,
		token1: 1000000n
	}, now - 12n * LOT4_DAY_NS, [{
		owner: CALLER,
		amount0: 500000n,
		lockDays: 730n
	}, {
		owner: HOLDER_2,
		amount0: 500000n,
		lockDays: 0n
	}]);
	announced.removal = {
		__kind__: "announced",
		announced: {
			reason: "Replaced by pairs with deeper liquidity",
			announcedAt: now - 2n * LOT4_DAY_NS,
			effectiveAt: now - 2n * LOT4_DAY_NS + DEX_REMOVAL_NOTICE_NS
		}
	};
}
/** Value of a position in ICP (e8s) at the mock rates; 0 when a rate is missing. */
function lot4PositionValueIcp(position, pool) {
	const icpUsd = MOCK_PAY_USD_E8[PayToken.icp];
	const usd = dexDepthAt(pool, position.amount0, position.amount1).usdE8;
	if (usd === void 0 || icpUsd === 0n) return 0n;
	return usd * ICP_DIVISOR / icpUsd;
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
	kind: HistoryKind.redemption,
	token: HistoryToken.tttiT,
	amount: 5000n,
	status: "Completed",
	detail: "Redemption of 0.00005 TTTI-T paid in ICP",
	counterparty: HOLDER_3.toText(),
	memo: "TTTI-GR-1",
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
	dexProcessRemovals();
	return [...mockReviews, ...custodySurplusReviews()].filter((r) => (filter.kinds.length === 0 || filter.kinds.includes(r.kind)) && (filter.token === void 0 || r.token === filter.token));
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
var MINT_MIN_TTTI = 10000n;
var MINT_CAP_TTTI = 100000000n;
var MINT_MAX_DECIMALS = 8;
var mockLiquidityMints = [];
var mockGuarantees = [];
var mockCreatorSetAsides = [];
var nextMintId = 1n;
/**
* Mock-only simulation switch: `?mint=` in the page URL.
* Refused before payment: rate | cap | balance | allowance | slippage.
* Isolated failure (the mint fails as a whole, the payment returns to the payer's
* internal balance, then is withdrawn): swap (swap refused), deposit (pool deposit
* refused), guarantee (insufficient balance for the guarantee), refunding (withdrawal
* in progress, then succeeded on the next read) and refundfailed (withdrawal failed,
* the payment stays in the internal balance).
*/
function mintScenario() {
	if (typeof window === "undefined") return "";
	try {
		return new URLSearchParams(window.location.search).get("mint") ?? "";
	} catch {
		return "";
	}
}
var mintFail = (err) => ({
	__kind__: "err",
	err
});
function mintQuantity(quantity) {
	if (quantity.__kind__ === "baseUnits") return { ok: quantity.baseUnits };
	const text = quantity.decimal.trim().replace(",", ".");
	if (!/^\d+(\.\d*)?$/.test(text)) return mintFail({
		__kind__: "invalidAmount",
		invalidAmount: null
	});
	const [whole, fraction = ""] = text.split(".");
	if (fraction.length > MINT_MAX_DECIMALS) return mintFail({
		__kind__: "tooManyDecimals",
		tooManyDecimals: {
			granularityTtti: 1n,
			minimumTtti: MINT_MIN_TTTI,
			maxDecimals: BigInt(MINT_MAX_DECIMALS),
			given: text
		}
	});
	return { ok: BigInt(whole) * TTTI_DIVISOR + BigInt(fraction.padEnd(MINT_MAX_DECIMALS, "0")) };
}
function mintTttiFromUsd(usdE8) {
	return usdE8 * 99n / 2000000n;
}
/** The TTTI-T / token pool of a payment token, created on first use. */
function mintPool(token) {
	const counter = DEX_TOKEN_VIEW[DEX_OF_PAY[token]];
	return mockPools.find((p) => p.kind === PoolKind.tttiPair && p.status !== PoolStatus.removed && (dexSameLedger(p.token0, counter) || dexSameLedger(p.token1, counter))) ?? dexCreatePool(DEX_TTTI, counter, FeeTier.bps30, nowNs());
}
function mintPoolPrice(token, reserveToken, reserveTtti) {
	if (reserveTtti === 0n || reserveToken === 0n) return {
		reserveToken,
		reserveTtti
	};
	const tokenPerTtti = reserveToken * TTTI_DIVISOR / reserveTtti;
	const decimals = 10n ** BigInt(PAY_TOKENS[token].decimals);
	return {
		reserveToken,
		reserveTtti,
		tokenPerTtti,
		usdPerTtti: reserveToken * MOCK_PAY_USD_E8[token] / decimals * TTTI_DIVISOR / reserveTtti
	};
}
function mintSoldTtti() {
	return mockLiquidityMints.reduce((sum, m) => m.status === MintStatus.completed ? sum + m.tttiAmount : sum, 0n);
}
function mintPlan(token, q) {
	if (!dexRatesValid() || mintScenario() === "rate") return mintFail({
		__kind__: "rateUnavailable",
		rateUnavailable: { token }
	});
	if (state.salesPaused) return mintFail({
		__kind__: "salesPaused",
		salesPaused: null
	});
	const capRemaining = MINT_CAP_TTTI > mintSoldTtti() ? MINT_CAP_TTTI - mintSoldTtti() : 0n;
	if (saleMintEnded() || capRemaining < MINT_MIN_TTTI) return mintFail({
		__kind__: "mintEnded",
		mintEnded: null
	});
	if (q < MINT_MIN_TTTI) return mintFail({
		__kind__: "belowMinimum",
		belowMinimum: {
			granularityTtti: 1n,
			minimumTtti: MINT_MIN_TTTI,
			requestedTtti: q
		}
	});
	const sold = mintSoldTtti();
	if (mintScenario() === "cap" || sold + q > MINT_CAP_TTTI) return mintFail({
		__kind__: "aboveCap",
		aboveCap: {
			returnedToContractTtti: 0n,
			remainingTtti: MINT_CAP_TTTI > sold ? MINT_CAP_TTTI - sold : 0n,
			capTtti: MINT_CAP_TTTI,
			soldTtti: sold,
			requestedTtti: q
		}
	});
	const pool = mintPool(token);
	const tttiIs0 = pool.token0.isTttiT;
	const reserveTtti = tttiIs0 ? pool.reserve0 : pool.reserve1;
	const reserveToken = tttiIs0 ? pool.reserve1 : pool.reserve0;
	const firstDeposit = pool.totalShares === 0n || reserveTtti === 0n || reserveToken === 0n;
	const rate = MOCK_PAY_USD_E8[token];
	const decimals = 10n ** BigInt(PAY_TOKENS[token].decimals);
	const payUsdE8 = dexCeilDiv(q * 2000000n, 99n);
	const payAmount = dexCeilDiv(payUsdE8 * decimals, rate);
	const guaranteeAmount = q * 10000n * decimals / rate;
	const positionTokenAmount = guaranteeAmount;
	const creatorAmount = payAmount * 100n / 10000n;
	const spent = guaranteeAmount + positionTokenAmount + creatorAmount;
	const dustAmount = payAmount > spent ? payAmount - spent : 0n;
	let zap;
	let shares;
	if (firstDeposit) shares = dexIsqrt(positionTokenAmount * q);
	else {
		const needed = q * reserveToken / reserveTtti;
		const amountIn = positionTokenAmount > needed ? (positionTokenAmount - needed) / 2n : 0n;
		if (amountIn > 0n) zap = {
			tokenIn: DEX_OF_PAY[token],
			tokenOut: DexToken.tttiT,
			amountIn,
			amountOut: amountIn * 997n * reserveTtti / (reserveToken * 1000n + amountIn * 997n),
			feeAmount: amountIn * 3n / 1000n
		};
		shares = q * pool.totalShares / reserveTtti;
	}
	const now = nowNs();
	return {
		__kind__: "ok",
		ok: {
			...zap ? { zap } : {},
			rateUsdE8: rate,
			token,
			dustAmount,
			shares,
			payUsdE8,
			ledgerFee: PAY_TOKENS[token].fee,
			firstDeposit,
			payAmount,
			guaranteeAmount,
			priceAfter: mintPoolPrice(token, reserveToken + positionTokenAmount, reserveTtti + q),
			consolidatedPriceBefore: dexConsolidatedMintPrice(),
			consolidatedPriceAfter: dexConsolidatedMintPrice({
				pool,
				reserve0: tttiIs0 ? reserveTtti + q : reserveToken + positionTokenAmount,
				reserve1: tttiIs0 ? reserveToken + positionTokenAmount : reserveTtti + q
			}),
			rateValidUntil: now + HOUR_NS,
			quotedAt: now,
			tttiAmount: q,
			positionTttiAmount: q,
			positionTokenAmount,
			priceBefore: mintPoolPrice(token, reserveToken, reserveTtti),
			creatorAmount,
			poolId: pool.id
		}
	};
}
function mockQuoteLiquidityMint(args) {
	if (args.amount.__kind__ === "usd") return mintPlan(args.token, mintTttiFromUsd(args.amount.usd));
	const parsed = mintQuantity(args.amount.ttti);
	return "ok" in parsed ? mintPlan(args.token, parsed.ok) : parsed;
}
var ISOLATED_FAILURES = /* @__PURE__ */ new Map([
	["swap", {
		step: "swap",
		cause: "Swap refused by the pool.",
		withdrawal: "done"
	}],
	["deposit", {
		step: "deposit",
		cause: "Deposit refused by the pool.",
		withdrawal: "done"
	}],
	["guarantee", {
		step: "guarantee",
		cause: "Insufficient balance for the guarantee.",
		withdrawal: "done"
	}],
	["refunding", {
		step: "deposit",
		cause: "Deposit refused by the pool.",
		withdrawal: "pending"
	}],
	["refundfailed", {
		step: "deposit",
		cause: "Deposit refused by the pool.",
		withdrawal: "failed"
	}]
]);
var MintStepRefused = class extends Error {};
/** Everything a failed isolated mint must leave untouched, plus the payer's internal balance. */
function mintSnapshot(token, pool) {
	const mass = massOf(token);
	return {
		totalSupply: mockTotalSupply(),
		mintableRemaining: mintableRemaining(),
		soldTtti: mintSoldTtti(),
		reserve0: pool.reserve0,
		reserve1: pool.reserve1,
		totalShares: pool.totalShares,
		positions: mockPositions.length,
		guarantees: mockGuarantees.length,
		setAsides: mockCreatorSetAsides.length,
		massTtti: mass?.totalTtti ?? 0n,
		massGuarantee: mass?.totalGuarantee ?? 0n,
		available: dexBalanceOf(CALLER, DEX_OF_PAY[token]).available
	};
}
/**
* Runs the mint steps (swap, pool deposit, guarantee) and, when one is refused,
* puts the pool back exactly as it was: the mint fails as a whole.
*/
function attemptIsolatedMint(pool, quote, failure) {
	const saved = {
		reserve0: pool.reserve0,
		reserve1: pool.reserve1,
		totalShares: pool.totalShares
	};
	const positions = mockPositions.length;
	const tttiIs0 = pool.token0.isTttiT;
	const addReserves = (ttti, token) => {
		if (tttiIs0) {
			pool.reserve0 += ttti;
			pool.reserve1 += token;
		} else {
			pool.reserve1 += ttti;
			pool.reserve0 += token;
		}
	};
	try {
		if (failure.step === "swap") throw new MintStepRefused(failure.cause);
		if (quote.zap) addReserves(-quote.zap.amountOut, quote.zap.amountIn);
		if (failure.step === "deposit") throw new MintStepRefused(failure.cause);
		addReserves(quote.positionTttiAmount, quote.positionTokenAmount);
		pool.totalShares += quote.shares;
		mockPositions.push({
			id: nextPositionId,
			poolId: pool.id,
			owner: CALLER,
			shares: quote.shares,
			createdAt: quote.quotedAt,
			lockStartedAt: quote.quotedAt,
			unlockAt: quote.quotedAt,
			isCreator: false,
			relayReceivedNs: 0n,
			feesCollected0: 0n,
			feesCollected1: 0n
		});
		if (failure.step === "guarantee") throw new MintStepRefused(failure.cause);
	} catch (error) {
		if (!(error instanceof MintStepRefused)) throw error;
		pool.reserve0 = saved.reserve0;
		pool.reserve1 = saved.reserve1;
		pool.totalShares = saved.totalShares;
		mockPositions.length = positions;
	}
}
/** Scenario self-check: a failed isolated mint minted nothing, moved nothing, and the payment is in the payer's balance. */
function assertIsolatedMintFailure(scenario, before, after, payAmount) {
	const broken = (what) => {
		throw new Error(`Mock invariant broken (?mint=${scenario}): ${what}`);
	};
	if (after.totalSupply !== before.totalSupply || after.mintableRemaining !== before.mintableRemaining) broken("TTTI-T was minted (total supply or mintable remaining changed)");
	if (after.soldTtti !== before.soldTtti) broken("TTTI-T was counted as sold");
	if (after.reserve0 !== before.reserve0 || after.reserve1 !== before.reserve1 || after.totalShares !== before.totalShares || after.positions !== before.positions) broken("the pool reserves or positions moved");
	if (after.massTtti !== before.massTtti || after.massGuarantee !== before.massGuarantee || after.guarantees !== before.guarantees || after.setAsides !== before.setAsides) broken("the mass or the guarantee changed");
	if (after.available !== before.available + payAmount) broken("the payment is not in the payer's internal balance");
}
/** A mint refused after payment: nothing is minted, the payment is returned to the payer. */
function mockFailedIsolatedMint(scenario, args, quote, failure, now) {
	const pool = mintPool(args.token);
	const dexToken = DEX_OF_PAY[args.token];
	const before = mintSnapshot(args.token, pool);
	const balance = dexBalanceOf(CALLER, dexToken);
	balance.available += quote.payAmount;
	attemptIsolatedMint(pool, quote, failure);
	assertIsolatedMintFailure(scenario, before, mintSnapshot(args.token, pool), quote.payAmount);
	const mintId = nextMintId++;
	const transfer = dexNewTransfer(DexTransferDirection.withdrawal, CALLER, dexToken, quote.payAmount, now);
	let status;
	let err;
	if (failure.withdrawal === "failed") {
		transfer.status = {
			__kind__: "failed",
			failed: "The ledger refused the withdrawal."
		};
		transfer.lastError = "The ledger refused the withdrawal.";
		status = MintStatus.refundFailed;
		err = {
			__kind__: "depositFailedRefundFailed",
			depositFailedRefundFailed: { mintId }
		};
	} else if (failure.withdrawal === "pending") {
		balance.available -= quote.payAmount;
		balance.reserved += quote.payAmount;
		status = MintStatus.refunding;
		err = {
			__kind__: "depositFailedRefunding",
			depositFailedRefunding: { mintId }
		};
	} else {
		balance.available -= quote.payAmount;
		transfer.status = {
			__kind__: "completed",
			completed: nextDexBlock++
		};
		status = MintStatus.refunded;
		err = {
			__kind__: "depositFailedRefunded",
			depositFailedRefunded: { mintId }
		};
	}
	mockLiquidityMints.push({
		id: mintId,
		status,
		rateUsdE8: quote.rateUsdE8,
		token: args.token,
		owner: CALLER,
		createdAt: now,
		paymentBlock: nextDexBlock++,
		refundWithdrawalN: transfer.n,
		refusalCause: failure.cause,
		payAmount: quote.payAmount,
		tttiAmount: quote.tttiAmount,
		payer: CALLER,
		poolId: pool.id
	});
	return mintFail(err);
}
/** A withdrawal in progress ends on the next read: the payment leaves the internal balance. */
function settleMintRefunds() {
	for (const mint of mockLiquidityMints) {
		if (mint.status !== MintStatus.refunding || mint.refundWithdrawalN === void 0) continue;
		dexMarkArrived(TransferKind.DW, mint.refundWithdrawalN, nextDexBlock++);
		mint.status = MintStatus.refunded;
	}
}
function mockMintLiquidity(args) {
	if (!ackAccepted()) return mintFail({
		__kind__: "acknowledgementRequired",
		acknowledgementRequired: null
	});
	const parsed = mintQuantity(args.quantity);
	if (!("ok" in parsed)) return parsed;
	const slippageBps = args.slippageBps ?? 50n;
	if (slippageBps > DEX_MAX_SLIPPAGE_BPS) return mintFail({
		__kind__: "invalidSlippage",
		invalidSlippage: { maximumBps: DEX_MAX_SLIPPAGE_BPS }
	});
	const now = nowNs();
	if (args.deadline < now) return mintFail({
		__kind__: "deadlineExpired",
		deadlineExpired: {
			now,
			deadline: args.deadline
		}
	});
	const plan = mintPlan(args.token, parsed.ok);
	if (plan.__kind__ === "err") return plan;
	const quote = plan.ok;
	const scenario = mintScenario();
	if (scenario === "balance") return mintFail({
		__kind__: "insufficientBalance",
		insufficientBalance: {
			token: args.token,
			balance: 0n,
			required: quote.payAmount + 2n * quote.ledgerFee
		}
	});
	if (scenario === "allowance") return mintFail({
		__kind__: "insufficientAllowance",
		insufficientAllowance: {
			token: args.token,
			required: quote.payAmount + quote.ledgerFee,
			allowance: 0n
		}
	});
	if (scenario === "slippage") return mintFail({
		__kind__: "slippageExceeded",
		slippageExceeded: { toleranceBps: slippageBps }
	});
	if (args.maxPayAmount < quote.payAmount) return mintFail({
		__kind__: "maxPayExceeded",
		maxPayExceeded: {
			maxPayAmount: args.maxPayAmount,
			payAmount: quote.payAmount
		}
	});
	const isolatedFailure = ISOLATED_FAILURES.get(scenario);
	if (isolatedFailure) return mockFailedIsolatedMint(scenario, args, quote, isolatedFailure, now);
	const pool = mintPool(args.token);
	if (pool.token0.isTttiT) {
		pool.reserve0 += quote.positionTttiAmount;
		pool.reserve1 += quote.positionTokenAmount;
	} else {
		pool.reserve1 += quote.positionTttiAmount;
		pool.reserve0 += quote.positionTokenAmount;
	}
	pool.totalShares += quote.shares;
	const positionId = nextPositionId++;
	mockPositions.push({
		id: positionId,
		poolId: pool.id,
		owner: CALLER,
		shares: quote.shares,
		createdAt: now,
		lockStartedAt: now,
		unlockAt: now,
		isCreator: false,
		relayReceivedNs: 0n,
		feesCollected0: 0n,
		feesCollected1: 0n
	});
	dexRefreshOpening(pool);
	const mintId = nextMintId++;
	const paymentBlock = nextDexBlock++;
	mockLiquidityMints.push({
		id: mintId,
		status: MintStatus.completed,
		rateUsdE8: quote.rateUsdE8,
		token: args.token,
		owner: CALLER,
		createdAt: now,
		paymentBlock,
		positionId,
		payAmount: quote.payAmount,
		tttiAmount: quote.tttiAmount,
		payer: CALLER,
		poolId: pool.id
	});
	mockGuarantees.push({
		token: args.token,
		owner: CALLER,
		createdAt: now,
		mintId,
		amount: quote.guaranteeAmount
	});
	mockCreatorSetAsides.push({
		token: args.token,
		mintId,
		amount: quote.creatorAmount
	});
	mockGuaranteeCredit(args.token, quote.guaranteeAmount);
	return {
		__kind__: "ok",
		ok: {
			...quote.zap ? { zap: quote.zap } : {},
			rateUsdE8: quote.rateUsdE8,
			token: args.token,
			shares: quote.shares,
			owner: CALLER,
			createdAt: now,
			mintId,
			paymentBlock,
			positionId,
			payAmount: quote.payAmount,
			guaranteeAmount: quote.guaranteeAmount,
			priceAfter: quote.priceAfter,
			tttiAmount: quote.tttiAmount,
			positionTttiAmount: quote.positionTttiAmount,
			positionTokenAmount: quote.positionTokenAmount,
			priceBefore: quote.priceBefore,
			creatorAmount: quote.creatorAmount,
			poolId: quote.poolId
		}
	};
}
var mockRedemptions = [];
var mockRedemptionFees = [];
var nextRedemptionId = 1n;
var mockRedeemed = {
	[PayToken.icp]: {
		ttti: 0n,
		guarantee: 0n,
		excess: 0n,
		withdrawn: 0n
	},
	[PayToken.ckbtc]: {
		ttti: 0n,
		guarantee: 0n,
		excess: 0n,
		withdrawn: 0n
	},
	[PayToken.ckusdc]: {
		ttti: 0n,
		guarantee: 0n,
		excess: 0n,
		withdrawn: 0n
	},
	[PayToken.ckusdt]: {
		ttti: 0n,
		guarantee: 0n,
		excess: 0n,
		withdrawn: 0n
	}
};
/** Mass of other minters counted in the public unclaimed total (simulated). */
var OTHER_MASS_COUNT = 3n;
var OTHER_MASS_TTTI = 20000000n;
/** Mock-only simulation switch: `?guarantee=ended|rate|balance|allowance|slippage` in the page URL. */
function guaranteeScenario() {
	if (typeof window === "undefined") return "";
	try {
		return new URLSearchParams(window.location.search).get("guarantee") ?? "";
	} catch {
		return "";
	}
}
var guaranteeMintEnded = () => guaranteeScenario() === "ended" || mintSoldTtti() >= MINT_CAP_TTTI;
var guaranteeRate = (token) => dexRatesValid() && guaranteeScenario() !== "rate" ? MOCK_PAY_USD_E8[token] : void 0;
/**
* PTM-9b: the dedicated internal guarantee account of each token, inside the common custody.
* The mint and the auction settlement credit it; a redemption (or an excess withdrawal) is the only debit.
* It starts at the guarantee of the other minters' masses (ICP).
*/
var mockGuaranteeAccountState;
var mockGuaranteeAccountBalances = () => {
	if (!mockGuaranteeAccountState) mockGuaranteeAccountState = {
		[PayToken.icp]: mockOtherGuarantee(),
		[PayToken.ckbtc]: 0n,
		[PayToken.ckusdc]: 0n,
		[PayToken.ckusdt]: 0n
	};
	return mockGuaranteeAccountState;
};
var mockGuaranteeCredit = (token, amount) => {
	mockGuaranteeAccountBalances()[token] += amount;
};
var mockGuaranteeDebit = (token, amount) => {
	const balances = mockGuaranteeAccountBalances();
	balances[token] = balances[token] > amount ? balances[token] - amount : 0n;
};
/** Guarantee of the other minters' masses, in ICP. */
var mockOtherGuarantee = () => OTHER_MASS_TTTI * 10000n * 10n ** BigInt(PAY_TOKENS[PayToken.icp].decimals) / MOCK_PAY_USD_E8[PayToken.icp];
/** Masses created by settled auction winners (all principals), per payment token. */
var mockAuctionMass = {
	[PayToken.icp]: {
		ttti: 0n,
		guarantee: 0n,
		count: 0n
	},
	[PayToken.ckbtc]: {
		ttti: 0n,
		guarantee: 0n,
		count: 0n
	},
	[PayToken.ckusdc]: {
		ttti: 0n,
		guarantee: 0n,
		count: 0n
	},
	[PayToken.ckusdt]: {
		ttti: 0n,
		guarantee: 0n,
		count: 0n
	}
};
/** A settled winner's guarantee joins the common mass and credits the guarantee account. */
function mockAuctionGuaranteeCredit(token, tttiE8s, guarantee) {
	const mass = mockAuctionMass[token];
	mass.ttti += tttiE8s;
	mass.guarantee += guarantee;
	mass.count += 1n;
	mockGuaranteeCredit(token, guarantee);
}
/** Sum of every guarantee mass (remaining guarantee + excess) of one token, all owners. */
function mockGuaranteeMassTotal(token) {
	return (massOf(token)?.guaranteeValue ?? 0n) + (token === PayToken.icp ? mockOtherGuarantee() : 0n) + mockAuctionMass[token].guarantee;
}
/** Public: per token, the sum of the masses against the balance of the dedicated account. */
function mockGuaranteeAccounts() {
	const balances = mockGuaranteeAccountBalances();
	const entries = [{
		token: DexToken.tttiT,
		massTotal: 0n,
		accountBalance: 0n,
		equal: true
	}];
	for (const token of PAY_TOKEN_ORDER) {
		const massTotal = mockGuaranteeMassTotal(token);
		entries.push({
			token: DEX_OF_PAY[token],
			massTotal,
			accountBalance: balances[token],
			equal: massTotal === balances[token]
		});
	}
	return entries;
}
function massOf(token) {
	const mints = mockLiquidityMints.filter((m) => m.status === MintStatus.completed && m.token === token && m.owner.toText() === CALLER.toText());
	if (mints.length === 0) return void 0;
	const totalTtti = mints.reduce((sum, m) => sum + m.tttiAmount, 0n);
	const totalGuarantee = mockGuarantees.filter((g) => g.token === token && g.owner.toText() === CALLER.toText()).reduce((sum, g) => sum + g.amount, 0n);
	const done = mockRedeemed[token];
	const excess = done.excess - done.withdrawn;
	const remainingGuarantee = totalGuarantee - done.guarantee;
	const guaranteeValue = remainingGuarantee + excess;
	const rate = guaranteeRate(token);
	const ended = guaranteeMintEnded();
	return {
		token,
		totalTtti,
		totalGuarantee,
		remainingTtti: totalTtti - done.ttti,
		remainingGuarantee,
		excess,
		withdrawableExcess: ended ? excess : 0n,
		guaranteeValue,
		rateUsdE8: rate,
		guaranteeValueUsdE8: rate === void 0 ? void 0 : guaranteeValue * rate / 10n ** BigInt(PAY_TOKENS[token].decimals),
		mintEnded: ended
	};
}
function mockGuaranteeMasses() {
	return PAY_TOKEN_ORDER.map(massOf).filter((m) => m !== void 0);
}
var quoteFail = (err) => ({
	__kind__: "err",
	err
});
var redeemFail = (err) => ({
	__kind__: "err",
	err
});
function mockQuoteGuarantee(token, tttiAmount) {
	const mass = massOf(token);
	if (!mass) return quoteFail({
		__kind__: "massNotFound",
		massNotFound: null
	});
	if (mass.remainingTtti === 0n) return quoteFail({
		__kind__: "nothingRemaining",
		nothingRemaining: null
	});
	if (tttiAmount === 0n) return quoteFail({
		__kind__: "amountTooSmall",
		amountTooSmall: null
	});
	if (tttiAmount > mass.remainingTtti) return quoteFail({
		__kind__: "amountExceedsMass",
		amountExceedsMass: {
			requested: tttiAmount,
			remaining: mass.remainingTtti
		}
	});
	const decimals = 10n ** BigInt(PAY_TOKENS[token].decimals);
	const deposited = mass.remainingGuarantee * tttiAmount / mass.remainingTtti;
	const phase = mass.mintEnded ? RedeemPhase.afterMint : RedeemPhase.duringMint;
	let returned = deposited;
	let rule = RedeemRule.proRata;
	let excessKept = 0n;
	let dayRateQuantity;
	const rate = mass.rateUsdE8;
	if (!mass.mintEnded) {
		if (rate === void 0) return quoteFail({
			__kind__: "rateUnavailable",
			rateUnavailable: token
		});
		dayRateQuantity = tttiAmount * 10000n * decimals / rate;
		if (dayRateQuantity < deposited) {
			returned = dayRateQuantity;
			rule = RedeemRule.dayRate;
			excessKept = deposited - dayRateQuantity;
		} else rule = RedeemRule.depositedGuarantee;
	}
	const redemptionFee = returned / 100n;
	const thirdPartyFee = PAY_TOKENS[token].fee;
	if (returned <= redemptionFee + thirdPartyFee) return quoteFail({
		__kind__: "amountTooSmall",
		amountTooSmall: null
	});
	return {
		__kind__: "ok",
		ok: {
			token,
			tttiAmount,
			phase,
			rule,
			depositedGuarantee: deposited,
			dayRateQuantity,
			rateUsdE8: mass.mintEnded ? void 0 : rate,
			returnedAmount: returned,
			excessKept,
			redemptionFee,
			thirdPartyFee,
			netAmount: returned - redemptionFee - thirdPartyFee,
			tttiTransferFee: state.fee,
			tttiAllowanceRequired: tttiAmount + state.fee
		}
	};
}
function redemptionPayout(id, token, netAmount, thirdPartyFee, outcome, createdAt, owner) {
	return {
		n: id,
		attempt: 1n,
		request: {
			to: { owner },
			fee: thirdPartyFee,
			token: DEX_OF_PAY[token],
			from: dexCustodyAccount(DEX_OF_PAY[token]),
			amount: netAmount
		},
		memo: new TextEncoder().encode(`TTTI-GR-${id}`),
		sends: 1n,
		created_at_time: createdAt,
		outcome
	};
}
function mockRedeemGuarantee(token, tttiAmount, expectedNetAmount) {
	const quoted = mockQuoteGuarantee(token, tttiAmount);
	if (quoted.__kind__ === "err") return quoted;
	const quote = quoted.ok;
	const scenario = guaranteeScenario();
	if (scenario === "balance") return redeemFail({
		__kind__: "tttiBalanceInsufficient",
		tttiBalanceInsufficient: {
			balance: 0n,
			required: quote.tttiAllowanceRequired
		}
	});
	if (scenario === "allowance") return redeemFail({
		__kind__: "allowanceInsufficient",
		allowanceInsufficient: {
			allowance: 0n,
			required: quote.tttiAllowanceRequired
		}
	});
	if (scenario === "slippage" || quote.netAmount < expectedNetAmount) return redeemFail({
		__kind__: "slippage",
		slippage: {
			netAmount: quote.netAmount,
			expectedNetAmount
		}
	});
	const done = mockRedeemed[token];
	done.ttti += quote.tttiAmount;
	done.guarantee += quote.depositedGuarantee;
	done.excess += quote.excessKept;
	mockGuaranteeDebit(token, quote.returnedAmount);
	const id = nextRedemptionId++;
	const now = nowNs();
	const pullBlock = nextDexBlock++;
	const payoutBlock = nextDexBlock++;
	const redemption = {
		id,
		owner: CALLER,
		account: { owner: CALLER },
		kind: RedemptionKind.redeem,
		token,
		phase: quote.phase,
		rule: quote.rule,
		tttiAmount: quote.tttiAmount,
		tttiPullBlock: pullBlock,
		depositedGuarantee: quote.depositedGuarantee,
		rateUsdE8: quote.rateUsdE8,
		returnedAmount: quote.returnedAmount,
		excessKept: quote.excessKept,
		redemptionFee: quote.redemptionFee,
		thirdPartyFee: quote.thirdPartyFee,
		netAmount: quote.netAmount,
		createdAt: now,
		payout: redemptionPayout(id, token, quote.netAmount, quote.thirdPartyFee, {
			__kind__: "succeeded",
			succeeded: payoutBlock
		}, now, CALLER),
		status: {
			__kind__: "completed",
			completed: payoutBlock
		}
	};
	mockRedemptions.push(redemption);
	mockRedemptionFees.push({
		redemptionId: id,
		token,
		amount: quote.redemptionFee,
		createdAt: now
	});
	return {
		__kind__: "ok",
		ok: redemption
	};
}
function mockWithdrawExcess(token) {
	const mass = massOf(token);
	if (!mass) return redeemFail({
		__kind__: "massNotFound",
		massNotFound: null
	});
	if (!mass.mintEnded) return redeemFail({
		__kind__: "mintNotEnded",
		mintNotEnded: null
	});
	if (mass.withdrawableExcess === 0n) return redeemFail({
		__kind__: "noExcess",
		noExcess: null
	});
	const thirdPartyFee = PAY_TOKENS[token].fee;
	const amount = mass.withdrawableExcess;
	if (amount <= thirdPartyFee) return redeemFail({
		__kind__: "amountTooSmall",
		amountTooSmall: null
	});
	mockRedeemed[token].withdrawn += amount;
	mockGuaranteeDebit(token, amount);
	const id = nextRedemptionId++;
	const now = nowNs();
	const payoutBlock = nextDexBlock++;
	const netAmount = amount - thirdPartyFee;
	const redemption = {
		id,
		owner: CALLER,
		account: { owner: CALLER },
		kind: RedemptionKind.excessWithdrawal,
		token,
		phase: RedeemPhase.afterMint,
		rule: RedeemRule.proRata,
		tttiAmount: 0n,
		depositedGuarantee: 0n,
		returnedAmount: amount,
		excessKept: 0n,
		redemptionFee: 0n,
		thirdPartyFee,
		netAmount,
		createdAt: now,
		payout: redemptionPayout(id, token, netAmount, thirdPartyFee, {
			__kind__: "succeeded",
			succeeded: payoutBlock
		}, now, CALLER),
		status: {
			__kind__: "completed",
			completed: payoutBlock
		}
	};
	mockRedemptions.push(redemption);
	return {
		__kind__: "ok",
		ok: redemption
	};
}
function mockUnclaimedTotal() {
	const own = mockGuaranteeMasses();
	const otherGuarantee = mockOtherGuarantee();
	const perToken = PAY_TOKEN_ORDER.map((token) => {
		const mass = own.find((m) => m.token === token);
		const other = token === PayToken.icp;
		return {
			token,
			remainingTtti: (mass?.remainingTtti ?? 0n) + (other ? OTHER_MASS_TTTI : 0n) + mockAuctionMass[token].ttti,
			remainingGuarantee: (mass?.remainingGuarantee ?? 0n) + (other ? otherGuarantee : 0n) + mockAuctionMass[token].guarantee,
			excess: mass?.excess ?? 0n
		};
	}).filter((entry) => entry.remainingTtti > 0n || entry.excess > 0n);
	return {
		massCount: OTHER_MASS_COUNT + BigInt(own.filter((m) => m.remainingTtti > 0n).length) + PAY_TOKEN_ORDER.reduce((sum, token) => sum + mockAuctionMass[token].count, 0n),
		remainingTtti: perToken.reduce((sum, entry) => sum + entry.remainingTtti, 0n),
		mintEnded: guaranteeMintEnded(),
		perToken
	};
}
function setRedemptionStatus(id, status, outcome) {
	const index = mockRedemptions.findIndex((r) => r.id === id);
	if (index < 0) return;
	const record = mockRedemptions[index];
	mockRedemptions[index] = {
		...record,
		status,
		payout: {
			...record.payout,
			outcome
		}
	};
}
function redemptionArrived(id, block) {
	setRedemptionStatus(id, {
		__kind__: "completed",
		completed: block
	}, {
		__kind__: "succeeded",
		succeeded: block
	});
}
function redemptionNotArrived(id) {
	setRedemptionStatus(id, {
		__kind__: "failed",
		failed: "Payout not sent"
	}, {
		__kind__: "failed",
		failed: "Payout not sent"
	});
}
/** #GR review row of a redemption payout (id = redemption id). */
function redemptionReviewRow(r) {
	const memoText = new TextDecoder().decode(r.payout.memo);
	return {
		kind: TransferKind.GR,
		purchaseId: r.id,
		token: r.payout.request.token,
		memoText,
		memoHex: memoHexOf(memoText),
		createdAtTimeNs: r.payout.created_at_time,
		amount: r.payout.request.amount,
		fee: r.payout.request.fee,
		destination: r.payout.request.to,
		sends: r.payout.sends,
		lastError: "Call timed out (outcome unknown)",
		buyer: r.owner,
		outcome: r.payout.outcome
	};
}
{
	const id = nextRedemptionId++;
	const createdAt = nowNs() - 25n * HOUR_NS;
	const token = PayToken.icp;
	const returned = ICP_DIVISOR / 2n;
	const redemptionFee = returned / 100n;
	const thirdPartyFee = ICP_LEDGER_FEE;
	const netAmount = returned - redemptionFee - thirdPartyFee;
	const review = {
		id,
		owner: HOLDER_3,
		account: { owner: HOLDER_3 },
		kind: RedemptionKind.redeem,
		token,
		phase: RedeemPhase.afterMint,
		rule: RedeemRule.proRata,
		tttiAmount: TTTI_DIVISOR / 1000n,
		tttiPullBlock: 1100n + id,
		depositedGuarantee: returned,
		returnedAmount: returned,
		excessKept: 0n,
		redemptionFee,
		thirdPartyFee,
		netAmount,
		createdAt,
		payout: redemptionPayout(id, token, netAmount, thirdPartyFee, {
			__kind__: "unknown",
			unknown: null
		}, createdAt, HOLDER_3),
		status: {
			__kind__: "needsReview",
			needsReview: null
		}
	};
	mockRedemptions.push(review);
	mockRedemptionFees.push({
		redemptionId: id,
		token,
		amount: redemptionFee,
		createdAt
	});
	mockReviews.push(redemptionReviewRow(review));
}
var mintPage = (items, offset, limit) => items.slice(Number(offset), Number(offset + limit));
var replacedByLiquidityMint = () => purchaseError({
	__kind__: "replacedByLiquidityMint",
	replacedByLiquidityMint: null
}, "Minting now forms liquidity: use mintLiquidity.");
/** ICP part of the 1 % mint and buyback fees waiting for the next settlement to the reserve. */
var mockPendingFeeShareE8s = 3400000n;
/** Reserve coverage from the measured daily consumption; the one-year target is the fill reference. */
function mockReserveCoverage() {
	const autonomy = mockAutonomy();
	const dailyConsumptionCycles = LOT4_AVG7D > LOT4_AVG30D ? LOT4_AVG7D : LOT4_AVG30D;
	const yearTargetCycles = dailyConsumptionCycles * 365n;
	const monthlyConsumptionCycles = dailyConsumptionCycles * 30n;
	const filled = autonomy.totalCycles * 10000n / yearTargetCycles;
	return {
		rateKnown: true,
		totalCycles: autonomy.totalCycles,
		dailyConsumptionCycles,
		monthlyConsumptionCycles,
		yearTargetCycles,
		yearTargetE8s: yearTargetCycles * ICP_DIVISOR / LOT4_CYCLES_PER_ICP,
		monthsCoveredX100: autonomy.totalCycles * 100n / monthlyConsumptionCycles,
		fillBps: filled > 10000n ? 10000n : filled
	};
}
function mockTopUpCycles() {
	const attemptPending = state.lastTopUp.status.__kind__ === "transferred";
	if (state.cyclesBalance >= TOP_UP_THRESHOLD && !attemptPending) throw new Error(`Top-up not needed: the cycles balance (${state.cyclesBalance}) is at or above the threshold (${TOP_UP_THRESHOLD}) and no top-up is pending.`);
	const spendable = state.reserveBalanceE8s > 200000000n ? state.reserveBalanceE8s - RESERVE_FLOOR_E8S : 0n;
	const icpE8s = spendable > 50000000n ? 50000000n : spendable;
	if (icpE8s > 0n) {
		const cycles = icpE8s * LOT4_CYCLES_PER_ICP / ICP_DIVISOR;
		state.reserveBalanceE8s -= icpE8s;
		state.cyclesBalance += cycles;
		state.lastTopUp = {
			timestamp: nowNs(),
			icpE8s,
			blockIndex: state.nextBlock++,
			status: {
				__kind__: "notified",
				notified: { cycles }
			}
		};
	}
	return {
		__kind__: "ran",
		ran: {
			cyclesBalance: state.cyclesBalance,
			reserveBalanceE8s: state.reserveBalanceE8s,
			lastTopUp: state.lastTopUp,
			attemptOpen: false
		}
	};
}
function mockTransferAttempt(n, token, to, amount, createdAt, memo, outcome) {
	return {
		n,
		attempt: 1n,
		request: {
			to,
			fee: dexTokenFee(token),
			token,
			from: { owner: TTTI_CANISTER },
			amount
		},
		memo: new TextEncoder().encode(memo),
		sends: 1n,
		created_at_time: createdAt,
		outcome,
		...outcome.__kind__ === "unknown" ? { lastError: "Call timed out (outcome unknown)" } : {}
	};
}
var mockCyclesFeeSettlements = [
	1n,
	2n,
	3n
].map((n) => {
	const grossE8s = n === 1n ? 12000000n : n === 2n ? 8500000n : 5100000n;
	const createdAt = nowNs() - (n === 1n ? 6n * LOT4_DAY_NS : n === 2n ? 3n * LOT4_DAY_NS : 26n * HOUR_NS);
	const block = 18190000n + n * 1100n;
	const reviewed = n === 3n;
	const outcome = reviewed ? {
		__kind__: "unknown",
		unknown: null
	} : {
		__kind__: "succeeded",
		succeeded: block
	};
	const status = reviewed ? {
		__kind__: "needsReview",
		needsReview: null
	} : {
		__kind__: "completed",
		completed: block
	};
	return {
		n,
		grossE8s,
		netE8s: grossE8s - ICP_LEDGER_FEE,
		createdAt,
		status,
		attempt: mockTransferAttempt(n, DexToken.icp, CYCLES_RESERVE_ACCOUNT, grossE8s - ICP_LEDGER_FEE, createdAt, `TTTI-CY-${n}`, outcome)
	};
});
var mockCyclesFeeSplits = [
	{
		id: 1n,
		source: FeeSplitSource.mint,
		split: {
			cyclesE8s: 2000000n,
			creator: 0n
		}
	},
	{
		id: 2n,
		source: FeeSplitSource.mint,
		split: {
			cyclesE8s: 1200000n,
			creator: 0n
		}
	},
	{
		id: 3n,
		source: FeeSplitSource.mint,
		split: {
			cyclesE8s: 3100000n,
			creator: 0n
		}
	},
	{
		id: 1n,
		source: FeeSplitSource.buyback,
		split: {
			cyclesE8s: 600000n,
			creator: 0n
		}
	},
	{
		id: 2n,
		source: FeeSplitSource.buyback,
		split: {
			cyclesE8s: 1900000n,
			creator: 0n
		}
	}
];
var mockCreatorTokens = {
	[DexToken.icp]: {
		mintFee: 41200000n,
		buybackFee: 8000000n,
		swapFeeShare: 12600000n,
		routerShare: 1900000n,
		transferFee: 0n,
		paidOut: 30000000n,
		inFlight: 0n,
		lastCreditAt: nowNs() - 5n * HOUR_NS
	},
	[DexToken.tttiT]: {
		mintFee: 0n,
		buybackFee: 0n,
		swapFeeShare: 4300000n,
		routerShare: 610000n,
		transferFee: 2000000n,
		paidOut: 0n,
		inFlight: 0n,
		lastCreditAt: nowNs() - 9n * HOUR_NS
	},
	[DexToken.ckbtc]: {
		mintFee: 12000n,
		buybackFee: 0n,
		swapFeeShare: 3400n,
		routerShare: 0n,
		transferFee: 0n,
		paidOut: 0n,
		inFlight: 0n,
		lastCreditAt: nowNs() - 2n * LOT4_DAY_NS
	},
	[DexToken.ckusdc]: {
		mintFee: 18500000n,
		buybackFee: 0n,
		swapFeeShare: 2100000n,
		routerShare: 400000n,
		transferFee: 0n,
		paidOut: 8000000n,
		inFlight: 5000000n,
		lastCreditAt: nowNs() - 20n * HOUR_NS
	},
	[DexToken.ckusdt]: {
		mintFee: 7000000n,
		buybackFee: 0n,
		swapFeeShare: 900000n,
		routerShare: 0n,
		transferFee: 0n,
		paidOut: 0n,
		inFlight: 0n,
		lastCreditAt: nowNs() - 3n * LOT4_DAY_NS
	}
};
var MOCK_CREATOR_TOKEN_ORDER = [
	DexToken.icp,
	DexToken.tttiT,
	DexToken.ckbtc,
	DexToken.ckusdc,
	DexToken.ckusdt
];
var mockCreatorPayouts = [
	{
		n: 1n,
		symbol: "ICP",
		grossAmount: 30000000n,
		netAmount: 30000000n - ICP_LEDGER_FEE,
		createdAt: nowNs() - 8n * LOT4_DAY_NS,
		memoText: "TTTI-CF-1",
		status: {
			__kind__: "completed",
			completed: 18170552n
		}
	},
	{
		n: 2n,
		symbol: "ckUSDC",
		grossAmount: 8000000n,
		netAmount: 8000000n - PAY_TOKENS[PayToken.ckusdc].fee,
		createdAt: nowNs() - 5n * LOT4_DAY_NS,
		memoText: "TTTI-CF-2",
		status: {
			__kind__: "completed",
			completed: 912440n
		}
	},
	{
		n: 3n,
		symbol: "ckUSDC",
		grossAmount: 5000000n,
		netAmount: 5000000n - PAY_TOKENS[PayToken.ckusdc].fee,
		createdAt: nowNs() - 27n * HOUR_NS,
		memoText: "TTTI-CF-3",
		status: {
			__kind__: "needsReview",
			needsReview: null
		}
	}
];
var nextCreatorPayoutN = 4n;
var mockCreatorHeld = (t) => t.mintFee + t.buybackFee + t.swapFeeShare + t.routerShare + t.transferFee - t.paidOut - t.inFlight;
var DEX_TOKEN_SYMBOL = {
	[DexToken.icp]: "ICP",
	[DexToken.tttiT]: TTTI_SYMBOL,
	[DexToken.ckbtc]: "ckBTC",
	[DexToken.ckusdc]: "ckUSDC",
	[DexToken.ckusdt]: "ckUSDT"
};
function mockCreatorTokenViews() {
	return MOCK_CREATOR_TOKEN_ORDER.map((token) => {
		const t = mockCreatorTokens[token];
		return {
			token,
			symbol: DEX_TOKEN_SYMBOL[token],
			held: mockCreatorHeld(t),
			paidOut: t.paidOut,
			inFlight: t.inFlight,
			mintFee: t.mintFee,
			buybackFee: t.buybackFee,
			swapFeeShare: t.swapFeeShare,
			routerShare: t.routerShare,
			transferFee: t.transferFee,
			...t.lastCreditAt !== void 0 ? { lastCreditAt: t.lastCreditAt } : {}
		};
	});
}
function mockCreatorHoldings() {
	return {
		tokens: mockCreatorTokenViews(),
		transferFeeCollectorE8s: state.feeCollectorBalance,
		payouts: [...mockCreatorPayouts].reverse().slice(0, 20)
	};
}
function mockPayCreatorFees(token) {
	const t = mockCreatorTokens[token];
	const held = mockCreatorHeld(t);
	const fee = dexTokenFee(token);
	if (held <= 0n) return {
		__kind__: "err",
		err: {
			__kind__: "nothingToPay",
			nothingToPay: null
		}
	};
	if (t.inFlight > 0n) return {
		__kind__: "err",
		err: {
			__kind__: "payoutInProgress",
			payoutInProgress: null
		}
	};
	if (held <= fee) return {
		__kind__: "err",
		err: {
			__kind__: "belowFee",
			belowFee: {
				fee,
				held
			}
		}
	};
	const n = nextCreatorPayoutN++;
	const payout = {
		n,
		symbol: DEX_TOKEN_SYMBOL[token],
		grossAmount: held,
		netAmount: held - fee,
		createdAt: nowNs(),
		memoText: `TTTI-CF-${n}`,
		status: {
			__kind__: "completed",
			completed: state.nextBlock++
		}
	};
	t.paidOut += held;
	mockCreatorPayouts.push(payout);
	return {
		__kind__: "ok",
		ok: payout
	};
}
function mockReviewCreatorPayout(n, block) {
	const payout = mockCreatorPayouts.find((x) => x.n === n);
	if (!payout || payout.status.__kind__ !== "needsReview") return {
		__kind__: "err",
		err: "This payout is unknown or is not waiting for a review."
	};
	const token = MOCK_CREATOR_TOKEN_ORDER.find((x) => DEX_TOKEN_SYMBOL[x] === payout.symbol);
	if (token === void 0) return {
		__kind__: "err",
		err: "The payout token is unknown."
	};
	const t = mockCreatorTokens[token];
	t.inFlight -= payout.grossAmount;
	if (block !== null) {
		t.paidOut += payout.grossAmount;
		payout.status = {
			__kind__: "completed",
			completed: block
		};
	} else payout.status = {
		__kind__: "failed",
		failed: "Marked as not arrived by the admin; the amount is held again."
	};
	return {
		__kind__: "ok",
		ok: null
	};
}
function mockReviewCyclesSettlement(n, block) {
	const settlement = mockCyclesFeeSettlements.find((x) => x.n === n);
	if (!settlement || settlement.status.__kind__ !== "needsReview") return {
		__kind__: "err",
		err: "This settlement is unknown or is not waiting for a review."
	};
	if (block !== null) {
		settlement.status = {
			__kind__: "completed",
			completed: block
		};
		settlement.attempt = {
			...settlement.attempt,
			outcome: {
				__kind__: "succeeded",
				succeeded: block
			}
		};
	} else {
		settlement.status = {
			__kind__: "failed",
			failed: "Marked as not arrived by the admin; the amount is sent again."
		};
		settlement.attempt = {
			...settlement.attempt,
			outcome: {
				__kind__: "failed",
				failed: "Not arrived"
			}
		};
		mockPendingFeeShareE8s += settlement.grossE8s;
	}
	return {
		__kind__: "ok",
		ok: null
	};
}
var mockPermanentLog = (() => {
	const poolId = lot4Pool(DEX_TTTI, DEX_ICP)?.id ?? 1n;
	const entry = (id, hoursAgo, kind, token, amount, extra = {}) => ({
		id,
		at: nowNs() - hoursAgo * HOUR_NS,
		kind,
		token,
		amount,
		otherAmount: 0n,
		shares: 0n,
		...extra
	});
	return [
		entry(1n, 150n, PermanentKind.accrued, DexToken.icp, 4200000n),
		entry(2n, 130n, PermanentKind.accrued, DexToken.ckusdt, 3100000n),
		entry(3n, 96n, PermanentKind.waiting, DexToken.icp, 6500000n, { reason: "Set-aside is below the injection threshold of 1 ICP." }),
		entry(4n, 70n, PermanentKind.accrued, DexToken.icp, 51000000n),
		entry(5n, 69n, PermanentKind.rebalanced, DexToken.icp, 51000000n, {
			otherToken: DexToken.tttiT,
			otherAmount: 40400n,
			route: {
				__kind__: "native",
				native: poolId
			},
			poolId
		}),
		entry(6n, 69n, PermanentKind.injected, DexToken.icp, 51000000n, {
			otherToken: DexToken.tttiT,
			otherAmount: 40400n,
			route: {
				__kind__: "native",
				native: poolId
			},
			poolId,
			shares: 1435000n
		}),
		entry(7n, 30n, PermanentKind.failed, DexToken.ckusdt, 3100000n, { reason: "No route within 2 % of the average price of the last hour." }),
		entry(8n, 6n, PermanentKind.accrued, DexToken.icp, 7800000n)
	];
})();
function mockPermanentSummary() {
	const pools = mockPools.flatMap((pool) => {
		const lockedShares = pool.lockedShares + (dexProtocolShares.get(pool.id) ?? 0n);
		if (lockedShares === 0n || pool.totalShares === 0n) return [];
		const amount0 = lockedShares * pool.reserve0 / pool.totalShares;
		const amount1 = lockedShares * pool.reserve1 / pool.totalShares;
		const usd = dexDepthAt(pool, amount0, amount1).usdE8;
		return [{
			poolId: pool.id,
			token0Symbol: pool.token0.symbol,
			token1Symbol: pool.token1.symbol,
			lockedShares,
			totalShares: pool.totalShares,
			amount0,
			amount1,
			...usd !== void 0 ? { valueUsdE8: usd } : {}
		}];
	});
	const setAside = [{
		token: DexToken.icp,
		symbol: "ICP",
		amount: 14300000n,
		valueIcpE8s: 14300000n
	}, {
		token: DexToken.ckusdt,
		symbol: "ckUSDT",
		amount: 3100000n,
		valueIcpE8s: 2480000n
	}];
	return {
		pools,
		totalLockedShares: pools.reduce((sum, x) => sum + x.lockedShares, 0n),
		setAside,
		setAsideValueIcpE8s: setAside.reduce((sum, x) => sum + x.valueIcpE8s, 0n),
		thresholdIcpE8s: 100000000n,
		maxDeviationBps: 200n,
		targetPoolId: lot4Pool(DEX_TTTI, DEX_ICP)?.id
	};
}
function mockPublicBoard() {
	const newestFirst = [...mockPermanentLog].reverse();
	return {
		cycles: {
			cyclesBalance: state.cyclesBalance,
			reserveBalanceE8s: state.reserveBalanceE8s,
			pendingFeeShareE8s: mockPendingFeeShareE8s,
			coverage: mockReserveCoverage()
		},
		permanentLiquidity: {
			summary: mockPermanentSummary(),
			journalEntries: BigInt(newestFirst.length),
			latestEntries: newestFirst.slice(0, 10)
		},
		creator: {
			tokens: mockCreatorTokenViews(),
			transferFeeCollectorE8s: state.feeCollectorBalance
		}
	};
}
for (const pool of mockPools) {
	if (!mockPositions.some((p) => p.poolId === pool.id && p.unlockAt > nowNs() && p.shares > 0n)) continue;
	const pot = dexPotOf(pool.id);
	pot.pending0 += pool.reserve0 / 2000n;
	pot.pending1 += pool.reserve1 / 2000n;
}
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
	getPublicBoard: async () => mockPublicBoard(),
	getCreatorHoldings: async () => mockCreatorHoldings(),
	payCreatorFees: async (token) => mockPayCreatorFees(token),
	listCreatorPayoutsToReview: async () => mockCreatorPayouts.filter((x) => x.status.__kind__ === "needsReview"),
	markCreatorPayoutArrived: async (n, block) => mockReviewCreatorPayout(n, block),
	markCreatorPayoutNotArrived: async (n) => mockReviewCreatorPayout(n, null),
	topUpCycles: async () => mockTopUpCycles(),
	listCyclesFeeSettlements: async (offset, limit) => [...mockCyclesFeeSettlements].reverse().slice(Number(offset), Number(offset + limit)),
	listCyclesFeeSplits: async (source, offset, limit) => mockCyclesFeeSplits.filter((x) => x.source === source).reverse().slice(Number(offset), Number(offset + limit)),
	listCyclesFeeSettlementsToReview: async () => mockCyclesFeeSettlements.filter((x) => x.status.__kind__ === "needsReview"),
	markCyclesFeeSettlementArrived: async (n, block) => mockReviewCyclesSettlement(n, block),
	markCyclesFeeSettlementNotArrived: async (n) => mockReviewCyclesSettlement(n, null),
	listPermanentLiquidityLog: async (offset, limit) => {
		const all = [...mockPermanentLog].reverse();
		const capped = limit > 100n ? 100n : limit;
		return {
			total: BigInt(all.length),
			entries: all.slice(Number(offset), Number(offset + capped))
		};
	},
	getPermanentLiquiditySummary: async () => mockPermanentSummary(),
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
	listPoolPositions: async (poolId) => {
		dexProcessRemovals();
		return mockPositions.filter((p) => p.poolId === poolId).map(dexPositionView);
	},
	listDexPositionsOf: async (owner) => {
		dexProcessRemovals();
		return mockPositions.filter((p) => p.owner.toText() === owner.toText()).map(dexPositionView);
	},
	startDexDayRoll: async () => dexStartDayRoll(),
	runDexPotSlice: async (poolId) => {
		const pool = mockPools.find((p) => p.id === poolId);
		return pool ? dexRunPotSlice(pool) : {
			poolId,
			phase: SharingPhase.idle,
			processed: 0n,
			more: false,
			paid0: 0n,
			paid1: 0n
		};
	},
	getDexPendingPots: async () => {
		dexProcessRemovals();
		return mockPools.map(dexPendingPotView);
	},
	getDexPendingPot: async (poolId) => {
		dexProcessRemovals();
		const pool = mockPools.find((p) => p.id === poolId);
		return pool ? dexPendingPotView(pool) : null;
	},
	getDexEstimatedShare: async (positionId) => {
		dexProcessRemovals();
		const position = mockPositions.find((p) => p.id === positionId);
		const pool = position ? mockPools.find((p) => p.id === position.poolId) : void 0;
		return pool ? dexPoolEstimates(pool).find((e) => e.positionId === positionId) ?? null : null;
	},
	getMyDexEstimatedShares: async () => {
		dexProcessRemovals();
		return mockPools.flatMap(dexPoolEstimates).filter((e) => e.owner.toText() === CALLER.toText()).sort((a, b) => a.positionId === b.positionId ? 0 : a.positionId < b.positionId ? -1 : 1);
	},
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
	runDexSweep: async () => mockRunDexSweep(),
	resendDexSweepTransfers: async () => mockResendDexSweepTransfers(),
	getDexSweepState: async () => mockSweepState(),
	getDexCustodyComparison: async () => mockSweepState().map((s) => ({
		token: s.token,
		comparison: s.comparison
	})),
	getDexCustodyAccounts: async () => DEX_TOKEN_ORDER.map((token) => ({
		token,
		account: dexCustodyAccount(token)
	})),
	listDexSweepTransfers: async (cursor, limit) => mockPage([...mockSweepTransfers].reverse(), cursor, limit),
	getDexSweepProgress: async () => mockSweepProgress(),
	getDexIndicators: async () => mockDexIndicators(),
	getDexIndicatorsStatus: async () => ({
		__kind__: "ok",
		ok: mockDexIndicatorsStatus()
	}),
	getMyRoutedSwaps: async (cursor, limit) => mockPage(mockRoutedSwaps.filter((s) => s.owner.toText() === CALLER.toText()).reverse(), cursor, limit),
	adminListRoutedSwaps: async (cursor, limit) => ({
		__kind__: "ok",
		ok: mockPage([...mockRoutedSwaps].reverse(), cursor, limit)
	}),
	adminGetRouterFees: async () => ({
		__kind__: "ok",
		ok: [...mockRouterFees.values()]
	}),
	quoteSwap: async (poolId, tokenIn, amountIn, slippageBps) => mockQuoteSwap(poolId, tokenIn, amountIn, slippageBps),
	swap: async (poolId, tokenIn, amountIn, minAmountOut, deadline) => {
		assertDexNotPaused();
		const held = dexBalanceOf(CALLER, tokenIn);
		const before = held.available;
		if (before < amountIn) held.available = amountIn;
		const done = mockSwap(poolId, tokenIn, amountIn, minAmountOut, deadline);
		if (done.__kind__ === "err") held.available = before;
		return done;
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
	removePair: async (poolId, reason) => mockRemovePair(poolId, reason),
	cancelPairRemoval: async (poolId) => mockCancelPairRemoval(poolId),
	getReferencePrice: async (poolId) => {
		const pool = mockPools.find((p) => p.id === poolId);
		return pool ? dexReference(pool) : null;
	},
	refreshReferenceSources: async () => BigInt(dexRefreshReferenceSources()),
	getConsolidatedTttiPrice: async () => {
		dexRefreshAllOpenings();
		return dexConsolidatedPrice();
	},
	getPoolSpreads: async () => {
		dexRefreshAllOpenings();
		return dexPoolSpreads();
	},
	getPoolCapRatio: async () => {
		dexRefreshAllOpenings();
		return dexPoolCapRatio();
	},
	getMyPoolSpreadAlerts: async () => {
		dexRefreshAllOpenings();
		return dexMySpreadAlerts();
	},
	setUtilityPairMinimums: async (poolId, minimums) => mockSetUtilityPairMinimums(poolId, minimums),
	getDexTokens: async () => DEX_TOKEN_ORDER.map(dexTokenInfo),
	getDexDepositAccount: async (owner) => dexDepositAccountOf(owner),
	getDexPoolAccount: async (poolId) => mockPools.find((p) => p.id === poolId)?.poolAccount ?? null,
	getDexBalances: async (owner) => dexBalancesView(owner),
	getDexTransfers: async (owner) => mockDexTransfers.filter((t) => t.owner.toText() === owner.toText()).reverse(),
	getDexTransfersPage: async (owner, cursor, limit) => mockDexTransfersPage(owner, cursor, limit),
	depositToDex: async ({ token, amount }) => {
		assertDexNotPaused();
		return mockDepositToDex(token, amount);
	},
	withdrawFromDex: async ({ token, amount }) => mockWithdrawFromDex(token, amount),
	getUpgradeReadiness: async () => mockUpgradeReadiness(),
	reconcileReserved: async () => mockReconcileReserved(),
	getMyGuaranteeMasses: async () => mockGuaranteeMasses(),
	quoteGuaranteeRedeem: async (token, tttiAmount) => mockQuoteGuarantee(token, tttiAmount),
	redeemGuarantee: async (token, tttiAmount, expectedNetAmount) => state.salesPaused ? redeemFail({
		__kind__: "salesPaused",
		salesPaused: null
	}) : mockRedeemGuarantee(token, tttiAmount, expectedNetAmount),
	withdrawGuaranteeExcess: async (token) => mockWithdrawExcess(token),
	listMyRedemptions: async () => mockRedemptions.filter((r) => r.owner.toText() === CALLER.toText()).reverse(),
	getUnclaimedMassTotal: async () => mockUnclaimedTotal(),
	getGuaranteeAccounts: async () => mockGuaranteeAccounts(),
	getAuctionView: async () => mockAuctionView(),
	getMyAuctionBids: async () => mockAuctionState.bids.filter((b) => b.bidder.toText() === CALLER.toText()),
	quoteAuctionDeposit: async (token, priceB, quantityE8s) => {
		const invalid = mockAuctionCheck(priceB, quantityE8s, token);
		return invalid ? {
			__kind__: "err",
			err: invalid
		} : {
			__kind__: "ok",
			ok: mockAuctionRequired(priceB, quantityE8s)
		};
	},
	placeAuctionBid: async (token, quantityE8s, priceB, depositAmount) => mockPlaceAuctionBid(token, quantityE8s, priceB, depositAmount),
	openAuction: async () => mockOpenAuction(),
	getClosedAuctions: async () => {
		mockAuctionSettled();
		return [...mockClosedAuctions].map((r) => r.auction).sort((a, b) => mockCompare(b.id, a.id));
	},
	getAuctionResult: async (auctionId) => {
		mockAuctionSettled();
		const record = mockClosedAuctions.find((r) => r.auction.id === auctionId);
		return record ? {
			auction: record.auction,
			bids: record.bids
		} : null;
	},
	getMyWithdrawable: async () => {
		mockAuctionSettled();
		const perToken = mockAuctionBalances.get(CALLER.toText());
		return PAY_TOKEN_ORDER.flatMap((token) => {
			const entry = perToken?.get(token);
			if (!entry) return [];
			const available = dexBalanceOf(CALLER, DEX_OF_PAY[token]).available;
			const withdrawable = entry.withdrawable < available ? entry.withdrawable : available;
			return withdrawable > 0n || entry.pending > 0n ? [{
				token,
				withdrawable,
				pendingSettlement: entry.pending
			}] : [];
		});
	},
	settleAuctionWinners: async (auctionId) => {
		mockAuctionSettled();
		const record = mockClosedAuctions.find((r) => r.auction.id === auctionId);
		if (!record) return {
			__kind__: "err",
			err: SettleError.unknownAuction
		};
		if (record.auction.settlement.pendingCount === 0n) return {
			__kind__: "err",
			err: SettleError.nothingToSettle
		};
		return {
			__kind__: "ok",
			ok: mockSettleRecord(record)
		};
	},
	auctionSettleCore: async (args) => {
		const taken = mockAuctionRequired(args.priceB, args.quantityE8s);
		const amountB = args.priceB * args.quantityE8s / 10n ** 8n;
		return {
			mintedE8s: args.mintE8s,
			takenAmount: taken,
			creatorShare: taken - 2n * amountB,
			positionAmount: amountB,
			guaranteeAmount: amountB,
			positionId: nextPositionId,
			shares: args.quantityE8s
		};
	},
	listRedemptionFees: async (offset, limit) => mockRedemptionFees.slice(Number(offset), Number(offset + limit)),
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
	convertDeposit: async () => replacedByLiquidityMint(),
	convertDepositWith: async () => replacedByLiquidityMint(),
	quoteLiquidityMint: async (args) => mockQuoteLiquidityMint(args),
	mintLiquidity: async (args) => mockMintLiquidity(args),
	liquidityMintCore: async () => {
		throw new Error("Unauthorized: reserved to the canister itself");
	},
	getMyLiquidityMints: async () => {
		settleMintRefunds();
		return [...mockLiquidityMints].reverse();
	},
	getMyGuarantees: async () => [...mockGuarantees].reverse(),
	listGuarantees: async (offset, limit) => mintPage(mockGuarantees, offset, limit),
	listCreatorSetAsides: async (offset, limit) => mintPage(mockCreatorSetAsides, offset, limit),
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
	listTransfersToReview: async () => {
		dexProcessRemovals();
		return [...mockReviews, ...custodySurplusReviews()];
	},
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
			mintableRemaining: saleMintable(),
			mintEnded: saleMintEnded(),
			remainderE8s: saleRemainder(),
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
		deliveryOrder: "Fresh minting only; collected transfer fees belong to the creator (source transferFee) and are never delivered at mint",
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
		pendingFeeShareE8s: mockPendingFeeShareE8s,
		coverage: mockReserveCoverage(),
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
	status: async () => ({ num_blocks_synced: 0n }),
	transform: async () => ({
		status: 200n,
		body: /* @__PURE__ */ new Uint8Array(),
		headers: []
	})
};
//#endregion
export { mockBackend };
