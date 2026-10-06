import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import AddTransactionModal from "./AddTransactionModal";
import {
  useTransactionStore,
  type Category,
  type Transaction,
} from "../store/transactionsStore";
import "./Transactions.css";

type TransactionsProps = {
  onChanged?: () => void;
};

function Transactions({ onChanged }: TransactionsProps) {
  const {
    transactions,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactionStore();

  const [categories, setCategories] = useState<Category[]>([]);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense",
  );
  const [date, setDate] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadCategories = async () => {
    const response = await api.get("/categories");
    setCategories(response.data);
  };

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  const clearForm = () => {
    setAmount("");
    setDescription("");
    setCategoryName("");
    setTransactionType("expense");
    setDate("");
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let category = categories.find(
      (category) =>
        category.name.toLowerCase() === categoryName.trim().toLowerCase() &&
        category.type === transactionType,
    );

    if (!category) {
      const response = await api.post("/categories", {
        name: categoryName.trim(),
        type: transactionType,
      });

      const newCategory = response.data as Category;

      category = newCategory;

      setCategories((prev) => [...prev, newCategory]);
    }

    const data = {
      amount: Number(amount),
      description,
      categoryId: category.id,
      date,
    };

    if (!category) {
      return;
    }

    if (editingId !== null) {
      await updateTransaction(editingId, data);
    } else {
      await addTransaction(data);
    }

    clearForm();
    onChanged?.();
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setAmount(String(transaction.amount));
    setDescription(transaction.description || "");
    setCategoryName(transaction.category.name);
    setTransactionType(transaction.category.type);
    setDate(transaction.date.slice(0, 10));
  };

  const handleDelete = async (id: number) => {
    await deleteTransaction(id);

    if (editingId === id) {
      clearForm();
    }

    onChanged?.();
  };

  const applyFilters = async () => {
    await loadTransactions({
      categoryId: filterCategoryId,
      from,
      to,
    });
  };

  const resetFilters = async () => {
    setFilterCategoryId("");
    setFrom("");
    setTo("");

    await loadTransactions();
  };

  const handleTransactionAdded = async () => {
    await loadTransactions();
    await loadCategories();
    onChanged?.();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ru-RU");
  };

  return (
    <div className="transactions">
      <div className="transactions-top">
        <h2>Все операции</h2>

        <button
          className="transactions-add"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          + Добавить операцию
        </button>
      </div>

      {editingId !== null && (
        <form className="transaction-edit-form" onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Сумма"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Заметка"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            value={transactionType}
            onChange={(e) =>
              setTransactionType(e.target.value as "income" | "expense")
            }
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>

          <input
            type="text"
            placeholder="Категория"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="edit-actions">
            <button className="save-button" type="submit">
              Сохранить
            </button>

            <button
              className="cancel-edit-button"
              type="button"
              onClick={clearForm}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="filters-card">
        <h3>Фильтры</h3>

        <div className="filters-row">
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
          >
            <option value="">Все категории</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />

          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />

          <button className="filter-apply" type="button" onClick={applyFilters}>
            Применить
          </button>

          <button className="filter-reset" type="button" onClick={resetFilters}>
            Сбросить
          </button>
        </div>
      </div>

      <div className="transactions-list">
        {transactions.map((transaction) => (
          <div className="transaction-list-row" key={transaction.id}>
            <div className="transaction-info">
              <div className="transaction-main">
                {transaction.description || "Без описания"}
              </div>

              <div className="transaction-meta">
                <span className="transaction-category-name">
                  {transaction.category.name}
                </span>

                <span className="transaction-date">
                  {formatDate(transaction.date)}
                </span>
              </div>
            </div>

            <div className={`transaction-value ${transaction.category.type}`}>
              {transaction.category.type === "income" ? "+" : "-"}
              {transaction.amount} ₽
            </div>

            <div className="transaction-buttons">
              <button
                className="edit-button"
                onClick={() => startEdit(transaction)}
              >
                Редактировать
              </button>

              <button
                className="delete-button"
                onClick={() => handleDelete(transaction.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onAdded={handleTransactionAdded}
        />
      )}
    </div>
  );
}

export default Transactions;
