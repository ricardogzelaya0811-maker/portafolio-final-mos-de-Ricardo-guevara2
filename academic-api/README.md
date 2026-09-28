# Academic Access API

API local para conectar la vista del portafolio con una base Microsoft Access. El servidor solo escucha en `localhost:5080`; no publiques este API en Internet. Para producción se necesita autenticación y una política de autorización real antes de habilitar escrituras.

## Requisitos

- Windows y .NET 8 SDK.
- Microsoft Access Database Engine (ACE) instalado con la misma arquitectura (x64/x86) que el proceso .NET.
- Una ruta local al archivo `.accdb` o `.mdb`.

## Configuración e inicio

Desde PowerShell, en la carpeta `academic-api`:

```powershell
$env:ACCESS_DB_PATH = 'C:\ruta\sistema-escolar.accdb'
$env:ACCESS_PROVIDER = 'Microsoft.ACE.OLEDB.16.0'
$env:FRONTEND_ORIGIN = 'http://localhost:5500'
$env:MAX_GRADE = '100'
dotnet run
```

El `FRONTEND_ORIGIN` debe coincidir con el origen del servidor estático (por ejemplo, Live Server). No abras el HTML con `file://` para usar la API. La vista web tiene como URL base `http://localhost:5080/api`; puede cambiarse antes de cargar `academic-portal.js` mediante `window.ACADEMIC_API_BASE`.

## Endpoints

- `GET /api/health`: comprueba la conexión OLE DB.
- `GET /api/catalogos`: devuelve grados, materias y períodos.
- `GET /api/alumnos`: devuelve `IDAlumno`, `Nombres` y `Apellidos`.
- `GET /api/calificaciones?alumno=&gradoId=&materiaId=&periodoId=`: consulta `qryHistorialNotas`.
- `POST /api/notas`: inserta en `tblCalificaciones`.
- `PUT /api/notas/{id}`: actualiza una fila por `IDCalificacion`.

## Contrato asumido para Access

La información compartida confirma algunos campos, pero todavía no confirma todos los nombres físicos ni el tipo de nota. Este primer mapeo espera:

- `tblGrados`: `IDGrado`, `NombreGrado`.
- `tblMaterias`: `IDMateria`, `NombreMateria`.
- `tblPeriodos`: `IDPeriodo`, `NombrePeriodo`.
- `tblAlumnos`: `IDAlumno`, `Nombres`, `Apellidos`.
- `tblCalificaciones`: `IDCalificacion`, `IDAlumno`, `IDMateria`, `IDPeriodo`, `Nota`, `FechaRegistro`.
- `qryHistorialNotas` expone las columnas `IDCalificacion`, `IDAlumno`, `Nombres`, `Apellidos`, `IDGrado`, `NombreGrado`, `IDMateria`, `NombreMateria`, `IDPeriodo`, `NombrePeriodo`, `Nota`, `FechaRegistro`.

OLE DB usa parámetros posicionales (`?`). El filtro de nombre usa comodines Access `*`. Si la consulta guardada usa alias diferentes, actualiza el `SELECT` del endpoint o ajusta la consulta guardada para exponer esos alias. La escala de calificación se configura con `MAX_GRADE` (por defecto 100).

El POST siempre crea un registro; el PUT actualiza el `IDCalificacion` seleccionado. Esta API no intenta deduplicar notas porque la regla de unicidad por alumno/materia/período no está especificada.
