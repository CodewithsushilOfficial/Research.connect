const feedRepository = require('../repository/feed.repository');
const CoAuthor = require('../../../models/CoAuthor');
const Profile = require('../../../models/Profile');
const Publication = require('../../../models/Publication');
const FeedInteraction = require('../../../models/FeedInteraction');
const User = require('../../../models/User');
const Follow = require('../../../models/Follow');
const Bookmark = require('../../../models/Bookmark');
const Dataset = require('../../../models/Dataset');
const Comment = require('../../../models/Comment');
const Connection = require('../../../models/Connection');
const FeedEvent = require('../../../models/FeedEvent');
const FeedRanking = require('../../../models/FeedRanking');
const rankingEngine = require('../ranking/feed.ranking');
const {
  buildPersonalizedPipeline,
  buildFollowingPipeline,
  buildTrendingPipeline,
  buildLatestPipeline,
  buildTrendingAreasPipeline
} = require('../aggregation/feed.aggregation');

class FeedService {
  async generatePersonalizedFeed(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const cacheKey = `personalized:${userId}:${page}:${limit}`;
    const { FeedCache } = require('../../../cache/cache.service');

    const cachedFeed = await FeedCache.get(cacheKey);
    if (cachedFeed) {
      return cachedFeed;
    }

    // Fetch lightweight user context (IDs + interest strings) — no full documents
    const [userProfile, followingDocs] = await Promise.all([
      Profile.findOne({ userId }).select('skills education institution department').lean(),
      Follow.find({ followerId: userId }).select('followingId').lean()
    ]);

    const followingIds = followingDocs.map(f => f.followingId);
    const userInterests = userProfile ? [
      ...(userProfile.skills || []).map(s => s.name?.toLowerCase()).filter(Boolean),
      ...(userProfile.education || []).map(e => e.specialization?.toLowerCase()).filter(Boolean)
    ] : [];

    // Build MongoDB aggregation pipeline — scoring done in DB, not in JS
    const skip = (page - 1) * limit;
    const pipeline = [
      {
        $match: {
          isDeleted: { $ne: true },
          status: { $ne: 'draft' }
        }
      },
      {
        $addFields: {
          _score: {
            $add: [
              // Following bonus: +60 if author is followed
              { $cond: [{ $in: ['$userId', followingIds] }, 60, 0] },
              // Same institution bonus: resolved after lookup
              // Keyword overlap bonus
              {
                $multiply: [
                  12,
                  {
                    $size: {
                      $ifNull: [
                        { $setIntersection: [{ $ifNull: ['$keywords', []] }, userInterests] },
                        []
                      ]
                    }
                  }
                ]
              },
              // Popularity weighting
              { $multiply: [{ $ifNull: ['$citations', 0] }, 1.5] },
              { $multiply: [{ $ifNull: ['$views', 0] }, 0.1] },
              { $multiply: [{ $ifNull: ['$downloads', 0] }, 0.5] }
            ]
          }
        }
      },
      { $sort: { _score: -1, createdAt: -1 } },
      {
        $facet: {
          docs: [
            { $skip: skip },
            { $limit: Number(limit) },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                pipeline: [{ $project: { firstName: 1, lastName: 1, fullName: 1, profileImage: 1, institution: 1, department: 1, designation: 1, profileSlug: 1, username: 1 } }],
                as: '_userArr'
              }
            },
            { $addFields: { userId: { $arrayElemAt: ['$_userArr', 0] } } },
            { $project: { _userArr: 0, _score: 0 } }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const [agg] = await Publication.aggregate(pipeline);
    const docs = agg?.docs || [];
    const total = agg?.totalCount?.[0]?.count || 0;

    const result = {
      docs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    };

    await FeedCache.set(cacheKey, result, 120); // 2 minute cache
    return result;
  }

  async getTrendingFeed(options = {}) {
    const { page = 1, limit = 10 } = options;
    const cacheKey = `trending:${page}:${limit}`;
    const { FeedCache } = require('../../../cache/cache.service');

    const cached = await FeedCache.get(cacheKey);
    if (cached) return cached;

    const result = await feedRepository.getPublications({}, { ...options, sort: '-views -downloads -citations' });
    await FeedCache.set(cacheKey, result, 120); // 2 minute cache
    return result;
  }

  async getLatestFeed(options = {}) {
    const { page = 1, limit = 10 } = options;
    const cacheKey = `latest:${page}:${limit}`;
    const { FeedCache } = require('../../../cache/cache.service');

    const cached = await FeedCache.get(cacheKey);
    if (cached) return cached;

    const result = await feedRepository.getPublications({}, { ...options, sort: '-createdAt' });
    await FeedCache.set(cacheKey, result, 60); // 1 minute cache
    return result;
  }

  async getFollowingFeed(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const cacheKey = `following:${userId}:${page}:${limit}`;
    const { FeedCache } = require('../../../cache/cache.service');

    const cached = await FeedCache.get(cacheKey);
    if (cached) return cached;

    // Find researchers followed by the user
    const followingDocs = await Follow.find({ followerId: userId }).lean();
    const followingIds = followingDocs.map(f => f.followingId);

    if (followingIds.length === 0) {
      const emptyResult = { docs: [], total: 0, page: Number(page), limit: Number(limit), totalPages: 0 };
      await FeedCache.set(cacheKey, emptyResult, 60);
      return emptyResult;
    }

    const result = await feedRepository.getPublications({ userId: { $in: followingIds } }, options);
    await FeedCache.set(cacheKey, result, 60); // 1 minute cache
    return result;
  }

  // Publication CRUD
  async createPublication(userId, pubData) {
    // Calculate approximate reading time (1 min per 150 words in abstract)
    const abstractWords = pubData.abstract ? pubData.abstract.split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(abstractWords / 150));

    // Calculate initial research score
    const researchScore = 20 + Math.floor(Math.random() * 10);

    // Generate basic AI analysis structure if missing
    const aiAnalysis = pubData.aiAnalysis || {
      summary: `AI generated synopsis for "${pubData.title}": This research introduces a methodology targeting ${pubData.keywords?.join(', ') || 'specialist concepts'}.`,
      researchGap: 'Current models do not generalize well across different multi-modal environments.',
      futureWork: 'Future experiments should scale this architecture to larger neural layers.',
      methodology: 'Iterative optimization combined with self-attention networks.',
      keyFindings: 'Achieves higher precision with reduced compute latency.',
      noveltyScore: 7,
      difficultyLevel: 'Advanced'
    };

    const publication = await feedRepository.createPublication({
      ...pubData,
      userId,
      readingTime,
      researchScore,
      aiAnalysis
    });

    // Recalculate profile metrics after new publication — non-blocking
    setImmediate(() => this.recalculateResearchScore(userId).catch(() => {}));

    // Flush only the feed cache — do NOT wipe entire Redis cache
    const { FeedCache, ProfileCache } = require('../../../cache/cache.service');
    await Promise.all([
      FeedCache.flush(),
      ProfileCache.del(userId.toString())
    ]);

    return publication;
  }

  async updatePublication(userId, id, pubData) {
    const publication = await feedRepository.getPublicationById(id);
    if (!publication) return null;
    
    // Check ownership
    if (publication.userId._id.toString() !== userId.toString()) {
      throw new Error('Not authorized to update this publication.');
    }

    const updated = await feedRepository.updatePublication(id, pubData);

    // Targeted cache flush — only invalidate feed and this publication
    const { FeedCache, PublicationCache } = require('../../../cache/cache.service');
    await Promise.all([
      FeedCache.flush(),
      PublicationCache.del(id.toString())
    ]);

    return updated;
  }

  async deletePublication(userId, id) {
    const publication = await feedRepository.getPublicationById(id);
    if (!publication) return null;

    if (publication.userId._id.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this publication.');
    }

    const deleted = await feedRepository.deletePublication(id);
    // Non-blocking — recalculate metrics asynchronously
    setImmediate(() => this.recalculateResearchScore(userId).catch(() => {}));

    // Targeted cache flush — only invalidate feed and this publication
    const { FeedCache, PublicationCache, ProfileCache } = require('../../../cache/cache.service');
    await Promise.all([
      FeedCache.flush(),
      PublicationCache.del(id.toString()),
      ProfileCache.del(userId.toString())
    ]);

    return deleted;
  }

  async getPublicationById(id, userId) {
    // Atomic view increment — avoids full document save() overhead
    const publication = await Publication.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('userId', 'firstName lastName fullName profileImage institution department designation profileSlug username').lean();

    if (!publication || publication.isDeleted) return null;

    // Track interaction fire-and-forget — never blocks API response
    if (userId) {
      setImmediate(() =>
        FeedInteraction.create({ userId, publicationId: id, interactionType: 'click' }).catch(() => {})
      );
    }

    // Run all counts in parallel
    const [liked, bookmarked, recommended, likesCount, bookmarksCount, recommendationsCount, commentsCount] = await Promise.all([
      userId ? feedRepository.getLike(userId, id) : null,
      userId ? feedRepository.getBookmark(userId, id) : null,
      userId ? feedRepository.getRecommendation(userId, id) : null,
      feedRepository.countLikes(id),
      feedRepository.countBookmarks(id),
      feedRepository.countRecommendations(id),
      feedRepository.countComments(id)
    ]);

    return {
      ...publication,
      likesCount,
      bookmarksCount,
      recommendationsCount,
      commentsCount,
      liked: !!liked,
      bookmarked: !!bookmarked,
      recommended: !!recommended
    };
  }

  // Follow Mechanisms
  async toggleFollow(followerId, followingId) {
    if (followerId.toString() === followingId.toString()) {
      throw new Error('You cannot follow yourself.');
    }

    const existing = await feedRepository.isFollowing(followerId, followingId);
    if (existing) {
      await feedRepository.deleteFollow(followerId, followingId);
      return { following: false };
    } else {
      await feedRepository.createFollow(followerId, followingId);
      return { following: true };
    }
  }

  async getSuggestedResearchers(userId) {
    const [userProfile, followingDocs] = await Promise.all([
      Profile.findOne({ userId }).select('skills institution department').lean(),
      Follow.find({ followerId: userId }).select('followingId').lean()
    ]);

    const followingIds = followingDocs.map(f => f.followingId);
    const userSkills = (userProfile?.skills || []).map(s => s.name?.toLowerCase()).filter(Boolean);

    // Aggregation pipeline — no full table scan, no in-memory scoring
    const pipeline = [
      {
        $match: {
          userId: { $ne: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) },
          $or: [
            { 'skills.name': { $in: userSkills } },
            { institution: userProfile?.institution || null }
          ].filter(c => Object.values(c)[0] !== null && Object.values(c)[0]?.$in?.length !== 0)
        }
      },
      {
        $addFields: {
          _matchScore: {
            $add: [
              { $multiply: [{ $size: { $setIntersection: [{ $map: { input: { $ifNull: ['$skills', []] }, as: 's', in: { $toLower: '$$s.name' } } }, userSkills] } }, 10] },
              { $cond: [{ $eq: ['$institution', userProfile?.institution || ''] }, 15, 0] }
            ]
          }
        }
      },
      { $sort: { _matchScore: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          pipeline: [{ $project: { firstName: 1, lastName: 1, fullName: 1, profileImage: 1, profileSlug: 1, username: 1 } }],
          as: '_userArr'
        }
      },
      { $addFields: { _user: { $arrayElemAt: ['$_userArr', 0] } } },
      { $project: { userId: 1, institution: 1, department: 1, designation: 1, skills: 1, _user: 1, _matchScore: 1 } }
    ];

    let candidates = [];
    try {
      candidates = await Profile.aggregate(pipeline);
    } catch (_) {}

    const followingSet = new Set(followingIds.map(id => id.toString()));
    return candidates
      .filter(p => !followingSet.has(p.userId?.toString()))
      .slice(0, 5)
      .map(p => ({
        userId: p._user?._id || p.userId,
        profileSlug: p._user?.profileSlug || p._user?.username,
        name: p._user?.fullName || `${p._user?.firstName || ''} ${p._user?.lastName || ''}`.trim(),
        avatar: p.profileImage || p._user?.profileImage,
        institution: p.institution,
        department: p.department,
        designation: p.designation,
        mutualInterests: (p.skills || []).map(s => s.name).filter(n => userSkills.includes(n?.toLowerCase()))
      }));
  }

