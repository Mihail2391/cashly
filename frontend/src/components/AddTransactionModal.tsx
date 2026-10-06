import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import "./AddTransactionModal.css";

type AddTransactionModalProps = {
  onClose: () => void;
  onAdded: () => void;
};

type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
};

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function AddTransactionModal({ onClose, onAdded }: AddTransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense");

  const [amount, setAmount] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getToday());

  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCategories = async () => {
    const response = await api.get("/categories");
    setCategories(response.data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");

    if (!amount || Number(amount) <= 0) {
      setErrorMessage("Введите сумму");
      return;
    }

    if (!categoryName.trim()) {
      setErrorMessage("Введите категорию");
      return;
    }

    try {
      const normalizedName = categoryName.trim().toLowerCase();

      let category = categories.find(
        (item) =>
          item.type === type &&
          item.name.trim().toLowerCase() === normalizedName,
      );

      if (!category) {
        const categoryResponse = await api.post("/categories", {
          name: categoryName.trim(),
          type,
        });

        category = categoryResponse.data;
      }

      if (!category) {
        setErrorMessage("Не удалось определить категорию");
        return;
      }

      await api.post("/transactions", {
        amount: Number(amount),
        description,
        date,
        categoryId: category.id,
      });

      onAdded();
      onClose();
    } catch (error) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setErrorMessage(
        err.response?.data?.message || "Не удалось добавить операцию",
      );
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="transaction-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Новая операция</h2>

          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="transaction-type">
            <button
              className={`type-button expense ${
                type === "expense" ? "active" : ""
              }`}
              type="button"
              onClick={() => setType("expense")}
            >
              Расход
            </button>

            <button
              className={`type-button income ${
                type === "income" ? "active" : ""
              }`}
              type="button"
              onClick={() => setType("income")}
            >
              Доход
            </button>
          </div>

          <div className="form-group">
            <label>Сумма</label>

            <input
              type="number"
              placeholder="1 300"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Категория</label>

            <input
              type="text"
              placeholder="Например, Такси"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Заметка</label>

            <input
              type="text"
              placeholder="Например, брал такси для девушки"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Дата</label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {errorMessage && <p className="modal-error">{errorMessage}</p>}

          <div className="modal-actions">
            <button className="cancel-button" type="button" onClick={onClose}>
              Отмена
            </button>

            <button className="submit-button" type="submit">
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
