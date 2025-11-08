import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

const fetchParticulars = async (userInfo, dept_id) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `${REACT_SERVER_URL}/particulars?dept_code=${dept_id}`,
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default fetchParticulars;
