'use strict';

let assert = require('assert')
let ti = require('../lib/texinfo')
let u = require('../lib/u')

suite('Simple', function() {

    test('texi_escape', function () {
	assert.equal("1 @@@{foo@comma{}bar@} 2", u.texi_escape("1 @{foo,bar} 2"))
    })

})

suite('Markdown inline', function() {

    test('lists', function() {
	assert.equal(`
@itemize
@item @emph{@hashchar{} at&t} @strong{@{at&t@}} @{bar&baz@@@}
@end itemize
`, ti.markdown2texi('* _# at&t_ **{at&amp;t}** {bar&baz@}'))
    })

    test('codespan', function() {
	assert.equal(`\n@code{foo & @{bar@}}\n`, ti.markdown2texi("`foo & {bar}`"))
    })

    test('link', function() {
	assert.equal("\n@uref{http://example.com,http://example.com}\n", ti.markdown2texi("http://example.com"))
	assert.equal("\n@uref{http://example.com,@code{omglol}}\n", ti.markdown2texi("[`omglol`](http://example.com)"))
	assert.equal("\n@inlinefmtifelse{html, @ref{errors_class_typeerror,@code{TypeError}}, @inlinefmtifelse{tex, @ref{errors_class_typeerror,,@code{TypeError}}, (@ref{errors_class_typeerror,@code{TypeError}},)}}\n", ti.markdown2texi("[`TypeError`](errors.html#errors_class_typeerror)"))
    })

    // test('br', function () {
    //		assert.equal("\na@*b\n", ti.markdown2texi('a<br>b'))
    // })

})

suite('Markdown block', function() {

    test('heading', function() {
	assert.equal(`

@c -----------------------------------------------------------------------------
@node class_method_buffer_from_str_encoding
@chapter Class Method Buffer@asis{.}from(str[@comma{} encoding])



@c -----------------------------------------------------------------------------
@node readable_read_size
@subsubsection readable@asis{.}_read(size)

`, ti.markdown2texi(`# Class Method: \`Buffer\`.from(str[, encoding])
#### readable.\\_read(size)`))
    })

    test('code', function() {
	assert.equal(`

@example
foo @{ bar @}
@end example

`, ti.markdown2texi('    foo { bar }'))
    })

    test('blockquote', function() {
	assert.equal(`
@indentedblock

@code{foo}

@end indentedblock
`, ti.markdown2texi('>`foo`'))
    })

})

suite('Misc', function() {
    test('idgen', function() {
	assert.equal('zlib_inflatesync_buf_options', u.idgen('zlib.inflateSync(buf, [options])' ))
	assert.equal('zlib_inflatesync_buf_options_1', u.idgen('zlib.inflateSync(buf, [options])' ))
    })

    test('htmltable2texi', function() {
	assert.equal('', ti.htmltable2texi())
	assert.equal('', ti.htmltable2texi(''))

	assert.throws(function() {
	    ti.htmltable2texi('bwaa')
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
//	console.error(ti.htmltable2texi(table))
	let r = ti.htmltable2texi(table)
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
//	console.error(ti.htmltable2texi(table).join(""))
	r = ti.htmltable2texi(table)
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

})
