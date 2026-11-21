#!/usr/bin/env python3
"""Writes one landing page per Convert tool (convert/<slug>/index.html) from convert/index.html,
and refreshes the tool grid inside convert/index.html. Every page has its own title, description,
heading, how-to steps and FAQ (vi + en), so Google can rank each job ("nen anh", "gop pdf", ...) on its own.
All pages share convert.js; the data-tool attribute picks the preset.

Run after editing the table below:  python3 scripts/make-convert-pages.py"""
import json, html, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'convert', 'index.html')
e = html.escape

# slug, preset (key of TOOLS in convert.js), vi, en. Each language: name, h1, desc, lead, steps(3), faq[(q, a)]
TOOLS = [
 ('nen-anh', 'compress',
  dict(name='Nén ảnh', h1='Nén ảnh online, giảm dung lượng JPG, PNG, WebP', desc='Nén ảnh hàng loạt ngay trên trình duyệt: giảm dung lượng JPG, PNG, WebP mà vẫn nét. Ảnh không bị tải lên máy chủ. Miễn phí.',
       lead='Giảm dung lượng nhiều ảnh cùng lúc. Giữ nguyên định dạng, kéo thanh chất lượng xuống đến mức bạn thấy ổn. File không bao giờ nặng hơn bản gốc.',
       steps=['Thả ảnh vào khung hoặc bấm để chọn, chọn được nhiều ảnh.', 'Giữ "Giữ nguyên định dạng", kéo thanh chất lượng (khoảng 70 đến 80 là cân bằng). Đặt chiều rộng tối đa nếu muốn nhỏ hơn nữa.', 'Bấm Chuyển đổi rồi tải từng ảnh, hoặc tải tất cả trong một file zip.'],
       faq=[('Nén ảnh có làm giảm chất lượng không?', 'Với JPG và WebP, chất lượng giảm rất ít ở mức 70 đến 85 trong khi dung lượng giảm mạnh. Bạn tự chọn mức mình chấp nhận.'),
            ('Vì sao ảnh PNG ít giảm?', 'PNG nén không mất dữ liệu nên khó nhỏ hơn. Muốn nhỏ hơn nhiều, hãy đổi PNG sang WebP hoặc đặt chiều rộng tối đa.')]),
  dict(name='Compress images', h1='Compress images online: shrink JPG, PNG and WebP', desc='Batch-compress images right in your browser: smaller JPG, PNG and WebP that still look sharp. Nothing is uploaded. Free.',
       lead='Shrink many images at once. Keep the format and drag quality down to a level you like. A file never ends up bigger than the original.',
       steps=['Drop images into the box or click to choose; you can pick several.', 'Keep "Keep format" and drag the quality slider (around 70 to 80 is a good balance). Set a max width to go smaller still.', 'Press Convert, then download each image or everything as one zip.'],
       faq=[('Does compressing lower quality?', 'For JPG and WebP the loss is tiny at 70 to 85 while the size drops a lot. You choose the level you accept.'),
            ('Why do PNG files shrink less?', 'PNG is lossless, so it is hard to make smaller. For a big saving, convert PNG to WebP or set a max width.')])),
 ('doi-kich-thuoc-anh', 'resize',
  dict(name='Đổi kích thước ảnh', h1='Đổi kích thước ảnh online, thu nhỏ hàng loạt', desc='Thu nhỏ nhiều ảnh theo chiều rộng tối đa ngay trên trình duyệt, giữ đúng tỉ lệ. Không tải ảnh lên máy chủ. Miễn phí.',
       lead='Đặt chiều rộng tối đa và thu nhỏ cả loạt ảnh một lần, giữ nguyên tỉ lệ khung hình. Hợp để chuẩn bị ảnh cho web, email hoặc mạng xã hội.',
       steps=['Thả các ảnh cần thu nhỏ vào khung.', 'Nhập chiều rộng tối đa (ví dụ 1280) vào ô "Chiều rộng tối đa". Ảnh nhỏ hơn mức này được giữ nguyên.', 'Bấm Chuyển đổi và tải về.'],
       faq=[('Ảnh có bị méo không?', 'Không. Chiều cao tự tính theo tỉ lệ gốc.'), ('Có phóng to ảnh được không?', 'Không. Công cụ chỉ thu nhỏ, vì phóng to làm ảnh mờ.')]),
  dict(name='Resize images', h1='Resize images online, shrink in bulk', desc='Resize many images to a max width right in your browser, keeping the aspect ratio. Nothing is uploaded. Free.',
       lead='Set a maximum width and shrink a whole batch at once, keeping the aspect ratio. Handy for preparing images for the web, email or social media.',
       steps=['Drop the images you want to shrink.', 'Enter a max width (for example 1280) in "Max width". Smaller images are left as they are.', 'Press Convert and download.'],
       faq=[('Will the image look stretched?', 'No. The height is worked out from the original ratio.'), ('Can I enlarge images?', 'No. It only shrinks, because enlarging makes images blurry.')])),
 ('anh-sang-pdf', 'pdf',
  dict(name='Ảnh sang PDF', h1='Chuyển ảnh sang PDF, gộp nhiều ảnh thành một file', desc='Chuyển JPG, PNG, WebP sang PDF và gộp nhiều ảnh thành một file PDF ngay trên trình duyệt. Chọn khổ A4 hoặc vừa ảnh. Không tải ảnh lên máy chủ.',
       lead='Gộp nhiều ảnh thành một file PDF, mỗi ảnh một trang. Chọn khổ trang vừa với ảnh hoặc A4. Ảnh chụp bằng điện thoại không bị xoay ngược.',
       steps=['Thả ảnh vào khung, dùng mũi tên lên xuống để xếp đúng thứ tự trang.', 'Ở phần Ảnh, chọn định dạng "PDF (gộp thành 1 file)" và khổ trang.', 'Bấm Chuyển đổi và tải file PDF.'],
       faq=[('Tôi gộp được tối đa bao nhiêu ảnh?', 'Không có giới hạn cứng. Số lượng phụ thuộc vào bộ nhớ của máy bạn, vài chục ảnh thường chạy tốt.'), ('Chất lượng ảnh trong PDF thế nào?', 'Ảnh lớn được thu về tối đa 2400 px cho file nhẹ. Bạn đặt chiều rộng tối đa riêng nếu cần.')]),
  dict(name='Images to PDF', h1='Convert images to PDF, merge many into one file', desc='Turn JPG, PNG and WebP into one PDF right in your browser. Pick A4 or fit-to-image pages. Nothing is uploaded.',
       lead='Merge several images into one PDF, one image per page. Choose a page size that fits the image or A4. Phone photos are not rotated the wrong way.',
       steps=['Drop images into the box and use the arrows to put them in page order.', 'In the Images panel choose "PDF (merge into one file)" and a page size.', 'Press Convert and download the PDF.'],
       faq=[('How many images can I merge?', 'There is no hard limit. It depends on your device memory; a few dozen usually works well.'), ('What about image quality in the PDF?', 'Large images are scaled to at most 2400 px to keep the file light. Set your own max width if you need to.')])),
 ('gop-pdf', 'pdf',
  dict(name='Gộp PDF', h1='Gộp file PDF online, nối nhiều PDF thành một', desc='Gộp nhiều file PDF (và ảnh) thành một file PDF ngay trên trình duyệt. Đổi thứ tự bằng mũi tên. Không tải file lên máy chủ, miễn phí.',
       lead='Nối nhiều file PDF thành một, theo đúng thứ tự bạn xếp. Có thể gộp cả ảnh vào. File của bạn không rời khỏi máy.',
       steps=['Thả các file PDF vào khung (có thể kèm ảnh).', 'Dùng mũi tên lên xuống để xếp đúng thứ tự.', 'Bấm Chuyển đổi, file gộp xuất hiện ở dòng đầu tiên để tải về.'],
       faq=[('PDF có mật khẩu gộp được không?', 'Chưa. File bị khóa mật khẩu sẽ báo lỗi. Hãy mở khóa trước rồi gộp.'), ('File gộp có giữ nguyên chất lượng không?', 'Có. Các trang PDF được sao chép nguyên vẹn, không nén lại.')]),
  dict(name='Merge PDF', h1='Merge PDF files online, join many PDFs into one', desc='Merge several PDF files (and images) into one PDF right in your browser. Reorder with arrows. Nothing is uploaded, free.',
       lead='Join several PDFs into one in the order you set. Images can be added too. Your files never leave your device.',
       steps=['Drop the PDF files into the box (images are fine too).', 'Use the up and down arrows to set the order.', 'Press Convert; the merged file appears on the first row to download.'],
       faq=[('Can I merge password-protected PDFs?', 'Not yet. A locked file shows an error. Unlock it first, then merge.'), ('Is the quality kept?', 'Yes. PDF pages are copied as they are, not recompressed.')])),
 ('tach-pdf', 'pdfpages',
  dict(name='Chọn trang và xoay PDF', h1='Tách trang PDF, xóa trang, xoay trang online', desc='Giữ lại những trang PDF bạn cần (ví dụ 1-3,5) và xoay trang 90, 180, 270 độ ngay trên trình duyệt. Không tải file lên máy chủ, miễn phí.',
       lead='Cắt một file PDF ra chỉ còn những trang bạn cần, và xoay trang bị ngược. Mọi thứ chạy trên máy của bạn.',
       steps=['Thả file PDF vào khung và chọn "Chọn trang và xoay (từng file)".', 'Nhập các trang cần giữ, ví dụ 1-3,5 (để trống là giữ tất cả), và chọn góc xoay nếu cần.', 'Bấm Chuyển đổi và tải file mới.'],
       faq=[('Xóa trang khỏi PDF thế nào?', 'Nhập các trang muốn giữ lại. Trang không có trong danh sách sẽ bị bỏ. Ví dụ file 10 trang muốn bỏ trang 4: nhập 1-3,5-10.'), ('Có làm hỏng file gốc không?', 'Không. Công cụ tạo ra một file mới, file gốc giữ nguyên.')]),
  dict(name='Pick and rotate PDF pages', h1='Extract, delete and rotate PDF pages online', desc='Keep just the PDF pages you need (for example 1-3,5) and rotate them 90, 180 or 270 degrees in your browser. Nothing is uploaded, free.',
       lead='Cut a PDF down to the pages you need and fix pages that are upside down. Everything runs on your own device.',
       steps=['Drop a PDF and choose "Pick pages and rotate (each file)".', 'Enter the pages to keep, for example 1-3,5 (empty keeps all), and pick a rotation if needed.', 'Press Convert and download the new file.'],
       faq=[('How do I delete pages from a PDF?', 'Enter the pages you want to keep; the others are dropped. For a 10-page file without page 4, enter 1-3,5-10.'), ('Does it change my original file?', 'No. It makes a new file and leaves the original alone.')])),
 ('webp-sang-jpg', 'webpjpg',
  dict(name='WebP sang JPG', h1='Chuyển WebP sang JPG online, hàng loạt', desc='Đổi ảnh WebP sang JPG hàng loạt ngay trên trình duyệt, không tải ảnh lên máy chủ. Miễn phí.',
       lead='Một số phần mềm và trang web chưa mở được WebP. Đổi cả loạt sang JPG để dùng ở mọi nơi.',
       steps=['Thả các ảnh WebP vào khung.', 'Định dạng đã chọn sẵn JPG. Chỉnh chất lượng nếu muốn.', 'Bấm Chuyển đổi và tải về.'],
       faq=[('Ảnh WebP trong suốt thì sao?', 'JPG không có nền trong suốt nên phần trong suốt được nền trắng. Nếu cần giữ trong suốt, hãy đổi sang PNG.')]),
  dict(name='WebP to JPG', h1='Convert WebP to JPG online, in bulk', desc='Convert WebP images to JPG in bulk right in your browser. Nothing is uploaded. Free.',
       lead='Some apps and sites still cannot open WebP. Convert the whole batch to JPG so it works everywhere.',
       steps=['Drop the WebP images into the box.', 'JPG is already chosen. Adjust quality if you like.', 'Press Convert and download.'],
       faq=[('What about transparent WebP?', 'JPG has no transparency, so transparent areas become white. To keep transparency, convert to PNG instead.')])),
 ('webp-sang-png', 'webppng',
  dict(name='WebP sang PNG', h1='Chuyển WebP sang PNG online, giữ nền trong suốt', desc='Đổi ảnh WebP sang PNG hàng loạt, giữ nền trong suốt, ngay trên trình duyệt. Không tải ảnh lên máy chủ.',
       lead='Đổi WebP sang PNG và giữ nguyên nền trong suốt. Hợp cho logo, biểu tượng và ảnh cần chồng lên nền khác.',
       steps=['Thả các ảnh WebP vào khung.', 'Định dạng đã chọn sẵn PNG.', 'Bấm Chuyển đổi và tải về.'],
       faq=[('PNG có nặng hơn WebP không?', 'Thường là có, vì PNG nén không mất dữ liệu. Đổi lại ảnh giữ nguyên từng điểm ảnh.')]),
  dict(name='WebP to PNG', h1='Convert WebP to PNG online, keep transparency', desc='Convert WebP images to PNG in bulk, keeping transparent backgrounds, in your browser. Nothing is uploaded.',
       lead='Turn WebP into PNG and keep the transparent background. Good for logos, icons and images that sit on other backgrounds.',
       steps=['Drop the WebP images into the box.', 'PNG is already chosen.', 'Press Convert and download.'],
       faq=[('Is PNG bigger than WebP?', 'Usually, because PNG is lossless. In return every pixel is preserved.')])),
 ('png-sang-jpg', 'pngjpg',
  dict(name='PNG sang JPG', h1='Chuyển PNG sang JPG online để giảm dung lượng', desc='Đổi ảnh PNG sang JPG hàng loạt ngay trên trình duyệt để file nhẹ hơn nhiều. Không tải ảnh lên máy chủ.',
       lead='Ảnh chụp màn hình và ảnh PNG thường rất nặng. Đổi sang JPG để giảm dung lượng mạnh khi không cần nền trong suốt.',
       steps=['Thả các ảnh PNG vào khung.', 'Định dạng đã chọn sẵn JPG, chỉnh chất lượng nếu muốn.', 'Bấm Chuyển đổi và tải về.'],
       faq=[('Nền trong suốt của PNG có mất không?', 'Có, phần trong suốt sẽ thành nền trắng vì JPG không hỗ trợ trong suốt.')]),
  dict(name='PNG to JPG', h1='Convert PNG to JPG online to cut file size', desc='Convert PNG images to JPG in bulk in your browser for much smaller files. Nothing is uploaded.',
       lead='Screenshots and PNG images are often huge. Convert to JPG for a big saving when you do not need transparency.',
       steps=['Drop the PNG images into the box.', 'JPG is already chosen; adjust quality if you like.', 'Press Convert and download.'],
       faq=[('Will PNG transparency be lost?', 'Yes, transparent areas turn white because JPG has no transparency.')])),
 ('jpg-sang-png', 'jpgpng',
  dict(name='JPG sang PNG', h1='Chuyển JPG sang PNG online', desc='Đổi ảnh JPG sang PNG hàng loạt ngay trên trình duyệt, không tải ảnh lên máy chủ. Miễn phí.',
       lead='Đổi JPG sang PNG khi nơi bạn dùng yêu cầu PNG hoặc khi bạn định chỉnh sửa tiếp mà không muốn nén thêm lần nữa.',
       steps=['Thả các ảnh JPG vào khung.', 'Định dạng đã chọn sẵn PNG.', 'Bấm Chuyển đổi và tải về.'],
       faq=[('Đổi sang PNG có làm ảnh nét hơn không?', 'Không. PNG chỉ giữ nguyên chất lượng hiện có của JPG, không thể khôi phục chi tiết đã mất.')]),
  dict(name='JPG to PNG', h1='Convert JPG to PNG online', desc='Convert JPG images to PNG in bulk in your browser. Nothing is uploaded. Free.',
       lead='Turn JPG into PNG when a site asks for PNG, or when you plan to edit further without compressing again.',
       steps=['Drop the JPG images into the box.', 'PNG is already chosen.', 'Press Convert and download.'],
       faq=[('Does PNG make the image sharper?', 'No. PNG only keeps what the JPG already has; it cannot bring back lost detail.')])),
 ('video-sang-gif', 'gif',
  dict(name='Video sang GIF', h1='Chuyển video sang GIF online, cắt đoạn tùy chọn', desc='Cắt một đoạn video (tối đa 20 giây) và đổi thành ảnh GIF động ngay trên trình duyệt. Chọn giây bắt đầu, độ dài, số khung hình. Không tải video lên máy chủ.',
       lead='Chọn đúng đoạn video bạn muốn, đổi thành GIF động. Chỉnh số khung hình mỗi giây và chiều rộng để cân đối giữa chất lượng và dung lượng.',
       steps=['Thả video vào khung (MP4, WebM, MOV).', 'Chọn "GIF động", nhập giây bắt đầu và độ dài đoạn cần cắt (tối đa 20 giây).', 'Bấm Chuyển đổi và tải GIF.'],
       faq=[('GIF có tiếng không?', 'Không, GIF không hỗ trợ âm thanh.'), ('Làm sao để GIF nhẹ hơn?', 'Giảm chiều rộng (ví dụ 360), giảm số khung hình xuống 8 đến 10 hoặc cắt ngắn đoạn lại.')]),
  dict(name='Video to GIF', h1='Convert video to GIF online, with a clip cut', desc='Cut a clip (up to 20 seconds) from a video and turn it into an animated GIF right in your browser. Pick start, length and frame rate. Nothing is uploaded.',
       lead='Pick exactly the part of the video you want and turn it into an animated GIF. Tune frames per second and width to balance quality and size.',
       steps=['Drop a video into the box (MP4, WebM, MOV).', 'Choose "Animated GIF", enter the start second and the clip length (max 20 seconds).', 'Press Convert and download the GIF.'],
       faq=[('Does the GIF have sound?', 'No, GIF does not support audio.'), ('How do I make the GIF smaller?', 'Lower the width (for example 360), drop to 8 to 10 frames per second, or shorten the clip.')])),
 ('mp4-sang-mp3', 'videomp3',
  dict(name='MP4 sang MP3', h1='Tách âm thanh MP3 từ video MP4 online', desc='Lấy âm thanh từ video MP4, WebM, MOV và lưu thành MP3 ngay trên trình duyệt. Chọn chất lượng 96 đến 320 kbps. Không tải video lên máy chủ.',
       lead='Lấy riêng phần tiếng của video và lưu thành file MP3 để nghe nhạc, bài giảng hay podcast. Chạy nhanh vì không cần quay lại video.',
       steps=['Thả video vào khung.', 'Ở phần Video chọn "Chỉ lấy âm thanh (MP3)".', 'Bấm Chuyển đổi và tải file MP3.'],
       faq=[('Chất lượng MP3 là bao nhiêu?', 'Video được lấy âm thanh ở 128 kbps, mức cân bằng tốt giữa chất lượng và dung lượng.'), ('Video dài có xử lý được không?', 'Được, tùy bộ nhớ máy. Video vài chục phút thường chạy ổn trên máy tính.')]),
  dict(name='MP4 to MP3', h1='Extract MP3 audio from MP4 video online', desc='Pull the audio out of MP4, WebM and MOV videos and save it as MP3 in your browser. Nothing is uploaded.',
       lead='Take just the sound of a video and save it as an MP3 for music, lectures or podcasts. It is fast because the video does not need to be re-recorded.',
       steps=['Drop a video into the box.', 'In the Video panel choose "Audio only (MP3)".', 'Press Convert and download the MP3.'],
       faq=[('What MP3 quality do I get?', 'Audio from a video is encoded at 128 kbps, a good balance of quality and size.'), ('Can long videos be handled?', 'Yes, depending on your device memory. Videos of a few dozen minutes usually run fine on a computer.')])),
 ('wav-sang-mp3', 'wavmp3',
  dict(name='WAV sang MP3', h1='Chuyển WAV sang MP3 online để nhẹ hơn', desc='Đổi file âm thanh WAV sang MP3 ngay trên trình duyệt, chọn chất lượng 96 đến 320 kbps. Không tải file lên máy chủ. Miễn phí.',
       lead='WAV rất nặng. Đổi sang MP3 để file nhỏ hơn nhiều mà vẫn nghe tốt. Chọn mức chất lượng bạn cần.',
       steps=['Thả file WAV (hoặc M4A, OGG, FLAC) vào khung.', 'Định dạng đã chọn sẵn MP3, chọn chất lượng (128 kbps là phổ biến).', 'Bấm Chuyển đổi và tải về.'],
       faq=[('Nên chọn chất lượng nào?', '128 kbps hợp nghe thường ngày, 192 đến 320 kbps khi bạn cần chất lượng cao. Chọn mono giúp file nhỏ thêm một nửa với giọng nói.')]),
  dict(name='WAV to MP3', h1='Convert WAV to MP3 online for smaller files', desc='Convert WAV audio to MP3 in your browser with 96 to 320 kbps quality. Nothing is uploaded. Free.',
       lead='WAV is huge. Convert to MP3 for a much smaller file that still sounds good. Pick the quality you need.',
       steps=['Drop a WAV file (or M4A, OGG, FLAC) into the box.', 'MP3 is already chosen; pick a quality (128 kbps is common).', 'Press Convert and download.'],
       faq=[('Which quality should I pick?', '128 kbps suits everyday listening, 192 to 320 kbps when you want high quality. Mono halves the size for voice.')])),
 ('cat-nhac', 'trim',
  dict(name='Cắt nhạc', h1='Cắt nhạc, cắt file âm thanh MP3 online', desc='Cắt một đoạn từ file nhạc hoặc ghi âm và lưu thành MP3 hoặc WAV ngay trên trình duyệt. Nhập giây bắt đầu và độ dài. Không tải file lên máy chủ.',
       lead='Cắt lấy đúng đoạn bạn cần từ bài hát, bài giảng hay ghi âm, làm nhạc chuông hoặc đoạn trích. Không cần cài phần mềm.',
       steps=['Thả file âm thanh vào khung.', 'Nhập "Cắt từ giây thứ" và "Độ dài đoạn cắt" (để trống độ dài là cắt đến hết).', 'Chọn MP3 hoặc WAV, bấm Chuyển đổi và tải về.'],
       faq=[('Cắt làm nhạc chuông được không?', 'Được. Cắt khoảng 20 đến 30 giây rồi lưu thành MP3.'), ('Cắt xong có giảm chất lượng không?', 'Nếu lưu WAV thì không. Lưu MP3 thì file được mã hóa lại theo mức kbps bạn chọn.')]),
  dict(name='Cut audio', h1='Cut music and audio files online', desc='Cut a part out of a song or recording and save it as MP3 or WAV in your browser. Enter a start second and length. Nothing is uploaded.',
       lead='Cut exactly the part you need from a song, lecture or recording, for a ringtone or a clip. No software to install.',
       steps=['Drop an audio file into the box.', 'Enter "Cut from second" and "Length of the cut" (leave the length empty to cut to the end).', 'Choose MP3 or WAV, press Convert and download.'],
       faq=[('Can I make a ringtone?', 'Yes. Cut about 20 to 30 seconds and save as MP3.'), ('Does cutting reduce quality?', 'Not with WAV. With MP3 the clip is re-encoded at the kbps you pick.')])),
]

