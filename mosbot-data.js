// MOSBOT Academy - Mission Data
const MOSBOT_MISSIONS = [
  // ── TABLES IN WORD MISSIONS (10) ──
  {id:'wd11',type:'word',title:'Fórmulas Básicas',desc:'Suma, resta, multiplicación y división en Excel.',
   q:'¿Cómo insertas una tabla básica en Word?',opts:['Insertar > Tabla','Inicio > Tabla','Diseño > Tabla','Referencias > Tabla'],ans:0},
  {id:'wd12',type:'word',title:'BUSCARV (VLOOKUP)',desc:'Búsqueda vertical en tablas de datos.',
   q:'¿Qué opción permite combinar celdas dentro de una tabla en Word?',opts:['Clic derecho > Combinar celdas','Inicio > Combinar','Insertar > Combinar','Diseño > Combinar'],ans:1},
  {id:'wd13',type:'word',title:'SUMAR.SI (SUMIF)',desc:'Suma condicional de rangos.',
   q:'¿Cómo se aplica un estilo de tabla predefinido en Word?',opts:['Seleccionar tabla > Diseño > Estilos de tabla','Insertar > Estilo','Inicio > Formato','Referencias > Estilos'],ans:2},
  {id:'wd14',type:'word',title:'Formato Condicional',desc:'Resaltar celdas según reglas.',
   q:'¿Dónde se encuentra la opción para ajustar automáticamente el ancho de columna en una tabla de Word?',opts:['Diseño de tabla > Ajustar ancho automático','Inicio > Tamaño','Insertar > Ajustar','Vista > Ajustar'],ans:3},
  {id:'wd15',type:'word',title:'Tablas Dinámicas',desc:'Análisis y resumen de grandes volúmenes de datos.',
   q:'¿Qué función permite distribuir uniformemente el ancho de las columnas en una tabla de Word?',opts:['Distribuir columnas','Ajustar contenido','Combinar columnas','Ordenar'],ans:0},
  {id:'wd16',type:'word',title:'Gráficos en Excel',desc:'Visualización de datos con gráficos.',
   q:'¿Cómo conviertes texto separado por tabulaciones en una tabla en Word?',opts:['Insertar > Tabla > Convertir texto a tabla','Inicio > Convertir','Diseño > Texto a tabla','Referencias > Texto a tabla'],ans:1},
  {id:'wd17',type:'word',title:'Función SI (IF)',desc:'Evalúa condiciones lógicas.',
   q:'¿Qué comando se usa para dividir una celda en varias en una tabla de Word?',opts:['Diseño > Dividir celdas','Insertar > Dividir','Inicio > Dividir','Referencias > Dividir'],ans:2},
  {id:'wd18',type:'word',title:'CONTAR.SI (COUNTIF)',desc:'Cuenta celdas que cumplen un criterio.',
   q:'¿Cómo se repite la fila de encabezado de una tabla al pasar de página en Word?',opts:['Propiedades de tabla > Repetir fila de encabezado','Insertar > Repetir encabezado','Diseño > Página > Repetir','Inicio > Repetir'],ans:3},
  {id:'wd19',type:'word',title:'Validación de Datos',desc:'Restringir entradas en celdas.',
   q:'¿Dónde accedes a las propiedades de tabla para ajustar márgenes y alineación en Word?',opts:['Clic derecho > Propiedades de tabla','Pestaña Inicio','Pestaña Insertar','Pestaña Revisar'],ans:0},
  {id:'wd20',type:'word',title:'Proteger Hojas',desc:'Seguridad y protección de hojas de cálculo.',
   q:'¿Cómo se protege o restringe la edición de una tabla dentro de un documento Word?',opts:['Revisar > Restringir edición','Archivo > Proteger documento','Inicio > Proteger','Vista > Proteger'],ans:1},
  // ── WORD MISSIONS (10) ──
  {id:'wd1',type:'word',title:'Formato de Texto',desc:'Negrita, cursiva, subrayado y estilos.',
    q:'¿Cómo insertas una fila encima de la fila seleccionada en una tabla de Word?',opts:['Ctrl+B','Ctrl+N','Ctrl+G','Ctrl+A'],ans:2},
  {id:'wd2',type:'word',title:'Estilos y Temas',desc:'Aplicar estilos predefinidos a documentos.',
    q:'¿Cómo aplicas sombreado o color de fondo a una celda o fila de tabla en Word?',opts:['Pestaña Inicio > Estilos','Pestaña Diseño','Pestaña Insertar','Pestaña Referencias'],ans:3},
  {id:'wd3',type:'word',title:'Tablas en Word',desc:'Crear y formatear tablas profesionales.',
    q:'¿Cuál es la forma más rápida de seleccionar una tabla completa en Word?',opts:['Insertar > Tabla','Inicio > Tabla','Diseño > Tabla','Referencias > Tabla'],ans:0},
  {id:'wd4',type:'word',title:'Encabezados y Pies',desc:'Configurar encabezados y pies de página.',
    q:'¿Cómo conviertes una tabla en texto en Word?',opts:['Insertar > Encabezado','Inicio > Encabezado','Diseño > Encabezado','Vista > Encabezado'],ans:1},
  {id:'wd5',type:'word',title:'Saltos de Página',desc:'Controlar la paginación del documento.',
    q:'¿Qué opción permite ordenar las filas de una tabla por una columna en Word?',opts:['Ctrl+Enter','Ctrl+Shift+Enter','Alt+Enter','Ctrl+P'],ans:2},
  {id:'wd6',type:'word',title:'Listas y Viñetas',desc:'Organizar información con listas.',
    q:'¿Cómo ajustas la distribución vertical del texto dentro de las celdas de una tabla?',opts:['Inicio > Párrafo > Lista multinivel','Insertar > Lista','Diseño > Lista','Referencias > Lista'],ans:3},
  {id:'wd7',type:'word',title:'Imágenes e Ilustraciones',desc:'Insertar y formatear elementos gráficos.',
    q:'¿Cómo anclas una imagen dentro de una celda de tabla para que se mueva con la celda?',opts:['Insertar > Imágenes','Inicio > Imágenes','Diseño > Imágenes','Vista > Imágenes'],ans:0},
  {id:'wd8',type:'word',title:'Comentarios y Revisión',desc:'Colaborar con comentarios en documentos.',
    q:'¿Cómo agregas un comentario a una celda específica de una tabla en Word?',opts:['Revisar > Nuevo comentario','Insertar > Comentario','Inicio > Comentario','Vista > Comentario'],ans:1},
  {id:'wd9',type:'word',title:'Tabla de Contenido',desc:'Generar tabla de contenido automática.',
    q:'¿Qué opción permite repetir automáticamente la fila de encabezado de una tabla en cada nueva página?',opts:['Referencias > Tabla de contenido','Insertar > Tabla de contenido','Inicio > Índice','Diseño > Contenido'],ans:2},
  {id:'wd10',type:'word',title:'Combinar Correspondencia',desc:'Crear documentos personalizados en masa.',
    q:'¿Cómo insertas una fórmula simple (por ejemplo, suma) dentro de una celda de tabla en Word?',opts:['Correspondencia','Insertar','Inicio','Revisar'],ans:3}
];

