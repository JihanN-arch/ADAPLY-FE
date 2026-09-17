import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="workspace-placeholder">
      <div>
        <span className="section-kicker">404</span>
        <h1>Page not found.</h1>
        <Link className="button button-dark" to="/">Return home</Link>
      </div>
    </main>
  );
}

export default NotFound;
