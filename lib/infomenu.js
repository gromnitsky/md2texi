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
	node.parent = this.find_suitable_parent(node)
	node.parent.kids.push(node)
	return node
    }

    find_suitable_parent(node) {
	if (node.level - this.level === 1) return this
	if (node.level - this.level > 1) {
	    u.log(`the node '${node.id}' is an orphan (node.level=${node.level}, this.level=${this.level})`)
	    return this
	}
	// move upvards, RECURSION
	return this.parent.find_suitable_parent(node)
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
    u.idgen_reset()
    let root = new InfoNode('root', 0)
    let orig_root = root

    let alias = null
    rnd.paragraph = function(text) {
	alias = u.node_alias(text)
	return ''		// we're just collecting the possible aliases
    }

    rnd.heading = function(_, level, raw) {
	if (level > 4) level = 4
	let node = new InfoNode(raw, level, opt)
//	console.error(level, raw)
	root = root.kid_add(node)

	if (alias && opt.node_aliases) opt.node_aliases[alias] = node.id

	return ''		// we're just grabbing the headers
    }

    marked(markdown, { renderer: rnd })
    return orig_root
}
