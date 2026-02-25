# Requirements Document: Public vs Private Posts

## Introduction

This feature implements a dual-mode post system that allows users to create either public posts (visible to everyone with all replies visible) or private posts (visible only to doctors with isolated replies). This enables both community learning through public discussions and confidential medical consultations through private posts where each doctor provides independent opinions without seeing other doctors' replies.

## Glossary

- **Post**: A user-generated content item that can be either public or private
- **Public_Post**: A post visible to all users (patients, doctors, everyone) with all replies visible to everyone
- **Private_Post**: A post visible only to doctors and the post author, with isolated replies
- **Reply**: A comment made by a user in response to a post
- **Private_Reply**: A reply to a private post that is only visible to the reply author and the post author
- **Post_Author**: The user who created the post
- **Doctor**: A verified user with APPROVED status who can view private posts
- **Patient**: A user who is not a doctor
- **Privacy_Mode**: The visibility setting of a post (PUBLIC or PRIVATE)
- **Reply_Isolation**: The property that prevents doctors from seeing each other's replies on private posts
- **System**: The post and comment management system

## Requirements

### Requirement 1: Post Privacy Mode Selection

**User Story:** As a user, I want to choose whether my post is public or private when creating it, so that I can control who sees my post and how replies are shared.

#### Acceptance Criteria

1. WHEN a user creates a post, THE System SHALL provide an option to mark the post as PUBLIC or PRIVATE
2. WHEN no privacy mode is explicitly selected, THE System SHALL default to PUBLIC mode
3. WHEN a post is created with a privacy mode, THE System SHALL store the privacy mode with the post
4. WHEN a post has been created, THE System SHALL prevent changes to the post's privacy mode
5. THE System SHALL validate that the privacy mode is either PUBLIC or PRIVATE

### Requirement 2: Public Post Visibility

**User Story:** As any user, I want to see public posts and all their replies, so that I can learn from community discussions and compare different opinions.

#### Acceptance Criteria

1. WHEN a post is marked as PUBLIC, THE System SHALL make the post visible to all users regardless of role
2. WHEN a user views a public post, THE System SHALL display all replies to that post
3. WHEN a doctor replies to a public post, THE System SHALL make that reply visible to all users
4. WHEN multiple doctors reply to a public post, THE System SHALL display all doctor replies to all users
5. THE System SHALL include public posts in the main feed for all users

### Requirement 3: Private Post Visibility

**User Story:** As a patient, I want to create private posts that only doctors can see, so that I can get confidential medical advice on sensitive health issues.

#### Acceptance Criteria

1. WHEN a post is marked as PRIVATE, THE System SHALL make the post visible only to users with doctor role and APPROVED status
2. WHEN a post is marked as PRIVATE, THE System SHALL make the post visible to the post author
3. WHEN a non-doctor user attempts to view a private post, THE System SHALL deny access and return an error
4. WHEN a doctor views the private posts list, THE System SHALL display all private posts
5. THE System SHALL exclude private posts from public feeds and search results for non-doctors

### Requirement 4: Private Reply Isolation

**User Story:** As a doctor, I want my replies to private posts to be isolated from other doctors' replies, so that I can provide independent medical opinions without bias.

#### Acceptance Criteria

1. WHEN a doctor replies to a private post, THE System SHALL mark the reply as a private reply
2. WHEN a doctor views a private post, THE System SHALL display only that doctor's own replies and not other doctors' replies
3. WHEN the post author views their private post, THE System SHALL display all replies from all doctors
4. WHEN Doctor A creates a reply to a private post, THE System SHALL prevent Doctor B from viewing Doctor A's reply
5. THE System SHALL maintain reply isolation for all private posts regardless of the number of replies

### Requirement 5: Access Control by User Role

**User Story:** As a system administrator, I want strict access control based on user roles, so that private posts remain confidential and only authorized users can access them.

#### Acceptance Criteria

1. WHEN a user requests a private post, THE System SHALL verify the user is either a doctor with APPROVED status or the post author
2. WHEN a non-doctor user requests the private posts list, THE System SHALL return an empty list or access denied error
3. WHEN a doctor requests a private post's replies, THE System SHALL filter replies to show only the doctor's own replies and exclude other doctors' replies
4. WHEN the post author requests their post's replies, THE System SHALL return all replies without filtering
5. THE System SHALL enforce access control at the API middleware level before processing requests

### Requirement 6: Visual Privacy Indicators

**User Story:** As a user, I want clear visual indicators of post privacy mode, so that I understand which posts are public and which are private.

#### Acceptance Criteria

1. WHEN displaying a private post, THE System SHALL show a lock icon or similar privacy indicator
2. WHEN displaying a public post, THE System SHALL show a globe icon or similar public indicator
3. WHEN a user creates a post, THE System SHALL display a privacy mode selector with clear labels
4. WHEN a user selects private mode during post creation, THE System SHALL display a warning message explaining privacy implications
5. WHEN a doctor views their reply on a private post, THE System SHALL display a message indicating the reply is private

### Requirement 7: Post Filtering by Privacy Mode

**User Story:** As a doctor, I want to filter posts by privacy mode, so that I can easily find private posts that need my attention or browse public discussions.

#### Acceptance Criteria

