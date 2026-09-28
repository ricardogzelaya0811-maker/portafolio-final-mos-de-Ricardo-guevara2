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
    pregunta: "¿MOSBOT puede mostrar datos personales o notas de un alumno?",
    keywords: ["datos personales", "registro individual", "nombre completo alumno", "nota de un alumno", "buscar alumno", "mostrar alumno"],
    respuesta: "No. Este chat responde preguntas sobre la estructura y el funcionamiento de sisMos2; no se conecta a la base ni consulta nombres, notas u otros registros personales."
  },
  {
    categoria: "MOSBOT",
    pregunta: "¿Qué es MOSBOT?",
    keywords: ["mosbot", "asistente", "bot", "quien"],
    respuesta: "¡Hola! Soy MOSBOT, tu asistente de conocimiento para resolver preguntas sobre tablas, consultas, formularios y relaciones de sisMos2.accdb."
  }
];

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
  const preguntaNormalizada = normalizarTexto(pregunta);
  const solicitaRegistro = /\b(mostrar|muestrame|ver|consultar|buscar|dime|dame|ensena|obtener)\b/.test(preguntaNormalizada);
  const mencionaDatosPersonales = /\b(alumno|estudiante|persona|nombre|dato|registro|nota|notas|calificacion|calificaciones)\b/.test(preguntaNormalizada);
  if (solicitaRegistro && mencionaDatosPersonales) {
    return "Este MOSBOT no se conecta a los registros de sisMos2 ni puede mostrar nombres o calificaciones individuales. Sí puedo explicarte qué tablas y consultas utiliza el sistema.";
  }

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
}

function responderPregunta(pregunta) {
  agregarMensaje(pregunta, 'user');
  agregarMensaje(procesarPregunta(pregunta), 'bot');
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
