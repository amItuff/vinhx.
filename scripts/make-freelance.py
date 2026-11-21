#!/usr/bin/env python3
"""Writes freelance/index.html and freelance/freelance.js from one content table (vi + en),
so the readable text (good for Google) and the English switch can never drift apart.
Edit the text or prices below, then run:  python3 scripts/make-freelance.py"""
import json, html, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

T = {
 'vi': {
  'title': 'Nhận làm freelance: bot Discord, script tự động hóa, web | vinhx',
  'desc': 'Nhận làm bot Discord, script tự động hóa bằng Python, web cá nhân và công cụ chạy trên trình duyệt. Xem dịch vụ, giá tham khảo và sản phẩm đã làm.',
  'kicker': 'Nhận làm freelance',
  'status': 'Đang nhận việc mới',
  'h1': 'Bot, script và web gọn nhẹ, làm đúng thứ bạn cần',
  'lead': 'Mình là Vinh (vinhx). Mình viết bot Discord, script tự động hóa bằng Python và xây giao diện web tối giản, tải nhanh. Mô tả việc bạn cần, mình báo giá và làm từng bước có demo.',
  'cta': 'Nhờ báo giá', 'cta2': 'Xem sản phẩm đã làm',
  'sv.h': 'Mình làm được gì', 'sv.note': 'Giá chỉ để tham khảo. Giá chính xác được báo sau khi xem yêu cầu của bạn.',
  'from': 'Từ', 'ask': 'Nhờ báo giá',
  'pf.h': 'Sản phẩm đã làm', 'pf.lead': 'Đây là những thứ chạy thật ngay trên web này. Bạn dùng thử được luôn.',
  'pf.open': 'Mở',
  'pr.h': 'Quy trình làm việc',
  'faq.h': 'Câu hỏi thường gặp',
  'end.h': 'Có việc cần làm?', 'end.p': 'Gửi mô tả, ảnh tham khảo hoặc file đính kèm qua form liên hệ. Mình đọc và trả lời bạn.', 'end.cta': 'Gửi yêu cầu',
  'back': 'Về trang chủ',
 },
 'en': {
  'title': 'Freelance: Discord bots, automation scripts, web | vinhx',
  'desc': 'Available for Discord bots, Python automation scripts, personal websites and in-browser tools. See services, reference prices and finished work.',
  'kicker': 'Available for freelance',
  'status': 'Taking new work',
  'h1': 'Light, fast bots, scripts and web, built for what you need',
  'lead': "I'm Vinh (vinhx). I write Discord bots, Python automation scripts and minimal, fast web interfaces. Tell me what you need, I'll quote it and build it step by step with demos.",
  'cta': 'Get a quote', 'cta2': 'See finished work',
  'sv.h': 'What I can build', 'sv.note': 'Prices are a guide only. An exact quote comes after I see your requirements.',
  'from': 'From', 'ask': 'Get a quote',
  'pf.h': 'Finished work', 'pf.lead': 'These run for real on this site. You can try them right now.',
  'pf.open': 'Open',
  'pr.h': 'How we work',
  'faq.h': 'FAQ',
  'end.h': 'Got something to build?', 'end.p': 'Send a description, reference images or files through the contact form. I read everything and reply.', 'end.cta': 'Send a request',
  'back': 'Back home',
 }
}

