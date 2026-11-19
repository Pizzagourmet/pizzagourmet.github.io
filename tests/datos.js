// Tests del equipo Pizza Gourmet (18 nov 2026)
var API_TESTS = 'https://pizzerito-equipo.soyanibaldiaz.workers.dev/tests/';
var SEDES_TEST = ['Nuestro Urabá', 'Ortíz', 'Nuestro Montería', 'Turbo', 'Administración', 'Otra'];

/* ---------- DISC: 26 preguntas; se ordena cada opción del 4 (más me identifica) al 1 (menos) ---------- */
var DISC = [
  ['En un restaurante. Estoy esperando mesa, me dicen que faltan 10 minutos y pasan veinte:', ['Me molesto y le digo al mesero que ya pasó el doble de tiempo, y le pregunto que si tardará mucho más me iré.', 'No me doy cuenta, pues estoy metidísimo en la plática.', 'No me fijo o, aunque me dé cuenta, no digo algo.', 'Le digo al mesero exactamente la hora en que llegué y exactamente el tiempo que ha pasado, y le pido que me diga con exactitud cuánto tiempo más falta para poder tomar una decisión.']],
  ['Tengo mucha hambre y prisa. El mesero me trae un plato que yo no pedí:', ['Me molesto y le digo de forma impositiva si no estaba poniendo atención cuando ordené.', 'Charlo con el mesero para explicarle que no es lo que le pedí.', 'Me quedo callado y me adapto a lo que me trajeron.', 'Le digo de manera directa que eso no fue lo que pedí.']],
  ['En una reunión de amigos:', ['Me gusta convencer a los demás de mis opiniones y gozo hablar de cosas relacionadas con mi trabajo.', 'Hablo mucho o cuento chistes, hablo más de lo que escucho.', 'Me quedo escuchando; la gente me busca porque soy excelente escucha, pues pongo atención.', 'Observo y analizo a la gente; si doy mi opinión, lo hago únicamente si conozco del tema, y será algo preciso.']],
  ['Mis compañeros de trabajo me describirían como alguien:', ['Energético, fuerte y agresivo.', 'Social, alegre, conversador.', 'Tranquilo, paciente, amable.', 'Concreto, disciplinado, metódico.']],
  ['En una discusión:', ['Busco tener la razón y no paro hasta conseguirla; aparte me gusta discutir.', 'Trato de decirles que no es para tanto, pues discutir me da pereza.', 'Odio la agresión y mejor digo que sí, que estoy de acuerdo, con tal de no argumentar.', 'Me baso en los hechos y busco comprobar mi punto de vista, para que esté bien fundamentado, y espero lo mismo de los demás.']],
  ['Lo que realmente me emociona en la vida:', ['Los retos, la novedad, arriesgar.', 'Las sorpresas, la diversión, el juego.', 'La dulzura, el cariño, la aceptación.', 'Aprender, la sabiduría, el conocimiento.']],
  ['Si alguien me agrede:', ['Agredo de regreso, pues necesito sacar mi enojo de inmediato; lo bueno es que así como se me sube de rápido, así también se me baja.', 'Evado la situación, o me hago el loco.', 'Me quedo callado y no demuestro lo que siento.', 'Me angustio y me lo guardo, pero a la larga exploto, y cuando esto pasa, cuidado, pues no se me baja nada fácil.']],
  ['Cuando voy de compras:', ['Busco buenas ofertas, me encantan los descuentos.', 'Me divierte ir de compras y me encanta comprar regalos; dicen que soy un comprador compulsivo.', 'Soy indeciso, me cuesta mucho trabajo decidir y escoger.', 'Sé lo que quiero y no gasto mi dinero si no lo encuentro; soy muy definido.']],
  ['¿Qué frase te describe mejor?', ['Soy activo y energético; me gusta hacer más de una cosa a la vez, la gente me pregunta si nunca me canso.', 'Soy alegre y jovial; si veo a alguien triste busco ponerlo de buen humor, la gente me pregunta si nunca me deprimo.', 'Soy tranquilo y pasivo, me gusta que la gente se lleve bien y que no haya agresión; la gente me pregunta si nunca me enojo.', 'Soy analítico y observador, me gusta resolver problemas mentales y encontrar la solución; la gente me dice que soy muy responsable y aprensivo.']],
  ['Cuando estoy trabajando en equipo soy:', ['El que manda y organiza.', 'El que anima para que todos le echen ganas.', 'El que apoya para lograr un equipo unido.', 'El que organiza la parte estratégica para lograr la mayor probabilidad de éxito.']],
  ['Mis hermanos y la gente que me rodea dicen que mis peores defectos son:', ['Ser agresivo y visceral.', 'Ser distraído y desorganizado.', 'Ser pasivo y lento.', 'Ser terco y cuadrado.']],
  ['Algunas de mis cualidades son:', ['Ser determinado y seguro.', 'Ser optimista y alegre.', 'Ser adaptable y pacífico.', 'Ser cumplido y estable.']],
  ['Estoy caminando y me tropiezo con algún desconocido:', ['Espero a que se quite de mi camino para seguir adelante.', 'Le sonrío y me sigo de frente.', 'Le pido perdón y me sigo de frente.', 'Me hago a un lado y sin hablar sigo mi camino.']],
  ['En el trabajo, sobresalgo en:', ['La toma de decisiones rápidas.', 'Las relaciones públicas.', 'La capacidad para adaptarme en equipos.', 'La seguridad de tener calidad y puntualidad.']],
  ['Mis defectos en el trabajo son:', ['No me gusta que me digan qué hacer.', 'Soy desordenado y olvidadizo, a veces impuntual.', 'Trabajo mal bajo presión.', 'No me gusta delegar, prefiero trabajar solo.']],
  ['Mi mamá dice que de niño yo era:', ['Mandón y exigente.', 'Alegre y hablaba con todo el mundo.', 'Obediente y tranquilo.', 'Ordenado y no me gustaba ensuciarme.']],
  ['Al expresarme:', ['Digo las cosas como son.', 'Las digo de manera indirecta para no lastimar.', 'Casi no expreso lo que siento.', 'Digo las cosas de manera diplomática.']],
  ['La emoción que demuestro con más frecuencia es:', ['Enojo.', 'Optimismo.', 'No demuestro emoción.', 'Miedo.']],
  ['Los profesores me reconocían porque:', ['Discutía mucho, y me encantaba demostrar que todo lo sabía.', 'Era muy amiguero y hablaba mucho.', 'No interrumpía y era callado.', 'Era buen estudiante y muy analítico.']],
  ['Características que más te describen:', ['Autosuficiente y ambicioso.', 'Despreocupado y popular.', 'Cooperativo y adaptable.', 'Preciso y exacto.']],
  ['Características que más te describen:', ['Valiente y osado.', 'Amiguero y conversador.', 'Tolerante y flexible.', 'Reservado y respetuoso.']],
  ['Características que más te describen:', ['Obstinado, con determinación para defenderme.', 'Confiado, creo en los demás.', 'Servicial, me gusta ayudar a los demás.', 'Prudente, me gusta reflexionar bien las cosas.']],
  ['Características que más te describen:', ['Emprendedor, con fuerza de voluntad.', 'Juguetón, atraigo a la gente.', 'Generoso, me adapto a los demás.', 'Cuidadoso, con tacto al decir las cosas.']],
  ['Características que más te describen:', ['Atrevido, creo en mí mismo.', 'Cálido, motivo a los demás.', 'Calmado, hago lo que me piden.', 'Pulcro, ordenado y limpio.']],
  ['Características que más te describen:', ['Confrontador, me gusta argumentar.', 'Animado, el alma de la fiesta.', 'Armonioso, abierto a sugerencias.', 'Culto, busco tener conocimiento.']],
  ['Características que más te describen:', ['Tomo acción, persuasivo, convincente.', 'Carismático, magnético, desinhibido.', 'Humilde, compasivo con la gente.', 'Sistemático, escéptico, precavido.']]
];
var DISC_EST = {
  A: { n: 'Dominante', t: 'Colérico', c: '#d6262b', d: 'Directo, decidido y orientado a resultados. Le gustan los retos y tomar decisiones rápidas. Para trabajar mejor con él: ir al grano, darle metas claras y autonomía.' },
  B: { n: 'Influyente', t: 'Sanguíneo', c: '#f39200', d: 'Sociable, alegre y entusiasta. Motiva a los demás y se le dan las relaciones con la gente. Para trabajar mejor con él: reconocer su esfuerzo, darle espacio para hablar y ayudarle con el orden.' },
  C: { n: 'Estable', t: 'Flemático', c: '#1f8a4c', d: 'Tranquilo, paciente y leal. Apoya al equipo y busca la armonía. Para trabajar mejor con él: explicarle los cambios con tiempo, darle seguridad y un ambiente sin conflictos.' },
  D: { n: 'Minucioso', t: 'Melancólico', c: '#1d5fbf', d: 'Analítico, ordenado y exigente con la calidad. Cuida los detalles y los procesos. Para trabajar mejor con él: darle información precisa, tiempo para revisar y reglas claras.' }
};

