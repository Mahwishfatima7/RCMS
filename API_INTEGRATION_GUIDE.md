# API Integration Guide

## ✅ What's Been Done

### Integrated API Calls In:

1. **AgentNewComplaint.tsx** - Create complaints & validate serials
2. **AgentTickets.tsx** - Fetch agent's complaints
3. **AdminComplaints.tsx** - Fetch all complaints & create bookings
4. **AdminBookings.tsx** - Fetch bookings with complaints
5. **ManagementDashboard.tsx** - Fetch analytics data

### API Service Created:

- `src/services/apiService.ts` - Full API client with all endpoints
  - Complaints API
  - Bookings API
  - Serials API
  - Users API
  - Analytics API

## 🚀 How to Use in Components

### Import the API Service

```typescript
import { complaintApi, bookingApi, serialApi } from "@/services/apiService";
```

### Fetch Data

```typescript
const result = await complaintApi.getAll();
if (result.success) {
  setComplaints(result.data.complaints);
}
```

### Handle Errors

```typescript
if (!result.success) {
  toast.error(result.error);
}
```

## 📊 Available API Methods

### Complaints

- `complaintApi.getAll()` - Get all complaints
- `complaintApi.getById(id)` - Get single complaint
- `complaintApi.getByAgent(agentId)` - Get agent's complaints
- `complaintApi.create(data)` - Create complaint
- `complaintApi.updateStatus(id, status)` - Update status
- `complaintApi.update(id, data)` - Update complaint
- `complaintApi.delete(id)` - Delete complaint

### Bookings

- `bookingApi.getAll()` - Get all bookings
- `bookingApi.getByComplaintId(id)` - Get booking by complaint
- `bookingApi.create(data)` - Create booking
- `bookingApi.update(id, data)` - Update booking
- `bookingApi.delete(id)` - Delete booking

### Serials

- `serialApi.validate(serialNo)` - Validate serial number
- `serialApi.getAll()` - Get all serials
- `serialApi.getByNo(serialNo)` - Get serial by number
- `serialApi.create(data)` - Add serial

### Users

- `userApi.getAll()` - Get all users
- `userApi.getById(id)` - Get user by ID
- `userApi.update(id, data)` - Update user
- `userApi.delete(id)` - Delete user

### Analytics

- `analyticsApi.getDashboard()` - Get dashboard data
- `analyticsApi.getReports()` - Get reports

## 🔄 Backend Response Format

All endpoints return:

```json
{
  "success": true,
  "data": {
    "complaints": [...],
    "total": 100
  }
}
```

On error:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🛠️ Common Patterns in Updated Components

### Loading State

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const result = await complaintApi.getAll();
      if (result.success) {
        setComplaints(result.data.complaints);
      }
    } finally {
      setLoading(false);
    }
  })();
}, []);
```

### Mutation with Toast

```typescript
const result = await complaintApi.create(data);
if (result.success) {
  toast.success("Created successfully!");
  navigate("/path");
} else {
  toast.error(result.error);
}
```

## 📝 Field Mapping

Backend uses snake_case, some important mappings:

- `ticket_no` → Ticket Number
- `customer_name` → Customer Name
- `serial_no` → Serial Number
- `warranty_valid` → Warranty Valid
- `permission_status` → Permission Status
- `manufacturer_status` → Manufacturer Status
- `created_at` → Created At
- `updated_at` → Updated At

## ✨ Next Steps

1. Test API integration with running backend
2. Update remaining pages that still use mock data
3. Add error boundaries for failed API calls
4. Implement pagination if needed
5. Add cache/refresh patterns using React Query or similar

## 🐛 Troubleshooting

If API calls fail:

1. Ensure backend is running on `http://localhost:5000`
2. Check browser console for error details
3. Verify CORS is properly configured
4. Check token is being sent in Authorization header
5. Validate request/response format matches backend expectations
