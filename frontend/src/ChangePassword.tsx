import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { usePageTitle } from "./hooks/usePageTitle";
import { parseErrorResponse } from "./utils";

export default function ChangePassword() {
  usePageTitle("КСАР - Зміна паролю");

  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Змінити пароль - КСАР";
  }, []);

  // Get the previous page to return to after successful password change
  const previousPage = location.state?.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (newPassword.length < 6) {
      setError("Новий пароль повинен містити принаймні 6 символів!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Паролі не збігаються!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }
      // Show success message
      setSuccess(true);
      setError(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError("Сталася невідома помилка!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(previousPage);
  };

  const handleSuccessOk = () => {
    // Navigate to root and force reload to ensure user is logged out
    window.location.href = "/";
  };

  return (
    <Container
      id="change-password-page-container"
      fluid
      className="py-4 d-flex justify-content-center align-items-center"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <div
        id="change-password-form-wrapper"
        style={{ width: "100%", maxWidth: "500px" }}
      >
        <Card id="change-password-card" className="shadow">
          <Card.Header className="bg-primary text-white">
            <h4 id="change-password-title" className="mb-0">
              🔒 Змінити пароль
            </h4>
          </Card.Header>
          <Card.Body id="change-password-card-body" className="p-4">
            {success ? (
              <div id="change-password-success" className="text-center">
                <Alert variant="success" className="mb-4">
                  <h5>✅ Пароль успішно змінено!</h5>
                  <p className="mb-0">
                    Ваш пароль було успішно оновлено.
                    <br />
                    Всі сесії завершено з міркувань безпеки.
                  </p>
                </Alert>
                <Button
                  id="change-password-success-ok-button"
                  variant="primary"
                  size="lg"
                  onClick={handleSuccessOk}
                  className="px-5"
                >
                  OK
                </Button>
              </div>
            ) : (
              <Form id="change-password-form" onSubmit={handleSubmit}>
                {error && (
                  <Alert
                    id="change-password-error-alert"
                    variant="danger"
                    className="mb-3"
                  >
                    {error}
                  </Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Новий пароль</Form.Label>
                  <Form.Control
                    id="change-password-new-password-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Введіть новий пароль (мін. 6 символів)"
                    disabled={loading}
                    minLength={6}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Підтвердження нового пароля</Form.Label>
                  <Form.Control
                    id="change-password-confirm-password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторіть новий пароль"
                    disabled={loading}
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    id="change-password-submit-button"
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? "Змінюємо пароль..." : "Змінити пароль"}
                  </Button>
                  <Button
                    id="change-password-cancel-button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Скасувати
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}
