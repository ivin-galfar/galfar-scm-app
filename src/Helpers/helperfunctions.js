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

export const getApproverName = (role) => {
  switch (role) {
    case "incharge":
      return "Mr.Anoop";
    case "gm":
      return "Mr.Vijayan. C.G.";
    case "ceo":
      return "Mr.Sridhar.C";
    case "fm":
      return "Mr.Suraj Rajan";
  }
};

export const getPmName = (projectcode) => {
  switch (projectcode) {
    case "7092":
      return "Mr. Manoj E";
    case "7112":
      return "Mr. Manoj E";
    case "7099":
      return "Mr. Shanmugam R.";
    case "7110":
      return "Mr. Swarup Biswas";
    case "7111":
      return "Mr. Manoj Pattabi";
    case "7114":
      return "Mr. Manoj Pattabi";
    case "7108":
      return "Mr. Shivnath Kumar";
    case "7105":
      return "Mr. Jamsheed Nawaz";
    case "7097":
      return "Mr. Jeyaraman Sangaiya";
    case "7102":
      return "Mr. Firose Pareeth";
    case "7104":
      return "Mr. Praveen Kumar";
    case "7106":
      return "Mr. Sumon Kuriakose - Project Director (PD)";
    case "1":
      return "Mr. Pramoj Ramesh Konattuseril (PLANT MANAGER)";
    default:
      return "Unknown PM";
  }
};
