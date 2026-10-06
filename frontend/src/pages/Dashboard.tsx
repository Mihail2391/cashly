import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import AddTransactionModal from "../components/AddTransactionModal";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import ExpenseCategoryChart from "../components/ExpenseCategoryChart";
import "./Dashboard.css";

type ChartItem = {
  date: string;
  income: number;
  expense: number;
};

type Stats = {
  income: number;
  expense: number;
  balance: number;

  categories: {
    categoryId: number;
    name: string;
    type: string;
    total: number;
  }[];
};

type Transaction = {
  id: number;
  amount: number;
  description: string;
  date: string;

  category: {
    id: number;
    name: string;
    type: "income" | "expense";
  };
};

type User = {
  id: number;
  name: string;
  email: string;
};

function formatDisplayDate(date: string) {
  return new Date(date).toLocaleDateString("ru-RU");
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({
    income: 0,
    expense: 0,
    balance: 0,
    categories: [],
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [chartData, setChartData] = useState<ChartItem[]>([]);

  const [user, setUser] = useState<User | null>(null);

  const loadDashboard = async () => {
    const now = new Date();

    const from = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));

    const to = formatDate(now);

    const [statsResponse, transactionsResponse, userResponse] =
      await Promise.all([
        api.get(`/stats?from=${from}&to=${to}`),
        api.get(`/transactions?from=${from}&to=${to}`),
        api.get("/me"),
      ]);

    setStats(statsResponse.data);

    setTransactions(transactionsResponse.data.slice(0, 5));

    setUser(userResponse.data);

    const grouped: Record<
      string,
      {
        date: string;
        income: number;
        expense: number;
      }
    > = {};

    for (const transaction of transactionsResponse.data) {
      const transactionDate = transaction.date.slice(8, 10);

      if (!grouped[transactionDate]) {
        grouped[transactionDate] = {
          date: transactionDate,
          income: 0,
          expense: 0,
        };
      }

      if (transaction.category.type === "income") {
        grouped[transactionDate].income += transaction.amount;
      }

      if (transaction.category.type === "expense") {
        grouped[transactionDate].expense += transaction.amount;
      }
    }

    setChartData(
      Object.values(grouped).sort((a, b) => Number(a.date) - Number(b.date)),
    );
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Привет{user ? `, ${user.name}` : ""}!</h1>
        <p className="dashboard-subtitle">Вот сводка за текущий месяц</p>
      </div>

      <div className="summary-grid">
        <div className="summary-card income">
          <h3>Доходы</h3>
          <p>{stats.income} ₽</p>
        </div>

        <div className="summary-card expense">
          <h3>Расходы</h3>
          <p>{stats.expense} ₽</p>
        </div>

        <div className="summary-card balance">
          <h3>Баланс</h3>
          <p>{stats.balance} ₽</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button
          className="add-operation-button"
          onClick={() => setIsModalOpen(true)}
        >
          + Добавить операцию
        </button>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Динамика доходов и расходов</h2>

          <IncomeExpenseChart data={chartData} />
        </div>

        <div className="chart-card">
          <h2>Расходы по категориям</h2>

          <ExpenseCategoryChart data={stats.categories} />
        </div>
      </div>

      <div className="transactions-card">
        <div className="transactions-header">
          <h2>Последние операции</h2>

          <button
            className="show-all-button"
            onClick={() => navigate("/transactions")}
          >
            Показать все
          </button>
        </div>

        {transactions.map((transaction) => (
          <div className="transaction-row" key={transaction.id}>
            <div className="transaction-category">
              {transaction.category.name}
            </div>

            <div className="dashboard-transaction-info">
              <span className="dashboard-transaction-note">
                {transaction.description || "Без заметки"}
              </span>

              <span className="dashboard-transaction-date">
                {formatDisplayDate(transaction.date)}
              </span>
            </div>

            <div className={`transaction-amount ${transaction.category.type}`}>
              {transaction.category.type === "income" ? "+" : "-"}
              {transaction.amount} ₽
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onAdded={loadDashboard}
        />
      )}
    </div>
  );
}

export default Dashboard;
