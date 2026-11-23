// ===== 23 nov 2026: la tarjeta regalo sale del WhatsApp de CADA SEDE (decisión de Aníbal) =====
const TR_SEDE_WA = { 1: { tel: "+573134897100", waba: "512308998626207" }, 2: { tel: "+573147273717", waba: "849790602197825" }, 5: { tel: "+573226692181", waba: "474989772360325" }, 8: { tel: "+573228692857", waba: "1231108375650971" } };
async function trCrearPlantillasSedes(env) {
  const ejemplo = await guardarImgTarjeta(env, await pngTarjetaRegalo(env, { nombre: "Sandra Perdomo", codigo: "OR48213", saldo: "$ 31.900", vence: "31-03-2027", bebida: "Gaseosa personal 400 ml" }), "EJEMPLO");
  const out = {};
  for (const [comp, s] of Object.entries(TR_SEDE_WA)) {
    const body = { wabaId: s.waba, name: TR_TPL.name, language: TR_TPL.lang, category: "UTILITY", components: [
      { type: "HEADER", format: "IMAGE", example: { header_url: [ejemplo] } },
      { type: "BODY", text: "¡Hola {{1}}! 🎁 Aquí está tu Tarjeta Regalo de Pizza Gourmet por {{2}}, código {{3}}. Se usa en la sede {{4}} hasta el {{5}}. Guárdala o reenvíala a quien se la vas a regalar. ¡Feliz Navidad! 🎄", example: { body_text: [["Sandra", "$ 31.900", "OR48213", "Ortíz", "31-03-2027"]] } },
      { type: "FOOTER", text: "Pizza Gourmet · Crea la pizza de tus sueños" }
    ] };
    const r = await fetch("https://api.ycloud.com/v2/whatsapp/templates", { method: "POST", headers: trH(env), body: JSON.stringify(body) });
    const t = await r.text(); out[comp] = { st: r.status, t: t.slice(0, 200) };
  }
  await env.EQ.put("tr:tpl:sedes:creada", JSON.stringify(out));
  return out;
}
async function trEstadoSede(env, comp, forzar) {
  const s = TR_SEDE_WA[comp]; if (!s) return "SIN_SEDE";
  const kE = "tr:tpl:estado:" + comp, kC = "tr:tpl:chk:" + comp;
  const c = await env.EQ.get(kE);
  if (c === "APPROVED" && !forzar) return c;
  const ult = Number(await env.EQ.get(kC)) || 0;
  if (!forzar && Date.now() - ult < 10 * 60e3) return c || "PENDING";
  await env.EQ.put(kC, String(Date.now()));
  const g = await (await fetch("https://api.ycloud.com/v2/whatsapp/templates/" + s.waba + "/" + TR_TPL.name + "/" + TR_TPL.lang, { headers: trH(env) })).json().catch(() => ({}));
  const st = g.status || "DESCONOCIDO";
  await env.EQ.put(kE, st);
  if (st === "APPROVED" && c !== "APPROVED") { try { await enviar(env, "573215702819", "✅ Jefe Aníbal, Meta aprobó la plantilla de la Tarjeta Regalo en " + (TR_SEDE[comp] || "la sede") + ": desde ya, las tarjetas que se vendan en la caja de esa sede le llegan solas al cliente, desde el WhatsApp de la sede. 🎄"); } catch (e) { } }
  if (st === "REJECTED" && c !== "REJECTED") { try { await enviar(env, "573215702819", "⚠️ Jefe Aníbal, Meta rechazó la plantilla de la Tarjeta Regalo en " + (TR_SEDE[comp] || "una sede") + ". Ya le aviso a Claude para ajustarla."); } catch (e) { } }
  return st;
}
async function trAlgunaAprobada(env) {
  let alguna = false;
  for (const comp of Object.keys(TR_SEDE_WA)) { if ((await trEstadoSede(env, comp, false)) === "APPROVED") alguna = true; }
  return alguna;
}
