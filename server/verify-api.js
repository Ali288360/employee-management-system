const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw { response: { data }, message: data.message || 'Request failed' };
  }
  return data;
}

async function runTests() {
  console.log('--- STARTING EMS API INTEGRATION TESTS (NATIVE FETCH) ---');
  let adminToken = '';
  let employeeToken = '';
  let testEmployeeProfileId = '';
  let leaveRequestId = '';
  let payslipId = '';

  // Helper clients with tokens
  const adminHeaders = () => ({ 'Authorization': `Bearer ${adminToken}` });
  const employeeHeaders = () => ({ 'Authorization': `Bearer ${employeeToken}` });

  // 1. Setup default admin account
  try {
    console.log('\n[1] Testing /api/auth/setup...');
    const setupRes = await request('/auth/setup', { method: 'POST' });
    console.log('Setup Success:', setupRes);
  } catch (err) {
    console.log('Setup skipped (admin may already exist):', err.response?.data?.message || err.message);
  }

  // 2. Admin Login
  try {
    console.log('\n[2] Testing Admin Login...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@ems.com',
        password: 'adminpassword123',
      }),
    });
    adminToken = loginRes.token;
    console.log('Admin Login Success! Role:', loginRes.user.role);
  } catch (err) {
    console.error('Admin Login Failed:', err.response?.data || err.message);
    return;
  }

  // 3. Create Employee
  const employeeEmail = `john.doe.${Date.now()}@company.com`;
  const employeePass = 'password123';
  try {
    console.log(`\n[3] Testing Employee Creation (Admin) for email ${employeeEmail}...`);
    const empRes = await request('/employees', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        email: employeeEmail,
        password: employeePass,
        firstName: 'John',
        lastName: 'Doe',
        employeeId: `EMP${Math.floor(Math.random() * 9000) + 1000}`,
        department: 'Engineering',
        designation: 'Software Engineer',
        salary: 85000,
        phoneNumber: '123-456-7890',
      }),
    });
    testEmployeeProfileId = empRes.employee._id;
    console.log('Employee Created Successfully! Profile ID:', testEmployeeProfileId);
  } catch (err) {
    console.error('Employee Creation Failed:', err.response?.data || err.message);
    return;
  }

  // 4. Employee Login
  try {
    console.log('\n[4] Testing Employee Login...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: employeeEmail,
        password: employeePass,
      }),
    });
    employeeToken = loginRes.token;
    console.log('Employee Login Success! Role:', loginRes.user.role);
  } catch (err) {
    console.error('Employee Login Failed:', err.response?.data || err.message);
    return;
  }

  // 5. Check-in Employee
  try {
    console.log('\n[5] Testing Employee Check-In...');
    const checkInRes = await request('/attendance/check-in', {
      method: 'POST',
      headers: employeeHeaders(),
    });
    console.log('Check-In Success:', checkInRes);
  } catch (err) {
    console.error('Check-In Failed:', err.response?.data || err.message);
  }

  // 6. Check today's check-in status
  try {
    console.log('\n[6] Testing Get Today\'s Attendance Status...');
    const statusRes = await request('/attendance/today', {
      method: 'GET',
      headers: employeeHeaders(),
    });
    console.log('Today Status:', statusRes);
  } catch (err) {
    console.error('Get Today Status Failed:', err.response?.data || err.message);
  }

  // 7. Apply for Leave (Employee)
  try {
    console.log('\n[7] Testing Apply for Leave...');
    const leaveRes = await request('/leaves', {
      method: 'POST',
      headers: employeeHeaders(),
      body: JSON.stringify({
        startDate: new Date(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        type: 'Sick',
        reason: 'Fever and cold',
      }),
    });
    leaveRequestId = leaveRes.leave._id;
    console.log('Leave Request Applied Success! Leave ID:', leaveRequestId);
  } catch (err) {
    console.error('Leave Application Failed:', err.response?.data || err.message);
  }

  // 8. Review Leave Request (Admin Approve)
  if (leaveRequestId) {
    try {
      console.log('\n[8] Testing Review Leave Request (Admin Approval)...');
      const reviewRes = await request(`/leaves/${leaveRequestId}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({
          status: 'Approved',
        }),
      });
      console.log('Review Leave Success! Status:', reviewRes.leave.status);
    } catch (err) {
      console.error('Review Leave Failed:', err.response?.data || err.message);
    }
  }

  // 9. Generate Payslip (Admin)
  try {
    console.log('\n[9] Testing Payslip Generation...');
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const payslipRes = await request('/payslips', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        employeeId: testEmployeeProfileId,
        month: currentMonth,
        allowances: 1500,
        deductions: 450,
      }),
    });
    payslipId = payslipRes.payslip._id;
    console.log('Payslip Generated Success! ID:', payslipId);
  } catch (err) {
    console.error('Payslip Generation Failed:', err.response?.data || err.message);
  }

  // 10. Fetch Payslips (Employee)
  try {
    console.log('\n[10] Testing Get Payslips List (Employee)...');
    const payslipsRes = await request('/payslips', {
      method: 'GET',
      headers: employeeHeaders(),
    });
    console.log('Employee Payslips List Count:', payslipsRes.length);
  } catch (err) {
    console.error('Fetch Payslips Failed:', err.response?.data || err.message);
  }

  console.log('\n--- EMS API INTEGRATION TESTS COMPLETED ---');
}

runTests();
