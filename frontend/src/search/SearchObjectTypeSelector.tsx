import { Container, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router";

// Object types for search
const objectTypes = [
  {
    value: "plant",
    label: "АЕС",
    icon: "🏭",
    description: "Пошук атомних електростанцій",
  },
  {
    value: "unit",
    label: "Енергоблок",
    icon: "⚡",
    description: "Пошук енергоблоків АЕС",
  },
  {
    value: "placement",
    label: "Місце встановлення КЗ",
    icon: "📍",
    description: "Пошук місць встановлення контейнерних збірок",
  },
  {
    value: "load",
    label: "Завантаження ЗС",
    icon: "📥",
    description: "Пошук записів про завантаження зразків-свідків",
  },
  {
    value: "extract",
    label: "Вивантаження ЗС",
    icon: "📤",
    description: "Пошук записів про вивантаження зразків-свідків",
  },
  {
    value: "complect",
    label: "Комплект ЗС",
    icon: "📦",
    description: "Пошук комплектів зразків-свідків",
  },
  {
    value: "container_sys",
    label: "Контейнерна збірка ЗС",
    icon: "🗃️",
    description: "Пошук контейнерних збірок зразків-свідків",
  },
];

export default function SearchObjectTypeSelector() {
  const navigate = useNavigate();

  const isImplemented = (objectType: string) => {
    return objectType === "plant" || objectType === "unit";
  };

  const handleObjectTypeSelect = (objectType: string) => {
    // Only navigate if the object type is implemented
    if (!isImplemented(objectType)) {
      return;
    }

    // Navigate to specific search pages based on object type
    switch (objectType) {
      case "plant":
        navigate("/navigator/search/plants");
        break;
      case "unit":
        navigate("/navigator/search/units");
        break;
      default:
        // For other types, do nothing for now
        console.log(`Selected object type: ${objectType}`);
    }
  };

  return (
    <Container
      fluid
      className="py-4"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      {/* Back link */}
      <div
        onClick={() => navigate("/navigator")}
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
        ← Назад до навігатора
      </div>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 60px)", padding: "20px" }}
      >
        <div style={{ width: "100%", maxWidth: "1200px" }}>
          <div className="text-center mb-5">
            <h2 className="mb-3">🔍 Пошук об'єктів</h2>
            <p className="text-muted">
              Оберіть тип об'єкта, який ви хочете знайти
            </p>
          </div>{" "}
          <Row className="g-4 justify-content-center">
            {objectTypes.map((type) => {
              const implemented = isImplemented(type.value);
              return (
                <Col key={type.value} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    className={`h-100 shadow-sm border-2 ${
                      !implemented ? "opacity-50" : ""
                    }`}
                    style={{
                      cursor: implemented ? "pointer" : "not-allowed",
                      transition: "all 0.2s ease",
                      borderColor: "#dee2e6",
                      filter: !implemented ? "grayscale(50%)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (implemented) {
                        e.currentTarget.style.transform = "translateY(-5px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 25px rgba(0,0,0,0.15)";
                        e.currentTarget.style.borderColor = "#0d6efd";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (implemented) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.1)";
                        e.currentTarget.style.borderColor = "#dee2e6";
                      }
                    }}
                    onClick={() => handleObjectTypeSelect(type.value)}
                  >
                    {" "}
                    <Card.Body className="text-center p-4 d-flex flex-column">
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                        {type.icon}
                      </div>
                      <h5 className="card-title mb-2">{type.label}</h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {type.description}
                      </p>
                      {!implemented && (
                        <div className="mt-auto pt-2">
                          <span className="badge bg-secondary">Незабаром</span>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
          <div className="text-center mt-5">
            <div
              className="card border-0"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div className="card-body p-3">
                {" "}
                <h6 className="text-muted mb-2">Інструкції:</h6>
                <ul
                  className="text-muted mb-0"
                  style={{ fontSize: "14px", listStyle: "none", padding: 0 }}
                >
                  <li>
                    • Натисніть на картку з типом об'єкта для початку пошуку
                  </li>
                  <li>• Доступні для пошуку: АЕС та Енергоблоки</li>
                  <li>• Інші типи об'єктів будуть додані незабаром</li>
                  <li>• Пошук працює з базою даних у реальному часі</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
