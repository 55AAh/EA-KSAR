import "bootstrap/dist/css/bootstrap.min.css";

import Index from "./Index";
import UnitSelector from "./UnitSelector";
import Navbar from "./Navbar";
import Navigator from "./Navigator";
import SearchObjectTypeSelector from "./search/SearchObjectTypeSelector";
import PlantSearch from "./search/PlantSearch";
import UnitSearch from "./search/UnitSearch";
import DocumentsSearch from "./document/DocumentsSearch";
import Document from "./document/Document";
import DocumentUpload from "./document/DocumentUpload";
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
            <Route
              path="/navigator/search"
              element={<SearchObjectTypeSelector />}
            />{" "}
            <Route path="/navigator/search/plants" element={<PlantSearch />} />{" "}
            <Route path="/navigator/search/units" element={<UnitSearch />} />{" "}
            <Route path="/documents" element={<DocumentsSearch />} />
            <Route path="/documents/upload" element={<DocumentUpload />} />
            <Route path="/documents/:id" element={<Document />} />
            <Route path="/navigator/units" element={<UnitSelector />} />
            <Route path="/navigator/units/:name_eng" element={<Unit />} />
            <Route path="*" element={<>404</>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
