import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Content,
  List,
  ListItem,
  Left,
  Text,
  Right,
  Icon,
  View,
} from 'native-base';
import {Colors} from '../../themes/Colors';

export class Form extends React.Component {
  openPlaceModal = type => {
    const {source, destination, navigation, changeLocationInput} = this.props;
    navigation.navigate('PlaceModal', {
      place: type === 'source' ? source : destination,
      action: (...fields) => {
        console.log('TCL: Form -> ...fields', ...fields);
        console.log('TCL: Form -> type, ...fields', type, ...fields);
        changeLocationInput(type, ...fields);
      },
    });
  };

  render() {
    const {source, destination} = this.props;
    return (
      <View style={styles.inputContainer}>
        <List>
          <ListItem
            noIndent
            style={styles.inputBox}
            onPress={this.openPlaceModal.bind(null, 'source')}>
            <Left>
              <Text style={styles.inputBoxText}>
                {!source.name ? 'From' : source.name}
              </Text>
            </Left>
            <Right>
              <Icon type="MaterialCommunityIcons" name="crosshairs-gps" />
            </Right>
          </ListItem>
          <ListItem
            noIndent
            style={styles.inputBox}
            onPress={this.openPlaceModal.bind(null, 'destination')}>
            <Left>
              <Text style={styles.inputBoxText}>
                {!destination.name ? 'To' : destination.name}
              </Text>
            </Left>
            <Right>
              <Icon type="MaterialCommunityIcons" name="map-marker" />
            </Right>
          </ListItem>
        </List>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    padding: 10,
    backgroundColor: Colors.secondary,
  },
  inputBox: {
    backgroundColor: 'white',
    borderRadius: 4,
    margin: 2,
  },
  inputBoxText: {
    color: 'gray',
  },
});
