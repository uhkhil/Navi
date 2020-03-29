import React from 'react';
import {List, ListItem, Body, Text, Spinner} from 'native-base';
import format from 'date-fns/format';

import {ApiService} from '../../services/ApiService';

export class SimulationList extends React.Component {
  constructor() {
    super();
    this.state = {
      fetching: false,
      simulations: [],
    };
  }

  componentDidMount() {
    this.fetchSimulations();
  }

  fetchSimulations = async () => {
    this.setState({fetching: true});
    try {
      const result = await ApiService.fetchSimulations();
      const {status, data} = result.data;
      if (!status) {
        throw new Error('Failed to fetch simulations.');
      }
      // TODO: Update this API is fixed.
      const filtered = data.filter(
        sim => sim.object && sim.object.route && sim.object.route.length,
      );
      this.setState({
        simulations: filtered,
      });
    } catch (error) {
      console.warn(error);
    } finally {
      this.setState({fetching: false});
    }
  };

  getHumanDate(timeString) {
    return format(new Date(timeString), 'PPPp');
  }

  getLabel(sim) {
    const from = sim.object.source;
    const to = sim.object.destination;
    return `${from.name} to ${to.name}`;
  }

  renderItem(item) {
    const {selectSimulation} = this.props;
    return (
      <ListItem
        key={item._id}
        onPress={() =>
          selectSimulation({
            // TODO: Update this when API format is fixed.
            source: item.object.source,
            destination: item.object.destination,
            route: item.object.route,
          })
        }>
        <Body>
          <Text>{this.getLabel(item)}</Text>
          <Text note>{item.object.route.length} location changes</Text>
          <Text note>{this.getHumanDate(item.createdAt)}</Text>
        </Body>
      </ListItem>
    );
  }

  render() {
    const {fetching, simulations} = this.state;
    return (
      <List>
        <ListItem itemHeader first>
          <Body>
            <Text>Simulations</Text>
            <Text note>Select one of the simulations below.</Text>
          </Body>
          {fetching ? <Spinner /> : null}
        </ListItem>
        {simulations.map(sim => this.renderItem(sim))}
      </List>
    );
  }
}
