# Query String

	Stability: 2 - Stable

<!--name=querystring-->

This module provides utilities for dealing with query strings.
It provides the following methods:

## querystring.escape

The escape function used by `querystring.stringify`,
provided so that it could be overridden if necessary.

## `querystring`.stringify(obj[, sep][, eq][, options])

Optionally override the default separator (`'&'`) and assignment (`'='`)
characters.

Options object may contain `encodeURIComponent`
property (`querystring.escape` by default),

### Example:

```js
// Suppose gbkEncodeURIComponent function already exists,
// it can encode string with `gbk` encoding
querystring.stringify({ w: '中文', foo: 'bar' }, null, null,
  { encodeURIComponent: gbkEncodeURIComponent })
// returns 'w=%D6%D0%CE%C4&foo=bar'
```

## querystring.unescape

The unescape function used by `querystring.parse`,
provided so that it could be overridden if necessary.

### `decodeURIComponent`

It will try to use `decodeURIComponent` in the first place,

#### but

but if that fails it falls back to a safer equivalent that
doesn't throw on malformed URLs.

# Level 1

Again!
