# AGENTS.md

## Scope

These instructions apply to the entire `galfar-frontend` repository.

This repository is the React frontend for the Galfar Integrated Web Application. The related API repository is normally located at `D:\galfar-backend`.

## Stack and Commands

- React 19 with Vite and JavaScript/JSX.
- React Router for routing.
- Tailwind CSS for styling.
- TanStack Query for server mutations and queries.
- Zustand and React context for shared client state.
- Axios API functions are centralized in `src/APIs/api.js`.

Use these commands from the repository root:

```powershell
npm.cmd run dev
npm.cmd run build
npx.cmd eslint <changed-files> --quiet
node --test test/*.test.js
```

The full `npm run lint` currently scans generated `dist` files and reports unrelated legacy errors. Always lint changed source files directly. Run the production build for changes affecting routing, imports, shared components, or workflows.

## Project Structure

- `src/Pages`: route-level screens and workflow orchestration.
- `src/Components`: shared and feature components.
- `src/APIs/api.js`: frontend-to-backend API functions.
- `src/Helpers`: permissions, workflow rules, formatting, and document helpers.
- `src/CustomHooks`: reusable React hooks.
- `src/store`: Zustand stores.
- `config/ENV.js`: Vite environment-variable mapping.
- `src/App.jsx`: application routes and route guards.

## Runtime Architecture

The app is a client-rendered Vite SPA. `src/App.jsx` owns the page shell, header/footer visibility, version invalidation, and route table. Authentication data is stored as JSON in `localStorage.userInfo`; `useUserInfo` reads it once into local hook state. Logout removes that key and navigates to `/login`.

At startup, `VITE_APP_VERSION` is compared with `localStorage.app_version`. A version mismatch clears the logged-in user and forces `/login`. Consider this behavior when changing deployment or session handling.

The frontend talks directly to the Express API with Axios. Most API calls build a bearer-token header from `userInfo.token`. Server state is handled partly by TanStack Query and partly by page-local asynchronous functions. Cross-page UI state uses Zustand; legacy shared statement state also uses `AppContext`.

### Environment variables

`config/ENV.js` exposes:

- `VITE_ENVIRONMENT`: selects development or production API URL.
- `VITE_REACT_SERVER_URL`: development API base URL.
- `VITE_REACT_PROD_SERVER_URL`: production API base URL.
- `VITE_SPECIAL_PROJECTS`: comma-separated project codes with special approval flows.
- `VITE_INHOUSE_PROJECTS`: comma-separated in-house project codes.
- `VITE_FLEET_LOCATIONS`: comma-separated Fleet Request location choices.
- `VITE_APP_VERSION`: client version used to invalidate stale sessions.

Never document the values from `.env`; document names and meaning only.

## Route Map

Routes currently declared in `src/App.jsx`:

| Route | Screen | Current guard |
| --- | --- | --- |
| `/` | Home/analytics landing | Public shell |
| `/login` | Login | Public |
| `/resetpwd` | Password reset | Public |
| `/particulars/:dept_id` | Department templates | `AdminRoute` |
| `/receipts`, `/receipts/:mrnumber` | Hiring/Asset receipt form | `NavigationPermissionRoute` |
| `/lstatements`, `/lstatements/:cs_no` | Logistics statement | `ProtectedRoute` |
| `/dashboard` | Hiring/Asset dashboard | `NavigationPermissionRoute` |
| `/dashboardlg` | Logistics dashboard | No route wrapper currently |
| `/dashboardbr` | Buy vs Rent dashboard | `NavigationPermissionRoute` |
| `/dashboardfn` | FN/IOC dashboard | No route wrapper currently |
| `/pendingdashboard` | Consolidated pending approvals | No route wrapper currently |
| `/brstatement`, `/brstatement/:cs_no` | Buy vs Rent statement | `NavigationPermissionRoute` |
| `/filenote`, `/filenote/:fn_no` | File Note/IOC editor | `ProtectedRoute` |
| `/fleetrequest`, `/fleetrequest/:id` | Fleet Request editor/viewer | `FleetRequestRoute` |
| `/dashboardfr/` | Fleet Request dashboard | `FleetRequestRoute` |
| `/contact` | Contact page | No route wrapper currently |

