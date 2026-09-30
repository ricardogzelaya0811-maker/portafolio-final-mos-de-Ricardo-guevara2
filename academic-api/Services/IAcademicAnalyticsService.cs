using AcademicApi.Contracts;

namespace AcademicApi.Services;

internal interface IAcademicAnalyticsService
{
    Task<StudentStatsLookupResult> GetStudentStatsAsync(string name, CancellationToken cancellationToken);
}

internal enum StudentStatsLookupKind
{
    Found,
    NotFound,
    Ambiguous
}

internal sealed record StudentStatsLookupResult(
    StudentStatsLookupKind Kind,
    StudentAcademicStatsResponse? Statistics,
    IReadOnlyList<StudentCandidateResponse> Candidates);
