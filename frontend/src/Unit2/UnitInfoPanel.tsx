import { UnitModel } from "../types";

interface UnitInfoPanelProps {
  unit: UnitModel;
}

export default function UnitInfoPanel({ unit }: UnitInfoPanelProps) {
  return (
    <div
      id="unit-info-panel"
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "1.5rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        id="unit-info-title"
        style={{
          marginBottom: "1rem",
          color: "#495057",
          fontSize: "1.2rem",
          flexShrink: 0,
        }}
      >
        Інформація про блок
      </h3>
      <div
        id="unit-basic-info"
        style={{
          fontSize: "0.9rem",
          lineHeight: "1.6",
        }}
      >
        <p>
          <strong>Проект:</strong> {unit.design}
        </p>
        <p>
          <strong>Потужність:</strong>
          {unit.power ? `${unit.power} МВт` : "Не вказано"}
        </p>
        <p>
          <strong>Етап:</strong> {unit.stage || "Не вказано"}
        </p>
        <p>
          <strong>Дата запуску:</strong>
          {unit.start_date
            ? new Date(unit.start_date).toLocaleDateString("uk-UA")
            : "Не вказано"}
        </p>
      </div>
    </div>
  );
}
