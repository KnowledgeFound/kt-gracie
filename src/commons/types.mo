import Enums "./ENUMS";
import Int "mo:core/Int";
import Text "mo:core/Text";

module Types{

    public type person = {
        name: Text;
        age: Nat;
    };

    public type Subject = {
        id: Int;
        name: Text;
        code: Text;
        duration: Int; // Metric still has to be decided
        description: Text;
        assessments: [Assessment];
    };

    public type Assessment = {
        id: Int;
        title: Text;
        assessmentType: Enums.AssessmentType;
        maxScore: Nat;
        currentScore: Nat;
    };

    public type Content = {
        name: Text;
        contentType: Enums.ContentType;
    };

    

}