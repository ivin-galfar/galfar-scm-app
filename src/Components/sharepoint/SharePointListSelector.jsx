/* eslint-disable react/prop-types */
const SharePointListSelector = ({ lists, value, onChange, disabled }) => (
  <label className="flex min-w-48 flex-col gap-1.5 text-sm font-medium text-slate-700">
    SharePoint list
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      {lists.length === 0 ? (
        <option value="">No lists configured</option>
      ) : (
        lists.map((listName) => (
          <option key={listName} value={listName}>
            {listName}
          </option>
        ))
      )}
    </select>
  </label>
);

export default SharePointListSelector;
