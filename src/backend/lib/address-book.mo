import Char "mo:core/Char";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Text "mo:core/Text";
import Types "../types/address-book";

module {
  public let MAX_CONTACTS : Nat = 200;
  public let MAX_NICKNAME_CHARS : Nat = 64;
  public let MAX_MEMO_BYTES : Nat = 32;

  public func listContacts(store : Types.AddressBookStore, owner : Principal) : [Types.Contact] {
    switch (store.owners.get(owner)) {
      case null { [] };
      case (?book) {
        book.values().toArray().sort(func(a, b) = a.nickname.toLower().compare(b.nickname.toLower()));
      };
    };
  };

  public func addContact(store : Types.AddressBookStore, owner : Principal, minting : Principal, input : Types.ContactInput, now : Int) : Result.Result<Types.Contact, Types.AddressBookError> {
    if (owner.isAnonymous()) return #err(#anonymous);
    let book = switch (store.owners.get(owner)) {
      case (?b) { b };
      case null { Map.empty<Types.ContactId, Types.Contact>() };
    };
    let nickname = switch (validate(book, owner, minting, input, null)) {
      case (#err(e)) { return #err(e) };
      case (#ok(n)) { n };
    };
    if (book.size() >= MAX_CONTACTS) return #err(#limitReached({ max = MAX_CONTACTS }));
    let contact : Types.Contact = {
      id = store.nextId;
      nickname;
      principal = input.principal;
      memo = input.memo;
      createdAt = now;
      updatedAt = now;
    };
    store.nextId += 1;
    book.add(contact.id, contact);
    store.owners.add(owner, book);
    #ok(contact);
  };

  public func updateContact(store : Types.AddressBookStore, owner : Principal, minting : Principal, id : Types.ContactId, input : Types.ContactInput, now : Int) : Result.Result<Types.Contact, Types.AddressBookError> {
    if (owner.isAnonymous()) return #err(#anonymous);
    let book = switch (store.owners.get(owner)) {
      case (?b) { b };
      case null { return #err(#notFound) };
    };
    let existing = switch (book.get(id)) {
      case (?c) { c };
      case null { return #err(#notFound) };
    };
    let nickname = switch (validate(book, owner, minting, input, ?id)) {
      case (#err(e)) { return #err(e) };
      case (#ok(n)) { n };
    };
    let updated : Types.Contact = {
      existing with
      nickname;
      principal = input.principal;
      memo = input.memo;
      updatedAt = now;
    };
    book.add(id, updated);
    #ok(updated);
  };

  public func deleteContact(store : Types.AddressBookStore, owner : Principal, id : Types.ContactId) : Result.Result<(), Types.AddressBookError> {
    if (owner.isAnonymous()) return #err(#anonymous);
    let book = switch (store.owners.get(owner)) {
      case (?b) { b };
      case null { return #err(#notFound) };
    };
    switch (book.take(id)) {
      case null { #err(#notFound) };
      case (?_) {
        if (book.isEmpty()) store.owners.remove(owner);
        #ok(());
      };
    };
  };

  // Every (owner, contact) pair, for the OQL entity.
  public func contactRows(store : Types.AddressBookStore) : Iter.Iter<(Principal, Types.Contact)> {
    let rows = List.empty<(Principal, Types.Contact)>();
    for ((owner, book) in store.owners.entries()) {
      for (contact in book.values()) {
        rows.add((owner, contact));
      };
    };
    rows.values();
  };

  // Returns the trimmed nickname when the input is valid.
  func validate(book : Map.Map<Types.ContactId, Types.Contact>, owner : Principal, minting : Principal, input : Types.ContactInput, editedId : ?Types.ContactId) : Result.Result<Text, Types.AddressBookError> {
    let nickname = input.nickname.trim(#predicate(func c = c.isWhitespace()));
    if (nickname.size() == 0) return #err(#invalidInput(#nicknameEmpty));
    if (nickname.size() > MAX_NICKNAME_CHARS) return #err(#invalidInput(#nicknameTooLong({ maxChars = MAX_NICKNAME_CHARS })));
    switch (input.memo) {
      case (?m) {
        if (m.size() > MAX_MEMO_BYTES) return #err(#invalidInput(#memoTooLong({ maxBytes = MAX_MEMO_BYTES })));
      };
      case null {};
    };
    let p = input.principal;
    if (p.isAnonymous() or p == owner or p == minting) return #err(#invalidInput(#principalNotAllowed));
    let lowered = nickname.toLower();
    for (c in book.values()) {
      if (?c.id != editedId and c.nickname.toLower() == lowered) return #err(#duplicateNickname);
    };
    #ok(nickname);
  };
};
