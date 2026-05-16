import { useState } from "react";
import HomePage from "./app/home/page";
import GreetingForm from "./features/greeting/components/GreetingForm";
import TestForm from "./test/TestForm";
import TestUser from "./test/TestUser";

export default function App() {
  const [showTest, setShowTest] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowTest(!showTest)}
        style={{
          position: "fixed",
          top: 8,
          right: 8,
          zIndex: 9999,
          fontSize: "0.75rem",
          opacity: 0.7,
        }}
      >
        {showTest ? "Home" : "User Test"}
      </button>
      {showTest ? <TestUser /> : <HomePage />}
    </>
  );
}
