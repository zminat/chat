document.addEventListener('DOMContentLoaded', function () {
    loginFormSubscribe();
    signupLinkSubscribe();
    logoutSubscribe();
    newChatSubscribe();
    inputSubscribe();
    chatItemsSubscribe();
    initializeChat();
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

function loginFormSubscribe() {
    const form = document.querySelector('.login-form');
    if (form === null) {
        return;
    }
    const infoDiv = document.querySelector('.info');

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
                await fillChatList();
            } else {
                infoDiv.innerHTML = "<p style='color: red'>" + data.message + "</p>";
            }
        } catch (error) {
            infoDiv.innerHTML = "<p style='color: red'>Произошла ошибка!</p>";
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

    const createChatDiv = document.createElement('div');
    createChatDiv.classList.add('create-chat');
    sidebar.appendChild(createChatDiv);

    const createChatImage = document.createElement('img');
    createChatImage.src = "/static/images/create-chat-icon.png";
    createChatImage.alt = "Создать беседу";
    createChatDiv.appendChild(createChatImage);

    const h3 = document.createElement('h3');
    h3.classList.add('h3');
    h3.textContent = `Беседы`;
    sidebar.appendChild(h3);

    const chatList = document.createElement('div');
    chatList.classList.add('chat-list');
    sidebar.appendChild(chatList);

    const chatContainer = document.createElement('div');
    chatContainer.classList.add('chat-container');
    container.appendChild(chatContainer);

    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');
    chatContainer.appendChild(chatHeader);

    const h2 = document.createElement('h2');
    h2.classList.add('h2');
    h2.textContent = 'Чат 1';
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

async function fillChatList(){
    try {
        const response = await fetch('/api/chatlist/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        if (data.success) {
            createChatItems(data.rooms);
            chatItemsSubscribe();
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
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

function logoutSubscribe() {
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
                loginFormSubscribe();
                signupLinkSubscribe();
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

    const signupDiv = document.createElement('div');
    signupDiv.classList.add('signup-link')
    container.appendChild(signupDiv);

    const pSignup = document.createElement('p');
    pSignup.textContent = 'Нет аккаунта?';
    signupDiv.appendChild(pSignup);

    const aSignup = document.createElement('a');
    aSignup.href = '#';
    aSignup.textContent = 'Регистрация';
    signupDiv.appendChild(aSignup);

    const info = document.createElement('div');
    info.classList.add('info');
    container.appendChild(info);
}

function signupLinkSubscribe() {
    const signupLink = document.querySelector('.signup-link a');
    if (signupLink === null) {
        return;
    }
    signupLink.addEventListener('click', async function (event) {
        event.preventDefault();
        removeBodyElements();
        createSignupElements();
        signupFormSubscribe();
    });
}

function createSignupElements() {
    const body = document.body;
    const container = document.createElement('div');
    container.classList.add('container');
    container.classList.add('signup-container');
    body.appendChild(container);

    const h2 = document.createElement('h2');
    h2.classList.add('h2');
    h2.textContent = `Регистрация`;
    container.appendChild(h2);

    const signupForm = document.createElement('form');
    signupForm.classList.add('signup-form');
    container.appendChild(signupForm);

    const pUsername = document.createElement('p');
    signupForm.appendChild(pUsername);

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
    signupForm.appendChild(pPassword);

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

    const pPasswordCheck = document.createElement('p');
    signupForm.appendChild(pPasswordCheck);

    const idPasswordCheck = document.createElement('label');
    idPasswordCheck.htmlFor = 'id_password_check';
    idPasswordCheck.textContent = `Подтвердите пароль:`;
    pPasswordCheck.appendChild(idPasswordCheck);

    const passwordCheck = document.createElement('input');
    passwordCheck.type = 'password';
    passwordCheck.name = 'password_check';
    passwordCheck.maxLength = 128;
    passwordCheck.required = true;
    passwordCheck.id = 'id_password_check';
    pPasswordCheck.appendChild(passwordCheck);

    const signupButton = document.createElement('button');
    signupButton.type = 'submit';
    signupButton.classList.add('btn-signup');
    signupButton.textContent = 'Зарегистрироваться';
    signupForm.appendChild(signupButton);

    const info = document.createElement('div');
    info.classList.add('info');
    container.appendChild(info);
}

function signupFormSubscribe() {
    const form = document.querySelector('.signup-form');
    if (form === null) {
        return;
    }
    const infoDiv = document.querySelector('.info');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const csrfToken = getCookie('csrftoken');

        try {
            const response = await fetch('/api/signup/', {
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
                newChatSubscribe();
                await fillChatList();
            } else {
                infoDiv.innerHTML = "<p style='color: red'>" + data.message + "</p>";
            }
        } catch (error) {
            infoDiv.innerHTML = "<p style='color: red'>Произошла ошибка!</p>";
            console.error('Ошибка:', error);
        }
    });
}

function newChatSubscribe() {
    const createNewChatDiv = document.querySelector('.create-chat');
    if (createNewChatDiv === null) {
        return;
    }
    createNewChatDiv.addEventListener('click', async function () {
        try {
            const response = await fetch('/api/userlist/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                createNewChatElements(data.users);
                closeCreateNewChatSubscribe();
                createNewChatFormSubscribe();
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
}

function createNewChatElements(users) {
    const body = document.body;
    const modal = document.createElement('div');
    modal.classList.add('modal');
    body.appendChild(modal);

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modal.appendChild(modalContent);

    const closeModal = document.createElement('span');
    closeModal.classList.add('close');
    closeModal.innerHTML = '&times;';
    modalContent.appendChild(closeModal);

    const h3 = document.createElement('h3');
    h3.classList.add('h2');
    h3.textContent = `Создать новую беседу`;
    modalContent.appendChild(h3);

    const createChatForm = document.createElement('form');
    createChatForm.classList.add('create-chat-form');
    modalContent.appendChild(createChatForm);

    const selectUsersLabel = document.createElement('label');
    selectUsersLabel.htmlFor =  'users';
    selectUsersLabel.textContent = 'Выберите пользователей:';
    createChatForm.appendChild(selectUsersLabel);

    const userList = document.createElement('div');
    userList.classList.add('user-list');
    createChatForm.appendChild(userList);

    for (let user of users){
        const userItem = document.createElement('div');
        userItem.classList.add('user-item');
        userList.appendChild(userItem);

        const userItemCheckbox = document.createElement('input');
        userItemCheckbox.type = 'checkbox';
        userItemCheckbox.name = 'users';
        userItemCheckbox.value = user.id;
        userItem.appendChild(userItemCheckbox);

        const userItemLabel = document.createElement('label');
        userItemLabel.htmlFor = user.id;
        userItemLabel.textContent = user.username;
        userItem.appendChild(userItemLabel);
    }

    const createChatFormButton = document.createElement('button');
    createChatFormButton.type = 'submit';
    createChatFormButton.classList.add('btn-create-chat');
    createChatFormButton.textContent = 'Создать беседу';
    createChatForm.appendChild(createChatFormButton);
}

function closeCreateNewChatSubscribe() {
    const closeModal = document.querySelector('.close');
    closeModal.addEventListener('click', closeCreateNewChat);
}

function closeCreateNewChat() {
    const modal = document.querySelector('.modal');
    modal.remove();
}

function createNewChatFormSubscribe() {
    const form = document.querySelector('.create-chat-form');
    if (form === null) {
        return;
    }
    // const infoDiv = document.querySelector('.info');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const csrfToken = getCookie('csrftoken');

        try {
            const response = await fetch('/api/createchat/', {
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
                closeCreateNewChat();
                const chatItem = createNewChatItem(data.room);
                chatItemsSubscribe(chatItem);
                console.log('Success');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
}

function createChatItems(rooms) {
    const chatList = document.querySelector('.chat-list');
    for (let room of rooms) {
        const chatRoom = createChatItem(room);
        chatList.append(chatRoom);
    }
}

function createNewChatItem(room) {
    const chatList = document.querySelector('.chat-list');
    const chatItem = createChatItem(room);
    chatList.prepend(chatItem);
    return chatItem;
}

function createChatItem(room) {
    let chatItem = document.querySelector(`.chat-item[data-chat-id="${room.id}"]`);
    if (chatItem === null) {
        chatItem = document.createElement('div');
    }
    chatItem.classList.add('chat-item');
    chatItem.dataset.chatId = room.id;
    chatItem.textContent = room.users_list;

    return chatItem;
}

function chatItemsSubscribe() {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(chatItemSubscribe);
}

function chatItemSubscribe(chatItem) {
    chatItem.addEventListener('click', function () {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(i => i.classList.remove('selected'));
        this.classList.add('selected');
        initializeChat();
    });
}

function initializeChat() {
    const selectedChatItem = document.querySelector('.chat-item.selected');

    if (selectedChatItem === null) {
        return;
    }

    const chatId = selectedChatItem.dataset.chatId;
    const socket = new WebSocket(`ws://${window.location.host}/ws/chat/${chatId}/`, [], {
        headers: {
            'Cookie': document.cookie
        }
    });

    socket.onopen = () => {
        console.log('Соединение с WebSocket установлено');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
            addMessageToChat(data.message, 'received');
        }
    };

    socket.onclose = () => {
        console.log('Соединение с WebSocket закрыто');
    };

    const sendButton = document.querySelector('.chat-input button');
    const messageInput = document.querySelector('.chat-input input');

    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        if (message) {
            sendMessage(socket, message);
            messageInput.value = '';
        }
    });

    messageInput.addEventListener('input', function () {
        sendButton.disabled = messageInput.value.trim() === '';
    });
}

function sendMessage(socket, message) {
    socket.send(JSON.stringify({
        type: 'message',
        message: message,
    }));
    addMessageToChat(message, 'sent');
}

function addMessageToChat(message, messageType) {
    const chatMessages = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', messageType);
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}