import React from 'react';
import {View, Button, Text, List, ListItem} from 'native-base';

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
    const {route, startNavigation, isNavigating} = this.props;
    return route.length ? (
      <View>
        {this.renderInstructions(route)}
        {isNavigating ? (
          <Button full large danger onPress={startNavigation.bind(null, false)}>
            <Text>Stop</Text>
          </Button>
        ) : (
          <Button full large success onPress={startNavigation.bind(null, true)}>
            <Text>Start</Text>
          </Button>
        )}
      </View>
    ) : null;
  }
}
