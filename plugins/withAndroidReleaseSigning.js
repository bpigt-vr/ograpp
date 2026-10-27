/**
 * Config plugin: keeps Android release signing reproducible across `expo prebuild`.
 *
 * - Reads android/keystore.properties when present (real upload key)
 * - Falls back to the debug key so preview builds stay installable
 * - Trims Gradle memory for CI / low-RAM builders
 */
const { withAppBuildGradle, withGradleProperties, createRunOncePlugin } = require('@expo/config-plugins');

const SIGNING_BLOCK = `
// Added by plugins/withAndroidReleaseSigning.js — do not edit in generated files.
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
def hasReleaseKeystore = keystorePropertiesFile.exists()
if (hasReleaseKeystore) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
`;

function withSigningConfig(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error('withAndroidReleaseSigning expects a Groovy build.gradle');
    }
    let contents = cfg.modResults.contents;
    if (!contents.includes('hasReleaseKeystore')) {
      contents = contents.replace(
        'apply plugin: "com.facebook.react"',
        `apply plugin: "com.facebook.react"\n${SIGNING_BLOCK}`
      );

      contents = contents.replace(/(signingConfigs \{\n)([\s\S]*?)(\n\s*\})/, (match, open, body, close) => {
        if (body.includes('release {')) return match;
        return `${open}${body}
        if (hasReleaseKeystore) {
            release {
                storeFile file(keystoreProperties['storeFile'] ?: 'ogr-release.jks')
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }${close}`;
      });

      contents = contents.replace(
        /(\n\s*release \{\n)([\s\S]*?)(signingConfig signingConfigs\.debug)/,
        (match, open, body, sig) => {
          if (body.includes('hasReleaseKeystore')) return match;
          return `${open}${body}// Real upload key when configured; debug-signed preview otherwise.
            if (hasReleaseKeystore) {
                signingConfig signingConfigs.release
            } else {
                ${sig}
            }//`;
        }
      );
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
}

function withBuildMemory(config) {
  return withGradleProperties(config, (cfg) => {
    const set = (key, value) => {
      cfg.modResults = cfg.modResults.filter((item) => item.key !== key);
      cfg.modResults.push({ type: 'property', key, value });
    };
    set('org.gradle.jvmargs', '-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8');
    set('org.gradle.workers.max', '2');
    set('org.gradle.parallel', 'true');
    return cfg;
  });
}

function withAndroidReleaseSigning(config) {
  config = withSigningConfig(config);
  config = withBuildMemory(config);
  return config;
}

module.exports = createRunOncePlugin(
  withAndroidReleaseSigning,
  'withAndroidReleaseSigning',
  '1.0.0'
);
