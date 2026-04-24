import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Landmark } from 'lucide-react';
import Confetti from 'react-confetti';

const CongratulationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get land details from location state or use defaults
  const landDetails = location.state?.landDetails || {};
  const landTitle = landDetails.title || landDetails.name || 'Your Property';
  const landPrice = landDetails.price || '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.1}
      />

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Congratulations Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Congratulations! 🎉</h1>
          <p className="text-lg text-gray-600 mb-6">Your purchase was successful!</p>

          {/* Property Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center mb-3">
              <Landmark className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-gray-700">Property Details</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">{landTitle}</h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{landPrice.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>🏠 Ownership Transferred!</strong>
              <br />
              You are now the proud owner of this property. All legal documents have been
              processed and the title has been successfully transferred to your name.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/mylands')}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Landmark className="w-5 h-5 mr-2" />
              View My Properties
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-xs text-gray-500">
            <p>A confirmation email has been sent to your registered email address.</p>
            <p className="mt-1">
              Transaction ID: {location.state?.transactionId || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsPage;
