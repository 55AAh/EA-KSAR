import { useEffect } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Link, useNavigate, useLoaderData } from "react-router";
import { usePageTitle } from "./hooks/usePageTitle";
import { parseErrorResponse } from "./utils";

import type { PlantUnits } from "./types";

export async function unitSelectorLoader() {
  const response = await fetch("/api/plants_units");

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return await response.json();
}

// Import images
import zaesImg from "./assets/ЗАЕС.png";
import paesImg from "./assets/ПАЕС.png";
import raesImg from "./assets/РАЕС.png";
import haesImg from "./assets/ХАЕС.png";

// Map plant names to images
const plantImages: Record<string, string> = {
  ЗАЕС: zaesImg,
  ПАЕС: paesImg,
  РАЕС: raesImg,
  ХАЕС: haesImg,
};

export default function UnitSelector() {
  usePageTitle(); // This will set "КСАР - Блоки АЕС"

  const plantsUnits = useLoaderData() as PlantUnits[];

  // Set page title
  useEffect(() => {
    document.title = "Енергоблоки - КСАР";
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA");
  };

  const formatPower = (power: number | null) => {
    if (!power) return "";
    return `${Math.round(power)} МВт`;
  };

  // Calculate the maximum number of units across all plants for consistent panel sizing
  const maxUnits = plantsUnits.reduce(
    (max, plant) => Math.max(max, plant.units.length),
    0
  );

  // Let CSS calculate the optimal height automatically based on content

  if (!plantsUnits.length) {
    return (
      <Container
        id="unit-selector-empty"
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div id="empty-content" className="text-center">
          <p className="text-muted fs-4">Немає доступних АЕС</p>
        </div>
      </Container>
    );
  }
  return (
    <Container
      id="unit-selector-container"
      fluid
      className="py-4"
      style={{ height: "100%" }}
    >
      <div
        id="unit-selector-wrapper"
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100%" }}
      >
        <div
          id="plants-grid"
          style={{ width: "100%", maxWidth: "1200px", padding: "0 20px" }}
        >
          {/* Horizontal layout of plant panels */}
          <div
            id="plants-container"
            style={{
              display: "flex",
              gap: "30px",
              justifyContent: "center",
              flexWrap: "wrap",
              alignItems: "stretch",
            }}
          >
            {plantsUnits.map((plant) => (
              <div
                key={plant.name_eng}
                id={`plant-${plant.sh_name_eng}`}
                style={{
                  width: "200px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Card
                  id={`plant-card-${plant.sh_name_eng}`}
                  className="h-100 shadow-sm"
                  style={{ minHeight: "400px" }}
                >
                  {/* Panel Header with Plant Image and Name */}
                  <div
                    id={`plant-header-${plant.sh_name_eng}`}
                    style={{
                      height: "170px",
                      backgroundColor: "#f8f9fa",
                      borderTopLeftRadius: "0.375rem",
                      borderTopRightRadius: "0.375rem",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px 15px 15px 15px",
                      borderBottom: "1px solid #dee2e6",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      id={`plant-image-container-${plant.sh_name_eng}`}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        id={`plant-image-${plant.sh_name_eng}`}
                        src={plantImages[plant.sh_name] || ""}
                        alt={`Фото ${plant.name}`}
                        style={{
                          maxHeight: "90px",
                          maxWidth: "160px",
                          objectFit: "contain",
                          borderRadius: "5px",
                        }}
                      />
                    </div>
                    <div
                      id={`plant-name-container-${plant.sh_name_eng}`}
                      className="text-center"
                      style={{ marginTop: "10px" }}
                    >
                      <div
                        className="fw-bold"
                        style={{
                          fontSize: "18px",
                          lineHeight: "1.1",
                          marginBottom: "3px",
                        }}
                      >
                        {plant.sh_name}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "11px", lineHeight: "1.2" }}
                      >
                        {plant.name}
                      </div>
                    </div>
                  </div>

                  {/* Panel Body with Units List */}
                  <Card.Body
                    id={`plant-body-${plant.sh_name_eng}`}
                    className="p-0"
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                    }}
                  >
                    <div
                      id={`units-list-${plant.sh_name_eng}`}
                      style={{
                        flex: 1,
                        padding: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {plant.units.length > 0 ? (
                        plant.units.map((unit, index) => (
                          <Link
                            key={unit.name_eng}
                            id={`unit-link-${unit.name_eng}`}
                            to={`/units/${unit.name_eng}`}
                            className="text-decoration-none"
                            style={{ flexShrink: 0 }}
                          >
                            <div
                              id={`unit-card-${unit.name_eng}`}
                              className="border rounded p-2 hover-effect"
                              style={{
                                backgroundColor: "#f8f9fa",
                                borderColor: "#dee2e6",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                minHeight: "50px",
                                display: "flex",
                                alignItems: "center",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#e9ecef";
                                e.currentTarget.style.borderColor = "#0d6efd";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 8px rgba(0,0,0,0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f8f9fa";
                                e.currentTarget.style.borderColor = "#dee2e6";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              {/* Unit Number Section */}
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: "#cfe2ff",
                                  borderRadius: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginRight: "12px",
                                  flexShrink: 0,
                                }}
                              >
                                <div
                                  className="fw-bold"
                                  style={{ fontSize: "16px", color: "#495057" }}
                                >
                                  {unit.num}
                                </div>
                              </div>

                              {/* Unit Info Section */}
                              <div
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  className="fw-bold"
                                  style={{
                                    fontSize: "12px",
                                    color: "#495057",
                                    flex: 1,
                                    textAlign: "center",
                                  }}
                                >
                                  {unit.design}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    minWidth: "60px",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#6c757d",
                                    }}
                                  >
                                    {formatPower(unit.power)}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "#6c757d",
                                    }}
                                  >
                                    {formatDate(unit.start_date)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div
                          className="text-center text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          Немає блоків
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
