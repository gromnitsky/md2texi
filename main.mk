# cd some-dir
# make -f ../md2texi/main.mk DATA=~/tmp/node/doc/api info

DATA :=
OPT :=
DESTDIR :=
prefix := ~

.DELETE_ON_ERROR:

.PHONY: compile
compile:

infodir := share/info
info.toplevel := $(DESTDIR)$(prefix)/$(infodir)/dir
mkdir := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))
out := .

ifeq ($(realpath $(mkdir)), $(realpath $(out)))
$(error running make in the src dir is not supported)
endif

$(if $(DATA),,$(error DATA must point to nodejs docs dir))

vpath %.markdown $(DATA)
md.src.list := $(shell cat $(mkdir)/list.txt)
md.src := $(addprefix $(DATA)/, $(md.src.list))

texi.api := $(patsubst $(DATA)/%.markdown, $(out)/%.texi, $(md.src))

all := $(texi.api) $(out)/nodejs.texi $(out)/nodejs.info

compile: $(all)

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

%.texi: %.markdown
	node $(mkdir)/md2texi $(OPT) $< > $@

nodejs.texi: $(mkdir)/list.txt $(md.src)
	node $(mkdir)/md2texi \
		-t 'The Node.js API' -a '@copyright{} Node.js Contributors' \
		--info nodejs --toc-short --toc-full \
		--info-cat 'Software development' $(OPT) \
		$(md.src) > $@

$(out)/nodejs.info: $(out)/nodejs.texi
	 makeinfo --force $<

$(out)/nodejs.info.tar.xz: $(out)/nodejs.info
	 tar cfJ $@ $<*

$(out)/nodejs.html: $(out)/nodejs.texi
	 makeinfo --force --html --no-split --no-headers $<

$(out)/nodejs.pdf: $(out)/nodejs.texi
	texi2pdf -q -t '@afourpaper' $<

pp-%:
	@echo "$(strip $($*))" | tr ' ' \\n

.PHONY: test
test:
	cd $(mkdir)/test && \
	../node_modules/.bin/mocha -u tdd test_*.js
