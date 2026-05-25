import { useComments } from "../store/helperStore";
const Alerts = ({ message, onCancel, onConfirm }) => {
  const { setComments } = useComments();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-transparent">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Are you sure to proceed?</h2>
        <p className="text-gray-600 mb-6 font-normal">{message}</p>
        {!message.includes("log out") &&
          !message.includes("create") &&
          !message.includes("Delete") &&
          !message.includes("recall") && (
            <textarea
              name="comments"
              rows={3}
              placeholder="Enter your comments here..."
              className="w-full p-2 border border-gray-300 h-18 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              onChange={(e) => setComments(e.target.value)}
            />
          )}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition cursor-pointer"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
