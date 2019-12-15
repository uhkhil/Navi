import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';

export class Landing extends React.Component {
  constructor() {
    super();
    this.checkNextStep();
  }

  checkNextStep = async () => {
    const onboarding = await AsyncStorage.getItem('onboarding');
    if (onboarding === 'done') {
      this.props.navigation.navigate('Main');
    } else {
      this.props.navigation.navigate('Onboarding');
    }
  };

  render() {
    return null;
  }
}
