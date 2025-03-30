const onError = (res) => {
    if (res.ok) {
      return res.json()
    }
    // если ошибка, отклоняем промис
    return Promise.reject(`Ошибка: ${res.status}`)
  }
  
  export class Api {
    constructor(id) {
      // тело конструктора
      this.id = id
      this.url = "/api/twisters"
    }
  
    // возвращает все скороговорки
    getTwisters() {
      return fetch(`${this.id}/${this.url}/movies`, {
        method: 'GET',
      }).then(onError)
    }
  
    // возвращает скороговорки рамдомную скороговорку
    getTwistersRandom() {
      return fetch(`${this._url}/users/me`, {
        method: 'GET',
        headers: {
          ...this._headers,
          authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      }).then(onError)
    }
  
    // Редактирование профиля
    setUserInfo(name, email) {
      return fetch(`${this._url}/users/me`, {
        method: 'PATCH',
        headers: {
          ...this._headers,
          authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify({
          name: name,
          email: email,
        }),
      }).then(onError)
    }
  
    // Удаление фильма
    deleteCard(data) {
      return fetch(`${this._url}/movies/${data._id}`, {
        method: 'DELETE',
        headers: {
          ...this._headers,
          authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      }).then(onError)
    }
  }
  
  // создание экземпляра класса Api
  const api = new Api({
    baseUrl: 'https://api.movies-aksenov.nomoredomains.xyz',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  export default api
  