import express from "express";
import cors from "cors";
import "dotenv/config";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import type { Request, Response, NextFunction } from "express";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Finance Tracker API работает",
  });
});

app.get("/db-test", async (req, res) => {
  const usersCount = await prisma.user.count();

  res.json({
    message: "База данных работает",
    usersCount,
  });
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Введите имя, email и пароль",
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Пользователь уже существует",
    });
  }

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email,
      password: hashedPassword,
    },
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  res.status(201).json({
    message: "Пользователь зарегистрирован",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Введите email и пароль",
    });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      message: "Неверный email или пароль",
    });
  }

  const passwordIsCorrect = await compare(password, user.password);

  if (!passwordIsCorrect) {
    return res.status(401).json({
      message: "Неверный email или пароль",
    });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  res.json({
    message: "Вход выполнен",
    user: {
      id: user.id,
      email: user.email,
    },
    token,
  });
});

function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Токен отсутствует",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Токен отсутствует",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    (req as Request & { userId: number }).userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Неверный токен",
    });
  }
}

app.get("/protected", auth, (req, res) => {
  const userId = (req as Request & { userId: number }).userId;

  res.json({
    message: "Доступ разрешён",
    userId,
  });
});

app.get("/me", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "Пользователь не найден",
    });
  }

  res.json(user);
});

app.post("/categories", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({
      message: "Введите название и тип категории",
    });
  }

  if (type !== "income" && type !== "expense") {
    return res.status(400).json({
      message: "Тип должен быть income или expense",
    });
  }

  const userCategories = await prisma.category.findMany({
    where: {
      userId,
      type,
    },
  });

  const duplicateCategory = userCategories.find(
    (category) =>
      category.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );

  if (duplicateCategory) {
    return res.status(409).json({
      message: "Такая категория уже существует",
    });
  }

  const category = await prisma.category.create({
    data: {
      name,
      type,
      userId,
    },
  });

  res.status(201).json(category);
});

app.get("/categories", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;

  const categories = await prisma.category.findMany({
    where: {
      userId,
    },
  });

  res.json(categories);
});

app.put("/categories/:id", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const categoryId = Number(req.params.id);

  const { name, type } = req.body;

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    return res.status(404).json({
      message: "Категория не найдена",
    });
  }

  if (type !== "income" && type !== "expense") {
    return res.status(400).json({
      message: "Тип должен быть income или expense",
    });
  }

  const userCategories = await prisma.category.findMany({
    where: {
      userId,
      type,
    },
  });

  const duplicateCategory = userCategories.find(
    (item) =>
      item.id !== categoryId &&
      item.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );

  if (duplicateCategory) {
    return res.status(409).json({
      message: "Такая категория уже существует",
    });
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name,
      type,
    },
  });

  res.json(updatedCategory);
});

app.delete("/categories/:id", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const categoryId = Number(req.params.id);

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!category) {
    return res.status(404).json({
      message: "Категория не найдена",
    });
  }

  const transactionsCount = await prisma.transaction.count({
    where: {
      categoryId,
      userId,
    },
  });

  if (transactionsCount > 0) {
    return res.status(409).json({
      message: "Нельзя удалить категорию, пока у нее есть операции",
    });
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  res.json({
    message: "Категория удалена",
  });
});

app.post("/transactions", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;

  const { amount, description, date, categoryId } = req.body;

  const numericAmount = Number(amount);
  const numericCategoryId = Number(categoryId);

  if (!numericAmount || numericAmount <= 0 || !numericCategoryId) {
    return res.status(400).json({
      message: "Укажите сумму и категорию",
    });
  }

  const category = await prisma.category.findFirst({
    where: {
      id: numericCategoryId,
      userId,
    },
  });

  if (!category) {
    return res.status(404).json({
      message: "Категория не найдена",
    });
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: numericAmount,
      description,
      date: date ? new Date(date) : new Date(),
      categoryId: numericCategoryId,
      userId,
    },
    include: {
      category: true,
    },
  });

  res.status(201).json(transaction);
});

app.get("/transactions", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;

  const { categoryId, from, to } = req.query;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,

      ...(categoryId && {
        categoryId: Number(categoryId),
      }),

      ...(from || to
        ? {
            date: {
              ...(from && {
                gte: new Date(`${String(from)}T00:00:00.000Z`),
              }),
              ...(to && {
                lte: new Date(`${String(to)}T23:59:59.999Z`),
              }),
            },
          }
        : {}),
    },

    include: {
      category: true,
    },

    orderBy: {
      date: "desc",
    },
  });

  res.json(transactions);
});

app.put("/transactions/:id", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const transactionId = Number(req.params.id);

  const { amount, description, date, categoryId } = req.body;

  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!transaction) {
    return res.status(404).json({
      message: "Транзакция не найдена",
    });
  }

  const category = await prisma.category.findFirst({
    where: {
      id: Number(categoryId),
      userId,
    },
  });

  if (!category) {
    return res.status(404).json({
      message: "Категория не найдена",
    });
  }

  const updatedTransaction = await prisma.transaction.update({
    where: {
      id: transactionId,
    },
    data: {
      amount: Number(amount),
      description,
      date: new Date(date),
      categoryId: Number(categoryId),
    },
    include: {
      category: true,
    },
  });

  res.json(updatedTransaction);
});

app.delete("/transactions/:id", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const transactionId = Number(req.params.id);

  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  });

  if (!transaction) {
    return res.status(404).json({
      message: "Транзакция не найдена",
    });
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  res.json({
    message: "Транзакция удалена",
  });
});

app.get("/stats", auth, async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      message: "Укажите даты from и to",
    });
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: new Date(`${String(from)}T00:00:00.000Z`),
        lte: new Date(`${String(to)}T23:59:59.999Z`),
      },
    },
    include: {
      category: true,
    },
  });

  let income = 0;
  let expense = 0;

  const categories: Record<
    number,
    {
      categoryId: number;
      name: string;
      type: string;
      total: number;
    }
  > = {};

  for (const transaction of transactions) {
    if (transaction.category.type === "income") {
      income += transaction.amount;
    }

    if (transaction.category.type === "expense") {
      expense += transaction.amount;
    }

    const categoryId = transaction.category.id;

    if (!categories[categoryId]) {
      categories[categoryId] = {
        categoryId,
        name: transaction.category.name,
        type: transaction.category.type,
        total: 0,
      };
    }

    categories[categoryId].total += transaction.amount;
  }

  res.json({
    income,
    expense,
    balance: income - expense,
    categories: Object.values(categories),
  });
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
