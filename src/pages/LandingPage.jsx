import { Link } from "react-router-dom";
import NavBar from "../components/common/NavBar";
import arrowIcon from "../assets/figma/icon-01.svg";
import datasetIcon from "../assets/figma/icon-02.svg";
import upIcon from "../assets/figma/icon-03.svg";
import setupIcon from "../assets/figma/icon-10.svg";
import monitorIcon from "../assets/figma/icon-11.svg";
import factoryIcon from "../assets/figma/icon-12.svg";
import eyeIcon from "../assets/figma/icon-13.svg";
import storeIcon from "../assets/figma/icon-15.svg";
import actionsIcon from "../assets/figma/icon-16.svg";

const problems = [
  {
    icon: storeIcon,
    title: "Retailers overstock or replenish late",
    copy: "Without early demand evidence, teams either carry too much inventory or miss the moment to restock.",
  },
  {
    icon: factoryIcon,
    title: "Manufacturers produce too much or too late",
    copy: "Production plans are difficult to adjust when a new launch has no sales history to learn from.",
  },
  {
    icon: eyeIcon,
    title: "Attention gets mistaken for demand",
    copy: "High views can look promising, but carts and purchases reveal whether attention is converting.",
  },
];

const steps = [
  {
    number: "01",
    icon: setupIcon,
    title: "Setup",
    copy: "Import the launch dataset, choose a candidate SKU, and add inventory, lead time, capacity, and campaign context.",
  },
  {
    number: "02",
    icon: monitorIcon,
    title: "Monitor",
    copy: "Compare the initial forecast from similar historical products with an adaptive forecast using Day 1–3 signals.",
  },
  {
    number: "03",
    icon: actionsIcon,
    title: "Actions",
    copy: "Review separate retailer and manufacturer recommendations, then approve, modify, or reject the next move.",
  },
];

const statuses = [
  ["status-green", "↑", "ABOVE EXPECTATION", "Demand is moving faster than the original launch plan."],
  ["status-blue", "—", "ON TRACK", "Early behaviour remains within the expected range."],
  ["status-gold", "!", "HIGH INTEREST, LOW CONVERSION", "Attention is strong, but purchases are not following yet."],
  ["status-red", "↓", "BELOW EXPECTATION", "Demand is trailing the original plan and needs review."],
];

function ForecastPreview() {
  return (
    <div className="preview-frame" aria-label="Forecast monitor preview">
      <div className="preview-card">
        <div className="preview-heading">
          <div>
            <strong>New Beauty SKU A</strong>
            <span>Forecast Monitor · Day 3</span>
          </div>
          <span className="preview-pill">DEMO</span>
        </div>

        <div className="alert-card">
          <span className="alert-icon"><img src={upIcon} alt="" /></span>
          <div>
            <strong>Above expectation</strong>
            <span>Demand is accelerating beyond the initial forecast.</span>
          </div>
        </div>

        <div className="preview-metrics">
          <div><span>Initial · 14d</span><strong>2,700</strong></div>
          <div><span>Adaptive · 14d</span><strong>4,900</strong></div>
          <div><span>Change</span><strong className="positive">+81.5%</strong></div>
        </div>

        <div className="mini-chart" aria-label="Initial and adaptive 14-day forecast comparison">
          <div className="chart-labels"><span>5K</span><span>2.5K</span><span>0</span></div>
          <div className="chart-canvas">
            <svg className="mini-chart-svg" viewBox="0 0 760 190" role="img" aria-label="Actual demand through Day 3, initial forecast to 2,700, and adaptive forecast to 4,900">
              <rect x="140" width="620" height="180" fill="#f5f6f7" />
              <line x1="0" y1="180" x2="760" y2="180" stroke="#d8dde0" />
              <polyline points="0,170 70,151 140,134 760,78" fill="none" stroke="#929ba0" strokeWidth="4" strokeDasharray="13 10" />
              <polyline points="0,170 70,148 140,126" fill="none" stroke="#cf6b8a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="140,126 760,24" fill="none" stroke="#233d4d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="140" cy="126" r="5" fill="#cf6b8a" />
              <text x="151" y="153" fill="#8d4a67" fontSize="13">Day 3</text>
              <text x="718" y="18" fill="#233d4d" fontSize="14" fontWeight="700">4,900</text>
            </svg>
          </div>
        </div>

        <div className="recommendation-card">
          <div>
            <span>Retailer recommendation</span>
            <strong>Replenish +2,000 unit-equivalent</strong>
          </div>
          <span className="approval-badge">Requires approval</span>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="landing-page">
      <NavBar />

      <main>
        <section className="hero-section">
          <div className="hero-shell">
            <div className="hero-copy">
              <span className="eyebrow eyebrow-light">Early warning system for new launches</span>
              <h1>Know early if a new beauty product is ahead, on plan, or falling behind.</h1>
              <p>
                Adaply turns Day 1–3 views, carts, and purchases into an adaptive 14-day demand forecast—before an inventory miss becomes expensive.
              </p>
              <div className="hero-actions">
                <Link className="button button-rose" to="/dashboard/setup">
                  Start launch review <img src={arrowIcon} alt="" />
                </Link>
                <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
              </div>
              <div className="data-note">
                <img src={datasetIcon} alt="" />
                <span>Built on REES46 cosmetics e-commerce events · Oct 2019–Feb 2020</span>
              </div>
            </div>
            <ForecastPreview />
          </div>
        </section>

        <section className="section section-light">
          <div className="content-shell">
            <span className="section-kicker">The problem</span>
            <h2>Launch plans are set before any sales history exists.</h2>
            <div className="problem-grid">
              {problems.map((problem) => (
                <article className="problem-card" key={problem.title}>
                  <span className="icon-box"><img src={problem.icon} alt="" /></span>
                  <h3>{problem.title}</h3>
                  <p>{problem.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-dark" id="how-it-works">
          <div className="content-shell">
            <span className="section-kicker section-kicker-light">How it works</span>
            <h2>From product pick to reviewed decision in three steps.</h2>
            <div className="step-grid">
              {steps.map((step) => (
                <article className="step-card" key={step.number}>
                  <div className="step-top">
                    <span className="icon-box icon-box-dark"><img src={step.icon} alt="" /></span>
                    <span className="step-number">{step.number}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>

            <div className="status-section">
              <span className="section-kicker section-kicker-light">Demand status</span>
              <h2>Four clear signals instead of a wall of metrics.</h2>
              <div className="status-grid">
                {statuses.map(([className, symbol, title, copy]) => (
                  <article className={`status-card ${className}`} key={title}>
                    <span className="status-symbol">{symbol}</span>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="content-shell">
            <span className="section-kicker">One signal, two roles</span>
            <h2>Coordinated next steps for retailers and manufacturers.</h2>
            <Link className="button button-dark" to="/dashboard/setup">Open launch workspace <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