`ProtectedRoute` checks only for `userInfo.token`. `FleetRequestRoute` additionally checks `getFleetRequestAccess(userInfo).canAccess`. Do not assume a hidden navigation item protects an unguarded route.

## Functional Modules

### Authentication and user session

- Login and registration call `/users/login` and `/users/register`.
- Password reset uses `/users/validateemail` followed by public `/emailnotify` reset endpoints.
- User roles, department codes, project codes, admin state, token, and statement permission are returned as part of `userInfo`.
- Role checks accept role arrays; keep role normalization consistent and case-insensitive when adding logic.

### Home and analytics

- `Home` composes analytics greetings, quick access, status cards, pending items, reminders, and announcements.
- `GetAnalyticsData` calls `/analytics/approvals`.
- `GetAnnouncementsData` calls `/announcements`.
- Quick-access links set shared filters and then navigate to module dashboards/forms.

### Templates/particulars

- `/particulars/:dept_id` manages reusable particulars templates by department.
- Department IDs used by navigation are `1` for Plant & Equipment and `2` for Logistics.
- Template management is restricted to administrators; non-admin users see the navigation items locked and cannot open the route directly.
- Backend operations are mounted under `/particulars`; admin/UI checks must not replace backend authorization.

### Hiring/Asset receipts

- Pages/components use `/receipts` for creation, retrieval, update, approval history, counts, file upload, soft deletion, and withdrawal.
- Status progression is Plant-role based and uses `expectedstatusplant`: initiator -> HOD -> FM -> GM -> CEO -> approved.
- Rejection and review/revert behavior depend on receipt approval records and should be checked in both `receiptController` and receipt components before modification.
- Email is dispatched through `/emailnotify/:id?dept=plant` without a module `type`.

### Logistics comparative statements

- Editor route: `/lstatements`; dashboard route: `/dashboardlg`.
- API family: `/logistics`.
- Standard UI flow uses initiator -> incharge -> PM -> GM -> FM -> CEO, with PD inserted after PM for special projects.
- `expectedstatus`, `role_finder`, and backend logistics update logic are the current sources for transition/comment-field behavior.
- Email is dispatched with `dept=logistics`.

### Buy vs Rent

- Editor route: `/brstatement`; dashboard route: `/dashboardbr`.
- API family: `/brstatement`.
- Normal role flow is initiator (`inita`) -> HOD -> FM -> GM -> CEO, with category logic able to bypass FM after HOD.
- Core statuses include `created`, `pending for <role>`, `review`, `rejected`, `reverted`, and `approved`.
- Email is dispatched with `dept=buyvsrent`.

### File Note / IOC

- Editor route: `/filenote`; dashboard route: `/dashboardfn`.
- API family: `/filenote`.
- File Note and IOC share the editor but use type/category-specific templates and approval flows.
- General FN/IOC flows use HOD/FM/GM/CEO variants; Demob and FWA flows use project roles such as CM, PM, PD, and GM.
- Category-specific rules are defined in `roles_helper.js`, `statusfinder.js`, `category_helper.js`, and `filenote_template.js`.
- Special and in-house project configuration affects the FWA/Demob route.
- Email is dispatched with `dept=plant`, plus `type` and `category` query parameters.

### Fleet Request

- Editor/view route: `/fleetrequest/:id`; dashboard route: `/dashboardfr/`.
- API family: `/flreq`.
- Drafts are stored locally by `fleetRequestDraft.js`, scoped to user/project.
- `FleetRequestRoute` requires `fl_req` access.
- Edit access can create/update/send; view access can approve the currently assigned step; manage combines both.
- Project access is restricted except for HOD/GM/CEO, who can view all projects on the backend.
- Email is dispatched through `/emailnotify/:id?dept=plant&type=fr` after the workflow update succeeds.

## Shared State Map

