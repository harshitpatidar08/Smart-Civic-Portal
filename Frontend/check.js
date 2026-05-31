const fs = require('fs');
const esbuild = require('esbuild');
esbuild.transform(fs.readFileSync('src/pages/StateAdminDashboard.jsx', 'utf8'), { loader: 'jsx' })
  .then(()=>console.log("OK"))
  .catch(e=>console.log(JSON.stringify(e.errors, null, 2)));
