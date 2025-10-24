// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ShareForm from "./ShareForm";
import Viewer from "./Viewer";
import "./App.css";
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16 }}>
        <h3>ALLXDefi Private Share(Hardhat & Blockscout)</h3>
        <nav>
          <Link to="/share">Create Share</Link>{" | "}
          <Link to="/v/demo">Demo Viewer</Link>
        </nav>
        <Routes>
          <Route path="/share" element={<ShareForm />} />
          <Route path="/v/:id" element={<Viewer />} />
          <Route path="*" element={<ShareForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
