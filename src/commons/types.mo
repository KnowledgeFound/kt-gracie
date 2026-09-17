import Text "mo:core/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

import Enums "ENUMS";

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

    // A single token movement.
    // Convention: a credit is { from = "system"; to = userId }, a debit is
    // { from = userId; to = "system" }. `reference` optionally points at the
    // source artifact that triggered the movement (e.g. an assessmentId or
    // contentId) so the token history can show where a token came from.
    public type Transaction = {
        from: Text;
        to: Text;
        amount: Nat;
        txType: Text;       // category, e.g. "reward" | "spend" | "assessment" | "content"
        reference: ?Text;   // optional source id (assessmentId / contentId)
        createdAt: Int;     // nanoseconds since epoch (Time.now())
    };

    // A user's token account, keyed by their anonymousId.
    // `balance` is an Int (not Nat) because negative balances are allowed for
    // now — a debit may take the balance below zero (debt is fine).
    public type Account = {
        userId: Text;       // the user's anonymousId
        balance: Int;
        transactions: [Transaction];
    };

    public type Corpus = {
        schema: Text;
        id: Text;
        title: Text;
        description: Text;
        typeOfObject: Text;
        additionalProperties: Bool;
        knowledgeUnits: [KnowledgeUnit];
        numberOfModules: Nat;
        numberOfAssessments: Nat;
    };

    public type KnowledgeUnit = {
        id: Text;
        topic: Text;
        difficulty: Enums.Difficulty; 
        learningObjectives: [Text];
        duration: Text; // e.g. "30 minutes", "1 hour", "2 hours"
        prerequisites: [Text]; // List of Knowledge Unit IDs
        sources: [Source];
        teachings: [Teaching];
        assessments: [Assessment];
        tokenReward: Nat;
        summary: SummarySection;
    };

    public type Source = {
        id: Nat;
        sourceType: Enums.SourceType;
        detail: Text;
        url: ?Text;
    };

    public type Teaching = {
        id: Nat;
        topic: Text;
        difficulty: Enums.Difficulty;
        keywords: [Text];
        content: Content;
    };

    public type Content = {
        name: Text;
        contentType: Enums.ContentType;
        url: Text;
        description: Text;
    };

    public type SummarySection = {
        id: Nat;
        inforgraphic: ?Content;
        slideDeck: ?Content;
        podcast: ?Content;
    };

    // An assessment can be either a quiz or a flashcard set.
    public type Assessment = {
        id: Nat;
        maxScore: Nat;
        pointScore: Nat;
        quiz: ?Quiz;
        flashcard: ?Flashcard;
    };

    public type Quiz = {
        id: Nat;
        assessmentType: {#QUIZ};
        questions: [QuizQuestion];
    };

    public type QuizQuestion = {
        questionText: Text;
        options: [Text];
        correctAnswerIndex: Nat;
        hint: ?Text;
    };

    public type Flashcard = {
        id: Nat;
        assessmentType: {#FLASHCARD};
        questions: [FlashCardQuestion];
    };

    public type FlashCardQuestion = {
        front: Text;
        back: Text;
        hint: ?Text;
    };




}