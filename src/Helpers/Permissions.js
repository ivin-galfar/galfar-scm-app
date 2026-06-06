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
  let defaultDept = "";
  let activeDept = "";
  let allowedDept = ["fn"];
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
      if (isasset) {
        allowedDept.push("asset", "bvrplant", "fn");
        activeDept = "asset";
        defaultDept = "asset";
      } else if (isdc) {
        allowedDept.push("fn");
        allowedDept.push("fn");
        activeDept = "fn";
        defaultDept = "fn";
      } else if (isfnote) {
        activeDept = "fn";
        defaultDept = "fn";
        allowedDept.push("fn");

        if (ishire) {
          allowedDept.push("hiring");
          activeDept = "hiring";
          defaultDept = "hiring";
        }
      }
    }
  } else {
    allowedDept = ["logistics", "bvrplant", "fn", "hiring", "asset"];
    activeDept = "hiring";
    defaultDept = "hiring";
  }

  return {
    defaultDept,
    activeDept,
    allowedDept,
  };
};
