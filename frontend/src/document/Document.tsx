import { Container, Card, Button, Row, Col, Badge } from "react-bootstrap";
import { useEffect } from "react";
import { useNavigate, LoaderFunctionArgs, useLoaderData } from "react-router";
import { Document as DocumentType } from "../types";
import { parseErrorResponse } from "../utils";

// Loader function for Document page
export async function documentLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    throw new Response("Document ID is required", {
      status: 404,
      statusText: "Not Found",
    });
  }

  const response = await fetch(`/api/documents/${id}`);

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return await response.json();
}

const Document = () => {
  const document = useLoaderData() as DocumentType;
  const navigate = useNavigate();

  // Set page title with document name
  useEffect(() => {
    window.document.title = `${document.name} - КСАР`;
  }, [document.name]);

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
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (!response.ok) {
        throw new Error("Помилка завантаження файлу");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      // Use the original filename from the document
      link.download = document.filename;
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
      const response = await fetch(`/api/documents/${document.id}`, {
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

  return (
    <Container id="document-page-container" fluid className="py-4">
      {/* Header with navigation */}
      <div
        id="document-header"
        className="d-flex justify-content-between align-items-center mb-4"
      >
        <div className="d-flex align-items-center">
          <h1 id="document-page-title" className="mb-0">
            📄 Документ
          </h1>
        </div>
        <div id="document-action-buttons">
          <Button
            id="document-download-button"
            variant="outline-primary"
            size="sm"
            onClick={handleDownload}
            className="me-2"
          >
            📥 Завантажити
          </Button>
          <Button
            id="document-delete-button"
            variant="outline-danger"
            size="sm"
            onClick={handleDelete}
          >
            🗑️ Видалити
          </Button>
        </div>
      </div>
      <Row
        id="document-content-row"
        className="h-100"
        style={{ minHeight: "calc(100vh - 200px)" }}
      >
        {/* Left Column - Document Information */}
        <Col md={4} className="pe-3">
          <Card id="document-info-card" className="h-100">
            <Card.Header>
              <h5 id="document-info-title" className="mb-0">
                📋 Інформація про документ
              </h5>
            </Card.Header>
            <Card.Body id="document-info-body">
              <div className="mb-4">
                <h4 id="document-name" className="text-primary mb-3">
                  {document.name}
                </h4>

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
        </Col>
        {/* Right Column - Document Preview */}
        <Col md={8} className="ps-3">
          <Card id="document-preview-card" className="h-100">
            <Card.Header>
              <h5 id="document-preview-title" className="mb-0">
                👁️ Попередній перегляд
              </h5>
            </Card.Header>
            <Card.Body
              id="document-preview-body"
              className="d-flex justify-content-center align-items-center"
            >
              <div
                id="document-preview-placeholder"
                className="text-center text-muted"
              >
                <div className="fs-1 mb-3">📄</div>
                <div className="fs-5 mb-2">Попередній перегляд недоступний</div>
                <div className="small mb-3">
                  Попередній перегляд для файлів типу{" "}
                  <Badge bg="secondary">
                    {document.file_extension.toUpperCase()}
                  </Badge>{" "}
                  поки що не підтримується
                </div>
                <Button
                  id="document-preview-download-button"
                  variant="primary"
                  onClick={handleDownload}
                  size="sm"
                >
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
