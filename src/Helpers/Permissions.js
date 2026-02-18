export const getDeptConfig = ({
  isLogistics,
  isPlant,
  isfm,
  isbuyvsrent,
  isasset,
  ishod,
  isceo,
  isgm,
}) => {
  let defaultDept = "plant";
  let activeDept = "plant";
  let allowedDept = ["logistics", "brplant", "plant"];
  if (isfm) {
    defaultDept = "brplant";
    activeDept = "brplant";
    allowedDept = ["logistics", "brplant"];
  } else if (!isceo && !isgm && !ishod) {
    if (isLogistics) {
      defaultDept = "logistics";
      activeDept = "logistics";
      allowedDept = ["logistics"];
    } else if (isbuyvsrent) {
      defaultDept = "brplant";
      activeDept = "brplant";
      allowedDept = ["brplant", "plant"];
    } else if (isPlant) {
      if (isasset) {
        defaultDept = "plant";
        activeDept = "plant";
        allowedDept = ["plant", "brplant"];
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
