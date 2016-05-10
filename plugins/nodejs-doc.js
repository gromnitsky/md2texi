/* Generates indices, parses YAML metadata */

let marked = require('marked')

let u = require('../lib/u')

exports.index = function(raw, level, opt) {
    var args = Array.prototype.slice.call(arguments, 0)

    let name = u.md_inline_strip(raw)
    let node_prefix = ((opt && opt.node_prefix) || '')
    node_prefix = node_prefix.replace(/_$/, '')
    if (level === 1) node_prefix = ''
    let prefix = (str) => {
	if (level === 1) return ''
	return str.split('.')[0] === node_prefix ? '' : node_prefix + ' '
    }

    let data = null

    if (name.match(/event:/i)) {
	name = name.replace(/Event:\s+([^(\[]+).*/, '$1').replace(/['"]/g, '')
	data = [`@findex ${node_prefix !== '' ? node_prefix + ' ': ''}event ${name}`,
		`@findex event ${prefix(name)}${name}`]
    } else {
	name = name.replace(/([^(\[]+).*/, '$1').replace(/['":]/g, '')
	data = [`@findex ${prefix(name)}${name}`]
    }

    return {
	args,
	data,
	terminal: false
    }
}

exports.link_renderer = function(href, node_prefix, opt) {
    var args = Array.prototype.slice.call(arguments, 0)
    if (href.match(/\.html$/) && opt.menu) {
	// the link is of a type [Foo Bar](foo.html)
	//
	// we need to search through the first menu level of all
	// parsed files to find a real node name for foo.html
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

    return {
	args,
	data: href,
	terminal: false
    }
}

exports.code = function(code, lang, links, recursive_renderer) {
    var args = Array.prototype.slice.call(arguments, 0)

    let invalid = (code) => {
	return {
	    args,
	    terminal: false,
	    data: code
	}
    }

    if (lang) return invalid(code)
    if (!code) return invalid('')
    if (!code.match(/^\s*Stability:\s/)) return invalid(code)

    let render = (text) => marked(text, { renderer: recursive_renderer })

    return {
	args: null,
	terminal: true,
	data: ['\n',
	       '@smallindentedblock',
	       render(code + "\n\n" + links).trim(),
	       '@end smallindentedblock',
	       '\n'].join("\n")
    }
}
