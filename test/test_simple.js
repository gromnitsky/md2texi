'use strict';

let md2texi = require('../md2texi')

let assert = require('assert')
let fs = require('fs')

let parse5 = require('parse5')

suite('String', function() {

    setup(function() {
    })

    test('texi_escape', function () {
	assert.equal("@@@{foo@}", "@{foo}".texi_escape())
    })

    test('html_strip', function () {
	assert.equal("foobar", "foo<p\n>bar".html_strip())
    })

})
