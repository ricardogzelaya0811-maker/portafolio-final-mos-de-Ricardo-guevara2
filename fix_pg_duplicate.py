from pathlib import Path
import re

p = Path(r"c:\Users\ricar\OneDrive\Desktop\portafolio-final-mos-de-Ricardo-guevara2\index.html")
text = p.read_text(encoding='utf-8')

text, n1 = re.subn(
    r'(?s)\n\s*<div class="pg-timeline" style="display:none">.*?</div>\s*</section>\s*',
    '',
    text,
    count=1,
)
text, n2 = re.subn(
    r'(?s)\n\s*<section class="wrap pg-gallery-wrap" style="display:none">.*?</section>\s*',
    '',
    text,
    count=1,
)

p.write_text(text, encoding='utf-8')
print(f'removed {n1} timeline block and {n2} gallery block')
