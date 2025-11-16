import { createContext, useState } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const userInfo = useUserInfo();

  const initialTableData = [];
  const [sharedTableData, setSharedTableData] = useState({
    formData: {
      hiringname: "",
      datevalue: new Date().toISOString().split("T")[0],
      projectvalue: "",
      locationvalue: "",
      equipmrnovalue: "",
      emrefnovalue: "",
      requireddatevalue: new Date().toISOString().split("T")[0],
      requirementdurationvalue: "",
      selectedvendorreason: "",
      status: "",
      receiptupdated: null,
      type: userInfo?.role == "inita" ? "asset" : "hiring",
      file: [],
      filename: [],
    },
    tableData: initialTableData,
  });
  const [mrno, setMrno] = useState([]);
  const [reqmrno, setReqMrno] = useState([]);
  const [hasInputActivity, setHasInputActivity] = useState(false);
  const [isMRSelected, setIsMRSelected] = useState(false);
  const [reqApprovalstatus, setreqApprovalstatus] = useState("");
  const [selectedmr, setSelectedMr] = useState(null);
  const [particulars, setParticulars] = useState([]);
  const [particularname, setParticularName] = useState([]);
  const [newMr, setNewMr] = useState(false);
  const [selectedVendorIndex, setSelectedVendorIndex] = useState(0);
  const [selectedVendorReason, setSelectedVendorReason] = useState();
  const [freezequantity, setfreezeQuantity] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [allreceipts, setAllReceipts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [multiStatusFilter, setMultiStatusFilter] = useState([]);
  const [approverDetails, setApproverDetails] = useState([]);
  const [editing, setEditing] = useState(false);

  return (
    <AppContext.Provider
      value={{
        sharedTableData,
        setSharedTableData,
        mrno,
        setMrno,
        hasInputActivity,
        setHasInputActivity,
        isMRSelected,
        setIsMRSelected,
        reqApprovalstatus,
        setreqApprovalstatus,
        reqmrno,
        setReqMrno,
        selectedmr,
        setSelectedMr,
        particulars,
        setParticulars,
        particularname,
        setParticularName,
        newMr,
        setNewMr,
        selectedVendorIndex,
        setSelectedVendorIndex,
        setSelectedVendorReason,
        selectedVendorReason,
        freezequantity,
        setfreezeQuantity,
        receipts,
        setReceipts,
        setAllReceipts,
        allreceipts,
        multiStatusFilter,
        setMultiStatusFilter,
        statusFilter,
        setStatusFilter,
        approverDetails,
        setApproverDetails,
        editing,
        setEditing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
