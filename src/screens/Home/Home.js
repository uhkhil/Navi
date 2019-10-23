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

import {styles} from './HomeStyles';

import {PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const key = 'QxKUhPa8OHWrKshETgGXGsjEzPZOTiGE';

export class Home extends React.Component {
  constructor() {
    super();
    this.state = {
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
      steps: [],
      isStreaming: false,
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
    };
  }

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
    setTimeout(this.seachRoute, 0);
  };

  returnToPlace = (text, value) => {
    this.setState({
      to: {
        text,
        value,
      },
    });
    setTimeout(this.seachRoute, 0);
  };

  openPlaceModal = (place, action) => {
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
    const polyline = data.legs[0].points;
    console.log('TCL: Home -> setMarkers -> polyline', polyline);
    this.setState({polyline});
  };

  seachRoute = () => {
    const {from, to} = this.state;
    console.log('TCL: Home -> seachRoute ->  from, to', from, to);
    const coords = {
      lat: this.state.latitude,
      lon: this.state.longitude,
    };
    console.log(
      'TCL: Home -> seachRoute -> from.value === {}',
      from.value === {},
    );
    if (!Object.entries(from.value).length) {
      from.value = coords;
    }
    if (!Object.entries(to.value).length) {
      to.value = coords;
    }
    this.setState({loading: true});
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${
      from.value.lat
    },${from.value.lon}:${to.value.lat},${
      to.value.lon
    }/json?instructionsType=text&avoid=unpavedRoads&key=${key}`;
    fetch(url)
      .then(res => res.json())
      .then(res => {
        console.log('TCL: Home -> seachRoute -> res', res);
        const instructions = res.routes[0].guidance.instructions;
        this.route = res.routes[0];
        this.setState({instructions, steps: instructions, loading: false});
        this.setMarkers(res.routes[0]);
      })
      .catch(err => {
        Alert.alert('Oops!', 'Something went wrong. Please try again later.');
        console.log('TCL: Home -> seachRoute -> err', err);
        this.setState({loading: false});
      });
  };

  addLog = str => {
    console.log('TCL: addLog -> str', str);
    const logs = this.state.logs;
    console.log('TCL: addLog -> logs', logs);
    this.setState({
      logs: [...this.state.logs, {msg: str}],
    });
  };

  calculateNavigation = () => {
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

    // const message = {
    //     "maneuver": data.maneuver,
    //     "message": data.message,
    //     "distance": distance,
    //     "turnAngle": data.turnAngleInDecimalDegrees,
    // }

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
    // let i;
    // for (i = 0; i <= 100; i + 10) {
    //     distances.push(i);
    // }
    // console.log('TCL: Home -> calculateNavigation -> distances', distances);
    const angles = [45, 90, -45, -90];

    const getRandom = array => {
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

  sendMockData = () => {
    // const steps = [
    //     {
    //         "maneuver": "DEPART",
    //         "message": "Leave from Ramganesh Gadkari Road"
    //     },
    //     {
    //         "maneuver": "TURN_RIGHT",
    //         "message": "Turn right onto Kasaba Peth in 100 mts"
    //     },
    //     {
    //         "maneuver": "TURN_RIGHT",
    //         "message": "Turn right onto Kasaba Peth in 90 mts"
    //     },
    //     {
    //         "maneuver": "TURN_RIGHT",
    //         "message": "Turn right onto Kasaba Peth in 80 mts"
    //     },
    //     {
    //         "maneuver": "TURN_LEFT",
    //         "message": "Turn left onto Chhatrapati Shivaji Maharaj Road/NH4"
    //     },
    //     {
    //         "maneuver": "ARRIVE_RIGHT",
    //         "message": "You have arrived. Your destination is on the right"
    //     }
    // ];
    const intervalId = BackgroundTimer.setInterval(() => {
      const {isStreaming} = this.state;
      this.fetchCurrentLocation();
      const message = this.calculateNavigation();
      if (!isStreaming) {
        console.log('Will stop sending data to server');
        BackgroundTimer.clearInterval(intervalId);
      }
      console.log('TCL: sending this....', message);
      // fetch('http://192.168.43.163:3000/send', {
      fetch('http://192.168.4.1/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })
        .then(res => res.json())
        .then(res => {
          console.log('TCL: Home -> sendMockData -> res', res);
          const body = res;
          console.log('TCL: intervalId -> body', body);
          this.addLog(JSON.stringify(body, null, 2));
        })
        .catch(err => {
          console.log('TCL: Home -> sendMockData -> err', err);
          const toString = err.toString();
          console.log('TCL: intervalId -> toString', toString);
          this.addLog(toString);
        });
    }, 2000);
  };

  startNavigation = async () => {
    // Alert.alert('Started', 'Mockdata is now being sent to the server');
    await this.setState({isStreaming: true});
    this.sendMockData();
  };

  stopNavigation = async () => {
    this.setState({isStreaming: false});
    // Alert.alert('Stopped', 'Stopped sending data to server');
    return;
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
        {this.state.isStreaming ? (
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
        followsUserLocation={this.state.isStreaming}>
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
        {/* <Button block style={styles.searchButton} onPress={this.seachRoute}>
                    <Text>Search</Text>
                </Button> */}
      </Content>
    );
  }

  renderTransmittedDate = () => {
    return (
      <Content>
        <Text>{JSON.stringify(this.state.currentInstruction, null, 2)}</Text>
      </Content>
    );
  };

  render() {
    return (
      <Container>
        {/* <Header>
                    <Body>
                        <Title>Navi</Title>
                    </Body>
                </Header> */}
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
                  <Text>Navigation</Text>
                </TabHeading>
              }>
              {this.renderInstructions(this.state.instructions)}
            </Tab>
            <Tab
              heading={
                <TabHeading>
                  <Text>Data</Text>
                </TabHeading>
              }>
              {this.renderTransmittedDate(this.state.currentInstruction)}
            </Tab>
            <Tab
              heading={
                <TabHeading>
                  <Text>Logs</Text>
                </TabHeading>
              }>
              {this.renderLogs(this.state.logs)}
            </Tab>
          </Tabs>
        </Content>
      </Container>
    );
  }
}
