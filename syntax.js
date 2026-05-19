(function () {
  "use strict";

  const phpKeywords = new Set([
    "class",
    "echo",
    "false",
    "final",
    "function",
    "int",
    "new",
    "null",
    "public",
    "readonly",
    "static",
    "string",
    "true",
    "use",
    "void"
  ]);

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function span(className, value) {
    return "<span class=\"tok-" + className + "\">" + escapeHtml(value) + "</span>";
  }

  function readQuoted(source, start) {
    const quote = source[start];
    let index = start + 1;

    while (index < source.length) {
      if (source[index] === "\\") {
        index += 2;
        continue;
      }
      if (source[index] === quote) {
        return index + 1;
      }
      index++;
    }

    return source.length;
  }

  function readWhile(source, start, matcher) {
    let index = start;

    while (index < source.length && matcher(source[index])) {
      index++;
    }

    return index;
  }

  function highlightPhp(source) {
    let index = 0;
    let html = "";

    while (index < source.length) {
      if (source.startsWith("<?php", index)) {
        html += span("keyword", "<?php");
        index += 5;
        continue;
      }

      if (source.startsWith("//", index)) {
        const end = source.indexOf("\n", index);
        const next = end === -1 ? source.length : end;
        html += span("comment", source.slice(index, next));
        index = next;
        continue;
      }

      if (source[index] === "'" || source[index] === "\"") {
        const end = readQuoted(source, index);
        html += span("string", source.slice(index, end));
        index = end;
        continue;
      }

      if (source[index] === "$") {
        const end = readWhile(source, index + 1, char => /[A-Za-z0-9_]/.test(char));
        html += span("variable", source.slice(index, end));
        index = end;
        continue;
      }

      if (/[0-9]/.test(source[index])) {
        const end = readWhile(source, index, char => /[0-9_]/.test(char));
        html += span("number", source.slice(index, end));
        index = end;
        continue;
      }

      if (/[A-Za-z_]/.test(source[index])) {
        const end = readWhile(source, index, char => /[A-Za-z0-9_\\]/.test(char));
        const word = source.slice(index, end);
        const next = source.slice(end).match(/^\s*\(/);

        if (phpKeywords.has(word)) {
          html += span("keyword", word);
        } else if (word.includes("\\") || /^[A-Z]/.test(word)) {
          html += span("class", word);
        } else if (next) {
          html += span("function", word);
        } else {
          html += escapeHtml(word);
        }

        index = end;
        continue;
      }

      html += escapeHtml(source[index]);
      index++;
    }

    return html;
  }

  function highlightBash(source) {
    return source.split("\n").map(line => {
      const match = line.match(/^(\s*)([A-Za-z0-9_.\/-]+)(.*)$/);

      if (!match) {
        return escapeHtml(line);
      }

      return escapeHtml(match[1])
        + span("command", match[2])
        + escapeHtml(match[3]).replace(/(^|\s)(--?[A-Za-z0-9][A-Za-z0-9_-]*)/g, "$1<span class=\"tok-flag\">$2</span>");
    }).join("\n");
  }

  function highlightIni(source) {
    return source.split("\n").map(line => {
      const match = line.match(/^([^=\s]+)(=)(.*)$/);

      if (!match) {
        return escapeHtml(line);
      }

      return span("keyword", match[1]) + escapeHtml(match[2]) + span("string", match[3]);
    }).join("\n");
  }

  document.querySelectorAll("pre code[class^=\"language-\"]").forEach(block => {
    const language = Array.from(block.classList).find(name => name.startsWith("language-"));
    const source = block.textContent;

    if (language === "language-php") {
      block.innerHTML = highlightPhp(source);
    } else if (language === "language-bash") {
      block.innerHTML = highlightBash(source);
    } else if (language === "language-ini") {
      block.innerHTML = highlightIni(source);
    }
  });
}());
