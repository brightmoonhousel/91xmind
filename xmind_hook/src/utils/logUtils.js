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
const log = {
  info: function (...args) {
    console.log(
      `\n`,
      colors.BrightCyan,
      "[" + new Date().toLocaleString() + "]",
      ...args,
      `\x1b[0m\n`
    );
  },
  error: function (...args) {
    console.log(`\n`, colors.Red, "[" + new Date().toLocaleString() + "]", ...args, `\x1b[0m\n`);
  }
};
module.exports = log;
