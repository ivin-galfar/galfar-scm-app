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
  if (normalizedName.includes("pending")) return "#FFC107 ";

  const otherColors = ["#d97706", "#0284c7", "#0f766e", "#7c3aed"];
  return otherColors[index % otherColors.length];
};

const WorkflowChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const chartData = data.map((entry, index) => ({
    ...entry,
    fill: getWorkflowColor(entry.name, index),
  }));

  return (
    <div className="h-44 w-full min-w-0 overflow-hidden sm:h-52">
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
            formatter={(value, name) => [`${value} requests`, name]}
            contentStyle={{
              borderRadius: "6px",
              borderColor: "#e2e8f0",
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
              lineHeight: "24px", // Adjusts the spacing between lines
              paddingLeft: "15px", // Pushes the legend slightly away from the chart edge
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default WorkflowChart;
