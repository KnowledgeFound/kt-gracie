import Types "../commons/types";
import Utils "../commons/utils";
import Result "mo:core/Result";
import Text "mo:core/Text";
import Buffer "mo:base/Buffer";

persistent actor {

  var arr_subjects : [Types.Subject] = [];

  public query func greet(name : Text) : async Text {
    let person : Types.person = { name = name; age = 30 };
    return Utils.greet() # person.name # "!";
  };

  private func addSubject(subject: Types.Subject) : async () {
    let buffer = Buffer.fromArray<Types.Subject>(arr_subjects);
    buffer.add(subject);
    arr_subjects := Buffer.toArray(buffer);
  };
};
