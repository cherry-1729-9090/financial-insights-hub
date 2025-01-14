import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client"
import { v4 as uuidv4 } from 'uuid';
import { fetchCreditProfile } from "@/functions/fetchCreditProfile"
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
    console.log('[extractUserData] token', token);

    return token;
  } catch (error) {
    console.error("Error extracting/processing user data:", error);
    return '';
  }
}

const createProfile = async (payload: string) => {
  try {
    const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', payload)
  console.log('[createProfile] existingProfile', existingProfile.length);
  console.log('[createProfile] existingProfileError', existingProfileError);
  if (existingProfile.length == 0 || existingProfileError !== null ) {
    console.log('[createProfile] creating profile');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ 
        id: uuidv4(),  
        user_id: payload 
      });
      
    if (insertError) {
      console.error("Error creating profile:", insertError);
      return '';
    }
  }
  } catch(error) {
    console.error("Error creating profile:", error);
    return '';
  }
}
export const fetchUserCreditProfile = async () => {
  let payload = '';
  try {
    payload = await extractUserData();
    console.log('[fetchUserCreditProfile] payload', payload);
    if (!payload) {
      console.error("User ID not found");
      return {data: randomUserData, payload: payload};
    }
    
    await createProfile(payload);
    const data = await fetchCreditProfile(payload);
    console.log('[fetchUserCreditProfile] [data]', data);
    if (data.error) {
      console.error("Error fetching credit profile:", data.error);
      return {data: randomUserData, payload: payload};
    }
    
    return {data: data , payload: payload};
  } catch(error) {
    console.error("Error fetching user credit profile:", error);
    return {data: {}, payload: payload};
  }
}