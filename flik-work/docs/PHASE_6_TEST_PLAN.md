# Flik V1 Phase 6 — Integration Test Matrix

## Gate A — static/code
- [ ] `npm install`
- [ ] `npm run typecheck`
- [ ] Expo diagnostics
- [ ] No service-role secrets in source
- [ ] Environment variables resolve correctly
- [ ] No placeholder/fake backend calls

## Gate B — authentication
- [ ] Signup
- [ ] Duplicate signup rejection
- [ ] Login
- [ ] Invalid login error
- [ ] OTP success/failure when configured
- [ ] OTP resend/countdown
- [ ] Forgot password
- [ ] Logout
- [ ] Relaunch/session restoration
- [ ] Expired session handling

## Gate C — onboarding/profile
- [ ] Profile creation
- [ ] Duplicate username rejection
- [ ] Avatar upload
- [ ] Campus loaded from DB
- [ ] Interests persist
- [ ] Profile edit persists

## Gate D — feed/posts
- [ ] Campus feed
- [ ] Pagination
- [ ] Pull-to-refresh
- [ ] Empty/loading/error states
- [ ] Like/unlike persistence
- [ ] Text post
- [ ] Image post
- [ ] Video upload
- [ ] Upload failure handling
- [ ] Post deletion authorization
- [ ] Comments
- [ ] Comment deletion authorization

## Gate E — communities
- [ ] Community list
- [ ] Community detail
- [ ] Join/leave
- [ ] Membership persistence
- [ ] Member list
- [ ] Community posts

## Gate F — discover/social
- [ ] People search
- [ ] Community search
- [ ] Post search
- [ ] Follow/unfollow
- [ ] Follow persistence
- [ ] Profile navigation

## Gate G — notifications
- [ ] Like notification
- [ ] Comment notification
- [ ] Follow notification
- [ ] Read/unread state
- [ ] Realtime notification
- [ ] Notification navigation

## Gate H — messaging
Use two real test accounts.
- [ ] Conversation creation
- [ ] Conversation persistence
- [ ] Message send
- [ ] Failed send handling
- [ ] Realtime receive
- [ ] Message persistence after relaunch
- [ ] Unauthorized conversation access blocked

## Gate I — mobile UX
- [ ] Android small screen
- [ ] Android large screen
- [ ] iPhone notch/Dynamic Island
- [ ] Keyboard/composer behavior
- [ ] Safe areas
- [ ] Media permissions
- [ ] Permission denial UX
- [ ] Background/foreground
- [ ] Network disconnect/reconnect

## Gate J — release
- [ ] EAS preview Android build
- [ ] APK installation
- [ ] EAS production Android AAB
- [ ] iOS TestFlight build
- [ ] Crash-free smoke test on both platforms

Phase 6 is complete only after the applicable checks are executed and failures are fixed or explicitly documented.
