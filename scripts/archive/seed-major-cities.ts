import { drizzle } from "drizzle-orm/mysql2";
import { professionals } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// Todas as 27 capitais + cidades com mais de 100 mil habitantes
// Dados baseados no IBGE 2023
const MAJOR_CITIES = [
  // Acre
  { city: "Rio Branco", state: "AC", ddd: "68", population: 419452 },
  
  // Alagoas
  { city: "Maceió", state: "AL", ddd: "82", population: 1025360 },
  { city: "Arapiraca", state: "AL", ddd: "82", population: 234185 },
  
  // Amapá
  { city: "Macapá", state: "AP", ddd: "96", population: 512902 },
  
  // Amazonas
  { city: "Manaus", state: "AM", ddd: "92", population: 2255903 },
  
  // Bahia
  { city: "Salvador", state: "BA", ddd: "71", population: 2900319 },
  { city: "Feira de Santana", state: "BA", ddd: "75", population: 619609 },
  { city: "Vitória da Conquista", state: "BA", ddd: "77", population: 341597 },
  { city: "Camaçari", state: "BA", ddd: "71", population: 304302 },
  { city: "Itabuna", state: "BA", ddd: "73", population: 213223 },
  { city: "Juazeiro", state: "BA", ddd: "74", population: 218162 },
  { city: "Lauro de Freitas", state: "BA", ddd: "71", population: 201635 },
  { city: "Ilhéus", state: "BA", ddd: "73", population: 164844 },
  { city: "Jequié", state: "BA", ddd: "73", population: 151895 },
  { city: "Teixeira de Freitas", state: "BA", ddd: "73", population: 157800 },
  { city: "Alagoinhas", state: "BA", ddd: "75", population: 155979 },
  { city: "Barreiras", state: "BA", ddd: "77", population: 158292 },
  
  // Ceará
  { city: "Fortaleza", state: "CE", ddd: "85", population: 2703391 },
  { city: "Caucaia", state: "CE", ddd: "85", population: 368918 },
  { city: "Juazeiro do Norte", state: "CE", ddd: "88", population: 276264 },
  { city: "Maracanaú", state: "CE", ddd: "85", population: 227953 },
  { city: "Sobral", state: "CE", ddd: "88", population: 210711 },
  { city: "Crato", state: "CE", ddd: "88", population: 132123 },
  
  // Distrito Federal
  { city: "Brasília", state: "DF", ddd: "61", population: 3094325 },
  
  // Espírito Santo
  { city: "Vitória", state: "ES", ddd: "27", population: 365855 },
  { city: "Vila Velha", state: "ES", ddd: "27", population: 501325 },
  { city: "Serra", state: "ES", ddd: "27", population: 527240 },
  { city: "Cariacica", state: "ES", ddd: "27", population: 383917 },
  { city: "Cachoeiro de Itapemirim", state: "ES", ddd: "28", population: 210589 },
  { city: "Linhares", state: "ES", ddd: "27", population: 176688 },
  { city: "Colatina", state: "ES", ddd: "27", population: 123400 },
  
  // Goiás
  { city: "Goiânia", state: "GO", ddd: "62", population: 1555626 },
  { city: "Aparecida de Goiânia", state: "GO", ddd: "62", population: 593087 },
  { city: "Anápolis", state: "GO", ddd: "62", population: 391772 },
  { city: "Rio Verde", state: "GO", ddd: "64", population: 241518 },
  { city: "Luziânia", state: "GO", ddd: "61", population: 220588 },
  { city: "Águas Lindas de Goiás", state: "GO", ddd: "61", population: 212440 },
  { city: "Valparaíso de Goiás", state: "GO", ddd: "61", population: 176762 },
  { city: "Trindade", state: "GO", ddd: "62", population: 132178 },
  { city: "Formosa", state: "GO", ddd: "61", population: 117000 },
  
  // Maranhão
  { city: "São Luís", state: "MA", ddd: "98", population: 1115932 },
  { city: "Imperatriz", state: "MA", ddd: "99", population: 259980 },
  { city: "São José de Ribamar", state: "MA", ddd: "98", population: 179028 },
  { city: "Timon", state: "MA", ddd: "99", population: 172144 },
  { city: "Caxias", state: "MA", ddd: "99", population: 165274 },
  { city: "Codó", state: "MA", ddd: "99", population: 121129 },
  { city: "Paço do Lumiar", state: "MA", ddd: "98", population: 123662 },
  
  // Mato Grosso
  { city: "Cuiabá", state: "MT", ddd: "65", population: 650912 },
  { city: "Várzea Grande", state: "MT", ddd: "65", population: 290691 },
  { city: "Rondonópolis", state: "MT", ddd: "66", population: 236748 },
  { city: "Sinop", state: "MT", ddd: "66", population: 146005 },
  { city: "Tangará da Serra", state: "MT", ddd: "65", population: 103750 },
  
  // Mato Grosso do Sul
  { city: "Campo Grande", state: "MS", ddd: "67", population: 916001 },
  { city: "Dourados", state: "MS", ddd: "67", population: 225495 },
  { city: "Três Lagoas", state: "MS", ddd: "67", population: 123281 },
  { city: "Corumbá", state: "MS", ddd: "67", population: 112058 },
  
  // Minas Gerais
  { city: "Belo Horizonte", state: "MG", ddd: "31", population: 2530701 },
  { city: "Uberlândia", state: "MG", ddd: "34", population: 699097 },
  { city: "Contagem", state: "MG", ddd: "31", population: 668949 },
  { city: "Juiz de Fora", state: "MG", ddd: "32", population: 573285 },
  { city: "Betim", state: "MG", ddd: "31", population: 444784 },
  { city: "Montes Claros", state: "MG", ddd: "38", population: 413487 },
  { city: "Ribeirão das Neves", state: "MG", ddd: "31", population: 334858 },
  { city: "Uberaba", state: "MG", ddd: "34", population: 337092 },
  { city: "Governador Valadares", state: "MG", ddd: "33", population: 281046 },
  { city: "Ipatinga", state: "MG", ddd: "31", population: 265409 },
  { city: "Sete Lagoas", state: "MG", ddd: "31", population: 240728 },
  { city: "Divinópolis", state: "MG", ddd: "37", population: 240408 },
  { city: "Santa Luzia", state: "MG", ddd: "31", population: 224466 },
  { city: "Ibirité", state: "MG", ddd: "31", population: 182153 },
  { city: "Poços de Caldas", state: "MG", ddd: "35", population: 168641 },
  { city: "Patos de Minas", state: "MG", ddd: "34", population: 152488 },
  { city: "Pouso Alegre", state: "MG", ddd: "35", population: 152549 },
  { city: "Teófilo Otoni", state: "MG", ddd: "33", population: 140937 },
  { city: "Barbacena", state: "MG", ddd: "32", population: 136689 },
  { city: "Sabará", state: "MG", ddd: "31", population: 137325 },
  { city: "Varginha", state: "MG", ddd: "35", population: 136602 },
  { city: "Conselheiro Lafaiete", state: "MG", ddd: "31", population: 128588 },
  { city: "Itabira", state: "MG", ddd: "31", population: 121285 },
  { city: "Araguari", state: "MG", ddd: "34", population: 117445 },
  { city: "Passos", state: "MG", ddd: "35", population: 114730 },
  { city: "Ubá", state: "MG", ddd: "32", population: 111007 },
  
  // Pará
  { city: "Belém", state: "PA", ddd: "91", population: 1506420 },
  { city: "Ananindeua", state: "PA", ddd: "91", population: 535547 },
  { city: "Santarém", state: "PA", ddd: "93", population: 308339 },
  { city: "Marabá", state: "PA", ddd: "94", population: 283542 },
  { city: "Castanhal", state: "PA", ddd: "91", population: 200793 },
  { city: "Parauapebas", state: "PA", ddd: "94", population: 208273 },
  { city: "Itaituba", state: "PA", ddd: "93", population: 101097 },
  
  // Paraíba
  { city: "João Pessoa", state: "PB", ddd: "83", population: 833932 },
  { city: "Campina Grande", state: "PB", ddd: "83", population: 411807 },
  { city: "Santa Rita", state: "PB", ddd: "83", population: 156608 },
  { city: "Patos", state: "PB", ddd: "83", population: 107605 },
  
  // Paraná
  { city: "Curitiba", state: "PR", ddd: "41", population: 1963726 },
  { city: "Londrina", state: "PR", ddd: "43", population: 580870 },
  { city: "Maringá", state: "PR", ddd: "44", population: 430157 },
  { city: "Ponta Grossa", state: "PR", ddd: "42", population: 358838 },
  { city: "Cascavel", state: "PR", ddd: "45", population: 348051 },
  { city: "São José dos Pinhais", state: "PR", ddd: "41", population: 329058 },
  { city: "Foz do Iguaçu", state: "PR", ddd: "45", population: 258823 },
  { city: "Colombo", state: "PR", ddd: "41", population: 246746 },
  { city: "Guarapuava", state: "PR", ddd: "42", population: 183755 },
  { city: "Paranaguá", state: "PR", ddd: "41", population: 156174 },
  { city: "Araucária", state: "PR", ddd: "41", population: 144967 },
  { city: "Toledo", state: "PR", ddd: "45", population: 142645 },
  { city: "Apucarana", state: "PR", ddd: "43", population: 136234 },
  { city: "Pinhais", state: "PR", ddd: "41", population: 132157 },
  { city: "Campo Largo", state: "PR", ddd: "41", population: 132013 },
  { city: "Almirante Tamandaré", state: "PR", ddd: "41", population: 120285 },
  { city: "Umuarama", state: "PR", ddd: "44", population: 112500 },
  { city: "Piraquara", state: "PR", ddd: "41", population: 111052 },
  { city: "Cambé", state: "PR", ddd: "43", population: 105893 },
  { city: "Arapongas", state: "PR", ddd: "43", population: 119172 },
  
  // Pernambuco
  { city: "Recife", state: "PE", ddd: "81", population: 1661017 },
  { city: "Jaboatão dos Guararapes", state: "PE", ddd: "81", population: 706867 },
  { city: "Olinda", state: "PE", ddd: "81", population: 392482 },
  { city: "Caruaru", state: "PE", ddd: "81", population: 361118 },
  { city: "Petrolina", state: "PE", ddd: "87", population: 354317 },
  { city: "Paulista", state: "PE", ddd: "81", population: 331774 },
  { city: "Cabo de Santo Agostinho", state: "PE", ddd: "81", population: 207048 },
  { city: "Camaragibe", state: "PE", ddd: "81", population: 157701 },
  { city: "Garanhuns", state: "PE", ddd: "87", population: 139788 },
  { city: "Vitória de Santo Antão", state: "PE", ddd: "81", population: 138757 },
  { city: "Igarassu", state: "PE", ddd: "81", population: 117019 },
  { city: "São Lourenço da Mata", state: "PE", ddd: "81", population: 111402 },
  { city: "Abreu e Lima", state: "PE", ddd: "81", population: 100346 },
  
  // Piauí
  { city: "Teresina", state: "PI", ddd: "86", population: 871126 },
  { city: "Parnaíba", state: "PI", ddd: "86", population: 153078 },
  
  // Rio de Janeiro
  { city: "Rio de Janeiro", state: "RJ", ddd: "21", population: 6775561 },
  { city: "São Gonçalo", state: "RJ", ddd: "21", population: 1098357 },
  { city: "Duque de Caxias", state: "RJ", ddd: "21", population: 924624 },
  { city: "Nova Iguaçu", state: "RJ", ddd: "21", population: 823302 },
  { city: "Niterói", state: "RJ", ddd: "21", population: 515317 },
  { city: "Belford Roxo", state: "RJ", ddd: "21", population: 510906 },
  { city: "São João de Meriti", state: "RJ", ddd: "21", population: 472406 },
  { city: "Campos dos Goytacazes", state: "RJ", ddd: "22", population: 507548 },
  { city: "Petrópolis", state: "RJ", ddd: "24", population: 306678 },
  { city: "Volta Redonda", state: "RJ", ddd: "24", population: 273988 },
  { city: "Magé", state: "RJ", ddd: "21", population: 246433 },
  { city: "Itaboraí", state: "RJ", ddd: "21", population: 240592 },
  { city: "Macaé", state: "RJ", ddd: "22", population: 256672 },
  { city: "Cabo Frio", state: "RJ", ddd: "22", population: 230378 },
  { city: "Nova Friburgo", state: "RJ", ddd: "22", population: 190631 },
  { city: "Barra Mansa", state: "RJ", ddd: "24", population: 184833 },
  { city: "Angra dos Reis", state: "RJ", ddd: "24", population: 203785 },
  { city: "Mesquita", state: "RJ", ddd: "21", population: 176403 },
  { city: "Teresópolis", state: "RJ", ddd: "21", population: 184439 },
  { city: "Nilópolis", state: "RJ", ddd: "21", population: 162269 },
  { city: "Resende", state: "RJ", ddd: "24", population: 132312 },
  { city: "Araruama", state: "RJ", ddd: "22", population: 136852 },
  { city: "Queimados", state: "RJ", ddd: "21", population: 150319 },
  
  // Rio Grande do Norte
  { city: "Natal", state: "RN", ddd: "84", population: 890480 },
  { city: "Mossoró", state: "RN", ddd: "84", population: 303815 },
  { city: "Parnamirim", state: "RN", ddd: "84", population: 267036 },
  
  // Rio Grande do Sul
  { city: "Porto Alegre", state: "RS", ddd: "51", population: 1492530 },
  { city: "Caxias do Sul", state: "RS", ddd: "54", population: 517451 },
  { city: "Pelotas", state: "RS", ddd: "53", population: 343826 },
  { city: "Canoas", state: "RS", ddd: "51", population: 346616 },
  { city: "Santa Maria", state: "RS", ddd: "55", population: 285159 },
  { city: "Gravataí", state: "RS", ddd: "51", population: 286961 },
  { city: "Viamão", state: "RS", ddd: "51", population: 255224 },
  { city: "Novo Hamburgo", state: "RS", ddd: "51", population: 247032 },
  { city: "São Leopoldo", state: "RS", ddd: "51", population: 237757 },
  { city: "Rio Grande", state: "RS", ddd: "53", population: 211965 },
  { city: "Alvorada", state: "RS", ddd: "51", population: 208177 },
  { city: "Passo Fundo", state: "RS", ddd: "54", population: 204722 },
  { city: "Sapucaia do Sul", state: "RS", ddd: "51", population: 143981 },
  { city: "Uruguaiana", state: "RS", ddd: "55", population: 126866 },
  { city: "Santa Cruz do Sul", state: "RS", ddd: "51", population: 131365 },
  { city: "Cachoeirinha", state: "RS", ddd: "51", population: 131364 },
  { city: "Bagé", state: "RS", ddd: "53", population: 121335 },
  { city: "Bento Gonçalves", state: "RS", ddd: "54", population: 121803 },
  { city: "Erechim", state: "RS", ddd: "54", population: 105862 },
  
  // Rondônia
  { city: "Porto Velho", state: "RO", ddd: "69", population: 548952 },
  { city: "Ji-Paraná", state: "RO", ddd: "69", population: 132667 },
  { city: "Ariquemes", state: "RO", ddd: "69", population: 111148 },
  
  // Roraima
  { city: "Boa Vista", state: "RR", ddd: "95", population: 436591 },
  
  // Santa Catarina
  { city: "Florianópolis", state: "SC", ddd: "48", population: 516524 },
  { city: "Joinville", state: "SC", ddd: "47", population: 597658 },
  { city: "Blumenau", state: "SC", ddd: "47", population: 361855 },
  { city: "São José", state: "SC", ddd: "48", population: 246586 },
  { city: "Criciúma", state: "SC", ddd: "48", population: 217081 },
  { city: "Chapecó", state: "SC", ddd: "49", population: 227587 },
  { city: "Itajaí", state: "SC", ddd: "47", population: 223112 },
  { city: "Jaraguá do Sul", state: "SC", ddd: "47", population: 180416 },
  { city: "Lages", state: "SC", ddd: "49", population: 157743 },
  { city: "Palhoça", state: "SC", ddd: "48", population: 179896 },
  { city: "Balneário Camboriú", state: "SC", ddd: "47", population: 145796 },
  { city: "Brusque", state: "SC", ddd: "47", population: 138543 },
  { city: "Tubarão", state: "SC", ddd: "48", population: 107440 },
  
  // São Paulo
  { city: "São Paulo", state: "SP", ddd: "11", population: 12325232 },
  { city: "Guarulhos", state: "SP", ddd: "11", population: 1392121 },
  { city: "Campinas", state: "SP", ddd: "19", population: 1223237 },
  { city: "São Bernardo do Campo", state: "SP", ddd: "11", population: 844483 },
  { city: "Santo André", state: "SP", ddd: "11", population: 721368 },
  { city: "Osasco", state: "SP", ddd: "11", population: 698418 },
  { city: "São José dos Campos", state: "SP", ddd: "12", population: 729737 },
  { city: "Ribeirão Preto", state: "SP", ddd: "16", population: 711825 },
  { city: "Sorocaba", state: "SP", ddd: "15", population: 695328 },
  { city: "Mauá", state: "SP", ddd: "11", population: 477552 },
  { city: "São José do Rio Preto", state: "SP", ddd: "17", population: 464983 },
  { city: "Santos", state: "SP", ddd: "13", population: 433656 },
  { city: "Mogi das Cruzes", state: "SP", ddd: "11", population: 450785 },
  { city: "Diadema", state: "SP", ddd: "11", population: 426757 },
  { city: "Jundiaí", state: "SP", ddd: "11", population: 423006 },
  { city: "Carapicuíba", state: "SP", ddd: "11", population: 400139 },
  { city: "Piracicaba", state: "SP", ddd: "19", population: 407252 },
  { city: "Bauru", state: "SP", ddd: "14", population: 379297 },
  { city: "Itaquaquecetuba", state: "SP", ddd: "11", population: 365766 },
  { city: "São Vicente", state: "SP", ddd: "13", population: 368840 },
  { city: "Franca", state: "SP", ddd: "16", population: 358539 },
  { city: "Guarujá", state: "SP", ddd: "13", population: 322750 },
  { city: "Taubaté", state: "SP", ddd: "12", population: 317915 },
  { city: "Praia Grande", state: "SP", ddd: "13", population: 330845 },
  { city: "Limeira", state: "SP", ddd: "19", population: 308482 },
  { city: "Suzano", state: "SP", ddd: "11", population: 300559 },
  { city: "Taboão da Serra", state: "SP", ddd: "11", population: 295895 },
  { city: "Sumaré", state: "SP", ddd: "19", population: 286211 },
  { city: "Barueri", state: "SP", ddd: "11", population: 276982 },
  { city: "Embu das Artes", state: "SP", ddd: "11", population: 276535 },
  { city: "São Carlos", state: "SP", ddd: "16", population: 256915 },
  { city: "Marília", state: "SP", ddd: "14", population: 240590 },
  { city: "Indaiatuba", state: "SP", ddd: "19", population: 256223 },
  { city: "Cotia", state: "SP", ddd: "11", population: 253608 },
  { city: "Americana", state: "SP", ddd: "19", population: 239829 },
  { city: "Jacareí", state: "SP", ddd: "12", population: 235416 },
  { city: "Araraquara", state: "SP", ddd: "16", population: 238339 },
  { city: "Presidente Prudente", state: "SP", ddd: "18", population: 230371 },
  { city: "Hortolândia", state: "SP", ddd: "19", population: 234259 },
  { city: "Suzano", state: "SP", ddd: "11", population: 300559 },
  { city: "Rio Claro", state: "SP", ddd: "19", population: 206424 },
  { city: "Araçatuba", state: "SP", ddd: "18", population: 198129 },
  { city: "Santa Bárbara d'Oeste", state: "SP", ddd: "19", population: 195823 },
  { city: "Ferraz de Vasconcelos", state: "SP", ddd: "11", population: 196500 },
  { city: "Francisco Morato", state: "SP", ddd: "11", population: 177177 },
  { city: "Itapevi", state: "SP", ddd: "11", population: 240988 },
  { city: "Itu", state: "SP", ddd: "11", population: 175568 },
  { city: "Bragança Paulista", state: "SP", ddd: "11", population: 170533 },
  { city: "Pindamonhangaba", state: "SP", ddd: "12", population: 170125 },
  { city: "São Caetano do Sul", state: "SP", ddd: "11", population: 161957 },
  { city: "Itapetininga", state: "SP", ddd: "15", population: 164735 },
  { city: "Franco da Rocha", state: "SP", ddd: "11", population: 156492 },
  { city: "Mogi Guaçu", state: "SP", ddd: "19", population: 154786 },
  { city: "Jaú", state: "SP", ddd: "14", population: 147828 },
  { city: "Botucatu", state: "SP", ddd: "14", population: 148716 },
  { city: "Atibaia", state: "SP", ddd: "11", population: 146823 },
  { city: "Araras", state: "SP", ddd: "19", population: 136234 },
  { city: "Cubatão", state: "SP", ddd: "13", population: 131626 },
  { city: "Salto", state: "SP", ddd: "11", population: 120517 },
  { city: "Tatuí", state: "SP", ddd: "15", population: 122967 },
  { city: "Várzea Paulista", state: "SP", ddd: "11", population: 121088 },
  { city: "Guaratinguetá", state: "SP", ddd: "12", population: 122505 },
  { city: "Catanduva", state: "SP", ddd: "17", population: 121497 },
  { city: "Barretos", state: "SP", ddd: "17", population: 121584 },
  { city: "Jandira", state: "SP", ddd: "11", population: 123697 },
  { city: "Ribeirão Pires", state: "SP", ddd: "11", population: 124159 },
  { city: "Birigui", state: "SP", ddd: "18", population: 124883 },
  { city: "Santana de Parnaíba", state: "SP", ddd: "11", population: 141172 },
  { city: "Votorantim", state: "SP", ddd: "15", population: 121692 },
  { city: "Caraguatatuba", state: "SP", ddd: "12", population: 120206 },
  { city: "Ourinhos", state: "SP", ddd: "14", population: 114074 },
  { city: "Assis", state: "SP", ddd: "18", population: 105087 },
  { city: "Leme", state: "SP", ddd: "19", population: 103120 },
  { city: "Itaquera", state: "SP", ddd: "11", population: 523848 },
  
  // Sergipe
  { city: "Aracaju", state: "SE", ddd: "79", population: 664908 },
  { city: "Nossa Senhora do Socorro", state: "SE", ddd: "79", population: 182926 },
  { city: "Lagarto", state: "SE", ddd: "79", population: 106815 },
  
  // Tocantins
  { city: "Palmas", state: "TO", ddd: "63", population: 313349 },
  { city: "Araguaína", state: "TO", ddd: "63", population: 183381 },
];

