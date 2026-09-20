# Frontend Architecture - Feature-Sliced Design

This document explains the frontend architecture using Feature-Sliced Design (FSD) and Vertical Slices patterns.

## Overview

The frontend follows FSD principles with clear separation across app, pages, features, entities, shared, and widgets layers.

## Architecture Layers

### 1. App Layer

Global application configuration and providers.

#### Structure
```
src/app/
├── providers/
│   ├── auth-provider.svelte       # Authentication provider
│   ├── theme-provider.svelte     # Theme provider
│   └── query-client-provider.svelte # API client provider
├── routes/
│   └── routes.ts                 # Route configuration
├── styles/
│   └── global.css                 # Global styles
└── store/
    └── app-store.ts              # Global application state
```



### 2. Pages Layer

Page-level components and routing, following vertical slice pattern.

#### Structure
```
src/pages/
├── home/
│   ├── ui/
│   │   └── HomePage.svelte
│   ├── model/
│   │   └── home-page.model.ts
│   └── index.ts
├── auth/
│   ├── login/
│   │   ├── ui/
│   │   │   └── LoginPage.svelte
│   │   ├── model/
│   │   │   └── login-page.model.ts
│   │   └── index.ts
│   └── callback/
│       ├── ui/
│       │   └── CallbackPage.svelte
│       ├── model/
│       │   └── callback-page.model.ts
│       └── index.ts
└── tasks/
    ├── list/
    │   ├── ui/
    │   │   └── TaskListPage.svelte
    │   ├── model/
    │   │   └── task-list-page.model.ts
    │   └── index.ts
    └── detail/
        ├── ui/
        │   └── TaskDetailPage.svelte
        ├── model/
        │   └── task-detail-page.model.ts
        └── index.ts
```



### 3. Features Layer

Feature-specific business logic, API integration, and UI components organized as vertical slices.

#### Structure
```
src/features/
├── task-create/
│   ├── model/
│   │   ├── task-create.store.ts      # State management
│   │   ├── task-create.store.spec.ts
│   │   └── task-create.schema.ts     # Validation schemas
│   ├── api/
│   │   ├── task-create.api.ts        # API calls
│   │   └── task-create.api.spec.ts
│   └── ui/
│       ├── TaskCreateForm.svelte
│       └── TaskCreateForm.spec.ts
├── task-edit/
│   ├── model/
│   │   ├── task-edit.store.ts
│   │   ├── task-edit.store.spec.ts
│   │   └── task-edit.schema.ts
│   ├── api/
│   │   ├── task-edit.api.ts
│   │   └── task-edit.api.spec.ts
│   └── ui/
│       ├── TaskEditForm.svelte
│       └── TaskEditForm.spec.ts
├── task-delete/
│   ├── model/
│   │   ├── task-delete.store.ts
│   │   └── task-delete.store.spec.ts
│   ├── api/
│   │   ├── task-delete.api.ts
│   │   └── task-delete.api.spec.ts
│   └── ui/
│       ├── TaskDeleteButton.svelte
│       └── TaskDeleteButton.spec.ts
├── task-filter/
│   ├── model/
│   │   ├── task-filter.store.ts
│   │   ├── task-filter.store.spec.ts
│   │   └── task-filter.schema.ts
│   ├── api/
│   │   ├── task-filter.api.ts
│   │   └── task-filter.api.spec.ts
│   └── ui/
│       ├── TaskFilterPanel.svelte
│       └── TaskFilterPanel.spec.ts
├── task-prioritize/
│   ├── model/
│   │   ├── priority-calculator.ts
│   │   └── priority-calculator.spec.ts
│   ├── api/
│   │   ├── task-prioritize.api.ts
│   │   └── task-prioritize.api.spec.ts
│   └── ui/
│       ├── PriorityBadge.svelte
│       └── PriorityBadge.spec.ts
├── auth-google/
│   ├── model/
│   │   ├── google-auth.store.ts
│   │   └── google-auth.store.spec.ts
│   ├── api/
│   │   ├── google-auth.api.ts
│   │   └── google-auth.api.spec.ts
│   └── ui/
│       ├── GoogleLoginButton.svelte
│       └── GoogleLoginButton.spec.ts
├── export-import/
│   ├── model/
│   │   ├── export-import.store.ts
│   │   └── export-import.store.spec.ts
│   ├── api/
│   │   ├── export-import.api.ts
│   │   └── export-import.api.spec.ts
│   └── ui/
│       ├── ExportButton.svelte
│       ├── ExportButton.spec.ts
│       ├── ImportButton.svelte
│       └── ImportButton.spec.ts
└── offline-sync/
    ├── model/
    │   ├── sync-queue.store.ts
    │   └── sync-queue.store.spec.ts
    ├── api/
    │   ├── offline-sync.api.ts
    │   └── offline-sync.api.spec.ts
    └── ui/
        ├── OfflineIndicator.svelte
        └── OfflineIndicator.spec.ts
```







