import { FaFileUpload } from "react-icons/fa";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useBrStatement } from "../store/brStore";
import { handleFileUpload } from "../Helpers/helperfunctions";

const FileUpload = () => {
  const { formData: data, setFormData } = useBrStatement();
  const userInfo = useUserInfo();

  return (
    <div>
      <div className="flex  gap-2 pl-10">
        <div className="block gap-2">
          <label
            htmlFor="receiptfile"
            className={`flex gap-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-all cursor-pointer`}
          >
            Upload File
            <FaFileUpload size={20} />
            {Array.isArray(data?.file) &&
              data?.file?.filter((f) => f.trim() !== "").length > 0 && (
                <span className="relative -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce z-10">
                  {data?.file.length}
                </span>
              )}
          </label>
          <input
            id="receiptfile"
            type="file"
            multiple
            accept="image/*"
            className={`hidden `}
            onChange={(e) =>
              handleFileUpload(e.target.files, userInfo, setFormData)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
