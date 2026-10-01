const conocimiento = [
  {
    categoria: "Access",
    pregunta: "¿Qué es una tabla?",
    keywords: ["tabla", "access", "datos", "filas", "columnas"],
    respuesta: "Una tabla en Access es un objeto que define y almacena datos organizados en filas (registros) y columnas (campos)."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué es una consulta en Access?",
    keywords: ["consulta", "access", "filtrar", "buscar", "qry"],
    respuesta: "Una consulta en Access permite seleccionar, filtrar, modificar y analizar datos provenientes de una o varias tablas de forma dinámica."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué es una base de datos?",
    keywords: ["base de datos", "basedatos", "informacion", "organizar", "almacenar", "access"],
    respuesta: "Una base de datos es una colección organizada de información relacionada. En Microsoft Access, esa información puede guardarse en tablas y consultarse o administrarse mediante consultas, formularios e informes. sisMos2.accdb es la base que organiza la información del sistema académico."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué es un campo en Access?",
    keywords: ["campo", "columna", "dato", "tipo de dato", "access", "tblalumnos"],
    respuesta: "Un campo es una columna de una tabla y representa un tipo de dato para cada registro, por ejemplo Nombres o FechaNacimiento en tblAlumnos. Cada campo tiene un nombre y un tipo de dato, como texto, número o fecha."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué es un registro en Access?",
    keywords: ["registro", "fila", "fila de datos", "alumno", "tabla"],
    respuesta: "Un registro es una fila de una tabla que reúne los valores de sus campos para una entidad. Por ejemplo, una fila de tblAlumnos reúne el IDAlumno, nombres, apellidos, grado y fecha de nacimiento de un alumno."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué es Microsoft Access?",
    keywords: ["microsoft access", "access", "programa", "gestionar", "base de datos"],
    respuesta: "Microsoft Access es un sistema de gestión de bases de datos que permite crear tablas, relaciones, consultas, formularios e informes. sisMos2.accdb está creada para administrar información académica con esos objetos."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué es un formulario en Access?",
    keywords: ["formulario", "form", "capturar", "interfaz", "datos", "access"],
    respuesta: "Un formulario es una interfaz para introducir, editar o consultar datos de una tabla o consulta. En sisMos2, frm_RegistroAlumnos gestiona alumnos y frm_IngresoNotas permite trabajar con calificaciones."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué es una relación entre tablas?",
    keywords: ["relacion", "tablas", "conectar", "clave foranea", "id alumno", "access"],
    respuesta: "Una relación conecta tablas mediante campos relacionados, normalmente una clave primaria y una clave foránea. En sisMos2, IDAlumno conecta tblAlumnos con tblCalificaciones, y también aparece en tblMatriculas."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué es una clave foránea?",
    keywords: ["clave foranea", "clave externa", "foreign key", "relacion", "idmateria", "idgrado"],
    respuesta: "Una clave foránea es un campo que apunta a la clave primaria de otra tabla y permite relacionar registros. En sisMos2, tblCalificaciones.IDAlumno se relaciona con tblAlumnos.IDAlumno; tblCalificaciones.Periodo corresponde a tblPeriodos.IDPeriodo."
  },
  {
    categoria: "Access",
    pregunta: "¿Qué tipos de datos se usan en Access?",
    keywords: ["tipo de dato", "tipos", "texto", "numero", "fecha", "access"],
    respuesta: "Access ofrece tipos como texto corto, número, fecha y hora, moneda, sí/no y autonumeración. En sisMos2, campos como Nombres son texto; Nota es numérico; FechaRegistro es fecha y hora; y los identificadores ID son numéricos."
  },
  {
    categoria: "Calificaciones",
    pregunta: "¿Qué es el promedio de calificaciones?",
    keywords: ["promedio", "media", "calificaciones", "notas", "calcular"],
    respuesta: "El promedio simple es la suma de las calificaciones dividida entre la cantidad de calificaciones. Para un alumno, MOSBOT puede calcularlo con sus notas de tblCalificaciones cuando la API local está activa."
  },
  {
    categoria: "Asistencia",
    pregunta: "¿Qué es una falta de asistencia?",
    keywords: ["falta", "asistencia", "ausencia", "inasistencia", "estado"],
    respuesta: "Una falta es un registro de asistencia cuyo estado indica que el alumno estuvo ausente. En sisMos2, la asistencia se guarda en tblAsistencia vinculada a la matrícula; las etiquetas exactas de Estado definen qué registros se cuentan como falta."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Cuáles son las tablas del sistema?",
    keywords: ["tablas", "listado", "sistema", "tblalumnos", "tblcalificaciones", "tblgrados"],
    respuesta: "sisMos2 incluye tblAlumnos, tblAsistencia, tblAsistenciaTemporal, tblCalificaciones, tbl_Cajas_Turnos, tblCostosGrado, tblGrados, tblMaterias, tblMatriculas, tblPagosMensualidades, tblPeriodos, tblProfesores y tblUsuarios."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué campos tiene tblAlumnos?",
    keywords: ["tblalumnos", "campos alumnos", "nombres", "apellidos", "fechanacimiento", "idgrado"],
    respuesta: "tblAlumnos contiene IDAlumno (clave primaria), IDGrado, Nombres, Apellidos y FechaNacimiento."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué campos tiene tblCalificaciones?",
    keywords: ["tblcalificaciones", "campos notas", "idcalificacion", "nota", "periodo", "fecharegistro"],
    respuesta: "tblCalificaciones contiene IDCalificacion (clave primaria), IDAlumno, IDMateria, Periodo, Nota y FechaRegistro. En esta base, Periodo almacena la relación con tblPeriodos.IDPeriodo."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué información guarda tblMatriculas?",
    keywords: ["tblmatriculas", "matricula", "aniolectivo", "fechainscripcion", "montomatricula", "numerorecibo"],
    respuesta: "tblMatriculas guarda IDMatricula, IDAlumno, IDGrado, AnioLectivo, FechaInscripcion, NumeroRecibo, MontoMatricula y Observaciones. Relaciona a cada alumno con el grado y año lectivo de su matrícula."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué campos tiene tblMaterias?",
    keywords: ["tblmaterias", "materias", "idmateria", "idprofesor", "nombremateria"],
    respuesta: "tblMaterias contiene IDMateria, NombreMateria e IDProfesor."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué campos tiene tblGrados y tblPeriodos?",
    keywords: ["tblgrados", "tblperiodos", "idgrado", "idperiodo", "nombregrado", "nombreperiodo"],
    respuesta: "tblGrados contiene IDGrado y NombreGrado. tblPeriodos contiene IDPeriodo y NombrePeriodo."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué tablas guardan asistencia?",
    keywords: ["asistencia", "tblasistencia", "tblasistenciatemporal", "estado", "observacion"],
    respuesta: "La asistencia registrada está en tblAsistencia, con IDAsistencia, IDMatricula, Estado, Fecha y Observacion. tblAsistenciaTemporal contiene una lista temporal de asistencia antes de consolidarla."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué tablas guardan pagos y costos?",
    keywords: ["pagos", "costos", "tblpagosmensualidades", "tblcostosgrado", "mensualidad", "valor"],
    respuesta: "Los pagos están en tblPagosMensualidades, relacionados con IDMatricula, y contienen mes, año lectivo, monto, fecha, número de recibo e ID_Turno. tblCostosGrado registra ValorMatricula y ValorMensualidad por grado y año lectivo."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué guarda tbl_Cajas_Turnos?",
    keywords: ["tbl_cajas_turnos", "cajas", "turnos", "cierre", "apertura", "cajero"],
    respuesta: "tbl_Cajas_Turnos registra los turnos de caja: apertura y cierre, monto inicial, efectivo esperado y real, diferencia, usuario cajero, estado y observaciones."
  },
  {
    categoria: "Tablas",
    pregunta: "¿Qué es la clave primaria?",
    keywords: ["clave", "primaria", "id", "identificador", "principal"],
    respuesta: "Es el campo único que identifica cada registro de una tabla. En esta base, por ejemplo, IDAlumno identifica un alumno e IDCalificacion identifica una calificación."
  },
  {
    categoria: "Relaciones",
    pregunta: "¿Cómo se relacionan las calificaciones con alumnos, materias y períodos?",
    keywords: ["relacion", "relaciones", "calificaciones", "alumnos", "materias", "periodos", "idmateria"],
    respuesta: "tblCalificaciones relaciona sus notas con tblAlumnos mediante IDAlumno, con tblMaterias mediante IDMateria y con tblPeriodos mediante el campo Periodo, que corresponde a tblPeriodos.IDPeriodo."
  },
  {
    categoria: "Relaciones",
    pregunta: "¿Cómo se relacionan los pagos con la matrícula?",
    keywords: ["relacion", "pagos", "matricula", "idmatricula", "alumno", "mensualidad"],
    respuesta: "tblPagosMensualidades.IDMatricula se relaciona con tblMatriculas.IDMatricula. La matrícula identifica al alumno y al grado mediante IDAlumno e IDGrado."
  },
  {
    categoria: "Consultas",
    pregunta: "¿Qué consulta muestra el expediente de notas?",
    keywords: ["expediente", "notas", "historial", "qryhistorialnotas", "calificaciones"],
    respuesta: "qryHistorialNotas une tblAlumnos con tblGrados y tblCalificaciones, y agrega tblMaterias y tblPeriodos. Muestra IDAlumno, nombres, apellidos, grado, materia, período, nota y fecha de registro."
  },
  {
    categoria: "Consultas",
    pregunta: "¿Qué consultas existen en sisMos2?",
    keywords: ["consultas", "listado consultas", "qry", "querydefs"],
    respuesta: "Las consultas guardadas principales son qryAlumnosMatriculados, qryBuscarMatricula, qryHistorialNotas, qryReciboMatricula y qryReciboPago. También existen las consultas cmbBuscarAlumno y cmbGrado, además de consultas internas de formularios."
  },
  {
    categoria: "Consultas",
    pregunta: "¿Qué muestra qryAlumnosMatriculados?",
    keywords: ["qryalumnosmatriculados", "alumnos matriculados", "aniolectivo", "grado"],
    respuesta: "qryAlumnosMatriculados relaciona tblMatriculas, tblAlumnos y tblGrados. Muestra la matrícula, el alumno, el grado y el año lectivo."
  },
  {
    categoria: "Consultas",
    pregunta: "¿Qué diferencia hay entre qryBuscarMatricula y qryReciboMatricula?",
    keywords: ["qrybuscarmatricula", "qryrecibomatricula", "recibo matricula", "buscar matrícula"],
    respuesta: "qryBuscarMatricula sirve para localizar una matrícula mostrando alumno, grado e IDMatricula. qryReciboMatricula reúne los datos de alumno, grado, año lectivo, monto, fecha, número de recibo y observaciones para el comprobante."
  },
  {
    categoria: "Consultas",
    pregunta: "¿Qué información muestra qryReciboPago?",
    keywords: ["qryrecibopago", "recibo pago", "mensualidad", "pagado", "monto"],
    respuesta: "qryReciboPago combina pagos mensuales, matrículas, alumnos y grados. Incluye alumno, grado, mes, año lectivo, monto pagado, fecha, número de recibo e ID del turno de caja."
  },
  {
    categoria: "Formularios",
    pregunta: "¿Cómo se registran las notas de un alumno?",
    keywords: ["ingresar", "registrar", "notas", "frm_ingresonotas", "formulario", "sfrm_calificaciones"],
    respuesta: "Las notas se gestionan en frm_IngresoNotas y el subformulario sfrm_Calificaciones. Los registros se guardan en tblCalificaciones."
  },
  {
    categoria: "Formularios",
    pregunta: "¿Cómo se registran nuevos alumnos?",
    keywords: ["registrar", "alumno", "estudiante", "frm_registroalumnos", "sfrm_listaalumnos"],
    respuesta: "frm_RegistroAlumnos permite registrar alumnos en tblAlumnos y utiliza sfrm_ListaAlumnos para mostrar la lista."
  },
  {
    categoria: "Formularios",
    pregunta: "¿Qué formularios tiene el sistema?",
    keywords: ["formularios", "forms", "frm", "listado formularios"],
    respuesta: "Los formularios encontrados son frm_CierreCaja, frm_IngresoNotas, frm_MenuPrincipal, frm_RegistroAlumnos, frm_RegistroUsuarios, frmAsistencia, frmLogin, frmMatricula, frmPagosMensualidades y frmReportesAcademicos. También están los subformularios sfrm_Calificaciones, sfrm_ListaAlumnos y sfrmDetalleAsistencia."
  },
  {
    categoria: "Formularios",
    pregunta: "¿Qué formulario se usa para matricular alumnos?",
    keywords: ["frmmatricula", "matricular", "matricula", "inscripcion"],
    respuesta: "frmMatricula gestiona la matrícula del alumno. La información se guarda en tblMatriculas y se relaciona con tblAlumnos y tblGrados."
  },
  {
    categoria: "Formularios",
    pregunta: "¿Cómo se registra la asistencia?",
    keywords: ["asistencia", "frmasistencia", "sfrmdetalleasistencia", "registrar asistencia"],
    respuesta: "La asistencia se gestiona en frmAsistencia y el subformulario sfrmDetalleAsistencia. La tabla permanente es tblAsistencia; tblAsistenciaTemporal se usa para una lista temporal."
  },
  {
    categoria: "Formularios",
    pregunta: "¿Qué formularios gestionan pagos y caja?",
    keywords: ["pagos", "caja", "frmPagosMensualidades", "frm_CierreCaja", "turno"],
    respuesta: "frmPagosMensualidades gestiona pagos de mensualidad y frm_CierreCaja administra turnos y cierres de caja."
  },
  {
    categoria: "Alcance",
    pregunta: "¿Qué información puede consultar MOSBOT de un alumno?",
    keywords: ["alcance", "privacidad", "datos alumno", "notas alumno", "faltas alumno", "promedio alumno"],
    respuesta: "Con la API local activa, MOSBOT puede buscar un alumno y consultar su promedio simple de calificaciones y las faltas registradas. No muestra otros datos personales."
  },
  {
    categoria: "MOSBOT",
    pregunta: "¿Qué es MOSBOT?",
    keywords: ["mosbot", "asistente", "bot", "quien"],
    respuesta: "¡Hola! Soy MOSBOT, tu asistente de conocimiento para resolver preguntas sobre tablas, consultas, formularios y relaciones de sisMos2.accdb."
  }
];

