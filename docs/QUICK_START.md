# Notion CMS Quick Start Guide

Get your Ovsia V4 website connected to Notion CMS in under 10 minutes.

## Prerequisites

- Notion account
- Node.js installed
- Project repository cloned

## Step 1: Create Notion Integration (2 minutes)

1. Go to [https://www.notion.com/my-integrations](https://www.notion.com/my-integrations)
2. Click **"New integration"**
3. Name: `Ovsia V4 Website CMS`
4. Click **"Submit"**
5. **Copy the integration token** (starts with `secret_`)

## Step 2: Create Databases (3 minutes)

Create these 4 databases in your Notion workspace:

### Ventures Database
```
Database Name: Ventures
Properties:
- Name (Title)
- Status (Select: Published, Draft)
- Logo (Files & media)
- Logo Alt Text (Text)
- Stat (Text)
- Outcome (Text)
- Description (Text)
- ARR Revenue (Text)
- User Count (Text)
- Growth Rate (Text)
- Website URL (URL)
- Sort Order (Number)
```

### Capabilities Database
```
Database Name: Capabilities
Properties:
- Title (Title)
- Subtitle (Text)
- Description (Text)
- Features (Multi-select)
- Examples (Multi-select)
- Technologies (Multi-select)
- Sort Order (Number)
- Status (Select: Active, Inactive)
```

### Site Copy Database
```
Database Name: Site Copy
Properties:
- Section Name (Title)
- Content Type (Select: Heading, Subheading, Body, Button)
- Primary Text (Text)
- Secondary Text (Text)
- Button Text (Text)
- Status (Select: Published, Draft)
- Last Updated (Last edited time)
```

### Assets Database
```
Database Name: Assets
Properties:
- Name (Title)
- Asset Type (Select: Logo, Image, Icon)
- File (Files & media)
- Alt Text (Text)
- Usage Context (Multi-select)
- Status (Select: Active, Inactive)
```

## Step 3: Share Databases (1 minute)

For each database:
1. Click **"Share"** button
2. Add your integration: `Ovsia V4 Website CMS`
3. Grant **"Full access"**

## Step 4: Get Database IDs (2 minutes)

For each database:
1. Copy the database URL
2. Extract the 32-character ID from the URL
   - URL: `https://notion.so/workspace/DATABASE_ID?v=view_id`
   - ID: The 32-character string after workspace name

## Step 5: Configure Environment (1 minute)

1. Copy `.env.example` to `.env.local`
2. Fill in your values:

```bash
NOTION_TOKEN=secret_your_token_here
NOTION_VENTURES_DB_ID=your_ventures_db_id
NOTION_CAPABILITIES_DB_ID=your_capabilities_db_id
NOTION_SITE_COPY_DB_ID=your_site_copy_db_id
NOTION_ASSETS_DB_ID=your_assets_db_id
```

## Step 6: Test Connection (1 minute)

```bash
npm run dev
```

Look for these success messages:
- ✅ `Notion API connection successful`
- ✅ `Content fetched successfully`
- ✅ `All databases accessible`

## Step 7: Add Sample Content (Optional)

### Sample Venture Entry:
```
Name: Violca
Status: Published
Logo: [Upload logo]
Logo Alt Text: Violca fintech platform logo
Stat: ×5 ROI Achievement
Outcome: Scaled from MVP to market leader in 18 months
Description: Revolutionary fintech platform transforming payments
ARR Revenue: $10M ARR achieved
User Count: 100K+ active users
Growth Rate: 300% YoY growth
Website URL: https://violca.com
Sort Order: 1
```

### Sample Capability Entry:
```
Title: Strategy
Subtitle: Vision to Action
Description: We transform bold visions into executable strategies that drive measurable results.
Features: Market Analysis, Business Model Design, Go-to-Market Strategy
Examples: Series A Funding Strategy, Market Entry Planning
Technologies: Strategic Planning, Market Research, Competitive Analysis
Sort Order: 1
Status: Active
```

### Sample Site Copy Entry:
```
Section Name: Hero
Content Type: Heading
Primary Text: Transforming Ideas into Reality
Secondary Text: Where vision meets execution through strategic partnerships
Button Text: Start Your Journey
Status: Published
```

## Troubleshooting

### ❌ "Integration not found"
- Check your `NOTION_TOKEN` in `.env.local`
- Ensure token starts with `secret_`

### ❌ "Database not accessible"
- Share each database with your integration
- Grant "Full access" permissions

### ❌ "Invalid database ID"
- Verify database IDs are exactly 32 characters
- Copy IDs directly from Notion URLs

### ❌ "Content not loading"
- Check console for detailed error messages
- Verify database property names match exactly
- Ensure at least one entry has Status = "Published"

## Next Steps

- Read the full [Notion Setup Guide](./NOTION_SETUP.md) for detailed configuration
- Learn about [content management best practices](./NOTION_SETUP.md#best-practices)
- Set up staging and production environments

## Support

- Check application logs for detailed error messages
- Verify environment variables are set correctly
- Review database permissions and sharing settings

**Need help?** Create an issue in the project repository or contact the development team.

---

*Setup time: ~10 minutes*
*Difficulty: Beginner*