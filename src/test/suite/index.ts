import * as path from 'path';
import Mocha from 'mocha';
import * as glob from 'glob';

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 10000 // Increase timeout for VSCode extension tests
  });

  const testsRoot = path.resolve(__dirname, '.');

  try {
    // Find all test files
    const files = await glob.glob('**/*.test.js', { cwd: testsRoot });

    // Add files to the test suite
    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

    // Run the mocha test
    await new Promise<void>((resolve, reject) => {
      try {
        // Run mocha
        mocha.run((failures: number) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        console.error('Failed to run mocha tests:', err);
        reject(err);
      }
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    throw err;
  }
}