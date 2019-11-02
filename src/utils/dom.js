// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

export class Element {
  constructor(element) {
    this.element = element;
  }

  attr(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  html(value) {
    this.element.innerHTML = value;
    return this;
  }

  text(value) {
    this.element.textContent = value;
    return this;
  }

  clear() {
    return this.html('');
  }

  append(tag) {
    return new Element(
      this.element.appendChild(
        document.createElementNS(
          tag === 'svg'
            ? 'http://www.w3.org/2000/svg'
            : this.element.namespaceURI,
          tag
        )
      )
    );
  }

  on(event, fn) {
    this.element.addEventListener(event, fn);
    return this;
  }
}
