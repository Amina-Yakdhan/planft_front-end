import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './Nutrition.css';

 const apiUrl = import.meta.env.VITE_API_URL;
const CUSTOM_FOODS_STORAGE_KEY = 'planfit-custom-nutrition-foods';
const MEAL_TYPES = [
  { id: 'breakfast', label: 'Petit-déjeuner', icon: 'bi-sunrise' },
  { id: 'lunch', label: 'Déjeuner', icon: 'bi-sun' },
  { id: 'snack', label: 'Collation', icon: 'bi-cup-hot' },
  { id: 'dinner', label: 'Dîner', icon: 'bi-moon-stars' },
];

const listeAlimentsPLANFIT = [
  { id: 1, nom: 'Flocons d’avoine', calories: 389, proteines: 16.9, glucides: 66.3, lipides: 6.9, fibres: 10.6 },
  { id: 2, nom: 'Pain complet', calories: 247, proteines: 8.0, glucides: 43.0, lipides: 2.0, fibres: 7.0 },
  { id: 3, nom: 'Riz basmati cuit', calories: 130, proteines: 2.7, glucides: 28.0, lipides: 0.3, fibres: 0.4 },
  { id: 4, nom: 'Pâtes complètes cuites', calories: 124, proteines: 5.3, glucides: 23.0, lipides: 0.6, fibres: 2.8 },
  { id: 5, nom: 'Pomme de terre cuite', calories: 87, proteines: 1.9, glucides: 20.0, lipides: 0.1, fibres: 1.8 },
  { id: 6, nom: 'Patate douce cuite', calories: 86, proteines: 1.6, glucides: 20.0, lipides: 0.1, fibres: 3.0 },
  { id: 7, nom: 'Quinoa cuit', calories: 120, proteines: 4.4, glucides: 21.3, lipides: 1.9, fibres: 2.8 },
  { id: 8, nom: 'Poulet cuit', calories: 165, proteines: 31.0, glucides: 0.0, lipides: 3.6, fibres: 0.0 },
  { id: 9, nom: 'Dinde cuite', calories: 135, proteines: 30.0, glucides: 0.0, lipides: 1.0, fibres: 0.0 },
  { id: 10, nom: 'Saumon cuit', calories: 206, proteines: 22.0, glucides: 0.0, lipides: 12.0, fibres: 0.0 },
  { id: 11, nom: 'Thon au naturel égoutté', calories: 116, proteines: 26.0, glucides: 0.0, lipides: 1.0, fibres: 0.0 },
  { id: 12, nom: 'Œuf entier', calories: 155, proteines: 13.0, glucides: 1.1, lipides: 11.0, fibres: 0.0 },
  { id: 13, nom: 'Tofu ferme', calories: 144, proteines: 17.0, glucides: 2.8, lipides: 8.0, fibres: 1.4 },
  { id: 14, nom: 'Lentilles cuites', calories: 116, proteines: 9.0, glucides: 20.0, lipides: 0.4, fibres: 7.9 },
  { id: 15, nom: 'Pois chiches cuits', calories: 164, proteines: 8.9, glucides: 27.0, lipides: 2.6, fibres: 7.6 },
  { id: 16, nom: 'Skyr nature', calories: 57, proteines: 11.0, glucides: 4.0, lipides: 0.2, fibres: 0.0 },
  { id: 17, nom: 'Yaourt grec nature', calories: 73, proteines: 10.0, glucides: 4.0, lipides: 1.9, fibres: 0.0 },
  { id: 18, nom: 'Fromage blanc 0 %', calories: 48, proteines: 8.0, glucides: 4.0, lipides: 0.1, fibres: 0.0 },
  { id: 19, nom: 'Lait demi-écrémé', calories: 46, proteines: 3.3, glucides: 4.8, lipides: 1.6, fibres: 0.0 },
  { id: 20, nom: 'Banane', calories: 89, proteines: 1.1, glucides: 23.0, lipides: 0.3, fibres: 2.6 },
  { id: 21, nom: 'Pomme', calories: 52, proteines: 0.3, glucides: 14.0, lipides: 0.2, fibres: 2.4 },
  { id: 22, nom: 'Fruits rouges', calories: 43, proteines: 0.9, glucides: 10.0, lipides: 0.3, fibres: 4.5 },
  { id: 23, nom: 'Avocat', calories: 160, proteines: 2.0, glucides: 9.5, lipides: 14.7, fibres: 6.7 },
  { id: 24, nom: 'Amandes', calories: 579, proteines: 21.0, glucides: 22.0, lipides: 49.0, fibres: 12.0 },
  { id: 25, nom: 'Beurre de cacahuète', calories: 588, proteines: 25.0, glucides: 20.0, lipides: 50.0, fibres: 6.0 },
  { id: 26, nom: "Huile d'olive", calories: 884, proteines: 0.0, glucides: 0.0, lipides: 100.0, fibres: 0.0 },
  { id: 27, nom: 'Brocoli cuit', calories: 35, proteines: 2.4, glucides: 7.0, lipides: 0.4, fibres: 3.3 },
  { id: 28, nom: 'Épinards cuits', calories: 23, proteines: 3.0, glucides: 3.8, lipides: 0.3, fibres: 2.4 },
  { id: 29, nom: 'Tomate', calories: 18, proteines: 0.9, glucides: 3.9, lipides: 0.2, fibres: 1.2 },
  { id: 30, nom: 'Carotte', calories: 41, proteines: 0.9, glucides: 10.0, lipides: 0.2, fibres: 2.8 },
  { id: 31, nom: 'Emmental', calories: 380, proteines: 28.0, glucides: 0.1, lipides: 29.0, fibres: 0.0 },
  { id: 32, nom: 'Chocolat noir 70 %', calories: 566, proteines: 7.5, glucides: 34.0, lipides: 41.0, fibres: 11.0 },
];

