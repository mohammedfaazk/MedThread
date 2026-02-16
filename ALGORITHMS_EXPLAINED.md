# Algorithms Used in MedThread

## 1. Hot Post Ranking Algorithm

### Purpose
Ranks posts by combining score (upvotes - downvotes) with recency to surface trending content.

### Complexity
- Time: O(1) per post
- Space: O(1)

### Use Cases
- Default sorting on homepage
- Balances popular posts with new content
- Prevents old posts from dominating feed

### Pseudocode
```
function calculateHotScore(post):
    score = upvotes - downvotes
    ageInHours = (currentTime - createdAt) / 3600000
    
    if score > 0:
        sign = 1
    else if score < 0:
        sign = -1
    else:
        sign = 0
    
    order = log10(max(abs(score), 1))
    
    hotScore = sign * order + ageInHours / 45000
    
    return hotScore
```

### How It Works
1. Calculate net score (upvotes - downvotes)
2. Use logarithm to prevent mega-popular posts from dominating
3. Add time decay factor (older posts get lower scores)
4. Posts with higher scores and newer timestamps rank higher

---

## 2. Rising Post Algorithm

### Purpose
Identifies posts that are gaining traction quickly (rapid upvote growth).

### Complexity
- Time: O(1) per post
- Space: O(1)

### Use Cases
- "Rising" tab to discover trending content early
- Helps new quality posts get visibility
- Rewards engagement velocity

### Pseudocode
```
function calculateRisingScore(post):
    ageInHours = (currentTime - createdAt) / 3600000
    
    if ageInHours < 1:
        ageInHours = 1  // Prevent division by zero
    
    score = upvotes - downvotes
    
    risingScore = score / ageInHours
    
    return risingScore
```

### How It Works
1. Calculate post age in hours
2. Divide score by age to get "velocity"
3. Posts with high score relative to age rank higher
4. Favors new posts with rapid engagement

---

## 3. Recursive Comment Tree Traversal

### Purpose
Builds nested comment structure from flat database records.

### Complexity
- Time: O(n) where n = number of comments
- Space: O(n) for the tree structure

### Use Cases
- Display nested comment threads
- Support up to 10 levels of nesting
- Maintain parent-child relationships

### Pseudocode
```
function buildCommentTree(comments):
    // Create map for O(1) lookup
    commentMap = {}
    for comment in comments:
        commentMap[comment.id] = {
            ...comment,
            replies: []
        }
    
    // Build tree structure
    rootComments = []
    for comment in comments:
        if comment.parentId == null:
            // Top-level comment
            rootComments.push(commentMap[comment.id])
        else:
            // Nested reply
            parent = commentMap[comment.parentId]
            if parent exists:
                parent.replies.push(commentMap[comment.id])
    
    return rootComments
```

### How It Works
1. First pass: Create hashmap of all comments by ID
2. Second pass: Link children to parents
3. Comments without parentId are root-level
4. Comments with parentId are nested under parent
5. Result: Tree structure with nested replies

---

## 4. Levenshtein Distance Algorithm

### Purpose
Measures similarity between two strings (edit distance).

### Complexity
- Time: O(m × n) where m, n are string lengths
- Space: O(m × n) for the DP table

### Current Status in MedThread
⚠️ **NOT YET IMPLEMENTED** - The algorithm is available as a dependency (`damerau-levenshtein`, `fast-levenshtein`) but not actively used in the application code yet.

### Potential Use Cases
- **Search functionality**: Find similar medical terms
- **Typo correction**: "diabetis" → "diabetes"
- **Fuzzy matching**: Match user queries to medical conditions
- **Duplicate detection**: Find similar post titles

### Where It Could Be Used
1. **Search page** (`apps/web/src/app/search/page.tsx`) - Currently uses exact match
2. **Community search** (`apps/api/src/services/community.service.ts`) - Uses SQL LIKE
3. **User search** (`apps/api/src/services/admin.service.ts`) - Uses SQL LIKE

