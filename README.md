# md2texi

Convert iojs documentation into Texinfo format.

## Why?

* Instant offline mode.
* Read API docs in Emacs.
* **Indices**. Press `i` in Emacs (or standalone info(1)) and type a
  function name or whatever.

Optional goodies:

* Nice pdf.
* Full text search.
* Alternate html representation.

*Warning:* md2texi is not a universal markdown-to-texinfo
converter. It was written to support iojs doc files only.

## Requirements

* Installed iojs 1.8.1
* iojs cloned repo
* texinfo 5.2
* GNU make

## Installation

1. Clone iojs repo.

2. Clone md2texi repo.

3. Create a tmp dir somewhere & cd to it.

4. Type

		$ make -f ~/tmp/md2texi/main.mk DATA=~/tmp/io.js/doc/api info

	`iojs.info` file must appear.

5. Test the file via `info -f iojs.info`

6. Type

		$ make -f ~/tmp/md2texi/main.mk DATA=~/tmp/io.js/doc/api install

	to install `iojs.info` (it defaults to `~/share/info/`) &
	auto-create a special `dir` file.

You may get warnings like `@ref reference to nonexistent node
'event_listening_'` during compilation. This is not (hehe) a bug in
md2texi, but typos in iojs docs.

## PDF

If you have texlive & texinfo-tex installed, try to run:

	$ make -f ~/tmp/md2texi/main.mk DATA=~/tmp/io.js/doc/api pdf

to generate `iojs.pdf` file.

## License

MIT.
