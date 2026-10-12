import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './ProgramBuilder.css';

 const apiUrl = import.meta.env.VITE_API_URL;

const getClientMacros = (client) => {
  const calories = Number(client?.targetCalories);
  const weight = Number(client?.weight);
  const protein = Number.isFinite(weight) && weight > 0 ? String(weight * 2) : '';
  const fat = Number.isFinite(weight) && weight > 0 ? String(weight) : '';
  const validCalories = Number.isFinite(calories) && calories > 0 ? calories : '';

  return {
    calories: validCalories === '' ? '' : String(validCalories),
    protein,
    fat,
    fiber: validCalories === '' ? '' : String(Math.round(validCalories * 0.014)),
    carbs: validCalories === '' || protein === '' || fat === ''
      ? ''
      : String(Math.max(0, Math.round((validCalories - protein * 4 - fat * 9) / 4))),
  };
};

const getMacrosForCalories = (caloriesValue, currentMacros) => {
  const calories = Number(caloriesValue);
  const protein = currentMacros.protein === '' ? Number.NaN : Number(currentMacros.protein);
  const fat = currentMacros.fat === '' ? Number.NaN : Number(currentMacros.fat);
  if (!Number.isFinite(calories) || calories <= 0) {
    return { ...currentMacros, calories: caloriesValue, carbs: '', fiber: '' };
  }

  return {
    ...currentMacros,
    calories: caloriesValue,
    fiber: String(Math.round(calories * 0.014)),
    carbs: Number.isFinite(protein) && Number.isFinite(fat)
      ? String(Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4)))
      : '',
  };
};

const EXERCISES_DATABASE = [
  { name: 'Développé couché à la barre', muscle: 'Le grand pectoral', type: 'Sans Machine' },
  { name: 'Développé incliné aux haltères', muscle: 'Le grand pectoral', type: 'Sans Machine' },
  { name: 'Écarté incliné aux haltères', muscle: 'Le grand pectoral', type: 'Sans Machine' },
  { name: 'Dips (Focus Pectoraux)', muscle: 'Le grand pectoral', type: 'Sans Machine' },
  { name: 'Pompes (Push-ups)', muscle: 'Le grand pectoral', type: 'Sans Machine' },
  { name: 'Développé couché à la Machine (Chest Press)', muscle: 'Le grand pectoral', type: 'Machine' },
  { name: 'Pec Deck (Papillon)', muscle: 'Le grand pectoral', type: 'Machine' },
  { name: 'Écarté à la poulie vis-à-vis (Crossover)', muscle: 'Le grand pectoral', type: 'Machine' },
  { name: 'Barre au front (EZ Bar Skullcrusher)', muscle: 'Le triceps brachial', type: 'Sans Machine' },
  { name: 'Extensions aux haltères derrière la tête', muscle: 'Le triceps brachial', type: 'Sans Machine' },
  { name: 'Dips banc (Bench Dips)', muscle: 'Le triceps brachial', type: 'Sans Machine' },
  { name: 'Extension des triceps à la poulie haute (Corde)', muscle: 'Le triceps brachial', type: 'Machine' },
  { name: 'Extension triceps à la poulie (Barre droite)', muscle: 'Le triceps brachial', type: 'Machine' },
  { name: 'Kickback à la poulie basse', muscle: 'Le triceps brachial', type: 'Machine' },
  { name: 'Tractions prise pronation (Pull-ups)', muscle: 'Le grand dorsal', type: 'Sans Machine' },
  { name: 'Rowing barre buste penché', muscle: 'Le grand dorsal', type: 'Sans Machine' },
  { name: 'Rowing unilatéral haltère (Dumbbell Row)', muscle: 'Le grand dorsal', type: 'Sans Machine' },
  { name: 'Tirage poitrine à la poulie haute (Lat Pulldown)', muscle: 'Le grand dorsal', type: 'Machine' },
  { name: 'Rowing assis à la poulie basse (Seated Cable Row)', muscle: 'Le grand dorsal', type: 'Machine' },
  { name: 'Tirage bras tendus à la poulie (Pull-over poulie)', muscle: 'Le grand dorsal', type: 'Machine' },
  { name: 'Développé militaire à la barre', muscle: 'Le deltoïde', type: 'Sans Machine' },
  { name: 'Développé assis aux haltères', muscle: 'Le deltoïde', type: 'Sans Machine' },
  { name: 'Élévations latérales aux haltères', muscle: 'Le deltoïde', type: 'Sans Machine' },
  { name: 'Oiseau aux haltères (Buste penché)', muscle: 'Le deltoïde', type: 'Sans Machine' },
  { name: 'Élévations latérales à la poulie', muscle: 'Le deltoïde', type: 'Machine' },
  { name: 'Oiseau à la poulie haute (Pec Deck inversé)', muscle: 'Le deltoïde', type: 'Machine' },
  { name: 'Développé épaules à la Machine (Shoulder Press)', muscle: 'Le deltoïde', type: 'Machine' },
  { name: 'Squat arrière à la barre libre (Back Squat)', muscle: 'Le quadriceps fémoral', type: 'Sans Machine' },
  { name: 'Squat avant (Front Squat)', muscle: 'Le quadriceps fémoral', type: 'Sans Machine' },
  { name: 'Fentes marchées aux haltères', muscle: 'Le quadriceps fémoral', type: 'Sans Machine' },
  { name: 'Presse à cuisses inclinée (Leg Press)', muscle: 'Le quadriceps fémoral', type: 'Machine' },
  { name: 'Leg Extension (Extensions jambes)', muscle: 'Le quadriceps fémoral', type: 'Machine' },
  { name: 'Hack Squat à la machine', muscle: 'Le quadriceps fémoral', type: 'Machine' },
  { name: 'Hip Thrust à la barre libre', muscle: 'Le grand fessier', type: 'Sans Machine' },
  { name: 'Squat bulgare aux haltères', muscle: 'Le grand fessier', type: 'Sans Machine' },
  { name: 'Hip Thrust à la Machine', muscle: 'Le grand fessier', type: 'Machine' },
  { name: 'Extensions de la hanche à la poulie basse', muscle: 'Le grand fessier', type: 'Machine' },
  { name: 'Abducteurs assis à la machine', muscle: 'Le grand fessier', type: 'Machine' },
  { name: 'Soulevé de terre roumain aux haltères', muscle: 'Les ischio-jambiers', type: 'Sans Machine' },
  { name: 'Soulevé de terre jambes tendues (Barre)', muscle: 'Les ischio-jambiers', type: 'Sans Machine' },
  { name: 'Leg Curl allongé (Lying Leg Curl)', muscle: 'Les ischio-jambiers', type: 'Machine' },
  { name: 'Leg Curl assis (Seated Leg Curl)', muscle: 'Les ischio-jambiers', type: 'Machine' },
  { name: 'Soulevé de terre traditionnel (Deadlift)', muscle: 'Les muscles érecteurs du rachis', type: 'Sans Machine' },
  { name: 'Good Morning à la barre', muscle: 'Les muscles érecteurs du rachis', type: 'Sans Machine' },
  { name: 'Extensions au banc à lombaires (Hyperextensions)', muscle: 'Les muscles érecteurs du rachis', type: 'Machine' },
];

