import React, { useState, useRef, useEffect } from 'react';
import aiService from '../../services/aiService';
import './VoiceReview.css';

const VoiceReview = ({ onReviewComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setTranscript('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupAudioAnalyzer(stream);
      
      await aiService.startVoiceRecording(
        (text) => setTranscript(text),
        (error) => {
          console.error('Voice recognition error:', error);
          setIsRecording(false);
        }
      );
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    aiService.stopVoiceRecording();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const setupAudioAnalyzer = (stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
  };

  const processReview = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const sentiment = await aiService.analyzeReviewSentiment(transcript);
      
      const review = {
        text: transcript,
        type: 'voice',
        sentiment: sentiment.sentiment,
        rating: sentiment.score,
        keywords: sentiment.keywords,
        timestamp: new Date().toISOString()
      };
      
      onReviewComplete(review);
    } catch (error) {
      console.error('Failed to process review:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="voice-review">
      <div className="voice-header">
        <h3>🎤 Голосовий відгук</h3>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <div className="recording-area">
        {!isRecording ? (
          <button className="record-btn" onClick={startRecording}>
            <div className="mic-icon">🎤</div>
            <span>Натисніть для запису</span>
          </button>
        ) : (
          <div className="recording-active">
            <div className="audio-visualizer">
              <div 
                className="audio-bar" 
                style={{ height: `${Math.max(20, audioLevel * 100)}%` }}
              />
              <div 
                className="audio-bar" 
                style={{ height: `${Math.max(15, audioLevel * 80)}%` }}
              />
              <div 
                className="audio-bar" 
                style={{ height: `${Math.max(25, audioLevel * 120)}%` }}
              />
              <div 
                className="audio-bar" 
                style={{ height: `${Math.max(18, audioLevel * 90)}%` }}
              />
            </div>
            <p>Говоріть зараз...</p>
            <button className="stop-btn" onClick={stopRecording}>
              Зупинити запис
            </button>
          </div>
        )}
      </div>

      {transcript && (
        <div className="transcript-area">
          <h4>Розпізнаний текст:</h4>
          <div className="transcript-text">{transcript}</div>
          
          <div className="review-actions">
            <button 
              className="process-btn" 
              onClick={processReview}
              disabled={isProcessing}
            >
              {isProcessing ? 'Обробка...' : 'Створити відгук'}
            </button>
            <button className="retry-btn" onClick={() => setTranscript('')}>
              Записати знову
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceReview;