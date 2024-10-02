class ChatApp {
    constructor() {
        this.socket = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.loginFormSubscribe();
            this.signupLinkSubscribe();
            this.logoutSubscribe();
            this.newChatSubscribe();
            this.chatItemsSubscribe();
            this.selectFirstChat();
        });
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(`${name}=`)) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    loginFormSubscribe() {
        const form = document.querySelector('.login-form');
        if (!form) return;

        const infoDiv = document.querySelector('.info');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const csrfToken = this.getCookie('csrftoken');

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
                if (response.ok) {
                    this.removeBodyElements();
                    this.createChatElements();
                    this.logoutSubscribe();
                    await this.fillChatList();
                    this.selectFirstChat();
                } else {
                    infoDiv.innerHTML = `<p style="color: red">${data.message}</p>`;
                    console.error('Ошибка:', data.message);
                }
            } catch (error) {
                infoDiv.innerHTML = `<p style="color: red">Произошла ошибка!</p>`;
                console.error('Ошибка:', error);
            }
        });
    }

    removeBodyElements() {
        document.body.innerHTML = '';
    }

    createChatElements() {
        const body = document.body;
        const container = this.createElementWithClasses('div', ['container', 'messenger-container']);
        body.appendChild(container);

        const sidebar = this.createElementWithClasses('div', ['sidebar']);
        container.appendChild(sidebar);

        const avatar = this.createElementWithClasses('div', ['avatar']);
        sidebar.appendChild(avatar);

        const avatarImage = document.createElement('img');
        avatarImage.src = "/static/images/avatar.jpg";
        avatarImage.alt = "Аватар";
        avatar.appendChild(avatarImage);

        const dropdownMenu = this.createElementWithClasses('div', ['dropdown-menu']);
        avatar.appendChild(dropdownMenu);

        const logoutButton = this.createElementWithClasses('button', ['dropdown-item', 'logout']);
        logoutButton.textContent = 'Выйти';
        dropdownMenu.appendChild(logoutButton);

        const createChatDiv = this.createElementWithClasses('div', ['create-chat']);
        sidebar.appendChild(createChatDiv);

        const createChatImage = document.createElement('img');
        createChatImage.src = "/static/images/create-chat-icon.png";
        createChatImage.alt = "Создать беседу";
        createChatDiv.appendChild(createChatImage);

        const h3 = this.createElementWithClasses('h3', ['h3']);
        h3.textContent = `Беседы`;
        sidebar.appendChild(h3);

        const chatList = this.createElementWithClasses('div', ['chat-list']);
        sidebar.appendChild(chatList);

        const chatContainer = this.createElementWithClasses('div', ['chat-container']);
        container.appendChild(chatContainer);

        const chatHeader = this.createElementWithClasses('div', ['chat-header']);
        chatContainer.appendChild(chatHeader);

        const h2 = this.createElementWithClasses('h2', ['h2']);
        h2.textContent = 'Чат 1';
        chatHeader.appendChild(h2);

        const chatMessages = this.createElementWithClasses('div', ['chat-messages']);
        chatContainer.appendChild(chatMessages);

        const chatInput = this.createElementWithClasses('div', ['chat-input']);
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

    async fillChatList() {
        try {
            const response = await fetch('/api/chatlist/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                this.createChatItems(data.rooms);
                this.chatItemsSubscribe();
            } else {
                console.error('Ошибка:', data.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }

    selectFirstChat() {
        const firstChatItem = document.querySelector('.chat-item');
        if (firstChatItem) {
            firstChatItem.classList.add('selected');
            this.initializeChat();
        }
    }

    logoutSubscribe() {
        const logoutButton = document.querySelector('.logout');
        if (!logoutButton) return;

        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.removeBodyElements();
                    this.createLoginElements();
                    this.loginFormSubscribe();
                    this.signupLinkSubscribe();
                } else {
                    const data = await response.json();
                    console.error('Ошибка:', data.message);
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        });
    }

    createLoginElements() {
        const body = document.body;
        const container = this.createElementWithClasses('div', ['container', 'login-container']);
        body.appendChild(container);

        const h2 = this.createElementWithClasses('h2', ['h2']);
        h2.textContent = 'Вход';
        container.appendChild(h2);

        const loginForm = this.createElementWithClasses('form', ['login-form']);
        container.appendChild(loginForm);

        const pUsername = document.createElement('p');
        loginForm.appendChild(pUsername);

        const idUsername = document.createElement('label');
        idUsername.htmlFor = 'id_username';
        idUsername.textContent = 'Имя пользователя:';
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
        idPassword.textContent = 'Пароль:';
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

        const signupDiv = this.createElementWithClasses('div', ['signup-link']);
        container.appendChild(signupDiv);

        const pSignup = document.createElement('p');
        pSignup.textContent = 'Нет аккаунта?';
        signupDiv.appendChild(pSignup);

        const aSignup = document.createElement('a');
        aSignup.href = '#';
        aSignup.textContent = 'Регистрация';
        signupDiv.appendChild(aSignup);

        const info = this.createElementWithClasses('div', ['info']);
        container.appendChild(info);
    }

    signupLinkSubscribe() {
        const signupLink = document.querySelector('.signup-link a');
        if (!signupLink) return;

        signupLink.addEventListener('click', (event) => {
            event.preventDefault();
            this.removeBodyElements();
            this.createSignupElements();
            this.signupFormSubscribe();
        });
    }

    createSignupElements() {
        const body = document.body;
        const container = this.createElementWithClasses('div', ['container', 'signup-container']);
        body.appendChild(container);

        const h2 = this.createElementWithClasses('h2', ['h2']);
        h2.textContent = 'Регистрация';
        container.appendChild(h2);

        const signupForm = this.createElementWithClasses('form', ['signup-form']);
        container.appendChild(signupForm);

        const pUsername = document.createElement('p');
        signupForm.appendChild(pUsername);

        const idUsername = document.createElement('label');
        idUsername.htmlFor = 'id_username';
        idUsername.textContent = 'Имя пользователя:';
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
        idPassword.textContent = 'Пароль:';
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
        idPasswordCheck.textContent = 'Подтвердите пароль:';
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

        const info = this.createElementWithClasses('div', ['info']);
        container.appendChild(info);
    }

    async signupFormSubscribe() {
        const form = document.querySelector('.signup-form');
        if (!form) return;

        const infoDiv = document.querySelector('.info');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const csrfToken = this.getCookie('csrftoken');

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
                if (response.ok) {
                    this.removeBodyElements();
                    this.createChatElements();
                    this.logoutSubscribe();
                    this.newChatSubscribe();
                    await this.fillChatList();
                    this.selectFirstChat();
                } else {
                    infoDiv.innerHTML = `<p style="color: red">${data.message}</p>`;
                    console.error('Ошибка:', data.message);
                }
            } catch (error) {
                infoDiv.innerHTML = `<p style="color: red">Произошла ошибка!</p>`;
                console.error('Ошибка:', error);
            }
        });
    }

    newChatSubscribe() {
        const createNewChatDiv = document.querySelector('.create-chat');
        if (!createNewChatDiv) return;

        createNewChatDiv.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/userlist/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    this.createNewChatElements(data.users);
                    this.closeCreateNewChatSubscribe();
                    this.createNewChatFormSubscribe();
                } else {
                    console.error('Ошибка:', data.message);
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        });
    }

    createNewChatElements(users) {
        const body = document.body;
        const modal = this.createElementWithClasses('div', ['modal']);
        body.appendChild(modal);

        const modalContent = this.createElementWithClasses('div', ['modal-content']);
        modal.appendChild(modalContent);

        const closeModal = this.createElementWithClasses('span', ['close']);
        closeModal.innerHTML = '&times;';
        modalContent.appendChild(closeModal);

        const h3 = this.createElementWithClasses('h3', ['h2']);
        h3.textContent = 'Создать новую беседу';
        modalContent.appendChild(h3);

        const createChatForm = this.createElementWithClasses('form', ['create-chat-form']);
        modalContent.appendChild(createChatForm);

        const selectUsersLabel = document.createElement('label');
        selectUsersLabel.htmlFor = 'users';
        selectUsersLabel.textContent = 'Выберите пользователей:';
        createChatForm.appendChild(selectUsersLabel);

        const userList = this.createElementWithClasses('div', ['user-list']);
        createChatForm.appendChild(userList);

        users.forEach(user => {
            const userItem = this.createElementWithClasses('div', ['user-item']);
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
        });

        const createChatFormButton = document.createElement('button');
        createChatFormButton.type = 'submit';
        createChatFormButton.classList.add('btn-create-chat');
        createChatFormButton.textContent = 'Создать беседу';
        createChatForm.appendChild(createChatFormButton);
    }

    closeCreateNewChatSubscribe() {
        const closeModal = document.querySelector('.close');
        closeModal.addEventListener('click', this.closeCreateNewChat);
    }

    closeCreateNewChat() {
        const modal = document.querySelector('.modal');
        modal.remove();
    }

    createNewChatFormSubscribe() {
        const form = document.querySelector('.create-chat-form');
        if (!form) return;

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const csrfToken = this.getCookie('csrftoken');

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
                if (response.ok) {
                    this.closeCreateNewChat();
                    const chatItem = this.createNewChatItem(data.room);
                    this.chatItemsSubscribe(chatItem);
                } else {
                    console.error('Ошибка:', data.message);
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        });
    }

    createChatItems(rooms) {
        const chatList = document.querySelector('.chat-list');
        rooms.forEach(room => {
            const chatRoom = this.createChatItem(room);
            chatList.append(chatRoom);
        });
    }

    createNewChatItem(room) {
        const chatList = document.querySelector('.chat-list');
        const chatItem = this.createChatItem(room);
        chatList.prepend(chatItem);
        return chatItem;
    }

    createChatItem(room) {
        let chatItem = document.querySelector(`.chat-item[data-chat-id="${room.id}"]`);
        if (!chatItem) {
            chatItem = this.createElementWithClasses('div', ['chat-item']);
        }
        chatItem.dataset.chatId = room.id;
        chatItem.textContent = room.users_list;

        return chatItem;
    }

    chatItemsSubscribe() {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(chatItem => this.chatItemSubscribe(chatItem));
    }

    chatItemSubscribe(chatItem) {
        chatItem.addEventListener('click', async () => {
            const chatItems = document.querySelectorAll('.chat-item');
            chatItems.forEach(i => i.classList.remove('selected'));
            chatItem.classList.add('selected');
            this.initializeChat();

            const chatId = chatItem.dataset.chatId;
            await this.loadChatMessages(chatId);
        });
    }

    async loadChatMessages(chatId) {
        try {
            const response = await fetch(`/api/chat/${chatId}/messages/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                this.updateChatMessages(data.messages, data.current_user);
            } else {
                console.error('Ошибка:', data.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }

    updateChatMessages(messages, currentUser) {
        const chatMessagesContainer = document.querySelector('.chat-messages');
        chatMessagesContainer.innerHTML = '';

        messages.forEach(message => {
            const messageDiv = this.createElementWithClasses('div', ['message']);
            messageDiv.classList.add(message.sender === currentUser ? 'sent' : 'received');
            messageDiv.textContent = message.text;
            chatMessagesContainer.appendChild(messageDiv);
        });

        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    initializeChat() {
        const selectedChatItem = document.querySelector('.chat-item.selected');
        if (!selectedChatItem) return;

        if (this.socket) {
            this.socket.close();
        }

        const chatId = selectedChatItem.dataset.chatId;
        this.socket = new WebSocket(`ws://${window.location.host}/ws/chat/${chatId}/`, [], {
            headers: {'Cookie': document.cookie}
        });

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat_message') {
                this.addMessageToChat(data.message, 'received');
            }
        };

        const sendButton = document.querySelector('.chat-input button');
        const messageInput = document.querySelector('.chat-input input');

        sendButton.addEventListener('click', () => {
            const message = messageInput.value;
            if (message) {
                this.sendMessage(message);
                messageInput.value = '';
            }
        });

        messageInput.addEventListener('input', () => {
            sendButton.disabled = messageInput.value.trim() === '';
        });
    }

    sendMessage(message) {
        this.socket.send(JSON.stringify({type: 'message', message}));
        this.addMessageToChat(message, 'sent');
    }

    addMessageToChat(message, messageType) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageDiv = this.createElementWithClasses('div', ['message', messageType]);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    createElementWithClasses(tag, classes) {
        const element = document.createElement(tag);
        classes.forEach(className => element.classList.add(className));
        return element;
    }
}

new ChatApp();