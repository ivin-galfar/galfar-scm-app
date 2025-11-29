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
      type = userInfo?.role == "inita" ? "asset" : "hiring";
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
    // if (userInfo?.is_admin) {
    //   const type = userInfo?.role == "inita" ? "asset" : "hiring";
    //   categorizedReceipts = receipts.filter((r) => r.formData.type == type);
    // } else {
    //   categorizedReceipts = receipts.filter((receipt) => {
    //     const status = receipt.formData?.status?.toLowerCase();
    //     return expectedStatuses.map((s) => s.toLowerCase()).includes(status);
    //   });
    // }

    const mrValues = categorizedReceipts
      .map((receipt) => receipt.formData?.id)
      .filter(Boolean);

    const filteredReceipts = categorizedReceipts.filter((receipt) => {
      const status = receipt.formData?.status?.toLowerCase();
      const sentForApproval =
        receipt.formData?.sentforapproval?.toLowerCase() === "yes";
      const isReview = status === "review";
      // Find the first rejected entry, if any
      // const rejectedApprover = receipt.formData?.approverdetails?.find(
      //   (rej) => rej.rejectedby && rej.rejectedby.trim() !== ""
      // );
      // const rejectedRole = rejectedApprover
      //   ? rejectedApprover.rejectedby
      //   : null;

      // let canSeeRejected = false;
      //can be used for hirerachial view, not enabled all statements for all

      // if (status === "rejected" && rejectedRole) {
      //   switch (rejectedRole) {
      //     case "HOD":
      //       canSeeRejected = ["HOD", "Initiator", "GM", "CEO"].includes(
      //         userInfo?.role
      //       );
      //       break;
      //     case "GM":
      //       canSeeRejected = ["HOD", "Initiator", "GM", "CEO"].includes(
      //         userInfo?.role
      //       );
      //       break;
      //     case "CEO":
      //       canSeeRejected = ["HOD", "Initiator", "GM", "CEO"].includes(
      //         userInfo?.role
      //       );
      //       break;
      //     default:
      //       canSeeRejected = false;
      //   }
      // }

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
