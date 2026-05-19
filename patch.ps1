# Script de PowerShell inteligente para aplicar parches sin importar los fines de línea (CRLF/LF)
$path = "c:\Users\ricar\OneDrive\Desktop\portafolio final MOS\index.html"
$content = [System.IO.File]::ReadAllText($path)

# Normalizar fines de línea del archivo a LF para comparación exacta
$content = $content -replace "`r`n", "`n"

# 1. Parchear sbScript.onload
$target2 = @'
sbScript.onload = () => {
  try {
    if (window.supabase) supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log("Supabase cargado exitosamente.");
  } catch(e) { console.error('Supabase error', e); }
};
'@ -replace "`r`n", "`n"

$replace2 = @'
sbScript.onload = () => {
  try {
    if (window.supabase) supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log("Supabase cargado exitosamente.");
    // Si ya inició sesión o está en descargas, re-renderizar para traer los archivos de la nube
    if (document.getElementById('app').style.display === 'block') {
      renderDocs(true);
    }
  } catch(e) { console.error('Supabase error', e); }
};
'@ -replace "`r`n", "`n"

# 2. Parchear fetchDocs
$target1 = @'
async function fetchDocs() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('documentos').select('*').order('fecha_subida', { ascending: false });
  if (error) { console.error("Error DB", error); return []; }
  docsCache = data.map(d => ({
    id: d.id,
    type: d.tipo,
    emoji: d.tipo === 'word' ? '📝' : '📊',
    titulo: d.titulo,
    desc: d.descripcion || 'Subido por ' + (d.autor || 'Anónimo'),
    autor: d.autor || 'Anónimo',
    file: d.archivo_path,
    url: d.url_archivo
  }));
  return docsCache;
}
'@ -replace "`r`n", "`n"

$replace1 = @'
async function fetchDocs() {
  let localDocs = [];
  try {
    localDocs = JSON.parse(localStorage.getItem('mos_docs_v3')) || [];
  } catch(e) { console.error("Error reading localStorage", e); }

  if (!supabase) {
    docsCache = localDocs;
    return docsCache;
  }

  try {
    const { data, error } = await supabase.from('documentos').select('*').order('fecha_subida', { ascending: false });
    if (error) throw error;
    
    const dbDocs = data.map(d => ({
      id: d.id,
      type: d.tipo,
      emoji: d.tipo === 'word' ? '📝' : '📊',
      titulo: d.titulo,
      desc: d.descripcion || 'Subido por ' + (d.autor || 'Anónimo'),
      autor: d.autor || 'Anónimo',
      file: d.archivo_path,
      url: d.url_archivo
    }));
    
    // Unir ambos: locales y de la nube
    docsCache = [...localDocs, ...dbDocs];
  } catch(err) {
    console.error("Error cargando base de datos, usando local:", err);
    docsCache = localDocs;
  }
  return docsCache;
}
'@ -replace "`r`n", "`n"

# 3. Parchear updateHeroStats
$target3 = @'
async function updateHeroStats() {
  const w = docsCache.filter(d=>d.type==='word').length;
  const e = docsCache.filter(d=>d.type==='excel').length;
  document.getElementById('hTotal').textContent = docsCache.length;
  document.getElementById('hWord').textContent  = w;
  document.getElementById('hExcel').textContent = e;
}
'@ -replace "`r`n", "`n"

$replace3 = @'
async function updateHeroStats() {
  if (docsCache.length === 0) {
    try {
      docsCache = JSON.parse(localStorage.getItem('mos_docs_v3')) || [];
    } catch(e) {}
  }
  const w = docsCache.filter(d=>d.type==='word').length;
  const e = docsCache.filter(d=>d.type==='excel').length;
  document.getElementById('hTotal').textContent = docsCache.length;
  document.getElementById('hWord').textContent  = w;
  document.getElementById('hExcel').textContent = e;
}
'@ -replace "`r`n", "`n"

# 4. Parchear deleteDoc
$target4 = @'
async function deleteDoc(id, filePath) {
  if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return;
  if (supabase) {
    if (filePath) await supabase.storage.from('documentos').remove([filePath]);
    await supabase.from('documentos').delete().eq('id', id);
  }
  await renderDocs(true);
  updateHeroStats();
}
'@ -replace "`r`n", "`n"

$replace4 = @'
async function deleteDoc(id, filePath) {
  if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return;
  
  if (String(id).startsWith('u_')) {
    // Eliminar de LocalStorage
    try {
      let localDocs = JSON.parse(localStorage.getItem('mos_docs_v3')) || [];
      localDocs = localDocs.filter(d => d.id !== id);
      localStorage.setItem('mos_docs_v3', JSON.stringify(localDocs));
    } catch(e) { console.error(e); }
  } else {
    // Eliminar de Supabase
    if (supabase) {
      if (filePath) await supabase.storage.from('documentos').remove([filePath]);
      await supabase.from('documentos').delete().eq('id', id);
    }
  }
  
  await renderDocs(true);
  updateHeroStats();
}
'@ -replace "`r`n", "`n"

