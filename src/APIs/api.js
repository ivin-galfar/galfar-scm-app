import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

export const api = axios.create({
  baseURL: REACT_SERVER_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? "";
    const isLoginRequest = /\/users\/login(?:\?|$)/.test(requestUrl);

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("userInfo");
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post(`/users/login`, {
    email,
    password,
  });
  return data;
};

export const logoutUser = async () => {
  await api.post(`/users/logout`);
};

export const registerUser = async ({ email, password }) => {
  const { data } = await api.post(`/users/register`, {
    email,
    password,
  });
  return data;
};

export const feedReceipt = async ({ sharedTableData }) => {
  const { data } = await api.post(`/receipts`, {
    formData: sharedTableData.formData,
    tableData: sharedTableData["tableData"],
  });
  return data;
};

export const updateReceipt = async ({
  sharedTableData,
  selectedVendorIndex,
  selectedVendorReason,
}) => {
  try {
    const { data } = await api.put(
      `/receipts/updatereceipt/${sharedTableData.formData.id}`,
      {
        formData: sharedTableData.formData,
        tableData: sharedTableData["tableData"],
        selectedIndex: selectedVendorIndex,
        selectedReason: selectedVendorReason,
      },
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const feedlgstatement = async ({ formData, tableData }) => {
  try {
    const response = await api.post(`/logistics`, {
      formData,
      tableData,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updatelgstatement = async ({ formData, tableData }) => {
  try {
    const response = await api.put(
      `/logistics/updatestatementvalues/${formData.id}`,
      {
        formData,
        tableData,
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchallid = async (userInfo, module) => {
  try {
    const showinactive = userInfo?.is_admin || userInfo?.role.includes("hod");
    const response = await api.get(`/logistics/allcs`, {
      params: {
        module,
        project: userInfo.pr_code,
        role: userInfo.role,
        showinactive,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchallstatements = async (
  statusfilter,
  userInfo,
  pageSize,
  pageIndex,
  searchcsno,
  searchcsname,
) => {
  try {
    const showinactive = userInfo?.is_admin || userInfo?.role.includes("hod");
    const response = await api.get(`/logistics/statements`, {
      params: {
        statusfilter,
        searchcsno,
        searchcsname,
        pageIndex,
        pageSize,
        role: userInfo.role[0],
        project: userInfo.pr_code,
        showinactive,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EmailAlert = async (cs_id, userInfo, dept, formData) => {
  const {
    project,
    cargo_details,
    status,
    shipment_no,
    rejectedby,
    comments,
    created_at,
    approvedPdfUrl,
    approvedpdfName,
    file,
    filename,
  } = formData;

  let project_code = 1;
  if (project != "plant") {
    project_code = typeof project === "string" ? Number(project) : project;
  }
  try {
    const response = await api.post(`/emailnotify/${cs_id}?dept=${dept}`, {
      status,
      userInfo: {
        role: userInfo.role[0],
        pr_code: userInfo.pr_code,
      },
      project_code,
      cargo_details,
      shipment_no,
      rejectedby,
      comments,
      created_at,
      approvedPdfUrl,
      approvedpdfName,
      file,
      filename,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchStatement = async (userInfo, cs_id) => {
  try {
    const response = await api.get(`/logistics/${cs_id}`);
    let filteredresponse = response;

    if (userInfo.role?.includes("pm")) {
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

export const fetchReceipt = async (id) => {
  if (id && id != "default") {
    try {
      const response = await api.get(`/receipts/${id}`);
      const receipt = response.data;
      return receipt;
    } catch (error) {
      throw error;
    }
  } else {
    return [];
  }
};

export const fetchReceiptsApproverDetails = async (id) => {
  if (id && id != "default") {
    try {
      const response = await api.get(`/receipts/approverdetails/${id}`);
      const receipt = response.data.approverDetails;

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
  searchcsno,
  searchcsname,
  type,
}) => {
  try {
    const showinactive = userInfo?.is_admin || userInfo?.role.includes("hod");

    const response = await api.get(`/receipts/totalreceipts/`, {
      params: {
        type,
        expectedStatuses: expectedStatuses?.length
          ? expectedStatuses.join(",")
          : null,
        statusfilter: status != "All" ? status : null,
        multiStatus: multiStatus?.length ? multiStatus.join(",") : null,
        searchcsno,
        searchcsname,
        showinactive,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchApproverDetails = async (cs_id) => {
  try {
    const response = await api.get(
      `/logistics/statements/approverdetails/${cs_id}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCsCount = async (
  userInfo,
  statusfilter,
  searchcsno,
  searchcsname,
  project,
) => {
  try {
    const showinactive = userInfo?.is_admin || userInfo?.role.includes("hod");

    const response = await api.get(`/logistics/totalreceipts/`, {
      params: {
        statusfilter,
        role: userInfo.role[0],
        searchcsno,
        searchcsname,
        project,
        showinactive,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const recallStatementValues = async (cs_id, recalled_times) => {
  try {
    await api.post(`/logistics/updatestatement/${cs_id}`, {
      updatedstatus: "created",
      sentforapproval: null,
      recalled_times,
    });
  } catch (error) {
    throw error;
  }
};

export const feedbrstatement = async ({ formData }) => {
  try {
    const response = await api.post(`/brstatement`, {
      formData,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updatebrstatement = async ({ formData }) => {
  try {
    const response = await api.put(
      `/brstatement/updatebrstatementvalues/${formData.id}`,
      {
        formData,
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const updatebrstatementImages = async ({ brtabledata }) => {
  try {
    const response = await api.put(
      `/brstatement/updatebrimages/${brtabledata?.id}`,
      {
        brtabledata,
      },
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchbrstatement = async (cs_id) => {
  try {
    const response = await api.get(`/brstatement/${cs_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchbrstatements = async ({
  userinfo,
  statusfilter,
  searchcsno,
  searchcsname,
  page,
  limit,
  module,
}) => {
  try {
    const showinactive = userinfo?.is_admin || userinfo?.role.includes("hod");

    const response = await api.get(`/brstatement/`, {
      params: {
        module,
        role: userinfo.role[0],
        statusfilter,
        page,
        limit,
        searchcsno,
        searchcsname,
        showinactive,
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
  searchcsno,
  searchcsname,
  page,
  limit,
) => {
  try {
    const showinactive = userInfo?.is_admin || userInfo?.role.includes("hod");

    const response = await api.get(`/brstatement/totalstatements`, {
      params: {
        statusfilter,
        role: userInfo.role[0],
        searchcsno,
        searchcsname,
        page,
        limit,
        showinactive,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatebrstatements = async ({
  cs_id,
  status,
  userInfo,
  comments,
  file,
  filename,
}) => {
  try {
    const response = await api.put(`/brstatement/updatebrstatement/${cs_id}`, {
      status,
      comments,
      role: userInfo.role[0],
      file,
      filename,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const BrEmailAlert = async (cs_id, userInfo, dept, data) => {
  try {
    const response = await api.post(`/emailnotify/${cs_id}?dept=${dept}`, {
      id: data.id,
      userInfo: {
        role: userInfo.role[0],
      },
      type: data.chosentype,
      created_at: data.created_at,
      status: data.status,
      item: data.item,
      file: data.file,
      filename: data.filename,
      approvedPdfUrl: data.approvedPdfUrl,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createfilenote = async ({
  name,
  content,
  dept_id,
  file_names,
  file_urls,
  category,
  type,
  project,
  wef,
}) => {
  try {
    const response = await api.post(`/filenote/addfn`, {
      content,
      name,
      dept_id,
      category,
      type,
      file_names,
      file_urls,
      project,
      wef,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatefilenotevalues = async ({
  status,
  fnid,
  userInfo,
  comments,
  sentforapproval,
  type,
  category,
  name,
  action,
  content,
  attachments,
  project_code,
  exportedstatement,
  wefchanged,
  wefchangeddate,
}) => {
  try {
    const response = await api.put(`/filenote/updatefn/${fnid}`, {
      status,
      sentforapproval,
      role: userInfo.role,
      comments,
      type,
      category,
      name,
      action,
      content,
      attachments,
      project_code,
      exportedstatement,
      wefchanged,
      wefchangeddate,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchfilenoteids = async ({
  userInfo,
  module,
  dept_id,
  statusfilter,
  count,
  page,
  limit,
  searchcsno,
  searchcsname,
  categoryFilter,
  typeFilter,
  projectFilter,
}) => {
  try {
    const showinactive = userInfo?.is_admin || userInfo?.role.includes("hod");
    const response = await api.get(`/filenote/`, {
      params: {
        module,
        role: userInfo.role.join(","),
        isadmin: userInfo.is_admin,
        dept_id: dept_id.join(","),
        project_code: projectFilter
          ? [projectFilter]?.join(",")
          : userInfo.pr_code
            ? userInfo.pr_code.join(",")
            : "",
        statusfilter,
        count,
        page,
        limit,
        searchcsno,
        searchcsname,
        categoryFilter,
        typeFilter,
        showinactive,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchfilenoteidvalue = async (fnid, userInfo) => {
  try {
    const response = await api.get(`/filenote/${fnid}`, {
      params: {
        role: userInfo.role.join(","),
        isadmin: userInfo.is_admin,
      },
    });
    return response.data[0];
  } catch (error) {
    throw error;
  }
};

export const fetchlastid = async ({
  dept_id,
  type,
  category,
  selectedproject,
}) => {
  try {
    const response = await api.get(`/filenote/fetchdocno`, {
      params: {
        dept_id,
        type: type,
        category: category || "file_note",
        project_code: selectedproject,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchProjectDetails = async () => {
  try {
    const response = await api.get(`/projects/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletefn = async (fnid) => {
  try {
    const response = await api.put(`/filenote/deletefn/${fnid}`, {});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const FnEmailAlert = async (id, userInfo, dept, data) => {
  try {
    const response = await api.post(
      `/emailnotify/${id}?dept=${dept}&type=${data.type}&category=${data.category}`,
      {
        id: data.id,
        role: userInfo.is_admin
          ? (userInfo.role?.[1] ?? userInfo.role?.[0])
          : userInfo.role?.[0],
        dept_id: data.department_id ?? data.dept_id,
        doc_no: data.doc_no ?? data.doc_id,
        name: data.name,
        status: data.status,
        created_at: data.created_at,
        is_admin: userInfo.is_admin,
        project_code: data.project_code,
        exportedstatement: data.exportedstatement,
        file: data.file,
        file_name: data.file_name,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getcmpmNames = async (role, project) => {
  try {
    const response = await api.get(`/projects/cmpmnames`, {
      params: { requiredrole: role, project: project },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getcategory = async (dept_id) => {
  try {
    const response = await api.get(`/filenote/fetchcategory`, {
      params: { dept_id },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateiocintimation = async (userInfo, fnid, flag) => {
  try {
    const response = await api.put(`/filenote/updatedemob/${fnid}`, {
      flag: flag,
      email: userInfo.email.split("@")[0],
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatedocread = async (userInfo) => {
  try {
    const response = await api.put(`/users/updatedocread`, {
      email: userInfo.email,
      click: 1,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const validateemail = async (email) => {
  try {
    const response = await api.post(`/users/validateemail`, {
      email: email,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ResetEmail = async (email, resetToken, expiry) => {
  try {
    const response = await api.post(`/emailnotify/pwdresetreq`, {
      email: email,
      resettoken: resetToken,
      expiry: expiry,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const VerifyResetToken = async (resetToken) => {
  try {
    const response = await api.post(`/emailnotify/verifyresettoken`, {
      resettoken: resetToken,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
export const ResetUserPassword = async (token, password) => {
  try {
    const response = await api.post(`/emailnotify/pwdreset`, {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetAnalyticsData = async () => {
  try {
    const response = await api.get(`/analytics/approvals`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetAnnouncementsData = async () => {
  try {
    const response = await api.get(`/announcements/`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetSharePointItems = async ({
  listName,
  pageSize,
  fields,
  filter,
  cursor,
}) => {
  const response = await api.get(`/api/sharepoint/items`, {
    params: {
      listName,
      pageSize,
      fields,
      filter,
      ...(cursor ? { cursor } : {}),
    },
  });

  return response.data;
};

export const GetSharePointItemCount = async ({ listName }) => {
  const response = await api.get(`/api/sharepoint/count`, {
    params: {
      listName,
    },
  });

  return response.data;
};

export const fetchSharePointUserPhoto = async (email) => {
  try {
    const response = await api.get(
      `/users/user-photo/${encodeURIComponent(email)}`,
      {
        responseType: "blob",
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetFleetDocId = async (project) => {
  try {
    const response = await api.get(`/flreq/fetchdocid/${project}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetFleetRequests = async (
  userInfo,
  project,
  module,
  page,
  limit,
  statusfilter,
) => {
  try {
    const roles = (
      Array.isArray(userInfo?.role) ? userInfo.role : [userInfo?.role]
    )
      .filter(Boolean)
      .map((role) => String(role).trim().toLowerCase());
    const assignedProjects = (
      Array.isArray(userInfo?.pr_code) ? userInfo.pr_code : [userInfo?.pr_code]
    )
      .filter(
        (projectCode) => projectCode !== undefined && projectCode !== null,
      )
      .map((projectCode) => String(projectCode).trim())
      .filter(Boolean);
    const canViewAllProjects = roles.some((role) =>
      ["inith", "hod", "gm", "ceo"].includes(role),
    );
    const requestedProjects = (Array.isArray(project) ? project : [project])
      .filter(
        (projectCode) => projectCode !== undefined && projectCode !== null,
      )
      .map((projectCode) => String(projectCode).trim())
      .filter(Boolean);
    const permittedProjects = canViewAllProjects
      ? requestedProjects
      : requestedProjects.length
        ? requestedProjects.filter((projectCode) =>
            assignedProjects.includes(projectCode),
          )
        : assignedProjects;
    if (!canViewAllProjects && permittedProjects.length === 0) return [];
    const projects = permittedProjects.join(",");
    const response = await api.get(`/flreq/fetchdocsdata`, {
      params: {
        module: module,
        page,
        limit,
        statusfilter,
        ...(module === "fleetrequest" && canViewAllProjects
          ? {}
          : projects && { projects }),
      },
    });

    if (canViewAllProjects || !Array.isArray(response.data)) {
      return response.data;
    }

    // Defense in depth: never expose records outside the signed-in user's
    // assigned projects, even if the server returns an unexpectedly broad set.
    return response.data.filter((request) =>
      assignedProjects.includes(
        String(request?.project ?? request?.project_code ?? "").trim(),
      ),
    );
  } catch (error) {
    throw error;
  }
};

export const GetFleetRequestById = async (id) => {
  const response = await api.get(`/flreq/${id}`);

  return response.data;
};

export const AddNewFleetRequests = async ({
  project,
  date,
  location,
  items,
  comments,
}) => {
  try {
    const payload = {
      project,
      date,
      location,
      status: "created",
      comments,
      items: items.map((item) => ({
        fleet_description: item.fleetDescription,
        capacity: item.capacity,
        cicpa: item.cicpa,
        quantity: Number(item.quantity),
        required_from: item.requiredFrom,
        rental_type: item.rentalType,
        duration: item.duration,
        purpose: item.purpose,
        production_qty_envisaged: Number(item.productionQtyEnvisaged),
        qty_similar_machines: Number(item.similarMachinesAvailable),
        utilization: Number(item.utilization),
        adnoc_fitments: item.adnocFitments,
        tpi: item.tpi,
        remarks: item.remarks,
      })),
    };

    const response = await api.post(`/flreq`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const UpdateFleetRequestWorkflow = async ({
  id,
  status,
  action,
  comments,
  itemId,
  refNo,
  project,
  date,
  location,
  items,
  deleted,
  action_taken,
}) => {
  try {
    const response = await api.put(`/flreq/${id}`, {
      status,
      action,
      comments,
      ...(itemId !== undefined && { item_id: itemId }),
      ...(refNo !== undefined && { ref_no: refNo }),
      ...(project !== undefined && { project }),
      ...(date !== undefined && { date }),
      ...(location !== undefined && { location }),
      ...(items !== undefined && { items }),
      ...(deleted !== undefined && { deleted }),
      ...(action_taken !== undefined && { action_taken }),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const FREmailAlert = async (id, userInfo, dept, data) => {
  try {
    const response = await api.post(`/emailnotify/${id}?dept=${dept}&type=fr`, {
      id: data.id,
      role: userInfo.is_admin
        ? userInfo.role?.includes("initfr")
          ? "initfr"
          : (userInfo.role?.[1] ?? userInfo.role?.[0])
        : userInfo.role?.[0],
      doc_id: data.doc_id,
      created_date: data.created_date,
      location: data.location,
      project: data.project,
      status: data.status,
      ...(data.exportedStatementAttachment && {
        exportedStatementAttachment: data.exportedStatementAttachment,
      }),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
