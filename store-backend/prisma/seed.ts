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

    await tx.categoryMetadata.createMany({
      data: [
        { id: "tech", name: "Tecnologia", categoryId: category.id },
        { id: "cor", name: "Cor", categoryId: category.id },
        { id: "precos", name: "Preços", categoryId: category.id },
      ],
    });

    await tx.banner.createMany({
      data: [
        { img: "banner-1.png", link: "/categories/camisas" },
        { img: "banner-2.png", link: "/categories/camisas" },
        { img: "banner-3.png", link: "/categories/camisas" },
        { img: "banner-4.png", link: "/categories/camisas" },
      ],
    });

    await tx.metadataValue.createMany({
      data: [
        { id: "react", label: "React", categoryMetadataId: "tech" },
        {
          id: "react-native",
          label: "React Native",
          categoryMetadataId: "tech",
        },
        { id: "php", label: "PHP", categoryMetadataId: "tech" },
        { id: "azul", label: "Azul", categoryMetadataId: "cor" },
        { id: "cinza", label: "Cinza", categoryMetadataId: "cor" },
        { id: "preta", label: "Preta", categoryMetadataId: "cor" },
        { id: "grafite", label: "Grafite", categoryMetadataId: "cor" },
        { id: "ate-50", label: "Até R$ 50", categoryMetadataId: "precos" },
        {
          id: "de-50-a-100",
          label: "De R$ 50 a R$ 100",
          categoryMetadataId: "precos",
        },
        {
          id: "acima-100",
          label: "Acima de R$ 100",
          categoryMetadataId: "precos",
        },
      ],
    });

    const products = [
      {
        label: "Camisa React - Azul",
        price: 59.99,
        description: "Camisa com logo do React na cor azul",
        metadataValueId: "react",
        colorValueId: "azul",
        image: "camisa-react-azul.png",
        viewsCount: 200,
        salesCount: 5,
        availableSizes: ["P", "M", "G"], // GG out of stock
      },
      {
        label: "Camisa React - Cinza",
        price: 59.99,
        description: "Camisa com logo do React na cor cinza",
        metadataValueId: "react",
        colorValueId: "cinza",
        image: "camisa-react-cinza.png",
        viewsCount: 80,
        salesCount: 40,
        availableSizes: ["P", "M", "G", "GG"],
      },
      {
        label: "Camisa React - Preta",
        price: 59.99,
        description: "Camisa com logo do React na cor preta",
        metadataValueId: "react",
        colorValueId: "preta",
        image: "camisa-react-preta.png",
        viewsCount: 300,
        salesCount: 10,
        availableSizes: ["P", "M", "G", "GG"],
      },
      {
        label: "Camisa React Native",
        price: 59.99,
        description: "Camisa com logo do React Native",
        metadataValueId: "react-native",
        colorValueId: "preta",
        image: "camisa-react-native.png",
        viewsCount: 150,
        salesCount: 35,
        availableSizes: ["M", "G", "GG"], // P out of stock
      },
      {
        label: "Camisa PHP",
        price: 59.99,
        description: "Camisa com logo do PHP",
        metadataValueId: "php",
        colorValueId: "cinza",
        image: "camisa-php.png",
        viewsCount: 40,
        salesCount: 50,
        availableSizes: ["P", "M", "G", "GG"],
      },
      {
        label: "Camisa PHP - Grafite",
        price: 59.99,
        description: "Camisa com logo do PHP na cor grafite",
        metadataValueId: "php",
        colorValueId: "grafite",
        image: "camisa-php-grafite.png",
        viewsCount: 20,
        salesCount: 25,
        availableSizes: ["P", "M", "G", "GG"],
      },
    ];

    for (const p of products) {
      const product = await tx.product.create({
        data: {
          label: p.label,
          price: p.price,
          description: p.description,
          categoryId: category.id,
          viewsCount: p.viewsCount,
          salesCount: p.salesCount,
          availableSizes: p.availableSizes,
          productImages: {
            create: [{ url: p.image }],
          },
          productMetadata: {
            create: [
              {
                categoryMetadataId: "tech",
                metadataValueId: p.metadataValueId,
              },
              {
                categoryMetadataId: "cor",
                metadataValueId: p.colorValueId,
              },
              {
                categoryMetadataId: "precos",
                metadataValueId: "de-50-a-100",
              },
            ],
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
