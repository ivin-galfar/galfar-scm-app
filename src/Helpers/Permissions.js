export const getDeptConfig = ({
  isLogistics,
  isPlant,
  isfm,
  isasset,
  ishod,
  isceo,
  isgm,
  isfnote,
  ispm,
  iscm,
}) => {
  let defaultDept = "plant";
  let activeDept = "plant";
  let allowedDept = ["logistics", "bvrplant", "plant", "fn"];
  if (isfm) {
    defaultDept = "bvrplant";
    activeDept = "bvrplant";
    allowedDept = ["logistics", "bvrplant", "fn"];
  } else if (iscm) {
    defaultDept = "fn";
    activeDept = "fn";
    allowedDept = ["fn"];
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

      if (isfnote || ispm) {
        allowedDept.push("fn");
        defaultDept = "fn";
        activeDept = "fn";
      }
    }
  }

  return {
    defaultDept,
    activeDept,
    allowedDept,
  };
};
