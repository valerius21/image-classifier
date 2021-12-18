import { Prisma } from "@prisma/client"
import db from "./index"
import fs from "fs"
import path from "path"

// We export a function, so that we can parse all csv-files from the ./sample-data directory into an array of objects.
const parseCsv = <T extends unknown>(filePath: string): T[] => {
  const csv = fs.readFileSync(filePath, "utf8")
  const lines = csv.split("\n") || []
  const headers = lines[0]?.split(",")
  if (!headers || !lines) return []
  const data: T[] = lines.slice(1).map((line) => {
    const obj = {}
    const values = line.split(",")
    headers.forEach((header, index) => {
      obj[header] = values[index]
    })
    return obj as T
  })
  return data
}

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * or https://github.com/Marak/Faker.js to easily generate
 * realistic data.
 *
 * For example:
 * - read the dats from a csv file in ./sample-data into the seed function.
 */
const seed = async () => {
  type ImageCsvType = { id: string; filename: string }
  const privateImages = parseCsv<ImageCsvType>(
    path.join(__dirname, "./sample-data/private-images.csv")
  )
    .map(({ filename }) => filename)
    .filter((filename) => filename && filename.length > 0)
  const publicImages = parseCsv<ImageCsvType>(
    path.join(__dirname, "./sample-data/public-images.csv")
  )
    .map(({ filename }) => filename)
    .filter((filename) => filename && filename.length > 0)

  await db.dataset.createMany({
    data: privateImages.map((filename) => ({
      attributes: { filename, isPrivate: true } as Prisma.JsonObject,
    })),
    skipDuplicates: true,
  })
  await db.dataset.createMany({
    data: publicImages.map((filename) => ({
      attributes: { filename, isPrivate: false } as Prisma.JsonObject,
    })),
    skipDuplicates: true,
  })
}

export default seed
