const normalizeRoles = (roles = []) =>
  (Array.isArray(roles) ? roles : [roles])
    .filter(Boolean)
    .map((role) => String(role).trim().toLowerCase());

export const getInitiatorCapabilities = (roles = []) => {
  const roleSet = new Set(normalizeRoles(roles));
  const hasInitFN = roleSet.has("initfn");
  const demob = roleSet.has("initpr");
  const hwa = roleSet.has("initdc");
  const fleetRequest = roleSet.has("initfr");
  const hasSpecialFNAccess = demob || hwa;

  return {
    generalFNIOC: hasInitFN && !hasSpecialFNAccess,
    demob,
    hwa,
    fleetRequest,
    canAccessFNIOC: hasInitFN || hasSpecialFNAccess,
    canAccessFleetRequest: fleetRequest,
  };
};

export const getInitiatorCreationOptions = (roles = []) => {
  const capabilities = getInitiatorCapabilities(roles);
  const options = [];

  if (capabilities.demob) {
    options.push({
      key: "demob",
      label: "Demobilization",
      path: "/filenote",
      intent: "filenote",
      type: "ioc",
      category: "Demob",
    });
  }
  if (capabilities.hwa) {
    options.push({
      key: "hwa",
      label: "HWA",
      path: "/filenote",
      intent: "filenote",
      type: "ioc",
      category: "FWA",
    });
  }
  if (capabilities.fleetRequest) {
    options.push({
      key: "fleet-request",
      label: "Fleet Request",
      path: "/fleetrequest",
      intent: "fleetrequest",
    });
  }
  if (capabilities.generalFNIOC) {
    options.push({
      key: "filenote",
      label: "File Note / IOC",
      path: "/filenote",
      intent: "filenote",
    });
  }

  return options;
};
