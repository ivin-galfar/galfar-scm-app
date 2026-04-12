export const useEditorInfo = () => {
  try {
    const stored = localStorage?.getItem("editorContent");

    if (!stored || stored === "undefined") return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error("Invalid editorContent JSON:", error);
    return null;
  }
};
