import { drizzle } from "drizzle-orm/mysql2";
import { professionals, categories } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// Lista completa de profissões autônomas
const CATEGORIES_DATA = [
  { name: "Psicólogo", icon: "🧠" },
  { name: "Pintor", icon: "🎨" },
  { name: "Eletricista", icon: "⚡" },
  { name: "Encanador", icon: "🔧" },
  { name: "Designer Gráfico", icon: "✨" },
  { name: "Fotógrafo", icon: "📸" },
  { name: "Personal Trainer", icon: "💪" },
  { name: "Professor Particular", icon: "📚" },
  { name: "Jardineiro", icon: "🌱" },
  { name: "Mecânico", icon: "🔩" },
  { name: "Advogado", icon: "⚖️" },
  { name: "Contador", icon: "📊" },
  { name: "Arquiteto", icon: "🏛️" },
  { name: "Engenheiro Civil", icon: "🏗️" },
  { name: "Desenvolvedor Web", icon: "💻" },
  { name: "Marketing Digital", icon: "📱" },
  { name: "Consultor Financeiro", icon: "💰" },
  { name: "Nutricionista", icon: "🥗" },
  { name: "Fisioterapeuta", icon: "🏥" },
  { name: "Dentista", icon: "🦷" },
  { name: "Veterinário", icon: "🐾" },
  { name: "Cabeleireiro", icon: "💇" },
  { name: "Manicure", icon: "💅" },
  { name: "Maquiador", icon: "💄" },
  { name: "Barbeiro", icon: "✂️" },
  { name: "Massagista", icon: "💆" },
  { name: "Chef de Cozinha", icon: "👨‍🍳" },
  { name: "Confeiteiro", icon: "🍰" },
  { name: "Padeiro", icon: "🥖" },
  { name: "Costureira", icon: "🧵" },
  { name: "Alfaiate", icon: "👔" },
  { name: "Sapateiro", icon: "👞" },
  { name: "Marceneiro", icon: "🪚" },
  { name: "Serralheiro", icon: "🔨" },
  { name: "Vidraceiro", icon: "🪟" },
  { name: "Pedreiro", icon: "🧱" },
  { name: "Azulejista", icon: "🔲" },
  { name: "Gesseiro", icon: "⬜" },
  { name: "Carpinteiro", icon: "🪵" },
  { name: "Tapeceiro", icon: "🛋️" },
  { name: "Chaveiro", icon: "🔑" },
  { name: "Dedetizador", icon: "🦟" },
  { name: "Limpeza Residencial", icon: "🧹" },
  { name: "Limpeza de Piscina", icon: "🏊" },
  { name: "Instalador de Ar Condicionado", icon: "❄️" },
  { name: "Técnico de Informática", icon: "🖥️" },
  { name: "Técnico de Celular", icon: "📱" },
  { name: "Técnico de TV", icon: "📺" },
  { name: "Técnico de Geladeira", icon: "🧊" },
  { name: "Técnico de Máquina de Lavar", icon: "🌀" },
  { name: "Motorista Particular", icon: "🚗" },
  { name: "Entregador", icon: "📦" },
  { name: "Mudanças", icon: "🚚" },
  { name: "Segurança Particular", icon: "🛡️" },
  { name: "Detetive Particular", icon: "🕵️" },
  { name: "Tradutor", icon: "🌐" },
  { name: "Intérprete", icon: "🗣️" },
  { name: "Redator", icon: "✍️" },
  { name: "Revisor de Textos", icon: "📝" },
  { name: "Editor de Vídeo", icon: "🎬" },
  { name: "Cinegrafista", icon: "🎥" },
  { name: "DJ", icon: "🎧" },
  { name: "Músico", icon: "🎸" },
  { name: "Cantor", icon: "🎤" },
  { name: "Ator", icon: "🎭" },
  { name: "Modelo", icon: "👗" },
  { name: "Animador de Festas", icon: "🎉" },
  { name: "Mágico", icon: "🎩" },
  { name: "Palhaço", icon: "🤡" },
  { name: "Organizador de Eventos", icon: "🎊" },
  { name: "Decorador", icon: "🎀" },
  { name: "Florista", icon: "💐" },
  { name: "Paisagista", icon: "🌳" },
  { name: "Adestrador de Cães", icon: "🐕" },
  { name: "Pet Sitter", icon: "🐶" },
  { name: "Dog Walker", icon: "🦮" },
  { name: "Tosador de Animais", icon: "✂️" },
  { name: "Instrutor de Yoga", icon: "🧘" },
  { name: "Instrutor de Pilates", icon: "🤸" },
  { name: "Instrutor de Dança", icon: "💃" },
  { name: "Instrutor de Natação", icon: "🏊" },
  { name: "Instrutor de Artes Marciais", icon: "🥋" },
  { name: "Coach de Vida", icon: "🎯" },
  { name: "Coach Esportivo", icon: "🏃" },
  { name: "Terapeuta Holístico", icon: "🔮" },
  { name: "Acupunturista", icon: "💉" },
  { name: "Quiropraxista", icon: "🦴" },
  { name: "Podólogo", icon: "🦶" },
  { name: "Esteticista", icon: "✨" },
  { name: "Depilador", icon: "🪒" },
  { name: "Designer de Sobrancelhas", icon: "👁️" },
  { name: "Tatuador", icon: "🖊️" },
  { name: "Piercer", icon: "💎" },
  { name: "Consultor de Imagem", icon: "👔" },
  { name: "Personal Stylist", icon: "👗" },
  { name: "Personal Organizer", icon: "📋" },
  { name: "Despachante", icon: "📄" },
  { name: "Corretor de Imóveis", icon: "🏠" },
  { name: "Corretor de Seguros", icon: "🛡️" },
  { name: "Avaliador de Imóveis", icon: "📐" },
  { name: "Síndico Profissional", icon: "🏢" },
  { name: "Zelador", icon: "🔧" },
  { name: "Porteiro", icon: "🚪" },
];

