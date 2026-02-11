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
    config,
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
    config,
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
    config,
  );
  return data;
};

export const updateReceipt = async ({
  sharedTableData,
  selectedVendorIndex,
  selectedVendorReason,
  userInfo,
}) => {
  try {
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
        selectedIndex: selectedVendorIndex,
        selectedReason: selectedVendorReason,
      },
      config,
    );
    return data;
  } catch (error) {
    throw error;
  }
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
      config,
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
      config,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchallid = async (userInfo, module) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(`${REACT_SERVER_URL}/logistics/allcs`, {
      ...config,
      params: { module },
    });
    let cs = response.data
      .filter(
        (d) =>
          d.status !== null && d.status !== "created" && d.status !== "review",
      )
      .sort((a, b) => b.id - a.id);
    if (userInfo.role == "initlg") {
      cs = response.data.sort((a, b) => b.id - a.id);
    }
    if (userInfo.role == "pm") {
      if (userInfo.pr_code.includes(1)) {
        cs = response.data.filter(
          (d) => d.project == "plant" && d.status !== "created",
        );
      } else {
        cs = response.data.filter(
          (d) =>
            userInfo.pr_code.includes(Number(d.project)) &&
            d.status !== "created",
        );
      }
    }

    return cs;
  } catch (error) {
    throw error;
  }
};

export const fetchallstatements = async (
  statusfilter,
  userInfo,
  pageSize,
  pageIndex,
  searchcs,
) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/logistics/statements`,
      {
        ...config,
        params: {
          statusfilter,
          searchcs,
          pageIndex,
          pageSize,
          role: userInfo.role,
        },
      },
    );
    let cs = response.data
      .filter((d) => d.status !== null)
      .sort((a, b) => b.id - a.id);
    if (userInfo.role == "initlg") {
      cs = response.data.sort((a, b) => b.id - a.id);
    }
    if (userInfo.role == "pm") {
      if (userInfo.pr_code.includes(1)) {
        cs = response.data.filter(
          (d) => d.project == "plant" && d.status !== "created",
        );
      } else {
        cs = response.data.filter(
          (d) =>
            userInfo.pr_code.includes(Number(d.project)) &&
            d.status !== "created",
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
      config,
    );
    return response.data;
  } catch (error) {
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
      config,
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
          Number(response.data?.formData?.project),
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

export const fetchReceipt = async (id, userInfo) => {
  if (id && id != "default") {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.get(
        `${REACT_SERVER_URL}/receipts/${id}`,
        config,
      );
      const receipt = response.data;
      return receipt;
    } catch (error) {
      throw error;
    }
  } else {
    return [];
  }
};

export const fetchReceiptCount = async ({
  expectedStatuses,
  userInfo,
  status,
  multiStatus,
  searchcs,
}) => {
  let type = null;

  if (userInfo?.is_admin) {
    type =
      userInfo?.role == "inita" || userInfo?.role == "initbr"
        ? "asset"
        : "hiring";
  }
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const response = await axios.get(
      `${REACT_SERVER_URL}/receipts/totalreceipts/`,
      {
        ...config,
        params: {
          type,
          expectedStatuses: expectedStatuses?.length
            ? expectedStatuses.join(",")
            : null,
          statusfilter: status != "All" ? status : null,
          multiStatus: multiStatus?.length ? multiStatus.join(",") : null,
          searchcs,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchApproverDetails = async (userInfo, cs_id) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/logistics/statements/approverdetails/${cs_id}`,
      config,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCsCount = async (userInfo, statusfilter, searchcs) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/logistics/totalreceipts/`,
      {
        ...config,
        params: { statusfilter, role: userInfo.role, searchcs },
      },
    );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const recallStatementValues = async (
  userInfo,
  cs_id,
  recalled_times,
) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    await axios.post(
      `${REACT_SERVER_URL}/logistics/updatestatement/${cs_id}`,
      {
        updatedstatus: "created",
        sentforapproval: null,
        recalled_times,
      },
      config,
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const feedbrstatement = async ({ formData, userInfo }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.post(
      `${REACT_SERVER_URL}/brstatement`,
      {
        formData,
      },
      config,
    );
    return response;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const updatebrstatement = async ({ formData, userInfo }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.put(
      `${REACT_SERVER_URL}/brstatement/updatebrstatementvalues/${formData.id}`,
      {
        formData,
      },
      config,
    );
    return response;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const fetchbrstatement = async (cs_id, userInfo) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/brstatement/${cs_id}`,

      config,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchbrstatements = async ({
  userinfo,
  statusfilter,
  searchcs,
  page,
  limit,
  module,
}) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userinfo.token}`,
      },
    };
    const response = await axios.get(`${REACT_SERVER_URL}/brstatement/`, {
      ...config,
      params: {
        module,
        role: userinfo.role,
        statusfilter,
        page,
        limit,
        searchcs,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchbrstatementscount = async (
  userInfo,
  statusfilter,
  searchcs,
  page,
  limit,
) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/brstatement/totalstatements`,
      {
        ...config,
        params: { statusfilter, role: userInfo.role, searchcs, page, limit },
      },
    );

    return response.data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const updatebrstatements = async ({
  cs_id,
  status,
  userInfo,
  comments,
}) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo?.token}`,
      },
    };
    const response = await axios.put(
      `${REACT_SERVER_URL}/brstatement/updatebrstatement/${cs_id}`,
      {
        status,
        comments,
        role: userInfo.role,
      },
      config,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
