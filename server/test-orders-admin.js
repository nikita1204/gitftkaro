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

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('  GIFT KRO: ORDER MANAGEMENT & ADMIN DASHBOARD TESTS  ');
  console.log('======================================================\n');

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

  // 1. Health check
  await test('1. System Health & Database Connection', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (res.data?.data?.status !== 'healthy' || res.data?.data?.database?.status !== 'connected') {
      throw new Error(`Health status check failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 2. Authorization Security on Admin Endpoints
  let customerToken = null;
  let adminToken = null;
  const testCustomerEmail = `customer_${Date.now()}@example.com`;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@giftkro.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminRaipur2026!';

  await test('2.1. Privileged Endpoints Reject Unauthenticated Requests (401)', async () => {
    try {
      await axios.get(`${API_V1}/admin/metrics`);
      throw new Error('Expected 401 for unauthenticated /admin/metrics');
    } catch (err) {
      if (err.response?.status !== 401) {
        throw new Error(`Expected 401, got ${err.response?.status}`);
      }
    }

    try {
      await axios.get(`${API_V1}/orders/admin/all`);
      throw new Error('Expected 401 for unauthenticated /orders/admin/all');
    } catch (err) {
      if (err.response?.status !== 401) {
        throw new Error(`Expected 401, got ${err.response?.status}`);
      }
    }
  });

  await test('2.2. Register Customer & Reject Non-Admin Access with 403 Forbidden', async () => {
    const regRes = await axios.post(`${API_V1}/auth/register`, {
      name: 'Rohan Sharma',
      email: testCustomerEmail,
      password: 'CustomerPassword123!',
      phone: '9876543210',
    });
    customerToken = regRes.data.data.token;

    // Try accessing /admin/metrics with customer token
    try {
      await axios.get(`${API_V1}/admin/metrics`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      throw new Error('Expected 403 for customer on /admin/metrics');
    } catch (err) {
      if (err.response?.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${err.response?.status}`);
      }
    }

    // Try updating order status with customer token
    try {
      await axios.patch(
        `${API_V1}/orders/507f1f77bcf86cd799439011/status`,
        { orderStatus: 'confirmed' },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      throw new Error('Expected 403 for customer on /orders/:id/status');
    } catch (err) {
      if (err.response?.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${err.response?.status}`);
      }
    }
  });

  await test('2.3. Authenticate Administrator & Allow Privileged Access (200)', async () => {
    const adminRes = await axios.post(`${API_V1}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    });
    adminToken = adminRes.data.data.token;

    const metricsRes = await axios.get(`${API_V1}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (metricsRes.status !== 200 || !metricsRes.data?.data?.orders || !metricsRes.data?.data?.financial) {
      throw new Error('Failed to retrieve admin metrics with valid admin token');
    }

    // Set standard baseline for 24h express
    await axios.put(
      `${API_V1}/delivery/config`,
      {
        expressPromiseHours: 24,
        maxExpressQuantity: 100,
        minExpressQuantity: 10,
        isCutOffActive: false,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
  });

  // 3. Create Order from Validated Cart
  let createdOrder = null;
  let testProduct = null;

  await test('3.1. Fetch Product Catalog and Populate Customer Cart (MOQ >= 10)', async () => {
    const productsRes = await axios.get(`${API_V1}/products?limit=5`);
    const productsList = Array.isArray(productsRes.data.data)
      ? productsRes.data.data
      : productsRes.data.data?.products;
    if (!productsList || productsList.length === 0) {
      throw new Error('No products found in database to test order creation');
    }
    testProduct = productsList[0];

    // Add customized item with 12 pcs (MOQ >= 10)
    await axios.post(
      `${API_V1}/cart/items`,
      {
        productId: testProduct._id,
        orderType: 'corporate',
        selectedColor: testProduct.availableColors?.[0] || { name: 'Black', hex: '#000000' },
        sizeBreakdown: [
          { size: 'M', quantity: 6 },
          { size: 'L', quantity: 6 },
        ],
        printLocations: ['front_chest'],
        customText: 'TECH SUMMIT RAIPUR 2026',
        printingInstructions: 'High precision chest placement requested',
        artworks: [
          {
            filename: 'mock_raipur_summit_logo.png',
            originalName: 'tech_raipur_summit_logo.png',
            mimetype: 'image/png',
            size: 154200,
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518',
          },
        ],
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );

    const cartRes = await axios.get(`${API_V1}/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    if (!cartRes.data?.data?.items || cartRes.data.data.items.length === 0 || cartRes.data.data.summary?.totalQuantity < 10) {
      console.log('Cart Response on failure:', JSON.stringify(cartRes.data, null, 2));
      throw new Error(`Cart item population failed or quantity below MOQ. Items: ${cartRes.data?.data?.items?.length}, Qty: ${cartRes.data?.data?.summary?.totalQuantity}`);
    }
  });

  await test('3.2. Create Official Order (Enforce Raipur Express Delivery & Pricing)', async () => {
    const idempotencyKey = `ord_test_${Date.now()}`;
    const orderPayload = {
      contact: {
        name: 'Rohan Sharma',
        email: testCustomerEmail,
        phone: '9876543210',
        organization: 'Tech Raipur Hub',
      },
      shippingAddress: {
        streetAddress: 'Plot 42, Telibandha Ring Road No 1',
        landmark: 'Near Magneto Mall',
        areaLocality: 'Telibandha',
        city: 'Raipur',
        state: 'Chhattisgarh',
        pincode: '492001',
        deliveryNotes: 'Deliver to main reception between 10am-5pm',
        expressPreference: 'standard_24h',
      },
      idempotencyKey,
    };

    const res = await axios.post(`${API_V1}/orders`, orderPayload, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    createdOrder = res.data.data.order;
    const razorpayData = res.data.data.razorpayOrder || res.data.data.razorpay;
    const rzOrderId = razorpayData?.orderId || razorpayData?.id;

    if (!createdOrder || !createdOrder.orderNumber.startsWith('GK-ORD-')) {
      throw new Error(`Invalid order number generated: ${createdOrder?.orderNumber}`);
    }
    if (createdOrder.orderStatus !== 'pending_payment') {
      throw new Error(`Expected order status 'pending_payment', got '${createdOrder.orderStatus}'`);
    }
    if (!rzOrderId || !rzOrderId.startsWith('order_')) {
      throw new Error(`Invalid Razorpay order created: ${JSON.stringify(razorpayData)}`);
    }
    if (createdOrder.deliveryEstimate?.is24hEligible !== true) {
      console.log('deliveryEstimate:', createdOrder.deliveryEstimate);
      throw new Error(`Telibandha Raipur order should be 24h eligible, got: ${createdOrder.deliveryEstimate?.is24hEligible}`);
    }
  });

  // 4. Cryptographic Payment Verification & Rejection
  await test('4.1. Reject Forged / Invalid Razorpay Signature with 400', async () => {
    try {
      await axios.post(`${API_V1}/orders/verify-payment`, {
        razorpayOrderId: createdOrder.payment.razorpayOrderId,
        razorpayPaymentId: 'pay_fake_attack_123',
        razorpaySignature: 'bad_forged_signature_hex_string',
      });
      throw new Error('Expected 400 for forged payment signature');
    } catch (err) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400, got ${err.response?.status}`);
      }
      if (!err.response?.data?.message?.toLowerCase().includes('signature')) {
        throw new Error(`Expected signature error message, got: ${err.response?.data?.message}`);
      }
    }
  });

  await test('4.2. Verify Genuine Cryptographic HMAC-SHA256 Signature (Transitions to Confirmed)', async () => {
    const mockPaymentId = `pay_verified_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_giftkro_express_2026';
    const payload = `${createdOrder.payment.razorpayOrderId}|${mockPaymentId}`;
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await axios.post(`${API_V1}/orders/verify-payment`, {
      razorpayOrderId: createdOrder.payment.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: validSignature,
    });

    createdOrder = res.data.data;
    if (createdOrder.orderStatus !== 'confirmed') {
      throw new Error(`Expected order status 'confirmed', got '${createdOrder.orderStatus}'`);
    }
    if (createdOrder.payment.status !== 'captured') {
      throw new Error(`Expected payment status 'captured', got '${createdOrder.payment.status}'`);
    }
  });

  await test('4.3. Payment Verification Idempotency Safeguard (Safe Duplicate Callback)', async () => {
    const mockPaymentId = createdOrder.payment.razorpayPaymentId;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dev_razorpay_secret_giftkro_express_2026';
    const payload = `${createdOrder.payment.razorpayOrderId}|${mockPaymentId}`;
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await axios.post(`${API_V1}/orders/verify-payment`, {
      razorpayOrderId: createdOrder.payment.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: validSignature,
    });

    if (res.data.data.orderStatus !== 'confirmed') {
      throw new Error('Idempotent re-verification corrupted order status');
    }
  });

  await test('4.4. Verify Customer Cart Was Cleared After Confirmed Order', async () => {
    const cartRes = await axios.get(`${API_V1}/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (cartRes.data.data.items.length !== 0) {
      throw new Error('Cart was not emptied after order confirmation');
    }
  });

  // 5. Strict Status Transition Machine Tests
  await test('5.1. Reject Invalid Status Transition (confirmed -> delivered directly)', async () => {
    try {
      await axios.patch(
        `${API_V1}/orders/${createdOrder._id}/status`,
        { orderStatus: 'delivered', comment: 'Attempting invalid jump' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      throw new Error('Expected 400 when jumping directly from confirmed to delivered');
    } catch (err) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400 Bad Request, got ${err.response?.status}`);
      }
      if (!err.response?.data?.message?.includes('Invalid status transition')) {
        throw new Error(`Expected transition error message, got: ${err.response?.data?.message}`);
      }
    }
  });

  await test('5.2. Perform Valid Production Sequence: confirmed -> in_production -> quality_check -> dispatched -> delivered', async () => {
    // 1. confirmed -> in_production
    let res = await axios.patch(
      `${API_V1}/orders/${createdOrder._id}/status`,
      { orderStatus: 'in_production', comment: 'Screen printing started at Raipur workshop' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.data.data.orderStatus !== 'in_production') {
      throw new Error('Failed to transition to in_production');
    }

    // 2. in_production -> quality_check
    res = await axios.patch(
      `${API_V1}/orders/${createdOrder._id}/status`,
      { orderStatus: 'quality_check', comment: 'Curing complete, print clarity inspected' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.data.data.orderStatus !== 'quality_check') {
      throw new Error('Failed to transition to quality_check');
    }

    // 3. quality_check -> dispatched
    res = await axios.patch(
      `${API_V1}/orders/${createdOrder._id}/status`,
      { orderStatus: 'dispatched', comment: 'Handed to Raipur Express Courier Rider #7' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.data.data.orderStatus !== 'dispatched') {
      throw new Error('Failed to transition to dispatched');
    }

    // 4. dispatched -> delivered
    res = await axios.patch(
      `${API_V1}/orders/${createdOrder._id}/status`,
      { orderStatus: 'delivered', comment: 'Delivered and received by security at Telibandha hub' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.data.data.orderStatus !== 'delivered') {
      throw new Error('Failed to transition to delivered');
    }
    createdOrder = res.data.data;
  });

  await test('5.3. Reject Status Update on Terminal Status (delivered -> in_production)', async () => {
    try {
      await axios.patch(
        `${API_V1}/orders/${createdOrder._id}/status`,
        { orderStatus: 'in_production', comment: 'Re-open delivered order' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      throw new Error('Expected 400 for transition on terminal status delivered');
    } catch (err) {
      if (err.response?.status !== 400) {
        throw new Error(`Expected 400 Bad Request, got ${err.response?.status}`);
      }
    }
  });

  // 6. Pre-press Artwork Review Gallery
  await test('6.1. Artwork Review: Request Revision and Approve Artwork Proof', async () => {
    const item = createdOrder.items[0];
    const artwork = item.artworks[0];

    // Request revision
    let res = await axios.patch(
      `${API_V1}/orders/${createdOrder._id}/items/${item._id}/artworks/${artwork._id}`,
      {
        approvalStatus: 'revision_requested',
        reviewNotes: 'Artwork resolution is borderline (220 DPI). Request high-res vector .AI or .PDF.',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    let updatedItem = res.data.data.items.find((i) => i._id === item._id);
    let updatedArt = updatedItem.artworks.find((a) => a._id === artwork._id);
    if (updatedArt.approvalStatus !== 'revision_requested') {
      throw new Error('Failed to update artwork status to revision_requested');
    }

    // Now Approve Artwork
    res = await axios.patch(
      `${API_V1}/orders/${createdOrder._id}/items/${item._id}/artworks/${artwork._id}`,
      {
        approvalStatus: 'approved',
        reviewNotes: 'High-res vector proof received and approved for 24h express print queue.',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    updatedItem = res.data.data.items.find((i) => i._id === item._id);
    updatedArt = updatedItem.artworks.find((a) => a._id === artwork._id);
    if (updatedArt.approvalStatus !== 'approved') {
      throw new Error('Failed to update artwork status to approved');
    }
  });

  // 7. Real Database Analytics & Metrics Verification
  await test('7.1. Dashboard Summary Metrics Derived from Real Database Data', async () => {
    const res = await axios.get(`${API_V1}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const data = res.data.data;
    const financial = data.financial;
    const orders = data.orders;
    const catalogue = data.catalogue;
    const recentOrders = data.recentOrders;
    const auditLogs = data.recentAuditLogs;

    if (typeof financial.totalRevenue !== 'number' || financial.totalRevenue < 0) {
      throw new Error(`Invalid totalRevenue: ${financial.totalRevenue}`);
    }
    if (typeof orders.totalOrders !== 'number' || orders.totalOrders <= 0) {
      throw new Error(`Expected at least 1 order, got ${orders.totalOrders}`);
    }
    if (typeof data.users.totalCustomers !== 'number' || data.users.totalCustomers <= 0) {
      throw new Error(`Expected at least 1 customer, got ${data.users.totalCustomers}`);
    }
    if (typeof orders.express24hCount !== 'number') {
      throw new Error('express24hCount metric missing');
    }
    if (!Array.isArray(recentOrders) || recentOrders.length === 0) {
      throw new Error('Recent orders list is empty');
    }
    if (!Array.isArray(auditLogs) || auditLogs.length === 0) {
      throw new Error('Recent audit logs list is empty');
    }

    console.log(`     [DB Metrics Report] Total Revenue: ₹${financial.totalRevenue.toLocaleString('en-IN')}`);
    console.log(`     [DB Metrics Report] Total Orders in DB: ${orders.totalOrders}`);
    console.log(`     [DB Metrics Report] 24h Express Orders: ${orders.express24hCount}`);
    console.log(`     [DB Metrics Report] Registered Customers: ${data.users.totalCustomers}`);
    console.log(`     [DB Metrics Report] Active Catalogue Products: ${catalogue.activeProducts}`);
  });

  // 8. Service Area & Delivery Configuration Management
  await test('8.1. Admin Configuration: Delivery Hub Cut-off & Service Areas', async () => {
    const res = await axios.put(
      `${API_V1}/delivery/config`,
      {
        expressPromiseHours: 24,
        maxExpressQuantity: 100,
        minExpressQuantity: 10,
        isCutOffActive: true,
        cutOffTime: '14:30',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (res.status !== 200 || !res.data.data) {
      throw new Error('Failed to update delivery hub settings');
    }
  });

  // 9. Basic Audit Logging Verification
  await test('9.1. Audit Trail Logs Privileged Administrative Actions', async () => {
    const res = await axios.get(`${API_V1}/admin/audit-logs?limit=30`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const logs = res.data.data.logs;
    if (!Array.isArray(logs) || logs.length === 0) {
      throw new Error('Audit trail is empty');
    }

    const actions = logs.map((l) => l.action);
    const hasStatusUpdate = actions.includes('ORDER_STATUS_UPDATE');
    const hasArtworkReview = actions.includes('ARTWORK_STATUS_UPDATE');
    const hasDeliveryUpdate = actions.includes('DELIVERY_CONFIG_UPDATE');

    if (!hasStatusUpdate) throw new Error('Missing ORDER_STATUS_UPDATE in audit trail');
    if (!hasArtworkReview) throw new Error('Missing ARTWORK_STATUS_UPDATE in audit trail');
    if (!hasDeliveryUpdate) throw new Error('Missing DELIVERY_CONFIG_UPDATE in audit trail');

    const sampleLog = logs.find((l) => l.action === 'ORDER_STATUS_UPDATE');
    if (!sampleLog.admin?.email || !sampleLog.targetId) {
      throw new Error('Audit log missing admin email or target ID');
    }
  });

  console.log('\n======================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED  `);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
