import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { setUnauthorizedHandler } from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const NEXT_URL_KEY = 'agrolink_next_url';

  const clearSessionAndGoHome = useCallback(() => {
    localStorage.removeItem("agrolink_token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(NEXT_URL_KEY);
    } catch {
      // ignore
    }
    navigate("/", { replace: true });
  }, [navigate]);

  const redirectToNextIfAny = useCallback(() => {
    try {
      const nextUrl = localStorage.getItem(NEXT_URL_KEY);
      if (nextUrl) {
        localStorage.removeItem(NEXT_URL_KEY);
        navigate(nextUrl, { replace: true });
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, [NEXT_URL_KEY, navigate]);

  useEffect(() => {
    setUnauthorizedHandler(clearSessionAndGoHome);
    return () => setUnauthorizedHandler(() => {});
  }, [clearSessionAndGoHome]);

  const executeGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token })
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("agrolink_token", data.token);
          setToken(data.token);
          setUser(data.user);
          setIsAuthenticated(true);

          if (redirectToNextIfAny()) {
            return;
          }
          
          if (data.needsOnboarding) {
            navigate('/onboarding');
          } else {
            navigate('/home');
          }
        } else {
          console.error("Backend auth failed", await response.json());
        }
      } catch (err) {
        console.error("Login mapping failed", err);
      }
    },
    onError: error => console.error("Google login failed", error)
  });

  const loginWithGoogle = () => {
    executeGoogleLogin();
  };

  const handleAuthSuccess = async (newToken) => {
    try {
      localStorage.setItem("agrolink_token", newToken);
      setToken(newToken);

      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });

      if (response.status === 401 || response.status === 404) {
        clearSessionAndGoHome();
        return;
      }

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);

        // If we came from a protected deep link, go back (usually on '/')
        if (window.location.pathname === '/' && redirectToNextIfAny()) {
          return;
        }
      } else {
        localStorage.removeItem("agrolink_token");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("agrolink_token");
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("agrolink_token");
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  useEffect(() => {
    const existingToken = localStorage.getItem("agrolink_token");
    if (existingToken) {
      handleAuthSuccess(existingToken);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    loginWithGoogle,
    handleAuthSuccess,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