COMMON_FAQ = {
 'vi': ('File của tôi có bị tải lên máy chủ không?', 'Không. Mọi thứ chạy ngay trong trình duyệt của bạn, file không rời khỏi máy và không ai khác thấy được.'),
 'en': ('Are my files uploaded to a server?', 'No. Everything runs in your own browser. Your files never leave your device and nobody else can see them.'),
}
UI = {
 'vi': {'all': 'Tất cả công cụ', 'how': 'Cách dùng', 'faq': 'Câu hỏi thường gặp', 'more': 'Công cụ khác', 'back': 'Tất cả công cụ Convert', 'kicker': 'Công cụ miễn phí'},
 'en': {'all': 'All tools', 'how': 'How to use', 'faq': 'FAQ', 'more': 'More tools', 'back': 'All Convert tools', 'kicker': 'Free tool'},
}
BASE = 'https://vinhx.info'

def names_i18n():
    return {l: {f'tn.{slug}': (vi if l == 'vi' else en)['name'] for slug, _, vi, en in TOOLS} for l in ('vi', 'en')}

def grid_html():
    out = ['<section class="alltools" aria-labelledby="alltools-h">',
           f'  <h2 id="alltools-h" data-i18n="ui.all">{e(UI["vi"]["all"])}</h2>', '  <div class="tgrid">']
    for slug, _, vi, en in TOOLS:
        out.append(f'    <a class="tcard" href="/convert/{slug}"><b data-i18n="tn.{slug}">{e(vi["name"])}</b><span data-i18n="td.{slug}">{e(vi["desc"].split(". ")[0].rstrip(".") + ".")}</span></a>')
    out += ['  </div>', '</section>']
    return '\n'.join(out)

