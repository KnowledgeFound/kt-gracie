import Result "mo:core/Result";
import Text "mo:core/Text";
import Int "mo:core/Int";

persistent actor City {
  public query func greet() : async Text {
    return "Hello from City!";
  };

  // public query func createSubject(name: Text, code: Text, duration: Int, description: Text) : async Result.Result<Text,Text>{
    
  // }
};