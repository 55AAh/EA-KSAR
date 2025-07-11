import { UnitDetailsModel } from "../Unit2";

interface RawDataPanelProps {
  data: UnitDetailsModel;
}

export default function RawDataPanel({ data }: RawDataPanelProps) {
  return (
    <div
      id="cross-section-panel"
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <h3
        id="unit-name-title"
        style={{
          marginBottom: "1rem",
          color: "#495057",
          fontSize: "1.8rem",
          flexShrink: 0,
          textAlign: "center",
          fontWeight: "600",
        }}
      >
        {data.unit.name} - Raw Data
      </h3>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
          padding: "1rem",
        }}
      >
        <pre
          style={{
            margin: 0,
            fontSize: "0.75rem",
            lineHeight: "1.4",
            color: "#495057",
            fontFamily: "Monaco, Consolas, 'Courier New', monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
