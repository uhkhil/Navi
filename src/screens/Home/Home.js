import React from 'react';
import {Alert} from 'react-native';
import {
  Container,
  Content,
  Button,
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
import BackgroundTimer from 'react-native-background-timer';
import SystemSetting from 'react-native-system-setting';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

import {
  getDistanceFromLine,
  findNearest,
  orderByDistance,
  getDistance,
  computeDestinationPoint,
  getGreatCircleBearing,
} from 'geolib';
import {sendData} from '../../services/Device';
import {calculateRoute, createInstructionObj} from '../../services/Navigation';
import {Maneuvers} from '../../constants/Maneuvers';
import {requestLocationPermission} from '../../services/Permission';
import {styles} from './HomeStyles';

const getLocation = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(position => {
      resolve(position);
    });
  });

let looper;

export class Home extends React.Component {
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
      latitude: 18.5553581313748,
      longitude: 73.87878940594761,
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
  };

  async componentDidMount() {
    this.checkWifi();
    const access = await requestLocationPermission();
    if (access) {
      await this.initialFetchLocation();
    }
  }

  checkWifi = () => {
    SystemSetting.isWifiEnabled().then(enable => {
      this.setState({wifiState: enable});
    });
  };

  toggleWifi = wifiState => {
    this.setState({
      wifiState,
    });

    SystemSetting.switchWifiSilence(() => {
      this.checkWifi();
    });
  };

  openPlaceModal = (place, action) => {
    this.toggleWifi(false);
    this.props.navigation.navigate('PlaceModal', {place, action});
  };

  returnFromPlace = (text, value) => {
    this.setState({
      from: {
        text,
        value,
      },
    });
    setTimeout(this.calculateRoute, 0);
  };

  returnToPlace = (text, value) => {
    this.setState({
      to: {
        text,
        value,
      },
    });
    setTimeout(this.calculateRoute, 0);
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

  initialFetchLocation = async () => {
    Geolocation.getCurrentPosition(position => {
      // TODO: Add another step to rectify sensor data

      this.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        currentPoint: position.coords,
      });
      if (!this.state.isStreaming) {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
        });
      }
      const obj = {
        latlng: position.coords,
        type: 'current',
      };
      if (this.state.isStreaming) {
        const markers = [...this.state.markers];
        markers[markers.length - 1] = obj;
        this.setState({markers});
      }
    });
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
    this.toggleWifi(true);
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
    this.setState({polyline});
  };

  startNavigation = () => {
    this.setState({isNavigating: !this.state.isNavigating});
    looper = BackgroundTimer.setInterval(() => {
      this.calculateNavigation();
    }, 2000);
  };

  stopNavigation = () => {
    this.setState({isNavigating: false});
    BackgroundTimer.clearInterval(looper);
  };

  getMockData = () => {
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

    // Mock
    const message = {
      maneuver: getRandom(maneuvers).value,
      display: getRandom(maneuvers).display,
      message: getRandom(messages),
      distance: getRandom(distances),
      turnAngle: getRandom(angles),
    };
    return message;
  };

  calculateNavigation = async () => {
    const {mock, route, mockLocation} = this.state;
    const points = route.map(r => r.point);

    // fetch current location
    let current;
    if (mockLocation) {
      current = this.state.currentLocation;
    } else {
      const position = await getLocation();
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
      messageObj = this.getMockData();
    } else {
      // find the respective instruction
      const currentInstruction = route.find(r => r.point === nearestLine.to);
      console.log(
        'TCL: Home -> calculateNavigation -> currentInstruction',
        currentInstruction,
      );
      messageObj = createInstructionObj(currentInstruction, alongLineDistance);
    }
    this.setState({currentInstruction: messageObj});
    const result = await sendData(messageObj);
  };

  renderInstructions = instructions => {
    return instructions.length ? (
      <List style={styles.instructionList}>
        <ListItem bordered itemDivider>
          <Text>Steps</Text>
        </ListItem>
        {instructions.map((instuct, inx) => {
          return (
            <ListItem key={inx}>
              <Text>{instuct.message}</Text>
            </ListItem>
          );
        })}
        {this.state.isNavigating ? (
          <Button full large danger onPress={this.stopNavigation}>
            <Text>Stop</Text>
          </Button>
        ) : (
          <Button full large success onPress={this.startNavigation}>
            <Text>Start</Text>
          </Button>
        )}
      </List>
    ) : null;
  };

  onDrag = event => {
    const coord = event.nativeEvent.coordinate;
    this.setState({currentPoint: coord});
  };

  renderMap() {
    return (
      <MapView
        style={styles.map}
        initialRegion={this.state.region}
        // region={this.state.region}
        // followsUserLocation={this.state.isNavigating}
        on>
        <Polyline coordinates={this.state.polyline} />
        {this.state.markers.map((marker, idx) => (
          <Marker
            key={idx}
            draggable={marker.type === 'current'}
            onDrag={this.onDrag}
            coordinate={marker.latlng}
            title={marker.title}
            description={marker.description}
            pinColor={marker.type === 'current' ? 'lightblue' : 'red'}
          />
        ))}
        {this.state.expectedPoint ? (
          <Marker
            coordinate={this.state.expectedPoint}
            title="Expected"
            pinColor="darkblue"
          />
        ) : null}
        {this.state.currentPoint ? (
          <Marker
            coordinate={this.state.currentPoint}
            title="Actual"
            draggable={this.state.mockLocation}
            onDrag={this.onDrag}
            pinColor="lightblue"
          />
        ) : null}
        {this.state.nextPoint ? (
          <Marker
            coordinate={this.state.nextPoint}
            title="Next stop"
            pinColor="green"
          />
        ) : null}
      </MapView>
    );
  }

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

  renderTransmittedData = data => {
    return (
      <Content>
        <Text>{JSON.stringify(data, null, 2)}</Text>
      </Content>
    );
  };

  render() {
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
              {this.renderMap()}
            </Tab>
            <Tab
              heading={
                <TabHeading>
                  <Spinner size="small" animating={this.state.loading} />
                  <Text>Navigate</Text>
                </TabHeading>
              }>
              {this.renderInstructions(this.state.route)}
            </Tab>
            <Tab
              heading={
                <TabHeading>
                  <Text>Data</Text>
                </TabHeading>
              }>
              {this.renderTransmittedData(this.state.currentInstruction)}
            </Tab>
          </Tabs>
        </Content>
      </Container>
    );
  }
}
