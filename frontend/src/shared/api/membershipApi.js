import axiosInstance from './axiosInstance'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const toArray = (data) => {
  if (Array.isArray(data)) return data
  if (data?.content && Array.isArray(data.content)) return data.content
  if (data?.data && Array.isArray(data.data)) return data.data
  if (data?.data?.content && Array.isArray(data.data.content)) return data.data.content
  return []
}

const unwrap = (data) => data?.data ?? data

export const getMembershipTiersApi = () =>
  axiosInstance.get(`${BASE_URL}/membership/tiers`).then(r => toArray(r.data))

export const getMyMembershipApi = () =>
  axiosInstance.get(`${BASE_URL}/membership/me`).then(r => unwrap(r.data))

export const getHolidaysApi = () =>
  axiosInstance.get(`${BASE_URL}/holidays`).then(r => toArray(r.data))

export const getGroupDiscountRulesApi = () =>
  axiosInstance.get(`${BASE_URL}/holidays/group-rules`).then(r => toArray(r.data))

export const upgradeMembershipApi = (userId, tierCode) =>
  axiosInstance.put(`${BASE_URL}/membership/customers/${userId}/upgrade?tierCode=${tierCode}`).then(r => unwrap(r.data))
