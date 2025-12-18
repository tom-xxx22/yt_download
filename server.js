const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

app.use(express.static('public'));

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
        
        const ytDlp = spawn('yt-dlp', [
            '-f', 'bestaudio', 
            '-o', '-', 
            '--no-playlist',
            url
        ]);

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

        ytDlp.stdout.pipe(ffmpeg.stdin);
        ffmpeg.stdout.pipe(res);

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
