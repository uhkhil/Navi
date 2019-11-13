// import axios from 'axios';
import {Constants} from '../constants/Constants';

export const sendData = async data => {
  try {
    const result = await fetch(
      Constants.DEVICE_BASE + Constants.DEVICE_API.SEND,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
    console.log('TCL: result', result);
    return {status: true, result, message: result.data};
  } catch (err) {
    console.log('TCL: err', err);
    return {status: false, err, message: err};
  }
};
