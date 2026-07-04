const fs = require('fs');
const path = require('path');

module.exports = function split(content, outDir) {

  const lines = content.split(/\r?\n/);

  let currentFile = null;
  let buffer = [];
  let files = [];

  function save() {
    if (!currentFile) return;

    const filePath = path.join(outDir, currentFile);
    const fileContent = buffer.join('\n').trim();

    files.push({
      name: currentFile,
      content: fileContent,
      path: filePath
    });

    currentFile = null;
    buffer = [];
  }

  for (let line of lines) {

    if (line.startsWith('=====') && line.endsWith('=====')) {

      save();

      currentFile = line.replace(/=/g, '').trim();
      continue;
    }

    if (currentFile) {
      buffer.push(line);
    }
  }

  save();

  return files;
};