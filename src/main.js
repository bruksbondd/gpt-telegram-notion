import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'
import { chatGPT } from './chatgpt.js'
import { create } from './notion.js'
import { Loader } from './loader.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'), {
  handlerTimeout: Infinity,
})

bot.command('start', (ctx) =>
  ctx.reply(
    'Добро пожаловать. Отправьте текстовое сообщение с тезисами про историю.'
  )
)
bot.on(message('text'), proccessGPTResponse)

bot.launch()

async function proccessGPTResponse(ctx) {
  try {
    const text = ctx.message.text
    if (!text.trim()) ctx.reply('Текст не может быть пустым')
    const loader = new Loader(ctx)
    loader.show()
    const response = await chatGPT(text)

    if (!response) return ctx.reply(`Ошибка с API. ${response}`)

    const notionResp = await create(text, response.content)
    loader.hide()
    ctx.reply(`Ваша страница: ${notionResp.url}`)
  } catch (e) {
    console.log(`Error while proccessing gpt response`, e.message)
  }
}
