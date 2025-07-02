import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle";

interface Placement {
  placement_id: number;
  unit_id: number;
  unit_name: string | null;
  unit_name_eng: string | null;
  sector: number;
  sector_num: number;
  name: string;
}

export default function PlacementSearch() {
  usePageTitle(); // This will set "КСАР - Пошук місць встановлення КЗ"

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchName, setSearchName] = useState("");
  const [searchUnitName, setSearchUnitName] = useState("");
  const [searchSector, setSearchSector] = useState("");
  const [searchSectorNum, setSearchSectorNum] = useState("");
  const [allPlacements, setAllPlacements] = useState<Placement[]>([]);
  const [filteredPlacements, setFilteredPlacements] = useState<Placement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize search fields from URL params
  useEffect(() => {
    const nameParam = searchParams.get("name") || "";
    const unitNameParam = searchParams.get("unit_name") || "";
    const sectorParam = searchParams.get("sector") || "";
    const sectorNumParam = searchParams.get("sector_num") || "";

    setSearchName(nameParam);
    setSearchUnitName(unitNameParam);
    setSearchSector(sectorParam);
    setSearchSectorNum(sectorNumParam);
  }, [searchParams]);

  // Update URL when search fields change
  const updateSearchParams = (field: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newSearchParams.set(field, value);
    } else {
      newSearchParams.delete(field);
    }
    setSearchParams(newSearchParams);
  };

  const handleSearchNameChange = (value: string) => {
    setSearchName(value);
    updateSearchParams("name", value);
  };

  const handleSearchUnitNameChange = (value: string) => {
    setSearchUnitName(value);
    updateSearchParams("unit_name", value);
  };

  const handleSearchSectorChange = (value: string) => {
    setSearchSector(value);
    updateSearchParams("sector", value);
  };

  const handleSearchSectorNumChange = (value: string) => {
    setSearchSectorNum(value);
    updateSearchParams("sector_num", value);
  };

  const clearAllFilters = () => {
    setSearchName("");
    setSearchUnitName("");
    setSearchSector("");
    setSearchSectorNum("");
    setSearchParams(new URLSearchParams());
  };

  // Fetch all placements on component mount
  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/search/placements/");

        if (!response.ok) {
          throw new Error("Failed to fetch placements");
        }

        const placements: Placement[] = await response.json();
        setAllPlacements(placements);
        setFilteredPlacements(placements);
      } catch (error) {
        console.error("Failed to fetch placements:", error);
        setError("Не вдалося завантажити список місць встановлення КЗ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlacements();
  }, []);

  // Filter placements when search fields change
  useEffect(() => {
    let filtered = allPlacements;

    if (searchUnitName.trim()) {
      const searchTerm = searchUnitName.toLowerCase();
      filtered = filtered.filter((placement) =>
        placement.unit_name?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchSector.trim()) {
      const sectorValue = parseInt(searchSector);
      if (!isNaN(sectorValue)) {
        filtered = filtered.filter(
          (placement) => placement.sector === sectorValue
        );
      }
    }

    if (searchSectorNum.trim()) {
      const sectorNumValue = parseInt(searchSectorNum);
      if (!isNaN(sectorNumValue)) {
        filtered = filtered.filter(
          (placement) => placement.sector_num === sectorNumValue
        );
      }
    }

    if (searchName.trim()) {
      const searchTerm = searchName.toLowerCase();
      filtered = filtered.filter((placement) =>
        placement.name.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPlacements(filtered);
  }, [
    searchUnitName,
    searchSector,
    searchSectorNum,
    searchName,
    allPlacements,
  ]);

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
            <h2 className="mb-3">📍 Пошук місць встановлення КЗ</h2>
            <p className="text-muted">
              Знайдіть місце встановлення за технологічним позначенням
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
                    Пошук за позначенням
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Технологічне позначення
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Введіть позначення..."
                      value={searchName}
                      onChange={(e) => handleSearchNameChange(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Назва блоку</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Введіть назву блоку..."
                      value={searchUnitName}
                      onChange={(e) =>
                        handleSearchUnitNameChange(e.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Сектор</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Введіть номер сектора..."
                      value={searchSector}
                      onChange={(e) => handleSearchSectorChange(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Місце в секторі</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Введіть місце в секторі..."
                      value={searchSectorNum}
                      onChange={(e) =>
                        handleSearchSectorNumChange(e.target.value)
                      }
                    />
                  </Form.Group>

                  <div className="d-flex gap-2 mb-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={clearAllFilters}
                      disabled={
                        !searchName &&
                        !searchUnitName &&
                        !searchSector &&
                        !searchSectorNum
                      }
                    >
                      Очистити фільтри
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="badge bg-light text-dark p-2">
                      {isLoading
                        ? "Завантаження..."
                        : `Знайдено: ${filteredPlacements.length} з ${allPlacements.length}`}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Results Column */}
            <Col lg={8}>
              <Card
                className="shadow-sm"
                style={{ border: "2px solid #dee2e6" }}
              >
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <span className="me-2">📋</span>
                    Результати пошуку
                    {!isLoading && (
                      <span className="badge bg-light text-success ms-2">
                        {filteredPlacements.length}
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
                      <h5 className="text-muted">
                        Завантаження списку місць встановлення...
                      </h5>
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
                  ) : filteredPlacements.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                      <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                        🔍
                      </div>
                      <h5 className="text-muted">
                        Місця встановлення не знайдено
                      </h5>
                      <p className="text-muted">
                        Спробуйте змінити пошуковий запит або очистити поле для
                        перегляду всіх місць встановлення
                      </p>
                    </div>
                  ) : (
                    <div>
                      {filteredPlacements.map((placement) => (
                        <Card
                          key={placement.placement_id}
                          className="mb-3 border"
                        >
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{placement.name}</h6>
                                <p className="text-muted mb-2 small">
                                  <strong>Блок:</strong>{" "}
                                  {placement.unit_name || "Не вказано"}
                                  <br />
                                  <strong>Сектор:</strong> {placement.sector}
                                  <br />
                                  <strong>Місце в секторі:</strong>{" "}
                                  {placement.sector_num}
                                </p>
                                <span className="badge bg-primary">
                                  Місце встановлення
                                </span>
                              </div>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/navigator/units/${placement.unit_name_eng}`
                                  )
                                }
                              >
                                Переглянути блок
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
