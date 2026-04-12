export const getDeptConfig = ({
  isLogistics,
  isPlant,
  isfm,
  isasset,
  ishod,
  isceo,
  isgm,
  isfnote,
}) => {
  let defaultDept = "plant";
  let activeDept = "plant";
  let allowedDept = ["logistics", "bvrplant", "plant", "fn"];
  if (isfm) {
    defaultDept = "bvrplant";
    activeDept = "bvrplant";
    allowedDept = ["logistics", "bvrplant", "fn"];
  } else if (!isceo && !isgm && !ishod) {
    if (isLogistics) {
      if (isfnote) {
        defaultDept = "logistics";
        activeDept = "logistics";
        allowedDept = ["logistics", "fn"];
      } else {
        defaultDept = "logistics";
        activeDept = "logistics";
        allowedDept = ["logistics"];
      }
    } else if (isPlant) {
      allowedDept = ["plant"];

      if (isasset) {
        allowedDept.push("bvrplant");
      }

      if (isfnote) {
        allowedDept.push("fn");
      }
    }
  }

  return {
    defaultDept,
    activeDept,
    allowedDept,
  };
};
