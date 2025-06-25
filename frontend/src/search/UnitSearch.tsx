import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Unit } from "../types";

// Extended Unit interface to include plant information
interface UnitWithPlant extends Unit {
  plant_name: string;
  plant_sh_name: string;
  plant_name_eng: string;
  plant_sh_name_eng: string;
}

export default function UnitSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchName, setSearchName] = useState("");
  const [searchDesign, setSearchDesign] = useState("");
  const [searchPower, setSearchPower] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [allUnits, setAllUnits] = useState<UnitWithPlant[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<UnitWithPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize search fields from URL params
  useEffect(() => {
    const nameParam = searchParams.get("name") || "";
    const designParam = searchParams.get("design") || "";
    const powerParam = searchParams.get("power") || "";
    const startDateParam = searchParams.get("start_date") || "";

    setSearchName(nameParam);
    setSearchDesign(designParam);
    setSearchPower(powerParam);
    setSearchStartDate(startDateParam);
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

  const handleSearchDesignChange = (value: string) => {
    setSearchDesign(value);
    updateSearchParams("design", value);
  };

  const handleSearchPowerChange = (value: string) => {
    setSearchPower(value);
    updateSearchParams("power", value);
  };

  const handleSearchStartDateChange = (value: string) => {
    setSearchStartDate(value);
    updateSearchParams("start_date", value);
  };

  const clearAllFilters = () => {
    setSearchName("");
    setSearchDesign("");
    setSearchPower("");
    setSearchStartDate("");
    setSearchParams(new URLSearchParams());
  };

  // Fetch all units on component mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/search/units/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch units");
        }

        const units: UnitWithPlant[] = await response.json();
        setAllUnits(units);
        // Don't set filteredUnits here - let the filtering effect handle it
      } catch (error) {
        console.error("Failed to fetch units:", error);
        setError("Не вдалося завантажити список енергоблоків");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, []);
  // Filter units when search fields change
  useEffect(() => {
    let filtered = allUnits;

    // Filter by name (unit or plant)
    if (searchName.trim()) {
      const searchTerm = searchName.toLowerCase();
      filtered = filtered.filter(
        (unit) =>
          unit.name.toLowerCase().includes(searchTerm) ||
          unit.name_eng.toLowerCase().includes(searchTerm) ||
          unit.plant_name.toLowerCase().includes(searchTerm) ||
          unit.plant_name_eng.toLowerCase().includes(searchTerm) ||
          unit.plant_sh_name.toLowerCase().includes(searchTerm) ||
          unit.plant_sh_name_eng.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by design
    if (searchDesign.trim()) {
      const searchTerm = searchDesign.toLowerCase();
      filtered = filtered.filter((unit) =>
        unit.design.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by power
    if (searchPower.trim()) {
      const powerValue = parseFloat(searchPower);
      if (!isNaN(powerValue)) {
        filtered = filtered.filter((unit) => {
          if (unit.power === null) return false;
          // Allow for +/- 50 MW tolerance in search
          return Math.abs(unit.power - powerValue) <= 50;
        });
      }
    }

    // Filter by start date (year)
    if (searchStartDate.trim()) {
      const searchYear = parseInt(searchStartDate);
      if (!isNaN(searchYear)) {
        filtered = filtered.filter((unit) => {
          if (!unit.start_date) return false;
          const unitYear = new Date(unit.start_date).getFullYear();
          return unitYear === searchYear;
        });
      }
    }

    setFilteredUnits(filtered);
  }, [searchName, searchDesign, searchPower, searchStartDate, allUnits]);

  const handleUnitSelect = (unit: UnitWithPlant) => {
    // Navigate to the specific unit page
    navigate(`/navigator/units/${unit.name_eng}`);
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
          {" "}
          <div className="text-center mb-4">
            <h2 className="mb-3">⚡ Пошук енергоблоків</h2>
            <p className="text-muted">
              Знайдіть енергоблок за назвою, типом реактора, потужністю або
              роком запуску
            </p>
          </div>
          <Row className="g-4">
            {/* Search Form Column */}
            <Col lg={4}>
              <Card
                className="shadow-sm"
                style={{ border: "2px solid #dee2e6" }}
              >
                {" "}
                <Card.Header className="bg-warning text-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <span className="me-2">🔍</span>
                    Пошук енергоблоків
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Назва енергоблоку або АЕС
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Введіть назву енергоблоку або АЕС..."
                      value={searchName}
                      onChange={(e) => handleSearchNameChange(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Проект</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Введіть назву проекту..."
                      value={searchDesign}
                      onChange={(e) => handleSearchDesignChange(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Потужність (МВт)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Введіть потужність у МВт..."
                      value={searchPower}
                      onChange={(e) => handleSearchPowerChange(e.target.value)}
                    />
                    <Form.Text className="text-muted">
                      Пошук з точністю ±50 МВт
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Рік запуску</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Введіть рік запуску..."
                      value={searchStartDate}
                      onChange={(e) =>
                        handleSearchStartDateChange(e.target.value)
                      }
                      min="1950"
                      max="2030"
                    />
                  </Form.Group>

                  <div className="d-flex gap-2 mb-3">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={clearAllFilters}
                      disabled={
                        !searchName &&
                        !searchDesign &&
                        !searchPower &&
                        !searchStartDate
                      }
                    >
                      Очистити фільтри
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="badge bg-light text-dark p-2">
                      {isLoading
                        ? "Завантаження..."
                        : `Знайдено: ${filteredUnits.length} з ${allUnits.length}`}
                    </div>
                  </div>
                </Card.Body>
              </Card>{" "}
              {/* Search Instructions */}
              <Card
                className="mt-4 border-0"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                <Card.Body className="p-3">
                  <h6 className="text-muted mb-2">Інструкції:</h6>
                  <ul className="text-muted mb-0" style={{ fontSize: "14px" }}>
                    <li>Пошук працює в реальному часі</li>
                    <li>Можна комбінувати декілька критеріїв пошуку</li>
                    <li>
                      Всі поля необов'язкові - залиште порожніми для загального
                      перегляду
                    </li>
                    <li>Пошук за потужністю працює з точністю ±50 МВт</li>
                    <li>Натисніть на енергоблок для детального перегляду</li>
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
                <Card.Header className="bg-warning text-white">
                  <h5 className="mb-0 d-flex align-items-center">
                    <span className="me-2">📋</span>
                    Результати пошуку
                    {!isLoading && (
                      <span className="badge bg-light text-warning ms-2">
                        {filteredUnits.length}
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
                        className="spinner-border text-warning mb-3"
                        role="status"
                      >
                        <span className="visually-hidden">Завантаження...</span>
                      </div>
                      <h5 className="text-muted">
                        Завантаження списку енергоблоків...
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
                        variant="outline-warning"
                        onClick={() => window.location.reload()}
                      >
                        Спробувати знову
                      </Button>
                    </div>
                  ) : filteredUnits.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                      <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                        🔍
                      </div>
                      <h5 className="text-muted">Енергоблоки не знайдено</h5>
                      <p className="text-muted">
                        Спробуйте змінити пошуковий запит або очистити поле для
                        перегляду всіх енергоблоків
                      </p>
                    </div>
                  ) : (
                    <div>
                      {filteredUnits.map((unit) => (
                        <Card
                          key={`${unit.plant_sh_name_eng}-${unit.name_eng}`}
                          className="mb-3 border"
                        >
                          <Card.Body>
                            {" "}
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">
                                  {unit.name} ({unit.name_eng})
                                </h6>
                                <p className="text-muted mb-2 small">
                                  <strong>АЕС:</strong> {unit.plant_name} (
                                  {unit.plant_sh_name})
                                  <br />
                                  <strong>Тип:</strong> {unit.design}
                                  {unit.power && (
                                    <>
                                      {" "}
                                      • <strong>Потужність:</strong>{" "}
                                      {Math.round(unit.power)} МВт
                                    </>
                                  )}
                                  {unit.start_date && (
                                    <>
                                      {" "}
                                      • <strong>Рік запуску:</strong>{" "}
                                      {new Date(unit.start_date).getFullYear()}
                                    </>
                                  )}
                                </p>
                                <div className="d-flex gap-2">
                                  <span className="badge bg-warning">
                                    Енергоблок {unit.num}
                                  </span>
                                  <span className="badge bg-secondary">
                                    {unit.design}
                                  </span>
                                  {unit.stage && (
                                    <span className="badge bg-info">
                                      {unit.stage}
                                    </span>
                                  )}
                                  {unit.power && (
                                    <span className="badge bg-success">
                                      {Math.round(unit.power)} МВт
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleUnitSelect(unit)}
                              >
                                Детальний перегляд
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
