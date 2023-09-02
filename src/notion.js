import { Client } from '@notionhq/client'
import config from 'config'

const notion = new Client({
  auth: config.get('NOTION_KEY'),
})

export async function create(short, text) {
  const dbResponse = await notion.pages.create({
    parent: { database_id: config.get('NOTION_DB_ID') },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: short,
            },
          },
        ],
      },
      Date: {
        date: {
          start: new Date().toISOString(),
        },
      },
    },
  })

  const pageResponse = await notion.blocks.children.append({
    block_id: dbResponse.id,
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: text,
              },
            },
          ],
        },
      },
    ],
  })

  return dbResponse
}