// Cidades brasileiras (capitais + principais cidades por estado)
const CITIES_BY_STATE = {
  "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"],
  "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo"],
  "AP": ["Macapá", "Santana", "Laranjal do Jari"],
  "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru"],
  "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié", "Teixeira de Freitas"],
  "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape"],
  "DF": ["Brasília", "Taguatinga", "Ceilândia", "Samambaia", "Planaltina"],
  "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim", "Linhares", "Colatina"],
  "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás"],
  "MA": ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar"],
  "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres"],
  "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Nova Andradina"],
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité", "Poços de Caldas", "Patos de Minas", "Pouso Alegre", "Teófilo Otoni", "Barbacena", "Sabará"],
  "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal", "Parauapebas", "Itaituba"],
  "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras"],
  "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá", "Araucária", "Toledo", "Apucarana"],
  "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão"],
  "PI": ["Teresina", "Parnaíba", "Picos", "Floriano", "Piripiri"],
  "RJ": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "São João de Meriti", "Campos dos Goytacazes", "Petrópolis", "Volta Redonda", "Magé", "Itaboraí", "Macaé", "Cabo Frio", "Nova Friburgo", "Barra Mansa", "Angra dos Reis", "Resende"],
  "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Caicó"],
  "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande", "Alvorada", "Passo Fundo", "Sapucaia do Sul", "Uruguaiana", "Santa Cruz do Sul"],
  "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"],
  "RR": ["Boa Vista", "Rorainópolis", "Caracaraí"],
  "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí", "Jaraguá do Sul", "Lages", "Palhoça", "Balneário Camboriú", "Brusque"],
  "SP": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Mauá", "São José do Rio Preto", "Santos", "Mogi das Cruzes", "Diadema", "Jundiaí", "Carapicuíba", "Piracicaba", "Bauru", "Itaquaquecetuba", "São Vicente", "Franca", "Guarujá", "Taubaté", "Praia Grande", "Limeira", "Suzano", "Taboão da Serra", "Sumaré", "Barueri", "Embu das Artes", "São Carlos", "Marília", "Indaiatuba", "Cotia", "Americana", "Jacareí", "Araraquara", "Presidente Prudente", "Hortolândia"],
  "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "Estância"],
  "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional"],
};

