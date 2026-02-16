# Legacy AI Tutor Components

## TutorChat.tsx

**Status**: Deprecated  
**Reason**: Duplicate tutor implementation with different behavior  
**Canonical Implementation**: `src/app/(course)/tutor.tsx` + `VoiceAssistant` component

This chat-based tutor interface was replaced by the VoiceAssistant-based implementation in the course layout. The canonical tutor experience is now at `/tutor` route within the `(course)` group.

### Migration Notes
- If any deep links or external references point to this component, update them to use `/tutor` route
- This file can be safely deleted after verifying no dependencies exist
- Check for imports: `@/features/ai-tutor/TutorChat`

### Removal Timeline
- Can be removed after 1 release cycle (verify no usage in production)
