/* eslint-disable react/prop-types */
import {
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import { useState } from "react";
import { initiatorRoles } from "../../Helpers/helperfunctions";

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const getWorkflowColor = (name, index) => {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("approved")) return "#15803d";
  if (normalizedName.includes("rejected")) return "#be123c";
  if (normalizedName.includes("pending")) return "#d97706";

  const otherColors = ["#d97706", "#0284c7", "#0f766e", "#7c3aed"];
  return otherColors[index % otherColors.length];
};

const WorkflowChart = ({ data, role }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const chartData = data
    .filter((entry) => entry.value > 0)
    .filter((entry) =>
      initiatorRoles.some((r) => role.includes(r)) ||
      role.every((role) => role === "initfn")
        ? entry.name != "Pending For You"
        : true,
    )
    .map((entry, index) => ({
      ...entry,
      fill: getWorkflowColor(entry.name, index),
    }));

  return (
    <div className="h-44 w-full min-w-0 overflow-hidden rounded-lg bg-muted/20 sm:h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
          />
          <Tooltip
            formatter={(value, name) => [`${value} statements`, name]}
            contentStyle={{
              borderRadius: "8px",
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--card-foreground)",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
              fontSize: "12px",
            }}
          />
          <Legend
            iconType="circle"
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              fontSize: "11px",
              lineHeight: "24px",
              paddingLeft: "15px",
              color: "var(--muted-foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default WorkflowChart;
