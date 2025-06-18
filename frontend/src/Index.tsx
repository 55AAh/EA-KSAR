import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import { Link } from "react-router";

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

export default function Index() {
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
      <div className="d-flex align-items-center justify-content-center h-100">
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          <Row xs={1} md={2} className="g-4 justify-content-center">
            {plantsUnits.map((plant) => (
              <Col key={plant.name_eng} style={{ maxWidth: "450px" }}>
                <Card className="h-100">
                  <Card.Img
                    variant="top"
                    src={plantImages[plant.sh_name] || ""}
                    alt={`Фото ${plant.name}`}
                    style={{
                      height: "150px",
                      objectFit: "contain",
                      backgroundColor: "#f8f9fa",
                      padding: "1rem",
                    }}
                  />
                  <Card.Body className="d-flex flex-column align-items-center text-center">
                    <Card.Title className="mb-3">{plant.name}</Card.Title>
                    <div
                      className="d-flex flex-wrap gap-2 justify-content-center"
                      style={{ maxHeight: "350px", overflowY: "auto" }}
                    >
                      {plant.units.length > 0 ? (
                        plant.units.map((unit) => (
                          <Link
                            key={unit.name_eng}
                            to={`/unit/${unit.name_eng}`}
                            className="text-decoration-none"
                          >
                            <div
                              className="border rounded p-2 text-center hover-effect"
                              style={{
                                minWidth: "80px",
                                minHeight: "80px",
                                backgroundColor: "#cce5ff",
                                borderColor: "#66b3ff",
                                transition: "background-color 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#b3d9ff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#cce5ff";
                              }}
                            >
                              <div className="fw-bold fs-5 text-dark mb-1">
                                {unit.num}
                              </div>
                              <div className="small text-muted lh-sm">
                                <div>{unit.design}</div>
                                <div>{formatPower(unit.power)}</div>
                                <div>{formatDate(unit.start_date)}</div>
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
