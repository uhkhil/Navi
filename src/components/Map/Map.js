import React from 'react';
import {StyleSheet} from 'react-native';

import {Text, View, Button} from 'native-base';
import MapView, {Polyline, Marker} from 'react-native-maps';

export class Map extends React.Component {
  render() {
    const {
      region,
      currentRegion,
      polyline,
      markers,
      currentPoint,
      expectedPoint,
      mockLocation,
      nextPoint,
      getRef,
      onPanDrag,
      setCurrent,
    } = this.props;
    return (
      <View>
        <MapView
          style={styles.map}
          initialRegion={region}
          region={currentRegion}
          onPanDrag={onPanDrag}
          ref={ref => getRef(ref)}
          followsUserLocation={false}>
          <Polyline coordinates={polyline} />
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.description}
              pinColor="red"
            />
          ))}
          {expectedPoint ? (
            <Marker
              coordinate={expectedPoint}
              title="Expected"
              pinColor="darkblue"
            />
          ) : null}
          {currentPoint ? (
            <Marker
              coordinate={currentPoint}
              title="Actual"
              draggable={mockLocation}
              onDragEnd={this.onDrag}
              pinColor="lightblue"
            />
          ) : null}
          {nextPoint ? (
            <Marker coordinate={nextPoint} title="Next stop" pinColor="green" />
          ) : null}
        </MapView>
        <View style={styles.mapButtons}>
          <Button rounded onPress={setCurrent}>
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
}

const styles = StyleSheet.create({
  inputContainer: {
    padding: 10,
    backgroundColor: '#3F51B5',
  },
  searchButton: {
    marginTop: 10,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  instructionList: {
    // marginTop: 10
  },
  inputBox: {
    backgroundColor: 'white',
    borderRadius: 4,
    margin: 2,
  },
  inputBoxText: {
    color: 'gray',
  },
  map: {
    height: 400,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tabs: {
    elevation: -1,
  },
  code: {
    margin: 20,
  },
  mapButtons: {
    flexDirection: 'column-reverse',
    position: 'absolute',
    bottom: 30,
    right: 20,
    height: 125,
    justifyContent: 'space-between',
  },
});
