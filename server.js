const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(__dirname)); // index.html'i sunmak için

// 1. ÖRNEK VERİ DİZİSİ (Ay ve Yıl burada ayrı ayrı tutuluyor)
let evrakListesi = [
    { ay: "Temmuz", yil: "2026", no: "24691", listeAdi: "Aksaray Çalışma Ve İş Kurumu İl Müdürlüğü", durum: "Süreç Devam Ediyor" }
];

// 2. VERİLERİ ÖN YÜZE (INDEX.HTML) GÖNDEREN KISA API KODU
app.get('/api/veriler', (req, res) => {
    res.json(evrakListesi); 
});

// 3. YENİ EVRAK EKLEME API KODU (Ön yüzden gelen ayrı ay ve yılı kaydeder)
app.post('/api/ekle', (req, res) => {
    const { ay, yil, no, listeAdi, durum } = req.body;
    evrakListesi.push({ ay, yil, no, listeAdi, durum });
    res.json({ success: true, mesaj: "Kayıt başarıyla eklendi!" });
});

// Sunucuyu başlatma portu
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));
