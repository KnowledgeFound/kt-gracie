import Result "mo:core/Result";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Types "../commons/types";

persistent actor City {

  var subjectIdCounter: Int = 0;

  public query func greet() : async Text {
    return "Hello from City!";
  };

  public func createSubject(subject: Types.Subject) : async Types.Subject{
    let newSubject: Types.Subject = {
      id = subjectIdCounter;
      name = subject.name;
      code = subject.code;
      duration = subject.duration;
      description = subject.description;
      assessments = subject.assessments;
    };

    subjectIdCounter := subjectIdCounter + 1;

    return newSubject;
  };
};