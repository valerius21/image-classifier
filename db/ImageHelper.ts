import db, { Dataset } from "db"
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

  async getPreviousPrivateImages() {
    return await db.dataset.findMany({
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
              equals: true,
            },
          },
        ],
      },
    })
  }

  async getQualifiedPrivateImages(): Promise<Dataset[]> {
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
        ],
      },
    })
    return datasets
  }
}
