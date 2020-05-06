import {Constants} from '../constants/Constants';

const sendData = async data => {
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
    return {status: true, result, message: result.data};
  } catch (err) {
    return {status: false, err, message: err};
  }
};

const setup = async (ssid, key) => {
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
    return {status: true, result, message: result.data};
  } catch (err) {
    return {status: false, err, message: err};
  }
};

const upateFirmware = async data => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    options.body = new FormData();
    for (let key in data) {
      options.body.append(key, data[key]);
    }

    const result = await fetch(
      Constants.DEVICE_BASE + Constants.DEVICE_API.UPDATE,
      options,
    );
    return {status: true};
  } catch (err) {
    return {status: false, err, message: err};
  }
};

export const DeviceService = {
  sendData,
  setup,
  upateFirmware,
};
