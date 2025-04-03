require('dotenv').config();

const onError = (res) => {
    if (res.ok) {
      return res.json()
    }
    // если ошибка, отклоняем промис
    return Promise.reject(`Ошибка: ${res.status}`)
  }
  
class Api {
    constructor(id) {
      // тело конструктора
      this.id = id
      this.url = "/api/twisters"
      this.headers = {
        'Accept': 'application/json'
      }
    }
  
    // возвращает все скороговорки
    getTwisters() {
      return fetch(`${this.id}${this.url}`, {
        method: 'GET',
        headers: this.headers,
      }).then(onError)
    }
  
    // возвращает рандомную скороговорку
    getTwistersRandom() {
      // Формируем полный URL для запроса
      const fullUrl = `${this.id}${this.url}/random`;
      
      // Выводим полный URL в консоль
      // console.log('ПОЛНЫЙ URL ЗАПРОСА:', fullUrl);
      
      return fetch(fullUrl, {
        method: 'GET',
        headers: this.headers,
      }).then(onError);
    }
  
    // возвращает скороговорку по тегам
    getTwistersByTags(tags) {
      return fetch(`${this.id}${this.url}/tag/:${tags}`, {
        method: 'GET',
        headers: this.headers,
      }).then(onError)
    }

      // возвращает скороговорку по id
      getTwistersById(id) {
        return fetch(`${this.id}${this.url}/${id}`, {
            method: 'GET',
            headers: this.headers,
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (!data) {
                throw new Error('Нет данных');
            }
            return data;
        });
    }

    // возвращает скороговорку по сложности
    getTwistersByDifficulty(difficulty) {
      return fetch(`${this.id}${this.url}/difficulty/:${difficulty}`, {
        method: 'GET',
        headers: this.headers,
      }).then(onError)
    }

  }
  
  // создание экземпляра класса Api
  const api = new Api(
    process.env.API_IP,
  )
  
  module.exports = { Api, api };

  