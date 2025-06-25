import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Badge,
  Alert,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Document as DocumentType } from "../types";

const Document = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch document information on component mount
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) {
        setError("ID документа не вказано");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/search/documents/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Документ не знайдено");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDocument(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Помилка завантаження документа"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("uk-UA");
  };
  const handleDownload = async () => {
    if (!document) return;

    try {
      const response = await fetch(
        `/api/search/documents/${document.id}/download`
      );
      if (!response.ok) {
        throw new Error("Помилка завантаження файлу");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document.name}.${document.file_extension}`;
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Помилка завантаження файлу");
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Ви впевнені, що хочете видалити документ "${document.name}"?\n\nЦю дію неможливо скасувати.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/search/documents/${document.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Помилка видалення документа");
      }

      // Navigate back to documents list after successful deletion
      navigate("/documents");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Помилка видалення документа");
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4 h-100">
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-center">
            <div className="fs-5">Завантаження документа...</div>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !document) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Помилка завантаження</Alert.Heading>
          <p>{error || "Документ не знайдено"}</p>
          <Button
            variant="outline-danger"
            onClick={() => navigate("/documents")}
          >
            ← Повернутися до списку документів
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {" "}
      {/* Header with navigation */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate("/documents")}
            className="me-3"
          >
            ← Назад до списку
          </Button>
          <h1 className="mb-0">📄 Документ</h1>
        </div>
        <div>
          {" "}
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleDownload}
            className="me-2"
          >
            📥 Завантажити
          </Button>
          <Button variant="outline-danger" size="sm" onClick={handleDelete}>
            🗑️ Видалити
          </Button>
        </div>
      </div>{" "}
      <Row className="h-100" style={{ minHeight: "calc(100vh - 200px)" }}>
        {/* Left Column - Document Information */}
        <Col md={4} className="pe-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📋 Інформація про документ</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h4 className="text-primary mb-3">{document.name}</h4>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>№ (шифр):</strong>
                  </Col>
                  <Col sm={8}>
                    <code>{document.code}</code>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>ID документа:</strong>
                  </Col>
                  <Col sm={8}>
                    <Badge bg="secondary">{document.id}</Badge>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Файл:</strong>
                  </Col>
                  <Col sm={8}>{document.filename}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Розмір файлу:</strong>
                  </Col>
                  <Col sm={8}>{formatFileSize(document.file_size)}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Тип файлу:</strong>
                  </Col>
                  <Col sm={8}>
                    <Badge bg="primary">
                      {document.file_extension.toUpperCase()}
                    </Badge>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Статус:</strong>
                  </Col>
                  <Col sm={8}>
                    <Badge
                      bg={document.status === "active" ? "success" : "danger"}
                    >
                      {document.status === "active" ? "Активний" : "Неактивний"}
                    </Badge>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Введений в дію:</strong>
                  </Col>
                  <Col sm={8}>
                    {document.issue_date
                      ? formatDate(document.issue_date)
                      : "Не вказано"}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Дійсний до:</strong>
                  </Col>
                  <Col sm={8}>
                    {document.valid_until
                      ? formatDate(document.valid_until)
                      : "Безстроково"}
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>{" "}
        {/* Right Column - Document Preview */}
        <Col md={8} className="ps-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">👁️ Попередній перегляд</h5>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center">
              <div className="text-center text-muted">
                <div className="fs-1 mb-3">📄</div>
                <div className="fs-5 mb-2">Попередній перегляд недоступний</div>
                <div className="small mb-3">
                  Попередній перегляд для файлів типу{" "}
                  <Badge bg="secondary">
                    {document.file_extension.toUpperCase()}
                  </Badge>{" "}
                  поки що не підтримується
                </div>
                <Button variant="primary" onClick={handleDownload} size="sm">
                  📥 Завантажити для перегляду
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Document;
