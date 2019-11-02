// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const { spawnSync } = require('child_process');
const loaderUtils = require('loader-utils');

function ffmpegTranscode(source, args = []) {
  const { status, stdout, stderr } = spawnSync(
    'ffmpeg',
    ['-i', 'pipe:', ...args, 'pipe:'],
    { input: source }
  );
  if (status) {
    throw new Error('ffmpeg failed');
  }
  return stdout;
}

module.exports = function(content) {
  const options = { name: '[hash].[ext]', ...loaderUtils.getOptions(this) };
  const output = {};
  for (const [format, args] of Object.entries(options.formats)) {
    const encodedContent = ffmpegTranscode(content, args);
    const interpolatedName = loaderUtils.interpolateName(
      this,
      options.name.replace('[ext]', format),
      { content: encodedContent }
    );
    this.emitFile(interpolatedName, encodedContent);
    output[format] = interpolatedName;
  }
  return 'module.exports = ' + JSON.stringify(output) + ';';
};

module.exports.raw = true;
