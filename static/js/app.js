document.addEventListener('DOMContentLoaded', function () {
    formSubscribe();
    inputSubscribe();
    logoutSubscribe();
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function formSubscribe() {
    const form = document.querySelector('.login-form');
    if (form === null) {
        return;
    }
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const csrfToken = getCookie('csrftoken');

        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Accept': 'application/json',
                },
                mode: 'same-origin',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                removeBodyElements();
                createChatElements();
                inputSubscribe();
                logoutSubscribe();
            } else {
                messageDiv.innerHTML = "<p style='color: red'>" + data.message + "</p>";
            }
        } catch (error) {
            messageDiv.innerHTML = "<p style='color: red'>Произошла ошибка!</p>";
            console.error('Ошибка:', error);
        }
    });
}

function removeBodyElements() {
    document.body.innerHTML = "";
}

function createChatElements() {
    const body = document.body;
    const container = document.createElement('div');
    container.classList.add('container');
    container.classList.add('messenger-container');
    body.appendChild(container);

    const sidebar = document.createElement('div');
    sidebar.classList.add('sidebar');
    container.appendChild(sidebar);

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    sidebar.appendChild(avatar);

    const avatarImage = document.createElement('img');
    avatarImage.src = "/static/images/avatar.jpg";
    avatarImage.alt = "Аватар";
    avatar.appendChild(avatarImage);

    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');
    avatar.appendChild(dropdownMenu);

    const logoutButton = document.createElement('button');
    logoutButton.classList.add('dropdown-item');
    logoutButton.classList.add('logout');
    logoutButton.textContent = 'Выйти';
    dropdownMenu.appendChild(logoutButton);

    const h3 = document.createElement('h3');
    h3.classList.add('h3');
    h3.textContent = `Беседы`;
    sidebar.appendChild(h3);

    const chatList = document.createElement('div');
    chatList.classList.add('chat-list');
    sidebar.appendChild(chatList);

    const numberOfChats = 4;
    for (let i = 1; i <= numberOfChats; i++) {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        chatItem.textContent = `Чат ${i}`;
        chatList.appendChild(chatItem);
    }

    const chatContainer = document.createElement('div');
    chatContainer.classList.add('chat-container');
    container.appendChild(chatContainer);

    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');
    chatContainer.appendChild(chatHeader);

    const h2 = document.createElement('h2');
    h2.classList.add('h2');
    h2.textContent = `Чат 1`;
    chatHeader.appendChild(h2);

    const chatMessages = document.createElement('div');
    chatMessages.classList.add('chat-messages');
    chatContainer.appendChild(chatMessages);

    const messageReceived = document.createElement('div');
    messageReceived.classList.add('message');
    messageReceived.classList.add('received');
    messageReceived.textContent = `Привет! Как дела?`;
    chatMessages.appendChild(messageReceived);

    const messageSent = document.createElement('div');
    messageSent.classList.add('message');
    messageSent.classList.add('sent');
    messageSent.textContent = `Привет! Все хорошо, а у тебя?`;
    chatMessages.appendChild(messageSent);

    const chatInput = document.createElement('div');
    chatInput.classList.add('chat-input');
    chatContainer.appendChild(chatInput);

    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.placeholder = 'Введите сообщение...';
    chatInput.appendChild(messageInput);

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Отправить';
    sendButton.disabled = true;
    chatInput.appendChild(sendButton);
}

function inputSubscribe() {
    const messageInput = document.querySelector('.chat-input input');
    if (messageInput === null) {
        return;
    }
    messageInput.addEventListener('input', async function () {
        const sendButton = document.querySelector('.chat-input button');
        sendButton.disabled = messageInput.value === '';
    });
}

function logoutSubscribe(){
    const logoutButton = document.querySelector('.logout');
    if (logoutButton === null) {
        return;
    }
    logoutButton.addEventListener('click', async function () {
        try {
            const response = await fetch('/api/logout/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                removeBodyElements();
                createLoginElements();
                formSubscribe();
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
}

function createLoginElements() {
    const body = document.body;
    const container = document.createElement('div');
    container.classList.add('container');
    container.classList.add('login-container');
    body.appendChild(container);

    const h2 = document.createElement('h2');
    h2.classList.add('h2');
    h2.textContent = `Вход`;
    container.appendChild(h2);

    const loginForm = document.createElement('form');
    loginForm.classList.add('login-form');
    container.appendChild(loginForm);

    const pUsername = document.createElement('p');
    loginForm.appendChild(pUsername);

    const idUsername = document.createElement('label');
    idUsername.htmlFor = 'id_username';
    idUsername.textContent = `Имя пользователя:`;
    pUsername.appendChild(idUsername);

    const username = document.createElement('input');
    username.type = 'text';
    username.name = 'username';
    username.maxLength = 150;
    username.required = true;
    username.id = 'id_username';
    pUsername.appendChild(username);

    const pPassword = document.createElement('p');
    loginForm.appendChild(pPassword);

    const idPassword = document.createElement('label');
    idPassword.htmlFor = 'id_password';
    idPassword.textContent = `Пароль:`;
    pPassword.appendChild(idPassword);

    const password = document.createElement('input');
    password.type = 'password';
    password.name = 'password';
    password.maxLength = 128;
    password.required = true;
    password.id = 'id_password';
    pPassword.appendChild(password);

    const loginButton = document.createElement('button');
    loginButton.type = 'submit';
    loginButton.classList.add('btn-login');
    loginButton.textContent = 'Войти';
    loginForm.appendChild(loginButton);

    const message = document.createElement('div');
    message.id = 'message';
    container.appendChild(message);
}