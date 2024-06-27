const colors = {
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  White: "\x1b[37m",
  BrightRed: "\x1b[91m",
  BrightGreen: "\x1b[92m",
  BrightYellow: "\x1b[93m",
  BrightBlue: "\x1b[94m",
  BrightMagenta: "\x1b[95m",
  BrightCyan: "\x1b[96m"
};
const colorsArr = [
  "\x1b[94m", // Bright Blue
  "\x1b[95m", // Bright Magenta
  "\x1b[96m", // Bright Cyan
  "\x1b[92m" // Bright Green
];

const log = {
  /**
   *
   * @param {*} 颜色 Red|Yellow|Green|Blue|Magenta|Cyan|White
   * @param  {...any} args
   */
  colors: function (...args) {
    let color = colors.BrightCyan;
    let arg = args;
    if (args.length > 1) {
      color = colors[args[0]];
      arg = args.slice(1);
    }
    console.log(
      `\n`,
      color,
      "[" + new Date().toLocaleString() + "]",
      ...args,
      `\x1b[0m\n`
    );
  },
  info: function (...args) {
    console.log(
      `\n\x1b[33m`,
      "[" + new Date().toLocaleString() + "]",
      ...args,
      `\x1b[0m\n`
    );
  },
  error: function (...args) {
    console.log(
      `\n`,
      colors.Red,
      "[" + new Date().toLocaleString() + "]",
      ...args,
      `\x1b[0m\n`
    );
  }
};
module.exports = log;
