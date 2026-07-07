// Render the extracted document IR into print-ready HTML using the site's
// field-notebook theme (tools/docgen/theme.css). One HTML file per library
// document, written to tools/out/docgen/html/ together with a meta.json that
// carries each document's footer line for the PDF print step.
//
//   node tools/docgen/render.mjs            # render all 77 documents
//   node tools/docgen/render.mjs TTT-01     # render only matching slugs/ids
import fs from "node:fs";
import path from "node:path";
import { DOCS, IR_DIR, HTML_DIR } from "./manifest.mjs";

// Camp identity tokens, mirroring src/deck/theme.js (treesInk/treesAcc,
// pyInk/pyAcc) and the site brand for program-wide documents.
const CAMPS = {
  trees: { ink: "#2a5736", acc: "#b04a2f", label: "From Trees to Tech" },
  pystem: { ink: "#1c3257", acc: "#A85F12", label: "PY-STEM" },
  "": { ink: "#222222", acc: "#9D2235", label: "2026 STEM Camps" },
};

// Source-palette roles. Heading and table-accent colors in the DOCX sources
// translate to site tokens; camp inks resolve per document via CSS variables.
const ROLE_BY_COLOR = {
  D97A34: "warn", // prep, troubleshooting, backup
  B23A3A: "danger", // safety
  B07A1E: "acc", // scoring, rewards
};
const TABLE_ROLE = {
  "2E7D52": CAMPS.trees,
  "2E5E8C": CAMPS.pystem,
  D97A34: { ink: "#8A5310", acc: "#8A5310" },
  B07A1E: null, // keep the document's own camp accent
};
const CALLOUT_BY_FILL = {
  E5F0E9: "ok",
  FBEAEA: "danger",
  FBEDE0: "",
  E4EDF5: "info",
};

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;");

const textOf = (b) => (b.runs || []).map((r) => r.t).join("");
const cellText = (c) => c.blocks.map((b) => textOf(b)).join(" ").trim();
const sz0 = (b) => (b.runs && b.runs[0] ? b.runs[0].sz : null);
const FILL_RE = /_{3,}/;

function runColorClass(hex) {
  if (!hex) return "";
  if (hex === "5A5A5A" || hex === "8A8A8A") return "muted";
  if (["1B3A5C", "2E7D52", "2E5E8C"].includes(hex)) return "lead";
  if (hex === "D97A34") return "c-warn";
  if (hex === "B23A3A") return "c-danger";
  if (hex === "B07A1E") return "c-acc";
  return "";
}

// Inline style hooks for the few run colors that need explicit tokens.
const RUN_STYLE = {
  "c-warn": "color:var(--warn)",
  "c-danger": "color:var(--primary)",
  "c-acc": "color:var(--camp-acc)",
};

function renderRuns(runs, { stripFills = true } = {}) {
  let html = "";
  for (const r of runs) {
    let t = r.t;
    if (stripFills && FILL_RE.test(t)) continue; // write-in fills render separately
    let body = esc(t).replace(/\n/g, "<br>");
    const cls = runColorClass(r.color);
    const styles = [];
    if (cls === "lead" || r.b) styles.push("font-weight:600");
    if (cls === "lead") styles.push("color:var(--camp-ink)");
    if (cls === "muted") styles.push("color:var(--ink2)");
    if (RUN_STYLE[cls]) styles.push(RUN_STYLE[cls]);
    if (r.i) body = `<em>${body}</em>`;
    html += styles.length ? `<span style="${styles.join(";")}">${body}</span>` : body;
  }
  return html;
}

// ---- paragraph classification ------------------------------------------------

function classifyPara(b) {
  const t = textOf(b).trim();
  const first = b.runs[0];
  const s = first.sz;
  if (/^•/.test(first.t.trim())) return "bullet";
  if (/^□/.test(first.t.trim())) return "check";
  if (/^\d+\s*$/.test(first.t.trim()) && (b.hanging || 0) >= 300) return "step";
  if (/^Phase\s+\d+/.test(first.t)) return "phase";
  if (/^Problem:/.test(first.t)) return "probfix";
  if (/^Sources:/.test(first.t)) return "sources";
  if (b.runs.every((r) => /^[\s_ ]*$/.test(r.t))) return "blankline";
  if (b.runs.some((r) => FILL_RE.test(r.t))) return "write";
  if (s === 18 || (s === 19 && /^[A-Z0-9 ·+&,:-]+$/.test(t) && t === t.toUpperCase())) return "eyebrow";
  if (s >= 40) return "title";
  if (s === 36) return "kicker";
  if (s === 21) return "h2";
  if (s === 22 && first.b) return "h3";
  if (s === 22) return "subtitle";
  return "body";
}

