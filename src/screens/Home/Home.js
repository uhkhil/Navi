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
  CheckBox,
  Body,
  View,
} from 'native-base';
import SystemSetting from 'react-native-system-setting';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

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
import {styles} from './HomeStyles';
import {Navigation} from '../../components/Navigation/Navigation';

const getLocation = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(position => {
      resolve(position);
    });
  });

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
    currentRegion: {
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
    this.setState({
      polyline,
    });
    const currentRegion = getRegionForCoordinates(polyline);
    this.mapView.animateToRegion(currentRegion, 1000);
    setTimeout(() => {
      this.setState({currentRegion});
    }, 1001);
  };

  startNavigation = value => {
    this.setState({isNavigating: value});
    if (value) {
      this.calculateNavigation();
    } else {
      Geolocation.stopObserving();
    }
  };

  calculateNavigation = async () => {
    const {mock, route, mockLocation} = this.state;
    const points = route.map(r => r.point);

    Geolocation.watchPosition(
      async position => {
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
        this.setState({currentInstruction: messageObj});
        await sendData(messageObj);
      },
      err => {
        console.warn(err);
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

  sendTestData = () => {
    const obj = {
      distance: '2 km',
    };
    console.log('TCL: Home -> sendTestData -> obj', obj);
    sendData(obj)
      .then(res => {
        console.log('TCL: Home -> sendTestData -> res', res);
        this.setState({testResult: res});
      })
      .catch(err => {
        console.warn('TCL: Home -> sendTestData -> err', err);
        this.setState({testResult: err});
      });
  };

  onPanDrag = event => {
    this.setState({followUser: false, currentRegion: null});
  };

  setupDevice = () => {
    this.props.navigation.navigate('Setup');
  };

  renderMap() {
    return (
      <View>
        <MapView
          style={styles.map}
          initialRegion={this.state.region}
          region={this.state.currentRegion}
          onPanDrag={this.onPanDrag}
          ref={map => {
            this.mapView = map;
          }}
          // region={this.state.region}
          followsUserLocation={false}>
          <Polyline coordinates={this.state.polyline} />
          {this.state.markers.map((marker, idx) => (
            <Marker
              key={idx}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.description}
              pinColor="red"
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
              onDragEnd={this.onDrag}
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
        <View style={styles.mapButtons}>
          <Button rounded onPress={this.setCurrent}>
            <Text>Current</Text>
          </Button>
          {/* {this.state.followUser ? null : (
            <Button rounded onPress={this.recenter}>
              <Text>Recenter</Text>
            </Button>
          )} */}
        </View>
      </View>
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
      <View style={styles.code}>
        <Text>{JSON.stringify(data, null, 2)}</Text>
      </View>
    );
  };

  renderSettings = () => {
    return (
      <List>
        <ListItem header>
          <Body>
            <Text>Settings</Text>
          </Body>
        </ListItem>
        <ListItem>
          <CheckBox
            checked={this.state.mock}
            onPress={() => this.setState({mock: !this.state.mock})}
          />
          <Body>
            <Text>Mock data</Text>
          </Body>
        </ListItem>
        <ListItem>
          <CheckBox
            checked={this.state.mockLocation}
            onPress={() =>
              this.setState({mockLocation: !this.state.mockLocation})
            }
          />
          <Body>
            <Text>Draggable current location</Text>
          </Body>
        </ListItem>
        <ListItem>
          <Button primary onPress={this.sendTestData}>
            <Text> Send test data </Text>
          </Button>
        </ListItem>
        <ListItem>
          <View style={styles.code}>
            <Text>{JSON.stringify(this.state.testResult, null, 2)}</Text>
          </View>
        </ListItem>
        <ListItem>
          <Button primary onPress={this.setupDevice}>
            <Text> Setup device </Text>
          </Button>
        </ListItem>
      </List>
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
              <Navigation
                route={this.state.route}
                startNavigation={this.startNavigation}
                isNavigating={this.state.isNavigating}
              />
            </Tab>
            <Tab
              heading={
                <TabHeading>
                  <Text>Data</Text>
                </TabHeading>
              }>
              <Content>
                {this.renderTransmittedData(this.state.currentInstruction)}
                {this.renderSettings()}
              </Content>
            </Tab>
          </Tabs>
        </Content>
      </Container>
    );
  }
}
