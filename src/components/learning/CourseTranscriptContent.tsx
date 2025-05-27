import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  IconButton,
  Stack
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import NotesIcon from '@mui/icons-material/Notes';
import ForumIcon from '@mui/icons-material/Forum';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SendIcon from '@mui/icons-material/Send';

interface Transcript {
  time: string;
  text: string;
  current?: boolean;
}

interface CourseContent {
  title: string;
  description: string;
  transcript: Transcript[];
  resources: {
    title: string;
    type: string;
    url: string;
  }[];
  notes: string;
}

interface CourseTranscriptContentProps {
  content: CourseContent;
  onSaveNote: (note: string) => void;
}

const CourseTranscriptContent: React.FC<CourseTranscriptContentProps> = ({
  content,
  onSaveNote
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [note, setNote] = useState<string>(content.notes || '');
  const [bookmarkedLines, setBookmarkedLines] = useState<Record<string, boolean>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value);
  };

  const handleSaveNote = () => {
    onSaveNote(note);
  };

  const toggleBookmark = (time: string) => {
    setBookmarkedLines(prev => ({
      ...prev,
      [time]: !prev[time]
    }));
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="course content tabs"
        >
          <Tab icon={<ArticleIcon />} label="Transkript" />
          <Tab icon={<NotesIcon />} label="Notlar" />
          <Tab icon={<ForumIcon />} label="Sorular" />
        </Tabs>
      </Box>

      {/* Transkript İçeriği */}
      {activeTab === 0 && (
        <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {content.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {content.description}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <List sx={{ width: '100%' }}>
            {content.transcript.map((line, index) => (
              <ListItem
                key={index}
                alignItems="flex-start"
                sx={{
                  bgcolor: line.current ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ 
                          minWidth: 60,
                          mr: 2,
                          fontFamily: 'monospace'
                        }}
                      >
                        {line.time}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          flexGrow: 1,
                          fontWeight: line.current ? 600 : 400
                        }}
                      >
                        {line.text}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleBookmark(line.time)}
                        sx={{ ml: 1 }}
                      >
                        {bookmarkedLines[line.time] ? 
                          <BookmarkIcon fontSize="small" color="primary" /> : 
                          <BookmarkBorderIcon fontSize="small" />
                        }
                      </IconButton>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Kaynaklar
          </Typography>
          <List>
            {content.resources.map((resource, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemText
                  primary={resource.title}
                  secondary={resource.type}
                />
                <IconButton size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Notlar İçeriği */}
      {activeTab === 1 && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="subtitle1" gutterBottom>
            Notlarınız
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={16}
            value={note}
            onChange={handleNoteChange}
            placeholder="Bu dersle ilgili notlarınızı buraya yazabilirsiniz..."
            variant="outlined"
            sx={{ flexGrow: 1, mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ContentCopyIcon />}
              size="small"
            >
              Kopyala
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveNote}
              endIcon={<SendIcon />}
            >
              Kaydet
            </Button>
          </Box>
        </Box>
      )}

      {/* Sorular İçeriği */}
      {activeTab === 2 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Sorular ve Yorumlar
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Bu dersle ilgili sorularınızı ve yorumlarınızı buradan paylaşabilirsiniz.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Sorunuzu yazın..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            fullWidth
            endIcon={<SendIcon />}
          >
            Gönder
          </Button>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Henüz soru veya yorum bulunmuyor.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CourseTranscriptContent; 