- `userStore`: registration/user flag and selected department.
- `toastStore`: global toast visibility.
- `errorStore`: global error message.
- `logisticsStore`: logistics form data, selected statement, filters, dashboard type, history, PM/project selection, and table columns.
- `statementStore`: edit/revert/update flags, table actions, pagination, and receipt totals.
- `brStore`: Buy vs Rent form/table state, modal flags, IDs, totals, and images.
- `helperStore`: comments, attachments, projects, categories, document/new flags, recall state, quick access, and shared loading flags.
- `assetStore`: Hiring/Asset UI toggle.

Prefer page-local state for state used by one page only. Before adding a new global store, confirm an existing store or query cache does not already own the data.

## API Families

The frontend API wrapper currently covers:

- `/users`: login, registration, email validation, and changelog-read state.
- `/receipts`: Hiring/Asset CRUD, counts, approver details, and file-related operations.
- `/logistics`: Logistics CRUD, dashboards/counts, approval history, recall, and soft delete.
- `/brstatement`: Buy vs Rent CRUD, counts, images, workflow updates, and soft delete.
- `/filenote`: FN/IOC create/update/list/detail/category/document-number/demob/delete operations.
- `/projects`: project details and project-specific CM/PM names.
- `/analytics`: consolidated approval analytics.
- `/announcements`: home-page announcements.
- `/flreq`: Fleet Request document number, create, list, detail, and workflow update.
- `/emailnotify`: workflow email dispatch and password-reset operations.

Keep API calls in `src/APIs/api.js` unless a feature already has a dedicated API module. Do not call Axios directly from a new presentation component.

## Implementation Conventions

- Preserve existing user changes and avoid broad refactors unrelated to the request.
- Reuse existing API functions, permission helpers, stores, modals, and shared components before adding new ones.
- Keep workflow decisions in helpers where practical; components should render the returned action and status.
- Use optional chaining for user and API data that may not be loaded yet.
- Do not hard-code API base URLs. Use the values exposed by `config/ENV.js`.
- Do not expose tokens, secrets, or complete environment values in logs, documentation, or UI messages.
- Keep user-facing success messages action-specific and show workflow success before awaiting secondary work such as email notifications.
- Treat email notification failures separately from the successful workflow update. A failed email must not make a successfully saved request appear to have failed.
- Render page-level dialogs and overlays in a location where sidebar overflow and stacking contexts cannot clip them. Portals are appropriate for reusable global dialogs.

## User Working Preferences

These are established preferences from prior implementation discussions. Follow them unless the user explicitly requests different behavior:

- Before implementing a feature, inspect a similar module that already works and follow its established pattern where appropriate. File Note is often a useful reference for workflow feedback and email sequencing.
- When behavior exists in more than one place, extract the behavior into a shared component, hook, or helper while allowing each location to keep its own presentation. For example, logout confirmation and navigation belong in shared behavior rather than separate handlers.
- Treat the primary save/update/approval API as the operation that determines UI success. Close modals, stop loading, and show the success toast immediately after that operation succeeds.
- Treat email notification as secondary work performed only after the primary workflow update succeeds. Email latency must not delay the completed UI state, and an email failure must not turn a successful workflow update into a failed one.
- Use action-specific success messages instead of generic messages assembled from button labels. Examples: `Approved successfully!`, `Rejected successfully!`, and `Sent back for review successfully!`.
- Approval email behavior should follow the workflow: send/resubmit and intermediate approval notify the next level; rejection and review notify the initiator.
- Prefer predictable navigation interactions. A sidebar should collapse on explicit collapse or outside click, not on mouse leave or an arbitrary timer.
- Use separate, recognizable icons for sibling navigation items so users can distinguish modules at a glance.
- Keep major modules as separate navigation entries when they represent separate workflows. Their links should open the module dashboard, with detail/editor routes still counted as active for that menu item.
- Reuse the existing confirmation modal and toast language/style unless a feature requires a genuinely different interaction.
- Preserve the user's current ordering, labels, commented sections, and in-progress edits unless the requested change requires modifying them.
- Prefer clear, direct implementation over introducing abstraction solely for abstraction's sake. Extract code when it removes real duplication or establishes one source of truth.
- After implementation, run targeted lint on changed files and a production build when imports, routes, shared components, or integration behavior changed.

