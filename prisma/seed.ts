import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const incomeCategories = [
  { name: "Зарплата", icon: "💼" },
  { name: "Фриланс", icon: "💻" },
  { name: "Дивиденды", icon: "📈" },
  { name: "Подарки", icon: "🎁" },
  { name: "Возврат долга", icon: "↩️" },
  { name: "Другое", icon: "➕" },
];

const expenseCategories = [
  { name: "Продукты", icon: "🛒" },
  { name: "Транспорт", icon: "🚗" },
  { name: "Жильё", icon: "🏠" },
  { name: "Погашение долга", icon: "↩️" },
  { name: "Оплата рассрочки", icon: "💳" },
  { name: "Здоровье", icon: "💊" },
  { name: "Развлечения", icon: "🎬" },
  { name: "Одежда", icon: "👕" },
  { name: "Образование", icon: "📚" },
  { name: "Связь", icon: "📱" },
  { name: "Кафе и рестораны", icon: "🍽️" },
  { name: "Другое", icon: "➖" },
];

async function main() {
  // Create default user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { baseCurrency: "BYN" },
    });
  }

  // Create income categories
  for (const cat of incomeCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: "INCOME" },
    });
    if (!existing) {
      await prisma.category.create({
        data: { name: cat.name, type: "INCOME", icon: cat.icon },
      });
    }
  }

  // Create expense categories
  for (const cat of expenseCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: "EXPENSE" },
    });
    if (!existing) {
      await prisma.category.create({
        data: { name: cat.name, type: "EXPENSE", icon: cat.icon },
      });
    }
  }

  console.log("Seed completed. User ID:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