function roleClassOf(b) {
  const role = ROLE_BY_COLOR[b.runs[0].color];
  return role ? ` class="role-${role}"` : "";
}

function renderPhase(b) {
  const name = b.runs[0].t.replace(/\s+$/, "");
  const time = b.runs
    .slice(1)
    .map((r) => r.t.trim())
    .join(" ")
    .trim();
  return `<div class="phase"><span class="name">${esc(name)}</span>${
    time ? `<span class="time">${esc(time)}</span>` : ""
  }</div>`;
}

function renderProbfix(b) {
  let html = "";
  for (const r of b.runs) {
    const body = esc(r.t);
    if (/^Problem:/.test(r.t)) html += `<span class="prob">${body}</span>`;
    else if (/^Fix:/.test(r.t)) html += `<span class="fix">${body}</span>`;
    else html += body;
  }
  return `<p class="probfix">${html}</p>`;
}

function renderWrite(b) {
  // A label with an embedded line break (the leaderboard's "Team 1 / name:")
  // renders its leading lines as plain text above the write-in row.
  const joined = b.runs.map((r) => r.t).join("");
  const lastBreak = joined.lastIndexOf("\n");
  if (lastBreak >= 0) {
    let pos = 0;
    const before = [];
    const after = [];
    for (const r of b.runs) {
      const end = pos + r.t.length;
      if (end <= lastBreak) before.push(r);
      else if (pos > lastBreak) after.push(r);
      else {
        if (r.t.slice(0, lastBreak - pos)) before.push({ ...r, t: r.t.slice(0, lastBreak - pos) });
        if (r.t.slice(lastBreak - pos + 1)) after.push({ ...r, t: r.t.slice(lastBreak - pos + 1) });
      }
      pos = end;
    }
    return `<p style="margin-bottom:2pt">${renderRuns(before, { stripFills: false })}</p>` +
      renderWrite({ ...b, runs: after });
  }
  // One trailing blank stretches to the line end; several blanks (score
  // strips) render as fixed-width inline rules between their labels.
  const segs = [];
  for (const r of b.runs) {
    for (const part of r.t.split(/(_{2,})/)) {
      if (!part) continue;
      if (/^_{2,}$/.test(part)) segs.push({ fill: part.length });
      else if (part.trim()) segs.push({ run: { ...r, t: part } });
    }
  }
  const fills = segs.filter((s) => s.fill).length;
  if (fills <= 1 && segs.length && segs[segs.length - 1].fill) {
    const label = segs
      .filter((s) => s.run)
      .map((s) => renderRuns([s.run], { stripFills: false }))
      .join(" ")
      .trim();
    return `<div class="write"><span class="label">${label}</span><span class="fill"></span></div>`;
  }
  const inner = segs
    .map((s) =>
      s.fill
        ? `<span class="ifill" style="min-width:${Math.min(s.fill * 5, 160)}pt"></span>`
        : renderRuns([s.run], { stripFills: false })
    )
    .join(" ");
  return `<p class="iwrite">${inner}</p>`;
}

function renderListGroup(kind, items) {
  // Short lists stay on one page so a break never strands a single item;
  // long lists may break, but never inside an item.
  const totalText = items.reduce((n, b) => n + textOf(b).length, 0);
  const keep = items.length <= 4 || totalText < 360 ? " keep" : "";
  if (kind === "step") {
    const lis = items.map((b) => `<li>${renderRuns(b.runs.slice(1))}</li>`).join("\n");
    return `<ol class="steps${keep}">\n${lis}\n</ol>`;
  }
  const strip = (b) => {
    const runs = b.runs.slice();
    runs[0] = { ...runs[0], t: runs[0].t.replace(/^\s*[•□]\s*/, "") };
    return runs;
  };
  if (kind === "check") {
    const danger = items.filter((b) => b.runs[0].color === "B23A3A").length > items.length / 2;
    const lis = items.map((b) => `<li>${renderRuns(strip(b))}</li>`).join("\n");
    return `<ul class="checklist${danger ? " role-danger" : ""}${keep}">\n${lis}\n</ul>`;
  }
  const lis = items.map((b) => `<li>${renderRuns(strip(b))}</li>`).join("\n");
  return `<ul class="bullets${keep}">\n${lis}\n</ul>`;
}

// ---- tables --------------------------------------------------------------------

function isHeaderRow(row) {
  return row.header === true || row.cells.some((c) => c.fill && TABLE_ROLE[c.fill] !== undefined);
}

