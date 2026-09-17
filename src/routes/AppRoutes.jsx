import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Setup from "../pages/dashboard/Setup";
import Analyze from "../pages/dashboard/Analyze";
import Action from "../pages/dashboard/Action";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/setup" element={<Setup />} />
        <Route path="/dashboard/analyze" element={<Analyze />} />
        <Route path="/dashboard/action" element={<Action />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
