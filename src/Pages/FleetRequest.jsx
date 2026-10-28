import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  useTable,
} from "@tanstack/react-table";
import { tableFeatures } from "@tanstack/table-core";
import useUserInfo from "../CustomHooks/useUserInfo";
import { useClickFromDashboard, usenewfn } from "../store/helperStore";
import { useStatusFilter } from "../store/logisticsStore";
import {
  AddNewFleetRequests,
  GetFleetDocId,
  GetFleetRequestById,
  GetFleetRequests,
  FREmailAlert,
  UpdateFleetRequestWorkflow,
} from "../APIs/api";
import { RiAddBoxFill } from "react-icons/ri";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FleetItemsModal from "../Components/FleetItemsModal";
import ButtonTxtFR from "../Components/ButtonTxtFR";
import ApprovalModalFR from "../Components/ApprovalModalFR";
import FleetRequestConfirmationModal from "../Components/FleetRequestConfirmationModal";
import { LuCircleCheck, LuPencil, LuTrash2, LuUndo2 } from "react-icons/lu";
import { MdOutlineError } from "react-icons/md";
import { useErrorMessage } from "../store/errorStore";
import { useToast } from "../store/toastStore";
import {
  createEmptyFleetItem,
  getFleetDraftKey,
  readFleetDraft,
  removeFleetDraft,
  writeFleetDraft,
} from "../Helpers/fleetRequestDraft";
import {
  formatDateDDMMYYYY,
  formatDateDMY,
  formatwords,
  generateFRApprovedPDF,
  shouldSendInithIntimation,
} from "../Helpers/helperfunctions";
import { getFleetRequestAccess } from "../Helpers/fleetRequestPermissions";
import { normalizeDateForInput } from "../Helpers/fleetRequestDocument";
import { canRecallFleetRequest } from "../Helpers/approvalFlowHelper";
import { IoIosSave } from "react-icons/io";

/* eslint-disable react/prop-types */
const FleetRefNoCell = ({ row, table }) => {
  const item = row.original;
  const itemIndex = row.index;
  const { canEdit, onValueChange } = table.options.meta;
  const value = item.refNo ?? "";

  if (!canEdit) {
    return (
      <span
        className="block w-full min-w-0  font-medium text-slate-800"
        title={item.refNo || ""}
      >
        {item.refNo || "—"}
      </span>
    );
  }

  return (
    <div className="relative flex w-full min-w-0 items-center gap-1 overflow-hidden">
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onValueChange(itemIndex, event.target.value);
        }}
        aria-label={`Ref No. for item ${item.item_no ?? ""}`}
        className="box-border min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-1 py-1 text-center text-sm text-slate-800 outline-none hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};
/* eslint-enable react/prop-types */

const getToday = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split("T")[0];
};

const getFleetRequestSuccessMessage = (action) => {
  switch (action) {
    case "create":
      return "Fleet request created successfully!";
    case "update":
      return "Fleet request updated successfully!";
    case "send-for-approval":
      return "Sent for approval to CM successfully!";
    case "approve":
      return "Fleet Request has been Approved successfully!";
    case "reject":
      return "Fleet Request has been Rejected successfully!";
    case "review":
      return "Fleet Request has been Sent back for review successfully!";
    case "recall":
      return "Fleet Request recalled successfully!";
    default:
      return "Fleet request action completed successfully!";
  }
};

const normalizeFleetRequestItem = (item) => ({
  fleetDescription: item.fleet_description ?? "",
  capacity: item.capacity ?? "",
  cicpa: String(item?.cicpa ?? "").toLowerCase(),
  quantity: item.quantity ?? "",
  requiredFrom: normalizeDateForInput(item.required_from),
  rentalType: item.rentalType ?? item.rental_type ?? "",
  duration: item.duration ?? "",
  purpose: item.purpose ?? "",
  allocationType: item.allocation_type ?? "",
  productionQtyEnvisaged:
    item.productionQtyEnvisaged ?? item.production_qty_envisaged ?? "",
  similarMachinesAvailable: item.qty_similar_machines_available ?? "",
  remarks: item.remarks ?? "",
  utilization: item.utilization ?? 0,
  id: item.id,
  item_no: item.item_no,
  refNo: item.ref_no ?? item.refNo ?? "",
  adnocFitments: String(
    item?.adnoc_fitments ?? item?.adnocFitments ?? "",
  ).toLowerCase(),
  tpi: item?.tpi ?? "",
});

