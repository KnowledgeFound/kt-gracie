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
    lastUpdated = "2026-10-02T00:30:00Z";
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
            topic = "The Root Causes: How Philosophy, Economics and Politics Explain Corruption";
            ktMax = 10;
            difficulty = #EASY;
            duration = 30; // Duration in minutes
            keywords = ["Anti-Corruption", "definition", "Introduction to Corruption", "philosophy", "economics", "politics"];
            sequenceNo = 2;
            content = {
              name = "The Root Causes: How Philosophy, Economics and Politics Explain Corruption";
              contentType = #VIDEO;
              url = "https://www.unodc.org/corruption/en/learn/what-is-corruption.html";
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
              url = "https://www.unodc.org/corruption/en/learn/what-is-corruption.html";
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
                  questionText = "Moral & Philosophical View: In classical moral thought, how was corruption primarily understood at the individual level?";
                  options = [
                    "As a purely technical administrative error",
                    "As a trait of character or personal vice, such as greed or self-indulgence",
                    "As an optimal market equilibrium between supply and demand",
                    "As a statutory offense under international maritime law"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Think about classical concepts of personal virtue and moral vices like greed, disloyalty, or self-indulgence.";
                },
                {
                  questionText = "Moral & Philosophical View: How did Ancient Athenians view the trial of Socrates regarding the charge of \"corrupting the youth\"?";
                  options = [
                    "As a financial embezzlement case",
                    "As a departure from fidelity to Athenian traditions and customs",
                    "As a breach of international trade conventions",
                    "As an attempt to bribe political referees"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Arlene Saxonhouse notes that virtue for Athenians was defined by fidelity to their own traditions and customs.";
                },
                {
                  questionText = "Political Science View: How does political corruption undermine electoral processes and state institutions? [8]";
                  options = [
                    "By ensuring merit-based appointment of civil servants",
                    "By creating improper influence through vote-buying, election-rigging, and campaign debt paybacks",
                    "By eliminating market distortions across economic sectors",
                    "By enforcing political equality across all social groups"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Think about how political debts and undisclosed campaign financing alter democratic accountability [8].";
                },
                {
                  questionText = "Political Science View: According to Karl-Heinz Nassmacher, what fundamentally distinguishes a democracy from a plutocracy? [8][9]";
                  options = [
                    "Democracy is based on equal participation by the multitude, while plutocracy is dominated by the riches of an affluent minority",
                    "Democracy relies on market pricing, while plutocracy relies on central state planning",
                    "Democracy excludes private sector actors entirely",
                    "Democracy relies on perception indices, while plutocracy relies on experience surveys"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Consider how allocating political influence based on wealth alters equal democratic representation [8][9].";
                },
                {
                  questionText = "Economic View: According to Gary Becker's 1968 economic framework, why does an individual choose to engage in corrupt conduct? [10]";
                  options = [
                    "Because their basic human motivation is fundamentally different from non-criminals",
                    "Because the expected utility or benefit exceeds the cost and utility of alternative lawful activities",
                    "Because they lack any rational understanding of financial risk",
                    "Because cultural norms compel them to obey authority"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Rational choice models weigh expected benefits against penalties and the probability of being caught [10].";
                },
                {
                  questionText = "Economic View: In economic models of corruption, what is meant by \"moral costs\"? [12]";
                  options = [
                    "Official fines imposed by a court of law",
                    "The internal loss of utility experienced when a person compromises their personal or organizational values",
                    "The financial cost of hiring external anti-corruption auditors",
                    "The legal fees required to file a lawsuit"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Moral costs reflect internalized ethical beliefs factored into an actor's cost-benefit calculation [12].";
                },
                {
                  questionText = "Cultural View: How do scholars attentive to cultural dimensions define culture in anti-corruption literature? [14]";
                  options = [
                    "As formal statutory codes written by legislators",
                    "As the dominant beliefs, attitudes, and behaviors in a given society",
                    "As a country's annual gross domestic product",
                    "As the literacy rate of civil servants"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Focus on how collective social habits, affective ties, and traditions shape community norms [14].";
                },
                {
                  questionText = "Cultural View: What risk do scholars like Rose-Ackerman and Palifka highlight regarding cultural explanations of corruption?";
                  options = [
                    "That cultural arguments can be co-opted by self-serving elites to excuse corrupt enrichment",
                    "That cultural studies eliminate petty bribery entirely",
                    "That cultural perspectives force all nations to adopt identical laws",
                    "That cultural values prevent market transactions"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Be vigilant when elites use \"tradition\" or \"culture\" to shield private gain from accountability [14].";
                },
                {
                  questionText = "Institutionalist Approach: What core conceptual shift is advocated by the institutionalist approach to corruption? [7][15]";
                  options = [
                    "Shifting focus from \"bad apples\" (individual misbehavior) to \"bad barrels\" (distorted institutional setups)",
                    "Shifting focus from statutory law to dictionary definitions",
                    "Focusing exclusively on petty bribery while ignoring grand corruption",
                    "Replacing civil servants with automated tools"
                  ];
                  correctAnswerIndex = 0;
                  hint = ?"Look at how institutional arrangements cause systems to deviate from their proper public purpose [7][15].";
                },
                {
                  questionText = "Institutionalist Approach: How do Levitsky and Ziblatt illustrate state capture using the sports referee analogy? [16]";
                  options = [
                    "Referees penalizing corrupt players immediately",
                    "Political elites colluding with neutral institutions (\"referees\") to cheat and rewrite the rules of the game",
                    "Corporations building stadiums using public funds",
                    "Teams competing in a transparent, open market"
                  ];
                  correctAnswerIndex = 1;
                  hint = ?"Imagine players controlling decision-makers so that the rules are permanently rigged in their favor [16].";
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
            sequenceNo = 5;
            knowledgeUnitId = "KU-001";
            flashcard = ?{
              id = 1;
              assessmentType = #FLASHCARD;
              questions = [
                {
                  front = "Sustainable Development Goal 16 (SDG 16): Which specific SDG explicitly focuses on building \"Peace, Justice and Strong Institutions\" and contains targets to substantially reduce corruption?";
                  back = "SDG 16 Targets 16.4, 16.5, and 16.6 specifically call for reducing all forms of corruption, recovering stolen assets, and developing transparent institutions.";
                  hint = ?("Think of the UN goal focused on peace, justice, and effective institutions.");
                },
                {
                  front = "Global Economic Cost of Bribery: According to a report by the International Monetary Fund (IMF), what is the estimated annual global cost of bribery alone?";
                  back = "$1.5 to $2 trillion per year, representing a total economic loss of approximately 2% of global GDP.";
                  hint = ?("It equals roughly 2% of total global gross domestic product.");
                },
                {
                  front = "Infrastructure Failures: How can corruption in the construction and permitting sectors directly threaten human lives?";
                  back = "By bypassing building permit laws and using compromised construction materials (such as \"weakened cement\"), leading to fatal building collapses during earthquakes or structural failures.";
                  hint = ?("Consider the 2018 Genoa bridge collapse or the 2017 Mexico City earthquake investigations.");
                },
                {
                  front = "Conflict & Atrocity Crimes: How do transitional justice mechanisms (such as Truth and Reconciliation Commissions) view the role of corruption in armed conflicts?";
                  back = "As a primary destabilizing factor and a fundamental \"driver of conflict\" that degrades state capacity and leads to severe human rights violations[4].";
                  hint = ?("Look at findings from the Sierra Leone, Liberia, and Tunisia truth commissions.");
                },
                {
                  front = "Direct Methods of Measurement: What defines \"direct methods\" of measuring corruption, and what are two primary examples?";
                  back = "Standardized procedures that gather evidence-based data on actual experiences of corruption[5]. Key examples include official crime statistics and experience-based sample surveys[5][6].";
                  hint = ?("These focus on actual personal encounters and objective statistics rather than subjective opinions.");
                },
                {
                  front = "Limitations of Indirect Methods: What is the primary methodological criticism of indirect or perception-based corruption surveys?";
                  back = "They gauge subjective opinions and perceptions rather than actual occurrences, which can create vast discrepancies when compared to experience data and can be heavily skewed by media coverage[7][8].";
                  hint = ?("They measure what people think or feel is happening rather than direct personal encounters.");
                },
                {
                  front = "Corruption Perceptions Index (CPI): What is Transparency International's CPI, and how is its score calculated?";
                  back = "It is a composite index (\"survey of surveys\") that combines 13 different data sources from 12 organizations to rank countries by perceived levels of public sector corruption[9].";
                  hint = ?("It ranks countries globally by aggregating multiple expert assessments and perception surveys.");
                },
                {
                  front = "Index of Public Integrity (IPI): How does the Index of Public Integrity (IPI) evaluate control of corruption without relying on perception surveys?";
                  back = "By evaluating six objective proxy indicators: judicial independence, administrative burden, trade openness, budget transparency, e-citizenship, and freedom of the press[10].";
                  hint = ?("It uses actionable risk assessments and objective structural proxies like press freedom and judicial independence.");
                },
                {
                  front = "Innovative & Field Measurement: What are two innovative or experimental approaches used by modern researchers to observe corrupt behavior?";
                  back = "Experimental \"bribery games\" in lab/field settings[11] and Public Expenditure Tracking Surveys (PETS) that detect missing public funds in government programs[11][12].";
                  hint = ?("One uses economic lab simulations, while the other tracks whether public funds actually reach local schools or clinics.");
                },
                {
                  front = "Crowdsourced Bribery Reporting: What is \"I Paid a Bribe.com\", and how does it contribute to corruption measurement?";
                  back = "An Internet-based crowdsourced reporting platform originating in India where ordinary citizens self-report real-time qualitative and quantitative details of everyday bribes paid[11].";
                  hint = ?("A citizen-driven platform started in India to document daily micro-extortion and bribery encounters.");
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
        block = "leftDown";
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
              url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
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
              url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
              detailedDescription = "This video will take you into more detail on the YouthLed steps 6 through 10";
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