  // Bookmark Folder management
  async toggleBookmark(userId, publicationId, folderName = 'General', isPrivate = true) {
    const existing = await feedRepository.getBookmark(userId, publicationId);
    if (existing) {
      await feedRepository.deleteBookmark(userId, publicationId);
      await this.recalculateResearchScore(userId);
      return { bookmarked: false };
    } else {
      await feedRepository.createBookmark(userId, publicationId, folderName, isPrivate);
      await this.recalculateResearchScore(userId);
      return { bookmarked: true, folderName };
    }
  }

  async moveBookmark(userId, publicationId, folderName) {
    const bookmark = await Bookmark.findOne({ userId, publicationId, isDeleted: { $ne: true } });
    if (!bookmark) throw new Error('Bookmark not found.');

    bookmark.folderName = folderName;
    await bookmark.save();
    return bookmark;
  }

  async getBookmarkFolders(userId) {
    const bookmarks = await Bookmark.find({ userId, isDeleted: { $ne: true } });
    const folders = [...new Set(bookmarks.map(b => b.folderName))];
    return folders;
  }

  // Nested comments and replies
  async addComment(commentData) {
    const comment = await feedRepository.createComment(commentData);
    return comment;
  }

  async toggleLikeComment(userId, commentId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    const likedIdx = comment.likes.indexOf(userId);
    let liked = false;
    if (likedIdx > -1) {
      comment.likes.splice(likedIdx, 1);
    } else {
      comment.likes.push(userId);
      liked = true;
    }
    await comment.save();
    return { liked, likesCount: comment.likes.length };
  }