### 4. Entities Layer

Domain entities and their business logic, shared across features.

#### Structure
```
src/entities/
├── task/
│   ├── model/
│   │   ├── task.ts               # Task entity interface
│   │   ├── task.factory.ts      # Task factory functions
│   │   └── task.spec.ts
│   └── lib/
│       ├── task-utils.ts         # Task utilities
│       └── task-utils.spec.ts
├── user/
│   ├── model/
│   │   ├── user.ts               # User entity interface
│   │   ├── user.factory.ts      # User factory functions
│   │   └── user.spec.ts
│   └── lib/
│       ├── user-utils.ts
│       └── user-utils.spec.ts
└── auth/
    ├── model/
    │   ├── session.ts            # Session entity interface
    │   ├── session.factory.ts   # Session factory functions
    │   └── session.spec.ts
    └── lib/
        ├── auth-utils.ts
        └── auth-utils.spec.ts
```



### 5. Shared Layer

Shared utilities, API clients, and UI components that are generic and reusable across the application.

#### Structure
```
src/shared/
├── api/
│   ├── client.ts                 # Shared API client
│   ├── client.spec.ts
│   └── interceptors.ts           # Request/response interceptors
├── config/
│   ├── config.ts                 # Application configuration
│   └── config.spec.ts
├── lib/
│   ├── validation/
│   │   ├── schema-builder.ts     # Validation schema utilities
│   │   └── schema-builder.spec.ts
│   ├── time/
│   │   ├── time-helpers.ts       # Time helper functions
│   │   └── time-helpers.spec.ts
│   ├── response/
│   │   ├── response-helpers.ts   # Response helper functions
│   │   └── response-helpers.spec.ts
│   └── string/
│       ├── string-helpers.ts
│       └── string-helpers.spec.ts
├── ui/
│   ├── button/
│   │   ├── Button.svelte         # Shared UI components
│   │   └── Button.spec.ts
│   ├── input/
│   │   ├── Input.svelte
│   │   └── Input.spec.ts
│   ├── select/
│   │   ├── Select.svelte
│   │   └── Select.spec.ts
│   └── modal/
│       ├── Modal.svelte
│       └── Modal.spec.ts
├── segments/
│   ├── ui/                       # UI segments (header, footer, etc.)
│   │   ├── Header.svelte
│   │   └── Footer.svelte
│   └── layout/                   # Layout components
│       └── MainLayout.svelte
└── types/
    └── index.ts                   # Shared TypeScript types
```



### 6. Widgets Layer

Reusable UI components that can be used across multiple features, following vertical slice pattern with their own logic.

#### Structure
```
src/widgets/
├── task-card/
│   ├── ui/
│   │   ├── TaskCard.svelte
│   │   └── TaskCard.spec.ts
│   └── index.ts
├── task-list/
│   ├── ui/
│   │   ├── TaskList.svelte
│   │   └── TaskList.spec.ts
│   └── index.ts
├── priority-badge/
│   ├── ui/
│   │   ├── PriorityBadge.svelte
│   │   └── PriorityBadge.spec.ts
│   └── index.ts
└── offline-indicator/
    ├── ui/
    │   ├── OfflineIndicator.svelte
    │   └── OfflineIndicator.spec.ts
    └── index.ts
```



## Vertical Slice Pattern Integration

Vertical slices are applied within the FSD layers to ensure feature-focused organization:

### Feature Vertical Slice
```
task-create/
├── model/              # State management and business logic
│   ├── task-create.store.ts
│   ├── task-create.store.spec.ts
│   └── task-create.schema.ts
├── api/                # API integration
│   ├── task-create.api.ts
│   └── task-create.api.spec.ts
└── ui/                 # UI components
    ├── TaskCreateForm.svelte
    └── TaskCreateForm.spec.ts
```

### Page Vertical Slice
```
tasks/list/
├── ui/                 # Page UI components
│   └── TaskListPage.svelte
├── model/              # Page-specific logic
│   └── task-list-page.model.ts
└── index.ts            # Public API
```

