import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Image,
  AlertTriangle,
  X,
  Loader,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { chatAPI, analysisAPI, reportAPI } from '../services/api';
import ImageAnalysisOverlay from '../components/Chat/ImageAnalysisOverlay';
import './Chat.css';

const Chat = () => {
  const { consultationId: initialConsultationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [consultationId, setConsultationId] = useState(initialConsultationId);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(!initialConsultationId);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    if (initialConsultationId) {
      loadChatHistory();
    } else {
      startNewSession();
    }
  }, [initialConsultationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewSession = async () => {
    setStarting(true);
    try {
      const response = await chatAPI.startSession();
      const { sessionId, consultationId: newId, message } = response.data.data;
      
      setConsultationId(newId);
      setMessages([
        {
          role: 'assistant',
          content: message,
          timestamp: new Date(),
        },
      ]);
      navigate(`/chat/${newId}`, { replace: true });
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setStarting(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory(initialConsultationId);
      const { messages: history, status } = response.data.data;
      setMessages(history);
      setSessionEnded(status === 'completed');
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading || sessionEnded) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await chatAPI.sendMessage(consultationId, userMessage);
      const { message: aiResponse } = response.data.data;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    setUploadedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!uploadedImage || loading) return;

    setLoading(true);

    // Add image message
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: '[Image uploaded for analysis]',
        timestamp: new Date(),
        imageUrl: imagePreview,
      },
    ]);

    try {
      const response = await analysisAPI.uploadImage(
        consultationId,
        uploadedImage,
        '' // symptoms will be extracted from conversation
      );

      const { analysis, message } = response.data.data;
      setImageAnalysis(analysis);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: message,
          timestamp: new Date(),
        },
      ]);

      // Clear image
      setUploadedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to analyze image:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not analyze the image. Please try again.',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cancelImageUpload = () => {
    setUploadedImage(null);
    setImagePreview(null);
    fileInputRef.current.value = '';
  };

  const endSessionAndAnalyze = async () => {
    if (loading || sessionEnded) return;

    setLoading(true);

    try {
      const response = await analysisAPI.getFullAnalysis(consultationId);
      const { analysis, alert } = response.data.data;

      setAnalysisResult(analysis);
      setShowAnalysis(true);
      setSessionEnded(true);

      // Add final analysis message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: formatAnalysisMessage(analysis, alert),
          timestamp: new Date(),
          isAnalysis: true,
        },
      ]);
    } catch (error) {
      console.error('Failed to get analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysisMessage = (analysis, alert) => {
    let message = '## Analysis Complete\n\n';

    if (alert) {
      message += `**${alert.message}**\n\n`;
    }

    message += `**Risk Level:** ${analysis.riskLevel.toUpperCase()}\n`;
    message += `**Urgency Score:** ${analysis.urgencyScore}/100\n`;
    message += `**Confidence:** ${analysis.confidenceScore}%\n\n`;

    if (analysis.detectedConditions?.length > 0) {
      message += '**Possible Conditions:**\n';
      analysis.detectedConditions.forEach((c) => {
        message += `- ${c}\n`;
      });
      message += '\n';
    }

    if (analysis.recommendations?.length > 0) {
      message += '**Recommendations:**\n';
      analysis.recommendations.forEach((r) => {
        message += `- ${r}\n`;
      });
    }

    return message;
  };

  const generateReport = async () => {
    try {
      await reportAPI.generate(consultationId, {
        includeImages: true,
        includeTimeline: true,
        includeRecommendations: true,
      });
      alert('Report generated successfully! View it in the Reports section.');
      navigate('/reports');
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  if (starting) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Starting your consultation session...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <h1>AI Health Consultation</h1>
          <span className="session-id">Session: {consultationId?.slice(-8)}</span>
        </div>
        <div className="chat-header-actions">
          {!sessionEnded && (
            <button
              className="btn btn-primary"
              onClick={endSessionAndAnalyze}
              disabled={loading || messages.length < 3}
            >
              <CheckCircle size={18} />
              Complete & Analyze
            </button>
          )}
          {sessionEnded && (
            <button className="btn btn-secondary" onClick={generateReport}>
              <FileText size={18} />
              Generate Report
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role} ${message.isError ? 'error' : ''} ${
              message.isAnalysis ? 'analysis' : ''
            }`}
          >
            {message.imageUrl && (
              <div className="message-image">
                <img src={message.imageUrl} alt="Uploaded" />
              </div>
            )}
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <span className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button className="remove-image" onClick={cancelImageUpload}>
              <X size={16} />
            </button>
          </div>
          <button
            className="btn btn-primary upload-btn"
            onClick={uploadImage}
            disabled={loading}
          >
            {loading ? <Loader size={18} className="spin" /> : <Send size={18} />}
            Analyze Image
          </button>
        </div>
      )}

      {!sessionEnded && (
        <form className="chat-input-form" onSubmit={sendMessage}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="image-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Image size={20} />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Describe your symptoms..."
            disabled={loading}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!inputMessage.trim() || loading}
          >
            {loading ? <Loader size={20} className="spin" /> : <Send size={20} />}
          </button>
        </form>
      )}

      {sessionEnded && (
        <div className="session-ended-notice">
          <AlertTriangle size={18} />
          <span>
            This consultation session has ended. View the analysis above or generate a
            report.
          </span>
          <button className="btn btn-outline" onClick={() => navigate('/chat')}>
            Start New Consultation
          </button>
        </div>
      )}

      {showAnalysis && imageAnalysis && (
        <ImageAnalysisOverlay
          analysis={imageAnalysis}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  );
};

export default Chat;
