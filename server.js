const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

function turkceKarakterTamir(str) {
    return Buffer.from(str, 'binary').toString('utf8');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) {
        const listeNo = req.body.listeNo || 'genel';
        const duzgunOrijinalAd = turkceKarakterTamir(file.originalname);
        cb(null, listeNo + '-' + Date.now() + '-' + duzgunOrijinalAd);
    }
});
const upload = multer({ storage: storage });

app.use(express.static(__dirname));
if (!fs.existsSync('uploads')){ fs.mkdirSync('uploads'); }

app.post('/api/upload-single', upload.single('document'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi.' });
    const duzgunAd = turkceKarakterTamir(req.file.originalname);
    res.json({ 
        message: 'Başarılı', 
        kayitliAd: req.file.filename,
        orijinalAd: duzgunAd
    });
});

// YENİ VE GÜVENLİ DOSYA İNDİRME ROTASI (Sorgu Parametreli Yapı)
app.get('/api/download', (req, res) => {
    // Tarayıcıdan gelen şifreli ismi çözüyoruz (decodeURIComponent)
    const dosyaAdi = decodeURIComponent(req.query.file);
    const dosyaYolu = path.join(__dirname, 'uploads', dosyaAdi);
    
    if (fs.existsSync(dosyaYolu)) {
        // Tarayıcıya bunun indirilebilir gerçek bir dosya olduğunu söylüyoruz
        res.setHeader('Content-Type', 'application/octet-stream');
        res.download(dosyaYolu, dosyaAdi.split('-').slice(2).join('-')); // Başındaki sayıları silip orijinal adıyla indirir
    } else {
        res.status(404).send('Hata: Dosya sunucuda bulunamadı veya adı bozuk.');
    }
});

app.listen(PORT, () => { console.log(`Sunucu aktif: http://localhost:${PORT}`); });
