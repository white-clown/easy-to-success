var cmd = require('node-cmd');
const { exec } = require('child_process');
exec('npm run start', (error, stdout, stderr) => {
  console.error(`Stdout: ${stdout}`);
  // console.error('Current directory:', __dirname);
  // console.error('Current Environment Variables:', process.env);

  //   console.error(`Stderr: ${stderr}`);
  if (error) {
    console.error(`Error: ${error.message}`);
    console.error(`Error code: ${error.code}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
});
