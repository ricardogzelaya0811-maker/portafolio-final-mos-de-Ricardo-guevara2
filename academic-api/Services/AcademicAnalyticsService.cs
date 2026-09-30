using System.Data;
using System.Data.OleDb;
using System.Globalization;
using System.Text;
using AcademicApi.Contracts;

namespace AcademicApi.Services;

internal sealed class AcademicAnalyticsService(IConfiguration configuration) : IAcademicAnalyticsService
{
    private static readonly string[] DefaultAbsenceStates = ["FALTA", "AUSENTE", "INASISTENCIA", "INASISTENTE", "NO ASISTIO"];
    private static readonly string[] PresentStates = ["PRESENTE", "PRESENT", "ASISTENCIA", "ASISTIO", "TARDE", "TARDANZA", "P"];
    private readonly string[] _absenceStates = (configuration["ABSENCE_STATES"] ?? string.Join(',', DefaultAbsenceStates))
        .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
        .Select(Normalize)
        .ToArray();

    public async Task<StudentStatsLookupResult> GetStudentStatsAsync(string name, CancellationToken cancellationToken)
    {
        await using var connection = CreateConnection();
        await connection.OpenAsync(cancellationToken);

        var students = new List<StudentCandidateResponse>();
        var normalizedQuery = Normalize(name);
        await using (var command = new OleDbCommand(
            "SELECT IDAlumno, Nombres, Apellidos FROM tblAlumnos ORDER BY Apellidos, Nombres", connection))
        await using (var reader = await command.ExecuteReaderAsync(cancellationToken))
        {
            while (await reader.ReadAsync(cancellationToken))
            {
                var firstName = reader["Nombres"] is DBNull ? string.Empty : Convert.ToString(reader["Nombres"], CultureInfo.InvariantCulture) ?? string.Empty;
                var lastName = reader["Apellidos"] is DBNull ? string.Empty : Convert.ToString(reader["Apellidos"], CultureInfo.InvariantCulture) ?? string.Empty;
                var fullName = $"{firstName} {lastName}".Trim();
                if (Normalize(fullName).Contains(normalizedQuery, StringComparison.Ordinal))
                    students.Add(new StudentCandidateResponse(Convert.ToInt32(reader["IDAlumno"], CultureInfo.InvariantCulture), fullName));
            }
        }

        var exactMatches = students.Where(student => Normalize(student.NombreCompleto) == normalizedQuery).ToList();
        var matches = exactMatches.Count > 0 ? exactMatches : students;
        if (matches.Count == 0)
            return new StudentStatsLookupResult(StudentStatsLookupKind.NotFound, null, []);
        if (matches.Count > 1)
            return new StudentStatsLookupResult(StudentStatsLookupKind.Ambiguous, null, matches);

        var studentMatch = matches[0];
        var (absenceCount, attendanceCount, attendanceStatus) = await GetAttendanceAsync(connection, studentMatch.IdAlumno, cancellationToken);
        var (average, gradeCount) = await GetGradeAverageAsync(connection, studentMatch.IdAlumno, cancellationToken);
        var statistics = new StudentAcademicStatsResponse(
            studentMatch.IdAlumno,
            studentMatch.NombreCompleto,
            absenceCount,
            attendanceCount,
            average,
            gradeCount,
            attendanceStatus);
        return new StudentStatsLookupResult(StudentStatsLookupKind.Found, statistics, []);
    }

    private OleDbConnection CreateConnection()
    {
        var databasePath = configuration["ACCESS_DB_PATH"];
        if (string.IsNullOrWhiteSpace(databasePath))
            throw new InvalidOperationException("Configura ACCESS_DB_PATH con la ruta del archivo de Access.");

        var connectionString = new OleDbConnectionStringBuilder
        {
            Provider = configuration["ACCESS_PROVIDER"] ?? "Microsoft.ACE.OLEDB.16.0",
            DataSource = Path.GetFullPath(databasePath)
        };
        connectionString["Mode"] = "Read";
        return new OleDbConnection(connectionString.ConnectionString);
    }

    private async Task<(int? Absences, int Total, string Status)> GetAttendanceAsync(
        OleDbConnection connection,
        int studentId,
        CancellationToken cancellationToken)
    {
        const string sql = "SELECT A.Estado, COUNT(*) AS Total FROM tblAsistencia AS A " +
                           "INNER JOIN tblMatriculas AS M ON A.IDMatricula = M.IDMatricula " +
                           "WHERE M.IDAlumno = ? GROUP BY A.Estado";
        using var command = new OleDbCommand(sql, connection);
        command.Parameters.Add("?", OleDbType.Integer).Value = studentId;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var total = 0;
        var absences = 0;
        var hasRecognizedStatus = false;

        while (await reader.ReadAsync(cancellationToken))
        {
            var state = reader["Estado"] is DBNull ? string.Empty : Convert.ToString(reader["Estado"], CultureInfo.InvariantCulture) ?? string.Empty;
            var count = Convert.ToInt32(reader["Total"], CultureInfo.InvariantCulture);
            total += count;
            if (IsAbsenceState(state))
            {
                absences += count;
                hasRecognizedStatus = true;
            }
            else if (PresentStates.Contains(Normalize(state), StringComparer.Ordinal))
            {
                hasRecognizedStatus = true;
            }
        }

        if (total == 0) return (0, 0, "sin-registros");
        return hasRecognizedStatus
            ? (absences, total, "ok")
            : (null, total, "sin-clasificar");
    }

    private static async Task<(decimal? Average, int Count)> GetGradeAverageAsync(
        OleDbConnection connection,
        int studentId,
        CancellationToken cancellationToken)
    {
        using var command = new OleDbCommand(
            "SELECT AVG(Nota) AS Promedio, COUNT(Nota) AS Total FROM tblCalificaciones WHERE IDAlumno = ?",
            connection);
        command.Parameters.Add("?", OleDbType.Integer).Value = studentId;
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken)) return (null, 0);

        var count = Convert.ToInt32(reader["Total"], CultureInfo.InvariantCulture);
        var average = reader["Promedio"] is DBNull
            ? null
            : Math.Round(Convert.ToDecimal(reader["Promedio"], CultureInfo.InvariantCulture), 2);
        return (average, count);
    }

    private bool IsAbsenceState(string state)
    {
        var normalized = Normalize(state);
        return _absenceStates.Contains(normalized, StringComparer.Ordinal)
            || normalized.StartsWith("falta", StringComparison.Ordinal)
            || normalized.StartsWith("ausent", StringComparison.Ordinal)
            || normalized.StartsWith("inasist", StringComparison.Ordinal)
            || normalized == "no asistio";
    }

    private static string Normalize(string value)
    {
        var decomposed = value.Normalize(NormalizationForm.FormD);
        var withoutMarks = new string(decomposed
            .Where(character => CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            .ToArray());
        return string.Join(' ', withoutMarks.Trim().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)).ToUpperInvariant();
    }
}
