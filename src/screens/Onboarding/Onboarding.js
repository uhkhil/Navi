import React from 'react';
import {StyleSheet} from 'react-native';
import OnboardingSwiper from 'react-native-onboarding-swiper';
import {Icon} from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';

import {Colors} from '../../themes/Colors';

export class Onboarding extends React.Component {
  done = () => {
    AsyncStorage.setItem('onboarding', 'done');
    this.props.navigation.navigate('SetupInitial');
  };

  render() {
    return (
      <OnboardingSwiper
        showSkip={false}
        onSkip={this.done}
        onDone={this.done}
        titleStyles={styles.title}
        subTitleStyles={styles.subTitle}
        pages={[
          {
            backgroundColor: Colors.primary,
            image: (
              <Icon
                type="MaterialCommunityIcons"
                name="map-search-outline"
                style={styles.icon}
              />
            ),
            title: 'Search route',
            subtitle: 'Look for the best route to your destination',
          },
          {
            backgroundColor: Colors.secondary,
            image: (
              <Icon
                type="MaterialCommunityIcons"
                name="wifi-strength-4"
                style={styles.icon}
              />
            ),
            title: 'Connect device',
            subtitle: 'Connect your NaviCast device via Wifi',
          },
          {
            backgroundColor: Colors.primary,
            image: (
              <Icon
                type="MaterialCommunityIcons"
                name="navigation"
                style={styles.icon}
              />
            ),
            title: 'Ride!',
            subtitle: 'Navicast gives you awesome navigation along the route',
          },
        ]}
      />
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 150,
    color: '#fff',
  },
  title: {fontWeight: 'bold'},
  subTitle: {fontSize: 20, color: '#fff', marginHorizontal: 20},
});
