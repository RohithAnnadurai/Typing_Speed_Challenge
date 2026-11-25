
document.addEventListener("DOMContentLoaded", function () {
    const timerElement = document.getElementById("timer");
    const typedCountElement = document.getElementById("typed-count");
    const remainingCountElement = document.getElementById("remaining-count");
    const typingInput = document.getElementById("typing-input");
    const startButton = document.getElementById("start-btn");
    const resetButton = document.getElementById("reset-btn");
    const tryAgainButton = document.getElementById("try-again-btn");
    const progressBar = document.getElementById("typing-progress");
    const statusElement = document.getElementById("test-status");
    const passageElement = document.getElementById("passage-text");
    const resultCard = document.getElementById("result-card");
    const resultWpm = document.getElementById("result-wpm");
    const resultAccuracy = document.getElementById("result-accuracy");
    const resultTime = document.getElementById("result-time");
    const resultCorrect = document.getElementById("result-correct");
    const resultIncorrect = document.getElementById("result-incorrect");
    const saveStatus = document.getElementById("save-status");

    if (!typingInput || !passageElement) {
        return;
    }

    const passageText = passageElement.textContent.trim();
    const passageId = passageElement.dataset.passageId;
    const saveUrl = passageElement.dataset.saveUrl;
    const csrfToken = document.querySelector(
        "#csrf-form [name=csrfmiddlewaretoken]"
    ).value;

    const TEST_DURATION = 60;

    let timeLeft = TEST_DURATION;
    let timerInterval = null;
    let testStarted = false;
    let testFinished = false;

    function updateTypingProgress() {
        const typedText = typingInput.value;
        const typedCharacters = typedText.length;
        const totalCharacters = passageText.length;

        const remainingCharacters = Math.max(
            totalCharacters - typedCharacters,
            0
        );

        const progress = totalCharacters > 0
            ? Math.min(
                (typedCharacters / totalCharacters) * 100,
                100
            )
            : 0;

        typedCountElement.textContent = typedCharacters;
        remainingCountElement.textContent = remainingCharacters;
        progressBar.style.width = progress + "%";
        progressBar.setAttribute("aria-valuenow", progress);
    }

    function calculateResults() {
        const typedText = typingInput.value;
        let correctCharacters = 0;

        for (let i = 0; i < typedText.length; i++) {
            if (
                i < passageText.length &&
                typedText[i] === passageText[i]
            ) {
                correctCharacters++;
            }
        }

        const totalTypedCharacters = typedText.length;
        const incorrectCharacters =
            totalTypedCharacters - correctCharacters;

        const elapsedSeconds = Math.max(
            TEST_DURATION - timeLeft,
            1
        );

        const elapsedMinutes = elapsedSeconds / 60;

        const wpm = Math.round(
            (correctCharacters / 5) / elapsedMinutes
        );

        const accuracy = totalTypedCharacters > 0
            ? (correctCharacters / totalTypedCharacters) * 100
            : 0;

        return {
            wpm: wpm,
            accuracy: accuracy.toFixed(2),
            correctCharacters: correctCharacters,
            incorrectCharacters: incorrectCharacters,
            elapsedSeconds: elapsedSeconds
        };
    }

    async function saveTypingResult(results) {
        saveStatus.textContent = "Saving your result...";
        saveStatus.className = "text-muted mt-3";

        try {
            const response = await fetch(saveUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({
                    passage_id: passageId,
                    typed_text: typingInput.value,
                    duration: results.elapsedSeconds
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to save result."
                );
            }

            saveStatus.textContent = "Result saved successfully!";
            saveStatus.className = "text-success mt-3 fw-bold";

        } catch (error) {
            saveStatus.textContent =
                "Error saving result: " + error.message;

            saveStatus.className = "text-danger mt-3";

            console.error("Save result error:", error);
        }
    }

    function displayResults() {
        const results = calculateResults();

        resultWpm.textContent = results.wpm;
        resultAccuracy.textContent = results.accuracy + "%";
        resultTime.textContent = results.elapsedSeconds + " sec";
        resultCorrect.textContent = results.correctCharacters;
        resultIncorrect.textContent = results.incorrectCharacters;

        resultCard.classList.remove("d-none");

        saveTypingResult(results);
    }

    function startTimer() {
        timerInterval = setInterval(function () {
            timeLeft--;

            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                finishTest("Time is over! Your test has finished.");
            }
        }, 1000);
    }

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

        displayResults();
    }

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

        saveStatus.textContent =
            "Your result will be saved after the test.";

        saveStatus.className = "text-muted mt-3";

        resultCard.classList.add("d-none");

        updateTypingProgress();
    }

    typingInput.addEventListener("input", function () {
        if (!testStarted || testFinished) {
            return;
        }

        updateTypingProgress();

        if (typingInput.value === passageText) {
            finishTest("Excellent! You completed the passage.");
        }
    });

    startButton.addEventListener("click", startTest);
    resetButton.addEventListener("click", resetTest);

    if (tryAgainButton) {
        tryAgainButton.addEventListener("click", resetTest);
    }

    resetTest();
});
