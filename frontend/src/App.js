import React, { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import { API_BASE } from "./lib/api";

function App() {
  const [message, setMessage] = useState("Loading...");

  // Google Analytics - Initialize once when app loads
  useEffect(() => {
    ReactGA.initialize("G-07SLJ93ESY");
    
    // Track initial page view
    ReactGA.send({ 
      hitType: "pageview", 
      page: window.location.pathname + window.location.search 
    });
  }, []);

  // Fetch backend API
  useEffect(() => {
    fetch(`${API_BASE}/`) // backend API endpoint (auto-detected host)
      .then((res) => res.json())    // convert response to JSON
      .then((data) => setMessage(data.message)) // set state
      .catch((err) => setMessage("Error connecting to backend 😢"));
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-red-900">
        {message}
      </h1>
    </div>
  );
}

export default App;