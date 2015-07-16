# cd some-dir
# make -f ../md2texi/main.mk DATA=~/tmp/io.js/doc/api info

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

$(if $(DATA),,$(error DATA must point to iojs docs dir))

vpath %.markdown $(DATA)
md.src.list := $(shell cat $(mkdir)/list.txt)
md.src := $(addprefix $(DATA)/, $(md.src.list))

texi.api := $(patsubst $(DATA)/%.markdown, $(out)/%.texi, $(md.src))

all := $(texi.api) $(out)/iojs.texi $(out)/iojs.info

compile: $(all)

.PHONY: pdf
pdf: $(out)/iojs.pdf

.PHONY: info
info: $(out)/iojs.info

.PHONY: html
html: $(out)/iojs.html

.PHONY: install
install: iojs.info
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
	@echo "type 'iojs' & press Return."
	@echo '****************************************************************'

.PHONY: upload
upload: $(out)/iojs.texi $(out)/iojs.info.tar.xz $(out)/iojs.html $(out)/iojs.pdf
	rsync -avPL --delete -e ssh $^ gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/iojs/

%.texi: %.markdown
	node --harmony_classes $(mkdir)/md2texi $(OPT) $< > $@

iojs.texi: $(mkdir)/list.txt $(md.src)
	node --harmony_classes $(mkdir)/md2texi \
		-t 'The io.is API' -a '@copyright{} io.js Contributors' \
		--info iojs --toc-short --toc-full \
		--info-cat 'Software development' $(OPT) \
		$(md.src) > $@

$(out)/iojs.info: $(out)/iojs.texi
	 makeinfo --force $<

$(out)/iojs.info.tar.xz: $(out)/iojs.info
	 tar cfJ $@ $<*

$(out)/iojs.html: $(out)/iojs.texi
	 makeinfo --force --html --no-split --no-headers $<

$(out)/iojs.pdf: $(out)/iojs.texi
	texi2pdf -q -t '@afourpaper' $<

pp-%:
	@echo "$(strip $($*))" | tr ' ' \\n

.PHONY: test
test:
	cd $(mkdir)/test && \
	../node_modules/.bin/mocha --harmony_classes -u tdd test_*.js
