import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// Adds the private per-principal address book (empty). The ledger, blocks,
// balances, conversions, delivery addresses, acknowledgements, stored rates,
// cycles reserve, BTC deposits and every other state are not touched.
module {
  type Contact = {
    id : Nat;
    nickname : Text;
    principal : CorePrincipal.Principal;
    memo : ?Blob;
    createdAt : Int;
    updatedAt : Int;
  };

  type AddressBookStore = {
    owners : Map.Map<CorePrincipal.Principal, Map.Map<Nat, Contact>>;
    var nextId : Nat;
  };

  type OldActor = {};
  type NewActor = { addressBook : AddressBookStore };

  public func migration(_ : OldActor) : NewActor {
    {
      addressBook = {
        owners = Map.empty();
        var nextId = 0;
      };
    };
  };
};
