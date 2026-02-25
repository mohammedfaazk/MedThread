# Implementation Plan: Public vs Private Posts

## Overview

This implementation adds privacy modes to the existing post system. We'll extend the database schema, add access control middleware, update the post and comment services, and modify the frontend to support privacy selection and display. The implementation follows an incremental approach: database changes first, then backend logic, then frontend integration, with testing at each step.

## Tasks

- [x] 1. Database schema migration for privacy fields
  - Add `isPrivate` boolean field to Post model (default: false)
  - Add `isPrivateReply` boolean field to Comment model (default: false)
  - Add index on Post.isPrivate for efficient filtering
  - Create and run Prisma migration
  - Verify migration with test queries
  - _Requirements: 1.2, 1.3, 8.1, 8.2_

- [ ]* 1.1 Write property test for privacy mode defaults
  - **Property 1: Privacy mode defaults to public**
  - **Validates: Requirements 1.2**

- [ ]* 1.2 Write property test for privacy mode persistence
  - **Property 2: Privacy mode persistence**
  - **Validates: Requirements 1.3**

- [x] 2. Implement privacy access control middleware
  - [x] 2.1 Create privacy check utility function
    - Implement `checkPrivatePostAccess()` function
    - Check if user is post author or approved doctor
    - Return access result with filtering flags
    - _Requirements: 3.1, 3.2, 3.3, 5.1_
  
  - [ ]* 2.2 Write property test for private post access control
    - **Property 8: Private post access control**
    - **Validates: Requirements 3.1, 3.2, 5.1**
  
  - [ ]* 2.3 Write property test for non-doctor access denial
    - **Property 9: Non-doctor private post denial**
    - **Validates: Requirements 3.3**
  
  - [x] 2.4 Create Express middleware for private post access
    - Implement `requirePrivatePostAccess` middleware
    - Extract user info from request
    - Call privacy check utility
    - Return 404 if access denied (avoid information leakage)
    - Attach access result to request object
    - _Requirements: 5.5, 15.1_
  
  - [ ]* 2.5 Write unit tests for access control middleware
    - Test authenticated doctor access
    - Test post author access
    - Test non-doctor denial
    - Test unauthenticated denial
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Update Post Service for privacy support
  - [x] 3.1 Modify createPost to accept isPrivate parameter
    - Add isPrivate to CreatePostInput interface
    - Default isPrivate to false if not provided
    - Validate isPrivate is boolean
    - Store isPrivate in database
    - _Requirements: 1.2, 1.3, 1.5_
  
  - [ ]* 3.2 Write property test for privacy mode validation
    - **Property 4: Privacy mode validation**
    - **Validates: Requirements 1.5**
  
  - [x] 3.3 Implement privacy filtering in getPosts
    - Add privacy filter parameter to GetPostsFilter
    - Build where clause based on user role and privacy filter
    - Ensure non-doctors only see public posts (except own posts)
    - Ensure doctors can filter by PUBLIC, PRIVATE, or ALL
    - _Requirements: 2.5, 3.4, 3.5, 7.2, 7.3, 7.4_
  
  - [ ]* 3.4 Write property test for public posts visible to all
    - **Property 5: Public posts visible to all users**
    - **Validates: Requirements 2.1**
  
  - [ ]* 3.5 Write property test for public posts in main feed
    - **Property 7: Public posts in main feed**
    - **Validates: Requirements 2.5**
  
  - [ ]* 3.6 Write property test for doctor private posts list
    - **Property 10: Doctor private posts list**
    - **Validates: Requirements 3.4**
  
  - [ ]* 3.7 Write property test for private posts excluded from non-doctor feeds
    - **Property 11: Private posts excluded from non-doctor feeds**
    - **Validates: Requirements 3.5, 7.5**
  
  - [ ]* 3.8 Write property tests for privacy filtering
    - **Property 15: Public filter returns only public posts**
    - **Property 16: Private filter returns only private posts**
    - **Property 17: All filter returns both privacy modes**
    - **Validates: Requirements 7.2, 7.3, 7.4**
  
  - [ ]* 3.9 Write property test for non-doctor private list empty
    - **Property 18: Non-doctor private list empty**
    - **Validates: Requirements 5.2**
  
  - [x] 3.10 Prevent privacy mode changes in updatePost
    - Check if isPrivate is in update payload
    - Reject update with error if isPrivate is being changed
    - Return 400 Bad Request with clear error message
    - _Requirements: 1.4, 13.1, 13.2, 13.3_
  
  - [ ]* 3.11 Write property test for privacy mode immutability
    - **Property 3: Privacy mode immutability**
    - **Validates: Requirements 1.4, 13.1, 13.2, 13.3, 13.4**

