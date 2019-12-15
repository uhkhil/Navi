import React from 'react';
import {StyleSheet} from 'react-native';
import {View, Text, List, ListItem, Content} from 'native-base';
import {ScrollView} from 'react-native-gesture-handler';
import {Colors} from '../../themes/Colors';

export class Navigation extends React.Component {
  renderInstructions = instructions => {
    return instructions.length ? (
      <List>
        <ListItem bordered itemDivider>
          <Text>Steps</Text>
        </ListItem>
        {instructions.map((instuct, inx) => {
          return (
            <ListItem key={inx}>
              <Text>{instuct.message}</Text>
            </ListItem>
          );
        })}
      </List>
    ) : null;
  };

  render() {
    const {route} = this.props;
    return route.length ? (
      <ScrollView>{this.renderInstructions(route)}</ScrollView>
    ) : (
      <View style={styles.noDataContainer}>
        <Text style={styles.noData}>Where would you like to go, today?</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  noDataContainer: {
    backgroundColor: '#eee',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noData: {
    fontSize: 22,
    textAlign: 'center',
    color: 'darkgray',
  },
});
