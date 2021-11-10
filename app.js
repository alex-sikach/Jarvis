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

function eval2(s, kw_length = 0) {
	let str = s;
	let i, j;
	for (i = kw_length + 1; i < str.length; i++) {
		if (( isNaN(Number(str[i])) && str[i] != '-' )) break;
	}
	let f_el = str.slice(kw_length+1, i);
	if (f_el === '') { }
	else f_el = Number(f_el);

	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	str = str.slice(i);

	for (j = 1; j < str.length; j++) {
		if (!isNaN(Number(str[j])) && str[j] != '-') break;
	}
	let s_el = str.slice(j);
	if (s_el === '') { }
	else s_el = Number(s_el);
	
	return [f_el, s_el];
}

const startGame = async (chatId) =>
{
	attemp = 0;
	await bot.telegram.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 10.');
	var maxv = await 10;
	var randomNumber = await Math.floor(Math.random() * 11);
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
}

const start = () => {
	bot.on('message', async mes => {
		const text = mes.message.text.toLowerCase();
		const chatId = mes.chat.id;
	
		if (text === '/start') {
			await bot.telegram.sendMessage(chatId, `Hi, ${mes.from.first_name}! How can I help you?`);
			return bot.telegram.sendSticker(chatId, stickers.test);
		} else if (text === '/help') {
			return bot.telegram.sendMessage(chatId,
				`Hey there!
Exactly this bot was made for fun.
So you can use command /game to run the game "Lucker".
Also you can use the math action commands such as
/сложи, /умножь, /вычти и /подели,
и сразу после пробела напиши 2 числа, над которыми должны быть произведены действия.
Пример:
/подели 9, 3
Проследи за каждым пробелом иначе будет
выведено: Wrong input!`);
		} else if (text === '/game') {
			return startGame(chatId);
		} else if (text.slice(0, 6) === '/сложи' && text[6] === ' ') {
			let arr = eval2(s = text, kw_length = 6);
			if (arr[0] === '' || arr[1] === '')
				return bot.telegram.sendMessage(chatId, `Wrong input!`)
			else
				return bot.telegram.sendMessage(chatId, `${arr[0] + arr[1]}`);
		} else if (text.slice(0, 6) === '/вычти' && text[6] === ' ') {
			let arr = eval2(s = text, kw_length = 6);
			if (arr[0] === '' || arr[1] === '')
				return bot.telegram.sendMessage(chatId, `Wrong input!`)
			else
				return bot.telegram.sendMessage(chatId, `${arr[0] - arr[1]}`);
		} else if (text.slice(0, 7) === '/умножь' && text[7] === ' ') {
			let arr = eval2(s = text, kw_length = 6);
			if (arr[0] === '' || arr[1] === '')
				return bot.telegram.sendMessage(chatId, `Wrong input!`)
			else
				return bot.telegram.sendMessage(chatId, `${arr[0] * arr[1]}`);
		} else if (text.slice(0, 7) === '/подели' && text[7] === ' ') {
			let arr = eval2(s = text, kw_length = 7);
			if (arr[1] === 0)
				return bot.telegram.sendMessage(chatId, 'Деление на 0!')
			else if (arr[0] === '' || arr[1] === '') {
				return bot.telegram.sendMessage(chatId, `Wrong input!`)
			} else
				return bot.telegram.sendMessage(chatId, `${arr[0] / arr[1]}`);
		} else if (
			text.includes('what') &&
			text.includes('can') &&
			(text.includes('you') || text.includes('u'))
		) {
			return bot.telegram.sendMessage(chatId,
				`Use command /help to get information about bot's capacity `
			);
		} else if (
			text.includes('hi') ||
			text.includes('hello') ||
			text.includes("whats'up") ||
			text.includes('sup')
		) {
			return bot.telegram.sendMessage(chatId, 'Hey there!');
		}
		return bot.telegram.sendMessage(chatId, `Sorry, I do not understand you.`);
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
				case 2: {
					await bot.telegram.sendMessage(chatId, 'Nooo!');
					await bot.telegram.sendSticker(chatId, stickers.game.lose[attemp]);
					return bot.telegram.sendMessage(chatId, `The number was ${chats[chatId]}`, again_options);
				} break;
			}
			if (attemp !== 2)
				await bot.telegram.sendSticker(chatId, stickers.game.lose[attemp]);
			attemp++;
		}
	})
}

start();

bot.launch();