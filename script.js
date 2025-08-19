let correctCount = 0;
let wrongCount = 0;
const wrongAnswersLog = [];

let shuffleChoices = false;
let randomizeOrder = false;

const scoreEl = document.getElementById("score");
const nextBtn = document.getElementById("next");

const xmlText = document.getElementById("xml-data").textContent;
const parser = new DOMParser();
const xml = parser.parseFromString(xmlText, "text/xml");
const questions = Array.from(xml.getElementsByTagName("question"));

let questionOrder = questions.map((_, i) => i);
let currentIndex = 0;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const answerDisplay = document.getElementById("answer-display");

const questionInput = document.getElementById("question-input");
const goBtn = document.getElementById("go-btn");
const totalDisplay = document.getElementById("total-display");
totalDisplay.textContent = `/ ${questions.length}`;

const shuffleCheckbox = document.getElementById("shuffle-checkbox");
const shuffleSwitch = document.getElementById("shuffle-switch");
const startBtn = document.getElementById("start-quiz-btn");

const liveReview = document.getElementById("live-review");
const reviewList = document.getElementById("review-list");
const summaryEl = document.getElementById("final-summary");

const orderCheckbox = document.getElementById("order-checkbox");
const orderSwitch = document.getElementById("order-switch");

// ✅ Toggle switch logic for question order
orderSwitch.addEventListener("click", () => {
  const isOn = orderSwitch.classList.contains("on");
  orderSwitch.classList.toggle("on", !isOn);
  orderSwitch.classList.toggle("off", isOn);
  orderCheckbox.checked = !isOn;
  randomizeOrder = orderCheckbox.checked;
});

// ✅ Toggle switch logic for choice shuffling
shuffleSwitch.addEventListener("click", () => {
  const isOn = shuffleSwitch.classList.contains("on");
  shuffleSwitch.classList.toggle("on", !isOn);
  shuffleSwitch.classList.toggle("off", isOn);
  shuffleCheckbox.checked = !isOn;
  shuffleChoices = shuffleCheckbox.checked;
});

// ✅ Start quiz
startBtn.addEventListener("click", () => {
  shuffleChoices = shuffleCheckbox.checked;
  randomizeOrder = orderCheckbox.checked;

  questionOrder = questions.map((_, i) => i);
  if (randomizeOrder) {
    questionOrder = shuffleArray(questionOrder);
  }

  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  wrongAnswersLog.length = 0;

  hideOverlay();
  renderQuestion(currentIndex);
});

// ✅ Hide overlay
function hideOverlay() {
  document.getElementById("quiz-overlay").style.display = "none";
}

// ✅ Go to specific question number
goBtn.addEventListener("click", () => {
  const value = parseInt(questionInput.value);
  if (!isNaN(value) && value >= 1 && value <= questions.length) {
    currentIndex = value - 1;
    renderQuestion(currentIndex);
  } else {
    alert(`Please enter a number between 1 and ${questions.length}`);
  }
});

questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") goBtn.click();
});









// 📌 Pinned Questions Feature
let pinnedQuestions = JSON.parse(localStorage.getItem("pinnedQuestions") || "[]");

const pinBtn = document.getElementById("pin-btn");
const pinnedBtn = document.getElementById("start-pinned-btn");
const clearPinnedBtn = document.getElementById("clear-pinned-btn");
const pinnedCountOverlay = document.getElementById("pinned-count-overlay");
const pinnedCountBtn = document.getElementById("pinned-count-btn");

// ✅ Update counters
function updatePinnedCount() {
  pinnedCountOverlay.textContent = pinnedQuestions.length;
  pinnedCountBtn.textContent = pinnedQuestions.length;
}
updatePinnedCount();

// ✅ Pin the current question
function pinQuestion(index) {
  const actualIndex = questionOrder[index];
  if (!pinnedQuestions.includes(actualIndex)) {
    pinnedQuestions.push(actualIndex);
    localStorage.setItem("pinnedQuestions", JSON.stringify(pinnedQuestions));
    updatePinnedCount();
  }
}

// ✅ Clear pinned
clearPinnedBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all pinned questions?")) {
    pinnedQuestions = [];
    localStorage.removeItem("pinnedQuestions");
    updatePinnedCount();
  }
});

// ✅ Start pinned quiz
pinnedBtn.addEventListener("click", () => {
  if (pinnedQuestions.length === 0) {
    alert("No pinned questions yet.");
    return;
  }
	document.getElementById("quiz-title").innerHTML = "Pinned Quiz<br>LTO Driving Exam";

  questionOrder = pinnedQuestions.slice();
  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;
  wrongAnswersLog.length = 0;

  hideOverlay();
  renderQuestion(currentIndex);
});

// ✅ Attach pin button
pinBtn.addEventListener("click", () => {
  pinQuestion(currentIndex);
});

// ✅ Check if current question is pinned and update button state
function updatePinButton(index) {
  const actualIndex = questionOrder[index];
  if (pinnedQuestions.includes(actualIndex)) {
    pinBtn.classList.add("pinned");
    pinBtn.disabled = true;
  } else {
    pinBtn.classList.remove("pinned");
    pinBtn.disabled = false;
  }
}

