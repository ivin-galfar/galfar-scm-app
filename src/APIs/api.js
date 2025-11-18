import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

export const loginUser = async ({ email, password }) => {
  const config = {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  const { data } = await axios.post(
    `${REACT_SERVER_URL}/users/login`,
    {
      email,
      password,
    },
    config
  );
  return data;
};

export const registerUser = async ({ email, password }) => {
  const config = {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  const { data } = await axios.post(
    `${REACT_SERVER_URL}/users/register`,
    {
      email,
      password,
    },
    config
  );
  return data;
};

export const feedReceipt = async ({ sharedTableData, userInfo }) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userInfo.token}`,
    },
  };
  const { data } = await axios.post(
    `${REACT_SERVER_URL}/receipts`,
    {
      formData: sharedTableData.formData,
      tableData: sharedTableData["tableData"],
    },
    config
  );
  return data;
};

export const updateReceipt = async ({
  sharedTableData,
  selectedvendorindex,
  selectedvendorreason,
  userInfo,
}) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userInfo.token}`,
    },
  };

  const { data } = await axios.put(
    `${REACT_SERVER_URL}/receipts/updatereceipt/${sharedTableData.formData.id}`,
    {
      formData: sharedTableData.formData,
      tableData: sharedTableData["tableData"],
      selectedIndex: selectedvendorindex,
      selectedReason: selectedvendorreason,
    },
    config
  );
  return data;
};

export const feedlgstatement = async ({ formData, tableData, userInfo }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.post(
      `${REACT_SERVER_URL}/logistics`,
      {
        formData,
        tableData,
      },
      config
    );
    return response;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const updatelgstatement = async ({ formData, tableData, userInfo }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.put(
      `${REACT_SERVER_URL}/logistics/updatestatementvalues/${formData.id}`,
      {
        formData,
        tableData,
      },
      config
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchallid = async (userInfo) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/logistics/allcs`,
      config
    );
    let cs = response.data
      .filter(
        (d) =>
          d.status !== null && d.status !== "created" && d.status !== "review"
      )
      .sort((a, b) => b.id - a.id);
    if (userInfo.role == "initlg") {
      cs = response.data.sort((a, b) => b.id - a.id);
    }
    if (userInfo.role == "pm") {
      if (userInfo.pr_code.includes(1)) {
        cs = response.data.filter(
          (d) => d.project == "plant" && d.status !== "created"
        );
      } else {
        cs = response.data.filter(
          (d) =>
            userInfo.pr_code.includes(Number(d.project)) &&
            d.status !== "created"
        );
      }
    }

    return cs;
  } catch (error) {
    throw error;
  }
};

export const fetchallstatements = async (userInfo) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/logistics/statements`,
      config
    );
    let cs = response.data
      .filter(
        (d) =>
          d.status !== null && d.status !== "created" && d.status !== "review"
      )
      .sort((a, b) => b.id - a.id);
    if (userInfo.role == "initlg") {
      cs = response.data.sort((a, b) => b.id - a.id);
    }
    if (userInfo.role == "pm") {
      if (userInfo.pr_code.includes(1)) {
        cs = response.data.filter(
          (d) => d.project == "plant" && d.status !== "created"
        );
      } else {
        cs = response.data.filter(
          (d) =>
            userInfo.pr_code.includes(Number(d.project)) &&
            d.status !== "created"
        );
      }
    }

    return cs;
  } catch (error) {
    throw error;
  }
};

export const EmailAlert = async (cs_id, userInfo, dept, formData) => {
  const { project, cargo_details, status, shipment_no, rejectedby } = formData;

  let project_code = 1;
  if (project != "plant") {
    project_code = typeof project === "string" ? Number(project) : project;
  }
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.post(
      `${REACT_SERVER_URL}/emailnotify/${cs_id}?dept=${dept}`,
      {
        status,
        userInfo: {
          role: userInfo.role,
          pr_code: userInfo.pr_code,
        },
        project_code,
        cargo_details,
        shipment_no,
        rejectedby,
      },
      config
    );
    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const fetchStatement = async (userInfo, cs_id) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/logistics/${cs_id}`,
      config
    );
    let filteredresponse = response;

    if (userInfo.role == "pm") {
      if (
        userInfo.pr_code.includes(1) &&
        response.data?.formData?.project == "plant"
      ) {
        filteredresponse = response;
      } else {
        filteredresponse = userInfo.pr_code.includes(
          Number(response.data?.formData?.project)
        )
          ? response
          : "";
      }
    }
    return filteredresponse;
  } catch (error) {
    const message = error?.response?.data || error.message;
    throw message;
  }
};
