# cd some-dir
# make -f ../md2texi/main.mk DATA=~/tmp/io.js/doc/api

DATA :=

.DELETE_ON_ERROR:

.PHONY: compile
compile:

mkdir := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))
out := .

ifeq ($(realpath $(mkdir)), $(realpath $(out)))
$(error running make in the src dir is not supported)
endif

$(if $(DATA),,$(error DATA must point to iojs docs dir))

vpath %.markdown $(DATA)
md.src := $(filter-out %_toc.markdown, $(wildcard $(DATA)/*.markdown))

texi.api := $(patsubst $(DATA)/%.markdown, $(out)/%.texi, $(md.src))

all := $(texi.api)

compile: $(all)

%.texi: %.markdown
	node --harmony_classes $(mkdir)/md2texi $< > $@


pp-%:
	@echo "$(strip $($*))" | tr ' ' \\n
