import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../api";

import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Ошибка входа");
      } else {
        setError("Ошибка входа");
      }
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-brand">
        <div className="auth-logo">Cashly</div>

        <h1>Контролируй свои финансы</h1>

        <p>
          Следи за доходами, расходами и балансом в одном удобном приложении.
        </p>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <h2>С возвращением</h2>

          <p className="auth-subtitle">Войдите в свой аккаунт Cashly</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.ru"
                required
              />
            </div>

            <div className="auth-field">
              <label>Пароль</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-submit" type="submit">
              Войти
            </button>
          </form>

          <p className="auth-switch">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
