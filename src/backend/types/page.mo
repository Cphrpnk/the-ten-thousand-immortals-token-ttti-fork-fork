import Nat "mo:core/Nat";

// PTM-9e: shared page type of the cursor-paginated lists.
//
// Every paged list is newest first and uses the record id (swap id, sweep
// transfer number n) as the cursor. A call with `cursor = null` returns the
// newest `limit` items. A call with `cursor = ?c` returns the items whose id is
// strictly below c. `nextCursor` is the id of the last returned item when older
// items may remain, and null on the last page. The page size is capped on the
// server whatever the caller asks for.
module {
  // Hard server-side cap of one page.
  public let MAX_PAGE_SIZE : Nat = 100;
  // Page size used when the caller passes 0.
  public let DEFAULT_PAGE_SIZE : Nat = 50;

  public type Page<T> = {
    items : [T];
    nextCursor : ?Nat;
  };

  // 0 -> DEFAULT_PAGE_SIZE; anything above MAX_PAGE_SIZE -> MAX_PAGE_SIZE.
  public func clampLimit(limit : Nat) : Nat {
    if (limit == 0) DEFAULT_PAGE_SIZE else Nat.min(limit, MAX_PAGE_SIZE);
  };

  public func emptyPage<T>() : Page<T> {
    { items = []; nextCursor = null };
  };
};
