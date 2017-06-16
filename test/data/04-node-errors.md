# Errors

<!--type=misc-->

Applications running in Node.js will generally experience four categories of
errors:

<a id="nodejs-error-codes"></a>
## Node.js Error Codes

<a id="ERR_INVALID_ARG_TYPE"></a>
### ERR_INVALID_ARG_TYPE

Used generically to identify that an argument of the wrong type has been passed
to a Node.js API.

<a id="ERR_INVALID_CURSOR_POS"></a>
### ERR_INVALID_CURSOR_POS

The `'ERR_INVALID_CURSOR_POS'` is thrown specifically when a cursor on a given
stream is attempted to move to a specified row without a specified column.

<a id="ERR_MISSING_ARGS"></a>
### ERR_MISSING_ARGS

Used when a required argument of a Node.js API is not passed. This is currently
only used in the [WHATWG URL API][] for strict compliance with the specification
(which in some cases may accept `func(undefined)` but not `func()`). In most
native Node.js APIs, `func(undefined)` and `func()` are treated identically, and
the [`ERR_INVALID_ARG_TYPE`][] error code may be used instead.

The `error.code` property is a string label that identifies the kind of error.
See [Node.js Error Codes][] for details about specific codes.


[`ERR_INVALID_ARG_TYPE`]: #ERR_INVALID_ARG_TYPE
[`child.kill()`]: child_process.html#child_process_child_kill_signal
[`child.send()`]: child_process.html#child_process_child_send_message_sendhandle_options_callback
[`fs.readFileSync`]: fs.html#fs_fs_readfilesync_file_options
[`fs.readdir`]: fs.html#fs_fs_readdir_path_options_callback
[`fs.unlink`]: fs.html#fs_fs_unlink_path_callback
[`fs`]: fs.html
[`http`]: http.html
[`https`]: https.html
[`libuv Error handling`]: http://docs.libuv.org/en/v1.x/errors.html
[`net`]: net.html
[`new URL(input)`]: url.html#url_constructor_new_url_input_base
[`new URLSearchParams(iterable)`]: url.html#url_constructor_new_urlsearchparams_iterable
[`process.on('uncaughtException')`]: process.html#process_event_uncaughtexception
[`process.send()`]: process.html#process_process_send_message_sendhandle_options_callback
[Node.js Error Codes]: #nodejs-error-codes
[V8's stack trace API]: https://github.com/v8/v8/wiki/Stack-Trace-API
[WHATWG URL API]: url.html#url_the_whatwg_url_api
[domains]: domain.html
[event emitter-based]: events.html#events_class_eventemitter
[file descriptors]: https://en.wikipedia.org/wiki/File_descriptor
[online]: http://man7.org/linux/man-pages/man3/errno.3.html
[stream-based]: stream.html
[syscall]: http://man7.org/linux/man-pages/man2/syscall.2.html
[try-catch]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
[vm]: vm.html
