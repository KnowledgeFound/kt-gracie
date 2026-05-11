import Result "mo:core/Result";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:base/Nat";
import Types "../commons/types";

persistent actor City {

  var subjectIdCounter: Nat = 0;

  public query func greet() : async Text {
    return "Hello from City!";
  };

  public func createSubject(name: Text, code: Text, duration: Nat, description: Text) : async Types.Subject{
    let newSubject: Types.Subject = {
      id = subjectIdCounter;
      name = name;
      code = code;
      duration = duration;
      description = description;
      assessments = [];
    };

    subjectIdCounter := subjectIdCounter + 1;

    return newSubject;
  };
};