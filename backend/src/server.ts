import { app } from './app.js'

const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '127.0.0.1'

app.listen(PORT, HOST, () => {
    console.log(`servidor rodando na porta http://${HOST}:${PORT}`)
});
