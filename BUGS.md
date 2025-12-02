# Bug Report: Frontend Codebase Analysis

> **Note**: API placeholder calls and mock data are intentionally excluded from this report as APIs will be added later.

---

## CRITICAL ISSUES (3)

### 1. Missing Type Definitions for React
- **File**: All `.tsx` files
- **Issue**: TypeScript hints indicate missing `@types/react` package. The project has React 19.2.0 installed but no type definitions.
- **Severity**: Critical
- **Suggested Fix**:
  ```bash
  npm install --save-dev @types/react @types/react-dom
  ```

### 2. Inconsistent API Call Handler Signatures
- **File**: `frontend/components/tables/ApplicationTable.tsx:9-10`
- **Issue**: `onStatusChange` uses `any` type: `(id: string, newStatus: any) => void`. The actual API expects `'pending' | 'accepted' | 'rejected'`.
- **Severity**: Critical
- **Suggested Fix**:
  ```typescript
  onStatusChange?: (id: string, newStatus: 'pending' | 'accepted' | 'rejected') => void;
  ```

### 3. Empty Placeholder Components
- **Files**:
  - `frontend/components/ChatInterface.tsx` (0 bytes)
  - `frontend/components/GeminiLive.tsx` (0 bytes)
  - `frontend/components/LiveAudioSession.tsx` (0 bytes)
  - `frontend/components/PostMeetingReview.tsx` (0 bytes)
- **Issue**: These components are imported/referenced but have no implementation, which will cause runtime errors if accessed.
- **Severity**: Critical
- **Suggested Fix**: Either implement these components or remove imports/references from `App.tsx` and other files.

---

## HIGH SEVERITY ISSUES (7)

### 4. Missing Error Handling in useEffect Hook
- **File**: `hooks/useDashboardData.ts:16-21`
- **Issue**: Using `Promise.allSettled()` correctly handles rejections, but the `catch` block on line 27 will never execute because `allSettled` never rejects. If any promise rejects, it's caught silently.
- **Suggested Fix**:
  ```typescript
  if (apps.status === 'rejected') {
    console.error("Failed to fetch applications:", apps.reason);
  }
  ```

### 5. Race Condition in updateMeetingSummaries
- **File**: `hooks/useDashboardData.ts:85-114`
- **Issue**: The function reads `meetings` state at line 102, but the state was just updated optimistically at line 90. This creates a race condition where the old `meeting` reference might be used.
- **Suggested Fix**: Pass the meeting data as a parameter or use the updated state properly:
  ```typescript
  const meeting = newBlocks.find(...); // Extract from blocks instead of state
  ```

### 6. Missing Null/Undefined Checks in Table Rendering
- **File**: `frontend/components/tables/ApplicationTable.tsx:89`
- **Issue**: `row.founderName.charAt(0)` will throw error if `founderName` is null/undefined
- **Suggested Fix**:
  ```typescript
  {(row.founderName || '?').charAt(0)}
  ```

### 7. Missing Null/Undefined Checks in Location Rendering
- **File**: `frontend/components/tables/ApplicationTable.tsx:83`
- **Issue**: `row.location.split(',')[0]` will throw error if location is null/undefined or doesn't contain a comma
- **Suggested Fix**:
  ```typescript
  {(row.location?.split(',')?.[0] || 'N/A')}
  ```

### 8. Unsafe JSON Stringify in Summary
- **File**: `frontend/components/tables/StartupTable.tsx:54`
- **Issue**: `JSON.stringify(row.context, null, 2)` could fail if context contains circular references or non-serializable objects
- **Suggested Fix**:
  ```typescript
  content={(() => {
    try {
      return typeof row.context === 'string' ? row.context : JSON.stringify(row.context, null, 2);
    } catch (e) {
      return 'Unable to display context';
    }
  })()}
  ```

### 9. Unchecked Array Access in SummaryView
- **File**: `frontend/components/SummaryView.tsx:291`
- **Issue**: `data.find(d => d.id === item.id)` could return undefined, but it's used as `original` without null check on line 296
- **Suggested Fix**:
  ```typescript
  const original = data.find(d => d.id === item.id);
  if (!original) return null; // or provide a default
  ```

### 10. CSS Class String Parsing Risk
- **File**: `frontend/components/TableComponents.tsx:92`
- **Issue**: `row.id.split('-')[1]` assumes ID format without validation. Will break if ID doesn't contain '-'
- **Suggested Fix**:
  ```typescript
  {row.id.split('-')?.[1] || row.id}
  ```

---

## MEDIUM SEVERITY ISSUES (8)

