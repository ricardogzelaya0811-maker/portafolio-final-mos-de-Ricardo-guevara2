$ErrorActionPreference = 'Stop'

$apiBase = 'http://localhost:5080/api'
$students = @(Invoke-RestMethod "$apiBase/alumnos")
$records = @(
    foreach ($student in $students) {
        $fullName = "$($student.nombres) $($student.apellidos)".Trim()
        $encodedName = [System.Uri]::EscapeDataString($fullName)
        $stats = Invoke-RestMethod "$apiBase/alumnos/estadisticas?nombre=$encodedName"

        [PSCustomObject]@{
            idAlumno = $stats.idAlumno
            alumno = $stats.alumno
            promedio = $stats.promedio
            calificaciones = $stats.calificaciones
            faltas = $stats.faltas
            totalAsistencias = $stats.totalAsistencias
            estadoAsistencia = $stats.estadoAsistencia
        }
    }
)

$outputPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\assets\sismos2-demo.json'))
$json = ConvertTo-Json -InputObject $records -Depth 4
Set-Content -Path $outputPath -Value $json -Encoding UTF8
Write-Host "Exportados $($records.Count) alumnos a $outputPath"