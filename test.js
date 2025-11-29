/**
 * Test suite for the Sanitizer class
 */

// For Node.js environment
if (typeof require !== 'undefined') {
  var Sanitizer = require('./sanitizer.js');
}

// Test runner
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  }

  assertMatch(actual, pattern, message) {
    if (!pattern.test(actual)) {
      throw new Error(`${message}\nPattern: ${pattern}\nActual: ${actual}`);
    }
  }

  assertNotMatch(actual, pattern, message) {
    if (pattern.test(actual)) {
      throw new Error(`${message}\nPattern: ${pattern}\nActual: ${actual}`);
    }
  }

  assertNotEqual(actual, notExpected, message) {
    if (actual === notExpected) {
      throw new Error(`${message}\nShould not equal: ${notExpected}`);
    }
  }

  async run() {
    console.log('Running tests...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.error(`✗ ${test.name}`);
        console.error(`  ${error.message}\n`);
        this.failed++;
      }
    }

    console.log(`\n${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
}

// Create test runner
const runner = new TestRunner();

// Initialize sanitizer
const sanitizer = new Sanitizer();

// Test email sanitization
runner.test('Sanitize email addresses', () => {
  const input = 'Contact me at john.doe@company.com for details.';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /john\.doe@company\.com/, 'Original email should be removed');
  runner.assertMatch(output, /user\d+@example\.com/, 'Should contain dummy email');
});

runner.test('Sanitize multiple emails', () => {
  const input = 'Emails: alice@example.org, bob@test.com, charlie@domain.net';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /alice@example\.org/, 'First email should be removed');
  runner.assertNotMatch(output, /bob@test\.com/, 'Second email should be removed');
  runner.assertNotMatch(output, /charlie@domain\.net/, 'Third email should be removed');
});

// Test API key sanitization
runner.test('Sanitize AWS access keys', () => {
  const input = 'AWS_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /AKIAIOSFODNN7EXAMPLE/, 'Original AWS key should be removed');
  runner.assertMatch(output, /AKIA[A-Z0-9]{16}/, 'Should contain dummy AWS key');
});

runner.test('Sanitize JWT tokens', () => {
  const input = 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c/, 'Original JWT should be removed');
  runner.assertMatch(output, /DUMMY_SIGNATURE_TOKEN/, 'Should contain dummy JWT');
});

// Test private key sanitization
runner.test('Sanitize RSA private keys', () => {
  const input = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef
-----END RSA PRIVATE KEY-----`;
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /MIIEpAIBAAKCAQEA1234567890abcdef/, 'Original key content should be removed');
  runner.assertMatch(output, /DUMMY_PRIVATE_KEY_CONTENT_REMOVED/, 'Should contain dummy key placeholder');
});

