// ===== 23 nov 2026: COMISIONES de tarjetas regalo (5 %) y ranking de la campaña de Navidad =====
const TR_CAJERAS = ["michelle", "jessica", "paola", "eliana", "kenia", "lady", "manuel", "diana"];
function trNorm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim(); }
async function comisionesTarjetas(env, inp) {
  const desde = inp.desde || "2026-11-24", hasta = inp.hasta || "2026-12-31";
  const dUTC = desde + " 05:00:00", hUTC = new Date(new Date(hasta + "T05:00:00Z").getTime() + 86400e3).toISOString().slice(0, 19).replace("T", " ");
  const progs = await odoo(env, "loyalty.program", "search_read", [[["program_type", "=", "gift_card"]]], { fields: ["rule_ids"] });
  const rids = progs.flatMap(p => p.rule_ids);
  const rules = rids.length ? await odoo(env, "loyalty.rule", "read", [rids, ["product_ids"]]) : [];
  const prods = [...new Set(rules.flatMap(r => r.product_ids))];
  if (!prods.length) return { error: "no encontré los productos de tarjeta regalo" };
  const lines = await odoo(env, "pos.order.line", "search_read", [[["product_id", "in", prods], ["order_id.state", "in", ["paid", "done", "invoiced"]], ["order_id.date_order", ">=", dUTC], ["order_id.date_order", "<", hUTC]]], { fields: ["order_id", "price_subtotal_incl", "customer_note", "note"], limit: 2000 });
  if (!lines.length) return { ranking: [], nota: "Todavía no hay tarjetas regalo vendidas en la campaña (" + desde + " a " + hasta + ")." };
  const oids = [...new Set(lines.map(l => l.order_id[0]))];
  const ords = await odoo(env, "pos.order", "read", [oids, ["employee_id", "cashier", "note", "partner_id"]]);
  const om = Object.fromEntries(ords.map(o => [o.id, o]));
  const tot = {};
  for (const l of lines) {
    const o = om[l.order_id[0]] || {};
    const txt = [o.note, l.customer_note, l.note].filter(Boolean).join(" ");
    const m = trNorm(txt).match(/referencia\s*:?\s*([a-z]+)/);
    let quien = m && TR_CAJERAS.includes(m[1]) ? m[1] : trNorm((o.employee_id?.[1] || o.cashier || "").split(/\s+/)[0]);
    if (!quien) quien = "sin nombre";
    const t = tot[quien] || (tot[quien] = { nombre: quien.charAt(0).toUpperCase() + quien.slice(1), tarjetas: 0, ventas: 0 });
    t.tarjetas++; t.ventas += l.price_subtotal_incl;
  }
  const ranking = Object.values(tot).map(t => ({ ...t, comision: Math.round(t.ventas * 0.05) })).sort((a, b) => b.ventas - a.ventas).map((t, i) => ({ puesto: i + 1, ...t, ventas: trPesos(t.ventas), comision: trPesos(t.comision) }));
  return { periodo: desde + " a " + hasta, ranking, premios: "1.º $70.000 · 2.º $50.000 · 3.º $30.000 (hasta el 31 de diciembre, entre todas las sedes), además de la comisión del 5 %", nota: "A una cajera de sede muéstrale SU comisión y su puesto, y el top 3 (solo nombres y puesto, sin montos de otras). A la familia muéstrale todo." };
}
