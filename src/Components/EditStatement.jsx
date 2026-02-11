import { MdModeEdit } from "react-icons/md";
import { useIsEditing } from "../store/helperStore";
import { useBrStatement, useBrTableData } from "../store/brStore";

const EditStatement = ({ onClick }) => {
  const { isedit, setIsEdit, resetIsEdit } = useIsEditing();
  const { brtabledata } = useBrTableData();

  return (
    <div>
      <button
        type="button"
        className={`p-2 px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-50  hover:bg-blue-100 active:bg-blue-200 ${brtabledata.id == null ? "cursor-auto" : "cursor-pointer"} `}
        disabled={brtabledata.id == null}
        onClick={() => {
          onClick();
          setIsEdit();
        }}
      >
        <MdModeEdit />
        Edit Statement
      </button>
    </div>
  );
};

export default EditStatement;
