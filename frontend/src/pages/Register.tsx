import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../api";

import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    try {
      const response = await api.post("/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Ошибка регистрации");
      } else {
        setError("Ошибка регистрации");
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
          <h2>Создать аккаунт</h2>

          <p className="auth-subtitle">Начните контролировать свои расходы</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Имя</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Михаил"
                required
              />
            </div>

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
              Зарегистрироваться
            </button>
          </form>

          <p className="auth-switch">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;
