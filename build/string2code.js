function stringToCharCodeArray(str) {
  var charCodeArray = [];
  for (var i = 0; i < str.length; i++) {
    charCodeArray.push(str.charCodeAt(i));
  }
  return `String.fromCharCode(${charCodeArray.join(",")})`;
}
console.log(stringToCharCodeArray("-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDELel8VBfyRQowc9b1Lfi4LMjB\n7i0w9cvWMWJQesLcrEoIKwVvgp4tX4zQ97BmnoC5lGDrBLPC/EgcXjmz2Vu/94FQ\n0VaLjAhnJeyinaW5wNZrKm391eb6fjnX7/cjOe8/pb8HklmPfsshgTpw/PE1gJ6b\ncg7UybMtyPn2pTuCrQIDAQAB\n-----END PUBLIC KEY-----")); // "Hello World"
