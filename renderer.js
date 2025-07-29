let isLoggedIn = false;

const loginSection = document.getElementById('loginSection');
const postSection = document.getElementById('postSection');
const loginBtn = document.getElementById('loginBtn');
const postBtn = document.getElementById('postBtn');
const loginStatus = document.getElementById('loginStatus');
const postStatus = document.getElementById('postStatus');
const loggedInUser = document.getElementById('loggedInUser');

function showStatus(element, message, isError = false) {
    element.textContent = message;
    element.className = `status ${isError ? 'error' : 'success'}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

loginBtn.addEventListener('click', async () => {
    const handle = document.getElementById('handle').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!handle || !password) {
        showStatus(loginStatus, 'Please enter both handle and password', true);
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        const result = await window.electronAPI.login({ handle, password });
        
        if (result.success) {
            isLoggedIn = true;
            loginSection.style.display = 'none';
            postSection.style.display = 'block';
            loggedInUser.textContent = `Logged in as: ${handle}`;
            showStatus(loginStatus, 'Login successful!');
        } else {
            showStatus(loginStatus, `Login failed: ${result.error}`, true);
        }
    } catch (error) {
        showStatus(loginStatus, `Login error: ${error.message}`, true);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

postBtn.addEventListener('click', async () => {
    const text = document.getElementById('postText').value.trim();
    const url = document.getElementById('url').value.trim();
    
    if (!text) {
        showStatus(postStatus, 'Please enter some text for your post', true);
        return;
    }
    
    postBtn.disabled = true;
    postBtn.textContent = 'Posting...';
    
    try {
        const result = await window.electronAPI.post({ text, url });
        console.log(result)
        if (result.success) {
            showStatus(postStatus, 'Post published successfully!');
            document.getElementById('postText').value = '';
            document.getElementById('url').value = '';
        } else {
            showStatus(postStatus, `Post failed: ${result.error}`, true);
        }
    } catch (error) {
        showStatus(postStatus, `Post error: ${error.message}`, true);
    } finally {
        postBtn.disabled = false;
        postBtn.textContent = 'Post to Bluesky';
    }
});

document.getElementById('handle').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('password').focus();
    }
});

document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

document.getElementById('postText').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        postBtn.click();
    }
});
