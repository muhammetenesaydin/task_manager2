import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';

interface CourseVideoPlayerProps {
  videoUrl: string;
  title: string;
  onComplete: () => void;
}

const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = ({ videoUrl, title, onComplete }) => {
  const [loading, setLoading] = useState(true);
  
  // YouTube videosu için ID çıkarma fonksiyonu
  const getYoutubeVideoId = (url: string): string => {
    // Örnek bir YouTube video ID'si (gerçek URL'den ID çıkarma eklenebilir)
    // Şu an için sabit bir ID kullanıyoruz, gerçek projede URL'den çıkarılmalı
    return url.includes('youtube.com') || url.includes('youtu.be') 
      ? url.split(/[\/=]/g).pop() || 'CxGSnA-RTsA' // URL'den ID çıkarma girişimi
      : 'CxGSnA-RTsA'; // Yeni varsayılan YouTube video ID'si
  };
  
  // Video tamamlandığında çağrılacak
  const handleVideoComplete = () => {
    onComplete();
  };
  
  // Video yüklendiğinde
  const handleVideoLoad = () => {
    setLoading(false);
    
    // YouTube API'yi dinlemek için message event listener ekle
    window.addEventListener('message', (event) => {
      if (event.data && event.data.info === 'onStateChange' && event.data.state === 0) {
        // Video tamamlandı (state 0)
        handleVideoComplete();
      }
    });
    
    // Component unmount olduğunda listener'ı temizle
    return () => {
      window.removeEventListener('message', () => {});
    };
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#000',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Video başlığı */}
      <Typography variant="h6" sx={{ p: 2, color: 'white', bgcolor: '#111' }}>
        {title}
      </Typography>
      
      {/* Video içeriği - YouTube Embed */}
      <Box
        sx={{
          width: '100%',
          height: 0,
          paddingTop: '56.25%', // 16:9 aspect ratio
          position: 'relative',
          bgcolor: '#111'
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoUrl)}?autoplay=1&controls=1&showinfo=1&rel=0&modestbranding=1&enablejsapi=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
          onLoad={handleVideoLoad}
        />
        
        {/* Video kontrolleri için overlay - Sadece loading durumunda göster */}
        {loading ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 2
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
};

export default CourseVideoPlayer; 