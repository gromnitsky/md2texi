'use strict';

let assert = require('assert')
let nodejs_doc = require('../plugins/nodejs-doc')

suite('nodejs-doc', function() {

    test('index', function() {
	assert.deepEqual(['@findex fs event Foo', '@findex event fs Foo'],
		     nodejs_doc.index("Event: 'Foo'", 2, {node_prefix: 'fs'}).data)
	assert.deepEqual(['@findex fs event fs.Foo', '@findex event fs.Foo'],
		     nodejs_doc.index("Event: 'fs.Foo'", 2, {node_prefix: 'fs'}).data)
	assert.equal('@findex fs Class Foo',
		     nodejs_doc.index('Class: Foo', 2, {node_prefix: 'fs'}).data)
	assert.equal('@findex fs.foo.bar',
		     nodejs_doc.index(' fs.foo.bar(baz)    ', 2, {node_prefix: 'fs'}).data)
    })

    test('html', function() {
	assert.deepEqual({args: [], data: '', terminal: false}, nodejs_doc.html())
	assert.deepEqual({args: [''], data: '', terminal: false}, nodejs_doc.html(''))

	assert.deepEqual({
	    args: null,
	    data: `\n@smallindentedblock\nAdded in: v5.3.0, v4.2.0; Deprecated since: v2.0.0\n@end smallindentedblock\n`,
	    terminal: true
	}, nodejs_doc.html(`<!-- YAML
added:
  - v5.3.0
  - v4.2.0
deprecated: v2.0.0
-->`))

	assert.deepEqual({
	    args: null,
	    data: '',
	    terminal: true
	}, nodejs_doc.html(`<!-- YAML
type: property
name: [index]
-->`))
    })

})
