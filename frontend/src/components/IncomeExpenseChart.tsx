import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ChartItem = {
  date: string;
  income: number;
  expense: number;
};

type IncomeExpenseChartProps = {
  data: ChartItem[];
};

function IncomeExpenseChart({
  data,
}: IncomeExpenseChartProps) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="income"
            name="Доходы"
            fill="#22c55e"
          />

          <Bar
            dataKey="expense"
            name="Расходы"
            fill="#ef4444"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default IncomeExpenseChart;