1. WHEN a doctor views the posts list, THE System SHALL provide filter options for "Public Posts", "Private Posts", and "All Posts"
2. WHEN a doctor selects "Public Posts" filter, THE System SHALL display only public posts
3. WHEN a doctor selects "Private Posts" filter, THE System SHALL display only private posts
4. WHEN a doctor selects "All Posts" filter, THE System SHALL display both public and private posts
5. WHEN a non-doctor user views the posts list, THE System SHALL display only public posts without filter options

### Requirement 8: Database Schema for Privacy

**User Story:** As a developer, I want proper database schema to support privacy modes, so that the system can efficiently store and query posts and replies based on privacy settings.

#### Acceptance Criteria

1. THE System SHALL store an isPrivate boolean field in the Post model with a default value of false
2. THE System SHALL store an isPrivateReply boolean field in the Comment model with a default value of false
3. WHEN a reply is created for a private post, THE System SHALL automatically set isPrivateReply to true
4. WHEN a reply is created for a public post, THE System SHALL set isPrivateReply to false
5. THE System SHALL index the isPrivate field for efficient querying

### Requirement 9: API Endpoints for Privacy

**User Story:** As a developer, I want RESTful API endpoints that handle privacy modes correctly, so that the frontend can implement privacy features consistently.

#### Acceptance Criteria

1. WHEN GET /api/posts is called, THE System SHALL filter posts based on the requesting user's role and privacy settings
2. WHEN GET /api/posts/:id is called, THE System SHALL verify the user has access to the post based on privacy mode
3. WHEN POST /api/posts is called with isPrivate parameter, THE System SHALL create a post with the specified privacy mode
4. WHEN GET /api/posts/:id/comments is called, THE System SHALL filter comments based on privacy rules and user role
5. WHEN POST /api/posts/:id/comments is called, THE System SHALL set isPrivateReply based on the parent post's privacy mode

### Requirement 10: Privacy in Statistics and SEO

**User Story:** As a system administrator, I want private posts excluded from public statistics and SEO, so that private content remains confidential and doesn't appear in search engines.

#### Acceptance Criteria

1. WHEN calculating public karma or reputation, THE System SHALL exclude private posts and private replies
2. WHEN generating public statistics, THE System SHALL exclude private post replies from counts
3. WHEN generating sitemaps, THE System SHALL exclude private posts
4. WHEN serving private post pages, THE System SHALL include noindex and nofollow meta tags
5. THE System SHALL prevent caching of private post content

### Requirement 11: Email Notifications for Privacy

**User Story:** As a user, I want email notifications to indicate the privacy level of posts, so that I understand the confidentiality of the content before opening it.

#### Acceptance Criteria

1. WHEN sending an email notification for a private post, THE System SHALL include a privacy indicator in the subject or body
2. WHEN sending an email notification for a private reply, THE System SHALL indicate that the reply is private
3. WHEN a doctor receives a notification for a private post, THE System SHALL include a note that other doctors cannot see their reply
4. WHEN the post author receives a notification for a private reply, THE System SHALL indicate which doctor replied
5. THE System SHALL use secure email practices for private post notifications

### Requirement 12: Audit Logging for Private Posts

**User Story:** As a system administrator, I want audit logs for private post access, so that I can monitor access to sensitive content and ensure compliance.

#### Acceptance Criteria

1. WHEN a user accesses a private post, THE System SHALL log the access event with user ID, post ID, and timestamp
2. WHEN a doctor views private replies, THE System SHALL log which replies were accessed
3. WHEN a private post is created, THE System SHALL log the creation event
4. WHEN access to a private post is denied, THE System SHALL log the denied access attempt
5. THE System SHALL retain audit logs for private post access for compliance purposes

### Requirement 13: Privacy Mode Immutability

**User Story:** As a system administrator, I want to prevent changes to post privacy mode after creation, so that reply privacy integrity is maintained and users cannot retroactively expose private replies.

#### Acceptance Criteria

1. WHEN a user attempts to change a post's privacy mode after creation, THE System SHALL reject the request
2. WHEN an API call includes a privacy mode change for an existing post, THE System SHALL return an error
3. THE System SHALL validate that privacy mode updates are not allowed in the update post endpoint
4. WHEN a post is created, THE System SHALL permanently set the privacy mode
5. THE System SHALL document that privacy mode is immutable in API documentation

### Requirement 14: Private Post Count Visibility

**User Story:** As a doctor, I want to see the count of private posts without seeing their content, so that I know how many private consultations are available without opening each one.

#### Acceptance Criteria

1. WHEN a doctor views the posts list, THE System SHALL display the total count of private posts
2. WHEN displaying private post counts, THE System SHALL not reveal post content or author information
3. WHEN a doctor has not opened a private post, THE System SHALL show the post in an unopened state
4. WHEN a doctor opens a private post, THE System SHALL mark it as viewed for that doctor
5. THE System SHALL provide a count of unread private posts for each doctor

### Requirement 15: Security and Privacy Controls

**User Story:** As a security engineer, I want comprehensive security controls for private posts, so that sensitive medical information is protected from unauthorized access.

#### Acceptance Criteria

1. THE System SHALL implement middleware-level access control for all private post endpoints
2. THE System SHALL prevent caching of private post content at all levels (browser, CDN, server)
3. THE System SHALL use HTTPS for all private post requests
4. WHEN serving private post content, THE System SHALL include security headers to prevent content leakage
5. THE System SHALL validate user authentication and authorization before serving any private post data
