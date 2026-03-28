import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const KYCFlow = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    idNumber: '',
    phone: '',
    selfie: null,
    kraPin: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      selfie: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.idNumber || !formData.phone) {
        toast.error('Please fill all fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.selfie) {
        toast.error('Please upload a selfie');
        return;
      }
      setStep(3);
    } else {
      toast.loading('Verifying KYC...', { id: 'kyc' });
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('KYC completed successfully!', { id: 'kyc' });
        navigate('/borrower');
      } catch (error) {
        toast.error('KYC verification failed', { id: 'kyc' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your KYC</h2>
          
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-24 h-1 mx-2 ${
                      step > s ? 'bg-primary-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Identity</span>
              <span className="text-sm text-gray-600">Verification</span>
              <span className="text-sm text-gray-600">Additional</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your ID number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="07XX XXX XXX"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Selfie
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-sm text-gray-500 mt-2">Take a clear photo of your face</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KRA PIN (Optional)
                  </label>
                  <input
                    type="text"
                    name="kraPin"
                    value={formData.kraPin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter KRA PIN"
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
              >
                {step === 3 ? 'Submit KYC' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KYCFlow;