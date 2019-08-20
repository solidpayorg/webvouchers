"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Literal;

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/** Displays a literal by value. */
function Literal(_ref) {
  var value = _ref.value,
      props = _objectWithoutProperties(_ref, ["value"]);

  var contentType = 'text';

  if (/.jpg$|.png$/.test(value)) {
    contentType = 'image';
  }

  if (contentType === 'image') {
    return React.createElement("img", {
      src: value
    });
  } else {
    return React.createElement("span", null, value);
  }
}