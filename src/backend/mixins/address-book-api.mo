import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Types "../types/address-book";
import AddressBookLib "../lib/address-book";

// Private per-principal address book. Anonymous callers are rejected; a
// caller only reads and modifies their own contacts. `canister` is the TTTI-T
// minting account owner, which cannot be saved as a contact.
mixin (addressBook : Types.AddressBookStore, canister : Principal) {
  public shared query ({ caller }) func listMyContacts() : async Result.Result<[Types.Contact], Types.AddressBookError> {
    if (caller.isAnonymous()) return #err(#anonymous);
    #ok(AddressBookLib.listContacts(addressBook, caller));
  };

  public shared ({ caller }) func addContact(input : Types.ContactInput) : async Result.Result<Types.Contact, Types.AddressBookError> {
    AddressBookLib.addContact(addressBook, caller, canister, input, Time.now());
  };

  public shared ({ caller }) func updateContact(id : Types.ContactId, input : Types.ContactInput) : async Result.Result<Types.Contact, Types.AddressBookError> {
    AddressBookLib.updateContact(addressBook, caller, canister, id, input, Time.now());
  };

  public shared ({ caller }) func deleteContact(id : Types.ContactId) : async Result.Result<(), Types.AddressBookError> {
    AddressBookLib.deleteContact(addressBook, caller, id);
  };
};
