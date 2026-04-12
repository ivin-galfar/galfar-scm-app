import useUserInfo from "../CustomHooks/useUserInfo";
import { handleAttachmentsUpload } from "../Helpers/helperfunctions";
import { FaFileUpload } from "react-icons/fa";
import { EditorContext } from "@tiptap/react";
import { useContext } from "react";
import { useAttachments } from "../store/helperStore";
import { useToast } from "../store/toastStore";
import { useImageSaved } from "../store/brStore";

const UploadAttachments = ({ styles }) => {
  const userInfo = useUserInfo();
  const { attachments, setAttachments } = useAttachments();
  const { setShowToast, resetshowtoast } = useToast();
  const { setImageSaved, resetImageSaved } = useImageSaved();

  return (
    <div>
      <div className={`flex  gap-2`}>
        <div className="block gap-2">
          <label
            htmlFor="receiptfile"
            className={`flex gap-2 text-sm px-4 py-2 rounded-lg transition-all ${styles}`}
          >
            Upload File
            <span className="flex justify-center items-center">
              <FaFileUpload size={15} />
            </span>
          </label>
          <input
            id="receiptfile"
            type="file"
            multiple
            accept="image/*"
            className={`hidden `}
            onChange={async (e) => {
              const files = await handleAttachmentsUpload(
                e.target.files,
                userInfo,
              );

              const newAttachments = files.map((file) => ({
                url: file.fileUrl,
                name: file.fileName,
              }));

              setAttachments((prev) => [...prev, ...newAttachments]);
              setShowToast();
              setImageSaved();
              setTimeout(() => {
                resetshowtoast();
                resetImageSaved();
              }, 1500);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadAttachments;
