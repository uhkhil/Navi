import React from 'react';
import {StyleSheet} from 'react-native';
import OnboardingSwiper from 'react-native-onboarding-swiper';
import {Icon} from 'native-base';

export class Onboarding extends React.Component {
  done = () => {
    this.props.navigation.navigate('Navigate');
  };

  render() {
    return (
      <OnboardingSwiper
        showSkip={true}
        onSkip={this.done}
        onDone={this.done}
        titleStyles={styles.title}
        subTitleStyles={styles.subTitle}
        pages={[
          {
            backgroundColor: '#03c5be',
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
            backgroundColor: '#073b60',
            image: (
              <Icon
                type="MaterialCommunityIcons"
                name="bluetooth-connect"
                style={styles.icon}
              />
            ),
            title: 'Connect device',
            subtitle: 'Connect your NaviCast device via Bluetooth',
          },
          {
            backgroundColor: '#03c5be',
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
  subTitle: {fontSize: 20, color: '#fff'},
});
