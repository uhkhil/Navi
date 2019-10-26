import React from 'react';
import {Alert} from 'react-native';
import {
  Container,
  Content,
  Button,
  Text,
  Body,
  List,
  ListItem,
  Right,
  Left,
  Icon,
  Switch,
  Tabs,
  Tab,
  TabHeading,
  Spinner,
} from 'native-base';
import BackgroundTimer from 'react-native-background-timer';
import SystemSetting from 'react-native-system-setting';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {getDistance} from 'geolib';
import {PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {sendData} from '../../services/Device';
import {calculateRoute} from '../../services/Navigation';
import {Maneuvers} from '../../constants/Maneuvers';
import {styles} from './HomeStyles';

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
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    markers: [],
    loading: false,
    polyline: [],
    currentInstruction: {},
    route: [],
    isNavigating: false,
    mock: true,
  };

  checkWifi = () => {
    SystemSetting.isWifiEnabled().then(enable => {
      this.setState({wifiState: enable});
    });
  };

  fetchCurrentLocation = async () => {
    const currentLocation = {};
    console.log(
      'TCL: fetchCurrentLocation -> currentLocation',
      currentLocation,
    );
    Geolocation.getCurrentPosition(position => {
      console.log('TCL: fetchCurrentLocation -> position', position);

      // TODO: Add another step to rectify sensor data

      this.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
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
      console.log(
        'TCL: Home -> fetchCurrentLocation -> this.state.markers',
        this.state.markers,
      );
    });
  };

  componentDidMount() {
    this.requestLocationPermission()
      .then(async res => {
        await this.fetchCurrentLocation();
      })
      .catch(err => {
        console.log('TCL: componentDidMount -> err', err);
      });
    this.checkWifi();
  }

  requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission for location',
          message: 'Need some permission for the app to work.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the Location');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
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

  openPlaceModal = (place, action) => {
    this.wifiToggled(false);
    this.props.navigation.navigate('PlaceModal', {place, action});
  };

  setMarkers = data => {
    console.log('TCL: Home -> setMarkers -> data', data);
    const points = data.legs[0].points
      .filter((p, idx, array) => idx === 0 || idx === array.length - 1)
      .map((p, idx) => {
        const obj = {
          latlng: p,
          title: idx === 0 ? 'Source' : 'Destination',
        };
        return obj;
      });
    console.log('TCL: setMarkers -> points', points);
    this.setState({markers: points});
    const polyline = data.guidance.instructions.map(i => i.point);
    console.log('TCL: Home -> polyline', polyline);
    console.log('TCL: Home -> setMarkers -> polyline', polyline);
    this.setState({polyline});
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
    this.wifiToggled(true);
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

  addMarker = (latlng, title) => {
    const {markers} = this.state;
    markers.push({latlng, title});
    this.setState(markers);
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
      console.log('TCL: Home -> getMockData -> array', array);
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
    const {mock} = this.state;
    // fetch current location
    // locate the position on the polyline
    // create the next message
    let messageObj;
    if (mock) {
      messageObj = this.getMockData();
    }
    this.setState({currentInstruction: messageObj});
    const result = await sendData(messageObj);
    this.addLog(result);
    console.log('TCL: Home -> calculateNavigation -> result', result);
    // send message
  };

  addLog = str => {
    return true;
    // console.log('TCL: addLog -> str', str);
    // const logs = this.state.logs;
    // console.log('TCL: addLog -> logs', logs);
    // this.setState({
    //   logs: [...this.state.logs, {msg: str.message}],
    // });
  };

  calculateNavigation2 = () => {
    // fetch the current position
    const current = {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    };

    // check which is the next stop

    const route = this.route;
    console.log('TCL: Home -> calculateNavigation -> route', route);

    const nextStop = route.legs[0].points[1];

    // check the distance
    const distance = getDistance(current, nextStop);
    console.log('TCL: Home -> calculateNavigation -> distance', distance);

    const data = this.state.instructions[1];
    console.log('TCL: Home -> calculateNavigation -> data', data);

    const maneuvers = [
      'ARRIVE',
      'ARRIVE_LEFT',
      'ARRIVE_RIGHT',
      'DEPART',
      'STRAIGHT',
      'KEEP_RIGHT',
      'BEAR_RIGHT',
      'TURN_RIGHT',
      'SHARP_RIGHT',
      'KEEP_LEFT',
      'BEAR_LEFT',
      'TURN_LEFT',
      'SHARP_LEFT',
      'MAKE_UTURN',
      'ENTER_MOTORWAY',
      'ENTER_FREEWAY',
      'ENTER_HIGHWAY',
      'TAKE_EXIT',
      'MOTORWAY_EXIT_LEFT',
      'MOTORWAY_EXIT_RIGHT',
      'TAKE_FERRY',
      'ROUNDABOUT_CROSS',
      'ROUNDABOUT_RIGHT',
      'ROUNDABOUT_LEFT',
      'ROUNDABOUT_BACK',
      'TRY_MAKE_UTURN',
      'FOLLOW',
      'SWITCH_PARALLEL_ROAD',
      'SWITCH_MAIN_ROAD',
      'ENTRANCE_RAMP',
      'WAYPOINT_LEFT',
      'WAYPOINT_RIGHT',
      'WAYPOINT_REACHED',
    ];
    const messages = [
      'Leave from Ramganesh Gadkari Road',
      'Turn right onto Kasaba Peth in 90 mts',
      'Turn left onto Chhatrapati Shivaji Maharaj Road/NH4',
    ];
    const distances = [20, 30, 40, 50, 60, 70, 80, 90];
    const angles = [45, 90, -45, -90];

    const getRandom = array => {
      console.log('TCL: Home -> array', array);
      const idx = Math.floor(Math.random() * (array.length - 1));
      return array[idx];
    };

    // Mock
    const message = {
      maneuver: getRandom(maneuvers),
      message: getRandom(messages),
      distance: getRandom(distances),
      turnAngle: getRandom(angles),
    };
    console.log('TCL: Home -> calculateNavigation -> message', message);

    this.setState({currentInstruction: message});
    return message;
  };

  renderLogs = lols => {
    return lols.length ? (
      <List>
        <ListItem bordered itemDivider>
          <Text>Logs</Text>
        </ListItem>
        {lols.map((log, inx) => {
          return (
            <ListItem key={inx}>
              <Text>{log.msg}</Text>
            </ListItem>
          );
        })}
      </List>
    ) : null;
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

  wifiToggled = wifiState => {
    console.log('TCL: wifiToggled -> wifiState', wifiState);
    this.setState({
      wifiState,
    });

    SystemSetting.switchWifiSilence(() => {
      this.checkWifi();
    });
  };

  renderMap() {
    return (
      <MapView
        style={styles.map}
        initialRegion={this.state.region}
        region={this.state.region}
        followsUserLocation={this.state.isNavigating}>
        <Polyline coordinates={this.state.polyline} />
        {this.state.markers.map((marker, idx) => (
          <Marker
            key={idx}
            coordinate={marker.latlng}
            title={marker.title}
            description={marker.description}
            pinColor={marker.type === 'current' ? 'lightblue' : 'red'}
          />
        ))}
      </MapView>
    );
  }

  renderSettings() {
    return (
      <List>
        <ListItem icon>
          <Left>
            <Icon active name="wifi" />
            {/* <Button> */}
            {/* </Button> */}
          </Left>
          <Body>
            <Text>Wifi</Text>
          </Body>
          <Right>
            <Switch
              value={this.state.wifiState}
              onValueChange={this.wifiToggled}
            />
          </Right>
        </ListItem>
      </List>
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
          <Tabs style={{elevation: -1}}>
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
