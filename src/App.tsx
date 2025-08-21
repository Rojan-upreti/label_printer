import React, { useState } from 'react';
import LabelForm from './components/LabelForm';
import LabelDisplay from './components/LabelDisplay';
import { PurchaseOrder, Label } from './types';
import { generateLabels, downloadLabelsAsPDF, printLabels } from './utils/labelGenerator';

const App: React.FC = () => {
  const [labels, setLabels] = useState<Label[]>([]);

  const handleGenerateLabels = (po: PurchaseOrder) => {
    const generatedLabels = generateLabels(po);
    setLabels(generatedLabels);
  };

  const handlePrint = () => {
    printLabels();
  };

  const handleDownload = async () => {
    try {
      await downloadLabelsAsPDF(labels);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Label Printer</h1>
        <p>Generate and print labels for your inventory items</p>
      </div>

      <LabelForm onSubmit={handleGenerateLabels} />
      
      <LabelDisplay 
        labels={labels} 
        onPrint={handlePrint} 
        onDownload={handleDownload} 
      />
    </div>
  );
};

export default App; 