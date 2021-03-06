import db from "db"
import { ImageAttribute, ImageHelper } from "db/ImageHelper"
import image from "next/image"

jest.setTimeout(10 * 1000)

describe("testing image randomisation", () => {
  const imageHelper = new ImageHelper(100, 0.5)
  // it("should return at least {STUDY_SIZE} images", () => {}  )

  const createSubmission = async (imageId: string) => {
    await db.submission.create({
      data: {
        dataset: {
          connect: {
            id: imageId,
          },
        },
        user: {
          connect: {
            id: "9e7ff839-ed3c-4eb0-84f9-5e59b5270e27",
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        dataset: true,
        user: true,
        userId: true,
        datasetId: true,
      },
    })
  }

  beforeAll(async () => {
    // seeding some testing data using the sample data from the /db/sample-data directory
    await db.user.create({
      data: {
        email: "tester@test.net",
        hashedPassword: "hashedTestedPassword",
        id: "9e7ff839-ed3c-4eb0-84f9-5e59b5270e27",
      },
    })

    // private submissions
    await createSubmission("005c99f0-6ee5-44f4-a54f-803c2c819330")
    await createSubmission("003ba75a-e0e4-465b-ae87-cc97048fe6ac")
    await createSubmission("00243684-3a12-4608-8f06-2b493d0fb890")

    // public submissions
    await createSubmission("0001fa12-5d29-4d10-bd35-59770fa98371")
    await createSubmission("00387725-970d-48b1-a405-114e0df3f876")
    await createSubmission("0043c398-459b-44c6-a486-566d05c9b2f1")
  })

  afterAll(async () => {
    // delete all testing data
    await db.submission.deleteMany({
      where: {
        userId: "9e7ff839-ed3c-4eb0-84f9-5e59b5270e27",
      },
    })
    await db.user.delete({
      where: {
        id: "9e7ff839-ed3c-4eb0-84f9-5e59b5270e27",
      },
    })
  })

  // it("should return all private images", async () => {
  //   const images = await imageHelper.getPrivateImages()

  //   images.forEach(({ createdAt, id, updatedAt, attributes }) => {
  //     expect(attributes).toBeDefined()
  //     expect(createdAt).toBeDefined()
  //     expect(id).toBeDefined()
  //     expect(updatedAt).toBeDefined()
  //   })
  // })

  it("should return previously annotated private images", async () => {
    const images = await imageHelper.getPreviousPrivateImages()
    expect(images.length).toBe(3)
    images.forEach(({ attributes, createdAt, id, updatedAt }) => {
      expect(attributes).toBeDefined()
      expect(createdAt).toBeDefined()
      expect(id).toBeDefined()
      expect(updatedAt).toBeDefined()

      let att = attributes as ImageAttribute

      expect(att.filename).toBeDefined()
      expect(att.isPrivate).toBe(true)
    })
  })

  it("should return previously annotated public images", async () => {
    const images = await imageHelper.getPreviousPublicImages()
    expect(images.length).toBe(3)
    images.forEach(({ attributes, createdAt, id, updatedAt }) => {
      expect(attributes).toBeDefined()
      expect(createdAt).toBeDefined()
      expect(id).toBeDefined()
      expect(updatedAt).toBeDefined()

      let att = attributes as ImageAttribute

      expect(att.filename).toBeDefined()
      expect(att.isPrivate).toBe(false)
    })
  })

  it("should count the amount of relations to submission", async () => {
    const count = await imageHelper.getQualifiedPrivateImages()
    expect(count.length).toBe(50)
  })

  it("should update the submission counts", async () => {
    await imageHelper.updateUserSubmissionCount("9e7ff839-ed3c-4eb0-84f9-5e59b5270e27")
    const user = await db.user.findFirst({ where: { id: "9e7ff839-ed3c-4eb0-84f9-5e59b5270e27" } })
    expect(user.currentPrivateSubmissions).toBe(3)
    expect(user.currentPublicSubmissions).toBe(3)
  })

  it("should return a preferred image", async () => {
    const image = await imageHelper.getImage("9e7ff839-ed3c-4eb0-84f9-5e59b5270e27")
    expect(image._count.submission).toBeGreaterThanOrEqual(1)
  })
})

export {}
