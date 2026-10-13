import { PrismaClient, Papel } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIAS = ["Limpeza", "Reparos", "Jardinagem", "Aulas particulares", "Desenvolvimento", "Design"];

const PRESTADORES = [
  { firebaseUid: "seed-ana", nome: "Ana Souza", email: "ana.seed@fluxo.local", bio: "Diarista há 8 anos, com referências.", localizacao: "São Paulo, SP", telefone: "(11) 90000-0001" },
  { firebaseUid: "seed-bruno", nome: "Bruno Lima", email: "bruno.seed@fluxo.local", bio: "Eletricista e encanador, atendo em domicílio.", localizacao: "São Paulo, SP", telefone: "(11) 90000-0002" },
  { firebaseUid: "seed-carla", nome: "Carla Mendes", email: "carla.seed@fluxo.local", bio: "Professora de matemática e inglês.", localizacao: "Campinas, SP", telefone: "(19) 90000-0003" },
  { firebaseUid: "seed-diego", nome: "Diego Rocha", email: "diego.seed@fluxo.local", bio: "Desenvolvedor full-stack.", localizacao: "Remoto", telefone: "(11) 90000-0004" },
  { firebaseUid: "seed-elisa", nome: "Elisa Tavares", email: "elisa.seed@fluxo.local", bio: "Designer de marcas e interfaces.", localizacao: "Rio de Janeiro, RJ", telefone: "(21) 90000-0005" },
];

// "prestador" é o índice em PRESTADORES
const SERVICOS = [
  { prestador: 0, categoria: "Limpeza", titulo: "Faxina residencial completa", descricao: "Limpeza de todos os cômodos, banheiros e cozinha. Produtos inclusos.", preco: 180 },
  { prestador: 0, categoria: "Limpeza", titulo: "Limpeza pós-obra", descricao: "Remoção de resíduos de obra e limpeza fina de pisos, vidros e louças.", preco: 450 },
  { prestador: 0, categoria: "Limpeza", titulo: "Organização de armários", descricao: "Organização de guarda-roupas e despensas, com separação por categoria.", preco: 120 },
  { prestador: 1, categoria: "Reparos", titulo: "Instalação de tomadas e interruptores", descricao: "Troca e instalação de tomadas, interruptores e pontos de luz.", preco: 90 },
  { prestador: 1, categoria: "Reparos", titulo: "Conserto de vazamento", descricao: "Diagnóstico e reparo de vazamentos em torneiras, sifões e canos.", preco: 150 },
  { prestador: 1, categoria: "Reparos", titulo: "Montagem de móveis", descricao: "Montagem de guarda-roupas, racks, camas e estantes.", preco: 80 },
  { prestador: 1, categoria: "Jardinagem", titulo: "Poda e manutenção de jardim", descricao: "Poda de arbustos, corte de grama e limpeza de canteiros.", preco: 200 },
  { prestador: 2, categoria: "Aulas particulares", titulo: "Aulas de matemática (ensino médio)", descricao: "Reforço de álgebra, geometria e preparação para vestibular.", preco: 60 },
  { prestador: 2, categoria: "Aulas particulares", titulo: "Reforço de inglês", descricao: "Conversação e gramática para iniciantes e intermediários.", preco: 70 },
  { prestador: 3, categoria: "Desenvolvimento", titulo: "Site institucional em Next.js", descricao: "Site responsivo com até 5 páginas, formulário de contato e deploy.", preco: 1200 },
  { prestador: 3, categoria: "Desenvolvimento", titulo: "API REST em Node.js", descricao: "API com autenticação, banco relacional e documentação.", preco: 900 },
  { prestador: 4, categoria: "Design", titulo: "Logo e identidade visual", descricao: "Logo, paleta de cores e tipografia, com 3 propostas.", preco: 600 },
  { prestador: 4, categoria: "Design", titulo: "Layout de landing page", descricao: "Desenho da página no Figma, pronto pra desenvolvimento.", preco: 450 },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed não roda em produção");
  }

  // categorias (nome é único, então o upsert não duplica)
  const categoriaIds = new Map<string, string>();
  for (const nome of CATEGORIAS) {
    const categoria = await prisma.categoria.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    categoriaIds.set(nome, categoria.id);
  }

  // prestadores fictícios, com perfil
  const prestadorIds: string[] = [];
  for (const p of PRESTADORES) {
    const usuario = await prisma.usuario.upsert({
      where: { firebaseUid: p.firebaseUid },
      update: {},
      create: {
        firebaseUid: p.firebaseUid,
        nome: p.nome,
        email: p.email,
        papel: Papel.CONTRATADO,
        perfil: {
          create: { bio: p.bio, localizacao: p.localizacao, telefone: p.telefone },
        },
      },
    });
    prestadorIds.push(usuario.id);
  }

  // serviços: só cria se ainda não houver nenhum desses prestadores (evita duplicar ao rodar de novo)
  const jaExistem = await prisma.servico.count({
    where: { contratadoId: { in: prestadorIds } },
  });
  if (jaExistem > 0) {
    console.log("Serviços fictícios já existem. Nada foi criado.");
    return;
  }

  for (const s of SERVICOS) {
    const categoriaId = categoriaIds.get(s.categoria);
    if (!categoriaId) throw new Error(`Categoria não encontrada: ${s.categoria}`);

    await prisma.servico.create({
      data: {
        titulo: s.titulo,
        descricao: s.descricao,
        preco: s.preco,
        contratadoId: prestadorIds[s.prestador],
        categoriaId,
      },
    });
  }

  console.log(
    `Seed concluído: ${CATEGORIAS.length} categorias, ${PRESTADORES.length} prestadores, ${SERVICOS.length} serviços.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());