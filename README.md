# Mayhao 👗

Платформа для визуального вдохновения в сфере моды и стиля. Аналог Pinterest, полностью на русском языке. Готова к развёртыванию на GitHub Pages.

## Возможности

- 🔍 **Поиск образов** — через Unsplash API (мода, стиль, луки)
- ❤️ **Лайки и сохранения** — хранятся в localStorage
- 📁 **Коллекции** — создавайте тематические доски
- 🎯 **Для вас** — персональная лента на основе ваших действий
- 👤 **Профиль** — редактирование, статистика, выход
- 🔐 **Авторизация** — Регистрация, Вход, Сброс пароля
- 🔔 **Уведомления** — UI-дропдаун в навбаре
- 📱 **Адаптивный дизайн** — мобильный, планшет, десктоп

## Структура проекта

```
/
├── index.html              # Главная страница
├── style.css               # Все стили
├── script.js               # Логика (API, карточки, хранилище, авторизация)
└── pages/
    ├── explore.html        # Обзор и поиск
    ├── foryou.html         # Персональная лента
    ├── collections.html    # Коллекции
    ├── profile.html        # Профиль пользователя
    ├── login.html          # Вход
    ├── register.html       # Регистрация
    └── reset.html          # Сброс пароля
```

## Установка и запуск

### 1. Получить ключ Unsplash (бесплатно)

1. Перейти на [unsplash.com/developers](https://unsplash.com/developers)
2. Создать новое приложение
3. Скопировать **Access Key**

### 2. Вставить ключ

Открыть `script.js` и заменить значение в `CONFIG`:

```js
const CONFIG = {
  UNSPLASH_KEY: 'ВАШ_КЛЮЧ_ЗДЕСЬ',
  ...
};
```

### 3. Разместить на GitHub Pages

1. Загрузить все файлы в репозиторий GitHub
2. Перейти в **Settings → Pages**
3. Source: **Deploy from a branch → main → / (root)**
4. Сайт будет доступен по адресу: `https://username.github.io/mayhao/`

> ℹ️ Без ключа Unsplash сайт работает в демо-режиме с изображениями от [Picsum Photos](https://picsum.photos).

## Технологии

- HTML5, CSS3, Vanilla JavaScript
- [Bootstrap 5.3](https://getbootstrap.com)
- [Bootstrap Icons](https://icons.getbootstrap.com)
- [Google Fonts — Syne + DM Sans](https://fonts.google.com)
- [Unsplash API](https://unsplash.com/developers)
- localStorage для хранения данных
