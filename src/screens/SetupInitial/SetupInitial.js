import React from 'react';
import {StyleSheet} from 'react-native';
import {Text, Container, Content, Button} from 'native-base';
import {DeviceSetupCard} from '../../components/Navigation/DeviceSetupCard/DeviceSetupCard';
import AsyncStorage from '@react-native-community/async-storage';
import {Colors} from '../../themes/Colors';

export class SetupInitial extends React.Component {
  goHome = () => {
    AsyncStorage.setItem('setup', 'done');
    this.props.navigation.navigate('Main');
  };

  render() {
    return (
      <Container style={styles.container}>
        <Content>
          <DeviceSetupCard />
          <Button full primary style={styles.button} onPress={this.goHome}>
            <Text>Done</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    width: 150,
    alignSelf: 'center',
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
