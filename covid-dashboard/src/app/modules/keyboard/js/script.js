/* eslint-disable import/extensions */
import Keyboard from './Keyboard';

const rowsOrder = [
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Delete'],
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Backspace'/* , 'IntlBackslash' */],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'/* ,'ArrowUp', 'ShiftRight' */],
  ['Sound', 'Lang', /* 'AltLeft', */ 'Hide', 'Space', 'Voice', /* , 'AltRight' */ 'ArrowLeft', /* 'ArrowDown', */'ArrowRight'/* ,'ControlRight' */],
];

document.addEventListener('DOMContentLoaded', () => {
  new Keyboard(rowsOrder).init().generateLayout();
});
