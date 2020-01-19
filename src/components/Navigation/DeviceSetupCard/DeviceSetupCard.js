import React from 'react';
import {Card, CardItem, Text, Body} from 'native-base';
import {StyleSheet} from 'react-native';

export class DeviceSetupCard extends React.Component {
  render() {
    return (
      <Card>
        <CardItem header>
          <Text style={styles.title}>Setup device</Text>
        </CardItem>
        <CardItem bordered>
          <Body>
            <Text>
              NaviCast connects via WIFi. Please connect to the WiFi SSID
              mentioned in your device manual. You can change the password
              later.
            </Text>
          </Body>
        </CardItem>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  card: {},
  title: {
    fontWeight: 'bold',
  },
});
