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

export const statusExpected = (currentrole = [], dept) => {
  let statustext = "";
  const roles = currentrole.map((r) => r.toLowerCase());
  if (roles.includes("fnote")) {
    statustext = "pending for hod";
  } else if (roles.includes("hod") && dept === "plant") {
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
