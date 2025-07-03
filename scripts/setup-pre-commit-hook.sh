#!/bin/bash

# Setup pre-commit hook for API key detection
# This script creates a pre-commit hook that prevents API keys from being committed

HOOK_FILE=".git/hooks/pre-commit"

echo "Setting up pre-commit hook for API key detection..."

# Create the pre-commit hook
cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# Pre-commit hook to check for API keys and secrets

echo "🔍 Checking for API keys and secrets..."

# Check for common API key patterns
if grep -r "sk-\|pk_\|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null; then
    echo "❌ Potential API key detected in source code!"
    echo "Please use environment variables instead."
    echo "See SECURITY.md for more information."
    exit 1
fi

# Check for the specific exposed Context7 key
if grep -r "7c6c26f1-c7ec-4cf0-96a8-1a4e48004d4e" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null; then
    echo "❌ Exposed Context7 API key found!"
    echo "This key was compromised and should not be used."
    echo "Please revoke this key immediately."
    exit 1
fi

# Check for .env files being committed
if git diff --cached --name-only | grep -E "\.env$" 2>/dev/null; then
    echo "❌ .env files should not be committed!"
    echo "Please remove .env files from the commit."
    echo "Use .env.example files for team guidance."
    exit 1
fi

# Check for hardcoded localhost URLs or development configs
if grep -r "localhost\|127\.0\.0\.1" --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | grep -v "example\|comment\|//\|#"; then
    echo "⚠️ Warning: Hardcoded localhost URLs detected."
    echo "Consider using environment variables for URLs."
fi

echo "✅ Security check passed!"
exit 0
EOF

# Make the hook executable
chmod +x "$HOOK_FILE"

echo "✅ Pre-commit hook installed successfully!"
echo "The hook will now check for API keys before each commit."
echo ""
echo "To test the hook, run:"
echo "  git commit --allow-empty -m 'Test commit'"
echo ""
echo "To bypass the hook (not recommended), use:"
echo "  git commit --no-verify" 