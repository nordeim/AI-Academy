# Step 3: Enrollment Business Logic - TDD Sub-Plan

**Issue:** #3 Enrollment Permission & Business Logic  
**Priority:** P0 - Critical  
**Methodology:** Test-Driven Development (TDD)  
**Estimated Time:** 2-3 hours  
**Started:** March 20, 2026

---

## Phase 1: Analysis & Planning

### Problem Definition
The EnrollmentViewSet currently lacks critical business logic:

**Current Implementation (Problematic):**
```python
class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)  # ⚠️ No validation!
```

**Issues:**
1. ❌ No capacity checking - can over-enroll cohorts
2. ❌ No duplicate enrollment prevention
3. ❌ No payment validation
4. ❌ No status workflow management
5. ❌ spots_reserved not incremented
6. ❌ No enrollment confirmation logic

### Business Rules

#### Rule 1: Capacity Validation
- Cohort has `spots_total` (max capacity)
- Cohort has `spots_reserved` (current enrollments)
- Enrollment only allowed if `spots_remaining > 0`
- `spots_remaining = spots_total - spots_reserved`

#### Rule 2: Duplicate Prevention
- User can only enroll once per cohort
- Database has `unique_together = ['user', 'cohort']`
- API should check before attempting create

#### Rule 3: Status Workflow
```
pending → confirmed (after payment)
pending → cancelled (by user)
confirmed → cancelled (by user/admin)
confirmed → completed (after course ends)
cancelled → (terminal state, no transitions)
```

#### Rule 4: Spot Reservation
- When enrollment created: `spots_reserved += 1`
- When enrollment cancelled: `spots_reserved -= 1`
- Must be atomic (transaction)

#### Rule 5: Payment Integration (Placeholder)
- Enrollment starts as 'pending'
- Stripe payment intent ID stored
- Upon payment confirmation → 'confirmed'

### API Endpoints Affected
- `POST /api/v1/enrollments/` - Create enrollment
- `POST /api/v1/enrollments/{id}/cancel/` - Cancel enrollment
- `GET /api/v1/enrollments/` - List user enrollments

---

## Phase 2: TDD Implementation - RED Phase

### Test 1: Enrollment Capacity Validation
**Test:** Prevent enrollment when cohort is full

```python
def test_enrollment_fails_when_cohort_full(self):
    """
    Test: Cannot enroll when cohort has no spots remaining
    Expected: 400 Bad Request with error message
    """
    # Create full cohort
    cohort = Cohort.objects.create(
        course=self.course,
        spots_total=1,
        spots_reserved=1,  # Full
        start_date=timezone.now().date() + timedelta(days=30),
        end_date=timezone.now().date() + timedelta(days=60),
        status='enrolling'
    )
    
    # Attempt enrollment
    response = self.client.post('/api/v1/enrollments/', {
        'course': str(self.course.id),
        'cohort': str(cohort.id),
        'amount_paid': '100.00'
    })
    
    self.assertEqual(response.status_code, 400)
    self.assertIn('cohort', response.data)
    self.assertIn('full', str(response.data).lower())
```

### Test 2: Duplicate Enrollment Prevention
**Test:** Prevent duplicate enrollments

```python
def test_enrollment_fails_when_already_enrolled(self):
    """
    Test: Cannot enroll twice in same cohort
    Expected: 400 Bad Request
    """
    # Create first enrollment
    Enrollment.objects.create(
        user=self.user,
        course=self.course,
        cohort=self.cohort,
        amount_paid=100.00,
        status='confirmed'
    )
    
    # Attempt duplicate
    response = self.client.post('/api/v1/enrollments/', {
        'course': str(self.course.id),
        'cohort': str(self.cohort.id),
        'amount_paid': '100.00'
    })
    
    self.assertEqual(response.status_code, 400)
    self.assertIn('already enrolled', str(response.data).lower())
```

### Test 3: Successful Enrollment Increments Spots
**Test:** Verify spots_reserved increments

```python
def test_enrollment_increments_spots_reserved(self):
    """
    Test: Creating enrollment increments cohort.spots_reserved
    Expected: spots_reserved increases by 1
    """
    initial_spots = self.cohort.spots_reserved
    
    response = self.client.post('/api/v1/enrollments/', {
        'course': str(self.course.id),
        'cohort': str(self.cohort.id),
        'amount_paid': '100.00'
    })
    
    self.assertEqual(response.status_code, 201)
    
    # Refresh cohort from DB
    self.cohort.refresh_from_db()
    self.assertEqual(self.cohort.spots_reserved, initial_spots + 1)
```

### Test 4: Cancel Enrollment Decrements Spots
**Test:** Verify spots_reserved decrements on cancel

```python
def test_cancel_enrollment_decrements_spots_reserved(self):
    """
    Test: Cancelling enrollment decrements cohort.spots_reserved
    Expected: spots_reserved decreases by 1
    """
    # Create enrollment
    enrollment = Enrollment.objects.create(
        user=self.user,
        course=self.course,
        cohort=self.cohort,
        amount_paid=100.00,
        status='confirmed'
    )
    self.cohort.spots_reserved = 1
    self.cohort.save()
    
    response = self.client.post(f'/api/v1/enrollments/{enrollment.id}/cancel/')
    
    self.assertEqual(response.status_code, 200)
    
    # Refresh cohort
    self.cohort.refresh_from_db()
    self.assertEqual(self.cohort.spots_reserved, 0)
```

