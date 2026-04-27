import axiosInstance from './axiosInstance';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_URL = `${BASE_URL}/bookings`;

export const createBookingApi = async (bookingData) => {
  // bookingData: { roomId, checkIn, checkOut, numGuests, specialRequest }
  const response = await axiosInstance.post(API_URL, bookingData);
  return response.data;
};

export const getMyBookingsApi = async () => {
  const response = await axiosInstance.get(`${API_URL}/my`);
  return response.data;
};

export const cancelBookingApi = async (bookingId) => {
  const response = await axiosInstance.put(`${API_URL}/${bookingId}/cancel`);
  return response.data;
};
