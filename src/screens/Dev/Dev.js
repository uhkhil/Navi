import React from 'react';
import {Container, Text, List, ListItem, Button, View} from 'native-base';
import {DeviceService} from '../../services/DeviceService';
import {NavigationService} from '../../services/NavigationService';

export class Dev extends React.Component {
  sendTestData = () => {
    const obj = NavigationService.createMockNavigationData();
    DeviceService.sendData(obj)
      .then(res => {
        this.setState({testResult: res});
      })
      .catch(err => {
        this.setState({testResult: err});
      });
  };

  render() {
    return (
      <Container>
        <List>
          <ListItem>
            <Button primary onPress={this.sendTestData}>
              <Text> Send mock data </Text>
            </Button>
          </ListItem>
          <ListItem>
            <View>
              <Text>{JSON.stringify(this.state.testResult, null, 2)}</Text>
            </View>
          </ListItem>
        </List>
      </Container>
    );
  }
}
