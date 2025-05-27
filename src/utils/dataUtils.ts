/**
 * MongoDB ile frontend arasındaki ID dönüşümlerini kolaylaştıran yardımcı fonksiyonlar
 */

/**
 * MongoDB verisini frontend için normalize eder.
 * _id alanını id alanına kopyalar ve tutarlı bir veri yapısı sağlar.
 */
export const normalizeMongoData = <T extends object>(data: any): T => {
  if (!data) return data;
  
  // Tek bir belge için normalizasyon
  if (typeof data === 'object' && !Array.isArray(data)) {
    const normalized = { ...data };
    
    // MongoDB'nin _id alanını frontend'in id alanına kopyala
    if (data._id && !data.id) {
      normalized.id = data._id;
    }
    
    return normalized as T;
  }
  
  // Belge dizisi için normalizasyon 
  if (Array.isArray(data)) {
    return data.map(item => normalizeMongoData(item)) as unknown as T;
  }
  
  return data;
};

/**
 * MongoDB ObjectId formatını kontrol eder
 */
export const isValidMongoId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // MongoDB ObjectId formatı: 24 karakterli hexadecimal string
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Bir ID değerini normalize eder (MongoDB _id veya frontend id)
 * @param item Bir nesne veya string ID
 * @return Normalize edilmiş string ID
 */
export const normalizeId = (item: any): string => {
  if (!item) return '';
  
  // Eğer string ise doğrudan döndür
  if (typeof item === 'string') {
    return item;
  }
  
  // Eğer nesne ise id veya _id alanlarından birini kullan
  if (typeof item === 'object') {
    const id = item.id || item._id || '';
    
    // Loglama ekle
    if (process.env.NODE_ENV !== 'production') {
      if (!id) {
        console.warn('normalizeId: ID bulunamadı', item);
      } else if (item.id && item._id && item.id !== item._id) {
        console.warn('normalizeId: id ve _id alanları farklı değerlere sahip', {
          id: item.id,
          _id: item._id
        });
      }
    }
    
    return id.toString();
  }
  
  // Diğer türdeki değerler için string dönüşümü yap
  return String(item);
}; 