#!/usr/bin/env python3
"""Extract a Word document into a JSON intermediate representation.

Reads word/document.xml (plus footer) from a .docx and emits a flat list of
typed blocks: paragraphs with styled runs, tables with cell trees, and page
breaks. The IR is layout-free; tools/docgen/render.mjs maps it onto the site's
field-notebook print theme. No DOCX library is used, only the stdlib.

Usage: extract_docx.py <input.docx> <output.json>
"""

import json
import sys
import zipfile
import xml.etree.ElementTree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def q(tag):
    return f"{{{W}}}{tag}"


def flag(rpr, tag):
    """True when a boolean run property is present and not explicitly off."""
    el = rpr.find(q(tag))
    if el is None:
        return False
    val = el.get(q("val"))
    return val not in ("0", "false", "none")


def parse_runs(p):
    """Collect the visible runs of a paragraph, merging adjacent same-style text."""
    runs = []
    has_pagebreak = False
    for r in p.iter(q("r")):
        rpr = r.find(q("rPr"))
        style = {"b": False, "i": False, "u": False, "sz": None, "color": None, "hl": None}
        if rpr is not None:
            style["b"] = flag(rpr, "b")
            style["i"] = flag(rpr, "i")
            style["u"] = flag(rpr, "u")
            sz = rpr.find(q("sz"))
            if sz is not None:
                style["sz"] = int(sz.get(q("val")))
            col = rpr.find(q("color"))
            if col is not None and col.get(q("val")) != "auto":
                style["color"] = col.get(q("val")).upper()
            hl = rpr.find(q("highlight"))
            if hl is not None:
                style["hl"] = hl.get(q("val"))
        text = ""
        for child in r:
            tag = child.tag
            if tag == q("t"):
                text += child.text or ""
            elif tag == q("tab"):
                text += "\t"
            elif tag == q("br"):
                if child.get(q("type")) == "page":
                    has_pagebreak = True
                else:
                    text += "\n"
        if not text:
            continue
        if runs and all(runs[-1][k] == style[k] for k in style):
            runs[-1]["t"] += text
        else:
            runs.append({"t": text, **style})
    return runs, has_pagebreak


def parse_para(p):
    block = {"kind": "p"}
    ppr = p.find(q("pPr"))
    if ppr is not None:
        jc = ppr.find(q("jc"))
        if jc is not None:
            block["jc"] = jc.get(q("val"))
        ind = ppr.find(q("ind"))
        if ind is not None:
            for attr, key in (("left", "indLeft"), ("hanging", "hanging"), ("firstLine", "firstLine")):
                v = ind.get(q(attr))
                if v is not None:
                    block[key] = int(v)
        shd = ppr.find(q("shd"))
        if shd is not None and shd.get(q("fill")) not in (None, "auto"):
            block["shd"] = shd.get(q("fill")).upper()
        spacing = ppr.find(q("spacing"))
        if spacing is not None:
            for attr in ("before", "after"):
                v = spacing.get(q(attr))
                if v is not None:
                    block[attr] = int(v)
        if ppr.find(q("pageBreakBefore")) is not None:
            block["pageBreakBefore"] = True
    runs, has_pagebreak = parse_runs(p)
    block["runs"] = runs
    return block, has_pagebreak


def parse_cell(tc):
    cell = {"blocks": []}
    tcpr = tc.find(q("tcPr"))
    if tcpr is not None:
        span = tcpr.find(q("gridSpan"))
        if span is not None:
            cell["span"] = int(span.get(q("val")))
        vm = tcpr.find(q("vMerge"))
        if vm is not None:
            cell["vmerge"] = vm.get(q("val")) or "continue"
        shd = tcpr.find(q("shd"))
        if shd is not None and shd.get(q("fill")) not in (None, "auto"):
            cell["fill"] = shd.get(q("fill")).upper()
        tcw = tcpr.find(q("tcW"))
        if tcw is not None and tcw.get(q("type")) == "dxa":
            cell["w"] = int(tcw.get(q("w")))
    for child in tc:
        if child.tag == q("p"):
            block, _ = parse_para(child)
            if block["runs"]:
                cell["blocks"].append(block)
        elif child.tag == q("tbl"):
            cell["blocks"].append(parse_table(child))
    return cell


def parse_table(tbl):
    block = {"kind": "table", "rows": []}
    grid = tbl.find(q("tblGrid"))
    if grid is not None:
        block["grid"] = [int(c.get(q("w"), "0")) for c in grid.findall(q("gridCol"))]
    for tr in tbl.findall(q("tr")):
        row = {"cells": [parse_cell(tc) for tc in tr.findall(q("tc"))]}
        trpr = tr.find(q("trPr"))
        if trpr is not None and trpr.find(q("tblHeader")) is not None:
            row["header"] = True
        block["rows"].append(row)
    return block


def extract(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        doc = ET.fromstring(z.read("word/document.xml"))
        footer_text = ""
        for name in z.namelist():
            if name.startswith("word/footer"):
                ftr = ET.fromstring(z.read(name))
                parts = [t.text or "" for t in ftr.iter(q("t"))]
                text = "".join(parts).strip()
                if text:
                    footer_text = text
                    break
    body = doc.find(q("body"))
    blocks = []
    for child in body:
        if child.tag == q("p"):
            block, has_pagebreak = parse_para(child)
            if block.get("pageBreakBefore"):
                blocks.append({"kind": "pagebreak"})
            if block["runs"]:
                blocks.append(block)
            if has_pagebreak:
                blocks.append({"kind": "pagebreak"})
        elif child.tag == q("tbl"):
            blocks.append(parse_table(child))
    return {"source": str(docx_path), "footer": footer_text, "blocks": blocks}


def main():
    if len(sys.argv) != 3:
        sys.stderr.write(__doc__)
        return 2
    ir = extract(sys.argv[1])
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(ir, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main())
