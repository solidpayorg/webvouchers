"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Literal = Literal;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/** Displays a literal by value. */
function Literal(props) {
  return _react["default"].createElement("span", null, props.value);
}
