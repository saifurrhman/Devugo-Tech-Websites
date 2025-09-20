import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5000/") // backend API endpoint
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
