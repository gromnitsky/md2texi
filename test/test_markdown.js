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
})

suite('Misc', function() {
    test('idgen', function() {
	assert.equal('zlib_inflatesync_buf_options', u.idgen('zlib.inflateSync(buf, [options])' ))
	assert.equal('zlib_inflatesync_buf_options_1', u.idgen('zlib.inflateSync(buf, [options])' ))
    })
})
