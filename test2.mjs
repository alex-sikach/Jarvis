import security from './security.js';
import { Telegraf } from 'telegraf';
// import stickers from './stickers.js';
// import fetch from 'node-fetch';
const bot = new Telegraf(security.TELEGRAM_BOT_TOKEN);

var arr = [];

bot.on('message', async ctx => {
	let text = await ctx.message.text.toLowerCase();
	let id = await ctx.chat.id;
	if (text === 'random') {
		new Promise((resolve, reject) => {
			bot.on('message', ctx2 => {
				arr[0] = ctx2.message.text;
				resolve();
			});
			// bot.on('message', () => { });
			// return bot.telegram.sendMessage(id, arr[0]);
		})
			.then(() => {
				console.log(arr[0]);
			})
	}

	return bot.telegram.sendMessage(id, '...');
})
// bot.on('message', async ctx => {
// 	let text = ctx.message.text;
// 	let id = ctx.chat.id;
// 	if (text === 'random') {
// 		bot.on('message', ctx2 => {
// 			var maxv = await ctx2.message.text;
// 		})
// 		let number = Math.floor(Math.random() * maxv)
// 	}
// 	return bot.telegram.sendMessage(id, '...');
// });

bot.launch();