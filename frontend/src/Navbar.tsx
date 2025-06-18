import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { Navbar as BootstrapNavbar } from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useAuth } from "./AuthContext";
import { NavLink, Link } from "react-router";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <BootstrapNavbar className="bg-body-tertiary">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/">
          КСАР
        </BootstrapNavbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={NavLink} to="/">
            Головна
          </Nav.Link>
        </Nav>
        <NavDropdown title={user.username} align="end">
          <NavDropdown.Item onClick={logout} className="text-danger">
            Вийти з системи
          </NavDropdown.Item>
        </NavDropdown>
      </Container>
    </BootstrapNavbar>
  );
}
