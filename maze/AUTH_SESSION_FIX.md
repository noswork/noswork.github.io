# Authentication Session Fix - 401 Error

## Problem Summary

You were encountering a **401 Unauthorized** error when trying to start a race session. The root cause was:

1. **Stale Session Data**: Your browser had cached authentication data from a previous session that expired on the server
2. **Invalid Token**: The access token stored locally was no longer valid on the Supabase server
3. **Failed Logout**: When trying to sign out, you got a 403 error because the session was already invalid on the server

## What Was Fixed

### 1. Enhanced Session Validation (`raceSessionService.js`)
- ✅ Added comprehensive session validation before using tokens
- ✅ Check for token expiration before making API calls
- ✅ Better error logging to identify session issues
- ✅ Added `reset()` method to clear stale session data

### 2. Improved Error Handling (`authService.js`)
- ✅ Gracefully handle logout errors when session is already invalid
- ✅ Automatically clear stale local session data on init
- ✅ Detect and remove incomplete sessions

### 3. Better State Management (`game/index.js`)
- ✅ Reset race session state when user logs out
- ✅ Prevent race sessions from starting with invalid auth

## How to Resolve the Current Issue

### Option 1: Clear Browser Data (Recommended)

1. **Open Developer Console** (F12 or Cmd+Option+I)
2. **Go to Application/Storage tab**
3. **Clear Supabase data**:
   - Click "Local Storage" → Your site URL
   - Find and delete keys starting with `sb-`
   - Or click "Clear all" to remove all local storage

4. **Refresh the page** (Cmd+R or F5)
5. **Sign in again** with your username and password

### Option 2: Use Incognito/Private Mode

1. Open a new incognito/private window
2. Navigate to your maze game
3. Sign in with your credentials
4. The game will work with a fresh session

### Option 3: Manual Logout Script

Run this in the browser console:
```javascript
// Clear all Supabase session data
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
    }
});

// Reload the page
window.location.reload();
```

## Preventing Future Issues

The code improvements will now:

1. **Auto-detect stale sessions** on page load and clear them
2. **Validate token expiration** before making API calls
3. **Handle logout gracefully** even when the session is already invalid
4. **Reset race session state** when authentication changes

## Technical Details

### Error Flow (Before Fix)
```
1. User has expired session in localStorage
2. Game loads → reads stale session data
3. Race session attempts to start with expired token
4. Edge Function receives invalid JWT → returns 401
5. Logout fails → 403 (session already invalid on server)
```

### Fixed Flow (After Fix)
```
1. User has expired session in localStorage
2. Game loads → validates session completeness & expiration
3. If invalid → automatically clears local storage
4. User sees they're logged out
5. User signs in → gets fresh, valid session
6. Race sessions work correctly
```

## Need More Help?

If you still see issues after clearing browser data:

1. Check the browser console for new error messages
2. Look for `[Race]` or `[AuthService]` prefixed logs
3. Verify your Supabase project is running
4. Ensure the Edge Function is deployed correctly

## Files Modified

- `scripts/game/auth/raceSessionService.js` - Enhanced session validation
- `scripts/auth/authService.js` - Improved error handling and session cleanup  
- `scripts/game/index.js` - Better state management on auth changes
- `i18n.js` - Added new error message translations

