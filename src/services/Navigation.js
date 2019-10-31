import axios from 'axios';
import {Maneuvers} from '../constants/Maneuvers';

const key = 'QxKUhPa8OHWrKshETgGXGsjEzPZOTiGE';

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

export const createNavigationData = (instruction, distance) => {
  const messageObj = {
    maneuver: instruction.maneuver,
    display: Maneuvers.find(m => m.value === instruction.maneuver).display,
    message: instruction.message,
    distance: distance + ' m',
    turnAngle: instruction.turnAngleInDecimalDegrees,
  };
  return messageObj;
};
