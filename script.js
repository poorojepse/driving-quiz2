		let correctCount = 0;
		let wrongCount = 0;
		const wrongAnswersLog = [];
		const scoreEl = document.getElementById("score");
		const nextBtn = document.getElementById("next"); // ✅ Declare once globally

		const xmlText = document.getElementById("xml-data").textContent;
		const parser = new DOMParser();
		const xml = parser.parseFromString(xmlText, "text/xml");
		const questions = Array.from(xml.getElementsByTagName("question"));
		let currentIndex = 0;

		const questionEl = document.getElementById("question");
		const answersEl = document.getElementById("answers");
		const counterEl = document.getElementById("counter");
		const answerDisplay = document.getElementById("answer-display");

		const questionInput = document.getElementById("question-input");
		const goBtn = document.getElementById("go-btn");
		const totalDisplay = document.getElementById("total-display");
		totalDisplay.textContent = `/ ${questions.length}`;


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

		function renderQuestion(index) {
		  const q = questions[index];
		  if (!q) return;

		  const text = q.getElementsByTagName("text")[0].textContent;
		  const choices = Array.from(q.children).filter(el => el.tagName !== "text");

		  questionEl.textContent = text;
		  questionInput.value = index + 1;
		  answersEl.innerHTML = "";
		  answerDisplay.textContent = "";

		  let answered = false;

		  nextBtn.disabled = true; // 🔒 Disable Next button at start

		  choices.forEach((choice, i) => {
			const id = `choice-${i}`;
			const isCorrect = choice.getAttribute("correct") === "true";

			const wrapper = document.createElement("div");
			wrapper.classList.add("choice-wrapper");

			const input = document.createElement("input");
			input.type = "checkbox";
			input.id = id;
			input.dataset.correct = isCorrect;

			const label = document.createElement("label");
			label.htmlFor = id;
			label.textContent = choice.textContent;

			input.addEventListener("change", () => {
				if (answered) return;

				const selectedInputs = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
				const selectedCount = selectedInputs.length;

				// Wait until user selects all correct answers
				const correctChoices = choices.filter(c => c.getAttribute("correct") === "true");
				const correctExpected = correctChoices.length;

				if (selectedCount < correctExpected) return;


				answered = true;
				nextBtn.disabled = false;

				let allCorrect = true;

				selectedInputs.forEach(input => {
				const isCorrect = input.dataset.correct === "true";
				const wrapper = input.closest(".choice-wrapper");

				if (isCorrect) {
				  wrapper.classList.add("correct-answer");
				} else {
				  wrapper.classList.add("wrong-answer");
				  allCorrect = false;
				}
			  });

			  // Highlight missed correct answers
			  choices.forEach((choice, i) => {
				const isCorrect = choice.getAttribute("correct") === "true";
				const wrapper = answersEl.children[i];
				const input = wrapper.querySelector("input");

				input.disabled = true;

				if (isCorrect && !input.checked) {
				  wrapper.classList.add("correct-answer");
				  allCorrect = false;
				}
			  });

			const correctTexts = correctChoices.map(c => c.textContent).join(", ");
			answerDisplay.textContent = allCorrect
			  ? `✅ Correct! Answer: ${correctTexts}`
			  : `✅ Correct answers: ${correctTexts}`;

			if (allCorrect) {
			  correctCount++;
			} else {
			  wrongCount++;
			}
			if (!allCorrect) {
			  const userSelections = selectedInputs.map(input => input.nextSibling.textContent.trim());
			  const correctTexts = correctChoices.map(c => c.textContent.trim());

			  wrongAnswersLog.push({
				question: text,
				correct: correctTexts,
				selected: userSelections
			  });
			}

			  scoreEl.textContent = `✅ ${correctCount} / ❎ ${wrongCount}`;
			});


			wrapper.appendChild(input);
			wrapper.appendChild(label);
			answersEl.appendChild(wrapper);
		  });
		}
		
		function showFinalSummary() {
		  const total = correctCount + wrongCount;
		  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
		  const message = percent === 100
			? "🎉 Perfect score! You're ready to hit the road!"
			: percent >= 75
			? "👍 Great job! Just a little more practice."
			: "📘 Keep studying! You'll get there.";

		  const summaryEl = document.getElementById("final-summary");
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
		  if (currentIndex < questions.length - 1) {
			currentIndex++;
			renderQuestion(currentIndex);
		  } else {
			nextBtn.disabled = true;
			showFinalSummary();
		  }
		});


		renderQuestion(currentIndex); // ✅ Initial render