// ✅ Attach pin button
pinBtn.addEventListener("click", () => {
  pinQuestion(currentIndex);
  updatePinButton(currentIndex);
});







// ✅ Render a question
function renderQuestion(index) {
  const actualIndex = questionOrder[index];
  const q = questions[actualIndex];
  if (!q) return;

  const text = q.getElementsByTagName("text")[0].textContent;

  let choices = Array.from(q.children)
    .filter(el => el.tagName !== "text")
    .map(el => ({
      text: el.textContent,
      correct: el.getAttribute("correct") === "true"
    }));

  if (shuffleChoices) {
    choices = shuffleArray(choices);
  }

  questionEl.textContent = text;
  questionInput.value = index + 1;
  answersEl.innerHTML = "";
  answerDisplay.textContent = "";
  nextBtn.disabled = true;

  let answered = false;
  const correctChoices = choices.filter(c => c.correct);
  const correctExpected = correctChoices.length;

  const renderedChoices = [];

  choices.forEach((choice, i) => {
    const id = `choice-${i}`;
    const wrapper = document.createElement("div");
    wrapper.classList.add("choice-wrapper");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.dataset.correct = choice.correct;

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = choice.text;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    answersEl.appendChild(wrapper);

    renderedChoices.push({ wrapper, input, label, isCorrect: choice.correct });
  });

  // ✅ Handle answer checking
  renderedChoices.forEach(({ input, wrapper, isCorrect }) => {
    input.addEventListener("change", () => {
      if (answered) return;

      const selected = renderedChoices.filter(c => c.input.checked);
      if (selected.length < correctExpected) return;

      answered = true;
      nextBtn.disabled = false;

      let allCorrect = true;

      selected.forEach(c => {
        if (c.isCorrect) {
          c.wrapper.classList.add("correct-answer");
        } else {
          c.wrapper.classList.add("wrong-answer");
          allCorrect = false;
        }
      });

      renderedChoices.forEach(c => {
        c.input.disabled = true;
        if (c.isCorrect && !c.input.checked) {
          c.wrapper.classList.add("correct-answer");
          allCorrect = false;
        }
      });

      const correctTexts = correctChoices.map(c => c.text).join(", ");
      answerDisplay.textContent = allCorrect
        ? `✅ Correct! Answer: ${correctTexts}`
        : `✅ Correct answers: ${correctTexts}`;

      if (allCorrect) {
        correctCount++;
      } else {
        wrongCount++;
        const userSelections = selected.map(c => c.label.textContent.trim());
        const correctTexts = correctChoices.map(c => c.text.trim());

        wrongAnswersLog.push({
          question: text,
          correct: correctTexts,
          selected: userSelections
        });

        // ✅ Live review
        liveReview.style.display = "block";
        const reviewItem = document.createElement("div");
        reviewItem.style.marginBottom = "20px";
        reviewItem.style.textAlign = "left";
        reviewItem.innerHTML = `
          <strong>Q${currentIndex + 1}:</strong> ${text}<br>
          <span style="color:green;">✅ Correct: ${correctTexts.join(", ")}</span><br>
          <span style="color:red;">❌ Your Answer: ${userSelections.join(", ")}</span>
        `;
        reviewList.prepend(reviewItem);
      }

      scoreEl.textContent = `✅ ${correctCount} / ❎ ${wrongCount}`;
    });
  });
	pinBtn.style.display = "inline-block";
	updatePinButton(index);

}

// ✅ Shuffle helper
function shuffleArray(array) {
  const cloned = array.slice();
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

// ✅ Final summary
function showFinalSummary() {
  const total = correctCount + wrongCount;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const message = percent === 100
    ? "🎉 Perfect score! You're ready to hit the road!"
    : percent >= 75
    ? "👍 Great job! Just a little more practice."
    : "📘 Keep studying! You'll get there.";

  liveReview.style.display = "none";
  reviewList.innerHTML = "";

  let reviewHTML = "";

  if (wrongAnswersLog.length > 0) {
    reviewHTML += `<hr><h3>🧠 Review Incorrect Answers</h3>`;
    wrongAnswersLog.forEach((item, i) => {
      reviewHTML += `
        <div style="text-align:left; margin-bottom:20px;">
          <strong>Q${i + 1}:</strong> ${item.question}<br>
          <span style="color:green;">✅ Correct: ${item.correct.join(", ")}</span><br>
          <span style="color:red;">❌ Your Answer: ${item.selected.join(", ")}</span>
        </div>
      `;
    });
  }

  summaryEl.innerHTML = `
    <hr>
    <h2>📊 Final Score Summary</h2>
    <p>✅ Correct: ${correctCount}</p>
    <p>❎ Wrong: ${wrongCount}</p>
    <p>📈 Score: ${percent}%</p>
    <p>${message}</p>
    ${reviewHTML}
  `;
  summaryEl.style.display = "block";
}

nextBtn.addEventListener("click", () => {
  if (currentIndex < questionOrder.length - 1) {
    currentIndex++;
    renderQuestion(currentIndex);
  } else {
    nextBtn.disabled = true;
    showFinalSummary();
  }
});

