# DealClaw Prototype V4 Implementation Plan

**Goal:** Build a complete, API-driven, no-dead-end interactive prototype for DealClaw V3.0 PRD that implements all 32 P0 user stories.

**Architecture:** State-machine driven frontend with MockAPI layer, localStorage persistence, and complete error handling. Three-column layout (Navigation/Chat/Context Panel) with modern professional UI (Indigo #6366F1 + Emerald #10B981 theme).

**Tech Stack:** Single-file HTML, Tailwind CSS, Vanilla JavaScript, Lucide Icons, Plus Jakarta Sans font.

---

## Implementation Approach

### Phase 1: Core Infrastructure (Tasks 1-2)
- Base HTML structure with three-column layout
- StateManager (FSM with localStorage persistence)
- EventBus (pub/sub for component communication)
- MockAPI (simulated backend with realistic delays)

### Phase 2: UI Components (Task 3)
- ChatRenderer (message bubbles, typing indicator, cards)
- PanelManager (right sidebar views)
- Reusable card components

### Phase 3: User Flows (Tasks 4-9)
- OnboardingFlow (MA-001~MA-001f): Q1-Q5 + profile editor
- TaskFlow (MA-002~MA-009): Intent analysis → strategy → execution
- SEOAgentFlow (SEO-001~SEO-005, SEO-011): Three modes + content
- EmailAgentFlow (EM-001~EM-007, EM-011): Filtering + personalization
- LeadFlow (LD-001~LD-007): Inbox + scoring + reply

### Phase 4: Integration & Testing (Task 10)
- Complete flow integration
- User story verification checklist
- Bug fixes and polish

---

## User Story Coverage Matrix

| Module | User Stories | Count |
|--------|-------------|-------|
| Onboarding | MA-001~MA-001f, MA-004 | 7 |
| Task Management | MA-002, MA-003, MA-005~MA-009 | 8 |
| SEO Agent | SEO-001~SEO-005, SEO-011 | 6 |
| Email Agent | EM-001~EM-007, EM-011 | 8 |
| Lead Center | LD-001~LD-003, LD-007 | 4 |
| Settings | ST-001~ST-003 | 3 |
| **Total P0** | | **32** |

---

## Testing Strategy

### Verification Checklist per User Story
```markdown
## MA-001: Onboarding Welcome
- [ ] Welcome message displays on first load
- [ ] Three input options shown (对话回答/上传资料/两者结合)
- [ ] Each option clickable and triggers correct flow

## MA-001a: Q1-Q5 Complete Flow
- [ ] Q1 (Products) displays and accepts input
- [ ] Q2 (Advantages) allows multiple selection
- [ ] Q3 (Markets) accepts input
- [ ] Q4 (Company Age) has selectable options
- [ ] Q5 (Revenue) has selectable options
- [ ] After Q5, profile card generates

## MA-004: Profile Editing
- [ ] "编辑修改" button opens modal
- [ ] Modal pre-fills current data
- [ ] Changes save correctly
- [ ] Cancel discards changes
```

### Test Execution
1. Manual walkthrough of each user story
2. Verify all buttons have actions
3. Test error states (network failure, validation)
4. Verify localStorage persistence
5. Check responsive layout

---

## UI Style Guide (方案A: 现代专业风)

```css
:root {
    --primary: #6366F1;
    --primary-light: #818CF8;
    --cta: #10B981;
    --background: #F5F3FF;
    --text-primary: #1E1B4B;
    --text-secondary: #4B5563;
}

Font: Plus Jakarta Sans
Style: Flat Design + Micro-shadows
Animations: 200-300ms ease transitions
```

---

## Execution Options

**Option 1: Subagent-Driven (Recommended)**
- Fresh subagent per task
- Two-stage review between tasks
- Fast iteration

**Option 2: Inline Execution**
- Execute tasks in this session
- Batch execution with checkpoints

---

**Plan saved. Ready to execute?**
