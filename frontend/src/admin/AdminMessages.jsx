import React from "react";

export default function AdminMessages({ messages, loading }) {
  return (
    <div className="admin-messages-view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", color: "var(--adm-text-main)" }}>Customer Inquiries & Messages</h2>
          <p style={{ color: "var(--adm-text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>
            Direct messages received through the store's Contact Us form.
          </p>
        </div>
        <span style={{ fontWeight: 700, color: "var(--adm-text-muted)", fontSize: "0.88rem" }}>
          Total Inquiries: {messages.length}
        </span>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "130px" }}>Date</th>
              <th style={{ width: "180px" }}>Sender Name</th>
              <th style={{ width: "220px" }}>Email</th>
              <th style={{ width: "130px" }}>Phone</th>
              <th style={{ minWidth: "300px" }}>Message Content</th>
              <th style={{ width: "100px" }}>Reply</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--adm-text-muted)" }}>
                  ⏳ Loading customer inquiries...
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--adm-text-muted)" }}>
                  💬 No customer inquiries found.
                </td>
              </tr>
            ) : (
              messages.map((m) => {
                const dateStr = m.created_at
                  ? new Date(m.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={m.id || Math.random()}>
                    <td style={{ fontSize: "0.85rem" }}>{dateStr}</td>
                    <td><b>{m.name}</b></td>
                    <td>
                      <a href={`mailto:${m.email}`} style={{ color: "var(--adm-primary)", fontWeight: 600 }}>
                        {m.email}
                      </a>
                    </td>
                    <td>{m.phone || "—"}</td>
                    <td style={{ maxWidth: "340px", lineHeight: 1.5, whiteSpace: "normal" }}>
                      {m.message}
                    </td>
                    <td>
                      <a
                        href={`mailto:${m.email}?subject=Reply from ECartline Store Support`}
                        className="btn line"
                        style={{ minHeight: "28px", padding: "0 10px", fontSize: "0.78rem", display: "inline-flex" }}
                      >
                        ✉️ Reply
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
