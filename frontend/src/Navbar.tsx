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
    if (params.name_eng && location.pathname.includes("/navigator/units/")) {
      fetch(`/api/unit/${params.name_eng}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.unit && data.unit.name) {
            setUnitName(data.unit.name);
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

      if (segment === "navigator") {
        breadcrumbs.push({
          label: "Навігатор",
          path: "/navigator",
          active: isLast,
        });
      } else if (segment === "units" && pathnames[index - 1] === "navigator") {
        breadcrumbs.push({
          label: "Блоки АЕС",
          path: "/navigator/units",
          active: isLast,
        });
      } else if (segment === "search" && pathnames[index - 1] === "navigator") {
        breadcrumbs.push({
          label: "Пошук",
          path: "/navigator/search",
          active: isLast,
        });
      } else if (segment === "plants" && pathnames[index - 1] === "search") {
        breadcrumbs.push({
          label: "Пошук АЕС",
          path: "/navigator/search/plants",
          active: isLast,
        });
      } else if (segment === "units" && pathnames[index - 1] === "search") {
        breadcrumbs.push({
          label: "Пошук енергоблоків",
          path: "/navigator/search/units",
          active: isLast,
        });
      } else if (segment === "documents") {
        breadcrumbs.push({
          label: "Документи",
          path: "/documents",
          active: isLast,
        });
      } else if (segment === "search" && pathnames[index - 1] === "documents") {
        breadcrumbs.push({
          label: "Пошук документів",
          path: "/documents/search",
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
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  return (
    <BootstrapNavbar className="bg-body-tertiary">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/">
          КСАР
        </BootstrapNavbar.Brand>{" "}
        {/* Dynamic Breadcrumbs in navbar */}
        <div className="me-auto d-flex align-items-center">
          {breadcrumbs.length > 0 && (
            <nav aria-label="breadcrumb">
              <ol
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
        <NavDropdown title={user.username} align="end">
          <NavDropdown.Item onClick={logout} className="text-danger">
            Вийти з системи
          </NavDropdown.Item>
        </NavDropdown>
      </Container>
    </BootstrapNavbar>
  );
}
