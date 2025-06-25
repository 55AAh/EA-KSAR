import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plant } from "../types";
import { usePageTitle } from "../hooks/usePageTitle";

export default function PlantSearch() {
  usePageTitle(); // This will set "КСАР - Пошук АЕС"

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchName, setSearchName] = useState("");
  const [allPlants, setAllPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize search name from URL params
  useEffect(() => {
    const nameParam = searchParams.get("name") || "";
    setSearchName(nameParam);
  }, [searchParams]);

  // Update URL when search name changes
  const handleSearchNameChange = (value: string) => {
    setSearchName(value);

    // Update URL search params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newSearchParams.set("name", value);
    } else {
      newSearchParams.delete("name");
    }
    setSearchParams(newSearchParams);
  };

  // Fetch all plants on component mount
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/search/plants/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch plants");
        }
        const plants: Plant[] = await response.json();
        setAllPlants(plants);
        // Don't set filteredPlants here - let the filtering effect handle it
      } catch (error) {
        console.error("Failed to fetch plants:", error);
        setError("Не вдалося завантажити список АЕС");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Filter plants when search name changes
  useEffect(() => {
    if (!searchName.trim()) {
      setFilteredPlants(allPlants);
    } else {
      const searchTerm = searchName.toLowerCase();
      const filtered = allPlants.filter(
        (plant) =>
          plant.name.toLowerCase().includes(searchTerm) ||
          plant.name_eng.toLowerCase().includes(searchTerm) ||
          plant.sh_name.toLowerCase().includes(searchTerm) ||
          plant.sh_name_eng.toLowerCase().includes(searchTerm)
      );
      setFilteredPlants(filtered);
    }
  }, [searchName, allPlants]);
  const handlePlantSelect = (plant: Plant) => {
    // Navigate to unit search page with plant short name pre-filled
    navigate(
      `/navigator/search/units?name=${encodeURIComponent(plant.sh_name)}`
    );
  };

  return (
    <Container
      fluid
      className="py-4"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      {/* Back link */}
      <div
        onClick={() => navigate("/navigator/search")}
        style={{
          position: "absolute",
          left: "20px",
          top: "80px",
          color: "#0d6efd",
          cursor: "pointer",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "16px",
          transition: "color 0.2s",
          width: "fit-content",
          zIndex: 10,
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
        ← Назад до пошуку
      </div>

      <div
        className="d-flex justify-content-center align-items-start"
        style={{ minHeight: "calc(100vh - 60px)", padding: "20px" }}
      >
        <div style={{ width: "100%", maxWidth: "1400px" }}>
          <div className="text-center mb-4">
            <h2 className="mb-3">🏭 Пошук АЕС</h2>
            <p className="text-muted">
              Знайдіть атомну електростанцію за назвою
            </p>
          </div>

          <Row className="g-4">
            {/* Search Form Column */}
            <Col lg={4}>
              <Card
                className="shadow-sm"
                style={{ border: "2px solid #dee2e6" }}
              >
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <span className="me-2">🔍</span>
                    Пошук за назвою
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Назва АЕС (необов'язково)
                    </Form.Label>{" "}
                    <Form.Control
                      type="text"
                      placeholder="Введіть назву АЕС для пошуку..."
                      value={searchName}
                      onChange={(e) => handleSearchNameChange(e.target.value)}
                      size="lg"
                    />
                    <Form.Text className="text-muted">
                      Введіть повну або часткову назву АЕС. Залиште порожнім для
                      перегляду всіх АЕС.
                    </Form.Text>
                  </Form.Group>

                  <div className="text-center">
                    <div className="badge bg-light text-dark p-2">
                      {isLoading
                        ? "Завантаження..."
                        : `Знайдено: ${filteredPlants.length} з ${allPlants.length}`}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Search Instructions */}
              <Card
                className="mt-4 border-0"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                <Card.Body className="p-3">
                  <h6 className="text-muted mb-2">Інструкції:</h6>
                  <ul className="text-muted mb-0" style={{ fontSize: "14px" }}>
                    <li>Пошук працює в реальному часі</li>
                    <li>Можна шукати за українською або англійською назвою</li>
                    <li>Пошук не залежить від регістру</li>
                    <li>Натисніть на АЕС для перегляду її енергоблоків</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            {/* Results Column */}
            <Col lg={8}>
              <Card
                className="shadow-sm"
                style={{ border: "2px solid #dee2e6" }}
              >
                {" "}
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <span className="me-2">📋</span>
                    Результати пошуку
                    {!isLoading && (
                      <span className="badge bg-light text-success ms-2">
                        {filteredPlants.length}
                      </span>
                    )}
                  </h5>
                </Card.Header>
                <Card.Body
                  style={{
                    minHeight: "500px",
                    maxHeight: "600px",
                    overflowY: "auto",
                  }}
                >
                  {isLoading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                      <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                      >
                        <span className="visually-hidden">Завантаження...</span>
                      </div>
                      <h5 className="text-muted">Завантаження списку АЕС...</h5>
                    </div>
                  ) : error ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                      <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                        ⚠️
                      </div>
                      <h5 className="text-danger">Помилка завантаження</h5>
                      <p className="text-muted">{error}</p>
                      <Button
                        variant="outline-primary"
                        onClick={() => window.location.reload()}
                      >
                        Спробувати знову
                      </Button>
                    </div>
                  ) : filteredPlants.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                      <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                        🔍
                      </div>
                      <h5 className="text-muted">АЕС не знайдено</h5>
                      <p className="text-muted">
                        Спробуйте змінити пошуковий запит або очистити поле для
                        перегляду всіх АЕС
                      </p>
                    </div>
                  ) : (
                    <div>
                      {filteredPlants.map((plant) => (
                        <Card key={plant.plant_id} className="mb-3 border">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{plant.name}</h6>
                                <p className="text-muted mb-2 small">
                                  {plant.sh_name} • {plant.name_eng} (
                                  {plant.sh_name_eng})
                                </p>
                                <span className="badge bg-primary">АЕС</span>
                              </div>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handlePlantSelect(plant)}
                              >
                                Переглянути енергоблоки
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </Container>
  );
}
