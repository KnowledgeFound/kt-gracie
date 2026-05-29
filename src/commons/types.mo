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

    

}