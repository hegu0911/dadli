import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "elnur@example.com" },
    update: {},
    create: {
      username: "elnur",
      email: "elnur@example.com",
      password,
      displayName: "Elnur Karimli",
      bio: "Azerbaycan metbexinin sirlarini kesf edirem",
      location: "Baki, Azerbaycan",
      cuisineTags: JSON.stringify(["azeri", "turkish"]),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "aynur@example.com" },
    update: {},
    create: {
      username: "aynur",
      email: "aynur@example.com",
      password,
      displayName: "Aynur Mammedova",
      bio: "Vejetaryen reseptler | Saglam qidalanma",
      location: "Baki, Azerbaycan",
      cuisineTags: JSON.stringify(["vegetarian", "mediterranean"]),
    },
  });

  const recipes = [
    {
      id: "seed-recipe-1",
      title: "Sah Plov",
      description: "En dadli Azerbaycan plovu, addim-addim",
      prepTime: 20, cookTime: 60, totalTime: 80,
      difficulty: "medium", servings: 6,
      ingredients: JSON.stringify([
        { name: "duyu", amount: 500, unit: "g" },
        { name: "qoyun eti", amount: 400, unit: "g" },
        { name: "sogan", amount: 2, unit: "eded" },
        { name: "yerkoku", amount: 3, unit: "eded" },
        { name: "kere yagi", amount: 100, unit: "g" },
        { name: "zeferan", amount: 1, unit: "c.q" },
        { name: "duz", amount: 1, unit: "c.q" },
      ]),
      steps: JSON.stringify([
        { order: 1, instruction: "Duyunu duzlu suda 30 deq isladin, sonra yuyun" },
        { order: 2, instruction: "Eti kicik parcalara kesin ve soganla qovurun" },
        { order: 3, instruction: "Yerkokunu ince dograyin ve elave edin" },
        { order: 4, instruction: "Duyunu qaynar suya atib 10 deq bisirin, szun" },
        { order: 5, instruction: "Qazana yag tokun, duyunu etin ustune yigin" },
        { order: 6, instruction: "Zeferani isti suda eridib ustune tokun" },
        { order: 7, instruction: "Asagi istilikde 30 deq bisirin" },
      ]),
      category: "Esas yemek", cuisine: "azeri",
      hashtags: JSON.stringify(["#azerbaycanmutfagi", "#plov"]),
      authorId: user1.id,
    },
    {
      id: "seed-recipe-2",
      title: "Qatiqli Soborenge Salati",
      description: "Yungul ve saglam salat",
      prepTime: 10, totalTime: 10,
      difficulty: "easy", servings: 2,
      ingredients: JSON.stringify([
        { name: "soborenge", amount: 3, unit: "eded" },
        { name: "qatiq", amount: 200, unit: "ml" },
        { name: "sarinmsaq", amount: 2, unit: "dis" },
        { name: "zeytu yagi", amount: 1, unit: "x.q" },
        { name: "duz", amount: 0.5, unit: "c.q" },
      ]),
      steps: JSON.stringify([
        { order: 1, instruction: "Soborengeleri qaynadib soyudun" },
        { order: 2, instruction: "Sarinmsagi ezin ve qatiqla qarisdirin" },
        { order: 3, instruction: "Soborengeleri doqrayin ve qatiqla qarisdirin" },
        { order: 4, instruction: "Zeytun yagi ve duz elave edin" },
      ]),
      category: "Salat", cuisine: "azeri", diet: "vegetarian",
      hashtags: JSON.stringify(["#salat", "#vejetaryen"]),
      authorId: user2.id,
    },
    {
      id: "seed-recipe-3",
      title: "Baklava",
      description: "Azerbaycan usulu qatiqli baklava",
      prepTime: 40, cookTime: 30, totalTime: 70,
      difficulty: "hard", servings: 10,
      ingredients: JSON.stringify([
        { name: "un", amount: 500, unit: "g" },
        { name: "kere yagi", amount: 200, unit: "g" },
        { name: "qatiq", amount: 200, unit: "ml" },
        { name: "yumurta", amount: 2, unit: "eded" },
        { name: "qoz", amount: 300, unit: "g" },
        { name: "seker", amount: 200, unit: "g" },
        { name: "vanil", amount: 1, unit: "pk" },
      ]),
      steps: JSON.stringify([
        { order: 1, instruction: "Un, kere yagi, qatiq ve yumurtani qarisdirib xemir yogurun" },
        { order: 2, instruction: "Xemiri 15 hisseye bolun ve 30 deq dinlendirin" },
        { order: 3, instruction: "Qozu sekerle qarisdirib cekin" },
        { order: 4, instruction: "Her xemir parcasini yayib ici qoz qoyun" },
        { order: 5, instruction: "Ustune yumurta sarisi surun" },
        { order: 6, instruction: "180C de 30 deq bisirin" },
        { order: 7, instruction: "Bisenden sonra sekerli suyu tokun" },
      ]),
      category: "Desert", cuisine: "azeri",
      hashtags: JSON.stringify(["#baklava", "#desert", "#azerbaycan"]),
      authorId: user1.id,
    },
  ];

  for (const r of recipes) {
    await prisma.recipe.upsert({ where: { id: r.id }, update: {}, create: r as any });
  }

  console.log("Seed data elave olundu!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
