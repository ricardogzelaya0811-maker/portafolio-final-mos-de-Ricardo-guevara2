// MOSBOT Academy - Mission Data
const MOSBOT_MISSIONS = [
  // ── EXCEL MISSIONS (10) ──
  {id:'ex1',type:'excel',title:'Fórmulas Básicas',desc:'Suma, resta, multiplicación y división en Excel.',
   q:'¿Cuál fórmula suma el rango A1:A10?',opts:['=SUM(A1:A10)','=ADD(A1:A10)','=TOTAL(A1:A10)','=SUMA.TOTAL(A1:A10)'],ans:0},
  {id:'ex2',type:'excel',title:'BUSCARV (VLOOKUP)',desc:'Búsqueda vertical en tablas de datos.',
   q:'¿Qué hace BUSCARV?',opts:['Busca en la primera columna y retorna valor de otra','Ordena datos','Suma condicional','Cuenta celdas vacías'],ans:0},
  {id:'ex3',type:'excel',title:'SUMAR.SI (SUMIF)',desc:'Suma condicional de rangos.',
   q:'=SUMAR.SI(B:B,"Ventas",C:C) suma valores de C donde B es:',opts:['"Ventas"','Mayor que 0','Cualquier texto','Números pares'],ans:0},
  {id:'ex4',type:'excel',title:'Formato Condicional',desc:'Resaltar celdas según reglas.',
   q:'¿Dónde se encuentra el Formato Condicional?',opts:['Pestaña Inicio > Estilos','Pestaña Insertar','Pestaña Datos','Pestaña Vista'],ans:0},
  {id:'ex5',type:'excel',title:'Tablas Dinámicas',desc:'Análisis y resumen de grandes volúmenes de datos.',
   q:'¿Para qué sirve una Tabla Dinámica?',opts:['Resumir y analizar datos','Solo crear gráficos','Proteger hojas','Imprimir documentos'],ans:0},
  {id:'ex6',type:'excel',title:'Gráficos en Excel',desc:'Visualización de datos con gráficos.',
   q:'¿Desde qué pestaña se insertan gráficos?',opts:['Insertar','Inicio','Datos','Fórmulas'],ans:0},
  {id:'ex7',type:'excel',title:'Función SI (IF)',desc:'Evalúa condiciones lógicas.',
   q:'=SI(A1>10,"Alto","Bajo") retorna "Alto" si A1 es:',opts:['Mayor que 10','Igual a 10','Menor que 10','Cualquier valor'],ans:0},
  {id:'ex8',type:'excel',title:'CONTAR.SI (COUNTIF)',desc:'Cuenta celdas que cumplen un criterio.',
   q:'=CONTAR.SI(A:A,">5") cuenta celdas:',opts:['Con valores mayores a 5','Que contienen el texto ">5"','Vacías','Con exactamente 5'],ans:0},
  {id:'ex9',type:'excel',title:'Validación de Datos',desc:'Restringir entradas en celdas.',
   q:'La validación de datos se encuentra en:',opts:['Pestaña Datos','Pestaña Inicio','Pestaña Revisar','Pestaña Vista'],ans:0},
  {id:'ex10',type:'excel',title:'Proteger Hojas',desc:'Seguridad y protección de hojas de cálculo.',
   q:'¿Qué opción protege una hoja contra ediciones?',opts:['Revisar > Proteger hoja','Archivo > Guardar como','Inicio > Formato','Vista > Nueva ventana'],ans:0},
  // ── WORD MISSIONS (10) ──
  {id:'wd1',type:'word',title:'Formato de Texto',desc:'Negrita, cursiva, subrayado y estilos.',
   q:'¿Cuál es el atajo para Negrita?',opts:['Ctrl+B','Ctrl+N','Ctrl+G','Ctrl+A'],ans:0},
  {id:'wd2',type:'word',title:'Estilos y Temas',desc:'Aplicar estilos predefinidos a documentos.',
   q:'Los Estilos rápidos se encuentran en:',opts:['Pestaña Inicio > Estilos','Pestaña Diseño','Pestaña Insertar','Pestaña Referencias'],ans:0},
  {id:'wd3',type:'word',title:'Tablas en Word',desc:'Crear y formatear tablas profesionales.',
   q:'¿Cómo se inserta una tabla en Word?',opts:['Insertar > Tabla','Inicio > Tabla','Diseño > Tabla','Referencias > Tabla'],ans:0},
  {id:'wd4',type:'word',title:'Encabezados y Pies',desc:'Configurar encabezados y pies de página.',
   q:'¿Desde dónde se editan los encabezados?',opts:['Insertar > Encabezado','Inicio > Encabezado','Diseño > Encabezado','Vista > Encabezado'],ans:0},
  {id:'wd5',type:'word',title:'Saltos de Página',desc:'Controlar la paginación del documento.',
   q:'¿Cuál es el atajo para salto de página?',opts:['Ctrl+Enter','Ctrl+Shift+Enter','Alt+Enter','Ctrl+P'],ans:0},
  {id:'wd6',type:'word',title:'Listas y Viñetas',desc:'Organizar información con listas.',
   q:'Las listas multinivel se encuentran en:',opts:['Inicio > Párrafo > Lista multinivel','Insertar > Lista','Diseño > Lista','Referencias > Lista'],ans:0},
  {id:'wd7',type:'word',title:'Imágenes e Ilustraciones',desc:'Insertar y formatear elementos gráficos.',
   q:'¿Desde dónde se insertan imágenes?',opts:['Insertar > Imágenes','Inicio > Imágenes','Diseño > Imágenes','Vista > Imágenes'],ans:0},
  {id:'wd8',type:'word',title:'Comentarios y Revisión',desc:'Colaborar con comentarios en documentos.',
   q:'¿Cómo se agrega un comentario?',opts:['Revisar > Nuevo comentario','Insertar > Comentario','Inicio > Comentario','Vista > Comentario'],ans:0},
  {id:'wd9',type:'word',title:'Tabla de Contenido',desc:'Generar tabla de contenido automática.',
   q:'La Tabla de Contenido se inserta desde:',opts:['Referencias > Tabla de contenido','Insertar > Tabla de contenido','Inicio > Índice','Diseño > Contenido'],ans:0},
  {id:'wd10',type:'word',title:'Combinar Correspondencia',desc:'Crear documentos personalizados en masa.',
   q:'¿Desde qué pestaña se inicia la combinación?',opts:['Correspondencia','Insertar','Inicio','Revisar'],ans:0}
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
