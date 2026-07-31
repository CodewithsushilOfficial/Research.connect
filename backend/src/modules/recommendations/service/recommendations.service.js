const recommendationsRepository = require('../repository/recommendations.repository');
const config = require('../../../config/recommendation.config');
const Profile = require('../../../models/Profile');
const User = require('../../../models/User');
const Publication = require('../../../models/Publication');
const Follow = require('../../../models/Follow');
const Connection = require('../../../models/Connection');

const Project = require('../../../models/Project');
const Event = require('../../../models/Event');
const logger = require('../../../common/logger/winston');

class RecommendationsService {
  /**
   * Refreshes the cached recommendation profile of a user.
   */
  async refreshUserRecommendationProfile(userId) {
    const [profile, followingDocs, connections, userPublications] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Follow.find({ followerId: userId }).select('followingId').lean(),
      Connection.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: 'accepted'
      }).lean(),
      Publication.find({ userId, isDeleted: { $ne: true } }).select('keywords researchAreas authors').lean()
    ]);

    const followingIds = followingDocs.map(f => f.followingId.toString());
    const connectionIds = connections.map(c =>
      c.senderId.toString() === userId.toString() ? c.receiverId.toString() : c.senderId.toString()
    );

    const researchAreas = profile?.researchAreas || [];
    const keywords = profile?.skills?.map(s => s.name) || [];
    const institutions = profile?.institution ? [profile.institution] : [];
    const countries = profile?.country ? [profile.country] : [];

    // Aggregate co-authors from publications
    const coAuthorSet = new Set();
    userPublications.forEach(pub => {
      if (pub.authors) {
        pub.authors.split(',').forEach(auth => {
          const trimmed = auth.trim();
          if (trimmed) coAuthorSet.add(trimmed);
        });
      }
    });

    const recommendationProfile = {
      researchAreas,
      keywords,
      institutions,
      coAuthors: Array.from(coAuthorSet),
      communities: [], // Can be updated based on joined communities if needed
      projects: [],
      datasets: [],
      countries,
      languages: [],
      activityCount: userPublications.length * 5 + followingIds.length + connectionIds.length
    };

    await recommendationsRepository.saveProfile(userId, recommendationProfile);
    return recommendationProfile;
  }

  /**
   * Calculates the compatibility score (0-100%) between two users.
   */
  async calculateCompatibilityScore(userId, targetUserId) {
    const Connection = require('../../../models/Connection');
    const Publication = require('../../../models/Publication');
    const CoAuthor = require('../../../models/CoAuthor');

    // Fetch profiles for both users
    const [userProfile, targetProfile] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Profile.findOne({ userId: targetUserId }).lean()
    ]);

    if (!userProfile || !targetProfile) {
      return { score: 0, reasons: ['Missing profile data'] };
    }

    const [userConnections, targetPublications, targetCoAuthors, userCoAuthors] = await Promise.all([
      Connection.find({
        $or: [{ researcherA: userId }, { researcherB: userId }]
      }).lean(),
      Publication.find({ userId: targetUserId, isDeleted: { $ne: true }, status: 'published' }).select('keywords title abstract').lean(),
      CoAuthor.find({ userId: targetUserId }).lean(),
      CoAuthor.find({ userId }).lean()
    ]);

    const myConnectionIds = userConnections.map(c => 
      c.researcherA.toString() === userId.toString() ? c.researcherB.toString() : c.researcherA.toString()
    );

    let score = 0;
    const reasons = [];

    const myAreas = (userProfile.researchAreas || []).map(a => a.name?.toLowerCase().trim()).filter(Boolean);
    const targetAreas = (targetProfile.researchAreas || []).map(a => a.name?.toLowerCase().trim()).filter(Boolean);
    const mySkills = (userProfile.skills || []).map(s => s.name?.toLowerCase().trim()).filter(Boolean);
    const myName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.toLowerCase().trim();

    // 1. Common Research Areas (30%)
    const sharedAreas = myAreas.filter(a => targetAreas.includes(a));
    if (sharedAreas.length > 0) {
      const areaWeight = Math.min(1.0, sharedAreas.length / 2);
      score += 30 * areaWeight;
      reasons.push(`Shared research area: ${sharedAreas[0]}`);
    }

    // 2. Publication Keywords (20%)
    const targetPubKeywords = [];
    targetPublications.forEach(p => (p.keywords || []).forEach(k => targetPubKeywords.push(k.toLowerCase().trim())));
    const sharedKeywords = mySkills.filter(k => targetPubKeywords.includes(k));
    if (sharedKeywords.length > 0) {
      const keywordWeight = Math.min(1.0, sharedKeywords.length / 3);
      score += 20 * keywordWeight;
      reasons.push(`${sharedKeywords.length} matching publication keywords`);
    }

    // 3. Publication Topics (15%)
    let topicMatches = 0;
    targetPublications.forEach(p => {
      const text = `${p.title || ''} ${p.abstract || ''}`.toLowerCase();
      const hasMatch = mySkills.some(k => text.includes(k)) || myAreas.some(a => text.includes(a));
      if (hasMatch) topicMatches++;
    });
    if (topicMatches > 0) {
      score += 15 * Math.min(1.0, topicMatches / 2);
      reasons.push('Overlap in publication topics');
    }

    // 4. Institution Match (10%)
    if (userProfile.institution && targetProfile.institution && 
        userProfile.institution.toLowerCase().trim() === targetProfile.institution.toLowerCase().trim()) {
      score += 10;
      reasons.push(`Same institution: ${targetProfile.institution}`);
    }

    // 5. Mutual Connections (10%)
    const targetConnections = await Connection.find({
      $or: [{ researcherA: targetUserId }, { researcherB: targetUserId }]
    }).lean();
    const targetConnectionIds = targetConnections.map(c =>
      c.researcherA.toString() === targetUserId.toString() ? c.researcherB.toString() : c.researcherA.toString()
    );
    const mutualConnections = myConnectionIds.filter(id => targetConnectionIds.includes(id));
    if (mutualConnections.length > 0) {
      const mutualConnCount = mutualConnections.length;
      score += 10 * Math.min(1.0, mutualConnCount / 3);
      reasons.push(`${mutualConnCount} mutual connection${mutualConnCount > 1 ? 's' : ''}`);
    }

    // 6. Common Co-Authors / Collaboration History (5%)
    const myCoNames = userCoAuthors.map(c => c.name.toLowerCase());
    const targetCoAuthNames = targetCoAuthors.map(co => co.name.toLowerCase());
    const sharedCoAuthors = myCoNames.filter(name => targetCoAuthNames.includes(name));
    const targetName = `${targetProfile.firstName || ''} ${targetProfile.lastName || ''}`.toLowerCase().trim();
    const isCoAuthor = myCoNames.includes(targetName) || targetCoAuthNames.includes(myName);
    if (isCoAuthor || sharedCoAuthors.length > 0) {
      score += 5;
      reasons.push('Collaboration history');
    }

    // 7. Country Match (5%)
    if (userProfile.country && targetProfile.country && 
        userProfile.country.toLowerCase().trim() === targetProfile.country.toLowerCase().trim()) {
      score += 5;
      reasons.push(`Same country: ${targetProfile.country}`);
    }

    // 8. Recent Activity (5%)
    const targetUpdatedAt = targetProfile.updatedAt;
    const isRecent = targetUpdatedAt && (Date.now() - new Date(targetUpdatedAt).getTime() < 7 * 24 * 60 * 60 * 1000);
    score += 5 * (isRecent ? 1.0 : 0.5);

    if (score === 0) score = 15;

    return {
      score: Math.min(100, Math.max(10, Math.round(score))),
      reasons
    };
  }

  /**
   * Refreshes recommendation scores for a single user in the background.
   */
  async refreshAllRecommendations(userId) {
    try {
      logger.info(`Starting background recommendations refresh for user: ${userId}`);
      
      // Refresh user profile cache first
      await this.refreshUserRecommendationProfile(userId);

      // 1. Refresh Researcher Matches
      const otherUsers = await User.find({ 
        _id: { $ne: userId }, 
        status: 'active', 
        isDeleted: { $ne: true } 
      }).select('_id').lean();

      for (const targetUser of otherUsers) {
        const { score, reasons } = await this.calculateCompatibilityScore(userId, targetUser._id);
        if (score >= 10) { // Only store meaningful matches
          await recommendationsRepository.saveRecommendationScore(
            userId, 
            targetUser._id, 
            'User', 
            score, 
            reasons
          );
        }
      }

      // 2. Refresh Publication Matches
      // Simple publication matcher based on keywords
      const userProfile = await Profile.findOne({ userId }).lean();
      const userKeywords = (userProfile?.skills || []).map(s => s.name.toLowerCase().trim());
      const publications = await Publication.find({ 
        userId: { $ne: userId }, 
        isDeleted: { $ne: true } 
      }).select('_id keywords title').lean();

      for (const pub of publications) {
        const pubKeywords = (pub.keywords || []).map(k => k.toLowerCase().trim());
        const shared = userKeywords.filter(k => pubKeywords.includes(k));
        let pubScore = 0;
        const reasons = [];

        if (shared.length > 0) {
          pubScore = Math.min(100, Math.round((shared.length / Math.max(5, userKeywords.length)) * 100));
          reasons.push('Same Keywords');
        }

        if (pubScore >= 10) {
          await recommendationsRepository.saveRecommendationScore(
            userId, 
            pub._id, 
            'Publication', 
            pubScore, 
            reasons
          );
        }
      }



      logger.info(`Completed recommendations refresh for user: ${userId}`);
    } catch (err) {
      logger.error(`Error refreshing recommendations for user ${userId}:`, err);
    }
  }

  /**
   * Retrieves recommended researchers for a user with dynamic filtering, real-time recommendation scoring, and pagination.
   */
  async getRecommendedResearchers(userId, queryOptions = {}) {
    const {
      limit = 12,
      page = 1,
      search = '',
      researchArea = '',
      institution = '',
      department = '',
      country = '',
      designation = '',
      keyword = '',
      minPublications,
      minCitations,
      minHIndex,
      isAvailableForCollaboration,
      isVerified,
      recentlyJoined,
      sortBy = 'matchPercentage'
    } = queryOptions;

    const followRepository = require('../../follow/repository/follow.repository');
    const CoAuthor = require('../../../models/CoAuthor');

    // 1. Fetch current user data & relationships
    const [myProfile, myFollows, dismissedIds, myCoAuthors, myConnections] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Follow.find({ followerId: userId }).select('followingId').lean(),
      recommendationsRepository.getInteractedTargetIds(userId, 'User', ['dismiss']),
      CoAuthor.find({ userId }).lean(),
      Connection.find({
        $or: [{ senderId: userId }, { receiverId: userId }, { researcherA: userId }, { researcherB: userId }],
        status: 'accepted'
      }).lean()
    ]);

    const followingIds = myFollows.map(f => f.followingId.toString());
    const connectionIds = myConnections.map(c => {
      const a = (c.senderId || c.researcherA || '').toString();
      const b = (c.receiverId || c.researcherB || '').toString();
      return a === userId.toString() ? b : a;
    }).filter(Boolean);

    const excludedSet = new Set([
      userId.toString(),
      ...followingIds,
      ...dismissedIds.map(id => id.toString())
    ]);

    // 2. Build User query
    const userQuery = {
      _id: { $nin: Array.from(excludedSet) },
      isDeleted: { $ne: true },
      status: { $ne: 'suspended' }
    };

    if (isVerified) {
      userQuery.status = 'verified';
    }

    if (recentlyJoined) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      userQuery.createdAt = { $gte: thirtyDaysAgo };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      userQuery.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { fullName: searchRegex },
        { username: searchRegex }
      ];
    }

    const candidateUsers = await User.find(userQuery)
      .select('firstName lastName fullName username profileSlug slug profileImage country status createdAt')
      .lean();

    if (!candidateUsers.length) {
      return {
        docs: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasMore: false
      };
    }

    const candidateIds = candidateUsers.map(u => u._id);

    // 3. Build Profile query
    const profileQuery = {
      userId: { $in: candidateIds },
      isDeleted: { $ne: true }
    };

    if (institution) {
      profileQuery.institution = new RegExp(institution, 'i');
    }
    if (department) {
      profileQuery.department = new RegExp(department, 'i');
    }
    if (designation) {
      profileQuery.designation = new RegExp(designation, 'i');
    }
    if (country) {
      profileQuery.country = new RegExp(country, 'i');
    }
    if (isAvailableForCollaboration) {
      profileQuery.openToCollaborate = true;
    }
    if (researchArea) {
      profileQuery['researchAreas.name'] = new RegExp(researchArea, 'i');
    }
    if (keyword) {
      profileQuery['skills.name'] = new RegExp(keyword, 'i');
    }
    if (minPublications !== undefined) {
      profileQuery['metrics.publicationsCount'] = { $gte: minPublications };
    }
    if (minCitations !== undefined) {
      profileQuery['metrics.totalCitations'] = { $gte: minCitations };
    }
    if (minHIndex !== undefined) {
      profileQuery['metrics.hIndex'] = { $gte: minHIndex };
    }

    const candidateProfiles = await Profile.find(profileQuery).lean();
    const profileMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));

    // Filter out users whose profile doesn't match the profileQuery
    const eligibleUsers = candidateUsers.filter(u => profileMap.has(u._id.toString()));

    if (!eligibleUsers.length) {
      return {
        docs: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasMore: false
      };
    }

    // 4. Batch load Candidate Publications & CoAuthors for scoring
    const eligibleIds = eligibleUsers.map(u => u._id);
    const [candidatePubs, candidateCoAuthors, candidateConnections] = await Promise.all([
      Publication.find({ userId: { $in: eligibleIds }, isDeleted: { $ne: true } })
        .select('userId keywords title abstract researchAreas')
        .lean(),
      CoAuthor.find({ userId: { $in: eligibleIds } }).select('userId name').lean(),
      Connection.find({
        $or: [
          { senderId: { $in: eligibleIds } },
          { receiverId: { $in: eligibleIds } },
          { researcherA: { $in: eligibleIds } },
          { researcherB: { $in: eligibleIds } }
        ],
        status: 'accepted'
      }).select('senderId receiverId researcherA researcherB').lean()
    ]);

    const pubsMap = new Map();
    candidatePubs.forEach(p => {
      const uid = p.userId.toString();
      if (!pubsMap.has(uid)) pubsMap.set(uid, []);
      pubsMap.get(uid).push(p);
    });

    const coAuthMap = new Map();
    candidateCoAuthors.forEach(ca => {
      const uid = ca.userId.toString();
      if (!coAuthMap.has(uid)) coAuthMap.set(uid, []);
      coAuthMap.get(uid).push(ca.name.toLowerCase());
    });

    const candConnectionMap = new Map();
    candidateConnections.forEach(c => {
      const a = (c.senderId || c.researcherA || '').toString();
      const b = (c.receiverId || c.researcherB || '').toString();
      if (a) {
        if (!candConnectionMap.has(a)) candConnectionMap.set(a, new Set());
        if (b) candConnectionMap.get(a).add(b);
      }
      if (b) {
        if (!candConnectionMap.has(b)) candConnectionMap.set(b, new Set());
        if (a) candConnectionMap.get(b).add(a);
      }
    });

    // Scoring parameters
    const myAreas = (myProfile?.researchAreas || []).map(a => (a.name || a).toLowerCase().trim()).filter(Boolean);
    const mySkills = (myProfile?.skills || []).map(s => (s.name || s).toLowerCase().trim()).filter(Boolean);
    const myCoNames = myCoAuthors.map(c => c.name.toLowerCase().trim());
    const myName = `${myProfile?.firstName || ''} ${myProfile?.lastName || ''}`.toLowerCase().trim();

    const scoredResearchers = [];

    for (const candUser of eligibleUsers) {
      const uid = candUser._id.toString();
      const prof = profileMap.get(uid) || {};
      const pubs = pubsMap.get(uid) || [];
      const candCoNames = coAuthMap.get(uid) || [];
      const candConns = candConnectionMap.get(uid) || new Set();

      let score = 0;
      const reasons = [];

      // 1. Common Research Areas (30%)
      const candAreas = (prof.researchAreas || []).map(a => (a.name || a).toLowerCase().trim()).filter(Boolean);
      const sharedAreas = myAreas.filter(a => candAreas.includes(a));
      if (sharedAreas.length > 0) {
        score += 30 * Math.min(1.0, sharedAreas.length / 2);
        reasons.push(`Shared area: ${sharedAreas[0]}`);
      }

      // 2. Publication Keywords / Skills (20%)
      const pubKeywords = [];
      pubs.forEach(p => (p.keywords || []).forEach(k => pubKeywords.push(k.toLowerCase().trim())));
      const sharedKeywords = mySkills.filter(k => pubKeywords.includes(k));
      if (sharedKeywords.length > 0) {
        score += 20 * Math.min(1.0, sharedKeywords.length / 3);
        reasons.push(`${sharedKeywords.length} matching research keywords`);
      }

      // 3. Publication Topics / Abstract (15%)
      let topicMatches = 0;
      pubs.forEach(p => {
        const text = `${p.title || ''} ${p.abstract || ''}`.toLowerCase();
        const hasMatch = mySkills.some(k => text.includes(k)) || myAreas.some(a => text.includes(a));
        if (hasMatch) topicMatches++;
      });
      if (topicMatches > 0) {
        score += 15 * Math.min(1.0, topicMatches / 2);
        reasons.push('Publication topic overlap');
      }

      // 4. Institution Match (10%)
      if (myProfile?.institution && prof?.institution &&
          myProfile.institution.toLowerCase().trim() === prof.institution.toLowerCase().trim()) {
        score += 10;
        reasons.push(`Same institution: ${prof.institution}`);
      }

      // 5. Mutual Connections (10%)
      const mutualConns = connectionIds.filter(cid => candConns.has(cid));
      if (mutualConns.length > 0) {
        score += 10 * Math.min(1.0, mutualConns.length / 3);
        reasons.push(`${mutualConns.length} mutual connection${mutualConns.length > 1 ? 's' : ''}`);
      }

      // 6. Co-authorship History (5%)
      const sharedCoAuthors = myCoNames.filter(n => candCoNames.includes(n));
      const candFullName = (candUser.fullName || `${candUser.firstName} ${candUser.lastName}`).toLowerCase().trim();
      const isDirectCoAuthor = myCoNames.includes(candFullName) || candCoNames.includes(myName);
      if (isDirectCoAuthor || sharedCoAuthors.length > 0) {
        score += 5;
        reasons.push('Co-authorship history');
      }

      // 7. Country Match (5%)
      if ((myProfile?.country || '').toLowerCase().trim() && (prof?.country || candUser.country || '').toLowerCase().trim() === (myProfile?.country || '').toLowerCase().trim()) {
        score += 5;
        reasons.push(`Same country: ${prof.country || candUser.country}`);
      }

      // 8. Recent Activity (5%)
      const updatedAt = prof.updatedAt || candUser.createdAt;
      const isRecent = updatedAt && (Date.now() - new Date(updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000);
      score += 5 * (isRecent ? 1.0 : 0.5);

      if (score === 0) score = 20;

      const matchPercentage = Math.min(100, Math.max(15, Math.round(score)));

      const totalCitations = prof.metrics?.totalCitations || 0;
      const hIndex = prof.metrics?.hIndex || 0;
      const i10Index = prof.metrics?.i10Index || 0;
      const publicationsCount = pubs.length || prof.metrics?.publicationsCount || 0;

      scoredResearchers.push({
        _id: candUser._id,
        userId: candUser._id,
        firstName: candUser.firstName,
        lastName: candUser.lastName,
        name: candUser.fullName || `${candUser.firstName} ${candUser.lastName}`,
        fullName: candUser.fullName || `${candUser.firstName} ${candUser.lastName}`,
        username: candUser.username,
        profileSlug: candUser.slug || candUser.profileSlug || candUser.username,
        avatar: candUser.profileImage?.url || candUser.profileImage || prof.profileImage?.url || prof.profileImage || '',
        institution: prof.institution || '',
        department: prof.department || '',
        designation: prof.designation || '',
        country: prof.country || candUser.country || '',
        bio: prof.bio || prof.headline || '',
        headline: prof.headline || prof.bio || '',
        researchAreas: prof.researchAreas || [],
        skills: prof.skills || [],
        openToCollaborate: Boolean(prof.openToCollaborate),
        isAvailableForCollaboration: Boolean(prof.openToCollaborate),
        status: candUser.status,
        isVerified: candUser.status === 'verified' || candUser.status === 'active',
        matchPercentage,
        reasons,
        reason: reasons.slice(0, 2).join(' · ') || 'Academic profile match',
        metrics: {
          totalCitations,
          citationsCount: totalCitations,
          hIndex,
          i10Index,
          publicationsCount,
          researchExperience: prof.metrics?.researchExperience || 0,
          researchScore: prof.metrics?.researchScore || 0
        },
        publicationsCount,
        citationsCount: totalCitations,
        hIndex,
        i10Index,
        createdAt: candUser.createdAt
      });
    }

    // 5. Sorting
    if (sortBy === 'citations') {
      scoredResearchers.sort((a, b) => b.citationsCount - a.citationsCount);
    } else if (sortBy === 'publications') {
      scoredResearchers.sort((a, b) => b.publicationsCount - a.publicationsCount);
    } else if (sortBy === 'hIndex') {
      scoredResearchers.sort((a, b) => b.hIndex - a.hIndex);
    } else if (sortBy === 'recent') {
      scoredResearchers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default: matchPercentage descending
      scoredResearchers.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    // 6. Pagination
    const total = scoredResearchers.length;
    const startIndex = (page - 1) * limit;
    const paginatedDocs = scoredResearchers.slice(startIndex, startIndex + limit);

    // 7. Attach Mutual Followers
    for (const item of paginatedDocs) {
      try {
        const mutualFollowersPreview = await followRepository.getMutualFollowers(userId, item._id, { limit: 3 });
        item.mutualFollowers = (mutualFollowersPreview.docs || []).map(doc => ({
          _id: doc.user._id,
          fullName: doc.user.fullName,
          profileImage: doc.user.profileImage
        }));
      } catch {
        item.mutualFollowers = [];
      }
    }

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      docs: paginatedDocs,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
      hasMore,
      nextCursor: hasMore ? String(page + 1) : null
    };
  }

  /**
   * Retrieves recommended publications.
   */
  async getRecommendedPublications(userId, queryOptions = {}) {
    const [dismissedIds, result] = await Promise.all([
      recommendationsRepository.getInteractedTargetIds(userId, 'Publication', ['dismiss']),
      recommendationsRepository.getRecommendationScores(userId, 'Publication', queryOptions)
    ]);

    const dismissedSet = new Set(dismissedIds.map(id => id.toString()));
    const eligibleDocs = result.docs.filter(doc => !dismissedSet.has(doc.targetId.toString()));

    if (!eligibleDocs.length) return { docs: [], nextCursor: result.nextCursor };

    // Batch fetch all publications in a single query instead of N sequential queries
    const targetIds = eligibleDocs.map(doc => doc.targetId);
    const pubs = await Publication.find({ _id: { $in: targetIds } })
      .populate('userId', 'firstName lastName fullName profileImage institution profileSlug slug username')
      .lean();

    const pubMap = new Map(pubs.map(p => [p._id.toString(), p]));
    const filteredDocs = eligibleDocs.reduce((acc, scoreDoc) => {
      const pub = pubMap.get(scoreDoc.targetId.toString());
      if (pub) acc.push({ ...pub, matchPercentage: scoreDoc.score, reasons: scoreDoc.reasons });
      return acc;
    }, []);

    return { docs: filteredDocs, nextCursor: result.nextCursor };
  }



  /**
   * Retrieves recommended projects.
   */
  async getRecommendedProjects(userId, queryOptions = {}) {
    // Fallback: Query projects matching user's keywords or areas
    const profile = await Profile.findOne({ userId }).lean();
    const keywords = (profile?.skills || []).map(s => s.name.toLowerCase());

    const projects = await Project.find({
      userId: { $ne: userId },
      isDeleted: { $ne: true }
    })
      .populate('userId', 'firstName lastName fullName profileImage profileSlug slug username')
      .limit(10)
      .lean();

    const scored = projects.map(p => {
      const pKeywords = (p.keywords || []).map(k => k.toLowerCase());
      const shared = keywords.filter(k => pKeywords.includes(k));
      const score = shared.length > 0 ? Math.min(100, Math.round((shared.length / Math.max(3, keywords.length)) * 100)) : 15;
      return {
        ...p,
        matchPercentage: score,
        reasons: shared.length > 0 ? ['Shared Keywords'] : ['Suggested Collaboration']
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    return {
      docs: scored,
      nextCursor: null
    };
  }

  /**
   * Retrieves recommended funding opportunities.
   */
  async getRecommendedFunding(userId, queryOptions = {}) {
    // Fetch upcoming events of type 'Funding'
    const fundingEvents = await Event.find({
      type: 'Funding',
      date: { $gte: new Date() },
      isDeleted: { $ne: true }
    })
      .sort({ date: 1 })
      .limit(10)
      .lean();

    return {
      docs: fundingEvents,
      nextCursor: null
    };
  }

  /**
   * Retrieves recommended conferences.
   */
  async getRecommendedConferences(userId, queryOptions = {}) {
    // Fetch upcoming events of type 'Conference'
    const conferences = await Event.find({
      type: 'Conference',
      date: { $gte: new Date() },
      isDeleted: { $ne: true }
    })
      .sort({ date: 1 })
      .limit(10)
      .lean();

    return {
      docs: conferences,
      nextCursor: null
    };
  }
}

module.exports = new RecommendationsService();
