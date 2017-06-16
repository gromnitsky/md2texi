'use strict';

let marked = require('marked')
let html_decode = require('ent/decode')

exports.idgen_plain = function(text) {
    return text.toLowerCase()
	.replace(/[^a-z0-9]+/g, '_')
	.replace(/^_+|_+$/, '')
	.replace(/^([^a-z])/, '_$1')
}

// similar to nodejs tools/doc/html.js::getId(text)
let _idCounters = {}
exports.idgen = function(text) {
    text = exports.idgen_plain(text)
    if (_idCounters.hasOwnProperty(text)) {
	text += '_' + (++_idCounters[text])
    } else {
	_idCounters[text] = 0
    }
    return text
}

exports.idgen_reset = function() {
    _idCounters = {}
}

// from the Texinfo-6.1 manual: "Unfortunately, you cannot reliably
// use periods, commas, or colons within a node name"
exports.node_name = function(raw, opt) {
    let text = exports.md_inline_strip(raw)
    return {
	id: ((opt && opt.node_prefix) || '') + exports.idgen(text),
	name: exports.texi_escape(text)
	    .replace(/[\.]/g, '@asis{$&}')
	    .replace(/:/g, ' ').replace(/\s+/g, ' ').trim()
    }
}

exports.md_inline_strip = function(markdown) {
    if (!markdown) return ""
    if (markdown.match(/\n/)) throw new Error("newline in the input")

    let rnd = new marked.Renderer()
    return exports.html_strip(html_decode(marked(markdown, { renderer: rnd }))).trim()
}

exports.html_strip = function(str) {
    return str.replace(/<(?:.|\n)*?>/gm, '')
}

exports.texi_escape = function(str) {
    return str.replace(/[@{},\\#]/g, (ch) => {
	switch (ch) {
	case '@': return '@@'
	case '{': return '@{'
	case '}': return '@}'
	case ',': return '@comma{}'
	case '\\': return '@backslashchar{}'
	case '#': return '@hashchar{}'
	default: throw new Error('texi_escape')
	}
    })
}

exports.log = console.error

exports.node_alias = function(text) {
    let m = text.match(/^<a id=['"]([^'"]+)?['"]><\/a>$/)
    return m ? m[1] : null
}
