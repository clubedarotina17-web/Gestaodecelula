
import { Cell } from './types';

export const ADMIN_PASSWORD = 'Gestaodecelulaviver';

export const INITIAL_CELLS: Cell[] = [
  // Dom Bosco
  {
    id: '1', name: 'Visão de Águia (Fabiana)', leader: 'Fabiana Carla', host: 'Igreja', trainee: 'Em treinamento', secretary: 'N/A', team: ['Equipe A'], 
    address: 'Rio Negro 905, Dom Bosco | Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Dom Bosco', phone: '31900000001'
  },
  {
    id: '2', name: 'Visão de Águia (Lurdinha)', leader: 'Lurdinha', host: 'Casa Lurdinha', trainee: 'N/A', secretary: 'N/A', team: ['Equipe B'], 
    address: 'Rua: Aurioca 81, Dom Bosco | Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Dom Bosco', phone: '31900000002'
  },
  {
    id: '3', name: 'Guerreiros de Jesus', leader: 'Humberto', host: 'Casa Humberto', trainee: 'N/A', secretary: 'N/A', team: ['Equipe C'], 
    address: 'Rua Av Dom Bosco, n 60. Dom Bosco – Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Dom Bosco', phone: '31900000003'
  },
  {
    id: '4', name: 'Conexão Jovem', leader: 'Jane Kelly', host: 'Casa Jane', trainee: 'N/A', secretary: 'N/A', team: ['Equipe Jovem'], 
    address: 'Rua Domingos Belém 402, Dom Bosco | Betim MG', type: 'Jovem', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Dom Bosco', phone: '31900000004'
  },
  {
    id: '5', name: 'Célula Cristo Viver', leader: 'Ricardo Motta', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe Jovem B'], 
    address: 'Rua: São Geraldo, 612 Dom Bosco – Betim MG', type: 'Jovem', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Dom Bosco', phone: '31900000005'
  },
  // Alterosas
  {
    id: '6', name: 'Fé em Ação', leader: 'Anderson Daniel', host: 'Casa Anderson', trainee: 'N/A', secretary: 'N/A', team: ['Equipe D'], 
    address: 'Av: Havana 61, Duque de Caxias | Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000006'
  },
  {
    id: '7', name: 'Célula Unânimes', leader: 'Robson Tavares', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe E'], 
    address: 'Rua Dama da Noite 193 B, Alterosas 2°C, – Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000007'
  },
  {
    id: '8', name: 'A Forja', leader: 'Jonathan Henrique', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe F'], 
    address: 'Rua Cravinas 301 bairro Alterosa 2ª seção | Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000008'
  },
  {
    id: '9', name: 'Visão de Águia (Geraldo)', leader: 'Geraldo Henrique', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe G'], 
    address: 'Borboleta 200, Jardim Alterosas 2° seção | Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000009'
  },
  {
    id: '10', name: 'Começo de uma nova história', leader: 'Fabiano', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe H'], 
    address: 'Rua Borboleta 200 alterosa 2 seção – Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000010'
  },
  {
    id: '11', name: 'Célula Luz do Mundo', leader: 'Márcia Antônia', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe Juvenil'], 
    address: 'Rua Dom Afonso Henrique 539, Jardim Alterosas 1 seção – Betim MG', type: 'Juvenil', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000011'
  },
  {
    id: '12', name: 'Visão de Águia (Rodrigues)', leader: 'Fabiana Rodrigues', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe I'], 
    address: 'Borboleta 200, Jardim Alterosas 2° seção | Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000012'
  },
  {
    id: '13', name: 'Célula Ágape', leader: 'Pedro', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe Jovem C'], 
    address: 'Rua Sapatinho, n 120. Jardim das Alterosas – Betim MG', type: 'Jovem', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000013'
  },
  {
    id: '14', name: 'Filhos Perdidos', leader: 'Karen', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe Jovem D'], 
    address: 'Rua dama da noite 279 , jardim alterosa 2º seção – Betim MG', type: 'Jovem', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Alterosas', phone: '31900000014'
  },
  // Campos Elíseo
  {
    id: '15', name: 'Célula Visceral', leader: 'Gilson Nascimento', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe K'], 
    address: 'Rua Rio Amapá 456A Campos Elíseos – Betim MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Campos Elíseos', phone: '31900000015'
  },
  // Marquês Industrial
  {
    id: '16', name: 'Coração do Pai', leader: 'Jhonatas Cristian', host: 'N/A', trainee: 'N/A', secretary: 'N/A', team: ['Equipe L'], 
    address: 'França 315, Marquês Industrial / São Joaquim de Bicas MG', type: 'Adulto', day: 'Quinta-Feira', time: '20:00 - 21:00', region: 'Marquês Industrial', phone: '31900000016'
  }
];
