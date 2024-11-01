const { SerialPort } = require('serialport');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000; // Porta do servidor

app.use(cors()); // Permite que o Next.js acesse o servidor
app.use(express.json()); // Middleware para parsear JSON no corpo das requisições

let unoData;
let port;

// Função para conectar à porta serial
const connectToPort = () => {
  const portName = 'COM6'; // Ajuste o nome da porta conforme necessário
  const baudRate = 9600; // Taxa de baud deve ser a mesma configurada no Arduino

  port = new SerialPort({
    path: portName,
    baudRate: baudRate,
  });

  // Evento de recebimento de dados
  port.on('data', (data) => {
    unoData = parseInt(data.toString());
  });

  // Tratamento de erro
  port.on('error', (err) => {
    console.error('Erro: ', err.message);
    attemptReconnect();
  });

  // Detecta fechamento da porta
  port.on('close', () => {
    console.log('Conexão perdida. Tentando reconectar...');
    unoData = null; // Resetar dados ao perder conexão
    attemptReconnect();
  });
};

// Função para tentar reconectar
const attemptReconnect = () => {
  setTimeout(() => {
    console.log('Tentando reconectar...');
    connectToPort();
  }, 5000); // Tente reconectar a cada 5 segundos
};

// Inicializa a conexão ao iniciar o servidor
connectToPort();

app.get('/api/data', (req, res) => {
  res.json({ unoData });
  console.log(unoData);
});

app.post('/api/gate', (req, res) => {
  const command = req.body.data; // Corrigido com express.json()

  if (!command) {
    return res.status(400).send("Comando não fornecido.");
  }

  if (command === "close") {
    port.write("C1", (err) => {  // Envia comando "C1" ao Arduino
      if (err) {
        console.error("Erro ao enviar comando 'C1' para o Arduino:", err);
        return res.status(500).send("Erro ao enviar comando para o Arduino.");
      }
      res.send("Comando para fechar enviado com sucesso.");
    });
  } else if (command === "open") {
    port.write("C2", (err) => {  // Envia comando "C2" ao Arduino
      if (err) {
        console.error("Erro ao enviar comando 'C2' para o Arduino:", err);
        return res.status(500).send("Erro ao enviar comando para o Arduino.");
      }
      res.send("Comando para abrir enviado com sucesso.");
    });
  } else {
    res.status(400).send("Comando inválido.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