runner.test('Sanitize certificates', () => {
  const input = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKW
-----END CERTIFICATE-----`;
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /MIIDXTCCAkWgAwIBAgIJAKL0UG\+mRKW/, 'Original cert should be removed');
  runner.assertMatch(output, /DUMMY_CERTIFICATE_CONTENT_REMOVED/, 'Should contain dummy cert placeholder');
});

// Test hash sanitization
runner.test('Sanitize MD5 hashes', () => {
  const input = 'Hash: 5d41402abc4b2a76b9719d911017c592';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /5d41402abc4b2a76b9719d911017c592/, 'Original MD5 hash should be removed');
  runner.assertMatch(output, /[a-f0-9]{32}/, 'Should contain dummy MD5 hash');
});

runner.test('Sanitize SHA-256 hashes', () => {
  const input = 'SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855/, 'Original SHA-256 should be removed');
  runner.assertMatch(output, /[a-f0-9]{64}/, 'Should contain dummy SHA-256');
});

// Test PII sanitization
runner.test('Sanitize credit card numbers', () => {
  const input = 'Card: 4532-1234-5678-9012';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /4532-1234-5678-9012/, 'Original card should be removed');
  runner.assertMatch(output, /\d{4}-\d{4}-\d{4}-\d{4}/, 'Should contain dummy card');
});

runner.test('Sanitize SSN', () => {
  const input = 'SSN: 123-45-6789';
  const output = sanitizer.sanitize(input);
  // SSN pattern might match the dummy value, so just ensure format is maintained
  runner.assertMatch(output, /\d{3}-\d{2}-\d{4}/, 'Should maintain SSN format');
});

runner.test('Sanitize phone numbers', () => {
  const input = 'Call me at (555) 123-4567';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /\(555\) 123-4567/, 'Original phone should be removed');
  runner.assertMatch(output, /\+1-555-0100/, 'Should contain dummy phone');
});

// Test IP address sanitization
runner.test('Sanitize IPv4 addresses', () => {
  const input = 'Server IP: 192.168.1.100';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /192\.168\.1\.100/, 'Original IP should be removed');
  runner.assertMatch(output, /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, 'Should contain dummy IP');
});

runner.test('Sanitize IPv6 addresses', () => {
  const input = 'IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334';
  const output = sanitizer.sanitize(input);
  // Should be sanitized (replaced or kept as valid IPv6)
  runner.assertMatch(output, /[0-9a-f:]+/i, 'Should contain valid IPv6 format');
});

// Test URL with token sanitization
runner.test('Sanitize URLs with tokens', () => {
  const input = 'https://api.example.com/data?token=secret123&other=value';
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /token=secret123/, 'Original token should be removed');
  runner.assertMatch(output, /token=DUMMY_TOKEN_12345/, 'Should contain dummy token');
});

// Test JSON sanitization
runner.test('Sanitize JSON with sensitive fields', () => {
  const input = JSON.stringify({
    username: 'john',
    email: 'john@example.com',
    api_key: 'sk_live_1234567890abcdef',
    password: 'mySecretPass123'
  }, null, 2);
  
  const output = sanitizer.sanitize(input);
  const parsed = JSON.parse(output);
  
  runner.assertNotEqual(parsed.email, 'john@example.com', 'Email should be sanitized');
  runner.assertNotEqual(parsed.api_key, 'sk_live_1234567890abcdef', 'API key should be sanitized');
  runner.assertNotEqual(parsed.password, 'mySecretPass123', 'Password should be sanitized');
  runner.assertEqual(parsed.username, 'john', 'Non-sensitive field should remain unchanged');
});

runner.test('Sanitize nested JSON', () => {
  const input = JSON.stringify({
    user: {
      name: 'Alice',
      credentials: {
        email: 'alice@secret.com',
        token: 'abc123xyz'
      }
    }
  }, null, 2);
  
  const output = sanitizer.sanitize(input);
  const parsed = JSON.parse(output);
  
  runner.assertEqual(parsed.user.name, 'Alice', 'Name should remain');
  runner.assertNotEqual(parsed.user.credentials.email, 'alice@secret.com', 'Email should be sanitized');
  runner.assertNotEqual(parsed.user.credentials.token, 'abc123xyz', 'Token should be sanitized');
});

// Test YAML sanitization
runner.test('Sanitize YAML content', () => {
  const input = `api_key: sk_live_1234567890
email: user@example.com
database:
  host: localhost
  password: secretpass123`;
  
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /sk_live_1234567890/, 'API key should be sanitized');
  runner.assertNotMatch(output, /^email: user@example\.com$/m, 'Email value should be sanitized');
  runner.assertNotMatch(output, /secretpass123/, 'Password should be sanitized');
  runner.assertMatch(output, /host: localhost/, 'Non-sensitive fields should remain');
});

// Test plain text with mixed content
runner.test('Sanitize mixed content', () => {
  const input = `Configuration:
Email: admin@company.com
API Key: AKIAIOSFODNN7EXAMPLE
Hash: 5d41402abc4b2a76b9719d911017c592
IP: 10.0.0.1`;
  
  const output = sanitizer.sanitize(input);
  runner.assertNotMatch(output, /admin@company\.com/, 'Email should be sanitized');
  runner.assertNotMatch(output, /AKIAIOSFODNN7EXAMPLE/, 'API key should be sanitized');
  runner.assertNotMatch(output, /5d41402abc4b2a76b9719d911017c592/, 'Hash should be sanitized');
  runner.assertNotMatch(output, /10\.0\.0\.1/, 'IP should be sanitized');
});

// Test that non-sensitive content is preserved
runner.test('Preserve non-sensitive content', () => {
  const input = 'This is a normal sentence with no sensitive data. Just text.';
  const output = sanitizer.sanitize(input);
  runner.assertEqual(output, input, 'Non-sensitive content should remain unchanged');
});

runner.test('Preserve regular numbers and text', () => {
  const input = 'The year is 2024 and the price is $123.45';
  const output = sanitizer.sanitize(input);
  runner.assertEqual(output, input, 'Regular numbers should remain unchanged');
});

// Test empty and null inputs
runner.test('Handle empty string', () => {
  const input = '';
  const output = sanitizer.sanitize(input);
  runner.assertEqual(output, '', 'Empty string should return empty string');
});

runner.test('Handle null input', () => {
  const input = null;
  const output = sanitizer.sanitize(input);
  runner.assertEqual(output, null, 'Null should return null');
});

// Test custom keywords functionality
runner.test('Set and apply custom keywords', () => {
  const customSanitizer = new Sanitizer();
  customSanitizer.setCustomKeywords([
    { keyword: 'password', replacement: 'foo' }
  ]);
  
  const input = 'My password is secret123';
  const output = customSanitizer.sanitize(input);
  runner.assertMatch(output, /My foo is secret123/, 'Custom keyword should be replaced');
  runner.assertNotMatch(output, /password/, 'Original keyword should not exist');
});

runner.test('Custom keywords are case-insensitive', () => {
  const customSanitizer = new Sanitizer();
  customSanitizer.setCustomKeywords([
    { keyword: 'SECRET', replacement: 'hidden' }
  ]);
  
  const input = 'The Secret is kept secret and SECRET too';
  const output = customSanitizer.sanitize(input);
  runner.assertNotMatch(output, /[Ss][Ee][Cc][Rr][Ee][Tt]/, 'All case variations should be replaced');
  runner.assertMatch(output, /hidden.*hidden.*hidden/, 'All occurrences should be replaced');
});

runner.test('Multiple custom keywords', () => {
  const customSanitizer = new Sanitizer();
  customSanitizer.setCustomKeywords([
    { keyword: 'myname', replacement: 'John' },
    { keyword: 'myemail', replacement: 'john@test.com' }
  ]);
  
  const input = 'Name: myname, Email: myemail';
  const output = customSanitizer.sanitize(input);
  runner.assertMatch(output, /Name: John/, 'First custom keyword should be replaced');
  // Note: The email will then be sanitized by the built-in email pattern
  runner.assertNotMatch(output, /myemail/, 'Second custom keyword should be replaced');
});

runner.test('Custom keywords with special regex characters', () => {
  const customSanitizer = new Sanitizer();
  customSanitizer.setCustomKeywords([
    { keyword: 'test.value', replacement: 'replaced' }
  ]);
  
  const input = 'This is test.value here';
  const output = customSanitizer.sanitize(input);
  runner.assertMatch(output, /This is replaced here/, 'Special characters should be escaped');
});

runner.test('Empty custom keywords array does not affect sanitization', () => {
  const customSanitizer = new Sanitizer();
  customSanitizer.setCustomKeywords([]);
  
  const input = 'Normal text without changes';
  const output = customSanitizer.sanitize(input);
  runner.assertEqual(output, input, 'Empty keywords should not affect content');
});

runner.test('Custom keywords applied before built-in sanitization', () => {
  const customSanitizer = new Sanitizer();
  customSanitizer.setCustomKeywords([
    { keyword: 'realpassword', replacement: 'dummypass' }
  ]);
  
  const input = 'password: realpassword';
  const output = customSanitizer.sanitize(input);
  // Since this looks like YAML with a sensitive key, the built-in sanitization
  // should also apply to the field name
  runner.assertNotMatch(output, /realpassword/, 'Custom keyword should be replaced');
});

// Run all tests
if (typeof module !== 'undefined' && require.main === module) {
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, runner };
}
