// ============================================
// APP.JS — Lógica de la página pública
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    if (path.includes('procedimiento.html')) {
        cargarDetalleProcedimiento();
    } else {
        cargarConfiguracion();
        cargarProcedimientos();
    }
});

// Cargar configuración general
function cargarConfiguracion() {
    configRef.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.mensajeBienvenida) {
                document.getElementById('mensajeBienvenida').textContent = data.mensajeBienvenida;
            }
            if (data.telefonoContacto) {
                document.getElementById('telefonoContacto').textContent = '📞 ' + data.telefonoContacto;
            } else {
                document.getElementById('telefonoContacto').textContent = '';
            }
            if (data.emailContacto) {
                document.getElementById('emailContacto').textContent = '✉️ ' + data.emailContacto;
            } else {
                document.getElementById('emailContacto').textContent = '';
            }
        }
    }).catch(err => console.error('Error cargando config:', err));
}

// Cargar grid de procedimientos (sin índice compuesto, filtramos en cliente)
function cargarProcedimientos() {
    const grid = document.getElementById('proceduresGrid');

    // Consulta simple: solo where, sin orderBy (evita índice compuesto)
    procedimientosRef
        .where('activo', '==', true)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <div class="empty-state-icon">📹</div>
                        <h4>No hay procedimientos disponibles</h4>
                        <p>Pronto agregaremos contenido informativo.</p>
                    </div>
                `;
                return;
            }

            // Convertir a array y ordenar por campo 'orden' en el cliente
            const docs = [];
            snapshot.forEach(doc => {
                docs.push({ id: doc.id, data: doc.data() });
            });
            docs.sort((a, b) => (a.data.orden || 0) - (b.data.orden || 0));

            grid.innerHTML = '';
            docs.forEach(item => {
                const card = crearCardProcedimiento(item.id, item.data);
                grid.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Error:', err);
            grid.innerHTML = '<div class="loading-spinner">Error al cargar. Intenta recargar la página.</div>';
        });
}

function crearCardProcedimiento(id, proc) {
    const a = document.createElement('a');
    a.href = `procedimiento.html?id=${id}`;
    a.className = 'procedure-card';

    const videoId = extraerVideoId(proc.videoUrl);
    const thumbnailUrl = videoId 
        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        : '';

    a.innerHTML = `
        <div class="procedure-thumbnail">
            ${videoId ? `<img src="${thumbnailUrl}" alt="${proc.titulo}" loading="lazy">` : ''}
            <div class="play-icon">▶</div>
        </div>
        <div class="procedure-info">
            <h4>${escapeHtml(proc.titulo)}</h4>
            <p>${escapeHtml(proc.descripcion || '')}</p>
            ${proc.categoria ? `<span class="procedure-category">${escapeHtml(proc.categoria)}</span>` : ''}
        </div>
    `;

    return a;
}

// Cargar detalle de procedimiento
function cargarDetalleProcedimiento() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('procedureDetail');

    if (!id) {
        container.innerHTML = '<div class="alert alert-danger" style="display:block;">Procedimiento no encontrado.</div>';
        return;
    }

    procedimientosRef.doc(id).get().then(doc => {
        if (!doc.exists || !doc.data().activo) {
            container.innerHTML = '<div class="alert alert-danger" style="display:block;">Procedimiento no encontrado.</div>';
            return;
        }

        const proc = doc.data();
        const videoId = extraerVideoId(proc.videoUrl);

        let faqsHtml = '';
        if (proc.faqs && proc.faqs.length > 0) {
            faqsHtml = proc.faqs.map((faq) => `
                <div class="faq-item">
                    <div class="faq-question">${escapeHtml(faq.pregunta)}</div>
                    <div class="faq-answer">${escapeHtml(faq.respuesta)}</div>
                </div>
            `).join('');
        } else {
            faqsHtml = '<p style="color: var(--gray-600);">No hay preguntas frecuentes para este procedimiento.</p>';
        }

        container.innerHTML = `
            <div class="procedure-detail-header">
                <h2>${escapeHtml(proc.titulo)}</h2>
                <p>${escapeHtml(proc.descripcion || '')}</p>
                ${proc.categoria ? `<span class="procedure-category">${escapeHtml(proc.categoria)}</span>` : ''}
            </div>

            <div class="video-container">
                <div class="video-wrapper">
                    ${videoId ? `
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
                            title="${escapeHtml(proc.titulo)}"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    ` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;">Video no disponible</div>'}
                </div>
            </div>

            <div class="faq-section">
                <h3>Preguntas Frecuentes</h3>
                ${faqsHtml}
            </div>

            <div style="text-align: center; margin-bottom: 40px;">
                <a href="index.html" class="btn btn-primary" style="width: auto; padding: 12px 30px;">← Volver al inicio</a>
            </div>
        `;
    }).catch(err => {
        console.error('Error:', err);
        container.innerHTML = '<div class="alert alert-danger" style="display:block;">Error al cargar el procedimiento.</div>';
    });
}

// Helper: extraer ID de video de YouTube
function extraerVideoId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    for (let p of patterns) {
        const match = url.match(p);
        if (match) return match[1];
    }
    return null;
}

// Helper: escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}