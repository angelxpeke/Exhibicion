import { useEffect, useState } from 'react';
import { getJuegos, createJuego, updateJuego, deleteJuego } from '../api.js';

const estados = ['Pendiente', 'Jugando', 'Completado'];

export default function Juegos() {
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vista, setVista] = useState('tabla'); // tabla | biblioteca
  const [fNombre, setFNombre] = useState('');
  const [fPlataforma, setFPlataforma] = useState('');
  const [fEstado, setFEstado] = useState('');
  const [sortKey, setSortKey] = useState('nombre');
  const [sortDir, setSortDir] = useState('asc');

  const [nuevo, setNuevo] = useState({ nombre: '', plataforma: '', portadaURL: '', estado: 'Pendiente', horasJugadas: 0 });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ nombre: '', plataforma: '', portadaURL: '', estado: 'Pendiente', horasJugadas: 0 });

  async function cargar() {
    setLoading(true); setError('');
    try {
      const data = await getJuegos();
      setJuegos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear(e) {
    e.preventDefault(); setError('');
    try {
      await createJuego({ ...nuevo, horasJugadas: Number(nuevo.horasJugadas || 0) });
      setNuevo({ nombre: '', plataforma: '', portadaURL: '', estado: 'Pendiente', horasJugadas: 0 });
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  function comenzarEdicion(j) {
    setEditId(j._id);
    setEditData({
      nombre: j.nombre || '',
      plataforma: j.plataforma || '',
      portadaURL: j.portadaURL || '',
      estado: j.estado || 'Pendiente',
      horasJugadas: j.horasJugadas ?? 0,
    });
  }

  async function guardarEdicion(id) {
    setError('');
    try {
      await updateJuego(id, { ...editData, horasJugadas: Number(editData.horasJugadas || 0) });
      setEditId(null);
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  async function borrar(id) {
    setError('');
    try {
      await deleteJuego(id);
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  async function completar(id) {
    setError('');
    try { await updateJuego(id, { estado: 'Completado' }); await cargar(); } catch (e) { setError(e.message); }
  }

  async function sumarHora(id, horasActuales) {
    setError('');
    try { await updateJuego(id, { horasJugadas: Number(horasActuales || 0) + 1 }); await cargar(); } catch (e) { setError(e.message); }
  }

  async function restarHora(id, horasActuales) {
    setError('');
    const nueva = Math.max(0, Number(horasActuales || 0) - 1);
    try { await updateJuego(id, { horasJugadas: nueva }); await cargar(); } catch (e) { setError(e.message); }
  }

  return (
    <div>
      <h2>Juegos</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loading ? <p>Cargando...</p> : null}

      <div className="toolbar">
        <span>Vista:</span>
        <button className="btn" onClick={() => setVista('tabla')} style={{ borderColor: vista === 'tabla' ? '#646cff' : undefined }}>Tabla</button>
        <button className="btn" onClick={() => setVista('biblioteca')} style={{ borderColor: vista === 'biblioteca' ? '#646cff' : undefined }}>Biblioteca</button>
      </div>

      {/* Filtros y ordenamiento */}
      <div className="filters">
        <input placeholder="Buscar por nombre" value={fNombre} onChange={e => setFNombre(e.target.value)} />
        <select value={fPlataforma} onChange={e => setFPlataforma(e.target.value)}>
          <option value="">Todas las plataformas</option>
          {[...new Set(juegos.map(j => j.plataforma).filter(Boolean))].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={fEstado} onChange={e => setFEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {estados.map(est => <option key={est} value={est}>{est}</option>)}
        </select>
        <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
          <option value="nombre">Ordenar por nombre</option>
          <option value="plataforma">Ordenar por plataforma</option>
          <option value="estado">Ordenar por estado</option>
          <option value="horasJugadas">Ordenar por horas</option>
        </select>
        <select value={sortDir} onChange={e => setSortDir(e.target.value)}>
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </div>

      <form onSubmit={crear} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(6, 1fr)', alignItems: 'center' }}>
        <input placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} required />
        <input placeholder="Plataforma" value={nuevo.plataforma} onChange={e => setNuevo({ ...nuevo, plataforma: e.target.value })} required />
        <input placeholder="URL portada (opcional)" value={nuevo.portadaURL} onChange={e => setNuevo({ ...nuevo, portadaURL: e.target.value })} />
        <select value={nuevo.estado} onChange={e => setNuevo({ ...nuevo, estado: e.target.value })}>
          {estados.map(est => <option key={est} value={est}>{est}</option>)}
        </select>
        <input type="number" min={0} placeholder="Horas" value={nuevo.horasJugadas} onChange={e => setNuevo({ ...nuevo, horasJugadas: e.target.value })} />
        <button className="btn" type="submit">Crear</button>
      </form>

      {vista === 'tabla' ? (
      <table className="table table-juegos" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Plataforma</th>
            <th>Portada</th>
            <th>Estado</th>
            <th>Horas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {juegos
            .filter(j => j.nombre.toLowerCase().includes(fNombre.toLowerCase()))
            .filter(j => !fPlataforma || j.plataforma === fPlataforma)
            .filter(j => !fEstado || j.estado === fEstado)
            .sort((a, b) => {
              const A = a[sortKey];
              const B = b[sortKey];
              const cmp = typeof A === 'number' && typeof B === 'number'
                ? A - B
                : String(A).localeCompare(String(B));
              return sortDir === 'asc' ? cmp : -cmp;
            })
            .map(j => (
            <tr key={j._id}>
              <td>{editId === j._id ? <input value={editData.nombre} onChange={e => setEditData({ ...editData, nombre: e.target.value })} /> : j.nombre}</td>
              <td>{editId === j._id ? <input value={editData.plataforma} onChange={e => setEditData({ ...editData, plataforma: e.target.value })} /> : j.plataforma}</td>
              <td>{editId === j._id ? <input value={editData.portadaURL} onChange={e => setEditData({ ...editData, portadaURL: e.target.value })} /> : (j.portadaURL ? <img src={j.portadaURL} alt={j.nombre} style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 4 }} /> : '-')}</td>
              <td>{editId === j._id ? (
                <select value={editData.estado} onChange={e => setEditData({ ...editData, estado: e.target.value })}>
                  {estados.map(est => <option key={est} value={est}>{est}</option>)}
                </select>
              ) : j.estado}</td>
              <td>{editId === j._id ? <input type="number" min={0} value={editData.horasJugadas} onChange={e => setEditData({ ...editData, horasJugadas: e.target.value })} /> : j.horasJugadas}</td>
              <td>
                {editId === j._id ? (
                  <>
                    <button className="btn" onClick={() => guardarEdicion(j._id)}>Guardar</button>
                    <button className="btn" onClick={() => setEditId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                  <button className="btn" onClick={() => comenzarEdicion(j)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 16.5V20h3.5L18.5 9.5 15 6l-11 10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    Editar
                  </button>
                  <button className="btn" onClick={() => completar(j._id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Completar
                  </button>
                  <button className="btn" onClick={() => sumarHora(j._id, j.horasJugadas)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
                      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M19 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    +1h
                  </button>
                  <button className="btn" onClick={() => restarHora(j._id, j.horasJugadas)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
                      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M19 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M19 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    -1h
                  </button>
                  <button className="btn btn-danger" onClick={() => borrar(j._id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3h6l1 2h3v2H5V5h3l1-2Zm1 6v9M14 9v9M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Borrar
                  </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      ) : (
        <div className="library-grid">
          {juegos
            .filter(j => j.nombre.toLowerCase().includes(fNombre.toLowerCase()))
            .filter(j => !fPlataforma || j.plataforma === fPlataforma)
            .filter(j => !fEstado || j.estado === fEstado)
            .sort((a, b) => {
              const A = a[sortKey];
              const B = b[sortKey];
              const cmp = typeof A === 'number' && typeof B === 'number'
                ? A - B
                : String(A).localeCompare(String(B));
              return sortDir === 'asc' ? cmp : -cmp;
            })
            .map(j => (
            <div key={j._id} className="card-item">
              <div className="card-actions">
                {editId === j._id ? (
                  <>
                    <button className="icon-btn" title="Guardar" onClick={() => guardarEdicion(j._id)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="icon-btn" title="Cancelar" onClick={() => setEditId(null)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="icon-btn" title="Completar" onClick={() => completar(j._id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" strokeWidth="1.6"/>
                        <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                <button className="icon-btn" title="+1 hora" aria-label="+1 hora" onClick={() => sumarHora(j._id, j.horasJugadas)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.5 16.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 15v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <button className="icon-btn" title="-1 hora" aria-label="-1 hora" onClick={() => restarHora(j._id, j.horasJugadas)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.5 16.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                    <button className="icon-btn" title="Editar" onClick={() => comenzarEdicion(j)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 16.5V20h3.5L18.5 9.5 15 6l-11 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="icon-btn" title="Borrar" onClick={() => borrar(j._id)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 7h12M9 7V5h6v2m-8 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>

              <div className="cover">
                {j.portadaURL ? (
                  <img src={j.portadaURL} alt={j.nombre} />
                ) : (
                  <span style={{ color: '#888' }}>Sin portada</span>
                )}
              </div>

              {editId === j._id ? (
                <input placeholder="Nombre" value={editData.nombre} onChange={e => setEditData({ ...editData, nombre: e.target.value })} />
              ) : (
                <strong>{j.nombre}</strong>
              )}

              <div className="card-meta">
                <div className="meta-left">
                  {editId === j._id ? (
                    <input placeholder="Plataforma" value={editData.plataforma} onChange={e => setEditData({ ...editData, plataforma: e.target.value })} />
                  ) : (
                    <span className="meta-pill" title="Plataforma">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 8l-1 3H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2l1 3h10l1-3h2a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-2l-1-3H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <circle cx="9" cy="15" r="1.25" fill="currentColor"/>
                        <circle cx="15" cy="15" r="1.25" fill="currentColor"/>
                      </svg>
                      {j.plataforma || '—'}
                    </span>
                  )}
                </div>
                <div className="meta-right">
                  {editId === j._id ? (
                    <input type="number" min={0} placeholder="Horas" value={editData.horasJugadas} onChange={e => setEditData({ ...editData, horasJugadas: e.target.value })} />
                  ) : (
                    <span className="meta-pill" title="Horas jugadas">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {j.horasJugadas ?? 0}h
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 4 }}>
                {editId === j._id ? (
                  <select value={editData.estado} onChange={e => setEditData({ ...editData, estado: e.target.value })}>
                    {estados.map(est => <option key={est} value={est}>{est}</option>)}
                  </select>
                ) : (
                  <span className={`badge ${j.estado === 'Completado' ? 'badge-completado' : j.estado === 'Jugando' ? 'badge-jugando' : 'badge-pendiente'}`}>{j.estado}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}