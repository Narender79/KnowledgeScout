import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Upload, MessageSquare, CheckCircle } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: 'Upload Document',
      description: 'Drag and drop your document or click to browse files',
      icon: Upload,
      content: 'Upload a PDF, DOC, or TXT file to get started'
    },
    {
      title: 'AI Processing',
      description: 'Our AI extracts and analyzes the document content',
      icon: CheckCircle,
      content: 'Document is processed and text is extracted with high accuracy'
    },
    {
      title: 'Start Q&A Session',
      description: 'Ask questions about your document in natural language',
      icon: MessageSquare,
      content: 'Ask anything about the document content and get instant answers'
    }
  ];

  const handlePlay = () => {
    setIsPlaying(true);
    // Simulate demo progression
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= demoSteps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Knowledge Scout Demo</h2>
                <p className="text-neutral-600">See how Knowledge Scout transforms your documents</p>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Demo Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Demo Steps */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Demo Steps
                  </h3>
                  
                  {demoSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index === currentStep
                          ? 'border-primary-500 bg-primary-50'
                          : index < currentStep
                          ? 'border-green-500 bg-green-50'
                          : 'border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === currentStep
                            ? 'bg-primary-500 text-white'
                            : index < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-neutral-300 text-neutral-600'
                        }`}>
                          {index < currentStep ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{step.title}</h4>
                          <p className="text-sm text-neutral-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Demo Preview */}
                <div className="bg-neutral-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Live Preview
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={isPlaying ? handlePause : handlePlay}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleReset}
                        className="p-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-neutral-200 p-6 min-h-[300px]">
                    <div className="text-center">
                      {React.createElement(demoSteps[currentStep].icon, {
                        className: "w-16 h-16 text-primary-600 mx-auto mb-4"
                      })}
                      <h4 className="text-xl font-semibold text-neutral-900 mb-2">
                        {demoSteps[currentStep].title}
                      </h4>
                      <p className="text-neutral-600 mb-6">
                        {demoSteps[currentStep].content}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                        />
                      </div>
                      
                      <div className="text-sm text-neutral-500">
                        Step {currentStep + 1} of {demoSteps.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-2">
                  {demoSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-primary-600'
                          : index < currentStep
                          ? 'bg-green-500'
                          : 'bg-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={currentStep === demoSteps.length - 1}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Ready to try it yourself?
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Close Demo
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      // Navigate to upload page
                      window.location.href = '/upload';
                    }}
                    className="btn-primary"
                  >
                    Try Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoModal;
