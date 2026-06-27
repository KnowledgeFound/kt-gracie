import TokenLedger "../src/commons/tokenLedger";
import TestRunner "./TestRunner";
import Debug "mo:base/Debug";

// Unit tests for the pure token-ledger logic.
// Run with: mops test

Debug.print("TokenLedger");
let t = TestRunner.Runner();

// A brand-new account starts empty.
let empty = TokenLedger.emptyAccount("user-1");
t.equalInt("empty account balance is 0", TokenLedger.getBalance(empty), 0);
t.check("empty account has no transactions", empty.transactions.size() == 0);

// Crediting increases the balance and records a "system -> user" transaction.
let afterCredit = TokenLedger.credit(empty, 100, "reward", ?"assessment-COS301-quiz3", 1000);
t.equalInt("credit 100 -> balance 100", afterCredit.balance, 100);
t.check("credit appends one transaction", afterCredit.transactions.size() == 1);
t.check("credit tx is from system", afterCredit.transactions[0].from == "system");
t.check("credit tx is to the user", afterCredit.transactions[0].to == "user-1");
t.check("credit tx keeps the reference", afterCredit.transactions[0].reference == ?"assessment-COS301-quiz3");
t.check("credit tx keeps the txType", afterCredit.transactions[0].txType == "reward");

// Debiting reduces the balance and records a "user -> system" transaction.
let afterDebit = TokenLedger.debit(afterCredit, 30, "spend", null, 2000);
t.equalInt("debit 30 -> balance 70", afterDebit.balance, 70);
t.check("debit appends a second transaction", afterDebit.transactions.size() == 2);
t.check("debit tx is from the user", afterDebit.transactions[1].from == "user-1");
t.check("debit tx has no reference", afterDebit.transactions[1].reference == null);

// Debiting past zero is allowed — negative balances (debt) are fine for now.
let afterOverdraft = TokenLedger.debit(afterDebit, 100, "spend", null, 3000);
t.equalInt("debit below zero is allowed", afterOverdraft.balance, -30);

// The original account is never mutated (pure functions return new values).
t.equalInt("original empty account is untouched", empty.balance, 0);

t.done();
