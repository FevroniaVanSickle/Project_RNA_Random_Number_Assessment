
document.addEventListener('DOMContentLoaded', function() {
    console.log('hello world! :-)');
    const landingPage = document.getElementById('landing-page');
    const profilicIdInput = document.getElementById('prolific-id-input');
    const nextLandingButton = document.getElementById('next-landing');

    // number test
    const digitTestContainer1 = document.getElementById('digit-test-container-1');
    const digitTestContainer2 = document.getElementById('digit-test-container-2');
    const digitTestContainer3 = document.getElementById('digit-test-container-3');
    const digitTestDescription1 = document.getElementById('digit-test-description-1');
    const digitTestDescription2 = document.getElementById('digit-test-description-2');
    const digitTestDescription3 = document.getElementById('digit-test-description-3');
    const digitNextButton1= document.getElementById('digit-next-1');
    const digitNextButton2 =document.getElementById('digit-next-2');
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

    // task countdown
    const taskCountdownContainer = document.getElementById('task-countdown-container');

    // prompt
    const prompt = document.getElementById('prompt');

    let timeoutId;
    let roundCount = 0;

    profilicIdInput.focus();
    let userData = {
        'profilic_id': '', // replace 'user_profilic_id' with the actual profilic ID of the user
        'numbers': [],
        'words': []
    };

    let totalRounds = 0;
    let taskType = 'number';
    let wordTaskStarted = false;
    const totalNumEntries = 2;

    // Setup word test information
    // from michelle: IDEALLY these would be read from a separate file, but they've been hardcoded for now
    const words = [
        { cue: "piece/mind/dating", answer: "game" },
        { cue: "hound/pressure/shot", answer: "blood" },
        { cue: "dream/break/light", answer: "day" }
    ];

    const examples = [
        { cue: "carpet / alert / ink", answer: "red" },
        { cue: "cane / daddy / plum", answer: "sugar" },
        { cue: "dream/break/light", answer: "day" }
      ];

    let currentwordIndex = 0;
    let exampleIndex = 0;

// ********************** START WORD AND NUMBER TASK BUTTONS & START TASK STUFF ****************** //

    // Handle the 'Start Number Task' button click to begin the task
    startNumberTaskButton.addEventListener('click', function() {
        this.style.display = 'none';
        digitTestDescription3.style.display = 'none';
        setCountdown('number').then(() => {
            numberEntryContainer.style.display = 'block';
            progressContainer.style.display = 'block';
            progressContainer.style.visibility = 'visible';
            setupTask('number');
            playRound();
        }).catch(error => {
            console.error('Error in setCountdown for number:', error);
        });
    });

    // 'Start Word Task' button event listener
    startWordTaskButton.addEventListener('click', function() {
       
        // clear the page
        this.style.display = 'none';
        progressContainer.style.visibility = 'hidden';

        // countdown 
        setCountdown('word').then(() => {
            wordTaskStarted = true;

            // all the word test stuff
            wordForm.style.display = 'flex';

            wordTestContainer.style.display = 'flex';
            wordEntryContainer.style.visibility = 'visible';

            wordInputField.style.display = 'flex';
            wordInputField.style.visibility = 'visible';
            wordInputField.focus();

            submitButton.style.display = 'flex';
            submitButton.style.visibility = 'visible';

            wordEntryContainer.style.display = 'flex';
            wordEntryContainer.style.visibility = 'visible';

            prompt.style.display = 'flex';
            prompt.style.visibility = 'visible';

            // reinstate progress bars
            progressContainer.style.display = 'block';
            progressContainer.style.visibility = 'visible';
            setupTask('word');
            playRound();
        }).catch(error => {
            console.error('Error in setCountdown for word:', error);
        });;
        
    });
    
    nextLandingButton.addEventListener('click', function() {
        if (!profilicIdInput.value){ // prevent user from continuing without ID
            return;
        }
        else{
            landingPage.style.display = 'none';
            digitTestDescription1.style.display = 'block';
            digitTestContainer1.style.display = 'block';
            userData.profilic_id = profilicIdInput.value; // Save the Prolific ID when the next button is clicked
            // digitTestContainer3.style.display = 'block';
        }
        
    });
    
    digitNextButton1.addEventListener('click', function() {
        digitTestDescription1.style.display = 'none';
        digitTestContainer1.style.display = 'none';
        digitTestDescription2.style.display = 'block';
        digitTestContainer2.style.display = 'block';
    });

    digitNextButton2.addEventListener('click', function() {
        digitTestDescription2.style.display = 'none';
        digitTestContainer2.style.display = 'none';
        digitTestDescription3.style.display = 'block';
        digitTestContainer3.style.display = 'block';
    });

    examplesButton.addEventListener('click', function() {
        wordForm.style.display = 'block';
        progressContainer.style.display = 'none';
        wordTestDescription.style.display = 'none';
        this.style.display = 'none'; 
        examplesTaskStarted = false;
        // ensuring the form does not reload
        if (wordForm) {
            wordForm.onsubmit = function(event) {
                event.preventDefault();
            };
        }
        setCountdown('example').then(() => {
            progressContainer.style.display = 'block';
            progressContainer.style.visibility = 'visible';
            examplesButton.style.display = 'none'; 
            setupTask('examples');
            startExampleRounds();
        }).catch(error => {
            console.error('Error in setCountdown for example:', error);
        });;
    });

    function setupTask(type) {
        clearTimeout(timeoutId);
        roundCount = 0;
        //set totalRounds according to type
        if (type === 'example'){
            totalRounds = examples.length;
            console.log('total rounds = '+ totalRounds);
        }else{
            totalRounds = type === 'number' ? totalNumEntries : words.length;
        }
        updateTaskProgressBar();
        if (type === 'number') {
            prompt.textContent = 'Enter a digit (1-9):';
            digitInputField.style.display = 'flex';
            wordInputField.style.display = 'none';
        } else if (type == 'word'){
            prompt.textContent = 'Enter the word that best goes with the following: ';
            prompt.textContent += words[currentwordIndex].cue;            
            wordForm.style.display = 'block'; 
            digitInputField.style.display = 'none';
            wordInputField.style.display = 'block'; 
            wordInputField.focus();
        } else if (type == 'examples') {
            prompt.textContent = 'Enter the word that best goes with the following: ';
            prompt.textContent += examples[currentwordIndex].cue;            
            wordForm.style.display = 'block'; 
            digitInputField.style.display = 'none';
            wordInputField.style.display = 'block'; 
            wordInputField.focus();
        }
        
    }

    function manageProgressBar(pause) {
        console.log('freeze/reset round ProgressBar');
        // Immediately stop any ongoing transition to freeze the current state
        roundProgress.style.transition = 'none';
        roundProgress.style.width = '100%';  // Assuming you want to freeze it fully filled
    
        // Set a timeout to reset the progress bar after the specified pause
        setTimeout(() => {
            // console.log('Resetting round progress bar');
            roundProgress.style.transition = 'none';
            roundProgress.style.width = '100%';  // Resets the bar to full width
        }, pause);
    }
    
    // TASK / ROUND FUNCTIONS

    // Countdown to Begin Tasks
    async function setCountdown(type){
        taskCountdownContainer.style.display = 'block';
        const childNum = Array.from(taskCountdownContainer.children);
        return new Promise((resolve, reject) => {
            showNextChild(childNum, 0)
                .then(() => {
                    if (type === 'number') {
                        resolve(); // Resolve after countdown completion for 'number'
                    } else if (type === 'example') {
                        resolve(); // Resolve after countdown completion for 'example'
                    } else if (type === 'word') {
                        resolve(); // Resolve after countdown completion for 'word'
                    } else {
                        reject(new Error('Invalid task type'));
                    }
                })
                .catch(error => {
                    console.error('Error during countdown:', error);
                    reject(error);
                });
        });
    };

    // Recursively Display Numbers in Countdown 
    function showNextChild(childNum, index) {
        return new Promise((resolve, reject) => {
            if (index < childNum.length) {
                const child = childNum[index];

                // Ensure the child element exists
                if (!child) {
                    console.error('Child element does not exist:', index);
                    reject(new Error('Child element does not exist'));
                    return;
                }
                child.style.display = 'block';
                try {
                    setTimeout(function(){
                        child.style.display = 'none';
                        showNextChild(childNum, index + 1).then(resolve).catch(reject); // Show the next child after the current one is hidden 
                    }, 1000); // hold each number for one second 
                } catch (error) {
                    reject(error);
                }
            } else {
                taskCountdownContainer.style.display = 'none';
                resolve();
            }
        });
    }

    function updateTaskProgressBar() {
        taskProg = `${(roundCount / totalRounds) * 100}%`;
        taskProgress.style.width = taskProg;
        console.log('task progress = '+ taskProg);
        progressLabel.textContent = "Task Progress";
        progressLabel.style.color = 'green';
        console.log('updated task progress bar');
    }

    function updateRoundProgressBar(duration) {
        setTimeout(() => {
            roundProgress.style.transition = `width ${duration / 1000}s linear`;
            roundProgress.style.width = '0%';
        }, 10);
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

        if (taskType === 'word' && wordTaskStarted === false) return;

        if (taskType === 'number') {
            digitInputField.style.backgroundColor = 'white'; // Reset background color
            digitInputField.value = ''; // Clear previous input
            digitInputField.focus();
        }

        else {
            // wordInputField.style.backgroundColor = 'white';
            wordInputField.value = ''; // Clear previous input
            wordInputField.focus();
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
        console.log(handleTimeout);
        if (taskType === 'word' && wordTaskStarted === false) return;

        if (roundCount >= totalRounds) {
            endSession();
        } else {            
            prompt.textContent = 'Too slow!';
            if (taskType === 'number') {
                digitInputField.style.backgroundColor = 'lightcoral';
                userData.numbers.push('');
                roundCount++;
            }
            else if (taskType === 'word') {
                wordInputField.style.backgroundColor = 'lightcoral';
                userData.words.push('');
                roundCount++;
            }
            else {
                wordInputField.style.backgroundColor = 'lightcoral';
                roundCount++;
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
                manageProgressBar(1000);
                clearTimeout(timeoutId); // stop countdown
                setTimeout(playRound, 1000); // proceed to next round after a delay
            } else {
                digitInputField.style.backgroundColor = 'lightcoral'; 
                digitInputField.style.borderColor = 'lightcoral';
                prompt.innerHTML = '<span style="color: lightcoral;">Number must be 1-9</span>';
            }
        } else if (taskType === 'word') {
            if (input.toLowerCase() === correctAnswer.toLowerCase()) {
                wordInputField.style.backgroundColor = 'lightgreen';
                wordInputField.style.borderColor = 'green';
                prompt.innerHTML = `Correct! The answer was <span style="color: green;">${correctAnswer}</span>`;
                roundCount++;
                userData.words.push(input); // save the word input by the user
                manageProgressBar(1000);
                clearTimeout(timeoutId);
                setTimeout(playRound, 1000);
            } else {
                wordInputField.style.backgroundColor = 'lightcoral';
                wordInputField.style.borderColor = 'lightcoral';
                prompt.innerHTML = `Incorrect, the answer was <span style="color: lightcoral;">${correctAnswer}</span>`;
                roundCount++;
                userData.words.push(input);
                manageProgressBar(1000);
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

        if (wordTaskStarted === true) {
            processInput(input);
            displayResult(input);
        }

    }
    
    function transitionToWordTask() {
        digitTestContainer3.style.display = 'none';
        startWordTaskButton.style.display = 'none';
        submitButton.style.display = 'none';
        progressContainer.style.visibility = 'hidden';
        wordForm.style.display = 'flex';
        wordEntryContainer.style.display = 'flex';
        examplesButton.style.display = 'flex'; // show button for examples
        
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
   
   function startExampleRounds() {

    console.log('startExampleRounds');

        //update round progress bar
        if (roundCount < totalRounds) {
            updateRoundProgressBar(taskType === 'number' ? 1000 : 15000);
            timeoutId = setTimeout(handleTimeout, taskType === 'number' ? 1010 : 15010); // Ensure round times out if no input
        }

        submitButton.style.display = 'flex';
        submitButton.style.visibility = 'visible';

        submitButton.onclick = function(event) {
            event.preventDefault(); // prevent the default form submission on enter key press
            updateTaskProgressBar();   
            manageProgressBar(1000);     
            playBeep();
            processExampleInput();

        };

        wordInputField.onkeypress = function(event) { 
            if (event.key === 'Enter') {
                event.preventDefault(); // prevent the default form submission on enter key press
                updateTaskProgressBar();   
                manageProgressBar(1000);     
                playBeep();
                processExampleInput();
               
            }
    };
}

function processExampleInput() {
    console.log('processing example input...');

    // updateTaskProgressBar();   
    // manageProgressBar(1000);     
    // playBeep();


    const input = wordInputField.value.trim();
    let correctAnswer = examples[exampleIndex].answer;
    
    if (input.toLowerCase() === correctAnswer.toLowerCase()) {
        wordInputField.style.backgroundColor = 'lightgreen';
        wordInputField.style.borderColor = 'green';
        prompt.innerHTML = `Correct, the answer was <span style="color: green;">${correctAnswer}</span>`;
        // roundCount++;
        updateTaskProgressBar();  
        manageProgressBar(1000);
        clearTimeout(timeoutId);
    } else {
        wordInputField.style.backgroundColor = 'lightcoral';
        wordInputField.style.borderColor = 'lightcoral';
        prompt.innerHTML = `Incorrect, the answer was <span style="color: lightcoral;">${correctAnswer}</span>`;
        // roundCount++;
        updateTaskProgressBar();  
        manageProgressBar(1000);
        clearTimeout(timeoutId); // stop countdown
    }
    setTimeout(() => {
        if (++exampleIndex < examples.length) {
            // move to the next example
            prompt.textContent = 'Enter the word that best goes with the following: ';
            prompt.textContent += examples[exampleIndex].cue;
            correctAnswer = examples[exampleIndex].answer;
            wordInputField.value = '';
            wordInputField.style.backgroundColor = 'white';
            if (roundCount < totalRounds) {
                updateRoundProgressBar(taskType === 'number' ? 1000 : 15000);
                timeoutId = setTimeout(handleTimeout, taskType === 'number' ? 1010 : 15010); // Ensure round times out if no input
            }
                
        } else {
            // all examples are done, show start word task button
            wordInputField.style.visibility = 'hidden';
            wordInputField.value = '';
            wordInputField.style.backgroundColor = 'white';
            submitButton.style.visibility = 'hidden';
            startWordTaskButton.style.display = 'block'; // now show start button to begin the actual task
            prompt.style.visibility = 'hidden';
        }
    }, 2000); // display correct answer for 3 seconds
}
})

