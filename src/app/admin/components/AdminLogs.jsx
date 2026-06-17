// src/admin/components/AdminLogs.jsx

import React from "react";
import { adminLogs } from "../constants/adminLogs";

const AdminLogs = () => {
  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        📘 Admin Logs
      </h2>
      <div style={{
        background: "#1a1a1a",
        color: "#eee",
        padding: "1rem",
        borderRadius: "0.5rem",
        maxHeight: "250px",
        overflowY: "auto",
        border: "1px solid #333"
      }}>
        {adminLogs.length === 0 ? (
          <p style={{ color: "#aaa" }}>No logs yet.</p>
        ) : (
          adminLogs.map((log, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              <p>{log.message}</p>
              <small style={{ color: "#888" }}>{log.date}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
