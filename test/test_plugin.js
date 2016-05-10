'use strict';

let assert = require('assert')
let nodejs_doc = require('../plugins/nodejs-doc')

suite('nodejs-doc', function() {

    test('index', function() {
	assert.equal('@findex fs event Foo\n@findex event fs Foo',
		     nodejs_doc.index("Event: 'Foo'", 2, {node_prefix: 'fs'}))
	assert.equal('@findex fs event fs.Foo\n@findex event fs.Foo',
		     nodejs_doc.index("Event: 'fs.Foo'", 2, {node_prefix: 'fs'}))
	assert.equal('@findex fs Class Foo',
		     nodejs_doc.index('Class: Foo', 2, {node_prefix: 'fs'}))
	assert.equal('@findex fs.foo.bar',
		     nodejs_doc.index(' fs.foo.bar(baz)    ', 2, {node_prefix: 'fs'}))
    })

})
