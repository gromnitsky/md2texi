'use strict';

let path = require('path')

let marked = require('marked')
let html_decode = require('ent/decode')
let parse5 = require('parse5')

let u = require('./u')

let section = function(level) {
    switch (level) {
    case 1: return '@chapter'
    case 2: return '@section'
    case 3: return '@subsection'
    case 4: return '@subsubsection'
    default:
	throw new Error(`supported levels are in range [1-4], you got ${level}`)
    }
}

exports.markdown2texi = function(markdown, menu, opt) {
    opt = opt || {}
    let rnd = new marked.Renderer()
    u.idgen_reset()

    /* Inline level renderer methods */

    rnd.text = function(text) {
	return u.texi_escape(html_decode(text))
    }
    rnd.strong = function(text) {
	return '@strong{' + text + '}'
    }
    rnd.em = function(text) {
	return '@emph{' + text + '}'
    }
    rnd.codespan = function(text) {
	return '@code{' + u.texi_escape(html_decode(text)) + '}'
    }
    rnd.link = function(href, _, text) {
	if (href.match(/^https?:\/\//)) {
	    href = u.texi_escape(html_decode(href))
	    return `@uref{${href},${text}}`
	}

	// FIXME: mv to a plugin
	if (href.match(/\.html$/) && opt.menu) {
	    // the link is of a type [Foo Bar](foo.html)
	    //
	    // we need to search through the first menu level of all
	    // parsed files to find a real node name for foo.html
	    let node_prefix = exports.node_prefix(href)
	    href = opt.menu.filter(function(item) {
		let re = new RegExp(`^${node_prefix}`)
		if (!item.kids.length) return false
		return item.kids[0].id.match(re)
	    })
	    href = href.length === 0 ? node_prefix : href[0].kids[0].id
	} else {
	    // this is a node from the current file, like [Foo Bar](#foo_bar)
	    href = href.replace(/^(.+)?#/, '')
	}

	href = u.texi_escape(html_decode(href))
	// see 'Conditional Commands' in Texinfo manual
	return `@inlinefmtifelse{html, @ref{${href},${text}}, @inlinefmtifelse{tex, @ref{${href},,${text}}, (@ref{${href},${text}},)}}`
    }

    /* Block level renderer methods */

    rnd.paragraph = function(text) {
	return "\n" + text + "\n"
    }

    // FIXME: check escaped
    rnd.code = function(code, lang, escaped) {
	return ['\n',
		'@example',
		u.texi_escape(html_decode(code)),
		'@end example',
		'\n'].join("\n")
    }

    rnd.heading = function(_, level, raw) {
	let node = u.node_name(raw, opt)
	let r = ["\n"]
	r.push(`@c ${new Array(78).join('-')}`)
	r.push(`@node ${node.id}`)
	r.push(`${section(level)} ${node.name}`)

	// insert a chunk of a menu
	if (menu) {
	    let submenu = menu.find_descendant_by_id(node.id)
	    if (submenu && submenu.kids.length) {
		r.push("\n@menu")
		for (let item of submenu.kids) {
		    r.push(`* ${item.name}: ${item.id}.`)
		}
		r.push("@end menu\n")
	    }
	}

	r.push("\n")
	return r.join("\n")
    }

    rnd.list = function(body, ordered) {
	let type = ordered ? 'enumerate' : 'itemize'
	let r = []
	r.push(`\n@${type}`)
	r.push(body.trim())
	r.push(`@end ${type}\n`)
	return r.join("\n")
    }

    rnd.listitem = function(text) {
	return "\n@item " + text
    }

    rnd.blockquote = function(text) {
	return '\n@indentedblock\n' + text + '\n@end indentedblock\n'
    }

    rnd.html = function(html) {
	html = html.trim()

	// strip comments
	if (html.match(/^<!--[\s\S]*?-->$/)) return ''
	// try to convert a simple table
	if (html.match(/^<table>/)) return exports.htmltable2texi(html).join("")

	exports.log(`raw html:\n${html}`)
	return html
    }

    return marked(markdown, { renderer: rnd })
}

exports.log = console.error

exports.render = function(texi, opt) {
    let r = `\\input texinfo

@ifnottex
@node Top
@top ${opt.title}
@end ifnottex

@shortcontents
@contents

${texi}

@bye
`
    return r
}

// similar to nodejs tools/doc/html.js::toID(filename)
exports.node_prefix = function(str) {
    if (!str || str.match(/^\s*$/)) return ''
    return path.basename(str, path.extname(str))
	.replace(/[^\w\-]/g, '-')
	.replace(/-+/g, '-') + '_'
}

// return all matching nodes from doc
let p5selectAll = function(doc, tagName) {
    if (!doc || !tagName) return []

    let all = []
    for (let node of doc.childNodes) {
	if (node.tagName === tagName) all.push(node)
	if (node.childNodes && node.childNodes.length > 0) {
	    // recursion!
	    let r = p5selectAll(node, tagName)
	    all = all.concat(r)
	}
    }

    return all
}

exports.htmltable2texi = function(html) {
    if (!html) return ''

    let doc = parse5.parseFragment(html)

    // calculate the number or columns
    let th = p5selectAll(doc, 'th')
    let cols = th.length
    if (cols === 0) throw new Error('no THs in table')
    let cols_spec = ' .99'
    if (cols > 1) {
	let col_frac = (100/cols/100).toFixed(2).slice(1)
	cols_spec = new Array(cols + 1).join(' ' + col_frac)
    }

    // texinfo table banner w/ column width spec
    let r = []
    r.push(`\n@multitable @columnfractions${cols_spec}\n`)

    // texinfo table header
    r.push('@headitem ')
    r.push(th.map(function(node) {
	return u.html_strip(parse5.serialize(node)).trim()
    }).join(' @tab '))
    r.push('\n')

    // texinfo table body
    let tr = p5selectAll(doc, 'tr').slice(1) // minus <thead>
    for (let row of tr) {
	let td = p5selectAll(row, 'td')
	for (let idx in td) {
	    r.push(parseInt(idx) === 0 ? '\n@item\n' : '@tab\n')
	    r.push(u.html_strip(parse5.serialize(td[idx])).trim() + '\n')
	}
    }

    r.push(`\n@end multitable\n`)
    return r
}
