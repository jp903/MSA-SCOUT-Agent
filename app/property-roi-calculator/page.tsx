"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PropertyROICalculator from "@/components/property-roi-calculator";
import { AuthService } from "@/lib/auth";
import { User } from "@/lib/user-types";

export default function PropertyROICalculatorPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const sessionToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('session_token='))
        ?.split('=')[1];

      if (sessionToken) {
        const userData = await AuthService.verifySession(sessionToken);
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthRequired = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access the Property ROE Calculator",
    });
    // Redirect to main page where user can sign in
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading Property ROE Calculator
          </h2>
          <p className="text-gray-600 mt-2">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PropertyROICalculator user={user} onAuthRequired={handleAuthRequired} />
    </div>
  );
}