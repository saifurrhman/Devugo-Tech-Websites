import React, { useEffect, useState } from "react";
import { API_BASE } from "./lib/api";

function App() {
  const [message, setMessage] = useState("Loading...");

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
