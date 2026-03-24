const JobMatch = require('../models/JobMatch');
const JobApplication = require('../models/JobApplication');
const JobViewEvent = require('../models/JobViewEvent');

function toDateLabel(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

async function getJobAnalytics(jobId) {
  const [viewsCount, interestedCount, applicationsCount, lineRows] = await Promise.all([
    JobViewEvent.countDocuments({ jobId }),
    JobMatch.countDocuments({ jobId }),
    JobApplication.countDocuments({ jobId }),
    JobViewEvent.aggregate([
      { $match: { jobId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const notInterested = Math.max(0, viewsCount - interestedCount);
  return {
    cards: {
      totalViews: viewsCount,
      interestedWorkers: interestedCount,
      applications: applicationsCount,
    },
    pie: {
      interested: interestedCount,
      notInterested,
    },
    line: lineRows.map((row) => ({
      date: toDateLabel(row._id),
      views: row.count,
    })),
  };
}

module.exports = {
  getJobAnalytics,
};
