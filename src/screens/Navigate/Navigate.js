import React from 'react';
import {Alert} from 'react-native';
import {
  Container,
  Content,
  Text,
  List,
  ListItem,
  Right,
  Left,
  Icon,
  Tabs,
  Tab,
  TabHeading,
  Spinner,
} from 'native-base';
import SystemSetting from 'react-native-system-setting';
import Geolocation from 'react-native-geolocation-service';
import VIForegroundService from '@voximplant/react-native-foreground-service';

import {
  getDistanceFromLine,
  orderByDistance,
  getDistance,
  computeDestinationPoint,
  getGreatCircleBearing,
} from 'geolib';
import {sendData} from '../../services/Device';
import {
  calculateRoute,
  createNavigationData,
  createMockNavigationData,
  getRegionForCoordinates,
} from '../../services/Navigation';
import {requestLocationPermission} from '../../services/Permission';
import {styles} from './NavigateStyles';
import {Navigation} from '../../components/Navigation/Navigation';
import {Map} from '../../components/Map/Map';

const getLocation = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(position => {
      resolve(position);
    });
  });

export class Navigate extends React.Component {
  state = {
    from: {
      text: '',
      value: {},
    },
    to: {
      text: '',
      value: {},
    },
    fromSuggestions: [],
    toSuggestions: [],
    instructions: [],
    logs: [],
    wifiState: true,
    region: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    currentRegion: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    markers: [],
    loading: false,
    polyline: [],
    currentInstruction: {},
    route: [],
    isNavigating: false,
    mock: false,
    expectedPoint: null,
    currentPoint: null,
    mockLocation: false,
    followUser: false,
    testResult: '',
  };

  async componentDidMount() {
    this.checkWifi();
    const access = await requestLocationPermission();
    if (access) {
      await this.initialFetchLocation();
    }
  }

