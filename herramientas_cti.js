(() => {
  const status = document.getElementById('estado-hecti');
  const modules = [
    ['Unidad 1', 'Investigación, publicación y cienciometría'],
    ['Unidad 2', 'Técnicas cuantitativas de investigación'],
    ['Unidad 3 · Texto 1', 'Cuándo utilizar métodos cualitativos'],
    ['Unidad 3 · Texto 2', 'Tipos de estudios cualitativos y trabajo de campo']
  ];
  const study = [
    [
      ['cienciometría', '¿Qué estudia la cienciometría?', 'Estudia la actividad científica mediante indicadores como inversión, publicaciones, patentes y citas.', 'La composición química de las publicaciones.', 'La validez de cada resultado experimental.'],
      ['factor de impacto', '¿Qué limitación tiene el factor de impacto al evaluar un artículo?', 'Resume citas a nivel de revista. La calidad o el impacto de un artículo concreto requiere evidencia propia.', 'Mide directamente la reproducibilidad de cada artículo.', 'Es una evaluación individual realizada por pares.'],
      ['Latindex', '¿Por qué consultar repertorios como Latindex?', 'Permiten examinar revistas y circuitos de publicación que pueden quedar insuficientemente representados en otros índices.', 'Estiman el impacto causal de la financiación.', 'Sustituyen la lectura crítica de los artículos.']
    ],
    [
      ['recolección', '¿Qué diferencia el diseño cuantitativo del análisis estadístico?', 'El diseño abarca la pregunta, las variables, la selección de casos y la obtención de datos. El análisis estadístico es una etapa de ese proceso.', 'Son dos nombres para el mismo cálculo.', 'El diseño se elige después de conocer los resultados.'],
      ['estadística descriptiva', '¿Para qué sirve la estadística descriptiva?', 'Resume y organiza los datos observados mediante tablas, gráficos y medidas.', 'Garantiza que una muestra sea representativa.', 'Identifica automáticamente efectos causales.'],
      ['inferencia estadística', '¿Qué añade la inferencia estadística?', 'Permite razonar desde la muestra hacia una población bajo supuestos, teniendo en cuenta la incertidumbre.', 'Elimina el error de muestreo.', 'Se limita a describir los valores observados.']
    ],
    [
      ['exploratori', '¿Cuándo aporta valor un enfoque cualitativo exploratorio?', 'Cuando se busca comprender un fenómeno poco delimitado, descubrir dimensiones o formular preguntas que aún no se pueden medir con claridad.', 'Cuando la única tarea es estimar un porcentaje representativo.', 'Cuando los conceptos ya están definidos y solo se calcula su frecuencia.'],
      ['contexto', '¿Qué evidencia permite comprender el contexto de una práctica?', 'Relatos, observaciones y documentos permiten relacionar prácticas y significados con las condiciones en que se producen.', 'Una cifra agregada describe por sí sola todas las experiencias.', 'El número de casos reemplaza la interpretación de los datos.'],
      ['cuantitativ', '¿Qué determina la elección de método?', 'La pregunta y la evidencia necesaria orientan la elección. Las estrategias cualitativa y cuantitativa pueden complementarse.', 'La disponibilidad de una herramienta fija siempre el método.', 'Cada disciplina debe usar una única estrategia.']
    ],
    [
      ['Selección del caso', '¿Qué conviene justificar al seleccionar un caso?', 'Su relación con la pregunta, los criterios de selección y el nivel de análisis.', 'Solo la proximidad del caso.', 'Que el caso produce el resultado esperado.'],
      ['Observación participante', '¿Qué aporta la observación participante?', 'Permite examinar prácticas en su contexto y registrar también la posición del investigador en el campo.', 'Elimina la necesidad de registrar cómo se obtuvieron los datos.', 'Convierte las observaciones en una muestra probabilística.'],
      ['entrevista cualitativa', '¿Qué caracteriza una entrevista cualitativa?', 'Un guion flexible que permite profundizar con preguntas abiertas y repreguntas pertinentes.', 'Un conjunto fijo de respuestas que impide profundizar.', 'Una conversación en la que la pregunta de investigación deja de orientar el diálogo.']
    ]
  ];

  function prepare(record, index) {
    if (!Number.isInteger(record.pages) || record.pages < 3 || record.pages > 50 ||
        !Array.isArray(record.segments) || !record.segments.length || record.segments.length > 350) {
      throw new Error('Formato de lectura');
    }
    const numero = index + 8;
    const [etiqueta, titulo] = modules[index];
    let previous = 0;
    let previousPage = 1;
    const parrafos = record.segments.map((item, indice) => {
      const { page, text, start, end } = item;
      if (typeof text !== 'string' || !text.trim() || text.length > 5000 ||
          !Number.isInteger(page) || page < previousPage || page > record.pages ||
          !Number.isFinite(start) || !Number.isFinite(end) || Math.abs(start - previous) > .002 ||
          end <= start || end > 7200) throw new Error('Mapa de audio');
      const wordStartsMs = item.wordStartsMs;
      if (wordStartsMs !== undefined && (!Array.isArray(wordStartsMs) ||
          wordStartsMs.length !== palabrasLectura(text).length ||
          wordStartsMs.some((time, i) => !Number.isInteger(time) || time < (wordStartsMs[i - 1] ?? 0) ||
            time >= (end - start) * 1000))) throw new Error('Marcas de palabras');
      previous = end;
      previousPage = page;
      return {
        id: 'hecti_' + numero + '_' + indice, indice, texto: text, seccion: 'Página ' + page,
        pagina_inicio: page, pagina_fin: page, inicio_s: start, fin_s: end,
        marcas_palabras_ms: wordStartsMs,
        precision_tiempo: 'generado_por_segmento', nota_precision: 'Marca calculada a partir del audio generado para este fragmento.'
      };
    });
    const secciones = parrafos.filter((p, i) => !i || p.pagina_inicio !== parrafos[i - 1].pagina_inicio)
      .map(p => ({ titulo: p.seccion, pagina: p.pagina_inicio, parrafo_idx: p.indice, tiempo_fmt: formatearSegundos(p.inicio_s), precision_tiempo: p.precision_tiempo }));
    const orales = [], test = [], capsulas = [], conceptos = [];
    study[index].forEach(([anchor, pregunta, respuesta, ...distractores], i) => {
      const p = parrafos.find(segment => segment.texto.toLowerCase().includes(anchor.toLowerCase())) || parrafos.find(segment => segment.pagina_inicio >= 3);
      const pagina = p.pagina_inicio;
      const id = 'hecti_' + numero + '_practica_' + i;
      const pistas = respuesta.toLowerCase().match(/[\p{L}]{6,}/gu).slice(0, 8);
      orales.push({ id, pregunta, pagina, paginas_ref: p.seccion, seccion: etiqueta, respuesta_modelo: respuesta,
        ideas_rubrica: [{ id: id + '_idea', titulo: 'Idea central', detalle: respuesta, pagina, pistas }] });
      const opciones = [...distractores];
      opciones.splice(i, 0, respuesta);
      test.push({ pregunta, opciones, correcta: i, pagina, explicacion: respuesta });
      capsulas.push({ id: id + '_cap', unidadNum: numero, titulo: pregunta, pregunta_caminata: pregunta,
        descripcion: p.texto, pagina, seccion: p.seccion, parrafoIdx: p.indice, inicio_s: p.inicio_s, fin_s: p.fin_s,
        precision_tiempo: p.precision_tiempo, origen: 'Práctica de Herramientas CTI' });
      conceptos.push({ id, unidad: numero, titulo: pregunta, paginas: p.seccion, pagina_principal: pagina,
        terminos_clave: pistas, sintesis_elaborada: respuesta });
    });
    const pdf = './herramientas/lectura-' + (index + 1) + '.pdf';
    const audio = './herramientas/lectura-' + (index + 1) + '.mp3';
    const guion = new Blob([parrafos.map(p => p.texto).join('\n\n')], { type: 'text/plain;charset=utf-8' });
    return {
      unidad: {
        numero, modulo: 3, etiqueta, titulo_corto: titulo, nombre_base: etiqueta + ' · ' + titulo,
        asignatura: 'Herramientas para los estudios sobre ciencia, tecnología e innovación',
        modulo_privado: true, archivo_mp3: audio, archivo_pdf: pdf, archivo_guion: guion,
        duracion_estimada_s: previous, total_paginas_pdf: record.pages,
        total_palabras: parrafos.reduce((n, p) => n + p.texto.split(/\s+/).length, 0),
        tamano_mb: record.tamano_mb, puntos_verificados_audio: [],
        parrafos, secciones, evaluacion: { orales, test }
      }, capsulas, conceptos
    };
  }


  window.lecturasHerramientasListas = (async () => {
    try {
      const response = await fetch('./herramientas/lecturas.json');
      if (!response.ok) throw new Error('Lecturas no disponibles');
      const pack = await response.json();
      if (pack.format !== 'muecti-hecti-v1' || pack.readings.length !== modules.length) {
        throw new Error('Formato de módulo');
      }
      for (const { unidad, capsulas, conceptos } of pack.readings.map(prepare)) {
        unidad.archivo_guion = URL.createObjectURL(unidad.archivo_guion);
        DATA.unidades.push(unidad);
        DATA.capsulas_base.push(...capsulas);
        capsulas.forEach((cap, i) => registrarEnCalendarioRepasos({
          ...cap, descripcion: unidad.evaluacion.orales[i].respuesta_modelo
        }));
        DATA.base_conocimiento_profesor.push(...conceptos);
      }
      status.hidden = true;
    } catch (error) {
      console.error(error);
      status.textContent = 'No se pudieron cargar las lecturas de Herramientas CTI. Recarga la página.';
    }
  })();
})();