const ASSISTANT_API_BASE = (window.ACADEMIC_API_BASE || "http://localhost:5080/api").replace(/\/$/, "");
const LOCAL_ASSISTANT_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:(){}'"]/g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function obtenerPalabras(texto) {
  return normalizarTexto(texto)
    .split(" ")
    .filter(palabra => palabra.length >= 3);
}

function calcularPuntuacion(preguntaUsuario, itemBase) {
  const normUsuario = normalizarTexto(preguntaUsuario);
  const normBase = normalizarTexto(itemBase.pregunta);
  const palabrasUsuario = obtenerPalabras(preguntaUsuario);
  let puntos = 0;

  if (normUsuario === normBase) puntos += 1000;
  if (normUsuario.includes(normBase) || normBase.includes(normUsuario)) puntos += 100;

  itemBase.keywords.forEach(keyword => {
    const normKw = normalizarTexto(keyword);
    if (palabrasUsuario.includes(normKw)) puntos += 30;
    else if (normUsuario.includes(normKw)) puntos += 4;
  });

  const palabrasBase = obtenerPalabras(itemBase.pregunta);
  palabrasUsuario.forEach(palabra => {
    if (palabrasBase.includes(palabra)) puntos += 8;
  });

  return puntos;
}

function procesarPregunta(pregunta) {
  if (!pregunta || pregunta.trim() === "") return null;
  let mejorRespuesta = null;
  let mayorPuntuacion = 0;

  conocimiento.forEach(item => {
    const puntos = calcularPuntuacion(pregunta, item);
    if (puntos > mayorPuntuacion) {
      mayorPuntuacion = puntos;
      mejorRespuesta = item.respuesta;
    }
  });

  if (mayorPuntuacion < 10) {
    return "No encontré una respuesta suficiente sobre esa parte de sisMos2. Prueba con el nombre de una tabla, consulta o formulario, por ejemplo: tblCalificaciones o qryHistorialNotas.";
  }
  return mejorRespuesta;
}

