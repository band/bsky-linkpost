const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { BskyAgent } = require('@atproto/api');

let mainWindow;
let bskyAgent;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  // open DevTools
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('login', async (event, { handle, password }) => {
  try {
    bskyAgent = new BskyAgent({ service: 'https://bsky.social' });
    await bskyAgent.login({ identifier: handle, password });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('post', async (event, { text, url }) => {
  if (!bskyAgent) {
    return { success: false, error: 'Not logged in' };
  }

  try {
    let postText = text;
    let embed = null;

    if (url) {
      const urlResponse = await fetch(url);
      const html = await urlResponse.text();
      
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : url;
      
      const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
      const description = descMatch ? descMatch[1].trim() : '';

      embed = {
        $type: 'app.bsky.embed.external',
        external: {
          uri: url,
          title: title,
          description: description
        }
      };

      if (!postText.includes(url)) {
        postText += `\n\n${url}`;
      }
    }

    const post = {
      text: postText,
      createdAt: new Date().toISOString()
    };

    if (embed) {
      post.embed = embed;
    }

    const bsPostResponse = await bskyAgent.post(post);
    console.log(`bskyAgent.post reponse: ${Object.entries(bsPostResponse)}`)
    const uriValue = Object.entries(bsPostResponse).find(([key]) => key === "uri")[1];
//    console.log(`bskyAgent.post uri: ${uriValue}`);
    return { success: true, post_uri: uriValue };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
