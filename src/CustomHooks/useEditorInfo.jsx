export const useEditorInfo = () => {
  const stored = localStorage.getItem("editorContent");

  const formattedStored = stored ? JSON.parse(stored) : null;

  return formattedStored;
};
