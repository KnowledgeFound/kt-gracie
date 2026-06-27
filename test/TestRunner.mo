import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

// A minimal home-grown test runner.
//
// A unit-test framework is really just three things:
//   1. run each assertion,
//   2. tally pass/fail,
//   3. report — and fail the process if anything failed.
// That's all this does. `check` records a boolean result; `equalInt` is a
// convenience that also prints the expected/actual values; `done` prints a
// summary and traps if any check failed (mops test reports a trap as failure).
module {

  public class Runner() {
    var passed : Nat = 0;
    var failed : Nat = 0;

    public func check(name : Text, condition : Bool) {
      if (condition) {
        passed += 1;
        Debug.print("  PASS  " # name);
      } else {
        failed += 1;
        Debug.print("  FAIL  " # name);
      };
    };

    public func equalInt(name : Text, actual : Int, expected : Int) {
      check(
        name # " (expected " # debug_show (expected) # ", got " # debug_show (actual) # ")",
        actual == expected,
      );
    };

    public func done() {
      Debug.print("-----------------------------------------");
      Debug.print(Nat.toText(passed) # " passed, " # Nat.toText(failed) # " failed");
      if (failed > 0) {
        Debug.trap("Test suite failed: " # Nat.toText(failed) # " failing check(s)");
      };
    };
  };

}
