import "bootstrap/dist/css/bootstrap.min.css";

import Index from "./Index";
import Navbar from "./Navbar";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import Unit from "./Unit";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <>
                <Navbar />
                <Outlet />
              </>
            }
          >
            <Route index element={<Index />} />
            <Route path="/unit/:name_eng" element={<Unit />} />
            <Route path="*" element={<>404</>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