function tableRoleStyle(tbl) {
  for (const c of tbl.rows[0].cells) {
    const role = c.fill && TABLE_ROLE[c.fill];
    if (role) return ` style="--camp-ink:${role.ink};--camp-acc:${role.acc}"`;
  }
  return "";
}

const CODE_RE = /^(TTT|TTB|PYS|PYB)-\d{2}$/;

function renderTable(tbl) {
  const headed = isHeaderRow(tbl.rows[0]);
  const head = headed ? tbl.rows[0] : null;
  const body = headed ? tbl.rows.slice(1) : tbl.rows;
  const ncols = Math.max(...tbl.rows.map((r) => r.cells.length));
  const numeric = [];
  for (let i = 0; i < ncols; i++) {
    const vals = body.map((r) => (r.cells[i] ? cellText(r.cells[i]) : "")).filter(Boolean);
    numeric[i] = vals.length > 0 && vals.every((v) => /^[\d$.,%\s–-]+$/.test(v));
  }
  const cellHtml = (c, i, tag) => {
    const blockHtml = (b) => {
      if (b.kind === "table") return renderTable(b);
      if (b.runs.some((r) => FILL_RE.test(r.t))) return renderWrite(b);
      return renderRuns(b.runs);
    };
    const inner = c.blocks.map(blockHtml).join("<br>") || "&nbsp;";
    const classes = [];
    let style = "";
    if (numeric[i]) classes.push("num");
    if (tag === "td" && CODE_RE.test(cellText(c))) {
      classes.push("code");
      // Codes keep their camp ink everywhere, so TTB and PYB rows stay
      // distinguishable even in the warn-accented backup table.
      style = cellText(c).startsWith("TT") ? ' style="color:#2a5736"' : ' style="color:#1c3257"';
    }
    const cls = classes.length ? ` class="${classes.join(" ")}"` : "";
    return `<${tag}${cls}${style}>${inner}</${tag}>`;
  };
  // Short tables stay whole; long ones break between rows with the header
  // row repeating on each page.
  const keep = tbl.rows.length <= 12 ? ' class="keep"' : "";
  let html = `<table${keep}${tableRoleStyle(tbl)}>`;
  if (head) html += `<thead><tr>${head.cells.map((c, i) => cellHtml(c, i, "th")).join("")}</tr></thead>`;
  html += "<tbody>";
  for (const row of body) {
    const isTotal = /^Total\b/i.test(cellText(row.cells[0]));
    html += `<tr${isTotal ? ' class="total"' : ""}>${row.cells.map((c, i) => cellHtml(c, i, "td")).join("")}</tr>`;
  }
  html += "</tbody></table>";
  return html;
}

function renderCallout(tbl) {
  const cell = tbl.rows[0].cells[0];
  const kind = CALLOUT_BY_FILL[cell.fill] ?? "";
  const inner = cell.blocks
    .map((b) => {
      if (b.kind === "table") return renderTable(b);
      if (b.runs.some((r) => FILL_RE.test(r.t))) return renderWrite(b);
      return `<p>${renderRuns(b.runs)}</p>`;
    })
    .join("\n");
  return `<div class="callout ${kind}">${inner}</div>`;
}

function isCallout(tbl) {
  return tbl.rows.length === 1 && tbl.rows[0].cells.length === 1;
}

// Award certificate: a 1x1 framed card in the rewards kit.
function renderCert(tbl, camp) {
  const blocks = tbl.rows[0].cells[0].blocks;
  const name = blocks.find((b) => sz0(b) >= 36);
  const fieldsPara = blocks.find((b) => b.runs.some((r) => FILL_RE.test(r.t)));
  let fields = "";
  if (fieldsPara) {
    const labels = textOf(fieldsPara)
      .split(FILL_RE)
      .map((s) => s.trim())
      .filter(Boolean);
    fields = labels
      .map((l) => `<div class="cert-field"><div class="fill"></div><div class="tag">${esc(l.replace(/:$/, ""))}</div></div>`)
      .join("\n");
  }
  return `<div class="cert">
<div class="cert-eyebrow">${esc(camp.label)} · Award</div>
<div class="cert-name">${esc(textOf(name).trim())}</div>
<div class="cert-fields">${fields}</div>
</div>`;
}

// ---- generic flow ---------------------------------------------------------------

