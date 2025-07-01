import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Document } from "../types";

interface SearchFilters {
  name: string;
  code: string;
  issueDateFrom: string;
  issueDateTo: string;
  validUntilFrom: string;
  validUntilTo: string;
}

const DocumentsSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    name: searchParams.get("name") || "",
    code: searchParams.get("code") || "",
    issueDateFrom: searchParams.get("issueDateFrom") || "",
    issueDateTo: searchParams.get("issueDateTo") || "",
    validUntilFrom: searchParams.get("validUntilFrom") || "",
    validUntilTo: searchParams.get("validUntilTo") || "",
  });

  // Fetch all documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/search/documents/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Помилка завантаження документів"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter documents based on current filters
  useEffect(() => {
    let filtered = documents;

    // Filter by name
    if (filters.name.trim()) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by code
    if (filters.code.trim()) {
      filtered = filtered.filter((doc) =>
        doc.code.toLowerCase().includes(filters.code.toLowerCase())
      );
    }

    // Filter by issue date range
    if (filters.issueDateFrom) {
      filtered = filtered.filter(
        (doc) => new Date(doc.issue_date) >= new Date(filters.issueDateFrom)
      );
    }
    if (filters.issueDateTo) {
      filtered = filtered.filter(
        (doc) => new Date(doc.issue_date) <= new Date(filters.issueDateTo)
      );
    }

    // Filter by valid until date range
    if (filters.validUntilFrom) {
      filtered = filtered.filter(
        (doc) =>
          doc.valid_until &&
          new Date(doc.valid_until) >= new Date(filters.validUntilFrom)
      );
    }
    if (filters.validUntilTo) {
      filtered = filtered.filter(
        (doc) =>
          doc.valid_until &&
          new Date(doc.valid_until) <= new Date(filters.validUntilTo)
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, filters]);

  // Update URL parameters when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      code: "",
      issueDateFrom: "",
      issueDateTo: "",
      validUntilFrom: "",
      validUntilTo: "",
    });
  };

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

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      const response = await fetch(
        `/api/search/documents/${documentId}/download`
      );
      if (!response.ok) {
        throw new Error("Помилка завантаження файлу");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Помилка завантаження файлу");
    }
  };

  const handleDocumentClick = (documentId: number) => {
    navigate(`/documents/${documentId}`);
  };

  if (loading) {
    return (
      <Container fluid className="py-4 h-100">
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-center">
            <div className="fs-5">Завантаження документів...</div>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <div className="alert alert-danger">Помилка: {error}</div>
      </Container>
    );
  }
  return (
    <Container fluid className="py-4 h-100">
      {/* Header with title and upload button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">📄 Документи</h1>
        <Button variant="primary" onClick={() => navigate("/documents/upload")}>
          📤 Створити новий документ
        </Button>
      </div>

      <Row className="h-100" style={{ minHeight: "calc(100vh - 200px)" }}>
        {/* Left Column - Search Filters */}
        <Col md={4} lg={3} className="pe-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">🔍 Пошук документів</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Назва</Form.Label>
                  <Form.Control
                    type="text"
                    value={filters.name}
                    onChange={(e) => handleFilterChange("name", e.target.value)}
                    placeholder="Введіть назву документа"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>№ (шифр)</Form.Label>
                  <Form.Control
                    type="text"
                    value={filters.code}
                    onChange={(e) => handleFilterChange("code", e.target.value)}
                    placeholder="Введіть № (шифр) документа"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Дата введення в дію</Form.Label>
                  <Row>
                    <Col>
                      <Form.Label className="text-muted small">Від</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.issueDateFrom}
                        onChange={(e) =>
                          handleFilterChange("issueDateFrom", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label className="text-muted small">До</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.issueDateTo}
                        onChange={(e) =>
                          handleFilterChange("issueDateTo", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Термін дії</Form.Label>
                  <Row>
                    <Col>
                      <Form.Label className="text-muted small">Від</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.validUntilFrom}
                        onChange={(e) =>
                          handleFilterChange("validUntilFrom", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label className="text-muted small">До</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.validUntilTo}
                        onChange={(e) =>
                          handleFilterChange("validUntilTo", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <div className="d-grid">
                  <Button variant="secondary" onClick={clearFilters}>
                    Очистити фільтри
                  </Button>
                </div>

                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Знайдено: {filteredDocuments.length} документів
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Document Results */}
        <Col md={8} lg={9} className="ps-3">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📋 Результати пошуку</h5>
            </Card.Header>
            <Card.Body className="p-0" style={{ overflow: "hidden" }}>
              {filteredDocuments.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center text-muted py-5">
                    <div className="fs-1 mb-3">📝</div>
                    <div className="fs-5">Документів не знайдено</div>
                    <div className="small">
                      Спробуйте змінити параметри пошуку
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="p-3"
                  style={{ height: "100%", overflowY: "auto" }}
                >
                  {filteredDocuments.map((document) => (
                    <Card
                      key={document.id}
                      className="mb-3 border-start border-primary border-4 shadow-sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDocumentClick(document.id)}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="card-title mb-2 text-primary">
                              {document.name}
                            </h6>
                            <div className="text-muted small mb-2">
                              <strong>Файл:</strong> {document.filename}
                            </div>
                            <Row className="text-muted small mb-2">
                              <Col md={6}>
                                <div className="mb-1">
                                  <strong>№ (шифр):</strong> {document.code}
                                </div>
                                <div>
                                  <strong>Введений в дію:</strong>{" "}
                                  {document.issue_date
                                    ? formatDate(document.issue_date)
                                    : "Не вказано"}
                                </div>
                              </Col>
                              <Col md={6}>
                                <div className="mb-1">
                                  <strong>Дійсний до:</strong>{" "}
                                  {document.valid_until
                                    ? formatDate(document.valid_until)
                                    : "Безстроково"}
                                </div>
                                <div>
                                  <strong>Розмір:</strong>{" "}
                                  {formatFileSize(document.file_size)}
                                </div>
                              </Col>
                            </Row>
                            <div className="d-flex align-items-center">
                              <Badge bg="primary" className="me-2">
                                {document.file_extension.toUpperCase()}
                              </Badge>
                              <Badge
                                bg={
                                  document.status === "active"
                                    ? "success"
                                    : "danger"
                                }
                                className="me-2"
                              >
                                {document.status === "active"
                                  ? "Активний"
                                  : "Неактивний"}
                              </Badge>
                            </div>
                          </div>
                          <div className="ms-3 d-flex flex-column align-items-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleDownload(document.id, document.filename);
                              }}
                              className="mb-2"
                            >
                              📥 Завантажити
                            </Button>
                            <small className="text-muted">
                              ID: {document.id}
                            </small>
                          </div>
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
    </Container>
  );
};

export default DocumentsSearch;
