/* Pendientes de saneamiento (BPM) por sede.
   Lo usan la página de cada sede (tarjeta "Pendientes de hoy") y /pendientes/ (semáforo de las 4 sedes).
   Lee los datos de action=bpm del motor de Vencimientos/Saneamiento y calcula, con las horas límite:
   - Temperaturas turno 1: 1 hora después de abrir
   - Temperaturas turno 2 y Limpieza y desinfección: a la hora de cerrar
   - Mantenimiento: quincenal (cada 15 días) */
(function(){
  var API = 'https://script.google.com/macros/s/AKfycbxkp7Cf5lN5iqn-MQBzjUomkKRWHQO-AqRWWF29FUy4NbrOIbN6uupFfSc6G6fRp6qF/exec';
  var SEDES = ['Nuestro Urabá','Ortíz','Turbo','Montería'];
  var TURNOS = ['12:00 p. m.','7:00 p. m.'];
  // Horario en minutos desde medianoche. Montería cierra 9:30 pm viernes y sábado.
  function horario(sede, d){
    var dow = d.getDay();
    if (sede === 'Ortíz' || sede === 'Turbo') return {abre: 17*60, cierra: 22*60};
    if (sede === 'Montería' && (dow === 5 || dow === 6)) return {abre: 12*60, cierra: 21*60 + 30};
    return {abre: 12*60, cierra: 21*60};
  }
  function iso(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function deIso(s){ var p = s.split('-').map(Number); return new Date(p[0], p[1]-1, p[2]); }
  function hhmm(m){ var h = Math.floor(m/60), mi = m % 60, ap = h >= 12 ? 'pm' : 'am', h12 = h % 12 || 12; return h12 + (mi ? ':' + String(mi).padStart(2,'0') : '') + ' ' + ap; }
  function diasEntre(a, b){ return Math.round((deIso(b) - deIso(a)) / 86400000); }

  // Estado de un día: lista de pendientes con est = 'ok' | 'esp' (todavía a tiempo) | 'no' (venció)
  function calcular(sede, s, ahora){
    ahora = ahora || new Date();
    var hoy = iso(ahora), min = ahora.getHours()*60 + ahora.getMinutes(), h = horario(sede, ahora);
    var nev = (s.config && s.config.neveras || []).length || 1;
    function est(hecho, limite){ return hecho ? 'ok' : (min <= limite ? 'esp' : 'no'); }
    var items = [];
    [0,1].forEach(function(i){
      var eq = {}; (s.temperaturas || []).forEach(function(x){ if (x.fecha === hoy && x.turno === TURNOS[i]) eq[x.equipo] = 1; });
      var n = Object.keys(eq).length, lim = i === 0 ? h.abre + 60 : h.cierra;
      items.push({k:'temp'+(i+1), n:'Temperaturas ' + (i === 0 ? '1.ª toma' : '2.ª toma'), est: est(n >= nev, lim),
        det: n >= nev ? 'Completa (' + n + '/' + nev + ' neveras)' : (n ? n + '/' + nev + ' neveras · ' : '') + 'antes de las ' + hhmm(lim), tab:'temp'});
    });
    var lim = (s.limpieza || []).filter(function(x){ return x.fecha === hoy; })[0];
    var xs = lim ? lim.marcas.filter(function(m){ return m === 'X'; }).length : 0;
    items.push({k:'lim', n:'Limpieza y desinfección', est: est(!!lim, h.cierra),
      det: lim ? (xs ? xs + ' actividades sin hacer' : 'Hecha') : 'antes de las ' + hhmm(h.cierra), tab:'limpieza', aviso: xs > 0});
    var ult = (s.mantenimiento || []).map(function(x){ return x.fecha; }).filter(Boolean).sort().pop();
    var d = ult ? diasEntre(ult, hoy) : null;
    items.push({k:'mant', n:'Mantenimiento (quincenal)', tab:'mant',
      est: d === null ? 'no' : d < 15 ? 'ok' : d === 15 ? 'esp' : 'no',
      det: d === null ? 'Sin ningún registro' : d < 15 ? 'Hace ' + d + ' día' + (d === 1 ? '' : 's') + ' · toca en ' + (15 - d) : d === 15 ? 'Toca hoy' : 'Vencido hace ' + (d - 15) + ' días'});
    return items;
  }

  // Cumplimiento de un día ya cerrado: limpieza + 2 tomas completas = 3 puntos
  function diaCumple(s, dia){
    var nev = (s.config && s.config.neveras || []).length || 1, p = 0;
    if ((s.limpieza || []).some(function(x){ return x.fecha === dia; })) p++;
    TURNOS.forEach(function(t){ var eq = {}; (s.temperaturas || []).forEach(function(x){ if (x.fecha === dia && x.turno === t) eq[x.equipo] = 1; }); if (Object.keys(eq).length >= nev) p++; });
    return p;
  }
  // Cumplimiento del mes en curso (días cerrados, desde el primer registro de la sede)
  function mes(s, ahora){
    ahora = ahora || new Date();
    var fechas = [].concat(s.limpieza || [], s.temperaturas || []).map(function(x){ return x.fecha; }).filter(Boolean).sort();
    var ini = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    if (fechas[0] && deIso(fechas[0]) > ini) ini = deIso(fechas[0]);
    var dias = [], hechos = 0, total = 0;
    for (var d = new Date(ini); iso(d) < iso(ahora); d.setDate(d.getDate()+1)){
      var k = iso(d), p = diaCumple(s, k); dias.push({fecha:k, p:p}); hechos += p; total += 3;
    }
    return {pct: total ? Math.round(hechos * 100 / total) : null, dias: dias};
  }

  function cargar(sede){
    return fetch(API + '?action=bpm' + (sede ? '&sede=' + encodeURIComponent(sede) : ''))
      .then(function(r){ return r.json(); })
      .then(function(j){ if (!j.ok) throw new Error(j.error || 'Error'); return j.data; });
  }

  var ICO = {ok:'✅', esp:'⏳', no:'❌'};
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  // Tarjeta compacta (para la página de la sede). link: función(tab) -> url de la planilla
  function tarjeta(sede, items, link){
    var falta = items.filter(function(x){ return x.est !== 'ok'; }).length;
    var h = '<div class="pend-card"><div class="pend-t"><b>🧼 Pendientes de hoy</b><span>' + (falta ? falta + ' por hacer' : 'Todo al día 🎉') + '</span></div>';
    items.forEach(function(x){
      h += '<a class="pend-i pend-' + x.est + '" href="' + esc(link(x.tab)) + '"><span class="pend-ic">' + ICO[x.est] + '</span><span class="pend-tx"><b>' + esc(x.n) + '</b><small>' + (x.aviso ? '⚠️ ' : '') + esc(x.det) + '</small></span>' + (x.est !== 'ok' ? '<span class="pend-go">Llenar ›</span>' : '') + '</a>';
    });
    return h + '</div>';
  }
  var CSS = '.pend-card{background:#111;border:1px solid #2a2a2a;border-radius:14px;padding:12px;margin:0 0 14px}'
    + '.pend-t{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:15px}.pend-t span{font-size:12px;color:#f0b90b;font-weight:700}'
    + '.pend-i{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:10px;text-decoration:none;color:#eee;margin-top:6px;background:#181818}'
    + '.pend-no{background:#2a1212;border:1px solid #5a2222}.pend-esp{background:#1d1a10}'
    + '.pend-ic{font-size:18px}.pend-tx{flex:1;display:flex;flex-direction:column;line-height:1.25}.pend-tx b{font-size:14px}.pend-tx small{font-size:12px;color:#9b9b9b}'
    + '.pend-go{font-size:12px;font-weight:700;color:#000;background:#f0b90b;border-radius:999px;padding:4px 9px;white-space:nowrap}';
  function estilos(){ if (document.getElementById('pend-css')) return; var st = document.createElement('style'); st.id = 'pend-css'; st.textContent = CSS; document.head.appendChild(st); }

  window.PGPend = {API:API, SEDES:SEDES, calcular:calcular, mes:mes, diaCumple:diaCumple, cargar:cargar, tarjeta:tarjeta, estilos:estilos, ICO:ICO, iso:iso};
})();
