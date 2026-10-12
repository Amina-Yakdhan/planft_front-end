import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
const Dashboard = () => {
   const apiUrl = import.meta.env.VITE_API_URL;
  const [stats, setStats] = useState({
    clients: 0,
    exercises: 0,
    programs: 0,
    nutrition: 0,
  });
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const [
          clientsRes,
          exercisesRes,
          programsRes,
          sessionsRes,
          nutritionRes,
        ] = await Promise.all([
          axios.get(`${apiUrl}/clients`),
          axios.get(`${apiUrl}/exercises`),
          axios.get(`${apiUrl}/programs`),
          axios.get(`${apiUrl}/saved-sessions/count`),
          axios.get(`${apiUrl}/nutrition/plans`),
        ]);
        if (!isMounted) return;
        if (
          ![
            clientsRes.data,
            exercisesRes.data,
            programsRes.data,
            nutritionRes.data,
          ].every(Array.isArray) ||
          !Number.isFinite(sessionsRes.data?.count)
        ) {
          throw new Error("Les données de statistiques reçues sont invalides.");
        }
        setStats({
          clients: clientsRes.data.length,
          exercises: exercisesRes.data.length,
          programs: programsRes.data.length + sessionsRes.data.count,
          nutrition: nutritionRes.data.length,
        });
      } catch (error) {
        console.error(
          "Erreur lors du chargement des statistiques du tableau de bord",
          error,
        );
        if (isMounted)
          setLoadError(
            "Impossible de charger les statistiques. Vérifiez la connexion au serveur puis actualisez la page.",
          );
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="container mt-4">
      {" "}
      <h2 className="mb-4 fw-bold text-dark">Tableau de Bord </h2>{" "}
      {loadError && (
        <p className="alert alert-danger" role="alert">
          {loadError}
        </p>
      )}{" "}
      <div className="row g-4">
        {/* Card 1: Clients */}{" "}
        <div className="col-sm-6 col-xl-3">
          {" "}
          <div className="card bg-primary text-white shadow-sm border-0 h-100">
            {" "}
            <div className="card-body d-flex flex-column justify-content-between p-4">
              {" "}
              <div>
                {" "}
                <h5 className="card-title text-uppercase opacity-75">
                  Mes Clients
                </h5>{" "}
                <h2 className="display-4 fw-bold">{stats.clients}</h2>{" "}
              </div>{" "}
              <Link
                to="/clients"
                className="text-white text-decoration-none mt-3 fw-semibold"
              >
                {" "}
                Gérer les clients →{" "}
              </Link>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Card 2: Exercises */}{" "}
        <div className="col-sm-6 col-xl-3">
          {" "}
          <div className="card bg-success text-white shadow-sm border-0 h-100">
            {" "}
            <div className="card-body d-flex flex-column justify-content-between p-4">
              {" "}
              <div>
                {" "}
                <h5 className="card-title text-uppercase opacity-75">
                  Exercices
                </h5>{" "}
                <h2 className="display-4 fw-bold">{stats.exercises}</h2>{" "}
              </div>{" "}
              <Link
                to="/library"
                className="text-white text-decoration-none mt-3 fw-semibold"
              >
                {" "}
                Voir la bibliothèque →{" "}
              </Link>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Card 3: Programs */}{" "}
        <div className="col-sm-6 col-xl-3">
          {" "}
          <div className="card bg-dark text-white shadow-sm border-0 h-100">
            {" "}
            <div className="card-body d-flex flex-column justify-content-between p-4">
              {" "}
              <div>
                {" "}
                <h5 className="card-title text-uppercase opacity-75">
                  Programmes
                </h5>{" "}
                <h2 className="display-4 fw-bold">{stats.programs}</h2>{" "}
              </div>{" "}
              <Link
                to="/builder"
                className="text-white text-decoration-none mt-3 fw-semibold"
              >
                {" "}
                Créer un programme →{" "}
              </Link>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Card 4: Nutrition */}{" "}
        <div className="col-sm-6 col-xl-3">
          {" "}
          <div className="card dashboard-nutrition-card text-white shadow-sm border-0 h-100">
            {" "}
            <div className="card-body d-flex flex-column justify-content-between p-4">
              {" "}
              <div>
                {" "}
                <h5 className="card-title text-uppercase opacity-75">
                  Nutrition
                </h5>{" "}
                <h2 className="display-4 fw-bold">{stats.nutrition}</h2>{" "}
              </div>{" "}
              <Link
                to="/nutrition"
                className="text-white text-decoration-none mt-3 fw-semibold"
              >
                {" "}
                Gérer la nutrition →{" "}
              </Link>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default Dashboard;
