require("dotenv").config();

const onError = (res) => {
  if (res.ok) {
    return res.json();
  }
  // если ошибка, отклоняем промис
  return Promise.reject(`Ошибка: ${res.status}`);
};

class Api {
  constructor(id) {
    // тело конструктора
    this.id = `${id}/api`;
    this.url = "/twisters";
    this.headers = {
      'Accept': 'application/json',
      "Content-Type": "application/json",
    };
  }

  // возвращает все скороговорки
  getTwisters() {
    return fetch(`${this.id}${this.url}`, {
      method: "GET",
      headers: this.headers,
    }).then(onError);
  }

  // возвращает рандомную скороговорку
  getTwistersRandom() {
    // Формируем полный URL для запроса
    const fullUrl = `${this.id}${this.url}/random`;

    // Выводим полный URL в консоль
    // console.log('ПОЛНЫЙ URL ЗАПРОСА:', fullUrl);

    return fetch(fullUrl, {
      method: "GET",
      headers: this.headers,
    }).then(onError);
  }

  // возвращает скороговорку по тегам
  getTwistersByTags(tags) {
    if (!tags) return Promise.reject('Не указаны теги');
    return fetch(`${this.id}${this.url}/tag/${encodeURIComponent(tags)}`, {
      method: 'GET',
      headers: this.headers,
    }).then(onError);
  }

  // возвращает скороговорку по id
  getTwistersById(id) {
    return fetch(`${this.id}${this.url}/${id}`, {
      method: "GET",
      headers: this.headers,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data) {
          throw new Error("Нет данных");
        }
        return data;
      });
  }

  // сохраняем user
  createUser(data) {
    if (!data || !data.id) return Promise.reject("Неверные данные пользователя");
    return fetch(`${this.id}/user`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        id: data.id,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        username: data.username || "",
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data) {
          throw new Error("Нет данных");
        }
        return data;
      });
  }

  // возвращает user by id
  getUserById(id) {
    const url = `${this.id}/user/${id}`;
    // console.log('Запрос пользователя по URL:', url);
    if (!id) return Promise.reject('Не указан ID пользователя');
    return fetch(url, {
      method: 'GET',
      headers: this.headers
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      if (!data) {
        throw new Error("Нет данных пользователя");
      }
      return data;
    });
  }

   // возвращаем количество пользователей
   getUsersCount() {
    // Формируем полный URL для запроса
    const fullUrl = `${this.id}/user/count`;
    return fetch(fullUrl, {
      method: "GET",
      headers: this.headers,
    }).then(onError);
  }

  // возвращает скороговорку по сложности
  getTwistersByDifficulty(difficulty) {
    if (!difficulty) return Promise.reject('Не указана сложность');
    return fetch(`${this.id}${this.url}/difficulty/${encodeURIComponent(difficulty)}`, {
      method: 'GET',
      headers: this.headers,
    }).then(onError);
  }
}

// создание экземпляра класса Api
const api = new Api(process.env.API_IP);

module.exports = { Api, api };
