import React, { useRef, useEffect } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';
import './ImageAnalysisOverlay.css';

const ImageAnalysisOverlay = ({ analysis, imageUrl, onClose }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageUrl && analysis?.affectedAreas?.length > 0) {
      drawOverlay();
    }
  }, [imageUrl, analysis]);

  const drawOverlay = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw affected areas
    analysis.affectedAreas.forEach((area, index) => {
      const x = (area.x / 100) * canvas.width;
      const y = (area.y / 100) * canvas.height;
      const width = (area.width / 100) * canvas.width;
      const height = (area.height / 100) * canvas.height;

      // Draw rectangle
      ctx.strokeStyle = getColorBySeverity(analysis.severity);
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = getColorBySeverity(analysis.severity);
      ctx.fillRect(x, y - 25, ctx.measureText(area.label).width + 20, 25);

      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(area.label, x + 10, y - 8);

      // Draw confidence
      const confidence = `${Math.round(area.confidence)}%`;
      ctx.fillStyle = getColorBySeverity(analysis.severity);
      ctx.fillRect(x + width - 50, y + height, 50, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(confidence, x + width - 45, y + height + 14);
    });
  };

  const getColorBySeverity = (severity) => {
    switch (severity) {
      case 'severe':
        return '#EF4444';
      case 'moderate':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const getSeverityIcon = () => {
    if (analysis.severity === 'severe') {
      return <AlertTriangle className="severity-icon severe" size={20} />;
    }
    return <Info className="severity-icon" size={20} />;
  };

  return (
    <div className="analysis-overlay">
      <div className="analysis-modal">
        <div className="analysis-header">
          <h2>Image Analysis Results</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="analysis-content">
          {imageUrl && (
            <div className="image-container">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Analysis"
                onLoad={drawOverlay}
              />
              <canvas ref={canvasRef} className="overlay-canvas" />
            </div>
          )}

          <div className="analysis-details">
            <div className="severity-badge" data-severity={analysis.severity}>
              {getSeverityIcon()}
              <span>{analysis.severity.toUpperCase()} Severity</span>
            </div>

            <div className="detail-section">
              <h3>Description</h3>
              <p>{analysis.description}</p>
            </div>

            {analysis.detectedAbnormalities?.length > 0 && (
              <div className="detail-section">
                <h3>Detected Abnormalities</h3>
                <ul>
                  {analysis.detectedAbnormalities.map((abnormality, index) => (
                    <li key={index}>{abnormality}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.possibleConditions?.length > 0 && (
              <div className="detail-section">
                <h3>Possible Conditions</h3>
                <div className="condition-tags">
                  {analysis.possibleConditions.map((condition, index) => (
                    <span key={index} className="condition-tag">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.recommendations?.length > 0 && (
              <div className="detail-section">
                <h3>Recommendations</h3>
                <ul className="recommendations-list">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="disclaimer">
              <AlertTriangle size={16} />
              <p>
                This analysis is for informational purposes only and should not
                replace professional medical advice. Please consult a healthcare
                provider for accurate diagnosis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysisOverlay;
