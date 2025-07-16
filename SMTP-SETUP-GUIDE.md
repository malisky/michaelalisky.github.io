

```bash
# 1. Convert newsletter to email format
node newsletter-to-email.js baden.html

# 2. Test email connection
node email-sender.js test

# 3. Send to subscribers
node email-sender.js send baden-email.html "Baden Backroads"
```