---
title: '10 Vim Tricks That Changed How I Code'
description: 'Practical Vim tips that compound over time new_textmacros, text objects, registers, and the dot command.'
pubDate: 2024-05-01
category: 'tech-tips'
tags: ['vim', 'productivity', 'developer-tools', 'workflow']
draft: false
---

## 1. The Dot Command

`.` repeats your last change. Combined with `/` search and `n` for next match, you can refactor without regex.

## 2. Text Objects

`ci"` new_textchange inside quotes. `da(` new_textdelete around parentheses. `vip` new_textselect inner paragraph. Think in objects, not characters.

## 3. Macros

`qa` to record, `q` to stop, `@a` to replay, `100@a` to replay 100 times. Automate repetitive edits.

## 4. Registers

`"ayy` new_textyank to register a. `"ap` new_textpaste from register a. `"+y` new_textyank to system clipboard.

## 5. `:g/pattern/command`

Global command. `:g/TODO/d` deletes all TODO lines. `:g/^$/d` removes blank lines. Incredibly powerful.

## 6. `ctrl-a` / `ctrl-x`

Increment/decrement numbers under cursor. Works on hex too.

## 7. `gf` new_textGo to File

Cursor on a filename? `gf` opens it. Works with relative paths.

## 8. Visual Block Mode

`ctrl-v` for column editing. Insert text on multiple lines simultaneously.

## 9. `:!command`

Run shell commands without leaving Vim. `:%!sort` sorts the entire file.

## 10. Persistent Undo

```vim
set undofile
set undodir=~/.vim/undodir
```

Undo history survives closing and reopening files.
