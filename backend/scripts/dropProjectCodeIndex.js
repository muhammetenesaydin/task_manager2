const mongoose = require('mongoose');

// MongoDB bağlantı URI'si
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://enes123:enes123@taskmanager.rndak4n.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager';

// MongoDB'ye bağlan
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB bağlantısı başarılı');
    
    // projects koleksiyonundaki projectCode indeksini sil
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      // Test ve projects koleksiyonlarını kontrol et
      const projectsCollection = collections.find(c => c.name === 'projects');
      
      if (projectsCollection) {
        console.log('Projects koleksiyonu bulundu, indeksler kontrol ediliyor...');
        
        const indexes = await db.collection('projects').indexes();
        console.log('Mevcut indeksler:', indexes);
        
        const projectCodeIndex = indexes.find(idx => idx.name === 'projectCode_1');
        
        if (projectCodeIndex) {
          console.log('projectCode_1 indeksi bulundu, siliniyor...');
          await db.collection('projects').dropIndex('projectCode_1');
          console.log('projectCode_1 indeksi başarıyla silindi!');
        } else {
          console.log('projectCode_1 indeksi bulunamadı');
        }
      } else {
        console.log('Projects koleksiyonu bulunamadı');
      }
    } catch (error) {
      console.error('Indeks silme hatası:', error);
    }
    
    console.log('İşlem tamamlandı, bağlantı kapatılıyor...');
    mongoose.connection.close();
  })
  .catch(error => {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }); 