const createWorkoutRow = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  day: '',
  exerciseName: '',
  sets: '',
  reps: '',
  weight: '',
  load: '',
  intensityMode: '% 1RM',
  rest: '120',
});

const ProgramBuilder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { athleteId = '' } = useParams();
  const sessionId = searchParams.get('sessionId');
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [workoutRows, setWorkoutRows] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [exerciseLibraryError, setExerciseLibraryError] = useState('');
  const [isLoadingExerciseLibrary, setIsLoadingExerciseLibrary] = useState(false);
  const [isExerciseLibraryOpen, setIsExerciseLibraryOpen] = useState(false);
  const [exerciseLibrarySearch, setExerciseLibrarySearch] = useState('');
  const [exerciseLibraryTarget, setExerciseLibraryTarget] = useState(null);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [phase, setPhase] = useState('Préparation Physique Générale (PPG)');
  const [medicalStatus, setMedicalStatus] = useState('Full Clearance');
  const [restrictions, setRestrictions] = useState('');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [warmup, setWarmup] = useState('');
  const [cooldown, setCooldown] = useState('');
  const [macros, setMacros] = useState({ calories: '', protein: '', carbs: '', fat: '' });
  const [recovery, setRecovery] = useState({ sleep: true, hydration: '', compression: false, cryotherapy: false, massage: false });
  const [sessionRpe, setSessionRpe] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveMessageType, setSaveMessageType] = useState('success');
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [isReportActionsOpen, setIsReportActionsOpen] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(Boolean(sessionId));
  const [savedSessions, setSavedSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyMonth, setHistoryMonth] = useState('');
  const reportActionsRef = useRef(null);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionClient, setSessionClient] = useState(null);
  const [sessionObjective, setSessionObjective] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const selectedClientId = athleteId || searchParams.get('clientId') || sessionClient?._id || '';

  const openBuilderModal = (modal) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('modal', modal);
    setSearchParams(nextParams, {
      state: { ...location.state, planfitModalEntry: modal },
    });
  };

  const closeBuilderModal = useCallback((modal) => {
    setIsExerciseLibraryOpen(false);
    setIsHistoryOpen(false);
    if (searchParams.get('modal') !== modal) return;

    if (location.state?.planfitModalEntry === modal) {
      navigate(-1);
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('modal');
    setSearchParams(nextParams, { replace: true, state: location.state });
  }, [location.state, navigate, searchParams, setSearchParams]);

  useEffect(() => {
    const modal = searchParams.get('modal');
    setIsExerciseLibraryOpen(modal === 'library');
    setIsHistoryOpen(modal === 'history');
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    axios.get(`${apiUrl}/clients`)
      .then(({ data }) => {
        if (isMounted) setClients(data.filter((client) => client.active !== false));
      })
      .catch((error) => {
        console.error('Erreur de chargement des clients du programme', error);
        if (isMounted) setLoadError('Impossible de charger les clients. Réessayez.');
      })
      .finally(() => { if (isMounted) setIsLoadingClients(false); });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setIsReadOnly(false);
      setSessionDate('');
      setSessionClient(null);
      setSessionObjective('');
      setIsLoadingSession(false);
      return undefined;
    }

    let isMounted = true;
    setIsReadOnly(true);
    setIsLoadingSession(true);
    setLoadError('');
    axios.get(`${apiUrl}/saved-sessions/${sessionId}`)
      .then(({ data }) => {
        if (!isMounted) return;
        const program = data.programData;
        if (!program || typeof program !== 'object') {
          throw new Error('Les données de cette séance sont invalides.');
        }

        setSessionClient(data.clientId && typeof data.clientId === 'object' ? data.clientId : null);
        setSessionObjective(program.objective || data.clientId?.goal || '');
        setPhase(program.phase || 'Préparation Physique Générale (PPG)');
        setMedicalStatus(program.medicalStatus || 'Full Clearance');
        setRestrictions(program.restrictions || '');
        setSessionDuration(program.sessionDuration || '60');
        setWarmup(program.warmup || '');
        setCooldown(program.cooldown || '');
        setMacros(program.macros || { calories: '', protein: '', carbs: '', fat: '', fiber: '' });
        setRecovery(program.recovery || { sleep: true, hydration: '', compression: false, cryotherapy: false, massage: false });
        setSessionRpe(program.sessionRpe || '');
        setClinicalNotes(program.clinicalNotes || '');
        setWorkoutRows(Array.isArray(program.workoutRows) ? program.workoutRows : []);
        setSessionDate(data.sessionDate);
        setIsLoadingSession(false);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de la séance enregistrée', error);
        if (isMounted) {
          setLoadError('Impossible de charger cette séance enregistrée.');
          setIsLoadingSession(false);
        }
      });

    return () => { isMounted = false; };
  }, [sessionId]);

  useEffect(() => {
    if (!isReadOnly && selectedClientId && clients.length && !clients.some((client) => client._id === selectedClientId)) {
      navigate('/program-builder', { replace: true });
    }
  }, [clients, isReadOnly, navigate, selectedClientId]);

  const selectedClient = clients.find((client) => client._id === selectedClientId);
  const filteredClients = clients.filter((client) => client.name
    .toLocaleLowerCase('fr-FR')
    .includes(clientSearch.trim().toLocaleLowerCase('fr-FR')));
  const libraryExercises = [
    ...EXERCISES_DATABASE.map((exercise) => ({
      ...exercise,
      category: exercise.muscle,
      source: 'builtin',
    })),
    ...exerciseLibrary.map((exercise) => ({
      ...exercise,
      category: exercise.category || 'Autres',
      source: 'library',
    })),
  ].reduce((uniqueExercises, exercise) => {
    const key = exercise.name.trim().toLocaleLowerCase('fr-FR');
    const existingIndex = uniqueExercises.findIndex((entry) => entry.name.trim().toLocaleLowerCase('fr-FR') === key);
    if (existingIndex === -1) uniqueExercises.push(exercise);
    else if (exercise.source === 'library') uniqueExercises[existingIndex] = exercise;
    return uniqueExercises;
  }, []);
  const filteredLibraryExercises = libraryExercises.filter((exercise) => (
    `${exercise.name} ${exercise.category} ${exercise.description || ''}`
      .toLocaleLowerCase('fr-FR')
      .includes(exerciseLibrarySearch.trim().toLocaleLowerCase('fr-FR'))
  ));
  const groupedLibraryExercises = filteredLibraryExercises.reduce((groups, exercise) => {
    const categoryLabels = {
      Chest: 'Pectoraux',
      Back: 'Dos',
      Legs: 'Jambes',
      Shoulders: 'Épaules',
      Arms: 'Bras',
      Abs: 'Abdominaux',
      Cardio: 'Cardio',
    };
    const group = categoryLabels[exercise.category] || exercise.category || 'Autres';
    if (!groups[group]) groups[group] = [];
    groups[group].push(exercise);
    return groups;
  }, {});
  const filteredSavedSessions = savedSessions.filter((session) => {
    const date = new Date(session.sessionDate);
    const monthMatches = !historyMonth || (
      !Number.isNaN(date.getTime())
      && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === historyMonth
    );
    const programData = session.programData || {};
    const searchText = [
      session.clientId?.name,
      programData.objective,
      programData.phase,
      programData.clinicalNotes,
      ...(Array.isArray(programData.workoutRows) ? programData.workoutRows.map((row) => row.exerciseName) : []),
      Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fr-FR'),
    ].filter(Boolean).join(' ').toLocaleLowerCase('fr-FR');
    return monthMatches && searchText.includes(historySearch.trim().toLocaleLowerCase('fr-FR'));
  });

  useEffect(() => {
    if (!selectedClient || isReadOnly) return;
    setMacros(getClientMacros(selectedClient));
  }, [isReadOnly, selectedClient?._id, selectedClient?.targetCalories, selectedClient?.weight]);

  useEffect(() => {
    if (!selectedClientId) {
      setSavedSessions([]);
      setIsLoadingHistory(false);
      setHistoryError('');
      return undefined;
    }

    let isMounted = true;
    setIsLoadingHistory(true);
    setHistoryError('');
    axios.get(`${apiUrl}/saved-sessions/client/${selectedClientId}`)
      .then(({ data }) => {
        if (isMounted) setSavedSessions(data);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de l’historique des séances', error);
        if (isMounted) setHistoryError('Impossible de charger l’historique des séances.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => { isMounted = false; };
  }, [selectedClientId]);

  useEffect(() => {
    if (!isExerciseLibraryOpen) return undefined;

    let isMounted = true;
    setIsLoadingExerciseLibrary(true);
    setExerciseLibraryError('');
    axios.get(`${apiUrl}/exercises`)
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error('La réponse de la bibliothèque est invalide.');
        if (isMounted) setExerciseLibrary(data);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement de la bibliothèque d’exercices', error);
        if (isMounted) setExerciseLibraryError('Impossible de charger les exercices enregistrés. Les exercices intégrés restent disponibles.');
      })
      .finally(() => { if (isMounted) setIsLoadingExerciseLibrary(false); });

    return () => { isMounted = false; };
  }, [closeBuilderModal, isExerciseLibraryOpen]);

  useEffect(() => {
    if (!isExerciseLibraryOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeBuilderModal('library');
        setExerciseLibraryTarget(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isExerciseLibraryOpen]);

  useEffect(() => {
    if (!isHistoryOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeBuilderModal('history');
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeBuilderModal, isHistoryOpen]);

  useEffect(() => {
    if (!isReportActionsOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (!reportActionsRef.current?.contains(event.target)) setIsReportActionsOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsReportActionsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isReportActionsOpen]);

  const addWorkoutRow = () => setWorkoutRows((current) => [...current, createWorkoutRow()]);

  const openExerciseLibrary = (target = { mode: 'new' }) => {
    setExerciseLibraryTarget(target);
    setExerciseLibrarySearch('');
    openBuilderModal('library');
  };

  const selectLibraryExercise = (exercise) => {
    if (exerciseLibraryTarget?.mode === 'row') {
      updateWorkoutRow(exerciseLibraryTarget.rowId, 'exerciseName', exercise.name);
    } else {
      setWorkoutRows((current) => [...current, { ...createWorkoutRow(), exerciseName: exercise.name }]);
    }
    closeBuilderModal('library');
    setExerciseLibraryTarget(null);
  };

  const updateWorkoutRow = (rowId, field, value) => {
    setWorkoutRows((current) => current.map((row) => (
      row.id === rowId ? { ...row, [field]: value } : row
    )));
  };

  const removeWorkoutRow = (rowId) => {
    setWorkoutRows((current) => current.filter((row) => row.id !== rowId));
  };

  const handleClientChange = (clientId) => {
    setSessionClient(null);
    setMacros(clientId ? getClientMacros(clients.find((client) => client._id === clientId)) : {
      calories: '', protein: '', carbs: '', fat: '', fiber: '',
    });
    setWorkoutRows([]);
    setIsReadOnly(false);
    navigate(clientId ? `/program-builder/${encodeURIComponent(clientId)}` : '/program-builder');
  };

  const handleSaveSession = async () => {
    if (!selectedClientId) {
      setSaveMessage('Sélectionnez un client avant d’enregistrer la séance.');
      setSaveMessageType('error');
      return;
    }

    setIsSavingSession(true);
    setSaveMessage('');
    try {
      const programData = {
        objective: selectedClient?.goal || sessionClient?.goal || '',
        phase,
        medicalStatus,
        restrictions,
        sessionDuration,
        warmup,
        workoutRows,
        cooldown,
        macros,
        recovery,
        sessionRpe,
        clinicalNotes,
      };
      const payload = {
        clientId: selectedClientId,
        programData,
      };
      const { data } = sessionId
        ? await axios.put(`${apiUrl}/saved-sessions/${sessionId}`, payload)
        : await axios.post(`${apiUrl}/saved-sessions`, payload);
      setSavedSessions((current) => [data, ...current.filter((session) => session._id !== data._id)]);
      setSaveMessage('Séance enregistrée avec succès.');
      setSaveMessageType('success');
      setSessionObjective(programData.objective);
      if (sessionId) {
        setSessionDate(data.sessionDate);
        setIsReadOnly(true);
      } else {
        navigate(`/program-builder/${encodeURIComponent(selectedClientId)}?sessionId=${encodeURIComponent(data._id)}`);
      }
    } catch (error) {
      console.error('Erreur lors de l’enregistrement de la séance', error);
      setSaveMessage(error.response?.data?.message || 'Impossible d’enregistrer la séance. Réessayez.');
      setSaveMessageType('error');
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleOpenSavedSession = (savedSessionId, { replace = false } = {}) => {
    setIsReadOnly(true);
    navigate(`/program-builder/${encodeURIComponent(selectedClientId)}?sessionId=${encodeURIComponent(savedSessionId)}`, { replace });
  };

  const handleDeleteSession = async () => {
    if (!sessionId || isDeletingSession) return;
    const confirmed = window.confirm('Voulez-vous vraiment supprimer définitivement cette fiche récapitulative ?');
    if (!confirmed) return;

    setIsDeletingSession(true);
    setLoadError('');
    try {
      await axios.delete(`${apiUrl}/saved-sessions/${sessionId}`);
      setSavedSessions((current) => current.filter((session) => session._id !== sessionId));
      setIsReportActionsOpen(false);
      handleNewSession({ replace: true });
    } catch (error) {
      console.error('Erreur lors de la suppression de la fiche récapitulative', error);
      setLoadError('Impossible de supprimer cette fiche récapitulative. Réessayez.');
    } finally {
      setIsDeletingSession(false);
    }
  };

  const handleNewSession = ({ replace = false } = {}) => {
    setWorkoutRows([]);
    setPhase('Préparation Physique Générale (PPG)');
    setMedicalStatus('Full Clearance');
    setRestrictions('');
    setSessionDuration('60');
    setWarmup('');
    setCooldown('');
    setMacros(getClientMacros(selectedClient));
    setRecovery({ sleep: true, hydration: '', compression: false, cryotherapy: false, massage: false });
    setSessionRpe('');
    setClinicalNotes('');
    setSessionDate('');
    setSessionClient(null);
    setSessionObjective('');
    setLoadError('');
    setSaveMessage('');
    setIsReadOnly(false);
    navigate(selectedClientId
      ? `/program-builder/${encodeURIComponent(selectedClientId)}`
      : '/program-builder', { replace });
  };

  const recoveryProtocols = [
    recovery.compression && 'Pressothérapie',
    recovery.cryotherapy && 'Cryothérapie',
    recovery.massage && 'Massage',
  ].filter(Boolean);

  const reportClient = sessionClient || selectedClient;

  return (
    <main className="container-fluid workout-builder">
      {isReadOnly && sessionDate && <p className="builder-readonly-banner" role="status">
        <i className="bi bi-eye" /> Lecture seule · Séance du {new Date(sessionDate).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>}
      {saveMessage && <p className={`builder-save-message builder-save-message--${saveMessageType}`} role={saveMessageType === 'error' ? 'alert' : 'status'}>{saveMessage}</p>}
      {!isReadOnly && !selectedClientId && !sessionId ? (
        <section className="builder-welcome" aria-labelledby="builder-welcome-title">
          <div className="builder-welcome__content">
            <span className="builder-overline">PLANFIT · PROGRAM BUILDER</span>
            <h1 id="builder-welcome-title">Gestion des Entraînements</h1>
            <p>Sélectionnez un athlète pour préparer sa prochaine séance.</p>
            <label className="builder-welcome__search">
              <span>RECHERCHER UN CLIENT / ATHLÈTE</span>
              <div>
                <i className="bi bi-search" aria-hidden="true" />
                <input
                  type="search"
                  value={clientSearch}
                  onChange={(event) => setClientSearch(event.target.value)}
                  placeholder="Saisir le nom d’un athlète…"
                  aria-controls="builder-welcome-client-list"
                />
              </div>
            </label>
            {loadError && <p className="workout-builder__notice" role="alert">{loadError}</p>}
            {!loadError && isLoadingClients && <p className="builder-welcome__loading">Chargement des athlètes…</p>}
            {!loadError && !isLoadingClients && !clients.length && <p className="builder-welcome__loading">Aucun athlète disponible. Ajoutez d’abord un client.</p>}
            {clients.length > 0 && (
              <div className="builder-welcome__clients" id="builder-welcome-client-list">
                {filteredClients.map((client) => (
                  <button
                    type="button"
                    className="builder-welcome__client"
                    key={client._id}
                    onClick={() => {
                      handleClientChange(client._id);
                      setClientSearch('');
                    }}
                  >
                    <span className="builder-athlete-avatar"><i className="bi bi-person-fill" /></span>
                    <span>{client.name}</span>
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                  </button>
                ))}
                {!filteredClients.length && <p className="builder-welcome__loading">Aucun athlète ne correspond à cette recherche.</p>}
              </div>
            )}
          </div>
        </section>
      ) : !isReadOnly ? <fieldset className="builder-readonly-fieldset">
      <header className="builder-topbar">
        <div className="builder-athlete-main">
          <div className="builder-athlete-avatar"><i className="bi bi-person-fill" /></div>
          <div className="builder-athlete-info">
            <span className="builder-overline">PROGRAMME D’ENTRAÎNEMENT POUR</span>
            <h1>{selectedClient?.name || 'Sélectionner un athlète'}</h1>
            {selectedClient?.goal && <span className="builder-athlete-goal">Objectif · {selectedClient.goal}</span>}
            <label className="builder-client-picker">
              <span>CHANGER D’ATHLÈTE</span>
              <select value={selectedClientId} onChange={(event) => handleClientChange(event.target.value)} aria-label="Choisir un athlète">
                <option value="">Sélectionner un client</option>
                {clients.map((client) => <option value={client._id} key={client._id}>{client.name}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="builder-top-actions">
          <button className="builder-history-trigger" type="button" onClick={() => openBuilderModal('history')}>
            <i className="bi bi-clock-history" /> Fiches d’entraînement
          </button>
          <button className="builder-save-button" type="button" onClick={handleSaveSession} disabled={isSavingSession || !selectedClientId}>
            <i className={`bi ${isSavingSession ? 'bi-hourglass-split' : 'bi-cloud-check'}`} />
            {isSavingSession ? 'Enregistrement…' : 'Enregistrer la séance'}
          </button>
        </div>
      </header>

      <div className="builder-workspace">
        <div className="builder-main-column">
          <section className="builder-card builder-session-card" aria-label="Programmation de la séance">
            <div className="builder-program-config">
              <header className="builder-section-heading">
                <div><span className="builder-overline">PROGRAMME GÉNÉRAL</span><h2>Cadre de la séance</h2></div>
              </header>
              <div className="builder-meta-fields">
                <label className="builder-field"><span>PHASE DE PÉRIODISATION</span><select value={phase} onChange={(event) => setPhase(event.target.value)}>
                  {['Préparation Physique Générale (PPG)', 'Préparation Physique Spécifique (PPS)', 'Affûtage (Tapering)', 'Phase Compétitive', 'Transition (Trêve)'].map((item) => <option key={item}>{item}</option>)}
                </select></label>
                <label className="builder-field"><span>DISPONIBILITÉ MÉDICALE</span><select className={`builder-medical-select builder-medical-select--${medicalStatus === 'Full Clearance' ? 'green' : medicalStatus === 'Limited / Modified' ? 'orange' : 'red'}`} value={medicalStatus} onChange={(event) => setMedicalStatus(event.target.value)}>
                  <option>Full Clearance</option><option>Limited / Modified</option><option>Out / Injured</option>
                </select></label>
                {medicalStatus === 'Limited / Modified' && <label className="builder-field builder-restrictions"><span>RESTRICTIONS / ADAPTATIONS</span><input value={restrictions} onChange={(event) => setRestrictions(event.target.value)} placeholder="Ex. éviter les impacts, charge limitée à 60 %" /></label>}
              </div>
            </div>
            <header className="builder-section-heading"><div><span className="builder-overline">PROGRAMMATION DE LA SÉANCE</span><h2>Structure d’entraînement</h2></div><label className="builder-duration"><i className="bi bi-clock" /><span className="builder-sr-only">Durée de la séance en minutes</span><input type="number" min="1" max="600" value={sessionDuration} onChange={(event) => setSessionDuration(event.target.value)} /><span>min</span></label></header>
            <section className="builder-phase builder-phase--warmup">
              <div className="builder-phase-title"><div><h3>Activation &amp; mobilité</h3><p>Échauffement articulaire · activation nerveuse</p></div></div>
              <label className="builder-field"><span className="builder-sr-only">Protocoles d’activation et mobilité</span><textarea rows={2} value={warmup} onChange={(event) => setWarmup(event.target.value)} placeholder="Ex. 5 min vélo · mobilité hanches/chevilles · activation fessiers · 3 séries progressives…" /></label>
            </section>
            <section className="builder-phase builder-phase--workout">
              <div className="builder-phase-title"><div><h3>Corps de séance</h3></div></div>
              <div className="builder-table-wrap">
                <div className="builder-workout-grid builder-workout-grid--labels" aria-hidden="true"><span>Exercice</span><span>Séries × reps</span><span>Intensité cible</span><span>Charge</span><span>Repos</span><span /></div>
                {workoutRows.length ? workoutRows.map((row, index) => {
                  const selectedExercise = libraryExercises.find((exercise) => exercise.name === row.exerciseName);
                  return <div className="builder-workout-grid" key={row.id}>
                    <div className="builder-exercise-cell"><span className="builder-sr-only" id={`builder-exercise-label-${row.id}`}>Exercice {index + 1}</span><div className="builder-exercise-control"><select aria-labelledby={`builder-exercise-label-${row.id}`} value={row.exerciseName} onChange={(event) => updateWorkoutRow(row.id, 'exerciseName', event.target.value)}><option value="">Choisir un exercice</option>{row.exerciseName && !selectedExercise && <option value={row.exerciseName}>{row.exerciseName}</option>}{libraryExercises.map((exercise) => <option value={exercise.name} key={exercise.name}>{exercise.name} · {exercise.category}</option>)}</select><button type="button" className="builder-library-trigger" onClick={() => openExerciseLibrary({ mode: 'row', rowId: row.id })} aria-label={`Ouvrir la bibliothèque pour l’exercice ${index + 1}`} title="Ouvrir la bibliothèque"><i className="bi bi-collection" /></button></div>{selectedExercise && <small>{selectedExercise.type || selectedExercise.category} · {selectedExercise.muscle || selectedExercise.category}</small>}</div>
                    <label><span className="builder-sr-only">Séries {index + 1}</span><div className="builder-set-reps"><input type="number" min="1" max="20" value={row.sets} onChange={(event) => updateWorkoutRow(row.id, 'sets', event.target.value)} placeholder="4" /><span>×</span><input type="text" value={row.reps} onChange={(event) => updateWorkoutRow(row.id, 'reps', event.target.value)} placeholder="8" /></div></label>
                    <label className="builder-intensity-cell"><span className="builder-sr-only">Intensité {index + 1}</span><select aria-label={`Type d’intensité exercice ${index + 1}`} value={row.intensityMode} onChange={(event) => updateWorkoutRow(row.id, 'intensityMode', event.target.value)}><option>% 1RM</option><option>RPE</option><option>RIR</option></select><input aria-label={`Valeur intensité exercice ${index + 1}`} type="text" value={row.weight} onChange={(event) => updateWorkoutRow(row.id, 'weight', event.target.value)} placeholder={row.intensityMode === '% 1RM' ? '75 %' : row.intensityMode === 'RPE' ? '8' : '2'} /></label>
                    <label className="builder-load-cell"><span className="builder-sr-only">Charge en kilogrammes exercice {index + 1}</span><input type="number" min="0" step="0.5" value={row.load || ''} onChange={(event) => updateWorkoutRow(row.id, 'load', event.target.value)} placeholder="kg" /></label>
                    <label className="builder-rest-cell"><span className="builder-sr-only">Récupération en secondes exercice {index + 1}</span><i className="bi bi-stopwatch" /><input type="number" min="0" step="15" value={row.rest} onChange={(event) => updateWorkoutRow(row.id, 'rest', event.target.value)} aria-label={`Repos en secondes exercice ${index + 1}`} /><small>s</small></label>
                    <button type="button" className="workout-builder__remove-row" onClick={() => removeWorkoutRow(row.id)} aria-label={`Supprimer l’exercice ${index + 1}`}><i className="bi bi-trash3" /></button>
                  </div>;
                }) : <div className="workout-builder__workout-empty"><i className="bi bi-list-check" /><span>Aucun exercice ajouté à la séance.</span></div>}
              </div>
              <div className="builder-workout-actions"><button type="button" className="builder-add-row" onClick={() => openExerciseLibrary()}><i className="bi bi-plus-lg" /> Ajouter depuis la bibliothèque</button><button type="button" className="builder-add-empty-row" onClick={addWorkoutRow}>Ajouter une ligne vide</button></div>
            </section>
            <section className="builder-phase builder-phase--cooldown">
              <div className="builder-phase-title"><div><h3>Régénération</h3></div></div>
              <label className="builder-field"><span className="builder-sr-only">Retour au calme et techniques de récupération</span><textarea rows={2} value={cooldown} onChange={(event) => setCooldown(event.target.value)} placeholder="Ex. marche 5 min · mobilité douce · respiration nasale 4-6 · étirements ciblés…" /></label>
            </section>
          </section>
          <section className="builder-card builder-feedback">
            <header className="builder-section-heading"><div><span className="builder-overline">INTERFACE ATHLÈTE / COACH</span><h2>Feedback &amp; charge réelle</h2></div><span className="builder-feedback-icon"><i className="bi bi-chat-square-heart" /></span></header>
            <div className="builder-rpe-block"><div><strong>RPE ressenti</strong><span>Échelle de Borg modifiée · 1 = facile, 10 = maximal</span></div><div className="builder-rpe-scale" role="group" aria-label="RPE ressenti de 1 à 10">{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <button type="button" key={value} className={Number(sessionRpe) === value ? 'is-selected' : ''} aria-pressed={Number(sessionRpe) === value} onClick={() => setSessionRpe(String(value))}>{value}</button>)}</div></div>
            <label className="builder-field builder-clinical-notes"><span>JOURNAL CLINIQUE</span><textarea rows={3} value={clinicalNotes} onChange={(event) => setClinicalNotes(event.target.value)} placeholder="Sensations musculaires, douleurs localisées, fatigue nerveuse, qualité d’exécution…" /></label>
          </section>
        </div>

        <aside className="builder-side-column">
          <section className="builder-card builder-lifestyle">
            <header className="builder-section-heading"><div><span className="builder-overline">HORS SALLE · 24H</span><h2>  récupération</h2></div><span className="builder-nutrition-icon"><i className="bi bi-heart-pulse" /></span></header>
            
            <div className="builder-side-divider" />
            <div className="builder-subsection-heading"><i className="bi bi-arrow-repeat" /><strong>Récupération active</strong><span>PROTOCOLE</span></div>
            <div className="builder-checklist">
              <label className="builder-recovery-item"><span><i className="bi bi-moon-stars" /><span>Sommeil requis</span></span><input type="checkbox" checked={recovery.sleep} onChange={(event) => setRecovery((current) => ({ ...current, sleep: event.target.checked }))} /></label>
              <label className="builder-recovery-item builder-hydration"><span><i className="bi bi-droplet" /><span>Hydratation cible</span></span><span className="builder-hydration-input"><input type="number" min="0" step="0.1" value={recovery.hydration} onChange={(event) => setRecovery((current) => ({ ...current, hydration: event.target.value }))} placeholder="2.5" aria-label="Hydratation cible en litres" /><small>L</small></span></label>
              {[['compression', 'Pressothérapie', 'bi bi-wind'], ['cryotherapy', 'Cryothérapie', 'bi bi-snow2'], ['massage', 'Massage', 'bi bi-hand-index-thumb']].map(([key, label, icon]) => <label className="builder-recovery-item" key={key}><span><i className={icon} /><span>{label}</span></span><input type="checkbox" checked={recovery[key]} onChange={(event) => setRecovery((current) => ({ ...current, [key]: event.target.checked }))} /></label>)}
            </div>
          </section>
          <section className="builder-card builder-session-summary">
            <span className="builder-overline">RÉCAPITULATIF</span><h2>Cette séance</h2>
            <div className="builder-summary-line"><span>Phase</span><strong>{phase.replace('Préparation Physique ', '')}</strong></div>
            <div className="builder-summary-line"><span>Exercices</span><strong>{workoutRows.length} mouvement{workoutRows.length > 1 ? 's' : ''}</strong></div>
            <div className="builder-summary-line"><span>Disponibilité</span><strong className={`builder-summary-medical builder-summary-medical--${medicalStatus === 'Full Clearance' ? 'green' : medicalStatus === 'Limited / Modified' ? 'orange' : 'red'}`}>{medicalStatus}</strong></div>
          </section>
        </aside>
      </div>
      </fieldset> : (
        <section className="builder-report" aria-labelledby="builder-report-title">
          {isLoadingSession ? <p className="builder-report__loading" role="status">Chargement de la fiche depuis MongoDB…</p> : !loadError && (
            <>
              <header className="builder-report__header">
                <div>
                  <span className="builder-overline">COMPTE RENDU · PLANFIT</span>
                  <h1 id="builder-report-title">Fiche récapitulative de séance</h1>
                  <p>{reportClient?.name || 'Athlète'}{sessionDate ? ` · ${new Date(sessionDate).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}` : ''}</p>
                </div>
                <div className="builder-report__actions">
                  <div className="builder-report-menu" ref={reportActionsRef}>
                    <button
                      type="button"
                      className="builder-report-menu__trigger"
                      aria-label="Actions de la séance"
                      aria-haspopup="menu"
                      aria-expanded={isReportActionsOpen}
                      onClick={() => setIsReportActionsOpen((open) => !open)}
                    >
                      <i className="bi bi-three-dots" aria-hidden="true" />
                    </button>
                    {isReportActionsOpen && <div className="builder-report-menu__items" role="menu">
                      <button type="button" role="menuitem" onClick={() => {
                        setIsReportActionsOpen(false);
                        setIsReadOnly(false);
                        setSaveMessage('');
                      }}>
                        <i className="bi bi-pencil-square" /> Modifier la séance
                      </button>
                      <button type="button" role="menuitem" className="is-danger" onClick={handleDeleteSession} disabled={isDeletingSession}>
                        <i className={`bi ${isDeletingSession ? 'bi-hourglass-split' : 'bi-trash3'}`} />
                        {isDeletingSession ? 'Suppression…' : 'Supprimer la séance'}
                      </button>
                    </div>}
                  </div>
                </div>
              </header>

              <section className="builder-card builder-report__section" aria-labelledby="builder-report-general">
                <header className="builder-report__section-heading"><i className="bi bi-person-vcard" /><h2 id="builder-report-general">Informations générales</h2></header>
                <dl className="builder-report__facts">
                  <div><dt>Athlète</dt><dd>{reportClient?.name || '—'}</dd></div>
                  {(sessionObjective || reportClient?.goal) && <div><dt>Objectif</dt><dd>{sessionObjective || reportClient.goal}</dd></div>}
                  <div><dt>Phase</dt><dd>{phase}</dd></div>
                  <div><dt>Disponibilité médicale</dt><dd>{medicalStatus}{medicalStatus === 'Limited / Modified' && restrictions ? ` · ${restrictions}` : ''}</dd></div>
                  {sessionDate && <div><dt>Date</dt><dd>{new Date(sessionDate).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>}
                  {sessionDuration && <div><dt>Durée</dt><dd>{sessionDuration} min</dd></div>}
                </dl>
              </section>

              <section className="builder-card builder-report__section" aria-labelledby="builder-report-structure">
                <header className="builder-report__section-heading"><i className="bi bi-list-ol" /><h2 id="builder-report-structure">Structure de la séance</h2></header>
                <div className="builder-report__table-wrap">
                  <table className="builder-report__table">
                    <thead><tr><th>Exercice</th><th>Séries</th><th>Répétitions</th><th>% de 1RM</th><th>RPE / RIR</th><th>Temps de repos</th><th>Charge</th></tr></thead>
                    <tbody>
                      {workoutRows.filter((row) => row.exerciseName || row.sets || row.reps || row.weight || row.load).map((row, index) => (
                        <tr key={row.id || `${row.exerciseName}-${index}`}>
                          <th scope="row">{row.exerciseName || '—'}</th>
                          <td>{row.sets || '—'}</td>
                          <td>{row.reps || '—'}</td>
                          <td>{row.intensityMode === '% 1RM' && row.weight ? row.weight : '—'}</td>
                          <td>{row.intensityMode !== '% 1RM' && row.weight ? `${row.intensityMode} ${row.weight}` : '—'}</td>
                          <td>{row.rest ? `${row.rest} s` : '—'}</td>
                          <td>{row.load ? `${row.load} kg` : '—'}</td>
                        </tr>
                      ))}
                      {!workoutRows.some((row) => row.exerciseName || row.sets || row.reps || row.weight || row.load) && <tr><td colSpan="7" className="builder-report__empty-cell">Aucun exercice renseigné.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="builder-card builder-report__section" aria-labelledby="builder-report-warmup">
                <header className="builder-report__section-heading"><i className="bi bi-lightning-charge" /><h2 id="builder-report-warmup">Échauffement et mobilité</h2></header>
                <p className="builder-report__text">{warmup || 'Aucun contenu renseigné.'}</p>
              </section>

              <section className="builder-card builder-report__section" aria-labelledby="builder-report-recovery">
                <header className="builder-report__section-heading"><i className="bi bi-heart-pulse" /><h2 id="builder-report-recovery">Récupération</h2></header>
                <dl className="builder-report__facts">
                  <div><dt>Sommeil requis</dt><dd>{recovery.sleep ? 'Oui' : 'Non'}</dd></div>
                  {recovery.hydration && <div><dt>Hydratation cible</dt><dd>{recovery.hydration} L</dd></div>}
                  <div><dt>Protocoles sélectionnés</dt><dd>{recoveryProtocols.length ? recoveryProtocols.join(', ') : 'Aucun protocole'}</dd></div>
                  {cooldown && <div className="builder-report__fact-wide"><dt>Retour au calme</dt><dd>{cooldown}</dd></div>}
                </dl>
              </section>

              <section className="builder-card builder-report__section" aria-labelledby="builder-report-feedback">
                <header className="builder-report__section-heading"><i className="bi bi-chat-square-heart" /><h2 id="builder-report-feedback">Feedback</h2></header>
                <dl className="builder-report__facts">
                  <div><dt>RPE ressenti</dt><dd>{sessionRpe ? `${sessionRpe} / 10` : 'Non renseigné'}</dd></div>
                  <div className="builder-report__fact-wide"><dt>Journal clinique</dt><dd>{clinicalNotes || 'Aucune note clinique renseignée.'}</dd></div>
                </dl>
              </section>
            </>
          )}
        </section>
      )}
      {loadError && <p className="workout-builder__notice" role="alert">{loadError}</p>}
      {isHistoryOpen && selectedClientId && <div className="builder-history-backdrop" onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeBuilderModal('history');
      }}>
        <section className="builder-history-modal" role="dialog" aria-modal="true" aria-labelledby="builder-history-title">
          <header className="builder-history-modal__header">
            <div><span className="builder-overline">ARCHIVES · {selectedClient?.name || sessionClient?.name || 'ATHLÈTE'}</span><h2 id="builder-history-title">Fiches d’entraînement</h2></div>
            <button type="button" className="builder-library-modal__close" onClick={() => closeBuilderModal('history')} aria-label="Fermer l’historique"><i className="bi bi-x-lg" /></button>
          </header>
          <div className="builder-history-filters">
            <label className="builder-library-search"><i className="bi bi-search" /><span className="builder-sr-only">Rechercher dans les fiches</span><input type="search" value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="Rechercher une date, une phase, un exercice…" /></label>
            <label className="builder-history-month"><span>Filtrer par mois</span><input type="month" value={historyMonth} onChange={(event) => setHistoryMonth(event.target.value)} aria-label="Filtrer les fiches par mois" /></label>
          </div>
          {historyError && <p className="workout-builder__notice" role="alert">{historyError}</p>}
          <div className="builder-history-modal__list">
            {isLoadingHistory && <p className="builder-history__empty" role="status">Chargement des fiches d’entraînement…</p>}
            {!historyError && !isLoadingHistory && savedSessions.length === 0 && <p className="builder-history__empty">Aucune séance enregistrée pour ce client.</p>}
            {!historyError && !isLoadingHistory && savedSessions.length > 0 && filteredSavedSessions.length === 0 && <p className="builder-history__empty">Aucune fiche ne correspond aux filtres sélectionnés.</p>}
            {!historyError && !isLoadingHistory && filteredSavedSessions.length > 0 && <ul className="builder-history__list">
              {filteredSavedSessions.map((session) => {
                const date = new Date(session.sessionDate);
                const program = session.programData || {};
                const summary = [program.phase, program.workoutRows?.filter((row) => row.exerciseName).length
                  ? `${program.workoutRows.filter((row) => row.exerciseName).length} exercices`
                  : 'Séance'].filter(Boolean).join(' · ');
                return <li key={session._id}>
                  <button type="button" className={`builder-history__item${session._id === sessionId ? ' is-current' : ''}`} onClick={() => {
                    handleOpenSavedSession(session._id);
                  }}>
                    <i className="bi bi-calendar3" />
                    <span><strong>{Number.isNaN(date.getTime()) ? 'Date inconnue' : date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</strong><small>{summary}</small></span>
                    <i className="bi bi-chevron-right" aria-hidden="true" />
                  </button>
                </li>;
              })}
            </ul>}
          </div>
          {!isReadOnly && <button type="button" className="builder-history__new" onClick={() => {
            handleNewSession({ replace: true });
          }}><i className="bi bi-plus-lg" /> Nouvelle séance</button>}
        </section>
      </div>}
      {isExerciseLibraryOpen && <div className="builder-library-backdrop" onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeBuilderModal('library');
          setExerciseLibraryTarget(null);
        }
      }}>
        <section className="builder-library-modal" role="dialog" aria-modal="true" aria-labelledby="builder-library-title">
          <header className="builder-library-modal__header">
            <div><span className="builder-overline">CORPS DE SÉANCE</span><h2 id="builder-library-title">Bibliothèque d’exercices</h2><p>Choisissez un exercice pour l’ajouter à votre séance.</p></div>
            <button type="button" className="builder-library-modal__close" onClick={() => {
              closeBuilderModal('library');
              setExerciseLibraryTarget(null);
            }} aria-label="Fermer la bibliothèque"><i className="bi bi-x-lg" /></button>
          </header>
          <label className="builder-library-search"><i className="bi bi-search" /><span className="builder-sr-only">Rechercher un exercice</span><input autoFocus type="search" value={exerciseLibrarySearch} onChange={(event) => setExerciseLibrarySearch(event.target.value)} placeholder="Rechercher par nom ou groupe musculaire…" /></label>
          {exerciseLibraryError && <p className="workout-builder__notice" role="alert">{exerciseLibraryError}</p>}
          {isLoadingExerciseLibrary && <p className="builder-library-status" role="status">Chargement de la bibliothèque…</p>}
          <div className="builder-library-modal__list">
            {Object.entries(groupedLibraryExercises).sort(([groupA], [groupB]) => groupA.localeCompare(groupB, 'fr')).map(([group, exercises]) => (
              <section className="builder-library-group" key={group}>
                <h3>{group}<span>{exercises.length}</span></h3>
                <div>{exercises.map((exercise) => <button type="button" key={`${exercise.source}-${exercise.name}`} onClick={() => selectLibraryExercise(exercise)}>
                  <span><strong>{exercise.name}</strong>{exercise.description && <small>{exercise.description}</small>}</span><i className="bi bi-arrow-down-left" aria-hidden="true" />
                </button>)}</div>
              </section>
            ))}
            {!Object.keys(groupedLibraryExercises).length && !isLoadingExerciseLibrary && <p className="builder-library-status">Aucun exercice ne correspond à cette recherche.</p>}
          </div>
        </section>
      </div>}
    </main>
  );
};

export default ProgramBuilder;