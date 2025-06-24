import { Container } from "react-bootstrap";

export default function Search() {
  return (
    <Container
      fluid
      className="py-4"
      style={{ minHeight: "calc(100vh - 60px)" }}
    >
      <div className="d-flex align-items-center justify-content-center h-100">
        <div className="text-center">
          <h1 className="mb-3">Пошук</h1>
          <p className="text-muted fs-5">
            Компонент пошуку буде реалізований пізніше
          </p>
        </div>
      </div>
    </Container>
  );
}
