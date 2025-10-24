import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function Viewer() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    async function run() {
      try {
        const { data } = await axios.get(`http://localhost:4000/api/view/${id}`);
        setPayload(data);
      } catch (err) {
        console.error("Error fetching share data:", err);
      }
    }
    run();
  }, [id]);

  if (!payload) return <div className="form-box">Loading...</div>;

  // Handle public signals
  const publicInputs = Array.isArray(payload.publicJson)
    ? payload.publicJson
    : Object.values(payload.publicJson || {});

  // Blockscout explorer details
  const blockscoutBase = "https://eth-sepolia.blockscout.com";
  const verifierAddr = "0x55E426E32dFdEbed2826a519b131F070C34D1b71"; // ✅ Replace with your deployed verifier address

  return (
    <div className="form-box">
      <h3 style={{ marginTop: 0, textAlign: "center" }}>Viewer</h3>

      <div style={{ textAlign: "left", width: "100%", marginBottom: 14 }}>
        <p>
          Amount %: <span style={{ color: "#3ad3e9" }}>{payload.amountPct ?? "–"}</span>
        </p>
        <p>
          Tx %: <span style={{ color: "#3ad3e9" }}>{payload.txPct ?? "–"}</span>
        </p>
      </div>

      {/* Display Public Proof Outputs */}
      {publicInputs && publicInputs.length > 0 && (
        <>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>Proved Outputs:</div>
          <pre className="code-block">{JSON.stringify(publicInputs, null, 2)}</pre>
        </>
      )}

      {/* Calldata display */}
      {payload.calldata && (
        <>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>
            Solidity calldata for on‑chain verifier:
          </div>
          <pre className="code-block" style={{ marginBottom: 18 }}>
            {payload.calldata}
          </pre>
        </>
      )}

      {/* Blockscout Integration */}
      <div
        style={{
          marginTop: 24,
          padding: 18,
          background: "rgba(58, 211, 233, 0.1)",
          borderRadius: 8,
          textAlign: "left",
          width: "100%",
        }}
      >
        <h4 style={{ margin: "0 0 12px 0", color: "#3ad3e9" }}>🔍 Verify On‑Chain</h4>

        <p style={{ margin: "8px 0", fontSize: "0.95rem" }}>
          <strong>Verifier Contract:</strong>{" "}
          <a
            href={`${blockscoutBase}/address/${verifierAddr}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3ad3e9", textDecoration: "underline" }}
          >
            View on Blockscout →
          </a>
        </p>

        {payload.verificationTxHash && (
          <p style={{ margin: "8px 0", fontSize: "0.95rem" }}>
            <strong>Verification Transaction:</strong>{" "}
            <a
              href={`${blockscoutBase}/tx/${payload.verificationTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#3ad3e9", textDecoration: "underline" }}
            >
              View Transaction →
            </a>
          </p>
        )}

        <p style={{ margin: "8px 0 0 0", fontSize: "0.85rem", opacity: 0.8 }}>
          Copy the calldata above and use it with the verifier contract’s{" "}
          <code>verifyProof()</code> function to validate on‑chain.
        </p>
      </div>
    </div>
  );
}
