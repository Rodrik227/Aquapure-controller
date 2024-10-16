const { SerialPort } = require('serialport');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000; // A porta em que o servidor irá escutar

app.use(cors()); // Permite que o Next.js acesse o servidor

let unoData;
let port;

const connectToPort = () => {
  // Ajuste para o caminho da sua porta
  const portName = 'COM3'; // Altere conforme necessário
  const baudRate = 9600; // Deve ser o mesmo que no seu código Arduino

  port = new SerialPort({
    path: portName,
    baudRate: baudRate,
  });

  // Lê os dados do Arduino
  port.on('data', (data) => {
    unoData = parseInt(data.toString());
  });

  // Tratar erros
  port.on('error', (err) => {
    console.error('Erro: ', err.message);
    attemptReconnect();
  });

  // Detectar quando a porta é fechada
  port.on('close', () => {
    console.log('Conexão perdida. Tentando reconectar...');
    unoData = null; // Resetar dados ao perder conexão
    attemptReconnect(); // Tentar reconectar
  });
};

// Função para tentar reconectar
const attemptReconnect = () => {
  setTimeout(() => {
    console.log('Tentando reconectar...');
    connectToPort(); // Tentar se reconectar
  }, 5000); // Tente reconectar a cada 5 segundos
};

// Inicializa a conexão ao iniciar o servidor
connectToPort();

app.get('/api/data', (req, res) => {
  res.json({ unoData });
  console.log(unoData);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
