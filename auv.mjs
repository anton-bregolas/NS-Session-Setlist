///////////////////////////////////////////////////////////////////////
// auto-update-version scripts for NS Session Setlist
// https://github.com/anton-bregolas/
// MIT License
// (c) Anton Zille 2024-2025
///////////////////////////////////////////////////////////////////////
// Usage: node auv.mjs -help
// Custom .bashrc alias example: alias vv='node auv.mjs -v'
///////////////////////////////////////////////////////////////////////

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'node:child_process';
import appVersionJson from './version.json' with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFile = path.join(__dirname, 'version.json');
const serviceWorkerFile = path.join(__dirname, 'sw.js');

const args = process.argv.slice(2);

function getVersionData() {
  const { appVersion, appDate, dbVersion } = appVersionJson;
  return {
    appVersion: appVersion ? appVersion : null,
    appDate: appDate ? appDate : null,
    dbVersion: dbVersion? dbVersion : null
  };
}

function getBaseAppVersion(appVersion) {
  return appVersion.split('.').slice(0, -1).join('.');
}

function bumpAppVersion(appVersion, versionType) {
  const parts = appVersion.split('.');
  // Major version: Breaking changes, new milestone
  if (versionType && versionType === "breaking") {
    return `${parts[0]}.${+parts[1] + 1}.0`;
  }
  // Regular update
  return `${parts[0]}.${+parts[1]}.${+parts[2] + 1}`;
}

function getCurrentDate(dateType) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dateOutput = 
    dateType === "dbDate"? 
    `${yyyy}.${mm}.${dd}` :
    `${yyyy}-${mm}-${dd}`;
  return dateOutput
}

function bumpDbVersion(currentDbVersion) {
  const todayBase = getCurrentDate("dbDate");
  const match = currentDbVersion.match(/^(\d{4}\.\d{2}\.\d{2})\.(\d+)$/);
  if (match && match[1] === todayBase) {
    // Same date, bump VER
    const ver = parseInt(match[2], 10) + 1;
    return `${todayBase}.${ver}`;
  } else {
    // New date, start at 1
    return `${todayBase}.1`;
  }
}

async function readFileData(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err) {
    console.error(`✗ Failed to read ${path.basename(filePath)}:`, err.message);
    throw err;
  }
}

async function updateFile(filePath, updateData) {
  try {
    await fs.writeFile(filePath, updateData, 'utf8');
    console.log(`✓ ${path.basename(filePath)} updated`);
  } catch (err) {
    console.error(`✗ ${path.basename(filePath)} update failed:`, err.message);
    throw err;
  }
}

async function updateVersionFile(newAppVersion, newAppDate, newDbVersion) {
  const jsonData = JSON.parse(await readFileData(versionFile));
  jsonData.appVersion = newAppVersion ?? jsonData.appVersion;
  jsonData.appDate = newAppDate ?? jsonData.appDate;
  jsonData.dbVersion = newDbVersion ?? jsonData.dbVersion;
  const updatedJson = JSON.stringify(jsonData, null, 2);
  await updateFile(versionFile, updatedJson);
}

