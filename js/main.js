window.addEventListener("load", function() {
    //формы часового пояса и подсчёта билетов
    let timeZoneForm = document.querySelector("#timezone_form");
    let timeZoneSelect = document.querySelector("#timezone");
    let timeZone;
    let calcForm = document.querySelector("#calc_form");

    // кнопки
    let continueButton = document.querySelector("#continue_btn");
    let calcButton = document.querySelector("#calc_btn");

    //скрытые и добавляемые при необходимости текстовые блоки
    let validator = document.querySelector("#time_validator");
    let tripInfo = document.querySelector("#trip_info");
    let infoBlock = document.querySelector("#info_block");

    // значение select с маршрутом поездки в переменной
    let routePoint = document.querySelector("#route_points");
    let routePointVal = routePoint.value;

    //время отправки из A в B и лейбл к списку
    let routeTime1 = document.querySelector("#route_time_1");
    let routeTime1Label = document.querySelector("#route_time_1_label");
    //время отправки из B в A и лейбл к списку
    let routeTime2 = document.querySelector("#route_time_2");
    let routeTime2Label = document.querySelector("#route_time_2_label");

    //количество взрослых и детей
    let regularTicketsInput = document.querySelector("#inputTickets");
    let childrenTicketsInput = document.querySelector("#inputChildren");
    
    //обработчик клика по первой кнопке после выбора часового пояса
    continueButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        //часовой пояс записывается в переменную
        timeZone = timeZoneSelect.value;
        //форма скрывается и вместо неё появляется вторая
        timeZoneForm.style.display = "none";
        calcForm.style.display = "block";
        //запускается функция перевода в локальный часовой пояс для обоих селектов времени
        toLocalTime(routeTime1, timeZone);
        toLocalTime(routeTime2, timeZone);
    })

    //обработчик смены значения в поле маршрута
    routePoint.addEventListener('change', function() {
        //Каждый раз при смене направления запускается функция, возвращающая блоки с выбором времени в изначальное состояние
        //Обнуляются значения в полях количества билетов и убирается информация о прошлом заказе. 
        resetRestrictions(routeTime1.options);
        resetRestrictions(routeTime2.options);
        regularTicketsInput.value = '';
        childrenTicketsInput.value = '';
        infoBlock.style.display = "none";
        //если осталось предупреждение из-за выбранного раньше маршрута в два конца, скрывается.
        if(validator.textContent) {
            validator.textContent = "";
        }
        //значение записывается в переменную
        routePointVal = this.value;
        //в зависимости от выбранного маршрута скрывается или показывается нужный список для выбора времени
        if (routePointVal == "из A в B") {
            //через свойство стиля display список с временем отбытия показывается или скрывается
            routeTime1.style.display = "block";
            routeTime1Label.style.display = "block";
            routeTime2.style.display = "none";
            routeTime2Label.style.display = "none";
        } else if (routePointVal == "из B в A") {
            routeTime2.style.display = "block";
            routeTime2Label.style.display = "block";
            routeTime1.style.display = "none";
            routeTime1Label.style.display = "none";
        } else {
            routeTime1.style.display = "block";
            routeTime1Label.style.display = "block";
            routeTime2.style.display = "block";
            routeTime2Label.style.display = "block";
        }
    });

    //обработчик клика по кнопке расчёта
    calcButton.addEventListener("click", function(evt) {
        evt.preventDefault();

        //Каждый раз при нажатии кнопки "Рассчитать" блок с информацией о предыдущем заказе убирается,
        //чтобы он не оставался при недотсупности нового маршрута. 
        infoBlock.style.display = "none";

        //Значения полей времени
        let routeTime1Val = routeTime1.value;
        let routeTime2Val = routeTime2.value;
        //вот тут срабатывает проверка на допустимость выбранного времени в обратную сторону.
        if(routePointVal == "из A в B и обратно") {
            //вызывается функция проверки временных меток
            if(!compareTime(routeTime2Val, routeTime1Val, 50)) {
                //если выбранная временная метка отправления  в обратную сторону отличается от отправки из изначального места меньше, чем на 50 минут, показывается валидатор,
                //блокируется текущая временная метка, а пльзователь видит "Время недоступно"
                validator.textContent = "Пожалуйста, выберите другое время обратного рейса!";
                routeTime2.options[routeTime2.selectedIndex].textContent = "Время недоступно";
                routeTime2.options[routeTime2.selectedIndex].disabled = true;
            } else {
                validator.textContent = "";
            }
        } else if (routePointVal == "из B в A и обратно") {
            if(!compareTime(routeTime1Val, routeTime2Val, 50)) {
                validator.textContent = "Пожалуйста, выберите другое время обратного рейса!";
                routeTime1.options[routeTime1.selectedIndex].textContent = "Время недоступно";
                routeTime1.options[routeTime1.selectedIndex].disabled = true;
            } else {
                validator.textContent = "";
            };
        };

        //если валидатора нет (время подходит), и количество взрослых билетов введено
        if(!validator.textContent && regularTicketsInput.value) {
                infoBlock.style.display = "block";
                //определаяются переменные - количество взрослых, детей, всего пассажиров в заказе
                let ticketsAmount = +regularTicketsInput.value;
                let childrenAmount = +childrenTicketsInput.value;
                let passengersAmount = ticketsAmount + childrenAmount;

                //стоимость одного билета, которая подтягивается из data-атрибута элемента списка
                let ticketPrice = routePoint.options[routePoint.selectedIndex].getAttribute("data-price");
                //стоимость билетов всего
                let ticketsSum =  ticketsAmount * ticketPrice;
                
                //строка, которая дальше будет формироваться в разных вариантах для последующего вывода
                let string;
                string = "Вы приобрели " + passengersAmount + " билета (-ов) (из них " + childrenAmount + " детских)" +
                " по маршруту " + routePointVal + " стоимостью " + ticketsSum + " рублей." + "\n";
                string += "Это путешествие займёт у вас";

                //Время отправки и прибытия из А в B
                let startTimeAB = moment(routeTime1.value);
                let finishTimeAB = moment(routeTime1.value).add(50, "minutes");
                startTimeAB = startTimeAB.format("HH:mm");
                finishTimeAB = finishTimeAB.format("HH:mm");

                //Время отправки и прибытия из B в A
                let startTimeBA = moment(routeTime2.value);
                let finishTimeBA = moment(routeTime2.value).add(50, "minutes");
                startTimeBA = startTimeBA.format("HH:mm");
                finishTimeBA = finishTimeBA.format("HH:mm");

                //Дальнейшее формирование строки со временем туда (и обратно, если выбрано и установлено)
                if(routePointVal == "из A в B и обратно") {
                    string += " по 50 минут в одну и другую сторону.\n";
                    string += "Теплоход " + "из A в B" + " отправляется в " + startTimeAB + " , а прибудет в " +
                    finishTimeAB + ".";
                    string += " Из B в A теплоход отправится в " + startTimeBA + ", а прибудет в " + finishTimeBA + ".";

                } else if (routePointVal == "из B в A и обратно") {
                    string += " по 50 минут в одну и другую сторону.\n";
                    string += "Теплоход " + "из B в A" + " отправляется в " + startTimeBA + " , а прибудет в " +
                    finishTimeBA + ".";
                    string += " Из A в B теплоход отправится в " + startTimeAB + ", а прибудет в " + finishTimeAB + ".";
                } else if (routePointVal == "из A в B") {
                    string += " 50 минут. Теплоход отправляется в " + startTimeAB + ", а прибудет в " + finishTimeAB + ".";
                } else if (routePointVal == "из B в A") {
                    string += " 50 минут. Теплоход отправляется в " + startTimeBA + ", а прибудет в " + finishTimeBA + ".";
                }
                
                tripInfo.textContent = string;
        }
    });
});

