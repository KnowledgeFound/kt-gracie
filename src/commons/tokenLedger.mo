import Types "./types";
import Array "mo:base/Array";

// Pure token-ledger logic.
//
// These functions are deliberately free of `actor` / `async` so they can be
// unit-tested directly (see test/TokenLedger.test.mo). They take an Account in
// and return a new Account out — no shared mutable state. The backend actor is
// just a thin wrapper that stores whatever these functions return.
module TokenLedger {

  // A fresh account for a user that has never transacted.
  public func emptyAccount(userId : Text) : Types.Account {
    {
      userId = userId;
      balance = 0;
      transactions = [];
    };
  };

  public func getBalance(account : Types.Account) : Int {
    account.balance;
  };

  // Add tokens to the account and append a "system -> user" transaction.
  public func credit(account : Types.Account, amount : Nat, txType : Text, reference : ?Text, now : Int) : Types.Account {
    let tx : Types.Transaction = {
      from = "system";
      to = account.userId;
      amount = amount;
      txType = txType;
      reference = reference;
      createdAt = now;
    };
    {
      userId = account.userId;
      balance = account.balance + amount; // Nat is a subtype of Int, so this stays an Int
      transactions = Array.append(account.transactions, [tx]);
    };
  };

  // Remove tokens from the account and append a "user -> system" transaction.
  // The balance may go below zero — negative balances (debt) are allowed.
  public func debit(account : Types.Account, amount : Nat, txType : Text, reference : ?Text, now : Int) : Types.Account {
    let tx : Types.Transaction = {
      from = account.userId;
      to = "system";
      amount = amount;
      txType = txType;
      reference = reference;
      createdAt = now;
    };
    {
      userId = account.userId;
      balance = account.balance - amount;
      transactions = Array.append(account.transactions, [tx]);
    };
  };

}
