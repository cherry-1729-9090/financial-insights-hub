export type UserData = {
  id: string;
  email?: string;
  credit_score?: string;
  total_loan_amt?: string;
  foir?: string;
  credit_utilization?: string;
};

export type Persona = {
  situation: string;
  goal: string;
  criticalDataPoints: string[];
  prompt?: string;
};

export type ChatRequest = {
  prompt: string;
  userData: UserData;
  persona: Persona;
};