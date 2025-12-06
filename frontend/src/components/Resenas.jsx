import { useEffect, useState } from 'react';
import { getResenas, createResena, updateResena, deleteResena, getJuegos } from '../api.js';
import StarRating from './StarRating.jsx';

export default function Resenas() {
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vista, setVista] = useState('tarjetas'); // tarjetas | tabla
  const [filtroJuegoId, setFiltroJuegoId] = useState('');

  const [nuevo, setNuevo] = useState({ juego: '', puntuacion: 5, texto: '', autor: '' });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ juego: '', puntuacion: 5, texto: '', autor: '' });
  const [juegos, setJuegos] = useState([]);
  const [fAutor, setFAutor] = useState('');
  const [fPuntuacionMin, setFPuntuacionMin] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  async function cargar() {
    setLoading(true); setError('');
    try {
      const data = await getResenas(filtroJuegoId || undefined);
      setResenas(data);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, []);
  useEffect(() => {
    // cargar catálogo de juegos para selector
    (async () => {
      try { setJuegos(await getJuegos()); } catch (e) { /* ignore */ }
    })();
  }, []);

  async function aplicarFiltro(e) {
    e?.preventDefault();
    await cargar();
  }

  async function crear(e) {
    e.preventDefault(); setError('');
    try {
      await createResena({ ...nuevo, puntuacion: Number(nuevo.puntuacion) });
      setNuevo({ juego: '', puntuacion: 5, texto: '', autor: '' });
      await cargar();
    } catch (e) { setError(e.message); }
  }

  function comenzarEdicion(r) {
    setEditId(r._id);
    setEditData({
      juego: r.juego?._id || r.juego || '',
      puntuacion: r.puntuacion ?? 5,
      texto: r.texto || '',
      autor: r.autor || '',
    });
  }

  async function guardarEdicion(id) {
    setError('');
    try {
      await updateResena(id, { ...editData, puntuacion: Number(editData.puntuacion) });
      setEditId(null);
      await cargar();
    } catch (e) { setError(e.message); }
  }

  async function borrar(id) {
    setError('');
    try { await deleteResena(id); await cargar(); } catch (e) { setError(e.message); }
  }

  return (
    <div>
      <h2>Reseñas</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loading ? <p>Cargando...</p> : null}

      <div className="toolbar" style={{ marginBottom: 8 }}>
        <span>Vista:</span>
        <button className="btn" onClick={() => setVista('tarjetas')} style={{ borderColor: vista === 'tarjetas' ? '#646cff' : undefined }}>Tarjetas</button>
        <button className="btn" onClick={() => setVista('tabla')} style={{ borderColor: vista === 'tabla' ? '#646cff' : undefined }}>Tabla</button>
      </div>

      <form onSubmit={aplicarFiltro} className="toolbar" style={{ marginBottom: 8 }}>
        <input placeholder="Filtrar por juegoId" value={filtroJuegoId} onChange={e => setFiltroJuegoId(e.target.value)} />
        <button className="btn" type="submit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10.5a6.5 6.5 0 1111.15 4.31l3.52 3.52" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Aplicar filtro
        </button>
        <button className="btn" type="button" onClick={() => { setFiltroJuegoId(''); cargar(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Limpiar
        </button>
      </form>

      {/* Filtros adicionales y ordenamiento */}
      <div className="filters" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 8 }}>
        <input placeholder="Autor contiene…" value={fAutor} onChange={e => setFAutor(e.target.value)} />
        <select value={fPuntuacionMin} onChange={e => setFPuntuacionMin(e.target.value)}>
          <option value="">Puntuación mínima</option>
          {[1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n}+</option>)}
        </select>
        <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
          <option value="createdAt">Ordenar por fecha</option>
          <option value="puntuacion">Ordenar por puntuación</option>
          <option value="autor">Ordenar por autor</option>
        </select>
        <select value={sortDir} onChange={e => setSortDir(e.target.value)}>
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </div>

      <form onSubmit={crear} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'start' }}>
        <select value={nuevo.juego} onChange={e => setNuevo({ ...nuevo, juego: e.target.value })} required>
          <option value="">Selecciona juego…</option>
          {juegos.map(j => (
            <option key={j._id} value={j._id}>{j.nombre}</option>
          ))}
        </select>
        <div>
          <StarRating value={Number(nuevo.puntuacion)} onChange={(n) => setNuevo({ ...nuevo, puntuacion: n })} />
        </div>
        <textarea placeholder="Texto de la reseña" rows={3} value={nuevo.texto} onChange={e => setNuevo({ ...nuevo, texto: e.target.value })} required />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Autor (opcional)" value={nuevo.autor} onChange={e => setNuevo({ ...nuevo, autor: e.target.value })} />
          <button className="btn" type="submit">Crear</button>
        </div>
      </form>

      {vista === 'tabla' ? (
        <table className="table table-resenas" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Juego</th>
              <th>Puntuación</th>
              <th>Texto</th>
              <th>Autor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resenas
              .filter(r => r.autor ? r.autor.toLowerCase().includes(fAutor.toLowerCase()) : !fAutor)
              .filter(r => !fPuntuacionMin || Number(r.puntuacion) >= Number(fPuntuacionMin))
              .sort((a,b) => {
                const A = a[sortKey];
                const B = b[sortKey];
                let cmp = 0;
                if (sortKey === 'createdAt') cmp = new Date(A) - new Date(B);
                else if (typeof A === 'number' && typeof B === 'number') cmp = A - B;
                else cmp = String(A || '').localeCompare(String(B || ''));
                return sortDir === 'asc' ? cmp : -cmp;
              })
              .map(r => (
              <tr key={r._id}>
                <td>
                  {editId === r._id ? (
                    <input value={editData.juego} onChange={e => setEditData({ ...editData, juego: e.target.value })} />
                  ) : (r.juego?.nombre || r.juego || '-')}
                </td>
                <td>{editId === r._id ? <StarRating value={Number(editData.puntuacion)} onChange={(n) => setEditData({ ...editData, puntuacion: n })} /> : (
                  <StarRating value={Number(r.puntuacion)} onChange={() => {}} />
                )}</td>
                <td>{editId === r._id ? <input value={editData.texto} onChange={e => setEditData({ ...editData, texto: e.target.value })} /> : r.texto}</td>
                <td>{editId === r._id ? <input value={editData.autor} onChange={e => setEditData({ ...editData, autor: e.target.value })} /> : (r.autor || '-')}</td>
                <td>
                  {editId === r._id ? (
                    <>
                      <button className="btn" onClick={() => guardarEdicion(r._id)}>Guardar</button>
                      <button className="btn" onClick={() => setEditId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="btn" onClick={() => comenzarEdicion(r)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 16.5V20h3.5L18.5 9.5 15 6l-11 10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        </svg>
                        Editar
                      </button>
                      <button className="btn btn-danger" onClick={() => borrar(r._id)}>
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
        <div className="reviews-grid">
          {resenas
            .filter(r => r.autor ? r.autor.toLowerCase().includes(fAutor.toLowerCase()) : !fAutor)
            .filter(r => !fPuntuacionMin || Number(r.puntuacion) >= Number(fPuntuacionMin))
            .sort((a,b) => {
              const A = a[sortKey];
              const B = b[sortKey];
              let cmp = 0;
              if (sortKey === 'createdAt') cmp = new Date(A) - new Date(B);
              else if (typeof A === 'number' && typeof B === 'number') cmp = A - B;
              else cmp = String(A || '').localeCompare(String(B || ''));
              return sortDir === 'asc' ? cmp : -cmp;
            })
            .map(r => (
            <div key={r._id} className="card-item">
              <div className="card-actions">
                {editId === r._id ? (
                  <>
                    <button className="icon-btn" title="Guardar" onClick={() => guardarEdicion(r._id)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="icon-btn" title="Cancelar" onClick={() => setEditId(null)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="icon-btn" title="Editar" onClick={() => comenzarEdicion(r)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 16.5V20h3.5L18.5 9.5 15 6l-11 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="icon-btn" title="Borrar" onClick={() => borrar(r._id)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 7h12M9 7V5h6v2m-8 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>

              <div className="card-meta">
                <div className="meta-left">
                  <strong className="review-title">{r.juego?.nombre || r.juego || '-'}</strong>
                </div>
                <div className="meta-right">
                  <span className="meta-pill" title="Autor">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    {r.autor || 'Anónimo'}
                  </span>
                </div>
              </div>

              <div className="star-row" style={{ marginTop: 4 }}>
                {editId === r._id ? (
                  <StarRating value={Number(editData.puntuacion)} onChange={(n) => setEditData({ ...editData, puntuacion: n })} />
                ) : (
                  <StarRating value={Number(r.puntuacion)} onChange={() => {}} />
                )}
              </div>

              <div className="review-text">
                {editId === r._id ? (
                  <textarea rows={3} value={editData.texto} onChange={e => setEditData({ ...editData, texto: e.target.value })} />
                ) : (
                  <p>{r.texto}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}