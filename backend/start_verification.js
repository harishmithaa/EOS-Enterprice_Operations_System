const http = require('http');

const API_HOST = '127.0.0.1';
const API_PORT = 5000;

const TEST_USER = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
};

function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            port: API_PORT,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function verify() {
    try {
        console.log('1. Registering/Logging in user...');
        let token;

        let loginRes = await request('POST', '/auth/login', { email: TEST_USER.email, password: TEST_USER.password });

        if (loginRes.status === 200) {
            token = loginRes.data.token;
            console.log('Login successful.');
        } else if (loginRes.status === 401 || loginRes.status === 400 || loginRes.status === 404) {
            console.log('Login failed (' + loginRes.status + '), trying to register...');
            let registerRes = await request('POST', '/auth/register', TEST_USER);
            if (registerRes.status === 201 || registerRes.status === 200) {
                token = registerRes.data.token;
                console.log('Registration successful.');
            } else {
                throw new Error('Registration failed: ' + JSON.stringify(registerRes.data));
            }
        } else {
            throw new Error('Login failed with status ' + loginRes.status + ': ' + JSON.stringify(loginRes.data));
        }

        console.log('\n2. Fetching products...');
        const productsRes = await request('GET', '/products', null, token);
        if (productsRes.status === 200) {
            console.log('Products fetched:', Array.isArray(productsRes.data) ? productsRes.data.length : productsRes.data);
        } else {
            console.error('Failed to fetch products:', productsRes.data);
        }

        console.log('\n3. Creating a product...');
        const newProduct = {
            name: 'Test Product ' + Date.now(),
            category: 'Test',
            sellingPrice: 100,
            costPrice: 50,
            stockQuantity: 10,
            minimumStockThreshold: 5,
            description: 'Test description',
        };

        const createRes = await request('POST', '/products', newProduct, token);
        if (createRes.status === 201 || createRes.status === 200) {
            console.log('Product created:', createRes.data._id);
        } else {
            console.error('Failed to create product:', createRes.data);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verify();
