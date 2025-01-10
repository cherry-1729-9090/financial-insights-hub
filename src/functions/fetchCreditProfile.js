export const fetchCreditProfile = async (userId) => {
  try {
    const response = await fetch('https://app.minemi.ai/api/v1/credit-profile-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'userId': userId,
        'Origin': window.location.origin,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, userId',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({ userId: userId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching credit profile:', error);
    return {
      data: {
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
    };
  }
};