'use strict'

const main = document.getElementsByTagName('main')[0];
const selection = document.getElementsByClassName('selection')[0];
const title = document.getElementsByClassName('main__title')[0];

const getData = () => {
    //промис
    return fetch('db/quiz_db.json').then(response => response.json());
};

const hideElem = elem => {

let opacity = getComputedStyle(elem).getPropertyValue('opacity');

const animation = () => {
opacity -= 0.05;
elem.style.opacity = opacity;

if (opacity > 0 ) {
    requestAnimationFrame(animation)
}
else {
    elem.style.display = 'none';
}
};

requestAnimationFrame(animation);

};

const renderTheme = data => {
 
    const list = document.getElementsByClassName('selection__list')[0];
   list.textContent = '';

   const buttons = [];

   for(let i = 0; i < data.length; i++) {
      const li = document.createElement('li');
       li.className = 'selection__item';

       const button = document.createElement('button');

       button.className= 'selection__theme';
       button.dataset.id = data[i].id;
       button.textContent = data[i].theme;

       li.append(button);
       list.append(li);
       buttons.push(button);

    }

    return buttons;

};

//Метод генерации случайной перестановки Фишера-Йетса
//проходит по массиву в обратном порядке и меняет элемент со случайным элементом перед ним

const shuffle = array => {

    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        //деструктуризация
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];

    }

    return newArray;

}

const createKeyAnswers = data => {

    const keys = [];

    for(let i = 0; i < data.answers.length; i++) {

        if (data.type === 'radio') {

            keys.push([data.answers[i], !i]);
        } else {

            keys.push([data.answers[i], i < data.correct]);
        }
    }

    return shuffle(keys); //перемешиваем ответы
};

const createAnswer = data => {

    const type = data.type;
    const answers = createKeyAnswers(data);

    const labels = answers.map((item, i) => {
        const label = document.createElement('label');
        label.className = 'answer';
        const input = document.createElement('input');
        input.type = type;
        input.className = `answer__${type}`;
        input.name = 'answer';

        input.value = i;

        const text = document.createTextNode(item[0]);

        label.append(input, text);

        return label;

    });

    const keys = answers.map(answer => answer[1]);

    return {
        labels, keys
    }
};

const showResult = (result, quiz) => {

    const block = document.createElement('div');
    block.className = 'main__box main_box_result result';

    //высчитываем проценты

    const percent = result / quiz.list.length * 100;

    let ratio = 0;

    console.log('quiz.list.length', quiz.list.length);
    console.log('percent', percent);



    for (let i = 0; i < quiz.list.length; i++) {


        console.log('quiz.result[i][0]', quiz.result[i][0]);
        if (percent >= quiz.result[i][0]) ratio = i;
        
    }

    block.innerHTML = `
        <h2 class="main__subtitle main__subtitle_result">Ваш результат</h2>

            <div class="result__box">
                <p class="result__ratio result__ratio_${ratio + 1}">${result}/${quiz.list.length}</p>
                <p class="result__text">${quiz.result[ratio][1]}</p>
            </div>`;


    const button = document.createElement('button');
    button.className = 'main__btn result__return';
    button.textContent = 'К списку квизов';

    block.append(button);
    main.append(block);

};

const renderQuiz = quiz => {

    hideElem(title);
    hideElem(selection);

    const questionBox = document.createElement('div');
    questionBox.className = 'main__box main__box-question';

    main.append(questionBox);

    let questionCount = 0;
    let result = 0;

    const sowQuestion = () => {
        const data = quiz.list[questionCount];
        questionCount++;

        questionBox.textContent = '';

        const form = document.createElement('form');
        form.className = 'main__form-question';
        form.dataset.count = `${questionCount}/${quiz.list.length}`;


        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.className = 'main__subtitle';
        legend.textContent = data.question;

        const answersData = createAnswer(data);

        const button = document.createElement('button');
        button.className = 'main__btn question__next';
        button.type = 'submit';
        button.textContent = 'Подтвердить';
    

        fieldset.append(legend, ...answersData.labels);
        form.append(fieldset, button);

        questionBox.append(form);


        form.addEventListener('submit', event => {

            event.preventDefault();

            let ok = false;

           const answer = [...form.answer].map(input => {

                if (input.checked) ok = true;
                return input.checked ? input.value : false;

            });

            if (ok) {

         if ( answer.every((result, i) => !!result === answersData.keys[i]) ) {

            result++;

         }

                if (questionCount < quiz.list.length) {

                    sowQuestion();  

                } else {

                    hideElem(questionBox);
                    showResult(result, quiz);

                }
              
            } else {
               
                form.classList.add('main__form-question_error');

                setTimeout(() => {
                    form.classList.remove('main__form-question_error');
                }, 1000)
            }
        });
        };
    sowQuestion();
};

const addClick = (buttons, data) => {
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const quiz = data.find(item => item.id === btn.dataset.id);
          renderQuiz(quiz);
        })
    });
};

const initQuiz = async () => {

    const data = await getData(); //data getting from database

   const buttons = renderTheme(data); // data rendering

   addClick(buttons, data);
};

initQuiz();