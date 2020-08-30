# cd some-dir
# make -f ../md2texi/main.mk DATA=~/tmp/node/doc/api info

DATA :=
OPTS :=
DESTDIR :=
prefix := ~
meta.title := The Node.js API
meta.authors := Node.js Contributors
meta.authors.texi := @copyright{} $(meta.authors)
texi2any := texi2any

.DELETE_ON_ERROR:

.PHONY: compile
compile:

infodir := share/info
info.toplevel := $(DESTDIR)$(prefix)/$(infodir)/dir
mk := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))
out := .

ifeq ($(realpath $(mk)), $(realpath $(out)))
$(error running make in the src dir is not supported)
endif

$(if $(DATA),,$(error DATA must point to nodejs docs dir))

md.src := $(filter-out %/index.md, $(wildcard $(DATA)/*.md))
texi.dest := $(patsubst $(DATA)/%.md, $(out)/%.texi, $(md.src))

compile.all := $(texi.dest) $(out)/nodejs.texi $(out)/nodejs.info
compile: $(compile.all)

.PHONY: pdf
pdf: $(out)/nodejs.pdf

.PHONY: info
info: $(out)/nodejs.info

.PHONY: html
html: $(out)/nodejs.html

.PHONY: install
install: nodejs.info
	mkdir -p $(dir $(info.toplevel))
	cp $<* $(dir $(info.toplevel))
	install-info $< $(info.toplevel)
	@echo
	@echo '****************************************************************'
	@echo 'You should probably add $(dir $(info.toplevel)) directory to'
	@echo 'the INFOPATH env var for info(1) or to the'
	@echo 'Info-additional-directory-list var for Emacs, otherwise viewers'
	@echo 'may not be able to find the newly installed doc.'
	@echo
	@echo 'To check the installation, open info(1), press 'm','
	@echo "type 'nodejs' & press Return."
	@echo '****************************************************************'

.PHONY: upload
upload: $(out)/nodejs.texi $(out)/nodejs.info.tar.xz $(out)/nodejs.html $(out)/nodejs.pdf
	rsync -avPL --delete -e ssh $^ gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/nodejs/

$(out)/%.texi: $(DATA)/%.md
	$(mk)/md2texi -p nodejs-doc $(OPTS) $< > $@

$(out)/list.txt: $(DATA)/index.md $(md.src)
	grep '\.html)' $< | sed 's,.*(\(.*\).html),$(DATA)/\1.md,' > $@

nodejs.texi: $(out)/list.txt
	$(mk)/md2texi -p nodejs-doc \
		-t '$(meta.title)' -a '$(meta.authors.texi)' \
		--info nodejs --info-cat 'Software development' $(OPTS) \
		`cat $<` > $@

$(out)/nodejs.info: $(out)/nodejs.texi
	 $(texi2any) --no-warn --force $<

$(out)/nodejs.info.tar.xz: $(out)/nodejs.info
	 tar cfJ $@ $<*

$(out)/nodejs.html: $(out)/nodejs.texi
	 $(texi2any) --no-warn --force --html --no-split --no-headers $<

$(out)/nodejs.pdf: $(out)/nodejs.texi
	texi2pdf -q -t '@afourpaper' $<
	-exiftool -Creator="`$(mk)/md2texi -V`" \
		-Title='$(meta.title)' -Author='$(meta.authors)' $@



.PHONY: test
test:
	mocha -u tdd $(mk)/test/test_*.js $(OPTS)
