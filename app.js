(function () {
  "use strict";
  fetch("data.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(init).catch(function (e) {
    document.getElementById("hero-title").textContent = "Could not load data.json";
    document.getElementById("hero-meta").textContent = "Serve this folder over http (python3 -m http.server) – browsers block fetch() on file:// pages.";
  });
  function init(D) {
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function link(s) {
    if (!s) return el("span", { text: "Source: none found" });
    return el("a", { href: s.url, target: "_blank", rel: "noopener", text: s.name });
  }
  function fmtDate(iso) {
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function srcLine(prefix, s, asOf) {
    var p = el("span");
    p.appendChild(document.createTextNode(prefix + " "));
    p.appendChild(link(s));
    if (asOf) p.appendChild(document.createTextNode(" · as of " + fmtDate(asOf)));
    return p;
  }


  /* ---------- Hero ---------- */
  var n = D.nextEvent;
  $("hero-kicker").textContent = n.kicker;
  $("hero-title").textContent = n.name;
  $("hero-meta").textContent = n.dateText + " · " + n.location;
  (function countdown() {
    var p = n.startDate.split("-"), e = n.endDate.split("-");
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var start = new Date(+p[0], +p[1] - 1, +p[2]);
    var end = new Date(+e[0], +e[1] - 1, +e[2]);
    var days = Math.round((start - today) / 86400000);
    var box = $("hero-countdown");
    if (days > 0) box.innerHTML = "<b>" + days + "</b> day" + (days === 1 ? "" : "s") + " to go";
    else if (today <= end) box.innerHTML = "<b>Race weekend</b> is underway";
    else box.style.display = "none";
  })();
  $("hero-note").textContent = n.note;
  if (n.graphic) {
    var hg = el("img", { class: "hero-graphic", src: n.graphic, alt: "", width: "800", height: "160" });
    $("hero-meta").insertAdjacentElement("afterend", hg);
  }
  n.facts.forEach(function (f) { $("hero-facts").appendChild(el("li", { text: f })); });
  if (n.caveat) $("hero-caveat").textContent = "Note: " + n.caveat; else $("hero-caveat").style.display = "none";
  var hs = $("hero-src");
  hs.appendChild(document.createTextNode("Sources: "));
  n.sources.forEach(function (s, i) { if (i) hs.appendChild(document.createTextNode(" · ")); hs.appendChild(link(s)); });
  hs.appendChild(document.createTextNode(" · as of " + fmtDate(n.asOf)));

  D.status.items.forEach(function (it) {
    $("status").appendChild(el("div", { class: "stat" }, [
      el("small", { text: it.label }),
      el("strong", { text: it.value }),
      el("p", { text: it.detail }),
      el("div", { class: "s" }, [srcLine("Source:", it.source, D.status.asOf)])
    ]));
  });

  /* ---------- Schedule ---------- */
  $("schedule-asof").textContent = "As of " + fmtDate(D.schedule.asOf) + ".";
  D.schedule.upcoming.forEach(function (u) {
    $("upcoming").appendChild(el("div", { class: "up" }, [
      el("div", { class: "d", text: u.date }),
      el("div", { class: "e", text: u.event }),
      el("div", { class: "p", text: u.place }),
      el("span", { class: "tag", text: u.tag }),
      el("span", { class: "s" }, [srcLine("Source:", u.source)])
    ]));
  });
  D.schedule.completed.groups.forEach(function (g, i) {
    var tbody = el("tbody");
    g.rows.forEach(function (r) {
      tbody.appendChild(el("tr", {}, [
        el("td", { class: "pos", text: r[0] }), el("td", { class: "r", text: r[1] }),
        el("td", { text: r[2] }), el("td", { class: "hm col-hm", text: r[3] })
      ]));
    });
    var table = el("table", {}, [
      el("thead", {}, [el("tr", {}, [el("th", { class: "pos", text: "Rd" }), el("th", { text: "Date" }), el("th", { text: "Location" }), el("th", { class: "col-hm", text: "Venue" })])]),
      tbody
    ]);
    var d = el("details", {}, [
      el("summary", { text: g.title }),
      el("div", { class: "table-scroll" }, [table])
    ]);
    if (i === 0) d.setAttribute("open", "");
    $("completed").appendChild(d);
  });
  $("completed").appendChild(el("p", { class: "sched-src" }, [srcLine("Source:", D.schedule.completed.source, D.schedule.asOf)]));

  /* ---------- Results & standings (tabbed by class) ---------- */
  var cls = "450";

  function makeTable(head, rows, numCol) {
    var ths = head.map(function (h, i) {
      var c = i === 0 ? "pos" : (h === "Hometown" ? "col-hm" : "");
      return el("th", { class: c, text: h });
    });
    var tb = el("tbody");
    rows.forEach(function (r) {
      var tr = el("tr", { class: r[0] <= 3 ? "p" + r[0] : "" });
      r.forEach(function (v, i) {
        var c = i === 0 ? "pos" : i === 1 ? "r" : i === 2 ? "hm col-hm" : "num";
        tr.appendChild(el("td", { class: c, text: String(v) }));
      });
      tb.appendChild(tr);
    });
    return el("div", { class: "table-scroll" }, [el("table", {}, [el("thead", {}, [el("tr", {}, ths)]), tb])]);
  }

  function renderResults() {
    var box = $("results-list"); box.innerHTML = "";
    D.results.forEach(function (ev) {
      var c = ev.classes[cls];
      if (!c) {
        box.appendChild(el("div", { class: "card" }, [el("div", { class: "card-h" }, [el("h3", { text: ev.name }), el("div", { class: "m", text: "No " + cls + " results found for this event." })])]));
        return;
      }
      box.appendChild(el("article", { class: "card" }, [
        el("div", { class: "card-h" }, [
          el("h3", { text: ev.name + " — " + c.label }),
          el("div", { class: "m", text: ev.date + " · " + ev.venue }),
          el("p", { class: "sum", text: ev.summary })
        ]),
        makeTable(["Pos", "Rider", "Hometown", ev.detailLabel], c.rows),
        el("div", { class: "card-f" }, [srcLine("Source:", ev.source, ev.asOf), document.createTextNode(" · top 10 shown")])
      ]));
    });
  }

  function renderStandings() {
    var box = $("standings-list"); box.innerHTML = "";
    D.standings.forEach(function (s) {
      var c = s.classes[cls];
      var kids = [el("div", { class: "card-h" }, [
        el("h3", { text: s.title + " — " + c.label }),
        el("div", { class: "m", text: s.note })
      ])];
      c.tables.forEach(function (t) {
        if (t.title) kids.push(el("h4", { text: t.title }));
        kids.push(makeTable(["Pos", "Rider", "Hometown", "Pts"], t.rows));
      });
      kids.push(el("div", { class: "card-f" }, [srcLine("Source:", s.source, s.asOf), document.createTextNode(" · top 10 shown")]));
      box.appendChild(el("article", { class: "card" }, kids));
    });
  }

  function setClass(c) {
    cls = c;
    document.querySelectorAll(".tab").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset["class"] === c)); });
    renderResults(); renderStandings();
  }
  document.querySelectorAll(".tab").forEach(function (b) {
    b.addEventListener("click", function () { setClass(b.dataset["class"]); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var o = b.dataset["class"] === "450" ? "250" : "450"; setClass(o); document.querySelector('.tab[data-class="' + o + '"]').focus(); }
    });
  });
  setClass("450");

  /* ---------- News ---------- */
  D.news.forEach(function (h) {
    $("news-list").appendChild(el("article", { class: "n" }, [
      el("time", { datetime: h.date, text: fmtDate(h.date) }),
      el("h3", { text: h.title }),
      el("p", { text: h.summary }),
      el("div", { class: "s" }, [el("a", { href: h.source.url, target: "_blank", rel: "noopener", text: "Read on " + h.source.name + " →" })])
    ]));
  });

  /* ---------- Not found / footer ---------- */
  D.notFound.forEach(function (t) { $("notfound").appendChild(el("li", { text: t })); });
  D.sources.forEach(function (s) { $("sources-list").appendChild(el("li", {}, [link(s)])); });
  $("generated").textContent = fmtDate(D.generated);

  /* ---------- Brands ---------- */
  if (D.brands) {
    var B = D.brands;
    $("brands-note").textContent = B.note + " As of " + fmtDate(B.asOf) + ".";
    var cur = 0;
    function item(it, extra) {
      var kids = [];
      if (extra) kids.push(el("div", { class: "it-meta", text: extra }));
      kids.push(el("h5", { text: it.title }));
      kids.push(el("p", { text: it.text }));
      var f = el("div", { class: "it-src" }, [srcLine("Source:", it.source, it.asOf)]);
      if (it.expires) f.appendChild(el("span", { class: "pill", text: it.expires }));
      kids.push(f);
      return el("div", { class: "it" }, kids);
    }
    function group(title, items, emptyText, fn) {
      var g = el("div", { class: "grp" }, [el("h4", { text: title })]);
      if (!items.length) g.appendChild(el("p", { class: "empty", text: emptyText }));
      else items.forEach(function (i) { g.appendChild(fn(i)); });
      return g;
    }
    function renderBrand(i) {
      cur = i;
      var b = B.list[i];
      document.querySelectorAll(".btab").forEach(function (t, k) { t.setAttribute("aria-selected", String(k === i)); });
      var p = $("brand-panel"); p.innerHTML = "";
      p.style.setProperty("--bc", b.color); p.style.setProperty("--ba", b.accent);
      var banner = el("div", { class: "banner" }, [
        el("img", { src: b.graphic, alt: "", width: "800", height: "220" }),
        el("div", { class: "banner-t" }, [el("span", { text: b.name })])
      ]);
      var grid = el("div", { class: "bgrid" }, [
        group("New model news", b.models, "Nothing found.", function (m) { return item(m); }),
        group("Events", b.events, "No event found in the sources checked.", function (e) { return item(e, e.date + " · " + e.place); }),
        group("Deals & promotions", b.deals, "No promotion found.", function (d) { return item(d); })
      ]);
      p.appendChild(el("div", { class: "bpanel" }, [banner, grid]));
      if (b.notFound && b.notFound.length) {
        var ul = el("ul", { class: "nf" });
        b.notFound.forEach(function (t) { ul.appendChild(el("li", { text: "Not found: " + t })); });
        p.firstChild.appendChild(ul);
      }
    }
    B.list.forEach(function (b, i) {
      var t = el("button", { class: "btab", role: "tab", "aria-selected": "false", text: b.name });
      t.style.setProperty("--bc", b.color);
      t.addEventListener("click", function () { renderBrand(i); });
      $("brand-tabs").appendChild(t);
    });
    renderBrand(0);

    var G = B.gearDeals;
    $("gear-title").textContent = G.title;
    var rows = el("tbody");
    G.items.forEach(function (g) {
      rows.appendChild(el("tr", {}, [el("td", { class: "r", text: g.name }), el("td", { class: "num was", text: g.was }), el("td", { class: "num now", text: g.now })]));
    });
    $("gear-deals").appendChild(el("div", { class: "card" }, [
      el("div", { class: "card-h" }, [el("div", { class: "m", text: G.note })]),
      el("div", { class: "table-scroll" }, [el("table", {}, [el("thead", {}, [el("tr", {}, [el("th", { text: "Item" }), el("th", { text: "Was" }), el("th", { text: "Now" })])]), rows])]),
      (function () {
        var f = el("div", { class: "card-f" }, [srcLine("Source:", G.source, G.asOf)]);
        if (G.extraSources && G.extraSources.length) {
          G.extraSources.forEach(function (s) {
            f.appendChild(document.createTextNode(" · "));
            f.appendChild(link(s));
          });
        }
        return f;
      })()
    ]));
  }
  }
})();
