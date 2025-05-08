import React, { useState, useEffect } from "react";
import LoginPage from "./pages/login";
import Dashboard from "./pages/dashboard";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    if (storedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setLoading(true); // Start loading
    setTimeout(() => {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      setLoading(false); // End loading after 2 seconds
    }, 2000); // 2-second delay
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a spinner or any loading component
  }

  return isLoggedIn ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
