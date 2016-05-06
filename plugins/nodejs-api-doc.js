#!/usr/bin/env node

'use strict';

let fs = require('fs')
let path = require('path')
let common = require(path.join(__dirname, path.basename(__filename, '.js'), 'common.js'))

exports.conf = {
    url: 'https://nodejs.org/api'
}

exports.clo_names = ['nodejsLink']

exports.clo_setup = function(program) {
    return program.option('--nodejs-link',
		  'Insert a link to an online version for each section')
}

let headings = []
let link = function(prefix) {
    return `\n@uref{${exports.conf.url}/${prefix}.html#${headings[headings.length-1]}}`
}

exports.index = function(tnidg, text, level) {
    let prefix = function(text) {
	let prx = tnidg.prefix() + ' '
	if (level < 2) prx = ''

	let t = text.split('.')
	if (t[0] === prx.trim()) prx = ''
	return prx
    }

    if (text.match(/event:/i)) {
	text = text.replace(/Event:\s+([^(\[]+).*/, '$1').replace(/['"]/g, '')
	let ep = tnidg.prefix() + ' '
	if (level < 2) ep = ''
	return [`@findex ${ep}event ${text}`,
		`@findex event ${prefix(text)}${text}`].join("\n")
    } else {
	text = exports.lib.refName(text.replace(/([^(\[]+).*/, '$1').replace(/['"]/g, ''))
	return `@findex ${prefix(text)}${text}`
    }
}

exports.section_header_hook = function(tnidg, text, level, header) {
    header.push(exports.index(tnidg, text, level))
}

// header is an array
exports.section_header_before_hook = function(tnidg, id, header) {
    if (headings.length > 0 && exports.conf.nodejsLink)
	header.push(link(tnidg.prefix()) )

    if (id) headings.push(id)
}

// In the same spirit as that of the nodejs doc tool we ignore unknown
// metadata entries (I don't like this approach)
exports.html_hook = function(html) {
    if (!html) return { html: '' }
    if (!common.isYAMLBlock(html)) return {html}

    let meta = common.extractAndParseYAML(html)
    let r = []

    if (meta.added) r.push(`Added in: ${meta.added.join(', ')}`)
    if (meta.deprecated) r.push(`Deprecated since: ${meta.deprecated.join(', ')}`)

    return {
	html: r.length ? "\n@smalldisplay\n" + r.join('; ') + "\n@end smalldisplay\n" : '',
	terminal: true // means no other plugins w/ `html_hook` should touch it
    }
}
