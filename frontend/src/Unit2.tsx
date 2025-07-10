import { useLoaderData, LoaderFunctionArgs } from "react-router";
import { useState, useEffect } from "react";
import { usePageTitle } from "./hooks/usePageTitle";
import { parseErrorResponse } from "./utils";

// @ts-ignore
import crossSectionImage from "./assets/cross-section.png";
import { Unit2ResponseSchema } from "./types";

// Loader function for Unit page
export async function unitLoader2({ params }: LoaderFunctionArgs) {
  const { name_eng } = params;

  if (!name_eng) {
    throw new Response("Unit name is required", {
      status: 404,
      statusText: "Not Found",
    });
  }

  const response = await fetch(`/api/unit2/${name_eng}`);

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return await response.json();
}

export default function Unit2() {
  const data = useLoaderData() as Unit2ResponseSchema;
  const [selectedPlacement, setSelectedPlacement] = useState<number | null>(
    null
  );

  usePageTitle();

  // Set page title with unit name
  useEffect(() => {
    document.title = `${data.unit.name} - КСАР`;
  }, [data.unit.name]);

  return (
    <div
      id="unit-page-container"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
        overflow: "hidden",
      }}
    >
      {/* Main three-panel layout */}
      <div
        id="unit-three-panel-layout"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "350px 1fr 350px",
          gap: "1rem",
          padding: "1rem",
          minHeight: 0,
        }}
      >
        {/* Left panel - Unit Info */}
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
              marginBottom: "1.5rem",
              flexShrink: 0,
            }}
          >
            <p>
              <strong>Проект:</strong> {data.unit.design}
            </p>
            <p>
              <strong>Потужність:</strong>
              {data.unit.power ? `${data.unit.power} МВт` : "Не вказано"}
            </p>
            <p>
              <strong>Етап:</strong> {data.unit.stage || "Не вказано"}
            </p>
            <p>
              <strong>Дата запуску:</strong>
              {data.unit.start_date
                ? new Date(data.unit.start_date).toLocaleDateString("uk-UA")
                : "Не вказано"}
            </p>
          </div>

          {/* Spacer to push placement card to bottom */}
          <div style={{ flex: 1 }} />

          {/* Selected Placement Card */}
          {selectedPlacement && (
            <div
              id="selected-placement-card"
              style={{
                padding: "1rem",
                backgroundColor: "#fff3cd",
                borderRadius: "6px",
                border: "1px solid #ffeaa7",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                flexShrink: 0,
              }}
            >
              <h5
                id="selected-placement-title"
                style={{
                  margin: 0,
                  marginBottom: "0.5rem",
                  color: "#856404",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                Вибране місце розташування -
                {data.unit.reactor_vessel.sectors
                  ?.flatMap((sector) => sector.placements)
                  ?.find(
                    (placement) => placement.placement_id === selectedPlacement
                  )?.name || "Невідоме"}
              </h5>
              <div style={{ fontSize: "0.85rem", color: "#856404" }}>
                <strong>Історія завантажень:</strong>
                <div
                  id="placement-loads-table-container"
                  style={{
                    marginTop: "0.5rem",
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                  }}
                >
                  {(() => {
                    const selectedPlacementData =
                      data.unit.reactor_vessel.sectors
                        ?.flatMap((sector) => sector.placements)
                        ?.find(
                          (placement) =>
                            placement.placement_id === selectedPlacement
                        );

                    const loads = selectedPlacementData?.loads || [];

                    if (loads.length === 0) {
                      return (
                        <div
                          style={{
                            padding: "1rem",
                            textAlign: "center",
                            color: "#6c757d",
                            fontStyle: "italic",
                          }}
                        >
                          Завантажень не знайдено
                        </div>
                      );
                    }

                    return (
                      <table
                        id="placement-loads-table"
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "0.75rem",
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                padding: "8px",
                                backgroundColor: "#e9ecef",
                                border: "1px solid #dee2e6",
                                textAlign: "center",
                                fontWeight: "600",
                                color: "#495057",
                              }}
                            >
                              Збірка
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                backgroundColor: "#e9ecef",
                                border: "1px solid #dee2e6",
                                textAlign: "center",
                                fontWeight: "600",
                                color: "#495057",
                              }}
                            >
                              Завантажено
                            </th>
                            <th
                              style={{
                                padding: "8px",
                                backgroundColor: "#e9ecef",
                                border: "1px solid #dee2e6",
                                textAlign: "center",
                                fontWeight: "600",
                                color: "#495057",
                              }}
                            >
                              Вивантажено
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loads.map((load, index) => (
                            <tr
                              key={index}
                              style={{
                                backgroundColor: load.extract_date
                                  ? "white"
                                  : "#ffe6e6",
                              }}
                            >
                              <td
                                style={{
                                  padding: "6px 8px",
                                  border: "1px solid #dee2e6",
                                  textAlign: "center",
                                  color: "#495057",
                                }}
                              >
                                {load.container_sys_name}
                              </td>
                              <td
                                style={{
                                  padding: "6px 8px",
                                  border: "1px solid #dee2e6",
                                  textAlign: "center",
                                  color: "#495057",
                                }}
                              >
                                {load.load_date}
                              </td>
                              <td
                                style={{
                                  padding: "6px 8px",
                                  border: "1px solid #dee2e6",
                                  textAlign: "center",
                                  color: "#495057",
                                  fontStyle: load.extract_date
                                    ? "normal"
                                    : "italic",
                                }}
                              >
                                {load.extract_date || "опромінюється"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center panel - Interactive Cross-section */}
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
            {data.unit.name}
          </h3>
          <div
            id="cross-section-image-wrapper"
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <div
              id="cross-section-container"
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <img
                id="cross-section-image"
                src={crossSectionImage}
                alt="Вигородка"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "contain",
                }}
              />
              <svg
                id="placement-overlay-svg"
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
                {data.unit.reactor_vessel.sectors.map((sector) =>
                  sector.placements.map(function (placement) {
                    const coords = placement.coords;

                    if (!coords) {
                      console.warn(
                        `No coords found for placement ${placement.placement_id}`
                      );
                      return null;
                    }

                    // For now, use the same coords for text until we add text_coords to backend
                    const text_coords = coords;

                    return (
                      <g
                        key={`placement-${placement.placement_id}`}
                        id={`placement-${placement.placement_id}`}
                      >
                        <circle
                          id={`placement-circle-highlight-${placement.placement_id}`}
                          cx={coords[0]}
                          cy={coords[1]}
                          r="150"
                          fill={
                            selectedPlacement === placement.placement_id
                              ? "orange"
                              : "transparent"
                          }
                          fillOpacity={
                            selectedPlacement === placement.placement_id
                              ? 0.7
                              : 0
                          }
                          style={{ cursor: "pointer" }}
                        />
                        <circle
                          id={`placement-circle-black-${placement.placement_id}`}
                          cx={coords[0]}
                          cy={coords[1]}
                          r="110"
                          fill="black"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlacement(
                              selectedPlacement === placement.placement_id
                                ? null
                                : placement.placement_id
                            );
                          }}
                        />
                        <circle
                          id={`placement-circle-inner-${placement.placement_id}`}
                          cx={coords[0]}
                          cy={coords[1]}
                          r="90"
                          fill="white"
                          style={{ pointerEvents: "none" }}
                        />
                        <circle
                          id={`placement-circle-core-${placement.placement_id}`}
                          cx={coords[0]}
                          cy={coords[1]}
                          r="70"
                          fill={true ? "black" : "white"}
                          style={{ pointerEvents: "none" }}
                        />
                        <text
                          id={`placement-text-${placement.placement_id}`}
                          x={text_coords[0]}
                          y={text_coords[1]}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontWeight={true ? "normal" : "bold"}
                          fontSize="150"
                          fontFamily="sans-serif"
                          style={{ pointerEvents: "none" }}
                        >
                          {placement.name}
                        </text>
                      </g>
                    );
                  })
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Right panel - Complects */}
        <div
          id="complects-panel"
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            padding: "1.5rem",
            overflow: "auto",
          }}
        >
          <h3
            id="complects-title"
            style={{
              marginBottom: "1rem",
              color: "#495057",
              fontSize: "1.2rem",
            }}
          >
            Комплекти зразків
          </h3>
          {data.unit.reactor_vessel?.coupon_complects &&
          data.unit.reactor_vessel.coupon_complects.length > 0 ? (
            <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
              {data.unit.reactor_vessel.coupon_complects.map((complect) => (
                <div
                  key={complect.coupon_complect_id}
                  id={`complect-${complect.coupon_complect_id}`}
                  style={{
                    marginBottom: "1rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef",
                    overflow: "hidden",
                  }}
                >
                  {/* Complect Header */}
                  <div
                    style={{
                      padding: "0.5rem 0.75rem",
                      backgroundColor: "#e9ecef",
                      borderBottom: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#495057",
                        fontSize: "0.9rem",
                      }}
                    >
                      {complect.name}
                      {complect.is_additional && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#ffc107",
                            fontWeight: "500",
                            marginLeft: "0.5rem",
                          }}
                        >
                          (Додатковий)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Container Systems */}
                  <div
                    style={{
                      backgroundColor: "white",
                    }}
                  >
                    {complect.container_systems &&
                    complect.container_systems.length > 0 ? (
                      <div>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.75rem",
                            backgroundColor: "white",
                            tableLayout: "fixed",
                          }}
                        >
                          <thead>
                            <tr>
                              <th
                                style={{
                                  width: "18%",
                                  padding: "6px 8px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #e9ecef",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  color: "#495057",
                                  fontSize: "0.7rem",
                                }}
                              >
                                Збірка
                              </th>
                              <th
                                style={{
                                  width: "30%",
                                  padding: "6px 8px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #e9ecef",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  color: "#495057",
                                  fontSize: "0.7rem",
                                }}
                              >
                                Завантажено
                              </th>
                              <th
                                style={{
                                  width: "17%",
                                  padding: "6px 8px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #e9ecef",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  color: "#495057",
                                  fontSize: "0.7rem",
                                }}
                              >
                                Місце
                              </th>
                              <th
                                style={{
                                  width: "35%",
                                  padding: "6px 8px",
                                  backgroundColor: "#f8f9fa",
                                  border: "1px solid #e9ecef",
                                  textAlign: "center",
                                  fontWeight: "600",
                                  color: "#495057",
                                  fontSize: "0.7rem",
                                }}
                              >
                                Вилучено
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {complect.container_systems.map((containerSys) => (
                              <tr key={containerSys.container_sys_id}>
                                <td
                                  style={{
                                    width: "18%",
                                    padding: "4px 8px",
                                    border: "1px solid #e9ecef",
                                    color: "#495057",
                                    textAlign: "center",
                                    fontWeight: "500",
                                  }}
                                >
                                  {containerSys.name}
                                </td>
                                {containerSys.load_status ? (
                                  <>
                                    <td
                                      style={{
                                        width: "30%",
                                        padding: "4px 8px",
                                        border: "1px solid #e9ecef",
                                        textAlign: "center",
                                        color: "#28a745",
                                      }}
                                    >
                                      {new Date(
                                        containerSys.load_status.load_date
                                      ).toLocaleDateString("uk-UA")}
                                    </td>
                                    <td
                                      style={{
                                        width: "17%",
                                        padding: "4px 8px",
                                        border: "1px solid #e9ecef",
                                        textAlign: "center",
                                        color: "#495057",
                                      }}
                                    >
                                      {
                                        containerSys.load_status.irrad_placement
                                          .name
                                      }
                                    </td>
                                    <td
                                      style={{
                                        width: "35%",
                                        padding: "4px 8px",
                                        border: "1px solid #e9ecef",
                                        textAlign: "center",
                                        color: containerSys.load_status.extract
                                          ? "#dc3545"
                                          : "#007bff",
                                        fontStyle: containerSys.load_status
                                          .extract
                                          ? "normal"
                                          : "italic",
                                      }}
                                    >
                                      {containerSys.load_status.extract
                                        ? new Date(
                                            containerSys.load_status.extract.extract_date
                                          ).toLocaleDateString("uk-UA")
                                        : "опромінюється"}
                                    </td>
                                  </>
                                ) : (
                                  <td
                                    colSpan={3}
                                    style={{
                                      width: "75%",
                                      padding: "4px 8px",
                                      border: "1px solid #e9ecef",
                                      textAlign: "center",
                                      color: "#6c757d",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    Не завантажена
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6c757d",
                          fontStyle: "italic",
                          padding: "0.5rem",
                        }}
                      >
                        Збірки не знайдено
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.9rem",
                color: "#6c757d",
                fontStyle: "italic",
              }}
            >
              Комплекти зразків не знайдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