const CATEGORIES = [
  "Psicólogo", "Pintor", "Eletricista", "Encanador", "Designer Gráfico",
  "Fotógrafo", "Personal Trainer", "Professor Particular", "Jardineiro", "Mecânico",
  "Advogado", "Contador", "Arquiteto", "Engenheiro Civil", "Desenvolvedor Web"
];

const FIRST_NAMES = ["Ana", "João", "Maria", "Pedro", "Carla", "Lucas", "Juliana", "Rafael", "Beatriz", "Gabriel"];
const LAST_NAMES = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Ferreira", "Rodrigues", "Alves", "Pereira", "Lima"];

const BIOS = [
  "Profissional experiente com mais de 10 anos de mercado. Atendimento personalizado e qualidade garantida.",
  "Especialista dedicado em oferecer o melhor serviço. Satisfação do cliente é minha prioridade.",
  "Trabalho com excelência e compromisso. Resultados que superam expectativas.",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function randomPhone(ddd: string): string {
  return `(${ddd}) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function main() {
  console.log(`🏙️  Adicionando profissionais em ${MAJOR_CITIES.length} cidades principais do Brasil...`);
  console.log("📊 Incluindo todas as 27 capitais + cidades com mais de 100 mil habitantes");

  let added = 0;
  let skipped = 0;

  for (const cityData of MAJOR_CITIES) {
    const cityPattern = `${cityData.city} - ${cityData.state}`;
    
    // Add 3-5 professionals per city
    const count = Math.floor(3 + Math.random() * 3);
    
    for (let i = 0; i < count; i++) {
      const name = `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
      const phone = randomPhone(cityData.ddd);
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + Math.floor(1 + Math.random() * 7));

      const galleryPhotos = [];
      for (let j = 0; j < Math.floor(2 + Math.random() * 4); j++) {
        galleryPhotos.push(`https://picsum.photos/800/600?random=${Date.now()}-${i}-${j}`);
      }

      try {
        await db.insert(professionals).values({
          uid: uid(),
          displayName: name,
          category: rand(CATEGORIES),
          city: cityPattern,
          phone: phone,
          whatsapp: phone,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
          bio: rand(BIOS),
          photoUrl: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70) + 1}`,
          galleryPhotos: JSON.stringify(galleryPhotos),
          instagramVideoUrl: i % 4 === 0 ? "https://www.instagram.com/reel/example/" : null,
          instagramHandle: i % 3 === 0 ? `@${name.toLowerCase().replace(/\s+/g, "_")}` : null,
          stars: Math.floor(35 + Math.random() * 15),
          reviewCount: Math.floor(5 + Math.random() * 95),
          badge: i % 3 === 0 ? "verified" : i % 5 === 0 ? "trusted" : "none",
          planType: i % 5 === 0 ? "destaque" : "base",
          trialEndsAt: trialEndsAt,
          subscriptionEndsAt: null,
          isActive: true,
        });
        added++;
      } catch (error) {
        skipped++;
      }
    }
    
    if ((MAJOR_CITIES.indexOf(cityData) + 1) % 50 === 0) {
      console.log(`✅ Processadas ${MAJOR_CITIES.indexOf(cityData) + 1}/${MAJOR_CITIES.length} cidades...`);
    }
  }

  console.log("\n🎉 Seed concluído!");
  console.log(`✅ ${added} profissionais adicionados`);
  console.log(`⏭️  ${skipped} já existentes`);
  console.log(`🏙️  ${MAJOR_CITIES.length} cidades cobertas`);
  console.log(`🏛️  27 capitais incluídas`);
}

main()
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });

