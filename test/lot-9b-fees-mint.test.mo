import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Account "../src/backend/types/account";
import AuctionLib "../src/backend/lib/auction";
import CreatorFeesLib "../src/backend/lib/creator-fees";
import DexLib "../src/backend/lib/dex";
import IcrcLib "../src/backend/lib/icrc";
import SaleLib "../src/backend/lib/presale";
import CreatorTypes "../src/backend/types/creator-fees";

// PTM-9b points 1 and 2: transfer fees go to the creator and never count in the
// TTTI-T available at the mint; the mint is over below the minimum of one mint.
// Pure tests that run in the interpreter.

let canister = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("2vxsx-fae");
let now : Int = 1_000_000_000_000_000_000;

func newLedger(totalSupply : Nat, balances : [(IcrcLib.Account, Nat)]) : IcrcLib.Ledger {
  let b = Map.empty<IcrcLib.Account, Nat>();
  for ((a, n) in balances.values()) { b.add(a, n) };
  {
    balances = b;
    approvals = Map.empty();
    blocks = Map.empty();
    state = {
      var totalSupply;
      var fee = IcrcLib.FIXED_FEE;
      var nextBlockIndex = 0;
      legacyBlockBoundary = 0;
      var lastBlockHash = null;
    };
    dedup = Map.empty();
    dedupQueue = Map.empty();
  };
};

func newCreatorStore() : CreatorTypes.CreatorFeeStore {
  { totals = Map.empty(); payouts = Map.empty() };
};

func account(p : Principal) : IcrcLib.Account = { owner = p; subaccount = null };

// The fee of a transfer sits in the fee collector. (The ledger blocks of a
// transfer set certified data, which the interpreter cannot run, so the fee is
// credited to the collector directly, as creditFee does.)
func collectFee(ledger : IcrcLib.Ledger, amount : Nat) {
  let collector = IcrcLib.feeCollectorAccount(canister);
  ledger.balances.add(collector, (ledger.balances.get(collector) ?? 0) + amount);
};

let max = 100_000_000; // TOKEN_MAX_SUPPLY, 1 TTTI-T at 8 decimals

// --- Point 1: the transfer fee is credited to the creator --------------------------

do {
  let ledger = newLedger(50_000_000, [(account(alice), 50_000_000)]);
  let store = newCreatorStore();
  let fee = IcrcLib.FIXED_FEE;
  collectFee(ledger, fee);
  assert IcrcLib.balanceOf(ledger, IcrcLib.feeCollectorAccount(canister)) == fee;
  assert CreatorFeesLib.held(store, #tttiT) == 0;
  // The creator credit carries the source #transferFee.
  CreatorFeesLib.credit(store, #tttiT, fee, #transferFee, now);
  assert CreatorFeesLib.held(store, #tttiT) == fee;
  switch (store.totals.get(DexLib.tokenKey(#tttiT))) {
    case (?t) {
      assert t.transferFee == fee;
      assert t.mintFee == 0 and t.swapFeeShare == 0 and t.routerShare == 0 and t.buybackFee == 0;
    };
    case null assert false;
  };
  // Credits accumulate.
  CreatorFeesLib.credit(store, #tttiT, 2 * fee, #transferFee, now);
  assert CreatorFeesLib.held(store, #tttiT) == 3 * fee;
  // With an empty fee collector, collecting credits nothing (no block written).
  let empty = newLedger(50_000_000, []);
  assert CreatorFeesLib.collectTransferFees(store, empty, canister, now) == 0;
  assert CreatorFeesLib.held(store, #tttiT) == 3 * fee;
};

// --- Point 1: the fees are never part of what is available at the mint -------------

do {
  // 1_000_000 e8s can still be minted; the collector holds 7_000 of fees.
  let collector = IcrcLib.feeCollectorAccount(canister);
  let ledger = newLedger(Nat.sub(max, 1_000_000), [(collector, 7_000)]);
  let sale : SaleLib.SaleStore = { var sold = 0; var reserved = 0; var salesPaused = false };
  assert IcrcLib.mintableRemaining(ledger) == 1_000_000;
  // Only fresh minting counts: the fees add nothing.
  assert SaleLib.available(sale, ledger, canister) == 1_000_000;
  sale.reserved := 400_000;
  assert SaleLib.available(sale, ledger, canister) == 600_000;
  sale.reserved := 2_000_000;
  assert SaleLib.available(sale, ledger, canister) == 0;
};

// With the whole supply minted, the fees in the collector are not available.
do {
  let collector = IcrcLib.feeCollectorAccount(canister);
  let ledger = newLedger(max, [(collector, 9_000)]);
  let sale : SaleLib.SaleStore = { var sold = 0; var reserved = 0; var salesPaused = false };
  assert SaleLib.available(sale, ledger, canister) == 0;
};

// The delivery of the mint only mints new tokens: asking for more than what
// remains to mint is refused, the fees in the collector are not drawn on.
do {
  let collector = IcrcLib.feeCollectorAccount(canister);
  let ledger = newLedger(Nat.sub(max, 100), [(collector, 1_000)]);
  let to = DexLib.custodyAccount(canister, #tttiT);
  switch (IcrcLib.deliverMintFirst(ledger, canister, to, 500)) {
    case (#err(_)) {};
    case (#ok(_)) assert false;
  };
  assert IcrcLib.balanceOf(ledger, collector) == 1_000;
  assert IcrcLib.totalSupply(ledger) == max - 100;
  assert IcrcLib.balanceOf(ledger, to) == 0;
};

// --- Point 2: the mint ends below the minimum of one mint -----------------------------

do {
  // 10_000 e8s is the minimum of one mint: at the minimum the mint goes on.
  let atMinimum = newLedger(Nat.sub(max, 10_000), []);
  assert AuctionLib.mintRemainder(atMinimum) == 0;
  // One e8s below the minimum: the mint is over and the remainder is reported.
  let below = newLedger(Nat.sub(max, 9_999), []);
  assert AuctionLib.mintRemainder(below) == 9_999;
  // Well above the minimum: not over, no remainder.
  let far = newLedger(Nat.sub(max, 5_000_000), []);
  assert AuctionLib.mintRemainder(far) == 0;
  // Fully minted: over, nothing left to carry.
  let full = newLedger(max, []);
  assert AuctionLib.mintRemainder(full) == 0;
};