### Widget Vertical Slice
```
task-card/
├── ui/                 # Widget UI components
│   ├── TaskCard.svelte
│   └── TaskCard.spec.ts
└── index.ts            # Public API
```

### Benefits
- **Feature-focused development**: All related code for a feature is co-located
- **Easy to locate related code**: Developers can find all code for a feature in one place
- **Independent feature testing**: Each feature can be tested in isolation
- **Clear separation of concerns**: FSD layers provide boundaries while vertical slices provide organization
- **Easy to add/remove features**: Features can be added or removed without affecting other parts of the application
- **Better code reusability**: Shared and entities layers provide reusable components and logic

## Component Interactions

### Frontend Request Flow

The frontend follows a layered request flow:

```
User Action → Component → Store → API Client → HTTP Request → Response Parser → State Update
                    ↓           ↓           ↓              ↓                 ↓
                 Validation  State Mgmt  Standard Format  Error Handling   UI Update
```

#### Layer Responsibilities

1. **Component Layer**
   - User interaction handling
   - UI rendering and updates
   - Event emission and handling
   - Form validation display

2. **Store Layer**
   - State management
   - Business logic implementation
   - State persistence (localStorage)
   - Reactivity management

3. **API Client Layer**
   - HTTP request construction
   - Authentication token management
   - Request/response interception
   - Error handling and retry logic

4. **HTTP Request Layer**
   - Network communication
   - Request/response handling
   - Timeout management
   - Retry logic for failed requests

5. **Response Parser Layer**
   - Standard response format parsing
   - Error extraction and handling
   - Data extraction and typing
   - Meta information processing

6. **State Update Layer**
   - Store state updates
   - Reactivity triggers
   - Component re-rendering
   - UI updates

### Offline Data Flow

The frontend supports offline operations with a dedicated data flow:

```
User Action → Component → IndexedDB → Optimistic UI → Sync Queue → Background Sync
                    ↓           ↓             ↓              ↓               ↓
                 Validation  Local Store   UI Update     Queue Mgmt     Network Monitor
```

#### Layer Responsibilities

1. **Component Layer**
   - User interaction handling
   - Offline status display
   - Form validation
   - Optimistic UI updates

2. **IndexedDB Layer**
   - Local data storage
   - Data retrieval and querying
   - Transaction management
   - Schema versioning

3. **Optimistic UI Layer**
   - Immediate UI updates
   - Error rollback on failure
   - Loading states management
   - Success/error feedback

4. **Sync Queue Layer**
   - Operation queuing
   - Queue ordering (FIFO)
   - Retry logic with backoff
   - Conflict detection

5. **Background Sync Layer**
   - Network status monitoring
   - Queue processing triggers
   - Batch operation optimization
   - Error handling and recovery

### Data Flow Examples

#### Task Creation Flow (Online)
```
User → Frontend → API Client → Backend API → PostgreSQL → Redis
                              ↓                              ↓
                         Priority Calc                   Cache
```

1. **User Action**: User fills task creation form
2. **Frontend Validation**: Frontend validates form using Zod schema
3. **API Request**: Frontend sends POST `/api/v1/tasks` with task data
4. **Backend Processing**: Backend validates, calculates priority, stores in database
5. **Cache Update**: Backend caches task in Redis
6. **Response**: Backend returns standardized response
7. **UI Update**: Frontend updates UI with new task

#### Task Creation Flow (Offline)
```
User → Frontend → IndexedDB → Sync Queue → API (when online)
```

1. **User Action**: User fills task creation form
2. **Frontend Validation**: Frontend validates form using Zod schema
3. **Local Storage**: Frontend stores task in IndexedDB
4. **Sync Queue**: Frontend adds task to sync queue
5. **UI Update**: Frontend updates UI with new task (optimistic)
6. **Network Monitor**: Service Worker monitors network status
7. **Online Detection**: When connection restored, sync triggers
8. **Queue Processing**: Frontend processes sync queue
9. **API Sync**: Frontend sends queued tasks to API
10. **ID Update**: Backend returns server IDs, frontend updates local data

## Best Practices

1. **Feature First**: Organize by feature, not by type
2. **Shared Abstraction**: Use shared layer for common utilities
3. **Type Safety**: Use TypeScript strict mode
4. **Component Reusability**: Use widgets for reusable components
5. **State Management**: Use Svelte stores for feature state
6. **API Layer**: Centralize API calls in feature/api
7. **Validation**: Use Zod for runtime validation
8. **Testing**: Test each layer independently
