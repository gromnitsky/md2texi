# UDP / Datagram Sockets

## Class: dgram.Socket

### socket.ref()
<!-- YAML
added: v0.9.1
-->

By default, binding a socket will cause it to block the Node.js process from
exiting as long as the socket is open. The `socket.unref()` method can be used
to exclude the socket from the reference counting that keeps the Node.js
process active. The `socket.ref()` method adds the socket back to the reference
counting and restores the default behavior.

Calling `socket.ref()` multiples times will have no additional effect.

The `socket.ref()` method returns a reference to the socket so calls can be
chained.

### socket.send(msg, [offset, length,] port [, address] [, callback])
<!-- YAML
added: v0.1.99
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11985
    description: The `msg` parameter can be an Uint8Array now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10473
    description: The `address` parameter is always optional now.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5929
    description: On success, `callback` will now be called with an `error`
                 argument of `null` rather than `0`.
  - version: v5.7.0
    pr-url: https://github.com/nodejs/node/pull/4374
    description: The `msg` parameter can be an array now. Also, the `offset`
                 and `length` parameters are optional now.
-->

* `msg` {Buffer|Uint8Array|string|array} Message to be sent
* `offset` {number} Integer. Optional. Offset in the buffer where the message starts.
* `length` {number} Integer. Optional. Number of bytes in the message.
* `port` {number} Integer. Destination port.
* `address` {string} Destination hostname or IP address. Optional.
* `callback` {Function} Called when the message has been sent. Optional.

Broadcasts a datagram on the socket. The destination `port` and `address` must
be specified.

## `dgram` module functions

### dgram.createSocket(options[, callback])
<!-- YAML
added: v0.11.13
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/14560
    description: The `lookup` option is supported.
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/13623
    description: `recvBufferSize` and `sendBufferSize` options are supported now.
-->

* `options` {Object} Available options are:
  * `type` {string} The family of socket. Must be either `'udp4'` or `'udp6'`.
    Required.
  * `reuseAddr` {boolean} When `true` [`socket.bind()`][] will reuse the
    address, even if another process has already bound a socket on it. Optional.
    Defaults to `false`.
  * `recvBufferSize` {number} - Optional. Sets the `SO_RCVBUF` socket value.
  * `sendBufferSize` {number} - Optional. Sets the `SO_SNDBUF` socket value.
  * `lookup` {Function} Custom lookup function. Defaults to [`dns.lookup()`][].
    Optional.
* `callback` {Function} Attached as a listener for `'message'` events. Optional.
* Returns: {dgram.Socket}

Creates a `dgram.Socket` object.

[`'close'`]: #dgram_event_close
[`Error`]: errors.html#errors_class_error
[`EventEmitter`]: events.html
[`close()`]: #dgram_socket_close_callback
[`cluster`]: cluster.html
[`dgram.Socket#bind()`]: #dgram_socket_bind_options_callback
[`dgram.createSocket()`]: #dgram_dgram_createsocket_options_callback
[`dns.lookup()`]: dns.html#dns_dns_lookup_hostname_options_callback
[`socket.address().address`]: #dgram_socket_address
[`socket.address().port`]: #dgram_socket_address
[`socket.bind()`]: #dgram_socket_bind_port_address_callback
[`System Error`]: errors.html#errors_class_system_error
[byte length]: buffer.html#buffer_class_method_buffer_bytelength_string_encoding
[IPv6 Zone Indices]: https://en.wikipedia.org/wiki/IPv6_address#Link-local_addresses_and_zone_indices
[RFC 4007]: https://tools.ietf.org/html/rfc4007
