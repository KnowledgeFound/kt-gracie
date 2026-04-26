import Enums "./ENUMS";

module Types{

    public type person = {
        name: Text;
        age: Nat;
    };

    public type Subject = {
        name: Text;
        code: Text;
        assessments: [Assessment];
    };

    public type Assessment = {
        title: Text;
        assessmentType: Enums.AssessmentType;
        maxScore: Nat;
        currentScore: Nat;
    };

}