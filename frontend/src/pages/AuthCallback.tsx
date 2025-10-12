import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a bit for the session cookie to be set
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Force refetch user data
        window.location.href = "/invoices";
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Signing you in...</h2>
          <p className="text-muted-foreground">Syncing your data to the cloud</p>
        </div>
      </div>
    </div>
  );
}

