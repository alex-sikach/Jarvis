import security from './security.js';
import { Telegraf } from 'telegraf';
import stickers from './stickers.js';
import fetch from 'node-fetch';
import {Handbook} from "./classes/handbook.js";
// import _ from 'lodash';
const bot = new Telegraf(security.TELEGRAM_BOT_TOKEN);

const botCommands = [
	{command: '/start', description: 'Start a dialogue.'},
	{command: '/help', description: 'Get some help of using.'},
	{command: '/commands', description: 'See what are there the commands and how to use them.'},
	{command: '/game', description: 'Start game "Lucker"' },
	{command: '/fact', description: 'get random fact' },
	{command: '/joke', description: 'get random joke'},
	{command: '/avatar', description: 'get your current avatar picture' },
	{command: '/all_avatars', description: 'get all your avatar pictures' }
]

const usersBase = [];
const chats = {};
var waiting_answer = 0;
var attemp;
var game_options = { //a template of inline keyboard
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
async function getFact(lim) {
	let json = await fetch(`https://api.api-ninjas.com/v1/facts?limit=${lim}`,
	{
		method: 'GET',
		headers: { 'X-Api-Key': security.ninjas_api_key},
		contentType: 'application/json',
	});
	return await json.json();
}
async function getJoke(lim) {
	let json = await fetch(`https://api.api-ninjas.com/v1/jokes?limit=${lim}`,
	{
		method: 'GET',
		headers: { 'X-Api-Key': security.ninjas_api_key },
		contentType: 'application/json'
	});
	return await json.json();
}
async function reactionsToAns(data, cxt, chatId) {
	if (data == chats[chatId] && attemp <= 2) {
		switch (attemp) {
			case 0: await bot.telegram.sendMessage(chatId, 'What the f.. On the firs try!'); break;
			case 1: await bot.telegram.sendMessage(chatId, 'Yes! Well done!'); break;
			case 2: await bot.telegram.sendMessage(chatId, 'Finally!'); break;
		}
		waiting_answer = 0;
		await bot.telegram.sendSticker(chatId, stickers.game.win[attemp], again_options);
		attemp++;
	} else if(attemp <= 2) {
		switch (attemp) {
			case 0: await bot.telegram.sendMessage(chatId, 'Not exactly true. Try again.'); break;
			case 1: await bot.telegram.sendMessage(chatId, 'Are you kidding me? Turn on your brains, please.'); break;
			case 2: {
				await bot.telegram.sendMessage(chatId, 'Nooo!');
				await bot.telegram.sendSticker(chatId, stickers.game.lose[attemp]);
				waiting_answer = 0;
				return bot.telegram.sendMessage(chatId, `The number was ${chats[chatId]}`, again_options);
			} break;
		}
		if (attemp !== 2)
			await bot.telegram.sendSticker(chatId, stickers.game.lose[attemp], game_options);
		attemp++;
	}
}
function eval2(s, kw_length = 0) {
	let str = s;
	let i, j;
	for (i = kw_length + 1; i < str.length; i++) {
		if (( isNaN(Number(str[i])) && str[i] != '-' )) break;
	}
	let f_el = str.slice(kw_length+1, i);
	if (f_el === '') { }
	else f_el = Number(f_el);

	str = str.slice(i);

	for (j = 1; j < str.length; j++) {
		if (!isNaN(Number(str[j])) && str[j] != '-') break;
	}
	let s_el = str.slice(j);
	if (s_el === '') { }
	else s_el = Number(s_el);
	
	return [f_el, s_el];
}

const startGame = async (chatId, maxv) =>
{
	game_options={reply_markup:{inline_keyboard:[]}}; //clearing array
	attemp = 0;
	await bot.telegram.sendMessage(chatId, 'Окей, дай чуть-чуть подумать..');
	let randomNumber = Math.floor(Math.random() * maxv) + 1;
	// console.log(`random = ${randomNumber}`);
	chats[chatId] = randomNumber;
	await bot.telegram.sendSticker(chatId, stickers.hmm);
	if (maxv <= 10) {
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
		await setTimeout(() => {
			bot.telegram.sendMessage(chatId, 'Отгадывай', game_options);
		}, 3500);
	} else {
		await setTimeout(() => {
			bot.telegram.sendMessage(chatId, 'Enter your guess:');
			waiting_answer = 2;
		}, 3500);
	}
}

const nep = new Handbook({
	names: ['nep', 'нэп', 'неп'],
	defaultMessage: 'Новая экономическая политика – проводившаяся в период с 1921 по 1924 гг. в Советской России экономическая политика, пришедшая на смену политике "военного коммунизма".',
	fullPath: [
		'nep/targets.jpg',
		'nep/events.jpg',
		'nep/results.jpg'
	],
	branches: [
		{text: 'Цель', callback_data: 'nep_targets'},
		{text: 'Мероприятия', callback_data: 'nep_events'},
		{text: 'Итоги', callback_data: 'nep_results'}

	],
	bot: bot,
	chatId: ''
});

const start = () => {
	bot.command('fact', async ctx => {
		let fact = await getFact(1);
		return bot.telegram.sendMessage(ctx.chat.id, fact[0].fact);
	});
	bot.command('joke', async ctx => {
		let joke = await getJoke(1);
		return bot.telegram.sendMessage(ctx.chat.id, joke[0].joke);
	});
	bot.on('message', async mes =>
	{
		const text = mes.message.text.toLowerCase();
		const chatId = mes.chat.id;

		nep.chatId = chatId;

		if (text === '/start') {
			let from = mes.from;
			let dublicate = false;
			// * first way - JSON.stringify(obj1, obj2);
			usersBase.forEach((el) => {
				if (JSON.stringify(from) === JSON.stringify(el))
					dublicate = true;
			});
			// * second strong way - package "Lodash" _
			/*
			usersBase.forEach((el) => {
				if (_.isEqual(from, el))
					dublicate = true;
			});
			*/
			if (!dublicate) {
				usersBase.push(from);
				console.log(`${mes.from.first_name} ${mes.from.last_name} has started the dialogue`);
				console.log(usersBase);
			}
			await bot.telegram.sendMessage(chatId, `Hi, ${mes.from.first_name}! How can I help you?`);
			return bot.telegram.sendSticker(chatId, stickers.test);
		} else if (text === '/help') {
			let date = new Date();
			let min = date.getMinutes();
			let hours = date.getHours();
			let day = date.getDay();
			let week_days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
			return await bot.telegram.sendMessage(chatId,
				`Hey there!\nExactly this bot was made for fun.\nSo you can use /commands to see all bot's cammands and how to use them.\n${week_days[day]} ${hours}:${min}`);
		} else if (text === '/commands') {
			await bot.telegram.sendMessage(chatId,
				`There is command /game, which start the game 'Lucker'. Also you can use the math action commands such as\n/сложи, /умножь, /вычти и /подели,\nи сразу после пробела напиши 2 числа, над которыми должны быть произведены действия.\nПример:\n/подели 9, 3\nПроследи за каждым пробелом иначе будет\nвыведено: Wrong input!\nThere are 2 more cool commands -\n/fact and /joke. You'll get the random joke or real fact.\nP.S. Sometimes it's really big.\nAnd also there are 2 useful commands -\n/avatar and /all_avatars.\nThe command /all_avatars will show you all yours avatars.\nJust type the / to see them.`);
			return bot.telegram.sendSticker(chatId, stickers.magic);
		} else if (text === '/game') {
			await bot.telegram.sendMessage(chatId, 'От нуля до скольки мне загадать число?');
			waiting_answer = 1;
			return 0;
		} else if (waiting_answer == 1) {
			waiting_answer = 0;
			if (isNaN(Number(mes.message.text))) {
				return bot.telegram.sendMessage(chatId, `It is not a number, sorry)`)
			} else {
				return startGame(chatId, Number(mes.message.text));
			}
		} else if (waiting_answer == 2) {
			return reactionsToAns(mes.message.text, mes, chatId);
		} else if (text.slice(0, 6) === '/сложи' && text[6] === ' ') {
			let arr = eval2(text, 6);
			if (arr[0] === '' || arr[1] === '' || isNaN(arr[0] + arr[1]))
				return bot.telegram.sendMessage(chatId, `Wrong input!`)
			else {
				await bot.telegram.sendMessage(chatId, `${arr[0] + arr[1]}`);
				return bot.telegram.sendSticker(chatId, stickers.scientist);
			}
		} else if (text.slice(0, 6) === '/вычти' && text[6] === ' ') {
			let arr = eval2(text, 6);
			if (arr[0] === '' || arr[1] === '' || isNaN(arr[0] - arr[1]))
				return bot.telegram.sendMessage(chatId, `Wrong input!`)
			else {
				await bot.telegram.sendMessage(chatId, `${arr[0] - arr[1]}`);
				return bot.telegram.sendSticker(chatId, stickers.scientist);
			}
		} else if (text.slice(0, 7) === '/умножь' && text[7] === ' ') {
			let arr = eval2(text, 6);
			if (arr[0] === '' || arr[1] === '' || isNaN(arr[0] * arr[1]))
				return bot.telegram.sendMessage(chatId, `Wrong input!`)
			else {
				await bot.telegram.sendMessage(chatId, `${arr[0] * arr[1]}`);
				return bot.telegram.sendSticker(chatId, stickers.scientist);
			}
		} else if (text.slice(0, 7) === '/подели' && text[7] === ' ') {
			let arr = eval2(text, 7);
			if (arr[1] === 0) {
				await bot.telegram.sendMessage(chatId, 'Деление на 0!');
				return bot.telegram.sendSticker(chatId, stickers.too_hard);
			} else if (arr[0] === '' || arr[1] === '' || isNaN(arr[0] / arr[1])) {
				return bot.telegram.sendMessage(chatId, `Wrong input!`)
			} else {
				await bot.telegram.sendMessage(chatId, `${arr[0] / arr[1]}`);
				return bot.telegram.sendSticker(chatId, stickers.scientist);
			}
		} else if (text === '/avatar') {
			let p = await bot.telegram.getUserProfilePhotos(mes.message.from.id);
			return bot.telegram.sendPhoto(chatId, p.photos[0][1].file_id, {
				caption: `Also you have ${p.photos.length - 1} more. Use command /all_avatars to get all your avatars pictures.`
			});
		} else if (text === '/all_avatars') {
			let p = await bot.telegram.getUserProfilePhotos(mes.message.from.id);
			for (let i = 0; i < p.photos.length; i++) {
				await bot.telegram.sendPhoto(chatId, p.photos[p.photos.length - 1 - i][0].file_id);
			}
			return 0;
		} else if (
			text.includes('what') &&
			text.includes('can') &&
			(text.includes('you') || text.includes('u'))
		) {
			return bot.telegram.sendMessage(chatId,
				`Use command /help to get information about bot's capacity.`
			);
		} else if (
			text.includes('hi') ||
			text.includes('hello') ||
			text.includes("whats'up") ||
			text.includes('sup')
		) {
			return bot.telegram.sendMessage(chatId, 'Hey there!');
		} else {
			let resolve = nep.tg(text);
			if(resolve)
				return 1;
		}
		return bot.telegram.sendMessage(chatId, `Sorry, I do not understand you.`);
	})
	bot.on('callback_query', async msg => {
		const data = await msg.callbackQuery.data;
		const chatId = await msg.chat.id;

		nep.chatId = chatId;

		if (data === '/play_again') {
			waiting_answer = 1;
			return await bot.telegram.sendMessage(chatId, 'От нуля до скольки мне загадать число?');
		} else {
			nep.callback_query_hb(data);
		}
		reactionsToAns(data, msg, chatId);
		return 0;
	});
}

bot.telegram.setMyCommands(botCommands);

start();

bot.launch();