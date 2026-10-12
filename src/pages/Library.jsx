import { useState, useEffect } from 'react';
import axios from 'axios';

const Library = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [exercises, setExercises] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  const filteredExercises = exercises.filter((exercise) => (
    exercise.name.toLocaleLowerCase().includes(normalizedSearchTerm)
  ));

  useEffect(() => { 
    fetchExercises(); 
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await axios.get(`${apiUrl}/exercises`);
      setExercises(res.data);
    } catch (err) { 
      console.error("Erreur de récupération des exercices", err); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/exercises`, { name, description, videoUrl });
      setName(''); 
      setDescription(''); 
      setVideoUrl('');
      fetchExercises(); 
    } catch (err) { 
      console.error(err); 
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Formulaire d'ajout */}
        <div className="col-md-4 mb-4">
          <div className="card p-3 shadow-sm">
            <h4 className="text-uppercase small fw-bold mb-3 accent-text">Ajouter un Exercice</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label small text-muted">Nom de l'exercice</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="mb-2">
                <label className="form-label small text-muted">Description</label>
                <textarea className="form-control" rows={2} value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted">Lien Vidéo (YouTube)</label>
                <input type="url" className="form-control" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <button type="submit" className="btn btn-success-custom w-100">Enregistrer</button>
            </form>
          </div>
        </div>

        {/* Tableau d'affichage */}
        <div className="col-md-8">
          <h3 className="mb-3 fw-bold page-heading">Bibliothèque d'Exercices</h3>
          <div className="input-group mb-3">
            <span className="input-group-text bg-dark library-search-icon">
              <i className="bi bi-search" aria-hidden="true" />
            </span>
            <input
              type="search"
              className="form-control library-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Rechercher un exercice par nom..."
              aria-label="Rechercher un exercice par nom"
            />
          </div>
          <div className="table-responsive bg-dark p-3 shadow-sm rounded border border-secondary">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead className="table-light-custom">
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Vidéo</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted small py-3">
                      {exercises.length === 0
                        ? 'Aucun exercice dans la bibliothèque.'
                        : 'Aucun exercice ne correspond à cette recherche.'}
                    </td>
                  </tr>
                ) : (
                  filteredExercises.map(ex => (
                    <tr key={ex._id} style={{ borderBottom: '1px solid #76a9e4' }}>
                      <td className="fw-bold text-white py-3">{ex.name}</td>
                      <td><small className="text-muted">{ex.description || '-'}</small></td>
                      <td>
                        {ex.videoUrl ? (
                          <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger">▶ Video</a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
