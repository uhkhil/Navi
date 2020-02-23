import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import {
  getDistanceFromLine,
  orderByDistance,
  getDistance,
  computeDestinationPoint,
  getGreatCircleBearing,
} from 'geolib';

import {Maneuvers} from '../constants/Maneuvers';
import {Constants} from '../constants/Constants';

export const getLocation = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(position => {
      resolve(position);
    });
  });

export const calculateRoute = async (from, to) => {
  try {
    const result = await axios.get(
      Constants.BASE_API +
        Constants.APIS.CALCULATE_ROUTE +
        from.lat +
        ',' +
        from.lon +
        ':' +
        to.lat +
        ',' +
        to.lon +
        '/json',
      {
        params: {
          instructionsType: 'text',
          travelMode: 'motorcycle',
          key: Constants.API_KEY,
        },
      },
    );
    return {
      status: true,
      route: result.data.routes[0].guidance.instructions,
      legs: result.data.routes[0].legs,
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
    };
  }
};

export const searchPlace = async (searchString, current) => {
  try {
    const params = {
      countrySet: 'IN',
      idxSet: 'POI',
      key: Constants.API_KEY,
    };
    if (current && current.coords) {
      params.lat = current.coords.latitude;
      params.lon = current.coords.longitude;
    }
    const result = await axios.get(
      Constants.BASE_API + Constants.APIS.SEARCH + searchString + '.json',
      {
        params,
      },
    );
    return result.data.results;
  } catch (err) {
    console.warn(err);
    return [];
  }
};

export const createMockNavigationData = () => {
  const maneuvers = Maneuvers;
  const messages = [
    'Leave from Ramganesh Gadkari Road',
    'Turn right onto Kasaba Peth in 90 mts',
    'Turn left onto Chhatrapati Shivaji Maharaj Road/NH4',
  ];
  const distances = [
    '20 m',
    '30 m',
    '40 m',
    '50 m',
    '60 m',
    '70 m',
    '80 m',
    '90 m',
    '1.2 km',
    '1.5 km',
    '1.4 km',
    '2.0 km',
  ];
  const angles = [45, 90, -45, -90];
  const getRandom = array => {
    const idx = Math.floor(Math.random() * (array.length - 1));
    return array[idx];
  };

  const message = {
    maneuver: getRandom(maneuvers).value,
    display: getRandom(maneuvers).display,
    message: getRandom(messages),
    distance: getRandom(distances),
    turnAngle: getRandom(angles),
  };
  return message;
};

const humanifyDistance = given => {
  let distance = parseInt(given, 10);
  if (distance > 1000) {
    return (distance / 1000).toFixed(1) + ' km';
  }
  return distance + ' m';
};

export const createNavigationData = (instruction, distance) => {
  const maneuverDetails = Maneuvers.find(m => m.value === instruction.maneuver);
  const messageObj = {
    maneuver: instruction.maneuver,
    display: maneuverDetails.display,
    icon: maneuverDetails.icon,
    message: instruction.message,
    distance: humanifyDistance(distance),
    turnAngle: instruction.turnAngleInDecimalDegrees,
  };
  return messageObj;
};

export function getRegionForCoordinates(points) {
  // points should be an array of { latitude: X, longitude: Y }
  let minX, maxX, minY, maxY;

  // init first point
  const point = points[0].point;
  minX = point.latitude;
  maxX = point.latitude;
  minY = point.longitude;
  maxY = point.longitude;

  // calculate rect
  points.forEach(point => {
    minX = Math.min(minX, point.point.latitude);
    maxX = Math.max(maxX, point.point.latitude);
    minY = Math.min(minY, point.point.longitude);
    maxY = Math.max(maxY, point.point.longitude);
  });

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = maxX - minX;
  const deltaY = maxY - minY;

  return {
    latitude: midX,
    longitude: midY,
    latitudeDelta: deltaX * 1.6,
    longitudeDelta: deltaY * 1.6,
  };
}

export const calculateNavigation = (position, route) => {
  const mockLocation = false;
  const mock = false;
  const points = route.map(r => r.point);
  // fetch current location
  let current;
  if (mockLocation) {
    current = this.state.currentPoint;
  } else {
    current = position;
  }

  // locate the position on the polyline
  // find the closest line

  const nearestPoints = orderByDistance(current, points).slice(0, 5);

  const nearestLines = [];
  nearestPoints.forEach(point => {
    const pointIndex = points.indexOf(point);
    if (pointIndex !== 0) {
      const prev = {
        from: points[pointIndex - 1],
        to: points[pointIndex],
      };
      nearestLines.push(prev);
    }
    if (pointIndex !== points.length - 1) {
      const next = {
        from: points[pointIndex],
        to: points[pointIndex + 1],
      };
      nearestLines.push(next);
    }
  });

  const nearestLine = nearestLines
    .map(line => {
      line.distance = getDistanceFromLine(current, line.from, line.to);
      console.log('TCL: calculateNavigation -> current', current);
      line.heading = getGreatCircleBearing(line.from, line.to);
      console.log('TCL: calculateNavigation -> line.heading', line.heading);
      line.farthestScore =
        line.distance * 1 + Math.abs(current.heading - line.heading) * 2;
      return line;
    })
    .filter(line => typeof line.distance === 'number')
    .sort((a, b) => a.farthestScore > b.farthestScore)[0];

  // calculate sides of the hypotenuse triangle
  const hypotenuse = getDistance(current, nearestLine.to);
  const alongLineDistance = Math.sqrt(
    Math.pow(hypotenuse, 2) - Math.pow(nearestLine.distance, 2),
  );

  // find the point along the polyline
  const bearing = getGreatCircleBearing(nearestLine.from, nearestLine.to);

  const expectedPoint = computeDestinationPoint(
    nearestLine.to,
    -alongLineDistance,
    bearing,
  );

  // create the next message`
  let messageObj;
  if (mock) {
    messageObj = createMockNavigationData();
  } else {
    // find the respective instruction
    const currentInstruction = route.find(r => r.point === nearestLine.to);
    messageObj = createNavigationData(currentInstruction, alongLineDistance);
  }
  return {
    messageObj,
    nextLocation: nearestLine.to,
    expectedLocation: expectedPoint,
  };
};
