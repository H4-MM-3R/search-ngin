import { db } from "@/db";
import { Product, productsTable } from "@/db/schema";
import { vectorize } from "@/lib/vectorize";
import { Index } from "@upstash/vector";
import { sql } from "drizzle-orm";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export type CoreProduct = Omit<Product, "createdAt" | "updatedAt">;

const index = new Index<CoreProduct>();

export default async function page({ searchParams }: PageProps) {
  const query = searchParams.query;

  if (Array.isArray(query) || !query) {
    return redirect("/");
  }

  let products: CoreProduct[] = await db
    .select()
    .from(productsTable)
    .where(
      sql`to_tsvector('simple', lower(${productsTable.name} || ' ' || ${productsTable.description})) @@ to_tsquery('simple', lower(${query.trim().split(" ").join(" & ")}))`,
    )
    .limit(3);

  if (products.length < 3) {
    const vector = await vectorize(query);
    const res = await index.query({
      topK: 5,
      vector,
      includeMetadata: true,
    });

    const vectorProducts = res
      .filter((existingProduct) => {
        if (
          products.some((product) => product.id === existingProduct.id) ||
          existingProduct.score < 0.9
        ) {
          return false;
        }
        return true;
      })
      .map(({ metadata }) => metadata!);

    products.push(...vectorProducts);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-4 bg-white shadow-md rounded-b-md">
        <X className="mx-auto h-8 w-8 text-black" />
        <h3 className="mt-2 text-lg font-black text-gray-900">No results</h3>
        <p className="mt-1 text-lg mx-auto max-w-prose text-gray-500">
          Sorry, we couldn't find any matches for{" "}
          <span className="text-red-600 font-bold">{query}</span>.
        </p>
      </div>
    );
  }

  return (
    <>
      <hr />
      <ul className="py-4 bg-white/15 rounded-b-md">
        {products.slice(0, 3).map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <li className="mx-auto py-4 px-8 flex space-x-4">
              <div className="relative flex items-center bg-zinc-100 rounded-lg h-40 w-40">
                <Image
                  loading="eager"
                  fill
                  alt="product-image"
                  src={`/${product.imageId}`}
                  className="h-full w-full object-cover object-center rounded-lg"
                />
              </div>

              <div className="w-full flex-1 space-y-2 py-1">
                <h1 className="text-lg font-medium text-white/80">
                  {product.name}
                </h1>

                <p className="prose prose-sm text-white/50 line-clamp-3">
                  {product.description}
                </p>

                <p className="text-base font-medium text-white">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </>
  );
}
