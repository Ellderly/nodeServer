// Устанавливаем необходимые библиотеки
const express = require('express')
const WebSocket = require('ws')
const http = require('http')

// Инициализируем сервер
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let usersCount = 0 // Счетчик активных пользователей

app.get('/', (req, res) => {
	// Отправляем HTML-страницу с индикатором количества пользователей
	res.send(`
    <h2>Количество активных пользователей: <span id="usersCount">0</span></h2>
    <script>
      const ws = new WebSocket('ws://' + location.host);
      ws.onmessage = function(event) {
        document.getElementById('usersCount').textContent = event.data;
      };
    </script>
  `)
})

wss.on('connection', ws => {
	// При новом подключении увеличиваем счетчик и обновляем данные у всех
	usersCount++
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(usersCount)
		}
	})

	ws.on('close', () => {
		// При отключении пользователя уменьшаем счетчик и обновляем данные
		usersCount--
		wss.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(usersCount)
			}
		})
	})
})

server.listen(3000, () => {
	console.log('Сервер запущен на http://localhost:3000')
})
