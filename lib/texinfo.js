'use strict';

let path = require('path')
let fs = require('fs')

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
    let allthelinks = exports.md_extract_links(markdown)

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

	if (opt.plugins) {
	    let node_prefix = exports.node_prefix(href)
	    let hookresult = opt.plugins.run_hook('link_renderer', href,
						  node_prefix, opt)
	    if (hookresult.length) {
		href = hookresult[hookresult.length-1].data
	    }
	}

	if (opt.node_aliases && opt.node_aliases[href])
	    href = opt.node_aliases[href]

	href = u.texi_escape(html_decode(href))
	// TODO: sync with u.js::node_name()
	text = text.replace(/[:]/g, ' ').replace(/\s+/g, ' ').trim()
	// see 'Conditional Commands' in Texinfo manual
	return `@inlinefmtifelse{html, @ref{${href},${text}}, @inlinefmtifelse{tex, @ref{${href},,${text}}, (@ref{${href},${text}},)}}`
    }

    /* Block level renderer methods */

    rnd.paragraph = function(text) {
	if (u.node_alias(text)) return ''
	return "\n" + text + "\n"
    }

    let tbl_row_parse = (str) => JSON.parse("[" + str.slice(0, -1) + "]")

    rnd.table = function(header, body) {
	header = tbl_row_parse(header)[0]
	body = tbl_row_parse(body)
	let r = []

	// header
	let frac = Array(header.length).fill([1/header.length]).join(' ')
	r.push(`\n@multitable @columnfractions ${frac}`)
	r.push(header.join(' @tab '))

	//body
	body.forEach( val => r.push(val.join(' @tab ')))
	r.push("@end multitable\n")

	return r.join("\n")
    }

    rnd.tablerow = function(text) {
	let row = tbl_row_parse(text)
	let type = row[0].header ? '@headitem' : '@item'
	row[0].text = type + ' ' + row[0].text
	return JSON.stringify(row.map(val=> val.text)) + ","
    }

    rnd.tablecell = function(text, flags) {
	return JSON.stringify({text, header: flags.header}) + ","
    }

    // FIXME: check escaped
    rnd.code = function(code, lang, escaped) {
	if (opt.plugins) {
	    let hookresult = opt.plugins.run_hook('code',
						  code, lang, allthelinks, rnd)
	    for (let idx of hookresult) {
		if (idx.terminal) return idx.data
	    }
	    code = hookresult[hookresult.length-1].data
	}

	return ['\n',
		'@example',
		u.texi_escape(html_decode(code)),
		'@end example',
		'\n'].join("\n")
    }

    rnd.heading = function(_, level, raw) {
	if (level > 4) level = 4
	let node = u.node_name(raw, opt)
	let r = ["\n"]
	r.push(`@c ${new Array(78).join('-')}`)
	r.push(`@node ${node.id}`)
	r.push(`${section(level)} ${node.name}`)

	if (opt.plugins) {
	    let hookresult = opt.plugins.run_hook('index', raw, level, opt)
	    hookresult.forEach( (indices) => {
		indices.data.forEach( (val) => r.push(val))
	    })
	}

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

	if (opt.plugins) {
	    let hookresult = opt.plugins.run_hook('html', html)
	    for (let idx of hookresult) {
		if (idx.terminal) return idx.data
	    }
	    html = hookresult[hookresult.length-1].data
	}

	// strip comments
	if (html.match(/^<!--[\s\S]*?-->$/)) return ''
	// try to convert a simple table
	if (html.match(/^<table>/)) return exports.htmltable2texi(html).join("")

	u.log(`raw html:\n${html}`)
	return html
    }

    return marked(markdown, { renderer: rnd })
}

exports.render = function(texi, opt) {
    let timestamp = new Date()
    let r =`\\input texinfo
@setfilename ${opt.info}.info

@dircategory ${opt.infoCat}
@direntry
* ${opt.info}: (${opt.info}).                 ${opt.title}.
@end direntry

@c a title page for TeX
@titlepage
@title ${opt.title}
@subtitle ${timestamp}
@author ${opt.author}
@end titlepage

@shortcontents
@contents

@c info/html
@ifnottex
@node Top
@top ${opt.title}

Generated on ${timestamp} by ${opt.generator}.
@end ifnottex

${texi}

@node index
@unnumbered Index
@printindex fn

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

class PluginsLoader {

    constructor(names) {
	this.plugins = []
	this.src = []

	for (let plugin of names.split(',')) {
	    let pl = require(path.join(path.resolve(__dirname, '..', 'plugins'),
				       plugin))
	    this.plugins.push(pl)
	    this.src.push(plugin)
	}
    }

    run_hook(hook) {
	var args = Array.prototype.slice.call(arguments, 1)

	let results = []
	for (let plugin of this.plugins) {
	    if (!plugin[hook]) continue
	    let r = plugin[hook].apply(plugin, args)
	    results.push(r)
	    if (r.terminal) break

	    args = r.args
	}

	return results
    }
}

exports.PluginsLoader = PluginsLoader

// return a string that consists solely of footnote-style links
exports.md_extract_links = function(markdown) {
    if (!markdown) return ''

    let lexems = marked.lexer(markdown)
    let r = []
    for (let key in lexems.links)
	r.push(`[${key}]: ${lexems.links[key].href}`)
    return r.join("\n")
}
