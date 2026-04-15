import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LogisticsTable from "../Components/LogisticsTable";
import StatementHeader from "../Components/StatementHeader";
import {
  useFreeze,
  useNewStatement,
  useStatement,
} from "../store/logisticsStore";
const LogisticsStatement = () => {
  const { cs_no } = useParams();
  const { formData, tableData } = useStatement();
  const { newstatement, resetnewStatement } = useNewStatement();
  const { setFreeze, resetFreeze } = useFreeze();

  useEffect(() => {
    if (cs_no) {
      resetnewStatement();
    }
  }, [cs_no]);

  useEffect(() => {
    if (formData.status != "" && !newstatement) {
      setFreeze();
    } else {
      resetFreeze();
    }
  }, [formData.id, formData.status, newstatement, setFreeze, resetFreeze]);
  return (
    <div className="flex-grow px-5">
      <StatementHeader />
      <LogisticsTable />
    </div>
  );
};

export default LogisticsStatement;
