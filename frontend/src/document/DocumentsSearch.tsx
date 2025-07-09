import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, useLoaderData } from "react-router";
import { Document } from "../types";
import { parseErrorResponse } from "../utils";

// Loader function for DocumentsSearch page
export async function documentsSearchLoader() {
  const response = await fetch("/api/documents/");

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return await response.json();
}

// ShouldRevalidate function for DocumentsSearch route
export function documentsSearchShouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: {
  currentUrl: URL;
  nextUrl: URL;
  defaultShouldRevalidate: boolean;
}) {
  // Don't revalidate if only search parameters changed (client-side filtering)
  if (currentUrl.pathname === nextUrl.pathname) {
    return false;
  }
  // Use default behavior for navigation to/from different routes
  return defaultShouldRevalidate;
}

const DocumentsSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const documents = useLoaderData() as Document[];

  // Extract filter values directly from URL search params
  const filterValues = useMemo(
    () => ({
      name: searchParams.get("name") || "",
      code: searchParams.get("code") || "",
      issueDateFrom: searchParams.get("issueDateFrom") || "",
      issueDateTo: searchParams.get("issueDateTo") || "",
      validUntilFrom: searchParams.get("validUntilFrom") || "",
      validUntilTo: searchParams.get("validUntilTo") || "",
    }),
    [searchParams]
  );

  // Filter documents based on current URL parameters
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by name
    if (filterValues.name.trim()) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(filterValues.name.toLowerCase())
      );
    }

    // Filter by code
    if (filterValues.code.trim()) {
      filtered = filtered.filter((doc) =>
        doc.code.toLowerCase().includes(filterValues.code.toLowerCase())
      );
    }

    // Filter by issue date range
    if (filterValues.issueDateFrom) {
      filtered = filtered.filter(
        (doc) =>
          new Date(doc.issue_date) >= new Date(filterValues.issueDateFrom)
      );
    }
    if (filterValues.issueDateTo) {
      filtered = filtered.filter(
        (doc) => new Date(doc.issue_date) <= new Date(filterValues.issueDateTo)
      );
    }

    // Filter by valid until date range
    if (filterValues.validUntilFrom) {
      filtered = filtered.filter(
        (doc) =>
          doc.valid_until &&
          new Date(doc.valid_until) >= new Date(filterValues.validUntilFrom)
      );
    }
    if (filterValues.validUntilTo) {
      filtered = filtered.filter(
        (doc) =>
          doc.valid_until &&
          new Date(doc.valid_until) <= new Date(filterValues.validUntilTo)
      );
    }

    return filtered;
  }, [documents, filterValues]);

  // Handle filter changes by updating URL search params directly
  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      const newParams = new URLSearchParams(searchParams);

      if (value.trim()) {
        newParams.set(field, value);
      } else {
        newParams.delete(field);
      }

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Clear all filters by clearing URL search params
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

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
      const response = await fetch(`/api/documents/${documentId}/download`);
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

  return (
    <Container
      id="documents-search-page-container"
      fluid
      className="py-4 h-100"
    >
      {/* Header with title and upload button */}
      <div
        id="documents-search-header"
        className="d-flex justify-content-between align-items-center mb-4"
      >
        <h1 id="documents-search-page-title" className="mb-0">
          📄 Документи
        </h1>
        <Button
          id="documents-create-new-button"
          variant="primary"
          onClick={() => navigate("/documents/upload")}
        >
          📤 Створити новий документ
        </Button>
      </div>

      <Row
        id="documents-search-content-row"
        className="h-100"
        style={{ minHeight: "calc(100vh - 200px)" }}
      >
        {/* Left Column - Search Filters */}
        <Col md={4} lg={3} className="pe-3">
          <Card id="documents-search-filters-card" className="h-100">
            <Card.Header>
              <h5 id="documents-search-filters-title" className="mb-0">
                🔍 Пошук документів
              </h5>
            </Card.Header>
            <Card.Body id="documents-search-filters-body">
              <Form id="documents-search-form">
                <Form.Group className="mb-3">
                  <Form.Label>Назва</Form.Label>
                  <Form.Control
                    id="documents-search-name-input"
                    type="text"
                    value={filterValues.name}
                    onChange={(e) => handleFilterChange("name", e.target.value)}
                    placeholder="Введіть назву документа"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>№ (шифр)</Form.Label>
                  <Form.Control
                    id="documents-search-code-input"
                    type="text"
                    value={filterValues.code}
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
                        id="documents-search-issue-date-from-input"
                        type="date"
                        value={filterValues.issueDateFrom}
                        onChange={(e) =>
                          handleFilterChange("issueDateFrom", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label className="text-muted small">До</Form.Label>
                      <Form.Control
                        id="documents-search-issue-date-to-input"
                        type="date"
                        value={filterValues.issueDateTo}
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
                        id="documents-search-valid-until-from-input"
                        type="date"
                        value={filterValues.validUntilFrom}
                        onChange={(e) =>
                          handleFilterChange("validUntilFrom", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label className="text-muted small">До</Form.Label>
                      <Form.Control
                        id="documents-search-valid-until-to-input"
                        type="date"
                        value={filterValues.validUntilTo}
                        onChange={(e) =>
                          handleFilterChange("validUntilTo", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    id="documents-search-clear-filters-button"
                    variant="secondary"
                    onClick={clearFilters}
                  >
                    Очистити фільтри
                  </Button>
                </div>

                <div className="mt-3 text-center">
                  <small
                    id="documents-search-results-count"
                    className="text-muted"
                  >
                    Знайдено: {filteredDocuments.length} документів
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Document Results */}
        <Col md={8} lg={9} className="ps-3">
          <Card id="documents-search-results-card" className="h-100">
            <Card.Header>
              <h5 id="documents-search-results-title" className="mb-0">
                📋 Результати пошуку
              </h5>
            </Card.Header>
            <Card.Body
              id="documents-search-results-body"
              className="p-0"
              style={{ overflow: "hidden" }}
            >
              {filteredDocuments.length === 0 ? (
                <div
                  id="documents-search-no-results"
                  className="d-flex justify-content-center align-items-center h-100"
                >
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
                  id="documents-search-results-list"
                  className="p-3"
                  style={{ height: "100%", overflowY: "auto" }}
                >
                  {filteredDocuments.map((document) => (
                    <Card
                      key={document.id}
                      id={`document-card-${document.id}`}
                      className="mb-3 border-start border-primary border-4 shadow-sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDocumentClick(document.id)}
                    >
                      <Card.Body id={`document-card-body-${document.id}`}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6
                              id={`document-card-title-${document.id}`}
                              className="card-title mb-2 text-primary"
                            >
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