const FleetRequest = () => {
  const queryClient = useQueryClient();
  const userInfo = useUserInfo();
  const fleetAccess = getFleetRequestAccess(userInfo);
  const { newfn, setNewfn } = usenewfn();
  const { isClicked } = useClickFromDashboard();
  const { setStatusFilter } = useStatusFilter();

  const projects = Array.isArray(userInfo?.pr_code)
    ? userInfo.pr_code
    : userInfo?.pr_code
      ? [userInfo.pr_code]
      : [];
  const [project, setProject] = useState(() => projects[0]?.toString() ?? "");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(getToday);
  const [fleetId, setFleetId] = useState("");
  const path = useLocation("");
  const navigate = useNavigate();
  const { id: routeFleetRequestId = "" } = useParams();
  const [selectedFleetRequestId, setSelectedFleetRequestId] =
    useState(routeFleetRequestId);
  const preserveStatusForRouteIdRef = useRef("");
  const draftWriteTimerRef = useRef(null);
  const [fleetItems, setFleetItems] = useState([]);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [modalItems, setModalItems] = useState([createEmptyFleetItem()]);
  const [draftStorageKey, setDraftStorageKey] = useState(null);
  const [itemsAddedMessage, setItemsAddedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fleetRequestStatus, setFleetRequestStatus] = useState("");
  const [actionTaken, setActionTaken] = useState(false);
  const [savedActionTaken, setSavedActionTaken] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasPendingUpdates, setHasPendingUpdates] = useState(false);
  const [pendingRefNoChanges, setPendingRefNoChanges] = useState({});
  const [showRefNoConfirmation, setShowRefNoConfirmation] = useState(false);
  const [isSavingRefNos, setIsSavingRefNos] = useState(false);
  const { errormessage, setErrorMessage, clearErrorMessage } =
    useErrorMessage();
  const { showtoast, setShowToast, resetshowtoast } = useToast();
  const normalizedStatus = fleetRequestStatus.trim().toLowerCase();
  const userRoles = Array.isArray(userInfo?.role)
    ? userInfo.role
    : [userInfo?.role];
  const canSetAllocationType = Boolean(
    fleetAccess.canApprove &&
      normalizedStatus === "pending for hod" &&
      userRoles.some(
        (role) =>
          String(role ?? "")
            .trim()
            .toLowerCase() === "hod",
      ),
  );
  const canEdit = Boolean(
    fleetAccess.canEdit &&
      (newfn ||
        normalizedStatus === "created" ||
        normalizedStatus === "review" ||
        normalizedStatus === "recalled"),
  );
  const hireUser = (
    Array.isArray(userInfo?.role) ? userInfo.role : [userInfo?.role]
  ).some(
    (role) =>
      String(role ?? "")
        .trim()
        .toLowerCase() === "inith",
  );
  const canEditRefNo = Boolean(hireUser);
  const canMarkActionTaken = Boolean(hireUser);
  const canRecall = Boolean(
    selectedFleetRequestId &&
      canRecallFleetRequest({
        fleetRequest: { status: fleetRequestStatus },
        user: userInfo,
      }),
  );
  const draftUserId = userInfo?.email ?? userInfo?.id;
  const hasModalItemValues = modalItems.some((item) =>
    Object.values(item).some((value) => String(value).trim() !== ""),
  );
  const { data: fetchedFleetIds, error: fleetRequestsError } = useQuery({
    queryKey: [
      "fleet-requests",
      "editor",
      userInfo?.id,
      projects.map(String).join(","),
    ],
    queryFn: async () => {
      const response = await GetFleetRequests(
        userInfo,
        projects,
        "fleetrequest",
      );
      return response.data;
    },
    enabled: Boolean(userInfo?.token && !newfn),
  });
  const fleetIds = Array.isArray(fetchedFleetIds) ? fetchedFleetIds : [];

  useEffect(() => {
    if (!newfn || !userInfo?.token) return;
    let ignore = false;

    const fetchFleetIds = async () => {
      try {
        if (!String(project).trim()) return;

        const response = await GetFleetDocId(userInfo, project);
        if (ignore) return;

        const docId = response?.formatted_doc_id;

        if (docId) {
          const parts = docId.split("/");
          const lastIndex = parts.length - 1;
          parts[lastIndex] = String(Number(parts[lastIndex]) + 1).padStart(
            parts[lastIndex].length,
            "0",
          );
          setFleetId(parts.join("/"));
        } else if (response.last_id == 0) {
          setFleetId(`FR/${project}/0001`);
        } else {
          setFleetId("");
        }
      } catch (error) {
        if (ignore) return;
        setFleetId("");
        setErrorMessage(error);
        console.error("Unable to fetch Fleet Request document number", error);
      }
    };

    fetchFleetIds();

    return () => {
      ignore = true;
    };
  }, [newfn, project, userInfo?.token, setErrorMessage]);

  useEffect(() => {
    if (!fleetRequestsError) return;
    setErrorMessage(fleetRequestsError);
    console.error("Unable to fetch Fleet Request IDs", fleetRequestsError);
  }, [fleetRequestsError, setErrorMessage]);

  useEffect(() => {
    setSelectedFleetRequestId(routeFleetRequestId);

    if (preserveStatusForRouteIdRef.current === routeFleetRequestId) {
      preserveStatusForRouteIdRef.current = "";
      return;
    }
    setFleetRequestStatus("");
    setActionTaken(false);
    setSavedActionTaken(false);
  }, [routeFleetRequestId]);

  useEffect(() => {
    if (!newfn || !draftStorageKey) return;

    draftWriteTimerRef.current = setTimeout(() => {
      writeFleetDraft(draftStorageKey, {
        project,
        location,
        date,
        fleetId,
        fleetItems,
        modalItems,
        editingItemIndex,
      });
    }, 400);

    return () => {
      clearTimeout(draftWriteTimerRef.current);
      draftWriteTimerRef.current = null;
    };
  }, [
    date,
    draftStorageKey,
    editingItemIndex,
    fleetId,
    fleetItems,
    location,
    modalItems,
    newfn,
    project,
  ]);

  useEffect(() => {
    if (newfn || !selectedFleetRequestId || !userInfo?.token) {
      if (!newfn && !selectedFleetRequestId) {
        setFleetId("");
        setFleetItems([]);
      }
      return;
    }

    let ignore = false;
    const fetchFleetRequest = async () => {
      try {
        const response = await GetFleetRequestById(
          userInfo,
          selectedFleetRequestId,
        );
        if (ignore) return;

        const fleetRequest = response ?? {};
        const responseItems = response.items ?? [];
        const normalizedDocument = {
          project: String(fleetRequest.project ?? ""),
          docId: fleetRequest.doc_id ?? "",
          status: fleetRequest.status ?? "",
          location: fleetRequest.location ?? "",
          date: normalizeDateForInput(fleetRequest.created_at),
          items: responseItems.map(normalizeFleetRequestItem),
        };

        setProject(normalizedDocument.project);
        setFleetId(normalizedDocument.docId);
        setFleetRequestStatus(normalizedDocument.status);
        setActionTaken(Number(fleetRequest.action_taken) === 1);
        setSavedActionTaken(Number(fleetRequest.action_taken) === 1);
        setLocation(normalizedDocument.location);
        setDate(normalizedDocument.date);
        setFleetItems(normalizedDocument.items);
        setHasPendingUpdates(false);
      } catch (error) {
        if (ignore) return;

        setFleetItems([]);
        const message =
          error?.response?.data?.message ||
          (typeof error?.response?.data === "string"
            ? error.response.data
            : error?.message) ||
          "Unable to fetch the fleet request.";
        setErrorMessage(message);
        setShowToast();
      }
    };

    fetchFleetRequest();

    return () => {
      ignore = true;
    };
  }, [newfn, selectedFleetRequestId, setErrorMessage, setShowToast, userInfo]);

  const loadProjectDraft = (projectCode) => {
    const storageKey = getFleetDraftKey(draftUserId, projectCode);
    const draft = readFleetDraft(storageKey, projectCode);

    setDraftStorageKey(storageKey);
    setProject(projectCode);
    setLocation(draft?.location ?? "");
    setDate(getToday());
    setFleetId(draft?.fleetId ?? "");
    setFleetItems(draft?.fleetItems ?? []);
    setEditingItemIndex(draft?.editingItemIndex ?? null);
    setModalItems(
      draft?.modalItems?.length
        ? draft.modalItems
        : draft?.fleetItems?.length
          ? draft.fleetItems.map((item) => ({ ...item }))
          : [createEmptyFleetItem()],
    );

    return draft;
  };

  const startNewFleetRequest = ({ replace = false } = {}) => {
    const projectCode = projects[0]?.toString() ?? "";
    setFleetRequestStatus("");
    setActionTaken(false);
    setSavedActionTaken(false);
    setSelectedFleetRequestId("");
    navigate("/fleetrequest", { replace, state: null });
    loadProjectDraft(projectCode);
    setNewfn(true);
  };

  useEffect(() => {
    if (path.state?.createNew !== "fleetrequest") return;

    if (newfn) {
      navigate(path.pathname, { replace: true, state: null });
      return;
    }

    startNewFleetRequest({ replace: true });
  }, [path.state]);

  useEffect(() => {
    if (!newfn || draftStorageKey || !draftUserId) return;

    const projectCode = project;
    if (!projectCode) return;

    loadProjectDraft(projectCode);
  }, [draftStorageKey, draftUserId, newfn, project]);

  const handleNewFleetRequest = () => {
    //for view statements
    if (newfn) {
      writeFleetDraft(draftStorageKey, {
        project,
        location,
        date,
        fleetId,
        fleetItems,
        modalItems,
        editingItemIndex,
      });

      setNewfn(false);
      setIsItemsModalOpen(false);
      setProject(projects[0]?.toString() ?? "");
      setLocation("");
      setDate("");
      setFleetId("");
      setFleetRequestStatus("");
      setActionTaken(false);
      setSavedActionTaken(false);
      setFleetItems([]);
      setModalItems([createEmptyFleetItem()]);
      setEditingItemIndex(null);
      setDraftStorageKey(null);
      setSelectedFleetRequestId("");
      navigate("/fleetrequest");
      return;
    }

    //for new statements
    startNewFleetRequest();
  };

  const handleProjectChange = (projectCode) => {
    if (selectedFleetRequestId) setHasPendingUpdates(true);
    setValidationErrors((current) => ({ ...current, project: "" }));

    if (draftStorageKey) {
      writeFleetDraft(draftStorageKey, {
        project,
        location,
        date,
        fleetId,
        fleetItems,
        modalItems,
        editingItemIndex,
      });
    }

    if (!String(projectCode).trim()) {
      setProject("");
      setFleetId("");
      setDraftStorageKey(null);
      return;
    }

    loadProjectDraft(projectCode);
  };

  const handleSaveItems = (items) => {
    const itemsWithoutAllocationChanges = items.map((item) => ({
      ...item,
      allocationType:
        fleetItems[editingItemIndex ?? 0]?.allocationType ??
        item.allocationType ??
        "",
    }));
    const wasEditingSingleItem = editingItemIndex !== null;
    if (editingItemIndex === null) {
      setFleetItems(itemsWithoutAllocationChanges);
    } else {
      setFleetItems((currentItems) => [
        ...currentItems.slice(0, editingItemIndex),
        ...itemsWithoutAllocationChanges,
        ...currentItems.slice(editingItemIndex + 1),
      ]);
    }

    setEditingItemIndex(null);
    if (selectedFleetRequestId) setHasPendingUpdates(true);
    setModalItems([]);
    setIsItemsModalOpen(false);
    setValidationErrors((current) => ({ ...current, items: "" }));
    setItemsAddedMessage(
      wasEditingSingleItem
        ? "Equipment item updated."
        : `${items.length} ${items.length === 1 ? "item" : "items"} saved to the FR table.`,
    );
    setTimeout(() => setItemsAddedMessage(""), 2000);
  };

  const handleRefNoChange = (itemIndex, refNo) => {
    const item = fleetItems[itemIndex];

    if (!item) return;
    const itemKey = String(item.id ?? itemIndex);
    setPendingRefNoChanges((current) => {
      const original = current[itemKey]?.original ?? String(item.refNo ?? "");
      if (refNo === original) {
        const next = { ...current };
        delete next[itemKey];
        return next;
      }
      return { ...current, [itemKey]: { original, value: refNo } };
    });
    setFleetItems((currentItems) =>
      currentItems.map((item, index) =>
        index === itemIndex ? { ...item, refNo } : item,
      ),
    );
  };

  const changedRefNoItems = Object.entries(pendingRefNoChanges)
    .map(([key, change]) => {
      const index = fleetItems.findIndex(
        (item, itemIndex) =>
          String(item.id ?? item.item_no ?? itemIndex) === key,
      );
      return index < 0 ? null : { item: fleetItems[index], index, ...change };
    })
    .filter(Boolean);
  const actionTakenChanged =
    canMarkActionTaken && actionTaken !== savedActionTaken;

  const saveRefNoChanges = async () => {
    if (
      !selectedFleetRequestId ||
      (!changedRefNoItems.length && !actionTakenChanged)
    ) {
      return;
    }
    setIsSavingRefNos(true);
    clearErrorMessage();
    setSaveSucceeded(false);
    resetshowtoast();
    try {
      for (const { item, value } of changedRefNoItems) {
        await UpdateFleetRequestWorkflow({
          id: selectedFleetRequestId,
          action: "update-ref-no",
          itemId: item.id,
          refNo: value,
          userInfo,
        });
      }
      if (actionTakenChanged) {
        const savedRequest = await UpdateFleetRequestWorkflow({
          id: selectedFleetRequestId,
          action: "update-action-taken",
          action_taken: actionTaken ? 1 : 0,
          userInfo,
        });
        const savedValue = Number(savedRequest?.action_taken) === 1;
        setActionTaken(savedValue);
        setSavedActionTaken(savedValue);
        await queryClient.invalidateQueries({ queryKey: ["fleet-requests"] });
      }
      setPendingRefNoChanges({});
      setShowRefNoConfirmation(false);
      setShowToast(true);
      setSaveSucceeded(true);
      setSuccessMessage(
        changedRefNoItems.length && actionTakenChanged
          ? "EM Ref No. and Action Taken saved successfully!"
          : actionTakenChanged
            ? "Action Taken status saved successfully!"
            : "EM Ref No. saved successfully!",
      );
      setTimeout(resetshowtoast, 2500);
    } catch (error) {
      setSaveSucceeded(false);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Unable to save Fleet Request changes.",
      );
      setShowToast(true);
    } finally {
      setIsSavingRefNos(false);
    }
  };

  const handleEditItems = () => {
    const headerErrors = {};
    if (!String(project).trim()) headerErrors.project = "Project is required.";
    if (!String(location).trim())
      headerErrors.location = "Location is required.";
    if (!String(date).trim()) headerErrors.date = "Date is required.";

    if (Object.keys(headerErrors).length > 0) {
      setValidationErrors((current) => ({ ...current, ...headerErrors }));
      return;
    }

    setEditingItemIndex(null);
    setModalItems(
      fleetItems.length
        ? fleetItems.map((item) => ({ ...item }))
        : modalItems.length
          ? modalItems
          : [createEmptyFleetItem()],
    );
    setIsItemsModalOpen(true);
  };

  const handleEditItem = (index) => {
    setEditingItemIndex(index);
    setModalItems([{ ...fleetItems[index] }]);
    setIsItemsModalOpen(true);
  };

  const handleRemoveItem = (index) => {
    if (fleetItems.length <= 1) return;
    setFleetItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
    if (selectedFleetRequestId) setHasPendingUpdates(true);
  };

  const handleDiscardDraft = () => {
    if (!newfn) {
      setModalItems(fleetItems.map((item) => ({ ...item })));
      setEditingItemIndex(null);
      setIsItemsModalOpen(false);
      return;
    }

    removeFleetDraft(draftStorageKey);
    setProject(projects[0]?.toString() ?? "");
    setLocation("");
    setDate(getToday());
    setFleetId("");
    setFleetRequestStatus("");
    setActionTaken(false);
    setSavedActionTaken(false);
    setFleetItems([]);
    setModalItems([createEmptyFleetItem()]);
    setEditingItemIndex(null);
    setDraftStorageKey(null);
    setIsItemsModalOpen(false);
    setNewfn(false);
  };

  const submitFleetRequestAction = async (buttonAction, comments = "") => {
    clearErrorMessage();
    resetshowtoast();
    setSaveSucceeded(false);
    setSuccessMessage("");

    if (buttonAction.action === "create") {
      const errors = {};
      if (!String(project).trim()) errors.project = "Project is required.";
      if (!String(location).trim()) errors.location = "Location is required.";
      if (!fleetItems.length) {
        errors.items = "Add at least one equipment item.";
      }

      setValidationErrors(errors);
      if (Object.keys(errors).length) {
        setConfirmationAction(null);
        setErrorMessage(Object.values(errors)[0]);
        setShowToast();
        setTimeout(() => {
          resetshowtoast();
          clearErrorMessage();
        }, 3000);
        return;
      }
    }

    setIsSaving(true);

    try {
      const response =
        buttonAction.action === "create"
          ? await AddNewFleetRequests({
              project,
              date,
              location,
              items: fleetItems,
              comments,
              userInfo,
            })
          : await UpdateFleetRequestWorkflow({
              id: selectedFleetRequestId,
              status: buttonAction.nextStatus,
              action: buttonAction.action,
              comments,
              ...(["update", "send-for-approval"].includes(
                buttonAction.action,
              ) && {
                project,
                date,
                location,
                items: fleetItems,
              }),
              ...(buttonAction.action === "approve" &&
                canSetAllocationType && {
                  items: fleetItems.map((item) => ({
                    id: item.id,
                    item_no: item.item_no,
                    allocation_type: item.allocationType ?? "",
                  })),
                }),
              userInfo,
            });

      const savedRequest = response;
      if (Array.isArray(savedRequest?.items)) {
        setFleetItems(savedRequest.items.map(normalizeFleetRequestItem));
      }
      const savedStatus = savedRequest?.status ?? buttonAction.nextStatus;
      const savedId = String(savedRequest?.id ?? selectedFleetRequestId ?? "");

      const shouldSendWorkflowEmail = [
        "send-for-approval",
        "approve",
        "reject",
        "review",
      ].includes(buttonAction.action);

      const requiredApprovedPDF = shouldSendInithIntimation({
        role: userInfo.role?.[0],
        status: savedStatus,
      });

      if (buttonAction.action === "create") {
        clearTimeout(draftWriteTimerRef.current);
        draftWriteTimerRef.current = null;
        removeFleetDraft(draftStorageKey);
        setDraftStorageKey(null);
        setModalItems([createEmptyFleetItem()]);
        setEditingItemIndex(null);
        setNewfn(false);
        setSelectedFleetRequestId(savedId);
        if (savedRequest?.doc_id) setFleetId(savedRequest.doc_id);
        if (savedId) {
          preserveStatusForRouteIdRef.current = savedId;
          navigate(`/fleetrequest/${savedId}`, { replace: true });
        }
      }

      setFleetRequestStatus(savedStatus);
      setActionTaken(Number(savedRequest?.action_taken) === 1);
      setSavedActionTaken(Number(savedRequest?.action_taken) === 1);
      if (["update", "recall"].includes(buttonAction.action)) {
        setHasPendingUpdates(false);
      }
      setConfirmationAction(null);
      setIsApprovalModalOpen(false);
      setSuccessMessage(getFleetRequestSuccessMessage(buttonAction.action));
      setSaveSucceeded(true);
      setShowToast();
      setIsSaving(false);

      if (buttonAction.action === "approve") {
        setStatusFilter("Pending");
        setTimeout(() => {
          navigate(isClicked ? "/pendingdashboard" : "/dashboardfr", {
            replace: true,
          });
        }, 1500);
      }

      if (shouldSendWorkflowEmail) {
        let exportedStatementAttachment;
        if (
          savedStatus.trim().toLowerCase() === "approved" ||
          requiredApprovedPDF
        ) {
          try {
            exportedStatementAttachment = await generateFRApprovedPDF(
              savedId,
              userInfo,
              requiredApprovedPDF,
            );
          } catch (pdfError) {
            console.error(
              "Fleet Request approved PDF attachment preparation failed",
              pdfError,
            );
          }
        }

        try {
          await FREmailAlert(savedId, userInfo, "plant", {
            ...savedRequest,
            id: Number(savedId),
            doc_id: savedRequest?.doc_id ?? fleetId,
            created_date: savedRequest?.created_at ?? date,
            location: savedRequest?.location ?? location,
            status: savedStatus,
            ...(exportedStatementAttachment && {
              exportedStatementAttachment,
            }),
          });
        } catch (emailError) {
          console.error("Fleet Request workflow email failed", emailError);
        }
      }
    } catch (error) {
      setIsSaving(false);
      const responseMessage = error?.response?.data?.error;
      const message =
        responseMessage ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : error?.message) ||
        `Unable to ${buttonAction.label.toLowerCase()}.`;

      setErrorMessage(message);
      setShowToast();
    } finally {
      setTimeout(() => {
        resetshowtoast();
        clearErrorMessage();
        setSaveSucceeded(false);
        setSuccessMessage("");
      }, 3000);
    }
  };

  const handleFleetRequestButton = (buttonAction) => {
    if (buttonAction.action === "approve") {
      setIsApprovalModalOpen(true);
      return;
    }

    setConfirmationAction(buttonAction);
  };

  const submitApprovalAction = (approvalAction, comments) => {
    submitFleetRequestAction(approvalAction, comments);
  };

  const columnHelper = createColumnHelper();
  const compactColumnIds = new Set([
    "capacity",
    "quantity",
    "productionQtyEnvisaged",
    "adnocFitments",
    "tpi",
    "cicpa",
    "duration",
    "rentalType",
    "utilization",
    "requiredFrom",
  ]);
  const preservedWidthColumnIds = new Set(["fleetDescription", "remarks"]);

  const columns = [
    columnHelper.display({
      id: "serialNumber",
      header: "#",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("fleetDescription", {
      header: "Fleet Desc.",
    }),
    columnHelper.accessor("capacity", { header: "Capacity" }),
    columnHelper.accessor("quantity", { header: "Qty" }),
    columnHelper.accessor("duration", {
      header: "Duration",
      cell: (info) => (
        <div className="w-full text-center">{info.getValue() || "—"}</div>
      ),
    }),
    columnHelper.accessor("rentalType", {
      header: () => (
        <span className="leading-tight">
          Rental <br />
          Type
        </span>
      ),
    }),
    columnHelper.accessor("purpose", { header: "Purpose" }),
    columnHelper.accessor("allocationType", {
      header: () => (
        <span className="leading-tight">
          Allocation
          <br />
          Type
        </span>
      ),
      cell: ({ row, getValue }) =>
        canSetAllocationType ? (
          <select
            value={getValue() || ""}
            onChange={(event) => {
              const allocationType = event.target.value;
              setFleetItems((currentItems) =>
                currentItems.map((item, index) =>
                  index === row.index ? { ...item, allocationType } : item,
                ),
              );
            }}
            disabled={isSaving}
            aria-label={`Allocation Type for item ${row.index + 1}`}
            className="h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          >
            <option value="">Select</option>
            <option value="Owned">Own</option>
            <option value="Rented">Hire</option>
            <option value="new-purchase">New Purchase</option>
            <option value="new-purchase-project-cost">
              New Purchase- Project Cost
            </option>{" "}
            <option value="reject-exclude">Reject/Exclude</option>
            <option value="rental-short-term">Rental Short term</option>
            <option value="hold">Hold</option>
          </select>
        ) : (
          formatwords(getValue()) || "—"
        ),
    }),
    columnHelper.accessor("requiredFrom", {
      header: () => (
        <span className="leading-tight">
          Req.
          <br /> From
        </span>
      ),
      cell: (info) => formatDateDMY(info.getValue()) || "—",
    }),
    columnHelper.accessor("productionQtyEnvisaged", {
      header: () => (
        <span className="leading-tight">
          Production
          <br />
          Qty Envisaged
        </span>
      ),
      cell: (info) => info.getValue() || "—",
    }),
    columnHelper.accessor("similarMachinesAvailable", {
      header: () => (
        <span className="leading-tight w-64! ">
          Similar Machines
          <br />
          at Site
        </span>
      ),
    }),
    columnHelper.accessor("utilization", {
      header: () => (
        <span className="leading-tight">
          Util. <br />
          (%)
        </span>
      ),
    }),
    columnHelper.accessor("cicpa", {
      header: () => (
        <span className="leading-tight">
          CICPA <br />
          (Y/N)
        </span>
      ),
      cell: (info) => formatwords(info.getValue()) || "—",
    }),
    columnHelper.accessor("adnocFitments", {
      header: () => (
        <span className="leading-tight">
          Adnoc <br />
          Fitments
        </span>
      ),
      cell: (info) => formatwords(info.getValue()) || "—",
    }),
    columnHelper.accessor("tpi", {
      header: "TPI",
      cell: (info) => (
        <div className="w-12 truncate">{info.getValue() || "—"}</div>
      ),
    }),
    columnHelper.accessor("remarks", {
      header: () => "Remarks",
      cell: (info) => (
        <div className="max-h-20  overflow-y-auto whitespace-normal break-words">
          {info.getValue() || "—"}
        </div>
      ),
    }),
    columnHelper.accessor("refNo", {
      header: "EM Ref No.",
      cell: FleetRefNoCell,
    }),
    ...(canEdit
      ? [
          columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEditItem(row.index)}
                  className="flex size-8 cursor-pointer items-center justify-center rounded text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                  aria-label={`Edit item ${row.index + 1}`}
                  title="Edit item"
                >
                  <LuPencil size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(row.index)}
                  disabled={fleetItems.length <= 1}
                  className="flex size-8 cursor-pointer items-center justify-center rounded text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={`Delete item ${row.index + 1}`}
                  title={
                    fleetItems.length <= 1
                      ? "At least one equipment item is required"
                      : "Delete item"
                  }
                >
                  <LuTrash2 size={17} />
                </button>
              </div>
            ),
          }),
        ]
      : []),
  ];

  const table = useTable({
    data: fleetItems,
    columns,
    features: tableFeatures,
    meta: {
      requestId: selectedFleetRequestId,
      userInfo,
      canEdit: Boolean(canEditRefNo && selectedFleetRequestId && !newfn),
      onValueChange: handleRefNoChange,
    },
  });

  const readOnlyValueClass =
    "min-w-0 whitespace-normal font-medium text-slate-800";
  const fieldClass = `relative flex min-w-0 text-slate-600 ${
    canEdit ? "flex-col gap-1" : "items-center gap-2"
  }`;

  return (
    <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md">
      <header className="shrink-0 border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 px-4 py-5 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-[minmax(10rem,1fr)_auto_minmax(10rem,1fr)] sm:items-start">
          <div className="flex flex-wrap items-center gap-3 sm:justify-self-start">
            {fleetAccess.canEdit && (
              <button
                type="button"
                onClick={handleNewFleetRequest}
                className="flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                {!newfn && <RiAddBoxFill />}
                {newfn ? "View Fleet Requests" : "New Fleet Request"}
              </button>
            )}

            {(!fleetAccess.canEdit || !newfn) && (
              <select
                value={selectedFleetRequestId}
                onChange={(event) => {
                  const id = event.target.value;
                  setFleetRequestStatus("");
                  setSelectedFleetRequestId(id);
                  navigate(id ? `/fleetrequest/${id}` : "/fleetrequest");
                }}
                className="h-9 w-52 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                aria-label="Select Fleet Request"
              >
                <option value="">Select Fleet Request</option>
                {fleetIds.map((fleetRequest) => {
                  const id = String(fleetRequest.id);
                  return (
                    <option key={id} value={id}>
                      {fleetRequest.doc_id}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl ">
              Galfar Engineering &amp; Contracting WLL Emirates
            </h1>
            <h2 className="mt-1 text-base font-semibold text-blue-700 sm:text-lg">
              Fleet Request
            </h2>
          </div>

          <div className="flex justify-end sm:justify-self-end">
            {canRecall && (
              <button
                type="button"
                onClick={() =>
                  setConfirmationAction({
                    action: "recall",
                    label: "Recall",
                    nextStatus: "recalled",
                  })
                }
                disabled={isSaving}
                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LuUndo2 size={17} aria-hidden="true" />
                Recall
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-3 gap-y-6 rounded-b-xl border border-slate-200 bg-white/80 p-4 text-sm shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(9rem,0.7fr)_minmax(9rem,0.7fr)] sm:items-end sm:gap-5 sm:p-5">
          <label className={fieldClass}>
            <span className="font-medium">Project :</span>
            {canEdit ? (
              <select
                value={project}
                onChange={(event) => handleProjectChange(event.target.value)}
                disabled={!newfn}
                className={`h-9 w-full rounded border bg-white px-2.5 text-slate-800 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
                  validationErrors.project
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
                aria-invalid={Boolean(validationErrors.project)}
              >
                <option value="">Select Project</option>
                {projects.map((projectOption) => (
                  <option key={projectOption} value={projectOption}>
                    {projectOption}
                  </option>
                ))}
              </select>
            ) : (
              <output className={readOnlyValueClass}>{project || "—"}</output>
            )}
            {canEdit && validationErrors.project && (
              <span className="absolute left-0 top-full mt-1 text-xs font-medium text-red-600">
                {validationErrors.project}
              </span>
            )}
          </label>

          <div className={fieldClass}>
            <span className="font-medium">Doc No.</span>
            {canEdit ? (
              <>
                {" "}
                <output className="flex h-9 items-center rounded border border-slate-200 bg-slate-50 px-2.5 text-slate-800">
                  {fleetId}
                </output>
              </>
            ) : (
              <>
                {" "}
                <output className={readOnlyValueClass}>{fleetId || "—"}</output>
              </>
            )}
          </div>
          <label className={fieldClass}>
            <span className="font-medium shrink-0 whitespace-nowrap">
              Location :
            </span>
            {canEdit ? (
              <input
                type="text"
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  if (selectedFleetRequestId) setHasPendingUpdates(true);
                  setValidationErrors((current) => ({
                    ...current,
                    location: "",
                  }));
                }}
                className={`h-9 w-full rounded border bg-white px-2.5 text-slate-800 outline-none transition focus:ring-2 ${
                  validationErrors.location
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
                aria-invalid={Boolean(validationErrors.location)}
                aria-describedby={
                  validationErrors.location
                    ? "fleet-request-location-error"
                    : undefined
                }
                placeholder="Enter location"
              />
            ) : (
              <output className={readOnlyValueClass}>{location || "—"}</output>
            )}
            {canEdit && validationErrors.location && (
              <span
                id="fleet-request-location-error"
                className="absolute left-0 top-full text-xs font-medium text-red-600"
              >
                {validationErrors.location}
              </span>
            )}
          </label>

          <label className={fieldClass}>
            <span className="font-medium">Date :</span>
            <div className="flex min-w-0 items-center flex-1">
              {canEdit ? (
                <input
                  type="date"
                  value={date}
                  disabled
                  className="h-9 min-w-0 flex-1 cursor-not-allowed rounded border border-slate-200 bg-slate-100 px-2.5 text-slate-700 disabled:opacity-100"
                  aria-label="Fleet request date"
                />
              ) : (
                <output className={`${readOnlyValueClass} flex-1`}>
                  {formatDateDDMMYYYY(date) || "—"}
                </output>
              )}
              {fleetItems.length > 0 &&
                selectedFleetRequestId &&
                (canEditRefNo || canMarkActionTaken) && (
                  <button
                    type="button"
                    onClick={() => setShowRefNoConfirmation(true)}
                    disabled={
                      (!changedRefNoItems.length && !actionTakenChanged) ||
                      isSavingRefNos
                    }
                    aria-label="Save Fleet Request changes"
                    title={
                      changedRefNoItems.length || actionTakenChanged
                        ? "Save Fleet Request changes"
                        : "No Fleet Request changes to save"
                    }
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md border border-green-700 bg-green-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:border-slate-400 disabled:shadow-none disabled:bg-gray-400"
                  >
                    <IoIosSave size={17} aria-hidden="true" />
                    <span>Save</span>
                  </button>
                )}
            </div>
            {canEdit && validationErrors.date && (
              <span className="absolute left-0 top-full mt-1 text-xs font-medium text-red-600">
                {validationErrors.date}
              </span>
            )}
          </label>
        </div>
      </header>
      <div className="min-h-0 flex-1 bg-slate-50/70 px-3 py-4 sm:px-5 sm:py-5">
        {canEdit && !isItemsModalOpen && (
          <button
            type="button"
            onClick={handleEditItems}
            className="mb-4 flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            {fleetItems.length > 0 && <LuPencil size={16} />}
            {fleetItems.length > 0
              ? "Add / Edit Equipment Items"
              : hasModalItemValues
                ? "Continue Equipment Draft"
                : "Add Equipment"}
          </button>
        )}
        {fleetItems.length > 0 && (
          <div className="overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full table-fixed divide-y divide-slate-200 text-sm text-center">
              <thead className="border-b-2 border-slate-200 bg-slate-100/90 ">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`${
                          header.column.id === "serialNumber"
                            ? "w-7 min-w-7 max-w-7 whitespace-nowrap"
                            : header.column.id === "fleetDescription"
                              ? "w-32 min-w-32 max-w-32 whitespace-nowrap"
                              : header.column.id === "actions"
                                ? "w-20 min-w-20 max-w-20 text-center"
                                : header.column.id === "purpose"
                                  ? "w-24 min-w-24 max-w-24 whitespace-normal"
                                  : header.column.id === "remarks"
                                    ? "w-36 min-w-36 max-w-48 whitespace-normal"
                                    : header.column.id === "refNo"
                                      ? "w-36 min-w-36 max-w-28 whitespace-nowrap"
                                      : header.column.id === "allocationType"
                                        ? "w-18 min-w-18 max-w-20 whitespace-nowrap"
                                        : compactColumnIds.has(header.column.id)
                                          ? header.column.id === "rentalType"
                                            ? "w-14 whitespace-normal"
                                            : header.column.id === "utilization"
                                              ? "w-12 whitespace-nowrap"
                                              : header.column.id === "capacity"
                                                ? "w-18 whitespace-nowrap"
                                                : header.column.id ===
                                                    "productionQtyEnvisaged"
                                                  ? "w-24 whitespace-normal"
                                                  : header.column.id ===
                                                      "adnocFitments"
                                                    ? "w-18 whitespace-normal"
                                                    : header.column.id ===
                                                          "cicpa" ||
                                                        header.column.id ===
                                                          "requiredFrom"
                                                      ? "w-16 whitespace-nowrap"
                                                      : header.column.id ===
                                                            "quantity" ||
                                                          header.column.id ===
                                                            "tpi" ||
                                                          header.column.id ===
                                                            "utilization"
                                                        ? "w-12 whitespace-nowrap"
                                                        : "w-20 whitespace-nowrap"
                                          : header.column.id ===
                                                "productionQtyEnvisaged" ||
                                              header.column.id ===
                                                "similarMachinesAvailable"
                                            ? "w-24 max-w-32 whitespace-normal"
                                            : "whitespace-nowrap"
                        } border-r border-slate-200 py-1 text-md font-bold upperse tracking-wide text-slate-700 last:border-r-0 ${
                          preservedWidthColumnIds.has(header.column.id)
                            ? "px-1"
                            : header.column.id === "serialNumber"
                              ? "px-0.5"
                              : compactColumnIds.has(header.column.id) ||
                                  header.column.id === "refNo"
                                ? "px-1"
                                : "px-2"
                        }`}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors odd:bg-white even:bg-slate-50/50 hover:bg-blue-50/60"
                  >
                    {(row.getVisibleCells?.() ?? row.getAllCells()).map(
                      (cell) => (
                        <td
                          key={cell.id}
                          className={`${
                            cell.column.id === "serialNumber"
                              ? "w-7 min-w-7 max-w-7 whitespace-nowrap"
                              : cell.column.id === "actions"
                                ? "w-20 min-w-20 max-w-20 text-center"
                                : cell.column.id === "purpose"
                                  ? "w-24 min-w-24 max-w-24 whitespace-normal text-left"
                                  : cell.column.id === "refNo"
                                    ? "w-28 min-w-28 max-w-28 overflow-hidden"
                                    : cell.column.id === "rentalType"
                                      ? "w-12 max-w-12 whitespace-normal"
                                      : cell.column.id === "utilization"
                                        ? "w-12 max-w-12 whitespace-nowrap"
                                        : cell.column.id === "capacity" ||
                                            cell.column.id === "requiredFrom"
                                          ? "w-20 max-w-20"
                                          : cell.column.id === "quantity" ||
                                              cell.column.id === "tpi"
                                            ? "w-12 max-w-12 whitespace-nowrap"
                                            : cell.column.id === "adnocFitments"
                                              ? "w-16 max-w-16 whitespace-nowrap"
                                              : cell.column.id ===
                                                  "productionQtyEnvisaged"
                                                ? "w-24 max-w-24 whitespace-normal"
                                                : cell.column.id === "cicpa"
                                                  ? "w-16 whitespace-nowrap"
                                                  : cell.column.id ===
                                                      "capacity"
                                                    ? "w-20 max-w-24 whitespace-normal"
                                                    : cell.column.id ===
                                                        "duration"
                                                      ? "w-20 whitespace-nowrap"
                                                      : cell.column.id ===
                                                          "remarks"
                                                        ? "w-36 max-w-36 text-left"
                                                        : cell.column.id ===
                                                              "productionQtyEnvisaged" ||
                                                            cell.column.id ===
                                                              "similarMachinesAvailable"
                                                          ? "w-32 max-w-24 whitespace-normal"
                                                          : cell.column.id ===
                                                              "actions"
                                                            ? "w-14 text-center"
                                                            : "max-w-24"
                          } py-3 text-center text-slate-700 ${
                            preservedWidthColumnIds.has(cell.column.id)
                              ? "px-3"
                              : cell.column.id === "serialNumber"
                                ? "px-0.5"
                                : compactColumnIds.has(cell.column.id)
                                  ? "px-0"
                                  : "px-1"
                          }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {canEdit && validationErrors.items && (
          <p className="mt-3 text-sm font-medium text-red-600" role="alert">
            {validationErrors.items}
          </p>
        )}
        {fleetItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs font-medium text-slate-500">
              Allocation Type is assigned by the HOD for each item.
            </div>{" "}
            <div className="flex gap-5">
              {canEdit && selectedFleetRequestId && hasPendingUpdates && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    setConfirmationAction({
                      action: "update",
                      label: "Update Fleet Request",
                      nextStatus: fleetRequestStatus,
                    })
                  }
                  className="cursor-pointer rounded border border-blue-600 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Update Fleet Request
                </button>
              )}
              {canMarkActionTaken && selectedFleetRequestId && (
                <div className="inline-flex  items-center ">
                  <label className="inline-flex  items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={actionTaken}
                      disabled={isSaving || isSavingRefNos}
                      onChange={(event) => setActionTaken(event.target.checked)}
                      className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Action Taken
                  </label>
                </div>
              )}
              <ButtonTxtFR
                fleetRequest={{ project, status: fleetRequestStatus }}
                userInfo={userInfo}
                isNew={newfn}
                isLoading={isSaving}
                onAction={handleFleetRequestButton}
              />
            </div>
          </div>
        )}
      </div>
      {isItemsModalOpen && (
        <FleetItemsModal
          isOpen
          items={modalItems}
          // maxItems={editingItemIndex === null ? 10 : 10 - fleetItems.length + 1}
          onItemsChange={setModalItems}
          onClose={() => setIsItemsModalOpen(false)}
          onDiscard={handleDiscardDraft}
          onSave={handleSaveItems}
          isEditing={fleetItems.length > 0}
        />
      )}
      {confirmationAction && (
        <FleetRequestConfirmationModal
          title={
            confirmationAction.action === "create"
              ? "Create Fleet Request?"
              : confirmationAction.action === "update"
                ? "Update Fleet Request?"
                : confirmationAction.action === "recall"
                  ? "Recall Fleet Request?"
                  : "Send Fleet Request for approval?"
          }
          message={
            confirmationAction.action === "create"
              ? "Confirm  Fleet Request details and equipment items are correct before creating it."
              : confirmationAction.action === "update"
                ? "Save the updated Fleet Request details and equipment items?"
                : confirmationAction.action === "recall"
                  ? "This request will be withdrawn from the current approval step and returned to editable mode. You can update it and send it for approval again."
                  : "This request will be sent to the next approver in the workflow."
          }
          confirmLabel={confirmationAction.label}
          isLoading={isSaving}
          variant={
            confirmationAction.action === "recall" ? "warning" : "primary"
          }
          allowComments={
            confirmationAction.action === "send-for-approval" ||
            normalizedStatus === "review"
          }
          onCancel={() => setConfirmationAction(null)}
          onConfirm={(comments) =>
            submitFleetRequestAction(confirmationAction, comments)
          }
        />
      )}
      {showRefNoConfirmation && (
        <FleetRequestConfirmationModal
          title="Save Fleet Request changes?"
          message={[
            ...changedRefNoItems.map(
              ({ item, value }, index) =>
                `${index + 1}. EM Ref No. ${value || "(blank)"} for record ${item.fleetDescription ?? ""} of quantity${item.quantity ? ` (${item.quantity}).` : ""}`,
            ),
            ...(actionTakenChanged
              ? [`Action Taken will be ${actionTaken ? "marked" : "cleared"}.`]
              : []),
          ].join("\n")}
          confirmLabel="Yes"
          cancelLabel="No"
          isLoading={isSavingRefNos}
          onCancel={() => setShowRefNoConfirmation(false)}
          onConfirm={saveRefNoChanges}
        />
      )}
      {isApprovalModalOpen && (
        <ApprovalModalFR
          fleetRequest={{ project, status: fleetRequestStatus }}
          userInfo={userInfo}
          isLoading={isSaving}
          onClose={() => setIsApprovalModalOpen(false)}
          onSubmit={submitApprovalAction}
        />
      )}
      {itemsAddedMessage && (
        <div
          className="animate-slide-in fixed left-1/2 top-5 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-green-600 bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          <LuCircleCheck size={18} aria-hidden="true" />
          {itemsAddedMessage}
        </div>
      )}
      {showtoast && saveSucceeded && !errormessage && (
        <div
          className="animate-slide-in fixed left-1/2 top-5 z-[1100] flex -translate-x-1/2 items-center gap-2 rounded bg-green-500 px-6 py-3 text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          <LuCircleCheck size={18} aria-hidden="true" />
          {successMessage}
        </div>
      )}
      {showtoast && !errormessage && (
        <div
          className="animate-slide-in fixed left-1/2 top-5 z-[1100] flex -translate-x-1/2 items-center gap-2 rounded bg-green-500 px-6 py-3 text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          <LuCircleCheck size={18} aria-hidden="true" />
          {successMessage}
        </div>
      )}
      {showtoast && errormessage && (
        <div
          className="animate-slide-in fixed left-1/2 top-5 z-[1100] flex -translate-x-1/2 items-center gap-2 rounded bg-red-500 px-6 py-3 text-white shadow-lg"
          role="alert"
          aria-live="assertive"
        >
          <MdOutlineError size={20} aria-hidden="true" />
          {errormessage}
        </div>
      )}
    </div>
  );
};

export default FleetRequest;
