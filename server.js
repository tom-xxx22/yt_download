// const express = require('express');
// const { spawn } = require('child_process');
// const app = express();

// app.get('/download', (req, res) => {
//     const videoURL = req.query.url;
//     if (!videoURL) return res.status(400).send('Thiếu URL');

//     console.log('--- Đang xử lý yêu cầu mới ---');
//     console.log('URL:', videoURL);

//     // 1. Thiết lập Header để trình duyệt hiểu là file tải về
//     // Lưu ý: Tên file có thể lấy động từ yt-dlp, nhưng đây là bản đơn giản nhất
//     res.header('Content-Disposition', 'attachment; filename="video.mp4"');
//     res.header('Content-Type', 'video/mp4');

//     // 2. Gọi yt-dlp trực tiếp từ hệ thống
//     // Tham số '-o -' là bí mật để đẩy dữ liệu ra stdout (luồng xuất chuẩn)
//     const process = spawn('yt-dlp', [
//         '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
//         '--no-playlist',
//         '-o', '-', 
//         videoURL
//     ]);

//     // 3. Kết nối luồng dữ liệu (Piping)
//     // Dữ liệu tải từ YouTube chảy thẳng qua server và tới máy bạn
//     process.stdout.pipe(res);

//     // 4. Quản lý lỗi
//     process.stderr.on('data', (data) => {
//         // Ghi log các tiến trình để bạn dễ debug
//         console.log(`yt-dlp log: ${data}`);
//     });

//     process.on('close', (code) => {
//         if (code !== 0) {
//             console.error(`Tiến trình kết thúc với lỗi mã: ${code}`);
//         } else {
//             console.log('Tải xuống hoàn tất thành công!');
//         }
//     });

//     // Nếu người dùng tắt trình duyệt/ngắt tải, hãy đóng tiến trình yt-dlp để đỡ tốn tài nguyên
//     req.on('close', () => {
//         process.kill();
//     });
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server đang chạy tại http://localhost:${PORT}`);
//     console.log(`Thử tải bằng link: http://localhost:${PORT}/download?url=YOUR_LINK`);
// });



// const express = require('express');
// const { spawn } = require('child_process');
// const path = require('path'); // Thêm cái này
// const app = express();

// // Phục vụ các file trong thư mục 'public'
// app.use(express.static('public'));

// app.get('/download', (req, res) => {
//     const videoURL = req.query.url;
//     if (!videoURL) return res.status(400).send('Thiếu URL');

//     // Thiết lập tên file động (có thể dùng ID video để không bị trùng)
//     res.header('Content-Disposition', `attachment; filename="video_${Date.now()}.mp4"`);
//     res.header('Content-Type', 'video/mp4');

//     const process = spawn('yt-dlp', [
//         '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
//         '--no-playlist',
//         '-o', '-', 
//         videoURL
//     ]);

//     process.stdout.pipe(res);

//     process.on('close', (code) => {
//         console.log(`Tiến trình hoàn tất: ${code}`);
//     });

//     req.on('close', () => {
//         process.kill();
//     });
// });

// app.listen(3000, () => console.log('Hệ thống đang chạy tại http://localhost:3000'));



const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

app.use(express.static('public'));

// app.get('/download', (req, res) => {
//     const videoURL = req.query.url;
//     const formatSelection = req.query.format || 'mp4-720'; // Mặc định là 720p
    
//     if (!videoURL) return res.status(400).send('Thiếu URL');

//     let ytdlpArgs = ['--no-playlist', '-o', '-', videoURL];
//     let fileName = `ez_download_${Date.now()}`;
//     let contentType = 'video/mp4';

//     // Cấu hình tham số dựa trên lựa chọn của người dùng
//     // switch (formatSelection) {
//     //     case 'mp3-320':
//     //         ytdlpArgs.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
//     //         fileName += '.mp3';
//     //         contentType = 'audio/mpeg';
//     //         break;
//     //     case 'mp3-128':
//     //         ytdlpArgs.push('-x', '--audio-format', 'mp3', '--audio-quality', '128K');
//     //         fileName += '.mp3';
//     //         contentType = 'audio/mpeg';
//     //         break;
//     //     case 'mp4-1080':
//     //         // Chọn video <= 1080p + audio tốt nhất
//     //         ytdlpArgs.push('-f', 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best');
//     //         fileName += '.mp4';
//     //         break;
//     //     case 'mp4-720':
//     //     default:
//     //         ytdlpArgs.push('-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best');
//     //         fileName += '.mp4';
//     //         break;
//     // }

