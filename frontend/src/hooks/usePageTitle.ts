import { useEffect } from "react";
import { useLocation } from "react-router";

// Define page titles for different routes
const getPageTitle = (pathname: string): string => {
  // Remove trailing slashes and normalize path
  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  switch (normalizedPath) {
    case "/":
      return "КСАР - Головна";
    case "/navigator":
      return "КСАР - Навігатор";
    case "/navigator/units":
      return "КСАР - Блоки АЕС";
    case "/navigator/search":
      return "КСАР - Пошук об'єктів";
    case "/navigator/search/plants":
      return "КСАР - Пошук АЕС";
    case "/navigator/search/units":
      return "КСАР - Пошук енергоблоків";
    case "/documents":
      return "КСАР - Документи";
    case "/documents/search":
      return "КСАР - Пошук документів";
    default:
      // Handle dynamic routes like /navigator/units/:name_eng
      if (normalizedPath.startsWith("/navigator/units/")) {
        return "КСАР - Деталі енергоблоку";
      }
      if (normalizedPath.startsWith("/documents/")) {
        return "КСАР - Документ";
      }
      return "КСАР";
  }
};

// Custom hook to update page title based on current route
export const usePageTitle = (customTitle?: string) => {
  const location = useLocation();

  useEffect(() => {
    const title = customTitle || getPageTitle(location.pathname);
    document.title = title;
  }, [location.pathname, customTitle]);
};

// Helper function to update title manually
export const updatePageTitle = (title: string) => {
  document.title = title;
};