- [ ] 4. Checkpoint - Ensure post service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update Comment Service for reply isolation
  - [x] 5.1 Modify createComment to set isPrivateReply
    - Check if parent post is private
    - Automatically set isPrivateReply = true for private posts
    - Set isPrivateReply = false for public posts
    - _Requirements: 4.1, 8.3, 8.4_
  
  - [ ]* 5.2 Write property test for private reply auto-marking
    - **Property 12: Private reply auto-marking**
    - **Validates: Requirements 4.1, 8.3**
  
  - [ ]* 5.3 Write property test for public comment default
    - **Property 19: Public comment default**
    - **Validates: Requirements 8.2, 8.4**
  
  - [x] 5.4 Implement reply filtering in getComments
    - Check if post is private
    - If private and user is author: return all comments
    - If private and user is doctor: return only that doctor's comments
    - If public: return all comments
    - _Requirements: 4.2, 4.3, 5.3, 5.4_
  
  - [ ]* 5.5 Write property test for public post replies visible to all
    - **Property 6: Public post replies visible to all**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  
  - [ ]* 5.6 Write property test for reply isolation
    - **Property 13: Reply isolation for doctors**
    - **Validates: Requirements 4.2, 4.4, 4.5, 5.3**
  
  - [ ]* 5.7 Write property test for author sees all replies
    - **Property 14: Author sees all replies**
    - **Validates: Requirements 4.3, 5.4**

- [x] 6. Update API routes for privacy support
  - [x] 6.1 Update POST /api/posts endpoint
    - Accept isPrivate parameter in request body
    - Pass isPrivate to createPost service
    - Return created post with privacy mode
    - _Requirements: 1.1, 1.2, 1.3, 9.3_
  
  - [x] 6.2 Update GET /api/posts endpoint
    - Add privacy filter query parameter
    - Extract user role from authentication
    - Pass privacy filter to getPosts service
    - Return filtered posts based on user role
    - _Requirements: 2.5, 3.4, 3.5, 7.2, 7.3, 7.4, 9.1_
  
  - [x] 6.3 Update GET /api/posts/:id endpoint
    - Apply privacy access control middleware
    - Check user has access to post
    - Return 404 if access denied
    - Log access to audit log
    - _Requirements: 3.1, 3.2, 3.3, 9.2, 12.1, 12.4_
  
  - [x] 6.4 Update GET /api/posts/:id/comments endpoint
    - Apply privacy access control middleware
    - Pass filtering flags to getComments service
    - Return filtered comments based on user role
    - Log access to audit log
    - _Requirements: 4.2, 4.3, 9.4, 12.2_
  
  - [x] 6.5 Update POST /api/posts/:id/comments endpoint
    - Apply privacy access control middleware
    - Verify user can access the post
    - Pass post privacy mode to createComment service
    - Return created comment
    - _Requirements: 4.1, 9.5_
  
  - [ ]* 6.6 Write integration tests for API endpoints
    - Test post creation with privacy modes
    - Test post retrieval with access control
    - Test comment creation on private posts
    - Test comment filtering for doctors
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 7. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement audit logging for private posts
  - [x] 8.1 Add audit log entries for private post access
    - Log successful private post access with userId, postId, timestamp
    - Log denied private post access attempts
    - Use existing AuditLog model or create new PrivacyAuditLog
    - _Requirements: 12.1, 12.4_
  
  - [ ]* 8.2 Write property test for private post access logging
    - **Property 29: Private post access logged**
    - **Validates: Requirements 12.1**
  
  - [ ]* 8.3 Write property test for private post denial logging
    - **Property 32: Private post denial logged**
    - **Validates: Requirements 12.4**
  
  - [x] 8.4 Add audit log entries for private reply access
    - Log when doctors view private replies
    - Include doctorId, postId, commentIds accessed
    - _Requirements: 12.2_
  
  - [ ]* 8.5 Write property test for private reply access logging
    - **Property 30: Private reply access logged**
    - **Validates: Requirements 12.2**
  
  - [x] 8.6 Add audit log entries for private post creation
    - Log when private posts are created
    - Include authorId, postId, timestamp
    - _Requirements: 12.3_
  
  - [ ]* 8.7 Write property test for private post creation logging
    - **Property 31: Private post creation logged**
    - **Validates: Requirements 12.3**

