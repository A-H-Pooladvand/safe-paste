# Safe Paste

A Chrome extension that automatically sanitizes pasted content by replacing sensitive information with dummy values.

## Features

Safe Paste protects you from accidentally pasting sensitive information by automatically detecting and replacing:

### 🔐 Security Credentials
- **API Keys** - Generic and service-specific API keys
- **AWS Access Keys** - AKIA format keys
- **AWS Secret Keys** - Base64 encoded secrets  
- **JWT Tokens** - JSON Web Tokens (eyJ... format)
- **Certificates** - PEM format certificates
- **Private Keys** - RSA and other private keys in PEM format

### 🔢 Hashes
- **MD5** - 32 character hexadecimal
- **SHA-1** - 40 character hexadecimal
- **SHA-256** - 64 character hexadecimal

### 👤 Personal Information
- **Email Addresses** - user@domain.com format
- **Credit Card Numbers** - Various formats with/without hyphens
- **Social Security Numbers** - XXX-XX-XXXX format (US)
- **Phone Numbers** - Various international formats

### 🌐 Network Information
- **IPv4 Addresses** - 192.168.x.x format
- **IPv6 Addresses** - Full IPv6 format
- **URLs with Tokens** - URLs containing token/key/auth parameters

### 📄 Supported Formats
- **Plain Text** - Any unstructured text content
- **JSON** - Structured JSON with nested objects
- **YAML** - Configuration files
- **XML** - Markup documents

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the repository directory

## Usage

Once installed, Safe Paste works automatically:

1. **Copy** any content containing sensitive information
2. **Paste** anywhere - the extension automatically sanitizes it
3. **See notification** - A green notification confirms sanitization occurred

### Enable/Disable

Click the Safe Paste icon in your Chrome toolbar to:
- Toggle protection on/off
- View list of protected data types
- See supported formats
- Access Custom Keywords Settings

### Custom Keywords

You can define your own keywords and replacement values:

1. Click the Safe Paste icon in your Chrome toolbar
2. Click "Custom Keywords Settings" or right-click the extension and select "Options"
3. Add a keyword (e.g., "password") and its replacement (e.g., "foo")
4. When you paste text containing the keyword, it will be automatically replaced

Custom keywords are:
- Case-insensitive (matches "Password", "PASSWORD", "password", etc.)
- Applied before built-in sanitization patterns
- Stored locally in your browser

## Examples

### Plain Text
```
Before: My email is john.doe@company.com
After:  My email is user123@example.com
```

### JSON
```json
Before:
{
  "email": "admin@company.com",
  "api_key": "sk_live_1234567890abcdef",
  "password": "mySecretPass"
}

After:
{
  "email": "dummy.user@example.com",
  "api_key": "DUMMY_TOKEN_abc123xyz",
  "password": "DUMMY_PASSWORD_123"
}
```

### YAML
```yaml
Before:
api_key: sk_live_1234567890
email: user@example.com
password: secretpass123

After:
api_key: DUMMY_TOKEN_abc123xyz
email: dummy.user@example.com
password: DUMMY_PASSWORD_123
```

## How It Works

1. **Intercepts Paste Events** - Content script captures paste events
2. **Detects Format** - Identifies JSON, YAML, or plain text
3. **Pattern Matching** - Uses regex patterns to find sensitive data
4. **Smart Replacement** - Replaces with realistic dummy values
5. **Seamless Insertion** - Inserts sanitized content naturally

## Privacy

- **All processing is local** - No data is sent to external servers
- **No storage** - Pasted content is not saved or logged
- **No tracking** - Extension doesn't track your usage
- **Open source** - Full source code available for review

## Development

### Running Tests

```bash
node test.js
```

All 28 tests should pass.

### Project Structure

```
safe-paste/
├── manifest.json      # Extension configuration
├── content.js         # Content script (paste interception)
├── sanitizer.js       # Core sanitization logic
├── popup.html         # Extension popup UI
├── popup.js           # Popup functionality
├── options.html       # Custom keywords settings page
├── options.js         # Options page functionality
├── test.js            # Test suite
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

### Adding New Patterns

To detect new sensitive data types:

1. Add pattern to `patterns` object in `sanitizer.js`
2. Add replacement function
3. Add to sanitization order in `sanitizePlainText()`
4. Add test case in `test.js`

## License

MIT License - Feel free to use and modify

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Security

If you discover a security vulnerability, please email the maintainers directly rather than opening a public issue.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

