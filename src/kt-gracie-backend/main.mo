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
    lastUpdated = "2026-10-25T23:24:00Z";
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
            url = ?("https://grace.unodc.org/grace/uploads/documents/academics/Anti-Corruption_Module_1_What_Is_Corruption_and_Why_Should_We_Care.pdf");
          },
          {
            id = 2;
            sourceType = #ARTICLE;
            detail = "University Module series on Anti-Corruption";
            url = ?("https://grace.unodc.org/grace/academia/module-series-on-anti-corruption.html?lf_id=");
          }
        ];
        teachings = [
          {
            id = 0;
            topic = "Welcome to the Anti-Corruption Module!";
            ktMax = 10;
            difficulty = #EASY;
            duration = 2; // Duration in minutes
            keywords = [
              "Anti-Corruption", "definition", "Introduction to Corruption", 
            ];
            sequenceNo = 1;
            content = {
              name = "Welcome to the Anti-Corruption Module!";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit1/anti_corruption_intro.mp4";
              detailedDescription = "A welcome message from GRACIE";
              description = "Welcome message from GRACIE to the Anti-Corruption module";
            };
            knowledgeUnitId = "KU-001";
          },
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
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit1/Introduction__The_Scale_of_Decay.mp4";
              detailedDescription = "In this introductory video, students will gain a foundational understanding of corruption as one of 
              the central global challenges of the 21st century. The lesson begins by examining baseline meanings of corruption 
              rooted in decay, debasement, and departure from integrity, then explores how international legal frameworks like 
              the **United Nations Convention against Corruption (UNCAC)** criminalise specific offences—such as bribery, 
              embezzlement, trading in influence, abuse of functions, illicit enrichment, and money-laundering—rather 
              than applying a single restrictive definition. Students will compare classic public-office definitions, 
              such as the World Bank's \"use of public office for private gain,\" with broader frameworks covering the 
              private sector, such as Transparency International's \"abuse of entrusted power for private gain.\" 
              Finally, the video breaks down the scales and typologies of corrupt behaviour, helping students differentiate 
              between **petty corruption**, **grand corruption**, and systemic **state capture**.";
              description = "This video provides an overview of corruption, its definitions, and its impact on society.";
            };
            knowledgeUnitId = "KU-001";
          },
          {
            id = 2;
            topic = "Why Do People Cheat the System? 5 Angles on Corruption";
            ktMax = 10;
            difficulty = #EASY;
            duration = 30; // Duration in minutes
            keywords = ["Anti-Corruption", "definition", "Introduction to Corruption", "philosophy", "economics", "politics"];
            sequenceNo = 2;
            content = {
              name = "The Root Causes: How Philosophy, Economics and Politics Explain Corruption";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit1/Submodule_1_The_Corruption_Glitch__Debugging_the_System.mp4";
              description = "This video explores the root causes of corruption through the lenses of philosophy, economics, and politics, providing students with a multidisciplinary understanding of why corruption occurs and how it can be addressed.";
              detailedDescription = "In this sub-module, students examine how different academic disciplines analyze the root 
              causes and motivations behind corruption. They begin with moral and philosophical views, studying classical 
              thinkers like Plato and Machiavelli who viewed corruption as a personal character vice and a loss of civic virtue 
              where self-interest displaces the common good. Moving to political science, the lesson illustrates how corrupt 
              practices erode political institutions, electoral processes, and democratic legitimacy by creating influence markets 
              where private wealth buys political access. Through an economic lens, students explore rational choice models 
              where actors weigh expected benefits against costs, the role of moral costs, and Susan Rose-Ackerman's focus on 
              redesigning institutional incentive structures. Students then examine the cultural debate between local informal 
              norms, such as gift-giving, and universal standards of integrity, while learning how elites can co-opt cultural 
              arguments to shield self-serving acts. Finally, the institutionalist perspective shifts the analytical focus from 
              punishing individual bad apples to reforming bad barrels—the distorted institutional setups that cause organizations 
              to deviate from their proper public purpose.";
            };
            knowledgeUnitId = "KU-001";
          },
          {
            id = 3;
            topic = "Corruption in Real Life: Global Consequences and Measuring the Damage";
            ktMax = 10;
            difficulty = #EASY;
            duration = 30; // Duration in minutes
            keywords = ["Anti-Corruption", "definition", "philosophy", "Consequences of Corruption", "Damage"];
            sequenceNo = 4;
            content = {
              name = "Corruption in Real Life: Global Consequences and Measuring the Damage";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit1/Submodule_2_The_Glitch_in_the_System.mp4";
              description = "This video explores the root causes of corruption through the lenses of philosophy, economics, and politics, providing students with a multidisciplinary understanding of why corruption occurs and how it can be addressed.";
              detailedDescription = "In Part 3, students explore the tangible consequences of corruption and the tools researchers use 
              to measure its prevalence across society. The lesson begins by assessing corruption's 
              global impact on the Sustainable Development Goals—specifically SDG 16—and demonstrates 
              how corrupt practices drive massive economic losses, worsen poverty and inequality, 
              degrade public services, and trigger dangerous infrastructure failures. Students also 
              examine how corruption fuels broader security threats, including organized crime, 
              human rights violations, and environmental destruction. The video then transitions 
              to measurement methodologies, comparing direct evidence-based approaches—such as official 
              crime statistics and personal bribery surveys—with indirect composite indices like the 
              Corruption Perceptions Index and the Index of Public Integrity. Finally, students learn about 
              innovative detection strategies, including experimental bribery games, public expenditure tracking 
              studies, and crowdsourced reporting platforms that allow citizens to expose corrupt acts in real time.";
            };
            knowledgeUnitId = "KU-001";
          }
        ];
        assessments = [
          {
            id = 1;
            maxScore = 10;
            pointScore = 1; // how much each answer to a question is worth
            ktMax = 10;
            duration = 30; // Duration in minutes
            difficulty = #EASY;
            sequenceNo = 3;
            knowledgeUnitId = "KU-001";
            quiz = ?{
              id = 1;
              assessmentType = #QUIZ;
              questions = [
                {
                  questionText = "Moral Vibe Check: Back in the day, how did classical moral philosophers actually define corruption on a personal level?";
                  options = [
                    "As a boring clerical error in tax paperwork",
                    "As an optimal market equilibrium where supply meets demand",
                    "As a character flaw or personal vice, like extreme greed or selling out",
                    "As a technical violation of maritime shipping regulations"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Think about old-school virtues and personal vices like greed or selling out your morals.";
                },
                {
                  questionText = "Ancient Drama: When Athens put Socrates on trial for supposedly 'corrupting the youth,' what were they actually mad about?";
                  options = [
                    "Him ghosting the city council group chat",
                    "Him going rogue and disrespecting traditional Athenian customs and beliefs",
                    "Him running a multi-level marketing scheme",
                    "Him hacking the local olive oil supply chain"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"For the Athenians, virtue meant staying totally loyal to traditional community customs.";
                },
                {
                  questionText = "Politica & Power: How does shady political corruption completely wreck free elections and government institutions?";
                  options = [
                    "By totally automating government tasks using AI",
                    "By creating zero market distortions or economic bubbles",
                    "By guaranteeing that only hyper-qualified civil servants get hired",
                    "By rigging elections, buying votes, and paying back shady campaign backers"
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"Think about how secret campaign debt and rigged rules destroy democratic fairness.";
                },
                {
                  questionText = "Democracy vs. Plutocracy: According to political scientist Karl-Heinz Nassmacher, what's the core difference between a democracy and a plutocracy?";
                  options = [
                    "Democracy is powered by equal participation of everyday people, while plutocracy is run by filthy rich elites",
                    "Democracy relies entirely on stock market trends, while plutocracy uses central command planning",
                    "Democracy bans private companies from existing, while plutocracy relies on them",
                    "Democracy uses vibes-based surveys, while plutocracy uses hard data"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Consider how letting extreme wealth buy political power completely ruins equal representation.";
                },
                {
                  questionText = "The Economics Hustle: According to economist Gary Becker's 1968 rational choice model, why do people actually decide to do shady, corrupt stuff?";
                  options = [
                    "Because they have a totally different biological brain structure than law-abiding folks",
                    "Because they are forced by ancient cultural traditions to break laws",
                    "Because the expected payout or benefit feels higher than the risk of getting caught and punished",
                    "Because they have zero comprehension of basic math or financial risk"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Rational choice theory is all about weighing the bag against the penalty.";
                },
                {
                  questionText = "The Guilt Tax: In economic models of corruption, what does the term 'moral costs' actually refer to?";
                  options = [
                    "The internal cringe and guilt you feel when you betray your own values or ethics",
                    "The actual legal fines handed down by a judge in court",
                    "The expensive fees you pay to hire external compliance auditors",
                    "The lawyer fees needed to file a civil lawsuit"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Think about the psychological toll of going against your own moral compass.";
                },
                {
                  questionText = "Culture Check: How do researchers studying anti-corruption define 'culture' in their studies?";
                  options = [
                    "As the official legal code written down by government lawmakers",
                    "As a nation's total gross domestic product (GDP)",
                    "As the average literacy rate of government workers",
                    "As the dominant shared beliefs, attitudes, and everyday behaviors of a society"
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"Focus on collective social habits, community traditions, and shared norms.";
                },
                {
                  questionText = "The Culture Trap: What major warning do anti-corruption experts like Rose-Ackerman and Palifka give about blaming everything on 'culture'?";
                  options = [
                    "That powerful elites can easily weaponize 'culture' as an excuse to get away with corruption",
                    "That studying culture will completely eliminate petty bribery overnight",
                    "That cultural perspectives force every single country to pass identical laws",
                    "That cultural values make online shopping impossible"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Watch out when wealthy elites use 'tradition' as a shield to protect their stolen gains.";
                },
                {
                  questionText = "System Failure: What is the main mindset shift that institutionalists recommend when analyzing corruption?";
                  options = [
                    "Switching focus entirely to dictionary definitions of legal terms",
                    "Replacing all government workers with automated chatbots",
                    "Shifting the focus from individual 'bad apples' to broken, rigged systems ('bad barrels')",
                    "Ignoring big corporate corruption and only focusing on small street bribes"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"It's less about a rogue individual and more about systemic setup flaws.";
                },
                {
                  questionText = "Rigged Referees: How do political scientists Steven Levitsky and Daniel Ziblatt explain state capture using a sports referee analogy?";
                  options = [
                    "Referees immediately kicking out any players who try to cheat",
                    "Corporations chipping in to fund public sports stadiums",
                    "Independent teams competing in a totally fair, transparent open market",
                    "Corrupt politicians colluding with neutral referees to rig the game and rewrite the rulebook in their favor"
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"Imagine the players literally controlling the refs so the rules always favor them."
              }];
            };
            flashcard = null;
          },
          {
            id = 2;
            maxScore = 10;
            pointScore = 1; // how much each answer to a question is worth
            quiz = null;
            ktMax = 10;
            duration = 30;
            difficulty = #EASY;
            sequenceNo = 5;
            knowledgeUnitId = "KU-001";
            flashcard = ?{
              id = 1;
              assessmentType = #FLASHCARD;
             questions = [
                {
                  front = "What is SDG 16, and why should you care about it?";
                  back = "SDG 16 is the UN's goal for 'Peace, Justice and Strong Institutions.' It includes targets 16.4, 16.5, and 16.6, which specifically aim to cut down corruption, recover stolen assets, and build transparent institutions. Basically, it's the global promise to make governments actually accountable.";
                  hint = ?("Think of the UN goal that's all about peace, justice, and institutions that actually work.");
                },
                {
                  front = "How much does bribery cost the world every year?";
                  back = "According to the IMF, bribery alone costs an estimated $1.5 to $2 trillion per year. That's about 2% of the entire global GDP — gone.";
                  hint = ?("It's roughly 2% of the world's total economic output.");
                },
                {
                  front = "How can corruption literally kill people? Think of what happens when buildings collapse or bridges fall.";
                  back = "When builders bribe their way past safety inspections or use cheap, weakened materials, buildings can collapse. Think of the 2018 Genoa bridge collapse or buildings that crumbled in the 2017 Mexico City earthquake. Corruption isn't just about money — it's about lives.";
                  hint = ?("Think about bridges falling or buildings collapsing during earthquakes.");
                },
                {
                  front = "What do truth commissions say about corruption's role in wars and conflicts?";
                  back = "Truth and Reconciliation Commissions in places like Sierra Leone, Liberia, and Tunisia found that corruption is a major driver of conflict. It weakens the state, fuels instability, and leads to serious human rights abuses.";
                  hint = ?("Look at what countries recovering from civil war have concluded.");
                },
                {
                  front = "What are 'direct methods' of measuring corruption?";
                  back = "Direct methods collect hard evidence of corruption — like official crime stats or surveys that ask people about their actual experiences with bribery. No opinions, just facts.";
                  hint = ?("These focus on real experiences and actual crime data, not what people think is happening.")  ;
                },
                {
                  front = "Why are perception-based corruption surveys often criticized?";
                  back = "They measure what people think or feel is happening, not what's actually happening. That means they can be wildly inaccurate, especially when media coverage blows things out of proportion.";
                  hint = ?("They capture vibes, not reality.");
                },
                {
                  front = "What is Transparency International's Corruption Perceptions Index (CPI)?";
                  back = "It's a 'survey of surveys' — a composite index that pulls together 13 data sources from 12 organizations to rank countries by how corrupt people perceive their public sector to be. It's the most well-known corruption ranking out there.";
                  hint = ?("It ranks countries globally by combining expert assessments and perception surveys.");
                },
                {
                  front = "How does the Index of Public Integrity (IPI) measure corruption without asking people's opinions?";
                  back = "The IPI uses six objective indicators: judicial independence, administrative burden, trade openness, budget transparency, e-citizenship, and freedom of the press. It's about structural risks, not feelings.";
                  hint = ?("It looks at things like press freedom and judicial independence instead of surveys.");
                },
                {
                  front = "What are some creative ways researchers actually observe corrupt behavior?";
                  back = "Two big ones: 'bribery games' — lab or field experiments where people simulate corrupt deals — and Public Expenditure Tracking Surveys (PETS), which follow public money to see if it actually reaches schools or clinics or gets stolen along the way.";
                  hint = ?("One is like a game, the other tracks whether money actually arrives where it's supposed to.");
                },
                {
                  front = "What is 'I Paid a Bribe.com' and why does it matter?";
                  back = "It's a crowdsourced website that started in India where regular people anonymously report bribes they've had to pay. It gives real-time, ground-level data on everyday corruption — the kind that never makes headlines.";
                  hint = ?("It's a citizen-run platform from India where people share their own bribery stories.");
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
            name = "Corruption Overview";
            contentType = #INFORGRAPHIC;
            url = "https://notebooklm.link.google/y9y4TeApMOSI";
            description = "An infographic by the United Nations Office on Drugs and Crime (UNODC) that provides a visual summary of corruption, its forms, and its impact on society.";
            detailedDescription = "";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://notebooklm.link.google/dZhKhAb3I8wJ";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDescription = "";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://notebooklm.link.google/ryimAgw6fnf9";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
            detailedDescription = "";
          };  
        };
      },
      {
        id = "KU-002";
        topic = "UN Convention Against Corruption";
        difficulty = #EASY;
        prerequisites = [];
        audience = "Government Officials & Policy Makers";
        level = BEGINNER;
        learningObjectives = [
          "Understand the key principles and provisions of UNCAC.",
          "Identify the obligations of state parties under UNCAC.",
          "Analyze case studies of UNCAC implementation.",
          "Evaluate the effectiveness of anti-corruption measures under UNCAC."
        ];
        expectations = [
          "UNCAC principles and enforcement",
          "State party obligations",
          "Case studies of UNCAC implementation",
          "Evaluation of anti-corruption measures"
        ];
        image = "policy_img";
        description = "This knowledge unit provides an overview of the United Nations Convention Against Corruption (UNCAC), its key principles, and the obligations of state parties. It introduces learners to the international legal framework for combating corruption and the mechanisms for monitoring and evaluating anti-corruption measures.";
        icon = "Target";
        block = "central";
        duration = "2 hours";
        sources = [
          {
            id = 1;
            sourceType = #ARTICLE;
            detail = "UN convention against Corruption (UNCAC)";
            url = ?("https://www.unodc.org/documents/brussels/UN_Convention_Against_Corruption.pdf");
          }
        ];
        teachings = [
          {
            id = 0;
            topic = "Welcome to the UN Convention Against Corruption Module!";
            ktMax = 10;
            difficulty = #EASY;
            duration = 2; // Duration in minutes
            keywords = [
              "Anti-Corruption", "definition", "Introduction to Corruption", 
            ];
            sequenceNo = 1;
            content = {
              name = "Welcome to the UN Convention Against Corruption Module!";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit2/UNCAC%20Intro.mp4"; // update later
              detailedDescription = "A welcome message from GRACIE";
              description = "Welcome message from GRACIE to the UN Convention Against Corruption module";
            };
            knowledgeUnitId = "KU-002";
          },
          {
            id = 1;
            topic = "What is the UN Convention Against Corruption?";
            ktMax = 10;
            difficulty = #EASY;
            duration = 30; // Duration in minutes
            keywords = ["corruption", "definition", "UN Convention Against Corruption", "UNCAC", "international legal framework"];
            sequenceNo = 1;
            content = {
              name = "What is the UN Convention Against Corruption?";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit2/Introduction_The_Ultimate_Anti-Cheat_Understanding_UNCAC.mp4";
              description = "An introduction to the UN Convention Against Corruption, its key principles, and the obligations of state parties.";
              detailedDescription = "The core message of this introductory module is that corruption is a global threat that 
              undermines democratic institutions, distorts markets, erodes public trust, and disproportionately harms vulnerable 
              communities by diverting vital public resources. Students are expected to learn the foundational purposes of the 
              United Nations Convention Against Corruption, focusing on how international legal standards promote integrity, 
              facilitate cross-border cooperation, and strengthen preventive measures. Furthermore, learners will master key legal 
              terminology established in Chapter I of the treaty—including precise definitions of public officials, foreign public 
              officials, property, and proceeds of crime—providing them with the essential knowledge required to understand how global 
              governance protects public wealth and upholds the rule of law.";
            };
            knowledgeUnitId = "KU-002";
          },
          {
            id = 2;
            topic = "Stopping Corruption and Defining Corrupt Acts";
            ktMax = 10;
            difficulty = #EASY;
            duration = 30; // Duration in minutes
            keywords = ["corruption", "definition", "UN Convention Against Corruption", "UNCAC", "international legal framework"];
            sequenceNo = 2;
            content = {
              name = "Stopping Corruption and Defining Corrupt Acts";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit2/Submodule_1_The_Multiplayer_City-Builder__Understanding_UNCAC.mp4";
              description = "This video explores the different acts of Corruption";
              detailedDescription = "The core message of this module is that effective anti-corruption strategies require a dual approach: building 
              proactive, transparent safeguards to stop corrupt practices before they occur, and establishing clear legal frameworks to criminalise and 
              prosecute corrupt acts. Students are expected to learn the fundamental preventive measures set out in Chapter II of the United Nations 
              Convention Against Corruption, including merit-based public recruitment, transparent procurement systems, codes of conduct for public 
              officials, and robust financial oversight. Additionally, learners will gain a comprehensive understanding of the core criminal offenses 
              established in Chapter III, such as active and passive bribery, embezzlement, trading in influence, abuse of functions, illicit enrichment, 
              and money-laundering, while recognizing the crucial role of legal protections for whistleblowers and citizens who report corruption in good faith.";
            };
            knowledgeUnitId = "KU-002";
          },
          {
            id = 3;
            topic = "Global Cooperation, Asset Recovery and Youth Action";
            ktMax = 10;
            difficulty = #EASY;
            duration = 30; // Duration in minutes
            keywords = ["corruption", "definition", "UN Convention Against Corruption", "UNCAC", "international legal framework"];
            sequenceNo = 4;
            content = {
              name = "Global Cooperation, Asset Recovery and Youth Action";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit2/submodule_2_Leveling_Up_Global_Justice.mp4";
              description = "This video explores the global cooperation, asset recovery and youth action in fighting corruption.";
              detailedDescription = "The core message of this module is that defeating international corruption requires strong cross-
              border partnerships to ensure criminals cannot hide stolen wealth abroad, alongside active civic engagement from informed 
              citizens. Students are expected to learn the primary mechanisms of international cooperation established in Chapter IV 
              of the United Nations Convention Against Corruption, including extradition, mutual legal assistance for gathering evidence, 
              and joint cross-border law enforcement investigations. Additionally, learners will explore the fundamental principles of 
              asset recovery under Chapter V, discovering how illicitly transferred funds are traced, frozen, and returned to original 
              countries to support public rehabilitation and development, while understanding how Article 13 empowers young people 
              and civil society through public transparency, access to information, and anti-corruption education.";
            };
            knowledgeUnitId = "KU-002";
          }
        ];
        assessments = [
          {
            id = 1;
            maxScore = 10;
            pointScore = 1; // how much each answer to a question is worth
            ktMax = 10;
            duration = 30; // Duration in minutes
            difficulty = #EASY;
            sequenceNo = 3;
            knowledgeUnitId = "KU-002";
            quiz = ?{
              id = 1;
              assessmentType = #QUIZ;
              questions = [
                {
                  questionText = "Under Article 7 of the UNCAC, what core principles should governments follow when hiring and promoting civil servants?";
                  options = [
                    "Family connections and personal recommendations",
                    "Seniority based strictly on age",
                    "Merit, efficiency, transparency, and objective aptitude criteria",
                    "Political party loyalty and campaign donations",
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Focus on fair, open hiring standards based on skills rather than favors.";
                },
                {
                  questionText = "Which principles does Article 9 of the UNCAC require for public procurement systems when governments buy goods or services?";
                  options = [
                    "Secret negotiations behind closed doors",
                    "Direct awarding of contracts without public notice",
                    "Exclusive preference for foreign corporations",
                    "Transparency, competition, and objective decision-making criteria",
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"Think about how open competition and clear rules stop corrupt deal-making.";
                },
                {
                  questionText = "To prevent private sector corruption under Article 12, what practice does the UNCAC explicitly require countries to ban?";
                  options = [
                    "Maintaining off-the-books accounts and using false bookkeeping documents",
                    "Hiring independent financial auditors",
                    "Publishing annual profit and loss statements",
                    "Offering competitive salaries to executive staff",
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Look for sneaky accounting tricks used to hide secret transactions or bribes.";
                },
                {
                  questionText = "How does Article 15 of the UNCAC define bribery involving national public officials?";
                  options = [
                    "Any legal contribution made to a political campaign during election season",
                    "Only transactions involving foreign diplomatic personnel",
                    "Both promising/giving (active) and soliciting/accepting (passive) an undue advantage to influence official actions",
                    "Only when cash is physically handed over inside a government building",
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Bribery covers both sides of the deal—offering a perk or asking for one to influence a duty.";
                },
                {
                  questionText = "What constitutes embezzlement or misappropriation by a public official under Article 17 of the UNCAC?";
                  options = [
                    "Failing to attend mandatory workplace training sessions",
                    "Expressing personal political views outside of working hours",
                    "Investing personal savings in foreign stock markets",
                    "The diversion or theft of public or private funds or property entrusted to an official",
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"Think of an official stealing or redirecting funds that were placed in their care for work.";
                },
                {
                  questionText = "What defines the crime of 'trading in influence' under Article 18 of the UNCAC?";
                  options = [
                    "Selling government-owned property through an open public auction",
                    "Abusing real or supposed influence over a public authority to get an undue advantage in exchange for a benefit",
                    "Trading stocks on a public stock exchange using published news reports",
                    "Advocating publicly for new environmental legislation",
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"This happens when someone sells their special access or influence over officials for a bribe.";
                },
                {
                  questionText = "What is 'abuse of functions' as established in Article 19 of the UNCAC?";
                  options = [
                    "An official intentionally performing or failing to perform an act in violation of laws to gain an undue advantage",
                    "Taking an extended lunch break without supervisor approval",
                    "Resigning from a civil service position to take a private sector job",
                    "Publishing academic research that criticizes public policy",
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"It occurs when an official deliberately breaks the rules on the job to get an improper benefit.";
                },
                {
                  questionText = "According to Article 20 of the UNCAC, what is 'illicit enrichment'?";
                  options = [
                    "Earning compound interest on a standard bank savings account",
                    "Receiving an official salary increase approved by parliament",
                    "Inheriting documented family property with full tax compliance",
                    "A significant increase in a public official's assets that cannot be reasonably explained relative to their lawful income",
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"Focus on when an official suddenly becomes way wealthier than their legal salary explains.";
                },
                {
                  questionText = "Under Article 23 of the UNCAC, what is the primary objective of money-laundering offences?";
                  options = [
                    "Transferring legal salary into a local credit union account",
                    "Converting or concealing property derived from crime to disguise its illegal origin",
                    "Paying international customs tariffs electronically",
                    "Exchanging cash for foreign currency at an airport kiosk",
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Consider how criminals try to make 'dirty' crime money look like clean, legal income.";
                },
                {
                  questionText = "How does Article 33 of the UNCAC protect whistleblowers (reporting persons)?";
                  options = [
                    "By offering total immunity for any past crimes they may have committed",
                    "By paying them a direct percentage of all recovered corrupt funds",
                    "By providing legal protection against unjustified treatment when reporting corruption in good faith and on reasonable grounds",
                    "By requiring them to post their findings publicly on social media",
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Think about keeping people safe from retaliation when they speak up in good faith.";
                },
              ];
            };
            flashcard = null;
          },
          {
            id = 2;
            maxScore = 10;
            pointScore = 1; // how much each answer to a question is worth
            quiz = null;
            ktMax = 10;
            duration = 30;
            difficulty = #EASY;
            sequenceNo = 5;
            knowledgeUnitId = "KU-002";
            flashcard = ?{
              id = 1;
              assessmentType = #FLASHCARD;
             questions = [
                {
                  front = "What is Extradition under Article 44 of the UNCAC?";
                  back = "Extradition is the formal legal process where one country surrenders a suspect or convicted offender to another country so they can face trial or serve a sentence for corruption offences.";
                  hint = ?("Think about moving a criminal suspect across international borders to stand trial.");
                },
                {
                  front = "How does Mutual Legal Assistance (MLA) work under Article 46 of the UNCAC?";
                  back = "Mutual Legal Assistance allows countries to request and share legal help across borders, such as taking witness statements, gathering evidence, serving court documents, and freezing illicit financial accounts.";
                  hint = ?("Focus on how law enforcement agencies from different countries share evidence and official information.");
                },
                {
                  front = "What is a 'Joint Investigation' as encouraged by Article 49 of the UNCAC?";
                  back = "A joint investigation is an agreement where law enforcement authorities from two or more countries establish a combined team to investigate complex, cross-border corruption cases together.";
                  hint = ?("Imagine law enforcement officers from different nations teaming up on the same case.");
                },
                {
                  front = "Why is Asset Recovery described as a 'fundamental principle' in Chapter V (Article 51) of the UNCAC?";
                  back = "Chapter V establishes that returning stolen public assets to their country of origin is a core obligation, ensuring stolen wealth cannot be safely hidden abroad.";
                  hint = ?("Think about sending stolen national wealth back to the citizens it was taken from.");
                },
                {
                  front = "According to Article 52 of the UNCAC, how must financial institutions handle high-value accounts?";
                  back = "Banks must verify customer identities, identify beneficial owners, and conduct enhanced scrutiny on accounts held by prominent public officials (PEPs) to spot suspicious transfers of illicit funds.";
                  hint = ?("Consider how banks double-check high-profile accounts to spot hidden or suspicious wealth.");
                },
                {
                  front = "What measures does Article 53 of the UNCAC require for the direct recovery of stolen property?";
                  back = "Article 53 requires countries to enable foreign States to initiate civil lawsuits in their courts to establish ownership of stolen property or claim compensation for damage caused by corruption.";
                  hint = ?("Think about one government taking legal action directly in a foreign court to reclaim its property.");
                },
                {
                  front = "What is the rule for returning confiscated public funds under Article 57 of the UNCAC?";
                  back = "Confiscated funds—especially embezzled public wealth—must be returned to the requesting State or prior legitimate owners so the resources can support national development and public services.";
                  hint = ?("Focus on how reclaimed stolen funds are returned to benefit public services and community recovery.");
                },
                {
                  front = "How does Article 13 of the UNCAC involve civil society and young citizens in anti-corruption efforts?";
                  back = "Article 13 mandates that governments actively promote the participation of non-governmental organizations, community groups, and citizens by boosting transparency and encouraging public monitoring.";
                  hint = ?("Think about the role of ordinary citizens, youth groups, and NGOs in keeping governments accountable.");
                },
                {
                  front = "What does Article 13 of the UNCAC specify regarding anti-corruption education?";
                  back = "Article 13 directs States to conduct public awareness campaigns and integrate anti-corruption education into school and university curricula to foster a culture of integrity.";
                  hint = ?("Consider how learning about honesty and ethics in school or university helps prevent corrupt behavior.");
                },
                {
                  front = "Why is protecting access to public information crucial under Article 13 of the UNCAC?";
                  back = "Protecting the freedom to seek, receive, publish, and report information empowers citizens and journalists to expose corrupt activities and hold public officials accountable.";
                  hint = ?("Focus on how open government records and free reporting keep corrupt acts from staying hidden.");
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
            name = "Anti-Corruption Overview";
            contentType = #INFORGRAPHIC;
            url = "https://notebooklm.link.google/B2vOEpygMJtp";
            description = "An infographic by the United Nations Office on Drugs and Crime (UNODC) that provides a visual summary of corruption, its forms, and its impact on society.";
            detailedDescription = "";
          };
          slideDeck = ?{
            name = "Understanding Anti-Corruption";
            contentType = #SLIDEDECK;
            url = "https://notebooklm.link.google/mKZ5sz9LSvUa";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDescription = "";
          };
          podcast = ?{
            name = "The Anti-Corruption Podcast";
            contentType = #PODCAST;
            url = "https://notebooklm.link.google/BjTpHYA1eWdK";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
            detailedDescription = "";
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
        block = "leftDown";
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
            id = 0;
            topic = "Welcome to the Youth Led Module!";
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
              name = "Welcome to the Youth Led Module!";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit3/Youth-led%20Intro.mp4";
              detailedDescription = "A welcome message from GRACIE";
              description = "Welcome message from GRACIE to the YouthLed module";
            };
            ktMax = 10;
            duration = 2;
            sequenceNo = 0;
          },
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
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit3/Introduction__The_Architect_s_Blueprint.mp4";
              detailedDescription = "The core message of The Architect's Blueprint is that tackling corruption 
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
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit3/Submodule_1__Building_a_Youth-Led_Anti-Corruption_Initiative.mp4";
              detailedDescription = "The core message of Building a Youth-Led Anti-Corruption Initiative is that laying a solid, well-researched foundation 
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
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit3/Submodule_2_The_Implementation_Pipeline__Building_an_Anti-Corruption_Ecosys.mp4";
              detailedDescription = "The core message of **The Implementation Pipeline: Building an Anti-Corruption Ecosystem** focuses on guiding young advocates through 
              the practical transition from an anti-corruption concept to safe, inclusive, and effective real-world action. Students are expected to learn how to 
              **identify and engage strategic allies**, embed **human rights and inclusive design**—such as gender sensitivity and disability accessibility—into their projects, 
              and navigate sensitive environments by prioritizing **personal safety, whistle-blower protections, and risk management**. Additionally, the content equips learners to 
              **educate and mobilize their communities**, execute concrete initiatives like civic monitoring or integrity clubs, and systematically **measure and evaluate their 
              impact** to foster a lasting culture of transparency and accountability.";
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
            maxScore = 10;
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
            maxScore = 10;
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
            detailedDescription = "";
          };
          slideDeck = ?{
            name = "Youth-Led Anti-Corruption Action Guide Slide Deck";
            contentType = #SLIDEDECK;
            url = "https://notebooklm.link.google/5Qy09Xg0a4nb";
            description = "Youth-Led Anti-Corruption Action Guide Slide Deck";
            detailedDescription = "";
          };
          podcast = ?{
            name = "Youth-Led Anti-Corruption Action Guide Podcast";
            contentType = #PODCAST;
            url = "https://notebooklm.link.google/sUf9D347Cf6q";
            description = "Youth-Led Anti-Corruption Action Guide Podcast";
            detailedDescription = "";
          };  
        };
      },
      {
        id = "KU-004";
        topic = "Digital Innovation and Social Entrepreneurship";
        difficulty = #EASY;
        prerequisites = [];
        level = BEGINNER;
        audience = "Tech & Civil Society";
        learningObjectives = [
          "Explore emerging technologies and their societal impacts.",
          "Understand digital ethics and governance.",
          "Learn about civic technology applications.",
          "Develop skills for digital innovation and social entrepreneurship."
        ];
        expectations = [
          "Understanding digital Innovation and Social Entrepreneurship",
          "AI & Society impacts",
          "Digital ethics and governance",
          "Civic technology applications",
        ];
        image = "digital_innovation_img";
        description = "Delve into digital innovation and learn about the latest technologies and trends shaping our future.";
        icon = "Lightbulb";
        block = "rightUp";
        duration = "1 hours";
        sources = [
          {
            id = 1;
            sourceType = #ARTICLE;
            detail = "DIGITAL INNOVATION & SOCIAL ENTREPRENEURSHIP";
            url = ?("https://grace.unodc.org/grace/en/youth-empowerment/digital-innovation.html");
          }
        ];
        teachings = [
          {
            id = 0;
            topic = "Welcome to the Digital Innovation and Social Entrepreneurship Module!";
            difficulty = #EASY;
            knowledgeUnitId = "KU-004";
            keywords = [
              "digital innovation",
              "social entrepreneurship",
              "civic technology",
              "digital ethics"
            ];
            content = {
              name = "Welcome to the Digital Innovation and Social Entrepreneurship Module!";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit4/Digital%20innovation%20Intro.mp4";
              detailedDescription = "A welcome message from GRACIE";
              description = "Welcome message from GRACIE to the Digital Innovation and Social Entrepreneurship module";
            };
            ktMax = 10;
            duration = 2;
            sequenceNo = 0;
          },
          {
            id = 1;
            topic = "Introduction to Digital Innovation and Social Entrepreneurship";
            difficulty = #EASY;
            keywords = [
              "digital innovation",
              "social entrepreneurship",
              "civic technology",
              "digital ethics"
            ];
            content = {
              name = "Introduction to Digital Innovation and Social Entrepreneurship";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit4/Level_Up_Your_World__The_GRACE_Initiative.mp4";
              description = "Explore digital innovation and social entrepreneurship through the UNODC GRACE Initiative.";
              detailedDescription = "**Digital innovation** and **Social entrepreneurship** are framed around **youth empowerment** 
              and **investing in young people's interest in using technology to strengthen business integrity** and 
              combat corruption. Through initiatives such as the **GRACE Initiative** and regional **Coding4Integrity** 
              youth anti-corruption hackathons, the UNODC leverages technology and entrepreneurial problem-solving to engage young 
              innovators directly in developing integrity solutions.";
            };
            ktMax = 10;
            duration = 15;
            sequenceNo = 1;
            knowledgeUnitId = "KU-004";
          },
          {
            id = 3;
            topic = "Code4Integrity Hackathons";
            difficulty = #EASY;
            keywords = [
              "digital innovation",
              "social entrepreneurship",
              "civic technology",
              "digital ethics"
            ];
            content = {
              name = "Code4Interity Hackathons";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit4/Coding4Integrity__The_Glitch_Fixers.mp4";
              description = "Explore the Code4Integrity Hackathons and how they empower youth to develop technology-driven solutions for integrity and social change.";
              detailedDescription = "Sponsored by the **UN Office on Drugs and Crime (UNODC)**, the **Coding4Integrity Hackathons** are a global competition series bringing 
              together young developers and innovators to tackle corruption using technology. With editions held across regions such as Brazil, Mexico, Hong Kong, and 
              South Africa, the initiative channels youth technical enthusiasm into strengthening business integrity and accountability. Competing across specialised 
              focus areas such as Artificial Intelligence and Decentralised Commerce, participants take on the core objective of developing creative digital tools that 
              advance anti-corruption education, transparency, and public integrity.";
            };
            ktMax = 10;
            duration = 15;
            sequenceNo = 2;
            knowledgeUnitId = "KU-004";
          }
        ];
        assessments = [
          {
            id = 1;
            maxScore = 10;
            pointScore = 1;
            flashcard = null;
            ktMax = 10;
            duration = 15;
            difficulty = #EASY;
            sequenceNo = 3;
            knowledgeUnitId = "KU-004";
            quiz = ?{
              id = 1;
              assessmentType = #QUIZ;
              questions = [
                {
                  questionText = "What is a primary goal of the UNODC GRACE Initiative?";
                  options = [
                    "To build international sports arenas and fund youth athletic leagues",
                    "To empower youth through ethics, education, and technology to promote integrity",
                    "To replace traditional school curricula with mandatory standardized legal exams",
                    "To develop commercial video games focused strictly on private enterprise"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Focus on the combination of education, youth engagement, and ethical technology.";
                },
                {
                  questionText = "How is social entrepreneurship best defined in the context of civic innovation?";
                  options = [
                    "Launching a strictly profit-driven enterprise to maximize shareholder returns",
                    "Posting viral promotional content on social media platforms for brand awareness",
                    "Establishing ventures or projects that create innovative solutions to community and social challenges",
                    "Operating exclusively within traditional government bureaucracies to enforce regulations"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Think about combining entrepreneurial methods with a focus on solving social problems.";
                },
                {
                  questionText = "In what way can digital technology effectively combat corruption and promote accountability?";
                  options = [
                    "By restricting public access to institutional data and centralizing records",
                    "By replacing public open-source software with proprietary, encrypted offline databases",
                    "By deploying transparent digital tools, open data platforms, and public tracking systems",
                    "By automating high-volume marketing communications to obscure public spending"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Consider tools that increase visibility, open data access, and public oversight.";
                },
                {
                  questionText = "What takes place during a GRACE-sponsored youth hackathon?";
                  options = [
                    "Collaborative teams design technology-driven solutions to tackle real-world integrity and social issues",
                    "Participants compete to gain unauthorized access to secure financial networks",
                    "Individual developers race against time to maximize typing speed and accuracy",
                    "Esports teams compete in commercial multi-player gaming tournaments for cash prizes"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Look for a collaborative event focused on solving real civic and ethical challenges using tech.";
                },
                {
                  questionText = "What does institutional transparency mean in governance and community decision-making?";
                  options = [
                    "Conducting strategic planning exclusively through closed-door executive sessions",
                    "Publishing clear, accessible information so citizens can observe and understand official actions",
                    "Restricting public documentation to simplified summaries without supporting financial records",
                    "Mandating physical architectural changes to government facilities"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Focus on open access to information and clear visibility into decisions.";
                },
                {
                  questionText = "Which educational approaches are utilized by the GRACE Initiative to engage younger audiences effectively?";
                  options = [
                    "Exclusive reliance on dense legal codes and academic research monographs",
                    "Rote memorization drills and high-stakes standardized testing protocols",
                    "Interactive digital media, storybooks, and gamified learning platforms",
                    "Mandatory evening lectures delivered by senior anti-corruption compliance officers"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Think about engaging, creative, and interactive tools designed for modern learners.";
                },
                {
                  questionText = "Which of the following represents a digital innovation aimed at enhancing civic fairness?";
                  options = [
                    "A social media filter designed to alter photo aesthetics",
                    "An automated script that generates repetitive promotional messages online",
                    "A competitive gaming mechanism that rewards evasive strategy",
                    "A secure public reporting mobile application for tracking and logging public service delivery issues"
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"Identify the option that directly connects digital tools with civic accountability and reporting.";
                },
                {
                  questionText = "What is a major social benefit of fostering youth-led social entrepreneurship?";
                  options = [
                    "It addresses pressing community needs through sustainable and creative problem-solving",
                    "It guarantees immediate commercial profitability for early-stage ventures",
                    "It discourages formal academic education in favor of rapid venture creation",
                    "It focuses venture capital exclusively on automated financial trading tools"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Consider how young founders create practical solutions tailored to community needs.";
                },
                {
                  questionText = "How does the GRACE Initiative support real-world youth action beyond conventional classroom instruction?";
                  options = [
                    "By offering targeted youth grants, facilitating global dialogues, and backing community action projects",
                    "By mandating additional study hours in specialized legal theory",
                    "By sponsoring regional athletic tournaments and sports leagues",
                    "By distributing hardware devices without educational context or program support"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Look for proactive support mechanisms like seed funding, dialogue platforms, and project sponsorship.";
                },
                {
                  questionText = "In the context of the UNODC, what does the acronym GRACE represent?";
                  options = [
                    "Global Research and Cultural Engagement Initiative",
                    "Government Rules and Community Enforcement Project",
                    "Global Resource for Anti-Corruption Education and Youth Empowerment",
                    "Green Resources and Climate Action for Educational Systems"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Remember the dual emphasis on anti-corruption education and youth empowerment.";
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
            name = "Digital Innovation and Social Entrepreneurship Infographic";
            contentType = #INFORGRAPHIC;
            url = "https://notebooklm.link.google/9srKpvWytvgK";
            description = "An infographic on digital innovation and social entrepreneurship.";
            detailedDescription = "";
          };
          slideDeck = ?{
            name = "Digital Innovation and Social Entrepreneurship Slide Deck";
            contentType = #SLIDEDECK;
            url = "https://notebooklm.link.google/w0RtvI9dNzCD";
            description = "A slide deck on digital innovation and social entrepreneurship.";
            detailedDescription = "";
          };
          podcast = ?{
            name = "Digital Innovation and Social Entrepreneurship Podcast";
            contentType = #PODCAST;
            url = "https://notebooklm.link.google/mtOoQwoecE4h";
            description = "A podcast on digital innovation and social entrepreneurship.";
            detailedDescription = "";
          };  
        };
      },
      {
        id = "KU-005";
        topic = "Youth Engagement in Anti-Corruption Policy"; 
        difficulty = #EASY;
        prerequisites = [];
        audience = "Local Leaders & NGOs";
        level = BEGINNER;
        learningObjectives = [
          "Explain youth participation and the 15 to 30 age range used in anti-corruption policy.",
          "Explain how working with youth can help anti-corruption agencies overcome challenges.",
          "Assess an agency's readiness using 13 key factors.",
          "Design anti-corruption initiatives that link youth contributions to agency goals.",
          "Create ongoing monitoring and learning plans to track youth participation and safety."
        ];
        expectations = [
          "Include youth voices and ideas across all five themes to avoid tokenism.",
          "Use young people's digital skills and influence to strengthen anti-corruption work.",
          "Provide funding, safeguarding, and formal youth structures before starting initiatives.",
          "Use a four-step Theory of Change to help youth move from participants to co-leaders.",
          "Track progress using meaningful indicators, reliable data, and regular reviews."
        ];
        image = "community_img";
        description = "Learn how to meaningfully engage youth in anti-corruption policy and initiatives, ensuring their voices are heard and their contributions valued.";
        icon = "Globe";
        block = "rightDown";
        duration = "2 hours";
        sources = [
          {
            id = 1;
            sourceType = #ARTICLE;
            detail = "POLICY GUIDE FOR NATIONAL ANTI-CORRUPTION AUTHORITIES ON MEANINGFUL YOUTH ENGAGEMENT IN ANTI-CORRUPTION WORK";
            url = ?("https://grace.unodc.org/grace/en/youth-empowerment/policy-guide-for-national-anti-corruption-authorities-on-meaningful-youth-engagement-in-anti-corruption-work.html");
          }
        ];
        teachings = [
          {
            id = 0;
            topic = "Welcome to the Youth Engagement in Anti-Corruption Policy Module!";
            difficulty = #EASY;
            knowledgeUnitId = "KU-005";
            keywords = [
              "youth engagement",
              "anti-corruption policy",
              "policy guide",
              "youth empowerment"
            ];
            content = {
              name = "Welcome to the Youth Engagement in Anti-Corruption Policy Module!";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit5/Policy%20Intro.mp4";
              detailedDescription = "A welcome message from GRACIE";
              description = "Welcome message from GRACIE to the Youth Engagement in Anti-Corruption Policy module";
            };
            ktMax = 10;
            duration = 2;
            sequenceNo = 0;
          },
          {
            id = 1;
            topic = "Introduction to Youth Engagement in Anti-Corruption Policy";
            difficulty = #EASY;
            keywords = [
              "youth engagement",
              "anti-corruption policy",
              "policy guide",
              "youth empowerment"
            ];
            content = {
              name = "Introduction to Youth Engagement in Anti-Corruption Policy";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit5/Introduction__Unlocking_Co-Op_Mode__Youth_Against_The_Glitch.mp4";
              description = "Explore the importance of youth engagement in anti-corruption policy and how it can strengthen integrity initiatives.";
              detailedDescription = "Introduction: Unlocking Co-Op Mode: Youth Against The Glitch explains how corruption acts like a systemic glitch 
              that breaks the rules of fairness, draining vital resources away from communities, schools, and essential public services. It explores 
              why tackling this challenge cannot be left to adult officials alone, introducing viewers to the concept of Co-Op Mode—a 
              collaborative partnership between young people and anti-corruption authorities. The video breaks down the three essential ways youth can 
              actively take part in fixing these glitches: speaking up with their **voice** to advocate for fair treatment, offering their insight 
              into issues affecting their generation, and taking direct action through peer-led initiatives and creative community solutions. 
              Ultimately, it emphasizes that young people have the power, perspective, and responsibility to team up with leaders and help build a 
              more transparent, just society.";
            }; 
            ktMax = 10;
            duration = 15;
            sequenceNo = 1;
            knowledgeUnitId = "KU-005";
          },
          {
            id = 2;
            topic = "The Core idea behind Youth Engagement in Anti-Corruption Policy";
            difficulty = #EASY;
            keywords = [
              "youth engagement",
              "anti-corruption policy",
              "policy guide",
              "youth empowerment"
            ];
            content = {
              name = "The Core idea behind Youth Engagement in Anti-Corruption Policy";
              contentType = #VIDEO;
              url = "https://media.knowledgefound.org/gracie/video/KnowledgeUnit5/Submodule_1__Level_Up%21_Fighting_Corruption_in_Co-Op_Mode.mp4";
              description = "Explore how young people and anti-corruption authorities can team up to tackle corruption and build a fairer world.";
              detailedDescription = "This video focuses on how young people and anti-corruption authorities can team up to tackle corruption and build a fairer world. 
              It breaks down the three powerful ways youth contribute to the mission: speaking up with their voice through constructive dialogue, sharing valuable 
              insights and everyday experiences to shape policies, and taking direct action by leading projects and awareness campaigns. The video explores the vital 
              difference between genuine, meaningful engagement and tokenism, explaining why real teamwork requires diverse voices, supportive environments, shared 
              leadership across generations, quality participation, and true empowerment. Finally, it outlines the key areas where young people make a real difference—from 
              prevention and public education to creative outreach, policymaking, and supporting justice—showing viewers that when communities unlock 
              co-op mode, integrity wins.";
            };
            ktMax = 10;
            duration = 15;
            sequenceNo = 2;
            knowledgeUnitId = "KU-005";
          }
        ];
        assessments = [
          {
            id = 1;
            maxScore = 10;
            pointScore = 1;
            flashcard = null;
            ktMax = 10;
            duration = 15;
            difficulty = #EASY;
            sequenceNo = 3;
            knowledgeUnitId = "KU-005";
            quiz = ?{
              id = 1;
              assessmentType = #QUIZ;
              questions = [
                {
                  questionText = "What operational age range does the policy guide adopt when defining youth in anti-corruption work?";
                  options = [
                    "12 to 24 years old",
                    "18 to 35 years old",
                    "15 to 30 years old",
                    "10 to 18 years old"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Consider the extended definition that accommodates diverse transitions into adulthood.";
                },
                {
                  questionText = "Which form of youth contribution involves collecting grassroots data, feedback, and lived experiences to inform anti-corruption strategies?";
                  options = [
                    "Insight",
                    "Voice",
                    "Action",
                    "Oversight"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Think about knowledge-gathering and evidence that informs policy design.";
                },
                {
                  questionText = "In what way is youth 'Voice' distinct from other contribution types within anti-corruption initiatives?";
                  options = [
                    "It requires young people to run enforcement investigations independently",
                    "It centers on constructive dialogue, advocacy, and expressing viewpoints in decision-making spaces",
                    "It focuses solely on financial auditing and data analytics",
                    "It restricts youth participation to silent observation at conferences"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Focus on dialogue, perspectives, and representation.";
                },
                {
                  questionText = "A youth group designs and executes a community-level awareness roadshow on public integrity. Which form of contribution does this demonstrate?";
                  options = [
                    "Voice",
                    "Insight",
                    "Coordination",
                    "Action"
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"This involves actively implementing, leading, or delivering an initiative.";
                },
                {
                  questionText = "Which of the following defines tokenism in youth engagement programmes?";
                  options = [
                    "Superficial or decorative involvement where young people have no genuine influence on decisions",
                    "Providing young people with dedicated budgets and mentorship",
                    "Ensuring marginalized youth from rural areas have equal representation",
                    "Allowing youth to lead institutional monitoring and evaluation"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Reflect on symbolic participation without real voice or structural power.";
                },
                {
                  questionText = "Which of the five core themes focuses on dismantling financial, legal, and social barriers to ensure all young people can participate safely?";
                  options = [
                    "Youth empowerment",
                    "Quality youth participation",
                    "Engagement-enabling environment",
                    "Intergenerational collaboration"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Look for the theme that creates supportive, secure conditions and removes institutional obstacles.";
                },
                {
                  questionText = "How is 'Intergenerational Collaboration' best described within the meaningful engagement framework?";
                  options = [
                    "Replacing all senior personnel with younger activists under 25",
                    "Limiting youth to observing meetings led entirely by senior officials",
                    "A mutual partnership where experienced professionals and youth share power, knowledge, and perspectives",
                    "Requiring youth to undergo a probationary period before their opinions are recorded"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"It is a two-way street combining institutional experience with fresh youth perspectives.";
                },
                {
                  questionText = "Ensuring that youth contributions lead to tangible capability development, agency, and leadership skills relates to which core theme?";
                  options = [
                    "Engagement-enabling environment",
                    "Diversity and inclusion",
                    "Intergenerational collaboration",
                    "Youth empowerment"
                  ];
                  correctAnswerIndex = 3;
                  hint = ?"Think about building lasting competencies, autonomy, and leadership capacity.";
                },
                {
                  questionText = "How can youth meaningfully contribute to an anti-corruption authority's 'Prevention' function?";
                  options = [
                    "By identifying corruption vulnerabilities in public services like school admissions or licensing through youth audits",
                    "By issuing formal judicial subpoenas and arrest warrants to suspect entities",
                    "By managing national fiscal budgets without oversight",
                    "By serving as armed tactical support during anti-corruption raids"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Prevention centers on identifying systemic loopholes and improving processes before corruption occurs.";
                },
                {
                  questionText = "In what way can young people support an authority's 'Public Outreach and Awareness-Raising' area?";
                  options = [
                    "By conducting internal disciplinary trials for public servants",
                    "By drafting confidential intergovernmental treaties",
                    "By translating complex integrity messages into creative, peer-led digital campaigns and community events",
                    "By serving as the sole legal counsel during prosecution hearings"
                  ];
                  correctAnswerIndex = 2;
                  hint = ?"Consider their strengths in peer communication, relatable storytelling, and digital media.";
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
            name = "Youth Engagement in Anti-Corruption Policy Infographic";
            contentType = #INFORGRAPHIC;
            url = "https://notebooklm.link.google/wkVdqQgmMlAk";
            description = "An infographic on Youth Engagement in Anti-Corruption Policy.";
            detailedDescription = "";
          };
          slideDeck = ?{
            name = "Youth Engagement in Anti-Corruption Policy Slide Deck";
            contentType = #SLIDEDECK;
            url = "https://notebooklm.link.google/ddHDGD5O5dm7";
            description = "A slide deck on youth engagement in anti-corruption policy.";
            detailedDescription = "";
          };
          podcast = ?{
            name = "Youth Engagement in Anti-Corruption Policy Podcast";
            contentType = #PODCAST;
            url = "https://notebooklm.link.google/Ynpq7ndo3W0g";
            description = "A podcast on youth engagement in anti-corruption policy.";
            detailedDescription = "";
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
