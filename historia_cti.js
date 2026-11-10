(() => {
  const numero = 7;
  const titulo = 'Tarea final y defensa oral';
  const input = document.getElementById('archivo-historia-cti');
  const estado = document.getElementById('estado-historia-cti');
  const panel = document.getElementById('tarea-historia-cti');
  const temas = [
    {
      clave: 'objetividad', referencia: /observación neutral/i,
      pregunta: '¿Cómo cambia la idea de objetividad al reconocer la carga teórica de la observación?',
      respuesta: 'La observación requiere conceptos, instrumentos y supuestos para interpretar los datos. La objetividad se fortalece al hacer explícitos esos supuestos, someterlos a crítica y contrastar interpretaciones.',
      pistas: ['observacion', 'teoria', 'hanson', 'supuestos', 'critica'],
      test: ['¿Qué implica la carga teórica de la observación?', 'La interpretación depende de conceptos y supuestos que pueden examinarse.', 'La objetividad exige observaciones sin instrumentos.', 'Cualquier interpretación tiene el mismo respaldo.']
    },
    {
      clave: 'valores', referencia: /neutralidad valorativa/i,
      pregunta: '¿Cómo distinguirías valores epistémicos y no epistémicos al defender tu primera respuesta?',
      respuesta: 'Los valores epistémicos guían la valoración de explicaciones y evidencias. Los valores no epistémicos incluyen prioridades sociales, éticas o económicas que pueden influir en qué se estudia y cómo se manejan las consecuencias de una decisión.',
      pistas: ['epistemicos', 'evidencia', 'eticos', 'sociales', 'prioridades'],
      test: ['¿Cuál de estos es un valor epistémico?', 'La coherencia de una explicación con la evidencia.', 'La prioridad política de una inversión.', 'La conveniencia comercial de un proyecto.']
    },
    {
      clave: 'siembra', referencia: /programa científico de siembra/i,
      pregunta: '¿Por qué la siembra de nubes en Emiratos permite discutir los límites del modelo tradicional de ciencia?',
      respuesta: 'El caso permite distinguir entre interpretar mediciones con modelos, evaluar explicaciones bajo incertidumbre y decidir qué investigar según prioridades como la seguridad hídrica.',
      pistas: ['nubes', 'modelos', 'incertidumbre', 'agua', 'prioridades'],
      test: ['¿Qué pregunta distingue una medición de una inferencia causal?', '¿Cómo se estima qué habría ocurrido sin la intervención?', '¿Cuál es el nombre del programa?', '¿En qué idioma se publica el informe?']
    },
    {
      clave: 'sistema', referencia: /cinco elementos interdependientes/i,
      pregunta: 'Explica el Metro de Dubái como sistema técnico con las categorías de Quintanilla.',
      respuesta: 'Distingue componentes materiales, agentes intencionales, estructura de relaciones, objetivos y resultados. El tren forma parte de una red de infraestructura, reglas, decisiones y personas.',
      pistas: ['componentes', 'agentes', 'estructura', 'objetivos', 'resultados'],
      test: ['¿Qué comparación permite evaluar la eficacia del sistema?', 'Comparar los resultados obtenidos con los objetivos.', 'Comparar el número de trenes con la longitud de la vía.', 'Clasificar los trenes por modelo.']
    },
    {
      clave: 'defensa', referencia: /¿Cuál es la diferencia entre el modelo de Hughes y el de Quintanilla/i,
      pregunta: '¿Cómo explicarías en un minuto la diferencia entre Hughes y Quintanilla?',
      respuesta: 'Hughes estudia cómo evolucionan históricamente los grandes sistemas tecnológicos y se coordinan sus elementos heterogéneos. Quintanilla ofrece categorías para analizar la estructura de un sistema y distinguir lo que se pretende de lo que se obtiene.',
      pistas: ['hughes', 'quintanilla', 'historia', 'estructura', 'resultados'],
      test: ['¿Qué distingue el énfasis de Hughes?', 'La evolución histórica de grandes sistemas tecnológicos.', 'La clasificación de los artefactos por tamaño.', 'La definición de eficacia como costo por pasajero.']
    }
  ];

  function decodificar(base64, tipo, cabecera) {
    const binario = atob(base64);
    if (!binario.startsWith(cabecera)) throw new Error('Formato de recurso');
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return new Blob([bytes], { type: tipo });
  }

  function prepararUnidad(pack) {
    if (pack?.format !== 'muecti-historia-cti-v2' ||
        !Array.isArray(pack.sections) || pack.sections.length !== 4 ||
        !Number.isInteger(pack.pages) || pack.pages < 1 || pack.pages > 100) {
      throw new Error('Formato de unidad');
    }
    const parrafos = [];
    const secciones = [];
    let fin = 0;
    for (const section of pack.sections) {
      if (typeof section?.title !== 'string' || !Array.isArray(section.paragraphs) ||
          !section.paragraphs.length || section.paragraphs.length > 100) throw new Error('Sección');
      const indice = parrafos.length;
      for (const item of section.paragraphs) {
        if (typeof item?.text !== 'string' || !item.text.trim() || item.text.length > 12000 ||
            !Number.isInteger(item.page) || item.page < 1 || item.page > pack.pages ||
            !Number.isFinite(item.end) || item.end <= fin || item.end > 14400) throw new Error('Párrafo');
        const idx = parrafos.length;
        parrafos.push({
          texto: item.text, indice: idx, id: 'historia_cti_p' + idx, seccion: section.title,
          es_titulo: idx === indice, pagina_inicio: item.page, pagina_fin: item.page, paginas: [item.page],
          inicio_s: fin, fin_s: item.end, tiempo_fmt: formatearSegundos(fin),
          precision_tiempo: 'aproximado_acustico',
          nota_precision: 'Marca calculada a partir de la duración de cada párrafo narrado'
        });
        fin = item.end;
      }
      const p = parrafos[indice];
      secciones.push({ titulo: section.title, pagina: p.pagina_inicio, parrafo_idx: indice,
        inicio_s: p.inicio_s, tiempo_fmt: p.tiempo_fmt, precision_tiempo: p.precision_tiempo });
    }
    const audio = decodificar(pack.wav, 'audio/wav', 'RIFF');
    const pdf = decodificar(pack.pdf, 'application/pdf', '%PDF-');
    const guion = new Blob([parrafos.map(p => p.texto).join('\n\n')], { type: 'text/plain;charset=utf-8' });
    const orales = [];
    const test = [];
    const capsulas = [];
    const conceptos = [];
    temas.forEach((tema, index) => {
      const p = parrafos.find(p => tema.referencia.test(p.texto));
      if (!p) throw new Error('Referencia de práctica');
      const pagina = p.pagina_inicio;
      const id = 'historia_cti_' + tema.clave;
      orales.push({
        id, pregunta: tema.pregunta, pagina, paginas_ref: 'Página ' + pagina,
        seccion: p.seccion, respuesta_modelo: tema.respuesta,
        ideas_rubrica: [{ id: id + '_idea', titulo: 'Idea central', detalle: tema.respuesta, pagina, pistas: tema.pistas }]
      });
      const [pregunta, correcta, ...distractores] = tema.test;
      const opciones = [...distractores];
      const posicion = index % 3;
      opciones.splice(posicion, 0, correcta);
      test.push({ pregunta, opciones, correcta: posicion, pagina, explicacion: tema.respuesta });
      capsulas.push({
        id: id + '_cap', unidadNum: numero, titulo: tema.pregunta, pregunta_caminata: tema.pregunta,
        descripcion: p.texto, pagina, seccion: p.seccion, parrafoIdx: p.indice,
        inicio_s: p.inicio_s, fin_s: p.fin_s, precision_tiempo: p.precision_tiempo, origen: 'Tarea de Historia de la CTI'
      });
      conceptos.push({
        id: id + '_concepto', unidad: numero, titulo: tema.pregunta, paginas: 'Página ' + pagina,
        pagina_principal: pagina, terminos_clave: tema.pistas, sintesis_elaborada: tema.respuesta
      });
    });
    return {
      unidad: {
        numero, titulo_corto: titulo, nombre_base: 'Historia de la CTI · ' + titulo,
        asignatura: 'Perspectiva histórica de los estudios sobre CTI', modulo_privado: true,
        archivo_mp3: URL.createObjectURL(audio), archivo_pdf: URL.createObjectURL(pdf), archivo_guion: URL.createObjectURL(guion),
        duracion_estimada_s: fin, total_paginas_pdf: pack.pages,
        total_palabras: parrafos.reduce((total, p) => total + p.texto.trim().split(/\s+/).length, 0),
        tamano_mb: ((audio.size + pdf.size) / 1048576).toFixed(1), puntos_verificados_audio: [],
        parrafos, secciones, evaluacion: { orales, test }
      }, capsulas, conceptos
    };
  }

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    input.disabled = true;
    estado.textContent = 'Cargando la unidad privada…';
    try {
      if (file.size > 80 * 1024 * 1024) throw new Error('Archivo demasiado grande');
      const { unidad, capsulas, conceptos } = prepararUnidad(JSON.parse(await file.text()));
      const anterior = DATA.unidades.findIndex(u => u.numero === numero);
      if (anterior >= 0) {
        guardarProgresoLectura(true);
        const recursos = DATA.unidades[anterior];
        [recursos.archivo_mp3, recursos.archivo_pdf, recursos.archivo_guion].forEach(url => URL.revokeObjectURL(url));
        DATA.unidades[anterior] = unidad;
      } else {
        DATA.unidades.push(unidad);
      }
      DATA.capsulas_base = DATA.capsulas_base.filter(c => c.unidadNum !== numero).concat(capsulas);
      DATA.base_conocimiento_profesor = DATA.base_conocimiento_profesor.filter(c => c.unidad !== numero).concat(conceptos);
      capsulas.forEach((cap, index) => registrarEnCalendarioRepasos({
        ...cap, descripcion: temas[index].respuesta
      }));
      cambiarTab('reproductor', document.getElementById('tabBtn_reproductor'));
      seleccionarUnidad(DATA.unidades.indexOf(unidad));
      renderBiblioteca();
      renderCalendarioYRepasos();
      prepararColaCaminata();
      estado.textContent = 'Historia de la CTI está lista. Puedes volver a ella desde el selector de unidades.';
    } catch (error) {
      console.warn('No se pudo abrir la unidad privada', error);
      estado.textContent = 'Abre el archivo actualizado «Historia CTI - Módulo 1.muecti.json».';
    } finally {
      input.value = '';
      input.disabled = false;
    }
  });
  if (location.hash === '#tarea-historia-cti') panel.open = true;
})();
