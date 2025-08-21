import React from 'react';
import { Label } from '../types';

interface LabelDisplayProps {
  labels: Label[];
  onPrint: () => void;
  onDownload: () => void;
}

const LabelDisplay: React.FC<LabelDisplayProps> = ({ labels, onPrint, onDownload }) => {
  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="labels-container">
      <h2>Generated Labels ({labels.length} total)</h2>
      
      <div className="labels-grid">
        {labels.map((label) => (
          <div key={label.id} className="label">
            <div className="label-content">
              {/* From/To Section at Top - Same Line with Split Table */}
              <div className="label-section from-to-section">
                <div className="from-to-container">
                  <div className="from-to-item">
                    <div className="from-to-label">From:</div>
                    <div className="from-to-value">{label.fromLocation}</div>
                  </div>
                  <div className="from-to-divider">|</div>
                  <div className="from-to-item">
                    <div className="from-to-label">To:</div>
                    <div className="from-to-value">{label.toLocation}</div>
                  </div>
                </div>
              </div>

              {/* Main Information Section */}
              <div className="label-section">
                <div className="label-field">
                  <strong>PO:</strong>
                  <span>{label.customerPO}</span>
                </div>
                <div className="label-field">
                  <strong>UPC:</strong>
                  <span>{label.upc}</span>
                </div>
                <div className="label-field">
                  <strong>Description:</strong>
                  <span>{label.itemName}</span>
                </div>
                <div className="label-field">
                  <strong>SKU #:</strong>
                  <span>{label.sku}</span>
                </div>
                <div className="label-field">
                  <strong>TJX Style:</strong>
                  <span>{label.mfgStyle}</span>
                </div>
                <div className="label-field">
                  <strong>Case Pack:</strong>
                  <span>{label.casePack}</span>
                </div>
                <div className="label-field">
                  <strong>Country of Origin:</strong>
                  <span>{label.countryOfOrigin}</span>
                </div>
              </div>
            </div>

            {/* Carton Number at Bottom */}
            <div className="label-footer">
              <div className="carton-number">
                Carton {label.labelNumber} out of {label.totalLabels}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="print-actions">
        <button onClick={onPrint} className="btn btn-primary">
          Print Labels
        </button>
        <button onClick={onDownload} className="btn btn-success">
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default LabelDisplay; 