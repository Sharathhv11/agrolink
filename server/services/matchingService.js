const User = require('../models/User');
const JobMatch = require('../models/JobMatch');

function toKm(meters) {
  return Number((meters / 1000).toFixed(2));
}

async function queryWorkersByRadius(job, radiusKm) {
  const users = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: job.locationPoint.coordinates,
        },
        key: 'locationPoint',
        distanceField: 'distanceMeters',
        spherical: true,
        maxDistance: radiusKm * 1000,
        query: {
          availabilityStatus: 'available',
          categories: job.category,
        },
      },
    },
    {
      $project: {
        name: 1,
        phone: 1,
        location: 1,
        distanceMeters: 1,
      },
    },
  ]);

  return users.map((user) => ({
    ...user,
    distanceKm: toKm(user.distanceMeters),
  }));
}

async function matchWorkersForJob(job) {
  let workers = await queryWorkersByRadius(job, 5);
  let radiusUsedKm = 5;

  if (!workers.length) {
    workers = await queryWorkersByRadius(job, 10);
    radiusUsedKm = 10;
  }

  // Deduplicate users before DB upsert.
  const uniqueWorkers = Array.from(new Map(workers.map((w) => [String(w._id), w])).values())
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const matchDocs = [];
  for (const worker of uniqueWorkers) {
    const match = await JobMatch.findOneAndUpdate(
      { jobId: job._id, workerId: worker._id },
      {
        $setOnInsert: {
          distanceKm: worker.distanceKm,
          radiusUsedKm,
          matchStatus: 'matched',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    matchDocs.push(match);
  }

  return {
    workers: uniqueWorkers,
    matches: matchDocs,
    radiusUsedKm,
  };
}

module.exports = {
  matchWorkersForJob,
};
