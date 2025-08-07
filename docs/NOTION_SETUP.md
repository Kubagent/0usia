# Notion CMS Setup Guide

This guide will help you set up Notion as a content management system for your Ovsia V4 website.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Notion Integration Setup](#notion-integration-setup)
4. [Database Structure](#database-structure)
5. [Environment Configuration](#environment-configuration)
6. [Content Management](#content-management)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Overview

The Ovsia V4 website uses Notion as a headless CMS to manage:
- **Ventures**: Portfolio companies and their success metrics
- **Capabilities**: Core service offerings and their details
- **Site Copy**: Text content for different sections of the website
- **Assets**: Images, logos, and other media files

## Prerequisites

- Notion account (free or paid)
- Admin access to your Notion workspace
- Basic understanding of Notion databases
- Development environment with Node.js

## Notion Integration Setup

### Step 1: Create a Notion Integration

1. Visit [https://www.notion.com/my-integrations](https://www.notion.com/my-integrations)
2. Click "New integration"
3. Fill in the integration details:
   - **Name**: `Ovsia V4 Website CMS`
   - **Logo**: Upload your company logo (optional)
   - **Associated workspace**: Select your workspace
4. Click "Submit"
5. Copy the **Internal Integration Token** (starts with `secret_`)

### Step 2: Create Notion Databases

You need to create four databases in your Notion workspace. Follow the structure below for each database.

## Database Structure

### 1. Ventures Database

**Database Name**: `Ventures`
**Purpose**: Store portfolio company information and success metrics

| Property Name | Type | Description | Example |
|---------------|------|-------------|---------|
| Name | Title | Company name | "Violca" |
| Status | Select | Publication status | "Published", "Draft", "Archived" |
| Logo | Files & media | Company logo | Upload image file |
| Logo Alt Text | Text | Accessibility text for logo | "Violca company logo" |
| Stat | Text | Key achievement metric | "×5 ROI" |
| Outcome | Text | Main success story | "Scaled from MVP to market leader" |
| Description | Text | Brief company description | "Revolutionary fintech platform" |
| ARR Revenue | Text | Annual recurring revenue | "$10M ARR" |
| User Count | Text | Number of users | "100K+ active users" |
| Growth Rate | Text | Year-over-year growth | "300% YoY growth" |
| Website URL | URL | Company website | https://example.com |
| Sort Order | Number | Display order | 1, 2, 3... |

**Sample Entry**:
```
Name: Violca
Status: Published
Logo: [Upload company logo]
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

### 2. Capabilities Database

**Database Name**: `Capabilities`
**Purpose**: Store service offerings and their details

| Property Name | Type | Description | Example |
|---------------|------|-------------|---------|
| Title | Title | Capability name | "Strategy" |
| Subtitle | Text | Capability tagline | "Vision to Action" |
| Description | Text | Brief description | "We transform bold visions..." |
| Features | Multi-select | Key features | "Market Analysis", "Business Model Design" |
| Examples | Multi-select | Example projects | "Series A Funding Strategy" |
| Technologies | Multi-select | Technologies used | "Strategic Planning", "Market Research" |
| Sort Order | Number | Display order | 1, 2, 3... |
| Status | Select | Active status | "Active", "Inactive" |

**Multi-select Options Setup**:

For **Features**:
- Market Analysis
- Business Model Design
- Go-to-Market Strategy
- Machine Learning
- Data Engineering
- AI Infrastructure
- Investment Strategy
- Network Access
- Growth Capital

For **Examples**:
- Series A Funding Strategy
- Market Entry Planning
- Predictive Analytics
- Process Automation
- Seed Investment
- Series A Support

For **Technologies**:
- Strategic Planning
- Market Research
- Competitive Analysis
- TensorFlow
- PyTorch
- MLOps
- Financial Modeling
- Due Diligence
- Portfolio Management

**Sample Entry**:
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

### 3. Site Copy Database

**Database Name**: `Site Copy`
**Purpose**: Store text content for different website sections

| Property Name | Type | Description | Example |
|---------------|------|-------------|---------|
| Section Name | Title | Website section | "Hero", "Essence", "Capabilities" |
| Content Type | Select | Type of content | "Heading", "Subheading", "Body", "Button" |
| Primary Text | Text | Main text content | "From 0 → 1, We Make Essence Real." |
| Secondary Text | Text | Supporting text | "Where vision becomes reality" |
| Button Text | Text | Button label (if applicable) | "Get Started" |
| Status | Select | Publication status | "Published", "Draft" |
| Last Updated | Last edited time | Auto-generated | (automatic) |

**Content Type Options**:
- Heading
- Subheading  
- Body
- Button
- Meta

**Section Name Options**:
- Hero
- Essence
- Capabilities
- Proof
- CTA
- Footer

**Sample Entries**:
```
Section Name: Hero
Content Type: Heading
Primary Text: Transforming Ideas into Reality
Secondary Text: Where vision meets execution through strategic partnerships
Button Text: Start Your Journey
Status: Published

Section Name: Essence
Content Type: Heading
Primary Text: From 0 → 1, We Make Essence Real.
Secondary Text: Where vision becomes reality through strategic action
Button Text: 
Status: Published
```

### 4. Assets Database

**Database Name**: `Assets`
**Purpose**: Store and manage media assets

| Property Name | Type | Description | Example |
|---------------|------|-------------|---------|
| Name | Title | Asset name | "Company Logo" |
| Asset Type | Select | Type of asset | "Logo", "Image", "Icon" |
| File | Files & media | The actual file | Upload file |
| Alt Text | Text | Accessibility text | "Ovsia company logo" |
| Usage Context | Multi-select | Where it's used | "Header", "Footer", "Venture" |
| Status | Select | Active status | "Active", "Inactive" |

**Asset Type Options**:
- Logo
- Image
- Icon
- Document
- Video

**Usage Context Options**:
- Header
- Footer
- Hero
- Venture
- Capability
- Background

## Environment Configuration

### Step 1: Share Databases with Integration

For each database you created:

1. Open the database in Notion
2. Click the "Share" button (top right)
3. Click "Add people, emails, groups, or integrations"
4. Search for your integration name (`Ovsia V4 Website CMS`)
5. Select it and ensure it has "Full access"
6. Click "Invite"

### Step 2: Get Database IDs

For each database:

1. Open the database in Notion
2. Copy the URL from your browser
3. The database ID is the 32-character string in the URL
   - Format: `https://www.notion.so/{workspace}/{database-id}?v={view-id}`
   - Example: `https://www.notion.so/myworkspace/a1b2c3d4e5f6...` 
   - Database ID: `a1b2c3d4e5f6...` (32 characters)

### Step 3: Environment Variables

Create a `.env.local` file in your project root:

```bash
# Notion API Configuration
NOTION_TOKEN=secret_your_integration_token_here
NOTION_VENTURES_DB_ID=your_ventures_database_id_here
NOTION_CAPABILITIES_DB_ID=your_capabilities_database_id_here
NOTION_SITE_COPY_DB_ID=your_site_copy_database_id_here
NOTION_ASSETS_DB_ID=your_assets_database_id_here

# Optional Configuration
NOTION_CACHE_ENABLED=true
NOTION_CACHE_TTL=3600000
NOTION_FALLBACK_ENABLED=true
NOTION_BUILD_VALIDATION=true
```

### Step 4: Verify Setup

Run the setup verification command:

```bash
npm run dev
```

Check the console logs for:
- ✅ Notion API connection successful
- ✅ All databases accessible
- ✅ Content fetched successfully

## Content Management

### Adding New Ventures

1. Open the Ventures database in Notion
2. Click "New" to create a new entry
3. Fill in all required fields:
   - **Name**: Company name
   - **Status**: Set to "Published" when ready
   - **Logo**: Upload company logo (PNG/JPG recommended)
   - **Logo Alt Text**: Descriptive text for accessibility
   - **Stat**: Key metric (e.g., "×5 ROI", "300% Growth")
   - **Outcome**: Success story summary
   - **Description**: Brief company description
   - **Metrics**: Fill in ARR, users, growth rate
   - **Website URL**: Company website
   - **Sort Order**: Number for display order

### Managing Capabilities

1. Open the Capabilities database
2. Create new entries or edit existing ones
3. Use multi-select properties to categorize:
   - **Features**: Core features of the capability
   - **Examples**: Example projects or use cases
   - **Technologies**: Tools and technologies used
4. Set **Sort Order** to control display sequence
5. Set **Status** to "Active" when ready to publish

### Updating Site Copy

1. Open the Site Copy database
2. Find the section you want to update
3. Edit the text content:
   - **Primary Text**: Main heading or content
   - **Secondary Text**: Subheading or supporting text
   - **Button Text**: Call-to-action text (if applicable)
4. Set **Status** to "Published" when ready

### Managing Assets

1. Open the Assets database
2. Upload new files or replace existing ones
3. Set appropriate **Usage Context** tags
4. Ensure **Alt Text** is provided for accessibility
5. Set **Status** to "Active" when ready

## Troubleshooting

### Common Issues

#### 1. "Integration not found" Error
**Cause**: Integration token is incorrect or expired
**Solution**: 
- Verify the token in `.env.local`
- Regenerate token if necessary
- Ensure token starts with `secret_`

#### 2. "Database not accessible" Error
**Cause**: Database not shared with integration
**Solution**:
- Open each database in Notion
- Share with your integration
- Ensure "Full access" permissions

#### 3. "Content not loading" Error
**Cause**: Database IDs are incorrect
**Solution**:
- Verify database IDs in `.env.local`
- Ensure IDs are exactly 32 characters
- Copy IDs directly from Notion URLs

#### 4. "Missing properties" Error
**Cause**: Database schema doesn't match expected structure
**Solution**:
- Review database properties against this guide
- Add missing properties
- Ensure property names match exactly

### Debug Commands

Enable debug logging:
```bash
NODE_ENV=development npm run dev
```

Check Notion API connection:
```bash
# This would call a debug endpoint (implementation dependent)
curl http://localhost:3000/api/debug/notion
```

### Validation Errors

The system validates content and will show warnings for:
- Missing required fields
- Invalid data formats
- Accessibility issues (missing alt text)
- Broken links

Check the console logs for detailed validation reports.

## Best Practices

### Content Management

1. **Use Draft Status**: Always create content as "Draft" first, then change to "Published" when ready
2. **Consistent Naming**: Use consistent naming conventions for assets and content
3. **Alt Text**: Always provide descriptive alt text for images
4. **Sort Orders**: Use meaningful sort orders (10, 20, 30) to leave room for insertions
5. **Regular Backups**: Export your databases regularly as CSV backups

### Performance Optimization

1. **Image Optimization**: 
   - Use WebP format when possible
   - Keep images under 1MB
   - Use appropriate dimensions (no larger than needed)

2. **Content Structure**:
   - Keep descriptions concise but informative
   - Use bullet points in multi-select fields appropriately
   - Avoid overly long text content

3. **Caching Strategy**:
   - Enable caching in production (`NOTION_CACHE_ENABLED=true`)
   - Set appropriate TTL values
   - Clear cache when making significant changes

### Security

1. **API Token Security**:
   - Never commit `.env.local` to version control
   - Use different tokens for different environments
   - Regularly rotate tokens

2. **Access Control**:
   - Only give integration access to necessary databases
   - Use "Full access" only when needed
   - Regularly audit integration permissions

3. **Content Review**:
   - Review all content before publishing
   - Validate external links regularly
   - Monitor for outdated information

### SEO Considerations

1. **Meta Content**: Use descriptive and keyword-rich content
2. **Alt Text**: Write descriptive alt text for better accessibility and SEO
3. **URL Structure**: Keep URLs clean and descriptive
4. **Content Updates**: Regularly update content to keep it fresh

## Advanced Configuration

### Custom Properties

You can add custom properties to databases:

1. Open the database
2. Add new property columns
3. Update the TypeScript types in `/src/types/notion.ts`
4. Update transformation functions in `/src/lib/content-transformers.ts`

### Multi-Environment Setup

For staging and production environments:

1. Create separate Notion workspaces/integrations
2. Use different environment variable files
3. Deploy with appropriate configuration

### Analytics Integration

Track content performance:

1. Add analytics properties to databases
2. Update content based on performance metrics
3. A/B test different content variations

## Support

If you encounter issues not covered in this guide:

1. Check the application logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the Notion API connection independently
4. Review the database permissions and sharing settings

For technical support, refer to the development team or create an issue in the project repository.

---

*Last updated: 2025-01-31*
*Version: 1.0*