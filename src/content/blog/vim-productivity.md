---
title: '10 Vim Tricks That Compound: A Plugin-Free Productivity System'
description: 'Deep-dive into Vim mechanics that compound over time macros, text objects, registers, the dot command, marks, quickfix lists, netrw, splits, and a complete plugin-free workflow with actual key sequences and real-world use cases.'
pubDate: 2026-03-01
category: 'tech-tips'
tags: ['vim', 'productivity', 'developer-tools']
draft: false
readingTime: '12 min'
---

The difference between a fast Vim user and a slow one isn't speed of finger movement it's the number of keystrokes per intent. Every trick below compounds: learn one, and it multiplies the effectiveness of the others. This is a plugin-free workflow built on Vim's grammar.

## 1. The Dot Command Repeatable Intent

The `.` command repeats your last *change*. The key insight: structure your edits so they're repeatable.

```vim
" Bad: manually changing each occurrence
/foo<CR>cwbar<Esc>nnn...cwbar<Esc>

" Good: change once, repeat with dot
/foo<CR>cwbar<Esc>n.n.n.
```

The dot command replays the *entire* last change not just one character. So `ciwREPLACED<Esc>` followed by `n.` is a search-and-replace that gives you manual control over each substitution.

### Structuring for Repeatability

| Action | Repeatable? | Why |
|--------|-------------|-----|
| `cwword<Esc>` | ✅ | Single atomic change |
| `i`, type, `<Esc>`, move, delete | ❌ | Multiple changes |
| `A;<Esc>` | ✅ | Append semicolon to line end |
| `I// <Esc>` | ✅ | Comment out a line |

The rule: one edit per intent. Then `.` becomes your multiplier.

## 2. Text Objects Think in Semantics, Not Characters

Text objects are Vim's killer feature. They let you operate on *meaningful units* of text.

```vim
" Inside variants (exclude delimiters)
ci"    " change inside quotes
ci(    " change inside parentheses
cit    " change inside XML/HTML tag
ciw    " change inside word
cis    " change inside sentence
ci{    " change inside braces

" Around variants (include delimiters)
da"    " delete around quotes (quotes included)
da(    " delete around parens
dat    " delete around tag
daw    " delete around word (trailing space included)
```

### Composability with Operators

Every operator works with every text object:

| Operator | Text Object | Result |
|----------|-------------|--------|
| `d` (delete) | `i{` | Delete contents of `{}` block |
| `c` (change) | `it` | Change inner HTML tag |
| `y` (yank) | `a"` | Copy string including quotes |
| `v` (visual) | `ip` | Select inner paragraph |
| `>` (indent) | `i{` | Indent contents of block |

Real use case: cursor anywhere inside a function body, `ci{` clears it and puts you in insert mode. No counting lines, no visual selection.

## 3. Macros Programmatic Editing

Macros record and replay keystroke sequences. They are Vim's scripting for people who don't want to write scripts.

```vim
qa          " start recording into register 'a'
0f"ci"new_value<Esc>  " go to start, find quote, change inside
j           " move to next line
q           " stop recording

10@a        " replay 10 times
```

### Advanced Macro Patterns

**Recursive macros** a macro that calls itself:

```vim
qqq         " clear register q
qq          " start recording into q
0f,r;       " go to start, find comma, replace with semicolon
j           " next line
@q          " call self (recursive)
q           " stop recording
@q          " execute runs until it hits a line without comma
```

The macro stops when any command fails (e.g., `f,` finds no comma). This gives you automatic termination.

**Macro across files:**

```vim
:args *.py              " load all Python files into arglist
:argdo normal @a        " run macro 'a' on every file
:argdo update           " save all modified files
```

## 4. Registers Your Clipboard Multiplied

Vim has 26 named registers (`a-z`), plus special ones. Stop losing yanked text.

```vim
"ayy        " yank line into register a
"bdd        " delete line into register b (also saves it)
"ap         " paste from register a
"Ayy        " APPEND to register a (uppercase = append)

" Special registers
""          " unnamed (last delete/yank)
"0          " last yank (not delete!)
"+          " system clipboard
"*          " primary selection (X11)
"/          " last search pattern
".          " last inserted text
"%          " current filename
":          " last command
```

### The Yank Register Trick

Problem: you yank text, then delete something, and your yank is gone.

Solution: `"0p` always pastes your last *yank*, regardless of deletes. Deletes go to `"1`-`"9` (a delete history stack).

```vim
yiw         " yank a word
diw         " delete another word (unnamed register overwritten)
"0p         " paste the YANKED word, not the deleted one
```

## 5. Marks Bookmarks with Intent

Marks save cursor positions. Lowercase marks are buffer-local; uppercase marks are global (cross-file).

```vim
ma          " set mark 'a' at current position
'a          " jump to line of mark 'a'
`a          " jump to exact position of mark 'a'

mA          " set GLOBAL mark 'A' (works across files)
'A          " jump to file and line of mark 'A'
```

### Workflow: Marks as Context Switches

When debugging, mark your "home base" and "investigation site":

```vim
mH          " mark H = Home (where I'm working)
mI          " mark I = Investigation (where bug manifests)
" ... jump around reading code ...
'H          " back to home
'I          " back to investigation site
```

Special marks:

| Mark | Meaning |
|------|---------|
| `` ` `` | Position before last jump |
| `'.` | Position of last change |
| `'^` | Position of last insert |
| `'[` / `']` | Start/end of last yank or change |

