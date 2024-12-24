import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const determinePersona = (creditProfile) => {
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
    return "Persona 7";
  };
  
  const personas: Record<string, PersonaType> = {
    "Persona 1": {
      situation: "Credit Score Below 650 (High Defaults)",
      goal: "Improve credit score, reduce delinquencies.",
      criticalDataPoints: ["Defaults/Delinquencies", "Late Payments (30/60/90 days)", "FOIR", "Credit History Length"]
    },
    "Persona 2": {
      situation: "Credit Score 650-720 (High FOIR, Overleveraged)",
      goal: "EMI reduction, balance transfer.",
      criticalDataPoints: ["FOIR", "Number of Active Loans", "Income vs. Obligations"]
    },
    "Persona 3": {
      situation: "Credit Score 720-750 (Stable but High Credit Utilization)",
      goal: "Consolidation, top-ups.",
      criticalDataPoints: ["Credit Utilization", "Loan Balances"]
    },
    "Persona 4": {
      situation: "Credit Score 750-800 (Active Loans, EMI Focus)",
      goal: "Top-ups, debt consolidation.",
      criticalDataPoints: ["EMI Payments", "Loan Balances"]
    },
    "Persona 5": {
      situation: "Credit Score 750+ (Debt-Free, No Running Loans)",
      goal: "Credit expansion.",
      criticalDataPoints: ["Income", "Account Type"]
    },
    "Persona 6": {
      situation: "Score 800+ (Premium Borrower)",
      goal: "Maximize credit opportunities.",
      criticalDataPoints: ["Credit Score", "Utilization"]
    },
    "Persona 7": {
      situation: "No Credit History (-1 or NA)",
      goal: "Establish credit profile.",
      criticalDataPoints: ["Employment Status", "Income"]
    },
    "Persona 8": {
      situation: "Self-Employed, High Unsecured Debt",
      goal: "Debt restructuring.",
      criticalDataPoints: ["Unsecured Debt", "FOIR"]
    },
    "Persona 9": {
      situation: "High Utilization, Minimal Defaults (Above 750 but Overleveraged)",
      goal: "Balance management.",
      criticalDataPoints: ["Utilization", "Loan Balances"]
    },
    "Persona 10": {
      situation: "Stable Users (720+ but High FOIR)",
      goal: "FOIR optimization.",
      criticalDataPoints: ["FOIR", "EMI Payments"]
    },
    "Persona 11": {
      situation: "Young Credit Users (Score >720, Low Credit Age)",
      goal: "Expand credit lines.",
      criticalDataPoints: ["Credit Age", "Income"]
    },
    "Persona 12": {
      situation: "Senior Borrowers (Score 800+, Minimal Obligations)",
      goal: "Optimize investments.",
      criticalDataPoints: ["Investment Options", "Credit Score"]
    }
  };
  
  
  const commonConcerns = [
    "Why is my credit score low?",
    "How can I improve my loan eligibility?",
    "What is the best way to reduce EMI payments?",
    "How do I manage high credit utilization?",
    "Can I get a loan despite existing debts?",
    "How do I avoid late payments and penalties?"
  ];
  type PersonaType = {
    situation: string;
    goal: string;
    criticalDataPoints: string[];
    prompt?: string;  
  };
  const mockCreditProfile = {
    credit_score: "735",
    total_loan_amt: "13936790",
    total_hl_amt: "7772878",
    total_pl_amt: "5462400",
    all_loan: "66",
    running_loan: "21",
    credit_utilization: "85",
    foir: "60",
    employement_status: "Employed",
  };
  
  export const useGenerateQuestions = () => {
    const [persona, setPersona] = useState<PersonaType | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  
    useEffect(() => {
      const personaId = determinePersona(mockCreditProfile?.credit_score);
      setPersona(personas[personaId]);
  
      const generateQuestions = async () => {
        if (!showSuggestions) return;
  
        const { data, error } = await supabase.functions.invoke('chat', {
          body: {
            prompt: `Generate exactly 4 questions for ${persona?.situation} based on the credit profile ${JSON.stringify(mockCreditProfile)} and considering common user concerns: ${commonConcerns.join(', ')}. Format as a JSON array of strings.`
          }
        });
  
        try {
          const parsedContent = JSON.parse(data?.content || '{}');
          // Extract questions and limit to 4
          const questions = Array.isArray(parsedContent?.content) 
            ? parsedContent.content.slice(0, 4) 
            : parsedContent?.content?.match(/(?<=\d\.\s).*?(?=\n|$)/g)?.slice(0, 4) || [];
          
          setAiQuestions(questions);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          setAiQuestions([]);
        }
      };
  
      generateQuestions();
  
    }, []);
  
    return { aiQuestions, persona };
  };