import Text "mo:core/Text";
import Nat "mo:base/Nat";

module Types{

    public type person = {
        name: Text;
        age: Nat;
    };

    public type Subject = {
        id: Nat;
        name: Text;
        code: Text;
        duration: Nat; // Metric still has to be decided
        description: Text;
        assessments: [Assessment];
    };

    public type Assessment = {
        id: Nat;
        title: Text;
        assessmentType: Text;
        maxScore: Nat;
        currentScore: Nat;
    };

    public type Content = {
        name: Text;
        contentType: Text;
    };

    // A single token movement.
    // Convention: a credit is { from = "system"; to = userId }, a debit is
    // { from = userId; to = "system" }. `reference` optionally points at the
    // source artifact that triggered the movement (e.g. an assessmentId or
    // contentId) so the token history can show where a token came from.
    public type Transaction = {
        from: Text;
        to: Text;
        amount: Nat;
        txType: Text;       // category, e.g. "reward" | "spend" | "assessment" | "content"
        reference: ?Text;   // optional source id (assessmentId / contentId)
        createdAt: Int;     // nanoseconds since epoch (Time.now())
    };

    // A user's token account, keyed by their anonymousId.
    // `balance` is an Int (not Nat) because negative balances are allowed for
    // now — a debit may take the balance below zero (debt is fine).
    public type Account = {
        userId: Text;       // the user's anonymousId
        balance: Int;
        transactions: [Transaction];
    };

}