//     switch (formatSelection) {
//         case 'mp3-320':
//             // -x: Tách nhạc, --audio-format: Định dạng, --audio-quality 0: Tương đương 320k
//             ytdlpArgs.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
//             fileName += '.mp3';
//             contentType = 'audio/mpeg';
//             break;
//         case 'mp3-128':
//             ytdlpArgs.push('-x', '--audio-format', 'mp3', '--audio-quality', '128K');
//             fileName += '.mp3';
//             contentType = 'audio/mpeg';
//             break;
//         case 'mp4-1080':
//             // Bí mật ở đây: Thêm --recode-video mp4 để FFmpeg ép về chuẩn H.264 tương thích cao
//             ytdlpArgs.push('-f', 'bestvideo[height<=1080]+bestaudio/best[height<=1080]', '--recode-video', 'mp4');
//             fileName += '.mp4';
//             break;
//         case 'mp4-720':
//         default:
//             ytdlpArgs.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]', '--recode-video', 'mp4');
//             fileName += '.mp4';
//             break;
//     }

//     res.header('Content-Disposition', `attachment; filename="${fileName}"`);
//     res.header('Content-Type', contentType);

//     const downloader = spawn('yt-dlp', ytdlpArgs);

//     downloader.stdout.pipe(res);

//     downloader.stderr.on('data', (data) => {
//         console.log(`yt-dlp: ${data}`);
//     });

//     downloader.on('close', (code) => {
//         console.log(`Tiến trình hoàn tất với mã: ${code}`);
//     });

//     req.on('close', () => {
//         downloader.kill();
//     });
// });

// app.listen(3000, () => console.log('Hệ thống đang chạy tại http://localhost:3000'));

// app.get('/download', (req, res) => {
//     const { url, format } = req.query;
//     if (!url) return res.status(400).send('Thiếu URL');

//     let ytdlpArgs = ['--no-playlist', '-o', '-', url];
//     let fileName = `EZ_Download_${Date.now()}`;
//     let contentType = 'video/mp4';

//     switch (format) {
//         case 'mp3-320':
//             // Bí mật: Thêm --audio-quality 0 và ép bitrate cố định qua ffmpeg-args
//             ytdlpArgs.push(
//                 '-x', 
//                 '--audio-format', 'mp3', 
//                 '--audio-quality', '10',
//                 '--ffmpeg-location', '/usr/bin/ffmpeg', // Đảm bảo đường dẫn đúng trên WSL
//                 '--postprocessor-args', 'ffmpeg:-b:a 320k' 
//             );
//             fileName += '.mp3';
//             contentType = 'audio/mpeg';
//             break;
//         case 'mp3-128':
//             ytdlpArgs.push(
//                 '-x', 
//                 '--audio-format', 'mp3', 
//                 '--audio-quality', '5', // Chất lượng trung bình
//                 '--postprocessor-args', 'ffmpeg:-b:a 128k'
//             );
//             fileName += '.mp3';
//             contentType = 'audio/mpeg';
//             break;
//         case 'mp4-1080':
//             // BÍ QUYẾT: -S "res:1080,vcodec:h264" ép YouTube nhả file H.264 cực kỳ tương thích
//             ytdlpArgs.push('-f', 'bestvideo[height<=1080][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=1080][vcodec^=avc1]/best');
//             fileName += '.mp4';
//             break;
//         case 'mp4-720':
//         default:
//             ytdlpArgs.push('-f', 'bestvideo[height<=720][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=720][vcodec^=avc1]/best');
//             fileName += '.mp4';
//             break;
//     }

//     res.header('Content-Disposition', `attachment; filename="${fileName}"`);
//     res.header('Content-Type', contentType);

//     const downloader = spawn('yt-dlp', ytdlpArgs);

//     // QUAN TRỌNG: Pipe stdout trực tiếp
//     downloader.stdout.pipe(res);

//     downloader.stderr.on('data', (data) => {
//         const log = data.toString();
//         // Nếu thấy log có từ 'ffmpeg', nghĩa là server đang thực hiện nén/trộn đúng cách
//         if (log.includes('ffmpeg')) console.log('FFmpeg đang làm việc...');
//     });

