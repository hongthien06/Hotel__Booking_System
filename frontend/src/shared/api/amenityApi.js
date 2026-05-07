import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

/**
 * Lấy danh sách tất cả tiện ích (Amenities) để hiển thị checkbox trong sidebar filter.
 * @returns {Promise<Array<{amenityId, amenityName, iconClass, description}>>}
 */
export const getAmenitiesApi = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/amenities`);
  return response.data;
};
