import axios from 'axios';
import {Maneuvers} from '../constants/Maneuvers';
import {TOMTOM_API_KEY} from '../constants/Constants';

const key = TOMTOM_API_KEY;

export const calculateRoute = async (from, to) => {
  try {
    const result = await axios.get(
      `https://api.tomtom.com/routing/1/calculateRoute/${from.lat},${
        from.lon
      }:${to.lat},${
        to.lon
      }/json?instructionsType=text&avoid=unpavedRoads&key=${key}`,
    );
    console.log('TCL: calculateRoute -> result', result);
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
  const messageObj = {
    maneuver: instruction.maneuver,
    display: Maneuvers.find(m => m.value === instruction.maneuver).display,
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
  (point => {
    minX = point.latitude;
    maxX = point.latitude;
    minY = point.longitude;
    maxY = point.longitude;
  })(points[0]);

  // calculate rect
  points.map(point => {
    minX = Math.min(minX, point.latitude);
    maxX = Math.max(maxX, point.latitude);
    minY = Math.min(minY, point.longitude);
    maxY = Math.max(maxY, point.longitude);
  });

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = maxX - minX;
  const deltaY = maxY - minY;

  return {
    latitude: midX,
    longitude: midY,
    latitudeDelta: deltaX * 1.4,
    longitudeDelta: deltaY * 1.4,
  };
}
