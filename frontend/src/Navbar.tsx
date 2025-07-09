import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { Navbar as BootstrapNavbar, Breadcrumb } from "react-bootstrap";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useAuth } from "./AuthContext";
import { NavLink, Link, useLocation, useParams } from "react-router";
import { useState, useEffect } from "react";

interface BreadcrumbItem {
  label: string;
  path: string;
  active: boolean;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const params = useParams();
  const [unitName, setUnitName] = useState<string | null>(null);

  // Fetch unit name when on unit page
  useEffect(() => {
    if (params.name_eng && location.pathname.includes("/units/")) {
      fetch(`/api/unit/${params.name_eng}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.name) {
            setUnitName(data.name);
          } else {
            setUnitName(params.name_eng || null); // Fallback to name_eng
          }
        })
        .catch((error) => {
          console.error("Error fetching unit name:", error);
          setUnitName(params.name_eng || null); // Fallback to name_eng
        });
    } else {
      setUnitName(null);
    }
  }, [params.name_eng, location.pathname]);
  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Don't include "Головна" since the brand logo serves as home link
    // Only add breadcrumbs for actual navigation paths

    // Build breadcrumbs based on path segments
    let currentPath = "";
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathnames.length - 1;

      if (segment === "units" && index === 0) {
        breadcrumbs.push({
          label: "Енергоблоки",
          path: "/units",
          active: isLast,
        });
      } else if (segment === "documents" && index === 0) {
        breadcrumbs.push({
          label: "Документи",
          path: "/documents",
          active: isLast && pathnames.length === 1,
        });
      } else if (segment === "upload" && pathnames.includes("documents")) {
        breadcrumbs.push({
          label: "Завантажити документ",
          path: currentPath,
          active: isLast,
        });
      } else if (segment === "change-password") {
        breadcrumbs.push({
          label: "Змінити пароль",
          path: currentPath,
          active: isLast,
        });
      } else if (params.name_eng && isLast && pathnames.includes("units")) {
        // For unit details page - use fetched unit name or fallback to name_eng
        const displayName = unitName || params.name_eng;
        breadcrumbs.push({
          label: displayName,
          path: currentPath,
          active: true,
        });
      } else if (
        pathnames.includes("documents") &&
        /^\d+$/.test(segment) &&
        isLast
      ) {
        // For document details page (numeric ID)
        breadcrumbs.push({
          label: "Перегляд документа",
          path: currentPath,
          active: true,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  return (
    <BootstrapNavbar id="main-navbar" className="bg-body-tertiary">
      <Container fluid>
        <BootstrapNavbar.Brand id="navbar-brand" as={Link} to="/">
          КСАР
        </BootstrapNavbar.Brand>{" "}
        {/* Dynamic Breadcrumbs in navbar */}
        <div className="me-auto d-flex align-items-center">
          {breadcrumbs.length > 0 && (
            <nav id="breadcrumb-nav" aria-label="breadcrumb">
              <ol
                id="breadcrumb-list"
                className="breadcrumb mb-0"
                style={{ backgroundColor: "transparent" }}
              >
                {breadcrumbs.map((crumb, index) => (
                  <li
                    key={crumb.path}
                    className={`breadcrumb-item ${
                      crumb.active ? "active" : ""
                    }`}
                  >
                    {crumb.active ? (
                      <span className="text-muted">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.path} className="text-decoration-none">
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
        <NavDropdown id="user-dropdown" title={user.username} align="end">
          <NavDropdown.Item as={Link} to="/change-password">
            Змінити пароль
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={logout} className="text-danger">
            Вийти з системи
          </NavDropdown.Item>
        </NavDropdown>
      </Container>
    </BootstrapNavbar>
  );
}