// Render a run of IR blocks as document flow. `opts.certs` turns the rewards
// kit's framed 1x1 tables into certificates; `opts.slips` wraps an h3 plus its
// following table so a score slip never splits across pages.
function renderFlow(blocks, camp, opts = {}) {
  const out = [];
  let i = 0;
  let headerDone = opts.headerDone || false;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.kind === "pagebreak") {
      out.push('<div class="page-break"></div>');
      i++;
      continue;
    }
    if (b.kind === "table") {
      if (opts.certs && isCallout(b) && b.rows[0].cells[0].fill === "FBEDE0" &&
          /^AWARD/.test(cellText(b.rows[0].cells[0]))) {
        out.push(renderCert(b, camp));
      } else if (isCallout(b)) {
        out.push(renderCallout(b));
      } else {
        out.push(renderTable(b));
      }
      i++;
      continue;
    }
    const kind = classifyPara(b);
    if (kind === "bullet" || kind === "check" || kind === "step") {
      const items = [];
      while (i < blocks.length && blocks[i].kind === "p" && classifyPara(blocks[i]) === kind) {
        items.push(blocks[i]);
        i++;
      }
      out.push(renderListGroup(kind, items));
      continue;
    }
    if (kind === "probfix") {
      // Problem-and-fix runs travel as one unit so a lone pair never strands.
      const items = [];
      while (i < blocks.length && blocks[i].kind === "p" && classifyPara(blocks[i]) === "probfix") {
        items.push(blocks[i]);
        i++;
      }
      const inner = items.map(renderProbfix).join("\n");
      out.push(items.length <= 5 ? `<div class="keep">${inner}</div>` : inner);
      continue;
    }
    i++;
    switch (kind) {
      case "eyebrow": {
        // A fresh eyebrow after the document header starts a new article
        // header (packet activities).
        out.push(`<div class="doc-head${headerDone ? " page-break" : ""}">`);
        out.push(`<div class="eyebrow">${esc(textOf(b).trim())}</div>`);
        let consumed = true;
        while (consumed && i < blocks.length && blocks[i].kind === "p") {
          const k = classifyPara(blocks[i]);
          if (k === "title") out.push(`<h1>${esc(textOf(blocks[i]).trim())}</h1>`);
          else if (k === "kicker") out.push(`<div class="cover-kind">${esc(textOf(blocks[i]).trim())}</div>`);
          else if (k === "subtitle") out.push(`<p class="doc-sub">${esc(textOf(blocks[i]).trim())}</p>`);
          else consumed = false;
          if (consumed) i++;
        }
        out.push('<hr class="head-rule">');
        out.push("</div>");
        headerDone = true;
        break;
      }
      case "h2": {
        // A short section (the cleanup-and-sources tail, a heading over one
        // table or a small list) stays whole on one page.
        let j = i;
        let hasSources = false;
        while (j < blocks.length) {
          const nb = blocks[j];
          if (nb.kind === "pagebreak") break;
          if (nb.kind === "table") {
            if (nb.rows.length > 12) break;
            j++;
            continue;
          }
          const k = classifyPara(nb);
          if (k === "eyebrow" || k === "h2" || k === "title" || k === "kicker") break;
          if (k === "sources") hasSources = true;
          j++;
        }
        const span = j - i;
        if ((hasSources && span <= 6) || span <= 3) {
          out.push(`<div class="keep"><h2${roleClassOf(b)}>${esc(textOf(b).trim())}</h2>`);
          out.push(renderFlow(blocks.slice(i, j), camp, { ...opts, headerDone: true }));
          out.push("</div>");
          i = j;
        } else {
          out.push(`<h2${roleClassOf(b)}>${esc(textOf(b).trim())}</h2>`);
        }
        break;
      }
      case "h3": {
        if (opts.slips && i < blocks.length && blocks[i].kind === "table") {
          const t = blocks[i];
          const slip = isScoreSlip(t);
          const meta = slip
            ? `<p class="slip-meta" style="font-family:var(--mono);font-size:8.5pt;color:#6b675f;margin:1pt 0 7pt">Team&nbsp;&nbsp;______________________&nbsp;&nbsp;&nbsp;Date&nbsp;&nbsp;____________&nbsp;&nbsp;&nbsp;Judge&nbsp;&nbsp;______________________</p>`
            : "";
          out.push(`<div class="keep"><h3>${esc(textOf(b).trim())}</h3>${meta}${renderTable(slip ? withEarnedColumn(t) : t)}</div>`);
          i++;
        } else {
          out.push(`<h3>${esc(textOf(b).trim())}</h3>`);
        }
        break;
      }
      case "phase":
        out.push(renderPhase(b));
        break;
      case "probfix":
        out.push(renderProbfix(b));
        break;
      case "sources":
        out.push(`<p class="sources"><span class="lead">Sources</span> ${esc(textOf(b).replace(/^Sources:\s*/, ""))}</p>`);
        break;
      case "write": {
        // Keep a write-in row together with its continuation blank lines.
        const tail = [];
        while (i < blocks.length && blocks[i].kind === "p" && classifyPara(blocks[i]) === "blankline") {
          tail.push('<div class="blankline"></div>');
          i++;
        }
        const row = renderWrite(b);
        out.push(tail.length ? `<div class="keep">${row}\n${tail.join("\n")}</div>` : row);
        break;
      }
      case "blankline":
        out.push('<div class="blankline"></div>');
        break;
      case "title":
        out.push(`<h1>${esc(textOf(b).trim())}</h1>`);
        break;
      case "kicker":
        out.push(`<div class="cover-kind">${esc(textOf(b).trim())}</div>`);
        break;
      case "subtitle":
        out.push(`<p class="doc-sub">${esc(textOf(b).trim())}</p>`);
        break;
      default: {
        const classes = [];
        if ((b.indLeft || 0) >= 200 && !b.hanging) classes.push("indent");
        // A label ending in a colon introduces the next element; never leave
        // it stranded at the bottom of a page.
        if (/:\s*$/.test(textOf(b))) classes.push("binds");
        const cls = classes.length ? ` class="${classes.join(" ")}"` : "";
        out.push(`<p${cls}>${renderRuns(b.runs)}</p>`);
      }
    }
  }
  return out.join("\n");
}

