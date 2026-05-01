import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_URL = `${BASE_URL}/bookings`;

export const createBookingApi = async (bookingData) => {
  // bookingData: { roomId, checkIn, checkOut, numAdults, numChildren, specialRequest }
  const response = await axiosInstance.post(API_URL, bookingData);
  return response.data;
};

export const getMyBookingsApi = async (checkIn, checkOut) => {
  const params = {};
  if (checkIn) params.checkIn = checkIn;
  if (checkOut) params.checkOut = checkOut;
  const response = await axiosInstance.get(`${API_URL}/my-bookings`, { params });
  return response.data;
};

export const cancelBookingApi = async (bookingId) => {
  const response = await axiosInstance.put(`${API_URL}/${bookingId}/cancel`);
  return response.data;
};
