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

  private async initPrivateImages() {
    return ImageHelper.privateImages ? ImageHelper.privateImages : await this.getPrivateImages()
  }

  private async initPublicImages() {
    return ImageHelper.publicImages ? ImageHelper.publicImages : await this.getPublicImages()
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

  private static sortFn = (a: DatasetAggregate, b: DatasetAggregate) => {
    const aCount = a._count.submission
    const bCount = b._count.submission
    return aCount - bCount
  }

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