# 5. Parchear uploadDoc
$target5 = @'
async function uploadDoc(){
  const autor =document.getElementById('upAutor').value.trim();
  const tipo  =document.getElementById('upTipo').value;
  const titulo=document.getElementById('upTitulo').value.trim();
  const desc  =document.getElementById('upDesc').value.trim();
  if(!selectedFile){alert('Selecciona un archivo primero.');return}
  if(!autor) {alert('Escribe el nombre del autor.');return}
  if(!tipo)  {alert('Selecciona el tipo de documento.');return}
  if(!titulo){alert('Escribe un título.');return}
  
  if (!supabase) { alert('La Base de Datos (Supabase) no está conectada. Espera un momento o recarga.'); return; }
  
  const btn = document.querySelector('.btn-upload');
  const oTxt = btn.textContent;
  btn.textContent = 'Subiendo... ⏳';
  btn.disabled = true;
 
  try {
    // 1. Subir a Storage
    const ext = selectedFile.name.split('.').pop();
    const filePath = `docs/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    
    const { error: upErr } = await supabase.storage.from('documentos').upload(filePath, selectedFile);
    if (upErr) throw upErr;
    
    // 2. Obtener URL pública
    const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(filePath);
    
    // 3. Guardar en Base de Datos (Tabla 'documentos')
    const { error: dbErr } = await supabase.from('documentos').insert([{
      titulo, descripcion: desc, tipo, autor, archivo_path: filePath, url_archivo: publicUrlData.publicUrl
    }]);
    if (dbErr) throw dbErr;
    
    await renderDocs(true);
    updateHeroStats();
    
    document.getElementById('uploadForm').style.display='none';
    document.getElementById('uploadOk').style.display='block';
  } catch (err) {
    alert('Error al subir: ' + err.message);
  } finally {
    btn.textContent = oTxt;
    btn.disabled = false;
  }
}
'@ -replace "`r`n", "`n"

$replace5 = @'
async function uploadDoc(){
  const autor =document.getElementById('upAutor').value.trim();
  const tipo  =document.getElementById('upTipo').value;
  const titulo=document.getElementById('upTitulo').value.trim();
  const desc  =document.getElementById('upDesc').value.trim();
  if(!selectedFile){alert('Selecciona un archivo primero.');return}
  if(!autor) {alert('Escribe el nombre del autor.');return}
  if(!tipo)  {alert('Selecciona el tipo de documento.');return}
  if(!titulo){alert('Escribe un título.');return}
  
  const btn = document.querySelector('.btn-upload');
  const oTxt = btn.textContent;

  // Fallback local si Supabase no está disponible o desconectado
  if (!supabase) {
    const confirmLocal = confirm('La base de datos en la nube no está disponible en este momento. ¿Deseas subir este archivo de forma local en tu navegador para no perderlo?');
    if (!confirmLocal) return;

    btn.textContent = 'Subiendo local... ⏳';
    btn.disabled = true;
    
    const reader = new FileReader();
    reader.onload = async e => {
      const doc = {
        id: 'u_' + Date.now(),
        type: tipo,
        emoji: tipo === 'word' ? '📝' : '📊',
        titulo,
        desc: desc || 'Subido por ' + autor,
        autor,
        file: selectedFile.name,
        url: e.target.result
      };
      try {
        const docs = JSON.parse(localStorage.getItem('mos_docs_v3')) || [];
        docs.push(doc);
        localStorage.setItem('mos_docs_v3', JSON.stringify(docs));
        await renderDocs(true);
        updateHeroStats();
        document.getElementById('uploadForm').style.display = 'none';
        document.getElementById('uploadOk').style.display = 'block';
      } catch(err) {
        alert('Error al guardar localmente: ' + err.message);
      } finally {
        btn.textContent = oTxt;
        btn.disabled = false;
      }
    };
    reader.readAsDataURL(selectedFile);
    return;
  }
  
  btn.textContent = 'Subiendo... ⏳';
  btn.disabled = true;

  try {
    // 1. Subir a Storage
    const ext = selectedFile.name.split('.').pop();
    const filePath = `docs/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    
    const { error: upErr } = await supabase.storage.from('documentos').upload(filePath, selectedFile);
    if (upErr) throw upErr;
    
    // 2. Obtener URL pública
    const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(filePath);
    
    // 3. Guardar en Base de Datos (Tabla 'documentos')
    const { error: dbErr } = await supabase.from('documentos').insert([{
      titulo, descripcion: desc, tipo, autor, archivo_path: filePath, url_archivo: publicUrlData.publicUrl
    }]);
    if (dbErr) throw dbErr;
    
    await renderDocs(true);
    updateHeroStats();
    
    document.getElementById('uploadForm').style.display='none';
    document.getElementById('uploadOk').style.display='block';
  } catch (err) {
    alert('Error al subir: ' + err.message);
  } finally {
    btn.textContent = oTxt;
    btn.disabled = false;
  }
}
'@ -replace "`r`n", "`n"

# Realizar los reemplazos exactos
$content = $content.Replace($target1, $replace1)
$content = $content.Replace($target2, $replace2)
$content = $content.Replace($target3, $replace3)
$content = $content.Replace($target4, $replace4)
$content = $content.Replace($target5, $replace5)

# Volver a guardar el archivo (PowerShell mantendrá el fin de línea de manera nativa)
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Output "Parche aplicado exitosamente con normalización de líneas!"
