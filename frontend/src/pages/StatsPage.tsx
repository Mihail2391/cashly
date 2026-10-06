import { useEffect, useState } from "react";
import { api } from "../api";
import ExpenseCategoryChart from "../components/ExpenseCategoryChart";
import "./StatsPage.css";

type CategoryStat = {
  categoryId: number;
  name: string;
  type: "income" | "expense";
  total: number;
};

type Stats = {
  income: number;
  expense: number;
  balance: number;
  categories: CategoryStat[];
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function StatsPage() {
  const today = new Date();

  const [from, setFrom] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
  );

  const [to, setTo] = useState(formatDate(today));

  const [stats, setStats] = useState<Stats>({
    income: 0,
    expense: 0,
    balance: 0,
    categories: [],
  });

  const loadStats = async () => {
    const response = await api.get(`/stats?from=${from}&to=${to}`);

    setStats(response.data);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>Статистика</h1>
        <p>Анализируйте доходы и расходы за выбранный период</p>
      </div>

      <div className="stats-period">
        <div className="stats-date-group">
          <label>Дата с</label>

          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="stats-date-group">
          <label>Дата по</label>

          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <button className="stats-show-button" onClick={loadStats}>
          Показать
        </button>
      </div>

      <div className="stats-summary">
        <div className="stats-summary-card income">
          <span>Доходы</span>
          <strong>{stats.income} ₽</strong>
        </div>

        <div className="stats-summary-card expense">
          <span>Расходы</span>
          <strong>{stats.expense} ₽</strong>
        </div>

        <div className="stats-summary-card balance">
          <span>Баланс</span>
          <strong>{stats.balance} ₽</strong>
        </div>
      </div>

      <div className="stats-content">
        <div className="stats-card">
          <h2>По категориям</h2>

          <div className="stats-category-list">
            {stats.categories.length === 0 && (
              <div className="stats-empty">
                За выбранный период операций нет
              </div>
            )}

            {stats.categories.map((category) => (
              <div className="stats-category-row" key={category.categoryId}>
                <div className="stats-category-info">
                  <span className="stats-category-name">{category.name}</span>

                  <span className="stats-category-type">
                    {category.type === "income" ? "Доход" : "Расход"}
                  </span>
                </div>

                <div className={`stats-category-total ${category.type}`}>
                  {category.type === "income" ? "+" : "-"}
                  {category.total} ₽
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <h2>Расходы по категориям</h2>

          <ExpenseCategoryChart data={stats.categories} />
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
