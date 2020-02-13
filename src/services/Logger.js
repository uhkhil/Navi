import Axios from 'axios';

let locationLogs = [];
let startTime = null;
let storedLogs = [
  {
    timestamp: 0,
    coords: {
      speed: 0.08325443416833878,
      heading: 39.42698287963867,
      accuracy: 28.829999923706055,
      altitude: 0,
      longitude: 72.8395806,
      latitude: 19.1809743,
    },
  },
  {
    timestamp: 9985,
    coords: {
      speed: 1.2987489700317383,
      heading: 219.81358337402344,
      accuracy: 30.075000762939453,
      altitude: 0,
      longitude: 72.8394739,
      latitude: 19.1808535,
    },
  },
  {
    timestamp: 20035,
    coords: {
      speed: 0.4698532223701477,
      heading: 69.19389343261719,
      accuracy: 30.079999923706055,
      altitude: 0,
      longitude: 72.8395339,
      latitude: 19.1808821,
    },
  },
  {
    timestamp: 30134,
    coords: {
      speed: 0.16878868639469147,
      heading: 62.10255432128906,
      accuracy: 31.5049991607666,
      altitude: -43.70000076293945,
      longitude: 72.8395544,
      latitude: 19.1808983,
    },
  },
];

storedLogs = [
  {
    timestamp: 0,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352885246276855,
      accuracy: 3.9000000953674316,
      altitude: 0,
      longitude: 72.83775017511164,
      latitude: 19.184837076142998,
    },
  },
  {
    timestamp: 770,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352866172790527,
      accuracy: 7.044281959533691,
      altitude: 0,
      longitude: 72.83775545343495,
      latitude: 19.184960053736614,
    },
  },
  {
    timestamp: 1805,
    coords: {
      speed: 13.88888931274414,
      heading: 2.33528470993042,
      accuracy: 6.698503017425537,
      altitude: 0,
      longitude: 72.83776066717891,
      latitude: 19.185081526721255,
    },
  },
  {
    timestamp: 3163,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335283041000366,
      accuracy: 3.9000000953674316,
      altitude: 0,
      longitude: 72.83776594010429,
      latitude: 19.185204378550807,
    },
  },
  {
    timestamp: 3758,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352813720703125,
      accuracy: 5.798543930053711,
      altitude: 0,
      longitude: 72.83777122915777,
      latitude: 19.185327606142323,
    },
  },
  {
    timestamp: 4948,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335279703140259,
      accuracy: 3.937436103820801,
      altitude: 0,
      longitude: 72.83777649667209,
      latitude: 19.185450331901635,
    },
  },
  {
    timestamp: 6033,
    coords: {
      speed: 0.004553604871034622,
      heading: 253.5390167236328,
      accuracy: 27.392000198364258,
      altitude: -43.70000076293945,
      longitude: 72.8395884,
      latitude: 19.1809993,
    },
  },
  {
    timestamp: 6758,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352761268615723,
      accuracy: 5.649188041687012,
      altitude: 0,
      longitude: 72.8377870854908,
      latitude: 19.185697036654055,
    },
  },
  {
    timestamp: 7745,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352742195129395,
      accuracy: 5.508777141571045,
      altitude: 0,
      longitude: 72.83779237450223,
      latitude: 19.185820263266127,
    },
  },
  {
    timestamp: 8765,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352725505828857,
      accuracy: 5.383486270904541,
      altitude: 0,
      longitude: 72.83779764198108,
      latitude: 19.18594298819905,
    },
  },
  {
    timestamp: 9802,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335270643234253,
      accuracy: 3.950770378112793,
      altitude: 0,
      longitude: 72.83780291482239,
      latitude: 19.186065838069716,
    },
  },
  {
    timestamp: 10760,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335268974304199,
      accuracy: 7.2247819900512695,
      altitude: 0,
      longitude: 72.83780813385393,
      latitude: 19.186187434247493,
    },
  },
  {
    timestamp: 11773,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352673053741455,
      accuracy: 5.444991588592529,
      altitude: 0,
      longitude: 72.83781341206425,
      latitude: 19.18631040920896,
    },
  },
  {
    timestamp: 12766,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335265636444092,
      accuracy: 6.674468040466309,
      altitude: 0,
      longitude: 72.83781862568998,
      latitude: 19.18643187943897,
    },
  },
  {
    timestamp: 13757,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335263967514038,
      accuracy: 3.9000000953674316,
      altitude: 0,
      longitude: 72.83782394692474,
      latitude: 19.186555856809946,
    },
  },
  {
    timestamp: 14792,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352620601654053,
      accuracy: 6.695342540740967,
      altitude: 0,
      longitude: 72.83782922509829,
      latitude: 19.186678830914346,
    },
  },
  {
    timestamp: 15610,
    coords: {
      speed: 0.0309173371642828,
      heading: 217.68106079101562,
      accuracy: 27.43400001525879,
      altitude: -43.70000076293945,
      longitude: 72.8395865,
      latitude: 19.180997,
    },
  },
  {
    timestamp: 15750,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352601528167725,
      accuracy: 3.9000000953674316,
      altitude: 0,
      longitude: 72.83783448711617,
      latitude: 19.18680142861402,
    },
  },
  {
    timestamp: 16765,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352584838867188,
      accuracy: 4.625584125518799,
      altitude: 0,
      longitude: 72.83783975988784,
      latitude: 19.18692427686252,
    },
  },
  {
    timestamp: 17766,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335256814956665,
      accuracy: 7.168125152587891,
      altitude: 0,
      longitude: 72.83784505418029,
      latitude: 19.187047626514712,
    },
  },
  {
    timestamp: 18775,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352549076080322,
      accuracy: 5.920092582702637,
      altitude: 0,
      longitude: 72.83785034846747,
      latitude: 19.18717097604446,
    },
  },
  {
    timestamp: 19744,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352532386779785,
      accuracy: 2.5370588302612305,
      altitude: 0,
      longitude: 72.83785557278001,
      latitude: 19.187292695262318,
    },
  },
  {
    timestamp: 20766,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335251569747925,
      accuracy: 3.9000000953674316,
      altitude: 0,
      longitude: 72.83786089933388,
      latitude: 19.187416796560985,
    },
  },
  {
    timestamp: 21767,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335249662399292,
      accuracy: 7.963571071624756,
      altitude: 0,
      longitude: 72.8378662258746,
      latitude: 19.18754089755351,
    },
  },
  {
    timestamp: 22765,
    coords: {
      speed: 13.88888931274414,
      heading: 2.335247755050659,
      accuracy: 7.26364803314209,
      altitude: 0,
      longitude: 72.83787145015562,
      latitude: 19.18766261603678,
    },
  },
  {
    timestamp: 23745,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352460861206055,
      accuracy: 4.062152862548828,
      altitude: 0,
      longitude: 72.83787667980697,
      latitude: 19.187784459641488,
    },
  },
  {
    timestamp: 24772,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352444171905518,
      accuracy: 4.742494583129883,
      altitude: 0,
      longitude: 72.83788191484967,
      latitude: 19.187906428857282,
    },
  },
  {
    timestamp: 25756,
    coords: {
      speed: 0.11604581773281097,
      heading: 262.09649658203125,
      accuracy: 31.437999725341797,
      altitude: -43.70000076293945,
      longitude: 72.8395726,
      latitude: 19.1809958,
    },
  },
  {
    timestamp: 26760,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352408409118652,
      accuracy: 3.986142158508301,
      altitude: 0,
      longitude: 72.83789243870676,
      latitude: 19.188151620094146,
    },
  },
  {
    timestamp: 27745,
    coords: {
      speed: 13.88888931274414,
      heading: 2.3352391719818115,
      accuracy: 6.265909194946289,
      altitude: 0,
      longitude: 72.83789773289935,
      latitude: 19.188274967420192,
    },
  },
];

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
