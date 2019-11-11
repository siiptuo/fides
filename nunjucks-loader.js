// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const nunjucks = require('nunjucks');
const SafeString = nunjucks.runtime.SafeString;
const path = require('path');
const fs = require('fs');

// Support `require` by first inserting markers around the module name in the
// rendered template and later replacing them by an actual call to `require`.
const requireBegin = '__REQUIRE_BEGIN_GJRATYQZ__';
const requireEnd = '__REQUIRE_END_HTMZXRXG__';
const requireRegExp = new RegExp(requireBegin + '(.*?)' + requireEnd, 'g');

// Custom Nunjucks loader which loads templates from the file system, supports
// relative paths and adds dependencies to webpack.
class MyLoader {
  constructor(webpackLoader) {
    this.webpackLoader = webpackLoader;
  }

  getSource(name) {
    const fullpath = path.resolve(this.webpackLoader.context, name);
    this.webpackLoader.addDependency(fullpath);
    return {
      src: fs.readFileSync(fullpath, 'utf-8'),
      path: fullpath,
    };
  }
}

module.exports = function(content) {
  const env = new nunjucks.Environment(new MyLoader(this));
  const html = env.renderString(content, {
    require: module => new SafeString(requireBegin + module + requireEnd),
  });
  const code = JSON.stringify(html).replace(
    requireRegExp,
    '" + require("$1") + "'
  );
  return 'module.exports = ' + code + ';';
};