// ---- per-template documents -------------------------------------------------------

function pages(blocks) {
  const groups = [[]];
  for (const b of blocks) {
    if (b.kind === "pagebreak") groups.push([]);
    else groups[groups.length - 1].push(b);
  }
  return groups.filter((g) => g.length);
}

function renderActivity(ir, camp) {
  return renderFlow(ir.blocks, camp);
}

function renderPacket(ir, camp, doc) {
  const [cover, ...rest] = pages(ir.blocks);
  const eyebrow = textOf(cover[0]).trim();
  const title = textOf(cover.find((b) => sz0(b) >= 60)).trim();
  const kicker = cover.find((b) => sz0(b) === 36);
  const sub = cover.find((b) => classifyPara(b) === "subtitle" || (sz0(b) === 22 && !b.runs[0].b));
  const toc = [];
  for (const blocks of rest) {
    const eb = blocks.find(
      (b) => b.kind === "p" && classifyPara(b) === "eyebrow" && /\b[A-Z]{3}-\d{2}\b/.test(textOf(b))
    );
    if (!eb) continue;
    const code = textOf(eb).match(/\b([A-Z]{3}-\d{2})\b/)[1];
    const t = blocks.find((b) => b.kind === "p" && (sz0(b) || 0) >= 40);
    if (t) toc.push({ code, title: textOf(t).trim() });
  }
  const tocHtml = toc
    .map((r) => `<div class="toc-row"><span class="code">${r.code}</span><span>${esc(r.title)}</span></div>`)
    .join("\n");
  const coverHtml = `<div class="cover">
<div class="eyebrow">${esc(eyebrow)}</div>
<h1>${esc(title)}</h1>
${kicker ? `<div class="cover-kind">${esc(textOf(kicker).trim())}</div>` : ""}
${sub ? `<p class="doc-sub">${esc(textOf(sub).trim())}</p>` : ""}
<div class="toc"><div class="toc-title">In this packet</div>\n${tocHtml}\n</div>
</div>`;
  const body = rest
    .map((blocks, idx) => {
      // A divider page has an eyebrow and a kicker but no activity title.
      const isDivider = blocks.every((b) => b.kind !== "table") && blocks.length <= 3 &&
        !blocks.some((b) => (sz0(b) || 0) >= 40 && classifyPara(b) === "title" && /ACTIVITY/.test(textOf(blocks[0])));
      void idx;
      let html;
      if (blocks.length <= 3 && blocks.some((b) => sz0(b) === 36)) {
        const eb = blocks.find((b) => classifyPara(b) === "eyebrow");
        const kk = blocks.find((b) => sz0(b) === 36);
        html = `<div class="cover page-break" style="min-height:8.6in">
${eb ? `<div class="eyebrow">${esc(textOf(eb).trim())}</div>` : ""}
<h1>${esc(textOf(kk).trim())}</h1>
${blocks.filter((b) => b !== eb && b !== kk).map((b) => `<p class="doc-sub">${esc(textOf(b).trim())}</p>`).join("\n")}
</div>`;
      } else {
        void isDivider;
        html = `<div class="page-break"></div>\n` + renderFlow(blocks, camp, { headerDone: false });
      }
      return html;
    })
    .join("\n");
  return coverHtml + "\n" + body;
}

