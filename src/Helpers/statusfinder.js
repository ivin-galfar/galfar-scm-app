export const expectedstatus = (currentrole) => {
  let statustext = "";
  if (currentrole == "initlg") {
    statustext = "pending for incharge";
  } else if (currentrole == "incharge") {
    statustext = "pending for pm";
  } else if (currentrole == "pm") {
    statustext = "pending for gm";
  } else if (currentrole == "gm") {
    statustext = "pending for fm";
  } else if (currentrole == "fm") {
    statustext = "pending for ceo";
  } else if (currentrole == "ceo") {
    statustext = "approved";
  } else {
    statustext = "rejected";
  }

  return statustext;
};

export const role_finder = (currentrole) => {
  let role = "";
  if (currentrole == "incharge") {
    role = "comments_incharge";
  } else if (currentrole == "pm") {
    role = "comments_pm";
  } else if (currentrole == "gm") {
    role = "comments_gm";
  } else if (currentrole == "fm") {
    role = "comments_fm";
  } else if (currentrole == "ceo") {
    role = "comments_ceo";
  }
  return role;
};
