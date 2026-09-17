import Sidebar from "../dashboard/Sidebar";
import DashboardHeader from "./DashboardHeader";

function MainLayout({ children, footer }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-body">
        <DashboardHeader />
        <main className="dashboard-main">{children}</main>
        {footer && <footer className="dashboard-footer">{footer}</footer>}
      </div>
    </div>
  );
}

export default MainLayout;
