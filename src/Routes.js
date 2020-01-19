import React from 'react';
import {StyleSheet} from 'react-native';
import {Icon, Text, View} from 'native-base';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {
  createDrawerNavigator,
  DrawerNavigatorItems,
  DrawerItems,
} from 'react-navigation-drawer';

import {PlaceModal} from './screens/PlaceModal/PlaceModal';
import {Setup} from './screens/Setup/Setup';
import {Onboarding} from './screens/Onboarding/Onboarding';
import {Dev} from './screens/Dev/Dev';
import {Main} from './screens/Main/Main';
import {Landing} from './screens/Landing/Landing';
import {Colors} from './themes/Colors';
import {SetupInitial} from './screens/SetupInitial/SetupInitial';

const MainStack = createDrawerNavigator(
  {
    Navigate: {
      screen: Main,
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
    // Dev: {
    //   screen: Dev,
    //   navigationOptions: {
    //     drawerLabel: () => <Text style={styles.label}>Developer Settings</Text>,
    //     drawerIcon: ({tintColor}) => (
    //       <Icon
    //         type="MaterialCommunityIcons"
    //         style={[styles.icon, {color: tintColor}]}
    //         name="settings"
    //       />
    //     ),
    //   },
    // },
  },
  {
    initialRouteName: 'Navigate',
    headerMode: 'none',
    contentComponent: props => (
      <React.Fragment>
        <View style={styles.menuBanner}>
          <Text style={styles.menuBannerText}>Navi</Text>
        </View>
        <DrawerItems
          itemsContainerStyle={styles.itemsContainer}
          itemStyle={styles.item}
          {...props}>
          {props.children}
        </DrawerItems>
      </React.Fragment>
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
    SetupInitial: {
      screen: SetupInitial,
    },
    Landing: {
      screen: Landing,
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    initialRouteName: 'Landing',
  },
);

const AppContainer = createAppContainer(RootStack);

export default AppContainer;

const styles = StyleSheet.create({
  icon: {
    fontSize: 25,
  },
  label: {
    fontSize: 18,
    margin: 15,
  },
  itemsContainer: {marginTop: 0},
  item: {padding: 5},
  menuBanner: {
    height: 120,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
  },
  menuBannerText: {
    color: 'white',
    fontSize: 30,
    marginLeft: 40,
  },
});
