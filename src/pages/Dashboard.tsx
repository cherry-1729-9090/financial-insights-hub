import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MetricCard from "@/components/MetricCard";
import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, CreditCard, Building2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const fetchCreditProfile = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('credit-profile');
    if (error) throw error;
    return data;
  } catch (error) {
    console.log("Falling back to default data due to:", error);
    return {
      data: {
        credit_score: "735",
        total_loan_amt: "13936790",
        total_hl_amt: "7772878",
        total_pl_amt: "5462400",
        all_loan: "66",
        running_loan: "21",
        credit_utilization: "NA",
        lenght_of_credit_history: "NA",
        default_count: "NA",
        late_payments: "NA",
        monthly_income: "NA",
        yearly_income: "NA",
        employement_status: "Others",
        foir: "NA",
        gender: "NA"
      }
    };
  }
};

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  const { data } = useQuery({
    queryKey: ["creditProfile"],
    queryFn: fetchCreditProfile,
    meta: {
      onError: (error: Error) => {
        toast("Using fallback data due to connection issues");
        console.error("Query error:", error);
      }
    }
  });

  const profileData = data?.data || {};

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Financial Dashboard</h1>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate("/chat")}
            className="bg-primary hover:bg-primary/90"
          >
            Show AI Insights
          </Button>
          <Button 
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/login");
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Credit Score"
          value={profileData.credit_score || "NA"}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Loan Amount"
          value={`₹${parseInt(profileData.total_loan_amt || "0").toLocaleString()}`}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Home Loan Amount"
          value={`₹${parseInt(profileData.total_hl_amt || "0").toLocaleString()}`}
          icon={<Building2 className="h-4 w-4" />}
        />
        <MetricCard
          title="Personal Loan Amount"
          value={`₹${parseInt(profileData.total_pl_amt || "0").toLocaleString()}`}
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <MetricCard title="Running Loans" value={profileData.running_loan || "NA"} />
        <MetricCard title="Total Loans" value={profileData.all_loan || "NA"} />
        <MetricCard title="Employment Status" value={profileData.employement_status || "NA"} />
      </div>
    </div>
  );
};

export default Dashboard;