let mediaRecorder;
let recordedChunks = [];
let videoBlob;

const liveVideo = document.getElementById('liveVideo');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const submitBtn = document.getElementById('submitBtn');
const statusText = document.getElementById('recordingStatus');
const form = document.getElementById('registrationForm');

startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        liveVideo.srcObject = stream;
        
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            // Stop all tracks to release camera
            stream.getTracks().forEach(track => track.stop());
            liveVideo.srcObject = null;
            
            statusText.textContent = "Recording saved. You can now submit.";
            statusText.style.color = "green";
            submitBtn.disabled = false;
        };
        
        recordedChunks = [];
        mediaRecorder.start();
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.textContent = "Recording... Please speak now.";
        statusText.style.color = "red";
        
    } catch (err) {
        alert("Camera access is required for verification.");
        console.error(err);
    }
});

stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    startBtn.textContent = "Retake Video";
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!videoBlob) {
        alert("Please complete the video verification step.");
        return;
    }

    const formData = new FormData(form);
    // Append the recorded video to the form data
    formData.append('verification_video', videoBlob, 'verification.webm');

    // Example POST request to backend
    try {
        submitBtn.textContent = "Uploading Profile...";
        submitBtn.disabled = true;

        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if(response.ok) {
            alert("Registration successful! Your profile is under review.");
            form.reset();
            submitBtn.textContent = "Submit Registration";
        } else {
            alert("Error: " + result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Registration";
        }
    } catch (error) {
        console.error("Submission failed:", error);
        alert("Failed to submit. Check your connection.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Registration";
    }
});