function renderScores(ir, camp) {
  return renderFlow(ir.blocks, camp, { slips: true });
}

// A per-activity score slip is a "criterion | max points" reference; add a
// blank "Earned" column so an instructor can record the awarded score, the
// running total included. Leaderboard and other tables are left untouched.
function isScoreSlip(tbl) {
  return tbl.rows[0] && cellText(tbl.rows[0].cells[0]).startsWith("Scoring criterion");
}
function withEarnedColumn(tbl) {
  const h0 = tbl.rows[0].cells[0];
  const headRun = { ...((h0.blocks[0] && h0.blocks[0].runs && h0.blocks[0].runs[0]) || {}), t: "Earned" };
  const rows = tbl.rows.map((row, ri) => {
    const cell = ri === 0
      ? { fill: h0.fill, blocks: [{ kind: "p", runs: [headRun] }] }
      : { blocks: [{ kind: "p", runs: [{ t: "________" }] }] };
    return { ...row, cells: [...row.cells, cell] };
  });
  return { ...tbl, rows };
}

function renderSigns(ir, camp) {
  const out = [];
  for (const [idx, group] of pages(ir.blocks).entries()) {
    const [chip, title, mission, loop, win] = group;
    const chipColor = chip.runs[0].color ? `#${chip.runs[0].color}` : "#F2F1EE";
    const loopHtml = esc(textOf(loop).trim()).replace(/›/g, '<span class="sep">›</span>');
    const winText = textOf(win).trim().replace(/^WIN:\s*/, "");
    out.push(`<div class="sign${idx > 0 ? " page-break" : ""}" style="--cat-tint:${chipColor}40">
<div class="chip" style="background:${chipColor}33;border-color:${chipColor}">${esc(textOf(chip).trim())}</div>
<h1>${esc(textOf(title).trim())}</h1>
<p class="mission">${esc(textOf(mission).trim())}</p>
<div class="loop">${loopHtml}</div>
<div class="win"><span class="lead">Win</span>${esc(winText)}</div>
</div>`);
  }
  return out.join("\n");
}

function renderRewards(ir, camp) {
  return renderFlow(ir.blocks, camp, { certs: true });
}

// ---- workbook and buy list ----------------------------------------------------------

const MAT_HEADERS = ["Camp", "Activity ID", "Activity title", "Category", "Item name"];
const money = (v) => (v === "" || isNaN(Number(v)) ? v : `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}`);

function isMaterialsSheet(sheet) {
  return MAT_HEADERS.every((h, i) => (sheet.rows[0] || [])[i] === h);
}

// Amazon search links read as their search terms in print; anything else
// keeps its address without the scheme noise.
function linkLabel(url) {
  const m = url.match(/[?&]k=([^&\s]+)/);
  if (m) {
    let terms = m[1].replace(/\+/g, " ");
    try {
      terms = decodeURIComponent(terms);
    } catch {
      /* keep the raw terms */
    }
    return `Amazon search: ${terms}`;
  }
  return url.replace(/^https?:\/\/(www\.)?/, "");
}

