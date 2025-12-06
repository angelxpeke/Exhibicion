(async () => {
  const PORT = process.env.PORT || 3000;
  try {
    const u = 'testuser_' + Math.random().toString(36).slice(2,8);
    console.log('Registering user:', u);

    const regRes = await fetch(`http://localhost:${PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: 'testpass' })
    });
    const regText = await regRes.text();
    let reg;
    try {
      reg = JSON.parse(regText);
      console.log('Register response:', reg);
    } catch (e) {
      console.log('Register returned non-JSON (status', regRes.status, '):\n', regText);
      throw new Error('Register returned non-JSON');
    }

    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: 'testpass' })
    });
    const loginText = await loginRes.text();
    let login;
    try {
      login = JSON.parse(loginText);
      console.log('Login response:', login);
    } catch (e) {
      console.log('Login returned non-JSON (status', loginRes.status, '):\n', loginText);
      throw new Error('Login returned non-JSON');
    }

    const token = login.token;
    console.log('Token:', token);

    const gamesRes = await fetch(`http://localhost:${PORT}/api/juegos`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const gamesText = await gamesRes.text();
    let games;
    try {
      games = JSON.parse(gamesText);
      console.log('GET /api/juegos:', games);
    } catch (e) {
      console.log('GET /api/juegos returned non-JSON (status', gamesRes.status, '):\n', gamesText);
      throw new Error('GET /api/juegos returned non-JSON');
    }
  } catch (e) {
    console.error('Test script error:', e);
    process.exit(1);
  }
})();
