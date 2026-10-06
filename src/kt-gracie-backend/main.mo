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
    lastUpdated = "2026-10-06T22:23:00Z";
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
            duration = 30; // Duration in minutes
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
            maxScore = 5;
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
            maxScore = 5;
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
        teachings = [];
        assessments = [];
        tokenReward = 10;
        summary = {
          id = 1;
          sequenceNo = 1;
          inforgraphic = ?{
            name = "Anti-Corruption Overview";
            contentType = #INFORGRAPHIC;
            url = "#";
            description = "An infographic by the United Nations Office on Drugs and Crime (UNODC) that provides a visual summary of corruption, its forms, and its impact on society.";
            detailedDescription = "";
          };
          slideDeck = ?{
            name = "Understanding Anti-Corruption";
            contentType = #SLIDEDECK;
            url = "#";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDescription = "";
          };
          podcast = ?{
            name = "The Anti-Corruption Podcast";
            contentType = #PODCAST;
            url = "#";
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
            duration = 10;
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
            detailedDescription = "";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDescription = "";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
            detailedDescription = "";
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
            detailedDescription = "";
          };
          slideDeck = ?{
            name = "Understanding Corruption";
            contentType = #SLIDEDECK;
            url = "https://www.unodc.org/documents/corruption/slide_decks/Understanding_Corruption.pptx";
            description = "A slide deck by the United Nations Office on Drugs and Crime (UNODC) that provides an educational overview of corruption, its forms, and its impact on society.";
            detailedDescription = "";
          };
          podcast = ?{
            name = "The Corruption Podcast";
            contentType = #PODCAST;
            url = "https://www.unodc.org/podcasts/corruption_podcast.mp3";
            description = "A podcast by the United Nations Office on Drugs and Crime (UNODC) that discusses various aspects of corruption, including its forms, impact, and prevention strategies.";
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
