import { Link } from "react-router-dom";

function NavBar() {
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="Adaply home">
          Adaply
        </Link>
        <div className="nav-actions">
          <span className="dataset-badge">
            <span aria-hidden="true" /> Demo dataset
          </span>
          <Link className="button button-dark button-small" to="/dashboard/setup">
            Open dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
