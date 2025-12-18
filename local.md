1. Cài đặt FFmpeg (Xử lý đa phương tiện)
Đây là phần mềm quan trọng nhất để gộp video 1080p và convert MP3 cho iPhone.

Bash

sudo apt update
sudo apt install ffmpeg -y
Kiểm tra: ffmpeg -version

2. Cài đặt yt-dlp (Bản mới nhất)
Lưu ý: Không nên cài bằng apt install yt-dlp vì bản đó thường rất cũ và hay bị YouTube chặn. Hãy cài bản chính thức từ GitHub:

Bash

# Tải file thực thi
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp

# Cấp quyền chạy
sudo chmod a+rx /usr/local/bin/yt-dlp
Kiểm tra: yt-dlp --version

3. Cài đặt Node.js & npm
Bạn nên dùng phiên bản LTS (Long Term Support) để ổn định nhất.

Bash

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
Kiểm tra: node -v và npm -v

4. Cài đặt trình thông dịch JavaScript (Fix lỗi log bạn gặp)
Như trong log trước bạn gửi có cảnh báo No supported JavaScript runtime could be found. YouTube cần cái này để giải mã một số thông tin video. Hãy cài thêm Deno (được yt-dlp khuyên dùng):

Bash

curl -fsSL https://deno.land/install.sh | sh
# Sau đó copy dòng export PATH... mà nó hiện ra dán vào terminal hoặc file .bashrc
Hoặc đơn giản hơn, bạn chỉ cần đảm bảo đã cài Node.js như ở bước 3, yt-dlp thường sẽ tự nhận diện được.

5. Khởi động Project
Sau khi đã cài đủ phần mềm, bạn vào thư mục dự án và chạy:

Cài thư viện Node.js:

Bash

npm install express
Chạy server:

Bash

node server.js