import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiUrl}/auth/register`, 
        { name, email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (res.status === 201) {
        alert("🎉 Compte créé avec succès ! Connectez-vous.");
        navigate('/login'); 
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors de l'inscription. Vérifiez que le serveur Backend est allumé !");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <div className="card p-4 shadow-sm">
        <h3 className="text-center fw-bold auth-heading mb-4">
          <span className="brand-accent">PLAN</span>FIT REGISTRATION
        </h3>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label text-muted small">Nom complet</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted small">Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted small">Mot de passe</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-success-custom w-100 mt-3">
            S'inscrire
          </button>
        </form>
        <p className="mt-3 text-center small text-muted mb-0">
          Déjà inscrit ? <Link to="/login" className="accent-link">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
