# md2texi

Convert nodejs documentation into Texinfo format.

Prebuilt versions (texi, info, html, pdf): http://gromnitsky.users.sourceforge.net/js/nodejs/

## Why?

* Read API docs in Emacs.
* **Indices**. Press `i` in Emacs (or standalone info(1)) and type a
  function name or whatever.

Optional goodies:

* Offline mode.
* Nice pdf.
* Full text search.
* Alternate html representation.

*Warning:* md2texi is not a universal markdown-to-texinfo
converter. It was written to support nodejs doc files only.

## Requirements

* Installed nodejs 5.1
* nodejs cloned repo
* texinfo 5.2
* GNU make

## Installation

1. Clone nodejs repo.

2. Clone md2texi repo, cd to its dir & type `npm install`.

3. Create a tmp dir somewhere & cd to it.

4. Type

		$ make -f ~/tmp/md2texi/main.mk DATA=~/tmp/node/doc/api info

	`nodejs.info` file must appear.

5. Test the file via `info -f nodejs.info`

6. Type

		$ make -f ~/tmp/md2texi/main.mk DATA=~/tmp/node/doc/api install

	to install `nodejs.info` (it defaults to `~/share/info/`) &
	auto-create a special `dir` file.

You may get warnings like `@ref reference to nonexistent node
'foo_bar'` during the compilation. This is not (hehe) a bug in
md2texi, but typos in nodejs docs.

## Usage

```
$ md2texi -h

  Usage: md2texi [options] [file.markdown, ...]

  Options:

	-h, --help             output usage information
	-V, --version          output the version number
	-v, --verbose          Be verbose
	-p, --partial          Generate a partial document
	-t, --title <string>   Document title
	-a, --author <string>  Document author
	--info-cat <string>    Info category
	--info <string>        Info filename output (for multiple src only)
	--toc-full             Include full TOC
	--toc-short            Include short TOC
	--nodejs-link            Insert a link to online version for each section
```

## PDF

If you have texlive & texinfo-tex installed, try to run:

	$ make -f ~/tmp/md2texi/main.mk DATA=~/tmp/node/doc/api pdf

to generate `nodejs.pdf` file.

## Bugs

1. Cross-references in Emacs Info mode are always prefixed w/ the 'see'
   word, like this: `For example a (see request to an HTTP server) is a
   stream`.

	To remove the annoying prefix, add this 2 lines to your `.emacs`
	file. Beware that other docs (hand-written in Texinfo format) were
	produced w/ the expectation that the word 'see' is always
	inserted.

		(setq Info-hide-note-references 'hide)
		(setq Info-refill-paragraphs t)

	Evaluate each line (`C-x C-e`), kill the Info buffer & open it
	again.

2. Tables look fine in the html output but horrific in the info
   output. This is an Emacs bug.

## License

MIT.
