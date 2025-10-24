// frontend/src/ShareForm.jsx
import React, { useState } from "react";
import axios from "axios";

export default function ShareForm() {
  const [addresses, setAddresses] = useState("");
  const [amountPct, setAmountPct] = useState(50);
  const [txPct, setTxPct] = useState(50);
  const [shareId, setShareId] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const list = addresses.split(",").map((s) => s.trim()).filter(Boolean);
      const { data } = await axios.post("http://localhost:4000/api/share", {
        addresses: list,
        chain: "ethereum",
        amountPct: Number(amountPct),
        txPct: Number(txPct),
      });
      setShareId(data.id);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h4>Create Share</h4>
      <form onSubmit={onSubmit}>
        <div>
          <label>Wallet Address</label><br />
          <input value={addresses} onChange={(e) => setAddresses(e.target.value)} style={{ width: 500 }} />
        </div>
        <div>
          <label>Amount %</label><br />
          <input type="number" min={0} max={100} value={amountPct} onChange={(e) => setAmountPct(e.target.value)} />
        </div>
        <div>
          <label>Tx %</label><br />
          <input type="number" min={0} max={100} value={txPct} onChange={(e) => setTxPct(e.target.value)} />
        </div>
        <button disabled={loading}>{loading ? "Working..." : "Create Share"}</button>
      </form>
      {shareId && (
        <div style={{ marginTop: 12 }}>
          Share link: <a href={`/v/${shareId}`}>/v/{shareId}</a>
        </div>
      )}
    </div>
  );
}