def main():
    src = open(SRC, encoding='utf8').read()
    # --- 1. the grid inside the main Convert page
    grid = f'<!--tools:start-->\n{grid_html()}\n<!--tools:end-->'
    if '<!--tools:start-->' in src:
        src = re.sub(r'<!--tools:start-->.*?<!--tools:end-->', lambda m: grid, src, flags=re.S)
    else:
        src = src.replace('    </ul>\n  </main>', '    </ul>\n\n    ' + grid.replace('\n', '\n    ') + '\n  </main>', 1)
    # strings for the grid (English) live in the page itself, merged by convert.js like on tool pages
    grid_i18n = {l: {} for l in ('vi', 'en')}
    for slug, _, vi, en in TOOLS:
        for l, d in (('vi', vi), ('en', en)):
            grid_i18n[l][f'tn.{slug}'] = d['name']
            grid_i18n[l][f'td.{slug}'] = d['desc'].split('. ')[0].rstrip('.') + '.'
    for l in grid_i18n: grid_i18n[l]['ui.all'] = UI[l]['all']
    jt = '<script type="application/json" id="tool-i18n">' + json.dumps(grid_i18n, ensure_ascii=False, separators=(',', ':')) + '</script>\n'
    if 'id="tool-i18n"' in src:
        src = re.sub(r'<script type="application/json" id="tool-i18n">.*?</script>\n', lambda m: jt, src, flags=re.S)
    else:
        src = src.replace('</body>', jt + '</body>', 1)
    open(SRC, 'w', encoding='utf8').write(src)
    tmpl = src

    # --- 2. one page per tool
    for slug, preset, vi, en in TOOLS:
        url = f'{BASE}/convert/{slug}'
        title_vi = f'{vi["name"]} online miễn phí | vinhx convert'
        title_en = f'{en["name"]} online, free | vinhx convert'
        page = tmpl
        page = re.sub(r'<title>.*?</title>', lambda m: f'<title>{e(title_vi)}</title>', page, count=1, flags=re.S)
        page = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + e(vi['desc']) + m.group(2), page, count=1)
        page = re.sub(r'(<link rel="canonical" href=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), page, count=1)
        page = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + e(title_vi) + m.group(2), page, count=1)
        page = re.sub(r'(<meta property="og:description" content=")[^"]*(")', lambda m: m.group(1) + e(vi['desc']) + m.group(2), page, count=1)
        page = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), page, count=1)
        page = page.replace('<body>', f'<body data-tool="{preset}">', 1)
        page = re.sub(r'(<p class="kicker" data-i18n="kicker">).*?(</p>)', lambda m: m.group(1) + e(UI['vi']['kicker']) + m.group(2), page, count=1)
        page = re.sub(r'(<h1 data-i18n="title">).*?(</h1>)', lambda m: m.group(1) + e(vi['h1']) + m.group(2), page, count=1)
        page = re.sub(r'(<p class="lead" data-i18n="lead">).*?(</p>)', lambda m: m.group(1) + e(vi['lead']) + m.group(2), page, count=1)
        page = page.replace('<div class="tools" id="tools" role="group" aria-label="Công cụ">', '<div class="tools" id="tools" role="group" aria-label="Công cụ" hidden>', 1)
        page = page.replace('<main class="cv">', f'<main class="cv">\n    <a class="crumb" href="/convert" data-i18n="ui.back">{e(UI["vi"]["back"])}</a>', 1)
        # drop the generic grid, tool pages get steps + FAQ + related instead
        page = re.sub(r'<!--tools:start-->.*?<!--tools:end-->', '', page, flags=re.S)

        faq_vi = vi['faq'] + [COMMON_FAQ['vi']]
        faq_en = en['faq'] + [COMMON_FAQ['en']]
        related = [s for s, _, _, _ in TOOLS if s != slug][:6]
        more = ['<section class="tp-more">',
                f'  <h2 data-i18n="ui.how">{e(UI["vi"]["how"])}</h2>', '  <ol class="tsteps">']
        for n, st in enumerate(vi['steps']): more.append(f'    <li data-i18n="tp.s{n}">{e(st)}</li>')
        more += ['  </ol>', f'  <h2 data-i18n="ui.faq">{e(UI["vi"]["faq"])}</h2>', '  <div class="tfaq">']
        for n, (q, a) in enumerate(faq_vi):
            more.append(f'    <details><summary data-i18n="tp.q{n}">{e(q)}</summary><p data-i18n="tp.a{n}">{e(a)}</p></details>')
        more += ['  </div>', f'  <h2 data-i18n="ui.more">{e(UI["vi"]["more"])}</h2>', '  <div class="tgrid">']
        for s in related:
            nm = next(v['name'] for sl, _, v, _ in TOOLS if sl == s)
            more.append(f'    <a class="tcard slim" href="/convert/{s}"><b data-i18n="tn.{s}">{e(nm)}</b></a>')
        more += ['  </div>', '</section>']
        page = page.replace('  </main>', '\n    ' + '\n    '.join(more) + '\n  </main>', 1)

        i18n = {}
        for l, d, fq in (('vi', vi, faq_vi), ('en', en, faq_en)):
            m = {'title': d['h1'], 'lead': d['lead'], 'kicker': UI[l]['kicker'], 'doc': title_vi if l == 'vi' else title_en,
                 'ui.how': UI[l]['how'], 'ui.faq': UI[l]['faq'], 'ui.more': UI[l]['more'], 'ui.back': UI[l]['back']}
            for n, st in enumerate(d['steps']): m[f'tp.s{n}'] = st
            for n, (q, a) in enumerate(fq): m[f'tp.q{n}'] = q; m[f'tp.a{n}'] = a
            i18n[l] = m
        for l, nm in names_i18n().items(): i18n[l].update(nm)
        page = re.sub(r'<script type="application/json" id="tool-i18n">.*?</script>', lambda m: '<script type="application/json" id="tool-i18n">' + json.dumps(i18n, ensure_ascii=False, separators=(',', ':')) + '</script>', page, count=1, flags=re.S)

        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "vinhx", "item": BASE + "/"},
                {"@type": "ListItem", "position": 2, "name": "convert", "item": BASE + "/convert"},
                {"@type": "ListItem", "position": 3, "name": vi['name'], "item": url}]},
            {"@type": "WebApplication", "name": vi['name'] + ' | vinhx convert', "url": url, "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any",
             "offers": {"@type": "Offer", "price": "0", "priceCurrency": "VND"}, "description": vi['desc']},
            {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq_vi]}]}
        page = page.replace('<link rel="preconnect" href="https://fonts.googleapis.com">', '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False, separators=(',', ':')) + '</script>\n  <link rel="preconnect" href="https://fonts.googleapis.com">', 1)

        d = os.path.join(ROOT, 'convert', slug)
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w', encoding='utf8').write(page)
    print('pages:', len(TOOLS))

main()