### Test 5: Enrollment Status Workflow
**Test:** Verify initial status is 'pending'

```python
def test_enrollment_starts_as_pending(self):
    """
    Test: New enrollment has status 'pending'
    Expected: status='pending'
    """
    response = self.client.post('/api/v1/enrollments/', {
        'course': str(self.course.id),
        'cohort': str(self.cohort.id),
        'amount_paid': '100.00'
    })
    
    self.assertEqual(response.status_code, 201)
    self.assertEqual(response.data['status'], 'pending')
```

### Test 6: Cancel Already Cancelled Enrollment
**Test:** Handle cancelling already cancelled enrollment

```python
def test_cancel_already_cancelled_fails(self):
    """
    Test: Cannot cancel already cancelled enrollment
    Expected: 400 Bad Request
    """
    enrollment = Enrollment.objects.create(
        user=self.user,
        course=self.course,
        cohort=self.cohort,
        amount_paid=100.00,
        status='cancelled'
    )
    
    response = self.client.post(f'/api/v1/enrollments/{enrollment.id}/cancel/')
    
    self.assertEqual(response.status_code, 400)
```

---

## Phase 3: Implementation Plan

### Step 3.1: Create Custom Validation Error
```python
# api/exceptions.py
from rest_framework.exceptions import APIException

class EnrollmentValidationError(APIException):
    status_code = 400
    default_detail = 'Enrollment validation failed'
    default_code = 'enrollment_validation_error'
```

### Step 3.2: Update EnrollmentSerializer
```python
class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating enrollments with validation"""
    
    class Meta:
        model = Enrollment
        fields = ['course', 'cohort', 'amount_paid']
    
    def validate_cohort(self, cohort):
        """Validate cohort has available spots"""
        if cohort.spots_remaining <= 0:
            raise serializers.ValidationError(
                "This cohort is full. Please join the waitlist."
            )
        return cohort
    
    def validate(self, data):
        """Validate user not already enrolled"""
        user = self.context['request'].user
        cohort = data['cohort']
        
        if Enrollment.objects.filter(user=user, cohort=cohort).exists():
            raise serializers.ValidationError(
                "You are already enrolled in this cohort."
            )
        
        return data
```

### Step 3.3: Update EnrollmentViewSet
```python
class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EnrollmentCreateSerializer
        return EnrollmentSerializer
    
    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)
    
    @transaction.atomic
    def perform_create(self, serializer):
        """Create enrollment with spot reservation"""
        cohort = serializer.validated_data['cohort']
        
        # Increment spots_reserved
        cohort.spots_reserved += 1
        cohort.save()
        
        # Create enrollment with pending status
        serializer.save(
            user=self.request.user,
            status='pending'
        )
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def cancel(self, request, pk=None):
        """Cancel enrollment and release spot"""
        enrollment = self.get_object()
        
        if enrollment.status == 'cancelled':
            return Response(
                {'error': 'Enrollment is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if enrollment.status not in ['pending', 'confirmed']:
            return Response(
                {'error': f'Cannot cancel enrollment with status: {enrollment.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Release spot
        cohort = enrollment.cohort
        cohort.spots_reserved = max(0, cohort.spots_reserved - 1)
        cohort.save()
        
        # Update enrollment
        enrollment.status = 'cancelled'
        enrollment.save()
        
        return Response({'status': 'enrollment cancelled'})
```

### Step 3.4: Add Transaction Support
Ensure atomic operations with `@transaction.atomic` decorator.

---

## Phase 4: Test Execution Plan

### Run Tests
```bash
python manage.py test api.tests.test_enrollment -v 2
```

### Expected Results
- All capacity tests should pass
- All duplicate prevention tests should pass
- All spot increment/decrement tests should pass
- All workflow tests should pass

---

## Phase 5: Verification

### Manual Testing
```bash
# Test enrollment
curl -X POST http://localhost:8000/api/v1/enrollments/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course": "<course-id>",
    "cohort": "<cohort-id>",
    "amount_paid": "100.00"
  }'

# Test capacity limit
curl -X POST http://localhost:8000/api/v1/enrollments/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course": "<course-id>",
    "cohort": "<full-cohort-id>",
    "amount_paid": "100.00"
  }'

# Should return 400 with "cohort is full" message
```

---

## Success Criteria

- [ ] Cannot enroll in full cohort (returns 400)
- [ ] Cannot enroll twice in same cohort (returns 400)
- [ ] Successful enrollment increments spots_reserved
- [ ] Cancellation decrements spots_reserved
- [ ] New enrollments start as 'pending'
- [ ] Cannot cancel already cancelled enrollment
- [ ] All operations are atomic (transaction-safe)

---

## Definition of Done

- [ ] TDD cycle complete (RED-GREEN-REFACTOR)
- [ ] All business logic tests pass
- [ ] Manual testing completed
- [ ] Edge cases handled
- [ ] API_Usage_Guide.md updated with enrollment restrictions
- [ ] ACCOMPLISHMENTS.md updated
- [ ] TODO.md marked complete

---

## Current Status

**Phase:** 1 - Analysis & Planning ✅  
**Next Action:** Execute Phase 2 (Create test file)