const FOODS = listeAlimentsPLANFIT;
const LEGACY_FOOD_IDS = {
  oats: 1, bread: 2, rice: 3, pasta: 4, potato: 5, 'sweet-potato': 6, quinoa: 7,
  chicken: 8, turkey: 9, salmon: 10, tuna: 11, egg: 12, tofu: 13, lentils: 14,
  chickpeas: 15, skyr: 16, 'greek-yogurt': 17, cottage: 18, milk: 19, banana: 20,
  apple: 21, berries: 22, avocado: 23, almonds: 24, 'peanut-butter': 25,
  'olive-oil': 26, broccoli: 27, spinach: 28, tomato: 29, carrot: 30,
  cheese: 31, 'dark-chocolate': 32,
};

const EMPTY_FOOD_DRAFT = {
  nom: '',
  calories: '',
  proteines: '',
  glucides: '',
  lipides: '',
  fibres: '0',
};

const normalizeFoodName = (name) => String(name || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('fr-FR')
  .trim();

const makeEmptyMeals = () => MEAL_TYPES.map(({ id, label }) => ({
  id,
  name: label,
  items: [{ id: `${id}-${Date.now()}-${Math.random()}`, foodId: '', quantity: 100 }],
}));

const round = (value) => Math.round(value * 10) / 10;
const format = (value) => Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const normalizeGoal = (goal) => String(goal || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('fr-FR')
  .trim();

const getGoalConfig = (goal) => {
  const normalizedGoal = normalizeGoal(goal);
  if (normalizedGoal === 'prise de masse') return { calorieAdjustment: 350, proteinRate: 2, fatRate: 1, fiber: 35 };
  if (normalizedGoal === 'perte de gras') return { calorieAdjustment: -400, proteinRate: 2.3, fatRate: 0.9, fiber: 30 };
  if (normalizedGoal === 'recomposition corporelle' || normalizedGoal === 'recompotision corporelle') {
    return { calorieAdjustment: -150, proteinRate: 2.3, fatRate: 0.9, fiber: 30 };
  }
  if (['force maximale', 'explosivite & puissance'].includes(normalizedGoal)) {
    return { calorieAdjustment: 200, proteinRate: 2, fatRate: 1, fiber: 35 };
  }
  if ([
    'maintien de la silhouette',
    'remise en forme',
    'posture & mobilite',
  ].includes(normalizedGoal)) {
    return { calorieAdjustment: 0, proteinRate: 1.6, fatRate: 1, fiber: 25 };
  }
  if (['reatletisation', 'reathletisation'].includes(normalizedGoal)) {
    return { calorieAdjustment: -0.05, calorieAdjustmentIsRatio: true, proteinRate: 1.7, fatRate: 1, fiber: 30 };
  }
  if ([
    'endurance musculaire',
    'renforcement fonctionnel',
    'preparation physique specifique',
  ].includes(normalizedGoal)) {
    return { calorieAdjustment: 100, proteinRate: 1.7, fatRate: 1, fiber: 30 };
  }
  return null;
};

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getTargets = (client) => {
  const age = Number(client?.age);
  const weight = Number(client?.weight);
  const height = Number(client?.height);
  const goalConfig = getGoalConfig(client?.goal);
  if (
    !goalConfig || !Number.isFinite(age) || age <= 0 ||
    !Number.isFinite(weight) || weight <= 0 ||
    !Number.isFinite(height) || height <= 0 ||
    !['male', 'female'].includes(client?.gender)
  ) return null;

  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (client.gender === 'male' ? 5 : -161);
  const maintenance = bmr * 1.45;
  const calories = Math.round(goalConfig.calorieAdjustmentIsRatio
    ? maintenance * (1 + goalConfig.calorieAdjustment)
    : maintenance + goalConfig.calorieAdjustment);
  const protein = round(weight * goalConfig.proteinRate);
  const fat = round(weight * goalConfig.fatRate);
  const carbs = round((calories - protein * 4 - fat * 9) / 4);

  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    calories,
    protein,
    carbs,
    fat,
    fiber: goalConfig.fiber,
    rates: { protein: goalConfig.proteinRate, fat: goalConfig.fatRate },
  };
};

const getFoodForItem = (item, foods = FOODS) => {
  const legacyId = LEGACY_FOOD_IDS[item.foodId];
  const foodId = String(legacyId || item.foodId || '');
  const normalizedName = normalizeFoodName(item.foodName);

  return foods.find((entry) => String(entry.id) === foodId)
    || foods.find((entry) => normalizeFoodName(entry.nom) === normalizedName);
};

const getNutrients = (item, foods = FOODS) => {
  const food = getFoodForItem(item, foods);
  const quantity = Number(item.quantity);
  if (!food || !Number.isFinite(quantity) || quantity <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }
  const factor = quantity / 100;
  return {
    calories: food.calories * factor,
    protein: food.proteines * factor,
    carbs: food.glucides * factor,
    fat: food.lipides * factor,
    fiber: food.fibres * factor,
  };
};

const totalNutrients = (meals, foods = FOODS) => meals.reduce((total, meal) => meal.items.reduce((mealTotal, item) => {
  const nutrients = getNutrients(item, foods);
  Object.keys(total).forEach((key) => { mealTotal[key] += nutrients[key]; });
  return mealTotal;
}, total), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

const Nutrition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientId: routeClientId = '', planId: routePlanId = '' } = useParams();
  const [clients, setClients] = useState([]);
  const clientId = routeClientId;
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState(makeEmptyMeals);
  const [customFoods, setCustomFoods] = useState([]);
  const [isFoodCatalogLoaded, setIsFoodCatalogLoaded] = useState(false);
  const [foodSearches, setFoodSearches] = useState({});
  const [activeFoodSearch, setActiveFoodSearch] = useState('');
  const [foodModal, setFoodModal] = useState(null);
  const [foodDraft, setFoodDraft] = useState(EMPTY_FOOD_DRAFT);
  const [foodModalError, setFoodModalError] = useState('');
  const [plans, setPlans] = useState([]);
  const [progress, setProgress] = useState([]);
  const isEditingPlan = Boolean(routePlanId && location.pathname.endsWith('/edit'));
  const selectedPlanId = isEditingPlan ? routePlanId : '';
  const isFormOpen = location.pathname === '/nutrition/new'
    || location.pathname.endsWith('/plan/new')
    || isEditingPlan;
  const [weightEntry, setWeightEntry] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [hasPlansLoadError, setHasPlansLoadError] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const foods = useMemo(() => [...FOODS, ...customFoods], [customFoods]);

  useEffect(() => {
    try {
      const savedFoods = localStorage.getItem(CUSTOM_FOODS_STORAGE_KEY);
      if (savedFoods) {
        const parsedFoods = JSON.parse(savedFoods);
        if (!Array.isArray(parsedFoods) || parsedFoods.some((food) => (
          !food || typeof food.nom !== 'string' ||
          !['calories', 'proteines', 'glucides', 'lipides', 'fibres'].every((key) => (
            Number.isFinite(Number(food[key])) && Number(food[key]) >= 0
          ))
        ))) {
          throw new Error('Le catalogue des aliments personnalisés est invalide.');
        }
        setCustomFoods(parsedFoods);
      }
    } catch (storageError) {
      console.error('Erreur de lecture des aliments personnalisés', storageError);
      setError('Impossible de charger les aliments personnalisés enregistrés dans ce navigateur.');
    } finally {
      setIsFoodCatalogLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isFoodCatalogLoaded) return;
    try {
      localStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(customFoods));
    } catch (storageError) {
      console.error('Erreur de sauvegarde des aliments personnalisés', storageError);
      setError('Impossible de sauvegarder cet aliment dans ce navigateur.');
    }
  }, [customFoods, isFoodCatalogLoaded]);

  useEffect(() => {
    let active = true;
    axios.get(`${apiUrl}/clients`)
      .then(({ data }) => { if (active) setClients(data); })
      .catch((requestError) => {
        console.error('Erreur de chargement des clients pour Nutrition', requestError);
        if (active) setError('Impossible de charger les clients.');
      })
      .finally(() => { if (active) setIsLoadingClients(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    axios.get(`${apiUrl}/nutrition/plans`)
      .then(({ data }) => { if (active) setPlans(data); })
      .catch((requestError) => {
        console.error('Erreur de chargement des plans nutritionnels', requestError);
        if (active) {
          setHasPlansLoadError(true);
          setError('Impossible de charger les plans nutritionnels.');
        }
      })
      .finally(() => { if (active) setIsLoadingPlans(false); });
    return () => { active = false; };
  }, []);

  const client = clients.find((entry) => entry._id === clientId);
  const normalizedSearchQuery = searchQuery.trim().replace(/\s+/g, ' ');
  const filteredClients = useMemo(() => clients.filter((entry) => (
    !normalizedSearchQuery
    || entry.name.trim().replace(/\s+/g, ' ').includes(normalizedSearchQuery)
  )), [clients, normalizedSearchQuery]);
  const plansByClient = useMemo(() => plans.reduce((counts, plan) => {
    const id = typeof plan.clientId === 'object' ? plan.clientId?._id : plan.clientId;
    if (id) counts[id] = (counts[id] || 0) + 1;
    return counts;
  }, {}), [plans]);
  const clientPlans = useMemo(() => plans
    .filter((plan) => (typeof plan.clientId === 'object' ? plan.clientId?._id : plan.clientId) === clientId)
    .sort((first, second) => (
      new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
      || first._id.localeCompare(second._id)
    )), [clientId, plans]);
  const selectedPlanIndex = clientPlans.findIndex((plan) => plan._id === routePlanId);
  const selectedPlan = selectedPlanIndex >= 0 ? clientPlans[selectedPlanIndex] : null;
  const targets = useMemo(() => getTargets(client), [client]);
  const totals = useMemo(() => totalNutrients(meals, foods), [foods, meals]);
  const weightHistory = useMemo(() => (
    [...progress].sort((first, second) => new Date(first.recordedAt) - new Date(second.recordedAt))
  ), [progress]);

  useEffect(() => {
    const legacyClientId = new URLSearchParams(location.search).get('clientId');
    if (location.pathname === '/nutrition' && legacyClientId) {
      navigate(`/nutrition/client/${encodeURIComponent(legacyClientId)}`, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!routePlanId || routePlanId === 'new' || isEditingPlan || isLoadingPlans) return;
    if (!clientPlans.some((plan) => plan._id === routePlanId)) {
      navigate(`/nutrition/client/${encodeURIComponent(clientId)}`, { replace: true });
    }
  }, [clientId, clientPlans, isEditingPlan, isLoadingPlans, navigate, routePlanId]);

  useEffect(() => {
    if (!clientId || !clients.some((entry) => entry._id === clientId)) return undefined;
    let active = true;
    setIsLoadingHistory(true);
    axios.get(`${apiUrl}/nutrition/clients/${clientId}/progress`)
      .then(({ data }) => {
        if (!active) return;
        setProgress(data);
      })
      .catch((requestError) => {
        console.error('Erreur de chargement du suivi nutritionnel', requestError);
        if (active) setError('Impossible de charger le suivi nutritionnel.');
      })
      .finally(() => { if (active) setIsLoadingHistory(false); });
    return () => { active = false; };
  }, [clientId, clients]);

  const handleClientChange = (id) => {
    setProgress([]);
    setMeals(makeEmptyMeals());
    setError('');
    setMessage('');
    if (isFormOpen) {
      navigate(id ? `/nutrition/client/${encodeURIComponent(id)}/plan/new` : '/nutrition/new');
      return;
    }
    navigate(id ? `/nutrition/client/${encodeURIComponent(id)}` : '/nutrition');
  };

  const openNewPlanForm = () => {
    setMeals(makeEmptyMeals());
    setError('');
    setMessage('');
    navigate(clientId ? `/nutrition/client/${encodeURIComponent(clientId)}/plan/new` : '/nutrition/new');
  };

  const updateItem = (mealId, itemId, field, value) => {
    setMeals((current) => current.map((meal) => meal.id === mealId
      ? { ...meal, items: meal.items.map((item) => item.id === itemId ? { ...item, [field]: value } : item) }
      : meal));
  };

  const openFoodModal = (mealId, itemId, searchText) => {
    setFoodModal({ mealId, itemId });
    setFoodDraft({ ...EMPTY_FOOD_DRAFT, nom: searchText.trim() });
    setFoodModalError('');
    setActiveFoodSearch('');
  };

  const saveCustomFood = (event) => {
    event.preventDefault();
    const nom = foodDraft.nom.trim();
    const requiredFields = ['calories', 'proteines', 'glucides', 'lipides'];
    const hasInvalidRequiredValue = requiredFields.some((key) => (
      foodDraft[key] === '' || !Number.isFinite(Number(foodDraft[key])) || Number(foodDraft[key]) < 0
    ));
    const fiberValue = foodDraft.fibres === '' ? 0 : Number(foodDraft.fibres);
    if (!nom || hasInvalidRequiredValue || !Number.isFinite(fiberValue) || fiberValue < 0) {
      setFoodModalError('Saisissez un nom et des valeurs nutritionnelles valides (valeurs positives ou nulles).');
      return;
    }

    const duplicate = foods.find((food) => normalizeFoodName(food.nom) === normalizeFoodName(nom));
    if (duplicate) {
      setFoodModalError('Un aliment portant déjà ce nom existe. Sélectionnez-le dans la liste.');
      return;
    }

    const nextFoodId = Math.max(0, ...foods.map((food) => Number(food.id)).filter(Number.isFinite)) + 1;
    const newFood = {
      id: nextFoodId,
      nom,
      calories: Number(foodDraft.calories),
      proteines: Number(foodDraft.proteines),
      glucides: Number(foodDraft.glucides),
      lipides: Number(foodDraft.lipides),
      fibres: fiberValue,
    };
    const rowKey = `${foodModal.mealId}:${foodModal.itemId}`;

    setCustomFoods((current) => [...current, newFood]);
    updateItem(foodModal.mealId, foodModal.itemId, 'foodId', String(newFood.id));
    setFoodSearches((current) => ({ ...current, [rowKey]: newFood.nom }));
    setFoodModal(null);
    setFoodDraft(EMPTY_FOOD_DRAFT);
    setFoodModalError('');
    setError('');
    setMessage(`« ${newFood.nom} » a été ajouté au catalogue et sélectionné.`);
  };

  const addItem = (mealId) => setMeals((current) => current.map((meal) => meal.id === mealId
    ? { ...meal, items: [...meal.items, { id: `${mealId}-${Date.now()}-${Math.random()}`, foodId: '', quantity: 100 }] }
    : meal));

  const removeItem = (mealId, itemId) => setMeals((current) => current.map((meal) => meal.id === mealId
    ? { ...meal, items: meal.items.filter((item) => item.id !== itemId) }
    : meal));

  const restorePlan = useCallback((plan) => {
    const data = plan.planData;
    setMeals(data.meals.map((meal) => ({
      ...meal,
      items: meal.items.map((item, index) => ({
        ...item,
        foodId: String(LEGACY_FOOD_IDS[item.foodId] || item.foodId || ''),
        id: item.id || `${meal.id}-${plan._id}-${index}`,
      })),
    })));
    setMessage('');
    setError('');
  }, []);

  useEffect(() => {
    if (!isEditingPlan) return;
    const plan = clientPlans.find((entry) => entry._id === routePlanId);
    if (plan) restorePlan(plan);
  }, [clientPlans, isEditingPlan, restorePlan, routePlanId]);

  const startEditingPlan = (plan) => {
    const associatedClientId = typeof plan.clientId === 'object' ? plan.clientId._id : plan.clientId;
    setProgress([]);
    restorePlan(plan);
    navigate(`/nutrition/client/${encodeURIComponent(associatedClientId)}/plan/${encodeURIComponent(plan._id)}/edit`);
  };

  const handleDeletePlan = async (plan) => {
    const planClientId = typeof plan.clientId === 'object' ? plan.clientId?._id : plan.clientId;
    const clientName = clients.find((entry) => entry._id === planClientId)?.name || 'ce client';
    if (!window.confirm(`Voulez-vous vraiment supprimer le plan nutritionnel de ${clientName} ?`)) return;

    setDeletingPlanId(plan._id);
    setError('');
    setMessage('');
    try {
      await axios.delete(`${apiUrl}/nutrition/plans/${plan._id}`);
      setPlans((current) => current.filter((entry) => entry._id !== plan._id));
      setProgress((current) => current.map((entry) => (
        entry.planId === plan._id ? { ...entry, planId: null } : entry
      )));
      if (routePlanId === plan._id) {
        navigate(`/nutrition/client/${encodeURIComponent(clientId)}`, { replace: true });
      }
      setMessage('Plan nutritionnel supprimé.');
    } catch (requestError) {
      console.error('Erreur lors de la suppression du plan nutritionnel', requestError);
      setError(requestError.response?.data?.message || 'Impossible de supprimer le plan nutritionnel.');
    } finally {
      setDeletingPlanId('');
    }
  };

  const handleSavePlan = async () => {
    if (!client || !targets) {
      setError('Le profil client doit inclure un sexe, un âge, un poids, une taille et un objectif reconnus.');
      setMessage('');
      return;
    }
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      const planData = {
        calories: targets.calories,
        macros: { protein: targets.protein, carbs: targets.carbs, fat: targets.fat, fiber: targets.fiber },
        rates: targets.rates,
        meals: meals.map((meal) => ({
          id: meal.id,
          name: meal.name,
          items: meal.items.filter((item) => item.foodId && Number(item.quantity) > 0).map((item) => ({
            foodId: item.foodId,
            foodName: getFoodForItem(item, foods)?.nom || '',
            quantity: Number(item.quantity),
            nutrients: getNutrients(item, foods),
          })),
        })),
        totals,
      };
      const request = selectedPlanId
        ? axios.put(`${apiUrl}/nutrition/plans/${selectedPlanId}`, { clientId, planData })
        : axios.post(`${apiUrl}/nutrition/plans`, { clientId, planData });
      const { data } = await request;
      const nextPlans = [data, ...plans.filter((plan) => plan._id !== data._id)];
      setPlans(nextPlans);
      setMessage(selectedPlanId ? 'Plan nutritionnel mis à jour.' : 'Plan nutritionnel sauvegardé.');
      navigate(`/nutrition/client/${encodeURIComponent(clientId)}/plan/${encodeURIComponent(data._id)}`);
    } catch (requestError) {
      console.error('Erreur de sauvegarde du plan nutritionnel', requestError);
      setError(requestError.response?.data?.message || 'Impossible de sauvegarder le plan nutritionnel.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProgress = async (event) => {
    event.preventDefault();
    if (!clientId || !weightEntry) return;
    setIsSavingProgress(true);
    setError('');
    setMessage('');
    try {
      const { data } = await axios.post(`${apiUrl}/nutrition/progress`, {
        clientId,
        planId: selectedPlan?._id || undefined,
        weight: Number(weightEntry),
        note: weightNote,
        recordedAt: new Date(`${localDate()}T12:00:00`).toISOString(),
      });
      setProgress((current) => [data, ...current]);
      setWeightEntry('');
      setWeightNote('');
      setMessage('Relevé de progression enregistré.');
    } catch (requestError) {
      console.error('Erreur de sauvegarde du relevé de progression', requestError);
      setError(requestError.response?.data?.message || 'Impossible d’enregistrer le relevé.');
    } finally {
      setIsSavingProgress(false);
    }
  };

  return (
    <main className="nutrition-page">
      <header className="nutrition-header">
        <div>
          <span className="nutrition-eyebrow">PLANFIT · SUIVI ALIMENTAIRE</span>
          <h1>Nutrition</h1>
          <p>Retrouvez et gérez les plans alimentaires de vos clients.</p>
        </div>
        <button type="button" className="nutrition-add-plan-button" onClick={openNewPlanForm}>
          <i className="bi bi-plus-lg" aria-hidden="true" /> Ajouter un plan
        </button>
      </header>

      {error && <p className="nutrition-alert nutrition-alert--error" role="alert">{error}</p>}
      {message && <p className="nutrition-alert nutrition-alert--success" role="status">{message}</p>}

      {!isFormOpen && !clientId && (
        <section className="nutrition-plans-overview" aria-label="Plans nutritionnels enregistrés">
          <div className="nutrition-section-title">
            <div><span className="nutrition-eyebrow">VOS CLIENTS</span><h2>Nutrition</h2></div>
            {!isLoadingClients && clients.length > 0 && (
              <div className="nutrition-clients-toolbar">
                <span className="nutrition-plans-count">{clients.length} client{clients.length === 1 ? '' : 's'}</span>
                <label className="nutrition-client-search">
                  <i className="bi bi-search" aria-hidden="true" />
                  <span className="nutrition-sr-only">Rechercher un client</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Rechercher un client..."
                  />
                  {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Effacer la recherche">
                    <i className="bi bi-x-lg" aria-hidden="true" />
                  </button>}
                </label>
              </div>
            )}
          </div>
          {isLoadingClients && <p className="nutrition-empty-inline">Chargement des clients…</p>}
          {!isLoadingClients && clients.length === 0 && (
            <section className="nutrition-empty">
              <i className="bi bi-people" aria-hidden="true" />
              <h2>Aucun client pour le moment</h2>
              <p>Ajoutez un client pour pouvoir créer et suivre ses programmes nutritionnels.</p>
            </section>
          )}
          {!isLoadingClients && clients.length > 0 && filteredClients.length > 0 && (
            <div className="nutrition-clients-grid">
              {filteredClients.map((entry) => {
                const planCount = plansByClient[entry._id] || 0;
                return (
                <button
                  type="button"
                  className="nutrition-client-card"
                  key={entry._id}
                  onClick={() => handleClientChange(entry._id)}
                >
                  <strong>{entry.name}</strong>
                  <span className="nutrition-client-card__count">
                    {isLoadingPlans
                      ? 'Chargement des programmes…'
                      : hasPlansLoadError
                        ? 'Nombre de plans indisponible'
                        : planCount === 0
                          ? 'Aucun plan créé'
                          : `${planCount} plan${planCount === 1 ? '' : 's'} nutritionnel${planCount === 1 ? '' : 's'} enregistré${planCount === 1 ? '' : 's'}`}
                  </span>
                </button>
                );
              })}
            </div>
          )}
          {!isLoadingClients && clients.length > 0 && filteredClients.length === 0 && (
            <section className="nutrition-empty nutrition-empty--search" role="status">
              <i className="bi bi-search" aria-hidden="true" />
              <h2>Aucun client ne correspond à votre recherche.</h2>
              <p>Essayez un autre nom ou vérifiez les espaces saisis.</p>
            </section>
          )}
        </section>
      )}

      {!isFormOpen && clientId && (
        <section className="nutrition-client-programs" aria-label={`Programmes nutritionnels de ${client?.name || 'ce client'}`}>
          <div className="nutrition-client-programs__header">
            <div>
              <span className="nutrition-eyebrow">HISTORIQUE DES PROGRAMMES</span>
              <h2>{client?.name || 'Client introuvable'}</h2>
            </div>
            <button type="button" className="nutrition-form__close" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left" aria-hidden="true" /> Retour aux clients
            </button>
          </div>
          {isLoadingPlans && <p className="nutrition-empty-inline">Chargement des programmes…</p>}
          {!isLoadingPlans && hasPlansLoadError && (
            <p className="nutrition-empty-inline">Impossible de charger les programmes pour ce client.</p>
          )}
          {!isLoadingPlans && !hasPlansLoadError && clientPlans.length === 0 && (
            <section className="nutrition-empty">
              <i className="bi bi-journal-medical" aria-hidden="true" />
              <h2>Aucun programme nutritionnel</h2>
              <p>Ajoutez un programme pour commencer l’historique de ce client.</p>
              <button type="button" className="nutrition-add-plan-button" onClick={openNewPlanForm}>
                <i className="bi bi-plus-lg" aria-hidden="true" /> Ajouter un programme
              </button>
            </section>
          )}
          {!isLoadingPlans && !hasPlansLoadError && clientPlans.length > 0 && !selectedPlan && (
            <>
              <section className="nutrition-empty nutrition-plan-picker">
                <i className="bi bi-journal-medical" aria-hidden="true" />
                <h2>Choisissez un programme</h2>
                <p>Sélectionnez un numéro pour consulter la fiche nutritionnelle correspondante.</p>
              </section>
              <nav className="nutrition-program-pagination" aria-label="Ouvrir un programme nutritionnel">
                {clientPlans.map((plan, index) => (
                  <button
                    type="button"
                    key={plan._id}
                    onClick={() => navigate(`/nutrition/client/${encodeURIComponent(clientId)}/plan/${encodeURIComponent(plan._id)}`)}
                    aria-label={`Ouvrir le programme ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            </>
          )}
          {selectedPlan && (
            <>
              <article className="nutrition-program-view">
                <header className="nutrition-program-view__header">
                  <div>
                    <span className="nutrition-eyebrow">PROGRAMME {selectedPlanIndex + 1}</span>
                    <h3>{new Date(selectedPlan.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</h3>
                  </div>
                  <div className="nutrition-program-view__actions">
                    <button type="button" onClick={() => startEditingPlan(selectedPlan)}>
                      <i className="bi bi-pencil-square" aria-hidden="true" /> Modifier
                    </button>
                    <button
                      type="button"
                      className="nutrition-program-view__delete"
                      onClick={() => handleDeletePlan(selectedPlan)}
                      disabled={deletingPlanId === selectedPlan._id}
                    >
                      <i className={`bi ${deletingPlanId === selectedPlan._id ? 'bi-hourglass-split' : 'bi-trash3'}`} aria-hidden="true" />
                      {deletingPlanId === selectedPlan._id ? 'Suppression…' : 'Supprimer'}
                    </button>
                  </div>
                </header>
                <div className="nutrition-program-view__summary">
                  <div className="nutrition-program-view__calories">
                    <strong>{format(selectedPlan.planData.calories)}</strong><span>kcal / jour</span>
                  </div>
                  {[
                    ['Protéines', selectedPlan.planData.macros?.protein],
                    ['Glucides', selectedPlan.planData.macros?.carbs],
                    ['Lipides', selectedPlan.planData.macros?.fat],
                    ['Fibres', selectedPlan.planData.macros?.fiber],
                  ].map(([label, amount]) => (
                    <span className="nutrition-program-view__macro" key={label}>
                      <small>{label}</small><strong>{format(amount)} g</strong>
                    </span>
                  ))}
                </div>
                <div className="nutrition-program-view__meals">
                  {(selectedPlan.planData.meals || []).map((meal) => (
                    <section className="nutrition-program-meal" key={meal.id || meal.name}>
                      <h4>{meal.name}</h4>
                      {meal.items?.length ? (
                        <ul>
                          {meal.items.map((item, itemIndex) => (
                            <li key={item.id || `${meal.id || meal.name}-${itemIndex}`}>
                              <span>{item.foodName || getFoodForItem(item)?.nom || 'Aliment'}</span>
                              <strong>{format(item.quantity)} g</strong>
                            </li>
                          ))}
                        </ul>
                      ) : <p>Aucun aliment enregistré pour ce repas.</p>}
                    </section>
                  ))}
                </div>
              </article>
              <nav className="nutrition-program-pagination" aria-label="Pagination des programmes nutritionnels">
                {clientPlans.map((plan, index) => (
                  <button
                    type="button"
                    key={plan._id}
                    className={index === selectedPlanIndex ? 'is-active' : ''}
                    onClick={() => navigate(`/nutrition/client/${encodeURIComponent(clientId)}/plan/${encodeURIComponent(plan._id)}`)}
                    aria-label={`Afficher le programme ${index + 1}`}
                    aria-current={index === selectedPlanIndex ? 'page' : undefined}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            </>
          )}
        </section>
      )}

      {isFormOpen && (
        <section className="nutrition-form">
          <div className="nutrition-form__header">
            <div>
              <span className="nutrition-eyebrow">{selectedPlanId ? 'MODIFICATION' : 'NOUVEAU PLAN'}</span>
              <h2>{selectedPlanId ? 'Modifier le plan nutritionnel' : 'Créer un plan nutritionnel'}</h2>
            </div>
            <button type="button" className="nutrition-form__close" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left" aria-hidden="true" /> Retour aux plans
            </button>
          </div>
          <label className="nutrition-client-select">
            <span>CLIENT</span>
            <select value={clientId} onChange={(event) => handleClientChange(event.target.value)} disabled={isLoadingClients || Boolean(selectedPlanId)} required>
              <option value="">{isLoadingClients ? 'Chargement…' : 'Sélectionner un client'}</option>
              {clients.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
            </select>
          </label>

      {!clientId && !isLoadingClients && (
        <section className="nutrition-empty">
          <i className="bi bi-person-plus" aria-hidden="true" />
          <h2>Commencez par choisir un client</h2>
          <p>Les calories, l’objectif et les caractéristiques de sa fiche seront utilisés automatiquement.</p>
        </section>
      )}

      {client && (
        <>
          <section className="nutrition-profile nutrition-panel">
            <div className="nutrition-profile__identity">
              <span className="nutrition-avatar"><i className="bi bi-person-fill" /></span>
              <div><span className="nutrition-eyebrow">PROFIL CLIENT</span><h2>{client.name}</h2></div>
            </div>
            <div className="nutrition-profile__facts">
              <span><small>Objectif</small><strong>{client.goal || '—'}</strong></span>
              <span><small>Âge</small><strong>{client.age ? `${client.age} ans` : '—'}</strong></span>
              <span><small>Sexe</small><strong>{client.gender === 'male' ? 'Homme' : client.gender === 'female' ? 'Femme' : '—'}</strong></span>
              <span><small>Poids actuel</small><strong>{client.weight ? `${format(client.weight)} kg` : '—'}</strong></span>
              <span><small>Taille</small><strong>{client.height ? `${client.height} cm` : '—'}</strong></span>
            </div>
          </section>

          {!targets && <p className="nutrition-alert nutrition-alert--error">Impossible de calculer les objectifs : vérifiez que la fiche client contient un sexe, un âge, un poids, une taille et un objectif reconnu.</p>}

          {targets && (
            <>
              <section className="nutrition-panel nutrition-targets">
                <div className="nutrition-energy-summary">
                  <div className="nutrition-energy-target">
                    <span className="nutrition-eyebrow">ÉTAPE 1 · OBJECTIF ÉNERGÉTIQUE CIBLE</span>
                    <strong>{format(targets.calories)} <small>kcal / jour</small></strong>
                    <span className="nutrition-energy-target__detail">
                      MB {format(targets.bmr)} kcal · Maintenance {format(targets.maintenance)} kcal · activité × 1,45
                    </span>
                  </div>
                  <div className="nutrition-macros-target">
                    <div className="nutrition-section-title">
                      <div><span className="nutrition-eyebrow">ÉTAPE 2 · RÉPARTITION NUTRITIONNELLE</span><h2>Objectifs journaliers</h2></div>
                    </div>
                    <p className="nutrition-food-source">Calculée automatiquement selon l’objectif et le poids du client. Valeurs des aliments estimées pour 100 g.</p>
                    <div className="nutrition-target-grid">
                      {[
                        ['Protéines', targets.protein, 'g'],
                        ['Glucides', targets.carbs, 'g'],
                        ['Lipides', targets.fat, 'g'],
                        ['Fibres', targets.fiber, 'g'],
                      ].map(([label, amount, unit]) => (
                        <div className="nutrition-target" key={label}>
                          <span>{label}</span><strong>{format(amount)} <small>{unit}</small></strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="nutrition-layout">
                <section className="nutrition-meals" aria-label="Plan alimentaire quotidien">
                  {meals.map((meal) => {
                    const mealTotals = totalNutrients([meal], foods);
                    return (
                      <article className="nutrition-panel nutrition-meal" key={meal.id}>
                        <header className="nutrition-meal__header">
                          <div><span className="nutrition-meal__icon"><i className={`bi ${MEAL_TYPES.find((type) => type.id === meal.id)?.icon}`} /></span><div><span className="nutrition-eyebrow">REPAS</span><h2>{meal.name}</h2></div></div>
                          <span className="nutrition-meal__calories">{format(mealTotals.calories)} kcal</span>
                        </header>
                        <div className="nutrition-food-list">
                          {meal.items.map((item) => {
                            const itemTotals = getNutrients(item, foods);
                            const rowKey = `${meal.id}:${item.id}`;
                            const searchText = foodSearches[rowKey] ?? getFoodForItem(item, foods)?.nom ?? '';
                            const matchingFoods = searchText.trim()
                              ? foods.filter((food) => normalizeFoodName(food.nom).includes(normalizeFoodName(searchText)))
                              : foods;
                            const isSearchOpen = activeFoodSearch === rowKey;
                            return (
                              <div className="nutrition-food-row" key={item.id}>
                                <div className="nutrition-food-row__food nutrition-food-autocomplete">
                                  <label htmlFor={`food-search-${rowKey}`}><span>Aliment</span></label>
                                  <input
                                    id={`food-search-${rowKey}`}
                                    type="search"
                                    value={searchText}
                                    onFocus={() => setActiveFoodSearch(rowKey)}
                                    onBlur={() => setActiveFoodSearch((current) => (current === rowKey ? '' : current))}
                                    onChange={(event) => {
                                      setFoodSearches((current) => ({ ...current, [rowKey]: event.target.value }));
                                      setActiveFoodSearch(rowKey);
                                      if (item.foodId) updateItem(meal.id, item.id, 'foodId', '');
                                    }}
                                    placeholder="Rechercher un aliment"
                                    autoComplete="off"
                                    aria-autocomplete="list"
                                    aria-expanded={isSearchOpen}
                                    aria-controls={`food-options-${rowKey}`}
                                  />
                                  {isSearchOpen && (
                                    <div className="nutrition-food-suggestions" id={`food-options-${rowKey}`} role="listbox">
                                      {matchingFoods.map((food) => (
                                        <button
                                          type="button"
                                          role="option"
                                          aria-selected={String(food.id) === String(item.foodId)}
                                          key={food.id}
                                          onMouseDown={(event) => event.preventDefault()}
                                          onClick={() => {
                                            updateItem(meal.id, item.id, 'foodId', String(food.id));
                                            setFoodSearches((current) => ({ ...current, [rowKey]: food.nom }));
                                            setActiveFoodSearch('');
                                          }}
                                        >
                                          {food.nom}
                                        </button>
                                      ))}
                                      {searchText.trim() && matchingFoods.length === 0 && (
                                        <button
                                          type="button"
                                          className="nutrition-food-suggestions__add"
                                          role="option"
                                          onMouseDown={(event) => event.preventDefault()}
                                          onClick={() => openFoodModal(meal.id, item.id, searchText)}
                                        >
                                          <i className="bi bi-plus-lg" aria-hidden="true" /> Ajouter « {searchText.trim()} »
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <label className="nutrition-food-row__quantity"><span>Quantité</span><span className="nutrition-quantity"><input type="number" min="1" max="3000" step="1" value={item.quantity} onChange={(event) => updateItem(meal.id, item.id, 'quantity', event.target.value)} /><small>g</small></span></label>
                                <div className="nutrition-food-row__macros">
                                  <span>{format(itemTotals.calories)} kcal</span>
                                  <small>P {format(itemTotals.protein)} · G {format(itemTotals.carbs)} · L {format(itemTotals.fat)} · Fib. {format(itemTotals.fiber)} g</small>
                                </div>
                                <button className="nutrition-icon-button" type="button" aria-label={`Retirer l’aliment du ${meal.name}`} onClick={() => removeItem(meal.id, item.id)}><i className="bi bi-trash3" /></button>
                              </div>
                            );
                          })}
                        </div>
                        <footer className="nutrition-meal__footer">
                          <button type="button" className="nutrition-add-food" onClick={() => addItem(meal.id)}><i className="bi bi-plus-lg" /> Ajouter un aliment</button>
                          <span>P {format(mealTotals.protein)} · G {format(mealTotals.carbs)} · L {format(mealTotals.fat)} · Fib. {format(mealTotals.fiber)} g</span>
                        </footer>
                      </article>
                    );
                  })}
                </section>

                <aside className="nutrition-sidebar">
                  <section className="nutrition-panel nutrition-totals">
                    <span className="nutrition-eyebrow">VOTRE JOURNÉE</span>
                    <h2>Totaux calculés</h2>
                    <div className="nutrition-totals__calories"><strong>{format(totals.calories)}</strong><span>/ {format(targets.calories)} kcal</span></div>
                    <div className="nutrition-calorie-progress"><span style={{ width: `${Math.min(100, (totals.calories / targets.calories) * 100)}%` }} /></div>
                    <p className="nutrition-totals__hint">{Math.max(0, Math.round(targets.calories - totals.calories))} kcal restantes sur la cible</p>
                    {[
                      ['Protéines', totals.protein, targets.protein, '#56d6e7'],
                      ['Glucides', totals.carbs, targets.carbs, '#53d7aa'],
                      ['Lipides', totals.fat, targets.fat, '#a6a4ff'],
                      ['Fibres', totals.fiber, targets.fiber, '#f0bc67'],
                    ].map(([label, current, target, color]) => (
                      <div className="nutrition-macro-progress" key={label}>
                        <div><span>{label}</span><strong>{format(current)} <small>/ {format(target)} g</small></strong></div>
                        <div className="nutrition-calorie-progress"><span style={{ width: `${target ? Math.min(100, (current / target) * 100) : 0}%`, background: color }} /></div>
                      </div>
                    ))}
                    <button type="button" className="nutrition-save-button" onClick={handleSavePlan} disabled={isSaving || isLoadingHistory}>
                      <i className={`bi ${isSaving ? 'bi-hourglass-split' : 'bi-cloud-check'}`} />
                      {isSaving ? 'Enregistrement…' : selectedPlanId ? 'Mettre à jour le plan' : 'Sauvegarder le plan'}
                    </button>
                  </section>

                  <section className="nutrition-panel nutrition-progress-form">
                    <span className="nutrition-eyebrow">SUIVI CORPOREL</span>
                    <h2>Ajouter un relevé</h2>
                    <p>Enregistrez le poids du jour pour suivre l’évolution du client dans le temps.</p>
                    <form onSubmit={handleSaveProgress}>
                      <label>Poids mesuré (kg)<input type="number" min="20" max="400" step="0.1" value={weightEntry} onChange={(event) => setWeightEntry(event.target.value)} placeholder={client.weight || 'Ex. 72,5'} required /></label>
                      <label>Note (facultatif)<textarea maxLength={1000} rows="2" value={weightNote} onChange={(event) => setWeightNote(event.target.value)} placeholder="Ressenti, observations…" /></label>
                      <button type="submit" className="nutrition-secondary-button" disabled={isSavingProgress}>{isSavingProgress ? 'Enregistrement…' : 'Enregistrer le poids'}</button>
                    </form>
                  </section>
                </aside>
              </div>

              <section className="nutrition-panel nutrition-history">
                <div className="nutrition-section-title">
                  <div><span className="nutrition-eyebrow">ÉVOLUTION DU POIDS</span><h2>Progression du client</h2></div>
                  <span className="nutrition-history__loading">{weightHistory.length} relevé{weightHistory.length > 1 ? 's' : ''}</span>
                </div>
                <p className="nutrition-progress-baseline">Poids de référence enregistré sur la fiche client : <strong>{format(client.weight)} kg</strong></p>
                {!weightHistory.length && <p className="nutrition-empty-inline">Aucun relevé enregistré. Ajoutez un poids pour commencer le suivi.</p>}
                {weightHistory.length > 0 && (
                  <div className="nutrition-history__list">
                    {weightHistory.map((entry) => (
                      <article className="nutrition-history-item" key={entry._id}>
                        <div><strong>{new Date(entry.recordedAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</strong><span>{entry.note || 'Relevé de poids'}{entry.planId ? ' · lié au plan sélectionné' : ''}</span></div>
                        <strong className="nutrition-history-item__weight">{format(entry.weight)} kg{client.weight ? ` · ${entry.weight - client.weight > 0 ? '+' : ''}${format(entry.weight - client.weight)} kg vs fiche` : ''}</strong>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}
        </section>
      )}
      {foodModal && (
        <div
          className="nutrition-food-modal-backdrop"
          role="presentation"
          onClick={() => setFoodModal(null)}
        >
          <section
            className="nutrition-food-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nutrition-food-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="nutrition-food-modal__header">
              <div>
                <span className="nutrition-eyebrow">NOUVELLE RÉFÉRENCE</span>
                <h2 id="nutrition-food-modal-title">Ajouter un nouvel aliment</h2>
                <p>Valeurs nutritionnelles pour 100 g.</p>
              </div>
              <button type="button" className="nutrition-food-modal__close" aria-label="Fermer" onClick={() => setFoodModal(null)}>
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </header>
            <form className="nutrition-food-modal__form" onSubmit={saveCustomFood}>
              <label className="nutrition-food-modal__name">
                Nom de l’aliment
                <input
                  type="text"
                  value={foodDraft.nom}
                  onChange={(event) => setFoodDraft((current) => ({ ...current, nom: event.target.value }))}
                  maxLength={100}
                  required
                  autoFocus
                />
              </label>
              <div className="nutrition-food-modal__fields">
                {[
                  ['calories', 'Calories (kcal)', true],
                  ['proteines', 'Protéines (g)', true],
                  ['glucides', 'Glucides (g)', true],
                  ['lipides', 'Lipides (g)', true],
                  ['fibres', 'Fibres (g)', false],
                ].map(([key, label, required]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={foodDraft[key]}
                      onChange={(event) => setFoodDraft((current) => ({ ...current, [key]: event.target.value }))}
                      required={required}
                    />
                  </label>
                ))}
              </div>
              {foodModalError && <p className="nutrition-alert nutrition-alert--error" role="alert">{foodModalError}</p>}
              <footer className="nutrition-food-modal__actions">
                <button type="button" className="nutrition-form__close" onClick={() => setFoodModal(null)}>Annuler</button>
                <button type="submit" className="nutrition-add-plan-button">
                  <i className="bi bi-check-lg" aria-hidden="true" /> Enregistrer
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Nutrition;
