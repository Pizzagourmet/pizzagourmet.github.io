// ===== 23 nov 2026: envío AUTOMÁTICO de la tarjeta regalo al cliente (plantilla tarjeta_regalo_navidad) =====
const TR_TPL = { name: "tarjeta_regalo_navidad", lang: "es" };
const TR_SEDE = { 1: "Nuestro Urabá", 2: "Nuestro Montería", 5: "Ortíz", 8: "Turbo" };
function trH(env) { return { "content-type": "application/json", "X-API-Key": env.YCLOUD_API_KEY }; }
async function trCrearPlantilla(env) {
  const waba = await env.EQ.get("plantilla2:waba");
  if (!waba) return { error: "sin waba" };
  const ejemplo = await guardarImgTarjeta(env, await pngTarjetaRegalo(env, { nombre: "Sandra Perdomo", codigo: "OR48213", saldo: "$ 31.900", vence: "31-03-2027", bebida: "Gaseosa personal 400 ml" }), "EJEMPLO");
  const body = { wabaId: waba, name: TR_TPL.name, language: TR_TPL.lang, category: "UTILITY", components: [
    { type: "HEADER", format: "IMAGE", example: { header_url: [ejemplo] } },
    { type: "BODY", text: "¡Hola {{1}}! 🎁 Aquí está tu Tarjeta Regalo de Pizza Gourmet por {{2}}, código {{3}}. Se usa en la sede {{4}} hasta el {{5}}. Guárdala o reenvíala a quien se la vas a regalar. ¡Feliz Navidad! 🎄", example: { body_text: [["Sandra", "$ 31.900", "OR48213", "Ortíz", "31-03-2027"]] } },
    { type: "FOOTER", text: "Pizza Gourmet · Crea la pizza de tus sueños" }
  ] };
  const r = await fetch("https://api.ycloud.com/v2/whatsapp/templates", { method: "POST", headers: trH(env), body: JSON.stringify(body) });
  const t = await r.text();
  await env.EQ.put("tr:tpl:creada", JSON.stringify({ st: r.status, t: t.slice(0, 1500), at: Date.now() }));
  return { status: r.status, resp: t.slice(0, 800) };
}
async function trEstadoPlantilla(env, forzar) {
  const c = await env.EQ.get("tr:tpl:estado");
  if (c === "APPROVED" && !forzar) return c;
  const ult = Number(await env.EQ.get("tr:tpl:chk")) || 0;
  if (!forzar && Date.now() - ult < 10 * 60e3) return c || "PENDING";
  await env.EQ.put("tr:tpl:chk", String(Date.now()));
  const waba = await env.EQ.get("plantilla2:waba");
  const g = await (await fetch("https://api.ycloud.com/v2/whatsapp/templates/" + waba + "/" + TR_TPL.name + "/" + TR_TPL.lang, { headers: trH(env) })).json().catch(() => ({}));
  const st = g.status || "DESCONOCIDO";
  await env.EQ.put("tr:tpl:estado", st);
  if (st === "APPROVED" && c !== "APPROVED") { try { await enviar(env, "573215702819", "✅ Jefe Aníbal, Meta aprobó la plantilla de la Tarjeta Regalo de Navidad: desde ya, cada tarjeta que se venda en la caja le llega sola al WhatsApp del cliente. 🎄"); } catch (e) { } }
  return st;
}
async function trEnviarAlCliente(env, card) {
  let partner = card.partner_id, cel = "";
  if (!partner && card.source_pos_order_id) {
    const o = await odoo(env, "pos.order", "read", [[card.source_pos_order_id[0]], ["partner_id"]]);
    partner = o?.[0]?.partner_id || false;
  }
  if (partner) {
    const p = await odoo(env, "res.partner", "read", [[partner[0]], ["name", "mobile", "phone"]]);
    cel = String(p?.[0]?.mobile || p?.[0]?.phone || "").replace(/\D/g, "").slice(-10);
  }
  if (cel.length !== 10 || cel[0] !== "3") return { ok: false, motivo: "sin celular" };
  const d = await datosTarjetaRegalo(env, card.code);
  const png = await pngTarjetaRegalo(env, d);
  const link = await guardarImgTarjeta(env, png, d.codigo);
  const nombre = String(partner?.[1] || "").trim().split(/\s+/)[0] || "";
  const nom = nombre ? nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase() : "";
  const msg = { from: NUMERO_BOT, to: "+57" + cel, type: "template", template: { name: TR_TPL.name, language: { code: TR_TPL.lang }, components: [
    { type: "header", parameters: [{ type: "image", image: { link } }] },
    { type: "body", parameters: [nom || "👋", d.saldo, d.codigo, TR_SEDE[d.company] || "Pizza Gourmet", d.vence].map(x => ({ type: "text", text: String(x) })) }
  ] } };
  const r = await fetch("https://api.ycloud.com/v2/whatsapp/messages/sendDirectly", { method: "POST", headers: trH(env), body: JSON.stringify(msg) });
  return { ok: r.ok, st: r.status, cel, t: r.ok ? "" : (await r.text()).slice(0, 300) };
}
async function tarjetasNuevasAuto(env) {
  const st = await trEstadoPlantilla(env, false);
  if (st !== "APPROVED") return;
  const desde = (await env.EQ.get("tr:auto:desde")) || new Date(Date.now() - 15 * 60e3).toISOString().slice(0, 19).replace("T", " ");
  const ahora = new Date(Date.now() - 60e3).toISOString().slice(0, 19).replace("T", " ");
  const cards = await odoo(env, "loyalty.card", "search_read", [[["program_id.program_type", "=", "gift_card"], ["create_date", ">=", desde], ["source_pos_order_id", "!=", false]]], { fields: ["id", "code", "partner_id", "source_pos_order_id", "create_date"], limit: 40, order: "id asc", context: { active_test: false } });
  for (const c of cards) {
    const k = "tr:env:" + c.id;
    if (await env.EQ.get(k)) continue;
    let res; try { res = await trEnviarAlCliente(env, c); } catch (e) { res = { ok: false, error: String(e?.message || e).slice(0, 200) }; }
    await env.EQ.put(k, JSON.stringify({ ...res, code: c.code, at: Date.now() }), { expirationTtl: 120 * 86400 });
  }
  await env.EQ.put("tr:auto:desde", ahora);
}
