'use strict';

let marked = require('marked')
let html_decode = require('ent/decode')

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

    rnd.html = function(html) {
	return ''		// FIXME
    }

    return marked(markdown, { renderer: rnd })
}

exports.render = function(filename, texi) {
    let r = `\\input texinfo

@ifnottex
@node Top
@top ${filename}
@end ifnottex

@shortcontents
@contents

${texi}

@bye
`
    return r
}
