import { useEffect } from "react";
import LogisticsTable from "../Components/LogisticsTable";
import StatementHeader from "../Components/StatementHeader";
import {
  useFreeze,
  useNewStatement,
  useStatement,
} from "../store/logisticsStore";
const LogisticsStatement = () => {
  const { formData, tableData } = useStatement();
  const { newstatement } = useNewStatement();
  const { setFreeze, resetFreeze } = useFreeze();

  useEffect(() => {
    if (formData.status != "" && !newstatement) {
      setFreeze();
    } else {
      resetFreeze();
    }
  }, [formData.id]);
  return (
    <div className="flex-grow px-5">
      <StatementHeader />
      <LogisticsTable />
    </div>
  );
};

export default LogisticsStatement;
