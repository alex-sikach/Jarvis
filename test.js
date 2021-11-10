const security = require('./security.js');
const { Telegraf } = require('telegraf');
const stickers = require('./stickers.js');
const bot = new Telegraf(security.TELEGRAM_BOT_TOKEN);

bot.telegram.setMyCommands([
	{command: '/start', description: 'Start a dialogue.'},
	{command: '/help', description: 'Get info about the bot.' },
	{command: '/game', description: 'Start game "Lucker"'}
]);

const chats = {};
var attemp;
const game_options = { //a template of inline keyboard
	reply_markup: {
		inline_keyboard: [

		]
	}
};
const again_options = {
	reply_markup: {
		inline_keyboard: [
			[{text: 'Play again.', callback_data: '/play_again'}]
		]
	}
};

const startGame = async (chatId) =>
{
	attemp = 0;
	await bot.telegram.sendMessage(chatId, 'От нуля до скольки мне загадать число?');
	await bot.on('message', async (ctx) => {
		var maxv = await Number(ctx.message.text);
		// var maxv = await 10;
		var randomNumber = await Math.floor(Math.random() * maxv+1);
		console.log(randomNumber);
		chats[chatId] = randomNumber;	
		//filling the inline keyboard by empty arrays
		//создаем вложенность
		for (let i = 0; i < Math.ceil((maxv + 1) / 3); i++) {
			game_options.reply_markup.inline_keyboard[i] = [];
		}
		let row = 0;
		for (let i = 0; i < maxv + 1; i++) {
			game_options.reply_markup.inline_keyboard[row].push(
				{ text: i, callback_data: i }
			);
			if ((i + 1) % 3 == 0)
				row++;
		}
		await bot.telegram.sendMessage(chatId, 'Отгадывай', game_options);
		return;
	})
	return;
}

const start = () => {
	bot.on('message', async mes => {
		const text = mes.message.text.toLowerCase();
		const chatId = mes.chat.id;
	
		if (text === '/start') {
			await bot.telegram.sendMessage(chatId, `Hi, ${mes.from.first_name}! How can I help you?`);
			return bot.telegram.sendSticker(chatId, stickers.test);
		} else if (text === '/help') {
			return; //!
		} else if (text === '/game') {
			return startGame(chatId);
		} else if (
			text.includes('what') &&
			text.includes('can') &&
			(text.includes('you') || text.includes('u'))
		) {
			return bot.telegram.sendMessage(chatId,
				`Basicly, I was made for lyceum students. You can use the /help command to get more information.`
			);
		}
		return bot.telegram.sendMessage(chatId, 'Sorry, I do not understand you.');
	})
	bot.on('callback_query', async msg => {
		const data = await msg.callbackQuery.data;
		const chatId = await msg.chat.id;
		if (data === '/play_again') {
			return startGame(chatId);
		} else if (data == chats[chatId] && attemp <= 2) {
			switch (attemp) {
				case 0: await bot.telegram.sendMessage(chatId, 'What the f.. On the firs try!'); break;
				case 1: await bot.telegram.sendMessage(chatId, 'Yes! Well done!'); break;
				case 2: await bot.telegram.sendMessage(chatId, 'Finally!'); break;
			}
			await bot.telegram.sendSticker(chatId, stickers.game.win[attemp], again_options);
			attemp++;
		} else if(attemp <= 2) {
			switch (attemp) {
				case 0: await bot.telegram.sendMessage(chatId, 'Not exactly true. Try again.'); break;
				case 1: await bot.telegram.sendMessage(chatId, 'Are you kidding me? Turn on your brains, please.'); break;
				case 2: await bot.telegram.sendMessage(chatId, 'Nooo!'); break;
			}
			if (attemp === 2) {
				await bot.telegram.sendSticker(chatId, stickers.game.lose[attemp]);
				return bot.telegram.sendMessage(chatId, `The number was ${chats[chatId]}`, again_options);
			} else
				await bot.telegram.sendSticker(chatId, stickers.game.lose[attemp]);
			attemp++;
		}
	})
}

start();

bot.launch();