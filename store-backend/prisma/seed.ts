import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const existingCategory = await prisma.category.findFirst({
    where: { slug: "camisas" },
  });
  if (existingCategory) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    const category = await tx.category.create({
      data: { slug: "camisas", name: "Camisas" },
    });

    await tx.categoryMetadata.create({
      data: { id: "tech", name: "Tecnologia", categoryId: category.id },
    });

    await tx.banner.createMany({
      data: [
        { img: "banner_promo_1.jpg", link: "/categories/camisas" },
        { img: "banner_promo_2.jpg", link: "/categories/algo" },
      ],
    });

    await tx.metadataValue.createMany({
      data: [
        { id: "node", label: "Node", categoryMetadataId: "tech" },
        { id: "react", label: "React", categoryMetadataId: "tech" },
        { id: "python", label: "Python", categoryMetadataId: "tech" },
        { id: "php", label: "PHP", categoryMetadataId: "tech" },
      ],
    });

    const products = [
      {
        label: "Camisa RN",
        price: 89.9,
        description: "Camisa com estampa de React Native",
        metadataValueId: "node",
      },
      {
        label: "Camisa React",
        price: 94.5,
        description: "Camisa com logo do React",
        metadataValueId: "react",
      },
      {
        label: "Camisa Python",
        price: 79.99,
        description: "Camisa com design Python",
        metadataValueId: "python",
      },
      {
        label: "Camisa PHP",
        price: 69.9,
        description: "Camisa com estampa PHP",
        metadataValueId: "php",
      },
    ];

    for (const p of products) {
      const slug = p.label.replaceAll(" ", "_").toLowerCase();
      const product = await tx.product.create({
        data: {
          label: p.label,
          price: p.price,
          description: p.description,
          categoryId: category.id,
          productImages: {
            create: [
              { url: `${slug}_1.jpg` },
              { url: `${slug}_2.jpg` },
            ],
          },
          productMetadata: {
            create: {
              categoryMetadataId: "tech",
              metadataValueId: p.metadataValueId,
            },
          },
        },
      });
      console.log("Product created:", product.label);
    }
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
