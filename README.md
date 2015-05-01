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

2. Clone md2texi repo, cd to its dir & type `npm install`.

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

## Bugs

1. Cross-refenses in Emacs Info mode are always prefixed w/ the 'see'
   word, like this: `For example a (see request to an HTTP server) is a
   stream`.

	To remove the annoying prefix, add this 2 lines to your `.emacs`
	file. Beware that other docs in Texinfo format were written w/ the
	expectation that the word 'see' is always inserted.

		(setq Info-hide-note-references 'hide)
		(setq Info-refill-paragraphs t)

	Evaluate each line (`C-x C-e`), kill the Info buffer & open it
	again.

2. Tables look fine in the html output but horrific in the info
   output. This is an Emacs bug.

## License

MIT.
