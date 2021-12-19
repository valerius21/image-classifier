import { requiredChakraThemeKeys } from "@chakra-ui/react"
import db, { Dataset } from "db"
import _ from "lodash"

export type DatasetAggregate = Dataset & {
  _count: {
    submission: number
  }
}

export type ImageAttribute = {
  filename: string
  isPrivate: boolean
}
export class ImageHelper {
  studySize: number
  chance: number
  static privateImages: any[]
  static publicImages: any[]

  constructor(studySize: number, chance: number) {
    this.studySize = studySize
    this.chance = chance
  }

  async getPrivateImages() {
    return await db.dataset.findMany()
  }

  async getPublicImages() {
    return []
  }

  async getPreviousPrivateImages(min = 1, max = 40): Promise<Dataset[]> {
    return this.getPreviousImages(true, min, max)
  }

  async getPreviousPublicImages(min = 1, max = 40): Promise<Dataset[]> {
    return this.getPreviousImages(false, min, max)
  }

  private async getPreviousImages(
    isPrivate: boolean,
    minAnnotations: number,
    maxAnnoations: number
  ) {
    const datasets = await db.dataset.findMany({
      where: {
        AND: [
          {
            submission: {
              some: {
                userId: {
                  contains: "-",
                  mode: "insensitive",
                },
              },
            },
          },
          {
            attributes: {
              path: ["isPrivate"],
              equals: isPrivate,
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            submission: true,
          },
        },
      },
    })

    return datasets
      .filter(
        ({ _count }) => _count.submission >= minAnnotations && _count.submission <= maxAnnoations
      )
      .map((image) => ({
        ...image,
        attributes: image.attributes as ImageAttribute,
      }))
  }

  async getQualifiedPrivateImages() {
    return await this.getQualifiedImages(true)
  }

  async getQualifiedPublicImages() {
    return await this.getQualifiedImages(false)
  }

  async getQualifiedImages(isPrivate: boolean, n?: number) {
    const priorityImages = isPrivate
      ? await this.getPreviousPrivateImages()
      : await this.getPreviousPublicImages()

    if (!n) n = this.studySize * this.chance - priorityImages.length

    const imgs = await db.dataset.findMany({
      where: {
        AND: [
          {
            submission: {
              none: {
                userId: {
                  notIn: [],
                },
              },
            },
          },
          {
            attributes: {
              path: ["isPrivate"],
              equals: isPrivate,
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            submission: true,
          },
        },
      },
      take: n,
    })

    return [...priorityImages, ...imgs]
  }

  /**
   * Determine the submission count for a user.
   * @param uid the user id
   * @param isPrivate if the submission count is private or public
   * @returns submission with related images
   */
  private async getSubmissionCount(uid: string, isPrivate: boolean) {
    const counts = await db.submission.findMany({
      where: {
        userId: {
          equals: uid,
        },
        dataset: {
          submission: {
            some: {
              dataset: {
                attributes: {
                  path: ["isPrivate"],
                  equals: isPrivate,
                },
              },
            },
          },
        },
      },
    })

    return counts.length
  }

  /**
   * Updates the submission count for the user depending on the related submission data.
   * @param uid the user id
   */
  async updateUserSubmissionCount(uid: string) {
    const privateCount = await this.getSubmissionCount(uid, true)
    const publicCount = await this.getSubmissionCount(uid, false)

    await db.user.update({
      where: {
        id: uid,
      },
      data: {
        currentPrivateSubmissions: privateCount,
        currentPublicSubmissions: publicCount,
      },
    })
  }

  /**
   * Sorts the images by the number of annotations.
   * @param a A dataset
   * @param b A dataset
   * @returns number  -1 if a is preferred, 1 if b is preferred, 0 if they are equal
   */
  private static sortFn = (a: DatasetAggregate, b: DatasetAggregate) => {
    const aCount = a._count.submission
    const bCount = b._count.submission
    return aCount - bCount
  }

  /**
   * Returns a random image from the dataset with the bias towards the images with the most annotations.
   * @param user the user id
   * @returns a preferred, random image
   */
  async getImage(user: string): Promise<DatasetAggregate> {
    const userentry = await db.user.findFirst({ where: { id: user } })
    const { currentPrivateSubmissions, currentPublicSubmissions } = userentry

    const nPrivate = this.studySize * this.chance - currentPrivateSubmissions
    const nPublic = this.studySize * this.chance - currentPublicSubmissions

    // getting the qualified images
    let privateImgs = await this.getQualifiedImages(true, this.studySize)
    let publicImgs = await this.getQualifiedImages(false, this.studySize)

    // slice it back
    privateImgs = privateImgs.slice(0, nPrivate)
    publicImgs = publicImgs.slice(0, nPublic)

    // shuffle it
    let images = _.shuffle([...privateImgs, ...publicImgs])

    // prefer annotated images
    images.sort(ImageHelper.sortFn)

    return images.pop() as DatasetAggregate
  }
}
