import React from 'react';
import {StyleSheet} from 'react-native';
import {
  List,
  ListItem,
  Left,
  Text,
  Icon,
  View,
  Button,
  Body,
} from 'native-base';
import {Colors} from '../../themes/Colors';

export class Form extends React.Component {
  openPlaceModal = type => {
    const {source, destination, navigation, changeLocationInput} = this.props;
    navigation.navigate('PlaceModal', {
      place: type === 'source' ? source : destination,
      action: (...fields) => {
        changeLocationInput(type, ...fields);
      },
    });
  };

  render() {
    const {source, destination, openMenu} = this.props;
    return (
      <View style={styles.inputContainer}>
        <List>
          <ListItem
            noIndent
            icon
            style={styles.inputBox}
            onPress={this.openPlaceModal.bind(null, 'source')}>
            <Left>
              <Button transparent onPress={openMenu}>
                <Icon
                  style={styles.iconMenu}
                  type="MaterialCommunityIcons"
                  name="menu"
                />
              </Button>
            </Left>
            <Body>
              <Text style={styles.inputBoxText}>
                {!source.name ? 'Current Location' : source.name}
              </Text>
            </Body>
          </ListItem>
          <ListItem
            item
            icon
            noIndent
            style={styles.inputBox}
            onPress={this.openPlaceModal.bind(null, 'destination')}>
            <Left>
              <Button transparent>
                <Icon
                  style={styles.iconMenu}
                  type="MaterialCommunityIcons"
                  name="map-marker"
                />
              </Button>
            </Left>
            <Body>
              <Text style={styles.inputBoxText}>
                {!destination.name ? 'To' : destination.name}
              </Text>
            </Body>
          </ListItem>
        </List>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconMenu: {
    color: 'gray',
    fontSize: 25,
  },
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