async function updateServiceWorker(newAppVersion) {
  const swData = await readFileData(serviceWorkerFile);
  const updatedSw = 
    swData
    .replace(/APP_VERSION\s*=\s*["'`].*?["'`]/, `APP_VERSION = '${newAppVersion}'`)
  await updateFile(serviceWorkerFile, updatedSw);
}

async function addAllChanges() {
  try {
    execSync('git add -A', { stdio: 'inherit' });
    console.log(`✓ Added all changes`);
  } catch (err) {
    console.error(`✗ Failed to add changes:`, err.message || err);
    process.exit(1);
  }
}

async function addVersionChanges() {
  try {
    execSync('git add version.json', { stdio: 'inherit' });
    execSync('git add sw.js', { stdio: 'inherit' });
    execSync('git add README.md', { stdio: 'inherit' });
    console.log(`✓ Added changes to version files`);
  } catch (err) {
    console.error(`✗ Failed to add changes:`, err.message || err);
    process.exit(1);
  }
}

async function commitChangesWithMessage(commitMessage) {
  try {
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log(`✓ Committed changes with message:\n\n${commitMessage}\n\n`);
    return 0;
  } catch (err) {
    console.error(`✗ Failed to commit changes:`, err.message || err);
    process.exit(1);
  }
}

async function addAllChangesAndCommit(commitMessage) {
  try {
    execSync('git add -A', { stdio: 'inherit' });
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log(`✓ Added all changes & committed with message:\n\n${commitMessage}`);
    return 0;
  } catch (err) {
    console.error(`✗ Failed to add & commit changes:`, err.message || err);
    process.exit(1);
  }
}

async function openCommitEditor(message) {
  // Write to a temp file and open git commit with -t
  const tmpFile = path.join(__dirname, '.git', 'COMMIT_EDITMSG_NSSS');
  await fs.writeFile(tmpFile, message, 'utf8');
  return new Promise((resolve) => {
    const child = spawn('git', ['commit', '-t', tmpFile], { stdio: 'inherit' });
    child.on('exit', (code) => {
      fs.unlink(tmpFile).then(() => resolve(code));
    });
  });
}

async function commitWithMessage(message) {
  return new Promise((resolve) => {
    const child = spawn('git', ['commit', '-m', message], { stdio: 'inherit' });
    child.on('exit', (code) => resolve(code));
  });
}

async function main() {

  const type = args[0];

  if (!type || !['-a', '-bc', '-bca', '-buv', '-c', '-ca', '-help', '-tst', '-udb', '-uv', '-v'].includes(type)) {
    console.error('NS Session Setlist :: Auto-Update-Version\n\nUsage: v[a|bc|bca|buv|c|ca|help|tst|u|udb|us|uv|v] || node auv.mjs [-a|-bc|-bca|-buv|-c|-ca|-help|-tst|-udb|-uv|-v]');
    process.exit(1);
  }

  if (type === '-help') {
    console.log(
     'NS Session Setlist :: Auto-Update-Version' + '\n\n' +
     '-a\t|\tva\t|\tadd version files only' + '\n' +
     '-bc\t|\tvbc\t|\topen commit editor, update / add / commit breaking changes on success' + '\n' +
     '-bca\t|\tvbca\t|\tupdate version with breaking changes, add all, open commit editor' + '\n' +     
     '-buv\t|\tvbuv\t|\tupdate / add version files only with breaking changes, auto-commit' + '\n' +
     '-c\t|\tvc\t|\topen commit editor, update / add / commit version files on success' + '\n' +
     '-ca\t|\tvca\t|\tupdate version, add all, open commit editor' + '\n' +
     '-help\t|\tvhelp\t|\tlist all available commands' + '\n' +
     '-tst\t|\tvtst\t|\ttest updated app version / date' + '\n' +
     '-udb\t|\tvudb\t|\tupdate / add db version only, auto-commit' + '\n' +
     '-uv\t|\tvuv\t|\tupdate / add version files only, auto-commit' + '\n' +
     '-v\t|\tvv\t|\tshow current app version / date' + '\n'
    );
    process.exit(0);
  }

  if (type === '-a') {
    addVersionChanges();
    return;
  }

  const { appVersion, appDate, dbVersion } = getVersionData();
  
  if (type === '-v') {
    console.log(
      `NS Session app version:\t\t${appVersion}\nNS Session app updated:\t\t${appDate}\nSession DB version:\t\t${dbVersion}`
    ); 
    return; 
  }

  const newAppVersion =
    (type === '-bc' || type === '-bca' || type === '-buv')?
      bumpAppVersion(appVersion, "breaking") :
    type === '-aa' ? bumpAppVersion(appVersion, "minor") :
      bumpAppVersion(appVersion);

  const newDbVersion =
    (type === '-udb' || type === '-tst')?
      bumpDbVersion(dbVersion) : dbVersion;

  const newAppDate = getCurrentDate();

  if (type === '-tst') {
    console.log(
      `Test bump NS app version:\t${newAppVersion}\n` +
      `Test major NS app version:\t${bumpAppVersion(appVersion, "breaking")}\n` +
      `Test update NS app date:\t${newAppDate}\n`+
      `Test update Session DB version:\t${newDbVersion}\n`
    ); 
    return; 
  }

  if (type === '-udb') {
    await updateVersionFile(newAppVersion, newAppDate, newDbVersion);
    await updateServiceWorker(newAppVersion, newAppDate);
  }

  if (type === '-ca' || type === '-bca') {
    await updateVersionFile(newAppVersion, newAppDate);
    await updateServiceWorker(newAppVersion, newAppDate);
  }

  let commitMsg = '';
  let exitCode = 1;

  if (type === '-ca' || type === '-bca') {
    await addAllChanges();
    commitMsg = 
      `NS Session App v${newAppVersion}: \n\n+ updates:\n  -`;
    exitCode = await openCommitEditor(commitMsg);

  } else if (type === '-c' || type === '-bc') {
    commitMsg = 
      `NS Session App v${newAppVersion}: \n\n+ updates:\n  -`;
    exitCode = await openCommitEditor(commitMsg);

  } else if (type === '-uv' || type === '-buv') {
    await addAllChanges();
    commitMsg = `NS Session App v${newAppVersion}: Update Version`;
    exitCode = await commitWithMessage(commitMsg);

  } else if (type === '-udb') {
    await addAllChanges();
    commitMsg =
      `NS Session App v${newAppVersion}: Session DB Update\n\n` +
      `+ Session DB Updates:\n  - Update to version ${newDbVersion}`;
    exitCode = await commitWithMessage(commitMsg);
  }

  if (exitCode !== 0) {
    process.exit(1);
  }

  if (exitCode === 0) {
    // For -c, only update version file & service worker if commit succeeded
    if (type === '-c' || type === '-bc') {
      await updateVersionFile(newAppVersion, newAppDate);
      await updateServiceWorker(newAppVersion, newAppDate);
      await addVersionChanges();
      commitMsg = `NS Session App v${newAppVersion}: Update Version`;
      await commitChangesWithMessage(commitMsg);
      
    } else if (type === '-ca' || type === '-bca') {
      console.log(`✓ Committed all changes`);

    } else if (type === '-uv' || type === '-buv') {
      console.log(`✓ Committed version update`);

    } else if (type === '-udb') {
      console.log(`✓ Committed DB update`);

    } else if (type === '-us') {
      await addAllChanges();
      console.log(`✓ Updated app files & staged all changes`);
    }
  }
}

main();