import React, { useRef, useState, useEffect } from 'react';

const OTPInput = ({ length = 8, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow only last character
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Combine for onComplete
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) {
      onComplete(combinedOtp);
    }

    // Move to next input if value entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);
    
    if (data.length === length) {
        onComplete(data);
    }
    
    // Focus last filled or next
    const lastIndex = Math.min(data.length, length - 1);
    inputRefs.current[lastIndex].focus();
  };

  return (
    <div className="flex justify-between gap-2 mt-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          ref={(el) => (inputRefs.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-11 h-11 border-2 border-gray-300 rounded-sm text-center text-lg font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
      ))}
    </div>
  );
};

export default OTPInput;
