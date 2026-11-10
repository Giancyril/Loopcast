import re
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_styled_paragraph(doc, text, style='Normal', space_after=6, space_before=0, line_spacing=1.15):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.line_spacing = line_spacing
    format_inline_markdown(p, text)
    return p

def format_inline_markdown(paragraph, text):
    # Regex to capture bold, inline code, and normal text
    pattern = re.compile(r'(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|[^*`\[]+)')
    tokens = pattern.findall(text)
    if not tokens:
        tokens = [text]
    
    for token in tokens:
        if token.startswith('**') and token.endswith('**') and len(token) > 4:
            run = paragraph.add_run(token[2:-2])
            run.bold = True
        elif token.startswith('`') and token.endswith('`') and len(token) > 2:
            run = paragraph.add_run(token[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(79, 70, 229) # Indigo
        elif token.startswith('[') and '](' in token and token.endswith(')'):
            label = token[1:token.index('](')]
            run = paragraph.add_run(label)
            run.font.color.rgb = RGBColor(99, 102, 241)
            run.underline = True
        else:
            paragraph.add_run(token)

def md_to_docx(md_path, docx_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()

    # Set standard margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Base normal style font
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    i = 0
    in_code_block = False
    code_lines = []
    
    while i < len(lines):
        line = lines[i].rstrip('\r\n')

        # Check code block fences
        if line.startswith('```'):
            if in_code_block:
                # End code block
                table = doc.add_table(rows=1, cols=1)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = table.cell(0, 0)
                set_cell_background(cell, "F1F5F9") # Slate 100
                set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
                
                cell_p = cell.paragraphs[0]
                cell_p.paragraph_format.space_before = Pt(2)
                cell_p.paragraph_format.space_after = Pt(2)
                cell_p.paragraph_format.line_spacing = 1.1
                
                full_code = "\n".join(code_lines)
                run = cell_p.add_run(full_code)
                run.font.name = 'Consolas'
                run.font.size = Pt(9.0)
                run.font.color.rgb = RGBColor(15, 23, 42)

                doc.add_paragraph().paragraph_format.space_after = Pt(4)
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Blank line
        if not line.strip():
            i += 1
            continue

        # Horizontal Rule
        if line.strip() in ['---', '***', '___']:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(8)
            pPr = p._p.get_or_add_pPr()
            pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr>')
            pPr.append(pBdr)
            i += 1
            continue

        # Table detection
        if line.strip().startswith('|') and line.strip().endswith('|'):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|') and lines[i].strip().endswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
            
            # Parse table
            raw_rows = []
            for t_line in table_lines:
                cells = [c.strip() for c in t_line.strip('|').split('|')]
                raw_rows.append(cells)

            if len(raw_rows) >= 2 and all(set(c).issubset({'-', ':', ' '}) for c in raw_rows[1]):
                headers = raw_rows[0]
                data_rows = raw_rows[2:]
            else:
                headers = raw_rows[0]
                data_rows = raw_rows[1:]

            num_cols = len(headers)
            table = doc.add_table(rows=len(data_rows) + 1, cols=num_cols)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            table.autofit = True

            # Style header
            for col_idx, h_text in enumerate(headers):
                cell = table.cell(0, col_idx)
                set_cell_background(cell, "4F46E5") # Loopcast primary indigo
                set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_before = Pt(2)
                cp.paragraph_format.space_after = Pt(2)
                run = cp.add_run(h_text)
                run.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                run.font.size = Pt(10)

            # Style data rows
            for r_idx, row in enumerate(data_rows):
                bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
                for c_idx in range(num_cols):
                    val = row[c_idx] if c_idx < len(row) else ""
                    cell = table.cell(r_idx + 1, c_idx)
                    set_cell_background(cell, bg_color)
                    set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                    cp = cell.paragraphs[0]
                    cp.paragraph_format.space_before = Pt(1)
                    cp.paragraph_format.space_after = Pt(1)
                    format_inline_markdown(cp, val)
                    for r in cp.runs:
                        r.font.size = Pt(9.5)

            # Add borders
            tblPr = table._tbl.tblPr
            borders = parse_xml(
                f'<w:tblBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>'
                f'<w:left w:val="none"/>'
                f'<w:right w:val="none"/>'
                f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                f'<w:insideV w:val="none"/>'
                f'</w:tblBorders>'
            )
            tblPr.append(borders)

            doc.add_paragraph().paragraph_format.space_after = Pt(6)
            continue

        # Headings
        if line.startswith('# '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(line[2:].strip())
            run.font.name = 'Calibri'
            run.font.size = Pt(24)
            run.bold = True
            run.font.color.rgb = RGBColor(30, 27, 75) # Deep indigo
            i += 1
            continue

        if line.startswith('## '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(line[3:].strip())
            run.font.name = 'Calibri'
            run.font.size = Pt(16)
            run.bold = True
            run.font.color.rgb = RGBColor(67, 56, 202) # Indigo 700
            i += 1
            continue

        if line.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(line[4:].strip())
            run.font.name = 'Calibri'
            run.font.size = Pt(13)
            run.bold = True
            run.font.color.rgb = RGBColor(79, 70, 229) # Indigo 600
            i += 1
            continue

        if line.startswith('#### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(line[5:].strip())
            run.font.name = 'Calibri'
            run.font.size = Pt(11.5)
            run.bold = True
            run.font.color.rgb = RGBColor(51, 65, 85) # Slate 700
            i += 1
            continue

        # Blockquote
        if line.startswith('> '):
            table = doc.add_table(rows=1, cols=1)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = table.cell(0, 0)
            set_cell_background(cell, "EEF2FF") # Indigo 50
            set_cell_margins(cell, top=80, bottom=80, left=150, right=150)
            
            tcPr = cell._tc.get_or_add_tcPr()
            borders = parse_xml(
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:left w:val="single" w:sz="24" w:space="0" w:color="6366F1"/>'
                f'<w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/>'
                f'</w:tcBorders>'
            )
            tcPr.append(borders)
            
            cp = cell.paragraphs[0]
            cp.paragraph_format.space_before = Pt(2)
            cp.paragraph_format.space_after = Pt(2)
            format_inline_markdown(cp, line[2:].strip())
            for r in cp.runs:
                r.italic = True
                r.font.color.rgb = RGBColor(55, 48, 163)

            doc.add_paragraph().paragraph_format.space_after = Pt(4)
            i += 1
            continue

        # Unordered list
        if line.strip().startswith(('- ', '* ')):
            text = line.strip()[2:]
            indent_level = (len(line) - len(line.lstrip())) // 2
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.left_indent = Inches(0.25 * (indent_level + 1))
            format_inline_markdown(p, text)
            i += 1
            continue

        # Numbered list
        num_match = re.match(r'^(\d+)\.\s+(.*)$', line.strip())
        if num_match:
            text = num_match.group(2)
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            format_inline_markdown(p, text)
            i += 1
            continue

        # Regular paragraph
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.15
        format_inline_markdown(p, line)
        i += 1

    doc.save(docx_path)
    print(f"Successfully generated {docx_path} ({os.path.getsize(docx_path)} bytes)")

if __name__ == '__main__':
    md_file = r'c:\Users\LENOVO\Documents\Code\AI Social Media Agent\docs\LOOPCAST_GUIDE.md'
    docx_file = r'c:\Users\LENOVO\Documents\Code\AI Social Media Agent\docs\LOOPCAST_GUIDE.docx'
    md_to_docx(md_file, docx_file)

