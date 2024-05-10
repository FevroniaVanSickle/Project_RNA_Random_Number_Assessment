document.addEventListener('DOMContentLoaded', function() {
    console.log('hello world! iteration 4 :-)');
    const landingPage = document.getElementById('landing-page');
    const profilicIdInput = document.getElementById('prolific-id-input');
    const nextLandingButton = document.getElementById('next-landing');

    // number test
    const digitTestContainer = document.getElementById('digit-test-container');
    const digitTestDescription = document.getElementById('digit-test-description');
    const numberEntryContainer = document.getElementById('digit-entry-container');
    const startNumberTaskButton = document.getElementById('start-number-task');
    const digitInputField = document.getElementById('digit-input');

    // word test
    const wordEntryContainer = document.getElementById('word-entry-container')
    const startWordTaskButton = document.getElementById('start-word-task');
    const examplesButton = document.getElementById('examples-button');
    const wordInputField = document.getElementById('word-input');
    const wordForm = document.getElementById('word-form');
    const wordTestContainer = document.getElementById('word-test-container');
    const wordTestDescription = document.getElementById('word-test-description');
    const submitButton = document.getElementById('submit-word');

    // progress bar
    const progressContainer = document.getElementById('progress-container');
    const taskProgress = document.getElementById('task-progress');
    const progressLabel = document.getElementById('progress-label');
    const roundProgress = document.getElementById('round-progress');

    // prompt
    const prompt = document.getElementById('prompt');


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
        // { cue: "Nuclear/feud/album", answer: "Family" },
        // { cue: "Main/sweeper/light", answer: "Street" },
        // { cue: "Basket/eight/snow", answer: "ball" },
        // { cue: "Food/forward/break", answer: "fast" },
        // { cue: "Cottage/swiss/cake", answer: "cheese" },
        // { cue: "Night/wrist/stop", answer: "watch" },
        // { cue: "Show/life/row", answer: "Boat" },
        // { cue: "River/note/account", answer: "Bank" },
        // { cue: "Loser/throat/spot", answer: "Sore" },
        // { cue: "Sense/courtesy/place", answer: "Common" },
        // { cue: "Dew/comb/bee", answer: "Honey" },
        // { cue: "Fish/mine/rush", answer: "Gold" },
        // { cue: "Political/surprise/line", answer: "Party" },
        // { cue: "Print/berry/bird", answer: "Blue" },
        // { cue: "Preserve/range/tropical", answer: "Forest" },
        // { cue: "Fur/rack/tail", answer: "Coat" },
        // { cue: "Flake/mobile/cone", answer: "Snow" },
        // { cue: "Fountain/baking/pop", answer: "Soda" },
        // { cue: "Safety/cushion/point", answer: "Pin" },
        // { cue: "Worm/shelf/end", answer: "Book" },
        // { cue: "Opera/hand/dish", answer: "Soap" },
        // { cue: "Cream/skate/water", answer: "Ice" },
        // { cue: "Duck/fold/dollar", answer: "Bill" },
        // { cue: "Aid/rubber/wagon", answer: "Band" },
        // { cue: "Cracker/fly/flight", answer: "Fire" },
        { cue: "Dream/break/light", answer: "Day" }
    ];
    
    const examples = [
        { cue: "carpet / alert / ink", answer: "red" },
        { cue: "cane / daddy / plum", answer: "sugar" }
      ];
    let currentwordIndex = 0;
    let exampleIndex = 0;


// ********************** START WORD AND NUMBER TASK BUTTONS & START TASK STUFF ****************** //

    // Handle the 'Start Number Task' button click to begin the task
    startNumberTaskButton.addEventListener('click', function() {
        this.style.display = 'none';
        digitTestDescription.style.display = 'none';
        numberEntryContainer.style.display = 'block';
        progressContainer.style.display = 'block';
        progressContainer.style.visibility = 'visible';
        console.log('displaying progress bar');
        setupTask('number');
        playRound();
    });

    // Newly added 'Start Word Task' button event listener
    startWordTaskButton.addEventListener('click', function() {
        console.log('starting word task');
        this.style.display = 'none';
        wordTaskStarted = 'true';

        // all the word test stuff
        wordTestDescription.style.display = 'none';
        wordForm.style.display = 'block';

        wordTestContainer.style.display = 'block';
        wordEntryContainer.style.visibility = 'visible';

        wordInputField.style.display = 'block';
        wordInputField.style.visibility = 'visible';

        submitButton.style.display = 'block';
        submitButton.style.visibility = 'visible';

        wordEntryContainer.style.display = 'block';
        wordEntryContainer.style.visibility = 'visible';

        prompt.style.display = 'block';
        prompt.style.visibility = 'visible';

        // reinstate progress bars
        digitInputField.style.display = 'none';
        progressContainer.style.visibility = 'visible';
        console.log('displaying progress bar');


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

    function setupTask(type) {

        clearTimeout(timeoutId);
        console.log("Starting setupTask with type:", type);
        roundCount = 0;
        totalRounds = type === 'number' ? 10 : words.length;

        updateTaskProgressBar();
        if (type === 'number') {
            prompt.textContent = 'Enter a digit (1-9):';
            digitInputField.style.display = 'block';
            wordInputField.style.display = 'none';
        } else {
            prompt.textContent = 'Enter the word that best goes with the following: ';
            prompt.textContent += words[currentwordIndex].cue;            
            wordForm.style.display = 'block';
            digitInputField.style.display = 'none';
            wordInputField.style.display = 'block';
        }
    }


    // TASK / ROUND FUNCTIONS

    function freezeProgress(pause) {
        console.log('progress frozen');
        roundProgress.style.transition = 'none';
        setTimeout(() => {
            resetRoundProgress();
        }, pause); // reset the progress bar after brief pause
    }

    function updateTaskProgressBar() {
        taskProgress.style.width = `${(roundCount / totalRounds) * 100}%`;
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
    
    function playRound() {

        updateTaskProgressBar();
        playBeep();
        resetRoundProgress();

        console.log("starting round...");
    
        if (taskType === 'word' && wordTaskStarted === 'false') return;

        console.log('starting round!');

        if (taskType === 'number') {
            digitInputField.style.backgroundColor = 'white'; // Reset background color
            digitInputField.value = ''; // Clear previous input
        }

        else {
            wordInputField.style.backgroundColor = 'white';
            wordInputField.value = ''; // Clear previous input
        }

        prompt.textContent = taskType === 'number' ? 'Enter a digit (1-9):' : 'Enter the word that best goes with the following: ';

        if (taskType === 'word'){
            prompt.textContent += words[currentwordIndex].cue;
        }
        
        if (roundCount < totalRounds) {
            updateRoundProgressBar(taskType === 'number' ? 1000 : 15000);
            timeoutId = setTimeout(handleTimeout, taskType === 'number' ? 1010 : 15010); // Ensure round times out if no input
        } else {
            endSession();
        }


    }

    function handleTimeout() {
        if (taskType === 'word' && wordTaskStarted === 'false') return;

        roundCount++;
        if (roundCount >= totalRounds) {
            endSession();
        } else {            
            prompt.textContent = 'Too slow!';
            if (taskType === 'number') {
                digitInputField.style.backgroundColor = 'lightcoral';
                userData.numbers.push('');
            }
            else if (taskType === 'word') {
                wordInputField.style.backgroundColor = 'lightcoral';
                userData.words.push('');
            }

            setTimeout(playRound, 1000);
        }
    } 

    // handles input field for number tasks
    digitInputField.addEventListener('input', function(e) {
        processInput(this.value.trim());
        // prevents any action if the input is not a single digit between 1-9
        if (!/^[1-9]$/.test(this.value.trim())) {
            e.preventDefault();
        }
    });
    // handle enter key for word task
    wordInputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && taskType === 'word') {
            e.preventDefault(); // prevent form submission 
            processInput(this.value.trim());
        }
    });

    submitButton.addEventListener('click', function() {
        handleWordInput();
    });

    function processInput(input) {
        const correctAnswer = words[currentwordIndex].answer;
    
        if (taskType === 'number') {
            const isValidInput = /^[1-9]$/.test(input);
            if (isValidInput) {
                digitInputField.style.backgroundColor = 'lightgreen';
                digitInputField.style.borderColor = 'green';
                prompt.textContent = 'Correct input!';
                roundCount++;
                userData.numbers.push(input); // save the number input by the user
                freezeProgress(1000);
                clearTimeout(timeoutId); // stop countdown
                setTimeout(playRound, 1000); // proceed to next round after a delay
            } else {
                digitInputField.style.backgroundColor = 'lightcoral'; 
                digitInputField.style.borderColor = 'lightcoral';
                prompt.innerHTML = '<span style="color: lightcoral;">Number must be 1-9</span>';
            }
        } else if (taskType === 'word') {
            if (input === correctAnswer) {
                wordInputField.style.backgroundColor = 'lightgreen';
                wordInputField.style.borderColor = 'green';
                prompt.textContent = 'Correct! The right answer is: ' + correctAnswer;
                roundCount++;
                userData.words.push(input); // save the word input by the user
                freezeProgress(1000);
                clearTimeout(timeoutId);
                setTimeout(playRound, 1000);
            } else {
                wordInputField.style.backgroundColor = 'lightcoral';
                wordInputField.style.borderColor = 'lightcoral';
                prompt.textContent = 'Incorrect! Correct answer was: ' + correctAnswer;
                roundCount++;
                userData.words.push(input);
                freezeProgress(1000);
                clearTimeout(timeoutId); // stop countdown
                setTimeout(playRound, 1000);
            }
        }
    }

    function downloadCSV() {
        // initialize CSV content with headers
        let csvContent = 'profilic_id';
        for (let i = 0; i < userData.numbers.length; i++) {
            csvContent += ',N' + (i + 1);
        }
        for (let i = 0; i < userData.words.length; i++) {
            csvContent += ',W' + (i + 1);
        }
        csvContent += '\n';
    
        // add user data
        csvContent += userData.profilic_id;
        for (let i = 0; i < userData.numbers.length; i++) {
            csvContent += ',' + userData.numbers[i];
        }
        for (let i = 0; i < userData.words.length; i++) {
            csvContent += ',' + userData.words[i];
        }
        csvContent += '\n';
    
        // create and download CSV file
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
    

    function endSession() {
        clearTimeout(timeoutId);
        digitInputField.disabled = true;
        digitInputField.style.display = 'none';
        progressContainer.style.visibility = 'hidden';
        prompt.textContent = 'Task completed.';
    
        if (taskType === 'number') {
            taskType = 'word';  // update task type 
            transitionToWordTask(); 
        } else {
            // final completion of all tasks
            wordInputField.disabled = true;
            wordInputField.style.display = 'none';
            submitButton.style.visibility = 'hidden';

            prompt.textContent = 'Session completed. Thank you! You will be prompted to download a CSV file with your inputs.';
            prompt.style.visibility = 'visible';

            taskType = null;
            downloadCSV();
        }
    }
    
    wordInputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && taskType === 'word') {
            e.preventDefault();
            handleWordInput();
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
        submitButton.style.display = 'none';

        progressContainer.style.visibility = 'hidden';
        wordForm.style.display = 'block';
        wordEntryContainer.style.display = 'block';
        examplesButton.style.display = 'block'; // show button for examples
        
    }

    function displayResult(input) {
        setTimeout(() => {
            wordInputField.value = '';
            wordInputField.style.backgroundColor = 'white';
            if (++currentwordIndex < words.length) {
                prompt.textContent = words[currentwordIndex].cue;
            } else {
                endSession();
            }
        }, 5000); // show result for 5 seconds
    }
    
    // michelle: theoretical implementation of uploading to google drive, reused from another independent project
    // you will need to use node.js or something similar to make this actually happen, as jeckyll through github pages is static
    function uploadFile(authToken, fileData, fileName) {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const contentType = 'text/csv';
        const metadata = {
            'name': fileName,
            'mimeType': contentType
        };

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            '\r\n' +
            fileData +
            close_delim;

        const request = new XMLHttpRequest();
        request.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', true);
        request.setRequestHeader('Authorization', 'Bearer ' + authToken);
        request.setRequestHeader('Content-Type', 'multipart/related; boundary="' + boundary + '"');
        request.onreadystatechange = function() {
            if (request.readyState === 4 && request.status === 200) {
                console.log('File uploaded successfully');
            }
        };

        request.send(multipartRequestBody);
    }

    
   // *****************  EXAMPLE METHODS *********************************** //
   
   function handleExampleRounds() {
        console.log('example round...');
        wordForm.style.display = 'block';
        wordEntryContainer.style.display = 'block';

        wordInputField.style.visibility = 'visible';
        submitButton.style.display = 'block';
        submitButton.style.visibility = 'visible';

        console.log('showing first sample cue');
        prompt.textContent = examples[exampleIndex].cue; // show first example cue
        prompt.style.visibility = 'visible';


        examplesButton.style.display = 'none'; 

        // ensuring the form does not submit traditionally
        if (wordForm) {
            wordForm.onsubmit = function(event) {
                event.preventDefault();
            };
        }

        submitButton.onclick = function(event) {
            event.preventDefault(); // prevent the default form submission when the submit button is clicked
            if (wordTaskStarted === 'false') {
                processExampleInput();
            } else {
                handleWordInput();
            }
        };

        wordInputField.onkeypress = function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // prevent the default form submission on enter key press
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
        wordInputField.style.backgroundColor = 'lightcoral';
        prompt.innerHTML = `Incorrect, the answer was <span style="color: lightcoral;">${correctAnswer}</span>`;
    }
    setTimeout(() => {
        if (++exampleIndex < examples.length) {
            // move to the next example
            prompt.textContent = examples[exampleIndex].cue;
            correctAnswer = examples[exampleIndex].answer;
            wordInputField.value = '';
            wordInputField.style.backgroundColor = 'white';
        } else {
            // all examples are done, show start word task button
            wordInputField.style.visibility = 'hidden';
            submitButton.style.visibility = 'hidden';
            startWordTaskButton.style.display = 'block'; // now show start button to begin the actual task
            prompt.style.visibility = 'hidden';
        }
    }, 3000); // display correct answer for 3 seconds
}
})
