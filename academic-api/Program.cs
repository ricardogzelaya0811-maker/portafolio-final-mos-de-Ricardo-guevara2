using System.Data;
using System.Data.OleDb;
using System.Globalization;
using AcademicApi.Services;

var builder = WebApplication.CreateBuilder(args);
var frontendOrigin = builder.Configuration["FRONTEND_ORIGIN"] ?? "http://localhost:5500";
var databasePath = builder.Configuration["ACCESS_DB_PATH"] ??
    Path.Combine(builder.Environment.ContentRootPath, "..", "sisMos2.accdb");
var provider = builder.Configuration["ACCESS_PROVIDER"] ?? "Microsoft.ACE.OLEDB.16.0";
var maximumGrade = decimal.TryParse(builder.Configuration["MAX_GRADE"], CultureInfo.InvariantCulture, out var configuredMaximum)
    ? configuredMaximum
    : 100m;

builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(frontendOrigin).AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddScoped<IAcademicAnalyticsService, AcademicAnalyticsService>();

var app = builder.Build();
app.UseCors();

string ConnectionString()
{
    if (string.IsNullOrWhiteSpace(databasePath))
        throw new InvalidOperationException("Configura ACCESS_DB_PATH con la ruta del archivo .accdb o .mdb.");

    var connection = new OleDbConnectionStringBuilder
    {
        Provider = provider,
        DataSource = Path.GetFullPath(databasePath)
    };
    return connection.ConnectionString;
}

async Task<OleDbConnection> OpenConnection()
{
    var connection = new OleDbConnection(ConnectionString());
    await connection.OpenAsync();
    return connection;
}

static async Task<List<Dictionary<string, object?>>> ReadRows(OleDbCommand command)
{
    using var reader = await command.ExecuteReaderAsync();
    var rows = new List<Dictionary<string, object?>>();
    while (await reader.ReadAsync())
    {
        var row = new Dictionary<string, object?>();
        for (var index = 0; index < reader.FieldCount; index++)
        {
            var name = reader.GetName(index);
            var key = name.StartsWith("ID", StringComparison.OrdinalIgnoreCase)
                ? "id" + name[2..]
                : char.ToLowerInvariant(name[0]) + name[1..];
            row[key] = await reader.IsDBNullAsync(index) ? null : reader.GetValue(index);
        }
        rows.Add(row);
    }
    return rows;
}

static void AddInteger(OleDbCommand command, int value) => command.Parameters.Add("?", OleDbType.Integer).Value = value;

app.MapGet("/api/health", async () =>
{
    try
    {
        await using var connection = await OpenConnection();
        return Results.Ok(new { status = "ok" });
    }
    catch (Exception exception)
    {
        return Results.Problem(title: "No se pudo conectar con Access", detail: exception.Message, statusCode: 503);
    }
});

app.MapGet("/api/catalogos", async () =>
{
    await using var connection = await OpenConnection();
    async Task<List<Dictionary<string, object?>>> ReadCatalog(string sql)
    {
        using var command = new OleDbCommand(sql, connection);
        return await ReadRows(command);
    }

    var grados = await ReadCatalog("SELECT IDGrado, NombreGrado FROM tblGrados ORDER BY NombreGrado");
    var materias = await ReadCatalog("SELECT IDMateria, NombreMateria FROM tblMaterias ORDER BY NombreMateria");
    var periodos = await ReadCatalog("SELECT IDPeriodo, NombrePeriodo FROM tblPeriodos ORDER BY NombrePeriodo");
    return Results.Ok(new { grados, materias, periodos });
});

app.MapGet("/api/alumnos", async () =>
{
    await using var connection = await OpenConnection();
    using var command = new OleDbCommand(
        "SELECT IDAlumno, Nombres, Apellidos FROM tblAlumnos ORDER BY Apellidos, Nombres", connection);
    return Results.Ok(await ReadRows(command));
});

app.MapGet("/api/alumnos/estadisticas", async Task<Results<
    Ok<StudentAcademicStatsResponse>,
    BadRequest<ApiErrorResponse>,
    NotFound<ApiErrorResponse>,
    Conflict<StudentCandidatesResponse>>> (
        string? nombre,
        IAcademicAnalyticsService analytics,
        CancellationToken cancellationToken) =>
{
    if (string.IsNullOrWhiteSpace(nombre) || nombre.Trim().Length < 3)
        return TypedResults.BadRequest(new ApiErrorResponse("Escribe al menos 3 caracteres del nombre del alumno."));

    var result = await analytics.GetStudentStatsAsync(nombre.Trim(), cancellationToken);
    if (result.Kind == StudentStatsLookupKind.NotFound)
        return TypedResults.NotFound(new ApiErrorResponse("No encontré un alumno con ese nombre."));
    if (result.Kind == StudentStatsLookupKind.Ambiguous)
        return TypedResults.Conflict(new StudentCandidatesResponse(result.Candidates));

    return TypedResults.Ok(result.Statistics!);
})
    .WithName("GetStudentAcademicStats")
    .WithSummary("Consultar promedio y faltas registradas de un alumno")
    .WithDescription("Busca un alumno por nombre y devuelve el promedio de calificaciones y el conteo de estados de asistencia clasificados como falta.");

