exports.currency = (
  value,
  currentFormat = {
    style: "vi-VI",
    unit: "VND",
  }
) => {
  if (!value) {
    return "0đ";
  }

  // format theo props currentFormat
  return (
    new Intl.NumberFormat(currentFormat.style).format(
      Math.round(Number(value))
    ) + "đ"
  );
};
