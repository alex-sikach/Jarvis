class Handbook {
    constructor(options) {
        this.names = options.names.map(el => el.toLowerCase()); //array ['nep', 'нэп']
        this.defaultMessage = options.defaultMessage;
        this.fullPath = options.fullPath; //example: [ 'war1/pict1.jpg' ]
        //branches
        /*  example:
        *   [
        *       {text: 'Цель', callback_data: 'nep_targets'},
        *       {text: 'Мероприятия', callback_data: 'nep_events'},
        *       {text: 'Итоги', callback_data: 'nep_results'}
        *   ]
        */
        //branches
        this.branches = {};
        this.branches.reply_markup = {};
        this.branches.reply_markup.inline_keyboard = [];
        this.branches.reply_markup.inline_keyboard[0] = options.branches;
        //bot
        this.bot = options.bot;
        //chatId
        this.chatId = options.chatId;
    }
    callback_query_hb = async (data) => {
        for (let i in this.branches.reply_markup.inline_keyboard[0]) {
            let ar = this.branches.reply_markup.inline_keyboard[0][i];
            if(data === ar.callback_data) {
                if(this.defaultMessage !== undefined) {
                    await this.bot.telegram.sendMessage(this.chatId, this.defaultMessage);
                }
                if(this.fullPath !== undefined)
                    return this.bot.telegram.sendPhoto(this.chatId, {source: `./img/handbook/${this.fullPath[i]}`})
                else
                    return this.bot.telegram.sendMessage(this.chatId, '404. There is no pictures. Try a bit later.');
                break;
            }
        }
    }
    tg = (msg) => {
        if(this.names.includes(msg))
            return this.bot.telegram.sendMessage(this.chatId, 'Выберите раздел', this.branches);
    }
}

module.exports.Handbook = Handbook;

/*
* Example of using:
* import {Handbook} from '...';
*
* const test = new Handbook({
*   names: ['test', 'Тест'],
*	defaultMessage: 'Hello, do you need a help?)',
*	fullPath: [
*		'test/test.jpg',
*		'test/test2.jpg'
*	],
*	branches: [
*		{text: 'text one. first', callback_data: 'one'},
*		{text: 'text two. second', callback_data: 'two'}
*	],
*	bot: bot,
*	chatId: ''
*})
*
* Where 'test/test.jpg' -> 'one', 'test/test2.jpg' -> 'two'
*
*  */