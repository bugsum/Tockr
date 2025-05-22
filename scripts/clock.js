// Get DOM elements
const hourHand = document.querySelector('.hour-hand');
const minuteHand = document.querySelector('.minute-hand');
const secondHand = document.querySelector('.second-hand');
const clockFace = document.querySelector('.outer-clock-face');
const timeDisplay = document.querySelector('.time-display .time');
const periodDisplay = document.querySelector('.time-display .period');
const dayDisplay = document.querySelector('.status-line .day');
const batteryDisplay = document.querySelector('.status-line .battery');
const dateBox = document.querySelector('.date-box');
const tickSound = document.getElementById('tickSound');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = soundToggle.querySelector('i');

// Initialize sound state
let isSoundEnabled = true;

// Sound toggle handler
soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundToggle.classList.toggle('muted');
    soundToggle.setAttribute('aria-pressed', !isSoundEnabled);

    // Update icon and aria-label
    if (isSoundEnabled) {
        soundIcon.className = 'fas fa-volume-up';
        soundToggle.setAttribute('aria-label', 'Mute tick sound');
    } else {
        soundIcon.className = 'fas fa-volume-mute';
        soundToggle.setAttribute('aria-label', 'Unmute tick sound');
    }
});

// Play tick sound with rate limiting
const playTickSound = () => {
    if (!isSoundEnabled) return;

    const tickInstance = new Audio(tickSound.src);
    tickInstance.volume = 0.5;
    tickInstance
        .play()
        .catch((error) => console.log('Audio playback failed:', error));
};

// Function to format time unit with leading zeros
function formatTimeUnit(unit) {
    return unit.toString().padStart(2, '0');
}

// Array of month names
const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
];
const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Function to calculate position for hour numbers
function calculateHourPosition(hour) {
    const radius = 83; // Distance from center
    const angle = (hour * 30 - 90) * (Math.PI / 180); // Convert 30-degree intervals to radians
    return {
        left: `${50 + (Math.cos(angle) * radius) / 2}%`,
        top: `${50 + (Math.sin(angle) * radius) / 2}%`,
        transform: 'translate(-50%, -50%)',
    };
}

// Function to update all time displays
function updateTimeDisplays() {
    const now = new Date();

    // Get time components
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    let hours = now.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    // Format time string for aria-label
    const timeString = `${formatTimeUnit(hours)}:${formatTimeUnit(minutes)} ${period}`;
    
    // Update digital time
    timeDisplay.textContent = `${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}`;
    periodDisplay.textContent = period;
    
    // Update ARIA labels
    timeDisplay.parentElement.setAttribute('aria-label', `Current time: ${timeString}`);

    // Update date displays
    const currentDay = days[now.getDay()];
    const currentDate = `${months[now.getMonth()]} ${formatTimeUnit(now.getDate())}`;
    
    dayDisplay.textContent = currentDay;
    dateBox.textContent = currentDate;
    
    // Update ARIA labels for date
    dayDisplay.setAttribute('aria-label', `Current day: ${currentDay}`);
    dateBox.setAttribute('aria-label', `Current date: ${currentDate}`);

    // Update battery display (this would normally come from the system)
    batteryDisplay.textContent = '100%';

    // Calculate rotation degrees for analog clock
    const secondsDegrees = (seconds / 60) * 360;
    const minutesDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
    const hoursDegrees = (hours / 12) * 360 + (minutes / 60) * 30;

    // Apply rotations with smooth transitions
    if (seconds === 0) {
        secondHand.style.transition = 'none';
    } else {
        secondHand.style.transition = 'all 0.05s cubic-bezier(0.1, 2.7, 0.58, 1)';
    }

    // Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
        secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
        hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
    });

    // Play tick sound on second change
    if (seconds !== prevSeconds) {
        playTickSound();
        prevSeconds = seconds;
    }
}

// Keep track of previous seconds to play sound only on change
let prevSeconds = new Date().getSeconds();

// Function to create clock face
function createClockFace() {
    // Create minute markers
    for (let i = 0; i < 60; i++) {
        const marker = document.createElement('div');
        marker.className = 'minute-mark';
        marker.style.transform = `rotate(${i * 6}deg)`;
        clockFace.appendChild(marker);
    }

    // Create hour numbers
    for (let i = 1; i <= 12; i++) {
        const hourNumber = document.createElement('div');
        hourNumber.className = 'hour-number';
        hourNumber.textContent = i;

        // Calculate position
        const pos = calculateHourPosition(i);
        hourNumber.style.left = pos.left;
        hourNumber.style.top = pos.top;
        hourNumber.style.transform = pos.transform;

        clockFace.appendChild(hourNumber);
    }
}

// Initialize clock
createClockFace();
updateTimeDisplays();

// Use requestAnimationFrame for smoother updates
let animationFrameId;

function updateClock() {
    updateTimeDisplays();
    animationFrameId = requestAnimationFrame(updateClock);
}

// Start the animation
updateClock();

// Cleanup on page unload
window.addEventListener('unload', () => {
    cancelAnimationFrame(animationFrameId);
});
