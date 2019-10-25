import axios from 'axios';
import {Constants} from '../constants/Constants';

export const sendData = async data => {
  try {
    const result = await axios.post(
      Constants.DEVICE_BASE + Constants.DEVICE_API.SEND,
      data,
    );
    console.log('TCL: result', result);
    return {status: true, result, message: result.data};
  } catch (err) {
    console.log('TCL: err', err);
    return {status: false, err, message: err};
  }
};
