export const handleRemoveFile = (index, formData, setFormData) => {
  const updatedFilenames = [...formData.filename];
  const updatedFiles = [...formData.file];

  updatedFilenames.splice(index, 1);
  updatedFiles.splice(index, 1);

  setFormData((prev) => ({
    ...prev,
    filename: updatedFilenames,
    file: updatedFiles,
  }));
};

export const wrapWithAndGlue = (text, maxWidth, doc) => {
  const safeText = text.replace(/,?\s+and\s+/g, (match) => `✪${match.trim()}✪`);

  const parts = safeText.split(" ");
  let line = "";
  const result = [];

  for (let p of parts) {
    const word = p.replace(/✪/g, " ");
    const testLine = line ? `${line} ${word}` : word;

    if (doc.getTextWidth(testLine) > maxWidth) {
      result.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) result.push(line);

  return result.map((line) => line.replace(/✪/g, " "));
};
