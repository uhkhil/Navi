import {ApiService} from './ApiService';

let locationLogs = [];
let startTime = null;

const logLocation = coords => {
  if (!startTime) {
    startTime = new Date().getTime();
  }
  const log = {
    timestamp: new Date().getTime() - startTime,
    coords,
  };
  locationLogs.push(log);
};

const stopLocationLogging = async (source, destination) => {
  const routeInfo = {
    source,
    destination,
    route: JSON.parse(JSON.stringify(locationLogs)),
  };
  try {
    await ApiService.storeUserRoute(routeInfo);
  } catch (error) {
    console.warn(error);
  } finally {
    locationLogs = [];
    startTime = null;
  }
};

export const LoggerService = {
  logLocation,
  stopLocationLogging,
};
