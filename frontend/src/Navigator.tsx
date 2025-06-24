import { Container, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router";

export default function Navigator() {
  const navigate = useNavigate();

  // Common style for navigation cards
  const navCardStyle = {
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    backgroundColor: "#fafafa",
    border: "2px solid #e9ecef",
    height: "200px",
    width: "280px",
  };

  // Common hover handlers for navigation cards
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  };
  return (
    <Container
      fluid
      style={{
        height: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Back link to main page */}
      <div
        onClick={() => navigate("/")}
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
        ← Назад до головної
      </div>

      <div style={{ position: "relative" }}>
        {/* Text Section - Positioned above cards */}
        <div
          className="text-center"
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
          }}
        >
          <h1 className="mb-3">Навігатор</h1>
          <p className="text-muted fs-5">
            Виберіть спосіб навігації по системі
          </p>
        </div>

        {/* Navigation Cards Grid - True Center */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 280px)",
            gap: "30px",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          {" "}
          {/* Navigation by Units Card */}
          <Link to="/navigator/units" className="text-decoration-none">
            <Card
              className="shadow-sm"
              style={navCardStyle}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              <Card.Body className="text-center p-4 d-flex flex-column justify-content-center">
                <div className="mb-3">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#0d6efd",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      fontSize: "28px",
                    }}
                  >
                    🏭
                  </div>
                </div>
                <Card.Title className="h4 text-primary mb-2">
                  Навігація по блоках
                </Card.Title>
                <Card.Text className="text-muted">
                  Перегляд енергоблоків АЕС та навігація по них
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
          {/* Search Card */}
          <Link to="/navigator/search" className="text-decoration-none">
            <Card
              className="shadow-sm"
              style={navCardStyle}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              <Card.Body className="text-center p-4 d-flex flex-column justify-content-center">
                <div className="mb-3">
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#198754",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      fontSize: "28px",
                    }}
                  >
                    🔍
                  </div>
                </div>
                <Card.Title className="h4 text-success mb-2">Пошук</Card.Title>
                <Card.Text className="text-muted">
                  Розширений пошук по всій системі
                </Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </div>
      </div>
    </Container>
  );
}
