"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = exports.SearchService = void 0;
const database_1 = require("@medthread/database");
// In-memory store for popular searches (in production, use Redis or database)
const searchCountMap = new Map();
const POPULAR_SEARCHES_LIMIT = 10;
class SearchService {
    /**
     * Universal search across posts, users, and communities
     */
    async search(options) {
        const { query, type = 'all', limit = 20, offset = 0 } = options;
        if (!query || query.trim().length === 0) {
            return {
                posts: [],
                users: [],
                communities: [],
                total: 0
            };
        }
        const searchTerm = query.trim();
        // Track search for popular searches
        this.trackSearch(searchTerm);
        if (type === 'posts' || type === 'all') {
            const posts = await this.searchPosts({ query: searchTerm, limit, offset });
            if (type === 'posts') {
                return { posts, users: [], communities: [], total: posts.length };
            }
        }
        if (type === 'users' || type === 'all') {
            const users = await this.searchUsers({ query: searchTerm, limit, offset });
            if (type === 'users') {
                return { posts: [], users, communities: [], total: users.length };
            }
        }
        if (type === 'communities' || type === 'all') {
            const communities = await this.searchCommunities({ query: searchTerm, limit, offset });
            if (type === 'communities') {
                return { posts: [], users: [], communities, total: communities.length };
            }
        }
        // Search all types
        const [posts, users, communities] = await Promise.all([
            this.searchPosts({ query: searchTerm, limit: 10, offset: 0 }),
            this.searchUsers({ query: searchTerm, limit: 10, offset: 0 }),
            this.searchCommunities({ query: searchTerm, limit: 10, offset: 0 })
        ]);
        return {
            posts,
            users,
            communities,
            total: posts.length + users.length + communities.length
        };
    }
    /**
     * Search posts by title, content, or tags
     */
    async searchPosts(options) {
        const { query, community, limit = 20, offset = 0 } = options;
        const where = {
            isDraft: false,
            isRemoved: false,
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } }
            ]
        };
        if (community) {
            where.community = {
                name: community
            };
        }
        const posts = await database_1.prisma.post.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        role: true,
                        verified: true,
                        doctorVerificationStatus: true,
                        specialty: true,
                        avatar: true
                    }
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        icon: true
                    }
                },
                _count: {
                    select: {
                        votes: true,
                        comments: true
                    }
                }
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit,
            skip: offset
        });
        // Calculate scores
        return posts.map(post => {
            const upvotes = post._count.votes; // Simplified, should calculate actual upvotes
            const score = post.upvotes - post.downvotes;
            return {
                ...post,
                score,
                commentCount: post._count.comments
            };
        });
    }
    /**
     * Search users by username, specialty, or role
     */
    async searchUsers(options) {
        const { query, role, limit = 20, offset = 0 } = options;
        const where = {
            OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { specialty: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } }
            ]
        };
        if (role) {
            where.role = role;
        }
        const users = await database_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                verified: true,
                doctorVerificationStatus: true,
                specialty: true,
                subSpecialty: true,
                bio: true,
                avatar: true,
                totalKarma: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true
                    }
                }
            },
            orderBy: [
                { verified: 'desc' },
                { totalKarma: 'desc' }
            ],
            take: limit,
            skip: offset
        });
        return users;
    }
    /**
     * Search communities by name or description
     */
    async searchCommunities(options) {
        const { query, limit = 20, offset = 0 } = options;
        const communities = await database_1.prisma.community.findMany({
            where: {
                isPrivate: false, // Only show public communities in search
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { displayName: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        posts: true
                    }
                }
            },
            orderBy: {
                memberCount: 'desc'
            },
            take: limit,
            skip: offset
        });
        return communities;
    }
    /**
     * Get autocomplete suggestions
     */
    async getAutocompleteSuggestions(query, limit = 5) {
        if (!query || query.trim().length < 2) {
            return [];
        }
        const searchTerm = query.trim();
        // Get top results from each category
        const [posts, users, communities] = await Promise.all([
            database_1.prisma.post.findMany({
                where: {
                    isDraft: false,
                    isRemoved: false,
                    title: { contains: searchTerm, mode: 'insensitive' }
                },
                select: {
                    id: true,
                    title: true,
                    type: true
                },
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            database_1.prisma.user.findMany({
                where: {
                    username: { contains: searchTerm, mode: 'insensitive' }
                },
                select: {
                    id: true,
                    username: true,
                    role: true,
                    verified: true
                },
                take: limit,
                orderBy: { totalKarma: 'desc' }
            }),
            database_1.prisma.community.findMany({
                where: {
                    isPrivate: false,
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { displayName: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    displayName: true,
                    icon: true
                },
                take: limit,
                orderBy: { memberCount: 'desc' }
            })
        ]);
        return {
            posts: posts.map(p => ({ ...p, type: 'post' })),
            users: users.map(u => ({ ...u, type: 'user' })),
            communities: communities.map(c => ({ ...c, type: 'community' }))
        };
    }
    /**
     * Search doctors by specialty
     */
    async searchDoctors(specialty, limit = 20, offset = 0) {
        const where = {
            OR: [
                { role: 'VERIFIED_DOCTOR' },
                {
                    AND: [
                        { role: 'DOCTOR' },
                        { doctorVerificationStatus: 'APPROVED' }
                    ]
                }
            ]
        };
        if (specialty) {
            where.specialty = { contains: specialty, mode: 'insensitive' };
        }
        const doctors = await database_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                verified: true,
                doctorVerificationStatus: true,
                specialty: true,
                subSpecialty: true,
                yearsOfExperience: true,
                hospitalAffiliation: true,
                bio: true,
                avatar: true,
                totalKarma: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true
                    }
                }
            },
            orderBy: [
                { verified: 'desc' },
                { totalKarma: 'desc' }
            ],
            take: limit,
            skip: offset
        });
        return doctors;
    }
    /**
     * Track search query for popular searches
     */
    trackSearch(query) {
        const lowerQuery = query.toLowerCase();
        const currentCount = searchCountMap.get(lowerQuery) || 0;
        searchCountMap.set(lowerQuery, currentCount + 1);
    }
    /**
     * Get popular searches
     */
    getPopularSearches(limit = 10) {
        const searches = Array.from(searchCountMap.entries())
            .map(([query, count]) => ({ query, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
        return searches;
    }
}
exports.SearchService = SearchService;
exports.searchService = new SearchService();
