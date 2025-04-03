const { api } = require('./api/Api.js');
require('dotenv').config();
const { Bot, InputFile, session, GrammyError, HttpError } = require('grammy');

const bot = new Bot(process.env.BOT_TOKEN);

const count = async () => {
  try {
    const data = await api.getTwisters();
    console.log('Данные скороговорок:', data);
    
    // Проверяем, что данные пришли и есть свойство length
    if (data && Array.isArray(data)) {
      return data.length;
    } else if (data && data.twisters && Array.isArray(data.twisters)) {
      return data.twisters.length;
    } else {
      console.log('Неожиданный формат данных:', data);
      return 'недоступно';
    }
  } catch (err) {
    console.error('Произошла ошибка при получении скороговорок:', err);
    return 'недоступно';
  }
};

// Добавляем логирование только в режиме разработки
(async () => {
    if (process.env.NODE_ENV !== "production") {
      const { generateUpdateMiddleware } = await import("telegraf-middleware-console-time");
      bot.use(generateUpdateMiddleware());
    }
})();


const twisterText = (text)=>`<b>${text}</b>`;

// Устанавливаем команды бота (без слешей)
bot.api.setMyCommands([
    {
        command: 'start',
        description: 'Старт бота'
    },
    {
        command: 'twister',
        description: 'Получить случайную скороговорку'
    },
    {
        command: 'help',
        description: 'Информация о боте'
    },
]);

bot.use(async (ctx, next) => {
  // Измените здесь объект контекста, установив параметры для config.
  ctx.config = {
    botDeveloper: process.env.BOT_DEVELOPER,
    isDeveloper: ctx.from?.id === process.env.BOT_DEVELOPER,
  };
  // Запустите оставшиеся обработчики.
  await next();
});

bot.use(session());
bot.command('start', (ctx) => {
    ctx.reply('Привет я бот, который поможет тебе с выбором скороговорки');
});

bot.command('help', async (ctx) => {
    try {
        const twistersCount = await count();
        ctx.reply(`Бот отправляет случайную скороговорку по запросу пользователя, командой /twister. 
Поиск скороговорки по номеру, можно отправить боту цифру, и он отправит скороговорку с таким номером. 
Количество скороговорок: ${twistersCount}`);
    } catch (err) {
        console.error('Ошибка при получении количества скороговорок:', err);
        ctx.reply(`Бот отправляет случайную скороговорку по запросу пользователя, командой /twister. 
Поиск скороговорки по номеру, можно отправить боту цифру, и он отправит скороговорку с таким номером.`);
    }
});

bot.command('twister', async (ctx) => {
    try {
        const data = await api.getTwistersRandom();
        await ctx.reply(twisterText(data.text), {
            parse_mode: "HTML"
        });
    } catch (err) {
        console.error(err);
        ctx.reply('Произошла ошибка при получении скороговорки');
    }
});

// Обработчик для всех цифр
bot.hears(/^[0-9]+$/, (ctx) => {
    api.getTwistersById(Number(ctx.msg.text))
    .then(data => {
        // Проверяем, что data существует и содержит text
        if (!data || !data.text) {
            ctx.reply('Скороговорка не найдена');
            return;
        }
        ctx.reply(twisterText(data.text),{
            parse_mode: "HTML"
        });
    })
    .catch(err => {
        console.error(err);
        ctx.reply('Произошла ошибка при получении скороговорки');
    });
});

bot.hears('ID', (ctx) => {
    ctx.reply(ctx.from.id);
});

bot.on('message', async (ctx) => {
    await ctx.reply("извини, такой команды нет");
});


bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`, err);
 const e = err.error;
    if (e instanceof GrammyError) {
        console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
        console.error('Could not contact Telegram:', e);
    } else {
        console.error('Unknown error:', e);
    }
});

// bot.on("message", (ctx) => ctx.reply("Попался!"));
// Функция для обновления фото бота
// async function updateBotPhoto() {
//     try {
//         // Путь к локальному файлу
//         const photo = new InputFile("./photo/tw.jpg");
        
//         // Используем метод setMyProfilePhoto напрямую
//         await bot.setMyProfilePhoto({
//             photo: photo
//         });
        
//         console.log('Фото бота успешно обновлено');
//     } catch (err) {
//         console.log('Ошибка при обновлении фото:', err);
//     }
// }

// // Вызываем функцию
// updateBotPhoto();

bot.start();