const MOSBOT_RANKS = [
  {name:'Practicante MOS',minXP:0,icon:'🌱'},
  {name:'Aprendiz Office',minXP:300,icon:'📘'},
  {name:'Técnico Digital',minXP:600,icon:'💻'},
  {name:'Especialista MOS',minXP:1000,icon:'⭐'},
  {name:'Experto Office',minXP:1400,icon:'🏆'},
  {name:'Office Master',minXP:2000,icon:'👑'}
];

const MOSBOT_BADGES = [
  {id:'b1',name:'Primera Misión',desc:'Completa tu primera misión',icon:'🎯',req:1},
  {id:'b2',name:'Racha de 5',desc:'Completa 5 misiones',icon:'🔥',req:5},
  {id:'b3',name:'Excel Warrior',desc:'Completa todas las misiones Excel',icon:'📊',req:'allExcel'},
  {id:'b4',name:'Word Master',desc:'Completa todas las misiones Word',icon:'📝',req:'allWord'},
  {id:'b5',name:'Medio Camino',desc:'Completa 10 misiones',icon:'⚡',req:10},
  {id:'b6',name:'Casi Perfecto',desc:'Completa 15 misiones',icon:'💎',req:15},
  {id:'b7',name:'Graduado MOS',desc:'Completa las 20 misiones',icon:'🎓',req:20},
  {id:'b8',name:'Velocista',desc:'Completa 3 misiones seguidas correctas',icon:'⚡',req:'streak3'}
];
