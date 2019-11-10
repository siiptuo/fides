// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

const loaderUtils = require('loader-utils');
const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');

const requireBegin = new RegExp('__REQUIRE_BEGIN_GJRATYQZ__', 'g');
const requireEnd = new RegExp('__REQUIRE_END_HTMZXRXG__', 'g');

class MyLoader {
  constructor(context, addDependency) {
    this.context = context;
    this.addDependency = addDependency;
  }

  getSource(name) {
    const fullpath = path.resolve(this.context, name);
    this.addDependency(fullpath);
    return {
      src: fs.readFileSync(fullpath, 'utf-8'),
      path: fullpath,
    };
  }
}

module.exports = function(content) {
  const options = loaderUtils.getOptions(this);
  const env = new nunjucks.Environment(
    new MyLoader(this.context, this.addDependency)
  );
  const html = env.renderString(content, {
    require: url => requireBegin.source + url + requireEnd.source,
  });
  const code = JSON.stringify(html)
    .replace(new RegExp(requireBegin, 'g'), '" + require("')
    .replace(new RegExp(requireEnd, 'g'), '") + "');
  return 'module.exports = ' + code + ';';
};