## Change Reporting Standard

For every implementation, provide a professional handoff that is understandable without reading the full conversation. Include all of the following:

1. **Outcome**: State clearly what was implemented or corrected.
2. **Files changed**: List every file created, modified, renamed, or deleted. Use clickable absolute file links when available and briefly state the purpose of each change.
3. **Impact**: Explain the visible user impact and any effects on navigation, permissions, state, API payloads, workflow statuses, email behavior, or other modules.
4. **Justification**: Explain why the chosen implementation is appropriate, especially when introducing shared abstractions, changing workflow order, or selecting one UX behavior over another.
5. **Technical explanation**: Summarize how the change works, including the relevant execution flow when it is not obvious.
6. **Verification**: Report the exact lint, test, and build checks performed and whether they passed. Clearly separate pre-existing failures from regressions caused by the change.
7. **Risks and limitations**: Mention remaining assumptions, unverified backend/external behavior, migration needs, or follow-up work. If there are none, say so only when useful.

Keep the report proportional to the change. A small edit may need a compact paragraph and file list; a workflow or cross-repository change should use clear sections. Do not claim that behavior was verified when only static inspection or compilation was performed.

## Permissions and Routes

- Always enforce access in the backend; frontend permissions are for navigation and user experience only.
- Fleet Request access is derived through `src/Helpers/fleetRequestPermissions.js` using the `fl_req` statement role.
- Fleet Request workflow actions are derived through `src/Helpers/approvalFlowHelper.js`.
- Route protection is implemented through components such as `ProtectedRoute` and `FleetRequestRoute`.
- When adding navigation, update active-route detection as well as the destination and permission state.

## Fleet Request Workflow

The normal flow is:

```text
Initiator -> CM -> PM -> HOD -> GM -> CEO -> Approved
```

Special projects include PD between PM and HOD. The project-dependent flow is defined by the Fleet Request workflow helpers; do not duplicate it in UI components.

- `create` saves the request with `created` status.
- `send-for-approval` sends or resubmits it to the first approver.
- `approve` advances it to the next approver or to `approved`.
- `reject` ends the active approval path and notifies the initiator.
- `review` sends it back to the initiator for changes.
- `recall` lets an edit-capable initiator withdraw a pending request into the editable `recalled` state; it does not send email.
- Send workflow email only after the workflow API update succeeds.
- Every Fleet Request item requires an explicit `Yes`/`No` selection for ADNOC Fitments and a `Normal`/`CPIS` selection for TPI; both values are persisted, editable, and included in generated PDFs.

### Fleet Request UI action contract

`approvalFlowHelper.js` returns action descriptors consumed by `ButtonTxtFR`, `ApprovalModalFR`, and `FleetRequest`:

| Action | Allowed state/user | Result |
| --- | --- | --- |
| `create` | New request + edit access | Saves as `created` |
| `update` | Initiator/edit access while `created` or `review` | Keeps editable status |
| `send-for-approval` | Initiator/edit access while `created` or `review` | Moves to first approver |
| `approve` | Assigned approver + view/manage access | Moves one step or approves |
| `reject` | Assigned approver, comments required | Status `rejected`, email initiator |
| `review` | Assigned approver, comments required | Status `review`, email initiator |
| `recall` | Initiator/edit access while pending | Status `recalled`, no email |

Workflow success must be shown immediately after the update response. Set loading false before waiting for email. Email failure is logged/reported separately and must not replace the successful workflow message.

Action-specific success messages are generated by `getFleetRequestSuccessMessage` in `FleetRequest.jsx`.

## Navigation and Layout

