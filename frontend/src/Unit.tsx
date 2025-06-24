import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";

import type { Placement, Unit } from "./types";
import { Container, Spinner, Card, Button } from "react-bootstrap";
import crossSectionImage from "./assets/cross-section.png";

interface UnitData {
  unit: Unit;
  placements: {
    placement: Placement;
    history: {
      type: "load" | "extract";
      container_sys_name: string;
      date: Date;
    }[];
  }[];
  placements_coords: [number, number][][];
  placements_text_coords: [number, number][][];
  complects: {
    [key: string]: {
      container_sys_name: string;
      history: (
        | {
            type: "load";
            load_id: number;
            date: Date;
            placement_name: string;
          }
        | {
            type: "extract";
            extract_id: number;
            date: Date;
          }
      )[];
    }[];
  };
}

export default function Unit() {
  const { name_eng } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unitData, setUnitData] = useState<UnitData | undefined>(undefined);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(
    null
  );

  // Retrieves data about the unit
  async function fetchUnitData() {
    const response = await fetch(`/api/unit/${name_eng}`);
    if (response.ok) {
      const unitData = await response.json();
      setUnitData(unitData);
    }
    setLoading(false);
  }

  // Export unit data
  async function exportData() {
    try {
      const response = await fetch(`/api/unit/${name_eng}/export`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Get the filename from the response headers or use a default
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `unit_${name_eng}_export.xlsx`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) {
            filename = match[1];
          }
        }

        // Create a blob from the response and download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Помилка експорту даних");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Помилка експорту даних");
    }
  }

  // Called once on page load
  useEffect(() => {
    fetchUnitData().catch(console.error);
  }, []);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3" />
          <div>Завантаження...</div>
        </div>
      </Container>
    );
  }

  if (unitData === undefined) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">Помилка!</div>
      </Container>
    );
  }

  const {
    unit,
    placements,
    placements_coords,
    placements_text_coords,
    complects,
  } = unitData;

  const placements_data = placements.map(function (placement) {
    const { sector, sector_num, name } = placement.placement;
    const [x, y] = placements_coords[sector][sector_num];
    const [text_x, text_y] = placements_text_coords[sector][sector_num];

    const history = placement.history;

    let occupied = false;
    let last_sys_name: string | undefined = undefined;

    if (history.length > 0) {
      const last = history[history.length - 1];
      last_sys_name = last.container_sys_name;
      if (last.type === "load") {
        occupied = true;
      }
    }

    const color = occupied ? "black" : "white";

    const history_periods: {
      container_sys_name: string;
      load_date: Date;
      extract_date: Date | undefined;
    }[] = [];
    let last_load_event:
      | {
          container_sys_name: string;
          load_date: Date;
        }
      | undefined = undefined;

    history.forEach((event) => {
      if (event.type === "load") {
        if (last_load_event !== undefined) {
          throw new Error("Load event into occupied placement!");
        } else {
          last_load_event = {
            container_sys_name: event.container_sys_name,
            load_date: event.date,
          };
        }
      } else {
        if (last_load_event === undefined) {
          throw new Error("Extract event from empty placement!");
        } else {
          history_periods.push({
            container_sys_name: last_load_event.container_sys_name,
            load_date: last_load_event.load_date,
            extract_date: event.date,
          });
          last_load_event = undefined;
        }
      }
    });

    if (last_load_event !== undefined) {
      history_periods.push({
        container_sys_name: last_load_event.container_sys_name,
        load_date: last_load_event.load_date,
        extract_date: undefined,
      });
    }

    return {
      name: name,
      history_periods: history_periods,
      last_sys_name: last_sys_name,
      color: color,
      x: x,
      y: y,
      text_x: text_x,
      text_y: text_y,
    };
  });

  const complects_data = Object.fromEntries(
    Object.entries(complects).map(function ([complect_name, complect]) {
      const periods_data: {
        load_id: number;
        container_sys_name: string;
        placement_name: string;
        load_date: Date;
        extract_date?: Date;
      }[] = [];

      complect.forEach((csh) => {
        let history = csh.history;
        while (history.length > 0) {
          const period = history.slice(0, 2);
          history = history.slice(2);

          if (period[0].type !== "load") {
            throw new Error(
              "Expected load type for the first item in the period"
            );
          }
          if (period.length > 1) {
            if (period[1].type !== "extract") {
              throw new Error(
                "Expected extract type for the second item in the period"
              );
            }
          }

          const placement_name = period[0].placement_name;
          const load_date = period[0].date;
          const extract_date = period.length > 1 ? period[1].date : undefined;
          periods_data.push({
            load_id: period[0].load_id,
            container_sys_name: csh.container_sys_name,
            placement_name: placement_name,
            load_date: load_date,
            extract_date: extract_date,
          });
        }
      });

      periods_data.sort(function (a, b) {
        if (a.load_date < b.load_date) return -1;
        else if (a.load_date > b.load_date) return 1;
        else {
          if (a.placement_name < b.placement_name) return -1;
          else if (a.placement_name > b.placement_name) return 1;
          else return 0;
        }
      });

      return [complect_name, periods_data];
    })
  );
  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 60px)",
        fontFamily: "Arial, sans-serif",
        minWidth: "1200px", // Ensure minimum total layout width
      }}
    >
      {" "}
      {/* Left section - 1/4 space */}
      <div
        style={{
          flex: "1",
          minWidth: "320px",
          padding: "20px",
          borderRight: "1px solid #ccc",
        }}
      >
        {" "}
        {/* Back link */}
        <div
          onClick={() => navigate("/navigator/units")}
          style={{
            marginBottom: "20px",
            color: "#0d6efd",
            cursor: "pointer",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "16px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#0a58ca";
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#0d6efd";
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          ← Назад до списку блоків
        </div>{" "}
        <h3
          style={{
            marginBottom: "20px",
            color: "#333",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Інформація про блок
        </h3>{" "}
        <Card className="shadow-sm" style={{ border: "2px solid #dee2e6" }}>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <tbody>
                  <tr>
                    <td
                      className="fw-bold text-muted"
                      style={{
                        width: "45%",
                        padding: "12px 16px",
                        backgroundColor: "#f8f9fa",
                        borderRight: "1px solid #dee2e6",
                      }}
                    >
                      Номер блоку
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="fw-semibold">{unit.num || "-"}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="fw-bold text-muted"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8f9fa",
                        borderRight: "1px solid #dee2e6",
                      }}
                    >
                      Найменування блоку
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="fw-semibold">{unit.name || "-"}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="fw-bold text-muted"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8f9fa",
                        borderRight: "1px solid #dee2e6",
                      }}
                    >
                      Найменування блоку (англ.)
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="fw-semibold">
                        {unit.name_eng || "-"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="fw-bold text-muted"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8f9fa",
                        borderRight: "1px solid #dee2e6",
                      }}
                    >
                      Проект
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="fw-semibold">{unit.design || "-"}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="fw-bold text-muted"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8f9fa",
                        borderRight: "1px solid #dee2e6",
                      }}
                    >
                      Черга
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="fw-semibold">{unit.stage || "-"}</span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="fw-bold text-muted"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8f9fa",
                        borderRight: "1px solid #dee2e6",
                      }}
                    >
                      Встановлена потужність, МВ
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="fw-semibold">
                        {unit.power ? Math.round(unit.power).toString() : "-"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="fw-bold text-muted"
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8f9fa",
                        borderRight: "1px solid #dee2e6",
                      }}
                    >
                      Дата початку експлуатації
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="fw-semibold">
                        {unit.start_date
                          ? new Date(unit.start_date).toLocaleDateString(
                              "uk-UA"
                            )
                          : "-"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
        {/* Selected/Hovered placement card */}
        {selectedPlacement && (
          <div
            style={{
              marginTop: "20px",
              backgroundColor: "white",
              border: "2px solid #ccc",
              borderRadius: "8px",
              padding: "12px 16px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                color: "#007bff",
                marginBottom: "12px",
              }}
            >
              Місце {selectedPlacement}
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px",
                marginTop: "8px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px 6px",
                      backgroundColor: "#f5f5f5",
                      fontSize: "10px",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Збірка
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px 6px",
                      backgroundColor: "#f5f5f5",
                      fontSize: "10px",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Завантажено
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px 6px",
                      backgroundColor: "#f5f5f5",
                      fontSize: "10px",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Вивантажено
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Get data for the selected placement from placements_data */}
                {(() => {
                  const placementData = placements_data.find(
                    (p) => p.name === selectedPlacement
                  );

                  if (!placementData) return null;

                  // Sort history periods by load date
                  const sortedPeriods = [...placementData.history_periods].sort(
                    (a, b) =>
                      new Date(a.load_date).getTime() -
                      new Date(b.load_date).getTime()
                  );
                  return sortedPeriods.map((period, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: period.extract_date
                          ? "transparent"
                          : "#ffe6e6",
                      }}
                    >
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "4px 6px",
                          fontSize: "10px",
                          textAlign: "center",
                        }}
                      >
                        {period.container_sys_name}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "4px 6px",
                          fontSize: "10px",
                          textAlign: "center",
                        }}
                      >
                        {new Date(period.load_date).toLocaleDateString("uk-UA")}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "4px 6px",
                          fontSize: "10px",
                          textAlign: "center",
                        }}
                      >
                        {period.extract_date ? (
                          new Date(period.extract_date).toLocaleDateString(
                            "uk-UA"
                          )
                        ) : (
                          <i>опромінюється</i>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Center section - 2/4 (remaining) space */}
      <div
        id="main-cross-section-div"
        style={{
          flex: "2",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "20px",
          paddingTop: "40px",
          position: "relative", // Add relative positioning for the card
        }}
      >
        {/* Export button in upper right corner */}
        <Button
          variant="primary"
          onClick={exportData}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            fontSize: "12px",
            padding: "6px 12px",
            zIndex: 10,
          }}
        >
          Експорт
        </Button>
        <div style={{ textAlign: "center", maxHeight: "100%" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              textAlign: "center",
              margin: 0,
              marginBottom: "20px",
            }}
          >
            {unitData.unit.name}
          </h1>
          <div
            style={{
              position: "relative",
              display: "inline-block",
            }}
          >
            <img
              src={crossSectionImage}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(100vh - 60px - 200px)", // 60px navbar + 200px for title and padding
                width: "auto",
                height: "auto",
                display: "block",
              }}
              alt="Вигородка"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 6000 6000"
              style={{
                background: "transparent",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "all",
              }}
              onClick={(e) => {
                // Click outside any placement to deselect
                if (e.target === e.currentTarget) {
                  setSelectedPlacement(null);
                }
              }}
            >
              {placements_data.map((placement) => (
                <g key={placement.name}>
                  <circle
                    id={`placement-circle-highlight-${placement.name}`}
                    cx={placement.x}
                    cy={placement.y}
                    r="150"
                    fill={
                      selectedPlacement === placement.name
                        ? "orange"
                        : "transparent"
                    }
                    fillOpacity={selectedPlacement === placement.name ? 0.7 : 0}
                    style={{ cursor: "pointer" }}
                  />
                  <circle
                    id={`placement-circle-black-${placement.name}`}
                    cx={placement.x}
                    cy={placement.y}
                    r="110"
                    fill="black"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlacement(
                        selectedPlacement === placement.name
                          ? null
                          : placement.name
                      );
                    }}
                  />
                  <circle
                    id={`placement-circle-inner-${placement.name}`}
                    cx={placement.x}
                    cy={placement.y}
                    r="90"
                    fill="white"
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    id={`placement-circle-core-${placement.name}`}
                    cx={placement.x}
                    cy={placement.y}
                    r="70"
                    fill={placement.color}
                    style={{ pointerEvents: "none" }}
                  />
                  <text
                    id={`placement-text-${placement.name}`}
                    x={placement.text_x}
                    textAnchor="middle"
                    y={placement.text_y + 50}
                    fontWeight={
                      placement.last_sys_name === placement.name
                        ? "normal"
                        : "bold"
                    }
                    fontSize="150"
                    fontFamily="sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {placement.last_sys_name
                      ? placement.last_sys_name
                      : placement.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
      {/* Right section - 1/4 space */}
      <div
        style={{
          flex: "1",
          minWidth: "400px", // Minimum width to ensure tables fit properly
          padding: "15px",
          borderLeft: "1px solid #ccc",
          overflowY: "auto",
          overflowX: "auto", // Allow horizontal scroll if content exceeds min width
          maxHeight: "calc(100vh - 60px)",
        }}
      >
        <h3
          style={{
            marginBottom: "15px",
            color: "#333",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Комплекти ЗС
        </h3>
        {Object.entries(complects_data).map(([complect_name, periods_data]) => (
          <Card
            key={complect_name}
            className="mb-2"
            style={{
              fontSize: "13px",
              minWidth: "350px", // Minimum card width to ensure table fits
            }}
          >
            <Card.Header
              style={{ backgroundColor: "#e8f5e8", padding: "8px 12px" }}
            >
              <Card.Title className="mb-0" style={{ fontSize: "14px" }}>
                Комплект <strong>{complect_name}</strong>
              </Card.Title>
            </Card.Header>
            <Card.Body style={{ padding: "8px" }}>
              <div style={{ overflowX: "auto", minWidth: "320px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    minWidth: "320px", // Ensure table has minimum width for all columns
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "5px",
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          fontSize: "11px",
                          fontWeight: "bold",
                          minWidth: "60px", // Minimum width for assembly column
                        }}
                      >
                        Збірка
                      </th>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "5px",
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          fontSize: "11px",
                          fontWeight: "bold",
                          minWidth: "90px", // Minimum width for date column
                        }}
                      >
                        Завантажено
                      </th>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "5px",
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          fontSize: "11px",
                          fontWeight: "bold",
                          minWidth: "60px", // Minimum width for place column
                        }}
                      >
                        Місце
                      </th>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "5px",
                          textAlign: "center",
                          backgroundColor: "#e3f2fd",
                          fontSize: "11px",
                          fontWeight: "bold",
                          minWidth: "90px", // Minimum width for unload date column
                        }}
                      >
                        Вивантажено
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods_data.map((period_data) => (
                      <tr
                        key={period_data.load_id}
                        style={{
                          backgroundColor:
                            selectedPlacement === period_data.placement_name
                              ? "#ffa50080"
                              : period_data.extract_date
                              ? "transparent"
                              : "#ffe6e6",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setSelectedPlacement(
                            selectedPlacement === period_data.placement_name
                              ? null
                              : period_data.placement_name
                          )
                        }
                      >
                        <td
                          style={{
                            border: "1px solid #ddd",
                            textAlign: "center",
                            padding: "4px",
                            fontSize: "11px",
                            minWidth: "60px",
                          }}
                        >
                          {period_data.container_sys_name}
                        </td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            textAlign: "center",
                            padding: "4px",
                            fontSize: "11px",
                            minWidth: "90px",
                          }}
                        >
                          {new Date(period_data.load_date).toLocaleDateString(
                            "uk-UA"
                          )}
                        </td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            textAlign: "center",
                            padding: "4px",
                            fontSize: "11px",
                            minWidth: "60px",
                          }}
                        >
                          <strong>{period_data.placement_name}</strong>
                        </td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            textAlign: "center",
                            padding: "4px",
                            fontSize: "11px",
                            minWidth: "90px",
                          }}
                        >
                          {period_data.extract_date ? (
                            new Date(
                              period_data.extract_date
                            ).toLocaleDateString("uk-UA")
                          ) : (
                            <i>опромінюється</i>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}
