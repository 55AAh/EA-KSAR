import { useRouteError, Link, isRouteErrorResponse } from "react-router";
import { Container, Button } from "react-bootstrap";

export default function ErrorBoundary() {
  const error = useRouteError();

  // Log detailed error information for developers
  console.error("Caught error:", error);

  let errorStatus: number | string = "Помилка";
  let userMessage: string;

  if (isRouteErrorResponse(error)) {
    // HTTP response errors - show actual status code
    errorStatus = error.status;

    // Specific Ukrainian explanations for common HTTP status codes
    switch (errorStatus) {
      case 400:
        userMessage = "Неправильний запит";
        break;
      case 401:
        userMessage = "Потрібна авторизація";
        break;
      case 403:
        userMessage = "Доступ заборонено";
        break;
      case 404:
        userMessage = "Сторінка не знайдена";
        break;
      case 408:
        userMessage = "Час очікування вичерпано";
        break;
      case 429:
        userMessage = "Забагато запитів";
        break;
      case 500:
        userMessage = "Внутрішня помилка сервера";
        break;
      case 502:
        userMessage = "Поганий шлюз";
        break;
      case 503:
        userMessage = "Сервіс недоступний";
        break;
      case 504:
        userMessage = "Час очікування шлюзу вичерпано";
        break;
      default:
        // Fallback for other status codes
        if (errorStatus >= 400 && errorStatus < 500) {
          userMessage = "Помилка клієнта";
        } else if (errorStatus >= 500) {
          userMessage = "Помилка сервера";
        } else {
          userMessage = "Помилка запиту";
        }
    }
  } else if (error instanceof Error) {
    // JavaScript errors - use generic error code
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      userMessage = "Помилка мережі";
    } else if (error.name === "SyntaxError") {
      userMessage = "Помилка обробки даних";
    } else if (error.name === "AbortError") {
      userMessage = "Запит скасовано";
    } else {
      userMessage = "Помилка додатку";
    }
  } else {
    // Unknown error types
    userMessage = "Невідома помилка";
  }

  return (
    <Container
      id="global-error-boundary"
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100%",
        backgroundColor: "#f8f9fa",
        flexDirection: "column",
      }}
    >
      <div className="text-center">
        {/* Big numerical status code */}
        <div
          id="error-status-code"
          style={{
            fontSize: "120px",
            fontWeight: "bold",
            color: "#dc3545",
            lineHeight: "1",
            marginBottom: "20px",
            fontFamily: "monospace",
          }}
        >
          {errorStatus}
        </div>

        {/* Text explanation */}
        <div
          id="error-message"
          style={{
            fontSize: "24px",
            color: "#6c757d",
            marginBottom: "40px",
            maxWidth: "500px",
          }}
        >
          {userMessage}
        </div>

        {/* Action buttons */}
        <div id="error-actions" className="d-flex justify-content-center gap-3">
          <Button
            id="back-button"
            variant="outline-secondary"
            size="lg"
            onClick={() => window.history.back()}
          >
            Назад
          </Button>
          <Button
            id="retry-button"
            variant="danger"
            size="lg"
            onClick={() => window.location.reload()}
          >
            Спробувати знову
          </Button>
        </div>
      </div>
    </Container>
  );
}