//Функция перевода отметки времени в выбранный локальный часовой пояс, принимает массив с метками и количество часов разницы с Москвой

let toLocalTime = (select, time) => {
    //цикл для каждой временной отметки
    for (i=0; i<= select.options.length-1; i++) {
        //отметка приводится в формат библиотеки moment
        let tripTime = moment(select.options[i].value, "YYYY-MM-DD HH:mm");
        //методом библиотеки добавляется количество часов разницы
        tripTime = tripTime.add(time, "hours");
        //в value уже можно его записывать
        select.options[i].value = tripTime;
        //формат для вывода опций на странице в виде "16:25"
        tripTime = tripTime.format("HH:mm");
        //сохранение во фронтенд, мутация элементов массива
        select.options[i].text = tripTime;
    }
}

//Функция сравнения временных отметок (прошло указанное в параметре difference время, или нет)

let compareTime = (firstTimeStamp, secondTimeStamp, difference) => {
    let timeStamp = moment(firstTimeStamp);
    let timeStampToCompare = moment(secondTimeStamp);
    if(timeStamp.diff(timeStampToCompare, 'minutes') >= difference) {
        return true;
    } else {
        return false;
    }
}

//Функция возврата полей выбора времени к обычному состоянию (все доступны, у всех значения со временем)

let resetRestrictions = arr => {
    for(let i=0; i <= arr.length - 1; i++) {
        arr[i].disabled = false;
        let option = moment(arr[i].value);
        arr[i].textContent = option.format("HH:mm");
    }
}