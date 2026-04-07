export const expectedstatus = (currentrole) => {
  const roles = currentrole.map((r) => r.toLowerCase());

  let statustext = "";
  if (roles.includes("initlg")) {
    statustext = "pending for incharge";
  } else if (roles.includes("incharge")) {
    statustext = "pending for pm";
  } else if (roles.includes("pm")) {
    statustext = "pending for gm";
  } else if (roles.includes("gm")) {
    statustext = "pending for fm";
  } else if (roles.includes("fm")) {
    statustext = "pending for ceo";
  } else if (roles.includes("ceo")) {
    statustext = "approved";
  } else {
    statustext = "rejected";
  }

  return statustext;
};

export const role_finder = (currentrole) => {
  const roles = currentrole.map((r) => r.toLowerCase());

  let role = "";
  if (roles.includes("incharge")) {
    role = "comments_incharge";
  } else if (roles.includes("pm")) {
    role = "comments_pm";
  } else if (roles.includes("gm")) {
    role = "comments_gm";
  } else if (roles.includes("fm")) {
    role = "comments_fm";
  } else if (roles.includes("ceo")) {
    role = "comments_ceo";
  }
  return role;
};

export const expectedstatusplant = (currentrole) => {
  const roles = currentrole.map((r) => r.toLowerCase());

  let statustext = "";
  if (roles.includes("inita")) {
    statustext = "pending for hod";
  } else if (roles.includes("hod")) {
    statustext = "pending for fm";
  } else if (roles.includes("fm")) {
    statustext = "pending for gm";
  } else if (roles.includes("gm")) {
    statustext = "pending for ceo";
  } else if (roles.includes("ceo")) {
    statustext = "approved";
  } else {
    statustext = "rejected";
  }

  return statustext;
};

export const statusExpected = (currentrole = [], action, type, category) => {
  let statustext = "";
  const roles = currentrole.map((r) => r.toLowerCase());

  if (
    !roles.includes("cm") &&
    !roles.includes("pm") &&
    !roles.includes("initpr")
  ) {
    if (roles.includes("initfn") && action == "save") {
      statustext = "pending for hod";
    } else if (roles.includes("hod")) {
      statustext = `pending for ${type == "ioc" || (type == "file_note" && category == "TFW") || (type == "file_note" && category == "General") ? "gm" : "sfm"}`;
    } else if (roles.includes("fm")) {
      statustext = "pending for gm";
    } else if (roles.includes("gm")) {
      statustext = "pending for ceo";
    } else if (roles.includes("ceo")) {
      statustext = "approved";
    } else {
      statustext = "rejected";
    }
  } else if (roles.includes("initpr") && category == "Demob") {
    statustext = "pending for cm";
  } else if (roles.includes("cm")) {
    statustext = "approved";
  } else {
    statustext = "rejected";
  }

  return statustext;
};