- `Header` controls desktop navigation and the open state of `SideNav`.
- `SideNav` collapses on outside click or its explicit collapse button, not on mouse leave.
- `Projects` appears immediately after `Plant & Equipment` in `SideNav` and owns the Fleet Request and project IOC entries. Project IOC reuses `/dashboardfn?view=projects-ioc`, defaults to Demob, and limits project-scoped roles to their authorized Demob/HWA categories.
- The general FN/IOC navigation entry remains on `/dashboardfn` and is nested under `Plant & Equipment`; it is distinct from the project-specific IOC entry.
- Plant & Equipment, Logistics, and FN/IOC navigation use role/department/statement permission checks.
- Plant-only users see Logistics locked, and Logistics-only users see Plant & Equipment locked; PM, CM, FM, GM, and CEO are common roles with navigation access to both modules. Locked modules remain visible, but their submenu links are disabled.
- PM, CM, PD, and FM users cannot open Hiring / Asset from the sidebar or by direct route. PM, CM, and PD users also see Buy vs Rent locked and cannot open its routes directly. Plant and Logistics Templates are visible but locked for every non-admin user.
- In-charge users see Projects locked and cannot open Fleet Request or project IOC routes directly. `initpr` and `initdc` users see Plant & Equipment locked and cannot open its workflow routes directly.
- FM users see Projects as locked; its Fleet Request and project IOC submenu links use the disabled state without additional lock icons, and their routes cannot be opened directly. Moving from project IOC to the general Plant FN/IOC dashboard clears the project type, category, project, and pagination filters.
- The Project IOC category dropdown contains only Demob and HWA (`FWA` in persisted/API values), further narrowed when the current project role permits only one category. General FN/IOC categories remain available only outside the Project IOC entry.
- Lock icons are reserved for restricted main menu modules. Restricted submenu links communicate their state through disabled styling and interaction only.
- `LogoutButton` centralizes confirmation, removal of `localStorage.userInfo`, and redirect to `/login`.
- `Alerts` is a shared confirmation modal. Global dialogs should use explicit text colors; if nested layout clipping becomes possible, render them through a portal to `document.body`.
- When changing a menu item, verify expanded view, collapsed tooltip, active state, permission-disabled state, and destination route.
- Dashboard status navigation styling is centralized in `dashboardStatusNav.js`; Hiring/Asset, Logistics, Buy vs Rent, FN/IOC, and Fleet Request use the same status-aware active and hover treatment.
- `DashboardStatusNav` owns the shared responsive status-tab container and mobile overflow affordance used by all dashboards.
- FN/IOC dashboard filters use a full-width two-column layout at medium widths and switch to a non-collapsing single row on large screens; the File Note editor retains its existing wrapping filter layout.
- Disabled submenu and Header links remain keyboard-focusable for explanation, expose an unavailable-role description, and prevent navigation. Permission-denied direct routes redirect home silently.

## Known Constraints and Caveats

- The repository contains generated `dist`; full ESLint currently reports generated and legacy errors.
- Several routes are not wrapped in authentication guards even though navigation is permission-aware.
- Role and status comparisons mix casing in legacy modules. Normalize at boundaries and preserve backend-expected strings.
- `useUserInfo` is not reactive to localStorage changes inside the same mounted component tree; navigation/reload behavior currently handles session changes.
- Module state is split across local state, Zustand, context, and TanStack Query. Trace ownership before changing reset behavior.
- Frontend and backend special-project lists come from separate environment variables and must contain equivalent project codes.

## Accessibility and UX Quality

- All interactive controls must be reachable and operable by keyboard.
- Use semantic links for navigation and buttons for actions; do not use clickable non-interactive elements without the required semantics.
- Icon-only controls require an accessible name through visible text, `aria-label`, or an equivalent mechanism.
- Modals require a labelled dialog, clear focus indication, keyboard-accessible actions, and sensible focus return. Add focus trapping/escape behavior when modifying modal infrastructure.
- Loading, success, and error feedback should be exposed with an appropriate live-region role when users need immediate feedback.
- Do not communicate status by color alone. Preserve readable contrast for active, disabled, error, and success states.
- Verify responsive behavior for the header, SideNav, tables, filters, forms, and dialogs when layout classes change.

## Logging, Privacy, and Performance

