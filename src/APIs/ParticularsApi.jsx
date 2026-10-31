import { api } from "./api";

const fetchParticulars = async (userInfo, dept_id) => {
  if (
    !userInfo.role.includes("inita") &&
    !userInfo.role.includes("inith") &&
    !userInfo.role.includes("initlg")
  ) {
    return;
  }
  try {
    const response = await api.get(`/particulars?dept_code=${dept_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default fetchParticulars;
