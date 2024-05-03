document.addEventListener('DOMContentLoaded', function() {
    console.log('hello world! iteration 4 :-)');
    const landingPage = document.getElementById('landing-page');
    const profilicIdInput = document.getElementById('prolific-id-input');
    const digitTestContainer = document.getElementById('digit-test-container');
    const digitTestDescription = document.getElementById('digit-test-description');
    const numberEntryContainer = document.getElementById('digit-entry-container');
    const wordEntryContainer = document.getElementById('word-entry-container')
    const startNumberTaskButton = document.getElementById('start-number-task');
    const startWordTaskButton = document.getElementById('start-word-task');
    const nextLandingButton = document.getElementById('next-landing');
    const examplesButton = document.getElementById('examples-button');
    const digitInputField = document.getElementById('digit-input');
    const wordInputField = document.getElementById('word-input');
    const wordForm = document.getElementById('word-form');
    const wordTestContainer = document.getElementById('word-test-container');
    const wordTestDescription = document.getElementById('word-test-description');
    const progressBar = document.getElementById('progress');
    const roundProgress = document.getElementById('round-progress');
    const prompt = document.getElementById('prompt');
    const submitButton = document.getElementById('submit-word');
    const progressLabel = document.getElementById('progress-label');

    let timeoutId;
    let roundCount = 0;

    let userData = {
        'profilic_id': '', // replace 'user_profilic_id' with the actual profilic ID of the user
        'numbers': [],
        'words': []
    };

    let totalRounds = 10;
    let taskType = 'number';
    let wordTaskStarted = 'false';

    // Setup word test information
    // from michelle: IDEALLY these would be read from a separate file, but they've been hardcoded for now
    const words = [
        { cue: "Piece/mind/dating", answer: "game" },
        { cue: "Hound/pressure/shot", answer: "Blood" },
        { cue: "Nuclear/feud/album", answer: "Family" },
        { cue: "Main/sweeper/light", answer: "Street" },
        { cue: "Basket/eight/snow", answer: "ball" },
        { cue: "Food/forward/break", answer: "fast" },
        { cue: "Cottage/swiss/cake", answer: "cheese" },
        { cue: "Night/wrist/stop", answer: "watch" },
        { cue: "Show/life/row", answer: "Boat" },
        { cue: "River/note/account", answer: "Bank" },
        { cue: "Loser/throat/spot", answer: "Sore" },
        { cue: "Sense/courtesy/place", answer: "Common" },
        { cue: "Dew/comb/bee", answer: "Honey" },
        { cue: "Fish/mine/rush", answer: "Gold" },
        { cue: "Political/surprise/line", answer: "Party" },
        { cue: "Print/berry/bird", answer: "Blue" },
        { cue: "Preserve/range/tropical", answer: "Forest" },
        { cue: "Fur/rack/tail", answer: "Coat" },
        { cue: "Flake/mobile/cone", answer: "Snow" },
        { cue: "Fountain/baking/pop", answer: "Soda" },
        { cue: "Safety/cushion/point", answer: "Pin" },
        { cue: "Worm/shelf/end", answer: "Book" },
        { cue: "Opera/hand/dish", answer: "Soap" },
        { cue: "Cream/skate/water", answer: "Ice" },
        { cue: "Duck/fold/dollar", answer: "Bill" },
        { cue: "Aid/rubber/wagon", answer: "Band" },
        { cue: "Cracker/fly/flight", answer: "Fire" },
        { cue: "Dream/break/light", answer: "Day" }
    ];
    
    const examples = [
        { cue: "carpet / alert / ink", answer: "red" },
        { cue: "cane / daddy / plum", answer: "sugar" }
      ];
    let currentwordIndex = 0;
    let exampleIndex = 0;

    // Newly added 'Start Word Task' button event listener
    startWordTaskButton.addEventListener('click', function() {
        console.log('starting word task');
        this.style.display = 'none';
        wordTaskStarted = 'true';

        // all the word test goodness
        wordTestDescription.style.display = 'none';
        wordForm.style.display = 'block';
        wordTestContainer.style.display = 'block';
        wordInputField.style.display = 'block';
        submitButton.style.display = 'block';
        prompt.textContent = words[currentwordIndex].cue;
        console.log('presenting actual word cue (not example!)'); // debugging
        prompt.style.display = 'block';

        // reinstate progress bars
        numberEntryContainer.style.display = 'block';
        digitInputField.style.display = 'none';
        progressLabel.style.display = 'block';
        roundProgress.style.display = 'block';
        progressBar.style.display = 'block';

        setupTask('word');
        playRound();
    });
    
    nextLandingButton.addEventListener('click', function() {
        landingPage.style.display = 'none';
        digitTestDescription.style.display = 'block';
        digitTestContainer.style.display = 'block';
        userData.profilic_id = profilicIdInput.value; // Save the Prolific ID when the next button is clicked
    });

    examplesButton.addEventListener('click', function() {
        console.log('onto the practice runs!');
        wordForm.style.display = 'block';
        wordTestDescription.style.display = 'none';
        this.style.display = 'none';
        setupTask('word');
        handleExampleRounds();
    });

    // Handle the 'Start Number Task' button click to begin the task
    startNumberTaskButton.addEventListener('click', function() {
        this.style.display = 'none';
        digitTestDescription.style.display = 'none';
        numberEntryContainer.style.display = 'block';
        setupTask('number');
        playRound();
    });

    function setupTask(type) {
        clearTimeout(timeoutId);
        console.log("Starting setupTask with type:", type);
        roundCount = 0;
        totalRounds = type === 'number' ? 10 : words.length;
        updateProgressBar();
        if (type === 'number') {
            prompt.textContent = 'Enter a digit (1-9):';
            digitInputField.style.display = 'block';
            wordInputField.style.display = 'none';
        } else {
            prompt.textContent = 'Enter the correct word:';
            wordForm.style.display = 'block';
            digitInputField.style.display = 'none';
            wordInputField.style.display = 'block';
        }
    }
    
    
    function playRound() {

        if (taskType === 'word' && wordTaskStarted === 'false') return;

        console.log('starting round!');
        // This function should clear any previous text and reset styles
        digitInputField.style.backgroundColor = 'white'; // Reset background color
        prompt.textContent = taskType === 'number' ? 'Enter a digit (1-9):' : 'Enter the correct word:';
        digitInputField.value = ''; // Clear previous input
        resetRoundProgress();
        
        if (roundCount < totalRounds) {
            updateRoundProgressBar(taskType === 'number' ? 1000 : 15000);
            timeoutId = setTimeout(handleTimeout, taskType === 'number' ? 1010 : 15010); // Ensure round times out if no input
        } else {
            endSession();
        }

        updateProgressBar();
        playBeep();
    }

    function handleTimeout() {
        if (taskType === 'word' && wordTaskStarted === 'false') return;
        roundCount++;
        if (roundCount >= totalRounds) {
            endSession();
        } else {
            digitInputField.style.backgroundColor = 'red';
            prompt.textContent = 'Too slow!';
            if (taskType === 'number') {
                userData.numbers.push('');
            }
            else if (taskType === 'word') {
                userData.words.push('');
            }
            setTimeout(playRound, 1000);
        }
    } 

    // Handle Input Field for Number Task
    digitInputField.addEventListener('input', function(e) {
        processInput(this.value.trim());
        // Prevent any action if the input is not a single digit between 1-9
        if (!/^[1-9]$/.test(this.value.trim())) {
            e.preventDefault();
        }
    });
    // Handle Enter key for Word Task
    digitInputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && taskType === 'word') {
            e.preventDefault(); // Prevent form submission if part of a form
            clearTimeout(timeoutId);
            processInput(this.value.trim());
        }
    });

    submitButton.addEventListener('click', function() {
        handleWordInput();
    });

    function processInput(input) {
        const correctAnswer = words[currentwordIndex].answer; // Placeholder for the correct answer in the word task.
    
        if (taskType === 'number') {
            const isValidInput = /^[1-9]$/.test(input);
            if (isValidInput) {
                digitInputField.style.backgroundColor = 'lightgreen';
                digitInputField.style.borderColor = 'green';
                prompt.textContent = 'Correct input!';
                roundCount++;
                userData.numbers.push(input); // Save the number input by the user
                freezeProgress(1000);
                clearTimeout(timeoutId); // Clear the timeout to stop the countdown
                setTimeout(playRound, 1000); // Proceed to next round after a delay
            } else {
                digitInputField.style.backgroundColor = 'lightcoral'; 
                digitInputField.style.borderColor = 'lightcoral';
                prompt.innerHTML = '<span style="color: red;">Number must be 1-9</span>';
            }
        } else {
            if (input === correctAnswer) {
                wordInputField.style.backgroundColor = 'lightgreen';
                prompt.textContent = 'Correct! The right answer is: ' + correctAnswer;
                userData.words.push(input); // Save the word input by the user
                currentwordIndex++;
            } else {
                wordInputField.style.backgroundColor = 'lightcoral';
                prompt.textContent = 'Incorrect, try again! Correct answer was: ' + correctAnswer;
                currentwordIndex++;
            }
        }
    }

    function downloadCSV() {
        let csvContent = 'profilic_id,' + userData.profilic_id + '\n';
    
        for (let i = 0; i < userData.numbers.length; i++) {
            csvContent += 'N' + (i + 1) + ',' + userData.numbers[i] + '\n';
        }
    
        for (let i = 0; i < userData.words.length; i++) {
            csvContent += 'W' + (i + 1) + ',' + userData.words[i] + '\n';
        }
    
        let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement("a");
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "user_data.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    

    function freezeProgress(pause) {
        console.log('progress frozen');
        roundProgress.style.transition = 'none';
        setTimeout(() => {
            resetRoundProgress();
        }, pause); // Reset the progress bar after brief pause
    }

    function updateProgressBar() {
        
        progressBar.style.width = `${(roundCount / totalRounds) * 100}%`;
        progressLabel.textContent = "Task Progress";
        progressLabel.style.color = 'green';
    }

    function updateRoundProgressBar(duration) {
        console.log('starting round countdown');
        setTimeout(() => {
            roundProgress.style.transition = `width ${duration / 1000}s linear`;
            roundProgress.style.width = '0%';
        }, 10);
    }

    // Reset Round Progress Bar
    function resetRoundProgress() {
        console.log('resetting round progress...');
        roundProgress.style.width = '100%';
        roundProgress.style.transition = 'none'; 
    }

    function playBeep() {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
    }

    function endSession() {
        clearTimeout(timeoutId);
        digitInputField.disabled = true;
        digitInputField.style.display = 'none';
        progressBar.style.display = 'none';
        roundProgress.style.display = 'none';
        prompt.textContent = 'Session completed. Thank you!';
    
        if (taskType === 'number') {
            taskType = 'word';  // Update task type here
            transitionToWordTask(); // Call transition function directly here
        } else {
            // Final completion of all tasks
            wordInputField.disabled = true;
            wordInputField.style.display = 'none';
            submitButton.style.display = 'none';
            progressBar.style.display = 'none';
            roundProgress.style.display = 'none';
            prompt.textContent = 'Session completed. Thank you!';
            prompt.style.display = 'block';
            taskType = null;
            prompt.textContent += ' All tasks completed. You will be prompted to download a CSV file with your inputs.';
            downloadCSV();
        }
    }
    
    wordInputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && taskType === 'word') {
            e.preventDefault();
            handleWordInput();
            clearTimeout();
        }
    });

    function handleWordInput() {
        const input = wordInputField.value.trim();

        if (wordTaskStarted === 'true') {
            processInput(input);
            displayResult(input);
        }
    }
    
    
    function transitionToWordTask() {
        console.log("Transitioning to Word Task");
        digitTestContainer.style.display = 'none';
        startWordTaskButton.style.display = 'none';
        numberEntryContainer.style.display = 'none';
        wordForm.style.display = 'block';
        wordEntryContainer.style.display = 'none';
        wordInputField.style.display = 'none'; // Initially hide input field
        submitButton.style.display = 'none'; // Hide submit button
        examplesButton.style.display = 'block'; // Show a next button specifically for the word task
        
    }

    function displayResult(input) {
        setTimeout(() => {
            wordInputField.value = '';
            wordInputField.style.backgroundColor = 'white';
            if (++currentwordIndex < words.length) {
                prompt.textContent = words[currentwordIndex].cue;
                console.log('displaying word NOT example');
            } else {
                endSession();
            }
        }, 5000); // Show result for 5 seconds
    }
    
    
   // EXAMPLE METHODS
   
   function handleExampleRounds() {
        console.log('example round...');
        wordForm.style.display = 'block';
        wordEntryContainer.style.display = 'block';
        wordInputField.style.display = 'block';
        submitButton.style.display = 'block';

        console.log('showing first sample cue');
        prompt.textContent = examples[exampleIndex].cue; // Show first example cue
        prompt.style.display = 'block';

        examplesButton.style.display = 'none'; // Hide next button during examples
        progressBar.style.display = 'none'; // Hide progress bars during examples
        roundProgress.style.display = 'none';

        // Ensuring the form does not submit traditionally
        if (wordForm) {
            wordForm.onsubmit = function(event) {
                event.preventDefault();
            };
        }

        submitButton.onclick = function(event) {
            event.preventDefault(); // Prevent the default form submission when the submit button is clicked
            if (wordTaskStarted === 'false') {
                processExampleInput();
            } else {
                handleWordInput();
            }
        };

        wordInputField.onkeypress = function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent the default form submission on enter key press
                if (wordTaskStarted === 'false') {
                    processExampleInput();
                } else {
                    handleWordInput();
                }
            }
    };
}

function processExampleInput() {

    console.log('processing example input...');
    const input = wordInputField.value.trim();
    let correctAnswer = examples[exampleIndex].answer;
    
    if (input.toLowerCase() === correctAnswer.toLowerCase()) {
        wordInputField.style.backgroundColor = 'lightgreen';
        prompt.innerHTML = `Correct, the answer was <span style="color: green;">${correctAnswer}</span>`;
    } else {
        wordInputField.style.backgroundColor = 'lightred';
        prompt.innerHTML = `Incorrect, the answer was <span style="color: lightcoral;">${correctAnswer}</span>`;
    }
    setTimeout(() => {
        if (++exampleIndex < examples.length) {
            // Move to the next example
            prompt.textContent = examples[exampleIndex].cue;
            correctAnswer = examples[exampleIndex].answer;
            wordInputField.value = '';
            wordInputField.style.backgroundColor = 'white';
        } else {
            // All examples are done, show start word task button
            wordInputField.style.display = 'none';
            submitButton.style.display = 'none';
            startWordTaskButton.style.display = 'block'; // Now show start button to begin the actual task
            prompt.style.display = 'none';
        }
    }, 3000); // Display correct answer for 3 seconds
}
});
