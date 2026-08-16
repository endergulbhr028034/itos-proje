const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Bulut sunucularda en kararlı çalışan geçici klasör
const uploadDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadDir)){ 
    fs.mkdirSync(uploadDir, { recursive: true }); 
}

function turkceKarakterTamir(str) {
    return Buffer.from(str, 'binary').toString('utf8');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadDir); },
    filename: function (req, file, cb) {
        const listeNo = req.body.listeNo || 'genel';
        const duzgunOrijinalAd = turkceKarakterTamir(file.originalname);
        cb(null, listeNo + '-' + Date.now() + '-' + duzgunOrijinalAd);
    }
});
const upload = multer({ storage: storage });

app.use(express.static(__dirname));

// ÖNYÜZDEN GELEN COKLU DOSYA ISTEKLERINI KUSURSUZ ALAN YENI ENTEGRASYON
app.post('/api/upload-single', upload.single('document'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi.' });
    const duzgunAd = turkceKarakterTamir(req.file.originalname);
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
