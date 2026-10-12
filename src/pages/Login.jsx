import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiUrl}/auth/login`, 
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      localStorage.setItem('token', res.data.token); 
      localStorage.setItem('coachName', res.data.coach.name);
      
      alert(`💪 Bienvenue Coach ${res.data.coach.name} !`);
      navigate('/', { replace: true });
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Infos incorrectes ou serveur éteint !");
    }
  };

  return (
    <div className="container auth-page" style={{ maxWidth: '460px' }}>
      <div className="card auth-card shadow-sm">
        <h3 className="text-center fw-bold auth-heading mb-4"><span className="brand-accent">PLAN</span>FIT LOGIN</h3>
        <p className="text-center small mb-4">Votre espace de coaching, prêt pour la suite.</p>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-muted">Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted">Mot de passe</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-success-custom w-100 mt-2">Se connecter</button>
        </form>
        <p className="mt-3 text-center small text-muted">Pas de compte ? <Link to="/register" className="accent-link">Créer un compte</Link></p>
      </div>
    </div>
  );
};

export default Login;
