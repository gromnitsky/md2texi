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

    test('p5selectAll', function() {
	assert.deepEqual([], md2texi.p5selectAll())

	let parser = new parse5.Parser()
	let doc = parser.parseFragment('<div><p><span>foo</span></p><span>bar</span></div><span>baz</span>')

	assert.deepEqual([], md2texi.p5selectAll(doc))
	assert.deepEqual([], md2texi.p5selectAll(doc, "invalid tag name"))
	assert.equal(3, md2texi.p5selectAll(doc, "span").length)
    })

    test('htmltable2texi', function() {
	assert.equal('', md2texi.htmltable2texi())
	assert.equal('', md2texi.htmltable2texi(''))

	assert.throws(function() {
	    md2texi.htmltable2texi('bwaa')
	}, /no THs in table/)

	let table = `
<table>
<thead>
<tr>
<th>header1</th>
</tr>
</thead>
</table>
`
//	console.error(md2texi.htmltable2texi(table))
	let r = md2texi.htmltable2texi(table)
	assert.equal('@multitable @columnfractions .99\n', r[0])

	table = `
<table>
<thead>
<tr>
<th>header1</th>
<th>header2</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>1</code></td>
<td><code>2</code></td>
</tr>
</tbody>
</table>
`
//	console.error(md2texi.htmltable2texi(table).join(""))
	r = md2texi.htmltable2texi(table)
	assert.equal(`@multitable @columnfractions .50 .50
@headitem header1 @tab header2

@item
1
@tab
2

@end multitable`, r.join(""))

    })

})
