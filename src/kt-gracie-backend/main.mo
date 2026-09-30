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

  transient let defaultCorpus : Types.Corpus = {
    schema = "https://json-schema.org/draft/2020-12/schema";
    id = "https://knowledgefound.org/gracie/schemas/knowledge_unit.schema.json";
    title = "GRACIE 1.0 Knowledge Unit Corpus";
    description = "Canonical schema for the GRACIE 1.0 anti-corruption Q&A corpus. This is the single source of truth for corpus structure (ADR: OKF rejected as canonical format, 2026-06-19; single canonical representation with no separate authoring layer, 2026-07-09). The corpus is stored in the ICP asset canister, served via the query path, and processed entirely client-side. The canister grading endpoint consumes the same records for its answer key. Schema is Candid-alignable: all types map directly to Motoko records, variants, and Nat.";
    typeOfObject = "object";
    additionalProperties = false;
    lastUpdated = "2026-09-30T00:30:00Z";
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
              detailedDesciption = "";
            };
            knowledgeUnitId = "KU-001";
          }
        ];
        assessments = [
          {
            id = 1;
            maxScore = 5;
            pointScore = 1; // how much each answer to a question is worth
            ktMax = 10;
            duration = 30; // Duration in minutes
            difficulty = #EASY;
            sequenceNo = 2;
            knowledgeUnitId = "KU-001";
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
            knowledgeUnitId = "KU-001";
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
            detailedDesciption = "";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDesciption = "";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
            detailedDesciption = "";
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
            detailedDesciption = "";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDesciption = "";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
            detailedDesciption = "";
          };  
        };
      },
      {
        id = "KU-003";
        topic = "Youth Led";
        difficulty = #NORMAL;
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
            detail = "UNODC'S INTEGRITY YOUTH ADVISORY BOARD";
            url = ?("https://grace.unodc.org/grace/en/youth-empowerment/YouthLED.html");
          }
        ];
        teachings = [
          {
            id = 1;
            topic = "The Architect's blue print";
            difficulty = #EASY;
            knowledgeUnitId = "KU-003";
            keywords = [
              "Culture of Integrity",
              "Three Elements of Corruption",
              "UNCAC",
              "GRACE Initiative",
              "Offence Classifications"
            ];
            content = {
              name = "The Architect's blue print";
              contentType = #VIDEO;
              url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
              detailedDesciption = "The core message of The Architect's Blueprint is that tackling corruption 
              requires a structured, strategic, and informed methodology rather than isolated efforts, positioning young people as key 
              architects of transparent, ethical, and accountable institutions. Through this content, students are expected to gain a 
              thorough understanding of international legal frameworks like the United Nations Convention against Corruption, while 
              learning to analyze specific manifestations of corrupt behavior such as bribery, embezzlement, and nepotism. The material 
              equips learners with practical skills to conduct stakeholder mapping and political economy analyses, enabling them to identify 
              local institutional vulnerabilities and power dynamics. Furthermore, students learn to integrate human rights, gender equality, 
              and inclusive design principles into civic initiatives, culminating in actionable strategies for planning, executing, and monitoring safe, 
              measurable community-level anti-corruption projects.";
              description = "Short introduction into YouthLed Anti-Corruption initiatives";
            };
            ktMax = 10;
            duration = 10;
            sequenceNo = 1;
          },
          {
            id = 2;
            topic = "Youth Led Toolkit II - Steps 1 through 5";
            difficulty = #NORMAL;
            knowledgeUnitId = "KU-003";
            keywords = [
              "Culture of Integrity",
              "Three Elements of Corruption",
              "UNCAC",
              "GRACE Initiative",
              "Offence Classifications"
            ];
            content = {
              name = "Youth Led Toolkit II - Steps 1 through 5";
              contentType = #VIDEO;
              url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
              detailedDesciption = "The core message of Building a Youth-Led Anti-Corruption Initiative is that laying a solid, well-researched foundation 
              is essential for young advocates before launching civic integrity projects. The content focuses on the foundational five steps of the 
              UNODC YouthLED Toolkit, teaching students how to first educate themselves on global legal frameworks like the United Nations Convention 
              against Corruption and recognize distinct acts such as bribery, embezzlement, and abuse of functions. Learners are expected to analyze 
              how corrupt practices intersect with key societal issues—including human rights, gender equality, education, and climate change—and to 
              conduct local political economy analyses and community interviews. Furthermore, students learn to utilize human-centered design thinking 
              to frame community problems, anticipate operational risks, and apply creative offline and digital communication methods to effectively 
              engage their peers.";
              description = "In depth video on Youth Led Toolkit - Steps 1 through 5";
            };
            ktMax = 10;
            duration = 10;
            sequenceNo = 2;
          },
          {
            id = 3;
            topic = "Youth Led Toolkit III - Steps 6 through 10";
            difficulty = #NORMAL;
            knowledgeUnitId = "KU-003";
            keywords = [
              "Culture of Integrity",
              "Three Elements of Corruption",
              "UNCAC",
              "GRACE Initiative",
              "Offence Classifications"
            ];
            content = {
              name = "Youth Led Toolkit III - Steps 6 through 10";
              contentType = #VIDEO;
              url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
              detailedDesciption = "This video will take you into more detail on the YouthLed steps 6 through 10";
              description = "In depth video on Youth Led Toolkit - Steps 1 through 5";
            };
            ktMax = 10;
            duration = 10;
            sequenceNo = 4;
          }
        ];
        assessments = [
          {
            id = 1;
            maxScore = 5;
            pointScore = 1;
            flashcard = null;
            ktMax = 10;
            duration = 15;
            difficulty = #EASY;
            sequenceNo = 3;
            knowledgeUnitId = "KU-003";
            quiz = ?{
              id = 1;
              assessmentType = #QUIZ;
              questions = [
                {
                  questionText = "What is the only global legally binding framework to prevent and counter corruption?";
                  options = [
                    "Inter-American Convention against Corruption",
                    "United Nations Convention against Corruption (UNCAC)",
                    "African Union Convention",
                    "OECD Anti-Bribery Convention"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Adopted in 2003 with almost universal application across 190 States parties.";
                },
                {
                  questionText = "Which three core elements are present in a corrupt act according to Step 01?";
                  options = [
                    "Authority, Abuse, and Benefit",
                    "Money, Secrecy, and Power",
                    "Fraud, Politics, and Extortion",
                    "Greed, Impunity, and Neglect"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Someone holds power, abuses that power, and obtains an undue advantage.";
                },
                {
                  questionText = "According to the 2022 \"Be Seen Be Heard\" campaign survey, what percentage of young people believe in a better future?";
                  options = [
                    "45 per cent",
                    "52 per cent",
                    "67 per cent",
                    "80 per cent"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"15-to-17-year-olds were found to be the most optimistic group.";
                },
                {
                  questionText = "Which Sustainable Development Goal (SDG) focuses on ensuring inclusive and equitable quality education?";
                  options = [
                    "SDG 3",
                    "SDG 4",
                    "SDG 8",
                    "SDG 16"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Highlighted in Step 02 as a sector vulnerable to corruption's \"breeding ground\" effect.";
                },
                {
                  questionText = "Which 2022 scandal in Malaysia involved the misappropriation of national development funds, including funds designated for climate change mitigation?";
                  options = [
                    "Petrobras Scandal",
                    "1MDB Scandal",
                    "Watergate Scandal",
                    "Siemens Procurement Case"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Discussed in Step 02 under the climate change focus area.";
                },
                {
                  questionText = "In Step 03, what does a Political Economy Analysis (PEA) examine in a society?";
                  options = [
                    "Stock market fluctuations",
                    "How political and economic processes distribute power and wealth",
                    "Foreign trade tariffs",
                    "Election voter turnout"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Provides a \"close-up lens\" to contextualize local corruption dynamics.";
                },
                {
                  questionText = "In a human-rights-based approach (Step 02), who holds the primary moral and legal obligation as \"duty bearers\"?";
                  options = [
                    "Individual citizens",
                    "Governments and public authorities",
                    "Non-profit organizations",
                    "International donors"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Rights holders are individuals, while duty bearers must respect, protect, and fulfill rights.";
                },
                {
                  questionText = "What slogan was displayed on the Banksy-style street stencil highlighted as an innovative artistic example in Step 05?";
                  options = [
                    "\"Silence is Compliance\"",
                    "\"Keep your coins, I want change\"",
                    "\"Power to the People\"",
                    "\"Stop Corruption Now\""
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Demonstrates street art as a creative medium for youth outreach in Step 05.";
                },
                {
                  questionText = "Which artificial intelligence capability helps financial investigators detect potential fraud schemes in Step 02?";
                  options = [
                    "Anomaly detection in large datasets",
                    "Facial recognition in public spaces",
                    "Automated speech translation",
                    "Graphic design generation"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Mentioned under AI applications in anti-corruption in Step 02.";
                },
                {
                  questionText = "How does corruption in education act as a \"breeding ground\" for corruption across broader society?";
                  options = [
                    "It increases the cost of textbooks",
                    "It normalizes fraudulent practices early and replaces meritocracy with the \"ability to pay\"",
                    "It reduces school operating hours",
                    "It forces schools to close early"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Highlighted in Step 02 under the education thematic focus.";
                }
              ];
            };
          },
          {
            id = 2;
            maxScore = 5;
            pointScore = 1;
            quiz = null;
            ktMax = 10;
            duration = 15;
            difficulty = #EASY;
            sequenceNo = 5;
            knowledgeUnitId = "KU-003";
            flashcard = ?{
              id = 1;
              assessmentType = #FLASHCARD;
              questions = [
                {
                  front = "What is UNODC?";
                  back = "The United Nations Office on Drugs and Crime, which established the YouthLED Integrity Advisory Board to empower young people in global anti-corruption efforts.";
                  hint = ?("Think of the main UN body responsible for crime prevention and drug control.");
                },
                {
                  front = "What are the three core elements present in a corrupt act?";
                  back = "1. Authority (someone holds power), 2. Abuse (misuse of that power), and 3. Benefit (obtaining undue advantage).";
                  hint = ?("Focus on power, misuse, and gain.");
                },
                {
                  front = "What is the definition of Integrity?";
                  back = "Behaving ethically and choosing to do what is right according to moral principles, even when no one is watching.";
                  hint = ?("Think about doing the right thing independently of rules.");
                },
                {
                  front = "What is Trading in Influence?";
                  back = "The corrupt act where an intermediary exchanges their personal or position-based influence for an undue advantage.";
                  hint = ?("Consider someone using connections to secure a favor.");
                },
                {
                  front = "Which Sustainable Development Goal (SDG) focuses on Quality Education?";
                  back = "SDG 4, which aims to ensure inclusive and equitable quality education and promote lifelong learning opportunities.";
                  hint = ?("Think about the number assigned to education goals in the 2030 Agenda.");
                },
                {
                  front = "What is the core slogan of the disability rights movement?";
                  back = "\"Nothing about us without us,\" emphasizing that persons with disabilities must be involved in decisions affecting them.";
                  hint = ?("Focus on self-representation and participation.");
                },
                {
                  front = "What is Step 1 of the 10-Step Anti-Corruption Initiative Roadmap?";
                  back = "Educate Yourself: Learn core concepts, national frameworks, international laws (UNCAC), and intersectional topics.";
                  hint = ?("Think about the foundational step before launching any project.");
                },
                {
                  front = "What is a Power-Influence Grid?";
                  back = "A 2x2 matrix categorizing stakeholders by power and influence into 4 quadrants: Manage Closely, Keep Satisfied, Keep Informed, Monitor.";
                  hint = ?("Think about mapping stakeholders based on their impact.");
                },
                {
                  front = "Why is Collective Action safer than acting alone?";
                  back = "Operating as a group raises the political and social cost for corrupt actors attempting to retaliate or punish advocates.";
                  hint = ?("Consider safety in numbers.");
                },
                {
                  front = "What is the difference between Quantitative and Qualitative impact data?";
                  back = "Quantitative data tracks numerical counts (how many participants/reports), while Qualitative data explains how and why changes occurred.";
                  hint = ?("Think of numbers versus stories/experiences.");
                }
              ];
            };
          }
        ];
        tokenReward = 10;
        summary = {
          id = 1;
          sequenceNo = 6;
          inforgraphic = ?{
            name = "Youth-Led Anti-Corruption Action Guide Inforgraphic";
            contentType = #INFORGRAPHIC;
            url = "https://notebooklm.link.google/A0J8if9BCDbL";
            description = "Youth-Led Anti-Corruption Action Guide Inforgraphic";
            detailedDesciption = "";
          };
          slideDeck = ?{
            name = "Youth-Led Anti-Corruption Action Guide Slide Deck";
            contentType = #SLIDEDECK;
            url = "https://notebooklm.link.google/5Qy09Xg0a4nb";
            description = "Youth-Led Anti-Corruption Action Guide Slide Deck";
            detailedDesciption = "";
          };
          podcast = ?{
            name = "Youth-Led Anti-Corruption Action Guide Podcast";
            contentType = #PODCAST;
            url = "https://notebooklm.link.google/sUf9D347Cf6q";
            description = "Youth-Led Anti-Corruption Action Guide Podcast";
            detailedDesciption = "";
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
            detailedDesciption = "";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDesciption = "";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
            detailedDesciption = "";
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
            detailedDesciption = "";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDesciption = "";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
            detailedDesciption = "";
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
