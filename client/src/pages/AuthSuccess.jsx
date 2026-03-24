import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthSuccess, user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    // Process the token only once
    if (token && !isProcessing) {
      setIsProcessing(true);
      handleAuthSuccess(token);
    } else if (!token && !isProcessing) {
      // If there's no token in URL, redirect to login with error
      navigate("/?error=true", { replace: true });
    }
  }, [searchParams, handleAuthSuccess, navigate, isProcessing]);

  useEffect(() => {
    // Navigate once the user data is fetched and populated in context
    if (isAuthenticated && user) {
      if (user.categories && user.categories.length > 0) {
        navigate("/home", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-primary shadow-lg mb-8">
        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white relative z-10"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold text-text-primary mb-2">
        Setting up your account...
      </h2>

      <svg
        className="animate-spin h-6 w-6 text-primary mt-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default AuthSuccess;
