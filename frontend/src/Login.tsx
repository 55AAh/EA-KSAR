import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Cookies from "js-cookie";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    // Clear previous error
    setLoginError("");

    if (form.checkValidity() === false || !login.trim() || !password.trim()) {
      setValidated(true);
      return;
    }

    setBusy(true);

    // Form is valid, proceed with login logic
    try {
      console.log("Sending login request...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": Cookies.get("csrftoken") || "",
        },
        body: JSON.stringify({
          username: login,
          password: password,
        }),
      });
      if (response.ok) {
        onLoginSuccess();
      } else {
        setBusy(false);
        if (response.status === 401) {
          setLoginError("Невірний логін або пароль!");
        } else {
          throw response;
        }
      }
    } catch (error) {
      setBusy(false);
      console.error("Error during login:", error);
      setLoginError("Невідома помилка. Спробуйте пізніше.");
    }
  }

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center min-vh-100"
    >
      <Row className="w-100">
        {" "}
        <Col xs={12} sm={8} md={6} lg={4} xl={3} className="mx-auto">
          {" "}
          <div className="p-4 border rounded shadow-sm bg-white">
            <h3 className="text-center mb-4">Вхід в КСАР</h3>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <div
                style={{
                  height: loginError ? "3.5rem" : "0",
                  overflow: "hidden",
                  transition: "height 0.2s ease",
                }}
              >
                <div className="alert alert-danger p-2 m-0" role="alert">
                  {loginError}
                </div>
              </div>

              <Form.Group className="mb-3" controlId="formBasicLogin">
                <Form.Label>Логін</Form.Label>{" "}
                <Form.Control
                  type="text"
                  placeholder="Введіть логін"
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value);
                    setLoginError(""); // Clear error when user types
                  }}
                  required
                  isInvalid={validated && !login.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Логін не може бути порожнім
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Пароль</Form.Label>{" "}
                <Form.Control
                  type="password"
                  placeholder="Введіть пароль"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError(""); // Clear error when user types
                  }}
                  required
                  isInvalid={validated && !password.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Пароль не може бути порожнім
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={busy}
              >
                Увійти
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
