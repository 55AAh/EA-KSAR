import { useParams } from "react-router";
import { useState, useEffect } from "react";

import type { Placement, Unit } from "./types";
import { Container, Spinner, Card } from "react-bootstrap";
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
  const [loading, setLoading] = useState(true);
  const [unitData, setUnitData] = useState<UnitData | undefined>(undefined);

  // Retrieves data about the unit
  async function fetchUnitData() {
    const response = await fetch(`/api/unit/${name_eng}`);
    if (response.ok) {
      const unitData = await response.json();
      setUnitData(unitData);
    }
    setLoading(false);
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

  console.log(unitData);

  const placements_data = placements.map(function (placement) {
    const { sector, sector_num, name } = placement.placement;
    const [x, y] = placements_coords[sector][sector_num];
    const [text_x, text_y] = placements_text_coords[sector][sector_num];

    const history = placement.history;

    let occupied = false;
    let last_sys_name = undefined;

    if (history.length > 0) {
      const last = history[history.length - 1];
      last_sys_name = last.container_sys_name;
      if (last.type === "load") {
        occupied = true;
      }
    }

    const color = occupied ? "black" : "white";

    return {
      name: name,
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
              "Expected load type for the first item in the period",
            );
          }
          if (period.length > 1) {
            if (period[1].type !== "extract") {
              throw new Error(
                "Expected extract type for the second item in the period",
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
    }),
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
      {/* Left section - 1/4 space */}
      <div
        style={{ flex: "1", padding: "20px", borderRight: "1px solid #ccc" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  backgroundColor: "#e3f2fd",
                }}
              >
                Параметр
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  backgroundColor: "#e3f2fd",
                }}
              >
                Значення
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                Номер блоку
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {unit.num || "-"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                Найменування блоку
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {unit.name || "-"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                Найменування блоку (англ.)
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {unit.name_eng || "-"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                Проект
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {unit.design || "-"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                Черга
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {unit.stage || "-"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                Встановлена потужність, МВ
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {unit.power ? Math.round(unit.power).toString() : "-"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                Дата початку експлуатації
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {unit.start_date
                  ? new Date(unit.start_date).toLocaleDateString("uk-UA")
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Center section - 2/4 (remaining) space */}
      <div
        style={{
          flex: "2",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "20px",
          paddingTop: "40px",
        }}
      >
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
                maxHeight: "calc(100vh - 60px - 150px)", // 60px navbar + 150px for title and padding
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
                pointerEvents: "none",
              }}
            >
              {placements_data.map((placement) => (
                <g>
                  <circle
                    id={`placement-circle-${placement.name}`}
                    key={placement.name}
                    cx={placement.x}
                    cy={placement.y}
                    r="70"
                    fill={placement.color}
                  />
                  <text
                    id={`placement-text-${placement.name}`}
                    key={placement.name}
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
                  >
                    {placement.last_sys_name
                      ? placement.last_sys_name
                      : placement.name}
                  </text>
                </g>
              ))}

              {placements_data.map((placement) => (
                <g></g>
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
                          backgroundColor: period_data.extract_date
                            ? "transparent"
                            : "#ffe6e6",
                        }}
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
                          {period_data.load_date.toString()}
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
                          {period_data.extract_date
                            ? period_data.extract_date.toString()
                            : "-"}
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
