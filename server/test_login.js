const testLogin = async () => {
    try {
        console.log('Testing Login API...');
        const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@smartspend.com',
                password: 'edagali@100%'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login Successful!');
            console.log('Token:', data.token ? 'Received' : 'Missing');
            console.log('User:', data.user.email);
        } else {
            console.error('Login Failed:');
            console.error('Status:', response.status);
            console.error('Data:', data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testLogin();
