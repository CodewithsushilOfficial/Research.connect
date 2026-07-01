# Research Connect — Development Guide

This guide is designed for developers who wish to add new modules, schemas, or routes to **Research Connect**.

---

## 🏗️ Adding a New Feature Module (Backend)

All backend features must reside inside `backend/src/modules/<feature_name>`. 

Follow this step-by-step workflow to scaffold a new feature:

### Step 1: Create Folder Structure
```text
backend/src/modules/my-feature/
├── controller/
│   └── my-feature.controller.js
├── service/
│   └── my-feature.service.js
├── repository/
│   └── my-feature.repository.js
├── routes/
│   └── my-feature.routes.js
├── validator/
│   └── my-feature.validator.js
├── index.js
└── README.md
```

### Step 2: Implement Repository
Inherit from `BaseRepository` and pass the specific Mongoose model to the constructor:
```javascript
const BaseRepository = require('../../common/repository/base.repository');
const MyModel = require('../../models/MyModel');

class MyRepository extends BaseRepository {
  constructor() {
    super(MyModel);
  }
}

module.exports = new MyRepository();
```

### Step 3: Implement Service
Inherit from `BaseService` and inject the repository:
```javascript
const { BaseService } = require('../../common/service');
const myRepository = require('../repository/my-feature.repository');

class MyService extends BaseService {
  constructor() {
    super(myRepository);
  }
}

module.exports = new MyService();
```

### Step 4: Implement Controller
Call the service methods and format outputs with `ApiResponse`:
```javascript
const myService = require('../service/my-feature.service');
const ApiResponse = require('../../common/responses/ApiResponse');
const asyncHandler = require('../../common/middlewares/asyncHandler.middleware');

exports.getMyData = asyncHandler(async (req, res) => {
  const result = await myService.find(req.query);
  return ApiResponse.success(res, 'Data fetched successfully', result);
});
```

### Step 5: Configure Routes
Map endpoints to controller functions:
```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controller/my-feature.controller');

router.get('/', controller.getMyData);

module.exports = router;
```

---

## 🎨 Implementing a New View (Frontend)

To create a new view or panel:
1. Register the route path inside `frontend/src/routes/AppRoutes.jsx` mapping to your component.
2. Put the view page in `frontend/src/modules/<module_name>/pages/<ViewName>Page.jsx`.
3. Wrap your page or group of pages using the layout components:
   - Public pages: Wrap inside `<LandingLayout />`.
   - Admin/User account pages: Wrap inside `<DashboardLayout />`.
4. Fetch dynamic data using React Query hooks, and call requests using the global Axios helper:
   ```javascript
   import axiosInstance from '@/api/axiosInstance';
   // API call will automatically capture error states and display toasts
   const data = await axiosInstance.get('/my-feature');
   ```

---

## 🔒 Securing Endpoints & Routes (Phase 1)

### Backend Endpoint Protection
To protect backend endpoints, import `authMiddleware` and apply it to your express routes. You can optionally restrict access to specific roles using `hasRole`:

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controller/my-feature.controller');
const { authMiddleware, hasRole } = require('../../../common/middlewares/auth.middleware');

// Requires authenticated user
router.get('/my-data', authMiddleware, controller.getMyData);

// Requires administrative role
router.post('/admin-action', authMiddleware, hasRole('admin'), controller.triggerAdminAction);

module.exports = router;
```

### Frontend Page Protection
To protect views and pages in the React SPA:
- **Private Pages**: Wrap the Route element in `ProtectedRoute` (redirects unauthenticated users to `/login`).
- **Public Auth Pages**: Wrap in `PublicRoute` (prevents logged-in researchers from entering register/login flows).

```jsx
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import MyView from '../modules/my-view';

// Inside AppRoutes.jsx
<Route path="my-protected-view" element={
  <ProtectedRoute>
    <MyView />
  </ProtectedRoute>
} />
```
