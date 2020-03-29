import axios from 'axios';
import {Constants} from '../constants/Constants';

const fetchSimulations = () => {
  return axios.get(`${Constants.BASE_URL}${Constants.ENDPOINTS.userRoute}`);
};

const storeUserRoute = userRoute => {
  return axios.post(
    `${Constants.BASE_URL}${Constants.ENDPOINTS.userRoute}`,
    userRoute,
  );
};

export const ApiService = {
  fetchSimulations,
  storeUserRoute,
};