// Nomes brasileiros realistas
const FIRST_NAMES = [
  "Ana", "João", "Maria", "Pedro", "Carla", "Lucas", "Juliana", "Rafael", "Beatriz", "Gabriel",
  "Fernanda", "Thiago", "Amanda", "Bruno", "Camila", "Diego", "Larissa", "Matheus", "Patrícia", "Rodrigo",
  "Mariana", "Felipe", "Isabela", "Gustavo", "Letícia", "Henrique", "Natália", "Vinícius", "Bruna", "Leonardo",
  "Aline", "Marcelo", "Daniela", "André", "Bianca", "Fábio", "Renata", "Ricardo", "Vanessa", "Márcio",
  "Tatiana", "Alexandre", "Priscila", "Eduardo", "Cristina", "Maurício", "Simone", "Sérgio", "Sandra", "Paulo",
  "Cláudia", "Roberto", "Adriana", "Carlos", "Mônica", "José", "Luciana", "Antônio", "Elaine", "Francisco",
  "Márcia", "Luiz", "Regina", "Fernando", "Silvia", "Jorge", "Vera", "Marcos", "Sônia", "Manoel",
  "Teresa", "Raimundo", "Rosângela", "Sebastião", "Aparecida", "Geraldo", "Lúcia", "Joaquim", "Marta", "Benedito",
];

const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Costa", "Ferreira", "Rodrigues", "Alves", "Pereira", "Lima",
  "Gomes", "Ribeiro", "Martins", "Carvalho", "Rocha", "Almeida", "Araújo", "Fernandes", "Barbosa", "Cardoso",
  "Nascimento", "Castro", "Dias", "Monteiro", "Mendes", "Freitas", "Moreira", "Pinto", "Cavalcanti", "Vieira",
  "Ramos", "Correia", "Teixeira", "Reis", "Miranda", "Nunes", "Soares", "Azevedo", "Campos", "Moura",
];

