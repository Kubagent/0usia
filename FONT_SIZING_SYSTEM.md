# Ovsia Font Sizing System

## Overview
This document describes the unified font sizing system implemented across the Ovsia website. The system uses three distinct categories of font sizes to create consistency and hierarchy.

## Three Font Size Categories

### 1. Body Size (Smallest) - `ovsia-body-*`
**Used for:** Content text, body text, sub headers, form labels, descriptions
**Classes Available:**
- `text-ovsia-body-xs` (14px) - Small text, labels
- `text-ovsia-body-sm` (16px) - Standard body text
- `text-ovsia-body-base` (18px) - Medium body text  
- `text-ovsia-body-lg` (20px) - Large body text
- `text-ovsia-body-xl` (22px) - Extra large body text
- `text-ovsia-body-2xl` (24px) - Largest body text

### 2. Header Size (Medium) - `ovsia-header-*`
**Used for:** Section titles, navigation elements, modal headers
**Classes Available:**
- `text-ovsia-header-sm` (30px) - Small headers
- `text-ovsia-header-base` (36px) - Standard headers
- `text-ovsia-header-lg` (40px) - Large headers
- `text-ovsia-header-xl` (48px) - Extra large headers
- `text-ovsia-header-2xl` (56px) - XXL headers
- `text-ovsia-header-3xl` (64px) - Largest headers

### 3. Tagline Size (Largest) - `ovsia-tagline-*`
**Used for:** Main taglines, hero text, "Stay in Ousia", "MAIL" button
**Classes Available:**
- `text-ovsia-tagline-sm` (72px) - Small taglines
- `text-ovsia-tagline-base` (80px) - Standard taglines
- `text-ovsia-tagline-lg` (96px) - Large taglines
- `text-ovsia-tagline-xl` (112px) - Extra large taglines
- `text-ovsia-tagline-2xl` (128px) - XXL taglines
- `text-ovsia-tagline-3xl` (160px) - 3XL taglines
- `text-ovsia-tagline-4xl` (192px) - 4XL taglines
- `text-ovsia-tagline-5xl` (224px) - 5XL taglines
- `text-ovsia-tagline-6xl` (256px) - Largest taglines

## Implementation Details

### Updated Components

1. **Page Client (Tagline Section)**
   - "Your [Rotating Word] Actualized" uses tagline sizing with responsive breakpoints

2. **Expertise Showcase**
   - Section title uses header sizing
   - Expertise item names use body sizing
   - Descriptions and details use body sizing

3. **Ventures Carousel**
   - Section title uses header sizing
   - Venture names use body sizing
   - Taglines use body sizing
   - Removed "click to learn more" text entirely

4. **Three Card CTA**
   - Section title uses header sizing
   - Card titles use body sizing
   - Card descriptions use body sizing
   - Form elements use body sizing

5. **Footer**
   - "Stay in Ousia" uses tagline sizing
   - "Berlin:" time uses header sizing
   - "MAIL" button uses tagline sizing
   - Copyright/privacy/terms remain unchanged

## Responsive Behavior

All font sizes maintain proper responsive scaling using Tailwind's breakpoint system:
- `sm:` (640px+)
- `md:` (768px+) 
- `lg:` (1024px+)
- `xl:` (1280px+)
- `2xl:` (1536px+)
- `3xl:` (1600px+ custom)

## Benefits

1. **Consistency** - All text follows the same sizing hierarchy
2. **Maintainability** - Easy to update sizes globally by modifying Tailwind config
3. **Semantic** - Clear purpose for each size category
4. **Scalability** - Easy to add new components using the established system
5. **Accessibility** - Proper font sizing relationships maintained across devices

## Usage Guidelines

- Use body sizes for all content and descriptive text
- Use header sizes for section titles and important headings
- Use tagline sizes sparingly for main hero elements and key brand messaging
- Always include responsive breakpoints for optimal mobile experience
- Maintain consistent line heights using the predefined values