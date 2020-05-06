import React from 'react';
import {Alert, StyleSheet} from 'react-native';
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
  Header,
  Left,
  Body,
  Title,
  Right,
  List,
  ListItem,
  Icon,
  Card,
  CardItem,
} from 'native-base';
import {DeviceService} from '../../services/DeviceService';
import {Colors} from '../../themes/Colors';
import {DeviceSetupCard} from '../../components/Navigation/DeviceSetupCard/DeviceSetupCard';

export class Setup extends React.Component {
  state = {
    ssid: '',
    password: '',
    loading: false,
    response: {},
    pushing: false,
  };

  submit = async () => {
    const {ssid, password} = this.state;
    if (!ssid || !password) {
      Alert.alert('Oops', "Can't have blank fields.");
      return;
    }
    this.setState({loading: true});
    const result = await DeviceService.setup(ssid, password);
    this.setState({loading: false, response: result});
    Alert.alert(
      'Done!',
      'Device settings have been changed successfully. You can now connect to the new Wifi network.',
    );
  };

  pushUpdate = async () => {
    this.setState({pushing: true});
    const body = {
      file: {
        uri: 'file://../../storage/update.bin',
        name: 'file',
      },
    };
    const result = await DeviceService.upateFirmware(body);
    this.setState({pushing: false});
    Alert.alert(
      'Done!',
      `New firmware has been pushed to your NaviCast device. You can now reconnect to the Wifi network. ${JSON.stringify(
        result,
        null,
        2,
      )}`,
    );
  };

  renderResetCard = () => {
    return (
      <Card style={styles.card}>
        <CardItem header>
          <Text style={styles.title}>Reset Wifi</Text>
        </CardItem>
        <CardItem>
          <Body>
            <Text>
              First connect your device using the existing credentials. Then
              submit the below form.
            </Text>
          </Body>
        </CardItem>
        <CardItem>
          <Form>
            <Item stackedLabel>
              <Label>SSID name</Label>
              <Input
                value={this.state.ssid}
                placeholder="Enter the new Wifi name"
                onChangeText={text => this.setState({ssid: text})}
              />
            </Item>
            <Item stackedLabel last>
              <Label>Password</Label>
              <Input
                placeholder="New password"
                value={this.state.password}
                keyboardType={'visible-password'}
                onChangeText={text => this.setState({password: text})}
              />
            </Item>
          </Form>
        </CardItem>
        <CardItem footer>
          <Left />
          <Body>
            <Button style={styles.button} onPress={this.submit}>
              {this.state.loading ? <Spinner /> : <Text>Submit</Text>}
            </Button>
          </Body>
          <Right />
        </CardItem>
      </Card>
    );
  };

  renderUpdateCard = () => {
    return (
      <Card style={styles.card}>
        <CardItem header>
          <Text style={styles.title}>Update Navicast Firmware</Text>
        </CardItem>
        <CardItem>
          <Body>
            <Text>
              After connecting to the NaviCast device via Wifi you can push
              firmware updates.
            </Text>
            <Text>
              After the update you will have to connect to the device again.
            </Text>
          </Body>
        </CardItem>
        <CardItem footer>
          <Left />
          <Body>
            <Button style={styles.button} onPress={this.pushUpdate}>
              {this.state.pushing ? <Spinner /> : <Text>Update</Text>}
            </Button>
          </Body>
          <Right />
        </CardItem>
      </Card>
    );
  };

  render() {
    return (
      <Container>
        <Header style={styles.header}>
          <Left>
            <Button transparent onPress={this.props.navigation.toggleDrawer}>
              <Icon type="MaterialCommunityIcons" name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>Device</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <List>
            <ListItem noBorder>
              <Body>
                <Text>
                  Your NaviCast device creates a Wifi network you connect to.
                  You can change the wifi name and password for security.
                </Text>
              </Body>
            </ListItem>
          </List>
          <DeviceSetupCard />
          {this.renderResetCard()}
          {this.renderUpdateCard()}
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.secondary,
  },
  button: {
    backgroundColor: Colors.secondary,
  },
  card: {},
  title: {
    fontWeight: 'bold',
  },
});
