import axios from 'axios';

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

export const createInstructionObj = (instruction, distance) => {
  const messageObj = {
    maneuver: instruction.maneuver,
    display: instruction.maneuver,
    message: instruction.message,
    distance: distance + ' m',
    turnAngle: instruction.turnAngleInDecimalDegrees,
  };
  return messageObj;
};
