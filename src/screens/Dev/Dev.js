import React from 'react';
import {Container, Text, List, ListItem, Button, View} from 'native-base';
import {sendData} from '../../services/Device';
import {createMockNavigationData} from '../../services/Navigation';

export class Dev extends React.Component {
  sendTestData = () => {
    const obj = createMockNavigationData();
    sendData(obj)
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
