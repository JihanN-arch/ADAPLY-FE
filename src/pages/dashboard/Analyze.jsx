import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { api, demoAnalogs, demoForecast, demoProducts } from "../../services/api";

const number = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value ?? 0);
const rate = (value) => Number(value ?? 0) * (Number(value ?? 0) <= 1 ? 100 : 1);

function Analyze() {
  const { state } = useLocation();
  const product = state?.product || demoProducts[0];
  const dayCutoff = 3;
  const [initial, setInitial] = useState(state?.initial || null);
  const [adaptive, setAdaptive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      initial ? Promise.resolve(initial) : api.initialForecast(product.id),
      api.adaptiveForecast(product.id, dayCutoff),
    ]).then(([initialResult, adaptiveResult]) => {
      if (!active) return;
      setInitial(initialResult);
      setAdaptive(adaptiveResult);
    }).catch(() => {}).finally(() => {
      if (!active) return;
      sessionStorage.setItem("adaply.monitorComplete", "true");
      setLoading(false);
    });
    return () => { active = false; };
  }, [product.id, dayCutoff, initial]);

  const initial14 = adaptive?.original_forecast?.forecast_14d ?? initial?.forecast?.forecast_14d ?? demoForecast.initial14;
  const adaptive14 = adaptive?.adaptive_forecast?.forecast_14d ?? demoForecast.adaptive14;
  const change14 = adaptive?.percent_change_14d ?? demoForecast.change;
  const early = adaptive?.early_metric || { purchase_events: demoForecast.actual3, ...demoForecast.early, purchase_velocity: demoForecast.actual3 / 3, removal_pressure: 0 };
  const analogs = initial?.analogs?.map(({ analog, ...item }) => ({ ...analog, ...item })) || demoAnalogs;
  const nextState = { ...state, product, initial, adaptive };
  const footer = <><span>Forecasts use purchase events as a demand proxy, not sales units.</span><div><Link className="subtle-button" to="/dashboard/setup">Change SKU</Link>{loading ? <button className="dashboard-primary" disabled>Preparing Actions…</button> : <Link className="dashboard-primary" to="/dashboard/action" state={nextState}>View Recommended Actions →</Link>}</div></>;

  if (sessionStorage.getItem("adaply.setupComplete") !== "true") return <Navigate to="/dashboard/setup" replace />;

  return (
    <MainLayout footer={footer}>
      <section className="product-context panel">
        <Link to="/dashboard/setup">← Launch Setup</Link>
        <div><strong>{product.display_alias} <span>/ SKU {product.sku_id}</span></strong><small>{product.brand} · {product.category_label || "Beauty Category"} {product.category_cluster_id} · Observed launch proxy: {product.observed_launch_date}</small></div>
        <Link className="subtle-button" to="/dashboard/setup">Change SKU</Link>
      </section>

      <section className="monitor-alert">
        <span className="round-arrow">↑</span>
        <div><span><em>↑ ABOVE EXPECTATION</em> Signals through Day {dayCutoff}</span><strong>{loading ? "Refreshing demand signals…" : "Early purchase activity is stronger than comparable launches."}</strong><p>The 14-day forecast changed from {number(initial14)} to {number(adaptive14)} purchase events ({number(change14)}%).</p></div>
        <a href="#turning-point">See forecast ↓</a>
      </section>

      <section>
        <div className="panel-heading"><div><h2>Product analogs</h2><p>Comparable past launches used for the analog baseline</p></div><span>{analogs.length} reliable analog{analogs.length === 1 ? "" : "s"} found</span></div>
        <div className="analog-grid">{analogs.slice(0, 3).map((analog, index) => <article className="panel analog-card" key={analog.sku_id || index}><div><strong>Analog {index + 1}</strong><b>{number(analog.similarity_score)}</b></div><span>SKU {analog.sku_id} · {analog.brand} · Category {analog.category_cluster_id || "—"}</span><div className="reason-row">{analog.similarity_reasons.map((reason) => <em key={reason}>{reason}</em>)}</div><hr /><small>Actual · 14 days</small><strong>{number(analog.actual_purchase_events_14d)}</strong><span>purchase events</span></article>)}</div>
      </section>

      <section className="turning-point-grid" id="turning-point">
        <div className="turning-copy"><h2>The Turning Point</h2><p>Where early signals meet the initial forecast</p></div>
        <article className="panel metric-card initial-metric"><span>Initial Forecast · 14 days <em>DERIVED</em></span><strong>{number(initial14)}</strong><p>purchase events · Before early signals</p></article>
        <section className="panel turning-performance"><div className="panel-heading"><div><h2>Day 1–{dayCutoff} performance</h2><p>Cumulative customer response</p></div><em>DATASET</em></div>{[["Unique viewers", early.unique_viewers, 100], ["Unique cart users", early.unique_cart_users, rate(early.view_to_cart_rate)], ["Unique purchasers", early.unique_purchasers, rate(early.view_to_purchase_rate)]].map(([label, value, width]) => <div className="performance-row" key={label}><span>{label}<strong>{number(value)} · {number(width)}%</strong></span><div><i style={{ width: `${Math.min(width, 100)}%` }} /></div></div>)}<div className="rate-row"><span>View → cart<strong>{number(rate(early.view_to_cart_rate))}%</strong></span><span>Cart → purchase<strong>{number(rate(early.cart_to_purchase_rate))}%</strong></span><span>Removal pressure<strong>{number(rate(early.removal_pressure))}%</strong></span></div></section>
        <article className="panel metric-card actual-metric"><span>Actual · Day 1–{dayCutoff} <em>DERIVED</em></span><strong>{number(early.purchase_events)}</strong><p>cumulative purchase events · Demand proxy</p></article>
        <article className="panel metric-card adaptive-metric"><span>Adaptive Forecast · 14 days <em>DERIVED</em></span><strong>{number(adaptive14)}</strong><p>purchase events · Using Day 1–{dayCutoff} signals</p></article>
      </section>

      <section className="panel forecast-panel"><div className="panel-heading"><div><h2>Forecast comparison</h2><p>Cumulative purchase events, launch day 1–14</p></div><div className="chart-legend"><span>● Actual</span><span>┈ Analog baseline</span><span>━ Adaptive forecast</span></div></div><div className="forecast-chart"><div className="chart-y">{[5000, 4000, 3000, 2000, 1000, 0].map((value) => <span key={value}>{number(value)}</span>)}</div><div className="chart-plot"><svg viewBox="0 0 700 280" role="img" aria-label={`Forecast from ${early.purchase_events} through day ${dayCutoff} to ${adaptive14} by day 14`}><rect x="135" y="12" width="545" height="240" fill="#f4f5f6"/><text x="146" y="28" fill="#879197" fontSize="11">Forecast period (not actual)</text><g stroke="#dde3e6" strokeWidth="1">{[12,60,108,156,204,252].map((y) => <line x1="0" x2="680" y1={y} y2={y} key={y}/>)}</g><polyline points="0,238 65,220 130,200" fill="none" stroke="#e86a92" strokeWidth="4"/><polyline points="130,200 680,120" fill="none" stroke="#8fa0a8" strokeWidth="2" strokeDasharray="8 7"/><polyline points="130,200 680,24" fill="none" stroke="#233d4d" strokeWidth="4"/><circle cx="130" cy="200" r="6" fill="#e86a92"/><circle cx="680" cy="24" r="6" fill="#233d4d"/><text x="104" y="185" fill="#b8356a" fontSize="14">{number(early.purchase_events)}</text><text x="630" y="18" fill="#233d4d" fontSize="14">{number(adaptive14)}</text><text x="642" y="115" fill="#53616a" fontSize="14">{number(initial14)}</text></svg><div className="chart-x">{Array.from({ length: 14 }, (_, index) => <span key={index}>{index + 1}</span>)}</div><small>Launch day</small></div></div></section>
    </MainLayout>
  );
}

export default Analyze;
