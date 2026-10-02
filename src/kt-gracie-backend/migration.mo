import Enums "../commons/ENUMS";

/// One-time migration: `defaultCorpus` used to be a stable variable holding
/// the seed corpus. It is now `transient` (recomputed from the literal in
/// main.mo on every init/upgrade instead of being persisted), so an upgrade
/// from a canister that still has it in stable memory must explicitly drop
/// it — otherwise the compiler refuses the upgrade to avoid silently losing
/// stable data.
///
/// NOT CURRENTLY WIRED IN. It already ran once against the local canister
/// (see git history around 2026-09-30), which no longer has `defaultCorpus`
/// in stable memory — reapplying it there fails with "the previous program
/// version does not contain the stable variable defaultCorpus". Any other
/// environment that still has it stable (for example a not-yet-upgraded `ic`
/// deployment — check with `dfx canister --network ic metadata
/// kt-gracie-backend motoko:stable-types`) will need this migration
/// reinstated for exactly one deploy:
///   import Migration "migration";
///   (with migration = Migration.run)
///   persistent actor Main { ... }
/// then removed again once that canister is upgraded.
///
/// The type below is a frozen snapshot of `Types.Corpus` as it was in the
/// last deployed build (from `dfx canister metadata … motoko:stable-types`),
/// not the current `commons/types.mo`. It must NOT be swapped for a live
/// import: `Content` here predates the `detailedDesciption` field, and any
/// future field added to the live types would make this migration reject a
/// perfectly fine upgrade. If `Types.Corpus` changes again before this
/// migration ships, leave this snapshot as-is — it only describes what the
/// old canister actually had.
///
/// Every other stable variable (arr_subjects, arr_assessments, arr_accounts,
/// subjectIdCounter) is untouched by this migration and carries over as-is.
module {
  type Content_old = {
    name : Text;
    contentType : Enums.ContentType;
    url : Text;
    description : Text;
  };

  type SummarySection_old = {
    id : Nat;
    sequenceNo : Nat;
    inforgraphic : ?Content_old;
    slideDeck : ?Content_old;
    podcast : ?Content_old;
  };

  type Teaching_old = {
    id : Nat;
    topic : Text;
    difficulty : Enums.Difficulty;
    keywords : [Text];
    content : Content_old;
    ktMax : Nat;
    duration : Nat;
    sequenceNo : Nat;
  };

  type Source_old = {
    id : Nat;
    sourceType : Enums.SourceType;
    detail : Text;
    url : ?Text;
  };

  type QuizQuestion_old = {
    questionText : Text;
    options : [Text];
    correctAnswerIndex : Nat;
    hint : ?Text;
  };

  type Quiz_old = {
    id : Nat;
    assessmentType : { #QUIZ };
    questions : [QuizQuestion_old];
  };

  type FlashCardQuestion_old = {
    front : Text;
    back : Text;
    hint : ?Text;
  };

  type Flashcard_old = {
    id : Nat;
    assessmentType : { #FLASHCARD };
    questions : [FlashCardQuestion_old];
  };

  type Assessment_old = {
    id : Nat;
    maxScore : Nat;
    pointScore : Nat;
    quiz : ?Quiz_old;
    flashcard : ?Flashcard_old;
    ktMax : Nat;
    duration : Nat;
    difficulty : Enums.Difficulty;
    sequenceNo : Nat;
  };

  type KnowledgeUnit_old = {
    id : Text;
    topic : Text;
    difficulty : Enums.Difficulty;
    learningObjectives : [Text];
    expectations : [Text];
    image : Text;
    description : Text;
    icon : Text;
    block : Text;
    duration : Text;
    prerequisites : [Text];
    sources : [Source_old];
    teachings : [Teaching_old];
    assessments : [Assessment_old];
    tokenReward : Nat;
    summary : SummarySection_old;
    audience : Text;
    level : Text;
  };

  type Corpus_old = {
    schema : Text;
    id : Text;
    title : Text;
    lastUpdated : Text;
    description : Text;
    typeOfObject : Text;
    additionalProperties : Bool;
    knowledgeUnits : [KnowledgeUnit_old];
    numberOfModules : Nat;
    numberOfAssessments : Nat;
  };

  public func run(
    _old : {
      defaultCorpus : Corpus_old;
    }
  ) : {} = {};
};