// One compact ledger entry per material line: a name-and-chips header, a mono
// provenance line, then quantity, sourcing, and note lines only when present.
function renderLedger(sheet) {
  const rows = sheet.rows.slice(1).filter((r) => r.some((v) => v));
  const F = {
    camp: 0, id: 1, activity: 2, category: 3, name: 4, purpose: 5, consumable: 6,
    existing: 7, qtyNeeded: 8, spare: 9, product: 10, url: 11, asin: 12, unitPrice: 13,
    status: 14, qtyBuy: 15, subtotal: 16, priority: 17, cheaper: 18, local: 19,
    safety: 20, storage: 21, checked: 22, source: 23, notes: 24,
  };
  const seg = (label, v) => (v ? `<span class="k">${label}</span>${esc(v)}` : "");
  const segs = (parts) => parts.filter(Boolean).join('<span class="dot">·</span>');
  const note = (label, v, cls = "") =>
    v ? `<div class="li-note${cls}"><span class="nk">${label}</span>${esc(v)}</div>` : "";
  return rows
    .map((r) => {
      const tags = [];
      if (r[F.priority]) tags.push(`<span class="tag${r[F.priority] === "required" ? " acc" : ""}">${esc(r[F.priority])}</span>`);
      // A zero price means local purchase or borrow; the chips would be noise.
      if (r[F.unitPrice] && Number(r[F.unitPrice]) !== 0) tags.push(`<span class="tag">${money(r[F.unitPrice])} unit</span>`);
      if (r[F.subtotal] && Number(r[F.subtotal]) !== 0) tags.push(`<span class="tag acc">${money(r[F.subtotal])} total</span>`);
      if (r[F.status] && /unverified|estimate/.test(r[F.status])) tags.push(`<span class="tag warn">${esc(r[F.status])}</span>`);
      const meta = [r[F.camp], r[F.id], r[F.activity], r[F.category], r[F.consumable], r[F.checked] ? `checked ${r[F.checked]}` : ""]
        .filter(Boolean)
        .map(esc)
        .join("&nbsp;&nbsp;·&nbsp;&nbsp;");
      const qty = segs([
        seg("Need", r[F.qtyNeeded]),
        seg("Spare", r[F.spare]),
        seg("Buy", r[F.qtyBuy]),
        seg("On hand", r[F.existing]),
        seg("Local better", r[F.local]),
      ]);
      const pick = segs([
        seg("Pick", r[F.product]),
        r[F.url] ? `<span class="k">Find</span>${esc(linkLabel(r[F.url]))}` : "",
        seg("ASIN", r[F.asin]),
        seg("Cheaper", r[F.cheaper]),
      ]);
      return `<div class="ledger-item">
<div class="li-head"><span class="li-name">${esc(r[F.name])}</span><span class="li-tags">${tags.join("")}</span></div>
<div class="li-meta">${meta}</div>
${qty ? `<div class="li-line">${qty}</div>` : ""}
${pick ? `<div class="li-line">${pick}</div>` : ""}
${note("Purpose", r[F.purpose])}
${note("Safety", r[F.safety], " warn")}
${note("Storage", r[F.storage])}
${note("Source", r[F.source])}
${note("Notes", r[F.notes])}
</div>`;
    })
    .join("\n");
}

function sheetTable(sheet, { moneyCols = [], monoCols = [], headerRow = 0, tight = false } = {}) {
  const rows = sheet.rows.slice(headerRow).filter((r) => r.some((v) => v));
  const ncols = Math.max(...rows.map((r) => r.length));
  const used = [];
  for (let i = 0; i < ncols; i++) if (rows.some((r) => r[i])) used.push(i);
  const head = rows[0];
  const body = rows.slice(1);
  const numeric = used.map((i) => body.every((r) => !r[i] || /^[\d$.,%\s-]+$/.test(r[i])) && body.some((r) => r[i]));
  const fmt = (v, i) => (moneyCols.includes(i) ? money(v) : v);
  const cellCls = (i, k) => {
    const classes = [];
    if (numeric[k]) classes.push("num");
    if (monoCols.includes(i)) classes.push("mono-cell");
    return classes.length ? ` class="${classes.join(" ")}"` : "";
  };
  const classes = [rows.length <= 12 ? "keep" : "", tight ? "tight" : ""].filter(Boolean);
  let html = `<table${classes.length ? ` class="${classes.join(" ")}"` : ""}><thead><tr>`;
  html += used.map((i, k) => `<th${numeric[k] ? ' class="num"' : ""}>${esc(head[i] || "")}</th>`).join("");
  html += "</tr></thead><tbody>";
  for (const r of body) {
    html += "<tr>" + used.map((i, k) => `<td${cellCls(i, k)}>${esc(fmt(r[i] || "", i)) || "&nbsp;"}</td>`).join("") + "</tr>";
  }
  return html + "</tbody></table>";
}

