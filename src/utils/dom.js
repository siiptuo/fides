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

  text(value) {
    this.element.textContent = value;
    return this;
  }

  clear() {
    this.element.innerHTML = '';
    return this;
  }

  append(tag) {
    return new Element(
      this.element.appendChild(
        document.createElementNS(this.element.namespaceURI, tag)
      )
    );
  }
}
