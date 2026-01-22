#!/bin/bash
# SliceFix AI - Comprehensive Test Script
# Run this after installing the preview build

echo "================================================"
echo "  SliceFix AI - Test Script"
echo "================================================"

# Configuration
SUPABASE_URL="https://xzuadnexwldcdoluuqjv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dWFkbmV4d2xkY2RvbHV1cWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NjU4MDYsImV4cCI6MjA4MzI0MTgwNn0.oK058-Y8bVCrN5RqqLYZoxsM4-G357qLKIom3blqHb8"
DEMO_EMAIL="appstore-review@cienrios.com"
DEMO_PASSWORD="SliceFix2026!Review"

echo ""
echo "1. Testing Supabase Connection..."
echo "--------------------------------"

# Test Supabase health
HEALTH_RESPONSE=$(curl -s "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Supabase connection: OK"
else
  echo "❌ Supabase connection: FAILED (HTTP $HTTP_CODE)"
fi

echo ""
echo "2. Testing Demo Account Login..."
echo "--------------------------------"

# Test demo account login
LOGIN_RESPONSE=$(curl -s "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${DEMO_EMAIL}\",\"password\":\"${DEMO_PASSWORD}\"}" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$LOGIN_RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Demo login: OK"
  ACCESS_TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "   User ID: $USER_ID"
else
  echo "❌ Demo login: FAILED (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
fi

echo ""
echo "3. Testing Demo User Profile..."
echo "-------------------------------"

if [ -n "$ACCESS_TOKEN" ]; then
  PROFILE_RESPONSE=$(curl -s "${SUPABASE_URL}/rest/v1/profiles?id=eq.${USER_ID}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -w "\nHTTP_CODE:%{http_code}")

  HTTP_CODE=$(echo "$PROFILE_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Profile fetch: OK"
  else
    echo "❌ Profile fetch: FAILED (HTTP $HTTP_CODE)"
  fi
else
  echo "⏭️  Profile fetch: SKIPPED (no access token)"
fi

echo ""
echo "4. Testing Edge Functions..."
echo "----------------------------"

# Test analyze-swing function (requires auth)
if [ -n "$ACCESS_TOKEN" ]; then
  FUNCTION_RESPONSE=$(curl -s "${SUPABASE_URL}/functions/v1/analyze-swing" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"test": true}' \
    -w "\nHTTP_CODE:%{http_code}" 2>/dev/null)

  HTTP_CODE=$(echo "$FUNCTION_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "✅ analyze-swing function: REACHABLE"
  else
    echo "⚠️  analyze-swing function: HTTP $HTTP_CODE (may require video input)"
  fi
else
  echo "⏭️  Edge functions: SKIPPED (no access token)"
fi

echo ""
echo "================================================"
echo "  Manual Test Checklist"
echo "================================================"
echo ""
echo "After installing the app, verify:"
echo ""
echo "□ 1. App launches without crashing"
echo "□ 2. Onboarding screens display correctly"
echo "□ 3. Sign in with demo account works:"
echo "      Email: $DEMO_EMAIL"
echo "      Password: $DEMO_PASSWORD"
echo "□ 4. Home screen shows 'Annual' subscription"
echo "□ 5. Can upload video from camera roll"
echo "□ 6. Can record video with camera"
echo "□ 7. Video analysis returns results"
echo "□ 8. Settings screen accessible"
echo "□ 9. Profile editing works"
echo "□ 10. Sign out works"
echo ""
echo "================================================"
echo "  Demo Account Credentials (for App Store)"
echo "================================================"
echo ""
echo "Email:    $DEMO_EMAIL"
echo "Password: $DEMO_PASSWORD"
echo ""
