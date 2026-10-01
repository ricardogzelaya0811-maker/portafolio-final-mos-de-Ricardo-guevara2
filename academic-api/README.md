# Academic Access API

API local para conectar la vista del portafolio con una base Microsoft Access. El servidor solo escucha en `localhost:5080`; no publiques este API en Internet sin autenticación y una política de autorización real.

## Requisitos

- Windows y .NET 8 SDK.
- Microsoft Access Database Engine (ACE) instalado con la misma arquitectura (x64/x86) que el proceso .NET.
- Una ruta local al archivo `.accdb` o `.mdb`.

## Configuración e inicio

Desde PowerShell, en la carpeta `academic-api`. Si `sisMos2.accdb` está en la raíz del proyecto, el API lo detecta automáticamente:

```powershell
dotnet run
```

Para usar otra ubicación, define `$env:ACCESS_DB_PATH` antes de `dotnet run`. Se requiere Microsoft Access Database Engine ACE con la misma arquitectura (x64/x86) que el proceso .NET.

El `FRONTEND_ORIGIN` predeterminado es `http://localhost:5500`; CORS también permite orígenes loopback como Live Server en otro puerto. No abras el HTML con `file://` para usar el API.

## Publicar datos de demostración en GitHub Pages

GitHub Pages no puede conectarse al archivo Access de tu computadora. Para la demo, inicia el API local y ejecuta desde PowerShell, en la raíz del proyecto:

```powershell
.\academic-api\Export-DemoData.ps1
```

El script genera `assets/sismos2-demo.json` con promedios y estadísticas de asistencia, no copia el archivo `.accdb`. Publica ese JSON junto con los archivos del sitio. GitHub Pages responderá usando esa copia; si cambian los datos de Access, vuelve a exportar y publicar el JSON. No es una conexión en tiempo real.

## Endpoints

- `GET /api/health`: comprueba la conexión OLE DB.
- `GET /api/catalogos`: devuelve grados, materias y períodos.
- `GET /api/alumnos`: devuelve `IDAlumno`, `Nombres` y `Apellidos`.
- `GET /api/alumnos/estadisticas?nombre=Ana%20Lopez`: devuelve promedio y faltas registradas para una coincidencia única. Ante nombres ambiguos devuelve las coincidencias para que se pueda precisar el alumno.
- `GET /api/calificaciones?alumno=&gradoId=&materiaId=&periodoId=`: consulta el historial de notas.
- `POST /api/notas`: inserta en `tblCalificaciones`.
- `PUT /api/notas/{id}`: actualiza una fila por `IDCalificacion`.

## Contrato Access verificado

El esquema de `sisMos2.accdb` confirma:

- `tblGrados`: `IDGrado`, `NombreGrado`.
- `tblMaterias`: `IDMateria`, `NombreMateria`.
- `tblPeriodos`: `IDPeriodo`, `NombrePeriodo`.
- `tblAlumnos`: `IDAlumno`, `Nombres`, `Apellidos`.
- `tblCalificaciones`: `IDCalificacion`, `IDAlumno`, `IDMateria`, `Periodo`, `Nota`, `FechaRegistro`.
- `tblAsistencia`: `IDAsistencia`, `IDMatricula`, `Estado`, `Fecha`, `Observacion`.
- `qryHistorialNotas` expone `IDAlumno`, `Nombres`, `Apellidos`, `NombreGrado`, `NombreMateria`, `Periodo`, `Nota` y `FechaRegistro`.
- `tblCalificaciones.Periodo` se relaciona con `tblPeriodos.IDPeriodo`; `tblAsistencia.IDMatricula` se conecta con el alumno mediante `tblMatriculas`.

El promedio es la media aritmética de todas las notas no nulas del alumno. Las faltas se cuentan desde `tblAsistencia`, siguiendo la relación de matrícula. `ABSENCE_STATES` acepta etiquetas separadas por coma; por defecto reconoce `FALTA`, `AUSENTE`, `INASISTENCIA`, `INASISTENTE` y `NO ASISTIO`. Si la base usa otra etiqueta, agrega su valor exacto a esa variable. Cuando hay asistencias pero ninguna etiqueta reconocible, la API devuelve faltas sin clasificar en vez de reportar cero. OLE DB usa parámetros posicionales (`?`). La escala se configura con `MAX_GRADE` (por defecto 100).

El POST siempre crea un registro; el PUT actualiza el `IDCalificacion` seleccionado. Esta API no intenta deduplicar notas porque la regla de unicidad por alumno/materia/período no está especificada.