- [x] 9. Update statistics and karma calculations
  - [x] 9.1 Exclude private posts from karma calculations
    - Modify karma calculation queries to filter out isPrivate = true
    - Modify karma calculation queries to filter out isPrivateReply = true
    - Update user karma recalculation logic
    - _Requirements: 10.1_
  
  - [ ]* 9.2 Write property test for private posts excluded from karma
    - **Property 20: Private posts excluded from karma**
    - **Validates: Requirements 10.1**
  
  - [x] 9.3 Exclude private replies from public statistics
    - Modify comment count queries to exclude isPrivateReply = true
    - Update trending/hot post calculations
    - _Requirements: 10.2_
  
  - [ ]* 9.4 Write property test for private replies excluded from statistics
    - **Property 21: Private replies excluded from public statistics**
    - **Validates: Requirements 10.2**

- [x] 10. Update SEO and caching for private posts
  - [x] 10.1 Exclude private posts from sitemap
    - Modify sitemap generation to filter isPrivate = false
    - _Requirements: 10.3_
  
  - [ ]* 10.2 Write property test for private posts excluded from sitemap
    - **Property 22: Private posts excluded from sitemap**
    - **Validates: Requirements 10.3**
  
  - [x] 10.3 Add noindex meta tags for private posts
    - Add meta tags in private post page responses
    - Include noindex, nofollow directives
    - _Requirements: 10.4_
  
  - [ ]* 10.4 Write property test for noindex meta tags
    - **Property 23: Private posts have noindex meta tags**
    - **Validates: Requirements 10.4**
  
  - [x] 10.5 Prevent caching of private posts
    - Add cache-control headers to private post responses
    - Set no-cache, no-store, must-revalidate
    - _Requirements: 10.5, 15.2_
  
  - [ ]* 10.6 Write property test for cache prevention
    - **Property 24: Private posts not cached**
    - **Validates: Requirements 10.5, 15.2**
  
  - [x] 10.7 Add security headers for private posts
    - Add X-Content-Type-Options: nosniff
    - Add X-Frame-Options: DENY
    - Add Content-Security-Policy headers
    - _Requirements: 15.4_
  
  - [ ]* 10.8 Write property test for security headers
    - **Property 35: Private post responses include security headers**
    - **Validates: Requirements 15.4**

- [x] 11. Update email notification system
  - [x] 11.1 Add privacy indicators to email templates
    - Modify notification email templates
    - Add privacy badge/indicator for private posts
    - Add privacy badge/indicator for private replies
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 11.2 Write property test for private post email notifications
    - **Property 25: Private post email notifications indicate privacy**
    - **Validates: Requirements 11.1**
  
  - [ ]* 11.3 Write property test for private reply email notifications
    - **Property 26: Private reply email notifications indicate privacy**
    - **Validates: Requirements 11.2**
  
  - [x] 11.4 Add reply isolation explanation to doctor notifications
    - Add note to doctor notifications explaining other doctors can't see their reply
    - _Requirements: 11.3_
  
  - [ ]* 11.5 Write property test for doctor notification isolation explanation
    - **Property 27: Doctor notification explains isolation**
    - **Validates: Requirements 11.3**
  
  - [x] 11.6 Add doctor identifier to author notifications
    - Include replying doctor's username in author notifications
    - _Requirements: 11.4_
  
  - [ ]* 11.7 Write property test for author notification doctor identification
    - **Property 28: Author notification identifies doctor**
    - **Validates: Requirements 11.4**

- [ ] 12. Checkpoint - Ensure backend implementation complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Frontend: Post creation with privacy selector
  - [x] 13.1 Add privacy mode selector to post creation form
    - Add toggle or radio buttons for PUBLIC/PRIVATE selection
    - Default to PUBLIC mode
    - Add visual labels (lock icon for private, globe for public)
    - _Requirements: 1.1, 6.1, 6.2, 6.3_
  
  - [x] 13.2 Add privacy warning message
    - Display warning when user selects PRIVATE mode
    - Explain that only doctors can see the post
    - Explain that replies will be isolated
    - _Requirements: 6.4_
  
  - [x] 13.3 Update post creation API call
    - Include isPrivate parameter in API request
    - Handle validation errors from backend
    - _Requirements: 1.1, 1.3_
  
  - [ ]* 13.4 Write unit tests for post creation form
    - Test privacy selector interaction
    - Test warning message display
    - Test API call with isPrivate parameter
    - _Requirements: 1.1, 6.3, 6.4_

