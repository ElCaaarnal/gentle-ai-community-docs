---
description: Answer from the published Gentle AI wiki via the gentle-ai-docs MCP server
argument-hint: <question>
allowed-tools: mcp__gentle-ai-docs__search_docs
---

Answer this question using ONLY the Gentle AI wiki: $ARGUMENTS

## How to answer

1. Call `search_docs` with the key terms of the question. Match `locale` to the
   language the question is written in.
2. If the first result set is thin or off-target, search once more with
   different terms before concluding anything.
3. Answer from what the tool returned, and cite the canonical URL of each
   section you used.
4. Reply in the language the question was asked in.

## Rules

- The wiki is the only source. You have no other tool here, by design.
- Do not fill gaps from memory. Your training data about Gentle AI is outdated
  and misstates phase counts, version numbers, and command flags.
- If the wiki does not cover it, say so plainly and name what you did search
  for. An honest gap is useful; an invented answer is not.
- Reproduce commands and code exactly as returned, including line breaks. Never
  reconstruct a command from prose.
- If the wiki contradicts what you believed, follow the wiki and say that it
  corrected you.

## Prerequisite

This needs the `gentle-ai-docs` MCP server connected. If the tool is
unavailable, say so and stop — do not answer the question from memory instead.
