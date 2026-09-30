namespace AcademicApi.Contracts;

/// <summary>Promedio de calificaciones y asistencia registrada para un alumno.</summary>
public sealed record StudentAcademicStatsResponse(
    int IdAlumno,
    string Alumno,
    int? Faltas,
    int TotalAsistencias,
    decimal? Promedio,
    int Calificaciones,
    string EstadoAsistencia);

/// <summary>Identifica un alumno cuando el nombre de búsqueda coincide con más de uno.</summary>
public sealed record StudentCandidateResponse(int IdAlumno, string NombreCompleto);

/// <summary>Lista de coincidencias que permite precisar el alumno buscado.</summary>
public sealed record StudentCandidatesResponse(IReadOnlyList<StudentCandidateResponse> Coincidencias);

/// <summary>Error legible devuelto por la API académica.</summary>
public sealed record ApiErrorResponse(string Error);