### Pseudocode
```
function levenshteinDistance(str1, str2):
    m = length(str1)
    n = length(str2)
    
    // Create DP table
    dp = array[m+1][n+1]
    
    // Initialize base cases
    for i from 0 to m:
        dp[i][0] = i
    for j from 0 to n:
        dp[0][j] = j
    
    // Fill DP table
    for i from 1 to m:
        for j from 1 to n:
            if str1[i-1] == str2[j-1]:
                cost = 0
            else:
                cost = 1
            
            dp[i][j] = min(
                dp[i-1][j] + 1,      // deletion
                dp[i][j-1] + 1,      // insertion
                dp[i-1][j-1] + cost  // substitution
            )
    
    return dp[m][n]
```

### How It Works
1. Create matrix of size (m+1) × (n+1)
2. Initialize first row and column with indices
3. For each cell, calculate minimum of:
   - Delete character from str1
   - Insert character into str1
   - Replace character in str1
4. Final cell contains edit distance

### Example in MedThread
```
User searches: "hedache"
Database has: "headache"

levenshteinDistance("hedache", "headache") = 1
(one insertion: 'a')

Since distance is small, suggest "headache" as correction
```

---

## 5. Karma Calculation Algorithm

### Purpose
Calculate user reputation based on post and comment votes.

### Complexity
- Time: O(1) per vote
- Space: O(1)

### Use Cases
- User reputation system
- Trust indicators for medical advice
- Gamification and engagement

### Pseudocode
```
function updateUserKarma(userId, voteValue, contentType):
    user = getUser(userId)
    
    if contentType == "POST":
        user.postKarma += voteValue
    else if contentType == "COMMENT":
        user.commentKarma += voteValue
    
    user.totalKarma = user.postKarma + user.commentKarma
    
    saveUser(user)
```

### How It Works
1. Each upvote adds +1 karma
2. Each downvote adds -1 karma
3. Separate tracking for posts vs comments
4. Total karma = post karma + comment karma

---

## 6. Vote Toggle Algorithm

### Purpose
Allow users to remove their vote by clicking the same button again.

### Complexity
- Time: O(1)
- Space: O(1)

### Use Cases
- User changes their mind
- Accidental clicks
- Better UX than requiring "unvote" button

### Pseudocode
```
function handleVote(postId, newVote, currentVote):
    if currentVote == newVote:
        // Toggle off - remove vote
        removeVote(postId)
        scoreDelta = -currentVote
    else:
        // New vote or switch vote
        if currentVote != null:
            scoreDelta = newVote - currentVote
        else:
            scoreDelta = newVote
        
        saveVote(postId, newVote)
    
    updateScore(postId, scoreDelta)
```

### How It Works
1. Check if user already voted with same value
2. If yes: Remove vote (toggle off)
3. If no: Apply new vote
4. Calculate score delta and update

---

## Algorithm Comparison

| Algorithm | Time | Space | Use Case |
|-----------|------|-------|----------|
| Hot Ranking | O(1) | O(1) | Default feed sorting |
| Rising | O(1) | O(1) | Trending content |
| Comment Tree | O(n) | O(n) | Nested comments |
| Levenshtein | O(m×n) | O(m×n) | Search/typo correction |
| Karma | O(1) | O(1) | User reputation |
| Vote Toggle | O(1) | O(1) | Vote interaction |

---

## Performance Considerations

### Hot/Rising Algorithms
- Calculated on-demand during sorting
- Could be pre-computed and cached for large datasets
- Consider using Redis for caching scores

### Comment Tree
- Efficient for moderate nesting (< 1000 comments)
- For very large threads, consider pagination
- Limit depth to 10 levels to prevent performance issues

### Levenshtein
- Expensive for long strings
- Use only for short queries (< 50 chars)
- Consider using trigram similarity for longer text
- Cache common corrections

---

## Future Optimizations

1. **Caching**: Cache hot scores in Redis
2. **Indexing**: Database indexes on score, createdAt
3. **Pagination**: Limit comments per page
4. **Lazy Loading**: Load nested replies on demand
5. **Search**: Use Elasticsearch for fuzzy search instead of Levenshtein

---

## References

- Hot algorithm inspired by Reddit's ranking
- Levenshtein distance: Classic dynamic programming
- Comment tree: Standard tree traversal
- Rising algorithm: Custom velocity-based ranking
