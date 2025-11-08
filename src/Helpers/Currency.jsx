const Currency = (denotion) => {
  const symbols = {
    aed: "د.إ",
    usd: "$",
    eur: "€",
    gbp: "£",
  };

  if (!denotion) return "";

  return symbols[denotion.toLowerCase()] || denotion;
};

export default Currency;
