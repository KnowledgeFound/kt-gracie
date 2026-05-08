import Types "../commons/types";
import Utils "../commons/utils";
import Result "mo:core/Result";
import Text "mo:core/Text";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import City "canister:city";

persistent actor {

  var arr_subjects : [Types.Subject] = [];

  transient var SUBJECT_SUCCESSFULLY_CREATED = "subject successfully created";
  transient var SUBJECT_NOT_CREATED = "subject not created";

  public query func greet(name : Text) : async Text {
    let person : Types.person = { name = name; age = 30 };
    return Utils.greet() # person.name # "!";
  };

  private func addSubject(subject: Types.Subject) : async () {
    let buffer = Buffer.fromArray<Types.Subject>(arr_subjects);
    buffer.add(subject);
    arr_subjects := Buffer.toArray(buffer);
  };

  public query func getSubjectByCode(code: Text) : async ?Types.Subject {
    for(subject in arr_subjects.vals()){
      if(subject.code == code){
        return ?subject;
      };
    };

    return null;
  };

  public query func getSubjectById(id: Int) : async ?Types.Subject {
    for(subject in arr_subjects.vals()){
      if(subject.id == id){
        return ?subject;
      };
    };

    return null;
  };

  public func createSubjectMediator(subject: Types.Subject) : async Result.Result<Text,Text> {
    try{
      let newSubject = await City.createSubject(subject);
    
      await addSubject(newSubject);

      return #ok(SUBJECT_SUCCESSFULLY_CREATED);
    }
    catch(err){
      Debug.print("Unable to create subject: " # Error.message(err));
      return #err(SUBJECT_NOT_CREATED);
    }
  };

  public func testCreateSubject() : async Result.Result<Text,Text> {
    let subject : Types.Subject = {
      id = 1;
      name = "Compiler Construction";
      code = "COS341";
      duration = 84;
      description = "Stephan Grunner";
      assessments = [];
    };

    switch (await createSubjectMediator(subject)) {
      case (#ok(value)) {
        return #ok(value);
      };

      case (#err(err)) {
        return #err(err);
      };
    };
  };

  /////////////////////////HELPER FUNCTIONS/////////////////////////////
  public query func  getNumberOfSubjects() : async Nat {
    return arr_subjects.size();
  };

  //PLEASE REMOVE IN PRODCUTION!///
  public query func getSubjectArray() : async [Types.Subject] {
    return arr_subjects;
  };
};