  // Similar papers helper
  async findSimilarPapers(publicationId) {
    const pub = await Publication.findById(publicationId);
    if (!pub) return [];

    const similar = await Publication.find({
      _id: { $ne: publicationId },
      keywords: { $in: pub.keywords },
      isDeleted: { $ne: true }
    }).limit(3);

    return similar;
  }

  // Recalculates user's research score dynamically — uses aggregation instead of loading all pubs
  async recalculateResearchScore(userId) {
    // Aggregate publication metrics in a single DB call
    const [aggResult, followCount, bookmarkCount] = await Promise.all([
      Publication.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()), isDeleted: { $ne: true } } },
        { $group: {
          _id: null,
          totalCitations: { $sum: '$citations' },
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          pubCount: { $sum: 1 }
        }}
      ]),
      Follow.countDocuments({ followingId: userId }),
      Bookmark.countDocuments({ userId, isDeleted: { $ne: true } })
    ]);

    const agg = aggResult[0] || { totalCitations: 0, totalViews: 0, totalDownloads: 0, pubCount: 0 };
    const totalScorePoints = agg.totalCitations * 1.5 + (agg.totalViews / 10) + (agg.totalDownloads * 0.5) + (followCount * 2) + (agg.pubCount * 5) + (bookmarkCount * 0.5);
    const scoreRounded = Math.min(99, Math.round(totalScorePoints));

    await Profile.findOneAndUpdate(
      { userId },
      { $set: {
        'metrics.totalCitations': agg.totalCitations,
        'metrics.downloadsCount': agg.totalDownloads,
        'metrics.viewsCount': agg.totalViews,
        'metrics.researchScore': scoreRounded
      }},
      { upsert: false }
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 8 — ACTIVITY FEED ENGINE
  // ═══════════════════════════════════════════════════════════

  /**
   * Record a new activity event into the FeedEvent collection.
   * Called by other modules (publication upload, follow, community post, etc.)
   */
  async recordFeedEvent({ actorId, eventType, entityType, entityId, metadata = {} }) {
    try {
      const event = await FeedEvent.create({
        actorId,
        eventType,
        entityType,
        entityId,
        metadata
      });
      return event;
    } catch (err) {
      // Non-critical — log but never throw to caller
      console.error('[FeedService] recordFeedEvent error:', err.message);
      return null;
    }
  }

  /**
   * Build or refresh per-user ranking context cache.
   */
  async _buildUserContext(userId) {
    // Check cache first
    let ranking = await FeedRanking.findOne({ userId }).lean();
    const cacheStale = !ranking || (Date.now() - new Date(ranking.lastComputedAt).getTime() > 5 * 60 * 1000);

    if (!cacheStale) return ranking;

    const [profile, followingDocs, connections] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Follow.find({ followerId: userId }).select('followingId').lean(),
      Connection.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: 'accepted'
      }).lean()
    ]);

    const followingIds = followingDocs.map(f => f.followingId);
    const connectionIds = connections.map(c =>
      c.senderId.toString() === userId.toString() ? c.receiverId : c.senderId
    );

    const researchInterests = [];
    if (profile) {
      (profile.skills || []).forEach(s => researchInterests.push(s.name?.toLowerCase()));
      (profile.education || []).forEach(e => e.specialization && researchInterests.push(e.specialization.toLowerCase()));
      (profile.researchAreas || []).forEach(r => r.name && researchInterests.push(r.name.toLowerCase()));
    }

    const context = {
      userId,
      followingIds,
      connectionIds,
      collaborationIds: [],
      researchInterests: [...new Set(researchInterests.filter(Boolean))],
      institution: profile?.institution || '',
      country: profile?.country || '',
      lastComputedAt: new Date()
    };

    await FeedRanking.findOneAndUpdate(
      { userId },
      context,
      { upsert: true, new: true }
    );

    return context;
  }

  /**
   * Personalized multi-type activity feed.
   * Uses cursor-based pagination for performance.
   */
  async getActivityFeed(userId, { cursor, limit = 20 } = {}) {
    const userContext = await this._buildUserContext(userId);
    const pipeline = buildPersonalizedPipeline({
      followingIds: userContext.followingIds,
      cursor,
      limit: Number(limit)
    });

    if (!pipeline.length) return { events: [], nextCursor: null };

    const events = await FeedEvent.aggregate(pipeline);
    const ranked = rankingEngine.rankEvents(events, userContext);
    const nextCursor = ranked.length === Number(limit) ? ranked[ranked.length - 1]._id : null;
    return { events: ranked, nextCursor };
  }

  /**
   * Following-only activity feed.
   */
  async getActivityFeedFollowing(userId, { cursor, limit = 20 } = {}) {
    const userContext = await this._buildUserContext(userId);
    const { followingIds } = userContext;

    if (!followingIds.length) return { events: [], nextCursor: null };

    const pipeline = buildFollowingPipeline({ followingIds, cursor, limit: Number(limit) });
    const events = await FeedEvent.aggregate(pipeline);
    const ranked = rankingEngine.rankEvents(events, userContext);
    const nextCursor = ranked.length === Number(limit) ? ranked[ranked.length - 1]._id : null;
    return { events: ranked, nextCursor };
  }

  /**
   * Trending feed — high-engagement events in 24h window.
   */
  async getActivityFeedTrending({ cursor, limit = 20, windowHours = 24 } = {}) {
    const pipeline = buildTrendingPipeline({ cursor, limit: Number(limit), windowHours });
    const events = await FeedEvent.aggregate(pipeline);
    const nextCursor = events.length === Number(limit) ? events[events.length - 1]._id : null;
    return { events, nextCursor };
  }

  /**
   * Latest (chronological) feed.
   */
  async getActivityFeedLatest({ cursor, limit = 20 } = {}) {
    const pipeline = buildLatestPipeline({ cursor, limit: Number(limit) });
    const events = await FeedEvent.aggregate(pipeline);
    const nextCursor = events.length === Number(limit) ? events[events.length - 1]._id : null;
    return { events, nextCursor };
  }

  /**
   * Sidebar bundle — all widget data in one request.
   */
  async getFeedSidebar(userId) {
    const [trendingAreas, suggestedResearchers] = await Promise.all([
      FeedEvent.aggregate(buildTrendingAreasPipeline({ limit: 5, windowHours: 48 })),
      this.getSuggestedResearchers(userId)
    ]);

    // Upcoming conferences (from Event collection via repository)
    let conferences = [];
    let funding = [];
    let jobs = [];
    try {
      const eventsRes = await feedRepository.getEvents({}, { page: 1, limit: 5 });
      conferences = eventsRes?.docs || [];
    } catch (_) {}

    // Funding opportunities from FeedEvent collection
    try {
      funding = await FeedEvent.find({ eventType: 'funding_opportunity', isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    } catch (_) {}

    // Academic jobs from FeedEvent collection
    try {
      jobs = await FeedEvent.find({ eventType: 'academic_job', isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    } catch (_) {}

    // Trending Keywords aggregated from Publication keywords
    let trendingKeywords = [];
    try {
      trendingKeywords = await Publication.aggregate([
        { $match: { isDeleted: { $ne: true }, keywords: { $exists: true, $ne: [] } } },
        { $unwind: '$keywords' },
        { $group: { _id: '$keywords', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { tag: '$_id', count: 1, _id: 0 } }
      ]);
    } catch (_) {}

    if (!trendingKeywords || trendingKeywords.length === 0) {
      trendingKeywords = [
        { tag: 'Multi-Modal', count: 145 },
        { tag: 'Transformers', count: 98 },
        { tag: 'NLP', count: 72 },
        { tag: 'Vector Search', count: 64 },
        { tag: 'AI Safety', count: 53 },
        { tag: 'Bio-Informatics', count: 47 }
      ];
    }

    // Dynamic AI Research Insights based on user profile skills & publications
    let overlapText = 'Focus on updating your research interests and publications to generate personalized AI insights.';
    let gapText = 'Expanding literature coverage';
    let suggestedPaperTitle = 'N/A';
    let suggestedPaperSlug = '';

    try {
      const userProfile = await Profile.findOne({ userId }).lean();
      const userSkills = userProfile?.skills?.map(s => s.name) || [];

      if (userSkills.length > 0) {
        const targetSkill = userSkills[0];
        // Find matching publication by another researcher
        const matchingPub = await Publication.findOne({
          userId: { $ne: userId },
          keywords: { $in: [new RegExp(targetSkill, 'i')] },
          isDeleted: { $ne: true }
        }).populate('userId', 'fullName').lean();

        if (matchingPub) {
          overlapText = `We noticed an overlap between your interest in "${targetSkill}" and ${matchingPub.userId?.fullName || 'another researcher'}'s recent work on "${matchingPub.title}".`;
          gapText = matchingPub.aiAnalysis?.researchGap || 'Generalization across low-resource models';
          suggestedPaperTitle = matchingPub.title;
          suggestedPaperSlug = matchingPub._id;
        } else {
          // Fallback to trending publications by others
          const trendingPub = await Publication.findOne({
            userId: { $ne: userId },
            isDeleted: { $ne: true }
          }).sort({ views: -1 }).populate('userId', 'fullName').lean();

          if (trendingPub) {
            overlapText = `Trending in your community: "${trendingPub.title}" by ${trendingPub.userId?.fullName || 'Scholar'}.`;
            gapText = trendingPub.aiAnalysis?.researchGap || 'Model scaling efficiency';
            suggestedPaperTitle = trendingPub.title;
            suggestedPaperSlug = trendingPub._id;
          }
        }
      } else {
        // Fallback for user without skills
        const trendingPub = await Publication.findOne({
          isDeleted: { $ne: true }
        }).sort({ views: -1 }).populate('userId', 'fullName').lean();

        if (trendingPub) {
          overlapText = `Emerging topic: "${trendingPub.title}" by ${trendingPub.userId?.fullName || 'Scholar'}. Connect with co-authors to expand your network.`;
          gapText = trendingPub.aiAnalysis?.researchGap || 'Optimization under resource constraints';
          suggestedPaperTitle = trendingPub.title;
          suggestedPaperSlug = trendingPub._id;
        }
      }
    } catch (_) {}

    const aiInsight = {
      insight: overlapText,
      researchGap: gapText,
      suggestedPaperTitle,
      suggestedPaperSlug
    };

    return {
      trendingAreas,
      suggestedResearchers,
      conferences,
      funding,
      jobs,
      trendingKeywords,
      aiInsight
    };
  }

  /**
   * Record user interaction with a feed event (impression, click, bookmark, like).
   */
  async recordEventInteraction(userId, eventId, interactionType) {
    try {
      await FeedInteraction.create({
        userId,
        publicationId: eventId, // Reuse existing schema — eventId stored in publicationId field
        interactionType
      });

      // Increment engagement counters on FeedEvent for trending/ranking
      const incrementMap = {
        like: 'engagementCount.likes',
        comment: 'engagementCount.comments',
        share: 'engagementCount.shares',
        bookmark: 'engagementCount.bookmarks'
      };
      if (incrementMap[interactionType]) {
        await FeedEvent.findByIdAndUpdate(eventId, {
          $inc: { [incrementMap[interactionType]]: 1 }
        });
      }
      return { recorded: true };
    } catch (err) {
      console.error('[FeedService] recordEventInteraction error:', err.message);
      return { recorded: false };
    }
  }
}

module.exports = new FeedService();
