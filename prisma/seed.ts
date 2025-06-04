import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const programs = [
    {
      title: 'AI Essentials Program',
      installmentalFee: 250,
      description:
        'Gain foundational knowledge of Artificial Intelligence, machine learning, and practical tools.',
      fee: 8500,
    },
    {
      title: 'IT Fundamentals Program',
      installmentalFee: 250,
      description:
        'Understand the basics of IT support, systems, and networking principles.',
      fee: 6500,
    },
    {
      title: 'Helpdesk Support Program',
      installmentalFee: 250,
      description:
        'Prepare for a career in tech support, troubleshooting, and customer service roles.',
      fee: 6500,
    },
  ];

  for (const program of programs) {
    await prisma.program.upsert({
      where: { title: program.title },
      update: {},
      create: program,
    });
  }

  console.log('Seed completed ✅');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
