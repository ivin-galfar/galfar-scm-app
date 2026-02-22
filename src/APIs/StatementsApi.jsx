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
  search,
}) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    let type = null;
    if (userInfo?.is_admin) {
      type =
        userInfo?.role == "inita" || userInfo?.role == "initbr"
          ? "asset"
          : "hiring";
    }

    const response = await axios.get(`${REACT_SERVER_URL}/receipts/`, {
      ...config,
      params: {
        type: type ?? "",
        module,
        page: page,
        limit: limit,
        statusfilter: status != "All" ? status : null,
        multiStatus: multiStatus?.join(","),
        search,
        expectedStatuses: expectedStatuses?.length
          ? expectedStatuses.join(",")
          : null,
      },
    });

    const receipts = response.data.receipts;

    let categorizedReceipts = receipts;

    const mrValues = categorizedReceipts
      .map((receipt) => receipt.formData?.id)
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
      .map((receipt) => receipt.formData?.id)
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
