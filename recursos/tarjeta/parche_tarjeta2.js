// Tarjeta regalo de Navidad Pizza Gourmet: arma el SVG (base + textos + código de barras Code128).
// Lo usa pizzerito-equipo (/tarjeta/img) y la prueba en Node.
const C128 = ["212222","222122","222221","121223","121322","131222","122213","122312","132212","221213","221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231","213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321","232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133","112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131","311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422","121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211","221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212","421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113","411311","113141","114131","311141","411131","211412","211214","211232","2331112"];
function code128B(txt) {
  const vals = [104];
  for (const ch of String(txt)) { const v = ch.charCodeAt(0) - 32; vals.push(v < 0 || v > 94 ? 0 : v); }
  let sum = 104; for (let i = 1; i < vals.length; i++) sum += vals[i] * i;
  vals.push(sum % 103); vals.push(106);
  return vals.map(v => C128[v]).join("");
}
function trEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
// x0,y0: esquina; w,h: tamaño del área del código
function barrasSVG(txt, x0, y0, w, h) {
  const pat = code128B(txt);
  const mods = [...pat].reduce((a, c) => a + Number(c), 0);
  const m = w / mods; let x = x0; let out = ""; let negro = true;
  for (const c of pat) { const ww = Number(c) * m; if (negro) out += `<rect x="${x.toFixed(2)}" y="${y0}" width="${ww.toFixed(2)}" height="${h}" fill="#111"/>`; x += ww; negro = !negro; }
  return out;
}
function svgTarjeta(baseHref, d) {
  // d: { nombre, codigo, saldo, vence, bebida, nota_bebida }
  const nom = trEsc(d.nombre || "Tu ser querido").slice(0, 34);
  const beb = d.bebida ? trEsc(d.bebida) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="941" height="1672" viewBox="0 0 941 1672">
<image href="${baseHref}" xlink:href="${baseHref}" x="0" y="0" width="941" height="1672"/>
<text x="474" y="1044" text-anchor="middle" font-family="Inter" font-weight="900" font-size="78" fill="#0f0f0f">${trEsc(d.saldo)}</text>
<text x="270" y="1126" font-family="Poppins" font-weight="700" font-size="31" fill="#141414">${nom}</text>
<text x="327" y="1226" text-anchor="middle" font-family="Inter" font-weight="800" font-size="42" fill="#0f0f0f">${trEsc(d.codigo)}</text>
<text x="668" y="1224" text-anchor="middle" font-family="Inter" font-weight="800" font-size="38" fill="#0f0f0f">${trEsc(d.vence)}</text>
${barrasSVG(d.codigo, 254, 1250, 440, 86)}
${beb ? `<text x="348" y="1497" font-family="Poppins" font-weight="700" font-size="34" fill="#ffffff">Bebida de regalo:</text>
<text x="348" y="1541" font-family="Poppins" font-weight="500" font-size="32" fill="#ffffff">${beb}</text>
<rect x="336" y="1558" width="455" height="44" rx="22" fill="#FFC20E"/>
<text x="563" y="1589" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="24" fill="#111">Se carga sola con tu tarjeta</text>`
  : `<text x="348" y="1520" font-family="Poppins" font-weight="700" font-size="34" fill="#ffffff">¡Feliz Navidad!</text>
<text x="348" y="1566" font-family="Poppins" font-weight="500" font-size="28" fill="#ffffff">Úsala en la sede que elegiste</text>`}
</svg>`;
}
// Bebida según el valor de la tarjeta de pizza (precios de carta, 3 ingredientes)
const BEBIDA_POR_VALOR = { 10900: "Gaseosa mini", 17900: "Gaseosa mini", 31900: "Gaseosa personal 400 ml", 39900: "Gaseosa personal 400 ml", 49900: "Gaseosa 600 ml", 55900: "Gaseosa 1,5 L", 80900: "Gaseosa 1,5 L" };
function trPesos(n) { return "$ " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
// ===== 23 nov 2026: TARJETA REGALO DE NAVIDAD — imagen (resvg) para mandar al cliente =====
let TR_INIT = null, TR_FONTS = null, TR_BASE = null;
function trBebidaPorNombre(n) {
  n = String(n || "").toUpperCase();
  if (!/TARJETA PIZZA/.test(n)) return "";
  if (/MICRO|MINI/.test(n)) return "Gaseosa mini";
  if (/JUNIOR|EST[AÁ]NDAR/.test(n)) return "Gaseosa personal 400 ml";
  if (/MEDIANA/.test(n)) return "Gaseosa 600 ml";
  if (/GRANDE|FAMILIAR/.test(n)) return "Gaseosa 1,5 L";
  return "";
}
async function datosTarjetaRegalo(env, codigo) {
  const c = String(codigo || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (c.length < 4) return null;
  const r = await odoo(env, "loyalty.card", "search_read", [[["code", "=ilike", c], ["program_id.program_type", "=", "gift_card"]]], { fields: ["id", "code", "points", "expiration_date", "company_id", "partner_id", "source_pos_order_id"], limit: 1, context: { active_test: false } });
  if (!r.length) return null;
  const k = r[0];
  let bebida = "";
  if (k.source_pos_order_id) {
    try {
      const ls = await odoo(env, "pos.order.line", "search_read", [[["order_id", "=", k.source_pos_order_id[0]]]], { fields: ["full_product_name"] });
      for (const l of ls) { bebida = trBebidaPorNombre(l.full_product_name); if (bebida) break; }
    } catch (e) { }
  }
  const v = k.expiration_date ? String(k.expiration_date).slice(0, 10).split("-").reverse().join("-") : "Sin vencimiento";
  return { id: k.id, codigo: k.code, puntos: k.points, saldo: trPesos(k.points), vence: v, bebida, company: k.company_id?.[0] || 0, cliente: k.partner_id || null };
}
async function pngTarjetaRegalo(env, d) {
  if (!TR_INIT) TR_INIT = resvgInit(RESVG_WASM);
  await TR_INIT;
  if (!TR_FONTS) {
    const ks = ["fonts/Inter-Black.otf", "fonts/Inter-ExtraBold.otf", "fonts/Poppins-Bold.ttf", "fonts/Poppins-Medium.ttf"];
    TR_FONTS = await Promise.all(ks.map(async k => new Uint8Array(await env.EQ.get("asset:" + k, "arrayBuffer"))));
  }
  if (!TR_BASE) { const b = new Uint8Array(await env.EQ.get("asset:base_navidad.jpg", "arrayBuffer")); TR_BASE = "data:image/jpeg;base64," + b64de(b); }
  const svg = svgTarjeta(TR_BASE, d);
  const r = new Resvg(svg, { font: { fontBuffers: TR_FONTS, loadSystemFonts: false, defaultFontFamily: "Poppins" } });
  return r.render().asPng();
}
async function tarjetaImgRoute(url, env) {
  const kk = await env.EQ.get("club:clave");
  if (!kk || url.searchParams.get("k") !== kk) return new Response("no autorizado", { status: 401 });
  try {
    const d = await datosTarjetaRegalo(env, url.searchParams.get("codigo"));
    if (!d) return new Response("tarjeta no encontrada", { status: 404 });
    if (url.searchParams.get("para")) d.nombre = String(url.searchParams.get("para")).slice(0, 34);
    if (url.searchParams.get("json")) return new Response(JSON.stringify(d), { headers: { "content-type": "application/json" } });
    const png = await pngTarjetaRegalo(env, d);
    return new Response(png, { headers: { "content-type": "image/png", "cache-control": "no-store" } });
  } catch (e) { return new Response("error " + String(e?.message || e).slice(0, 300), { status: 500 }); }
}
async function guardarImgTarjeta(env, png, codigo) {
  const tok = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join("");
  await env.EQ.put("arch:" + tok, png, { expirationTtl: 7 * 86400, metadata: { tipo: "image/png" } });
  return "https://pizzerito-equipo.soyanibaldiaz.workers.dev/arch/" + tok + "/tarjeta-" + codigo + ".png";
}
async function tarjetaRegaloTool(env, ctx, inp) {
  const d = await datosTarjetaRegalo(env, inp.codigo);
  if (!d) return { error: "No encontré una tarjeta regalo con ese código. Revisa el código del recibo." };
  if (inp.para) d.nombre = String(inp.para).slice(0, 34);
  const png = await pngTarjetaRegalo(env, d);
  const link = await guardarImgTarjeta(env, png, d.codigo);
  const res = await fetch("https://api.ycloud.com/v2/whatsapp/messages/sendDirectly", { method: "POST", headers: { "content-type": "application/json", "X-API-Key": env.YCLOUD_API_KEY }, body: JSON.stringify({ from: NUMERO_BOT, to: "+" + limpioNum(ctx.de), type: "image", image: { link } }) });
  if (!res.ok) return { error: "no pude mandar la imagen (" + res.status + ")" };
  await guardarChat(env, limpioNum(ctx.de), "b", "🖼️ tarjeta regalo " + d.codigo).catch(() => {});
  return { ok: true, codigo: d.codigo, saldo: d.saldo, bebida: d.bebida || "sin bebida (monto libre)", nota: "Ya le mandé la imagen; dile en una línea que se la reenvíe al cliente." };
}
