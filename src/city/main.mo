import Result "mo:core/Result";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:base/Nat";
import Types "../commons/types";

persistent actor City {

  public query func greet() : async Text {
    return "Hello from City!";
  };
  
};