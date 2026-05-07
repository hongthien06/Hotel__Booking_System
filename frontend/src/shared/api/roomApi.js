import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_URL = `${BASE_URL}/rooms`;

export const getRoomsApi = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

export const getAvailableRoomsApi = async (checkIn, checkOut, province, minPrice, maxPrice, typeNames, bedTypes, amenityNames) => {
  const params = { checkIn, checkOut };
  if (province && province.trim())   params.province  = province.trim();
  if (minPrice  != null)             params.minPrice  = minPrice;
  if (maxPrice  != null)             params.maxPrice  = maxPrice;
  if (typeNames && typeNames.length > 0) params.typeNames = Array.isArray(typeNames) ? typeNames.join(',') : typeNames;
  if (bedTypes && bedTypes.length > 0) params.bedTypes = Array.isArray(bedTypes) ? bedTypes.join(',') : bedTypes;
  if (amenityNames && amenityNames.length > 0) params.amenityNames = Array.isArray(amenityNames) ? amenityNames.join(',') : amenityNames;
  const response = await axiosInstance.get(`${API_URL}/available`, { params });
  return response.data;
};

export const getRoomByIdApi = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};
