import i18n from "../../i18n/i18n";

// Tỷ giá mặc định nếu API lỗi/chưa tải xong
let usdToVndRate = 25400;

// Đọc tỷ giá từ cache nếu có
const cachedRate = localStorage.getItem("usdToVndRate");
if (cachedRate) {
  const parsed = parseFloat(cachedRate);
  if (!isNaN(parsed) && parsed > 0) {
    usdToVndRate = parsed;
  }
}

/**
 * Lấy tỷ giá thực tế từ API công khai và lưu vào cache
 */
export const fetchExchangeRate = async () => {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    if (data && data.rates && data.rates.VND) {
      usdToVndRate = data.rates.VND;
      localStorage.setItem("usdToVndRate", String(usdToVndRate));
      console.log("[i18n] Đã cập nhật tỷ giá thực tế: 1 USD =", usdToVndRate, "VND");
    }
  } catch (error) {
    console.error("[i18n] Lỗi khi lấy tỷ giá thực tế, sử dụng tỷ giá mặc định/cache:", error);
  }
};

// Gọi cập nhật tỷ giá khi import formatters
fetchExchangeRate();

export const getUsdToVndRate = () => usdToVndRate;

/**
 * Định dạng tiền tệ dựa trên ngôn ngữ hiện tại
 * @param {number} amount - Số tiền (luôn được giả định lưu là VND ở DB)
 * @param {string} currency - Loại tiền tệ mong muốn hiển thị (VND, USD...)
 */
export const formatCurrency = (amount, currency = null) => {
  if (amount === null || amount === undefined) return "";
  const lng = i18n.language || "vi";
  
  // Tự động chọn loại tiền hiển thị theo ngôn ngữ: vi -> VND, các ngôn ngữ khác -> USD
  const targetCurrency = currency || (lng === "vi" ? "VND" : "USD");
  
  let finalAmount = amount;
  
  // Quy đổi nếu cần hiển thị USD (DB chỉ lưu VND)
  if (targetCurrency === "USD") {
    finalAmount = amount / usdToVndRate;
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
  if (isNaN(d.getTime())) return String(date);
  
  // Đối với Tiếng Việt, hiển thị định dạng dd/mm/yyyy
  if (lng === "vi") {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return new Intl.DateTimeFormat("en-US", {
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
  if (isNaN(d.getTime())) return String(date);
  
  // Đối với Tiếng Việt, hiển thị định dạng dd/mm/yyyy hh:mm
  if (lng === "vi") {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};
