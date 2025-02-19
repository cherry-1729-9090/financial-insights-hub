import { chatCompletion } from "@/functions/chatCompletion";

const determinePersona = (creditProfile) => {
  console.log('[generateQuestions] [creditProfile]', creditProfile);
  const { credit_score, foir, credit_utilization } = creditProfile;
  const score = parseInt(credit_score, 10);
  const utilization = parseInt(credit_utilization, 10);

  if (score < 650) return "Persona 1";
  if (score >= 650 && score <= 720 && foir > 55) return "Persona 2";
  if (score >= 720 && score <= 750 && utilization > 80) return "Persona 3";
  if (score >= 750 && score <= 800 && foir > 55) return "Persona 10";
  if (score >= 750 && utilization > 80) return "Persona 9";
  if (score >= 750 && score <= 800) return "Persona 4";
  if (score > 800) return "Persona 6";
  if (score > 800 && utilization > 80) return "Persona 9";
  return "Persona 3";
};

const personas = {
  "Persona 1": {
    situation: "Credit Score Below 650 (High Defaults)",
    prompt: "Your credit score is low. Let’s find the top two actions to improve it.",
    goal: "Improve credit score, reduce delinquencies.",
    criticalDataPoints: ["Defaults/Delinquencies", "Late Payments (30/60/90 days)", "FOIR", "Credit History Length"]
  },
  "Persona 2": {
    situation: "Credit Score 650-720 (High FOIR, Overleveraged)",
    prompt: "Your FOIR is high. How can you manage EMIs better?",
    goal: "EMI reduction, balance transfer.",
    criticalDataPoints: ["FOIR", "Number of Active Loans", "Income vs. Obligations"]
  },
  "Persona 3": {
    situation: "Credit Score 720-750 (Stable but High Credit Utilization)",
    prompt: "Your utilization is high. Would you like to balance it?",
    goal: "Consolidation, top-ups.",
    criticalDataPoints: ["Credit Utilization", "Loan Balances"]
  },
  "Persona 4": {
    situation: "Credit Score 750-800 (Active Loans, EMI Focus)",
    prompt: "Explore loan optimization options to reduce EMI.",
    goal: "Top-ups, debt consolidation.",
    criticalDataPoints: ["EMI Payments", "Loan Balances"]
  },
  "Persona 5": {
    situation: "Credit Score 750+ (Debt-Free, No Running Loans)",
    prompt: "Explore premium credit products.",
    goal: "Credit expansion.",
    criticalDataPoints: ["Income", "Account Type"]
  },
  "Persona 6": {
    situation: "Score 800+ (Premium Borrower)",
    prompt: "Let’s explore premium cards and overdrafts.",
    goal: "Maximize credit opportunities.",
    criticalDataPoints: ["Credit Score", "Utilization"]
  },
  "Persona 7": {
    situation: "No Credit History (-1 or NA)",
    prompt: "Start building credit with secured cards or small loans.",
    goal: "Establish credit profile.",
    criticalDataPoints: ["Employment Status", "Income"]
  },
  "Persona 8": {
    situation: "Self-Employed, High Unsecured Debt",
    prompt: "Would you like to shift unsecured debt to secured loans?",
    goal: "Debt restructuring.",
    criticalDataPoints: ["Unsecured Debt", "FOIR"]
  },
  "Persona 9": {
    situation: "High Utilization, Minimal Defaults (Above 750 but Overleveraged)",
    prompt: "Manage utilization for better future credit opportunities.",
    goal: "Balance management.",
    criticalDataPoints: ["Utilization", "Loan Balances"]
  },
  "Persona 10": {
    situation: "Stable Users (720+ but High FOIR)",
    prompt: "Focus on EMI reduction to improve eligibility.",
    goal: "FOIR optimization.",
    criticalDataPoints: ["FOIR", "EMI Payments"]
  },
  "Persona 11": {
    situation: "Young Credit Users (Score >720, Low Credit Age)",
    prompt: "Would you like to explore more products to build history?",
    goal: "Expand credit lines.",
    criticalDataPoints: ["Credit Age", "Income"]
  },
  "Persona 12": {
    situation: "Senior Borrowers (Score 800+, Minimal Obligations)",
    prompt: "Explore investment products linked to credit.",
    goal: "Optimize investments.",
    criticalDataPoints: ["Investment Options", "Credit Score"]
  }
};

const formatAIResponse = (response) => {
  try {
    // Use regex to extract questions from the response string
    const questions = response.match(/"(.*?)"/g)?.map(q => q.replace(/"/g, ''));

    console.log('questions', questions);
    return questions.length > 0 ? questions : ["No questions could be extracted from the response."];
  } catch (error) {
    console.error("Error formatting AI response:", error);
    return ["Failed to process AI response."];
  }
};

type PersonaType = {
  situation: string;
  goal: string;
  criticalDataPoints: string[];
  prompt?: string;  
};

export const generateQuestions = async (creditProfile: any): Promise<{ questions: string[]; persona: PersonaType }> => {
  const personaId = determinePersona(creditProfile);
  console.log('[generateQuestions] [personaId]', personaId);
  // Create a safe copy of the credit profile with a default empty array for loanList
  const safeProfile = {
    ...creditProfile,
    loanList: creditProfile?.loanList || []
  };
  
  // Only slice if loanList exists and has items
  const processedProfile = {
    ...safeProfile,
    loanList: safeProfile.loanList.slice(0, 5)
  };

  // console.log('[generateQuestions] [creditProfile]', processedProfile);
  const persona = personas[personaId];
  const message = `Generate 4 questions for ${persona.situation} based on the credit profile ${JSON.stringify(processedProfile)} 
      and considering common user concerns. Please provide questions in the form of an array. 
      Please donot use any markdown or code blocks, just send the questions in a plain text format.
      And please donot use any other text or comments, just send the questions in a plain text format.
      Please donot add comments like "Here are four questions that could help a user with" or anything like that.
      Just send the questions in a plain text format only the questions. Ask some short questions and the questions 
      should like some generalized ones.
      User's credit profile : ${JSON.stringify(processedProfile)}
      Note : These questions are generated in a user's point of view to make the user know what kind of questions they 
      can ask an AI bot so that the user can ask the questions to the AI bot and continue the conversation Ask the questions in the form of a JSON array.
      `;
  const response = await chatCompletion(message, processedProfile, persona, true);

  console.log('[generateQuestions] [response data]', response);
 
  return { questions: formatAIResponse(response), persona };
};