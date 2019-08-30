import React from "react";
import { View } from "react-native";
import { MultiTouchView } from 'expo-multi-touch';

const OUTER_COLOR = 'rgba(255, 145, 0, 0.5)';
const INNER_COLOR = 'rgba(255, 145, 0, 1)';

export default class Joystick extends React.Component {
  constructor() {
    super();

    this.state = {
      thumbPos: {
        x: 0,
        y: 0
      }
    };
    this.touching = false;
    this.withinBoundaries = this.withinBoundaries.bind(this);
    this.calculateVals = this.calculateVals.bind(this);
  }

  componentDidMount () {
    this.setState({ thumbPos: this.props.position });
    this.top = this.props.position.y - this.props.size/2;
    this.left = this.props.position.x - this.props.size/2;
    this.bottom = this.props.position.y + this.props.size/2;
    this.right = this.props.position.x + this.props.size/2;
  }

  withinBoundaries = (x, y) => {
    return x>this.left && x<this.right && y>this.top && y<this.bottom;
  };

  calculateVals = (touchX, touchY) => {
    let xVal = -1*(this.props.xMin + (touchX-this.left)/(this.props.size)*(this.props.xMax-this.props.xMin));
    xVal = Math.min(Math.max(xVal, this.props.xMin), this.props.xMax);
    let yVal = -1*(this.props.yMin + (touchY-this.top)/(this.props.size)*(this.props.yMax-this.props.yMin));
    yVal = Math.min(Math.max(yVal, this.props.yMin), this.props.yMax);

    return {xVal, yVal};
  };

  touchProps = {
    onTouchBegan: event => {
      let touchX = event.pageX;
      let touchY = event.pageY;

      if (this.withinBoundaries(touchX, touchY)) {
        this.touching = true;
        this.setState({ thumbPos: { x: touchX, y: touchY } });

        let {xVal, yVal} = this.calculateVals(touchX, touchY);
        this.props.onMove(xVal, yVal);
      }
    },
    onTouchMoved: event => {
      let touchX = event.pageX;
      let touchY = event.pageY;

      if (this.touching) {
        // if (this.withinBoundaries(touchX, touchY))
          this.setState({ thumbPos: { x: touchX, y: touchY } });

        let {xVal, yVal} = this.calculateVals(touchX, touchY);
        this.props.onMove(xVal, yVal);
      }
    },
    onTouchEnded: event => {
      this.setState({ thumbPos: this.props.position });
      this.touching = false;

      this.props.onMove(0, 0);
    },
    onTouchCancelled: event => {
      this.setState({ thumbPos: this.props.position });
      this.touching = false;

      this.props.onMove(0, 0);
    },
    onTouchesBegan: () => {},
    onTouchesMoved: () => {},
    onTouchesEnded: () => {},
    onTouchesCancelled: () => {},
  };

  render() {
    return (
      <MultiTouchView
        style={{
          flex: 1,
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        {...this.touchProps}
      >
        <View style={{
          position: 'absolute',
          top: this.props.position.y - this.props.size/2,
          left: this.props.position.x - this.props.size/2,
          height: this.props.size,
          width: this.props.size,
          borderRadius: this.props.size/2,
          backgroundColor: OUTER_COLOR
          }}
        />
        <View style={{
          position: 'absolute',
          top: this.state.thumbPos.y - this.props.size/4,
          left: this.state.thumbPos.x - this.props.size/4,
          height: this.props.size/2,
          width: this.props.size/2,
          borderRadius: this.props.size/4,
          backgroundColor: INNER_COLOR
          }}
        />
      </MultiTouchView>
    );
  }
}
