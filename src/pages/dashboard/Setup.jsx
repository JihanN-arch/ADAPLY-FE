import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { api, demoProducts } from "../../services/api";

const formatDate = (value) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
const emptyFilters = { brand: "", category: "", price: "", month: "" };
const priceBand = (price) => Number(price) < 12 ? "Low" : Number(price) < 16 ? "Mid" : "High";
const matchesFilters = (product, filters) =>
  (!filters.brand || product.brand === filters.brand) &&
  (!filters.category || product.category_cluster_id === filters.category) &&
  (!filters.price || priceBand(product.representative_price) === filters.price) &&
  (!filters.month || product.observed_launch_date.startsWith(filters.month));

function Setup() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(demoProducts);
  const [filterOptions, setFilterOptions] = useState(null);
  const [selectedId, setSelectedId] = useState(String(demoProducts[0].id));
  const [filters, setFilters] = useState(emptyFilters);
  const [assumptions, setAssumptions] = useState({ inventory: 3000, capacity: 5000, leadTime: 7, campaign: "Unknown" });
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    sessionStorage.removeItem("adaply.setupComplete");
    sessionStorage.removeItem("adaply.monitorComplete");
    api.products().then((data) => {
      if (!data.length) return;
      setProducts(data);
      setSelectedId((current) => data.some((product) => String(product.id) === current) ? current : String(data[0].id));
    }).catch(() => {});
    api.filterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const filtered = useMemo(() => products.filter((product) => matchesFilters(product, filters)), [products, filters]);
  const selected = products.find((product) => String(product.id) === selectedId) || filtered[0] || products[0];
  const brands = filterOptions?.brands || [...new Set(products.map((product) => product.brand))];
  const categories = filterOptions?.category_cluster_ids || [...new Set(products.map((product) => product.category_cluster_id))];
  const months = filterOptions?.observed_launch_months || [...new Set(products.map((product) => product.observed_launch_date.slice(0, 7)))];

  function updateFilter(key, value) {
    const next = { ...filters, [key]: value };
    const nextProducts = products.filter((product) => matchesFilters(product, next));
    setFilters(next);
    if (!nextProducts.some((product) => String(product.id) === selectedId)) setSelectedId(nextProducts[0] ? String(nextProducts[0].id) : "");
  }

  function resetFilters() {
    setFilters(emptyFilters);
    if (!selectedId && products[0]) setSelectedId(String(products[0].id));
  }

  async function analyze() {
    setLoading(true);
    let initial = null;
    try { initial = await api.initialForecast(selected.id); } catch { /* demo fallback */ }
    sessionStorage.setItem("adaply.setupComplete", "true");
    sessionStorage.removeItem("adaply.monitorComplete");
    navigate("/dashboard/analyze", { state: { product: selected, assumptions, initial } });
  }

  async function upload(file) {
    if (!file) return;
    setFileName("Uploading…");
    try {
      const result = await api.uploadDataset(file);
      setFileName(result.original_filename);
    } catch {
      setFileName(file.name);
    }
  }

  return (
    <MainLayout>
      <div className="page-intro">
        <h1>Launch Setup</h1>
        <p>Select a candidate SKU and add planning assumptions before generating the launch forecast.</p>
      </div>
      <label className="import-button">
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => upload(event.target.files[0])} />
        {fileName || "Import Dataset (Excel Spreadsheet)"} <span>→</span>
      </label>
      <div className="setup-grid">
        <section className="panel candidate-panel">
          <div className="panel-title-row"><div><h2>Candidate Products</h2><span>Showing {filtered.length} of {products.length} candidate SKUs</span></div><button type="button" className="subtle-button" onClick={resetFilters}>Reset filters</button></div>
          <div className="filters-row">
            <label>Brand<select value={filters.brand} onChange={(event) => updateFilter("brand", event.target.value)}><option value="">All brands</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>
            <label>Category cluster<select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Price band<select value={filters.price} onChange={(event) => updateFilter("price", event.target.value)}><option value="">All</option><option>Low</option><option>Mid</option><option>High</option></select></label>
            <label>Observed launch<select value={filters.month} onChange={(event) => updateFilter("month", event.target.value)}><option value="">All months</option>{months.map((month) => <option value={month} key={month}>{month}</option>)}</select></label>
          </div>
          <div className="product-table">
            <div className="product-row product-head"><span /><span>Product</span><span>Brand</span><span>Category</span><span>Price band</span><span>Observed launch</span><span>Data quality</span></div>
            {filtered.map((product) => (
              <label className={`product-row${String(product.id) === selectedId ? " selected" : ""}`} key={product.id} onClick={() => setSelectedId(String(product.id))}>
                <input type="radio" name="product" checked={String(product.id) === selectedId} onChange={() => setSelectedId(String(product.id))} />
                <span><strong>{product.display_alias}</strong><small>SKU {product.sku_id}</small></span>
                <span>{product.brand}</span>
                <span>{product.category_label || "Beauty Category"}<small>{product.category_cluster_id}</small></span>
                <span>{priceBand(product.representative_price)}</span>
                <span>{formatDate(product.observed_launch_date)} <em className="source-label">{product.source_badges?.observed_launch_date?.includes("Proxy") ? "PROXY" : product.source_badges?.observed_launch_date || "PROXY"}</em></span>
                <span><em className={(product.data_quality || (product.display_alias.endsWith("C") ? "Limited data" : "Ready")).startsWith("Limited") ? "quality limited" : "quality"}>{product.data_quality || (product.display_alias.endsWith("C") ? "Limited data" : "Ready")}</em></span>
              </label>
            ))}
          </div>
        </section>

        <aside className="setup-side">
          <section className="panel assumptions-panel">
            <div className="panel-title-row"><h2>Planning Assumptions</h2><em className="simulation-label">♙ SIMULATION</em></div>
            <div className="two-fields">
              <label>Initial inventory<span><input type="number" value={assumptions.inventory} onChange={(e) => setAssumptions({ ...assumptions, inventory: Number(e.target.value) })} />unit-eq.</span></label>
              <label>Next-batch capacity<span><input type="number" value={assumptions.capacity} onChange={(e) => setAssumptions({ ...assumptions, capacity: Number(e.target.value) })} />unit-eq.</span></label>
            </div>
            <label>Reorder lead time<span className="full-field"><input type="number" value={assumptions.leadTime} onChange={(e) => setAssumptions({ ...assumptions, leadTime: Number(e.target.value) })} />days</span></label>
            <label>Campaign active<div className="segmented-control">{["Yes", "No", "Unknown"].map((value) => <button type="button" className={assumptions.campaign === value ? "active" : ""} onClick={() => setAssumptions({ ...assumptions, campaign: value })} key={value}>{value}</button>)}</div></label>
            <p className="helper-copy">These values are used only for decision simulation and do not affect model training.</p>
          </section>
          <button type="button" className="dashboard-primary analyze-button" onClick={analyze} disabled={loading || !selected}>{loading ? "Analyzing…" : "Analyze Launch"} →</button>
        </aside>
      </div>
    </MainLayout>
  );
}

export default Setup;
