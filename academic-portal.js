(() => {
  const API_BASE = (window.ACADEMIC_API_BASE || 'http://localhost:5080/api').replace(/\/$/, '');
  let initialized = false;
  let handlersAttached = false;
  let editingGradeId = null;
  let students = [];
  let subjects = [];
  let periods = [];

  const byId = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || `Error HTTP ${response.status}`);
    return payload;
  }

  function setStatus(message, state = '') {
    const status = byId('academicStatus');
    status.textContent = message;
    status.className = `academic-status ${state}`.trim();
  }

  function fillSelect(id, rows, valueKey, labelKey, placeholder) {
    const select = byId(id);
    select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>` + rows.map(row =>
      `<option value="${escapeHtml(row[valueKey])}">${escapeHtml(row[labelKey])}</option>`
    ).join('');
  }

  function studentName(row) {
    return `${row.nombres || ''} ${row.apellidos || ''}`.trim();
  }

  async function loadCatalogs() {
    const [catalogs, studentRows] = await Promise.all([
      api('/catalogos'),
      api('/alumnos')
    ]);
    students = studentRows;
    subjects = catalogs.materias || [];
    periods = catalogs.periodos || [];
    fillSelect('academicGradeFilter', catalogs.grados || [], 'idGrado', 'nombreGrado', 'Todos los grados');
    fillSelect('academicSubjectFilter', subjects, 'idMateria', 'nombreMateria', 'Todas las materias');
    fillSelect('academicPeriodFilter', periods, 'idPeriodo', 'nombrePeriodo', 'Todos los períodos');
    byId('academicStudentSelect').innerHTML = `<option value="">Selecciona un alumno</option>` + students.map(student =>
      `<option value="${escapeHtml(student.idAlumno)}">${escapeHtml(student.nombreCompleto || studentName(student))}${student.nombreGrado ? ` · ${escapeHtml(student.nombreGrado)}` : ''}</option>`
    ).join('');
  }

  function queryString(values) {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
    return params.toString();
  }

  async function searchGrades(event) {
    event?.preventDefault();
    const query = queryString({
      alumno: byId('academicStudentSearch').value.trim(),
      gradoId: byId('academicGradeFilter').value,
      materiaId: byId('academicSubjectFilter').value,
      periodoId: byId('academicPeriodFilter').value
    });
    const tbody = byId('academicResults');
    tbody.innerHTML = '<tr><td colspan="7" class="academic-empty">Consultando...</td></tr>';
    try {
      const rows = await api(`/calificaciones${query ? `?${query}` : ''}`);
      byId('academicResultCount').textContent = `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'}`;
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="academic-empty">No se encontraron calificaciones con esos filtros.</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(row => `<tr>
        <td>${escapeHtml(row.nombres)} ${escapeHtml(row.apellidos)}</td>
        <td>${escapeHtml(row.nombreGrado)}</td>
        <td>${escapeHtml(row.nombreMateria)}</td>
        <td>${escapeHtml(row.nombrePeriodo)}</td>
        <td><strong>${escapeHtml(row.nota)}</strong></td>
        <td>${escapeHtml(row.fechaRegistro ? String(row.fechaRegistro).slice(0, 10) : '')}</td>
        <td><button class="academic-edit-button" type="button" data-edit-grade="${escapeHtml(row.idCalificacion)}" data-alumno="${escapeHtml(row.idAlumno)}" data-materia="${escapeHtml(row.idMateria)}" data-periodo="${escapeHtml(row.idPeriodo)}" data-nota="${escapeHtml(row.nota)}" data-fecha="${escapeHtml(row.fechaRegistro ? String(row.fechaRegistro).slice(0, 10) : '')}">Editar</button></td>
      </tr>`).join('');
      tbody.querySelectorAll('[data-edit-grade]').forEach(button => button.addEventListener('click', () => beginEdit(button.dataset)));
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7" class="academic-empty">${escapeHtml(error.message)}</td></tr>`;
      byId('academicResultCount').textContent = 'Sin conexión';
      setStatus(`No se pudo consultar la API: ${error.message}. Confirma que el servidor esté iniciado.`, 'error');
    }
  }

  function beginEdit(data) {
    editingGradeId = data.editGrade;
    byId('academicStudentSelect').value = data.alumno;
    byId('academicSubjectSelect').value = data.materia;
    byId('academicPeriodSelect').value = data.periodo;
    byId('academicGradeValue').value = data.nota;
    byId('academicGradeDate').value = data.fecha || new Date().toISOString().slice(0, 10);
    byId('academicEntryTitle').textContent = 'Actualizar nota';
    byId('academicFormMessage').textContent = 'Editando una calificación existente.';
    byId('academicGradeForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function saveGrade(event) {
    event.preventDefault();
    const message = byId('academicFormMessage');
    const button = byId('academicGradeForm').querySelector('button[type="submit"]');
    const payload = {
      idAlumno: Number(byId('academicStudentSelect').value),
      idMateria: Number(byId('academicSubjectSelect').value),
      idPeriodo: Number(byId('academicPeriodSelect').value),
      nota: Number(byId('academicGradeValue').value),
      fechaRegistro: byId('academicGradeDate').value
    };
    button.disabled = true;
    message.className = 'academic-form-message';
    message.textContent = 'Guardando...';
    try {
      await api(editingGradeId ? `/notas/${encodeURIComponent(editingGradeId)}` : '/notas', {
        method: editingGradeId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      message.textContent = editingGradeId ? 'Calificación actualizada.' : 'Calificación registrada.';
      editingGradeId = null;
      byId('academicEntryTitle').textContent = 'Ingresar o actualizar una nota';
      await searchGrades();
    } catch (error) {
      message.className = 'academic-form-message error';
      message.textContent = `No se pudo guardar: ${error.message}`;
    } finally {
      button.disabled = false;
    }
  }

  window.initAcademicModule = async function initAcademicModule() {
    if (initialized) return;
    initialized = true;
    byId('academicGradeDate').value = new Date().toISOString().slice(0, 10);
    if (!handlersAttached) {
      byId('academicSearchForm').addEventListener('submit', searchGrades);
      byId('academicGradeForm').addEventListener('submit', saveGrade);
      handlersAttached = true;
    }
    try {
      await loadCatalogs();
      setStatus(`Conectado · ${students.length} alumnos disponibles.`, 'connected');
      await searchGrades();
    } catch (error) {
      initialized = false;
      setStatus(`API no disponible: ${error.message}. Inicia el backend y vuelve a abrir esta sección.`, 'error');
    }
  };
})();
