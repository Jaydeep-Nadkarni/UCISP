import { IndexPosting } from '../../models/IndexPosting.js';

export class IndexPersistence {
  constructor(connection) { this.connection = connection; }
  async replaceResourcePostings(resourceId, keywords) {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await IndexPosting.updateMany({ resourceIds: resourceId }, { $pull: { resourceIds: resourceId } }, { session });
        for (const keyword of new Set(keywords)) {
          await IndexPosting.updateOne(
            { keyword },
            { $addToSet: { resourceIds: resourceId }, $set: { updatedAt: new Date() } },
            { upsert: true, session }
          );
        }
      });
    } finally {
      await session.endSession();
    }
  }

  async loadPostings() {
    return IndexPosting.find({}, { keyword: 1, resourceIds: 1, _id: 0 }).lean();
  }
}
