import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ToastAndroid
} from "react-native";
import { StackNavigator } from "react-navigation";
import { Button } from "react-native-elements";
import firebase from "react-native-firebase";

export default class BetActivity extends Component {
  constructor(props) {
    super(props);
    this.ref = firebase.firestore().collection("Bets");
    this.ref2 = firebase.firestore().collection("Users");
    this.state = {
      match: this.props.navigation.state.params,
      home_score: 0,
      away_score: 0,
      user: null,
      isAdmin: false
    };
  }

  _increaseHomeScore = () => {
    this.setState(prevState => {
      return {
        home_score: prevState.home_score + 1
      };
    });
  };

  _increaseAwayScore = () => {
    this.setState(prevState => {
      return {
        away_score: prevState.away_score + 1
      };
    });
  };

  _decreaseHomeScore = () => {
    this.setState(prevState => {
      return {
        home_score:
          prevState.home_score > 0
            ? prevState.home_score - 1
            : prevState.home_score
      };
    });
  };

  _decreaseAwayScore = () => {
    this.setState(prevState => {
      return {
        away_score:
          prevState.away_score > 0
            ? prevState.away_score - 1
            : prevState.away_score
      };
    });
  };

  componentDidMount() {
    this.unsubscriber = firebase.auth().onAuthStateChanged(user => {
      this.setState({
        user
      });
      var adminQuery = this.ref2.where("email", "==", user.email);
      //This implements admin super powers
      adminQuery
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            this.setState({
              isAdmin: doc.data().isAdmin
            });
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  componentWillUnmount() {
    if (this.unsubscriber) {
      this.unsubscriber();
    }
  }

  _placeBet = () => {
    //Esto lo cambie porque no se recomienda meterse directamente con el estado
    var bet = this.state.match;
    bet.home_result = this.state.home_score;
    bet.away_result = this.state.away_score;
    bet.user = this.state.user.email;
    this.ref.add(bet).catch(err => {
      console.log(err);
    });
    ToastAndroid.show("Bet Placed", ToastAndroid.SHORT);
    this.props.navigation.pop();
  };

  _placeResult = () => {
    //Get the match unique ID
    const match = this.state.match;
    console.log(match._uid);
    const match_ref = firebase
      .firestore()
      .collection("Matches")
      .doc(match._uid);
    const data = {
      home_result: this.state.home_score,
      away_result: this.state.away_score,
      isResult: true
    };
    console.log("got here");
    match_ref.update(data).then(() => {
      console.log("Data updated");
    });

    ToastAndroid.show("Result Placed", ToastAndroid.SHORT);
    this.props.navigation.pop();
  };

  _goBack = () => {
    this.props.navigation.pop();
  };

  render() {
    const placeBetButton = (
      <TouchableOpacity
        style={styles.button}
        onPress={this.state.isAdmin ? this._placeResult : this._placeBet}
      >
        <Text style={styles.button_text2}>
          {this.state.isAdmin ? "SET RESULT" : "PLACE BET"}
        </Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.row}>
            <Text style={styles.title}> {this.state.match.home_team} </Text>
            <Text style={styles.title}> {this.state.match.away_team} </Text>
          </View>

          <View style={styles.button_row}>
            <TouchableOpacity
              style={styles.button}
              onPress={this._increaseHomeScore}
            >
              <Text style={styles.button_text}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={this._increaseAwayScore}
            >
              <Text style={styles.button_text}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row} flex={2}>
            <Text style={styles.score}> {this.state.home_score} </Text>
            <Text style={styles.score}> {this.state.away_score} </Text>
          </View>

          <View style={styles.button_row}>
            <TouchableOpacity
              style={styles.button}
              onPress={this._decreaseHomeScore}
            >
              <Text style={styles.button_text}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={this._decreaseAwayScore}
            >
              <Text style={styles.button_text}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.title}> {this.state.match.date} </Text>

          <Text style={styles.title}> {this.state.match.stadium} </Text>

          <View style={styles.row}>{placeBetButton}</View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={this._goBack}>
              <Text style={styles.button_text2}>GO BACK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 24,
    color: "#000000",
    textAlign: "center",
    flex: 1
  },
  row: {
    flexDirection: "row",
    flex: 1
  },
  button_row: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  score: {
    fontSize: 84,
    color: "#000000",
    textAlign: "center",
    flex: 1
  },
  button: {
    flex: 1,
    backgroundColor: "#000000",
    opacity: 0.75,
    alignItems: "center",
    justifyContent: "center",
    margin: 2
  },
  button_text: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold"
  },
  button_text2: {
    color: "white",
    fontSize: 24
  }
});
