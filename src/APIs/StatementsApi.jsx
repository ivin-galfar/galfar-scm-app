import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

const fetchStatments = async ({ expectedStatuses, userInfo }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(`${REACT_SERVER_URL}/receipts`, config);

    const receipts = response.data.receipts.sort(
      (a, b) =>
        new Date(b.formData.created_at) - new Date(a.formData.created_at)
    );

    let categorizedReceipts = receipts;
    if (userInfo?.is_admin) {
      const type = userInfo?.role == "inita" ? "asset" : "hiring";
      categorizedReceipts = receipts.filter((r) => r.formData.type == type);
    } else {
      categorizedReceipts = receipts.filter((receipt) => {
        const status = receipt.formData?.status?.toLowerCase();
        return expectedStatuses.map((s) => s.toLowerCase()).includes(status);
      });
    }

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
