# Security Guidelines

## 🚨 API Key Security

### Current Security Status
- **RESOLVED**: Hardcoded API keys have been moved to environment variables
- **CRITICAL**: The exposed Context7 API key `7c6c26f1-c7ec-4cf0-96a8-1a4e48004d4e` from commit 647c510 must be revoked immediately

### Required Immediate Actions

#### 1. Revoke Exposed API Key
The Context7 API key `7c6c26f1-c7ec-4cf0-96a8-1a4e48004d4e` exposed in commit 647c510 and PR #11 must be:
- **Immediately revoked** in the Context7 dashboard
- **Replaced with a new key** for continued functionality
- **Never used again** as it's permanently compromised

#### 2. Update Your Environment
1. Copy the appropriate `.env.example` file to `.env` in your module directory:
   ```bash
   # For 05-agents-tools
   cp 05-agents-tools/.env.example 05-agents-tools/.env
   
   # For 06-agents-mcps
   cp 06-agents-mcps/.env.example 06-agents-mcps/.env
   ```

2. Add your actual API keys to the `.env` file
3. Never commit the `.env` file to version control

### Best Practices

#### Environment Variable Management
- ✅ Use environment variables for all sensitive data
- ✅ Use `.env` files for local development
- ✅ Use cloud provider secret management for production
- ✅ Different keys for different environments (dev, staging, prod)
- ✅ Regular key rotation (monthly or quarterly)

#### Development Security
- ✅ Never hardcode API keys in source code
- ✅ Never commit `.env` files to version control
- ✅ Use `.env.example` files for team guidance
- ✅ Implement pre-commit hooks to prevent accidental commits
- ✅ Use secret scanning tools in CI/CD

#### Code Review Security
- ✅ Always review code for hardcoded secrets
- ✅ Check PR descriptions for accidentally pasted keys
- ✅ Use automated secret scanning in PRs
- ✅ Reject PRs containing any credentials

### Git History Cleanup (Optional)

If you want to remove the API key from git history (advanced):

#### Option 1: BFG Repo-Cleaner (Recommended)
```bash
# Install BFG
java -jar bfg.jar --replace-text passwords.txt --no-blob-protection .git

# Create passwords.txt with:
# 7c6c26f1-c7ec-4cf0-96a8-1a4e48004d4e
```

#### Option 2: Git Filter-Branch
```bash
git filter-branch --tree-filter 'find . -name "*.ts" -exec sed -i "s/7c6c26f1-c7ec-4cf0-96a8-1a4e48004d4e/REDACTED/g" {} \;' HEAD
```

**⚠️ Warning**: History rewriting affects all contributors and requires force-pushing.

### Pre-commit Hook Setup

Add this to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Check for potential API keys
if grep -r "sk-\|pk_\|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" --include="*.ts" --include="*.js" --include="*.json" .; then
    echo "❌ Potential API key detected. Commit rejected."
    exit 1
fi
```

### Secret Scanning Tools

#### GitHub Secret Scanning
- Already enabled for public repositories
- Automatically detects common API key patterns
- Sends alerts for detected secrets

#### Additional Tools
- **TruffleHog**: `trufflesecurity/trufflehog`
- **GitLeaks**: `zricethezav/gitleaks`
- **Detect-secrets**: `Yelp/detect-secrets`

### Environment-Specific Security

#### Development
- Use `.env` files (ignored by git)
- Separate keys from production
- Regular rotation not critical

#### Staging/Production
- Use cloud provider secret management
- AWS Secrets Manager, Azure Key Vault, etc.
- Automatic rotation where possible
- Audit logging enabled

### Incident Response

If you suspect an API key has been exposed:

1. **Immediate**: Revoke the key
2. **Urgent**: Generate a new key
3. **Review**: Check all usage logs
4. **Monitor**: Watch for unauthorized usage
5. **Document**: Record the incident for future prevention

### Contact

For security concerns or questions:
- Create an issue with the `security` label
- Email: [security contact if available]
- Reference: [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

### Compliance

This project follows security best practices for:
- API key management
- Source code security
- CI/CD security
- Dependency management

---

**Remember**: Security is everyone's responsibility. When in doubt, err on the side of caution. 