import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          toast.success("Successfully signed in!");
          navigate("/");
        }
        if (event === "SIGNED_OUT") {
          toast.info("Signed out");
        }
        if (event === "USER_UPDATED") {
          toast.success("Profile updated!");
        }
        // Handle authentication errors
        if (event === "USER_DELETED") {
          toast.error("Account deleted");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">
          Welcome to Financial Dashboard
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: { background: 'rgb(var(--primary))', color: 'white' },
              anchor: { color: 'rgb(var(--primary))' },
            },
          }}
          theme="light"
          providers={[]}
          onError={(error) => {
            toast.error(error.message);
          }}
        />
      </div>
    </div>
  );
};

export default Login;