  initialFetchLocation = async () => {
    const position = await getLocation();
    this.setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      currentPoint: position.coords,
    });
    if (!this.state.isNavigating) {
      console.log('setting region');
      this.setState({
        region: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        currentRegion: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
      });
    }
  };

  checkWifi = () => {
    SystemSetting.isWifiEnabled().then(enable => {
      this.setState({wifiState: enable});
    });
  };

  openPlaceModal = (place, action) => {
    this.props.navigation.navigate('PlaceModal', {place, action});
  };

  returnFromPlace = (text, value) => {
    this.setState({
      from: {
        text,
        value,
      },
    });
    if (this.state.from.value !== value && this.state.to.text !== '') {
      setTimeout(this.calculateRoute, 0);
    }
  };

  returnToPlace = (text, value) => {
    this.setState({
      to: {
        text,
        value,
      },
    });
    if (this.state.to.value !== value) {
      setTimeout(this.calculateRoute, 0);
    }
  };

  setMarkers = data => {
    const points = data.legs[0].points
      .filter((p, idx, array) => idx === 0 || idx === array.length - 1)
      .map((p, idx) => {
        const obj = {
          latlng: p,
          title: idx === 0 ? 'Source' : 'Destination',
        };
        return obj;
      });
    this.setState({markers: points});
    const polyline = data.guidance.instructions.map(i => i.point);
    this.setState({polyline});
  };

  addMarker = (latlng, title) => {
    const {markers} = this.state;
    markers.push({latlng, title});
    this.setState(markers);
  };

  onDrag = event => {
    const coord = event.nativeEvent.coordinate;
    console.log('TCL: Home -> coord', coord);
    this.setState({currentPoint: coord});
  };

  calculateRoute = async () => {
    const {from, to} = this.state;
    const coords = {
      lat: this.state.latitude,
      lon: this.state.longitude,
    };
    if (!Object.entries(from.value).length) {
      from.value = coords;
    }
    if (!Object.entries(to.value).length) {
      to.value = coords;
    }
    this.setState({loading: true});
    const result = await calculateRoute(from.value, to.value);
    this.startNavigation(false);
    if (!result.status) {
      Alert.alert('Oops', 'Something went wrong');
      this.setState({loading: false});
      return;
    }
    const route = result.route;
    this.setState({route, loading: false});

    this.drawRoute();
  };

  drawRoute = () => {
    const {route} = this.state;
    const polyline = route.map(i => i.point);
    this.addMarker(route[0].point, 'Source');
    this.addMarker(route[route.length - 1].point, 'Destination');
    this.setState({
      polyline,
    });
    const currentRegion = getRegionForCoordinates(polyline);
    this.mapView.animateToRegion(currentRegion, 1000);
    setTimeout(() => {
      this.setState({currentRegion});
    }, 1001);
  };

  startForegroundService = async (
    title = 'You are navigating!',
    message = 'Please do not close this notification',
  ) => {
    const notificationConfig = {
      channelId: 'navigation',
      id: 3456,
      title: title,
      text: message,
      icon: 'ic_launcher',
    };
    try {
      await VIForegroundService.startService(notificationConfig);
    } catch (e) {
      console.error(e);
    }
  };

  startNavigation = async value => {
    this.setState({isNavigating: value});
    if (value) {
      const channelConfig = {
        id: 'navigation',
        name: 'Navigation',
        description:
          'Shows direction to the user, keeps the location services on.',
        enableVibration: true,
      };
      await VIForegroundService.createNotificationChannel(channelConfig);
      await this.startForegroundService();
      this.calculateNavigation();
    } else {
      await VIForegroundService.stopService();
      Geolocation.stopObserving();
    }
  };

  calculateNavigation = () => {
    const {mock, route, mockLocation} = this.state;
    const points = route.map(r => r.point);

    Geolocation.watchPosition(
      position => {
        console.log('TCL: Home -> calculateNavigation -> position', position);
        // fetch current location
        let current;
        if (mockLocation) {
          current = this.state.currentPoint;
        } else {
          current = position.coords;
          this.setState({currentPoint: current});
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
            return line;
          })
          .filter(line => typeof line.distance === 'number')
          .sort((a, b) => a.distance > b.distance)[0];

        this.setState({nextPoint: nearestLine.to});

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
        this.setState({expectedPoint});

        // create the next message`
        let messageObj;
        if (mock) {
          messageObj = createMockNavigationData();
        } else {
          // find the respective instruction
          const currentInstruction = route.find(
            r => r.point === nearestLine.to,
          );
          messageObj = createNavigationData(
            currentInstruction,
            alongLineDistance,
          );
        }
        this.startForegroundService(
          messageObj.display + ' in ' + messageObj.distance,
          messageObj.message,
        );
        this.setState({currentInstruction: messageObj});
        sendData(messageObj);
      },
      err => {
        console.warn(err);
      },
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
  };

  setCurrent = async () => {
    const position = await getLocation();
    this.setState({
      currentRegion: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
    });
  };

  recenter = () => {
    this.setState({
      followUser: true,
    });
  };

  onPanDrag = event => {
    this.setState({followUser: false, currentRegion: null});
  };

  renderSearch() {
    return (
      <Content style={styles.inputContainer}>
        <List>
          <ListItem
            noIndent
            style={styles.inputBox}
            onPress={() =>
              this.openPlaceModal(this.state.from, this.returnFromPlace)
            }>
            <Left>
              <Text style={styles.inputBoxText}>
                {!this.state.from.text ? 'From' : this.state.from.text}
              </Text>
            </Left>
            <Right>
              <Icon type="MaterialCommunityIcons" name="crosshairs-gps" />
            </Right>
          </ListItem>
          <ListItem
            noIndent
            style={styles.inputBox}
            onPress={() =>
              this.openPlaceModal(this.state.to, this.returnToPlace)
            }>
            <Left>
              <Text style={styles.inputBoxText}>
                {!this.state.to.text ? 'To' : this.state.to.text}
              </Text>
            </Left>
            <Right>
              <Icon type="MaterialCommunityIcons" name="map-marker" />
            </Right>
          </ListItem>
        </List>
      </Content>
    );
  }

  render() {
    const {
      region,
      currentRegion,
      polyline,
      markers,
      currentPoint,
      expectedPoint,
      nextPoint,
      mockLocation,
    } = this.state;
    return (
      <Container>
        <Content>
          {this.renderSearch()}
          <Tabs style={styles.tabs}>
            <Tab
              heading={
                <TabHeading>
                  <Text>Map</Text>
                </TabHeading>
              }>
              <Map
                region={region}
                currentRegion={currentRegion}
                polyline={polyline}
                markers={markers}
                currentPoint={currentPoint}
                expectedPoint={expectedPoint}
                nextPoint={nextPoint}
                mockLocation={mockLocation}
                getRef={ref => (this.mapView = ref)}
                onPanDrag={this.onPanDrag}
                setCurrent={this.setCurrent}
              />
            </Tab>
            <Tab
              heading={
                <TabHeading>
                  <Spinner size="small" animating={this.state.loading} />
                  <Text>Navigate</Text>
                </TabHeading>
              }>
              <Navigation
                route={this.state.route}
                startNavigation={this.startNavigation}
                isNavigating={this.state.isNavigating}
              />
            </Tab>
          </Tabs>
        </Content>
      </Container>
    );
  }
}
