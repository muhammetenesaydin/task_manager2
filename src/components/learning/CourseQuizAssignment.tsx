import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  TextField,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  Chip,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  requirements: string[];
}

interface CourseQuizAssignmentProps {
  type: 'quiz' | 'assignment';
  title: string;
  description: string;
  questions?: Question[];
  assignment?: Assignment;
  onComplete: (passed: boolean, answers?: Record<string, string>, submission?: string) => void;
}

const CourseQuizAssignment: React.FC<CourseQuizAssignmentProps> = ({
  type,
  title,
  description,
  questions = [],
  assignment,
  onComplete
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submission, setSubmission] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score?: number;
    total?: number;
    feedback?: string;
  } | null>(null);

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubmission(event.target.value);
  };

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (type === 'quiz') {
        // Sınav değerlendirmesi
        let correctAnswers = 0;
        questions.forEach(question => {
          if (answers[question.id] === question.correctOptionId) {
            correctAnswers++;
          }
        });
        
        const percentageCorrect = (correctAnswers / questions.length) * 100;
        const passed = percentageCorrect >= 70; // 70% başarı eşiği
        
        setResult({
          passed,
          score: correctAnswers,
          total: questions.length,
          feedback: passed 
            ? 'Tebrikler! Sınavı başarıyla tamamladınız.' 
            : 'Üzgünüz, sınavı geçmek için gereken puanı alamadınız.'
        });
        
        onComplete(passed, answers);
      } else if (type === 'assignment') {
        // Görev değerlendirmesi (otomatik olarak kabul edilir)
        const passed = submission.length > 50; // En az 50 karakter
        
        setResult({
          passed,
          feedback: passed 
            ? 'Göreviniz kabul edildi ve başarıyla tamamlandı.' 
            : 'Göreviniz çok kısa. Lütfen daha detaylı bir yanıt verin.'
        });
        
        if (passed) {
          onComplete(passed, undefined, submission);
        }
      }
      
      setIsSubmitting(false);
    }, 2000); // API çağrısını simüle etmek için 2 saniye bekleme
  };

  const isQuestionAnswered = (questionId: string) => {
    return !!answers[questionId];
  };

  const getStepContent = (step: number) => {
    if (type === 'quiz' && questions && step < questions.length) {
      const question = questions[step];
      return (
        <Box>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
              {question.text}
            </FormLabel>
            <RadioGroup 
              value={answers[question.id] || ''} 
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              {question.options.map(option => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={option.text}
                  sx={{ mb: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      );
    } else if (type === 'assignment' && assignment) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            {assignment.title}
          </Typography>
          <Typography variant="body2" paragraph>
            {assignment.description}
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            İstekler:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {assignment.requirements.map((req, index) => (
              <Typography component="li" key={index} variant="body2" sx={{ mb: 1 }}>
                {req}
              </Typography>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TimerIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="body2" color="warning.main">
              Son teslim tarihi: {assignment.deadline}
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Görev Yanıtınız"
            placeholder="Görev yanıtınızı buraya yazın..."
            variant="outlined"
            value={submission}
            onChange={handleSubmissionChange}
          />
        </Box>
      );
    } else {
      return null;
    }
  };

  const allQuestionsAnswered = type === 'quiz' 
    ? questions.every(q => isQuestionAnswered(q.id))
    : submission.length > 0;

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {type === 'quiz' ? (
          <QuizIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        ) : (
          <AssignmentIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        )}
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {result ? (
        <Box sx={{ mt: 3 }}>
          <Alert 
            severity={result.passed ? "success" : "error"}
            variant="filled"
            sx={{ mb: 3 }}
          >
            <AlertTitle>
              {result.passed ? "Başarılı" : "Başarısız"}
            </AlertTitle>
            {result.feedback}
          </Alert>
          
          {result.score !== undefined && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                my: 4
              }}
            >
              <Box 
                sx={{ 
                  position: 'relative',
                  display: 'inline-flex',
                  mb: 2
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={(result.score / result.total!) * 100}
                  size={120}
                  thickness={5}
                  color={result.passed ? "success" : "error"}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {result.score}/{result.total}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" align="center" color={result.passed ? "success.main" : "error.main"}>
                {result.passed ? "Tebrikler!" : "Yeniden Deneyin"}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              color={result.passed ? "success" : "primary"}
              onClick={() => onComplete(result.passed, answers, submission)}
            >
              {result.passed ? "Tamamlandı" : "Tekrar Dene"}
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          {type === 'quiz' && (
            <Stepper activeStep={activeStep} orientation="vertical">
              {questions.map((question, index) => (
                <Step key={question.id}>
                  <StepLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>Soru {index + 1}</Typography>
                      {isQuestionAnswered(question.id) && (
                        <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </StepLabel>
                  <StepContent>
                    {getStepContent(index)}
                    <Box sx={{ mb: 2, mt: 3 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={index === questions.length - 1 ? handleSubmit : handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={!isQuestionAnswered(question.id) || isSubmitting}
                        >
                          {index === questions.length - 1 ? 'Bitir' : 'Devam'}
                        </Button>
                        <Button
                          disabled={index === 0 || isSubmitting}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Geri
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          )}
          
          {type === 'assignment' && (
            <>
              {getStepContent(0)}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered || isSubmitting}
                  endIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Paper>
  );
};

export default CourseQuizAssignment; 