import i18n from "../../i18n/i18n";

/**
 * Định dạng tiền tệ dựa trên ngôn ngữ hiện tại
 * @param {number} amount - Số tiền
 * @param {string} currency - Loại tiền tệ (VND, USD...)
 */
export const formatCurrency = (amount, currency = null) => {
  const lng = i18n.language || "vi";
  
  // Nếu không truyền currency, tự động chọn theo ngôn ngữ
  const targetCurrency = currency || (lng === "vi" ? "VND" : "USD");
  
  // Tỷ giá giả định nếu cần chuyển đổi (trong thực tế nên lấy từ API)
  let finalAmount = amount;
  if (lng === "en" && targetCurrency === "USD" && amount > 1000) {
    finalAmount = amount / 25000; // Giả sử 1 USD = 25,000 VND
  }

  return new Intl.NumberFormat(lng === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: targetCurrency,
    minimumFractionDigits: targetCurrency === "VND" ? 0 : 2,
  }).format(finalAmount);
};

/**
 * Định dạng ngày tháng dựa trên ngôn ngữ hiện tại
 * @param {Date|string} date - Ngày tháng
 */
export const formatDate = (date) => {
  if (!date) return "";
  const lng = i18n.language || "vi";
  const d = new Date(date);
  
  return new Intl.DateTimeFormat(lng === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

/**
 * Định dạng ngày giờ dựa trên ngôn ngữ hiện tại
 */
export const formatDateTime = (date) => {
  if (!date) return "";
  const lng = i18n.language || "vi";
  const d = new Date(date);
  
  return new Intl.DateTimeFormat(lng === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};
