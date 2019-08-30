import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import Joystick from './components/Joystick';

const TOPIC = '/cmd_vel';

const MIN_VEL = -2.0;
const MAX_VEL = 2.0;
const MIN_ANG = -3.0;
const MAX_ANG = 3.0;

export default class App extends React.Component {

  constructor() {
    super();

    this.state = {
      connected: false,
      activated: false,
      ip_address: "IP ADDRESS"
    };

    this.socket = null;

    this.emit = this.emit.bind(this);
    this.handleActivate = this.handleActivate.bind(this);
    this.handleConnectButton = this.handleConnectButton.bind(this);
    this.handleJoyMove = this.handleJoyMove.bind(this);
  }

  emit = (vel, ang) => {
    this.socket.send(JSON.stringify({
      op: 'publish',
      topic: TOPIC,
      msg: {
        linear: {x: vel, y: 0, z: 0},
        angular: {x: 0, y: 0, z: ang}
      }
    }));
  };

  handleActivate = () => {
    this.setState({
      activated: !this.state.activated
    });
  };

  handleConnectButton = () => {
    try {
      if (this.state.connected) {
        this.emit(0, 0);
        this.socket.close();
      }
      else {
        if (!this.socket || this.socket.readyState == WebSocket.CLOSED) {
          this.socket = new WebSocket(`ws://${this.state.ip_address}:8080`);
          this.socket.onopen = () => {
            if (!this.state.connected) {
              this.setState({
                connected: true
              });
              Alert.alert('Connected!');
            }
          };
          this.socket.onclose = () => {
            if (this.state.connected) {
              this.setState({
                connected: false
              });
              Alert.alert('Disonnected!');
            }
          };
        }
      }
    }
    catch(err) {
      console.log(err);
    }
  };

  handleJoyMove = (xVal, yVal) => {
    if (this.state.connected && this.state.activated && this.socket && this.socket.readyState == WebSocket.OPEN) {
      this.emit(yVal, xVal);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={{width: '35%'}}>
          <Joystick
            onMove={this.handleJoyMove}
            size={180}
            position={{x: 150, y: 200}}
            xMin={MIN_ANG}
            xMax={MAX_ANG}
            yMin={MIN_VEL}
            yMax={MAX_VEL}
          />
        </View>
        <View style={{width: '50%', flexDirection: 'column-reverse', paddingLeft: '15%'}}>
          <View style={{height: '50%'}}>
            <View style={{paddingBottom: 40, width: "80%"}}
            >
              <TextInput
                multiline = {false}
                onChangeText={(ip_address) => this.setState({ip_address})}
                value={this.state.ip_address}
                style={{
                  fontSize: 30,
                  borderBottomColor: '#000000',
                  borderBottomWidth: 1
                }}
              />
           </View>
            <TouchableOpacity
              onPress={this.handleConnectButton}
              style={styles.connectButton}
            >
              <Text style={styles.buttonText}>{this.state.connected ? 'Disconnect': 'Connect'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{width: '15%'}}>
          {this.state.activated ?
            <TouchableOpacity
              onPress={this.handleActivate}
              style={styles.greenButton}
            />
            :
            <TouchableOpacity
              onPress={this.handleActivate}
              style={styles.redButton}
            />
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
  },
  trackStyle: {
    borderRadius: 10,
  },
  leftSlider: {
    transform: [{ rotate:'-90deg' }],
    width: 250,
  },
  rightSlider: {
    width: 280,
    height: 50,
    transform: [{ rotate:'180deg' }],
  },
  leftSliderLabel: {
    fontSize: 20,
    left: 50,
    top: 30,
  },
  rightSliderLabel: {
    fontSize: 20,
    left: 120,
  },
  greenButton: {
    borderRadius: 40,
    height: 80,
    width: 80,
    backgroundColor: 'green',
  },
  redButton: {
    borderRadius: 40,
    height: 80,
    width: 80,
    backgroundColor: 'red',
  },
  connectButton: {
    borderRadius: 60,
    width: 170,
    padding: 30,
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});
