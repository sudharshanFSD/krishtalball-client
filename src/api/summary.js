import axios from './axios';

export const getSummary = async (params = {}) => {
  const response = await axios.get('/asset/summary', { params });
  return response.data;
};
