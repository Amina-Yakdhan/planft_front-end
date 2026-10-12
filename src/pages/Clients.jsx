import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Clients.css';

const INACTIVITY_THRESHOLD_DAYS = 3;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const WEEK_DAYS = [
  { label: 'Lundi', value: 1 },
  { label: 'Mardi', value: 2 },
  { label: 'Mercredi', value: 3 },
  { label: 'Jeudi', value: 4 },
  { label: 'Vendredi', value: 5 },
  { label: 'Samedi', value: 6 },
  { label: 'Dimanche', value: 0 },
];
const LEGACY_GOAL_MAP = {
  'Muscle Gain': 'Prise de masse',
  'Fat Loss': 'Perte de gras',
  Maintenance: 'Maintien de la silhouette',
  Endurance: 'Endurance musculaire',
};

const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthName = (date) => new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
}).format(date);

const Clients = () => {
   const apiUrl = import.meta.env.VITE_API_URL;
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');
  const [sessionDays, setSessionDays] = useState([]);
  const [activityLevel, setActivityLevel] = useState('');
  const [bmi, setBmi] = useState('');
  const [estimatedCalories, setEstimatedCalories] = useState('');
  const [editingClientId, setEditingClientId] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openMenuClientId, setOpenMenuClientId] = useState(null);
  const [calendarClient, setCalendarClient] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const weightKg = Number(weight);
    const heightCm = Number(height);
    if (!weight || !height || !Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm <= 0) {
      setBmi('');
      return;
    }

    setBmi((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
  }, [weight, height]);

  useEffect(() => {
    const ageYears = Number(age);
    const weightKg = Number(weight);
    const heightCm = Number(height);
    const activityMultiplier = Number(activityLevel);
    if (
      !age || !gender || !weight || !height || !activityLevel ||
      !Number.isFinite(ageYears) || !Number.isFinite(weightKg) ||
      !Number.isFinite(heightCm) || !Number.isFinite(activityMultiplier) ||
      ageYears <= 0 || weightKg <= 0 || heightCm <= 0 || activityMultiplier <= 0
    ) {
      if (!editingClientId) setEstimatedCalories('');
      return;
    }

    const genderAdjustment = gender === 'male' ? 5 : -161;
    const baselineCalories = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + genderAdjustment;
    setEstimatedCalories(String(Math.round(baselineCalories * activityMultiplier)));
  }, [age, gender, weight, height, activityLevel, editingClientId]);

  useEffect(() => {
    if (!isFormOpen && !calendarClient) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFormOpen(false);
        setCalendarClient(null);
        setSelectedCalendarDate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, calendarClient]);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/clients`);
      setClients(res.data);
    } catch (err) {
      console.error('Erreur de récupération des clients', err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const clientData = {
        name,
        age: Number(age),
        gender,
        weight: Number(weight),
        height: Number(height),
        goal,
        sessionDays,
        ...(activityLevel ? { activityLevel: Number(activityLevel) } : {}),
        ...(estimatedCalories ? { targetCalories: Number(estimatedCalories) } : {}),
      };

      if (editingClientId) {
        await axios.put(`${apiUrl}/clients/${editingClientId}`, clientData);
      } else {
        await axios.post(`${apiUrl}/clients`, clientData);
      }

      resetForm();
      setIsFormOpen(false);
      await fetchClients();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du client", err);
      window.alert(err.response?.data?.message || "Impossible d'enregistrer ce client.");
    }
  };

  const resetForm = () => {
    setName('');
    setAge('');
    setGender('');
    setWeight('');
    setHeight('');
    setGoal('');
    setSessionDays([]);
    setActivityLevel('');
    setEditingClientId(null);
  };

  const openNewClientForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const startEditing = (client) => {
    setEditingClientId(client._id);
    setName(client.name || '');
    setAge(String(client.age ?? ''));
    setGender(client.gender || '');
    setWeight(String(client.weight ?? ''));
    setHeight(String(client.height ?? ''));
    setActivityLevel(String(client.activityLevel ?? ''));
    setEstimatedCalories(String(client.targetCalories ?? ''));
    setGoal(LEGACY_GOAL_MAP[client.goal] || client.goal || '');
    setSessionDays(client.sessionDays || []);
    setOpenMenuClientId(null);
    setIsFormOpen(true);
  };

  const updateAttendance = async (client, attendanceDate, status) => {
    try {
      await axios.put(`${apiUrl}/clients/${client._id}/attendance`, {
        attendanceDate,
        status,
      });
      await fetchClients();
      setCalendarClient((currentClient) => (
        currentClient?._id === client._id
          ? {
            ...currentClient,
            attendanceDates: status === 'attended'
              ? [...new Set([...(currentClient.attendanceDates || []), attendanceDate])]
              : (currentClient.attendanceDates || []).filter((date) => date !== attendanceDate),
            absentDates: status === 'absent'
              ? [...new Set([...(currentClient.absentDates || []), attendanceDate])]
              : (currentClient.absentDates || []).filter((date) => date !== attendanceDate),
          }
          : currentClient
      ));
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la présence", err);
      window.alert(err.response?.data?.message || "Impossible de mettre à jour la présence.");
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer ${client.name} ?`)) return;

    try {
      await axios.delete(`${apiUrl}/clients/${client._id}`);
      setClients((currentClients) => currentClients.filter((item) => item._id !== client._id));
      setOpenMenuClientId(null);
    } catch (err) {
      console.error('Erreur lors de la suppression du client', err);
      window.alert(err.response?.data?.message || 'Impossible de supprimer ce client.');
    }
  };

  const getInactiveDays = (client) => {
    const lastAttendance = client.lastAttendanceAt || client.createdAt;
    if (!lastAttendance) return null;

    const lastAttendanceDate = new Date(lastAttendance);
    if (Number.isNaN(lastAttendanceDate.getTime())) return null;

    return Math.floor((currentTime - lastAttendanceDate.getTime()) / DAY_IN_MILLISECONDS);
  };

  const getAttendanceStatus = (client, date) => {
    const dateKey = getLocalDateKey(date);
    if ((client.attendanceDates || []).includes(dateKey)) return 'attended';
    if ((client.absentDates || []).includes(dateKey)) return 'absent';

    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const createdDate = client.createdAt ? new Date(client.createdAt) : null;
    if (createdDate) createdDate.setHours(0, 0, 0, 0);
    const isScheduled = (client.sessionDays || []).includes(date.getDay());

    if (isScheduled && selectedDate < today && (!createdDate || selectedDate >= createdDate)) {
      return 'absent';
    }
    if (isScheduled && selectedDate >= today) return 'pending';
    return 'none';
  };

  const getMissedSessionDates = (client, month = new Date(currentTime)) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1))
      .filter((date) => getAttendanceStatus(client, date) === 'absent');
  };

  const toggleSessionDay = (day) => {
    setSessionDays((currentDays) => (
      currentDays.includes(day)
        ? currentDays.filter((selectedDay) => selectedDay !== day)
        : [...currentDays, day].sort((first, second) => first - second)
    ));
  };

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('fr');
    return clients.filter((client) => {
      const clientGoal = LEGACY_GOAL_MAP[client.goal] || client.goal;
      return (
        client.name?.toLocaleLowerCase('fr').includes(normalizedSearch) &&
        (!goalFilter || clientGoal === goalFilter)
      );
    });
  }, [clients, search, goalFilter]);

  const availableGoals = useMemo(() => (
    [...new Set(clients.map((client) => LEGACY_GOAL_MAP[client.goal] || client.goal).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, 'fr'))
  ), [clients]);

  const openCalendar = (client) => {
    const today = new Date();
    setCalendarClient(client);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedCalendarDate(null);
    setOpenMenuClientId(null);
  };

  const calendarDays = useMemo(() => {
    const firstWeekday = (calendarMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    ).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => (
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), index + 1)
      )),
    ];
  }, [calendarMonth]);

  const monthSummary = useMemo(() => {
    if (!calendarClient) return { attended: 0, absent: 0, remaining: 0 };
    return calendarDays.reduce((summary, date) => {
      if (!date || !(calendarClient.sessionDays || []).includes(date.getDay())) return summary;
      const status = getAttendanceStatus(calendarClient, date);
      if (status === 'attended') summary.attended += 1;
      else if (status === 'absent') summary.absent += 1;
      else if (status === 'pending') summary.remaining += 1;
      return summary;
    }, { attended: 0, absent: 0, remaining: 0 });
  }, [calendarClient, calendarDays, currentTime]);

  const calendarMissedSessionDates = useMemo(
    () => (calendarClient ? getMissedSessionDates(calendarClient, calendarMonth) : []),
    [calendarClient, calendarMonth, currentTime],
  );

  const renderClientForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label small" htmlFor="client-name" >Nom et prénom</label>
        <input id="client-name" type="text" className="form-control" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="row g-2 mb-3">
        <div className="col">
          <label className="form-label small" htmlFor="client-age">Âge</label>
          <input id="client-age" type="number" className="form-control" min="12" max="100" step="1" value={age} onChange={(event) => setAge(event.target.value)} required />
        </div>
        <div className="col">
          <label className="form-label small" htmlFor="client-weight">Poids (kg)</label>
          <input id="client-weight" type="number" className="form-control" min="20" max="250" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} required />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label small" htmlFor="client-gender">Genre</label>
        <select id="client-gender" className="form-select" value={gender} onChange={(event) => setGender(event.target.value)} required>
          <option value="" disabled>Sélectionner le genre</option>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label small" htmlFor="client-height">Taille (cm)</label>
        <input id="client-height" type="number" className="form-control" min="100" max="250" step="1" value={height} onChange={(event) => setHeight(event.target.value)} required />
      </div>
      <div className="mb-3">
        <label className="form-label small" htmlFor="client-bmi">IMC (Calculé)</label>
        <input id="client-bmi" type="text" className="form-control clients-calculated-field" value={bmi} placeholder="Calculé automatiquement" disabled readOnly />
      </div>
      <div className="mb-3">
        <label className="form-label small" htmlFor="client-goal">Objectif</label>
        <select id="client-goal" className="form-select" value={goal} onChange={(event) => setGoal(event.target.value)} required>
          <option value="" disabled>Sélectionner l'objectif</option>
          <optgroup label="Esthétique">
            <option value="Prise de masse">Prise de masse</option>
            <option value="Perte de gras">Perte de gras</option>
            <option value="Recomposition corporelle">Recomposition corporelle</option>
            <option value="Maintien de la silhouette">Maintien de la silhouette</option>
          </optgroup>
          <optgroup label="Performance">
            <option value="Force maximale">Force maximale</option>
            <option value="Explosivité & Puissance">Explosivité &amp; Puissance</option>
            <option value="Endurance musculaire">Endurance musculaire</option>
            <option value="Préparation physique spécifique">Préparation physique spécifique</option>
          </optgroup>
          <optgroup label="Santé & transition">
            <option value="Réathlétisation">Réathlétisation</option>
            <option value="Remise en forme">Remise en forme</option>
            <option value="Posture & Mobilité">Posture &amp; Mobilité</option>
            <option value="Renforcement fonctionnel">Renforcement fonctionnel</option>
          </optgroup>
        </select>
      </div>
      <fieldset className="mb-4">
        <legend className="form-label small mb-1">Séances par semaine</legend>
        <div className="small text-muted mb-2" aria-live="polite">
          {sessionDays.length} séance{sessionDays.length === 1 ? '' : 's'} par semaine
        </div>
        <div className="clients-weekday-grid" aria-label="Choisir les jours de séance">
          {WEEK_DAYS.map(({ label, value }) => (
            <label className="form-check clients-weekday-option m-0" key={label}>
              <input className="form-check-input" type="checkbox" checked={sessionDays.includes(value)} onChange={() => toggleSessionDay(value)} />
              <span className="form-check-label small">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mb-3">
        <label className="form-label small" htmlFor="client-activity">Niveau d'activité physique</label>
        <select id="client-activity" className="form-select" value={activityLevel} onChange={(event) => setActivityLevel(event.target.value)}>
          <option value="">Sélectionner un niveau d'activité</option>
          <option value="1.2">Sédentaire (1.2)</option>
          <option value="1.375">Légèrement actif (1.375)</option>
          <option value="1.55">Modérément actif (1.55)</option>
          <option value="1.725">Très actif (1.725)</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="form-label small" htmlFor="client-calories">Besoins Caloriques Estimés (Maintien)</label>
        <input id="client-calories" type="text" className="form-control clients-calculated-field" value={estimatedCalories} placeholder="Calculé automatiquement" disabled readOnly />
      </div>
      <button type="submit" className="btn btn-success-custom w-100">
        {editingClientId ? 'Enregistrer les modifications' : 'Ajouter le client'}
      </button>
      {editingClientId && (
        <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={() => { resetForm(); setIsFormOpen(false); }}>
          Annuler
        </button>
      )}
    </form>
  );

  return (
    <main className="container clients-page mt-4">
      <header className="clients-page__header">
        <div>
          <span className="clients-page__eyebrow">Votre suivi au quotidien</span>
          <h1 className="page-heading mb-1">Mes Clients</h1>
          <p className="clients-page__subtitle mb-0">Gérez vos suivis et gardez le cap sur chaque objectif.</p>
        </div>
        <button type="button" className="btn btn-success-custom clients-page__add" onClick={openNewClientForm}>
          <i className="bi bi-plus-lg" aria-hidden="true" /> Ajouter un client
        </button>
      </header>

      <section className="clients-toolbar" aria-label="Rechercher et filtrer les clients">
        <div className="clients-search">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            className="form-control"
            placeholder="Rechercher par nom et prénom…"
            aria-label="Rechercher par nom et prénom"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <label className="clients-filter">
          <span>Objectif</span>
          <select className="form-select" value={goalFilter} onChange={(event) => setGoalFilter(event.target.value)} aria-label="Filtrer par objectif">
            <option value="">Tous les objectifs</option>
            {availableGoals.map((availableGoal) => <option key={availableGoal} value={availableGoal}>{availableGoal}</option>)}
          </select>
        </label>
        <span className="clients-toolbar__count">{filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}</span>
      </section>

      {filteredClients.length ? (
        <section className="clients-grid" aria-label="Liste de mes clients">
          {filteredClients.map((client) => {
            const inactiveDays = getInactiveDays(client);
            const missedSessionDates = getMissedSessionDates(client);
            const isAttendedToday = getAttendanceStatus(client, new Date(currentTime)) === 'attended';
            const normalizedGoal = LEGACY_GOAL_MAP[client.goal] || client.goal;
            return (
              <article className="card client-card shadow-sm" key={client._id}>
                <div className="card-body">
                  <div className="client-card__top">
                    <div className="client-card__identity">
                      <h2 className="card-title fw-bold mb-1">{client.name}</h2>
                      <span className="badge badge-monitor">{normalizedGoal}</span>
                    </div>
                    <div className="client-card__actions">
                      <button
                        type="button"
                        className="client-card__calendar"
                        onClick={() => openCalendar(client)}
                        aria-label={`Voir le calendrier de ${client.name}`}
                        title="Calendrier des séances"
                      >
                        <i className="bi bi-calendar3" aria-hidden="true" />
                      </button>
                      <div className="client-card__menu-wrap">
                        <button
                          type="button"
                          className="client-card__menu-trigger"
                          onClick={() => setOpenMenuClientId((id) => id === client._id ? null : client._id)}
                          aria-label={`Plus d’options pour ${client.name}`}
                          aria-expanded={openMenuClientId === client._id}
                        >
                          <i className="bi bi-three-dots-vertical" aria-hidden="true" />
                        </button>
                        {openMenuClientId === client._id && (
                          <div className="client-card__menu" role="menu">
                            <button type="button" role="menuitem" onClick={() => startEditing(client)}>
                              <i className="bi bi-pencil" aria-hidden="true" /> Modifier
                            </button>
                            <button type="button" role="menuitem" className="client-card__menu-delete" onClick={() => handleDelete(client)}>
                              <i className="bi bi-trash3" aria-hidden="true" /> Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="client-card__metrics">
                    <span><i className="bi bi-person" aria-hidden="true" /> {client.age} ans</span>
                    <span><i className="bi bi-speedometer2" aria-hidden="true" /> {client.weight} kg</span>
                    <span><i className="bi bi-arrows-vertical" aria-hidden="true" /> {client.height} cm</span>
                  </div>
                  <p className="client-card__schedule mb-0">
                    <i className="bi bi-clock" aria-hidden="true" />
                    {(client.sessionDays || [])
                      .slice()
                      .sort((first, second) => WEEK_DAYS.findIndex((day) => day.value === first) - WEEK_DAYS.findIndex((day) => day.value === second))
                      .map((day) => WEEK_DAYS.find((item) => item.value === day)?.label)
                      .join(' · ') || 'Aucune séance planifiée'}
                  </p>
                  <Link
                    className="client-card__program-link"
                    to={`/builder?clientId=${encodeURIComponent(client._id)}`}
                  >
                    <i className="bi bi-clipboard2-plus" aria-hidden="true" /> Créer un programme
                  </Link>

                  {inactiveDays !== null && inactiveDays >= INACTIVITY_THRESHOLD_DAYS && (
                    <div className="alert alert-warning mt-3 mb-0 py-2" role="alert">
                      Inactivité depuis {inactiveDays} jours
                    </div>
                  )}
                  {missedSessionDates.length > 0 && (
                    <p className="client-card__missed-summary mb-0 mt-3" role="status">
                      <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                      {missedSessionDates.length} séance{missedSessionDates.length > 1 ? 's' : ''} manquée{missedSessionDates.length > 1 ? 's' : ''} ce mois-ci
                    </p>
                  )}

                  {isAttendedToday ? (
                    <div className="client-card__attended mt-4" role="status">
                      <i className="bi bi-check-circle-fill" aria-hidden="true" /> Séance complétée aujourd’hui
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-success-custom client-card__attendance mt-4"
                      onClick={() => updateAttendance(client, getLocalDateKey(new Date(currentTime)), 'attended')}
                    >
                      <i className="bi bi-check2-circle" aria-hidden="true" /> Séance effectuée
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="clients-empty">
          <i className="bi bi-people" aria-hidden="true" />
          <h2>{clients.length ? 'Aucun résultat' : 'Aucun client pour le moment'}</h2>
          <p>{clients.length ? 'Essayez de modifier votre recherche ou votre filtre.' : 'Ajoutez votre premier client pour commencer son suivi.'}</p>
          {!clients.length && <button type="button" className="btn btn-success-custom" onClick={openNewClientForm}>Ajouter un client</button>}
        </div>
      )}

      {isFormOpen && (
        <div className="clients-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) { setIsFormOpen(false); resetForm(); } }}>
          <aside className="clients-drawer" role="dialog" aria-modal="true" aria-labelledby="client-form-title">
            <div className="clients-drawer__header">
              <div>
                <span className="clients-page__eyebrow">Espace coach</span>
                <h2 id="client-form-title">{editingClientId ? 'Modifier le client' : 'Nouveau client'}</h2>
              </div>
              <button type="button" className="clients-icon-button" onClick={() => { setIsFormOpen(false); resetForm(); }} aria-label="Fermer le formulaire">
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>
            <div className="clients-drawer__body">{renderClientForm()}</div>
          </aside>
        </div>
      )}

      {calendarClient && (
        <div className="clients-overlay clients-overlay--center" onMouseDown={(event) => { if (event.target === event.currentTarget) { setCalendarClient(null); setSelectedCalendarDate(null); } }}>
          <section className="attendance-modal" role="dialog" aria-modal="true" aria-labelledby="attendance-title">
            <header className="attendance-modal__header">
              <div>
                <span className="clients-page__eyebrow">Suivi des séances</span>
                <h2 id="attendance-title">{calendarClient.name}</h2>
              </div>
              <button type="button" className="clients-icon-button" onClick={() => { setCalendarClient(null); setSelectedCalendarDate(null); }} aria-label="Fermer le calendrier">
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </header>
            <div className="attendance-summary">
              <span>Ce mois-ci :</span>
              <strong className="attendance-summary__attended">{monthSummary.attended} complétée{monthSummary.attended > 1 ? 's' : ''}</strong>
              <span className="attendance-summary__separator">|</span>
              <strong className="attendance-summary__absent">{monthSummary.absent} manquée{monthSummary.absent > 1 ? 's' : ''}</strong>
              <span className="attendance-summary__separator">|</span>
              <strong className="attendance-summary__pending">{monthSummary.remaining} restante{monthSummary.remaining > 1 ? 's' : ''}</strong>
            </div>
            <div className="attendance-calendar__controls">
              <button type="button" className="clients-icon-button" aria-label="Mois précédent" onClick={() => { setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1)); setSelectedCalendarDate(null); }}>
                <i className="bi bi-chevron-left" aria-hidden="true" />
              </button>
              <h3>{getMonthName(calendarMonth)}</h3>
              <button type="button" className="clients-icon-button" aria-label="Mois suivant" onClick={() => { setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1)); setSelectedCalendarDate(null); }}>
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </button>
            </div>
            <div className="attendance-calendar" role="grid" aria-label={`Calendrier de ${getMonthName(calendarMonth)}`}>
              {WEEK_DAYS.map(({ label }) => (
                <div className="attendance-calendar__weekday" role="columnheader" key={label}>{label.slice(0, 3)}</div>
              ))}
              {calendarDays.map((date, index) => {
                if (!date) return <div className="attendance-calendar__blank" key={`blank-${index}`} />;
                const status = getAttendanceStatus(calendarClient, date);
                const dateKey = getLocalDateKey(date);
                const isSelected = selectedCalendarDate === dateKey;
                return (
                  <button
                    type="button"
                    role="gridcell"
                    key={dateKey}
                    className={`attendance-calendar__day attendance-calendar__day--${status}${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setSelectedCalendarDate((selected) => selected === dateKey ? null : dateKey)}
                    aria-label={`${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} : ${status === 'attended' ? 'complétée' : status === 'absent' ? 'manquée' : status === 'pending' ? 'à venir' : 'aucune séance planifiée'}`}
                    aria-pressed={isSelected}
                  >
                    <span>{date.getDate()}</span>
                    {status !== 'none' && <i className="attendance-calendar__dot" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <div className="attendance-legend">
              <span><i className="attendance-calendar__dot attendance-calendar__dot--attended" /> Complétée</span>
              <span><i className="attendance-calendar__dot attendance-calendar__dot--absent" /> Manquée</span>
              <span><i className="attendance-calendar__dot attendance-calendar__dot--pending" /> À venir</span>
            </div>
            <section className="attendance-missed-history" aria-label={`Séances manquées en ${getMonthName(calendarMonth)}`}>
              <h3>Séances manquées en {getMonthName(calendarMonth)}</h3>
              {calendarMissedSessionDates.length ? (
                <ul>
                  {calendarMissedSessionDates.map((date) => (
                    <li key={getLocalDateKey(date)}>
                      {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucune séance manquée ce mois-ci.</p>
              )}
            </section>
            {selectedCalendarDate && (
              <div className="attendance-day-editor">
                <div>
                  <strong>{new Date(`${selectedCalendarDate}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                  <span>
                    {getAttendanceStatus(calendarClient, new Date(`${selectedCalendarDate}T12:00:00`)) === 'attended'
                      ? 'Séance complétée'
                      : getAttendanceStatus(calendarClient, new Date(`${selectedCalendarDate}T12:00:00`)) === 'absent'
                        ? 'Séance manquée'
                        : getAttendanceStatus(calendarClient, new Date(`${selectedCalendarDate}T12:00:00`)) === 'pending'
                          ? 'Séance à venir'
                          : 'Aucune séance planifiée'}
                  </span>
                </div>
                <div className="attendance-day-editor__actions">
                  <button type="button" className="btn btn-sm btn-success-custom" onClick={() => updateAttendance(calendarClient, selectedCalendarDate, 'attended')}>
                    <i className="bi bi-check-lg" aria-hidden="true" /> Présente
                  </button>
                  <button type="button" className="btn btn-sm attendance-day-editor__absent" onClick={() => updateAttendance(calendarClient, selectedCalendarDate, 'absent')}>
                    <i className="bi bi-x-lg" aria-hidden="true" /> Absente
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default Clients;