const BIOS = [
  "Profissional experiente com mais de 10 anos de mercado. Atendimento personalizado e qualidade garantida.",
  "Especialista dedicado em oferecer o melhor serviço. Satisfação do cliente é minha prioridade.",
  "Trabalho com excelência e compromisso. Resultados que superam expectativas.",
  "Atendimento humanizado e profissional. Sua confiança é meu maior patrimônio.",
  "Qualidade, pontualidade e preço justo. Faça seu orçamento sem compromisso.",
  "Anos de experiência e clientes satisfeitos. Conte comigo para realizar seu projeto.",
  "Profissional certificado e qualificado. Trabalho sério e comprometido.",
  "Atendo com hora marcada. Orçamento gratuito e sem compromisso.",
  "Serviço de qualidade com garantia. Sua satisfação é minha meta.",
  "Referências disponíveis. Trabalho com transparência e honestidade.",
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

function getRandomName(): string {
  return `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
}

// DDDs por estado
const DDD_BY_STATE: Record<string, string[]> = {
  "AC": ["68"],
  "AL": ["82"],
  "AP": ["96"],
  "AM": ["92", "97"],
  "BA": ["71", "73", "74", "75", "77"],
  "CE": ["85", "88"],
  "DF": ["61"],
  "ES": ["27", "28"],
  "GO": ["62", "64"],
  "MA": ["98", "99"],
  "MT": ["65", "66"],
  "MS": ["67"],
  "MG": ["31", "32", "33", "34", "35", "37", "38"],
  "PA": ["91", "93", "94"],
  "PB": ["83"],
  "PR": ["41", "42", "43", "44", "45", "46"],
  "PE": ["81", "87"],
  "PI": ["86", "89"],
  "RJ": ["21", "22", "24"],
  "RN": ["84"],
  "RS": ["51", "53", "54", "55"],
  "RO": ["69"],
  "RR": ["95"],
  "SC": ["47", "48", "49"],
  "SP": ["11", "12", "13", "14", "15", "16", "17", "18", "19"],
  "SE": ["79"],
  "TO": ["63"],
};

async function main() {
  console.log("🌱 Starting full seed with all Brazilian cities and professions...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.delete(professionals);
  await db.delete(categories);

  // Insert categories
  console.log("📂 Creating categories...");
  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    await db.insert(categories).values({
      name: CATEGORIES_DATA[i].name,
      icon: CATEGORIES_DATA[i].icon,
      displayOrder: i,
    });
  }
  console.log(`✅ Created ${CATEGORIES_DATA.length} categories`);

  // Insert professionals - distributed across all cities
  console.log("👥 Creating professionals across all Brazilian cities...");
  
  let professionalCount = 0;
  const totalProfessionals = 500; // Criar 500 profissionais distribuídos

  for (let i = 0; i < totalProfessionals; i++) {
    // Select random state and city
    const states = Object.keys(CITIES_BY_STATE);
    const state = rand(states);
    const city = rand(CITIES_BY_STATE[state]);
    const ddd = rand(DDD_BY_STATE[state]);
    
    const trialEndsAt = new Date();
    
    // Distribute trial status
    if (i < totalProfessionals * 0.6) {
      // 60%: trial still valid (1-7 days remaining)
      trialEndsAt.setDate(trialEndsAt.getDate() + Math.floor(1 + Math.random() * 7));
    } else if (i < totalProfessionals * 0.8) {
      // 20%: trial expired (1-5 days ago)
      trialEndsAt.setDate(trialEndsAt.getDate() - Math.floor(1 + Math.random() * 5));
    } else {
      // 20%: trial expired but have subscription
      trialEndsAt.setDate(trialEndsAt.getDate() - 10);
    }

    const subscriptionEndsAt = i >= totalProfessionals * 0.8 ? (() => {
      const subDate = new Date();
      subDate.setDate(subDate.getDate() + 30); // 30 days subscription
      return subDate;
    })() : null;

    const category = rand(CATEGORIES_DATA);
    const phone = randomPhone(ddd);
    const name = getRandomName();
    
    await db.insert(professionals).values({
      uid: uid(),
      displayName: name,
      category: category.name,
      city: `${city} - ${state}`,
      phone: phone,
      whatsapp: phone,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
      bio: rand(BIOS),
      photoUrl: `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
      instagramVideoUrl: i % 4 === 0 ? "https://www.instagram.com/reel/example/" : null,
      instagramHandle: i % 3 === 0 ? `@${name.toLowerCase().replace(/\s+/g, "_")}` : null,
      stars: Math.floor(35 + Math.random() * 15), // 3.5 to 5.0 stars
      reviewCount: Math.floor(5 + Math.random() * 95),
      badge: i % 3 === 0 ? "verified" : i % 5 === 0 ? "trusted" : "none",
      planType: i % 5 === 0 ? "destaque" : "base",
      trialEndsAt: trialEndsAt,
      subscriptionEndsAt: subscriptionEndsAt,
      isActive: true,
    });
    
    professionalCount++;
    
    if (professionalCount % 50 === 0) {
      console.log(`   Created ${professionalCount}/${totalProfessionals} professionals...`);
    }
  }
  
  console.log(`✅ Created ${professionalCount} professionals`);
  console.log(`📍 Distributed across ${Object.keys(CITIES_BY_STATE).length} states`);
  
  const totalCities = Object.values(CITIES_BY_STATE).reduce((sum, cities) => sum + cities.length, 0);
  console.log(`🏙️  Covering ${totalCities} cities`);
  console.log(`💼 ${CATEGORIES_DATA.length} professional categories`);

  console.log("🎉 Full seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });

