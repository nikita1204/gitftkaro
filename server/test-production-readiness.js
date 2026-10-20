import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5000/api';
const API_V1 = `${API_BASE}/v1`;

const logPass = (title) => console.log(`\x1b[32m✔ [PASS]\x1b[0m ${title}`);
const logFail = (title, err) => {
  console.error(`\x1b[31m✖ [FAIL]\x1b[0m ${title}`);
  if (err?.response?.data) {
    console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
  } else if (err?.message) {
    console.error('Error Message:', err.message);
  }
};

async function runProductionReadinessSuite() {
  console.log('\n===================================================================');
  console.log('  GIFT KRO PHASE 1: COMPREHENSIVE PRODUCTION-READINESS AUDIT SUITE ');
  console.log('===================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      logPass(name);
      passedTests++;
    } catch (err) {
      logFail(name, err);
      failedTests++;
    }
  };

  // 1. Health & Resilience
  await test('1. Health Endpoint Reports Application & Database Separately', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (res.data.status !== 'ok' && res.data.statusCode !== 200) {
      throw new Error(`Expected health ok, got: ${JSON.stringify(res.data)}`);
    }
    const data = res.data.data;
    if (data.application.status !== 'healthy') {
      throw new Error(`Application status is not healthy: ${data.application.status}`);
    }
    if (data.database.status !== 'connected' || !data.database.host) {
      throw new Error(`Database is not connected: ${data.database.status}`);
    }
  });

  // 2. Security Headers & Express Fingerprinting
  await test('2. Helmet Security Headers & Disabled X-Powered-By', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (res.headers['x-powered-by']) {
      throw new Error('x-powered-by header is exposed; should be disabled');
    }
    if (!res.headers['x-content-type-options']) {
      throw new Error('Missing Helmet security header x-content-type-options');
    }
  });

  // 3. Authentication & RBAC Authorization
  let customerToken = null;
  let customerUser = null;
  let adminToken = null;
  const customerEmail = `prod_audit_${Date.now()}@giftkro-audit.com`;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@giftkro.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminRaipur2026!';

  await test('3.1. Customer Registration & Token Generation', async () => {
    const res = await axios.post(`${API_V1}/auth/register`, {
      name: 'Priya Verma',
      email: customerEmail,
      password: 'AuditCustomer2026!',
      phone: '9876543299',
    });
    if (res.status !== 201 || !res.data.data.token) {
      throw new Error('Registration failed to return JWT token');
    }
    customerToken = res.data.data.token;
    customerUser = res.data.data.user;
    if (customerUser.role !== 'customer') {
      throw new Error(`Expected customer role, got ${customerUser.role}`);
    }
  });

  await test('3.2. Current User Endpoint (GET /auth/me)', async () => {
    const res = await axios.get(`${API_V1}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const user = res.data.data?.user || res.data.data;
    if (user.email !== customerEmail) {
      throw new Error(`Current user email (${user.email}) does not match expected (${customerEmail})`);
    }
  });

  await test('3.3. Unauthenticated Requests to Privileged Endpoints Rejected (401)', async () => {
    try {
      await axios.get(`${API_V1}/admin/metrics`);
      throw new Error('Expected 401 for unauthenticated request');
    } catch (err) {
      if (err.response?.status !== 401) {
        throw new Error(`Expected 401, got ${err.response?.status}`);
      }
    }
  });

  await test('3.4. Non-Admin (Customer) Blocked from Admin Endpoints (403 Forbidden)', async () => {
    try {
      await axios.get(`${API_V1}/admin/metrics`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      throw new Error('Expected 403 for customer accessing admin metrics');
    } catch (err) {
      if (err.response?.status !== 403) {
        throw new Error(`Expected 403, got ${err.response?.status}`);
      }
    }
  });

  await test('3.5. Administrator Authentication & Authorization (200 OK)', async () => {
    const res = await axios.post(`${API_V1}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    });
    adminToken = res.data.data.token;
    if (res.data.data.user.role !== 'admin') {
      throw new Error(`Expected admin role, got ${res.data.data.user.role}`);
    }

    const metricsRes = await axios.get(`${API_V1}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (metricsRes.status !== 200) {
      throw new Error('Admin authorization failed on /admin/metrics');
    }
  });

  // 4. Product Catalogue & Management
  let targetProduct = null;
  await test('4.1. Product Listing with Category & Pagination Metadata', async () => {
    const res = await axios.get(`${API_V1}/products?limit=8`);
    const products = Array.isArray(res.data.data) ? res.data.data : res.data.data?.products;
    if (!products || products.length === 0) {
      throw new Error('No products returned from product catalogue');
    }
    targetProduct = products[0];
    if (!targetProduct.slug || !targetProduct.basePrice || !targetProduct.availableSizes) {
      throw new Error('Product schema missing required fields');
    }
  });

  await test('4.2. Single Product Details Lookup by Slug', async () => {
    const res = await axios.get(`${API_V1}/products/${targetProduct.slug}`);
    const product = res.data.data?.product || res.data.data;
    if (product.slug !== targetProduct.slug) {
      throw new Error(`Product details lookup returned mismatched product slug: ${product.slug} vs ${targetProduct.slug}`);
    }
  });

  await test('4.3. Admin Toggle Product Active Status', async () => {
    const initialStatus = targetProduct.isActive;
    const res = await axios.patch(
      `${API_V1}/products/${targetProduct._id}/status`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.data.data.isActive === initialStatus) {
      throw new Error('Product active status was not toggled');
    }
    // Toggle back to original status
    await axios.patch(
      `${API_V1}/products/${targetProduct._id}/status`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
  });

  // 5. Customized T-shirt Flow & MOQ Enforcements
  await test('5.1. Cart Rejects Orders Below MOQ (Quantity < 10) with 400/422', async () => {
    try {
      await axios.post(
        `${API_V1}/cart/items`,
        {
          productId: targetProduct._id,
          orderType: 'group',
          selectedColor: targetProduct.availableColors[0],
          sizeBreakdown: [{ size: 'M', quantity: 5 }], // 5 pcs < 10 MOQ
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      throw new Error('Expected 400/422 for order quantity below MOQ');
    } catch (err) {
      if (err.response?.status !== 400 && err.response?.status !== 422) {
        throw new Error(`Expected 400 or 422, got ${err.response?.status}`);
      }
      const errorPayloadStr = JSON.stringify(err.response?.data?.errors || err.response?.data);
      if (!errorPayloadStr.includes('10')) {
        throw new Error(`Expected MOQ error message mentioning 10, got: ${errorPayloadStr}`);
      }
    }
  });

  await test('5.2. Add Customized Configuration (MOQ 15 pcs + Plus Size + Artwork Proof)', async () => {
    const res = await axios.post(
      `${API_V1}/cart/items`,
      {
        productId: targetProduct._id,
        orderType: 'event',
        selectedColor: targetProduct.availableColors[0],
        sizeBreakdown: [
          { size: 'M', quantity: 5 },
          { size: 'L', quantity: 5 },
          { size: '2XL', quantity: 5 }, // Plus-size surcharge test (+₹30/pc)
        ],
        printLocations: ['front_chest', 'full_back'],
        customText: 'ANNUAL TECH FEST 2026',
        printingInstructions: 'Screen print back, DTF chest badge',
        artworks: [
          {
            filename: 'audit_event_crest.png',
            originalName: 'tech_fest_crest.png',
            mimetype: 'image/png',
            size: 204800,
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518',
          },
        ],
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );

    const cart = res.data.data;
    if (cart.summary.totalQuantity !== 15) {
      throw new Error(`Expected 15 garments in cart, got: ${cart.summary.totalQuantity}`);
    }
    // 5 plus-size shirts * ₹30 surcharge = ₹150
    if (cart.summary.sizeSurchargeSubtotal !== 150) {
      throw new Error(`Expected ₹150 plus-size surcharge, got: ₹${cart.summary.sizeSurchargeSubtotal}`);
    }
  });

  // 6. Delivery Eligibility Calculation
  await test('6.1. Delivery Eligibility Calculation for Central Raipur (492001)', async () => {
    const res = await axios.post(`${API_V1}/delivery/check-eligibility`, {
      pincode: '492001',
      totalQuantity: 15,
      hasArtwork: true,
    });
    const est = res.data.data;
    if (!est.isServiceable) {
      throw new Error('Raipur PIN 492001 should be marked as serviceable');
    }
    if (est.status !== 'eligible_24h_express') {
      throw new Error(`Expected eligible_24h_express status, got: ${est.status}`);
    }
  });

  await test('6.2. Ineligible Out-of-Zone Delivery Location (e.g. 110001 New Delhi)', async () => {
    const res = await axios.post(`${API_V1}/delivery/check-eligibility`, {
      pincode: '110001',
      totalQuantity: 15,
      hasArtwork: true,
    });
    const est = res.data.data;
    if (est.is24hEligible === true) {
      throw new Error('New Delhi PIN 110001 should NOT be eligible for 24h express delivery');
    }
    if (est.estimatedDeliveryHours < 48) {
      throw new Error('Out of zone delivery should default to standard transit (>=48h)');
    }
  });

  // 7. Orders & Payment Cryptography
  let testOrder = null;
  await test('7.1. Official Order Creation from Revalidated Cart', async () => {
    const res = await axios.post(
      `${API_V1}/orders`,
      {
        contact: {
          name: 'Priya Verma',
          email: customerEmail,
          phone: '9876543299',
          organization: 'Raipur Engineering College',
        },
        shippingAddress: {
          streetAddress: 'GE Road, Near AIIMS Campus',
          landmark: 'Main Gate',
          areaLocality: 'Tatibandh',
          city: 'Raipur',
          state: 'Chhattisgarh',
          pincode: '492009',
          deliveryNotes: 'Contact security desk upon arrival',
          expressPreference: 'standard_24h',
        },
        idempotencyKey: `audit_key_${Date.now()}`,
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );

    testOrder = res.data.data.order;
    const rzOrder = res.data.data.razorpayOrder || res.data.data.razorpay;

    if (!testOrder.orderNumber.startsWith('GK-ORD-')) {
      throw new Error(`Invalid order number format: ${testOrder.orderNumber}`);
    }
    if (testOrder.orderStatus !== 'pending_payment') {
      throw new Error(`Initial status must be pending_payment, got: ${testOrder.orderStatus}`);
    }
    const rzId = rzOrder?.orderId || rzOrder?.id;
    if (!rzId || !rzId.startsWith('order_')) {
      throw new Error('Razorpay order preparation failed');
    }
  });

  await test('7.2. Reject Tampered Payment Signature with 400 Bad Request', async () => {
    try {
      await axios.post(`${API_V1}/orders/verify-payment`, {
        razorpayOrderId: testOrder.payment.razorpayOrderId,
        razorpayPaymentId: 'pay_tampered_test_id',
        razorpaySignature: 'deadbeef_invalid_hmac_signature',
      });
      throw new Error('Expected 400 for tampered payment signature');
    } catch (err) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400, got: ${err.response?.status}`);
      }
    }
  });

  await test('7.3. Accept Cryptographically Valid HMAC-SHA256 Signature & Confirm Order', async () => {
    const mockPaymentId = `pay_prod_audit_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_giftkro_express_2026';
    const payload = `${testOrder.payment.razorpayOrderId}|${mockPaymentId}`;
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await axios.post(`${API_V1}/orders/verify-payment`, {
      razorpayOrderId: testOrder.payment.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: validSignature,
    });

    testOrder = res.data.data;
    if (testOrder.orderStatus !== 'confirmed') {
      throw new Error(`Expected orderStatus to be confirmed, got: ${testOrder.orderStatus}`);
    }
    if (testOrder.payment.status !== 'captured') {
      throw new Error(`Expected payment.status to be captured, got: ${testOrder.payment.status}`);
    }
  });

  await test('7.4. Payment Verification Idempotency: Safe Redundant Callback', async () => {
    const mockPaymentId = testOrder.payment.razorpayPaymentId;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_giftkro_express_2026';
    const payload = `${testOrder.payment.razorpayOrderId}|${mockPaymentId}`;
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await axios.post(`${API_V1}/orders/verify-payment`, {
      razorpayOrderId: testOrder.payment.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: validSignature,
    });

    if (res.data.data.orderStatus !== 'confirmed') {
      throw new Error('Redundant payment callback altered confirmed order status');
    }
  });

  // 8. Strict Order Status Transition Engine
  await test('8.1. Reject Invalid Status Jump (confirmed -> delivered) with 400', async () => {
    try {
      await axios.patch(
        `${API_V1}/orders/${testOrder._id}/status`,
        { orderStatus: 'delivered', comment: 'Attempting illegal bypass' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      throw new Error('Expected 400 for illegal transition from confirmed to delivered');
    } catch (err) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400 Bad Request, got: ${err.response?.status}`);
      }
    }
  });

  await test('8.2. Valid Production Lifecycle (confirmed -> in_production -> quality_check -> dispatched -> delivered)', async () => {
    const steps = ['in_production', 'quality_check', 'dispatched', 'delivered'];
    for (const step of steps) {
      const res = await axios.patch(
        `${API_V1}/orders/${testOrder._id}/status`,
        { orderStatus: step, comment: `Production stage advance: ${step}` },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      if (res.data.data.orderStatus !== step) {
        throw new Error(`Failed to advance order status to ${step}`);
      }
      testOrder = res.data.data;
    }
  });

  await test('8.3. Terminal Status Integrity: delivered Orders Cannot Be Reopened', async () => {
    try {
      await axios.patch(
        `${API_V1}/orders/${testOrder._id}/status`,
        { orderStatus: 'in_production', comment: 'Illegal reopening' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      throw new Error('Expected 400 for transition on terminal status delivered');
    } catch (err) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400, got: ${err.response?.status}`);
      }
    }
  });

  // 9. Pre-press Artwork Review
  await test('9.1. Artwork Review Workflow (Request Revision & Approve)', async () => {
    const item = testOrder.items[0];
    const artwork = item.artworks[0];

    // Request revision
    let res = await axios.patch(
      `${API_V1}/orders/${testOrder._id}/items/${item._id}/artworks/${artwork._id}`,
      { approvalStatus: 'revision_requested', reviewNotes: 'Please supply vector artwork with minimum 300 DPI' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    let art = res.data.data.items[0].artworks[0];
    if (art.approvalStatus !== 'revision_requested') {
      throw new Error('Artwork status not updated to revision_requested');
    }

    // Approve proof
    res = await axios.patch(
      `${API_V1}/orders/${testOrder._id}/items/${item._id}/artworks/${artwork._id}`,
      { approvalStatus: 'approved', reviewNotes: 'Proof approved by pre-press team' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    art = res.data.data.items[0].artworks[0];
    if (art.approvalStatus !== 'approved') {
      throw new Error('Artwork status not updated to approved');
    }
  });

  // 10. Admin Telemetry & Real Database Metrics
  await test('10.1. Dashboard Metrics Computed Directly from Real Database Data', async () => {
    const res = await axios.get(`${API_V1}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const d = res.data.data;
    if (typeof d.financial.totalRevenue !== 'number' || d.financial.totalRevenue <= 0) {
      throw new Error(`Real revenue must be positive, got: ${d.financial.totalRevenue}`);
    }
    if (typeof d.orders.totalOrders !== 'number' || d.orders.totalOrders <= 0) {
      throw new Error(`Total orders must be positive, got: ${d.orders.totalOrders}`);
    }
    if (typeof d.users.totalCustomers !== 'number' || d.users.totalCustomers <= 0) {
      throw new Error(`Customer count must be positive, got: ${d.users.totalCustomers}`);
    }
    console.log(`\n      [Real DB Telemetry] Total Captured Revenue: ₹${d.financial.totalRevenue.toLocaleString('en-IN')}`);
    console.log(`      [Real DB Telemetry] Total Orders in MongoDB: ${d.orders.totalOrders}`);
    console.log(`      [Real DB Telemetry] Active Catalog Products: ${d.catalogue.activeProducts}`);
    console.log(`      [Real DB Telemetry] Registered Customers:    ${d.users.totalCustomers}\n`);
  });

  // 11. Administrative Audit Logging
  await test('11.1. Audit Logging Records State Transitions & Privileged Events', async () => {
    const res = await axios.get(`${API_V1}/admin/audit-logs?limit=30`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const logs = res.data.data.logs;
    if (!Array.isArray(logs) || logs.length === 0) {
      throw new Error('No audit log entries recorded in MongoDB');
    }
    const actions = logs.map((l) => l.action);
    if (!actions.includes('ORDER_STATUS_UPDATE')) {
      throw new Error('ORDER_STATUS_UPDATE missing from audit trail');
    }
    if (!actions.includes('ARTWORK_STATUS_UPDATE')) {
      throw new Error('ARTWORK_STATUS_UPDATE missing from audit trail');
    }
    const entry = logs.find((l) => l.action === 'ORDER_STATUS_UPDATE');
    if (!entry.adminEmail || !entry.targetId) {
      throw new Error('Audit entry missing admin identity or target ID');
    }
  });

  console.log('\n===================================================================');
  console.log(`  AUDIT SUITE COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED  `);
  console.log('===================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runProductionReadinessSuite();
