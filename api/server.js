const IS_PRODUCT = false

require('dotenv').config()
const knex = require('knex')(
    IS_PRODUCT ?
        {
            client: 'mysql',
            connection: {
                socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE
            }
        }
        :
        {
            client: 'mysql',
            connection: {
                host: `127.0.0.1`,
                port: `3306`,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE
            }
        }
)

const express = require('express')
const bodyParser = require("express")
const res = require('express/lib/response')
const app = express()
app.use(express.json())
app.use(require('cors')())
app.use(bodyParser.urlencoded({ extended: true }))

//todo 非同期とかわからんからとりあえず直列で
app.get('*', (request, response) => {
    response.set({ 'Access-Control-Allow-Origin': '*' })
    knex('posts')
        .select('*')
        .where('parent_path', decodeURI(request.params[0]))
        .orWhere('current_path', decodeURI(request.params[0]))
            .then(posts => {
                const parentPosts = []
                const currentPosts = []
                const childPosts = [[]]
                
                
                response.json(posts)
            })
            .catch(error => {
                response.json([])
                console.log(error)
            })
})

app.post('/', (request, response) => {
    response.set({ 'Access-Control-Allow-Origin': '*' })
    console.log(JSON.stringify(request.body))
    const {
        current_path,
        parent_path,
        public_key_hex,
        screen_name,
        der_signature,
        message,
    } = request.body
 
    knex('posts').insert({
        "current_path": decodeURI(current_path),
        "parent_path": decodeURI(parent_path),
        "public_key_hex": public_key_hex,
        "screen_name": screen_name,
        "der_signature": der_signature,
        "message": message
    })
        .then(r => response.json(r))
        .catch(e => console.log(e))
})

const port = parseInt(process.env.PORT) || 8080
app.listen(port, () => console.log(`port: ${port}`))