function renderWorkbook(ir, camp, doc) {
  void camp;
  void doc;
  const sheets = Object.fromEntries(ir.blocks.map((s) => [s.name, s]));
  const dash = sheets["Dashboard"];
  const rows = dash.rows;
  const note = rows[1][3] || "";
  const checked = rows[1][1] || "";
  const stats = [];
  for (const r of rows.slice(3, 7)) {
    if (r[0] && r[1] !== "") stats.push([r[0], money(r[1])]);
    if (r[3] && r[4] !== "") stats.push([r[3], money(r[4])]);
  }
  // The two count metrics read better without currency formatting.
  const fixed = stats.map(([k, v]) => [k, /count/i.test(k) ? v.replace(/^\$/, "") : v]);
  const statHtml = fixed
    .map(([k, v]) => `<div class="stat"><div class="num">${esc(v)}</div><div class="lab">${esc(k)}</div></div>`)
    .join("\n");
  const prio = { name: "p", rows: rows.slice(8, 13).map((r) => [r[0], r[1]]) };
  const prioCamp = { name: "c", rows: rows.slice(8, 13).map((r) => [r[3], r[4]]) };
  const head = `<div class="doc-head">
<div class="eyebrow">2026 STEM Camps · Shopping and Budget</div>
<h1>Amazon Procurement Workbook</h1>
<p class="doc-sub">${esc(note)} Last checked ${esc(checked)}.</p>
<hr class="head-rule">
</div>
<h2>Dashboard</h2>
<div class="stat-grid">${statHtml}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14pt">
<div><h2>Spend by priority</h2>${sheetTable(prio, { moneyCols: [1] })}</div>
<div><h2>Spend by camp</h2>${sheetTable(prioCamp, { moneyCols: [1] })}</div>
</div>`;
  const parts = [head];
  for (const s of ir.blocks) {
    if (s.name === "Dashboard") continue;
    const lines = s.rows.length - 1;
    parts.push(`<h2 class="page-break" style="margin-top:0">${esc(s.name)}<span class="h2-count">${lines} line${lines === 1 ? "" : "s"}</span></h2>`);
    if (isMaterialsSheet(s)) {
      parts.push(renderLedger(s));
    } else if (s.name === "Budget scenarios") {
      parts.push(sheetTable(s, { moneyCols: [1, 2, 3, 4, 5, 6, 7, 8], tight: true }));
      parts.push('<p class="table-note">All amounts in US dollars.</p>');
    } else {
      parts.push(sheetTable(s, { tight: true }));
    }
  }
  return parts.join("\n");
}

function renderBuylist(ir) {
  const sheet = ir.blocks[0];
  return `<div class="doc-head">
<div class="eyebrow">2026 STEM Camps · Shopping and Budget</div>
<h1>Materials Buy List</h1>
<p class="doc-sub">Every material aggregated across all stations, with per-station quantities and the stations that use it.</p>
<hr class="head-rule">
</div>
${sheetTable(
    { name: "", rows: [["Material", "Quantity (per station)", "Stations", "Station count"], ...sheet.rows.slice(1)] },
    { monoCols: [2] }
  )}`;
}

// ---- assembly ---------------------------------------------------------------------

const TEMPLATES = {
  handout: renderActivity,
  guide: renderActivity,
  "handout-packet": renderPacket,
  "guide-packet": renderPacket,
  scores: renderScores,
  signs: renderSigns,
  master: renderActivity,
  rewards: renderRewards,
  safety: renderActivity,
  workbook: renderWorkbook,
  buylist: renderBuylist,
};

function footerFor(doc, ir) {
  if (ir.footer) return ir.footer;
  const camp = CAMPS[doc.camp];
  if (doc.template === "signs") return `${camp.label} 2026  |  Station Signs`;
  if (doc.template === "workbook") return "2026 STEM Camps  |  Amazon Procurement Workbook";
  if (doc.template === "buylist") return "2026 STEM Camps  |  Materials Buy List";
  return `${camp.label} 2026  |  ${doc.name}`;
}

function main() {
  const filter = process.argv[2];
  fs.mkdirSync(HTML_DIR, { recursive: true });
  fs.copyFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "theme.css"),
    path.join(HTML_DIR, "theme.css"));
  const fontsSrc = path.resolve(HTML_DIR, "..", "fonts");
  const fontsDest = path.join(HTML_DIR, "fonts");
  if (!fs.existsSync(fontsDest)) fs.cpSync(fontsSrc, fontsDest, { recursive: true });
  const meta = {};
  let count = 0;
  for (const doc of DOCS) {
    // Printables are pre-built straight to PDF by build_pystem.mjs and
    // build_trees.mjs; guides and packets carry no embedded printables.
    if (doc.isStatic) continue;
    if (filter && !doc.slug.includes(filter) && !doc.id.includes(filter)) continue;
    const ir = JSON.parse(fs.readFileSync(path.join(IR_DIR, `${doc.slug}.json`), "utf8"));
    const camp = CAMPS[doc.camp];
    const body = TEMPLATES[doc.template](ir, camp, doc);
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(doc.name)}</title>
<link rel="stylesheet" href="theme.css">
</head>
<body style="--camp-ink:${camp.ink};--camp-acc:${camp.acc}">
${body}
</body></html>
`;
    fs.writeFileSync(path.join(HTML_DIR, `${doc.slug}.html`), html);
    meta[doc.slug] = { footer: footerFor(doc, ir), out: doc.out };
    count++;
  }
  fs.writeFileSync(path.join(HTML_DIR, "meta.json"), JSON.stringify(meta, null, 1));
  process.stdout.write(`rendered ${count} documents into ${HTML_DIR}\n`);
}

main();
