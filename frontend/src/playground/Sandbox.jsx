import { useState } from "react";
import axios from "axios";

export default function Sandbox() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  

  const testApiCall = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      // Simple public GET, matches your contract: GET /api/v1/kpop_groups
      const res = await axios.get(`${API_URL}`);
      setData(res.data); // Rails should return { success, data: [...] }
    } catch (err) {
      // Basic error message (you can expand this later)
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <button onClick={testApiCall} disabled={loading}>
        {loading ? "Loading..." : "Test GET /api/v1/kpop_groups"}
      </button>

      {error && (
        <div style={{ marginTop: "1rem", color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "0.5rem",
            background: "#f3f3f3",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
