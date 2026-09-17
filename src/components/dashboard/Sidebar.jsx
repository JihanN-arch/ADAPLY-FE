import { Link, NavLink, useLocation } from "react-router-dom";

const steps = [
  ["01", "Setup", "/dashboard/setup", "☷", null],
  ["02", "Monitor", "/dashboard/analyze", "⌁", "adaply.setupComplete"],
  ["03", "Actions", "/dashboard/action", "☑", "adaply.monitorComplete"],
];

function Sidebar() {
  const { pathname } = useLocation();
  const isSetup = pathname === "/dashboard/setup";
  return (
    <aside className="dashboard-sidebar">
      <Link className="sidebar-home" to="/" title="Back to home">
        <span className="sidebar-brand">Adaply</span>
        <span className="sidebar-tagline">Forecast early &amp; Adapt faster</span>
      </Link>
      <nav className="workflow-nav" aria-label="Forecast workflow">
        {steps.map(([number, label, path, icon, requirement]) => {
          const locked = requirement && (isSetup || sessionStorage.getItem(requirement) !== "true");
          const content = <><span className="workflow-icon" aria-hidden="true">{locked ? "▣" : icon}</span><span className="workflow-number">{number}</span><span>{label}</span></>;
          return locked
            ? <span className="workflow-link disabled" aria-disabled="true" title={`Complete ${number === "02" ? "Setup" : "Monitor"} first`} key={path}>{content}</span>
            : <NavLink className={({ isActive }) => `workflow-link${isActive ? " active" : ""}`} to={path} key={path}>{content}</NavLink>;
        })}
      </nav>
      <Link className="back-home-link" to="/">← Back to Home</Link>
      <div className="sidebar-meta">
        <span>Dataset</span><strong>REES46</strong><span>Oct 2019–Feb 2020</span>
      </div>
    </aside>
  );
}

export default Sidebar;
