# String-padding

Padding strings in [node](http://nodejs.org/).

## Installation

`$ npm install string-padding`

## Usage

    var pad = require('string-padding');
    pad(string [, length [, padding [, side ]]]);

- **string**: A string of text of any length.
- **length** (optional): The length the output string should be. It doesn’t truncate the original string.
- **padding** (optional): The character(s) for padding. You can go crazy with multiple characters ;)
- **side** (optional): The side which should be padded; `pad.LEFT`, `pad.RIGHT` or `pad.BOTH`.

## Extending core String object

For those who are fine with extending the core String object, you can do just that. Note you can skip the first parameter and directly call `.pad()` on a string.

```javascript
var pad = require('string-padding');
String.prototype.pad = pad.prototype;

'Hello World!'.pad(16, '0'); // 0000Hello World!
```

Happy padding! :)