### 11. Potential Memory Leak in Diff Computation
- **File**: `frontend/components/SummaryView.tsx:18-56`
- **Issue**: The `computeDiff` function creates a large 2D array `C` of size `(m+1) x (n+1)` for every diff comparison. For large texts, this could consume significant memory.
- **Suggested Fix**: Implement a more memory-efficient diff algorithm or memoize results

### 12. Missing Dependencies in useEffect
- **File**: `frontend/components/SummaryView.tsx:234-236`
- **Issue**: The useEffect hook that sets drafts doesn't properly handle when `data` array contents change
- **Suggested Fix**: Ensure proper dependency tracking

### 13. Unsafe TranscriptChunk Array Mapping
- **File**: `frontend/components/tables/MeetingTable.tsx:13`
- **Issue**: `formatTranscript` assumes `chunks` array structure without validation
- **Suggested Fix**:
  ```typescript
  const formatTranscript = (chunks: TranscriptChunk[] = []) => {
    if (!Array.isArray(chunks) || chunks.length === 0) return "No transcript available";
    return chunks
      .filter(c => c && c.timestamp && c.speaker && c.text)
      .map(c => `[${new Date(c.timestamp).toLocaleTimeString(...)}] ${c.speaker}: ${c.text}`)
      .join('\n');
  };
  ```

### 14. Inconsistent API Key Handling
- **File**: `services/api.ts:11`
- **Issue**: `process.env.INTERNAL_API_KEY` is used but there's no `.env` file check or default handling. Falls back to empty string which will cause 401 errors.
- **Suggested Fix**:
  ```typescript
  const getHeaders = () => {
    const apiKey = process.env.INTERNAL_API_KEY;
    if (!apiKey) console.warn('INTERNAL_API_KEY not set - API calls may fail');
    return {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
    };
  };
  ```

### 15. Generic Type `any` in API Functions
- **File**: `services/api.ts:121, 131`
- **Issue**: `createMeeting` and `updateMeeting` accept `any` type instead of `MeetingData`
- **Suggested Fix**:
  ```typescript
  createMeeting: async (data: Partial<MeetingData>) => {
  updateMeeting: async (data: MeetingData) => {
  ```

### 16. Missing Fallback for Missing Dates
- **File**: `frontend/components/tables/MeetingTable.tsx:51`
- **Issue**: `row.end_time` may be null, but the fallback is just '-'. Should handle invalid dates gracefully.
- **Suggested Fix**: Add error handling for date parsing

### 17. Missing TypeScript Types in TableComponents
- **File**: `frontend/components/tables/ApplicationTable.tsx:10`
- **Issue**: `onStatusChange` parameter uses `any` type for `newStatus`
- **Suggested Fix**: Use proper union type: `'pending' | 'accepted' | 'rejected'`

### 18. Status Priority Logic Bug
- **File**: `App.tsx:75-78`
- **Issue**: Status sort order assumes status values exist in the object, but could fail with unexpected status values
- **Suggested Fix**:
  ```typescript
  const statusPriority = { pending: 0, rejected: 1, accepted: 2 };
  return (statusPriority[a.status] ?? 3) - (statusPriority[b.status] ?? 3);
  ```

---

## LOW SEVERITY ISSUES (5)

### 19. Missing Accessibility Features
- **File**: Multiple table components (`tables/ApplicationTable.tsx`, `tables/MeetingTable.tsx`, `tables/StartupTable.tsx`)
- **Issue**: Table headers and cells lack proper ARIA labels for screen readers
- **Suggested Fix**: Add `aria-label` and `role="table"`, `role="columnheader"` attributes

### 20. Missing Loading States
- **File**: `hooks/useDashboardData.ts`
- **Issue**: No loading state indicator while data is being fetched from API
- **Suggested Fix**: Add loading state to hook return value

### 21. Hardcoded User Data
- **File**: `frontend/components/Sidebar.tsx:118`
- **Issue**: User profile shows hardcoded "John Doe" and "john@investflow.com"
- **Suggested Fix**: Replace with dynamic user data from context/props

### 22. Missing Error Boundary
- **File**: `index.tsx`
- **Issue**: No error boundary to catch React component rendering errors
- **Suggested Fix**: Wrap App with an Error Boundary component

### 23. Missing Keyboard Navigation
- **File**: All table components
- **Issue**: Tables don't support keyboard navigation (Tab, Arrow keys)
- **Suggested Fix**: Implement keyboard event handlers for accessibility

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 7 |
| Medium | 8 |
| Low | 5 |
| **Total** | **23** |

---

## Immediate Action Items (Priority Order)

1. **Install missing type definitions** - Required for TypeScript to function properly
2. **Remove or implement empty component files** - Critical for functionality
3. **Add null/undefined safety checks** - Prevents runtime crashes
4. **Fix race condition in updateMeetingSummaries** - Could cause data loss
5. **Add proper error handling for API calls** - Currently fails silently
