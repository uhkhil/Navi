import React from 'react';
import {ActivityIndicator} from 'react-native';
import {
  Container,
  Header,
  Item,
  Input,
  Icon,
  Text,
  Content,
  List,
  ListItem,
  Right,
  Body,
} from 'native-base';
import {debounce} from 'lodash';

const key = 'QxKUhPa8OHWrKshETgGXGsjEzPZOTiGE';

export class PlaceModal extends React.Component {
  constructor() {
    super();
    this.state = {
      place: {
        text: '',
        value: {},
      },
      starredPlaces: [
        {
          text: 'Current location',
          value: {},
        },
      ],
      results: [],
      loading: false,
    };
    this.onChangeTextDelayed = debounce(
      (isFrom, searchText) => this.placeTyped(isFrom, searchText),
      1000,
    );
  }

  componentDidMount() {
    const place = this.props.navigation.getParam('place', {
      text: '',
      value: {},
    });
    this.setState({place});
    if (place && place.text) {
      this.placeTyped(place.text);
    }
  }

  selectPlace = (text, value) => {
    this.props.navigation.state.params.action(text, value);
    this.props.navigation.pop();
  };

  placeTyped = async searchString => {
    this.setState({loading: true});
    const results = await this.searchLocation(searchString);
    this.setState({loading: false});
    this.setState({
      results: results ? results : [],
    });
  };

  searchLocation = searchString => {
    const promise = new Promise((resolve, reject) => {
      const url = `https://api.tomtom.com/search/2/search/${searchString}.json?countrySet=IN&idxSet=POI&key=${key}`;
      fetch(url)
        .then(res => res.json())
        .then(res => {
          resolve(res.results);
        })
        .catch(err => {
          reject([]);
        });
    });
    return promise;
  };

  selectCurrentLocation = () => {
    this.selectPlace('Current Location', {});
  };

  renderListItems = list => {
    return list.map((item, idx) => (
      <ListItem
        key={idx}
        onPress={() => this.selectPlace(item.poi.name, item.position)}>
        <Body>
          <Text>{item.poi.name}</Text>
          <Text note numberOfLines={1}>
            {item.address.freeformAddress}
          </Text>
        </Body>
        <Right>
          <Icon name="arrow-forward" />
        </Right>
      </ListItem>
    ));
  };

  renderStarredPlace() {
    return (
      <ListItem onPress={this.selectCurrentLocation}>
        <Body>
          <Text>Current Location</Text>
        </Body>
        <Right>
          <Icon type="MaterialCommunityIcons" name="crosshairs-gps" />
        </Right>
      </ListItem>
    );
  }

  render() {
    return (
      <Container>
        <Header searchBar rounded>
          <Item>
            <Icon name="ios-search" />
            <Input
              autoFocus={true}
              placeholder="Search"
              defaultValue={this.state.place.text}
              onChangeText={this.onChangeTextDelayed}
            />
            {this.state.loading ? (
              <ActivityIndicator style={{marginRight: 10}} />
            ) : null}
          </Item>
        </Header>
        <Content>
          <List>
            {this.renderStarredPlace()}
            {this.renderListItems(this.state.results)}
          </List>
        </Content>
      </Container>
    );
  }
}
