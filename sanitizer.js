/**
 * Sanitizer module - Detects and replaces sensitive information with dummy values
 */

class Sanitizer {
    constructor() {
        // Custom keywords for user-defined replacements
        this.customKeywords = [];

        // Patterns for detecting sensitive information
        this.patterns = {
            // Email addresses
            email: {
                regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                replacement: () => `user${Math.floor(Math.random() * 1000)}@example.com`
            },

            // API Keys (generic format) - will be applied later to avoid conflicts
            apiKey: {
                regex: /\b[A-Za-z0-9_-]{32,64}\b/g,
                replacement: () => 'sk_test_' + this.generateRandomString(32)
            },

            // AWS Access Keys
            awsAccessKey: {
                regex: /\b(AKIA[0-9A-Z]{16})\b/g,
                replacement: () => 'AKIA' + this.generateRandomString(16, 'UPPERCASE')
            },

            // AWS Secret Keys
            awsSecretKey: {
                regex: /\b[A-Za-z0-9/+=]{40}\b/g,
                replacement: () => this.generateRandomString(40, 'BASE64')
            },

            // JWT Tokens
            jwt: {
                regex: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
                replacement: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkR1bW15IFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.DUMMY_SIGNATURE_TOKEN_XXXXX'
            },

            // Private Keys (PEM format)
            privateKey: {
                regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
                replacement: () => '-----BEGIN RSA PRIVATE KEY-----\nDUMMY_PRIVATE_KEY_CONTENT_REMOVED\n-----END RSA PRIVATE KEY-----'
            },

            // Certificates (PEM format)
            certificate: {
                regex: /-----BEGIN\s+CERTIFICATE-----[\s\S]*?-----END\s+CERTIFICATE-----/g,
                replacement: () => '-----BEGIN CERTIFICATE-----\nDUMMY_CERTIFICATE_CONTENT_REMOVED\n-----END CERTIFICATE-----'
            },

            // MD5 Hash
            md5: {
                regex: /\b[a-fA-F0-9]{32}\b/g,
                replacement: () => this.generateRandomString(32, 'HEX')
            },

            // SHA-1 Hash
            sha1: {
                regex: /\b[a-fA-F0-9]{40}\b/g,
                replacement: () => this.generateRandomString(40, 'HEX')
            },

            // SHA-256 Hash
            sha256: {
                regex: /\b[a-fA-F0-9]{64}\b/g,
                replacement: () => this.generateRandomString(64, 'HEX')
            },

            // Credit Card Numbers (basic pattern)
            creditCard: {
                regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
                replacement: () => '4532-1234-5678-9010'
            },

            // Social Security Numbers (US format)
            ssn: {
                regex: /\b\d{3}-\d{2}-\d{4}\b/g,
                replacement: () => '123-45-6789'
            },

            // Phone Numbers (various formats)
            phone: {
                regex: /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
                replacement: () => '+1-555-0100'
            },

            // IPv4 Addresses (but not in URLs)
            ipv4: {
                regex: /(?:(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)/g,
                replacement: () => '192.0.2.1'
            },

            // IPv6 Addresses
            ipv6: {
                regex: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
                replacement: () => '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
            },

            // URLs with tokens/keys
            urlWithToken: {
                regex: /https?:\/\/[^\s]*[?&](token|key|api[_-]?key|access[_-]?token|auth)=[^\s&]+/gi,
                replacement: (match) => {
                    try {
                        const url = new URL(match);
                        const paramName = Array.from(url.searchParams.keys()).find(key =>
                            /token|key|api[_-]?key|access[_-]?token|auth/i.test(key)
                        );
                        if (paramName) {
                            url.searchParams.set(paramName, 'DUMMY_TOKEN_12345');
                        }
                        return url.toString();
                    } catch (e) {
                        // If URL parsing fails, do simple replacement
                        return match.replace(/([?&](?:token|key|api[_-]?key|access[_-]?token|auth)=)[^\s&]+/gi, '$1DUMMY_TOKEN_12345');
                    }
                }
            }
        };
    }

    /**
     * Generate random string based on character set
     */
    generateRandomString(length, type = 'ALPHANUMERIC') {
        let charset = '';
        switch (type) {
            case 'HEX':
                charset = '0123456789abcdef';
                break;
            case 'UPPERCASE':
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                break;
            case 'BASE64':
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                break;
            default:
                charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    /**
     * Check if content is JSON
     */
    isJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if content is YAML
     */
    isYAML(str) {
        // Basic YAML detection - must start with key: value pattern
        // Exclude URLs and other non-YAML content
        if (/^https?:\/\//i.test(str.trim())) {
            return false; // It's a URL, not YAML
        }

        // Must have YAML-like structure: keys at start of line followed by colon
        // Not just any text with a colon in it
        const lines = str.trim().split('\n');
        if (lines.length === 1) {
            // Single line - only treat as YAML if it looks like a simple key: value
            // and the value doesn't contain complex patterns like JWTs, base64, etc.
            const match = lines[0].match(/^([\w-]+):\s+(.+)$/);
            if (!match) return false;

            const value = match[2];
            // If value contains JWT patterns, base64 patterns, or other complex data, not YAML
            if (/^eyJ[A-Za-z0-9_-]+\.eyJ/.test(value)) return false; // JWT
            if (/^[A-Za-z0-9+/]{40,}={0,2}$/.test(value)) return false; // Base64
            if (/AKIA[0-9A-Z]{16}/.test(value)) return false; // AWS key

            return true;
        }

        // Multi-line - check if multiple lines have key: value pattern
        const yamlLines = lines.filter(line => line.trim() && /^[\s]*[\w-]+:\s*.+/.test(line));
        return yamlLines.length >= 2 && !this.isJSON(str);
    }

    /**
     * Sanitize JSON content
     */
    sanitizeJSON(str) {
        try {
            const obj = JSON.parse(str);
            const sanitized = this.sanitizeObject(obj);
            return JSON.stringify(sanitized, null, 2);
        } catch (e) {
            return this.sanitizePlainText(str);
        }
    }

    /**
     * Recursively sanitize object properties
     */
    sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            if (typeof obj === 'string') {
                return this.sanitizePlainText(obj);
            }
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // Check if key indicates sensitive data
            const lowerKey = key.toLowerCase();
            if (this.isSensitiveKey(lowerKey)) {
                sanitized[key] = this.getSensitiveKeyReplacement(lowerKey);
            } else if (typeof value === 'string') {
                sanitized[key] = this.sanitizePlainText(value);
            } else if (typeof value === 'object') {
                sanitized[key] = this.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    /**
     * Check if key name indicates sensitive data
     */
    isSensitiveKey(key) {
        const sensitivePatterns = [
            'password', 'passwd', 'pwd', 'pass',
            'secret', 'token', 'api_key', 'apikey', 'access_key', 'accesskey',
            'private_key', 'privatekey', 'auth', 'authorization',
            'credential', 'ssn', 'social_security',
            'credit_card', 'creditcard', 'card_number',
            'email', 'mail', 'username'
        ];

        return sensitivePatterns.some(pattern => key.includes(pattern));
    }

    /**
     * Get appropriate replacement for sensitive key
     */
    getSensitiveKeyReplacement(key) {
        if (key.includes('email') || key.includes('mail')) {
            return 'dummy.user@example.com';
        }
        if (key.includes('password') || key.includes('passwd') || key.includes('pwd') || key.includes('pass')) {
            return 'DUMMY_PASSWORD_123';
        }
        if (key.includes('token') || key.includes('key')) {
            return 'DUMMY_TOKEN_' + this.generateRandomString(16);
        }
        if (key.includes('ssn') || key.includes('social_security')) {
            return '123-45-6789';
        }
        if (key.includes('credit_card') || key.includes('card_number')) {
            return '4532-1234-5678-9010';
        }
        if (key.includes('username')) {
            return 'DUMMY_USERNAME';
        }
        return 'DUMMY_VALUE_' + this.generateRandomString(8);
    }

    /**
     * Sanitize YAML content
     */
    sanitizeYAML(str) {
        const lines = str.split('\n');
        const sanitized = lines.map(line => {
            // Check for key-value pairs
            const match = line.match(/^(\s*)([\w-]+):\s*(.+)$/);
            if (match) {
                const [, indent, key, value] = match;
                if (this.isSensitiveKey(key.toLowerCase())) {
                    return `${indent}${key}: ${this.getSensitiveKeyReplacement(key.toLowerCase())}`;
                }
                const sanitizedValue = this.sanitizePlainText(value);
                return `${indent}${key}: ${sanitizedValue}`;
            }
            return this.sanitizePlainText(line);
        });
        return sanitized.join('\n');
    }

    /**
     * Sanitize plain text content
     */
    sanitizePlainText(str) {
        if (typeof str !== 'string') return str;

        let sanitized = str;

        // Apply patterns in specific order to avoid conflicts
        // Start with most specific patterns first

        // 1. Private keys and certificates (most specific, multi-line)
        sanitized = sanitized.replace(this.patterns.privateKey.regex, this.patterns.privateKey.replacement);
        sanitized = sanitized.replace(this.patterns.certificate.regex, this.patterns.certificate.replacement);

        // 2. JWT tokens (very specific format) - MUST be before hashes and API keys
        sanitized = sanitized.replace(this.patterns.jwt.regex, this.patterns.jwt.replacement);

        // 3. URLs with tokens (must be before IP addresses to avoid breaking URLs)
        sanitized = sanitized.replace(this.patterns.urlWithToken.regex, this.patterns.urlWithToken.replacement);

        // 4. AWS keys (specific format)
        sanitized = sanitized.replace(this.patterns.awsAccessKey.regex, this.patterns.awsAccessKey.replacement);

        // 5. Hashes (specific lengths) - order matters (longest first)
        //    These will match parts of base64, so be careful
        sanitized = sanitized.replace(this.patterns.sha256.regex, this.patterns.sha256.replacement);
        sanitized = sanitized.replace(this.patterns.sha1.regex, this.patterns.sha1.replacement);
        sanitized = sanitized.replace(this.patterns.md5.regex, this.patterns.md5.replacement);

        // 6. Personal identifiable information
        sanitized = sanitized.replace(this.patterns.ssn.regex, this.patterns.ssn.replacement);
        sanitized = sanitized.replace(this.patterns.creditCard.regex, this.patterns.creditCard.replacement);
        sanitized = sanitized.replace(this.patterns.phone.regex, this.patterns.phone.replacement);

        // 7. Email addresses
        sanitized = sanitized.replace(this.patterns.email.regex, this.patterns.email.replacement);

        // 8. IP addresses (after URLs to avoid breaking them)
        sanitized = sanitized.replace(this.patterns.ipv6.regex, this.patterns.ipv6.replacement);
        sanitized = sanitized.replace(this.patterns.ipv4.regex, this.patterns.ipv4.replacement);

        return sanitized;
    }

    /**
     * Set custom keywords for replacement
     * @param {Array} keywords - Array of {keyword, replacement} objects
     */
    setCustomKeywords(keywords) {
        this.customKeywords = keywords || [];
    }

    /**
     * Apply custom keyword replacements to content
     * @param {string} content - The content to process
     * @returns {string} - Content with custom keywords replaced
     */
    applyCustomKeywords(content) {
        if (!this.customKeywords || this.customKeywords.length === 0) {
            return content;
        }

        let result = content;
        for (const item of this.customKeywords) {
            if (item.keyword && item.replacement !== undefined) {
                // Create a case-insensitive regex for replacement
                const escapedKeyword = item.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedKeyword, 'gi');
                result = result.replace(regex, item.replacement);
            }
        }
        return result;
    }

    /**
     * Main sanitization method - automatically detects format and sanitizes
     */
    sanitize(content) {
        if (!content || typeof content !== 'string') {
            return content;
        }

        // First apply custom keyword replacements
        let sanitized = this.applyCustomKeywords(content);

        // Then detect format and apply appropriate sanitization
        if (this.isJSON(sanitized)) {
            return this.sanitizeJSON(sanitized);
        } else if (this.isYAML(sanitized)) {
            return this.sanitizeYAML(sanitized);
        } else {
            return this.sanitizePlainText(sanitized);
        }
    }
}

// Export for use in different contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sanitizer;
}
