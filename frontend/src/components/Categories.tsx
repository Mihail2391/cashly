import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import "./Categories.css";

type Category = {
  id: number;
  name: string;
  type: "income" | "expense";
};

type CategoriesProps = {
  onChanged?: () => void;
};

function Categories({ onChanged }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const loadCategories = async () => {
    const response = await api.get("/categories");
    setCategories(response.data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const clearForm = () => {
    setName("");
    setType("expense");
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");

    try {
      if (editingId !== null) {
        await api.put(`/categories/${editingId}`, {
          name,
          type,
        });
      } else {
        await api.post("/categories", {
          name,
          type,
        });
      }

      clearForm();
      await loadCategories();
      onChanged?.();
    } catch (error) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setErrorMessage(err.response?.data?.message || "Произошла ошибка");
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
  };

  const deleteCategory = async (id: number) => {
    setErrorMessage("");

    try {
      await api.delete(`/categories/${id}`);

      await loadCategories();
      onChanged?.();
    } catch (error) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setErrorMessage(
        err.response?.data?.message || "Не удалось удалить категорию",
      );
    }
  };

  return (
    <div className="categories">
      <form className="categories-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Название категории"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
        >
          <option value="expense">Расход</option>
          <option value="income">Доход</option>
        </select>

        <button className="category-submit" type="submit">
          {editingId !== null ? "Сохранить" : "+ Новая категория"}
        </button>

        {editingId !== null && (
          <button className="category-cancel" type="button" onClick={clearForm}>
            Отмена
          </button>
        )}
      </form>

      {errorMessage && <p className="category-error">{errorMessage}</p>}

      <div className="categories-grid">
        {categories.map((category) => (
          <div className="category-card" key={category.id}>
            <div className="category-info">
              <div className="category-name">{category.name}</div>

              <span className={`category-type ${category.type}`}>
                {category.type === "income" ? "Доход" : "Расход"}
              </span>
            </div>

            <div className="category-actions">
              <button
                className="category-edit"
                onClick={() => startEdit(category)}
              >
                Редактировать
              </button>

              <button
                className="category-delete"
                onClick={() => deleteCategory(category.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;