- [ ] 14. Frontend: Privacy indicators in post display
  - [ ] 14.1 Add privacy badge to post cards
    - Show lock icon for private posts
    - Show globe icon for public posts
    - Add tooltip explaining privacy mode
    - _Requirements: 6.1, 6.2_
  
  - [ ] 14.2 Add privacy indicator to post detail page
    - Display privacy badge prominently
    - Show privacy explanation text
    - _Requirements: 6.1, 6.2_
  
  - [ ] 14.3 Add private reply indicator for doctors
    - Show "Private Reply - Only visible to you and the patient" message
    - Display on doctor's own replies to private posts
    - _Requirements: 6.5_
  
  - [ ]* 14.4 Write unit tests for privacy indicators
    - Test lock icon renders for private posts
    - Test globe icon renders for public posts
    - Test private reply message for doctors
    - _Requirements: 6.1, 6.2, 6.5_

- [ ] 15. Frontend: Privacy filtering for doctors
  - [ ] 15.1 Add privacy filter dropdown to posts list
    - Add filter options: "Public Posts", "Private Posts", "All Posts"
    - Only show for doctors
    - Default to "All Posts"
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 15.2 Implement filter state management
    - Store selected filter in component state
    - Update API query when filter changes
    - Refetch posts with new filter
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ] 15.3 Update posts API client
    - Add privacyMode parameter to getPosts call
    - Pass filter value to backend
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ]* 15.4 Write unit tests for privacy filtering UI
    - Test filter dropdown renders for doctors
    - Test filter dropdown hidden for non-doctors
    - Test filter state updates
    - Test API calls with filter parameter
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 16. Frontend: Private post count display
  - [ ] 16.1 Add private post count to doctor dashboard
    - Fetch private post count from API
    - Display count badge or indicator
    - Update count when new private posts created
    - _Requirements: 14.1_
  
  - [ ]* 16.2 Write property test for private post count
    - **Property 33: Private post count visible to doctors**
    - **Validates: Requirements 14.1**
  
  - [ ] 16.3 Limit content in private post list view
    - Only show title, author, timestamp in list
    - Hide full content until post is opened
    - _Requirements: 14.2_
  
  - [ ]* 16.4 Write property test for private post list content hiding
    - **Property 34: Private post list hides content**
    - **Validates: Requirements 14.2**

- [ ] 17. Update existing components for privacy compatibility
  - [ ] 17.1 Update PostsFeed component
    - Pass user role to post filtering
    - Handle privacy filter state
    - Display privacy indicators
    - _Requirements: 2.5, 3.5, 6.1, 6.2_
  
  - [ ] 17.2 Update PostDetail component
    - Check post privacy mode
    - Display privacy indicator
    - Filter comments based on user role
    - Show appropriate messages for private replies
    - _Requirements: 4.2, 4.3, 6.1, 6.5_
  
  - [ ] 17.3 Update comment components
    - Display private reply indicator for doctors
    - Handle filtered comment lists
    - _Requirements: 6.5_
  
  - [ ]* 17.4 Write integration tests for updated components
    - Test PostsFeed with privacy filtering
    - Test PostDetail with private posts
    - Test comment display with reply isolation
    - _Requirements: 2.5, 4.2, 4.3, 6.1, 6.5_

- [ ] 18. Checkpoint - Ensure frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. End-to-end integration and validation
  - [ ] 19.1 Test complete public post flow
    - Create public post
    - Verify visibility to all users
    - Add comments from multiple doctors
    - Verify all comments visible to all users
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [ ] 19.2 Test complete private post flow
    - Create private post as patient
    - Verify only doctors can see it
    - Add comments from multiple doctors
    - Verify each doctor only sees own comments
    - Verify author sees all comments
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_
  
  - [ ] 19.3 Test privacy mode immutability
    - Create post with privacy mode
    - Attempt to change privacy mode
    - Verify update is rejected
    - _Requirements: 1.4, 13.1, 13.2, 13.3_
  
  - [ ] 19.4 Test privacy filtering for doctors
    - Test PUBLIC filter shows only public posts
    - Test PRIVATE filter shows only private posts
    - Test ALL filter shows both types
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ]* 19.5 Write end-to-end integration tests
    - Test complete user journeys for public posts
    - Test complete user journeys for private posts
    - Test access control across different user roles
    - _Requirements: All_

- [ ] 20. Final checkpoint - Complete validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness across all inputs
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- Checkpoints ensure incremental validation and allow for user feedback
- The implementation maintains backward compatibility (existing posts default to public)
- Security is enforced at multiple layers (middleware, service, database)
