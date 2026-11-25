
document.addEventListener("DOMContentLoaded", function () {

    // Get HTML elements
    const timerElement = document.getElementById("timer");
    const typedCountElement = document.getElementById("typed-count");
    const remainingCountElement = document.getElementById("remaining-count");

    const typingInput = document.getElementById("typing-input");
    const startButton = document.getElementById("start-btn");
    const resetButton = document.getElementById("reset-btn");

    const progressBar = document.getElementById("typing-progress");
    const statusElement = document.getElementById("test-status");
    const passageElement = document.getElementById("passage-text");

    // Stop if this page does not contain the typing test
    if (!typingInput || !passageElement) {
        return;
    }

    // Get original passage text
    const passageText = passageElement.textContent.trim();

    // Test settings
    const TEST_DURATION = 60;

    // Test variables
    let timeLeft = TEST_DURATION;
    let timerInterval = null;
    let testStarted = false;
    let testFinished = false;

    // Update character counters and progress bar
    function updateTypingProgress() {

        const typedText = typingInput.value;

        const typedCharacters = typedText.length;

        const totalCharacters = passageText.length;

        const remainingCharacters = Math.max(
            totalCharacters - typedCharacters,
            0
        );

        // Calculate progress percentage
        const progress = totalCharacters > 0
            ? Math.min((typedCharacters / totalCharacters) * 100, 100)
            : 0;

        // Update HTML
        typedCountElement.textContent = typedCharacters;

        remainingCountElement.textContent = remainingCharacters;

        progressBar.style.width = progress + "%";

        progressBar.setAttribute("aria-valuenow", progress);
    }

    // Start countdown timer
    function startTimer() {

        timerInterval = setInterval(function () {

            timeLeft--;

            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {

                finishTest("Time is over! Your test has finished.");

            }

        }, 1000);
    }

    // Start test
    function startTest() {

        if (testStarted || testFinished) {
            return;
        }

        testStarted = true;

        typingInput.disabled = false;

        typingInput.focus();

        startButton.disabled = true;

        statusElement.textContent = "Test started! Keep typing.";

        statusElement.className = "text-success mt-3 mb-0";

        startTimer();
    }

    // Finish test
    function finishTest(message) {

        if (testFinished) {
            return;
        }

        testFinished = true;

        clearInterval(timerInterval);

        typingInput.disabled = true;

        startButton.disabled = true;

        statusElement.textContent = message;

        statusElement.className = "text-primary mt-3 mb-0";
    }

    // Reset test
    function resetTest() {

        clearInterval(timerInterval);
        
        timeLeft = TEST_DURATION;
        testStarted = false;
        testFinished = false;
        
        typingInput.value = "";
        typingInput.disabled = true;
        
        startButton.disabled = false;
        
        timerElement.textContent = TEST_DURATION;
        
        statusElement.textContent = "Click Start Test to begin.";
        statusElement.className = "text-muted mt-3 mb-0";
        
        updateTypingProgress();
    }
    // Listen for typing
    typingInput.addEventListener("input", function () {

        if (!testStarted || testFinished) {
            return;
        }

        updateTypingProgress();

        // Finish when the full passage is typed correctly
        if (typingInput.value === passageText) {

            finishTest("Excellent! You completed the passage.");

        }
    });

    // Button events
    startButton.addEventListener("click", startTest);

    resetButton.addEventListener("click", resetTest);

    // Initial page setup
    resetTest();

});
