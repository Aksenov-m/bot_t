require('dotenv').config();
const { Bot, InputFile } = require('grammy');

const bot = new Bot(process.env.BOT_TOKEN);



bot.command('start', (ctx) => {
    ctx.reply('Привет я бот, который поможет тебе с выбором скороговорки');
});

bot.on('message', async (ctx) => {
    await ctx.reply("извини, такой команды нет");
});

bot.start();
