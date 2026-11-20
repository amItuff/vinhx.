#!/usr/bin/env python3
"""Build library/books/<id>.json.gz from a Project Gutenberg plain-text file.
Usage: make-book.py <id> <input.txt> [lang]
Output format (what library.js reads): {"id": N, "lang": "en", "ch": [{"t": title, "p": [paragraph, ...]}, ...]}
Chapters are found from headings (Chapter / Book / Part / Letter / Roman numerals ...); a text without
usable headings is cut into parts of about 8000 characters."""
import gzip, json, re, sys

HEAD = re.compile(r'^(chapter|book|part|letter|the adventure of|adventure|stave|canto|volume|section|prologue|epilogue|preface|introduction)\b.{0,70}$'
                  r'|^[IVXLC]{1,7}\.?$|^[IVXLC]{1,7}\.\s+[A-Z][^.!?]{0,60}$|^\d{1,3}\.?$', re.I)

def clean(s):
    return re.sub(r'\s+', ' ', s).strip()

def strip_boiler(text):
    m = re.search(r'\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n', text)
    if m: text = text[m.end():]
    m = re.search(r'\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG', text)
    if m: text = text[:m.start()]
    return text

def build(text, lang='en'):
    text = strip_boiler(text.replace('\r\n', '\n').replace('\r', '\n'))
    paras = [clean(p) for p in re.split(r'\n\s*\n', text)]
    paras = [p for p in paras if p and not re.fullmatch(r'[\W_]+', p) and not re.fullmatch(r'\[?illustration[^\]]*\]?', p, re.I)]
    is_head = [bool(HEAD.match(p)) and len(p) < 80 for p in paras]

    # A heading is real when prose (>= 80 chars) follows within 4 lines with no other heading in between;
    # back-to-back headings are the table of contents. Short lines under a heading are its subtitle.
    spans = []
    for i, h in enumerate(is_head):
        if not h: continue
        sub, j = [], i + 1
        while j < len(paras) and j <= i + 4 and not is_head[j] and len(paras[j]) < 80:
            sub.append(paras[j]); j += 1
        if j < len(paras) and j <= i + 4 and not is_head[j] and len(paras[j]) >= 80:
            spans.append((i, j, sub))
    chapters = []
    for n, (i, j, sub) in enumerate(spans):
        end = spans[n + 1][0] if n + 1 < len(spans) else len(paras)
        body = paras[j:end]
        title = paras[i].rstrip('.')
        if sub: title += ' · ' + ' '.join(x.strip('.') for x in sub)[:60]
        if len(''.join(body)) > 300:
            chapters.append({'t': title[:90], 'p': body})
    if len(chapters) < 3:
        chapters, cur, n, idx = [], [], 0, 1
        size = max(8000, sum(len(p) for p in paras) // 40)  # at most about 40 parts
        for p in paras:
            cur.append(p); n += len(p)
            if n >= size:
                chapters.append({'t': f'Phần {idx}', 'p': cur}); cur, n, idx = [], 0, idx + 1
        if cur: chapters.append({'t': f'Phần {idx}', 'p': cur})
    return chapters

if __name__ == '__main__':
    bid, src = int(sys.argv[1]), sys.argv[2]
    lang = sys.argv[3] if len(sys.argv) > 3 else 'en'
    ch = build(open(src, encoding='utf-8', errors='replace').read(), lang)
    out = f'library/books/{bid}.json.gz'
    with gzip.open(out, 'wt', encoding='utf-8', compresslevel=9) as f:
        json.dump({'id': bid, 'lang': lang, 'ch': ch}, f, ensure_ascii=False, separators=(',', ':'))
    print(bid, len(ch), 'chapters', sum(len(c['p']) for c in ch), 'paragraphs')
