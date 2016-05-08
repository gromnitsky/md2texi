# this must be at least version 6.1
texi2any := /opt/tmp/texinfo-6.1/1/bin/texi2any

.DELETE_ON_ERROR:

.PHONY: test
test:

pp-%:
	@echo "$(strip $($*))" | tr ' ' \\n

src := $(dir $(lastword $(MAKEFILE_LIST)))
out := .

md.src := $(wildcard $(src)/test/data/*.md)
texi.dest := $(patsubst $(src)/%.md, $(out)/%.texi, $(md.src))
info.dest := $(texi.dest:.texi=.info)
html.dest := $(texi.dest:.texi=.html)

$(out)/test/%.texi: $(src)/test/%.md
	@mkdir -p $(dir $@)
	$(src)/md2texi $< > $@

%.info: %.texi
	$(texi2any) $< -o $@

%.html: %.texi
	$(texi2any) --html --no-split --no-headers $< -o $@

test: $(texi.dest) $(info.dest) $(html.dest)
	$(src)/node_modules/.bin/mocha -u tdd $(src)/test/test_*.js
