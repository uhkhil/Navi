import React from 'react';
import {Alert} from 'react-native';
import {
  Container,
  Text,
  Content,
  Form,
  Item,
  Label,
  Input,
  Button,
  Spinner,
} from 'native-base';
import {setup} from '../../services/Device';

export class Setup extends React.Component {
  // TODO: Fetch current
  state = {
    ssid: 'theblackbox',
    password: 'somepass',
    loading: false,
    response: {},
  };

  submit = async () => {
    const {ssid, password} = this.state;
    if (!ssid || !password) {
      Alert.alert('Oops', "Can't have blank fields.");
      return;
    }
    this.setState({loading: true});
    const result = await setup(ssid, password);
    this.setState({loading: false, response: result});
    if (result.status) {
      Alert.alert('Success', 'Device settings have been changed successfully');
    } else {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  render() {
    return (
      <Container>
        <Content>
          <Form>
            <Item stackedLabel>
              <Label>SSID name</Label>
              <Input
                value={this.state.ssid}
                onChangeText={text => this.setState({ssid: text})}
              />
            </Item>
            <Item stackedLabel last>
              <Label>Password</Label>
              <Input
                value={this.state.password}
                keyboardType={'visible-password'}
                onChangeText={text => this.setState({password: text})}
              />
            </Item>
          </Form>
          <Button onPress={this.submit}>
            {this.state.loading ? <Spinner /> : <Text>Setup</Text>}
          </Button>
          <Text>{JSON.stringify(this.state.response, null, 2)}</Text>
        </Content>
      </Container>
    );
  }
}
