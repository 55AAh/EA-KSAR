import "bootstrap/dist/css/bootstrap.min.css";

import Index from "./Index";
import UnitSelector from "./UnitSelector";
import Navbar from "./Navbar";
import Navigator from "./Navigator";
import Search from "./Search";
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
            {" "}
            <Route index element={<Index />} />
            <Route path="/navigator" element={<Navigator />} />
            <Route path="/navigator/search" element={<Search />} />
            <Route path="/navigator/units" element={<UnitSelector />} />
            <Route path="/navigator/units/:name_eng" element={<Unit />} />
            <Route path="*" element={<>404</>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
