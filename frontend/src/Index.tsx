import { Container, Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { usePageTitle } from "./hooks/usePageTitle";

// Types for feed items
interface FeedItem {
  id: number;
  title: string;
  preview: string;
  date: string;
  isRead: boolean;
}

interface FeedSectionProps {
  title: string;
  items: FeedItem[];
  onToggleReadStatus: (id: number) => void;
  onDeleteItem: (id: number) => void;
  primaryColor: string;
  badgeVariant: string;
  newItemText: string;
}

// Types for app launcher items
interface AppItem {
  id: string;
  title: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
  route: string;
}

interface AppCardProps {
  app: AppItem;
  style: React.CSSProperties;
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
  isImplemented: boolean;
}

// Reusable FeedSection component
function FeedSection({
  title,
  items,
  onToggleReadStatus,
  onDeleteItem,
  primaryColor,
  badgeVariant,
  newItemText,
}: FeedSectionProps) {
  const sectionId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <Card
      id={`feed-section-${sectionId}`}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Card.Header
        id={`feed-header-${sectionId}`}
        className={`text-${primaryColor} bg-white border-bottom flex-shrink-0`}
      >
        <h6 id={`feed-title-${sectionId}`} className="mb-0">
          {title}
          {items.filter((item) => !item.isRead).length > 0 && (
            <Badge
              id={`feed-unread-badge-${sectionId}`}
              bg={badgeVariant}
              className="ms-2"
            >
              {items.filter((item) => !item.isRead).length}
            </Badge>
          )}
        </h6>
      </Card.Header>
      <Card.Body
        id={`feed-body-${sectionId}`}
        className="p-0 flex-grow-1"
        style={{ overflow: "hidden" }}
      >
        <div
          id={`feed-items-container-${sectionId}`}
          style={{ height: "100%", overflowY: "auto" }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              id={`feed-item-${sectionId}-${item.id}`}
              className={`border-bottom ${
                item.isRead ? "bg-light" : "bg-white"
              }`}
              style={{
                borderLeft: item.isRead
                  ? "none"
                  : `4px solid ${
                      primaryColor === "primary" ? "#0d6efd" : "#ffc107"
                    }`,
                padding: "10px",
              }}
            >
              {/* Header with title and controls */}
              <div
                id={`feed-item-header-${sectionId}-${item.id}`}
                className="d-flex justify-content-between align-items-start mb-1"
              >
                <div className="flex-grow-1 me-2">
                  <h6
                    id={`feed-item-title-${sectionId}-${item.id}`}
                    className={`mb-1 ${
                      item.isRead ? "text-muted" : "text-dark fw-bold"
                    }`}
                    style={{ fontSize: "13px", lineHeight: "1.3" }}
                  >
                    {item.title}
                  </h6>
                </div>
                <div
                  id={`feed-item-controls-${sectionId}-${item.id}`}
                  className="d-flex align-items-center flex-shrink-0"
                >
                  <Button
                    id={`feed-item-read-toggle-${sectionId}-${item.id}`}
                    variant="link"
                    size="sm"
                    onClick={() => onToggleReadStatus(item.id)}
                    className="p-0 border-0 me-1 text-decoration-none"
                    style={{
                      fontSize: "11px",
                      lineHeight: "1",
                      minWidth: "auto",
                    }}
                    title={
                      item.isRead
                        ? "Позначити як не прочитане"
                        : "Позначити як прочитане"
                    }
                  >
                    <span
                      style={{
                        textDecoration: item.isRead ? "line-through" : "none",
                        opacity: item.isRead ? 0.5 : 1,
                        filter: item.isRead ? "grayscale(100%)" : "none",
                      }}
                    >
                      👁
                    </span>
                  </Button>
                  <Button
                    id={`feed-item-delete-${sectionId}-${item.id}`}
                    variant="link"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-0 border-0 text-danger text-decoration-none"
                    style={{
                      fontSize: "11px",
                      lineHeight: "1",
                      minWidth: "auto",
                    }}
                    title={`Видалити ${
                      primaryColor === "primary" ? "новину" : "повідомлення"
                    }`}
                  >
                    🗑
                  </Button>
                </div>
              </div>
              {/* Preview text */}
              <div
                id={`feed-item-preview-${sectionId}-${item.id}`}
                className={`mb-2 ${item.isRead ? "text-muted" : "text-dark"}`}
                style={{ fontSize: "11px", lineHeight: "1.4" }}
                dangerouslySetInnerHTML={{ __html: item.preview }}
              />
              {/* Footer with date and badge */}
              <div
                id={`feed-item-footer-${sectionId}-${item.id}`}
                className="d-flex justify-content-between align-items-center"
              >
                <small
                  id={`feed-item-date-${sectionId}-${item.id}`}
                  className="text-muted"
                  style={{ fontSize: "10px" }}
                >
                  {item.date}
                </small>
                {!item.isRead && (
                  <Badge
                    id={`feed-item-new-badge-${sectionId}-${item.id}`}
                    bg={badgeVariant}
                    style={{ fontSize: "9px" }}
                  >
                    {newItemText}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

// Reusable AppCard component
function AppCard({
  app,
  style,
  onMouseEnter,
  onMouseLeave,
  isImplemented,
}: AppCardProps) {
  const cardContent = (
    <Card
      id={`app-card-${app.id}`}
      className={`shadow-sm`}
      style={{
        ...style,
        cursor: isImplemented ? "pointer" : "not-allowed",
        opacity: !isImplemented ? 0.6 : 1,
        filter: !isImplemented ? "grayscale(70%)" : "none",
      }}
      onMouseEnter={isImplemented ? onMouseEnter : undefined}
      onMouseLeave={isImplemented ? onMouseLeave : undefined}
    >
      <Card.Body
        id={`app-card-body-${app.id}`}
        className="text-center p-3 d-flex flex-column justify-content-center align-items-center"
        style={{ height: "100%" }}
      >
        <div className="mb-2">
          <div
            id={`app-card-icon-${app.id}`}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: app.backgroundColor,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontSize: "18px",
            }}
          >
            {app.icon}
          </div>
        </div>
        <Card.Title
          id={`app-card-title-${app.id}`}
          className={`h6 ${app.textColor} mb-2`}
        >
          {app.title}
        </Card.Title>
        {!isImplemented && (
          <span
            id={`app-card-soon-badge-${app.id}`}
            className="badge bg-secondary"
            style={{ fontSize: "10px" }}
          >
            Незабаром
          </span>
        )}
      </Card.Body>
    </Card>
  );

  // Only wrap with Link if implemented
  if (isImplemented) {
    return (
      <Link
        id={`app-link-${app.id}`}
        to={app.route}
        className="text-decoration-none"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

// Dummy news data
const initialNewsItems: FeedItem[] = [
  {
    id: 1,
    title: "Реалізовано перший етап ІАС КСАР",
    preview:
      "Розроблена загальна архітектура та база даних <b>ІАС КСАР</b>. Для пілотного енергоблока (<b>ПАЕС-1</b>) дані внесені в систему.",
    date: "30.06.2025",
    isRead: false,
  },
];

// Dummy notifications data
const initialNotifications: FeedItem[] = [
  {
    id: 1,
    title: "Вашу роль змінено",
    preview:
      "Системний адміністратор змінив роль Вашого облікового запису на <b>Фахівець з актуалізації даних</b>.",
    date: "22.06.2025",
    isRead: true,
  },
  {
    id: 2,
    title: "Вам надано доступ до системи",
    preview: "Системний адміністратор зареєстрував ваш обліковий запис.",
    date: "22.06.2025",
    isRead: true,
  },
];

// App launcher data
const appItems: AppItem[] = [
  {
    id: "units",
    title: "Енергоблоки",
    icon: "🏭",
    backgroundColor: "#0d6efd",
    textColor: "text-primary",
    route: "/units",
  },
  {
    id: "fuel-campaigns",
    title: "Паливні кампанії",
    icon: "⚡",
    backgroundColor: "#198754",
    textColor: "text-success",
    route: "/fuel-campaigns",
  },
  {
    id: "testing",
    title: "Випробування ЗС",
    icon: "🔬",
    backgroundColor: "#dc3545",
    textColor: "text-danger",
    route: "/testing",
  },
  {
    id: "accounting",
    title: "Облік ЗС",
    icon: "📊",
    backgroundColor: "#fd7e14",
    textColor: "text-warning",
    route: "/accounting",
  },
  {
    id: "documents",
    title: "Документи",
    icon: "📄",
    backgroundColor: "#6f42c1",
    textColor: "text-primary",
    route: "/documents",
  },
  {
    id: "materials",
    title: "Матеріали",
    icon: "🏗️",
    backgroundColor: "#20c997",
    textColor: "text-info",
    route: "/materials",
  },
];

export default function Index() {
  usePageTitle(); // This will set "КСАР - Головна"

  const [newsItems, setNewsItems] = useState(initialNewsItems);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Set page title
  useEffect(() => {
    document.title = "Головна - КСАР";
  }, []);
  // Check if an app is implemented
  const isAppImplemented = (appId: string) => {
    return appId === "units" || appId === "documents"; // Units and documents are implemented
  };

  // Common style for all app cards
  const appCardStyle = {
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    backgroundColor: "#fafafa",
    border: "2px solid #e9ecef",
    height: "160px",
    width: "160px",
  };

  // Common hover handlers for all app cards
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  };

  const toggleNewsReadStatus = (id: number) => {
    setNewsItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
  };

  const deleteNewsItem = (id: number) => {
    setNewsItems((items) => items.filter((item) => item.id !== id));
  };

  const toggleNotificationReadStatus = (id: number) => {
    setNotifications((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((items) => items.filter((item) => item.id !== id));
  };
  return (
    <Container
      id="index-page-container"
      fluid
      style={{
        height: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <div
        id="index-main-layout"
        style={{
          flex: 1,
          display: "flex",
          gap: "20px",
          height: "100%",
        }}
      >
        {/* News - Left Side */}
        <div
          id="index-news-column"
          style={{
            width: "16.666667%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <FeedSection
            title="Новини"
            items={newsItems}
            onToggleReadStatus={toggleNewsReadStatus}
            onDeleteItem={deleteNewsItem}
            primaryColor="primary"
            badgeVariant="primary"
            newItemText="Нова"
          />
        </div>
        {/* App Launcher - Center */}
        <div
          id="index-app-launcher-column"
          style={{
            width: "66.666667%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            id="index-app-launcher-content"
            style={{ maxWidth: "600px", width: "100%" }}
          >
            <div id="index-hero-section" className="text-center mb-5">
              <h1 id="index-main-title" className="mb-3">
                ІАС КСАР
              </h1>
              <p id="index-main-description" className="text-muted fs-5">
                Інформаційно-аналітична система
                <br />
                «Комплексна система аналізу результатів випробувань
                <br />
                зразків-свідків та ресурсу корпусів реакторів»
              </p>
              <hr
                id="index-divider"
                style={{
                  margin: "2rem 0",
                  border: "none",
                  height: "1px",
                  background:
                    "linear-gradient(to right, transparent, #dee2e6, transparent)",
                }}
              />
            </div>{" "}
            {/* App Launcher Grid */}{" "}
            <div
              id="index-app-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 160px)",
                gridTemplateRows: "repeat(2, 160px)",
                gap: "20px",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              {" "}
              {appItems.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  style={appCardStyle}
                  onMouseEnter={handleCardMouseEnter}
                  onMouseLeave={handleCardMouseLeave}
                  isImplemented={isAppImplemented(app.id)}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Notifications - Right Side */}
        <div
          id="index-notifications-column"
          style={{
            width: "16.666667%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <FeedSection
            title="Повідомлення"
            items={notifications}
            onToggleReadStatus={toggleNotificationReadStatus}
            onDeleteItem={deleteNotification}
            primaryColor="warning"
            badgeVariant="warning"
            newItemText="Нове"
          />
        </div>
      </div>
    </Container>
  );
}
