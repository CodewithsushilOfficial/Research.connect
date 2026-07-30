/**
 * Performance Indexes — Research Connect
 * All indexes created with background: true to avoid collection locking.
 */
const mongoose = require('mongoose');
const logger = require('../../common/logger/winston');

const COMPOUND_INDEXES = [
  { collection: 'publications', index: { userId: 1, isDeleted: 1, createdAt: -1 }, options: { background: true, name: 'idx_publication_user_active_date' } },
  { collection: 'publications', index: { isDeleted: 1, status: 1, createdAt: -1 }, options: { background: true, name: 'idx_publication_status_date' } },
  { collection: 'publications', index: { isDeleted: 1, status: 1, views: -1 }, options: { background: true, name: 'idx_publication_status_views' } },
  { collection: 'publications', index: { keywords: 1, isDeleted: 1 }, options: { background: true, name: 'idx_publication_keywords' } },
  { collection: 'publications', index: { isDeleted: 1, citations: -1 }, options: { background: true, name: 'idx_publication_citations_desc' } },
  { collection: 'notifications', index: { recipientId: 1, isRead: 1, createdAt: -1 }, options: { background: true, name: 'idx_notification_recipient_unread_date' } },
  { collection: 'notifications', index: { recipientId: 1, createdAt: -1 }, options: { background: true, name: 'idx_notification_recipient_date' } },
  { collection: 'connections', index: { senderId: 1, status: 1 }, options: { background: true, name: 'idx_connection_sender_status' } },
  { collection: 'connections', index: { receiverId: 1, status: 1 }, options: { background: true, name: 'idx_connection_receiver_status' } },
  { collection: 'feedevents', index: { actorId: 1, createdAt: -1 }, options: { background: true, name: 'idx_feedevent_actor_date' } },
  { collection: 'feedevents', index: { eventType: 1, createdAt: -1 }, options: { background: true, name: 'idx_feedevent_type_date' } },
  { collection: 'feedevents', index: { isDeleted: 1, createdAt: -1 }, options: { background: true, name: 'idx_feedevent_active_date' } },
  { collection: 'feedinteractions', index: { userId: 1, publicationId: 1, createdAt: -1 }, options: { background: true, name: 'idx_feedinteraction_user_pub_date' } },
  { collection: 'feedrankings', index: { userId: 1, lastComputedAt: -1 }, options: { background: true, name: 'idx_feedranking_user_computed' } },
  { collection: 'recommendationscores', index: { userId: 1, targetType: 1, score: -1 }, options: { background: true, name: 'idx_recscore_user_type_score' } },
  { collection: 'recommendationscores', index: { userId: 1, targetId: 1, targetType: 1 }, options: { background: true, sparse: true, name: 'idx_recscore_user_target' } },
  { collection: 'follows', index: { followingId: 1, createdAt: -1 }, options: { background: true, name: 'idx_follow_following_date' } },
  { collection: 'profiles', index: { 'skills.name': 1, institution: 1 }, options: { background: true, sparse: true, name: 'idx_profile_skills_institution' } },
  { collection: 'profiles', index: { institution: 1, department: 1 }, options: { background: true, sparse: true, name: 'idx_profile_institution_dept' } }
];

const ensurePerformanceIndexes = async () => {
  const db = mongoose.connection.db;
  if (!db) {
    logger.warn('[PerformanceIndexes] DB not ready — skipping index creation');
    return;
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const { collection, index, options } of COMPOUND_INDEXES) {
    try {
      const col = db.collection(collection);
      await col.createIndex(index, options);
      created++;
    } catch (err) {
      if (err.code === 85 || err.code === 86 || (err.message && err.message.includes('already exists'))) {
        skipped++;
      } else {
        errors++;
        logger.warn('[PerformanceIndexes] Failed to create index on ' + collection + ': ' + err.message);
      }
    }
  }

  logger.info('[PerformanceIndexes] Done — created: ' + created + ', skipped (exists): ' + skipped + ', errors: ' + errors);
};

module.exports = { ensurePerformanceIndexes };
