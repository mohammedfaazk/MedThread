# Message Sending Error Fix

## Problem
Users are getting the error: `Error sending message: SyntaxError: Unexpected token 'T', "Too many r"... is not valid JSON`

## Root Cause Analysis
The error indicates that the server is returning a non-JSON response (likely HTML or plain text) that starts with "Too many r...", which suggests "Too many requests" from a rate limiter.

### Possible Causes:
1. **Rate Limiting**: Server-side rate limiter (nginx, cloudflare, etc.) returning HTML error pages
2. **Proxy Issues**: Reverse proxy returning non-JSON error responses
3. **Application Rate Limiting**: Our chat service rate limiting (30 messages/minute)
4. **Server Overload**: Server returning error pages instead of JSON

## Fixes Applied

### 1. Improved Error Handling in ChatWindow
**File**: `MedThread/apps/web/src/components/Chat/ChatWindow.tsx`

**Before**: Only tried to parse response as JSON
```typescript
if (!response.ok) {
  const error = await response.json(); // This fails if response is not JSON
  throw new Error(error.error || 'Failed to send message');
}
```

**After**: Graceful handling of non-JSON responses
```typescript
if (!response.ok) {
  let errorMessage = 'Failed to send message';
  try {
    const error = await response.json();
    errorMessage = error.error || errorMessage;
  } catch (jsonError) {
    // If response is not JSON, try to get text
    try {
      const textError = await response.text();
      errorMessage = textError || `HTTP ${response.status}: ${response.statusText}`;
    } catch (textError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
  }
  throw new Error(errorMessage);
}
```

### 2. Enhanced Error Logging
Added detailed logging to help identify the source of rate limiting:
```typescript
catch (error: any) {
  console.error('Error sending message:', error);
  
  // Log detailed error information for debugging
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
    console.error('Response data type:', typeof error.response.data);
    console.error('Response data:', error.response.data);
  }
  
  alert(error.message || 'Failed to send message');
}
```

## Rate Limiting Configuration

### Application Level (Chat Service)
- **Limit**: 30 messages per minute per user per conversation
- **Implementation**: Database-based counting in `checkMessageRateLimit`
- **Response**: JSON with proper error codes

### Potential External Rate Limiting
- **Nginx**: May have rate limiting configured
- **Cloudflare**: If used, may have rate limiting rules
- **Load Balancer**: May have connection limits

## Debugging Steps

### 1. Check Browser Console
Look for the detailed error logs to identify:
- HTTP status code (429 = rate limit, 502/503 = server issues)
- Response content type (text/html = proxy error, application/json = app error)
- Actual error message content

### 2. Check Server Logs
Look for:
- Rate limiting messages
- Database connection issues
- Memory/CPU overload

### 3. Check Network Tab
In browser dev tools, check:
- Response headers for rate limiting info
- Response body content
- Request timing

## Expected Behavior After Fix

### ✅ Successful Message
- Message appears in chat immediately (optimistic UI)
- Server confirms and replaces with real message
- No errors in console

### ✅ Rate Limited (Application)
- Clear error message: "Rate limit exceeded. Please wait until [time]"
- JSON response with proper error code
- User can retry after waiting

### ✅ Rate Limited (External)
- Clear error message showing the actual server response
- No JSON parsing errors
- User understands what happened

### ✅ Server Error
- Clear error message with HTTP status
- No JSON parsing errors
- Helpful debugging information in console

## Files Modified
1. `MedThread/apps/web/src/components/Chat/ChatWindow.tsx` - Improved error handling and logging

## Next Steps
1. **Monitor browser console** for detailed error information
2. **Check server configuration** for external rate limiting
3. **Review server logs** for application-level issues
4. **Test with different message frequencies** to identify rate limit thresholds