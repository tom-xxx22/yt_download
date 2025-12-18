TÀI LIỆU DEPLOY & VẬN HÀNH EZ-DOWNLOADER
Mục tiêu: Triển khai ứng dụng Web Download Video (Node.js + yt-dlp + FFmpeg) lên máy chủ VPS Linux (Ubuntu 20.04/22.04/24.04).

🛠 PHẦN 1: CHUẨN BỊ
VPS (Virtual Private Server):

Hệ điều hành: Ubuntu 22.04 LTS (Khuyên dùng).

Cấu hình tối thiểu: 2 vCPU, 2GB RAM (Để chạy mượt FFmpeg).

Tên miền (Domain): Đã trỏ DNS (A Record) về địa chỉ IP của VPS.

Phần mềm kết nối: PuTTY (Windows) hoặc Terminal (Mac/Linux) để SSH.

⚙️ PHẦN 2: CÀI ĐẶT MÔI TRƯỜNG (SERVER SETUP)
Đăng nhập vào VPS qua SSH và chạy lần lượt các lệnh sau:

1. Cập nhật hệ thống
Bash

sudo apt update && sudo apt upgrade -y
2. Cài đặt các thư viện cốt lõi (FFmpeg, Python)
Bash

sudo apt install ffmpeg python3 python3-pip zip unzip -y
Kiểm tra: Gõ ffmpeg -version. Nếu hiện thông tin là OK.

3. Cài đặt Node.js (Phiên bản 20.x)
Bash

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
Kiểm tra: node -v (Phải là v20.x.x).

4. Cài đặt yt-dlp (Quan trọng: Không dùng apt)
Phải cài thủ công để lấy bản mới nhất, tránh lỗi YouTube chặn.

Bash

sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
Kiểm tra: yt-dlp --version.

🚀 PHẦN 3: TRIỂN KHAI CODE (DEPLOYMENT)
1. Upload code lên VPS
Bạn có thể dùng Git hoặc upload thủ công qua FileZilla vào thư mục /var/www/ez-downloader.

Ví dụ dùng Git:

Bash

# Tạo thư mục
sudo mkdir -p /var/www/ez-downloader
sudo chown -R $USER:$USER /var/www/ez-downloader

# Clone code (Thay link git của bạn vào)
git clone https://github.com/username/ez-downloader.git /var/www/ez-downloader
cd /var/www/ez-downloader
2. Cài đặt thư viện Node.js
Bash

npm install
3. Chạy ứng dụng với PM2 (Quản lý tiến trình)
PM2 giúp web tự khởi động lại nếu bị crash hoặc reboot VPS.

Bash

sudo npm install pm2 -g
pm2 start server.js -i max --name "ez-downloader"
pm2 save
pm2 startup
(Copy và chạy dòng lệnh mà pm2 startup hiện ra để hoàn tất).

🌐 PHẦN 4: CẤU HÌNH WEB SERVER (NGINX & SSL)
1. Cài đặt Nginx
Bash

sudo apt install nginx -y
2. Cấu hình Reverse Proxy
Tạo file cấu hình mới:

Bash

sudo nano /etc/nginx/sites-available/ez-downloader
Dán nội dung sau vào (Thay your-domain.com bằng tên miền của bạn):

Nginx

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Tối ưu cho streaming video
    client_max_body_size 100M;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
Lưu file (Ctrl+O -> Enter) và thoát (Ctrl+X).

3. Kích hoạt và khởi động lại Nginx
Bash

sudo ln -s /etc/nginx/sites-available/ez-downloader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
4. Cài SSL miễn phí (HTTPS)
Bash

sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
🤖 PHẦN 5: TỰ ĐỘNG HÓA & BẢO TRÌ (AUTO MAINTENANCE)
Đây là bước quan trọng nhất để web không bị chết sau vài tuần. YouTube thường xuyên đổi thuật toán, nên yt-dlp cần được cập nhật hàng ngày.

Cài đặt Cronjob
Gõ lệnh:

Bash

crontab -e
Thêm dòng này vào cuối file (Tự động cập nhật lúc 4:00 sáng mỗi ngày):

Bash

0 4 * * * sudo /usr/local/bin/yt-dlp -U && pm2 restart ez-downloader
🕹 PHẦN 6: CÁC LỆNH VẬN HÀNH THƯỜNG DÙNG
1. Xem nhật ký hoạt động (Logs)
Nếu web bị lỗi, chạy lệnh này để xem nguyên nhân:

Bash

pm2 logs ez-downloader
2. Khởi động lại Server Node.js
Bash

pm2 restart ez-downloader
3. Cập nhật Code mới
Khi bạn sửa code ở máy local và đẩy lên Git, hãy vào VPS chạy:

Bash

cd /var/www/ez-downloader
git pull
npm install  # Nếu có cài thêm thư viện mới
pm2 restart ez-downloader
4. Kiểm tra tài nguyên VPS
Xem CPU và RAM có bị quá tải không:

Bash

pm2 monit
# Hoặc
htop
⚠️ CÁC LỖI THƯỜNG GẶP (TROUBLESHOOTING)
Lỗi 502 Bad Gateway:

Node.js chưa chạy. Kiểm tra bằng pm2 status.

Cổng 3000 bị lỗi. Thử chạy node server.js trực tiếp xem có lỗi code không.

Tải video bị ngắt giữa chừng:

Do Nginx timeout. Hãy chắc chắn đã thêm dòng proxy_read_timeout 600s; vào cấu hình Nginx.

Lỗi "Signatures" hoặc tốc độ rùa bò:

yt-dlp đã cũ. Chạy lệnh: sudo yt-dlp -U.

Lỗi 403 Forbidden khi tải:

IP VPS bị YouTube chặn. Giải pháp: Mua Proxy IPv6 hoặc đổi IP VPS mới.