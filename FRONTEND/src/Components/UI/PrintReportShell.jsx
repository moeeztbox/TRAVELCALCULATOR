import React from "react";
import logo from "../../assets/logo-mark.png";
import {
  COMPANY_NAME,
  COMPANY_WEBSITE,
  COMPANY_ADDRESS,
  COMPANY_PHONES,
} from "../../config/company";

// One shared letterhead (header + footer) for every calculator's print-only
// report — same look regardless of which calculator produced it. Callers
// supply only their own report title, client name, and the data table(s)
// as children.
const PrintReportShell = ({ reportTitle, clientName, children }) => (
  <>
    <div
      style={{
        textAlign: "center",
        borderBottom: "2px solid #000",
        paddingBottom: "16px",
        marginBottom: "24px",
      }}
    >
      <img
        src={logo}
        alt="AlBuraq Global"
        style={{ width: "64px", height: "64px", margin: "0 auto 8px" }}
      />
      <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>
        {COMPANY_NAME}
      </h1>
      <p style={{ fontSize: "14px", marginTop: "10px" }}>
        <strong>Report Title:</strong> {reportTitle}
      </p>
      {clientName && (
        <p style={{ fontSize: "14px" }}>
          <strong>Client Name:</strong> {clientName}
        </p>
      )}
    </div>

    <div style={{ fontSize: "13px" }}>{children}</div>

    <div
      style={{
        marginTop: "32px",
        paddingTop: "12px",
        borderTop: "2px solid #000",
        fontSize: "11px",
        textAlign: "center",
        lineHeight: 1.6,
      }}
    >
      <p>
        <strong>Website:</strong> {COMPANY_WEBSITE}
      </p>
      <p>
        <strong>Address:</strong> {COMPANY_ADDRESS}
      </p>
      <p>
        <strong>Contact Numbers:</strong> {COMPANY_PHONES.join("  |  ")}
      </p>
    </div>
  </>
);

export default PrintReportShell;
