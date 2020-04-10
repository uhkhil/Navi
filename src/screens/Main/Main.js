import React from 'react';
import {Alert, StyleSheet} from 'react-native';
import {Tabs, Tab, TabHeading, Text, Spinner, View, Content} from 'native-base';
import BackgroundTimer from 'react-native-background-timer';

import {Form} from './Form';
import {Map} from './Map';
import {Navigation} from '../../components/Navigation/Navigation';
import {SimulationList} from '../../components/SimulationList/SimulationList';

import {DeviceService} from '../../services/DeviceService';
import {PermissionService} from '../../services/PermissionService';
import {LoggerService} from '../../services/LoggerService';
import {NavigationService} from '../../services/NavigationService';
import {NotificationService} from '../../services/NotificationService';

import {Colors} from '../../themes/Colors';

export class Main extends React.Component {
  state = {
    source: {
      name: '',
      coords: {},
    },
    destination: {
      name: '',
      coords: {},
    },
    instructions: [],
    routeFetched: false,
    routeFetching: false,
    route: [],
    routeComplete: [],
    currentInstruction: {},
    isNavigating: false,
    expectedLocation: null,
    currentLocation: {latitude: 0, longitude: 0},
    nextLocation: null,
    simulating: false,
    debugPoints: [],
    debugLines: [],
  };

  constructor() {
    super();
    this.init();
  }

  init = async () => {
    const access = await PermissionService.requestLocationPermission();
    if (access) {
      const location = await NavigationService.getLocation();
      this.setState({currentLocation: location.coords});
    }
    NavigationService.watchLocation(position => {
      const {simulating, isNavigating} = this.state;
      if (!simulating) {
        this.setState({currentLocation: position.coords}, () => {});
        if (isNavigating) {
          LoggerService.logLocation(position.coords);
        }
      }
    });
  };

  changeLocationInput = (type, name, coords) => {
    const locationObj = {
      name,
      coords: {...coords},
    };
    if (coords.lat) {
      locationObj.coords.latitude = coords.lat;
    }
    if (coords.lon) {
      locationObj.coords.longitude = coords.lon;
    }
    switch (type) {
      case 'source':
        this.setState({source: locationObj});
        break;
      case 'destination':
        this.setState({destination: locationObj}, this.fetchRoutes);
        break;
      default:
        console.warn('Something broke');
    }
  };

  fetchRoutes = async () => {
    const {source, destination, currentLocation} = this.state;
    const obj = {
      ...currentLocation,
      lat: currentLocation.latitude,
      lon: currentLocation.longitude,
    };
    if (!Object.entries(source.coords).length) {
      source.coords = obj;
    }
    if (!Object.entries(destination.coords).length) {
      destination.coords = obj;
    }
    this.setState({routeFetching: true});
    const result = await NavigationService.calculateRoute(
      source.coords,
      destination.coords,
    );
    this.toggleNavigation(false);
    if (!result.status) {
      Alert.alert('Oops', 'Something went wrong');
      this.setState({routeFetching: false});
      return;
    }
    const route = result.route;
    const routeComplete = result.legs[0].points;
    this.setState({
      route,
      routeComplete,
      routeFetched: true,
      routeFetching: false,
    });
  };

  toggleNavigation = async (value = !this.state.isNavigating) => {
    const {simulating} = this.state;
    this.setState({isNavigating: value});
    if (value) {
      Alert.alert(
        'Quick reminder!',
        'Please make sure your NaviCast device is connected via WiFi and your data is switched off.',
      );

      NotificationService.createNotificationChannel();

      if (simulating) {
        NavigationService.mockNavigate(coords => {
          this.setState({currentLocation: coords});
        });
      }

      // Main logic to keep calculating user's location.
      this.interval = BackgroundTimer.setInterval(() => {
        const {route, currentLocation} = this.state;
        const navigation = NavigationService.calculateNavigation(
          currentLocation,
          route,
        );
        const {
          messageObj,
          nextLocation,
          expectedLocation,
          debugPoints,
          debugLines,
        } = navigation;
        NotificationService.sendNotification(
          messageObj.display + ' in ' + messageObj.distance,
          messageObj.message,
          messageObj.icon,
        );
        this.setState({
          messageObj,
          nextLocation,
          expectedLocation: {...expectedLocation},
          debugPoints,
          debugLines,
        });
        DeviceService.sendData(messageObj);
      }, 1000);
    } else {
      LoggerService.stopLocationLogging(
        this.state.source,
        this.state.destination,
      );
      NavigationService.stopMockNavigation();
      await NotificationService.stopNotifications();
      if (this.interval) {
        BackgroundTimer.clearInterval(this.interval);
      }
    }
  };

  selectSimulation = sim => {
    const {isNavigating} = this.state;
    this.setState({simulating: true});

    // stop current navigation
    if (isNavigating) {
      this.toggleNavigation();
      NavigationService.stopMockNavigation();
    }

    // set the inputs
    this.changeLocationInput('source', sim.source.name, sim.source.coords);
    this.changeLocationInput(
      'destination',
      sim.destination.name,
      sim.destination.coords,
    );

    // set mock route
    NavigationService.setMockRoute(sim.route);
  };

  renderDevTab = () => {
    return (
      <Content>
        <SimulationList selectSimulation={this.selectSimulation} />
      </Content>
    );
  };

  onDrag = event => {
    console.log('Main -> onDrag -> event', event);
    this.setState({currentLocation: event.nativeEvent.coordinate});
  };

  render() {
    const {
      source,
      destination,
      routeFetched,
      routeFetching,
      route,
      routeComplete,
      isNavigating,
      currentLocation,
      nextLocation,
      expectedLocation,
      debugPoints,
      debugLines,
    } = this.state;
    const {navigation} = this.props;
    return (
      <View style={styles.container}>
        <Form
          source={source}
          destination={destination}
          changeLocationInput={(...params) => {
            this.changeLocationInput(...params);
            this.setState({simulating: false});
            NavigationService.stopMockNavigation();
          }}
          navigation={navigation}
          openMenu={this.props.navigation.toggleDrawer}
        />
        <Tabs style={styles.tabs}>
          <Tab
            heading={
              <TabHeading style={styles.tabHeader}>
                <Text>Map</Text>
              </TabHeading>
            }>
            <Map
              currentLocation={currentLocation}
              expectedLocation={expectedLocation}
              nextLocation={nextLocation}
              source={source}
              destination={destination}
              routeFetched={routeFetched}
              routeFetching={routeFetching}
              route={route}
              routeComplete={routeComplete}
              toggleNavigation={this.toggleNavigation}
              isNavigating={isNavigating}
              changeCurrentLocation={this.changeCurrentLocation}
              onDrag={this.onDrag}
              debugPoints={debugPoints}
              debugLines={debugLines}
            />
          </Tab>
          <Tab
            heading={
              <TabHeading style={styles.tabHeader}>
                {routeFetching ? (
                  <Spinner size="small" animating={routeFetching} />
                ) : null}
                <Text>Navigation</Text>
              </TabHeading>
            }>
            <Navigation route={route} isNavigating={isNavigating} />
          </Tab>
          <Tab
            heading={
              <TabHeading style={styles.tabHeader}>
                <Text>Testing</Text>
              </TabHeading>
            }>
            {this.renderDevTab()}
          </Tab>
        </Tabs>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {flex: 1},
  tabs: {
    elevation: -1,
  },
  tabHeader: {
    backgroundColor: Colors.secondary,
    marginTop: -15,
  },
});
