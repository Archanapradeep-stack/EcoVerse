"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global App Error:", error);
  }, [error]);

  return (
    <div style={{ padding: "50px", textAlign: "center", color: "red", backgroundColor: "#fdfdfd", minHeight: "100vh" }}>
      <h2>Something went wrong!</h2>
      <p style={{ fontFamily: "monospace", backgroundColor: "#ffebee", padding: "15px", borderRadius: "8px", maxWidth: "800px", margin: "20px auto", wordWrap: "break-word" }}>
        {error.message || "An unknown error occurred."}
      </p>
      <button
        onClick={() => reset()}
        style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "5px" }}
      >
        Try again
      </button>
    </div>
  );
}