- Do not log bearer tokens, passwords, reset tokens, SMTP/storage credentials, full user objects, or sensitive document contents.
- Remove temporary `console.log` statements introduced during implementation. Preserve intentional operational error logging unless replacing it with a better mechanism.
- User emails, project assignments, approval comments, uploaded documents, and generated statements may contain sensitive business or personal information; expose only what the current screen and user require.
- Avoid unnecessary duplicate API calls. Prefer the existing query cache, pagination, filters, and invalidation patterns.
- Large tables must remain paginated or filtered. Do not load every record merely to calculate a display value when the backend already exposes counts.
- Consider lazy loading/code splitting when adding large page-only libraries. The current production bundle already reports a large-chunk warning.

## API Compatibility and Concurrency

- Treat route paths, methods, query parameters, action names, status strings, and response fields as a shared contract with `D:\galfar-backend`.
- Coordinate breaking contract changes across both repositories in the same task. If backward compatibility is required, support both shapes during a documented transition.
- Disable repeated submissions while a primary mutation is running, but stop the loading state as soon as that primary mutation completes.
- Do not derive a new approval status solely on the client and assume it was accepted. Use the saved response as the source of truth.
- When the backend reports a stale/conflicting workflow transition, show the error and refetch rather than silently overwriting newer state.

## Deployment

- Pushes to `main` and eligible pull requests run `.github/workflows/azure-static-web-apps-orange-meadow-02ae73903.yml`.
- CI uses Node 22, installs dependencies, runs the Vite production build, and deploys `dist/` to Azure Static Web Apps.
- Pull requests receive an Azure preview environment; closing a pull request closes that environment.
- SPA navigation fallback is configured in `staticwebapp.config.json` to rewrite unknown client routes to `/index.html`.
- Production Vite variables are supplied through GitHub secrets. Never hard-code a production API URL or copy secret values into source/docs.
- Before deployment-affecting changes, run the same production build locally and verify direct navigation to affected client routes.
- A rollback is normally performed by reverting the responsible commit and redeploying `main`; database/API compatibility must be considered before reverting only one repository.

## Documentation Maintenance

Update this file in the same change whenever any of these change materially:

- Application routes or route guards.
- Roles, permissions, approval order, actions, or statuses.
- API paths, payloads, response shapes, or authentication behavior.
- Environment-variable names or deployment workflow.
- Global state ownership or shared-component responsibilities.
- Email trigger timing or recipient rules.
- Verification commands or known repository limitations.

Keep durable rules here. Put lengthy feature specifications, incident histories, and temporary implementation notes in dedicated files under `docs/` if introduced.

## Definition of Done

A frontend change is complete when all applicable items are satisfied:

1. The requested user behavior is implemented without unrelated changes.
2. Loading, success, empty, disabled, permission-denied, and API-error states have been considered.
3. Route, navigation active state, permissions, and API contracts remain aligned.
4. Keyboard access and responsive layout have been checked for changed UI.
5. Changed JS/JSX files pass targeted ESLint.
6. Relevant tests pass; new workflow/permission behavior has focused coverage when practical.
7. `npm.cmd run build` passes for routing, import, shared-component, or integration changes.
8. Related backend behavior is inspected or updated when the contract changes.
9. Documentation is updated when durable behavior changed.
10. The final handoff follows the Change Reporting Standard above.

If a status string or action name changes, inspect and update the frontend helper, backend controller/model, email processor, filters, dashboard labels, and tests together.

## API Contract

Before changing an API payload or interpreting a response differently, inspect the matching backend route and controller in `D:\galfar-backend`. Keep these aligned:

- URL and HTTP method.
- Authentication requirements.
- Request field names and types.
- Response fields used by the UI.
- Exact workflow status and action strings.
- Email-notification payloads and recipient logic.

## Verification

For every change:

1. Lint every changed JS/JSX file directly.
2. Run the most relevant test when one exists.
3. Run `npm.cmd run build` for structural or integration changes.
4. Manually reason through permission-denied, API-error, loading, success, and email-error paths.
5. Report pre-existing failures separately from failures introduced by the change.
