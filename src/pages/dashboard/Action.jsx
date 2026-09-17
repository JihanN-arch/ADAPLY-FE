import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { api, demoProducts, demoRecommendation } from "../../services/api";

const number = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value ?? 0);
const label = (value) => String(value || "").replaceAll("_", " ");

function Action() {
  const { state } = useLocation();
  const product = state?.product || demoProducts[0];
  const assumptions = state?.assumptions || { inventory: 3000, capacity: 5000, leadTime: 7 };
  const [result, setResult] = useState(demoRecommendation);
  const [adaptiveResult, setAdaptiveResult] = useState(state?.adaptive || null);
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState("");
  const [modal, setModal] = useState(null);
  const [modifiedAmount, setModifiedAmount] = useState(null);
  const [modification, setModification] = useState({ amount: "", reason: "Capacity constraint", note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.recommendation(product.id, 3), api.adaptiveForecast(product.id, 3)])
      .then(([recommendationResult, forecastResult]) => { setResult(recommendationResult); setAdaptiveResult(forecastResult); })
      .catch(() => {});
  }, [product.id]);

  const recommendation = result.data_backed_result;
  const simulation = result.simulation || {};
  const adaptive14 = adaptiveResult?.adaptive_forecast?.forecast_14d ?? simulation.unit_equivalent_forecast_14d ?? 4900;
  const initial14 = adaptiveResult?.original_forecast?.forecast_14d ?? 2700;
  const change = adaptiveResult?.percent_change_14d ?? ((adaptive14 - initial14) / Math.max(initial14, 1)) * 100;
  const inventory = simulation.current_inventory ?? assumptions.inventory;
  const replenishment = simulation.suggested_replenishment_units ?? 0;
  const displayedReplenishment = modifiedAmount ?? replenishment;
  const nextBatch = simulation.suggested_next_batch_units ?? assumptions.capacity;
  const gap = inventory - (simulation.unit_equivalent_forecast_14d ?? adaptive14);
  const evidence = recommendation.evidence?.length ? recommendation.evidence : ["Adaptive demand proxy exceeds the current inventory assumption."];

  async function record(action, reason = note) {
    setSaving(true);
    try { await api.decision(recommendation.id, action, reason); } catch { /* demo remains usable offline */ }
    setDecision(action);
    setModal(null);
    setSaving(false);
  }

  function openModify() {
    setModification({ amount: String(displayedReplenishment), reason: "Capacity constraint", note: note });
    setModal("modify");
  }

  async function saveModification() {
    const amount = Math.max(0, Number(modification.amount) || 0);
    setModifiedAmount(amount);
    await record("modify", [modification.reason, modification.note].filter(Boolean).join(": "));
  }

  if (sessionStorage.getItem("adaply.monitorComplete") !== "true") {
    return <Navigate to={sessionStorage.getItem("adaply.setupComplete") === "true" ? "/dashboard/analyze" : "/dashboard/setup"} replace />;
  }

  return (
    <MainLayout>
      <div className="action-heading"><div><h1>Action Center · {product.display_alias}</h1><p>SKU {product.sku_id} <em>↑ {label(recommendation.status_code)}</em> Updated forecast <strong>{number(adaptive14)}</strong> purchase events / 14 days <b>+{number(change)}% vs initial forecast</b></p></div><Link className="subtle-button" to="/dashboard/analyze" state={{ ...state, adaptive: adaptiveResult }}>← Review forecast</Link></div>
      <div className="recommendation-grid">
        <article className="panel recommendation-panel"><div className="recommendation-type"><span>▣ Retailer recommendation</span><em>REQUIRES APPROVAL</em></div><h2>{label(recommendation.retailer_action)}</h2><p>Suggested adjustment: <strong>+{number(displayedReplenishment)} unit-equivalent</strong> <i>SIMULATION</i></p><span className="review-chip">◷ Review within 24 hours</span><hr /><strong>Why</strong><ul>{evidence.map((item) => <li key={item}>{item}</li>)}</ul><div className="facts"><span>Current inventory<strong>{number(inventory)} unit-equivalent</strong></span><span>Reorder lead time<strong>{assumptions.leadTime} days</strong></span></div></article>
        <article className="panel recommendation-panel"><div className="recommendation-type"><span>⚑ Manufacturer recommendation</span><em className="neutral">AGGREGATED SIGNALS ONLY</em></div><h2>{label(recommendation.manufacturer_action)}</h2><p>Suggested next batch: <strong>{number(nextBatch)} unit-equivalent</strong> <i>SIMULATION</i></p><span className="reason-chip">✦ Based on adaptive 14-day forecast</span><hr /><strong>Why</strong><ul>{evidence.map((item) => <li key={item}>{item}</li>)}</ul><div className="privacy-note">♧ Manufacturers receive aggregated forecast, status and recommendation only. No raw customer events are shared.</div></article>
      </div>
      <section className="simulation-panel"><div className="panel-title-row"><h2>Decision Simulation</h2><em className="simulation-label">♙ SIMULATION</em><span>• How is the gap calculated?</span></div><div className="simulation-grid"><div><span>Adaptive forecast · 14 days</span><strong>{number(adaptive14)}</strong><small>purchase events · Derived</small></div><div><span>Current inventory</span><strong>{number(inventory)}</strong><small>unit-equivalent · Simulation</small></div><div><span>Reorder lead time</span><strong>{assumptions.leadTime}</strong><small>days · Simulation</small></div><div className="gap-card"><span>Projected gap</span><strong>{gap > 0 ? "+" : ""}{number(gap)}</strong><small>unit-equivalent {gap < 0 ? "shortfall" : "remaining"}</small></div></div><p>ⓘ <strong>Demo assumption:</strong> {result.disclaimer || "1 purchase event = 1 unit-equivalent. Validate with production data."}</p></section>
      <section className="panel decision-panel"><h2>Your decision</h2><p>Nothing is executed automatically. No purchase or production order will be created.</p>{decision ? <div className={`decision-recorded ${decision}`}><span>{decision === "reject" ? "×" : "✓"}</span><div><strong>Decision recorded for demo</strong><p>{{ approve: "Approved", modify: "Modified", reject: "Rejected" }[decision]} by Demand Planner · just now</p><small>{decision === "modify" ? `Adjustment updated to +${number(displayedReplenishment)} unit-equivalent.` : "No operational order was created."}</small></div><button className="subtle-button" onClick={() => setDecision(null)}>Reset demo</button></div> : <><label className="decision-note">Decision note <small>(optional)</small><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add context for approvers" /></label><div className="decision-buttons"><div><button disabled={saving} onClick={() => setModal("reject")}>Reject</button><button disabled={saving} onClick={openModify}>Modify</button></div><button className="decision-approve" disabled={saving} onClick={() => record("approve")}>Approve recommendation</button></div></>}</section>
      <p className="action-disclaimer">Adaply provides decision support. Recommendations use purchase-event demand proxies and simulation assumptions. Validate against real inventory, order quantity, lead time, and production constraints before execution.</p>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className={`decision-modal ${modal}`} role="dialog" aria-modal="true" aria-labelledby="decision-modal-title">{modal === "modify" ? <><h2 id="decision-modal-title">Modify recommendation</h2><div className="current-suggestion"><span>Current suggestion</span><strong>{label(recommendation.retailer_action)} · +{number(displayedReplenishment)} unit-equivalent</strong></div><label>Adjustment amount<div className="amount-field"><input type="number" min="0" value={modification.amount} onChange={(event) => setModification({ ...modification, amount: event.target.value })} /><span>unit-equivalent</span></div></label><label>Reason<select value={modification.reason} onChange={(event) => setModification({ ...modification, reason: event.target.value })}><option>Capacity constraint</option><option>Inventory limit</option><option>Lead time constraint</option><option>Campaign plan</option><option>Other</option></select></label><label>Note <small>(optional)</small><textarea value={modification.note} onChange={(event) => setModification({ ...modification, note: event.target.value })} /></label><div className="modal-actions"><button className="subtle-button" onClick={() => setModal(null)}>Cancel</button><button className="dashboard-primary" disabled={saving} onClick={saveModification}>Save Modification</button></div></> : <><h2 id="decision-modal-title">Reject this recommendation?</h2><p>No purchase or production order will be created.</p><div className="modal-actions"><button className="subtle-button" onClick={() => setModal(null)}>Cancel</button><button className="reject-confirm" disabled={saving} onClick={() => record("reject")}>Reject</button></div></>}</section></div>}
    </MainLayout>
  );
}

export default Action;
