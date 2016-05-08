'use strict';

let marked = require('marked')

let u = require('./u')

class InfoNode {

    // raw is string like "`querystring`.stringify(obj[, sep][, eq][, options])"
    constructor(raw, level, opt) {
	let nn = u.node_name(raw, opt)
	this.id = nn.id
	this.name = nn.name
	this.level = level
	this.opt = opt || {}

	this.kids = []		// InfoMenu
	this.parent = null
    }

    kid_add(node) {
	node.parent = this.find_suitable_parent(node.level)
	node.parent.kids.push(node)
	return node
    }

    find_suitable_parent(level) {
	if (level - this.level === 1) return this
//	console.error(`${level} - ${this.level}`)
	// move upvards, RECURSION
	return this.parent.find_suitable_parent(level)
    }

    find_descendant_by_id(id) {
	if (!id) return null
	if (this.id === id) return this

	for (let node of this.kids) {
	    if (node.id === id) return node
	    if (node.kids.length) {
		// RECURSION
		let r = node.find_descendant_by_id(id)
		if (r) return r
	    }
	}
	return null
    }

}

exports.InfoNode = InfoNode

exports.menu = function(markdown, opt) {
    let rnd = new marked.Renderer()
    let root = new InfoNode('root', 0)
    let orig_root = root

    rnd.heading = function(_, level, raw) {
	let node = new InfoNode(raw, level, opt)
//	console.error(level, raw)
	root = root.kid_add(node)
	return ''		// we just grabbing the headers
    }

    marked(markdown, { renderer: rnd })
    return orig_root
}