app.MapGet("/api/calificaciones", async (HttpRequest request) =>
{
    await using var connection = await OpenConnection();
    var sql = "SELECT C.IDCalificacion, A.IDAlumno, A.Nombres, A.Apellidos, G.IDGrado, G.NombreGrado, " +
              "M.IDMateria, M.NombreMateria, P.IDPeriodo, P.NombrePeriodo, C.Nota, C.FechaRegistro " +
              "FROM (((tblCalificaciones AS C INNER JOIN tblAlumnos AS A ON C.IDAlumno = A.IDAlumno) " +
              "INNER JOIN tblGrados AS G ON A.IDGrado = G.IDGrado) " +
              "INNER JOIN tblMaterias AS M ON C.IDMateria = M.IDMateria) " +
              "INNER JOIN tblPeriodos AS P ON C.Periodo = P.IDPeriodo";
    var filters = new List<string>();
    using var command = new OleDbCommand { Connection = connection };

    if (int.TryParse(request.Query["gradoId"], out var gradeId))
    {
        filters.Add("G.IDGrado = ?");
        AddInteger(command, gradeId);
    }
    if (int.TryParse(request.Query["materiaId"], out var subjectId))
    {
        filters.Add("M.IDMateria = ?");
        AddInteger(command, subjectId);
    }
    if (int.TryParse(request.Query["periodoId"], out var periodId))
    {
        filters.Add("P.IDPeriodo = ?");
        AddInteger(command, periodId);
    }
    var student = request.Query["alumno"].ToString().Trim();
    if (student.Length > 0)
    {
        filters.Add("(A.Nombres LIKE ? OR A.Apellidos LIKE ?)");
        command.Parameters.Add("?", OleDbType.VarWChar, 255).Value = $"*{student}*";
        command.Parameters.Add("?", OleDbType.VarWChar, 255).Value = $"*{student}*";
    }

    if (filters.Count > 0) sql += " WHERE " + string.Join(" AND ", filters);
    sql += " ORDER BY A.Apellidos, A.Nombres, M.NombreMateria, P.NombrePeriodo";
    command.CommandText = sql;
    return Results.Ok(await ReadRows(command));
});

app.MapPost("/api/notas", async (GradeInput input) =>
{
    var error = Validate(input, maximumGrade);
    if (error is not null) return Results.BadRequest(new { error });

    await using var connection = await OpenConnection();
    using var command = new OleDbCommand(
        "INSERT INTO tblCalificaciones (IDAlumno, IDMateria, Periodo, Nota, FechaRegistro) VALUES (?, ?, ?, ?, ?)",
        connection);
    AddInteger(command, input.IdAlumno);
    AddInteger(command, input.IdMateria);
    AddInteger(command, input.IdPeriodo);
    command.Parameters.Add("?", OleDbType.Double).Value = (double)input.Nota;
    command.Parameters.Add("?", OleDbType.Date).Value = input.FechaRegistro;
    await command.ExecuteNonQueryAsync();
    return Results.Created("/api/calificaciones", new { message = "Calificación registrada." });
});

app.MapPut("/api/notas/{id:int}", async (int id, GradeInput input) =>
{
    var error = Validate(input, maximumGrade);
    if (error is not null) return Results.BadRequest(new { error });

    await using var connection = await OpenConnection();
    using var command = new OleDbCommand(
        "UPDATE tblCalificaciones SET IDAlumno = ?, IDMateria = ?, Periodo = ?, Nota = ?, FechaRegistro = ? WHERE IDCalificacion = ?",
        connection);
    AddInteger(command, input.IdAlumno);
    AddInteger(command, input.IdMateria);
    AddInteger(command, input.IdPeriodo);
    command.Parameters.Add("?", OleDbType.Double).Value = (double)input.Nota;
    command.Parameters.Add("?", OleDbType.Date).Value = input.FechaRegistro;
    AddInteger(command, id);
    return await command.ExecuteNonQueryAsync() == 0
        ? Results.NotFound(new { error = "No existe esa calificación." })
        : Results.Ok(new { message = "Calificación actualizada." });
});

string? Validate(GradeInput input, decimal max) =>
    input.IdAlumno <= 0 || input.IdMateria <= 0 || input.IdPeriodo <= 0
        ? "Selecciona un alumno, una materia y un período válidos."
        : input.Nota < 0 || input.Nota > max
            ? $"La nota debe estar entre 0 y {max}."
            : input.FechaRegistro == default
                ? "La fecha de registro es obligatoria."
                : null;

app.Run("http://localhost:5080");

public sealed record GradeInput(int IdAlumno, int IdMateria, int IdPeriodo, decimal Nota, DateTime FechaRegistro);
