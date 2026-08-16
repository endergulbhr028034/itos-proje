const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Render gibi bulut sunucularda en kararlı çalışan geçici klasör (/tmp)
const uploadDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadDir)){ 
    fs.mkdirSync(uploadDir, { recursive: true }); 
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadDir); },
    filename: function (req, file, cb) {
        const listeNo = req.body.listeNo || 'genel';
        const duzgunOrijinalAd = Buffer.from(file.originalname, 'binary').toString('utf8');
        cb(null, listeNo + '-' + Date.now() + '-' + duzgunOrijinalAd);
    }
});
const upload = multer({ storage: storage });

app.use(express.static(__dirname));

app.post('/api/upload-single', upload.single('document'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi.' });
    const duzgunAd = Buffer.from(req.file.originalname, 'binary').toString('utf8');
    res.json({ 
        message: 'Başarılı', 
        kayitliAd: req.file.filename,
        orijinalAd: duzgunAd
    });
});

app.get('/api/download', (req, res) => {
    const dosyaAdi = decodeURIComponent(req.query.file);
    const dosyaYolu = path.join(uploadDir, dosyaAdi);
    
    if (fs.existsSync(dosyaYolu)) {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.download(dosyaYolu, dosyaAdi.split('-').slice(2).join('-'));
    } else {
        res.status(404).send('Hata: Dosya bulunamadı.');
    }
});

app.listen(PORT, () => { console.log(`Sunucu aktif: ${PORT}`); });
