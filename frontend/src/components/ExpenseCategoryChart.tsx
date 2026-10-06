import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import "./ExpenseCategoryChart.css";

type ExpenseCategoryItem = {
  categoryId: number;
  name: string;
  type: string;
  total: number;
};

type ExpenseCategoryChartProps = {
  data: ExpenseCategoryItem[];
};

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#06b6d4",
];

function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  const expenseData = data.filter((item) => item.type === "expense");

  const totalExpense = expenseData.reduce((sum, item) => sum + item.total, 0);

  const chartData = expenseData.map((item) => ({
    ...item,

    percent:
      totalExpense > 0 ? Math.round((item.total / totalExpense) * 100) : 0,
  }));

  if (chartData.length === 0) {
    return <div className="expense-chart-empty">Нет данных по расходам</div>;
  }

  return (
    <div className="expense-chart">
      <div className="expense-chart-ring">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="name"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((item, index) => (
                <Cell
                  key={item.categoryId}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="expense-chart-center">
          <strong>{totalExpense.toLocaleString("ru-RU")} ₽</strong>

          <span>общие расходы</span>
        </div>
      </div>

      <div className="expense-chart-legend">
        {chartData.map((item, index) => (
          <div className="expense-chart-legend-item" key={item.categoryId}>
            <div className="expense-chart-legend-name">
              <span
                className="expense-chart-dot"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />

              <span>{item.name}</span>
            </div>

            <span className="expense-chart-percent">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpenseCategoryChart;
