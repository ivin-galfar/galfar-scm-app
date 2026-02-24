export const getDeptConfig = ({
  isLogistics,
  isPlant,
  isfm,
  isasset,
  ishod,
  isceo,
  isgm,
}) => {
  let defaultDept = "plant";
  let activeDept = "plant";
  let allowedDept = ["logistics", "bvrplant", "plant"];
  if (isfm) {
    defaultDept = "bvrplant";
    activeDept = "bvrplant";
    allowedDept = ["logistics", "bvrplant"];
  } else if (!isceo && !isgm && !ishod) {
    if (isLogistics) {
      defaultDept = "logistics";
      activeDept = "logistics";
      allowedDept = ["logistics"];
    } else if (isPlant) {
      if (isasset) {
        defaultDept = "plant";
        activeDept = "plant";
        allowedDept = ["plant", "bvrplant"];
      } else {
        defaultDept = "plant";
        activeDept = "plant";
        allowedDept = ["plant"];
      }
    }
  }

  return {
    defaultDept,
    activeDept,
    allowedDept,
  };
};