/* ---------- VAK: 25 reactivos (5 párrafos, 10 listas de palabras, 10 frases); se escoge el que sea más fácil de leer ---------- */
var VAK = [
  ['p', 'El repiqueteo de las campanillas de viento me dijo que la brisa aún estaba soplando afuera. A la distancia pude escuchar el silbido del tren.', 'Puedo ver los ramilletes de flores en el patio, el brillo de sus colores difuminándose entre las sombras y la luz solar, mientras sus pétalos ondean con la brisa.', 'Mientras corría podía sentir la brisa en mi espalda, el golpeteo de mis pies a lo largo del camino. La sangre fluía por mis venas, haciéndome sentir muy alerta.'],
  ['p', 'Me gusta sentirme abrigado. En las noches frías me gusta relajarme junto al cálido fuego de la chimenea en una cómoda habitación con una taza de delicioso chocolate caliente y una cálida frazada.', 'El niño hablaba a través del teléfono de juguete como si estuviera hablando con un amigo. Al escuchar la tranquila conversación, casi pude oír el eco de la voz del otro niño a la distancia.', 'La vista era magnífica. Era una de las cosas más hermosas que jamás haya visto. El panorama del verde campo se extendía claramente a nuestros pies bajo la brillante y chispeante luz del sol.'],
  ['p', 'Parecían sorprendidos cuando notaron que había más gente en la playa. El asombro de sus caras se transformó en avidez mientras observaban para ver si reconocían a alguien más en la arena.', 'Me ayudaron y me sostuvieron hasta que sentí recuperar mi fuerza. La sensación de hormigueo que corría de arriba abajo por mis piernas, especialmente en mis pantorrillas, era más fuerte después de levantarme y mi cuerpo estaba extremadamente caliente.', 'La gente se expresaría mejor verbalmente si pudiera hablar acerca de sus intereses o sus posesiones. Se puede escuchar el creciente entusiasmo en sus conversaciones y generalmente se vuelven más fluidos.'],
  ['p', 'La retroalimentación que la oradora recibió fue una indicación de que se estaba comunicando más efectivamente. La gente en la audiencia parecía estar en sintonía con lo que ella estaba diciendo.', 'Quiero entender cómo se siente la gente en su mundo interior, para aceptarlos como son, para crear una atmósfera en la que se sientan libres de pensar y sentir lo que ellos deseen.', 'Los niños observan a los adultos. Notan mucho más de lo que creemos. Es posible verlo si los observamos jugar. Imitan el comportamiento de los adultos que ven.'],
  ['p', 'La gente creativa y artística tiene ojo para la belleza. Pueden ver los patrones y las formas que otros no pueden. Responden a los colores alrededor y el panorama que los rodea puede afectar su estado de ánimo.', 'Escuchan la música como si fuera la primera vez. Cada cambio de tono y ritmo es perceptible a sus oídos. Los sonidos vuelan a través de la habitación mientras los ritmos hacen eco en sus cabezas.', 'Todos estaban pasmados por las profundas emociones generadas por la conversación. Algunos se sintieron aludidos y lo meditaron silenciosamente. Otros se sintieron estimulados y emocionados. Todos estuvieron receptivos a cada nueva emoción.'],
  ['w', 'Testigo · Ver · Mirar', 'Entrevista · Escuchar · Oír', 'Sensación · Tocar · Sentir'],
  ['w', 'Resolver · Sensitivo · Empujar', 'Observar · Alcance · Precisar', 'Protestar · Enfatizar · Discutir'],
  ['w', 'Proclamar · Mención · Acústico', 'Textura · Maniobra · Tacto', 'Exhibir · Inspeccionar · Vista'],
  ['w', 'Escrutar · Enfocado · Escena', 'Articular · Prestar atención · Tono', 'Estimular · Apoyo · Agarrar'],
  ['w', 'Timbrar · Rumor · Toque de tambor', 'Movimiento · Calor · Prisa', 'Chispear · Espejo · Perspectiva'],
  ['w', 'Soñar · Brillar · Ilusión', 'Escuchar · Quietud · Silencio', 'Ademán · Suave · Tierno'],
  ['w', 'Compás · Escuchar · Grabar', 'Firme · Sostener · Concreto', 'Brillo · Apariencia · Imagen'],
  ['w', 'Sentimiento · Tibio · Músculo', 'Perspectiva · Morado · Libro', 'Rumor · Audible · Tranquilidad'],
  ['w', 'Espectáculo · Observador · Visión', 'Ritmo · Articular · Sonar', 'Mover · Poderoso · Reflejo'],
  ['w', 'Ronroneo · Oír · Melodía', 'Suave · Tomar · Relajado', 'Brillante · Observación · Visión'],
  ['f', 'Un vistazo', 'Un rumor', 'Un manojo'],
  ['f', 'Presta oídos', 'Dale una mano', 'Échale un ojo'],
  ['f', 'Mano a mano', 'Ojo a ojo', 'Palabra a palabra'],
  ['f', 'Imagínate', 'Escucha la palabra', 'Entablar combate con…'],
  ['f', 'El suspenso de la cacería', 'La luz del relámpago', 'La vibración del trueno'],
  ['f', 'Franco', 'Secreto', 'Falto de perspicacia'],
  ['f', 'Ya veo', 'Te escucho', 'Lo tengo'],
  ['f', 'Mantener ahí', 'A ojo de pájaro', 'Suena cierto'],
  ['f', 'Claro como el agua', 'Suave como la seda', 'Brillante como el sol'],
  ['f', 'Observa', 'Escucha', 'Capta']
];
// Hoja de puntaje: para cada reactivo, qué letra cuenta como [Auditivo (col. I), Visual (col. II), Kinestésico (col. III)]
var VAK_CLAVE = ['ABC', 'BCA', 'CAB', 'ACB', 'BAC', 'BAC', 'CBA', 'ACB', 'BAC', 'ACB', 'BAC', 'ACB', 'CBA', 'BAC', 'ACB', 'BAC', 'ACB', 'CBA', 'BAC', 'CBA', 'ACB', 'BAC', 'CBA', 'ACB', 'BAC'];   // reactivo 22 corregido: en la hoja original estaba invertido ("Ya veo" es visual, "Te escucho" auditivo, "Lo tengo" kinestésico, como dice la misma prueba)
var VAK_EST = {
  A: { n: 'Auditivo', c: '#f39200', d: 'Aprende y entiende mejor escuchando. Recuerda conversaciones y explicaciones habladas. Suele decir "te escucho" o "me suena". Para enseñarle: explicarle en voz alta, con audios y conversaciones.' },
  V: { n: 'Visual', c: '#1d5fbf', d: 'Aprende y entiende mejor viendo. Recuerda imágenes, colores y lo que lee. Suele decir "ya veo" o "se ve bien". Para enseñarle: mostrarle fotos, videos, demostraciones y cosas por escrito.' },
  K: { n: 'Kinestésico', c: '#1f8a4c', d: 'Aprende y entiende mejor haciendo y sintiendo. Recuerda lo que practicó con las manos. Suele decir "lo tengo" o "se siente bien". Para enseñarle: dejarlo practicar, hacer el paso a paso con él.' }
};

/* ---------- utilidades ---------- */
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function guardarLocal(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function leerLocal(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
function formDatos(sedeSel) {
  return '<label>Nombre completo</label><input id="nom" autocomplete="name" placeholder="Ej: María Pérez">' +
    '<label>Sede</label><select id="sede"><option value="">Escoge tu sede</option>' + SEDES_TEST.map(function (s) { return '<option' + (s === sedeSel ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
    '<label>Cargo (opcional)</label><input id="cargo" placeholder="Ej: cajera, cocina, domiciliario">';
}
function enviarTest(test, datos, respuestas, resultado, listo) {
  fetch(API_TESTS + 'enviar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ test: test, nombre: datos.nombre, sede: datos.sede, cargo: datos.cargo, respuestas: respuestas, resultado: resultado }) })
    .then(function (r) { return r.json(); }).then(function (j) { listo(!!j.ok); }).catch(function () { listo(false); });
}
