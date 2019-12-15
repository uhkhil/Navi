// import axios from 'axios';
import {Constants} from '../constants/Constants';

export const sendData = async data => {
  console.log('TCL: data', data);
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

export const setup = async (ssid, key) => {
  try {
    const data = {ssid, key};
    const result = await fetch(
      Constants.DEVICE_BASE + Constants.DEVICE_API.SETUP,
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
