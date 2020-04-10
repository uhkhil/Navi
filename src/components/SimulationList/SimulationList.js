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
      this.setState({
        simulations: data
          // TODO: Fix the API
          .filter(d => !d.label)
          .map(d => {
            console.log('SimulationList -> fetchSimulations -> d', d);
            d.source.coords.lat = d.source.coords.latitude;
            d.source.coords.lon = d.source.coords.longitude;
            d.destination.coords.lat = d.destination.coords.latitude;
            d.destination.coords.lon = d.destination.coords.longitude;
            return d;
          }),
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
    const from = sim.source;
    const to = sim.destination;
    return `${from.name ? from.name : 'Unknown location'} to ${
      to.name ? to.name : 'Unknown location'
    }`;
  }

  renderItem(item) {
    const {selectSimulation} = this.props;
    return (
      <ListItem
        key={item._id}
        onPress={() =>
          selectSimulation({
            source: item.source,
            destination: item.destination,
            route: item.route,
          })
        }>
        <Body>
          <Text>{this.getLabel(item)}</Text>
          <Text note>{item.route.length} location changes</Text>
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