function agregarMensaje(texto, tipo) {
  const mensajes = document.getElementById('assistantMessages');
  const articulo = document.createElement('article');
  articulo.className = `assistant-message assistant-message-${tipo}`;
  const etiqueta = document.createElement('span');
  etiqueta.className = 'assistant-message-label';
  etiqueta.textContent = tipo === 'user' ? 'TÚ' : 'MOSBOT';
  const parrafo = document.createElement('p');
  parrafo.textContent = texto;
  articulo.append(etiqueta, parrafo);
  mensajes.appendChild(articulo);
  mensajes.scrollTop = mensajes.scrollHeight;
  return articulo;
}

function detectarConsultaAlumno(pregunta) {
  const texto = normalizarTexto(pregunta);
  if (/^(que es|que significa|define|explica|concepto)\b/.test(texto)) return null;
  const consultaPromedio = /\b(promedio|media)\b/.test(texto);
  const consultaFaltas = /\b(faltas?|ausencias?|inasistencias?)\b/.test(texto);
  if (!consultaPromedio && !consultaFaltas) return null;

  const nombreMatch = consultaPromedio
    ? texto.match(/\b(?:promedio|media)\s+(?:de|del|para|tiene|a)\s+(.+)$/)
    : texto.match(/\b(?:faltas?|ausencias?|inasistencias?)\b.*?\b(?:tiene|de|del|para|a)\s+(.+)$/);
  const nombre = (nombreMatch?.[1] || "")
    .replace(/\b(?:el|la|los|las|un|una|del|de|alumno|alumna|estudiante)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { consultaPromedio, consultaFaltas, nombre };
}

async function responderConsultaAlumno(consulta, mensaje) {
  if (!consulta.nombre) {
    mensaje.querySelector('p').textContent = "Dime el nombre del alumno. Por ejemplo: ¿Cuál es el promedio de Ana López?";
    return;
  }

  try {
    let data;
    if (LOCAL_ASSISTANT_HOSTS.has(window.location.hostname)) {
      const response = await fetch(`${ASSISTANT_API_BASE}/alumnos/estadisticas?nombre=${encodeURIComponent(consulta.nombre)}`);
      data = await response.json().catch(() => ({}));
      if (response.status === 409 && data.coincidencias?.length) {
        const options = data.coincidencias.map(student => `${student.nombreCompleto} (ID ${student.idAlumno})`).join('; ');
        mensaje.querySelector('p').textContent = `Encontré varios alumnos con ese nombre. Indica el nombre completo o el ID: ${options}.`;
        return;
      }
      if (response.status === 404) {
        mensaje.querySelector('p').textContent = `No encontré un alumno llamado "${consulta.nombre}". Revisa el nombre e inténtalo otra vez.`;
        return;
      }
      if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
    } else {
      const snapshotResponse = await fetch(new URL('assets/sismos2-demo.json', window.location.href));
      if (!snapshotResponse.ok) throw new Error('No se pudo cargar el archivo de datos de demostración.');
      const students = await snapshotResponse.json();
      const normalizedName = normalizarTexto(consulta.nombre);
      const matchingStudents = students.filter(student => normalizarTexto(student.alumno).includes(normalizedName));
      const exactMatches = matchingStudents.filter(student => normalizarTexto(student.alumno) === normalizedName);
      const matches = exactMatches.length ? exactMatches : matchingStudents;

      if (!matches.length) {
        mensaje.querySelector('p').textContent = `No encontré "${consulta.nombre}" en los datos publicados. Actualiza el archivo de demostración desde sisMos2.accdb.`;
        return;
      }
      if (matches.length > 1) {
        mensaje.querySelector('p').textContent = `Encontré varios alumnos con ese nombre: ${matches.map(student => student.alumno).join('; ')}. Escribe el nombre completo.`;
        return;
      }
      data = matches[0];
    }

    const answer = [];
    if (consulta.consultaFaltas) {
      if (data.faltas === null || data.estadoAsistencia === 'sin-clasificar') {
        answer.push(`Encontré ${data.totalAsistencias} registros de asistencia de ${data.alumno}, pero no pude identificar cuáles estados significan falta. Hay que configurar esos estados en el API.`);
      } else {
        answer.push(`${data.alumno} tiene ${data.faltas} ${data.faltas === 1 ? 'falta' : 'faltas'} registradas.`);
      }
    }
    if (consulta.consultaPromedio) {
      if (data.promedio === null) {
        answer.push(`${data.alumno} todavía no tiene calificaciones registradas.`);
      } else {
        const average = new Intl.NumberFormat('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.promedio);
        answer.push(`El promedio simple de ${data.alumno} es ${average}, calculado sobre ${data.calificaciones} ${data.calificaciones === 1 ? 'calificación' : 'calificaciones'}.`);
      }
    }
    mensaje.querySelector('p').textContent = answer.join(' ');
  } catch (error) {
    mensaje.querySelector('p').textContent = LOCAL_ASSISTANT_HOSTS.has(window.location.hostname)
      ? `No pude consultar los datos reales. Verifica que la API local esté iniciada y conectada a sisMos2.accdb. (${error.message})`
      : `No pude cargar los datos de demostración. Inicia la API local, ejecuta academic-api/Export-DemoData.ps1 y publica de nuevo el archivo assets/sismos2-demo.json. (${error.message})`;
  }
}

function esConsultaMejorPromedio(pregunta) {
  const texto = normalizarTexto(pregunta);
  return /\b(promedio|media)\b/.test(texto) && /\b(mas alto|mayor|mejor|maximo)\b/.test(texto);
}

async function responderMejorPromedio(mensaje) {
  try {
    let students;
    if (LOCAL_ASSISTANT_HOSTS.has(window.location.hostname)) {
      const rosterResponse = await fetch(`${ASSISTANT_API_BASE}/alumnos`);
      if (!rosterResponse.ok) throw new Error(`Error HTTP ${rosterResponse.status}`);
      const roster = await rosterResponse.json();
      students = await Promise.all(roster.map(async student => {
        const name = `${student.nombres} ${student.apellidos}`.trim();
        const response = await fetch(`${ASSISTANT_API_BASE}/alumnos/estadisticas?nombre=${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error(`No se pudieron consultar las notas de ${name}`);
        return response.json();
      }));
    } else {
      const response = await fetch(new URL('assets/sismos2-demo.json', window.location.href));
      if (!response.ok) throw new Error('No se pudo cargar el archivo de datos publicado.');
      students = await response.json();
    }

    const gradedStudents = students.filter(student => typeof student.promedio === 'number');
    if (!gradedStudents.length) {
      mensaje.querySelector('p').textContent = 'No hay promedios registrados para comparar.';
      return;
    }

    const highestAverage = Math.max(...gradedStudents.map(student => student.promedio));
    const leaders = gradedStudents.filter(student => student.promedio === highestAverage);
    const average = new Intl.NumberFormat('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(highestAverage);
    const names = leaders.map(student => `${student.alumno} (${student.calificaciones} ${student.calificaciones === 1 ? 'calificación' : 'calificaciones'})`).join('; ');
    mensaje.querySelector('p').textContent = `El promedio más alto es ${average}: ${names}.`;
  } catch (error) {
    mensaje.querySelector('p').textContent = `No pude comparar los promedios. Verifica la conexión a los datos. (${error.message})`;
  }
}

async function responderPregunta(pregunta) {
  agregarMensaje(pregunta, 'user');
  if (esConsultaMejorPromedio(pregunta)) {
    const mensaje = agregarMensaje('Comparando los promedios registrados...', 'bot');
    await responderMejorPromedio(mensaje);
    return;
  }
  const consulta = detectarConsultaAlumno(pregunta);
  if (!consulta) {
    agregarMensaje(procesarPregunta(pregunta), 'bot');
    return;
  }
  const mensaje = agregarMensaje('Consultando los registros académicos...', 'bot');
  await responderConsultaAlumno(consulta, mensaje);
}

function initAssistantChat() {
  const form = document.getElementById('assistantForm');
  if (form.dataset.ready === 'true') return;
  form.dataset.ready = 'true';

  const input = document.getElementById('assistantQuestion');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const pregunta = input.value.trim();
    if (!pregunta) return;
    responderPregunta(pregunta);
    input.value = '';
    input.focus();
  });

  document.querySelectorAll('.assistant-suggestions [data-question]').forEach(button => {
    button.addEventListener('click', () => responderPregunta(button.dataset.question));
  });

  document.getElementById('assistantClear').addEventListener('click', () => {
    document.getElementById('assistantMessages').replaceChildren();
    agregarMensaje('Conversación limpia. Pregúntame sobre las tablas, consultas, relaciones y formularios de sisMos2.', 'bot');
    input.focus();
  });
}
