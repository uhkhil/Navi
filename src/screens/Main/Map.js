import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Icon, Button, Text} from 'native-base';
import MapView, {Polyline, Marker} from 'react-native-maps';
import {Colors} from '../../themes/Colors';
import {NavigationService} from '../../services/NavigationService';

export class Map extends React.Component {
  state = {
    region: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    currentRegion: {},
    polyline: [],
    touched: false,
  };

  componentDidUpdate(prevProps, prevState) {
    const {route, currentLocation} = this.props;
    const {touched} = this.state;
    if (route !== prevProps.route) {
      this.mapRef.animateToRegion(
        NavigationService.getRegionForCoordinates(route),
        1000,
      );
    }
    if (currentLocation !== prevProps.currentLocation && !touched) {
      this.mapRef.animateToRegion(
        {
          ...prevState.region,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        1000,
      );
    }
  }

  setCurrent = () => {
    const {currentLocation} = this.props;
    const {region} = this.state;
    this.mapRef.animateToRegion({...region, ...currentLocation}, 1000);
    setTimeout(() => {
      this.setState({touched: false});
    }, 1000);
  };

  panDrag = () => {
    this.setState({touched: true});
  };

  render() {
    const {
      source,
      destination,
      routeFetched,
      routeFetching,
      route,
      routeComplete,
      toggleNavigation,
      isNavigating,
      currentLocation,
      expectedLocation,
      nextLocation,
    } = this.props;
    const {region, touched} = this.state;
    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          onPanDrag={this.panDrag}
          ref={ref => {
            this.mapRef = ref;
          }}>
          {routeFetched ? (
            <Polyline
              coordinates={routeComplete}
              strokeWidth={3}
              strokeColor={Colors.primary}
              lineJoin="round"
              lineCap="round"
            />
          ) : null}
          {routeFetched &&
          destination.coords &&
          destination.coords.latitude !== undefined ? (
            <Marker
              coordinate={destination.coords}
              title="Destination"
              pinColor="red"
            />
          ) : null}
          {routeFetched &&
          source.coords &&
          source.coords.latitude !== undefined ? (
            <Marker
              coordinate={source.coords}
              title="Source"
              pinColor={Colors.secondary}
            />
          ) : null}
          {currentLocation ? (
            <Marker
              coordinate={currentLocation}
              title="Actual"
              //   draggable={mockLocation}
              //   onDragEnd={this.onDrag}
              pinColor="lightblue">
              <Icon
                type="MaterialCommunityIcons"
                name="circle-slice-8"
                style={styles.iconCurrent}
              />
            </Marker>
          ) : null}
          {nextLocation ? (
            <Marker
              coordinate={nextLocation}
              title="Next stop"
              pinColor="green"
            />
          ) : null}
          {expectedLocation ? (
            <Marker
              coordinate={expectedLocation}
              title="Expected"
              pinColor="blue"
            />
          ) : null}
        </MapView>
        <View style={styles.mapButtons}>
          {touched ? (
            <Button
              icon
              rounded
              onPress={this.setCurrent}
              style={styles.button}>
              <Icon
                type="MaterialIcons"
                name="my-location"
                style={styles.icon}
              />
            </Button>
          ) : null}
        </View>
        {routeFetched ? (
          <Button
            iconLeft
            rounded
            onPress={toggleNavigation.bind(null, !isNavigating)}
            style={[
              styles.buttonNavigate,
              !isNavigating ? styles.start : styles.stop,
            ]}>
            {!isNavigating ? (
              <Icon
                type="MaterialCommunityIcons"
                name="navigation"
                style={styles.icon}
              />
            ) : null}
            <Text style={styles.buttonNavigateText}>
              {isNavigating ? 'Stop' : 'Go'}
            </Text>
          </Button>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapButtons: {
    flexDirection: 'column-reverse',
    position: 'absolute',
    bottom: 30,
    right: 20,
    height: 125,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: Colors.secondary,
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonNavigate: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonNavigateText: {
    fontWeight: 'bold',
  },
  start: {
    backgroundColor: Colors.primary,
  },
  stop: {
    backgroundColor: '#da0404',
  },
  icon: {},
  iconCurrent: {
    color: Colors.secondary,
    fontSize: 20,
    fontWeight: 'bold',
    // marginTop: 10,
    // borderColor: Colors.primary,
    // borderWidth: 1,
    // borderRadius: 100,
  },
});
