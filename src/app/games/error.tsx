"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Games Page Error:", error);
  }, [error]);

  return (
    <div style={{ padding: "50px", textAlign: "center", color: "red" }}>
      <h2>Something went wrong in the Game page!</h2>
      <p style={{ fontFamily: "monospace", backgroundColor: "#ffebee", padding: "10px" }}>
        {error.message}
      </p>
      <button
        onClick={() => reset()}
        style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
