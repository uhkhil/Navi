import React from 'react';
import {StyleSheet} from 'react-native';
import {Icon, Text} from 'native-base';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {
  createDrawerNavigator,
  DrawerNavigatorItems,
} from 'react-navigation-drawer';

import {Navigate} from './screens/Navigate/Navigate';
import {PlaceModal} from './screens/PlaceModal/PlaceModal';
import {Setup} from './screens/Setup/Setup';
import {Onboarding} from './screens/Onboarding/Onboarding';
import {Dev} from './screens/Dev/Dev';

const MainStack = createDrawerNavigator(
  {
    Navigate: {
      screen: Navigate,
      navigationOptions: {
        drawerLabel: () => <Text style={styles.label}>Navigate</Text>,
        drawerIcon: ({tintColor}) => (
          <Icon
            type="MaterialCommunityIcons"
            style={[styles.icon, {color: tintColor}]}
            name="navigation"
          />
        ),
      },
    },
    Setup: {
      screen: Setup,
      navigationOptions: {
        drawerLabel: () => <Text style={styles.label}>NaviCast Device</Text>,
        drawerIcon: ({tintColor}) => (
          <Icon
            type="Feather"
            style={[
              styles.icon,
              {color: tintColor, transform: [{rotate: '270deg'}]},
            ]}
            name="smartphone"
          />
        ),
      },
    },
    Dev: {
      screen: Dev,
      navigationOptions: {
        drawerLabel: () => <Text style={styles.label}>Developer Settings</Text>,
        drawerIcon: ({tintColor}) => (
          <Icon
            type="MaterialCommunityIcons"
            style={[styles.icon, {color: tintColor}]}
            name="settings"
          />
        ),
      },
    },
  },
  {
    initialRouteName: 'Navigate',
    headerMode: 'none',
    contentComponent: props => (
      <DrawerNavigatorItems
        itemsContainerStyle={styles.itemsContainer}
        itemStyle={styles.item}
        {...props}
      />
    ),
  },
);

const RootStack = createStackNavigator(
  {
    Main: {
      screen: MainStack,
    },
    PlaceModal: {
      screen: PlaceModal,
    },
    Onboarding: {
      screen: Onboarding,
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    initialRouteName: 'Onboarding',
  },
);

const AppContainer = createAppContainer(RootStack);

export default AppContainer;

const styles = StyleSheet.create({
  icon: {
    fontSize: 25,
  },
  label: {
    fontSize: 20,
    margin: 15,
  },
  itemsContainer: {marginTop: 0},
  item: {padding: 5},
});
