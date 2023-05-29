document.addEventListener('DOMContentLoaded', () => {
	// Navbar elements
	const menu_icon = document.querySelector('.menu-icon');
	const menu = document.querySelector('.menu');

	// Quiz search options
	const quiz_search_select = document.querySelector('#quiz-search-options');
	const search_query = document.querySelector('#search_query');

	// Live quiz
	const message = document.querySelector('.message');
	const participant_name = document.querySelector('#participant-name');
	const live_question = document.querySelector('.live-question');
	const timer = document.querySelector('#question-timer');
	const choice_a = document.querySelector('#a');
	const choice_b = document.querySelector('#b');
	const choice_c = document.querySelector('#c');
	const choice_d = document.querySelector('#d');

	// Edit quiz section
	const questions = document.querySelectorAll('.question');
	const question_text = document.querySelector('#question');
	const option_a = document.querySelector('#choice_a');
	const option_b = document.querySelector('#choice_b');
	const option_c = document.querySelector('#choice_c');
	const option_d = document.querySelector('#choice_d');
	const answer_key = document.querySelector('#answer_key');
	const points = document.querySelector('#points');
	const seconds = document.querySelector('#seconds');
	const reset_question_icon = document.querySelector('#reset-question-form');
	const question_form = document.querySelector('.question-form');
	const add_question_btn = document.querySelector('#add-question');
	const edit_question_btn = document.querySelector('#edit-question');
	const delete_question_btn = document.querySelector('#delete-question');
	const delete_quiz_btn = document.querySelector('#delete-quiz');
	const modal = document.querySelector('.modal');
	const confirm = document.querySelector('#confirm');
	const cancel = document.querySelector('#cancel');

	if (live_question) {
		const question = live_question.dataset.question;

		// check there is an active question and it has not been answered by the participant yet
		if (
			question !== '' &&
			localStorage.getItem(`question-${question}`) === null
		) {
			message.classList.toggle('message-hidden');
			live_question.classList.toggle('hidden');
			const live_quiz = document.querySelector('#live-quiz');
			live_quiz.style.background = '#f9f7f7';

			window.addEventListener('load', () => {
				if (!localStorage.getItem('countdown')) {
					countdown(timer.dataset.time, timer);
					localStorage.setItem('countdown', 'true');
				} else {
					// submit answer with score 0
					submit_answer(
						'',
						parseInt(timer.textContent),
						parseInt(live_question.dataset.pin),
						live_question.dataset.participant
					);
				}
			});
		} else {
			live_question.style.display = 'none';
		}
	}

	// Event Handlers
	menu_icon.addEventListener('click', () => {
		menu_icon.classList.toggle('active-menu');
		menu.classList.toggle('hidden');
	});

	if (quiz_search_select) {
		quiz_search_select.addEventListener('change', () => {
			document.location.href = quiz_search_select.value;
		});
	}

	if (choice_a) {
		choice_a.addEventListener('click', () =>
			submit_answer(
				'A',
				parseInt(timer.textContent),
				parseInt(live_question.dataset.pin),
				live_question.dataset.participant
			)
		);
	}

	if (choice_b) {
		choice_b.addEventListener('click', () =>
			submit_answer(
				'B',
				parseInt(timer.textContent),
				parseInt(live_question.dataset.pin),
				live_question.dataset.participant
			)
		);
	}

	if (choice_c) {
		choice_c.addEventListener('click', () =>
			submit_answer(
				'C',
				parseInt(timer.textContent),
				parseInt(live_question.dataset.pin),
				live_question.dataset.participant
			)
		);
	}

	if (choice_d) {
		choice_d.addEventListener('click', () =>
			submit_answer(
				'D',
				parseInt(timer.textContent),
				parseInt(live_question.dataset.pin),
				live_question.dataset.participant
			)
		);
	}

	questions.forEach((selected_question) => {
		selected_question.addEventListener('click', () => {
			const question_id = selected_question.dataset.question;
			question_details(question_id);
			add_question_btn.classList.add('hidden');
			edit_question_btn.classList.remove('hidden');
			delete_question_btn.classList.remove('hidden');
			edit_question_btn.addEventListener('click', () => {
				this.preventDefault;
				edit_question(question_id);
			});
			delete_question_btn.addEventListener('click', () => {
				this.preventDefault;
				delete_question(question_id);
			});
		});
	});

	reset_question_icon.addEventListener('click', () => {
		this.preventDefault;
		question_form.reset();
		add_question_btn.classList.remove('hidden');
		edit_question_btn.classList.add('hidden');
		delete_question_btn.classList.add('hidden');
	});

	delete_quiz_btn.addEventListener('click', (e) => {
		e.preventDefault();
		modal.showModal();
	});

	cancel.addEventListener('click', () => {
		modal.close();
	});

	confirm.addEventListener('click', () => delete_quiz(modal.dataset.quiz));

	// Functions

	function countdown(sec, display) {
		let countdown = setInterval(() => {
			if (sec > 0) {
				display.textContent = --sec + ' sec';
			} else {
				// submit answer with score 0
				clearInterval(countdown);
				submit_answer(
					'',
					parseInt(timer.textContent),
					parseInt(live_question.dataset.pin),
					live_question.dataset.participant
				);
			}
		}, 1000);
	}

	function submit_answer(key, seconds, pin, participant) {
		console.log('key', key);
		console.log('seconds', seconds);
		console.log('pin', pin);
		console.log('participant', participant);

		fetch(`/live-quiz/${pin}/${participant}`, {
			method: 'POST',
			body: JSON.stringify({
				answer: key,
				seconds: seconds,
			}),
			headers: { 'X-CSRFToken': getCookie('csrftoken') },
		}).then(() => {
			// clear countdown from localstorage
			localStorage.removeItem('countdown');

			// add answered question to list of answered questions
			localStorage.setItem(
				`question-${live_question.dataset.question}`,
				'true'
			);

			document.location.href = `/live-quiz/${pin}/${participant}`;
		});
	}

	function getCookie(name) {
		let cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			const cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
				const cookie = cookies[i].trim();
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === name + '=') {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}

	function question_details(question) {
		fetch(`/question/${question}`)
			.then((response) => response.json())
			.then((question) => {
				question_text.value = question.question;
				option_a.value = question.choice_A;
				option_b.value = question.choice_B;
				option_c.value = question.choice_C;
				option_d.value = question.choice_D;
				answer_key.value = question.answer_key;
				points.value = question.points;
				seconds.value = question.seconds;
			});
	}

	function edit_question(question) {
		fetch(`/question/${question}`, {
			method: 'PUT',
			body: JSON.stringify({
				question_text: question_text.value,
				option_a: option_a.value,
				option_b: option_b.value,
				option_c: option_c.value,
				option_d: option_d.value,
				answer_key: answer_key.value,
				points: points.value,
				seconds: seconds.value,
			}),
			headers: { 'X-CSRFToken': getCookie('csrftoken') },
		});
	}

	function delete_question(question) {
		fetch(`/question/${question}`, {
			method: 'DELETE',
			headers: { 'X-CSRFToken': getCookie('csrftoken') },
		});
	}

	function delete_quiz(quiz) {
		modal.close();
		fetch(`/delete-quiz/${quiz}`, {
			method: 'DELETE',
			headers: { 'X-CSRFToken': getCookie('csrftoken') },
		}).then(() => {
			document.location.href = '/account/host';
		});
	}
});
