"use client";
import './globals.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image'; // Importando o componente Image
import Logo from '../assets/logo.png'; // Certifique-se de que a imagem esteja no caminho correto

export default function Home() {
  const [flowRate, setFlowRate] = useState(0); // Vazão
  const [servoPosition, setServoPosition] = useState(100); // Posição do servo (0-100%)
  const [consoleOutput, setConsoleOutput] = useState(''); // Saída do console
  const [waterFlowing, setWaterFlowing] = useState(false); // Indicador de fluxo de água
  const [connection, setConnection] = useState(false);
  const [gate, setGate] = useState(false);

  const consoleEndRef = useRef<HTMLDivElement>(null); // Referência para o final do console

  // Função para buscar dados do servidor
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/data'); // Endpoint do servidor
      const data = response.data;

      if (data.unoData !== null) {
        setFlowRate(data.unoData);
        setServoPosition(data.unoData);
        setWaterFlowing(data.unoData > 0); // Define se há fluxo com base na vazão

        const currentTime = new Date().toLocaleTimeString(); // Obter o horário atual
        setConsoleOutput((prev) => `${prev}\n[${currentTime}] Vazão: ${data.unoData.toFixed(2)} L/min`);
        setConnection(true);
      } else {
        setFlowRate(0);
        setServoPosition(0);
        setWaterFlowing(false);

        const currentTime = new Date().toLocaleTimeString(); // Obter o horário atual
        setConsoleOutput((prev) => `${prev}\n[${currentTime}] Vazão: Desconectado L/min`);
        setConnection(false);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  // Função para alternar estado da comporta e enviar a requisição ao servidor
  const toggleGate = async () => {
    try {
      const action = gate ? 'close' : 'open'; // Define a ação com base no estado atual
      const response = await axios.post('http://localhost:5000/api/gate', {
        data: action,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setGate(!gate); // Atualiza o estado apenas após confirmação do servidor
        
        // Adiciona comando ao console
        const currentTime = new Date().toLocaleTimeString();
        setConsoleOutput((prev) => `${prev}\n[${currentTime}] Comando: ${gate ? 'Fechar' : 'Abrir'} comportas`);
      }
    } catch (error) {
      console.error('Erro ao alterar estado da comporta:', error);
    }
  };

  // Função para manter o scroll no final do console
  const scrollToBottom = () => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Atualiza os dados a cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Efeito para manter o console rolando automaticamente
  useEffect(() => {
    scrollToBottom();
  }, [consoleOutput]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className='flex p-4 w-screen justify-between items-center' style={{ backgroundColor: '#08678B' }}>
        <div className="relative w-64 h-10">
          <Image
            src={Logo}
            alt="Logo"
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-white">Painel de Controle Salpa</h1>
      </header>
      <div className='grid grid-cols-2 h-screen' style={{ gridTemplateColumns: "2fr 1fr" }}>
        <section className='flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400'>
          <div className="mb-8">
            <div
              className={`w-32 h-32 border-4 rounded-full flex items-center justify-center ${waterFlowing ? 'border-green-500' : 'border-gray-300'
                }`}
            >
              <div
                className={`w-12 h-12 border-4 border-blue-400 rounded-full animate-spin ${waterFlowing ? 'block' : 'hidden'
                  }`}
              >
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              </div>
            </div>
            <p className="mt-2 text-lg">{waterFlowing ? 'Água Fluindo' : 'Sem Fluxo'}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl">Vazão: {flowRate !== null ? flowRate.toFixed(2) : 'Desconectado'} L/min</h2>
            <h2 className="text-xl">Posição do Servo: {servoPosition !== null ? servoPosition : 'Desconectado'}%</h2>
          </div>

        </section>
        <section className='flex flex-col items-center border-b-2 border-gray-400'>
          <div className=' w-5/6 mt-10'>
            <h2 className="text-xl">Status de conexão:</h2>
            <div className='flex items-center'>
              <i className={`material-icons mr-2 ${connection ? 'text-green-600' : 'text-red-600'}`}>
                {connection ? 'wifi' : 'signal_wifi_off'}
              </i>
              <h1 className={`text-3xl font-bold mb-0 ${connection ? 'text-green-600' : 'text-red-600'}`}>{connection ? 'Conectado' : 'Não conectado'}</h1>
            </div>
            <h2 className="text-xl mt-7">Informações:</h2>
            <p>Porta conectada: {connection ? 'COM6' : '-'}</p>
            <p>BaudRate: {connection ? '9600' : '-'}</p>
          </div>
        </section>
        <section className='flex justify-center gap-10 items-center border-r-2 border-gray-400'>
          <div className="mb-8 w-3/5 mt-10">
            <h2 className="text-xl">Console:</h2>
            <pre className="bg-gray-200 p-4 rounded border border-gray-300 h-48 overflow-y-auto">
              {consoleOutput}
              <div ref={consoleEndRef} />
            </pre>
          </div>
          <div className='flex flex-col items-center gap-6'>
            <div className='flex items-center'>
              <i className={`material-icons mr-2 transition duration-300 ${gate ? 'text-green-600' : 'text-red-600'}`}>
                {gate ? 'opacity' : 'block'}
              </i>
              <h2 className={`text-xl font-bold mb-0 transition duration-300 ${gate ? 'text-green-600' : 'text-red-600'}`}>{gate ? 'Comportas abertas' : 'Comportas fechadas'}</h2>
            </div> 
            <button
              onClick={toggleGate} 
              className={`p-5 rounded-lg border-2 transition duration-300 ${gate
                  ? 'bg-red-200 border-red-800 hover:bg-red-400 hover:text-white'  
                  : 'bg-green-200 border-green-800 hover:bg-green-400 hover:text-white'        
                }`}
            >
              {gate ? 'Fechar comportas' : 'Abrir comportas'}
            </button>
          </div>
        </section>
        <section className='flex items-center justify-center'>
          <div className='bg-gray-200 p-4 rounded border border-gray-300 w-5/6 h-5/6'>
            <h2 className="text-xl">Informações do sistema:</h2>
            <p>Versão do controle de vasão: v0.1</p>
            <p>Versão do painel de controle: v0.1</p>
            <p className='mt-20'>Desenvolvido por Rodrigo Dini</p>
          </div>
        </section>
      </div>
    </div>
  );
}
