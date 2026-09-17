const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://hackathonui26be-production.up.railway.app/api").replace(/\/$/, "");

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.detail || "Unable to reach the API.");
  return body;
}

export const api = {
  products: () => request("/products"),
  filterOptions: () => request("/products/filter-options"),
  initialForecast: (productId) => request("/forecast/initial", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  }),
  adaptiveForecast: (productId, dayCutoff = 3) => request("/forecast/adaptive", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, day_cutoff: dayCutoff }),
  }),
  recommendation: (productId, dayCutoff = 3) => request("/recommendation", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, day_cutoff: dayCutoff }),
  }),
  uploadDataset: (file) => {
    const body = new FormData();
    body.append("file", file);
    body.append("uploaded_by", "Demand Planner");
    return request("/datasets/upload", { method: "POST", body, headers: {} });
  },
  decision: (recommendation, action, reason = "") => request("/decisions", {
    method: "POST",
    body: JSON.stringify({ recommendation, action, reason, decided_by: "Demand Planner" }),
  }),
};

export const demoProducts = [
  { id: 1, sku_id: "5917178", display_alias: "New Beauty SKU A", brand: "Unknown Brand", category_cluster_id: "1487580013950664926", category_label: null, representative_price: "16.35", observed_launch_date: "2019-12-30", eligibility: "eligible", data_quality: "Ready" },
  { id: 3, sku_id: "5917130", display_alias: "New Beauty SKU B", brand: "f.o.x", category_cluster_id: "1487580005008409427", category_label: null, representative_price: "4.52", observed_launch_date: "2020-01-20", eligibility: "eligible", data_quality: "Ready" },
  { id: 7, sku_id: "5915036", display_alias: "New Beauty SKU C", brand: "Unknown Brand", category_cluster_id: "1487580006317032337", category_label: null, representative_price: "28.57", observed_launch_date: "2019-12-19", eligibility: "eligible", data_quality: "Limited data" },
];

export const demoAnalogs = [
  { sku_id: "4791021", brand: "uno", similarity_score: 0.93, similarity_reasons: ["Same category", "Similar price"], actual_purchase_events_14d: 2350 },
  { sku_id: "4817330", brand: "runail", similarity_score: 0.86, similarity_reasons: ["Same category", "Same brand"], actual_purchase_events_14d: 2810 },
  { sku_id: "5060429", brand: "f.o.x", similarity_score: 0.79, similarity_reasons: ["Similar price", "Same category"], actual_purchase_events_14d: 2940 },
];

export const demoForecast = {
  initial14: 2700,
  adaptive14: 4900,
  change: 81.5,
  actual3: 1100,
  early: { unique_viewers: 12500, unique_cart_users: 2450, unique_purchasers: 760, view_to_cart_rate: 19.6, cart_to_purchase_rate: 31.0, view_to_purchase_rate: 6.1 },
};

export const demoRecommendation = {
  data_backed_result: { id: 3, status_code: "ABOVE_EXPECTATION", retailer_action: "REPLENISH", manufacturer_action: "SCALE_PRODUCTION" },
  simulation: { suggested_replenishment_units: 2000, suggested_next_batch_units: 5000 },
};
