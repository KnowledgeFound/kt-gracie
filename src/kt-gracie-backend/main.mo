import Types "../commons/types";
import Utils "../commons/utils";

persistent actor {
  public query func greet(name : Text) : async Text {
    let person : Types.person = { name = name; age = 30 };
    return Utils.greet() # person.name # "!";
  };
};
