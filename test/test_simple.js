'use strict';

let md2texi = require('../md2texi')

let assert = require('assert')
let fs = require('fs')
let util = require('util')

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
	assert.equal('\n@multitable @columnfractions .99\n', r[0])

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
	assert.equal(`
@multitable @columnfractions .50 .50
@headitem header1 @tab header2

@item
1
@tab
2

@end multitable
`, r.join(""))

    })

    test('TexiNodeIdGenerator.get', function () {
	assert.throws(function() {
	    new md2texi.TexiNodeIdGenerator()
	}, /file is required/)

	let t = new md2texi.TexiNodeIdGenerator('foo bar.markdown')
	assert.equal('foo-bar', t.prefix())

	assert.equal('foo-bar__foo', t.get('_foo'))
	assert.equal('foo-bar__foo_1', t.get('_foo'))
	assert.equal('foo-bar__foo_2', t.get('_foo'))
	assert.equal('foo-bar__foo_3', t.get('_foo     '))
	assert.equal('foo-bar_class_foo', t.get('  Class: Foo!  '))

    })

    test('TexiNodeIdGenerator.index', function () {
	let t = new md2texi.TexiNodeIdGenerator('fs')

	assert.equal('@findex fs event Foo\n@findex event fs Foo',
		     t.index("Event: 'Foo'"))
	assert.equal('@findex fs event fs.Foo\n@findex event fs.Foo',
		     t.index("Event: 'fs.Foo'"))

	assert.equal('@findex fs Class Foo', t.index('Class: Foo'))
	assert.equal('@findex fs.foo.bar', t.index(' fs.foo.bar(baz)    '))
    })

    test('make_menu', function() {
	let md =`
# this \`is bad\`

<div>as it [is](#is)</div>

## & this is <b>too</b>

### C
### D
## E
### F
`
	let menu = md2texi.make_menu(md, 'foo.markdown')
//	console.error(util.inspect(menu, {depth:null}))
//	md2texi.texinfo([menu], 0, md, 'foo.markdown', {partial: true})
	assert.equal('foo_this_is_bad', menu.kids[0].id)
	assert.equal('foo_this_is_too', menu.kids[0].kids[0].id)

	assert(!menu.find_by_id())
	assert(!menu.find_by_id('does not exist'))

	assert.equal('foo_d', menu.find_by_id('foo_d').id)
	assert.equal('foo_f', menu.find_by_id('foo_f').id)

	assert(!menu.find_by_id_prefix())
	assert(!menu.find_by_id_prefix('?')) // invalid regexp
	assert.equal('foo_f', menu.find_by_id_prefix('foo_f').id)
    })

})
