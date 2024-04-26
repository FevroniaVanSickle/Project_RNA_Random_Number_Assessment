document.addEventListener('DOMContentLoaded', function() {
    const digitTestContainer = document.getElementById('digit-test-container');
    const cueTestContainer = document.getElementById('cue-test-container');
    const digitInput = document.getElementById('digit-input');
    const cueInput = document.getElementById('cue-input');
    const prompt = document.getElementById('prompt');
    const roundProgress = document.getElementById('round-progress');
    let timeoutId, currentCueIndex = 0, digitSequence = [];

    document.getElementById('confirm-id').addEventListener('click', function() {
        const prolificID = document.getElementById('prolific-id-input').value;
        // Validate Prolific ID, then start the number task
        digitTestContainer.style.display = 'block';
        setupTask('number');
    });

    function setupTask(taskType) {
        clearTimeout(timeoutId); // Clear any existing timer
        const isNumberTask = taskType === 'number';
        const container = isNumberTask ? digitTestContainer : cueTestContainer;
        const inputElement = isNumberTask ? digitInput : cueInput;
    
        container.style.display = 'block'; // Show the relevant container
        inputElement.disabled = false;
        inputElement.value = '';
        inputElement.focus();
    
        // Reset and start the timer for input handling
        resetAndStartTimer(isNumberTask ? 1000 : 15000); // 1 second for number, 15 seconds for word
    
        function resetAndStartTimer(duration) {
            roundProgress.style.width = '100%';
            roundProgress.style.transition = `width ${duration / 1000}s linear`;
    
            timeoutId = setTimeout(() => {
                inputElement.style.backgroundColor = 'red';
                prompt.textContent = 'Too slow!';
                inputElement.value = ''; // Clear input to indicate no input was made
                if (isNumberTask) {
                    // If no input was given, push an empty string or similar to indicate a miss
                    digitSequence.push('');
                    // Call setupTask again to reset for next input
                    setupTask('number');
                } else {
                    // Handle no input as incorrect for the word task
                    checkWordResponse('');
                }
            }, duration);
        }
    }
    

    function processNumberInput(value) {
        digitSequence.push(value);
        prompt.textContent = 'Correct input!';
        setupTask('number'); // Set up the next round for number task
    }

    function checkWordResponse(response) {
        const correctResponse = 'example'; // Define correct responses based on cues
        if (response.toLowerCase() === correctResponse.toLowerCase()) {
            cueInput.style.backgroundColor = 'lightgreen';
            prompt.textContent = `Correct! The answer is ${correctResponse}`;
        } else {
            cueInput.style.backgroundColor = 'red';
            prompt.textContent = `Incorrect, the correct response was ${correctResponse}`;
        }
        setupTask('word'); // Move to the next cue or restart word task
    }

    function playBeep() {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
    }

    function endSession() {
        clearTimeout(timeoutId);
        prompt.textContent = 'Session completed. Thank you!';
        digitInput.disabled = true;
        cueInput.disabled = true;
    }

    function endNumberTask() {
        // Hide number task and show word task
        digitTestContainer.style.display = 'none';
        cueTestContainer.style.display = 'block';
    }
    
});
