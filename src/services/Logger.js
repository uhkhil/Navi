import Axios from 'axios';

let locationLogs = [];
let startTime = null;
// let storedLogs = [
//   {
//     timestamp: 0,
//     coords: {
//       speed: 0.08325443416833878,
//       heading: 39.42698287963867,
//       accuracy: 28.829999923706055,
//       altitude: 0,
//       longitude: 72.8395806,
//       latitude: 19.1809743,
//     },
//   },
//   {
//     timestamp: 9985,
//     coords: {
//       speed: 1.2987489700317383,
//       heading: 219.81358337402344,
//       accuracy: 30.075000762939453,
//       altitude: 0,
//       longitude: 72.8394739,
//       latitude: 19.1808535,
//     },
//   },
//   {
//     timestamp: 20035,
//     coords: {
//       speed: 0.4698532223701477,
//       heading: 69.19389343261719,
//       accuracy: 30.079999923706055,
//       altitude: 0,
//       longitude: 72.8395339,
//       latitude: 19.1808821,
//     },
//   },
//   {
//     timestamp: 30134,
//     coords: {
//       speed: 0.16878868639469147,
//       heading: 62.10255432128906,
//       accuracy: 31.5049991607666,
//       altitude: -43.70000076293945,
//       longitude: 72.8395544,
//       latitude: 19.1808983,
//     },
//   },
// ];

const watchLocation = coords => {
  console.log('TCL: startTime', startTime);
  if (!startTime) {
    startTime = new Date().getTime();
  }
  const log = {
    timestamp: new Date().getTime() - startTime,
    coords,
  };
  locationLogs.push(log);
};

const stopWatchingLocation = (source, destination) => {
  console.log(
    'TCL: stopWatchingLocation -> temp',
    JSON.stringify(locationLogs, null, 2),
  );
  const body = {
    source,
    destination,
    route: JSON.parse(JSON.stringify(locationLogs)),
  };
  Axios.post('https://navicast-server.herokuapp.com/user-route', body)
    .then(res => {
      console.log('TCL: stopWatchingLocation -> res', res);
    })
    .catch(err => {
      console.warn(err);
    });
  console.log('TCL: stopWatchingLocation -> body', body);
  //   storedLogs = [...locationLogs];
  // Network call
  // Clear it if that happens
  locationLogs = [];
  startTime = null;
};

const mockLocation = callback => {
  let startTime = new Date().getTime();
  console.log('TCL: startTime', startTime);
  let index = 0;
  const looper = setInterval(function() {
    const now = new Date().getTime();
    console.log('TCL: looper -> now', now);
    if (storedLogs[index].timestamp - (now - startTime) < 1000) {
      console.log('There is a location change now', storedLogs[index]);
      callback(storedLogs[index].coords);
      index++;
      if (index >= storedLogs.length) {
        clearInterval(looper);
      }
    }
  }, 1000);
};

export const Logger = {
  watchLocation,
  stopWatchingLocation,
  mockLocation,
};
