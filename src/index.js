const { api, Api } = require("./api/Api.js");
require("dotenv").config();
const { Bot, InputFile, session, GrammyError, HttpError } = require("grammy");

const bot = new Bot(process.env.BOT_TOKEN);

const count = async () => {
  try {
    const data = await api.getTwisters();
    console.log("Данные скороговорок:", data);

    // Проверяем, что данные пришли и есть свойство length
    if (data && Array.isArray(data)) {
      return data.length;
    } else if (data && data.twisters && Array.isArray(data.twisters)) {
      return data.twisters.length;
    } else {
      console.log("Неожиданный формат данных:", data);
      return "недоступно";
    }
  } catch (err) {
    console.error("Произошла ошибка при получении скороговорок:", err);
    return "недоступно";
  }
};

// Добавляем логирование только в режиме разработки
(async () => {
  if (process.env.NODE_ENV !== "production") {
    const { generateUpdateMiddleware } = await import("telegraf-middleware-console-time");
    bot.use(generateUpdateMiddleware());
  }
})();

const twisterText = (text) => `<b>${text}</b>`;

// Устанавливаем команды бота (без слешей)
try {
  bot.api.setMyCommands([
    {
      command: "start",
      description: "Старт бота",
    },
    {
      command: "twister",
      description: "Получить случайную скороговорку",
    },
    {
      command: "help",
      description: "Информация о боте",
    },
  ]);
  console.log("Команды бота успешно установлены");
} catch (err) {
  if (err.error?.code === "EAI_AGAIN") {
    console.error("Ошибка сети: не удалось подключиться к Telegram API. Проверьте подключение к интернету");
  } else {
    console.error("Ошибка при установке команд бота:", err);
  }
}

bot.use(async (ctx, next) => {
  // Измените здесь объект контекста, установив параметры для config.
  ctx.config = {
    botDeveloper: process.env.BOT_DEVELOPER,
    isDeveloper: String(ctx.from?.id) === process.env.BOT_DEVELOPER,
  };
  // Запустите оставшиеся обработчики.
  await next();
});

bot.use(session());

bot.command("start", async (ctx) => {
  if (!ctx.from) {
    return console.log("User не найден");
  }

  const { id, first_name, last_name, username } = ctx.from;

  try {
    // Попытка получить пользователя
    const existingUser = await api.getUserById(id);
    console.log("Данные пользователя:", existingUser);

    if (existingUser) {
      console.log(`С возвращением, ${first_name}!`);
    } else {
      // Создаем пользователя с правильными параметрами
      await api.createUser({
        id,
        first_name,
        last_name,
        username,
      });
    }
  } catch (err) {
    console.error("Ошибка при работе с пользователем:", err);
    // Если ошибка из-за отсутствия пользователя, создаем нового
    if (err.message && (err.message.includes("Нет данных") || err.message.includes("HTTP error! status: 404"))) {
      try {
        await api.createUser({
          id: id,
          first_name: first_name,
          last_name: last_name,
          username: username,
        });
        console.log("Создан новый пользователь");
      } catch (createErr) {
        console.error("Ошибка при создании пользователя:", createErr);
        // await ctx.reply("Произошла ошибка при сохранении данных.");
        // return;
      }
    } else {
      await ctx.reply("Произошла ошибка при сохранении данных.");
      return;
    }
  }
  await ctx.reply("Привет я бот, который поможет тебе с выбором скороговорки");
});

bot.command("help", async (ctx) => {
  try {
    const twistersCount = await count();
    ctx.reply(
      `Бот отправляет случайную скороговорку по запросу пользователя, командой /twister. 
Поиск скороговорки по номеру, можно отправить боту цифру, и он отправит скороговорку с таким номером. 
Количество скороговорок: ${twistersCount === "недоступно" ? twisterText("x") : twisterText(twistersCount)}`,
      {
        parse_mode: "HTML",
      }
    );
  } catch (err) {
    console.error("Ошибка при получении количества скороговорок:", err);
    ctx.reply(`Бот отправляет случайную скороговорку по запросу пользователя, командой /twister. 
Поиск скороговорки по номеру, можно отправить боту цифру, и он отправит скороговорку с таким номером.`);
  }
});

bot.command("twister", async (ctx) => {
  try {
    const data = await api.getTwistersRandom();
    await ctx.reply(twisterText(data.text), {
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error(err);
    ctx.reply(`Произошла ошибка при получении скороговорки: ${err}`);
  }
});

bot.hears("users", async (ctx) => {
    console.log(ctx.config.isDeveloper)
    if (!ctx.config?.isDeveloper) {
      return ctx.reply("Нет такой команды");
    }
  
    try {
      const data = await api.getUsersCount();
      console.log(data);
      await ctx.reply(twisterText(data.count), {
        parse_mode: "HTML",
      });
    } catch (err) {
      console.error(err);
      ctx.reply(`Произошла ошибка при получении данных: ${err}`);
    }
  });


// Обработчик для всех цифр
bot.hears(/^[0-9]+$/, (ctx) => {
  api
    .getTwistersById(Number(ctx.msg.text))
    .then((data) => {
      // Проверяем, что data существует и содержит text
      if (!data || !data.text) {
        ctx.reply("Скороговорка не найдена");
        return;
      }
      ctx.reply(twisterText(data.text), {
        parse_mode: "HTML",
      });
    })
    .catch((err) => {
      console.error(err);
      ctx.reply("Произошла ошибка при получении скороговорки");
    });
});

bot.hears("ID", (ctx) => {
  ctx.reply(ctx.from.id);
});

bot.on("message", async (ctx) => {
    await ctx.reply("извини, такой команды нет");
  });

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
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
