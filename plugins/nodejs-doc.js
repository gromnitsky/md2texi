/* Generates indices, parses YAML metadata */

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
