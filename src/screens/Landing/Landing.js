import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';

export class Landing extends React.Component {
  constructor() {
    super();
    this.checkNextStep();
  }

  checkNextStep = async () => {
    const onboarding = await AsyncStorage.getItem('onboarding');
    const setup = await AsyncStorage.getItem('setup');
    if (onboarding !== 'done') {
      this.props.navigation.navigate('Onboarding');
    } else if (setup !== 'done') {
      this.props.navigation.navigate('SetupInitial');
    } else {
      this.props.navigation.navigate('Main');
    }
  };

  render() {
    return null;
  }
}
