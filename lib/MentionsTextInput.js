"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

class MentionsTextInput extends _react.Component {
  constructor() {
    super();
    this.state = {
      textInputHeight: '',
      isTrackingStarted: false,
      suggestionRowHeight: new _reactNative.Animated.Value(0),
      selection: {
        start: 0,
        end: 0
      }
    };
    this.isTrackingStarted = false;
    this.previousChar = ' ';
  }

  componentWillMount() {
    this.setState({
      textInputHeight: this.props.textInputMinHeight
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value && !nextProps.value) {
      this.resetTextbox();
    } else if (this.isTrackingStarted && !nextProps.horizontal && nextProps.suggestionsData.length !== 0) {
      const numOfRows = nextProps.MaxVisibleRowCount >= nextProps.suggestionsData.length ? nextProps.suggestionsData.length : nextProps.MaxVisibleRowCount;
      const height = numOfRows * nextProps.suggestionRowHeight;
      this.openSuggestionsPanel(height);
    } else if (nextProps.suggestionsData.length === 0) {
      this.openSuggestionsPanel(0);
    }
  }

  onChangeText(val) {
    const {
      onChangeText,
      triggerLocation,
      trigger
    } = this.props;
    const {
      isTrackingStarted
    } = this.state;
    onChangeText(val); // pass changed text back

    const lastChar = val.substr(this.state.selection.end, 1);
    const wordBoundry = triggerLocation === 'new-word-only' ? this.previousChar.trim().length === 0 : true;

    if (lastChar === trigger && wordBoundry) {
      this.startTracking();
    } else if (this.previousChar === trigger && val.substr(this.state.selection.end + 1, 1) !== trigger && val.substr(this.state.selection.end - 1, 1) !== trigger && isTrackingStarted && lastChar.trim() === '') {
      this.stopTracking();
    }

    this.previousChar = lastChar;
    this.identifyKeyword(val);
  }

  closeSuggestionsPanel() {
    _reactNative.Animated.timing(this.state.suggestionRowHeight, {
      toValue: 0,
      duration: 100
    }).start();
  }

  updateSuggestions(lastKeyword) {
    this.props.triggerCallback(lastKeyword);
  }

  identifyKeyword(val) {
    const {
      triggerLocation,
      trigger
    } = this.props;

    if (this.isTrackingStarted) {
      const boundary = triggerLocation === 'new-word-only' ? 'B' : '';
      const pattern = this.props.regex ? this.props.regex : new RegExp(`\\${boundary}${trigger}[a-z0-9_-]+|\\${boundary}${trigger}`, 'gi');
      const keywordArray = val.substr(0, this.state.selection.end + 1).match(pattern);

      if (keywordArray && !!keywordArray.length) {
        const lastKeyword = keywordArray[keywordArray.length - 1];
        this.updateSuggestions(lastKeyword);
      } else {
        this.stopTracking();
      }
    }
  }

  openSuggestionsPanel(height) {
    _reactNative.Animated.timing(this.state.suggestionRowHeight, {
      toValue: height != null ? height : this.props.suggestionRowHeight,
      duration: 100
    }).start();
  }

  startTracking() {
    this.isTrackingStarted = true;
    this.openSuggestionsPanel();
    this.setState({
      isTrackingStarted: true
    });
  }

  stopTracking() {
    this.isTrackingStarted = false;
    this.closeSuggestionsPanel();
    this.setState({
      isTrackingStarted: false
    });
  }

  resetTextbox() {
    const {
      textInputMinHeight
    } = this.props;
    this.previousChar = ' ';
    this.stopTracking();
    this.setState({
      textInputHeight: textInputMinHeight
    });
  }

  render() {
    const {
      horizontal,
      loadingComponent,
      suggestionsData,
      keyExtractor,
      renderSuggestionsRow,
      suggestionsPanelStyle = {},
      textInputStyle = {},
      textInputMinHeight,
      value,
      textInputMaxHeight,
      placeholder,
      multiline
    } = this.props;
    const {
      suggestionRowHeight,
      textInputHeight
    } = this.state;
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, null, /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
      style: [suggestionsPanelStyle, {
        height: suggestionRowHeight
      }]
    }, /*#__PURE__*/_react.default.createElement(_reactNative.FlatList, {
      keyboardShouldPersistTaps: "always",
      horizontal: horizontal,
      ListEmptyComponent: loadingComponent,
      enableEmptySections: true,
      data: suggestionsData,
      keyExtractor: keyExtractor,
      renderItem: rowData => {
        return renderSuggestionsRow(rowData, this.stopTracking.bind(this));
      }
    })), /*#__PURE__*/_react.default.createElement(_reactNative.TextInput, _extends({}, this.props, {
      onSelectionChange: event => {
        if (this.props.onSelectionChange) {
          this.props.onSelectionChange(event);
        }

        this.setState({
          selection: event.nativeEvent.selection
        });
      },
      onContentSizeChange: event => {
        this.setState({
          textInputHeight: textInputMinHeight >= event.nativeEvent.contentSize.height ? textInputMinHeight : event.nativeEvent.contentSize.height + 10
        });
      },
      ref: component => {
        this._textInput = component;
      },
      onChangeText: this.onChangeText.bind(this),
      multiline: multiline,
      value: value,
      style: [textInputStyle, {
        height: Math.min(textInputMaxHeight, textInputHeight)
      }],
      placeholder: placeholder ? placeholder : 'Write a comment...'
    })));
  }

}

exports.default = MentionsTextInput;
MentionsTextInput.propTypes = {
  textInputStyle: _reactNative.TextInput.propTypes.style,
  suggestionsPanelStyle: _reactNative.ViewPropTypes.style,
  loadingComponent: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.element]),
  textInputMinHeight: _propTypes.default.number,
  textInputMaxHeight: _propTypes.default.number,
  trigger: _propTypes.default.string.isRequired,
  regex: _propTypes.default.instanceOf(RegExp),
  triggerLocation: _propTypes.default.oneOf(['new-word-only', 'anywhere']).isRequired,
  value: _propTypes.default.string,
  onChangeText: _propTypes.default.func.isRequired,
  triggerCallback: _propTypes.default.func.isRequired,
  renderSuggestionsRow: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.element]).isRequired,
  suggestionsData: _propTypes.default.array.isRequired,
  keyExtractor: _propTypes.default.func.isRequired,
  horizontal: _propTypes.default.bool,
  suggestionRowHeight: _propTypes.default.number.isRequired,

  MaxVisibleRowCount(props, propName, componentName) {
    if (!props.horizontal && !props.MaxVisibleRowCount) {
      return new Error("Prop 'MaxVisibleRowCount' is required if horizontal is set to false.");
    }
  },

  multiline: _propTypes.default.bool
};
MentionsTextInput.defaultProps = {
  textInputStyle: {
    borderColor: '#ebebeb',
    borderWidth: 1,
    fontSize: 15
  },
  suggestionsPanelStyle: {
    backgroundColor: 'rgba(100,100,100,0.1)'
  },
  loadingComponent: () => /*#__PURE__*/_react.default.createElement(_reactNative.Text, null, "Loading..."),
  textInputMinHeight: 30,
  textInputMaxHeight: 80,
  horizontal: true,
  multiline: true
};