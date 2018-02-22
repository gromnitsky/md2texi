/* Generates indices, parses YAML metadata */

let path = require('path')

let marked = require('marked')

let u = require('../lib/u')
// a straight copy of node's `tools/doc/common.js`
let common = require(path.join(__dirname, path.basename(__filename, '.js'), 'common.js'))

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
    let sanitize_name = (s, is_event) => {
	let re = is_event ? /Event:\s+([^(\[]+).*/ : /([^(\[]+).*/
	return s.replace(re, '$1')
	    .replace(/['"]/g, '').replace(/[:{}]/g, ' ')
	    .replace(/\s+/g, ' ').trim()
    }

    let data
    if (name.match(/event:/i)) {
	name = sanitize_name(name, true)
	data = [`@findex ${node_prefix !== '' ? node_prefix + ' ': ''}event ${name}`,
		`@findex event ${prefix(name)}${name}`]
    } else {
	name = sanitize_name(name)
	data = [`@findex ${prefix(name)}${name}`]
    }

    return {
	args,
	data,
	terminal: false
    }
}

exports.link_renderer = function(href, node_prefix, opt) {
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
	args: [href, node_prefix, opt],
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

// In the same spirit as that of the nodejs doc tool we ignore unknown
// metadata entries (I don't like this approach)
exports.html = function(html) {
    var args = Array.prototype.slice.call(arguments, 0)
    let not_applicable = (html) => {
	return {
	    args,
	    terminal: false,
	    data: html
	}
    }

    if (!html) return not_applicable('')
    if (!common.isYAMLBlock(html)) return not_applicable(html)

    let meta = {}
    try {
	meta = common.extractAndParseYAML(html)
    } catch (e) {
	u.log('js-yaml fails to parse:', html, e.message)
    }
    let r = []

    if (meta.added) r.push(`Added in: ${meta.added.join(', ')}`)
    if (meta.deprecated) r.push(`Deprecated since: ${meta.deprecated.join(', ')}`)

    return {
	args: null,
	data: r.length ? "\n@smallindentedblock\n" + r.join('; ') + "\n@end smallindentedblock\n" : '',
	terminal: true
    }
}
