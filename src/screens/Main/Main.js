import React from 'react';
import {Alert, StyleSheet} from 'react-native';
import {
  Tabs,
  Tab,
  TabHeading,
  Text,
  Spinner,
  View,
  Content,
  ListItem,
  Left,
  Right,
  Radio,
} from 'native-base';
import Geolocation from 'react-native-geolocation-service';
import BackgroundTimer from 'react-native-background-timer';

import {Form} from './Form';
import {
  calculateRoute,
  calculateNavigation,
  getLocation,
} from '../../services/Navigation';
import {Map} from './Map';
import {requestLocationPermission} from '../../services/Permission';
import {Navigation} from '../../components/Navigation/Navigation';
import {Colors} from '../../themes/Colors';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import {sendData} from '../../services/Device';
import {Logger} from '../../services/Logger';

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
  };

  constructor() {
    super();
    this.init();
  }

  init = async () => {
    const access = await requestLocationPermission();
    if (access) {
      const location = await getLocation();
      this.setState({currentLocation: location.coords});
      // Logger.mockLocation(coords => {
      //   console.log('TCL: Main -> init -> coords', coords);
      //   this.setState({currentLocation: coords}, () => {});
      // });
      Geolocation.watchPosition(
        position => {
          this.setState({currentLocation: position.coords}, () => {});
          Logger.watchLocation(position.coords);
        },
        null,
        {
          enableHighAccuracy: true,
          interval: 1000,
          fastestInterval: 100,
          distanceFilter: 1,
          showLocationDialog: true,
          forceRequestLocation: true,
          timeout: 1000,
          maximumAge: 0,
        },
      );
    }
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
    const result = await calculateRoute(source.coords, destination.coords);
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

  startForegroundService = async (
    title = 'You are navigating!',
    message = 'Please do not close this notification',
    icon = 'ic-launcher',
  ) => {
    const notificationConfig = {
      channelId: 'navigation',
      id: 3456,
      title: title,
      text: message,
      icon,
      iconLarge: icon,
      color: Colors.secondary,
      colorized: true,
    };
    try {
      await VIForegroundService.startService(notificationConfig);
    } catch (e) {
      console.error(e);
    }
  };

  toggleNavigation = async (value = !this.state.isNavigating) => {
    this.setState({isNavigating: value});
    if (value) {
      Alert.alert(
        'Quick reminder!',
        'Please make sure your NaviCast device is connected via WiFi and your data is switched off.',
      );
      const channelConfig = {
        id: 'navigation',
        name: 'Navigation',
        description:
          'Shows direction to the user, keeps the location services on.',
        enableVibration: true,
      };
      await VIForegroundService.createNotificationChannel(channelConfig);
      this.startForegroundService();
      this.interval = BackgroundTimer.setInterval(() => {
        const {route, currentLocation} = this.state;
        const navigation = calculateNavigation(currentLocation, route);
        const {messageObj, nextLocation, expectedLocation} = navigation;
        this.startForegroundService(
          messageObj.display + ' in ' + messageObj.distance,
          messageObj.message,
          messageObj.icon,
        );
        this.setState({
          messageObj,
          nextLocation,
          expectedLocation: {...expectedLocation},
        });
        sendData(messageObj);
      }, 1000);
    } else {
      Logger.stopWatchingLocation(this.state.source, this.state.destination);
      VIForegroundService.stopService();
      if (this.interval) {
        BackgroundTimer.clearInterval(this.interval);
      }
    }
  };

  renderDevTab = () => {
    return (
      <Content>
        <ListItem selected={false}>
          <Left>
            <Text>Simulating</Text>
          </Left>
          <Right>
            <Radio
              color={'#f0ad4e'}
              selectedColor={'#5cb85c'}
              selected={this.state.simulating}
            />
          </Right>
        </ListItem>
      </Content>
    );
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
    } = this.state;
    const {navigation} = this.props;
    return (
      <View style={styles.container}>
        <Form
          source={source}
          destination={destination}
          changeLocationInput={this.changeLocationInput}
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
              routeFetching={this.state.routeFetching}
              route={this.state.route}
              routeComplete={this.state.routeComplete}
              toggleNavigation={this.toggleNavigation}
              isNavigating={isNavigating}
              changeCurrentLocation={this.changeCurrentLocation}
            />
          </Tab>
          <Tab
            heading={
              <TabHeading style={styles.tabHeader}>
                <Spinner size="small" animating={routeFetching} />
                <Text>Navigation</Text>
              </TabHeading>
            }>
            <Navigation route={route} isNavigating={isNavigating} />
          </Tab>
          <Tab
            heading={
              <TabHeading style={styles.tabHeader}>
                <Text>Dev</Text>
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
  },
});
