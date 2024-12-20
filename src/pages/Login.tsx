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
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        toast.error("Error checking authentication status");
        return;
      }
      if (user) {
        navigate("/");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          if (session?.user) {
            toast.success("Successfully signed in!");
            navigate("/");
          }
        }
        if (event === "SIGNED_OUT") {
          toast.info("Signed out");
        }
        if (event === "USER_UPDATED") {
          toast.success("Profile updated!");
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
              message: { color: 'rgb(var(--destructive))' },
            },
          }}
          theme="light"
          providers={[]}
        />
      </div>
    </div>
  );
};

export default Login;