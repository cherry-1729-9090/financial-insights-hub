import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import { fetchUserCreditProfile } from "./lib/utils";
import { useToast } from "@/components/ui/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => {
  const [userData, setUserData] = useState<any>(null);
  const [payload, setPayload] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {data, payload} = await fetchUserCreditProfile();
        console.log('[App] [fetchData] [payload]', payload);
        console.log('[App] [fetchData] [data]', data);
        setUserData(data);
        setPayload(payload);
        if (!data.credit_score) {
          toast({
            title: "Using Demo Data",
            description: "No user token provided. Using demo data for demonstration.",
          });
        }
        console.log('[App] [fetchData] [userData]', userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user data. Using demo data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse text-primary font-semibold">
          Loading your financial profile...
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <Routes>
              <Route path="/" element={<Chat userData={userData} payload={payload} />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;