let score = 0;
let totalAnswered = 0;
const scoreEl = document.getElementById("score");

const xmlText = document.getElementById("xml-data").textContent;
const parser = new DOMParser();
const xml = parser.parseFromString(xmlText, "text/xml");
const questions = Array.from(xml.getElementsByTagName("question"));
let currentIndex = 0;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const counterEl = document.getElementById("counter");
const answerDisplay = document.getElementById("answer-display");

function renderQuestion(index) {
  const q = questions[index];
  const text = q.getElementsByTagName("text")[0].textContent;
  const choices = Array.from(q.children).filter(el => el.tagName !== "text");

  questionEl.textContent = text;
  counterEl.textContent = `${index + 1} / ${questions.length}`;
  answersEl.innerHTML = "";
  answerDisplay.textContent = "";

  let answered = false;

  choices.forEach((choice, i) => {
    const id = `choice-${i}`;
    const isCorrect = choice.getAttribute("correct") === "true";

    const wrapper = document.createElement("div");
    wrapper.classList.add("choice-wrapper");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.id = id;
    input.dataset.correct = isCorrect;

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = choice.textContent;

    input.addEventListener("change", () => {
      if (answered) return;
      answered = true;
	  totalAnswered++;
		if (isCorrect) score++;
		scoreEl.textContent = `Score: ${score} / ${totalAnswered}`;


      document.querySelectorAll('input[name="answer"]').forEach(el => el.disabled = true);
      document.querySelectorAll(".choice-wrapper").forEach(div => {
        div.classList.remove("correct-answer", "wrong-answer");
      });

      if (isCorrect) {
        wrapper.classList.add("correct-answer");
        answerDisplay.textContent = `Correct: ${choice.textContent}`;
      } else {
        wrapper.classList.add("wrong-answer");
        const correctChoice = choices.find(c => c.getAttribute("correct") === "true");
        const correctIndex = choices.indexOf(correctChoice);
        const correctWrapper = answersEl.children[correctIndex];
        correctWrapper.classList.add("correct-answer");
        answerDisplay.textContent = `Correct: ${correctChoice.textContent}`;
      }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    answersEl.appendChild(wrapper);
  });
}

document.getElementById("next").addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion(currentIndex);
  }
});

renderQuestion(currentIndex);
