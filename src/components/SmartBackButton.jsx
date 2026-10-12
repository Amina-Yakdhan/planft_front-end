import { useLocation, useNavigate } from 'react-router-dom';

const SmartBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const isProgramBuilderAthletePage = /^\/program-builder\/[^/]+$/.test(location.pathname);
  const isSecondaryPage = location.pathname !== '/'
    && location.pathname !== '/login'
    && location.pathname !== '/register'
    && location.pathname !== '/program-builder';

  if (!isAuthenticated || !isSecondaryPage) return null;

  const handleBack = () => {
    if (isProgramBuilderAthletePage) {
      navigate(-1);
      return;
    }

    if (location.pathname.startsWith('/nutrition')) {
      navigate(-1);
      return;
    }

    if (location.key !== 'default' && window.history.length > 1) {
      navigate(-1);
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    if (location.pathname === '/builder' && searchParams.has('sessionId')) {
      const clientId = searchParams.get('clientId');
      navigate(clientId ? `/builder?clientId=${encodeURIComponent(clientId)}` : '/builder', { replace: true });
      return;
    }

    if (location.pathname === '/builder') {
      navigate('/', { replace: true });
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="smart-back-row">
      <button type="button" className="smart-back-button" onClick={handleBack}>
        <i className="bi bi-arrow-left" aria-hidden="true" />
        <span>Retour</span>
      </button>
    </div>
  );
};

export default SmartBackButton;
