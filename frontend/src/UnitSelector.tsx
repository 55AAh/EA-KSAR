import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { usePageTitle } from "./hooks/usePageTitle";

import type { PlantUnits } from "./types";

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

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plantsUnits, setPlantsUnits] = useState<PlantUnits[]>([]);

  // Retrieves data about plants & units
  async function fetchPlantsUnitsData() {
    const response = await fetch(`/api/plants_units`);
    if (response.ok) {
      const plantsUnits = await response.json();
      setPlantsUnits(plantsUnits);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPlantsUnitsData().catch(console.error);
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

  if (!plantsUnits.length) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <p className="text-muted fs-4">Немає доступних АЕС</p>
        </div>
      </Container>
    );
  }
  return (
    <Container
      fluid
      className="py-4"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      {/* Back link - positioned at left side, above cards */}
      <div
        onClick={() => navigate("/navigator")}
        style={{
          marginBottom: "20px",
          marginLeft: "20px",
          color: "#0d6efd",
          cursor: "pointer",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "16px",
          transition: "color 0.2s",
          width: "fit-content",
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
        ← Назад до навігатора
      </div>

      <div className="d-flex align-items-center justify-content-center h-100">
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          <Row xs={1} md={2} className="g-4 justify-content-center">
            {plantsUnits.map((plant) => (
              <Col key={plant.name_eng} style={{ maxWidth: "450px" }}>
                {" "}
                <Card className="h-100">
                  <div
                    style={{
                      height: "150px",
                      backgroundColor: "#f8f9fa",
                      borderTopLeftRadius: "calc(0.375rem - 1px)",
                      borderTopRightRadius: "calc(0.375rem - 1px)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1rem",
                    }}
                  >
                    {" "}
                    <img
                      src={plantImages[plant.sh_name] || ""}
                      alt={`Фото ${plant.name}`}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "0.375rem",
                      }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column align-items-center text-center">
                    <Card.Title className="mb-3">{plant.name}</Card.Title>
                    <div
                      className="d-grid gap-2"
                      style={{
                        maxHeight: "350px",
                        overflowY: "auto",
                        padding: "5px",
                        gridTemplateColumns: `repeat(${
                          plant.units.length === 1
                            ? 1
                            : plant.units.length === 2
                            ? 2
                            : plant.units.length === 3
                            ? 3
                            : plant.units.length === 4
                            ? 2
                            : plant.units.length === 6
                            ? 3
                            : 3
                        }, 1fr)`,
                        justifyItems: "center",
                      }}
                    >
                      {plant.units.length > 0 ? (
                        plant.units.map((unit) => (
                          <Link
                            key={unit.name_eng}
                            to={`/navigator/units/${unit.name_eng}`}
                            className="text-decoration-none"
                          >
                            <div
                              className="border rounded text-center hover-effect"
                              style={{
                                width: "85px",
                                height: "95px",
                                padding: "6px",
                                backgroundColor: "#f8f9fa",
                                borderColor: "#dee2e6",
                                transition:
                                  "background-color 0.2s, transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#e9ecef";
                                e.currentTarget.style.transform =
                                  "translateY(-3px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 15px rgba(0,0,0,0.15)";
                                e.currentTarget.style.borderColor = "#0d6efd";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f8f9fa";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.borderColor = "#dee2e6";
                              }}
                            >
                              {/* Unit Number - Top */}
                              <div
                                className="fw-bold text-primary"
                                style={{ fontSize: "20px", lineHeight: "1" }}
                              >
                                {unit.num}
                              </div>
                              {/* Unit Details - Middle */}
                              <div
                                className="flex-grow-1 d-flex flex-column justify-content-center w-100"
                                style={{ gap: "3px" }}
                              >
                                {/* Design Name */}
                                <div
                                  className="text-success fw-semibold"
                                  style={{
                                    fontSize: "12px",
                                    lineHeight: "1.3",
                                  }}
                                >
                                  {unit.design}
                                </div>

                                {/* Power */}
                                <div
                                  className="text-warning fw-semibold"
                                  style={{
                                    fontSize: "12px",
                                    lineHeight: "1.3",
                                  }}
                                >
                                  ⚡ {formatPower(unit.power)}
                                </div>

                                {/* Start Date */}
                                <div
                                  className="text-info fw-semibold"
                                  style={{
                                    fontSize: "11px",
                                    lineHeight: "1.3",
                                  }}
                                >
                                  {formatDate(unit.start_date)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <Badge bg="secondary">Немає доступних блоків</Badge>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </Container>
  );
}
