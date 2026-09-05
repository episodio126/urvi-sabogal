// ============================================
// ADMIN.JS — Dashboard: Procedimientos y Config
// ============================================

let faqsTemp = [];
let currentUserRol = null;

// Guardia
requireAuth().then(data => {
    currentUserRol = data.rol;
    cargarProcedimientosAdmin();
    cargarConfigAdmin();
});

// Cargar procedimientos en tabla
function cargarProcedimientosAdmin() {
    const tbody = document.querySelector('#tablaProcedimientos tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando...</td></tr>';

    procedimientosRef.orderBy('orden').get().then(snapshot => {
        tbody.innerHTML = '';
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay procedimientos.</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const p = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.orden}</td>
                <td>${escapeHtml(p.titulo)}</td>
                <td>${escapeHtml(p.categoria || '-')}</td>
                <td><span class="badge badge-${p.activo ? 'active' : 'inactive'}">${p.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm" onclick="editarProcedimiento('${doc.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProcedimiento('${doc.id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// Configuración
function cargarConfigAdmin() {
    configRef.get().then(doc => {
        if (doc.exists) {
            const d = doc.data();
            document.getElementById('configMensaje').value = d.mensajeBienvenida || '';
            document.getElementById('configTelefono').value = d.telefonoContacto || '';
            document.getElementById('configEmail').value = d.emailContacto || '';
        }
    });
}

document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();
    configRef.set({
        mensajeBienvenida: document.getElementById('configMensaje').value,
        telefonoContacto: document.getElementById('configTelefono').value,
        emailContacto: document.getElementById('configEmail').value
    }, { merge: true }).then(() => alert('Configuración guardada.'));
});

// Modal Procedimiento
function abrirModalProcedimiento() {
    document.getElementById('procedimientoForm').reset();
    document.getElementById('procId').value = '';
    document.getElementById('modalTitle').textContent = 'Nuevo Procedimiento';
    faqsTemp = [];
    renderFaqsTemp();
    document.getElementById('modalProcedimiento').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modalProcedimiento').classList.remove('active');
}

function agregarFaq() {
    const pregunta = document.getElementById('faqPregunta').value.trim();
    const respuesta = document.getElementById('faqRespuesta').value.trim();
    if (!pregunta || !respuesta) return alert('Complete pregunta y respuesta.');
    faqsTemp.push({ pregunta, respuesta });
    document.getElementById('faqPregunta').value = '';
    document.getElementById('faqRespuesta').value = '';
    renderFaqsTemp();
}

function renderFaqsTemp() {
    const container = document.getElementById('faqsContainer');
    if (faqsTemp.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-600);">No hay FAQs agregadas.</p>';
        return;
    }
    container.innerHTML = faqsTemp.map((f, i) => `
        <div class="faq-item-admin">
            <div>
                <strong>${escapeHtml(f.pregunta)}</strong>
                <div style="color: var(--gray-600); font-size: 0.9rem;">${escapeHtml(f.respuesta)}</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="eliminarFaqTemp(${i})">🗑</button>
        </div>
    `).join('');
}

function eliminarFaqTemp(index) {
    faqsTemp.splice(index, 1);
    renderFaqsTemp();
}

// Guardar procedimiento
document.getElementById('procedimientoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('procId').value;
    const data = {
        titulo: document.getElementById('procTitulo').value,
        descripcion: document.getElementById('procDescripcion').value,
        categoria: document.getElementById('procCategoria').value,
        videoUrl: document.getElementById('procVideo').value,
        orden: parseInt(document.getElementById('procOrden').value) || 0,
        activo: document.getElementById('procActivo').checked,
        faqs: faqsTemp,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    let promise;
    if (id) {
        promise = procedimientosRef.doc(id).update(data);
    } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        promise = procedimientosRef.add(data);
    }

    promise.then(() => {
        cerrarModal();
        cargarProcedimientosAdmin();
    }).catch(err => {
        alert('Error: ' + err.message);
    });
});

// Editar
function editarProcedimiento(id) {
    procedimientosRef.doc(id).get().then(doc => {
        if (!doc.exists) return;
        const p = doc.data();
        document.getElementById('procId').value = id;
        document.getElementById('procTitulo').value = p.titulo;
        document.getElementById('procDescripcion').value = p.descripcion || '';
        document.getElementById('procCategoria').value = p.categoria || '';
        document.getElementById('procVideo').value = p.videoUrl || '';
        document.getElementById('procOrden').value = p.orden || 0;
        document.getElementById('procActivo').checked = p.activo !== false;
        faqsTemp = p.faqs || [];
        renderFaqsTemp();
        document.getElementById('modalTitle').textContent = 'Editar Procedimiento';
        document.getElementById('modalProcedimiento').classList.add('active');
    });
}

// Eliminar
function eliminarProcedimiento(id) {
    if (!confirm('¿Eliminar este procedimiento permanentemente?')) return;
    procedimientosRef.doc(id).delete().then(() => cargarProcedimientosAdmin());
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}