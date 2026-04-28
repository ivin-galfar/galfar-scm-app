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
  isdc,
  ishire,
}) => {
  let defaultDept = "plant";
  let activeDept = "plant";
  let allowedDept = ["logistics", "bvrplant", "plant", "fn"];
  if (isfm) {
    defaultDept = "bvrplant";
    activeDept = "bvrplant";
    allowedDept = ["logistics", "bvrplant", "fn"];
  } else if (ispm) {
    allowedDept = ["logistics", "fn"];
    defaultDept = "logistics";
    activeDept = "logistics";
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
      activeDept = "plant";
      defaultDept = "plant";
      if (isasset) {
        allowedDept.push("bvrplant");
      } else if (isdc) {
        allowedDept.push("fn");
        allowedDept.push("fn");
        activeDept = "fn";
        defaultDept = "fn";
        allowedDept = allowedDept.filter((dept) => dept !== "plant");
      } else if (isfnote) {
        activeDept = "fn";
        defaultDept = "fn";
        allowedDept.push("fn");

        if (ishire || isasset) {
          allowedDept.push("plant");
          activeDept = "plant";
          defaultDept = "plant";
        } else {
          // remove plant when only fnote (with or without asset)
          allowedDept = allowedDept.filter((dept) => dept !== "plant");
        }
      }
    }
  }

  return {
    defaultDept,
    activeDept,
    allowedDept,
  };
};
