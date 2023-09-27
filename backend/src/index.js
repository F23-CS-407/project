import createApp from "./app.js"

// start the app
const server = (await createApp()).listen(3000, function () {
    let host = server.address().address
    let port = server.address().port
})