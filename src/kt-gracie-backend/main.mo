import Types "../commons/types";
import Utils "../commons/utils";
import TokenLedger "../commons/tokenLedger";
import Result "mo:core/Result";
import Text "mo:core/Text";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Time "mo:base/Time";

persistent actor Main {

  var arr_subjects : [Types.Subject] = [];

  transient let SUBJECT_SUCCESSFULLY_CREATED = "subject successfully created";
  transient let SUBJECT_NOT_CREATED = "subject not created";
  transient let BEGINNER = "Beginner";

  var subjectIdCounter: Nat = 0;

  public query func greet(name : Text) : async Text {
    let person : Types.person = { name = name; age = 30 };
    return Utils.greet() # person.name # "!";
  };

  private func addSubject(subject : Types.Subject) : async () {
    let buffer = Buffer.fromArray<Types.Subject>(arr_subjects);
    buffer.add(subject);
    arr_subjects := Buffer.toArray(buffer);
  };

  public query func getSubjectByCode(code : Text) : async ?Types.Subject {
    for (subject in arr_subjects.vals()) {
      if (subject.code == code) {
        return ?subject;
      };
    };

    return null;
  };

  public query func getSubjectById(id : Nat) : async ?Types.Subject {
    for (subject in arr_subjects.vals()) {
      if (subject.id == id) {
        return ?subject;
      };
    };

    return null;
  };

  public func createSubjectMediator(name : Text, code : Text, duration : Nat, description : Text) : async Result.Result<Text, Text> {
    try {

      let newSubject : Types.Subject = {
        id = subjectIdCounter;
        name = name;
        code = code;
        duration = duration;
        description = description;
        assessments = [];
      };

      subjectIdCounter := subjectIdCounter + 1;

      await addSubject(newSubject);

      return #ok(SUBJECT_SUCCESSFULLY_CREATED);
    } catch (err) {
      Debug.print("Unable to create subject: " # Error.message(err));
      return #err(SUBJECT_NOT_CREATED);
    };
  };

  public func testCreateSubject() : async Result.Result<Text, Text> {

    let name = "Software Engineering";
    let code = "COS301";
    let duration = 94;
    let description = "Stacey Barror";

    switch (await createSubjectMediator(name, code, duration, description)) {
      case (#ok(value)) {
        return #ok(value);
      };

      case (#err(err)) {
        return #err(err);
      };
    };
  };

  ///////////////////////// CORPUS FUNCTIONS /////////////////////////////////

  let defaultCorpus : Types.Corpus = {
    schema = "https://json-schema.org/draft/2020-12/schema";
    id = "https://knowledgefound.org/gracie/schemas/knowledge_unit.schema.json";
    title = "GRACIE 1.0 Knowledge Unit Corpus";
    description = "Canonical schema for the GRACIE 1.0 anti-corruption Q&A corpus. This is the single source of truth for corpus structure (ADR: OKF rejected as canonical format, 2026-06-19; single canonical representation with no separate authoring layer, 2026-07-09). The corpus is stored in the ICP asset canister, served via the query path, and processed entirely client-side. The canister grading endpoint consumes the same records for its answer key. Schema is Candid-alignable: all types map directly to Motoko records, variants, and Nat.";
    typeOfObject = "object";
    additionalProperties = false;
    numberOfModules = 5;
    numberOfAssessments = 10; // 2 assessments per module, 5 modules;
    knowledgeUnits = [
      {
        id = "KU-001";
        topic = "Anti-Corruption";
        difficulty = #EASY;
        audience = "Private Sector & Civil Society";
        prerequisites = [];
        level = BEGINNER;
        learningObjectives = [
          "Define corruption and its various forms.",
          "Understand the impact of corruption on society.",
          "Identify common examples of corrupt practices."
        ];
        expectations = [
          "Anti-Corruption Bodies & frameworks",
          "UNCAC principles and enforcement",
          "Whistleblower protection mechanisms",
          "Transparency and accountability in governance",
        ];
        image = "anti_corruption_img";
        description = "This knowledge unit provides an overview of corruption, its definitions, and its impact on society. It introduces learners to the concept of corruption, its various forms, and the importance of anti-corruption measures.";
        icon = "BookOpen";
        block = "leftUp";
        duration = "30 minutes";
        sources = [
          {
            id = 1;
            sourceType = #ARTICLE;
            detail = "What is Corruption?";
            url = ?("https://www.unodc.org/corruption/en/learn/what-is-corruption.html");
          }
        ];
        teachings = [
          {
            id = 1;
            topic = "What is Corruption?";
            ktMax = 10;
            difficulty = #EASY;
            duration = 30; // Duration in minutes
            keywords = ["corruption", "definition", "Introduction to Corruption"];
            sequenceNo = 1;
            content = {
              name = "What is Corruption?";
              contentType = #VIDEO;
              url = "https://www.unodc.org/corruption/en/learn/what-is-corruption.html";
              description = "An article by the United Nations Office on Drugs and Crime (UNODC) that provides a comprehensive overview of corruption, its forms, and its impact on society.";
            };
          }
        ];
        assessments = [
          {
            id = 1;
            maxScore = 7;
            pointScore = 1; // how much each answer to a question is worth
            ktMax = 10;
            duration = 30; // Duration in minutes
            difficulty = #EASY;
            sequenceNo = 2;
            quiz = ?{
              id = 1;
              assessmentType = #QUIZ;
              questions = [
                {
                  questionText = "What is the definition of corruption?";
                  options = ["Abuse of power for personal gain", "Honest behavior", "Transparency in government", "Accountability in public office"];
                  correctAnswerIndex = 0;
                  hint = ?("Think about the misuse of authority for personal benefit.");
                },
                {
                  questionText = "Which term describes offering money or gifts to influence the decision of an official?";
                  options = ["Whistleblowing", "Bribery", "Auditing", "Lobbying"];
                  correctAnswerIndex = 1;
                  hint = ?("Consider an illicit payment made under the table to secure a favorable outcome.");
                },
                {
                  questionText = "What is nepotism in a workplace or government setting?";
                  options = ["Hiring based strictly on merit", "Favoring relatives or friends regardless of qualifications", "Outsourcing work to external contractors", "Conducting anonymous performance reviews"];
                  correctAnswerIndex = 1;
                  hint = ?("It comes from the Latin word for 'nephew' and refers to family bias.");
                },
                {
                  questionText = "What is embezzlement?";
                  options = ["Stealing or misappropriating funds entrusted to your care", "Refusing to pay annual property taxes", "Failing to disclose political donations", "Accidentally misplacing government records"];
                  correctAnswerIndex = 0;
                  hint = ?("Focus on the violation of trust involving company or public money.");
                },
                {
                  questionText = "What is the main purpose of an independent anti-corruption agency?";
                  options = ["To manage national budget allocations", "To promote international trade partnerships", "To investigate and prevent corrupt practices without political interference", "To oversee municipal elections exclusively"];
                  correctAnswerIndex = 2;
                  hint = ?("Their core role is oversight, investigation, and enforcement free from outside control.");
                },
                {
                  questionText = "A government official uses insider knowledge to buy property before a highway route is announced. This is an example of what?";
                  options = ["Conflict of interest", "Freedom of information", "Public stewardship", "Civil disobedience"];
                  correctAnswerIndex = 0;
                  hint = ?("It occurs when personal interests collide with an official duty to the public.");
                },
                {
                  questionText = "What role does a 'whistleblower' play in combating corruption?";
                  options = ["Enforcing penalties on behalf of the judiciary", "Exposing illegal or unethical practices within an organization", "Drafting anti-bribery legislation", "Defending accused officials in court"];
                  correctAnswerIndex = 1;
                  hint = ?("They bring hidden misconduct into the light from the inside.");
                }
              ];
            };
            flashcard = null;
          },
          {
            id = 2;
            maxScore = 5;
            pointScore = 1; // how much each answer to a question is worth
            quiz = null;
            ktMax = 10;
            duration = 30;
            difficulty = #EASY;
            sequenceNo = 3;
            flashcard = ?{
              id = 1;
              assessmentType = #FLASHCARD;
              questions = [
                {
                  front = "What is corruption?";
                  back = "Corruption is the abuse of entrusted power for private gain.";
                  hint = ?("Think about the misuse of power for personal benefit.");
                },
                {
                  front = "What is bribery?";
                  back = "Bribery is offering, giving, receiving, or soliciting something of value to influence the actions of an official.";
                  hint = ?("It involves something of value exchanged to influence an official's actions.");
                },
                {
                  front = "What is nepotism?";
                  back = "Nepotism is favoritism granted to relatives or friends, often by giving them jobs.";
                  hint = ?("Think of favoritism toward family members or close friends.");
                },
                {
                  front = "What is embezzlement?";
                  back = "Embezzlement is the theft or misappropriation of funds placed in one's trust or belonging to one's employer.";
                  hint = ?("It is the misuse or theft of money entrusted to someone.");
                },
                {
                  front = "What is the role of an independent anti-corruption agency?";
                  back = "Its role is to investigate and prevent corruption without political interference.";
                  hint = ?("Focus on investigating and preventing corruption independently.");
                }
              ];
            };
          }
        ];
        tokenReward = 10;
        summary = {
          id = 1;
          sequenceNo = 4;
          inforgraphic = ?{
            name = "Corruption Overview";
            contentType = #INFORGRAPHIC;
            url = "https://www.unodc.org/documents/corruption/infographics/Corruption_Overview.png";
            description = "An infographic by the United Nations Office on Drugs and Crime (UNODC) that provides a visual summary of corruption, its forms, and its impact on society.";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
          };  
        };
      },
      {
        id = "KU-002";
        topic = "Policy";
        difficulty = #EASY;
        prerequisites = [];
        audience = "Government & Public Sector";
        level = BEGINNER;
        learningObjectives = [
          "Understand the policy development cycle.",
          "Map stakeholders and their influence.",
          "Apply evidence-based approaches to policy.",
          "Draft and evaluate policy briefs.",
          "Navigate public consultation processes."
        ];
        expectations = [
          "Policy fundamentals and cycles",
          "Stakeholder engagement strategies",
          "Evidence-based policy tools",
          "Writing effective policy briefs",
        ];
        image = "policy_img";
        description = "Explore the world of policy-making, including how policies are developed, implemented, and evaluated.";
        icon = "Target";
        block = "leftDown";
        duration = "2 hours";
        sources = [
          {
            id = 1;
            sourceType = #ARTICLE;
            detail = "What is Corruption?";
            url = ?("https://www.unodc.org/corruption/en/learn/what-is-corruption.html");
          }
        ];
        teachings = [];
        assessments = [];
        tokenReward = 10;
        summary = {
          id = 1;
          sequenceNo = 1;
          inforgraphic = ?{
            name = "Corruption Overview";
            contentType = #INFORGRAPHIC;
            url = "https://www.unodc.org/documents/corruption/infographics/Corruption_Overview.png";
            description = "An infographic by the United Nations Office on Drugs and Crime (UNODC) that provides a visual summary of corruption, its forms, and its impact on society.";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
          };  
        };
      },
      {
        id = "KU-003";
        topic = "Youth Led";
        difficulty = #EASY;
        prerequisites = [];
        audience = "Young People & Communities";
        level = BEGINNER;
        learningObjectives = [
          "Identify youth-led advocacy strategies.",
          "Build community engagement campaigns.",
          "Understand governance and civic participation.",
          "Develop peer-education skills.",
          "Apply design thinking to social problems."
        ];
        expectations = [
          "Youth governance and civic action",
          "Community campaign design",
          "Peer education methodologies",
          "Digital advocacy tools",
        ];
        image = "youth_led_img";
        description = "Discover the power of youth-led initiatives and how young people are driving change in their communities.";
        icon = "Users";
        block = "central";
        duration = "2 hours";
        sources = [
          {
            id = 1;
            sourceType = #ARTICLE;
            detail = "What is Corruption?";
            url = ?("https://www.unodc.org/corruption/en/learn/what-is-corruption.html");
          }
        ];
        teachings = [];
        assessments = [];
        tokenReward = 10;
        summary = {
          id = 1;
          sequenceNo = 1;
          inforgraphic = ?{
            name = "Corruption Overview";
            contentType = #INFORGRAPHIC;
            url = "https://www.unodc.org/documents/corruption/infographics/Corruption_Overview.png";
            description = "An infographic by the United Nations Office on Drugs and Crime (UNODC) that provides a visual summary of corruption, its forms, and its impact on society.";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
          };  
        };
      },
      {
        id = "KU-004";
        topic = "Digital Innovation";
        difficulty = #EASY;
        prerequisites = [];
        level = BEGINNER;
        audience = "Tech & Civil Society";
        learningObjectives = [
          "Understand AI, open data and civic tech.",
          "Apply digital ethics principles.",
          "Build technology-enabled solutions.",
          "Evaluate digital transformation strategies.",
          "Navigate data privacy regulations."
        ];
        expectations = [
          "Emerging technologies overview",
          "AI & Society impacts",
          "Digital ethics and governance",
          "Civic technology applications",
        ];
        image = "digital_innovation_img";
        description = "Delve into digital innovation and learn about the latest technologies and trends shaping our future.";
        icon = "Lightbulb";
        block = "rightUp";
        duration = "2 hours";
        sources = [
          {
            id = 1;
            sourceType = #ARTICLE;
            detail = "What is Corruption?";
            url = ?("https://www.unodc.org/corruption/en/learn/what-is-corruption.html");
          }
        ];
        teachings = [];
        assessments = [];
        tokenReward = 10;
        summary = {
          id = 1;
          sequenceNo = 1;
          inforgraphic = ?{
            name = "Corruption Overview";
            contentType = #INFORGRAPHIC;
            url = "https://www.unodc.org/documents/corruption/infographics/Corruption_Overview.png";
            description = "An infographic by the United Nations Office on Drugs and Crime (UNODC) that provides a visual summary of corruption, its forms, and its impact on society.";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
          };  
        };
      },
      {
        id = "KU-005";
        topic = "Community";
        difficulty = #EASY;
        prerequisites = [];
        audience = "Local Leaders & NGOs";
        level = BEGINNER;
        learningObjectives = [
          "Understand community development principles.",
          "Facilitate inclusive participation.",
          "Design community monitoring systems.",
          "Apply conflict-resolution techniques.",
          "Build sustainable local coalitions."
        ];
        expectations = [
          "Emerging technologies overview",
          "AI & Society impacts",
          "Digital ethics and governance",
          "Civic technology applications",
        ];
        image = "community_img";
        description = "Connect with others and learn about the importance of community engagement and development.";
        icon = "Globe";
        block = "rightDown";
        duration = "2 hours";
        sources = [
          {
            id = 1;
            sourceType = #ARTICLE;
            detail = "What is Corruption?";
            url = ?("https://www.unodc.org/corruption/en/learn/what-is-corruption.html");
          }
        ];
        teachings = [];
        assessments = [];
        tokenReward = 10;
        summary = {
          id = 1;
          sequenceNo = 1;
          inforgraphic = ?{
            name = "Corruption Overview";
            contentType = #INFORGRAPHIC;
            url = "https://www.unodc.org/documents/corruption/infographics/Corruption_Overview.png";
            description = "An infographic by the United Nations Office on Drugs and Crime (UNODC) that provides a visual summary of corruption, its forms, and its impact on society.";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
          };  
        };
      }
    ];
  };

  public query func getCorpus() : async Types.Corpus {
    return defaultCorpus;
  };


  ///////////////////////// ASSESSMENT FUNCTIONS /////////////////////////////
  // How to use:
  // let exam : AssessmentType = #EXAM;
  // public type AssessmentType = {
  //   #EXAM;
  //   #QUIZ;
  //   #ASSIGNMENT;
  // };
  // public type Assessment = {
  //   title : Text;
  //   assessmentType : AssessmentType;
  //   maxScore : Nat;
  //   currentScore : Nat;
  // };

  /**
   * Assessment functions are used to manage the assessments for each subject.
   * They allow you to add, get, update and delete assessments for a subject.
   * The assessments are stored in an array and can be accessed by their id.
   * The id is the index of the assessment in the array.
   * The getAssessmentFrom function allows you to get a range of assessments from the array.
   * This is useful for pagination.
   */
  var arr_assessments : [Types.Assessment] = [];

  /**
  * Add assessment
  */
  public func addAssessment(assessment : Types.Assessment) : async (Bool) {
    let buffer = Buffer.fromArray<Types.Assessment>(arr_assessments);
    buffer.add(assessment);
    arr_assessments := Buffer.toArray(buffer);
    // more improvement is needed here to handle errors and return a more meaningful response
    // return #ok('assessment successfully added');
    return (true);
  };

  /**
  * Get all assessment
  */
  public query func getAssessment() : async [Types.Assessment] {
    return arr_assessments;
  };

  /**
  * Get assessment by ID
  */
  public query func getAssessmentById(id : Nat) : async ?Types.Assessment {
    if (id < arr_assessments.size()) {
      return ?arr_assessments[id];
    };
    return null;
  };

  /**
  * Update assessment by ID
  */
  public func updateAssessment(id : Nat, updated : Types.Assessment) : async Bool {
    if (id < arr_assessments.size()) {
      let buffer = Buffer.fromArray<Types.Assessment>(arr_assessments);
      buffer.put(id, updated);
      arr_assessments := Buffer.toArray(buffer);
      return true;
    };
    return false;
  };

  /**
  * Delete assessment by ID
  */
  public func deleteAssessment(id : Nat) : async Bool {
    if (id < arr_assessments.size()) {
      let buffer = Buffer.fromArray<Types.Assessment>(arr_assessments);
      ignore buffer.remove(id);
      arr_assessments := Buffer.toArray(buffer);
      return true;
    };
    return false;
  };

  /**
  * Get assessment from a specific range (offset and limit) for pagination purposes
  */
  public query func getAssessmentFrom(offset : Nat, limit : Nat) : async [Types.Assessment] {
    let size = arr_assessments.size();
    if (offset >= size) {
      return [];
    };
    let end = if (offset + limit <= size) offset + limit else size;
    var results : [Types.Assessment] = [];
    var i : Nat = offset;
    while (i < end) {
      results := Array.append(results, [arr_assessments[i]]);
      i += 1;
    };
    return results;
  };

  ///////////////////////// TOKEN FUNCTIONS /////////////////////////////
  /**
  * Per-user token accounts, keyed by the user's anonymousId.
  *
  * All balance/transaction logic lives in the pure TokenLedger module so it can
  * be unit-tested without a replica (see test/TokenLedger.test.mo). The methods
  * below are thin wrappers: load the account, hand it to TokenLedger, store the
  * result back.
  *
  * NOTE: the account is keyed by the client-supplied anonymousId, so this is
  * identity-by-convention, not by authentication — every caller currently shares
  * the anonymous principal. Replace the key with `msg.caller` once Internet
  * Identity lands.
  */
  var arr_accounts : [Types.Account] = [];

  // Find a user's account by anonymousId.
  private func findAccount(userId : Text) : ?Types.Account {
    for (account in arr_accounts.vals()) {
      if (account.userId == userId) {
        return ?account;
      };
    };
    return null;
  };

  // Return the user's existing account, or a fresh empty one.
  private func resolveAccount(userId : Text) : Types.Account {
    switch (findAccount(userId)) {
      case (?account) { account };
      case null { TokenLedger.emptyAccount(userId) };
    };
  };

  // Insert or replace an account, keyed by userId.
  private func upsertAccount(updated : Types.Account) : () {
    let buffer = Buffer.fromArray<Types.Account>(arr_accounts);
    var found = false;
    var i : Nat = 0;
    for (account in arr_accounts.vals()) {
      if (account.userId == updated.userId) {
        buffer.put(i, updated);
        found := true;
      };
      i += 1;
    };
    if (not found) {
      buffer.add(updated);
    };
    arr_accounts := Buffer.toArray(buffer);
  };

  /**
  * Credit tokens to a user. Returns the new balance.
  */
  public func credit(userId : Text, amount : Nat, txType : Text, reference : ?Text) : async Int {
    let updated = TokenLedger.credit(resolveAccount(userId), amount, txType, reference, Time.now());
    upsertAccount(updated);
    return updated.balance;
  };

  /**
  * Debit tokens from a user. The balance may go negative (debt allowed).
  * Returns the new balance.
  */
  public func debit(userId : Text, amount : Nat, txType : Text, reference : ?Text) : async Int {
    let updated = TokenLedger.debit(resolveAccount(userId), amount, txType, reference, Time.now());
    upsertAccount(updated);
    return updated.balance;
  };

  /**
  * Get a user's current balance. Defaults to 0 for an unknown user.
  */
  public query func getBalance(userId : Text) : async Int {
    return TokenLedger.getBalance(resolveAccount(userId));
  };

  /**
  * Get a user's full transaction history (most-recent appended last).
  */
  public query func getTransactions(userId : Text) : async [Types.Transaction] {
    return resolveAccount(userId).transactions;
  };

  
  /////////////////////////HELPER FUNCTIONS/////////////////////////////
  public query func getNumberOfSubjects() : async Nat {
    return arr_subjects.size();
  };

  //PLEASE REMOVE IN PRODCUTION!///
  public query func getSubjectArray() : async [Types.Subject] {
    return arr_subjects;
  };


  /**
  * Create a token account for a user. Idempotent:
  * returns `false` if the user already has an account, `true` if a fresh
  * empty account was created. Called once after registration.
  */
  public func createAccount(userId : Text) : async Bool {
    switch (findAccount(userId)) {
      case (?_) { false };
      case null {
        upsertAccount(TokenLedger.emptyAccount(userId));
        true;
      };
    };
  };
};
