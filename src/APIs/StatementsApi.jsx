import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

const fetchStatments = async ({
  expectedStatuses,
  userInfo,
  module,
  page,
  limit,
  status,
  multiStatus,
  searchcsno,
  searchcsname,
  type,
}) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const showinactive = userInfo?.is_admin || userInfo?.role.includes("hod");

    const response = await axios.get(`${REACT_SERVER_URL}/receipts/`, {
      ...config,
      params: {
        type: type ?? "",
        module,
        page: page,
        limit: limit,
        statusfilter: status != "All" ? status : null,
        multiStatus: multiStatus?.join(","),
        searchcsno,
        searchcsname,
        expectedStatuses: expectedStatuses?.length
          ? expectedStatuses.join(",")
          : null,
        showinactive,
      },
    });

    const receipts = response.data.receipts;

    let categorizedReceipts = receipts;

    const mrValues = categorizedReceipts
      .map((receipt) => {
        const id = receipt.formData?.id;
        const doc_no = receipt.formData?.doc_no;
        return id ? { id, doc_no } : null;
      })
      .filter(Boolean);

    const filteredReceipts = categorizedReceipts.filter((receipt) => {
      const status = receipt.formData?.status?.toLowerCase();
      const sentForApproval =
        receipt.formData?.sentforapproval?.toLowerCase() === "yes";
      const isReview = status === "review";

      const isIncluded =
        sentForApproval &&
        (expectedStatuses.map((s) => s.toLowerCase()).includes(status) ||
          isReview);
      return isIncluded;
    });

    const reqMrValues = filteredReceipts
      .map((receipt) => {
        const id = receipt.formData?.id;
        const doc_no = receipt.formData?.doc_no;
        return id ? { id, doc_no } : null;
      })
      .filter(Boolean);

    return {
      reqMrValues,
      categorizedReceipts,
      mrValues,
      filteredReceipts,
    };
  } catch (error) {
    throw error;
  }
};

export default fetchStatments;
