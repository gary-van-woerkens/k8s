#!/usr/bin/env node

const path = require('path');
const util = require('util');
const fs = require('fs-extra');
const exec = util.promisify(require('child_process').exec);

// Define directories pathes
const k8sDir = path.join(__dirname, "../.k8s");
const k8sCmpDir = path.join(__dirname, "../.k8s/components");
const k8sEnvDir = path.join(__dirname, "../.k8s/environments");
const k8sCmpBakDir = path.join(__dirname, "../.k8s/components.bak");
const k8sEnvBakDir = path.join(__dirname, "../.k8s/environments.bak");
const socialgouvCmpDir = path.join(process.env.SOCIALGOUV_CONFIG_PATH, "../components");
const socialgouvEnvDir = path.join(process.env.SOCIALGOUV_CONFIG_PATH, "../environments");

// Backup environments and components directories
const doBackups = async () => {
  try {
    await fs.copy(k8sEnvDir, k8sEnvBakDir);
    await fs.copy(k8sCmpDir, k8sCmpBakDir);
  } catch (error) {
    console.log("Error doBackups:", error);
  }
}

// Copy .socialgouv/environments and .socialgouv/components to .k8s directory
const copyEnvAndCmp = async () => {
  try {
    if (await fs.pathExists(socialgouvEnvDir)) {
      await fs.copy(socialgouvEnvDir, k8sEnvDir);
    }
    if (await fs.pathExists(socialgouvCmpDir)) {
      await fs.copy(socialgouvCmpDir, k8sCmpDir);
    }
  } catch (error) {
    console.log("Error copyEnvAndCmp:", error);
  }
}

// Install kosko charts dependencies
const installDependencies = async () => {
  try {
    await exec(`yarn --cwd ${k8sDir} --silent`);
  } catch (error) {
    console.log("Error installDependencies:", error);
  }
}

// Run kosko generate
const koskoGenerate = async (args = "--env dev") => {
  try {
    const cmd = `yarn --silent --cwd ${k8sDir} generate ${args}`;
    const { stdout } = await exec(cmd);
    console.log(stdout);
  } catch (error) {
    console.log("Error koskoGenerate:", error);
  }
}

// Backup environments and components directories
const restoreBackups = async () => {
  try {
    await fs.remove(k8sEnvDir);
    await fs.remove(k8sCmpDir);
    await fs.copy(k8sEnvBakDir, k8sEnvDir);
    await fs.copy(k8sCmpBakDir, k8sCmpDir);
    await fs.remove(k8sEnvBakDir);
    await fs.remove(k8sCmpBakDir);
  } catch (error) {
    console.log("Error restoreBackups:", error);
  }
}

const main = async () => {
  await doBackups();
  await copyEnvAndCmp();
  await installDependencies();
  await koskoGenerate(process.argv.slice(2).join(" "));
  await restoreBackups();
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
})
