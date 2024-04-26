document.addEventListener('DOMContentLoaded', function() {
    // Retrieve all necessary DOM elements
    const landingPage = document.getElementById('landing-page');
    const digitTestContainer = document.getElementById('digit-test-container');
    const digitTestDescription = document.getElementById('digit-test-description');
    const cueTestDescription = document.getElementById('cue-test-description');
    const entryContainer = document.getElementById('entry-container');
    const startButton = document.getElementById('start-button');
    const digitInput = document.getElementById('digit-input');
    const prompt = document.getElementById('prompt');
    const progressBar = document.getElementById('progress');
    const roundProgress = document.getElementById('round-progress');
    const cueTestContainer = document.getElementById('cue-test-container');
	const cueForm = document.getElementById('cue-form');

    const startDigitTestButton = document.getElementById('start-digit-test');
    const startCueTestButton = document.getElementById('start-cue-test');
   
    let timeoutId;
    let digitSequence = [];
    let totalDigits = 100;
    let started = false;

	// New cue handling setup
	const cues = [
		"Piece / mind / dating",
		"Hound / pressure / shot",
		"Nuclear / feud / album",
		"Carpet / alert / ink",
		"Main / sweeper / light"
	];

	let currentCueIndex = 0;
    const cuesDisplay = document.getElementById('cues');
    const cueInput = document.getElementById('cue-input');


    // Handle starting the digit test
    startDigitTestButton.addEventListener('click', function() {
        landingPage.style.display = 'none';
        digitTestContainer.style.display = 'block';
        startButton.style.display = 'block';
    });

    // Start the digit entry process
    startButton.addEventListener('click', function() {
        entryContainer.style.display = 'block';
        startButton.style.display = 'none';  // Hide the start button once the test begins
        digitTestDescription.style.display = 'none';  // Optionally hide the description during the test
        digitInput.focus();
        if (!started) {
            started = true;
            playRound();
        }
    });

    // Handle the cue test starting
    startCueTestButton.addEventListener('click', function() {
        landingPage.style.display = 'none';
        cueForm.style.display = 'block';
        presentCue();
    });

    // Handle form submission
    cueForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        const userResponse = cueInput.value;
        console.log("Response saved:", userResponse); // Optionally send this to a server
        cueInput.value = ''; // Clear the input field
        presentCue(); // Present the next cue
    });


	function presentCue() {
		console.log("Presenting cue.");
        if (currentCueIndex < cues.length) {
            cuesDisplay.textContent = cues[currentCueIndex];
            currentCueIndex++;
        } else {
            cuesDisplay.textContent = "No more cues available.";
        }
    }

	function saveCueResponse(response) {
        // Add logic to save response to a CSV or server
        console.log("Response saved: ", response);
    }


    // Handling digit input
    digitInput.addEventListener('input', function() {
        clearTimeout(timeoutId);
        processInput();
    });

    // Function to start a new round
    function playRound() {
        if (digitSequence.length >= totalDigits) {
            endSession();
            return;
        }
        prompt.textContent = 'Enter a digit:';
        digitInput.style.backgroundColor = 'white';
        roundProgress.style.backgroundColor = 'orange';
        digitInput.disabled = false;
        digitInput.value = '';
        digitInput.focus();
        resetRoundProgress();

        timeoutId = setTimeout(() => {
            if (digitInput.value === '') {
                digitInput.style.backgroundColor = 'red';
                roundProgress.style.backgroundColor = 'lightcoral';
                prompt.textContent = 'Too slow!';
                playBeep();
                digitSequence.push('');
                updateProgressBar();
                setTimeout(() => {
                    digitInput.style.backgroundColor = 'white';
                    digitInput.disabled = false;
                    digitInput.value = '';
                    prompt.textContent = 'Enter a digit:';
                    playRound();
                }, 2000);
            }
        }, 1000);
    }

    // Process user input
    function processInput() {
        const digit = digitInput.value.trim();
        if (/^[1-9]$/.test(digit)) {
            digitSequence.push(digit);
            digitInput.style.backgroundColor = 'lightgreen';
            roundProgress.style.backgroundColor = 'lightgreen'; // Reflect successful input on progress bar
            pauseRoundProgress(); // Freeze the progress bar
            setTimeout(() => {
                digitInput.style.backgroundColor = 'white';
                digitInput.disabled = false;
                digitInput.value = '';
                digitInput.focus(); // Ensure the input field remains focused
                updateProgressBar();
                playRound();
            }, 1000);
        }
    }

    // Update the progress bar
    function updateProgressBar() {
        const progress = (digitSequence.length / totalDigits) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Reset the round progress bar to start state
    function resetRoundProgress() {
        roundProgress.style.transition = 'none';
        roundProgress.style.width = '100%';
        setTimeout(() => {
            roundProgress.style.transition = 'width 1s linear';
            roundProgress.style.width = '0%';
        }, 10);
    }

    function pauseRoundProgress() {
        roundProgress.style.transition = 'none';
        roundProgress.style.width = `${roundProgress.clientWidth}px`; // Pause the current width
		roundProgress.style.backgroundColor = 'lightgreen';
    }

    function playBeep() {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.2;
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
    }

    function endSession() {
        clearTimeout(timeoutId);
        prompt.textContent = 'Session completed. Thank you!';
        digitInput.disabled = true;
    }

});