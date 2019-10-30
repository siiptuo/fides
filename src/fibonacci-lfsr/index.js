// SPDX-FileCopyrightText: 2019 Tuomas Siipola
// SPDX-License-Identifier: GPL-3.0-or-later

import "../style.css";

function createElement(parent, tag, attrs) {
  const elem = parent.appendChild(
    document.createElementNS("http://www.w3.org/2000/svg", tag)
  );
  for (const attr in attrs) {
    elem.setAttribute(attr, attrs[attr]);
  }
  return elem;
}

const main = document.body.getElementsByTagName("main")[0];

const svg = main.appendChild(
  document.createElementNS("http://www.w3.org/2000/svg", "svg")
);

const div = main.appendChild(document.createElement("div"));

const $sizeLabel = div.appendChild(document.createElement("label"));
$sizeLabel.textContent = "State bits: ";

const $size = $sizeLabel.appendChild(document.createElement("input"));
$size.setAttribute("type", "number");
$size.setAttribute("value", "16");
$size.setAttribute("min", "1");
$size.addEventListener("change", event => {
  initialize(+event.target.value);
});

const $next = div.appendChild(document.createElement("button"));
$next.textContent = "Next state";
$next.addEventListener("click", event => {
  state = [
    state.filter((b, i) => taps[i]).reduce((a, b) => a ^ b, 0),
    ...state.slice(0, -1)
  ];
  updateState();
});

const $output = main.appendChild(document.createElement("p"));
let $state = [];
let state = null,
  taps = null;

function updateState() {
  let output = "<var>x</var><sup>" + taps.length + "</sup>";
  for (let i = taps.length - 2; i >= 1; i--) {
    if (taps[i]) {
      output += "+<var>x</var><sup>" + (i + 1) + "</sup>";
    }
  }
  if (taps[0]) {
    output += "+<var>x</var>";
  }
  output += "+1";
  $output.innerHTML =
    '<strong>Taps</strong> <span class="taps">' +
    output +
    "</span>" +
    "<table>" +
    "<thead>" +
    '<tr><th colspan="2">State</th></tr>' +
    "</thead>" +
    "<tbody>" +
    "<tr><th>Binary</th><td>" +
    state.join("") +
    "</td></tr>" +
    "<tr><th>Hexadecimal</th><td>" +
    parseInt(state.join(""), 2)
      .toString(16)
      .toUpperCase()
      .padStart(Math.ceil(state.length / 4), "0") +
    "</td></tr>" +
    "<tr><th>Decimal</th><td>" +
    parseInt(state.join(""), 2) +
    "</td></tr>" +
    "</tbody></table>";
  for (let i = 0; i < state.length; i++) {
    $state[i].textContent = state[i];
  }
}

function initialize(bits) {
  svg.innerHTML = "";
  const defs = svg.appendChild(
    document.createElementNS("http://www.w3.org/2000/svg", "defs")
  );
  defs.innerHTML = `
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
    `;

  state = new Array(bits).fill(0);
  taps = new Array(bits).fill(0);
  taps[bits - 1] = 1;
  $state = new Array(state.length);

  svg.setAttribute("width", 20 * state.length + 40);
  svg.setAttribute("height", 20 + 20 + 20);

  for (let i = 0; i < state.length; i++) {
    const x = 20 + 20 * i;
    const y = 25;
    const w = 20;
    const h = 20;

    const g = createElement(svg, "g", { class: "bit" });
    g.addEventListener("click", event => {
      state[i] ^= 1;
      updateState();
    });

    createElement(g, "rect", {
      x: x,
      y: y,
      width: w,
      height: h,
      fill: "white",
      "stroke-width": 2,
      stroke: "black"
    });

    $state[i] = createElement(g, "text", {
      x: x + w / 2,
      y: y + h / 1.5,
      "font-family": "monospace",
      "font-size": "10px",
      "text-anchor": "middle"
    });
  }

  createElement(svg, "path", {
    d: [
      "M",
      20 + 20 * state.length,
      25 + 20 / 2,
      "h",
      10,
      "v",
      -25,
      "H",
      10,
      "v",
      25,
      "h",
      7
    ].join(" "),
    fill: "none",
    stroke: "black",
    "stroke-width": 2,
    "marker-end": "url(#arrow)"
  });

  const circleRadius = 6;
  const crossWidth = 2;
  const crossMargin = 2;

  for (let i = 0; i < state.length - 1; i++) {
    let g = createElement(svg, "g", {
      class: "tap",
      opacity: taps[i]
    });
    g.addEventListener("click", event => {
      taps[i] ^= 1;
      g.setAttribute("opacity", taps[i]);
      updateState();
    });

    createElement(g, "rect", {
      x: 20 + 20 * i,
      y: 0,
      width: 20,
      height: 25,
      opacity: 0
    });

    createElement(g, "line", {
      x1: 20 + i * 20 + 20 / 2,
      y1: 25,
      x2: 20 + i * 20 + 20 / 2,
      y2: 10 + 3 + circleRadius,
      stroke: "black",
      "stroke-width": 2,
      "marker-end": "url(#arrow)"
    });

    createElement(g, "line", {
      x1: 20 + 20 / 2 + 3 + circleRadius + i * 20 + 1,
      y1: 10,
      x2: 20 + 20 / 2 + 3 + circleRadius + i * 20,
      y2: 10,
      stroke: "black",
      "stroke-width": 2,
      "marker-end": "url(#arrow)"
    });

    const circleX = 20 + i * 20 + 20 / 2;
    const circleY = 10;

    createElement(g, "circle", {
      cx: circleX,
      cy: circleY,
      r: circleRadius,
      fill: "white",
      stroke: "black",
      "stroke-width": 2
    });

    createElement(g, "line", {
      x1: circleX - circleRadius + crossMargin,
      y1: circleY,
      x2: circleX + circleRadius - crossMargin,
      y2: circleY,
      stroke: "black",
      "stroke-width": crossWidth
    });

    createElement(g, "line", {
      x1: circleX,
      y1: circleY - circleRadius + crossMargin,
      x2: circleX,
      y2: circleY + circleRadius - crossMargin,
      stroke: "black",
      "stroke-width": crossWidth
    });
  }

  updateState();
}

initialize(+$size.value);
