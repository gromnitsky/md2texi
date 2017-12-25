# md2texi

Convert nodejs API documentation to the Texinfo format (& subsequently
to pdf, html, info).

Prebuilt versions of the current branch (texi, info, html, pdf):
http://gromnitsky.users.sourceforge.net/js/nodejs/ (I update them more
or less regularly.)

## Why?

* Read API docs in Emacs.
* **Indices**. Press `i` in Emacs (or standalone info(1)) and type a
  function name or whatever.

Optional goodies:

* An offline mode.
* A nice looking pdf.
* A **full text search**.
* An alternate html representation (for example, as a one big file).

![A screenshot of running Emacs](https://raw.github.com/gromnitsky/md2texi/master/screenshot1.png)

**Warning:** although md2texi *may* be used as a universal
markdown-to-texinfo converter, it was written specifically to support
nodejs api doc files.

## Requirements

* Installed nodejs 6.x
* Cloned nodejs repo
* texinfo 6.3+
* GNU make

## Installation

1. Clone nodejs repo.

2. Clone md2texi repo, cd to its dir & type `npm install`.

3. Create a tmp dir somewhere & cd to it.

4. Type

		$ make -f ~/tmp/md2texi/main.mk DATA=~/tmp/node/doc/api info

	`nodejs.info` file must appear.

5. Test the file via `info -f ./nodejs.info` (yes, `./` is important)

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

	-h, --help              output usage information
	-V, --version           output the version number
	-v, --verbose           Be verbose
	-t, --title <string>    Document title
	-a, --author <string>   Document author
	--info-cat <string>     Info category
	-p, --plugins <string>  A list of plugins to use, separated by commas
	--info <string>         Info filename output (for multiple src only)
```

## PDF

If you have texlive & texinfo-tex installed, try to run:

	$ make -f ~/tmp/md2texi/main.mk DATA=~/tmp/node/doc/api pdf

to generate `nodejs.pdf` file.

## Bugs

1. Vintage box drawing chars (┌,┐,└,┘,&c) aren't visible in the pdf
   output. This is an internal texinfo limitation.

2. Cross-references in Emacs Info mode are always prefixed w/ the 'see'
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

3. Tables look fine in the html output but horrific in the info
   output. This is an Emacs bug.

## License

MIT.
