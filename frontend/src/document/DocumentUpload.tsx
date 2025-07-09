import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";

interface DocumentFormData {
  name: string;
  code: string;
  issueDate: string;
  validUntilDate: string;
  file: File | null;
}

const DocumentUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<DocumentFormData>({
    name: "",
    code: "",
    issueDate: "",
    validUntilDate: "",
    file: null,
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Завантажити документ - КСАР";
  }, []);

  const handleInputChange = (field: keyof DocumentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      file,
    }));
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      setError("Будь ласка, оберіть файл для завантаження");
      return;
    }

    if (!formData.name.trim()) {
      setError("Будь ласка, введіть назву документа");
      return;
    }

    if (!formData.code.trim()) {
      setError("Будь ласка, введіть № (шифр) документа");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("name", formData.name);
      uploadFormData.append("code", formData.code);

      if (formData.issueDate) {
        uploadFormData.append("issue_date", formData.issueDate);
      }

      if (formData.validUntilDate) {
        uploadFormData.append("valid_until_date", formData.validUntilDate);
      }

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Помилка завантаження документа");
      }

      const createdDocument = await response.json();

      // Navigate to the newly created document
      navigate(`/documents/${createdDocument.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка завантаження документа"
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Container id="document-upload-page-container" fluid className="py-4">
      {/* Header */}
      <div
        id="document-upload-header"
        className="d-flex align-items-center mb-4"
      >
        <h1 id="document-upload-page-title" className="mb-0">
          📤 Створити новий документ
        </h1>
      </div>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card id="document-upload-form-card">
            <Card.Header>
              <h5 id="document-upload-form-title" className="mb-0">
                📋 Інформація про документ
              </h5>
            </Card.Header>
            <Card.Body id="document-upload-form-body">
              {error && (
                <Alert
                  id="document-upload-error-alert"
                  variant="danger"
                  className="mb-4"
                >
                  {error}
                </Alert>
              )}

              <Form id="document-upload-form" onSubmit={handleUpload}>
                {/* Required Fields */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Назва документа <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    id="document-upload-name-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Введіть назву документа"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    № (шифр) документа <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    id="document-upload-code-input"
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    placeholder="Введіть № (шифр) документа"
                    required
                  />
                </Form.Group>

                {/* Optional Fields */}
                <Form.Group className="mb-3">
                  <Form.Label>Дата введення в дію</Form.Label>
                  <Form.Control
                    id="document-upload-issue-date-input"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Термін дії</Form.Label>
                  <Form.Control
                    id="document-upload-valid-until-input"
                    type="date"
                    value={formData.validUntilDate}
                    onChange={(e) =>
                      handleInputChange("validUntilDate", e.target.value)
                    }
                  />
                </Form.Group>

                {/* File Upload */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    Файл документа <span className="text-danger">*</span>
                  </Form.Label>

                  <div
                    id="document-upload-file-dropzone"
                    className={`border rounded p-4 text-center ${
                      dragActive
                        ? "border-primary bg-light"
                        : "border-secondary"
                    }`}
                    style={{ cursor: "pointer", minHeight: "150px" }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      id="document-upload-file-input"
                      ref={fileInputRef}
                      type="file"
                      style={{ display: "none" }}
                      onChange={handleFileInputChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.zip,.rar,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.dwg,.dxf"
                    />

                    {formData.file ? (
                      <div>
                        <div className="fs-1 text-success mb-2">📄</div>
                        <div className="fw-bold">{formData.file.name}</div>
                        <div className="text-muted">
                          {formatFileSize(formData.file.size)}
                        </div>
                        <div className="small text-muted mt-2">
                          Клікніть або перетягніть інший файл для заміни
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="fs-1 text-muted mb-2">📁</div>
                        <div className="fw-bold">
                          Перетягніть файл сюди або клікніть для вибору
                        </div>
                        <div className="text-muted small mt-2">
                          Підтримувані формати: PDF, DOC, DOCX, XLS, XLSX, TXT,
                          RTF, ZIP, RAR, зображення, CAD файли
                        </div>
                      </div>
                    )}
                  </div>
                </Form.Group>

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <Button
                    id="document-upload-submit-button"
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={uploading || !formData.file}
                  >
                    {uploading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Завантаження...
                      </>
                    ) : (
                      "📤 Створити документ"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentUpload;
