import React from 'react';

const VerifyEmail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Email Verification</h1>
        <p className="text-gray-600 text-center">
          Please check your email for a verification link to activate your account.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
