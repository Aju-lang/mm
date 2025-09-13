import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, title = "Festival Starts In" }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-sm text-gray-600 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );

  return (
    <div className="card text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
      
      {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold text-lg">🎉 Festival is Live! 🎉</p>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
