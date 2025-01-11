import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const randomUserData =  {
  credit_score: "735",
  total_loan_amt: "13936790",
  total_hl_amt: "7772878",
  total_pl_amt: "5462400",
  all_loan: "66",
  running_loan: "21",
  credit_utilization: "85",
  foir: "60",
  employement_status: "Employed",
}

export const extractUserData = async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return '';
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', token)
      .single();
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: token }]);
        
      if (insertError) {
        console.error("Error creating profile:", insertError);
        return '';
      }
    }
    
    return token;
  } catch (error) {
    console.error("Error extracting/processing user data:", error);
    return '';
  }
}

export const fetchUserCreditProfile = async () => {
  try {
    const payload = await extractUserData();
    if (!payload) {
      console.error("User ID not found");
      return randomUserData;
    }
    
    const { data, error } = await supabase.functions.invoke('credit-profile', {
      body: { userId: payload }
    });
    if (error) {
      console.error("Error fetching credit profile:", error);
      return randomUserData;
    }
    
    return data.data || randomUserData;
  } catch(error) {
    console.error("Error fetching user credit profile:", error);
    return randomUserData;
  }
}