SERVICES = [
 ('web', '500.000đ', {
   'vi': ('Web cá nhân, landing page', 'Trang giới thiệu tĩnh, tải nhanh, hiển thị tốt trên điện thoại, có form liên hệ.',
          ['Thiết kế theo phong cách bạn chọn', 'Tối ưu tốc độ và SEO cơ bản', 'Đăng lên Vercel, gắn tên miền riêng', 'Hướng dẫn tự sửa nội dung']),
   'en': ('Personal site, landing page', 'A static, fast page that looks right on phones, with a contact form.',
          ['Designed in the style you pick', 'Speed and basic SEO tuning', 'Deployed on Vercel with your own domain', 'A short guide to editing the content yourself'])}),
 ('bot', '300.000đ', {
   'vi': ('Bot Discord', 'Bot theo đúng nhu cầu của server bạn, viết bằng Python hoặc JavaScript.',
          ['Lệnh slash, ticket, vai trò tự động', 'Kiểm duyệt, nhật ký, thông báo', 'Lưu dữ liệu, bảng xếp hạng', 'Hướng dẫn chạy 24/7']),
   'en': ('Discord bot', "A bot built around your server's needs, in Python or JavaScript.",
          ['Slash commands, tickets, auto roles', 'Moderation, logs, announcements', 'Stored data and leaderboards', 'A guide to running it 24/7'])}),
 ('auto', '200.000đ', {
   'vi': ('Script tự động hóa', 'Việc lặp đi lặp lại giao cho Python làm thay bạn.',
          ['Xử lý Excel, CSV, PDF hàng loạt', 'Lấy dữ liệu từ web hoặc API', 'Báo cáo tự gửi qua Discord hoặc email', 'Có hướng dẫn chạy từng bước']),
   'en': ('Automation script', 'Hand the repetitive work to Python.',
          ['Batch Excel, CSV and PDF processing', 'Pull data from websites or APIs', 'Reports sent to Discord or email', 'Step-by-step run guide'])}),
 ('tool', '400.000đ', {
   'vi': ('Công cụ chạy trên trình duyệt', 'Web app nhỏ như Convert hay Library: xử lý ngay trên máy người dùng.',
          ['Đổi định dạng, xử lý file không cần máy chủ', 'Dữ liệu ở lại máy người dùng', 'Cài được như ứng dụng (PWA)', 'Giao diện hai ngôn ngữ']),
   'en': ('In-browser tool', 'A small web app like Convert or Library that works on the visitor’s own device.',
          ['File conversion and processing with no server', 'Data stays on the visitor’s device', 'Installable as an app (PWA)', 'Two-language interface'])}),
]

WORKS = [
 ('/note', 'banner-note.webp', 'note', {'vi': 'Ghi chú mã hoá, tự huỷ sau khi đọc. Mã hoá ngay trên trình duyệt.', 'en': 'Encrypted, self-destructing notes. Encrypted in your browser.'}),
 ('/convert', 'banner-convert.webp', 'convert', {'vi': 'Đổi định dạng ảnh, âm thanh, video, nén ảnh, gộp PDF. Không tải file lên đâu cả.', 'en': 'Convert images, audio and video, compress images, merge PDFs. Nothing is uploaded.'}),
 ('/library', 'banner-library.webp', 'library', {'vi': 'Thư viện đọc sách miễn phí, nhớ tiến độ, dịch tiếng Việt, dùng được offline.', 'en': 'A free reading library: keeps your place, Vietnamese translation, works offline.'}),
 ('https://vinhxhub.vercel.app/', 'banner-hub.webp', 'hub', {'vi': 'Trung tâm bot Discord và cộng đồng của vinhx.', 'en': "vinhx's Discord bot and community hub."}),
]

STEPS = {
 'vi': [('Gửi yêu cầu', 'Mô tả việc cần làm, gửi ảnh tham khảo hoặc file nếu có.'),
        ('Báo giá', 'Thống nhất phạm vi, giá và thời gian trước khi bắt đầu.'),
        ('Làm và demo', 'Làm từng phần, gửi bản chạy thử để bạn góp ý sớm.'),
        ('Bàn giao', 'Giao mã nguồn, hướng dẫn dùng và hỗ trợ khi cần chỉnh nhỏ.')],
 'en': [('Send a request', 'Describe the job and attach reference images or files.'),
        ('Get a quote', 'We agree scope, price and timing before work starts.'),
        ('Build and demo', 'I build it in parts and send working versions so you can give feedback early.'),
        ('Hand over', 'You get the source code, a how-to guide and help with small tweaks.')],
}

FAQ = {
 'vi': [('Làm xong trong bao lâu?', 'Tuỳ quy mô. Việc nhỏ như một script hay một trang thường trong vài ngày. Mình báo thời gian cụ thể cùng lúc báo giá.'),
        ('Thanh toán như thế nào?', 'Thường đặt cọc một phần trước, phần còn lại khi bàn giao. Cách thanh toán cụ thể được thống nhất khi báo giá.'),
        ('Mình có nhận mã nguồn không?', 'Có. Bạn nhận đầy đủ mã nguồn và hướng dẫn chạy để tự quản lý sau này.'),
        ('Thông tin và token của mình có an toàn không?', 'Khóa API, token bot và dữ liệu của bạn chỉ nằm trong biến môi trường hoặc máy của bạn, không bao giờ đưa vào mã công khai.'),
        ('Sửa đổi sau khi giao thì sao?', 'Chỉnh sửa nhỏ sau bàn giao được hỗ trợ. Việc thêm tính năng mới sẽ báo giá riêng.')],
 'en': [('How long does it take?', 'It depends on size. Small jobs like a script or a page usually take a few days. I give a specific timeline with the quote.'),
        ('How do payments work?', 'Usually a deposit up front and the rest on hand-over. The exact terms are agreed in the quote.'),
        ('Do I get the source code?', 'Yes. You get the full source and a guide to run it so you can manage it yourself.'),
        ('Are my keys and data safe?', 'API keys, bot tokens and your data live only in environment variables or on your own machine, never in public code.'),
        ('What about changes after delivery?', 'Small tweaks after hand-over are supported. New features are quoted separately.')],
}