`` `` `` (backtick-backtick) toggles between your last two positions. Essential for "I went somewhere, now I want to go back."

## 6. Quickfix List IDE-Grade Navigation

The quickfix list is Vim's structured results pane. `:make`, `:grep`, and `:vimgrep` populate it.

```vim
:vimgrep /TODO/ **/*.py     " search all Python files
:copen                       " open quickfix window
:cnext / :cprev              " navigate results
:cfdo %s/TODO/DONE/g | update  " fix across all files
```

### Integrating with External Tools

```vim
:set grepprg=rg\ --vimgrep  " use ripgrep
:grep 'function_name' src/   " results go to quickfix
:copen                        " navigate structured results
```

**Location list** a per-window variant:

```vim
:lvimgrep /pattern/ %        " search current file only
:lopen                       " per-window results
```

Keybindings that make quickfix usable:

```vim
nnoremap ]q :cnext<CR>
nnoremap [q :cprev<CR>
nnoremap ]l :lnext<CR>
nnoremap [l :lprev<CR>
```

## 7. Netrw The Built-in File Explorer

No NERDTree needed. Netrw ships with Vim.

```vim
:Explore          " open explorer in current file's directory
:Sexplore         " horizontal split + explore
:Vexplore         " vertical split + explore
:Lexplore         " persistent left-pane explorer (toggle)
```

### Netrw Essentials

| Key | Action |
|-----|--------|
| `%` | Create new file |
| `d` | Create directory |
| `D` | Delete file/dir |
| `R` | Rename |
| `t` | Open in new tab |
| `v` | Open in vertical split |
| `gh` | Toggle hidden files |

Configuration for a sane netrw:

```vim
let g:netrw_banner = 0        " hide banner
let g:netrw_liststyle = 3     " tree view
let g:netrw_winsize = 25      " 25% width
let g:netrw_browse_split = 4  " open in previous window
```

## 8. Splits Strategy Window Management

```vim
:sp file        " horizontal split
:vsp file       " vertical split
Ctrl-w s        " split current buffer horizontally
Ctrl-w v        " split current buffer vertically
Ctrl-w o        " close all other windows (":only")
Ctrl-w =        " equalize window sizes
Ctrl-w _        " maximize current window height
Ctrl-w |        " maximize current window width
```

### The 70/30 Layout

For most development, one large window + one reference:

```vim
:vsp
Ctrl-w L        " move current window to far right
:vertical resize 80  " set reference window to 80 columns
```

Navigation without thinking:

```vim
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l
```

## 9. The `:g` Command and `:norm` Bulk Operations

`:g/pattern/command` executes a command on every line matching a pattern. Combined with `:norm`, it's a programmable editor.

```vim
:g/^#/d                 " delete all lines starting with #
:g/console.log/d        " remove all console.logs
:g!/important/d         " delete lines NOT matching (inverse)
:g/TODO/norm A // FIX   " append " // FIX" to every TODO line
:g/^$/d                 " remove all blank lines
:g/function/t$          " copy all function lines to end of file
:g/^import/m0           " move all imports to top of file
```

### Combining `:g` with Ranges

```vim
:10,50g/error/d         " delete 'error' lines between 10-50
:.,$g/^$/d              " remove blank lines from cursor to end
```

## 10. A Complete Plugin-Free Workflow

Here's the `.vimrc` that ties it all together under 50 lines, zero plugins:

```vim
set nocompatible
filetype plugin indent on
syntax on

" Essentials
set number relativenumber
set ignorecase smartcase
set incsearch hlsearch
set expandtab shiftwidth=4 tabstop=4
set autoindent smartindent
set hidden                    " allow unsaved buffers
set path+=**                  " recursive file finding
set wildmenu wildmode=longest:full,full

" Persistent undo
set undofile
set undodir=~/.vim/undodir

" Netrw config
let g:netrw_banner=0
let g:netrw_liststyle=3

" Fast navigation
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l
nnoremap ]q :cnext<CR>
nnoremap [q :cprev<CR>

" Leader shortcuts
let mapleader=" "
nnoremap <leader>f :find *
nnoremap <leader>b :buffer *
nnoremap <leader>g :grep<space>

" Use ripgrep if available
if executable('rg')
  set grepprg=rg\ --vimgrep
endif
```

### The Workflow in Practice

1. **Find file**: `:find *.py<Tab>` (uses `path+=**`)
2. **Search project**: `:grep 'pattern' src/` → `:copen`
3. **Navigate**: quickfix `]q`/`[q`, marks, `` ` ``
4. **Edit**: text objects + dot command
5. **Bulk changes**: macros or `:g/pattern/norm`
6. **Multi-file**: `:args` + `:argdo`

No plugin manager, no LSP config, no 2000-line vimrc. Just Vim's grammar, composed.

## The Compounding Effect

Each trick multiplies the others:

- **Macros + text objects** = complex edits recorded in 3 keystrokes
- **Dot + marks** = repeat edits at bookmarked locations
- **Quickfix + `:cfdo`** = project-wide refactoring
- **Registers + macros** = macros stored in registers, editable as text (`"ap`, edit, `"ayy`)
- **`:g` + `:norm` + text objects** = bulk semantic operations

The investment curve is steep for two weeks, then it pays dividends for decades.
