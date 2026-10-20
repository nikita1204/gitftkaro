/**
 * Automated Test Suite for GIFT KRO Delivery Eligibility & Estimation Module
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('================================================================');
  console.log('   GIFT KRO DELIVERY ELIGIBILITY & ESTIMATED DELIVERY TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      if (details) console.error(`         Details: ${JSON.stringify(details)}`);
      failed++;
    }
  };

  try {
    // 1. Test Serviceable PIN Codes List
    console.log('1. Checking Seeded Serviceable PIN Codes...');
    const pincodesRes = await fetch(`${BASE_URL}/delivery/pincodes`);
    const pincodesJson = await pincodesRes.json();
    assert(pincodesJson.success === true, 'GET /delivery/pincodes succeeds');
    assert(pincodesJson.data.length >= 15, `Seeded at least 15 Raipur PIN codes (found: ${pincodesJson.data.length})`);
    const has492001 = pincodesJson.data.some((p) => p.pincode === '492001');
    assert(has492001, '492001 (Telibandha/Pandri/Shankar Nagar) is present and active');

    // 2. Test Eligible Raipur Address (24-Hour Express)
    console.log('\n2. Testing Eligible Raipur Address (492001, 25 pcs, artwork present)...');
    const eligibleRes = await fetch(`${BASE_URL}/delivery/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pincode: '492001',
        totalQuantity: 25,
        hasArtwork: true,
      }),
    });
    const eligibleData = (await eligibleRes.json()).data;
    assert(eligibleData.is24hEligible === true, 'Order is eligible for 24-hour express delivery');
    assert(eligibleData.status === 'eligible_24h_express', 'Status code is eligible_24h_express');
    assert(eligibleData.deliveryHours === 24, 'Delivery hours is exactly 24');
    assert(eligibleData.estimatedDeliveryWindow.includes('24 Hours'), 'Window contains "24 Hours"');
    assert(Boolean(eligibleData.estimatedDeliveryDate), 'Returns precise estimated delivery timestamp');

    // 3. Test Ineligible Address Outside Raipur Express Boundary
    console.log('\n3. Testing Ineligible Outer Address (491001 Durg/Bhilai)...');
    const ineligibleRes = await fetch(`${BASE_URL}/delivery/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pincode: '491001',
        totalQuantity: 25,
        hasArtwork: true,
      }),
    });
    const ineligibleData = (await ineligibleRes.json()).data;
    assert(ineligibleData.is24hEligible === false, 'Non-Raipur PIN code is not eligible for 24h express');
    assert(ineligibleData.status === 'out_of_express_zone', 'Status is out_of_express_zone');
    assert(ineligibleData.estimatedDeliveryWindow.includes('3–5 Business Days'), 'Falls back to standard courier transit');
    assert(ineligibleData.reason.includes('outside GIFT KRO'), 'Provides clear explanation of express boundary');

    // 4. Test Production Capacity Exceeded (> 100 pieces)
    console.log('\n4. Testing High-Volume Capacity Constraint (150 pcs in Raipur 492006)...');
    const capacityRes = await fetch(`${BASE_URL}/delivery/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pincode: '492006',
        totalQuantity: 150,
        hasArtwork: true,
      }),
    });
    const capacityData = (await capacityRes.json()).data;
    assert(capacityData.is24hEligible === false, 'Orders > 100 pcs cannot receive 24h express guarantee');
    assert(capacityData.status === 'capacity_exceeded', 'Status is capacity_exceeded');
    assert(capacityData.deliveryHours === 48, 'Batch turnaround assigned to 48 hours');
    assert(capacityData.explanation.includes('multi-stage printing, drying, curing'), 'Explains drying/curing physics for bulk');

    // 5. Test Minimum Order Quantity Constraint (< 10 pieces)
    console.log('\n5. Testing MOQ Constraint (4 pcs in Raipur 492001)...');
    const moqRes = await fetch(`${BASE_URL}/delivery/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pincode: '492001',
        totalQuantity: 4,
        hasArtwork: true,
      }),
    });
    const moqData = (await moqRes.json()).data;
    assert(moqData.is24hEligible === false, 'Under-MOQ order is ineligible for 24h express');
    assert(moqData.status === 'below_moq', 'Status is below_moq');
    assert(moqData.reason.includes('Minimum order quantity for custom t-shirts is 10'), 'Explains 10-piece MOQ constraint');

    // 6. Test Artwork Approval Condition (hasArtwork: false)
    console.log('\n6. Testing Artwork Approval Condition (hasArtwork: false)...');
    const artworkRes = await fetch(`${BASE_URL}/delivery/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pincode: '492001',
        totalQuantity: 25,
        hasArtwork: false,
      }),
    });
    const artworkData = (await artworkRes.json()).data;
    assert(artworkData.conditions && artworkData.conditions.length > 0, 'Conditions array populated');
    const hasArtworkCondition = artworkData.conditions.some((c) =>
      c.includes('turnaround begins once artwork or proof is confirmed')
    );
    assert(hasArtworkCondition, 'Explicitly clarifies 24h clock commences upon proof approval');

    // 7. Test Cut-Off Time Logic
    console.log('\n7. Testing Order Cut-Off Time Calculation...');
    // Simulated order placed at 16:30 with cut-off 14:00
    const cutoffOrderDate = new Date('2026-10-18T16:30:00+05:30');
    // We can simulate via orderPlacedAt param
    const cutoffCheckRes = await fetch(`${BASE_URL}/delivery/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pincode: '492001',
        totalQuantity: 20,
        hasArtwork: true,
        orderPlacedAt: cutoffOrderDate.toISOString(),
      }),
    });
    const cutoffData = (await cutoffCheckRes.json()).data;
    assert(cutoffData.is24hEligible === true, 'Order is eligible (rolling turnaround by default)');

    // 8. Test Invalid PIN Code Format
    console.log('\n8. Testing Invalid PIN Code Input Handling...');
    const invalidRes = await fetch(`${BASE_URL}/delivery/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pincode: '00000',
        totalQuantity: 10,
      }),
    });
    assert(invalidRes.status === 422 || invalidRes.status === 400, 'Zod validator rejects malformed PIN codes with 422');

    // 9. Verify End-to-End Cart Checkout Preparation with Dynamic Delivery
    console.log('\n9. Testing Checkout Preparation with Dynamic Delivery Integration...');
    // Create cart item
    const productsRes = await fetch(`${BASE_URL}/products?limit=1`);
    const productsJson = await productsRes.json();
    const testProduct = Array.isArray(productsJson.data) ? productsJson.data[0] : productsJson.data.products[0];

    const guestCartRes = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: testProduct._id,
        selectedColor: testProduct.availableColors[0],
        sizeBreakdown: [{ size: 'M', quantity: 25 }],
        printLocations: ['front_chest'],
        artworks: [{
          filename: 'test-logo.png',
          originalName: 'CompanyLogo.png',
          mimetype: 'image/png',
          size: 154200,
          url: 'http://localhost:5000/uploads/test-logo.png',
        }],
      }),
    });

    const cookie = guestCartRes.headers.get('set-cookie');
    const guestCartJson = await guestCartRes.json();
    assert(guestCartJson.success === true, 'Cart item added with verified pricing');

    // Test checkout preparation with Raipur address 492001
    const checkoutPrepRes = await fetch(`${BASE_URL}/cart/checkout-prep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie || '',
      },
      body: JSON.stringify({
        contact: {
          name: 'Nikhil Agrawal',
          email: 'nikhil@example.com',
          phone: '9876543210',
          organization: 'Raipur Express Club',
        },
        shippingAddress: {
          streetAddress: 'Plot 42, Civil Lines Road',
          areaLocality: 'Telibandha',
          city: 'Raipur',
          state: 'Chhattisgarh',
          pincode: '492001',
          deliveryNotes: 'Deliver to main office reception',
        },
      }),
    });

    const checkoutPrepJson = await checkoutPrepRes.json();
    assert(checkoutPrepJson.success === true, 'Checkout preparation succeeds');
    const deliveryEst = checkoutPrepJson.data.deliveryEstimate;
    assert(deliveryEst.is24hEligible === true, 'Checkout delivery estimate verifies 24-hour express');
    assert(deliveryEst.status === 'eligible_24h_express', 'Status is eligible_24h_express');
    assert(deliveryEst.hub.includes('Raipur'), 'Hub identifies Raipur Express Printing Facility');

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