e = html.escape
def tt(k, l): return T[l][k]

# ---------------------------------------------------------------- strings for the language switch
S = {'vi': {}, 'en': {}}
for l in ('vi', 'en'):
    for k, v in T[l].items(): S[l][k] = v
    for key, price, d in SERVICES:
        name, desc, items = d[l]
        S[l][f'sv.{key}.t'] = name; S[l][f'sv.{key}.d'] = desc
        for i, it in enumerate(items): S[l][f'sv.{key}.{i}'] = it
    for _, _, key, d in WORKS: S[l][f'pf.{key}'] = d[l]
    for i, (a, b) in enumerate(STEPS[l]): S[l][f'st.{i}.t'] = a; S[l][f'st.{i}.d'] = b
    for i, (a, b) in enumerate(FAQ[l]): S[l][f'q.{i}.q'] = a; S[l][f'q.{i}.a'] = b

def i(k, tag_text=None, l='vi'):
    return f'data-i18n="{k}"'

V = 'vi'
page = []
w = page.append
w(f'''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#07080b" />
  <title>{e(tt('title', V))}</title>
  <meta name="description" content="{e(tt('desc', V))}" />
  <link rel="canonical" href="https://vinhx.info/freelance" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="{e(tt('title', V))}" />
  <meta property="og:description" content="{e(tt('desc', V))}" />
  <meta property="og:url" content="https://vinhx.info/freelance" />
  <meta property="og:image" content="https://vinhx.info/assets/og-image.png?v=3" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/logo-48.png" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
  <script type="application/ld+json">{json.dumps({
    "@context": "https://schema.org", "@graph": [
      {"@type": "ProfessionalService", "name": "vinhx", "url": "https://vinhx.info/freelance", "image": "https://vinhx.info/assets/logo-512.png",
       "description": T['vi']['desc'], "areaServed": "VN", "knowsLanguage": ["vi", "en"],
       "hasOfferCatalog": {"@type": "OfferCatalog", "name": T['vi']['sv.h'], "itemListElement": [
         {"@type": "Offer", "itemOffered": {"@type": "Service", "name": d['vi'][0], "description": d['vi'][1]}} for _, _, d in SERVICES]}},
      {"@type": "FAQPage", "mainEntity": [
         {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ['vi']]}]
  }, ensure_ascii=False)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,500..700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/base.css?v=6" />
  <link rel="stylesheet" href="/freelance/freelance.css?v=4" />
  <script src="/freelance/freelance.js?v=1" defer></script>
  <script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <header class="bar">
    <a class="brand" href="/">vinhx<span>/freelance</span></a>
    <div class="lang-toggle" role="group" aria-label="Language">
      <button type="button" data-lang="vi">VI</button>
      <button type="button" data-lang="en">EN</button>
    </div>
  </header>

  <main class="fl">
    <section class="hero">
      <p class="eyebrow"><span data-i18n="kicker">{e(tt('kicker', V))}</span> · <span data-i18n="status">{e(tt('status', V))}</span></p>
      <h1 data-i18n="h1">{e(tt('h1', V))}</h1>
      <p class="lead" data-i18n="lead">{e(tt('lead', V))}</p>
      <div class="hero-act">
        <a class="btn primary" href="/?mail=other" data-i18n="cta">{e(tt('cta', V))}</a>
        <a class="btn" href="#works" data-i18n="cta2">{e(tt('cta2', V))}</a>
      </div>
    </section>

    <section aria-labelledby="sv-h">
      <h2 id="sv-h" data-i18n="sv.h">{e(tt('sv.h', V))}</h2>
      <div class="rows">''')
