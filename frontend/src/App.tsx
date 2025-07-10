import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Index from "./Index";
import UnitSelector, { unitSelectorLoader } from "./UnitSelector";
import ErrorBoundary from "./ErrorBoundary";
import Navbar from "./Navbar";
import DocumentsSearch, {
  documentsSearchLoader,
  documentsSearchShouldRevalidate,
} from "./document/DocumentsSearch";
import Document, { documentLoader } from "./document/Document";
import DocumentUpload from "./document/DocumentUpload";
import ChangePassword from "./ChangePassword";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import Unit, { unitLoader } from "./Unit";
import { useNavigation } from "react-router";
import { Spinner, Container } from "react-bootstrap";
import Unit2, { unitLoader2 } from "./Unit2";

function LoadingScreen() {
  return (
    <Container
      id="loading-container"
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100%" }}
    >
      <div className="text-center">
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "3rem", height: "3rem" }}
        />
        <div className="mt-3 text-muted">Завантаження...</div>
      </div>
    </Container>
  );
}

// Layout component that includes Navbar
function Layout() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <>
      <header id="app-header">
        <Navbar />
      </header>
      <main id="app-main">{isNavigating ? <LoadingScreen /> : <Outlet />}</main>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <LoadingScreen />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "units",
        element: <UnitSelector />,
        loader: unitSelectorLoader,
        hydrateFallbackElement: <LoadingScreen />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "units/:name_eng",
        element: <Unit />,
        loader: unitLoader,
        hydrateFallbackElement: <LoadingScreen />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "units2/:name_eng",
        element: <Unit2 />,
        loader: unitLoader2,
        hydrateFallbackElement: <LoadingScreen />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "documents",
        element: <DocumentsSearch />,
        loader: documentsSearchLoader,
        shouldRevalidate: documentsSearchShouldRevalidate,
        hydrateFallbackElement: <LoadingScreen />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "documents/upload",
        element: <DocumentUpload />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "documents/:id",
        element: <Document />,
        loader: documentLoader,
        hydrateFallbackElement: <LoadingScreen />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
        errorElement: <ErrorBoundary />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