//     req.on('close', () => downloader.kill());
// });

// app.listen(3000, () => console.log('Hệ thống đang chạy tại http://localhost:3000'));

function isSafeUrl(inputUrl) {
    try {
        const urlObj = new URL(inputUrl);
        // Chỉ cho phép giao thức http và https
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') return false;
        
        // Danh sách domain cho phép
        const allowList = [
            'youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com',
            'tiktok.com', 'www.tiktok.com', 'vm.tiktok.com',
            'facebook.com', 'www.facebook.com', 'fb.watch',
            'coccoc.com' 
        ];
        
        // Kiểm tra xem hostname có nằm trong whitelist không
        return allowList.some(domain => urlObj.hostname.endsWith(domain));
    } catch (err) {
        return false; // Nếu URL lỗi format -> Chặn luôn
    }
}

app.get('/download', (req, res) => {
    const { url, format } = req.query;
    // if (!url) return res.status(400).send('Thiếu URL');

    if (!url || !isSafeUrl(url)) {
        return res.status(403).send('URL không hợp lệ hoặc không được hỗ trợ vì lý do bảo mật!');
    }

    let fileName = `EZ_Music_${Date.now()}`;
    
    // 1. Cấu hình cho MP4 (Giữ nguyên vì bạn bảo đã ổn)
    if (format.startsWith('mp4')) {
        let ytdlpArgs = ['--no-playlist', '-o', '-', url];
        if (format === 'mp4-1080') {
            ytdlpArgs.push('-f', 'bestvideo[height<=1080][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=1080][vcodec^=avc1]/best');
        } else {
            ytdlpArgs.push('-f', 'bestvideo[height<=720][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=720][vcodec^=avc1]/best');
        }

        res.header('Content-Disposition', `attachment; filename="${fileName}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        const downloader = spawn('yt-dlp', ytdlpArgs);
        downloader.stdout.pipe(res);
        downloader.stderr.on('data', d => console.log(`Video Log: ${d}`));
        
        req.on('close', () => downloader.kill());

    } 
    // 2. Cấu hình lại hoàn toàn cho MP3 (Fix lỗi iPhone/Drive)
    else if (format.startsWith('mp3')) {
        res.header('Content-Disposition', `attachment; filename="${fileName}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');

        // BƯỚC 1: Dùng yt-dlp chỉ để lấy luồng audio tốt nhất (thường là webm/opus)
        const ytDlp = spawn('yt-dlp', [
            '-f', 'bestaudio', 
            '-o', '-', 
            '--no-playlist',
            url
        ]);

        // BƯỚC 2: Dùng FFmpeg nhận luồng đó và convert Real-time sang MP3 chuẩn
        // iPhone yêu cầu: Codec libmp3lame + Tần số 44100Hz + Stereo
        const ffmpegArgs = [
            '-i', 'pipe:0',           // Nhận dữ liệu từ yt-dlp
            '-acodec', 'libmp3lame',  // Codec MP3 chuẩn quốc tế
            '-ab', format === 'mp3-320' ? '320k' : '128k', // Bitrate
            '-ar', '44100',           // Sample rate chuẩn CD (iPhone rất cần cái này)
            '-ac', '2',               // 2 kênh (Stereo)
            '-f', 'mp3',              // Ép định dạng thùng chứa là MP3
            'pipe:1'                  // Xuất ra output
        ];

        const ffmpeg = spawn('ffmpeg', ffmpegArgs);

        // NỐI ỐNG: yt-dlp chảy vào ffmpeg -> ffmpeg chảy về người dùng
        ytDlp.stdout.pipe(ffmpeg.stdin);
        ffmpeg.stdout.pipe(res);

        // Xử lý lỗi
        ffmpeg.stderr.on('data', (data) => {
            // Log này giúp bạn biết ffmpeg có đang chạy không
            if(data.toString().includes('size=')) console.log('FFmpeg đang transcode MP3...');
        });

        // Dọn dẹp tiến trình khi người dùng tắt tab
        req.on('close', () => {
            ytDlp.kill();
            ffmpeg.kill();
        });
    }
});



const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`(Hoặc truy cập qua IP LAN của máy tính)`);
});