import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken"
import { JwtPayload } from 'jsonwebtoken';

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

export const extractUserData = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if(!token) return '';
    return token;
  }
  catch(error) {
    console.error("Error extracting user data:", error);
    return '';
  }
}

export const fetchUserCreditProfile = async () => {
  try {
    const payload = extractUserData();
    if (!payload) {
      console.error("User ID not found");
      return randomUserData;
    }
    
    const userData = await fetch('https://app.minemi.ai/api/v1/credit-profile-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userId': payload
      }
    });
    
    return await userData.json();
  } catch(error) {
    console.error("Error fetching user credit profile:", error);
    return randomUserData;
  }
}
