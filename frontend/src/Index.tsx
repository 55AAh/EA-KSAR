import { Container, Card, Badge, Button } from "react-bootstrap";
import { Link } from "react-router";
import { useState } from "react";
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
  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Card.Header
        className={`text-${primaryColor} bg-white border-bottom flex-shrink-0`}
      >
        <h6 className="mb-0">
          {title}
          {items.filter((item) => !item.isRead).length > 0 && (
            <Badge bg={badgeVariant} className="ms-2">
              {items.filter((item) => !item.isRead).length}
            </Badge>
          )}
        </h6>
      </Card.Header>
      <Card.Body className="p-0 flex-grow-1" style={{ overflow: "hidden" }}>
        <div style={{ height: "100%", overflowY: "auto" }}>
          {items.map((item) => (
            <div
              key={item.id}
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
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div className="flex-grow-1 me-2">
                  <h6
                    className={`mb-1 ${
                      item.isRead ? "text-muted" : "text-dark fw-bold"
                    }`}
                    style={{ fontSize: "13px", lineHeight: "1.3" }}
                  >
                    {item.title}
                  </h6>
                </div>
                <div className="d-flex align-items-center flex-shrink-0">
                  <Button
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
                className={`mb-2 ${item.isRead ? "text-muted" : "text-dark"}`}
                style={{ fontSize: "11px", lineHeight: "1.4" }}
                dangerouslySetInnerHTML={{ __html: item.preview }}
              />
              {/* Footer with date and badge */}
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted" style={{ fontSize: "10px" }}>
                  {item.date}
                </small>
                {!item.isRead && (
                  <Badge bg={badgeVariant} style={{ fontSize: "9px" }}>
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
      className={`shadow-sm ${!isImplemented ? "opacity-50" : ""}`}
      style={{
        ...style,
        cursor: isImplemented ? "pointer" : "not-allowed",
        filter: !isImplemented ? "grayscale(50%)" : "none",
      }}
      onMouseEnter={isImplemented ? onMouseEnter : undefined}
      onMouseLeave={isImplemented ? onMouseLeave : undefined}
    >
      <Card.Body className="text-center p-3 d-flex flex-column justify-content-center">
        <div className="mb-2">
          <div
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
        <Card.Title className={`h6 ${app.textColor} mb-1`}>
          {app.title}
        </Card.Title>
        {!isImplemented && (
          <div className="mt-auto">
            <span className="badge bg-secondary" style={{ fontSize: "10px" }}>
              Незабаром
            </span>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  // Only wrap with Link if implemented
  if (isImplemented) {
    return (
      <Link to={app.route} className="text-decoration-none">
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
    id: "navigator",
    title: "Навігатор",
    icon: "🧭",
    backgroundColor: "#0d6efd",
    textColor: "text-primary",
    route: "/navigator",
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
    title: "Документ",
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
  // Check if an app is implemented
  const isAppImplemented = (appId: string) => {
    return appId === "navigator" || appId === "documents"; // Navigator and documents are implemented
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
      fluid
      style={{
        height: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "20px",
          height: "100%",
        }}
      >
        {/* News - Left Side */}
        <div
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
          style={{
            width: "66.666667%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ maxWidth: "600px", width: "100%" }}>
            <div className="text-center mb-5">
              <h1 className="mb-3">КСАР</h1>
              <p className="text-muted fs-5">
                Комплексна система аналізу результатів випробувань
                зразків-свідків та ресурсу корпусів реакторів
              </p>
              <hr
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