for key, price, d in SERVICES:
    name, desc, items = d['vi']
    w(f'''
        <article class="row" id="{key}">
          <div class="rt">
            <h3 data-i18n="sv.{key}.t">{e(name)}</h3>
            <p class="cd" data-i18n="sv.{key}.d">{e(desc)}</p>
            <ul>''' + ''.join(f'<li data-i18n="sv.{key}.{n}">{e(x)}</li>' for n, x in enumerate(items)) + f'''</ul>
          </div>
          <div class="rp">
            <p class="price"><span data-i18n="from">{e(tt('from', V))}</span> <b>{price}</b></p>
            <a class="btn" href="/?mail={key}" data-i18n="ask">{e(tt('ask', V))}</a>
          </div>
        </article>''')
w(f'''
      </div>
      <p class="small note" data-i18n="sv.note">{e(tt('sv.note', V))}</p>
    </section>

    <section id="works" aria-labelledby="pf-h">
      <h2 id="pf-h" data-i18n="pf.h">{e(tt('pf.h', V))}</h2>
      <p class="small" data-i18n="pf.lead">{e(tt('pf.lead', V))}</p>
      <div class="works">''')
for href, img, key, d in WORKS:
    ext = ' target="_blank" rel="noopener noreferrer"' if href.startswith('http') else ''
    w(f'''
        <a class="work" href="{href}"{ext}>
          <img src="/assets/{img}" alt="" width="640" height="320" loading="lazy" decoding="async" />
          <span class="wb"><b>{key}</b><span data-i18n="pf.{key}">{e(d['vi'])}</span></span>
        </a>''')
w(f'''
      </div>
    </section>

    <section aria-labelledby="pr-h">
      <h2 id="pr-h" data-i18n="pr.h">{e(tt('pr.h', V))}</h2>
      <ol class="steps">''')
for n, (a, b) in enumerate(STEPS['vi']):
    w(f'<li><b data-i18n="st.{n}.t">{e(a)}</b><span data-i18n="st.{n}.d">{e(b)}</span></li>')
w(f'''
      </ol>
    </section>

    <section aria-labelledby="faq-h">
      <h2 id="faq-h" data-i18n="faq.h">{e(tt('faq.h', V))}</h2>
      <div class="faq">''')
for n, (q, a) in enumerate(FAQ['vi']):
    w(f'<details><summary data-i18n="q.{n}.q">{e(q)}</summary><p data-i18n="q.{n}.a">{e(a)}</p></details>')
w(f'''
      </div>
    </section>

    <section class="end">
      <h2 data-i18n="end.h">{e(tt('end.h', V))}</h2>
      <p data-i18n="end.p">{e(tt('end.p', V))}</p>
      <a class="btn primary" href="/?mail=other" data-i18n="end.cta">{e(tt('end.cta', V))}</a>
    </section>
  </main>

  <footer class="site-foot" aria-label="vinhx">
    <a href="/">vinhx.info</a><span aria-hidden="true">·</span>
    <a href="/note">note</a><span aria-hidden="true">·</span>
    <a href="/convert">convert</a><span aria-hidden="true">·</span>
    <a href="/library">library</a><span aria-hidden="true">·</span>
    <a href="https://vinhxhub.vercel.app/" target="_blank" rel="noopener noreferrer">hub</a>
  </footer>
</body>
</html>
''')
open(os.path.join(ROOT, 'freelance', 'index.html'), 'w', encoding='utf8').write(''.join(page))

js = '''// vinhx.info/freelance: language switch only. The Vietnamese text is already in the HTML (so Google reads it);
// this file swaps it for English. Generated by scripts/make-freelance.py, do not edit by hand.
(() => {
  'use strict';
  const STRINGS = ''' + json.dumps(S, ensure_ascii=False, indent=1) + ''';
  let lang;
  try { lang = localStorage.getItem('lang'); } catch (_) { lang = null; }
  if (!STRINGS[lang]) lang = (navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';

  function apply(next) {
    lang = STRINGS[next] ? next : 'vi';
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (_) {}
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = STRINGS[lang][el.dataset.i18n];
      if (v) el.textContent = v;
    });
    document.title = STRINGS[lang].title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', STRINGS[lang].desc);
    document.querySelectorAll('.lang-toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }
  document.querySelectorAll('.lang-toggle button').forEach((b) => b.addEventListener('click', () => apply(b.dataset.lang)));
  apply(lang);
})();
'''
open(os.path.join(ROOT, 'freelance', 'freelance.js'), 'w', encoding='utf8').write(js)
print('ok')
