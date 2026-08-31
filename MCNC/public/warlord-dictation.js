// ==========================================================================
// WARLORD WHISPER DICTATION ENGINE (BASE ONE PRIVATE PIPELINE)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    const micBtns = document.querySelectorAll('.warlord-mic-btn');

    micBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);

            if (!isRecording) {
                // IGNITE RECORDING SEQUENCE
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];

                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };

                    mediaRecorder.onstop = async () => {
                        btn.classList.remove('listening');
                        
                        const originalText = targetInput.value;
                        targetInput.value = originalText + (originalText ? " " : "") + "[Transcribing via Base One Whisper...]\n";

                        // Package the audio payload for Jack
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        const formData = new FormData();
                        formData.append('audio', audioBlob, 'dictation.webm');

                        try {
                            const response = await fetch('/api/transcribe', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await response.json();
                            
                            if (data.success) {
                                targetInput.value = originalText + (originalText ? " " : "") + data.text;
                            } else {
                                targetInput.value = originalText + "\n[System Bridge Failed: " + data.error + "]";
                            }
                        } catch (err) {
                            console.error("Jack Bridge Error:", err);
                            targetInput.value = originalText + "\n[System Error: Could not reach Node backend]";
                        }
                    };

                    mediaRecorder.start();
                    isRecording = true;
                    btn.classList.add('listening');

                } catch (err) {
                    console.error("Hardware Lockout:", err);
                    alert("WARLORD SYSTEM: Microphone access denied or hardware not found.");
                }
            } else {
                // TERMINATE RECORDING & DISPATCH
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                    mediaRecorder.stream.getTracks().forEach(track => track.stop());
                }
                isRecording = false;
            }
        });
    });
});