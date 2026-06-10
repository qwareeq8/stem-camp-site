#!/usr/bin/env python3
"""Extract an Excel workbook or a CSV file into the docgen JSON IR.

Each worksheet becomes a section block followed by one table block built from
the sheet's populated cell range. Numbers keep their cached formula results,
so the PDF shows the same values the workbook shows. CSV input becomes a
single table. Only the stdlib is used.

Usage: extract_xlsx.py <input.xlsx|input.csv> <output.json>
"""

import csv
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

M = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def col_index(ref):
    """'BC12' -> zero-based column 54."""
    letters = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def cell_value(c):
    t = c.get("t")
    if t == "inlineStr":
        is_el = c.find(f"{{{M}}}is")
        return "".join(x.text or "" for x in is_el.iter(f"{{{M}}}t")) if is_el is not None else ""
    v = c.find(f"{{{M}}}v")
    if v is None or v.text is None:
        return ""
    if t in (None, "n"):
        # Trim float noise from cached formula results (e.g. 177.98000000000002).
        try:
            num = float(v.text)
        except ValueError:
            return v.text
        if num == int(num) and abs(num) < 1e15:
            return str(int(num))
        return f"{round(num, 2):g}"
    if t == "b":
        return "TRUE" if v.text == "1" else "FALSE"
    return v.text


def sheet_rows(root):
    data = root.find(f"{{{M}}}sheetData")
    rows = []
    for row in data:
        cells = {}
        for c in row:
            ref = c.get("r")
            if ref is None:
                continue
            val = cell_value(c)
            if val != "":
                cells[col_index(ref)] = val
        rows.append(cells)
    while rows and not rows[-1]:
        rows.pop()
    if not rows:
        return []
    width = max((max(r) + 1) for r in rows if r)
    return [[r.get(i, "") for i in range(width)] for r in rows]


def extract_xlsx(path):
    blocks = []
    with zipfile.ZipFile(path) as z:
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = {
            rel.get("Id"): rel.get("Target").lstrip("/")
            for rel in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        }
        for sheet in wb.find(f"{{{M}}}sheets"):
            name = sheet.get("name")
            target = rels[sheet.get(f"{{{R}}}id")]
            if not target.startswith("xl/"):
                target = "xl/" + target
            root = ET.fromstring(z.read(target))
            rows = sheet_rows(root)
            blocks.append({"kind": "sheet", "name": name, "rows": rows})
    return {"source": str(path), "footer": "", "blocks": blocks}


def extract_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        rows = [row for row in csv.reader(f)]
    return {"source": str(path), "footer": "", "blocks": [{"kind": "sheet", "name": "", "rows": rows}]}


def main():
    if len(sys.argv) != 3:
        sys.stderr.write(__doc__)
        return 2
    src = sys.argv[1]
    ir = extract_csv(src) if src.lower().endswith(".csv") else extract_xlsx(src)
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(ir, f, ensure_ascii=False, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main())
