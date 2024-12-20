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
      console.log('Checking authentication status...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error checking auth status:', error);
        toast.error("Error checking authentication status");
        return;
      }
      if (user) {
        console.log('User already authenticated:', user.id);
        navigate("/");
      } else {
        console.log('No authenticated user found');
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === "SIGNED_IN") {
          if (session?.user) {
            console.log('User signed in successfully:', session.user.id);
            toast.success("Successfully signed in!");
            navigate("/");
          }
        }
        if (event === "SIGNED_OUT") {
          console.log('User signed out');
          toast.info("Signed out");
        }
        if (event === "USER_UPDATED") {
          console.log('User profile updated');
          toast.success("Profile updated!");
        }
      }
    );

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
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