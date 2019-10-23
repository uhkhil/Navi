import {Home} from './src/screens/Home/Home';
import {createAppContainer} from 'react-navigation';
import {PlaceModal} from './src/screens/PlaceModal/PlaceModal';
import {createStackNavigator} from 'react-navigation-stack';

const MainStack = createStackNavigator(
  {
    Home,
    // Details: DetailsScreen
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
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
  },
  {
    mode: 'modal',
    headerMode: 'none',
  },
);

const AppContainer = createAppContainer(RootStack);

export default AppContainer;
